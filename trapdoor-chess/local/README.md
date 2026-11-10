# Local trap search (runs on a Mac or any machine with Stockfish)

A more thorough alternative to the puzzle-database pipeline in `../pipeline/`. Instead of
taking whatever positions the Lichess puzzle set happens to contain, it builds an opening tree
from a full month of Lichess games and asks Stockfish about every popular move in it. It has no
API rate limits and no time caps, so it can run for hours on a desktop machine.

## Setup (macOS)

```bash
brew install stockfish
```

```bash
python3 -m venv .venv && .venv/bin/pip install chess==1.11.2 zstandard==0.23.0
```

## 1. Build the opening tree

Streams a monthly Lichess dump straight from the server (nothing is stored on disk), keeps
rated club games (both players 1000–2000, blitz/rapid/classical) and counts every move
sequence up to 16 half-moves. Lichess serves each download at about 1.2 MB/s, so 25 million
games (about 8.6 GB compressed) takes roughly 2.5 hours.

```bash
mkdir -p data
```

```bash
curl -s https://database.lichess.org/standard/lichess_db_standard_rated_2026-10.pgn.zst | .venv/bin/python tree.py --max-games 25000000 --out data/tree.json
```

## 2. Search the tree for traps

For every position reached at least 1,000 times, checks each reply played in at least 3% of
those games (and at least 200 times). A reply is a candidate trap when, at depth 18, it costs
its side at least 1.5 pawns, leaves them at −1.3 or worse, and has a single best punishment
at least 1 pawn better than the alternatives. Runs four engines in parallel and resumes from
`data/traps_raw.json` if interrupted.

```bash
.venv/bin/python search.py --tree data/tree.json --out data/traps_raw.json
```

The thresholds were tuned so that the classics are found: Légal's Mate (Nxe5 scores +2.6
against +1.2 for the next move) and the Caro-Kann smothered mate (Nd6#), while harmless
alternatives in the same positions are not flagged.

## 3. Hand-off

`data/traps_raw.json` then goes through the same steps as mined traps: variations from the
tree's own human move counts, the strict validator (`../db/validate.py`), pattern
de-duplication, and hand-written names and notes.
