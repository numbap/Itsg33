# Batch 10: more traps from the wide local search. All lines validated with Stockfish.
SCA="Scandinavian"
trap("w034","Fritz: Raid on g2","Two Knights Defense (Fritz Variation)",OG,"b",3,
 "e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 Nd4 d6 Qxd6 Nxf7 Qc6 Nxh8",
 "White's knight took your h8 rook. Your queen on c6 already looks down the long diagonal.",
 ("Qxg2 Rf1 Bg4","White saves the rook","Bg4 brings another attacker in, aimed at White's queen. White's king is caught in the centre and you're winning."),
 ("Qxg2 Bf7+ Kd8","White checks first","Your king steps aside. The h1 rook is still hanging and White's king has no shelter."))
trap("w035","Sicilian d6 Wedge","Sicilian Defense",SIC,"w",2,
 "e4 c5 Nf3 Nc6 d4 e6 d5 exd5 exd5 Nce7",
 "Black's knight retreated to e7, right in front of the bishop and queen. Push.",
 ("d6 Nf5 Qe2+ Be7","The knight escapes to f5","Qe2+ forces the bishop to block on e7, and dxe7 wins it next."),
 ("d6 Nc6","The knight goes back to c6","The pawn on d6 splits Black's position in two. With Qe2+ or Bc4 coming, Black can't untangle."))
trap("w036","Two Knights ...Qe7 Blunder","Two Knights Defense",OG,"w",1,
 "e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 Bc5 Nxf7 Qe7",
 "Black's queen move didn't do anything about your knight on f7. What is it hitting?",
 ("Nxh8 Nxe4 Qh5+ g6 Nxg6","Black grabs e4","Qh5+ and Nxg6 win more. Black is a rook and pawns down."),
 ("Nxh8 Bxf2+ Kxf2","Black takes on f2","Take the bishop. You're a rook up."),
 ("Nxh8 d5","Black opens the centre","You're a full rook up. Take on d5 with the pawn or the bishop."),
 ("Nxh8 d6","Black opens the bishop's diagonal","You're a full rook up. Develop with Nc3 or h3."))
trap("w037","Englund c2 Fork","Englund Gambit",OD,"b",2,
 "d4 e5 dxe5 Nc6 Nf3 Qe7 Bf4 Qb4+ Bd2 Qxb2 Nc3 Nb4 Rb1",
 "White's rook attacks your queen, but White's c2 is weak and your knight is right next to it.",
 ("Nxc2+ Qxc2 Qxc2","White takes the knight","The knight checks the king. If the queen takes it, your queen takes the queen."))
trap("w038","Scotch Gambit f7 Strike","Scotch Gambit",OG,"w",1,
 "e4 e5 Nf3 Nc6 d4 exd4 Bc4 Bb4+ c3 dxc3 bxc3 Be7",
 "Black's bishop retreated. Your queen and bishop can both reach f7.",
 ("Qd5 Nh6 Bxh6","Black defends f7 with the knight","Take the defender. Black can't recapture without giving up f7, and you stay a piece ahead."),
 ("Qd5 d6 Qxf7+ Kd7 Be6#","Black opens the bishop","f7 falls with check and the bishop mates on e6."))
trap("w039","Centre Game Knight Raid","Centre Game",OG,"w",2,
 "e4 e5 d4 exd4 Qxd4 Nc6 Qe3 b6 Nc3 Bc5 Qg3 Qf6",
 "Black's queen came out to f6. Your knight can attack it and hit c7 at the same time.",
 ("Nd5 Qe5","Black offers a queen trade","Qxe5+ or Nxc7+ first: either way the knight forks c7 and the a8 rook falls."),
 ("Nd5 Qd6","The queen goes to d6","Nxc7+ forks king and rook."),
 ("Nd5 Qd4","The queen goes to d4","Nxc7+ is coming, and the queen is short of squares. Bd3 covers your e4 pawn first."))
trap("w040","Two Knights Qf3 Punished","Two Knights Defense",OG,"b",2,
 "e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 Nxe4 Nxf7 Qh4 Qf3",
 "White's queen came to f3 to defend f2. Find the knight jump that attacks it and more.",
 ("Nd4 Nd6+ Nxd6","White checks with the knight","Take it. The queen is still attacked and c2 is next."),
 ("Nd4 Qe3 Nxc2+ Ke2","White saves the queen","Nxc2+ forked king and queen. Take the queen on e3 next."),
 ("Nd4 Qh3 Qxf2+ Kd1 d5","White saves the queen","Take f2 with check. White's king is stuck in the centre and the attack is crushing."))
