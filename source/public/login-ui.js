/* Avatar-first entry. Static demo is one tap; legacy login dialog remains for backend/reference flows. */
window.NPLogin=(function(){
  'use strict';
  const tr=(vi,en,ja)=>[vi,en,ja][{vi:0,en:1,ja:2}[Locale.code]||0];
  let opener=null;
  const isBaseline=()=>new URLSearchParams(location.search).get('login-view')==='before';
  function enhance(html,people,selected){
    if(isBaseline())return html;
    const template=document.createElement('template');template.innerHTML=html;
    template.content.querySelector('.atelier-home').classList.add('portal-home');
    const section=template.content.querySelector('.atelier-access');
    section.innerHTML=`<div class="access-heading"><span class="atelier-kicker">${tr('CHÀO MỪNG TRỞ LẠI','WELCOME BACK','おかえりなさい')}</span><h2>${tr('Hôm nay, ai sẽ học?','Who is learning today?','今日は、だれが学びますか。')}</h2><p>${tr('Chạm vào ảnh. Bước vào nhịp học của bạn.','Choose your portrait. Return to your own pace.','写真を選んで、自分のペースへ。')}</p></div>
      <div class="portal-people family-picker" role="group" aria-label="${tr('Chọn người học','Choose a learner','学習者を選ぶ')}">${people.map(p=>`<button type="button" class="family-choice portal-person" data-action="loginprofile" data-id="${esc(p.id)}" aria-haspopup="dialog" aria-label="${esc(tr('Mở khung nhập mã cho ','Open access code for ','アクセスコードを入力：')+p.name)}"><span class="family-photo">${avatar(p,true)}<span class="portal-person-arrow" aria-hidden="true">${icon('arrow')}</span></span><span class="family-name" data-no-translate>${esc(p.name)}</span><span class="portal-person-goal">${tr('Mục tiêu','Goal','目標')} ${esc(p.goal)}</span></button>`).join('')}</div>
      <p class="portal-entry-hint">${icon('lock')} ${tr('Chọn ảnh để nhập mã truy cập.','Select a portrait to enter your code.','写真を選ぶと入力画面が開きます。')}</p>
      <div class="portal-guest-row">${button(icon('leaf')+`<span>${tr('Khám phá với tư cách khách','Explore as a guest','ゲストとして体験')}</span>`,'portal-guest','portal-guest')}${link(tr('Hồ sơ khác','Other profiles','ほかのプロフィール'),'profiles','textlink')}</div>
      <div class="atelier-access-links portal-access-links">${link(tr('Tôi có mã mời','I have an invitation','招待コードを持っています')+icon('arrow'),'invite','')}<span>${tr('Bản trải nghiệm · dùng mã mẫu','Prototype · sample access code','体験版・サンプルコード')}</span></div>`;
    if(window.NP_STATIC_PUBLISH){
      // Public GitHub Pages demo: one tap, no credentials or server-side auth.
      // HOME V2 is scoped to the static family landing; app and learning flows stay unchanged.
      if(!window.NP_FAMILY_SYNC){
        const home=template.content.querySelector('.atelier-home');
        home.classList.add('home-v2');
        home.querySelector('.brand-edition')?.remove();
        home.querySelector('.home-guide')?.remove();
        home.querySelector('.atelier-footer')?.remove();
        const story=home.querySelector('.atelier-story');
        story.innerHTML=`<div class="home-v2-eyebrow">${tr('KHÔNG GIAN HỌC CỦA GIA ĐÌNH','A FAMILY LEARNING JOURNEY','家族の学び')}</div>
          <h1><span>${tr('Hôm nay,','Today,','今日は、')}</span> <em>${tr('ai sẽ học?','who is learning?','だれが学ぶ？')}</em></h1>
          <p class="home-v2-intro">${tr('Mỗi người một lộ trình. Chọn hồ sơ để tiếp tục bài học của bạn.','A learning path for each person. Choose a profile to continue.','一人ひとりの学習ルート。プロフィールを選んで続きを学びましょう。')}</p>`;
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
      if(hint)hint.textContent=tr('Chọn avatar để vào học ngay. Tiến độ chỉ lưu trên thiết bị này.','Tap an avatar to start learning. Progress stays on this device.','写真を選ぶとすぐに学習を開始します。記録はこの端末に保存されます。');
      section.querySelectorAll('[data-action="loginprofile"]').forEach(button=>{
        button.removeAttribute('aria-haspopup');
        button.setAttribute('aria-label',tr('Vào học với ','Start learning as ','学習を開始：')+(db.profiles.find(p=>p.id===button.dataset.id)?.name||''));
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
  // A one-tap picker for static, browser-only family learning.
  // Production/server-backed profiles use the independent verified API path.
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
  return {enhance,open,isBaseline};
})();
