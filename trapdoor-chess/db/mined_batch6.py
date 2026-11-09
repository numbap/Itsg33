# Mined batch 6: the pattern filter allows a second example of each trap pattern in a new
# opening. All lines validated with Stockfish 16.
SCA="Scandinavian"

trap("m161","French Exchange c5 Bishop Trap","French Defense (Exchange)",FR,"w",1,
 "e4 e6 Nf3 d5 exd5 exd5 d4 Bd6 c4 Ne7",
 "Black's d6 bishop has very few squares. Club players walk into this in tens of thousands of games.",
 ("c5 Bxc5 dxc5","The bishop takes c5","The bishop is lost for a pawn."),
 ("c5 O-O","Black castles","The d6 bishop is trapped. Take it with cxd6 now, or develop first: it can't escape."),
 ("c5 Bxh2","The bishop grabs h2","It only gets a pawn. Take it with the knight, or just develop: it can't escape."))
trap("m162","London h5 Check","Queen's Pawn Game (London)",OD,"w",1,
 "d4 d5 Bf4 e6 e3 Bd6 Nf3 c6 Ne5 f6",
 "Black kicked your knight with ...f6 and opened the e8–h5 diagonal.",
 ("Qh5+ g6 Nxg6","Black blocks with ...g6","The knight takes g6, forking the queen and rook. The h-pawn is pinned."),
 ("Qh5+ Ke7 Qf7#","The king steps up","Mate on f7, guarded by the e5 knight."))
trap("m164","Vienna Queen Fork II","Vienna Game",OG,"b",2,
 "e4 e5 Nc3 Nf6 f4 d6 Nf3 Bg4 fxe5 dxe5 Bc4 Nc6 O-O",
 "White castled, leaving the c4 bishop and the g1–a7 diagonal unguarded.",
 ("Bxf3 Qxf3 Qd4+ Kh1 Qxc4","White recaptures with the queen","Qd4+ forks the king and the c4 bishop."),
 ("Bxf3 Rxf3 Qd4+ Kh1 Qxc4","White recaptures with the rook","Qd4+ forks the king and the c4 bishop."))
trap("m165","Petrov e-file Sacrifice","Petrov Defense (Italian Variation)",OG,"w",3,
 "e4 e5 Nf3 Nf6 Bc4 Nxe4 Qe2 d5 Nxe5 Bd6",
 "Black's e4 knight is pinned on the e-file. Strip away its defenders.",
 ("Nxf7 Kxf7 Bxd5+ Be6 Bxe6+ Kxe6","Black blocks with the bishop","The king ends up on e6, in front of its own pinned knight. You win it back with interest."),
 ("Nxf7 Kxf7 Bxd5+ Kf8 Bxe4","The king steps to f8","You've won back the piece with two extra pawns and a safer king."))
trap("m166","Three Knights f2 Fork II","Petrov Defense (Three Knights)",OG,"b",2,
 "e4 e5 Nf3 Nf6 Nc3 Bc5 Nxe5 Nc6 Nxc6 dxc6 Bc4 Ng4 f3",
 "White kicked your knight with f3, but f2 is now a hole next to the queen and rook.",
 ("Nf2 Qe2 Nxh1","White saves the queen","The knight takes the h1 rook."),
 ("Nf2 Bxf7+ Kxf7","White checks first","The desperado check doesn't help. Your knight still forks queen and rook."))
trap("m167","Nimzo-Larsen Knight Pin II","Nimzo-Larsen Attack (Classical)",FL,"b",3,
 "b3 c6 Bb2 d5 d4 Nf6 e4 e6 exd5 cxd5 Nf3 Nc6 Bb5",
 "White pinned your knight, but White's own king is still on e1.",
 ("Qa5+ Nc3 Bb4","White blocks with the knight","The c3 knight is pinned and attacked twice."))
