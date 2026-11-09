import {resolveArt,artGate} from './art-contract.mjs';
const escape=v=>String(v??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const manifest=await fetch('./art-manifest.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('Missing manifest');return r.json()});
const keys=['characters','scenes','environments','hero'];
let selected=manifest.characters.find(x=>x.id==='keiko')||manifest.characters[0],query='',group='all';
const groupLabel={all:'Tất cả',work:'Công việc',school:'Giáo dục',life:'Đời sống'};
function section(){const h=location.hash.slice(1);return keys.includes(h)?h:'characters'}
function asset(kind,id,variant){
 const a=resolveArt(manifest,kind,id,variant);
 return a.status==='approved'?
  '<img class="art-image" loading="lazy" src="../'+escape(a.src)+'" alt="Minh họa đã duyệt '+escape(id)+'">':
  '<div class="art-placeholder" aria-label="Ảnh chưa được duyệt">Hình minh họa đang kiểm duyệt</div>';
}
function metrics(){
 const sums=artGate(manifest).summary;
 document.querySelector('#metrics').innerHTML=Object.entries(sums).map(([k,v])=>
  '<div class="metric"><strong>'+v.approved+'/'+v.total+'</strong><small>'+
  ({characters:'Nhân vật đã duyệt',scenes:'Tình huống đã duyệt',environments:'Bối cảnh đã duyệt',hero:'Hero đã duyệt'}[k])+
  '</small><i>'+ (v.approved===v.total?'Hoàn tất':'Chưa đạt điều kiện phát hành')+'</i></div>').join('');
}
function itemCard(kind,x){
 const status=kind==='characters'?x.review.status:x.review||x.status;
 const title=kind==='characters'?x.jp:kind==='hero'?x.id:x.name||x.currentTitle||x.id;
 const description=kind==='characters'?x.display+' · '+x.role:
  kind==='scenes'?x.currentSetting:kind==='environments'?x.brief: 'Hero '+x.id;
 return '<button type="button" class="item-card '+(selected?.id===x.id?'selected':'')+'" data-select="'+escape(x.id)+'" data-type="'+kind+'"'+
 ' aria-pressed="'+(selected?.id===x.id)+'">'+asset(kind,x.id,'portrait')+
 '<span class="item-meta"><strong>'+escape(title)+'</strong><small>'+escape(description)+'</small>'+
 '<em>'+escape(status==='approved'?'Đã duyệt':'Chưa duyệt')+'</em></span></button>';
}
function detail(kind,x){
 let sub,meta=[],image;
 if(kind==='characters'){
  sub=x.display||x.jp;meta=[['Mã nhân vật',x.id],['Tên Nhật',x.jp],['Cách đọc',x.reading],
   ['Quốc tịch',x.nationality],['Nghề nghiệp',x.role],['Đơn vị (dữ liệu cũ)',x.organization],
   ['Ảnh chân dung',x.sources?.portrait],['Minh họa nửa người',x.sources?.bust]];
  if(x.artIdentity)meta.push(['Hướng nhân vật',JSON.stringify(x.artIdentity)]);
  image=asset(kind,x.id,'portrait');
 }else if(kind==='scenes'){
  sub=x.currentTitle;meta=[['Mã cảnh',x.id],['Bối cảnh hiện tại',x.currentSetting],
   ['Dàn nhân vật',x.castIds.join(', ')],['Ảnh cần tạo',x.asset],['Ảnh thu nhỏ',x.thumbnail],
   ['Story Bible mới',x.approvedStoryMapping?'Đã xác nhận':'Chưa duyệt']];
  image=asset(kind,x.id);
 }else if(kind==='environments'){
  sub=x.name;meta=[['Bối cảnh',x.id],['Mô tả',x.brief],['Asset',x.asset]];image=asset(kind,x.id);
 }else{
  sub='Hero '+x.id;meta=[['Vai trò',x.id],['Asset',x.asset],['Alt',x.alt]];image=asset(kind,x.id);
 }
 document.querySelector('#details').innerHTML='<div class="context-head"><span class="eyebrow">ART IDENTITY REVIEW</span>'+
  '<h2>'+escape(sub)+'</h2></div>'+image+
  '<div class="review-state">Trạng thái: '+escape(x.review?.status||x.review||x.status||'Chưa duyệt')+
  '. Bản ảnh chưa được đưa vào site cho học viên.</div><dl>'+
  meta.map(([k,v])=>'<dt>'+escape(k)+'</dt><dd>'+escape(v)+'</dd>').join('')+'</dl>';
}
function draw(){
 const type=section();const collections={
  characters:manifest.characters,
  scenes:manifest.scenes,
  environments:manifest.environments,
  hero:Object.entries(manifest.hero).map(([id,obj])=>({id,...obj}))
 };
 document.querySelectorAll('[data-section-link]').forEach(n=>{
  n.classList.toggle('active',n.dataset.sectionLink===type);
  n.setAttribute('aria-current',n.dataset.sectionLink===type?'page':'false')
 });
 const names={characters:'30 nhân vật',scenes:'Sáu tình huống Bài 01',environments:'Tám bối cảnh tái sử dụng',hero:'Hero desktop và mobile'};
 const desc={characters:'Dữ liệu thật từ thư viện; ảnh chân dung cần duyệt theo từng ID.',
 scenes:'Mỗi cảnh cần nhân vật đúng vai, môi trường phù hợp, nét vẽ thống nhất.',
 environments:'Bối cảnh được sử dụng lại giữa nhiều bài; không chèn chữ lên ảnh.',
 hero:'Một hướng nghệ thuật, hai bố cục khác nhau để đọc tốt trên PC và iPhone.'};
 let elements=collections[type];
 if(type==='characters')elements=elements.filter(x=>
  (group==='all'||x.group===group)&&[x.jp,x.display,x.role,x.nationality].join(' ').toLowerCase().includes(query.toLowerCase()));
 const buttons=type==='characters'?
  '<div class="filters"><input type="search" aria-label="Tìm nhân vật" placeholder="Tên, nghề nghiệp, quốc tịch..." value="'+escape(query)+'" data-search>'+
  Object.entries(groupLabel).map(([k,v])=>'<button type="button" data-group="'+k+'" class="'+(group===k?'active':'')+'" aria-pressed="'+(group===k)+'">'+escape(v)+'</button>').join('')+'</div>':'';
 const list=elements.length?'<div class="card-grid">'+elements.map(x=>itemCard(type,x)).join('')+'</div>':'<div class="empty">Không tìm thấy kết quả trong nhóm này.</div>';
 document.querySelector('#gallery').innerHTML='<div class="section-head"><div><span class="eyebrow">HORIZON V3 · APPROVAL GATE</span>'+
 '<h2>'+names[type]+'</h2><p>'+desc[type]+'</p></div>'+buttons+'</div>'+
 '<div class="explainer"><span class="warning">Lưu ý:</span> Bản này chỉ kiểm tra art direction và danh tính; không phải UI học viên và không thay thế thiết kế Bài 01.</div>'+list;
 const curr=collections[type].find(x=>x.id===selected?.id)||elements[0]||collections[type][0];
 if(curr){selected=curr;detail(type,curr)}
}
document.addEventListener('click',e=>{
 const b=e.target.closest?.('[data-select]');
 if(b){const kind=b.dataset.type,all={
  characters:manifest.characters,scenes:manifest.scenes,environments:manifest.environments,
  hero:Object.entries(manifest.hero).map(([id,obj])=>({id,...obj}))
 }[kind];selected=all.find(x=>x.id===b.dataset.select)||selected;draw();return}
 const groupButton=e.target.closest?.('[data-group]');
 if(groupButton){group=groupButton.dataset.group;draw()}
});
document.addEventListener('input',e=>{if(e.target.matches('[data-search]')){query=e.target.value;draw();const f=document.querySelector('[data-search]');f.focus();f.setSelectionRange(query.length,query.length)}});
window.addEventListener('hashchange',draw);
metrics();draw();
