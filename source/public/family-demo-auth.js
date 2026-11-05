/* Nihongo Path family demo: per-device PIN gate, NOT server authentication. */
window.NPFamilyAccess=(function(){
 'use strict';
 const PIN_KEY='np-family-demo-pin-v1',SESSION='np-family-session-v1',GUEST='np-guest-profile-v1';
 let active='';
 const tries={};
 try{active=sessionStorage.getItem(SESSION)||'';}catch{}
 function allPins(){try{const data=JSON.parse(localStorage.getItem(PIN_KEY)||'{}');return data&&typeof data==='object'&&!Array.isArray(data)?data:{};}catch{return {};}}
 function savePins(pins){localStorage.setItem(PIN_KEY,JSON.stringify(pins));}
 async function digest(salt,pin){
   if(!globalThis.crypto?.subtle)throw Error('Trình duyệt cần HTTPS để đặt PIN demo.');
   const data=new TextEncoder().encode(salt+':'+pin);
   const hash=await crypto.subtle.digest('SHA-256',data);
   return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('');
 }
 function salt(){const b=crypto.getRandomValues(new Uint8Array(16));return [...b].map(n=>n.toString(16).padStart(2,'0')).join('');}
 function isActive(id){return !!id&&active===id;}
 function lock(){
   active='';try{sessionStorage.removeItem(SESSION);}catch{}
   if(typeof db!=='undefined'&&db.current==='guest'){
     db.current='demo-a';db.profiles=db.profiles.filter(p=>p.id!=='guest');
     try{sessionStorage.removeItem(GUEST);}catch{}
   }
 }
 function enter(id){
   const p=db.profiles.find(x=>x.id===id&&!x.archived);
   if(!p)return;
   active=id;try{sessionStorage.setItem(SESSION,id);}catch{}
   db.current=p.id;loginSelected=id;
   resetLearningView();persist();go(p.onboarded?'today':'onboarding');
 }
 function enterGuest(){
   let p=db.profiles.find(x=>x.id==='guest');
   if(!p){
     try{p=JSON.parse(sessionStorage.getItem(GUEST)||'null');}catch{}
     if(!p||p.id!=='guest'||!Array.isArray(p.notes)||!Array.isArray(p.attempts)){
       p=structuredClone(initialProfiles[3]);
       Object.assign(p,{id:'guest',name:'Guest',role:'guest',goal:'Nền tảng',course:'foundation',studyFocus:'Thử Kana và bài học mẫu',minutes:10,color:2,notes:[],attempts:[],flashReviews:[],writing:0,resume:null});
     }
     db.profiles.push(p);
   }
   enter('guest');
 }
 function open(id,opener){
   if(!window.NP_STATIC_PUBLISH||window.NP_FAMILY_SYNC)return;
   const p=db.profiles.find(x=>x.id===id&&!x.archived&&x.role!=='guest');
   if(!p)return;
   const configured=!!allPins()[id];
   const title=configured?'PIN của '+p.name:'Tạo PIN cho '+p.name;
   const dialog=document.querySelector('#modal');
   dialog.classList.add('portal-dialog','family-pin-dialog');
   const markup=`<div class="family-pin-profile">${avatar(p,true)}<strong data-no-translate>${esc(p.name)}</strong><span>${esc(p.studyFocus||p.goal)}</span></div>
    <p class="family-pin-intro">${configured?'Nhập PIN đã tạo trên thiết bị này để tiếp tục.':'Lần đầu trên thiết bị này: tạo PIN 4–6 chữ số cho hồ sơ demo.'}</p>
    <form id="np-pin-form" autocomplete="off">
      <input type="hidden" name="learner" value="${esc(id)}">
      <label for="np-pin-input">${configured?'Nhập PIN':'PIN mới'}</label>
      <input id="np-pin-input" name="pin" type="password" inputmode="numeric" pattern="[0-9]{4,6}" minlength="4" maxlength="6" autocomplete="off" placeholder="••••" required>
      ${configured?'':`<label for="np-pin-confirm">Nhập lại PIN</label><input id="np-pin-confirm" name="confirm" type="password" inputmode="numeric" pattern="[0-9]{4,6}" minlength="4" maxlength="6" autocomplete="off" placeholder="••••" required>`}
      <p id="np-pin-error" role="alert" aria-live="polite"></p>
      <button class="atelier-enter" type="submit"><span>${configured?'Vào học':'Tạo PIN & vào học'}</span>${icon('arrow')}</button>
    </form>
    <p class="family-pin-disclaimer">PIN demo được lưu riêng trên trình duyệt này. Không phải xác thực bảo mật và không đồng bộ sang thiết bị khác.</p>
    ${configured?'<button type="button" class="family-pin-reset" data-family-pin-reset>Quên PIN? Đặt lại PIN demo</button>':''}
    <button type="button" class="portal-switch-person" data-action="portal-close">${icon('back')} Chọn người học khác</button>`;
   modal(title,markup);
   document.querySelector('#np-pin-input')?.focus({preventScroll:true});
 }
 document.addEventListener('submit',async e=>{
   if(e.target?.id!=='np-pin-form')return;
   e.preventDefault();e.stopImmediatePropagation();
   const form=e.target,values=new FormData(form),id=String(values.get('learner')||''),pin=String(values.get('pin')||'');
   const err=form.querySelector('#np-pin-error'),submit=form.querySelector('button[type=submit]');
   const record=allPins()[id];
   if(!db.profiles.some(p=>p.id===id&&!p.archived&&p.role!=='guest'))return;
   if(!/^\d{4,6}$/.test(pin)){err.textContent='Dùng 4–6 chữ số.';return;}
   if(!record&&pin!==String(values.get('confirm')||'')){err.textContent='Hai lần nhập PIN chưa giống nhau.';return;}
   if(tries[id]?.until>Date.now()){err.textContent='Nhập sai nhiều lần. Hãy thử lại sau ít phút.';return;}
   submit.disabled=true;err.textContent='';
   try{
     if(record){
       const actual=await digest(record.salt,pin);
       if(actual!==record.hash){
         const t=tries[id]||(tries[id]={count:0,until:0});
         t.count++;if(t.count>=5){t.until=Date.now()+30000;t.count=0;}
         err.textContent='PIN chưa đúng.';submit.disabled=false;form.querySelector('#np-pin-input')?.select();return;
       }
     }else{
       const newSalt=salt(),hash=await digest(newSalt,pin),pins=allPins();
       pins[id]={version:1,salt:newSalt,hash};savePins(pins);
     }
     tries[id]={count:0,until:0};enter(id);
   }catch(error){err.textContent=error?.message||'Không lưu được PIN trên thiết bị.';submit.disabled=false;}
 },true);
 document.addEventListener('click',e=>{
   if(!e.target.closest('[data-family-pin-reset]'))return;
   e.preventDefault();e.stopImmediatePropagation();
   const id=document.querySelector('#np-pin-form [name=learner]')?.value;
   const p=db.profiles.find(p=>p.id===id);
   if(!id||!p)return;
   if(!confirm('Đặt lại PIN demo của '+p.name+' trên thiết bị này? Thao tác không xóa dữ liệu học. Đây không phải cơ chế khôi phục tài khoản bảo mật.'))return;
   const pins=allPins();delete pins[id];savePins(pins);closeModal();open(id);
 },true);
 return {open,enterGuest,lock,isActive};
})();
