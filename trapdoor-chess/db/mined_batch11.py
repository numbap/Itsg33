# Batch 11: the rest of the wide local search. All lines validated with Stockfish.
SCA="Scandinavian"
trap("w070","Englund Qa3 Fork","Englund Gambit",OD,"w",2,
 "d4 e5 dxe5 Nc6 Nf3 Qe7 Bf4 Qb4+ Bd2 Qxb2 Nc3 Qa3",
 "Black's queen grabbed b2 and retreated to a3. c7 has no defender.",
 ("Nb5 Qc5 Nxc7+ Kd8 Nxa8","The queen runs to c5","The knight hits the queen and c7 at once. Nxc7+ forks king and rook."))
trap("w071","Scotch Discovered Attack","Scotch Game",OG,"b",2,
 "e4 e5 Nf3 Nc6 d4 Qf6 d5 Nd4 Bg5",
 "White's bishop attacks your queen. Your knight can move with check and uncover it.",
 ("Nxf3+ Qxf3 Qxg5","White recaptures","Nxf3+ forced the recapture, so the bishop on g5 hangs. You've won a piece."))
trap("w072","Italian Qh5+ Fork","Italian Game",OG,"w",1,
 "e4 e5 Nf3 Nc6 Bc4 f6 d4 exd4 Nxd4 Bc5",
 "Black played ...f6, which opened the e8–h5 diagonal, and the c5 bishop is undefended.",
 ("Qh5+ g6 Qxc5","Black blocks","The check forks the king and the c5 bishop."))
trap("w073","Blackburne Shilling: Ng4","Italian Game (Blackburne Shilling)",OG,"b",2,
 "e4 e5 Bc4 Nc6 Nf3 Nd4 Nxe5 Qg5 Ng4",
 "White's knight retreated to g4 to block your queen. Look at the c8 bishop.",
 ("d5 Ne3 dxc4","White saves the knight","The pawn forked bishop and knight while opening your bishop onto g4. You win a piece."))
trap("w074","Italian Qf6 Punished","Italian Game",OG,"w",1,
 "e4 e5 Nf3 Nc6 Bc4 Qf6 Nc3 Bb4",
 "Black's queen and bishop are both on squares your knight can reach.",
 ("Nd5 Qd8 Nxb4","The queen retreats","Nd5 hit the queen and the b4 bishop. Take the bishop."))
trap("w075","Bishop's Opening Queen Fork","Bishop's Opening",OG,"b",1,
 "e4 e5 Bc4 Qh4 g3",
 "White kicked your queen with g3. Where is it safe, and what does it hit?",
 ("Qxe4+ Kf1 Qxc4+ Kg2","White steps aside","The check forks the king, the c4 bishop and the h1 rook. Take the bishop."),
 ("Qxe4+ Kf1 Qxh1","White steps aside","The check forks the king, the c4 bishop and the h1 rook. Take the rook."))
trap("w076","Four Knights c7 Fork","Four Knights Game (Halloween setup)",OG,"w",2,
 "e4 e5 Nf3 Nc6 Nc3 Bc5 Nxe5 Nxe5 d4 Bxd4 Qxd4 Qe7",
 "Black's queen left c7 and g7 without protection.",
 ("Nd5 Nc6 Nxc7+ Kd8 Qxg7","The knight attacks your queen","Nxc7+ forks king and rook, and the queen takes g7 too."),
 ("Nd5 Nc6 Qxg7","The knight attacks your queen","Ignore it: Qxg7 hits the h8 rook, and Nxc7+ is still coming."))
trap("w077","Danish Qb4+ Fork","Danish Gambit",OG,"b",1,
 "e4 e5 d4 exd4 c3 dxc3 Bc4 cxb2 Bxb2 Qe7 e5",
 "White pushed e5, so the b2 bishop is no longer defended along the long diagonal.",
 ("Qb4+ Nd2 Qxb2","White blocks","The check forks the king and the b2 bishop."))
trap("w078","London c2 Fork","London System",OD,"b",1,
 "d4 d5 Bf4 Nc6 e3 Bf5 Nf3 Nb4 c3",
 "White kicked your knight with c3. Where can it go?",
 ("Nc2+ Ke2 Nxa1","The king steps up","Your bishop on f5 covers c2. The knight forks king and rook."),
 ("Nc2+ Kd2 Nxa1","The king steps up","Your bishop on f5 covers c2. The knight forks king and rook."))
trap("w079","Scotch Pin and Fork","Scotch Game",OG,"b",2,
 "e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Qf6 Nxc6 Qxc6 Nc3 Bb4 Bb5",
 "White's bishop attacks your queen, but the c3 knight is what holds White together.",
 ("Bxc3+ bxc3 Qxb5","White recaptures","Take on c3 with check first, then your queen takes the bishop."))
