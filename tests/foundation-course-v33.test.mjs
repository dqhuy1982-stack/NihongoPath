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
   assert.ok(html.includes('HORIZON · Foundation Studio v36'),route);
   if(route!=='course/foundation')assert.ok(html.includes('v34-stagebar'));
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

test('Compact course presents 46 Hiragana together, with audio and four action tabs',()=>{
 const h=harness(); const r='learn/foundation/hiragana/all/learn';h.location.hash='#'+r;
 const html=h.ui.page(r);
 assert.equal((html.match(/v33-glyph-card/g)||[]).length,46);
 assert.equal((html.match(/data-f33="pronounce"/g)||[]).length,46);
 assert.equal((html.match(/v35-kana-button/g)||[]).length,46);
 assert.ok(html.includes('v35-kana-guide'));
 assert.ok(!html.includes('v33-audio'));
 assert.ok(html.includes('aria-label="Nghe '));
 assert.equal((html.match(/class="v34-stage-tab /g)||[]).length,4);
 assert.ok(!html.includes('v33-row-chip'));
 assert.ok(html.includes('data-f34="module"'));
});
test('Recognition contrast and listening tests provide reliable answers and explanations',()=>{
 const {data,ui}=harness();
 const candidates=data.take('hiragana','all');
 const item=candidates.find(x=>x.glyph==='か');
 const t=ui.questionFor(item,'truefalse',candidates);
 assert.equal(t.choices.length,2);
 assert.ok(['yes','no'].includes(t.correct));
 assert.match(t.note,/か → ka/);
 const l=ui.questionFor(item,'listen',candidates);
 assert.equal(l.stimulus,'');
 assert.equal(l.correct,item.id);
 assert.ok(l.choices.every(x=>x.label.length===1));
 assert.match(l.note,/ka → か/);
});
test('Kana board is one-click audio surface, not nested play buttons',()=>{
 const h=harness(),route='learn/foundation/hiragana/all/learn';h.location.hash='#'+route;
 const markup=h.ui.page(route);
 assert.equal((markup.match(/data-f33="pronounce"/g)||[]).length,46);
 assert.equal((markup.match(/v35-kana-button/g)||[]).length,46);
 assert.ok(!markup.includes('v33-audio'));
 assert.match(markup,/HORIZON · Foundation Studio v36/);
});
test('Foundation exercises expose optional draggable tiles and accessible tap-selection',()=>{
 const h=harness(),route='learn/foundation/hiragana/all/build';h.location.hash='#'+route;
 const html=h.ui.page(route);
 assert.ok(html.includes('draggable="true"'));
 assert.ok(html.includes('data-f35-drop="build"'));
 const match='learn/foundation/hiragana/all/match';
 h.location.hash='#'+match;const matchHtml=h.ui.page(match);
 assert.ok(matchHtml.includes('data-f35-drop="match"'));
});

test('No nested scroll board; every Kana, voiced and yoon form is a tappable pronunciation target',()=>{
 const h=harness();
 for(const [path,count] of [
  ['hiragana/all',46],['katakana/all',46],['dakuten/all',50],['yoon/all',66]
 ]){
  const route='learn/foundation/'+path+'/learn';
  h.location.hash='#'+route;
  const html=h.ui.page(route);
  assert.equal((html.match(/data-f33="pronounce"/g)||[]).length,count,route);
  assert.ok(html.includes('v36-kana-board'));
  assert.ok(!html.includes('tabindex="0"'),route);
  assert.ok(!html.includes('cuộn để xem toàn bộ'),route);
  assert.ok(html.includes('v36-kana-row'),route);
 }
 const route='learn/foundation/small/all/learn';
 h.location.hash='#'+route;
 const small=h.ui.page(route);
 assert.ok(small.includes('data-kind="small"'));
 assert.ok(small.includes('v36-example-button'));
});
test('Audio fallback handles unavailable Japanese voices without fake success',()=>{
 const h=harness();const route='learn/foundation/yoon/all/learn';
 h.location.hash='#'+route;h.ui.page(route);
 assert.doesNotThrow(()=>h.click('pronounce','きゃ'));
 const listen=h.ui.questionFor(h.data.take('yoon','ky')[0],'listen',h.data.take('yoon','all'));
 assert.equal(listen.correct,listen.item.id);
});

test('The learning UI does not alter the existing lesson engine or global learner records',()=>{
 const html=load('index.html');
 assert.ok(html.includes('foundation-curriculum-v33.js?v=33'));
 assert.ok(html.includes('foundation-course-v33.js?v=36'));
 assert.ok(html.includes('foundation-course-v34.css?v=34'));
 assert.ok(html.includes('foundation-course-v35.css?v=35'));
 assert.ok(html.includes('foundation-course-v36.css?v=36'));
 assert.ok(!load('foundation-course-v36.css').includes('max-height:405px'));
 assert.match(load('foundation-course-v36.css'),/max-height:none!important/);
 const code=load('foundation-course-v33.js');
 assert.ok(!code.includes('NPLessonStore.save'));
 assert.ok(!code.includes('NPLessonEngine.complete'));
 assert.ok(!code.includes('fetch('));
});
