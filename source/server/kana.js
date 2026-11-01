import Model from './kana-model.cjs';
const q=(db,sql,...args)=>db.prepare(sql).bind(...args);
const one=(db,sql,...args)=>q(db,sql,...args).first();
const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status});};
async function digest(value){const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(value)));return [...new Uint8Array(hash)].map(n=>n.toString(16).padStart(2,'0')).join('');}
async function snapshot(db,owner,id){
 const row=await one(db,'SELECT * FROM kana_states WHERE owner=? AND learner=?',owner,id);
 const state=row?JSON.parse(row.state):Model.defaults();
 const draft=await one(db,'SELECT strokes FROM kana_drawings WHERE owner=? AND learner=? AND char=?',owner,id,state.selected);
 const chars=await q(db,'SELECT char,COUNT(*) AS count,MAX(at) AS lastAt FROM kana_practices WHERE owner=? AND learner=? GROUP BY char ORDER BY lastAt DESC',owner,id).all();
 const latest=await one(db,'SELECT char,at,stroke_count AS strokeCount FROM kana_practices WHERE owner=? AND learner=? ORDER BY at DESC,event_id DESC LIMIT 1',owner,id);
 return {...state,revision:row?.revision||0,draft:draft?JSON.parse(draft.strokes):[],practices:{total:chars.results.reduce((n,r)=>n+r.count,0),characters:chars.results,latest}};
}
export async function handleKana(db,owner,id,method,body){
 if(method==='GET')return snapshot(db,owner,id);
 if(method!=='POST')fail('Thao tác không được hỗ trợ.',405);
 if(typeof body.eventId!=='string'||!/^[a-zA-Z0-9_-]{1,90}$/.test(body.eventId))fail('Mã thao tác chưa hợp lệ.');
 const eventId='kana:'+body.eventId,hash=await digest(body);
 const receipt=await one(db,'SELECT digest FROM command_receipts WHERE owner=? AND learner=? AND event_id=?',owner,id,eventId);
 if(receipt){if(receipt.digest!==hash)fail('Mã thao tác đã được dùng cho dữ liệu khác.',409);return {...await snapshot(db,owner,id),duplicate:true};}
 const initial=Model.defaults(),at=new Date().toISOString();
 await q(db,'INSERT OR IGNORE INTO kana_states (owner,learner,state,revision,updated_at) VALUES (?,?,?,0,?)',owner,id,JSON.stringify(initial),at).run();
 const row=await one(db,'SELECT * FROM kana_states WHERE owner=? AND learner=?',owner,id);
 if(!Number.isInteger(body.revision)||body.revision!==row.revision)fail('Phòng viết vừa thay đổi trên thiết bị khác. Tải lại tiến độ trước khi lưu.',409);
 const {state,strokes}=Model.apply(JSON.parse(row.state),body),revision=row.revision+1;
 const guard='EXISTS (SELECT 1 FROM kana_states WHERE owner=? AND learner=? AND revision=? AND last_event=?)';
 const params=[owner,id,revision,eventId];
 const commands=[q(db,'UPDATE kana_states SET state=?,revision=?,last_event=?,updated_at=? WHERE owner=? AND learner=? AND revision=?',JSON.stringify(state),revision,eventId,at,owner,id,row.revision),q(db,'INSERT OR IGNORE INTO command_receipts (owner,learner,event_id,digest,revision,at) SELECT ?,?,?,?,?,? WHERE '+guard,owner,id,eventId,hash,revision,at,...params)];
 if(strokes)commands.push(q(db,'INSERT INTO kana_drawings (owner,learner,char,strokes,updated_at) SELECT ?,?,?,?,? WHERE '+guard+' ON CONFLICT(owner,learner,char) DO UPDATE SET strokes=excluded.strokes,updated_at=excluded.updated_at',owner,id,body.char,JSON.stringify(strokes),at,...params));
 if(body.action==='confirm')commands.push(q(db,'INSERT OR IGNORE INTO kana_practices (owner,learner,event_id,char,stroke_count,evidence,at) SELECT ?,?,?,?,?,?,? WHERE '+guard,owner,id,eventId,body.char,strokes.length,'self-reported-writing',at,...params));
 await db.batch(commands);
 const confirmed=await one(db,'SELECT digest FROM command_receipts WHERE owner=? AND learner=? AND event_id=?',owner,id,eventId);
 if(!confirmed||confirmed.digest!==hash)fail('Có thay đổi đồng thời. Bản viết chưa được xác nhận; hãy tải lại tiến độ.',409);
 return snapshot(db,owner,id);
}