trap("w080","Scandinavian c2 Attack","Scandinavian Defense",SCA,"b",2,
 "e4 d5 exd5 Nf6 d4 Nxd5 c4 Nb4 Nc3",
 "White's c2 is covered only by the queen. Add an attacker.",
 ("Bf5 Be3 Nc2+ Ke2","White develops","Nc2+ forks king and rook. Take the e3 bishop or the a1 rook next."))
trap("w081","Wayward Queen Pinned","King's Pawn (Wayward Queen Attack)",OE,"b",1,
 "e4 e5 Qh5 Nf6 Qxe5+ Be7 d3 Nc6 Qc3",
 "White's queen retreated to c3, in front of the king.",
 ("Bb4 Bd2 Bxc3","White blocks the pin","Bb4 pinned the queen to the king. Take it."))
trap("w082","English Long-Diagonal Raid","English Opening",FL,"w",1,
 "c4 e5 g3 d6 Bg2 Be6",
 "Black's bishop went to e6, leaving b7 and the a8 rook on your bishop's diagonal.",
 ("Bxb7 Nd7 Bxa8","Black defends","The bishop takes b7 and then the a8 rook."))
trap("w083","Italian Qe1+ Fork","Italian Game (Giuoco Piano)",OG,"w",2,
 "e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d4 exd4 cxd4 Bb4+ Nc3 Nxe4 O-O Bxc3 bxc3 Nxc3",
 "Black's knight grabbed c3 and left the e-file open to the king.",
 ("Qe1+ Ne7 Qxc3","Black blocks","The check forks the king and the c3 knight."))
trap("w084","Sicilian Queen Grab","Sicilian Defense",SIC,"b",1,
 "e4 c5 Nf3 Nc6 d4 cxd4 Nxd4 Qb6 Nc3",
 "White developed the knight but forgot that your queen is attacking d4.",
 ("Qxd4 Qe2","White doesn't recapture","The d4 knight was attacked twice (queen and c6 knight) and defended only once. You're a piece up."))
trap("w085","Italian Qd5 Double Attack","Italian Game (...f6)",OG,"w",2,
 "e4 e5 Nf3 Nc6 d4 f6 dxe5 fxe5 Bc4 Bc5",
 "Black's knight is the only thing guarding the light squares around the king.",
 ("Bxg8 Rxg8 Qd5","Black recaptures","Qd5 forks the g8 rook and the c5 bishop."))
trap("w086","Latvian Knight Trap","Latvian Gambit",OG,"b",2,
 "e4 e5 Nf3 f5 Nxe5 Qf6 Qh5+",
 "White checked, hoping to win your h8 rook with a knight sacrifice.",
 ("g6 Nxg6 hxg6","White sacrifices on g6","Take the knight. Your h8 rook now defends along the h-file and the queen on h5 is attacked."),
 ("g6 Qh3 Qxe5","The queen retreats","The e5 knight lost its support. Take it."))
trap("w087","English Rook Raid","English Opening",FL,"b",1,
 "c4 e5 g3 d5 cxd5 Qxd5 Nc3",
 "White played g3 but hasn't developed the bishop. Look along the long diagonal.",
 ("Qxh1 d4 Qxg1","White attacks","Take the h1 rook, then the g1 knight."))
trap("w088","Dragon Queen Trap","Sicilian Defense (Dragon)",SIC,"w",3,
 "e4 c5 Nf3 Nc6 d4 cxd4 Nxd4 g6 Nc3 Bg7 Be3 Nf6 f3 Qb6",
 "Black's queen eyes b2. Let it take.",
 ("Nf5 Qxb2 Na4","Black takes b2","Na4 traps the queen."),
 ("Nf5 Qxb2 Nxg7+","Black takes b2","Nxg7+ wins the bishop first, and the queen is still in trouble."))
trap("w089","Italian Re1 Punished","Italian Game (Giuoco Piano)",OG,"b",2,
 "e4 e5 Nf3 Nc6 Bc4 Bc5 O-O Nf6 c3 Nxe4 Re1",
 "White's rook attacks your knight, but f2 is weak.",
 ("Bxf2+ Kh1","The king steps aside","Bxf2+ forked the king and the e1 rook. Take the rook next."))
trap("w090","Nimzo Bishop Trap","Nimzo-Indian (QGD)",QG,"w",1,
 "d4 d5 c4 e6 Nc3 Bb4 a3 Ba5",
 "Black's bishop retreated to a5. It has very few squares.",
 ("b4 c5 bxa5","Black counterattacks","The bishop has nowhere to go. Take it."))
