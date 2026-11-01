import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { handle, catalog } from '../server/pilot.js';

function database(){
 const sql=new DatabaseSync(':memory:');sql.exec(readFileSync(new URL('../drizzle/0000_tranquil_korg.sql',import.meta.url),'utf8'));sql.exec(readFileSync(new URL('../drizzle/0001_many_blackheart.sql',import.meta.url),'utf8'));
 const DB={prepare(text){let args=[];return {bind(...a){args=a;return this;},async first(){return sql.prepare(text).get(...args)||null;},async all(){return {results:sql.prepare(text).all(...args)};},async run(){const r=sql.prepare(text).run(...args);return {meta:{changes:r.changes}};}};},async batch(statements){sql.exec('BEGIN');try{const r=[];for(const s of statements)r.push(await s.run());sql.exec('COMMIT');return r;}catch(e){sql.exec('ROLLBACK');throw e;}}};return {DB,sql};
}
const profile={id:'demo-a',name:'Learner A',goal:'N5',minutes:5,prefs:{},onboarded:true};
async function call(env,path='',method='GET',body,owner='parent-a',origin='https://example.test'){
 const headers={'oai-authenticated-user-id':owner,'oai-authenticated-user-email':'parent@example.test'};if(!owner)delete headers['oai-authenticated-user-id'];if(body){headers['content-type']='application/json';if(origin)headers.origin=origin;}
 const response=await handle(new Request('https://example.test/api/pilot/'+path,{method,headers,body:body?JSON.stringify(body):undefined}),env);return {status:response.status,...await response.json()};
}
async function setup(env){assert.equal((await call(env,'setup','POST',{profiles:[profile]})).status,201);}
test('identity, CSRF and account boundaries are enforced on server',async()=>{
 const env=database();assert.equal((await call(env,'bootstrap','GET',null,'')).status,401);
 assert.equal((await call(env,'setup','POST',{profiles:[profile]},'parent-a','https://evil.test')).status,403);
 assert.equal((await call(env,'setup','POST',{profiles:[profile]},'parent-a',null)).status,403);
 await setup(env);const other=await call(env,'bootstrap','GET',null,'parent-b');assert.equal(other.profiles.length,0);
 assert.equal((await call(env,'learners/demo-a/state','GET',null,'parent-b')).status,404);
});
test('commands persist checkpoints, compute scores on server and deduplicate retries',async()=>{
 const env=database();await setup(env);
 const start={action:'start',contentId:'foundation-vowels',minutes:3,revision:0,eventId:'start-1'};
 let result=await call(env,'learners/demo-a/state','POST',start);assert.equal(result.status,200);assert.equal(result.state.revision,1);
 const retry=await call(env,'learners/demo-a/state','POST',start);assert.equal(retry.duplicate,true);assert.equal(retry.state.sessions.length,1);
 assert.equal((await call(env,'learners/demo-a/state','POST',{...start,contentId:'n5-introduction'})).status,409);
 for(let i=0;i<3;i++)result=await call(env,'learners/demo-a/state','POST',{action:'next',revision:result.state.revision,eventId:'next-'+i});
 result=await call(env,'learners/demo-a/state','POST',{action:'select',option:'o',revision:result.state.revision,eventId:'select-1'});
 const check={action:'check',revision:result.state.revision,eventId:'check-1',correct:true};
 result=await call(env,'learners/demo-a/state','POST',check);assert.equal(result.state.attempts[0].correct,false,'client correct=true must be ignored');
 assert.equal(result.state.reviews.length,1);
 const again=await call(env,'learners/demo-a/state','POST',check);assert.equal(again.duplicate,true);assert.equal(again.state.attempts.length,1);
 assert.equal(env.sql.prepare('SELECT count(*) AS n FROM learning_attempts').get().n,1);
 const loaded=await call(env,'learners/demo-a/state');assert.deepEqual(loaded.state,result.state);
 assert.equal((await call(env,'learners/demo-a/state','POST',{action:'hint',revision:0,eventId:'stale'})).status,409);
});
test('profile edits have revision checks, cannot forge role or reset learning; learners are data',async()=>{
 const env=database();await setup(env);
 const p={...profile,role:'editor',goal:'Nền tảng',notes:[{id:'note-1',title:'Chữ mới',body:'あ → a'}],roadmapPlan:{start:'foundation',minutes:20,days:5,buffer:20,date:'2026-11-01',hours:{foundation:30}}};const edit=await call(env,'learners/demo-a','PUT',{profile:p,revision:0});assert.equal(edit.profile.role,'manager');
 assert.ok(!Number.isNaN(Date.parse(edit.profile.notes[0].at)));assert.equal(edit.profile.goalHistory.length,2);assert.equal(edit.profile.roadmapPlan.minutes,20);
 assert.equal((await call(env,'learners/demo-a','PUT',{profile:p,revision:0})).status,409);
 const added=await call(env,'learners','POST',{profile:{...profile,id:'child',name:'Con',role:'manager'}});assert.equal(added.status,201);assert.equal(added.profile.role,'learner');
 assert.equal(added.state.attempts.length,0);assert.equal((await call(env,'bootstrap')).profiles.length,2);
});
test('foundation and N5 complete a server-owned learning loop with review records',async()=>{
 for(const content of catalog){const env=database();await setup(env);let r=await call(env,'learners/demo-a/state','POST',{action:'start',contentId:content.id,minutes:5,revision:0,eventId:'start'});let i=0;
 while(r.state.sessions[0].status!=='completed'&&i<80){const state=r.state,s=state.sessions[0],u=s.units[s.index];let cmd={action:'next',repair:false};if(u.type==='question'&&!s.current.feedbackId){const q=s.definition.questions.find(q=>q.id===u.questionId);cmd=s.current.selected?{action:'check'}:{action:'select',option:q.answer};}r=await call(env,'learners/demo-a/state','POST',{...cmd,revision:state.revision,eventId:'step-'+i++});assert.equal(r.status,200,JSON.stringify(r));}
 assert.equal(r.state.sessions[0].status,'completed');assert.ok(r.state.attempts.length>=2);assert.ok(r.state.reviews.length>=2);assert.ok(r.state.attempts.every(a=>a.correct));}
});
test('Kana vector drafts survive reload, stay separate per learner and cannot be read by another account',async()=>{
 const env=database();await setup(env);
 const initial=await call(env,'learners/demo-a/kana');assert.equal(initial.revision,0);assert.equal(initial.practices.total,0);
 const strokes=[[[.1,.2],[.3,.4],[.6,.6]]];
 let r=await call(env,'learners/demo-a/kana','POST',{action:'draft',char:'あ',strokes,eventId:'draft-1',revision:0});assert.equal(r.status,200);assert.deepEqual(r.draft,strokes);
 assert.deepEqual((await call(env,'learners/demo-a/kana')).draft,strokes);
 r=await call(env,'learners/demo-a/kana','POST',{action:'select',char:'ア',eventId:'select-kata',revision:r.revision});assert.equal(r.script,'katakana');assert.deepEqual(r.draft,[]);
 r=await call(env,'learners/demo-a/kana','POST',{action:'select',char:'あ',eventId:'select-hira',revision:r.revision});assert.deepEqual(r.draft,strokes);
 assert.equal((await call(env,'learners/demo-a/kana','GET',null,'parent-b')).status,404);
 await call(env,'learners','POST',{profile:{...profile,id:'child',name:'Con'}});assert.deepEqual((await call(env,'learners/child/kana')).draft,[]);
});
test('Kana confirmations are self-reported, idempotent, revision checked and reject blank or invalid drawings',async()=>{
 const env=database();await setup(env);
 assert.equal((await call(env,'learners/demo-a/kana','POST',{action:'confirm',char:'あ',strokes:[],eventId:'empty',revision:0})).status,400);
 assert.equal((await call(env,'learners/demo-a/kana','POST',{action:'draft',char:'あ',strokes:[[[2,.2]]],eventId:'outside',revision:0})).status,400);
 assert.equal((await call(env,'learners/demo-a/kana','POST',{action:'select',char:'漢',eventId:'unsupported',revision:0})).status,400);
 const cmd={action:'confirm',char:'あ',strokes:[[[.1,.2],[.4,.4]]],eventId:'confirm-1',revision:0,correct:true};
 const r=await call(env,'learners/demo-a/kana','POST',cmd);assert.equal(r.status,200);assert.equal(r.practices.total,1);
 const duplicate=await call(env,'learners/demo-a/kana','POST',cmd);assert.equal(duplicate.duplicate,true);assert.equal(duplicate.practices.total,1);
 assert.equal((await call(env,'learners/demo-a/kana','POST',{...cmd,strokes:[[[.2,.2],[.4,.4]]]})).status,409);
 assert.equal((await call(env,'learners/demo-a/kana','POST',{action:'speed',speed:1.5,eventId:'stale',revision:0})).status,409);
 assert.equal(env.sql.prepare('SELECT evidence FROM kana_practices').get().evidence,'self-reported-writing');
 assert.equal(env.sql.prepare('SELECT COUNT(*) AS n FROM learning_attempts').get().n,0);
});
