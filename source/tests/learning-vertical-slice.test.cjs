/* Reproducible, browser-local first learning slice. No D1 or live learner data. */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const M=require('../public/content-model.js');
const R=require('../public/content-store.js');
const E=require('../public/lesson-engine.js');
const S=require('../public/lesson-store.js');
const n5=require('../content/n5-introduction.v1.json');
const foundation=require('../content/foundation-vowels.v1.json');
const admin=require('../public/admin-data/seed.json');
const NOW='2026-11-04T03:00:00.000Z';
const memory=()=>{const map=new Map();return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};};

function catalogue({lateFoundation=false}={}){
  const localStorage=memory(),window={};
  if(!lateFoundation)window.NP_FOUNDATION_CONTENT=foundation;
  const context=vm.createContext({
    window,localStorage,NP_LESSON_CONTENT:n5,
    NP_AUTHORING_SEED:admin,NPContentModel:M,NPContentStore:R
  });
  const script=fs.readFileSync(path.join(__dirname,'../public/content-catalog.js'),'utf8');
  vm.runInContext(script,context,{filename:'content-catalog.js'});
  return {api:window.NPContentCatalog,window,localStorage};
}

function transaction(storage,id,mutate){
  const existing=S.read(storage,id);
  return S.write(storage,id,existing.revision,mutate).state;
}

function finish(storage,id,{wrongFirst=false}={}){
  let wrongUsed=false;
  for(let i=0;i<60;i++){
    const state=S.read(storage,id),session=E.active(state);
    assert.ok(session,'Session is missing');
    if(session.status==='completed')return state;
    transaction(storage,id,working=>{
      const active=E.active(working),unit=E.unit(active);
      if(unit.type==='question'){
        const question=E.definition(active,unit.questionId);
        const wrong=wrongFirst&&!wrongUsed;
        if(question.type==='choice'){
          const option=wrong?question.options.find(o=>o.id!==question.answer).id:question.answer;
          E.select(working,option,NOW);
        }else if(question.type==='order'){
          const answer=wrong?[...question.answer].reverse():question.answer;
          for(const token of answer)E.token(working,token,NOW);
        }else{
          assert.fail('Unsupported question type: '+question.type);
        }
        E.check(working,NOW);
        if(wrong)wrongUsed=true;
      }
      E.advance(working,{now:NOW,repair:false});
    });
  }
  assert.fail('Session did not complete within 60 steps');
}

test('Foundation is discoverable while N5 authoring remains intact',()=>{
  const {api}=catalogue();
  assert.deepEqual(Array.from(api.list(),c=>c.id),['foundation-vowels','n5-introduction']);
  assert.equal(api.get('foundation-vowels',1).questions.length,5);
  assert.equal(api.get('foundation-vowels',2),null);
  const edited=api.get('foundation-vowels');
  edited.questions[0].answer='tampered';
  assert.equal(api.get('foundation-vowels').questions[0].answer,'a');
  assert.equal(api.get('n5-introduction').questions.length,11);
  assert.equal(api.read().drafts.length,2);
});

test('Foundation registration also works when its script loads after the catalog',()=>{
  const {api,window}=catalogue({lateFoundation:true});
  assert.deepEqual(Array.from(api.list(),c=>c.id),['n5-introduction']);
  window.NP_FOUNDATION_CONTENT=foundation;
  assert.deepEqual(Array.from(api.list(),c=>c.id),['foundation-vowels','n5-introduction']);
});

test('Foundation and N5 persist separate versioned sessions for one learner',()=>{
  const {api}=catalogue(),store=memory(),learner='adult';
  transaction(store,learner,s=>E.start(s,api.get('foundation-vowels'),{now:NOW,minutes:3,random:()=>.4}));
  const started=S.read(store,learner);
  assert.equal(E.active(started).contentId,'foundation-vowels');
  assert.equal(E.active(started).contentVersion,1);
  transaction(store,learner,s=>E.pause(s,NOW));
  assert.equal(E.active(S.read(store,learner)).status,'paused');
  transaction(store,learner,s=>E.resume(s,started.activeSessionId,NOW));
  finish(store,learner,{wrongFirst:true});

  transaction(store,learner,s=>E.start(s,api.get('n5-introduction'),{now:NOW,minutes:3,random:()=>.4}));
  const persisted=finish(store,learner);
  assert.equal(persisted.sessions.length,2);
  assert.deepEqual(persisted.sessions.map(s=>s.contentId),['foundation-vowels','n5-introduction']);
  assert.ok(persisted.sessions.every(s=>s.status==='completed'&&s.contentVersion===1));
  assert.ok(persisted.attempts.some(a=>!a.correct));
  assert.ok(persisted.attempts.some(a=>a.correct));
  assert.ok(persisted.reviews.some(r=>r.contentId==='foundation-vowels'));
  assert.ok(persisted.reviews.some(r=>r.contentId==='n5-introduction'));
  assert.equal(S.read(store,'child').sessions.length,0);
  assert.equal(api.reviewContent(persisted,{now:'2026-11-06T03:00:00.000Z'}).id,'foundation-vowels');
});

test('Reloaded review uses an immutable session snapshot when catalog version is absent',()=>{
  const {api}=catalogue();
  const past={id:'retired-lesson',version:1,title:'Archived lesson',questions:[]};
  const history={
    sessions:[{contentId:past.id,contentVersion:1,definition:past,status:'completed',mode:'lesson',updatedAt:NOW}],
    reviews:[{contentId:past.id,contentVersion:1,dueAt:NOW}]
  };
  assert.equal(api.get(past.id,1),null);
  assert.equal(api.reviewContent(history,{now:'2026-11-05T03:00:00.000Z'}).title,'Archived lesson');
});

test('Malformed authoring storage does not erase the bundled Foundation package',()=>{
  const {api,localStorage}=catalogue();
  localStorage.setItem('nihongo-content-workspace-v1','{invalid');
  assert.deepEqual(Array.from(api.list(),c=>c.id),['foundation-vowels','n5-introduction']);
  assert.equal(api.get('foundation-vowels').id,'foundation-vowels');
});
