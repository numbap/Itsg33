import json
T=[]
def trap(id,name,opening,family,side,level,setup,idea,*lines,soft=None):
    T.append(dict(**({'soft':soft} if soft else {}),id=id,name=name,opening=opening,family=family,side=side,level=level,setup=setup,idea=idea,
      lines=[dict(moves=l[0],label=l[1],note=l[2],**({"best":True} if len(l)>3 and l[3] else {})) for l in lines]))
OG,SIC,FR,CK,OE,QG,ID,OD,FL="Open Games","Sicilian","French","Caro-Kann","Other 1.e4","Queen's Gambit","Indian Defences","London & Other 1.d4","Flank Openings"

# ---------------- Open games ----------------
trap("scholar","Scholar's Mate","Scholar's Attack",OG,"w",1,"e4 e5 Bc4 Nc6 Qh5 Nf6",
 "Queen and bishop both aim at f7. Black just attacked your queen instead of covering it.",
 ("Qxf7#","Mate on f7","The classic four-move mate. Only the king defended f7."))
trap("legal","Légal's Mate","Philidor Defense",OG,"w",2,"e4 e5 Nf3 d6 Bc4 Bg4 Nc3 g6",
 "Black's bishop pins your knight to the queen. The pin is fake: give up the queen.",
 ("Nxe5 Bxd1 Bxf7+ Ke7 Nd5#","Black grabs the queen","Bishop and two knights deliver mate. The queen was bait."),
 ("Nxe5 dxe5 Qxg4","Black takes the knight","Black sees the danger, but Qxg4 wins back the piece and you stay a clean pawn up."))
trap("damiano","Damiano Punishment","Damiano Defense",OG,"w",1,"e4 e5 Nf3 f6",
 "2...f6 weakens the e8–h5 diagonal. Sacrifice a piece to exploit it.",
 ("Nxe5 fxe5 Qh5+ g6 Qxe5+ Qe7 Qxh8","Black blocks with ...g6","The queen forks king and rook. You win the exchange plus two pawns."),
 ("Nxe5 fxe5 Qh5+ Ke7 Qxe5+ Kf7","Black walks the king","The king is dragged into the open. Bc4+ or Qd5+ next and the attack is decisive."),
 ("Nxe5 Qe7 Nf3 Qxe4+ Be2","Black declines the knight","Black regains the pawn, but the queen is exposed and you are well ahead in development."),soft=["Bc4"])
trap("hanham","Hanham Trap","Philidor Defense (Hanham)",OG,"w",2,"e4 e5 Nf3 d6 d4 Nd7 Bc4 Ngf6",
 "Open the centre. With the d-file and f7 both weak, Black's queen and king run out of room.",
 ("dxe5 dxe5 Ng5","Black recaptures with the pawn","Ng5 hits f7 twice and Black can't hold it. Nxf7 or Bxf7+ wins material next."),
 ("dxe5 Nxe5 Nxe5 dxe5 Bxf7+ Kxf7 Qxd8","Black recaptures with the knight, then takes on f7","The bishop check opens the d-file and the black queen falls."),
 ("dxe5 Nxe5 Nxe5 dxe5 Bxf7+ Ke7","Black recaptures with the knight, king steps up","Black keeps the queen. Trade queens with Qxd8+ and you're a clean pawn up."))
trap("philidor","Philidor f7 Trap","Philidor Defense",OG,"w",2,"e4 e5 Nf3 d6 d4 Nd7 Bc4 Be7",
 "Black's last move blocked nothing important. Open lines toward f7.",
 ("dxe5 dxe5 Qd5 Nh6 Bxh6","Black recaptures with the pawn, ...Nh6","Qd5 threatens mate on f7. After ...Nh6 the defender is simply taken."),
 ("dxe5 dxe5 Qd5 Bb4+ c3 Qe7 cxb4","Black recaptures with the pawn, ...Bb4+","The check runs out of steam. You collect the bishop."),
 ("dxe5 Nxe5 Nxe5 dxe5 Qh5 g6 Qxe5","Black recaptures with the knight","Qh5 hits f7 and e5 at once. You win a pawn and keep the attack."))
