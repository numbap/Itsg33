# Mined batch 4: Morra, Caro-Kann, French, Queen's Gambit, Three Knights, Vienna, King's Gambit,
# Ponziani, Nimzowitsch, Owen, Blackmar-Diemer, Tennison, Trompowsky and more.
trap("m102","Morra b2 Grab Mate","Smith–Morra Gambit (Accepted)",SIC,"w",1,
 "e4 c5 d4 cxd4 c3 dxc3 Bc4 Nc6 Qb3 cxb2",
 "Black kept grabbing pawns. Your queen and bishop have been aimed at f7 the whole time.",
 ("Bxf7#","Mate","Bishop takes f7, supported by the queen. The king has no squares."))
trap("m104","Caro-Kann Pawn Fork","Caro-Kann Defense (Two Knights)",CK,"b",2,
 "e4 c6 Nf3 d5 Nc3 Bg4 exd5 cxd5 Be2 e6 d3 Nc6 Be3 Nf6 h3",
 "White asked your bishop to decide. Trade it, then use the d-pawn.",
 ("Bxf3 Bxf3 d4","White recaptures","…d4 forks the c3 knight and the e3 bishop."))
trap("m106","Queen Desperado","Caro-Kann Defense",CK,"b",1,
 "e4 d5 d4 c6 Nc3 e6 Nf3 dxe4 Nxe4 Nf6 Bg5 Nbd7 Qd2",
 "Your queen is attacked by the g5 bishop, but White's queen on d2 is loose too.",
 ("Nxe4 Bxd8 Nxd2","White takes your queen","Your knight takes White's queen straight back, having already won the e4 knight."))
trap("m107","Advance French Queen Trap","French Defense (Advance)",FR,"b",1,
 "e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3 Nge7 Bd3 cxd4 cxd4 Nf5 Bxf5 exf5 O-O Be6 Nc3 Be7 Qb3 a6 Qxb7",
 "White's queen grabbed b7 and is now deep in your position.",
 ("Na5 Qxa8 Qxa8","The queen takes the rook","Na5 shuts the queen in. It takes the rook and is lost for it."))
trap("m108","French Exchange Defender Swap","French Defense (Exchange)",FR,"w",2,
 "e4 e6 d4 d5 exd5 exd5 Nf3 Bg4 Be2 Nd7 O-O Ngf6 Re1 Be7 Ne5 Bxe2 Qxe2 O-O",
 "Black's e7 bishop is attacked twice on the e-file. Remove one of its defenders.",
 ("Nxd7 Qxd7 Qxe7","Black recaptures with the queen","The e7 bishop falls. You're a piece up."),
 ("Nxd7 Nxd7 Qxe7","Black recaptures with the knight","The e7 bishop falls. You're a piece up."),
 ("Nxd7 Re8","Black guards e7 with the rook","You've won a knight. Bring yours back to e5, or take on f6 with check."))
trap("m109","Steiner f7 Raid","French Defense (Steiner)",FR,"w",2,
 "e4 e6 c4 d5 cxd5 exd5 exd5 Qxd5 Nc3 Qd8 Bc4 Nf6 Nf3 Bd6 Bxf7+ Kxf7 Qb3+ Be6",
 "Black blocked your check with the bishop. Attack it again.",
 ("Ng5+ Kg6 Nxe6","The king steps to g6","The knight takes e6 and forks the queen and the g7 pawn. You're winning."),
 ("Ng5+ Ke7 Qxe6+ Kf8 Qf7#","The king steps to e7","Queen takes e6 with check and mates on f7."))
trap("m110","QGD Exchange Queen Fork","Queen's Gambit Declined (Exchange)",QG,"b",2,
 "d4 d5 c4 e6 Nc3 Nf6 cxd5 exd5 Bg5 Nbd7 e3 c5 Nxd5 cxd4 exd4",
 "White's knight took d5, but both the d5 knight and the g5 bishop are loose.",
 ("Qa5+ Nc3 Qxg5","White retreats the knight","The check forks the king and the g5 bishop."),
 ("Qa5+ Qd2 Qxd5","White blocks with the queen","Take the d5 knight instead. A clean piece up."))
trap("m112","Three Knights f7 Shot","Petrov Defense (Three Knights)",OG,"w",3,
 "e4 e5 Nf3 Nf6 Nc3 Bc5 d4 exd4 Nxd4 O-O Bc4 Re8 Bg5 Nxe4",
 "Black's knight took e4, and now Black's queen is only guarded by the f6 knight that moved.",
 ("Bxf7+ Kxf7 Qh5+ Kg8 Bxd8","Black takes the bishop","The queen check drives the king back, then Bxd8 wins the queen."))
trap("m113","Three Knights h4 Trick","Petrov Defense (Three Knights)",OG,"b",3,
 "e4 e5 Nf3 Nf6 Nc3 Bc5 d4 exd4 Nxd4 Bxd4 Qxd4 Nc6 Qd1 O-O Bg5 h6 Bh4 Re8 Bd3",
 "White's h4 bishop sits on the same diagonal as your queen. Clear the way.",
 ("Nxe4 Nxe4 Qxh4","White recaptures on e4","Your queen takes the h4 bishop. You've won a pawn and the bishop pair."))
