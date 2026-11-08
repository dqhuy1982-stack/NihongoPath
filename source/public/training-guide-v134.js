/* HORIZON v1.36 · Non-invasive guided tour for the Training workspace.
   An illustrated pointer is used; the real mouse is never moved or clicked.
   Preferences are browser-local per learner and separate from learning scores. */
(function(){
'use strict';
const key=()=>{
 let id='guest';
 try{id=String(P()?.id||'guest').replace(/[^a-z0-9_-]/gi,'_')}catch(e){}
 return 'Horizon.Training.guide.v134.'+id;
};
const steps=[
 {selector:'.v132-scope > summary',title:'01 · Phạm vi đang luyện',
  desc:'Đây là nội dung được dùng cho mọi câu hỏi. Mở Đổi phạm vi khi muốn chọn cấp độ, bài hoặc hệ chữ khác.'},
 {selector:'.v133-side-menu .v133-nav-item',mobile:'.v133-mobile-menu > summary',
  title:'02 · Menu dạng bài',
  desc:'Chọn trực tiếp một kỹ năng. Bài luyện xuất hiện ngay bên phải, menu bên trái vẫn giữ nguyên.'},
 {selector:'.v133-main-area .v132-primary',title:'03 · Bắt đầu luyện',
  desc:'Chưa biết chọn dạng nào? Bấm Bắt đầu luyện để làm bài gợi ý hoặc tiếp tục dạng bài vừa luyện.'},
 {selector:'.v133-main-area .v132-exam a',title:'04 · Kiểm tra tổng hợp',
  desc:'Bài kiểm tra trộn câu hỏi, có phản hồi và tổng kết để bạn đánh giá mức độ ghi nhớ.'}
];
const inlineSteps=[
 steps[0],steps[1],
 {selector:'.v134-inline-training .v34-workspace-shell',title:'03 · Bài luyện bên phải',
  desc:'Bạn đang ở trong một bài luyện. Đáp án, âm báo và nút tiếp tục đều hoạt động ngay trong trang này.'},
 {selector:'.v134-inline-clear',title:'04 · Quay về phần tổng quan',
  desc:'Khi muốn bắt đầu lại từ gợi ý hoặc kiểm tra tổng hợp, chọn Về trang luyện tập. Menu dạng bài luôn ở bên trái.'}
];
let tour=null,timer=null,clockTick=null,scopeHint=null;
const STEP_MS=8000;
const seenSession=new Set();
function pref(){try{return localStorage.getItem(key())||'first'}catch(e){return 'seen'}}
function save(repeat){try{localStorage.setItem(key(),repeat?'repeat':'seen')}catch(e){}}
function clearTimer(){
 if(timer!==null){clearTimeout(timer);timer=null}
 if(clockTick!==null){clearInterval(clockTick);clockTick=null}
}
function updateCountdown(){
 const t=tour;if(!t)return;
 const seconds=Math.ceil(Math.max(0,t.remainingMs)/1000);
 const indicator=t.host.querySelector('.v135-guide-timer');
 indicator.textContent=String(seconds).padStart(2,'0');
 indicator.setAttribute('aria-label',t.paused?'Đã tạm dừng':'Còn '+seconds+' giây');
 const percent=Math.max(0,Math.min(100,t.remainingMs/STEP_MS*100)).toFixed(1);
 const ring=t.host.querySelector('.v135-guide-clock');
 ring.style.setProperty('--progress',percent+'%');
 const track=t.host.querySelector('.v135-guide-progress span');
 track.style.width=percent+'%';
 const pause=t.host.querySelector('[data-v134-action="pause"]');
 pause.textContent=t.paused?'▶ Tiếp tục':'Ⅱ Tạm dừng';
 pause.setAttribute('aria-pressed',String(t.paused));
 t.host.querySelector('.v135-guide-clock-label').textContent=t.paused?'Đã tạm dừng':'Tự chuyển bước sau';
}
function scheduleCountdown(){
 clearTimer();
 const t=tour;
 if(!t||t.confirm||t.paused)return;
 t.deadline=Date.now()+t.remainingMs;
 updateCountdown();
 clockTick=setInterval(()=>{
  if(tour!==t||t.confirm||t.paused)return;
  t.remainingMs=Math.max(0,t.deadline-Date.now());
  updateCountdown();
  if(t.remainingMs>0)return;
  clearTimer();
  // Briefly show 00, then move; avoids abrupt countdown reset.
  timer=setTimeout(()=>{
   timer=null;if(tour!==t||t.confirm||t.paused)return;
   if(t.step>=t.steps.length-1){end('complete');return}
   t.step++;t.remainingMs=STEP_MS;layOut();
  },260);
 },100);
}
function pauseCountdown(){
 if(!tour||tour.paused)return;
 if(clockTick!==null)tour.remainingMs=Math.max(0,tour.deadline-Date.now());
 clearTimer();tour.paused=true;updateCountdown();
}
/* After successful completion, point to the next useful decision without
   hijacking focus or reopening the course filters. */
function clearScopeHint(){
 if(!scopeHint)return;
 const h=scopeHint;scopeHint=null;
 clearTimeout(h.timer);
 h.panel.classList.remove('v136-post-tour-active');
 h.chip.classList.remove('v136-scope-attention');
 h.bubble.remove();
 document.removeEventListener('pointerdown',h.cancel,true);
 window.removeEventListener('hashchange',clearScopeHint);
}
function spotlightScope(){
 clearScopeHint();
 const panel=document.querySelector('.v132-scope');
 const chip=panel?.querySelector('.v132-scope-change');
 if(!panel||!chip)return;
 const summary=panel.querySelector('summary');
 const bounds=summary?.getBoundingClientRect();
 const height=window.innerHeight||768;
 if(bounds&&(bounds.bottom<60||bounds.top>height-85)){
  summary.scrollIntoView?.({block:'center',behavior:'smooth'});
 }
 const bubble=document.createElement('span');
 bubble.className='v136-post-tour-bubble';
 bubble.setAttribute('role','status');
 bubble.textContent='Chọn phạm vi bạn muốn luyện hoặc kiểm tra tại đây';
 chip.appendChild(bubble);
 panel.classList.add('v136-post-tour-active');
 chip.classList.add('v136-scope-attention');
 const cancel=()=>clearScopeHint();
 scopeHint={panel,chip,bubble,cancel,timer:null};
 document.addEventListener('pointerdown',cancel,true);
 window.addEventListener('hashchange',clearScopeHint);
 scopeHint.timer=setTimeout(clearScopeHint,7600);
}
function end(reason='exit',savePreference=true){
 clearTimer();
 if(!tour)return;
 const host=tour.host,repeat=tour.repeat;
 tour=null;host.remove();
 if(savePreference)save(repeat);
 updateControls();
 if(reason==='complete')spotlightScope();
}
function updateControls(){
 const enabled=pref()==='repeat';
 for(const btn of document.querySelectorAll?.('[data-v134-guide="toggle"]')||[]){
  btn.setAttribute('aria-pressed',String(enabled));
  btn.textContent='Tự mở: '+(enabled?'Bật':'Tắt');
 }
}
function layOut(){
 if(!tour)return;
 if(clockTick!==null&&!tour.paused&&!tour.confirm)tour.remainingMs=Math.max(0,tour.deadline-Date.now());
 const steps=tour.steps,step=steps[tour.step],small=(window.innerWidth||1024)<=620;
 const target=document.querySelector(small&&step.mobile?step.mobile:step.selector);
 if(!target){end('unavailable');return}
 const rect=target.getBoundingClientRect();
 const w=window.innerWidth||1024,h=window.innerHeight||768;
 const highlight=tour.host.querySelector('.v134-guide-spot');
 const x=Math.max(0,rect.left-6),y=Math.max(0,rect.top-6);
 highlight.style.left=x+'px';highlight.style.top=y+'px';
 highlight.style.width=Math.max(28,rect.width+12)+'px';
 highlight.style.height=Math.max(32,rect.height+12)+'px';
 const cursor=tour.host.querySelector('.v134-guide-cursor');
 // This is an illustrated pointer, not the learner's actual cursor.
 const pointerX=Math.max(8,Math.min(w-34,rect.left+Math.min(rect.width*.62,130)));
 const pointerY=Math.max(8,Math.min(h-36,rect.top+Math.min(rect.height*.5,27)));
 cursor.style.transform='translate3d('+pointerX+'px,'+pointerY+'px,0)';
 const card=tour.host.querySelector('.v134-guide-card');
 const width=Math.min(360,w-24);
 const left=Math.max(12,Math.min(w-width-12,rect.left+rect.width*.5-width*.42));
 card.style.width=width+'px';
 const height=Math.min(h-24,Math.max(275,card.getBoundingClientRect().height||305));
 const below=rect.bottom+16,above=rect.top-height-16;
 const side=below+height+12<=h?'below':above>=12?'above':'floating';
 const top=side==='below'?below:side==='above'?above:Math.max(12,(h-height)*.5);
 // Point the dialogue tail at the highlighted control, even near screen edges.
 const arrowX=Math.max(22,Math.min(width-22,rect.left+rect.width*.5-left));
 card.style.setProperty('--v136-arrow-x',arrowX+'px');
 card.style.left=left+'px';card.style.top=top+'px';
 tour.host.dataset.bubbleSide=side;
 tour.host.querySelector('.v134-guide-title').textContent=step.title;
 tour.host.querySelector('.v134-guide-body').textContent=step.desc;
 tour.host.querySelector('.v134-guide-progress').textContent=(tour.step+1)+' / '+steps.length;
 tour.host.querySelector('[data-v134-action="prev"]').disabled=tour.step===0;
 tour.host.querySelector('[data-v134-action="next"]').textContent=tour.step===steps.length-1?'Hoàn tất':'Tiếp theo →';
 tour.host.querySelector('.v134-guide-card').hidden=!!tour.confirm;
 tour.host.querySelector('.v134-guide-confirm').hidden=!tour.confirm;
 for(const box of tour.host.querySelectorAll('[data-v134-repeat]'))box.checked=tour.repeat;
 for(const [i,bar] of [...tour.host.querySelectorAll('.v135-guide-steps span')].entries()){
  bar.classList.toggle('is-complete',i<=tour.step);
 }
 clearTimer();
 if(!tour.confirm&&!tour.paused)scheduleCountdown();
 else updateCountdown();
}
function confirmExit(){
 if(!tour)return;
 if(clockTick!==null&&!tour.paused)tour.remainingMs=Math.max(0,tour.deadline-Date.now());
 tour.confirm=true;clearTimer();layOut();
 tour.host.querySelector('[data-v134-action="continue"]')?.focus?.({preventScroll:true});
}
function start(manual=false){
 if(tour||!document.querySelector('.v131-training'))return;
 if(!manual&&!['first','repeat'].includes(pref()))return;
 const uid=key();
 if(!manual&&seenSession.has(uid))return;
 seenSession.add(uid);
 if(!document.body?.appendChild)return;
 const host=document.createElement('div');
 host.className='v134-guide-layer';
 host.setAttribute('role','dialog');
 host.setAttribute('aria-modal','true');
 host.setAttribute('aria-label','Hướng dẫn sử dụng Luyện tập');
 host.innerHTML='<div class="v134-guide-spot" aria-hidden="true"></div>'+
  '<div class="v134-guide-cursor" aria-hidden="true"><svg width="28" height="32" viewBox="0 0 28 32">'+
  '<path d="M2 1l2 26 7-7 6 10 5-3-6-10 10-2z" stroke="#704858" stroke-width="2" fill="#fff" stroke-linejoin="round"/></svg></div>'+
  '<section class="v134-guide-card"><div class="v134-guide-eyebrow"><span>HƯỚNG DẪN LUYỆN TẬP</span>'+
  '<span class="v134-guide-progress"></span></div>'+
   '<div class="v135-guide-steps" aria-hidden="true"><span></span><span></span><span></span><span></span></div>'+
   '<div class="v135-guide-clock-row">'+
   '<div class="v135-guide-clock" style="--progress:100%" role="timer" aria-live="off"><span><strong class="v135-guide-timer">08</strong><small>giây</small></span></div>'+
   '<div class="v135-guide-clock-detail"><span class="v135-guide-clock-label">Tự chuyển bước sau</span>'+
   '<div class="v135-guide-progress" aria-hidden="true"><span></span></div></div>'+
   '<button type="button" class="v135-guide-pause" data-v134-action="pause" aria-pressed="false">Ⅱ Tạm dừng</button></div>'+
   '<h3 class="v134-guide-title"></h3><p class="v134-guide-body"></p>'+
  '<label class="v134-guide-preference"><input type="checkbox" data-v134-repeat> Tự mở hướng dẫn lần sau</label>'+
  '<div class="v134-guide-buttons"><button type="button" data-v134-action="ask-exit">Thoát</button>'+
  '<button type="button" data-v134-action="prev">‹ Trước</button>'+
  '<button type="button" class="v134-guide-next" data-v134-action="next">Tiếp theo →</button></div></section>'+
  '<section class="v134-guide-confirm" role="alertdialog" aria-label="Xác nhận thoát hướng dẫn" hidden>'+
  '<h3>Thoát hướng dẫn?</h3><p>Bạn có thể tiếp tục xem các bước hoặc thoát để bắt đầu luyện tập.</p>'+
  '<label class="v134-guide-preference"><input type="checkbox" data-v134-repeat> Tự mở hướng dẫn lần sau</label>'+
  '<div class="v134-guide-buttons"><button type="button" data-v134-action="exit">Thoát hướng dẫn</button>'+
  '<button type="button" class="v134-guide-next" data-v134-action="continue">Tiếp tục hướng dẫn</button></div></section>';
 tour={host,step:0,remainingMs:STEP_MS,deadline:0,paused:false,confirm:false,repeat:pref()==='repeat',
  steps:document.querySelector('.v134-inline-training')?inlineSteps:steps};
 document.body.appendChild(host);
 host.addEventListener('change',event=>{
  if(!event.target.matches?.('[data-v134-repeat]')||!tour)return;
  tour.repeat=!!event.target.checked;
  for(const item of host.querySelectorAll('[data-v134-repeat]'))item.checked=tour.repeat;
 });
 host.addEventListener('click',event=>{
  const button=event.target.closest?.('[data-v134-action]');
  if(!button){if(!event.target.closest?.('.v134-guide-card,.v134-guide-confirm'))confirmExit();return}
  if(!tour)return;
  const action=button.dataset.v134Action;
  if(action==='ask-exit'){confirmExit();return}
  if(action==='continue'){tour.confirm=false;layOut();
   host.querySelector('[data-v134-action="next"]')?.focus?.({preventScroll:true});return}
  if(action==='exit'){end('exit');return}
  if(tour.confirm)return;
  if(action==='pause'){
   if(tour.paused){tour.paused=false;layOut()}
   else pauseCountdown();
   return;
  }
  if(action==='prev'){clearTimer();tour.step=Math.max(0,tour.step-1);tour.remainingMs=STEP_MS;layOut();return}
  if(action==='next'){if(tour.step===tour.steps.length-1)end('complete');else{clearTimer();tour.step++;tour.remainingMs=STEP_MS;layOut()}}
 });
 layOut();
 host.querySelector('[data-v134-action="next"]')?.focus?.({preventScroll:true});
}
function maybeStart(){
 if(!location.hash.startsWith('#learn/training')||location.hash.split('/').length>6)return;
 start(false);
}
document.addEventListener('click',event=>{
 const el=event.target.closest?.('[data-v134-guide]');
 if(!el||!document.querySelector('.v131-training'))return;
 event.preventDefault();
 if(el.dataset.v134Guide==='start')start(true);
 else if(el.dataset.v134Guide==='toggle'){save(pref()!=='repeat');updateControls()}
});
document.addEventListener('keydown',event=>{
 if(tour&&event.key==='Escape'){event.preventDefault();confirmExit()}
},true);
window.addEventListener('resize',()=>{if(tour)layOut()});
document.addEventListener('visibilitychange',()=>{
 if(tour&&document.hidden&&!tour.paused){pauseCountdown()}
});
window.addEventListener('hashchange',()=>{if(tour)end('navigation',false);else clearScopeHint()});
window.NPTrainingGuide={maybeStart,start,isActive:()=>!!tour};
})();