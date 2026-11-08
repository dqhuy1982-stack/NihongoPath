/* HORIZON v1.48 — shared original illustrated character world. */
(function(){'use strict';
const cast=[
  {
    "id": "Aoi",
    "jp": "あおい",
    "reading": "あおい",
    "vi": "Aoi",
    "nationality": "Nhật Bản",
    "job": "Nhân viên tiếp đón",
    "organization": "Trung tâm tiếng Nhật Haruka",
    "relationship": "Đón học viên mới, hướng dẫn ban đầu",
    "voice": "Lịch sự, thân thiện",
    "note": "Dùng cách chào và hỏi tên nhẹ nhàng; người học quan sát cúi chào khi gặp lần đầu.",
    "phrases": [
      "はじめまして。",
      "しつれいですが、おなまえは？"
    ],
    "face": "#f4ceb6",
    "hair": "#3b3035",
    "shirt": "#d9c6ab",
    "accent": "#967b6a",
    "gender": "f",
    "hairStyle": "bob"
  },
  {
    "id": "Linh",
    "jp": "リン",
    "reading": "りん",
    "vi": "Linh",
    "nationality": "Việt Nam",
    "job": "Học viên",
    "organization": "Trung tâm Haruka · sinh viên Đại học Minato",
    "relationship": "Học viên mới, quen Aoi và Mina",
    "voice": "Lịch sự, rõ ràng",
    "note": "Trong lần đầu gặp, Linh tự giới thiệu tên mà không thêm さん vào tên mình.",
    "phrases": [
      "わたしは リンです。",
      "ベトナムじんです。"
    ],
    "face": "#f4c6aa",
    "hair": "#372c31",
    "shirt": "#a4b8d2",
    "accent": "#4b688a",
    "gender": "f",
    "hairStyle": "long"
  },
  {
    "id": "Mai",
    "jp": "マイ",
    "reading": "まい",
    "vi": "Mai",
    "nationality": "Việt Nam",
    "job": "Nhân viên hành chính",
    "organization": "Khách sạn Sakura",
    "relationship": "Đồng nghiệp, giới thiệu Hoa cho Yuki",
    "voice": "Lịch sự, chuyên nghiệp",
    "note": "Dùng こちらは ～さんです để giới thiệu người khác trước khi nói nghề nghiệp.",
    "phrases": [
      "こちらは ホアさんです。"
    ],
    "face": "#edc4ae",
    "hair": "#483337",
    "shirt": "#9d829d",
    "accent": "#7b5370",
    "gender": "f",
    "hairStyle": "short"
  },
  {
    "id": "Hoa",
    "jp": "ホア",
    "reading": "ほあ",
    "vi": "Hoa",
    "nationality": "Việt Nam",
    "job": "Kỹ sư",
    "organization": "Khách sạn Sakura",
    "relationship": "Nhân viên mới được Mai giới thiệu",
    "voice": "Nhẹ nhàng, lịch sự",
    "note": "Khi người khác giới thiệu mình, đáp lại lời chào lịch sự.",
    "phrases": [
      "どうぞ よろしくおねがいします。"
    ],
    "face": "#f1c6aa",
    "hair": "#352b32",
    "shirt": "#adc8d7",
    "accent": "#507b93",
    "gender": "f",
    "hairStyle": "long"
  },
  {
    "id": "Yuki",
    "jp": "ユキ",
    "reading": "ゆき",
    "vi": "Yuki",
    "nationality": "Nhật Bản",
    "job": "Nhân viên công ty",
    "organization": "Khách sạn Sakura",
    "relationship": "Đồng nghiệp của Mai, gặp Hoa và Linh",
    "voice": "Lịch sự, tò mò",
    "note": "Hỏi nghề nghiệp hoặc quốc tịch bằng cách thêm ですか ở cuối câu.",
    "phrases": [
      "ホアさんは エンジニアですか。"
    ],
    "face": "#f2cbb6",
    "hair": "#37313a",
    "shirt": "#b9c3d2",
    "accent": "#486a8c",
    "gender": "f",
    "hairStyle": "bob"
  },
  {
    "id": "Ken",
    "jp": "ケン",
    "reading": "けん",
    "vi": "Ken",
    "nationality": "Nhật Bản",
    "job": "Học viên",
    "organization": "Trung tâm tiếng Nhật Haruka",
    "relationship": "Bạn học của Hana",
    "voice": "Thân thiện, hỏi thẳng nhưng lịch sự",
    "note": "Hỏi để xác nhận, không ngại sửa lại nếu nhận thông tin chưa đúng.",
    "phrases": [
      "たなかさんは いしゃですか。"
    ],
    "face": "#edc3aa",
    "hair": "#654532",
    "shirt": "#9bb9ce",
    "accent": "#3e728b",
    "gender": "m",
    "hairStyle": "short"
  },
  {
    "id": "Hana",
    "jp": "ハナ",
    "reading": "はな",
    "vi": "Hana",
    "nationality": "Nhật Bản",
    "job": "Học viên",
    "organization": "Trung tâm tiếng Nhật Haruka",
    "relationship": "Bạn học của Ken",
    "voice": "Rõ ràng, nhẹ nhàng",
    "note": "Khi phủ định, thêm nghề đúng sau câu じゃありません giúp người nghe hiểu.",
    "phrases": [
      "いいえ、いしゃじゃありません。"
    ],
    "face": "#f2c9b4",
    "hair": "#49333d",
    "shirt": "#d2b4bd",
    "accent": "#925b6c",
    "gender": "f",
    "hairStyle": "long"
  },
  {
    "id": "Tanaka",
    "jp": "たなか",
    "reading": "たなか",
    "vi": "Tanaka",
    "nationality": "Nhật Bản",
    "job": "Nhà nghiên cứu",
    "organization": "Viện nghiên cứu địa phương",
    "relationship": "Người được Ken và Hana nhắc đến",
    "voice": "Lịch sự, điềm đạm",
    "note": "Nhân vật này không trực tiếp phát biểu trong cuộc đối thoại về nghề nghiệp.",
    "phrases": [
      "けんきゅうしゃです。"
    ],
    "face": "#f1c6ab",
    "hair": "#342a2c",
    "shirt": "#b1bbc7",
    "accent": "#4d596b",
    "gender": "m",
    "hairStyle": "short",
    "glasses": true
  },
  {
    "id": "Mina",
    "jp": "ミナ",
    "reading": "みな",
    "vi": "Mina",
    "nationality": "Việt Nam",
    "job": "Sinh viên",
    "organization": "Đại học Minato",
    "relationship": "Bạn học của Linh, gặp Aoi",
    "voice": "Lễ phép, tự tin",
    "note": "Người khác gọi ミナさん; Mina tự nói tên mình là ミナです.",
    "phrases": [
      "ミナです。",
      "はい、そうです。"
    ],
    "face": "#eec3a6",
    "hair": "#5b3b30",
    "shirt": "#c2aec9",
    "accent": "#79597f",
    "gender": "f",
    "hairStyle": "bob"
  }
];
const notes=[
  {
    "id": "first",
    "term": "はじめまして",
    "title": "はじめまして",
    "meaning": "Rất vui được gặp lần đầu.",
    "usage": "Chỉ dùng khi mới gặp một người. Thường đi cùng giới thiệu tên và よろしくおねがいします。",
    "caution": "Không dùng như lời chào mỗi khi gặp lại."
  },
  {
    "id": "yoroshiku",
    "term": "よろしくおねがいします",
    "title": "よろしくおねがいします",
    "meaning": "Mong được giúp đỡ / hợp tác tốt.",
    "usage": "Câu kết phổ biến khi tự giới thiệu hoặc mở đầu quan hệ làm việc, học tập.",
    "caution": "Không dịch từng từ; ý nghĩa phụ thuộc quan hệ và tình huống."
  },
  {
    "id": "kochira",
    "term": "こちらは",
    "title": "こちらは",
    "meaning": "Đây là… (giới thiệu người)",
    "usage": "Dùng khi giới thiệu một người với người khác, lịch sự hơn これ là đại từ chỉ vật.",
    "caution": "Không gọi người là これ."
  },
  {
    "id": "neg",
    "term": "じゃありません",
    "title": "じゃありません",
    "meaning": "Không phải là…",
    "usage": "Phủ định danh từ trong lối nói lịch sự thường ngày; ではありません trang trọng hơn.",
    "caution": "Không thêm です ở cuối sau じゃありません."
  },
  {
    "id": "yesno",
    "term": "ですか",
    "title": "ですか",
    "meaning": "… có phải không?",
    "usage": "Thêm か sau câu danh từ để hỏi xác nhận, giữ nguyên trật tự câu.",
    "caution": "Tránh chuyển cấu trúc câu hỏi theo cú pháp tiếng Anh."
  },
  {
    "id": "intro",
    "term": "わたしは",
    "title": "わたしは",
    "meaning": "Còn tôi thì…",
    "usage": "は viết ha nhưng đọc wa khi làm trợ từ chủ đề.",
    "caution": "Không cần lặp わたしは trong mọi câu nếu đã rõ chủ thể."
  },
  {
    "id": "honor",
    "term": "しつれいですが",
    "title": "しつれいですが",
    "meaning": "Xin phép hỏi / xin lỗi làm phiền…",
    "usage": "Mở đầu câu hỏi hơi riêng tư một cách lịch sự.",
    "caution": "Chú ý giọng mềm mại, không đọc như ra lệnh."
  },
  {
    "id": "name",
    "term": "おなまえは",
    "title": "おなまえは",
    "meaning": "Tên của anh/chị là…?",
    "usage": "Cách hỏi tên ngắn, lịch sự; thường sau しつれいですが。",
    "caution": "Không dùng さん khi tự xưng tên."
  },
  {
    "id": "also",
    "term": "ミナさんも",
    "title": "～も",
    "meaning": "Mina cũng…",
    "usage": "も đánh dấu rằng người/vật cùng có tính chất đã nêu.",
    "caution": "Không dùng はも với một chủ đề."
  },
  {
    "id": "org",
    "term": "さくらホテルの",
    "title": "～の",
    "meaning": "Thuộc về / liên quan đến…",
    "usage": "の nối tổ chức và nghề nghiệp: さくらホテルの エンジニア。",
    "caution": "Không phải lúc nào の cũng dịch thành từ 'của'."
  },
  {
    "id": "nation",
    "term": "ベトナムじん",
    "title": "～じん",
    "meaning": "Người Việt Nam.",
    "usage": "Thêm ～じん sau tên quốc gia để chỉ quốc tịch.",
    "caution": "Dùng tên quốc gia chính xác; không nhầm quốc tịch với nghề."
  },
  {
    "id": "selfname",
    "term": "ミナさんですね",
    "title": "～さんですね",
    "meaning": "Vậy là chị Mina đúng không ạ?",
    "usage": "Nhắc lại tên cùng ですね để xác nhận, lịch sự và tự nhiên.",
    "caution": "さん dùng khi nói về người khác, không dùng cho tên mình."
  }
];
const byId=Object.fromEntries(cast.map(c=>[c.id,c]));
const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[ch]));
/* SVG art intentionally authored as native shapes: works offline, no third-party image license. */
function svgHead(c,x,y,scale=1){
 const face=c.face||'#f1c9af',hair=c.hair||'#392f31',accent=c.accent||'#677c9c';
 const long=c.hairStyle==='long',female=c.gender!=='m';
 return '<g transform="translate('+x+' '+y+') scale('+scale+')">'+
  (long?'<path d="M-38 -16 Q-49 21 -38 55 Q-14 68 0 55 Q18 69 39 51 Q48 20 35 -21 Z" fill="'+hair+'"/>':'')+
  '<ellipse cx="0" cy="-5" rx="35" ry="42" fill="'+face+'" stroke="#b88c78" stroke-width="1.7"/>'+
  '<path d="M-35 -5 Q-46 -53 0 -57 Q43 -55 37 -4 Q20 -27 7 -29 Q-12 -15 -35 -5 Z" fill="'+hair+'"/>'+
  '<path d="M-37 -14 Q-25 -30 -8 -35 Q-12 -16 -31 -8" fill="'+hair+'"/>'+
  (c.hairStyle==='bob'?'<path d="M-35 -8 Q-41 8 -34 36 Q-22 45 -16 37 Q-25 17 -22 1 M36 -11 Q43 13 35 36 Q24 43 16 37 Q23 15 23 -1" fill="'+hair+'"/>':'')+
  '<ellipse cx="-13" cy="3" rx="3.8" ry="5" fill="#2e2933"/><ellipse cx="13" cy="3" rx="3.8" ry="5" fill="#2e2933"/>'+
  '<circle cx="-14" cy="1" r="1.4" fill="white"/><circle cx="12" cy="1" r="1.4" fill="white"/>'+
  '<path d="M-8 21 Q0 27 8 21" fill="none" stroke="#a86c69" stroke-width="2.2" stroke-linecap="round"/>'+
  '<ellipse cx="-23" cy="18" rx="8" ry="4" fill="#e6a7a0" opacity=".4"/><ellipse cx="23" cy="18" rx="8" ry="4" fill="#e6a7a0" opacity=".4"/>'+
  (c.glasses?'<g fill="none" stroke="#5d4f48" stroke-width="2"><rect x="-25" y="-5" width="22" height="18" rx="6"/><rect x="3" y="-5" width="22" height="18" rx="6"/><path d="M-3 2 L3 2"/></g>':'')+
  '</g>';
}
function svgPerson(c,x,y,scale=1,pose='stand'){
 const shirt=c.shirt||'#91a9c7',accent=c.accent||'#617b97',female=c.gender!=='m';
 const bow=pose==='bow'?-10:0,turn=pose==='talk'?7:0;
 return '<g transform="translate('+x+' '+y+') scale('+scale+') rotate('+bow+')">'+
  '<ellipse cx="0" cy="140" rx="62" ry="12" fill="#b9c9ce" opacity=".35"/>'+
  (female?
   '<path d="M-37 8 L37 8 L43 86 Q0 97 -43 86 Z" fill="'+shirt+'" stroke="'+accent+'" stroke-width="2"/>'+
   '<path d="M-34 84 L-30 136 L-13 136 L-8 88 M12 88 L17 136 L34 136 L37 84" fill="'+shirt+'" stroke="'+accent+'" stroke-width="2"/>':
   '<path d="M-38 8 L38 8 L35 89 L4 88 L0 29 L-4 88 L-35 89 Z" fill="'+shirt+'" stroke="'+accent+'" stroke-width="2"/>'+
   '<path d="M-30 83 L-27 137 L-10 137 L0 84 M10 84 L18 137 L34 137 L33 84" fill="'+accent+'" stroke="'+accent+'" stroke-width="2"/>')+
  '<path d="M-16 8 L0 42 L16 8 Z" fill="#fff8f1"/>'+
  '<path d="M-39 18 Q-56 33 -51 77 L-44 87 L-36 77 L-28 38 M39 18 Q56 32 50 77 L43 87 L36 77 L28 38" fill="'+shirt+'" stroke="'+accent+'" stroke-width="2"/>'+
  '<ellipse cx="-43" cy="86" rx="7" ry="11" fill="'+c.face+'"/><ellipse cx="43" cy="86" rx="7" ry="11" fill="'+c.face+'"/>'+
  '<ellipse cx="-22" cy="143" rx="20" ry="7" fill="#4d474c"/><ellipse cx="22" cy="143" rx="20" ry="7" fill="#4d474c"/>'+
  svgHead(c,0,-33,.89)+'</g>';
}
function svgRoom(loc){
 const window='<g><rect x="95" y="38" width="240" height="144" rx="9" fill="#bdd8e7" stroke="#d2dce5" stroke-width="10"/>'+
  '<rect x="95" y="132" width="240" height="8" fill="#dfeaf0"/><rect x="211" y="38" width="8" height="144" fill="#dfeaf0"/>'+
  '<path d="M100 126 Q135 81 183 114 Q230 65 323 105 L323 174 L100 174 Z" fill="#a7c9bc" opacity=".62"/></g>';
 const desk='<g><rect x="340" y="200" width="263" height="20" rx="5" fill="#e2ba92"/><rect x="356" y="220" width="12" height="72" fill="#e5c8aa"/><rect x="565" y="220" width="12" height="72" fill="#e5c8aa"/><rect x="458" y="165" width="75" height="39" rx="5" fill="#8fa7b8"/><rect x="490" y="204" width="12" height="9" fill="#7a91a2"/></g>';
 const shelf='<g><rect x="745" y="54" width="159" height="235" rx="8" fill="#f4f5f4" stroke="#d2d8da" stroke-width="6"/>'+
  [102,165,228].map(y=>'<path d="M751 '+y+' H899" stroke="#c6d1d5" stroke-width="6"/>').join('')+
  [755,783,810,842,870].map((x,i)=>'<rect x="'+x+'" y="70" width="15" height="30" rx="2" fill="'+['#9cbaac','#a7bed0','#dbc5ba','#c5a5b2','#b3bfda'][i]+'"/>').join('')+'</g>';
 const plant='<g><rect x="61" y="270" width="37" height="38" rx="4" fill="#c9b5a3"/><path d="M78 270 L76 206 M77 241 Q43 230 54 208 M77 230 Q100 201 115 214 M77 251 Q53 241 48 224" fill="none" stroke="#7f9a80" stroke-width="6" stroke-linecap="round"/></g>';
 const board='<g><rect x="335" y="43" width="285" height="106" rx="7" fill="#eff4f6" stroke="#d4e2e7" stroke-width="8"/><path d="M373 82 H555 M373 108 H493" stroke="#bacbd5" stroke-width="5" stroke-linecap="round"/></g>';
 const place=loc==='office'||loc==='lounge';
 return '<defs><linearGradient id="sky" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fdf7f1"/><stop offset="1" stop-color="#dce8ee"/></linearGradient>'+
  '<linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f2f3ef"/><stop offset="1" stop-color="#e5e2dd"/></linearGradient></defs>'+
  '<rect width="960" height="350" fill="url(#sky)"/>'+
  '<path d="M0 294 L960 294 V350 H0 Z" fill="url(#floor)"/>'+
  '<path d="M0 291 H960" stroke="#d3dfe4" stroke-width="6"/>'+
  window+(place?desk+shelf:board+plant)+
  '<circle cx="886" cy="31" r="24" fill="#ffe5c5" opacity=".6"/>'+
  (loc==='reception'?'<path d="M342 245 H635" stroke="#bd9d88" stroke-width="28" stroke-linecap="round"/>':'');
}
const svgCache=new Map();
function picture(scene,cast){
 if(svgCache.has(scene.id))return svgCache.get(scene.id);
 const people=(cast||[]).filter(Boolean).slice(0,3);
 const coords=people.length===2?[260,680]:[224,492,752];
 const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 350" role="img">'+
  svgRoom(scene.location||'school')+
  '<path d="M35 328 H925" stroke="#cbd0d1" stroke-width="2" opacity=".5"/>'+
  people.map((c,i)=>svgPerson(c,coords[i],155,people.length===3?1.06:1.1,i===0?'bow':'stand')).join('')+
  '<g opacity=".62"><circle cx="893" cy="44" r="29" fill="#e7bfc3"/><path d="M893 22 V66 M871 44 H915" stroke="#fff" stroke-width="3"/></g>'+
  '</svg>';
 const data='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
 svgCache.set(scene.id,data);return data;
}

