# Mined batch 2: Sicilian, Caro-Kann, Queen's Gambit, Petrov/Four Knights, Vienna, English and more.
# Ranked by how often club players make the losing move; all lines validated with Stockfish 16.
trap("m026","Morra f7 Queen Trap","Smith–Morra Gambit",SIC,"w",3,
 "e4 c5 d4 cxd4 c3 dxc3 Nxc3 g6 Bc4 Bg7 Nf3 Nc6 O-O d6 Qe2 Nf6 Rd1 Nd7",
 "Black's knight retreated to d7 and left f7 and e6 without a guard.",
 ("Bxf7+ Kxf7 Ng5+ Ke8 Ne6","The king goes back to e8","Ne6 traps the black queen on d8."),
 ("Bxf7+ Kxf7 Ng5+ Kg8 Qc4+ d5 Qxd5+ e6 Qxe6+ Kf8 Qf7#","The king runs to g8","Queen checks drive the king into a mating net on f7."))
trap("m027","Sicilian Qa4+ Fork","Sicilian Defense",SIC,"w",1,
 "e4 c5 Nf3 d6 Be2 g6 O-O Nf6 c3 Nxe4",
 "Black's knight grabbed e4. Is it defended?",
 ("Qa4+ Nc6 Qxe4","Black blocks with the knight","The check forks the king and the e4 knight."),
 ("Qa4+ Bd7 Qxe4","Black blocks with the bishop","The check forks the king and the e4 knight."))
trap("m028","Rossolimo Queen Fork","Sicilian Defense (Rossolimo)",SIC,"b",1,
 "e4 c5 Nf3 Nc6 Bb5 g6 d4 Bg7 dxc5",
 "White took on c5, leaving the b5 bishop loose and the e1–a5 diagonal open.",
 ("Qa5+ Nc3 Bxc3+ bxc3 Qxb5","White blocks with the knight","Remove the blocker, then take the bishop."),
 ("Qa5+ Bd2 Qxb5","White blocks with the bishop","The check forks king and bishop."))
trap("m029","Bowdler Knight Trick","Sicilian Defense (Bowdler Attack)",SIC,"b",2,
 "e4 c5 Nf3 d6 Bc4 e5 d3 Be7 Nc3 Nf6 Bg5 O-O Nd5",
 "White is piling up on your pinned knight. The pin isn't as strong as it looks.",
 ("Nxd5 Bxd5 Bxg5","White recaptures on d5","With the knight gone, your bishop takes g5. A clean piece up."),
 ("Nxd5 Bxe7 Nxe7","White takes the bishop","Your knight drops back to e7. You've won a piece."))
trap("m030","Caro-Kann Exchange Pin Fail","Caro-Kann Defense (Exchange)",CK,"w",2,
 "e4 c6 d4 d5 exd5 cxd5 Bd3 Nc6 Nf3 Bg4 Nbd2 Nxd4",
 "Black took d4, trusting the pin on your f3 knight. Break it.",
 ("Nxd4 Bxd1 Bb5+ Qd7","Black takes the queen","Bxd7+ and Kxd1 next: you come out a full piece ahead."))
trap("m031","Caro-Kann Advance Qa4+","Caro-Kann Defense (Advance)",CK,"w",1,
 "e4 c6 Nf3 d5 e5 Bg4 c3 e6 Be2 c5",
 "Black's last move opened the e8–a4 diagonal. What is loose?",
 ("Qa4+ Nc6 Qxg4","Black blocks with the knight","The check forks king and the g4 bishop."),
 ("Qa4+ Qd7 Qxg4","Black blocks with the queen","Take the bishop, or pin the queen with Bb5 first. Both win."),
 ("Qa4+ Qd7 Bb5","Black blocks with the queen","Take the bishop, or pin the queen with Bb5 first. Both win."))
