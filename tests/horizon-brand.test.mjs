import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {inflateSync} from 'node:zlib';

const root=new URL('../source/public/',import.meta.url);
const read=name=>readFileSync(new URL(name,root),'utf8');
const page=read('index.html');
const app=read('app.js');
const ui=read('login-ui.js');
const css=read('horizon-brand.css');
const manifest=JSON.parse(read('manifest.webmanifest'));

test('HORIZON web brand is consistent from Home through the learning shell',()=>{
 assert.match(page,/<title>HORIZON · A little closer\. A world wider\.<\/title>/);
 assert.match(page,/href="assets\/horizon-app\.svg"/);
 assert.match(page,/href="horizon-brand\.css"/);
 assert.ok(page.indexOf('href="horizon-brand.css"')>page.indexOf('href="home-pin.css"'),
   'brand layer should not override PIN dialog/learning behavior');
 assert.ok(app.includes("src=\\"assets/horizon-mark.svg\\""));
 assert.ok(app.includes('horizon-wordmark'));
 assert.ok(app.includes('<strong>HORIZON</strong>'));
 assert.ok(app.includes('HORIZON — Hôm nay'));
 assert.ok(!app.includes('assets/n-mark.svg'),'no old nav icon');
 assert.ok(!app.includes('<strong>Nihongo</strong>'),'no old nav wordmark');
 assert.ok(ui.includes('class="horizon-home-slogan"'));
 assert.ok(ui.includes('A little closer. <em>A world wider.</em>'));
 assert.ok(ui.includes('home.classList.add(\'home-v2\')'));
 assert.ok(ui.includes('window.NPFamilyAccess.open(p.id,button)'),'PIN access unchanged');
 assert.ok(ui.includes('window.NPFamilyAccess.enterGuest()'),'Guest unchanged');
});
test('Minimal vector identity: H pillars, horizon arc and rising dot',()=>{
 for(const name of ['horizon-mark.svg','horizon-mark-light.svg','horizon-app.svg']){
  const svg=read('assets/'+name);
  assert.ok(svg.startsWith('<svg')&&svg.includes('</svg>'),name);
  assert.ok(svg.includes('viewBox='),name);
  assert.ok(svg.includes('circle'),name+' must contain the progress dot');
  assert.ok(svg.includes('path'),name+' must contain the horizon line');
 }
 assert.ok(css.includes('--horizon-ink:#284b3b'));
 assert.ok(css.includes('.home-v2 .atelier-story .horizon-home-slogan'));
 assert.ok(css.includes('.sidebar .brand-symbol.horizon-symbol'));
 assert.ok(css.includes('assets/horizon-mark-light.svg'));
 assert.ok(css.includes('@media(max-width:430px)'));
 assert.ok(css.includes('@media(prefers-reduced-motion:reduce)'));
});
test('iPhone and installable application icons are real readable PNG assets',()=>{
 const signature=Buffer.from([137,80,78,71,13,10,26,10]);
 for(const size of [180,192,512]){
  const path='assets/horizon-icon-'+size+'.png';
  const png=readFileSync(new URL(path,root));
  assert.ok(png.length>1000,path+' should not be empty');
  assert.ok(png.subarray(0,8).equals(signature),path+' PNG signature');
  assert.equal(png.readUInt32BE(16),size,path+' width');
  assert.equal(png.readUInt32BE(20),size,path+' height');
  assert.equal(png[24],8,path+' bits per palette entry');
  assert.equal(png[25],3,path+' indexed PNG');
  let at=8,compressed=[];
  while(at<png.length){
   const len=png.readUInt32BE(at);
   const type=png.toString('ascii',at+4,at+8);
   if(type==='IDAT')compressed.push(png.subarray(at+8,at+8+len));
   at+=len+12;
   if(type==='IEND')break;
  }
  const unpacked=inflateSync(Buffer.concat(compressed));
  assert.equal(unpacked.length,size*(size+1),path+' valid image data');
 }
 assert.ok(page.includes('href="assets/horizon-icon-180.png"'));
 assert.equal(manifest.short_name,'HORIZON');
 assert.ok(manifest.icons.some(i=>i.src==='assets/horizon-app.svg'));
 assert.ok(manifest.icons.some(i=>i.src==='assets/horizon-icon-192.png'));
 assert.ok(manifest.icons.some(i=>i.src==='assets/horizon-icon-512.png'));
});
