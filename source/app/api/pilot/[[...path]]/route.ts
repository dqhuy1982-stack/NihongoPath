import { env } from 'cloudflare:workers';
import { handle } from '../../../../server/pilot.js';
export const dynamic = 'force-dynamic';
export const GET = (request: Request) => handle(request, env);
export const POST = (request: Request) => handle(request, env);
export const PUT = (request: Request) => handle(request, env);
