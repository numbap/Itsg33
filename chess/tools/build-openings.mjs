// Generates opening-blunder traps: in real opening lines, find moves that look fine at a
// glance (a one-move search with recaptures sees nothing wrong) but lose to a unique tactic.
// Usage: node chess/tools/build-openings.mjs <count> <seed> <part.json>
//        node chess/tools/build-openings.mjs --merge <part.json>...   -> chess/opening-traps.js

import { writeFile, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { Position } from "../engine.js";
import { sanToMove } from "../traps.js";
import { evaluate, bestMove, scoreMove, isMateScore } from "../search.js";
import { movesAtLeast, buildLine, gainBanked, theme } from "../tactics.js";
import { rng } from "../puzzles.js";

export const BOOK = [
  ["Italian Game", "e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6 O-O O-O"],
  ["Two Knights Defence", "e4 e5 Nf3 Nc6 Bc4 Nf6 d3 Be7 O-O O-O Re1 d6"],
  ["Ruy Lopez", "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 d6 c3 O-O"],
  ["Ruy Lopez, Berlin", "e4 e5 Nf3 Nc6 Bb5 Nf6 O-O Nxe4 d4 Nd6 Bxc6 dxc6 dxe5 Nf5"],
  ["Scotch Game", "e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Nf6 Nxc6 bxc6 e5 Qe7 Qe2 Nd5"],
  ["Four Knights Game", "e4 e5 Nf3 Nc6 Nc3 Nf6 Bb5 Bb4 O-O O-O d3 d6"],
  ["Petrov's Defence", "e4 e5 Nf3 Nf6 Nxe5 d6 Nf3 Nxe4 d4 d5 Bd3 Nc6 O-O Be7"],
  ["Philidor Defence", "e4 e5 Nf3 d6 d4 Nf6 Nc3 Nbd7 Bc4 Be7 O-O O-O"],
  ["Vienna Game", "e4 e5 Nc3 Nf6 Bc4 Nc6 d3 Bc5 f4 d6 Nf3"],
  ["King's Gambit", "e4 e5 f4 exf4 Nf3 g5 h4 g4 Ne5 Nf6"],
  ["Sicilian, Najdorf", "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Be3 e5 Nb3 Be6 f3 Be7"],
  ["Sicilian, Dragon", "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7 f3 O-O Qd2 Nc6"],
  ["Sicilian, Taimanov", "e4 c5 Nf3 e6 d4 cxd4 Nxd4 Nc6 Nc3 Qc7 Be2 a6 O-O Nf6"],
  ["Sicilian, Alapin", "e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 Nf3 Nc6 cxd4 d6"],
  ["Sicilian, Sveshnikov", "e4 c5 Nf3 Nc6 d4 cxd4 Nxd4 Nf6 Nc3 e5 Ndb5 d6 Bg5 a6 Na3 b5"],
  ["French, Winawer", "e4 e6 d4 d5 Nc3 Bb4 e5 c5 a3 Bxc3+ bxc3 Ne7 Qg4 O-O"],
  ["French, Advance", "e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3 Qb6 a3 c4"],
  ["French, Tarrasch", "e4 e6 d4 d5 Nd2 Nf6 e5 Nfd7 Bd3 c5 c3 Nc6 Ne2 cxd4 cxd4"],
  ["Caro-Kann, Classical", "e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Ng3 Bg6 h4 h6 Nf3 Nd7"],
  ["Caro-Kann, Advance", "e4 c6 d4 d5 e5 Bf5 Nf3 e6 Be2 c5 O-O Nc6"],
  ["Scandinavian Defence", "e4 d5 exd5 Qxd5 Nc3 Qa5 d4 Nf6 Nf3 Bf5 Bc4 e6 Bd2 c6"],
  ["Pirc Defence", "e4 d6 d4 Nf6 Nc3 g6 f4 Bg7 Nf3 O-O Bd3 Na6"],
  ["Alekhine's Defence", "e4 Nf6 e5 Nd5 d4 d6 Nf3 Bg4 Be2 e6 O-O Be7"],
  ["Queen's Gambit Declined", "d4 d5 c4 e6 Nc3 Nf6 Bg5 Be7 e3 O-O Nf3 Nbd7 Rc1 c6"],
  ["Queen's Gambit Accepted", "d4 d5 c4 dxc4 Nf3 Nf6 e3 e6 Bxc4 c5 O-O a6"],
  ["Slav Defence", "d4 d5 c4 c6 Nf3 Nf6 Nc3 dxc4 a4 Bf5 e3 e6 Bxc4 Bb4"],
  ["King's Indian Defence", "d4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2 e5 O-O Nc6 d5 Ne7"],
  ["Nimzo-Indian Defence", "d4 Nf6 c4 e6 Nc3 Bb4 Qc2 O-O a3 Bxc3+ Qxc3 b6 Bg5 Bb7"],
  ["Queen's Indian Defence", "d4 Nf6 c4 e6 Nf3 b6 g3 Bb7 Bg2 Be7 O-O O-O Nc3 Ne4"],
  ["Grünfeld Defence", "d4 Nf6 c4 g6 Nc3 d5 cxd5 Nxd5 e4 Nxc3 bxc3 Bg7 Bc4 c5 Ne2 Nc6"],
  ["Dutch Defence", "d4 f5 g3 Nf6 Bg2 e6 Nf3 Be7 O-O O-O c4 d6 Nc3 Qe8"],
  ["London System", "d4 d5 Bf4 Nf6 e3 c5 c3 Nc6 Nd2 e6 Ngf3 Bd6 Bg3 O-O"],
  ["Catalan Opening", "d4 Nf6 c4 e6 g3 d5 Bg2 Be7 Nf3 O-O O-O dxc4 Qc2 a6"],
  ["English Opening", "c4 e5 Nc3 Nf6 g3 d5 cxd5 Nxd5 Bg2 Nb6 Nf3 Nc6 O-O Be7"],
  ["Réti Opening", "Nf3 d5 g3 Nf6 Bg2 c6 O-O Bg4 d3 Nbd7 Nbd2 e5"],
  ["Benoni Defence", "d4 Nf6 c4 c5 d5 e6 Nc3 exd5 cxd5 d6 e4 g6 Nf3 Bg7 Be2 O-O"],
  ["Budapest Gambit", "d4 Nf6 c4 e5 dxe5 Ng4 Bf4 Nc6 Nf3 Bb4+ Nbd2 Qe7 e3 Ngxe5"],
  ["Bishop's Opening", "e4 e5 Bc4 Nf6 d3 c6 Nf3 d5 Bb3 Bd6 Nc3 dxe4"],
  ["Ponziani Opening", "e4 e5 Nf3 Nc6 c3 Nf6 d4 Nxe4 d5 Ne7 Nxe5 Ng6"],
  ["Evans Gambit", "e4 e5 Nf3 Nc6 Bc4 Bc5 b4 Bxb4 c3 Ba5 d4 exd4 O-O Nge7"],
  ["Danish Gambit", "e4 e5 d4 exd4 c3 dxc3 Bc4 cxb2 Bxb2 d5 Bxd5 Nf6"],
  ["Smith-Morra Gambit", "e4 c5 d4 cxd4 c3 dxc3 Nxc3 Nc6 Nf3 d6 Bc4 e6 O-O Nf6 Qe2 Be7"],
  ["Centre Game", "e4 e5 d4 exd4 Qxd4 Nc6 Qe3 Nf6 Nc3 Bb4 Bd2 O-O O-O-O Re8"],
];


function ideaText(opening, san, motif, sanLine) {
  const how = motif === "Checkmate" ? " to mate" : ["Quiet move", "Capture", "Check"].includes(motif) ? "" : ` to a ${motif.toLowerCase()}`;
  return `${opening}. ${san} looks natural, but it loses${how}: ${sanLine.join(" ")}.`;
}

function moveLabel(plyIndex, san) {
  const n = Math.floor(plyIndex / 2) + 1;
  return plyIndex % 2 ? `${n}…${san}` : `${n}.${san}`;
}

// The opponent (Y, to move in `pos`) can win at least a piece or mate, and the line banks it.
// `base` is Y's material balance before the blunder, so a plain trade does not count as a win.
// Several winning replies are allowed: the page accepts any reply the search rates as good.
function punishment(pos, base) {
  const { move, score } = bestMove(pos, 3);
  if (!move) return null;
  const mate = isMateScore(score) && score > 0;
  if (!mate && score - base < 280) return null;
  // Not unique and not decisive (several moves win about the same): too easy to stumble on.
  if (!mate && movesAtLeast(pos, 3, score - 60, move, 3).length > 2) return null;
  const line = buildLine(pos.fen(), "win", 2, { key: move, score, base });
  const end = new Position(pos.fen());
  line.forEach((m) => end.make(m));
  if (line.length % 2 !== 1 || !gainBanked(end, base)) return null;
  return { key: move, line };
}

// Book line, then a few plausible amateur moves (each looks as good as the best at a glance
// and is sound two plies deep), then a natural-looking move that loses to a tactic.
function walk(random) {
  const [opening, sans] = BOOK[Math.floor(random() * BOOK.length)];
  const all = sans.split(" ");
  const pos = new Position(), moves = [];
  const bookPlies = 4 + Math.floor(random() * (all.length - 3));
  for (const san of all.slice(0, bookPlies)) {
    const m = sanToMove(pos, san);
    if (!m) return null;
    moves.push(m); pos.make(m);
  }
  const extra = 1 + Math.floor(random() * 7);
  for (let i = 0; i < extra; i++) {
    const legal = pos.legalMoves().filter((m) => !(m.piece.toLowerCase() === "k" && m.flag === "n"));
    if (!legal.length) return null;
    const scored = legal.map((m) => [m, scoreMove(pos, m, 1)]);
    const top = Math.max(...scored.map(([, g]) => g));
    const candidates = scored.filter(([, g]) => g >= top - 20).map(([m]) => m);
    for (let tries = 0; tries < 4; tries++) {
      const m = candidates[Math.floor(random() * candidates.length)];
      if (scoreMove(pos, m, 2) >= top - 60) { moves.push(m); pos.make(m); break; }
      if (tries === 3) return null;
    }
  }
  return { opening, moves, bookPlies };
}

function findBlunder(opening, prefix) {
  const p = new Position();
  prefix.forEach((m) => p.make(m));
  const legal = p.legalMoves();
  if (!legal.length) return null;
  const glance = new Map(legal.map((m) => [m, scoreMove(p, m, 1)]));
  const bestGlance = Math.max(...glance.values());
  for (const b of legal) {
    if (b.piece.toLowerCase() === "k" && b.flag === "n") continue; // king walks are not natural
    if (glance.get(b) < bestGlance - 30) continue;                // looks bad already: no trap
    const san = p.san(b, legal);
    const before = -evaluate(p);
    p.make(b);
    const punish = punishment(p, before);
    // Confirm one ply deeper so search-horizon effects do not pass as tactics.
    if (punish && (isMateScore(scoreMove(p, punish.key, 4)) || scoreMove(p, punish.key, 4) - before >= 250)) {
      const sanLine = [];
      const q = new Position(p.fen());
      for (const m of punish.line) { sanLine.push(q.san(m)); q.make(m); }
      const intro = [];
      const r = new Position();
      for (const m of prefix) { intro.push(r.san(m)); r.make(m); }
      const motif = theme(p.fen(), punish.key);
      const k = prefix.length;
      return {
        name: `Punish ${moveLabel(k, san)}`, opening,
        moves: [...intro, san, ...sanLine].join(" "), start: k + 1,
        idea: ideaText(opening, san, motif, sanLine),
        kind: "win",
      };
    }
    p.undo();
  }
  return null;
}

async function build(count, seed, out) {
  const random = rng(seed), found = [], seen = new Set();
  const t = Date.now();
  while (found.length < count) {
    const w = walk(random);
    if (!w) continue;
    const key = w.moves.map((m) => m.from * 64 + m.to).join(",");
    if (seen.has(key)) continue;
    seen.add(key);
    const trap = findBlunder(w.opening, w.moves);
    if (!trap || found.some((f) => f.moves === trap.moves)) continue;
    found.push(trap);
    await writeFile(out, JSON.stringify(found));
    console.log(`${found.length}/${count} ${((Date.now() - t) / 1000).toFixed(0)}s ${trap.opening}: ${trap.name} -> ${trap.moves.split(" ").slice(trap.start).join(" ")}`);
  }
}

const args = process.argv.slice(2);
if (args[0] === "--merge") {
  const all = [];
  const seen = new Set();
  for (const f of args.slice(1)) {
    for (const t of JSON.parse(await readFile(f, "utf8"))) {
      if (seen.has(t.moves)) continue;
      seen.add(t.moves);
      // Re-derive the explanation so it always matches the current theme detector.
      const sans = t.moves.split(" "), pos = new Position();
      for (const san of sans.slice(0, t.start)) pos.make(sanToMove(pos, san));
      const motif = theme(pos.fen(), sanToMove(pos, sans[t.start]));
      all.push({ ...t, idea: ideaText(t.opening, sans[t.start - 1], motif, sans.slice(t.start)) });
    }
  }
  const out = fileURLToPath(new URL("../opening-traps.js", import.meta.url));
  await writeFile(out, "// Generated by chess/tools/build-openings.mjs: blunders from real opening lines that lose to a unique tactic.\n\n" +
    "export const OPENING_TRAPS = [\n" + all.map((t) => `  ${JSON.stringify(t)},`).join("\n") + "\n];\n");
  console.log("wrote", out, all.length);
} else {
  await build(Number(args[0]), Number(args[1]), args[2]);
}
