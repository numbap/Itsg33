import json, chess, collections
P=json.load(open('opening_puzzles.json'))
cl=collections.defaultdict(list)
for p in P:
    b=chess.Board(p['fen']); mv=p['moves'].split()
    b.push_uci(mv[0])                      # opponent's blunder -> trap position
    key=b.epd()                            # placement+side+castling+ep
    p['trapfen']=b.fen(); p['blunder']=mv[0]; p['sol']=mv[1:]
    cl[key].append(p)
rows=[]
for k,ps in cl.items():
    sols=collections.Counter(p['sol'][0] for p in ps)
    rows.append(dict(key=k,count=len(ps),plays=sum(p['plays'] for p in ps),rating=sorted(p['rating'] for p in ps)[len(ps)//2],
       first=sols.most_common(1)[0][0],sol_agree=sols.most_common(1)[0][1]/len(ps),
       tags=collections.Counter(p['tags'].split()[-1] if p['tags'] else '?' for p in ps).most_common(1)[0][0],
       fam=collections.Counter(p['tags'].split()[0] if p['tags'] else '?' for p in ps).most_common(1)[0][0],
       ids=[p['id'] for p in ps[:5]],urls=[p['url'] for p in ps[:3]],full=int(ps[0]['trapfen'].split()[5]),
       best=max(ps,key=lambda p:p['plays'])))
rows.sort(key=lambda r:-r['count'])
print('distinct positions',len(rows))
for th in (2,3,5,10,20): print(f'positions seen in >={th} games:',sum(r['count']>=th for r in rows))
json.dump(rows,open('clusters.json','w'))
for r in rows[:25]: print(r['count'],r['fam'],r['tags'],'move',r['full'],'sol',r['first'],f"{r['sol_agree']:.0%}",r['rating'])
fams=collections.Counter(r['fam'] for r in rows if r['count']>=3)
print(fams.most_common(45))
