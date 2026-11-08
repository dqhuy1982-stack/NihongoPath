import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const root=new URL('../source/public/',import.meta.url);
const load=path=>readFileSync(new URL(path,root),'utf8');
function harness({hasAudio=true,hash='#course/N5/lesson/01'}={}){
 const store=new Map(),window={},callbacks={},location={hash},renders=[],speeches=[];
 let current='demo-a';
 const localStorage={getItem:key=>store.get(key)||null,setItem:(key,v)=>store.set(key,v)};
 const document={
  readyState:'loading',
  addEventListener:(name,fn)=>callbacks[name]=fn,
  querySelector:()=>({}),
  getElementById:()=>null
 };
 if(hasAudio){
  window.SpeechSynthesisUtterance=class{constructor(jp){this.text=jp}};
  window.speechSynthesis={cancel(){},getVoices:()=>[{lang:'ja-JP',name:'Japanese'}],
   speak(u){speeches.push(u.text);u.onstart?.()}};
 }
 const context={window,location,document,localStorage,P:()=>({id:current}),render:v=>renders.push(v),
  queueMicrotask:fn=>fn()};
 runInNewContext(load('n5-lesson01-data-v146.js'),context);
 const firstCourse=id=>'ORIGINAL COURSE '+id;
 context.coursePage=firstCourse;
 runInNewContext(load('n5-lesson01-v146.js'),context);
 return{ui:window.NPN5Lesson01,window,context,store,location,callbacks,renders,speeches,setProfile:id=>current=id};
}
function finishPerfect(h,kind,{playAudio=true}={}){
 const api=h.ui;api.start(kind);
 const run=api.session();
 for(let i=0;i<run.questions.length;i++){
  const q=run.questions[i];
  run.index=i;
  if(q.type==='listening'&&playAudio){
   h.callbacks.click({target:{closest:selector=>selector==='[data-n5l-play]'?{dataset:{n5lPlay:q.context}}:null},preventDefault(){}});
  }
  api.answer(q.correct);
 }
 api.finish();
 return api.session().report;
}
test('Bài 01 has balanced original vocabulary, grammar, reading, listening and two independent assessments',()=>{
 const h=harness(),d=h.ui.data();
 assert.equal(d.vocab.length,30);
 assert.equal(new Set(d.vocab.map(x=>x.id)).size,30);
 assert.equal(d.grammar.length,6);
 assert.equal(d.reading.paragraphs.length,3);
 assert.equal(d.listening.length,3);
 assert.equal(d.practice.length,16);
 assert.equal(d.exam.length,20);
 assert.equal(new Set([...d.practice,...d.exam].map(q=>q.id)).size,36);
 for(const list of [d.practice,d.exam]){
  for(const type of ['vocab','grammar','reading','listening'])
   assert.ok(list.some(q=>q.type===type),'Missing '+type);
  for(const q of list){
   assert.ok(q.prompt&&q.why);
   assert.ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<q.options.length);
   if(q.type==='listening')assert.ok(d.listening.some(t=>t.id===q.context),'Unknown audio context '+q.context);
  }
 }
});
test('Lesson 01 deep-link intercepts N5 course route only and preserves legacy course views',()=>{
 const h=harness(),page=h.context.coursePage('N5');
 assert.match(page,/data-n5-lesson="01"/);
 assert.match(page,/30 từ trọng tâm/);
 assert.match(page,/Tiêu chí đạt: 80%/);
 assert.equal(h.context.coursePage('N4'),'ORIGINAL COURSE N4');
 h.location.hash='#course/N5';
 assert.equal(h.context.coursePage('N5'),'ORIGINAL COURSE N5');
 assert.ok(h.callbacks.DOMContentLoaded);
 h.callbacks.DOMContentLoaded();
 assert.deepEqual(h.renders,[false]);
});
test('Learning sections are available one at a time with real content and user-specific viewed state',()=>{
 const h=harness();
 for(const [section,pattern] of [
  ['vocab',/30 từ trọng tâm/],['grammar',/6 điểm ngữ pháp cốt lõi/],
  ['reading',/Ngày đầu ở lớp/],['listening',/Ba tình huống/]
 ]){
  h.ui.select(section);
  assert.match(h.ui.page(),pattern);
 }
 assert.equal(h.ui.read().viewed.length,0,'Programmatic render is not proof of learning');
});
test('Passing practice alone does not mark Lesson 01 completed',()=>{
 const h=harness();
 const rec=finishPerfect(h,'practice');
 assert.equal(rec.percent,100);
 assert.equal(h.ui.status().practice,true);
 assert.equal(h.ui.status().check,false);
 assert.equal(h.ui.status().complete,false);
 assert.equal(h.ui.read().attempts.length,1);
});
test('All-correct check without playable Japanese audio cannot create false completed status',()=>{
 const h=harness({hasAudio:false});
 finishPerfect(h,'practice',{playAudio:false});
 const result=finishPerfect(h,'check',{playAudio:false});
 assert.equal(result.percent,100);
 assert.equal(result.listeningVerified,false);
 assert.equal(h.ui.status().practice,true);
 assert.equal(h.ui.status().checked,true);
 assert.equal(h.ui.status().check,false);
 assert.equal(h.ui.status().complete,false);
 assert.match(h.ui.page(),/phần nghe chưa được xác nhận/i);
 assert.match(h.ui.page(),/Chưa xác nhận phần nghe/);
});
test('Genuine playback-start events + successful practice and check complete lesson',()=>{
 const h=harness();
 finishPerfect(h,'practice');
 const result=finishPerfect(h,'check');
 assert.equal(result.listeningVerified,true);
 assert.equal(result.percent,100);
 assert.equal(h.ui.status().check,true);
 assert.equal(h.ui.status().complete,true);
 assert.ok(h.speeches.length>=6);
 assert.match(h.ui.page(),/✓ Bài 01 đã hoàn thành/);
 assert.equal(h.ui.read().attempts.length,2);
});
test('Retakes, practice failures and four learner profiles do not overwrite each other',()=>{
 const h=harness();
 finishPerfect(h,'practice');
 finishPerfect(h,'check');
 const firstHistory=h.ui.read().attempts.length;
 h.ui.start('practice');
 const run=h.ui.session();
 for(let i=0;i<run.questions.length;i++){run.index=i;h.ui.answer((run.questions[i].correct+1)%run.questions[i].options.length)}
 h.ui.finish();
 assert.equal(h.ui.status().complete,true,'Successful historical evidence is retained after poor retake');
 assert.equal(h.ui.read().attempts.length,firstHistory+1);
 h.setProfile('demo-b');assert.equal(h.ui.status().complete,false);
 assert.equal(h.ui.read().attempts.length,0);
 h.setProfile('demo-a');assert.equal(h.ui.status().complete,true);
});
test('Lesson 01 actual assets and entry script load in correct order',()=>{
 const html=load('index.html');
 const p1=html.indexOf('src="n5-path-v145.js?v=146"');
 const p2=html.indexOf('src="n5-lesson01-data-v146.js?v=146"');
 const p3=html.indexOf('src="n5-lesson01-v146.js?v=146"');
 assert.ok(p1>0&&p2>p1&&p3>p2,'Course route, content then lesson controller');
 assert.ok(html.includes('n5-lesson01-v146.css?v=146'));
 const css=load('n5-lesson01-v146.css');
 assert.match(css,/@media\(max-width:420px\)/);
 assert.match(css,/prefers-reduced-motion/);
});
