import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const root=new URL('../source/public/',import.meta.url);
const read=path=>readFileSync(new URL(path,root),'utf8');
const page=read('index.html');
const login=read('login-ui.js');
const css=read('home-v4.css');
const app=read('app.js');
const pin=read('family-pin-ui.js');

test('Home V4 is enabled only for the static family login',()=>{
 assert.ok(login.includes("if(!window.NP_FAMILY_SYNC){"));
 assert.ok(login.includes("home.classList.add('home-v4')"));
 assert.ok(page.includes('href="home-v4.css"'));
 assert.ok(page.indexOf('href="home-v4.css"')>page.indexOf('href="home-v3.css"'),'V4 styles must override older V3');
 assert.ok(!css.includes('position:fixed'),'Home must scroll naturally');
 assert.ok(login.includes('window.NPFamilyAccess.open(p.id,button)'),'PIN opens from same profile button');
 assert.ok(login.includes('window.NPFamilyAccess.enterGuest()'),'Guest action remains PIN-free');
 assert.ok(pin.includes('np-pin-window'),'same morphing PIN dialog');
 assert.ok(app.includes('profiles:db.profiles.filter(p=>p.id!==\'guest\')'),'do not overwrite family history with guest');
});
test('Real photo displays grayscale when idle and regains natural brightness when hovered/focused',()=>{
 assert.ok(css.includes('filter:grayscale(.75) saturate(.62) brightness(.97)'));
 assert.ok(css.includes('.portal-person:hover .avatar img'));
 assert.ok(css.includes('filter:grayscale(0) saturate(1.02) brightness(1.07)'));
 assert.ok(css.includes('transition:filter .48s ease'));
 assert.ok(css.includes('@media(hover:none), (pointer:coarse)'));
 assert.ok(css.includes('filter:grayscale(.2) saturate(.87) brightness(1)'),'no excessively gray photo on iPhone');
 assert.ok(css.includes('.portal-person:focus-visible .avatar img'));
 assert.ok(css.includes('@media(prefers-reduced-motion:reduce)'));
 assert.ok(css.includes('border-radius:50%!important'),'avatar is circular, not an arched photograph');
});
test('Four-season selector is persisted without changing a learner record or PIN',()=>{
 for(const season of ['spring','summer','autumn','winter']){
  assert.ok(css.includes('horizon-fuji-'+season+'.svg'),season+' background referenced');
  const bg=read('assets/horizon-fuji-'+season+'.svg');
  assert.ok(bg.startsWith('<svg')&&bg.includes('</svg>'),'valid svg '+season);
  assert.ok(bg.includes('viewBox="0 0 1600 900"'),'all themes share backdrop geometry');
  assert.ok(!bg.includes('Quang Huy')&&!bg.includes('HORIZON'),'background artwork must not bake in UI');
  assert.ok(css.includes('horizon-motif-'+season+'.svg'),'seasonal card detail');
  assert.ok(read('assets/horizon-motif-'+season+'.svg').includes('<svg'));
 }
 assert.ok(css.includes('horizon-waves.svg'));
 assert.ok(login.includes("localStorage.setItem('np-home-season-v1',picker.value)"));
 assert.ok(login.includes("home.dataset.season=preferredSeason()"));
 assert.ok(login.includes("if(!picker||!seasons.includes(picker.value))return"));
 assert.ok(login.includes('seasonLabels[Locale.code]'),'season selector localizes to VI EN JA');
 assert.ok(css.includes('-webkit-backdrop-filter:none!important'),'avoid translucent mobile controls');
});
test('Goal and focus stay dynamic and readable rather than frozen in the welcome UI',()=>{
 assert.ok(login.includes("String(person.studyFocus||person.purpose||'').trim()"));
 assert.ok(login.includes("String(person.goal||'').trim()"));
 assert.ok(login.includes('esc(currentFocus(p))'));
 assert.ok(login.includes('esc(currentStage(p))'));
 assert.ok(!login.includes('Ôn kỳ thi tháng 12'),'do not freeze a specific exam date into Home');
 assert.ok(login.includes("tr('Hôm nay,','Today,','今日は、')"));
 assert.ok(login.includes('ai sẽ tiếp tục hành trình?'));
 assert.ok(css.includes('grid-template-columns:repeat(4,minmax(0,1fr))'),'desktop four portraits');
 assert.ok(css.includes('grid-template-columns:repeat(2,minmax(0,1fr))'),'phone 2x2 portraits');
 assert.ok(css.includes('overflow:visible'),'page can scroll');
});
