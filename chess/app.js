// Puzzle UI: renders the board, takes moves by click, drag or keyboard, and
// plays the opponent until the puzzle is solved.

import { Position, sqName, colorOf, sameMove } from "./engine.js";
import { generatePuzzle, rng, defenderLoses, bestDefence, winningMoves, solutionLine } from "./puzzles.js";
import { SETTINGS, judgeMove, gainBanked, reply, fromUci } from "./tactics.js";
import { evaluate, bestMove } from "./search.js";
import { TRAPS, trapLine } from "./traps.js";
import { BANK } from "./bank.js";

const GLYPH = { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" };
const NAME = { k: "king", q: "queen", r: "rook", b: "bishop", n: "knight", p: "pawn" };
const COLOUR = { w: "White", b: "Black" };
const TYPES = {
  m: { levels: ["Mate in 1", "Mate in 2", "Mate in 3"] },
  w: { kind: "win", levels: ["Easy", "Medium", "Hard"] },
  b: { kind: "best", levels: ["Easy", "Medium", "Hard"] },
  t: { levels: ["Opening traps", "Poisoned bait"] },
};
const THEME_HINT = {
  Fork: "look for a fork", Pin: "look for a pin", Skewer: "look for a skewer",
  "Discovered attack": "look for a discovered attack", Sacrifice: "a sacrifice works here", Check: "start with a check",
};
const BUDGET = { 1: 40, 2: 15, 3: 2 }; // mate positions tried per animation frame
const STATS_KEY = "chess-puzzles-stats";
const $ = (id) => document.getElementById(id);

const state = {
  puzzle: null,      // see load(): type, level, id, fen, line, ...
  pos: null,
  solver: "w",
  base: 0,           // material balance at the start, solver's view (tactics)
  left: 0,           // mate puzzles: solver moves still needed to mate
  ply: 0,            // moves played since the puzzle started
  offLine: false,    // the solver chose a different but equally good move
  phase: "idle",     // loading | intro | play | thinking | opponent | wrong | solved | shown | promoting
  selected: -1,
  targets: [],
  hint: [],
  hintLevel: 0,
  clean: true,       // no mistakes, hints or solution on this puzzle
  counted: false,    // this puzzle already added to the solved count
  moves: [],         // { san, by: "me" | "opp" | "intro" }
  flipped: false,
  focus: 0,
  gen: 0,
  timers: [],
  decks: {},
  stats: loadStats(),
};

// --- Persistence (per-viewer convenience only) ----------------------------

function loadStats() {
  try {
    const s = JSON.parse(localStorage.getItem(STATS_KEY));
    if (s && typeof s.solved === "number") return s;
  } catch { /* storage unavailable */ }
  return { solved: 0, streak: 0, best: 0 };
}
function saveStats() {
  try { localStorage.setItem(STATS_KEY, JSON.stringify(state.stats)); } catch { /* storage unavailable */ }
}

// --- Board -------------------------------------------------------------------

const board = $("board");
const squares = [];
for (let i = 0; i < 64; i++) {
  const el = document.createElement("button");
  el.type = "button";
  el.className = "sq";
  board.append(el);
  squares.push(el);
}

const bottom = () => (state.flipped ? (state.solver === "w" ? "b" : "w") : state.solver);
// Square shown at visual index i (0 = top-left).
const squareAt = (i) => {
  const row = i >> 3, col = i & 7;
  return bottom() === "w" ? (7 - row) * 8 + col : row * 8 + (7 - col);
};
const visualIndex = (s) => squares.findIndex((_, i) => squareAt(i) === s);

function pieceSpan(p) {
  const span = document.createElement("span");
  span.className = `piece ${colorOf(p)}`;
  span.textContent = GLYPH[p.toLowerCase()] + "︎";
  span.setAttribute("aria-hidden", "true");
  return span;
}

function render() {
  const { pos } = state;
  const last = pos?.history.at(-1)?.m;
  const checked = pos && pos.inCheck() ? pos.kings[pos.turn] : -1;
  squares.forEach((el, i) => {
    const s = squareAt(i), p = pos?.board[s];
    const isTarget = state.targets.includes(s);
    el.dataset.sq = s;
    el.className = "sq " + (((s >> 3) + (s & 7)) % 2 ? "light" : "dark");
    el.classList.toggle("last", !!last && (last.from === s || last.to === s));
    el.classList.toggle("selected", state.selected === s);
    el.classList.toggle("target", isTarget);
    el.classList.toggle("occupied", isTarget && !!p);
    el.classList.toggle("hint", state.hint.includes(s));
    el.classList.toggle("check", checked === s);
    el.replaceChildren();
    if (p) el.append(pieceSpan(p));
    if ((i & 7) === 0) el.append(coord("rank", String((s >> 3) + 1)));
    if (i >> 3 === 7) el.append(coord("file", "abcdefgh"[s & 7]));
    el.tabIndex = s === state.focus ? 0 : -1;
    el.setAttribute("aria-label", `${sqName(s)}, ${p ? `${COLOUR[colorOf(p)]} ${NAME[p.toLowerCase()]}` : "empty"}` +
      (state.selected === s ? ", selected" : "") + (isTarget ? ", legal move" : "") + (state.hint.includes(s) ? ", hint" : ""));
    el.setAttribute("aria-pressed", String(state.selected === s));
  });
  renderPanel();
}

function coord(kind, text) {
  const c = document.createElement("span");
  c.className = `coord ${kind}`;
  c.textContent = text;
  c.setAttribute("aria-hidden", "true");
  return c;
}

function taskText(p) {
  const c = COLOUR[state.solver];
  if (p.type === "m") return `${c} to move: mate in ${p.level}`;
  if (p.type === "w") return `${c} to move: win material`;
  if (p.type === "b") return `${c} to move: find the best move`;
  return p.trap ? `${c} to move: ${p.trap.name}` : `${c} to move: avoid the bait`;
}

function renderPanel() {
  const { puzzle, phase } = state;
  const task = $("task");
  task.replaceChildren();
  if (puzzle) {
    const dot = document.createElement("span");
    dot.className = `turn-dot ${state.solver}`;
    dot.setAttribute("aria-hidden", "true");
    task.append(dot, taskText(puzzle));
  } else task.textContent = "Preparing a puzzle…";

  const list = $("moves");
  list.replaceChildren();
  // Number full moves; a list that starts with a Black move opens with "1… move".
  const tokens = state.solver === "b" && !puzzle?.trap && state.moves.length ? [{ san: "…", by: "opp" }, ...state.moves] : state.moves;
  for (let i = 0; i < tokens.length; i += 2) {
    const li = document.createElement("li");
    for (const mv of tokens.slice(i, i + 2)) li.append(cell(mv));
    list.append(li);
  }

  const playing = phase === "play";
  $("hint").disabled = !playing;
  $("solution").disabled = !(playing || phase === "wrong");
  $("retry").disabled = !puzzle || ["loading", "intro", "thinking", "promoting"].includes(phase);
  $("flip").disabled = !puzzle;
  $("solved").textContent = state.stats.solved;
  $("streak").textContent = state.stats.streak;
  $("best").textContent = state.stats.best;
  if (puzzle) {
    $("fen").textContent = puzzle.fen;
    $("permalink").href = hashOf(puzzle);
  }
}

function cell(mv) {
  const span = document.createElement("span");
  span.className = "m" + (mv.by === "me" ? "" : ` ${mv.by}`);
  span.textContent = mv.san;
  return span;
}

function setStatus(text, tone = "") {
  const st = $("status");
  st.textContent = text;
  st.className = "status " + tone;
  st.parentElement.className = "status-card " + tone;
}

function setIdea(text) {
  $("idea").textContent = text || "";
  $("idea").hidden = !text;
}

// --- Loading puzzles -------------------------------------------------------------

const later = (fn, ms) => state.timers.push(setTimeout(fn, ms));
function clearTimers() { state.timers.forEach(clearTimeout); state.timers = []; }
function clearSelection() { state.selected = -1; state.targets = []; }

const hashOf = (p) => `#${p.type}${p.level}-${p.id}`;
const bankKey = (type, level) => (type === "t" ? "bait1" : `${TYPES[type].kind}${level}`);
const poolSize = (type, level) => (type === "t" && level === 1 ? TRAPS.length : BANK[bankKey(type, level)]?.length ?? 0);

// Bank puzzles are dealt from a shuffled deck so they do not repeat until all have been seen.
function nextId(type, level) {
  if (type === "m") return Math.floor(Math.random() * 2 ** 31);
  const key = type + level;
  if (!state.decks[key]?.length) {
    const deck = [...Array(poolSize(type, level)).keys()];
    for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
    state.decks[key] = deck;
  }
  return state.decks[key].pop();
}

// Replays UCI moves from fen and returns them as move objects.
function uciLine(fen, ucis) {
  const pos = new Position(fen), line = [];
  for (const u of ucis) {
    const m = fromUci(pos, u);
    if (!m) break;
    line.push(m);
    pos.make(m);
  }
  return line;
}

async function load(type, level, id = nextId(type, level)) {
  const token = ++state.gen;
  clearTimers();
  clearSelection();
  Object.assign(state, { puzzle: null, pos: null, phase: "loading", moves: [], hint: [], clean: true, counted: false });
  setIdea("");
  let puzzle;
  if (type === "m") {
    setStatus(`Searching for a mate in ${level}…`);
    render();
    const random = rng(id);
    let found = null;
    while (!found) {
      found = generatePuzzle(level, random, BUDGET[level]);
      // Yield so the page stays responsive; give up if a newer request started.
      if (!found) await new Promise((r) => requestAnimationFrame(() => r()));
      if (token !== state.gen) return;
    }
    puzzle = { type, level, id, fen: found.fen };
  } else if (type === "t" && level === 1) {
    const trap = TRAPS[id % TRAPS.length];
    const full = trapLine(trap), pos = new Position();
    full.slice(0, trap.start).forEach((m) => pos.make(m));
    puzzle = { type, level, id, trap, fen: pos.fen(), intro: full.slice(0, trap.start), line: full.slice(trap.start) };
  } else {
    const list = BANK[bankKey(type, level)];
    const [fen, ucis, theme, baitUci] = list[id % list.length];
    const kind = type === "t" ? "bait" : TYPES[type].kind;
    const start = new Position(fen);
    const bait = baitUci ? fromUci(start, baitUci) : null;
    puzzle = {
      type, level, id, fen, kind, engineLevel: type === "t" ? 1 : level, theme,
      line: uciLine(fen, ucis.split(" ")), bait, baitSan: bait ? start.san(bait) : "",
    };
  }
  state.puzzle = puzzle;
  if (location.hash !== hashOf(puzzle)) history.replaceState(null, "", hashOf(puzzle));
  start(true);
}

// (Re)start the current puzzle. Opening traps replay their opening first.
function start(animate = false) {
  clearTimers();
  clearSelection();
  const p = state.puzzle;
  state.solver = new Position(p.fen).turn;
  Object.assign(state, { ply: 0, offLine: false, left: p.type === "m" ? p.level : 0, moves: [], hint: [], hintLevel: 0 });
  if (state.phase === "solved" || state.phase === "shown") state.clean = false;
  setIdea("");
  if (p.intro) {
    state.pos = new Position();
    const step = (m) => {
      const san = state.pos.san(m);
      state.pos.make(m);
      state.moves.push({ san, by: "intro" });
    };
    if (animate) {
      state.phase = "intro";
      setStatus(`${p.trap.opening}…`);
      render();
      p.intro.forEach((m, i) => later(() => { step(m); render(); }, 250 + i * 320));
      later(begin, 250 + p.intro.length * 320 + 150);
      return;
    }
    p.intro.forEach(step);
  } else state.pos = new Position(p.fen);
  begin();
}

function begin() {
  const p = state.puzzle;
  state.base = evaluate(state.pos);
  state.phase = "play";
  if (p.type === "m") setStatus("Find the move that forces mate.");
  else if (p.type === "w") setStatus("Find the move that wins material.");
  else if (p.type === "b") setStatus("Your opponent threatens something. Find the only move that holds.");
  else if (p.trap) setStatus(`${COLOUR[state.solver === "w" ? "b" : "w"]} just played ${state.moves.at(-1).san}. Punish it.`);
  else setStatus("A piece looks free, but one capture here is poisoned. Find the best move.");
  render();
}

// --- Moves ---------------------------------------------------------------------

function legal() { return state.phase === "play" ? state.pos.legalMoves() : []; }

function select(s) {
  state.selected = s;
  state.targets = [...new Set(legal().filter((m) => m.from === s).map((m) => m.to))];
}

function attempt(from, to) {
  const options = legal().filter((m) => m.from === from && m.to === to);
  if (!options.length) return false;
  if (options.length > 1) askPromotion(options);
  else play(options[0]);
  return true;
}

function play(m) {
  clearSelection();
  state.hint = [];
  const san = state.pos.san(m);
  if (state.puzzle.type === "m") playMate(m, san);
  else playLine(m, san);
}

function playMate(m, san) {
  const { pos } = state;
  pos.make(m);
  state.moves.push({ san, by: "me" });
  state.focus = m.to;
  if (pos.isCheckmate()) return solved();
  if (state.left > 1 && defenderLoses(pos, state.left)) {
    state.left--;
    state.phase = "opponent";
    setStatus(`${san} is right. Waiting for the reply…`, "ok");
    render();
    later(() => {
      const r = bestDefence(pos, state.left + 1);
      opponentMoves(r, state.left === 1 ? "Mate in 1 now." : `Mate in ${state.left} to go.`);
    }, 550);
    return;
  }
  wrong(m, san, false);
}

// Tactics and traps: follow the stored line; a different move is checked by search.
function playLine(m, san) {
  const p = state.puzzle, { pos } = state;
  const expected = state.offLine ? null : p.line[state.ply];
  if (expected && sameMove(m, expected)) return accept(m, san);
  pos.make(m);
  const mate = pos.isCheckmate();
  pos.undo();
  if (mate) return accept(m, san);
  if (p.trap) { pos.make(m); state.moves.push({ san, by: "me" }); return wrong(m, san, false); }
  state.phase = "thinking";
  setStatus(`Checking ${san}…`);
  render();
  later(() => {
    const { ok } = judgeMove(pos, m, p.kind, p.engineLevel, state.base);
    if (ok) { state.offLine = true; accept(m, san); return; }
    pos.make(m);
    state.moves.push({ san, by: "me" });
    wrong(m, san, true);
  }, 30);
}

function accept(m, san) {
  const p = state.puzzle, { pos } = state;
  pos.make(m);
  state.moves.push({ san, by: "me" });
  state.ply++;
  state.focus = m.to;
  const oneMove = p.type === "b" || (p.type === "t" && !p.trap);
  if (pos.isCheckmate() || oneMove) return solved();
  if (p.type === "w" && (gainBanked(pos, state.base) || state.ply >= 9)) return solved();
  if (p.trap && state.ply >= p.line.length) return solved();
  if (!pos.hasLegalMove()) return solved();
  state.phase = "opponent";
  setStatus(`${san} is right. Waiting for the reply…`, "ok");
  render();
  later(() => {
    let r = state.offLine ? null : p.line[state.ply];
    if (!r || !pos.legalMoves().some((x) => sameMove(x, r))) {
      r = reply(pos, p.kind, p.engineLevel);
      state.offLine = true;
    }
    state.ply++;
    opponentMoves(r, "Keep going.");
  }, 550);
}

function opponentMoves(r, next) {
  const { pos } = state;
  const san = pos.san(r);
  pos.make(r);
  state.moves.push({ san, by: "opp" });
  state.phase = "play";
  state.hintLevel = 0;
  setStatus(`${COLOUR[colorOf(r.piece)]} played ${san}. ${next}`);
  render();
}

// The wrong move is on the board. Optionally show the refutation, then take it all back.
function wrong(m, san, refute) {
  const p = state.puzzle, { pos } = state;
  const isBait = p.bait && sameMove(m, p.bait);
  const why = pos.isStalemate() ? `${san} is stalemate.` : isBait ? `${san} takes the bait.` :
    p.type === "m" ? `${san} doesn't force mate.` : p.trap ? `${san} lets the opponent off the hook.` : `${san} isn't the best move.`;
  state.phase = "wrong";
  breakStreak();
  setStatus(`${why} Try again.`, "bad");
  board.classList.remove("wrong");
  void board.offsetWidth; // restart the shake animation
  board.classList.add("wrong");
  render();
  if (refute && pos.hasLegalMove()) {
    later(() => {
      const r = reply(pos, p.kind, p.engineLevel);
      const rsan = pos.san(r);
      pos.make(r);
      state.moves.push({ san: rsan, by: "opp" });
      setStatus(`${why} ${COLOUR[colorOf(r.piece)]} answers ${rsan}. Try again.`, "bad");
      render();
      later(() => takeBack(2), 1900);
    }, 500);
  } else later(() => takeBack(1), 1000);
}

function takeBack(n) {
  for (let i = 0; i < n; i++) { state.pos.undo(); state.moves.pop(); }
  state.phase = "play";
  render();
}

function solved() {
  const p = state.puzzle, { stats } = state;
  state.phase = "solved";
  if (!state.counted) stats.solved++;
  if (state.clean && !state.counted) {
    stats.streak++;
    stats.best = Math.max(stats.best, stats.streak);
  }
  state.counted = true;
  saveStats();
  const mate = state.pos.isCheckmate();
  const head = mate ? "Checkmate!" : p.type === "w" ? "Material won!" : p.trap ? "Trap sprung!" : "Best move!";
  setStatus(state.clean ? `${head} Solved.` : `${head} Solved, with help along the way.`, "ok");
  explain();
  render();
}

function explain() {
  const p = state.puzzle;
  if (p.trap) setIdea(`${p.trap.name} (${p.trap.opening}). ${p.trap.idea}`);
  else if (p.bait) setIdea(`The bait was ${p.baitSan}: the piece looked free, but taking it loses. Theme of the right move: ${p.theme}.`);
  else if (p.theme) setIdea(`Theme: ${p.theme}.`);
}

function breakStreak() {
  state.clean = false;
  state.stats.streak = 0;
  saveStats();
}

function hint() {
  if (state.phase !== "play") return;
  const p = state.puzzle, { pos } = state;
  let m;
  if (p.type === "m") [m] = winningMoves(pos, state.left, 1);
  else if (!state.offLine) m = p.line[state.ply];
  else m = bestMove(pos, SETTINGS[p.kind][p.engineLevel].depth).move;
  if (!m) return;
  breakStreak();
  // Tactics get the idea first, then the piece, then the move.
  const themeHint = state.ply === 0 && THEME_HINT[p.theme];
  const steps = themeHint ? 3 : 2;
  state.hintLevel = Math.min(state.hintLevel + 1, steps);
  const level = state.hintLevel - (steps - 2);
  const piece = NAME[pos.board[m.from].toLowerCase()];
  if (level <= 0) { state.hint = []; setStatus(`Hint: ${themeHint}.`); }
  else if (level === 1) { state.hint = [m.from]; setStatus(`Hint: move the ${piece} on ${sqName(m.from)}.`); }
  else { state.hint = [m.from, m.to]; setStatus(`Hint: ${piece} from ${sqName(m.from)} to ${sqName(m.to)}.`); }
  render();
}

// Restart the puzzle and play the main line move by move.
function showSolution() {
  if (state.phase !== "play" && state.phase !== "wrong") return;
  const p = state.puzzle;
  breakStreak();
  start(false);
  state.phase = "shown";
  const line = p.type === "m" ? solutionLine(p.fen, p.level) : p.line;
  setStatus("Solution:");
  render();
  line.forEach((m, i) => later(() => {
    const san = state.pos.san(m);
    state.pos.make(m);
    state.moves.push({ san, by: i % 2 === 0 ? "me" : "opp" });
    if (i === line.length - 1) {
      setStatus("Solution shown. Press Retry to play it yourself, or New puzzle.");
      explain();
    }
    render();
  }, 300 + i * 750));
}

// --- Promotion -------------------------------------------------------------------

const promo = $("promo");
function askPromotion(options) {
  state.phase = "promoting";
  promo.replaceChildren();
  const row = document.createElement("div");
  row.className = "promo-row";
  for (const m of options) {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", `Promote to ${NAME[m.promo.toLowerCase()]}`);
    b.append(pieceSpan(m.promo));
    b.addEventListener("click", () => { closePromotion(); play(m); });
    row.append(b);
  }
  promo.append(row);
  promo.hidden = false;
  row.firstChild.focus();
}
function closePromotion() {
  promo.hidden = true;
  state.phase = "play";
}
promo.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { closePromotion(); render(); squares[visualIndex(state.focus)]?.focus(); }
});

