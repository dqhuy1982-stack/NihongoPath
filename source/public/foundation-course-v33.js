/* HORIZON Foundation v33 · modular learning, contextual kana practice, no backend dependencies.
   Practice records are browser-local preview data; never modify lesson-engine progress. */
(function(){
'use strict';
const DATA=window.NPFoundationCurriculum;if(!DATA)return;
const clean=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const routePrefix='learn/foundation',base='#'+routePrefix;
const modes=[
 ['learn','Học','book-open'],['flash','Flashcard','layers'],['listen','Nghe → chữ','volume-2'],['truefalse','Đúng / Sai','check-circle'],['quiz','Chữ → âm','target'],
 ['reverse','Âm → chữ','arrow-left-right'],['match','Ghép cặp','grid-2x2'],['build','Xếp chữ','puzzle'],
 ['vocab-ja-vi','Nhật → Việt','languages'],['vocab-vi-ja','Việt → Nhật','languages'],['listen-match','Nghe & ghép','headphones'],['review','Ôn chữ yếu','refresh-cw'],['mix','Kiểm tra tổng hợp','check-circle-2']
];
const modeNames=Object.fromEntries(modes.map(([id,title])=>[id,title]));
const initialGroup=m=>m.id==='small'?'pause':'all';
const path=(id,group,mode,script)=>routePrefix+'/'+id+'/'+(group||initialGroup(DATA.byId[id]))+'/'+(mode||'learn')+(script&&script!=='both'?'/'+script:'');
function current(){
 const bits=decodeURIComponent(location.hash.replace(/^#\/?/,'')).split('/');
 const id=bits[2],mod=DATA.byId[id],group=bits[3]|| (mod?initialGroup(mod):''),mode=bits[4]||'learn',script=bits[5]||'both';
 return {id,mod,group:mod&&(group==='all'||mod.groups.some(x=>x.id===group))?group:mod?initialGroup(mod):'',mode:modeNames[mode]?mode:'learn',script:['hira','kata','both'].includes(script)?script:'both'};
}
function learnerId(){try{return String(P()?.id||'guest').replace(/[^a-z0-9_-]/gi,'_')}catch{return 'guest'}}
const localKey=()=>'Horizon.FoundationPractice.v1.'+learnerId();
function load(){
 try{const d=JSON.parse(localStorage.getItem(localKey())||'null');if(d?.schema===1&&d.items&&d.flash)return d;}catch(e){}
 return {schema:1,items:{},flash:{},history:[]};
}
let cache=null,cacheKey=null;
function store(){const k=localKey();if(cacheKey!==k){cacheKey=k;cache=load();}return cache}
function persist(){try{localStorage.setItem(localKey(),JSON.stringify(store()))}catch(e){/* private browsing: in-memory only */}}
function dueDate(date,n){const d=new Date(date);d.setUTCDate(d.getUTCDate()+n);return d.toISOString()}
const RESPONSE_TARGET_MS=5000; // configurable learning heuristic, not a JLPT or fluency standard.
const MIN_RESPONSE_MS=0;
function grade(elapsedMs,correct){
 const ms=Number.isFinite(elapsedMs)?Math.max(MIN_RESPONSE_MS,Math.round(elapsedMs)):null;
 return {responseMs:ms,slow:!!correct&&ms!==null&&ms>RESPONSE_TARGET_MS,
  outcome:!correct?'incorrect':ms!==null&&ms>RESPONSE_TARGET_MS?'slow':'correct'};
}
function record(item,correct,mode,elapsedMs=null){
 const d=store(),id=item.id,prev=d.items[id]||{attempts:0,correct:0,streak:0,slowCount:0,errorCount:0};
 const now=new Date().toISOString(),measure=grade(elapsedMs,correct);
 const streak=correct&&!measure.slow?Math.min(5,prev.streak+1):0;
 const oldTimes=Array.isArray(prev.recentMs)?prev.recentMs:[];
 const recentMs=measure.responseMs===null?oldTimes:oldTimes.concat(measure.responseMs).slice(-8);
 const needsReview=!correct||measure.slow;
 d.items[id]={...prev,attempts:prev.attempts+1,correct:prev.correct+Number(correct),
  slowCount:(prev.slowCount||0)+Number(measure.slow),
  errorCount:(prev.errorCount||0)+Number(!correct),
  streak,lastAt:now,latestOutcome:measure.outcome,lastResponseMs:measure.responseMs,recentMs,
  nextAt:dueDate(now,needsReview?0:[1,1,3,7,14,30][streak]),lastMode:mode};
 d.history.push({id,correct,mode,at:now,ms:measure.responseMs,outcome:measure.outcome});
 if(d.history.length>450)d.history=d.history.slice(-450);
 persist();return measure;
}
function priority(item){
 const stat=store().items[item.id];
 if(!stat)return 1;
 const overdue=stat.nextAt&&new Date(stat.nextAt).getTime()<=Date.now();
 const weak=stat.latestOutcome==='incorrect'||stat.latestOutcome==='slow';
 return 1+(overdue?5:0)+(weak?5:0)+(stat.streak===0?2:0);
}
function chooseTargets(items,n){
 const remaining=shuffle(items),out=[];
 while(remaining.length&&out.length<n){
  const weight=remaining.map(priority),total=weight.reduce((s,w)=>s+w,0);
  let r=Math.random()*total,j=0;
  for(;j<remaining.length-1;j++){r-=weight[j];if(r<0)break}
  out.push(remaining.splice(j,1)[0]);
 }
 return out;
}
function reviewPool(list){
 const d=store().items;
 const candidates=list.filter(x=>d[x.id]&&(d[x.id].latestOutcome!=='correct'||new Date(d[x.id].nextAt).getTime()<=Date.now()));
 return candidates.length?candidates:list;
}
function timeLabel(ms){return (Math.max(0,ms||0)/1000).toFixed(1)+'s'}

function countStats(list){
 const m=store().items,unique=[...new Set(list.map(x=>x.id))],stats=unique.map(id=>m[id]).filter(Boolean);
 return {reviewed:stats.length,total:unique.length,attempts:stats.reduce((n,a)=>n+a.attempts,0),correct:stats.reduce((n,a)=>n+a.correct,0),
 due:stats.filter(a=>a.nextAt&&new Date(a.nextAt)<=new Date()).length};
}
const pick=(a,n)=>shuffle(a).slice(0,n);
function shuffle(arr){const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a}
function tokens(config){
 if(!config.mod)return [];
 if(config.id==='small'){
  const selected=DATA.words.filter(w=>w.stage==='small'&&(config.group==='all'?true:config.group==='pause'?/[っッ]/u.test(w.glyph):config.group==='length'?w.glyph.includes('ー'):config.group==='vowels'?/[ァィゥェォ]/u.test(w.glyph):true));
  return selected.length>=2?selected:DATA.words.filter(w=>w.stage==='small');
 }
 return DATA.take(config.id,config.group,config.script);
}
function contextual(config){
 const a=DATA.contextual(config.id,config.script);
 if(config.id==='hiragana'||config.id==='katakana'){
  const rowIndex=config.group==='all'?DATA.rows.length-1:DATA.rows.findIndex(x=>x[0]===config.group);
  const known=new Set(DATA.rows.slice(0,Math.max(0,rowIndex)+1).flatMap(row=>Array.from(config.id==='hiragana'?row[2]:row[3])));
  return a.filter(w=>w.stage==='basic'&&Array.from(w.glyph).every(ch=>known.has(ch)));
 }
 return a;
}
function activityPool(config,mode){
 return mode.startsWith('vocab')||mode==='build'?contextual(config):tokens(config);
}
const isWord=item=>typeof item.vi==='string';
function readable(item){return isWord(item)?item.vi:item.read}
function choosePool(config,mode){
 let pool=activityPool(config,mode);
 if(mode==='reverse'||mode==='match'||mode==='listen'||mode==='listen-match'){
  const all=config.id==='small'?pool:DATA.take(config.id,'all',config.script);
  const counts={};for(const x of all){const v=readable(x)+'|'+x.script;counts[v]=(counts[v]||0)+1;}
  pool=pool.filter(x=>counts[readable(x)+'|'+x.script]===1);
 }
 return pool;
}
function questionFor(item,mode,pool){
 const isVocab=mode.startsWith('vocab')||isWord(item);
 const sameType=pool.filter(x=>isWord(x)===isVocab);
 const sameScript=isVocab?sameType:sameType.filter(x=>x.script===item.script);
 const ambiguous=!isVocab&&sameScript.filter(x=>x.read===item.read).length>1;
 if(mode==='truefalse'){
  const alternate=pick(sameScript.filter(x=>x.id!==item.id&&x.read!==item.read),1)[0];
  const shown=alternate&&Math.random()<.5?alternate.read:item.read;
  const yes=shown===item.read;
  return {item,mode,prompt:'Cách đọc này có đúng không?',stimulus:item.glyph+' → '+shown,
   choices:[{id:'yes',label:'Đúng'},{id:'no',label:'Sai'}],correct:yes?'yes':'no',
   note:'Đáp án: '+item.glyph+' → '+item.read+'. '+(item.note||'Nhìn lại hình chữ và tự nhớ âm trước khi chọn.')};
 }
 if(mode==='listen'){
  const candidates=shuffle(sameScript.filter(x=>x.id!==item.id&&x.glyph!==item.glyph));
  const choices=[item,...candidates.slice(0,3)].map(x=>({id:x.id,label:x.glyph}));
  return {item,mode,prompt:'Nghe âm, sau đó chọn chữ tương ứng.',stimulus:'',choices:shuffle(choices),correct:item.id,
   note:'Âm đã nghe: '+item.read+' → '+item.glyph+'. '+(item.note||'Có thể nghe lại trước khi trả lời.')};
 }
 const inverse=mode==='reverse'||mode==='vocab-vi-ja'||mode==='mix'&&Math.random()<.5&&!ambiguous;
 const key=x=>inverse?x.glyph:isVocab?x.vi:x.read;
 const prompt=inverse?(isVocab?'Chọn từ tiếng Nhật phù hợp với nghĩa:':'Chọn '+(item.script==='hira'?'Hiragana':'Katakana')+' ứng với âm:'):isVocab?'Từ này có nghĩa tiếng Việt nào?':'Chữ Kana này đọc thế nào?';
 const stimulus=inverse?(isVocab?item.vi:item.read):item.glyph;
 const poolForChoices=inverse&&!isVocab?sameScript:sameType;
 const candidates=shuffle(poolForChoices.filter(x=>x.id!==item.id&&key(x)!==key(item)));
 const unique=[],labels=new Set([key(item)]);
 for(const x of candidates){if(labels.has(key(x)))continue;labels.add(key(x));unique.push(x);if(unique.length===3)break}
 const choices=[item,...unique].map(x=>({id:x.id,label:key(x)}));
 return {item,mode,prompt,stimulus,choices:shuffle(choices),correct:item.id,
 note:isVocab?(item.note||'Ghi nhớ nghĩa từ theo ngữ cảnh.'):item.note||('Chữ '+item.glyph+' đọc là '+item.read+'.')};
}
let play=null;
const sessionKey=config=>learnerId()+':'+config.id+':'+config.group+':'+config.mode+':'+config.script;
function ensurePlay(config){
 const key=sessionKey(config);if(play?.key===key)return play;
 const kind=config.mode;
 const source=choosePool(config,kind);
 const list=kind==='review'?reviewPool(source):source;
 if(kind==='build'){
  const cards=chooseTargets(contextual(config),5);
  play={key,kind,cards,index:0,selected:[],tileOrder:cards.length?shuffle(Array.from(cards[0].glyph).map((glyph,i)=>({glyph,i}))):[],answer:null,correct:0,finished:cards.length===0,startedAt:Date.now()};
 }else if(kind==='match'||kind==='listen-match'){
  const permitted=kind==='listen-match'?list.filter(x=>x.stage!=='small'&&Array.from(x.glyph).length<=3):list;
  const cards=chooseTargets(kind==='listen-match'&&config.script==='both'?permitted.filter(x=>x.script==='hira'):permitted,Math.min(6,permitted.length));
  play={key,kind,cards,left:shuffle(cards),right:shuffle(cards),leftId:null,rightId:null,matched:[],mistakes:0,answered:0,feedback:'',finished:cards.length===0,startedAt:Date.now()};
 }else if(kind==='flash'){
  play={key,kind,cards:shuffle(list),index:0,flipped:false,remembered:0,needsReview:0};
 }else{
  const targets=chooseTargets(kind==='listen'?list.filter(x=>x.stage!=='small'&&Array.from(x.glyph).length<=3):list,Math.min(10,list.length));
  const allPool=kind.startsWith('vocab')||config.id==='small'?contextual(config):DATA.take(config.id,'all',config.script);
  const valid=targets.filter(x=>allPool.filter(p=>p.id!==x.id&&isWord(p)===isWord(x)).length>=2);
  const qMode=kind==='review'?'mix':kind;
  play={key,kind,questions:valid.map(x=>questionFor(x,qMode,allPool)),index:0,correct:0,answered:0,choice:null,finished:valid.length===0,startedAt:Date.now(),roundMs:[],slow:0,errors:0};
 }
 return play;
}

function elapsed(s){return Math.max(0,Date.now()-(s.startedAt||Date.now()))}
function clock(s,answered=false){return '<div class="v37-clock" aria-label="Thời gian phản hồi"><span aria-hidden="true">◷</span><strong data-f37-timer>'+timeLabel(answered?(s.lastMs||0):elapsed(s))+'</strong><small>'+(answered?'Đã trả lời':'Đang tính giờ')+'</small></div>';}
let ticker=null;
function tickClock(){if(typeof setInterval!=='function'||ticker!==null)return;ticker=setInterval(()=>{const el=document.querySelector?.('[data-f37-timer]');if(el&&play&&!play.finished&&!play.choice&&!play.answer&&play.kind!=='flash')el.textContent=timeLabel(elapsed(play));},100);}
function weakList(cfg){const rec=store().items;return DATA.take(cfg.id,'all',cfg.script).filter(x=>{const v=rec[x.id];return v&&(v.latestOutcome!=='correct'||new Date(v.nextAt).getTime()<=Date.now())}).sort((a,b)=>priority(b)-priority(a)).slice(0,6);}
function navigate(route){location.hash='#'+route}
function refresh(){
 const stage=document.querySelector('.v34-workspace-shell');
 if(stage){stage.innerHTML=workspace(current());tickClock();return}
 render(false);
}
function wrap(content,crumb='Nền tảng'){
 const shell=window.NPHorizonV25?.shell?.('catalog')||'<header class="v25-header"><div class="v25-hero-copy"><h1>Không gian học tập</h1></div></header>';
 return '<div class="v25-wrap v33-foundation" data-learning-hub="v34">'+shell+
 '<nav class="v25-breadcrumb" aria-label="Vị trí học tập"><a href="#learn/overview">Học</a><span aria-hidden="true">›</span><a href="#learn/catalog">Khóa học</a><span aria-hidden="true">›</span><a href="#course/foundation">Nền tảng</a>'+(crumb==='Nền tảng'?'':'<span aria-hidden="true">›</span><span aria-current="page">'+clean(crumb)+'</span>')+'</nav>'+
 content+'<footer class="v25-version">HORIZON · Foundation Studio v37 · Prototype (lưu luyện tập trên thiết bị)</footer></div>';
}
function tag(txt){return '<span class="v33-tag">'+clean(txt)+'</span>'}
function moduleStats(module){
 const list=DATA.take(module.id,'all','both');
 return countStats(list);
}
function indexPage(){
 const modules=DATA.modules;
 const first=modules.find(m=>{const s=moduleStats(m);return s.reviewed<s.total})||modules[0];
 return wrap('<div class="v33-intro"><div><p class="v33-eyebrow">NỀN TẢNG · LEARNING PATH</p><h2>Nhận mặt chữ, nhớ âm, rồi dùng được.</h2><p>Mỗi chặng có học hướng dẫn, flashcard, bài ghép cặp, kiểm tra hai chiều và từ ngữ cảnh. Bạn không cần hoàn tất mọi bài một lần.</p></div><a href="#'+path(first.id)+'" class="v33-primary">Tiếp tục lộ trình →</a></div>'+
 '<div class="v33-level-grid">'+modules.map((m,i)=>{
 const s=moduleStats(m),num=m.id==='hiragana'?46:m.id==='katakana'?46:m.id==='dakuten'?50:m.id==='yoon'?66:m.id==='small'?DATA.counts.small:DATA.deck.length;
 return '<a href="#'+path(m.id)+'" class="v33-level-card"><div class="v33-level-top"><span class="v33-index">'+String(i+1).padStart(2,'0')+'</span>'+tag(s.reviewed+' / '+s.total+' mẫu đã luyện')+'</div><h3>'+clean(m.title)+'</h3><p>'+clean(m.subtitle)+'</p><span class="v33-track"><span style="width:'+(s.total?Math.round(s.reviewed/s.total*100):0)+'%"></span></span><div class="v33-level-bottom"><span>'+(s.due?'Đến hạn ôn: '+s.due+' mẫu':'Học theo thứ tự gợi ý')+'</span><strong>Mở chặng →</strong></div></a>';
 }).join('')+'</div>'+
 '<div class="v33-notice"><strong>Phân biệt ba trạng thái:</strong> Đã xem flashcard ≠ đã trả lời đúng ≠ ghi nhớ lâu dài. Tiến độ ở đây là số mẫu đã luyện trên thiết bị; không thay thế kết quả bài học chính thức hay chứng nhận trình độ.</div>');
}
function navigationFor(cfg){
 const m=cfg.mod,s=moduleStats(m);
 const opts=DATA.modules.map(x=>'<option value="'+x.id+'" '+(x.id===cfg.id?'selected':'')+'>'+clean(x.title)+'</option>').join('');
 const practices=[['review','Ôn chữ còn yếu'],['quiz','Chữ → âm'],['reverse','Âm → chữ'],...(cfg.id!=='small'&&cfg.id!=='mixed'?[['listen','Nghe → chữ'],['listen-match','Nghe & ghép cặp']]:[]),['truefalse','Đúng / Sai'],['match','Ghép cặp'],['build','Xếp chữ'],['vocab-ja-vi','Nhật → Việt'],['vocab-vi-ja','Việt → Nhật']];
 const group=cfg.mode==='learn'?'learn':cfg.mode==='flash'?'flash':cfg.mode==='mix'?'mix':'practice';
 const actions=[['learn','1. Học bảng chữ'],['flash','2. Flashcard'],['practice','3. Luyện tập'],['mix','4. Kiểm tra tổng hợp']];
 const stepIcons={
 learn:'<path d="M12 7v14m0-14C9.5 5.6 6.5 5 3 6v14c3.5-1 6.5-.5 9 1m0-14c2.5-1.4 5.5-2 9-1v14c-3.5-1-6.5-.5-9 1"/>',
 flash:'<rect x="3" y="5" width="13" height="16" rx="2"/><path d="M7 2h12a2 2 0 0 1 2 2v12M7 10h5M7 14h5"/>',
 practice:'<path d="M9 11l2 2 4-4"/><circle cx="12" cy="12" r="9"/>',
 mix:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 3v4m0 10v4M3 12h4m10 0h4"/>'
 };
 const tabs=actions.map(([id,label])=>'<button type="button" data-f34="tab" data-value="'+id+'" class="v34-stage-tab '+(id===group?'active':'')+'" '+(id===group?'aria-current="step"':'')+'><svg class="v36-step-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">'+stepIcons[id]+'</svg><span>'+label+'</span></button>').join('');
 const all=DATA.take(cfg.id,'all',cfg.script),stats=countStats(all);
 return '<div class="v34-topline"><div class="v34-course-picker"><label for="v34-module">Đang học</label><select id="v34-module" data-f34="module" aria-label="Chọn nội dung Nền tảng">'+opts+'</select></div>'+
 '<div class="v34-topline-info"><strong>'+clean(m.subtitle)+'</strong><small>'+stats.reviewed+' / '+stats.total+' mẫu đã luyện thử</small></div><a class="v34-back" href="#course/foundation">Tất cả nội dung</a></div>'+
 '<div class="v34-stagebar" role="navigation" aria-label="Bước học">'+tabs+'</div>'+
 '<div class="v34-options">'+(m.script==='both'?'<label>Bảng chữ <select data-f34="script" aria-label="Chọn bảng chữ">'+[['both','Cả hai'],['hira','Hiragana'],['kata','Katakana']].map(([id,t])=>'<option value="'+id+'" '+(cfg.script===id?'selected':'')+'>'+t+'</option>').join('')+'</select></label>':'')+
 (group==='practice'?'<label>Dạng luyện <select data-f34="mode" aria-label="Chọn dạng luyện tập">'+practices.map(([id,t])=>'<option value="'+id+'" '+(cfg.mode===id?'selected':'')+'>'+t+'</option>').join('')+'</select></label>':'')+
 (cfg.id==='small'&&group==='learn'?'<label>Chủ đề <select data-f34="small" aria-label="Chọn chủ đề chữ nhỏ">'+[['all','Tất cả'],['pause','っ / ッ'],['length','Âm dài ー'],['vowels','Nguyên âm nhỏ']].map(([id,t])=>'<option value="'+id+'" '+(cfg.group===id?'selected':'')+'>'+t+'</option>').join('')+'</select></label>':'')+
 '<span class="v34-hint">'+(group==='learn'?'46 chữ hiển thị cùng nhau, nhấn loa để nghe.':group==='flash'?'Nhớ trước, lật sau.':group==='mix'?'Câu hỏi được trộn trong chặng.':'Chọn một dạng để luyện trong khung này.')+'</span></div>';
}
function coachSeen(){try{return localStorage.getItem('Horizon.KanaTapGuide.v1.'+learnerId())==='yes'}catch{return false}}
function dismissCoach(){try{localStorage.setItem('Horizon.KanaTapGuide.v1.'+learnerId(),'yes')}catch(e){}const tip=document.querySelector('.v35-kana-guide');if(tip?.remove)tip.remove();const first=document.querySelector('.v35-first-kana');if(first?.classList?.remove)first.classList.remove('v35-first-kana')}
const BASIC_AUDIO=/^(?:a|i|u|e|o|ka|ki|ku|ke|ko|sa|shi|su|se|so|ta|chi|tsu|te|to|na|ni|nu|ne|no|ha|hi|fu|he|ho|ma|mi|mu|me|mo|ya|yu|yo|ra|ri|ru|re|ro|wa|wo|n)$/;
let currentAudio=null;
function audioStatus(msg){
 const status=document.querySelector?.('.v36-audio-status');
 if(status){status.textContent=msg||'';status.hidden=!msg}
}
function pronounce(glyph,reading='',preferRecorded=true){
 const safeGlyph=String(glyph||'');
 if(!safeGlyph||safeGlyph.length>40)return false;
 if(currentAudio){try{currentAudio.pause();currentAudio.currentTime=0}catch(e){}currentAudio=null}
 if(typeof speechSynthesis!=='undefined')try{speechSynthesis.cancel()}catch(e){}
 // The same isolated Kana syllable recording can be used for Hiragana or Katakana.
 if(preferRecorded&&Array.from(safeGlyph).length===1&&BASIC_AUDIO.test(reading)){
  try{
   const recording=new Audio('assets/kana-audio/'+reading+'.mp3');
   currentAudio=recording;
   audioStatus('');
   const result=recording.play();
   if(result&&result.catch)result.catch(()=>speakJapanese(safeGlyph));
   return true;
  }catch(e){/* proceed to Japanese voice fallback */}
 }
 return speakJapanese(safeGlyph);
}
function speakJapanese(glyph){
 if(typeof speechSynthesis==='undefined'||typeof SpeechSynthesisUtterance==='undefined'){
  audioStatus('Thiết bị chưa hỗ trợ phát âm nội dung này. 46 âm Kana cơ bản vẫn có file ghi âm.');
  return false;
 }
 try{
  const voices=speechSynthesis.getVoices?.()||[];
  const voice=voices.find(v=>/^ja(?:-|_)/i.test(v.lang||''));
  if(voices.length&&!voice){audioStatus('Chưa có giọng tiếng Nhật trên thiết bị. Hãy cài giọng Japanese trong hệ điều hành.');return false;}
  const speech=new SpeechSynthesisUtterance(glyph);
  speech.lang='ja-JP';speech.rate=.82;speech.pitch=1;
  if(voice)speech.voice=voice;
  speech.onstart=()=>audioStatus('Đang phát bằng giọng tiếng Nhật của thiết bị (không phải file ghi âm).');
  speech.onerror=()=>audioStatus('Không phát được giọng tiếng Nhật trên thiết bị này.');
  speech.onend=()=>audioStatus('');
  audioStatus('Phát âm bằng giọng tiếng Nhật của thiết bị.');
  speechSynthesis.speak(speech);
  return true;
 }catch(e){audioStatus('Không phát được giọng tiếng Nhật trên thiết bị này.');return false}
}
function voiceText(item){
 if(!item)return '';
 if(item.stage==='small'&&item.glyph==='っ')return 'きって';
 if(item.stage==='small'&&item.glyph==='ッ')return 'ベッド';
 if(item.glyph==='ー')return 'コーヒー';
 return item.glyph;
}
function learnView(cfg){
 const deck=tokens(cfg);
 const s=countStats(deck),examples=cfg.id==='small'?(cfg.group==='all'?{marks:DATA.smallSamples.map(x=>x.marks).join(' · '),examples:DATA.smallSamples.flatMap(x=>x.examples)}:DATA.smallSamples.find(x=>x.id===cfg.group)):null;
 let guideFocusUsed=false;
 const tiles=arr=>arr.map((x,i)=>{const focus=!guideFocusUsed&&!coachSeen();if(focus)guideFocusUsed=true;return '<button type="button" class="v33-glyph-card v35-kana-button '+(focus?'v35-first-kana':'')+'" data-f33="pronounce" data-value="'+clean(x.glyph)+'" data-reading="'+clean(x.read)+'" data-kind="'+clean(x.stage)+'" aria-label="Nghe '+clean(x.glyph)+(x.read?' · '+clean(x.read):'')+'"><span lang="ja">'+clean(x.glyph)+'</span><strong>'+clean(x.read)+'</strong>'+(isWord(x)?'<small>'+clean(x.vi)+'</small>':'')+'</button>';}).join('');
 const grouped=cfg.group==='all'&&cfg.id!=='small'&&cfg.id!=='mixed'&&cfg.mod.groups.length>1;
 const grid=grouped?cfg.mod.groups.map(g=>{
  const groupCards=deck.filter(x=>x.group===g.id).sort((a,b)=>a.script===b.script?0:a.script==='hira'?-1:1);
  if(!groupCards.length)return '';
  return '<section class="v36-kana-row"><div class="v36-row-label"><strong>'+clean(g.title)+'</strong><span>'+groupCards.length+' mẫu · Chạm để nghe</span></div><div class="v33-glyph-grid">'+tiles(groupCards)+'</div></section>';
 }).join(''):'<div class="v33-glyph-grid">'+tiles(deck)+'</div>';
 const selected=deck[0];
 const exampleMarkup=examples?'<div class="v33-examples">'+examples.examples.map(([glyph,read,meaning])=>'<button type="button" class="v36-example-button" data-f33="pronounce" data-value="'+clean(glyph)+'" data-reading="'+clean(read)+'" data-kind="small" aria-label="Nghe ví dụ '+clean(glyph)+'"><b lang="ja">'+clean(glyph)+'</b><span>'+clean(read)+'</span><small>'+clean(meaning)+'</small></button>').join('')+'</div>':'';
 const note=cfg.id==='small'?'Chữ nhỏ, っ/ッ và dấu ー không được đọc như âm riêng. Chạm vào từ ví dụ để nghe trong ngữ cảnh. Giọng đọc tự động có thể khác file ghi âm chuẩn.':selected?.note;
 const marks=cfg.id==='small'&&examples?.marks?'<div class="v33-small-marks" lang="ja">'+clean(examples.marks)+'</div>':'';
 return '<section class="v33-pane"><div class="v33-pane-head"><div><p class="v33-eyebrow">01 / HỌC & NHẬN DIỆN</p><h3>'+(cfg.group==='all'?cfg.mod.title:cfg.mod.groups.find(g=>g.id===cfg.group)?.title||cfg.mod.title)+'</h3><p>Quan sát nhóm chữ, đối chiếu cách đọc; sau đó ẩn gợi ý qua Flashcard.</p></div>'+tag(deck.length+' mẫu')+'</div>'+
 (deck.length>0&&!coachSeen()?'<div class="v35-kana-guide" role="note"><span>Chạm vào <strong>bất kỳ ô chữ hoặc từ nào</strong> để nghe. Âm cơ bản dùng file ghi âm; âm đặc biệt dùng giọng Nhật trên thiết bị.</span><button type="button" data-f33="guide-ok" aria-label="Đóng hướng dẫn">Đã hiểu</button></div>':'')+marks+'<div class="v36-kana-board v36-board-'+clean(cfg.id)+'" aria-label="Bảng Kana đầy đủ">'+grid+'</div>'+'<p class="v36-audio-status" role="status" aria-live="polite" hidden></p>'+exampleMarkup+
 (note?'<div class="v33-teacher-note"><strong>Ghi chú của giáo viên</strong><p>'+clean(typeof note==='string'?note:'')+'</p></div>':'')+
 '<div class="v33-pane-actions v36-next-actions"><button type="button" data-f34="tab" data-value="flash" class="v33-primary">Tiếp theo: Flashcard <span aria-hidden="true">→</span></button><button type="button" data-f34="tab" data-value="practice" class="v33-secondary">Luyện tập <span aria-hidden="true">↗</span></button><a href="#kana" class="v33-secondary">Luyện viết Kana <span aria-hidden="true">✎</span></a></div></section>';
}
function flashView(cfg,s){
 const item=s.cards[s.index];
 if(!item)return noData('Chưa có thẻ cho nhóm này.');
 const flipped=s.flipped,marked=store().flash[item.id];
 return '<section class="v33-pane"><div class="v33-pane-head"><div><p class="v33-eyebrow">02 / FLASHCARD · TỰ NHỚ</p><h3>Nhìn trước, lật sau</h3><p>Thử đọc trong đầu trước khi lật. Đánh giá “Nhớ” chỉ là tự nhận xét, không tính điểm kiểm tra.</p></div>'+tag((s.index+1)+' / '+s.cards.length)+'</div>'+
 '<button class="v33-flash '+(flipped?'is-back':'')+'" data-f33="flip" aria-label="Lật thẻ Flashcard"><span class="v33-flash-caption">'+(flipped?'ĐÁP ÁN':'THỬ NHỚ CÁCH ĐỌC')+'</span><span class="v33-flash-glyph" lang="ja">'+clean(item.glyph)+'</span>'+(flipped?'<strong>'+clean(item.read)+'</strong>'+(isWord(item)?'<small>'+clean(item.vi)+'</small>':''):'<small>Chạm để xem cách đọc</small>')+'</button>'+
 (flipped?'<p class="v33-feedback">'+clean(item.note||'Luyện đọc lại không nhìn gợi ý.')+'</p><div class="v33-pane-actions"><button type="button" data-f33="flash-audio" class="v33-secondary">▶ Nghe phát âm</button><button data-f33="rate" data-value="again" class="v33-secondary">Cần ôn</button><button data-f33="rate" data-value="remember" class="v33-primary">Tôi nhớ rồi →</button></div>':'<div class="v33-pane-actions"><button data-f33="flip" class="v33-primary">Lật thẻ xem đáp án</button></div>')+
 '<p class="v36-audio-status" role="status" aria-live="polite" hidden></p><p class="v33-subline">Thẻ đã đánh giá: '+Object.keys(store().flash).filter(k=>s.cards.some(x=>x.id===k)).length+'/'+s.cards.length+'. '+(marked?'Thẻ này từng được đánh giá '+(marked==='remember'?'nhớ':'cần ôn')+'.':'')+'</p></section>';
}
function noData(msg){return '<section class="v33-pane"><h3>Chưa đủ dữ liệu</h3><p>'+clean(msg)+'</p><a href="#course/foundation">Trở lại khóa Nền tảng</a></section>'}
function quizView(cfg,s){
 if(s.finished||s.index>=s.questions.length)return summaryView(cfg,s);
 const q=s.questions[s.index];
 return '<section class="v33-pane"><div class="v33-pane-head"><div><p class="v33-eyebrow">KIỂM TRA · '+clean(modeNames[cfg.mode])+'</p><h3>Nhớ lại không nhìn gợi ý</h3><p>'+clean(q.prompt)+'</p></div>'+clock(s,!!s.choice)+'</div>'+
 (q.mode==='listen'?'<div class="v35-listen-panel"><p>Nghe và chọn chữ. Có thể nghe lại nhiều lần.</p><button class="v35-listen-trigger" data-f33="listen-audio" aria-label="Nghe phát âm Kana"><span aria-hidden="true">♫</span> Phát âm thanh</button></div>':'<div class="v33-question-glyph" lang="'+(q.mode.startsWith('vocab')&&q.mode==='vocab-vi-ja'?'vi':'ja')+'">'+clean(q.stimulus)+'</div>')+
 '<p class="v36-audio-status" role="status" aria-live="polite" hidden></p><div class="v33-answer-grid">'+q.choices.map(opt=>'<button class="v33-answer '+(s.choice&&opt.id===q.correct?'correct':'')+' '+(s.choice===opt.id&&s.choice!==q.correct?'wrong':'')+'" data-f33="answer" data-value="'+clean(opt.id)+'" '+(s.choice?'disabled':'')+'>'+clean(opt.label)+'</button>').join('')+'</div>'+
 (s.choice?'<div class="v33-feedback '+(s.choice===q.correct?'positive':'negative')+'" role="status"><strong>'+(s.choice===q.correct?(s.grade?.slow?'Đúng nhưng cần luyện phản xạ.':'Chính xác.'):'Chưa đúng. Đáp án: '+clean(q.choices.find(x=>x.id===q.correct)?.label))+'</strong><small class="v37-answer-speed">'+timeLabel(s.lastMs)+' · '+(s.grade?.outcome==='incorrect'?'Đã lưu câu sai vào sổ ôn':s.grade?.slow?'Đã lưu vào sổ ôn vì chậm':'Đúng trong ngưỡng luyện')+'</small><p>'+clean(q.note)+'</p><button class="v36-feedback-audio" data-f33="feedback-audio" type="button">▶ Nghe đáp án</button></div><div class="v33-pane-actions"><button class="v33-primary" data-f33="next">'+(s.index+1===s.questions.length?'Xem kết quả':'Câu tiếp theo')+' →</button></div>':'<p class="v33-subline">Chọn một đáp án. Kết quả và giải thích hiện ngay, không cần bấm “Kiểm tra” thêm lần nữa.</p>')+
 '</section>';
}
function summaryView(cfg,s){
 const total=s.questions?.length||0;
 const avg=s.roundMs?.length?timeLabel(s.roundMs.reduce((a,b)=>a+b,0)/s.roundMs.length):'—';
 return '<section class="v33-pane v33-summary"><p class="v33-eyebrow">KẾT QUẢ LƯỢT LUYỆN</p><h3>Hoàn thành bài kiểm tra</h3><div class="v33-summary-score">'+s.correct+' <span>/ '+total+' câu đúng</span></div>'+
 '<div class="v37-summary-stats"><span>Đúng chậm: <strong>'+s.slow+'</strong></span><span>Sai: <strong>'+s.errors+'</strong></span><span>TB phản hồi: <strong>'+avg+'</strong></span></div>'+
 '<p>Chữ đúng trên 5 giây và chữ sai được đề xuất ôn tiếp. Đây là ngưỡng luyện phản xạ để tham khảo, không phải chuẩn JLPT.</p>'+
 '<div class="v33-pane-actions"><button data-f33="restart" class="v33-primary">Luyện lại ngẫu nhiên</button><button data-f34="mode" data-value="review" class="v33-secondary">Ôn chữ cần luyện</button></div></section>';
}

function buildView(cfg,s){
 if(!s.cards.length)return noData('Chưa đủ từ ngữ cảnh để ghép chữ.');
 if(s.finished||s.index>=s.cards.length)return '<section class="v33-pane v33-summary"><p class="v33-eyebrow">XẾP CHỮ · TỔNG KẾT</p><h3>Đã hoàn thành lượt ghép chữ</h3><div class="v33-summary-score">'+s.correct+' <span>/ '+s.cards.length+' từ đúng</span></div><p>Luyện lại những từ sai sau khi xem mặt chữ và cách đọc.</p><div class="v33-pane-actions"><button data-f33="restart" class="v33-primary">Ghép lại từ đầu</button></div></section>';
 const word=s.cards[s.index],selected=s.selected.map(i=>s.tileOrder[i].glyph).join('');
 return '<section class="v33-pane"><div class="v33-pane-head"><div><p class="v33-eyebrow">GHÉP CHỮ THÀNH TỪ</p><h3>Xếp Kana theo đúng thứ tự</h3><p>Nhìn nghĩa tiếng Việt, chạm các mảnh chữ để ghép thành từ Nhật. Không cần kéo thả.</p></div>'+clock(s,!!s.answer)+'</div>'+
 '<div class="v33-build-clue"><span>NGHĨA TIẾNG VIỆT</span><strong>'+clean(word.vi)+'</strong></div>'+
 '<div class="v33-build-answer" data-f35-drop="build" aria-label="Các chữ đã xếp" aria-live="polite">'+(selected?Array.from(selected).map(ch=>'<span lang="ja">'+clean(ch)+'</span>').join(''):'<small>Chọn ký tự bên dưới để ghép từ</small>')+'</div>'+
 '<div class="v33-build-tiles">'+s.tileOrder.map((x,i)=>'<button data-f33="tile" data-value="'+i+'" draggable="true" class="v33-build-tile" '+(s.selected.includes(i)||s.answer?'disabled':'')+' lang="ja">'+clean(x.glyph)+'</button>').join('')+'</div>'+
 (s.answer?'<div class="v33-feedback '+(s.answer.correct?'positive':'negative')+'" role="status"><strong>'+(s.answer.correct?'Đúng!':'Chưa đúng: '+clean(word.glyph))+'</strong><p>'+clean(word.glyph)+' → '+clean(word.read)+' · '+clean(word.vi)+'. '+clean(word.note||'')+'</p></div>':'<p class="v33-subline">Câu trả lời được chấm ngay khi bạn ghép đủ số ký tự.</p>')+
 '<div class="v33-pane-actions">'+(!s.answer?'<button class="v33-secondary" data-f33="undo">Bỏ chữ cuối</button>':'<button class="v33-primary" data-f33="build-next">'+(s.index+1===s.cards.length?'Xem kết quả':'Từ tiếp theo')+' →</button>')+'</div></section>';
}
function matchingView(cfg,s){
 if(!s.cards.length)return noData('Nhóm này chưa có đủ cặp duy nhất. Hãy chọn bảng hoặc nhóm khác.');
 const complete=s.matched.length===s.cards.length;
 const left=items=>items.map((x,i)=>'<button data-f33="match" data-side="left" data-value="'+clean(x.id)+'" draggable="true" class="v33-match-tile '+(s.matched.includes(x.id)?'done':s.leftId===x.id?'selected':'')+'" '+(s.matched.includes(x.id)?'disabled':'')+'>'+(s.kind==='listen-match'?'<span aria-hidden="true">▶ '+(i+1)+'</span><span class="v37-sr">Nghe âm số '+(i+1)+'</span>':'<span lang="ja">'+clean(x.glyph)+'</span>')+'</button>').join('');
 const right=items=>items.map(x=>'<button data-f33="match" data-side="right" data-value="'+clean(x.id)+'" data-f35-drop="match" class="v33-match-tile '+(s.matched.includes(x.id)?'done':s.rightId===x.id?'selected':'')+'>'+(s.kind==='listen-match'?'<span lang="ja">'+clean(x.glyph)+'</span>':clean(readable(x)))+(cfg.script==='both'&&cfg.mod.script==='both'&&s.kind!=='listen-match'?' <small>· '+(x.script==='hira'?'Hira':'Kata')+'</small>':'')+'</button>').join('');
 return '<section class="v33-pane"><div class="v33-pane-head"><div><p class="v33-eyebrow">'+(s.kind==='listen-match'?'NGHE & GHÉP':'GHÉP CẶP · 2 CỘT')+'</p><h3>'+(s.kind==='listen-match'?'Nghe và ghép đúng chữ':'Ghép chữ và cách đọc')+'</h3><p>'+(s.kind==='listen-match'?'Nhấn nút nghe bên trái rồi ghép chữ tương ứng bên phải.':'Chọn một ô bên trái, rồi ô tương ứng bên phải. Có thể dùng bàn phím.')+'</p></div>'+clock(s,s.finished)+'</div>'+
 (complete?'<div class="v33-feedback positive"><strong>Đã ghép xong!</strong><p>Số lần chọn sai: '+s.mistakes+'. Nếu chọn sai nhiều, hãy thử lại sau khi ôn Flashcard.</p></div>':'<p class="v33-subline">'+clean(s.feedback||'Chọn 1 chữ và 1 cách đọc để ghép cặp.')+'</p>')+
 '<div class="v33-match-grid"><div class="v33-match-column">'+left(s.left)+'</div><div class="v33-match-column">'+right(s.right)+'</div></div>'+
 (complete?'<div class="v33-pane-actions"><button data-f33="restart" class="v33-primary">Ghép lại với thứ tự khác</button></div>':'')+'</section>';
}
function workspace(cfg){
 const s=cfg.mode==='learn'?null:ensurePlay(cfg);
 const body=cfg.mode==='learn'?learnView(cfg):cfg.mode==='flash'?flashView(cfg,s):(cfg.mode==='match'||cfg.mode==='listen-match')?matchingView(cfg,s):cfg.mode==='build'?buildView(cfg,s):quizView(cfg,s);
 const weak=weakList(cfg);
 const panel='<aside class="v33-side"><h3>Sổ ôn · Gợi ý theo kết quả</h3>'+
 (weak.length?'<div class="v37-weak-list">'+weak.map(x=>'<span lang="ja">'+clean(x.glyph)+' <small>'+clean(store().items[x.id]?.latestOutcome==='incorrect'?'Sai':'Chậm / đến hạn')+'</small></span>').join('')+'</div><button type="button" class="v37-review-link" data-f34="mode" data-value="review">Ôn những chữ này →</button>':'<p>Chưa có chữ sai hoặc chậm cần ôn. Hãy làm một lượt kiểm tra.</p>')+
 '<div class="v33-side-divider"></div><h3>Học thế nào cho hiệu quả?</h3><ol><li>Học và nghe phát âm theo nhóm chữ.</li><li>Luyện nhớ không nhìn gợi ý.</li><li>Trộn chữ ngẫu nhiên để tránh nhớ vị trí.</li><li>Ôn lại cả câu sai và câu đúng chậm.</li></ol><small>Ngưỡng phản xạ hiện tại: 5 giây, chỉ mang tính gợi ý.</small></aside>';
 return navigationFor(cfg)+'<div class="v33-workspace">'+body+panel+'</div>';
}

function modulePage(cfg){
 tickClock();return wrap('<div class="v34-workspace-shell">'+workspace(cfg)+'</div>',cfg.mod.title).replace('class="v25-wrap v33-foundation"','class="v25-wrap v33-foundation v34-studying"');
}
function page(route){
 if(!route||route==='course/foundation'||route===routePrefix)return indexPage();
 const cfg=current();return cfg.mod?modulePage(cfg):indexPage();
}
function perform(el){
 const cfg=current(),op=el.dataset.f33,value=el.dataset.value,side=el.dataset.side;
 if(!cfg.mod)return;
 if(op==='guide-ok'){dismissCoach();return;}
 if(op==='pronounce'&&cfg.mode==='learn'){pronounce(value,el.dataset.reading||'',el.dataset.kind==='basic');dismissCoach();return;}
 if(op==='listen-audio'&&cfg.mode==='listen'){const state=ensurePlay(cfg),q=state.questions[state.index];if(q)pronounce(q.item.glyph,q.item.read,true);return;}
 if(op==='feedback-audio'&&cfg.mode!=='learn'){const state=ensurePlay(cfg),q=state.questions?.[state.index];if(q&&state.choice)pronounce(q.item.glyph,q.item.read,true);return;}
 if(op==='flash-audio'&&cfg.mode==='flash'){const state=ensurePlay(cfg);if(state.flipped)pronounce(state.cards[state.index]?.glyph,state.cards[state.index]?.read,true);return;}
 if(cfg.mode==='learn')return;
 const s=ensurePlay(cfg);
 if(op==='tile'&&s.kind==='build'&&!s.answer){
  const i=Number(value);if(!Number.isInteger(i)||i<0||i>=s.tileOrder.length||s.selected.includes(i))return;
  s.selected.push(i);
  const word=s.cards[s.index],built=s.selected.map(n=>s.tileOrder[n].glyph).join('');
  if(s.selected.length===Array.from(word.glyph).length){
   const correct=built===word.glyph;s.answer={correct,built};if(correct)s.correct++;
   s.lastMs=elapsed(s);s.grade=record(word,correct,'build',s.lastMs);
  }
  refresh();return;
 }
 if(op==='undo'&&s.kind==='build'&&!s.answer){s.selected.pop();refresh();return}
 if(op==='build-next'&&s.kind==='build'&&s.answer){
  s.index++;s.finished=s.index>=s.cards.length;s.selected=[];s.answer=null;
  if(!s.finished){s.tileOrder=shuffle(Array.from(s.cards[s.index].glyph).map((glyph,i)=>({glyph,i})));s.startedAt=Date.now();}
  refresh();return;
 }
 if(op==='flip'){s.flipped=!s.flipped;refresh();return}
 if(op==='rate'&&s.kind==='flash'&&s.flipped){
  const card=s.cards[s.index];store().flash[card.id]=value;persist();
  if(value==='remember')s.remembered++;else s.needsReview++;
  s.index=(s.index+1)%s.cards.length;s.flipped=false;refresh();return;
 }
 if(op==='answer'&&s.kind!=='match'&&s.kind!=='flash'&&!s.choice&&!s.finished){
  const q=s.questions[s.index];if(!q.choices.some(x=>x.id===value))return;
  const took=elapsed(s);s.lastMs=took;s.choice=value;s.answered++;const ok=value===q.correct;if(ok)s.correct++;
  s.grade=record(q.item,ok,cfg.mode,took);s.roundMs.push(took);if(s.grade.slow)s.slow++;if(!ok)s.errors++;
  refresh();return;
 }
 if(op==='next'&&s.choice){s.index++;s.choice=null;s.grade=null;s.startedAt=Date.now();s.finished=s.index>=s.questions.length;refresh();return}
 if(op==='match'&&(s.kind==='match'||s.kind==='listen-match')&&!s.matched.includes(value)&&s.cards.some(x=>x.id===value)){
  if(side==='left'){s.leftId=value;if(s.kind==='listen-match'){const sample=s.cards.find(x=>x.id===value);if(sample)pronounce(sample.glyph,sample.read,true);}}else if(side==='right')s.rightId=value;
  if(s.leftId&&s.rightId){
   const ok=s.leftId===s.rightId;const item=s.cards.find(x=>x.id===s.leftId);
   record(item,ok,s.kind,elapsed(s));s.startedAt=Date.now();
   if(ok){s.matched.push(item.id);s.feedback='Đúng! Hãy ghép cặp tiếp theo.';}
   else{s.mistakes++;s.feedback='Chưa đúng. Thử ghép lại hai ô.';}
   s.leftId=null;s.rightId=null;
  }
  refresh();return;
 }
 if(op==='restart'){play=null;ensurePlay(cfg);refresh()}
}
/* Local switching preserves the page viewport and avoids hash navigation on every exercise tab. */
function localSwitch(kind,value){
 const cfg=current();if(!cfg.mod)return;
 let target={...cfg};
 if(kind==='module'){
  const mod=DATA.byId[value];if(!mod)return;
  target={id:mod.id,mod,group:initialGroup(mod),mode:'learn',script:'both'};
 }else if(kind==='script'){
  if(!['both','hira','kata'].includes(value))return;
  target.script=value;
 }else if(kind==='small'){
  if(!['all','pause','length','vowels'].includes(value))return;
  target.group=value;
 }else if(kind==='mode'){
  if(!['quiz','reverse','listen','listen-match','review','truefalse','match','build','vocab-ja-vi','vocab-vi-ja'].includes(value))return;
  target.mode=value;
 }else if(kind==='tab'){
  if(!['learn','flash','practice','mix'].includes(value))return;
  target.mode=value==='practice'?'quiz':value;
 }else return;
 play=null;
 const next=path(target.id,target.group,target.mode,target.script);
 if(typeof history!=='undefined'&&history.replaceState)history.replaceState(null,'','#'+next);
 else location.hash='#'+next;
 const stage=document.querySelector('.v34-workspace-shell');
 if(stage){stage.innerHTML=workspace(target);const crumb=document.querySelector('.v33-foundation .v25-breadcrumb [aria-current="page"]');if(crumb)crumb.textContent=target.mod.title;}
}
/* Optional desktop dragging; touch and keyboard selection remain the primary accessible controls. */
let dragging=null;
document.addEventListener('dragstart',event=>{
 const tile=event.target.closest?.('.v34-studying [draggable="true"]');
 if(!tile)return;
 dragging={kind:tile.dataset.f33,id:tile.dataset.value,side:tile.dataset.side};
 if(event.dataTransfer){event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',dragging.id)}
});
document.addEventListener('dragover',event=>{
 if(!dragging)return;
 const target=event.target.closest?.('[data-f35-drop]');
 if(target&&(dragging.kind==='tile'&&target.dataset.f35Drop==='build'||dragging.kind==='match'&&target.dataset.f35Drop==='match')){
  event.preventDefault();if(event.dataTransfer)event.dataTransfer.dropEffect='move';
  target.classList.add('v35-drop-active');
 }
});
document.addEventListener('dragleave',event=>{
 const node=event.target.closest?.('[data-f35-drop]');if(node)node.classList.remove('v35-drop-active');
});
document.addEventListener('drop',event=>{
 const target=event.target.closest?.('[data-f35-drop]');
 if(!target||!dragging)return;
 const dragged=dragging;dragging=null;target.classList.remove('v35-drop-active');
 if(dragged.kind==='tile'&&target.dataset.f35Drop==='build'){
  event.preventDefault();perform({dataset:{f33:'tile',value:dragged.id}});return;
 }
 if(dragged.kind==='match'&&target.dataset.f35Drop==='match'&&dragged.side==='left'){
  event.preventDefault();perform({dataset:{f33:'match',value:dragged.id,side:'left'}});
  perform({dataset:{f33:'match',value:target.dataset.value,side:'right'}});
 }
});
document.addEventListener('dragend',()=>{dragging=null});
document.addEventListener('change',event=>{
 const node=event.target.closest?.('[data-f34]');if(!node||!document.querySelector('.v34-workspace-shell'))return;
 localSwitch(node.dataset.f34,node.value);
});
document.addEventListener('click',event=>{
 const nav=event.target.closest('[data-f34="tab"]');if(nav?.dataset?.f34==='tab'&&document.querySelector('.v34-workspace-shell')){event.preventDefault();localSwitch('tab',nav.dataset.value);return;}
 const b=event.target.closest('[data-f33]');if(!b)return;
 if(!document.querySelector('.v33-foundation'))return;
 event.preventDefault();perform(b);
});
window.NPFoundationCourse={version:'v37',page,store,stats:countStats,path,questionFor,choosePool,session:()=>play};
})();