trap("opera","Opera Game Trap","Philidor Defense",OG,"w",2,"e4 e5 Nf3 d6 d4 Bg4 dxe5 Bxf3 Qxf3 dxe5 Bc4 Nf6",
 "Morphy's idea from the Opera Game (1858): one queen move attacks two weak pawns.",
 ("Qb3 Qe7 Qxb7","Black guards f7 with the queen","b7 falls and the a8 rook is next. Morphy preferred Nc3, keeping the attack going."),
 ("Qb3 Qe7 Nc3","Black guards f7 with the queen","Morphy's choice: develop first, the b7 pawn isn't going anywhere."),
 ("Qb3 Bc5 Bxf7+ Ke7","Black counterattacks with ...Bc5","You've taken f7 with check. The black king can never castle and you're a pawn up."))
trap("petrov","Petrov Copycat Trap","Petrov Defense",OG,"w",1,"e4 e5 Nf3 Nf6 Nxe5 Nxe4",
 "Black copied your capture. The e-file is about to open against the black king.",
 ("Qe2 Nf6 Nc6+ Be7 Nxd8","Black retreats the knight","Nc6+ is a discovered check that also attacks d8. The queen falls."),
 ("Qe2 Nf6 Nc6+ Qe7 Nxe7","Black retreats the knight","Nc6+ is a discovered check that also attacks d8. The queen falls."),
 ("Qe2 d5 d3","Black defends the knight with ...d5","The e4 knight is pinned to the king and cannot be saved."),
 ("Qe2 Qe7 Qxe4 d6 d4","Best defence: Black mirrors you","Material is level, but Black lost time with the queen. A small edge for you.",True))
trap("blackburne","Blackburne Shilling Gambit","Italian Game",OG,"b",2,"e4 e5 Nf3 Nc6 Bc4 Nd4 Nxe5",
 "White grabbed the e5 pawn. Hit two targets at once.",
 ("Qg5 Nxf7 Qxg2 Rf1 Qxe4+ Be2 Nf3#","White forks f7","Smothered-style mate with the knight on f3."),
 ("Qg5 Bxf7+ Kd8 O-O Qxe5","Best defence: White checks first","After …Kd8 you collect the e5 knight. A piece for two pawns: you're slightly better.",True),
 ("Qg5 Ng4 d5","White retreats to g4","…d5 hits the bishop and opens your bishop onto g4. White loses material."))
trap("twoknights","Two Knights Greed Punished","Two Knights Defense",OG,"w",2,"e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 Nxe4",
 "Black took a pawn instead of defending f7.",
 ("Bxf7+ Ke7 d4 h6 Nxe4 Kxf7 d5","Black's king must step up","The black king has lost castling and stands in the open. You regain the piece with a big edge."))
trap("stafford","Stafford Gambit Trap","Petrov Defense (Stafford Gambit)",OG,"b",2,"e4 e5 Nf3 Nf6 Nxe5 Nc6 Nxc6 dxc6 d3 Bc5 Bg5",
 "White pins your knight to your queen. Ignore the pin and attack f2.",
 ("Nxe4 Bxd8 Bxf2+ Ke2 Bg4#","White takes the queen","Bishop mate on g4. White was a queen up for one move."),
 ("Nxe4 dxe4 Bxf2+ Kxf2 Qxd1","White takes the knight","The open d-file hands you White's queen."),
 ("Nxe4 Be3 Bxe3 fxe3 Qh4+","White retreats the bishop","You're a pawn up and the white king is under fire."))
trap("stafforde5","Stafford e5 Trap","Petrov Defense (Stafford Gambit)",OG,"b",2,"e4 e5 Nf3 Nf6 Nxe5 Nc6 Nxc6 dxc6 e5 Ne4 d3",
 "White is chasing your knight. Let it go and aim at f2 instead.",
 ("Bc5 dxe4 Bxf2+ Kxf2 Qxd1","White takes the knight","The d-file opened and White's queen drops."),
 ("Bc5 Be3 Bxe3 fxe3 Qh4+ g3 Nxg3 hxg3 Qxh1","White blocks with Be3","The kingside collapses and you collect the h1 rook."))
trap("kgd","Classical King's Gambit Trap","King's Gambit Declined",OG,"b",1,"e4 e5 f4 Bc5 fxe5",
 "White took on e5 and left the e1–h4 diagonal open.",
 ("Qh4+ g3 Qxe4+ Qe2 Qxh1","White blocks with g3","The queen check forks king and rook. You win the h1 rook."),
 ("Qh4+ g3 Qxe4+ Be2 Qxh1","White blocks with g3","The queen check forks king and rook. You win the h1 rook."),
 ("Qh4+ Ke2 Qxe4#","White moves the king","Every escape square is covered. Mate."))
