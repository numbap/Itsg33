# Stage 5: pick a batch of mined traps for validation and writing.
# Drops duplicates of the curated database, trivial "free piece" traps, and
# traps with no variations; ranks by how often club players fall for them.
import json, chess, sys, collections
N=int(sys.argv[1]) if len(sys.argv)>1 else 25
PRIORITY=sys.argv[2].split(",") if len(sys.argv)>2 else ["French_Defense","Kings_Indian_Defense","Indian_Defense","Scandinavian_Defense","Scotch_Game","Italian_Game"]
CAP=int(sys.argv[3]) if len(sys.argv)>3 else 6
trees=json.load(open('data/trees.json'))
have=set()
for t in json.load(open('../db/traps.json')):
    b=chess.Board()
    for m in t['setup'].split(): b.push_san(m)
    have.add(b.epd())
taken=set(json.load(open('data/selected.json'))) if __import__('os').path.exists('data/selected.json') else set()
INTERESTING={"fork","pin","skewer","discoveredAttack","doubleCheck","trappedPiece","mate","mateIn1","mateIn2","mateIn3",
             "smotheredMate","sacrifice","deflection","attraction","interference","clearance","xRayAttack","exposedKing","kingsideAttack","queensideAttack","intermezzo"}
rows=[]
for k,v in trees.items():
    t=v['tree']; o=v['order']
    if not t or not t['lines'] or k in taken: continue
    b=chess.Board()
    for m in o['setup'].split(): b.push_san(m)
    if b.epd() in have: continue
    th=set(o['themes'])
    if not th & INTERESTING: continue                 # plain hanging piece: not much of a trap
    rows.append(dict(key=k,o=o,t=t,score=o['blunder_games']))
rows.sort(key=lambda r:-r['score'])
fam_rank=lambda r: next((i for i,f in enumerate(PRIORITY) if r['o']['family'].startswith(f)),len(PRIORITY))
pick=[]; per=collections.Counter()
for r in sorted(rows,key=lambda r:(fam_rank(r),-r['score'])):
    f=r['o']['family']
    if per[f]>=(CAP if fam_rank(r)<len(PRIORITY) else 2): continue
    pick.append(r); per[f]+=1
    if len(pick)>=N: break
out=[]
for i,r in enumerate(pick):
    o=r['o']
    out.append(dict(id=f"m{len(taken)+i+1:03d}",key=r['key'],family=o['family'],variation=o['var'],side=o['side'],setup=o['setup'],
        fell_for=o['blunder_games'],share=round(o['share'],3),puzzle_rating=o['rating'],themes=o['themes'],
        lines=[dict(moves=l['moves'],label="",note="",human=l.get('human')) for l in r['t']['lines']]))
json.dump(out,open('data/batch.json','w'),indent=1)
print(f"{len(rows)} usable after filters; picked {len(out)}")
print(collections.Counter(r['o']['family'] for r in pick).most_common())
