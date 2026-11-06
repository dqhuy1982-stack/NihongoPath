import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';

const root=new URL('../source/public/',import.meta.url);
const read=name=>readFileSync(new URL(name,root),'utf8');
const html=read('index.html');
const ui=read('login-ui.js');
const pin=read('family-pin-ui.js');
const pinCss=read('home-pin.css');
const css=read('home-v9.css');
const photos=read('family-portraits.js');

test('V9 is activated only for the static family landing, after V8 CSS',()=>{
  assert.ok(html.includes('href="home-v9.css?v=9.2"'));
  assert.ok(html.indexOf('href="home-v9.css?v=9.2"')>html.indexOf('href="home-v8.css"'));
  assert.ok(ui.includes("if(!window.NP_FAMILY_SYNC){"));
  assert.ok(ui.includes("home.classList.add('home-v9')"));
  assert.ok(css.includes('.home-v9.home-v8.home-v7.home-v4.home-v3.home-v2'));
});

test('Desktop Fuji summit is drawn inside its viewBox without browser blur',()=>{
  const art=read('assets/horizon-v9-fuji-desktop.svg');
  assert.ok(art.startsWith('<svg'));
  assert.ok(art.includes('viewBox="0 0 1600 420"'));
  assert.ok(art.includes('L1284 54'));
  assert.ok(!art.includes('feGaussianBlur'));
  assert.ok(!art.includes('<filter'));
  assert.ok(css.includes('horizon-v9-fuji-desktop.svg'));
  assert.ok(css.includes('top:68px!important'));
  assert.ok(css.includes('background:url(\'assets/horizon-v9-fuji-desktop.svg\') center top / cover no-repeat!important'));
});

test('Mobile Fuji is a real flow element: portrait rows cannot cover its summit',()=>{
  const art=read('assets/horizon-v9-fuji-mobile.svg');
  assert.ok(art.startsWith('<svg'));
  assert.ok(art.includes('viewBox="0 0 430 192"'));
  assert.ok(art.includes('L222 12'));
  assert.ok(!art.includes('feGaussianBlur'));
  assert.ok(ui.includes("scenic.className='home-v9-landscape'"));
  assert.ok(ui.includes("home.querySelector('.atelier-main')?.prepend(scenic)"));
  assert.ok(css.includes('.home-v9 .home-v9-landscape'));
  assert.ok(css.includes('horizon-v9-fuji-mobile.svg'));
  assert.ok(css.includes('display:none!important;content:none!important'));
  assert.ok(css.includes('overflow-y:visible!important'));
  assert.ok(css.includes('env(safe-area-inset-bottom)'));
});

test('Original portraits and PIN functionality are preserved',()=>{
  for(const id of ['demo-a','demo-b','demo-c','demo-d']){
    const name='assets/family/'+id+'.webp';
    assert.ok(photos.includes(name));
    assert.ok(existsSync(new URL(name,root)));
    const bytes=readFileSync(new URL(name,root));
    assert.equal(bytes.toString('ascii',0,4),'RIFF');
    assert.equal(bytes.toString('ascii',8,12),'WEBP');
  }
  assert.ok(css.includes('background-image:none!important'));
  assert.ok(css.includes('opacity:1!important'));
  assert.ok(css.includes('filter:saturate(.68) sepia(.10) contrast(1.035) brightness(1.015)!important'));
  assert.ok(ui.includes('window.NPFamilyAccess.open(p.id,button)'));
  assert.ok(ui.includes('window.NPFamilyAccess.enterGuest()'));
  assert.ok(!ui.includes("startButton.dataset.action='home-start'"));
  assert.ok(pin.includes('window.NPFamilyAccess.createPin(id,value)'));
  assert.ok(pin.includes('window.NPFamilyAccess.unlock(id,value)'));
});

test('PIN uses the same Sunmark as Header/Hero and keeps dynamic resizing',()=>{
  assert.ok(ui.includes('assets/horizon-v7-sunmark.svg'));
  assert.ok(pin.includes('assets/horizon-v7-sunmark.svg?v=9'));
  assert.ok(pin.includes('np-pin-tagline'));
  assert.ok(css.includes('.np-pin-brand img'));
  assert.ok(css.includes('.np-pin-identity::before'));
  assert.ok(css.includes('body.dark .np-pin-brand img'));
  assert.ok(pinCss.includes('.np-pin-settled.np-pin-scrollable .np-pin-window'));
  assert.ok(pin.includes('panel.scrollHeight>panel.clientHeight+2'));
  assert.ok(pin.includes("renderStage(window.NPFamilyAccess.hasPin(id)?'unlock':'create')"));
  assert.ok(pin.includes('event.propertyName===\'height\''));
});

test('Desktop, tablet, mobile and short-Safari responsive behavior',()=>{
  assert.ok(css.includes('grid-template-columns:repeat(4,minmax(0,1fr))!important'));
  assert.ok(css.includes('@media(min-width:601px) and (max-width:850px)'));
  assert.ok(css.includes('grid-template-columns:repeat(2,minmax(0,1fr))!important'));
  assert.ok(css.includes('@media(max-width:600px)'));
  assert.ok(css.includes('grid-template-columns:62px minmax(0,1fr) 16px!important'));
  assert.ok(css.includes('grid-template-rows:repeat(4,max-content)!important'));
  assert.ok(css.includes('@media(max-width:600px) and (max-height:740px)'));
  assert.ok(css.includes('@media(max-width:310px)'));
  assert.ok(css.includes('@media(prefers-reduced-motion:reduce)'));
  assert.ok(css.includes('body.dark .home-v9'));
  assert.ok(css.includes('focus-visible'));
});

test('Season and language controls remain operational and accessible',()=>{
  assert.ok(ui.includes("localStorage.setItem('np-home-season-v1',selected)"));
  assert.ok(ui.includes('seasonMenu.append(seasonSummary,seasonControl)'));
  assert.ok(ui.includes('aria-pressed'));
  for(const season of ['spring','summer','autumn','winter'])assert.ok(css.includes('data-season="'+season+'"'));
  for(const language of ['vi','en','ja'])assert.ok(read('locales.js').includes(language));
});

test('Laptop entry uses height-aware composition rather than a fake hidden overflow',()=>{
  assert.ok(css.includes('@media (min-width:851px) and (max-height:930px)'));
  assert.ok(css.includes('@media (min-width:851px) and (max-height:740px)'));
  assert.ok(css.includes('@media (min-width:851px) and (max-height:575px)'));
  assert.ok(css.includes('justify-content:center!important'), 'short laptop page has centered composition');
  assert.ok(css.includes('width:clamp(106px,16svh,132px)!important'));
  assert.ok(css.includes('height:clamp(106px,16svh,132px)!important'));
  assert.ok(css.includes('margin:clamp(10px,1.8svh,16px) auto 0!important'));
  assert.ok(css.includes('justify-content:flex-start!important'), 'ultra-short screens may naturally scroll');
  assert.ok(!css.includes('overflow-y:hidden!important'), 'do not conceal learner or Guest content');
  assert.ok(html.includes('href="home-v9.css?v=9.2"'), 'Safari and Chrome load fresh refinements');
});
