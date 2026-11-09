# Mined batch 3: French, Sicilian, Caro-Kann, Scandinavian, Pirc/Alekhine, Italian, London and more.
# Ranked by how often club players make the losing move; all lines validated with Stockfish 16.
SCA="Scandinavian"

trap("m071","French d4 Grab","French Defense (Classical)",FR,"b",2,
 "e4 e6 Nc3 d5 d4 Nf6 Bd3 Bb4 Qf3",
 "White's queen left d4 with only one defender, and your bishop pins the c3 knight.",
 ("dxe4 Bxe4 Qxd4","White recaptures on e4","You win the d4 pawn with tempo on the e4 bishop, and the pinned knight can't help."))
trap("m072","Winawer Greek Gift","French Defense (Winawer)",FR,"w",2,
 "e4 e6 d4 d5 Nc3 Bb4 Bd3 Ne7 e5 c5 a3 Bxc3+ bxc3 Nbc6 Nf3 O-O",
 "Black castled with no knight on f6 to guard h7. The classic sacrifice works.",
 ("Bxh7+ Kxh7 Ng5+ Kg6","The king comes forward","Bring the queen to g4 or h5 next. The king is caught in the open."),
 ("Bxh7+ Kxh7 Ng5+ Kg8 Qh5","The king goes back","Qh5 threatens mate on h7 and f7. Black can't cover both for long."),
 ("Bxh7+ Kh8 Ng5","Black declines the bishop","You're a pawn up, and Qh5 is coming with a winning attack."))
trap("m073","French Exchange Rook Shot","French Defense (Exchange)",FR,"w",2,
 "e4 e6 Nf3 d5 exd5 exd5 d4 Bd6 Bd3 Ne7 O-O O-O Re1 Bf5 c3 Nd7",
 "Black's knight on e7 is defended only by the queen, and the bishops face each other on f5 and d3.",
 ("Rxe7 Bxd3 Rxd7","Black trades bishops","Your rook takes the e7 knight and then the d7 knight. You come out a piece ahead."),
 ("Rxe7 Qxe7 Bxf5","Black takes the rook","You win back the exchange and keep an extra piece."))
trap("m074","Botvinnik e5 Discovery","Sicilian Defense (Botvinnik)",SIC,"w",2,
 "e4 c5 c4 Nc6 Nc3 d6 g3 Nf6 Bg2 g6 d3 Bg7 Nge2 O-O O-O b6",
 "...b6 left the a8 rook on the long diagonal, behind the c6 knight.",
 ("e5 dxe5 Bxc6","Black takes the pawn","The bishop takes c6 and the a8 rook is next."),
 ("e5 Nxe5 Bxa8","Black takes with the knight","The long diagonal opens and the rook falls."),
 ("e5 Bb7 exf6","Black covers the diagonal","The f6 knight has nowhere to go. You win a piece."))
trap("m075","Closed Sicilian Knight Fork","Sicilian Defense (Closed)",SIC,"b",1,
 "e4 c5 Nc3 d6 Bc4 Nc6 Qf3 e6 a3 a6 Nge2",
 "White's queen on f3 and bishop on c4 are both within reach of one knight move.",
 ("Ne5 Qg3 Nxc4","The queen runs to g3","The knight forks queen and bishop. You take the bishop."),
 ("Ne5 Qf4 Nxc4","The queen runs to f4","The knight forks queen and bishop. You take the bishop."),
 ("Ne5 Bb5+ axb5","White checks first","The desperado check just loses the bishop."))
trap("m079","Caro-Kann Exchange Qa4+","Caro-Kann Defense (Exchange)",CK,"w",2,
 "e4 c6 d4 d5 exd5 cxd5 Bd3 Nf6 h3 b6 c3 Ba6 Nf3 e6",
 "Black offered a bishop trade. Make it, and the recapturing knight lands on the rim.",
 ("Bxa6 Nxa6 Qa4+ Qd7 Qxa6","Black blocks with the queen","Qa4+ forks the king and the a6 knight."),
 ("Bxa6 Nxa6 Qa4+ Nd7 Qxa6","Black blocks with the knight","Qa4+ forks the king and the a6 knight."))
trap("m080","a-file Pin Trick","Indian Defense",ID,"b",2,
 "d4 Nf6 c4 e6 a3 c6 Nc3 Qa5 b4",
 "White's pawn chased your queen, but the a-file leads straight to the a1 rook.",
 ("Bxb4 axb4 Qxa1","White takes the bishop","The a-file opens and your queen takes the rook."),
 ("Bxb4 Bd2 Bxc3","White pins your bishop","Take on c3. You've won two pawns and White's queenside is wrecked."),
 ("Bxb4 Bb2 Bxc3+ Bxc3 Qxc3+ Qd2 Qxa1+ Qd1","White defends with Bb2","The trades leave the a1 rook loose. You come out well ahead."))
