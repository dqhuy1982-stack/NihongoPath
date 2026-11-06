import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const root=new URL('../source/public/',import.meta.url);
const read=p=>readFileSync(new URL(p,root),'utf8');
const app=read('app.js'),lesson=read('lesson-ui.js'),packSrc=read('i18n/ui-pack.js');
const packCtx=vm.createContext({NP_LOCALE_ROWS:[]});
vm.runInContext(packSrc,packCtx,{filename:'i18n/ui-pack.js'});
const messages=vm.runInContext('NP_UI_PACK',packCtx);

function locale(language){
 return {
  code:language,
  ui(key,args={}){
   assert.ok(messages[key], 'Missing UI key: '+key);
   const value=messages[key][language];
   assert.equal(typeof value,'string');
   return value.replace(/\{(\w+)\}/g,(s,name)=>Object.prototype.hasOwnProperty.call(args,name)?String(args[name]):s);
  },
  t:t=>t
 };
}
function region(src,begin,end){
 const i=src.indexOf(begin),j=src.indexOf(end,i+begin.length);
 assert.ok(i>=0&&j>i,begin+' region found');
 return src.slice(i,j);
}
const base={
 icon:()=>'',cardIcon:()=>'',badge:(s)=>s,button:(text)=>text,
 link:(text)=>text,heading:(title,subtitle,eyebrow,action='')=>'<header>'+title+'|'+subtitle+'|'+eyebrow+'|'+action+'</header>',
 esc:s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;'),
 empty:(title,desc,icon,action)=>title+desc+action
};
function reviewHTML(language,withLessonReview){
 const ctx=vm.createContext({
  ...base,Locale:locale(language),
  getMistakes:()=>[],michiCard:text=>'<aside>Michi: '+text+'</aside>'
 });
 vm.runInContext(region(app,'function legacyReviewPage(','const hira=['),ctx);
 return vm.runInContext('legacyReviewPage('+Boolean(withLessonReview)+')',ctx);
}
function reviewPanelHTML(language){
 const ctx=vm.createContext({
  ...base,Locale:locale(language),
  read:()=>({reviews:[]}),
  E:{due:()=>[],pending:()=>[]},
  errorBox:()=>'<p>error</p>',
  definitionFor:()=>null,
  date:x=>x
 });
 vm.runInContext(region(lesson,'  function reviewPanel(){','\n  function reportPanel(){'),ctx);
 return vm.runInContext('reviewPanel()',ctx);
}
const sampleNote={
 type:'note',title:'Nhóm Hiragana dễ nhầm',
 body:'Ôn nhận diện は・ま・ら và âm ghép; luyện phản xạ trước khi vào N5.',
 source:'Gợi ý thử giao diện · demo',id:'note-example',at:'2026-11-05T00:00:00Z'
};
function journalHTML(language,withNotes=true){
 const context=vm.createContext({
  ...base,Locale:locale(language),
  P:()=>({name:'Quang Huy',notes:withNotes?[sampleNote]:[]}),
  noteTypes:{note:'Ghi chú',word:'Từ vựng',sentence:'Câu đã lưu',
             exercise:'Bài tập',mistake:'Lỗi cần ôn',summary:'Tổng kết',next:'Bước tiếp theo'},
  noteQuery:'',noteFilter:'all',noteList:null,
  normalize:s=>String(s).toLowerCase()
 });
 vm.runInContext(region(app,'function noteList()','function editorNote('),context);
 const notebook=vm.runInContext('notebookPage()',context);
 return {notebook,notes:vm.runInContext('noteList()',context)};
}
test('The standalone UI language pack is complete, three-language, and uniquely keyed',()=>{
 assert.ok(Object.keys(messages).length>=60);
 const ids=Object.keys(messages);
 assert.equal(ids.length,new Set(ids).size);
 for(const [key,message] of Object.entries(messages)){
  assert.match(key,/^(review|journal|profile|settings|map|reports|kana|foundation|lesson)\.[a-zA-Z0-9.]+$/);
  assert.equal(Object.keys(message).sort().join(','),'en,ja,vi',key);
  for(const [lang,text] of Object.entries(message)){
   assert.equal(typeof text,'string',key+' '+lang);
   assert.ok(text.trim(),key+' '+lang);
   assert.deepEqual([...text.matchAll(/\{(\w+)\}/g)].map(x=>x[1]).sort(),
                    [...message.vi.matchAll(/\{(\w+)\}/g)].map(x=>x[1]).sort(),key+' placeholders');
  }
 }
 const src=[app,lesson].join('\n');
 for(const [,key] of src.matchAll(/Locale\.ui\('([^']+)'/g)){
  if(key.endsWith('.'))continue; // dynamic journal.type.<type> validated by route tests
  assert.ok(messages[key],key);
 }
});

