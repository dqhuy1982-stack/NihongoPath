import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const root=new URL('../source/public/',import.meta.url);
const read=file=>readFileSync(new URL(file,root),'utf8');
const page=read('index.html');
const ui=read('login-ui.js');
const home=read('home-v2.css');
const homeV3=read('home-v3.css');
const pinUi=read('family-pin-ui.js');
const pinCss=read('home-pin.css');
const app=read('app.js');
const auth=read('family-demo-auth.js');

test('Home V2 stylesheet is loaded last, after shared readability rules',()=>{
 const link='href="home-v2.css"';
 assert.ok(page.includes(link),'new stylesheet is not loaded');
 assert.equal(page.split(link).length,2,'new stylesheet should appear exactly once');
 assert.ok(page.indexOf(link)>page.indexOf('href="readability.css"'));
 assert.ok(page.indexOf(link)<page.indexOf('</head>'));
 assert.ok(page.indexOf('href="home-pin.css"')>page.indexOf(link));
 assert.ok(page.indexOf('src="family-pin-ui.js?v=9"')>page.indexOf('src="login-ui.js?v=9.2"'));
});

test('Home V2 only changes static home/login and removes visual clutter',()=>{
 assert.ok(ui.includes("if(!window.NP_FAMILY_SYNC){"),'exclude server-backed mode');
 assert.ok(ui.includes("home.classList.add('home-v2','home-v3')"),'home needs scoped V3 and shared gallery classes');
 for(const redundant of [".brand-edition", ".home-guide", ".atelier-footer", ".portal-entry-hint"]){
  assert.ok(ui.includes(redundant),'expected landing reduction '+redundant);
 }
 assert.ok(ui.includes("home.classList.add('home-v2','home-v3')"));
 assert.ok(ui.includes("home.querySelector('.home-brand')?.remove()"));
 assert.ok(ui.includes('horizon-hero-lockup'));
 assert.ok(ui.includes('home-v2-intro'));
 assert.ok(ui.includes('horizon-hero-wordmark'));
 assert.ok(ui.includes('horizon-hero-tagline'));
 assert.ok(page.includes('href="home-v3.css"'));
 assert.ok(ui.includes("section.querySelector('.portal-entry-hint')?.remove()"));
 assert.ok(ui.includes("tr('Hôm nay, ai sẽ học?'"),'family picker must remain primary');
 for(const id of ['demo-a','demo-b','demo-c','demo-d']){
  assert.ok(app.includes("'"+id+"'"),'missing family profile '+id);
 }
 for(const name of ['Quang Huy','Vy Anh','Nam Khánh','Gia Hưng'])assert.ok(app.includes(name));
});

test('learner cards morph to demo PIN; Guest remains no-PIN',()=>{
 assert.ok(ui.includes('data-action="loginprofile"'));
 assert.ok(ui.includes("window.NPFamilyAccess.open(p.id,button)"));
 assert.ok(ui.includes("aria-haspopup','dialog"));
 assert.ok(auth.includes('createPin,unlock,resetPin,hasPin'));
 assert.ok(pinUi.includes('np-pin-window'));
 assert.ok(pinUi.includes("renderStage(window.NPFamilyAccess.hasPin(id)?'unlock':'create')"));
 assert.ok(pinUi.includes("renderStage('confirm')"));
 assert.ok(pinUi.includes('np-pin-source'));
 assert.ok(pinCss.includes('.np-pin-visible .np-pin-backdrop'));
 assert.ok(pinCss.includes('@media(prefers-reduced-motion:reduce)'));
 assert.ok(pinCss.includes('role')===false,'CSS stays presentation-only');
 assert.ok(ui.includes('data-action="portal-guest"'));
 assert.ok(ui.includes("window.NPFamilyAccess.enterGuest()"));
 assert.ok(auth.includes("if(!window.NP_STATIC_PUBLISH||window.NP_FAMILY_SYNC"),'server mode must stay separate');
 assert.ok(app.includes("profiles:db.profiles.filter(p=>p.id!=='guest')"));
 assert.ok(!auth.includes('return enter(id);\n }\n function enterGuest'),'no immediate family entry');
});

test('Home V2 responsive, scrollable and accessible on phone and desktop',()=>{
 for(const marker of [
  '.home-v2.atelier-home','@media(max-width:850px)','@media(max-width:430px)',
  '@media(min-width:851px) and (max-height:760px)','@media(prefers-reduced-motion:reduce)',
  '.compact .home-v2 .atelier-main','.home-v2 .portal-people',
  '.home-v2 .portal-person:focus-visible', 'min-height:100svh','overflow:visible',
  'grid-template-columns:repeat(2,minmax(0,1fr))'
 ])assert.ok(home.includes(marker),'missing '+marker);
 assert.ok(!home.includes('position:fixed'),'no fixed app chrome');
 assert.ok(!home.includes('overflow:hidden'),'avoid mobile clipping');
 assert.ok(!home.includes('display:none!important'),'avoid hiding learner cards');
});

