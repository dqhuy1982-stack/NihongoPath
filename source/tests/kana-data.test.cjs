const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const D=JSON.parse(fs.readFileSync(require('node:path').join(__dirname,'../content/kana-catalog.v1.json'),'utf8'));
const M=require('../server/kana-model.cjs');
test('92 basic Kana have original, checksummed source SVGs and valid ordered paths',()=>{
 assert.equal(D.characters.length,92);assert.equal(new Set(D.characters.map(c=>c.char)).size,92);
 for(const c of D.characters){assert.ok(M.allowed(c.char));assert.ok(c.strokes.length>0&&c.strokes.length<=8);assert.ok(c.strokes.every(group=>group.length&&group.every(d=>/^M/i.test(d.trim()))));
 const raw=fs.readFileSync(require('node:path').join(__dirname,'../public/assets/kana-strokes/'+c.char.codePointAt(0)+'.svg'));assert.equal(crypto.createHash('sha256').update(raw).digest('hex'),c.sha256);}
 assert.equal(D.characters.filter(c=>c.script==='hiragana').length,46);assert.equal(D.characters.filter(c=>c.script==='katakana').length,46);
 for(const [char,count] of [['あ',3],['い',2],['う',2],['ア',2],['シ',3],['ツ',3]])assert.equal(D.characters.find(c=>c.char===char).strokes.length,count,char);
});
test('writing validation bounds vector payloads and never treats a dot as a completed practice',()=>{
 assert.equal(M.hasWriting(M.drawing([[[.1,.1]]])),false);assert.equal(M.hasWriting(M.drawing([[[.1,.1],[.4,.4]]])),true);
 assert.throws(()=>M.drawing([[[NaN,0]]]));assert.throws(()=>M.drawing([[[0,-1]]]));assert.throws(()=>M.drawing(Array(33).fill([[.1,.1]])));
 assert.equal(fs.readFileSync(require('node:path').join(__dirname,'../public/kana-model.js'),'utf8'),fs.readFileSync(require('node:path').join(__dirname,'../server/kana-model.cjs'),'utf8'));
});
