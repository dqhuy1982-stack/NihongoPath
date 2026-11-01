// Behavioral contract checks for the decision model, independent of UI markup.
const test = require('node:test');
const assert = require('node:assert/strict');
const seed = require('../public/demo-data/seed.json');
const E = require('../public/demo-engine.js');
function fixture(scenario){const state=E.create(seed);E.selectScenario(seed,state,scenario);return state;}

test('all presets fit the chosen time and available module capabilities',()=>{
  for(const scenario of seed.scenarios){
    for(const minutes of [5,15,30])for(const place of ['train','office','desk']){
      const s=fixture(scenario.id);Object.assign(s.context,{minutes,place});
      const p=E.plan(seed,s);
      assert.ok(p.items.length>0,scenario.id);
      assert.ok(p.used<=minutes,`${scenario.id} / ${minutes}`);
      for(const item of p.items)for(const qid of item.questionIds){
        const q=E.qById(seed,qid), c=E.contentById(seed,q.contentId);
        assert.ok(c && c.status==='demo');assert.equal(c.requirements.audio,false);
        assert.ok(!c.requirements.writing||place==='desk');
      }
    }
  }
});
test('new learner has an empty evidence state and receives a short foundation segment',()=>{
  const s=fixture('first-step'),p=E.plan(seed,s);
  assert.equal(p.kind,'new');assert.equal(p.facts.attempts.length,0);
  assert.equal(p.facts.learner.assessedLevel,null);
  assert.equal(p.items[0].contentId,'foundation-lesson');assert.equal(p.used,4);
});
test('returning learner is not assigned catch-up debt even with 30 minutes available',()=>{
  const s=fixture('return');s.context.minutes=30;const p=E.plan(seed,s);
  assert.equal(p.kind,'return');assert.equal(p.facts.gap,6);assert.ok(p.used<=5);
  assert.ok(p.items[0].questionIds.length<=3);
});
test('time and environment actually change selected work, not only copy',()=>{
  const s=fixture('commute'),short=E.plan(seed,s);
  s.context.minutes=15;const longer=E.plan(seed,s);
  assert.ok(longer.used>short.used);
  s.context.minutes=30;s.context.place='train';assert.ok(!E.plan(seed,s).items.some(i=>i.kind==='practice'));
  s.context.place='desk';assert.ok(E.plan(seed,s).items.some(i=>i.kind==='practice'));
});
test('missing listening module has explicit fallback and never enters the mandatory plan',()=>{
  const s=fixture('no-audio'),p=E.plan(seed,s);assert.equal(p.fallback,true);
  assert.ok(p.items.every(i=>i.questionIds.every(q=>E.qById(seed,q).contentId!=='listening')));
});
test('an answer is immutable after checking; hint evidence stays attached',()=>{
  const s=fixture('first-step');E.start(seed,s);let session=E.activeSession(s);
  const q=E.qById(seed,session.questionIds[session.index]);session.hintUsed=true;
  const a=E.answer(seed,s,(q.answer+1)%q.options.length,7000);
  assert.equal(a.correct,false);assert.equal(a.hintUsed,true);
  assert.equal(a.definition.text,q.text);assert.throws(()=>E.answer(seed,s,q.answer,100));
  assert.equal(s.reviews.find(r=>r.questionId===q.id).intervalDays,1);
});
test('JSON round trip resumes the same question and selected answer without a new attempt',()=>{
  let s=fixture('first-step');E.start(seed,s);let session=E.activeSession(s);
  const q=E.qById(seed,session.questionIds[0]);E.answer(seed,s,q.answer,2300);E.next(seed,s);
  session=E.activeSession(s);session.selected=1;
  const before=s.attempts.length;s=JSON.parse(JSON.stringify(s));
  assert.equal(E.activeSession(s).index,1);assert.equal(E.activeSession(s).selected,1);
  assert.equal(s.attempts.length,before);
});
test('finishing a short segment retains the rest of the full lesson',()=>{
  const s=fixture('first-step');E.start(seed,s);
  for(let i=0;i<2;i++){const session=E.activeSession(s),q=E.qById(seed,session.questionIds[session.index]);E.answer(seed,s,q.answer,3000);E.next(seed,s);}
  const session=E.activeSession(s);assert.equal(session.status,'paused');assert.equal(session.index,2);
  assert.equal(session.questionIds.length,3);assert.equal(s.lastSummary.partial,true);
  const next=E.plan(seed,s);assert.ok(next.items.some(i=>i.kind==='resume'));
});
test('switching learners cannot expose a prior run, summary or records',()=>{
  const s=fixture('first-step');E.start(seed,s);const q=E.qById(seed,E.activeSession(s).questionIds[0]);E.answer(seed,s,q.answer,2000);
  E.selectScenario(seed,s,'desk');assert.equal(E.activeSession(s),null);assert.equal(s.run,null);
  assert.ok(E.facts(seed,s).attempts.every(a=>a.learnerId==='demo-trang'));
});
test('a fresh learner added via data works without a name-specific branch',()=>{
  const custom=E.copy(seed);custom.learners.push({...custom.learners[0],id:'learner-extra',name:'Tên rất dài để thử mở rộng'});
  custom.scenarios.push({...custom.scenarios[0],id:'extra',learnerId:'learner-extra'});
  const s=E.create(custom);E.selectScenario(custom,s,'extra');assert.equal(E.plan(custom,s).kind,'new');
});
test('a multi-activity desk plan completes without changing another learner’s records',()=>{
  const s=fixture('desk'),otherBefore=JSON.stringify(s.attempts.filter(a=>a.learnerId!=='demo-trang'));
  E.start(seed,s);let completed=0;
  while(s.run.index<s.run.items.length){
    let result='question';
    while(result!=='summary'){
      const session=E.activeSession(s);
      const q=E.qById(seed,session.questionIds[session.index]);
      if(session.phase==='question')E.answer(seed,s,q.answer,2000);
      result=E.next(seed,s);
    }
    completed++;
    if(s.run.index<s.run.items.length)E.continueRun(seed,s);
  }
  assert.equal(completed,s.run.items.length);
  assert.equal(JSON.stringify(s.attempts.filter(a=>a.learnerId!=='demo-trang')),otherBefore);
});