trap("vienna","Vienna Queen Raid","Vienna Game",OG,"w",1,"e4 e5 Nc3 Nc6 Bc4 Bc5 Qg4 Nf6",
 "Black attacked your queen but left g7 hanging.",
 ("Qxg7 Rf8","Black saves the rook","You've won a pawn and Black can't castle kingside."),
 ("Qxg7 Bxf2+ Kxf2 Rf8 d3","Black sacrifices on f2","The desperado gets one pawn back but you're a piece up."),
 ("Qxg7 d5","Black counterattacks with ...d5","Too slow: Qxh8+ or Nxd5 wins a whole rook."))
trap("tarrasch","Tarrasch Trap","Ruy López (Steinitz Defense)",OG,"w",3,"e4 e5 Nf3 Nc6 Bb5 d6 d4 Bd7 Nc3 Nf6 O-O Be7 Re1 O-O",
 "Black castled too early. The e5 pawn is pinned in a way Black hasn't noticed.",
 ("Bxc6 Bxc6 dxe5 dxe5 Qxd8 Raxd8 Nxe5 Bxe4 Nxe4 Nxe4 Nd3 f5 f3 Bc5+ Nxc5 Nxc5 Bg5","The main trap line","After the trades the Bg5 skewer wins material along the d- and e-files."),
 ("Bxc6 Bxc6 dxe5 Ng4 exd6 Bxd6","Best defence: ...Ng4","Black avoids the trap. You're simply a pawn up.",True),
 ("Bxc6 exd4 Bxd7","Black takes on d4","Black ignores the bishop and loses a piece."))
trap("mortimer","Mortimer Trap","Ruy López (Berlin)",OG,"b",2,"e4 e5 Nf3 Nc6 Bb5 Nf6 d3 Ne7 Nxe5",
 "White grabbed e5. Both the knight and the bishop are loose.",
 ("c6 Ba4 Qa5+ Nc3 Qxe5","The bishop retreats","The queen check forks king and knight."),
 ("c6 Ba4 Qa5+ c3 Qxe5","The bishop retreats","The queen check forks king and knight."),
 ("c6 Nc4","The knight retreats to c4","Careful: …cxb5? allows Nd6 mate! Play …d6 or …Ng6 first and the bishop is still lost."),
 ("c6 Nxf7 Kxf7 Bc4+ d5 Bb3","Best defence: White sacrifices on f7","Two pawns for the piece. You stay clearly better.",True))
trap("noah","Noah's Ark Trap","Ruy López",OG,"b",2,"e4 e5 Nf3 Nc6 Bb5 a6 Ba4 d6 d4 b5 Bb3 Nxd4 Nxd4 exd4 Qxd4",
 "White's bishop on b3 has very few squares. Take them away.",
 ("c5 Qd5 Be6 Qc6+ Bd7 Qd5 c4","White's queen checks","…c4 traps the b3 bishop: the ark closes."),
 ("c5 Qd5 Be6 Qd3 c4","White's queen retreats","The bishop has nowhere to go."),
 ("c5 Qd1 c4","White retreats at once","a4 and c2 are covered and the bishop is lost."))
trap("fishing","Fishing Pole Trap","Ruy López (Berlin)",OG,"b",2,"e4 e5 Nf3 Nc6 Bb5 Nf6 O-O Ng4 h3 h5 hxg4",
 "White took the bait. Open the h-file toward the white king.",
 ("hxg4 Nh2 Qh4","White retreats to h2","The queen and rook line up on the h-file. Mate is close."),
 ("hxg4 Ne1 Qh4 f3","White retreats to e1","Now …g3 (or …Bc5+) and mate on h2 or h1 can't be stopped."),
 ("hxg4 c3","Best defence: White ignores the knight","Take on f3 next and you're a piece up with an open h-file.",True))
trap("exruy","Exchange Ruy h-file Trap","Ruy López (Exchange)",OG,"b",3,"e4 e5 Nf3 Nc6 Bb5 a6 Bxc6 dxc6 O-O Bg4 h3 h5 hxg4",
 "White took your bishop. Recapture and the h-file is yours.",
 ("hxg4 Nxe5 Qh4 f3","White grabs e5","Now …g3 leaves no defence to mate on h2 or h1."),
 ("hxg4 Nxe5 Qh4 f4","White grabs e5","Now …g3 leaves no defence to mate on h2 or h1."),
 ("hxg4 d3 Qf6","Best defence: White gives the piece back","You keep a lasting initiative on the kingside.",True))
