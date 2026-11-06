import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const root=new URL('../source/public/',import.meta.url);
const read=p=>readFileSync(new URL(p,root),'utf8');
function uiRows(){
 const context=vm.createContext({});
 for(const file of ['locale-data.js','locale-coverage.js','lesson-locale.js','foundation-locale.js'])
   vm.runInContext(read(file),context,{filename:file});
 return vm.runInContext('NP_LOCALE_ROWS',context);
}
function authoredN5(){
 const s=read('lesson-content.js');
 const marker='})(';
 const i=s.indexOf(marker);
 assert.ok(i>=0,'lesson wrapper exists');
 return JSON.parse(s.slice(i+marker.length).trim().replace(/\);\s*$/,''));
}
function authoredFoundation(){
 const s=read('foundation-content.js');
 return JSON.parse(s.slice(s.indexOf('=')+1).trim().replace(/;\s*$/,''));
}
function gather(value,path='',out=[]){
 if(typeof value==='string'&&/[À-ỹĐđ]/u.test(value))out.push({path,text:value});
 else if(value&&typeof value==='object')
   for(const [name,child] of Object.entries(value))gather(child,path?path+'.'+name:name,out);
 return out;
}
test('All VI authored explanation fields in current N5 sample have EN/JA translations',()=>{
 const rows=uiRows(),keys=new Map(rows.map(x=>[x[0].normalize('NFC'),x]));
 const missing=gather(authoredN5()).filter(x=>!keys.has(x.text.normalize('NFC')));
 assert.deepEqual(missing,[],JSON.stringify(missing.slice(0,15)));
 for(const row of keys.values())assert.equal(row.length,3);
});

test('Every VI instruction, answer rationale and hint in Foundation Kana pilot has a translation',()=>{
 const rows=uiRows(),keys=new Set(rows.map(x=>x[0].normalize('NFC')));
 const missing=gather(authoredFoundation()).filter(x=>!keys.has(x.text.normalize('NFC')));
 assert.deepEqual(missing,[],JSON.stringify(missing.slice(0,15)));
});

test('Japanese source examples are never rewritten by UI locale sidecars',()=>{
 const n5=authoredN5(),foundation=authoredFoundation();
 assert.ok(n5.story[0].text.includes('はじめまして'));
 assert.ok(n5.cards.identity.example.includes('わたしは学生'));
 assert.equal(foundation.cards.a.example,'あ');
 for(const file of ['lesson-locale.js','foundation-locale.js']){
   assert.ok(!read(file).includes('NP_LESSON_CONTENT='));
   assert.ok(!read(file).includes('NP_FOUNDATION_CONTENT='));
   assert.ok(read(file).includes('NP_LOCALE_ROWS.push('));
 }
});

test('Authored sample translations load before UI engine, regardless of selected language',()=>{
 const html=read('index.html');
 for(const file of ['locale-data.js','locale-coverage.js?v=15','lesson-locale.js?v=14','foundation-locale.js?v=14','locales.js?v=16'])
   assert.ok(html.includes('src="'+file+'"'));
 assert.ok(html.indexOf('src="lesson-locale.js?v=14"')<html.indexOf('src="locales.js?v=16"'));
 assert.ok(html.indexOf('src="foundation-locale.js?v=14"')<html.indexOf('src="locales.js?v=16"'));
});
