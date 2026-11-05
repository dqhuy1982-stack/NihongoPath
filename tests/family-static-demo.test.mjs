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

test('family demo ships requested N5/N2/N4/N4 targets and one-tap guest picker',()=>{
 const app=read('app.js'),login=read('login-ui.js'),index=read('index.html');
 for(const label of ['Quang Huy','Vy Anh','Nam Khánh','Gia Hưng'])assert.ok(app.includes(label),'Missing '+label);
 for(const level of ["'N2'","'N5'","'N4'"])assert.ok(app.includes(level),level);
 assert.ok(login.includes("window.NPFamilyAccess.open"),'Avatar one-tap route missing');
 assert.ok(!login.includes("Nhập PIN của"),'Published UI must not prompt for PIN');
 assert.ok(login.includes("window.NPFamilyAccess.enterGuest"),'Guest entry missing');
 assert.ok(index.includes('src="family-demo-auth.js"'));
 assert.ok(index.includes('src="family-portraits.js"'));
 assert.ok(index.includes('href="family-demo.css"'));
 assert.ok(app.includes('window.NPFamilyAccess?.isActive(db.current)'));
 assert.ok(app.includes("profiles:db.profiles.filter(p=>p.id!=='guest')"),'Guest must not enter saved family profiles');
});

function makeBrowser(){
 const storage=()=>{const map=new Map();return {getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k)};};
 const localStorage=storage(),sessionStorage=storage();
 const db={current:'demo-a',profiles:[
  {id:'demo-a',name:'Quang Huy',role:'manager',goal:'N5',notes:[],attempts:[],onboarded:true,archived:false},
  {id:'demo-b',name:'Vy Anh',role:'learner',goal:'N2',notes:[],attempts:[],onboarded:true,archived:false}
 ]};
 const initialProfiles=[{id:'demo-a'}, {id:'demo-b'}, {id:'demo-c'}, {id:'demo-d',goal:'N4',minutes:10,role:'learner',notes:[],attempts:[],flashReviews:[]}];
 let route='',saveCount=0;
 const context={
  window:{NP_STATIC_PUBLISH:true,NP_FAMILY_SYNC:false},
  sessionStorage,localStorage,db,initialProfiles,structuredClone,
  persist(){saveCount++;},resetLearningView(){},go(to){route=to;},
  loginSelected:'',console
 };
 vm.runInNewContext(read('family-demo-auth.js'),context);
 return {access:context.window.NPFamilyAccess,db,localStorage,sessionStorage,route:()=>route,saves:()=>saveCount};
}

test('one tap selects a learner and supports switching without PIN; Guest remains separate',()=>{
 const {access,db,localStorage,sessionStorage,route,saves}=makeBrowser();
 localStorage.setItem('np-family-demo-pin-v1','LEGACY PIN HASH REMAINS UNUSED');
 assert.equal(access.isActive('demo-a'),false);
 assert.equal(access.open('demo-a'),true);
 assert.equal(access.isActive('demo-a'),true);
 assert.equal(db.current,'demo-a');
 assert.equal(route(),'today');
 assert.equal(sessionStorage.getItem('np-family-session-v1'),'demo-a');
 assert.equal(access.open('demo-b'),true);
 assert.equal(access.isActive('demo-a'),false);
 assert.equal(access.isActive('demo-b'),true);
 assert.equal(db.current,'demo-b');
 assert.equal(access.open('nonexistent'),false);
 assert.equal(access.open('guest'),false);
 assert.equal(access.enterGuest(),true);
 assert.equal(access.isActive('guest'),true);
 assert.equal(db.current,'guest');
 assert.ok(db.profiles.some(p=>p.id==='guest'));
 assert.ok(saves()>=3);
 access.lock();
 assert.equal(access.isActive('guest'),false);
 assert.equal(db.profiles.some(p=>p.id==='guest'),false);
 assert.equal(db.current,'demo-a');
 assert.equal(sessionStorage.getItem('np-family-session-v1'),null);
 assert.equal(localStorage.getItem('np-family-demo-pin-v1'),'LEGACY PIN HASH REMAINS UNUSED');
});

test('old browser profiles receive N4 targets without losing progress or custom names',()=>{
 const app=read('app.js');
 const begin='if(window.NP_STATIC_PUBLISH&&db.familyDemoVersion!==5){';
 const end='\nif(!db.profiles.some(';
 const start=app.indexOf(begin),stop=app.indexOf(end,start);
 assert.ok(start>=0&&stop>start,'demo migration block must exist');
 const legacyProfiles=[
  {id:'demo-a',name:'Bố',role:'manager',notes:[{text:'Dad note'}],attempts:[{score:2}],goal:'N5'},
  {id:'demo-b',name:'Vy Anh',role:'learner',notes:[{text:'N2 note'}],attempts:[],goal:'N2'},
  {id:'demo-c',name:'Khánh',role:'learner',notes:[],attempts:[],goal:'N5'},
  {id:'demo-d',name:'Hưng',role:'learner',notes:[],attempts:[],goal:'Nền tảng'}
 ];
 const db={schemaVersion:1,familyDemoVersion:4,current:'demo-a',profiles:legacyProfiles};
 const samples=['Quang Huy','Vy Anh','Nam Khánh','Gia Hưng'].map((name,i)=>({
   id:'demo-'+String.fromCharCode(97+i),name,goal:['N5','N2','N4','N4'][i],course:['foundation','N2','N4','N4'][i],
   role:i?'learner':'manager',notes:[{text:'Starter'}],shortcuts:['kana'],studyFocus:'Demo'
 }));
 const storage=new Map([['np-family-demo-pin-v1','PIN HASH MUST SURVIVE']]);
 const sandbox={db,initialProfiles:samples,window:{NP_STATIC_PUBLISH:true},
   structuredClone,localStorage:{setItem:(key,value)=>storage.set(key,value)},KEY:'nihongo-path-flow-review-v3'};
 vm.runInNewContext(app.slice(start,stop),sandbox);
 assert.deepEqual(db.profiles.map(p=>p.name),['Quang Huy','Vy Anh','Nam Khánh','Gia Hưng']);
 assert.equal(db.profiles[0].notes[0].text,'Dad note');
 assert.equal(db.profiles[0].attempts[0].score,2);
 assert.equal(db.familyDemoVersion,5);
 assert.equal(db.profiles[2].goal,'N4');
 assert.equal(db.profiles[3].goal,'N4');
 assert.equal(db.profiles[2].course,'N4');
 assert.equal(db.profiles[3].course,'N4');
 assert.equal(storage.get('np-family-demo-pin-v1'),'PIN HASH MUST SURVIVE');
 // A custom name must not be overwritten by a later release.
 db.familyDemoVersion=4;db.profiles[0].name='Tên tự chọn';
 vm.runInNewContext(app.slice(start,stop),sandbox);
 assert.equal(db.profiles[0].name,'Tên tự chọn');
});
