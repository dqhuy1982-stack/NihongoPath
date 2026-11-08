/* HORIZON N5 · Minna-aligned Lesson 01 · v1.46
 * User-original study content; Japanese speech uses device TTS, no textbook audio.
 * All state stored by learner ID. Never writes Foundation or N5 legacy stores.
 */
(function(){
'use strict';
const D=window.NPN5Lesson01Data,LINKED=window.NPN5Lesson01Scenes||{scenes:[],practiceSceneById:{}};
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const route='#course/N5/lesson/01',threshold=D?.threshold||80;
const sections=[['vocab','Từ vựng'],['grammar','Ngữ pháp'],['reading','Đọc hiểu'],['listening','Nghe hiểu']];
const typeNames={vocab:'Từ vựng',grammar:'Ngữ pháp',reading:'Đọc hiểu',listening:'Nghe hiểu'};
let active='learn',chapter=LINKED.scenes.length?'scenes':'vocab',run=null,showTexts=new Set(),saveError='',alertText='';
let sceneIndex=0,focusedGrammar='wa',focusedVocab=null;
const sceneFeedback=new Map(),sceneDrafts=new Map(),sceneModels=new Set(),sceneTranslations=new Set();
const learnerId=()=>{try{return String(P()?.id||'guest').replace(/[^a-z0-9_-]/gi,'_')}catch{return'guest'}};
const storageKey=()=> 'Horizon.N5.Lesson01.v1.'+learnerId();
function empty(){return{schema:1,viewed:[],attempts:[],createdAt:new Date().toISOString()}}
function read(){
 try{
  const value=JSON.parse(localStorage.getItem(storageKey())||'null');
  if(value&&value.schema===1&&Array.isArray(value.viewed)&&Array.isArray(value.attempts))return value;
 }catch(e){saveError='Không đọc được lịch sử riêng của bài. Chưa ghi đè dữ liệu.'}
 return empty();
}
function write(fn){
 try{
  const v=read();fn(v);
  localStorage.setItem(storageKey(),JSON.stringify(v));saveError='';return true;
 }catch(e){saveError='Không thể lưu tiến độ trên thiết bị này. Kiểm tra dung lượng hoặc quyền lưu trữ.';return false}
}
function status(){
 const runs=read().attempts;
 const top=kind=>runs.filter(x=>x.kind===kind);
 const best=kind=>Math.max(0,...top(kind).map(x=>Number(x.percent)||0));
 const practice=top('practice').some(x=>x.percent>=threshold);
 const check=top('check').some(x=>x.percent>=threshold&&x.listeningVerified===true);
 const checked=top('check').some(x=>x.percent>=threshold);
 const latestCheck=top('check').at(-1)||null;
 return {practice,check,checked,complete:practice&&check,
  practiceBest:best('practice'),checkBest:best('check'),
  practiceCount:top('practice').length,checkCount:top('check').length,
  reviewCount:top('review').length,latestCheck};
}
function audioSupported(){
 const Utterance=window.SpeechSynthesisUtterance||(typeof SpeechSynthesisUtterance!=='undefined'?SpeechSynthesisUtterance:null);
 return !!(window.speechSynthesis&&Utterance);
}
function speak(id){
 const scene=LINKED.scenes.find(x=>x.id===id);
 const track=D.listening.find(x=>x.id===id)||(scene?{jp:scene.dialogue.map(x=>x.jp).join('　')}:null);
 if(!track)return false;
 if(!audioSupported()){alertText='Trình duyệt không hỗ trợ giọng đọc Nhật. Có thể xem lời thoại, nhưng không tính đã hoàn thành kỹ năng nghe.';draw();return false;}
 try{
  const Utterance=window.SpeechSynthesisUtterance||(typeof SpeechSynthesisUtterance!=='undefined'?SpeechSynthesisUtterance:null);
  const u=new Utterance(track.jp);u.lang='ja-JP';u.rate=.84;u.pitch=1;
  const voices=window.speechSynthesis.getVoices?.()||[];
  const jp=voices.find(x=>x.lang?.toLowerCase().startsWith('ja'));
  if(jp)u.voice=jp;
  u.onstart=()=>{
   if(run&&run.questions[run.index]?.context===id)run.heard[run.index]=true;
   alertText='Đã bắt đầu phát giọng tổng hợp tiếng Nhật.';draw();
  };
  u.onerror=()=>{
   alertText='Không phát được giọng Nhật trên thiết bị. Có thể luyện bằng lời thoại; phần nghe chưa được xác nhận.';
   if(run&&run.questions[run.index]?.context===id)run.heard[run.index]=false;
   draw();
  };
  window.speechSynthesis.cancel();window.speechSynthesis.speak(u);
  alertText='Đang yêu cầu phát âm tiếng Nhật…';draw();return true;
 }catch(e){alertText='Thiết bị không phát được tiếng Nhật. Phần nghe chưa được xác nhận.';draw();return false}
}
function progressTop(){
 const p=status(),viewed=read().viewed.length;
 const state=p.complete?'<span class="n5l-achieved">✓ Đã hoàn thành Bài 01</span>':
  p.practice&&p.checked&&!p.check?'<span>Kiểm tra đủ điểm nhưng chưa xác nhận phần nghe</span>':
  p.practice?'<span>✓ Luyện đạt · còn kiểm tra</span>':
  p.check?'<span>✓ Kiểm tra đạt · còn luyện</span>':'<span>Đang học · chưa hoàn thành</span>';
 return '<div class="n5l-progress"><div>'+state+
  '<small>Đã mở '+viewed+'/4 nhóm tài liệu · Tiêu chí đạt: '+threshold+'% luyện và '+threshold+'% kiểm tra có phần nghe</small></div>'+
  '<div class="n5l-stats"><span>Luyện <strong>'+(p.practiceCount?p.practiceBest+'%':'—')+'</strong></span>'+
  '<span>Kiểm tra <strong>'+(p.checkCount?p.checkBest+'%':'—')+'</strong></span></div></div>';
}
function header(){
 return '<nav class="n5l-crumb" aria-label="Vị trí học tập"><a href="#course/N5">N5 · 25 bài</a>'+
  '<span aria-hidden="true">›</span><span aria-current="page">Bài 01</span></nav>'+
  '<header class="n5l-head"><div><span class="n5l-kicker">MINNA NO NIHONGO · SƠ CẤP I</span>'+
  '<h1>Bài 01 · はじめまして</h1>'+
  '<p>Giới thiệu bản thân, nghề nghiệp và quốc tịch. Học từ vựng, hiểu câu mẫu, đọc và nghe tình huống thật ngắn trước khi kiểm tra.</p></div>'+
  '<span class="n5l-head-count" aria-label="Bài số 1">01 <small>/ 25</small></span></header>';
}
function nav(){
 const buttons=[['learn','Học'],['practice','Luyện'],['check','Kiểm tra'],['review','Ôn lại']];
 return '<nav class="n5l-main-tabs" aria-label="Các bước học Bài 01">'+buttons.map(([id,label],i)=>
  '<button type="button" data-n5l-panel="'+id+'" aria-current="'+(active===id?'step':'false')+'" class="'+(active===id?'is-current':'')+'">'+
  '<span class="n5l-tab-num">'+(i+1)+'</span>'+label+'</button>').join('')+'</nav>';
}
function vocabPage(){
 const groups=[...new Set(D.vocab.map(x=>x.group))];
 return '<section class="n5l-content" aria-label="Từ vựng Bài 01">'+
  '<div class="n5l-section-header"><div><h2>30 từ trọng tâm</h2><p>Đọc chữ Nhật, nghĩa và mẫu câu ngắn. Đây là nhóm từ do HORIZON biên soạn, không phải bản chép danh sách từ trong sách.</p></div>'+
  '<span class="n5l-count">30 mục</span></div>'+
  (focusedVocab?'<div class="n5c-focus-word"><strong>Đang tra từ:</strong> '+esc(D.vocab.find(x=>x.id===focusedVocab)?.jp||'')+' · '+esc(D.vocab.find(x=>x.id===focusedVocab)?.vi||'')+'</div>':'')+
  groups.map(group=>'<section class="n5l-vocab-group"><h3>'+esc(group)+'</h3><div class="n5l-vocab-grid">'+
   D.vocab.filter(x=>x.group===group).map(item=>'<article class="n5l-vocab-card">'+
     '<div class="n5l-word"><strong lang="ja">'+esc(item.jp)+'</strong><span>'+esc(item.vi)+'</span></div>'+
     '<small lang="ja">'+esc(item.sample)+'</small></article>').join('')+'</div></section>').join('')+
  '<div class="n5l-study-tip"><strong>Học hiệu quả:</strong> tự che nghĩa tiếng Việt và nói lại từ Nhật trong 3–5 giây. Nếu chưa nhớ, ưu tiên các từ trong câu hỏi luyện.</div>'+
  '</section>';
}
function grammarPage(){
 return '<section class="n5l-content"><div class="n5l-section-header"><div><h2>6 điểm ngữ pháp cốt lõi</h2>'+
  '<p>Học cấu trúc, hiểu cách dùng rồi thử thay tên, nghề nghiệp và quốc tịch bằng thông tin của bạn.</p></div></div>'+
  '<div class="n5l-grammar-list">'+D.grammar.map((g,i)=>
   '<details class="n5l-grammar"'+(g.id===focusedGrammar?' open':'')+'><summary><span class="n5l-grammar-no">'+String(i+1).padStart(2,'0')+'</span>'+
   '<span><strong lang="ja">'+esc(g.title)+'</strong><small>'+esc(g.meaning)+'</small></span>'+
   '<span class="n5l-chevron" aria-hidden="true">⌄</span></summary>'+
   '<div class="n5l-grammar-body"><p>'+esc(g.explain)+'</p>'+
   '<div class="n5l-example"><small>CẤU TRÚC</small><strong lang="ja">'+esc(g.pattern)+'</strong>'+
   '<small>VÍ DỤ</small><strong lang="ja">'+esc(g.example)+'</strong><span>'+esc(g.translation)+'</span></div>'+
   '<p class="n5l-caution"><strong>Lưu ý:</strong> '+esc(g.caution)+'</p></div></details>').join('')+
  '</div></section>';
}
function readingPage(){
 return '<section class="n5l-content"><div class="n5l-section-header"><div><h2>Đọc hiểu · Ngày đầu ở lớp</h2>'+
  '<p>Đọc một lần để nắm ý chính, sau đó đọc lại tìm tên, quốc tịch và nghề nghiệp. Không cần dịch từng chữ.</p></div></div>'+
  '<article class="n5l-reading-card"><span class="n5l-reading-kicker">ORIGINAL READING · N5</span>'+
  D.reading.paragraphs.map((p,i)=>'<p class="n5l-jp-paragraph" lang="ja">'+esc(p)+'</p>').join('')+
  '<button type="button" class="n5l-small-action" data-n5l-reveal="reading" aria-expanded="'+(showTexts.has('reading')?'true':'false')+'">'+
  (showTexts.has('reading')?'Ẩn gợi ý tiếng Việt':'Xem gợi ý tiếng Việt')+' <span aria-hidden="true">⌄</span></button>'+
  (showTexts.has('reading')?'<p class="n5l-translation">'+esc(D.reading.gloss)+'</p>':'')+'</article>'+
  '<div class="n5l-study-tip"><strong>Tự hỏi:</strong> Linh là người nước nào? Sato làm nghề gì? Mina có phải kỹ sư không? Đáp án sẽ được kiểm tra trong phần Luyện và Kiểm tra.</div></section>';
}
function listeningPage(){
 return '<section class="n5l-content"><div class="n5l-section-header"><div><h2>Nghe hiểu · Ba tình huống</h2>'+
  '<p>Nghe ít nhất hai lần. Lần đầu nắm ý, lần sau tìm thông tin. Dùng giọng tổng hợp tiếng Nhật của thiết bị, không phải audio giáo trình.</p></div></div>'+
  '<div class="n5l-audio-notice">'+(audioSupported()?
  'Phát bằng giọng tổng hợp ja-JP của trình duyệt. Chất lượng phụ thuộc thiết bị, có thể khác người bản ngữ.':
  'Trình duyệt này chưa hỗ trợ phát giọng tổng hợp. Bạn vẫn có thể đọc lời thoại, nhưng phần nghe không được xác nhận.')+'</div>'+
  '<div class="n5l-listen-cards">'+D.listening.map(t=>'<article class="n5l-listen-card">'+
  '<div class="n5l-listen-info"><strong>'+esc(t.title)+'</strong><small>'+esc(t.question)+'</small></div>'+
  '<div class="n5l-listen-controls"><button type="button" class="n5l-play" data-n5l-play="'+esc(t.id)+'"'+(audioSupported()?'':' disabled')+' aria-label="Nghe '+esc(t.title)+'">▶ Nghe</button>'+
  '<button type="button" class="n5l-small-action" data-n5l-reveal="'+esc(t.id)+'" aria-expanded="'+(showTexts.has(t.id)?'true':'false')+'">'+
  (showTexts.has(t.id)?'Ẩn lời thoại':'Xem lời thoại')+'</button></div>'+
  (showTexts.has(t.id)?'<div class="n5l-transcript"><p lang="ja">'+esc(t.jp)+'</p><small>'+esc(t.vi)+'</small></div>':'')+
  '</article>').join('')+'</div>'+
  '<div class="n5l-study-tip">Khi kiểm tra, lời thoại sẽ được ẩn. Chỉ đánh dấu phần nghe hợp lệ sau khi thiết bị đã bắt đầu phát giọng Nhật cho từng câu liên quan.</div></section>';
}
/* v1.47 — contextual application is a learning activity, not an exam. */
const sceneKey=id=>learnerId()+':'+id;
function sceneCount(){
 const records=read().scenePractice||{};
 return LINKED.scenes.filter(scene=>Number(records[scene.id]?.attempts)>0).length;
}
function chooseSceneAnswer(sceneId,choice){
 const scene=LINKED.scenes.find(x=>x.id===sceneId);
 if(!scene||!Number.isInteger(choice)||choice<0||choice>=scene.challenge.options.length)return false;
 const correct=choice===scene.challenge.correct;
 const key=sceneKey(sceneId);
 sceneFeedback.set(key,{choice,correct});
 write(state=>{
  if(!state.scenePractice)state.scenePractice={};
  const previous=state.scenePractice[sceneId]||{attempts:0,correct:0};
  state.scenePractice[sceneId]={attempts:previous.attempts+1,
   correct:previous.correct+(correct?1:0),lastCorrect:correct,
   updatedAt:new Date().toISOString()};
 });
 draw();return true;
}
function scenePage(){
 if(!LINKED.scenes.length)return vocabPage();
 const scene=LINKED.scenes[sceneIndex]||LINKED.scenes[0],saved=read().scenePractice||{};
 const key=sceneKey(scene.id),feedback=sceneFeedback.get(key),showModel=sceneModels.has(key);
 const showTranslation=sceneTranslations.has(key),draft=sceneDrafts.get(key)||'';
 const vocabs=scene.vocab.map(id=>D.vocab.find(x=>x.id===id)).filter(Boolean);
 const grammars=scene.grammar.map(id=>D.grammar.find(x=>x.id===id)).filter(Boolean);
 return '<section class="n5c-root" aria-label="Học N5 Bài 01 qua tình huống">'+
  '<div class="n5c-heading"><div><span class="n5c-eyebrow">LEARN IN CONTEXT · BÀI 01</span>'+
  '<h2>Hiểu và dùng tiếng Nhật trong tình huống.</h2>'+
  '<p>Học qua hội thoại ngắn, tìm hiểu mẫu câu và thử nói theo vai. Các câu tự viết không bị chấm máy móc.</p></div>'+
  '<div class="n5c-progress">'+sceneCount()+'/'+LINKED.scenes.length+'<small>tình huống đã thử</small></div></div>'+
  '<div class="n5c-workspace"><nav class="n5c-scene-nav" aria-label="Chọn tình huống">'+
  LINKED.scenes.map((item,i)=>'<button type="button" class="'+(i===sceneIndex?'is-current ':'')+
   (saved[item.id]?.attempts?'has-practiced':'')+'" data-n5l-scene="'+esc(item.id)+'" aria-current="'+(i===sceneIndex?'step':'false')+'">'+
   '<span class="n5c-scene-num">'+String(i+1).padStart(2,'0')+'</span>'+
   '<span class="n5c-scene-name"><strong>'+esc(item.title)+'</strong><small lang="ja">'+esc(item.jpTitle)+'</small></span>'+
   (saved[item.id]?.attempts?'<span class="n5c-tried" title="Đã thử trả lời tình huống">✓</span>':'')+'</button>').join('')+'</nav>'+
  '<article class="n5c-scene"><span class="n5c-situation-label">TÌNH HUỐNG '+String(sceneIndex+1).padStart(2,'0')+'</span>'+
  '<h3>'+esc(scene.title)+'</h3>'+
  '<p class="n5c-situation">'+esc(scene.situation)+'</p>'+
  '<p class="n5c-goal"><strong>Mục tiêu:</strong> '+esc(scene.goal)+'</p>'+
  '<div class="n5c-dialog-head"><strong>Hội thoại</strong><div>'+
  '<button type="button" data-n5l-play="'+esc(scene.id)+'" class="n5c-audio"'+(audioSupported()?'':' disabled')+
  '>▶ Nghe thoại</button>'+
  '<button type="button" data-n5l-scene-translation="'+esc(scene.id)+'" class="n5c-text-action" aria-expanded="'+showTranslation+'">'+
  (showTranslation?'Ẩn nghĩa':'Hiện nghĩa')+'</button></div></div>'+
  '<div class="n5c-dialog" lang="ja">'+scene.dialogue.map((line,i)=>
   '<div class="n5c-line"><span class="n5c-speaker">'+esc(line.who)+'</span><div>'+
   '<p>'+esc(line.jp)+'</p>'+
   (showTranslation?'<small lang="vi">'+esc(line.vi)+'</small>':'')+
   '</div></div>').join('')+'</div>'+
  '<p class="n5c-audio-note">'+(audioSupported()?
   'Giọng Nhật tổng hợp của trình duyệt; không chấm phát âm hay thay thế audio người bản ngữ.':
   'Thiết bị chưa hỗ trợ phát giọng Nhật. Bạn vẫn có thể luyện bằng văn bản.')+'</p>'+
  '<div class="n5c-links"><div><span>TỪ LIÊN QUAN</span>'+
  '<div class="n5c-tags">'+vocabs.map(x=>'<button type="button" data-n5l-vocabulary="'+esc(x.id)+'" title="'+esc(x.vi)+'">'+esc(x.jp)+' <span aria-hidden="true">↗</span></button>').join('')+'</div></div>'+
  '<div><span>NGỮ PHÁP ÁP DỤNG</span><div class="n5c-tags">'+grammars.map(x=>
   '<button type="button" data-n5l-grammar="'+esc(x.id)+'">'+esc(x.title)+' <span aria-hidden="true">↗</span></button>').join('')+'</div></div></div>'+
  '<p class="n5c-tip"><strong>Điểm cần nhớ:</strong> '+esc(scene.tip)+'</p>'+
  '<div class="n5c-task"><span class="n5c-task-label">THỰC HÀNH 01 · CHỌN PHẢN HỒI PHÙ HỢP</span>'+
  '<h4>'+esc(scene.challenge.title)+'</h4>'+
  '<div class="n5c-options">'+scene.challenge.options.map((answer,i)=>
   '<button type="button" data-n5l-scene-answer="'+i+'" data-n5l-scene-id="'+esc(scene.id)+'"'+
   (feedback?' disabled':'')+' class="'+(feedback?.choice===i?'is-chosen ':'')+
   (feedback&&i===scene.challenge.correct?'is-right':'')+'">'+
   '<span>'+String.fromCharCode(65+i)+'</span><span lang="ja">'+esc(answer)+'</span></button>').join('')+'</div>'+
  (feedback?'<div class="n5c-feedback"><strong>'+(feedback.correct?'✓ Đúng ngữ cảnh':'Chưa phù hợp với tình huống')+'</strong>'+
   '<p>'+esc(scene.challenge.why)+'</p>'+
   '<button type="button" data-n5l-scene-retry="'+esc(scene.id)+'">Thử trả lời lại ↻</button></div>':'')+
  '</div>'+
  '<div class="n5c-task is-writing"><span class="n5c-task-label">THỰC HÀNH 02 · VIẾT CÂU CỦA BẠN</span>'+
  '<h4>'+esc(scene.compose.prompt)+'</h4><p>'+esc(scene.compose.hint)+'</p>'+
  '<textarea data-n5l-compose="'+esc(scene.id)+'" rows="2" placeholder="Tự viết câu tiếng Nhật...">'+esc(draft)+'</textarea>'+
  '<div class="n5c-writing-tools"><button type="button" data-n5l-scene-model="'+esc(scene.id)+'" aria-expanded="'+showModel+'">'+
  (showModel?'Ẩn câu gợi ý':'Xem câu gợi ý để đối chiếu')+'</button>'+
  '<small>Không tự chấm · Không lưu câu cá nhân</small></div>'+
  (showModel?'<p class="n5c-model" lang="ja">'+esc(scene.compose.sample)+'</p>':'')+'</div>'+
  '<div class="n5c-scene-bottom">'+(sceneIndex<LINKED.scenes.length-1?
   '<button type="button" class="n5l-primary" data-n5l-scene="'+esc(LINKED.scenes[sceneIndex+1].id)+'">Tình huống tiếp theo →</button>':
   '<button type="button" class="n5l-primary" data-n5l-section="vocab">Ôn lại từ vựng và mẫu câu →</button>')+
  (run&&!run.finished?'<button type="button" class="n5l-secondary" data-n5l-panel="'+(run.kind==='check'?'check':'practice')+'">Quay lại lượt đang làm</button>':'')+
  '</div></article></div></section>';
}
function learnPage(){
 const lookupOpen=chapter!=='scenes';
 return (chapter==='scenes'?scenePage():'')+
  '<details class="n5c-reference"'+(lookupOpen?' open':'')+'>'+
  '<summary><span><strong>Kiến thức & tra cứu Bài 01</strong><small>30 từ · 6 mẫu câu · bài đọc · 3 bài nghe</small></span><span aria-hidden="true">⌄</span></summary>'+
  '<div class="n5c-reference-inner"><div class="n5l-section-tabs" role="navigation" aria-label="Tra cứu Bài 01">'+
  sections.map(([id,name])=>'<button type="button" data-n5l-section="'+id+'" aria-pressed="'+(chapter===id)+'" class="'+(chapter===id?'is-active':'')+'">'+
   (read().viewed.includes(id)?'✓ ':'')+name+'</button>').join('')+'</div>'+
  (chapter!=='scenes'?({vocab:vocabPage,grammar:grammarPage,reading:readingPage,listening:listeningPage}[chapter]||vocabPage)():'')+
  '</div></details>'+
  '<div class="n5l-step-footer">'+(chapter==='scenes'?
   '<button type="button" class="n5l-primary" data-n5l-section="vocab">Xem kiến thức liên quan →</button>':
   chapter==='listening'?
   '<button type="button" class="n5l-primary" data-n5l-panel="practice">Bắt đầu luyện toàn bài →</button>':
   '<button type="button" class="n5l-primary" data-n5l-section="'+sections[Math.min(sections.findIndex(x=>x[0]===chapter)+1,3)][0]+'">Nội dung tiếp theo →</button>')+
  '</div>';
}
function pool(kind){return(kind==='check'?D.exam:D.practice).map(x=>({...x}));}
function start(kind){
 const questions=pool(kind);
 const sessionId='session-'+Date.now()+'-'+Math.random().toString(36).slice(2,8);
 run={id:sessionId,kind,questions,index:0,answers:[],heard:{},startedAt:Date.now(),finished:false,report:null,learner:learnerId()};
 active=kind==='check'?'check':kind==='review'?'review':'practice';
 alertText='';draw();
}
function questionView(){
 if(!run||run.learner!==learnerId()||run.finished)return '';
 const q=run.questions[run.index],answer=run.answers[run.index];
 const total=run.questions.length;
 const listen=q.type==='listening',track=D.listening.find(x=>x.id===q.context);
 const checked=answer!==undefined;
 return '<section class="n5l-question" aria-live="polite">'+
  '<div class="n5l-question-top"><span>'+esc(typeNames[q.type])+'</span><span>Câu '+(run.index+1)+'/'+total+'</span></div>'+
  '<div class="n5l-question-track"><div style="width:'+Math.round(run.index/total*100)+'%"></div></div>'+
  '<h2>'+esc(q.prompt)+'</h2>'+
  (listen?'<div class="n5l-question-audio">'+
   '<button type="button" class="n5l-play" data-n5l-play="'+esc(q.context)+'"'+(audioSupported()?'':' disabled')+'>▶ Phát hội thoại</button>'+
   '<span>'+(run.heard[run.index]?'✓ Đã bắt đầu phát':'Nghe trước khi chọn đáp án')+'</span>'+
   (!audioSupported()?'<small>Thiết bị không hỗ trợ TTS; có thể làm bằng chữ nhưng phần nghe sẽ không tính đạt.</small>':'')+
   (run.kind==='practice'||run.kind==='review'?
   '<button type="button" class="n5l-small-action" data-n5l-reveal="'+esc(q.context)+'">Xem lời thoại luyện tập</button>':'')+
   (showTexts.has(q.context)&&run.kind!=='check'?'<p lang="ja">'+esc(track?.jp||'')+'</p>':'')+
   '</div>':'')+
  '<div class="n5l-options" role="group" aria-label="Chọn một đáp án">'+q.options.map((option,i)=>
   '<button type="button" data-n5l-answer="'+i+'"'+(checked?' disabled':'')+
   ' class="'+(checked&&answer.choice===i?'is-selected ':'')+
   (checked&&run.kind!=='check'&&i===q.correct?'is-correct':'')+'"><span>'+String.fromCharCode(65+i)+'</span>'+esc(option)+'</button>').join('')+'</div>'+
  (checked?'<div class="n5l-question-feedback">'+(run.kind==='check'?
    '<strong>Đã ghi câu trả lời.</strong><p>Đáp án và giải thích sẽ hiển thị sau khi nộp bài kiểm tra.</p>':
    '<strong>'+(answer.correct?'✓ Chính xác':'Chưa đúng')+'</strong><p>'+esc(q.why)+'</p>')+
    '<button type="button" class="n5l-primary" data-n5l-next="1">'+(run.index===total-1?'Xem kết quả':'Câu tiếp theo →')+'</button>'+
    (run.kind!=='check'&&LINKED.practiceSceneById[q.id]?'<button type="button" class="n5c-review-link" data-n5l-scene-reference="'+esc(LINKED.practiceSceneById[q.id])+'">Xem tình huống liên quan ↗</button>':'')+'</div>':'')+
  '</section>';
}
function answer(index){
 if(!run||run.finished||run.learner!==learnerId())return;
 const q=run.questions[run.index];
 if(run.answers[run.index]!==undefined)return;
 if(!Number.isInteger(index)||index<0||index>=q.options.length)return;
 run.answers[run.index]={choice:index,correct:index===q.correct,at:Date.now(),heard:q.type!=='listening'||run.heard[run.index]===true};
 alertText=q.type==='listening'&&!run.answers[run.index].heard?
  'Câu nghe này chưa xác nhận phát âm thanh. Điểm vẫn được lưu nhưng chưa thể dùng để hoàn thành kỹ năng nghe.':'';
 draw();
}
function finish(){
 if(!run||run.finished||run.answers.length!==run.questions.length)return;
 const result={id:run.id,kind:run.kind,total:run.questions.length,
  correct:run.answers.filter(x=>x.correct).length,
  percent:Math.round(100*run.answers.filter(x=>x.correct).length/run.questions.length),
  elapsedMs:Math.max(0,Date.now()-run.startedAt),
  listeningVerified:run.questions.every((q,i)=>q.type!=='listening'||run.answers[i]?.heard===true),
  byType:{},wrongIds:[],completedAt:new Date().toISOString()};
 for(let i=0;i<run.questions.length;i++){
  const q=run.questions[i],a=run.answers[i];
  const stat=result.byType[q.type]||(result.byType[q.type]={correct:0,total:0});
  stat.total++;if(a.correct)stat.correct++;else result.wrongIds.push(q.id);
 }
 const wasSaved=write(state=>{state.attempts.push(result)});
 run.finished=true;run.report=result;run.saved=wasSaved;
 draw();
}
function finalPage(){
 const result=run.report,p=status(),eligible=result.percent>=threshold;
 const missingAudio=result.kind==='check'&&!result.listeningVerified;
 const passed=eligible&&!missingAudio;
 return '<section class="n5l-finish"><div class="n5l-finish-label">KẾT QUẢ · '+(result.kind==='check'?'KIỂM TRA':result.kind==='review'?'ÔN LẠI':'LUYỆN TẬP')+'</div>'+
  '<h2>'+(missingAudio?'Chưa xác nhận phần nghe':passed?'Đã đạt yêu cầu':'Cần củng cố thêm')+'</h2>'+ 
  '<div class="n5l-finish-score"><strong>'+result.correct+'</strong><span>/ '+result.total+' câu đúng</span><em class="'+(missingAudio?'is-pending':passed?'is-pass':'is-retry')+'">'+result.percent+'%</em></div>'+
  '<p>'+(result.kind==='check'&&!result.listeningVerified?
   'Phần nghe chưa được xác nhận trên thiết bị. Kết quả câu trả lời vẫn lưu, nhưng bài kiểm tra chưa được tính đạt toàn bộ.':
   passed?'Kết quả lượt này đạt mốc '+threshold+'%. Ôn lại sau để củng cố khả năng nhớ lâu.':
   'Ôn phần sai rồi làm lại khi sẵn sàng.')+'</p>'+
  '<div class="n5l-type-results">'+Object.entries(result.byType).map(([id,s])=>
   '<span>'+esc(typeNames[id])+': <strong>'+s.correct+'/'+s.total+'</strong></span>').join('')+'</div>'+
  '<p class="n5l-saved">'+(run.saved?'✓ Lượt làm đã lưu riêng cho hồ sơ này':'Lượt làm chưa lưu: '+esc(saveError))+'</p>'+
  '<div class="n5l-finish-next">'+(p.complete?'<strong>✓ Bài 01 đã hoàn thành</strong>':'<strong>'+(p.practice&&!p.check?'Luyện đạt · cần kiểm tra':p.check&&!p.practice?'Kiểm tra đạt · cần luyện':'Học tiếp để hoàn thành Bài 01')+'</strong>')+
  (p.complete?'<p>Bạn có thể ôn lại Bài 01. Bài 02 hiện vẫn đang biên soạn.</p>':
  '<p>Hoàn thành khi luyện đạt ≥'+threshold+'% và kiểm tra đạt ≥'+threshold+'% có nghe hợp lệ.</p>')+'</div>'+
  '<div class="n5l-finish-buttons"><button type="button" class="n5l-primary" data-n5l-panel="'+
   (p.practice&&!p.check?'check':p.check&&!p.practice?'practice':'review')+'">'+
   (p.practice&&!p.check?'Đi tới kiểm tra':p.check&&!p.practice?'Đi tới luyện tập':'Ôn chữ sai / thử lại')+' →</button>'+
  '<button type="button" class="n5l-secondary" data-n5l-restart="'+run.kind+'">Làm lượt mới ↻</button>'+
  '<a href="#course/N5">Về lộ trình N5</a></div></section>';
}
function practicePage(kind){
 const title=kind==='check'?'Kiểm tra Bài 01':kind==='review'?'Ôn lại Bài 01':'Luyện tập Bài 01';
 if(run?.learner===learnerId()&&run.kind===kind){
  if(run.finished)return finalPage();
  return questionView();
 }
 const p=status();
 const count=kind==='check'?D.exam.length:D.practice.length;
 return '<section class="n5l-start"><span class="n5l-kicker">BÀI 01 · '+(kind==='check'?'ĐÁNH GIÁ':'THỰC HÀNH')+'</span>'+
  '<h2>'+title+'</h2>'+
  '<p>'+(kind==='check'?
   '20 câu mới, gồm từ vựng, ngữ pháp, đọc và nghe hiểu. Đáp án hiển thị cuối bài, không tính thời gian bắt buộc.':
   kind==='review'?'Ôn lại theo bộ câu thực hành; xem lại các lỗi đã mắc và làm lượt mới.':'16 câu theo bốn kỹ năng, xem giải thích ngay sau mỗi câu. Có thể luyện lại nhiều lần.')+'</p>'+
  '<div class="n5l-start-meta"><span>'+count+' câu</span><span>4 kỹ năng</span><span>Mốc đạt '+threshold+'%</span>'+
  (kind==='check'?'<span>Phần nghe dùng giọng tổng hợp của thiết bị</span>':'')+'</div>'+
  (kind==='check'&&!audioSupported()?'<p class="n5l-audio-warning">Thiết bị hiện không hỗ trợ phát âm tiếng Nhật. Bạn vẫn có thể làm và lưu điểm, nhưng chưa thể xác nhận đã đạt kỹ năng nghe.</p>':'')+
  '<button type="button" class="n5l-primary" data-n5l-start="'+kind+'">Bắt đầu '+(kind==='check'?'kiểm tra':kind==='review'?'ôn lại':'luyện tập')+' →</button>'+
  (p.complete?'<p class="n5l-start-foot">✓ Bài đã hoàn thành; lượt mới không xóa kết quả cũ.</p>':'')+
  '</section>';
}
function reviewPage(){
 const p=status(),all=read().attempts,wrong=all.at(-1)?.wrongIds||[];
 const unique=[...new Set(wrong)],map=[...D.practice,...D.exam],mistakes=unique.map(id=>map.find(q=>q.id===id)).filter(Boolean);
 return '<section class="n5l-review"><div class="n5l-section-header"><div><h2>Ôn lại để nhớ lâu</h2>'+
  '<p>Ôn tập không tự động đổi dấu hoàn thành. Bạn có thể xem lại những câu sai gần nhất và luyện lại.</p></div></div>'+
  '<div class="n5l-review-summary"><span>Đã luyện '+p.practiceCount+' lượt</span><span>Đã kiểm tra '+p.checkCount+' lượt</span><span>Đã ôn '+p.reviewCount+' lượt</span></div>'+
  (mistakes.length?'<h3>Câu cần củng cố từ lượt gần nhất</h3><ul>'+mistakes.slice(0,10).map(q=>
   '<li>'+esc(q.prompt)+'<small>'+esc(q.why)+'</small></li>').join('')+'</ul>':
   '<p class="n5l-no-wrong">Chưa có câu sai từ lượt gần nhất. Hãy ôn lại bằng câu hỏi mới để kiểm tra khả năng nhớ.</p>')+
  '<div class="n5l-step-footer"><button type="button" class="n5l-primary" data-n5l-start="review">Bắt đầu lượt ôn →</button></div></section>';
}
function page(){
 if(!D)return '<section class="v25-wrap"><p>Chưa tải được nội dung Bài 01.</p><a href="#course/N5">Trở lại khóa N5</a></section>';
 return '<div class="v25-wrap n5l-root" data-n5-lesson="01" data-n5-version="146">'+
  header()+progressTop()+nav()+
  (alertText?'<p class="n5l-notice" role="status">'+esc(alertText)+'</p>':'')+
  (saveError?'<p class="n5l-save-error" role="alert">'+esc(saveError)+'</p>':'')+
  '<div class="n5l-body" id="n5l-body">'+(active==='learn'?learnPage():
   active==='review'&&(!run||run.kind!=='review'||run.learner!==learnerId())?reviewPage():practicePage(active))+'</div>'+
  '<p class="n5l-footnote">Nội dung được HORIZON biên soạn theo mục tiêu ngữ pháp Bài 01; không sao chép nguyên văn sách hoặc audio Minna no Nihongo. Từ vựng có thể khác giữa phiên bản giáo trình.</p></div>';
}
function draw(){if(document.querySelector?.('.n5l-root')&&typeof render==='function')render(false)}
const original=coursePage;
coursePage=function(id){
 const here=decodeURIComponent(location.hash.replace(/^#\/?/,''));
 return id==='N5'&&here==='course/N5/lesson/01'?page():original(id);
};
document.addEventListener('click',event=>{
 if(!document.querySelector?.('.n5l-root'))return;
 const target=event.target;
 const sceneNav=target.closest?.('[data-n5l-scene],[data-n5l-scene-reference]');
 if(sceneNav){
  event.preventDefault();
  const id=sceneNav.dataset.n5lScene||sceneNav.dataset.n5lSceneReference;
  const index=LINKED.scenes.findIndex(x=>x.id===id);
  if(index>=0){sceneIndex=index;chapter='scenes';active='learn';alertText='';draw();}
  return;
 }
 const sceneChoice=target.closest?.('[data-n5l-scene-answer]');
 if(sceneChoice){event.preventDefault();chooseSceneAnswer(sceneChoice.dataset.n5lSceneId,Number(sceneChoice.dataset.n5lSceneAnswer));return;}
 const sceneRetry=target.closest?.('[data-n5l-scene-retry]');
 if(sceneRetry){event.preventDefault();sceneFeedback.delete(sceneKey(sceneRetry.dataset.n5lSceneRetry));draw();return;}
 const sceneModel=target.closest?.('[data-n5l-scene-model]');
 if(sceneModel){
  event.preventDefault();
  const key=sceneKey(sceneModel.dataset.n5lSceneModel);
  if(sceneModels.has(key))sceneModels.delete(key);else sceneModels.add(key);
  draw();return;
 }
 const sceneTranslation=target.closest?.('[data-n5l-scene-translation]');
 if(sceneTranslation){
  event.preventDefault();
  const key=sceneKey(sceneTranslation.dataset.n5lSceneTranslation);
  if(sceneTranslations.has(key))sceneTranslations.delete(key);else sceneTranslations.add(key);
  draw();return;
 }
 const grammarLink=target.closest?.('[data-n5l-grammar]');
 if(grammarLink){
  event.preventDefault();focusedGrammar=grammarLink.dataset.n5lGrammar;
  if(D.grammar.some(x=>x.id===focusedGrammar)){chapter='grammar';active='learn';draw();}
  return;
 }
 const wordLink=target.closest?.('[data-n5l-vocabulary]');
 if(wordLink){
  event.preventDefault();focusedVocab=wordLink.dataset.n5lVocabulary;
  if(D.vocab.some(x=>x.id===focusedVocab)){chapter='vocab';active='learn';draw();}
  return;
 }
 const panel=target.closest?.('[data-n5l-panel]');
 if(panel){event.preventDefault();active=panel.dataset.n5lPanel;alertText='';draw();return}
 const section=target.closest?.('[data-n5l-section]');
 if(section){
  event.preventDefault();chapter=section.dataset.n5lSection;
  if(sections.some(x=>x[0]===chapter))write(s=>{if(!s.viewed.includes(chapter))s.viewed.push(chapter)});
  draw();return;
 }
 const play=target.closest?.('[data-n5l-play]');
 if(play){event.preventDefault();speak(play.dataset.n5lPlay);return}
 const show=target.closest?.('[data-n5l-reveal]');
 if(show){event.preventDefault();const id=show.dataset.n5lReveal;if(showTexts.has(id))showTexts.delete(id);else showTexts.add(id);draw();return}
 const startBtn=target.closest?.('[data-n5l-start],[data-n5l-restart]');
 if(startBtn){event.preventDefault();start(startBtn.dataset.n5lStart||startBtn.dataset.n5lRestart);return}
 const ans=target.closest?.('[data-n5l-answer]');
 if(ans){event.preventDefault();answer(Number(ans.dataset.n5lAnswer));return}
 const next=target.closest?.('[data-n5l-next]');
 if(next){event.preventDefault();if(run&&run.answers[run.index]!==undefined){
   if(run.index>=run.questions.length-1)finish();else{run.index++;alertText='';draw();}
  }return}
});
document.addEventListener('input',event=>{
 if(!document.querySelector?.('.n5l-root'))return;
 const field=event.target?.closest?.('textarea[data-n5l-compose]');
 if(field&&LINKED.scenes.some(x=>x.id===field.dataset.n5lCompose))
  sceneDrafts.set(sceneKey(field.dataset.n5lCompose),String(field.value||'').slice(0,1200));
});
/* Full-page route should work on a refreshed deep link, not only client navigation. */
if(decodeURIComponent(location.hash.replace(/^#\/?/,''))==='course/N5/lesson/01'){
 const refresh=()=>render(false);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh,{once:true});
 else if(typeof queueMicrotask==='function')queueMicrotask(refresh);
}
window.NPN5Lesson01=Object.freeze({version:'v147',page,status,read,
 data:()=>D,route,select:section=>{if(sections.some(x=>x[0]===section)){active='learn';chapter=section;}},
 start:kind=>{if(['practice','check','review'].includes(kind))start(kind)},
 answer,finish,session:()=>run,audioSupported,
 scenes:()=>LINKED.scenes.map(x=>({id:x.id,title:x.title})),sceneCount,
 chooseSceneAnswer,openScene:id=>{const i=LINKED.scenes.findIndex(x=>x.id===id);if(i>=0){sceneIndex=i;chapter='scenes';active='learn';}},
 scenePage,progressTop});
})();