trap("marshall","Marshall Trap","Petrov Defense",OG,"b",3,"e4 e5 Nf3 Nf6 Nxe5 d6 Nf3 Nxe4 d4 d5 Bd3 Bd6 O-O O-O c4 Bg4 cxd5 f5 Re1",
 "White's rook left f2 thin. Strip the king.",
 ("Bxh2+ Kxh2 Nxf2 Qe2 Nxd3 Qxd3 Bxf3 Qxf3 Qh4+ Kg1 Qxe1+","White recaptures on d3","The h4 check forks king and the e1 rook. You come out a rook ahead."),
 ("Bxh2+ Nxh2 Bxd1","White takes with the knight","The queen falls."),
 ("Bxh2+ Kxh2 Nxf2 Qe2 Nxd3 Qe6+ Kh8","Best defence: Qe6+","White avoids the worst. You stay a pawn up with the safer king.",True))

# ---------------- Sicilian ----------------
trap("magnus","Magnus Smith Trap","Sicilian Defense (Dragon)",SIC,"w",2,"e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 Nc6 Bc4 g6 Nxc6 bxc6",
 "Black's f7 and d-file are both soft. Push into the centre.",
 ("e5 dxe5 Bxf7+ Kxf7 Qxd8","Black takes on e5","The bishop check uncovers the d-file. Black's queen falls."),
 ("e5 d5 exf6 dxc4 Qf3","Black counterattacks with ...d5","You come out a piece ahead."),
 ("e5 Ng4 Bf4","Best defence: ...Ng4","Black found the only good reply. Keep developing; you're slightly better.",True))
trap("siberian","Siberian Trap","Smith–Morra Gambit",SIC,"b",2,"e4 c5 d4 cxd4 c3 dxc3 Nxc3 Nc6 Nf3 e6 Bc4 Qc7 O-O Nf6 Qe2 Ng4 h3",
 "Your queen and knight both eye h2. Remove the one defender.",
 ("Nd4 Nxd4 Qh2#","White takes the knight","The f3 knight was the only guard on h2."),
 ("Nd4 Qd1 Nxf3+ gxf3 Qh2#","White saves the queen","Take the f3 guard with check first, then mate on h2."),
 ("Nd4 Qd1 Nxf3+ Qxf3 Qh2#","White saves the queen","Take the f3 guard with check first, then mate on h2."),
 ("Nd4 hxg4 Nxe2+ Bxe2","White takes the g4 knight","No mate, but you win the queen for a knight."))
trap("najdorffork","Najdorf Fork-Trick Fail","Sicilian Defense (Najdorf)",SIC,"w",1,"e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Bc4 e5 Nde2 Nxe4 Nxe4 d5 Bxd5 Qxd5",
 "Black's fork trick has a hole in it. Look along the d-file.",
 ("Qxd5","Black's queen is loose","The black queen was undefended on the open d-file."),soft=["Nf6+"])

# ---------------- French ----------------
trap("milner","Advance French Queen Trap","French Defense (Advance)",FR,"w",2,"e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3 Qb6 Bd3 cxd4 cxd4 Nxd4 Nxd4 Qxd4",
 "Black's queen grabbed d4. It is lined up with your queen on the d-file.",
 ("Bb5+ Bd7 Bxd7+ Kxd7 Qxd4","Black blocks with the bishop","The bishop check clears the way for Qxd4."),
 ("Bb5+ Bd7 Qxd4","Black blocks with the bishop","The bishop check clears the way for Qxd4."),
 ("Bb5+ Kd8 Qxd4","Black moves the king","The king steps aside and the queen is lost."),
 ("Bb5+ Ke7 Qxd4","Black moves the king","The king steps aside and the queen is lost."))

# ---------------- Caro-Kann ----------------
trap("caro","Smothered Knight Mate","Caro-Kann Defense",CK,"w",1,"e4 c6 d4 d5 Nc3 dxe4 Nxe4 Nd7 Qe2 Ngf6",
 "Your queen on e2 pins the e7 pawn. Black's last move took the king's only spare square.",
 ("Nd6#","Instant mate","The e7 pawn is pinned, so it cannot capture. Mate on move six."))
trap("reti","Réti–Tartakower Mate","Caro-Kann Defense",CK,"w",3,"e4 c6 d4 d5 Nc3 dxe4 Nxe4 Nf6 Qd3 e5 dxe5 Qa5+ Bd2 Qxe5 O-O-O Nxe4",
 "Vienna, 1910. The d-file is open and Black's king hasn't moved. Give everything.",
 ("Qd8+ Kxd8 Bg5+ Kc7 Bd8#","The king runs to c7","A queen sacrifice and a double check. Bishop mate on d8."),
 ("Qd8+ Kxd8 Bg5+ Ke8 Rd8#","The king runs to e8","The rook finishes on d8."))
