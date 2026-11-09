import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {resolveArt,assetSummary,artGate,assertUniqueIds,safeAssetPath} from '../source/public/n5-v3/art-contract.mjs';

const p=(name)=>new URL('../source/public/'+name,import.meta.url);
const manifest=JSON.parse(readFileSync(p('n5-v3/art-manifest.json'),'utf8'));
const bible=JSON.parse(readFileSync(p('n5-v3/story-bible-draft.json'),'utf8'));
const worldContext={};
runInNewContext(readFileSync(p('world-data.js'),'utf8')+'\n'+
 readFileSync(p('n5-cast-extension-v149.js'),'utf8')+'\n;globalThis.resultWorld=NP_WORLD;',worldContext);
const canonical=worldContext.resultWorld.characters;

test('art manifest covers 30 canonical identities with unique stable IDs',()=>{
 assert.equal(manifest.characters.length,30);
 assertUniqueIds(manifest.characters,'character');
 assert.deepEqual(manifest.characters.map(x=>x.id).sort(),canonical.map(x=>x.id).sort());
 for(const p of manifest.characters){
  assert.ok(p.jp && p.display && p.nationality && p.role && p.organization, 'Missing canonical metadata for '+p.id);
  assert.ok(safeAssetPath(p.sources.portrait));
  assert.ok(safeAssetPath(p.sources.bust));
  assert.ok(p.review?.status==='pending'||p.review?.status==='approved');
 }
});
test('all 6 scene and 8 environment slots have specific approved-path contracts',()=>{
 assert.equal(manifest.scenes.length,6);
 assert.equal(manifest.environments.length,8);
 assertUniqueIds(manifest.scenes,'scene');
 assertUniqueIds(manifest.environments,'environment');
 for(const s of manifest.scenes){
  assert.ok(s.castIds.length>=1);
  s.castIds.forEach(id=>assert.ok(manifest.characters.some(c=>c.id===id)));
  assert.ok(safeAssetPath(s.asset));
  assert.ok(safeAssetPath(s.thumbnail));
 }
 for(const scene of manifest.environments)assert.ok(safeAssetPath(scene.asset));
});
test('asset provider refuses missing approval and cannot accidentally show geometric portrait fallback',()=>{
 const result=resolveArt(manifest,'characters','keiko');
 assert.equal(result.status,'pending');
 assert.equal(result.src,null);
 assert.equal(resolveArt(manifest,'characters','never-existed').status,'missing-record');
 assert.equal(resolveArt(manifest,'scenes','meeting').src,null);
 assert.equal(safeAssetPath('../fake.webp'),null);
 assert.equal(safeAssetPath('https://example.test/wrong.webp'),null);
 const summary=assetSummary(manifest);
 assert.deepEqual(summary.characters,{total:30,approved:0});
 assert.deepEqual(summary.scenes,{total:6,approved:0});
 assert.equal(artGate(manifest).ready,false);
});
test('art must be identity approved and art approved, not merely marked status approved',()=>{
 const fixture=structuredClone(manifest);
 const entry=fixture.characters.find(x=>x.id==='keiko');
 entry.review.status='approved';
 assert.equal(resolveArt(fixture,'characters','keiko').status,'pending');
 entry.review.identityApproved=true;
 assert.equal(resolveArt(fixture,'characters','keiko').status,'pending');
 entry.review.artApproved=true;
 assert.equal(resolveArt(fixture,'characters','keiko').status,'approved');
});
test('story bible keeps historical assessment IDs untouched and separates v3 scenarios',()=>{
 assert.equal(bible.sceneOutline.length,6);
 assertUniqueIds(bible.sceneOutline.map(x=>({id:x.newId})),'v3 scene');
 assertUniqueIds(bible.sceneOutline.map(x=>({id:x.legacyId})),'legacy scene');
 assert.equal(bible.compatibility.existingLegacyStorage,'DO NOT MIGRATE OR DELETE');
 for(const s of bible.sceneOutline){
  assert.ok(s.newId!==s.legacyId);
  assert.ok(manifest.scenes.some(x=>x.id===s.legacyId));
  s.cast.forEach(id=>assert.ok(manifest.characters.some(x=>x.id===id)));
  assert.ok(s.lines.length>=4);
  assert.equal(s.editorialState,'draft');
 }
});
test('mockup leads share one proposed IMC Osaka story setting without mutating the canonical catalog',()=>{
 const leads=bible.leads;
 assert.deepEqual(leads.map(x=>x.id),['keiko','yamada','mike']);
 assert.ok(leads.every(x=>x.workplace==='IMC (Osaka)'));
 assert.equal(bible.status,'editorial-review-required');
 const originalKeiko=canonical.find(x=>x.id==='keiko');
 assert.equal(originalKeiko.org,'hotel','Existing old-world identity is not silently rewritten');
});
test('approved assets require an actual on-disk file before shipping, not a manifest flag',()=>{
 const requiredPaths=[];
 for(const c of manifest.characters)if(c.review.status==='approved')
  requiredPaths.push(c.sources.portrait,c.sources.bust);
 for(const s of manifest.scenes)if(s.review==='approved')requiredPaths.push(s.asset,s.thumbnail);
 for(const e of manifest.environments)if(e.review==='approved')requiredPaths.push(e.asset);
 for(const h of Object.values(manifest.hero))if(h.status==='approved')requiredPaths.push(h.asset);
 for(const path of requiredPaths)assert.ok(existsSync(p(path)),'Missing approved file '+path);
});
