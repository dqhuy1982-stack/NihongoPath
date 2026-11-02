'use strict';
/* Run with: node --test tests/kana-speed-control.test.cjs */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const M=require('../source/public/kana-model.js');

const source=fs.readFileSync(path.join(__dirname,'../source/public/kana-studio.js'),'utf8');
const styles=fs.readFileSync(path.join(__dirname,'../source/public/kana-studio.css'),'utf8');

test('Kana speed model retains existing supported speeds and default',()=>{
  const state=M.defaults();
  assert.equal(state.speed,1);
  for(const speed of [0.5,1,1.5]){
    const next=M.apply({...state},{action:'speed',speed});
    assert.equal(next.state.speed,speed);
    assert.equal(next.state.selected,'あ');
    assert.equal(next.state.script,'hiragana');
  }
  assert.throws(()=>M.apply({...state},{action:'speed',speed:0.75}),/Tốc độ chưa hợp lệ/);
  assert.throws(()=>M.apply({...state},{action:'speed',speed:1.25}),/Tốc độ chưa hợp lệ/);
});

test('segmented controls replace old select and expose an accessible pressed state',()=>{
  assert.ok(source.includes('class="ks-speed-control"'));
  assert.ok(source.includes('role="group" aria-labelledby="ks-speed-label"'));
  assert.ok(source.includes('class="ks-speed-option'));
  assert.ok(source.includes('data-ks="speed" data-speed='));
  assert.ok(source.includes('aria-pressed='));
  assert.ok(source.includes("tr('Tốc độ','Speed','速度')"));
  assert.ok(source.includes("tr('Bình thường','Normal','普通')"));
  assert.ok(source.includes("'0.5×'")&&source.includes("'1×'")&&source.includes("'1.5×'"));
  assert.ok(!source.includes('data-ks-speed'));
});

test('speed selections use the current persisted model, with safe async commit',()=>{
  assert.match(source,/if\(action==='speed'\).*w\.pending.*w\.switching.*speed===w\.snapshot\.speed/);
  assert.ok(source.includes("await commit(w,{action:'speed',speed});"));
  assert.ok(source.includes("const selected=Number(b.dataset.speed)===w.snapshot.speed"));
  assert.ok(source.includes("b.setAttribute('aria-pressed',String(selected))"));
  assert.ok(source.includes("b.disabled=busy||!!w.switching"));
  assert.ok(source.includes('const duration=1500/w.snapshot.speed'));
});

test('speed styling remains scoped and flex-wraps without altering Kana glyph grid',()=>{
  assert.ok(styles.includes('.ks-speed-control{display:flex;align-items:center;flex-wrap:wrap;'));
  assert.ok(styles.includes('.ks-speed-segments{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))'));
  assert.ok(styles.includes('.ks-speed-option.is-active{background:var(--navy)'));
  assert.ok(styles.includes('.ks-speed-option:focus-visible'));
  assert.ok(styles.includes('.ks-glyph-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr))'));
  assert.ok(styles.includes('.ks-svg{display:block;width:100%;height:auto;aspect-ratio:1'));
});
