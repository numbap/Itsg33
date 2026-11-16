# Batch 14: first traps from the low-popularity search (tree to move 8, rarer replies). Validated with Stockfish.
SCA="Scandinavian"
trap("w136","Bird's Defense: Bishop Left Hanging","Ruy López (Bird's Defense)",OG,"b",1,
 "e4 e5 Nf3 Nc6 Bb5 Nd4 Nxe5",
 "White grabbed e5 with the knight. What was that knight doing before?",
 ("Nxb5 Nxf7 Kxf7","White takes on f7","Take the knight. You're a piece up."),
 ("Nxb5 Qf3","White attacks f7","Defend with ...Qe7 or ...Qf6. You've won the b5 bishop and you're a piece for a pawn up."),
 ("Nxb5 Qh5","White attacks f7","Defend with ...Qe7 or ...Qf6. You've won the b5 bishop and you're a piece for a pawn up."),
 ("Nxb5 O-O","White castles","You've won the b5 bishop. Bring the knight back to d4 and you're a piece up."),soft=["Qg5","Qe7"])
trap("w137","Danish g7 Grab","Danish Gambit",OG,"w",1,
 "e4 e5 d4 exd4 c3 dxc3 Bc4 cxb2 Bxb2 Bc5",
 "Black developed the bishop instead of defending g7. Your b2 bishop rakes the long diagonal.",
 ("Bxg7 Qh4 Qf3","Black counterattacks","Defend f2 with the queen. The h8 rook is next."),
 ("Bxg7 d5 Bxd5","Black strikes back","Take the pawn. The h8 rook is still attacked."))
trap("w138","Halloween Queen Kick","Four Knights Game (Halloween setup)",OG,"w",1,
 "e4 e5 Nf3 Nc6 Nc3 Bc5 Nxe5 Nxe5 d4 Qe7",
 "Black's queen and bishop are both loose after your d4 fork.",
 ("Nd5 Qd8","The queen retreats","Nd5 kicked the queen. Now take the c5 bishop or the e5 knight: you're a piece up."))
trap("w139","Italian Knight Fork","Italian Game (Giuoco Pianissimo)",OG,"w",1,
 "e4 e5 Nf3 Nc6 Bc4 Bc5 d3 Nf6 Ng5 d6",
 "Black played ...d6 instead of castling or covering f7.",
 ("Nxf7 Qe7 Nxh8","Black saves the queen","The knight forked queen and rook. Take the h8 rook."),
 ("Nxf7 Bxf2+ Kxf2","Black takes on f2","Take the bishop. The knight still forks queen and rook."))
trap("w140","Sicilian Bb5+ Pin","Sicilian Defense (Kalashnikov setup)",SIC,"w",2,
 "e4 c5 Nf3 Nc6 d4 cxd4 Nxd4 e5 Nxc6 bxc6 Nc3 d5 exd5 cxd5",
 "Black's d5 pawn is defended only by the queen.",
 ("Bb5+ Bd7 Qxd5","Black blocks","The check forced a block, and the d5 pawn falls with the a8 rook in view."))
trap("w141","Dutch h-File Mate","Dutch Defense (Korchnoi Attack)",OD,"w",2,
 "d4 f5 h3 Nf6 g4 fxg4 hxg4 Nxg4 Qd3 Nf6",
 "The h-file is open and your queen is aimed at g6.",
 ("Rxh7 Rxh7 Qg6#","Black takes the rook","The queen mates on g6."),
 ("Rxh7 e5","Black opens the bishop","You're a rook up for nothing. Take the h8 rook or check on g6."))
trap("w142","Grob f7 Strike","Grob Opening",FL,"w",2,
 "g4 d5 Bg2 Bxg4 c4 e6 Qb3 b6 cxd5 exd5 Bxd5 c6",
 "Black kicked your bishop, but f7 is defended only by the king.",
 ("Bxf7+ Ke7 Bxg8","The king steps up","Take f7 with check, then the g8 knight."),
 ("Bxf7+ Kd7 Bxg8","The king steps up","Take f7 with check, then the g8 knight."))
trap("w143","Max Lange Knight Pin","Two Knights Defense (Max Lange setup)",OG,"w",2,
 "e4 e5 Nf3 Nc6 d4 exd4 Bc4 Nf6 e5 Ne4 c3 dxc3",
 "Black's knight on e4 is attacked and defended by nothing.",
 ("Qd5 Qe7 Qxe4","Black pins your e5 pawn","Qd5 hit the e4 knight and threatened f7. Take the knight."))
trap("w144","Modern Scholar's Attack","Modern Defense",OE,"w",1,
 "e4 g6 Qf3 Bg7 Bc4 d6",
 "Black ignored your queen and bishop aiming at f7.",
 ("Qxf7+ Kd7 Qxg7","The king runs","Take f7 with check, then the g7 bishop. The h8 rook is next."),
 ("Qxf7+ Kd7 Be6+","The king runs","Be6+ drives the king further out. Qxg7 is coming too."))
