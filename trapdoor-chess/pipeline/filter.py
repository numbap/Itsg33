import zstandard, io, csv, json, collections
f=open('puzzles.csv.zst','rb'); r=zstandard.ZstdDecompressor().stream_reader(f)
rd=csv.reader(io.TextIOWrapper(r,encoding='utf-8'))
hdr=next(rd); print(hdr)
out=[]; n=0; fam=collections.Counter()
for row in rd:
    n+=1
    pid,fen,moves,rating,rd_,pop,plays,themes,url,tags=row[:10]
    th=themes.split()
    if 'opening' not in th: continue
    full=int(fen.split()[5])
    if full>12: continue
    if int(plays)<300 or int(pop)<70: continue
    out.append(dict(id=pid,fen=fen,moves=moves,rating=int(rating),pop=int(pop),plays=int(plays),themes=th,url=url,tags=tags))
    fam[tags.split()[0] if tags else '?']+=1
print('total puzzles',n,'kept',len(out))
json.dump(out,open('opening_puzzles.json','w'))
print(fam.most_common(40))
