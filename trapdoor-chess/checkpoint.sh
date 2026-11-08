#!/bin/bash
# Copies live pipeline state from the scratch run into data/ and commits it. Run in a loop.
SRC=/tmp/claude-0/-home-user-Itsg33/cbd793b2-8d08-5068-bdb3-e1dae479b00c/scratchpad/mine
cd "$(dirname "$0")"
while true; do
  for f in rank.json orders.json trees.json; do [ -f "$SRC/$f" ] && cp "$SRC/$f" data/; done
  for f in chain.log vargen.log movefetch.log; do [ -f "$SRC/$f" ] && cp "$SRC/$f" data/; done
  if [ -n "$(git status --porcelain -- data)" ]; then
    git add data && git commit -q -m "Trapdoor Chess: checkpoint mining pipeline state [skip ci]

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_013f4eGseKbt412A68dJa1sX" -- data \
      && for i in 1 2 3 4; do git pull -q --rebase origin claude/stoic-mccarthy-oddve3 2>/dev/null; git push -q -u origin claude/stoic-mccarthy-oddve3 && break; sleep $((2**i)); done
  fi
  pgrep -f "chain.sh|rank.py|movefetch.py|vargen.py" >/dev/null || { echo "pipeline finished, last checkpoint $(date +%T)"; exit 0; }
  sleep 1200
done
