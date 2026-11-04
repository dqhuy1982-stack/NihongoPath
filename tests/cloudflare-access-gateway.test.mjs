import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from 'jose';
import { accessConfig, verifiedIdentity } from '../workers/access-identity.mjs';
import { createWorker } from '../workers/nihongopath-api.mjs';

const host='https://nihongopath.dqhuy1982.workers.dev';
const issuer='https://family-test.cloudflareaccess.com';
const aud='0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
const settings={ACCESS_TEAM_DOMAIN:issuer,ACCESS_AUD:aud,ACCESS_ALLOWED_EMAILS:'parent@example.test'};
const url=path=>host+path;

let signer,keys;
async function keyring() {
  if(!signer) {
    signer=await generateKeyPair('RS256',{extractable:true});
    const jwk=await exportJWK(signer.publicKey);
    keys=createLocalJWKSet({keys:[{...jwk,alg:'RS256',kid:'test-key-1'}]});
  }
  return {privateKey:signer.privateKey,keys};
}
async function token(opts={}) {
  const {privateKey}=await keyring();
  let payload=new SignJWT({email:opts.email??'parent@example.test'})
    .setProtectedHeader({alg:'RS256',kid:'test-key-1'})
    .setIssuer(opts.issuer??issuer)
    .setAudience(opts.aud??aud)
    .setSubject(opts.sub??'stable-parent-id')
    .setIssuedAt()
    .setExpirationTime(opts.exp??'10m');
  return payload.sign(privateKey);
}
const env=(config={})=>({...settings,DB:{},...config});
const req=(path,authorization,extras={})=>new Request(url(path),{headers:{
  ...(authorization?{'Cf-Access-Jwt-Assertion':authorization}:{}),...extras
}});

function database() {
  const sql=new DatabaseSync(':memory:');
  for(const file of ['0000_tranquil_korg.sql','0001_many_blackheart.sql'])
    sql.exec(readFileSync(new URL('../source/drizzle/'+file,import.meta.url),'utf8'));
  const DB={prepare(text){
    let args=[];
    return {bind(...a){args=a;return this;},
      async first(){return sql.prepare(text).get(...args)||null;},
      async all(){return {results:sql.prepare(text).all(...args)};},
      async run(){const r=sql.prepare(text).run(...args);return {meta:{changes:r.changes}};}
    };
  },async batch(statements){
    sql.exec('BEGIN');
    try{const result=[];for(const s of statements)result.push(await s.run());sql.exec('COMMIT');return result;}
    catch(e){sql.exec('ROLLBACK');throw e;}
  }};
  return {DB,sql};
}

test('Access identity fails closed if team, audience, allowlist or database is missing',async()=>{
  assert.equal(accessConfig({}),null);
  assert.equal(accessConfig({...settings,ACCESS_ALLOWED_EMAILS:''}),null);
  assert.equal(accessConfig({...settings,ACCESS_TEAM_DOMAIN:'http://evil.example'}),null);
  assert.equal((await verifiedIdentity(req('/api/pilot/bootstrap'),{},{})).error.status,503);
  assert.equal((await verifiedIdentity(req('/api/pilot/bootstrap'),{...settings},{})).error.status,503);
  assert.equal((await verifiedIdentity(req('/api/pilot/bootstrap'),env(),{})).error.status,401);
});

test('Cryptographically valid signed Access JWT maps a stable sub into owner and normalizes email',async()=>{
  const {keys}=await keyring();
  const identity=await verifiedIdentity(req('/api/pilot/bootstrap',await token({email:'PARENT@EXAMPLE.TEST'})),env(),{keySet:keys});
  assert.equal(identity.owner,'cf-access:stable-parent-id');
  assert.equal(identity.email,'parent@example.test');
});

test('Access verifier rejects wrong audience, issuer, expiry, email and forged tokens',async()=>{
  const {keys}=await keyring();
  const invalid=[
    await token({aud:'another-app-audience-1234567890123456'}),
    await token({issuer:'https://wrong.cloudflareaccess.com'}),
    await token({exp:'-10m'}),
    await token({email:'outsider@example.test'}),
    await (async()=>{const parts=(await token()).split('.');parts[1]=parts[1].slice(0,10)+(parts[1][10]==='a'?'b':'a')+parts[1].slice(11);return parts.join('.');})(),
  ];
  const expected=[401,401,401,403,401];
  for(let i=0;i<invalid.length;i++){
    const result=await verifiedIdentity(req('/api/pilot/bootstrap',invalid[i]),env(),{keySet:keys});
    assert.equal(result.error?.status,expected[i],'invalid token case '+i);
  }
});

test('Static requests remain assets-only; API methods/unauthenticated requests are blocked',async()=>{
  let assets=0,pilot=0;
  const worker=createWorker({
    identity:async()=>({error:Response.json({error:'Access required'},{status:401})}),
    pilot:async()=>{pilot++;return Response.json({ok:true});}
  });
  const local={ASSETS:{fetch:async()=>{assets++;return new Response('asset');}}};
  assert.equal((await worker.fetch(req('/index.html'),local,{})).status,200);
  assert.equal((await worker.fetch(req('/assets/kana-audio/a.mp3'),local,{})).status,200);
  assert.equal((await worker.fetch(new Request(url('/api/pilot/bootstrap'),{method:'DELETE'}),local,{})).status,405);
  assert.equal((await worker.fetch(req('/api/pilot/bootstrap'),local,{})).status,401);
  assert.equal(pilot,0);
  assert.equal(assets,2);
});

test('API strips caller-supplied owner and uses only verified Access identity',async()=>{
  const worker=createWorker({
    identity:async()=>({owner:'cf-access:real-parent',email:'real@example.test'}),
    pilot:async(request)=>Response.json({
      owner:request.headers.get('oai-authenticated-user-id'),
      email:request.headers.get('oai-authenticated-user-email')
    })
  });
  const response=await worker.fetch(req('/api/pilot/bootstrap',null,{
    'oai-authenticated-user-id':'ATTACKER',
    'oai-authenticated-user-email':'attacker@example.test'
  }),{},{});
  assert.equal(response.status,200);
  assert.deepEqual(await response.json(),{
    owner:'cf-access:real-parent',email:'real@example.test'
  });
});

test('Real D1 pilot only sees JWT-verified owner, with isolation across accounts',async()=>{
  const {keys}=await keyring(),{DB}=database();
  const worker=createWorker({
    identity:(request,env)=>verifiedIdentity(request,env,{keySet:keys})
  });
  const state=env({DB});
  const legit=await token();
  const token2=await token({sub:'different-sub',email:'parent@example.test'});
  const setup=new Request(url('/api/pilot/setup'),{
    method:'POST',headers:{
      'Cf-Access-Jwt-Assertion':legit,
      'Content-Type':'application/json',
      Origin:host,
      'oai-authenticated-user-id':'forged-parent'
    },
    body:JSON.stringify({profiles:[{id:'adult',name:'Adult',goal:'N5',minutes:5,prefs:{}}]})
  });
  const created=await worker.fetch(setup,state,{});
  assert.equal(created.status,201,await created.text().catch(()=>'')); // response body consumed only on failure
  const first=await worker.fetch(req('/api/pilot/bootstrap',legit,{
    'oai-authenticated-user-id':'forged-parent'
  }),state,{});
  assert.equal((await first.json()).profiles.length,1);
  const other=await worker.fetch(req('/api/pilot/bootstrap',token2),state,{});
  assert.equal((await other.json()).profiles.length,0);
  const denied=await worker.fetch(req('/api/pilot/learners/adult/state',token2),state,{});
  assert.equal(denied.status,404);
});
