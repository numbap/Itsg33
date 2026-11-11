#!/bin/sh
# Wide trap search: recount September to move 10 (20 half-moves), merged with the October tree,
# then search with lower popularity thresholds and a looser "single answer" rule.
# Run under caffeinate so the Mac stays awake until it finishes:
#   nohup caffeinate -i sh wide.sh > data/wide.log 2>&1 &
cd "$(dirname "$0")"
echo "count start $(date)"
.venv/bin/python tree.py --input data/2026-09.pgn.zst --merge data/tree.json --plies 20 --min-out 100 --out data/tree_wide.json
echo "search start $(date)"
.venv/bin/python search.py --tree data/tree_wide.json --out data/traps_wide.json --min-node 300 --min-games 100 --min-share 0.02 --min-gap 60
echo "all done $(date)"
