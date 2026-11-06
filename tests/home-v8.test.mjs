import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';

const root=new URL('../source/public/',import.meta.url);
const read=name=>readFileSync(new URL(name,root),'utf8');
const page=read('index.html'),ui=read('login-ui.js'),css=read('home-v8.css');
const family=read('family-portraits.js');

test('V8 overrides previous Home layers without changing account or learning routes',()=>{
  assert.ok(ui.includes("home.classList.add('home-v7','home-v8')"));
  assert.ok(page.includes('href="home-v8.css"'));
  assert.ok(page.indexOf('href="home-v8.css"')>page.indexOf('href="home-v7.css"'));
  assert.ok(css.includes('.home-v8.home-v7.home-v4.home-v3.home-v2'));
  assert.ok(css.includes('min-height:100svh!important'));
  assert.ok(css.includes('overflow-y:visible!important'));
});

test('No redundant choose learner CTA; each portrait still opens its own PIN',()=>{
  assert.ok(!ui.includes("startButton.dataset.action='home-start'"));
  assert.ok(!ui.includes("if(button.dataset.action==='home-start')"));
  assert.ok(ui.includes('data-action="loginprofile"'));
  assert.ok(ui.includes('window.NPFamilyAccess.open(p.id,button)'));
  assert.ok(ui.includes('window.NPFamilyAccess.enterGuest()'));
  assert.ok(css.includes('.home-v7-start{display:none!important}'));
  assert.ok(css.includes('.portal-guest-row'));
});

test('Original family faces restored on Home; stylization is subtle and non-destructive',()=>{
  for(const [id,name] of Object.entries({'demo-a':'Quang Huy','demo-b':'Vy Anh','demo-c':'Nam Khánh','demo-d':'Gia Hưng'})){
    const key='assets/family/'+id+'.webp';
    assert.ok(family.includes(key),name);
    assert.ok(existsSync(new URL(key,root)),name);
    const bytes=readFileSync(new URL(key,root));
    assert.equal(bytes.toString('ascii',0,4),'RIFF',name);
    assert.equal(bytes.toString('ascii',8,12),'WEBP',name);
  }
  assert.ok(css.includes('background-image:none!important'), 'old fictional sprite must not display');
  assert.ok(css.includes('opacity:1!important'), 'original photos must be visible');
  assert.ok(css.includes('filter:saturate(.86) sepia(.045) contrast(1.025)!important'));
  assert.ok(css.includes('mix-blend-mode:normal!important'));
  assert.ok(css.includes('object-fit:cover!important'));
});

test('Responsive portrait geometry: centered desktop row and consistent iPhone list',()=>{
  assert.ok(css.includes('grid-template-columns:repeat(4,minmax(0,1fr))!important'));
  assert.ok(css.includes('@media(min-width:601px) and (max-width:850px)'));
  assert.ok(css.includes('@media(max-width:600px)'));
  assert.ok(css.includes('grid-template-columns:minmax(0,1fr)!important'));
  assert.ok(css.includes('grid-template-rows:repeat(4,max-content)!important'));
  assert.ok(css.includes('grid-template-columns:57px minmax(0,1fr) 15px!important'));
  assert.ok(css.includes('height:69px!important;min-height:69px!important'));
  assert.ok(css.includes('grid-column:2!important;grid-row:1!important'));
  assert.ok(css.includes('grid-column:2!important;grid-row:2!important'));
  assert.ok(css.includes('env(safe-area-inset-bottom)'));
});

test('Safari contrast, zoom and accessibility fallbacks are maintained',()=>{
  assert.ok(css.includes('background:var(--h8-paper)!important'));
  assert.ok(css.includes('background:transparent!important'));
  assert.ok(css.includes('max-height:740px'));
  assert.ok(css.includes('@media(max-width:300px)'));
  assert.ok(css.includes('body.dark'));
  assert.ok(css.includes('@media(prefers-reduced-motion:reduce)'));
  assert.ok(css.includes(':focus-visible'));
  assert.ok(ui.includes("seasonMenu.className='home-v7-seasons'"));
  assert.ok(ui.includes('seasonMenu.append(seasonSummary,seasonControl)'));
  assert.ok(read('locales.js').includes('日本語'));
});

test('Four seasonal themes update actual Home palette without changing profile images',()=>{
  for(const season of ['spring','summer','autumn','winter']){
    assert.ok(css.includes('data-season="'+season+'"'),season);
  }
  assert.ok(css.includes('filter:var(--h8-scene-filter,none)!important'));
  assert.ok(ui.includes('home.dataset.season=selected'));
  assert.ok(ui.includes("localStorage.setItem('np-home-season-v1',selected)"));
});

test('Dark-mode contrast overrides high-specificity light rules across layers',()=>{
  for(const x of [
    'body.dark .home-v8.home-v7.home-v4.home-v3.home-v2 .atelier-story .home-v3-question',
    'body.dark .home-v8.home-v7.home-v4.home-v3.home-v2 .home-v2-intro',
    'body.dark .home-v8.home-v7.home-v4.home-v3.home-v2 .portal-person .family-name',
    'body.dark .home-v8.home-v7.home-v4.home-v3.home-v2 .portal-person .portal-person-goal'
  ])assert.ok(css.includes(x),x);
});
