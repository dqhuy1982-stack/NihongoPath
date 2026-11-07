/* HORIZON Foundation v33 · modular learning, contextual kana practice, no backend dependencies.
   Practice records are browser-local preview data; never modify lesson-engine progress. */
(function(){
'use strict';
const DATA=window.NPFoundationCurriculum;if(!DATA)return;
const clean=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const routePrefix='learn/foundation',base='#'+routePrefix;
const modes=[
 ['learn','Học','book-open'],['flash','Flashcard','layers'],['quiz','Chữ → âm','target'],
 ['reverse','Âm → chữ','arrow-left-right'],['match','Ghép cặp','grid-2x2'],['build','Xếp chữ','puzzle'],
 ['vocab-ja-vi','Nhật → Việt','languages'],['vocab-vi-ja','Việt → Nhật','languages'],['mix','Kiểm tra tổng hợp','check-circle-2']
];
const modeNames=Object.fromEntries(modes.map(([id,title])=>[id,title]));
const initialGroup=m=>m.id==='hiragana'||m.id==='katakana'?'a':m.id==='dakuten'?'g':m.id==='yoon'?'ky':m.id==='small'?'pause':'mixed';
const path=(id,group,mode,script)=>routePrefix+'/'+id+'/'+(group||initialGroup(DATA.byId[id]))+'/'+(mode||'learn')+(script&&script!=='both'?'/'+script:'');
function current(){
 const bits=decodeURIComponent(location.hash.replace(/^#\/?/,'')).split('/');
 const id=bits[2],mod=DATA.byId[id],group=bits[3]|| (mod?initialGroup(mod):''),mode=bits[4]||'learn',script=bits[5]||'both';
 return {id,mod,group:mod?.groups.some(x=>x.id===group)?group:mod?initialGroup(mod):'',mode:modeNames[mode]?mode:'learn',script:['hira','kata','both'].includes(script)?script:'both'};
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
function record(item,correct,mode){
 const d=store(),id=item.id,prev=d.items[id]||{attempts:0,correct:0,streak:0};
 const now=new Date().toISOString(),streak=correct?Math.min(5,prev.streak+1):0;
 d.items[id]={attempts:prev.attempts+1,correct:prev.correct+Number(correct),streak,lastAt:now,
 nextAt:dueDate(now,correct?[1,1,3,7,14,30][streak]:1),lastMode:mode};
 d.history.push({id,correct,mode,at:now});if(d.history.length>450)d.history=d.history.slice(-450);
 persist();
}
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
  const selected=DATA.words.filter(w=>w.stage==='small'&&(config.group==='pause'?/[っッ]/u.test(w.glyph):config.group==='length'?w.glyph.includes('ー'):config.group==='vowels'?w.glyph.includes('ァ'):true));
  return selected.length>=2?selected:DATA.words.filter(w=>w.stage==='small');
 }
 return DATA.take(config.id,config.group,config.script);
}
function contextual(config){
 const a=DATA.contextual(config.id,config.script);
 if(config.id==='hiragana'||config.id==='katakana'){
  const rowIndex=DATA.rows.findIndex(x=>x[0]===config.group);
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
 if(mode==='reverse'||mode==='match'){
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
 const inverse=mode==='reverse'||mode==='vocab-vi-ja'||mode==='mix'&&Math.random()<.5&&!ambiguous;
 const key=x=>inverse?x.glyph:isVocab?x.vi:x.read;
 const prompt=inverse?(isVocab?'Chọn từ tiếng Nhật phù hợp với nghĩa:':'Chọn '+(item.script==='hira'?'Hiragana':'Katakana')+' ứng với âm:'):isVocab?'Từ này có nghĩa tiếng Việt nào?':'Chữ Kana này đọc thế nào?';
 const stimulus=inverse?(isVocab?item.vi:item.read):item.glyph;
 const poolForChoices=inverse&&!isVocab?sameScript:sameType;
 const candidates=shuffle(poolForChoices.filter(x=>x.id!==item.id&&key(x)!==key(item)));
 const unique=[];const labels=new Set([key(item)]);
 for(const x of candidates){if(labels.has(key(x)))continue;labels.add(key(x));unique.push(x);if(unique.length===3)break}
 const choices=[item,...unique].map(x=>({id:x.id,label:key(x)}));
 return {item,mode,prompt,stimulus,choices:shuffle(choices),correct:item.id,
 note:isVocab?(item.note||'Ghi nhớ nghĩa từ theo ngữ cảnh.'):item.note||('Chữ '+item.glyph+' đọc là '+item.read+'.')};
}
let play=null;
const sessionKey=config=>learnerId()+':'+config.id+':'+config.group+':'+config.mode+':'+config.script;
function ensurePlay(config){
 const key=sessionKey(config);if(play?.key===key)return play;
 const list=choosePool(config,config.mode),kind=config.mode;
 if(kind==='build'){
  const cards=pick(contextual(config),5);
  play={key,kind,cards,index:0,selected:[],tileOrder:cards.length?shuffle(Array.from(cards[0].glyph).map((glyph,i)=>({glyph,i}))):[],answer:null,correct:0,finished:cards.length===0};
 }else if(kind==='match'){
  const cards=pick(list,Math.min(6,list.length));
  play={key,kind,cards,left:shuffle(cards),right:shuffle(cards),leftId:null,rightId:null,matched:[],mistakes:0,answered:0,feedback:'',finished:cards.length===0};
 }else if(kind==='flash'){
  play={key,kind,cards:shuffle(list),index:0,flipped:false,remembered:0,needsReview:0};
 }else{
  const targets=pick(list,Math.min(10,list.length));
  const allPool=kind.startsWith('vocab')||config.id==='small'?contextual(config):DATA.take(config.id,'all',config.script);
  const valid=targets.filter(x=>allPool.filter(p=>p.id!==x.id&&isWord(p)===isWord(x)).length>=2);
  play={key,kind,questions:valid.map(x=>questionFor(x,kind,allPool)),index:0,correct:0,answered:0,choice:null,finished:valid.length===0};
 }
 return play;
}
function navigate(route){location.hash='#'+route}
function refresh(){render(false)}
function wrap(content,crumb='Nền tảng'){
 const shell=window.NPHorizonV25?.shell?.('catalog')||'<header class="v25-header"><div class="v25-hero-copy"><h1>Không gian học tập</h1></div></header>';
 return '<div class="v25-wrap v33-foundation" data-learning-hub="v33">'+shell+
 '<nav class="v25-breadcrumb" aria-label="Vị trí học tập"><a href="#learn/overview">Học</a><span aria-hidden="true">›</span><a href="#learn/catalog">Khóa học</a><span aria-hidden="true">›</span><a href="#course/foundation">Nền tảng</a>'+(crumb==='Nền tảng'?'':'<span aria-hidden="true">›</span><span aria-current="page">'+clean(crumb)+'</span>')+'</nav>'+
 content+'<footer class="v25-version">HORIZON · Foundation Studio v33 · Prototype (lưu luyện tập trên thiết bị)</footer></div>';
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
 const m=cfg.mod;
 const tabs=DATA.modules.map(x=>'<a href="#'+path(x.id)+'" class="v33-module-tab '+(cfg.id===x.id?'active':'')+'" '+(cfg.id===x.id?'aria-current="page"':'')+'><span>'+clean(x.title)+'</span></a>').join('');
 const groups=m.groups.map(g=>'<a href="#'+path(cfg.id,g.id,'learn',cfg.script)+'" class="v33-row-chip '+(cfg.group===g.id?'active':'')+'">'+clean(g.title)+'</a>').join('');
 const s=moduleStats(m);
 return '<nav class="v33-module-tabs" aria-label="Các chặng Nền tảng">'+tabs+'</nav>'+
 '<div class="v33-module-intro"><div><p class="v33-eyebrow">NỀN TẢNG / '+clean(m.title)+'</p><h2>'+clean(m.subtitle)+'</h2><p>'+clean(m.note)+'</p></div><div class="v33-mini-stat"><strong>'+s.reviewed+' / '+s.total+'</strong><small>Mẫu đã thực sự luyện</small></div></div>'+
 (m.script==='both'?'<div class="v33-script-switch"><span>Bảng chữ:</span>'+[['both','Cả hai'],['hira','Hiragana'],['kata','Katakana']].map(([id,t])=>'<a href="#'+path(cfg.id,cfg.group,cfg.mode,id)+'" class="'+(cfg.script===id?'active':'')+'">'+t+'</a>').join('')+'</div>':'')+
 '<nav class="v33-row-nav" aria-label="Nhóm bài học">'+groups+'</nav>'+
 '<nav class="v33-modes" aria-label="Chọn cách luyện">'+modes.filter(([id])=>!(cfg.id==='small'&&['quiz','reverse'].includes(id))).map(([id,t])=>'<a href="#'+path(cfg.id,cfg.group,id,cfg.script)+'" class="'+(cfg.mode===id?'active':'')+'" '+(cfg.mode===id?'aria-current="page"':'')+'>'+t+'</a>').join('')+'</nav>';
}
function learnView(cfg){
 const deck=tokens(cfg);
 const s=countStats(deck),examples=cfg.id==='small'?DATA.smallSamples.find(x=>x.id===cfg.group):null;
 const grid=deck.map(x=>'<div class="v33-glyph-card"><span lang="ja">'+clean(x.glyph)+'</span><strong>'+clean(x.read)+'</strong>'+(isWord(x)?'<small>'+clean(x.vi)+'</small>':'')+(x.stage==='basic'&&x.glyph.length===1?'<button class="v33-audio" data-f33="audio" data-value="'+clean(x.read)+'" aria-label="Nghe âm '+clean(x.read)+'"><svg aria-hidden="true" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 9h4l5-4v14l-5-4H4zM17 9a5 5 0 0 1 0 6M19 6a9 9 0 0 1 0 12"/></svg> Nghe</button>':'')+'</div>').join('');
 const selected=deck[0];
 const exampleMarkup=examples?'<div class="v33-examples">'+examples.examples.map(([glyph,read,meaning])=>'<div><b lang="ja">'+clean(glyph)+'</b><span>'+clean(read)+'</span><small>'+clean(meaning)+'</small></div>').join('')+'</div>':'';
 const note=cfg.id==='small'?'Chữ nhỏ và dấu ー được học trong từ hoặc cụm âm; không yêu cầu đọc một chữ nhỏ như âm độc lập.':selected?.note;
 const marks=cfg.id==='small'&&examples?.marks?'<div class="v33-small-marks" lang="ja">'+clean(examples.marks)+'</div>':'';
 return '<section class="v33-pane"><div class="v33-pane-head"><div><p class="v33-eyebrow">01 / HỌC & NHẬN DIỆN</p><h3>'+(cfg.mod.groups.find(g=>g.id===cfg.group)?.title||cfg.mod.title)+'</h3><p>Quan sát nhóm chữ, đối chiếu cách đọc; sau đó ẩn gợi ý qua Flashcard.</p></div>'+tag(deck.length+' mẫu')+'</div>'+
 marks+'<div class="v33-glyph-grid">'+grid+'</div>'+exampleMarkup+
 (note?'<div class="v33-teacher-note"><strong>Ghi chú của giáo viên</strong><p>'+clean(typeof note==='string'?note:'')+'</p></div>':'')+
 '<div class="v33-pane-actions"><a href="#'+path(cfg.id,cfg.group,'flash',cfg.script)+'" class="v33-primary">Luyện Flashcard →</a><a href="#'+path(cfg.id,cfg.group,cfg.id==='small'?'vocab-ja-vi':'quiz',cfg.script)+'" class="v33-secondary">Làm bài kiểm tra</a><a href="#kana" class="v33-secondary">Mở Writing Studio</a></div></section>';
}
function flashView(cfg,s){
 const item=s.cards[s.index];
 if(!item)return noData('Chưa có thẻ cho nhóm này.');
 const flipped=s.flipped,marked=store().flash[item.id];
 return '<section class="v33-pane"><div class="v33-pane-head"><div><p class="v33-eyebrow">02 / FLASHCARD · TỰ NHỚ</p><h3>Nhìn trước, lật sau</h3><p>Thử đọc trong đầu trước khi lật. Đánh giá “Nhớ” chỉ là tự nhận xét, không tính điểm kiểm tra.</p></div>'+tag((s.index+1)+' / '+s.cards.length)+'</div>'+
 '<button class="v33-flash '+(flipped?'is-back':'')+'" data-f33="flip" aria-label="Lật thẻ Flashcard"><span class="v33-flash-caption">'+(flipped?'ĐÁP ÁN':'THỬ NHỚ CÁCH ĐỌC')+'</span><span class="v33-flash-glyph" lang="ja">'+clean(item.glyph)+'</span>'+(flipped?'<strong>'+clean(item.read)+'</strong>'+(isWord(item)?'<small>'+clean(item.vi)+'</small>':''):'<small>Chạm để xem cách đọc</small>')+'</button>'+
 (flipped?'<p class="v33-feedback">'+clean(item.note||'Luyện đọc lại không nhìn gợi ý.')+'</p><div class="v33-pane-actions"><button data-f33="rate" data-value="again" class="v33-secondary">Cần ôn</button><button data-f33="rate" data-value="remember" class="v33-primary">Tôi nhớ rồi →</button></div>':'<div class="v33-pane-actions"><button data-f33="flip" class="v33-primary">Lật thẻ xem đáp án</button></div>')+
 '<p class="v33-subline">Thẻ đã đánh giá: '+Object.keys(store().flash).filter(k=>s.cards.some(x=>x.id===k)).length+'/'+s.cards.length+'. '+(marked?'Thẻ này từng được đánh giá '+(marked==='remember'?'nhớ':'cần ôn')+'.':'')+'</p></section>';
}
function noData(msg){return '<section class="v33-pane"><h3>Chưa đủ dữ liệu</h3><p>'+clean(msg)+'</p><a href="#course/foundation">Trở lại khóa Nền tảng</a></section>'}
function quizView(cfg,s){
 if(s.finished||s.index>=s.questions.length)return summaryView(cfg,s);
 const q=s.questions[s.index];
 return '<section class="v33-pane"><div class="v33-pane-head"><div><p class="v33-eyebrow">KIỂM TRA · '+clean(modeNames[cfg.mode])+'</p><h3>Nhớ lại không nhìn gợi ý</h3><p>'+clean(q.prompt)+'</p></div>'+tag('Câu '+(s.index+1)+' / '+s.questions.length)+'</div>'+
 '<div class="v33-question-glyph" lang="'+(q.mode.startsWith('vocab')&&q.mode==='vocab-vi-ja'?'vi':'ja')+'">'+clean(q.stimulus)+'</div>'+
 '<div class="v33-answer-grid">'+q.choices.map(opt=>'<button class="v33-answer '+(s.choice&&opt.id===q.correct?'correct':'')+' '+(s.choice===opt.id&&s.choice!==q.correct?'wrong':'')+'" data-f33="answer" data-value="'+clean(opt.id)+'" '+(s.choice?'disabled':'')+'>'+clean(opt.label)+'</button>').join('')+'</div>'+
 (s.choice?'<div class="v33-feedback '+(s.choice===q.correct?'positive':'negative')+'" role="status"><strong>'+(s.choice===q.correct?'Chính xác.':'Chưa đúng. Đáp án: '+clean(q.choices.find(x=>x.id===q.correct)?.label))+'</strong><p>'+clean(q.note)+'</p></div><div class="v33-pane-actions"><button class="v33-primary" data-f33="next">'+(s.index+1===s.questions.length?'Xem kết quả':'Câu tiếp theo')+' →</button></div>':'<p class="v33-subline">Chọn một đáp án. Kết quả và giải thích hiện ngay, không cần bấm “Kiểm tra” thêm lần nữa.</p>')+
 '</section>';
}
function summaryView(cfg,s){
 const total=s.questions?.length||0;
 return '<section class="v33-pane v33-summary"><p class="v33-eyebrow">KẾT QUẢ LƯỢT LUYỆN</p><h3>Hoàn thành bài kiểm tra</h3><div class="v33-summary-score">'+s.correct+' <span>/ '+total+' câu đúng</span></div><p>Kết quả này phản ánh một lượt luyện, chưa có nghĩa đã ghi nhớ lâu dài. Các câu sai được đề xuất ôn lại.</p><div class="v33-pane-actions"><button data-f33="restart" class="v33-primary">Luyện lại (đảo thứ tự câu)</button><a href="#'+path(cfg.id,cfg.group,'flash',cfg.script)+'" class="v33-secondary">Ôn Flashcard</a></div></section>';
}
function buildView(cfg,s){
 if(!s.cards.length)return noData('Chưa đủ từ ngữ cảnh để ghép chữ.');
 if(s.finished||s.index>=s.cards.length)return '<section class="v33-pane v33-summary"><p class="v33-eyebrow">XẾP CHỮ · TỔNG KẾT</p><h3>Đã hoàn thành lượt ghép chữ</h3><div class="v33-summary-score">'+s.correct+' <span>/ '+s.cards.length+' từ đúng</span></div><p>Luyện lại những từ sai sau khi xem mặt chữ và cách đọc.</p><div class="v33-pane-actions"><button data-f33="restart" class="v33-primary">Ghép lại từ đầu</button></div></section>';
 const word=s.cards[s.index],selected=s.selected.map(i=>s.tileOrder[i].glyph).join('');
 return '<section class="v33-pane"><div class="v33-pane-head"><div><p class="v33-eyebrow">GHÉP CHỮ THÀNH TỪ</p><h3>Xếp Kana theo đúng thứ tự</h3><p>Nhìn nghĩa tiếng Việt, chạm các mảnh chữ để ghép thành từ Nhật. Không cần kéo thả.</p></div>'+tag('Từ '+(s.index+1)+' / '+s.cards.length)+'</div>'+
 '<div class="v33-build-clue"><span>NGHĨA TIẾNG VIỆT</span><strong>'+clean(word.vi)+'</strong></div>'+
 '<div class="v33-build-answer" aria-label="Các chữ đã xếp" aria-live="polite">'+(selected?Array.from(selected).map(ch=>'<span lang="ja">'+clean(ch)+'</span>').join(''):'<small>Chọn ký tự bên dưới để ghép từ</small>')+'</div>'+
 '<div class="v33-build-tiles">'+s.tileOrder.map((x,i)=>'<button data-f33="tile" data-value="'+i+'" class="v33-build-tile" '+(s.selected.includes(i)||s.answer?'disabled':'')+' lang="ja">'+clean(x.glyph)+'</button>').join('')+'</div>'+
 (s.answer?'<div class="v33-feedback '+(s.answer.correct?'positive':'negative')+'" role="status"><strong>'+(s.answer.correct?'Đúng!':'Chưa đúng: '+clean(word.glyph))+'</strong><p>'+clean(word.glyph)+' → '+clean(word.read)+' · '+clean(word.vi)+'. '+clean(word.note||'')+'</p></div>':'<p class="v33-subline">Câu trả lời được chấm ngay khi bạn ghép đủ số ký tự.</p>')+
 '<div class="v33-pane-actions">'+(!s.answer?'<button class="v33-secondary" data-f33="undo">Bỏ chữ cuối</button>':'<button class="v33-primary" data-f33="build-next">'+(s.index+1===s.cards.length?'Xem kết quả':'Từ tiếp theo')+' →</button>')+'</div></section>';
}
function matchingView(cfg,s){
 if(!s.cards.length)return noData('Nhóm này chưa có đủ cặp duy nhất. Hãy chọn bảng hoặc nhóm khác.');
 const complete=s.matched.length===s.cards.length;
 const left=items=>items.map(x=>'<button data-f33="match" data-side="left" data-value="'+clean(x.id)+'" class="v33-match-tile '+(s.matched.includes(x.id)?'done':s.leftId===x.id?'selected':'')+'" '+(s.matched.includes(x.id)?'disabled':'')+' lang="ja">'+clean(x.glyph)+'</button>').join('');
 const right=items=>items.map(x=>'<button data-f33="match" data-side="right" data-value="'+clean(x.id)+'" class="v33-match-tile '+(s.matched.includes(x.id)?'done':s.rightId===x.id?'selected':'')+'" '+(s.matched.includes(x.id)?'disabled':'')+'>'+clean(readable(x))+(cfg.script==='both'&&cfg.mod.script==='both'?' <small>· '+(x.script==='hira'?'Hira':'Kata')+'</small>':'')+'</button>').join('');
 return '<section class="v33-pane"><div class="v33-pane-head"><div><p class="v33-eyebrow">GHÉP CẶP · 2 CỘT</p><h3>Ghép chữ và cách đọc</h3><p>Chọn một ô bên trái, rồi ô tương ứng bên phải. Có thể dùng bàn phím; không cần kéo thả.</p></div>'+tag(s.matched.length+'/'+s.cards.length+' cặp')+'</div>'+
 (complete?'<div class="v33-feedback positive"><strong>Đã ghép xong!</strong><p>Số lần chọn sai: '+s.mistakes+'. Nếu chọn sai nhiều, hãy thử lại sau khi ôn Flashcard.</p></div>':'<p class="v33-subline">'+clean(s.feedback||'Chọn 1 chữ và 1 cách đọc để ghép cặp.')+'</p>')+
 '<div class="v33-match-grid"><div class="v33-match-column">'+left(s.left)+'</div><div class="v33-match-column">'+right(s.right)+'</div></div>'+
 (complete?'<div class="v33-pane-actions"><button data-f33="restart" class="v33-primary">Ghép lại với thứ tự khác</button></div>':'')+'</section>';
}
function modulePage(cfg){
 const header=navigationFor(cfg);
 const s=cfg.mode==='learn'?null:ensurePlay(cfg);
 const body=cfg.mode==='learn'?learnView(cfg):cfg.mode==='flash'?flashView(cfg,s):cfg.mode==='match'?matchingView(cfg,s):cfg.mode==='build'?buildView(cfg,s):quizView(cfg,s);
 const vals=countStats(tokens(cfg));
 const panel='<aside class="v33-side"><h3>Học thế nào cho hiệu quả?</h3><ol><li>Học một nhóm chữ nhỏ.</li><li>Nhìn chữ, tự nhớ âm trước khi lật Flashcard.</li><li>Làm bài hai chiều, ghép cặp và luyện trộn.</li><li>Ôn chữ làm sai vào lần sau.</li></ol><div class="v33-side-divider"></div><strong>Tiến độ luyện trên thiết bị</strong><p>'+vals.reviewed+' / '+vals.total+' mẫu từng được kiểm tra · '+vals.due+' mẫu đến hạn gợi ý ôn.</p><a href="#kana">Writing Studio →</a><small>Không cộng lượt lật Flashcard vào điểm kiểm tra. Âm ghép và chữ nhỏ được học trong ngữ cảnh phù hợp.</small></aside>';
 return wrap(header+'<div class="v33-workspace">'+body+panel+'</div>',cfg.mod.title);
}
function page(route){
 if(!route||route==='course/foundation'||route===routePrefix)return indexPage();
 const cfg=current();return cfg.mod?modulePage(cfg):indexPage();
}
function perform(el){
 const cfg=current(),op=el.dataset.f33,value=el.dataset.value,side=el.dataset.side;
 if(!cfg.mod)return;
 if(op==='audio'&&cfg.mode==='learn'&&/^(?:a|i|u|e|o|ka|ki|ku|ke|ko|sa|shi|su|se|so|ta|chi|tsu|te|to|na|ni|nu|ne|no|ha|hi|fu|he|ho|ma|mi|mu|me|mo|ya|yu|yo|ra|ri|ru|re|ro|wa|wo|n)$/.test(value||'')){try{const audio=new Audio('assets/kana-audio/'+value+'.mp3');audio.play().catch(()=>{});}catch(e){}return;}
 if(cfg.mode==='learn')return;
 const s=ensurePlay(cfg);
 if(op==='tile'&&s.kind==='build'&&!s.answer){
  const i=Number(value);if(!Number.isInteger(i)||i<0||i>=s.tileOrder.length||s.selected.includes(i))return;
  s.selected.push(i);
  const word=s.cards[s.index],built=s.selected.map(n=>s.tileOrder[n].glyph).join('');
  if(s.selected.length===Array.from(word.glyph).length){
   const correct=built===word.glyph;s.answer={correct,built};if(correct)s.correct++;
   record(word,correct,'build');
  }
  refresh();return;
 }
 if(op==='undo'&&s.kind==='build'&&!s.answer){s.selected.pop();refresh();return}
 if(op==='build-next'&&s.kind==='build'&&s.answer){
  s.index++;s.finished=s.index>=s.cards.length;s.selected=[];s.answer=null;
  if(!s.finished)s.tileOrder=shuffle(Array.from(s.cards[s.index].glyph).map((glyph,i)=>({glyph,i})));
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
  s.choice=value;s.answered++;const ok=value===q.correct;if(ok)s.correct++;
  record(q.item,ok,cfg.mode);refresh();return;
 }
 if(op==='next'&&s.choice){s.index++;s.choice=null;s.finished=s.index>=s.questions.length;refresh();return}
 if(op==='match'&&s.kind==='match'&&!s.matched.includes(value)&&s.cards.some(x=>x.id===value)){
  if(side==='left')s.leftId=value;else if(side==='right')s.rightId=value;
  if(s.leftId&&s.rightId){
   const ok=s.leftId===s.rightId;const item=s.cards.find(x=>x.id===s.leftId);
   record(item,ok,'match');
   if(ok){s.matched.push(item.id);s.feedback='Đúng! Hãy ghép cặp tiếp theo.';}
   else{s.mistakes++;s.feedback='Chưa đúng. Thử ghép lại hai ô.';}
   s.leftId=null;s.rightId=null;
  }
  refresh();return;
 }
 if(op==='restart'){play=null;ensurePlay(cfg);refresh()}
}
document.addEventListener('click',event=>{
 const b=event.target.closest('[data-f33]');if(!b)return;
 if(!document.querySelector('.v33-foundation'))return;
 event.preventDefault();perform(b);
});
window.NPFoundationCourse={version:'v33',page,store,stats:countStats,path,questionFor,choosePool,session:()=>play};
})();