// --- Input: click, drag, keyboard ------------------------------------------------

function activate(s) {
  if (state.phase !== "play") return;
  const p = state.pos.board[s];
  if (state.selected >= 0 && state.targets.includes(s)) { attempt(state.selected, s); return; }
  if (p && colorOf(p) === state.solver && state.selected !== s) select(s);
  else clearSelection();
  render();
}

let drag = null, ghost = null;
const squareFromEvent = (e) => {
  const el = document.elementFromPoint(e.clientX, e.clientY)?.closest(".sq");
  return el && board.contains(el) ? Number(el.dataset.sq) : -1;
};

board.addEventListener("pointerdown", (e) => {
  const el = e.target.closest(".sq");
  if (!el || state.phase !== "play" || e.button > 0) return;
  const s = Number(el.dataset.sq);
  state.focus = s;
  if (state.selected >= 0 && state.targets.includes(s)) { attempt(state.selected, s); return; }
  const p = state.pos.board[s];
  if (p && colorOf(p) === state.solver) {
    const wasSelected = state.selected === s;
    select(s);
    drag = { from: s, x: e.clientX, y: e.clientY, moved: false, wasSelected, size: el.getBoundingClientRect().width };
    board.setPointerCapture(e.pointerId);
    e.preventDefault();
    el.focus();
  } else clearSelection();
  render();
});

