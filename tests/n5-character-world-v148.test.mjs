import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const sourceRoot=new URL('../source/public/',import.meta.url);
const load=path=>readFileSync(new URL(path,sourceRoot),'utf8');
function harness(){
 const window={},records=new Map(),listeners={},location={hash:'#course/N5/lesson/01'};
 const document={readyState:'loading',addEventListener:(name,fn)=>{listeners[name]=fn},
  querySelector:()=>({}),getElementById:()=>null};
 let current='learner-one',renderCount=0;
 const localStorage={getItem:k=>records.get(k)??null,setItem:(k,v)=>records.set(k,v)};
 const context={window,document,location,localStorage,P:()=>({id:current}),
  render:()=>{renderCount++},queueMicrotask:fn=>fn()};
 runInNewContext(load('world-data.js')+'\n'+load('n5-character-world-v148.js'),context);
 runInNewContext(load('n5-lesson01-data-v146.js'),context);
 runInNewContext(load('n5-lesson01-context-v147.js'),context);
 runInNewContext(load('n5-lesson01-v146.js'),{...context,coursePage:id=>'old '+id});
 return {window,records,listeners,location,setUser:id=>current=id,getRenderCount:()=>renderCount};
}
test('shared canonical cast gives every scene speaker a fictional reusable character',()=>{
 const h=harness(),world=h.window.NPN5CharacterWorld,scenes=h.window.NPN5Lesson01Scenes.scenes;
 assert.ok(world);
 assert.equal(world.version,'v148-canonical');
 assert.equal(scenes.length,6);
 assert.equal(new Set(scenes.map(x=>x.id)).size,scenes.length);
 for(const scene of scenes){
  assert.ok(scene.place&&scene.time&&scene.relationship&&scene.situation,'ground scene '+scene.id);
  assert.equal(scene.dialogue.length>=3,true,'dialogue must be meaningful '+scene.id);
  for(const line of scene.dialogue){
   const person=world.character(line.who);
   assert.ok(person,'missing '+line.who+' in '+scene.id);
   assert.ok(person.jp&&person.vi&&person.reading,'person metadata missing');
  }
 }
});
test('all six scene illustrations render local illustrated SVGs with contextual alt text',()=>{
 const h=harness(),world=h.window.NPN5CharacterWorld;
 for(const scene of h.window.NPN5Lesson01Scenes.scenes){
  const html=world.hero(scene);
  assert.match(html,/<figure class="n5w-hero">/);
  assert.match(html,/src="data:image\/svg\+xml;charset=utf-8,/);
  assert.match(html,/alt="[^"]+"/);
  assert.match(html,/Bối cảnh:/);
  assert.match(html,/Ở đâu\?/);
  assert.match(html,/Ai nói với ai\?/);
  assert.match(html,/MINH HỌA NGỮ CẢNH/);
  for(const character of world.sceneCast(scene)){
   assert.ok(html.includes('data-n5l-character="'+character.id+'"'),character.id+' chip missing');
  }
 }
});
test('character profile is accessible, fact-grounded and linked to story scenes',()=>{
 const h=harness(),world=h.window.NPN5CharacterWorld;
 const character=world.characters()[0],card=world.profile(character.id);
 assert.ok(card.includes('role="dialog"'));
 assert.ok(card.includes('aria-modal="true"'));
 assert.ok(card.includes('data-n5l-close-character="1"'));
 assert.ok(card.includes('data-n5l-modal-backdrop="1"'));
 assert.ok(card.includes(character.jp));
 assert.ok(card.includes('Quốc tịch'));
 assert.ok(card.includes('Nghề nghiệp'));
 assert.ok(card.includes('Xuất hiện trong'));
 assert.match(card,/src="data:image\/svg\+xml;charset=utf-8,/);
});
test('notes highlight a limited number of phrases and provide context, not only color',()=>{
 const h=harness(),world=h.window.NPN5CharacterWorld;
 const annotated=world.annotate('はじめまして。わたしは マイです。どうぞ よろしくおねがいします。');
 assert.ok(annotated.includes('data-n5l-note='));
 assert.ok(annotated.includes('title='));
 const notes=world.notes();
 assert.ok(notes.length>=7);
 for(const note of notes){
  assert.ok(note.term&&note.meaning&&note.caution&&note.usage,'complete note');
  const card=world.noteCard(note.id);
  assert.match(card,/Cách dùng:/);
  assert.match(card,/Tránh nhầm:/);
 }
});
test('integrated lesson renders six context cards, character entrypoints, note entrypoints, extended tasks',()=>{
 const h=harness(),ui=h.window.NPN5Lesson01;
 assert.equal(ui.version,'v149');
 assert.equal(ui.scenes().length,6);
 const page=ui.page();
 assert.match(page,/n5w-hero/);
 assert.match(page,/data-n5l-character=/);
 assert.match(page,/data-n5l-note=/);
 assert.match(page,/n5w-more-practice/);
 assert.match(page,/data-n5l-sub-answer=/);
 assert.match(page,/data-n5l-order-answer=/);
 assert.match(page,/THỰC HÀNH 02/);
 assert.match(page,/Đọc lại bối cảnh/);
 assert.equal(ui.sceneCount(),0);
 assert.equal(ui.status().complete,false);
});
test('mini-drills stay separate from formal completion and isolate learners',()=>{
 const h=harness(),ui=h.window.NPN5Lesson01;
 const scene=h.window.NPN5Lesson01Scenes.scenes[0];
 assert.equal(ui.substitution(scene.id,scene.replace.answer),true);
 assert.equal(ui.read().scenePractice[scene.id].micro.substitution.correct,1);
 assert.equal(ui.orderSentence(scene.id,2),false,'out of sequence should not pass');
 assert.equal(ui.orderSentence(scene.id,0),true);
 assert.equal(ui.orderSentence(scene.id,1),true);
 assert.equal(ui.orderSentence(scene.id,2),true);
 assert.equal(ui.read().scenePractice[scene.id].micro.reorder.correct,1);
 assert.equal(ui.status().complete,false);
 h.setUser('learner-two');
 assert.equal(ui.read().scenePractice,undefined);
 assert.equal(ui.status().complete,false);
 h.setUser('learner-one');
 assert.equal(ui.read().scenePractice[scene.id].micro.reorder.correct,1);
});
test('v1.48 entry orders fictional world, context, character engine and lesson controller',()=>{
 const html=load('index.html');
 const ordered=['world-data.js','n5-lesson01-context-v147.js?v=148',
  'n5-character-world-v148.js?v=149','n5-lesson01-v146.js?v=149'];
 const positions=ordered.map(x=>html.indexOf(x));
 assert.ok(positions.every(x=>x>=0));
 assert.ok(positions.every((x,i)=>i===0||x>positions[i-1]));
 assert.ok(html.includes('n5-character-world-v148.css?v=148'));
 const css=load('n5-character-world-v148.css');
 assert.match(css,/@media\s*\(max-width:/);
 assert.match(css,/:focus-visible/);
});
