/* HORIZON Guided Hub v23: presentation only. Progress stays in existing learner stores. */
(function(){
 'use strict';
 const mark='v23';
 const E=window.NPLessonEngine;
 const escText=value=>String(value==null?'':value).replace(/[&<>"']/g,function(x){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]});
 const levels=[
  {id:'foundation',name:'Nền tảng',desc:'Kana, phát âm và thói quen học',mark:'あ',status:'sample'},
  {id:'N5',name:'N5',desc:'Giao tiếp và mẫu câu cơ bản',mark:'五',status:'sample'},
  {id:'N4',name:'N4',desc:'Giao tiếp trong đời sống',mark:'四',status:'planned'},
  {id:'N3',name:'N3',desc:'Ngôn ngữ học tập và đời sống',mark:'三',status:'planned'},
  {id:'N2',name:'N2',desc:'Đọc, nghe theo ngữ cảnh rộng',mark:'二',status:'planned'},
  {id:'N1',name:'N1',desc:'Ngôn ngữ nâng cao',mark:'一',status:'planned'}
 ];
 const foundations=[
  {title:'Hiragana · Năm chữ đầu tiên',detail:'あ · い · う · え · お',href:'lesson/foundation-vowels',state:'sample'},
  {title:'Kana Writing Studio',detail:'Luyện nét và tự viết',href:'kana',state:'tool'},
  {title:'Kiểm tra nhận diện Kana',detail:'Thực hành riêng, không thay thế điểm bài học',href:'kana/check',state:'tool'},
  {title:'Katakana · Lộ trình dự kiến',detail:'Nội dung khóa đang biên soạn',state:'planned'}
 ];
 function state(){
  let p;try{p=P()}catch(e){return null}
  let learning=null,reason='';
  try{learning=window.NPLessonUI&&NPLessonUI.read(p)}catch(e){reason=e.message}
  const sessions=learning&&Array.isArray(learning.sessions)?learning.sessions:[];
  const attempts=learning&&Array.isArray(learning.attempts)?learning.attempts:[];
  const reviews=learning&&Array.isArray(learning.reviews)?learning.reviews:[];
  const completed=sessions.filter(x=>x.status==='completed');
  const pending=sessions.filter(x=>x.status!=='completed').sort((a,b)=>String(b.updatedAt||'').localeCompare(String(a.updatedAt||'')));
  const due=reviews.filter(x=>x.dueAt&&new Date(x.dueAt).getTime()<=Date.now());
  const candidates=window.NPContentCatalog&&NPContentCatalog.list?NPContentCatalog.list():[];
  const catalog=candidates.filter(c=>c&&c.id&&['foundation-vowels','n5-introduction'].includes(c.id));
  const last=attempts.slice().reverse();
  const weak=last.filter(a=>a.correct===false).slice(0,3);
  return {p,learning,sessions,attempts,reviews,completed,pending,due,catalog,weak,reason};
 }
 const nav=[
  ['overview','Tổng quan','home'],['catalog','Khóa học','book'],['modules','Module','layers'],
  ['lessons','Bài học','play'],['practice','Ôn thông minh','review']
 ];
 function navRow(selected){
  return '<nav class="lh-tabs" aria-label="Các phần trong không gian Học">'+nav.map(function(n){
   return '<a href="#learn/'+n[0]+'" class="'+(selected===n[0]?'active':'')+'" '+(selected===n[0]?'aria-current="page"':'')+'>'+icon(n[2])+'<span>'+n[1]+'</span></a>';
  }).join('')+'</nav>';
 }
 function crumb(parts){
  return '<div class="lh-crumb">'+parts.map(function(p,i){return (i?'<span aria-hidden="true">/</span>':'')+(p[1]?'<a href="#'+p[1]+'">'+p[0]+'</a>':'<strong>'+p[0]+'</strong>')}).join('')+'</div>';
 }
 function commonHead(title,sub,selected,parts){
  return '<div class="lh-hero"><div class="lh-hero-text"><span class="lh-eyebrow">HORIZON · LEARNING WORKSPACE</span><h1>'+title+'</h1><p>'+sub+'</p></div><div class="lh-hero-kanji" lang="ja" aria-hidden="true">学</div></div>'+
    navRow(selected)+(parts?crumb(parts):'');
 }
 function pill(label,kind){return '<span class="lh-pill lh-pill-'+kind+'">'+label+'</span>'}
 function anchor(title,href,cls){return '<a class="'+(cls||'lh-button')+'" href="#'+href+'">'+title+' '+icon('arrow')+'</a>'}
 function title(text,href){return '<div class="lh-section-title"><h2>'+text+'</h2>'+(href?anchor('Xem chi tiết',href,'lh-text-link'):'')+'</div>'}
 function action(s){
  if(s.pending.length){
   const active=s.pending[0],loc=active.mode==='review'?'lesson/review':active.mode==='practice'?'quiz':'lesson/resume';
   return {label:'Tiếp tục bài đang dở',title:active.definition?.title||'Bài học đang dở',context:(active.definition?.level||'')+' · '+(active.index+1)+' / '+active.units.length+' bước',href:loc,tag:'Tiếp tục đúng vị trí'};
  }
  if(s.due.length)return {label:'Ôn bài đến hạn',title:'Có '+s.due.length+' nội dung cần ôn',context:'Từ lịch ôn đã lưu của hồ sơ',href:'review',tag:'Nên ôn trước'};
  if(!s.completed.length)return {label:'Bắt đầu học',title:'Hiragana · Năm chữ đầu tiên',context:'Bài mẫu Foundation · Làm quen あ・い・う・え・お',href:'lesson/foundation-vowels',tag:'Gợi ý bắt đầu'};
  return {label:'Xem bài học',title:'Chọn bài tiếp theo phù hợp',context:'Có thể xem bài mới hoặc luyện lại bài đã học',href:'learn/lessons',tag:'Chọn bước tiếp'};
 }
 function overview(s){
  const a=action(s),completed=s.completed.length,first=s.attempts.filter(x=>x.kind!=='repair'),independent=first.filter(x=>x.correct&&!x.hintUsed).length;
  return '<div class="lh-grid"><div class="lh-main">'+
   '<section class="lh-panel lh-focus"><div class="lh-section-title"><h2>'+icon('calendar')+' Hôm nay nên học gì?</h2>'+pill(a.tag,'highlight')+'</div>'+
    '<div class="lh-focus-body"><div class="lh-focus-glyph" lang="ja">あ</div><div class="lh-focus-copy"><small>Hành động ưu tiên</small><h3>'+escText(a.title)+'</h3><p>'+escText(a.context)+'</p></div>'+anchor(a.label,a.href,'lh-button lh-button-primary')+'</div>'+
    '<p class="lh-hint">Đề xuất theo trạng thái bài dở và lịch ôn; không phải đánh giá trình độ tự động.</p></section>'+
   '<section class="lh-panel"><div class="lh-section-title"><h2>'+icon('route')+' Lộ trình học</h2>'+anchor('Xem lộ trình','journey','lh-text-link')+'</div>'+
    '<div class="lh-path">'+levels.map(function(level){const active=s.p.goal===level.name;return '<a href="#course/'+level.id+'" class="'+(active?'selected':'')+'"><span class="lh-path-mark">'+level.mark+'</span><strong>'+level.name+'</strong><small>'+ (level.status==='planned'?'Dự kiến':active?'Mục tiêu hiện tại':'Có bản mẫu')+'</small></a>'}).join('')+'</div></section>'+
   '<section class="lh-panel"><div class="lh-section-title"><h2>'+icon('book')+' Nội dung có thể học</h2>'+anchor('Toàn bộ bài học','learn/lessons','lh-text-link')+'</div>'+
    '<div class="lh-learning-cards">'+
      '<a href="#course/foundation" class="lh-learning-card"><span class="lh-learning-symbol" lang="ja">あ</span><strong>Nền tảng · Hiragana</strong><small>Nhận mặt chữ, luyện viết, kiểm tra</small>'+pill('Bài mẫu & công cụ','ready')+'</a>'+
      '<a href="#course/N5" class="lh-learning-card"><span class="lh-learning-symbol" lang="ja">日本語</span><strong>N5 · Giới thiệu bản thân</strong><small>Mẫu câu và luyện nhớ lại</small>'+pill('Bài mẫu','ready')+'</a>'+
      '<a href="#exams" class="lh-learning-card"><span class="lh-learning-symbol" lang="ja">試験</span><strong>Luyện đề JLPT</strong><small>Bộ câu hỏi minh họa theo cấp độ</small>'+pill('Bộ mẫu','preview')+'</a>'+
    '</div></section></div>'+
   '<aside class="lh-side"><section class="lh-panel"><h2>'+icon('chart')+' Tiến độ đã ghi nhận</h2>'+
     '<div class="lh-stat"><strong>'+completed+'</strong><span>Phiên học hoàn tất</span></div><div class="lh-stat"><strong>'+independent+' / '+first.length+'</strong><span>Câu đúng độc lập / câu đã trả lời</span></div>'+
     '<div class="lh-stat"><strong>'+s.due.length+'</strong><span>Nội dung đến hạn ôn</span></div>'+
     '<p class="lh-hint">Đúng một lần không đồng nghĩa đã ghi nhớ lâu dài.</p></section>'+
    '<section class="lh-panel"><h2>'+icon('spark')+' Gợi ý dựa trên kết quả</h2>'+
     (s.due.length?'<div class="lh-advice">Bạn có '+s.due.length+' nội dung đến hạn. Hãy thử nhớ lại trước khi xem đáp án.</div>':s.weak.length?'<div class="lh-advice">Có câu cần xem lại từ lần luyện gần nhất. Mở danh sách lỗi để luyện đúng phần còn yếu.</div>':'<div class="lh-advice">Chưa có đủ bằng chứng để xác định điểm yếu. Bắt đầu bằng một bài ngắn.</div>')+
     '<div class="lh-quick-actions">'+anchor('Ôn tập','review','lh-secondary-link')+anchor('Lỗi cần ôn','mistakes','lh-secondary-link')+anchor('Luyện đề JLPT','exams','lh-secondary-link')+'</div></section>'+
    '<section class="lh-panel"><h2>'+icon('compass')+' Mục tiêu hiện tại</h2><strong class="lh-current-goal">'+escText(s.p.goal)+'</strong><p>Đây là mục tiêu tự chọn, không phải trình độ đã kiểm tra.</p>'+anchor('Điều chỉnh mục tiêu','settings/goals','lh-text-link')+'</section></aside></div>';
 }
 function catalog(s){
  return '<div class="lh-panel">'+title('Khám phá khóa học')+'<p class="lh-hint">Chọn một khóa để xem module và bài hiện có. Khóa chưa phát hành chỉ hiển thị kế hoạch.</p>'+
   '<div class="lh-course-grid">'+levels.map(function(x){return '<a class="lh-course-card" href="#course/'+x.id+'"><span class="lh-course-symbol" lang="ja">'+x.mark+'</span><h3>'+x.name+'</h3><p>'+x.desc+'</p>'+pill(x.status==='planned'?'Chưa phát hành':x.id==='foundation'?'Có bài mẫu & công cụ':'Có bài mẫu',x.status==='planned'?'pending':'ready')+'<span class="lh-course-arrow">'+icon('arrow')+'</span></a>'}).join('')+'</div></div>';
 }
 function moduleRows(){
  return [{name:'Hiragana',desc:'Nguyên âm và luyện nhận dạng',href:'course/foundation',status:'Có bài mẫu'},
          {name:'Kana Writing Studio',desc:'Xem từng nét và tự viết',href:'kana',status:'Công cụ hoạt động'},
          {name:'Nhận diện Kana',desc:'Tự kiểm tra trước khi tiếp tục',href:'kana/check',status:'Công cụ hoạt động'},
          {name:'Mẫu câu N5',desc:'Giới thiệu bản thân',href:'course/N5',status:'Có bài mẫu'}];
 }
 function modules(){
  return '<section class="lh-panel">'+title('Module có nội dung để trải nghiệm')+
   '<div class="lh-row-list">'+moduleRows().map(function(x,i){return '<a href="#'+x.href+'" class="lh-module-row"><span class="lh-row-num">'+String(i+1).padStart(2,'0')+'</span><span><strong>'+x.name+'</strong><small>'+x.desc+'</small></span>'+pill(x.status,'ready')+icon('chevron')+'</a>'}).join('')+'</div>'+
   '<p class="lh-hint">Katakana đầy đủ, từ vựng, nghe hiểu và các module N4–N1 sẽ bổ sung khi có nội dung đã kiểm tra.</p></section>';
 }
 function lessons(s){
  const all=[{title:'Năm chữ đầu tiên · あ・い・う・え・お',meta:'Nền tảng / Hiragana',href:'lesson/foundation-vowels',id:'foundation-vowels'},
   {title:'Giới thiệu bản thân',meta:'N5 / Mẫu câu',href:'lesson/n5-introduction',id:'n5-introduction'}];
  return '<section class="lh-panel">'+title('Bài học đã có')+'<div class="lh-row-list">'+all.map(function(x,i){
   const relevant=s.sessions.filter(a=>a.contentId===x.id),last=relevant.at(-1);
   const status=last?.status==='completed'?'Đã hoàn thành phiên':last?'Đang học':'Có bài mẫu';
   return '<a href="#'+x.href+'" class="lh-module-row"><span class="lh-row-num">'+String(i+1).padStart(2,'0')+'</span><span><strong>'+x.title+'</strong><small>'+x.meta+'</small></span>'+pill(status,last?.status==='completed'?'done':'ready')+icon('chevron')+'</a>';
  }).join('')+'</div><p class="lh-hint">Những bài chưa được phát hành không xuất hiện như bài có thể bắt đầu.</p></section>';
 }
 function practice(s){
  return '<div class="lh-grid"><section class="lh-panel lh-main">'+title('Ôn đúng nội dung cần nhớ')+
   '<p class="lh-hint">Gợi ý dựa trên câu trả lời và lịch ôn thật của hồ sơ. Không tự gán trình độ.</p>'+
   '<div class="lh-row-list">'+[
    ['Đến hạn ôn',s.due.length+' nội dung từ lịch giãn cách','review'],
    ['Lỗi gần đây',s.weak.length+' câu sai trong danh sách gần nhất','mistakes'],
    ['Luyện nhận diện Kana','Luyện chữ và kiểm tra nhận diện','kana/check'],
    ['Luyện đề JLPT','Bộ câu hỏi mẫu N5–N1, chưa phải đề thi đầy đủ','exams']
   ].map(function(x,i){return '<a href="#'+x[2]+'" class="lh-module-row"><span class="lh-row-num">'+String(i+1).padStart(2,'0')+'</span><span><strong>'+x[0]+'</strong><small>'+x[1]+'</small></span>'+icon('arrow')+'</a>'}).join('')+'</div></section>'+
   '<aside class="lh-panel lh-side"><h2>'+icon('brain')+' Quy tắc gợi ý</h2><p>Ưu tiên bài đang dở, sau đó nội dung đến hạn ôn, rồi mới đề xuất học bài mới.</p><p class="lh-hint">Chưa có tính năng AI đánh giá phát âm hoặc chấm viết tự động.</p></aside></div>';
 }
 function learningPage(){
  const s=state();if(!s)return '<section class="lh-panel">Không đọc được hồ sơ hiện tại.</section>';
  const selected=(route().split('/')[1]||'overview'),valid=nav.some(x=>x[0]===selected),tab=valid?selected:'overview';
  let body=tab==='catalog'?catalog(s):tab==='modules'?modules():tab==='lessons'?lessons(s):tab==='practice'?practice(s):overview(s);
  return '<div class="lh-page" data-learning-hub="'+mark+'">'+commonHead('Không gian học tập','Biết mình đang ở đâu, cần học gì và nên làm gì tiếp theo.',tab)+
  (s.reason?'<p class="lh-warning">'+escText(s.reason)+'</p>':'')+body+'<div class="lh-footer-version">HORIZON · Learning Hub '+mark+' · Dữ liệu theo hồ sơ hiện tại · Giao diện demo</div></div>';
 }
 function coursePageV23(id){
  const item=levels.find(x=>x.id===id);if(!item)return '<div class="lh-page"><h1>Không tìm thấy khóa học.</h1>'+anchor('Trở lại Khóa học','learn/catalog')+'</div>';
  const s=state();const foundation=id==='foundation',n5=id==='N5',published=foundation||n5;
  const items=foundation?foundations:n5?[
   {title:'Giới thiệu bản thân',detail:'Bài mẫu · học và trả lời câu hỏi',href:'lesson/n5-introduction',state:'sample'},
   {title:'Ôn câu đã học',detail:'Lịch ôn từ kết quả trả lời thực tế',href:'review',state:'tool'},
   {title:'Nội dung N5 tiếp theo',detail:'Chưa phát hành',state:'planned'}
  ]:[
   {title:'Từ vựng theo ngữ cảnh',detail:'Dự kiến',state:'planned'},
   {title:'Ngữ pháp theo tình huống',detail:'Dự kiến',state:'planned'},
   {title:'Đọc và nghe hiểu',detail:'Dự kiến',state:'planned'}];
  return '<div class="lh-page" data-learning-hub="'+mark+'">'+commonHead(item.name+' · Lộ trình','Khám phá module và đi thẳng tới nội dung đã có.', 'catalog',
    [['Học','learn'],['Khóa học','learn/catalog'],[item.name,null]])+
   '<div class="lh-grid"><section class="lh-panel lh-main"><div class="lh-section-title"><h2>'+icon('layers')+' Module & bài học</h2>'+pill(published?'Có nội dung mẫu':'Chưa phát hành',published?'ready':'pending')+'</div>'+
   '<div class="lh-row-list">'+items.map(function(x,i){const content='<span class="lh-row-num">'+String(i+1).padStart(2,'0')+'</span><span><strong>'+x.title+'</strong><small>'+x.detail+'</small></span>'+pill(x.state==='planned'?'Chưa phát hành':x.state==='tool'?'Công cụ':'Bài mẫu',x.state==='planned'?'pending':'ready')+(x.href?icon('arrow'):'');return x.href?'<a href="#'+x.href+'" class="lh-module-row">'+content+'</a>':'<div class="lh-module-row lh-row-disabled">'+content+'</div>'}).join('')+'</div></section>'+
   '<aside class="lh-side"><section class="lh-panel"><h2>Trạng thái nội dung</h2><p>'+(published?'Một số bài mẫu và công cụ đã sẵn sàng. Khóa đầy đủ chưa phát hành.':'Đây là khung lộ trình dự kiến. Chưa có bài học có thể bắt đầu ở cấp độ này.')+'</p><p class="lh-hint">Tiến độ chỉ được ghi nhận khi học viên thực hiện hoạt động thực tế.</p></section>'+
   '<section class="lh-panel"><h2>Điều hướng nhanh</h2><div class="lh-quick-actions">'+anchor('Tất cả khóa học','learn/catalog','lh-secondary-link')+anchor('Xem lộ trình','journey','lh-secondary-link')+anchor('Luyện đề','exams','lh-secondary-link')+'</div></section></aside></div>'+
   '<div class="lh-footer-version">HORIZON · Learning Hub '+mark+'</div></div>';
 }
 learnPage=learningPage;
 coursePage=coursePageV23;
 const previousTitle=titleOf;
 titleOf=function(r){if(r==='learn'||r.startsWith('learn/'))return 'Không gian học tập';if(r.startsWith('course/'))return 'Khóa học · '+(levels.find(x=>x.id===r.split('/')[1])?.name||'');return previousTitle(r)};
 if(!location.hash||location.hash==='#learn'||location.hash.startsWith('#learn/')||location.hash.startsWith('#course/'))queueMicrotask(function(){render(false)});
 window.NPLearningHub=Object.freeze({version:mark,read:state});
})();
