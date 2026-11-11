#!/usr/bin/env python3
"""Turn candidate traps from search.py into puzzles with variations, offline.

For each candidate: the trapper's moves come from Stockfish; the defender's replies are the
moves club players actually chose in that position (from the opening tree's counts, at least
--min-share of games), plus Stockfish's best defence. Lines stop once the trapper's advantage
is cashed in, play forced mates out to the end, and never stop on a check. Where two trapper
moves are equally good, the line ends on the defender's move instead of guessing.

Writes a compact JSON list: [{setup, side, games, lines:[{moves, eval|mate, human}]}].

Usage: python variations.py --tree data/tree_wide.json --raw data/traps_raw.json --out data/puzzles.json
"""
import argparse, json, os, sys
import chess, chess.engine

ap = argparse.ArgumentParser()
ap.add_argument("--tree", default="data/tree.json")
ap.add_argument("--raw", nargs="+", default=["data/traps_raw.json"])
ap.add_argument("--out", default="data/puzzles.json")
ap.add_argument("--engine", default="stockfish")
ap.add_argument("--depth", type=int, default=16)
ap.add_argument("--min-share", type=float, default=0.08)
a = ap.parse_args()

counts = json.load(open(a.tree))["counts"]
eng = chess.engine.SimpleEngine.popen_uci(a.engine)
eng.configure({"Threads": 8, "Hash": 512})
D = chess.engine.Limit(depth=a.depth)

def cp(s):
    if s.is_mate():
        return 100000 - abs(s.mate()) * 100 if s.mate() > 0 else -100000 + abs(s.mate()) * 100
    return s.score()

def human_replies(key, board, maxn):
    """Defender moves club players chose here (by tree counts), plus the engine's best defence."""
    if board.is_game_over():
        return []
    total = counts.get(key, 0)
    out = []
    if total:
        kids = []
        for mv in board.legal_moves:
            san = board.san(mv)
            n = counts.get((key + " " + san).strip(), 0)
            if n and n / total >= a.min_share:
                kids.append((san, n))
        out = sorted(kids, key=lambda x: -x[1])
    best = eng.analyse(board, D).get("pv")
    if best:
        bs = board.san(best[0])
        if bs not in [s for s, _ in out]:
            out.append((bs, -1))                      # -1 = engine's best defence
    return out[: maxn + 1]

def extend(board, key, me, line, depth_left):
    """Trapper to move. Returns [(moves, flags)]."""
    if board.is_game_over():
        return [(line, {})]
    r = eng.analyse(board, D, multipv=2)
    if not r or "pv" not in r[0]:
        return [(line, {})]
    m = r[0]["pv"][0]; s1 = cp(r[0]["score"].pov(me))
    san = board.san(m); b2 = board.copy(); b2.push(m); L = line + [san]; k2 = key + " " + san
    if b2.is_checkmate():
        return [(L, {"mate": True})]
    ours = len(L[::2]); mating = s1 > 90000
    if mating and depth_left > -4:
        pass
    elif b2.is_check() and depth_left > -2:
        pass
    elif depth_left <= 0 or s1 >= 300 or (s1 >= 150 and ours >= 2):
        return [(L, {"eval": s1})]
    if b2.is_game_over():
        return [(L, {"eval": s1})]
    if mating:
        pv = eng.analyse(b2, D).get("pv"); reps = [(b2.san(pv[0]), -1)] if pv else []
    else:
        reps = human_replies(k2, b2, 1 if depth_left <= 1 else 2)
    res = []
    for dsan, n in reps:
        b3 = b2.copy(); b3.push_san(dsan)
        r3 = eng.analyse(b3, D, multipv=2)
        a1 = cp(r3[0]["score"].pov(me)) if r3 else 0
        a2 = cp(r3[1]["score"].pov(me)) if len(r3) > 1 else -10**6
        if a1 - a2 < 60 and a1 < 90000:               # trapper's next move would be ambiguous
            res.append((L + [dsan], {"eval": a1, "human": n}))
        else:
            for sub, fl in extend(b3, k2 + " " + dsan, me, L + [dsan], depth_left - 1):
                res.append((sub, {**fl, "human": fl.get("human", n)}))
    return res

def build(setup, first):
    b = chess.Board()
    for m in setup.split():
        b.push_san(m)
    me = b.turn
    b2 = b.copy(); b2.push_san(first)
    key = setup + " " + first
    if b2.is_checkmate():
        return [dict(moves=first, mate=True, human=-1)]
    lines = []
    for dsan, n in human_replies(key, b2, 3):
        b3 = b2.copy(); b3.push_san(dsan)
        for L, fl in extend(b3, key + " " + dsan, me, [first, dsan], 2):
            lines.append(dict(moves=" ".join(L), **{**fl, "human": n}))
    return lines

raw = []
for path in a.raw:
    raw += json.load(open(path))["traps"]
seen = set(); cands = []
for t in sorted(raw, key=lambda t: -t["blunder_games"]):
    if t["setup"] in seen:
        continue
    seen.add(t["setup"]); cands.append(t)
done = json.load(open(a.out)) if os.path.exists(a.out) else []
have = {p["setup"] for p in done}
for i, t in enumerate(cands, 1):
    if t["setup"] in have:
        continue
    try:
        lines = build(t["setup"], t["trap_move"])
    except Exception as e:
        print(f"skip {t['setup']}: {e}", file=sys.stderr); continue
    done.append(dict(setup=t["setup"], side=t["side"], games=t["blunder_games"], share=t["share"],
                     drop=t["drop"], lines=lines))
    with open(a.out, "w") as f:
        json.dump(done, f, indent=0)
    print(f"{i}/{len(cands)} {t['setup']} -> {t['trap_move']}: {len(lines)} lines", file=sys.stderr, flush=True)
eng.quit()
