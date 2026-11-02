'use strict';
/* Run: node --test tests/kana-stroke-view.test.cjs */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const V=require('../source/public/kana-stroke-view.js');
const root=path.resolve(__dirname,'..');
const raw=fs.readFileSync(path.join(root,'source/public/kana-data.js'),'utf8');
const DATA=JSON.parse(raw.slice(raw.indexOf('=')+1).trim().replace(/;\s*$/,''));
const get=char=>DATA.characters.find(c=>c.char===char);

test('all 92 basic Kana keep one bounded path per pen stroke',()=>{
  assert.equal(DATA.characters.length,92);
  for(const char of DATA.characters){
    const paths=V.displayPaths(char);
    assert.equal(paths.length,char.strokes.length,char.char);
    for(const d of paths){
      assert.ok(/^[MLC0-9.\s-]+$/.test(d),char.char);
      const numeric=d.match(/-?\d+(?:\.\d+)?/g).map(Number);
      assert.ok(numeric.every(n=>Number.isFinite(n)&&n>=0&&n<=1024),char.char);
    }
  }
});

test('Nu, Me, Ho and A ignore out-of-frame auxiliary paths',()=>{
  for(const glyph of ['ぬ','め','ほ','あ','ま','ね']){
    const record=get(glyph),joined=V.displayPaths(record).join(' ');
    assert.ok(record,'Missing glyph '+glyph);
    assert.ok(!joined.includes('1553')&&!joined.includes('1568'),glyph);
    assert.equal(V.displayPaths(record).length,record.strokes.length,glyph);
  }
  assert.ok(get('ぬ').strokes[1].some(s=>s.includes('1553')));
  assert.ok(get('あ').strokes[2].some(s=>s.includes('M-170')));
  assert.ok(!V.displayPaths(get('ぬ')).join(' ').includes('1553'));
});

test('primary path geometry preserves each original start and endpoint',()=>{
  for(const char of DATA.characters){
    for(let i=0;i<char.strokes.length;i++){
      const original=V.points(V.primary(char.strokes[i]));
      const smoothed=V.displayPaths(char)[i];
      const nums=(smoothed.match(/-?\d+(?:\.\d+)?/g)||[]).map(Number);
      assert.equal(nums[0],original[0].x,char.char);
      assert.equal(nums[1],original[0].y,char.char);
      assert.equal(nums.at(-2),original.at(-1).x,char.char);
      assert.equal(nums.at(-1),original.at(-1).y,char.char);
      if(original.length>2)assert.ok(smoothed.includes('C'),char.char);
    }
  }
});

test('authentic calligraphic outlines remain available for muted glyph guide',()=>{
  for(const char of DATA.characters){
    const shapes=V.glyphOutlines(char);
    assert.ok(shapes.length,char.char);
    assert.ok(shapes.every(s=>s.startsWith('M')&&s.endsWith('Z')),char.char);
  }
});

test('malformed or missing primary paths fail safely',()=>{
  assert.throws(()=>V.primary([]),/Missing Kana/);
  assert.throws(()=>V.primary(['M200 1553L900 100']),/Invalid primary/);
  assert.deepEqual(V.points('M10 12L20 22'),[{x:10,y:12},{x:20,y:22}]);
  assert.equal(V.smooth('M10 12L20 22'),'M10 12L20 22');
});