trap("m034","Semi-Tarrasch Queen Fork","Queen's Gambit Declined (Semi-Tarrasch)",QG,"b",2,
 "d4 d5 c4 e6 Nc3 Nf6 cxd5 Nxd5 Nf3 c5 e4 Nxc3 bxc3 cxd4 Bb5+ Nc6 cxd4",
 "White recaptured on d4 and left the b5 bishop with no defender.",
 ("Qa5+ Bd2 Qxb5","White blocks with the bishop","The check forks king and bishop."),
 ("Qa5+ Qd2 Bb4","White blocks with the queen","Bb4 pins the queen to the king, or just take b5. Both win."),
 ("Qa5+ Qd2 Qxb5","White blocks with the queen","Bb4 pins the queen to the king, or just take b5. Both win."),
 ("Qa5+ Kf1 Qxb5+ Kg1","White moves the king","You take the bishop with check and White has lost castling."))
trap("m035","QGA Scholar's Mate","Queen's Gambit Accepted",QG,"w",1,
 "d4 d5 c4 dxc4 e3 e5 Bxc4 Nc6 Qf3 exd4",
 "Your queen and bishop are aimed at f7, and Black just grabbed a pawn.",
 ("Qxf7#","Mate","Mate on f7, supported by the c4 bishop."))
trap("m036","QGD Bb4 Fork","Queen's Gambit Declined",QG,"w",1,
 "d4 d5 c4 e6 Nc3 Nf6 Bg5 Nbd7 e3 Be7 Nf3 h6 Bh4 Bb4 Bxf6 Nxf6",
 "Black's bishop on b4 has lost its only defender.",
 ("Qa4+ Bd7 Qxb4","Black blocks with the bishop","The check forks the king and the b4 bishop."),
 ("Qa4+ c6 Qxb4","Black blocks with ...c6","The check forks the king and the b4 bishop."),
 ("Qa4+ Qd7 Qxb4","Black blocks with the queen","The check forks the king and the b4 bishop."))
trap("m037","Ragozin Pin and Fork","Queen's Gambit Declined (Ragozin)",QG,"w",2,
 "Nf3 Nf6 d4 d5 c4 e6 Nc3 Bb4 e3 dxc4 Bxc4 b6",
 "Black's ...b6 left the b4 bishop and the a4–e8 diagonal unprotected.",
 ("Qa4+ Nc6 Bb5","Black blocks with the knight","Bb5 pins the knight. Black can't keep both c6 and b4."),
 ("Qa4+ Bd7 Qxb4","Black blocks with the bishop","The check forks king and bishop."),
 ("Qa4+ Nbd7 Qxb4","Black blocks with the knight","The check forks king and bishop."))
trap("m042","Three Knights h2 Mate","Petrov Defense (Three Knights)",OG,"b",1,
 "e4 e5 Nf3 Nf6 Nc3 Bc5 Nxe5 Nc6 Nxc6 dxc6 Bc4 Ng4 O-O Qh4 Qf3",
 "White's queen went to f3 and left h2 defended only by the king.",
 ("Qxh2#","Mate","Queen takes h2 with mate. The g4 knight guards it."))
trap("m043","Three Knights f2 Fork","Petrov Defense (Three Knights)",OG,"b",1,
 "e4 e5 Nf3 Nf6 Nc3 Bc5 d3 Ng4 h3",
 "White asked your knight to leave. Leave with a capture.",
 ("Nxf2 Qe2 Nxh1","White saves the queen","The knight forks queen and rook. You take the rook."),
 ("Nxf2 Qd2 Nxh1","White saves the queen","The knight forks queen and rook. You take the rook."),
 ("Nxf2 Bg5 f6","White counterattacks your queen","Calmly cover with …f6. The knight still takes on d1 or h1 next."))
trap("m044","Italian e-file Pin","Italian Game (Two Knights)",OG,"w",3,
 "e4 e5 Nf3 Nf6 Bc4 Bc5 d4 exd4 Nxd4 Nxe4 O-O Qf6",
 "Black's knight sits on e4 with the king behind it on the open e-file.",
 ("Re1 Qxf2+ Kh1","Black grabs f2","The queen raid runs out of steam. The pinned e4 knight is lost."),
 ("Re1 Bxd4 Rxe4+ Be5","Black takes on d4","The rook takes e4 with check and wins material."),
 ("Re1 Bxd4 Rxe4+ Kd8 Rxd4","Black takes on d4, king to d8","The rook takes e4 with check and then the d4 bishop."),
 ("Re1 O-O Rxe4","Black castles out of the pin","The e4 knight falls."))
