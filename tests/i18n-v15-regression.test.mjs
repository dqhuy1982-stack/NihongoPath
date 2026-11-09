import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const root=new URL('../source/public/',import.meta.url);
const read=file=>readFileSync(new URL(file,root),'utf8');
const lesson=read('lesson-ui.js'),season=read('season-system.js'),
      app=read('app.js'),css=read('season-shell.css'),
      coverage=read('locale-coverage.js'),page=read('index.html');

function pilot(locale,minutes=15){
  const i=lesson.indexOf('  function advice(p){'),
        j=lesson.indexOf('\n  function focusAfter(',i);
  assert.ok(i>=0&&j>i,'actual advice implementation exists');
  const fn=lesson.slice(i,j);
  const context=vm.createContext({
    Locale:{register:(vi,en,ja)=>({vi,en,ja})[locale],t:x=>x},
    isPreview:()=>false,baseline:()=>false,
    read:()=>({sessions:[],lastAnswerAt:null}),
    E:{pending:()=>[],due:()=>[]},
    NPAdvicePolicy:{normalize:()=> 'adaptive'},
    context:()=>({minutes}),
    Date
  });
  vm.runInContext(fn,context,{filename:'lesson-ui.js'});
  return vm.runInContext('advice({goal:"N5",prefs:{studyPriority:"adaptive"},examSessions:{}})',context);
}

test('Real Michi/N5 Study Guide text is generated correctly in VI, EN, and JA',()=>{
 const vi=pilot('vi'),en=pilot('en'),ja=pilot('ja');
 assert.equal(vi.title,'Bắt đầu bằng một lời giới thiệu.');
 assert.equal(en.title,'Start with a self-introduction.');
 assert.equal(ja.title,'自己紹介から始めましょう。');
 assert.match(en.body,/15 minutes/);
 assert.match(ja.body,/15分/);
 assert.doesNotMatch(en.body,/Bạn chọn|Dành .* phút/);
 assert.doesNotMatch(ja.body,/Bạn chọn|Dành .* phút/);
 assert.match(en.reason,/No proficiency evidence/);
 assert.match(ja.reason,/習熟度/);
 assert.equal(en.cta,'Begin · 15 min');
 assert.equal(ja.cta,'始める・15分');
 const short=pilot('en',3);
 assert.match(short.body,/3 minutes/);
 assert.equal(short.cta,'Begin · 3 min');
});

test('Season selector reads lexical Locale not just window.Locale and follows locale event',()=>{
 const events={};
 const storage=new Map([['np-home-season-v1','spring']]);
 const state={
  body:{dataset:{},classList:{toggle(){}}},
  documentElement:{dataset:{}},
  querySelectorAll(selector){return selector==='[data-inner-season-toggle]'?[this.toggle]:[]},
  toggle:{innerHTML:'',labels:{},setAttribute(k,v){this.labels[k]=v}},
  addEventListener(k,f){events[k]=f}
 };
 const context=vm.createContext({
  document:state,window:{addEventListener(){}},
  localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},
  queueMicrotask:fn=>fn()
 });
 // const Locale in the global lexical scope is intentionally not window.Locale.
 vm.runInContext("const Locale={code:'en'};\n"+season,context,{filename:'season-system.js'});
 let label=vm.runInContext('window.NPSeason.label()',context);
 assert.equal(label,'Spring');
 vm.runInContext("Locale.code='ja'",context);
 events['np:localechange']?.();
 assert.equal(vm.runInContext('window.NPSeason.label()',context),'春');
 assert.match(state.toggle.innerHTML,/春/);
 vm.runInContext("Locale.code='vi'",context);
 events['np:localechange']?.();
 assert.equal(vm.runInContext('window.NPSeason.label()',context),'Xuân');
});

test('Account menu uses translated action labels, including lock and switch',()=>{
 assert.match(app,/['"]Khóa hồ sơ \/ Đổi người học['"]/);
 assert.match(app,/data-close-link>\$\{icon\(i\)\}\$\{Locale\.t\(l\)\}/);
 assert.match(coverage,/Khóa hồ sơ \/ Đổi người học/);
 assert.match(coverage,/Lock profile \/ Switch learner/);
 assert.match(coverage,/プロフィールをロック/);
});

test('Sidebar slogan has a single locale-specific short phrase and cannot clip',()=>{
 assert.match(app,/Locale\.register\('Từng bước\.','One step\.','一歩ずつ。'\)/);
 assert.match(app,/class="sidebar-moment" aria-hidden="true" data-no-translate/);
 assert.ok(css.includes('white-space:normal!important'));
 assert.ok(css.includes('word-break:keep-all!important'));
 assert.ok(css.includes('max-width:100%!important'));
 assert.ok(css.includes('letter-spacing:.01em!important'));
 assert.ok(css.includes('font-size:18px!important'));
});

test('Language change rebuilds Dashboard content but protects unsaved forms',()=>{
 assert.ok(app.includes("document.addEventListener('np:localechange',()=>{"));
 assert.ok(app.includes('Boolean(settingsDirty||'));
 assert.ok(app.includes('Locale.translate(document);'));
 assert.ok(app.includes('render(false);'));
 assert.ok(app.includes('window.NPSeason?.sync();'));
 assert.ok(app.includes('preventScroll:true'));
});

test('Versioned site files load the patched sources, not stale cached scripts',()=>{
 for(const file of ['app.js?v=149','lesson-ui.js?v=32','season-system.js?v=15','locale-coverage.js?v=15'])
  assert.ok(page.includes('src="'+file+'"'),file);
 assert.ok(page.includes('href="season-shell.css?v=15"'));
});
