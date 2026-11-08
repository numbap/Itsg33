import chess, chess.engine, json, sys
eng=chess.engine.SimpleEngine.popen_uci("/usr/games/stockfish"); eng.configure({"Threads":4,"Hash":256})
D=int(sys.argv[2]) if len(sys.argv)>2 else 16
def cp(s):  # PovScore -> centipawns-ish
    return 10000-abs(s.mate())*10 if s.is_mate() and s.mate()>0 else (-10000+abs(s.mate())*10 if s.is_mate() else s.score())
def fmt(v): return f"M" if v>9000 else ("-M" if v<-9000 else f"{v/100:+.1f}")
T=json.load(open(sys.argv[1]))
only=sys.argv[3].split(",") if len(sys.argv)>3 else None
bad=0
for t in T:
    if only and t["id"] not in only: continue
    b=chess.Board(); issues=[]
    try:
        for m in t["setup"].split(): b.push_san(m)
    except Exception as e: print(t["id"],"BAD SETUP",e); bad+=1; continue
    me=chess.WHITE if t["side"]=="w" else chess.BLACK
    if b.turn!=me: issues.append("wrong side to move")
    root=b.copy(); report=[]
    labels=set()
    for l in t["lines"]:
        labels.add(l["label"])
        bb=root.copy(); mv=l["moves"].split()
        for k,san in enumerate(mv):
            try: m=bb.parse_san(san)
            except Exception as e: issues.append(f"[{l['label']}] illegal {san} at {k}"); break
            if bb.san(m)!=san: issues.append(f"[{l['label']}] SAN {san}->{bb.san(m)}")
            if bb.turn==me:
                infos=eng.analyse(bb,chess.engine.Limit(depth=D),multipv=3)
                best=cp(infos[0]["score"].pov(me)); bestsan=bb.san(infos[0]["pv"][0])
                bb2=bb.copy(); bb2.push(m)
                if bb2.is_checkmate(): mine=10000
                else:
                    i2=eng.analyse(bb2,chess.engine.Limit(depth=D)); mine=cp(i2["score"].pov(me))
                if best-mine>120 and not (mine>600):
                    issues.append(f"[{l['label']}] ply{k} {san} {fmt(mine)} but {bestsan} {fmt(best)}")
                # ambiguity: other strong moves
                alts=[(bb.san(i["pv"][0]),cp(i["score"].pov(me))) for i in infos if i["pv"][0]!=m]
                for a,v in ([] if bb2.is_checkmate() else alts):
                    if (v>=mine-40 and v>=150) or (mine>9000 and v>9000):
                        issues.append(f"[{l['label']}] ply{k} {san} {fmt(mine)} ALT {a} {fmt(v)}")
            bb.push(m)
        else:
            if bb.is_checkmate(): end="mate"
            else:
                i=eng.analyse(bb,chess.engine.Limit(depth=D)); v=cp(i["score"].pov(me)); end=fmt(v)
                if v<(-100 if l.get("best") else 120): issues.append(f"[{l['label']}] ends only {end}")
            report.append(f"{l['label'][:30]}:{end}")
    print(f"{'OK ' if not issues else '!! '}{t['id']:14} "+" | ".join(report))
    for s in issues: print("     ",s)
    bad+=bool(issues)
print("traps with issues:",bad); eng.quit()
