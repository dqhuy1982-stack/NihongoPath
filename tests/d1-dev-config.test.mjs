import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';

const load = pathname => readFileSync(new URL('../'+pathname,import.meta.url),'utf8');
const jsonc = pathname => JSON.parse(load(pathname).split(/\r?\n/).filter(line=>!line.trim().startsWith('//')).join('\n'));
const DB_ID='8504e0d8-c7a5-490d-ab40-a7590cd9af9d';

test('One existing Worker and D1 database are the deployment source of truth',()=>{
  const main=jsonc('wrangler.jsonc');
  assert.equal(main.name,'nihongopath','keep the original live Worker');
  assert.equal(main.main,'./workers/nihongopath-api.mjs','single verified API gateway');
  assert.equal(main.assets.directory,'./dist/site');
  assert.equal(main.assets.binding,'ASSETS');
  assert.deepEqual(main.assets.run_worker_first,['/api/*']);
  assert.equal(main.d1_databases?.length,1,'no additional database');
  const binding=main.d1_databases[0];
  assert.equal(binding.binding,'DB');
  assert.equal(binding.database_name,'nihongopath-dev');
  assert.equal(binding.database_id,DB_ID);
  assert.equal(binding.migrations_dir,'source/drizzle');
  assert.ok(!main.vars?.FAMILY_SYNC_KEY,'never put a family key into source-controlled vars');
  assert.ok(!main.vars?.ACCESS_AUD,'no invented Cloudflare Access audience');
  assert.ok(!main.routes,'keep existing workers.dev hostname');
  assert.ok(main.previews && Object.keys(main.previews).length===0);
});

function localDatabase(){
  const db=new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON;');
  for(const name of ['0000_tranquil_korg.sql','0001_many_blackheart.sql']){
    db.exec(load('source/drizzle/'+name));
  }
  return db;
}
const execute=(db,query,...args)=>db.prepare(query).run(...args);

test('Original owner-scoped pilot tables remain available before proposed family schema',()=>{
  const db=localDatabase();
  const expected=['learners','learning_states','learning_attempts','command_receipts','kana_states','kana_drawings','kana_practices'];
  const names=db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(x=>x.name);
  for(const table of expected)assert.ok(names.includes(table),'Missing pilot table '+table);
  execute(db,'INSERT INTO learners (owner,id,profile,revision,updated_at) VALUES (?,?,?,?,?)',
    'cf-access:parent-1','adult','{}',0,'2026-11-04');
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM learners').get().n,1);
  db.close();
});

test('Proposed family schema is additive, constrained and does not change learning records',()=>{
  const db=localDatabase();
  execute(db,'INSERT INTO learners (owner,id,profile,revision,updated_at) VALUES (?,?,?,?,?)',
    'cf-access:parent-1','adult','{}',0,'2026-11-04');
  execute(db,'INSERT INTO learning_states (owner,learner,state,revision,updated_at) VALUES (?,?,?,?,?)',
    'cf-access:parent-1','adult','{"sessions":[]}',0,'2026-11-04');
  const original=db.prepare('SELECT state FROM learning_states WHERE owner=? AND learner=?')
    .get('cf-access:parent-1','adult').state;
  db.exec(load('docs/schema/family-accounts-v1.proposed.sql'));
  execute(db,'INSERT INTO family_accounts (account_id,identity_provider,verified_subject,created_at) VALUES (?,?,?,?)',
    'cf-access:parent-1','cloudflare-access','parent-1','2026-11-04');
  execute(db,'INSERT INTO families VALUES (?,?,?,?)',
    'family-1','Nihongo family','cf-access:parent-1','2026-11-04');
  execute(db,'INSERT INTO family_memberships VALUES (?,?,?,?)',
    'family-1','cf-access:parent-1','manager','2026-11-04');
  execute(db,'INSERT INTO family_learner_links VALUES (?,?,?,?)',
    'family-1','cf-access:parent-1','adult','2026-11-04');
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM family_learner_links').get().n,1);
  assert.equal(db.prepare('SELECT state FROM learning_states WHERE learner=?').get('adult').state,original);
  assert.throws(()=>execute(db,'INSERT INTO family_memberships VALUES (?,?,?,?)',
    'family-1','cf-access:parent-1','superuser','2026-11-04'));
  assert.throws(()=>execute(db,'INSERT INTO family_learner_links VALUES (?,?,?,?)',
    'family-1','cf-access:parent-1','non-existent','2026-11-04'));
  assert.throws(()=>execute(db,'INSERT INTO family_accounts VALUES (?,?,?,?)',
    'cf-access:other','cloudflare-access','parent-1','2026-11-04'));
  assert.deepEqual(db.prepare('PRAGMA foreign_key_check').all(),[]);
  db.close();
});
