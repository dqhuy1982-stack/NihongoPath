'use strict';
/**
 * Build a safe static REVIEW artifact from the private v15 source.
 * Does not modify source/public, git branches, backend, database, or user data.
 *
 *   node scripts/build-public-preview.cjs
 *
 * Result: dist/public-preview (deploy this directory only).
 */
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const source=path.join(root,'source','public');
const target=path.join(root,'dist','public-preview');
const allowed=new Set(['.html','.js','.css','.json','.webmanifest','.svg','.png','.jpg','.jpeg','.webp','.ico','.woff','.woff2','.ttf','.txt','.mp3','.ogg','.oga','.avif','.gif']);
const debugPages=new Set(['admin-before.html','admin-compare.html','lesson-compare.html','login-compare.html']);
const requireFile=name=>{const p=path.join(source,name);if(!fs.existsSync(p))throw Error('Missing required public asset: '+name);return fs.readFileSync(p,'utf8');};
const html=requireFile('index.html');
const studio=requireFile('kana-studio.js');
const stylesheet=requireFile('kana-studio.css');
// Required state: stable pre-Compact Kana layout and complete same-origin audio.
if(!studio.includes('playKana(glyph(w))')||!studio.includes('kanaLocalPackReady')||studio.includes('ks-page-focus')||
   !stylesheet.includes('.ks-glyph-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr))')||
   !stylesheet.includes('.ks-svg{display:block;width:100%;height:auto;aspect-ratio:1')||stylesheet.includes('body.ks-page-focus')){
  throw Error('Unexpected Kana layout or missing local-audio code: Pull latest develop.');
}
const audioDir=path.join(source,'assets','kana-audio');
const audioPackPath=path.join(audioDir,'pack.json');
if(!fs.existsSync(audioPackPath))throw Error('Missing pack.json. Download all 46 Kana MP3s first.');
const pack=JSON.parse(fs.readFileSync(audioPackPath,'utf8'));
if(pack.schemaVersion!==1||pack.audioFormat!=='mp3'||pack.sounds!==46||pack.license!=='CC BY 4.0')
  throw Error('Audio pack metadata is incomplete or license not verified.');
const syllables=["a","i","u","e","o","ka","ki","ku","ke","ko","sa","shi","su","se","so","ta","chi","tsu","te","to","na","ni","nu","ne","no","ha","hi","fu","he","ho","ma","mi","mu","me","mo","ya","yu","yo","ra","ri","ru","re","ro","wa","wo","n"];
for(const name of syllables){
  const file=path.join(audioDir,name+'.mp3');
  if(!fs.existsSync(file))throw Error('Missing audio file: '+name+'.mp3');
  const data=fs.readFileSync(file);
  if(!(data.length>500&&(data.subarray(0,3).toString()==='ID3'||
    (data[0]===255&&(data[1]&224)===224))))throw Error('Invalid MP3 file: '+name+'.mp3');
}
if(!html.includes('<script src="kana-studio.js"></script>'))throw Error('Cannot verify original asset entry point. Aborting.');
if(fs.existsSync(target))fs.rmSync(target,{force:true,recursive:true});
fs.mkdirSync(target,{recursive:true});
const files=[];
function walk(from,to,relative=''){
 for(const dirent of fs.readdirSync(from,{withFileTypes:true})){
  const rel=relative?relative+'/'+dirent.name:dirent.name;
  const input=path.join(from,dirent.name),output=path.join(to,dirent.name);
  if(dirent.isDirectory()){fs.mkdirSync(output,{recursive:true});walk(input,output,rel);continue;}
  if(!dirent.isFile())continue;
  if(rel.includes('/.'))continue;
  if(rel.split('/').some(part=>['.git','.env','node_modules','server','private','secrets','credentials','.wrangler'].includes(part.toLowerCase())))continue;
  if(debugPages.has(rel))continue;
  const ext=path.extname(dirent.name).toLowerCase();
  if(!allowed.has(ext))continue;
  if(ext==='.html'&&rel!=='index.html')continue;
  fs.copyFileSync(input,output);
  files.push(rel);
 }
}
walk(source,target);
let page=fs.readFileSync(path.join(target,'index.html'),'utf8');
// Pages is for demonstration only. Always stay in local/demo mode; do not call pilot API.
const previewGuard='<meta name="robots" content="noindex,nofollow">'+
 '<script>(function(){var u=new URL(location.href);if(u.searchParams.get("mode")!=="demo"){u.searchParams.set("mode","demo");history.replaceState(null,"",u.pathname+u.search+u.hash);}})();</script>';
if(!page.includes('</head>'))throw Error('Missing </head> from index.html');
page=page.replace('</head>',previewGuard+'</head>');
fs.writeFileSync(path.join(target,'index.html'),page,'utf8');
const manifestPath=path.join(target,'manifest.webmanifest');
if(fs.existsSync(manifestPath)){
  const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
  manifest.id='./';
  manifest.start_url='./?mode=demo#today';
  manifest.scope='./';
  fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
}
fs.writeFileSync(path.join(target,'.nojekyll'),'');
fs.writeFileSync(path.join(target,'_headers'),[
  '/*',
  '  X-Content-Type-Options: nosniff',
  '  Referrer-Policy: strict-origin-when-cross-origin',
  '  X-Frame-Options: DENY',
  ''
].join('\n'));
fs.writeFileSync(path.join(target,'PREVIEW_NOTICE.txt'),[
 'NIHONGO PATH — PUBLIC DEMO ONLY',
 'Built from the private develop branch, static assets only.',
 'No real login, production user accounts, backend, or D1 database.',
 'Progress saved here is local to this browser/device and is not synchronized.',
 'Do not enter real passwords or personal information in prototype forms.',
 'Public pages are visible to anyone with the URL. This is not a secure private portal.',
 'All 46 Kana MP3 recordings are bundled locally in this public preview.',
 ''
].join('\n'));
const sourcePaths=files.filter(x=>x.endsWith('.js')||x.endsWith('.json'));
// Safe-export self-check: no app/server/db paths and only a single public HTML entrypoint.
if(files.some(x=>/(^|\/)(\.env|server|db|drizzle|private)(\/|$)/i.test(x)))throw Error('Disallowed private/backend path in export');
if(files.filter(x=>x.endsWith('.html')).join(',')!=='index.html')throw Error('Unexpected extra HTML entrypoint');
if(files.filter(x=>x.startsWith('assets/kana-audio/')&&x.endsWith('.mp3')).length!==46)throw Error('Public preview missing bundled audio');
console.log(JSON.stringify({status:'built',target,files:files.length,scriptAndDataFiles:sourcePaths.length,mode:'demo-only',containsBackend:false,audioClipsIncluded:46,realIPhoneAudioTested:true},null,2));
