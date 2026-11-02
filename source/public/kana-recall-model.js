/* Kana recall: deterministic content & bounded learning records; no database writes. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.NPKanaRecallModel=api;
})(typeof window==='undefined'?globalThis:window,function(){
  'use strict';
  const BASIC_H='あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん';
  const BASIC_K='アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
  const ROMAJI='a i u e o ka ki ku ke ko sa shi su se so ta chi tsu te to na ni nu ne no ha hi fu he ho ma mi mu me mo ya yu yo ra ri ru re ro wa wo n'.split(' ');
  const VOICED=[
    ['がぎぐげご','ga gi gu ge go'],
    ['ざじずぜぞ','za ji zu ze zo'],
    ['だぢづでど','da ji zu de do'],
    ['ばびぶべぼ','ba bi bu be bo'],
    ['ぱぴぷぺぽ','pa pi pu pe po']
  ];
  const YOON=[
    ['き','ky'],['し','sh'],['ち','ch'],['に','ny'],['ひ','hy'],['み','my'],['り','ry'],
    ['ぎ','gy'],['じ','j'],['び','by'],['ぴ','py']
  ];
  const kanaK=txt=>[...txt].map(c=>String.fromCodePoint(c.codePointAt(0)+96)).join('');
  const card=(char,romaji,script,kind)=>Object.freeze({char,romaji,script,kind});
  function catalog(){
    const cards=[];
    for(let i=0;i<BASIC_H.length;i++){
      cards.push(card(BASIC_H[i],ROMAJI[i],'hiragana','basic'));
      cards.push(card(BASIC_K[i],ROMAJI[i],'katakana','basic'));
    }
    for(const [chars,sounds] of VOICED){
      const roman=sounds.split(' ');
      [...chars].forEach((c,i)=>{
        cards.push(card(c,roman[i],'hiragana','voiced'));
        cards.push(card(kanaK(c),roman[i],'katakana','voiced'));
      });
    }
    for(const [first,prefix] of YOON){
      ['ゃ','ゅ','ょ'].forEach((suffix,i)=>{
        const romaji=prefix+['a','u','o'][i];
        cards.push(card(first+suffix,romaji,'hiragana','yoon'));
        cards.push(card(kanaK(first+suffix),romaji,'katakana','yoon'));
      });
    }
    return cards;
  }
  const CARDS=Object.freeze(catalog());
  const CONFUSABLE_SETS=Object.freeze([
    'はまら','ひりい','ぬめねれわ','さきち','るろそ',
    'ハマラ','シツソン','クケタ','スヌ','フワウ'
  ]);
  const CONFUSABLE=new Set([...CONFUSABLE_SETS.join('')]);
  // Include the complete Ha/Ma/Ra rows in the focused deck, not just three glyphs.
  for(const ch of 'はひふへほまみむめもらりるれろハヒフヘホマミムメモラリルレロ')CONFUSABLE.add(ch);
  const GROUPS=Object.freeze({
    hiragana:c=>c.script==='hiragana'&&c.kind==='basic',
    katakana:c=>c.script==='katakana'&&c.kind==='basic',
    confusing:c=>c.kind==='basic'&&CONFUSABLE.has(c.char),
    extended:c=>c.kind!=='basic',
    all:()=>true
  });
  function cleanHistory(value){
    if(!value||typeof value!=='object'||Array.isArray(value))return {};
    const out={};
    const valid=new Set(CARDS.map(c=>c.char));
    Object.entries(value).slice(0,400).forEach(([key,raw])=>{
      if(!valid.has(key)||!raw||typeof raw!=='object')return;
      const number=n=>Number.isSafeInteger(n)&&n>=0&&n<=100000?n:0;
      out[key]={
        seen:number(raw.seen),correct:number(raw.correct),
        slow:number(raw.slow),wrong:number(raw.wrong),
        lastAt:typeof raw.lastAt==='string'?raw.lastAt.slice(0,30):'',
        dueAt:typeof raw.dueAt==='string'?raw.dueAt.slice(0,30):''
      };
    });
    return out;
  }
  function weak(record){return !!record&&(record.wrong>0||record.slow>0||record.seen>record.correct);}
  function due(record,at=Date.now()){
    return weak(record)&&(!record.dueAt||Date.parse(record.dueAt)<=at);
  }
  function pool(group,history,at=Date.now()){
    const h=cleanHistory(history),filter=GROUPS[group];
    if(group==='weak')return CARDS.filter(c=>due(h[c.char],at));
    if(!filter)throw new Error('Unknown Kana group');
    return CARDS.filter(filter);
  }
  function shuffle(items,random=Math.random){
    const a=items.slice();
    for(let i=a.length-1;i>0;i--){
      const j=Math.min(i,Math.max(0,Math.floor(random()*(i+1))));
      [a[i],a[j]]=[a[j],a[i]];
    }
    return a;
  }
  function session(group,history,random=Math.random,at=Date.now()){
    const h=cleanHistory(history),list=pool(group,h,at);
    const waiting=shuffle(list.filter(c=>due(h[c.char],at)),random);
    const unseen=shuffle(list.filter(c=>!h[c.char]),random);
    const learned=shuffle(list.filter(c=>h[c.char]&&!due(h[c.char],at)),random);
    return [...waiting,...unseen,...learned].slice(0,12);
  }
  function options(question,random=Math.random){
    const similar=CARDS.filter(c=>c!==question&&c.script===question.script&&c.kind===question.kind&&c.romaji!==question.romaji);
    const cluster=CONFUSABLE_SETS.find(chars=>chars.includes(question.char))||'';
    const grouped=similar.filter(c=>cluster.includes(c.char));
    const other=similar.filter(c=>!cluster.includes(c.char));
    const alternatives=[...shuffle(grouped,random),...shuffle(other,random)].map(c=>c.romaji);
    const chosen=[];
    for(const value of alternatives)if(!chosen.includes(value)&&chosen.length<3)chosen.push(value);
    if(chosen.length<3){
      for(const c of shuffle(CARDS.filter(c=>c.script===question.script),random)){
        if(c.romaji!==question.romaji&&!chosen.includes(c.romaji))chosen.push(c.romaji);
        if(chosen.length===3)break;
      }
    }
    return shuffle([question.romaji,...chosen],random);
  }
  function grade(history,question,answer,elapsedMs,at=Date.now()){
    if(!question||typeof question.char!=='string'||!CARDS.some(c=>c.char===question.char&&c.romaji===question.romaji))
      throw new Error('Invalid Kana card');
    const h=cleanHistory(history);
    const old=h[question.char]||{seen:0,correct:0,slow:0,wrong:0,lastAt:'',dueAt:''};
    const elapsed=Math.max(0,Math.min(600000,Math.round(Number(elapsedMs)||0)));
    const correct=answer===question.romaji;
    const quick=correct&&elapsed<=5000;
    const next={...old,
      seen:old.seen+1,correct:old.correct+Number(correct),
      slow:old.slow+Number(correct&&!quick),wrong:old.wrong+Number(!correct),
      lastAt:new Date(at).toISOString(),
      dueAt:new Date(at+(quick?24*3600000:10*60000)).toISOString()};
    // A quick answer reduces the old difficulty flag, but never fabricates mastery.
    if(quick){next.slow=Math.max(0,next.slow-1);next.wrong=Math.max(0,next.wrong-1);}
    h[question.char]=next;
    return {history:h,correct,quick,elapsedMs:elapsed};
  }
  function stats(history,at=Date.now()){
    const h=cleanHistory(history);
    return {attempted:Object.values(h).filter(x=>x.seen>0).length,
      attempts:Object.values(h).reduce((sum,x)=>sum+x.seen,0),
      waiting:CARDS.filter(c=>due(h[c.char],at)).length};
  }
  return Object.freeze({CARDS,GROUPS,catalog,cleanHistory,weak,due,pool,session,options,grade,stats});
});
