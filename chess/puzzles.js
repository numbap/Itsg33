// Puzzle generation and solving: random "mate in N" positions with exactly one
// winning first move, checked by an exhaustive search.

import { Position, colorOf } from "./engine.js";

// Mulberry32: small seeded PRNG so a puzzle can be regenerated from its seed.
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --- Solver -----------------------------------------------------------------

// The side to move is mated now, or (n > 1) every reply lets the attacker mate within n - 1.
export function defenderLoses(pos, n) {
  if (n <= 1) return pos.inCheck() && !pos.hasLegalMove();
  const replies = pos.legalMoves();
  if (!replies.length) return pos.inCheck();
  for (const r of replies) {
    pos.make(r);
    const ok = forcesMate(pos, n - 1);
    pos.undo();
    if (!ok) return false;
  }
  return true;
}

// The side to move can force mate within n of its own moves.
export function forcesMate(pos, n) {
  for (const m of pos.legalMoves()) {
    pos.make(m);
    // Only a checking move can mate on the last move.
    const ok = (n > 1 || pos.inCheck()) && defenderLoses(pos, n);
    pos.undo();
    if (ok) return true;
  }
  return false;
}

// First moves that force mate within n, stopping once `limit` are found.
export function winningMoves(pos, n, limit = Infinity) {
  const found = [];
  for (const m of pos.legalMoves()) {
    pos.make(m);
    const ok = (n > 1 || pos.inCheck()) && defenderLoses(pos, n);
    pos.undo();
    if (ok && found.push(m) >= limit) break;
  }
  return found;
}

// Fewest moves the side to move needs to force mate, up to `max` (Infinity if it cannot).
export function mateDistance(pos, max) {
  for (let k = 1; k <= max; k++) if (forcesMate(pos, k)) return k;
  return Infinity;
}

// The toughest defence: delay mate the longest, then leave the fewest winning continuations.
export function bestDefence(pos, n, random = Math.random) {
  let best = [], score = null;
  for (const r of pos.legalMoves()) {
    pos.make(r);
    const d = mateDistance(pos, n - 1);
    const s = [d, d === Infinity ? 0 : -winningMoves(pos, d).length];
    pos.undo();
    const cmp = score ? s[0] - score[0] || s[1] - score[1] : 1;
    if (cmp > 0) { score = s; best = [r]; } else if (cmp === 0) best.push(r);
  }
  return best[Math.floor(random() * best.length)] ?? null;
}

// Main line: key move, best defence, ... ending in mate.
export function solutionLine(fen, n, random = Math.random) {
  const pos = new Position(fen), line = [];
  for (let left = n; left >= 1; left--) {
    // Take the quickest win so the shown line ends in mate as soon as the defence allows.
    const [m] = winningMoves(pos, mateDistance(pos, left), 1);
    if (!m) break;
    line.push(m); pos.make(m);
    if (!pos.hasLegalMove()) break;
    const r = bestDefence(pos, left, random);
    line.push(r); pos.make(r);
  }
  return line;
}

// --- Generator --------------------------------------------------------------

export const pick = (random, items) => items[Math.floor(random() * items.length)];
export const weighted = (random, table) => {
  let x = random() * table.reduce((s, [, w]) => s + w, 0);
  for (const [v, w] of table) if ((x -= w) < 0) return v;
  return table[table.length - 1][0];
};
const dist = (a, b) => Math.max(Math.abs((a & 7) - (b & 7)), Math.abs((a >> 3) - (b >> 3)));