trap("deepblue","Deep Blue's Sacrifice","Caro-Kann Defense",CK,"w",3,"e4 c6 d4 d5 Nc3 dxe4 Nxe4 Nd7 Ng5 Ngf6 Bd3 e6 N1f3 h6",
 "Deep Blue vs Kasparov, game 6, 1997. Black's ...h6 was one move too slow.",
 ("Nxe6 Qe7 O-O fxe6 Bg6+ Kd8 Bf4","As in the game: ...Qe7","Kasparov resigned soon after. The black king is stuck in the centre."),
 ("Nxe6 fxe6 Bg6+ Ke7 Bf4","Black takes at once","The king is pinned down in the open. Your attack is worth far more than the piece.",True),
 ("Nxe6 Qa5+ Bd2","Black checks first","The knight on e6 is still attacking and Black's position is falling apart."))
trap("carotwo","Two Knights f7 Strike","Caro-Kann Defense (Two Knights)",CK,"w",2,"e4 c6 Nc3 d5 Nf3 dxe4 Nxe4 Bf5 Ng3 Bg6 h4 h6 Ne5 Bh7 Qh5 g6 Bc4 e6 Qe2 Nf6",
 "Black's last move left f7 defended only by the king.",
 ("Nxf7 Qe7 Nxh8","Black saves the queen","The knight forks queen and rook and takes on h8."),
 ("Nxf7 Kxf7 Qxe6+ Kg7 Qf7#","Black takes the knight","The bishop on c4 supports mate on f7."))
trap("hillbilly","Hillbilly Attack Trap","Caro-Kann Defense (Hillbilly)",CK,"w",1,"e4 c6 Bc4 d5 Bb3 dxe4 Qh5 Nf6",
 "Queen and bishop are both aimed at f7.",
 ("Qxf7+ Kd7","The king must run","Not mate, but the king is stuck in the open and you are a pawn up with a big attack."))

# ---------------- Other 1.e4 ----------------
trap("owen","Owen's Defense Trap","Owen's Defense",OE,"w",2,"e4 b6 d4 Bb7 Bd3 f5",
 "Black played ...f5 with the king still on e8.",
 ("exf5 Bxg2 Qh5+ g6 fxg6 Nf6 gxh7+ Nxh5 Bg6#","Black attacks the queen","Pawn and bishop finish the job."),
 ("exf5 Bxg2 Qh5+ g6 fxg6 Bg7 gxh7+ Kf8","Black develops ...Bg7","Black will win the h1 rook, but your attack and the h7 pawn are worth far more."))
trap("nimzodef","Nimzowitsch Légal Trap","Nimzowitsch Defense",OE,"w",2,"e4 Nc6 Nf3 d6 d4 Bg4 d5 Ne5",
 "Like Légal's Mate: the pin on your knight is not real.",
 ("Nxe5 Bxd1 Bb5+ c6 dxc6 a6 c7+ axb5 cxd8=Q+ Rxd8 Nxf7","Black takes the queen","Pawn promotion and a fork give you more than the queen back."),
 ("Nxe5 dxe5 Qxg4","Black takes the knight","You simply win the bishop."),
 ("Nxe5 Bd7","Black retreats the bishop","You're simply a piece up."))
trap("alekhine","Alekhine Knight Trap","Alekhine Defense",OE,"w",1,"e4 Nf6 e5 Ne4 d3 Nc5 d4 Ne4",
 "Black's knight has wandered into the centre and has no retreat.",
 ("f3 Ng5 Bxg5","The knight runs to g5","The knight is trapped and lost."),
 ("f3 e6 fxe4","Black ignores the threat","You're a full piece up."))
trap("antischolar","Anti-Scholar's Fork","King's Pawn (Early Queen)",OE,"b",1,"e4 e5 Qh5 Nc6 Bc4 g6 Qf3 Nf6 g4",
 "White keeps threatening f7 but left c2 and the queen loose.",
 ("Nd4 Qd1","White retreats the queen","Now …d5 or …Nxe4 and White's position falls apart."),
 ("Nd4 Qg3 Nxc2+ Kd1 Nxa1","White keeps the queen active","The knight forks king and rook and takes on a1."),soft=["d5"])
