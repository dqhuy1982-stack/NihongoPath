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
 ['あい','tình yêu','ai','hira','basic','Từ gồm các nguyên âm đã học.'],
 ['あお','màu xanh dương','ao','hira','basic','Hai chữ nguyên âm.'],
 ['いえ','ngôi nhà','ie','hira','basic','Tập đọc hai nguyên âm.'],
 ['うえ','phía trên','ue','hira','basic','Chỉ vị trí; gồm các nguyên âm.'],
 ['かお','khuôn mặt','kao','hira','basic','Kết hợp hàng K và nguyên âm.'],
 ['こえ','giọng nói','koe','hira','basic','Kết hợp hàng K và nguyên âm.'],
 ['いか','con mực','ika','hira','basic','Một từ chỉ sinh vật.'],
 ['かき','quả hồng','kaki','hira','basic','Một nghĩa thường gặp của かき.'],
 ['あし','bàn chân','ashi','hira','basic','し đọc shi.'],
 ['くつ','đôi giày','kutsu','hira','basic','つ đọc tsu.'],
 ['つき','mặt trăng','tsuki','hira','basic','つ đọc tsu.'],
 ['とけい','đồng hồ','tokei','hira','basic','Từ ghép từ các hàng đã gặp.'],
 ['ココア','ca cao nóng','kokoa','kata','basic','Từ mượn viết bằng Katakana.'],
 ['カカオ','ca cao (hạt)','kakao','kata','basic','Cách viết Katakana.'],
 ['イカ','con mực','ika','kata','basic','Tên sinh vật đôi khi viết Katakana.'],
 ['アイス','kem / đá lạnh','aisu','kata','basic','Katakana thường gặp trên thực đơn.'],
 ['タコ','con bạch tuộc','tako','kata','basic','Tên sinh vật thường viết Katakana.'],
 ['テスト','bài kiểm tra','tesuto','kata','basic','Từ mượn viết bằng Katakana.'],
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
 ['ファイル','tệp tin','fairu','kata','small','ァ nhỏ đi cùng フ để biểu diễn âm fa.'],
 ['フィルム','cuộn phim','firumu','kata','small','ィ nhỏ đi cùng フ để biểu diễn âm fi.'],
 ['フェリー','phà','ferī','kata','small','ェ nhỏ đi cùng フ; ー kéo dài âm i.'],
 ['ウィンナー','xúc xích','winnā','kata','small','ィ nhỏ kết hợp ウ; ー kéo dài âm a.'],
 ['パーティー','bữa tiệc','pātī','kata','small','ィ nhỏ dùng trong ティ; có dấu kéo dài ー.'],
 ['さかな','con cá','sakana','hira','basic','Luyện phân biệt さ và な.'],
 ['はな','bông hoa','hana','hira','basic','はな còn có thể mang nghĩa mũi; ở đây luyện nghĩa hoa.'],
 ['まど','cửa sổ','mado','hira','voiced','ど có dấu dakuten.'],
 ['そら','bầu trời','sora','hira','basic','Từ thường dùng về thiên nhiên.'],
 ['むし','côn trùng','mushi','hira','basic','し đọc shi.'],
 ['とり','con chim','tori','hira','basic','Luyện と và り.'],
 ['うみ','biển','umi','hira','basic','Đọc liền う và み.'],
 ['ほし','ngôi sao','hoshi','hira','basic','し đọc shi.'],
 ['ふね','con thuyền','fune','hira','basic','ふ đọc fu.'],
 ['はこ','cái hộp','hako','hira','basic','Đọc hai Kana đã học.'],
 ['カメラ','máy ảnh','kamera','kata','basic','Từ mượn thường gặp.'],
 ['トマト','cà chua','tomato','kata','basic','Từ mượn dễ luyện nhận diện.'],
 ['メモ','ghi chú','memo','kata','basic','Từ mượn ngắn.'],
 ['ラジオ','đài radio','rajio','kata','voiced','ジ có dấu dakuten.'],
 ['バナナ','quả chuối','banana','kata','voiced','バ có dấu dakuten.'],
 ['ペン','bút','pen','kata','voiced','ペ có handakuten.'],
 ['スーパー','siêu thị','sūpā','kata','small','ー kéo dài nguyên âm trong từ.'],
 ['ジュース','nước ép / nước uống','jūsu','kata','yoon','ジュ là âm ghép; ー kéo dài âm u.'],
 ['チョコ','sô-cô-la','choko','kata','yoon','チョ là âm ghép Katakana.']
].map(([glyph,vi,read,script,stage,note],i)=>Object.freeze({id:'word-'+i,glyph,vi,read,script,stage,note,group:stage}));
const modules=[
 {id:'hiragana',title:'01 · Hiragana',subtitle:'46 chữ cơ bản · nhận mặt & đọc',script:'hira',stage:'basic',groups:rows.map(([id,title])=>({id,title})),note:'Học theo từng hàng 3–5 chữ; mở rộng dần, không bắt học hết 46 chữ trong một lần.'},
 {id:'katakana',title:'02 · Katakana',subtitle:'46 chữ cơ bản · nhận dạng chữ góc cạnh',script:'kata',stage:'basic',groups:rows.map(([id,title])=>({id,title})),note:'Âm gần giống Hiragana nhưng cách viết khác. Dùng từ mượn để ghi nhớ trong ngữ cảnh.'},
 {id:'dakuten',title:'03 · Âm đục & bán đục',subtitle:'が/ガ · ざ/ザ · だ/ダ · ば/バ · ぱ/パ',script:'both',stage:'voiced',groups:[{id:'g',title:'G'},{id:'z',title:'Z'},{id:'d',title:'D'},{id:'b',title:'B'},{id:'p',title:'P'}],note:'Học dấu ゛ trước, dấu ゜ sau. じ/ぢ và ず/づ phát âm gần nhau; không dùng riêng âm để ép chọn một kiểu chữ.'},
 {id:'yoon',title:'04 · Âm ghép',subtitle:'きゃ/キャ · しゅ/シュ · ちょ/チョ…',script:'both',stage:'yoon',groups:blends.map(([id])=>({id,title:id.toUpperCase()})),note:'Chữ ゃ/ゅ/ょ (ャ/ュ/ョ) phải nhỏ. Âm ghép được đọc như một nhịp; luyện nhận diện cả cụm.'},
 {id:'small',title:'05 · Chữ nhỏ & âm dài',subtitle:'っ/ッ · ゃゅょ/ャュョ · ー · ァ…',script:'words',stage:'small',groups:[{id:'pause',title:'っ / ッ'},{id:'length',title:'Âm dài ー'},{id:'vowels',title:'Nguyên âm nhỏ'}],note:'Chữ nhỏ và dấu kéo dài không có cách đọc độc lập như Kana thường. Học qua từ và ví dụ đối chiếu.'},
 {id:'mixed',title:'06 · Tổng ôn Kana',subtitle:'Hiragana + Katakana + âm đặc biệt',script:'both',stage:'mixed',groups:[{id:'mixed',title:'Tổng hợp'}],note:'Trộn chữ và dạng bài sau khi đã luyện riêng; kết quả bài kiểm tra chỉ phản ánh đúng lượt làm.'}
];
/* Learner-facing lessons are intentionally broader than raw Kana rows.
   Underlying 40 row/topic IDs and card IDs remain unchanged for bookmarks,
   scoring, audio and historic learning progress. */
