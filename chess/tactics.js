// Tactical puzzles: win material, find the best (only) move, and avoid the bait.
// Positions are random middlegames; a search decides whether they make a fair puzzle.

import { Position, colorOf, sqName } from "./engine.js";
import { VALUE, MATE, isMateScore, evaluate, quiesce, scoreMove, scoresAtLeast, bestMove, threat } from "./search.js";
import { pick, weighted, boardFen, flipColours } from "./puzzles.js";

// Search depth and acceptance rules for each kind and level.
export const SETTINGS = {
  win:  { 1: { depth: 3, quietStart: false }, 2: { depth: 3, quietStart: true }, 3: { depth: 5, quietStart: true, deep: true } },
  best: { 1: { depth: 2 }, 2: { depth: 3 }, 3: { depth: 4 } },
  bait: { 1: { depth: 4 } },
};
const GAIN = 200;      // "winning material" means at least two pawns
const MARGIN = 60;     // moves within this of the best count as equally good

// --- Random middlegame ---------------------------------------------------------

function randomMiddlegame(random) {
  const board = new Array(64).fill(null);
  const rand = (n) => Math.floor(random() * n);
  const place = (p, ok) => {
    for (let i = 0; i < 100; i++) { const s = rand(64); if (!board[s] && ok(s)) { board[s] = p; return s; } }
    return -1;
  };
  const rank = (s) => s >> 3;

  // Kings, usually castled, each behind a few pawns.
  const kingFile = () => pick(random, [6, 6, 6, 6, 2, 2, 4, 7, 1]);
  const wk = kingFile() + (random() < 0.85 ? 0 : 8);
  const bk = 56 + kingFile() - (random() < 0.85 ? 0 : 8);
  board[wk] = "K"; board[bk] = "k";
  for (const [k, P, dir] of [[wk, "P", 8], [bk, "p", -8]]) {
    for (const df of [-1, 0, 1]) {
      const f = (k & 7) + df;
      if (f < 0 || f > 7 || random() < 0.2) continue;
      const s = k + dir + df + (random() < 0.2 ? dir : 0);
      if (s >= 8 && s < 56 && !board[s]) board[s] = P;
    }
  }
  // More pawns towards the centre.
  for (let i = 0, n = 2 + rand(3); i < n; i++) place("P", (s) => rank(s) >= 1 && rank(s) <= 4);
  for (let i = 0, n = 2 + rand(3); i < n; i++) place("p", (s) => rank(s) >= 3 && rank(s) <= 6);

  // Pieces: the same set on both sides most of the time, otherwise one minor swapped or missing.
  const pool = ["Q", "R", "R", "B", "B", "N", "N"];
  const white = pool.filter((p) => random() < (p === "Q" ? 0.7 : 0.55));
  if (white.length < 2) white.push("R", "N");
  let black = white.map((p) => p.toLowerCase());
  const variant = weighted(random, [["same", 6], ["swap", 3], ["drop", 1]]);
  if (variant === "swap") black = black.map((p) => (p === "b" && random() < 0.5 ? "n" : p === "n" && random() < 0.5 ? "b" : p));
  if (variant === "drop" && black.length > 2) black.splice(rand(black.length), 1, "p", "p");
  for (const p of white) place(p, (s) => p === "P" ? rank(s) >= 1 && rank(s) <= 5 : rank(s) <= (random() < 0.8 ? 4 : 7));
  for (const p of black) place(p, (s) => p === "p" ? rank(s) >= 2 && rank(s) <= 6 : rank(s) >= (random() < 0.8 ? 3 : 0));
  return board;
}

// --- Classification ---------------------------------------------------------------

function legalStart(pos) {
  const them = pos.turn === "w" ? "b" : "w";
  return !pos.inCheck(them) && !pos.inCheck() && pos.board.every((p, s) => !(p === "p" || p === "P") || (s >> 3 > 0 && s >> 3 < 7));
}

// Moves (other than `except`) that score at least t.
export function movesAtLeast(pos, depth, t, except, limit = Infinity) {
  const found = [];
  for (const m of pos.legalMoves()) {
    if (except && m.from === except.from && m.to === except.to && m.promo === except.promo) continue;
    if (scoresAtLeast(pos, m, depth, t) && found.push(m) >= limit) break;
  }
  return found;
}

