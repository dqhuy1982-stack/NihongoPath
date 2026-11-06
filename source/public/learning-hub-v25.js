/* HORIZON v25 · Mockup fidelity. Read-only view model; no writes to learner storage. */
(function(){
'use strict';
const VERSION='v25', safe=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const I=(name)=>icon(name), href=(route,label,cls='v25-link')=>'<a class="'+cls+'" href="#'+route+'">'+label+'</a>';
/* Six directly navigable learning activities for the illustrative journey, never fabricated published lessons. */
const activities=[
 {id:'vowels',title:'Năm chữ đầu tiên',desc:'あ・い・う・え・お',group:'Hiragana',module:'Hiragana',course:'foundation',route:'lesson/foundation-vowels',icon:'あ'},
 {id:'writing',title:'Luyện viết Kana',desc:'Quan sát từng nét và tự viết',group:'Luyện viết',module:'Kana Studio',course:'foundation',route:'kana',icon:'書'},
 {id:'recognition',title:'Kiểm tra nhận diện',desc:'Chọn âm đúng của Kana',group:'Ôn tập',module:'Kana Studio',course:'foundation',route:'kana/check',icon:'読'},
 {id:'intro',title:'Giới thiệu bản thân',desc:'N5 · Mẫu câu đầu tiên',group:'Mẫu câu',module:'N5',course:'N5',route:'lesson/n5-introduction',icon:'日'},
 {id:'revision',title:'Ôn trí nhớ',desc:'Nhớ lại bài đã học',group:'Ôn tập',module:'N5',course:'N5',route:'review',icon:'復'},
 {id:'exam',title:'Thử đề JLPT',desc:'Bộ đề mẫu theo cấp độ',group:'Luyện đề',module:'N5',course:'N5',route:'exams',icon:'試'}
];
/* Scenario seeds: only input observations; displayed percentages and states are derived below.
   These fixtures are not written to localStorage and never count as real learner mastery. */
const examples={
 'demo-a':{done:['vowels','writing','recognition'],current:'intro',step:2,steps:6,results:[true,true,false,true,true,true,false,true,true,true],minutes:[20,15,20,10],weekGoal:5,reviewDue:['kana-recognition','kana-reading'],weak:['Âm ghép','Cách đọc Kana']},
 'demo-b':{done:['vowels','writing','recognition','intro','revision'],current:'exam',step:1,steps:5,results:[true,true,true,true,true,true,true,true,false,true,true,true],minutes:[30,30,25,20,20],weekGoal:5,reviewDue:['vocabulary'],weak:['Đọc hiểu N2','Từ vựng N2']},
 'demo-c':{done:['vowels','writing'],current:'recognition',step:1,steps:4,results:[true,false,true,false,true,true],minutes:[15,15,10],weekGoal:4,reviewDue:['kana-recognition','kana-voiced'],weak:['Nhận diện Kana','Âm đục']},
 'demo-d':{done:['vowels'],current:'writing',step:1,steps:5,results:[true,true,false,true],minutes:[10,10],weekGoal:4,reviewDue:['kana-writing'],weak:['Tập viết','Hình dạng Kana']}
};
const pct=(part,total)=>total>0?Math.min(100,Math.round(part/total*100)):0;
const status=(data,id)=>data.done.has(id)?'done':data.current===id?'current':'future';
const toMinutes=s=>Array.isArray(s)?s.reduce((n,x)=>n+Number(x||0),0):0;
function model(){
 const learner=P(),real=window.NPLearningHub?.read?.()||{},sessions=real.sessions||[],attempts=real.attempts||[],reviews=real.reviews||[];
 const hasReal=sessions.length>0,seed=!hasReal?examples[learner.id]||null:null;
 if(seed){
  const completed=new Set(seed.done.filter(id=>activities.some(a=>a.id===id)));
  const current=activities.some(a=>a.id===seed.current)?seed.current:activities[0].id;
  const answered=seed.results.length,correct=seed.results.filter(Boolean).length;
  const done=completed.size,total=activities.length;
  const minutes=toMinutes(seed.minutes),goal=seed.weekGoal;
  return {learner,sample:true,done:completed,current,step:seed.step,steps:seed.steps,answered,correct,
   count:done,total,percent:pct(done,total),minutes,days:seed.minutes.length,weekGoal:goal,weekly:pct(seed.minutes.length,goal),
   weak:seed.weak,due:seed.reviewDue.length,actualPending:false,actualContent:null,
   info:'Dữ liệu mô phỏng theo hồ sơ — không ghi vào kết quả học thật.'};
 }
 const completedSessions=sessions.filter(x=>x.status==='completed');
 const pending=sessions.filter(x=>x.status!=='completed').sort((a,b)=>String(b.updatedAt||'').localeCompare(String(a.updatedAt||'')));
 const active=pending[0]||null;
 const contentToId=id=>id==='foundation-vowels'?'vowels':id==='n5-introduction'?'intro':null;
 const done=new Set(completedSessions.map(x=>contentToId(x.contentId)).filter(Boolean));
 const selected=active?contentToId(active.contentId):(!done.has('vowels')?'vowels':'intro');
 const completedUnits=sessions.reduce((n,s)=>n+(s.completedUnits?.length||0),0);
 const totalUnits=sessions.reduce((n,s)=>n+(s.units?.length||0),0);
 const answers=attempts.filter(a=>a.kind!=='repair');
 const minutes=Math.round(sessions.reduce((n,s)=>n+(Number(s.current?.activeMs||0)/60000),0));
 const due=reviews.filter(r=>new Date(r.dueAt).getTime()<=Date.now()).length;
 const wrong=answers.filter(a=>!a.correct).length;
 return {learner,sample:false,done,current:selected||'vowels',step:active?.index+1||1,steps:active?.units?.length||0,
  answered:answers.length,correct:answers.filter(a=>a.correct&&!a.hintUsed).length,
  count:completedUnits,total:totalUnits,percent:pct(completedUnits,totalUnits),minutes,days:null,weekGoal:null,weekly:null,
  weak:wrong?['Câu sai cần ôn']:[],due,actualPending:!!active,actualContent:active?.contentId||null,
  info:totalUnits?'Tiến độ bước trong các phiên đã ghi nhận.':'Chưa có phiên học được ghi nhận.'};
}
function label(text,cl=''){return '<span class="v25-badge '+cl+'">'+text+'</span>'}
function header(){
 return '<header class="v25-header"><div class="v25-hero-copy"><h1>Không gian học tập</h1><p>Học tiếng Nhật có lộ trình, đúng trọng tâm, mỗi ngày một bước tiến.</p></div></header>'+
 '<nav class="v25-tabs" aria-label="Điều hướng trong mục Học">'+[
 ['overview','Tổng quan học','home'],['catalog','Khóa học','book'],['modules','Module','layers'],['lessons','Bài học','play'],['practice','Ôn thông minh','review']
 ].map(([id,title,ic])=>href('learn/'+id,I(ic)+'<span>'+title+'</span>','v25-tab '+(id==='overview'?'active':''))).join('')+'</nav>';
}
function progressBar(value){return '<span class="v25-progress-track" role="progressbar" aria-label="Tiến độ" aria-valuenow="'+value+'" aria-valuemin="0" aria-valuemax="100"><span style="width:'+value+'%"></span></span>'}
function ring(value){return '<div class="v25-ring" role="img" aria-label="'+value+'% tiến độ" style="--v25-progress:'+value+'%"><div class="v25-ring-center"><strong>'+value+'%</strong></div></div>'}
function sectionHead(iconName,title,link,labelText='Xem tất cả'){
 return '<header class="v25-section-head"><h2>'+I(iconName)+' '+title+'</h2>'+(link?href(link,labelText+' '+I('arrow'),'v25-text-cta'):'')+'</header>';
}
function focus(m){
 const unit=activities.find(a=>a.id===m.current)||activities[0];
 const pending=m.actualPending;
 const focusRoute=pending?(m.actualContent==='n5-introduction'||m.actualContent==='foundation-vowels'?'lesson/resume':'learn/lessons'):unit.route;
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
 return '<section class="v25-panel v25-statpanel">'+sectionHead('chart',title,'reports','Chi tiết')+
 '<div class="v25-statmain">'+ring(m.percent)+'<dl>'+
 '<div><dt>'+I('book')+' '+(m.sample?'Hoạt động hoàn tất':'Bước hoàn tất')+'</dt><dd>'+m.count+' / '+m.total+'</dd></div>'+
 '<div><dt>'+I('clock')+' Thời gian</dt><dd>'+m.minutes+' phút</dd></div>'+
 '<div><dt>'+I('calendar')+' '+(m.sample?'Buổi học mô phỏng':'Phiên hoàn tất')+'</dt><dd>'+(m.sample?m.days:(m.done.size))+'</dd></div>'+
 '</dl></div><p class="v25-tiny">'+safe(m.info)+'</p></section>';
}
function weekly(m){
 return '<section class="v25-panel v25-week">'+sectionHead('compass','Mục tiêu tuần này','settings/goals','Chỉnh mục tiêu')+
 (m.sample?'<p>Hoàn thành '+m.weekGoal+' buổi học trong tuần</p>'+progressBar(m.weekly)+'<div class="v25-week-detail"><span>'+m.days+' / '+m.weekGoal+' buổi đã học</span><strong>'+m.weekly+'%</strong></div>':
 '<p>Đặt lịch học để theo dõi mục tiêu từng tuần.</p>'+href('settings/goals','Thiết lập mục tiêu '+I('arrow'),'v25-text-cta'))+'</section>';
}
function recommendations(m){
 const list=m.due?[['review','Ôn lại phần cần nhớ',m.due+' nội dung cần kiểm tra lại','review']]:[];
 list.push(['review','Luyện nhận diện Kana','Ôn theo chữ và cách đọc','kana/check']);
 if(m.weak.length)list.push(['help','Xem điểm dễ nhầm',m.weak.slice(0,2).join(' · '),'mistakes']);
 return '<section class="v25-panel v25-recommend">'+sectionHead('leaf','Gợi ý học tiếp theo')+
 '<div class="v25-recommend-stack">'+list.slice(0,3).map(([ic,title,desc,dest])=>href(dest,
 '<span class="v25-recommend-icon">'+I(ic)+'</span><span><strong>'+safe(title)+'</strong><small>'+safe(desc)+'</small></span>'+I('chevron'),'v25-recommend-item')).join('')+'</div></section>';
}
function stages(m){
 const levels=[['foundation','Nền tảng','leaf'],['N5','N5','book'],['N4','N4','map'],['N3','N3','map'],['N2','N2','map'],['N1','N1','map']];
 const active=m.learner.goal==='Nền tảng'?'foundation':m.learner.goal;
 return '<div class="v25-stage-rail" aria-label="Chọn cấp độ">'+levels.map(([id,title,ic])=>href('course/'+id,I(ic)+'<strong>'+title+'</strong>','v25-level '+(active===id?'current':''))).join('')+'</div>';
}
function cellRoute(act,m){return m.actualPending && m.actualContent===(act.id==='vowels'?'foundation-vowels':act.id==='intro'?'n5-introduction':null)?'lesson/resume':act.route}
function activityState(act,m){
 const state=status(m,act.id);
 return '<span class="v25-row-status '+state+'">'+(state==='done'?I('check'):state==='current'?I('play'):I('lock'))+'</span>';
}
function hierarchy(m){
 const list=activities.filter(a=>a.course==='foundation').slice(0,3);
 return '<section class="v25-panel v25-hierarchy">'+sectionHead('layers','Lộ trình học theo cấp độ','journey','Xem lộ trình')+
 stages(m)+'<div class="v25-columns">'+
 '<div class="v25-column"><h3>'+I('book')+' Khóa học</h3>'+
 href('course/foundation',I('leaf')+'<span><strong>Nền tảng</strong><small>Hiragana và công cụ luyện</small></span>'+I('chevron'),'v25-h-row selected')+
 href('course/N5',I('book')+'<span><strong>JLPT N5</strong><small>Có bài mẫu</small></span>'+I('chevron'),'v25-h-row')+
 href('course/N4',I('map')+'<span><strong>N4–N1</strong><small>Lộ trình dự kiến</small></span>'+I('chevron'),'v25-h-row')+'</div>'+
 '<div class="v25-column"><h3>'+I('layers')+' Module</h3>'+
 href('course/foundation',I('book')+'<span><strong>Hiragana</strong><small>Nguyên âm & nhận diện</small></span>'+I('chevron'),'v25-h-row selected')+
 href('kana',I('pen')+'<span><strong>Kana Writing Studio</strong><small>Xem nét, tự viết</small></span>'+I('chevron'),'v25-h-row')+
 href('course/N5',I('book')+'<span><strong>Mẫu câu N5</strong><small>Giới thiệu bản thân</small></span>'+I('chevron'),'v25-h-row')+'</div>'+
 '<div class="v25-column v25-lesson-column"><h3>'+I('play')+' Bài học & hoạt động ('+activities.length+')</h3>'+
 activities.map((a,i)=>href(cellRoute(a,m),activityState(a,m)+'<span><strong>'+(i+1)+'. '+safe(a.title)+'</strong><small>'+safe(a.group)+'</small></span>','v25-lesson-row '+status(m,a.id))).join('')+
 '</div></div></section>';
}
function mini(m){
 const current=activities.find(a=>a.id===m.current)||activities[0];
 const next=activities.find(a=>status(m,a.id)==='future')||current;
 const tiles=[
  ['play','Tiếp tục học',current.title,cellRoute(current,m),m.percent+'%'],
  ['book','Bài đang học',current.module,cellRoute(current,m),m.sample?m.step+' / '+m.steps+' bước':'Xem bài'],
  ['review','Ôn lại hôm nay',m.due+' nội dung cần xem', 'review',m.sample?'Mô phỏng':'Theo lịch'],
  ['compass','Bước tiếp theo',next.title,next.route,'Xem bài']
 ];
 return '<div class="v25-minis">'+tiles.map(([ic,name,val,dest,meta])=>href(dest,
 '<span class="v25-mini-title">'+I(ic)+' '+name+'</span><strong>'+safe(val)+'</strong><span class="v25-mini-bottom"><small>'+safe(meta)+'</small>'+I('arrow')+'</span>','v25-mini')).join('')+'</div>';
}
function overview(){
 const m=model();if(!m)return '<p>Không thể đọc hồ sơ.</p>';
 return '<div class="v25-wrap" data-learning-hub="v25">'+header()+
 '<div class="v25-breadcrumb">'+I('home')+' Học <span>›</span> '+safe(m.learner.goal)+' <span>›</span> Lộ trình & nội dung</div>'+
 (m.sample?'<div class="v25-fixture-notice">'+I('info')+' DỮ LIỆU MẪU · Mô phỏng theo hồ sơ '+safe(m.learner.name)+'. Tất cả tỷ lệ tính từ hoạt động giả lập, không phải kết quả học thực tế.</div>':'')+
 '<div class="v25-dashboard"><div class="v25-left">'+focus(m)+hierarchy(m)+'</div><div class="v25-right">'+progress(m)+weekly(m)+recommendations(m)+'</div></div>'+
 mini(m)+'<div class="v25-version">HORIZON · Learning Hub v25 · '+(m.sample?'Scenario preview':'Recorded progress')+'</div></div>';
}
const originalLearn=learnPage,originalCourse=coursePage,originalTitle=titleOf;
learnPage=function(){if(route()==='learn'||route()==='learn/overview')return overview();return originalLearn()};
coursePage=function(id){return originalCourse(id)};
titleOf=function(r){return r==='learn'||r==='learn/overview'?'Không gian học tập':originalTitle(r)};
window.NPHorizonV25={version:VERSION,model,activities:()=>activities.map(a=>({...a}))};
if(location.hash==='#learn'||location.hash==='#learn/overview')queueMicrotask(()=>render(false));
})();