#!/usr/bin/env python3
"""Find opening traps in an opening tree built by tree.py.

A candidate trap is a reply that club players actually choose, that loses material against
best play, and that has one clearly best punishment:
  * the position before it is reached at least --min-node times;
  * the reply is played at least --min-games times and in at least --min-share of those games;
  * at depth --deep it costs the side playing it at least --min-drop centipawns and leaves
    them at --max-after or worse;
  * the punishing move is at least --min-gap centipawns better than the next best (or mates);
  * its cost at depth --shallow is recorded as "shallow_drop": a small value means it looks
    fine at a glance. It is a ranking signal, not a filter by default, because a shallow search
    still sees short tactics (Légal's Mate, smothered mates): the real evidence that a move is
    deceptive is that many club players choose it, which --min-games/--min-share enforce.

Runs --workers Stockfish engines in parallel. Resumable: positions already in --out are skipped.

Usage: python search.py --tree data/tree.json --out data/traps_raw.json
"""
import argparse, json, os, sys, time
from multiprocessing import Pool
import chess, chess.engine

ap = argparse.ArgumentParser()
ap.add_argument("--tree", default="data/tree.json")
ap.add_argument("--out", default="data/traps_raw.json")
ap.add_argument("--engine", default="stockfish")
ap.add_argument("--workers", type=int, default=4)
ap.add_argument("--threads", type=int, default=2)
ap.add_argument("--hash", type=int, default=256)
ap.add_argument("--min-node", type=int, default=1000)
ap.add_argument("--min-games", type=int, default=200)
ap.add_argument("--min-share", type=float, default=0.03)
ap.add_argument("--deep", type=int, default=18)
ap.add_argument("--shallow", type=int, default=2)
ap.add_argument("--min-drop", type=int, default=150)
ap.add_argument("--max-after", type=int, default=-130)
ap.add_argument("--min-gap", type=int, default=100)
ap.add_argument("--max-shallow-drop", type=int, default=10**6, help="optional hard filter on shallow_drop")
ap.add_argument("--limit", type=int, default=0, help="only search this many positions (testing)")
a = ap.parse_args()

def cp(score):
    if score.is_mate():
        m = score.mate()
        return 100000 - abs(m) * 100 if m > 0 else -100000 + abs(m) * 100
    return score.score()

ENGINE = None
def init():
    global ENGINE
    ENGINE = chess.engine.SimpleEngine.popen_uci(a.engine)
    ENGINE.configure({"Threads": a.threads, "Hash": a.hash})

def examine(job):
    """job = (prefix SAN string, node count, [(move SAN, games), ...]). Returns found traps."""
    prefix, node_games, children = job
    board = chess.Board()
    for san in prefix.split():
        board.push_san(san)
    victim = board.turn
    deep_best = cp(ENGINE.analyse(board, chess.engine.Limit(depth=a.deep))["score"].pov(victim))
    shallow = ENGINE.analyse(board, chess.engine.Limit(depth=a.shallow))
    shallow_best = cp(shallow["score"].pov(victim))
    found = []
    for san, games in children:
        move = board.parse_san(san)
        after = board.copy(); after.push(move)
        if after.is_game_over():
            continue
        info = ENGINE.analyse(after, chess.engine.Limit(depth=a.deep), multipv=2)
        trapper = after.turn
        best = cp(info[0]["score"].pov(trapper))
        second = cp(info[1]["score"].pov(trapper)) if len(info) > 1 else -100000
        drop = deep_best - (-best)              # what the reply costs the side that played it
        if drop < a.min_drop or -best > a.max_after:
            continue
        if best < 90000 and best - second < a.min_gap:
            continue                            # no single clear punishment
        sh = ENGINE.analyse(board, chess.engine.Limit(depth=a.shallow), root_moves=[move])
        shallow_drop = shallow_best - cp(sh["score"].pov(victim))
        if shallow_drop > a.max_shallow_drop:
            continue                            # optional: obviously bad at a glance
        punish = after.san(info[0]["pv"][0])
        found.append(dict(setup=(prefix + " " + san).strip(), trap_move=punish,
                          side="w" if trapper == chess.WHITE else "b",
                          node_games=node_games, blunder_games=games, share=round(games / node_games, 3),
                          drop=drop, eval_after=best, gap=(best - second) if best < 90000 else None,
                          shallow_drop=shallow_drop, pv=" ".join(_pv(after, info[0].get("pv", [])))))
    return prefix, found

def _pv(board, pv, n=8):
    b = board.copy(); out = []
    for m in pv[:n]:
        out.append(b.san(m)); b.push(m)
    return out

def main():
    counts = json.load(open(a.tree))["counts"]
    counts[""] = max(counts.values())  # start position
    children = {}
    for key, n in counts.items():
        if not key:
            continue
        parent, _, move = key.rpartition(" ")
        children.setdefault(parent, []).append((move, n))
    jobs = []
    for parent, kids in children.items():
        node = counts.get(parent, 0)
        if node < a.min_node:
            continue
        cand = [(m, n) for m, n in kids if n >= a.min_games and n / node >= a.min_share]
        if cand:
            jobs.append((parent, node, cand))
    jobs.sort(key=lambda j: -j[1])
    done = json.load(open(a.out)) if os.path.exists(a.out) else {"searched": [], "traps": []}
    seen = set(done["searched"])
    jobs = [j for j in jobs if j[0] not in seen]
    if a.limit:
        jobs = jobs[: a.limit]
    total = len(jobs); t0 = time.time()
    print(f"{total:,} positions to search ({len(seen):,} already done)", file=sys.stderr, flush=True)
    with Pool(a.workers, initializer=init) as pool:
        for i, (prefix, found) in enumerate(pool.imap_unordered(examine, jobs), 1):
            done["searched"].append(prefix); done["traps"].extend(found)
            if i % 50 == 0 or i == total:
                with open(a.out + ".tmp", "w") as f:
                    json.dump(done, f)
                os.replace(a.out + ".tmp", a.out)
                el = time.time() - t0
                print(f"progress: {i:,}/{total:,} positions, {len(done['traps']):,} candidate traps, "
                      f"{el/60:.0f} min elapsed, ~{el/i*(total-i)/60:.0f} min left", file=sys.stderr, flush=True)

if __name__ == "__main__":
    main()
