/* HORIZON N5 Path v1.45.
 * Curriculum navigation only; protects existing authored lessons and local progress.
 * Outline is independently written. Lesson numbers are provisional content maps
 * for Minna no Nihongo Elementary I, NOT a reproduction of textbook material.
 */
(function(){
'use strict';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const stages=[
 {id:'a',title:'Khởi đầu giao tiếp',range:'01–05',hint:'Giới thiệu, đồ vật, địa điểm, thời gian, đi lại',lessons:[
  ['Giới thiệu bản thân và mẫu câu lịch sự','n5-introduction'],
  ['Đây, đó, kia · これ・それ・あれ','n5-demonstratives'],
  ['Địa điểm và hoạt động mua sắm'],
  ['Giờ giấc và lịch sinh hoạt'],
  ['Di chuyển và phương hướng']
 ]},
 {id:'b',title:'Hoạt động hằng ngày',range:'06–10',hint:'Động từ, cho nhận, miêu tả, sở thích, vị trí',lessons:[
  ['Hoạt động thường ngày'],['Cho và nhận đồ vật'],['Tính từ và miêu tả'],
  ['Sở thích, khả năng và lý do'],['Sự tồn tại và vị trí']
 ]},
 {id:'c',title:'Diễn đạt nhu cầu',range:'11–15',hint:'Số lượng, so sánh, mong muốn, yêu cầu, cho phép',lessons:[
  ['Số lượng và cách đếm'],['So sánh và thời quá khứ'],['Mong muốn và dự định'],
  ['Lời yêu cầu với thể て'],['Được phép và không được phép']
 ]},
 {id:'d',title:'Kể chuyện & giao tiếp',range:'16–20',hint:'Nối hành động, phủ định, thể từ điển, kinh nghiệm, văn nói',lessons:[
  ['Nối các hành động'],['Phủ định và lời nhắc'],['Thể từ điển, sở thích và khả năng'],
  ['Kinh nghiệm và sự thay đổi'],['Cách nói thông thường']
 ]},
 {id:'e',title:'Vận dụng & chuẩn bị JLPT',range:'21–25',hint:'Ý kiến, bổ nghĩa, chỉ dẫn, giúp đỡ, giả định',lessons:[
  ['Ý kiến và lời kể'],['Mệnh đề bổ nghĩa danh từ'],['Thời điểm và cách chỉ đường'],
  ['Nhờ giúp đỡ và hành động vì người khác'],['Giả định và tình huống']
 ]}
];
const syll=stages.flatMap((stage,i)=>stage.lessons.map(([title,contentId],j)=>({
 number:i*5+j+1,title,contentId:contentId||null,stage:stage.id,
 published:!!contentId
})));
const routeOf=contentId=>'#lesson/'+contentId;
function lessonCard(item){
 const num=String(item.number).padStart(2,'0');
 const label=item.published?'<span class="n5p-state is-pilot">Bài mẫu đang thử nghiệm</span>':
  '<span class="n5p-state is-planned">Đang biên soạn</span>';
 const action=item.published?'<a class="n5p-lesson-link" href="'+esc(routeOf(item.contentId))+
  '" aria-label="Mở bài mẫu '+esc(num)+'">Mở bài mẫu <span aria-hidden="true">↗</span></a>':
  '<span class="n5p-unavailable" aria-label="Chưa có nội dung bài này">Chưa mở</span>';
 return '<li class="n5p-lesson'+(item.published?' has-pilot':'')+'">'+
  '<span class="n5p-num">'+num+'</span>'+
  '<span class="n5p-lesson-main"><strong>'+esc(item.title)+'</strong>'+label+'</span>'+action+'</li>';
}
function stageBlock(stage,index){
 const items=syll.filter(x=>x.stage===stage.id);
 const pilots=items.filter(x=>x.published).length;
 return '<details class="n5p-stage"'+(index===0?' open':'')+'>'+
  '<summary><span class="n5p-stage-n">'+String(index+1).padStart(2,'0')+'</span>'+
  '<span class="n5p-stage-title"><strong>'+esc(stage.title)+'</strong><small>'+esc(stage.hint)+'</small></span>'+
  '<span class="n5p-stage-count">Bài '+esc(stage.range)+(pilots?' · '+pilots+' mẫu':'')+'</span>'+
  '<span class="n5p-chevron" aria-hidden="true">⌄</span></summary>'+
  '<ol class="n5p-lesson-list">'+items.map(lessonCard).join('')+'</ol></details>';
}
const skills=[
 ['Từ vựng & Kanji','Ghi nhớ theo ngữ cảnh, cách đọc và nhận diện chữ.','layers'],
 ['Ngữ pháp','Hiểu mẫu câu, chọn trợ từ và áp dụng vào tình huống.','book'],
 ['Đọc hiểu','Tìm thông tin trong câu và đoạn văn ngắn.','read'],
 ['Nghe hiểu','Nghe ý chính, hội thoại và phản hồi phù hợp.','listen']
];
function skillCard(entry){
 return '<div class="n5p-skill"><span class="n5p-skill-symbol" aria-hidden="true">'+
  ({layers:'語',book:'文',read:'読',listen:'聴'}[entry[2]])+'</span>'+
  '<div><strong>'+esc(entry[0])+'</strong><p>'+esc(entry[1])+'</p>'+
  '<small>Chưa có bộ luyện kỹ năng riêng</small></div></div>';
}
function page(){
 return '<div class="v25-wrap n5p-wrap" data-n5-path="v145">'+
  '<nav class="n5p-crumb" aria-label="Vị trí học tập">'+
  '<a href="#learn/catalog">Khóa học</a><span aria-hidden="true">›</span><span aria-current="page">N5</span></nav>'+
  '<header class="n5p-hero"><div class="n5p-hero-copy">'+
  '<span class="n5p-kicker">HORIZON · JAPANESE N5</span>'+
  '<h1>Học N5, từng bài một.</h1>'+
  '<p>Lộ trình 25 bài tham chiếu Minna no Nihongo Sơ cấp I. Học theo thứ tự, luyện tập theo nhu cầu và kiểm tra khi nội dung đã sẵn sàng.</p>'+
  '<div class="n5p-hero-actions"><a class="n5p-primary" href="#lesson/n5-introduction">Bắt đầu với bài mẫu <span aria-hidden="true">→</span></a>'+
  '<button type="button" class="n5p-quiet" data-n5p-scroll="n5p-roadmap">Xem 25 bài học <span aria-hidden="true">↓</span></button></div>'+
  '</div><div class="n5p-hero-stat" aria-label="Tình trạng phát triển khóa học">'+
  '<strong>25</strong><span>bài trong lộ trình</span><small>2 bài có nội dung mẫu liên quan</small></div></header>'+
  '<div class="n5p-notice"><span aria-hidden="true">ⓘ</span>'+
  '<p>Đây là khung học N5 đang phát triển, <strong>chưa phải 25 bài đã phát hành</strong>. Các bài mẫu không tự động được tính là hoàn thành bài Minna no Nihongo. Nội dung và từ vựng sẽ được đối chiếu với phiên bản giáo trình được chọn.</p></div>'+
  '<div class="n5p-jump" role="navigation" aria-label="Các khu vực N5">'+
  '<button type="button" data-n5p-scroll="n5p-roadmap">01 · Theo giáo trình</button>'+
  '<button type="button" data-n5p-scroll="n5p-skills">02 · Luyện kỹ năng</button>'+
  '<button type="button" data-n5p-scroll="n5p-exam">03 · JLPT N5</button></div>'+
  '<section class="n5p-section" id="n5p-roadmap" tabindex="-1">'+
  '<div class="n5p-section-head"><div><span class="n5p-eyebrow">01 / LEARNING PATH</span>'+
  '<h2>Học theo giáo trình</h2>'+
  '<p>Năm chặng, mỗi chặng năm bài. Mở chặng để xem chủ đề và tình trạng nội dung.</p></div>'+
  '<span class="n5p-section-meta">25 bài · 5 chặng</span></div>'+
  '<div class="n5p-stages">'+stages.map(stageBlock).join('')+'</div>'+
  '<div class="n5p-starter"><div><strong>Đã có bài mẫu để thử luồng học</strong>'+
  '<p>Lời chào, giới thiệu bản thân và chỉ đồ vật đều là nội dung gốc tự biên soạn; chưa thay thế toàn bộ bài trong giáo trình.</p></div>'+
  '<div class="n5p-starter-actions"><a href="#lesson/n5-greetings">Lời chào ↗</a>'+
  '<a href="#lesson/n5-introduction">Giới thiệu ↗</a>'+
  '<a href="#lesson/n5-demonstratives">これ・それ・あれ ↗</a></div></div></section>'+
  '<section class="n5p-section" id="n5p-skills" tabindex="-1">'+
  '<div class="n5p-section-head"><div><span class="n5p-eyebrow">02 / PRACTICE</span>'+
  '<h2>Luyện theo kỹ năng</h2><p>Dùng các nội dung đã học để luyện điểm yếu. Không tách kỹ năng thành bốn khóa độc lập.</p></div></div>'+
  '<div class="n5p-skills">'+skills.map(skillCard).join('')+'</div>'+
  '<div class="n5p-review"><div><strong>Ôn đúng phần mình dễ quên</strong>'+
  '<p>Ôn lại bằng dữ liệu thật từ các bài đang có, không tính điểm minh họa thành tiến độ N5.</p></div>'+
  '<a href="#review">Mở khu vực ôn tập <span aria-hidden="true">↗</span></a></div></section>'+
  '<section class="n5p-section" id="n5p-exam" tabindex="-1">'+
  '<div class="n5p-section-head"><div><span class="n5p-eyebrow">03 / EXAM PREPARATION</span>'+
  '<h2>Luyện thi JLPT N5</h2>'+
  '<p>Chỉ mở chế độ thi thử đầy đủ khi có ngân hàng đề, đáp án và âm thanh được xác minh.</p></div></div>'+
  '<div class="n5p-exam-grid"><div><strong>Từ vựng</strong><span>20 phút</span></div>'+
  '<div><strong>Ngữ pháp · Đọc</strong><span>40 phút</span></div>'+
  '<div><strong>Nghe</strong><span>30 phút</span></div></div>'+
  '<p class="n5p-exam-note">Chưa phát hành bộ đề JLPT N5 hoàn chỉnh. Bài kiểm tra trong các bài mẫu chỉ đánh giá nội dung mẫu, không phải điểm thi JLPT.</p>'+
  '</section>'+
  '<footer class="n5p-footer"><strong>Sổ tay ngữ pháp N5</strong>'+
  '<span>Sẽ là nơi tra cứu mẫu câu, trợ từ và lỗi thường gặp theo bài; chưa phát hành dữ liệu tổng hợp.</span>'+
  '<a href="#learn/catalog">Trở về khóa học <span aria-hidden="true">↗</span></a></footer>'+
  '</div>';
}
const previousCourse=coursePage;
coursePage=function(id){return id==='N5'?page():previousCourse(id)};
document.addEventListener('click',event=>{
 const btn=event.target.closest?.('[data-n5p-scroll]');
 if(!btn||!document.querySelector?.('.n5p-wrap'))return;
 const id=btn.dataset.n5pScroll;
 if(!['n5p-roadmap','n5p-skills','n5p-exam'].includes(id))return;
 const dest=document.getElementById?.(id);
 if(!dest)return;
 event.preventDefault();
 dest.scrollIntoView?.({behavior:'smooth',block:'start'});
 dest.focus?.({preventScroll:true});
});
window.NPN5Path=Object.freeze({version:'v145',page,outline:()=>syll.map(x=>({...x})),stages:()=>stages.map(x=>({id:x.id,title:x.title,range:x.range}))});
if(location.hash.replace(/^#\/?/,'')==='course/N5'){
 const refresh=()=>render(false);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh,{once:true});
 else if(typeof queueMicrotask==='function')queueMicrotask(refresh);
}
})();