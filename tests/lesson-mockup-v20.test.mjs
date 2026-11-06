import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const root=new URL('../source/public/',import.meta.url);
const read=file=>readFileSync(new URL(file,root),'utf8');
const ui=read('lesson-ui.js'),css=read('lesson-mockup.css');
const runtime=vm.createContext({window:{},console});
vm.runInContext(read('lesson-engine.js'),runtime,{filename:'lesson-engine.js'});
vm.runInContext(read('foundation-content.js'),runtime,{filename:'foundation-content.js'});
const E=runtime.window.NPLessonEngine,C=runtime.window.NP_FOUNDATION_CONTENT;
assert.ok(E&&C,'actual Foundation engine and content loaded');

const hStart=ui.indexOf('  function kanaReading(');
const hEnd=ui.indexOf('  function startOptions(',hStart);
assert.ok(hStart>=0&&hEnd>hStart);
const helpers=ui.slice(hStart,hEnd);
const actionStart=ui.indexOf("      if(action==='reading'){");
const actionEnd=ui.indexOf("      if(action==='pause')",actionStart);
const checkStart=ui.indexOf("      if(action==='check'){");
const checkEnd=ui.indexOf('\n',checkStart);
assert.ok(actionStart>=0&&actionEnd>actionStart&&checkStart>=0);
const readingAction=ui.slice(actionStart,actionEnd);
const checkAction=ui.slice(checkStart,checkEnd);
const map={vi:{show:'Hiện cách đọc',hide:'Ẩn cách đọc'},en:{show:'Show reading',hide:'Hide reading'},ja:{show:'読み方を表示',hide:'読み方を隠す'}};
function questionSession(){
 const state=E.create('learner-pilot'),s=E.start(state,C,{minutes:5,reading:'show',random:()=>.3});
 for(let i=0;i<10&&E.unit(s)?.type!=='question';i++)E.advance(state);
 assert.equal(E.unit(s)?.type,'question');
 return {state,s,q:E.definition(s,E.unit(s).questionId)};
}
function driver(state,language='en'){
 const context=vm.createContext({
  E,state,s:E.active(state),
  Locale:{code:language,ui:key=>{
   if(key==='lesson.mockup.readShow')return map[language].show;
   if(key==='lesson.mockup.readHide')return map[language].hide;
   throw Error('unexpected locale key '+key);
  }},
  icon:()=>'',b:(label,action,cls,s,attributes)=>'<button data-action="n5-'+action+'" '+attributes+'>'+label+'</button>'
 });
 vm.runInContext(helpers,context,{filename:'lesson-reading-helpers.js'});
 const visible=()=>vm.runInContext('visibleReading(s)',context);
 const reading=()=>vm.runInContext('kanaReading(s,E.unit(s),E.definition(s,E.unit(s).questionId))',context);
 const button=()=>vm.runInContext('readingButton(s)',context);
 const toggle=vm.runInContext('(function(state){const action="reading";'+readingAction+'})',context);
 const check=vm.runInContext('(function(state){const action="check";'+checkAction+'})',context);
 return {context,visible,reading,button,toggle:()=>toggle(state),check:()=>check(state)};
}
test('Hiragana has no ruby mapping but the user-visible reading is resolved correctly',()=>{
 assert.deepEqual(Object.keys(C.readings),[]);
 const {state,s,q}=questionSession(),d=driver(state);
 assert.ok(q.stimulus.includes('あ')||/^[あいうえお]$/.test(q.stimulus));
 const expected=C.concepts.find(c=>c.questionId===q.id)?.reading;
 assert.equal(d.reading(),expected);
 assert.equal(d.visible(),false,'check begins hidden despite inherited Learn preference');
 assert.match(d.button(),/aria-pressed="false"/);
 assert.match(d.button(),/Show reading/);
});
test('Explicitly showing reading in an unanswered check records a hint, and hiding cannot erase it',()=>{
 const {state,s,q}=questionSession(),d=driver(state);
 d.toggle();
 assert.equal(s.reading,'show');
 assert.equal(s.current.hintUsed,true);
 assert.equal(d.visible(),true);
 assert.match(d.button(),/aria-pressed="true"/);
 assert.match(d.button(),/Hide reading/);
 d.toggle();
 assert.equal(s.reading,'hide');
 assert.equal(d.visible(),false);
 assert.equal(s.current.hintUsed,true);
 E.select(state,q.answer);
 const attempt=d.check();
 assert.equal(attempt.correct,true);
 assert.equal(attempt.hintUsed,true);
 assert.equal(attempt.readingShown,false);
 const summary=E.summary(state,s.id);
 assert.equal(summary.independent.length,0);
 assert.equal(summary.supported.length,1);
});
test('A correct answer without revealing reading is independent, not falsely marked as helped',()=>{
 const {state,s,q}=questionSession(),d=driver(state);
 assert.equal(s.reading,'show','inherited preference is initially show');
 assert.equal(d.visible(),false,'question overrides inherited show');
 E.select(state,q.answer);
 const attempt=d.check();
 assert.equal(attempt.correct,true);
 assert.equal(attempt.hintUsed,false);
 assert.equal(attempt.readingShown,false);
 assert.equal(s.reading,'hide');
 const summary=E.summary(state,s.id);
 assert.equal(summary.independent.length,1);
 assert.equal(summary.supported.length,0);
});
test('Reading controls are translated across locales and do not expose the answer in hidden DOM',()=>{
 for(const language of ['vi','en','ja']){
  const {state,s}=questionSession(),d=driver(state,language);
  assert.ok(d.button().includes(map[language].show));
  assert.ok(!d.button().includes(map[language].hide));
  d.toggle();assert.ok(d.button().includes(map[language].hide));
 }
 assert.match(ui,/const kanaCue=reading&&showReading/);
 assert.match(ui,/const readingNotice=reading&&s.current.hintUsed/);
 assert.match(ui,/data-reading="\$\{visibleReading\(s,u\)\?'show':'hide'\}"/);
});
test('Mockup follows seasonal art and faithful three-panel desktop composition',()=>{
 const html=read('index.html');
 assert.ok(html.includes('href="lesson-mockup.css?v=20"'));
 assert.ok(html.includes('src="lesson-ui.js?v=22"'));
 assert.ok(html.includes('src="i18n/ui-pack.js?v=20"'));
 assert.ok(css.includes('assets/lesson-sakura-branch.svg'));
 assert.ok(css.includes('assets/lesson-enso-sakura.svg'));
 for(const file of ['assets/lesson-sakura-branch.svg','assets/lesson-enso-sakura.svg'])
  assert.ok(read(file).startsWith('<svg'));
 for(const fragment of ['.n5-side-progress','.n5-side-outline','.n5-side-quick',
  '.n5-mockup-step-rail','.n5-stage-footer',
  '@media(max-width:720px)','data-choice-count="3"','prefers-reduced-motion'])
  assert.ok(css.includes(fragment)||ui.includes(fragment),fragment);
 assert.ok(ui.includes("first=state.attempts.filter(a=>a.sessionId===s.id&&a.kind!=='repair')"));
 assert.ok(ui.includes('a.correct&&!a.hintUsed'));
 assert.ok(ui.includes("s.completedUnits.map(item=>typeof item==='string'?item:item.id)"));
});
test('Mobile question dock and reading toggles preserve keyboard focus and original answer actions',()=>{
 const interaction=read('lesson-interaction.js');
 assert.ok(interaction.includes("const source=el.querySelector('.n5-step-actions')"));
 assert.ok(interaction.includes("if(action==='reading'){"));
 assert.ok(interaction.includes("document.querySelector('.n5-hero-reading [data-action="));
 assert.ok(interaction.includes('preventScroll:true'));
 assert.ok(css.includes('.n5-question-docked .n5-player-mockup .n5-stage-footer .n5-step-actions{display:none!important}'));
 assert.ok(ui.includes("if(action==='select'){E.select(state,el.dataset.option);const s=E.active(state);"));
 assert.ok(ui.includes("if(action==='next')return E.advance(state"));
});
