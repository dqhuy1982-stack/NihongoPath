import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const root=new URL('../source/public/',import.meta.url);
const read=name=>readFileSync(new URL(name,root),'utf8');
const base=read('locale-data.js');
const extended=read('locale-coverage.js');
const engine=read('locales.js');
const page=read('index.html');

function harness(){
 const storage=new Map();
 const events=[];
 const handlers=new Map();
 const localeButtons=['vi','en','ja'].map(code=>({dataset:{locale:code},attrs:{},setAttribute(key,value){this.attrs[key]=value}}));
 const switcher={attrs:{},setAttribute(key,value){this.attrs[key]=value}};
 const text=(value,skip=false)=>({
   nodeValue:value,
   parentElement:{tagName:'DIV',closest(selector){return skip&&selector.includes('[data-no-translate]')?{}:null}}
 });
 const regular=text('Hôm nay');
 const paragraph=text('Nghe âm, xem từng nét, rồi tự viết.');
 const note=text('Hôm nay',true);
 const attr={
   attrs:{'aria-label':'Ngôn ngữ giao diện','placeholder':'Tìm trong sổ của bạn…'},
   closest(){return null},
   hasAttribute(k){return k in this.attrs},
   getAttribute(k){return this.attrs[k]},
   setAttribute(k,v){this.attrs[k]=v}
 };
 const nodes=[regular,paragraph,note];
 let pointer=0;
 const document={
   title:'Hôm nay · HORIZON',
   documentElement:{lang:'vi'},
   createTreeWalker(){pointer=0;return {nextNode(){return nodes[pointer++]||null}}},
   querySelectorAll(selector){
     if(selector==='[data-locale]')return localeButtons;
     if(selector==='.language-switch')return [switcher];
     if(selector.includes('[aria-label]'))return [attr];
     return [];
   },
   addEventListener(event,fn){const v=handlers.get(event)||[];v.push(fn);handlers.set(event,v)},
   dispatchEvent(e){events.push(e);for(const fn of handlers.get(e.type)||[])fn(e)}
 };
 const localStorage={
   getItem(key){return storage.get(key)||null},
   setItem(key,v){storage.set(key,v)}
 };
 class CustomEvent{constructor(type,props){this.type=type;this.detail=props.detail}}
 const context=vm.createContext({document,localStorage,CustomEvent,NodeFilter:{SHOW_TEXT:4},console});
 vm.runInContext(base,context,{filename:'locale-data.js'});
 vm.runInContext(extended,context,{filename:'locale-coverage.js'});
 vm.runInContext(engine,context,{filename:'locales.js'});
 const Locale=vm.runInContext('Locale',context);
 return {Locale,document,storage,events,regular,paragraph,note,attr,switcher,localeButtons};
}

test('Complete dictionary loads before switcher and the HTML uses versioned JS',()=>{
 assert.ok(page.indexOf('src="locale-data.js"')<page.indexOf('src="locale-coverage.js?v=15"'));
 assert.ok(page.indexOf('src="locale-coverage.js?v=15"')<page.indexOf('src="locales.js?v=16"'));
 for(const name of ['app.js','journey.js','login-ui.js','family-pin-ui.js'])
  assert.ok(page.includes(name+'?v='+(name==='app.js'?'104':'13')),name);
});

test('VI → EN → JA → VI switches both text and attributes without rewriting personal notes',()=>{
 const h=harness();
 h.Locale.translate();
 assert.equal(h.document.documentElement.lang,'vi');
 assert.equal(h.note.nodeValue,'Hôm nay');
 h.Locale.set('en');
 assert.equal(h.regular.nodeValue,'Today');
 assert.equal(h.paragraph.nodeValue,'Listen, follow the strokes, then write.');
 assert.equal(h.attr.attrs['aria-label'],'Interface language');
 assert.equal(h.document.documentElement.lang,'en');
 assert.equal(h.note.nodeValue,'Hôm nay');
 h.Locale.set('ja');
 assert.equal(h.regular.nodeValue,'今日');
 assert.equal(h.paragraph.nodeValue,'音を聞き、書き順を見て、自分で書く。');
 assert.equal(h.attr.attrs['aria-label'],'表示言語');
 assert.equal(h.note.nodeValue,'Hôm nay');
 h.Locale.set('vi');
 assert.equal(h.regular.nodeValue,'Hôm nay');
 assert.equal(h.paragraph.nodeValue,'Nghe âm, xem từng nét, rồi tự viết.');
 assert.equal(h.attr.attrs['aria-label'],'Ngôn ngữ giao diện');
 assert.equal(h.document.title,'Hôm nay · HORIZON');
 assert.equal(h.events.filter(x=>x.type==='np:localechange').length,3);
 assert.equal(h.storage.get('nihongo-path-ui-locale'),'vi');
});

