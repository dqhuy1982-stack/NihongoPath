import {test} from 'node:test';
import assert from 'node:assert/strict';
import {verifiedFamilyIdentity} from '../workers/family-identity.mjs';
import {createWorker} from '../workers/nihongopath-api.mjs';

const host='https://family-test.example';
const secret='family-secret-32-characters-minimum-0123456789';
const env={FAMILY_SYNC_KEY:secret,DB:{}};
const request=(key,overrides={})=>new Request(host+'/api/pilot/bootstrap',{
  headers:{...(key?{'x-nihongo-family-key':key}:{}),...overrides}
});

test('Household sync API fails closed without D1, secret, or pairing key',async()=>{
  assert.equal((await verifiedFamilyIdentity(request(secret),{})).error.status,503);
  assert.equal((await verifiedFamilyIdentity(request(secret),{DB:{}})).error.status,503);
  assert.equal((await verifiedFamilyIdentity(request(secret),{DB:{},FAMILY_SYNC_KEY:'short'})).error.status,503);
  assert.equal((await verifiedFamilyIdentity(request(null),env)).error.status,401);
});

test('Family secret verifies constant-size hashes and keeps a stable D1 owner',async()=>{
  const wrong=await verifiedFamilyIdentity(request('another-secret-32-characters-minimum-123456'),env);
  assert.equal(wrong.error.status,403);
  const ok=await verifiedFamilyIdentity(request(secret),env);
  assert.equal(ok.owner,'family:primary');
  assert.equal(ok.email,'Nihongo Path family');
  const rotated=await verifiedFamilyIdentity(request('rotated-family-secret-32-characters-valid'),{
    DB:{},FAMILY_SYNC_KEY:'rotated-family-secret-32-characters-valid'
  });
  assert.equal(rotated.owner,ok.owner);
});

test('Worker only passes server-verified identity, never spoofed browser identity',async()=>{
  let callCount=0;
  const worker=createWorker({pilot:async request=>{
    callCount++;
    return Response.json({
      owner:request.headers.get('oai-authenticated-user-id'),
      email:request.headers.get('oai-authenticated-user-email')
    });
  }});
  const publicRequest=new Request(host+'/index.html');
  const asset=await worker.fetch(publicRequest,{ASSETS:{fetch:async()=>new Response('public')}} ,{});
  assert.equal(await asset.text(),'public');
  const denied=await worker.fetch(request('another-secret-32-characters-minimum-123456'),env,{});
  assert.equal(denied.status,403);
  assert.equal(callCount,0);
  const accepted=await worker.fetch(request(secret,{
    'oai-authenticated-user-id':'attacker',
    'oai-authenticated-user-email':'attacker@example.test'
  }),env,{});
  assert.equal(accepted.status,200);
  assert.deepEqual(await accepted.json(),{
    owner:'family:primary',email:'Nihongo Path family'
  });
  assert.equal(callCount,1);
});
