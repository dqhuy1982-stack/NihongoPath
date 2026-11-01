'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const {readFileSync}=require('node:fs');
const {join}=require('node:path');
const root=join(__dirname,'..','source','public');
const script=readFileSync(join(root,'kana-studio.js'),'utf8');
const styles=readFileSync(join(root,'kana-studio.css'),'utf8');
const downloader=readFileSync(join(__dirname,'..','scripts','Download-Kana-Audio.ps1'),'utf8');
const source=readFileSync(join(root,'kana-data.js'),'utf8');
const data=JSON.parse(source.slice(source.indexOf('={')+1,source.lastIndexOf(';')));
const begin=script.indexOf(' const kanaClips={');
const finish=script.indexOf(' const commonsUrl=',begin);
if(begin<0||finish<0)throw Error('Missing base Kana mapping');
const literal=script.slice(begin,finish).replace(' const kanaClips=','').trim().replace(/;$/,'');
const clips=Function('return ('+literal+')')();
test('92 Kana characters share exactly 46 basic spoken sounds',()=>{
 assert.equal(data.characters.length,92);
 const values=new Set(data.characters.map(x=>x.romaji));
 assert.equal(values.size,46);
 assert.equal(Object.keys(clips).length,46);
 for(const k of values)assert.ok(clips[k], 'Missing pronunciation for '+k);
});
test('download plan uses licensed Kana Sounds, stops on first failure and activates only complete pack',()=>{
 assert.match(downloader,/huggingface\.co\/datasets\/arsalan-anwari\/kana-sounds\/resolve\/main\/audio\/seion/);
 assert.match(downloader,/CC BY 4\.0/);
 assert.match(downloader,/if \(\$success -ne 46\)/);
 assert.match(downloader,/throw "Audio download stopped:/);
 assert.match(downloader,/\$pack \| ConvertTo-Json/);
 assert.doesNotMatch(downloader,/upload\.wikimedia\.org/);
});
test('direct user audio gesture prefers same-origin clips; uninstalled pack does not contact Wikimedia',()=>{
 assert.match(script,/if\(action==='speak'\)\{playKana\(glyph\(w\)\);return;\}/);
 assert.match(script,/if\(action==='select'\).*?playKana\(records\.get\(b\.dataset\.char\)\)/);
 assert.match(script,/const url='assets\/kana-audio\/'/);
 assert.match(script,/const attempt=audio\.play\(\)/);
 assert.match(script,/audio\.onerror=setError;/);
 assert.match(script,/if\(!kanaLocalPackReady\)/);
 assert.match(script,/No sound yet\?/);
 assert.match(script,/assets\/kana-audio\/ATTRIBUTION\.txt/);
});
test('restored stable Kana layout: 5 glyph columns, full-size stroke and no forced viewport',()=>{
 assert.match(styles,/\.ks-glyph-grid\{display:grid;grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/);
 assert.match(styles,/\.ks-svg\{display:block;width:100%;height:auto;aspect-ratio:1/);
 assert.match(styles,/\.ks-playback-bar\{/);
 assert.doesNotMatch(styles,/body\.ks-page-focus/);
 assert.doesNotMatch(styles,/real one-viewport desktop workspace/);
 assert.doesNotMatch(script,/classList\.toggle\('ks-page-focus'/);
});
test('mobile step switching, writing and learner persistence remain intact',()=>{
 assert.match(script,/ks-mobile-\$\{w\.mobileStep\}/);
 assert.match(script,/function paint\(w,canvas\)/);
 assert.match(script,/function refreshControls\(w\)/);
 assert.match(script,/if\(action==='confirm'\)/);
 assert.match(script,/if\(action==='undo'\|\|action==='clear'\)/);
});
