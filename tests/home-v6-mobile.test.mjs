import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const root=new URL('../source/public/',import.meta.url);
const read=name=>readFileSync(new URL(name,root),'utf8');
const html=read('index.html');
const mobile=read('home-v6-mobile.css');
const desktop=read('home-v5.css');
const login=read('login-ui.js');
const pin=read('family-pin-ui.js');

test('mobile-only V6 layer is loaded after the proven desktop design',()=>{
  assert.ok(html.includes('href="home-v6-mobile.css"'));
  assert.ok(html.indexOf('href="home-v6-mobile.css"')>html.indexOf('href="home-v5.css"'));
  assert.ok(mobile.includes('@media(max-width:600px)'));
  assert.ok(desktop.includes('height:323px!important'), 'desktop remains V5');
  assert.ok(mobile.includes('background:var(--horizon-mobile-scene)'));
});

test('all four season scenes are vector sharp and carry no baked interactive UI',()=>{
  for(const season of ['spring','summer','autumn','winter']){
    const svg=read('assets/horizon-mobile-'+season+'.svg');
    assert.match(svg,/^<svg\b/);
    assert.ok(svg.includes('viewBox="0 0 390 844"'));
    assert.ok(svg.includes('preserveAspectRatio="xMidYMid slice"'));
    assert.ok(!svg.includes('feGaussianBlur')&&!svg.includes('<filter'));
    assert.ok(!svg.includes('Quang Huy')&&!svg.includes('HORIZON'));
    assert.ok(mobile.includes('horizon-mobile-'+season+'.svg'));
  }
  assert.ok(login.includes('localStorage.setItem(\'np-home-season-v1\',selected)'));
  assert.ok(login.includes('aria-pressed'));
});

test('four mobile profiles remain clickable with circular avatars and names only',()=>{
  for(const key of ['.portal-person .family-photo','.portal-person .family-name','.home-learner-rule','.portal-person-goal','.home-learner-focus']){
    assert.ok(mobile.includes(key),key);
  }
  assert.ok(mobile.includes('grid-template-columns:repeat(2,minmax(0,1fr))!important'));
  assert.ok(mobile.includes('border:0!important;border-radius:16px!important'));
  assert.ok(mobile.includes('border-radius:50%!important'));
  assert.ok(mobile.includes('display:none!important'));
  assert.ok(mobile.includes('height:auto!important;min-height:calc(var(--horizon-portrait-size) + 36px)!important'));
  assert.ok(login.includes('data-action="loginprofile"'));
  assert.ok(login.includes('window.NPFamilyAccess.open(p.id,button)'));
  assert.ok(pin.includes('window.NPFamilyAccess.createPin(id,value)'));
  assert.ok(pin.includes('window.NPFamilyAccess.unlock(id,value)'));
});

test('short Safari viewports show guest while zoom/landscape can scroll rather than clip',()=>{
  assert.ok(mobile.includes('min-height:100svh!important'));
  assert.ok(mobile.includes('overflow-y:visible!important'));
  assert.ok(mobile.includes('env(safe-area-inset-bottom)'));
  assert.ok(mobile.includes('@media(max-width:600px) and (max-height:740px)'));
  assert.ok(mobile.includes('@media(max-width:310px)'));
  assert.ok(mobile.includes('grid-template-columns:1fr!important'));
  assert.ok(mobile.includes('@media(max-width:850px) and (orientation:landscape)'));
  assert.ok(mobile.includes('.portal-guest-row'));
  assert.ok(login.includes('window.NPFamilyAccess.enterGuest()'));
});

test('Home V6 retains keyboard, locale, dark mode and reduced motion',()=>{
  assert.ok(mobile.includes(':focus-visible'));
  assert.ok(mobile.includes('body.dark'));
  assert.ok(mobile.includes('backdrop-filter:none!important'));
  assert.ok(mobile.includes('@media(prefers-reduced-motion:reduce)'));
  for(const name of ['VI','EN','日本語'])assert.ok(read('locales.js').includes(name));
});

test('Safari header is opaque, contrast-rich and has no soft-focus SVG strokes',()=>{
  assert.ok(mobile.includes('background:#fffdfa!important'));
  assert.ok(mobile.includes('stroke-width:1.95!important'));
  assert.ok(mobile.includes('box-shadow:none!important'));
  assert.ok(mobile.includes('filter:none!important;opacity:1!important'));
  assert.ok(mobile.includes('font-size:11px!important'));
  assert.ok(mobile.includes('justify-content:flex-start!important'));
  assert.ok(mobile.includes('.home-v3-welcome::after'));
  assert.ok(mobile.includes('border:1px solid #9db5a2!important'));
  for(const season of ['spring','summer','autumn','winter']){
    const svg=read('assets/horizon-mobile-'+season+'.svg');
    assert.ok(svg.includes('M251 255 346 148 439 255'));
    assert.ok(!svg.includes('<filter')&&!svg.includes('feGaussianBlur'));
  }
});
