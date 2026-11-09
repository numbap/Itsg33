# Mined batch 5: Sicilian, Scandinavian, Caro-Kann, Modern, Italian (Paris) and Queen's Pawn traps.
# All lines validated with Stockfish 16.
SCA="Scandinavian"

trap("m142","Queen's Pawn c6 Queen Trap","Queen's Pawn Game (Slav setup)",OD,"b",3,
 "d4 d5 e3 Nf6 c4 c6 Nc3 dxc4 Bxc4 Bf5 Qb3 e6 Qxb7 Nbd7 Qxc6 Bb4 Bd2",
 "White's queen has grabbed two pawns and is deep in your camp. Take away its way home.",
 ("Bxc3 Bxc3 Be4","White recaptures on c3","…Be4 cuts off the queen's retreat. Rc8 next traps it."))
trap("m143","Rossolimo Promotion Shot","Sicilian Defense (Rossolimo)",SIC,"w",3,
 "e4 c5 Nf3 Nc6 Bb5 d6 d4 Nf6 d5 Qa5+ Nc3 Nxe4",
 "Black's knight took e4, attacking c3. Your d-pawn can do more damage first.",
 ("dxc6 Nxc3 cxb7+ Qxb5 bxa8=Q","Black takes the bishop","The pawn captures its way to a8 and promotes."),
 ("dxc6 Nxc3 cxb7+ Nxb5+ Bd2","Black blocks with the knight","The pawn on b7 is about to promote. Black can't stop it without big losses."),
 ("dxc6 Nxc3 cxb7+ Kd8 bxa8=Q","Black moves the king","The pawn promotes on a8."),
 ("dxc6 bxc6 Bxc6+ Bd7","Black recaptures on c6","The bishop takes c6 with check and the a8 rook is next."))
trap("m145","Long-Diagonal Discovery","Sicilian Defense (2.e5)",SIC,"w",2,
 "e4 c5 e5 Nc6 Nf3 g6 b3 Bg7 Bb2 Qc7 Qe2 d6",
 "Black attacked your e5 pawn, but it is blocking your b2 bishop from the g7 bishop.",
 ("exd6 Qxd6 Bxg7","Black recaptures with the queen","The diagonal opens and your bishop takes g7, hitting the h8 rook."),
 ("exd6 Bxb2 dxc7","Black takes your bishop","The pawn takes the queen on c7."))
trap("m146","Caro-Kann b2 Raid","Caro-Kann Defense",CK,"b",2,
 "e4 c6 d4 d6 Nf3 Nf6 Nc3 Bg4 h3 Bxf3 Qxf3 Qa5 Bd2 Qb6 Be3",
 "White's bishop went back to e3 and left b2 and c3 under-defended.",
 ("Qxb2 Rb1 Qxc3+ Bd2","White plays Rb1","Take on c3 with check. You're two pawns and a knight up."),
 ("Qxb2 Rb1 Qxc3+ Kd1","White plays Rb1","Take on c3 with check. You're two pawns and a knight up."),
 ("Qxb2 Rd1 Qxc3+ Bd2","White plays Rd1","Take on c3 with check. You've won a knight."),
 ("Qxb2 Rd1 Qxc3+ Rd2","White plays Rd1","Take on c3 with check. You've won a knight."),
 ("Qxb2 Qd1 Qxc3+ Bd2 Qxd4","White's queen guards c3","You collect c3 and d4 as well."),
 ("Qxb2 Qd1 Qxc3+ Ke2","White's queen guards c3","Take on c3 with check. You're well ahead."),
 ("Qxb2 Kd2 Qxa1","The king defends c3","Take the a1 rook instead."))
trap("m147","Scandinavian Advance Fork","Scandinavian Defense (2.e5)",SCA,"w",2,
 "e4 d5 e5 c5 Nf3 Nc6 d4 Bg4 c3 cxd4 Bb5 dxc3 Nxc3 e6 O-O a6",
 "Black's bishop on g4 is undefended. A trade on c6 lets your queen hit two things.",
 ("Bxc6+ bxc6 Qa4","Black recaptures","Qa4 hits the c6 pawn and the loose g4 bishop at once. One of them falls."))