// Win material: one move wins at least two pawns; nothing else wins anything comparable.
function classifyWin(pos, level) {
  const { depth, quietStart, deep } = SETTINGS.win[level];
  const base = evaluate(pos);
  if (Math.abs(base) > 200) return null;
  if (quietStart) {
    // Nothing hangs on either side: the win must come from a tactic, not a free capture.
    if (quiesce(pos, -MATE, MATE) - base >= 100) return null;
    if (threat(pos, 0) >= 100) return null;
  }
  const { move, score } = bestMove(pos, depth);
  if (!move || isMateScore(score) || score - base < GAIN) return null;
  if (movesAtLeast(pos, depth, Math.max(base + 100, score - 150), move, 1).length) return null;
  if (deep && scoresAtLeast(pos, move, 3, base + GAIN)) return null; // visible at a shallow depth: not hard
  return { key: move, score, base };
}

// Best move: the opponent threatens something and only one move holds.
function classifyBest(pos, level) {
  const { depth } = SETTINGS.best[level];
  const base = evaluate(pos);
  if (Math.abs(base) > 300) return null;
  if (threat(pos, 1) < GAIN) return null;
  const { move, score } = bestMove(pos, depth);
  if (!move || isMateScore(score) || score - base > 150 || score - base < -150) return null;
  if (movesAtLeast(pos, depth, score - 200, move, 1).length) return null;
  if (level === 3 && bestMove(pos, 1).move?.to === move.to && bestMove(pos, 1).move?.from === move.from) return null;
  return { key: move, score, base };
}

// Bait: a piece looks free (nothing guards it) but taking it loses; one or two moves are fine.
function classifyBait(pos) {
  const { depth } = SETTINGS.bait[1];
  const base = evaluate(pos);
  if (Math.abs(base) > 200) return null;
  if (threat(pos, 0) >= 100) return null; // nothing of ours is hanging, so the bait is the story
  const them = pos.turn === "w" ? "b" : "w";
  const baits = pos.legalMoves().filter((m) => m.captured && VALUE[m.captured.toLowerCase()] >= 100 && !pos.attacked(m.to, them));
  if (!baits.length) return null;
  // Cheapest tests first: looks winning one move deep, loses at full depth.
  const bait = baits.find((m) => scoresAtLeast(pos, m, 1, base + 100) && !scoresAtLeast(pos, m, depth, base - 100));
  if (!bait) return null;
  if (baits.some((m) => m !== bait && scoresAtLeast(pos, m, depth, base + 100))) return null; // another capture really is free
  const { move, score } = bestMove(pos, depth);
  // The right move keeps the balance; if something wins outright this is a tactic, not a trap.
  if (!move || isMateScore(score) || score < base - 100 || score - base > 150 || score < bestScoreOf(pos, bait, depth) + 300) return null;
  if (movesAtLeast(pos, depth, score - MARGIN, move, 3).length > 2) return null;
  return { key: move, score, base, bait };
}

const bestScoreOf = (pos, m, depth) => scoreMove(pos, m, depth);

const CLASSIFY = { win: classifyWin, best: classifyBest, bait: classifyBait };

export function generateTactic(kind, level, random = Math.random, budget = 20) {
  for (let i = 0; i < budget; i++) {
    const fen = `${boardFen(randomMiddlegame(random))} w - - 0 1`;
    const pos = new Position(fen);
    if (!legalStart(pos) || !pos.hasLegalMove()) continue;
    if (!CLASSIFY[kind](pos, level)) continue;
    return { fen: random() < 0.5 ? flipColours(fen) : fen, kind, level };
  }
  return null;
}

// Re-run the classification on a (possibly colour-flipped) puzzle position.
export function analysePuzzle(fen, kind, level) {
  return CLASSIFY[kind](new Position(fen), level);
}

// --- Playing a tactic -------------------------------------------------------------

// Judge a candidate move: is it as good as the best move here (and, for "win", still winning)?
export function judgeMove(pos, m, kind, level, startBase) {
  const depth = SETTINGS[kind][level].depth;
  const { move, score } = bestMove(pos, depth);
  const need = Math.max(score - MARGIN, kind === "win" ? startBase + GAIN : -MATE);
  return { ok: (m.from === move.from && m.to === move.to && m.promo === move.promo) || scoresAtLeast(pos, m, depth, need), best: move, score };
}

// After a solver move in a "win" puzzle: is the gain banked (material up, nothing to win back)?
export function gainBanked(pos, startBase) {
  // pos has the opponent to move. The material must be on the board already, and
  // quiescence from their side (pending recaptures) must not win it back.
  if (pos.isCheckmate()) return true;
  return -evaluate(pos) - startBase >= GAIN - 20 && -quiesce(pos, -MATE, MATE) - startBase >= GAIN - 20;
}

export function reply(pos, kind, level) {
  return bestMove(pos, Math.max(SETTINGS[kind][level].depth - 1, 2)).move;
}

