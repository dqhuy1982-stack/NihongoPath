import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';

const root=new URL('../source/public/',import.meta.url);
const read=name=>readFileSync(new URL(name,root),'utf8');
const html=read('index.html'),js=read('login-ui.js'),pin=read('family-pin-ui.js'),css=read('home-v10.css');

test('V10 CSS last, scripts cache-busted and static family demo only',()=>{
 assert.ok(html.includes('href="home-v10.css?v=10"'));
 assert.ok(html.indexOf('home-v10.css?v=10')>html.indexOf('home-v9.css?v=9.2'));
 assert.ok(html.includes('src="login-ui.js?v=10"'));
 assert.ok(html.includes('src="family-pin-ui.js?v=11"'));
 assert.ok(js.includes("home.classList.add('home-v9','home-v10')"));
 assert.ok(js.includes('if(!window.NP_FAMILY_SYNC)'));
});

test('Every season mark preserves common HORIZON geometry but differs meaningfully',()=>{
 const names=['spring','summer','autumn','winter'];
 const svgs=names.map(name=>{
  const file='assets/horizon-mark-'+name+'.svg';
  assert.ok(existsSync(new URL(file,root)));
  const s=read(file);
  assert.ok(s.includes('viewBox="0 0 140 66"'));
  assert.ok(s.includes('M9 51C30 34 48 36 69 44S111 46 131 54'));
  assert.ok(!s.includes('feGaussianBlur'));
  return s;
 });
 assert.equal(new Set(svgs).size,4);
 assert.ok(svgs[0].includes('fill="#dfa9af"'),'sakura');
 assert.ok(svgs[1].includes('M70 7v5'),'summer rays');
 assert.ok(svgs[2].includes('translate(109 39)'),'maple');
 assert.ok(svgs[3].includes('stroke="#fdfefe"'),'winter snow');
});

test('Active theme changes both Home logos and the next PIN logo',()=>{
 assert.ok(js.includes('const seasonMarkSrc=season=>'));
 assert.ok(js.includes("querySelectorAll('[data-season-mark]')"));
 assert.ok(js.includes('data-season-mark src='));
 assert.ok(js.includes('updateSeasonMarks(home,selected)'));
 assert.ok(js.includes("localStorage.setItem('np-home-season-v1',selected)"));
 assert.ok(pin.includes('function seasonMarkForPin()'));
 assert.ok(pin.includes("localStorage.getItem('np-home-season-v1')"));
 assert.ok(pin.includes('seasonMarkForPin()'));
 assert.ok(css.includes('content:normal!important'));
 assert.ok(js.includes('window.NPFamilyAccess.open(p.id,button)'));
 assert.ok(js.includes('window.NPFamilyAccess.enterGuest()'));
});

test('Seasonal palette and dark scenery remain distinct and legible',()=>{
 for(const season of ['spring','summer','autumn','winter']){
   assert.ok(css.includes('[data-season="'+season+'"]'));
 }
 for(const hue of ['#f4d5d4','#d6eac8','#f2d5b6','#d5e7f1'])assert.ok(css.includes(hue));
 assert.ok(css.includes('--h10-scenery-filter'));
 assert.ok(css.includes('.portal-person .portal-person-goal'));
 assert.ok(css.includes('body.dark .home-v10.home-v9.home-v8.home-v7.home-v4.home-v3.home-v2.atelier-home::before'));
 assert.ok(css.includes('opacity:.13!important'));
});

test('One-time localized control tip is dismissible without layout shifts',()=>{
 assert.ok(js.includes("const tipKey='np-home-controls-tip-v1'"));
 assert.ok(js.includes('data-home-tip-dismiss'));
 assert.ok(js.includes("getItem(tipKey)!=='dismissed'"));
 assert.ok(js.includes('dismissControlTip(home)'));
 assert.ok(js.includes("dismissControlTip(document.querySelector('.home-v10'))"));
 assert.ok(js.includes("localStorage.setItem(tipKey,'dismissed')"));
 assert.ok(js.includes('季節と言語を切り替えてみましょう'));
 assert.ok(css.includes('position:absolute;z-index:40'));
 assert.ok(css.includes('max-width:min(263px,calc(100vw - 25px))'));
 assert.ok(css.includes('body.dark .home-v10 .home-controls-tip'));
 assert.ok(css.includes('focus-visible'));
 assert.ok(!css.includes('overflow-y:hidden!important'));
 assert.ok(css.includes('@media(prefers-reduced-motion:reduce)'));
});
