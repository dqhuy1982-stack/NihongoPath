/* HORIZON · FOUNDATION curriculum v33. Source of truth for symbol decks and contextual words.
   No user progress stored here. Romaji is a temporary reading cue, not Vietnamese meaning. */
(function(){
'use strict';
const rows=[
 ['a','Nguyên âm','あいうえお','アイウエオ','a i u e o'],
 ['k','Hàng K','かきくけこ','カキクケコ','ka ki ku ke ko'],
 ['s','Hàng S','さしすせそ','サシスセソ','sa shi su se so'],
 ['t','Hàng T','たちつてと','タチツテト','ta chi tsu te to'],
 ['n','Hàng N','なにぬねの','ナニヌネノ','na ni nu ne no'],
 ['h','Hàng H','はひふへほ','ハヒフヘホ','ha hi fu he ho'],
 ['m','Hàng M','まみむめも','マミムメモ','ma mi mu me mo'],
 ['y','Hàng Y','やゆよ','ヤユヨ','ya yu yo'],
 ['r','Hàng R','らりるれろ','ラリルレロ','ra ri ru re ro'],
 ['w','Hàng W + ん','わをん','ワヲン','wa wo n']
];
const deck=[],add=(script,stage,group,glyph,read,note='')=>{
 deck.push(Object.freeze({id:script+'-'+Array.from(glyph).map(x=>x.codePointAt(0).toString(16)).join('-'),script,stage,group,glyph,read,note}));
};
for(const [group,label,hir,kata,rom] of rows){
 const hs=Array.from(hir),ks=Array.from(kata),rs=rom.split(' ');
 if(hs.length!==ks.length||hs.length!==rs.length)throw Error('Kana row invalid: '+group);
 hs.forEach((ch,i)=>{
  add('hira','basic',group,ch,rs[i],group==='w'&&rs[i]==='wo'?'を thường là trợ từ đọc gần như “o”.':group==='w'&&rs[i]==='n'?'ん là âm mũi, thay đổi theo âm đứng sau.':'');
  add('kata','basic',group,ks[i],rs[i],group==='w'&&rs[i]==='wo'?'ヲ ít dùng trong từ Katakana hiện đại.':'');
 });
}
const voiced=[
 ['g','がぎぐげご','ガギグゲゴ','ga gi gu ge go'],
 ['z','ざじずぜぞ','ザジズゼゾ','za ji zu ze zo'],
 ['d','だぢづでど','ダヂヅデド','da ji zu de do'],
 ['b','ばびぶべぼ','バビブベボ','ba bi bu be bo'],
 ['p','ぱぴぷぺぽ','パピプペポ','pa pi pu pe po']
];
for(const [group,hir,kata,rom] of voiced){
 Array.from(hir).forEach((ch,i)=>{
  const r=rom.split(' ')[i];
  const note=['ぢ','づ','ヂ','ヅ'].includes(ch)?'Chữ này có âm gần giống じ/ず tương ứng; cách viết phụ thuộc từ. Tránh đoán chữ chỉ bằng âm.':group==='p'?'Dấu tròn ゜ tạo âm p ở hàng H.':'Dấu ゛ làm thay đổi phụ âm đầu.';
  add('hira','voiced',group,ch,r,note);
  add('kata','voiced',group,Array.from(kata)[i],r,note);
 });
}
const blends=[
 ['ky','き','キ','kya kyu kyo'],
 ['sh','し','シ','sha shu sho'],
 ['ch','ち','チ','cha chu cho'],
 ['ny','に','ニ','nya nyu nyo'],
 ['hy','ひ','ヒ','hya hyu hyo'],
 ['my','み','ミ','mya myu myo'],
 ['ry','り','リ','rya ryu ryo'],
 ['gy','ぎ','ギ','gya gyu gyo'],
 ['j','じ','ジ','ja ju jo'],
 ['by','び','ビ','bya byu byo'],
 ['py','ぴ','ピ','pya pyu pyo']
];
for(const [group,hir,kata,rom] of blends){
 rom.split(' ').forEach((r,i)=>{
  add('hira','yoon',group,hir+['ゃ','ゅ','ょ'][i],r,'Chữ ゃ/ゅ/ょ nhỏ ghép với chữ kết thúc bằng âm i, đọc thành một nhịp.');
  add('kata','yoon',group,kata+['ャ','ュ','ョ'][i],r,'ャ/ュ/ョ nhỏ ghép thành một nhịp, không tách thành hai âm.');
 });
}
/* Context decks are real vocabulary. These — unlike isolated kana symbols — can be translated VI <-> JP.
   No audio or handwriting grading is asserted. */
const words=[
 ['ねこ','con mèo','neko','hira','basic','Ví dụ đơn giản để ghép các chữ đã học.'],
 ['いぬ','con chó','inu','hira','basic','Đọc liền hai chữ, không dừng giữa từ.'],
 ['やま','ngọn núi','yama','hira','basic','Luyện hàng Y và M.'],
 ['みず','nước','mizu','hira','voiced','ず chứa dấu dakuten.'],
 ['かさ','ô / dù','kasa','hira','basic','Nhận diện hàng K và S.'],
 ['すし','sushi','sushi','hira','basic','し đọc shi.'],
 ['くるま','ô tô','kuruma','hira','basic','Luyện hàng K, R, M.'],
 ['ほん','quyển sách','hon','hira','basic','ん ở cuối từ là âm mũi.'],
 ['がっこう','trường học','gakkō','hira','small','っ nhỏ biểu thị ngắt/nhân đôi phụ âm tiếp theo.'],
 ['きって','tem thư','kitte','hira','small','っ nhỏ đứng trước て; phân biệt với つ thường.'],
 ['きょう','hôm nay','kyō','hira','yoon','きょ là âm ghép; う kéo dài âm trước.'],
 ['りょこう','du lịch','ryokō','hira','yoon','りょ là âm ghép.'],
 ['コーヒー','cà phê','kōhī','kata','small','Dấu ー kéo dài nguyên âm đứng trước.'],
 ['ケーキ','bánh kem','kēki','kata','small','Nhận ra dấu kéo dài ー.'],
 ['シャツ','áo sơ mi','shatsu','kata','yoon','シャ là âm ghép Katakana.'],
 ['ベッド','giường','beddo','kata','small','ッ nhỏ thể hiện sự ngắt âm.'],
 ['テレビ','ti vi','terebi','kata','voiced','ビ chứa dấu dakuten.'],
 ['バス','xe buýt','basu','kata','voiced','バ chứa dấu dakuten.'],
 ['ホテル','khách sạn','hoteru','kata','basic','Từ Katakana thường dùng trong đời sống.'],
 ['タクシー','taxi','takushī','kata','small','Dấu ー kéo dài nguyên âm trong シー.'],
 ['ファイル','tệp tin','fairu','kata','small','ァ nhỏ đi cùng フ để biểu diễn âm fa.']
].map(([glyph,vi,read,script,stage,note],i)=>Object.freeze({id:'word-'+i,glyph,vi,read,script,stage,note,group:stage}));
const modules=[
 {id:'hiragana',title:'01 · Hiragana',subtitle:'46 chữ cơ bản · nhận mặt & đọc',script:'hira',stage:'basic',groups:rows.map(([id,title])=>({id,title})),note:'Học theo từng hàng 3–5 chữ; mở rộng dần, không bắt học hết 46 chữ trong một lần.'},
 {id:'katakana',title:'02 · Katakana',subtitle:'46 chữ cơ bản · nhận dạng chữ góc cạnh',script:'kata',stage:'basic',groups:rows.map(([id,title])=>({id,title})),note:'Âm gần giống Hiragana nhưng cách viết khác. Dùng từ mượn để ghi nhớ trong ngữ cảnh.'},
 {id:'dakuten',title:'03 · Âm đục & bán đục',subtitle:'が/ガ · ざ/ザ · だ/ダ · ば/バ · ぱ/パ',script:'both',stage:'voiced',groups:[{id:'g',title:'G'},{id:'z',title:'Z'},{id:'d',title:'D'},{id:'b',title:'B'},{id:'p',title:'P'}],note:'Học dấu ゛ trước, dấu ゜ sau. じ/ぢ và ず/づ phát âm gần nhau; không dùng riêng âm để ép chọn một kiểu chữ.'},
 {id:'yoon',title:'04 · Âm ghép',subtitle:'きゃ/キャ · しゅ/シュ · ちょ/チョ…',script:'both',stage:'yoon',groups:blends.map(([id])=>({id,title:id.toUpperCase()})),note:'Chữ ゃ/ゅ/ょ (ャ/ュ/ョ) phải nhỏ. Âm ghép được đọc như một nhịp; luyện nhận diện cả cụm.'},
 {id:'small',title:'05 · Chữ nhỏ & âm dài',subtitle:'っ/ッ · ゃゅょ/ャュョ · ー · ァ…',script:'words',stage:'small',groups:[{id:'pause',title:'っ / ッ'},{id:'length',title:'Âm dài ー'},{id:'vowels',title:'Nguyên âm nhỏ'}],note:'Chữ nhỏ và dấu kéo dài không có cách đọc độc lập như Kana thường. Học qua từ và ví dụ đối chiếu.'},
 {id:'mixed',title:'06 · Tổng ôn Kana',subtitle:'Hiragana + Katakana + âm đặc biệt',script:'both',stage:'mixed',groups:[{id:'mixed',title:'Tổng hợp'}],note:'Trộn chữ và dạng bài sau khi đã luyện riêng; kết quả bài kiểm tra chỉ phản ánh đúng lượt làm.'}
];
const smallSamples=[
 {id:'pause',title:'っ / ッ — ngắt âm',examples:[['きて','kite','Hãy đến'],['きって','kitte','Tem thư'],['ベッド','beddo','Giường']]},
 {id:'length',title:'ー — kéo dài nguyên âm',examples:[['コヒ','kohi','Không phải cách viết chuẩn của コーヒー'],['コーヒー','kōhī','Cà phê'],['ケーキ','kēki','Bánh kem']]},
 {id:'vowels',title:'ゃゅょ, ァィゥェォ — chữ nhỏ',examples:[['きや','kiya','Hai nhịp'],['きゃ','kya','Một nhịp âm ghép'],['ファイル','fairu','Tệp tin; フ + ァ thành fa']]}
];
const byId=Object.fromEntries(modules.map(m=>[m.id,m]));
const take=(id,group='all',script='both')=>{
 const m=byId[id];if(!m)return [];
 if(id==='small')return words.filter(w=>w.stage==='small');
 if(id==='mixed')return deck.filter(x=>script==='both'||x.script===script).concat(words.filter(w=>script==='both'||w.script===script));
 return deck.filter(x=>x.stage===m.stage&&(m.script==='both'||x.script===m.script)&&(group==='all'||x.group===group)&&(script==='both'||x.script===script));
};
const contextual=(id,script='both')=>words.filter(w=>(script==='both'||w.script===script)&&(id==='mixed'?true:id==='small'?w.stage==='small':id==='hiragana'?w.script==='hira':id==='katakana'?w.script==='kata':w.stage===byId[id]?.stage));
const counts={hiragana:deck.filter(x=>x.stage==='basic'&&x.script==='hira').length,katakana:deck.filter(x=>x.stage==='basic'&&x.script==='kata').length,dakuten:deck.filter(x=>x.stage==='voiced').length,yoon:deck.filter(x=>x.stage==='yoon').length,small:words.filter(x=>x.stage==='small').length};
if(counts.hiragana!==46||counts.katakana!==46||counts.dakuten!==50||counts.yoon!==66)throw Error('Foundation curriculum counts are inconsistent');
window.NPFoundationCurriculum=Object.freeze({version:'v33',modules,rows,deck,words,smallSamples,counts,byId,take,contextual});
})();