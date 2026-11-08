# Mined batch 1: traps found in the Lichess puzzle database, ranked by how often club
# players (1000-2000) make the losing move, and validated with Stockfish 16.
# Appended to build_db.py via exec(); uses trap() and the family constants defined there.
SCA="Scandinavian"

trap("m001","Rubinstein Queen Trap","French Defense (Rubinstein)",FR,"w",2,
 "e4 e6 d4 d5 Nd2 dxe4 Nxe4 Nf6 Nxf6+ Qxf6 Nf3 Bd6 Bd3 Nc6",
 "Black's queen on f6 looks active. Count its escape squares.",
 ("Bg5 Qxg5 Nxg5","Black takes the bishop","The queen is trapped: every square is covered by a bishop, knight or pawn. Black gives it up for a bishop."),
 ("Bg5 Qxd4 Nxd4","Black grabs d4","The queen tries to escape with a capture and is simply taken."),
 ("Bg5 Qxf3 Qxf3","Black gives the queen for a knight","Recapture either way. You're a queen for a knight ahead."),
 ("Bg5 Qxf3 gxf3","Black gives the queen for a knight","Recapture either way. You're a queen for a knight ahead."),
 ("Bg5 Nxd4 Bxf6","Black counterattacks with ...Nxd4","Black hopes for complications, but you just take the queen."))
trap("m002","French Exchange Queen Fork","French Defense (Exchange)",FR,"b",1,
 "e4 e6 d4 d5 Nc3 Ne7 exd5 Nxd5 Nxd5 exd5 c4 c6 cxd5 cxd5 Nf3 Nc6 Bb5",
 "White's bishop on b5 has no defender, and the white king is still on e1.",
 ("Qa5+ Bd2 Qxb5","White blocks with the bishop","A check that also attacks b5. You win a clean piece."),
 ("Qa5+ Qd2 Qxb5","White blocks with the queen","A check that also attacks b5. You win a clean piece."))
trap("m003","Carlson Gambit Punisher","French Defense (Carlson Gambit)",FR,"w",1,
 "e4 e6 Nf3 d5 Ne5 Bd6 d4 dxe4 Bf4 f6",
 "Black chased your knight with ...f6 and opened the e8–h5 diagonal.",
 ("Qh5+ g6 Nxg6","Black blocks with ...g6","The knight takes on g6 and forks the queen and rook. The h-pawn is pinned to the rook."),
 ("Qh5+ Ke7 Qf7#","Black moves the king","Mate on f7. The knight on e5 guards it."))
trap("m004","Bird–French e-file Check","French Defense (La Bourdonnais)",FR,"w",2,
 "f4 e6 e4 d5 exd5 exd5 Nf3 Bg4 d4 Nf6 Bd3 Nc6 O-O Nxd4",
 "Black grabbed d4, but the e-file is open and Black's king hasn't castled.",
 ("Qe1+ Ne6 f5","Black blocks with the knight","The knight is pinned to the king and f5 wins it."),
 ("Qe1+ Be7 Nxd4","Black blocks with the bishop","Check first, then take back on d4. You've won a piece."))
trap("m005","Pirc Desperado Trick","Pirc Defense",OE,"b",2,
 "e4 d6 d4 Nf6 e5 dxe5 Nf3 e4 Ne5 e6 Bg5 Bd6 Nc3 O-O Nxe4",
 "White's knight took e4, but the e5 knight and d4 pawn are both loose.",
 ("Bxe5 dxe5 Qxd1+ Rxd1 Nxe4","White recaptures on e5","Trade queens on d1 and pick up the e4 knight. A clean piece up."),
 ("Bxe5 Nxf6+ Bxf6","White takes on f6 with check","Recapture with the bishop and you're a piece up."),
 ("Bxe5 Bxf6 Bxf6","White takes on f6","Recapture with the bishop and you're a piece up."),
 ("Bxe5 c3 Qd5","White defends d4","The e4 knight is attacked twice and can't be held. You win material."))
trap("m006","Advance French d4 Grab","French Defense (Advance)",FR,"w",2,
 "e4 e6 Nf3 d5 e5 Ne7 d4 c5 c3 cxd4 cxd4 Nbc6 Nc3 Qb6 Be2 Nf5 Bb5 Bd7 O-O Nfxd4",
 "Black's knight grabbed d4. Look at what is lined up on the b6–d4 diagonal.",
 ("Nxd4 Nxd4 Bxd7+ Kxd7 Be3","Black recaptures with the knight","Bxd7+ drags the king out, then Be3 pins the d4 knight to the queen."),
 ("Nxd4 Qxd4 Bxc6","Black recaptures with the queen","Bxc6 removes the knight with a hanging bishop on d7. You come out a piece ahead."))
trap("m007","Averbakh e5 Trap","King's Indian Defense (Averbakh)",ID,"w",2,
 "d4 Nf6 c4 d6 Nc3 g6 e4 Bg7 Bg5 e5",
 "Black played ...e5 before castling. Trade queens and look at the king.",
 ("dxe5 dxe5 Qxd8+ Kxd8 Nd5","The queens come off","The king recaptured on d8, so Bg5 now pins the f6 knight. Nd5 attacks it a second time and c7 as well."))
