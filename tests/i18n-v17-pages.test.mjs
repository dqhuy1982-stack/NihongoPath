import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const root=new URL('../source/public/',import.meta.url);
const read=p=>readFileSync(new URL(p,root),'utf8');
const app=read('app.js'),lesson=read('lesson-ui.js'),kana=read('kana-studio.js');
const scope=vm.createContext({NP_LOCALE_ROWS:[]});
vm.runInContext(read('i18n/ui-pack.js'),scope);
const dict=vm.runInContext('NP_UI_PACK',scope);
const keys=Object.keys(dict);
function locale(code){
 return {code,
 ui:(key,args={})=>{
  assert.ok(dict[key],'Missing key: '+key);
  return dict[key][code].replace(/\{(\w+)\}/g,(text,k)=>k in args?String(args[k]):text);
 },
 t:text=>Object.values(dict).find(row=>row.vi===text||row.en===text||row.ja===text)?.[code]||text};
}
function section(s,start,end){
 const i=s.indexOf(start),j=s.indexOf(end,i+start.length);
 assert.ok(i>=0&&j>i,start+' section');
 return s.slice(i,j);
}
const esc=x=>String(x);
const base={
 esc,avatar:()=>'<img alt="portrait">',
 heading:(a,b,c,d='')=>a+' '+b+' '+c+' '+d,
 link:(a)=>a,button:a=>a,badge:a=>a,icon:()=>'',notice:a=>a,cardIcon:()=>''
};
const p={name:'Quang Huy',purpose:'Ôn Hiragana, Katakana và các bài nhập môn N5',minutes:20,role:'manager',goal:'N5',course:'N5',attempts:[],
 prefs:{},id:'learner-1'};