test('Review screen is truly English/Japanese, even with dynamic N5 review panel',()=>{
 for(const [lang,words] of [
  ['en',['A little review. Just what you need.','Mistakes to review',
         'Review incorrect answers','Open activity','Open first lesson',
         'Learn one pattern, then revisit it tomorrow.']],
  ['ja',['必要なところを、少しずつ復習。','見直したい間違い',
         '不正解だった問題','練習を開く','最初のレッスンを開く',
         '文型を一つ学び、明日また復習しましょう。']]
 ]){
  const html=reviewHTML(lang,true)+'\n'+reviewPanelHTML(lang);
  for(const label of words)assert.ok(html.includes(label),lang+': '+label);
  assert.doesNotMatch(html,/Học một mẫu|Sau bài đầu tiên|Xem câu chưa đúng|Nếu chưa có lịch sử|Theo nhịp của bạn|Mở bài đầu tiên/);
 }
});

test('Legacy review empty state also honors selected UI locale',()=>{
 assert.ok(reviewHTML('en',false).includes('Try a sample quiz'));
 assert.ok(reviewHTML('ja',false).includes('サンプル問題'));
 assert.ok(reviewHTML('vi',false).includes('Làm bài kiểm tra mẫu'));
});

test('Journal search/filters/buttons are localized, while learner notes remain unchanged',()=>{
 for(const [lang,labels] of [
  ['en',["Quang Huy’s journal",'Search your journal…',
         'All entry types','Export demo data','Source:','Edit','Delete demo entry']],
  ['ja',['Quang Huyさんの学習ノート','学習ノートを検索…',
         'すべての項目','体験データを書き出す','出典：','編集','体験項目を削除']]
 ]){
  const {notebook,notes}=journalHTML(lang);
  for(const str of labels)assert.ok((notebook+notes).includes(str),lang+': '+str);
  assert.ok(notes.includes('<h3 data-no-translate>Nhóm Hiragana dễ nhầm</h3>'));
  assert.ok(notes.includes('Ôn nhận diện は・ま・ら và âm ghép'));
  assert.ok(notes.includes('Gợi ý thử giao diện · demo'));
  assert.doesNotMatch(notebook,/Tìm trong sổ của bạn|Tất cả loại mục|SỔ HỌC TẬP|Xuất dữ liệu thử/);
 }
});

test('Empty Journal state and editor controls are translated, with no note value rewrites',()=>{
 for(const lang of ['en','ja','vi']){
  const {notes}=journalHTML(lang,false);
  assert.ok(notes.includes(messages['journal.emptyHeading'][lang]));
  assert.ok(notes.includes(messages['journal.emptyAction'][lang]));
 }
 const editor=region(app,'function editorNote(','function addNote(');
 for(const item of ['journal.editor.type','journal.editor.title','journal.editor.body',
                    'journal.editor.source','journal.editor.save','journal.editor.cancel']){
  assert.ok(editor.includes(item),item);
 }
 assert.ok(editor.includes('esc(n.title)'));
 assert.ok(editor.includes('esc(n.body)'));
 assert.ok(editor.includes('esc(n.source)'));
 assert.ok(read('i18n/README.md').includes('data-no-translate'));
});

test('Locale engine has keyed access and language change is propagated to routes',()=>{
 const runtime=read('locales.js');
 assert.ok(runtime.includes('function ui(id,params={})'));
 assert.ok(runtime.includes('missingUIKeys:()=>[...missingUIKeys]'));
 assert.ok(runtime.includes("np:localechange"));
 assert.ok(app.includes("document.addEventListener('np:localechange'"));
 assert.ok(app.includes("'review'"));
 assert.ok(app.includes("'notebook'"));
});
test('All UI pack resources load before runtime and route modules',()=>{
 const html=read('index.html');
 const ui=html.indexOf('src="i18n/ui-pack.js?v=20"');
 assert.ok(ui>=0);
 assert.ok(ui<html.indexOf('src="locales.js?v=16"'));
 assert.ok(html.includes('src="app.js?v=18"'));
 assert.ok(html.includes('src="lesson-ui.js?v=22"'));
});
