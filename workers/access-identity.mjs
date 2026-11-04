/**
 * Cloudflare Access identity verification for independent Workers hosting.
 * Never trust browser-supplied identity headers, an avatar choice, or the old
 * ChatGPT Sites gateway on a new public workers.dev hostname.
 */
import { createRemoteJWKSet, jwtVerify } from 'jose';

const jwksCache=new Map();
const json=(value,status)=>Response.json(value,{status,headers:{
  'cache-control':'no-store','x-content-type-options':'nosniff'
}});
const emailAllowed=(raw,email)=>raw.split(',').map(x=>x.trim().toLowerCase()).filter(Boolean).includes(email);

export function accessConfig(env) {
  const team=String(env.ACCESS_TEAM_DOMAIN||'').trim();
  const aud=String(env.ACCESS_AUD||'').trim();
  const allowed=String(env.ACCESS_ALLOWED_EMAILS||'').trim();
  if(!/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/.test(team)||
     !/^[a-zA-Z0-9_-]{8,128}$/.test(aud)||!allowed) return null;
  return {team,aud,allowed};
}

function publicKeys(team) {
  if(!jwksCache.has(team))jwksCache.set(team,createRemoteJWKSet(new URL(team+'/cdn-cgi/access/certs')));
  return jwksCache.get(team);
}

export async function verifiedIdentity(request,env,{keySet}={}) {
  const config=accessConfig(env);
  if(!config)return {error:json({error:'Authenticated backend is not configured.'},503)};
  if(!env.DB)return {error:json({error:'Learner database is not connected.'},503)};
  const token=request.headers.get('Cf-Access-Jwt-Assertion');
  if(!token)return {error:json({error:'Cloudflare Access login required.'},401)};
  try{
    const {payload}=await jwtVerify(token,keySet||publicKeys(config.team),{
      issuer:config.team,audience:config.aud,algorithms:['RS256'],clockTolerance:'5s'
    });
    const sub=typeof payload.sub==='string'?payload.sub:'';
    const email=typeof payload.email==='string'?payload.email.trim().toLowerCase():'';
    if(!sub||sub.length>256||!email||!emailAllowed(config.allowed,email))
      return {error:json({error:'This account is not authorized for Nihongo Path.'},403)};
    return {owner:'cf-access:'+sub,email};
  }catch{
    return {error:json({error:'Invalid or expired Access session.'},401)};
  }
}
