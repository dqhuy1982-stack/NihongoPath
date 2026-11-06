/* HORIZON — UI language pack. All text is user-interface copy, never lessons
   or learner-owned notes. New screens should use Locale.ui('key',params).
   Legacy phrase translation remains for backward-compatible older screens. */
'use strict';
const NP_UI_PACK=Object.freeze({
  "review.heading": {
    "vi": "Ôn điều cần ôn, vừa đủ hôm nay.",
    "en": "A little review. Just what you need.",
    "ja": "必要なところを、少しずつ復習。"
  },
  "review.subtitle": {
    "vi": "Chọn một hoạt động hoặc xem lại câu trả lời của bài mẫu.",
    "en": "Choose an activity or revisit your sample answers.",
    "ja": "練習を選ぶか、サンプル問題の回答を見直しましょう。"
  },
  "review.eyebrow": {
    "vi": "ÔN TẬP",
    "en": "REVIEW",
    "ja": "復習"
  },
  "review.notice.title": {
    "vi": "Chưa có lịch ôn giãn cách tự động.",
    "en": "Automated spaced review is not yet available.",
    "ja": "自動の間隔反復スケジュールはまだありません。"
  },
  "review.notice.body": {
    "vi": "Bản thử ghi nhận lượt kiểm tra, viết và tự đánh giá thẻ; chưa xếp lịch ôn như một hệ thống hoàn chỉnh.",
    "en": "This demo records quiz attempts, writing practice and flashcard self-ratings, but does not yet schedule full spaced reviews.",
    "ja": "体験版では問題、書く練習、カードの自己評価を記録しますが、本格的な間隔反復の予定はまだ設定しません。"
  },
  "review.card.kana.title": {
    "vi": "Luyện viết Kana",
    "en": "Kana writing",
    "ja": "仮名の書く練習"
  },
  "review.card.kana.description": {
    "vi": "Tô theo hoặc tự viết; chưa chấm thứ tự và độ đúng của nét.",
    "en": "Trace or write freely; stroke order and accuracy are not graded.",
    "ja": "なぞり書きや自由練習ができます。書き順や正確さは採点しません。"
  },
  "review.card.flash.title": {
    "vi": "Flashcard",
    "en": "Flashcards",
    "ja": "フラッシュカード"
  },
  "review.card.flash.description": {
    "vi": "Sáu thẻ mẫu để lật, tự đánh giá và lưu vào sổ.",
    "en": "Six sample cards to flip, self-rate and save.",
    "ja": "6枚のサンプルカードでめくり、自己評価し、ノートに保存します。"
  },
  "review.card.mistakes.title": {
    "vi": "Lỗi cần ôn",
    "en": "Mistakes to review",
    "ja": "見直したい間違い"
  },
  "review.card.mistakes.description": {
    "vi": "Xem câu chưa đúng hoặc đã dùng gợi ý trong bài N5.",
    "en": "Review incorrect answers or answers completed with hints in the N5 lesson.",
    "ja": "N5のレッスンで不正解だった問題やヒントを使った問題を見直しましょう。"
  },
  "review.card.mistakes.baseline": {
    "vi": "Làm bài kiểm tra mẫu để có câu cần xem lại.",
    "en": "Try a sample quiz to see which questions need review.",
    "ja": "サンプル問題を解くと、見直す問題が表示されます。"
  },
  "review.card.mistakes.count": {
    "vi": "{count} câu cần xem lại từ lượt kiểm tra gần nhất.",
    "en": "{count} questions to review from your latest quiz.",
    "ja": "直近のテストから見直す問題が{count}問あります。"
  },
  "review.card.sample": {
    "vi": "Bản mẫu",
    "en": "Sample",
    "ja": "サンプル"
  },
  "review.card.open": {
    "vi": "Mở hoạt động",
    "en": "Open activity",
    "ja": "練習を開く"
  },
  "review.michi.title": {
    "vi": "Michi gợi ý",
    "en": "A note from Michi",
    "ja": "Michiからのひとこと"
  },
  "review.michi.why": {
    "vi": "Vì sao có gợi ý này?",
    "en": "Why this suggestion?",
    "ja": "なぜこの提案？"
  },
  "review.michi.body": {
    "vi": "Mở lịch ôn để gặp lại mẫu đã học. Nếu chưa bắt đầu, một bài ngắn là đủ cho hôm nay.",
    "en": "Open your review schedule to revisit what you have learned. If you are just starting, one short lesson is enough for today.",
    "ja": "復習予定を開いて、学んだ文型を見直しましょう。まだ始めていないなら、今日は短いレッスン一つで十分です。"
  },
  "review.michi.baseline": {
    "vi": "Nếu chưa có lịch sử học, hãy thử một hoạt động ngắn. Mình chưa kết luận bạn yếu phần nào.",
    "en": "If you have no learning history yet, try a short activity. This is not an assessment of your weaknesses.",
    "ja": "まだ学習記録がなければ、短い練習から始めましょう。苦手分野を判定したわけではありません。"
  },
  "review.panel.eyebrow": {
    "vi": "BÀI HỌC · LỊCH ÔN",
    "en": "LESSON · REVIEW SCHEDULE",
    "ja": "レッスン・復習予定"
  },
  "review.panel.pace": {
    "vi": "Theo nhịp của bạn",
    "en": "At your pace",
    "ja": "自分のペースで"
  },
  "review.panel.due": {
    "vi": "{count} mẫu đến hạn",
    "en": "{count} patterns due",
    "ja": "復習対象の文型 {count}件"
  },
  "review.panel.pending": {
    "vi": "Bạn còn một lượt ôn đang dở.",
    "en": "You have an unfinished review session.",
    "ja": "途中の復習セッションがあります。"
  },
  "review.panel.reviewNow": {
    "vi": "Hôm nay, thử nhớ lại một chút.",
    "en": "Try recalling a little today.",
    "ja": "今日は少し思い出してみましょう。"
  },
  "review.panel.rest": {
    "vi": "Một khoảng nghỉ cũng là một phần của học.",
    "en": "Taking a break is part of learning.",
    "ja": "休むことも学習の一部です。"
  },
  "review.panel.empty": {
    "vi": "Học một mẫu, hẹn gặp lại ngày mai.",
    "en": "Learn one pattern, then revisit it tomorrow.",
    "ja": "文型を一つ学び、明日また復習しましょう。"
  },
  "review.panel.emptyDescription": {
    "vi": "Sau bài đầu tiên, các mẫu đã luyện sẽ có lịch thử nhớ lại riêng.",
    "en": "After your first lesson, studied patterns receive their own recall schedule.",
    "ja": "最初のレッスン後、学んだ文型ごとに復習予定が設定されます。"
  },
  "review.panel.continue": {
    "vi": "Tiếp tục ôn",
    "en": "Continue review",
    "ja": "復習を続ける"
  },
  "review.panel.start": {
    "vi": "Ôn · 2–3 phút",
    "en": "Review · 2–3 min",
    "ja": "復習・2〜3分"
  },
  "review.panel.view": {
    "vi": "Xem lượt ôn",
    "en": "View reviews",
    "ja": "復習予定を見る"
  },
  "review.panel.first": {
    "vi": "Mở bài đầu tiên",
    "en": "Open first lesson",
    "ja": "最初のレッスンを開く"
  },
  "review.panel.note": {
    "vi": "Lịch ôn giữ riêng từng bài và từng phiên bản. Flashcard bên dưới vẫn là tự đánh giá.",
    "en": "Review schedules are separate for each lesson and version. Flashcards below are still self-rated.",
    "ja": "復習予定はレッスンとバージョンごとに分かれています。下のフラッシュカードは自己評価です。"
  },
  "journal.heading": {
    "vi": "Sổ học tập của {name}",
    "en": "{name}’s journal",
    "ja": "{name}さんの学習ノート"
  },
  "journal.subtitle": {
    "vi": "Ghi chú, bài tập, từ và câu đã lưu cùng nằm ở đây, với nguồn riêng.",
    "en": "Your notes, exercises, saved words and sentences live here, each with a source.",
    "ja": "メモ、練習、保存した単語や文を、出典とともにここで管理します。"
  },
  "journal.eyebrow": {
    "vi": "SỔ HỌC TẬP",
    "en": "LEARNING JOURNAL",
    "ja": "学習ノート"
  },
  "journal.add": {
    "vi": "Thêm ghi chú",
    "en": "Add a note",
    "ja": "メモを追加"
  },
  "journal.search": {
    "vi": "Tìm trong sổ của bạn…",
    "en": "Search your journal…",
    "ja": "学習ノートを検索…"
  },
  "journal.searchLabel": {
    "vi": "Tìm ghi chú",
    "en": "Search notes",
    "ja": "メモを検索"
  },
  "journal.filterLabel": {
    "vi": "Loại mục",
    "en": "Entry type",
    "ja": "項目の種類"
  },
  "journal.filterAll": {
    "vi": "Tất cả loại mục",
    "en": "All entry types",
    "ja": "すべての項目"
  },
  "journal.export": {
    "vi": "Xuất dữ liệu thử",
    "en": "Export demo data",
    "ja": "体験データを書き出す"
  },
  "journal.type.note": {
    "vi": "Ghi chú",
    "en": "Notes",
    "ja": "メモ"
  },
  "journal.type.word": {
    "vi": "Từ vựng",
    "en": "Vocabulary",
    "ja": "単語"
  },
  "journal.type.sentence": {
    "vi": "Câu đã lưu",
    "en": "Saved sentence",
    "ja": "保存した文"
  },
  "journal.type.exercise": {
    "vi": "Bài tập",
    "en": "Exercise",
    "ja": "練習"
  },
  "journal.type.mistake": {
    "vi": "Lỗi cần ôn",
    "en": "Mistake to review",
    "ja": "見直す間違い"
  },
  "journal.type.summary": {
    "vi": "Tổng kết",
    "en": "Summary",
    "ja": "まとめ"
  },
  "journal.type.next": {
    "vi": "Bước tiếp theo",
    "en": "Next step",
    "ja": "次のステップ"
  },
  "journal.source": {
    "vi": "Nguồn:",
    "en": "Source:",
    "ja": "出典："
  },
  "journal.return": {
    "vi": "Quay lại luyện",
    "en": "Return to practice",
    "ja": "練習に戻る"
  },
  "journal.edit": {
    "vi": "Sửa",
    "en": "Edit",
    "ja": "編集"
  },
  "journal.delete": {
    "vi": "Xóa bản thử",
    "en": "Delete demo entry",
    "ja": "体験項目を削除"
  },
  "journal.emptyHeading": {
    "vi": "Một nơi để giữ điều đáng nhớ.",
    "en": "A place to keep what matters.",
    "ja": "大切な学びを残す場所。"
  },
  "journal.emptyDescription": {
    "vi": "Lưu từ trong flashcard, câu trong bài học hoặc viết ghi chú của riêng bạn. Dữ liệu tách theo hồ sơ trên trình duyệt này.",
    "en": "Save flashcard words, lesson sentences or your own notes. Data is kept separately for each profile in this browser.",
    "ja": "カードの単語、教材の文、または自分のメモを保存できます。データはこのブラウザーのプロフィールごとに分かれます。"
  },
  "journal.emptyAction": {
    "vi": "Thêm ghi chú đầu tiên",
    "en": "Add your first note",
    "ja": "最初のメモを追加"
  },
  "journal.disclaimer": {
    "vi": "Học viên tự viết và tổng kết do hệ thống tạo có nguồn khác nhau. Bản thử chưa có AI tự sửa hoặc ghi đè ghi chú.",
    "en": "Your writing and system summaries have separate sources. The preview does not use AI to edit or overwrite your notes.",
    "ja": "自分で書いた内容とシステムのまとめは出典を区別しています。体験版ではAIがメモを編集・上書きしません。"
  },
  "journal.editor.editHeading": {
    "vi": "Sửa mục sổ học tập",
    "en": "Edit journal entry",
    "ja": "ノートの項目を編集"
  },
  "journal.editor.addHeading": {
    "vi": "Thêm điều cần nhớ",
    "en": "Add something to remember",
    "ja": "覚えておきたいことを追加"
  },
  "journal.editor.type": {
    "vi": "Loại mục",
    "en": "Entry type",
    "ja": "項目の種類"
  },
  "journal.editor.title": {
    "vi": "Tiêu đề",
    "en": "Title",
    "ja": "タイトル"
  },
  "journal.editor.body": {
    "vi": "Nội dung",
    "en": "Content",
    "ja": "内容"
  },
  "journal.editor.source": {
    "vi": "Nguồn / bài học",
    "en": "Source / lesson",
    "ja": "出典・レッスン"
  },
  "journal.editor.save": {
    "vi": "Lưu bản thử",
    "en": "Save demo entry",
    "ja": "体験項目を保存"
  },
  "journal.editor.cancel": {
    "vi": "Hủy",
    "en": "Cancel",
    "ja": "キャンセル"
  },
  "journal.editor.local": {
    "vi": "Chỉ lưu trong hồ sơ hiện tại trên trình duyệt này.",
    "en": "Saved only in this profile on this browser.",
    "ja": "このブラウザーの現在のプロフィールにのみ保存されます。"
  }
});
for(const message of Object.values(NP_UI_PACK)){
  NP_LOCALE_ROWS.push([message.vi,message.en,message.ja]);
}
