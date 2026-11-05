/* Nihongo Path static demo: one-tap profile selection. NOT authentication.
   Keep the same session contract for later server-backed access. */
window.NPFamilyAccess=(function(){
 'use strict';
 const SESSION='np-family-session-v1',GUEST='np-guest-profile-v1';
 let active='';
 try{active=sessionStorage.getItem(SESSION)||'';}catch{}
 function isActive(id){return !!id&&active===id;}
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
 function open(id){
   // Static demo only. Server-backed access will have independent auth.
   if(!window.NP_STATIC_PUBLISH||window.NP_FAMILY_SYNC||id==='guest')return false;
   if(!db.profiles.some(p=>p.id===id&&!p.archived&&p.role!=='guest'))return false;
   return enter(id);
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
 return {open,enterGuest,lock,isActive};
})();
