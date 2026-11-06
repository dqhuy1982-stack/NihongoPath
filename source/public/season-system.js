/* HORIZON · one season across Home, PIN and the entire learning shell.
   Cosmetic preference ONLY. Learning records and per-profile dark mode unchanged. */
(function(){
  'use strict';
  const KEY='np-home-season-v1';
  const seasons=['spring','summer','autumn','winter'];
  const words={
    vi:['Xuân','Hạ','Thu','Đông'],
    en:['Spring','Summer','Autumn','Winter'],
    ja:['春','夏','秋','冬']
  };
  const titles={
    vi:'Đổi mùa',en:'Change season',ja:'季節を変更'
  };
  const motifs={
    spring:'<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M16 14c-3-4.6-2.4-8.2 0-9.1 2.5.9 3.2 4.5 0 9.1Zm3 1.4c5.5-1.4 8.2.4 8.1 3.1-1.1 2.3-4.6 2.6-8.1-3.1Zm-1 4c1.8 5.3-.3 8.3-3.1 8-2.3-1.2-2.5-4.6 3.1-8Zm-4.2 0c-5.2 1.9-8.3-.2-8-3 1.2-2.4 4.7-2.8 8 3Zm-1.7-4.7c-4.7-3.2-4.7-6.8-2.2-8.3 2.6-.1 4.5 2.8 2.2 8.3Z"/><circle cx="16" cy="16.5" r="2.2"/></svg>',
    summer:'<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" aria-hidden="true"><circle cx="16" cy="16" r="6.3"/><path d="M16 3v3.5M16 25.5V29M3 16h3.5M25.5 16H29M6.8 6.8l2.6 2.6m13.2 13.2 2.6 2.6m0-18.4-2.6 2.6M9.4 22.6l-2.6 2.6"/></svg>',
    autumn:'<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="m16 3 3.3 6.5 6.2-1.9-2.6 6.2 5 3.8-7.2 1.3-1.5 6.2-3.2-2.7-3.2 2.7-1.5-6.2-7.2-1.3 5-3.8-2.6-6.2 6.2 1.9Z"/><path d="M16 16.5v11.8m-4.3-10.2 4.3 4.3 4.3-4.3"/></svg>',
    winter:'<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 3v26M4.7 9.5l22.6 13M4.7 22.5l22.6-13M12.5 6.5 16 10l3.5-3.5M12.5 25.5 16 22l3.5 3.5M7.5 14l4.9-.9-.9-4.9m9 15.6-.9-4.9 4.9-.9M7.5 18l4.9.9-.9 4.9m9-15.6-.9 4.9 4.9.9"/></svg>'
  };
  function language(){const c=window.Locale?.code;return c==='en'||c==='ja'?c:'vi';}
  function current(){
    try{const v=localStorage.getItem(KEY);return seasons.includes(v)?v:'spring';}
    catch{return 'spring';}
  }
  function mark(season=current()){return 'assets/horizon-mark-'+(seasons.includes(season)?season:'spring')+'.svg?v=12';}
  function label(season=current()){return words[language()][seasons.indexOf(season)]||words.vi[0];}
  function sync(){
    const season=current();
    document.documentElement.dataset.season=season;
    document.body.dataset.season=season;
    for(const image of document.querySelectorAll('[data-season-mark]')){
      const url=mark(season);
      if(image.getAttribute('src')!==url)image.setAttribute('src',url);
    }
    for(const el of document.querySelectorAll('[data-inner-season-name]'))el.textContent=label(season);
    for(const el of document.querySelectorAll('[data-inner-season-toggle]')){
      el.innerHTML=motifs[season]+'<span data-inner-season-name>'+label(season)+'</span>';
      el.setAttribute('aria-label',titles[language()]+' · '+label(season));
      el.setAttribute('title',titles[language()]+' · '+label(season));
    }
    for(const el of document.querySelectorAll('[data-inner-season-option]')){
      const isCurrent=el.dataset.innerSeasonOption===season;
      el.setAttribute('aria-pressed',String(isCurrent));
      el.setAttribute('aria-label',words[language()][seasons.indexOf(el.dataset.innerSeasonOption)]);
      el.setAttribute('title',words[language()][seasons.indexOf(el.dataset.innerSeasonOption)]);
      const span=el.querySelector('span');
      if(span)span.textContent=words[language()][seasons.indexOf(el.dataset.innerSeasonOption)];
    }
  }
  function apply(section){
    document.body.classList.toggle('np-season-shell',section!=='login');
    sync();
  }
  function set(season){
    if(!seasons.includes(season))return false;
    try{localStorage.setItem(KEY,season);}catch{return false;}
    sync();
    return true;
  }
  function controls(){
    const season=current();
    const menu=seasons.map(s=>'<button type="button" class="np-season-option" data-inner-season-option="'+s+'" aria-pressed="'+String(s===season)+'" aria-label="'+words[language()][seasons.indexOf(s)]+'" title="'+words[language()][seasons.indexOf(s)]+'">'+motifs[s]+'<span>'+words[language()][seasons.indexOf(s)]+'</span></button>').join('');
    return '<details class="np-inner-seasons"><summary data-inner-season-toggle aria-label="'+titles[language()]+' · '+label(season)+'" title="'+titles[language()]+' · '+label(season)+'">'+motifs[season]+'<span data-inner-season-name>'+label(season)+'</span></summary><div class="np-inner-season-options" role="group" aria-label="'+titles[language()]+'">'+menu+'</div></details>';
  }
  document.addEventListener('click',event=>{
    const choice=event.target.closest?.('[data-inner-season-option]');
    if(choice){
      event.preventDefault();
      if(set(choice.dataset.innerSeasonOption)){
        const details=choice.closest('.np-inner-seasons');
        if(details){details.open=false;details.querySelector('summary')?.focus({preventScroll:true});}
      }
    }
    if(event.target.closest?.('[data-locale]'))queueMicrotask(sync);
  });
  document.addEventListener('keydown',event=>{
    if(event.key!=='Escape')return;
    const open=document.querySelector('.np-inner-seasons[open]');
    if(open){open.open=false;open.querySelector('summary')?.focus({preventScroll:true});}
  });
  window.addEventListener('storage',event=>{
    if(event.key===KEY)sync();
  });
  window.NPSeason=Object.freeze({current,mark,label,apply,set,controls,sync});
})();
