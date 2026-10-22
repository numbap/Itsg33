// Material search: alpha-beta with quiescence, used to verify tactical puzzles.
// Scores are centipawns from the side to move's point of view.

import { colorOf } from "./engine.js";

export const VALUE = { p: 100, n: 300, b: 320, r: 500, q: 900, k: 0 };
export const MATE = 100000;
export const isMateScore = (s) => Math.abs(s) > MATE - 1000;
const value = (p) => (p ? VALUE[p.toLowerCase()] : 0);

export function material(pos, color) {
  let s = 0;
  for (const p of pos.board) if (p && colorOf(p) === color) s += value(p);
  return s;
}

export function evaluate(pos) {
  const them = pos.turn === "w" ? "b" : "w";
  return material(pos, pos.turn) - material(pos, them);
}

// Most valuable victim first, least valuable attacker as tie-break; then promotions.
const order = (m) => (m.captured ? 10 * value(m.captured) - value(m.piece) + 10000 : 0) + (m.promo ? value(m.promo) : 0);
const byOrder = (a, b) => order(b) - order(a);

// Makes m and reports whether it was legal; illegal moves are undone already.
function tryMove(pos, m) {
  pos.make(m);
  const mover = pos.turn === "w" ? "b" : "w";
  if (pos.attacked(pos.kings[mover], pos.turn)) { pos.undo(); return false; }
  return true;
}

export function quiesce(pos, alpha, beta, ply = 0, stats = { nodes: 0 }) {
  stats.nodes++;
  const checked = pos.inCheck();
  let best = -MATE + ply;
  if (!checked) {
    best = evaluate(pos);
    if (best >= beta) return best;
    if (best > alpha) alpha = best;
  }
  // In check every evasion is searched so mates are seen; otherwise captures and promotions only.
  const moves = (checked && ply < 12 ? pos.pseudoMoves() : pos.pseudoMoves(true)).sort(byOrder);
  let legal = 0;
  for (const m of moves) {
    if (!tryMove(pos, m)) continue;
    legal++;
    const s = -quiesce(pos, -beta, -alpha, ply + 1, stats);
    pos.undo();
    if (s > best) best = s;
    if (s > alpha) alpha = s;
    if (alpha >= beta) break;
  }
  if (checked && !legal) return pos.hasLegalMove() ? evaluate(pos) : -MATE + ply;
  return best;
}

export function search(pos, depth, alpha = -MATE - 1, beta = MATE + 1, ply = 0, stats = { nodes: 0 }) {
  if (depth <= 0) return quiesce(pos, alpha, beta, ply, stats);
  stats.nodes++;
  let best = -MATE - 1, legal = 0;
  for (const m of pos.pseudoMoves().sort(byOrder)) {
    if (!tryMove(pos, m)) continue;
    legal++;
    // Check extension: forcing lines resolve instead of stopping mid-combination.
    const ext = pos.inCheck() && ply < 6 ? 1 : 0;
    const s = -search(pos, depth - 1 + ext, -beta, -alpha, ply + 1, stats);
    pos.undo();
    if (s > best) best = s;
    if (s > alpha) alpha = s;
    if (alpha >= beta) break;
  }
  if (!legal) return pos.inCheck() ? -MATE + ply : 0;
  return best;
}

// Score of a single move at the given depth (from the mover's view).
export function scoreMove(pos, m, depth, alpha = -MATE - 1, beta = MATE + 1) {
  pos.make(m);
  const s = -search(pos, depth - 1, -beta, -alpha, 1);
  pos.undo();
  return s;
}

// Does move m score at least t? (null-window test, cheaper than an exact score)
export function scoresAtLeast(pos, m, depth, t) {
  return scoreMove(pos, m, depth, t - 1, t) >= t;
}

// Best move and its exact score.
export function bestMove(pos, depth, moves = pos.legalMoves()) {
  let best = null, alpha = -MATE - 1;
  for (const m of [...moves].sort(byOrder)) {
    const s = scoreMove(pos, m, depth, alpha, MATE + 1);
    if (!best || s > alpha) { best = m; alpha = s; }
  }
  return { move: best, score: alpha };
}

// What the opponent could do if the side to move passed (for spotting threats).
export function threat(pos, depth) {
  if (pos.inCheck()) return MATE;
  const ep = pos.ep;
  pos.turn = pos.turn === "w" ? "b" : "w";
  pos.ep = -1;
  const s = search(pos, depth) - evaluate(pos);
  pos.turn = pos.turn === "w" ? "b" : "w";
  pos.ep = ep;
  return s;
}
