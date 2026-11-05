import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const root=new URL('../source/public/',import.meta.url);
const read=file=>readFileSync(new URL(file,root),'utf8');
const page=read('index.html');
const ui=read('login-ui.js');
const home=read('home-v2.css');
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
 assert.ok(page.indexOf('src="family-pin-ui.js"')>page.indexOf('src="login-ui.js"'));
});

test('Home V2 only changes static home/login and removes visual clutter',()=>{
 assert.ok(ui.includes("if(!window.NP_FAMILY_SYNC){"),'exclude server-backed mode');
 assert.ok(ui.includes("home.classList.add('home-v2')"),'home needs scoped class');
 for(const redundant of [".brand-edition", ".home-guide", ".atelier-footer", ".portal-entry-hint"]){
  assert.ok(ui.includes(redundant),'expected landing reduction '+redundant);
 }
 assert.ok(ui.includes('home-v2-eyebrow'));
 assert.ok(ui.includes('home-v2-intro'));
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
