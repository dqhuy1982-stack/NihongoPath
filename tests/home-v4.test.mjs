import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const root=new URL('../source/public/',import.meta.url);
const read=path=>readFileSync(new URL(path,root),'utf8');
const page=read('index.html'),login=read('login-ui.js'),css=read('home-v4.css');
const pin=read('family-pin-ui.js'),pinCss=read('home-pin.css'),app=read('app.js');

test('Home V4 stays scoped to the static family landing and is the final styling layer',()=>{
 assert.ok(login.includes("if(!window.NP_FAMILY_SYNC){"));
 assert.ok(login.includes("home.classList.add('home-v4')"));
 assert.ok(page.includes('href="home-v4.css"'));
 assert.ok(page.indexOf('href="home-v4.css"')>page.indexOf('href="home-v3.css"'));
 assert.ok(!css.includes('position:fixed'),'Home scrolls naturally');
 assert.ok(login.includes('window.NPFamilyAccess.open(p.id,button)'),'same PIN flow');
 assert.ok(login.includes('window.NPFamilyAccess.enterGuest()'),'Guest entry unchanged');
 assert.ok(pin.includes('np-pin-window'));
 assert.ok(app.includes("profiles:db.profiles.filter(p=>p.id!=='guest')"));
});
test('Four seasonal choices are direct icon buttons with explicit active state',()=>{
 const seasons=['spring','summer','autumn','winter'];
 assert.ok(login.includes('seasonArtwork=['),'four original inline SVG marks');
 assert.ok(login.includes('class="home-season-button"'));
 assert.ok(login.includes('data-season-choice="${season}"'));
 assert.ok(login.includes('aria-pressed="${season===home.dataset.season}"'));
 assert.ok(login.includes("button.dataset.seasonChoice"));
 assert.ok(login.includes("item.setAttribute('aria-pressed'"));
 assert.ok(login.includes("localStorage.setItem('np-home-season-v1',selected)"));
 assert.ok(login.includes('home.dataset.season=preferredSeason()'));
 assert.ok(!login.includes('home-season-select'),'old native dropdown removed');
 assert.ok(css.includes('.home-season-button:focus-visible'));
 assert.ok(css.includes('.home-season-button[aria-pressed="true"]'));
 assert.ok(login.includes('seasonLabels[Locale.code]'),'localized accessible titles');
 for(const season of seasons){
  assert.ok(css.includes('horizon-fuji-'+season+'.svg'));
  const artwork=read('assets/horizon-fuji-'+season+'.svg');
  assert.ok(artwork.startsWith('<svg'));
  assert.ok(artwork.includes('viewBox="0 0 1600 900"'));
  assert.ok(!artwork.includes('Quang Huy')&&!artwork.includes('HORIZON'),
    'decorative artwork must not bake in text or portraits');
  assert.ok(css.includes('horizon-motif-'+season+'.svg'));
 }
 assert.ok(css.includes('horizon-waves.svg'));
 assert.ok(css.includes('-webkit-backdrop-filter:none!important'),'controls remain crisp on Safari');
 assert.ok(css.includes('@media(max-width:430px)'),'mobile theme controls have own row');
});
test('Profile gallery uses consistent card heights and row tracks on desktop and iPhone',()=>{
 assert.ok(css.includes('align-items:stretch!important'),'override legacy align-items:start');
 assert.ok(css.includes('grid-auto-rows:minmax(0,1fr)'));
 assert.ok(css.includes('grid-template-columns:repeat(4,minmax(0,1fr))'));
 assert.ok(css.includes('grid-template-columns:repeat(2,minmax(0,1fr))'));
 assert.ok(css.includes('height:310px;min-height:310px'));
 assert.ok(css.includes('height:254px;min-height:254px'));
 assert.ok(css.includes('height:232px;min-height:232px'));
 assert.ok(css.includes('grid-template-rows:142px 37px 14px 27px minmax(36px,1fr)'));
 assert.ok(css.includes('.portal-person .family-name'));
 assert.ok(css.includes('grid-row:2'));
 assert.ok(css.includes('grid-row:4'));
 assert.ok(css.includes('grid-row:5'));
 assert.ok(!login.includes('home-season-emblem" lang="ja"'),'season kanji removed from HTML');
 assert.ok(css.includes('.portal-person .home-season-emblem{'));
 assert.ok(css.includes('display:none!important;'),'old badge hidden as fallback');
 assert.ok(css.includes('border-radius:50%!important'),'true circular portraits');
});
test('Image pixels stay untouched, desktop portraits subtly reveal color on hover',()=>{
 assert.ok(css.includes('filter:grayscale(.72) saturate(.65) brightness(.98)'));
 assert.ok(css.includes('filter:grayscale(0) saturate(1.02) brightness(1.06)'));
 assert.ok(css.includes('transition:filter .42s ease'));
 assert.ok(css.includes('@media(hover:none), (pointer:coarse)'));
 assert.ok(css.includes('filter:grayscale(.18) saturate(.9) brightness(1)'));
 assert.ok(css.includes('.portal-person:focus-visible'));
 assert.ok(css.includes('@media(prefers-reduced-motion:reduce)'));
});
test('Refined PIN dialog retains original authentication, input rules and scroll guard',()=>{
 assert.ok(pin.includes('class="np-pin-brand"'),'PIN panel displays HORIZON identity');
 assert.ok(pin.includes('assets/horizon-v7-sunmark.svg?v=9'));
 assert.ok(pinCss.includes('.np-pin-window::before'));
 assert.ok(pinCss.includes('.np-pin-window::after'));
 assert.ok(pinCss.includes('.np-pin-brand span'));
 assert.ok(pinCss.includes('border:1px solid #c7b38d'));
 assert.ok(pinCss.includes('.np-pin-settled.np-pin-scrollable .np-pin-window'));
 assert.ok(pinCss.includes('.np-pin-visible .np-pin-window'));
 assert.ok(pinCss.includes('overflow:hidden'));
 assert.ok(pin.includes("renderStage(window.NPFamilyAccess.hasPin(id)?'unlock':'create')"));
 assert.ok(pin.includes("renderStage('confirm')"));
 assert.ok(pin.includes('/^\\d{4,6}$/.test(value)'),'PIN remains 4–6 digits, not 4 only');
 assert.ok(pin.includes("window.NPFamilyAccess.unlock(id,value)"));
 assert.ok(pin.includes("window.NPFamilyAccess.createPin(id,value)"));
 assert.ok(pin.includes("window.NPFamilyAccess.resetPin(id)"));
 assert.ok(pin.includes("event.key==='Escape'"));
});
test('Current learning stage and focus stay dynamic and translatable',()=>{
 assert.ok(login.includes("String(person.studyFocus||person.purpose||'').trim()"));
 assert.ok(login.includes("String(person.goal||'').trim()"));
 assert.ok(login.includes('esc(currentFocus(p))'));
 assert.ok(login.includes('esc(currentStage(p))'));
 assert.ok(!login.includes('Ôn kỳ thi tháng 12'));
 assert.ok(login.includes('ai sẽ tiếp tục hành trình?'));
});
