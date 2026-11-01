// Development-only: applies packaged migrations to this export's LOCAL emulated D1.
// Never reads credentials or connects to a hosted database.
import {mkdirSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const source=fileURLToPath(new URL('../source/',import.meta.url));
const runtime=path.join(source,'.sites-runtime');mkdirSync(runtime,{recursive:true});
const config=path.join(runtime,'handoff-local-db.json');
writeFileSync(config,JSON.stringify({name:'nihongo-handoff-local-only',compatibility_date:'2026-05-15',d1_databases:[{binding:'DB',database_name:'site-creator-d1',database_id:'00000000-0000-4000-8000-000000000000',migrations_dir:path.join(source,'drizzle')}]},null,2));
const r=spawnSync(process.execPath,['--import',path.join(source,'scripts/sites-env.mjs'),path.join(source,'node_modules/wrangler/bin/wrangler.js'),'d1','migrations','apply','DB','--local','--config',config,'--persist-to',path.join(source,'.wrangler/state')],{cwd:source,stdio:'inherit'});
if(r.error)throw r.error;process.exit(r.status??1);
