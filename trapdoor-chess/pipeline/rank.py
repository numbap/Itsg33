import json, time, urllib.request, urllib.parse, chess, os, sys
R=json.load(open('data/candidates.json'))['clusters']
done=json.load(open('data/rank.json')) if os.path.exists('data/rank.json') else {}
base="https://explorer.lichess.ovh/lichess?"
def q(fen):
    url=base+urllib.parse.urlencode({"fen":fen,"ratings":"1000,1200,1400,1600,1800,2000","speeds":"blitz,rapid,classical","moves":"12","topGames":"0","recentGames":"0"})
    for attempt in range(6):
        try:
            with urllib.request.urlopen(url,timeout=30) as f: return json.load(f)
        except urllib.error.HTTPError as e:
            if e.code==429: time.sleep(60); continue
            raise
        except Exception: time.sleep(5)
    return None
for i,r in enumerate(R):
    if r['key'] in done: continue
    pre=r['best']['fen']; bl=r['best']['blunder']
    d=q(pre)
    if d is None: continue
    tot=d['white']+d['draws']+d['black']
    m=next((m for m in d['moves'] if m['uci']==bl),None)
    n=(m['white']+m['draws']+m['black']) if m else 0
    done[r['key']]=dict(pos_games=tot,blunder_games=n,share=(n/tot if tot else 0))
    if i%50==0:
        json.dump(done,open('data/rank.json','w')); print(i,len(done),flush=True)
    time.sleep(0.4)
json.dump(done,open('data/rank.json','w')); print('done',len(done))