board.addEventListener("pointermove", (e) => {
  if (!drag) return;
  if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 5) return;
  if (!drag.moved) {
    drag.moved = true;
    ghost = document.createElement("div");
    ghost.className = "drag-ghost";
    ghost.append(pieceSpan(state.pos.board[drag.from]));
    ghost.firstChild.style.fontSize = `${drag.size * 0.84}px`;
    document.body.append(ghost);
    squares[visualIndex(drag.from)].classList.add("dragging");
  }
  ghost.style.transform = `translate(${e.clientX - drag.size * 0.42}px, ${e.clientY - drag.size * 0.55}px)`;
});

function endDrag(e, cancelled) {
  if (!drag) return;
  const d = drag;
  drag = null;
  ghost?.remove();
  ghost = null;
  squares[visualIndex(d.from)]?.classList.remove("dragging");
  if (cancelled) { render(); return; }
  if (d.moved) {
    const to = squareFromEvent(e);
    if (to >= 0 && to !== d.from && attempt(d.from, to)) return;
  } else if (d.wasSelected) clearSelection();
  render();
}
board.addEventListener("pointerup", (e) => endDrag(e, false));
board.addEventListener("pointercancel", (e) => endDrag(e, true));

// Keyboard: buttons fire click with detail 0; pointer clicks are handled above.
board.addEventListener("click", (e) => {
  const el = e.target.closest(".sq");
  if (el && e.detail === 0) activate(Number(el.dataset.sq));
});
board.addEventListener("keydown", (e) => {
  const moves = { ArrowUp: -8, ArrowDown: 8, ArrowLeft: -1, ArrowRight: 1 };
  if (!(e.key in moves)) return;
  e.preventDefault();
  const i = visualIndex(state.focus), d = moves[e.key];
  const j = i + d;
  if (j < 0 || j > 63 || (Math.abs(d) === 1 && (j >> 3) !== (i >> 3))) return;
  state.focus = squareAt(j);
  render();
  squares[j].focus();
});
board.addEventListener("focusin", (e) => {
  const el = e.target.closest(".sq");
  if (el) state.focus = Number(el.dataset.sq);
});

