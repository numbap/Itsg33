# Batch 15: the last traps from the low-popularity search. Validated with Stockfish.
SCA="Scandinavian"
trap("w167","King's Gambit Promotion","King's Gambit (Mad Dog)",OG,"w",2,
 "e4 e5 f4 f5 exf5 exf4 Qh5+ g6 fxg6 Nf6",
 "Black's knight attacks your queen. Your g6 pawn is two steps from h8.",
 ("g7+ Nxh5 gxh8=Q","Black takes the queen","g7+ uncovered a check, and the pawn takes the h8 rook and promotes. You get your queen back with a rook extra."))
trap("w168","Réti Queen Fork","Réti Opening",FL,"w",1,
 "Nf3 d5 c4 d4 b4 e5 Nxe5 Bxb4",
 "Black's bishop took b4 with check in mind, but it's undefended.",
 ("Qa4+ Nc6 Nxc6","Black blocks with the knight","The check forks the king and the b4 bishop. Take the blocker first."),
 ("Qa4+ Nd7 Nxd7","Black blocks with the knight","The check forks the king and the b4 bishop. Take the blocker first."))
trap("w169","QGD b2 Queen Trap","Queen's Gambit (Exchange)",QG,"w",2,
 "d4 d5 c4 Nf6 cxd5 Qxd5 Nc3 Qa5 Bd2 Qb6 Nf3 Qxb2",
 "Black's queen grabbed b2. It's deep in your half with few squares.",
 ("Rb1 Qa3 Nb5","The queen runs to a3","Nb5 hits the queen and c7. It's trapped."),
 ("Rb1 Qxc3 Bxc3","Black gives up the queen","The queen took the knight and was lost for it."))
trap("w170","Wayward Queen f2 Raid","King's Pawn (Wayward Queen Attack)",OE,"b",1,
 "e4 e5 Qh5 Qf6 d3 Bc5 Bg5",
 "White's bishop attacks your queen, but your queen and bishop both hit f2.",
 ("Qxf2+ Kd1 Qxf1+ Kd2","The king steps aside","You've taken f2 and the f1 bishop with check. Take g2 next: White is lost."))
trap("w171","Scandinavian f7 Raid","Scandinavian Defense",SCA,"w",2,
 "e4 d5 exd5 Qxd5 Nc3 Qd8 Bc4 g6 Qf3 Bg7",
 "Black fianchettoed and left f7 with only the king to guard it.",
 ("Qxf7+ Kd7","The king runs","Black's king is out in the open. Be6+, Qd5+ or Qe6+ next all win more material."))
