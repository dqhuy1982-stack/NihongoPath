/**
 * Same-origin Cloudflare Worker gateway for the EXISTING Sites pilot API.
 *
 * Assets remain unchanged. Only /api/pilot/* can reach backend code.
 * This gateway must not be activated until Access/D1 configuration is ready.
 */
import {handle} from '../source/server/pilot.js';
import {verifiedIdentity} from './access-identity.mjs';
import {verifiedFamilyIdentity} from './family-identity.mjs';

async function identityForDeployment(request,env){
  // The household sandbox explicitly opts into secret-based authentication.
  // Other deployments keep existing cryptographic Cloudflare Access checks.
  return Object.hasOwn(env,'FAMILY_SYNC_KEY')
    ? verifiedFamilyIdentity(request,env) : verifiedIdentity(request,env);
}

const json=(value,status)=>Response.json(value,{status,headers:{
  'cache-control':'no-store','x-content-type-options':'nosniff'
}});

export function createWorker({identity=identityForDeployment,pilot=handle}={}) {
  return {
    async fetch(request,env,ctx) {
      const pathname=new URL(request.url).pathname;
      if(pathname!=='/api/pilot'&&!pathname.startsWith('/api/pilot/')){
        if(!env.ASSETS)return json({error:'Assets binding missing.'},503);
        return env.ASSETS.fetch(request);
      }
      if(!['GET','POST','PUT'].includes(request.method))
        return json({error:'Method not allowed.'},405);
      const result=await identity(request,env);
      if(result.error)return result.error;
      // Strip spoofed legacy identity headers. Only the verified deployment
      // identity (Access JWT or household capability) may reach the pilot API.
      const headers=new Headers(request.headers);
      headers.delete('oai-authenticated-user-id');
      headers.delete('oai-authenticated-user-email');
      headers.delete('oai-authenticated-user-full-name');
      headers.set('oai-authenticated-user-id',result.owner);
      headers.set('oai-authenticated-user-email',result.email);
      return pilot(new Request(request,{headers}),env);
    }
  };
}

export default createWorker();