trap("w041","Knight Trapped on a5","Philidor Defense",OG,"w",1,
 "e4 e5 Nf3 Nc6 d4 d6 d5 Na5",
 "Black's knight went to the rim. Look at the squares it can still reach.",
 ("b4 Nf6","Black ignores it","b4 attacks the knight. Its only squares are covered by your pawns and the f1 bishop. Take it next."))
trap("w042","Wayward Queen Pin","King's Pawn (Wayward Queen Attack)",OE,"w",2,
 "e4 e5 Qh5 Nc6 Bc4 g6 Qf3 Nf6 c3 Bc5 d3 d6",
 "Black's f6 knight is attacked by your queen and defended only by the d8 queen.",
 ("Bg5 Bg4 Qxf6","Black attacks your queen","Ignore it. Qxf6 trades on f6 and you come out a piece ahead."),
 ("Bg5 Bf5","Black blocks with the bishop","Take the bishop. The pin on f6 is still there."))
trap("w043","Ruy Lopez Qd4 Fork","Ruy López (Berlin)",OG,"b",1,
 "e4 e5 Nf3 Nc6 Bb5 Nf6 d3 Bc5 Bxc6 dxc6 Nxe5",
 "White took the e5 pawn with the knight. Your queen and bishop can hit two things at once.",
 ("Qd4 Be3 Qxe5","White blocks the bishop","Take the knight. You've won a piece for a pawn."),
 ("Qd4 O-O Qxe5","White castles","Take the knight. You've won a piece for a pawn."),
 ("Qd4 Qe2 Qxe5","White defends f2","Take the knight. You've won a piece for a pawn."))
trap("w044","Vienna Qg4 g7 Grab","Vienna Game",OG,"w",3,
 "e4 e5 Nc3 Nc6 Bc4 Bc5 Qg4 Qf6 Nd5 Qxf2+ Kd1 d6",
 "Your king is under fire, but Black's kingside is empty. Grab material with tempo.",
 ("Qxg7 Be6","Black develops","Nxc7+ is next: it forks king and the a8 rook."),
 ("Qxg7 Nd4","Black attacks c2","Cover c2 (c3 works). You keep the h8 rook under attack and Nxc7+ in reserve."),
 ("Qxg7 Nce7","Black defends c7","Take the e7 knight. You're winning."))
trap("w045","Scandinavian Qd4 Double Attack","Scandinavian (Tennison Gambit)",SCA,"b",1,
 "e4 d5 Nf3 dxe4 Ne5 Nf6 Bc4 e6 O-O",
 "White castled and left the e5 knight and c4 bishop unprotected.",
 ("Qd4 Nxf7 Kxf7","White saves the knight with a sacrifice","Take it. You're a piece up."))
trap("w046","King's Gambit g5 Mate","King's Gambit Accepted",OG,"w",1,
 "e4 e5 f4 exf4 Nf3 f6 Bc4 g5",
 "Black pushed both kingside pawns. The e8–h5 diagonal is wide open.",
 ("Nxg5 fxg5 Qh5+ Ke7","Black takes the knight","Qf7+ or Qxg5+ next. The king has no escape and mate follows."),
 ("Nxg5 Nh6 Qh5+ Ke7 Nf7","Black defends with ...Nh6","The knight forks the queen and the h8 rook."))
trap("w047","Scandinavian Qb5+ Fork","Scandinavian Defense",SCA,"w",1,
 "e4 d5 Nf3 dxe4 Ng5 Nf6 Nc3 Bf5 Qe2 Qd4",
 "Black's queen came forward and left b7 and the f5 bishop loose.",
 ("Qb5+ Bd7 Qxb7","Black blocks with the bishop","The queen takes b7 and hits the a8 rook."),
 ("Qb5+ Nbd7 Qxf5","Black blocks with the knight","The check forks the king and the f5 bishop."))
trap("w048","Caro-Kann Discovered Attack","Caro-Kann Defense",CK,"w",2,
 "e4 c6 d4 d5 Nc3 dxe4 Nxe4 Nf6 Ng5 h6 Nxf7 Kxf7 Nf3 Bg4",
 "Black's bishop is pinning your knight to the queen. But the knight can move with check.",
 ("Ne5+ Kg8 Nxg4","The king goes to g8","The knight moved with check, uncovering the queen on g4. Take the bishop."),
 ("Ne5+ Kg8 Bc4+ e6 Nxg4","The king goes to g8","Bc4+ first is fine too. Then take the bishop."),
 ("Ne5+ Ke8 Nxg4","The king goes back to e8","The check uncovered your queen. Take the bishop."))