trap("antischolar2","Anti-Scholar's Fork II","King's Pawn (Early Queen)",OE,"b",1,"e4 e5 Qh5 Nc6 Bc4 g6 Qf3 Nf6 Qb3",
 "White's queen now hits f7. Answer with tempo.",
 ("Nd4 Qa4 Nxe4","White moves the queen","You win the e4 pawn and White's pieces are scattered."),
 ("Nd4 Bxf7+ Ke7 Qc4","White takes on f7","The bishop on f7 is trapped: …b5 or …c6 next wins it."))

# ---------------- Queen's Gambit / 1.d4 d5 ----------------
trap("halosar","Halosar Trap","Blackmar–Diemer Gambit",QG,"w",2,"d4 d5 e4 dxe4 Nc3 Nf6 f3 exf3 Qxf3 Qxd4 Be3 Qb4 O-O-O Bg4",
 "Black attacks your queen. Ignore it and aim at c7.",
 ("Nb5 Bxf3 Nxc7#","Black takes the queen","Nxc7 is mate: the rook on d1 covers d7 and d8."),
 ("Nb5 Na6 Qxb7","Black guards c7","b7 falls with a double attack on the a6 knight and a8 rook."))
trap("elephant","Elephant Trap","Queen's Gambit Declined",QG,"b",2,"d4 d5 c4 e6 Nc3 Nf6 Bg5 Nbd7 cxd5 exd5 Nxd5",
 "White thinks your f6 knight is pinned. It isn't.",
 ("Nxd5 Bxd8 Bb4+ Qd2","White takes the queen","Take back on d2 or d8: either way you win the queen back and end up a knight ahead."),
 ("Nxd5 Bf4 Nxf4","White saves the bishop","Your queen now hits g5, so White retreats. You collect a second piece."))
trap("lasker","Lasker Trap","Albin Countergambit",QG,"b",3,"d4 d5 c4 e5 dxe5 d4 e3",
 "White challenges your d4 pawn. Use a check to change the target.",
 ("Bb4+ Bd2 dxe3 Bxb4 exf2+ Ke2 fxg1=N+ Ke1 Qh4+","Ke2, then Ke1","Underpromotion to a knight with check. The white king is stuck."),
 ("Bb4+ Bd2 dxe3 Bxb4 exf2+ Ke2 fxg1=N+ Rxg1 Bg4+","Ke2, then Rxg1","The bishop check wins the white queen."),
 ("Bb4+ Bd2 dxe3 Bxb4 exf2+ Kxf2 Qxd1","White takes on f2","The d-file opened. You win the queen."),
 ("Bb4+ Bd2 dxe3 fxe3 Qh4+ g3 Qe4","Best defence: White recaptures on e3","White avoided the trap. The queen hits e3 and h1 and you win back your pawn, but the game is level.",True))
trap("qga","Queen's Gambit Accepted Trap","Queen's Gambit Accepted",QG,"w",1,"d4 d5 c4 dxc4 e3 b5",
 "Black is trying to hold the extra pawn with ...b5. Undermine it.",
 ("a4 c6 axb5 cxb5 Qf3","Black defends with ...c6","The long diagonal opens and the a8 rook falls."),
 ("a4 a6 axb5 axb5 Rxa8","Black defends with ...a6","The a-file opens and you win the rook."),
 ("a4 b4 Qf3","Best defence: ...b4","You will win back c4 with a comfortable game.",True))

# ---------------- Indian / other 1.d4 ----------------
trap("kieninger","Kieninger Trap","Budapest Gambit",ID,"b",2,"d4 Nf6 c4 e5 dxe5 Ng4 Bf4 Nc6 Nf3 Bb4+ Nbd2 Qe7 a3",
 "White wants your bishop. Let them take it.",
 ("Ngxe5 axb4 Nd3#","White takes the bishop","Smothered mate. The pinned d2 knight blocks the king's escape."),
 ("Ngxe5 Nxe5 Nxe5","Best defence: White trades knights","White avoids mate. You've regained the gambit pawn and the game is level.",True))
trap("fajarowicz","Fajarowicz Trap","Budapest Gambit (Fajarowicz)",ID,"b",2,"d4 Nf6 c4 e5 dxe5 Ne4 Nf3 d6 exd6 Bxd6 g3",
 "White's g3 left f2 with only the king to defend it, and the d-file is open.",
 ("Nxf2 Kxf2 Bxg3+ hxg3 Qxd1","White takes the knight","Deflect the king, then the queen on d1 hangs."),
 ("Nxf2 Kxf2 Bxg3+ Kxg3 Qxd1","White takes the knight","Deflect the king, then the queen on d1 hangs."),
 ("Nxf2 Kxf2 Bc5+ Ke1 Bf2+ Kxf2 Qxd1","White takes the knight","Deflect the king, then the queen on d1 hangs."),
 ("Nxf2 Qd4 Nxh1 Qxg7 Rf8","White counterattacks with Qd4","You're up the exchange and White's attack fizzles."))
