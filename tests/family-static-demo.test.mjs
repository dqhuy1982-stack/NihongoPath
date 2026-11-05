import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {webcrypto} from 'node:crypto';
import vm from 'node:vm';

const root=new URL('../source/public/',import.meta.url);
const read=name=>readFileSync(new URL(name,root),'utf8');

test('public family avatars contain four valid optimized WebP portraits',()=>{
 const script=read('family-portraits.js');
 const json=script.match(/^.*?window\.NP_FAMILY_PHOTOS=(\{.*\});\s*$/s)?.[1];
 assert.ok(json,'Missing family image map');
 const images=JSON.parse(json);
 assert.deepEqual(Object.keys(images),['demo-a','demo-b','demo-c','demo-d']);
 for(const [id,uri] of Object.entries(images)){
   assert.match(uri,/^data:image\/webp;base64,/);
   const bytes=Buffer.from(uri.split(',')[1],'base64');
   assert.ok(bytes.length>1000&&bytes.length<10000,id);
   assert.equal(bytes.subarray(0,4).toString(),'RIFF',id);
   assert.equal(bytes.subarray(8,12).toString(),'WEBP',id);
 }
});

test('family demo ships separate educational targets and PIN-first guest picker',()=>{
 const app=read('app.js'),login=read('login-ui.js'),index=read('index.html');
 for(const label of ['Bố','Vy Anh','Khánh','Hưng'])assert.ok(app.includes(label),'Missing '+label);
 for(const level of ["'N2'","'N5'","'Nền tảng'"])assert.ok(app.includes(level),level);
 assert.ok(login.includes("window.NPFamilyAccess.open"),'Avatar bypasses PIN dialog');
 assert.ok(login.includes("window.NPFamilyAccess.enterGuest"),'Guest entry missing');
 assert.ok(index.includes('src="family-demo-auth.js"'));
 assert.ok(index.includes('src="family-portraits.js"'));
 assert.ok(index.includes('href="family-demo.css"'));
 assert.ok(app.includes('window.NPFamilyAccess?.isActive(db.current)'));
 assert.ok(app.includes("profiles:db.profiles.filter(p=>p.id!=='guest')"),'Guest must not enter saved family profiles');
});

function makeBrowser(){
 const storage=()=>{const map=new Map();return {getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k)};};
 const localStorage=storage(),sessionStorage=storage(),handlers={},view={};
 const db={current:'demo-a',profiles:[
  {id:'demo-a',name:'Bố',role:'manager',goal:'N5',notes:[],attempts:[],onboarded:true,archived:false},
  {id:'demo-b',name:'Vy Anh',role:'learner',goal:'N2',notes:[],attempts:[],onboarded:true,archived:false}
 ]};
 const initialProfiles=[{id:'demo-a'}, {id:'demo-b'}, {id:'demo-c'}, {id:'demo-d',goal:'Nền tảng',minutes:10,role:'learner',notes:[],attempts:[],flashReviews:[]}];
 const form={id:'np-pin-form',fields:new Map(),querySelector(s){if(s==='#np-pin-error')return view.error||(view.error={textContent:''});if(s==='button[type=submit]')return view.submit||(view.submit={disabled:false});if(s==='#np-pin-input')return {select(){}};return null;}};
 const dialog={classList:{add(){}},open:false};
 let route='';
 const context={
  window:{NP_STATIC_PUBLISH:true,NP_FAMILY_SYNC:false},
  document:{addEventListener(name,fn){handlers[name]=fn;},querySelector(sel){return sel==='#modal'?dialog:{focus(){}};}},
  localStorage,sessionStorage,db,initialProfiles,crypto:webcrypto,TextEncoder,Date,
  structuredClone,FormData:class{constructor(f){this.fields=f.fields;}get(k){return this.fields.get(k);}},
  modal(title,html){view.title=title;view.html=html;},closeModal(){},esc:s=>s,avatar:()=>'<avatar/>',icon:()=>'<icon/>',
  persist(){view.saves=(view.saves||0)+1;},resetLearningView(){},go(to){route=to;},
  loginSelected:'',console
 };
 vm.runInNewContext(read('family-demo-auth.js'),context);
 return {access:context.window.NPFamilyAccess,db,localStorage,sessionStorage,handlers,form,view,route:()=>route};
}

test('PIN is set per browser, checked before family entry, and guest is isolated',async()=>{
 const {access,db,localStorage,handlers,form,view,route}=makeBrowser();
 assert.equal(access.isActive('demo-a'),false);
 access.open('demo-a');
 assert.match(view.html,/PIN mới/);
 form.fields=new Map([['learner','demo-a'],['pin','4826'],['confirm','4826']]);
 const ev={target:form,preventDefault(){},stopImmediatePropagation(){}};
 await handlers.submit(ev);
 assert.equal(access.isActive('demo-a'),true);
 assert.equal(db.current,'demo-a');
 assert.equal(route(),'today');
 const saved=localStorage.getItem('np-family-demo-pin-v1');
 assert.ok(saved);
 assert.ok(!saved.includes('4826'),'Do not persist plaintext PIN');
 access.lock();assert.equal(access.isActive('demo-a'),false);
 access.open('demo-a');assert.match(view.html,/Nhập PIN/);
 form.fields=new Map([['learner','demo-a'],['pin','9999']]);
 await handlers.submit(ev);
 assert.equal(access.isActive('demo-a'),false);
 assert.match(view.error.textContent,/PIN chưa đúng/);
 form.fields.set('pin','4826');
 await handlers.submit(ev);
 assert.equal(access.isActive('demo-a'),true);
 access.enterGuest();
 assert.equal(access.isActive('guest'),true);
 assert.equal(db.current,'guest');
 assert.ok(db.profiles.some(p=>p.id==='guest'));
 access.lock();
 assert.equal(access.isActive('guest'),false);
 assert.equal(db.profiles.some(p=>p.id==='guest'),false);
});
