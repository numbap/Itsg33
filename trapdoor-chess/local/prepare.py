#!/usr/bin/env python3
"""Pick the puzzles from variations.py worth validating and writing up.

Drops:
  * candidates already in the curated database (same position after the setup moves);
  * "free piece" positions, where the punishment simply captures the piece that just moved:
    that is a blunder, not a trap;
  * puzzles with no variations;
  * positional "traps": a puzzle line, or the engine's best line from the search (which runs a
    few moves longer), must leave the trapper ahead in material by at least --min-material
    pawns (or mate). Gaining space or tempo makes a dull puzzle;
  * patterns already in the database more than --max-rep times (same signature as select.py:
    the trap move's piece and check flag plus the square where material is won, or the mate).
Writes the validator's input format (data/batch_local_val.json) and a compact list for review.

Usage: python prepare.py --puzzles data/puzzles.json --existing data/existing_traps.json
"""
import argparse, collections, json
import chess

ap = argparse.ArgumentParser()
ap.add_argument("--puzzles", default="data/puzzles.json")
ap.add_argument("--existing", default="data/existing_traps.json")
ap.add_argument("--max-rep", type=int, default=2)
ap.add_argument("--min-material", type=int, default=2, help="pawns of material the main line must win")
ap.add_argument("--out", default="data/batch_local_val.json")
ap.add_argument("--review", default="data/batch_local_review.json")
ap.add_argument("--raw", nargs="*", default=["data/traps_raw.json"], help="search output, for each candidate's engine line")
a = ap.parse_args()

def board_after(moves):
    b = chess.Board()
    for m in moves.split():
        b.push_san(m)
    return b

def signature(setup, moves):
    ms = moves.split(); first = ms[0]
    tag = (first[0] if first[0] in "KQRBN" else "P") + ("+" if "+" in first else "")
    if "#" in ms[-1]:
        return (tag, "mate", ms[-1][0] if ms[-1][0] in "KQRBN" else "P")
    caps = [m for m in ms[::2] if "x" in m]
    return (tag, (caps[-1] if caps else first).rstrip("+#")[-2:])

VALUE = {chess.PAWN: 1, chess.KNIGHT: 3, chess.BISHOP: 3, chess.ROOK: 5, chess.QUEEN: 9}
def material(b, side):
    return sum(VALUE.get(p.piece_type, 0) * (1 if p.color == side else -1) for p in b.piece_map().values())

def wins_material(setup, moves):
    """True if the line mates, or leaves the trapper at least --min-material pawns better off than
    before the trap move (counting a pending recapture by looking one move past the line's end)."""
    b = board_after(setup); me = b.turn; start = material(b, me)
    for m in moves.split():
        b.push_san(m)
    if b.is_checkmate():
        return True
    gain = material(b, me) - start
    if b.turn != me and not b.is_game_over():       # opponent to move: allow their best recapture
        best = max((VALUE.get(b.piece_type_at(mv.to_square), 0) for mv in b.legal_moves if b.is_capture(mv)), default=0)
        gain -= best
    return gain >= a.min_material

PV = {}
for path in a.raw:
    try:
        for t in json.load(open(path))["traps"]:
            PV.setdefault(t["setup"], t.get("pv", ""))
    except FileNotFoundError:
        pass

existing = json.load(open(a.existing))
have = {board_after(t["setup"]).epd() for t in existing}
sigs = collections.Counter(signature(t["setup"], t["lines"][0]["moves"]) for t in existing)

kept, dropped = [], collections.Counter()
for p in json.load(open(a.puzzles)):
    if not p["lines"]:
        dropped["no variations"] += 1; continue
    b = board_after(p["setup"])
    if b.epd() in have:
        dropped["already in the database"] += 1; continue
    last = b.peek()
    trap = b.parse_san(p["lines"][0]["moves"].split()[0])
    if b.is_capture(trap) and trap.to_square == last.to_square and b.piece_type_at(last.to_square) != chess.PAWN:
        dropped["free piece, not a trap"] += 1; continue
    pv = PV.get(p["setup"], "")
    if not (any(wins_material(p["setup"], l["moves"]) for l in p["lines"]) or (pv and wins_material(p["setup"], pv))):
        dropped["positional, no material won"] += 1; continue
    sig = signature(p["setup"], p["lines"][0]["moves"])
    limit = a.max_rep + (1 if sig[1] == "mate" else 0)
    if sigs[sig] >= limit:
        dropped["pattern already used enough"] += 1; continue
    sigs[sig] += 1
    kept.append(p)

kept.sort(key=lambda p: -p["games"])
val = [dict(id=f"x{i+1:03d}", setup=p["setup"], side=p["side"],
            lines=[dict(moves=l["moves"], label=l["moves"], note="") for l in p["lines"]])
       for i, p in enumerate(kept)]
json.dump(val, open(a.out, "w"))
json.dump([dict(id=v["id"], games=p["games"], share=p["share"], setup=p["setup"], side=p["side"],
                lines=[l["moves"] for l in p["lines"]]) for v, p in zip(val, kept)],
          open(a.review, "w"), indent=0)
print(f"kept {len(kept)}; dropped: " + ", ".join(f"{k} {v}" for k, v in dropped.items()))
