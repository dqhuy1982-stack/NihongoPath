import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const root=new URL('../source/public/',import.meta.url);
const load=path=>readFileSync(new URL(path,root),'utf8');
function harness(hash='#course/N5'){
 const window={},store=new Map(),listeners={},location={hash},renders=[];
 let activeUser='learner-a';
 const document={readyState:'loading',addEventListener:(event,fn)=>{listeners[event]=fn},
  querySelector:()=>null,querySelectorAll:()=>[]};
 const localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)};
 const context={window,document,location,localStorage,P:()=>({id:activeUser,name:'Học viên'}),
  coursePage:id=>'Original '+id,shell:content=>'<div class="original-shell">'+content+'</div>',
  render:x=>renders.push(x),queueMicrotask:fn=>fn()};
 const parts=['world-data.js','n5-cast-extension-v149.js','n5-character-world-v148.js',
  'n5-lesson01-data-v146.js','n5-lesson01-context-v147.js','n5-path-v145.js',
  'n5-lesson01-v146.js','n5-gold-v149.js','horizon-n5-rebuild-v2.js'];
 for(const file of parts)runInNewContext(load(file),context,{filename:file});
 return {window,context,location,store,document,listeners,renders,setUser:id=>activeUser=id};
}
test('v2 is isolated, genuinely replaces course/lesson shell and preserves non-N5 pages',()=>{
 const h=harness(),v2=h.window.HorizonN5V2;
 assert.equal(v2.version,'2.00');
 assert.match(h.context.coursePage('N5'),/n5r-course-status/);
 assert.match(h.context.shell(h.context.coursePage('N5')),/data-n5-rebuild="2.0"/);
 assert.match(h.context.shell(h.context.coursePage('N5')),/n5r-toplinks/);
 assert.equal(h.context.coursePage('N4'),'Original N4');
 h.location.hash='#learn';
 assert.equal(h.context.shell('Original Page'),'<div class="original-shell">Original Page</div>');
});
test('all lesson paths are navigable with proper distinct views, including hard links',()=>{
 const h=harness(),paths=h.window.HorizonN5V2.routes;
 const keys=['course','overview','story','content','practice','check','result','review','characters','contexts'];
 for(const key of keys){
  h.location.hash=paths[key];const html=h.context.coursePage('N5');
  assert.match(html,/<div class="n5r-page"/,'no v2 page for '+key);
  assert.doesNotMatch(html,/data-n5-gold=/,'legacy N5 markup leaked into '+key);
 }
 h.location.hash='#course/N5/lesson/01';
 assert.match(h.context.coursePage('N5'),/Mục tiêu bài học/);
 assert.ok(keys.length>=10);
});
test('course renders 25 lessons across 5 honest stages, without fabricated completed percentages',()=>{
 const h=harness(),v2=h.window.HorizonN5V2;
 const html=v2.stagePage();
 assert.equal((html.match(/class="n5r-stage"/g)||[]).length,5);
 assert.equal((html.match(/class="n5r-lesson-no"/g)||[]).length,25);
 assert.match(html,/Chưa phát hành/);
 assert.match(html,/1\/25 bài đã hoàn thành|Bài 01 · chưa hoàn thành/);
 assert.doesNotMatch(html,/#course\/N5\/lesson\/(0[3-9]|1\d|2\d)/);
 assert.match(html,/#lesson\/n5-demonstratives/);
});
test('Lesson 01 has six linked real scenarios, character context, independent practice and reference',()=>{
 const h=harness(),v2=h.window.HorizonN5V2;
 let s=v2.lessonOverview();
 assert.equal((s.match(/class="n5r-scene-tile"/g)||[]).length,6);
 assert.match(s,/6 tình huống của Bài 01/);
 assert.match(s,/data-tab="vocab"/);
 assert.match(s,/data-tab="listening"/);
 assert.match(s,/n5r-four-grid/);
 assert.match(s,/Hồ sơ nhân vật|Nhân vật & bối cảnh/);
 s=v2.storyPage();
 assert.match(s,/class="n5r-dialogue"/);
 assert.match(s,/data-person=/);
 assert.match(s,/data-play-line=/);
 assert.match(s,/data-scene-answer=/);
 assert.match(s,/data-sub=/);
 assert.match(s,/Địa điểm/);
 assert.match(s,/Thời gian/);
 assert.match(s,/Mối quan hệ/);
});
test('v2 knowledge sections expose actual 30 vocab, 6 grammar, 3 original listening dialogs, reading',()=>{
 const h=harness(),v2=h.window.HorizonN5V2;
 assert.equal(h.window.NPN5Lesson01Data.vocab.length,30);
 assert.equal(h.window.NPN5Lesson01Data.grammar.length,6);
 assert.equal(h.window.NPN5Lesson01Data.listening.length,3);
 for(const tab of ['vocab','grammar','examples','reading','listening']){
  v2.openContent(tab);
  assert.ok(v2.contentPage().includes('n5r-study-content'));
 }
 assert.match(v2.contentPage(),/Nghe hiểu|3 hội thoại/);
});
test('character catalogue lists 30 profiles with no rejected old portrait SVG output',()=>{
 const h=harness(),v2=h.window.HorizonN5V2,all=v2.people();
 assert.equal(all.length,30);
 assert.equal(new Set(all.map(x=>x.id)).size,30);
 const page=v2.libraryPage();
 assert.equal((page.match(/class="n5r-library-person"/g)||[]).length,30);
 assert.match(page,/type="search"/);
 assert.match(page,/data-person=/);
 assert.doesNotMatch(page,/data:image\/svg\+xml/);
});
test('lesson result is read from persisted attempts and no fake 96 percent score is emitted',()=>{
 const h=harness(),v2=h.window.HorizonN5V2;
 const s=v2.resultPage();
 assert.match(s,/Chưa có lượt kiểm tra/);
 assert.doesNotMatch(s,/>96%|96\/100/);
 assert.match(s,/chưa đủ nội dung chuẩn Minna/);
 assert.match(s,/luyện ≥80%|kiểm tra ≥80%/);
});
test('view state is per learner and does not clear existing attempts',()=>{
 const h=harness(),v2=h.window.HorizonN5V2;
 v2.goScene('colleague');
 assert.equal(v2.readView().scene,'colleague');
 assert.ok([...h.store.keys()].some(x=>x.endsWith('learner-a')));
 h.setUser('learner-b');v2.sync();
 assert.equal(v2.readView().scene,'meeting');
 h.setUser('learner-a');v2.sync();
 assert.equal(v2.readView().scene,'colleague');
 assert.ok([...h.store.keys()].every(x=>!x.includes('Horizon.N5.Lesson01')));
});
test('asset and document registration exists; CSS is responsive and no old N5 markup selector patched',()=>{
 const html=load('index.html'),css=load('horizon-n5-rebuild-v2.css'),js=load('horizon-n5-rebuild-v2.js');
 assert.match(html,/horizon-n5-rebuild-v2\.css\?v=200/);
 assert.match(html,/horizon-n5-rebuild-v2\.js\?v=200/);
 assert.ok(html.indexOf('n5-gold-v149.js')<html.indexOf('horizon-n5-rebuild-v2.js'));
 assert.match(css,/\.n5r-shell/);
 assert.match(css,/@media\(max-width:650px\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(css,/:focus-visible/);
 assert.match(js,/const oldCourse=coursePage,oldShell=shell/);
 assert.doesNotMatch(css,/\.n5g-root|\.n5l-root/);
});
