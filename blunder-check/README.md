# Blunder Check

A browser chess trainer. You play a Stockfish bot that starts at 250 Elo and tracks your rating. From move 6, you must assess the position before you can move, and you type every move in algebraic notation.

## Files

| File | What it is |
| --- | --- |
| `blunder-check.html` | The whole app: board, quiz, bot, review. Loads chess.js from cdnjs. |
| `stockfish.js` | Stockfish 10 compiled to JavaScript (GPL-3.0), run in a web worker. |
| `tests/e2e.cjs` | Playwright test: notation parser cases, a typed game, the quiz lock and the review. |

## Run it locally

The engine runs as a web worker, so serve the folder over HTTP instead of opening the file directly:

```bash
python3 -m http.server 8766
```

Then open http://localhost:8766/blunder-check.html.

## Test

With the server running:

```bash
node tests/e2e.cjs
```

It needs Playwright with Chromium. Set `BC_SHOTS` to choose where the screenshots go (the default is `tests/`).

## How it works

- **Bot strength.** Stockfish scores every legal move. The bot then picks one at random, weighted toward better moves; how random depends on its rating (`botParams` / `pickMove`). Low ratings also play a share of completely random moves. The bot is always set to your current rating.
- **Your rating.** Standard Elo against the bot's rating: K = 60 for your first 10 games, then 32. Stored in `localStorage` in your browser only.
- **Position checks.** The checks are Threats and Safety, then Opportunities from 500 and Candidate moves from 900. The first three are worked out by counting attackers, defenders and piece values (`attackersOf`, `enPrise`). Candidate moves uses a Stockfish search. A check you get right first time in 9 of your last 10+ tries counts as mastered, and from then on comes up only about a third of the time.
- **Move entry.** `readMove` accepts standard algebraic notation. It tolerates a missing `x`, `+`, `=` and `0-0` for castling, and explains common errors: lowercase piece letters, coordinate notation, ambiguous moves, a missing promotion piece, pawn captures without the file, and illegal moves.
- **Move grading.** Each of your moves gets its own short search of the position before and after the move. A loss of 1.5 pawns or more counts as a mistake, and 3 or more as a blunder. Quick browser searches are noisy, so treat small values as approximate.
- **Game review.** After each game it lists every check you missed and every mistake or blunder, in move order. Each blunder notes whether it came right after a clean assessment. Click an item to see that position on the board, with what you missed (or the better move) marked.