trap("m114","Vienna Légal Mate","Vienna Game (Vienna Gambit)",OG,"w",2,
 "e4 e5 Nc3 Nc6 f4 d6 Nf3 Bg4 Bc4 exf4 O-O Nd4 Ne5 Bxd1",
 "Black took your queen. The same pattern as Légal's Mate is ready.",
 ("Bxf7+ Ke7 Nd5#","The king's only move","Bishop and two knights mate the king on e7."))
trap("m115","King's Gambit Declined Queen Fork","King's Gambit Declined",OG,"b",1,
 "e4 e5 f4 Nc6 Nf3 d6 Bb5 Be7 O-O Nf6 Nc3 O-O Bxc6 bxc6 fxe5 dxe5 Nxe5",
 "White's knight took e5, and the white king is on the same diagonal as d4.",
 ("Qd4+ Kh1 Qxe5","White moves the king","Qd4+ forks the king and the e5 knight."))
trap("m116","King's Gambit Declined Knight Swap","King's Gambit Declined",OG,"w",2,
 "e4 e5 f4 Nc6 Nf3 d5 exd5 Qxd5 fxe5 Bg4 Be2 O-O-O O-O Nxe5",
 "Black's knight took e5, counting on the pin. Take it anyway.",
 ("Nxe5 Bxe2 Qxe2","Black takes your bishop","The trades leave you a knight ahead."),
 ("Nxe5 Bc5+ Kh1","Black checks first","Step out of the check. You're a piece up."))
trap("m118","Ponziani Queen Trade Trick","Ponziani Opening (Jaenisch)",OG,"w",2,
 "e4 e5 Nf3 Nc6 c3 Nf6 d4 Nxe4 Bd3 d5 dxe5 Bg4 O-O Nxe5",
 "Black's knight took e5, but the e4 knight is loose and the queens face each other.",
 ("Bxe4 dxe4 Qxd8+ Rxd8 Nxe5","Black recaptures on e4","Trade queens with check, then take the e5 knight."),
 ("Bxe4 Nxf3+ Bxf3","Black trades knights with check","Recapture with the bishop. You've won a piece."),
 ("Bxe4 Bxf3 Bxf3","Black takes on f3","Recapture with the bishop. You've won a piece."))
trap("m119","Philidor Bxf7+ Fork","Philidor Defense",OG,"w",3,
 "e4 e5 Nf3 d6 Bb5+ c6 Ba4 a6 d4 b5 Bb3 exd4 Qxd4 c5",
 "Black kicked your queen, but the a8 rook and the f7 pawn are both weak.",
 ("Bxf7+ Kxf7 Qd5+ Be6 Ng5+ Qxg5 Qxg5","Black blocks with the bishop","The knight check deflects the queen. You win it back with interest."),
 ("Bxf7+ Kxf7 Qd5+ Ke8 Qxa8","Black moves the king","Qd5+ forks the king and the a8 rook."))
trap("m120","Kennedy d-file Discovery","Nimzowitsch Defense (Kennedy)",OE,"b",2,
 "d4 e5 dxe5 d6 e4 Nc6 Bb5 Bd7 exd6 Bxd6 Nf3 Qe7 O-O O-O-O Re1 Bg4 Bxc6",
 "Your d8 rook faces White's queen. Move the bishop out of the way with a capture.",
 ("Bxh2+ Kxh2 Rxd1","White takes with the king","The bishop takes h2 with check, uncovering the rook on the queen."),
 ("Bxh2+ Nxh2 Rxd1","White takes with the knight","The bishop takes h2 with check, uncovering the rook on the queen."))
trap("m121","Colorado h-file Trick","Nimzowitsch Defense (Colorado)",OE,"b",2,
 "e4 Nc6 Nf3 f5 exf5 d5 Nh4 Nh6 Qh5+ Nf7 c3 g6 fxg6",
 "White's queen and knight both sit on the h-file in front of your rook.",
 ("hxg6 Qxg6 Rxh4","White takes on g6","The h-file opens and your rook takes the h4 knight."))
trap("m122","Owen Long-Diagonal Trick","Owen's Defense",OE,"b",2,
 "e4 b6 d4 Bb7 Nc3 Nf6 e5 Nd5 Bd2 e6 Bc4",
 "Your bishop is aimed at g2 and the h1 rook. One trade opens the diagonal.",
 ("Nxc3 Bxc3 Bxg2","White recaptures with the bishop","The long diagonal opens: you take g2 and the h1 rook next."),
 ("Nxc3 bxc3 Bxg2","White recaptures with the pawn","The long diagonal opens: you take g2 and the h1 rook next."))