// --- Controls ----------------------------------------------------------------

const chosen = (name) => document.querySelector(`input[name="${name}"]:checked`).value;
const levelInputs = [...document.querySelectorAll('input[name="level"]')];

// Relabel the level choices for the selected puzzle type.
function showLevels(type, level) {
  const labels = TYPES[type].levels;
  levelInputs.forEach((input, i) => {
    input.parentElement.hidden = i >= labels.length;
    input.nextElementSibling.textContent = labels[i] ?? "";
    input.checked = i + 1 === level;
  });
}

function newFromControls() { load(chosen("type"), Number(chosen("level"))); }

document.querySelectorAll('input[name="type"]').forEach((r) => r.addEventListener("change", () => {
  showLevels(r.value, r.value === "m" ? 2 : 1);
  newFromControls();
}));
levelInputs.forEach((r) => r.addEventListener("change", newFromControls));
$("new").addEventListener("click", newFromControls);
$("hint").addEventListener("click", hint);
$("solution").addEventListener("click", showSolution);
$("retry").addEventListener("click", () => { if (state.puzzle) start(false); });
$("flip").addEventListener("click", () => { state.flipped = !state.flipped; render(); });

function fromHash() {
  const m = /^#([mwbt])([123])-(\d{1,10})$/.exec(location.hash);
  if (!m) return false;
  const [, type, lv, id] = m, level = Number(lv);
  if (level > TYPES[type].levels.length) return false;
  if (state.puzzle && hashOf(state.puzzle) === location.hash) return true;
  document.querySelector(`input[name="type"][value="${type}"]`).checked = true;
  showLevels(type, level);
  load(type, level, Number(id));
  return true;
}
window.addEventListener("hashchange", fromHash);
if (!fromHash()) { showLevels("m", 2); newFromControls(); }
