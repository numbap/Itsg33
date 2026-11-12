# Batch 9: wide local search, overnight run (tree to move 10 from ~45 million Lichess club games).
# All lines validated with Stockfish.
trap("w011","Centre Fork after ...f6","King's Pawn (Centre Game)",OG,"w",1,
 "e4 e5 d4 f6 dxe5 fxe5",
 "Black recaptured on e5 with the f-pawn and opened the e8–h5 diagonal.",
 ("Qh5+ g6 Qxe5+ Qe7 Qxh8","Black blocks with ...g6","The queen takes e5 with check, then the h8 rook."),
 ("Qh5+ g6 Qxe5+ Ne7 Qxh8","Black blocks with ...g6","The queen takes e5 with check, then the h8 rook."),
 ("Qh5+ g6 Qxe5+ Be7 Qxh8","Black blocks with ...g6","The queen takes e5 with check, then the h8 rook."),
 ("Qh5+ Ke7 Qxe5+ Kf7 Bc4+ Kg6 Qf5#","Black walks the king","The king is chased up the board and mated on g6."))
trap("w012","St. George f7 Fork","St. George Defense",OE,"w",1,
 "e4 a6 Bc4 b5",
 "Black chased your bishop but left f7 and the a8 rook on lines your queen can reach.",
 ("Bxf7+ Kxf7 Qh5+ g6 Qd5+ Kg7 Qxa8","Black takes the bishop","Qh5+ and Qd5+ swing the queen across to fork the king and the a8 rook."))
trap("w013","Stafford h2 Attack","Petrov Defense (Stafford Gambit)",OG,"b",2,
 "e4 e5 Nf3 Nf6 Nxe5 Nc6 Nxc6 dxc6 Nc3 Bc5 Bc4 Ng4 O-O",
 "White castled straight into your knight and bishop. Bring the queen.",
 ("Qh4 h3 Nxf2","White kicks the knight","The knight takes f2 and the white king is wide open."),
 ("Qh4 Bxf7+ Ke7","White checks first","Step aside. Mate on h2 is still coming."))
trap("w014","Scotch g7 Grab","Scotch Game",OG,"w",1,
 "e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Nxd4 Qxd4 b6 Nc3 Bc5",
 "Black's bishop hit your queen, but your queen can take with tempo on the rook.",
 ("Qxg7 Qf6","Black offers a queen trade","Trade queens, or keep them with Qg3. You've won g7 and Black's kingside is wrecked."),
 ("Qxg7 Qh4 Qxh8","Black counterattacks","Take the h8 rook."))
trap("w015","Italian Ng5 Punished","Italian Game (Giuoco Piano)",OG,"b",2,
 "e4 e5 Nf3 Nc6 Bc4 Bc5 Ng5 Qxg5 d4",
 "White gave a knight to open lines, but your queen can feast on the kingside first.",
 ("Qxg2 Rf1","White saves the rook","Take e4 with check, or the d4 pawn with your knight. You're a knight and two pawns up with an attack."),
 ("Qxg2 dxc5","White takes your bishop","Take the h1 rook with check, or grab e4 first. Either way you come out a rook ahead."))
trap("w016","Polish g7 Grab","Polish Opening",FL,"w",1,
 "b4 e5 Bb2 Bxb4 Bxe5 Nc6",
 "Black's knight attacked your bishop, but the bishop has a better capture available.",
 ("Bxg7 Nf6 Bxh8","Black develops","The bishop takes g7 and then the h8 rook."),
 ("Bxg7 Qg5 Bxh8","Black counterattacks","Take the h8 rook."),
 ("Bxg7 f6","Black tries to trap the bishop","It isn't trapped: e3, c3 or a3 all give it a way out. You're a pawn up and Black's king is exposed."),
 ("Bxg7 d5 Bxh8","Black ignores it","Take the h8 rook."))
trap("w017","Légal with h3 Bh5","Philidor Defense (Italian)",OG,"w",2,
 "e4 e5 Nf3 Nc6 Bc4 d6 Nc3 Bg4 h3 Bh5",
 "Black's bishop dropped back to h5, keeping the pin. The pin is still fake.",
 ("Nxe5 Nxe5 Qxh5","Black takes the knight","Black's knight left the defence of h5. Your queen takes the bishop."),
 ("Nxe5 Bxd1 Bxf7+ Ke7 Nd5#","Black takes the queen","Légal's Mate: bishop and two knights."))
