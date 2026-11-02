'use strict';
/* Run with: node --test tests/kana-recall.test.cjs */
const test=require('node:test');
const assert=require('node:assert/strict');
const M=require('../source/public/kana-recall-model.js');
const NOW=Date.parse('2026-11-02T00:00:00Z');
const fixed=()=>0.314159;

test('covers 46 basic Hiragana + 46 Katakana without duplicates',()=>{
  assert.equal(M.CARDS.filter(x=>x.kind==='basic').length,92);
  assert.equal(M.pool('hiragana',{}).length,46);
  assert.equal(M.pool('katakana',{}).length,46);
  assert.equal(new Set(M.CARDS.map(x=>x.char)).size,M.CARDS.length);
});

test('provides voiced, semi-voiced and small-ya/yu/yo combination practice',()=>{
  assert.equal(M.CARDS.filter(x=>x.kind==='voiced').length,50);
  assert.equal(M.CARDS.filter(x=>x.kind==='yoon').length,66);
  assert.equal(M.CARDS.length,208);
  for(const [char,romaji] of [['しゃ','sha'],['ちゅ','chu'],['きょ','kyo'],['ジャ','ja'],['ピュ','pyu'],['づ','zu']]){
    assert.equal(M.CARDS.find(x=>x.char===char)?.romaji,romaji);
  }
});

test('picks up to 12 different questions and four unique answer options',()=>{
  for(const group of ['hiragana','katakana','confusing','extended','all']){
    const deck=M.session(group,{},fixed,NOW);
    assert.equal(deck.length,12);
    assert.equal(new Set(deck.map(x=>x.char)).size,12);
    for(const card of deck){
      const choices=M.options(card,fixed);
      assert.equal(choices.length,4);
      assert.equal(new Set(choices).size,4);
      assert.ok(choices.includes(card.romaji));
    }
  }
});

test('targeted confusing Kana include the full Ha/Ma/Ra rows',()=>{
  const cards=M.pool('confusing',{});
  assert.ok(cards.length>=30);
  for(const glyph of 'はひふへほまみむめもらりるれろハヒフヘホマミムメモラリルレロシツソン'){
    assert.ok(cards.some(x=>x.char===glyph),'Missing focus Kana '+glyph);
  }
  const ha=M.CARDS.find(x=>x.char==='は');
  const choices=M.options(ha,()=>0.57);
  assert.ok(choices.includes('ma')&&choices.includes('ra'));
});

test('does not invent weak cards before there are attempts',()=>{
  assert.equal(M.session('weak',{},fixed,NOW).length,0);
  assert.deepEqual(M.stats({}),{attempted:0,attempts:0,waiting:0});
});

test('wrong answer remains local and becomes due after ten minutes',()=>{
  const card=M.CARDS[0];
  const result=M.grade({},card,'wrong',6500,NOW);
  assert.equal(result.correct,false);
  assert.equal(result.quick,false);
  assert.equal(result.history[card.char].wrong,1);
  assert.equal(M.pool('weak',result.history,NOW).length,0);
  assert.deepEqual(M.session('weak',result.history,fixed,NOW+600001).map(x=>x.char),[card.char]);
});

test('slow-but-correct answer is not counted as quick',()=>{
  const card=M.CARDS[0];
  const result=M.grade({},card,card.romaji,7300,NOW);
  assert.equal(result.correct,true);
  assert.equal(result.quick,false);
  assert.equal(result.history[card.char].slow,1);
  assert.equal(result.history[card.char].correct,1);
});

test('quick retry clears an old weak flag, without counting writing mastery',()=>{
  const card=M.CARDS[0];
  const wrong=M.grade({},card,'wrong',4500,NOW);
  const retry=M.grade(wrong.history,card,card.romaji,3000,NOW+600001);
  assert.equal(retry.history[card.char].seen,2);
  assert.equal(retry.history[card.char].wrong,0);
  assert.equal(M.stats(retry.history,NOW+600001).waiting,0);
  assert.ok(!('writing' in retry.history[card.char]));
});

test('malformed or injected storage entries are ignored',()=>{
  const clean=M.cleanHistory({
    ['<script>']:{wrong:900},
    [M.CARDS[0].char]:{seen:2,correct:1,wrong:1,slow:-99,dueAt:'2026-11-02T00:00:00Z'}
  });
  assert.equal(Object.keys(clean).length,1);
  assert.equal(clean[M.CARDS[0].char].slow,0);
  assert.throws(()=>M.pool('unknown',{}),/Unknown Kana/);
  assert.throws(()=>M.grade({}, {char:'BAD',romaji:'a'},'a',500,NOW),/Invalid Kana/);
});
