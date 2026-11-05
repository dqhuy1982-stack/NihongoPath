/* Morphing family PIN entry for the static GitHub Pages demo.
   The avatar tile visually expands into the PIN panel, then returns on close.
   No server account is created; local PINs only guard the demo interface. */
window.NPFamilyPinUI=(function(){
 'use strict';
 const tr=(vi,en,ja)=>[vi,en,ja][{vi:0,en:1,ja:2}[window.Locale?.code]||0];
 const motionOff=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 const touchLike=()=>window.matchMedia?.('(pointer:coarse)').matches;
 let current=null;

 function targetRect(height){
   const vp=window.visualViewport;
   const width=vp?.width||window.innerWidth;
   const visibleHeight=vp?.height||window.innerHeight;
   const offsetX=vp?.offsetLeft||0,offsetY=vp?.offsetTop||0;
   const w=Math.min(416,width-28),h=Math.min(height,visibleHeight-28);
   return {left:offsetX+(width-w)/2,top:offsetY+Math.max(14,(visibleHeight-h)/2),width:w,height:h};
 }
 function setGeometry(panel,box){
   for(const k of ['left','top','width','height'])panel.style[k]=Math.round(box[k])+'px';
 }
 function showError(message){
   if(!current)return;
   const node=current.overlay.querySelector('#np-pin-error');
   if(node){node.textContent=message||'';node.hidden=!message;}
   const input=current.overlay.querySelector('#np-pin-input');
   if(input)input.setAttribute('aria-invalid',message?'true':'false');
 }
 function focusInput(){
   current?.overlay.querySelector('#np-pin-input')?.focus({preventScroll:true});
 }
 function renderStage(stage){
   if(!current)return;
   current.stage=stage;
   const {overlay,person}=current;
   const action=overlay.querySelector('#np-pin-submit');
   const intro=overlay.querySelector('#np-pin-description');
   const label=overlay.querySelector('#np-pin-label');
   const recover=overlay.querySelector('#np-pin-recover');
   const input=overlay.querySelector('#np-pin-input');
   const step=overlay.querySelector('#np-pin-step');
   const heading=overlay.querySelector('#np-pin-title');
   if(stage==='create'){
     heading.textContent=tr('Tạo PIN demo','Create a demo PIN','体験用PINを設定');
     intro.textContent=tr('Một PIN riêng cho '+person.name+' trên thiết bị này.','A PIN for '+person.name+' on this device.','この端末で'+person.name+'のPINを設定します。');
     label.textContent=tr('PIN gồm 4–6 số','4–6 digit PIN','4～6桁のPIN');
     action.textContent=tr('Tiếp tục','Continue','次へ');
     step.textContent=tr('BƯỚC 01 / 02','STEP 01 / 02','ステップ 01 / 02');
   }else if(stage==='confirm'){
     heading.textContent=tr('Xác nhận PIN','Confirm your PIN','PINを確認');
     intro.textContent=tr('Nhập lại PIN vừa tạo để bắt đầu học.','Enter the same PIN once more to continue.','同じPINをもう一度入力してください。');
     label.textContent=tr('Nhập lại PIN','Repeat PIN','PINを再入力');
     action.textContent=tr('Lưu PIN & vào học','Save PIN & start','PINを保存して始める');
     step.textContent=tr('BƯỚC 02 / 02','STEP 02 / 02','ステップ 02 / 02');
   }else if(stage==='reset'){
     heading.textContent=tr('Đặt lại PIN demo?','Reset this demo PIN?','体験用PINをリセットしますか？');
     intro.textContent=tr('Chỉ xóa PIN của hồ sơ này trên thiết bị hiện tại. Ghi chú và tiến độ học được giữ nguyên.','Only this profile’s PIN on this device is removed. Learning progress stays intact.','この端末のPINのみ削除します。学習データは保持されます。');
     label.textContent=tr('Xác nhận đặt lại','Confirm PIN reset','リセットを確認');
     action.textContent=tr('Đặt lại PIN','Reset PIN','PINをリセット');
     step.textContent=tr('BẢN DEMO · CHỈ TRÊN THIẾT BỊ NÀY','LOCAL DEMO ONLY','この端末のみ');
   }else{
     heading.textContent=tr('Chào mừng trở lại','Welcome back','おかえりなさい');
     intro.textContent=tr('Nhập PIN của '+person.name+' để tiếp tục.','Enter '+person.name+'’s PIN to continue.',''+person.name+'のPINを入力してください。');
     label.textContent=tr('Nhập PIN','Your PIN','PINを入力');
     action.textContent=tr('Vào học','Continue learning','学習を始める');
     step.textContent=tr('KHÔNG GIAN CỦA BẠN','YOUR LEARNING SPACE','あなたの学習スペース');
   }
   input.value='';
   input.required=stage!=='reset';
   input.disabled=stage==='reset';
   input.closest('.np-pin-input-wrap').hidden=stage==='reset';
   recover.hidden=stage==='create'||stage==='confirm';
   recover.textContent=stage==='reset'?tr('Quay lại nhập PIN','Back to PIN','PIN入力に戻る'):tr('Quên PIN demo?','Forgot demo PIN?','PINを忘れた場合');
   showError('');
   // On desktop, focusing while the card is still small can force an early
   // scroll container and flash the scrollbar. Keep gesture-time focus on iOS.
   if(stage!=='reset'&&(current.expanded||touchLike()))focusInput();
   if(current.expanded)reposition();
 }
 function updateScrollability(){
   if(!current||!current.settled)return;
   const {panel,overlay}=current;
   overlay.classList.remove('np-pin-scrollable');
   const needsScroll=panel.scrollHeight>panel.clientHeight+2;
   overlay.classList.toggle('np-pin-scrollable',needsScroll);
 }
 function reposition(){
   if(!current||!current.expanded)return;
   const {panel,overlay}=current;
   // Recalculate actual content height when changing the PIN step or viewport.
   overlay.classList.remove('np-pin-scrollable');
   current.naturalHeight=Math.max(400,panel.scrollHeight);
   setGeometry(panel,targetRect(current.naturalHeight));
   if(current.settled)requestAnimationFrame(updateScrollability);
 }

 function close(immediate=false){
   if(!current)return;
   const state=current;
   current=null;
   window.removeEventListener('resize',onResize);
   window.visualViewport?.removeEventListener('resize',onResize);
   window.removeEventListener('hashchange',onHashChange);
   document.removeEventListener('keydown',onKeydown,true);
   document.body.classList.remove('np-pin-active');
   const remove=()=>{
     state.overlay.remove();
     state.source?.classList.remove('np-pin-source');
     if(!immediate&&state.source?.isConnected&&route()==='login')state.source.focus({preventScroll:true});
   };
   if(immediate||motionOff()){remove();return;}
   // Closing the panel must not reveal an internal scrollbar as it shrinks.
   state.overlay.classList.remove('np-pin-scrollable','np-pin-settled','np-pin-visible');
   const r=state.source?.isConnected?state.source.getBoundingClientRect():state.origin;
   setGeometry(state.panel,{left:r.left,top:r.top,width:r.width,height:r.height});
   window.setTimeout(remove,320);
 }
 function onResize(){if(current)reposition();}
 function onHashChange(){close(true);}
 function onKeydown(event){
   if(!current)return;
   if(event.key==='Escape'){event.preventDefault();close();return;}
   if(event.key==='Tab'){
     const items=[...current.overlay.querySelectorAll('button:not([disabled]):not([hidden]),input:not([disabled]):not([hidden])')].filter(el=>el.getClientRects().length);
     if(!items.length)return;
     if(event.shiftKey&&document.activeElement===items[0]){event.preventDefault();items[items.length-1].focus();}
     else if(!event.shiftKey&&document.activeElement===items[items.length-1]){event.preventDefault();items[0].focus();}
   }
 }
 function open(id,source){
   if(!window.NP_STATIC_PUBLISH||window.NP_FAMILY_SYNC)return false;
   const person=db.profiles.find(p=>p.id===id&&!p.archived&&p.role!=='guest');
   if(!person)return false;
   if(current)close(true);
   source=source?.closest?.('.portal-person')||source||document.querySelector('.portal-person[data-id="'+id+'"]');
   const sourceRect=source?.getBoundingClientRect();
   const approx={left:window.innerWidth/2-70,top:window.innerHeight/2-100,width:140,height:200};
   const origin=sourceRect?.width?sourceRect:approx;
   const overlay=document.createElement('div');
   overlay.className='np-pin-overlay';
   overlay.innerHTML=`<button type="button" class="np-pin-backdrop" aria-label="${tr('Đóng khung PIN','Close PIN panel','PIN画面を閉じる')}"></button>
     <section class="np-pin-window" role="dialog" aria-modal="true" aria-labelledby="np-pin-title" aria-describedby="np-pin-description">
       <button type="button" class="np-pin-close" aria-label="${tr('Đóng','Close','閉じる')}">×</button>
       <div class="np-pin-brand" aria-hidden="true">
         <img src="assets/horizon-mark.svg?v=homev3" width="41" height="33" alt="">
         <span>HORIZON</span>
       </div>
       <div class="np-pin-identity">
         <div class="np-pin-photo">${avatar(person,true)}</div>
         <strong class="np-pin-name" data-no-translate>${esc(person.name)}</strong>
         <span class="np-pin-goal">${tr('Mục tiêu','Goal','目標')} ${esc(person.goal)}</span>
       </div>
       <div class="np-pin-body">
         <div id="np-pin-step" class="np-pin-step"></div>
         <h2 id="np-pin-title"></h2>
         <p id="np-pin-description"></p>
         <form class="np-pin-form" autocomplete="off">
           <div class="np-pin-input-wrap">
             <label for="np-pin-input" id="np-pin-label"></label>
             <input id="np-pin-input" type="password" inputmode="numeric" pattern="[0-9]*" minlength="4" maxlength="6" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="••••" aria-describedby="np-pin-error" required>
           </div>
           <p id="np-pin-error" class="np-pin-error" role="alert" aria-live="polite" hidden></p>
           <button id="np-pin-submit" class="np-pin-submit" type="submit"></button>
         </form>
         <button id="np-pin-recover" class="np-pin-recover" type="button"></button>
         <p class="np-pin-disclaimer">${tr('PIN chỉ dùng cho bản demo trên thiết bị này.','PIN only protects this demo on this device.','このPINは端末内の体験版専用です。')}</p>
       </div>
     </section>`;
   const panel=overlay.querySelector('.np-pin-window');
   document.body.appendChild(overlay);
   const state={overlay,panel,person,source,origin,stage:'',pending:'',busy:false,expanded:false,settled:false,naturalHeight:455};
   current=state;
   // Measure at the destination width before starting the morph.
   panel.style.transition='none';
   const dest=targetRect(455);
   panel.style.left='-9999px';panel.style.top='-9999px';panel.style.width=dest.width+'px';
   panel.style.height='auto';panel.style.maxHeight='none';
   renderStage(window.NPFamilyAccess.hasPin(id)?'unlock':'create');
   state.naturalHeight=Math.max(400,panel.scrollHeight);
   panel.style.maxHeight='';
   setGeometry(panel,{left:origin.left,top:origin.top,width:origin.width,height:origin.height});
   // Avoid moving focus out of a user gesture on iOS.
   source?.classList.add('np-pin-source');
   document.body.classList.add('np-pin-active');
   overlay.querySelector('.np-pin-close').addEventListener('click',()=>close());
   overlay.querySelector('.np-pin-backdrop').addEventListener('click',()=>close());
   overlay.querySelector('#np-pin-recover').addEventListener('click',()=>{
     if(!current||current.busy)return;
     if(state.stage==='reset')renderStage('unlock');
     else renderStage('reset');
   });
   overlay.querySelector('.np-pin-form').addEventListener('submit',async event=>{
     event.preventDefault();
     if(!current||current!==state||state.busy)return;
     const input=overlay.querySelector('#np-pin-input');
     const value=input.value;
     if(state.stage==='reset'){
       try{
         if(!window.NPFamilyAccess.resetPin(id))throw Error('Unavailable');
         renderStage('create');
       }catch{showError(tr('Không thể đặt lại PIN trên thiết bị này.','Could not reset this PIN.','PINをリセットできませんでした。'));}
       return;
     }
     if(!/^\d{4,6}$/.test(value)){
       showError(tr('PIN phải có 4–6 chữ số.','Use 4–6 digits.','4～6桁の数字を入力してください。'));
       input.focus();return;
     }
     if(state.stage==='create'){
       state.pending=value;
       renderStage('confirm');return;
     }
     if(state.stage==='confirm'&&value!==state.pending){
       showError(tr('PIN không khớp. Nhập lại để xác nhận.','PINs do not match. Try again.','PINが一致しません。もう一度入力してください。'));
       input.value='';input.focus();return;
     }
     state.busy=true;
     overlay.querySelector('#np-pin-submit').disabled=true;
     try{
       const ok=state.stage==='confirm'
         ?await window.NPFamilyAccess.createPin(id,value)
         :await window.NPFamilyAccess.unlock(id,value);
       if(ok){close(true);return;}
       showError(state.stage==='unlock'
         ?tr('PIN chưa đúng. Hãy thử lại.','Incorrect PIN. Try again.','PINが正しくありません。')
         :tr('Chưa lưu được PIN. Vui lòng thử lại.','Unable to save PIN. Try again.','PINを保存できませんでした。'));
       input.value='';input.focus();
     }catch{
       showError(tr('Trình duyệt chưa cho phép lưu PIN. Hãy bật lưu trữ website và thử lại.','Browser storage is unavailable. Enable site storage and retry.','ブラウザの保存機能を確認してください。'));
     }finally{
       if(current===state){
         state.busy=false;
         overlay.querySelector('#np-pin-submit').disabled=false;
       }
     }
   });
   window.addEventListener('resize',onResize);
   window.visualViewport?.addEventListener('resize',onResize);
   window.addEventListener('hashchange',onHashChange);
   document.addEventListener('keydown',onKeydown,true);
   // The morph begins from the clicked card bounds. Only after it finishes do
   // we allow a scrollbar, and only if the visible viewport truly needs one.
   const finishMorph=()=>{
     if(current!==state||state.settled)return;
     state.settled=true;
     overlay.classList.add('np-pin-settled');
     updateScrollability();
     if(!touchLike())focusInput();
   };
   requestAnimationFrame(()=>{
     if(current!==state)return;
     panel.style.transition='';
     state.expanded=true;
     overlay.classList.add('np-pin-visible');
     setGeometry(panel,targetRect(state.naturalHeight));
     if(motionOff()){
       panel.style.transition='none';
       finishMorph();
     }else{
       panel.addEventListener('transitionend',event=>{
         if(event.target===panel&&event.propertyName==='height')finishMorph();
       },{once:false});
       window.setTimeout(finishMorph,390);
     }
   });
   // iPhone must focus from the original tap gesture, without keyboard regressions.
   if(touchLike())focusInput();
   return true;
 }
 return {open,close};
})();
