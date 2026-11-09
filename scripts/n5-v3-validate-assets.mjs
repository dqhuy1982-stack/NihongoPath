import {readFileSync,existsSync,statSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {artGate} from '../source/public/n5-v3/art-contract.mjs';
const root=resolve(fileURLToPath(new URL('../source/public/',import.meta.url)));
const manifest=JSON.parse(readFileSync(resolve(root,'n5-v3/art-manifest.json'),'utf8'));
const strict=process.argv.includes('--strict');
const approved=[];
const missing=[];
for(const c of manifest.characters){
 if(c.review.status==='approved'){
  approved.push({id:c.id,type:'portrait',path:c.sources.portrait,min:20000});
  approved.push({id:c.id,type:'bust',path:c.sources.bust,min:20000});
 }
}
for(const s of manifest.scenes)if(s.review==='approved'){
 approved.push({id:s.id,type:'scene',path:s.asset,min:40000});
 approved.push({id:s.id,type:'thumbnail',path:s.thumbnail,min:10000});
}
for(const e of manifest.environments)if(e.review==='approved')
 approved.push({id:e.id,type:'environment',path:e.asset,min:30000});
for(const [id,h] of Object.entries(manifest.hero))if(h.status==='approved')
 approved.push({id,type:'hero',path:h.asset,min:50000});
function realImage(path){
 const bytes=readFileSync(path);
 if(bytes.length<16)return false;
 const png=bytes[0]===137&&bytes.subarray(1,4).toString('ascii')==='PNG';
 const webp=bytes.subarray(0,4).toString('ascii')==='RIFF'&&bytes.subarray(8,12).toString('ascii')==='WEBP';
 const avif=bytes.subarray(4,12).toString('ascii').includes('ftypavif');
 return png||webp||avif;
}
for(const file of approved){
 const location=resolve(root,file.path);
 if(!location.startsWith(root+'/')){missing.push(file.id+' path escapes asset root');continue}
 if(!existsSync(location)){missing.push(file.id+' missing: '+file.path);continue}
 const stats=statSync(location);
 if(stats.size<file.min||!realImage(location))missing.push(file.id+' invalid/too small raster: '+file.path);
}
const gate=artGate(manifest),summary=gate.summary;
console.log(JSON.stringify({status:gate.ready?'READY':'ART_GATE_PENDING',summary,approvedFiles:approved.length,issues:missing},null,2));
if(missing.length||strict&&!gate.ready){console.error(strict?'ART_GATE_NOT_APPROVED':'INVALID_APPROVED_IMAGE_FILES');process.exitCode=1}
