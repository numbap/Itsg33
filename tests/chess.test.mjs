import test from "node:test";
import assert from "node:assert/strict";
import { Position, sqName } from "../chess/engine.js";
import { search, quiesce, evaluate, MATE } from "../chess/search.js";
import { analysePuzzle, fromUci, toUci, gainBanked, theme, generateTactic } from "../chess/tactics.js";
import { TRAPS, trapLine } from "../chess/traps.js";
import { BANK } from "../chess/bank.js";
import { OPENING_TRAPS } from "../chess/opening-traps.js";
import {
  generatePuzzle, rng, isPuzzle, forcesMate, winningMoves, solutionLine, flipColours, bestDefence, defenderLoses,
} from "../chess/puzzles.js";

function perft(pos, depth) {
  if (!depth) return 1;
  let n = 0;
  for (const m of pos.legalMoves()) { pos.make(m); n += perft(pos, depth - 1); pos.undo(); }
  return n;
}

test("move generation matches published perft counts", () => {
  const cases = [
    ["rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", 3, 8902],
    ["r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1", 3, 97862],
    ["8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1", 4, 43238],
    ["r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1", 3, 9467],
    ["rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8", 3, 62379],
  ];
  for (const [fen, depth, nodes] of cases) {
    const pos = new Position(fen);
    assert.equal(perft(pos, depth), nodes, fen);
    assert.equal(pos.fen(), fen, "make/undo restores the position");
  }
});

test("SAN covers disambiguation, castling, promotion and mate", () => {
  const san = (fen) => { const p = new Position(fen); return p.legalMoves().map((m) => p.san(m)); };
  assert.ok(san("4k3/8/8/8/8/8/8/R3K2R w KQ - 0 1").includes("O-O-O"));
  assert.ok(san("4k3/8/8/8/8/8/8/R6R w - - 0 1").includes("Rad1"));
  assert.ok(san("4k3/P7/8/8/8/8/8/4K3 w - - 0 1").includes("a8=Q+"));
  assert.ok(san("6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1").includes("Ra8#"));
});

test("checkmate and stalemate detection", () => {
  assert.ok(new Position("R5k1/5ppp/8/8/8/8/8/6K1 b - - 0 1").isCheckmate());
  assert.ok(new Position("7k/5Q2/6K1/8/8/8/8/8 b - - 0 1").isStalemate());
});

test("generated puzzles have one key move, no faster mate, and a line ending in mate", () => {
  for (const n of [1, 2, 3]) {
    const random = rng(1000 + n);
    let puzzle = null;
    while (!puzzle) puzzle = generatePuzzle(n, random, 20);
    const { fen } = puzzle;
    assert.ok(isPuzzle(fen, n), fen);
    const pos = new Position(fen);
    if (n > 1) assert.equal(forcesMate(pos, n - 1), false, `${fen} has a faster mate`);
    assert.equal(winningMoves(pos, n).length, 1, `${fen} key move is unique`);

    const line = solutionLine(fen, n);
    assert.equal(line.length, 2 * n - 1, `${fen} line runs the full length`);
    for (const m of line) pos.make(m);
    assert.ok(pos.isCheckmate(), `${fen} line ends in mate`);
  }
});

test("the same seed regenerates the same puzzle", () => {
  const a = generatePuzzle(2, rng(77), 5000), b = generatePuzzle(2, rng(77), 5000);
  assert.ok(a);
  assert.deepEqual(a, b);
});

test("defence resists longest and wrong moves are refuted", () => {
  // Mate in 2 (Qe8+ Kc7 Qab8#); after the key, every defence still loses.
  const fen = "2k5/Qp5b/1ppp4/5r2/8/4Q3/6K1/8 w - - 0 1";
  assert.ok(isPuzzle(fen, 2));
  const pos = new Position(fen);
  const [key] = winningMoves(pos, 2);
  pos.make(key);
  assert.ok(defenderLoses(pos, 2));
  const r = bestDefence(pos, 2);
  pos.make(r);
  assert.ok(winningMoves(pos, 1).length >= 1);
  pos.undo(); pos.undo();
  const wrong = pos.legalMoves().find((m) => m.from !== key.from || m.to !== key.to);
  pos.make(wrong);
  assert.equal(defenderLoses(pos, 2), false);
});