trap("m168","Scandinavian Advance Légal","Scandinavian Defense (2.e5)",SCA,"w",2,
 "e4 d5 e5 c5 d4 Nc6 Nf3 Bg4 dxc5 Nxe5",
 "Black's knight took e5, trusting the pin on your f3 knight. Take it anyway.",
 ("Nxe5 Bxd1 Bb5+ Qd7 Bxd7+ Kd8","Black takes your queen","Bb5+ and Bxd7+ win the queen straight back. You're a piece up."),
 ("Nxe5 Qa5+ Bd2","Black checks first","Block the check. You're simply a knight up."))
trap("m169","QGA Queen Trap","Queen's Gambit Accepted",QG,"b",2,
 "d4 d5 c4 dxc4 e3 Nf6 Bxc4 Nc6 Qb3 e6 Nf3 Na5 Qb5+",
 "White's queen checked from b5 with very little room around it.",
 ("c6 Qa4 b5","The queen retreats to a4","…b5 hits the queen and the c4 bishop together. White loses a piece."))
trap("m170","Hartlaub Deflection","Englund Gambit (Hartlaub-Charlick)",OD,"b",2,
 "d4 e5 dxe5 d6 exd6 Bxd6 Nf3 Nf6 c3 Ng4 h3",
 "White kicked your knight. The d-file is open and the white queen is only guarded by the king.",
 ("Nxf2 Kxf2 Bg3+ Kxg3 Qxd1","White takes the bishop","Bg3+ drags the king away from the queen."),
 ("Nxf2 Kxf2 Bg3+ Kg1 Qxd1","The king steps aside","Bg3+ clears the d-file and the queen falls."))
trap("m171","Blackmar–Diemer Greek Gift","Blackmar–Diemer Gambit (Euwe)",QG,"w",3,
 "d4 d5 Nc3 e6 e4 dxe4 f3 exf3 Nxf3 Nf6 Bd3 Nc6 Be3 Bb4 O-O O-O Qe1 Nd5",
 "Black's knight left f6, so nothing guards h7. Your queen is ready to swing to h4.",
 ("Bxh7+ Kxh7 Ng5+ Kg8 Qh4","The king goes back","Qh4 threatens mate on h7. Black can't defend in time."),
 ("Bxh7+ Kxh7 Ng5+ Kg6 Nxf7","The king comes forward","The knight takes f7 with a fork and the king is stranded."),
 ("Bxh7+ Kh8 Bg5","Black declines the bishop","You're a pawn up with a crushing attack."))
trap("m172","Canard Qa4+ Fork","Canard Opening",OD,"w",2,
 "d4 Nf6 f4 c5 e3 d5 c3 b6 Bd3 Ba6 Nf3 e6",
 "Black offered a bishop trade. Make it, and the recapturing knight lands on the rim.",
 ("Bxa6 Nxa6 Qa4+ Qd7 Qxa6","Black blocks with the queen","Qa4+ forks the king and the a6 knight."),
 ("Bxa6 Nxa6 Qa4+ Nd7 Qxa6","Black blocks with the knight","Qa4+ forks the king and the a6 knight."))
trap("m173","Réti Qa4+ Fork","Réti Opening",FL,"w",1,
 "Nf3 d5 c4 c6 e3 Bg4 cxd5 cxd5 Be2 e6",
 "Black's bishop on g4 has no defender, and the a4–e8 diagonal is open.",
 ("Qa4+ Nc6 Qxg4","Black blocks with the knight","The check forks the king and the g4 bishop."),
 ("Qa4+ Nd7 Qxg4","Black blocks with the knight","The check forks the king and the g4 bishop."),
 ("Qa4+ Qd7 Bb5","Black blocks with the queen","Pin the queen with Bb5, or just take the bishop. Both win."),
 ("Qa4+ Qd7 Qxg4","Black blocks with the queen","Pin the queen with Bb5, or just take the bishop. Both win."))
trap("m175","Old Benoni e3 Mate","Benoni Defense (Old Benoni)",ID,"b",1,
 "d4 c5 Nf3 e6 Nc3 Nf6 Bg5 Qb6 dxc5 Bxc5 Bxf6",
 "White took your knight. Your queen and bishop are both aimed at f2.",
 ("Bxf2+ Kd2 Qe3#","The king's only move","Queen to e3 is mate."))
