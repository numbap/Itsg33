#!/bin/sh
# Resumable download of one Lichess monthly games file. Picks up where it left off after a
# dropped connection, until the file reaches its full size.
URL=https://database.lichess.org/standard/lichess_db_standard_rated_2026-09.pgn.zst
OUT=data/2026-09.pgn.zst
FULL=29224520887
cd "$(dirname "$0")"
while :; do
  SIZE=$(stat -f%z "$OUT" 2>/dev/null || echo 0)
  [ "$SIZE" -ge "$FULL" ] && { echo "download complete: $SIZE bytes $(date)"; exit 0; }
  echo "resuming at $SIZE bytes $(date)"
  curl -s -C - -o "$OUT" "$URL"
  sleep 15
done
