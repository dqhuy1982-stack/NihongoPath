import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const root=new URL('../source/public/',import.meta.url);
const read=name=>readFileSync(new URL(name,root),'utf8');
const lesson=read('lesson-ui.js'),css=read('lesson-compact.css'),index=read('index.html');
const dictContext=vm.createContext({NP_LOCALE_ROWS:[]});
vm.runInContext(read('i18n/ui-pack.js'),dictContext);
const dict=vm.runInContext('NP_UI_PACK',dictContext);
const start=lesson.indexOf('  function question(state,s,u){');
const end=lesson.indexOf('  function resultPage(state,id){',start);
assert.ok(start>=0&&end>start,'Original question, session outline, and player are present');
const helpers=lesson.slice(lesson.indexOf('  function kanaReading('),lesson.indexOf('  function startOptions('));
assert.ok(helpers.includes('function visibleReading('));
const playerSource=helpers+'\n'+lesson.slice(start,end);

function harness(language='vi',source='foundation'){
 const kana=source==='foundation';
 const question={
  id:'q-a',type:'choice',prompt:'Chữ あ ứng với cách đọc nào?',stimulus:'あ',
  options:[
   {id:'a',text:'a',why:'Đúng: あ được ghi bằng romaji là a.'},
   {id:'i',text:'i',why:'Đây là âm của い, không phải あ.'},
   {id:'u',text:'u',why:'Đây là âm của う, không phải あ.'},
   {id:'e',text:'e',why:'Đây là âm của え, không phải あ.'}
  ],answer:'a',hint:'Đối chiếu mẫu vừa học: あ → a',
  explanation:'あ → a. Hãy thử nhớ lại ở lượt ôn sau; một lần đúng chưa đủ kết luận đã thuộc.'
 };
 const units=[
  {id:'u1',type:'learn',cardId:'a',label:'Làm quen'},
  {id:'u2',type:'learn',cardId:'a',label:'Nghe và nhận diện'},
  {id:'u3',type:'learn',cardId:'a',label:'Ghi nhớ hình dạng'},
  {id:'u4',type:'question',questionId:'q-a',label:'Nhớ chữ あ',optionOrder:['i','a','u','e']},
  {id:'u5',type:'learn',cardId:'a',label:'Luyện thêm'},
  {id:'u6',type:'question',questionId:'q-a',label:'Kiểm tra nhanh',optionOrder:['u','e','a','i']}
 ];
 const session={
  id:'session-1',mode:'lesson',reading:'hide',contentId:kana?'foundation-vowels':'n5-introduction',
  contentVersion:1,index:3,completedUnits:[{id:'u1'},{id:'u2'},{id:'u3'}],units,current:{
   selected:null,order:[],hintUsed:false,feedbackId:null
  },
  definition:{id:kana?'foundation-vowels':'n5-introduction',level:'Nền tảng',title:'Năm chữ đầu tiên: あ・い・う・え・お',
    concepts:[{id:'kana-a',questionId:'q-a',reading:'a'}],cards:{a:{title:'Nhận mặt chữ あ',example:'あ',meaning:'Cách đọc theo romaji: a',
    pattern:'あ → a',points:[],pitfall:''}},story:[]}
 };
 const state={attempts:[],sessions:[session]};
 const locale={
  code:language,ui:(key,params={})=>{
   const entry=dict[key];
   assert.ok(entry,'Unknown compact UI key '+key);
   return entry[language].replace(/\{(\w+)\}/g,(_,k)=>String(params[k]??'{'+k+'}'));
  },
  t:x=>String(x)
 };
 const ctx=vm.createContext({
  Locale:locale,E:{
   unit:s=>s.units[s.index],
   definition:()=>question,
   repairOffer:()=>null,
   canCheck:s=>Boolean(s.current.selected)
  },
  catalog:{base:{id:'n5-introduction'}},
  esc:x=>String(x??'').replace(/&/g,'&amp;').replace(/</g,'&lt;'),
  icon:()=>'',jp:text=>'<span class="n5-jp"><span lang="ja">'+text+'</span></span>',
  link:(label,to)=>'<a href="#'+to+'">'+label+'</a>',
  b:(label,action,cls='btn',_s,attrs='')=>'<button type="button" class="'+cls+
    '" data-action="n5-'+action+'" '+attrs+'>'+label+'</button>',
  wrap:(_state,text)=>'<div class="n5-reader">'+text+'</div>',
  readingButton:()=>'<button data-action="n5-reading">Reading</button>',
  statusLine:()=>'<p>Saved locally</p>',
  personal:()=>'<div>Personal practice</div>',
  resultPage:()=>'<div>Results</div>'
 });
 vm.runInContext(playerSource,ctx,{filename:'lesson-ui.js'});
 const render=()=>vm.runInContext('player(state,session)',Object.assign(ctx,{state,session}));
 return {state,session,question,render};
}

