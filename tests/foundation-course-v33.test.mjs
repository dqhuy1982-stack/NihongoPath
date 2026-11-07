import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const root=new URL('../source/public/',import.meta.url);
const load=name=>readFileSync(new URL(name,root),'utf8');
function harness(){
 const window={},location={hash:'#course/foundation'},hooks={},audioFiles=[];
 const map=new Map(),localStorage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};
 const document={addEventListener:(name,fn)=>{hooks[name]=fn},querySelector:()=>({})};
 let profile='demo-a',renders=0;
 runInNewContext(load('foundation-curriculum-v33.js'),{window});
 window.NPHorizonV25={shell:()=>'<header class="v25-header">HORIZON · Learning Hub</header>'};
 const ctx={window,document,location,localStorage,render:()=>{renders++},P:()=>({id:profile}),Audio:class{constructor(url){audioFiles.push(url)}play(){return Promise.resolve()}pause(){}}};
 runInNewContext(load('foundation-course-v33.js'),ctx);
 const click=(action,value,side)=>{
   const selector=(s)=>{
     if(action==='start'||action==='cancel')return s==='[data-f38]'?{dataset:{f38:action}}:null;
     return s==='[data-f33]'?{dataset:{f33:action,value,side}}:null;
   };
   hooks.click({target:{closest:selector},preventDefault(){}});
 };
 const start=()=>click('start');
 return {data:window.NPFoundationCurriculum,ui:window.NPFoundationCourse,location,click,start,audioFiles,setProfile:v=>profile=v,getRenders:()=>renders};
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
   assert.ok(html.includes('HORIZON · Foundation Studio v38'),route);
   if(route!=='course/foundation')assert.ok(html.includes('v34-stagebar'));
 }
});
test('Answer immediately shows feedback and records isolated scored attempt, not completion',()=>{
 const h=harness(),r='learn/foundation/hiragana/a/quiz';h.location.hash='#'+r;
 h.ui.page(r);h.start();const s=h.ui.session();assert.ok(s.questions.length>=3);
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
 h.start();const s=h.ui.session();assert.ok(s.cards.length>=3);
 const first=s.cards[0],wrong=s.cards.find(x=>x.id!==first.id);
 h.click('match',first.id,'left');h.click('match',wrong.id,'right');
 assert.equal(s.mistakes,1);
 h.click('match',first.id,'left');h.click('match',first.id,'right');
 assert.ok(s.matched.includes(first.id));
 assert.equal(h.ui.store().items[first.id].attempts,2);
});
test('Word-builder supports repeated Kana tiles, immediate marking and replay',()=>{
 const h=harness(),route='learn/foundation/small/pause/build';h.location.hash='#'+route;
 const html=h.ui.page(route),s=h.ui.session();assert.ok(html.includes('v33-build-tile'));h.start();
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
 assert.match(markup,/HORIZON · Foundation Studio v38/);
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


test('Slow correct answers are recorded independently of raw correctness',()=>{
 const h=harness(),route='learn/foundation/hiragana/all/quiz';
 h.location.hash='#'+route;h.ui.page(route);h.start();
 const session=h.ui.session(),q=session.questions[0];
 session.startedAt=Date.now()-7600;
 h.click('answer',q.correct);
 const rec=h.ui.store().items[q.item.id];
 assert.equal(rec.correct,1);
 assert.equal(rec.slowCount,1);
 assert.equal(rec.latestOutcome,'slow');
 assert.ok(rec.lastResponseMs>=7000);
 assert.equal(rec.streak,0);
 assert.match(h.ui.page(route),/Đã lưu vào sổ ôn vì chậm/);
 assert.ok(h.ui.store().history.some(a=>a.id===q.item.id&&a.outcome==='slow'));
 const now=new Date(rec.lastAt).getTime(),due=new Date(rec.nextAt).getTime();
 assert.equal(now,due);
});
test('Incorrect answer is routed to targeted review and timed feedback',()=>{
 const h=harness(),route='learn/foundation/hiragana/all/quiz';
 h.location.hash='#'+route;h.ui.page(route);h.start();
 const s=h.ui.session(),q=s.questions[0];
 const wrong=q.choices.find(x=>x.id!==q.correct);
 assert.ok(wrong);
 h.click('answer',wrong.id);
 const rec=h.ui.store().items[q.item.id];
 assert.equal(rec.latestOutcome,'incorrect');
 assert.equal(rec.errorCount,1);
 assert.ok(h.ui.page(route).includes('Đã lưu câu sai vào sổ ôn'));
 const reviewRoute='learn/foundation/hiragana/all/review';
 h.location.hash='#'+reviewRoute;h.ui.page(reviewRoute);
 assert.ok(h.ui.session().questions.some(x=>x.item.id===q.item.id));
});
test('New review and listen-match modes remain within the four primary navigation steps',()=>{
 const h=harness(),route='learn/foundation/hiragana/all/listen-match';
 h.location.hash='#'+route;
 const html=h.ui.page(route),s=h.ui.session();h.start();
 assert.equal(s.kind,'listen-match');
 assert.ok(s.cards.length>0);
 assert.ok(html.includes('NGHE & GHÉP'));
 assert.ok(html.includes('data-f33="match"'));
 const first=s.cards[0];
 h.click('match',first.id,'left');
 h.click('match',first.id,'right');
 assert.ok(s.matched.includes(first.id));
 assert.equal(h.ui.store().items[first.id].attempts,1);
 assert.ok(h.ui.store().items[first.id].lastResponseMs>=0);
 const kata='learn/foundation/katakana/all/listen-match';
 h.location.hash='#'+kata;h.ui.page(kata);
 assert.ok(h.ui.session().cards.length>0,'Katakana audio matching available');
 assert.ok(h.ui.session().cards.every(x=>x.script==='kata'));
});
test('Clock is per question and feedback freezes elapsed time until next item',()=>{
 const h=harness(),route='learn/foundation/hiragana/all/quiz';
 h.location.hash='#'+route;
 let html=h.ui.page(route);h.start();
 assert.ok(html.includes('data-f37-timer'));
 const s=h.ui.session(),q=s.questions[0];s.startedAt=Date.now()-5300;
 h.click('answer',q.correct);
 const first=s.lastMs;assert.ok(first>=5000);
 html=h.ui.page(route);
 assert.ok(html.includes('Đã trả lời'));
 assert.ok(html.includes('Đúng nhưng cần luyện phản xạ.'));
 h.click('next');
 assert.equal(s.index,1);
 assert.equal(s.choice,null);
 assert.ok(s.startedAt>0);
});


test('Timed practice opens with preflight, no scoring or timer before explicit start',()=>{
 const h=harness(),route='learn/foundation/hiragana/all/quiz';
 h.location.hash='#'+route;
 let html=h.ui.page(route),s=h.ui.session(),q=s.questions[0];
 assert.equal(s.ready,false);
 assert.equal(s.startedAt,null);
 assert.match(html,/role="dialog" aria-modal="true"/);
 assert.match(html,/data-f38="start"/);
 assert.match(html,/đúng nhưng chậm|Đúng nhưng chậm/);
 h.click('answer',q.correct);
 assert.equal(s.choice,null);
 assert.equal(Object.keys(h.ui.store().items).length,0);
 h.start();
 assert.equal(s.ready,true);
 assert.ok(s.startedAt>0);
 html=h.ui.page(route);
 assert.ok(!html.includes('data-f38="start"'));
 h.click('answer',q.correct);
 assert.equal(s.choice,q.correct);
});
test('Mixed listening question plays Japanese audio only after start, with manual playback action',()=>{
 const h=harness(),route='learn/foundation/hiragana/all/mix';
 h.location.hash='#'+route;
 h.ui.page(route);const s=h.ui.session();
 const i=s.questions.findIndex(q=>q.mode==='listen');
 assert.ok(i>=0);
 s.index=i;
 let html=h.ui.page(route);
 assert.match(html,/data-f38="start"/);
 assert.match(html,/Phát âm thanh/);
 h.start();
 html=h.ui.page(route);
 assert.match(html,/data-f33="listen-audio"/);
 const before=s.choice;
 assert.doesNotThrow(()=>h.click('listen-audio'));
 assert.equal(s.choice,before);
 assert.equal(h.ui.store().history.length,0,'listening does not count as an answer');
 assert.ok(h.audioFiles.length>0,'manual playback invokes actual MP3 player');
 assert.ok(h.audioFiles.every(url=>url.startsWith('assets/kana-audio/')));
});
test('Mixed test gives specific preflight guidance and does not start timer while reading',()=>{
 const h=harness(),route='learn/foundation/hiragana/all/mix';
 h.location.hash='#'+route;const html=h.ui.page(route);
 assert.match(html,/Kiểm tra tổng hợp/);
 assert.match(html,/Chữ→Âm, Âm→Chữ, Đúng\/Sai và Nghe→Chữ/);
 assert.match(html,/Thời gian chỉ bắt đầu sau khi nhấn/);
 assert.match(html,/5–9 giây/);
 assert.match(html,/không có thời hạn bắt buộc/);
 assert.equal(h.ui.session().startedAt,null);
});

test('Audio matching and word construction cannot start timer during introduction',()=>{
 const h=harness();
 for(const mode of ['match','listen-match','build']){
   const route='learn/foundation/hiragana/all/'+mode;
   h.location.hash='#'+route;
   const html=h.ui.page(route),session=h.ui.session();
   assert.equal(session.ready,false,mode);
   assert.equal(session.startedAt,null,mode);
   assert.ok(html.includes('data-f38="start"'),mode);
   h.start();
   assert.equal(session.ready,true,mode);
   assert.ok(session.startedAt>0,mode);
 }
});
test('Review and mixed sessions expose guidance, without claiming a fast answer means mastery',()=>{
 const h=harness();
 for(const mode of ['review','mix']){
   const route='learn/foundation/hiragana/all/'+mode;
   h.location.hash='#'+route;
   const html=h.ui.page(route);
   assert.ok(html.includes('tạm đạt'),mode);
   assert.ok(html.includes('cần ôn'),mode);
   assert.ok(html.includes('chưa vững'),mode);
   assert.ok(html.includes('đã nhớ'),mode);
 }
});

test('The learning UI does not alter the existing lesson engine or global learner records',()=>{
 const html=load('index.html');
 assert.ok(html.includes('foundation-curriculum-v33.js?v=33'));
 assert.ok(html.includes('foundation-course-v33.js?v=38'));
 assert.ok(html.includes('foundation-course-v34.css?v=34'));
 assert.ok(html.includes('foundation-course-v35.css?v=35'));
 assert.ok(html.includes('foundation-course-v36.css?v=36'));
 assert.ok(html.includes('foundation-course-v37.css?v=37'));
 assert.ok(html.includes('foundation-course-v38.css?v=38'));
 assert.ok(html.includes('foundation-course-v33.js?v=38'));
 assert.ok(load('foundation-course-v33.js').includes('data-f38="start"'));
 assert.ok(!load('foundation-course-v36.css').includes('max-height:405px'));
 assert.match(load('foundation-course-v36.css'),/max-height:none!important/);
 const code=load('foundation-course-v33.js');
 assert.ok(!code.includes('NPLessonStore.save'));
 assert.ok(!code.includes('NPLessonEngine.complete'));
 assert.ok(!code.includes('fetch('));
});
