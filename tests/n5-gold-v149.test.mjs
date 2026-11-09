import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const root=new URL('../source/public/',import.meta.url);
const load=p=>readFileSync(new URL(p,root),'utf8');
function app(hash='#course/N5'){
 const window={},listeners={},store=new Map(),location={hash},state={renders:0};
 const document={readyState:'loading',addEventListener:(n,f)=>{listeners[n]=f},
  querySelector:()=>({}),querySelectorAll:()=>[]};
 const localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)};
 const ctx={window,location,document,localStorage,coursePage:id=>'prior '+id,
  P:()=>({id:'learner-one'}),render:()=>{state.renders++},queueMicrotask:fn=>fn()};
 runInNewContext(load('world-data.js')+'\n'+load('n5-cast-extension-v149.js')+
  '\n'+load('n5-character-world-v148.js'),ctx);
 runInNewContext(load('n5-lesson01-data-v146.js'),ctx);
 runInNewContext(load('n5-lesson01-context-v147.js'),ctx);
 runInNewContext(load('n5-path-v145.js'),ctx);
 runInNewContext(load('n5-lesson01-v146.js'),ctx);
 runInNewContext(load('n5-gold-v149.js'),ctx);
 return {window,ctx,location,store,listeners,state};
}
test('canonical cast expanded to exactly 30 reusable fictional characters',()=>{
 const h=app(),cast=h.window.NPN5CharacterWorld.characters();
 assert.equal(cast.length,30);
 assert.equal(new Set(cast.map(x=>x.id)).size,30);
 for(const id of ['aoi','mai','keiko','yamada','mike','nakamura','laila','omar']){
  const person=h.window.NPN5CharacterWorld.character(id);
  assert.ok(person,id+' missing');
  assert.ok(person.jp&&person.vi&&person.nationality&&person.job&&person.organization,id+' metadata incomplete');
  assert.match(h.window.NPN5CharacterWorld.portrait(id),/^data:image\/svg\+xml;charset=utf-8,/);
 }
});
test('all N5 routes have real distinct layouts and preserve non-N5 routes',()=>{
 const h=app(),links=[
 ['#course/N5','data-n5-gold="course"'],
 ['#course/N5/lesson/01/overview','data-n5-gold="overview"'],
 ['#course/N5/lesson/01','data-n5-gold="lesson"'],
 ['#course/N5/characters','data-n5-gold="characters"']];
 for(const [route,marker] of links){
  h.location.hash=route;
  const html=h.ctx.coursePage('N5');
  assert.ok(html.includes(marker),route);
  assert.ok(html.includes('#course/N5/lesson/01'),route+' should link to real lesson');
 }
 assert.equal(h.ctx.coursePage('N4'),'prior N4');
 assert.equal(h.ctx.coursePage('foundation'),'prior foundation');
});
test('N5 roadmap includes 25 lessons and never fabricates access to unpublished lessons',()=>{
 const h=app('#course/N5'),html=h.ctx.coursePage('N5');
 assert.equal((html.match(/class="n5g-stage"/g)||[]).length,5);
 assert.equal((html.match(/<li><span>\d{2}<\/span>/g)||[]).length,25);
 assert.match(html,/Bài 01 · はじめまして/);
 assert.match(html,/#lesson\/n5-demonstratives/);
 assert.match(html,/Chưa phát hành/);
 assert.doesNotMatch(html,/#course\/N5\/lesson\/(0[3-9]|1[0-9]|2[0-5])/);
 assert.match(html,/data-n5-gold="course"/);
});
test('Lesson 01 overview provides objectives, real six-scene links, skills and authentic progress',()=>{
 const h=app('#course/N5/lesson/01/overview'),html=h.ctx.coursePage('N5');
 for(const scene of h.window.NPN5Lesson01Scenes.scenes)
  assert.ok(html.includes('data-n5g-scene="'+scene.id+'"'),scene.id);
 for(const id of ['vocab','grammar','reading','listening'])
  assert.ok(html.includes('data-n5g-chapter="'+id+'"'),id);
 assert.match(html,/Mục tiêu bài học/);
 assert.match(html,/6 tình huống|Sáu tình huống/);
 assert.match(html,/0\/6 đã thực hành/);
 assert.match(html,/Chưa làm/);
 assert.match(html,/Thư viện nhân vật/);
 assert.equal(h.window.NPN5GoldUI.people(),30);
 const w=h.window.NPN5Lesson01;
 assert.equal(w.chooseSceneAnswer('meeting',0),true);
 const updated=h.ctx.coursePage('N5');
 assert.match(updated,/1\/6 đã thực hành/);
 assert.equal(w.status().complete,false);
});
test('Lesson layout reuses existing genuine lesson controller and context artwork',()=>{
 const h=app('#course/N5/lesson/01'),html=h.ctx.coursePage('N5');
 assert.match(html,/data-n5-gold="lesson"/);
 assert.match(html,/data-n5-lesson="01"/);
 assert.match(html,/n5w-hero/);
 assert.match(html,/n5g-side-card n5g-companions/);
 assert.match(html,/Bối cảnh giao tiếp/);
 assert.match(html,/data-n5l-panel="practice"/);
 assert.match(html,/data-n5l-panel="check"/);
 assert.match(html,/data-n5l-panel="review"/);
 assert.match(html,/data-n5l-character=/);
});
test('character library searches original cast, differentiates contexts and reuses valid profile overlay',()=>{
 const h=app('#course/N5/characters'),html=h.ctx.coursePage('N5'),world=h.window.NPN5CharacterWorld;
 assert.equal((html.match(/data-n5g-profile="/g)||[]).length,30);
 assert.match(html,/Tìm nhân vật/);
 assert.match(html,/data-n5g-group="work"/);
 assert.match(html,/data-n5g-group="school"/);
 assert.match(html,/data-n5g-group="life"/);
 assert.ok(html.includes('data-n5g-tags='));
 assert.match(world.profile('keiko'),/role="dialog"/);
 assert.match(world.profile('keiko'),/Xuất hiện trong/);
});
test('navigation from overview to a scene or reference opens appropriate lesson view',()=>{
 const h=app('#course/N5/lesson/01/overview'),gold=h.window.NPN5GoldUI,ui=h.window.NPN5Lesson01;
 gold.goScene('colleague');
 assert.equal(h.location.hash,'#course/N5/lesson/01');
 assert.match(ui.page(),/Giới thiệu đồng nghiệp/);
 gold.goChapter('grammar');
 assert.match(ui.page(),/6 điểm ngữ pháp cốt lõi/);
 h.location.hash='#course/N5/lesson/01/overview';
 assert.match(h.ctx.coursePage('N5'),/data-n5-gold="overview"/);
});
test('listen comprehension is required: 17/20 including zero listening correct cannot complete',()=>{
 const h=app('#course/N5/lesson/01'),ui=h.window.NPN5Lesson01;
 function take(kind,listeningWrong){
  ui.start(kind);const run=ui.session();
  for(let i=0;i<run.questions.length;i++){
   run.index=i;
   const q=run.questions[i];
   if(q.type==='listening')run.heard[i]=true;
   ui.answer(q.type==='listening'&&listeningWrong?(q.correct+1)%q.options.length:q.correct);
  }
  ui.finish();return ui.session().report;
 }
 take('practice',false);
 const result=take('check',true);
 assert.equal(result.percent,85);
 assert.equal(result.byType.listening.correct,0);
 assert.equal(result.listeningVerified,true);
 assert.equal(ui.status().practice,true);
 assert.equal(ui.status().check,false);
 assert.equal(ui.status().complete,false);
 assert.match(ui.page(),/Cần luyện nghe thêm/);
});
test('Gold assets are loaded after lesson controller and provide responsive styling',()=>{
 const html=load('index.html'),order=['world-data.js','n5-cast-extension-v149.js',
 'n5-character-world-v148.js?v=149','n5-lesson01-v146.js?v=149','n5-gold-v149.js?v=149'];
 const positions=order.map(s=>html.indexOf(s));
 assert.ok(positions.every(x=>x>0));
 assert.ok(positions.every((x,i)=>i===0||x>positions[i-1]));
 assert.ok(html.includes('n5-gold-v149.css?v=149'));
 const css=load('n5-gold-v149.css');
 assert.match(css,/@media\(max-width:475px\)/);
 assert.match(css,/prefers-reduced-motion/);
 assert.match(css,/:focus-visible/);
 const background=load('assets/n5-fuji-sakura-v149.svg');
 assert.match(background,/viewBox="0 0 1440 380"/);
 assert.ok(background.length<15000);
});
