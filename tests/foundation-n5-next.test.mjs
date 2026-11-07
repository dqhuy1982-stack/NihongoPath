import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
const engineContext={window:{}};
runInNewContext(readFileSync(new URL('../source/public/lesson-engine.js',import.meta.url),'utf8'),engineContext);
const E=engineContext.window.NPLessonEngine;
function load(name){
 const window={};
 runInNewContext(readFileSync(new URL('../source/public/'+name,import.meta.url),'utf8'),{window});
 return Object.values(window)[0];
}
const lessons=['foundation-k-content.js','foundation-s-content.js','foundation-t-content.js','n5-greetings-content.js','n5-demonstratives-content.js'].map(load);
test('Foundation K/S/T and N5 greetings/demonstratives expose complete, versioned lessons',()=>{
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
test('Every new lesson completes, scores and schedules independent spaced review',()=>{
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

test('Course and lesson UI expose contextual tests without counting tools as lessons',()=>{
 const js=readFileSync(new URL('../source/public/learning-hub-v25.js',import.meta.url),'utf8');
 assert.match(js,/function testRoute\(act\)/);
 assert.match(js,/kind:'tool'/);
 assert.match(js,/kind:'lesson'/);
 assert.match(js,/quiz\//);
 const index=readFileSync(new URL('../source/public/index.html',import.meta.url),'utf8');
 for(const file of ['foundation-s-content.js?v=32','foundation-t-content.js?v=32','n5-demonstratives-content.js?v=32','learning-hub-v32.css?v=32']) assert.ok(index.includes(file),file);
});