trap("m123","Blackmar–Diemer f-file Shot","Blackmar–Diemer Gambit (Ziegler)",QG,"w",3,
 "d4 d5 e4 dxe4 Nc3 Nf6 f3 exf3 Nxf3 c6 Bc4 Bf5 O-O Nbd7",
 "Black's f5 bishop is defended only by the knight on f6... for now.",
 ("Bxf7+ Kxf7 Ng5+ Kg6","The king goes to g6","The king is out in the open. Rxf5 wins back the piece, and g4 is even stronger."),
 ("Bxf7+ Kxf7 Ng5+ Kg8 Rxf5","The king goes to g8","The bishop sacrifice drags the king out and the f-file opens. Rxf5 wins back the piece."),
 ("Bxf7+ Kxf7 Ng5+ Ke8 Rxf5","The king goes back to e8","The bishop sacrifice drags the king out and the f-file opens. Rxf5 wins back the piece."))
trap("m128","English Double Attack","English Opening (Symmetrical)",FL,"b",3,
 "d4 e6 c4 c5 Nf3 cxd4 Nxd4 Nf6 Bg5 Bc5 e3",
 "Your bishop hits d4, and a queen check can add a second target.",
 ("Qa5+ Nc3 Bxd4","White blocks with the knight","The d4 knight falls."),
 ("Qa5+ Qd2 Bb4","White blocks with the queen","Bb4 pins the queen to the king."),
 ("Qa5+ Nd2 Bxd4","White blocks with the other knight","The d4 knight falls."))
trap("m129","Napoleon Queen Trade","King's Pawn (Napoleon Attack)",OE,"w",1,
 "e4 e5 Qf3 Nc6 c3 Nf6 d3 d5 exd5 Qxd5 Be2 Bg4",
 "Black's bishop attacks your queen, but the queens face each other too.",
 ("Qxd5 Nxd5 Bxg4","Black recaptures","Trade queens first. Then the g4 bishop is simply loose."))
trap("m130","Tarrasch Discovered Check","Tarrasch Defense (Two Knights)",QG,"b",2,
 "d4 e6 c4 d5 Nf3 c5 cxd5 exd5 Nc3 Nf6 Bg5 Be7 Bxf6 Bxf6 dxc5 O-O Qxd5",
 "White's queen took d5, on the file of your queen. Move the bishop out of the way with check.",
 ("Bxc3+ bxc3 Qxd5","White recaptures","The check moves your bishop with tempo and the queen falls."),
 ("Bxc3+ Qd2 Bxd2+ Nxd2","White blocks with the queen","White has to give the queen anyway."),
 ("Bxc3+ Nd2 Qxd5","White blocks with the knight","The queen falls."))
trap("m133","Tennison Queen Sacrifice","Zukertort Opening (Tennison Gambit)",FL,"w",3,
 "e4 d5 Nf3 dxe4 Ng5 Qd5 d3 exd3 Bxd3 Qe5+ Be4 h6",
 "Black's king and queen can both be reached by a knight fork from f7.",
 ("Qd8+ Kxd8 Nxf7+ Kd7 Nxe5+ Ke6 Ng6","Black takes the queen","The knight forks king and queen, wins it back, and escapes. You're a piece up."))
trap("m134","Trompowsky Queen Trap","Trompowsky Attack",ID,"w",2,
 "d4 Nf6 Bg5 e6 e4 h6 Bxf6 Qxf6 e5 Qf5 Nf3 Nc6 Bd3 Qg4",
 "Black's queen keeps hunting your kingside pawns. Offer it one more.",
 ("h3 Qxg2 Rh2","Black takes g2","Rh2 shuts the queen in. It has no escape squares."))
trap("m136","QGD Knight Swap","Queen's Gambit Declined",QG,"w",2,
 "d4 e6 c4 d5 cxd5 exd5 Nc3 Nf6 Nf3 Bb4 Bd2 O-O e3 Bg4 Be2 Ne4",
 "Black's knight hit your bishop, but it is guarding the b4 bishop.",
 ("Nxe4 Bxd2+ Nexd2","Black trades on d2","After the trades Black's g4 bishop is loose and you come out ahead."),
 ("Nxe4 dxe4 Bxb4","Black recaptures on e4","The b4 bishop has lost its defender. You win a piece."))
trap("m138","Petrov e-file Pin","Petrov Defense (Italian Variation)",OG,"w",2,
 "e4 e5 Nf3 Nf6 Bc4 Nxe4 Nxe5 d5 O-O dxc4 Re1 Qd4 d3 Qxe5",
 "Black's queen took e5 behind its own knight on the open e-file.",
 ("Rxe4 Qxe4 dxe4","Black recaptures with the queen","The pinned knight falls, and the queen for rook trade leaves you well ahead."))
trap("m140","Queen's Pawn Discovered Attack","Queen's Pawn Game",OD,"b",2,
 "d4 d5 e3 Nc6 Nf3 Bg4 Be2 Nf6 O-O Bxf3 Bxf3 e5 dxe5 Nxe5 Nc3 Bb4 Nxd5",
 "White's knight took d5, on the file of your queen. Move your knight out of the way with check.",
 ("Nxf3+ Qxf3 Qxd5","White recaptures with the queen","The check uncovers your queen on d5. A clean piece up."),
 ("Nxf3+ gxf3 Qxd5","White recaptures with the pawn","The d5 knight is now loose. Take it with the queen or the f6 knight."),
 ("Nxf3+ gxf3 Nxd5","White recaptures with the pawn","The d5 knight is now loose. Take it with the queen or the f6 knight."))
