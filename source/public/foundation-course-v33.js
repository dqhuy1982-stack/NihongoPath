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
 ['vocab-ja-vi','Nhật → Việt','languages'],['vocab-vi-ja','Việt → Nhật','languages'],['missing','Điền Kana còn thiếu','puzzle'],['listen-match','Nghe & ghép','headphones'],['review','Ôn chữ yếu','refresh-cw'],['game','Ghép cặp vui','gamepad-2'],['game-build','Ghép từ','puzzle'],['game-listen','Nghe & nối','headphones'],['mix','Kiểm tra tổng hợp','check-circle-2']
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
/* Task-specific targets are prototype heuristics, not JLPT or mastery standards. */
const RESPONSE_TARGET_MS=Object.freeze({quiz:5000,reverse:5000,truefalse:5000,mix:5000,review:5000,listen:9000,
 'listen-match':12000,match:10000,build:15000,'vocab-ja-vi':8000,'vocab-vi-ja':8000});
function targetMs(mode){return RESPONSE_TARGET_MS[mode]||5000}
function grade(elapsedMs,correct,mode='quiz'){
 const ms=Number.isFinite(elapsedMs)?Math.max(0,Math.round(elapsedMs)):null;
 const thresholdMs=targetMs(mode),slow=!!correct&&ms!==null&&ms>thresholdMs;
 return {responseMs:ms,thresholdMs,slow,outcome:!correct?'incorrect':slow?'slow':'correct'};
}
function record(item,correct,mode,elapsedMs=null,hintsUsed=0,audioReplays=0){
 const d=store(),id=item.id,prev=d.items[id]||{attempts:0,correct:0,streak:0,slowCount:0,errorCount:0};
 const now=new Date().toISOString(),measure=grade(elapsedMs,correct,mode);
 const streak=correct&&!measure.slow&&!hintsUsed?Math.min(5,prev.streak+1):0;
 const oldTimes=Array.isArray(prev.recentMs)?prev.recentMs:[];
 const recentMs=measure.responseMs===null?oldTimes:oldTimes.concat(measure.responseMs).slice(-8);
 const needsReview=!correct||measure.slow||hintsUsed>0;
 d.items[id]={...prev,attempts:prev.attempts+1,correct:prev.correct+Number(correct),
  slowCount:(prev.slowCount||0)+Number(measure.slow),
  errorCount:(prev.errorCount||0)+Number(!correct),
  streak,lastAt:now,latestOutcome:measure.outcome,lastResponseMs:measure.responseMs,recentMs,
  nextAt:dueDate(now,needsReview?0:[1,1,3,7,14,30][streak]),lastMode:mode,thresholdMs:measure.thresholdMs,lastHintsUsed:hintsUsed,lastAudioReplays:audioReplays,assistedCount:(prev.assistedCount||0)+Number(hintsUsed>0)};
 d.history.push({id,correct,mode,at:now,ms:measure.responseMs,outcome:measure.outcome,hintsUsed,audioReplays});
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
 return mode.startsWith('vocab')||mode==='build'||mode==='game-build'||mode==='missing'?contextual(config):tokens(config);
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
 if(mode==='missing'){
  const glyphs=Array.from(item.glyph||''),idx=Math.floor(Math.random()*glyphs.length),answer=glyphs[idx];
  const symbols=Array.from(new Set(pool.flatMap(x=>Array.from(x.glyph||'')))).filter(x=>x!==answer&&/[\u3041-\u30ff]/u.test(x));
  const distractors=pick(symbols,3).map((glyph,i)=>({id:'missing-'+i,label:glyph}));
  return {item,mode,prompt:'Điền Kana còn thiếu để hoàn thành từ có nghĩa.',stimulus:glyphs.map((x,i)=>i===idx?'□':x).join('')+' · '+item.vi,
   choices:shuffle([{id:item.id,label:answer},...distractors]),correct:item.id,
   note:item.glyph+' → '+item.read+' · '+item.vi+'. '+(item.note||'')};
 }
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
/* v1.07 round data is isolated from existing item progress and safe for demos. */
const MATCH_KINDS=['match','listen-match','game','game-listen'];
const summaryKey=()=>'Horizon.FoundationRoundSummaries.v1.'+learnerId();
const timeNow=()=>typeof performance!=='undefined'&&performance.now?performance.now():Date.now();
function roundClock(s){
 if(!s.round)return 0;
 const r=s.round,now=timeNow();
 return Math.max(0,Math.round((r.pausedAt??now)-r.startedTick-r.pausedMs));
}
function startRound(s,config){
 const startedAt=new Date().toISOString();
 s.round={roundId:startedAt+'-'+Math.random().toString(36).slice(2,10),startedAt,startedTick:timeNow(),pausedAt:null,pausedMs:0,
  attempts:[],pairs:{},replays:{},wrong:0,finalized:false,summaryOpen:false,summary:null};
 for(const x of s.cards)s.round.pairs[x.id]={itemId:x.id,script:x.script,glyph:x.glyph,romaji:x.read,firstAt:null,completedAt:null,wrongAttempts:0,audioReplays:0};
}
function roundSelect(s,id){
 const r=s.round,p=r?.pairs[id];if(p&&p.firstAt===null)p.firstAt=roundClock(s);
}
function listenRound(s,id){
 const r=s.round,p=r?.pairs[id];if(p){roundSelect(s,id);p.audioReplays++;r.replays[id]=(r.replays[id]||0)+1}
}
function roundAttempt(s,left,right,ok){
 const r=s.round;if(!r||r.finalized)return;
 const at=roundClock(s);
 r.attempts.push({leftId:left,rightId:right,correct:ok,elapsedMsFromRoundStart:at});
 if(!ok){r.wrong++;for(const id of new Set([left,right]))if(r.pairs[id])r.pairs[id].wrongAttempts++;}
 else{
  const p=r.pairs[left];if(p){p.completedAt=at;p.pairElapsedMs=p.firstAt===null?null:Math.max(0,at-p.firstAt);}
 }
}
function saveRound(summary){
 try{
  const key=summaryKey(),all=JSON.parse(localStorage.getItem(key)||'[]');
  const items=Array.isArray(all)?all:[];
  if(!items.some(x=>x.roundId===summary.roundId)){items.push(summary);localStorage.setItem(key,JSON.stringify(items.slice(-80)));}
 }catch(e){/* local demo with storage blocked: preserve in-memory round */ }
}
function completeRound(s,cfg){
 if(!s.round||s.round.finalized||s.matched.length!==s.cards.length)return;
 const r=s.round;r.finalized=true;
 const list=Object.values(r.pairs);
 const firstTry=list.filter(p=>p.completedAt!==null&&!p.wrongAttempts).length;
 const totalMs=roundClock(s);
 const durations=list.map(p=>p.pairElapsedMs).filter(Number.isFinite);
 const review=list.filter(p=>p.wrongAttempts>0);
 const report={schemaVersion:1,roundId:r.roundId,learnerProfileId:learnerId(),mode:s.kind,script:cfg.script,moduleId:cfg.id,
   startedAt:r.startedAt,endedAt:new Date().toISOString(),totalElapsedMs:totalMs,
   totalPairs:list.length,completedPairs:s.matched.length,wrongAttempts:r.wrong,
   firstTryPairs:firstTry,firstTryAccuracy:list.length?Math.round(firstTry/list.length*100):0,
   attemptAccuracy:r.attempts.length?Math.round(s.matched.length/r.attempts.length*100):0,
   averagePairMs:durations.length===list.length?Math.round(durations.reduce((a,b)=>a+b,0)/durations.length):null,
   fastestPairMs:durations.length===list.length?Math.min(...durations):null,
   slowestPairMs:durations.length===list.length?Math.max(...durations):null,
   audioReplays:list.reduce((n,p)=>n+p.audioReplays,0),attempts:r.attempts.slice(),
   pairResults:list,reviewIds:review.map(p=>p.itemId)};
 r.summary=report;r.summaryOpen=true;saveRound(report);
}
function formatDuration(ms){return Number.isFinite(ms)?(ms/1000).toLocaleString('vi-VN',{maximumFractionDigits:1})+' giây':'Chưa ghi nhận'}
function summaryView(s,cfg){
 const r=s.round,report=r?.summary;
 if(!report||!r.summaryOpen)return '';
 const review=report.pairResults.filter(p=>p.wrongAttempts);
 const cleanRound=report.wrongAttempts===0;
 const canReview=review.length>0;
 const heading=cleanRound?'Một ván thật gọn!':'Hoàn thành ván ghép!';
 const detail=cleanRound?'Bạn đã ghép đúng ngay lần đầu cả '+report.totalPairs+' cặp. Hãy thử một ván mới để củng cố.':
  'Bạn đã nối đủ '+report.totalPairs+' cặp, trong đó '+report.firstTryPairs+' cặp đúng ngay lần đầu và '+report.wrongAttempts+' lượt ghép chưa đúng.';
 const metric=(value,label)=>'<div class="v107-metric"><strong>'+clean(value)+'</strong><small>'+clean(label)+'</small></div>';
 const notes=review.length?'Có '+review.length+' chữ tham gia vào ít nhất một lượt ghép sai. Ôn lại trước khi chơi ván mới.':'Chưa ghi nhận cặp ghép sai trong ván này. Một ván đúng chưa có nghĩa là đã nhớ lâu.';
 return '<div class="v107-overlay" data-v107-dialog="1"><section class="v107-dialog" role="dialog" aria-modal="true" aria-labelledby="v107-title" tabindex="-1">'+
 '<div class="v107-header"><span class="v107-star" aria-hidden="true">✦</span><div><p class="v33-eyebrow">TỔNG KẾT VÁN HỌC</p><h3 id="v107-title">'+heading+'</h3><p>'+detail+'</p></div><button type="button" class="v107-close" data-f33="summary-close" aria-label="Đóng tổng kết">×</button></div>'+
 '<div class="v107-stats">'+metric(report.completedPairs+' / '+report.totalPairs,'Cặp hoàn thành')+metric(report.firstTryPairs+' / '+report.totalPairs,'Đúng ngay lần đầu')+
 metric(report.wrongAttempts,'Lượt ghép sai')+metric(formatDuration(report.totalElapsedMs),'Tổng thời gian')+'</div>'+
 '<div class="v107-body"><div class="v107-insight"><h4>✧ Nhận xét sau ván</h4><p>'+notes+'</p><p>Đúng ngay lần đầu: <strong>'+report.firstTryAccuracy+'%</strong> · Đúng theo lượt ghép: <strong>'+report.attemptAccuracy+'%</strong>.</p>'+
 (['listen-match','game-listen'].includes(s.kind)?'<p>Đã nghe âm theo thao tác: <strong>'+report.audioReplays+' lượt</strong> (không tính phát đáp án tự động).</p>':'')+
 '<p>Thời gian trung bình theo cặp: '+formatDuration(report.averagePairMs)+'. Đây là luyện tập, không có giới hạn thời gian.</p></div>'+
 '<div class="v107-review"><h4>'+ (canReview?'Cặp nên ôn lại':'Gợi ý tiếp theo')+'</h4>'+
 (canReview?'<div class="v107-review-tiles">'+review.map(p=>'<span lang="ja">'+clean(p.glyph)+' <small>'+clean(p.romaji)+' · ghép sai '+p.wrongAttempts+' lượt</small></span>').join('')+'</div>':
 '<p>Hãy thử thêm một ván với các chữ và thứ tự mới, sau đó ôn lại sau một khoảng nghỉ.</p>')+
 '<details class="v107-details"><summary>Chi tiết từng cặp · '+report.pairResults.length+'</summary><div>'+report.pairResults.map(p=>'<div><span lang="ja">'+clean(p.glyph)+'</span><span>'+clean(p.romaji)+'</span><small>'+p.wrongAttempts+' lần ghép sai · '+formatDuration(p.pairElapsedMs)+(p.audioReplays?' · nghe '+p.audioReplays+' lần':'')+'</small></div>').join('')+'</div></details></div></div>'+
 '<div class="v107-actions">'+(canReview?'<button type="button" class="v33-primary" data-f33="summary-review">Luyện lại cặp cần ôn</button>':'')+
 '<button type="button" class="'+(canReview?'v33-secondary':'v33-primary')+'" data-f33="summary-new">↻ Ván mới</button>'+
 '<button type="button" class="v33-secondary" data-f33="summary-next">'+(['match','game'].includes(s.kind)?'Chuyển sang Nghe & ghép':'Kiểm tra tổng hợp')+'</button>'+
 '<button type="button" class="v33-secondary" data-f33="summary-close">Đóng</button></div></section></div>';
}
function focusRoundSummary(){
 if(typeof queueMicrotask==='function')queueMicrotask(()=>{
  const overlay=document.querySelector?.('[data-v107-dialog]'),dialog=overlay?.querySelector?.('.v107-dialog');
  if(dialog&&dialog.focus)try{dialog.focus()}catch(e){}
 });
}
function roundReview(s,cfg){
 const ids=new Set(s.round?.summary?.reviewIds||[]);
 const pool=s.cards.filter(x=>ids.has(x.id));
 if(!pool.length)return false;
 const selected=shuffle(pool);
 play={...s,key:s.key,cards:selected,left:shuffle(selected),right:shuffle(selected),leftId:null,rightId:null,
   matched:[],mistakes:0,answered:0,lastMatched:null,wrongPair:null,feedback:'',finished:false,round:null};
 startRound(play,cfg);return true;
}

function ensurePlay(config){
 const key=sessionKey(config);if(play?.key===key)return play;
 const kind=config.mode;
 const source=choosePool(config,kind);
 const list=kind==='review'?reviewPool(source):kind==='missing'?contextual(config):source;
 if(kind==='build'||kind==='game-build'){
  const cards=chooseTargets(contextual(config),5);
  play={key,kind,cards,index:0,selected:[],tileOrder:cards.length?shuffle(Array.from(cards[0].glyph).map((glyph,i)=>({glyph,i}))):[],answer:null,correct:0,finished:cards.length===0,startedAt:null,ready:true};
 }else if(['match','listen-match','game','game-listen'].includes(kind)){
  const permitted=['listen-match','game-listen'].includes(kind)?list.filter(x=>x.stage!=='small'&&Array.from(x.glyph).length<=3):list;
  const distinct=permitted.filter((x,i)=>permitted.findIndex(y=>y.read===x.read&&y.script===x.script)===i);
  const size=Math.min(6,distinct.length);
  let cards;
  if(config.script==='both'&&config.mod.script==='both'){
   const hira=chooseTargets(distinct.filter(x=>x.script==='hira'),Math.min(3,size));
   const kata=chooseTargets(distinct.filter(x=>x.script==='kata'),Math.min(3,size-hira.length));
   const used=new Set([...hira,...kata].map(x=>x.id));
   cards=shuffle([...hira,...kata,...chooseTargets(distinct.filter(x=>!used.has(x.id)),size-hira.length-kata.length)]);
  }else cards=chooseTargets(distinct,size);
  play={key,kind,cards,left:shuffle(cards),right:shuffle(cards),leftId:null,rightId:null,matched:[],mistakes:0,answered:0,feedback:'',finished:cards.length===0,startedAt:null,ready:true};
  startRound(play,config);
 }else if(kind==='flash'){
  play={key,kind,cards:shuffle(list),index:0,flipped:false,remembered:0,needsReview:0};
 }else{
  const targets=chooseTargets(kind==='listen'?list.filter(x=>x.stage!=='small'&&Array.from(x.glyph).length<=3):list,Math.min(10,list.length));
  const allPool=kind.startsWith('vocab')||kind==='missing'||config.id==='small'?contextual(config):DATA.take(config.id,'all',config.script);
  const valid=targets.filter(x=>allPool.filter(p=>p.id!==x.id&&isWord(p)===isWord(x)).length>=2);
  const formats=shuffle(['quiz','truefalse','reverse','listen']);
  const questions=valid.map((x,i)=>{
   if(kind!=='mix'&&kind!=='review')return questionFor(x,kind,allPool);
   const same=allPool.filter(z=>z.script===x.script&&z.read===x.read&&z.id!==x.id);
   let mode=formats[i%formats.length];
   if((mode==='reverse'||mode==='listen')&&same.length)mode='quiz';
   if(mode==='listen'&&x.stage==='small')mode='truefalse';
   return questionFor(x,mode,allPool);
  });
  play={key,kind,questions,index:0,correct:0,answered:0,choice:null,finished:valid.length===0,startedAt:null,ready:kind!=='mix',roundMs:[],slow:0,errors:0,hintsUsed:0,audioReplays:0};
 }
 return play;
}

function elapsed(s){if(!s?.startedAt)return 0;const now=s.hiddenAt||Date.now();return Math.max(0,now-s.startedAt-(s.pausedMs||0))}
function resetClock(s){s.startedAt=Date.now();s.pausedMs=0;s.hiddenAt=null;}
function clock(s,answered=false){return '<div class="v37-clock" aria-label="Thời gian phản hồi"><span aria-hidden="true">◷</span><strong data-f37-timer>'+(s.startedAt?timeLabel(answered?(s.lastMs||0):elapsed(s)):'—')+'</strong><small>'+(answered?'Đã trả lời':s.startedAt?'Đang tính giờ':'Chưa bắt đầu')+'</small></div>';}
let ticker=null,absentTicks=0;
function tickClock(){if(typeof setInterval!=='function'||ticker!==null)return;ticker=setInterval(()=>{const present=!!document.querySelector?.('.v34-workspace-shell');if(!present){if(++absentTicks>20){clearInterval(ticker);ticker=null;absentTicks=0;}return;}absentTicks=0;const el=document.querySelector?.('[data-f37-timer]');if(el&&play?.startedAt&&!play.finished&&!play.choice&&!play.answer&&play.kind!=='flash')el.textContent=timeLabel(elapsed(play));},100);}
document.addEventListener('visibilitychange',()=>{if(play?.round&&!play.round.finalized){const r=play.round;if(document.hidden){if(r.pausedAt===null)r.pausedAt=timeNow();}else if(r.pausedAt!==null){r.pausedMs+=timeNow()-r.pausedAt;r.pausedAt=null;}}if(!play?.startedAt||play.finished||play.choice||play.answer||play.kind==='flash')return;if(document.hidden){if(!play.hiddenAt)play.hiddenAt=Date.now()}else if(play.hiddenAt){play.pausedMs=(play.pausedMs||0)+(Date.now()-play.hiddenAt);play.hiddenAt=null;}});
function weakList(cfg){const rec=store().items;return DATA.take(cfg.id,'all',cfg.script).filter(x=>{const v=rec[x.id];return v&&(v.latestOutcome!=='correct'||new Date(v.nextAt).getTime()<=Date.now())}).sort((a,b)=>priority(b)-priority(a)).slice(0,6);}
function navigate(route){location.hash='#'+route}
function removeFoundationOverlay(){
 const overlay=document.querySelector?.('body > .v38-overlay');
 if(overlay?.remove)overlay.remove();
}
function mountFoundationOverlay(){
 if(typeof document==='undefined'||!document.body?.appendChild)return;
 const overlay=document.querySelector('.v34-workspace-shell .v38-overlay');
 if(overlay&&!document.querySelector('body > .v38-overlay')){document.body.appendChild(overlay);const start=overlay.querySelector?.('[data-f38="start"]');if(start?.focus)start.focus();}
}
function scheduleFoundationOverlay(){
 if(typeof queueMicrotask==='function')queueMicrotask(mountFoundationOverlay);
 else if(typeof requestAnimationFrame==='function')requestAnimationFrame(mountFoundationOverlay);
}
function refresh(){
 removeFoundationOverlay();
 const stage=document.querySelector('.v34-workspace-shell');
 if(stage){const rail=stage.querySelector?.('.v39-book-nav'),saved=rail?rail.scrollTop:null;stage.innerHTML=workspace(current());restoreBookViewport(saved);tickClock();scheduleMatchLines();return}
 render(false);
}
function wrap(content,crumb='Nền tảng'){
 const shell=window.NPHorizonV25?.shell?.('catalog')||'<header class="v25-header"><div class="v25-hero-copy"><h1>Không gian học tập</h1></div></header>';
 return '<div class="v25-wrap v33-foundation" data-learning-hub="v38">'+shell+
 '<nav class="v25-breadcrumb" aria-label="Vị trí học tập"><a href="#learn/overview">Học</a><span aria-hidden="true">›</span><a href="#learn/catalog">Khóa học</a><span aria-hidden="true">›</span><a href="#course/foundation">Nền tảng</a>'+(crumb==='Nền tảng'?'':'<span aria-hidden="true">›</span><span aria-current="page">'+clean(crumb)+'</span>')+'</nav>'+
 content+'<footer class="v25-version">Luyện tập mẫu · Tiến độ lưu trên thiết bị</footer></div>';
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
 const group=cfg.mode==='learn'?'learn':cfg.mode==='flash'?'flash':cfg.mode==='mix'?'mix':cfg.mode.startsWith('game')?'game':'practice';
 const actions=[['learn','Học'],['flash','Flashcard'],['practice','Luyện tập'],['game','Game'],['mix','Kiểm tra tổng hợp']];
 const stepIcons={
 learn:'<path d="M12 7v14m0-14C9.5 5.6 6.5 5 3 6v14c3.5-1 6.5-.5 9 1m0-14c2.5-1.4 5.5-2 9-1v14c-3.5-1-6.5-.5-9 1"/>',
 flash:'<rect x="3" y="5" width="13" height="16" rx="2"/><path d="M7 2h12a2 2 0 0 1 2 2v12M7 10h5M7 14h5"/>',
 practice:'<path d="M9 11l2 2 4-4"/><circle cx="12" cy="12" r="9"/>',
 game:'<path d="M6 11h4m-2-2v4m7-2h.01m3 2h.01M7 6h10a4 4 0 0 1 3.8 3l1.1 6.2a3 3 0 0 1-4.9 2.7L15 16H9l-2 1.9a3 3 0 0 1-4.9-2.7L3.2 9A4 4 0 0 1 7 6z"/>',
 mix:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 3v4m0 10v4M3 12h4m10 0h4"/>'
 };
 const tabs=actions.map(([id,label])=>'<button type="button" data-f34="tab" data-value="'+id+'" class="v34-stage-tab '+(id===group?'active':'')+'" '+(id===group?'aria-current="step"':'')+'><svg class="v36-step-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">'+stepIcons[id]+'</svg><span>'+label+'</span></button>').join('');
 const all=DATA.take(cfg.id,'all',cfg.script),stats=countStats(all);
 const toReview=all.filter(x=>{const t=store().items[x.id];return t&&(t.latestOutcome==='slow'||t.latestOutcome==='incorrect'||new Date(t.nextAt).getTime()<=Date.now())}).length;
 return '<div class="v34-topline"><div class="v34-course-picker"><label for="v34-module">Đang học</label><select id="v34-module" data-f34="module" aria-label="Chọn nội dung Nền tảng">'+opts+'</select></div>'+
 '<div class="v34-topline-info"><strong>'+clean(m.subtitle)+'</strong><small>'+stats.reviewed+' / '+stats.total+' mẫu đã luyện thử</small></div><a class="v34-back" href="#course/foundation">Tất cả nội dung</a></div>'+
 '<div class="v34-stagebar" role="navigation" aria-label="Bước học">'+tabs+'</div>'+
 '<div class="v34-options">'+(m.script==='both'?'<label>Bảng chữ <select data-f34="script" aria-label="Chọn bảng chữ">'+[['both','Cả hai'],['hira','Hiragana'],['kata','Katakana']].map(([id,t])=>'<option value="'+id+'" '+(cfg.script===id?'selected':'')+'>'+t+'</option>').join('')+'</select></label>':'')+
 
 (cfg.id==='small'&&group==='learn'?'<label>Chủ đề <select data-f34="small" aria-label="Chọn chủ đề chữ nhỏ">'+[['all','Tất cả'],['pause','っ / ッ'],['length','Âm dài ー'],['vowels','Nguyên âm nhỏ']].map(([id,t])=>'<option value="'+id+'" '+(cfg.group===id?'selected':'')+'>'+t+'</option>').join('')+'</select></label>':'')+
 (toReview&&group!=='practice'&&group!=='game'?'<button type="button" data-f34="mode" data-value="review" class="v37-review-chip">↻ Sổ ôn · '+toReview+' mẫu</button>':'')+'<span class="v34-hint">'+(group==='learn'?'Chạm vào ô chữ để nghe phát âm.':group==='flash'?'Nhớ trước, lật sau.':group==='mix'?'Bài kiểm tra có hướng dẫn và tính giờ từng câu.':group==='game'?'Học mà chơi · không tính giờ.':'Chọn bài từ mục lục bên trái · không tính giờ.')+'</span></div>';
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
function questionHints(q){
 const item=q.item,rom=String(item.read||'');
 if(q.mode==='listen')return ['Nghe lại và chú ý âm đầu.','Quan sát hình nét và so sánh các đáp án.','Nghe thêm một lần và tự đọc trước khi chọn.'];
 if(q.mode==='missing')return ['Nhìn nghĩa tiếng Việt rồi nhớ lại cả từ.','Thử đọc các chữ còn lại theo từng nhịp.','Xem lại dạng chữ ở vị trí trống, không chọn theo vị trí đáp án.'];
 if(q.mode.startsWith('vocab'))return ['Đây là từ có nghĩa, không phải chữ rời.','Tìm các Kana bạn đã học trong từ.','Đọc từ chậm theo từng nhịp trước khi chọn nghĩa.'];
 if(q.mode==='truefalse')return ['Quan sát chữ và âm được cho.','Thử đọc chữ không nhìn Romaji.','Đối chiếu cả âm đầu và nguyên âm cuối.'];
 return ['Chữ thuộc nhóm '+(item.group||'Kana')+'.','Cách đọc bắt đầu với '+(rom.slice(0,1)||'một âm')+'…','Hãy xác định âm cuối '+(rom.slice(-1)||'')+' và tự đọc trước khi chọn.'];
}
function hintView(q,s){
 if(s.choice)return '';
 const count=s.hintsUsed||0,arr=questionHints(q);
 return '<div class="v101-hints"><button type="button" data-f33="hint" class="v101-hint-button" '+(count>=3?'disabled':'')+'>✧ Gợi ý '+count+'/3</button>'+
 (count?'<div role="status" class="v101-hint-content">'+arr.slice(0,count).map((h,i)=>'<p><strong>'+['I','II','III'][i]+'.</strong> '+clean(h)+'</p>').join('')+'</div>':'')+
 '<small>Câu đúng sau gợi ý vẫn được tính đúng, nhưng sẽ đưa vào sổ ôn.</small></div>';
}
function insightPanel(item,cfg){
 if(!item)return '';
 const all=DATA.take(cfg.id,'all',cfg.script),same=all.filter(x=>x.id!==item.id&&x.script===item.script&&x.group===item.group).slice(0,3);
 const words=(DATA.words||[]).filter(w=>w.script===item.script&&w.glyph.includes(item.glyph)&&w.glyph!==item.glyph).slice(0,3);
 const isLexical=typeof item.vi==='string';
 const examples=isLexical?[item]:words;
 const note=item.note||(!isLexical?'Đọc chữ này, sau đó so sánh với các chữ ở cùng nhóm.':'Đọc trọn từ và nhớ nghĩa trong ngữ cảnh.');
 return '<section class="v103-insight" aria-label="Hiểu thêm và nhớ lâu"><div class="v103-insight-title"><span aria-hidden="true">✦</span><div><strong>Hiểu thêm & nhớ lâu</strong><small>Giải thích sau khi trả lời · không cần mở trang khác</small></div></div>'+
 '<div class="v103-insight-main"><span lang="ja">'+clean(item.glyph)+'</span><div><strong>'+clean(item.read)+'</strong>'+(isLexical?'<small>'+clean(item.vi)+'</small>':'<small>Nhóm '+clean(item.group||item.stage||'Kana')+'</small>')+'</div><button type="button" class="v103-audio" data-f33="insight-audio" data-value="'+clean(item.glyph)+'" data-reading="'+clean(item.read)+'">▶ Nghe</button></div>'+
 '<div class="v103-insight-sections"><div><b>Giải thích</b><p>'+clean(note)+'</p></div>'+
 (same.length?'<div><b>So sánh trong cùng nhóm</b><div class="v103-compare">'+same.map(x=>'<span lang="ja">'+clean(x.glyph)+' <small>'+clean(x.read)+'</small></span>').join('')+'</div></div>':'')+
 (examples.length?'<div class="v103-examples"><b>Ví dụ thực tế</b>'+examples.map(w=>'<button type="button" data-f33="insight-audio" data-value="'+clean(w.glyph)+'" data-reading="'+clean(w.read)+'"><span lang="ja">'+clean(w.glyph)+'</span><span>'+clean(w.read)+' · '+clean(w.vi)+'</span><span aria-hidden="true">▶</span></button>').join('')+'</div>':'')+
 '</div></section>';
}
function quizView(cfg,s){
 if(s.finished||s.index>=s.questions.length)return summaryView(cfg,s);
 const q=s.questions[s.index];
 return '<section class="v33-pane"><div class="v33-pane-head"><div><p class="v33-eyebrow">'+(cfg.mode==='mix'?'KIỂM TRA TỔNG HỢP':'BÀI LUYỆN')+' · '+clean(modeNames[cfg.mode])+'</p><h3>Nhớ lại không nhìn gợi ý</h3><p>'+clean(q.prompt)+'</p></div><div class="v37-head-meta">'+tag('Câu '+(s.index+1)+' / '+s.questions.length)+(cfg.mode==='mix'?clock(s,!!s.choice):'')+'</div></div>'+
 (q.mode==='listen'?'<div class="v35-listen-panel"><p>Nghe và chọn chữ. Có thể nghe lại nhiều lần.</p><button class="v35-listen-trigger" data-f33="listen-audio" aria-label="Nghe phát âm Kana"><span aria-hidden="true">♫</span> Phát âm thanh</button></div>':'<div class="v33-question-glyph" lang="'+(q.mode.startsWith('vocab')&&q.mode==='vocab-vi-ja'?'vi':'ja')+'">'+clean(q.stimulus)+'</div>')+
 '<p class="v36-audio-status" role="status" aria-live="polite" hidden></p>'+hintView(q,s)+'<div class="v33-answer-grid '+(q.mode==='truefalse'?'v104-truefalse':'')+'">'+q.choices.map(opt=>'<button class="v33-answer v104-answer '+(s.choice&&opt.id===q.correct?'correct':'')+' '+(s.choice===opt.id&&s.choice!==q.correct?'wrong':'')+'" data-f33="answer" data-value="'+clean(opt.id)+'" '+(s.choice?'disabled':'')+'>'+(q.mode==='truefalse'?'<span class="v104-choice-symbol" aria-hidden="true">'+(opt.id==='yes'?'✓':'×')+'</span>':'')+'<span class="v104-answer-label">'+clean(opt.label)+'</span>'+(s.choice&&opt.id===q.correct?'<span class="v104-answer-result is-correct" aria-label="Đáp án đúng">✓</span>':s.choice===opt.id&&s.choice!==q.correct?'<span class="v104-answer-result is-wrong" aria-label="Đáp án sai">×</span>':'')+'</button>').join('')+'</div>'+
 (s.choice?'<div class="v33-feedback '+(s.choice===q.correct?'positive':'negative')+'" role="status"><strong>'+(s.choice===q.correct?(s.grade?.slow?'Đúng nhưng cần luyện phản xạ.':'Chính xác.'):'Chưa đúng. Đáp án: '+clean(q.choices.find(x=>x.id===q.correct)?.label))+'</strong>'+(cfg.mode==='mix'?'<small class="v37-answer-speed">'+timeLabel(s.lastMs)+' · '+(s.grade?.outcome==='incorrect'?'Đã lưu câu sai vào sổ ôn':s.grade?.slow?'Đã lưu vào sổ ôn vì chậm':'Đúng trong ngưỡng luyện')+'</small>':'<small class="v39-casual-feedback">'+(s.choice===q.correct?'Đã ghi nhận câu đúng':'Đã thêm chữ cần ôn')+' · Không tính thời gian</small>')+'<p>'+clean(q.note)+'</p>'+(s.hintsUsed?'<small class="v101-assisted">Có dùng '+s.hintsUsed+' gợi ý — cần ôn lại không trợ giúp.</small>':'')+'<button class="v36-feedback-audio" data-f33="feedback-audio" type="button">▶ Nghe đáp án</button></div>'+insightPanel(q.item,cfg)+'<div class="v33-pane-actions v104-sticky-next" role="navigation" aria-label="Điều hướng câu luyện"><span class="v104-next-caption">'+(s.index+1)+' / '+s.questions.length+' câu · Có thể đọc thêm hoặc tiếp tục</span><button class="v33-primary" data-f33="next">'+(s.index+1===s.questions.length?'Xem kết quả':'Câu tiếp theo')+' →</button></div>':'<p class="v33-subline">Chọn một đáp án. Kết quả và giải thích hiện ngay, không cần bấm “Kiểm tra” thêm lần nữa.</p>')+
 '</section>';
}
function summaryView(cfg,s){
 const total=s.questions?.length||0;
 const avg=s.roundMs?.length?timeLabel(s.roundMs.reduce((a,b)=>a+b,0)/s.roundMs.length):'—';
 return '<section class="v33-pane v33-summary"><p class="v33-eyebrow">KẾT QUẢ LƯỢT LUYỆN</p><h3>Hoàn thành bài kiểm tra</h3><div class="v33-summary-score">'+s.correct+' <span>/ '+total+' câu đúng</span></div>'+
 (cfg.mode==='mix'?'<div class="v37-summary-stats"><span>Đúng chậm: <strong>'+s.slow+'</strong></span><span>Sai: <strong>'+s.errors+'</strong></span><span>TB phản hồi: <strong>'+avg+'</strong></span></div>':'')+
 '<p>'+(cfg.mode==='mix'?'Chữ đúng chậm và chữ sai được đề xuất ôn. Ngưỡng phản xạ mang tính thử nghiệm.':'Luyện tập không tính thời gian; các chữ sai được đưa vào Sổ ôn.')+'</p>'+
 '<div class="v33-pane-actions"><button data-f33="restart" class="v33-primary">Luyện lại ngẫu nhiên</button><button data-f34="mode" data-value="review" class="v33-secondary">Ôn chữ cần luyện</button></div></section>';
}

function buildView(cfg,s){
 if(!s.cards.length)return noData('Chưa đủ từ ngữ cảnh để ghép chữ.');
 if(s.finished||s.index>=s.cards.length)return '<section class="v33-pane v33-summary"><p class="v33-eyebrow">XẾP CHỮ · TỔNG KẾT</p><h3>Đã hoàn thành lượt ghép chữ</h3><div class="v33-summary-score">'+s.correct+' <span>/ '+s.cards.length+' từ đúng</span></div><p>Luyện lại những từ sai sau khi xem mặt chữ và cách đọc.</p><div class="v33-pane-actions"><button data-f33="restart" class="v33-primary">Ghép lại từ đầu</button></div></section>';
 const word=s.cards[s.index],selected=s.selected.map(i=>s.tileOrder[i].glyph).join('');
 return '<section class="v33-pane"><div class="v33-pane-head"><div><p class="v33-eyebrow">GHÉP CHỮ THÀNH TỪ</p><h3>Xếp Kana theo đúng thứ tự</h3><p>Nhìn nghĩa tiếng Việt, chạm các mảnh chữ để ghép thành từ Nhật. Không cần kéo thả.</p></div><div class="v37-head-meta">'+tag('Từ '+(s.index+1)+' / '+s.cards.length)+(cfg.mode==='mix'?clock(s,!!s.answer):'')+'</div></div>'+
 '<div class="v33-build-clue"><span>NGHĨA TIẾNG VIỆT</span><strong>'+clean(word.vi)+'</strong></div>'+
 '<div class="v33-build-answer v106-build-answer" data-f35-drop="build" aria-label="Các chữ đã xếp" aria-live="polite">'+(selected?s.selected.map((tileIndex,position)=>'<button type="button" data-f33="remove-tile" data-value="'+position+'" class="v106-selected-tile" '+(s.answer?'disabled':'')+' aria-label="Trả chữ '+clean(s.tileOrder[tileIndex].glyph)+' về khay" lang="ja">'+clean(s.tileOrder[tileIndex].glyph)+(s.answer?'':'<small aria-hidden="true">×</small>')+'</button>').join(''):'<small>Chọn ký tự bên dưới để ghép từ</small>')+'</div>'+
 '<div class="v33-build-tiles">'+s.tileOrder.map((x,i)=>'<button data-f33="tile" data-value="'+i+'" draggable="true" class="v33-build-tile" '+(s.selected.includes(i)||s.answer?'disabled':'')+' lang="ja">'+clean(x.glyph)+'</button>').join('')+'</div>'+
 (s.answer?'<div class="v33-feedback '+(s.answer.correct?'positive':'negative')+'" role="status"><strong>'+(s.answer.correct?'Đúng!':'Chưa đúng: '+clean(word.glyph))+'</strong><p>'+clean(word.glyph)+' → '+clean(word.read)+' · '+clean(word.vi)+'. '+clean(word.note||'')+'</p><button type="button" class="v36-feedback-audio" data-f33="feedback-audio">▶ Nghe đáp án</button></div>':'<p class="v33-subline">Câu trả lời được chấm ngay khi bạn ghép đủ số ký tự.</p>')+
 '<div class="v33-pane-actions">'+(!s.answer?'<button class="v33-secondary" data-f33="undo" '+(!s.selected.length?'disabled':'')+'>Bỏ chữ cuối</button>':(s.answer.correct?'':'<button class="v33-secondary" data-f33="retry-build">↻ Thử lại từ này</button>')+'<button class="v33-primary" data-f33="build-next">'+(s.index+1===s.cards.length?'Xem kết quả':'Từ tiếp theo')+' →</button>')+'</div></section>';
}
/* Matching connectors use actual button geometry, not a protruding CSS border. */
/* Single connector lane: measure active tab relative to scrollable rail.
   The right page has no left border; no pseudo-elements or cuts are needed. */
function updateBookConnector(){
 const area=document.querySelector?.('.v39-book-layout');
 const nav=area?.querySelector?.('.v39-book-nav');
 const active=nav?.querySelector?.('.v39-book-tab.active');
 const lane=area?.querySelector?.('.v102-connector-lane');
 const bridge=lane?.querySelector?.('.v102-connector-bridge');
 if(!nav||!active||!lane||!bridge||!lane.getBoundingClientRect)return;
 const a=active.getBoundingClientRect(),l=lane.getBoundingClientRect();
 const y=a.top-l.top,h=a.height;
 const visible=y>=0&&y+h<=l.height;
 lane.classList.toggle('v102-outside',!visible);
 bridge.style.top=y+'px';bridge.style.height=h+'px';
}
let bookFramePending=false;
function scheduleBookConnector(){
 if(bookFramePending)return;
 bookFramePending=true;
 const run=()=>{bookFramePending=false;updateBookConnector();};
 if(typeof requestAnimationFrame==='function')requestAnimationFrame(run);
 else if(typeof queueMicrotask==='function')queueMicrotask(run);
 else run();
}
function restoreBookViewport(scrollTop=null){
 const nav=document.querySelector?.('.v39-book-layout .v39-book-nav');
 if(!nav)return;
 if(Number.isFinite(scrollTop))nav.scrollTop=scrollTop;
 else {
  const active=nav.querySelector?.('.v39-book-tab.active');
  if(active&&active.offsetTop+active.offsetHeight>nav.scrollTop+nav.clientHeight)
   nav.scrollTop=Math.max(0,active.offsetTop+active.offsetHeight-nav.clientHeight+12);
 }
 scheduleBookConnector();
}
function drawMatchLines(){
 const board=document.querySelector?.('[data-match-board]');
 const svg=board?.querySelector?.('.v101-match-lines');
 const cfg=current(),s=play;
 if(!svg||!s||!Array.isArray(s.matched)||!board.getBoundingClientRect)return;
 const box=board.getBoundingClientRect(),width=box.width,height=box.height;
 if(!width||!height)return;
 svg.setAttribute('viewBox','0 0 '+width+' '+height);
 svg.setAttribute('width',String(width));svg.setAttribute('height',String(height));
 const point=(side,id)=>{
  const node=Array.from(board.querySelectorAll?.('[data-side="'+side+'"]')||[]).find(el=>el.dataset.value===id);
  if(!node)return null;
  const r=node.getBoundingClientRect();return {x:(side==='left'?r.right:r.left)-box.left,y:r.top+r.height/2-box.top};
 };
 const curve=(a,b,cls)=>{const mid=(a.x+b.x)/2;return '<path class="'+cls+'" d="M'+a.x+' '+a.y+' C'+mid+' '+a.y+' '+mid+' '+b.y+' '+b.x+' '+b.y+'"/>';};
 let paths=s.matched.map(id=>{const a=point('left',id),b=point('right',id);return a&&b?curve(a,b,'v101-match-ok'):''}).join('');
 if(s.leftId&&!s.matched.includes(s.leftId)){const a=point('left',s.leftId);if(a)paths+=curve(a,{x:width/2,y:a.y},'v101-match-pending');}
 if(s.wrongPair){const a=point('left',s.wrongPair.left),b=point('right',s.wrongPair.right);if(a&&b)paths+=curve(a,b,'v105-match-wrong');}
 svg.innerHTML=paths;
}
function scheduleMatchLines(){
 if(typeof requestAnimationFrame==='function')requestAnimationFrame(drawMatchLines);
 else if(typeof queueMicrotask==='function')queueMicrotask(drawMatchLines);
}
if(typeof window!=='undefined'&&window.addEventListener)window.addEventListener('resize',()=>{scheduleMatchLines();scheduleBookConnector();});
document.addEventListener('scroll',event=>{if(event.target?.classList?.contains('v39-book-nav'))scheduleBookConnector();},true);
function matchingView(cfg,s){
 if(!s.cards.length)return noData('Nhóm này chưa có đủ cặp duy nhất. Hãy chọn bảng hoặc nhóm khác.');
 const complete=s.matched.length===s.cards.length;
 const listening=['listen-match','game-listen'].includes(s.kind);
 const left=x=>'<button type="button" data-f33="match" data-side="left" data-value="'+clean(x.id)+'" class="v105-tile v33-match-tile '+(s.matched.includes(x.id)?'done':s.leftId===x.id?'selected':'')+'" '+(s.matched.includes(x.id)?'disabled':'')+' aria-label="'+clean(listening?'Nghe âm '+x.read:'Kana '+x.glyph)+'">'+(listening?'▶ Nghe':'<span lang="ja">'+clean(x.glyph)+'</span>')+(s.matched.includes(x.id)?'<span class="v105-check">✓</span>':'')+'</button>';
 const right=x=>'<button type="button" data-f33="match" data-side="right" data-value="'+clean(x.id)+'" data-f35-drop="match" class="v105-tile v33-match-tile '+(s.matched.includes(x.id)?'done':s.rightId===x.id?'selected':'')+'" '+(s.matched.includes(x.id)?'disabled':'')+' aria-label="'+clean(listening?'Kana '+x.glyph:'Romaji '+x.read)+'">'+(listening?'<span lang="ja">'+clean(x.glyph)+'</span>':'<span class="v105-romaji">'+clean(x.read||'')+'</span>')+(cfg.script==='both'&&cfg.mod.script==='both'&&!listening?'<small>'+ (x.script==='hira'?'Hira':'Kata')+'</small>':'')+(s.matched.includes(x.id)?'<span class="v105-check">✓</span>':'')+'</button>';
 const rows=s.left.map((x,i)=>'<div class="v105-match-row">'+left(x)+right(s.right[i])+'</div>').join('');
 return '<section class="v33-pane"><div class="v33-pane-head"><div><p class="v33-eyebrow">'+(listening?'NGHE & GHÉP':s.kind==='game'?'GAME · GHÉP CẶP':'GHÉP CẶP · 2 CỘT')+'</p><h3>'+(listening?'Nghe và ghép đúng chữ':'Ghép Kana với Romaji')+'</h3><p>'+(listening?'Nghe ở bên trái, sau đó chọn chữ phù hợp bên phải.':'Chọn một ô Kana và một ô Romaji để nối cặp.')+'</p></div>'+tag(s.matched.length+' / '+s.cards.length+' cặp')+'</div>'+
 '<div class="v105-match-tools"><span>Hai bên được trộn ngẫu nhiên, không theo cùng thứ tự.</span><button type="button" class="v105-remix" data-f33="restart">↻ Ván mới</button></div>'+
 (cfg.mod.script==='both'?'<div class="v105-script-options" role="group" aria-label="Bảng chữ">'+[['both','Cả hai'],['hira','Hiragana'],['kata','Katakana']].map(([id,label])=>'<button type="button" data-f34="script" data-value="'+id+'" aria-pressed="'+(cfg.script===id)+'">'+label+'</button>').join('')+'</div>':'')+
 '<div class="v105-match-board" data-match-board="1"><div class="v105-match-header"><strong>'+(listening?'NGHE ÂM':'KANA')+'</strong><strong>'+(listening?'KANA':'ROMAJI')+'</strong></div>'+rows+'<svg class="v101-match-lines" aria-hidden="true" preserveAspectRatio="none"></svg></div>'+
 '<p class="v105-match-feedback" aria-live="polite">'+clean(s.feedback||'Chọn một ô ở mỗi bên để ghép cặp.')+'</p>'+
 (s.lastMatched?insightPanel(s.cards.find(x=>x.id===s.lastMatched),cfg):'')+
 (complete?'<div class="v33-pane-actions"><button type="button" data-f33="summary-open" class="v33-primary">Xem lại kết quả ✦</button><button type="button" data-f33="restart" class="v33-secondary">Ván mới</button></div>':'')+
 '</section>';
}

function modeDirections(mode){
 const instructions={
 quiz:'Nhìn chữ Kana, chọn đúng cách đọc.',
 reverse:'Nhìn phiên âm, chọn chữ Kana tương ứng.',
 listen:'Nhấn “Phát âm thanh”, nghe tiếng Nhật, sau đó chọn chữ.',
 'listen-match':'Nhấn các ô phát âm bên trái, ghép với chữ bên phải.',
 truefalse:'So sánh chữ với cách đọc hiển thị, rồi chọn Đúng hoặc Sai.',
 match:'Ghép chữ Kana ở cột trái với cách đọc ở cột phải.',
 build:'Xếp các mảnh Kana theo thứ tự để tạo từ có nghĩa.',
 'vocab-ja-vi':'Nhìn từ tiếng Nhật và chọn nghĩa tiếng Việt.',
 'vocab-vi-ja':'Nhìn nghĩa tiếng Việt và chọn từ tiếng Nhật.',
 review:'Ôn lại các chữ sai, chậm hoặc đến hạn. Câu hỏi đổi dạng để luyện nhớ.',
 mix:'Các câu trộn Chữ→Âm, Âm→Chữ, Đúng/Sai và Nghe→Chữ. Với câu nghe, hãy nhấn nút phát tiếng trước khi chọn.'
 };
 return instructions[mode]||'Đọc câu hỏi và chọn đáp án phù hợp.';
}
function introPopup(cfg,s){
 const mode=cfg.mode;
 const count=s.questions?.length||s.cards?.length||0;
 const mixed=mode==='mix'||mode==='review';
 const threshold=mixed?'5–9 giây (theo từng câu)':(targetMs(mode)/1000)+' giây';
 return '<div class="v38-overlay" role="presentation"><section class="v38-dialog" role="dialog" aria-modal="true" aria-labelledby="v38-title" aria-describedby="v38-description">'+
 '<div class="v38-dialog-icon" aria-hidden="true">◷</div>'+
 '<p class="v33-eyebrow">HƯỚNG DẪN TRƯỚC KHI LUYỆN</p><h3 id="v38-title">'+clean(mode==='mix'?'Kiểm tra tổng hợp':modeNames[mode]||'Luyện tập')+'</h3>'+
 '<p id="v38-description">'+clean(modeDirections(mode))+'</p>'+
 '<div class="v38-dialog-spec"><div><span>Số câu / từ</span><strong>'+count+'</strong></div><div><span>Ngưỡng tham khảo</span><strong>'+clean(threshold)+'</strong></div><div><span>Đồng hồ</span><strong>Theo từng câu</strong></div></div>'+
 '<div class="v38-rule-list"><p><strong>Đúng trong ngưỡng (tạm đạt):</strong> phản xạ tốt; vẫn cần đúng lại ở các ngày sau để xác nhận đã nhớ.</p><p><strong>Đúng nhưng chậm (cần ôn):</strong> vẫn được tính đúng, nhưng đưa vào Sổ ôn để luyện phản xạ.</p><p><strong>Trả lời sai (chưa vững):</strong> xem đáp án/giải thích và đưa vào Sổ ôn.</p></div>'+
 '<p class="v38-disclaimer">Thời gian chỉ bắt đầu sau khi nhấn “Bắt đầu”. Không trừ điểm khi nghe lại; không có thời hạn bắt buộc. Chưa giới hạn tổng thời gian làm bài. Ngưỡng là tiêu chí luyện tập thử nghiệm, không phải chuẩn JLPT.</p>'+
 (mode==='mix'||mode==='review'?'<p class="v38-audio-tip">♫ Bài nghe: nhấn nút <strong>Phát âm thanh</strong> để nghe. Trình duyệt có thể chặn tự phát âm thanh.</p>':'')+
 '<div class="v38-dialog-actions"><button class="v33-secondary" type="button" data-f38="cancel">Quay về Học</button><button class="v33-primary" type="button" data-f38="start" autofocus>Bắt đầu '+(mode==='mix'?'kiểm tra':'luyện tập')+' →</button></div></section></div>';
}
const PRACTICE_MODES=[['quiz','Chữ → âm','あ'],['reverse','Âm → chữ','a'],['listen','Nghe → chữ','♫'],['truefalse','Đúng / Sai','✓'],['match','Ghép chữ & âm','⇄'],['listen-match','Nghe & ghép','◖'],['build','Xếp chữ thành từ','文'],['missing','Điền chữ còn thiếu','□'],['vocab-ja-vi','Nhật → Việt','日'],['vocab-vi-ja','Việt → Nhật','VI'],['review','Sổ ôn chữ yếu','↻']];
const GAME_MODES=[['game','Ghép cặp Kana','⇄'],['game-build','Xếp từ vui','文'],['game-listen','Nghe & nối','♫']];
function audioPref(){
 try{return localStorage.getItem('horizon.foundation.autoAnswerAudio')!=='off'}catch(e){return true}
}
function toggleAudioPref(){
 const enabled=!audioPref();
 try{localStorage.setItem('horizon.foundation.autoAnswerAudio',enabled?'on':'off')}catch(e){}
 return enabled;
}
function activityBook(cfg){
 const isGame=cfg.mode.startsWith('game');
 const items=(isGame?GAME_MODES:PRACTICE_MODES).filter(([id])=>!['listen','listen-match','game-listen'].includes(id)||(cfg.id!=='small'&&cfg.id!=='mixed'));
 const groups=isGame?[['TRÒ CHƠI',items]]:[
  ['NHẬN DIỆN',items.filter(x=>['quiz','reverse','listen','truefalse'].includes(x[0]))],
  ['GHÉP & GHI NHỚ',items.filter(x=>['match','listen-match','build','missing'].includes(x[0]))],
  ['NGHĨA & ỨNG DỤNG',items.filter(x=>['vocab-ja-vi','vocab-vi-ja'].includes(x[0]))],
  ['ÔN TẬP',items.filter(x=>x[0]==='review')]
 ];
 const entry=([id,label,symbol])=>'<button type="button" data-f34="mode" data-value="'+id+'" class="v39-book-tab '+(id===cfg.mode?'active':'')+'" '+(id===cfg.mode?'aria-current="page"':'')+'><span class="v39-book-symbol" aria-hidden="true">'+symbol+'</span><span>'+label+'</span><span aria-hidden="true" class="v39-book-chevron">›</span></button>';
 return '<nav class="v39-book-nav" aria-label="'+(isGame?'Trò chơi Kana':'Sổ bài tập')+'">'+
 
 '<button type="button" class="v105-audio-toggle" data-f33="toggle-audio" aria-pressed="'+audioPref()+'"><span aria-hidden="true">'+(audioPref()?'◖))':'◖×')+'</span> Âm thanh đáp án: <strong>'+(audioPref()?'Bật':'Tắt')+'</strong></button>'+
 groups.filter(([,entries])=>entries.length).map(([label,entries])=>'<div class="v106-menu-group"><div class="v106-group-heading">'+label+'</div><div class="v105-menu-entries">'+entries.map(entry).join('')+'</div></div>').join('')+
 '</nav>';
}

function workspace(cfg){
 const s=cfg.mode==='learn'?null:ensurePlay(cfg);
 const intro=cfg.mode==='mix'&&s&&!s.ready&&!s.finished?introPopup(cfg,s):'';
 const body=cfg.mode==='learn'?learnView(cfg):cfg.mode==='flash'?flashView(cfg,s):['match','listen-match','game','game-listen'].includes(cfg.mode)?matchingView(cfg,s):['build','game-build'].includes(cfg.mode)?buildView(cfg,s):quizView(cfg,s);
 const gameOrPractice=cfg.mode!=='learn'&&cfg.mode!=='flash'&&cfg.mode!=='mix';
 const weak=weakList(cfg);
 const panel='<aside class="v33-side"><h3>Sổ ôn · Gợi ý theo kết quả</h3>'+
 (weak.length?'<div class="v37-weak-list">'+weak.map(x=>'<span lang="ja">'+clean(x.glyph)+' <small>'+clean(store().items[x.id]?.latestOutcome==='incorrect'?'Sai':'Chậm / đến hạn')+'</small></span>').join('')+'</div><button type="button" class="v37-review-link" data-f34="mode" data-value="review">Ôn những chữ này →</button>':'<p>Chưa có chữ cần ôn. Hãy thử một lượt kiểm tra.</p>')+
 '<div class="v33-side-divider"></div><p>Trả lời sai được lưu ôn; bài Luyện tập và Game không đánh giá nhanh/chậm.</p></aside>';
 return navigationFor(cfg)+'<div class="v38-task-area"><div class="'+(gameOrPractice?'v39-book-layout':'v33-workspace')+'"'+(intro?' inert':'')+'>'+(gameOrPractice?activityBook(cfg)+body:body+panel)+'</div>'+intro+(s&&MATCH_KINDS.includes(s.kind)?summaryView(s,cfg):'')+'</div>';
}
function modulePage(cfg){
 scheduleFoundationOverlay();scheduleMatchLines();tickClock();if(typeof queueMicrotask==='function')queueMicrotask(()=>restoreBookViewport());return wrap('<div class="v34-workspace-shell">'+workspace(cfg)+'</div>',cfg.mod.title).replace('class="v25-wrap v33-foundation"','class="v25-wrap v33-foundation v34-studying"');
}
function page(route){
 if(!route||route==='course/foundation'||route===routePrefix)return indexPage();
 const cfg=current();return cfg.mod?modulePage(cfg):indexPage();
}
function perform(el){
 const cfg=current(),op=el.dataset.f33,value=el.dataset.value,side=el.dataset.side;
 if(!cfg.mod)return;
 if(op==='guide-ok'){dismissCoach();return;}
 if(op==='toggle-audio'){toggleAudioPref();refresh();return;}
 if(op==='summary-close'&&play?.round){play.round.summaryOpen=false;refresh();return;}
 if(op==='summary-open'&&play?.round?.summary){play.round.summaryOpen=true;refresh();focusRoundSummary();return;}
 if(op==='summary-new'&&play?.round?.summary){play=null;ensurePlay(cfg);refresh();return;}
 if(op==='summary-review'&&play?.round?.summary){if(roundReview(play,cfg))refresh();return;}
 if(op==='summary-next'&&play?.round?.summary){localSwitch('mode',['match','game'].includes(play.kind)?'listen-match':'mix');return;}
 if(op==='insight-audio'){pronounce(value,el.dataset.reading||'',true);return;}
 if(op==='pronounce'&&cfg.mode==='learn'){pronounce(value,el.dataset.reading||'',el.dataset.kind==='basic');dismissCoach();return;}
 if(op==='listen-audio'&&(cfg.mode==='listen'||cfg.mode==='mix'||cfg.mode==='review')){const state=ensurePlay(cfg),q=state.questions[state.index];if(q){state.audioReplays=(state.audioReplays||0)+1;pronounce(q.item.glyph,q.item.read,true);}return;}
 if(op==='feedback-audio'&&cfg.mode!=='learn'){const state=ensurePlay(cfg),q=state.questions?.[state.index],word=state.cards?.[state.index];if(q&&state.choice)pronounce(q.item.glyph,q.item.read,true);else if(word&&state.answer)pronounce(word.glyph,word.read,true);return;}
 if(op==='flash-audio'&&cfg.mode==='flash'){const state=ensurePlay(cfg);if(state.flipped)pronounce(state.cards[state.index]?.glyph,state.cards[state.index]?.read,true);return;}
 if(cfg.mode==='learn')return;
 const s=ensurePlay(cfg);
 if(!s.ready&&s.kind!=='flash')return;
 if(op==='hint'&&s.questions&&!s.choice&&!s.finished){s.hintsUsed=Math.min(3,(s.hintsUsed||0)+1);refresh();return;}
 if(op==='tile'&&['build','game-build'].includes(s.kind)&&!s.answer){
  const i=Number(value);if(!Number.isInteger(i)||i<0||i>=s.tileOrder.length||s.selected.includes(i))return;
  s.selected.push(i);
  const word=s.cards[s.index],built=s.selected.map(n=>s.tileOrder[n].glyph).join('');
  if(s.selected.length===Array.from(word.glyph).length){
   const correct=built===word.glyph;s.answer={correct,built};if(correct)s.correct++;
   s.lastMs=null;s.grade=record(word,correct,s.kind,null);if(audioPref())pronounce(word.glyph,word.read,true);
  }
  refresh();return;
 }
 if(op==='remove-tile'&&['build','game-build'].includes(s.kind)&&!s.answer){
  const at=Number(value);if(!Number.isInteger(at)||at<0||at>=s.selected.length)return;
  s.selected.splice(at,1);refresh();return;
 }
 if(op==='retry-build'&&['build','game-build'].includes(s.kind)&&s.answer&&!s.answer.correct){
  s.answer=null;s.selected=[];refresh();return;
 }
 if(op==='undo'&&['build','game-build'].includes(s.kind)&&!s.answer){s.selected.pop();refresh();return}
 if(op==='build-next'&&['build','game-build'].includes(s.kind)&&s.answer){
  s.index++;s.finished=s.index>=s.cards.length;s.selected=[];s.answer=null;
  if(!s.finished){s.tileOrder=shuffle(Array.from(s.cards[s.index].glyph).map((glyph,i)=>({glyph,i})));if(s.startedAt)resetClock(s);}
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
  const took=cfg.mode==='mix'?elapsed(s):null;s.lastMs=took;s.choice=value;s.answered++;const ok=value===q.correct;if(ok)s.correct++;
  s.grade=record(q.item,ok,q.mode||cfg.mode,took,s.hintsUsed||0,s.audioReplays||0);if(audioPref())pronounce(q.item.glyph,q.item.read,true);if(took!==null)s.roundMs.push(took);if(s.grade.slow)s.slow++;if(!ok)s.errors++;
  refresh();return;
 }
 if(op==='next'&&s.choice){s.index++;s.choice=null;s.grade=null;s.hintsUsed=0;s.audioReplays=0;if(s.startedAt)resetClock(s);s.finished=s.index>=s.questions.length;refresh();return}
 if(op==='match'&&['match','listen-match','game','game-listen'].includes(s.kind)&&!s.matched.includes(value)&&s.cards.some(x=>x.id===value)){
  if(side==='left'){s.leftId=value;roundSelect(s,value);if(['listen-match','game-listen'].includes(s.kind)){const sample=s.cards.find(x=>x.id===value);if(sample){listenRound(s,value);pronounce(sample.glyph,sample.read,true);}}}
  else if(side==='right'){s.rightId=value;roundSelect(s,value);}
  if(s.leftId&&s.rightId){
   const left=s.leftId,right=s.rightId;
   const ok=left===right;const item=s.cards.find(x=>x.id===left);
   roundAttempt(s,left,right,ok);
   record(item,ok,s.kind,null);
   if(ok){s.lastMatched=item.id;s.matched.push(item.id);s.feedback='Đúng! Hãy ghép cặp tiếp theo.';if(audioPref())pronounce(item.glyph,item.read,true);}
   else{s.mistakes++;s.feedback='Chưa đúng. Đường đỏ chỉ cặp vừa chọn, thử lại nhé.';s.wrongPair={left,right};}
   s.leftId=null;s.rightId=null;
   if(ok&&s.matched.length===s.cards.length)completeRound(s,cfg);
  }
  refresh();
  if(s.round?.summaryOpen)focusRoundSummary();
  if(s.wrongPair){
   const ref=s.wrongPair;
   if(typeof setTimeout==='function')setTimeout(()=>{if(play===s&&s.wrongPair===ref){s.wrongPair=null;s.feedback='Thử ghép lại hai ô.';refresh();}},950);
  }
  return;
 }
 if(op==='restart'){play=null;ensurePlay(cfg);refresh()}
}
/* Local switching preserves the page viewport and avoids hash navigation on every exercise tab. */
function localSwitch(kind,value){
 removeFoundationOverlay();
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
  if(!['quiz','reverse','listen','listen-match','review','truefalse','match','build','vocab-ja-vi','vocab-vi-ja','missing','game','game-build','game-listen'].includes(value))return;
  target.mode=value;
 }else if(kind==='tab'){
  if(!['learn','flash','practice','game','mix'].includes(value))return;
  target.mode=value==='practice'?'quiz':value;
 }else return;
 play=null;
 const next=path(target.id,target.group,target.mode,target.script);
 if(typeof history!=='undefined'&&history.replaceState)history.replaceState(null,'','#'+next);
 else location.hash='#'+next;
 const stage=document.querySelector('.v34-workspace-shell');
 if(stage){const rail=stage.querySelector?.('.v39-book-nav'),saved=rail?rail.scrollTop:null;stage.innerHTML=workspace(target);restoreBookViewport(saved);mountFoundationOverlay();tickClock();scheduleMatchLines();const crumb=document.querySelector('.v33-foundation .v25-breadcrumb [aria-current="page"]');if(crumb)crumb.textContent=target.mod.title;}
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
if(typeof window!=='undefined'&&window.addEventListener)window.addEventListener('hashchange',removeFoundationOverlay);
document.addEventListener('keydown',event=>{
 const modal=document.querySelector?.('[data-v107-dialog]');
 if(modal){
  if(event.key==='Escape'){event.preventDefault();if(play?.round){play.round.summaryOpen=false;refresh();}return;}
  if(event.key==='Tab'){
   const actions=Array.from(modal.querySelectorAll?.('button,[href],summary')||[]).filter(x=>!x.disabled);
   if(actions.length){const first=actions[0],last=actions[actions.length-1],active=document.activeElement;
    if(event.shiftKey&&(active===first||active===modal.querySelector?.('.v107-dialog'))){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&active===last){event.preventDefault();first.focus();}
   }
  }
  return;
 }
 if(event.key!=='Escape'||!document.querySelector?.('.v38-dialog'))return;
 event.preventDefault();localSwitch('tab','learn');
});
document.addEventListener('click',event=>{
 const startAction=event.target.closest?.('[data-f38]');if(startAction&&document.querySelector('.v34-workspace-shell')){event.preventDefault();const cfg=current(),s=ensurePlay(cfg);if(startAction.dataset.f38==='start'){s.ready=true;resetClock(s);refresh();}else if(startAction.dataset.f38==='cancel'){localSwitch('tab','learn');}return;}
 const nav=event.target.closest('[data-f34="tab"],[data-f34="mode"]');if(nav?.dataset?.f34&&document.querySelector('.v34-workspace-shell')){event.preventDefault();localSwitch(nav.dataset.f34,nav.dataset.value);return;}
 const b=event.target.closest('[data-f33]');if(!b)return;
 if(!document.querySelector('.v33-foundation'))return;
 event.preventDefault();perform(b);
});
window.NPFoundationCourse={version:'v39',page,store,stats:countStats,path,questionFor,choosePool,session:()=>play};
})();