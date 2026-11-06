import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {inflateSync} from 'node:zlib';
const root=new URL('../source/public/',import.meta.url);
const read=name=>readFileSync(new URL(name,root),'utf8');
const css=read('home-v11.css'),pin=read('family-pin-ui.js'),html=read('index.html');
const manifest=JSON.parse(read('manifest.webmanifest'));
const app=read('app.js'),brand=read('horizon-brand.css');

test('V11 PIN layer remains ahead of V12 seasonal shell; PIN data contracts unchanged',()=>{
 assert.ok(html.includes('href="home-v11.css?v=11"'));
 assert.ok(html.indexOf('href="season-shell.css?v=12"')>html.indexOf('href="home-v11.css?v=11"'));
 assert.ok(html.indexOf('home-v11.css?v=11')>html.indexOf('home-v10.css?v=10'));
 assert.ok(html.includes('src="family-pin-ui.js?v=13"'));
 assert.ok(pin.includes('window.NPFamilyAccess.createPin(id,value)'));
 assert.ok(pin.includes('window.NPFamilyAccess.unlock(id,value)'));
 assert.ok(pin.includes('window.NPFamilyAccess.resetPin(id)'));
 assert.ok(pin.includes('if(!window.NP_STATIC_PUBLISH||window.NP_FAMILY_SYNC)return false'));
 assert.ok(app.includes('data-season-mark src='));
 assert.ok(brand.includes('horizon-v7-sunmark.svg?v=11'));
});

test('Seasonal dark themes override historic uniform green panels, buttons and inactive locales',()=>{
 for(const name of ['summer','autumn','winter'])
   assert.ok(css.includes('body.dark .home-v10.home-v9.home-v8.home-v7.home-v4.home-v3.home-v2.atelier-home[data-season="'+name+'"]'));
 for(const token of ['--v11-panel','--v11-border','--v11-muted','--v11-active','--v11-active-ink'])
   assert.ok(css.includes(token),token);
 assert.ok(css.includes('background:var(--v11-panel)!important'));
 assert.ok(css.includes('border:1px solid var(--v11-border)!important'));
 assert.ok(css.includes('.language-switch button:not([aria-pressed="true"])'));
 assert.ok(css.includes('color:var(--v11-muted)!important'));
 assert.ok(css.includes('.language-switch button[aria-pressed="true"]'));
 assert.ok(css.includes('background:var(--v11-active)!important'));
 assert.ok(css.includes('.portal-person .family-name'));
 assert.ok(css.includes('.portal-person .portal-person-goal'));
});

test('PIN opening does not auto-open keyboard on touch; visual viewport can fit and scroll only if needed',()=>{
 assert.ok(pin.includes('current.expanded&&document.activeElement?.closest?.('));
 assert.ok(!pin.includes("current.expanded||touchLike()"));
 assert.ok(pin.includes('window.visualViewport?.addEventListener(\'resize\',onResize)'));
 assert.ok(pin.includes('window.visualViewport?.addEventListener(\'scroll\',onResize)'));
 assert.ok(pin.includes('window.visualViewport?.removeEventListener(\'scroll\',onResize)'));
 assert.ok(pin.includes('np-pin-keyboard'));
 assert.ok(pin.includes('visibleHeight<window.innerHeight-140'));
 assert.ok(pin.includes('panel.scrollHeight>panel.clientHeight+2'));
 assert.ok(pin.includes('np-pin-scrollable'));
 assert.ok(css.includes('np-pin-overlay.np-pin-keyboard'));
 assert.ok(css.includes('.np-pin-brand'));
 assert.ok(css.includes('.np-pin-photo .avatar'));
 assert.ok(css.includes('.np-pin-submit'));
 assert.ok(css.includes('min-height:43px!important'));
 assert.ok(!css.includes('overflow-y:hidden!important'));
 assert.ok(read('home-pin.css').includes('.np-pin-settled.np-pin-scrollable .np-pin-window'));
});