trap("w018","Italian Qd5 Fork","Italian Game",OG,"w",2,
 "e4 e5 Nf3 Nc6 Bc4 h6 d4 Nf6 dxe5 Nxe4",
 "Black's knight grabbed e4. It is loose, and f7 is weak.",
 ("Qd5 Qe7 Qxe4","Black guards f7 with the queen","The e4 knight falls."),
 ("Qd5 Ng5 Bxg5","Black retreats the knight","The bishop takes it. You've won a piece."))
trap("w019","Four Knights Fork-Trick Fail","Italian Four Knights",OG,"b",2,
 "e4 e5 Nf3 Nc6 Bc4 Nf6 Nc3 Nxe4 Nxe4 d5 Bb5",
 "White's knight on e4 is attacked by your d-pawn and has nowhere good to go.",
 ("dxe4 Nxe5 Qg5","White grabs e5","Qg5 forks the e5 knight and g2. You come out ahead."),
 ("dxe4 Bxc6+ bxc6","White trades on c6","You've won back the piece with a pawn to spare."))
trap("w020","Fried Liver Counterattack","Two Knights Defense",OG,"b",3,
 "e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 Nxe4 Nxf7 Qh4 O-O",
 "White castled into your queen's attack. f2 is the weak point.",
 ("Nxf2 Rxf2 Bc5","White takes the knight","The pinned rook can't hold. You win back the material with a crushing attack."),
 ("Nxf2 g3 Nh3+ Kg2 Qxc4","White kicks the queen","Check first, then the queen takes the c4 bishop."))
trap("w021","Jobava Queen Swap Fork","London System (Jobava)",OD,"w",2,
 "d4 d5 Nc3 Nf6 Bf4 Nc6 Nb5 e5 Bxe5 Nxe5 dxe5 Ne4",
 "Black's knight moved and left d5 and c7 weak.",
 ("Qxd5 Qxd5 Nxc7+ Kd7 Nxd5","Black trades queens","Nxc7+ forks king and queen. You win the queen back with a pawn extra."),
 ("Qxd5 Qxd5 Nxc7+ Kd8 Nxd5","Black trades queens","Nxc7+ forks king and queen. You win the queen back with a pawn extra."),
 ("Qxd5 Qxd5 Nxc7+ Ke7 Nxd5+ Ke6","Black trades queens","Nxc7+ forks king and queen. You win the queen back with a pawn extra."),
 ("Qxd5 a6","Black kicks the knight","Trade queens on d8, or play Rd1. You're a pawn up and the e4 knight is loose."))
trap("w022","Elephant Knight Trap","Elephant Gambit",OG,"b",1,
 "e4 e5 Nf3 d5 Nc3 d4 Nd5",
 "White's knight jumped to d5, deep in your camp.",
 ("c6 Nxe5","White grabs e5","The d5 knight is still lost: take it now or develop first."),
 ("c6 Nb4 Bxb4","The knight runs to b4","Take it."),
 ("c6 Bc4 cxd5","White defends the knight","Take it anyway."))
trap("w023","Traxler Mate","Two Knights Defense (Traxler)",OG,"b",3,
 "e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 Bc5 Nxf7 Bxf2+ Kxf2 Nxe4+ Ke1",
 "White's king went back to e1, right into your queen's reach.",
 ("Qh4+ g3 Nxg3","White blocks with g3","The knight takes g3 and the white king is in a mating net."),
 ("Qh4+ Ke2","The king runs","Qf2+ (or ...Nd4+) hunts the king across the board to mate."))
trap("w024","Four Knights Fork Trick","Four Knights Game",OG,"w",2,
 "e4 e5 Nf3 Nc6 Nc3 Bc5 Nxe5 Nxe5 d4 Bb4",
 "Your d-pawn forked bishop and knight. Black saved the bishop.",
 ("dxe5 Bxc3+ bxc3","Black trades on c3","You've won back the piece and you're a pawn up."),
 ("dxe5 Qe7","Black attacks e5","Hold it with f4, or just develop. You're a pawn up with the centre."),
 ("dxe5 Ne7","Black develops","You're a clean pawn up. Develop and keep it."))
trap("w025","Borg Pawn Fork","Borg Defense",OE,"b",1,
 "e4 g5 Bc4 g4 Qxg4",
 "White's queen took g4 and now stands on the c8 bishop's diagonal.",
 ("d5 Qe2 dxc4","The queen retreats","…d5 forked the bishop and opened your bishop's line. You win the bishop."),
 ("d5 exd5 Bxg4","White takes the pawn","Your bishop takes the queen."),
 ("d5 Bb5+ c6","White checks first","Block, and the queen and bishop are both still attacked."),
 ("d5 Bxd5 Bxg4","White takes with the bishop","Your bishop takes the queen."))