trap("m008","London Pawn Fork","London System",OD,"b",1,
 "d4 Nf6 Bf4 d6 Nf3 g6 e3 Bg7 c3 O-O Bd3 Nbd7 h3 Re8 O-O",
 "White's bishop on f4 and the pieces on d3 and f3 are all within reach of your e-pawn.",
 ("e5 dxe5 dxe5","White takes on e5","The bishop is attacked, and …e4 will fork the d3 bishop and f3 knight."),
 ("e5 Bg3 e4","White retreats the bishop","…e4 forks the bishop and knight."))
trap("m009","Stonewall f7 Queen Trap","Queen's Pawn (Stonewall)",OD,"w",2,
 "d4 g6 e3 Bg7 f4 Nf6 Nf3 d6 c3 Nbd7 Bc4 O-O O-O Re8",
 "...Re8 took a defender away from f7 and boxed in the black queen.",
 ("Bxf7+ Kxf7 Ng5+ Kg8 Ne6","Black takes the bishop","Ne6 traps the queen: e8 is blocked by the rook and every other square is covered."))
trap("m010","Queen's Indian d5 Trick","Queen's Indian Defense",ID,"w",3,
 "d4 Nf6 Nc3 e6 e4 b6 Bg5 Be7 Nf3 Bb7 d5 exd5 exd5 Nxd5",
 "Black's knight took on d5, but the e7 bishop and d5 are both short of defenders.",
 ("Nxd5 Bxg5 Nxg5","Black takes on g5","You've won the d5 knight and Black's queen is now loose on d8."),
 ("Nxd5 Bxd5 Qxd5","Black recaptures on d5","Black is a piece down and the e7 bishop is still pinned."))
trap("m011","London h-file Discovery","London System",OD,"w",2,
 "d4 Nf6 Bf4 e6 e3 c5 c3 d5 Nf3 Be7 Bd3 Nc6 Nbd2 Nh5 Bg3 O-O Ne5 Nxg3",
 "Black took your bishop. Before recapturing, look down the h-file.",
 ("Bxh7+ Kxh7 hxg3+ Kg8 Qh5","Black takes the bishop","hxg3+ is a discovered check from the h1 rook. Qh5 threatens mate."),
 ("Bxh7+ Kh8 hxg3","Black steps aside","The h-file is open and Black's king is in serious danger."))
trap("m012","London f7 Queen Trap","London System",OD,"w",2,
 "d4 Nf6 Bf4 g6 e3 Bg7 c3 O-O Nf3 d6 Nbd2 Nbd7 Bc4 Re8 O-O a6",
 "Black's rook left f8. f7 is weak and the queen has few squares.",
 ("Bxf7+ Kxf7 Ng5+ Kg8 Ne6","Black takes the bishop","Ne6 traps the black queen on d8."),
 ("Bxf7+ Kh8","Black declines the bishop","You're a pawn up and the bishop forks the e8 rook. Ng5 or Bxe8 next."))
trap("m013","Scandinavian Desperado Check","Scandinavian Defense (Modern)",SCA,"w",2,
 "e4 d5 exd5 Nf6 Nf3 Qxd5 Nc3 Qd6 d4 Bg4 Be2 Nc6 h3 Bxf3 Bxf3 Qxd4",
 "Black's queen grabbed d4, on the same file as your queen.",
 ("Bxc6+ bxc6 Qxd4","Black recaptures","The check moves your bishop off the d-file with tempo. The queen falls."),
 ("Bxc6+ Qd7 Bxd7+ Nxd7","Black blocks with the queen","Black has to give the queen anyway."))
trap("m014","Scandinavian Légal Mate","Scandinavian Defense",SCA,"w",1,
 "e4 c6 Nf3 d5 exd5 Qxd5 d4 Nf6 Nc3 Qd8 Bc4 Bg4 Ne5 Bxd1",
 "Black took your queen. The f7 square is defended only by the king.",
 ("Bxf7#","Mate","Bishop takes f7 with mate: the e5 knight covers d7 and g6."))
trap("m015","Queen Trap on b6","Nimzowitsch Defense (Scandinavian)",SCA,"w",2,
 "e4 Nc6 d4 d5 exd5 Qxd5 Nf3 Bg4 Nc3 Qa5 Bd2 O-O-O Be2 Nf6 O-O Qb6",
 "Black's queen went to b6. Which squares are left for it?",
 ("Na4 Bxf3 Nxb6+ axb6","Black takes on f3 first","The queen is trapped and falls with check."),
 ("Na4 Bxf3 Nxb6+ cxb6","Black takes on f3 first","The queen is trapped and falls with check."),
 ("Na4 Qxd4 Nxd4","Black grabs d4","The queen escapes with a capture and is taken."),
 ("Na4 Nxd4 Nxb6+ axb6 Nxd4","Black counterattacks on d4","You win the queen and then the d4 knight too."))
