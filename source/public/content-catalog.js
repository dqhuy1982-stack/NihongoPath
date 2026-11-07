/* Version lookup shared by authoring workspace and learner player.
 * Bundled lessons are immutable; Content Studio continues to author separate N5 drafts.
 * The Foundation script may load after this adapter, so resolve it lazily.
 */
(function(){
  'use strict';
  const base=NP_LESSON_CONTENT,seeds=NP_AUTHORING_SEED.drafts;
  const read=()=>NPContentStore.read(localStorage,base,seeds);
  const copy=value=>NPContentModel.copy(value);
  const bundled=()=>[window.NP_FOUNDATION_CONTENT,window.NP_FOUNDATION_K_CONTENT,window.NP_FOUNDATION_S_CONTENT,window.NP_FOUNDATION_T_CONTENT,window.NP_N5_GREETINGS_CONTENT,window.NP_N5_DEMONSTRATIVES_CONTENT].filter(c=>c&&typeof c.id==='string'&&Number.isInteger(c.version));
  function get(id=base.id,version){
    const fixed=bundled().find(c=>c.id===id);
    if(fixed)return version!=null&&Number(version)!==fixed.version?null:copy(fixed);
    try{return NPContentModel.get(read(),base,id,version);}
    catch{return id===base.id&&(version==null||Number(version)===base.version)?copy(base):null;}
  }
  function list(){
    let authored;
    try{authored=NPContentModel.catalog(read(),base);}
    catch{authored=[copy(base)];}
    const fixed=bundled();
    return [...fixed.map(copy),...authored.filter(c=>!fixed.some(f=>f.id===c.id))];
  }
  function reviewContent(learning,{now=new Date().toISOString(),includeEarly=false}={}){
    if(!learning||!Array.isArray(learning.sessions)||!Array.isArray(learning.reviews))return null;
    const pending=learning.sessions.filter(s=>s.mode==='review'&&s.status!=='completed')
      .sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt))[0];
    if(pending)return copy(pending.definition);
    const pool=learning.reviews.filter(r=>includeEarly||r.dueAt<=now)
      .slice().sort((a,b)=>a.dueAt.localeCompare(b.dueAt));
    for(const r of pool){
      const found=get(r.contentId,r.contentVersion)||
        learning.sessions.find(s=>s.contentId===r.contentId&&s.contentVersion===r.contentVersion)?.definition;
      if(found)return copy(found);
    }
    return null;
  }
  window.NPContentCatalog={base,seeds,read,get,list,
    draft(id){try{return copy(read().drafts.find(d=>d.id===id)||null);}catch{return null;}},
    reviewContent
  };
})();
