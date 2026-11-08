import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const source=readFileSync(new URL('../source/public/n5-path-v145.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../source/public/index.html',import.meta.url),'utf8');
const css=readFileSync(new URL('../source/public/n5-path-v145.css',import.meta.url),'utf8');
function harness(hash='#today'){
 const listeners={},renders=[],window={},state={writes:0};
 const document={
  readyState:'loading',
  addEventListener:(name,fn)=>{listeners[name]=fn},
  querySelector:()=>({}),getElementById:()=>null
 };
 const location={hash};
 const prior=id=>'<div data-old-course="'+id+'">Old course route</div>';
 const context={window,document,location,coursePage:prior,render:(scroll)=>renders.push(scroll)};
 runInNewContext(source,context,{filename:'n5-path-v145.js'});
 return {window,context,document,location,listeners,renders,state};
}
test('N5 route has exactly 25 uniquely numbered roadmap entries and 5 stages',()=>{
 const h=harness(),path=h.window.NPN5Path;
 assert.ok(path);
 assert.equal(path.version,'v145');
 const outline=path.outline();
 assert.equal(outline.length,25);
 assert.deepEqual(Array.from(outline,x=>x.number),Array.from({length:25},(_,i)=>i+1));
 assert.equal(new Set(outline.map(x=>x.number)).size,25);
 assert.equal(path.stages().length,5);
 assert.deepEqual(Array.from(path.stages(),x=>x.range),['01–05','06–10','11–15','16–20','21–25']);
 for(const item of outline)assert.ok(item.title.length>=8,'lesson '+item.number+' has a meaningful topic');
});
test('N5 publishes only existing original pilot lessons; never fake 25 published lessons',()=>{
 const h=harness(),path=h.window.NPN5Path,outline=path.outline();
 const released=outline.filter(x=>x.published);
 assert.deepEqual(Array.from(released,x=>x.contentId),['n5-introduction','n5-demonstratives']);
 assert.ok(outline.slice(2).every(x=>x.published===false&&x.contentId===null));
 const page=path.page();
 assert.match(page,/chưa phải 25 bài đã phát hành/);
 assert.match(page,/Các bài mẫu không tự động được tính là hoàn thành/);
 assert.equal((page.match(/class="n5p-stage"/g)||[]).length,5);
 assert.equal((page.match(/class="n5p-lesson(?: has-pilot)?"/g)||[]).length,25);
 assert.match(page,/href="#lesson\/n5-greetings"/);
 assert.match(page,/href="#lesson\/n5-introduction"/);
 assert.match(page,/href="#lesson\/n5-demonstratives"/);
 assert.doesNotMatch(page,/href="#lesson\/n5-lesson-0[4-9]"/);
});
test('Exam prep and skill areas do not imply a complete mock exam or listening audio',()=>{
 const {window}=harness(),page=window.NPN5Path.page();
 for(const value of ['Từ vựng &amp; Kanji','Ngữ pháp','Đọc hiểu','Nghe hiểu','20 phút','40 phút','30 phút'])
  assert.ok(page.includes(value),value);
 assert.match(page,/Chưa phát hành bộ đề JLPT N5 hoàn chỉnh/);
 assert.match(page,/Chưa có bộ luyện kỹ năng riêng/);
 assert.doesNotMatch(page,/href="#exams"/);
 assert.match(page,/href="#review"/);
});
test('N5 course wrapper preserves existing course pages and does not mutate learner progress',()=>{
 const h=harness(),page=h.context.coursePage('N5');
 assert.match(page,/data-n5-path="v145"/);
 assert.match(page,/Học N5, từng bài một/);
 assert.match(h.context.coursePage('foundation'),/data-old-course="foundation"/);
 assert.match(h.context.coursePage('N4'),/data-old-course="N4"/);
 assert.equal(h.state.writes,0);
});
test('N5 hard reload refreshes the new route once after scripts bootstrap',()=>{
 const h=harness('#course/N5');
 assert.equal(h.renders.length,0);
 assert.equal(typeof h.listeners.DOMContentLoaded,'function');
 h.listeners.DOMContentLoaded();
 assert.deepEqual(h.renders,[false]);
});
test('Assets load after learning hub and respect responsive/mobile accessibility',()=>{
 const hub=html.indexOf('src="learning-hub-v25.js?v=145"');
 const path=html.indexOf('src="n5-path-v145.js?v=145"');
 assert.ok(hub>=0&&path>hub,'N5 wrapper must load after existing course routing');
 assert.ok(html.includes('n5-path-v145.css?v=145'));
 assert.match(css,/@media\(max-width:560px\)/);
 assert.match(css,/prefers-reduced-motion/);
 assert.match(source,/event\.target\.closest\?\.\('\[data-n5p-scroll\]'\)/);
});
