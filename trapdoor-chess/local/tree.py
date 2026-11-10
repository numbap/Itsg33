#!/usr/bin/env python3
"""Build an opening tree from a Lichess monthly games dump.

Reads a .pgn.zst stream on stdin (pipe it straight from curl, nothing is stored on disk),
keeps rated club games (both players rated MIN_ELO..MAX_ELO, blitz/rapid/classical) and
counts every move sequence up to PLIES half-moves. Sequences are keyed by their SAN moves
("e4 e5 Nf3 Nc6"), so transpositions count separately, which is what we want: a trap is
reached through a specific move order.

Memory stays bounded with lossy counting: every PRUNE_EVERY games, sequences deeper than
KEEP_DEPTH that are still at a count of 1 are dropped. A sequence that is genuinely popular
loses at most one count per pruning round, far below the MIN_OUT threshold used for output.

Usage:
  curl -s https://database.lichess.org/standard/lichess_db_standard_rated_2026-10.pgn.zst \
    | python tree.py --max-games 40000000 --out data/tree.json
"""
import argparse, io, json, re, sys, time
import zstandard

ap = argparse.ArgumentParser()
ap.add_argument("--plies", type=int, default=16)
ap.add_argument("--min-elo", type=int, default=1000)
ap.add_argument("--max-elo", type=int, default=2000)
ap.add_argument("--max-games", type=int, default=0, help="stop after this many games read (0 = all)")
ap.add_argument("--min-out", type=int, default=200, help="only write sequences seen at least this often")
ap.add_argument("--prune-every", type=int, default=500_000)
ap.add_argument("--keep-depth", type=int, default=6, help="never prune sequences this short or shorter")
ap.add_argument("--out", default="data/tree.json")
a = ap.parse_args()

COMMENT = re.compile(r"\{[^}]*\}")
NUMBER = re.compile(r"\d+\.(?:\.\.)?")
ANNOT = re.compile(r"[?!]+")
SPEEDS = ("Blitz", "Rapid", "Classical")

counts = {}
games_read = games_kept = 0
t0 = time.time()

def flush_progress(final=False):
    rate = games_read / max(1e-9, time.time() - t0)
    print(f"{'done' if final else 'progress'}: read {games_read:,} kept {games_kept:,} "
          f"sequences {len(counts):,} ({rate:,.0f} games/s)", file=sys.stderr, flush=True)

def prune():
    dead = [k for k, v in counts.items() if v <= 1 and k.count(" ") >= a.keep_depth]
    for k in dead:
        del counts[k]

reader = io.TextIOWrapper(zstandard.ZstdDecompressor().stream_reader(sys.stdin.buffer),
                          encoding="utf-8", errors="replace")
welo = belo = 0
event_ok = False
for line in reader:
    if line.startswith("["):
        if line.startswith("[Event "):
            event_ok = line.startswith("[Event \"Rated") and any(s in line for s in SPEEDS)
            welo = belo = 0
        elif line.startswith("[WhiteElo "):
            welo = int(line[11:-3]) if line[11:-3].isdigit() else 0
        elif line.startswith("[BlackElo "):
            belo = int(line[11:-3]) if line[11:-3].isdigit() else 0
        continue
    if not line.startswith("1."):
        continue
    games_read += 1
    if event_ok and a.min_elo <= welo <= a.max_elo and a.min_elo <= belo <= a.max_elo:
        games_kept += 1
        moves = ANNOT.sub("", NUMBER.sub(" ", COMMENT.sub(" ", line))).split()
        moves = [m for m in moves if m not in ("1-0", "0-1", "1/2-1/2", "*")][: a.plies]
        key = ""
        for m in moves:
            key = key + " " + m if key else m
            counts[key] = counts.get(key, 0) + 1
    if games_read % a.prune_every == 0:
        prune()
        flush_progress()
    if a.max_games and games_read >= a.max_games:
        break

flush_progress(final=True)
out = {k: v for k, v in counts.items() if v >= a.min_out}
meta = dict(games_read=games_read, games_kept=games_kept, plies=a.plies, min_elo=a.min_elo,
            max_elo=a.max_elo, min_out=a.min_out, sequences=len(out))
with open(a.out, "w") as f:
    json.dump(dict(meta=meta, counts=out), f, separators=(",", ":"))
print(json.dumps(meta), file=sys.stderr)
