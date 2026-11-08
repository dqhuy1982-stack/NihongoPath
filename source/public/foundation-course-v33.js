/* HORIZON Foundation v33 · modular learning, contextual kana practice, no backend dependencies.
   Practice records are browser-local preview data; never modify lesson-engine progress. */
(function(){
'use strict';
const DATA=window.NPFoundationCurriculum;if(!DATA)return;
const clean=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const routePrefix='learn/foundation',base='#'+routePrefix;
const modes=[
 ['learn','Học','book-open'],['practice','Thực hành','target'],['flash','Flashcard','layers'],['listen','Nghe → chữ','volume-2'],['truefalse','Đúng / Sai','check-circle'],['quiz','Chữ → âm','target'],
 ['reverse','Âm → chữ','arrow-left-right'],['match','Ghép cặp','grid-2x2'],['build','Xếp chữ','puzzle'],
 ['vocab-ja-vi','Nhật → Việt','languages'],['vocab-vi-ja','Việt → Nhật','languages'],['missing','Điền Kana còn thiếu','puzzle'],['listen-match','Nghe & ghép','headphones'],['review','Ôn chữ yếu','refresh-cw'],['game','Ghép cặp vui','gamepad-2'],['game-build','Ghép từ','puzzle'],['game-listen','Nghe & nối','headphones'],['mix','Kiểm tra tổng hợp','check-circle-2']
];
const modeNames=Object.fromEntries(modes.map(([id,title])=>[id,title]));
const initialGroup=m=>DATA.getLessonUnits(m?.id)?.[0]?.id||(m?.id==='small'?'pause':'all');
const path=(id,group,mode,script)=>routePrefix+'/'+id+'/'+(group||initialGroup(DATA.byId[id]))+'/'+(mode||'learn')+(script&&script!=='both'?'/'+script:'');
function current(){
 const bits=decodeURIComponent(location.hash.replace(/^#\/?/,'')).split('/');
 const inline=bits[0]==='learn'&&bits[1]==='training'&&bits[2]==='foundation';
 const id=inline?bits[3]:bits[2],mod=DATA.byId[id];
 const group=(inline?bits[4]:bits[3])||(mod?initialGroup(mod):'');
 const legacyMode=(inline?bits[6]:bits[4])||'learn';
 const mode=({game:'match','game-listen':'listen-match','game-build':'build'})[legacyMode]||legacyMode;
 const script=bits[5]||'both';
 return {id,mod,group:mod&&(group==='all'||mod.groups.some(x=>x.id===group)||!!DATA.findLessonUnit(id,group))?group:mod?initialGroup(mod):'',mode:modeNames[mode]?mode:'learn',script:['hira','kata','both'].includes(script)?script:'both'};
}
function learnerId(){try{return String(P()?.id||'guest').replace(/[^a-z0-9_-]/gi,'_')}catch{return 'guest'}}
const localKey=()=>'Horizon.FoundationPractice.v1.'+learnerId();
function load(){
 try{const d=JSON.parse(localStorage.getItem(localKey())||'null');if(d?.schema===1&&d.items&&d.flash)return d;}catch(e){}
 return {schema:1,items:{},flash:{},history:[],attemptRuns:[]};
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

/* v1.40: Per-profile session length and result history, without migrating
   existing per-character records or marking lessons complete prematurely. */
const MAX_QUESTIONS=100,PASS_PERCENT=80;
const countKey=()=>'Horizon.Foundation.questionCount.v1.'+learnerId();
function countPrefs(){
 try{const d=JSON.parse(localStorage.getItem(countKey())||'null');
  if(Number.isInteger(d?.value)&&d.value>=1&&d.value<=MAX_QUESTIONS)
   return {value:d.value,preset:d.preset==='custom'?'custom':[10,15,20].includes(d.value)?String(d.value):'custom'};
 }catch(e){}
 return {value:10,preset:'10'};
}
function setCountPrefs(preset,value){
 const n=Math.min(MAX_QUESTIONS,Math.max(1,Math.round(Number(value)||10)));
 const data={value:n,preset:preset==='custom'?'custom':String(n)};
 try{localStorage.setItem(countKey(),JSON.stringify(data))}catch(e){}
 return data;
}
function repeatCandidates(items,count){
 if(!items.length||count<=0)return [];
 const result=[];
 while(result.length<count){
  const batch=chooseTargets(items,Math.min(items.length,count-result.length));
  if(result.length&&batch.length>1&&batch[0].id===result[result.length-1].id)
   [batch[0],batch[1]]=[batch[1],batch[0]];
  result.push(...batch);
 }
 return result;
}
function runHistory(){return Array.isArray(store().attemptRuns)?store().attemptRuns:[]}
function attemptStatus(id,unit,script='both'){
 const entries=runHistory().filter(x=>x.moduleId===id&&x.unitId===unit&&x.script===script);
 const practice=entries.filter(x=>x.kind==='practice'),tests=entries.filter(x=>x.kind==='test');
 const testPassed=tests.some(x=>x.percent>=PASS_PERCENT);
 return {practiceCount:practice.length,testCount:tests.length,practiceDone:practice.length>0,
  testDone:tests.length>0,testPassed,complete:practice.length>0&&testPassed,
  bestTest:tests.length?Math.max(...tests.map(x=>x.percent)):null,
  lastPractice:practice.at(-1)||null,lastTest:tests.at(-1)||null,history:entries.slice(-30)};
}
function saveAttempt(cfg,s){
 if(s.attemptRecorded||!s.finished)return;
 const total=s.questions?.length||s.cards?.length||0;if(!total)return;
 s.attemptRecorded=true;
 const match=['match','listen-match','game','game-listen'].includes(s.kind);
 const correct=match?s.round?.summary?.firstTryPairs??Math.max(0,total-s.mistakes):s.correct||0;
 const percent=Math.round(100*correct/total),kind=s.kind==='mix'?'test':'practice';
 const completedAt=new Date().toISOString(),db=store();
 const runs=Array.isArray(db.attemptRuns)?db.attemptRuns:[];
 runs.push({id:completedAt+'-'+Math.random().toString(36).slice(2,9),moduleId:cfg.id,unitId:cfg.group,
  script:cfg.script,mode:s.kind,kind,total,correct,percent,passed:kind==='test'&&percent>=PASS_PERCENT,
  startedAt:s.createdAt||s.round?.startedAt||completedAt,completedAt});
 db.attemptRuns=runs.slice(-500);persist();
}
function countControls(s){
 if(!s?.questions&&!['build','game-build'].includes(s?.kind))return '';
 const p=countPrefs(),current=s.questions?.length||s.cards?.length||0;
 const option=(v,name)=>'<option value="'+v+'"'+(p.preset===v?' selected':'')+'>'+name+'</option>';
 return '<div class="v140-count-picker" role="group" aria-label="Chọn số câu của bài luyện">'+
  '<label><span>Số câu</span><select data-f140-count aria-label="Số câu">'+
  option('10','10 câu')+option('15','15 câu')+option('20','20 câu')+option('custom','Tùy chọn…')+'</select></label>'+
  (p.preset==='custom'?'<label><span>Tùy chọn</span><input data-f140-custom type="number" min="1" max="100" step="1" value="'+p.value+'" aria-label="Số câu tùy chọn, từ 1 đến 100"></label>':'')+
  '<small>'+current+' câu'+(current>(s.poolSize||current)?' · Lặp chữ nếu cần':'')+'</small></div>';
}
function recordRibbon(cfg){
 const v=attemptStatus(cfg.id,cfg.group,cfg.script);
 return '<div class="v140-record-ribbon" aria-label="Lượt luyện và kiểm tra đã hoàn thành">'+
  '<span class="'+(v.practiceDone?'is-done':'')+'">'+(v.practiceDone?'✓':'○')+' Luyện ngay · '+v.practiceCount+' lượt</span>'+
  '<span class="'+(v.testPassed?'is-done':'')+'">'+(v.testPassed?'✓':v.testDone?'◷':'○')+' Kiểm tra · '+v.testCount+' lượt</span>'+
  (v.testDone?'<small>Điểm tốt nhất '+v.bestTest+'% · Mốc đạt '+PASS_PERCENT+'%</small>':'')+'</div>';
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
  const selectedUnit=DATA.findLessonUnit(config.id,config.group);
  const finalRow=selectedUnit?.groups?.at(-1)||config.group;
  const rowIndex=config.group==='all'?DATA.rows.length-1:DATA.rows.findIndex(x=>x[0]===finalRow);
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
 const r=s.round,p=r?.pairs[id];if(p){roundSelect(s,id);p.audioPrompts=(p.audioPrompts||0)+1;if(p.audioPrompts>1)p.audioReplays++;r.replays[id]=(r.replays[id]||0)+1}
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
 r.summary=report;r.summaryOpen=true;s.finished=true;saveAttempt(cfg,s);
 const d=store();d.matchReview=d.matchReview||{};
 for(const p of list){if(p.wrongAttempts)d.matchReview[p.itemId]={at:report.endedAt,reason:'match-attempt'};else delete d.matchReview[p.itemId];}
 persist();saveRound(report);
}
/* v1.28: Correct/wrong feedback is independent from Kana pronunciation and the
   legacy autoAnswerAudio preference. Play a small local WAV on the grading click
   (same user gesture as Kana recordings); Web Audio is a fallback, not the default. */
const FEEDBACK_PREF_KEY='horizon.foundation.feedbackSounds.v1';
let feedbackMedia=null,feedbackAudioContext=null;
function gradingSound(correct){
 if(!audioPref())return;
 // Replaying quickly must not accumulate overlapping sounds.
 if(feedbackMedia){
  try{feedbackMedia.pause();feedbackMedia.currentTime=0;}catch(e){}
  feedbackMedia=null;
 }
 const fallback=()=>{
  const AC=window.AudioContext||window.webkitAudioContext;
  if(!AC)return false;
  try{
   const ctx=feedbackAudioContext||(feedbackAudioContext=new AC());
   if(ctx.state==='suspended'){
    const resumed=ctx.resume();
    if(resumed&&typeof resumed.catch==='function')resumed.catch(()=>{});
   }
   const now=ctx.currentTime;
   const tone=(hz,at,ms,volume,type,finish)=>{
    const oscillator=ctx.createOscillator(),gain=ctx.createGain(),start=now+at;
    oscillator.type=type;
    oscillator.frequency.setValueAtTime(hz,start);
    if(finish)oscillator.frequency.exponentialRampToValueAtTime(finish,start+ms*.82);
    gain.gain.setValueAtTime(.0001,start);
    gain.gain.exponentialRampToValueAtTime(volume,start+.012);
    gain.gain.exponentialRampToValueAtTime(.0001,start+ms);
    oscillator.connect(gain);gain.connect(ctx.destination);
    oscillator.start(start);oscillator.stop(start+ms+.02);
   };
   if(correct){tone(784,0,.14,.075,'sine');tone(1047,.13,.21,.065,'sine');}
   else tone(360,0,.29,.075,'triangle',230);
   return true;
  }catch(e){return false}
 };
 if(typeof Audio==='function'){
  try{
   const media=new Audio('assets/feedback/'+(correct?'correct':'incorrect')+'.wav?v=2');
   media.preload='auto';media.volume=1; // WAV mastered to -2.4 dBFS peak.
   feedbackMedia=media;
   const result=media.play(); // Always synchronous inside the answer click.
   if(result&&typeof result.catch==='function')result.catch(()=>{
    if(feedbackMedia===media)fallback();
   });
   return;
  }catch(e){/* Browsers without HTMLMediaElement use Web Audio below. */}
 }
 fallback();
}
function formatDuration(ms){return Number.isFinite(ms)?(ms/1000).toLocaleString('vi-VN',{maximumFractionDigits:1})+' giây':'Chưa ghi nhận'}
function roundSummaryView(s,cfg){
 const report=s.round?.summary;
 if(!report||!s.round.summaryOpen)return '';
 const review=report.pairResults.filter(p=>p.wrongAttempts>0);
 const cleanRound=report.wrongAttempts===0;
 const nextMode=['match','game'].includes(s.kind)&&cfg.id!=='small'&&cfg.id!=='mixed'?'listen-match':'mix';
 const title=cleanRound?'Một lượt luyện thật tốt!':'Bạn đã hoàn thành lượt luyện!';
 const lead=cleanRound?'Bạn đã ghép đúng ngay lần đầu cả '+report.totalPairs+' cặp.':'Hoàn thành '+report.totalPairs+' cặp, trong đó '+report.firstTryPairs+' cặp đúng ngay lần đầu.';
 const medal='<svg viewBox="0 0 112 112" aria-hidden="true" class="v109-medal-art"><circle cx="56" cy="56" r="50" fill="none" stroke="currentColor" stroke-opacity=".14"/><g class="v109-petals" fill="#f5ded5" stroke="#b7897e" stroke-width=".9"><ellipse cx="56" cy="30" rx="12" ry="21"/><ellipse cx="56" cy="82" rx="12" ry="21"/><ellipse cx="30" cy="56" rx="21" ry="12"/><ellipse cx="82" cy="56" rx="21" ry="12"/><ellipse cx="37.5" cy="37.5" rx="11" ry="19" transform="rotate(-45 37.5 37.5)"/><ellipse cx="74.5" cy="37.5" rx="11" ry="19" transform="rotate(45 74.5 37.5)"/><ellipse cx="37.5" cy="74.5" rx="11" ry="19" transform="rotate(45 37.5 74.5)"/><ellipse cx="74.5" cy="74.5" rx="11" ry="19" transform="rotate(-45 74.5 74.5)"/></g><circle cx="56" cy="56" r="21" fill="#f8eacb" stroke="#b7897e"/><path d="M48 53h.1m16 0h.1" stroke="#956c58" stroke-linecap="round" stroke-width="3"/><path d="M48 62q8 9 16 0" stroke="#956c58" stroke-width="2.4" stroke-linecap="round" fill="none"/></svg>';
 const metric=(symbol,value,label)=>'<div class="v109-stat"><span class="v109-stat-icon" aria-hidden="true">'+symbol+'</span><strong>'+clean(value)+'</strong><span>'+clean(label)+'</span></div>';
 const noteTitle=cleanRound?'Chính xác ngay lần đầu':'Đã hoàn thành — cần ôn thêm';
 const note=cleanRound?'Bạn ghép đúng ngay lần đầu <strong>'+report.firstTryPairs+' / '+report.totalPairs+' cặp</strong>, không có lượt chọn sai.':
  'Có <strong>'+report.wrongAttempts+' lượt ghép chưa đúng</strong>, liên quan tới <strong>'+review.length+' chữ</strong> trong lượt luyện này.';
 const noteHint=cleanRound?'Kết quả tốt trong lượt này. Hãy ôn lại sau một khoảng nghỉ để củng cố trí nhớ.':
  'Các chữ được đánh dấu chỉ vì từng tham gia cặp ghép sai; chưa thể xác định bạn nhầm chữ nào.';
 const nextTitle=cleanRound?'Củng cố thêm':'Ưu tiên ôn tập';
 const nextText=cleanRound?'Thử lượt luyện khác với thứ tự mới, sau đó quay lại ôn sau một khoảng nghỉ.':
  'Ôn nhóm chữ được đánh dấu trước, rồi thử một lượt mới để xem còn nhầm không.';
 const detailRows=report.pairResults.map(p=>'<div class="v109-detail-row"><strong lang="ja">'+clean(p.glyph)+'</strong><span>'+clean(p.romaji)+'</span><small>'+p.wrongAttempts+' lượt ghép sai · '+formatDuration(p.pairElapsedMs)+(p.audioReplays?' · nghe lại '+p.audioReplays+' lần':'')+'</small></div>').join('');
 return '<div class="v107-overlay v109-overlay" data-v107-dialog="1"><section class="v107-dialog v109-dialog" role="dialog" aria-modal="true" aria-labelledby="v107-title" aria-describedby="v109-description" tabindex="-1">'+
 '<header class="v109-hero"><div class="v109-medal" role="img" aria-label="Hoa mỉm cười chúc mừng">'+medal+'<span class="v109-glint" aria-hidden="true">✧</span></div><div class="v109-intro"><p class="v33-eyebrow">✦ TỔNG KẾT LƯỢT LUYỆN</p><h3 id="v107-title">'+title+'</h3><p id="v109-description">'+lead+'</p></div><button type="button" class="v107-close v109-close" data-f33="summary-close" aria-label="Đóng kết quả">×</button></header>'+
 '<div class="v109-stats" aria-label="Thống kê lượt luyện">'+metric('✓',report.completedPairs+' / '+report.totalPairs,'Cặp hoàn thành')+metric('✦',report.firstTryPairs+' / '+report.totalPairs,'Đúng lần đầu')+metric('↺',report.wrongAttempts,'Lượt chọn sai')+metric('◷',formatDuration(report.totalElapsedMs),'Tổng thời gian')+'</div>'+
 '<div class="v109-content"><section class="v109-observation"><div class="v109-section-top"><span class="v109-step">01</span><h4>Nhận xét lượt luyện</h4></div><div class="v110-feedback-card '+(cleanRound?'is-positive':'is-review')+'"><div class="v110-feedback-icon" aria-hidden="true">'+(cleanRound?'✓':'↺')+'</div><div><strong class="v110-feedback-title">'+noteTitle+'</strong><p class="v109-observation-lead">'+note+'</p></div></div><p class="v110-guidance">'+noteHint+'</p><div class="v109-mini-data"><span>Đúng ngay lần đầu <strong>'+report.firstTryAccuracy+'%</strong></span><span>Trung bình mỗi cặp <strong>'+formatDuration(report.averagePairMs)+'</strong></span></div>'+
 (['listen-match','game-listen'].includes(s.kind)?'<p class="v109-small-note">Số lần nghe lại: '+report.audioReplays+' (không tính lần nghe đầu hoặc phát đáp án tự động).</p>':'')+
 '<p class="v109-small-note">Thời gian chỉ dùng tham khảo, không chấm điểm nhanh/chậm.</p></section>'+
 '<section class="v109-next"><div class="v109-section-top"><span class="v109-step">02</span><h4>Bước tiếp theo</h4></div><div class="v110-next-card"><strong>'+nextTitle+'</strong><p>'+nextText+'</p></div>'+
 (review.length?'<div class="v109-review-list" aria-label="Chữ cần ôn">'+review.map(p=>'<span lang="ja">'+clean(p.glyph)+' <small>'+clean(p.romaji)+'</small></span>').join('')+'</div>':'')+
 '<details class="v109-details"><summary>Xem chi tiết từng cặp <span>'+report.pairResults.length+'</span></summary><div class="v109-details-list">'+detailRows+'</div></details>'+
 scopeAfterResult(cfg,report.firstTryPairs,report.totalPairs,true)+'</section></div>'+
 '<footer class="v109-actions"><span class="v109-footer-note">Mỗi lượt luyện là một bước tiến nhỏ.</span>'+
 (review.length?'<button type="button" class="v33-primary" data-f33="summary-review">Ôn lại cặp cần nhớ</button><button type="button" class="v33-secondary" data-f33="summary-new">Lượt luyện mới</button>':
 '<button type="button" class="v33-primary" data-f33="summary-new">Lượt luyện mới</button><button type="button" class="v33-secondary" data-f33="summary-next">'+(nextMode==='listen-match'?'Sang Nghe & ghép':'Kiểm tra tổng hợp')+'</button>')+
 '</footer></section></div>';
}
function closeRoundSummary(){
 const session=play;
 if(!session?.round?.summaryOpen)return;
 session.round.summaryOpen=false;
 const overlay=document.querySelector?.('[data-v107-dialog]');
 if(!overlay?.classList?.add||typeof setTimeout!=='function'){refresh();focusRoundReturn();return;}
 overlay.classList.add('v109-closing');
 overlay.setAttribute?.('aria-hidden','true');
 overlay.style&&(overlay.style.pointerEvents='none');
 setTimeout(()=>{if(play===session&&!session.round.summaryOpen){refresh();focusRoundReturn();}},190);
}
function focusRoundReturn(){
 if(typeof queueMicrotask==='function')queueMicrotask(()=>{
  const btn=document.querySelector?.('[data-f33="summary-open"]');if(btn?.focus)try{btn.focus()}catch(e){}
 });
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
  const cards=repeatCandidates(contextual(config),countPrefs().value);
  play={key,kind,cards,index:0,selected:[],tileOrder:cards.length?shuffle(Array.from(cards[0].glyph).map((glyph,i)=>({glyph,i}))):[],answer:null,correct:0,finished:cards.length===0,startedAt:null,ready:true,poolSize:contextual(config).length,createdAt:new Date().toISOString()};
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
  play={key,kind,cards,left:shuffle(cards),right:shuffle(cards),leftId:null,rightId:null,matched:[],mistakes:0,answered:0,feedback:'',finished:cards.length===0,startedAt:null,ready:true,createdAt:new Date().toISOString()};
  startRound(play,config);
 }else if(kind==='flash'){
  play={key,kind,cards:shuffle(list),index:0,flipped:false,remembered:0,needsReview:0};
 }else{
  const permitted=kind==='listen'?list.filter(x=>x.stage!=='small'&&Array.from(x.glyph).length<=3):list;
  const allPool=kind.startsWith('vocab')||kind==='missing'||config.id==='small'?contextual(config):DATA.take(config.id,'all',config.script);
  const eligible=permitted.filter(x=>allPool.filter(p=>p.id!==x.id&&isWord(p)===isWord(x)).length>=2);
  const valid=repeatCandidates(eligible,countPrefs().value);
  const formats=shuffle(['quiz','truefalse','reverse','listen']);
  const questions=valid.map((x,i)=>{
   if(kind!=='mix'&&kind!=='review')return questionFor(x,kind,allPool);
   const same=allPool.filter(z=>z.script===x.script&&z.read===x.read&&z.id!==x.id);
   let mode=formats[i%formats.length];
   if((mode==='reverse'||mode==='listen')&&same.length)mode='quiz';
   if(mode==='listen'&&x.stage==='small')mode='truefalse';
   return questionFor(x,mode,allPool);
  });
  play={key,kind,questions,index:0,correct:0,answered:0,choice:null,finished:valid.length===0,startedAt:null,ready:kind!=='mix',roundMs:[],slow:0,errors:0,hintsUsed:0,audioReplays:0,poolSize:eligible.length,createdAt:new Date().toISOString()};
 }
 return play;
}

function elapsed(s){if(!s?.startedAt)return 0;const now=s.hiddenAt||Date.now();return Math.max(0,now-s.startedAt-(s.pausedMs||0))}
function resetClock(s){s.startedAt=Date.now();s.pausedMs=0;s.hiddenAt=null;}
function clock(s,answered=false){return '<div class="v37-clock" aria-label="Thời gian phản hồi"><span aria-hidden="true">◷</span><strong data-f37-timer>'+(s.startedAt?timeLabel(answered?(s.lastMs||0):elapsed(s)):'—')+'</strong><small>'+(answered?'Đã trả lời':s.startedAt?'Đang tính giờ':'Chưa bắt đầu')+'</small></div>';}
let ticker=null,absentTicks=0;
function tickClock(){if(typeof setInterval!=='function'||ticker!==null)return;ticker=setInterval(()=>{const present=!!document.querySelector?.('.v34-workspace-shell');if(!present){if(++absentTicks>20){clearInterval(ticker);ticker=null;absentTicks=0;}return;}absentTicks=0;const el=document.querySelector?.('[data-f37-timer]');if(el&&play?.startedAt&&!play.finished&&!play.choice&&!play.answer&&play.kind!=='flash')el.textContent=timeLabel(elapsed(play));},100);}
document.addEventListener('visibilitychange',()=>{if(play?.round&&!play.round.finalized){const r=play.round;if(document.hidden){if(r.pausedAt===null)r.pausedAt=timeNow();}else if(r.pausedAt!==null){r.pausedMs+=timeNow()-r.pausedAt;r.pausedAt=null;}}if(!play?.startedAt||play.finished||play.choice||play.answer||play.kind==='flash')return;if(document.hidden){if(!play.hiddenAt)play.hiddenAt=Date.now()}else if(play.hiddenAt){play.pausedMs=(play.pausedMs||0)+(Date.now()-play.hiddenAt);play.hiddenAt=null;}});
function weakList(cfg){const d=store(),rec=d.items;return DATA.take(cfg.id,'all',cfg.script).filter(x=>{const v=rec[x.id],flag=d.matchReview?.[x.id];return !!flag||(v&&(v.latestOutcome!=='correct'||new Date(v.nextAt).getTime()<=Date.now()))}).sort((a,b)=>priority(b)-priority(a)).slice(0,6);}
function navigate(route){location.hash='#'+route}
function removeFoundationOverlay(){
 // Remove both the new scoped portal and any legacy body-level overlay.
 document.querySelector?.('body > .v120-preflight-host')?.remove?.();
 document.querySelector?.('body > .v38-overlay')?.remove?.();
}
function mountFoundationOverlay(){
 if(typeof document==='undefined'||!document.body?.appendChild)return;
 const overlay=document.querySelector?.('.v34-workspace-shell .v38-overlay');
 if(!overlay)return;
 removeFoundationOverlay();
 const host=document.createElement('div');
 // Variables and .v34-studying selectors are normally provided by the course root.
 host.className='v33-foundation v34-studying v120-preflight-host';
 host.appendChild(overlay);
 document.body.appendChild(host);
 const start=overlay.querySelector?.('[data-f38="start"]');
 if(start?.focus)start.focus();
}
function scheduleFoundationOverlay(){
 if(typeof queueMicrotask==='function')queueMicrotask(mountFoundationOverlay);
 else if(typeof requestAnimationFrame==='function')requestAnimationFrame(mountFoundationOverlay);
}
/* Move the completed-round dock outside scrollable/transformed application shells.
   Delegated click actions still work after relocation. */
/* v1.19B: portal only the completion modal to the viewport.
   A scoped host preserves .v34-studying typography and colors without
   modifying global body styles or changing the quiz/lesson layout. */
function removeSummaryHost(){
 const host=document.querySelector?.('body > .v119-summary-host');
 host?.remove?.();
}
function mountSummaryHost(){
 if(typeof document==='undefined'||!document.body?.appendChild)return;
 const overlay=document.querySelector?.('.v34-workspace-shell [data-v107-dialog]');
 if(!overlay)return;
 removeSummaryHost();
 const host=document.createElement('div');
 host.className='v33-foundation v34-studying v119-summary-host';
 host.appendChild(overlay);
 document.body.appendChild(host);
}
function scheduleSummaryHost(){
 if(typeof queueMicrotask==='function')queueMicrotask(mountSummaryHost);
 else if(typeof requestAnimationFrame==='function')requestAnimationFrame(mountSummaryHost);
}
function removeFinishDock(){
 const dock=document.querySelector?.('body > .v108-dock');
 dock?.remove?.();
}
/* Completion controls stay inside the exercise pane, same as Next Question.
   Clean up any obsolete body-level dock left by an earlier release. */
function syncFinishDock(){removeFinishDock();}
function scheduleFinishDock(){syncFinishDock();}
/* The feedback pulse runs only immediately after a newly graded response.
   Repainting, scrolling, or reopening a result does not replay it. */
function pulseGradedFeedback(correct,kind='answer'){
 const selector=kind==='match'?'.v105-match-feedback':'.v33-feedback';
 const panel=document.querySelector?.('.v34-workspace-shell '+selector);
 if(!panel?.classList?.add)return;
 panel.classList.add('v117-feedback-pulse',correct?'v117-pulse-correct':'v117-pulse-wrong');
}
function refresh(){
 removeSummaryHost();
 removeFoundationOverlay();
 removeFinishDock();
 const stage=document.querySelector('.v34-workspace-shell');
 if(stage){
  const rail=stage.querySelector?.('.v39-book-nav'),saved=rail?rail.scrollTop:null;
  stage.innerHTML=workspace(current(),!!stage.closest?.('.v134-inline-training'));
  restoreBookViewport(saved);tickClock();scheduleMatchLines();scheduleFinishDock();scheduleSummaryHost();
  return;
 }
 render(false);
}
function wrap(content,crumb='Nền tảng'){
 // Breadcrumb = location. Step tabs = actions. Never add a second menu rail.
 const moduleName=crumb==='Nền tảng'?'':String(crumb).replace(/^\d+\s*[·.:-]\s*/,'');
 const item=(label,href,current)=>'<li class="v115-crumb-item'+(current?' is-current':'')+'">'+
  (current?'<span aria-current="page">'+clean(label)+'</span>':'<a href="'+href+'">'+clean(label)+'</a>')+'</li>';
 const locationTrail='<nav class="v115-breadcrumb" aria-label="Vị trí trong lộ trình">'+
  '<ol>'+item('Học','#learn/overview',false)+item('Khóa học','#learn/catalog',false)+
  item('Nền tảng','#course/foundation',!moduleName)+
  (moduleName?item(moduleName,'',true):'')+'</ol></nav>';
 return '<div class="v25-wrap v33-foundation v112-foundation v115-foundation" data-learning-hub="v38">'+
 locationTrail+content+'<footer class="v25-version">Luyện tập mẫu · Tiến độ lưu trên thiết bị</footer></div>';
}
function tag(txt){return '<span class="v33-tag">'+clean(txt)+'</span>'}
function moduleStats(module){
 const list=DATA.take(module.id,'all','both');
 return countStats(list);
}
function indexPage(){
 const modules=DATA.modules;
 const first=modules.find(m=>{const s=moduleStats(m);return s.reviewed<s.total})||modules[0];
 // All 40 topic groups live inside the chosen course, not a separate top-level menu.
 const catalogue=window.NPHorizonV25?.foundationCatalogue?.()||'';
 const fallback='<div class="v33-level-grid">'+modules.map((m,i)=>{
  const stats=moduleStats(m);
  return '<a href="#'+path(m.id)+'" class="v33-level-card"><div class="v33-level-top"><span class="v33-index">'+String(i+1).padStart(2,'0')+'</span>'+tag(stats.reviewed+' / '+stats.total+' mẫu đã luyện')+'</div><h3>'+clean(m.title)+'</h3><p>'+clean(m.subtitle)+'</p><span class="v33-track"><span style="width:'+(stats.total?Math.round(stats.reviewed/stats.total*100):0)+'%"></span></span><div class="v33-level-bottom"><span>'+(stats.due?'Đến hạn ôn: '+stats.due+' mẫu':'Học theo thứ tự gợi ý')+'</span><strong>Mở chặng →</strong></div></a>';
 }).join('')+'</div>';
 return wrap('<div id="foundation-topics" class="v123-foundation-index">'+(catalogue||fallback)+'</div>');
}

function navigationFor(cfg){
 const m=cfg.mod,s=moduleStats(m);

 const group=cfg.mode==='learn'?'learn':'practice';
 const actions=[['learn','Học bài'],['practice','Thực hành']];
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
 const sequence=Math.max(0,DATA.modules.findIndex(x=>x.id===cfg.id))+1;
 const moduleNumber=String(sequence).padStart(2,'0');
 const previous=DATA.modules[sequence-2]||null,next=DATA.modules[sequence]||null;
 const lesson=DATA.findLessonUnit(cfg.id,cfg.group);
 const lessonOrdinal=DATA.getLessonUnits(cfg.id).findIndex(x=>x.id===cfg.group);
 return '<div class="v114-orientation v115-chapter-rail" aria-label="Chặng đang học">'+
 '<div class="v114-chapter-switch" role="group" aria-label="Chuyển chặng">'+
 '<button type="button" class="v114-arrow" data-f34="module" data-value="'+(previous?clean(previous.id):'')+'" aria-label="'+(previous?'Chặng trước: '+clean(previous.title):'Đang ở chặng đầu tiên')+'" '+(previous?'':'disabled')+'>‹</button>'+
 '<div class="v114-current-chapter"><small>CHẶNG '+moduleNumber+' / '+String(DATA.modules.length).padStart(2,'0')+'</small><strong>'+clean(m.title.replace(/^\\d+\\s*[·.:-]\\s*/,''))+'</strong></div>'+
 '<button type="button" class="v114-arrow" data-f34="module" data-value="'+(next?clean(next.id):'')+'" aria-label="'+(next?'Chặng tiếp: '+clean(next.title):'Đang ở chặng cuối cùng')+'" '+(next?'':'disabled')+'>›</button></div>'+
 '<span class="v114-progress">'+(lesson&&lessonOrdinal>=0?'Bài '+String(lessonOrdinal+1).padStart(2,'0')+'/'+String(DATA.getLessonUnits(cfg.id).length).padStart(2,'0')+' · '+clean(lesson.title):stats.reviewed+' / '+stats.total+' mẫu đã luyện')+'</span></div>'+

 '<div class="v34-stagebar v113-stagebar" role="navigation" aria-label="Chuyển hoạt động trong '+clean(m.title)+'">'+tabs+'</div>'+
 (m.script==='both'||toReview?'<details class="v126-learning-options"><summary>Tuỳ chọn học <span aria-hidden="true">⌄</span></summary><div class="v126-option-set">'+
  (m.script==='both'?'<label>Bảng chữ <select data-f34="script" aria-label="Chọn bảng chữ">'+[['both','Cả hai'],['hira','Hiragana'],['kata','Katakana']].map(([id,t])=>'<option value="'+id+'" '+(cfg.script===id?'selected':'')+'>'+t+'</option>').join('')+'</select></label>':'')+
  (toReview?'<button type="button" data-f34="mode" data-value="review" class="v37-review-chip">↻ Ôn '+toReview+' mẫu cần nhớ</button>':'')+
  '</div></details>':'');
}
function coachSeen(){try{return localStorage.getItem('Horizon.KanaTapGuide.v1.'+learnerId())==='yes'}catch{return false}}
function dismissCoach(){try{localStorage.setItem('Horizon.KanaTapGuide.v1.'+learnerId(),'yes')}catch(e){}const tip=document.querySelector('.v35-kana-guide');if(tip?.remove)tip.remove();const first=document.querySelector('.v35-first-kana');if(first?.classList?.remove)first.classList.remove('v35-first-kana')}
const BASIC_AUDIO=/^(?:a|i|u|e|o|ka|ki|ku|ke|ko|sa|shi|su|se|so|ta|chi|tsu|te|to|na|ni|nu|ne|no|ha|hi|fu|he|ho|ma|mi|mu|me|mo|ya|yu|yo|ra|ri|ru|re|ro|wa|wo|n)$/;
let currentAudio=null;
function audioStatus(msg){
 const status=document.querySelector?.('.v36-audio-status');
 if(status){status.textContent=msg||'';status.hidden=!msg}
}
function stopPronunciation(){
 if(currentAudio){try{currentAudio.pause();currentAudio.currentTime=0}catch(e){}currentAudio=null}
 if(typeof speechSynthesis!=='undefined')try{speechSynthesis.cancel()}catch(e){}
}
function pronounce(glyph,reading='',preferRecorded=true){
 const safeGlyph=String(glyph||'');
 if(!safeGlyph||safeGlyph.length>40)return false;
 stopPronunciation();
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
 const lesson=DATA.findLessonUnit(cfg.id,cfg.group);
 const grouped=(cfg.group==='all'||(lesson?.groups?.length>1))&&cfg.id!=='small'&&cfg.id!=='mixed'&&cfg.mod.groups.length>1;
 const grid=grouped?cfg.mod.groups.filter(g=>!lesson||lesson.groups.includes(g.id)).map(g=>{
  const groupCards=deck.filter(x=>x.group===g.id).sort((a,b)=>a.script===b.script?0:a.script==='hira'?-1:1);
  if(!groupCards.length)return '';
  return '<section class="v36-kana-row"><div class="v36-row-label"><strong>'+clean(g.title)+'</strong><span>'+groupCards.length+' mẫu</span></div><div class="v33-glyph-grid">'+tiles(groupCards)+'</div></section>';
 }).join(''):'<div class="v33-glyph-grid">'+tiles(deck)+'</div>';
 const selected=deck[0];
 const exampleMarkup=examples?'<div class="v33-examples">'+examples.examples.map(([glyph,read,meaning])=>'<button type="button" class="v36-example-button" data-f33="pronounce" data-value="'+clean(glyph)+'" data-reading="'+clean(read)+'" data-kind="small" aria-label="Nghe ví dụ '+clean(glyph)+'"><b lang="ja">'+clean(glyph)+'</b><span>'+clean(read)+'</span><small>'+clean(meaning)+'</small></button>').join('')+'</div>':'';
 const note=cfg.id==='small'?'Chữ nhỏ, っ/ッ và dấu ー không được đọc như âm riêng. Chạm vào từ ví dụ để nghe trong ngữ cảnh. Giọng đọc tự động có thể khác file ghi âm chuẩn.':selected?.note;
 const marks=cfg.id==='small'&&examples?.marks?'<div class="v33-small-marks" lang="ja">'+clean(examples.marks)+'</div>':'';
 return '<section class="v33-pane"><div class="v33-pane-head"><div><p class="v33-eyebrow">01 / HỌC & NHẬN DIỆN</p><h3>'+(lesson?.title||(cfg.group==='all'?cfg.mod.title:cfg.mod.groups.find(g=>g.id===cfg.group)?.title||cfg.mod.title))+'</h3><p>Quan sát nhóm chữ · Nhấn vào ô chữ để nghe phát âm.</p></div>'+tag(deck.length+' mẫu')+'</div>'+
 (deck.length>0&&!coachSeen()?'<div class="v35-kana-guide" role="note"><span>Âm cơ bản sử dụng file ghi âm; các âm đặc biệt có thể dùng giọng Nhật trên thiết bị.</span><button type="button" data-f33="guide-ok" aria-label="Đóng hướng dẫn">Đã hiểu</button></div>':'')+marks+'<div class="v36-kana-board v36-board-'+clean(cfg.id)+'" aria-label="Bảng Kana đầy đủ">'+grid+'</div>'+'<p class="v36-audio-status" role="status" aria-live="polite" hidden></p>'+exampleMarkup+
 (note?'<div class="v33-teacher-note"><strong>Ghi chú của giáo viên</strong><p>'+clean(typeof note==='string'?note:'')+'</p></div>':'')+
 '<div class="v33-pane-actions v36-next-actions v126-learn-next"><button type="button" data-f34="tab" data-value="practice" class="v33-primary">Tiếp theo: Thực hành <span aria-hidden="true">→</span></button><a href="#kana" class="v126-writing-link">Luyện viết Kana ↗</a></div></section>';
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
/* v1.39: Next scope suggestions follow released curriculum, not a mastery badge. */
function nextPracticeScope(cfg){
 if(!cfg?.mod)return null;
 const units=DATA.getLessonUnits(cfg.id),index=units.findIndex(x=>x.id===cfg.group);
 let id=cfg.id,group='all',script=cfg.script,kind='expanded',title='';
 if(index>=0&&index<units.length-1){
  group=units[index+1].id;title='Bài tiếp theo · '+units[index+1].title;kind='next';
 }else if(cfg.group!=='all'){
  title='Toàn bộ '+cfg.mod.title.replace(/^\d+\s*[·.:-]\s*/,'');
 }else{
  const i=DATA.modules.findIndex(x=>x.id===cfg.id),next=DATA.modules[i+1];
  if(!next)return null;
  id=next.id;group=DATA.getLessonUnits(id)[0]?.id||'all';
  script=next.script==='hira'?'hira':next.script==='kata'?'kata':'both';
  title=next.title.replace(/^\d+\s*[·.:-]\s*/,'')+' · '+(DATA.findLessonUnit(id,group)?.title||'Bài đầu tiên');
  kind='next-module';
 }
 const target={id,mod:DATA.byId[id],group,script,mode:cfg.mode};
 let mode=cfg.mode;
 if(['build','game-build','missing','vocab-ja-vi','vocab-vi-ja'].includes(mode)&&contextual(target).length<2)
  mode='quiz';
 if(!DATA.take(id,group,script).length&&id!=='small')return null;
 return {title,kind,mode,href:'#learn/training/foundation/'+id+'/'+group+'/'+script+'/'+mode};
}
function scopeAfterResult(cfg,correct,total,compact=false){
 if(!cfg?.mod)return '';
 const next=nextPracticeScope(cfg);
 const advice=total&&correct/total<.7?
  'Bạn có thể luyện lại phần này trước khi thử nội dung mới.':
  'Bạn có thể mở rộng nội dung. Một lượt làm tốt chưa đồng nghĩa đã nhớ lâu.';
 return '<section class="v139-result-next'+(compact?' is-compact':'')+'" aria-label="Gợi ý phạm vi luyện tiếp">'+
  '<div class="v139-next-copy"><span class="v139-next-eyebrow">✦ GỢI Ý LUYỆN TIẾP</span>'+
  '<strong>'+clean(next?.title||'Khám phá phạm vi luyện khác')+'</strong><p>'+advice+'</p></div>'+
  '<div class="v139-next-actions">'+
  (next?'<a class="v139-next-link" href="'+clean(next.href)+'">'+(next.kind==='expanded'?'Mở rộng phạm vi':'Luyện nội dung tiếp')+' <span aria-hidden="true">→</span></a>':'')+
  '<button type="button" data-f33="expand-scope" class="v139-custom-scope">Tự đổi phạm vi <span aria-hidden="true">↗</span></button>'+
  '</div></section>';
}

function summaryView(cfg,s){
 const total=s.questions?.length||0;
 const avg=s.roundMs?.length?timeLabel(s.roundMs.reduce((a,b)=>a+b,0)/s.roundMs.length):'—';
 return '<section class="v33-pane v33-summary"><p class="v33-eyebrow">KẾT QUẢ LƯỢT LUYỆN</p><h3>Hoàn thành bài kiểm tra</h3><div class="v33-summary-score">'+s.correct+' <span>/ '+total+' câu đúng</span></div>'+
 (cfg.mode==='mix'?'<div class="v37-summary-stats"><span>Đúng chậm: <strong>'+s.slow+'</strong></span><span>Sai: <strong>'+s.errors+'</strong></span><span>TB phản hồi: <strong>'+avg+'</strong></span></div>':'')+
 '<p>'+(cfg.mode==='mix'?'Chữ đúng chậm và chữ sai được đề xuất ôn. Ngưỡng phản xạ mang tính thử nghiệm.':'Luyện tập không tính thời gian; các chữ sai được đưa vào Sổ ôn.')+'</p>'+
 '<div class="v33-pane-actions"><button data-f33="restart" class="v33-primary">Luyện lại ngẫu nhiên</button><button data-f34="mode" data-value="review" class="v33-secondary">Ôn chữ cần luyện</button></div>'+
 scopeAfterResult(cfg,s.correct,total)+'</section>';
}

function buildView(cfg,s){
 if(!s.cards.length)return noData('Chưa đủ từ ngữ cảnh để ghép chữ.');
 if(s.finished||s.index>=s.cards.length)return '<section class="v33-pane v33-summary"><p class="v33-eyebrow">XẾP CHỮ · TỔNG KẾT</p><h3>Đã hoàn thành lượt ghép chữ</h3><div class="v33-summary-score">'+s.correct+' <span>/ '+s.cards.length+' từ đúng</span></div><p>Luyện lại những từ sai sau khi xem mặt chữ và cách đọc.</p><div class="v33-pane-actions"><button data-f33="restart" class="v33-primary">Ghép lại từ đầu</button></div>'+scopeAfterResult(cfg,s.correct,s.cards.length)+'</section>';
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
 const left=x=>'<button type="button" data-f33="match" data-side="left" data-value="'+clean(x.id)+'" class="v105-tile v33-match-tile '+(s.matched.includes(x.id)?'done':s.leftId===x.id?'selected':'')+' '+(s.wrongPair?.left===x.id?'v108-wrong':'')+' '+(s.lastMatched===x.id?'v108-right':'')+'" '+(s.matched.includes(x.id)?'disabled':'')+' aria-label="'+clean(listening?'Nghe âm '+x.read:'Kana '+x.glyph)+'">'+(listening?'▶ Nghe':'<span lang="ja">'+clean(x.glyph)+'</span>')+(s.matched.includes(x.id)?'<span class="v105-check">✓</span>':'')+'</button>';
 const right=x=>'<button type="button" data-f33="match" data-side="right" data-value="'+clean(x.id)+'" data-f35-drop="match" class="v105-tile v33-match-tile '+(s.matched.includes(x.id)?'done':s.rightId===x.id?'selected':'')+' '+(s.wrongPair?.right===x.id?'v108-wrong':'')+' '+(s.lastMatched===x.id?'v108-right':'')+'" '+(s.matched.includes(x.id)?'disabled':'')+' aria-label="'+clean(listening?'Kana '+x.glyph:'Romaji '+x.read)+'">'+(listening?'<span lang="ja">'+clean(x.glyph)+'</span>':'<span class="v105-romaji">'+clean(x.read||'')+'</span>')+(cfg.script==='both'&&cfg.mod.script==='both'&&!listening?'<small>'+ (x.script==='hira'?'Hira':'Kata')+'</small>':'')+(s.matched.includes(x.id)?'<span class="v105-check">✓</span>':'')+'</button>';
 const rows=s.left.map((x,i)=>'<div class="v105-match-row">'+left(x)+right(s.right[i])+'</div>').join('');
 return '<section class="v33-pane"><div class="v33-pane-head"><div><p class="v33-eyebrow">'+(listening?'NGHE & GHÉP':s.kind==='game'?'GAME · GHÉP CẶP':'GHÉP CẶP · 2 CỘT')+'</p><h3>'+(listening?'Nghe và ghép đúng chữ':'Ghép Kana với Romaji')+'</h3><p>'+(listening?'Nghe ở bên trái, sau đó chọn chữ phù hợp bên phải.':'Chọn một ô Kana và một ô Romaji để nối cặp.')+'</p></div>'+tag(s.matched.length+' / '+s.cards.length+' cặp')+'</div>'+
 '<div class="v105-match-tools"><span>Hai bên được trộn ngẫu nhiên, không theo cùng thứ tự.</span><button type="button" class="v105-remix" data-f33="restart">↻ Lượt luyện mới</button></div>'+
 (cfg.mod.script==='both'?'<div class="v105-script-options" role="group" aria-label="Bảng chữ">'+[['both','Cả hai'],['hira','Hiragana'],['kata','Katakana']].map(([id,label])=>'<button type="button" data-f34="script" data-value="'+id+'" aria-pressed="'+(cfg.script===id)+'">'+label+'</button>').join('')+'</div>':'')+
 '<div class="v105-match-board" data-match-board="1"><div class="v105-match-header"><strong>'+(listening?'NGHE ÂM':'KANA')+'</strong><strong>'+(listening?'KANA':'ROMAJI')+'</strong></div>'+rows+'<svg class="v101-match-lines" aria-hidden="true" preserveAspectRatio="none"></svg></div>'+
 '<p class="v105-match-feedback" aria-live="polite">'+clean(s.feedback||'Chọn một ô ở mỗi bên để ghép cặp.')+'</p>'+
 (s.lastMatched?insightPanel(s.cards.find(x=>x.id===s.lastMatched),cfg):'')+
 (complete&&!s.round?.summaryOpen?'<div class="v108-dock v104-sticky-next v118-match-actions" role="navigation" aria-label="Thao tác sau lượt luyện"><span class="v104-next-caption">✓ '+s.cards.length+' cặp đã ghép</span><div class="v118-match-buttons"><button type="button" data-f33="summary-open" class="v33-primary">Xem kết quả ✦</button><button type="button" data-f33="restart" class="v33-secondary">Lượt luyện mới ↻</button></div></div>':'')+
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
 '<div class="v38-dialog-actions"><button class="v33-secondary" type="button" data-f38="cancel">Quay về Thực hành</button><button class="v33-primary" type="button" data-f38="start" autofocus>Bắt đầu '+(mode==='mix'?'kiểm tra':'luyện tập')+' →</button></div></section></div>';
}
const PRACTICE_MODES=[['quiz','Chữ → âm','あ'],['reverse','Âm → chữ','a'],['listen','Nghe → chữ','♫'],['truefalse','Đúng / Sai','✓'],['match','Ghép chữ & âm','⇄'],['listen-match','Nghe & ghép','◖'],['build','Xếp chữ thành từ','文'],['missing','Điền chữ còn thiếu','□'],['vocab-ja-vi','Nhật → Việt','日'],['vocab-vi-ja','Việt → Nhật','VI'],['review','Sổ ôn chữ yếu','↻']];
/* Game-style duplicates are consolidated into the Practice workbook. */
function audioPref(){
 // New feedback-only preference defaults to ON, even when the old
 // auto-pronunciation preference was disabled in an earlier release.
 try{return localStorage.getItem(FEEDBACK_PREF_KEY)!=='off'}catch(e){return true}
}
function toggleAudioPref(){
 const enabled=!audioPref();
 try{localStorage.setItem(FEEDBACK_PREF_KEY,enabled?'on':'off')}catch(e){}
 return enabled;
}

/* The exercise picker is deliberately secondary: only the active task appears
   by default. Existing exercise route IDs and scoring behavior are preserved. */
/* v1.30: Per-learner Practice entry, separate from learning progress. */
const PRACTICE_ENTRY_TABS=['guided','choose','test'];
const practiceEntryKey=()=> 'Horizon.Foundation.practiceEntry.v1.'+learnerId();
const practiceRecentKey=()=> 'Horizon.Foundation.recentExercise.v1.'+learnerId();
function practiceEntry(){
 try{const id=localStorage.getItem(practiceEntryKey());return PRACTICE_ENTRY_TABS.includes(id)?id:'guided'}
 catch(e){return 'guided'}
}
function setPracticeEntry(id){
 if(!PRACTICE_ENTRY_TABS.includes(id))return false;
 try{localStorage.setItem(practiceEntryKey(),id)}catch(e){}
 return true;
}
function recentPracticeMode(){try{return localStorage.getItem(practiceRecentKey())||''}catch(e){return ''}}
function rememberPracticeMode(id){
 if(!PRACTICE_MODES.some(([mode])=>mode===id))return;
 try{localStorage.setItem(practiceRecentKey(),id)}catch(e){}
}
/* v1.29: All exercise choices belong to Practice. Keep the question screen quiet. */
function activityBook(cfg){
 return '<nav class="v39-book-nav v126-book-nav v129-task-header" aria-label="Bài đang luyện">'+
 '<div class="v126-context"><a class="v126-back v133-return-menu" href="#learn/training/foundation/'+cfg.id+'/'+cfg.group+'/'+(cfg.mod.script==='hira'?'hira':cfg.mod.script==='kata'?'kata':cfg.script)+'">‹ Dạng bài</a></div>'+
 '<div class="v126-active-type v138-session-state'+(cfg.mode==='mix'?' is-exam':'')+'">'+
 '<span class="v138-session-symbol" aria-hidden="true">'+(cfg.mode==='mix'?'◇':'✦')+'</span>'+
 '<span class="v138-session-copy"><small>'+(cfg.mode==='mix'?'ĐANG KIỂM TRA':'ĐANG LUYỆN')+'</small>'+
 '<strong>'+clean(modeNames[cfg.mode]||'Luyện tập')+'</strong></span>'+
 '<span class="v138-session-dot" aria-hidden="true"></span></div>'+
 '<button type="button" class="v129-audio" data-f33="toggle-audio" aria-pressed="'+audioPref()+'" aria-label="Âm báo đúng sai: '+(audioPref()?'Bật':'Tắt')+'" title="Chỉ điều chỉnh âm báo đúng/sai. Nút nghe tiếng Nhật hoạt động riêng."><span aria-hidden="true">♫</span> Âm báo <strong>'+(audioPref()?'Bật':'Tắt')+'</strong></button></nav>';
}
/* v1.31: Per-lesson Practice is contextual; all optional modes live in main Practice. */
function practiceLanding(cfg){
 const lesson=DATA.findLessonUnit(cfg.id,cfg.group);
 const title=lesson?.title||cfg.mod.groups.find(g=>g.id===cfg.group)?.title||cfg.mod.title;
 const scope='#learn/training/foundation/'+cfg.id+'/'+cfg.group+'/'+(cfg.mod.script==='hira'?'hira':cfg.mod.script==='kata'?'kata':cfg.script);
 return '<section class="v126-practice-hub v131-lesson-practice" aria-labelledby="v126-practice-title">'+
 '<div class="v126-practice-intro"><p>THỰC HÀNH · '+clean(cfg.mod.title.replace(/^\d+\s*[·.:-]\s*/,''))+'</p>'+
 '<h2 id="v126-practice-title">'+clean(title)+'</h2><span>Luyện nhanh theo nội dung vừa học hoặc chuyển sang Luyện tập để chọn kỹ năng.</span></div>'+
 '<div class="v131-lesson-actions">'+
 '<a href="#'+path(cfg.id,cfg.group,'quiz',cfg.script)+'" class="v131-lesson-action is-primary"><strong>Luyện ngay</strong><small>Nhận diện chữ vừa học</small><span aria-hidden="true">→</span></a>'+
 '<a href="#'+path(cfg.id,cfg.group,'mix',cfg.script)+'" class="v131-lesson-action"><strong>Kiểm tra bài này</strong><small>Trộn câu hỏi theo phạm vi bài</small><span aria-hidden="true">→</span></a></div>'+
 '<a class="v131-lesson-custom" href="'+scope+'">Tự chọn dạng bài trong Luyện tập <span aria-hidden="true">↗</span></a>'+
 '<p class="v126-hub-footnote">Dạng bài chuyên biệt được tập trung ở Luyện tập, không lặp menu trong từng bài.</p></section>';
}
function workspace(cfg,embedded=false){
 const isHub=cfg.mode==='practice';
 const isLesson=cfg.mode==='learn';
 const s=isHub||isLesson?null:ensurePlay(cfg);
 const intro=cfg.mode==='mix'&&s&&!s.ready&&!s.finished?introPopup(cfg,s):'';
 // If the portal disappears, keep a visible way to start the timed exam.
 const quickStart=intro?'<div class="v138-start-strip" role="note"><span><strong>Kiểm tra tổng hợp</strong><small>Nhấn bắt đầu để tính giờ. Nếu hộp hướng dẫn không hiện, chọn đáp án cũng bắt đầu bài.</small></span>'+
  '<button type="button" class="v138-start-action" data-f38="start">Bắt đầu kiểm tra <span aria-hidden="true">→</span></button></div>':'';
 const body=isHub?practiceLanding(cfg):isLesson?learnView(cfg):cfg.mode==='flash'?flashView(cfg,s):['match','listen-match','game','game-listen'].includes(cfg.mode)?matchingView(cfg,s):['build','game-build'].includes(cfg.mode)?buildView(cfg,s):quizView(cfg,s);
 const task=!isHub&&!isLesson;
 const exercise=task&&cfg.mode!=='flash'&&cfg.mode!=='mix';
 return (embedded?'':navigationFor(cfg))+'<div class="v38-task-area v126-task-area'+(embedded?' v134-inline-stage':'')+'"><div class="'+(exercise?'v39-book-layout v126-workbook':'v33-workspace v126-focused-work')+'"'+''+'>'+
  (task&&!embedded?activityBook(cfg):'')+quickStart+body+'</div>'+intro+
  (s&&MATCH_KINDS.includes(s.kind)?roundSummaryView(s,cfg):'')+'</div>';
}

function modulePage(cfg){
 scheduleFoundationOverlay();scheduleMatchLines();scheduleFinishDock();scheduleSummaryHost();tickClock();if(typeof queueMicrotask==='function')queueMicrotask(()=>restoreBookViewport());return wrap('<div class="v34-workspace-shell">'+workspace(cfg)+'</div>',cfg.mod.title)
  .replace('class="v25-wrap v33-foundation v112-foundation v115-foundation"',
           'class="v25-wrap v33-foundation v112-foundation v115-foundation v34-studying"');
}
function embeddedPractice(){
 const cfg=current();
 if(!cfg.mod||!([...PRACTICE_MODES.map(([mode])=>mode),'flash','mix'].includes(cfg.mode)))return '';
 rememberPracticeMode(cfg.mode);
 scheduleFoundationOverlay();scheduleMatchLines();scheduleFinishDock();scheduleSummaryHost();tickClock();
 return '<div class="v34-workspace-shell">'+workspace(cfg,true)+'</div>';
}
function page(route){
 if(!route||route==='course/foundation'||route===routePrefix)return indexPage();
 const cfg=current();
 if(cfg.mod&&PRACTICE_MODES.some(([mode])=>mode===cfg.mode))rememberPracticeMode(cfg.mode);
 return cfg.mod?modulePage(cfg):indexPage();
}
function perform(el){
 const cfg=current(),op=el.dataset.f33,value=el.dataset.value,side=el.dataset.side;
 if(!cfg.mod)return;
 if(op==='expand-scope'){
  if(play?.round?.summaryOpen){
   play.round.summaryOpen=false;
   removeSummaryHost();refresh();
  }
  const panel=document.querySelector?.('.v132-scope');
  if(panel){
   panel.open=true;
   panel.scrollIntoView?.({behavior:'smooth',block:'center'});
   panel.querySelector?.('summary')?.focus?.({preventScroll:true});
  }else{
   try{localStorage.setItem('Horizon.Training.scopeExpanded.v1.'+learnerId(),'on')}catch(e){}
   location.hash='#learn/training/foundation/'+cfg.id+'/'+cfg.group+'/'+cfg.script;
  }
  return;
 }
 if(op==='guide-ok'){dismissCoach();return;}
 if(op==='toggle-audio'){toggleAudioPref();refresh();return;}
 if(op==='summary-close'&&play?.round){closeRoundSummary();return;}
 if(op==='summary-open'&&play?.round?.summary){play.round.summaryOpen=true;refresh();focusRoundSummary();return;}
 if(op==='summary-new'&&play?.round?.summary){play=null;ensurePlay(cfg);refresh();return;}
 if(op==='summary-review'&&play?.round?.summary){if(roundReview(play,cfg))refresh();return;}
 if(op==='summary-next'&&play?.round?.summary){localSwitch('mode',play.kind==='match'&&cfg.id!=='small'&&cfg.id!=='mixed'?'listen-match':'mix');return;}
 if(op==='insight-audio'){pronounce(value,el.dataset.reading||'',true);return;}
 if(op==='pronounce'&&cfg.mode==='learn'){pronounce(value,el.dataset.reading||'',el.dataset.kind==='basic');dismissCoach();return;}
 if(op==='listen-audio'&&(cfg.mode==='listen'||cfg.mode==='mix'||cfg.mode==='review')){const state=ensurePlay(cfg),q=state.questions[state.index];if(q){state.audioReplays=(state.audioReplays||0)+1;pronounce(q.item.glyph,q.item.read,true);}return;}
 if(op==='feedback-audio'&&cfg.mode!=='learn'){const state=ensurePlay(cfg),q=state.questions?.[state.index],word=state.cards?.[state.index];if(q&&state.choice)pronounce(q.item.glyph,q.item.read,true);else if(word&&state.answer)pronounce(word.glyph,word.read,true);return;}
 if(op==='flash-audio'&&cfg.mode==='flash'){const state=ensurePlay(cfg);if(state.flipped)pronounce(state.cards[state.index]?.glyph,state.cards[state.index]?.read,true);return;}
 if(cfg.mode==='learn')return;
 const s=ensurePlay(cfg);
 if(!s.ready&&s.kind!=='flash'){
  // A preflight portal may be missing or outside the screen after a refresh.
  // The first answer then safely starts the timer instead of silently failing.
  const dialog=document.querySelector?.('body > .v120-preflight-host .v38-dialog, .v34-workspace-shell .v38-dialog');
  const bounds=dialog?.getBoundingClientRect?.();
  const visible=!!dialog&&(!bounds||bounds.width>0&&bounds.height>0&&bounds.bottom>10&&bounds.top<(window.innerHeight||9999)-10);
  if(s.kind!=='mix'||op!=='answer'||visible)return;
  s.ready=true;resetClock(s);
 }
 if(op==='hint'&&s.questions&&!s.choice&&!s.finished){s.hintsUsed=Math.min(3,(s.hintsUsed||0)+1);refresh();return;}
 if(op==='tile'&&['build','game-build'].includes(s.kind)&&!s.answer){
  const i=Number(value);if(!Number.isInteger(i)||i<0||i>=s.tileOrder.length||s.selected.includes(i))return;
  s.selected.push(i);
  const word=s.cards[s.index],built=s.selected.map(n=>s.tileOrder[n].glyph).join('');
  if(s.selected.length===Array.from(word.glyph).length){
   const correct=built===word.glyph;s.answer={correct,built};if(correct)s.correct++;
   s.lastMs=null;s.grade=record(word,correct,s.kind,null);stopPronunciation();gradingSound(correct);
  }
  refresh();
  if(s.answer)pulseGradedFeedback(s.answer.correct);
  return;
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
  s.index++;s.finished=s.index>=s.cards.length;s.selected=[];s.answer=null;if(s.finished)saveAttempt(cfg,s);
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
  s.grade=record(q.item,ok,q.mode||cfg.mode,took,s.hintsUsed||0,s.audioReplays||0);stopPronunciation();gradingSound(ok);if(took!==null)s.roundMs.push(took);if(s.grade.slow)s.slow++;if(!ok)s.errors++;
  refresh();pulseGradedFeedback(ok);
  return;
 }
 if(op==='next'&&s.choice){s.index++;s.choice=null;s.grade=null;s.hintsUsed=0;s.audioReplays=0;if(s.startedAt)resetClock(s);s.finished=s.index>=s.questions.length;if(s.finished)saveAttempt(cfg,s);refresh();return}
 if(op==='match'&&['match','listen-match','game','game-listen'].includes(s.kind)&&!s.matched.includes(value)&&s.cards.some(x=>x.id===value)){
  let gradedMatch=null;
  if(side==='left'){s.leftId=value;roundSelect(s,value);if(['listen-match','game-listen'].includes(s.kind)){const sample=s.cards.find(x=>x.id===value);if(sample){listenRound(s,value);pronounce(sample.glyph,sample.read,true);}}}
  else if(side==='right'){s.rightId=value;roundSelect(s,value);}
  if(s.leftId&&s.rightId){
   const left=s.leftId,right=s.rightId;
   const ok=left===right;gradedMatch=ok;const item=s.cards.find(x=>x.id===left);
   roundAttempt(s,left,right,ok);
   stopPronunciation();record(item,ok,s.kind,null);
   if(ok){s.lastMatched=item.id;s.matched.push(item.id);s.feedback='Đúng! Hãy ghép cặp tiếp theo.';gradingSound(true);}
   else{s.mistakes++;s.feedback='Chưa đúng. Đường đỏ chỉ cặp vừa chọn, thử lại nhé.';s.wrongPair={left,right};s.lastMatched=null;gradingSound(false);}
   s.leftId=null;s.rightId=null;
   if(ok&&s.matched.length===s.cards.length)completeRound(s,cfg);
  }
  refresh();
  if(s.round?.summaryOpen)focusRoundSummary();
  else if(gradedMatch!==null)pulseGradedFeedback(gradedMatch,'match');
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
 removeSummaryHost();
 removeFoundationOverlay();
 removeFinishDock();
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
  if(!['quiz','reverse','listen','listen-match','review','truefalse','match','build','vocab-ja-vi','vocab-vi-ja','missing'].includes(value))return;
  target.mode=value;
 }else if(kind==='tab'){
  if(!['learn','flash','practice','mix'].includes(value))return;
  target.mode=value;
 }else return;
 if(PRACTICE_MODES.some(([mode])=>mode===target.mode))rememberPracticeMode(target.mode);
 play=null;
 const inline=!!document.querySelector('.v134-inline-training .v34-workspace-shell');
 const next=inline?'learn/training/foundation/'+target.id+'/'+target.group+'/'+target.script+'/'+target.mode:
  path(target.id,target.group,target.mode,target.script);
 if(typeof history!=='undefined'&&history.replaceState)history.replaceState(null,'','#'+next);
 else location.hash='#'+next;
 if(inline){render(false);return;}
 const stage=document.querySelector('.v34-workspace-shell');
 if(stage){const rail=stage.querySelector?.('.v39-book-nav'),saved=rail?rail.scrollTop:null;stage.innerHTML=workspace(target);restoreBookViewport(saved);mountFoundationOverlay();tickClock();scheduleMatchLines();scheduleFinishDock();scheduleSummaryHost();const crumb=document.querySelector('.v115-breadcrumb [aria-current="page"]');
  if(crumb)crumb.textContent=target.mod.title.replace(/^\d+\s*[·.:-]\s*/,'');}
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
if(typeof window!=='undefined'&&window.addEventListener)window.addEventListener('hashchange',()=>{removeSummaryHost();removeFoundationOverlay();removeFinishDock();});
document.addEventListener('keydown',event=>{
 const modal=document.querySelector?.('[data-v107-dialog]');
 if(modal){
  if(event.key==='Escape'){event.preventDefault();closeRoundSummary();return;}
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
 const nextScope=event.target.closest?.('.v139-next-link');
 if(nextScope&&document.querySelector?.('.v33-foundation')){
  event.preventDefault();
  const destination=nextScope.getAttribute?.('href')||'';
  if(!destination.startsWith('#learn/training/foundation/'))return;
  removeSummaryHost();removeFoundationOverlay();removeFinishDock();
  play=null; // a new scope must start with a new exercise, not the old score
  if(typeof history!=='undefined'&&history.replaceState)
   history.replaceState(null,'',destination);
  else location.hash=destination;
  render(false);
  return;
 }
 const entry=event.target.closest?.('[data-f130="tab"]');
 if(entry&&document.querySelector('.v34-workspace-shell')){
  const selected=entry.dataset.value;
  if(!setPracticeEntry(selected))return;
  event.preventDefault();
  const root=document.querySelector('.v130-practice-hub');
  if(root){
   for(const tab of root.querySelectorAll?.('[data-f130="tab"]')||[]){
    const active=tab.dataset.value===selected;
    tab.classList?.toggle?.('is-active',active);
    tab.setAttribute?.('aria-pressed',String(active));
   }
   for(const panel of root.querySelectorAll?.('[data-v130-panel]')||[]){
    panel.hidden=panel.dataset.v130Panel!==selected;
   }
  }
  return;
 }
 const backdrop=event.target.closest?.('[data-v107-dialog]');
 if(backdrop&&!event.target.closest?.('.v109-dialog')){event.preventDefault();closeRoundSummary();return;}
 const startAction=event.target.closest?.('[data-f38]');if(startAction&&document.querySelector('.v34-workspace-shell')){event.preventDefault();const cfg=current(),s=ensurePlay(cfg);if(startAction.dataset.f38==='start'){s.ready=true;resetClock(s);refresh();}else if(startAction.dataset.f38==='cancel'){localSwitch('tab','practice');}return;}
 const nav=event.target.closest('[data-f34="tab"],[data-f34="mode"],[data-f34="module"]');if(nav?.dataset?.f34&&document.querySelector('.v34-workspace-shell')){event.preventDefault();localSwitch(nav.dataset.f34,nav.dataset.value);return;}
 const b=event.target.closest('[data-f33]');if(!b)return;
 if(!document.querySelector('.v33-foundation'))return;
 event.preventDefault();perform(b);
});
window.NPFoundationCourse={version:'v39',page,embeddedPractice,store,stats:countStats,path,questionFor,choosePool,nextPracticeScope,attemptStatus,runHistory,countPrefs,session:()=>play};
})();