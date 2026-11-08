/* HORIZON v25 · Mockup fidelity. Read-only view model; no writes to learner storage. */
(function(){
'use strict';
const VERSION='v33', safe=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const featureIcons={
 'bulb':'M9 18h6M10 21h4M9.5 14.5C7.5 13.2 6.5 11.6 6.5 9a5.5 5.5 0 0 1 11 0c0 2.6-1 4.2-3 5.5-.5.4-.7 1-.7 1.5h-3.6c0-.5-.2-1.1-.7-1.5ZM4.5 4.5l-1.5-1.5M19.5 4.5 21 3M12 1v1.6M3 10.5H1.5M22.5 10.5H21',
 'target':'M12 3a9 9 0 1 0 9 9M12 6a6 6 0 1 0 6 6M12 9a3 3 0 1 0 3 3M12 12l9-9M16.5 3H21v4.5',
 'flag':'M5 21V4m0 0c3-2 5 2 8 0s5-2 7 0v11c-2-2-4-2-7 0s-5-2-8 0',
 'route':'M5 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM19 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM5 8v3c0 3 3 3 7 3h3c4 0 4 5 4 5',
 'play-circle':'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM10 7.5l6.2 4.5-6.2 4.5z',
 'book-open':'M12 6c-3-2-7-2-10-1v14c3-1 7-1 10 1m0-14c3-2 7-2 10-1v14c-3-1-7-1-10 1m0-14v14',
 'progress':'M4 20v-7h3v7M10.5 20V5h3v15M17 20v-10h3v10',
 'repeat':'M4 7h14l-3-3M18 7l-3 3M20 17H6l3-3M6 17l3 3',
 'compass-star':'M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z'
};
const I=name=>featureIcons[name]?'<svg class="icon v26-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.65" aria-hidden="true"><path d="'+featureIcons[name]+'"/></svg>':icon(name);
const href=(route,label,cls='v25-link')=>'<a class="'+cls+'" href="#'+route+'">'+label+'</a>';
/* Real lesson links and companion exercises. Sample scenario completion is separate from learner records. */
const activities=[
 {id:'vowels',contentId:'foundation-vowels',kind:'lesson',title:'01 · Nguyên âm Hiragana',desc:'あ・い・う・え・お',group:'Hiragana',module:'Hiragana · các hàng cơ bản',course:'foundation',route:'lesson/foundation-vowels',icon:'あ'},
 {id:'krow',contentId:'foundation-k-row',kind:'lesson',title:'02 · Hàng K',desc:'か・き・く・け・こ',group:'Hiragana',module:'Hiragana · các hàng cơ bản',course:'foundation',route:'lesson/foundation-k-row',icon:'か'},
 {id:'srow',contentId:'foundation-s-row',kind:'lesson',title:'03 · Hàng S',desc:'さ・し・す・せ・そ',group:'Hiragana',module:'Hiragana · các hàng cơ bản',course:'foundation',route:'lesson/foundation-s-row',icon:'さ'},
 {id:'trow',contentId:'foundation-t-row',kind:'lesson',title:'04 · Hàng T',desc:'た・ち・つ・て・と',group:'Hiragana',module:'Hiragana · các hàng cơ bản',course:'foundation',route:'lesson/foundation-t-row',icon:'た'},
 {id:'writing',kind:'tool',title:'Kana Writing Studio',desc:'Xem nét và tự viết, không chấm điểm',group:'Luyện viết',module:'Luyện Kana',course:'foundation',route:'kana',icon:'書'},
 {id:'recognition',kind:'tool',title:'Recall Lab · Kiểm tra nhận diện',desc:'Luyện nhận diện riêng, không tính vào bài học',group:'Tự kiểm tra',module:'Luyện Kana',course:'foundation',route:'kana/check',icon:'読'},
 {id:'greetings',contentId:'n5-greetings',kind:'lesson',title:'01 · Lời chào theo thời điểm',desc:'おはようございます・こんにちは・こんばんは',group:'Giao tiếp',module:'N5 · Giao tiếp cơ bản',course:'N5',route:'lesson/n5-greetings',icon:'挨'},
 {id:'intro',contentId:'n5-introduction',kind:'lesson',title:'02 · Giới thiệu bản thân',desc:'Tên, vai trò và câu hỏi lịch sự',group:'Giao tiếp',module:'N5 · Giao tiếp cơ bản',course:'N5',route:'lesson/n5-introduction',icon:'日'},
 {id:'demonstratives',contentId:'n5-demonstratives',kind:'lesson',title:'03 · これ・それ・あれ',desc:'Đây, đó hay kia theo vị trí đồ vật',group:'Ngữ pháp',module:'N5 · Đồ vật & vị trí',course:'N5',route:'lesson/n5-demonstratives',icon:'物'},
 {id:'revision',kind:'tool',title:'Ôn giãn cách',desc:'Các mẫu đến hạn ôn từ kết quả thực tế',group:'Ôn tập',module:'N5 · Luyện tập',course:'N5',route:'review',icon:'復'},
 {id:'exam',kind:'tool',title:'Kho đề JLPT',desc:'Bộ mẫu; chưa thay cho một bài thi chuẩn',group:'Luyện đề',module:'N5 · Luyện tập',course:'N5',route:'exams',icon:'試'}
];
const lessons=activities.filter(x=>x.kind==='lesson');
/* Scenario seeds: only input observations; displayed percentages and states are derived below.
   These fixtures are not written to localStorage and never count as real learner mastery. */
const examples={
 'demo-a':{done:['vowels','krow'],current:'srow',step:2,steps:10,results:[true,true,false,true,true,true],minutes:[20,15,20],weekGoal:5,reviewDue:['kana-k'],weak:['Hàng S','Hiragana']},
 'demo-b':{done:['vowels','krow','srow','trow','greetings','intro'],current:'demonstratives',step:2,steps:6,results:[true,true,true,false,true,true,true,true],minutes:[30,30,25,20,20],weekGoal:5,reviewDue:['n5-intro'],weak:['これ・それ・あれ']},
 'demo-c':{done:['vowels'],current:'krow',step:1,steps:10,results:[true,false,true,false,true,true],minutes:[15,15,10],weekGoal:4,reviewDue:['vowels'],weak:['Hàng K','Hàng S']},
 'demo-d':{done:[],current:'vowels',step:1,steps:10,results:[],minutes:[10],weekGoal:4,reviewDue:[],weak:[]}
};
const pct=(part,total)=>total>0?Math.min(100,Math.round(part/total*100)):0;
const status=(data,id)=>data.done.has(id)?'done':data.current===id?'current':'future';
const toMinutes=s=>Array.isArray(s)?s.reduce((n,x)=>n+Number(x||0),0):0;
function model(){
 const learner=P(),real=window.NPLearningHub?.read?.()||{},sessions=real.sessions||[],attempts=real.attempts||[],reviews=real.reviews||[];
 const hasReal=sessions.length>0,seed=!hasReal?examples[learner.id]||null:null;
 if(seed){
  const completed=new Set(seed.done.filter(id=>lessons.some(a=>a.id===id)));
  const current=lessons.some(a=>a.id===seed.current)?seed.current:lessons[0].id;
  const answered=seed.results.length,correct=seed.results.filter(Boolean).length;
  const done=completed.size,total=lessons.length;
  const minutes=toMinutes(seed.minutes),goal=seed.weekGoal;
  return {learner,sample:true,done:completed,current,step:seed.step,steps:seed.steps,answered,correct,
   count:done,total,percent:pct(done,total),minutes,days:seed.minutes.length,weekGoal:goal,weekly:pct(seed.minutes.length,goal),
   weak:seed.weak,due:seed.reviewDue.length,actualPending:false,actualContent:null,
   info:'Dữ liệu mô phỏng theo hồ sơ — không ghi vào kết quả học thật.'};
 }
 const completedSessions=sessions.filter(x=>x.status==='completed'&&x.mode==='lesson');
 const pending=sessions.filter(x=>x.status!=='completed').sort((a,b)=>String(b.updatedAt||'').localeCompare(String(a.updatedAt||'')));
 const active=pending[0]||null;
 const contentToId=id=>lessons.find(a=>a.contentId===id)?.id||null;
 const done=new Set(completedSessions.map(x=>contentToId(x.contentId)).filter(Boolean));
 const selected=(active&&contentToId(active.contentId))||lessons.find(a=>!done.has(a.id)&&(learner.goal==='N5'?a.course==='N5':a.course==='foundation'))?.id||lessons.find(a=>!done.has(a.id))?.id||lessons[0].id;
 const completedUnits=done.size;
 const totalUnits=lessons.length;
 const answers=attempts.filter(a=>a.kind!=='repair');
 const minutes=null; // Accurate total study time is not available in the current session schema.
 const due=reviews.filter(r=>new Date(r.dueAt).getTime()<=Date.now()).length;
 const wrong=answers.filter(a=>!a.correct).length;
 return {learner,sample:false,done,current:selected||'vowels',step:active?.index+1||1,steps:active?.units?.length||0,
  answered:answers.length,correct:answers.filter(a=>a.correct&&!a.hintUsed).length,
  count:completedUnits,total:totalUnits,percent:pct(completedUnits,totalUnits),minutes,days:null,weekGoal:null,weekly:null,
  weak:wrong?['Câu sai cần ôn']:[],due,actualPending:!!active,actualContent:active?.contentId||null,
  info:sessions.length?'Số bài hoàn thành ít nhất một lần; chưa kết luận ghi nhớ lâu dài.':'Chưa có phiên học được ghi nhận.'};
}
function label(text,cl=''){return '<span class="v25-badge '+cl+'">'+text+'</span>'}
function navigation(selected){
 return '<nav class="v25-tabs v131-four-tabs" aria-label="Điều hướng trong mục Học">'+[
 ['overview','Tổng quan','home'],['catalog','Khóa học','book-open'],['training','Luyện tập','target'],['practice','Ôn tập','repeat']
 ].map(([id,title,ic])=>href('learn/'+id,I(ic)+'<span>'+title+'</span>','v25-tab '+(id===selected?'active':'')+'' )).join('')+'</nav>';
}
function header(){
 return '<div class="v28-header-shell"><header class="v25-header"><div class="v25-hero-copy"><h1>Không gian học tập</h1><p>Học tiếng Nhật có lộ trình, đúng trọng tâm, mỗi ngày một bước tiến.</p></div></header>'+navigation('overview')+'</div>';
}
function progressBar(value){return '<span class="v25-progress-track" role="progressbar" aria-label="Tiến độ" aria-valuenow="'+value+'" aria-valuemin="0" aria-valuemax="100"><span style="width:'+value+'%"></span></span>'}
function ring(value){return '<div class="v25-ring" role="img" aria-label="'+value+'% tiến độ" style="--v25-progress:'+value+'%"><div class="v25-ring-center"><strong>'+value+'%</strong></div></div>'}
function sectionHead(iconName,title,link,labelText='Xem tất cả'){
 return '<header class="v25-section-head"><h2>'+I(iconName)+' '+title+'</h2>'+(link?href(link,labelText+' '+I('arrow'),'v25-text-cta'):'')+'</header>';
}
function focus(m){
 const unit=activities.find(a=>a.id===m.current)||activities[0];
 const pending=m.actualPending;
 const focusRoute=pending&&unit.contentId===m.actualContent?'lesson/resume':unit.route;
 const primary=pending?'Tiếp tục học':m.sample?'Mở hoạt động mẫu':m.done.size?'Mở bài học':'Bắt đầu học';
 const currentStep=m.steps?m.step+' / '+m.steps+' bước':m.sample?'Chưa bắt đầu': 'Chưa có dữ liệu';
 const stepPercent=m.steps?pct(Math.max(0,m.step-1),m.steps):0;
 return '<section class="v25-panel v25-focus">'+sectionHead('calendar','Hôm nay nên học gì?')+
 '<span class="v25-focus-tag">'+I('award')+(m.sample?'Kịch bản học mẫu':'Dựa trên tiến độ thật')+'</span>'+
 '<div class="v25-focus-layout"><div class="v25-focus-thumbnail" lang="ja">'+unit.icon+'</div>'+
 '<div class="v25-focus-main"><div class="v25-small-tag">'+safe(unit.module)+'</div><h3>'+safe(unit.title)+(unit.id==='vowels'?' · あ・い・う・え・お':'')+'</h3>'+
 '<div class="v25-focus-meta"><span>'+I('clock')+' Hoạt động ngắn</span><span>'+I('book')+' '+safe(unit.group)+'</span></div>'+
 '<div class="v25-focus-step">'+progressBar(stepPercent)+'<span>'+currentStep+'</span></div></div>'+
 href(focusRoute,I('play')+primary,'v25-primary')+'</div></section>';
}
function progress(m){
 const title=m.sample?'Tiến độ lộ trình mẫu':'Tiến độ phiên đã ghi nhận';
 return '<section class="v25-panel v25-statpanel">'+sectionHead('progress',title,'reports','Chi tiết')+
 '<div class="v25-statmain">'+ring(m.percent)+'<dl>'+
 '<div><dt>'+I('book')+' '+(m.sample?'Hoạt động hoàn tất':'Bước hoàn tất')+'</dt><dd>'+m.count+' / '+m.total+'</dd></div>'+
 '<div><dt>'+I('clock')+' Thời gian</dt><dd>'+(m.minutes==null?'Chưa đo':m.minutes+' phút')+'</dd></div>'+
 '<div><dt>'+I('calendar')+' '+(m.sample?'Buổi học mô phỏng':'Bài học hoàn tất')+'</dt><dd>'+(m.sample?m.days:(m.done.size))+'</dd></div>'+
 '</dl></div><p class="v25-tiny">'+safe(m.info)+'</p></section>';
}
function weekly(m){
 return '<section class="v25-panel v25-week">'+sectionHead('target','Mục tiêu tuần này','settings/goals','Chỉnh mục tiêu')+
 (m.sample?'<p>Hoàn thành '+m.weekGoal+' buổi học trong tuần</p>'+progressBar(m.weekly)+'<div class="v25-week-detail"><span>'+m.days+' / '+m.weekGoal+' buổi đã học</span><strong>'+m.weekly+'%</strong></div>':
 '<p>Đặt lịch học để theo dõi mục tiêu từng tuần.</p>'+href('settings/goals','Thiết lập mục tiêu '+I('arrow'),'v25-text-cta'))+'</section>';
}
function recommendations(m){
 const list=m.due?[['review','Ôn lại phần cần nhớ',m.due+' nội dung cần kiểm tra lại','review']]:[];
 list.push(['review','Luyện nhận diện Kana','Ôn theo chữ và cách đọc','kana/check']);
 if(m.weak.length)list.push(['help','Xem điểm dễ nhầm',m.weak.slice(0,2).join(' · '),'mistakes']);
 return '<section class="v25-panel v25-recommend">'+sectionHead('bulb','Gợi ý học tiếp theo')+
 '<div class="v25-recommend-stack">'+list.slice(0,3).map(([ic,title,desc,dest])=>href(dest,
 '<span class="v25-recommend-icon">'+I(ic)+'</span><span><strong>'+safe(title)+'</strong><small>'+safe(desc)+'</small></span>'+I('chevron'),'v25-recommend-item')).join('')+'</div></section>';
}
function stages(m){
 const levels=[['foundation','Nền tảng','leaf'],['N5','N5','book'],['N4','N4','map'],['N3','N3','map'],['N2','N2','map'],['N1','N1','map']];
 const active=m.learner.goal==='Nền tảng'?'foundation':m.learner.goal;
 return '<div class="v25-stage-rail" aria-label="Chọn cấp độ">'+levels.map(([id,title,ic])=>href('course/'+id,I(ic)+'<strong>'+title+'</strong>','v25-level '+(active===id?'current':''))).join('')+'</div>';
}
function cellRoute(act,m){return m.actualPending&&act?.contentId&&m.actualContent===act.contentId?'lesson/resume':act.route}
function testRoute(act){return act?.contentId?'quiz/'+act.contentId:null}
function activityState(act,m){
 const state=act.kind==='tool'?'tool':status(m,act.id);
 return '<span class="v25-row-status '+state+'">'+(state==='done'?I('check'):state==='current'?I('play-circle'):I('arrow'))+'</span>';
}
function hierarchy(m){
 const course=m.learner.goal==='N5'?'N5':'foundation';
 const subset=lessons.filter(a=>a.course===course);
 const modules=[...new Set(subset.map(a=>a.module))];
 const moduleLink=href('course/foundation','Xem các chặng Nền tảng '+I('arrow'),'v25-text-cta');
 return '<section class="v25-panel v25-hierarchy">'+sectionHead('route','Lộ trình học theo cấp độ','learn/catalog','Xem lộ trình')+
 stages(m)+'<div class="v25-columns">'+
 '<div class="v25-column"><h3>'+I('book-open')+' Khóa học</h3>'+
 [['foundation','Nền tảng','Hiragana và luyện Kana'],['N5','N5','Giao tiếp & ngữ pháp cơ bản']].map(([id,name,description])=>href('course/'+id,I(id==='foundation'?'leaf':'book-open')+'<span><strong>'+name+'</strong><small>'+description+'</small></span>'+I('chevron'),'v25-h-row '+(id===course?'selected':''))).join('')+
 '<div class="v32-helper">Các khóa N4–N1 đang chuẩn bị.</div></div>'+
 '<div class="v25-column"><h3>'+I('layers')+' Module</h3>'+
 modules.map((name,index)=>href('course/'+course,I('layers')+'<span><strong>'+name+'</strong><small>'+subset.filter(a=>a.module===name).length+' bài đã biên soạn</small></span>'+I('chevron'),'v25-h-row '+(index===0?'selected':''))).join('')+moduleLink+'</div>'+
 '<div class="v25-column v25-lesson-column"><h3>'+I('play-circle')+' Bài học ('+subset.length+')</h3>'+
 subset.map((a,i)=>href(cellRoute(a,m),activityState(a,m)+'<span><strong>'+(i+1)+'. '+safe(a.title)+'</strong><small>'+safe(a.desc)+'</small></span>','v25-lesson-row '+status(m,a.id))).join('')+
 '</div></div></section>';
}

function mini(m){
 const current=activities.find(a=>a.id===m.current)||lessons[0];
 const next=lessons.find(a=>status(m,a.id)==='future')||current;
 const tiles=[
  ['play','Tiếp tục học',current.title,cellRoute(current,m),m.percent+'%'],
  ['book','Bài đang học',current.module,cellRoute(current,m),m.sample?m.step+' / '+m.steps+' bước':'Xem bài'],
  ['repeat','Ôn lại hôm nay',m.due+' nội dung cần xem', 'review',m.sample?'Mô phỏng':'Theo lịch'],
  ['flag','Bước tiếp theo',next.title,next.route,'Xem bài']
 ];
 return '<div class="v25-minis">'+tiles.map(([ic,name,val,dest,meta])=>href(dest,
 '<span class="v25-mini-title">'+I(ic)+' '+name+'</span><strong>'+safe(val)+'</strong><span class="v25-mini-bottom"><small>'+safe(meta)+'</small>'+I('arrow')+'</span>','v25-mini')).join('')+'</div>';
}
function overview(){
 const m=model();if(!m)return '<p>Không thể đọc hồ sơ.</p>';
 return '<div class="v25-wrap" data-learning-hub="v33">'+header()+
 '<nav class="v25-breadcrumb" aria-label="Vị trí học tập">'+href('learn','Học')+'<span aria-hidden="true">›</span>'+href('settings/goals','Mục tiêu: '+safe(m.learner.goal))+'<span aria-hidden="true">›</span>'+href('course/'+(activities.find(a=>a.id===m.current)?.course||'foundation'),'Khóa: '+(activities.find(a=>a.id===m.current)?.course==='N5'?'N5':'Nền tảng'))+'<span aria-hidden="true">›</span><span aria-current="page">Tổng quan</span></nav>'+
 (m.sample?'<div class="v25-fixture-notice">'+I('info')+' DỮ LIỆU MẪU · Mô phỏng theo hồ sơ '+safe(m.learner.name)+'. Tất cả tỷ lệ tính từ hoạt động giả lập, không phải kết quả học thực tế.</div>':'')+
 '<div class="v25-dashboard"><div class="v25-left">'+focus(m)+hierarchy(m)+'</div><div class="v25-right">'+progress(m)+weekly(m)+recommendations(m)+'</div></div>'+
 mini(m)+'<div class="v25-version">Tiến độ học · '+(m.sample?'Dữ liệu minh họa':'Tiến độ đã ghi nhận')+'</div></div>';
}

function tabTop(selected,m){
 return '<div class="v28-header-shell"><header class="v25-header"><div class="v25-hero-copy"><h1>Không gian học tập</h1><p>Khóa học, nội dung và hoạt động đều có vị trí rõ ràng.</p></div></header>'+
 navigation(selected)+'</div>'+
 '<nav class="v25-breadcrumb" aria-label="Vị trí học tập">'+href('learn','Học')+'<span aria-hidden="true">›</span><span aria-current="page">'+({catalog:'Khóa học',training:'Luyện tập',practice:'Ôn tập'}[selected]||'Tổng quan')+'</span></nav>'+
 (m.sample?'<div class="v25-fixture-notice">'+I('info')+' Kịch bản '+safe(m.learner.name)+' · Trạng thái mô phỏng, chưa ghi vào hồ sơ học thật.</div>':'');
}
function catalogueTab(m){
 const lv=[['foundation','Nền tảng','Kana, phát âm và thói quen học','あ',true],['N5','N5','Mẫu câu và giao tiếp cơ bản','五',true],['N4','N4','Giao tiếp trong đời sống','四',false],['N3','N3','Kỹ năng trung cấp','三',false],['N2','N2','Đọc, nghe nâng cao','二',false],['N1','N1','Năng lực ngôn ngữ chuyên sâu','一',false]];
 return '<section class="v25-panel">'+sectionHead('book','Khóa học · Chọn lộ trình phù hợp')+
 '<p class="v25-tab-intro">Mục tiêu không phải chứng nhận trình độ. Những khóa chưa phát hành chỉ cho xem cấu trúc dự kiến.</p>'+
 '<div class="v25-course-cards">'+lv.map(([id,title,description,glyph,ready])=>{
 const count=lessons.filter(a=>a.course===id&&m.done.has(a.id)).length,total=lessons.filter(a=>a.course===id).length;
 return href('course/'+id,'<div class="v25-course-picture" lang="ja">'+glyph+'</div><div class="v25-course-detail"><strong>'+title+'</strong><p>'+description+'</p>'+label(ready?'Có nội dung mẫu':'Chưa phát hành',ready?'ready':'planned')+
 (ready?'<div class="v25-course-metric">'+progressBar(pct(count,total))+'<small>'+count+'/'+total+' hoạt động trong bản '+(m.sample?'mô phỏng':'ghi nhận')+'</small></div>':'')+'</div><span class="v25-course-open">Xem khóa học '+I('arrow')+'</span>','v25-course-card');
 }).join('')+'</div></section>';
}

/* Foundation: the existing curriculum is the single source of truth.
   A chapter contains topic lessons; the exercise engine supplies practice
   and checks for each topic. Progress is read-only and never inferred from demos. */
const foundationTopicTips={
 a:'5 nguyên âm nền tảng; luyện nhận mặt và phản xạ âm.',
 k:'5 chữ hàng K; phân biệt nét gần nhau khi đổi bảng chữ.',
 s:'し đọc shi, không đọc si; đối chiếu さ・き.',
 t:'ち đọc chi và つ đọc tsu; tránh nhầm với さ.',
 n:'Đọc chậm từng chữ rồi tăng tốc nhận diện.',
 h:'ふ đọc fu; lưu ý phân biệt は・ま・ほ.',
 m:'Luyện phân biệt ま, み, む và các nét tương tự.',
 y:'Hàng Y chỉ có や・ゆ・よ.',
 r:'Âm R tiếng Nhật không hoàn toàn giống R tiếng Việt.',
 w:'を thường đọc gần như o; ん là âm mũi.',
 g:'Dấu ゛ biến hàng K thành hàng G.',
 z:'じ đọc ji, ず đọc zu; chú ý nét và dấu.',
 d:'ぢ・づ có phát âm gần じ・ず; học qua từ để phân biệt.',
 b:'Dấu ゛ biến hàng H thành hàng B.',
 p:'Dấu tròn ゜ biến hàng H thành hàng P.',
 ky:'き + ゃ/ゅ/ょ nhỏ tạo một nhịp âm.',
 sh:'し + ゃ/ゅ/ょ nhỏ: sha, shu, sho.',
 ch:'ち + ゃ/ゅ/ょ nhỏ: cha, chu, cho.',
 ny:'に + ゃ/ゅ/ょ nhỏ: nya, nyu, nyo.',
 hy:'ひ + ゃ/ゅ/ょ nhỏ: hya, hyu, hyo.',
 my:'み + ゃ/ゅ/ょ nhỏ: mya, myu, myo.',
 ry:'り + ゃ/ゅ/ょ nhỏ: rya, ryu, ryo.',
 gy:'ぎ + ゃ/ゅ/ょ nhỏ: gya, gyu, gyo.',
 j:'じ + ゃ/ゅ/ょ nhỏ: ja, ju, jo.',
 by:'び + ゃ/ゅ/ょ nhỏ: bya, byu, byo.',
 py:'ぴ + ゃ/ゅ/ょ nhỏ: pya, pyu, pyo.',
 pause:'っ/ッ nhỏ tạo nhịp ngắt trước phụ âm tiếp theo.',
 length:'Dấu ー kéo dài nguyên âm, thường gặp ở Katakana.',
 vowels:'Nhận diện chữ nhỏ trong âm ghép và từ mượn.',
 mixed:'Trộn hai bảng chữ và các âm đã học để tự kiểm tra.'
};
const foundationLegacyLessons={a:'foundation-vowels',k:'foundation-k-row',s:'foundation-s-row',t:'foundation-t-row'};
function foundationTopics(module,group,data){
 if(module.id!=='small')return data.take(module.id,group.id,'both');
 const w=data.words.filter(x=>x.stage==='small');
 if(group.id==='pause')return w.filter(x=>/[っッ]/u.test(x.glyph));
 if(group.id==='length')return w.filter(x=>x.glyph.includes('ー'));
 if(group.id==='vowels')return w.filter(x=>/[ァィゥェォ]/u.test(x.glyph));
 return w;
}
function foundationModuleCatalogue(){
 const data=window.NPFoundationCurriculum,engine=window.NPFoundationCourse;
 if(!data?.modules?.length||!data.getLessonUnits||!engine?.path){
  return '<section class="v25-panel"><h3>Nền tảng</h3><p>Chưa tải được lộ trình. Vui lòng mở lại khóa Nền tảng.</p>'+href('course/foundation','Xem khóa Nền tảng','v25-text-cta')+'</section>';
 }
 const progress=engine.store?.()?.items||{},modules=data.modules;
 const records=modules.map((m,index)=>{
  const lessons=data.getLessonUnits(m.id);
  const entries=lessons.map((unit,ordinal)=>{
   const cards=foundationTopics(m,unit,data),unique=[...new Set(cards.map(x=>x.id))];
   const practiced=unique.filter(id=>progress[id]?.attempts>0).length;
   const sample=cards[0]||{},parts=unit.groups.map(id=>m.groups.find(g=>g.id===id)).filter(Boolean);
   // Use one representative symbol for a lesson, not the first multi-kana sample word.
   const glyphs={small:{pause:'っ',length:'ー',vowels:'ァ'},mixed:{mixed:'あ'}};
   const displayGlyph=glyphs[m.id]?.[unit.id]||sample.glyph||'あ';
   const search=[m.title,m.subtitle,unit.title,unit.summary,...parts.map(g=>g.title+' '+g.id),...cards.map(x=>x.glyph+' '+x.read)].join(' ').toLocaleLowerCase('vi');
   const partDetails=parts.length>1?'<details class="v125-lesson-parts"><summary>Luyện riêng từng hàng <span aria-hidden="true">⌄</span></summary>'+
     '<div class="v125-parts-list">'+parts.map(g=>'<a href="#'+engine.path(m.id,g.id,'learn')+'">'+safe(g.title)+' <span aria-hidden="true">↗</span></a>').join('')+'</div></details>':'';
   return '<article class="v121-topic v125-lesson" data-v121-topic data-v121-search="'+safe(search)+'">'+
    '<a class="v121-topic-main" href="#'+engine.path(m.id,unit.id,'learn')+'" aria-label="Học '+safe(unit.title)+'">'+
    '<span class="v121-topic-number">'+String(ordinal+1).padStart(2,'0')+'</span>'+
    '<span class="v121-topic-glyph" lang="ja">'+safe(displayGlyph)+'</span>'+
    '<span class="v121-topic-copy"><strong>'+safe(unit.title)+'</strong><small>'+safe(unit.summary)+'</small></span>'+
    '<span class="v121-topic-progress">'+practiced+' / '+unique.length+' mẫu đã luyện</span>'+
    '<span class="v125-lesson-open">Mở bài <span aria-hidden="true">›</span></span></a>'+partDetails+'</article>';
  });
  return {m,index,lessons,entries};
 });
 const total=records.reduce((sum,r)=>sum+r.lessons.length,0);
 const firstPending=modules.flatMap(m=>data.getLessonUnits(m.id).map(unit=>({m,unit,cards:foundationTopics(m,unit,data)})))
   .find(({cards})=>cards.some(x=>!(progress[x.id]?.attempts>0)));
 const start=firstPending||{m:modules[0],unit:data.getLessonUnits(modules[0].id)[0]};
 const initialModule=start.m.id, nextPath=engine.path(start.m.id,start.unit.id,'learn');
 return '<section class="v121-foundation-catalog v125-catalog" aria-labelledby="v121-heading">'+
  '<div class="v121-catalog-heading v123-catalog-heading"><div><p class="v121-eyebrow">FOUNDATION · '+modules.length+' CHẶNG · '+total+' BÀI HỌC</p>'+
  '<h3 id="v121-heading">Chọn bài để học</h3></div></div>'+
  '<div class="v121-toolbar"><label class="v121-search-label"><span class="v121-search-icon" aria-hidden="true">⌕</span>'+
  '<input type="search" data-v121-filter placeholder="Tìm chữ, âm hoặc bài học…" aria-label="Tìm bài học Nền tảng" autocomplete="off"></label>'+
  '<a class="v121-continue" href="#'+nextPath+'">Tiếp tục học →</a></div>'+
  '<p class="v121-search-status" data-v121-status role="status" aria-live="polite" hidden></p>'+
  '<div class="v123-catalog-layout"><nav class="v123-chapter-tabs" aria-label="Chọn chặng Nền tảng">'+records.map(({m,index,lessons})=>
   '<button type="button" class="v123-chapter-tab'+(m.id===initialModule?' is-active':'')+'" data-v123-select="'+safe(m.id)+'" aria-controls="v123-panel-'+safe(m.id)+'" aria-current="'+(m.id===initialModule?'true':'false')+'">'+
   '<span class="v123-chapter-number">'+String(index+1).padStart(2,'0')+'</span>'+
   '<span class="v123-chapter-label">'+safe(m.title.replace(/^\d+\s*[·.:-]\s*/,''))+'</span>'+
   '<small>'+lessons.length+' bài</small></button>').join('')+'</nav>'+
  '<div class="v123-topic-panes">'+records.map(({m,entries})=>
   '<section class="v123-topic-pane" id="v123-panel-'+safe(m.id)+'" data-v123-pane="'+safe(m.id)+'" '+(m.id===initialModule?'':'hidden')+'>'+
   '<div class="v123-pane-heading"><div><strong>'+safe(m.title.replace(/^\d+\s*[·.:-]\s*/,''))+'</strong><p>'+safe(m.subtitle)+'</p></div>'+
   '<a href="#'+engine.path(m.id,'all','learn')+'">Xem toàn chặng ↗</a></div>'+
   '<div class="v123-topic-list">'+entries.join('')+'</div></section>').join('')+'</div></div>'+
  '<p class="v121-catalog-note">Mỗi bài gồm 1–4 hàng chữ liên quan, học theo từng hàng trong cùng một bài. “Đã luyện” không có nghĩa đã ghi nhớ thành thạo; tiến độ cũ theo từng chữ vẫn được giữ.</p>'+
  '</section>';
}

function modulesTab(m){
 const courseLessons=lessons.filter(a=>a.course==='N5');
 const n5Modules=[...new Set(courseLessons.map(a=>a.module))];
 return '<section class="v25-panel v121-modules-page">'+
  sectionHead('layers','Nền tảng · Danh mục bài học','learn/catalog','Khóa học')+
  '<p class="v25-tab-intro">Mở một chặng, chọn nhóm bài và vào học trực tiếp. Không cần mở nhiều tầng menu.</p>'+
  foundationModuleCatalogue()+
  '<section class="v121-next-level"><div class="v32-group-heading"><h3>N5 · Bài học hiện có</h3>'+href('course/N5','Xem khóa N5 '+I('arrow'),'v25-text-cta')+'</div>'+
  n5Modules.map(name=>'<div class="v32-module"><div class="v32-module-title">'+I('layers')+'<strong>'+safe(name)+'</strong></div>'+
  courseLessons.filter(a=>a.module===name).map(a=>href(cellRoute(a,m),'<span class="v25-module-symbol" lang="ja">'+a.icon+'</span><span><strong>'+safe(a.title)+'</strong><em>'+safe(a.desc)+'</em></span>'+label(status(m,a.id)==='done'?'Đã hoàn tất':status(m,a.id)==='current'?'Đang học':'Có thể học',status(m,a.id))+'<span class="v25-module-go">'+I('arrow')+'</span>','v25-module-card')).join('')+'</div>').join('')+
  '</section></section>';
}
/* Scoped search only changes the visible catalogue, never writes learning data. */
/* Search spans all 40 groups. Only the selected chapter is visible normally,
   and search results temporarily reveal matching chapters within the same pane. */
document.addEventListener('click',event=>{
 const button=event.target?.closest?.('[data-v123-select]');
 if(!button)return;
 const area=button.closest('.v121-foundation-catalog');if(!area)return;
 const selected=button.getAttribute('data-v123-select');
 const filter=area.querySelector('[data-v121-filter]');
 if(filter?.value){
  filter.value='';
  area.classList.remove('v123-searching');
  area.querySelectorAll('[data-v121-topic]').forEach(topic=>{topic.hidden=false;});
  const status=area.querySelector('[data-v121-status]');
  if(status){status.hidden=true;status.textContent='';}
 }
 area.querySelectorAll('[data-v123-select]').forEach(tab=>{
  const active=tab.getAttribute('data-v123-select')===selected;
  tab.classList.toggle('is-active',active);
  tab.setAttribute('aria-current',String(active));
 });
 area.querySelectorAll('[data-v123-pane]').forEach(pane=>{
  pane.hidden=pane.getAttribute('data-v123-pane')!==selected;
 });
});
document.addEventListener('input',event=>{
 if(!event.target?.matches?.('[data-v121-filter]'))return;
 const area=event.target.closest('.v121-foundation-catalog');if(!area)return;
 const query=String(event.target.value||'').toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
 let visible=0;
 const current=area.querySelector('[data-v123-select].is-active')?.getAttribute('data-v123-select');
 area.querySelectorAll('[data-v123-pane]').forEach(pane=>{
  const id=pane.getAttribute('data-v123-pane');
  let matches=0;
  pane.querySelectorAll('[data-v121-topic]').forEach(topic=>{
   const haystack=(topic.getAttribute('data-v121-search')||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
   const found=!query||haystack.includes(query);
   topic.hidden=!found;
   if(found)matches++;
  });
  pane.hidden=query?matches===0:id!==current;
  visible+=query?matches:0;
 });
 area.classList.toggle('v123-searching',!!query);
 const status=area.querySelector('[data-v121-status]');
 if(status){status.hidden=!query;status.textContent=query?visible+' nhóm bài phù hợp'+(visible?'':' · Hãy thử Kana, Romaji hoặc tên khác.'):'';}
});

function lessonsTab(m){
 const groups=[['foundation','Nền tảng'],['N5','N5']];
 return '<section class="v25-panel">'+sectionHead('play-circle','Bài học & bài kiểm tra','learn/modules','Module')+
 '<p class="v25-tab-intro">Bài học hướng dẫn chi tiết được phân biệt với luyện Kana theo nhóm; các chặng Foundation khác vẫn có Học, Flashcard, Luyện và Kiểm tra.</p>'+
 '<div class="v121-lessons-notice"><div><strong>Nền tảng · 17 bài học</strong><p>Tìm đầy đủ Hiragana, Katakana, âm đục, âm ghép, chữ nhỏ và tổng ôn trong mục lục.</p></div>'+href('learn/modules','Mở lộ trình 17 bài →','v121-continue')+'</div>'+
 groups.map(([id,titleText])=>'<section class="v32-learning-group"><div class="v32-group-heading"><h3>'+titleText+'</h3>'+href('course/'+id,'Lộ trình '+I('arrow'),'v25-text-cta')+'</div>'+
 lessons.filter(a=>a.course===id).map((a,i)=>'<div class="v32-lesson-entry"><a href="#'+cellRoute(a,m)+'" class="v32-lesson-main"><span class="v25-module-symbol" lang="ja">'+a.icon+'</span><span><small>BÀI '+String(i+1).padStart(2,'0')+' · '+safe(a.module)+'</small><strong>'+safe(a.title)+'</strong><em>'+safe(a.desc)+'</em></span>'+label(status(m,a.id)==='done'?'Đã hoàn tất':status(m,a.id)==='current'?'Đang học':'Chưa bắt đầu',status(m,a.id))+'</a><div class="v32-lesson-actions">'+href(cellRoute(a,m),I('book-open')+' Học','v32-small-action')+href(testRoute(a),I('target')+' Kiểm tra','v32-small-action v32-test-action')+'</div></div>').join('')+'</section>').join('')+'</section>';
}

function practiceTab(m){
 const modules=[['review','Ôn nội dung đến hạn',m.due+' nội dung đến hạn ôn','review'],['help','Lỗi cần củng cố',m.weak.length+' nhóm cần chú ý','mistakes'],['pen','Luyện nhận diện Kana','Tự kiểm tra hình dạng và âm','kana/check'],['book','Luyện đề JLPT','Bộ mẫu N5–N1, không phải đề hoàn chỉnh','exams']];
 return '<section class="v25-panel">'+sectionHead('review','Ôn tập thông minh · Đúng điều cần nhớ')+
 '<p class="v25-tab-intro">Bài đang dở được ưu tiên trước, tiếp theo là lịch ôn và các nội dung dễ nhầm. Kết quả demo không tự xác nhận trình độ.</p>'+
 '<div class="v25-module-cards">'+modules.map(([ic,name,description,route],i)=>href(route,
 '<span class="v25-module-symbol">'+I(ic)+'</span><span><small>'+(['LỊCH ÔN','PHÂN TÍCH LỖI','KANA','JLPT'][i])+'</small><strong>'+name+'</strong><em>'+description+'</em></span><span class="v25-module-go">'+I('arrow')+'</span>','v25-module-card')).join('')+'</div></section>';
}

/* v1.31: Shared Practice hub. Foundation links reuse real question engines;
   N5 exposes released per-lesson tests only. No simulated N4–N1 tests. */
const practiceScopeKey=()=> 'Horizon.Training.scope.v1.'+String(P()?.id||'guest').replace(/[^a-z0-9_-]/gi,'_');
function trainingScope(){
 let parts=route().split('/');
 if(parts.length<3)try{const saved=localStorage.getItem(practiceScopeKey());if(saved?.startsWith('learn/training/'))parts=saved.split('/')}catch(e){}
 const D=window.NPFoundationCurriculum;
 if(parts[2]==='N5'){
  const list=lessons.filter(x=>x.course==='N5'&&x.contentId);
  return {level:'N5',list,lesson:list.some(x=>x.contentId===parts[3])?parts[3]:'all'};
 }
 const mod=D?.modules.find(x=>x.id===parts[3])||D?.modules[0]||null;
 const groups=mod?D.getLessonUnits(mod.id):[];
 const unit=parts[4]==='all'||groups.some(x=>x.id===parts[4])?parts[4]:'all';
 const script=mod?.script==='hira'?'hira':mod?.script==='kata'?'kata':['both','hira','kata'].includes(parts[5])?parts[5]:'both';
 return {level:'foundation',mod,groups,unit,script,mode:parts[6]||''};
}
function trainingRoute(key,value,s){
 if(key==='level')return value==='N5'?'learn/training/N5/all':'learn/training/foundation/hiragana/all/hira';
 if(s.level==='N5')return key==='lesson'?'learn/training/N5/'+(s.list.some(x=>x.contentId===value)?value:'all'):null;
 const D=window.NPFoundationCurriculum;
 if(!s.mod)return null;
 if(key==='module'){
  const m=D.modules.find(x=>x.id===value);
  return m?'learn/training/foundation/'+m.id+'/all/'+(m.script==='hira'?'hira':m.script==='kata'?'kata':'both'):null;
 }
 if(key==='unit')return value==='all'||s.groups.some(x=>x.id===value)?'learn/training/foundation/'+s.mod.id+'/'+value+'/'+s.script:null;
 if(key==='script')return s.mod.script==='both'&&['both','hira','kata'].includes(value)?'learn/training/foundation/'+s.mod.id+'/'+s.unit+'/'+value:null;
 return null;
}
/* v1.32: Keep changes to study scope optional and remember UI preferences by learner. */
const disclosureKey=()=> 'Horizon.Training.scopeExpanded.v1.'+String(P()?.id||'guest').replace(/[^a-z0-9_-]/gi,'_');
const disclosureOpen=()=>{try{return localStorage.getItem(disclosureKey())==='on'}catch(e){return false}};
function recentTrainingMode(options){
 try{
  const key='Horizon.Foundation.recentExercise.v1.'+String(P()?.id||'guest').replace(/[^a-z0-9_-]/gi,'_');
  const mode=localStorage.getItem(key);
  return options.find(x=>x[0]===mode)||null;
 }catch(e){return null}
}

/* HORIZON v1.33: Direct left-side exercise navigation on desktop; compact on mobile. */
function trainingMenu(groups,href,recent,active){
 const items=groups.map(([name,desc,list])=>
  '<section class="v133-nav-group"><h3>'+safe(name)+'</h3>'+
  '<div class="v133-nav-items">'+list.map(([id,title,glyph])=>
  '<a class="v133-nav-item'+(id===active?' is-active':id===recent?' is-recent':'')+'" href="'+href(id)+'"'+(id===active?' aria-current="page"':'')+'>'+
  '<span class="v133-nav-icon" aria-hidden="true">'+glyph+'</span><span class="v133-nav-text">'+safe(title)+'</span>'+
  '<span class="v133-nav-arrow" aria-hidden="true">'+(id===recent?'•':'›')+'</span></a>').join('')+
  '</div></section>').join('');
 return trainingMenuShell(items,'Chọn để luyện ngay');
}
function trainingMenuShell(items,hint){
 return '<aside class="v133-side-menu" aria-label="Các dạng bài luyện tập">'+
  '<div class="v133-side-title"><strong>DẠNG BÀI</strong><small>'+safe(hint)+'</small></div>'+
  '<nav aria-label="Dạng bài">'+items+'</nav></aside>'+
  '<details class="v133-mobile-menu"><summary><span><strong>Chọn dạng bài</strong><small>'+safe(hint)+'</small></span>'+
  '<span class="v133-mobile-arrow" aria-hidden="true">⌄</span></summary>'+
  '<nav aria-label="Dạng bài trên điện thoại">'+items+'</nav></details>';
}

function trainingTab(m){
 const s=trainingScope(),D=window.NPFoundationCurriculum;
 const field=(name,key,options,value)=>'<label class="v131-filter"><span>'+name+'</span><select data-v131-filter="'+key+'" aria-label="'+name+'">'+options.map(x=>'<option value="'+safe(x[0])+'"'+(x[0]===value?' selected':'')+(x[2]?' disabled':'')+'>'+safe(x[1])+'</option>').join('')+'</select></label>';
 const level=field('Cấp độ','level',[['foundation','Nền tảng'],['N5','N5'],['N4','N4 · chưa phát hành',true],['N3','N3 · chưa phát hành',true],['N2','N2 · chưa phát hành',true],['N1','N1 · chưa phát hành',true]],s.level);
 let filters,body;
 if(s.level==='foundation'&&s.mod){
  const chooseModule=field('Nội dung','module',D.modules.map(x=>[x.id,x.title.replace(/^\d+\s*[·.:-]\s*/,'')]),s.mod.id);
  const chooseUnit=field('Bài học','unit',[['all','Toàn bộ nội dung'],...s.groups.map(x=>[x.id,x.title])],s.unit);
  const chooseScript=s.mod.script==='both'?field('Hệ chữ','script',[['both','Cả hai'],['hira','Hiragana'],['kata','Katakana']],s.script):
   '<div class="v131-filter v131-fixed"><span>Hệ chữ</span><strong>'+(s.mod.script==='hira'?'Hiragana':s.mod.script==='kata'?'Katakana':'Theo nội dung')+'</strong></div>';
  filters=level+chooseModule+chooseUnit+chooseScript;
  const fl=id=>'#learn/training/foundation/'+s.mod.id+'/'+s.unit+'/'+s.script+'/'+id;
  const scope=s.unit==='all'?'Toàn bộ nội dung':D.findLessonUnit(s.mod.id,s.unit)?.title||s.unit;
  const canListen=!['small','mixed'].includes(s.mod.id);
  // Only expose word activities if this selected lesson actually has usable words.
  const vocab=D.contextual(s.mod.id,s.script),unit=D.findLessonUnit(s.mod.id,s.unit);
  const row=unit?.groups?.at(-1)||s.unit;
  const ix=s.unit==='all'?D.rows.length-1:D.rows.findIndex(x=>x[0]===row);
  const available=['hiragana','katakana'].includes(s.mod.id)?
   new Set(D.rows.slice(0,Math.max(0,ix)+1).flatMap(r=>Array.from(s.mod.id==='hiragana'?r[2]:r[3]))):null;
  const canWords=(available?vocab.filter(w=>w.stage==='basic'&&Array.from(w.glyph).every(ch=>available.has(ch))):vocab).length>=2;
  const grouped=[
   ['NHẬN DIỆN','Nhớ mặt chữ và cách đọc.',[['quiz','Chữ → âm','あ'],['reverse','Âm → chữ','a'],['truefalse','Đúng / Sai','✓']]],
   ['LUYỆN NGHE','Nghe âm và chọn chữ.',canListen?[['listen','Nghe → chữ','♫'],['listen-match','Nghe & ghép','◖']]:[]],
   ['GHÉP & GHI NHỚ','Ghép cặp, hoàn thành từ.',[['match','Ghép chữ & âm','⇄'],...(canWords?[['build','Xếp chữ thành từ','文'],['missing','Điền chữ còn thiếu','□']]:[])]],
   ['TỪ VỰNG','Nhớ từ và nghĩa.',canWords?[['vocab-ja-vi','Nhật → Việt','日'],['vocab-vi-ja','Việt → Nhật','VI']]:[]],
   ['ÔN TẬP','Tự ôn lại chữ đã học.',[['flash','Flashcard','▤']]]
  ].filter(x=>x[2].length);
  const allModes=grouped.flatMap(x=>x[2]),recent=recentTrainingMode(allModes);
  const selected=allModes.find(x=>x[0]===s.mode)||(s.mode==='mix'?['mix','Kiểm tra tổng hợp','✓']:null);
  const chosen=recent?.[0]||'quiz',heading=recent?'Luyện lại: '+recent[1]:'Luyện nhận diện chữ';
  const description=recent?'Dạng bài bạn đã luyện gần đây.':'Nhận diện Kana và chọn cách đọc; không cần thiết lập thêm.';
  body='<div class="v132-start"><div class="v132-start-copy"><span class="v131-entry-tag">'+(recent?'BÀI LUYỆN GẦN NHẤT':'BẮT ĐẦU NHANH')+'</span>'+
   '<h3>'+safe(heading)+'</h3><p>'+safe(description)+'</p></div>'+
   '<a class="v132-primary" href="'+fl(chosen)+'">Bắt đầu luyện <span aria-hidden="true">→</span></a></div>'+
   '<div class="v132-exam"><div><strong>Kiểm tra tổng hợp</strong><small>Câu hỏi trộn · xem điểm và thời gian</small></div>'+
   '<a href="'+fl('mix')+'">Làm bài kiểm tra <span aria-hidden="true">→</span></a></div>'+
   '<p class="v133-note">Chọn kỹ năng ở menu bên trái để mở bài luyện trực tiếp.</p>'+
   '<p class="v131-disclaimer">Kết quả được lưu riêng theo hồ sơ. Kiểm tra tổng hợp là bài luyện tập, không phải đề JLPT chính thức.</p>';

  if(selected&&window.NPFoundationCourse?.embeddedPractice){
   body='<section class="v134-inline-training v33-foundation v34-studying">'+
    '<header class="v134-inline-heading"><div><span>ĐANG LUYỆN</span><h3>'+safe(selected[1])+'</h3><p>Phạm vi: '+safe(scope==='Toàn bộ nội dung'?s.mod.title:scope)+'</p></div>'+
    '<a class="v134-inline-clear" href="#learn/training/foundation/'+s.mod.id+'/'+s.unit+'/'+s.script+'">Về trang luyện tập <span aria-hidden="true">×</span></a></header>'+
    window.NPFoundationCourse.embeddedPractice()+'</section>';
  }
  body='<div class="v133-two-column">'+trainingMenu(grouped,fl,recent?.[0],s.mode)+
   '<div class="v133-main-area">'+body+'</div></div>';
 }else if(s.level==='N5'){
  filters=level+field('Bài học N5','lesson',[['all','Tất cả bài hiện có'],...s.list.map(a=>[a.contentId,a.title.replace(/^\d+\s*[·.:-]\s*/,'')])],s.lesson);
  const list=s.list.filter(a=>s.lesson==='all'||a.contentId===s.lesson);
  const first=list[0];
  body=(first?'<div class="v132-start"><div class="v132-start-copy"><span class="v131-entry-tag">N5 · BÀI ĐÃ CÓ</span><h3>'+safe(first.title)+'</h3><p>'+safe(first.desc)+'</p></div>'+
   '<a class="v132-primary" href="#quiz/'+safe(first.contentId)+'">Bắt đầu luyện <span aria-hidden="true">→</span></a></div>':
   '<p>Chưa có bài luyện trong phạm vi này.</p>')+
   '<p class="v131-disclaimer">N5 hiện luyện theo từng bài đã có; chưa có kiểm tra tổng hợp toàn cấp. N4–N1 chưa phát hành.</p>';

  const n5items='<section class="v133-nav-group"><h3>BÀI LUYỆN N5</h3><div class="v133-nav-items">'+
   list.map(a=>'<a class="v133-nav-item" href="#quiz/'+safe(a.contentId)+'">'+
   '<span class="v133-nav-icon" aria-hidden="true">文</span><span class="v133-nav-text">'+safe(a.title)+'</span>'+
   '<span class="v133-nav-arrow" aria-hidden="true">›</span></a>').join('')+'</div></section>';
  body='<div class="v133-two-column">'+trainingMenuShell(n5items,'Bài đã có')+
   '<div class="v133-main-area">'+body+'</div></div>';
 }else{filters=level;body='<p>Chưa có nội dung luyện tập phù hợp.</p>'}
 const title=s.level==='N5'?'N5'+(s.lesson==='all'?' · Các bài đã có':' · '+(s.list.find(x=>x.contentId===s.lesson)?.title||'Bài học')):
  'Nền tảng · '+s.mod.title.replace(/^\d+\s*[·.:-]\s*/,'')+(s.unit==='all'?'':' · '+(D.findLessonUnit(s.mod.id,s.unit)?.title||s.unit));
 const disclosure='<details class="v132-scope"'+(disclosureOpen()?' open':'')+'><summary><span><small>PHẠM VI ĐANG LUYỆN</small><strong>'+safe(title)+'</strong></span>'+
  '<span class="v132-scope-change">Đổi phạm vi <span aria-hidden="true">⌄</span></span></summary>'+
  '<div class="v131-filters" role="group" aria-label="Lọc phạm vi luyện tập">'+filters+'</div></details>';
 if(typeof queueMicrotask==='function'&&!s.mode)queueMicrotask(()=>window.NPTrainingGuide?.maybeStart?.());
 const guidePref=(()=>{try{return localStorage.getItem('Horizon.Training.guide.v134.'+
  String(P()?.id||'guest').replace(/[^a-z0-9_-]/gi,'_'))==='repeat'}catch(e){return false}})();
 const help='<div class="v134-guide-tools">'+
  '<button type="button" data-v134-guide="start" title="Xem hướng dẫn cách dùng Luyện tập">? Hướng dẫn</button>'+
  '<button type="button" data-v134-guide="toggle" aria-pressed="'+guidePref+'" title="Bật hoặc tắt hướng dẫn tự động ở lần mở sau">Tự mở: '+(guidePref?'Bật':'Tắt')+'</button></div>';
 return '<section class="v25-panel v131-training v132-training" aria-labelledby="v131-title">'+
  '<header class="v131-heading v134-heading"><div><span>KHÔNG GIAN LUYỆN TẬP</span>'+
  '<h2 id="v131-title">Luyện tập</h2><p>Chọn dạng bài bên trái và thực hành ngay bên phải, không rời trang.</p></div>'+
  help+'</header>'+disclosure+body+'</section>';
}

function otherTab(tab){
 const m=model();const canonical=tab==='modules'?'catalog':tab==='lessons'?'catalog':tab;
 const content=canonical==='catalog'?catalogueTab(m):canonical==='training'?trainingTab(m):canonical==='practice'?practiceTab(m):overview();

 return '<div class="v25-wrap" data-learning-hub="v33">'+tabTop(canonical,m)+content+
 '<div class="v25-version">Tiến độ học · '+(m.sample?'Dữ liệu minh họa':'Tiến độ đã ghi nhận')+'</div></div>';
}
function detail(id){
 const m=model(),foundation=id==='foundation',n5=id==='N5';
 const levelNames={foundation:'Nền tảng',N5:'N5',N4:'N4',N3:'N3',N2:'N2',N1:'N1'};
 if(!levelNames[id])return originalCourse(id);
 const name=levelNames[id],act=activities.filter(a=>a.course===id),graded=act.filter(a=>a.kind==='lesson'),done=graded.filter(a=>m.done.has(a.id)).length;
 return '<div class="v25-wrap" data-learning-hub="v33">'+
 '<div class="v28-header-shell"><header class="v25-header"><div class="v25-hero-copy"><h1>'+safe(Locale.t(name))+' · '+safe(Locale.t('Lộ trình học'))+'</h1><p>'+(act.length?'Chọn hoạt động để bắt đầu hoặc tiếp tục học.':'Khung chương trình dự kiến · Nội dung chưa phát hành.')+'</p></div></header>'+
 navigation('catalog')+'</div>'+
 '<nav class="v25-breadcrumb" aria-label="Vị trí học tập">'+href('learn/overview','Tổng quan')+'<span aria-hidden="true">›</span>'+href('learn/catalog','Khóa học')+'<span aria-hidden="true">›</span><span aria-current="page">'+name+'</span></nav>'+
 (m.sample?'<div class="v25-fixture-notice">'+I('info')+' Trạng thái mô phỏng cho '+safe(m.learner.name)+' · không phải điểm bài học thật.</div>':'')+
 '<section class="v25-panel">'+sectionHead('book-open','Module & bài học')+
 '<div class="v25-detail-summary"><span>'+label(act.length?'Nội dung mẫu':'Chưa phát hành',act.length?'ready':'planned')+'</span><span>'+(act.length?done+' / '+graded.length+' bài học hoàn tất':'Chưa có bài học được phát hành')+'</span>'+(act.length?progressBar(pct(done,graded.length)):'')+'</div>'+
 '<div class="v25-lesson-cards">'+(act.length?[...new Set(act.map(a=>a.module))].map(moduleName=>'<div class="v32-module"><div class="v32-module-title">'+I('layers')+'<strong>'+safe(moduleName)+'</strong><small>'+act.filter(x=>x.module===moduleName).length+' mục</small></div>'+act.filter(a=>a.module===moduleName).map(a=>'<div class="v32-lesson-entry"><a class="v32-lesson-main" href="#'+cellRoute(a,m)+'"><span class="v25-module-symbol" lang="ja">'+a.icon+'</span><span><small>'+(a.kind==='lesson'?'BÀI HỌC':'CÔNG CỤ LUYỆN TẬP')+'</small><strong>'+safe(a.title)+'</strong><em>'+safe(a.desc)+'</em></span>'+label(a.kind==='tool'?'Công cụ':status(m,a.id)==='done'?'Đã hoàn tất':status(m,a.id)==='current'?'Đang học':'Có thể học',a.kind==='tool'?'future':status(m,a.id))+'</a><div class="v32-lesson-actions">'+href(cellRoute(a,m),I('book-open')+(a.kind==='lesson'?' Học':' Mở công cụ'),'v32-small-action')+(a.kind==='lesson'?href(testRoute(a),I('target')+' Kiểm tra','v32-small-action v32-test-action'):'')+'</div></div>').join('')+'</div>').join(''):'<div class="v27-empty"><strong>Chưa có nội dung để bắt đầu</strong><p>Khóa học này đang ở giai đoạn lập lộ trình. Bạn có thể trở lại các khóa đã có nội dung mẫu.</p>'+href('learn/catalog','Trở lại danh sách khóa học '+I('arrow'),'v25-text-cta')+'</div>')+'</div></section>'+
 '<div class="v25-version">Không gian học tập</div></div>';
}

document.addEventListener('toggle',event=>{
 const node=event.target;
 if(!node?.classList?.contains?.('v132-scope'))return;
 try{localStorage.setItem(disclosureKey(),node.open?'on':'off')}catch(e){}
},true);
document.addEventListener('change',event=>{
 const node=event.target.closest?.('[data-v131-filter]');
 if(!node||!document.querySelector?.('.v131-training'))return;
 const next=trainingRoute(node.dataset.v131Filter,node.value,trainingScope());
 if(!next)return;
 try{localStorage.setItem(practiceScopeKey(),next)}catch(e){}
 if(location.hash==='#'+next){render(false);return}
 location.hash='#'+next;
});
document.addEventListener('click',event=>{
 const choice=event.target.closest?.('.v133-nav-item,.v132-primary,.v132-exam>a,.v134-inline-clear');
 const destination=choice?.getAttribute?.('href')?.replace(/^#\/?/,'');
 if(document.querySelector?.('.v131-training')&&destination?.startsWith('learn/training/foundation/')){
  event.preventDefault();
  if(location.hash!=='#'+destination){
   if(typeof history!=='undefined'&&history.replaceState)history.replaceState(null,'','#'+destination);
   else location.hash='#'+destination;
  }
  render(false);
  return;
 }
 const trigger=event.target.closest?.('[data-v131-scroll]');
 if(!trigger)return;
 const target=document.getElementById?.('v131-activities');
 if(!target)return;
 event.preventDefault();
 target.scrollIntoView?.({behavior:'smooth',block:'start'});
 target.focus?.({preventScroll:true});
});
const originalLearn=learnPage,originalCourse=coursePage,originalTitle=titleOf;
learnPage=function(){const r=route();if((r==='learn/foundation'||r.startsWith('learn/foundation/'))&&window.NPFoundationCourse)return window.NPFoundationCourse.page(r);if((r==='learn/modules'||r==='learn/lessons')&&window.NPFoundationCourse)return window.NPFoundationCourse.page('course/foundation');if(r==='learn'||r==='learn/overview')return overview();if(r.startsWith('learn/'))return otherTab(r.split('/')[1]);return originalLearn()};
coursePage=function(id){if(id==='foundation'&&window.NPFoundationCourse)return window.NPFoundationCourse.page('course/foundation');return detail(id)};
titleOf=function(r){return r==='learn'||r==='learn/overview'?'Không gian học tập':originalTitle(r)};
window.NPHorizonV25={version:'v33',model,activities:()=>activities.map(a=>({...a})),foundationCatalogue:foundationModuleCatalogue,shell:(selected='catalog')=>'<div class="v28-header-shell"><header class="v25-header"><div class="v25-hero-copy"><h1>Không gian học tập</h1><p>Học tiếng Nhật theo từng bước, dễ tìm bài và ôn lại.</p></div></header>'+navigation(selected)+'</div>'};
if(location.hash==='#learn'||location.hash==='#learn/overview'||location.hash.startsWith('#learn/foundation/')||location.hash==='#learn/foundation'||location.hash==='#course/foundation')queueMicrotask(()=>render(false));
})();