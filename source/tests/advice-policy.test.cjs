const test=require('node:test');
const assert=require('node:assert/strict');
const policy=require('../public/advice-policy.js');
const E=require('../public/demo-engine.js');
const seed=require('../public/demo-data/seed.json');
const base={mode:'adaptive',gapDays:0,isNew:false,hasPending:true,dueCount:4,hasRepeated:true,hasSlow:false,blockingRepeated:false,blockingSlow:false};

test('adaptive is the default and unrelated historical errors do not interrupt a lesson',()=>{
  assert.equal(policy.normalize(), 'adaptive');
  assert.equal(policy.choose(base).kind,'resume');
  assert.equal(policy.choose({...base,mode:'invalid'}).mode,'adaptive');
});
test('adaptive only puts repeated errors first when the pending activity needs that skill',()=>{
  assert.equal(policy.choose({...base,blockingRepeated:true}).kind,'repair');
  assert.equal(policy.choose({...base,hasRepeated:false,hasSlow:true,blockingSlow:true}).kind,'recall');
});
test('continue-first and review-first are preferences with observably different plans',()=>{
  const state=E.create(seed);
  state.learnerUpdates[state.learnerId]={studyPriority:'resume'};
  const resume=E.plan(seed,state);
  state.learnerUpdates[state.learnerId]={studyPriority:'review'};
  const review=E.plan(seed,state);
  assert.equal(resume.items[0].kind,'resume');
  assert.equal(review.items[0].kind,'review');
  assert.notDeepEqual(resume.items,review.items);
  assert.ok(resume.used<=5&&review.used<=5);
});
test('all modes offer a gentle return after a break instead of catch-up debt',()=>{
  for(const mode of policy.MODES)assert.equal(policy.choose({...base,mode,gapDays:6,blockingRepeated:true}).kind,'return');
});
test('a preference stays with its learner after persistence and does not alter answers',()=>{
  let state=E.create(seed);const before=JSON.stringify(state.attempts);
  state.learnerUpdates['demo-minh']={studyPriority:'review'};
  state=JSON.parse(JSON.stringify(state));
  assert.equal(E.learner(seed,state).studyPriority,'review');
  E.selectScenario(seed,state,'desk');assert.equal(E.learner(seed,state).studyPriority,'adaptive');
  assert.equal(JSON.stringify(state.attempts),before);
});
test('data links, not profile names, determine whether a skill blocks the pending lesson',()=>{
  const custom=E.copy(seed),state=E.create(custom);
  custom.content.find(c=>c.id==='n5-lesson').requiredSkillIds=['unrelated-skill'];
  assert.equal(E.plan(custom,state).kind,'resume');
  custom.content.find(c=>c.id==='n5-lesson').requiredSkillIds=['self-introduction'];
  assert.equal(E.plan(custom,state).kind,'repair');
});
