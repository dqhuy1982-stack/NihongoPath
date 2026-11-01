import E from './lesson-engine.cjs';
import { handleKana } from './kana.js';
import n5 from '../content/n5-introduction.v1.json' with {type:'json'};
import foundation from '../content/foundation-vowels.v1.json' with {type:'json'};

export const catalog = [foundation,n5];
const headers = {'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'};
const json = (value,status=200) => new Response(JSON.stringify(value),{status,headers});
const fail = (message,status=400,extra={}) => {throw Object.assign(new Error(message),{status,...extra});};
const cleanId = value => typeof value==='string' && /^[a-zA-Z0-9:_-]{1,100}$/.test(value);
const q = (db,sql,...args) => db.prepare(sql).bind(...args);
const one = (db,sql,...args) => q(db,sql,...args).first();
const now = () => new Date().toISOString();
const copy = value => JSON.parse(JSON.stringify(value));
export function cleanProfile(input,previous=null) {
  if(!input || typeof input.name!=='string' || !input.name.trim() || input.name.length>80)fail('Tên hồ sơ chưa hợp lệ.');
  const goals=['Nền tảng','N5','N4','N3','N2','N1'];
  if(!goals.includes(input.goal))fail('Mục tiêu chưa hợp lệ.');
  const minutes=Number(input.minutes);if(!Number.isInteger(minutes)||minutes<3||minutes>240)fail('Thời lượng chưa hợp lệ.');
  const prefs=input.prefs||{};
  const notes=Array.isArray(input.notes)?input.notes.slice(0,500).map(n=>{
    if(!cleanId(n.id)||typeof n.title!=='string'||typeof n.body!=='string'||n.title.length>180||n.body.length>10000)fail('Ghi chú chưa hợp lệ.');
    const previousNote=previous?.notes?.find(old=>old.id===n.id);
    return {id:n.id,title:n.title,body:n.body,type:String(n.type||'note').slice(0,30),source:String(n.source||'').slice(0,250),target:String(n.target||'').slice(0,160),dedupe:String(n.dedupe||'').slice(0,150),at:previousNote?.at||now(),createdAt:previousNote?.createdAt||now(),updatedAt:now()};
  }):[];
  const p={id:input.id,name:input.name.trim(),goal:input.goal,minutes,role:previous?.role||'learner',purpose:String(input.purpose||'Học tập').slice(0,80),color:Number(input.color)||0,days:Array.isArray(input.days)?input.days.slice(0,7):[],deadline:String(input.deadline||'').slice(0,20),course:String(input.course||'foundation').slice(0,80),onboarded:!!input.onboarded,archived:!!input.archived,preferredName:String(input.preferredName||'').slice(0,80),
    prefs:{theme:['light','dark','system'].includes(prefs.theme)?prefs.theme:'light',jpSize:Math.min(48,Math.max(18,Number(prefs.jpSize)||28)),furigana:['always','tap','hide'].includes(prefs.furigana)?prefs.furigana:'always',romaji:!!prefs.romaji,focus:!!prefs.focus,motion:!!prefs.motion,studyPriority:['adaptive','continue','review'].includes(prefs.studyPriority)?prefs.studyPriority:'adaptive',reminders:false},
    shortcuts:Array.isArray(input.shortcuts)?input.shortcuts.filter(x=>['kana','flash','notebook','reports','review','library'].includes(x)).slice(0,3):['kana','notebook'],notes,attempts:[],flashReviews:[],writing:0,resume:null};
  p.sortOrder=previous?.sortOrder??(Number.isInteger(input.sortOrder)&&input.sortOrder>=0?input.sortOrder:0);
  p.goalHistory=Array.isArray(previous?.goalHistory)?copy(previous.goalHistory):[];
  if(!previous||previous.goal!==p.goal)p.goalHistory.push({goal:p.goal,at:now(),source:'self-selected'});
  const plan=input.roadmapPlan;
  if(plan&&['unknown','foundation','N5','N4','N3','N2','N1'].includes(plan.start)){
    const bounded=(v,min,max,fallback)=>Number.isFinite(Number(v))?Math.min(max,Math.max(min,Number(v))):fallback;
    p.roadmapPlan={start:plan.start,minutes:bounded(plan.minutes,5,240,20),days:bounded(plan.days,1,7,5),buffer:bounded(plan.buffer,0,100,20),date:/^\d{4}-\d{2}-\d{2}$/.test(plan.date)?plan.date:now().slice(0,10),hours:Object.fromEntries(['foundation','N5','N4','N3','N2','N1'].map(k=>[k,bounded(plan.hours?.[k],1,2000,100)]))};
  }
  if(previous?.role==='manager'&&p.archived)fail('Giữ hồ sơ quản lý hoạt động trong đợt thử đầu.');
  return p;
}
async function digest(value){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(value)));return [...new Uint8Array(bytes)].map(v=>v.toString(16).padStart(2,'0')).join('');}
async function learnerRow(db,owner,id){if(!cleanId(id))fail('Hồ sơ không hợp lệ.');const row=await one(db,'SELECT * FROM learners WHERE owner=? AND id=?',owner,id);if(!row)fail('Không có quyền mở hồ sơ này.',404);return row;}
function applyCommand(state,body,profile){
  const a=body.action,at=now(),s=E.active(state),u=E.unit(s);
  if(body.expected&&(s?.id!==body.expected.session||u?.id!==body.expected.unit))fail('Vị trí phiên đã thay đổi. Hãy tải lại.',409);
  // Timing is a bounded browser estimate, never evidence of proficiency.
  if(s?.status==='active')s.current.activeMs+=Math.min(600000,Math.max(0,Number(body.elapsedMs)||0));
  switch(a){
    case 'start': {
      if(!['lesson','practice','review'].includes(body.mode||'lesson'))fail('Kiểu phiên chưa hỗ trợ.');
      let content=catalog.find(c=>c.id===body.contentId);
      if(body.mode==='review'){
        const r=(body.includeEarly?state.reviews:E.due(state,at)).find(r=>catalog.some(c=>c.id===r.contentId&&c.version===r.contentVersion));
        if(!r)fail('Chưa có mẫu phù hợp để ôn.');content=catalog.find(c=>c.id===r.contentId&&c.version===r.contentVersion);
      }
      if(!content)fail('Bài chưa phát hành trong gói học thử.',404);
      E.start(state,content,{mode:body.mode||'lesson',minutes:[3,5,15].includes(body.minutes)?body.minutes:5,includeEarly:!!body.includeEarly,priority:profile.prefs.studyPriority||'adaptive',context:{place:['transit','desk','work'].includes(body.place)?body.place:'desk'},reading:profile.prefs.furigana==='always'?'show':'hide',name:profile.name,now:at});break;
    }
    case 'resume': E.resume(state,body.sessionId,at);break;
    case 'select': E.select(state,body.option,at);break;
    case 'token': E.token(state,body.token,at);break;
    case 'hint': E.hint(state,at);break;
    case 'check': E.check(state,at);break;
    case 'next': E.advance(state,{repair:typeof body.repair==='boolean'?body.repair:undefined,skipped:!!body.skipped,now:at});break;
    case 'pause': E.pause(state,at);break;
    case 'reading': if(!s||s.status!=='active')fail('Không có phiên đang học.');s.reading=s.reading==='show'?'hide':'show';break;
    case 'personal':
      if(!s||s.status!=='active'||u?.type!=='personal')fail('Chưa ở phần tự thực hành.');
      if(body.field==='name')s.personal.name=String(body.value||'').slice(0,60);
      else if(body.field==='role'&&['','学生','会社員'].includes(body.value))s.personal.role=body.value;
      else if(body.field==='country'&&['','ベトナム','日本'].includes(body.value))s.personal.country=body.value;
      else fail('Giá trị tự thực hành không hợp lệ.');break;
    default:fail('Thao tác chưa hỗ trợ.');
  }
  return state;
}
export async function handle(request,env){
 try{
  const owner=request.headers.get('oai-authenticated-user-id');
  if(!owner)return json({error:'Đăng nhập ChatGPT để mở không gian học.',signIn:'/signin-with-chatgpt?return_to=/'},401);
  if(!env.DB)return json({error:'Database chưa sẵn sàng. Tiến độ hiện tại chưa bị ghi đè.'},503);
  const db=env.DB,url=new URL(request.url),path=url.pathname.replace(/^\/api\/pilot\/?/,'').split('/').filter(Boolean),method=request.method;
  let body=null;
  if(method!=='GET'){
    const origin=request.headers.get('origin');if(!origin||origin!==url.origin)fail('Nguồn gửi yêu cầu không hợp lệ.',403);
    if(!request.headers.get('content-type')?.startsWith('application/json'))fail('Yêu cầu JSON chưa hợp lệ.',415);
    const raw=await request.text();if(raw.length>150000)fail('Dữ liệu quá lớn.',413);
    try{body=JSON.parse(raw);}catch{fail('JSON chưa hợp lệ.');}
  }
  if(path[0]==='bootstrap'&&method==='GET'){
    const rows=await q(db,"SELECT profile,revision FROM learners WHERE owner=? ORDER BY json_extract(profile,'$.sortOrder'),id",owner).all();
    const states=await q(db,'SELECT learner,state FROM learning_states WHERE owner=?',owner).all();
    return json({identity:{name:request.headers.get('oai-authenticated-user-email')||'Tài khoản đã đăng nhập'},profiles:rows.results.map(r=>({...JSON.parse(r.profile),serverRevision:r.revision})),states:Object.fromEntries(states.results.map(r=>[r.learner,JSON.parse(r.state)])),catalog,mode:'parent-managed-pilot'});
  }
  if(path[0]==='setup'&&method==='POST'){
    if(!Array.isArray(body.profiles)||body.profiles.length<1||body.profiles.length>12)fail('Danh sách khởi tạo không hợp lệ.');
    const existing=await one(db,'SELECT id FROM learners WHERE owner=? LIMIT 1',owner);if(existing)fail('Không gian đã được khởi tạo. Hãy tải lại.',409);
    const seen=new Set(),at=now();const statements=[];
    for(const [index,input] of body.profiles.entries()){
      if(!cleanId(input.id)||seen.has(input.id))fail('Mã hồ sơ trùng hoặc không hợp lệ.');seen.add(input.id);
      const p=cleanProfile({...input,notes:[],sortOrder:index});p.role=index===0?'manager':'learner';
      statements.push(q(db,'INSERT INTO learners (owner,id,profile,revision,updated_at) VALUES (?,?,?,0,?)',owner,p.id,JSON.stringify(p),at));
      statements.push(q(db,'INSERT INTO learning_states (owner,learner,state,revision,updated_at) VALUES (?,?,?,0,?)',owner,p.id,JSON.stringify(E.create(p.id)),at));
    }
    await db.batch(statements);return json({ok:true},201);
  }
  if(path[0]==='learners'&&path.length===1&&method==='POST'){
    const existing=await one(db,'SELECT id FROM learners WHERE owner=? LIMIT 1',owner);if(!existing)fail('Khởi tạo không gian trước khi thêm hồ sơ.',409);
    if(!cleanId(body.profile?.id))fail('Mã hồ sơ chưa hợp lệ.');
    const count=await one(db,'SELECT COUNT(*) AS count FROM learners WHERE owner=?',owner);
    const profile=cleanProfile({...body.profile,sortOrder:count.count}),state=E.create(profile.id),at=now();
    await db.batch([q(db,'INSERT INTO learners (owner,id,profile,revision,updated_at) VALUES (?,?,?,0,?)',owner,profile.id,JSON.stringify(profile),at),q(db,'INSERT INTO learning_states (owner,learner,state,revision,updated_at) VALUES (?,?,?,0,?)',owner,profile.id,JSON.stringify(state),at)]);
    return json({profile:{...profile,serverRevision:0},state},201);
  }
  if(path[0]==='learners'&&path[1]){
    const id=path[1],row=await learnerRow(db,owner,id);
    if(path[2]==='kana'&&path.length===3)return json(await handleKana(db,owner,id,method,body));
    if(path.length===2&&method==='PUT'){
      if(body.revision!==row.revision)fail('Hồ sơ vừa thay đổi trên thiết bị khác.',409);
      const profile=cleanProfile({...body.profile,id},JSON.parse(row.profile));
      const result=await q(db,'UPDATE learners SET profile=?,revision=revision+1,updated_at=? WHERE owner=? AND id=? AND revision=?',JSON.stringify(profile),now(),owner,id,body.revision).run();
      if(!result.meta.changes)fail('Hồ sơ vừa thay đổi. Hãy tải lại.',409);
      return json({profile:{...profile,serverRevision:row.revision+1}});
    }
    if(path[2]==='state'){
      const saved=await one(db,'SELECT * FROM learning_states WHERE owner=? AND learner=?',owner,id);
      if(!saved)fail('Không đọc được tiến độ.',503);
      const state=JSON.parse(saved.state);
      if(method==='GET')return json({state});
      if(method==='POST'){
        if(!cleanId(body.eventId))fail('Mã thao tác không hợp lệ.');
        const hash=await digest(body),receipt=await one(db,'SELECT digest FROM command_receipts WHERE owner=? AND learner=? AND event_id=?',owner,id,body.eventId);
        if(receipt){if(receipt.digest!==hash)fail('Mã thao tác đã dùng cho dữ liệu khác.',409);return json({state,duplicate:true});}
        if(!Number.isInteger(body.revision)||body.revision!==saved.revision)fail('Tiến độ đã thay đổi trên thiết bị khác.',409,{state});
        const before=state.attempts.length;applyCommand(state,body,JSON.parse(row.profile));state.revision++;
        const at=now(),sql=[q(db,'UPDATE learning_states SET state=?,revision=?,last_event=?,updated_at=? WHERE owner=? AND learner=? AND revision=?',JSON.stringify(state),state.revision,body.eventId,at,owner,id,saved.revision),q(db,'INSERT OR IGNORE INTO command_receipts (owner,learner,event_id,digest,revision,at) SELECT ?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM learning_states WHERE owner=? AND learner=? AND revision=? AND last_event=?)',owner,id,body.eventId,hash,state.revision,at,owner,id,state.revision,body.eventId)];
        for(const a of state.attempts.slice(before))sql.push(q(db,'INSERT OR IGNORE INTO learning_attempts (owner,learner,id,session,content_id,content_version,correct,payload,at) SELECT ?,?,?,?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM learning_states WHERE owner=? AND learner=? AND revision=? AND last_event=?)',owner,id,a.id,a.sessionId,a.contentId,a.contentVersion,a.correct?1:0,JSON.stringify(a),a.at,owner,id,state.revision,body.eventId));
        await db.batch(sql);
        const confirmed=await one(db,'SELECT digest FROM command_receipts WHERE owner=? AND learner=? AND event_id=?',owner,id,body.eventId);
        if(!confirmed||confirmed.digest!==hash)fail('Có thay đổi đồng thời. Hãy tải lại tiến độ.',409);
        return json({state});
      }
    }
  }
  return json({error:'Không có thao tác này.'},404);
 }catch(error){return json({error:error.status?error.message:'Chưa xử lý được yêu cầu. Dữ liệu đã lưu được giữ nguyên.',...(error.state?{state:error.state}:{})},error.status||400);}
}