const lessonUnits=Object.freeze({
 hiragana:[
  {id:'unit-1',title:'Nguyên âm & hàng K',groups:['a','k'],summary:'あ–お · か–こ'},
  {id:'unit-2',title:'Hàng S · T · N',groups:['s','t','n'],summary:'さ–そ · た–と · な–の'},
  {id:'unit-3',title:'Hàng H · M · Y',groups:['h','m','y'],summary:'は–ほ · ま–も · や・ゆ・よ'},
  {id:'unit-4',title:'Hàng R · W · ん',groups:['r','w'],summary:'ら–ろ · わ・を・ん'}
 ],
 katakana:[
  {id:'unit-1',title:'Nguyên âm & hàng K',groups:['a','k'],summary:'ア–オ · カ–コ'},
  {id:'unit-2',title:'Hàng S · T · N',groups:['s','t','n'],summary:'サ–ソ · タ–ト · ナ–ノ'},
  {id:'unit-3',title:'Hàng H · M · Y',groups:['h','m','y'],summary:'ハ–ホ · マ–モ · ヤ・ユ・ヨ'},
  {id:'unit-4',title:'Hàng R · W · ン',groups:['r','w'],summary:'ラ–ロ · ワ・ヲ・ン'}
 ],
 dakuten:[
  {id:'unit-1',title:'Dấu đục · G & Z',groups:['g','z'],summary:'が / ガ · ざ / ザ'},
  {id:'unit-2',title:'Dấu đục & bán đục · D, B, P',groups:['d','b','p'],summary:'だ / ダ · ば / バ · ぱ / パ'}
 ],
 yoon:[
  {id:'unit-1',title:'Ghép âm cơ bản · KY, SH, CH, NY',groups:['ky','sh','ch','ny'],summary:'きゃ · しゃ · ちゃ · にゃ'},
  {id:'unit-2',title:'Ghép âm · HY, MY, RY',groups:['hy','my','ry'],summary:'ひゃ · みゃ · りゃ'},
  {id:'unit-3',title:'Ghép âm đục · GY, J, BY, PY',groups:['gy','j','by','py'],summary:'ぎゃ · じゃ · びゃ · ぴゃ'}
 ],
 small:[
  {id:'pause',title:'Âm ngắt っ / ッ',groups:['pause'],summary:'Âm ngắt trong từ'},
  {id:'length',title:'Âm dài ー',groups:['length'],summary:'Kéo dài âm trong Katakana'},
  {id:'vowels',title:'Nguyên âm nhỏ',groups:['vowels'],summary:'ァィゥェォ trong từ mượn'}
 ],
 mixed:[
  {id:'mixed',title:'Tổng ôn Kana',groups:['mixed'],summary:'Hiragana · Katakana · âm đặc biệt'}
 ]
});
const getLessonUnits=id=>lessonUnits[id]||[];
const findLessonUnit=(id,group)=>getLessonUnits(id).find(u=>u.id===group)||null;
const smallSamples=[
 {id:'pause',marks:'っ · ッ',title:'っ / ッ — ngắt âm',examples:[['きて','kite','Hãy đến'],['きって','kitte','Tem thư'],['ベッド','beddo','Giường']]},
 {id:'length',marks:'ー',title:'ー — kéo dài nguyên âm',examples:[['コヒ','kohi','Không phải cách viết chuẩn của コーヒー'],['コーヒー','kōhī','Cà phê'],['ケーキ','kēki','Bánh kem']]},
 {id:'vowels',marks:'ぁ ぃ ぅ ぇ ぉ · ァ ィ ゥ ェ ォ · ゃ ゅ ょ · ャ ュ ョ',title:'ゃゅょ, ァィゥェォ — chữ nhỏ',examples:[['きや','kiya','Hai nhịp'],['きゃ','kya','Một nhịp âm ghép'],['ファイル','fairu','Tệp tin; フ + ァ thành fa']]}
];
const byId=Object.fromEntries(modules.map(m=>[m.id,m]));
const take=(id,group='all',script='both')=>{
 const m=byId[id];if(!m)return [];
 if(id==='small')return words.filter(w=>w.stage==='small');
 if(id==='mixed')return deck.filter(x=>script==='both'||x.script===script).concat(words.filter(w=>script==='both'||w.script===script));
 const unit=findLessonUnit(id,group);
 return deck.filter(x=>x.stage===m.stage&&(m.script==='both'||x.script===m.script)&&(group==='all'||(unit?unit.groups.includes(x.group):x.group===group))&&(script==='both'||x.script===script));
};
const contextual=(id,script='both')=>words.filter(w=>(script==='both'||w.script===script)&&(id==='mixed'?true:id==='small'?w.stage==='small':id==='hiragana'?w.script==='hira':id==='katakana'?w.script==='kata':w.stage===byId[id]?.stage));
const counts={hiragana:deck.filter(x=>x.stage==='basic'&&x.script==='hira').length,katakana:deck.filter(x=>x.stage==='basic'&&x.script==='kata').length,dakuten:deck.filter(x=>x.stage==='voiced').length,yoon:deck.filter(x=>x.stage==='yoon').length,small:words.filter(x=>x.stage==='small').length};
if(counts.hiragana!==46||counts.katakana!==46||counts.dakuten!==50||counts.yoon!==66)throw Error('Foundation curriculum counts are inconsistent');
window.NPFoundationCurriculum=Object.freeze({version:'v33',modules,rows,deck,words,smallSamples,counts,byId,take,contextual,lessonUnits,getLessonUnits,findLessonUnit});
})();