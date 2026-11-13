# Batch 12: more traps from the resumed wide search (second night). All lines validated with Stockfish.
SCA="Scandinavian"
trap("w103","King's Gambit e-File Pin","King's Gambit Declined",OG,"w",2,
 "e4 e5 f4 Nc6 Nf3 d5 exd5 Qxd5 fxe5 Nxe5",
 "Black's knight recaptured on e5, on the same file as Black's king.",
 ("Qe2 f6 d4","Black defends the knight","Qe2 pinned the knight to the king. d4 attacks it and it can't move."))
trap("w104","Duras Gambit Bishop Check","Duras Gambit (1.e4 f5)",OE,"w",1,
 "e4 f5 exf5 Nf6 Be2 d5",
 "Black's ...f5 opened the e8–h5 diagonal, and nothing has closed it.",
 ("Bh5+ g6 fxg6","Black blocks with ...g6","Take on g6. The pawn hits h7 and the h8 rook."),
 ("Bh5+ Kd7","The king steps up","Black can't castle and the king is stuck in the centre. Develop with Nf3 or Nc3."))
trap("w105","Halloween Discovered Attack","Four Knights Game (Halloween setup)",OG,"b",2,
 "e4 e5 Nf3 Nc6 Nc3 Bc5 Nxe5 Nxe5 d4 Bxd4 Qxd4 Qf6 Nd5",
 "White's knight attacks your queen and c7. Your e5 knight can move with check.",
 ("Nf3+ gxf3 Qxd4","White takes the knight","The check uncovered your queen on d4. You win the queen for a knight."))
trap("w106","Benoni Long-Diagonal Raid","Benoni Defense (Blumenfeld setup)",OD,"b",1,
 "d4 c5 d5 e6 c4 b5 b3",
 "White's b3 left the a1 rook on the long diagonal.",
 ("Qf6 Na3 Qxa1","White blocks","Your queen hits the a1 rook. Take it."))
trap("w107","Italian c2 Fork","Italian Game (Giuoco Pianissimo)",OG,"b",2,
 "e4 e5 Nf3 Nc6 Bc4 Bc5 d3 d6 Ng5 Nh6 Qf3 O-O Nh3",
 "White's queen and knight have wandered to the kingside, and c2 is weak.",
 ("Nd4 Qg3","The queen retreats","Nd4 hits c2. Nxc2+ next forks king and rook."))
trap("w108","Ruy Lopez Back-Rank Mate","Ruy López (Steinitz Defense)",OG,"b",1,
 "e4 e5 Nf3 Nc6 Bb5 d6 Bxc6+ bxc6 d4 Bg4 dxe5 dxe5 Qxd8+ Rxd8 Nxe5",
 "White grabbed the e5 pawn. Look at White's king and the d-file.",
 ("Rd1#","Mate","The rook mates on d1. Your g4 bishop covers e2."))
trap("w109","Bishop's Opening ...Qf6 Fork","Bishop's Opening (Petrov setup)",OG,"b",2,
 "e4 e5 Bc4 Nf6 Nf3 Nxe4 Nxe5 Qf6 Bxf7+",
 "White checked with the bishop. Don't take it: White's knight on e5 is the real target.",
 ("Kd8 O-O Qxe5","White castles","Take the knight. You've won a piece for two pawns."))
trap("w110","Scandinavian c2 Raid","Scandinavian Defense",SCA,"b",1,
 "e4 d5 exd5 Qxd5 Nc3 Qe6+ Be2 Qg6 g3 Bf5 Nf3",
 "Your queen and bishop both look at c2, and only White's queen defends it.",
 ("Bxc2 Qxc2 Qxc2","White takes the bishop","Your queen takes back on c2. You've won the queen for a bishop."))
trap("w111","Sicilian e3 Strike","Sicilian Defense (Taimanov)",SIC,"b",2,
 "e4 c5 Nf3 Nc6 d4 cxd4 Nxd4 e6 Nc3 Bc5 Be3 Qb6 Nxc6",
 "White took your knight, but the e3 bishop is attacked twice.",
 ("Bxe3 fxe3 Qxe3+ Qe2 Qxe2+ Bxe2","White recaptures","You take e3 with check and trade queens. Then recapture on c6: you come out a pawn ahead."))
trap("w112","Scotch Gambit Mate","Scotch Gambit",OG,"w",2,
 "e4 e5 Nf3 Nc6 d4 exd4 Ng5 Be7 Nxf7 Kxf7 Bc4+ Ke8 Qh5+ g6 Qd5 d6",
 "Black's king is stuck on e8 and f7 is covered twice.",
 ("Qf7+ Kd7 Be6#","The king runs","The bishop mates on e6."))
trap("w113","Philidor Endgame Fork","Philidor Defense",OG,"w",1,
 "e4 e5 Nf3 d6 d4 Nf6 dxe5 dxe5 Qxd8+ Kxd8 Nxe5 Nxe4",
 "Black took your e4 pawn. The black king and h8 rook are both near f7.",
 ("Nxf7+ Ke8 Nxh8","The king steps back","The knight takes f7 with check and then the h8 rook."))
