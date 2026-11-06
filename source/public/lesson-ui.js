/* N5 pilot UI: rendering and persistence only; learning rules live in lesson-engine.js. */
(function(){
  'use strict';
  const E=NPLessonEngine,S=NPLessonStore,catalog=NPContentCatalog,params=new URLSearchParams(location.search),previewId=params.get('content-preview');
  let C=catalog.get(),previewState=null,previewError='';
  const isPreview=()=>previewId!==null;
  function initPreview(){const draft=catalog.draft(previewId);previewState=E.create('author-preview');if(!draft){previewError='Bản nháp không còn tồn tại.';return;}const errors=NPContentModel.validate(draft.content).filter(i=>i.severity==='error');if(errors.length){previewError=errors[0].message;return;}previewError='';C=E.copy(draft.content);E.start(previewState,C,{minutes:Number(params.get('preview-minutes'))||5,context:{place:'desk',headphones:false,speech:false},reading:'show',name:'Người học mẫu'});}
  if(isPreview())initPreview();
  const baseline=()=>new URLSearchParams(location.search).get('lesson-view')==='before';
  const date=value=>new Intl.DateTimeFormat('vi-VN',{timeZone:'Asia/Tokyo',day:'numeric',month:'numeric',year:'numeric'}).format(new Date(value));
  let clock=null,storageError='';
  function read(p=P()){if(isPreview())return previewState;try{return S.read(localStorage,p.id);}catch(error){storageError=error.message;return null;}}
  function ruby(value,definition=C){
    const keys=Object.keys(definition.readings).sort((a,b)=>b.length-a.length),pattern=new RegExp('('+keys.map(key=>key.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')','g');
    return String(value).split(pattern).map(part=>definition.readings[part]?`<ruby>${esc(part)}<rt>${esc(definition.readings[part])}</rt></ruby>`:esc(part)).join('');
  }
  const jp=(value,definition=C)=>`<span class="n5-jp">${String(value).split(/([\u3040-\u30ff\u3400-\u9fff々〆ヶー。、？！・…]+)/).map(part=>/[\u3040-\u30ff\u3400-\u9fff]/.test(part)?`<span lang="ja">${ruby(part,definition)}</span>`:esc(part)).join('')}</span>`;
  const attr=s=>s?`data-session="${esc(s.id)}" data-unit="${esc(E.unit(s)?.id||'')}"`:'';
  const b=(label,action,cls='btn',s=null,extra='')=>button(label,'n5-'+action,cls,`${attr(s)} ${action==='start'&&!extra.includes('data-content=')?'data-content="'+esc(C.id)+'"':''} ${extra}`);
  function errorBox(){return storageError?`<div class="notice n5-error" role="alert"><div><strong>Chưa lưu được thay đổi.</strong><p>${esc(storageError)}</p>${b('Xuất bản lưu để kiểm tra','export','textlink')}</div></div>`:'';}
  function wrap(state,html){const ribbon=isPreview()?`<header class="n5-preview-ribbon"><div><strong>Xem trước bản nháp · ${esc(C.title)}</strong><span>Đáp án thử không lưu vào hồ sơ học viên.</span></div>${b('Chạy lại','preview-restart','textlink')}</header>`:'';return ribbon+`<div class="n5-reader${html.includes('n5-player-compact')?' n5-reader-playing':''}" data-n5-root data-revision="${state?.revision??-1}">${errorBox()}${html}</div>`;}
  function statusLine(s){return `<div class="n5-save"><span class="n5-save-dot" aria-hidden="true"></span>${isPreview()?'Phiên thử trong bộ nhớ · không lưu kết quả':storageError?'Có thay đổi chưa lưu':'Đã lưu trên trình duyệt này'}<span>·</span>${s?`${s.minutes} phút đã chọn`:'Chưa bắt đầu phiên'}</div>`;}
  /* Hiragana pilot has no furigana entries: resolve its genuine Kana-to-romaji
     reading without changing lesson content or writing a fake assessment. */
  function kanaReading(s,u=E.unit(s),q=null){
    if(s?.contentId!=='foundation-vowels')return '';
    const concepts=s.definition?.concepts||[];
    const c=concepts.find(item=>item.id==='kana-'+(u?.cardId||'')||(q&&item.questionId===q.id));
    return c?.reading||'';
  }
  function visibleReading(s,u=E.unit(s)){
    // An unaided question never inherits the Learn-stage "show" preference.
    return s?.reading==='show'&&!(u?.type==='question'&&!s.current?.hintUsed&&!s.current?.feedbackId);
  }
  function readingButton(s){
    const visible=visibleReading(s),U=(key)=>Locale.ui('lesson.mockup.'+key);
    return b(icon(visible?'eye-off':'eye')+' '+U(visible?'readHide':'readShow'),'reading','btn sm n5-reading-switch',s,
      `aria-pressed="${visible}" aria-label="${U(visible?'readHide':'readShow')}"`);
  }
  function startOptions(p=P()){const ctx=context(p);return{minutes:ctx.minutes,priority:NPAdvicePolicy.normalize(p.prefs.studyPriority),context:ctx,reading:p.prefs.furigana==='always'?'show':'hide',name:p.name};}
  function landing(state,mode='lesson'){
    const pending=E.pending(state).find(s=>s.contentId===C.id&&s.mode===mode),last=E.latest(state),ctx=context(),minutes=ctx.minutes<=5?5:15,headline=C.headline?.length?C.headline:C.id===catalog.base.id?['Một lời chào.','Một kết nối mới.']:[C.title],introVisual=C.id==='foundation-vowels'?'<span lang="ja">あ · い<br>う · え · お</span><small>FIVE HIRAGANA VOWELS.</small>':'<span lang="ja">はじめ<br>まして。</span><small>FIRST WORDS, NEW WORLDS.</small>';
    return wrap(state,`${link('Thư viện bài','library','textlink','back')}<header class="n5-heading"><span class="eyebrow">${esc(C.level)} · BÀI MẪU · v${C.version}</span><h1>${esc(headline[0])}${headline[1]?'<br><em>'+esc(headline[1])+'</em>':''}</h1><p>${esc(C.lead||'Học một mẫu nhỏ, thử nhớ lại và dùng cho chính mình.')}</p></header><section class="n5-entry card"><div class="n5-entry-visual" aria-hidden="true"><span class="n5-disc"></span>${introVisual}</div><div class="n5-entry-content"><span class="eyebrow">${mode==='practice'?'LUYỆN NHỚ ĐỘC LẬP':'CHỌN MỘT NHỊP VỪA SỨC'}</span><h2>${pending?'Bạn còn một phiên đang dở.':'Hôm nay, bạn có bao lâu?'}</h2>${pending?`<p>${pending.completedUnits.length}/${pending.units.length} bước đã đi qua · Giữ cả câu đang chọn và gợi ý đã dùng.</p>${b('Tiếp tục đúng chỗ '+icon('arrow'),'resume','btn primary',pending)}`:`<p>Chọn một phiên ngắn hoặc đầy đủ hơn. Mỗi phiên dùng các bước đã được biên soạn riêng.</p><div class="n5-time-options">${(C.id==='foundation-vowels'?[3,5]:(ctx.minutes===3?[3,5,15]:[5,15])).map(m=>b(`<strong>${m}<small> phút</small></strong><span>${m===3?(C.id==='foundation-vowels'?'Ba câu nhận diện':'Một mẫu, hai câu nhớ lại'):m===5?'Gọn, dùng được ngay':'Hiểu thêm, dùng linh hoạt'}</span>`,'start',`n5-time ${minutes===m?'suggested':''}`,null,`data-minutes="${m}" data-mode="${mode}"`)).join('')}</div>`}<div class="n5-entry-meta"><span>${icon('book')} Đọc & chạm · Không cần bật âm thanh</span><span>${icon('review')} Có lịch thử nhớ lại vào ngày mai</span></div></div></section><div class="n5-promise"><span>01 <strong>Hiểu trong ngữ cảnh</strong></span><span>02 <strong>Thử nhớ trước khi xem</strong></span><span>03 <strong>Biết rõ điều cần ôn</strong></span></div>${last?`<p class="article-note">${link('Xem tổng kết gần nhất','summary/'+encodeURIComponent(last.id),'textlink','chart')}</p>`:''}<p class="article-note">Bài mẫu tự biên soạn · Tiến độ lưu theo hồ sơ trên trình duyệt. Đồng bộ giữa các thiết bị sẽ cần backend. <a class="textlink" href="lesson-compare.html" target="_blank" rel="noopener">Xem trước / sau · PC, tablet, mobile ↗</a></p>`);
  }
  function personalText(s){const p=s.personal,parts=['はじめまして。'];if(p.name.trim())parts.push(p.name.trim()+'です。');if(p.role)parts.push(p.role+'です。');if(p.country)parts.push(p.country+'から来ました。');parts.push('よろしくお願いします。');return parts.join('\n');}
  function personal(s){return `<div class="n5-personal"><div><span class="eyebrow">TỪ BÀI HỌC ĐẾN CHÍNH BẠN</span><h2>Bây giờ, đến lượt bạn.</h2><p>Chọn thông tin muốn chia sẻ. Bạn có thể giữ tên Latin; bản mẫu chưa chuyển tên sang Katakana.</p><label for="n5-name">Tên muốn dùng</label><input id="n5-name" data-n5-field="name" maxlength="60" value="${esc(s.personal.name)}" autocomplete="off"><label for="n5-role">Vai trò <span class="small">· Không bắt buộc</span></label><select id="n5-role" data-n5-field="role"><option value="">Chưa thêm</option>${[['学生','Học sinh / sinh viên'],['会社員','Nhân viên công ty']].map(([v,l])=>`<option value="${v}" ${s.personal.role===v?'selected':''}>${l}</option>`).join('')}</select>${s.minutes>5?`<label for="n5-country">Nơi đến từ <span class="small">· Không bắt buộc</span></label><select id="n5-country" data-n5-field="country"><option value="">Chưa thêm</option>${[['ベトナム','Việt Nam'],['日本','Nhật Bản']].map(([v,l])=>`<option value="${v}" ${s.personal.country===v?'selected':''}>${l}</option>`).join('')}</select>`:''}</div><div class="n5-personal-preview"><span class="eyebrow">LỜI GIỚI THIỆU CỦA BẠN</span><p data-n5-personal-preview>${jp(personalText(s),s.definition)}</p><p class="small">Thử đọc thầm hoặc nói nếu thuận tiện. Phần này là tự thực hành, chưa chấm đúng/sai hay phát âm.</p>${b(icon('note')+' Lưu câu vào sổ','save-personal','btn',s)}</div></div>`;}
  function question(state,s,u){
    const q=E.definition(s,u.questionId),current=s.current,a=state.attempts.find(a=>a.id===current.feedbackId),locked=!!a;
    const choices=q.type==='choice'?`<div class="n5-options" role="group" aria-label="Chọn câu trả lời">${u.optionOrder.map((id,i)=>{const o=q.options.find(o=>o.id===id);return b(`<span class="n5-option-letter">${String.fromCharCode(65+i)}</span><span>${jp(o.text,s.definition)}${locked&&id===a.selected?'<small>Đáp án bạn đã chọn</small>':''}${locked&&id===q.answer?'<small>'+icon('check')+' Đáp án đúng</small>':''}</span>`,'select',`n5-option ${current.selected===id?'selected':''} ${locked&&id===q.answer?'correct':''} ${locked&&a.selected===id&&!a.correct?'incorrect':''}`,s,`data-option="${id}" aria-pressed="${current.selected===id}" ${locked?'disabled':''}`);}).join('')}</div>`:`<div class="n5-order"><div class="n5-answer-tray" aria-label="Câu đang ghép">${current.order.length?current.order.map(id=>{const t=q.tokens.find(t=>t.id===id);return b(jp(t.text,s.definition),'token','n5-token',s,`data-token="${id}" aria-label="Bỏ mảnh ${esc(t.text)}" ${locked?'disabled':''}`);}).join(''):'<span class="muted">Câu của bạn sẽ hiện ở đây.</span>'}</div><div class="n5-token-pool" role="group" aria-label="Các mảnh câu">${u.optionOrder.filter(id=>!current.order.includes(id)).map(id=>b(jp(q.tokens.find(t=>t.id===id).text,s.definition),'token','n5-token',s,`data-token="${id}" ${locked?'disabled':''}`)).join('')}</div></div>`;
    const offer=E.repairOffer(state),chosen=q.type==='choice'&&a?q.options.find(o=>o.id===a.selected):null;
    return `<span class="eyebrow">${u.repairFor?'GỠ MỘT CHỖ VƯỚNG · CÂU MỚI':s.mode==='review'?(s.earlyReview?'LUYỆN SỚM · CHƯA ĐẾN HẠN ÔN':'THỬ NHỚ SAU MỘT KHOẢNG NGHỈ'):q.id==='transfer'?'THỬ TRONG MỘT TÌNH HUỐNG KHÁC':'THỬ NHỚ LẠI'}</span><h2>${esc(Locale.t(q.prompt))}</h2><p class="n5-stimulus">${jp(q.stimulus,s.definition)}</p>${choices}${current.hintUsed?`<aside class="n5-hint"><strong>Một gợi ý nhỏ</strong><p>${esc(Locale.t(q.hint))}</p></aside>`:locked?'':b(icon('help')+' Cần một gợi ý','hint','textlink',s)}${a?`<section class="n5-feedback ${a.correct?'good':'bad'}" tabindex="-1" data-n5-feedback role="status"><strong>${a.correct?a.hintUsed?'Đúng, với một chút hỗ trợ.':'Đúng trong câu này.':'Cùng gỡ chỗ vướng này.'}</strong>${chosen?`<p>${esc(Locale.t(chosen.why))}</p>`:''}<p>${esc(Locale.t(q.explanation))}</p><small>${u.repairFor?'Câu luyện sửa lỗi được ghi riêng; kết quả đầu tiên vẫn giữ nguyên.':a.hintUsed?'Đã ghi có dùng gợi ý; chưa tính là tự nhớ độc lập.':'Đã giữ kết quả lần trả lời đầu tiên.'}</small></section><div class="n5-step-actions">${b(offer?.automatic?'Thử một câu tương tự · 30 giây '+icon('arrow'):s.index===s.units.length-1?'Xem tổng kết '+icon('arrow'):'Tiếp tục '+icon('arrow'),'next','btn primary',s)}${offer?.automatic?b('Để ôn sau','next','textlink',s,'data-repair="false"'):offer?.fits?b('Luyện thêm một câu · 30 giây','next','btn',s,'data-repair="true"'):''}</div>`:`<div class="n5-step-actions">${b('Kiểm tra & xem lý do '+icon('arrow'),'check','btn primary',s,E.canCheck(s)?'':'disabled')}</div>`}`;
  }
  /* UI-only progress: visited steps are NOT evidence of mastery. */
  function sessionOutline(s){
    const U=(key,args)=>Locale.ui('lesson.player.'+key,args);
    const done=new Set(s.completedUnits),total=s.units.length;
    return `<aside class="n5-player-aside" aria-label="${U('path')}">
      <div class="n5-aside-head"><span class="eyebrow">${U('progress')}</span><strong>${U('completed',{completed:done.size,total})}</strong></div>
      <div class="n5-aside-bar" aria-hidden="true"><span style="width:${Math.min(100,done.size/Math.max(1,total)*100)}%"></span></div>
      <div class="n5-aside-section"><h3>${U('path')}</h3><ol class="n5-outline-list">
        ${s.units.map((unit,index)=>`<li class="${done.has(unit.id)?'is-complete':index===s.index?'is-current':'is-upcoming'}" ${index===s.index?'aria-current="step"':''}>
           <span class="n5-outline-number" aria-hidden="true">${done.has(unit.id)?'✓':index+1}</span>
           <span class="n5-outline-title">${esc(Locale.t(unit.label||unit.type||''))}</span>
         </li>`).join('')}
      </ol></div>
      <div class="n5-aside-footer"><span class="eyebrow">${U('learningGoal')}</span><p>${U(s.contentId==='foundation-vowels'?'focusKana':'focusN5')}</p><small>${U('sample')}</small></div>
    </aside>`;
  }
  function player(state,s){
    const u=E.unit(s);if(!u)return resultPage(state,s.id);
    const content=s.definition;
    let body='';
    if(u.type==='story')body=`<span class="eyebrow">MỘT BUỔI GẶP ĐẦU TIÊN</span><h2>${esc(content.storyTitle||(content.id===catalog.base.id?'Ở lớp tiếng Nhật của cô Aoi.':content.title))}</h2><p>${esc(content.storyIntro||(content.id===catalog.base.id?'Mai là du học sinh Việt Nam, đang học cùng cô Aoi. Đọc trước để nắm ý; chưa cần nhớ hết.':'Đọc để nắm ý trong tình huống; chưa cần nhớ hết.'))}</p><div class="n5-dialogue">${content.story.map(line=>{const person=content.cast.find(c=>c.id===line.speaker);return `<div class="n5-dialogue-line"><a class="n5-speaker" href="#character/${person.id}"><span>${person.name[0]}</span><strong>${esc(person.name)}</strong><small>${esc(person.role)}</small></a><div><p>${jp(line.text,content)}</p><details><summary>Xem nghĩa</summary><p>${esc(line.meaning)}</p></details></div></div>`;}).join('')}</div>`;
    else if(u.type==='learn'){const c=content.cards[u.cardId];body=`<span class="eyebrow">HIỂU MẪU CÂU</span><h2>${esc(c.title)}</h2><div class="n5-example">${jp(c.example,content)}<p>${esc(c.meaning)}</p></div><p class="n5-pattern">${jp(c.pattern,content)}</p><ul class="n5-learning-points">${c.points.map(p=>`<li>${esc(p)}</li>`).join('')}</ul><aside class="n5-tip">${icon('leaf')}<p>${esc(c.pitfall)}</p></aside>`;}
    else if(u.type==='personal')body=personal(s);
    else body=question(state,s,u);
    const U=(key,args)=>Locale.ui('lesson.player.'+key,args);
    const total=s.units.length,completed=s.completedUnits.length,currentNo=s.index+1;
    const q=u.type==='question'?E.definition(s,u.questionId):null;
    const questionNo=u.type==='question'?s.units.slice(0,currentNo).filter(x=>x.type==='question').length:0;
    const totalQuestions=s.units.filter(x=>x.type==='question').length;
    const shortOptions=!!(q?.type==='choice'&&q.options?.length<=5&&q.options.every(o=>String(o.text).length<=14));
    const headingText=s.mode==='review'?(s.earlyReview?'Thử lại. Giữ nguyên lịch ôn.':'Ôn lại, để nhớ xa hơn.'):s.mode==='practice'?'Thử nhớ bằng chính mình.':'Một bước nhỏ, dùng được ngay.';
    const stepCaption=U('step',{current:currentNo,total})+' · '+Locale.t(u.label||'Luyện nhớ');
    return wrap(state,`<div class="n5-player-compact" data-foundation="${content.id==='foundation-vowels'}" data-compact-choices="${shortOptions}" data-active-type="${esc(u.type)}">
      <header class="n5-session-hero">
        <div class="n5-topline">${link(U('today'),'today','textlink','back')}${b(U('pause'),'pause','textlink',s)}</div>
        <div class="n5-hero-main"><span class="eyebrow">${esc(content.level)} · ${esc(Locale.t(content.title))} · v${s.contentVersion}</span>
          <h1>${esc(Locale.t(headingText))}</h1></div>
        <div class="n5-hero-progress">
          <span>${esc(stepCaption)}</span>
          <div class="n5-hero-progress-track"><div class="n5-progress" role="progressbar" aria-label="${U('progress')}" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${completed}"><span style="width:${completed/Math.max(1,total)*100}%"></span></div></div>
          <strong>${U('completed',{completed,total})}</strong>
          <div class="n5-hero-reading">${readingButton(s)}</div>
        </div>
      </header>
      <div class="n5-player-grid">
        <article class="card n5-stage" data-session="${esc(s.id)}" data-unit="${esc(u.id)}" data-question="${u.type==='question'}" data-reading="${s.reading}">
          <div class="n5-stage-kicker"><span class="n5-stage-number">${u.type==='question'?U('question',{current:questionNo,total:totalQuestions}):U('step',{current:currentNo,total})}</span></div>
          ${body}
          ${u.type!=='question'?`<div class="n5-step-actions">${b(u.type==='personal'?'Tôi đã thử dùng câu này '+icon('arrow'):u.type==='story'?'Hiểu mẫu câu '+icon('arrow'):'Thử bước tiếp theo '+icon('arrow'),'next','btn primary',s)}${u.type==='personal'?b('Bỏ qua lúc này','next','textlink',s,'data-skipped="true"'):''}</div>`:''}
        </article>
        ${sessionOutline(s)}
      </div>
      <div class="n5-player-meta">${statusLine(s)}<p class="n5-footnote">${Locale.t('Không cần bật âm thanh. Có thể tạm dừng bất cứ lúc nào; lần sau vẫn giữ đúng câu đang làm.')}</p></div>
    </div>`);
  }
  function resultPage(state,id){
    const sum=E.summary(state,id);if(!sum)return landing(state);
    const s=sum.session;if(s.status!=='completed')return wrap(state,heading('Phiên này vẫn đang dở.','Những bước chưa làm chưa được tính là hoàn tất.','HỌC TIẾP')+b('Tiếp tục đúng chỗ','resume','btn primary',s));
    const first=sum.first,personal=s.personal.disposition;
    return wrap(state,`${link('Hôm nay','today','textlink','back')}<header class="n5-heading n5-summary-heading"><span class="eyebrow">MỘT BƯỚC ĐÃ HOÀN TẤT</span><h1>Bạn đã có điều<br><em>để dùng hôm nay.</em></h1><p>${s.mode==='review'?(s.earlyReview?'Luyện sớm · giữ lịch ôn':'Lượt ôn'):esc(s.definition.title)} · v${s.contentVersion} · ${date(s.completedAt)} · ${s.minutes} phút đã chọn</p></header><section class="n5-result card"><div class="n5-score"><strong>${sum.correct}<span>/${first.length}</span></strong><p>Câu đúng ở lượt đầu<br><small>Trong phiên mẫu này</small></p></div><div class="n5-result-evidence"><div><strong>${sum.independent.length}</strong><span>Tự trả lời đúng</span></div><div><strong>${sum.supported.length}</strong><span>Đúng có gợi ý</span></div><div><strong>${sum.incorrect.length}</strong><span>Cần nhớ lại</span></div></div></section>${sum.repairs.length?`<p class="n5-repair-note">${icon('review')} Đã luyện sửa ${sum.repairs.length} câu riêng; ${sum.repairs.filter(a=>a.correct).length} câu đúng. Kết quả đầu tiên được giữ nguyên.</p>`:''}<div class="n5-summary-grid"><section class="card"><span class="eyebrow">ĐIỀU VỪA LUYỆN</span><h2>Hiểu rõ từng câu.</h2><div class="n5-answer-review">${first.map(a=>`<details><summary><span class="n5-evidence-dot ${a.correct&&!a.hintUsed?'good':'support'}"></span><span>${esc(a.definition.prompt)}<small>${a.correct?a.hintUsed?'Đúng có gợi ý':'Đúng ở lần trả lời đầu':'Chưa đúng ở lần trả lời đầu'}</small></span></summary><div><p><strong>Bạn chọn:</strong> ${a.definition.type==='choice'?jp(a.definition.options.find(o=>o.id===a.selected)?.text||'',s.definition):jp(a.selected.map(id=>a.definition.tokens.find(t=>t.id===id)?.text).join(''),s.definition)}</p><p>${esc(a.definition.explanation)}</p></div></details>`).join('')}</div></section><section class="card n5-next"><span class="eyebrow">BƯỚC NHỎ TIẾP THEO</span><h2>Gặp lại sau một khoảng nghỉ.</h2><p>Ôn ngắn giúp kiểm tra điều còn nhớ, thay vì chỉ làm lại ngay khi đáp án còn quen.</p><ul>${sum.reviews.map(r=>`<li><span>${esc(s.definition.concepts.find(c=>c.id===r.conceptId)?.name||r.conceptId)}</span><strong>${date(r.dueAt)}</strong></li>`).join('')}</ul><p class="small">Lịch thử nghiệm 1 → 3 → 7 ngày. Chỉ giãn lịch khi trả lời đúng độc lập lúc đến hạn. Chưa có thông báo gửi tự động.</p>${link('Xem lịch ôn','review','btn primary','calendar')}</section></div>${personal?`<p class="article-note">${personal==='skipped'?'Phần tự giới thiệu: để dành lần sau.':'Bạn đã tự thực hành giới thiệu bản thân; phần này chưa được chấm.'}</p>`:''}<div class="n5-summary-actions">${b(icon('note')+' Lưu tổng kết vào sổ','save-summary','btn',s)}${link('Về Hôm nay','today','btn primary','arrow')}${b('Luyện một lượt mới','start','textlink',null,`data-minutes="${s.minutes}" data-mode="practice" data-content="${s.contentId}"`)}</div><p class="n5-footnote">Kết quả của một bài mẫu, chưa đại diện trình độ N5 hoặc khả năng nhớ lâu.</p>`);
  }
  function definitionFor(state,item){return catalog.get(item.contentId,item.contentVersion)||state.sessions.find(s=>s.contentId===item.contentId&&s.contentVersion===item.contentVersion)?.definition;}
  function reviewDefinition(state,includeEarly=false){return catalog.reviewContent(state,{includeEarly})||catalog.get();}
  function lessonPage(mode='lesson'){
    const state=read();if(!state)return wrap(null,heading('Giữ an toàn bản lưu hiện tại.','Chưa mở phiên mới khi bản lưu cần kiểm tra.','DỮ LIỆU PHIÊN HỌC'));
    if(isPreview()){if(previewError)return wrap(state,notice('Chưa thể chạy xem trước: '+esc(previewError),'neutral'));const active=E.active(state);return active?.status==='paused'?wrap(state,heading('Đã tạm dừng phiên thử.','Chỉ giữ trong bộ nhớ của khung xem trước.','XEM TRƯỚC')+b('Tiếp tục xem trước','resume','btn primary',active)):player(state,active);}
    const sub=route().split('/')[1];
    if(sub==='preview'){C=catalog.get();return landing(E.create(P().id),mode);}
    if(sub==='review')return reviewLanding(state);
    if(sub==='resume'){const a=E.active(state);C=a?.definition||catalog.get();return a?.status==='active'?player(state,a):landing(state,a?.status==='paused'?a.mode:mode);}
    if(mode==='practice'){const practice=E.pending(state).find(s=>s.mode==='practice');if(practice){C=practice.definition;return practice.status==='active'&&state.activeSessionId===practice.id?player(state,practice):landing(state,mode);}}
    C=catalog.get(sub||catalog.base.id);if(!C)return wrap(state,empty('Bài chưa có trong danh mục','Bản nháp chỉ mở trong khu xem trước; không đưa vào gợi ý cho học viên.','book',link('Về thư viện','library','btn primary')));
    const session=E.pending(state).find(s=>s.contentId===C.id&&s.mode===mode);if(session){C=session.definition;if(session.status==='active'&&state.activeSessionId===session.id)return player(state,session);}
    return landing(state,mode);
  }
  function reviewLanding(state){
    const due=E.due(state),pending=E.pending(state).find(s=>s.mode==='review');C=reviewDefinition(state,!due.length);const batch=state.reviews.filter(r=>r.contentId===C.id&&r.contentVersion===C.version&&(due.length?r.dueAt<=new Date().toISOString():true));
    return wrap(state,`${link('Trung tâm ôn tập','review','textlink','back')}${heading(due.length?'Một lượt nhớ lại, vừa đủ.':'Lịch ôn đã được giữ.','Ôn theo đúng phiên bản nội dung đã học, không đổi sang đáp án mới.','ÔN GIÃN CÁCH')}<section class="card n5-review-start"><h2>${pending?'Lượt ôn đang dở':due.length?due.length+' mẫu đến hạn':'Chưa có mẫu đến hạn hôm nay'}</h2><p>${due.length?'Không xem lại đáp án trước. Trả lời xong sẽ có giải thích.':'Có thể luyện sớm; không tính là đã nhớ sau một khoảng nghỉ.'}</p><p class="small">Lượt này: ${esc(C.title)} · v${C.version} · tối đa ${Math.min(3,batch.length)} mẫu.</p>${pending?b('Tiếp tục lượt ôn','resume','btn primary',pending):due.length?b('Bắt đầu ôn · 2–3 phút','start','btn primary',null,'data-minutes="5" data-mode="review"'):state.reviews.length?b('Luyện sớm một lượt','start','btn',null,'data-minutes="5" data-mode="review" data-early="true"'):link('Học bài đầu tiên','lesson','btn primary')}<p class="small">Bài hoặc phiên bản khác tiếp tục ở lượt sau. Kết quả cũ không chuyển thành điểm ở phiên bản mới.</p></section>`);
  }
  function reviewPanel(){
    const state=read();
    if(!state)return errorBox();
    const due=E.due(state),pending=E.pending(state).find(s=>s.mode==='review');
    const U=(key,args)=>Locale.ui('review.panel.'+key,args);
    const stateHeading=pending?U('pending'):due.length?U('reviewNow'):state.reviews.length?U('rest'):U('empty');
    const info=state.reviews.length?
      state.reviews.slice().sort((a,b)=>a.dueAt.localeCompare(b.dueAt)).slice(0,3)
        .map(r=>'<span data-no-translate>'+esc(definitionFor(state,r)?.concepts.find(c=>c.id===r.conceptId)?.name||r.conceptId)+'</span> · v'+esc(r.contentVersion)+' · '+date(r.dueAt)).join('<br>'):
      U('emptyDescription');
    const action=pending?U('continue'):due.length?U('start'):state.reviews.length?U('view'):U('first');
    return `<section class="card n5-review-panel"><div class="inline spread"><span class="eyebrow">${U('eyebrow')}</span>${badge(due.length?U('due',{count:due.length}):U('pace'),'sage')}</div><div class="inline spread"><div><h2>${stateHeading}</h2><p>${info}</p></div>${link(action,state.reviews.length||pending?'lesson/review':'lesson','btn primary','arrow')}</div><p class="small">${U('note')}</p></section>`;
  }
  function reportPanel(){const state=read();if(!state)return errorBox();const complete=state.sessions.filter(s=>s.status==='completed'),answers=state.attempts.filter(a=>a.kind!=='repair');return `<section class="card section n5-report"><span class="eyebrow">BÀI HỌC · KẾT QUẢ CÓ PHIÊN BẢN</span><h2>Bằng chứng của từng phiên.</h2><p>${Locale.ui('reports.versioned.summary',{completed:complete.length,pending:E.pending(state).length,correct:answers.filter(a=>a.correct&&!a.hintUsed).length,total:answers.length})}</p>${complete.length?`<div class="n5-history">${complete.slice().reverse().map(s=>{const sum=E.summary(state,s.id);return `<a href="#summary/${encodeURIComponent(s.id)}"><span><span data-no-translate>${esc(s.definition.title)}</span> · v${s.contentVersion} · ${s.mode==='review'?(s.earlyReview?Locale.ui('reports.versioned.early'):Locale.ui('reports.versioned.spaced')):s.mode==='practice'?Locale.ui('reports.versioned.practice'):Locale.ui('reports.versioned.lesson')} · ${date(s.completedAt)}</span><strong>${Locale.ui('reports.versioned.result',{correct:sum.correct,total:sum.first.length,hinted:sum.supported.length})} ${icon('arrow')}</strong></a>`;}).join('')}</div>`:'<p class="small">Chỉ mở bài chưa được tính là hoàn tất. Không quy đổi thành % trình độ.</p>'}${b(Locale.ui('reports.versioned.export'),'export','textlink')}</section>`;}
  function mistakesPage(){
    const state=read();if(!state)return wrap(null,'');const byConcept=new Map();for(const a of state.attempts)if(a.kind!=='repair')byConcept.set(a.contentId+'@'+a.contentVersion+':'+a.conceptId,a);
    const items=[...byConcept.values()].filter(a=>!a.correct||a.hintUsed);
    return wrap(state,`${link('Trung tâm ôn tập','review','textlink','back')}${heading('Gỡ đúng chỗ, rồi đi tiếp.','Từ câu trả lời gần nhất của mỗi mẫu, giữ riêng bài và phiên bản.','ĐIỀU CẦN NHỚ LẠI')}${items.length?`<div class="stack section">${items.map(a=>{const session=state.sessions.find(s=>s.id===a.sessionId),r=state.reviews.find(r=>r.contentId===a.contentId&&r.contentVersion===a.contentVersion&&r.conceptId===a.conceptId);return `<section class="card n5-mistake"><div class="inline spread"><span class="eyebrow">${esc(session.definition.concepts.find(c=>c.id===a.conceptId)?.name||a.conceptId)}</span>${badge(a.correct?'Đúng có gợi ý':'Cần thử nhớ lại','outline')}</div><h2>${esc(a.definition.prompt)}</h2><p>${esc(a.definition.explanation)}</p><p class="small">Lần trả lời: ${date(a.at)}${r?' · Lịch ôn: '+date(r.dueAt):''}. Câu sửa ngay được giữ riêng trong tổng kết.</p><div class="actions">${link('Xem tổng kết lượt này','summary/'+encodeURIComponent(a.sessionId),'btn')}${link('Mở lượt ôn','lesson/review','btn primary','review')}</div></section>`;}).join('')}</div>`:empty('Chưa có mẫu cần gỡ ở bài này.','Trả lời đúng ở lượt gần nhất vẫn cần một lần kiểm tra lại khi đến hạn.','leaf',link('Xem lịch ôn','review','btn primary'))}`);
  }
  function advice(p){
    const T=(vi,en,ja)=>Locale.register(vi,en,ja);
    if(isPreview()||baseline())return null;
    const state=read(p);if(!state)return null;
    const pending=E.pending(state)[0],otherDates=[...Object.values(p.examSessions||{}).filter(s=>!s.finished),...(p.activePractice&&!p.activePractice.finished?[p.activePractice]:[])].map(s=>s.updatedAt||s.startedAt).filter(Boolean).sort(),otherAt=otherDates.at(-1);
    if(otherAt&&(!pending||otherAt>pending.updatedAt))return null;
    if(!state.sessions.length&&p.goal!=='N5')return null;
    const due=E.due(state),mode=NPAdvicePolicy.normalize(p.prefs.studyPriority),last=state.lastAnswerAt,gap=last?Math.floor((Date.now()-new Date(last))/86400000):0;
    const resume=pending?{kind:'resume',title:T('Tiếp tục đúng chỗ bạn đã dừng.','Resume where you left off.','前回の続きから再開しましょう。'),body:pending.definition.level+' · '+Locale.t(pending.definition.title)+' · v'+pending.contentVersion+' · '+T(pending.completedUnits.length+'/'+pending.units.length+' bước đã hoàn tất.',pending.completedUnits.length+'/'+pending.units.length+' steps completed.',pending.completedUnits.length+'/'+pending.units.length+'ステップ完了。'),reason:T('Dựa trên phiên học chưa hoàn tất của hồ sơ này. Câu đã chọn, gợi ý và phản hồi được giữ nguyên.','Based on this profile’s unfinished session. Previous answers, hints and feedback remain saved.','このプロフィールの未完了セッションに基づきます。回答、ヒント、フィードバックは保持されます。'),cta:T('Học tiếp · '+pending.minutes+' phút đã chọn','Continue · '+pending.minutes+' min selected','続ける・選択した'+pending.minutes+'分'),route:'lesson/resume',resumeSessionId:pending.id}:null;
    if(gap>=4&&(pending||due.length))return{kind:'return',title:T('Quay lại nhẹ thôi, không cần học bù.','Welcome back. No catching up required.','おかえりなさい。遅れを取り戻す必要はありません。'),body:T('Đã '+gap+' ngày từ câu trả lời gần nhất.','It has been '+gap+' days since your last answer.','最後の回答から'+gap+'日経ちました。')+' '+(pending?T('Tiếp một bước trong bài đang dở.','Take one step in your unfinished lesson.','途中のレッスンを少し進めましょう。'):T('Thử nhớ lại vài mẫu quen trong 2–3 phút.','Recall a few familiar patterns in 2–3 minutes.','2〜3分で覚えた文型を思い出しましょう。')),reason:T('Dùng thời điểm trả lời gần nhất, không dùng số lần mở trang. Giữ các phiên dở và không tạo “nợ học”.','Based on your latest answered question, not page visits. Unfinished sessions are saved; there is no catch-up debt.','最後の回答日時に基づき、閲覧回数は使用しません。未完了の学習は保持され、遅れの埋め合わせは不要です。'),cta:pending?T('Tiếp một bước nhỏ','Continue with a small step','少しだけ続ける'):T('Ôn nhẹ · 2–3 phút','Gentle review · 2–3 min','軽く復習・2〜3分'),route:pending?'lesson/resume':'lesson/review',resumeSessionId:pending?.id};
    if(due.length&&(mode==='review'||!pending))return{kind:'review',title:T('Một vài mẫu đã đến lúc gặp lại.','Some patterns are due for review.','復習する文型があります。'),body:T(due.length+' mẫu từ các bài đã trả lời đến hạn. Thử nhớ trước, xem giải thích sau.',due.length+' previously answered patterns are due. Try recalling before reading the explanation.','以前回答した文型'+due.length+'件の復習時期です。解説を見る前に思い出してみましょう。'),reason:T('Dựa trên lịch ôn 1–3–7 ngày của từng mẫu đã trả lời. Câu luyện sửa lỗi ngay và câu đúng có gợi ý chưa được dùng để giãn lịch.','Uses each pattern’s 1–3–7-day review schedule. Immediate corrections and hinted answers do not extend intervals.','文型ごとの1・3・7日復習予定に基づきます。すぐに訂正した回答やヒント付きの正解では間隔を延ばしません。'),cta:T('Ôn · 2–3 phút','Review · 2–3 min','復習・2〜3分'),route:'lesson/review'};
    // Adaptive gives a short repair inside the current session; it does not discard its checkpoint.
    if(resume){
      const step=E.unit(pending),answer=state.attempts.find(a=>a.id===pending.current.feedbackId);
      if(answer&&(!answer.correct||answer.hintUsed)){
        const concept=pending.definition.concepts.find(c=>c.id===answer.conceptId);
        return {...resume,title:answer.correct?T('Đúng có gợi ý. Giờ thử tự nhớ lại.','Correct with a hint. Now try remembering independently.','ヒントありで正解です。次は自力で思い出しましょう。'):T('Một chỗ vướng nhỏ, gỡ xong rồi đi tiếp.','One small stumbling block. Let’s work through it.','少しつまずきました。確認してから進みましょう。'),body:Locale.t(concept?.name||'Mẫu vừa học')+' · '+(answer.correct?T('Bạn đã dùng gợi ý ở câu vừa rồi.','You used a hint for the previous answer.','直前の回答でヒントを使いました。'):T('Câu trả lời đầu tiên chưa đúng.','Your first answer was not correct.','最初の回答は正解ではありませんでした。'))+' '+T('Kết quả vẫn được giữ nguyên.','Your result stays saved.','結果はそのまま保持されます。'),reason:T('Dựa trên chính câu đang dở và trạng thái gợi ý, không suy rộng thành điểm yếu chung. Câu sửa riêng không được tính là đã nhớ lâu.','Based on the current answer and hint status, not an overall weakness. Corrections do not prove long-term recall.','現在の回答とヒントの利用状況に基づき、全体的な弱点とは判断しません。訂正だけでは長期記憶を確認できません。'),cta:T('Xem giải thích & học tiếp','Review explanation & continue','解説を確認して続ける')};
      }
      return {...resume,body:pending.definition.level+' · '+Locale.t(step?.label||'Giới thiệu bản thân')+' · '+T(pending.completedUnits.length+'/'+pending.units.length+' bước đã hoàn tất.',pending.completedUnits.length+'/'+pending.units.length+' steps completed.',pending.completedUnits.length+'/'+pending.units.length+'ステップ完了。')};
    }
    if(state.sessions.length){if(p.goal!=='N5')return null;const next=state.reviews.slice().sort((a,b)=>a.dueAt.localeCompare(b.dueAt))[0];return{kind:'suggest',title:T('Đã học hôm nay. Cho trí nhớ một khoảng nghỉ.','You studied today. Give your memory a break.','今日は学習しました。少し間をあけましょう。'),body:next?T('Lần ôn kế tiếp: ','Next review: ','次の復習：')+date(next.dueAt)+T('. Muốn đi thêm, thử một tình huống mới.','. To keep going, try a new scenario.','。続けたい場合は新しい場面を試しましょう。'):T('Bạn có thể thử lại một lượt hoặc mở hội thoại mới.','You can try another round or open a new dialogue.','もう一度練習するか、新しい会話を始められます。'),reason:T('Dựa trên phiên đã hoàn tất và ngày ôn kế tiếp. Không coi việc trả lời đúng ngay là đã nhớ lâu.','Based on the completed session and upcoming review. One correct answer does not prove long-term retention.','完了したセッションと次の復習予定に基づきます。すぐに正解しても、長期記憶が定着したとは判断しません。'),cta:T('Mở hội thoại mới · 2–3 phút','New dialogue · 2–3 min','新しい会話・2〜3分'),route:'story/meet'};}
    const minutes=context(p).minutes<=3?3:context(p).minutes<=5?5:15;return{kind:'suggest',title:T('Bắt đầu bằng một lời giới thiệu.','Start with a self-introduction.','自己紹介から始めましょう。'),body:T('Bạn chọn mục tiêu N5.','You selected N5 as your goal.','目標はN5です。')+' '+(minutes===3?T('Thử một mẫu câu và hai câu nhớ lại trong 3 phút.','Try one sentence pattern and two recall questions in 3 minutes.','3分で文型を一つと復習問題を二つ試しましょう。'):T('Dành '+minutes+' phút để hiểu mẫu câu, thử nhớ và giới thiệu chính mình.','Spend '+minutes+' minutes understanding a pattern, recalling it and introducing yourself.',''+minutes+'分で文型を理解し、思い出して自己紹介を練習しましょう。')),reason:T('Hiện chưa có bằng chứng trình độ ở bài này. Chọn bài nhập môn theo mục tiêu và thời gian rảnh, không suy đoán điểm yếu.','No proficiency evidence is available for this lesson. The introduction is selected by your goal and available time, without guessing weaknesses.','このレッスンの習熟度データはまだありません。苦手分野を推測せず、目標と使える時間に合わせて入門教材を選びました。'),cta:T('Bắt đầu · '+minutes+' phút','Begin · '+minutes+' min','始める・'+minutes+'分'),route:'lesson',startMinutes:minutes};
  }
  function focusAfter(action,source){requestAnimationFrame(()=>{if(action==='check')document.querySelector('[data-n5-feedback]')?.focus({preventScroll:false});else if(action==='hint'){const hint=document.querySelector('.n5-hint');if(hint){hint.tabIndex=-1;hint.focus({preventScroll:true});}}else if(['next','start','resume'].includes(action)){const heading=document.querySelector('.n5-stage h2,.n5-heading h1');if(heading){heading.tabIndex=-1;heading.focus();}}else if(source){const matches=[...document.querySelectorAll('[data-action="n5-'+action+'"]')];const target=matches.find(x=>x.dataset.option===source.dataset.option&&x.dataset.token===source.dataset.token);(target||document.querySelector('.n5-token'))?.focus({preventScroll:true});}});}
  function transact(mutate,expected,rerender=true){
    const id=P().id,root=document.querySelector('[data-n5-root]');
    try{const before=read();if(!before)throw new Error(storageError);const revision=root?Number(root.dataset.revision):before.revision;
      const mutateState=state=>{const s=E.active(state);if(expected&&(s?.id!==expected.session||E.unit(s)?.id!==expected.unit))throw new Error('Vị trí phiên học đã thay đổi. Đã tải lại bản mới.');if(s?.status==='active'&&clock?.session===s.id&&clock.unit===E.unit(s)?.id&&!document.hidden)s.current.activeMs+=Math.max(0,Math.min(600000,performance.now()-clock.at));return mutate(state);};
      let result;if(isPreview()){const state=E.copy(previewState),value=mutateState(state);state.revision++;previewState=state;result={state,result:value};}else result=S.write(localStorage,id,revision,mutateState);
      storageError='';clock=null;if(root)root.dataset.revision=result.state.revision;if(rerender)render(false);return result;
    }catch(error){storageError=error.message||'Trình duyệt chưa cho phép lưu. Hãy xuất bản lưu trước khi đóng trang.';render(false);toast(storageError);return null;}
  }
  function migrateLegacyResume(){if(isPreview())return;const p=P();if(p.resume?.feature==='lesson'){p.legacyLessonResume??=p.resume;p.resume=null;persist();}}
  function exportState(){let raw;try{raw=localStorage.getItem(S.PREFIX+P().id);}catch{}const blob=new Blob([raw||JSON.stringify(E.create(P().id),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Nihongo_Learning_'+P().id+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  document.addEventListener('click',event=>{
    const anchor=event.target.closest('a[href]');if(isPreview()&&anchor){event.preventDefault();event.stopImmediatePropagation();toast('Đang xem trước: dùng câu hỏi và nút chạy lại trong khung.');return;}
    const el=event.target.closest('[data-action^="n5-"]');if(!el)return;event.preventDefault();event.stopImmediatePropagation();const view=window.NPLessonInteractions?.capture(),action=el.dataset.action.slice(3),expected=el.dataset.session?{session:el.dataset.session,unit:el.dataset.unit}:null;
    if(action==='preview-restart'){initPreview();storageError='';go('lesson');render(false);return;}
    if(isPreview()&&['save-personal','save-summary','export'].includes(action)){toast('Xem trước không ghi vào hồ sơ hoặc sổ học tập.');return;}
    if(action==='export'){exportState();return;}
    if(['save-personal','save-summary'].includes(action)){const state=read(),s=state?.sessions.find(s=>s.id===el.dataset.session);if(!s)return;const summary=E.summary(state,s.id);addNote({type:action==='save-personal'?'sentence':'summary',title:action==='save-personal'?'Lời giới thiệu của tôi':'Tổng kết · '+s.definition.title,body:action==='save-personal'?personalText(s):`${summary.correct}/${summary.first.length} câu đúng lần đầu; ${summary.supported.length} câu có gợi ý; ${summary.repairs.length} câu luyện sửa riêng. Lịch ôn: ${summary.reviews.map(r=>date(r.dueAt)).join(', ')}.`,source:s.definition.level+' · '+s.definition.title+' · v'+s.contentVersion,target:'summary/'+encodeURIComponent(s.id),dedupe:'n5-'+action+'-'+s.id});return;}
    const outcome=transact(state=>{
      if(action==='start'){const s=E.start(state,isPreview()?C:el.dataset.mode==='review'?reviewDefinition(state,el.dataset.early==='true'):catalog.get(el.dataset.content||catalog.base.id),{...startOptions(),mode:el.dataset.mode||'lesson',minutes:Number(el.dataset.minutes),includeEarly:el.dataset.early==='true'});if(!s)throw new Error('Không còn mẫu đến hạn cho lượt này.');return s;}
      if(action==='resume')return E.resume(state,el.dataset.session);
      if(action==='select')return E.select(state,el.dataset.option);
      if(action==='token')return E.token(state,el.dataset.token);
      if(action==='hint')return E.hint(state);
      if(action==='check'){const s=E.active(state);if(E.unit(s)?.type==='question'&&!s.current.hintUsed)s.reading='hide';return E.check(state);}
      if(action==='reading'){
        const s=E.active(state),u=E.unit(s);
        if(!s||!u)return;
        const currentlyVisible=visibleReading(s,u);
        // Explicitly revealing an answer reading during an unsubmitted check is a hint,
        // so a correct answer cannot be counted as independent recall.
        if(!currentlyVisible&&u.type==='question'&&!s.current.feedbackId)E.hint(state);
        s.reading=currentlyVisible?'hide':'show';
        return;
      }
      if(action==='pause')return E.pause(state);
      if(action==='next')return E.advance(state,{repair:el.dataset.repair?el.dataset.repair==='true':undefined,skipped:el.dataset.skipped==='true'});
    },action==='resume'?null:expected,!['start','resume','pause','next','select','token'].includes(action));
    if(!outcome)return;
    if(['select','token'].includes(action)){if(!window.NPLessonInteractions?.update(outcome.state,el))render(false);return;}
    const s=E.active(outcome.state);
    if(action==='pause'){if(isPreview()){render(false);return;}go('today');return;}
    if(s?.status==='completed'){go('summary/'+encodeURIComponent(s.id));return;}
    if(action==='start')migrateLegacyResume();if(['start','resume'].includes(action))go(s.mode==='practice'?'quiz':'lesson/resume');else if(action==='next')render(false);
    if(window.NPLessonInteractions)NPLessonInteractions.after(action,view,el);else focusAfter(action,el);
  },true);
  document.addEventListener('input',event=>{const field=event.target.dataset.n5Field;if(!field)return;const value=event.target.value,result=transact(state=>{const s=E.active(state);if(E.unit(s)?.type!=='personal')throw new Error('Phần tự giới thiệu đã thay đổi.');if(field==='name')s.personal.name=value.slice(0,60);else if(field==='role'&&['','学生','会社員'].includes(value))s.personal.role=value;else if(field==='country'&&['','ベトナム','日本'].includes(value))s.personal.country=value;},null,false);if(result){const preview=document.querySelector('[data-n5-personal-preview]');if(preview)preview.innerHTML=jp(personalText(E.active(result.state)),E.active(result.state).definition);}});
  window.addEventListener('storage',event=>{if(!isPreview()&&event.key===NPContentStore.KEY&&['library','today','review'].includes(route().split('/')[0])){render(false);return;}if(event.key===S.PREFIX+P().id&&['lesson','quiz','summary','review','reports','mistakes','today','assistant'].includes(route().split('/')[0])){clock=null;render(false);toast('Đã cập nhật phiên học từ cửa sổ khác.');}});
  function flushClock(){if(isPreview()||!clock)return;const s=read(),a=s&&E.active(s);if(a?.status==='active'&&a.id===clock.session&&E.unit(a)?.id===clock.unit){const delta=Math.max(0,Math.min(600000,performance.now()-clock.at));try{const saved=S.write(localStorage,P().id,s.revision,state=>{E.active(state).current.activeMs+=delta;});const root=document.querySelector('[data-n5-root]');if(root)root.dataset.revision=saved.state.revision;}catch{}}clock=null;}
  document.addEventListener('visibilitychange',()=>{if(document.hidden)flushClock();else{const state=read(),root=document.querySelector('[data-n5-root]');if(root&&state&&Number(root.dataset.revision)!==state.revision)render(false);else window.NPLessonUI?.mount();}});
  window.addEventListener('pagehide',flushClock);
  window.NPLessonUI={baseline,page:lessonPage,completedCount(p=P()){return read(p)?.sessions.filter(s=>s.status==='completed').length||0;},continueSession(id){const result=transact(state=>E.resume(state,id),null,false);if(result)go('lesson/resume');return !!result;},begin(minutes,mode='lesson'){const result=transact(state=>E.start(state,catalog.get(),{...startOptions(),minutes,mode}),null,false);if(result){migrateLegacyResume();go('lesson/resume');focusAfter('start');}return !!result;},mistakesPage,summary(){const state=read();return state?resultPage(state,decodeURIComponent(route().split('/').slice(1).join('/'))||undefined):wrap(null,'');},reviewPanel,reportPanel,advice,read,
    clear(id){localStorage.removeItem(S.PREFIX+id);},
    clearAll(){for(let i=localStorage.length-1;i>=0;i--){const key=localStorage.key(i);if(key.startsWith(S.PREFIX))localStorage.removeItem(key);}},
    mount(){window.NPLessonInteractions?.mount();if(isPreview()){clock=null;return;}const state=read(),s=state&&E.active(state);clock=s?.status==='active'&&E.unit(s)?.type==='question'&&document.querySelector('.n5-stage')&&!s.current.feedbackId&&!document.hidden?{session:s.id,unit:E.unit(s).id,at:performance.now()}:null;}
  };
  render(false);NPLessonUI.mount();
})();
