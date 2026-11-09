/* HORIZON N5 Gold UI v1.49 — presentation layer only.
   Works with existing lesson engine / 25-lesson outline / canonical fictional cast.
   Never creates progress, overwrites attempts, or opens unimplemented lessons.
*/
(function(){
'use strict';
const W=window.NPN5CharacterWorld,DATA=window.NPN5Lesson01Data,SCENES=window.NPN5Lesson01Scenes?.scenes||[];
const routeLesson='#course/N5/lesson/01',routeOverview=routeLesson+'/overview';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const url=()=>decodeURIComponent(location.hash.replace(/^#\/?/,''));
let libraryGroup='all',librarySearch='',selectedPerson='keiko',modalPerson=null;
function learner(){return window.NPN5Lesson01||null}
function status(){return learner()?.status?.()||{practice:false,check:false,complete:false,practiceBest:0,checkBest:0,practiceCount:0,checkCount:0}}
function counts(){
 const data=learner()?.read?.()||{},worked=data.scenePractice||{};
 return {completed:SCENES.filter(x=>worked[x.id]?.attempts>0).length,scenePractice:worked};
}
function sceneAt(){
 const id=learner()?.currentScene?.()?.id;
 return SCENES.find(x=>x.id===id)||SCENES[0]||null;
}
function groupNames(){
 return [{id:'all',title:'Tất cả'},{id:'work',title:'Công việc'},{id:'school',title:'Trường học'},{id:'life',title:'Đời sống'}];
}
function portrait(id,caption=''){
 return '<img src="'+esc(W?.portrait?.(id)||'')+'" alt="'+esc(caption||('Chân dung minh họa '+id))+'" loading="lazy"/>';
}
function crumb(items){
 return '<nav class="n5g-crumb" aria-label="Vị trí trong khóa học">'+
 '<a href="#learn/catalog">Khóa học</a><span>›</span>'+
 '<a href="#course/N5">Minna no Nihongo N5</a>'+
 items.map(x=>'<span>›</span><span>'+esc(x)+'</span>').join('')+'</nav>';
}
function brandCard(){
 return '<div class="n5g-brand-card"><span class="n5g-brand-badge">日本語 · N5</span>'+
 '<strong>Minna no Nihongo</strong><small>Sơ cấp I · Bài 01–25</small>'+
 '<span class="n5g-brand-sub">Một bài học · Nhiều cách vận dụng</span></div>';
}
function courseNav(current='course'){
 const links=[['#course/N5','Lộ trình 25 bài','roadmap'],[routeOverview,'Tổng quan Bài 01','overview'],
  [routeLesson,'Học Bài 01','lesson'],['#course/N5/characters','Thư viện nhân vật','characters']];
 return '<nav class="n5g-course-nav" aria-label="Điều hướng N5">'+
 links.map(([href,label,id])=>'<a href="'+href+'" class="'+(current===id?'is-active':'')+'">'+esc(label)+
 (current===id?'<span aria-hidden="true">●</span>':'')+'</a>').join('')+
 '</nav>';
}
function coursePanel(current='course'){
 return '<aside class="n5g-course-side">'+brandCard()+courseNav(current)+
  '<div class="n5g-help-card"><strong>Hướng học hợp lý</strong>'+
  '<p>Học ngữ cảnh → Luyện áp dụng → Kiểm tra độc lập → Ôn lại. Bạn có thể mở từ vựng hoặc hồ sơ nhân vật ngay khi cần.</p></div></aside>';
}
function percent(n,total){return total?Math.round(n/total*100):0}
function scoreCard(){
 const x=status(),c=counts();
 return '<section class="n5g-scorecard"><header><strong>Tiến độ Bài 01</strong>'+
  '<span class="'+(x.complete?'n5g-complete':'n5g-pending')+'">'+(x.complete?'✓ Đã hoàn thành':'Đang học')+'</span></header>'+
  '<div class="n5g-meter"><span style="width:'+percent(c.completed,SCENES.length)+'%"></span></div>'+
  '<p>'+c.completed+'/'+SCENES.length+' tình huống đã thực hành</p>'+
  '<div class="n5g-score-row"><span>Luyện</span><strong>'+(x.practiceCount?x.practiceBest+'%':'Chưa làm')+'</strong></div>'+
  '<div class="n5g-score-row"><span>Kiểm tra</span><strong>'+(x.checkCount?x.checkBest+'%':'Chưa làm')+'</strong></div>'+
  '<small>Tiến độ theo hồ sơ đang sử dụng; không phải điểm JLPT.</small></section>';
}
function personTile(c,compact=false){
 return '<button type="button" class="n5g-person'+(compact?' is-compact':'')+'" data-n5g-profile="'+esc(c.id)+'" data-n5g-tags="'+esc([c.vi,c.jp,c.reading,c.nationality,c.job,c.organization,c.group].join(' ').toLocaleLowerCase())+'">'+
  portrait(c.id)+
  '<span><strong>'+esc(c.jp)+'</strong><small>'+esc(c.vi)+'</small>'+
  (compact?'':'<em>'+esc(c.nationality)+' · '+esc(c.job)+'</em>')+'</span></button>';
}
function companionPanel(scene){
 const cast=(scene?W?.sceneCast?.(scene):null)||[];
 const people=cast.length?cast:W?.characters?.().slice(0,4)||[];
 const org=scene?.place||'Nhiều môi trường học và làm việc';
 return '<section class="n5g-side-card n5g-companions"><header><h3>Nhân vật trong bài</h3>'+
  '<a href="#course/N5/characters">Xem tất cả</a></header>'+
  '<div class="n5g-small-cast">'+people.slice(0,4).map(c=>personTile(c,true)).join('')+'</div>'+
  '<p>Chạm vào nhân vật để xem nghề nghiệp, quốc tịch, cách nói và các tình huống liên quan.</p></section>'+
 '<section class="n5g-side-card n5g-context"><header><h3>Bối cảnh giao tiếp</h3></header>'+
  '<div class="n5g-context-illustration" role="img" aria-label="Minh họa phong cảnh Nhật Bản"></div>'+
  '<dl><div><dt>Môi trường</dt><dd>'+esc(org)+'</dd></div>'+
  '<div><dt>Tình huống</dt><dd>'+esc(scene?.situation||'Gặp gỡ, giới thiệu bản thân và trao đổi thông tin.')+'</dd></div>'+
  '<div><dt>Mục tiêu</dt><dd>'+esc(scene?.goal||'Giao tiếp cơ bản trong cuộc sống và học tập.')+'</dd></div></dl></section>';
}
function rightPanel(scene,withScore=true){
 return '<aside class="n5g-right">'+companionPanel(scene)+(withScore?scoreCard():'')+
 '<section class="n5g-side-card n5g-next-card"><h3>Gợi ý học tập</h3>'+
 '<p>Đọc bối cảnh trước, nghe không nhìn nghĩa rồi mới xem giải thích. Tự thử câu của bạn trước khi xem mẫu.</p>'+
 '<a href="#course/N5/characters">Khám phá thế giới nhân vật →</a></section></aside>';
}
function courseHero(){
 const s=status();
 return '<section class="n5g-course-hero"><div class="n5g-hero-copy"><span class="n5g-eyebrow">HORIZON · MINNA NO NIHONGO</span>'+
 '<h1>Học N5, từng bài một.</h1>'+
 '<p>25 bài theo 5 chặng. Mỗi bài kết nối nhân vật, hội thoại, từ vựng, ngữ pháp, đọc–nghe, luyện và kiểm tra.</p>'+
 '<div class="n5g-actions"><a class="n5g-primary" href="'+routeOverview+'">'+(s.complete?'Xem lại Bài 01':'Tiếp tục Bài 01')+' →</a>'+
 '<a class="n5g-secondary" href="#course/N5/characters">Thư viện nhân vật</a></div></div>'+
 '<span class="n5g-hero-seal">N5<small>25 bài</small></span></section>';
}
function stageRoadmap(){
 const stages=window.NPN5Path?.stages?.()||[];
 const lessonList=window.NPN5Path?.outline?.()||[];
 const completed=status().complete;
 return '<section class="n5g-roadmap"><header class="n5g-section-head"><div><span class="n5g-eyebrow">LEARNING PATH</span>'+
 '<h2>Lộ trình 25 bài</h2><p>Năm chặng gọn. Bài 01 có nội dung đang triển khai; các bài còn lại chỉ mở khi có dữ liệu thực.</p></div>'+
 '<span>05 chặng / 25 bài</span></header>'+
 stages.map((stage,i)=>{
 const items=lessonList.slice(i*5,(i+1)*5);
 return '<details class="n5g-stage"'+(i===0?' open':'')+'><summary><span class="n5g-stage-num">'+String(i+1).padStart(2,'0')+'</span>'+
 '<span><strong>'+esc(stage.title)+'</strong><small>Bài '+esc(stage.range)+'</small></span>'+
 '<span class="n5g-stage-chevron">⌄</span></summary>'+
 '<ol>'+items.map(item=>{
 const first=item.number===1,prototype=item.number===2;
 const href=first?routeOverview:prototype?'#lesson/n5-demonstratives':'';
 const state=first?(completed?'✓ Hoàn thành':'Đang phát triển'):prototype?'Bài mẫu':'Chưa phát hành';
 return '<li><span>'+String(item.number).padStart(2,'0')+'</span>'+
 '<div><strong>'+esc(item.title)+'</strong><small>'+state+'</small></div>'+
 (href?'<a href="'+href+'">'+(first?'Mở bài học':'Xem mẫu')+' →</a>':'<span class="n5g-disabled">Chưa mở</span>')+'</li>'
 }).join('')+'</ol></details>';
 }).join('')+'</section>';
}
function coursePageV149(){
 return '<div class="n5g-root" data-n5-gold="course">'+crumb([])+
 '<div class="n5g-grid"><div class="n5g-main">'+courseHero()+
 '<div class="n5g-course-intro"><span>01</span><div><strong>Bài 01 · はじめまして</strong>'+
 '<p>Giới thiệu, hỏi nghề nghiệp và quốc tịch; sáu tình huống, từ vựng, ngữ pháp, đọc và nghe.</p></div>'+
 '<a href="'+routeOverview+'">Mở tổng quan →</a></div>'+
 stageRoadmap()+'<div class="n5g-lower-grid">'+
 '<section class="n5g-side-card"><h3>Luyện theo kỹ năng</h3><p>Từ vựng · Ngữ pháp · Đọc hiểu · Nghe hiểu.</p><a href="'+routeLesson+'">Mở Bài 01 để luyện →</a></section>'+
 '<section class="n5g-side-card"><h3>Luyện đề JLPT</h3><p>Đề thử N5 hoàn chỉnh chưa phát hành. Không dùng điểm bài học như điểm JLPT.</p></section></div>'+
 '</div>'+rightPanel(null,true)+'</div></div>';
}
function objectiveList(){
 return ['Chào hỏi và giới thiệu tên, quốc tịch.','Hỏi nghề nghiệp và xác nhận thông tin.','Dùng は · も · の · か và さん đúng ngữ cảnh.',
  'Đọc, nghe và tự tạo câu ngắn khi gặp người mới.'];
}
function lessonOverview(){
 const c=counts(),s=status(),next=SCENES.find(x=>!c.scenePractice[x.id]?.attempts)||SCENES[0];
 return '<div class="n5g-root" data-n5-gold="overview">'+crumb(['Bài 01','Tổng quan'])+
 '<div class="n5g-grid"><div class="n5g-main"><header class="n5g-lesson-hero">'+
 '<span class="n5g-eyebrow">MINNA NO NIHONGO · LESSON 01</span><h1>Bài 01 · はじめまして</h1>'+
 '<h2>Làm quen và giới thiệu bản thân</h2><p>Đi qua các tình huống giao tiếp thường gặp để nói được những câu giới thiệu đơn giản, tự nhiên.</p>'+
 '<a class="n5g-primary" href="'+routeLesson+'" data-n5g-scene="'+esc(next.id)+'">'+
 (c.completed?'Tiếp tục tình huống '+String(SCENES.indexOf(next)+1).padStart(2,'0'):'Bắt đầu tình huống 01')+' →</a>'+
 '</header><div class="n5g-overview-head"><section class="n5g-side-card"><h3>Mục tiêu bài học</h3><ul class="n5g-checklist">'+
 objectiveList().map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></section>'+
 '<section class="n5g-side-card"><h3>Lộ trình một bài</h3><div class="n5g-four-steps">'+
 [['Học','Hội thoại & kiến thức'],['Luyện','Thử tình huống'],['Kiểm tra','Đánh giá riêng'],['Ôn','Xem lỗi và làm lại']].map((x,i)=>
 '<div><span>'+String(i+1).padStart(2,'0')+'</span><strong>'+x[0]+'</strong><small>'+x[1]+'</small></div>').join('')+
 '</div><p class="n5g-muted">Kết quả luyện/kiểm tra được lưu theo người học. Xem tình huống không tự tính hoàn thành bài.</p></section></div>'+
 '<section class="n5g-overview-scenes"><header class="n5g-section-head"><div><span class="n5g-eyebrow">STORY-BASED LEARNING</span><h2>Sáu tình huống của Bài 01</h2>'+
 '<p>Một câu chuyện xuyên suốt, nhân vật xuất hiện lại trong nhiều ngữ cảnh.</p></div><span>'+c.completed+'/6 đã thực hành</span></header>'+
 '<div class="n5g-scene-list">'+SCENES.map((scene,i)=>{
 const cast=W?.sceneCast?.(scene)||[];
 const did=!!c.scenePractice[scene.id]?.attempts;
 return '<button type="button" data-n5g-scene="'+esc(scene.id)+'" class="n5g-scene-card">'+
 '<span class="n5g-scene-portrait">'+(cast[0]?portrait(cast[0].id):'')+'</span>'+
 '<span><small>TÌNH HUỐNG '+String(i+1).padStart(2,'0')+'</small>'+
 '<strong>'+esc(scene.title)+'</strong><em>'+esc(scene.goal)+'</em></span>'+
 '<span class="n5g-scene-status">'+(did?'✓ Đã thử':'Bắt đầu →')+'</span></button>';
 }).join('')+'</div></section>'+
 '<section class="n5g-syllabus n5g-side-card"><h3>Nội dung học và tra cứu</h3>'+
 '<div class="n5g-syllabus-grid">'+[
 ['Từ vựng',DATA?.vocab?.length+' từ','vocab'],['Ngữ pháp',DATA?.grammar?.length+' điểm','grammar'],
 ['Đọc hiểu','1 bài đọc','reading'],['Nghe hiểu',DATA?.listening?.length+' hội thoại','listening']
 ].map(([title,num,id])=>'<button type="button" data-n5g-chapter="'+id+'"><strong>'+title+'</strong><small>'+num+'</small><span>Khám phá →</span></button>').join('')+
 '</div></section></div>'+rightPanel(SCENES[0],true)+'</div></div>';
}
function storyLibrary(){
 const cast=W?.characters?.()||[];
 const filtered=cast.filter(x=>libraryGroup==='all'||x.group===libraryGroup);
 const picked=cast.find(x=>x.id===selectedPerson)||cast[0];
 return '<div class="n5g-root" data-n5-gold="characters">'+crumb(['Thư viện nhân vật'])+
 '<header class="n5g-course-hero n5g-library-head"><span class="n5g-eyebrow">NHÂN VẬT ĐỒNG HÀNH</span>'+
 '<h1>Những con người trong câu chuyện.</h1>'+
 '<p>'+cast.length+' nhân vật hư cấu trong các môi trường khác nhau. Chạm để xem hồ sơ và các tình huống họ xuất hiện.</p>'+
 '<a class="n5g-secondary" href="'+routeOverview+'">← Về Bài 01</a></header>'+
 '<div class="n5g-grid n5g-library-layout"><div class="n5g-main"><section class="n5g-library-card"><div class="n5g-library-tools">'+
 '<label class="n5g-search-label">Tìm nhân vật<input type="search" data-n5g-search placeholder="Tên, nghề nghiệp, quốc tịch..." value="'+esc(librarySearch)+'"/></label>'+
 '<div class="n5g-filters">'+groupNames().map(g=>'<button type="button" class="'+(libraryGroup===g.id?'is-active':'')+'" data-n5g-group="'+g.id+'">'+g.title+'</button>').join('')+'</div></div>'+
 '<div class="n5g-people-grid">'+filtered.map(c=>personTile(c)).join('')+'</div>'+
 '<p class="n5g-library-foot">Nhân vật là hư cấu. Mỗi hồ sơ chỉ ghi nhận thông tin đã được biên soạn, không tự suy diễn tính cách từ quốc tịch.</p>'+
 '</section></div><aside class="n5g-right">'+
 (picked?'<section class="n5g-side-card n5g-selected"><h3>Nhân vật được chọn</h3>'+
 portrait(picked.id)+'<h4>'+esc(picked.jp)+'</h4><p>'+esc(picked.vi)+'</p>'+
 '<dl><div><dt>Quốc tịch</dt><dd>'+esc(picked.nationality)+'</dd></div>'+
 '<div><dt>Nghề nghiệp</dt><dd>'+esc(picked.job)+'</dd></div>'+
 '<div><dt>Đơn vị</dt><dd>'+esc(picked.organization)+'</dd></div>'+
 '<div><dt>Giao tiếp</dt><dd>'+esc(picked.voice)+'</dd></div></dl>'+
 '<button type="button" class="n5g-primary" data-n5g-show-profile="'+esc(picked.id)+'">Xem hồ sơ đầy đủ →</button></section>':'')+
 '<section class="n5g-side-card"><h3>Ứng dụng trong bài học</h3><p>Các nhân vật tái xuất hiện theo chủ đề, giúp nhớ từ vựng và mẫu câu trong hoàn cảnh cụ thể.</p>'+
 '<a href="'+routeLesson+'">Học tình huống Bài 01 →</a></section></aside></div>'+
 (modalPerson&&W?.profile?W.profile(modalPerson):'')+'</div>';
}
function lessonShell(content){
 const scene=sceneAt();
 return '<div class="n5g-root n5g-lesson-shell" data-n5-gold="lesson">'+crumb(['Bài 01'])+
 '<div class="n5g-lesson-toolbar"><a href="'+routeOverview+'">← Tổng quan Bài 01</a>'+
 '<a href="#course/N5/characters">Thư viện nhân vật ↗</a></div>'+
 '<div class="n5g-grid"><div class="n5g-main">'+content+'</div>'+rightPanel(scene,true)+'</div></div>';
}
const parent=coursePage;
coursePage=function(id){
 if(id!=='N5')return parent(id);
 const hash=url();
 if(hash==='course/N5')return coursePageV149();
 if(hash==='course/N5/lesson/01/overview')return lessonOverview();
 if(hash==='course/N5/characters')return storyLibrary();
 if(hash==='course/N5/lesson/01')return lessonShell(parent(id));
 return parent(id);
};
function redraw(){if(typeof render==='function')render(false)}
function goScene(id){
 if(!SCENES.some(x=>x.id===id))return;
 learner()?.openScene?.(id);
 if(location.hash!==routeLesson)location.hash=routeLesson;
 else redraw();
}
function goChapter(id){
 if(!['vocab','grammar','reading','listening'].includes(id))return;
 learner()?.select?.(id);
 if(location.hash!==routeLesson)location.hash=routeLesson;
 else redraw();
}
document.addEventListener('click',event=>{
 const area=document.querySelector?.('.n5g-root');
 if(!area)return;
 const target=event.target;
 const scene=target.closest?.('[data-n5g-scene]');
 if(scene){event.preventDefault();goScene(scene.dataset.n5gScene);return}
 const chapter=target.closest?.('[data-n5g-chapter]');
 if(chapter){event.preventDefault();goChapter(chapter.dataset.n5gChapter);return}
 const profile=target.closest?.('[data-n5g-profile]');
 if(profile){
  event.preventDefault();const id=profile.dataset.n5gProfile;
  if(W?.character?.(id)){selectedPerson=id;modalPerson=id;redraw();
   if(typeof queueMicrotask==='function')queueMicrotask(()=>document.querySelector?.('.n5w-profile')?.focus?.());}
  return;
 }
 const full=target.closest?.('[data-n5g-show-profile]');
 if(full){event.preventDefault();modalPerson=full.dataset.n5gShowProfile;redraw();return}
 const group=target.closest?.('[data-n5g-group]');
 if(group){event.preventDefault();libraryGroup=group.dataset.n5gGroup;modalPerson=null;redraw();return}
 const close=target.closest?.('[data-n5l-close-character]');
 if(close&&area.dataset.n5Gold==='characters'){event.preventDefault();modalPerson=null;redraw();return}
 if(target.matches?.('[data-n5l-modal-backdrop]')&&area.dataset.n5Gold==='characters'){
  event.preventDefault();modalPerson=null;redraw();
 }
});
document.addEventListener('input',event=>{
 if(!document.querySelector?.('[data-n5-gold="characters"]'))return;
 const field=event.target?.closest?.('[data-n5g-search]');
 if(!field)return;
 librarySearch=String(field.value||'').trim().toLocaleLowerCase();
 document.querySelectorAll?.('.n5g-person').forEach(card=>{
  card.hidden=!String(card.dataset.n5gTags||'').includes(librarySearch);
 });
});
document.addEventListener('keydown',event=>{
 if(event.key==='Escape'&&modalPerson&&document.querySelector?.('[data-n5-gold="characters"]')){
  event.preventDefault();modalPerson=null;redraw();
 }
});
window.NPN5GoldUI=Object.freeze({version:'v149',coursePage:coursePageV149,lessonOverview,
 storyLibrary,lessonShell,counts,goScene,goChapter,people:()=>W?.characters?.().length||0,
 routes:{course:'#course/N5',overview:routeOverview,lesson:routeLesson,characters:'#course/N5/characters'}});
})();