function profile(code){
 const ctx=vm.createContext({...base,Locale:locale(code),P:()=>p});
 vm.runInContext(section(app,'function profilePage()','function familyPage()'),ctx);
 return vm.runInContext('profilePage()',ctx);
}
function settings(code){
 const ctx=vm.createContext({...base,Locale:locale(code),P:()=>p,
 settingGroups:[['profile','Hồ sơ','user'],['account','Tài khoản & bảo mật','lock']],
 settingsDirty:false
 });
 vm.runInContext(section(app,'function settingBody(','function settingsPage('),ctx);
 vm.runInContext(section(app,'function settingsPage(','function profilePage()'),ctx);
 return [vm.runInContext("settingsPage('account')",ctx),vm.runInContext("settingBody('account')",ctx)];
}
function mapHTML(code){
 const ctx=vm.createContext({...base,Locale:locale(code),screenGroups:[
  {title:'07 · Mô hình với dữ liệu giả lập',
   items:[['demo','Hôm nay · mô phỏng','6 hồ sơ, 8 tình huống, phiên 5/15/30 phút','spark'],
   ['demo-compare','Trước / Sau','Cùng dữ liệu đầu vào, so sánh quy tắc gợi ý','layers'],
   ['demo-data','Dữ liệu & quy tắc','SQLite, JSON, lịch sử và hợp đồng module','chart']]}
 ]});
 vm.runInContext(section(app,'function mapPage()','function authTop()'),ctx);
 return vm.runInContext('mapPage()',ctx);
}
function reportHTML(code){
 const ctx=vm.createContext({...base,Locale:locale(code),
 read:()=>({sessions:[],attempts:[]}),E:{pending:()=>[]},
 errorBox:()=>'',b:(label)=>label, date:x=>x});
 vm.runInContext(section(lesson,'  function reportPanel(){','  function mistakesPage(){'),ctx);
 return vm.runInContext('reportPanel()',ctx);
}
test('UI language pack is the sole keyed source for critical screen contracts',()=>{
 assert.ok(keys.length>=140);
 for(const n of ['profile.heading','settings.account.role','map.demoGroup',
 'reports.versioned.summary','kana.localStatus','journal.search'])
  assert.ok(dict[n],n);
 for(const [name,row] of Object.entries(dict)){
  assert.equal(Object.keys(row).sort().join(','),'en,ja,vi',name);
  for(const v of Object.values(row))assert.ok(typeof v==='string'&&v.trim(),name);
  assert.deepEqual([...row.vi.matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort(),
   [...row.en.matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort(),name+' EN placeholders');
  assert.deepEqual([...row.vi.matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort(),
   [...row.ja.matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort(),name+' JA placeholders');
 }
});
test('Profile content and role labels follow English and Japanese UI language',()=>{
 for(const [code,expected] of [
 ['en',['Learner profile','Review Hiragana, Katakana','20 min per session','Demo family manager','Recorded proficiency']],
 ['ja',['学習者プロフィール','ひらがな・カタカナ','1回20分','体験版の家族管理者','記録された習熟度']]]){
  const html=profile(code);
  for(const token of expected)assert.ok(html.includes(token),code+': '+token);
  assert.ok(html.includes('Quang Huy'));
  assert.doesNotMatch(html,/Ôn Hiragana, Katakana|phút mỗi buổi|Quản lý gia đình mẫu|Năng lực ghi nhận/);
 }
});
test('My Space account and security keeps localized roles and unchanged permissions',()=>{
 for(const [code,expected] of [
 ['en',['My space','Account & security','Role in the demo group','Demo family manager','Permissions cannot be elevated']],
 ['ja',['マイスペース','アカウントとセキュリティ','体験グループでの役割','体験版の家族管理者','権限を昇格することはできません']]]){
  const html=settings(code).join(' ');
  for(const token of expected)assert.ok(html.includes(token),code+': '+token);
  assert.ok(html.includes('Quang Huy'));
  assert.doesNotMatch(html,/Vai trò trong nhóm mẫu|Không tự nâng quyền|Chưa kết nối/);
 }
});
test('Dynamically injected simulation screen group 07 is localized without rewriting route IDs',()=>{
 for(const [code,expected] of [
 ['en',['07 · Simulation with sample data','Today · simulation','Before / After','Data & rules','6 profiles, 8 scenarios']],
 ['ja',['07・サンプルデータによるシミュレーション','今日・シミュレーション','変更前と変更後','データとルール','6プロフィール、8場面']]]){
  const html=mapHTML(code);
  for(const token of expected)assert.ok(html.includes(token),code+': '+token);
  for(const path of ['#demo','#demo-compare','#demo-data'])assert.ok(html.includes(path));
  assert.doesNotMatch(html,/07 · Mô hình với dữ liệu giả lập|Hôm nay · mô phỏng|Trước \/ Sau|Dữ liệu & quy tắc/);
 }
});
test('Report metrics and links are localized with the correct numeric values',()=>{
 for(const [code,expected] of [
 ['en',['0 sessions completed','0 in progress','0/0 answered correctly','Export session data']],
 ['ja',['完了0セッション','進行中0セッション','正解0/0問','セッションデータを書き出す']]]){
  const html=reportHTML(code);
  for(const token of expected)assert.ok(html.includes(token),code+': '+token);
  assert.doesNotMatch(html,/0 phiên hoàn tất|0 phiên đang dở|Xuất dữ liệu phiên học/);
 }
});
test('Kana practice actions and offline state use UI package without mutating learner evidence',()=>{
 for(const name of ['kana.progressCount','kana.localStatus','kana.onlineStatus','kana.download','kana.reviewStrokes'])
  assert.ok(kana.includes("Locale.ui('"+name+"'")||kana.includes("'"+name+"'"),name);
 assert.ok(kana.includes('Locale.t(w.error||w.message)'));
 assert.ok(kana.includes('window.NPKanaStudio={page,mount,flush:'));
 assert.ok(app.includes("'profile','reports'"));
 assert.ok(app.includes("'kana','demo','demo-compare','demo-data'"));
});
test('Versioned UI assets load before consumers and production backend remains untouched',()=>{
 const html=read('index.html');
 assert.ok(html.indexOf('src="i18n/ui-pack.js?v=32"')>=0);
 assert.ok(html.indexOf('src="i18n/ui-pack.js?v=32"')<html.indexOf('src="locales.js?v=16"'));
 assert.ok(html.includes('src="app.js?v=146"'));
 assert.ok(html.includes('src="lesson-ui.js?v=32"'));
 assert.ok(html.includes('src="kana-studio.js"')); // exporter fingerprints canonical asset
});
