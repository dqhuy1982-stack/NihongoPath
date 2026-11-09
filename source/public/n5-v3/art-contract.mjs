/* HORIZON N5 v3 Art Contract — framework-agnostic, reusable, no UI fallbacks. */
const allowed=/^assets\/n5-v3\/[a-z0-9/_-]+\.(?:webp|avif|png)$/i;
const supported=["characters","scenes","environments","hero"];
export function safeAssetPath(path){
 return typeof path==="string"&&allowed.test(path)&&!path.includes("..")?path:null;
}
export function resolveArt(manifest,kind,id,variant="portrait"){
 if(!manifest||!supported.includes(kind))return {status:"invalid",src:null};
 let entry;
 if(kind==="characters")entry=manifest.characters?.find(x=>x.id===id);
 else if(kind==="scenes")entry=manifest.scenes?.find(x=>x.id===id);
 else if(kind==="environments")entry=manifest.environments?.find(x=>x.id===id);
 else entry=manifest.hero?.[id];
 if(!entry)return {status:"missing-record",src:null,id};
 const path=kind==="characters"?entry.sources?.[variant]:
    kind==="scenes"&&variant==="thumbnail"?entry.thumbnail:
    kind==="hero"?entry.asset:entry.asset;
 const requestedApproved=kind==="characters"?entry.review?.status==="approved"&&entry.review.identityApproved===true&&entry.review.artApproved===true:
   entry.review==="approved"||entry.status==="approved";
 return requestedApproved&&safeAssetPath(path)?
  {status:"approved",src:path,id,kind,variant}:
  {status:"pending",src:null,id,kind,variant};
}
export function assetSummary(manifest){
 const characters=manifest?.characters||[],scenes=manifest?.scenes||[],environments=manifest?.environments||[];
 return {
  characters:{total:characters.length,approved:characters.filter(x=>resolveArt(manifest,"characters",x.id).status==="approved").length},
  scenes:{total:scenes.length,approved:scenes.filter(x=>resolveArt(manifest,"scenes",x.id).status==="approved").length},
  environments:{total:environments.length,approved:environments.filter(x=>resolveArt(manifest,"environments",x.id).status==="approved").length},
  hero:{total:2,approved:["desktop","mobile"].filter(x=>resolveArt(manifest,"hero",x).status==="approved").length}
 };
}
export function artGate(manifest){
 const summary=assetSummary(manifest);
 const required=manifest?.required||{};
 const ready=summary.characters.approved===(required.portrait||30)&&
  summary.scenes.approved===(required.scenesLesson01||6)&&
  summary.environments.approved===(required.environments||8)&&
  summary.hero.approved===(required.heroesResponsive||2);
 return {ready,summary};
}
export function assertUniqueIds(entries,label){
 const ids=new Set();
 for(const entry of entries||[]){
  if(!entry?.id||ids.has(entry.id))throw Error("Duplicate or missing "+label+" id: "+entry?.id);
  ids.add(entry.id);
 }
 return true;
}
export function characterImage(manifest,id,variant="portrait"){
 const asset=resolveArt(manifest,"characters",id,variant);
 return asset.status==="approved"?{src:asset.src,alt:manifest.characters.find(x=>x.id===id)?.display||id}:null;
}
