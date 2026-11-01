'use strict';
// Regression tests for Kana Studio v4. Run with: node --test tests/kana-v4-layout-audio.test.cjs
const assert=require('node:assert/strict');
const {test}=require('node:test');
const {readFileSync}=require('node:fs');
const {join}=require('node:path');
const {createHash}=require('node:crypto');
const root=join(__dirname,'..','source','public');
const script=readFileSync(join(root,'kana-studio.js'),'utf8');
const styles=readFileSync(join(root,'kana-studio.css'),'utf8');
const source=readFileSync(join(root,'kana-data.js'),'utf8');
const data=JSON.parse(source.slice(source.indexOf('={')+1,source.lastIndexOf(';')));
const begin=script.indexOf(' const kanaClips={');
const finish=script.indexOf(' const commonsUrl=',begin);
if(begin<0||finish<0)throw Error('Missing audio manifest');
const literal=script.slice(begin,finish).replace(' const kanaClips=','').trim().replace(/;$/,'');
const clips=Function('return ('+literal+')')();
test('all 92 Kana characters map to 46 distinct pronunciation clips',()=>{
 assert.equal(data.characters.length,92);
 const values=new Set(data.characters.map(x=>x.romaji));
 assert.equal(values.size,46);
 assert.equal(Object.keys(clips).length,46);
 for(const k of values)assert.ok(clips[k], 'Missing pronunciation for '+k);
});
test('every media hash matches Wikimedia upload normalized filename',()=>{
 for(const [kana,[hash,file]] of Object.entries(clips)){
  assert.match(file,/\.(?:oga|ogg)$/);
  const md5=createHash('md5').update(file).digest('hex');
  assert.equal(hash,md5.slice(0,2),kana+': wrong Commons file path');
 }
});
test('audio is started within direct click/touch handler and reports failure',()=>{
 assert.match(script,/if\(action==='speak'\)\{playKana\(glyph\(w\)\);return;\}/);
 assert.match(script,/if\(action==='select'\).*?playKana\(records\.get\(b\.dataset\.char\)\)/);
 assert.match(script,/audio\.src=url;/);
 assert.match(script,/const attempt=audio\.play\(\)/);
 assert.match(script,/audio\.onerror=setError;/);
 assert.match(script,/source link under Information/);
});
test('viewport workbench is restricted to kana route and large screens',()=>{
 assert.match(script,/classList\.toggle\('ks-page-focus',active\(\)\)/);
 assert.match(styles,/@media\(min-width:1024px\) and \(min-height:680px\)/);
 assert.match(styles,/body\.ks-page-focus #main\{/);
 assert.match(styles,/body\.ks-page-focus \.ks-studio\.ks-compact \.ks-columns\{/);
 assert.match(styles,/body\.ks-page-focus #main>\.footnote\{display:none\}/);
 assert.match(styles,/@media\(max-height:679px\)/);
});
test('mobile steps, drawing and learner persistence remain present',()=>{
 assert.match(script,/ks-mobile-\$\{w\.mobileStep\}/);
 assert.match(script,/function paint\(w,canvas\)/);
 assert.match(script,/function refreshControls\(w\)/);
 assert.match(script,/if\(action==='confirm'\)/);
 assert.match(script,/if\(action==='undo'\|\|action==='clear'\)/);
});