trap("m081","London d-file Discovery","London System",OD,"b",2,
 "d4 Nf6 Bf4 d6 e3 b6 Nf3 Bb7 Be2 g6 O-O Bg7 c3 Nbd7 Nbd2 e6 Bd3 e5 dxe5 dxe5 Nxe5",
 "White's knight took e5, but the d-file is open and the d3 bishop is blocked from help by the d2 knight.",
 ("Nxe5 Bxe5 Qxd3","White recaptures on e5","The d-file opens and your queen takes the undefended d3 bishop."),
 ("Nxe5 Bb5+","White checks first","Block the check with either knight. You've won a clean piece."),
 ("Nxe5 Be2","White saves the bishop","You've won a clean piece. Just keep your knights safe."))
trap("m082","King's Indian Attack f2 Strike","King's Indian Attack",FL,"b",3,
 "Nf3 d5 g3 f5 Bg2 Nf6 d3 e6 O-O Bc5 Nbd2 O-O Re1",
 "White's rook left f1, and f2 now has only the king to defend it.",
 ("Bxf2+ Kxf2 Ng4+ Kg1 Ne3","White takes the bishop","Ne3 attacks the queen, and the bishop and pawn it gave up come back with interest."))
trap("m083","Modern Back-Rank Mate","Modern Defense",OD,"w",1,
 "d4 g6 Nc3 Bg7 Bf4 Nf6 e4 d6 e5 dxe5 dxe5 Qxd1+ Rxd1 Nh5 Nd5 Kf8 Nxc7 Nxf4",
 "Black grabbed your bishop. Look at the back rank. About 18,000 Lichess club games have reached this exact position.",
 ("Rd8#","Mate","The rook mates on d8: the c7 knight covers e8 and Black's own pieces block the rest."))
trap("m084","London Pawn Fork II","London System",OD,"w",1,
 "d4 d5 Bf4 Bf5 e3 Nf6 c3 e6 Nd2 Bd6 Bg3 O-O Ngf3 Nc6 Ne5 Nxe5",
 "Black traded on e5. Recapture with the piece that attacks two things.",
 ("dxe5 Ne4","The knight jumps to e4","Take on d6 or trade on e4. Either way the fork wins a piece."),
 ("dxe5 Bxe5 Bxe5","Black gives the bishop","You're a piece up."),
 ("dxe5 Be7 exf6","The bishop retreats","The pawn takes the knight. You're a piece up."))
trap("m086","Scandinavian Defender Swap","Scandinavian Defense (1.e4 d5 2.Nc3)",SCA,"w",1,
 "e4 d5 Nc3 dxe4 Nxe4 Bf5 Bd3 c6 Nf3 Nf6",
 "Black's f6 knight is the only piece defending the f5 bishop.",
 ("Nxf6+ exf6 Bxf5","Black recaptures with the e-pawn","Trade off the defender with check, then take the bishop."),
 ("Nxf6+ gxf6 Bxf5","Black recaptures with the g-pawn","Trade off the defender with check, then take the bishop."))
trap("m087","Scandinavian c2 Fork","Scandinavian Defense (Mieses-Kotroc)",SCA,"b",2,
 "e4 d5 exd5 Qxd5 Nf3 Bf5 Nc3 Qa5 d4 Nc6 Bd2 Nb4 a3",
 "White kicked your knight, but c2 is guarded only by the queen, and your bishop is aimed at it.",
 ("Nxc2+ Ke2 Qa6+ Nb5 Qxb5#","White moves the king","The king is chased into the open and mated on b5."),
 ("Nxc2+ Qxc2 Bxc2","White takes the knight","The bishop recaptures and you've won the queen for a knight."))
trap("m088","Scandinavian h-file Mate","Scandinavian Defense (Modern)",SCA,"b",2,
 "e4 d5 exd5 Nf6 Nf3 Qxd5 Be2 Bg4 O-O Qh5 h3 e5 hxg4 Nxg4 d3 Nc6 Nc3 O-O-O Ne4 Nd4 Ng3",
 "White's h-pawn is gone and the f3 knight is all that guards h2.",
 ("Nxf3+ Bxf3 Qh2#","White recaptures with the bishop","Remove the guard with check, then mate on h2."),
 ("Nxf3+ gxf3 Qh2#","White recaptures with the pawn","Remove the guard with check, then mate on h2."))
trap("m089","Italian Queen Hunt","Italian Game",OG,"b",2,
 "e4 e5 Nf3 Nc6 Bc4 d6 d4 exd4 Nxd4 Nge7 O-O h6 Nc3 Nxd4 Qxd4 Nc6 Qd5",
 "White's queen came to d5 to hit f7, but it is short of squares.",
 ("Be6 Qd3 Ne5","The queen retreats to d3","Ne5 hits the queen and the c4 bishop at once. You win material."),
 ("Be6 Qb5 a6","The queen runs to b5","…a6 chases it again and the c4 bishop is left hanging."))
