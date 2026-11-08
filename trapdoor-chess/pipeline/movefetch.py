# Stage 3: rebuild a natural move order for each top-ranked trap position from its source game.
import json, time, urllib.request, chess, chess.pgn, io, os, sys
N=int(sys.argv[1]) if len(sys.argv)>1 else 400
CAND=json.load(open('data/candidates.json'))
C={r['key']:r for r in CAND['clusters']}
rank=json.load(open('data/rank.json'))
P=CAND['puzzles']
for p in P.values(): mv=p['moves'].split(); p['blunder']=mv[0]; p['sol']=mv[1:]
keys=sorted(rank,key=lambda k:-rank[k]['blunder_games'])[:N]
out=json.load(open('data/orders.json')) if os.path.exists('data/orders.json') else {}
def pgn(gid):
    u=f"https://lichess.org/game/export/{gid}?moves=true&tags=false&clocks=false&evals=false&opening=false"
    for a in range(5):
        try:
            with urllib.request.urlopen(u,timeout=30) as f: return f.read().decode()
        except urllib.error.HTTPError as e:
            if e.code==429: time.sleep(60); continue
            return None
        except Exception: time.sleep(3)
for k in keys:
    if k in out: continue
    r=C[k]; got=None
    for pid in r['ids']:
        p=P[pid]; gid=p['url'].split('/')[-1].split('#')[0]
        txt=pgn(gid); time.sleep(1.1)
        if not txt: continue
        g=chess.pgn.read_game(io.StringIO(txt)); b=g.board(); sans=[]
        target=chess.Board(p['fen']).epd()
        for mv in g.mainline_moves():
            if b.epd()==target: break
            sans.append(b.san(mv)); b.push(mv)
        if b.epd()!=target: continue
        bl=chess.Move.from_uci(p['blunder']); sans.append(b.san(bl)); b.push(bl)
        sol=[]; bb=b.copy()
        for u in p['sol']: m=chess.Move.from_uci(u); sol.append(bb.san(m)); bb.push(m)
        got=dict(setup=" ".join(sans),sol=" ".join(sol),side='w' if b.turn else 'b',rating=r['rating'],
                 family=r['fam'],var=r['tags'],themes=p['themes'],**rank[k]); break
    out[k]=got
    json.dump(out,open('data/orders.json','w'))
print('orders',sum(1 for v in out.values() if v),'of',len(out))