trap("w049","London Queen Grab","London System",OD,"b",1,
 "d4 d5 Bf4 Bg4 e3",
 "White's last pawn move opened a diagonal you're already standing on.",
 ("Bxd1 Kxd1","White recaptures","...e3 opened the g4–d1 diagonal. You've won the queen for a bishop."))
trap("w050","Ruy Lopez Queen Fork","Ruy López",OG,"b",1,
 "e4 e5 Nf3 Nc6 Bb5 Qf6 Bxc6 Qxc6 Nxe5",
 "White took the e5 pawn. Your queen can win it back with check.",
 ("Qxe4+ Qe2 Qxg2","White blocks with the queen","Take g2 and hit the h1 rook. You come out pawns ahead."))
trap("w051","Queenless Knight Fork","Pirc Defense",OE,"b",1,
 "e4 d6 d4 Nf6 e5 dxe5 dxe5 Qxd1+ Kxd1 Ng4 Nf3",
 "White developed the knight and forgot about f2. Look at the king and the h1 rook.",
 ("Nxf2+ Ke2 Nxh1","The king steps up","The knight forks king and rook."),
 ("Nxf2+ Ke1 Nxh1","The king steps back","The knight forks king and rook."))
trap("w052","En Passant Pin","Centre Game (Petrov setup)",OG,"w",2,
 "e4 e5 d4 Nf6 dxe5 Nxe4 Qe2 d5",
 "Black's pawn jumped two squares, right past your e5 pawn. Take it and open the e-file.",
 ("exd6 f5 f3","Black defends the knight","En passant opens the e-file: the e4 knight is pinned to the king. f3 attacks it and it can't move."))
trap("w053","Bishop's Opening f7 Counter","Bishop's Opening (Petrov setup)",OG,"b",2,
 "e4 e5 Nf3 Nf6 Bc4 Nxe4 Nxe5 d5 Nxf7",
 "White's knight took f7 and attacks your queen and the h8 rook. Find the queen move that hits it back.",
 ("Qe7 Qe2 Qxf7","White pins your knight","Take the knight. Your d5 pawn still hits the bishop and you've won a piece for a pawn."))
trap("w054","Philidor Qb3 Double Attack","Philidor Defense",OG,"w",1,
 "e4 e5 Nf3 d6 Bc4 Bg4 d4 Bxf3 Qxf3 Qf6",
 "Black's queen guards f7 but left b7 alone.",
 ("Qb3 Nd7 Qxb7","Black blocks the bishop's diagonal","The queen takes b7 and the a8 rook is next."),
 ("Qb3 b6 Nc3","Black defends b7","Bring in the knight. Nd5 hits the queen and c7, and Black is losing material."))
trap("w055","Danish Qd5 Fork","Danish Gambit",OG,"w",1,
 "e4 e5 d4 exd4 c3 dxc3 Bc4 Bb4 bxc3 Ba5",
 "Black's bishop retreated to a5. Your queen can hit it and f7 together.",
 ("Qd5 Qe7 Qxa5","Black defends f7","Take the bishop on a5."))
trap("w056","Philidor Pawn Fork","Philidor Defense",OG,"w",1,
 "e4 e5 Nf3 Nc6 d4 d6 Bc4 Be6",
 "Black put the bishop on e6 next to the c6 knight.",
 ("d5 Na5 dxe6","The knight runs","The pawn takes the bishop."),
 ("d5 Bd7 dxc6","The bishop runs","The pawn takes the knight."))
trap("w057","King's Gambit g2 Discovery","King's Gambit Accepted",OG,"b",1,
 "e4 e5 f4 exf4 d4 Qh4+ g3",
 "White blocked the check with a pawn. Your f4 pawn can do a lot of damage.",
 ("fxg3 Nf3 g2+ Nxh4 gxh1=Q","White attacks your queen","g2+ is a discovered check from the queen and the pawn hits h1. You lose the queen but get a new one and the rook."),
 ("fxg3 Nf3 g2+ Nxh4 Bb4+","White attacks your queen","g2+ is a discovered check. Bb4+ also keeps the pawn and the h1 rook falls."))
trap("w058","Vienna Qg4 ...d5 Punished","Vienna Game",OG,"w",1,
 "e4 e5 Nc3 Nc6 Bc4 Bc5 Qg4 d5",
 "Black struck at your bishop, but your queen is already looking at g7.",
 ("Qxg7 dxc4 Qxh8","Black takes the bishop","Take the h8 rook. You're the exchange up."),
 ("Qxg7 Qf6 Qxf6","Black offers a queen trade","Trade queens. You're a pawn up and Black's kingside is ruined."))