// Attacking pieces are white; the defending king sits near an edge, often
// behind its own pawns, the way mating patterns arise in games.
function randomSetup(random, n) {
  const board = new Array(64).fill(null);
  const free = (s) => s >= 0 && s < 64 && !board[s];
  const put = (s, p) => { board[s] = p; return s; };
  const randomFree = (ok = () => true) => {
    for (let i = 0; i < 200; i++) { const s = Math.floor(random() * 64); if (free(s) && ok(s)) return s; }
    return -1;
  };

  // Black king: back rank, an edge file, or the rank in front of the back rank.
  const kingSpot = weighted(random, [["back", 6], ["edge", 2], ["second", 1]]);
  const bkFile = kingSpot === "edge" ? pick(random, [0, 7]) : Math.floor(random() * 8);
  const bkRank = kingSpot === "back" ? 7 : kingSpot === "second" ? 6 : 3 + Math.floor(random() * 5);
  const bk = put(bkRank * 8 + bkFile, "k");

  // Pawn cover in front of the king, sometimes with a gap or one pawn advanced.
  if (bkRank >= 6 && random() < 0.75) {
    for (const df of [-1, 0, 1]) {
      const f = bkFile + df;
      if (f < 0 || f > 7 || random() < 0.25) continue;
      const r = random() < 0.2 ? 5 : 6;
      const s = (r === bkRank ? r - 1 : r) * 8 + f;
      if (free(s)) put(s, "p");
    }
  }
  // Other defenders.
  const extras = weighted(random, [[0, 2], [1, 4], [2, 3], [3, 1]]);
  for (let i = 0; i < extras; i++) {
    const p = weighted(random, [["p", 3], ["r", 2], ["n", 2], ["b", 2], ["q", 1]]);
    const s = randomFree((t) => (p === "p" ? (t >> 3) >= 2 && (t >> 3) <= 6 : (t >> 3) >= 3));
    if (s >= 0) put(s, p);
  }

  // White king: usually far away, sometimes close enough to take part.
  const wk = randomFree((s) => dist(s, bk) >= 2 && (random() < 0.3 ? dist(s, bk) === 2 : (s >> 3) <= 3));
  if (wk < 0) return null;
  put(wk, "K");

  // Attackers: more of them for longer mates.
  const count = n === 1 ? 1 + Math.floor(random() * 3) : 2 + Math.floor(random() * 2);
  for (let i = 0; i < count; i++) {
    const p = weighted(random, [["Q", 3], ["R", 4], ["B", 2], ["N", 3], ["P", 1]]);
    // Pieces land within reach of the king's area more often than not.
    const near = random() < 0.6;
    const s = randomFree((t) => (p === "P" ? (t >> 3) >= 1 && (t >> 3) <= 6 : true) && (!near || dist(t, bk) <= 3));
    if (s >= 0) put(s, p);
  }
  // Black pawns on the first rank or white pawns on the last are impossible.
  if (board.some((p, s) => (p === "p" || p === "P") && ((s >> 3) === 0 || (s >> 3) === 7))) return null;

  return board;
}

export function boardFen(board) {
  const rows = [];
  for (let r = 7; r >= 0; r--) {
    let row = "", empty = 0;
    for (let f = 0; f < 8; f++) {
      const p = board[r * 8 + f];
      if (!p) { empty++; continue; }
      if (empty) { row += empty; empty = 0; }
      row += p;
    }
    rows.push(row + (empty || ""));
  }
  return rows.join("/");
}

// Swap colours and mirror ranks so Black is the side solving.
export function flipColours(fen) {
  const [placement, turn] = fen.split(" ");
  const swapped = placement.split("/").reverse().join("/")
    .replace(/[a-z]/gi, (c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()));
  return `${swapped} ${turn === "w" ? "b" : "w"} - - 0 1`;
}

// Is this a good puzzle? Exactly one first move forces mate in n, and no faster mate exists.
export function isPuzzle(fen, n) {
  const pos = new Position(fen);
  if (pos.inCheck(pos.turn === "w" ? "b" : "w")) return false; // side not to move in check: illegal
  if (pos.inCheck()) return false;                               // start from a quiet position
  if (n > 1 && forcesMate(pos, n - 1)) return false;
  return winningMoves(pos, n, 2).length === 1;
}

// Try up to `budget` random positions; returns a puzzle or null so callers can yield and retry.
export function generatePuzzle(n, random = Math.random, budget = 400) {
  for (let i = 0; i < budget; i++) {
    const board = randomSetup(random, n);
    if (!board) continue;
    const fen = `${boardFen(board)} w - - 0 1`;
    if (!isPuzzle(fen, n)) continue;
    const pos = new Position(fen);
    // Skip positions where the attacker is so far ahead that anything wins.
    const material = (c) => pos.board.reduce((s, p) => s + (p && colorOf(p) === c ? { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 }[p.toLowerCase()] : 0), 0);
    if (n > 1 && material("w") - material("b") > 14) continue;
    return { fen: random() < 0.5 ? flipColours(fen) : fen, mateIn: n };
  }
  return null;
}