trap("m046","Four Knights Pawn Fork","Four Knights Game (Italian)",OG,"b",1,
 "e4 e5 Nf3 Nf6 Nc3 Nc6 Bc4 Bc5 h3 d6 d3 h6 O-O O-O Be3 Nd4 Nxd4",
 "White took your knight. Recapture with the piece that attacks two things.",
 ("exd4 Nd5 dxe3","The knight jumps to d5","The pawn forked bishop and knight. You win a piece."),
 ("exd4 Bxd4 Bxd4","White trades on d4","You're a piece up."),
 ("exd4 Bxh6 dxc3","White grabs h6","The pawn takes the knight. You're a piece up."),
 ("exd4 Na4 dxe3","The knight runs to a4","The pawn takes the bishop. You're a piece up."))
trap("m047","Four Knights Nd5 Trick","Four Knights Game (Scotch)",OG,"b",2,
 "e4 Nc6 Nf3 e5 Nc3 Nf6 d4 exd4 Nxd4 Nxd4 Qxd4 c5 Qd3 d6 Bg5 Be7 Nd5",
 "White's knight jumped to d5, trusting the pin. Take it.",
 ("Nxd5 Bxe7","White takes the bishop","Recapture on e7 (or check on a5 first) and you're a piece up."),
 ("Nxd5 Qxd5 Bxg5","White recaptures with the queen","Your bishop takes g5. A piece up."),
 ("Nxd5 exd5 Bxg5","White recaptures with the pawn","Your bishop takes g5. A piece up."))
trap("m049","Four Knights f2 Mate","Four Knights Game",OG,"b",2,
 "e4 e5 Nf3 Nc6 Nc3 Nf6 Nxe5 Bc5 Nxc6 Bxf2+ Kxf2 dxc6 Bd3 Ng4+ Kg1",
 "White's king went back to g1 with the d-file and f2 open.",
 ("Qd4+ Kf1 Qf2#","White's only move","The queen checks, then mates on f2 with the knight's support."))
trap("m050","Vienna Queen Fork","Vienna Game",OG,"b",2,
 "e4 e5 Nc3 Nf6 f4 d6 Nf3 Nc6 Bc4 Be7 fxe5 dxe5 O-O Bg4 h3",
 "White asked your bishop to decide. Trade it, then use the d-file.",
 ("Bxf3 Qxf3 Qd4+ Kh1 Qxc4","White recaptures with the queen","Qd4+ forks the king and the c4 bishop."),
 ("Bxf3 Rxf3 Qd4+ Kh1 Qxc4","White recaptures with the rook","Qd4+ forks the king and the c4 bishop."),
 ("Bxf3 Rxf3 Qd4+ Kh2 Qxc4","White recaptures with the rook","Qd4+ forks the king and the c4 bishop."),
 ("Bxf3 Rxf3 Qd4+ Rf2 Qxc4","White recaptures with the rook","Qd4+ forks the king and the c4 bishop."),
 ("Bxf3 Bxf7+ Kxf7","White checks first","The desperado check gets one pawn, but you're a piece up."))
trap("m051","Pirc Qa4+ Fork","Pirc Defense",OE,"w",1,
 "e4 d6 Nf3 Nf6 c3 g6 Be2 Nxe4",
 "Black's knight grabbed e4. Is it defended?",
 ("Qa4+ Bd7 Qxe4","Black blocks with the bishop","The check forks the king and the e4 knight."),
 ("Qa4+ Nc6 Qxe4","Black blocks with the knight","The check forks the king and the e4 knight."),
 ("Qa4+ c6 Qxe4","Black blocks with ...c6","The check forks the king and the e4 knight."))
trap("m053","Modern Pawn Fork","Modern Defense",OE,"b",2,
 "e4 g6 Nf3 Bg7 Bc4 e6 Nc3 c6 d3 Ne7 O-O O-O Be3",
 "White's bishops on c4 and e3 and the c3 knight are all within reach of your d-pawn.",
 ("d5 exd5 cxd5","White takes on d5","The bishop is attacked and …d4 will fork the e3 bishop and c3 knight."),
 ("d5 Bb3 d4","White retreats the bishop","…d4 forks the bishop and knight."),
 ("d5 e5 dxc4","White pushes past","You take the c4 bishop."))