test("flipping colours keeps the puzzle valid with Black to move", () => {
  const fen = "2k5/Qp5b/1ppp4/5r2/8/4Q3/6K1/8 w - - 0 1";
  const flipped = flipColours(fen);
  assert.equal(flipped.split(" ")[1], "b");
  assert.ok(isPuzzle(flipped, 2));
});

// --- Tactics, traps and the puzzle bank ---------------------------------------

test("search sees mate, and quiescence wins a hanging piece", () => {
  assert.ok(search(new Position("6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1"), 1) > MATE - 100);
  const pos = new Position("4k3/8/8/3q4/8/8/3R4/4K3 w - - 0 1");
  assert.equal(quiesce(pos, -MATE, MATE) - evaluate(pos), 900);
});

test("theme names a knight fork", () => {
  const pos = new Position("r3k3/8/8/1N6/8/8/8/4K3 w - - 0 1");
  const nc7 = pos.legalMoves().find((m) => sqName(m.from) === "b5" && sqName(m.to) === "c7");
  assert.equal(theme(pos.fen(), nc7), "Fork");
});

test("every opening trap is legal and ends in mate or a material win", () => {
  for (const trap of TRAPS) {
    const line = trapLine(trap);
    const pos = new Position();
    line.slice(0, trap.start).forEach((m) => pos.make(m));
    const solver = pos.turn, base = evaluate(pos);
    line.slice(trap.start).forEach((m) => pos.make(m));
    const sign = pos.turn === solver ? 1 : -1;
    assert.ok(pos.isCheckmate() || sign * evaluate(pos) - base >= 100, trap.name);
  }
});

test("generated opening blunders replay legally and the punishment banks material", () => {
  assert.ok(OPENING_TRAPS.length >= 50, "plenty of opening blunders");
  const seen = new Set();
  for (const trap of OPENING_TRAPS) {
    assert.ok(!seen.has(trap.moves), `${trap.name} is not a duplicate`);
    seen.add(trap.moves);
    const line = trapLine(trap);
    const pos = new Position();
    line.slice(0, trap.start - 1).forEach((m) => pos.make(m));
    const before = -evaluate(pos); // solver's balance before the blunder
    line.slice(trap.start - 1).forEach((m) => pos.make(m));
    assert.equal(line.length % 2, trap.start % 2 ? 0 : 1, `${trap.name}: the solver makes the last move`);
    assert.ok(gainBanked(pos, before), `${trap.opening} ${trap.name} wins material`);
  }
});

test("bank entries replay legally and win lines bank their material", () => {
  for (const [id, list] of Object.entries(BANK)) {
    assert.ok(list.length >= 8, `${id} has puzzles`);
    for (const [fen, ucis, label, bait] of list) {
      const pos = new Position(fen), base = evaluate(pos);
      if (bait) assert.ok(fromUci(pos, bait), `${id} ${fen} bait is legal`);
      const moves = ucis.split(" ");
      for (const u of moves) {
        const m = fromUci(pos, u);
        assert.ok(m, `${id} ${fen}: ${u} is legal`);
        pos.make(m);
      }
      assert.ok(label, "has a theme");
      if (id.startsWith("win")) assert.ok(moves.length % 2 === 1 && gainBanked(pos, base), `${id} ${fen} line wins material`);
    }
  }
});

test("bank puzzles still pass the generator's checks", () => {
  for (const [id, n] of [["win1", 4], ["win2", 3], ["best1", 4], ["best2", 2], ["bait1", 2]]) {
    const kind = id.replace(/\d/, ""), level = Number(id.at(-1));
    for (const [fen, ucis] of BANK[id].slice(0, n)) {
      const a = analysePuzzle(fen, kind, level);
      assert.ok(a, `${id} ${fen} still a puzzle`);
      assert.equal(toUci(a.key), ucis.split(" ")[0]);
    }
  }
});

test("live tactic generation produces a valid easy puzzle", () => {
  const random = rng(5);
  let p = null;
  while (!p) p = generateTactic("win", 1, random, 20);
  assert.ok(analysePuzzle(p.fen, "win", 1));
});

