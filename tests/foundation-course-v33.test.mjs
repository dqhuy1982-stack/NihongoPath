import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const root=new URL('../source/public/',import.meta.url);
const load=name=>readFileSync(new URL(name,root),'utf8');
function harness(){
 const window={},location={hash:'#course/foundation'},hooks={};
 const map=new Map(),localStorage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};
 const document={addEventListener:(name,fn)=>{hooks[name]=fn},querySelector:()=>({})};
 let profile='demo-a',renders=0;
 runInNewContext(load('foundation-curriculum-v33.js'),{window});
 window.NPHorizonV25={shell:()=>'<header class="v25-header">HORIZON · Learning Hub</header>'};
 const ctx={window,document,location,localStorage,render:()=>{renders++},P:()=>({id:profile}),Audio:class{play(){return Promise.resolve()}}};
 runInNewContext(load('foundation-course-v33.js'),ctx);
 const click=(action,value,side)=>{
   hooks.click({target:{closest:()=>({dataset:{f33:action,value,side}})},preventDefault(){}});
 };
 return {data:window.NPFoundationCurriculum,ui:window.NPFoundationCourse,location,click,setProfile:v=>profile=v,getRenders:()=>renders};
}
test('Foundational syllabus has complete canonical counts and meaningful distinct modules',()=>{
 const {data}=harness();
 assert.equal(data.counts.hiragana,46);
 assert.equal(data.counts.katakana,46);
 assert.equal(data.counts.dakuten,50);
 assert.equal(data.counts.yoon,66);
 assert.equal(data.modules.length,6);
 assert.equal(data.take('hiragana','a').length,5);
 assert.equal(data.take('katakana','w').length,3);
 assert.ok(data.words.some(w=>w.glyph==='コーヒー'&&w.vi==='cà phê'));
 assert.ok(data.smallSamples.some(s=>s.id==='pause'));
});
test('Ambiguous じ/ぢ and ず/づ are excluded only from sound-to-symbol reversals',()=>{
 const {data,ui}=harness();
 const m=data.byId.dakuten,cfg={id:'dakuten',mod:m,group:'d',script:'both',mode:'reverse'};
 const normal=data.take('dakuten','d','both');
 const inverse=ui.choosePool(cfg,'reverse');
 assert.equal(normal.length,10);
 assert.ok(inverse.length>0);
 assert.ok(!inverse.some(x=>['ぢ','づ','ヂ','ヅ'].includes(x.glyph)));
 assert.equal(ui.choosePool({...cfg,mode:'quiz'},'quiz').length,10);
});
test('Exercise questions use transliteration for Kana, Vietnamese meanings only for actual words',()=>{
 const {data,ui}=harness();
 const kana=data.take('hiragana','k')[0];
 const kq=ui.questionFor(kana,'quiz',data.take('hiragana','all'));
 assert.equal(kq.stimulus,kana.glyph);
 assert.equal(kq.choices.find(x=>x.id===kana.id).label,kana.read);
 const word=data.words.find(x=>x.glyph==='コーヒー');
 const vq=ui.questionFor(word,'vocab-vi-ja',data.words);
 assert.equal(vq.stimulus,'cà phê');
 assert.equal(vq.choices.find(x=>x.id===word.id).label,'コーヒー');
 const jq=ui.questionFor(word,'vocab-ja-vi',data.words);
 assert.equal(jq.stimulus,'コーヒー');
 assert.equal(jq.choices.find(x=>x.id===word.id).label,'cà phê');
});
test('Page navigation is consistent and practice categories have working answers',()=>{
 const {ui,location}=harness();
 for(const route of ['course/foundation','learn/foundation/hiragana/a/learn','learn/foundation/katakana/k/flash','learn/foundation/dakuten/g/reverse','learn/foundation/yoon/ky/match','learn/foundation/small/pause/vocab-ja-vi','learn/foundation/mixed/mixed/mix']){
   location.hash='#'+route;const html=ui.page(route);
   assert.ok(html.includes('HORIZON · Learning Hub'),route);
   assert.ok(html.includes('HORIZON · Foundation Studio v33'),route);
   if(route!=='course/foundation')assert.ok(html.includes('v33-module-tabs'));
 }
});
test('Answer immediately shows feedback and records isolated scored attempt, not completion',()=>{
 const h=harness(),r='learn/foundation/hiragana/a/quiz';h.location.hash='#'+r;
 h.ui.page(r);const s=h.ui.session();assert.ok(s.questions.length>=3);
 const q=s.questions[0];h.click('answer',q.correct);
 assert.equal(s.choice,q.correct);
 assert.ok(h.ui.page(r).includes('Chính xác.'));
 assert.equal(h.ui.store().items[q.item.id].correct,1);
 h.setProfile('demo-b');assert.equal(Object.keys(h.ui.store().items).length,0);
 h.setProfile('demo-a');assert.equal(h.ui.store().items[q.item.id].attempts,1);
});
test('Flashcard self-rating does not change test accuracy or scored study progress',()=>{
 const h=harness(),r='learn/foundation/hiragana/a/flash';h.location.hash='#'+r;h.ui.page(r);
 const s=h.ui.session(),card=s.cards[0];h.click('flip');h.click('rate','remember');
 assert.equal(h.ui.store().flash[card.id],'remember');
 assert.equal(Object.keys(h.ui.store().items).length,0);
 assert.equal(s.index,1);
});
test('Matching two columns is accessible with buttons, checks answers, and counts wrong choices',()=>{
 const h=harness(),r='learn/foundation/hiragana/k/match';h.location.hash='#'+r;h.ui.page(r);
 const s=h.ui.session();assert.ok(s.cards.length>=3);
 const first=s.cards[0],wrong=s.cards.find(x=>x.id!==first.id);
 h.click('match',first.id,'left');h.click('match',wrong.id,'right');
 assert.equal(s.mistakes,1);
 h.click('match',first.id,'left');h.click('match',first.id,'right');
 assert.ok(s.matched.includes(first.id));
 assert.equal(h.ui.store().items[first.id].attempts,2);
});
test('Word-builder supports repeated Kana tiles, immediate marking and replay',()=>{
 const h=harness(),route='learn/foundation/small/pause/build';h.location.hash='#'+route;
 const html=h.ui.page(route),s=h.ui.session();assert.ok(html.includes('v33-build-tile'));
 const word=s.cards[0];
 for(const ch of Array.from(word.glyph)){
   const idx=s.tileOrder.findIndex((tile,i)=>tile.glyph===ch&&!s.selected.includes(i));
   assert.ok(idx>=0,'available tile '+ch);
   h.click('tile',String(idx));
 }
 assert.equal(s.answer.correct,true);
 assert.equal(h.ui.store().items[word.id].correct,1);
 h.click('build-next');
 assert.equal(s.index,1);
});

test('The learning UI does not alter the existing lesson engine or global learner records',()=>{
 const html=load('index.html');
 assert.ok(html.includes('foundation-curriculum-v33.js?v=33'));
 assert.ok(html.includes('foundation-course-v33.js?v=33'));
 assert.ok(html.includes('foundation-course-v33.css?v=33'));
 const code=load('foundation-course-v33.js');
 assert.ok(!code.includes('NPLessonStore.save'));
 assert.ok(!code.includes('NPLessonEngine.complete'));
 assert.ok(!code.includes('fetch('));
});
