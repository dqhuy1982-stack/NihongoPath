/* Kana Studio SVG display helpers. AnimCJK source remains immutable.
   Some strokes contain alternate skeleton branches positioned outside 1024x1024.
   They represent auxiliary paths, not extra pen strokes. Draw ONE primary path
   per stroke; use authored curved glyph outlines as the muted reference. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.NPKanaStrokeView=api;
})(typeof window==='undefined'?globalThis:window,function(){
  'use strict';
  const LIMIT=1024;
  const coord=/([ML])\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g;
  function points(path){
    if(typeof path!=='string'||!/^[ML0-9.\s-]+$/.test(path))return [];
    const found=[...path.matchAll(coord)];
    if(!found.length||found[0][1]!=='M')return [];
    const result=found.map(x=>({x:Number(x[2]),y:Number(x[3])}));
    if(result.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y)))return [];
    return result;
  }
  const inBounds=path=>{const p=points(path);return p.length>1&&p.every(x=>x.x>=0&&x.y>=0&&x.x<=LIMIT&&x.y<=LIMIT);};
  function primary(stroke){
    if(!Array.isArray(stroke)||!stroke.length)throw Error('Missing Kana stroke path');
    // First source path is the main trajectory for each stroke. Ignore other
    // branches rather than rendering huge off-canvas construction lines.
    if(!inBounds(stroke[0]))throw Error('Invalid primary Kana stroke path');
    return stroke[0];
  }
  const fmt=n=>String(Math.round(n*100)/100);
  const clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
  function smooth(path){
    const p=points(path);
    if(p.length<3)return path; // Preserve the geometry of straight strokes.
    let out='M'+fmt(p[0].x)+' '+fmt(p[0].y);
    for(let i=0;i<p.length-1;i++){
      const a=p[i],b=p[i+1],before=p[Math.max(0,i-1)],after=p[Math.min(p.length-1,i+2)];
      const len=Math.hypot(b.x-a.x,b.y-a.y);
      if(len<0.5){out+='L'+fmt(b.x)+' '+fmt(b.y);continue;}
      // Restrict Catmull–Rom-like handles to 22% of segment length,
      // retaining source nodes/direction without dramatic overshoot.
      const cap=len*.22;
      const tangent=(dx,dy)=>{
        const n=Math.hypot(dx,dy)||1,k=Math.min(.12,cap/n);
        return [dx*k,dy*k];
      };
      const [ax,ay]=tangent(b.x-before.x,b.y-before.y);
      const [bx,by]=tangent(after.x-a.x,after.y-a.y);
      const x1=clamp(a.x+ax,0,LIMIT),y1=clamp(a.y+ay,0,LIMIT);
      const x2=clamp(b.x-bx,0,LIMIT),y2=clamp(b.y-by,0,LIMIT);
      out+='C'+fmt(x1)+' '+fmt(y1)+' '+fmt(x2)+' '+fmt(y2)+' '+fmt(b.x)+' '+fmt(b.y);
    }
    return out;
  }
  function displayPaths(record){
    if(!record||!Array.isArray(record.strokes))throw Error('Invalid Kana record');
    return record.strokes.map(stroke=>smooth(primary(stroke)));
  }
  function glyphOutlines(record){
    if(!record||!Array.isArray(record.outlines))return [];
    // The source outlines are authentic Bezier contours of the printed glyph,
    // NOT the incorrectly extended auxiliary writing-guide paths.
    return record.outlines.filter(s=>typeof s==='string'&&/^[MLCQZ0-9.\s-]+$/.test(s));
  }
  return Object.freeze({points,inBounds,primary,smooth,displayPaths,glyphOutlines});
});