test('Compact layout retains one real question and action, honest step count, session pause',()=>{
 const {render}=harness();
 const html=render();
 assert.ok(html.includes('class="n5-player-compact n5-player-mockup"'));
 assert.ok(html.includes('class="n5-session-hero"'));
 assert.ok(html.includes('class="n5-player-grid"'));
 assert.ok(html.includes('class="card n5-stage"'));
 assert.ok(html.includes('class="n5-player-aside n5-mockup-side"'));
 assert.ok(html.includes('data-question="true"'));
 assert.ok(html.includes('aria-valuenow="3"'));
 assert.ok(html.includes('aria-valuemax="6"'));
 assert.ok(html.includes('3 / 6 bước'));
 assert.ok(html.includes('data-action="n5-pause"'));
 assert.ok(html.includes('data-action="n5-check"'));
 assert.ok(html.includes('disabled'));
 assert.equal((html.match(/data-action="n5-select"/g)||[]).length,4);
 assert.ok(html.includes('data-compact-choices="true"'));
 assert.ok(!html.includes('100% đúng'));
 assert.ok(!html.includes('Đã thuộc chữ'));
});
test('Selected option and feedback appear without mutating learning schema',()=>{
 const x=harness();
 x.session.current.selected='a';
 let html=x.render();
 assert.ok(html.includes('n5-option selected'));
 assert.ok(html.includes('data-action="n5-check"'));
 assert.ok(!html.includes('data-action="n5-check" disabled'));
 x.session.current.feedbackId='attempt-1';
 x.state.attempts.push({id:'attempt-1',selected:'a',correct:true,hintUsed:false});
 html=x.render();
 assert.ok(html.includes('n5-feedback good'));
 assert.ok(html.includes('data-action="n5-next"'));
 assert.match(html,/n5-option[^\"]*correct/);
 assert.equal(x.session.completedUnits.length,3);
});
test('Three-language lesson controls and progress counters are rendered from one UI pack',()=>{
 const expected=[
  ['vi','Tiến độ bài học','3 / 6 bước','Câu 1/2'],
  ['en','Lesson progress','3 / 6 steps','Question 1/2'],
  ['ja','レッスンの進捗','3 / 6 ステップ','問題 1/2']
 ];
 for(const [language,...labels] of expected){
  const html=harness(language).render();
  for(const label of labels)assert.ok(html.includes(label),language+': '+label);
  assert.ok(html.includes('あ'));
  assert.ok(html.includes('aria-current="step"'));
 }
});
test('Non-question step stays readable and preserves existing next action',()=>{
 const h=harness();h.session.index=1;
 const html=h.render();
 assert.ok(html.includes('data-question="false"'));
 assert.ok(html.includes('data-action="n5-next"'));
 assert.ok(!html.includes('data-compact-choices="true"'));
});
test('Long N5 choices stay single-column and answer groups preserve keyboard feedback',()=>{
 const h=harness('en','n5');
 h.question.options[0].text='わたしは会社員です。よろしくお願いします。';
 const html=h.render();
 assert.ok(html.includes('data-compact-choices="false"'));
 assert.ok(css.includes('.n5-player-compact[data-compact-choices="true"] .n5-options'));
 assert.ok(css.includes('.n5-player-compact .n5-option:focus-visible') ||
   read('lesson.css').includes('.n5-option:focus-visible'));
 assert.ok(css.includes('.n5-player-compact .n5-option.correct'));
 assert.ok(css.includes('.n5-player-compact .n5-option.incorrect'));
 assert.ok(css.includes('.n5-player-compact .n5-option.selected'));
});
test('Desktop column, narrower breakpoints and existing mobile action dock remain supported',()=>{
 assert.ok(css.includes('grid-template-columns:minmax(0,1fr) minmax(235px,28%)'));
 assert.ok(css.includes('@media(max-width:900px)'));
 assert.ok(css.includes('.n5-player-aside{display:none}'));
 assert.ok(css.includes('@media(max-width:767px)'));
 assert.ok(css.includes('prefers-reduced-motion:reduce'));
 const actions=read('lesson-interaction.js');
 assert.ok(actions.includes("document.body.classList.toggle('n5-question-docked'"));
 assert.ok(actions.includes("const source=el.querySelector('.n5-step-actions')"));
 assert.ok(lesson.includes("if(action==='select'){E.select(state,el.dataset.option);const s=E.active(state);"));
 assert.ok(lesson.includes("if(action==='check'){const s=E.active(state)"));
 assert.ok(lesson.includes("if(action==='next')return E.advance(state"));
});
test('Lesson player styles are the last cascade layer and do not replace lesson storage',()=>{
 assert.ok(index.includes('href="lesson-compact.css?v=19.1"'));
 assert.ok(index.includes('src="i18n/ui-pack.js?v=31"'));
 assert.ok(index.includes('src="lesson-ui.js?v=31"'));
 assert.ok(index.includes('href="lesson-mockup.css?v=20"'));
 assert.ok(index.indexOf('href="lesson-mockup.css?v=20"')>
   index.indexOf('href="foundation-journey.css?v=18"'));
 assert.ok(lesson.includes("html.includes('n5-player-compact')"));
 assert.ok(!playerSource.includes('localStorage.setItem'));
 assert.ok(!playerSource.includes('S.write('));
});
