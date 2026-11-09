/* HORIZON · N5 UI REBUILD v2.00
   New independent N5 shell and page renderer. No legacy N5 HTML/CSS reuse.
   Reads canonical lesson/scene/person data, delegates assessment to existing engine.
*/
(function(){
'use strict';
const BASE='#course/N5', LESSON=BASE+'/lesson/01';
const ROUTES={course:BASE,overview:LESSON+'/overview',story:LESSON+'/story',content:LESSON+'/content',
 practice:LESSON+'/practice',check:LESSON+'/check',result:LESSON+'/result',review:LESSON+'/review',
 characters:BASE+'/characters',contexts:BASE+'/contexts'};
const DATA=window.NPN5Lesson01Data||{},SCENES=window.NPN5Lesson01Scenes?.scenes||[],
 WORLD=window.NPN5CharacterWorld, LEARNER=window.NPN5Lesson01;
const esc=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const jp=s=>'<span lang="ja">'+esc(s)+'</span>';
const currentRoute=()=>decodeURIComponent(location.hash.replace(/^#\/?/,''));
const user=()=>{try{return String(P()?.id||'guest').replace(/[^a-z0-9_-]/gi,'_')}catch{return'guest'}};
const prefsKey=()=> 'Horizon.N5.v2.View.'+user();
const defaults=()=>({scene:'meeting',tab:'vocab',practiceMode:'guided',search:'',filter:'all',showTranslation:false,selected:null,quizHad:false});
let prefsOwner='',prefs=defaults(),noteOpen=null,modalChar=null,flashIndex=0,flipped=false,
 activeGuidedChoice={},audioState='',voiceSpeed=.86,practiceAnswerSaved=false;
function sync(){
 const id=user();if(prefsOwner===id)return;
 prefsOwner=id;prefs=defaults();activeGuidedChoice={};noteOpen=null;modalChar=null;flipped=false;
 try{const v=JSON.parse(localStorage.getItem(prefsKey())||'null');
  if(v&&typeof v==='object'){
   for(const k of ['scene','tab','practiceMode','search','filter','showTranslation'])if(Object.hasOwn(v,k))prefs[k]=v[k];
  }
 }catch{}
 if(!SCENES.some(s=>s.id===prefs.scene))prefs.scene=SCENES[0]?.id||'meeting';
}
function save(){try{localStorage.setItem(prefsKey(),JSON.stringify({
 scene:prefs.scene,tab:prefs.tab,practiceMode:prefs.practiceMode,
 search:prefs.search,filter:prefs.filter,showTranslation:prefs.showTranslation
 }))}catch{}}
const scene=()=>SCENES.find(s=>s.id===prefs.scene)||SCENES[0];
const people=()=>WORLD?.characters?.()||[];
const person=id=>WORLD?.character?.(id)||people().find(x=>x.id===id);
const unique=arr=>[...new Set(arr)];
const cast=sc=>unique((sc?.dialogue||[]).map(x=>x.who)).map(person).filter(Boolean);
const status=()=>LEARNER?.status?.()||{practice:false,check:false,complete:false,practiceCount:0,checkCount:0};
const records=()=>LEARNER?.read?.()||{attempts:[],scenePractice:{}};
const readScene=id=>records().scenePractice?.[id]||null;
const sceneDone=id=>Number(readScene(id)?.attempts||0)>0;
const scenesDone=()=>SCENES.filter(x=>sceneDone(x.id)).length;
const score=(x)=>Number.isFinite(x)?x+'%':'—';
const stageTitles=['Khởi đầu giao tiếp','Hoạt động thường ngày','Diễn đạt nhu cầu','Kể chuyện & giao tiếp','Vận dụng tổng hợp'];
function mark(name){
 const paths={
 home:'M3 10l9-7 9 7M5 9v12h5v-7h4v7h5V9',
 book:'M3 4h5a5 5 0 014 2 5 5 0 014-2h5v15h-5a5 5 0 00-4 2 5 5 0 00-4-2H3z',
 pen:'M16 3l5 5-12 12-6 1 1-6z',exam:'M7 3h11l3 3v15H7zM10 11h8M10 15h7',
 people:'M17 7a5 5 0 11-10 0 5 5 0 0110 0M3 22v-3a9 9 0 0118 0v3',
 picture:'M3 4h18v16H3zM5 16l5-5 4 4 3-3 4 4',
 back:'M20 12H4M10 6l-6 6 6 6',
 chevron:'M9 5l7 7-7 7',sound:'M3 9h4l5-5v16l-5-5H3zM16 8a6 6 0 010 8',
 chart:'M4 20V10h4v10M10 20V4h4v16M16 20v-7h4v7',
 notes:'M6 3h10l3 3v15H6zM9 8h6M9 12h7M9 16h5',
 pin:'M12 22a10 10 0 100-20 10 10 0 000 20zM16 8l-2.5 5.5L8 16l2.5-5.5z',
 check:'M5 12l4 4L20 5',
 refresh:'M3 4v6h6M21 20v-6h-6M4 10a8 8 0 0114-4l3 3M20 14a8 8 0 01-14 4l-3-3',
 close:'M5 5l14 14M19 5L5 19',
 search:'M20 20l-5-5M17 10a7 7 0 11-14 0 7 7 0 0114 0'
 };
 return '<svg class="n5r-i" viewBox="0 0 24 24" aria-hidden="true"><path d="'+(paths[name]||paths.book)+'"/></svg>';
}
function portrait(id,size='m'){
 const p=person(id);let label=p?.vi||p?.short||p?.jp||id;
 // Only raster image assets are accepted for the new visual system.
 // Explicit fallback avoids displaying rejected geometric portraits.
 const known=['keiko','yamada','mike','nakamura','linh','kenta','mai','suriya','arvin','pierre','ani','carlos'];
 const ix=known.indexOf(id);
 if(ix>=0)return '<span class="n5r-face n5r-face-'+size+' n5r-face-art" data-face="'+ix+'" role="img" aria-label="Minh họa '+esc(label)+'"></span>';
 const initial=String(label).trim().split(/\s+/).map(x=>x.slice(0,1)).slice(0,2).join('').toUpperCase();
 return '<span class="n5r-face n5r-face-'+size+' n5r-face-empty" role="img" aria-label="Chưa có ảnh minh họa duyệt cho '+esc(label)+'">'+esc(initial)+'</span>';
}
function chip(text,cl=''){return '<span class="n5r-chip '+cl+'">'+esc(text)+'</span>'}
function button(label,href,cl='primary'){return '<a class="n5r-button n5r-button-'+cl+'" href="'+href+'">'+label+'</a>'}
function sectionTitle(eyebrow,title,desc=''){
 return '<header class="n5r-section-heading"><div><span class="n5r-kicker">'+esc(eyebrow)+'</span>'+
 '<h2>'+esc(title)+'</h2>'+(desc?'<p>'+esc(desc)+'</p>':'')+'</div></header>';
}
function learnerStats(){
 const st=status();return {st,six:scenesDone(),attempts:records().attempts||[]};
}
function hero(title,subtitle='',small='MINNA NO NIHONGO · SƠ CẤP I',className=''){
 return '<header class="n5r-hero '+className+'"><div class="n5r-hero-copy"><span class="n5r-kicker">'+small+'</span>'+
 '<h1>'+title+'</h1><p>'+subtitle+'</p></div><div class="n5r-hero-art" aria-hidden="true"></div></header>';
}
function frame(content){
 const p=currentRoute(),at=p.split('/'),routeId=at.slice(2).join('/'),act=p===ROUTES.course?'course':at.includes('characters')?'characters':
  at.includes('contexts')?'contexts':at.includes('practice')?'practice':at.includes('check')?'check':
  at.includes('content')?'content':at.includes('story')?'story':at.includes('result')?'result':at.includes('review')?'review':'overview';
 const items=[
 ['course','Tổng quan khóa học',ROUTES.course,'home'],
 ['overview','Tổng quan Bài 01',ROUTES.overview,'book'],
 ['story','Học theo tình huống',ROUTES.story,'people'],
 ['content','Kiến thức & tra cứu',ROUTES.content,'notes'],
 ['practice','Luyện tập vận dụng',ROUTES.practice,'pen'],
 ['check','Kiểm tra Bài 01',ROUTES.check,'exam'],
 ['result','Kết quả & hướng dẫn',ROUTES.result,'chart'],
 ['characters','Thư viện nhân vật',ROUTES.characters,'people'],
 ['contexts','Thư viện bối cảnh',ROUTES.contexts,'picture']
 ];
 const nav=items.map((i,n)=>'<a href="'+i[2]+'" class="n5r-side-link'+(act===i[0]?' active':'')+
  '" aria-current="'+(act===i[0]?'page':'false')+'">'+mark(i[3])+'<span>'+i[1]+'</span>'+
  (act===i[0]?'<i aria-hidden="true"></i>':'')+'</a>').join('');
 return '<div class="n5r-shell" data-n5-rebuild="2.0"><a class="n5r-skip" href="#n5r-main">Tới nội dung học</a>'+
 '<header class="n5r-top"><a class="n5r-brand" href="#today"><span class="n5r-brandmark" aria-hidden="true">◒</span>'+
 '<span><strong>HORIZON</strong><small>Học tiếng Nhật hiệu quả cùng bạn</small></span></a>'+
 '<nav class="n5r-toplinks" aria-label="Chức năng HORIZON">'+[
 ['Khóa học','#learn','book'],['Luyện tập','#review','pen'],['Luyện đề','#learn','exam'],
 ['Tài liệu','#library','notes'],['Theo dõi','#reports','chart']
 ].map((x,i)=>'<a href="'+x[1]+'" class="'+(i===0?'active':'')+'">'+mark(x[2])+' '+x[0]+'</a>').join('')+'</nav>'+
 '<div class="n5r-top-actions"><a href="#library" aria-label="Tìm kiếm" title="Tìm tài liệu">'+mark('search')+'</a>'+
 '<a href="#profiles" class="n5r-avatar-top" aria-label="Đổi hồ sơ">'+esc((typeof P==='function'?P()?.name:'')||'Học viên').slice(0,1)+'</a></div></header>'+
 '<div class="n5r-workspace"><aside class="n5r-side"><div class="n5r-course-identity"><span class="n5r-course-book">N5</span>'+
 '<div><strong>Minna no Nihongo N5</strong><small>Sơ cấp I · 25 bài</small></div></div>'+
 '<nav aria-label="Điều hướng Minna N5" class="n5r-side-nav">'+nav+'</nav>'+
 '<div class="n5r-side-foot"><a href="#learn">← Các khóa học khác</a><p>Học từng bước. Ứng dụng kiến thức trong câu chuyện thực tế.</p></div></aside>'+
 '<div class="n5r-content-col"><div class="n5r-breadcrumb"><a href="#learn">Khóa học</a><span>›</span>'+
 '<a href="'+ROUTES.course+'">Minna no Nihongo N5</a><span>›</span><span>'+esc(items.find(i=>i[0]===act)?.[1]||'Bài 01')+'</span></div>'+
 '<main id="n5r-main" tabindex="-1">'+content+'</main>'+
 '<footer class="n5r-foot">HORIZON · N5 Rebuild v2.00 <span>Minh họa hư cấu · Chưa phải tài liệu chính thức từ nhà xuất bản</span></footer></div></div>'+
 '<nav class="n5r-bottom" aria-label="Điều hướng nhanh trên điện thoại">'+[
 ['Khóa N5',ROUTES.course,'book'],['Học',ROUTES.story,'people'],['Tra cứu',ROUTES.content,'notes'],
 ['Luyện',ROUTES.practice,'pen'],['Kết quả',ROUTES.result,'chart']].map(x=>
 '<a href="'+x[1]+'" class="'+(p===x[1]?'active':'')+'">'+mark(x[2])+'<span>'+x[0]+'</span></a>').join('')+'</nav></div>';
}
function right(title,body){
 return '<aside class="n5r-aside"><section class="n5r-card n5r-right-card">'+
 '<h3>'+title+'</h3>'+body+'</section></aside>';
}
function companions(sc){
 const members=cast(sc);const m=members.length?members:people().slice(0,4);
 return '<div class="n5r-cast">'+m.slice(0,4).map(p=>
 '<button class="n5r-person-pill" type="button" data-person="'+esc(p.id)+'" aria-label="Xem hồ sơ '+esc(p.vi)+'">'+portrait(p.id,'s')+
 '<span>'+esc(p.vi||p.jp)+'</span></button>').join('')+'</div>';
}
function placeCard(sc){
 return '<div class="n5r-place-card"><div class="n5r-place-image" aria-hidden="true"></div>'+
 '<dl><dt>Ở đâu?</dt><dd>'+esc(sc?.place||sc?.location||'Nhiều môi trường')+'</dd>'+
 '<dt>Thời gian</dt><dd>'+esc(sc?.time||'Tùy tình huống')+'</dd>'+
 '<dt>Ai nói với ai?</dt><dd>'+esc(sc?.relationship||'Người mới quen và đồng nghiệp')+'</dd></dl></div>';
}
function stagePage(){
 const items=window.NPN5Path?.outline?.()||[],st=status(),intro='<div class="n5r-course-intro">'+
 '<div class="n5r-progress-bar"><span style="width:'+(st.complete?'4':'0')+'%"></span></div>'+
 '<span>'+ (st.complete?'1/25 bài đã hoàn thành':'Bài 01 · chưa hoàn thành')+'</span></div>';
 return '<div class="n5r-page">'+hero('Minna no Nihongo <em>N5</em>',
 '25 bài, 5 chặng. Học qua hội thoại, nhân vật, bối cảnh thực hành rồi luyện, kiểm tra và ôn lại.')+
 '<div class="n5r-two-main"><div class="n5r-main-stack"><section class="n5r-card n5r-course-status">'+
 '<div><span class="n5r-kicker">TIẾP TỤC HÀNH TRÌNH</span><h2>Bài 01 · はじめまして</h2>'+
 '<p>Chào hỏi, giới thiệu tên, nghề nghiệp và quốc tịch trong sáu tình huống liên kết.</p>'+intro+'</div>'+
 button(st.complete?'Xem kết quả Bài 01 →':'Tiếp tục học Bài 01 →',st.complete?ROUTES.result:ROUTES.overview)+'</section>'+
 '<section class="n5r-card n5r-roadmap">'+sectionTitle('25 LESSONS · 5 STAGES','Lộ trình khóa học',
 'Mở chặng đang học. Những bài chưa có dữ liệu đầy đủ được ghi rõ, không có nút hoàn thành giả.')+
 Array.from({length:5},(_,i)=>'<details class="n5r-stage"'+(i===0?' open':'')+'>'+
 '<summary><span class="n5r-stage-num">0'+(i+1)+'</span><div><strong>'+stageTitles[i]+'</strong><small>Bài '+
 String(i*5+1).padStart(2,'0')+'–'+String((i+1)*5).padStart(2,'0')+'</small></div>'+
 mark('chevron')+'</summary><ol>'+items.slice(i*5,i*5+5).map(x=>
 '<li><span class="n5r-lesson-no">'+String(x.number).padStart(2,'0')+'</span>'+
 '<div><strong>'+esc(x.title)+'</strong><small>'+(
 x.number===1?(st.complete?'✓ Đã hoàn thành':'Đang triển khai đủ nội dung') :
 x.number===2?'Có bài minh họa · chưa hoàn chỉnh':'Đang biên soạn')+'</small></div>'+
 (x.number===1?'<a href="'+ROUTES.overview+'">Mở bài →</a>':
 x.number===2?'<a href="#lesson/n5-demonstratives">Xem mẫu →</a>':
 '<span class="n5r-unreleased">Chưa phát hành</span>')+'</li>').join('')+'</ol></details>').join('')+
 '</section></div><div class="n5r-context-stack">'+
 '<section class="n5r-card n5r-right-card"><h3>Nhân vật đồng hành <a href="'+ROUTES.characters+'">Xem tất cả ›</a></h3>'+
 companions(SCENES[0])+'<p>Chạm vào tên để tìm hiểu nghề nghiệp, quốc tịch và vai trò của họ.</p></section>'+
 '<section class="n5r-card n5r-right-card"><h3>Bối cảnh trong khóa học</h3><div class="n5r-place-image"></div>'+
 '<p>Lớp học, công ty, khách sạn, quán cà phê và các hoạt động thường ngày.</p>'+
 '<a class="n5r-textlink" href="'+ROUTES.contexts+'">Khám phá bối cảnh →</a></section>'+
 '<section class="n5r-card n5r-right-card"><h3>Học thế nào cho hiệu quả?</h3>'+
 '<ul class="n5r-tips"><li>Hiểu bối cảnh trước khi nghe.</li><li>Tự nói hoặc viết trước khi xem gợi ý.</li>'+
 '<li>Kiểm tra độc lập, ôn lại lỗi sai.</li></ul></section></div></div></div>';
}
function lessonSteps(active){
 const arr=[['overview','Tổng quan',ROUTES.overview],['story','Tình huống',ROUTES.story],
  ['content','Nội dung học',ROUTES.content],['practice','Luyện',ROUTES.practice],
  ['check','Kiểm tra',ROUTES.check],['result','Kết quả',ROUTES.result]];
 return '<nav class="n5r-lesson-steps" aria-label="Các bước học">'+arr.map((x,i)=>
 '<a href="'+x[2]+'" class="'+(active===x[0]?'active':'')+'">'+
 '<span class="n5r-step-n">'+(i+1)+'</span>'+esc(x[1])+'</a>').join('')+'</nav>';
}
const goals=['Chào hỏi, làm quen với người mới.','Giới thiệu tên, quốc tịch, nghề nghiệp.',
 'Dùng は · も · の và か đúng hoàn cảnh.','Đọc, nghe và tự nói lời giới thiệu ngắn.'];
function lessonOverview(){
 const x=scenesDone(),st=status(),next=SCENES.find(s=>!sceneDone(s.id))||SCENES[0];
 return '<div class="n5r-page">'+hero('Bài 01 · <span lang="ja">はじめまして</span>',
 'Làm quen và giới thiệu bản thân qua các cuộc gặp ở trường, nơi làm việc và sinh hoạt.', 'MINNA NO NIHONGO · LESSON 01','n5r-lesson-hero')+
 lessonSteps('overview')+'<div class="n5r-two-main"><div class="n5r-main-stack">'+
 '<div class="n5r-double"><section class="n5r-card n5r-goals"><h3>◎ Mục tiêu bài học</h3><ul>'+
 goals.map(t=>'<li>'+mark('check')+esc(t)+'</li>').join('')+'</ul></section>'+
 '<section class="n5r-card n5r-fourphase"><h3>Tiến độ & các bước học</h3>'+
 '<p class="n5r-data-caption">'+x+'/'+SCENES.length+' tình huống đã thử · '+
 (st.complete?'✓ Đã hoàn thành bài':'Chưa hoàn thành')+'</p>'+
 '<div class="n5r-four-grid">'+[['Học','Hội thoại & kiến thức','book'],['Luyện','Vận dụng đa dạng','pen'],
 ['Kiểm tra','Đánh giá độc lập','exam'],['Ôn lại','Củng cố lỗi sai','refresh']].map((a,i)=>
 '<a href="'+[ROUTES.story,ROUTES.practice,ROUTES.check,ROUTES.review][i]+'" class="n5r-step-card n5r-phase-'+i+'">'+
 mark(a[2])+'<strong>'+a[0]+'</strong><small>'+a[1]+'</small></a>').join('')+'</div></section></div>'+
 '<section class="n5r-card">'+sectionTitle('STORY-BASED LEARNING','6 tình huống của Bài 01',
 'Học theo một câu chuyện có nhân vật, nơi chốn và mục tiêu giao tiếp rõ ràng.')+
 '<div class="n5r-scene-grid">'+SCENES.map((s,i)=>
 '<button type="button" data-scene="'+esc(s.id)+'" class="n5r-scene-tile">'+
 '<span class="n5r-scene-art">'+portrait(s.dialogue[0]?.who,'m')+'</span>'+
 '<span><small>TÌNH HUỐNG '+String(i+1).padStart(2,'0')+'</small>'+
 '<strong>'+esc(s.title)+'</strong><em>'+esc(s.goal)+'</em></span>'+
 '<i>'+(sceneDone(s.id)?'✓ Đã thử':'Bắt đầu →')+'</i></button>').join('')+'</div></section>'+
 '<section class="n5r-card n5r-content-gateway"><h3>Kiến thức trong Bài 01</h3><div>'+
 [['Từ vựng',DATA.vocab?.length||0,'vocab'],['Ngữ pháp',DATA.grammar?.length||0,'grammar'],
 ['Đọc hiểu',1,'reading'],['Nghe hiểu',DATA.listening?.length||0,'listening']].map(a=>
 '<button type="button" data-tab="'+a[2]+'">'+mark('book')+'<strong>'+a[0]+'</strong>'+
 '<small>'+a[1]+' mục</small></button>').join('')+'</div></section>'+
 '<div class="n5r-page-actions">'+button(x?'Tiếp tục tình huống →':'Bắt đầu tình huống 01 →',ROUTES.story)+
 button('Xem tất cả nội dung bài',ROUTES.content,'outline')+'</div></div>'+
 '<div class="n5r-context-stack"><section class="n5r-card n5r-right-card"><h3>Nhân vật & bối cảnh <a href="'+ROUTES.characters+'">Xem tất cả ›</a></h3>'+
 companions(next)+placeCard(next)+'</section>'+
 '<section class="n5r-card n5r-right-card"><h3>Những câu cần nhớ</h3>'+
 ['はじめまして。','わたしは マイです。','どうぞ よろしくおねがいします。'].map(x=>
 '<p class="n5r-phrase" lang="ja">'+esc(x)+'</p>').join('')+'</section></div></div></div>';
}
function stepProgress(){
 const n=SCENES.findIndex(x=>x.id===prefs.scene);return '<div class="n5r-story-progress"><span>Tình huống '+(n+1)+'/'+SCENES.length+'</span>'+
 '<div>'+SCENES.map((s,i)=>'<button type="button" data-scene="'+esc(s.id)+'" aria-label="Tình huống '+(i+1)+': '+esc(s.title)+
 '" class="'+(s.id===prefs.scene?'active':sceneDone(s.id)?'tried':'')+'">'+(i+1)+'</button>').join('')+'</div></div>';
}
function notesFor(line){
 const phrases=[
 ['はじめまして','Rất vui được gặp lần đầu','Chỉ dùng ở lần gặp đầu; không dùng khi đã quen.'],
 ['よろしくおねがいします','Rất mong được giúp đỡ','Lời nói lịch sự theo quan hệ, không dịch cứng từng chữ.'],
 ['じゃありません','không phải','Thể phủ định danh từ; không thêm です phía sau.'],
 ['ですか','phải không?','Thêm か để hỏi, không đảo chủ ngữ.'],
 ['～さん','danh xưng lịch sự','Không thêm さん sau tên bản thân.'],
 ['も','cũng','も thay trợ từ は trong ngữ cảnh cùng đặc điểm.']
 ];
 let raw=esc(line);
 const found=phrases.find(p=>line.includes(p[0]));
 if(!found)return raw;
 const at=raw.indexOf(esc(found[0]));if(at<0)return raw;
 return raw.slice(0,at)+'<button type="button" class="n5r-highlight" data-note="'+esc(found[0])+
 '" aria-label="Giải thích '+esc(found[0])+'">'+esc(found[0])+'</button>'+raw.slice(at+esc(found[0]).length);
}
function storyPage(){
 const sc=scene(),index=SCENES.indexOf(sc),prev=SCENES[index-1],next=SCENES[index+1],record=readScene(sc.id),
 answer=activeGuidedChoice[user()+':'+sc.id],matches=cast(sc);
 return '<div class="n5r-page">'+hero('Bài 01 · <span lang="ja">はじめまして</span>',
 'Học tiếng Nhật từ câu chuyện: ai nói, nói ở đâu, vì sao và bạn sẽ phản hồi thế nào.','TRANG HỌC · TÌNH HUỐNG','n5r-lesson-hero')+
 lessonSteps('story')+stepProgress()+
 '<div class="n5r-two-main"><div class="n5r-main-stack">'+
 '<section class="n5r-card n5r-story-card"><header class="n5r-card-head"><h2>Tình huống '+(index+1)+'/6 · '+esc(sc.title)+'</h2>'+
 chip(sceneDone(sc.id)?'✓ Đã thực hành':'Đang học',sceneDone(sc.id)?'good':'')+'</header>'+
 '<div class="n5r-story-hero"><div class="n5r-story-figures">'+matches.slice(0,3).map(c=>
 '<button type="button" data-person="'+esc(c.id)+'">'+portrait(c.id,'l')+
 '<span>'+esc(c.vi||c.jp)+'</span></button>').join('')+'</div>'+
 '<div class="n5r-story-caption"><strong>'+esc(sc.place||sc.location||'Bối cảnh giao tiếp')+'</strong>'+
 '<p>'+esc(sc.situation)+'</p></div></div>'+
 '<div class="n5r-setting-grid">'+[
 ['Địa điểm',sc.place||sc.location],['Thời gian',sc.time],
 ['Mối quan hệ',sc.relationship],['Mục tiêu',sc.goal]].map(a=>
 '<div><strong>'+a[0]+'</strong><span>'+esc(a[1])+'</span></div>').join('')+'</div>'+
 '<div class="n5r-dialogue-tools"><strong>Hội thoại</strong><div>'+
 '<button type="button" data-play-all="1">'+mark('sound')+' Nghe toàn bộ</button>'+
 '<button type="button" data-translation="1">'+(prefs.showTranslation?'Ẩn nghĩa tiếng Việt':'Hiện nghĩa tiếng Việt')+'</button></div></div>'+
 '<div class="n5r-dialogue">'+sc.dialogue.map((line,i)=>
 '<div class="n5r-dialogue-line"><button class="n5r-speaker" type="button" data-person="'+esc(line.who)+'">'+
 portrait(line.who,'s')+'<span>'+esc(person(line.who)?.vi||person(line.who)?.jp||line.who)+'</span></button>'+
 '<div class="n5r-utterance"><p lang="ja">'+notesFor(line.jp)+'</p>'+
 (prefs.showTranslation?'<small>'+esc(line.vi)+'</small>':'')+'</div>'+
 '<button type="button" class="n5r-audio" data-play-line="'+i+'" aria-label="Nghe câu '+(i+1)+'">'+mark('sound')+'</button></div>').join('')+'</div>'+
 '<div class="n5r-context-links">'+
 '<button type="button" data-lookup="vocab">Từ vựng liên quan →</button>'+
 '<button type="button" data-lookup="grammar">Ngữ pháp liên quan →</button>'+
 '<button type="button" data-lookup="listening">Nghe và Script →</button></div>'+
 '<div class="n5r-micro-task"><span class="n5r-kicker">THỬ HIỂU NGỮ CẢNH</span><h3>'+esc(sc.challenge.title)+'</h3>'+
 sc.challenge.options.map((o,i)=>
 '<button type="button" data-scene-answer="'+i+'" class="n5r-answer-choice'+(answer===i?' selected':'')+'"'+
 (answer!==undefined?' disabled':'')+'><b>'+String.fromCharCode(65+i)+'</b>'+jp(o)+'</button>').join('')+
 (answer!==undefined?'<div class="n5r-feedback '+(answer===sc.challenge.correct?'good':'needs')+'">'+
 '<strong>'+(answer===sc.challenge.correct?'✓ Đúng ngữ cảnh':'Cần xem lại ngữ cảnh')+'</strong>'+
 '<p>'+esc(sc.challenge.why)+'</p><button type="button" data-retry-scene="1">Trả lời lại</button></div>':'')+'</div>'+
 '<details class="n5r-variation"><summary>Thực hành thêm · Thay thế mẫu câu & tự viết</summary>'+
 '<div><p>'+esc(sc.replace.prompt)+' · '+jp(sc.replace.stem)+'</p>'+
 sc.replace.options.map((o,i)=>'<button type="button" data-sub="'+i+'">'+jp(o)+'</button>').join('')+
 '<p>'+esc(sc.compose.prompt)+'</p><textarea data-compose="'+esc(sc.id)+'" rows="2" placeholder="Tự viết câu tiếng Nhật..."></textarea>'+
 '<button type="button" data-model="1">Đối chiếu câu gợi ý</button>'+
 (noteOpen==='model'?'<p lang="ja">'+esc(sc.compose.sample)+'</p>':'')+'</div></details>'+
 '</section><div class="n5r-page-actions">'+(prev?button('← Tình huống trước',ROUTES.story+'?scene='+prev.id,'outline'):
 button('← Tổng quan',ROUTES.overview,'outline'))+
 (next?'<button type="button" class="n5r-button n5r-button-primary" data-next-scene="'+esc(next.id)+'">Tình huống tiếp theo →</button>':
 button('Chuyển sang luyện tập →',ROUTES.practice))+'</div></div>'+
 '<div class="n5r-context-stack"><section class="n5r-card n5r-right-card"><h3>Hồ sơ nhân vật</h3>'+companions(sc)+'</section>'+
 '<section class="n5r-card n5r-right-card"><h3>Bối cảnh tình huống</h3>'+placeCard(sc)+'</section>'+
 '<section class="n5r-card n5r-right-card"><h3>Hướng dẫn học</h3>'+
 '<p>Nghe một lần không nhìn nghĩa. Lần hai đọc theo câu. Sau cùng thử trả lời và tự thay thông tin.</p>'+
 '<p class="n5r-micro-note">Âm thanh là giọng tổng hợp ja-JP của thiết bị, không phải bản thu người bản ngữ.</p></section></div></div></div>';
}
function contentPage(){
 const tabs=[['vocab','Từ vựng'],['grammar','Ngữ pháp'],['examples','Mẫu câu'],['reading','Đọc hiểu'],['listening','Nghe hiểu']];
 const tab=tabs.some(x=>x[0]===prefs.tab)?prefs.tab:'vocab';
 let body='';
 if(tab==='vocab')body='<div class="n5r-study-title"><h2>30 từ vựng trọng tâm</h2>'+
 '<span>Chọn từ để nghe và ghi nhớ theo ngữ cảnh.</span></div>'+
 '<div class="n5r-vocab-table"><div class="n5r-vocab-row n5r-vocab-heading"><b>STT</b><b>Từ Nhật</b><b>Đọc</b><b>Nghĩa tiếng Việt</b><b>Ví dụ</b><b>Nghe</b></div>'+
 (DATA.vocab||[]).map((v,i)=>'<div class="n5r-vocab-row"><span>'+(i+1)+'</span>'+
 '<strong lang="ja">'+esc(v.jp)+'</strong><span lang="ja">'+esc(v.kana)+'</span>'+
 '<span>'+esc(v.vi)+'</span><small lang="ja">'+esc(v.sample)+'</small>'+
 '<button type="button" data-say="'+esc(v.jp)+'" aria-label="Nghe '+esc(v.jp)+'">'+mark('sound')+'</button></div>').join('')+'</div>';
 if(tab==='grammar')body='<div class="n5r-study-title"><h2>6 điểm ngữ pháp</h2><span>Mẫu câu, cách dùng, ví dụ và những lỗi thường gặp.</span></div>'+
 '<div class="n5r-grammar-list">'+(DATA.grammar||[]).map((g,i)=>
 '<details class="n5r-grammar"'+(i===0?' open':'')+'><summary><span>'+String(i+1).padStart(2,'0')+'</span>'+
 '<strong lang="ja">'+esc(g.title)+'</strong><em>'+esc(g.meaning)+'</em></summary>'+
 '<div><p>'+esc(g.explain)+'</p><blockquote lang="ja">'+esc(g.example)+'</blockquote>'+
 '<small>'+esc(g.translation)+'</small><p class="n5r-caution">Lưu ý: '+esc(g.caution)+'</p></div></details>').join('')+'</div>';
 if(tab==='examples')body='<div class="n5r-study-title"><h2>Mẫu câu sử dụng ngay</h2>'+
 '<span>Đọc rồi đổi tên, công việc và quốc tịch thành thông tin của bạn.</span></div>'+
 '<div class="n5r-examples">'+(DATA.grammar||[]).map((g,i)=>'<article>'+
 '<span>0'+(i+1)+'</span><div><strong lang="ja">'+esc(g.example)+'</strong><p>'+esc(g.translation)+'</p>'+
 '<small>'+esc(g.meaning)+'</small></div><button type="button" data-say="'+esc(g.example)+'">'+mark('sound')+'</button></article>').join('')+'</div>';
 if(tab==='reading')body='<div class="n5r-study-title"><h2>Đọc hiểu · '+esc(DATA.reading?.title)+'</h2>'+
 '<span>Đọc tìm thông tin, không cần dịch từng chữ.</span></div>'+
 '<article class="n5r-reading">'+(DATA.reading?.paragraphs||[]).map(p=>
 '<p lang="ja">'+esc(p)+'</p>').join('')+'<details><summary>Xem gợi ý tiếng Việt</summary>'+
 '<p>'+esc(DATA.reading?.gloss)+'</p></details></article>'+
 '<div class="n5r-practice-prompt"><h3>Kiểm tra sau khi đọc</h3><p>Ai là giáo viên? Ai là sinh viên? Có ai không phải kỹ sư?</p>'+
 button('Luyện câu đọc hiểu →',ROUTES.practice)+'</div>';
 if(tab==='listening')body='<div class="n5r-study-title"><h2>Nghe hiểu · 3 hội thoại</h2>'+
 '<span>Giọng tổng hợp của thiết bị, phát theo yêu cầu.</span></div>'+
 '<div class="n5r-listen-grid">'+(DATA.listening||[]).map((t,i)=>
 '<section><strong>0'+(i+1)+' · '+esc(t.title)+'</strong><p>'+esc(t.question)+'</p>'+
 '<button type="button" data-say="'+esc(t.jp)+'">'+mark('sound')+' Phát hội thoại</button>'+
 '<details><summary>Xem Script & nghĩa</summary><p lang="ja">'+esc(t.jp)+'</p>'+
 '<small>'+esc(t.vi)+'</small></details></section>').join('')+'</div>';
 return '<div class="n5r-page">'+hero('Bài 01 · Nội dung & tra cứu',
 'Từ vựng, ngữ pháp, mẫu câu, đọc hiểu và nghe hiểu đều liên kết với các tình huống trong bài.','LESSON 01 · KNOWLEDGE','n5r-lesson-hero')+
 lessonSteps('content')+'<div class="n5r-two-main"><div class="n5r-main-stack">'+
 '<nav class="n5r-study-tabs" aria-label="Kiến thức Bài 01">'+tabs.map(a=>
 '<button type="button" data-tab="'+a[0]+'" class="'+(tab===a[0]?'active':'')+'" aria-pressed="'+(tab===a[0])+'">'+esc(a[1])+'</button>').join('')+'</nav>'+
 '<section class="n5r-card n5r-study-content">'+body+'</section>'+
 '<div class="n5r-page-actions">'+button('← Quay lại tình huống',ROUTES.story,'outline')+
 button('Luyện tập kiến thức →',ROUTES.practice)+'</div></div>'+
 '<div class="n5r-context-stack"><section class="n5r-card n5r-right-card"><h3>Nhân vật & hội thoại liên quan</h3>'+
 companions(scene())+'</section><section class="n5r-card n5r-right-card"><h3>Thứ tự học gợi ý</h3>'+
 '<ol class="n5r-ordered"><li>Hiểu bối cảnh và hội thoại.</li><li>Học từ mới trong chính câu đó.</li>'+
 '<li>Thử thay từ, tự nói một câu.</li><li>Đọc/nghe rồi luyện không nhìn đáp án.</li></ol></section></div></div></div>';
}
function runner(kind){
 const run=LEARNER?.session?.();
 if(!run||run.kind!==kind)return null;return run;
}
function quizPage(kind){
 const isCheck=kind==='check',run=runner(kind);
 const total=isCheck?DATA.exam?.length||20:DATA.practice?.length||16;
 if(run?.finished)return resultPage();
 if(!run)return '<div class="n5r-page">'+hero('Bài 01 · '+(isCheck?'Kiểm tra':'Luyện tập'),
 isCheck?'Đánh giá độc lập các nhóm kiến thức trước khi quyết định hoàn thành.':
 'Luyện áp dụng từ vựng, ngữ pháp, đọc và nghe với giải thích sau từng câu.','LESSON 01 · '+(isCheck?'CHECK':'PRACTICE'),'n5r-lesson-hero')+
 lessonSteps(isCheck?'check':'practice')+
 '<div class="n5r-two-main"><div class="n5r-main-stack"><section class="n5r-card n5r-start">'+
 '<span class="n5r-kicker">'+(isCheck?'KIỂM TRA KIẾN THỨC':'LUYỆN TẬP CÓ HƯỚNG DẪN')+'</span>'+
 '<h2>'+(isCheck?'Sẵn sàng kiểm tra Bài 01?':'Luyện để nhớ và dùng được')+'</h2>'+
 '<p>'+(isCheck?'Đáp án chỉ công bố sau khi nộp. Phải đạt tổng điểm và tối thiểu 2/3 câu nghe đúng cùng âm thanh được xác nhận.':
 'Trả lời theo câu hỏi, nhận giải thích rồi quay lại đúng ngữ cảnh nếu cần.')+'</p>'+
 '<div class="n5r-pills">'+chip(total+' câu')+chip('4 nhóm kiến thức')+
 chip('Không giới hạn thời gian')+chip('TTS trên thiết bị')+'</div>'+
 '<button class="n5r-button n5r-button-primary" type="button" data-start="'+kind+'">Bắt đầu '+(isCheck?'kiểm tra':'luyện')+' →</button>'+
 '</section></div>'+right('Gợi ý trước khi bắt đầu',
 '<p>Đọc lại câu trọng tâm và nghe đoạn hội thoại mà bạn còn thấy khó. Điểm luyện khác điểm kiểm tra.</p>'+
 button('Xem kiến thức Bài 01',ROUTES.content,'outline'))+'</div></div>';
 const q=run.questions[run.index],answered=run.answers[run.index]!==undefined,a=run.answers[run.index],
  heard=!!run.heard[run.index],track=DATA.listening?.find(x=>x.id===q.context);
 return '<div class="n5r-page">'+hero('Bài 01 · '+(isCheck?'Kiểm tra':'Luyện tập'),
 'Mỗi câu một nhiệm vụ. Sau khi trả lời, bạn sẽ biết nên xem lại kiến thức nào.', 'LESSON 01 · '+(isCheck?'CHECK':'PRACTICE'),'n5r-lesson-hero')+
 lessonSteps(isCheck?'check':'practice')+'<div class="n5r-two-main"><div class="n5r-main-stack">'+
 '<section class="n5r-card n5r-question">'+
 '<div class="n5r-q-header"><span>'+esc(q.type==='grammar'?'Ngữ pháp':q.type==='vocab'?'Từ vựng':q.type==='reading'?'Đọc hiểu':'Nghe hiểu')+
 '</span><strong>Câu '+(run.index+1)+'/'+run.questions.length+'</strong></div>'+
 '<div class="n5r-progress-bar"><span style="width:'+Math.round((run.index)/run.questions.length*100)+'%"></span></div>'+
 '<h2>'+esc(q.prompt)+'</h2>'+
 (q.type==='reading'?'<details class="n5r-reading-small"><summary>Xem đoạn đọc liên quan</summary><div lang="ja">'+
 (DATA.reading?.paragraphs||[]).map(x=>'<p>'+esc(x)+'</p>').join('')+'</div></details>':'')+
 (q.type==='listening'?'<div class="n5r-audio-task">'+
 '<button type="button" data-play-question="1">'+mark('sound')+' Nghe hội thoại</button>'+
 '<span>'+(heard?'✓ Đã bắt đầu phát âm thanh':'Nghe trước khi chọn đáp án')+'</span>'+
 (!window.speechSynthesis?'<small>Thiết bị chưa hỗ trợ phát giọng Nhật; kết quả nghe sẽ chưa được xác nhận.</small>':'')+
 (!isCheck?'<details><summary>Xem lời thoại khi luyện</summary><p lang="ja">'+esc(track?.jp||'')+'</p></details>':'')+'</div>':'')+
 '<div class="n5r-q-choices">'+q.options.map((x,i)=>
 '<button type="button" data-answer="'+i+'"'+(answered?' disabled':'')+' class="'+(answered&&a?.choice===i?'selected ':'')+
 (answered&&!isCheck&&i===q.correct?'correct':'')+'"><span>'+String.fromCharCode(65+i)+'</span>'+esc(x)+'</button>').join('')+'</div>'+
 (answered?'<div class="n5r-feedback '+(!isCheck?(a?.correct?'good':'needs'):'')+'">'+
 '<strong>'+ (isCheck?'Đã ghi nhận câu trả lời':a?.correct?'✓ Chính xác':'Chưa đúng')+'</strong>'+
 '<p>'+(isCheck?'Đáp án và giải thích xuất hiện sau khi nộp.':esc(q.why))+'</p>'+
 '<button type="button" class="n5r-button n5r-button-primary" data-q-next="1">'+
 (run.index+1===run.questions.length?'Xem kết quả →':'Câu tiếp theo →')+'</button></div>':'')+
 '</section></div>'+right('Gợi ý khi làm bài',
 '<p>Làm từng câu và kiểm tra ý chính. Với câu nghe, bấm phát trước khi trả lời. Khi luyện sai bạn có thể mở lại tình huống liên quan.</p>'+
 (!isCheck?button('Xem lại tình huống',ROUTES.story,'outline'):'<p>Chế độ kiểm tra không cung cấp đáp án giữa bài.</p>'))+'</div></div>';
}
function resultPage(){
 const st=status(),runs=(records().attempts||[]).filter(x=>x.kind==='check');
 const last=runs.at(-1)||null,has=!!last;
 const detail=has?'<div class="n5r-result-big"><strong>'+last.percent+'<small>%</small></strong>'+
 '<p>'+last.correct+'/'+last.total+' câu đúng · '+new Date(last.completedAt).toLocaleDateString('vi-VN')+'</p></div>':
 '<div class="n5r-result-empty"><strong>Chưa có lượt kiểm tra</strong><p>Hãy học, luyện và làm bài kiểm tra để xem phân tích đúng theo dữ liệu thật.</p></div>';
 const skills=has?Object.entries(last.byType||{}).map(([k,v])=>{
 const names={vocab:'Từ vựng',grammar:'Ngữ pháp',reading:'Đọc hiểu',listening:'Nghe hiểu'};
 const val=Math.round(v.correct/v.total*100);
 return '<div class="n5r-skill-meter"><span>'+esc(names[k]||k)+'</span><div class="n5r-progress-bar"><span style="width:'+val+'%"></span></div>'+
 '<strong>'+v.correct+'/'+v.total+'</strong></div>';
 }).join(''):'';
 const due=has?last.wrongIds?.length||0:0;
 return '<div class="n5r-page">'+hero('Bài 01 · Kết quả & ôn tập',
 'Kết quả thật của hồ sơ đang học. Từ lỗi sai đến gợi ý ôn tập và bài tiếp theo.','LESSON 01 · RESULTS','n5r-lesson-hero')+
 lessonSteps('result')+'<div class="n5r-two-main"><div class="n5r-main-stack">'+
 '<div class="n5r-double"><section class="n5r-card n5r-score-result"><h3>Kết quả kiểm tra</h3>'+detail+
 (st.complete?chip('✓ Đã hoàn thành Bài 01','good'):chip('Chưa đủ điều kiện hoàn thành'))+
 '<p class="n5r-muted">Điều kiện: luyện ≥80%, kiểm tra ≥80%, nghe đúng ≥2/3 và xác nhận phát âm thanh.</p></section>'+
 '<section class="n5r-card"><h3>Phân tích theo nhóm kiến thức</h3>'+skills+
 (!has?'<p class="n5r-muted">Chưa có dữ liệu để phân tích.</p>':'')+'</section></div>'+
 '<section class="n5r-card">'+sectionTitle('NEXT BEST ACTION','Gợi ý học tiếp',
 'Dựa trên lịch sử bài kiểm tra, không tự tạo điểm hoặc chứng nhận ghi nhớ lâu dài.')+
 '<div class="n5r-recommendation">'+
 (due?'<p>Có '+due+' câu sai trong lần kiểm tra gần nhất. Hãy xem lại câu và tình huống liên quan.</p>':
 '<p>'+(has?'Lần kiểm tra gần nhất không có câu sai. Hãy ôn lại sau một thời gian để xác nhận trí nhớ.':
 'Hoàn thành phần Luyện và Kiểm tra để nhận gợi ý cá nhân hóa.')+'</p>')+
 '<div>'+button('Ôn lại kiến thức',ROUTES.review)+button('Làm lại bài kiểm tra',ROUTES.check,'outline')+'</div></div></section>'+
 '<section class="n5r-card n5r-unreleased-note"><h3>Bài 02 · これ・それ・あれ</h3>'+
 '<p>Bài 02 chưa đủ nội dung chuẩn Minna no Nihongo. Có thể xem bản mẫu nhưng chưa mở khóa học chính thức.</p>'+
 '<a href="#lesson/n5-demonstratives">Xem bản mẫu Bài 02 →</a></section></div>'+
 '<div class="n5r-context-stack"><section class="n5r-card n5r-right-card"><h3>Đồng hành cùng bạn</h3>'+
 companions(scene())+'<p>Khi ôn lại, hãy thử nói tự nhiên với những nhân vật quen thuộc.</p></section>'+
 '<section class="n5r-card n5r-right-card"><h3>Hành động tiếp theo</h3>'+
 '<ol class="n5r-ordered"><li>Xem lỗi sai và điểm cần cải thiện.</li><li>Luyện lại câu trong tình huống thật.</li>'+
 '<li>Ôn lại vào ngày khác để giữ kiến thức.</li></ol></section></div></div></div>';
}
function reviewPage(){
 const a=records().attempts||[],last=a.at(-1);
 const map=new Map([...(DATA.practice||[]),...(DATA.exam||[])].map(x=>[x.id,x]));
 const errors=(last?.wrongIds||[]).map(id=>map.get(id)).filter(Boolean);
 return '<div class="n5r-page">'+hero('Bài 01 · Ôn lại thông minh',
 'Luyện tập dựa trên lỗi đã gặp, nhưng không biến một lần đạt thành khẳng định nhớ lâu.','LESSON 01 · REVIEW','n5r-lesson-hero')+
 lessonSteps('result')+'<section class="n5r-card">'+sectionTitle('MY REVIEW','Điểm cần củng cố',
 'Được lấy từ lượt làm gần đây nhất và giữ lịch sử cho từng hồ sơ.')+
 (errors.length?'<div class="n5r-review-list">'+errors.map(q=>
 '<article><strong>'+esc(q.prompt)+'</strong><p>'+esc(q.why)+'</p><a href="'+ROUTES.content+'">Mở tra cứu →</a></article>').join('')+'</div>':
 '<p class="n5r-muted">Chưa có câu sai trong lượt gần nhất hoặc bạn chưa thực hiện lượt luyện/kiểm tra.</p>')+
 '<div class="n5r-page-actions">'+button('Luyện thêm',ROUTES.practice)+button('Về kết quả',ROUTES.result,'outline')+'</div></section></div>';
}
function libraryPage(){
 const filtered=people().filter(p=>(prefs.filter==='all'||p.group===prefs.filter)&&
 [p.jp,p.vi,p.reading,p.job,p.nationality,p.organization].join(' ').toLocaleLowerCase().includes(prefs.search.toLocaleLowerCase()));
 return '<div class="n5r-page">'+hero('Thư viện nhân vật đồng hành',
 '30 nhân vật hư cấu, đa ngành nghề và quốc tịch. Tìm hồ sơ và xem những tình huống họ tham gia.', 'CHARACTER WORLD','n5r-lesson-hero')+
 '<div class="n5r-two-main"><div class="n5r-main-stack"><section class="n5r-card n5r-library">'+
 '<div class="n5r-library-filters"><label>Tìm nhân vật<input data-search="1" type="search" value="'+esc(prefs.search)+
 '" placeholder="Tên, quốc tịch, nghề nghiệp..."/></label><div>'+
 [['all','Tất cả'],['work','Công việc'],['school','Trường học'],['life','Đời sống']].map(x=>
 '<button type="button" data-filter="'+x[0]+'" class="'+(prefs.filter===x[0]?'active':'')+'">'+x[1]+'</button>').join('')+'</div></div>'+
 '<p class="n5r-muted">Đang hiển thị '+filtered.length+'/'+people().length+' nhân vật. Ảnh chưa được duyệt hiển thị ký hiệu tên thay vì chân dung SVG cũ.</p>'+
 '<div class="n5r-library-grid">'+filtered.map(p=>
 '<button type="button" class="n5r-library-person" data-person="'+esc(p.id)+'">'+portrait(p.id,'m')+
 '<span><strong>'+esc(p.jp)+'</strong><small>'+esc(p.vi||p.reading)+'</small>'+
 '<em>'+esc(p.nationality||'')+' · '+esc(p.job||'')+'</em></span></button>').join('')+'</div></section></div>'+
 '<div class="n5r-context-stack"><section class="n5r-card n5r-right-card"><h3>Nhân vật & cách sử dụng</h3>'+
 '<p>Chọn nhân vật để xem nghề nghiệp, cách xưng hô và câu chuyện. Không suy đoán tính cách dựa trên quốc tịch.</p>'+
 '<p class="n5r-micro-note">Dữ liệu truyện là hư cấu; không mô tả người hoặc doanh nghiệp thật.</p></section>'+
 '<section class="n5r-card n5r-right-card"><h3>Về lại bài học</h3>'+
 button('Bài 01 · Hội thoại',ROUTES.story,'outline')+'</section></div></div></div>';
}
function contextsPage(){
 const groups=Object.values(SCENES.reduce((acc,s)=>{
 const key=s.place||s.location||'Không gian giao tiếp';
 (acc[key]??=[]).push(s);return acc;},{}));
 return '<div class="n5r-page">'+hero('Thư viện bối cảnh',
 'Gặp gỡ ở lớp, văn phòng, khách sạn và các không gian quen thuộc. Mỗi bối cảnh liên kết tới hội thoại có thật.','STORY CONTEXTS','n5r-lesson-hero')+
 '<section class="n5r-card"><div class="n5r-context-gallery">'+groups.map((items,i)=>
 '<article><div class="n5r-setting-art setting-'+(i%4)+'" aria-hidden="true"></div>'+
 '<h2>'+esc(items[0].place||items[0].location)+'</h2><p>'+esc(items[0].situation)+'</p>'+
 '<button type="button" data-scene="'+esc(items[0].id)+'">Học tình huống →</button></article>').join('')+'</div></section></div>';
}
function page(){
 sync();const r=currentRoute();
 if(r==='course/N5')return stagePage();
 if(r==='course/N5/lesson/01/overview'||r==='course/N5/lesson/01')return lessonOverview();
 if(r==='course/N5/lesson/01/story')return storyPage();
 if(r==='course/N5/lesson/01/content')return contentPage();
 if(r==='course/N5/lesson/01/practice')return quizPage('practice');
 if(r==='course/N5/lesson/01/check')return quizPage('check');
 if(r==='course/N5/lesson/01/result')return resultPage();
 if(r==='course/N5/lesson/01/review')return reviewPage();
 if(r==='course/N5/characters')return libraryPage();
 if(r==='course/N5/contexts')return contextsPage();
 return lessonOverview();
}
const oldCourse=coursePage,oldShell=shell;
coursePage=function(id){return id==='N5'?page():oldCourse(id)};
shell=function(content){return /^course\/N5(?:\/|$)/.test(currentRoute())?frame(content):oldShell(content)};
function redraw(){if(typeof render==='function')render(false)}
function goScene(id){if(!SCENES.some(x=>x.id===id))return;prefs.scene=id;save();
 if(location.hash!==ROUTES.story)location.hash=ROUTES.story;else redraw()}
function openContent(id){prefs.tab=id;save();if(location.hash!==ROUTES.content)location.hash=ROUTES.content;else redraw()}
function speak(txt,onstart){
 if(!window.speechSynthesis||!window.SpeechSynthesisUtterance){
  audioState='Không có giọng tổng hợp ja-JP trên thiết bị này.';redraw();return false;}
 try{window.speechSynthesis.cancel();const u=new window.SpeechSynthesisUtterance(txt);
 u.lang='ja-JP';u.rate=voiceSpeed;u.onstart=()=>{audioState='Đang phát tiếng Nhật.';onstart?.();};
 u.onerror=()=>{audioState='Không thể phát âm thanh; phần nghe chưa được xác nhận.';redraw()};
 const voice=(window.speechSynthesis.getVoices?.()||[]).find(v=>v.lang?.toLowerCase().startsWith('ja'));
 if(voice)u.voice=voice;window.speechSynthesis.speak(u);return true;
 }catch{audioState='Không thể phát giọng Nhật trên thiết bị.';redraw();return false}
}
function profile(id){
 const p=person(id);if(!p)return;
 const lines=[
 ['Tên Nhật',p.jp],['Cách đọc',p.reading],['Quốc tịch',p.nationality],['Nghề nghiệp',p.job],
 ['Đơn vị',p.organization],['Giao tiếp',p.voice],['Vai trò',p.bio]];
 const html='<div class="n5r-modal-heading">'+portrait(p.id,'l')+'<div><span class="n5r-kicker">NHÂN VẬT HƯ CẤU</span>'+
 '<h2>'+esc(p.jp)+'</h2><p>'+esc(p.vi||p.reading)+'</p></div></div>'+
 '<dl class="n5r-profile-details">'+lines.filter(x=>x[1]).map(x=>
 '<div><dt>'+x[0]+'</dt><dd>'+esc(x[1])+'</dd></div>').join('')+'</dl>'+
 '<h3>Xuất hiện trong</h3><div class="n5r-profile-scenes">'+SCENES.filter(x=>x.dialogue.some(d=>d.who===id)).map(sc=>
 '<button type="button" data-scene="'+esc(sc.id)+'">'+esc(sc.title)+' →</button>').join('')+'</div>'+
 '<p class="n5r-muted">Thông tin nhân vật hoàn toàn hư cấu và nhằm tạo ngữ cảnh học tiếng Nhật.</p>';
 const d=document.querySelector?.('#n5r-dialog');if(!d)return;
 d.innerHTML='<form method="dialog"><button class="n5r-dialog-close" aria-label="Đóng hồ sơ" type="submit">×</button></form>'+html;
 modalChar=id;d.showModal?.();
}
function note(term){
 const notes={ 'はじめまして':['Rất vui được gặp lần đầu','Dùng khi lần đầu gặp người khác.'],
 'よろしくおねがいします':['Rất mong được giúp đỡ','Lời chào lịch sự mang sắc thái hợp tác lâu dài.'],
 'じゃありません':['không phải','Dùng để phủ định danh từ; tránh thêm です sau đó.'],
 'ですか':['phải không?','Câu hỏi lịch sự với か ở cuối.'],
 'も':['cũng','Không viết はも cùng một vị trí trợ từ.']};
 const t=notes[term]||['Từ / cụm cần chú ý','Xem phần Ngữ pháp để học thêm.'];
 const d=document.querySelector?.('#n5r-dialog');if(!d)return;
 d.innerHTML='<form method="dialog"><button class="n5r-dialog-close" aria-label="Đóng giải thích" type="submit">×</button></form>'+
 '<span class="n5r-kicker">GHI CHÚ NGỮ CẢNH</span><h2 lang="ja">'+esc(term)+'</h2>'+
 '<h3>'+esc(t[0])+'</h3><p>'+esc(t[1])+'</p>'+
 '<button type="button" class="n5r-button n5r-button-outline" data-open-content="grammar">Mở phần Ngữ pháp →</button>';
 d.showModal?.();
}
function qNext(){
 const s=LEARNER?.session?.();if(!s||s.finished||s.answers[s.index]===undefined)return;
 if(s.index===s.questions.length-1){
  LEARNER.finish();location.hash=ROUTES.result;
 }else{s.index++;redraw()}
}
document.addEventListener('click',e=>{
 if(!document.querySelector?.('.n5r-shell'))return;
 const t=e.target,hit=sel=>t.closest?.(sel);
 let el=hit('[data-scene]');if(el){e.preventDefault();document.querySelector?.('#n5r-dialog')?.close?.();goScene(el.dataset.scene);return}
 el=hit('[data-next-scene]');if(el){e.preventDefault();goScene(el.dataset.nextScene);return}
 el=hit('[data-tab],[data-lookup],[data-open-content]');if(el){e.preventDefault();
 document.querySelector?.('#n5r-dialog')?.close?.();
 openContent(el.dataset.tab||el.dataset.lookup||el.dataset.openContent);return}
 el=hit('[data-person]');if(el){e.preventDefault();profile(el.dataset.person);return}
 el=hit('[data-note]');if(el){e.preventDefault();note(el.dataset.note);return}
 el=hit('[data-translation]');if(el){prefs.showTranslation=!prefs.showTranslation;save();redraw();return}
 el=hit('[data-play-line]');if(el){const line=scene()?.dialogue?.[Number(el.dataset.playLine)];if(line)speak(line.jp);return}
 el=hit('[data-play-all]');if(el){speak(scene()?.dialogue?.map(x=>x.jp).join('　')||'');return}
 el=hit('[data-say]');if(el){speak(el.dataset.say);return}
 el=hit('[data-scene-answer]');if(el){const index=Number(el.dataset.sceneAnswer),s=scene();if(!s)return;
 LEARNER?.chooseSceneAnswer?.(s.id,index);activeGuidedChoice[user()+':'+s.id]=index;redraw();return}
 el=hit('[data-retry-scene]');if(el){delete activeGuidedChoice[user()+':'+scene()?.id];redraw();return}
 el=hit('[data-sub]');if(el){const s=scene();const ok=LEARNER?.substitution?.(s.id,Number(el.dataset.sub));
 audioState=ok?'Đúng, bạn đã thay từ phù hợp.':'Chưa đúng, xem lại ý nghĩa câu.';redraw();return}
 el=hit('[data-model]');if(el){noteOpen=noteOpen==='model'?null:'model';redraw();return}
 el=hit('[data-start]');if(el){LEARNER?.start?.(el.dataset.start);redraw();return}
 el=hit('[data-answer]');if(el){LEARNER?.answer?.(Number(el.dataset.answer));redraw();return}
 el=hit('[data-q-next]');if(el){qNext();return}
 el=hit('[data-play-question]');if(el){const run=LEARNER?.session?.(),q=run?.questions?.[run.index];
 const t=DATA.listening?.find(x=>x.id===q?.context);if(!run||!t)return;
 const index=run.index;speak(t.jp,()=>{if(run.index===index)run.heard[index]=true});return}
 el=hit('[data-filter]');if(el){prefs.filter=el.dataset.filter;save();redraw();return}
});
document.addEventListener('input',e=>{
 if(!document.querySelector?.('.n5r-shell'))return;
 const x=e.target;
 if(x.matches?.('[data-search]')){prefs.search=x.value;save();
 document.querySelectorAll?.('.n5r-library-person').forEach(n=>{
 const id=n.dataset.person;const p=person(id);const ok=(prefs.filter==='all'||p?.group===prefs.filter)&&
 [p.jp,p.vi,p.reading,p.job,p.nationality,p.organization].join(' ').toLocaleLowerCase().includes(prefs.search.toLocaleLowerCase());
 n.hidden=!ok;});}
});
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&document.querySelector?.('#n5r-dialog')?.open)document.querySelector('#n5r-dialog').close();
});
const originalFrame=shell;shell=function(html){
 if(!/^course\/N5(?:\/|$)/.test(currentRoute()))return oldShell(html);
 return originalFrame(html).replace('</div></div><nav class="n5r-bottom"',
 '<dialog class="n5r-dialog" id="n5r-dialog" aria-label="Hồ sơ nhân vật hoặc giải thích"></dialog></div></div><nav class="n5r-bottom"');
};
window.HorizonN5V2=Object.freeze({version:'2.00',routes:ROUTES,page,frame,stagePage,lessonOverview,
 storyPage,contentPage,quizPage,resultPage,reviewPage,libraryPage,contextsPage,
 people,scenes:()=>SCENES,goScene,openContent,sync,readView:()=>({...prefs}),status});
})();
