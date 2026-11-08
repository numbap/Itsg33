import json,re
T=json.load(open('traps.json'))
s=open('template.html').read()
s=s.replace('/*TRAPS*/','const TRAPS='+json.dumps(T,ensure_ascii=False,separators=(",",":"))+';')
css=open('chessground.cburnett.css').read()
rules=re.findall(r"piece\.(\w+)\.(\w+)\s*\{\s*background-image:\s*(url\('[^']+'\))",css)
s=s.replace('/*PIECES*/',"".join(f".{a}.{b}{{background-image:{u}}}" for a,b,u in rules))
open('../app/index.html','w').write(s); print(len(T),"traps built")
