import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const root=new URL('../source/public/',import.meta.url);
const load=name=>readFileSync(new URL(name,root),'utf8');
function harness(options={}){
 const window={},location={hash:'#course/foundation'},hooks={},audioFiles=[];
 const map=new Map(),localStorage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};
 const document={addEventListener:(name,fn)=>{hooks[name]=fn},querySelector:selector=>options.preflightMissing&&selector.includes('v38-dialog')?null:({})};
 let profile='demo-a',renders=0;
 runInNewContext(load('foundation-curriculum-v33.js'),{window});
 window.NPHorizonV25={shell:()=>'<header class="v25-header">HORIZON · Learning Hub</header>'};
 const ctx={window,document,location,localStorage,render:()=>{renders++},P:()=>({id:profile}),Audio:class{constructor(url){audioFiles.push(url)}play(){return Promise.resolve()}pause(){}}};
 runInNewContext(load('foundation-course-v33.js'),ctx);
 const click=(action,value,side)=>{
   const selector=(s)=>{
     if(action==='start'||action==='cancel')return s==='[data-f38]'?{dataset:{f38:action}}:null;
     if(action==='practice-tab')return s==='[data-f130="tab"]'?{dataset:{f130:'tab',value}}:null;
     return s==='[data-f33]'?{dataset:{f33:action,value,side}}:null;
   };
   hooks.click({target:{closest:selector},preventDefault(){}});
 };
 const start=()=>click('start');
  const changeCount=(preset,value)=>{
    const eventFor=(data)=>hooks.change({target:{closest:selector=>selector.includes('[data-f140-count]')?{dataset:data}:null}});
    eventFor({f140Count:preset});
    if(preset==='custom'&&value!==undefined){
      hooks.change({target:{closest:selector=>selector.includes('[data-f140-count]')?{dataset:{f140Custom:''},value:String(value)}:null}});
    }
  };
 return {data:window.NPFoundationCurriculum,ui:window.NPFoundationCourse,window,location,click,start,changeCount,audioFiles,setAudioPref:on=>map.set('horizon.foundation.feedbackSounds.v1',on?'on':'off'),setLegacyAudioPref:on=>map.set('horizon.foundation.autoAnswerAudio',on?'on':'off'),setProfile:v=>profile=v,getRenders:()=>renders};
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
   assert.ok(html.includes('v112-foundation'),route);
   assert.ok(html.includes('Luyện tập mẫu · Tiến độ lưu trên thiết bị'),route);
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
 assert.equal((html.match(/class="v34-stage-tab /g)||[]).length,2);
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
 assert.match(markup,/Luyện tập mẫu · Tiến độ lưu trên thiết bị/);
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
 const h=harness(),route='learn/foundation/hiragana/all/mix';
 h.location.hash='#'+route;h.ui.page(route);h.start();
 const session=h.ui.session(),q=session.questions[0];
 session.startedAt=Date.now()-12000;
 h.click('answer',q.correct);
 const rec=h.ui.store().items[q.item.id];
 assert.equal(rec.correct,1);
 assert.equal(rec.slowCount,1);
 assert.equal(rec.latestOutcome,'slow');
 assert.ok(rec.lastResponseMs>=11000);
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
 assert.ok(h.ui.page(route).includes('Đã thêm chữ cần ôn'));
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
 assert.equal(h.ui.store().items[first.id].lastResponseMs,null);
 const kata='learn/foundation/katakana/all/listen-match';
 h.location.hash='#'+kata;h.ui.page(kata);
 assert.ok(h.ui.session().cards.length>0,'Katakana audio matching available');
 assert.ok(h.ui.session().cards.every(x=>x.script==='kata'));
});
test('Clock is per question and feedback freezes elapsed time until next item',()=>{
 const h=harness(),route='learn/foundation/hiragana/all/mix';
 h.location.hash='#'+route;
 let html=h.ui.page(route);h.start();
 assert.ok(html.includes('data-f38="start"'));
 const s=h.ui.session(),q=s.questions[0];s.startedAt=Date.now()-12500;
 h.click('answer',q.correct);
 const first=s.lastMs;assert.ok(first>=12000);
 html=h.ui.page(route);
 assert.ok(html.includes('Đã trả lời'));
 assert.ok(html.includes('Đúng nhưng cần luyện phản xạ.'));
 h.click('next');
 assert.equal(s.index,1);
 assert.equal(s.choice,null);
 assert.ok(s.startedAt>0);
});


test('Timed practice opens with preflight, no scoring or timer before explicit start',()=>{
 const h=harness(),route='learn/foundation/hiragana/all/mix';
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

test('Practice and word building are ready immediately and never display preflight or timer',()=>{
 const h=harness();
 for(const mode of ['quiz','match','listen-match','build','vocab-ja-vi']){
   const route='learn/foundation/hiragana/all/'+mode;
   h.location.hash='#'+route;
   const html=h.ui.page(route),session=h.ui.session();
   assert.equal(session.ready,true,mode);
   assert.equal(session.startedAt,null,mode);
   assert.ok(!html.includes('data-f38="start"'),mode);
   assert.ok(!html.includes('v38-overlay'),mode);
   assert.ok(!html.includes('data-f37-timer'),mode);
 }
});
test('Only final examination shows mastery guidance; untimed review opens immediately',()=>{
 const h=harness();
 const review='learn/foundation/hiragana/all/review';h.location.hash='#'+review;
 const practice=h.ui.page(review);
 assert.ok(!practice.includes('data-f38="start"'));
 assert.ok(practice.includes('v39-book-layout'));
 const mixed='learn/foundation/hiragana/all/mix';h.location.hash='#'+mixed;
 const html=h.ui.page(mixed);
 for(const phrase of ['tạm đạt','cần ôn','chưa vững','đã nhớ'])assert.ok(html.includes(phrase),phrase);
});
test('Four learning destinations keep each matching activity only in Practice',()=>{
 const h=harness();
 for(const mode of ['quiz','reverse','match','listen-match','build']){
  const route='learn/foundation/hiragana/all/'+mode;
  h.location.hash='#'+route;
  const html=h.ui.page(route);
  assert.match(html,/v39-book-layout/);
  assert.match(html,/v39-book-nav/);
  assert.ok(!html.includes('Dạng luyện <select'));
  assert.ok(!html.includes('v38-overlay'));
  assert.ok(!html.includes('data-value="game"'));
  assert.ok(!html.includes('data-value="game-build"'));
  assert.ok(!html.includes('data-value="game-listen"'));
  assert.equal((html.match(/class="v34-stage-tab /g)||[]).length,2);
 }
 for(const [legacy,target] of [['game','Ghép Kana với Romaji'],['game-build','Xếp Kana'],['game-listen','Nghe và ghép đúng chữ']]){
  const route='learn/foundation/hiragana/all/'+legacy;h.location.hash='#'+route;
  assert.match(h.ui.page(route),new RegExp(target));
 }
});
test('Only formal mixed exam opens guidance and clock',()=>{
 const h=harness(),route='learn/foundation/hiragana/all/mix';
 h.location.hash='#'+route;
 const html=h.ui.page(route),s=h.ui.session();
 assert.equal(s.ready,false);
 assert.equal(s.startedAt,null);
 assert.match(html,/v38-overlay/);
 assert.match(html,/data-f38="start"/);
 h.start();
 assert.equal(s.ready,true);
 assert.ok(s.startedAt>0);
 assert.match(h.ui.page(route),/data-f37-timer/);
});
test('v1.41 hard reload defers initial learning render until all scripts are installed',()=>{
 const hub=load('learning-hub-v25.js');
 const legacy=load('learning-hub-v23.js');
 assert.match(hub,/function refreshAfterLearningBootstrap\(/);
 assert.match(hub,/document.addEventListener\('DOMContentLoaded',refreshAfterLearningBootstrap/);
 assert.match(hub,/destination.startsWith\('learn\/'\)/);
 assert.match(legacy,/if\(!window.NPHorizonV25\)render\(false\)/);
 assert.doesNotMatch(legacy,/queueMicrotask\(function\(\)\{render\(false\)\}\)/);
 const code=load('foundation-course-v33.js');
 assert.ok(code.includes("history.replaceState(null,'','#'+next)"));
});

test('Global UI footer shows unobtrusive v1.01 beside HORIZON tagline',()=>{
 const app=load('app.js'),hub=load('learning-hub-v25.js');
 assert.ok(app.includes('Học theo cách của bạn'));
 assert.ok(app.includes('horizon-brand-version'));
 assert.ok(app.includes('v1.41'));
 assert.ok(!app.includes('class="horizon-ui-version"'));
 assert.ok(load('index.html').includes('horizon-brand-version.css?v=106'));
 assert.ok(!hub.includes('HORIZON · Learning Hub v33 · Recorded progress'));
});
test('Book index uses a warm connected selected tab and responsive separation',()=>{
 const css=load('foundation-course-v40.css');
 assert.match(css,/\.v39-book-tab\.active::after/);
 assert.match(css,/background:var\(--v33-paper\)/);
 assert.match(css,/\.v39-book-layout>.v33-pane/);
 assert.match(css,/@media\(max-width:680px\)/);
 assert.match(css,/\.v39-book-tab\.active::after\{display:none\}/);
});
test('v1.01 has both match columns and persistent line overlay for user selected pairs',()=>{
 const h=harness(),route='learn/foundation/hiragana/all/match';
 h.location.hash='#'+route;const html=h.ui.page(route);
 assert.match(html,/v105-match-board/);
 assert.match(html,/v101-match-lines/);
 assert.match(html,/>KANA</);
 assert.match(html,/>ROMAJI</);
 assert.equal((html.match(/data-side="left"/g)||[]).length,6);
 assert.equal((html.match(/data-side="right"/g)||[]).length,6);
 assert.ok(h.ui.session().cards.every(x=>x.script==='hira'));
});
test('v1.01 contextual missing-Kana questions use genuine word meaning',()=>{
 const h=harness(),route='learn/foundation/hiragana/all/missing';
 h.location.hash='#'+route;
 const html=h.ui.page(route),s=h.ui.session(),q=s.questions[0];
 assert.match(html,/Điền Kana còn thiếu/);
 assert.equal(q.mode,'missing');
 assert.ok(q.stimulus.includes('□'));
 assert.equal(q.choices.filter(x=>x.id===q.correct).length,1);
 assert.ok(q.item.vi.length>0);
});
test('v1.01 offers three hints and records assisted correct answers for review',()=>{
 const h=harness(),route='learn/foundation/hiragana/all/quiz';
 h.location.hash='#'+route;h.ui.page(route);
 const s=h.ui.session(),q=s.questions[0];
 for(let i=1;i<=3;i++){h.click('hint');assert.equal(s.hintsUsed,i)}
 h.click('answer',q.correct);
 const item=h.ui.store().items[q.item.id];
 assert.equal(item.correct,1);
 assert.equal(item.lastHintsUsed,3);
 assert.equal(item.streak,0);
 assert.equal(item.assistedCount,1);
 assert.equal(h.ui.store().history.at(-1).hintsUsed,3);
 assert.match(h.ui.page(route),/Có dùng 3 gợi ý/);
});
test('v1.01 includes answer audio and precise connected-book CSS',()=>{
 const app=load('app.js'),html=load('index.html'),css=load('foundation-course-v101.css');
 assert.ok(app.includes('v1.41'));
 assert.ok(html.includes('foundation-course-v101.css?v=101'));
 assert.ok(html.includes('foundation-course-v102.css?v=102'));
 assert.ok(html.includes('foundation-course-v103.css?v=103'));
 assert.ok(html.includes('foundation-course-v104.css?v=104'));
 assert.ok(html.includes('foundation-course-v105.css?v=105'));
 assert.ok(html.includes('foundation-course-v106.css?v=106'));
 assert.ok(html.includes('foundation-curriculum-v33.js?v=124'));
 assert.ok(html.includes('foundation-course-v33.js?v=141'));
 assert.ok(html.includes('foundation-course-v107.css?v=141'));
 assert.ok(load('app.js').includes('v1.41</small>'));
 assert.ok(css.includes('v101-match-grid'));
 assert.ok(css.includes('[data-connected="yes"]'));
});
test('v1.03 workbook avoids nested scroll containers and renders both matching columns',()=>{
 const h=harness(),route='learn/foundation/hiragana/all/match';
 h.location.hash='#'+route;const html=h.ui.page(route),css=load('foundation-course-v103.css');
 assert.match(html,/v105-match-board/);
 assert.match(html,/>KANA</);
 assert.match(html,/>ROMAJI</);
 assert.equal((html.match(/data-side="right"/g)||[]).length,6);
 assert.equal((html.match(/data-side="left"/g)||[]).length,6);
 assert.doesNotMatch(html,/v102-connector-lane/);
 assert.match(css,/grid-template-columns:minmax\(0,1fr\) minmax\(0,1fr\)!important/);
 assert.match(load('foundation-course-v105.css'),/\.v105-match-row/);
 assert.match(css,/overflow:visible!important/);
 assert.doesNotMatch(html,/v106-menu-group|v126-exercise-picker/);
});
test('v1.03 shows contextual explanation after answer, not before',()=>{
 const h=harness(),route='learn/foundation/hiragana/all/quiz';
 h.location.hash='#'+route;
 const original=h.ui.page(route);
 assert.ok(!original.includes('Hiểu thêm & nhớ lâu'));
 const q=h.ui.session().questions[0];
 h.click('answer',q.correct);
 const after=h.ui.page(route);
 assert.match(after,/Hiểu thêm & nhớ lâu/);
 assert.match(after,/v103-insight-main/);
 assert.match(after,/data-f33="insight-audio"/);
 assert.ok(after.includes(q.item.glyph));
});
test('v1.03 matching feedback uses the most recently correct pair for learning context',()=>{
 const h=harness(),route='learn/foundation/hiragana/all/match';
 h.location.hash='#'+route;h.ui.page(route);
 const s=h.ui.session(),x=s.cards[0];h.click('match',x.id,'left');h.click('match',x.id,'right');
 assert.equal(s.lastMatched,x.id);
 assert.match(h.ui.page(route),/Hiểu thêm & nhớ lâu/);
});
test('v1.04 answer buttons show exact success/failure markers and sticky next action',()=>{
 const h=harness(),route='learn/foundation/hiragana/all/truefalse';
 h.location.hash='#'+route;h.ui.page(route);const s=h.ui.session(),q=s.questions[0];
 let html=h.ui.page(route);
 assert.match(html,/v104-truefalse/);
 assert.match(html,/v104-choice-symbol/);
 assert.ok(!html.includes('v104-sticky-next'));
 const wrong=q.choices.find(x=>x.id!==q.correct);
 h.click('answer',wrong.id);
 html=h.ui.page(route);
 assert.match(html,/v104-answer-result is-correct/);
 assert.match(html,/v104-answer-result is-wrong/);
 assert.match(html,/v104-sticky-next/);
 assert.match(html,/data-f33="next"/);
});
test('v1.04 matches use two flex columns plus out-of-flow SVG',()=>{
 const h=harness(),route='learn/foundation/hiragana/all/match';h.location.hash='#'+route;
 const html=h.ui.page(route),css=load('foundation-course-v104.css');
 assert.equal((html.match(/class="v105-match-row"/g)||[]).length,6);
 assert.equal((html.match(/data-side="right"/g)||[]).length,6);
 assert.match(html,/ROMAJI/);
 assert.match(css,/display:flex!important/);
 assert.match(css,/flex:1 1 0!important/);
 assert.match(css,/position:absolute!important/);
 assert.ok(!html.includes('v101-match-grid'));
});

test('v1.05 prints six actual Romaji strings on the right, not empty tiles',()=>{
 const h=harness(),route='learn/foundation/hiragana/all/match';
 h.location.hash='#'+route;
 const html=h.ui.page(route),s=h.ui.session();
 assert.match(html,/v105-match-board/);
 assert.equal((html.match(/class="v105-match-row"/g)||[]).length,6);
 assert.equal((html.match(/class="v105-romaji"/g)||[]).length,6);
 assert.equal((html.match(/data-side="right"/g)||[]).length,6);
 for(const item of s.right)assert.ok(html.includes('>'+item.read+'</span>'),'visible Romaji '+item.read);
 assert.ok(s.right.every(x=>x.read&&x.read.trim().length>0));
});
test('v1.05 supports Hiragana, Katakana and mixed scripts without ambiguous labels',()=>{
 const h=harness();
 const routes=[
  ['learn/foundation/hiragana/all/match','hira'],
  ['learn/foundation/katakana/all/match','kata'],
  ['learn/foundation/mixed/mixed/match','mixed']
 ];
 for(const [route,script] of routes){
  h.location.hash='#'+route;
  const html=h.ui.page(route),s=h.ui.session();
  assert.equal(s.cards.length,6);
  assert.equal(new Set(s.cards.map(x=>x.id)).size,6);
  assert.equal(new Set(s.cards.map(x=>x.read+'-'+x.script)).size,6);
  assert.ok(html.includes('class="v105-romaji"'));
  if(script!=='mixed')assert.ok(s.cards.every(x=>x.script===script));
  else{
   assert.equal(s.cards.filter(x=>x.script==='hira').length,3);
   assert.equal(s.cards.filter(x=>x.script==='kata').length,3);
   assert.match(html,/data-f34="script"/);
  }
 }
});
test('v1.05 wrong pairs draw a temporary red connector and correct pairs a green one',()=>{
 const h=harness(),route='learn/foundation/hiragana/all/match';
 h.location.hash='#'+route;h.ui.page(route);
 const s=h.ui.session(),a=s.cards[0],b=s.cards[1];
 h.click('match',a.id,'left');h.click('match',b.id,'right');
 assert.equal(s.mistakes,1);
 assert.equal(s.wrongPair.left,a.id);
 assert.equal(s.wrongPair.right,b.id);
 assert.match(h.ui.page(route),/Đường đỏ/);
 assert.match(load('foundation-course-v105.css'),/v105-match-wrong/);
 h.click('match',a.id,'left');h.click('match',a.id,'right');
 assert.ok(s.matched.includes(a.id));
 assert.match(h.ui.page(route),/v105-check/);
});
test('v1.05 auto answer audio can be turned off without disabling manual listening',()=>{
 const h=harness(),route='learn/foundation/hiragana/all/quiz';
 h.location.hash='#'+route;h.ui.page(route);
 assert.match(h.ui.page(route),/Âm báo đúng sai: Bật/);
 h.click('toggle-audio');
 assert.match(h.ui.page(route),/Âm báo đúng sai: Tắt/);
 const q=h.ui.session().questions[0];
 h.click('answer',q.correct);
 assert.equal(h.audioFiles.length,0,'no grading sound when disabled');
 h.click('feedback-audio');
 assert.ok(h.audioFiles.length>0,'manual answer playback is still available');
});
test('v1.41 central Practice replaces deeply nested exercise picker',()=>{
 const h=harness(),base='learn/foundation/hiragana/unit-1';
 h.location.hash='#'+base+'/practice';
 const course=h.ui.page(base+'/practice');
 assert.match(course,/Luyện ngay/);
 assert.match(course,/Kiểm tra bài này/);
 assert.match(course,/href="#learn\/training\/foundation\/hiragana\/unit-1\/hira"/);
 assert.doesNotMatch(course,/data-f130="tab"|v129-advanced|v126-exercise-picker/);
 h.location.hash='#'+base+'/quiz';
 const exercise=h.ui.page(base+'/quiz');
 assert.match(exercise,/v129-task-header/);
 assert.doesNotMatch(exercise,/Đổi dạng bài|v129-advanced|v126-exercise-picker/);
});
test('v1.06 tap-to-return selected Kana restores exact tile, including duplicate glyphs',()=>{
 const h=harness(),route='learn/foundation/small/pause/build';
 h.location.hash='#'+route;h.ui.page(route);
 const s=h.ui.session();
 assert.ok(s.tileOrder.length>=2);
 h.click('tile','0');
 assert.deepEqual(Array.from(s.selected),[0]);
 assert.match(h.ui.page(route),/data-f33="remove-tile"/);
 h.click('remove-tile','0');
 assert.deepEqual(Array.from(s.selected),[]);
 h.click('tile','0');
 assert.deepEqual(Array.from(s.selected),[0]);
});
test('v1.06 incorrect built word can be retried without resetting the whole lesson',()=>{
 const h=harness(),route='learn/foundation/small/pause/build';h.location.hash='#'+route;h.ui.page(route);
 const s=h.ui.session(),word=Array.from(s.cards[0].glyph);
 // Arrange chosen tile IDs to produce a wrong order.
 const candidates=s.tileOrder.map((tile,i)=>({glyph:tile.glyph,i}));
 const order=candidates.map(x=>x.i);
 const built=order.map(i=>s.tileOrder[i].glyph).join('');
 if(built===word.join(''))order.reverse();
 if(order.map(i=>s.tileOrder[i].glyph).join('')===word.join(''))return;
 for(const i of order)h.click('tile',String(i));
 assert.equal(s.answer.correct,false);
 assert.match(h.ui.page(route),/data-f33="retry-build"/);
 h.click('retry-build');
 assert.equal(s.answer,null);
 assert.equal(s.selected.length,0);
 assert.equal(s.index,0);
});


test('v1.07 matching completes only once and distinguishes first-try pairs from completion',()=>{
 const h=harness(),r='learn/foundation/hiragana/all/match';h.location.hash='#'+r;h.ui.page(r);
 const s=h.ui.session(),a=s.cards[0],b=s.cards[1];
 h.click('match',a.id,'left');h.click('match',b.id,'right');
 assert.equal(s.round.attempts.length,1);
 assert.equal(s.round.wrong,1);
 for(const item of s.cards){h.click('match',item.id,'left');h.click('match',item.id,'right');}
 assert.equal(s.round.finalized,true);
 assert.equal(s.round.summaryOpen,true);
 const summary=s.round.summary;
 assert.equal(summary.completedPairs,6);
 assert.equal(summary.wrongAttempts,1);
 assert.equal(summary.firstTryPairs,4);
 assert.equal(summary.firstTryAccuracy,67);
 assert.equal(summary.attemptAccuracy,86);
 assert.equal(summary.attempts.length,7);
 assert.equal(summary.reviewIds.length,2);
 assert.ok(h.ui.store().matchReview[a.id]);
 assert.ok(h.ui.store().matchReview[b.id]);
 assert.equal(h.ui.store().items[b.id]?.errorCount??0,0,'partner receives review flag without being scored as an incorrect independent response');
 assert.match(h.ui.page(r),/TỔNG KẾT LƯỢT LUYỆN/);
 assert.match(h.ui.page(r),/Ôn lại cặp cần nhớ/);
 h.click('summary-close');
 assert.equal(s.round.summaryOpen,false);
 assert.match(h.ui.page(r),/Xem kết quả/);
 h.click('summary-open');
 assert.equal(s.round.summaryOpen,true);
 assert.equal(s.round.summary.roundId,summary.roundId);
});
test('v1.07 review only involves pairs that were touched in a wrong match',()=>{
 const h=harness(),r='learn/foundation/hiragana/all/match';h.location.hash='#'+r;h.ui.page(r);
 const s=h.ui.session(),a=s.cards[0],b=s.cards[1];
 h.click('match',a.id,'left');h.click('match',b.id,'right');
 for(const item of s.cards){h.click('match',item.id,'left');h.click('match',item.id,'right');}
 h.click('summary-review');
 const current=h.ui.session();
 assert.notEqual(current,s);
 assert.deepEqual([...current.cards.map(x=>x.id)].sort(),[a.id,b.id].sort());
 assert.equal(current.round.finalized,false);
 assert.equal(current.round.attempts.length,0);
 assert.equal(current.round.summaryOpen,false);
 for(const item of current.cards){h.click('match',item.id,'left');h.click('match',item.id,'right');}
 assert.ok(!h.ui.store().matchReview[a.id]);
 assert.ok(!h.ui.store().matchReview[b.id]);
});
test('v1.07 clean round has no fake weakness and offers a new round',()=>{
 const h=harness(),r='learn/foundation/hiragana/all/match';h.location.hash='#'+r;h.ui.page(r);
 const s=h.ui.session();
 for(const item of s.cards){h.click('match',item.id,'left');h.click('match',item.id,'right');}
 const summary=s.round.summary;
 assert.equal(summary.firstTryPairs,6);
 assert.equal(summary.wrongAttempts,0);
 assert.equal(summary.reviewIds.length,0);
 assert.match(h.ui.page(r),/Một lượt luyện thật tốt/);
 assert.doesNotMatch(h.ui.page(r),/data-f33="summary-review"/);
 h.click('summary-new');
 const next=h.ui.session();
 assert.notEqual(next,s);
 assert.equal(next.round.finalized,false);
 assert.equal(next.matched.length,0);
});
test('v1.07 listening counts manual prompt replays not automatic answer sound',()=>{
 const h=harness(),r='learn/foundation/hiragana/all/listen-match';h.location.hash='#'+r;h.ui.page(r);
 const s=h.ui.session(),first=s.cards[0];
 h.click('match',first.id,'left');
 assert.equal(s.round.pairs[first.id].audioReplays,0);
 h.click('match',first.id,'left');
 assert.equal(s.round.pairs[first.id].audioReplays,1);
 for(const item of s.cards){h.click('match',item.id,'left');h.click('match',item.id,'right');}
 assert.equal(s.round.summary.audioReplays,2,'three manual prompts on the same pair count as two replays');
 assert.match(h.ui.page(r),/Số lần nghe lại/);
});
test('v1.07 duration metrics are derived from attempts and never guessed',()=>{
 const h=harness(),r='learn/foundation/hiragana/all/match';h.location.hash='#'+r;h.ui.page(r);
 const s=h.ui.session();
 for(const item of s.cards){h.click('match',item.id,'left');h.click('match',item.id,'right');}
 assert.equal(s.round.summary.pairResults.length,6);
 assert.ok(s.round.summary.pairResults.every(p=>p.pairElapsedMs===null||p.pairElapsedMs>=0));
 assert.ok(s.round.summary.totalElapsedMs>=0);
 const ui=h.ui.page(r);
 assert.match(ui,/Xem chi tiết từng cặp/);
 assert.match(ui,/Tổng thời gian/);
 assert.match(load('foundation-course-v107.css'),/prefers-reduced-motion/);
});

test('The learning UI does not alter the existing lesson engine or global learner records',()=>{
 const html=load('index.html');
 assert.ok(html.includes('foundation-curriculum-v33.js?v=124'));
 assert.ok(html.includes('foundation-course-v33.js?v=141'));
 assert.ok(html.includes('foundation-course-v34.css?v=34'));
 assert.ok(html.includes('foundation-course-v35.css?v=35'));
 assert.ok(html.includes('foundation-course-v36.css?v=36'));
 assert.ok(html.includes('foundation-course-v37.css?v=37'));
 assert.ok(html.includes('foundation-course-v38.css?v=38'));
 assert.ok(html.includes('foundation-course-v39.css?v=39'));
 assert.ok(html.includes('foundation-course-v40.css?v=100'));
 assert.ok(html.includes('foundation-course-v101.css?v=101'));
 assert.ok(html.includes('app.js?v=141'));
 assert.ok(html.includes('learning-hub-v25.js?v=141'));
 assert.ok(html.includes('foundation-course-v33.js?v=141'));
 assert.ok(html.includes('foundation-course-v33.js?v=141'));
 assert.ok(load('foundation-course-v33.js').includes('data-f38="start"'));
 assert.ok(!load('foundation-course-v36.css').includes('max-height:405px'));
 assert.match(load('foundation-course-v36.css'),/max-height:none!important/);
 const code=load('foundation-course-v33.js');
 assert.ok(!code.includes('NPLessonStore.save'));
 assert.ok(!code.includes('NPLessonEngine.complete'));
 assert.ok(!code.includes('fetch('));
});

test('Completion polish retains visible post-round controls and accessible feedback',()=>{
 const code=load('foundation-course-v33.js'),styles=load('foundation-course-v107.css');
 assert.match(code,/v108-dock/);
 assert.match(code,/v109-medal-art/);
 assert.match(code,/gradingSound\(true\)/);
 assert.match(code,/gradingSound\(false\)/);
 assert.match(styles,/v108-shake/);
 assert.match(styles,/prefers-reduced-motion:reduce/);
});

test('Backdrop click dismisses only outside the result dialog and preserves summary',()=>{
 const h=harness(),route='learn/foundation/hiragana/all/match';
 h.location.hash='#'+route;h.ui.page(route);
 const session=h.ui.session();
 for(const item of session.cards){h.click('match',item.id,'left');h.click('match',item.id,'right');}
 const id=session.round.summary.roundId;
 // The real delegated handler uses closest() to distinguish dialog content and backdrop.
 // Verify the exact dispatch guard is still present; summary must stay persistent.
 const code=load('foundation-course-v33.js');
 assert.ok(code.includes("if(backdrop&&!event.target.closest?.('.v109-dialog'))"));
 assert.ok(code.includes("overlay.classList.add('v109-closing')"));
 assert.equal(session.round.summaryOpen,true);
 h.click('summary-close');
 assert.equal(session.round.summaryOpen,false);
 assert.equal(session.round.summary.roundId,id);
 h.click('summary-open');
 assert.equal(session.round.summary.roundId,id);
});

test('Completion dialog has exactly two result-aware actions, no footer Close, and animated dismissal',()=>{
 const h=harness(),r='learn/foundation/hiragana/all/match';h.location.hash='#'+r;h.ui.page(r);
 const session=h.ui.session();
 for(const item of session.cards){h.click('match',item.id,'left');h.click('match',item.id,'right');}
 const html=h.ui.page(r);
 assert.match(html,/v109-dialog/);
 assert.match(html,/v109-medal-art/);
 assert.match(html,/v109-details/);
 assert.match(html,/data-f33="summary-new"/);
 assert.match(html,/data-f33="summary-next"/);
 assert.doesNotMatch(html,/data-f33="summary-review"/);
 assert.doesNotMatch(html,/<button[^>]+data-f33="summary-close">Đóng<\/button>/);
 assert.match(load('foundation-course-v107.css'),/v109-dialog-out/);
 assert.ok(load('foundation-course-v33.js').includes("!event.target.closest?.('.v109-dialog')"));
 assert.ok(load('foundation-course-v33.js').includes('closeRoundSummary()'));
 assert.doesNotMatch(html,/Nhận xét sau ván/);
 assert.match(html,/Nhận xét lượt luyện/);
 assert.match(html,/v110-feedback-card/);
 assert.match(html,/v110-next-card/);
 assert.ok(load('foundation-course-v107.css').includes('v110-feedback-card.is-positive'));
 h.click('summary-close');
 assert.equal(session.round.summaryOpen,false);
});

test('v1.25 matching result controls remain inside the same exercise pane as Next Question',()=>{
 const code=load('foundation-course-v33.js'),css=load('foundation-course-v107.css');
 assert.ok(code.includes('function syncFinishDock(){removeFinishDock();}'));
 assert.ok(!code.includes('document.body.appendChild(dock)'));
 assert.ok(code.includes('v108-dock v104-sticky-next v118-match-actions'));
 assert.ok(css.includes('.v108-dock.v118-match-actions'));
 assert.ok(css.includes('position:sticky!important'));
 assert.ok(css.includes('width:100%!important'));
 assert.ok(css.includes('transform:none!important'));
 const h=harness(),route='learn/foundation/hiragana/all/match';
 h.location.hash='#'+route;h.ui.page(route);
 const session=h.ui.session();
 for(const item of session.cards){h.click('match',item.id,'left');h.click('match',item.id,'right');}
 h.click('summary-close');
 const html=h.ui.page(route);
 assert.match(html,/v118-match-actions/);
 assert.match(html,/data-f33="summary-open"/);
 assert.match(html,/data-f33="restart"/);
 assert.match(html,/v118-match-buttons/);
});

test('v1.25 both matching modes use the same locally aligned finish actions',()=>{
 const h=harness();
 for(const mode of ['match','listen-match']){
  const route='learn/foundation/hiragana/all/'+mode;
  h.location.hash='#'+route;h.ui.page(route);
  const session=h.ui.session();
  for(const item of session.cards){h.click('match',item.id,'left');h.click('match',item.id,'right');}
  h.click('summary-close');
  const html=h.ui.page(route);
  assert.equal((html.match(/class="v108-dock v104-sticky-next v118-match-actions"/g)||[]).length,1);
 }
});
test('v1.25 learners navigate adjacent chapters without a dropdown menu',()=>{
 const h=harness();
 const route='learn/foundation/hiragana/all/learn';
 h.location.hash='#'+route;
 const html=h.ui.page(route);
 assert.match(html,/v114-orientation/);
 assert.match(html,/v114-chapter-switch/);
 assert.match(html,/v114-current-chapter/);
 assert.match(html,/CHẶNG 01/);
 assert.match(html,/Hiragana/);
 assert.match(html,/v115-chapter-rail/);
 assert.match(html,/data-f34="module"/);
 assert.doesNotMatch(html,/<select id="v34-module"/);
 assert.doesNotMatch(html,/v113-module-select/);
 assert.doesNotMatch(html,/Không gian học tập/);
 assert.doesNotMatch(html,/v25-breadcrumb/);
 assert.equal((html.match(/class="v34-stage-tab /g)||[]).length,2);
 assert.match(html,/aria-label="Đang ở chặng đầu tiên" disabled/);
 assert.ok(load('foundation-course-v33.js').includes('[data-f34="module"]'));
 const index=h.ui.page('course/foundation');
 assert.match(index,/Nền tảng/);
 const css=load('foundation-course-v107.css');
 assert.ok(css.includes('.v114-orientation'));
 assert.ok(css.includes('@media(max-width:680px)'));
});

test('v1.25 breadcrumbs show actual route ancestry and link to parent destinations',()=>{
 const h=harness(),moduleRoute='learn/foundation/hiragana/all/learn';
 h.location.hash='#'+moduleRoute;const html=h.ui.page(moduleRoute);
 assert.match(html,/class="v115-breadcrumb"/);
 assert.match(html,/aria-label="Vị trí trong lộ trình"/);
 assert.match(html,/<a href="#learn\/overview">Học<\/a>/);
 assert.match(html,/<a href="#learn\/catalog">Khóa học<\/a>/);
 assert.match(html,/<a href="#course\/foundation">Nền tảng<\/a>/);
 assert.match(html,/<span aria-current="page">Hiragana<\/span>/);
 assert.equal((html.match(/class="v115-breadcrumb"/g)||[]).length,1);
 assert.equal((html.match(/class="v34-stage-tab /g)||[]).length,2);
 assert.doesNotMatch(html,/v28-header-shell/);
 const index=h.ui.page('course/foundation');
 assert.match(index,/<span aria-current="page">Nền tảng<\/span>/);
 assert.doesNotMatch(index,/<span aria-current="page">Hiragana<\/span>/);
 const style=load('foundation-course-v107.css');
 assert.ok(style.includes('.shell:has(.v115-foundation) > .topbar .breadcrumb'));
 assert.ok(style.includes('.v115-foundation .v115-breadcrumb'));
});

test('v1.25 restores Foundation styling scope for study and practice on every chapter',()=>{
 const h=harness();
 for(const [id,mode] of [['hiragana','learn'],['dakuten','learn'],['yoon','quiz'],['mixed','match']]){
  const route='learn/foundation/'+id+'/all/'+mode;
  h.location.hash='#'+route;
  const html=h.ui.page(route);
  assert.match(html,/v115-foundation v34-studying"/,id+' '+mode);
  assert.match(html,/class="v115-breadcrumb"/,id);
  if(mode==='learn'){
   assert.match(html,/v35-kana-button/,id);
   assert.equal((html.match(/Chạm để nghe/g)||[]).length,0,'No repeated row hint');
   assert.equal((html.match(/Nhấn vào ô chữ để nghe phát âm/g)||[]).length,1,'Audio guidance once');
  }else{
   assert.match(html,/v39-book-layout/,id);
   assert.match(html,/v39-book-nav/,id);
  }
 }
 const js=load('foundation-course-v33.js');
 assert.ok(js.includes("document.querySelector('.v115-breadcrumb [aria-current=\"page\"]')"));
 assert.ok(js.includes("crumb.textContent=target.mod.title.replace"));
 const css=load('foundation-course-v107.css');
 assert.match(css,/\.v34-studying \.v113-stagebar \.v36-step-icon/);
 assert.match(css,/\.v34-studying \.v36-kana-board \.v35-kana-button:hover/);
});

test('v1.25 result pulse applies only on newly graded answers, including matching and build',()=>{
 const source=load('foundation-course-v33.js');
 const css=load('foundation-course-v107.css');
 assert.ok(source.includes("function pulseGradedFeedback(correct,kind='answer')"));
 assert.ok(source.includes("refresh();pulseGradedFeedback(ok)"));
 assert.ok(source.includes("if(s.answer)pulseGradedFeedback(s.answer.correct)"));
 assert.ok(source.includes("else if(gradedMatch!==null)pulseGradedFeedback(gradedMatch,'match')"));
 assert.ok(source.includes("const selector=kind==='match'?'.v105-match-feedback':'.v33-feedback'"));
 assert.ok(css.includes('@keyframes v117-correct-result'));
 assert.ok(css.includes('@keyframes v117-wrong-result'));
 assert.ok(css.includes('@media(prefers-reduced-motion:reduce)'));
 const h=harness(),route='learn/foundation/hiragana/all/quiz';
 h.location.hash='#'+route;h.ui.page(route);
 const s=h.ui.session(),answer=s.questions[0].correct;
 h.click('answer',answer);
 assert.equal(s.choice,answer);
 assert.match(h.ui.page(route),/v33-feedback positive/);
});

test('v1.25B achievement sheet is centered in viewport with scoped portal',()=>{
 const js=load('foundation-course-v33.js');
 const css=load('foundation-course-v107.css');
 assert.ok(js.includes('function mountSummaryHost()'));
 assert.ok(js.includes("host.className='v33-foundation v34-studying v119-summary-host'"));
 assert.ok(js.includes('host.appendChild(overlay)'));
 assert.ok(js.includes('document.body.appendChild(host)'));
 assert.ok(js.includes("document.querySelector?.('body > .v119-summary-host')"));
 assert.ok(js.includes('scheduleSummaryHost()'));
 assert.ok(css.includes('body > .v119-summary-host > .v109-overlay'));
 assert.ok(css.includes('place-items:center!important'));
 assert.ok(css.includes('body > .v119-summary-host .v109-dialog'));
 assert.ok(css.includes('radial-gradient(ellipse'));
 assert.ok(css.includes('rgba(255,244,234,.13)'));
 assert.ok(css.includes('prefers-reduced-motion:reduce'));
 const h=harness(),route='learn/foundation/hiragana/all/match';
 h.location.hash='#'+route;h.ui.page(route);
 const session=h.ui.session();
 for(const item of session.cards){h.click('match',item.id,'left');h.click('match',item.id,'right');}
 const html=h.ui.page(route);
 assert.match(html,/v109-overlay/);
 assert.match(html,/v109-dialog/);
 h.click('summary-close');
 assert.equal(session.round.summaryOpen,false);
});

test('v1.25 both portal dialogs preserve opaque theme on body',()=>{
 const js=load('foundation-course-v33.js'),css=load('foundation-course-v107.css');
 assert.ok(js.includes("host.className='v33-foundation v34-studying v119-summary-host'"));
 assert.ok(js.includes("host.className='v33-foundation v34-studying v120-preflight-host'"));
 assert.ok(js.includes("document.querySelector?.('body > .v120-preflight-host')?.remove?.()"));
 assert.ok(css.includes('body > .v119-summary-host .v109-dialog'));
 assert.ok(css.includes('body > .v120-preflight-host .v38-dialog'));
 assert.ok(css.includes('background:#fffaf9!important'));
 assert.ok(css.includes('background:var(--v33-paper,#fffaf9)!important'));
 assert.ok(css.includes('--v33-paper:var(--v25-bg,#fffaf9)'));
 assert.ok(css.includes('body > .v120-preflight-host > .v38-overlay'));
 // The preflight is conditional (dismissed after first start); verify its actual
 // markup template as well as the styled portal rather than relying on saved state.
 assert.ok(js.includes('class="v38-overlay" role="presentation"'));
 assert.ok(js.includes('class="v38-dialog" role="dialog"'));
 const round=harness(),r='learn/foundation/hiragana/all/match';
 round.location.hash='#'+r;round.ui.page(r);
 const session=round.ui.session();
 for(const item of session.cards){round.click('match',item.id,'left');round.click('match',item.id,'right');}
 const result=round.ui.page(r);
 assert.match(result,/class="v107-overlay v109-overlay"/);
 assert.match(result,/class="v107-dialog v109-dialog"/);
});

test('v1.25 Foundation uses 17 learner-facing lessons without losing 40 original row groups',()=>{
 const {data,ui}=harness();
 assert.equal(data.modules.length,6);
 const lessons=data.modules.flatMap(m=>data.getLessonUnits(m.id));
 assert.equal(lessons.length,17);
 assert.deepEqual(Array.from(lessons.map(x=>x.groups.length).sort((a,b)=>a-b)),[1,1,1,1,2,2,2,2,2,3,3,3,3,3,3,4,4]);
 for(const m of data.modules){
  const units=data.getLessonUnits(m.id);
  const groups=units.flatMap(x=>x.groups);
  assert.deepEqual(Array.from(groups),Array.from(m.groups.map(x=>x.id)),m.id+' preserved groups');
 }
 assert.equal(data.take('hiragana','unit-1').length,10);
 assert.equal(data.take('hiragana','unit-2').length,15);
 assert.equal(data.take('hiragana','unit-3').length,13);
 assert.equal(data.take('hiragana','unit-4').length,8);
 assert.equal(data.take('katakana','unit-3').length,13);
 assert.equal(data.take('dakuten','unit-1').length,20);
 assert.equal(data.take('dakuten','unit-2').length,30);
 assert.equal(data.take('yoon','unit-1').length,24);
 assert.equal(data.take('yoon','unit-2').length,18);
 assert.equal(data.take('yoon','unit-3').length,24);
 assert.equal(data.take('hiragana','a').length,5);
 assert.equal(data.take('katakana','k').length,5);
 assert.equal(data.counts.hiragana,46);
 const sample='learn/foundation/hiragana/unit-1/learn';
 const old='learn/foundation/hiragana/a/learn';
 const h=harness();
 h.location.hash='#'+sample;
 let html=h.ui.page(sample);
 assert.equal((html.match(/class="v33-glyph-card/g)||[]).length,10);
 assert.match(html,/Nguyên âm & hàng K/);
 assert.match(html,/v36-kana-row/);
 h.location.hash='#'+old;
 html=h.ui.page(old);
 assert.equal((html.match(/class="v33-glyph-card/g)||[]).length,5);
 for(const route of ['learn/foundation/hiragana/unit-2/flash','learn/foundation/katakana/unit-3/quiz','learn/foundation/yoon/unit-2/match']){
  h.location.hash='#'+route;
  const body=h.ui.page(route);
  assert.match(body,/v34-stagebar/,route);
  assert.ok(!body.includes('Chưa đủ dữ liệu'),route);
 }
 assert.ok(ui.path('hiragana','unit-1','quiz').includes('unit-1/quiz'));
});
test('v1.25 catalogue shows six chapters and seventeen meaningful lessons',()=>{
 const {data,ui}=harness(),window={NPFoundationCurriculum:data,NPFoundationCourse:ui},hooks={};
 const document={addEventListener:(kind,fn)=>{hooks[kind]=fn}};
 const script=load('learning-hub-v25.js').replace(/\}\)\(\);\s*$/,'window.__foundationCatalog=foundationModuleCatalogue;})();');
 runInNewContext(script,{
  window,document,location:{hash:'#today'},P:()=>({id:'demo-a',goal:'Nền tảng'}),
  render:()=>{},learnPage:()=>'',coursePage:()=>'',titleOf:()=>'',icon:()=>'',Locale:{t:x=>x}
 });
 const html=window.__foundationCatalog();
 assert.equal((html.match(/data-v123-select=/g)||[]).length,6);
 assert.equal((html.match(/data-v123-pane=/g)||[]).length,6);
 assert.equal((html.match(/data-v121-topic(?:\s|>)/g)||[]).length,17);
 assert.equal((html.match(/class="v121-topic-main"/g)||[]).length,17);
 assert.equal((html.match(/class="v125-lesson-parts"/g)||[]).length,13);
 assert.ok(html.includes('17 BÀI HỌC'));
 assert.ok(html.includes('data-v121-filter'));
 assert.ok(html.includes('Tiếp tục học →'));
 assert.ok(html.includes('href="#learn/foundation/hiragana/unit-1/learn"'));
 assert.ok(html.includes('href="#learn/foundation/katakana/unit-4/learn"'));
 assert.ok(html.includes('href="#learn/foundation/dakuten/unit-2/learn"'));
 assert.ok(html.includes('href="#learn/foundation/yoon/unit-3/learn"'));
 assert.ok(html.includes('href="#learn/foundation/small/pause/learn"'));
 assert.ok(html.includes('href="#learn/foundation/mixed/mixed/learn"'));
 // Row-level routes stay available on demand, not as forty top-level lessons.
 assert.ok(html.includes('href="#learn/foundation/hiragana/a/learn"'));
 assert.ok(html.includes('href="#learn/foundation/hiragana/k/learn"'));
 assert.equal((html.match(/data-v125-select/g)||[]).length,0);
 assert.ok(!html.includes('href="#learn/foundation/undefined'));
 assert.ok(html.includes('v123-panel-hiragana'));
 assert.ok(html.includes('data-v123-pane="katakana" hidden'));
 const css=load('learning-hub-v25.css');
 assert.ok(css.includes('.v33-foundation .v125-catalog .v123-topic-panes'));
 assert.ok(css.includes('max-height:none!important'));
 assert.equal(typeof hooks.input,'function');
 assert.equal(typeof hooks.click,'function');
 const a={hidden:false,getAttribute:()=> 'kya'};
 const b={hidden:false,getAttribute:()=> 'hàng k'};
 const first={hidden:false,getAttribute:()=> 'hiragana',querySelectorAll:()=>[a]};
 const second={hidden:true,getAttribute:()=> 'katakana',querySelectorAll:()=>[b]};
 const status={hidden:true,textContent:''};
 const selection={getAttribute:()=> 'hiragana'};
 const area={classList:{toggle:()=>{},remove:()=>{}},
  querySelectorAll:q=>q==='[data-v123-pane]'?[first,second]:q==='[data-v121-topic]'?[a,b]:[],
  querySelector:q=>q==='[data-v121-status]'?status:q==='[data-v123-select].is-active'?selection:null};
 hooks.input({target:{matches:()=>true,value:'kya',closest:()=>area}});
 assert.equal(a.hidden,false);
 assert.equal(b.hidden,true);
 assert.equal(first.hidden,false);
 assert.equal(second.hidden,true);
 assert.match(status.textContent,/1 nhóm bài phù hợp/);
});
test('v1.25 learning navigation exposes exactly three destinations and keeps legacy access',()=>{
 const {data,ui}=harness(),window={NPFoundationCurriculum:data,NPFoundationCourse:ui};
 const hooks={},document={addEventListener:(name,fn)=>{hooks[name]=fn}};
 const script=load('learning-hub-v25.js').replace(/\}\)\(\);\s*$/,'window.__tabs=navigation;window.__legacy=learnPage;})();');
 const location={hash:'#learn/catalog'};
 runInNewContext(script,{window,document,location,route:()=>location.hash.replace(/^#/,''),
  P:()=>({id:'demo-a',goal:'Nền tảng'}),
  render:()=>{},learnPage:()=>'',coursePage:()=>'',titleOf:()=>'',icon:()=>'',Locale:{t:x=>x}});
 const html=window.__tabs('catalog');
 assert.equal((html.match(/class="v25-tab /g)||[]).length,4);
 for(const label of ['Tổng quan','Khóa học','Luyện tập','Ôn tập'])assert.ok(html.includes(label));
 assert.ok(!html.includes('>Module<'));
 assert.ok(!html.includes('>Bài học<'));
 assert.ok(html.includes('href="#learn/overview"'));
 assert.ok(html.includes('href="#learn/catalog"'));
 assert.ok(html.includes('href="#learn/practice"'));
 assert.ok(html.includes('href="#learn/training"'));
 location.hash='#learn/modules';
 assert.match(window.__legacy(),/Nền tảng/);
 location.hash='#learn/lessons';
 assert.match(window.__legacy(),/Nền tảng/);
 const nested=window.NPHorizonV25.foundationCatalogue();
 assert.equal((nested.match(/data-v121-topic(?:\s|>)/g)||[]).length,17);
});
test('v1.25 Foundation course contains searchable topics without another menu level',()=>{
 const {data,ui}=harness();
 const window={NPFoundationCurriculum:data,NPFoundationCourse:ui},document={addEventListener:()=>{}};
 const hubScript=load('learning-hub-v25.js');
 runInNewContext(hubScript,{
  window,document,location:{hash:'#today'},P:()=>({id:'demo-a'}),
  render:()=>{},learnPage:()=>'',coursePage:()=>'',titleOf:()=>'',icon:()=>'',Locale:{t:x=>x}
 });
 // The real course engine receives the catalogue once learning hub is loaded.
 const original=ui.page('course/foundation');
 assert.match(original,/Nền tảng/);
 assert.ok(load('foundation-course-v33.js').includes('window.NPHorizonV25?.foundationCatalogue?.()'));
 assert.ok(load('learning-hub-v25.js').includes("r==='learn/modules'||r==='learn/lessons'"));
 assert.ok(load('learning-hub-v25.js').includes('foundationCatalogue:foundationModuleCatalogue'));
 assert.ok(!load('learning-hub-v25.js').includes("['modules','Module','layers']"));
 assert.ok(!load('learning-hub-v25.js').includes("['lessons','Bài học','play-circle']"));
});

test('v1.25 Foundation presents learning and practice as two contextual destinations',()=>{
 const h=harness(),base='learn/foundation/hiragana/unit-1';
 h.location.hash='#'+base+'/learn';
 const learning=h.ui.page(base+'/learn');
 assert.equal((learning.match(/class="v34-stage-tab /g)||[]).length,2);
 assert.match(learning,/data-value="practice" class="v33-primary">Tiếp theo: Thực hành/);
 assert.doesNotMatch(learning,/data-value="flash" class="v34-stage-tab/);
 assert.doesNotMatch(learning,/class="v33-side"/);
 h.location.hash='#'+base+'/practice';
 const practice=h.ui.page(base+'/practice');
 assert.match(practice,/v126-practice-hub/);
 assert.doesNotMatch(practice,/data-f130="tab"/);
 for(const mode of ['quiz','mix'])assert.ok(practice.includes('href="#'+base+'/'+mode+'"'));
 assert.ok(practice.includes('href="#learn/training/foundation/hiragana/unit-1/hira"'));
 assert.equal((practice.match(/class="v34-stage-tab /g)||[]).length,2);
 assert.ok(practice.includes('Luyện ngay')&&practice.includes('Kiểm tra bài này'));
 assert.doesNotMatch(practice,/v39-book-nav/);
 h.location.hash='#'+base+'/flash';
 const flash=h.ui.page(base+'/flash');
 assert.match(flash,/v126-context/);
 assert.match(flash,/v33-flash/);
 h.location.hash='#'+base+'/match';
 const matched=h.ui.page(base+'/match');
 assert.match(matched,/class="v39-book-layout v126-workbook"/);
 assert.match(matched,/class="v39-book-nav v126-book-nav v129-task-header"/);
 assert.match(matched,/v129-task-header/);
 assert.doesNotMatch(matched,/Đổi dạng bài|v126-exercise-picker/);
 assert.doesNotMatch(matched,/data-value="game"/);
 const css=load('foundation-course-v107.css');
 assert.ok(css.includes('grid-template-columns:repeat(2,minmax(0,1fr))!important'));
 assert.ok(css.includes('.v126-practice-choice'));
 assert.ok(css.includes('.v129-task-header'));
});
test('v1.25 catalogue uses single stable Kana glyphs and legible primary button',()=>{
 const {data,ui}=harness();
 const window={NPFoundationCurriculum:data,NPFoundationCourse:ui},document={addEventListener:()=>{}};
 const source=load('learning-hub-v25.js').replace(/\}\)\(\);\s*$/,'window.__catalogue=foundationModuleCatalogue;})();');
 runInNewContext(source,{window,document,location:{hash:'#today'},
  P:()=>({id:'demo-a'}),render:()=>{},learnPage:()=>'',coursePage:()=>'',titleOf:()=>'',icon:()=>'',Locale:{t:x=>x}});
 const html=window.__catalogue();
 assert.match(html,/<span class="v121-topic-glyph" lang="ja">っ<\/span>/);
 assert.match(html,/<span class="v121-topic-glyph" lang="ja">ー<\/span>/);
 assert.match(html,/<span class="v121-topic-glyph" lang="ja">ァ<\/span>/);
 assert.match(html,/<span class="v121-topic-glyph" lang="ja">あ<\/span>/);
 assert.equal((html.match(/data-v121-topic(?:\s|>)/g)||[]).length,17);
 const css=load('learning-hub-v25.css');
 assert.ok(css.includes('.v125-catalog .v121-continue:visited'));
 assert.ok(css.includes('-webkit-text-fill-color:#fff!important'));
 assert.ok(css.includes('white-space:nowrap!important'));
 assert.ok(css.includes('writing-mode:horizontal-tb!important'));
});


// v1.41: louder, peak-normalized feedback WAV; original audio behavior from v1.27. on a direct graded click, never Japanese reading.
test('v1.41 correct/wrong have audible media feedback and independent manual pronunciation',()=>{
 const h=harness(),route='learn/foundation/hiragana/a/quiz';
 h.setLegacyAudioPref(false); // v1.26 incorrectly read this old key.
 h.location.hash='#'+route;h.ui.page(route);h.start();
 assert.match(h.ui.page(route),/Âm báo đúng sai: Bật/);
 const s=h.ui.session();
 h.click('answer',s.questions[0].correct);
 assert.equal(h.audioFiles[0],'assets/feedback/correct.wav?v=2','correct cue plays even with legacy auto pronunciation OFF');
 assert.equal(h.audioFiles.filter(x=>x.includes('kana-audio')).length,0,'graded answer must never pronounce Japanese');
 h.click('feedback-audio');
 assert.equal(h.audioFiles.filter(x=>x.includes('kana-audio')).length,1,'manual pronunciation remains available');
 h.click('next');
 const wrong=s.questions[1].choices.find(x=>x.id!==s.questions[1].correct);
 h.click('answer',wrong.id);
 assert.equal(h.audioFiles.at(-1),'assets/feedback/incorrect.wav?v=2');
 assert.equal(h.audioFiles.filter(x=>x.includes('kana-audio')).length,1);
 h.setAudioPref(false);
 h.click('next');const before=h.audioFiles.length;
 h.click('answer',s.questions[2].correct);
 assert.equal(h.audioFiles.length,before,'sound preference silences only feedback sounds');
 h.click('feedback-audio');
 assert.equal(h.audioFiles.filter(x=>x.includes('kana-audio')).length,2);
});
test('v1.41 word-builder plays once on grading, not while selecting Kana',()=>{
 const h=harness(),route='learn/foundation/small/pause/build';
 h.location.hash='#'+route;h.ui.page(route);h.start();
 const s=h.ui.session(),word=s.cards[0],glyphs=Array.from(word.glyph);
 glyphs.forEach((ch,pos)=>{
  const i=s.tileOrder.findIndex((tile,n)=>tile.glyph===ch&&!s.selected.includes(n));
  assert.ok(i>=0);h.click('tile',String(i));
  if(pos<glyphs.length-1)assert.equal(h.audioFiles.length,0);
 });
 assert.equal(s.answer.correct,true);
 assert.deepEqual(h.audioFiles,['assets/feedback/correct.wav?v=2']);
 assert.match(h.ui.page(route),/data-f33="feedback-audio"/);
});
test('v1.41 feedback assets are standard little-endian mono PCM WAV files',()=>{
 for(const name of ['correct','incorrect']){
  const src=readFileSync(new URL('assets/feedback/'+name+'.wav',root));
  assert.equal(src.toString('ascii',0,4),'RIFF');
  assert.equal(src.toString('ascii',8,12),'WAVE');
  assert.equal(src.readUInt16LE(20),1); // LPCM
  assert.equal(src.readUInt16LE(22),1); // mono
  assert.equal(src.readUInt32LE(24),22050);
  assert.ok(src.length>4096&&src.length<40000);
  // iPhone/PC speakers need a strong cue without clipping or distortion.
  const samples=(src.length-44)/2;
  let peak=0;
  for(let i=0;i<samples;i++){
   const sample=src.readInt16LE(44+i*2);
   peak=Math.max(peak,Math.abs(sample)/32768);
  }
  assert.ok(peak>=.70&&peak<=.82,name+' is audibly mastered but never clips: '+peak);
 }
});

test('v1.41 lesson action paths retain exact filtered scope without nested menus',()=>{
 const h=harness(),base='learn/foundation/hiragana/unit-1';
 h.location.hash='#'+base+'/practice';
 const page=h.ui.page(base+'/practice');
 for(const dest of [base+'/quiz',base+'/mix'])assert.ok(page.includes('href="#'+dest+'"'));
 assert.ok(page.includes('href="#learn/training/foundation/hiragana/unit-1/hira"'));
 assert.doesNotMatch(page,/v130-entry-nav|v129-advanced|v126-exercise-picker/);
 for(const mode of ['flash','quiz','reverse','match','mix']){
  const route=base+'/'+mode;h.location.hash='#'+route;const output=h.ui.page(route);
  assert.doesNotMatch(output,/Đổi dạng bài|v126-exercise-picker/);
  assert.match(output,/href="#learn\/training\/foundation\/hiragana\/unit-1\/hira">‹ Dạng bài/);
 }
});
test('v1.41 global Practice filters Foundation chapters, units, script and N5 truthfully',()=>{
 const h=harness(),window={NPFoundationCurriculum:h.data,NPFoundationCourse:h.ui};
 const hooks={},map=new Map(),localStorage={getItem:key=>map.get(key)||null,setItem:(key,val)=>map.set(key,val)};
 const location={hash:'#learn/training/foundation/hiragana/unit-1/hira'};
 const source=load('learning-hub-v25.js').replace(/\}\)\(\);\s*$/,'window.__training={page:trainingTab,scope:trainingScope,route:trainingRoute};})();');
 runInNewContext(source,{window,document:{addEventListener:(kind,fn)=>{hooks[kind]=fn},querySelector:()=>({})},location,localStorage,
  route:()=>location.hash.replace(/^#/,''),P:()=>({id:'demo-a',goal:'Nền tảng',name:'Learner A'}),
  render:()=>{},learnPage:()=>'',coursePage:()=>'',titleOf:()=>'',icon:()=>'',Locale:{t:x=>x}});
 let html=window.__training.page(null);
 assert.match(html,/Luyện tập/);
 assert.match(html,/Cấp độ/);
 assert.match(html,/Nội dung/);
 assert.match(html,/Bài học/);
 assert.match(html,/Hệ chữ/);
 assert.match(html,/Chọn dạng bài/);
 assert.match(html,/class="v133-two-column"/);
 assert.match(html,/class="v133-side-menu"/);
 assert.match(html,/class="v133-mobile-menu"/);
 assert.match(html,/Kiểm tra tổng hợp/);
 assert.match(html,/class="v132-scope"/);
 assert.doesNotMatch(html,/class="v132-scope" open/);
 assert.doesNotMatch(html,/class="v132-custom"/);
 assert.match(html,/class="v133-nav-item/);
 assert.equal((html.match(/class="v132-primary"/g)||[]).length,1);
 assert.ok(html.includes('href="#learn/training/foundation/hiragana/unit-1/hira/quiz"'));
 assert.ok(html.includes('href="#learn/training/foundation/hiragana/unit-1/hira/mix"'));
 assert.doesNotMatch(html,/Chưa đủ dữ liệu/);
 const sc=window.__training.scope();
 assert.equal(window.__training.route('unit','unit-2',sc),'learn/training/foundation/hiragana/unit-2/hira');
 assert.equal(window.__training.route('module','katakana',sc),'learn/training/foundation/katakana/all/kata');
 assert.equal(window.__training.route('level','N5',sc),'learn/training/N5/all');
 assert.equal(window.__training.route('level','N4',sc),'learn/training/foundation/hiragana/all/hira');
 location.hash='#learn/training/N5/all';html=window.__training.page(null);
 assert.match(html,/N5 · Các bài đã có/);
 assert.match(html,/quiz\/n5-greetings/);
 assert.doesNotMatch(html,/learn\/foundation\/hiragana\/unit-1\/mix/);
 assert.match(html,/N4–N1 chưa phát hành/);
 const first=window.__training.scope();
 assert.equal(first.level,'N5');
 assert.equal(window.__training.route('lesson','n5-demonstratives',first),'learn/training/N5/n5-demonstratives');
});

test('v1.41 remembers compact filter expansion and last chosen skill by profile',()=>{
 const h=harness(),window={NPFoundationCurriculum:h.data,NPFoundationCourse:h.ui};
 const storage=new Map(),localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
 const location={hash:'#learn/training/foundation/hiragana/unit-1/hira'},hooks={};let person='demo-a';
 const source=load('learning-hub-v25.js').replace(/\}\)\(\);\s*$/,'window.__trainingTab=trainingTab;})();');
 runInNewContext(source,{window,document:{addEventListener:(n,cb)=>hooks[n]=cb,querySelector:()=>({})},location,localStorage,
  route:()=>location.hash.replace(/^#/,''),P:()=>({id:person,goal:'Nền tảng',name:person}),
  render:()=>{},learnPage:()=>'',coursePage:()=>'',titleOf:()=>'',icon:()=>'',Locale:{t:x=>x}});
 let html=window.__trainingTab(null);
 assert.doesNotMatch(html,/class="v132-scope" open/);
 assert.doesNotMatch(html,/class="v132-custom"/);
 assert.match(html,/class="v133-mobile-menu"/);
 assert.match(html,/href="#learn\/training\/foundation\/hiragana\/unit-1\/hira\/quiz"/);
 hooks.toggle({target:{classList:{contains:c=>c==='v132-scope'},open:true}});
 html=window.__trainingTab(null);
 assert.match(html,/class="v132-scope" open/);
 storage.set('Horizon.Foundation.recentExercise.v1.demo-a','listen-match');
 html=window.__trainingTab(null);
 assert.match(html,/Luyện lại: Nghe &amp; ghép/);
 assert.match(html,/href="#learn\/training\/foundation\/hiragana\/unit-1\/hira\/listen-match"/);
 person='demo-b';html=window.__trainingTab(null);
 assert.doesNotMatch(html,/class="v132-scope" open/);
 assert.match(html,/Luyện nhận diện chữ/);
});

test('v1.41 left exercise menu navigates directly and mobile chooser stays compact',()=>{
 const h=harness(),window={NPFoundationCurriculum:h.data,NPFoundationCourse:h.ui};
 const location={hash:'#learn/training/foundation/hiragana/unit-1/hira'};
 const script=load('learning-hub-v25.js').replace(/\}\)\(\);\s*$/,'window.__v133=trainingTab;})();');
 runInNewContext(script,{window,document:{addEventListener:()=>{},querySelector:()=>({})},location,
  localStorage:{getItem:()=>null,setItem:()=>{}},route:()=>location.hash.slice(1),
  P:()=>({id:'demo-a',goal:'Nền tảng'}),
  render:()=>{},learnPage:()=>'',coursePage:()=>'',titleOf:()=>'',icon:()=>'',Locale:{t:x=>x}});
 let html=window.__v133(null);
 assert.match(html,/class="v133-two-column"/);
 assert.match(html,/class="v133-side-menu"/);
 assert.match(html,/class="v133-mobile-menu"/);
 assert.doesNotMatch(html,/class="v132-custom"/);
 assert.equal((html.match(/class="v132-primary"/g)||[]).length,1);
 for(const mode of ['quiz','reverse','truefalse','listen','listen-match','match']){
  assert.ok(html.includes('href="#learn/training/foundation/hiragana/unit-1/hira/'+mode+'"'),mode+' points to existing exercise');
 }
 // This unit already includes valid short Kana words; keep matching word modes available.
 assert.ok(html.includes('href="#learn/training/foundation/hiragana/unit-1/hira/vocab-ja-vi"'));
 location.hash='#learn/training/N5/all';html=window.__v133(null);
 assert.match(html,/BÀI LUYỆN N5/);
 assert.match(html,/href="#quiz\/n5-greetings"/);
 assert.doesNotMatch(html,/class="v132-custom"/);
 const css=load('learning-hub-v30.css');
 assert.match(css,/@media\(max-width:620px\)/);
 assert.match(css,/\.v133-side-menu\{display:none!important\}/);
});

test('v1.41 native Foundation practice renders and records answers inline',()=>{
 const h=harness(),base='learn/training/foundation/hiragana/unit-1/hira';
 h.location.hash='#'+base+'/quiz';
 const markup=h.ui.embeddedPractice();
 assert.match(markup,/class="v34-workspace-shell"/);
 assert.match(markup,/v134-inline-stage/);
 assert.doesNotMatch(markup,/v34-stagebar v113-stagebar/);
 const session=h.ui.session();
 assert.ok(session?.questions?.length,'native exercise engine initialized');
 h.click('answer',session.questions[0].correct);
 assert.ok(h.ui.session().choice,'graded answer remains recorded');
 h.click('next');
 assert.equal(h.ui.session().index,1,'Next advances inside current exercise');
 h.location.hash='#'+base+'/flash';
 assert.match(h.ui.embeddedPractice(),/v134-inline-stage/);
 h.location.hash='#'+base+'/mix';
 assert.match(h.ui.embeddedPractice(),/v134-inline-stage/);
});
test('v1.41 same-page route preserves sidebar and guided-tour controls',()=>{
 const h=harness(),window={NPFoundationCurriculum:h.data,NPFoundationCourse:h.ui};
 h.location.hash='#learn/training/foundation/hiragana/unit-1/hira/quiz';
 const code=load('learning-hub-v25.js').replace(/\}\)\(\);\s*$/,'window.__inlineV134=trainingTab;})();');
 runInNewContext(code,{window,document:{addEventListener:()=>{},querySelector:()=>({})},location:h.location,
  localStorage:{getItem:()=>null,setItem:()=>{}},route:()=>h.location.hash.slice(1),P:()=>({id:'demo-a'}),
  render:()=>{},learnPage:()=>'',coursePage:()=>'',titleOf:()=>'',icon:()=>'',Locale:{t:x=>x}});
 const markup=window.__inlineV134(null);
 assert.match(markup,/v134-inline-training v33-foundation v34-studying/);
 assert.match(markup,/class="v34-workspace-shell"/);
 assert.match(markup,/aria-current="page"/);
 assert.match(markup,/data-v134-guide="start"/);
 assert.match(markup,/data-v134-guide="toggle"/);
 assert.match(markup,/v135-scope-icon/);
 assert.match(markup,/v135-scope-chevron/);
 assert.match(markup,/href="#learn\/training\/foundation\/hiragana\/unit-1\/hira\/reverse"/);
 const css=load('learning-hub-v30.css');
 assert.match(css,/max-height:none!important/);
 assert.match(css,/overflow:visible!important/);
 const guide=load('training-guide-v134.js');
 const callbacks={},guideWin={addEventListener:()=>{},innerWidth:1000};
 runInNewContext(guide,{window:guideWin,document:{addEventListener:(type,fn)=>callbacks[type]=fn},
  localStorage:{getItem:()=>null,setItem:()=>{}},location:h.location,P:()=>({id:'demo-a'})});
 assert.equal(typeof guideWin.NPTrainingGuide.maybeStart,'function');
 assert.equal(typeof guideWin.NPTrainingGuide.start,'function');
 assert.ok(callbacks.click&&callbacks.keydown);
 assert.match(guide,/Thoát hướng dẫn\\?/);
 assert.match(guide,/Tự mở hướng dẫn lần sau/);
 assert.match(guide,/v134-guide-cursor/);
});

test('v1.41 the scope form aligns its read-only Kana field with dropdown inputs',()=>{
 const h=harness(),window={NPFoundationCurriculum:h.data,NPFoundationCourse:h.ui};
 const location={hash:'#learn/training/foundation/hiragana/unit-1/hira'};
 const src=load('learning-hub-v25.js').replace(/\}\)\(\);\s*$/,'window.__v135=trainingTab;})();');
 runInNewContext(src,{window,document:{addEventListener:()=>{},querySelector:()=>({})},location,
  localStorage:{getItem:()=>null,setItem:()=>{}},route:()=>location.hash.slice(1),P:()=>({id:'demo-a'}),
  render:()=>{},learnPage:()=>'',coursePage:()=>'',titleOf:()=>'',icon:()=>'',Locale:{t:x=>x}});
 const html=window.__v135(null),css=load('learning-hub-v30.css');
 assert.match(html,/v135-scope-icon/);
 assert.match(html,/v135-scope-label/);
 assert.match(html,/v135-scope-chevron/);
 assert.match(html,/Cấp độ · Nội dung · Bài học/);
 assert.match(html,/class="v131-filter v131-fixed"/);
 assert.match(css,/grid-template-rows:18px 44px/);
 assert.match(css,/\.v132-scope \.v131-fixed>strong/);
 assert.match(css,/height:44px/);
});
test('v1.41 the interactive guide counts eight to zero and preserves remaining time when paused',()=>{
 const src=load('training-guide-v134.js'),css=load('learning-hub-v30.css');
 assert.match(src,/const STEP_MS=8000/);
 assert.match(src,/v135-guide-timer/);
 assert.match(src,/v135-guide-progress/);
 assert.match(src,/data-v134-action="pause"/);
 assert.match(src,/t.remainingMs=Math.max\(0,t.deadline-Date.now\(\)\)/);
 assert.match(src,/tour.remainingMs=Math.max\(0,tour.deadline-Date.now\(\)\)/);
 assert.match(src,/if\(action==='pause'\)/);
 assert.match(src,/function pauseCountdown\(/);
 assert.match(src,/function scheduleCountdown\(/);
 assert.match(src,/Thoát hướng dẫn\?/);
 assert.match(src,/if\(action==='continue'\)/);
 assert.match(src,/Tự mở hướng dẫn lần sau/);
 assert.match(src,/clearInterval\(clockTick\)/);
 assert.match(css,/v135-guide-clock/);
 assert.match(css,/conic-gradient/);
 assert.match(css,/v135-guide-pause/);
});

test('v1.41 completed training guide highlights only the scope selector and guide dialogs point at controls',()=>{
 const source=load('training-guide-v134.js'),css=load('learning-hub-v30.css');
 assert.match(source,/if\(reason==='complete'\)spotlightScope\(\)/);
 assert.match(source,/end\('complete'\)/);
 assert.match(source,/end\('exit'\)/);
 assert.match(source,/end\('navigation',false\)/);
 assert.match(source,/tour\.host\.dataset\.bubbleSide=side/);
 assert.match(source,/--v136-arrow-x/);
 assert.match(source,/v136-guide-ready/);
 assert.match(css,/v136-post-tour-bubble/);
 assert.match(css,/v136-scope-nudge/);
 assert.match(css,/data-bubble-side="below"/);
 assert.match(css,/data-bubble-side="above"/);
 assert.match(css,/prefers-reduced-motion:reduce/);
});
test('v1.41 post-guide spotlight is triggered on completion but not on exit',()=>{
 const guide=load('training-guide-v134.js').replace(/\}\)\(\);\s*$/,
  'window.__tourUnit={end,spotlightScope,clearScopeHint,setTour:t=>tour=t};})();');
 const classes=()=>{const values=new Set();return {add:n=>values.add(n),remove:n=>values.delete(n),contains:n=>values.has(n)}};
 const root={classList:classes(),querySelector:n=>n==='.v132-scope-change'?chip:n==='summary'?summary:null};
 const chip={classList:classes(),appendChild:n=>{chip.child=n}};
 const summary={getBoundingClientRect:()=>({top:120,bottom:180})};
 const events={},removed=[];
 const document={querySelector:n=>n==='.v132-scope'?root:null,
  querySelectorAll:()=>[],createElement:()=>({className:'',setAttribute(){},remove(){removed.push('bubble')}}),
  addEventListener:(name,fn)=>{events[name]=fn},removeEventListener:()=>{}};
 const clock=[],storage={};
 const window={innerHeight:768,addEventListener:()=>{},removeEventListener:()=>{}};
 runInNewContext(guide,{window,document,location:{hash:'#learn/training'},
  P:()=>({id:'demo-a'}),localStorage:{getItem:()=>null,setItem:(k,v)=>{storage[k]=v}},
  setTimeout:(fn,ms)=>{clock.push({fn,ms});return clock.length},clearTimeout:()=>{},
  setInterval:()=>1,clearInterval:()=>{}});
 const api=window.__tourUnit;
 let removedHost=0;
 api.setTour({repeat:false,host:{remove(){removedHost++}}});
 api.end('exit');
 assert.equal(removedHost,1);
 assert.equal(root.classList.contains('v136-post-tour-active'),false);
 api.setTour({repeat:false,host:{remove(){removedHost++}}});
 api.end('complete');
 assert.equal(removedHost,2);
 assert.equal(root.classList.contains('v136-post-tour-active'),true);
 assert.equal(chip.classList.contains('v136-scope-attention'),true);
 assert.equal(chip.child.textContent,'Chọn phạm vi bạn muốn luyện hoặc kiểm tra tại đây');
 assert.equal(clock.at(-1).ms,7600);
 api.clearScopeHint();
 assert.equal(root.classList.contains('v136-post-tour-active'),false);
 assert.ok(removed.includes('bubble'));
});

test('v1.41 cold reload restores Training instead of legacy learning interface',()=>{
 const h=harness();
 function reload(target){
  const window={NPFoundationCurriculum:h.data,NPFoundationCourse:h.ui};
  const listeners={},calls=[];
  const document={readyState:'loading',addEventListener:(name,handler)=>{(listeners[name]??=[]).push(handler)}};
  // Foundation's embedded engine and hub must read the *same* browser URL.
  const location=h.location;location.hash='#'+target;
  const ctx={window,document,location,localStorage:{getItem:()=>null,setItem:()=>{}},
   route:()=>location.hash.slice(1),P:()=>({id:'demo-a',goal:'Nền tảng',name:'Learner'}),
   learnPage:()=>'<p>OLD LEARNING SCREEN</p>',coursePage:()=>'',titleOf:r=>r,
   render:(scroll)=>calls.push({scroll,html:ctx.learnPage()}),
   icon:()=>'',Locale:{t:x=>x}};
  runInNewContext(load('learning-hub-v25.js'),ctx);
  assert.equal(calls.length,0,'do not render before DOMContentLoaded');
  assert.equal(listeners.DOMContentLoaded?.length,1,'register exactly one bootstrap');
  listeners.DOMContentLoaded[0]();
  assert.equal(calls.length,1,'rerender once after dependent scripts are ready');
  assert.equal(calls[0].scroll,false,'preserve hash and scroll');
  assert.doesNotMatch(calls[0].html,/OLD LEARNING SCREEN/);
  assert.equal(location.hash,'#'+target,'refresh must not modify original hash');
  return calls[0].html;
 }
 const overview=reload('learn/overview');
 assert.match(overview,/v25-wrap/);
 const training=reload('learn/training');
 assert.match(training,/KHÔNG GIAN LUYỆN TẬP/);
 assert.match(training,/v133-two-column/);
 assert.match(training,/v133-side-menu/);
 assert.doesNotMatch(training,/class="lh-tabs"/);
 const deep=reload('learn/training/foundation/hiragana/unit-1/hira/quiz');
 assert.match(deep,/v134-inline-training/);
 assert.match(deep,/v34-workspace-shell/);
});

test('v1.41 a lost preflight portal never strands the mixed test in an unclickable state',()=>{
 const h=harness({preflightMissing:true}),route='learn/foundation/hiragana/all/mix';
 h.location.hash='#'+route;
 const markup=h.ui.page(route),s=h.ui.session();
 assert.equal(s.ready,false,'timed exam still supports its normal explicit introduction');
 assert.match(markup,/class="v138-start-strip"/);
 assert.match(markup,/data-f38="start"/);
 assert.doesNotMatch(markup,/ inert(?:\s|>)/);
 const q=s.questions[0];
 h.click('answer',q.correct);
 assert.equal(s.ready,true,'first answer starts safely when the modal is gone');
 assert.equal(s.choice,q.correct,'answer is graded, not silently ignored');
 assert.ok(s.startedAt>0);
 assert.equal(s.answered,1);
});
test('v1.41 active mode heading is refined without removing sound toggle or navigation',()=>{
 const h=harness(),route='learn/foundation/hiragana/all/mix';
 h.location.hash='#'+route;
 let markup=h.ui.page(route);
 assert.match(markup,/v138-session-state is-exam/);
 assert.match(markup,/ĐANG KIỂM TRA/);
 assert.match(markup,/v138-session-symbol/);
 assert.match(markup,/v138-session-dot/);
 assert.match(markup,/data-f33="toggle-audio"/);
 assert.match(markup,/class="v126-back v133-return-menu"/);
 const css=load('foundation-course-v107.css');
 assert.match(css,/v138-session-breathe/);
 assert.match(css,/prefers-reduced-motion:reduce/);
});
test('v1.41 tutorial measures actual dialog height and stays visible above a bottom control',()=>{
 const code=load('training-guide-v134.js').replace(/\}\)\(\);\s*$/,
  'window.__v138guide={layOut,setTour:t=>tour=t};})();');
 const card={hidden:false,style:{setProperty(){}},offsetHeight:360,getBoundingClientRect:()=>({height:360})};
 const node=()=>({style:{setProperty(){}},setAttribute(){},classList:{toggle(){}},textContent:''});
 const highlight=node(),cursor=node(),clock=node();
 const elements={'.v134-guide-spot':highlight,'.v134-guide-cursor':cursor,'.v134-guide-card':card,
  '.v135-guide-clock':clock};
 const host={dataset:{},querySelector:(selector)=>elements[selector]||(elements[selector]=node()),querySelectorAll:()=>[]};
 let bounds={left:90,top:510,bottom:552,width:180,height:42};
 const target={getBoundingClientRect:()=>bounds,scrollIntoView(){}};
 const doc={querySelector:()=>target,addEventListener(){},removeEventListener(){},querySelectorAll:()=>[]};
 const window={innerWidth:900,innerHeight:610,addEventListener(){},removeEventListener(){}};
 runInNewContext(code,{window,document:doc,location:{hash:'#learn/training'},
  P:()=>({id:'demo-a'}),localStorage:{getItem:()=>null,setItem(){}},
  setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,clearInterval(){}});
 window.__v138guide.setTour({host,step:0,steps:[{selector:'.target',title:'Hướng dẫn',desc:'Bước này'}],
  paused:true,confirm:false,remainingMs:8000,repeat:false,scrolledStep:0});
 window.__v138guide.layOut();
 const bottom=Number.parseFloat(card.style.top)+360;
 assert.ok(bottom<=window.innerHeight-12,'tooltip and its buttons must fit above bottom viewport edge');
 assert.equal(host.dataset.bubbleSide,'above');
 assert.ok(Number.parseFloat(card.style.top)>=12);
 // If both sides are too small, the fallback viewport-centered card still fits.
 window.innerHeight=310;
 window.__v138guide.layOut();
 assert.ok(Number.parseFloat(card.style.top)>=12);
 assert.ok(Number.parseFloat(card.style.top)+286<=310,'clamped card stays within a short viewport');
 const css=load('learning-hub-v30.css');
 assert.match(css,/max-height:calc\(100dvh - 24px\)/);
 assert.match(css,/position:sticky;bottom:0/);
});

test('v1.41 completion proposes the correct next Foundation unit without claiming mastery',()=>{
 const h=harness(),D=h.data;
 const cfg=(id,group,mode='quiz',script=D.byId[id].script)=>
  ({id,group,mode,script,mod:D.byId[id]});
 const first=h.ui.nextPracticeScope(cfg('hiragana','unit-1','quiz','hira'));
 assert.equal(first.title,'Bài tiếp theo · Hàng S · T · N');
 assert.equal(first.href,'#learn/training/foundation/hiragana/unit-2/hira/quiz');
 const third=h.ui.nextPracticeScope(cfg('hiragana','unit-3','reverse','hira'));
 assert.equal(third.href,'#learn/training/foundation/hiragana/unit-4/hira/reverse');
 const last=h.ui.nextPracticeScope(cfg('hiragana','unit-4','mix','hira'));
 assert.equal(last.href,'#learn/training/foundation/hiragana/all/hira/mix');
 assert.equal(last.kind,'expanded');
 const all=h.ui.nextPracticeScope(cfg('hiragana','all','quiz','hira'));
 assert.equal(all.href,'#learn/training/foundation/katakana/unit-1/kata/quiz');
 assert.equal(h.ui.nextPracticeScope(cfg('mixed','all','quiz','both')),null);
});
test('v1.41 completion panel offers expanding or choosing scope while preserving retry and review',()=>{
 const h=harness(),base='learn/training/foundation/hiragana/unit-1/hira';
 h.location.hash='#'+base+'/quiz';
 h.ui.embeddedPractice();
 const session=h.ui.session(),total=session.questions.length;
 session.index=total;session.finished=true;session.correct=total;
 const html=h.ui.embeddedPractice();
 assert.match(html,/GỢI Ý LUYỆN TIẾP/);
 assert.match(html,/Bài tiếp theo · Hàng S · T · N/);
 assert.ok(html.includes('href="#learn/training/foundation/hiragana/unit-2/hira/quiz"'));
 assert.match(html,/data-f33="expand-scope"/);
 assert.match(html,/Luyện lại ngẫu nhiên/);
 assert.match(html,/Ôn chữ cần luyện/);
 session.correct=0;
 assert.match(h.ui.embeddedPractice(),/Bạn có thể luyện lại phần này trước khi thử nội dung mới/);
 h.location.hash='#'+base+'/build';
 h.ui.embeddedPractice();
 const build=h.ui.session();
 assert.ok(build.cards.length,'word build has sample content in unit 1');
 build.finished=true;build.index=build.cards.length;
 assert.match(h.ui.embeddedPractice(),/class="v139-result-next/);
 assert.match(h.ui.embeddedPractice(),/Tự đổi phạm vi/);
});
test('v1.41 next-scope links leave matching results without keeping old popup',()=>{
 const h=harness(),route='learn/training/foundation/hiragana/unit-1/hira/match';
 h.location.hash='#'+route;
 h.ui.embeddedPractice();
 const s=h.ui.session();
 for(const card of s.cards){h.click('match',card.id,'left');h.click('match',card.id,'right')}
 const html=h.ui.embeddedPractice();
 assert.match(html,/GỢI Ý LUYỆN TIẾP/);
 assert.match(html,/data-f33="expand-scope"/);
 assert.match(html,/class="v139-result-next is-compact"/);
 assert.match(html,/href="#learn\/training\/foundation\/hiragana\/unit-2\/hira\/match"/);
});

test('v1.41 question counts support 10, 15, 20 and a custom length without losing Kana coverage',()=>{
 const h=harness(),route='learn/training/foundation/hiragana/unit-1/hira/quiz';
 h.location.hash='#'+route;
 let html=h.ui.embeddedPractice();
 assert.match(html,/data-f140-count/);
 assert.match(html,/10 câu/);
 assert.equal(h.ui.session().questions.length,10);
 const ids=()=>h.ui.session().questions.map(q=>q.item.id);
 h.changeCount('15');
 assert.equal(h.ui.session().questions.length,15);
 assert.equal(new Set(ids()).size,10,'repeated cycle covers all ten available Kana');
 for(let i=1;i<ids().length;i++)assert.notEqual(ids()[i],ids()[i-1],'avoid identical adjacent prompts');
 h.changeCount('20');
 assert.equal(h.ui.session().questions.length,20);
 h.changeCount('custom',37);
 assert.equal(h.ui.session().questions.length,37);
 assert.equal(h.ui.countPrefs().value,37);
 assert.equal(h.ui.countPrefs().preset,'custom');
 html=h.ui.embeddedPractice();
 assert.match(html,/data-f140-custom/);
 assert.match(html,/value="37"/);
 assert.match(html,/class="v141-count-control"/);
 assert.match(html,/data-f140-custom/);
 h.setProfile('demo-b');
 assert.equal(h.ui.countPrefs().value,10,'preferences separated by learner profile');
 h.setProfile('demo-a');
 assert.equal(h.ui.countPrefs().value,37);
});
test('v1.41 fully completed runs record each attempt; course tick requires practice and an >=80% exam',()=>{
 const h=harness(),base='learn/training/foundation/hiragana/unit-1/hira';
 function finish(mode,size,incorrect=0){
   h.location.hash='#'+base+'/'+mode;
   h.ui.embeddedPractice();
   h.changeCount(String(size));
   if(mode==='mix')h.start();
   const session=h.ui.session();
   assert.equal(session.questions.length,size);
   for(let i=0;i<size;i++){
     const q=session.questions[i];
     const answer=i<incorrect?q.choices.find(x=>x.id!==q.correct).id:q.correct;
     h.click('answer',answer);h.click('next');
   }
   assert.equal(session.finished,true);
   return session;
 }
 const unit=()=>h.ui.attemptStatus('hiragana','unit-1','hira');
 assert.equal(unit().complete,false);
 const one=finish('quiz',10);
 assert.equal(one.correct,10);
 assert.equal(unit().practiceCount,1);
 assert.equal(unit().testDone,false);
 assert.equal(unit().complete,false);
 finish('mix',10,3);
 assert.equal(unit().testCount,1);
 assert.equal(unit().testPassed,false,'seven of ten is not a passing HORIZON practice check');
 assert.equal(unit().complete,false);
 finish('mix',15,3);
 assert.equal(unit().testCount,2);
 assert.equal(unit().testPassed,true,'twelve of fifteen meets the declared 80% criterion');
 assert.equal(unit().complete,true);
 assert.equal(unit().bestTest,80);
 assert.equal(unit().history.length,3);
 assert.ok(unit().history.every(a=>a.completedAt&&a.total&&a.moduleId==='hiragana'&&a.unitId==='unit-1'));
 const statusBefore=h.ui.store().items;
 h.setProfile('demo-b');
 assert.equal(h.ui.attemptStatus('hiragana','unit-1','hira').practiceCount,0);
 assert.equal(h.ui.attemptStatus('hiragana','unit-1','hira').complete,false);
 h.setProfile('demo-a');
 assert.equal(h.ui.attemptStatus('hiragana','unit-1','hira').testCount,2);
 assert.deepEqual(JSON.parse(JSON.stringify(h.ui.store().items)),JSON.parse(JSON.stringify(statusBefore)),'attempt tracking keeps original per-character stats when changing profiles');
});
test('v1.41 catalogue exposes separate learned/tested states and exact attempt history',()=>{
 const h=harness(),window={NPFoundationCurriculum:h.data,NPFoundationCourse:h.ui};
 const src=load('learning-hub-v25.js').replace(/\}\)\(\);\s*$/,'window.__v140=foundationModuleCatalogue;})();');
 runInNewContext(src,{window,document:{addEventListener(){}},location:{hash:'#learn/modules'},
  P:()=>({id:'demo-a',goal:'Nền tảng'}),render:()=>{},learnPage:()=>'',coursePage:()=>'',titleOf:()=>'',icon:()=>'',Locale:{t:x=>x}});
 let html=window.__v140();
 assert.match(html,/0 \/ 17 bài hoàn thành/);
 assert.match(html,/Chưa bắt đầu/);
 assert.match(html,/Luyện ngay/);
 assert.match(html,/Kiểm tra bài này/);
 const item=h.ui.store();
 item.attemptRuns=[
  {id:'one',moduleId:'hiragana',unitId:'unit-1',script:'hira',kind:'practice',mode:'quiz',total:10,correct:8,percent:80,completedAt:'2026-11-01T00:00:00.000Z'},
  {id:'two',moduleId:'hiragana',unitId:'unit-1',script:'hira',kind:'test',mode:'mix',total:10,correct:7,percent:70,completedAt:'2026-11-02T00:00:00.000Z'},
  {id:'three',moduleId:'hiragana',unitId:'unit-1',script:'hira',kind:'test',mode:'mix',total:15,correct:13,percent:87,completedAt:'2026-11-03T00:00:00.000Z'}
 ];
 html=window.__v140();
 assert.match(html,/1 \/ 17 bài hoàn thành/);
 assert.match(html,/✓ Hoàn thành/);
 assert.match(html,/Lịch sử · 3 lượt/);
 assert.match(html,/Lượt 1 · Luyện/);
 assert.match(html,/Lượt 2 · Kiểm tra/);
 assert.match(html,/Lượt 3 · Kiểm tra/);
 assert.match(html,/13\/15 · 87%/);
 assert.match(html,/1 \/ 4 hoàn thành/);
 assert.match(html,/href="#learn\/training\/foundation\/hiragana\/unit-1\/hira\/quiz"/);
 assert.match(html,/href="#learn\/training\/foundation\/hiragana\/unit-1\/hira\/mix"/);
 const css=load('learning-hub-v30.css');
 assert.match(css,/v140-topic-badge/);
 assert.match(css,/v140-catalog-history/);
});

test('v1.41 result tiers keep positive, passing and retry states distinct and legible',()=>{
 const h=harness();
 assert.equal(h.ui.resultGrade(100).tone,'good');
 assert.equal(h.ui.resultGrade(90).label,'Tốt');
 assert.equal(h.ui.resultGrade(89).tone,'pass');
 assert.equal(h.ui.resultGrade(80).label,'Đạt');
 assert.equal(h.ui.resultGrade(79).tone,'retry');
 assert.equal(h.ui.resultGrade(0).label,'Chưa đạt');
 const base='learn/training/foundation/hiragana/unit-1/hira';
 h.location.hash='#'+base+'/quiz';
 h.ui.embeddedPractice();
 const session=h.ui.session();
 session.index=session.questions.length;
 session.finished=true;
 session.correct=session.questions.length;
 let html=h.ui.embeddedPractice();
 assert.match(html,/v141-grade-badge is-good/);
 assert.match(html,/Tốt/);
 assert.match(html,/Hoàn thành lượt luyện/);
 assert.match(html,/Tự đổi phạm vi/);
 session.correct=Math.floor(session.questions.length*.8);
 html=h.ui.embeddedPractice();
 assert.match(html,/v141-grade-badge is-pass/);
 session.correct=0;
 html=h.ui.embeddedPractice();
 assert.match(html,/v141-grade-badge is-retry/);
 assert.match(html,/Cần ôn thêm/);
 const css=load('foundation-course-v107.css');
 assert.match(css,/--result-ink:#256e4c/);
 assert.match(css,/--result-ink:#8a5d14/);
 assert.match(css,/--result-ink:#a4474d/);
});
test('v1.41 count setting stays inside question heading and result scope gets brief spotlight',()=>{
 const h=harness(),route='learn/training/foundation/hiragana/unit-1/hira/quiz';
 h.location.hash='#'+route;
 let html=h.ui.embeddedPractice();
 assert.match(html,/v37-head-meta[^"]*">[^]*class="v141-count-control"/);
 assert.doesNotMatch(html,/class="v140-count-picker"/);
 assert.match(html,/v141-custom-wrap" hidden/);
 h.changeCount('20');
 html=h.ui.embeddedPractice();
 assert.match(html,/Câu 1 \/ 20/);
 assert.equal(h.ui.session().questions.length,20);
 h.changeCount('custom',31);
 html=h.ui.embeddedPractice();
 assert.match(html,/Câu 1 \/ 31/);
 assert.match(html,/v141-custom-wrap"/);
 assert.match(html,/value="31"/);
 const css=load('foundation-course-v107.css');
 assert.match(css,/v141-count-control/);
 assert.match(css,/v141-custom-scope-hint/);
 const scope=load('learning-hub-v30.css');
 assert.match(scope,/v141-scope-filter-hint/);
});
test('v1.41 catalogue grades include readable labels and quiet semantic colors',()=>{
 const h=harness(),window={NPFoundationCurriculum:h.data,NPFoundationCourse:h.ui};
 const source=load('learning-hub-v25.js').replace(/\}\)\(\);\s*$/,'window.__cat=foundationModuleCatalogue;})();');
 runInNewContext(source,{window,document:{addEventListener(){}},location:{hash:'#learn/modules'},
  P:()=>({id:'demo-a'}),render:()=>{},learnPage:()=>'',coursePage:()=>'',titleOf:()=>'',icon:()=>'',Locale:{t:x=>x}});
 const db=h.ui.store();
 db.attemptRuns=[
  {id:'p',moduleId:'hiragana',unitId:'unit-1',script:'hira',kind:'practice',mode:'quiz',total:10,correct:8,percent:80,completedAt:'2026-11-07T00:00:00.000Z'},
  {id:'t',moduleId:'hiragana',unitId:'unit-1',script:'hira',kind:'test',mode:'mix',total:10,correct:9,percent:90,completedAt:'2026-11-08T00:00:00.000Z'},
  {id:'f',moduleId:'hiragana',unitId:'unit-2',script:'hira',kind:'test',mode:'mix',total:10,correct:6,percent:60,completedAt:'2026-11-08T01:00:00.000Z'}
 ];
 const html=window.__cat();
 assert.match(html,/v140-topic-badge is-complete is-grade-good/);
 assert.match(html,/v140-topic-badge is-attempted is-grade-retry/);
 assert.match(html,/Tốt · 90%/);
 assert.match(html,/Chưa đạt · 60%/);
 assert.match(html,/v141-history-grade is-good/);
 assert.match(html,/v141-history-grade is-retry/);
 const css=load('learning-hub-v30.css');
 assert.match(css,/v141-status-emblem/);
 assert.match(css,/is-grade-good/);
 assert.match(css,/is-grade-pass/);
 assert.match(css,/is-grade-retry/);
});
