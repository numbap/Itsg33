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
  {
    name: "Magnus Smith Trap", opening: "Sicilian Defence, Dragon",
    moves: "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Bc4 Bg7 e5 dxe5 Bxf7+ Kxf7 Ne6 Kxe6 Qxd8", start: 14,
    idea: "Taking on e5 opens the d-file. Bxf7+ drags the king out and Ne6 wins the queen.",
  },
  {
    name: "Petrov Discovered Check", opening: "Petrov's Defence",
    moves: "e4 e5 Nf3 Nf6 Nxe5 Nxe4 Qe2 Nf6 Nc6+ Be7 Nxd8", start: 8,
    idea: "Copying White with Nxe4 walks into Qe2: the knight jumps away with a discovered check and hits the queen.",
  },
  {
    name: "Queen's Gambit Accepted Trap", opening: "Queen's Gambit Accepted",
    moves: "d4 d5 c4 dxc4 e3 b5 a4 c6 axb5 cxb5 Qf3 Nc6 Qxc6+ Bd7 Qe4", start: 10,
    idea: "Holding the gambit pawn with b5 leaves the long diagonal open: Qf3 hits the rook on a8.",
  },
  {
    name: "Caro-Kann Smothered Mate", opening: "Caro-Kann Defence",
    moves: "e4 c6 d4 d5 Nc3 dxe4 Nxe4 Nd7 Qe2 Ngf6 Nd6#", start: 10,
    idea: "With the queen on e2 the e7 pawn is pinned, so Nd6 is a smothered mate.",
  },
  {
    name: "Stafford Gambit Trap", opening: "Stafford Gambit",
    moves: "e4 e5 Nf3 Nf6 Nxe5 Nc6 Nxc6 dxc6 d3 Bc5 Bg5 Nxe4 Bxd8 Bxf2+ Ke2 Bg4#", start: 11,
    idea: "Bg5 pins the knight only in appearance: Nxe4 gives up the queen for a quick mate.",
  },
  {
    name: "Owen's Defence Trap", opening: "Owen's Defence",
    moves: "e4 b6 d4 Bb7 Bd3 f5 exf5 Bxg2 Qh5+ g6 fxg6 Nf6 gxh7+ Nxh5 Bg6#", start: 8,
    idea: "f5 weakens the e8–h5 diagonal. The g-pawn keeps capturing until the bishop mates on g6.",
  },
  {
    name: "From's Gambit Trap", opening: "Bird's Opening, From's Gambit",
    moves: "f4 e5 fxe5 d6 exd6 Bxd6 Nc3 Qh4+ g3 Qxg3+ hxg3 Bxg3#", start: 7,
    idea: "Without Nf3 the dark squares around the white king are open to the queen and bishop.",
  },
  {
    name: "Dutch Bishop Mate", opening: "Dutch Defence",
    moves: "d4 f5 Bg5 h6 Bh4 g5 Bg3 f4 e3 h5 Bd3 Rh6 Qxh5+ Rxh5 Bg6#", start: 12,
    idea: "Chasing the bishop with every kingside pawn leaves the e8–h5 diagonal wide open.",
  },
  {
    name: "Krejcik Gambit Trap", opening: "Dutch Defence",
    moves: "d4 f5 h3 Nf6 g4 fxg4 hxg4 Nxg4 Qd3 Nf6 Rxh7 Rxh7 Qg6#", start: 10,
    idea: "Grabbing the second pawn lets the h-file rook break in, and the queen mates on g6.",
  },
  {
    name: "French Advance Trap", opening: "French Defence, Advance",
    moves: "e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3 Qb6 Bd3 cxd4 cxd4 Nxd4 Nxd4 Qxd4 Bb5+ Bd7 Qxd4", start: 14,
    idea: "The d4 pawn looks undefended, but Bb5+ uncovers the d1 queen on d4.",
  },
  {
    name: "Scandinavian Queen Trap", opening: "Scandinavian Defence",
    moves: "e4 d5 exd5 Qxd5 Nc3 Qa5 d4 c6 Nf3 Bg4 Bf4 e6 h3 Bxf3 Qxf3 Bb4 Be2 Nd7 a3 O-O-O axb4 Qxa1+ Kd2 Qxh1 Qxc6+ bxc6 Ba6#", start: 20,
    idea: "Castling long walks into axb4. The queen grabs two rooks, but Qxc6+ and Ba6 mate first.",
  },
  {
    name: "King's Gambit Declined Trap", opening: "King's Gambit Declined",
    moves: "e4 e5 f4 Bc5 fxe5 Qh4+ g3 Qxe4+ Qe2 Qxh1", start: 5,
    idea: "Taking on e5 opens the king. Qh4+ and Qxe4+ fork the king and the rook on h1.",
  },
  {
    name: "Exchange Ruy Lopez Trap", opening: "Ruy Lopez, Exchange",
    moves: "e4 e5 Nf3 Nc6 Bb5 a6 Bxc6 dxc6 Nxe5 Qd4 Nf3 Qxe4+ Qe2 Qxe2+ Kxe2", start: 9,
    idea: "After Bxc6 the e5 pawn is not really free: Qd4 forks the knight and e4.",
  },
  {
    name: "Philidor Queen Raid", opening: "Philidor Defence",
    moves: "e4 e5 Nf3 d6 d4 Nd7 Bc4 Be7 dxe5 Nxe5 Nxe5 dxe5 Qh5 g6 Qxe5", start: 8,
    idea: "Be7 lets White open the centre; Qh5 hits f7 and e5 at once.",
  },
  {
    name: "Caro-Kann Two Knights Mate", opening: "Caro-Kann Defence, Two Knights",
    moves: "e4 c6 Nc3 d5 Nf3 dxe4 Nxe4 Nf6 Qe2 Nbd7 Nd6#", start: 10,
    idea: "The same smothered mate: the e7 pawn is pinned against the king by the queen on e2.",
  },
];

const strip =(san) => san.replace(/[+#!?]/g, "");

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