trap("w026","Blackmar Knight Trap","Blackmar–Diemer Gambit",QG,"w",1,
 "d4 d5 e4 Nf6 e5 Ne4",
 "Black's knight jumped to e4 with no retreat.",
 ("f3 Nf2 Kxf2","The knight grabs f2","It gets only a pawn before being taken."),
 ("f3 e6","Black ignores it","The knight has nowhere to go. Take it now or develop first."),
 ("f3 Ng5 Bxg5","The knight runs to g5","The bishop takes it."),
 ("f3 Bf5 fxe4","Black defends the knight","Take it anyway."))
trap("w027","Knight Trapped on h5","Pirc Defense (1.d4)",OD,"w",1,
 "d4 Nf6 Nc3 g6 e4 Bg7 e5 Nh5",
 "Black's knight went to the rim on h5. Take away its last square.",
 ("g4 Nf6 exf6","The knight returns to f6","Your pawn takes it."),
 ("g4 d6","Black counterattacks","The knight is still trapped. Take it now or develop first."))
trap("w028","French f4 Punished","French Defense",FR,"b",2,
 "e4 e6 e5 d6 f4",
 "White's f4 opened the e1–h4 diagonal while e5 is about to fall.",
 ("dxe5 fxe5 Qh4+ g3 Qe4+ Qe2 Qxh1","White recaptures","The queen checks and forks king and the h1 rook."),
 ("dxe5 d3 exf4","White doesn't recapture","You're a clean pawn up with a strong position."))
trap("w029","Exchange Ruy f7 Raid Punished","Ruy López (Exchange)",OG,"b",2,
 "e4 e5 Nf3 Nc6 Bb5 a6 Bxc6 dxc6 Nxe5 Qd4 Nxf7",
 "White's knight grabbed f7 and left e4 loose.",
 ("Qxe4+ Qe2 Qxe2+ Kxe2 Kxf7","White blocks with the queen","Trade queens, then take the knight. A piece up."),
 ("Qxe4+ Kf1","White moves the king","Take the f7 knight (or check on c4 first). You're a piece up and White can't castle."))
trap("w030","Scotch Qd5 Fork","Scotch Game",OG,"w",1,
 "e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Nxd4 Qxd4 b6 Bc4 Bc5",
 "Black's ...b6 left the a8 rook on the long diagonal, and f7 is weak too.",
 ("Qd5 Qf6 Qxa8","Black guards f7","Qd5 hit f7 and a8. Take the rook."),
 ("Qd5 Qe7 Qxa8","Black guards f7","Qd5 hit f7 and a8. Take the rook."))
trap("w031","Sicilian Knight Trap","Sicilian Defense",SIC,"w",2,
 "e4 c5 Nf3 Nc6 d4 e6 d5 exd5 exd5 Nb4",
 "Black's knight went to b4. Your a-pawn can chase it.",
 ("a3 Na6 d6","The knight runs to a6","It's stuck on the rim and d6 cramps Black badly."),
 ("a3 Nxd5 Qxd5","The knight grabs d5","Your queen takes it. A piece up."))
trap("w032","Danish Queen Pin","Danish Gambit",OG,"w",2,
 "e4 e5 d4 exd4 c3 dxc3 Bc4 cxb2 Bxb2 Nf6 e5 Qe7",
 "Black's queen pinned your e-pawn, but the f6 knight has run out of squares.",
 ("Qe2 Nh5 Qxh5","The knight runs to h5","Your queen takes it."))
trap("w033","Vienna Gambit Knight Raid","Vienna Gambit",OG,"w",3,
 "e4 e5 Nc3 Nf6 f4 exf4 e5 Qe7 Qe2 Ng8 Nf3 d6",
 "Black's queen and king are lined up near c7. Your knight can reach it.",
 ("Nd5 Qd7","The queen retreats to d7","exd6+ opens a discovered attack, and the knight heads for c7 and the a8 rook."),
 ("Nd5 Qe6 Nxc7+ Kd8 Nxe6+ Bxe6","The queen retreats to e6","Nxc7+ forks king and queen."),
 ("Nd5 Qd8","The queen goes back to d8","Nxc7+ or exd6+ next: the knight crashes through to a8."),
 ("Nd5 dxe5 Nxe7","Black takes on e5","The knight takes the queen."))