trap("englund","Englund Gambit Trap","Englund Gambit",OD,"b",1,"d4 e5 dxe5 Nc6 Nf3 Qe7 Bf4",
 "White's bishop left the queenside. Find the forcing check.",
 ("Qb4+ Bd2 Qxb2 Bc3 Bb4 Qd2 Bxc3 Qxc3 Qc1#","White plays Bc3","The queen lands on c1 with mate."),
 ("Qb4+ Bd2 Qxb2 Bc3 Bb4 Qd2 Bxc3 Nxc3 Qxa1+","White recaptures with the knight","No mate, but you win the a1 rook."),
 ("Qb4+ Nbd2 Qxf4","White blocks with the knight","The bishop on f4 was left hanging. You win a piece."))
trap("dutch","Dutch h-file Mate","Dutch Defense",OD,"w",1,"d4 f5 Bg5 h6 Bh4 g5 Bg3 f4 e3 h5 Bd3 Rh6",
 "Black's pawn storm left the e8–h5 diagonal and g6 wide open.",
 ("Qxh5+ Rxh5 Bg6#","Black takes the queen","Bishop mate on g6."),
 ("Qxh5+ Rg6 Bxg6#","Black blocks with the rook","Take on g6 with mate."),
 ("Qxh5+ Rg6 Qxg6#","Black blocks with the rook","Take on g6 with mate."))

# ---------------- Flank ----------------
trap("fool","Fool's Mate","Barnes Opening / Grob",FL,"b",1,"f3 e5 g4",
 "White has opened the e1–h4 diagonal.",
 ("Qh4#","Mate in two","The fastest possible checkmate."))
trap("from","From's Gambit Mate","Bird Opening (From's Gambit)",FL,"b",1,"f4 e5 fxe5 d6 exd6 Bxd6 Nc3",
 "White forgot Nf3. The h4–e1 diagonal is open.",
 ("Qh4+ g3 Bxg3+ hxg3 Qxg3#","Mate on g3","Queen and bishop combine against the bare king."),
 ("Qh4+ g3 Qxg3+ hxg3 Bxg3#","Mate on g3","Queen and bishop combine against the bare king."))
# ---- batch 2 additions ----
LON="London System"
trap("morrapin","Morra Pin-Breaker","Smith–Morra Gambit",SIC,"w",1,"e4 c5 d4 cxd4 c3 dxc3 Nxc3 Nc6 Nf3 d6 Bc4 Bg4",
 "Black pinned your knight. A check on f7 breaks the pin and the g4 bishop is left hanging.",
 ("Bxf7+ Kxf7 Ng5+ Ke8 Qxg4","Black takes on f7","The knight check unpins with tempo and Qxg4 nets a pawn and the bishop pair, with Black's king stuck."),
 ("Bxf7+ Kxf7 Ng5+ Kg6 Qxg4","Black takes on f7","The knight check unpins with tempo and Qxg4 nets a pawn and the bishop pair, with Black's king stuck."),
 ("Bxf7+ Kd7","Black declines the bishop","You're a pawn up and Black's king has lost castling. Castle and keep attacking."),soft=["Qb3"])
trap("dragonbb5","Dragon Knight-Raid Trap","Sicilian Defense (Dragon)",SIC,"w",1,"e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Ng4",
 "Black's knight jumped to g4 to hit your bishop. It has no defender.",
 ("Bb5+ Bd7 Qxg4","Black blocks with the bishop","The check distracts the d7 square and your queen collects the g4 knight."),
 ("Bb5+ Nd7 Qxg4","Black blocks with the knight","The check distracts the d7 square and your queen collects the g4 knight."),
 ("Bb5+ Nc6 Nxc6 bxc6 Bxc6+ Bd7","Black blocks with ...Nc6","The bishop forks the rook on a8. Take it next and you're winning."))
trap("levenfish","Levenfish Knight Trap","Sicilian Defense (Dragon, Levenfish)",SIC,"w",2,"e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 f4 Bg7 e5 dxe5 fxe5 Nd5",
 "Black's knight landed on d5, where it is defended only by the queen. Cut that line.",
 ("Bb5+ Bd7 Nxd5 Bxb5 Nxb5","Black blocks with the bishop","The check blocks the queen's defence of d5. You come out a piece ahead."),
 ("Bb5+ Nd7 Nxd5","Black blocks with the knight","The d7 knight cuts off the queen. The d5 knight falls."),
 ("Bb5+ Kf8","Black moves the king","Black can never castle and the d5 knight still needs help. Castle or play Qf3 and you're close to winning."))
