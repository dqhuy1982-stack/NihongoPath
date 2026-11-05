/** A single household capability protects D1 without a login popup on every visit.
 * Configure FAMILY_SYNC_KEY only as a Cloudflare Worker secret, never in source.
 * The public website can remain accessible; only /api/pilot/* needs the key.
 */
const json=(error,status)=>Response.json({error},{status,headers:{
  'cache-control':'no-store','x-content-type-options':'nosniff'
}});
const bytes=s=>new TextEncoder().encode(s);
async function hash(s){return new Uint8Array(await crypto.subtle.digest('SHA-256',bytes(s)));}
function equal(a,b){
  if(a.length!==b.length)return false;
  let difference=0;
  for(let i=0;i<a.length;i++)difference|=a[i]^b[i];
  return difference===0;
}
export async function verifiedFamilyIdentity(request,env){
  if(!env.DB)return {error:json('Learner database is not connected.',503)};
  const expected=env.FAMILY_SYNC_KEY;
  // Intentionally fail closed if secret was forgotten or is too short.
  if(typeof expected!=='string'||expected.length<32||expected.length>256)
    return {error:json('Family sync backend is not configured.',503)};
  const supplied=request.headers.get('x-nihongo-family-key');
  if(!supplied||supplied.length<32||supplied.length>256)
    return {error:json('Family sync key required.',401)};
  if(!equal(await hash(supplied),await hash(expected)))
    return {error:json('Family sync key is not valid.',403)};
  // Stable D1 owner: rotating the secret does not silently orphan learning data.
  return {owner:'family:primary',email:'Nihongo Path family'};
}
