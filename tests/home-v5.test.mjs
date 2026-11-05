import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const root=new URL('../source/public/',import.meta.url);
const read=name=>readFileSync(new URL(name,root),'utf8');
const html=read('index.html'),css=read('home-v5.css'),login=read('login-ui.js');

test('Home V5 additive layer is last, leaving V4 implementation and PIN entry intact',()=>{
  assert.ok(html.includes('href="home-v5.css"'));
  assert.ok(html.indexOf('href="home-v5.css"')>html.indexOf('href="home-v4.css"'));
  assert.ok(login.includes("home.classList.add('home-v4')"));
  assert.ok(login.includes('window.NPFamilyAccess.open(p.id,button)'));
  assert.ok(login.includes('window.NPFamilyAccess.enterGuest()'));
});
test('Profile cards share one desktop geometry, with first and adjacent cards normalized',()=>{
  assert.ok(css.includes('.portal-person + .portal-person'));
  assert.ok(css.includes('grid-template-rows:143px 41px 16px 29px minmax(39px,1fr)!important'));
  assert.ok(css.includes('height:323px!important'));
  assert.ok(css.includes('min-height:323px!important'));
  assert.ok(css.includes('margin:0!important'));
  assert.ok(css.includes('grid-row:2!important'));
  assert.ok(css.includes('grid-row:3!important'));
  assert.ok(css.includes('grid-row:4!important'));
  assert.ok(css.includes('grid-row:5!important'));
  assert.ok(css.includes('align-items:stretch!important'));
  assert.ok(css.includes('grid-auto-rows:minmax(0,1fr)'));
});
test('Home V5 adapts to laptop, tablet, phone and retains focus/dark/reduced-motion',()=>{
  assert.ok(css.includes('@media(min-width:851px) and (max-height:790px)'));
  assert.ok(css.includes('@media(max-width:850px)'));
  assert.ok(css.includes('@media(max-width:430px)'));
  assert.ok(css.includes('grid-template-columns:repeat(4,minmax(0,1fr))'));
  assert.ok(css.includes('grid-template-columns:repeat(2,minmax(0,1fr))'));
  assert.ok(css.includes('.portal-person:focus-visible'));
  assert.ok(css.includes('body.dark .home-v4'));
  assert.ok(css.includes('@media(prefers-reduced-motion:reduce)'));
});