test('PIN captures active season, overlays seasonal dark palette, and uses actual seasonal mark',()=>{
 assert.ok(pin.includes('overlay.dataset.season=activeSeasonForPin()'));
 assert.ok(pin.includes('return match?.[1]||\'spring\''));
 for(const name of ['summer','autumn','winter']){
  assert.ok(css.includes('.np-pin-overlay[data-season="'+name+'"]'));
  assert.ok(css.includes('body.dark .np-pin-overlay[data-season="'+name+'"]'));
 }
 assert.ok(css.includes('content:normal!important'));
 assert.ok(css.includes('.np-pin-window'));
 assert.ok(css.includes('background:linear-gradient(145deg,var(--pin-paper),var(--pin-paper-bottom))!important'));
 assert.ok(css.includes('color:var(--pin-ink)!important'));
});

test('Favicon and app installation icons share new sunrise brand instead of old H glyph',()=>{
 assert.ok(html.includes('href="assets/horizon-app.svg?v=11"'));
 assert.ok(html.includes('href="assets/horizon-icon-180.png?v=11"'));
 assert.ok(html.includes('href="manifest.webmanifest?v=11"'));
 assert.equal(manifest.id,'./');
 assert.equal(manifest.start_url,'./#login');
 assert.equal(manifest.scope,'./');
 assert.deepEqual(manifest.icons.map(x=>x.src),[
   'assets/horizon-app.svg?v=11',
   'assets/horizon-icon-192.png?v=11',
   'assets/horizon-icon-512.png?v=11'
 ]);
 const svg=read('assets/horizon-app.svg');
 assert.ok(svg.includes('M69 102a27 27'),'sunrise must be present');
 assert.ok(svg.includes('M25 130c29-24'),'horizon line must be present');
 assert.ok(!svg.includes('M40 14 C31.5'),'old H must not appear');
 const magic=Buffer.from([137,80,78,71,13,10,26,10]);
 for(const size of [180,192,512]){
   const a=readFileSync(new URL('assets/horizon-icon-'+size+'.png',root));
   const b=readFileSync(new URL('assets/app-icon-'+size+'.png',root));
   assert.ok(a.subarray(0,8).equals(magic),'PNG header '+size);
   assert.equal(a.readUInt32BE(16),size);
   assert.equal(a.readUInt32BE(20),size);
   assert.equal(a[25],3,'indexed PNG for small file size');
   assert.equal(createHash('sha256').update(a).digest('hex'),
                createHash('sha256').update(b).digest('hex'));
   let at=8,blocks=[];
   while(at<a.length){
     const n=a.readUInt32BE(at),type=a.toString('ascii',at+4,at+8);
     if(type==='IDAT')blocks.push(a.subarray(at+8,at+8+n));
     at+=n+12;
     if(type==='IEND')break;
   }
   const raw=inflateSync(Buffer.concat(blocks));
   assert.equal(raw.length,size*(size+1),'complete scanline bytes '+size);
   assert.equal(raw[0],0,'PNG filter None');
   assert.equal(raw[1],0,'background pixel');
   const sunriseRow=Math.round(size*82/192);
   const sunriseCol=Math.round(size*.5);
   assert.ok(raw[sunriseRow*(size+1)+sunriseCol+1]>0,'sun must be painted '+size);
   const arcRow=Math.round(size*112/192);
   assert.ok(raw[arcRow*(size+1)+sunriseCol+1]>120,'horizon must be painted '+size);
 }
});

test('Mobile layout preserves readable fields and does not hide content',()=>{
 assert.ok(css.includes('@media(max-width:600px)'));
 assert.ok(css.includes('body.dark .np-pin-overlay .np-pin-window'));
 assert.ok(css.includes('body.dark .home-v10.home-v9'));
 assert.ok(css.includes('var(--pin-accent)'));
 assert.ok(read('home-v9.css').includes('overflow-y:visible!important'));
});
