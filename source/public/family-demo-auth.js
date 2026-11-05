/* Nihongo Path static family demo.
   A PIN is a local convenience lock, NOT secure authentication or cloud identity.
   Each learner has an independent salted PBKDF2 hash in this browser only.
   No PIN is shipped in the public repository. */
window.NPFamilyAccess=(function(){
 'use strict';
 const SESSION='np-family-session-v1',GUEST='np-guest-profile-v1';
 const PIN_STORE='np-family-demo-pins-v2';
 const ITERATIONS=120000;
 let active='';
 try{active=sessionStorage.getItem(SESSION)||'';}catch{}

 const validPin=pin=>typeof pin==='string'&&/^\d{4,6}$/.test(pin);
 function family(id){
   return !!id&&id!=='guest'&&db.profiles.some(p=>p.id===id&&!p.archived&&p.role!=='guest');
 }
 function readPins(){
   try{
     const obj=JSON.parse(localStorage.getItem(PIN_STORE)||'{}');
     return obj&&typeof obj==='object'&&!Array.isArray(obj)?obj:{};
   }catch{return {};}
 }
 function toHex(bytes){return Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');}
 function fromHex(hex){
   if(typeof hex!=='string'||!/^(?:[a-f0-9]{2})+$/i.test(hex))throw Error('Invalid saved PIN');
   return Uint8Array.from(hex.match(/../g),v=>parseInt(v,16));
 }
 async function digest(pin,salt){
   if(!globalThis.crypto?.subtle||!globalThis.crypto?.getRandomValues)throw Error('PIN storage needs HTTPS');
   const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(pin),{name:'PBKDF2'},false,['deriveBits']);
   const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt,iterations:ITERATIONS,hash:'SHA-256'},key,256);
   return new Uint8Array(bits);
 }
 function isActive(id){return !!id&&active===id;}
 function hasPin(id){
   const record=readPins()[id];
   return !!(record&&record.v===2&&typeof record.salt==='string'&&typeof record.hash==='string');
 }
 function lock(){
   active='';
   try{sessionStorage.removeItem(SESSION);}catch{}
   if(typeof db!=='undefined'&&db.current==='guest'){
     db.current='demo-a';
     db.profiles=db.profiles.filter(p=>p.id!=='guest');
     try{sessionStorage.removeItem(GUEST);}catch{}
   }
 }
 function enter(id){
   const p=db.profiles.find(x=>x.id===id&&!x.archived);
   if(!p)return false;
   active=id;
   try{sessionStorage.setItem(SESSION,id);}catch{}
   db.current=id;
   loginSelected=id;
   resetLearningView();
   persist();
   go(p.onboarded?'today':'onboarding');
   return true;
 }
 async function createPin(id,pin){
   if(!window.NP_STATIC_PUBLISH||window.NP_FAMILY_SYNC||!family(id)||!validPin(pin)||hasPin(id))return false;
   const salt=crypto.getRandomValues(new Uint8Array(16));
   const hash=await digest(pin,salt);
   const pins=readPins();
   if(pins[id])return false;
   pins[id]={v:2,salt:toHex(salt),hash:toHex(hash)};
   localStorage.setItem(PIN_STORE,JSON.stringify(pins));
   return enter(id);
 }
 async function unlock(id,pin){
   if(!window.NP_STATIC_PUBLISH||window.NP_FAMILY_SYNC||!family(id)||!validPin(pin))return false;
   const entry=readPins()[id];
   if(!entry||entry.v!==2)return false;
   let calculated,expected;
   try{
     calculated=await digest(pin,fromHex(entry.salt));
     expected=fromHex(entry.hash);
   }catch{return false;}
   if(calculated.length!==expected.length)return false;
   let difference=0;
   for(let i=0;i<calculated.length;i++)difference|=calculated[i]^expected[i];
   return difference===0?enter(id):false;
 }
 function resetPin(id){
   // Static local demo: recovery cannot verify ownership. This only forgets
   // this browser's PIN; it does not clear learner progress or other PINs.
   if(!window.NP_STATIC_PUBLISH||window.NP_FAMILY_SYNC||!family(id))return false;
   const pins=readPins();
   delete pins[id];
   localStorage.setItem(PIN_STORE,JSON.stringify(pins));
   return true;
 }
 function open(id,button){
   if(!window.NP_STATIC_PUBLISH||window.NP_FAMILY_SYNC||!family(id))return false;
   return !!window.NPLogin?.openPin?.(id,button);
 }
 function enterGuest(){
   if(!window.NP_STATIC_PUBLISH||window.NP_FAMILY_SYNC)return false;
   let p=db.profiles.find(x=>x.id==='guest');
   if(!p){
     try{p=JSON.parse(sessionStorage.getItem(GUEST)||'null');}catch{}
     if(!p||p.id!=='guest'||!Array.isArray(p.notes)||!Array.isArray(p.attempts)){
       p=structuredClone(initialProfiles[3]);
       Object.assign(p,{id:'guest',name:'Khách',role:'guest',goal:'Nền tảng',course:'foundation',studyFocus:'Thử Kana và bài học mẫu',minutes:10,color:2,notes:[],attempts:[],flashReviews:[],writing:0,resume:null});
     }
     db.profiles.push(p);
   }
   return enter('guest');
 }
 return {open,createPin,unlock,resetPin,hasPin,lock,isActive,enterGuest};
})();
