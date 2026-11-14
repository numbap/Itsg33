# Batch 13: the last traps from the wide local search (whole opening tree searched). Validated with Stockfish.
SCA="Scandinavian"
trap("w126","Bishop's Opening Queen Raid Punished","Bishop's Opening",OG,"w",2,
 "e4 e5 Bc4 Qg5 Nf3 Qxg2",
 "Black's queen grabbed g2 and attacks your h1 rook. Counterattack it.",
 ("Rg1 Qh3 Bxf7+ Kd8","The queen retreats to h3","Bxf7+ drove the king out. Black's queen is short of squares too: Rg3 or d4 next and Black is lost."),
 ("Rg1 Qxg1+ Nxg1","Black gives up the queen","The queen took the rook and was lost for it. You're a queen for a rook up."))
trap("w127","Queen Shuffle c2 Fork","King's Pawn (Napoleon Opening)",OE,"b",1,
 "e4 e5 Qf3 Nc6 Bc4 Nf6 Qb3 d5 exd5",
 "White's queen wandered to b3 and c2 is guarded only by it.",
 ("Nd4 Qg3 Nxc2+ Kd1 Nxa1","The queen leaves b3","Nd4 hits the queen and c2. Nxc2+ forks king and rook."))
trap("w128","Danish Knight Rook Raid","Danish Gambit (...c5)",OG,"w",2,
 "e4 e5 d4 exd4 Nf3 c5 Bc4 h6 c3 dxc3",
 "Black's king is still in the middle and the h8 rook is defended only by the king.",
 ("Bxf7+ Kxf7 Ne5+ Ke7 Ng6+ Ke8 Nxh8","Black takes the bishop","The knight checks its way to g6 and takes the h8 rook."))
trap("w129","Albin Endgame Fork","Albin Countergambit",QG,"b",1,
 "d4 d5 c4 e5 Nc3 exd4 Qxd4 Nc6 Qxd5 Be6 Qxd8+ Rxd8 e3",
 "Queens are off. White's c2 is weak and your knight is close.",
 ("Nb4 Bd2 Nc2+ Kd1 Nxa1","White covers d1","The knight lands on c2 with check and takes the a1 rook."))
trap("w130","Queenless Back-Rank Mate","Pirc Defense (1.d4)",OD,"w",2,
 "d4 Nf6 Nc3 g6 Bf4 Bg7 e4 d6 e5 dxe5 dxe5 Qxd1+ Rxd1 Nh5 Nd5 Nxf4",
 "Black took your bishop. Your knight and rook are aimed at Black's king.",
 ("Nxc7+ Kf8 Rd8#","The king steps aside","The knight check drove the king to f8, and the rook mates on d8."))
trap("w131","English Knight Fork","English Opening",FL,"w",1,
 "c4 d5 cxd5 Qxd5 Nc3 Qc6 Nf3 Bg4",
 "Black's bishop pins your knight, but the knight can jump with tempo.",
 ("Ne5 Qe6 Qa4+ Nc6 Nxg4","The queen retreats","Ne5 hit the queen, Qa4+ forced a block, and the knight takes g4."))
trap("w132","Scandinavian Knight Trap","Scandinavian (Tennison Gambit)",SCA,"b",1,
 "e4 d5 Nf3 dxe4 Nh4 Nf6 Nc3",
 "White's knight is on the rim at h4.",
 ("g5 d4","White ignores it","The knight on h4 has no safe square. Take it next move."))
trap("w133","Ruy Lopez Queen Fork","Ruy López (Bird's Defense)",OG,"b",2,
 "e4 e5 Nf3 Nc6 Bb5 Nd4 Nxd4 exd4 d3 c6 Ba4 Qa5+ Bd2",
 "White blocked your check, but the a4 bishop is now loose.",
 ("Qxa4 O-O","White castles","The check forked the king and the a4 bishop. You're a piece up."))
trap("w134","QGA Pin on a6","Queen's Gambit Accepted",QG,"w",1,
 "d4 d5 c4 dxc4 Nc3 b5 Nxb5 Ba6 Nc3 Nc6",
 "Black's a6 bishop has no defender, and the c6 knight stands in front of the king.",
 ("Qa4 Qd7 Qxa6","Black defends the knight","Qa4 pinned the c6 knight and hit the a6 bishop. Take it."),soft=["Nf3"])
trap("w135","Polish Long-Diagonal Raid","Polish Opening",FL,"b",2,
 "b4 e5 b5 Bc5 a4",
 "White pushed queenside pawns and left the king's side and the a1 rook exposed.",
 ("Bxf2+ Kxf2 Qh4+ g3 Qd4+ e3 Qxa1","White takes the bishop","The queen checks its way to d4 and takes the a1 rook."))
