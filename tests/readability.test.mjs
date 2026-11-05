import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const root=new URL('../source/public/',import.meta.url);
const read=p=>readFileSync(new URL(p,root),'utf8');
const sheet=read('readability.css');
const page=read('index.html');

function luminance(hex){
 const c=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=0.04045?v/12.92:((v+.055)/1.055)**2.4);
 return c[0]*.2126+c[1]*.7152+c[2]*.0722;
}
function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
test('final readability stylesheet loads after feature-specific CSS',()=>{
 const needle='<link rel="stylesheet" href="readability.css">';
 assert.equal(page.split(needle).length-1,1);
 assert.ok(page.indexOf('href="readability.css"')>page.indexOf('href="kana-recall.css"'));
 assert.ok(page.indexOf('href="readability.css"')<page.indexOf('</head>'));
});
test('readability meets WCAG AA normal text contrast targets in light and dark',()=>{
 for(const [name,foreground,background] of [
  ['light text','#213d32','#fffefa'],
  ['light muted','#465b50','#fffefa'],
  ['dark text','#edf4eb','#1b3330'],
  ['dark muted','#c6d4c5','#1b3330'],
  ['login note','#425c4b','#fcfcf7'],
  ['login goal','#4b6152','#fcfcf7'],
  ['login name','#203d32','#fcfcf7'],
  ['login dark note','#d0ddc7','#243d35']
 ]){
  assert.ok(contrast(foreground,background)>=4.5,name+' contrast '+contrast(foreground,background).toFixed(2));
 }
});
test('readability retains all existing lesson flows and Japanese glyph dimensions',()=>{
 for(const marker of ['.portal-home .portal-person','.portal-home .portal-person-goal',
  '.sidebar .navlink','.pagehead .subtitle','.ks-glyph small','.ks-toolbar p',
  'body.dark','@media(max-width:759px)','@media(prefers-contrast:more)']){
  assert.ok(sheet.includes(marker),'missing '+marker);
 }
 assert.ok(!/\.ks-svg\s*\{/.test(sheet),'stroke drawing geometry is not overridden');
 assert.ok(!/\.ks-glyph strong\s*\{/.test(sheet),'Japanese glyph size must be unchanged');
 assert.ok(sheet.includes("font-family:var(--font-readable)"),'self-hosted readable font stack expected');
 assert.ok(!sheet.includes('!important'),'avoid hard-to-revert CSS');
});
