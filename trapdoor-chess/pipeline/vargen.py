# Stage 4: build variation trees. Defender replies come from what club players actually play
# (explorer), plus the engine's best defence; trapper replies come from Stockfish.
import json, time, urllib.request, urllib.parse, chess, chess.engine, sys, os
eng=chess.engine.SimpleEngine.popen_uci("/usr/games/stockfish"); eng.configure({"Threads":4,"Hash":256})
D=16
def cp(s): return (10000-abs(s.mate())*10 if s.mate()>0 else -10000+abs(s.mate())*10) if s.is_mate() else s.score()
_EXC={}
def explorer(fen):
    k=" ".join(fen.split()[:4])
    if k in _EXC: return _EXC[k]
    _EXC[k]=_explorer(fen); time.sleep(0.4); return _EXC[k]
def _explorer(fen):
    url="https://explorer.lichess.ovh/lichess?"+urllib.parse.urlencode({"fen":fen,"ratings":"1000,1200,1400,1600,1800,2000","speeds":"blitz,rapid,classical","moves":"8","topGames":"0","recentGames":"0"})
    for a in range(5):
        try:
            with urllib.request.urlopen(url,timeout=30) as f: return json.load(f)
        except urllib.error.HTTPError as e:
            if e.code==429: time.sleep(60); continue
            return None
        except Exception: time.sleep(3)
def ev(b,me):
    if b.is_checkmate(): return 10000 if b.turn!=me else -10000
    return cp(eng.analyse(b,chess.engine.Limit(depth=D))["score"].pov(me))
def defences(b,me,maxn=3):
    """Human replies with >=8% share (min 20 games), plus the engine's best defence."""
    out=[]; d=explorer(b.fen())
    if d:
        tot=sum(m['white']+m['draws']+m['black'] for m in d['moves']) or 1
        for m in d['moves']:
            n=m['white']+m['draws']+m['black']
            if n>=20 and n/tot>=(0.08 if maxn>=3 else 0.15): out.append((m['san'],n))
    best=eng.analyse(b,chess.engine.Limit(depth=D))["pv"][0]; bs=b.san(best)
    if bs not in [s for s,_ in out]: out.append((bs,-1))   # -1 marks "engine best defence"
    return out[:maxn+1]
def extend(b,me,line,depth_left):
    """Trapper to move: play engine best; stop when decisive. Returns list of (moves,flags)."""
    if b.is_game_over(): return [(line,{})]
    r=eng.analyse(b,chess.engine.Limit(depth=D),multipv=2)
    m=r[0]["pv"][0]; s1=cp(r[0]["score"].pov(me)); s2=cp(r[1]["score"].pov(me)) if len(r)>1 else -99999
    san=b.san(m); b2=b.copy(); b2.push(m); L=line+[san]
    if b2.is_checkmate(): return [(L,{"mate":True})]
    # stop after our move once we're clearly winning, or when the next move would be ambiguous
    ours=len(L[::2])  # trapper moves so far (lines start with the trapper's move)
    mating=s1>9000
    if mating and depth_left>-4: pass        # keep playing a forced mate out to the end
    elif depth_left<=0 or s1>=300 or (s1>=150 and ours>=2): return [(L,{"eval":s1})]
    res=[]
    for dsan,n in (defences(b2,me,1 if depth_left<=1 else 2) if not mating else [(b2.san(eng.analyse(b2,chess.engine.Limit(depth=D))["pv"][0]),-1)]):
        b3=b2.copy(); b3.push_san(dsan)
        r3=eng.analyse(b3,chess.engine.Limit(depth=D),multipv=2)
        a1=cp(r3[0]["score"].pov(me)); a2=cp(r3[1]["score"].pov(me)) if len(r3)>1 else -99999
        if a1-a2<60 and a1<9000:      # trapper's next move is ambiguous: end the line on the defence
            res.append((L+[dsan],{"eval":a1,"human":n}))
        else:
            for sub,fl in extend(b3,me,L+[dsan],depth_left-1): res.append((sub,{**fl,"human":fl.get("human",n)}))
    return res
def build(setup,sol):
    b=chess.Board()
    for m in setup.split(): b.push_san(m)
    me=b.turn
    first=sol.split()[0]
    r=eng.analyse(b,chess.engine.Limit(depth=D),multipv=2)
    best=cp(r[0]["score"].pov(me)); second=cp(r[1]["score"].pov(me)) if len(r)>1 else -99999
    if b.san(r[0]["pv"][0])!=first: return None,"engine prefers "+b.san(r[0]["pv"][0])
    if best<150: return None,f"only {best}"
    b2=b.copy(); b2.push_san(first)
    lines=[]
    for dsan,n in defences(b2,me,3):
        b3=b2.copy(); b3.push_san(dsan)
        for L,fl in extend(b3,me,[first,dsan],2): lines.append(dict(moves=" ".join(L),**{**fl,"human":n}))
    soft=[] if best-second>=60 else ["?"]
    return dict(lines=lines,first_eval=best,second_eval=second),None
if __name__=="__main__":
    O=json.load(open('data/orders.json')); out=json.load(open('data/trees.json')) if os.path.exists('data/trees.json') else {}
    lim=int(sys.argv[1]) if len(sys.argv)>1 else 10**9
    for k,o in list(O.items())[:lim]:
        if not o or k in out: continue
        t,err=build(o['setup'],o['sol'])
        out[k]=dict(order=o,tree=t,reject=err); json.dump(out,open('data/trees.json','w'))
        print(("OK " if t else "-- ")+o['setup'][-40:],err or len(t['lines']),flush=True)
    eng.quit()
