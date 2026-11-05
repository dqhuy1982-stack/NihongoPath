/* Avatar-first entry. Static demo morphs a learner card into a local PIN panel; backend remains separate. */
window.NPLogin=(function(){
  'use strict';
  const tr=(vi,en,ja)=>[vi,en,ja][{vi:0,en:1,ja:2}[Locale.code]||0];
  let opener=null;
  const isBaseline=()=>new URLSearchParams(location.search).get('login-view')==='before';
  const seasons=['spring','summer','autumn','winter'];
  const seasonLabels={
    vi:['Xuân','Hạ','Thu','Đông'],
    en:['Spring','Summer','Autumn','Winter'],
    ja:['春','夏','秋','冬']
  };
  // Four original line-art icons. SVG is presentation only; buttons carry
  // accessible localized names and aria-pressed states.
  const seasonArtwork=[
    '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 14C12 9 13 5 16 5c3 0 4 4 0 9Zm2 2c5-4 9-2 8 1-1 3-5 3-8-1Zm-3 2c-2 6-6 8-8 5-2-3 1-6 8-5Zm-2-3c-6 1-9-3-7-5 2-3 6-2 7 5Zm5 3c6 0 8 5 5 7-3 1-6-2-5-7Z"/><circle cx="16" cy="16" r="2.3"/><path d="M8 28l5-6" opacity=".55"/></svg>',
    '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 25C7 12 17 7 27 6c0 11-6 22-20 20"/><path d="M8 25 24 10M13 19l-2-8M18 15l8 3"/></svg>',
    '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M16 4l3.4 6 6-2-2.4 6 4.8 4-7.1 1.2-1.7 7.4-3-3-3 3-1.7-7.4L4.2 18 9 14 6.6 8l6 2z"/><path d="M16 15v13M11 18l5 5 5-5"/></svg>',
    '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" aria-hidden="true"><path d="M16 3v26M3 16h26M7 7l18 18M25 7 7 25M12 6l4 4 4-4M12 26l4-4 4 4M6 12l4 4-4 4M26 12l-4 4 4 4"/></svg>'
  ];
  function preferredSeason(){
    try{const value=localStorage.getItem('np-home-season-v1');return seasons.includes(value)?value:'spring';}
    catch{return 'spring';}
  }
  // Both labels are live profile fields. Neither the JLPT grade nor future
  // exam dates are hard-coded into the landing page.
  function currentFocus(person){
    const focus=String(person.studyFocus||person.purpose||'').trim();
    const level=String(person.goal||'').trim();
    for(const prefix of [level+' · ','JLPT '+level+' · ']){
      if(level&&focus.startsWith(prefix))return focus.slice(prefix.length);
    }
    return focus;
  }
  function currentStage(person){
    const level=String(person.goal||'').trim();
    if(!level)return tr('Lộ trình riêng','Own learning path','自分の学習ルート');
    if(level==='N5')return tr('Nền tảng N5','Foundation N5','基礎 N5');
    if(level==='N2')return 'JLPT N2';
    return level;
  }
  function enhance(html,people,selected){
    if(isBaseline())return html;
    const template=document.createElement('template');template.innerHTML=html;
    template.content.querySelector('.atelier-home').classList.add('portal-home');
    const section=template.content.querySelector('.atelier-access');
    section.innerHTML=`<div class="access-heading"><span class="atelier-kicker">${tr('CHÀO MỪNG TRỞ LẠI','WELCOME BACK','おかえりなさい')}</span><h2>${tr('Hôm nay, ai sẽ học?','Who is learning today?','今日は、だれが学びますか。')}</h2><p>${tr('Chạm vào ảnh. Bước vào nhịp học của bạn.','Choose your portrait. Return to your own pace.','写真を選んで、自分のペースへ。')}</p></div>
      <div class="portal-people family-picker" role="group" aria-label="${tr('Chọn người học','Choose a learner','学習者を選ぶ')}">${people.map((p,i)=>`<button type="button" class="family-choice portal-person" data-action="loginprofile" data-learner-season="${seasons[i%4]}" data-id="${esc(p.id)}" aria-haspopup="dialog" aria-label="${esc(tr('Mở khung nhập mã cho ','Open access code for ','アクセスコードを入力：')+p.name)}"><span class="family-photo">${avatar(p,true)}<span class="portal-person-arrow" aria-hidden="true">${icon('arrow')}</span></span><span class="family-name" data-no-translate>${esc(p.name)}</span><span class="home-learner-rule" aria-hidden="true"></span><span class="portal-person-goal">${esc(currentStage(p))}</span><span class="home-learner-focus" data-no-translate>${esc(currentFocus(p))}</span><span class="home-season-decoration" aria-hidden="true"></span></button>`).join('')}</div>
      <p class="portal-entry-hint">${icon('lock')} ${tr('Chọn ảnh để nhập mã truy cập.','Select a portrait to enter your code.','写真を選ぶと入力画面が開きます。')}</p>
      <div class="portal-guest-row">${button(icon('leaf')+`<span>${tr('Khám phá với tư cách khách','Explore as a guest','ゲストとして体験')}</span>`,'portal-guest','portal-guest')}${link(tr('Hồ sơ khác','Other profiles','ほかのプロフィール'),'profiles','textlink')}</div>
      <div class="atelier-access-links portal-access-links">${link(tr('Tôi có mã mời','I have an invitation','招待コードを持っています')+icon('arrow'),'invite','')}<span>${tr('Bản trải nghiệm · dùng mã mẫu','Prototype · sample access code','体験版・サンプルコード')}</span></div>`;
    if(window.NP_STATIC_PUBLISH){
      // Public GitHub Pages demo: card expands to a local-only PIN prompt.
      // HOME V2 is scoped to the static family landing; app and learning flows stay unchanged.
      if(!window.NP_FAMILY_SYNC){
        const home=template.content.querySelector('.atelier-home');
        home.classList.add('home-v2','home-v3');
        home.classList.add('home-v4');
        home.dataset.season=preferredSeason();
        const headerActions=home.querySelector('.atelier-header-actions');
        if(headerActions){
          const seasonControl=document.createElement('div');
          seasonControl.className='home-season-control';
          seasonControl.setAttribute('role','group');
          seasonControl.setAttribute('aria-label',tr('Chủ đề bốn mùa','Four seasonal themes','四季のテーマ'));
          const options=seasonLabels[Locale.code]||seasonLabels.vi;
          seasonControl.innerHTML=seasons.map((season,i)=>`<button class="home-season-button" type="button" data-season-choice="${season}" aria-label="${options[i]}" title="${options[i]}" aria-pressed="${season===home.dataset.season}">${seasonArtwork[i]}</button>`).join('');
          headerActions.prepend(seasonControl);
        }
        // This is an entrance/welcome screen. Keep only locale and theme in
        // the header; a single large lockup belongs to the centered hero.
        home.querySelector('.home-brand')?.remove();
        home.querySelector('.brand-edition')?.remove();
        home.querySelector('.home-guide')?.remove();
        home.querySelector('.atelier-footer')?.remove();
        const story=home.querySelector('.atelier-story');
        story.innerHTML=`<div class="horizon-hero-lockup" data-no-translate>
            <img class="horizon-hero-mark" src="assets/horizon-mark.svg?v=homev3" width="114" height="91" alt="" decoding="async">
            <div class="horizon-hero-wordmark">HORIZON</div>
            <p class="horizon-home-slogan horizon-hero-tagline" lang="en">A little closer. <em>A world wider.</em></p>
          </div>
          <div class="home-v3-welcome">
            <h1 class="home-v3-question"><span>${tr('Hôm nay,','Today,','今日は、')}</span> <em>${tr('ai sẽ tiếp tục hành trình?','who continues the journey?','だれが旅を続けますか？')}</em></h1>
            <p class="home-v2-intro">${tr('Chọn hồ sơ để trở lại nhịp học của mình.','Choose your profile to pick up where you left off.','プロフィールを選んで、学びの続きを始めましょう。')}</p>
          </div>`;
        // Four whole-card avatar buttons remain in the same order.
        // The heading above is the sole visual focus, not a second competing headline.
        section.querySelector('.access-heading')?.remove();
        section.querySelector('.portal-entry-hint')?.remove();
        const guest=section.querySelector('[data-action="portal-guest"]');
        if(guest){
          guest.innerHTML=icon('leaf')+'<span>'+tr('Vào thử với tư cách khách','Try as a guest','ゲストとして試す')+'</span>';
          guest.setAttribute('aria-label',tr('Vào thử với tư cách khách','Try as a guest','ゲストとして試す'));
        }
      }
      // Guest is separate; this is not real authentication.
      section.querySelector('.portal-access-links')?.remove();
      section.querySelector('.portal-guest-row > a')?.remove();
      const hint=section.querySelector('.portal-entry-hint');
      if(hint)hint.textContent=tr('Chọn avatar để nhập PIN demo.','Choose an avatar to enter your demo PIN.','写真を選んでPINを入力してください。');
      section.querySelectorAll('[data-action="loginprofile"]').forEach(button=>{
        button.setAttribute('aria-haspopup','dialog');
        button.setAttribute('aria-label',tr('Mở PIN của ','Open PIN for ','PINを開く：')+(db.profiles.find(p=>p.id===button.dataset.id)?.name||''));
      });
    }
    return template.innerHTML;
  }
  function open(id,buttonElement){
    const p=db.profiles.find(p=>p.id===id&&!p.archived&&p.role!=='guest');
    if(!p)return;
    opener=buttonElement||document.activeElement;loginSelected=p.id;accessError='';applyPrefs();
    const title=tr('Chào ','Welcome, ','')+p.name+tr('.','.','さん。');
    const dialog=document.querySelector('#modal');dialog.classList.add('portal-dialog');updateHeight();
    modal(title,`<div class="portal-identity"><div class="portal-portrait">${avatar(p,true)}<span lang="ja" aria-hidden="true">一歩</span></div><p>${tr('Một khoảng riêng, một bước tiếp theo.','Your own space. Your next small step.','自分の場所で、次の一歩へ。')}</p><span class="portal-goal">${tr('Mục tiêu','Goal','目標')} ${esc(p.goal)} <i></i> ${p.minutes} ${tr('phút mỗi buổi','min per session','分／回')}</span></div>
      <form data-form="demologin" class="portal-form" autocomplete="off"><input type="hidden" name="learner" value="${esc(p.id)}"><label for="demo-access-code">${tr('Mã truy cập','Access code','アクセスコード')}</label><div class="atelier-code-field"><input id="demo-access-code" name="demoCode" type="password" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${tr('Nhập mã để học tiếp','Enter your code to continue','コードを入力して続ける')}" required autofocus aria-describedby="demo-code-help login-error"><button type="button" class="secret-toggle" data-action="togglecode" aria-controls="demo-access-code" aria-label="${tr('Hiện mã demo','Show demo code','サンプルコードを表示')}">${icon('eye')}</button></div><div class="atelier-code-help" id="demo-code-help"><span>${tr('Mã thử','Demo code','体験コード')}: <code data-no-translate>PATH-DEMO</code></span>${button(tr('Điền mã mẫu','Fill sample code','サンプルを入力'),'fillcode','textlink')}</div>
      <div class="portal-form-options"><label class="check-inline"><input name="rememberProfile" type="checkbox" ${rememberDemoProfile?'checked':''}>${tr('Nhớ lựa chọn của tôi','Remember my profile','プロフィールを記憶')}</label>${link(tr('Quên mã?','Forgot code?','コードを忘れた場合'),'forgot','textlink')}</div><p id="login-error" class="atelier-error" role="alert" hidden></p><button class="atelier-enter" type="submit"><span>${tr('Vào không gian học','Enter my learning space','学習スペースへ')}</span>${icon('arrow')}</button><p class="portal-demo-note">${tr('Bản thử · Không nhập mật khẩu thật.','Demo · Do not enter a real password.','体験版・実際のパスワードは入力しないでください。')}</p></form>
      <button type="button" class="portal-switch-person" data-action="portal-close">${icon('back')} ${tr('Chọn người học khác','Choose another learner','別の学習者を選ぶ')}</button>`);
    updateHeight();
    // Synchronous focus inside the tap event supports the mobile keyboard gesture.
    document.querySelector('#demo-access-code')?.focus({preventScroll:true});
  }
  function updateHeight(){
    const dialog=document.querySelector('#modal');
    if(!dialog?.classList.contains('portal-dialog'))return;
    dialog.style.setProperty('--portal-visible-height',Math.max(240,(window.visualViewport?.height||innerHeight)-24)+'px');
    if(dialog.open&&document.activeElement?.id==='demo-access-code')requestAnimationFrame(()=>{
      if(dialog.open&&document.activeElement?.id==='demo-access-code')document.activeElement.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});
    });
  }
  // The single tap opens a card-to-PIN morph on the public, static family preview.
  // Production/server-backed profiles use the independent verified API path.
  document.addEventListener('click',event=>{
    const button=event.target.closest?.('[data-season-choice]');
    if(!button||!seasons.includes(button.dataset.seasonChoice))return;
    const home=button.closest('.home-v4');
    if(!home)return;
    const selected=button.dataset.seasonChoice;
    home.dataset.season=selected;
    home.querySelectorAll('[data-season-choice]').forEach(item=>{
      item.setAttribute('aria-pressed',String(item.dataset.seasonChoice===selected));
    });
    try{localStorage.setItem('np-home-season-v1',selected);}catch{}
  });
  document.addEventListener('click',event=>{
    if(!window.NP_STATIC_PUBLISH||route()!=='login')return;
    // When paired, let the D1 adapter apply its save-before-switch guards.
    if(window.NP_FAMILY_SYNC&&localStorage.getItem('np-family-sync-key-v1'))return;
    const button=event.target.closest('[data-action="loginprofile"]');
    if(!button)return;
    const p=db.profiles.find(p=>p.id===button.dataset.id&&!p.archived&&p.role!=='guest');
    if(!p)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if(window.NPFamilyAccess)window.NPFamilyAccess.open(p.id,button);
    else modal('Chưa mở được hồ sơ demo','<p>Vui lòng tải lại trang rồi chọn avatar.</p>');
  },true);
  document.addEventListener('click',event=>{
    if(event.target.closest('[data-locale]')&&route()==='login')queueMicrotask(()=>{
      render(false);document.querySelector(`.atelier-header [data-locale="${Locale.code}"]`)?.focus({preventScroll:true});
    });
    const button=event.target.closest('[data-action]');if(!button)return;
    if(button.dataset.action==='portal-close'){event.preventDefault();closeModal();}
    if(button.dataset.action==='portal-guest'){event.preventDefault();if(window.NP_STATIC_PUBLISH&&!window.NP_FAMILY_SYNC&&window.NPFamilyAccess)window.NPFamilyAccess.enterGuest();else{loginSelected='guest';go('guest');}}
  });
  document.addEventListener('DOMContentLoaded',()=>{
    document.querySelector('#modal').addEventListener('close',()=>{
      document.querySelector('#modal').classList.remove('portal-dialog','family-pin-dialog');
      if(route()==='login'&&opener?.isConnected)opener.focus({preventScroll:true});
      opener=null;
    });
  });
  window.visualViewport?.addEventListener('resize',updateHeight);
  return {enhance,open,isBaseline,openPin:(id,button)=>window.NPFamilyPinUI?.open(id,button)};
})();