trap("m176","Black Mustang f2 Strike","Zukertort Opening (Black Mustang)",FL,"b",3,
 "Nf3 Nc6 g3 e5 d3 Nf6 Bg2 Bc5 O-O O-O Re1 d6 Nbd2",
 "White's rook left f1, so only the king guards f2.",
 ("Bxf2+ Kf1","The king steps to f1","You've won the f2 pawn with a big attack. Take the e1 rook or bring more pieces in."))
trap("m177","Accelerated Panov Knight Shot","Caro-Kann Defense (Accelerated Panov)",CK,"b",2,
 "e4 c6 c4 d5 cxd5 cxd5 exd5 Nf6 Nc3 Nxd5 d4 Nc6 Bc4 Be6 Nf3",
 "White's c4 bishop is defended only by the c3 knight. Remove it.",
 ("Nxc3 bxc3 Bxc4","White recaptures with the pawn","The c4 bishop has lost its defender. You win a piece."),
 ("Nxc3 Qb3 Bxc4","White counterattacks","You simply take the bishop."),
 ("Nxc3 Bxe6 Nxd1","White trades bishops","Your knight takes the queen."))
trap("m178","Old Benoni Queen Pin","Benoni Defense (Old Benoni)",ID,"b",1,
 "d4 c5 Nf3 e6 e3 cxd4 Qxd4 Nc6 Qc3",
 "White's queen and king are on the same diagonal.",
 ("Bb4 Qxb4 Nxb4","White gives up the queen","The queen is pinned and lost for a bishop."),
 ("Bb4 Bd2 Bxc3","White blocks with the bishop","Take the queen."))
trap("m179","Four Knights Knight Swap","Four Knights Game (Italian)",OG,"b",2,
 "e4 e5 Nf3 Nf6 Nc3 Nc6 Bc4 Bc5 h3 h6 d3 d6 a3 a6 Be3 Nd4 Na4",
 "White's knight hit your bishop. Trade knights with check first.",
 ("Nxf3+ Qxf3 Bxe3","White recaptures with the queen","Your bishop escapes by taking e3, and White's a4 knight is stranded."),
 ("Nxf3+ gxf3 Bxe3","White recaptures with the pawn","Your bishop escapes by taking e3, and White's a4 knight is stranded."))
trap("m180","Rubinstein Queen Trap II","French Defense (Rubinstein)",FR,"w",2,
 "e4 e6 d4 d5 Nc3 dxe4 Nxe4 Nf6 Nxf6+ Qxf6 Bd3 c5 c3 cxd4 cxd4 Bd7 Nf3 Nc6",
 "The black queen on f6 looks active. Count its escape squares.",
 ("Bg5 Bb4+ Kf1","Black checks first","The check changes nothing. The queen is still trapped."),
 ("Bg5 Qxg5 Nxg5","Black takes the bishop","The queen goes for a bishop."))
trap("m183","Caro-Kann Defender Swap","Caro-Kann Defense (Classical)",CK,"w",2,
 "e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Bd3 Qxd4 Nf3 Qd8 Bf4 e6 O-O Nf6",
 "Black has just developed the f6 knight. Trade it off with check, then go after Black's queen and the f5 bishop.",
 ("Nxf6+ Qxf6 Bg5","Black recaptures with the queen","Bg5 hits the queen, and once it moves your d3 bishop takes f5."),
 ("Nxf6+ gxf6 Bxf5","Black recaptures with the pawn","The f5 bishop has lost its cover. You win a piece."))
trap("m184","Bowdler Queen Pin","Sicilian Defense (Bowdler Attack)",SIC,"b",1,
 "e4 c5 Bc4 Nc6 Nf3 e6 O-O b6 d4 cxd4 Nxd4 Nxd4 Qxd4 Bb7 f3",
 "White's queen on d4 and king on g1 are on the same diagonal.",
 ("Bc5 Qxc5 bxc5","White takes the bishop","The queen is pinned and goes for a bishop."),
 ("Bc5 Be3 Bxd4","White blocks with the bishop","Take the queen."))
