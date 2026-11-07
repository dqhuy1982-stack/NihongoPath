/* FOUNDATION · Kana Journey, Phase A.
   Information architecture only: links working modules, makes NO learner-data writes,
   does not infer completion or mastery from independent practice stores. */
(function(){
 'use strict';
 const U=(key,params)=>Locale.ui('foundation.'+key,params);
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const units=[
  {code:'F01',key:'f01',state:'statusSample',href:'lesson/foundation-vowels',action:'unit.open'},
  {code:'F01B',key:'f01b',state:'statusSample',href:'lesson/foundation-k-row',action:'unit.open'},
  {code:'F02',key:'f02',state:'statusTool',href:'kana',action:'unit.writing'},
  {code:'F03',key:'f03',state:'statusPlanned'},
  {code:'F04',key:'f04',state:'statusPlanned'},
  {code:'F05',key:'f05',state:'statusPlanned'},
  {code:'F06',key:'f06',state:'statusPlanned'}
 ];
 const stages=[
  {id:'learn',href:'lesson/foundation-vowels'},
  {id:'practice',href:'kana'},
  {id:'check',href:'kana/check'}
 ];
 function stageCard(stage,index){
  return `<article class="fj-stage fj-stage-${stage.id}">
   <div class="fj-stage-label"><span class="fj-stage-number" aria-hidden="true">${String(index+1).padStart(2,'0')}</span>
    <h3>${U('stage.'+stage.id)}</h3></div>
   <p>${U('stage.'+stage.id+'Desc')}</p>
   <a class="fj-stage-action" href="#${stage.href}">${U('stage.'+stage.id+'Action')} <span aria-hidden="true">↗</span></a>
  </article>`;
 }
 function unitRow(unit){
  const status=unit.state==='statusPlanned'?'fj-pending':'fj-ready';
  const action=unit.href?`<a href="#${unit.href}" class="fj-unit-action">${U(unit.action)} <span aria-hidden="true">↗</span></a>`:
    `<span class="fj-unit-muted">${U('unit.pending')}</span>`;
  return `<li class="fj-unit" data-foundation-unit="${unit.code}">
     <span class="fj-unit-code">${esc(unit.code)}</span>
     <div class="fj-unit-description"><strong>${U('unit.'+unit.key)}</strong>
      <span class="fj-status ${status}">${U(unit.state)}</span></div>
     <div class="fj-unit-end">${action}</div>
    </li>`;
 }
 function page(){
  return `<div class="fj-page">
   <a href="#learn" class="textlink fj-back">← ${U('back')}</a>
   <header class="fj-heading">
    <div><div class="eyebrow">${U('eyebrow')}</div>
     <h1>${U('title')}</h1>
     <p>${U('subtitle')}</p></div>
    <span class="fj-symbol" lang="ja" aria-hidden="true">あ <span>→</span> ア</span>
   </header>
   <div class="fj-intro" role="note">
    <div class="fj-intro-copy"><span class="fj-kicker">${U('currentTitle')}</span>
     <h2>${U('noticeTitle')}</h2>
     <p>${U('currentDescription')}</p></div>
    <a class="btn primary fj-hero-action" href="#lesson/foundation-vowels">${U('stage.learnAction')} <span aria-hidden="true">↗</span></a>
   </div>
   <section class="fj-flow" aria-label="${U('title')}">
    <div class="fj-flow-cards">${stages.map(stageCard).join('')}</div>
    <p class="fj-inline-note">${U('notice')}</p>
   </section>
   <details class="fj-unit-list">
    <summary><span><strong>${U('unitTitle')}</strong><small>${U('unitSubtitle')}</small></span><span class="fj-expand" aria-hidden="true">⌄</span></summary>
    <ol>${units.map(unitRow).join('')}</ol>
   </details>
   <section class="fj-next">
    <div><div class="eyebrow">${U('bridgeTitle')}</div>
     <h2>${U('bridgeTitle')}</h2><p>${U('bridgeText')}</p>
     <small>${U('readiness')}</small></div>
    <div class="fj-next-links"><a href="#course/N5" class="btn">${U('bridgeAction')}</a>
     <a href="#review" class="textlink">${U('reviewAction')}</a></div>
   </section>
   <p class="fj-footnote">${U('privacy')}</p>
  </div>`;
 }
 window.NPFoundationJourney=Object.freeze({page,units:()=>units.map(({code,key,state})=>({code,key,state}))});
})();