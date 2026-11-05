'use strict';
/**
 * Build the same Nihongo Path UI for static preview or the single D1-backed
 * Cloudflare Worker. The remote learning API remains server-side only.
 * Live build: NP_FAMILY_SYNC_BUILD=1 node scripts/build-site.cjs
 * No additional website, repository or user-facing environment is created.
 */
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const cp=require('node:child_process');

const root=path.resolve(__dirname,'..');
const preview=path.join(root,'dist','public-preview');
const dest=path.join(root,'dist','site');
// The live D1 build is explicitly enabled. Omitted flag produces static-only UI.
const familySync=process.env.NP_FAMILY_SYNC_BUILD==='1';

// Gate publication on the regression tests used by existing reviewed workflow.
const tests=['tests/kana-recall.test.cjs','tests/kana-stroke-view.test.cjs','tests/kana-speed-control.test.cjs'];
cp.execFileSync(process.execPath,['--test',...tests],{cwd:root,stdio:'inherit'});
// Reuse the already validated, static-only export. Never expose backend source.
require('./build-public-preview.cjs');
if(!fs.existsSync(path.join(preview,'index.html')))throw Error('Missing validated static preview');
fs.rmSync(dest,{recursive:true,force:true});
fs.cpSync(preview,dest,{recursive:true});

const indexPath=path.join(dest,'index.html');
let html=fs.readFileSync(indexPath,'utf8');
const guard='<meta name="robots" content="noindex,nofollow"><script>(function(){var u=new URL(location.href);if(u.searchParams.get("mode")!=="demo"){u.searchParams.set("mode","demo");history.replaceState(null,"",u.pathname+u.search+u.hash);}})();</script>';
if(!html.includes(guard))throw Error('Unexpected static preview guard; no public site built');
html=html.replace(guard,familySync
 ?'<script>window.NP_STATIC_PUBLISH=true;window.NP_FAMILY_SYNC=true;</script>'
 :'<script>window.NP_STATIC_PUBLISH=true;</script>');
// Enable the API adapter only for the live family-sync build.
const pilotPath=path.join(dest,'pilot-online.js');
let pilot=fs.readFileSync(pilotPath,'utf8');
const marker=/\(function\(\)\{\r?\n\s*'use strict';\r?\n/;
if(!marker.test(pilot)||!pilot.includes("fetch('/api/pilot/"))
 throw Error('Pilot server adapter changed; review before public release');
pilot=pilot.replace(marker,(match)=>match+' if(window.NP_STATIC_PUBLISH&&!window.NP_FAMILY_SYNC)return;\n');
fs.writeFileSync(pilotPath,pilot,'utf8');
// Build-public-preview fingerprints every script and stylesheet; refresh only modified pilot.
const hash=crypto.createHash('sha256').update(fs.readFileSync(pilotPath)).digest('hex').slice(0,12);
if(!/src="pilot-online\.js\?v=[a-f0-9]{12}"/.test(html))
 throw Error('Cannot find versioned pilot adapter');
html=html.replace(/src="pilot-online\.js\?v=[a-f0-9]{12}"/,'src="pilot-online.js?v='+hash+'"');
if(!html.includes('<title>HORIZON · A little closer. A world wider.</title>'))
 throw Error('HORIZON page identity not found in source');
html=html.replace('Design review · Prototype','HORIZON');
// The shipped family screen must not expose developer device simulators,
// scenario tools or the sitemap review bar. Keep source/public untouched.
// Other app layouts use --review-height for fixed navigation offsets.
const familyChrome='<style id="np-family-static-ui">:root{--review-height:0px}.reviewbar{display:none!important}</style>';
if(!html.includes('<\/head>')||!html.includes('class="reviewbar"'))
 throw Error('Static review chrome changed; review the family build before publishing');
html=html.replace('<\/head>',familyChrome+'<\/head>');
if(!html.includes(familyChrome))throw Error('Family static chrome cleanup missing');
// Do not preserve the prototype's forced demo URL in the published site.
if(html.includes('searchParams.set("mode","demo")'))throw Error('Demo URL rewrite remains');
if(!html.includes('window.NP_STATIC_PUBLISH=true;'))throw Error('Static deployment guard missing');
fs.writeFileSync(indexPath,html,'utf8');

const manifestPath=path.join(dest,'manifest.webmanifest');
if(fs.existsSync(manifestPath)){
 const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
 manifest.id='./';
 manifest.start_url='./#login';
 manifest.scope='./';
 fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n','utf8');
}
const notice=path.join(dest,'PREVIEW_NOTICE.txt');
if(fs.existsSync(notice))fs.rmSync(notice);
fs.writeFileSync(path.join(dest,'SITE_STATUS.txt'),[
 'HORIZON - PUBLIC WEBSITE',
 'Built directly from the single private NihongoPath/develop source.',
 familySync?'One live family app: server API requires FAMILY_SYNC_KEY configured as Worker secret.':'Static preview only: client-side learning.',
 familySync?'Pair each device once to store real learning in the shared remote D1.':'Learner data stays in this browser; progress does NOT sync across devices.',
 'Demo access codes are samples only: do not enter real passwords or personal data.',
 'No backend source, D1 records, server secrets or private repo data is shipped in assets.',
 'Kana audio: 46 locally bundled CC BY 4.0 recordings; see assets/kana-audio/ATTRIBUTION.txt.',
 ''
].join('\n'),'utf8');

const clips=fs.readdirSync(path.join(dest,'assets','kana-audio')).filter(x=>x.endsWith('.mp3'));
if(clips.length!==46||!fs.existsSync(path.join(dest,'kana-recall.js'))||
 !fs.existsSync(path.join(dest,'kana-stroke-view.js'))||
 !fs.existsSync(path.join(dest,'.nojekyll')))throw Error('Incomplete public site export');
console.log(JSON.stringify({status:'ready',output:'dist/site',sourceBranch:'develop',
 siteMode:familySync?'family-d1-live':'static-client-only',audioClips:clips.length,liveBackend:familySync,
 published:false},null,2));