trap("m090","Giuoco Knight Swap","Italian Game (Giuoco Piano)",OG,"b",2,
 "e4 e5 Bc4 Nc6 Nc3 Bc5 Nf3 Nf6 h3 O-O d3 h6 a3 a6 O-O d6 Be3 Nd4 Na4",
 "White's knight attacked your bishop, but your own knight can trade with check first.",
 ("Nxf3+ Qxf3 Bxe3","White recaptures with the queen","Trade knights with check, then your bishop escapes by taking e3. White's a4 knight is left stranded."))
trap("m091","Two Knights Desperado","Italian Game (Two Knights)",OG,"w",2,
 "e4 e5 Bc4 Nf6 d3 Nc6 Nf3 Be7 O-O d6 Nc3 Bg4 h3 Bh5 Be3 O-O g4 Bg6 Nh4 Nxe4",
 "Black's knight took e4. Before recapturing, take something with check.",
 ("Nxg6 Nxc3 Nxe7+ Qxe7 bxc3","Black takes on c3, then recaptures with the queen","The in-between check on e7 means you win the trade by a piece."),
 ("Nxg6 Nxc3 Nxe7+ Nxe7 bxc3","Black takes on c3, then recaptures with the knight","The in-between check on e7 means you win the trade by a piece."))
trap("m092","Bird Ruy Bishop Pin","Ruy López (Bird Variation)",OG,"w",2,
 "e4 e5 Nf3 Nc6 Bb5 Nd4 Bc4 Nxf3+ Qxf3 Qf6 Qb3 Bc5 O-O Ne7 c3 d6 d4 exd4 cxd4 Bxd4 Nd2 O-O Nf3 Bb6",
 "Black's knight on e7 is guarded only by the queen.",
 ("Bg5 Qg6 Bxe7","The queen steps aside","The bishop takes the e7 knight. You've won a piece."))
trap("m093","Pirc Qc5+ Fork","Pirc Defense",OE,"b",1,
 "e4 d6 Nc3 h6 d4 c6 f4 Qc7 Nf3 Nd7 Bc4 e5 fxe5 dxe5 dxe5 Nxe5 Nxe5 Qxe5 O-O Nf6 Bf4",
 "White's bishop hit your queen, but the c4 bishop and the white king are on the same diagonal.",
 ("Qc5+ Kh1 Qxc4","White moves the king","Qc5+ forks the king and the c4 bishop."))
trap("m094","Pirc Qa5+ Fork","Pirc Defense",OE,"b",1,
 "e4 d6 Nf3 Nf6 Nc3 Nbd7 Bc4 c6 d3 e5 Ng5 d5 exd5 Nxd5 Nxd5 cxd5 Bxd5",
 "White's bishop took d5 and has no defender.",
 ("Qa5+ Bd2 Qxd5","White blocks with the bishop","The check forks the king and the d5 bishop."),
 ("Qa5+ c3 Qxd5","White blocks with the pawn","The check forks the king and the d5 bishop."))
trap("m095","Byrne Nd5 Pile-Up","Pirc Defense (Byrne)",OE,"w",3,
 "e4 d6 d4 Nf6 Nc3 g6 Bg5 Bg7 Qf3 O-O Bc4 Nc6 O-O-O e5",
 "Black's f6 knight is defended by the bishop and queen. Add a third attacker.",
 ("Nd5 Nxd4","Black grabs d4","Take on f6 with check, or recapture on d4. Either way you come out a piece ahead."),
 ("Nd5 Bg4 Nxf6+ Bxf6 Qxf6","Black counterattacks your queen","Take on f6 twice and Black is a piece down."))
trap("m096","Alekhine f7 Mate","Alekhine Defense",OE,"w",1,
 "e4 Nf6 e5 Nd5 Nf3 d6 Bc4 Nb6 Bxf7+ Kxf7 Ng5+ Kg8 e6 Qe8 Qf3 h6",
 "Your pawn on e6 is one step from f7, and your queen can get there first.",
 ("Qf7+ Qxf7 exf7#","Black takes the queen","The pawn recaptures on f7 with mate."))
trap("m098","English Queen Pin","English Opening (Symmetrical)",FL,"b",1,
 "d4 Nf6 c4 c5 Nf3 cxd4 Qxd4 Nc6 Qc3 e6 e3",
 "White's queen and king are on the same diagonal.",
 ("Bb4 Qxb4 Nxb4","White gives up the queen","The queen is pinned to the king and lost for a bishop."),
 ("Bb4 Bd2 Bxc3","White blocks with the bishop","Take the queen."))
trap("m100","London h6 Queen Trap","London System (vs King's Indian)",OD,"b",2,
 "d4 Nf6 Nf3 g6 Bf4 Bg7 Nc3 O-O Qd2 d6 O-O-O Nbd7 Bh6 c6 h4",
 "White wants to trade on h6 and attack. Let the queen come, then shut the door.",
 ("Bxh6 Qxh6 Ng4","White recaptures with the queen","Ng4 traps the queen on h6."))