test('PIN expansion never reveals a transient desktop scrollbar',()=>{
 const start=pinCss.indexOf('.np-pin-visible .np-pin-window{');
 const end=pinCss.indexOf('}',start);
 const expandingStyle=pinCss.slice(start,end);
 assert.ok(expandingStyle.includes('overflow:hidden'),'keep clipping throughout the grow animation');
 assert.ok(!expandingStyle.includes('overflow-y:auto'),'auto overflow must not activate while the panel grows');
 assert.ok(pinCss.includes('.np-pin-settled.np-pin-scrollable .np-pin-window'));
 assert.ok(pinCss.includes('overflow-y:auto'),'short screens must retain scroll support after settling');
 assert.ok(pinUi.includes("overlay.classList.add('np-pin-settled')"));
 assert.ok(pinUi.includes("panel.scrollHeight>panel.clientHeight+2"),'enable scrolling only when content actually exceeds final height');
 assert.ok(pinUi.includes("event.propertyName==='height'"),'wait for final size transition');
 assert.ok(pinUi.includes('window.setTimeout(finishMorph,390)'),'fallback when transitionend is skipped');
 assert.ok(pinUi.includes('if(!touchLike())focusInput()'),'desktop focus must be deferred');
 assert.ok(pinUi.includes('if(touchLike())focusInput()'),'iPhone gesture-time focus must be preserved');
 assert.ok(pinUi.includes("state.overlay.classList.remove('np-pin-scrollable','np-pin-settled','np-pin-visible')"),'closing should hide the scroll container immediately');
});

test('HOME V3 keeps the brand together at the center, with only locale controls in header',()=>{
 assert.ok(page.indexOf('href="home-v3.css"')>page.indexOf('href="horizon-brand.css"'),'V3 overrides load last');
 assert.ok(ui.includes("home.classList.add('home-v2','home-v3')"));
 assert.ok(ui.includes("home.querySelector('.home-brand')?.remove()"));
 assert.ok(ui.includes('class="horizon-hero-lockup"'));
 assert.ok(ui.includes('class="horizon-hero-wordmark">HORIZON</div>'));
 assert.ok(ui.includes('class="horizon-home-slogan horizon-hero-tagline"'));
 assert.ok(ui.includes('A little closer. <em>A world wider.</em>'));
 assert.ok(ui.includes('class="home-v3-welcome"'));
 assert.ok(ui.includes('class="home-v3-question"'));
 assert.ok(homeV3.includes('justify-content:center'));
 assert.ok(homeV3.includes('.home-v3 .horizon-hero-mark'));
 assert.ok(homeV3.includes('width:98px'));
 assert.ok(homeV3.includes('.home-v3 .horizon-hero-wordmark'));
 assert.ok(homeV3.includes('font:510 clamp(40px,3.4vw,46px)'));
 assert.ok(!homeV3.includes('position:fixed'),'Home header should not float above cards');
 assert.ok(homeV3.includes('grid-template-columns:repeat(2,minmax(0,1fr))'),'mobile 2x2 learner cards');
 assert.ok(homeV3.includes('@media(max-width:430px)'));
 assert.ok(homeV3.includes('@media(max-width:850px) and (max-height:740px)'));
 assert.ok(homeV3.includes('body.dark .home-v3'));
 assert.ok(homeV3.includes('@media(prefers-reduced-motion:reduce)'));
});

test('editorial portrait gallery has no numbered corner or boxed desktop tiles',()=>{
 assert.ok(homeV3.includes('.home-v3.home-v2 .portal-people'),'new gallery scoped to family landing');
 assert.ok(homeV3.includes('border-top:1px solid #dce5d9'),'gallery gets subtle editorial boundary');
 assert.ok(homeV3.includes('border-bottom:1px solid #dce5d9'));
 assert.ok(homeV3.includes('.portal-person + .portal-person'),'hairline separators replace card boxes');
 assert.ok(homeV3.includes('content:none!important'),'number and arrow badges removed');
 assert.ok(homeV3.includes('border-radius:91px 91px 22px 22px!important'),'arched portrait silhouette');
 assert.ok(homeV3.includes('width:156px'),'larger portraits become the visual focus');
 assert.ok(homeV3.includes('height:174px'));
 assert.ok(homeV3.includes('object-fit:cover'),'avoid stretching headshots');
 assert.ok(homeV3.includes('display:inline;'),'one-line greeting instead of forced 2-line H1');
 assert.ok(homeV3.includes('white-space:nowrap'),'desktop greeting remains on one line');
 assert.ok(homeV3.includes('@media(min-width:851px) and (max-height:760px)'),'short PC displays can compress');
 assert.ok(homeV3.includes('@media(max-width:850px) and (max-height:740px)'),'small phones scroll naturally');
 assert.ok(homeV3.includes('body.dark .home-v3.home-v2 .portal-person'),'dark mode stays legible');
 assert.ok(homeV3.includes('@media(prefers-reduced-motion:reduce)'),'respect reduced motion');
 assert.ok(!homeV3.includes('position:fixed'),'no fake fullscreen sections or scroll traps');
 assert.ok(ui.includes("window.NPFamilyAccess.open(p.id,button)"),'still opens PIN panel');
});
