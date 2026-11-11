# Batch 7: first traps from the local search (opening tree from Lichess games + Stockfish on a Mac).
# Defences come from the tree's own move counts; all lines validated with Stockfish.
trap("l001","Fried Liver: King Back to e8","Two Knights Defense (Fried Liver)",OG,"w",2,
 "e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 Nxd5 Nxf7 Kxf7 Qf3+ Ke8",
 "Black's king ran back to e8. The d5 knight has lost a defender and f7 is wide open.",
 ("Bxd5 Nd4 Qf7#","Black attacks your queen","Ignore it: queen to f7 is mate."),
 ("Bxd5 Qf6 Bxc6+ bxc6","Black offers a queen trade","Take on c6 with check first. You've won a whole knight."))
trap("l002","King's Gambit ...Nc6 Fork","King's Gambit Declined",OG,"b",1,
 "e4 e5 f4 Nc6 fxe5",
 "White took on e5 and left the e1–h4 diagonal open.",
 ("Qh4+ g3 Qxe4+ Qe2 Qxh1","White blocks with g3","The queen check forks king and the h1 rook."))
trap("l003","Fried Liver: ...Qf6 Block","Two Knights Defense (Fried Liver)",OG,"w",2,
 "e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 Nxd5 Nxf7 Kxf7 Qf3+ Qf6",
 "Black blocked the check with the queen, but the d5 knight now has only one defender.",
 ("Bxd5+ Be6 Bxc6","Black blocks with the bishop","Take the c6 knight too. You've won back the piece with interest."),
 ("Bxd5+ Ke8 Bxc6+ bxc6","The king goes back to e8","Take on c6 with check. You're a piece and two pawns up."))
trap("l004","Two Knights Pawn Fork","Two Knights Defense",OG,"b",2,
 "e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 Nxe4 Nxe4",
 "White took your knight on e4. One pawn move hits both white pieces.",
 ("d5 Bb5 dxe4","White saves the bishop","The pawn forked bishop and knight. You win your piece back and end up a pawn ahead."))
trap("l005","Scotch Knight Swap","Scotch Game",OG,"w",2,
 "e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Bc5 Be3 Nf6",
 "Black's c5 bishop is defended only by the c6 knight. Remove that knight.",
 ("Nxc6 bxc6 Bxc5","Black recaptures","The trade removed the bishop's defender. You win a piece."))
