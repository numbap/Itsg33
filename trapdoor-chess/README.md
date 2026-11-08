# Trapdoor Chess

Opening-trap puzzles on a playable board. Each puzzle plays an opening up to the moment a
trap can be sprung; you find the move, then keep going while the opponent tries each known
defence. Every line is checked with Stockfish 16.

This folder is self-contained and unrelated to the ITSG-33 material in the rest of the repo.

## Layout

| Path | What it is |
|---|---|
| `app/index.html` | The built single-file app (also published as a claude.ai artifact). |
| `db/build_db.py` | The hand-curated trap database (names, ideas, lines, notes). Writes `db/traps.json`. |
| `db/template.html` | App source; `db/build_html.py` injects `traps.json` and the piece set into it. |
| `db/validate.py` | Strict engine validator: legality, best-move checks, ambiguity, final evaluations. |
| `pipeline/` | Mining pipeline that finds new traps in the Lichess puzzle database. |
| `data/` | Pipeline state, checkpointed so a fresh container can resume. |

## Rebuild the app

```bash
cd db && python3 build_db.py && python3 build_html.py
```

Validate (needs `stockfish` and `python-chess`):

```bash
cd db && python3 validate.py traps.json 16
```

## Mining pipeline

1. `filter.py` / `cluster.py`: stream the Lichess puzzle CSV, keep opening-phase puzzles, group by
   trap position. Output is condensed into `data/candidates.json` (2,925 positions seen in 2+ games).
2. `rank.py`: opening explorer counts of how often club players (1000–2000) make the losing move.
   Needs a Lichess token (no scopes) injected for `explorer.lichess.ovh`. Writes `data/rank.json`.
3. `movefetch.py N`: rebuild a natural move order for the top N from their source games. Writes `data/orders.json`.
4. `vargen.py`: variation trees from real human replies plus engine best defence. Writes `data/trees.json`.

All stages resume from their JSON files. Live runs write to the untracked `work/data/`, and
`./checkpoint.sh` copies a snapshot into `data/` and commits it every 20 minutes, so `data/`
only changes at commit time. To start a run, seed `work/data/` from `data/`, then from `work/`:

```bash
pip install chess==1.10.0 && apt-get install -y stockfish
mkdir -p work/data && cp data/*.json work/data/ && cd work
python3 ../pipeline/rank.py 800     # resumes where data/rank.json left off
python3 ../pipeline/movefetch.py 350
python3 ../pipeline/vargen.py
```

Then validate the generated lines, write names and notes, and add them to `db/build_db.py`.

## Credits

Piece set: cburnett (GPLv2+). Move legality in the app: chess.js 0.10.3. Puzzle and explorer data:
Lichess (CC0).
