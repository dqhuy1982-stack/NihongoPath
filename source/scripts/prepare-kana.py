"""Bundle AnimCJK Kana paths, source SVGs and notices; no runtime external fetch."""
from pathlib import Path
import json,re,urllib.request,concurrent.futures,xml.etree.ElementTree as ET,hashlib,datetime
ROOT=Path(__file__).resolve().parents[1]
catalog_path=ROOT/'content/kana-catalog.v1.json'
existing=json.loads(catalog_path.read_text()) if catalog_path.exists() else None
arrays={}
if existing:
    for script in ['hiragana','katakana']:
        arrays[script]=[[c['char'],c['romaji']] for c in existing['characters'] if c['script']==script]
else:
    raise RuntimeError('A source-versioned kana-catalog.v1.json is required. Restore it from Git before rebuilding.')
assert all(len(v)==46 for v in arrays.values())
base='https://raw.githubusercontent.com/parsimonhi/animCJK/'
def get(url):return urllib.request.urlopen(url,timeout=25).read()
commit=existing['sourceCommit']
folder=ROOT/'public/assets/kana-strokes';folder.mkdir(parents=True,exist_ok=True)
def fetch(item):
    script,(char,roman)=item;url=base+commit+'/svgsJaKana/'+str(ord(char))+'.svg'
    source_file=folder/(str(ord(char))+'.svg');raw=source_file.read_bytes() if source_file.exists() else get(url)
    expected=next(c['sha256'] for c in existing['characters'] if c['char']==char)
    if hashlib.sha256(raw).hexdigest()!=expected:raise ValueError('Upstream source changed for '+char+'; review a new data version before accepting it.')
    doc=ET.fromstring(raw);groups={};outlines=[]
    for node in doc.iter():
        if node.tag.split('}')[-1]!='path':continue
        d=node.get('d','')
        if not re.fullmatch(r'[MmLlHhVvCcSsQqTtAaZzEe0-9.,+\-\s]+',d):continue
        if node.get('clip-path'):
            timing=re.search(r'--d\s*:\s*([\d.]+)s',node.get('style',''))
            if timing:groups.setdefault(float(timing.group(1)),[]).append(d)
        elif re.fullmatch(r'z\d+d\d+[a-z]?',node.get('id','')):outlines.append(d)
    strokes=[groups[t] for t in sorted(groups)]
    if not 1<=len(strokes)<=8:raise ValueError((char,'Invalid stroke count',len(strokes)))
    (folder/(str(ord(char))+'.svg')).write_bytes(raw)
    return {'char':char,'romaji':roman,'script':script,'strokes':strokes,'outlines':outlines,'sha256':hashlib.sha256(raw).hexdigest(),'source':url}
items=[(s,v) for s,rows in arrays.items() for v in rows]
records=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    for i,r in enumerate(pool.map(fetch,items),1):
        records.append(r)
        if i%16==0:print(f'Prepared {i}/92 Kana',flush=True)
data={'schemaVersion':1,'version':'animcjk-kana-v1','sourceCommit':commit,'sourceProject':'https://github.com/parsimonhi/animCJK','characters':records}
(ROOT/'content/kana-catalog.v1.json').write_text(json.dumps(data,ensure_ascii=False,indent=2))
(ROOT/'public/kana-data.js').write_text('/* Derived from AnimCJK Kana SVGs; LGPL-3.0-or-later. See assets/kana-strokes/NOTICE.txt. */\nwindow.NP_KANA_DATA='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n')
for name in ['COPYING.txt','LGPL.txt','GPL.txt']:
    try:
        path=folder/name
        if not path.exists():path.write_bytes(get('https://www.gnu.org/licenses/gpl-3.0.txt' if name=='GPL.txt' else base+commit+'/licenses/'+name))
    except Exception as e:raise RuntimeError('Unable to bundle required license '+name) from e
(folder/'NOTICE.txt').write_text('AnimCJK — Copyright 2016–2026 FM&SH.\nSource: https://github.com/parsimonhi/animCJK\nSource revision: '+commit+'\nKana SVGs redistributed under the LGPL-3.0-or-later option.\nOriginal SVG sources are included here. kana-data.js is a derived extraction of ordered median paths and outlines for the Nihongo Path player.\nModifications: extracted path data, grouped segments by animation start time; custom rendering, colors, numbered steps and playback controls. No upstream executable code is embedded.\nSee COPYING.txt, LGPL.txt and GPL.txt.\n')
print('Bundled',len(records),'Kana;',sum(len(r['strokes']) for r in records),'strokes; source',commit,flush=True)