test('Explicit three-language UI strings translate backward even if first rendered in Japanese',()=>{
 const h=harness();
 h.Locale.set('ja');
 assert.equal(h.Locale.register('Tạo PIN demo','Create a demo PIN','体験用PINを設定'),'体験用PINを設定');
 assert.equal(h.Locale.t('体験用PINを設定'),'体験用PINを設定');
 h.Locale.set('vi');
 assert.equal(h.Locale.t('体験用PINを設定'),'Tạo PIN demo');
 assert.equal(h.Locale.t('Create a demo PIN'),'Tạo PIN demo');
 h.Locale.set('en');
 assert.equal(h.Locale.t('体験用PINを設定'),'Create a demo PIN');
 assert.equal(h.Locale.t('Tạo PIN demo'),'Create a demo PIN');
});

test('Home, PIN, dashboard, N5, Kana and Content Studio have explicit coverage',()=>{
 const h=harness();
 const source=[
  ['Nghe âm, xem từng nét, rồi tự viết.','Listen, follow the strokes, then write.','音を聞き、書き順を見て、自分で書く。'],
  ['Đáp án bạn đã chọn','Your selected answer','選択した回答'],
  ['XƯỞNG NỘI DUNG','CONTENT STUDIO','教材制作スタジオ'],
  ['Hồ sơ đã lưu trữ','Archived profiles','アーカイブ済みプロフィール'],
  ['Tự luyện · Chưa chấm nét hoặc độ chính xác. Xác nhận chỉ ghi một lượt tự luyện; không tăng điểm thành thạo.',
    'Self-practice · Stroke order and accuracy are not graded. Confirming records one practice attempt only; it does not increase mastery.',
    '自習用の練習です。書き順や正確さは採点しません。確認すると練習履歴が1回記録されますが、習熟度は上がりません。']
 ];
 for(const [vi,en,ja] of source){
  h.Locale.set('en');assert.equal(h.Locale.t(vi),en,vi);
  h.Locale.set('ja');assert.equal(h.Locale.t(vi),ja,vi);
  h.Locale.set('vi');assert.equal(h.Locale.t(ja),vi,ja);
 }
});

test('Dynamic UI counters translate but Japanese examples and learner-created data are not touched',()=>{
 const h=harness();
 h.Locale.set('en');
 assert.equal(h.Locale.t('3 nét · Dữ liệu có sẵn'),'3 strokes · Data available');
 assert.equal(h.Locale.t('Nét 1 / 3'),'Stroke 1 / 3');
 assert.equal(h.Locale.t('Còn 2 lỗi cấu trúc.'),'2 structural issues remain.');
 assert.equal(h.Locale.t('Chỉ xóa mục này của hồ sơ Vy Anh trên trình duyệt đang mở.'),
   "Delete this item only from Vy Anh's profile in this browser.");
 h.Locale.set('ja');
 assert.equal(h.Locale.t('Nét 1 / 3'),'第1画 / 3画');
 assert.equal(h.Locale.t('Còn 2 lỗi cấu trúc.'),'構成上の問題が2件残っています。');
 assert.equal(h.note.nodeValue,'Hôm nay');
});

test('Core modules use runtime registered locale strings instead of frozen single-language copy',()=>{
 const scripts=['journey.js','login-ui.js','family-pin-ui.js','study-preferences.js'];
 for(const name of scripts){
   assert.ok(read(name).includes('Locale.register(vi,en,ja)'),name);
 }
 assert.ok(read('season-system.js').includes("const KEY='np-home-season-v1'"));
 assert.ok(read('app.js').includes('Locale.translate(document)'));
});
