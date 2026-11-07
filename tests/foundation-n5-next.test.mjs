import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const E=require('../source/public/lesson-engine.js');
function load(name){
 const window={};
 runInNewContext(readFileSync(new URL('../source/public/'+name,import.meta.url),'utf8'),{window});
 return name.includes('foundation-k')?window.NP_FOUNDATION_K_CONTENT:window.NP_N5_GREETINGS_CONTENT;
}
const lessons=[load('foundation-k-content.js'),load('n5-greetings-content.js')];
test('Foundation K and N5 greetings both expose complete, versioned lessons',()=>{
 for(const content of lessons){
  assert.equal(content.version,1);
  assert.equal(content.questions.length,content.concepts.length);
  for(const n of [3,5,15]){
   assert.ok(content.plans[n].length>0);
   for(const key of content.plans[n])assert.ok(content.units[key],key);
  }
  for(const q of content.questions){
   assert.ok(q.options.some(o=>o.id===q.answer));
   assert.ok(content.concepts.some(x=>x.id===q.conceptId));
   assert.ok(q.options.every(o=>o.why));
   assert.ok(q.explanation);
  }
 }
});
test('Both paths complete, score and schedule independent spaced review',()=>{
 for(const content of lessons){
  const state=E.create(content.id+'-learner');
  const s=E.start(state,content,{minutes:5,random:()=>.5,now:'2026-11-07T03:00:00Z'});
  while(s.status==='active'){
   const unit=E.unit(s);
   if(unit.type==='question'){
    const q=content.questions.find(x=>x.id===unit.questionId);
    E.select(state,q.answer);
    assert.equal(E.check(state,'2026-11-07T03:00:00Z').correct,true);
   }
   E.advance(state,{now:'2026-11-07T03:00:00Z'});
  }
  assert.equal(s.status,'completed');
  assert.equal(state.attempts.length,content.questions.length);
  assert.equal(state.reviews.length,content.questions.length);
  assert.ok(state.reviews.every(x=>x.learnerId===state.learnerId&&x.contentId===content.id));
 }
});
test('Learner results remain isolated; incorrect answer schedules review without advancing mastery',()=>{
 const c=lessons[1],alice=E.create('alice'),bob=E.create('bob');
 const session=E.start(alice,c,{minutes:3,now:'2026-11-07T03:00:00Z'});
 while(E.unit(session)?.type!=='question')E.advance(alice,{now:'2026-11-07T03:00:00Z'});
 const q=c.questions.find(x=>x.id===E.unit(session).questionId);
 E.select(alice,q.options.find(x=>x.id!==q.answer).id);
 const attempt=E.check(alice,'2026-11-07T03:00:00Z');
 assert.equal(attempt.correct,false);
 assert.equal(alice.reviews.length,1);
 assert.equal(alice.reviews[0].stage,0);
 assert.equal(bob.sessions.length,0);
 assert.equal(bob.attempts.length,0);
 assert.equal(bob.reviews.length,0);
});