// --- Naming the idea -----------------------------------------------------------------

const KNIGHT = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]];
const LINES = { r: [[1, 0], [-1, 0], [0, 1], [0, -1]], b: [[1, 1], [1, -1], [-1, 1], [-1, -1]] };
LINES.q = [...LINES.r, ...LINES.b];
LINES.k = LINES.q;

// Enemy pieces a piece on s attacks, plus x-ray targets behind the first one on each line.
function attacks(board, s, p) {
  const type = p.toLowerCase(), us = colorOf(p), hits = [], xrays = [];
  const at = (f, r) => (f >= 0 && f < 8 && r >= 0 && r < 8 ? r * 8 + f : -1);
  const f0 = s & 7, r0 = s >> 3;
  const enemy = (t) => board[t] && colorOf(board[t]) !== us;
  if (type === "p") {
    const dr = us === "w" ? 1 : -1;
    for (const df of [-1, 1]) { const t = at(f0 + df, r0 + dr); if (t >= 0 && enemy(t)) hits.push(t); }
  } else if (type === "n") {
    for (const [df, dr] of KNIGHT) { const t = at(f0 + df, r0 + dr); if (t >= 0 && enemy(t)) hits.push(t); }
  } else {
    for (const [df, dr] of LINES[type]) {
      let first = -1;
      for (let i = 1; i < 8; i++) {
        const t = at(f0 + df * i, r0 + dr * i);
        if (t < 0) break;
        if (!board[t]) { if (type === "k") break; continue; }
        if (first < 0) {
          if (!enemy(t)) break;
          first = t; hits.push(t);
          if (type === "k") break;
        } else { if (enemy(t)) xrays.push([first, t]); break; }
      }
    }
  }
  return { hits, xrays };
}

// A short label for the idea behind the key move.
export function theme(fen, key) {
  const pos = new Position(fen);
  const before = pos.board.slice();
  const san = pos.san(key);
  pos.make(key);
  if (!pos.hasLegalMove() && pos.inCheck()) return "Checkmate";
  const b = pos.board, piece = b[key.to], worth = (t) => (b[t].toLowerCase() === "k" ? 10000 : VALUE[b[t].toLowerCase()]);
  const { hits, xrays } = attacks(b, key.to, piece);
  const big = hits.filter((t) => worth(t) > VALUE[piece.toLowerCase()] || !pos.attacked(t, colorOf(b[t]) === "w" ? "w" : "b") || worth(t) >= 500);
  if (big.length >= 2) return "Fork";
  for (const [front, back] of xrays) {
    if (worth(back) > worth(front)) return "Pin";
    if (worth(front) > worth(back)) return "Skewer";
  }
  // Discovered attack: another of our pieces now hits something it did not before.
  for (let s = 0; s < 64; s++) {
    const p = b[s];
    if (!p || s === key.to || colorOf(p) !== colorOf(piece)) continue;
    const now = attacks(b, s, p).hits, then = attacks(before, s, p).hits;
    if (now.some((t) => !then.includes(t) && worth(t) >= 300)) return "Discovered attack";
  }
  if (key.captured && VALUE[key.captured.toLowerCase()] < VALUE[key.piece.toLowerCase()] && pos.attacked(key.to, pos.turn)) return "Sacrifice";
  if (san.endsWith("+")) return "Check";
  if (key.captured) return "Capture";
  return "Quiet move";
}

// --- Stored lines --------------------------------------------------------------------

export const toUci = (m) => sqName(m.from) + sqName(m.to) + (m.promo ? m.promo.toLowerCase() : "");
export const fromUci = (pos, uci) => pos.legalMoves().find((m) => toUci(m) === uci) ?? null;

// Main line for a puzzle. "win": key, then best play until the material is banked.
// Other kinds are one-move puzzles; the line adds the reply and follow-up that explain them.
export function buildLine(fen, kind, level, analysis = analysePuzzle(fen, kind, level)) {
  const pos = new Position(fen), depth = SETTINGS[kind][level].depth, line = [analysis.key];
  pos.make(analysis.key);
  if (kind === "win") {
    for (let i = 0; i < 4 && !gainBanked(pos, analysis.base) && pos.hasLegalMove(); i++) {
      const r = reply(pos, kind, level);
      line.push(r); pos.make(r);
      const { move } = bestMove(pos, depth);
      if (!move) break;
      line.push(move); pos.make(move);
    }
  } else if (pos.hasLegalMove()) {
    const r = reply(pos, kind, level);
    line.push(r); pos.make(r);
    const { move } = bestMove(pos, Math.max(depth - 1, 2));
    if (move) line.push(move);
  }
  return line;
}
