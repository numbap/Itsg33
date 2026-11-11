#!/bin/sh
# Runs once the wide search has stopped: builds variations for every wide-search candidate
# (resuming from data/puzzles_wide.json), then filters them for review.
cd "$(dirname "$0")"
while pgrep -f "search.py --tree data/tree_wide.json" > /dev/null; do sleep 60; done
echo "variations start $(date)"
.venv/bin/python variations.py --tree data/tree_wide.json --raw data/traps_wide.json --out data/puzzles_wide.json
.venv/bin/python prepare.py --puzzles data/puzzles_wide.json --existing data/existing_traps.json --raw data/traps_wide.json --out data/wide_val.json --review data/wide_review.json
echo "ready for review $(date)"