trap("m185","French Exchange Rook Shot II","French Defense (Exchange)",FR,"w",2,
 "e4 e6 Nf3 d5 exd5 exd5 d4 Bd6 h3 Ne7 Bd3 Bf5 c3 O-O O-O c6 Re1 Nd7",
 "Black's e7 knight is defended only by the queen, and the bishops face each other.",
 ("Rxe7 Bxd3 Rxd7","Black trades bishops","Your rook takes both black knights."),
 ("Rxe7 Qxe7 Bxf5","Black takes the rook","You win back the exchange and keep an extra piece."))
trap("m186","Danish Pin and Push","Danish Gambit Declined",OG,"w",3,
 "e4 e5 d4 exd4 c3 d5 cxd4 dxe4 Nc3 Nf6 Bg5 Bf5 Bc4 Bb4",
 "Black's b4 bishop is loose and the c6 square is the only block.",
 ("Qa4+ Nc6 d5","Black blocks with the knight","d5 attacks the pinned knight. Black can't keep both c6 and b4."))
trap("m187","Englund f2 Deflection","Englund Gambit",OD,"b",2,
 "d4 e5 dxe5 Bc5 Nf3 d6 exd6 Ne7 Bf4 Bg4 dxe7",
 "White's pawn took your knight, but the d-file is open and only the king guards the queen.",
 ("Bxf2+ Kxf2 Qxd1","White takes the bishop","The check drags the king away and your queen takes White's."))
trap("m188","Four Knights Bishop Swap","Four Knights Game (Italian)",OG,"w",2,
 "e4 e5 Nf3 Nc6 Bc4 Nf6 Nc3 Bc5 a3 d6 h3 O-O O-O Be6 Nd5 Na5",
 "Black's knight hit your bishop. Trade off a defender with check first.",
 ("Nxf6+ Qxf6 Bxe6","Black recaptures with the queen","Your bishop escapes with a capture and you come out a piece ahead."))
trap("m190","Elephant Gambit Desperado","Elephant Gambit",OG,"b",2,
 "e4 e5 Nf3 d5 Nxe5 Bd6 d4 dxe4 Nc3 Nf6 Bg5 O-O Bc4 Be6 Bxe6 fxe6 Nxe4",
 "White's knight took e4, but the e5 knight and d4 pawn are both loose.",
 ("Bxe5 dxe5 Qxd1+ Rxd1 Nxe4","White recaptures on e5","Trade queens, then take the e4 knight. A clean piece up."),
 ("Bxe5 Nxf6+ Bxf6","White takes on f6 with check","Recapture and you're a piece up."),
 ("Bxe5 Bxf6 Bxf6","White takes on f6","Recapture and you're a piece up."))
trap("m191","King's English f2 Mate II","English Opening (King's English)",FL,"b",1,
 "c4 e5 g3 Bc5 Bg2 Qf6 e3 Nc6 Nc3 Nb4 Nge2",
 "White's knight blocked e2, the only escape square for the king.",
 ("Nd3+ Kf1 Qxf2#","The king's only move","The knight check drives the king to f1, then queen takes f2 with mate."))
trap("m192","Veresov Queen Fork","Richter-Veresov Attack",QG,"b",1,
 "d4 Nf6 Nc3 d5 Bg5 c6 e3 Ne4 Nxe4 dxe4 h3",
 "White's g5 bishop has no defender and the e1–a5 diagonal is open.",
 ("Qa5+ c3 Qxg5","White blocks with the pawn","The check forks the king and the g5 bishop."),
 ("Qa5+ Qd2 Qxg5","White blocks with the queen","The check forks the king and the g5 bishop."))