trap("w145","Caro-Kann Queen Fork","Caro-Kann Defense",CK,"w",1,
 "e4 c6 d4 d5 Nc3 dxe4 Nxe4 Nf6 Qd3 Bf5",
 "Black's bishop attacks your queen. Answer with a check.",
 ("Nxf6+ exf6 Qxf5","Black recaptures","Nxf6+ forced the recapture, and your queen takes the bishop."))
trap("w146","King's Gambit Pawn Trap","King's Gambit Accepted",OG,"w",1,
 "e4 e5 f4 Nc6 Nf3 exf4 d4 Nf6 e5 Nd5 c4 Nb6",
 "Black's knight retreated to b6. Your pawns can trap it.",
 ("c5 g5","Black defends f4","The knight on b6 has nowhere to go. Take it next move."),soft=["d5"])
trap("w147","Sicilian Bxf6 Punished","Sicilian Defense (Pin Variation)",SIC,"b",2,
 "e4 c5 Nf3 e6 d4 cxd4 Nxd4 Nf6 Nc3 Bb4 Bg5 Qa5 Bxf6",
 "White took your knight. Don't recapture yet: the c3 knight is pinned.",
 ("Bxc3+ bxc3 Qxc3+ Ke2 gxf6","White recaptures","Take on c3 with check, then the queen checks again and you recapture on f6. You've won a pawn and White's king is stuck."))
trap("w148","Caro-Kann Two Knights Pin","Caro-Kann (Two Knights)",CK,"w",1,
 "e4 c6 Nc3 d5 Qf3 Nf6 e5 Bg4",
 "Black's bishop attacks your queen. Find a move that saves it and keeps the pressure on f6.",
 ("Qg3 h5 exf6","Black chases the queen","The pawn takes the f6 knight."))
trap("w149","Italian Desperado","Italian Game (Giuoco Piano)",OG,"b",2,
 "e4 e5 Nf3 Nc6 Bc4 Bc5 O-O d6 c3 Be6 d4",
 "White attacked your bishop. Trade first, then save it.",
 ("Bxc4 dxc5 Bxf1","White takes your bishop","Your bishop takes the f1 rook. You've won the exchange."),
 ("Bxc4 Re1 exd4","White saves the rook","You're a piece up: White's bishop is gone and your bishop is safe."))
trap("w150","Pirc Queen Trap","Pirc Defense",OE,"w",3,
 "e4 d6 Nf3 Nf6 Nc3 g6 d4 Bg7 Bc4 Nbd7",
 "Black's knight blocked the d8 queen's escape squares.",
 ("e5 Ng4 Bxf7+ Kxf7 Ng5+ Kg8 Ne6","The knight runs to g4","Bxf7+ and Ng5+ bring the knight to e6, trapping the queen."),soft=["Bxf7+"])
trap("w151","Max Lange Knight Trap","Two Knights Defense (Max Lange)",OG,"w",1,
 "e4 e5 Nf3 Nc6 Bc4 Bc5 O-O Nf6 d4 exd4 e5 Nh5",
 "Black's knight went to the rim at h5.",
 ("Ng5 d5 Qxh5","Black hits your bishop","Ng5 cleared the d1–h5 diagonal. Take the knight."),
 ("Ng5 d5 exd6","Black hits your bishop","Take en passant first. The h5 knight is still loose."))
trap("w152","Elephant e-File Pin II","Elephant Gambit",OG,"b",1,
 "e4 e5 Nf3 d5 exd5 e4 Qe2 Qe7 d3",
 "White's knight on f3 is attacked by your pawn. Look at the e-file.",
 ("exf3 Qxe7+ Nxe7","White trades queens","Your pawn took the knight. You're a piece up."),
 ("exf3 Qxe7+ Bxe7","White trades queens","Your pawn took the knight. You're a piece up."),
 ("exf3 gxf3","White takes back with the pawn","You're a piece up. Develop with ...Nf6."))
trap("w153","Sicilian Queen Raid","Sicilian Defense",SIC,"w",1,
 "e4 c5 Qh5 b6 Bc4 g6",
 "Black kicked your queen, but the long diagonal to a8 is open.",
 ("Qd5 e6 Qxa8","Black defends f7","Qd5 hit f7 and a8 together. Take the rook."))
trap("w154","Danish Promotion Fork","Danish Gambit",OG,"b",1,
 "e4 e5 d4 exd4 c3 dxc3 Bc4 Bb4 Qb3",
 "White's queen left d1, and your c3 pawn is one step from the a1 rook.",
 ("cxb2+ Nc3 bxa1=Q","White blocks","...cxb2+ is a discovered check from your bishop. The pawn promotes on a1."))