trap("londonraid","London Queen Raid","London System",OD,"w",2,"d4 d5 Bf4 c5 e3 Qb6 Nc3 Qxb2",
 "Black's queen grabbed b2 and left d5 and c7 weak.",
 ("Nxd5 Nf6 Rb1 Qxa2 Nc7+","Black develops ...Nf6","Rb1 shuts the queen out and Nc7+ forks king and rook."),
 ("Nxd5 cxd4","Black takes on d4","Rb1 or Bb5+ next: the queen is nearly trapped and Nc7+ is coming."))
trap("londonblack","London Queen-Trade Trap","London System",OD,"b",2,"d4 d5 Bf4 c5 e3 Nc6 c3 Qb6 Qb3 c4 Qxb6 axb6 Na3",
 "White's knight went to a3, a square your rook is already looking at.",
 ("e5 dxe5 Bxa3 bxa3","White takes the pawn","Now …Rxa3 wins back the piece with an extra pawn."),
 ("e5 Bxe5 Bxa3 bxa3 Nxe5 dxe5 Rxa3","Best defence: White takes with the bishop","You trade into an endgame a pawn up.",True),
 ("e5 Nb5 Ra5 Nc7+ Kd8 Nxd5 Rxd5","White's knight runs to b5","The knight escapes but White's queenside is a mess. You're better."))
trap("londonb7","London b7 Grab","London System",OD,"w",2,"d4 d5 Bf4 Nf6 e3 c5 c3 Nc6 Nd2 Bg4 Qb3 c4",
 "Black closed the queenside with tempo, but forgot what was hanging.",
 ("Qxb7 Na5 Qc7","Black tries to trap the queen","The queen slips out via c7 and you're a pawn up."),
 ("Qxb7 Rc8 Ngf3","Black guards c6 with the rook","You're a clean pawn up and the b-file belongs to you."))
trap("alekhinesac","Alekhine f7 Sacrifice","Alekhine Defense (Modern)",OE,"w",3,"e4 Nf6 e5 Nd5 d4 d6 Nf3 dxe5 Nxe5 Nd7",
 "Black offered a knight trade but the d5 knight is loose and the king is thin.",
 ("Nxf7 Kxf7 Qh5+ Ke6 c4","Best defence: the king walks","The black king is stuck on e6 in the middle of the board. You have a big attack for the piece.",True),
 ("Nxf7 Kxf7 Qh5+ g6 Qxd5+","Black blocks with ...g6","The loose d5 knight falls with check. You're winning."),
 ("Nxf7 Kxf7 Qh5+ Kf6 Qxd5","Black steps to f6","The d5 knight falls and the king is wide open."))
trap("benoni","Benoni e5 Break","Benoni Defense (Taimanov)",ID,"w",3,"d4 Nf6 c4 c5 d5 e6 Nc3 exd5 cxd5 d6 e4 g6 f4 Bg7 Bb5+ Bd7",
 "Black blocked the check with the bishop. Now the f6 knight is loosely placed.",
 ("e5 dxe5 fxe5 Bxb5 exf6","Black takes on e5","You win back the piece and Black's kingside is broken."),
 ("e5 Qe7 Qe2","Black pins the e-pawn","You keep the pin and a big space advantage."),
 ("e5 Nh5 Nf3","Black retreats the knight","The knight on h5 is offside and your centre rolls on."))
trap("pirc150","Pirc 150 Attack Trap","Pirc Defense (150 Attack)",OE,"w",2,"e4 d6 d4 Nf6 Nc3 g6 Be3 Bg7 Qd2 O-O Bh6 Bxh6 Qxh6 c5 dxc5 Qa5 Bd3 Qxc5 Nf3 Bg4",
 "Your queen is already on h6. Bring a second attacker to h7.",
 ("Ng5 Nbd7","Black develops ...Nbd7","Now Nd5 hits the f6 defender, or castle first. Mate on h7 can't be stopped without big losses."))

# ---- mined batches (Lichess puzzle database) ----
import glob as _g, os as _o
for _f in sorted(_g.glob(_o.path.join(_o.path.dirname(_o.path.abspath(__file__)),"mined_batch*.py"))): exec(open(_f).read())

json.dump(T,open("traps.json","w"),indent=1,ensure_ascii=False)
print(len(T),"traps")
