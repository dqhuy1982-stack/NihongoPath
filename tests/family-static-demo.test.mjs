import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {webcrypto} from 'node:crypto';
import vm from 'node:vm';

const root=new URL('../source/public/',import.meta.url);
const read=name=>readFileSync(new URL(name,root),'utf8');

test('four 320px portraits are individually cached WebP files from the uploaded sources',()=>{
 const script=read('family-portraits.js');
 const json=script.split('window.NP_FAMILY_PHOTOS=')[1]?.trim().replace(/;$/, '');
 assert.ok(json,'Missing image map');
 const images=JSON.parse(json);
 assert.deepEqual(Object.keys(images),['demo-a','demo-b','demo-c','demo-d']);
 const digests=[];
 for(const [id,uri] of Object.entries(images)){
   assert.equal(uri,'assets/family/'+id+'.webp','Use real URLs, not 1KB blurred data URIs');
   const bytes=readFileSync(new URL(uri,root));
   assert.ok(bytes.length>5000&&bytes.length<35000,id+' should be high enough quality but lightweight');
   assert.equal(bytes.subarray(0,4).toString(),'RIFF',id);
   assert.equal(bytes.subarray(8,12).toString(),'WEBP',id);
   assert.equal(bytes.subarray(12,16).toString(),'VP8 ',id);
   assert.equal(bytes.readUInt16LE(26)&0x3fff,320,id+' width must remain 320px');
   assert.equal(bytes.readUInt16LE(28)&0x3fff,320,id+' height must remain 320px');
   digests.push(bytes.toString('base64').slice(0,150));
 }
 assert.equal(new Set(digests).size,4,'Each avatar must be its own original picture');
});

test('family demo retains N5/N2/N4/N4, morphing PIN access and Guest',()=>{
 const app=read('app.js'),login=read('login-ui.js'),index=read('index.html');
 for(const label of ['Quang Huy','Vy Anh','Nam Khánh','Gia Hưng'])assert.ok(app.includes(label),'Missing '+label);
 for(const level of ["'N2'","'N5'","'N4'"])assert.ok(app.includes(level),level);
 assert.ok(login.includes("window.NPFamilyAccess.open"),'Avatar PIN open route missing');
 assert.ok(login.includes("aria-haspopup','dialog"),'Avatar must announce PIN dialog');
 assert.ok(read('family-pin-ui.js').includes('np-pin-window'),'Missing morphing dialog');
 assert.ok(index.includes('src="family-pin-ui.js?v=11"'));
 assert.ok(index.includes('href="home-pin.css"'));
 assert.ok(read('family-demo-auth.js').includes("hash:'SHA-256'"),'PIN should be derived, not embedded in public source');
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
  {id:'demo-a',name:'Quang Huy',role:'manager',goal:'N5',notes:[{text:'Keep progress'}],attempts:[],onboarded:true,archived:false},
  {id:'demo-b',name:'Vy Anh',role:'learner',goal:'N2',notes:[],attempts:[],onboarded:true,archived:false}
 ]};
 const initialProfiles=[{id:'demo-a'}, {id:'demo-b'}, {id:'demo-c'}, {id:'demo-d',goal:'N4',minutes:10,role:'learner',notes:[],attempts:[],flashReviews:[]}];
 let location='',saves=0,opened='';
 const context={
  window:{NP_STATIC_PUBLISH:true,NP_FAMILY_SYNC:false,NPLogin:{openPin(id){opened=id;return true;}}},
  sessionStorage,localStorage,db,initialProfiles,structuredClone,
  crypto:webcrypto,TextEncoder,
  persist(){saves++;},resetLearningView(){},go(to){location=to;},
  loginSelected:'',console
 };
 vm.runInNewContext(read('family-demo-auth.js'),context);
 return {access:context.window.NPFamilyAccess,db,localStorage,sessionStorage,route:()=>location,saves:()=>saves,opened:()=>opened};
}

test('tapping a learner card opens PIN; no login until correct PIN is entered',async()=>{
 const {access,db,localStorage,sessionStorage,route,opened}=makeBrowser();
 localStorage.setItem('np-family-demo-pin-v1','OLD LEGACY DEMO PIN RECORD');
 assert.equal(access.isActive('demo-a'),false);
 assert.equal(access.hasPin('demo-a'),false);
 assert.equal(access.open('demo-a'),true);
 assert.equal(opened(),'demo-a');
 assert.equal(access.isActive('demo-a'),false);
 assert.equal(route(),'');
 assert.equal(await access.unlock('demo-a','1234'),false);
 assert.equal(await access.createPin('demo-a','123'),false);
 assert.equal(await access.createPin('demo-a','1234'),true);
 assert.equal(access.hasPin('demo-a'),true);
 assert.equal(access.isActive('demo-a'),true);
 assert.equal(db.current,'demo-a');
 assert.equal(route(),'today');
 assert.equal(sessionStorage.getItem('np-family-session-v1'),'demo-a');
 const pins=JSON.parse(localStorage.getItem('np-family-demo-pins-v2'));
 assert.equal(pins['demo-a'].v,2);
 assert.ok(pins['demo-a'].salt.length>=32);
 assert.ok(pins['demo-a'].hash.length>=64);
 assert.ok(!JSON.stringify(pins).includes('1234'),'PIN must not be stored in plaintext');
 assert.equal(await access.createPin('demo-a','2222'),false,'existing PIN cannot be silently replaced');
 assert.equal(access.open('demo-b'),true);
 assert.equal(opened(),'demo-b');
 assert.equal(access.isActive('demo-b'),false);
 assert.equal(db.current,'demo-a','switching must require learner B PIN');
 assert.equal(await access.createPin('demo-b','654321'),true);
 assert.equal(db.current,'demo-b');
 access.lock();
 assert.equal(await access.unlock('demo-a','9999'),false);
 assert.equal(db.current,'demo-b');
 assert.equal(await access.unlock('demo-a','1234'),true);
 assert.equal(db.current,'demo-a');
 assert.equal(access.open('guest'),false);
 assert.equal(access.open('missing'),false);
 assert.equal(localStorage.getItem('np-family-demo-pin-v1'),'OLD LEGACY DEMO PIN RECORD');
});

test('local demo PIN reset and Guest never erase existing learner progress',async()=>{
 const {access,db,localStorage}=makeBrowser();
 assert.equal(await access.createPin('demo-a','4455'),true);
 assert.equal(await access.createPin('demo-b','7788'),true);
 assert.equal(access.resetPin('demo-a'),true);
 assert.equal(access.hasPin('demo-a'),false);
 assert.equal(access.hasPin('demo-b'),true);
 assert.equal(db.profiles[0].notes[0].text,'Keep progress');
 assert.equal(access.enterGuest(),true);
 assert.equal(access.isActive('guest'),true);
 assert.equal(db.current,'guest');
 assert.ok(db.profiles.some(p=>p.id==='guest'));
 access.lock();
 assert.equal(access.isActive('guest'),false);
 assert.equal(db.profiles.some(p=>p.id==='guest'),false);
 assert.equal(db.profiles[0].notes[0].text,'Keep progress');
 assert.equal(JSON.parse(localStorage.getItem('np-family-demo-pins-v2'))['demo-b'].v,2);
 assert.equal(JSON.parse(localStorage.getItem('np-family-demo-pins-v2'))['demo-a'],undefined);
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
   id:'demo-'+String.fromCharCode(97+i),name,goal:['N5','N2','N4','N4'][i],course:['N5','N2','N4','N4'][i],
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
 assert.equal(db.profiles[0].goal,'N5');
 assert.equal(db.profiles[0].course,'N5');
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
