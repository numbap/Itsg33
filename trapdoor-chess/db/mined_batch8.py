# Batch 8: first traps from the wide local search (tree out to move 10 from ~45 million Lichess
# club games, lower popularity thresholds). All lines validated with Stockfish.
SCA="Scandinavian"
trap("w001","Busch–Gass Pawn Grab","King's Pawn (Busch–Gass Gambit)",OG,"w",1,
 "e4 e5 Nf3 Bc5",
 "Black developed the bishop and left e5 undefended. Club players do this in hundreds of thousands of games.",
 ("Nxe5 Qh4 d4","Black hits f2 with the queen","d4 cuts the bishop off from f2 and attacks it. Your extra pawn is safe."),
 ("Nxe5 Bxf2+ Kxf2","Black tries the f2 desperado","Just take it. Black has given a bishop for two pawns."),
 ("Nxe5 Nf6 d4","Black develops","Kick the bishop with d4. You're a clean pawn up."),
 ("Nxe5 d6 Nf3","Black kicks the knight","Retreat to f3. You keep the extra pawn."))
trap("w002","Knight Trapped on d4","King's Pawn (Centre Game with d5)",OG,"w",1,
 "e4 e5 d4 Nc6 d5 Nd4",
 "Black's knight jumped to d4, deep in your half, with very few squares.",
 ("c3 Nb5 Bxb5","The knight runs to b5","The bishop takes it. You've won a piece."),
 ("c3 Bc5 cxd4","Black defends the knight","Take it anyway. The bishop's support doesn't save it."),
 ("c3 Qh4","Black counterattacks","Cover e4 with Bd3 or Nd2. The knight on d4 is still trapped and falls next."),
 ("c3 c5","Black defends with ...c5","The knight still has no way out. Take it now or develop first: it's lost either way."))
trap("w003","Early Queen Rook Fork","King's Pawn (Wayward Queen Attack)",OE,"w",1,
 "e4 e5 Qh5 g6",
 "Black kicked your queen with ...g6, but the e5 pawn is undefended and the h8 rook is behind it.",
 ("Qxe5+ Qe7 Qxh8","Black blocks with the queen","The queen takes e5 with check, then the h8 rook."),
 ("Qxe5+ Be7 Qxh8","Black blocks with the bishop","The queen takes e5 with check, then the h8 rook."),
 ("Qxe5+ Ne7 Qxh8","Black blocks with the knight","The queen takes e5 with check, then the h8 rook."))
trap("w004","Larsen e5 Grab","Nimzo-Larsen Attack",FL,"w",1,
 "b3 e5 Bb2 Bc5",
 "Your b2 bishop already hits e5, and Black's last move didn't defend it.",
 ("Bxe5 Bxf2+ Kxf2","Black tries the f2 desperado","Take the bishop. You're a piece up."),
 ("Bxe5 Nf6 Bb2","Black develops","You're a pawn up and the long diagonal still points at g7."),
 ("Bxe5 d6 Bxg7","Black kicks the bishop","It takes g7 instead and the h8 rook is next."),
 ("Bxe5 f6","Black blocks the diagonal","Retreat the bishop to b2, c3 or g3. You're a clean pawn up and Black's kingside is weakened."))
trap("w005","Hanging Queen on d8","Queen's Pawn (Pseudo-Trompowsky)",OD,"w",1,
 "d4 d5 Bg5 e6",
 "Black's last pawn move opened a diagonal you're already standing on.",
 ("Bxd8 Kxd8","Black recaptures","...e6 opened the d8–g5 diagonal. You've won the queen for a bishop."))
trap("w006","Scandinavian Long-Diagonal Fork","Scandinavian Defense",SCA,"b",1,
 "e4 d5 exd5 Nf6 Nc3 Nxd5 Nxd5 Qxd5 b3",
 "White's b3 left the a1 rook on the long diagonal, and your queen is already centralised.",
 ("Qe5+ Be2 Qxa1","White blocks with the bishop","The check forks the king and the a1 rook."),
 ("Qe5+ Qe2 Qxa1","White blocks with the queen","The check forks the king and the a1 rook."),
 ("Qe5+ Ne2 Qxa1","White blocks with the knight","The check forks the king and the a1 rook."))
trap("w007","Advance French b2 Raid","French Defense (Advance)",FR,"b",2,
 "e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3 Qb6 Be3",
 "White's bishop went to e3 and left b2 defended by nothing.",
 ("Qxb2 Nbd2 c4","White develops","You're a pawn up and ...c4 keeps White's queenside tied up."),
 ("Qxb2 Qb3 Qxa1 dxc5","Best defence: White hunts your queen","Your queen took the a1 rook before it could be caught. White will win it back, but you stay about a pawn ahead.",True))
trap("w008","Englund c3 Block","Englund Gambit",OD,"b",1,
 "d4 e5 dxe5 Nc6 Nf3 Qe7 Bf4 Qb4+ c3",
 "White blocked your check with a pawn. What did that leave unguarded?",
 ("Qxf4 e3 Qf5","White kicks the queen","You're a clean piece up."),
 ("Qxf4 Nbd2 Nxe5","White develops","You've won a piece and the e5 pawn too."),
 ("Qxf4 g3","White kicks the queen","Retreat the queen to f5 or h6. You're a clean piece up."))
trap("w009","Englund Qd2 Block","Englund Gambit",OD,"b",2,
 "d4 e5 dxe5 Nc6 Nf3 Qe7 Bf4 Qb4+ Qd2",
 "White blocked with the queen, so b2 has no defender.",
 ("Qxb2 Qc3 Bb4","White offers a queen trade","Bb4 pins the queen to the king. White loses it."),
 ("Qxb2 c3 Qxa1","White defends the queen","Take the a1 rook."))
trap("w010","Fried Liver: ...Ke7","Two Knights Defense (Fried Liver)",OG,"w",3,
 "e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 Nxd5 Nxf7 Kxf7 Qf3+ Ke7",
 "Black's king stepped up to e7, right in front of your pieces. Start with the d5 knight.",
 ("Bxd5 Nd4 Qf7+ Kd6","Black attacks your queen","Qf7+ drives the king out to d6. Bring in more attackers (Na3 or Be4) and it won't survive."),
 ("Bxd5 Be6 Bxc6","Black blocks with the bishop","Take the c6 knight too. You've won back the piece with interest."),soft=["Qxd5"])
