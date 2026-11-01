/* Atelier Kana studio: bundled reference paths, vector drafts, explicit self-practice. */
(function(){
 'use strict';
 const D=window.NP_KANA_DATA,M=window.NPKanaModel,records=new Map(D.characters.map(c=>[c.char,c])),workspaces=new Map();
 const tr=(vi,en,ja)=>typeof I==='function'?I(vi,en,ja):vi;
 const copy=v=>JSON.parse(JSON.stringify(v));
 /* Audio is a local preference only: it never updates writing evidence or learner progress. */
 const speakerSvg='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 9v6h4l5 4V5L8 9H4Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6a8 8 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';
 const audioKey=id=>'nihongo-kana-studio-audio-v1:'+id;
 const audioEnabled=id=>{try{return localStorage.getItem(audioKey(id))!=='off';}catch{return true;}};
 function saveAudioEnabled(id,enabled){try{localStorage.setItem(audioKey(id),enabled?'on':'off');}catch{/* Audio remains usable without storage. */}}
 let spokenByStudio=false,audioOwner=null,audioToken=0;
 function stopAudio(){audioToken++;if(spokenByStudio&&window.speechSynthesis){try{speechSynthesis.cancel();}catch{}}spokenByStudio=false;audioOwner=null;}
 function audioStatus(text){const el=document.querySelector('#ks-audio-status');if(el)el.textContent=text||'';}
 function sayKana(record){
   if(!record)return false;
   if(typeof window.SpeechSynthesisUtterance!=='function'||!window.speechSynthesis){audioStatus(tr('Trình duyệt này không hỗ trợ phát âm Kana.','This browser does not support Kana pronunciation.','音声読み上げに対応していません。'));return false;}
   stopAudio();
   try{
     const voices=speechSynthesis.getVoices(),japanese=voices.find(v=>/^ja(-|$)/i.test(v.lang));
     if(voices.length&&!japanese){audioStatus(tr('Chưa có giọng tiếng Nhật. Hãy cài giọng Japanese trên thiết bị để tránh phát âm sai.','No Japanese voice is available. Install a Japanese voice to avoid incorrect pronunciation.','日本語音声を追加してください。'));return false;}
     const utterance=new SpeechSynthesisUtterance(record.char);
     utterance.lang='ja-JP';utterance.rate=.88;utterance.pitch=1;utterance.volume=1;
     if(japanese)utterance.voice=japanese;
     const token=++audioToken;spokenByStudio=true;audioOwner=P().id;
     utterance.onend=()=>{if(token===audioToken){spokenByStudio=false;audioOwner=null;}};
     utterance.onerror=event=>{if(token!==audioToken)return;spokenByStudio=false;audioOwner=null;if(!['canceled','interrupted'].includes(event.error))audioStatus(tr('Không phát được âm. Kiểm tra âm lượng và giọng tiếng Nhật của thiết bị.','Audio unavailable. Check device volume and Japanese voice settings.','日本語音声と音量を確認してください。'));};
     audioStatus('');
     speechSynthesis.speak(utterance);
     return true;
   }catch{spokenByStudio=false;audioOwner=null;audioStatus(tr('Không phát được âm trên thiết bị này.','Audio playback is unavailable on this device.','この端末では再生できません。'));return false;}
 }
 const audioButton=(where,label)=>`<button type="button" class="ks-speak ks-speak-${where}" data-ks="speak" aria-label="${tr('Nghe phát âm chữ','Hear pronunciation of','文字の発音を聞く')} ${esc(label)}" title="${tr('Nghe phát âm','Hear pronunciation','発音を聞く')}">${speakerSvg}<span>${tr('Nghe âm','Listen','聞く')}</span></button>`;
 const autoButton=enabled=>`<button type="button" class="ks-auto-audio" data-ks="auto-audio" aria-pressed="${enabled}" title="${tr('Tự phát âm khi chọn chữ','Speak automatically on selection','文字を選ぶと発音')}">${speakerSvg}<span class="ks-auto-label">${tr('Tự đọc khi chọn','Auto pronunciation','自動読み上げ')}</span><span class="ks-auto-indicator">${enabled?tr('Bật','On','オン'):tr('Tắt','Off','オフ')}</span></button>`;
 let animation=0,playState=null,saveTimer=null;
 const current=()=>workspaces.get(P().id);
 const glyph=w=>records.get(w.snapshot.selected);
 const active=()=>route().split('/')[0]==='kana';
 function fresh(id){return {id,snapshot:{...M.defaults(),revision:0,draft:[],practices:{total:0,characters:[],latest:null}},drawing:[],dirty:false,strokeVersion:0,phase:0,mobileStep:'choose',loaded:false,loading:false,error:'',message:'',queue:Promise.resolve(),pending:0};}
 function ws(){let w=workspaces.get(P().id);if(!w){w=fresh(P().id);workspaces.set(w.id,w);}return w;}
 function storageKey(id){return 'nihongo-kana-studio-demo-v1:'+id;}
 function demoRead(id){try{return JSON.parse(localStorage.getItem(storageKey(id)))||{state:M.defaults(),revision:0,drawings:{},log:[],receipts:{}};}catch{throw new Error('Bản thử cục bộ chưa đọc được. Chưa ghi đè dữ liệu.');}}
 function demoSnapshot(raw){const chars={};for(const p of raw.log){chars[p.char]??={char:p.char,count:0,lastAt:p.at};chars[p.char].count++;chars[p.char].lastAt=p.at;}return {...raw.state,revision:raw.revision,draft:raw.drawings[raw.state.selected]||[],practices:{total:raw.log.length,characters:Object.values(chars),latest:raw.log.at(-1)||null}};}
 async function request(w,body){
   if(window.NPOnline){if(!NPOnline.ready)throw new Error('Đang mở tài khoản.');return NPOnline.request('learners/'+encodeURIComponent(w.id)+'/kana',body?'POST':'GET',body);}
   const raw=demoRead(w.id);if(!body)return demoSnapshot(raw);
   if(raw.receipts[body.eventId])return demoSnapshot(raw);
   if(body.revision!==raw.revision)throw Object.assign(new Error('Bản viết vừa thay đổi ở cửa sổ khác. Hãy tải lại.'),{status:409});
   const value=M.apply(raw.state,body);raw.state=value.state;if(value.strokes)raw.drawings[body.char]=value.strokes;
   if(body.action==='confirm')raw.log.push({char:body.char,at:new Date().toISOString(),strokeCount:value.strokes.length});
   raw.revision++;raw.receipts[body.eventId]=true;localStorage.setItem(storageKey(w.id),JSON.stringify(raw));return demoSnapshot(raw);
 }
 function message(w,text,error=false){w.message=text;w.error=error?text:'';if(!active()||P().id!==w.id)return;document.querySelectorAll('#ks-save-status,#ks-global-status').forEach(el=>{el.textContent=text;el.classList.toggle('is-error',error);});refreshControls(w);}
 async function load(w){if(w.loading)return;w.loading=true;try{const result=await request(w);w.snapshot=result;w.drawing=copy(result.draft);w.dirty=false;w.loaded=true;w.confirmedVersion=-1;w.error='';w.message=window.NPOnline?'Đã tải bản viết từ tài khoản.':'Bản thử cục bộ · Chưa đồng bộ server.';}catch(error){w.error=error.message;}finally{w.loading=false;if(active()&&P().id===w.id)render(false);}}
 function commit(w,payload){
   w.pending++;message(w,'Đang lưu…');
   const operation=w.queue.then(async()=>{
     const body={...payload,eventId:uid(),revision:w.snapshot.revision};let result;
     try{result=await request(w,body);}catch(error){if(error.status)throw error;result=await request(w,body);}
     w.snapshot=result;w.error='';return result;
   });
   w.queue=operation.catch(()=>{});
   return operation.catch(error=>{message(w,error.message,true);throw error;}).finally(()=>{w.pending--;if(!w.error)message(w,window.NPOnline?'Đã lưu bản viết trên tài khoản.':'Đã lưu trong bản thử cục bộ.');else refreshControls(w);});
 }
 async function saveDraft(w){clearTimeout(saveTimer);if(!w.loaded||!w.dirty)return true;const version=w.strokeVersion,char=w.snapshot.selected,strokes=M.drawing(w.drawing);try{await commit(w,{action:'draft',char,strokes});if(version===w.strokeVersion)w.dirty=false;return true;}catch{return false;}}
 function scheduleSave(w){clearTimeout(saveTimer);saveTimer=setTimeout(()=>saveDraft(w),650);}
 function revealWorkspace(){if(!matchMedia('(max-width:767px)').matches)return;const content=document.querySelector('.ks-columns'),steps=document.querySelector('.ks-steps'),bar=document.querySelector('.reviewbar');if(content){const target=(bar?.getBoundingClientRect().height||0)+(steps?.getBoundingClientRect().height||0)+12;window.scrollBy({top:content.getBoundingClientRect().top-target,left:0,behavior:'instant'});}}
 function stop(){if(animation)cancelAnimationFrame(animation);animation=0;playState=null;const b=document.querySelector('[data-ks="play"]');if(b)b.textContent=tr('▶ Xem cách viết','▶ Play strokes','▶ 書き順を見る');}
 function svg(record,upto,small=false){
   const lines=record.strokes.map((paths,i)=>paths.map(d=>`<path d="${esc(d)}" class="ks-path" data-stroke="${i}" fill="none" stroke="${i<upto?'#318677':'#bc8234'}" stroke-width="${small?34:30}" stroke-linecap="round" stroke-linejoin="round" opacity="${i<=upto?1:0}"/>`).join('')).join('');
   const ghost=record.strokes.flat().map(d=>`<path d="${esc(d)}" fill="none" stroke="#cdd6df" stroke-width="28" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
   return `<svg viewBox="0 0 1024 1024" role="img" aria-label="${esc(record.char)} · ${tr('nét','stroke','画')} ${upto+1}" class="ks-svg ${small?'ks-svg-small':''}"><rect width="1024" height="1024" rx="28" fill="#fafcff"/><path d="M512 24V1000M24 512H1000" stroke="#c8d5df" stroke-width="4" stroke-dasharray="14 16"/>${ghost}${lines}${small?'':'<circle class="ks-pen" r="20" fill="#fff7dc" stroke="#258473" stroke-width="8"/><circle class="ks-pen-tip" r="6" fill="#258473"/>'}</svg>`;
 }
 function pathProgress(record,phase,progress){
   const root=document.querySelector('#ks-guide-svg svg');if(!root)return;root.setAttribute('aria-label',record.char+' · '+tr('nét','stroke','画')+' '+(phase+1));
   const paths=[...root.querySelectorAll('.ks-path')],selected=paths.filter(p=>Number(p.dataset.stroke)===phase),lengths=selected.map(p=>p.getTotalLength()),total=lengths.reduce((a,b)=>a+b,0);let offset=0,pen=null;
   for(const path of paths){const i=Number(path.dataset.stroke),len=path.getTotalLength();let amount=i<phase?1:0;
     if(i===phase){const traversed=Math.max(0,Math.min(len,progress*total-offset));amount=len?traversed/len:0;if(!pen&&progress*total<=offset+len)pen=path.getPointAtLength(traversed);offset+=len;}
     path.style.opacity=i<=phase?'1':'0';path.style.stroke=i<phase?'#318677':'#bc8234';path.style.strokeDasharray=len+' '+len;path.style.strokeDashoffset=String(len*(1-amount));
   }
   if(!pen&&selected.length)pen=selected.at(-1).getPointAtLength(lengths.at(-1));
   if(pen)root.querySelectorAll('.ks-pen,.ks-pen-tip').forEach(el=>{el.setAttribute('cx',pen.x);el.setAttribute('cy',pen.y);});
 }
 function drawGuide(w){const record=glyph(w);w.phase=Math.min(w.phase,record.strokes.length-1);const target=document.querySelector('#ks-guide-svg');if(!target)return;target.innerHTML=svg(record,w.phase);pathProgress(record,w.phase,0); // Start marker; current reference stroke remains visible.
   const root=target.querySelector('svg');root.querySelectorAll(`[data-stroke="${w.phase}"]`).forEach(p=>p.style.strokeDashoffset='0');
   document.querySelector('#ks-stroke-label').textContent=`${tr('Nét','Stroke','画')} ${w.phase+1}/${record.strokes.length}`;
   document.querySelectorAll('[data-ks="stroke"]').forEach(b=>{const chosen=Number(b.dataset.index)===w.phase;b.classList.toggle('active',chosen);b.setAttribute('aria-pressed',String(chosen));});
 }
 function play(w,restart=false){
   if(playState&&!playState.paused&&!restart){cancelAnimationFrame(animation);animation=0;playState.paused=true;const b=document.querySelector('[data-ks="play"]');if(b)b.textContent=tr('▶ Tiếp tục','▶ Continue','▶ 続ける');return;}
   const record=glyph(w),previous=playState?.paused&&!restart?playState:null;stop();
   const phase=restart?0:previous?.phase??w.phase,progress=previous?.progress||0;
   playState={phase,progress,paused:false,started:0};
   const b=document.querySelector('[data-ks="play"]');if(b)b.textContent=tr('⏸ Tạm dừng','⏸ Pause','⏸ 一時停止');
   function frame(at){if(!playState||playState.paused||!active()||P().id!==w.id)return;
     const duration=1500/w.snapshot.speed;if(!playState.started)playState.started=at-playState.progress*duration;
     playState.progress=Math.min(1,Math.max(0,(at-playState.started)/duration));w.phase=playState.phase;
     pathProgress(record,w.phase,playState.progress);
     document.querySelector('#ks-stroke-label').textContent=`${tr('Nét','Stroke','画')} ${w.phase+1}/${record.strokes.length}`;
     document.querySelectorAll('[data-ks="stroke"]').forEach(el=>{const selected=Number(el.dataset.index)===w.phase;el.classList.toggle('active',selected);el.setAttribute('aria-pressed',String(selected));});
     if(playState.progress===1){if(w.phase===record.strokes.length-1){stop();return;}playState.phase++;playState.started=at+200;playState.progress=0;}
     animation=requestAnimationFrame(frame);
   }
   animation=requestAnimationFrame(frame);
 }
 function glyphButtons(w){return D.characters.filter(c=>c.script===w.snapshot.script).map(c=>{const done=w.snapshot.practices.characters.some(r=>r.char===c.char);return `<button type="button" class="ks-glyph ${c.char===w.snapshot.selected?'active':''}" data-ks="select" data-char="${c.char}" aria-label="${c.char} · ${c.romaji}" aria-pressed="${c.char===w.snapshot.selected}"><strong lang="ja">${c.char}</strong><small>${c.romaji}</small>${done?'<span class="ks-practised" aria-label="Đã tự luyện">✓</span>':''}</button>`;}).join('');}
 function page(){const w=ws();if(!w.loaded){return heading(tr('Phòng luyện viết Kana','Kana Writing Studio','かな書き方スタジオ'),'Chọn chữ → xem từng nét → tự viết lại.','FOUNDATION · KANA WRITING STUDIO')+`<section class="card"><p>${esc(w.error||'Đang tải bản viết của hồ sơ…')}</p>${w.error?'<button class="btn primary" data-ks="retry">Thử tải lại</button>':''}</section>`;}
   const c=glyph(w),stats=w.snapshot.practices;
   return `<section class="ks-studio ks-mobile-${w.mobileStep}" data-learner="${esc(w.id)}"><header class="ks-hero"><div><span class="eyebrow">FOUNDATION · KANA WRITING STUDIO</span><h1>${tr('Phòng luyện viết Kana','Kana Writing Studio','かな書き方スタジオ')}</h1><p>Chọn chữ, xem đúng thứ tự nét và điểm đặt bút, rồi tự viết lại theo nhịp của bạn.</p></div>${link(tr('Quay lại Học','Back to Learn','学習に戻る'),'learn','btn','back')}</header><div class="ks-toolbar"><div class="ks-scripts" role="group" aria-label="Bảng chữ">${[['hiragana','あ Hiragana'],['katakana','ア Katakana']].map(([s,label])=>`<button class="btn ${s===w.snapshot.script?'primary':''}" data-ks="script" data-script="${s}" aria-pressed="${s===w.snapshot.script}">${label}</button>`).join('')}</div><div class="ks-toolbar-meta"><p>${stats.total} lượt tự luyện · ${stats.characters.length}/92 chữ${stats.latest?` · Gần nhất: <strong lang="ja">${stats.latest.char}</strong>`:''}</p>${autoButton(audioEnabled(w.id))}</div></div><p id="ks-audio-status" class="ks-audio-status" role="status" aria-live="polite"></p><p id="ks-global-status" class="ks-global-status ${w.error?'is-error':''}" role="status">${esc(w.error||w.message)}</p><div class="ks-global-recovery" ${w.error?'':'hidden'}><button class="btn" data-ks="reload">Tải tiến độ mới</button></div><nav class="ks-steps" aria-label="Ba bước luyện viết">${[['choose','Chọn chữ','Choose','選ぶ'],['watch','Xem từng nét','Watch','書き順'],['write','Tự viết lại','Write','書く']].map(([step,vi,en,ja],i)=>`<button data-ks="step" data-step="${step}" aria-current="${w.mobileStep===step?'step':'false'}"><span>${i+1}</span>${tr(vi,en,ja)}</button>`).join('')}</nav><div class="ks-columns"><section class="card ks-choose"><div class="ks-panel-title"><span class="eyebrow">BƯỚC 1</span><h2>${tr('Chọn chữ cần luyện','Choose a character','練習する文字')}</h2></div><div class="ks-glyph-grid">${glyphButtons(w)}</div><p class="small">46 Hiragana và 46 Katakana cơ bản. Dấu ✓ chỉ ghi nhận đã tự luyện, không xác nhận đã viết đúng hoặc thuộc chữ.</p></section><section class="card ks-watch"><div class="ks-panel-title"><span class="eyebrow">BƯỚC 2</span><h2>${tr('Xem cách viết · từng nét','Watch each stroke','一画ずつ見る')}</h2></div><div class="ks-current"><strong lang="ja">${c.char}</strong><span>${c.romaji}</span>${audioButton('watch',c.char)}<small>${c.strokes.length} nét · Dữ liệu có sẵn</small></div><div id="ks-guide-svg">${svg(c,w.phase)}</div><div class="ks-guide-label"><strong id="ks-stroke-label" aria-live="polite">Nét ${w.phase+1}/${c.strokes.length}</strong><span>Chấm xanh: điểm đặt bút</span></div><div class="ks-controls"><button class="btn primary" data-ks="play">▶ ${tr('Xem cách viết','Play strokes','書き順を見る')}</button><button class="btn" data-ks="prev">← Nét trước</button><button class="btn" data-ks="next">Nét sau →</button><button class="btn" data-ks="replay">↻ Phát lại</button><label class="ks-speed">Tốc độ<select data-ks-speed aria-label="Tốc độ xem nét">${[[.5,'Chậm'],[1,'Bình thường'],[1.5,'Nhanh']].map(([speed,label])=>`<option value="${speed}" ${speed===w.snapshot.speed?'selected':''}>${label}</option>`).join('')}</select></label></div><div class="ks-thumbnails">${c.strokes.map((_,i)=>`<button data-ks="stroke" data-index="${i}" class="${w.phase===i?'active':''}" aria-pressed="${w.phase===i}" aria-label="Xem nét ${i+1}"><span>Nét ${i+1}</span>${svg(c,i,true)}</button>`).join('')}</div><button class="btn ks-to-write" data-ks="step" data-step="write">${tr('Tôi muốn tự viết lại','Practise now','自分で書く')} ${icon('arrow')}</button><p class="ks-source small">Dữ liệu nét: <a href="https://github.com/parsimonhi/animCJK" target="_blank" rel="noopener">AnimCJK</a> · <a href="assets/kana-strokes/NOTICE.txt" target="_blank">Nguồn & giấy phép</a>. Nét đang chọn màu vàng, nét trước màu xanh.</p></section><section class="card ks-write"><div class="ks-panel-title ks-write-title"><div><span class="eyebrow">BƯỚC 3</span><h2>${tr('Tự viết lại','Write it yourself','自分で書く')} <span class="ks-writing-char" lang="ja">${c.char}</span></h2></div>${audioButton('write',c.char)}</div><p class="small">Dùng ngón tay, bút cảm ứng hoặc chuột.</p><div class="ks-canvas-wrap"><canvas id="ks-writing" aria-label="Bảng tự viết ${c.char}" role="img"></canvas></div><div class="ks-writing-tools"><button class="btn" data-ks="undo">↶ Lùi một nét</button><button class="btn" data-ks="clear">Xóa bảng viết</button><button class="btn primary" data-ks="confirm">✓ Đã tự luyện chữ này</button></div><p id="ks-save-status" class="ks-save-status ${w.error?'is-error':''}" role="status">${esc(w.error||w.message||'Bản viết được giữ riêng cho hồ sơ này.')}</p><div class="ks-save-recovery" ${w.error?'':'hidden'}><button class="btn" data-ks="save">Thử lưu lại</button><button class="btn" data-ks="reload">Tải tiến độ mới</button></div><p class="ks-evidence">Tự luyện · Chưa chấm nét hoặc độ chính xác. Xác nhận chỉ ghi một lượt tự luyện; không tăng điểm thành thạo.</p><div class="ks-draft-actions"><button class="textlink" data-ks="export">Tải bản viết để giữ lại</button><button class="textlink" data-ks="step" data-step="watch">Xem lại nét mẫu</button></div><p class="small">${window.NPOnline?'Bản viết được lưu lên tài khoản khi có mạng.':'Đang ở bản thử cục bộ; kết quả không đi vào database học thật.'}</p></section></div></section>`;
 }
 function paint(w,canvas){const ctx=canvas.getContext('2d'),size=canvas.width;ctx.clearRect(0,0,size,size);ctx.fillStyle='#fafcff';ctx.fillRect(0,0,size,size);ctx.strokeStyle='#cad6e0';ctx.lineWidth=size/500;ctx.setLineDash([size/40,size/40]);ctx.beginPath();ctx.moveTo(size/2,0);ctx.lineTo(size/2,size);ctx.moveTo(0,size/2);ctx.lineTo(size,size/2);ctx.stroke();ctx.setLineDash([]);ctx.strokeStyle='#294b60';ctx.lineWidth=size*.012;ctx.lineJoin='round';ctx.lineCap='round';for(const stroke of [...w.drawing,...(w.currentStroke?[w.currentStroke]:[])]){if(!stroke.length)continue;ctx.beginPath();ctx.moveTo(stroke[0][0]*size,stroke[0][1]*size);for(const p of stroke.slice(1))ctx.lineTo(p[0]*size,p[1]*size);ctx.stroke();}}
 function refreshControls(w){if(!active()||P().id!==w.id)return;const busy=w.pending>0;for(const action of ['undo','clear']){const b=document.querySelector(`[data-ks="${action}"]`);if(b)b.disabled=!w.drawing.length||busy;}const confirm=document.querySelector('[data-ks="confirm"]');if(confirm)confirm.disabled=busy||!M.hasWriting(w.drawing)||w.confirmedVersion===w.strokeVersion;document.querySelectorAll('[data-ks="select"],[data-ks="script"],[data-ks="step"]').forEach(b=>b.disabled=!!w.switching);document.querySelectorAll('.ks-save-recovery,.ks-global-recovery').forEach(el=>el.hidden=!w.error);}
 function mount(){if(!active()){stop();return;}if(window.NPOnline&&!NPOnline.ready)return;const w=ws();if(!w.loaded){if(!w.loading&&!w.error)load(w);return;}const root=document.querySelector('.ks-studio');if(!root)return;drawGuide(w);const canvas=document.querySelector('#ks-writing');if(!canvas||canvas.dataset.mounted)return;canvas.dataset.mounted='true';canvas.width=800;canvas.height=800;paint(w,canvas);let pointer=null;
   const point=event=>{const rect=canvas.getBoundingClientRect();return [Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width)),Math.max(0,Math.min(1,(event.clientY-rect.top)/rect.height))];};
   canvas.addEventListener('pointerdown',event=>{if(pointer!==null||event.button!==0||w.switching)return;event.preventDefault();pointer=event.pointerId;canvas.setPointerCapture(pointer);w.currentStroke=[point(event)];paint(w,canvas);});
   canvas.addEventListener('pointermove',event=>{if(pointer!==event.pointerId||!w.currentStroke)return;event.preventDefault();const p=point(event),last=w.currentStroke.at(-1);if(Math.hypot(p[0]-last[0],p[1]-last[1])>.002){w.currentStroke.push(p);if(w.currentStroke.length>256)w.currentStroke=w.currentStroke.filter((_,i)=>i%2===0);}paint(w,canvas);});
   function finish(event){if(pointer!==event.pointerId)return;const cancelled=event.type==='pointercancel';pointer=null;if(!cancelled&&w.currentStroke?.length){if(w.drawing.length>=32){message(w,'Bảng hiện tối đa 32 nét. Lùi nét hoặc xóa bảng để viết lại.',true);}else{w.drawing.push(w.currentStroke);w.strokeVersion++;w.dirty=true;scheduleSave(w);}}w.currentStroke=null;paint(w,canvas);refreshControls(w);}
   canvas.addEventListener('pointerup',finish);canvas.addEventListener('pointercancel',finish);refreshControls(w);
 }
 async function choose(w,char){if(!records.has(char)||w.switching)return;w.switching=true;refreshControls(w);try{if(!await saveDraft(w))return;stop();const result=await commit(w,{action:'select',char});w.drawing=copy(result.draft);w.strokeVersion++;w.confirmedVersion=-1;w.phase=0;w.mobileStep='watch';if(active()&&P().id===w.id){render(false);revealWorkspace();}}catch{}finally{w.switching=false;refreshControls(w);}}
 document.addEventListener('click',async event=>{
   const b=event.target.closest('[data-ks]');if(!b)return;event.preventDefault();event.stopImmediatePropagation();const w=ws(),action=b.dataset.ks;
   try{
    if(action==='retry'){w.error='';load(w);return;}if(!w.loaded)return;
    if(action==='speak'){sayKana(glyph(w));return;}
    if(action==='auto-audio'){const enabled=!audioEnabled(w.id);saveAudioEnabled(w.id,enabled);if(!enabled)stopAudio();b.setAttribute('aria-pressed',String(enabled));b.querySelector('.ks-auto-indicator').textContent=enabled?tr('Bật','On','オン'):tr('Tắt','Off','オフ');audioStatus('');return;}
    if(action==='select'){if(audioEnabled(w.id)&&records.has(b.dataset.char)&&!w.switching)sayKana(records.get(b.dataset.char));await choose(w,b.dataset.char);return;}
    if(action==='script'){const saved=D.characters.find(c=>c.script===b.dataset.script);if(!saved)return;if(audioEnabled(w.id)&&!w.switching)sayKana(saved);await choose(w,saved.char);w.mobileStep='choose';if(active())render(false);return;}
    if(action==='step'){stop();if(!await saveDraft(w))return;w.mobileStep=b.dataset.step;render(false);revealWorkspace();return;}
    if(action==='play'){play(w);return;}if(action==='replay'){play(w,true);return;}
    if(['prev','next','stroke'].includes(action)){stop();const n=glyph(w).strokes.length;w.phase=action==='stroke'?Number(b.dataset.index):Math.max(0,Math.min(n-1,w.phase+(action==='next'?1:-1)));drawGuide(w);return;}
    if(action==='undo'||action==='clear'){stop();if(action==='undo')w.drawing.pop();else w.drawing=[];w.strokeVersion++;w.dirty=true;paint(w,document.querySelector('#ks-writing'));refreshControls(w);await saveDraft(w);return;}
    if(action==='save'){await saveDraft(w);return;}
    if(action==='reload'){if(w.dirty){modal('Giữ bản viết trước khi tải lại','<p>Thiết bị khác có thể đã lưu bản mới. Tải tiến độ mới sẽ thay bản nháp đang giữ trên màn hình này.</p><div class="actions"><button class="btn" data-ks="export">Tải bản viết để giữ lại</button><button class="btn primary" data-ks="reload-confirm">Tải lại và thay bản nháp</button></div>');}else await load(w);return;}
    if(action==='reload-confirm'){await w.queue;closeModal();await load(w);return;}
    if(action==='confirm'){stop();clearTimeout(saveTimer);const version=w.strokeVersion;await commit(w,{action:'confirm',char:w.snapshot.selected,strokes:M.drawing(w.drawing)});if(version===w.strokeVersion){w.dirty=false;w.confirmedVersion=version;}message(w,'Đã ghi nhận một lượt tự luyện. Chưa đánh giá đúng/sai.');document.querySelectorAll('.ks-glyph').forEach(el=>{if(w.snapshot.practices.characters.some(r=>r.char===el.dataset.char)&&!el.querySelector('.ks-practised'))el.insertAdjacentHTML('beforeend','<span class="ks-practised" aria-label="Đã tự luyện">✓</span>');});const p=document.querySelector('.ks-toolbar>p');if(p)p.textContent=`${w.snapshot.practices.total} lượt tự luyện · ${w.snapshot.practices.characters.length}/92 chữ · Gần nhất: ${w.snapshot.selected}`;return;}
    if(action==='export'){const blob=new Blob([JSON.stringify({schemaVersion:1,learnerId:w.id,char:w.snapshot.selected,strokes:w.drawing,evidence:'ungraded-writing-draft'},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Kana_'+w.snapshot.selected+'_draft.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return;}
   }catch(error){message(w,error.message,true);}
 },true);
 document.addEventListener('change',async event=>{if(!event.target.matches('[data-ks-speed]'))return;stop();const w=ws();try{await commit(w,{action:'speed',speed:Number(event.target.value)});}catch(error){message(w,error.message,true);}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAudio();});
 window.addEventListener('beforeunload',event=>{if([...workspaces.values()].some(w=>w.dirty||w.pending)){event.preventDefault();event.returnValue='';}});
 window.NPKanaStudio={page,mount,flush:()=>{const w=current();return w?saveDraft(w):Promise.resolve(true);},hasUnsaved:()=>[...workspaces.values()].some(w=>w.dirty||w.pending),summary:id=>workspaces.get(id)?.snapshot.practices};
 const previous=kanaPage;kanaPage=()=>page();const sectionBefore=activeSection;activeSection=r=>r.split('/')[0]==='kana'?'learn':sectionBefore(r);const titleBefore=titleOf;titleOf=r=>r.split('/')[0]==='kana'?tr('Phòng luyện viết Kana','Kana Writing Studio','かな書き方スタジオ'):titleBefore(r);const renderBefore=render;render=function(scroll){if(!active()){stop();stopAudio();}else if(audioOwner&&audioOwner!==P().id)stopAudio();renderBefore(scroll);mount();};
})();