trap("m148","Icelandic f2 Raid","Scandinavian Defense (Icelandic-Palme Gambit)",SCA,"b",2,
 "e4 d5 exd5 Nf6 c4 e6 dxe6 Bxe6 b3 Qd4 Nc3 Bc5 Qe2 Ne4 Qxe4",
 "White's queen took your knight and left f2 defended only by the king.",
 ("Qxf2+ Kd1 Qxf1+ Kc2 Nc6","The king runs to c2","Your queen and bishops tear the white king's position apart."),
 ("Qxf2+ Kd1 Qxf1+ Qe1 Qxg2","White blocks with the queen","You pick up g2 and the h1 rook is next."))
trap("m149","Scandinavian Queen-Trade Fork","Scandinavian Defense (Main Line)",SCA,"b",2,
 "e4 d5 exd5 Qxd5 Nc3 Qa5 d4 Nf6 Qd3 Bg4 Bd2 c6 Qg3 Nbd7 Nb5",
 "White's knight hit your queen, but the white queen on g3 is within a knight's reach of e4.",
 ("Qxd2+ Kxd2 Ne4+ Ke1 Nxg3","White recaptures with the king","Give the queen on d2, then Ne4+ forks king and queen."))
trap("m150","Modern b2 Queen Trap","Modern Defense (Averbakh)",OE,"w",2,
 "e4 d6 d4 g6 c4 Bg7 Nc3 c6 Nf3 Bg4 Be3 Qb6 a3 Qxb2",
 "Black's queen grabbed b2. How does it get back out?",
 ("Na4 Bxf3 gxf3","Black trades on f3","The queen is still trapped on b2."),
 ("Na4 Qxa1 Qxa1","The queen takes the rook","It gets only a rook for itself."))
trap("m153","Paris Back-Rank Mate","Italian Game (Paris Defense)",OG,"b",1,
 "e4 e5 Nf3 Nc6 Bc4 d6 d4 Bg4 dxe5 dxe5 Qxd8+ Rxd8 c3 Nf6 Ng5",
 "White traded queens and then went after f7. Look at the d-file instead.",
 ("Rd1#","Mate","The rook mates on d1: your g4 bishop covers e2 and d1."))
trap("m157","Closed Sicilian Defender Swap","Sicilian Defense (Closed)",SIC,"w",2,
 "e4 c5 Nc3 Nc6 g3 Nf6 Bg2 e6 Nge2 d5 exd5 exd5 d3 d4 Ne4 Be7 O-O O-O Nf4 Bg4",
 "Black's g4 bishop is attacked by your queen once one knight moves.",
 ("Nxf6+ Bxf6 Qxg4","Black recaptures","The knight trade uncovers your queen on g4. A clean piece up."))
trap("m158","Pelikan Queen Sacrifice Fork","Sicilian Defense (Pelikan)",SIC,"b",3,
 "e4 c5 Nf3 Nc6 d4 cxd4 Nxd4 Nf6 Nc3 e5 Nf5 Bb4 Nd6+ Bxd6 Qxd6 Qa5 Bd2 Nd4 Nd5",
 "White's queen on d6 and king on e1 are both within reach of a knight on e4.",
 ("Qxd2+ Kxd2 Nxe4+ Kc1 Nxd6","The king goes to c1","Give your queen, then the knight fork wins White's."),
 ("Qxd2+ Kxd2 Nxe4+ Kd3 Nxd6","The king goes to d3","Give your queen, then the knight fork wins White's."))
trap("m159","Closed Sicilian Royal Fork","Sicilian Defense (Closed)",SIC,"w",1,
 "e4 c5 Nc3 Nc6 Nf3 d6 Bb5 Qb6 Nd5 Qxb5",
 "Black's queen took your bishop. Its king and queen are now a knight's fork apart.",
 ("Nc7+ Kd7 Nxb5","The king steps to d7","The knight forks king and queen."),
 ("Nc7+ Kd8 Nxb5","The king steps to d8","The knight forks king and queen."))
trap("m160","Taimanov f2 Mate Threat","Sicilian Defense (Taimanov)",SIC,"b",2,
 "e4 c5 Nf3 Nc6 Nc3 e6 d4 cxd4 Nxd4 Bc5 Ndb5 Qb6 Na4",
 "White's knight attacked your queen, but f2 and the white king are wide open.",
 ("Bxf2+ Ke2 Qxb5+ Kxf2 Qxa4","The king steps to e2","The checks win both white knights."),
 ("Bxf2+ Kd2 Qe3#","The king steps to d2","Queen to e3 is mate."))
