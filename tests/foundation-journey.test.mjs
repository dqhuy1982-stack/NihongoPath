import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const root=new URL('../source/public/',import.meta.url);
const read=file=>readFileSync(new URL(file,root),'utf8');
const html=read('index.html'),js=read('foundation-journey.js'),
      css=read('foundation-journey.css'),app=read('app.js');
const bundle=vm.createContext({NP_LOCALE_ROWS:[]});
vm.runInContext(read('i18n/ui-pack.js'),bundle,{filename:'i18n/ui-pack.js'});
const messages=vm.runInContext('NP_UI_PACK',bundle);

function page(code){
 const context=vm.createContext({window:{},Locale:{
  code,ui:(key,args={})=>{
   assert.ok(messages[key],'Missing UI key '+key);
   return messages[key][code].replace(/\{(\w+)\}/g,(_,k)=>String(args[k]??'{'+k+'}'));
  }
 }});
 vm.runInContext(js,context,{filename:'foundation-journey.js'});
 return {html:vm.runInContext('window.NPFoundationJourney.page()',context),
         units:vm.runInContext('window.NPFoundationJourney.units()',context)};
}
test('Foundation is a connected course with actual Learn, Practice, Check links',()=>{
 const out=page('vi');
 const content=out.html;
 assert.ok(content.includes('href="#lesson/foundation-vowels"'),'learn existing vowel lesson');
 assert.ok(content.includes('href="#kana"'),'practice existing Studio');
 assert.ok(content.includes('href="#kana/check"'),'independent existing Recall Lab');
 assert.ok(content.includes('href="#course/N5"'),'optional N5 bridge');
 assert.ok(content.includes('href="#review"'),'review route retained');
 assert.equal((content.match(/class="fj-stage fj-stage-/g)||[]).length,3);
 assert.equal(out.units.length,9);
 assert.ok(content.includes('href="#lesson/foundation-k-row"'),'new K-row lesson is available');
 assert.deepEqual(Array.from(out.units.map(x=>x.code)),['F01','F01B','F01C','F01D','F02','F03','F04','F05','F06']);
 assert.ok(content.includes('chưa có đánh giá tổng hợp Foundation'));
 assert.ok(!content.includes('100%'));
 assert.ok(!content.includes('Đã hoàn thành'));
});
test('All journey UI headings and actions are localized, and Japanese glyphs stay unchanged',()=>{
 const en=page('en').html,ja=page('ja').html;
 for(const text of ['First connected journey preview','Open Writing Studio','Start recognition check','Explore N5 path','not yet assessed'])
  assert.ok(en.includes(text),text);
 for(const text of ['学習ジャーニーの初期版','Writing Studioを開く','認識チェックを始める','N5の学習プランを見る','未評価'])
  assert.ok(ja.includes(text),text);
 for(const out of [en,ja]) {
  assert.ok(out.includes('あ・い・う・え・お'));
  assert.ok(out.includes('data-foundation-unit="F01"'));
  assert.ok(out.includes('data-foundation-unit="F06"'));
  assert.ok(!out.includes('Học năm nguyên âm'));
  assert.ok(!out.includes('Đang biên soạn'));
 }
});
test('UI pack has consistent language placeholders for new Foundation namespace',()=>{
 const entries=Object.entries(messages).filter(([k])=>k.startsWith('foundation.'));
 assert.ok(entries.length>=35);
 for(const [name,row] of entries){
  assert.equal(Object.keys(row).sort().join(','),'en,ja,vi');
  for(const text of Object.values(row))assert.ok(text.trim(),name);
 }
});
test('Foundation route preserves original Studio, Recall Lab and learning data contracts',()=>{
 assert.ok(app.includes("if(id==='foundation'&&window.NPFoundationJourney)"));
 assert.ok(app.includes("if(r==='kana/check')requestAnimationFrame(()=>window.NPKanaRecall?.open())"));
 assert.ok(app.includes("if(r==='kana/check')return 'learn'"));
 assert.ok(read('kana-recall.js').includes('window.NPKanaRecall={open,stats:'));
 assert.ok(read('kana-studio.js').includes('window.NPKanaStudio={page,mount,flush:'));
 assert.ok(!js.includes('localStorage.setItem'));
 assert.ok(!js.includes('resetPin'));
 assert.ok(!js.includes('db.profiles'));
});
test('Site loads route modules and CSS in an appropriate versioned order',()=>{
 assert.ok(html.includes('href="foundation-journey.css?v=18"'));
 assert.ok(html.indexOf('foundation-journey.css?v=18')>html.indexOf('season-shell.css?v=15'));
 assert.ok(html.includes('src="foundation-journey.js?v=32"'));
 assert.ok(html.includes('src="app.js?v=111"'));
 assert.ok(html.includes('src="i18n/ui-pack.js?v=32"'));
 assert.ok(html.indexOf('src="i18n/ui-pack.js?v=32"')<html.indexOf('src="foundation-journey.js?v=32"'));
 assert.ok(css.includes('@media(max-width:620px)'));
 assert.ok(css.includes('prefers-reduced-motion:reduce'));
 assert.ok(css.includes('outline:2px solid'));
 assert.ok(!css.includes('overflow-y:hidden!important'));
});