trap("w091","Centre Game Pin","Centre Game",OG,"w",1,
 "e4 e5 d4 exd4 Qxd4 Nc6 Qe3 Nf6 e5 Qe7",
 "Black pinned your e5 pawn to the queen. The knight on f6 is still attacked.",
 ("exf6 Qxe3+ Bxe3","Black trades queens","Take the knight. You're a piece up."),
 ("exf6 Qxe3+ fxe3","Black trades queens","Take the knight. You're a piece up."))
trap("w092","Philidor Bishop Skewer","Philidor Defense",OG,"w",2,
 "e4 e5 Nf3 d6 Bb5+ c6 Ba4 b5 Bb3 c5",
 "Black's queenside pawns rushed forward and left the long diagonal open.",
 ("Bd5 Na6 Bxa8","Black blocks","The bishop lands on d5 and takes the a8 rook."))
trap("w093","Austrian Long-Diagonal Fork","Queen's Gambit (Austrian Defense)",QG,"b",1,
 "d4 d5 c4 c5 dxc5 e6 b4",
 "White defended c5 with b4. What did that leave on the long diagonal?",
 ("Qf6 Qc2 Qxa1","White defends","Your queen hits the a1 rook. Take it."))
trap("w094","Scandinavian Deflection","Scandinavian Defense",SCA,"w",2,
 "e4 d5 exd5 Qxd5 Nc3 Qa5 Nf3 Nf6 Bd3 Bf5",
 "Black's bishop on f5 is defended only by the queen on a5.",
 ("b4 Qxb4 Bxf5","Black takes the pawn","b4 lured the queen off the fifth rank. The bishop takes f5."))
trap("w095","Scandinavian Endgame Fork","Scandinavian Defense",SCA,"b",1,
 "e4 d5 exd5 Qxd5 d4 Nc6 Nc3 Qxd4 Qxd4 Nxd4 Be3",
 "White attacked your knight, but c2 is open.",
 ("Nxc2+ Kd2","The king steps up","The knight forks king and rook. Take a1 next."))
trap("w096","From's Gambit h3 Mate","Bird Opening (From's Gambit)",FL,"b",1,
 "f4 e5 fxe5 d6 exd6 Bxd6 Nf3 g5 h3",
 "White played h3 instead of guarding g3.",
 ("Bg3#","Mate","The bishop mates on g3."))
trap("w097","Sicilian Bishop Trap","Sicilian Defense",SIC,"b",2,
 "e4 c5 Nf3 e6 Bc4 a6 O-O b5 Bb3",
 "White's bishop retreated to b3. Your c-pawn can shut it in.",
 ("c4 d4","White frees a square","The bishop is trapped. Take it next move."))
trap("w098","Alekhine Qb3 Double Attack","Alekhine Defense",OE,"w",1,
 "e4 Nf6 e5 Nd5 c4 Nb6 c5 Nd5 Bc4 Nb4",
 "Black's knight is on b4 and f7 is weak. One queen move hits both.",
 ("Qb3 e6 Qxb4","Black defends f7","Take the knight."))
trap("w099","Bishop's Opening Discovered Attack","Bishop's Opening",OG,"w",2,
 "e4 e5 Bc4 Nf6 d3 d5 exd5 Nxd5 Nf3 Nf4",
 "Black's knight went to f4, where your c1 bishop can reach it.",
 ("Bxf7+ Kxf7 Nxe5+ Kg8 Bxf4","Black takes the bishop","Bxf7+ and Nxe5+ win two pawns with check, then the bishop takes f4."))
trap("w100","Sicilian b2 Grab","Sicilian Defense",SIC,"b",1,
 "e4 c5 Nf3 Nc6 Bc4 g6 d3 Bg7 Bg5",
 "White's bishop left c1, so b2 has no defender.",
 ("Bxb2 Nbd2 Bxa1","White develops","The bishop takes b2 and then the a1 rook."))
trap("w101","Alekhine Knight Trap","Alekhine Defense",OE,"w",1,
 "e4 Nf6 e5 Nd5 c4 Nb6 Nc3 Nc6",
 "Black's knight on b6 is short of squares.",
 ("c5 d5 cxb6","Black ignores it","c5 attacked the knight and it had nowhere to go."))
trap("w102","French Pawn Fork","French Defense",FR,"b",2,
 "e4 e6 d4 d5 Nc3 c5 dxc5 Bxc5 Be3",
 "White's bishop and knight are both one square from your d-pawn.",
 ("d4 Na4 Qa5+ Bd2 Qxa4","The knight runs to a4","d4 forked the bishop and knight. Qa5+ catches the knight."))
