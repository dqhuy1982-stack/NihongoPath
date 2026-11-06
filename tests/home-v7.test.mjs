import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const root=new URL('../source/public/',import.meta.url);
const read=name=>readFileSync(new URL(name,root),'utf8');
const html=read('index.html'),ui=read('login-ui.js'),css=read('home-v7.css');
test('V7 is last Home-only cascade layer and preserves original Home frameworks',()=>{
 assert.ok(html.includes('href="home-v7.css"'));
 assert.ok(html.indexOf('href="home-v7.css"')>html.indexOf('href="home-v6-mobile.css"'));
 assert.ok(ui.includes("home.classList.add('home-v7','home-v8')"));
 assert.ok(css.includes('.home-v7.home-v4.home-v3.home-v2.atelier-home'));
 assert.ok(!css.includes('position:fixed'));
});
test('V7 illustration uses one valid WebP sprite without replacing original profile assets',()=>{
 const img=new URL('assets/horizon-family-illustrated.webp',root);
 assert.ok(existsSync(img));
 const bytes=readFileSync(img);
 assert.equal(bytes.toString('ascii',0,4),'RIFF');
 assert.equal(bytes.toString('ascii',8,12),'WEBP');
 assert.ok(bytes.length>2500);
 assert.ok(css.includes('horizon-family-illustrated.webp'));
 assert.ok(css.includes('background-size:200% 200%'));
 for(let i=1;i<=4;i++)assert.ok(css.includes('portal-person:nth-child('+i+') .avatar'));
 assert.ok(ui.includes('data-action="loginprofile"'));
 assert.ok(ui.includes('window.NPFamilyAccess.open(p.id,button)'));
 assert.ok(ui.includes('window.NPFamilyAccess.enterGuest()'));
 const portraits=read('family-portraits.js');
 for(let i=0;i<4;i++)assert.ok(portraits.includes('assets/family/demo-'+String.fromCharCode(97+i)+'.webp'));
});
test('V7 responsive composition: desktop 4 portraits, mobile 4 rows, no hidden page scrolling',()=>{
 assert.ok(css.includes('grid-template-columns:repeat(4,minmax(0,1fr))!important'));
 assert.ok(css.includes('@media(max-width:600px)'));
 assert.ok(css.includes('grid-template-columns:minmax(0,1fr)!important'));
 assert.ok(css.includes('grid-template-rows:repeat(4,max-content)!important'));
 assert.ok(css.includes('overflow-y:visible!important'));
 assert.ok(css.includes('env(safe-area-inset-bottom)'));
 assert.ok(css.includes('@media(max-width:600px) and (max-height:740px)'));
 assert.ok(css.includes('@media(prefers-reduced-motion:reduce)'));
 assert.ok(css.includes('body.dark'));
});
test('Season menu remains accessible; direct learner selection replaces duplicate V7 CTA',()=>{
 assert.ok(ui.includes("seasonMenu.className='home-v7-seasons'"));
 assert.ok(ui.includes('seasonMenu.append(seasonSummary,seasonControl)'));
 assert.ok(ui.includes("localStorage.setItem('np-home-season-v1',selected)"));
 assert.ok(!ui.includes("startButton.dataset.action='home-start'"));
 assert.ok(!ui.includes("if(button.dataset.action==='home-start')"));
 assert.ok(ui.includes('data-action="loginprofile"'));
 assert.ok(ui.includes('window.NPFamilyAccess.open(p.id,button)'));
 assert.ok(css.includes('.portal-guest-row'));
 assert.ok(css.includes(':focus-visible'));
});
test('V7 brand assets are original presentation-only SVGs with no text baked into landscape',()=>{
 for(const name of ['horizon-v7-sunmark.svg','horizon-v7-landscape.svg','horizon-v7-mobile.svg']){
  assert.ok(read('assets/'+name).startsWith('<svg'));
 }
 for(const name of ['horizon-v7-landscape.svg','horizon-v7-mobile.svg']){
  assert.ok(!read('assets/'+name).includes('<filter'));
  assert.ok(!read('assets/'+name).includes('Quang Huy'));
 }
});