trap("w155","Caro-Kann f7 Strike","Caro-Kann (Two Knights)",CK,"w",1,
 "e4 c6 Nc3 d5 Qf3 dxe4 Nxe4 Nf6 Bc4 Nxe4",
 "Black took your knight. Your queen and bishop both aim at f7.",
 ("Bxf7+ Kd7 Qxe4","The king steps up","Take f7 with check, then win back the knight."))
trap("w156","Caro-Kann Skewer","Caro-Kann Defense (Advance)",CK,"b",1,
 "e4 c6 d4 d5 e5 Bf5 Qf3 e6 g4",
 "White's queen and h1 rook are on the same long diagonal.",
 ("Be4 Qb3 Bxh1","The queen moves","Be4 skewered the queen and rook. Take the rook."))
trap("w157","Budapest f2 Strike","Budapest Gambit",ID,"b",2,
 "d4 Nf6 c4 e5 d5 Bc5 Nc3 O-O Bg5",
 "White's bishop went to g5, and f2 is weak.",
 ("Bxf2+ Kxf2 Ng4+ Ke1 Qxg5","White takes the bishop","Bxf2+ and Ng4+ uncover your queen onto the g5 bishop. You win back the piece with a pawn extra."))
trap("w158","Larsen Discovered Attack","Nimzo-Larsen Attack",FL,"w",2,
 "b3 e5 Bb2 Nc6 Nf3 e4 Nd4 Bc5",
 "Your d4 knight blocks the bishop's long diagonal.",
 ("Nxc6 dxc6 Bxg7","Black recaptures","Nxc6 opened the diagonal. The bishop takes g7 and hits the h8 rook."))
trap("w159","Wayward Queen Counterattack","King's Pawn (Wayward Queen Attack)",OE,"b",1,
 "e4 e5 Qh5 Nc6 Bc4 Qf6 Nc3 Bc5 Nd5",
 "White's knight attacks your queen and c7. Your queen and bishop both hit f2.",
 ("Qxf2+ Kd1","The king steps aside","Take f2 with check. White's king is stuck and g2 is next."))
trap("w160","French Queen Trap II","French Defense (London setup)",FR,"w",2,
 "d4 e6 Nc3 d5 Bf4 c5 e3 Nc6 Nf3 Qb6",
 "Black's queen went to b6. Your knight and bishop can cut it off.",
 ("Nb5 cxd4 Bc7","Black takes on d4","Bc7 hits the queen, and Nb5 covers its escape squares."),
 ("Nb5 cxd4 Nc7+","Black takes on d4","Nc7+ forks the king and the a8 rook."))
trap("w161","Scandinavian Queen Cage","Scandinavian Defense",SCA,"w",2,
 "e4 d5 exd5 Qxd5 Nc3 Qe6+ Be2 Qg6 Nf3 Qxg2 Rf1 Bh3",
 "Black's queen grabbed g2 and the bishop guards it. But the queen has few squares.",
 ("Rg1 Nf6","Black develops","Rg1 traps the queen on g2. Take it next move."))
trap("w162","Slav Queen Swap Trick","Slav Defense (Exchange)",QG,"w",1,
 "d4 c6 c4 d5 Nc3 Bf5 cxd5 cxd5 Qb3 Qb6",
 "Black defended b7 with the queen and left d5 with one defender.",
 ("Nxd5 Qxb3 axb3","Black trades queens","You took d5 for free. The knight also threatens Nc7+."),soft=["Qxb6"])
trap("w163","Berlin Discovered Check","Ruy López (Berlin)",OG,"w",1,
 "e4 e5 Nf3 Nc6 Bb5 Nf6 O-O Nxe4 Re1 Nd6 Nxe5 Nxb5",
 "Black took your bishop. Black's king is on the e-file with your rook behind the knight.",
 ("Nxc6+ Be7 Nxd8","Black blocks","Nxc6+ was a discovered check and the knight hits the queen. Take it."))
trap("w164","Scandinavian Knight on the Rim","Scandinavian Defense",SCA,"b",1,
 "e4 d5 Nc3 d4 Na4 e5 d3",
 "White's knight is stuck on a4.",
 ("b5 Nf3","White develops","b5 attacks the knight and it has no safe square. Take it next move."))
trap("w165","Englund c2 Mate","Englund Gambit",OD,"b",2,
 "d4 e5 dxe5 Nc6 Nf3 Qe7 Bf4 Qb4+ Bd2 Qxb2 Bc3 Bb4 Bxb4 Nxb4 Qd4",
 "White's queen left d1, and c2 is guarded only by it.",
 ("Qc1+ Qd1 Nxc2#","White blocks","The knight mates on c2."))
trap("w166","Caro-Kann Queen Fork II","Caro-Kann Defense",CK,"b",1,
 "e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Bd3 Bxe4 Bxe4 Nf6 Bf5",
 "White's bishop retreated to f5, where nothing defends it.",
 ("Qa5+ Bd2 Qxf5","White blocks","The check forked the king and the f5 bishop."))
