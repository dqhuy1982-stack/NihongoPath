/* FOUNDATION Kana sample — bilingual instructional copy only.
   Japanese glyphs, romaji, question IDs and learner data remain unchanged. */
NP_LOCALE_ROWS.push(
 ['Năm chữ đầu tiên: あ・い・う・え・お','The first five characters: あ・い・う・え・お','最初の5文字：あ・い・う・え・お'],
 ['Bắt đầu bằng','Start with','まずは'],
 ['năm chữ quen.','five familiar characters.','基本の5文字から。'],
 ['Nhìn chữ, thử nhớ âm, rồi gặp lại sau một khoảng nghỉ.','Look at each character, recall its sound, then revisit it after a short break.','文字を見て音を思い出し、少し時間をおいて復習しましょう。'],
 ['Gói tự luyện đọc, chưa có audio hoặc chấm viết.','Self-study reading practice; audio and writing assessment are not available.','読み方を自習する教材です。音声や書字の採点は未実装です。'],
 ['Bài và câu hỏi tự biên soạn để học thử; chưa thay thế chương trình Kana đầy đủ.','Original sample lesson and questions; not a replacement for a complete Kana course.','独自に作成した体験用の教材と問題です。仮名の全課程に代わるものではありません。'],
 ['Nhìn hình dạng tổng thể, sau đó che mẫu và thử nhớ âm.','Look at the whole shape, then hide the example and recall the sound.','文字全体の形を見てから、見本を隠して音を思い出しましょう。'],
 ['Đọc một chữ riêng lẻ trước khi ghép thành từ.','Read one character on its own before combining characters into words.','文字を単独で読んでから、単語につなげましょう。'],
 ['Romaji chỉ hỗ trợ lúc đầu. Bài này chưa có bản phát âm; không dùng romaji để kết luận phát âm chính xác.','Romaji is only an early learning aid. This lesson has no pronunciation recordings; romaji alone cannot verify correct pronunciation.','ローマ字は学習初期の補助です。この教材には発音音声がないため、ローマ字だけで正確な発音は判断できません。']
);
for(const [kana,romaji] of [['あ','a'],['い','i'],['う','u'],['え','e'],['お','o']]){
 NP_LOCALE_ROWS.push(
  [`Nhận mặt chữ ${kana}`,`Recognize ${kana}`,`${kana}を見分ける`],
  [`Cách đọc theo romaji: ${romaji}`,`Romaji reading: ${romaji}`,`ローマ字表記：${romaji}`],
  [`Chữ ${kana} ứng với cách đọc nào?`,`Which reading matches ${kana}?`,`${kana}の読み方はどれですか。`],
  [`Đúng: ${kana} được ghi bằng romaji là ${romaji}.`,`Correct: ${kana} is written ${romaji} in romaji.`,`正解：${kana}のローマ字表記は${romaji}です。`],
  [`Đối chiếu mẫu vừa học: ${kana} → ${romaji}`,`Review the pattern: ${kana} → ${romaji}`,`見本を確認：${kana} → ${romaji}`],
  [`${kana} → ${romaji}. Hãy thử nhớ lại ở lượt ôn sau; một lần đúng chưa đủ kết luận đã thuộc.`,`${kana} → ${romaji}. Try recalling it next time; one correct answer does not prove mastery.`,`${kana} → ${romaji}。次の復習でも思い出してみましょう。1回の正解だけでは習得とは判断できません。`],
  [`Làm quen ${kana}`,`Meet ${kana}`,`${kana}に慣れる`],
  [`Thử nhớ ${kana}`,`Recall ${kana}`,`${kana}を思い出す`]
 );
 for(const [other] of [['あ'],['い'],['う'],['え'],['お']]){
  if(other===kana)continue;
  NP_LOCALE_ROWS.push([
   `Đây là âm của ${other}, không phải ${kana}.`,
   `This is the sound of ${other}, not ${kana}.`,
   `これは${kana}ではなく${other}の音です。`
  ]);
 }
}
