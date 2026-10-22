// Named opening traps. The moves up to `start` (a ply index) play out on their own;
// from there the solver plays the punishing moves and the opponent keeps falling for it.

import { Position } from "./engine.js";

export const TRAPS = [
  {
    name: "Scholar's Mate", opening: "Italian Game",
    moves: "e4 e5 Bc4 Nc6 Qh5 Nf6 Qxf7#", start: 6,
    idea: "Black developed the knight and forgot f7, which only the king defends.",
  },
  {
    name: "Fool's Mate", opening: "Barnes Opening",
    moves: "f3 e5 g4 Qh4#", start: 3,
    idea: "White opened the e1–h4 diagonal to the king. The fastest mate in chess.",
  },
  {
    name: "Légal's Mate", opening: "Philidor Defence",
    moves: "e4 e5 Nf3 d6 Bc4 Bg4 Nc3 g6 Nxe5 Bxd1 Bxf7+ Ke7 Nd5#", start: 8,
    idea: "The pinned knight is not really pinned: if Black takes the queen, three minor pieces mate.",
  },
  {
    name: "Blackburne Shilling Trap", opening: "Italian Game",
    moves: "e4 e5 Nf3 Nc6 Bc4 Nd4 Nxe5 Qg5 Nxf7 Qxg2 Rf1 Qxe4+ Be2 Nf3#", start: 7,
    idea: "Nxe5 grabs a pawn but leaves g2 hanging; the queen and knight hunt the king.",
  },
  {
    name: "Elephant Trap", opening: "Queen's Gambit Declined",
    moves: "d4 d5 c4 e6 Nc3 Nf6 Bg5 Nbd7 cxd5 exd5 Nxd5 Nxd5 Bxd8 Bb4+ Qd2 Bxd2+ Kxd2 Kxd8", start: 11,
    idea: "The knight on f6 looked pinned, but after Nxd5 Bxd8 a bishop check wins back the queen with a piece to spare.",
  },
  {
    name: "Lasker Trap", opening: "Albin Countergambit",
    moves: "d4 d5 c4 e5 dxe5 d4 e3 Bb4+ Bd2 dxe3 Bxb4 exf2+ Ke2 fxg1=N+", start: 7,
    idea: "The pawn marches to g1 and promotes to a knight with check. A queen would be lost to Rxg1.",
  },
  {
    name: "Englund Gambit Trap", opening: "Englund Gambit",
    moves: "d4 e5 dxe5 Qe7 Nf3 Qb4+ Bd2 Qxb2 Bc3 Bb4 Qd2 Bxc3 Qxc3 Qc1#", start: 9,
    idea: "Bc3 attacks the queen, but the pin on c3 lets Black trade it off and mate on c1.",
  },
  {
    name: "Siberian Trap", opening: "Smith–Morra Gambit",
    moves: "e4 c5 d4 cxd4 c3 dxc3 Nxc3 Nc6 Nf3 e6 Bc4 Qc7 O-O Nf6 Qe2 Ng4 h3 Nd4 Nxd4 Qh2#", start: 17,
    idea: "h3 chases the knight, but Nd4 attacks the queen and deflects the f3 knight that guards h2.",
  },
  {
    name: "Noah's Ark Trap", opening: "Ruy Lopez",
    moves: "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 d6 d4 b5 Bb3 Nxd4 Nxd4 exd4 Qxd4 c5 Qd5 Be6 Qc6+ Bd7 Qd5 c4 Bxc4 bxc4", start: 15,
    idea: "Black's queenside pawns build an ark around the bishop on b3 and trap it.",
  },
  {
    name: "Kieninger Trap", opening: "Budapest Gambit",
    moves: "d4 Nf6 c4 e5 dxe5 Ng4 Nf3 Nc6 Bf4 Bb4+ Nbd2 Qe7 a3 Ngxe5 axb4 Nd3#", start: 15,
    idea: "Taking the bishop walks into a smothered mate: the e2 pawn is pinned by the queen.",
  },
  {
    name: "Damiano Defence Trap", opening: "Damiano Defence",
    moves: "e4 e5 Nf3 f6 Nxe5 fxe5 Qh5+ g6 Qxe5+ Qe7 Qxh8", start: 6,
    idea: "f6 weakened the king; after taking the knight, Qh5+ forks the king and the rook's defences.",
  },
  {
    name: "Mortimer Trap", opening: "Ruy Lopez, Berlin",
    moves: "e4 e5 Nf3 Nc6 Bb5 Nf6 d3 Ne7 Nxe5 c6 Bc4 Qa5+ Bd2 Qxe5", start: 9,
    idea: "The e5 pawn looked free, but c6 and Qa5+ win the knight back with interest.",
  },
];

const strip = (san) => san.replace(/[+#!?]/g, "");

export function sanToMove(pos, san) {
  const legal = pos.legalMoves();
  return legal.find((m) => strip(pos.san(m, legal)) === strip(san)) ?? null;
}

// The trap's moves as move objects, checked for legality from the start position.
export function trapLine(trap) {
  const pos = new Position(), line = [];
  for (const san of trap.moves.split(" ")) {
    const m = sanToMove(pos, san);
    if (!m) throw new Error(`${trap.name}: illegal move ${san} after ${line.length} plies`);
    line.push(m);
    pos.make(m);
  }
  return line;
}