trap("w114","French Queen Trap","French Defense",FR,"w",1,
 "d4 e6 e4 Qf6 e5 Qf5",
 "Black's queen is on f5 and has very few squares.",
 ("Bd3 Qxd3 Qxd3","Black takes the bishop","The bishop attacked the queen and it had nowhere safe to go. You win it for a bishop."))
trap("w115","Two Knights Zwischenzug","Two Knights Defense",OG,"w",2,
 "e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 Nxd5 Nc3 Nxc3",
 "Black took your knight. Before recapturing, find a check.",
 ("Bxf7+ Ke7 bxc3","The king steps up","Bxf7+ first wins a pawn and drives the king out. Then recapture on c3."))
trap("w116","Centre Game Knight Fork","Centre Game",OG,"b",1,
 "e4 e5 d4 exd4 Qxd4 Nc6 Qc3 Bb4 Qxb4 Nxb4 c3",
 "White kicked your knight with c3. Where can it go?",
 ("Nc2+ Kd1 Nxa1","The king steps aside","The knight forks king and rook."))
trap("w117","Elephant e-File Pin","Elephant Gambit",OG,"b",2,
 "e4 e5 Nf3 d5 exd5 e4 Qe2 Nf6 Nc3 Be7 Nxe4 O-O Nxf6+ Bxf6 c4",
 "White's queen and king are on the e-file, and it's open.",
 ("Re8 d4 Rxe2+ Bxe2","White ignores it","Re8 pinned the queen to the king. Take it."))
trap("w118","Philidor f7 Raid","Philidor Defense",OG,"w",2,
 "e4 e5 Nf3 d6 Bc4 h6 d4 Bg4 dxe5 dxe5",
 "Black's g4 bishop is undefended and f7 is weak.",
 ("Bxf7+ Ke7 Qxd8+ Kxd8 Nxe5","The king steps up","Bxf7+ and the queen trade clear the way: Nxe5 hits the g4 bishop and f7 support. You're two pawns up."))
trap("w119","Scandinavian Queen Trap","Scandinavian Defense",SCA,"w",2,
 "e4 d5 exd5 Qxd5 Nc3 Qa5 d4 Nf6 Bd2 Qb6 Nf3 Qxb2",
 "Black's queen grabbed b2. It's deep in your half with few squares.",
 ("Rb1 Qb6 Rxb6","The queen runs back","Rb1 hit the queen and its retreat lands on the rook's file. Take it."))
trap("w120","Wayward Queen Discovery","King's Pawn (Wayward Queen Attack)",OE,"b",1,
 "e4 e5 Qh5 Nc6 Bc4 Qe7 Nf3 Nf6 Qh3",
 "White's queen retreated to h3, on the c8–h3 diagonal.",
 ("d5 Qxc8+ Rxc8","White takes the bishop","...d5 opened your bishop onto the queen. You win the queen for a bishop."))
trap("w121","Philidor Long-Diagonal Strike","Philidor Defense",OG,"w",1,
 "e4 d6 Nf3 Bg4 Be2 Bxf3 Bxf3 Nf6",
 "Your bishop on f3 points at b7. Only the e-pawn is in the way.",
 ("e5 dxe5 Bxb7","Black takes the pawn","The bishop takes b7 and hits the a8 rook."))
trap("w122","Danish Long-Diagonal Fork","Danish Gambit",OG,"b",2,
 "e4 e5 d4 exd4 c3 dxc3 Bc4 Qf6 Nxc3 Bb4 Nf3",
 "White developed and left the c3 knight pinned to the a1 rook's diagonal.",
 ("Bxc3+ bxc3 Qxc3+ Nd2 Qxa1","White recaptures","Take on c3, then the queen checks and forks the a1 rook."))
trap("w123","French b2 Grab","French Defense (Advance, Milner-Barry)",FR,"b",2,
 "e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3 Qb6 Bd3 Bd7 O-O cxd4 cxd4 Nxd4 Be3",
 "White left b2 to defend d4 with the bishop. Remove the f3 knight first.",
 ("Nxf3+ Qxf3 Qxb2","White recaptures","The trade drew the queen away. Take b2: the a1 rook is next."))
trap("w124","Ruy Lopez Bishop Trap","Ruy López (Classical)",OG,"w",2,
 "e4 e5 Nf3 Nc6 Bb5 Bc5 O-O d6 c3 Bd7 d4 exd4 cxd4 Bb4",
 "Black's bishop went to b4. Pin the knight, then trap it.",
 ("Qa4 Nge7","Black defends","The bishop on b4 has no way out. a3 or d5 next wins material."))
trap("w125","Bishop's Opening Queen Trade","Bishop's Opening",OG,"b",1,
 "e4 e5 Bc4 Qg5 Qf3 Nf6 d3",
 "White's d3 opened the diagonal between your queen and the c1 bishop, and nothing defends it.",
 ("Qxc1+ Qd1","White blocks","Take the bishop, then trade queens on d1. You're a piece up."))