function portrait(id){
 const c=byId[id];if(!c)return '';
 const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140">'+
  '<rect width="140" height="140" rx="21" fill="#e9e7e5"/>'+
  '<path d="M-2 128 Q13 88 70 83 Q126 86 144 131 V145 H0 Z" fill="'+c.shirt+'"/>'+
  svgHead(c,70,66,.86)+'</svg>';
 return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}
function character(id){return byId[id]||null}
function uniqSceneCast(scene){
 const names=(scene.dialogue||[]).map(x=>x.who);
 return [...new Set(names)].map(id=>byId[id]).filter(Boolean);
}
function altText(scene){
 const who=uniqSceneCast(scene).map(c=>c.vi).join(', ');
 return 'Minh họa gốc: '+who+' tại '+(scene.place||'bối cảnh bài học')+', đang chào hỏi và trao đổi.';
}
const termById=Object.fromEntries(notes.map(x=>[x.id,x]));
function annotate(value,selectedId){
 const raw=String(value||'');const patterns=notes.slice().sort((a,b)=>b.term.length-a.term.length);
 let out='',pos=0,highlights=0;
 while(pos<raw.length){
  let best=null,at=raw.length;
  for(const term of patterns){
   const index=raw.indexOf(term.term,pos);
   if(index>=0&&(index<at||(index===at&&term.term.length>(best?.term.length||0)))){at=index;best=term}
  }
  if(!best||highlights>=3){out+=escapeHtml(raw.slice(pos));break}
  out+=escapeHtml(raw.slice(pos,at));
  out+='<button type="button" class="n5w-term" data-n5l-note="'+best.id+'" data-note-brief="'+escapeHtml(best.meaning)+'"'+
   ' title="'+escapeHtml(best.title+': '+best.meaning)+'" aria-expanded="'+(selectedId===best.id)+'">'+
   escapeHtml(best.term)+'</button>';
  pos=at+best.term.length;highlights++;
 }
 return out;
}
function characterChip(id,extra=''){
 const c=character(id);if(!c)return '<span>'+escapeHtml(id)+'</span>';
 return '<button type="button" class="n5w-person '+extra+'" data-n5l-character="'+escapeHtml(id)+'"'+
  ' title="Xem hồ sơ '+escapeHtml(c.vi)+'"><span class="n5w-mini" style="--n5w-hair:'+c.hair+';--n5w-skin:'+c.face+'">●</span>'+
  escapeHtml(c.vi)+' <span aria-hidden="true">↗</span></button>';
}
function castPanel(scene){
 return '<div class="n5w-cast"><strong>Nhân vật trong cảnh</strong><div>'+
  uniqSceneCast(scene).map(c=>characterChip(c.id)).join('')+'</div></div>';
}
function hero(scene){
 const cast=uniqSceneCast(scene);
 return '<figure class="n5w-hero"><img src="'+picture(scene,cast)+'" alt="'+escapeHtml(altText(scene))+'" loading="lazy" decoding="async"/>'+
  '<figcaption><span>MINH HỌA NGỮ CẢNH · '+escapeHtml(scene.title)+'</span></figcaption></figure>'+
  '<div class="n5w-context"><div><span>Ở đâu?</span><strong>'+escapeHtml(scene.place||'')+'</strong></div>'+
  '<div><span>Khi nào?</span><strong>'+escapeHtml(scene.time||'')+'</strong></div>'+
  '<div><span>Ai nói với ai?</span><strong>'+escapeHtml(scene.relationship||'')+'</strong></div>'+
  '<p><strong>Bối cảnh:</strong> '+escapeHtml(scene.situation||'')+
  (scene.hint?'<br><strong>Trước khi nghe:</strong> '+escapeHtml(scene.hint):'')+'</p></div>'+castPanel(scene);
}
function noteCard(id){
 const n=termById[id];if(!n)return '';
 return '<aside class="n5w-note-detail" role="note"><div><strong>'+escapeHtml(n.title)+'</strong>'+
  '<button type="button" data-n5l-note-close="1" aria-label="Đóng giải thích">×</button></div>'+
  '<p>'+escapeHtml(n.meaning)+'</p><p><strong>Cách dùng:</strong> '+escapeHtml(n.usage)+'</p>'+
  '<p><strong>Tránh nhầm:</strong> '+escapeHtml(n.caution)+'</p></aside>';
}
function profile(id){
 const c=character(id);if(!c)return'';
 const sceneIds=window.NPN5Lesson01Scenes?.scenes?.filter(s=>(s.dialogue||[]).some(l=>l.who===id))||[];
 return '<div class="n5w-overlay" data-n5l-modal-backdrop="1">'+
  '<section class="n5w-profile" role="dialog" aria-modal="true" aria-labelledby="n5w-profile-heading" tabindex="-1">'+
  '<button class="n5w-profile-close" type="button" data-n5l-close-character="1" aria-label="Đóng hồ sơ nhân vật">×</button>'+
  '<div class="n5w-profile-head"><img src="'+portrait(id)+'" alt="Minh họa chân dung '+escapeHtml(c.vi)+'"/>'+
  '<div><small>THƯ VIỆN NHÂN VẬT · N5</small><h2 id="n5w-profile-heading">'+escapeHtml(c.jp)+'</h2>'+
  '<span>'+escapeHtml(c.reading)+' · '+escapeHtml(c.vi)+'</span></div></div>'+
  '<dl class="n5w-facts">'+
  [['Quốc tịch',c.nationality],['Nghề nghiệp',c.job],['Nơi học / làm việc',c.organization],['Vai trò',c.relationship],['Cách nói',c.voice]].map(pair=>
   '<div><dt>'+escapeHtml(pair[0])+'</dt><dd>'+escapeHtml(pair[1])+'</dd></div>').join('')+'</dl>'+
  '<p class="n5w-profile-note">'+escapeHtml(c.note)+'</p>'+
  '<h3>Câu tiêu biểu</h3><ul>'+c.phrases.map(p=>'<li lang="ja">'+escapeHtml(p)+'</li>').join('')+'</ul>'+
  '<h3>Xuất hiện trong</h3><div class="n5w-profile-scenes">'+sceneIds.map(scene=>
   '<button type="button" data-n5l-scene="'+escapeHtml(scene.id)+'">'+escapeHtml(scene.title)+' →</button>').join('')+'</div>'+
  '</section></div>';
}
window.NPN5CharacterWorld=Object.freeze({version:'v148',characters:()=>cast.map(c=>({...c})),character,portrait,hero,castPanel,characterChip,
 annotate,note:id=>termById[id]||null,noteCard,profile,altText,sceneCast:uniqSceneCast,notes:()=>notes.map(x=>({...x}))});
})();