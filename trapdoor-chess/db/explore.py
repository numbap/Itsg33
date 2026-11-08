import chess, chess.engine, sys, json
eng=chess.engine.SimpleEngine.popen_uci("/usr/games/stockfish"); eng.configure({"Threads":4,"Hash":256})
def sc(info,pov):
    s=info["score"].pov(pov)
    return f"#{s.mate()}" if s.is_mate() else f"{s.score()/100:+.1f}"
def pv(b,info,n=10):
    bb=b.copy();out=[]
    for m in info.get("pv",[])[:n]:
        out.append(bb.san(m));bb.push(m)
    return " ".join(out)
cands=json.load(open(sys.argv[1]))
for c in cands:
    b=chess.Board()
    try:
        for m in c["setup"].split(): b.push_san(m)
    except Exception as e: print(c["id"],"BAD SETUP",e);continue
    me=b.turn
    print(f"\n=== {c['id']}  ({'W' if me else 'B'} to move)  try={c['move']}")
    infos=eng.analyse(b,chess.engine.Limit(depth=18),multipv=3)
    for i in infos: print("  best:",sc(i,me),pv(b,i,6))
    if c["move"]=="?": continue
    try: b.push_san(c["move"])
    except Exception as e: print("  BAD MOVE",e);continue
    infos=eng.analyse(b,chess.engine.Limit(depth=18),multipv=3)
    for i in infos: print("   reply:",sc(i,me),pv(b,i,11))
eng.quit()
