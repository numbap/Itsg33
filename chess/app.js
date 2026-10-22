// Puzzle UI: renders the board, takes moves by click, drag or keyboard, and
// answers with the toughest defence until the puzzle is solved.

import { Position, sqName, colorOf } from "./engine.js";
import { generatePuzzle, rng, defenderLoses, bestDefence, winningMoves, solutionLine } from "./puzzles.js";

const GLYPH = { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" };
const NAME = { k: "king", q: "queen", r: "rook", b: "bishop", n: "knight", p: "pawn" };
const COLOUR = { w: "White", b: "Black" };
const BUDGET = { 1: 40, 2: 15, 3: 2 }; // positions tried per animation frame
const STATS_KEY = "chess-puzzles-stats";
const $ = (id) => document.getElementById(id);

const state = {
  puzzle: null,      // { fen, mateIn, seed }
  pos: null,
  solver: "w",
  left: 0,           // solver moves still needed to mate
  phase: "idle",     // loading | play | opponent | wrong | solved | shown
  selected: -1,
  targets: [],
  hint: [],
  hintLevel: 0,
  clean: true,       // no mistakes, hints or solution on this puzzle
  counted: false,    // this puzzle already added to the solved count
  moves: [],         // { san, mine }
  flipped: false,
  focus: 0,
  gen: 0,
  timers: [],
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

function renderPanel() {
  const { puzzle, phase } = state;
  const task = $("task");
  task.replaceChildren();
  if (puzzle) {
    const dot = document.createElement("span");
    dot.className = `turn-dot ${state.solver}`;
    dot.setAttribute("aria-hidden", "true");
    task.append(dot, `${COLOUR[state.solver]} to move: mate in ${puzzle.mateIn}`);
  } else task.textContent = "Generating puzzle…";

  const list = $("moves");
  list.replaceChildren();
  // Number full moves; when Black solves, the first move is shown as "1… move".
  const tokens = state.solver === "b" && state.moves.length ? [{ san: "…", mine: false }, ...state.moves] : state.moves;
  for (let i = 0; i < tokens.length; i += 2) {
    const li = document.createElement("li");
    for (const mv of tokens.slice(i, i + 2)) li.append(cell(mv.san, mv.mine));
    list.append(li);
  }

  const playing = phase === "play";
  $("hint").disabled = !playing;
  $("solution").disabled = !(playing || phase === "wrong");
  $("retry").disabled = !puzzle || phase === "loading";
  $("flip").disabled = !puzzle;
  $("solved").textContent = state.stats.solved;
  $("streak").textContent = state.stats.streak;
  $("best").textContent = state.stats.best;
  if (puzzle) {
    $("fen").textContent = puzzle.fen;
    $("permalink").href = `#m${puzzle.mateIn}-${puzzle.seed}`;
  }
}

function cell(text, mine) {
  const span = document.createElement("span");
  span.className = "m" + (mine ? "" : " opp");
  span.textContent = text;
  return span;
}

function setStatus(text, tone = "") {
  const st = $("status");
  st.textContent = text;
  st.className = "status " + tone;
  st.parentElement.className = "status-card " + tone;
}

// --- Puzzle flow ---------------------------------------------------------------

const later = (fn, ms) => state.timers.push(setTimeout(fn, ms));
function clearTimers() { state.timers.forEach(clearTimeout); state.timers = []; }

function clearSelection() { state.selected = -1; state.targets = []; }

async function newPuzzle(mateIn, seed = Math.floor(Math.random() * 2 ** 31)) {
  const token = ++state.gen;
  clearTimers();
  clearSelection();
  Object.assign(state, { puzzle: null, pos: null, phase: "loading", moves: [], hint: [], clean: true, counted: false });
  setStatus(`Searching for a mate in ${mateIn}…`);
  render();
  const random = rng(seed);
  let found = null;
  while (!found) {
    found = generatePuzzle(mateIn, random, BUDGET[mateIn]);
    // Yield so the page stays responsive; give up if a newer request started.
    if (!found) await new Promise((r) => requestAnimationFrame(() => r()));
    if (token !== state.gen) return;
  }
  state.puzzle = { ...found, seed };
  const hash = `#m${mateIn}-${seed}`;
  if (location.hash !== hash) history.replaceState(null, "", hash);
  start();
}

function start() {
  clearTimers();
  clearSelection();
  const pos = new Position(state.puzzle.fen);
  Object.assign(state, {
    pos, solver: pos.turn, left: state.puzzle.mateIn, phase: "play", moves: [], hint: [], hintLevel: 0,
  });
  setStatus("Find the move that forces mate.");
  render();
}

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
  const { pos } = state;
  clearSelection();
  state.hint = [];
  const san = pos.san(m);
  pos.make(m);
  state.moves.push({ san, mine: true });
  state.focus = m.to;

  if (pos.isCheckmate()) return solved();
  if (state.left > 1 && defenderLoses(pos, state.left)) {
    state.left--;
    state.phase = "opponent";
    setStatus(`${san} is right. Waiting for the reply…`, "ok");
    render();
    later(reply, 550);
    return;
  }
  wrong(san);
}

function reply() {
  const { pos } = state;
  const r = bestDefence(pos, state.left + 1);
  const san = pos.san(r);
  pos.make(r);
  state.moves.push({ san, mine: false });
  state.phase = "play";
  state.hintLevel = 0;
  setStatus(`${COLOUR[colorOf(r.piece)]} played ${san}. ${state.left === 1 ? "Mate in 1 now." : `Mate in ${state.left} to go.`}`);
  render();
}

function wrong(san) {
  const { pos } = state;
  const why = pos.isStalemate() ? "is stalemate" : "doesn't force mate";
  state.phase = "wrong";
  breakStreak();
  setStatus(`${san} ${why}. Try again.`, "bad");
  board.classList.remove("wrong");
  void board.offsetWidth; // restart the shake animation
  board.classList.add("wrong");
  render();
  later(() => {
    pos.undo();
    state.moves.pop();
    state.phase = "play";
    render();
  }, 1000);
}

function solved() {
  state.phase = "solved";
  const { stats } = state;
  if (!state.counted) stats.solved++;
  if (state.clean && !state.counted) {
    stats.streak++;
    stats.best = Math.max(stats.best, stats.streak);
  }
  state.counted = true;
  saveStats();
  setStatus(state.clean ? "Checkmate! Solved." : "Checkmate! Solved, with help along the way.", "ok");
  render();
}

function breakStreak() {
  state.clean = false;
  state.stats.streak = 0;
  saveStats();
}

function hint() {
  if (state.phase !== "play") return;
  const [m] = winningMoves(state.pos, state.left, 1);
  if (!m) return;
  breakStreak();
  state.hintLevel = Math.min(state.hintLevel + 1, 2);
  state.hint = state.hintLevel === 1 ? [m.from] : [m.from, m.to];
  const p = state.pos.board[m.from];
  setStatus(state.hintLevel === 1
    ? `Hint: move the ${NAME[p.toLowerCase()]} on ${sqName(m.from)}.`
    : `Hint: ${NAME[p.toLowerCase()]} from ${sqName(m.from)} to ${sqName(m.to)}.`);
  render();
}

function showSolution() {
  if (state.phase === "wrong") {
    clearTimers();
    state.pos.undo();
    state.moves.pop();
  } else if (state.phase !== "play") return;
  breakStreak();
  clearSelection();
  state.hint = [];
  state.phase = "shown";
  const line = solutionLine(state.pos.fen(), state.left);
  setStatus("Solution:");
  render();
  line.forEach((m, i) => later(() => {
    const san = state.pos.san(m);
    state.pos.make(m);
    state.moves.push({ san, mine: i % 2 === 0 });
    setStatus(i === line.length - 1 ? "Solution shown. Press Retry to play it yourself, or New puzzle." : "Solution:");
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

const mateIn = () => Number(document.querySelector('input[name="mate"]:checked').value);
$("new").addEventListener("click", () => newPuzzle(mateIn()));
document.querySelectorAll('input[name="mate"]').forEach((r) => r.addEventListener("change", () => newPuzzle(mateIn())));
$("hint").addEventListener("click", hint);
$("solution").addEventListener("click", showSolution);
$("retry").addEventListener("click", () => { if (state.puzzle) start(); });
$("flip").addEventListener("click", () => { state.flipped = !state.flipped; render(); });

function fromHash() {
  const m = /^#m([123])-(\d{1,10})$/.exec(location.hash);
  if (!m) return false;
  if (state.puzzle && `#m${state.puzzle.mateIn}-${state.puzzle.seed}` === location.hash) return true;
  document.querySelector(`input[name="mate"][value="${m[1]}"]`).checked = true;
  newPuzzle(Number(m[1]), Number(m[2]));
  return true;
}
window.addEventListener("hashchange", fromHash);
if (!fromHash()) newPuzzle(mateIn());