trap("m057","King's English Qa4+","English Opening (King's English)",FL,"w",1,
 "c4 e5 Nc3 Nf6 g3 Bb4 Bg2 d6",
 "...d6 cut your opponent's b4 bishop off from its defenders. Lichess players fall for this in tens of thousands of games.",
 ("Qa4+ Nc6 Bxc6+ bxc6 Qxb4","Black blocks with the knight","Remove the knight with the g2 bishop, then take b4."),
 ("Qa4+ Bd7 Qxb4","Black blocks with the bishop","The check forks the king and the b4 bishop."))
trap("m058","King's English f2 Mate","English Opening (King's English)",FL,"b",1,
 "c4 e5 Nc3 Bc5 g3 Qf6 Bg2",
 "Your queen and bishop are both aimed at f2, and White just moved the bishop that could cover it.",
 ("Qxf2#","Mate","The fastest win in the English: mate on f2."))
trap("m060","Berlin Bg4 Trap","Ruy López (Berlin)",OG,"b",3,
 "e4 e5 Nf3 Nc6 Bb5 Nf6 Bxc6 dxc6 Nxe5 Bc5 O-O O-O Re1 Re8 Nd3",
 "White's knight hit your bishop, but White's queen has very few squares.",
 ("Bg4 Re2","White blocks with the rook","Take the rook with …Bxe2 to win the exchange, or grab the e4 pawn with …Nxe4. Either way you are clearly better."),
 ("Bg4 Nxc5 Bxd1","White takes your bishop","Take the queen. You come out a queen for a bishop ahead."),
 ("Bg4 Qxg4 Nxg4","White gives up the queen","White gives the queen for a bishop."))
trap("m063","McConnell e3 Mate","King's Pawn Game (McConnell Defense)",OE,"b",2,
 "e4 e5 d3 Bc5 Nc3 Qf6 Nf3 Ne7 Bg5 Qb6 Bxe7",
 "White grabbed your knight. Your queen and bishop are aimed at f2 and e3.",
 ("Bxf2+ Ke2 Qe3#","The king steps to e2","Queen to e3 is mate."),
 ("Bxf2+ Kd2 Qe3#","The king steps to d2","Queen to e3 is mate."))
trap("m066","Englund Bishop Skewer","Englund Gambit",OD,"b",3,
 "d4 e5 dxe5 Nc6 Nf3 d6 exd6 Bg4 Bf4 Qf6 Qd2",
 "White's queen left b2 and your queen is aimed down the long diagonal.",
 ("Bxd6 Bxd6 Qxb2","White takes back","Qxb2 forks the a1 rook and the b1 knight. You win back more than the piece."))
trap("m067","Stonewall Dutch Qa5+","Dutch Defense (Stonewall)",OD,"b",2,
 "d4 f5 c4 Nf6 g3 e6 Bg2 d5 Nf3 Bd6 b3 c6 Ba3",
 "White offered a bishop trade. Make it, and the recapturing knight lands on a bad square.",
 ("Bxa3 Nxa3 Qa5+ Qd2 Qxa3","White recaptures with the knight","Qa5+ forks the king and the a3 knight."))
trap("m068","Tennison Gambit f7 Shot","Zukertort Opening (Tennison Gambit)",FL,"w",3,
 "Nf3 d5 e4 dxe4 Ng5 Nf6 d3 exd3 Bxd3 c6 Nc3 g6",
 "...g6 weakened the light squares, and your queen faces Black's down the d-file.",
 ("Nxf7 Kxf7 Bxg6+ hxg6 Qxd8","Black takes the knight","Bxg6+ is a deflection: the bishop moves off the d-file and the black queen falls."))
trap("m070","Nimzo-Larsen Knight Pin","Nimzo-Larsen Attack",FL,"b",2,
 "Nf3 Nf6 b3 e6 Bb2 d5 d4 c5 dxc5 Bxc5 e3 Nc6 Bb5",
 "White pinned your knight, but White's own king is still in the centre.",
 ("Qa5+ Nc3 Bb4","White blocks with the knight","The c3 knight is pinned twice. White can't hold both it and the b5 bishop."))