trap("m194","Dresden Knight Swap","King's Pawn (Dresden Opening)",OG,"w",2,
 "e4 e5 Nf3 Nc6 c4 Bc5 d3 d6 a3 Bg4 Be2 Nf6 O-O Nd4",
 "Black's knight hit your f3 knight, counting on the pin. Take it.",
 ("Nxd4 Bxe2 Nxe2","Black takes your bishop","After the trades you're a piece up."),
 ("Nxd4 Bxd4 Bxg4","Black recaptures on d4","The g4 bishop falls. A clean piece up."))
trap("m195","Closed Sicilian Queen Fork","Sicilian Defense (Closed)",SIC,"b",2,
 "e4 c5 Nc3 Nc6 Nf3 e6 d4 d5 Bb5 dxe4 Nxe4 cxd4 Qxd4 Bd7 Nd6+",
 "White's knight checked from d6. Trade it, and the b5 bishop is left loose.",
 ("Bxd6 Qxd6 Qa5+ Bd2 Qxb5","White recaptures with the queen","Qa5+ forks the king and the b5 bishop."))
trap("m196","Godiva b2 Raid","Sicilian Defense (Godiva)",SIC,"b",2,
 "e4 c5 Nf3 Nc6 d4 cxd4 Nxd4 Qb6 Nf3 e5 Nc3 Bc5 Qe2 Nf6 Bg5",
 "White's bishop pinned your knight, but b2 and the c3 knight are short of defenders.",
 ("Qxb2 Rd1 Qxc3+ Bd2","White plays Rd1","Take on c3 with check. You've won a knight and a pawn."),
 ("Qxb2 Rd1 Qxc3+ Nd2","White plays Rd1","Take on c3 with check. You've won a knight and a pawn."),
 ("Qxb2 Rb1 Qxc3+ Bd2 Qa3","White plays Rb1","Take on c3 with check and drop back. You're well ahead."),
 ("Qxb2 Bxf6 Qxc3+ Qd2 Qxa1+ Qd1","White takes on f6","Take on c3 and a1 with check. You've won a rook."))
trap("m197","Najdorf Pawn Fork","Sicilian Defense (Najdorf)",SIC,"b",2,
 "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Be2 e5 Nf3 Be7 O-O O-O Bd3 Bg4 h3 Be6 Nd5",
 "White's knight jumped to d5. Trade it off, and your e-pawn reaches two targets.",
 ("Bxd5 exd5 e4","White recaptures","…e4 forks the f3 knight and the d3 bishop."))
trap("m198","Caro-Kann Pawn Fork II","Caro-Kann Defense (Breyer)",CK,"b",2,
 "e4 c6 d3 d5 exd5 cxd5 Nc3 Nf6 Nf3 Nc6 Be2 Bg4 O-O e6 Be3",
 "White's bishop on e3 and knight on c3 are both within reach of your d-pawn.",
 ("Bxf3 Bxf3 d4","White recaptures","…d4 forks the c3 knight and the e3 bishop."))
trap("m199","Scandinavian Discovered Attack","Scandinavian Defense (2.Bd3)",SCA,"w",1,
 "e4 d5 Bd3 dxe4 Bxe4 Nf6 Nc3 Nxe4 Nxe4 Qd5 Qf3 Bf5",
 "Your knight on e4 blocks your queen from Black's queen on d5.",
 ("Nf6+ exf6 Qxd5","Black recaptures with the e-pawn","The knight check uncovers your queen. Black's queen falls."),
 ("Nf6+ gxf6 Qxd5","Black recaptures with the g-pawn","The knight check uncovers your queen. Black's queen falls."))
trap("m200","Blackmar–Diemer d-file Shot","Blackmar–Diemer Gambit (Pietrowsky)",QG,"w",2,
 "d4 d5 e4 dxe4 Nc3 Nf6 f3 exf3 Nxf3 Nc6 d5 Nb4 a3 Nbxd5 Bc4 Nxc3",
 "Black's knight took c3, but the d-file is open and your queen faces Black's.",
 ("Bxf7+ Kxf7 Qxd8","Black takes the bishop","The check drags the king away and your queen takes Black's."))