trap("w059","Jobava c7 Raid","London System (Jobava)",OD,"w",1,
 "d4 d5 Nc3 Nf6 Bf4 Nc6 Nb5 Rb8",
 "Black guarded against a knight fork with ...Rb8, but c7 is still weak.",
 ("Bxc7 Qd7 Bxb8","Black saves the queen","The bishop took c7 attacking the queen and rook. Take the rook."))
trap("w060","Italian ...Qg5 Fork","Italian Game",OG,"b",1,
 "e4 e5 Nf3 Nc6 Bc4 d5 exd5 Nd4 Nxe5",
 "White's knight took e5. Your queen can attack it and g2 at once.",
 ("Qg5 Kf1 Qxe5","White defends g2","Take the knight. You're a piece up."))
trap("w061","Bishop's Opening Qf3 Fork","Bishop's Opening",OG,"w",1,
 "e4 e5 Bc4 Nf6 d4 Nxe4 dxe5 Nxf2",
 "Black's knight took f2. Your queen can hit it and threaten mate on f7.",
 ("Qf3 Qe7 Qxf2","Black stops the mate","Take the knight. You're a piece up."))
trap("w062","Traxler with Kf1","Two Knights Defense (Traxler)",OG,"b",3,
 "e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 Bc5 Nxf7 Bxf2+ Kxf2 Nxe4+ Kf1",
 "White's king ran to f1. Bring the queen in.",
 ("Qh4 Qf3 Nd4","White defends with the queen","Nd4 hits the queen and c2. The attack wins material."),
 ("Qh4 Qe1 Ng3+ Qxg3 Qxc4+ Ke1","White defends with the queen","Ng3+ drew the queen away. Take on f7 or e4 with check: you've won back your material with a big attack."))
trap("w063","Owen Rook Trap","Owen Defense",OD,"b",1,
 "d4 b6 e3 Bb7 Bd3",
 "White's bishop left g2 without its defender.",
 ("Bxg2 Nc3","White develops","The h1 rook has nowhere to run. Take it next move."))
trap("w064","Fried Liver: ...Ke7 Mate","Two Knights Defense (Fried Liver)",OG,"w",3,
 "e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 Nxd5 Nxf7 Kxf7 Qf3+ Ke6 Nc3 Nd4 Bxd5+ Ke7",
 "Black's king went back to e7 instead of d6. There's a forced mate.",
 ("Qf7+ Kd6 Ne4#","The king runs to d6","The knight on e4 mates."))
trap("w065","Queen Pinned on c6","King's Pawn (Elephant Gambit)",OG,"w",1,
 "e4 e5 Nf3 d5 exd5 Qxd5 Nc3 Qc6",
 "Black's queen is on the same diagonal as the king.",
 ("Bb5 Qxb5 Nxb5","Black takes the bishop","Bb5 pinned the queen. You win it for a bishop."),
 ("Bb5 Bd7 Bxc6","Black blocks","Take the queen."))
trap("w066","Jobava Knight Fork","London System (Jobava)",OD,"w",1,
 "d4 d5 Nc3 Nf6 Bf4 Nc6 Nb5 e6",
 "Black's last move did nothing about c7.",
 ("Nxc7+ Ke7 Nxa8","The king steps up","The knight forks king and rook."),
 ("Nxc7+ Kd7 Nxa8","The king steps up","The knight forks king and rook."))
trap("w067","Exchange Ruy ...Qd4 vs f4","Ruy López (Exchange)",OG,"b",2,
 "e4 e5 Nf3 Nc6 Bb5 a6 Bxc6 dxc6 Nxe5 Qd4 f4",
 "White defended the knight with f4, but the e4 pawn now has no defender.",
 ("Qxe4+ Qe2 Qxc2","White blocks with the queen","Take c2 too. You're a pawn up and b2 is hanging next."))
trap("w068","Philidor Long-Diagonal Fork","Philidor Defense",OG,"w",2,
 "e4 e5 Nf3 d6 d4 Bg4 Be2 Bxf3 Bxf3 exd4 Qxd4 Nf6",
 "Black's knight is in front of your e-pawn, and your bishop is aimed at b7.",
 ("e5 dxe5 Qxd8+ Kxd8 Bxb7","Black takes the pawn","The trade opened the long diagonal: the bishop takes b7 and hits the a8 rook."))
trap("w069","Petrov Discovered Check","Petrov Defense",OG,"b",1,
 "e4 e5 Nf3 Nf6 Nxe5 Qe7 d4 d6 Nf3 Nxe4 Bd3",
 "Your queen and White's king are on the same file. Move the knight.",
 ("Nc3+ Kd2 Nxd1","White steps out of check","Nc3+ is a discovered check that also attacks the queen. Take it."))