trap("m016","Scandinavian Scholar's Mate","Scandinavian Defense (Valencian)",SCA,"w",1,
 "e4 d5 exd5 Qxd5 Nc3 Qd8 Bc4 Nc6 Qf3 e5",
 "Your queen and bishop are both aimed at f7.",
 ("Qxf7#","Mate","Black's last move covered nothing. Mate on f7."))
trap("m017","Poisoned g2 Pawn","Scandinavian Defense (Modern)",SCA,"w",1,
 "e4 d5 exd5 Nf6 Nc3 Nxd5 Nxd5 Qxd5 d3 Bf5 Be2 Qxg2",
 "Black's queen grabbed g2. Shut the door behind it.",
 ("Bf3 Qg6 Bxb7","The queen escapes to g6","You win back the pawn and the a8 rook is next."),
 ("Bf3 Bg4 Bxg2","Black blocks with the bishop","The queen is trapped and taken."))
trap("m018","Scandinavian Knight Mate","Scandinavian Defense (Mieses)",SCA,"b",1,
 "e4 d5 exd5 Qxd5 Nc3 Qe5+ Nge2 Nc6 g3 Nd4 d3",
 "White's king is boxed in by its own pieces, and your queen controls the e-file.",
 ("Nf3#","Mate","The knight checks from f3 and every escape square is covered or blocked."))
trap("m019","Scotch f2 Mate","Scotch Game",OG,"b",1,
 "e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Qf6 Nc3 Bc5 Nxc6",
 "White took your knight. Your queen and bishop are both aimed at f2.",
 ("Qxf2#","Mate","Queen takes f2 with mate, supported by the c5 bishop."))
trap("m020","Urusov Counter-Sacrifice","Urusov Gambit",OG,"b",3,
 "e4 e5 Bc4 Nf6 d4 exd4 Nf3 Nc6 e5 d5 Bb5 Ne4 Nxd4 Bc5 Bxc6+ bxc6 Be3 O-O Nxc6",
 "White's knight forks your queen. Ignore it and attack f2 instead.",
 ("Bxe3 Nxd8 Bxf2+ Kf1 Ba6+ Qd3 Bxd3+ cxd3","White takes the queen, king to f1","The bishops win back far more than the queen."),
 ("Bxe3 Nxd8 Bxf2+ Kf1 Ba6+ Qe2 Bxe2+ Kxe2","White takes the queen, king to f1","The bishops win back far more than the queen."),
 ("Bxe3 Nxd8 Bxf2+ Ke2 Bg4+ Kd3","White takes the queen, king to e2","The white king is hunted in the centre."))
trap("m021","Scotch e-file Pin","Scotch Game",OG,"w",2,
 "e4 e5 Nf3 Nc6 d4 exd4 Bd3 Nf6 e5 Ng4 O-O Ngxe5",
 "Black's knight took e5 on the e-file, with the king behind it.",
 ("Nxe5 Nxe5 Re1","Black recaptures","The rook pins the e5 knight to the king. Black can't hold it."))
trap("m022","Scotch Gambit Discovered Check","Scotch Gambit",OG,"w",2,
 "e4 e5 Nf3 Nc6 d4 exd4 Bc4 Bc5 O-O d6 Re1 Bg4 e5 dxe5",
 "Like Légal's Mate: the pin on your knight isn't real, and the e-file is open.",
 ("Nxe5 Bxd1 Nxc6+ Kd7 Nxd8","Black takes the queen","Nxc6+ is a discovered check from the e1 rook. Then Nxd8 wins the queen back."),
 ("Nxe5 Bxd1 Nxc6+ Kf8 Nxd8","Black takes the queen","Nxc6+ is a discovered check from the e1 rook. Then Nxd8 wins the queen back."),
 ("Nxe5 Bxd1 Nxc6+ Ne7 Nxd8","Black takes the queen","Nxc6+ is a discovered check from the e1 rook. Then Nxd8 wins the queen back."),
 ("Nxe5 Nxe5 Rxe5+ Be6","Black takes the knight","The rook recaptures with check. You're a pawn up with a big attack."))
trap("m024","Giuoco Bd5 Fork","Italian Game (Giuoco Piano)",OG,"w",2,
 "e4 e5 Nf3 Nc6 Bc4 Bc5 O-O d6 h3 h6 Nc3 Nf6 Nd5 O-O d3 a6 Be3 Bxe3 fxe3 b5",
 "Black kicked your bishop. Trade first, then find a better square for it.",
 ("Nxf6+ Qxf6 Bd5","Black recaptures with the queen","Bd5 attacks the c6 knight and the a8 rook at once."))
trap("m025","Italian Qe6 Mate","Italian Game (Anti-Fried Liver)",OG,"w",1,
 "e4 e5 Nf3 Nc6 Bc4 h6 c3 d6 d4 exd4 cxd4 Bg4 Qb3 Bxf3",
 "Black took your knight. Your queen and bishop are both aimed at f7.",
 ("Bxf7+ Ke7 Qe6#","The king steps up","Queen to e6 is mate, protected by the bishop."),
 ("Bxf7+ Kd7 Qe6#","The king steps up","Queen to e6 is mate, protected by the bishop."))
