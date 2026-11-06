/* HORIZON — UI language pack. All text is user-interface copy, never lessons
   or learner-owned notes. New screens should use Locale.ui('key',params).
   Legacy phrase translation remains for backward-compatible older screens. */
'use strict';
const NP_UI_PACK=Object.freeze({
  "lesson.player.path": {"vi":"Lộ trình buổi học","en":"Session outline","ja":"今回の学習の流れ"},
  "lesson.player.progress": {"vi":"Tiến độ bài học","en":"Lesson progress","ja":"レッスンの進捗"},
  "lesson.player.completed": {"vi":"{completed}/{total} bước đã hoàn tất","en":"{completed}/{total} steps completed","ja":"{total}ステップ中{completed}ステップ完了"},
  "lesson.player.step": {"vi":"Bước {current}/{total}","en":"Step {current}/{total}","ja":"ステップ{current}/{total}"},
  "lesson.player.question": {"vi":"Câu {current}/{total}","en":"Question {current}/{total}","ja":"問題{current}/{total}"},
  "lesson.player.learningGoal": {"vi":"Mục tiêu của buổi học","en":"Session focus","ja":"今回の学習目標"},
  "lesson.player.focusKana": {"vi":"Nhận diện các chữ Kana đầu tiên","en":"Recognize the first Kana characters","ja":"最初の仮名を見分ける"},
  "lesson.player.focusN5": {"vi":"Học một mẫu câu và thử nhớ lại","en":"Learn a sentence pattern and recall it","ja":"文型を学んで思い出す"},
  "lesson.player.save": {"vi":"Tiến độ lưu theo hồ sơ","en":"Progress saved to your profile","ja":"学習記録はプロフィールごとに保存"},
  "lesson.player.next": {"vi":"Tiếp tục từ bước đang học","en":"Continue from your current step","ja":"現在のステップから続ける"},
  "lesson.player.reading": {"vi":"Có thể ẩn cách đọc để tự nhớ","en":"Hide readings to test your recall","ja":"読み仮名を隠して思い出す"},
  "lesson.player.sample": {"vi":"Bản mẫu, chưa đánh giá trình độ tổng thể","en":"Sample lesson; not an overall proficiency assessment","ja":"サンプル教材・総合的な習熟度評価ではありません"},
  "lesson.player.pause": {"vi":"Tạm dừng","en":"Pause session","ja":"一時停止"},
  "lesson.player.today": {"vi":"Hôm nay","en":"Today","ja":"今日"},
  "lesson.player.glyph": {"vi":"Chữ đang học","en":"Current character","ja":"学習中の文字"},
  "lesson.player.savedBrowser": {"vi":"Lưu trên trình duyệt này","en":"Saved in this browser","ja":"このブラウザーに保存"},
 "foundation.title":{"vi":"Kana Journey","en":"Kana Journey","ja":"かなの学習ジャーニー"},
 "foundation.eyebrow":{"vi":"FOUNDATION · NỀN TẢNG","en":"FOUNDATION · GETTING STARTED","ja":"FOUNDATION・基礎"},
 "foundation.subtitle":{"vi":"Học chữ, luyện phản xạ rồi tự kiểm tra. Một hành trình nối tiếp đến N5.","en":"Learn the characters, build recall and check yourself. One connected path toward N5.","ja":"文字を学び、思い出す練習をして確認する。N5へつながる学習の道筋です。"},
 "foundation.back":{"vi":"Tất cả khóa học","en":"All courses","ja":"すべてのコース"},
 "foundation.noticeTitle":{"vi":"Bản đầu tiên của hành trình","en":"First connected journey preview","ja":"学習ジャーニーの初期版"},
 "foundation.notice":{"vi":"Ba bước dưới đây mở những công cụ đang hoạt động. Tiến độ viết, luyện nhớ và bài học hiện vẫn được lưu riêng; chưa có đánh giá tổng hợp Foundation.","en":"These three steps connect working modules. Writing, recall and lesson records are still stored separately; Foundation readiness is not yet assessed.","ja":"3つのステップから既存の機能を開けます。書く練習、思い出す練習、レッスン記録は現在別々に保存され、基礎の習得度はまだ総合評価されません。"},
 "foundation.stage.learn":{"vi":"01 · Học","en":"01 · Learn","ja":"01・学ぶ"},
 "foundation.stage.practice":{"vi":"02 · Luyện","en":"02 · Practice","ja":"02・練習"},
 "foundation.stage.check":{"vi":"03 · Kiểm tra","en":"03 · Check","ja":"03・確認"},
 "foundation.stage.learnDesc":{"vi":"Bắt đầu với あ・い・う・え・お; nghe và nhận diện chữ.","en":"Start with あ・い・う・え・お; recognize their shapes and sounds.","ja":"あ・い・う・え・おから始め、形と音を覚えます。"},
 "foundation.stage.practiceDesc":{"vi":"Mở Writing Studio: chọn chữ, xem nét, tự viết.","en":"Open Writing Studio: select, watch strokes and write.","ja":"Writing Studioで文字を選び、書き順を見て書きます。"},
 "foundation.stage.checkDesc":{"vi":"Mở Recall Lab để kiểm tra nhận diện độc lập.","en":"Open Recall Lab for an independent recognition check.","ja":"Recall Labで自力の文字認識を確認します。"},
 "foundation.stage.learnAction":{"vi":"Học năm nguyên âm","en":"Learn the five vowels","ja":"5つの母音を学ぶ"},
 "foundation.stage.practiceAction":{"vi":"Mở Writing Studio","en":"Open Writing Studio","ja":"Writing Studioを開く"},
 "foundation.stage.checkAction":{"vi":"Bắt đầu kiểm tra","en":"Start recognition check","ja":"認識チェックを始める"},
 "foundation.currentTitle":{"vi":"Bước nên bắt đầu","en":"Recommended starting step","ja":"おすすめの最初のステップ"},
 "foundation.currentDescription":{"vi":"Bài mẫu năm nguyên âm đã có thể học. Sau đó dùng Studio để luyện và Recall Lab để tự kiểm tra.","en":"The five-vowel sample lesson is ready. Then practice in Studio and check recall in the lab.","ja":"5つの母音のサンプル教材から始められます。次にStudioで練習し、Recall Labで確認しましょう。"},
 "foundation.unitTitle":{"vi":"Các chặng của Foundation","en":"Foundation units","ja":"基礎コースのステップ"},
 "foundation.unitSubtitle":{"vi":"Nội dung sẽ hoàn thiện dần. Mục chưa có bài riêng được ghi rõ.","en":"Content is being built in stages. Units without a complete lesson are clearly marked.","ja":"教材は順次追加されます。未完成の単元は明確に表示します。"},
 "foundation.statusSample":{"vi":"Có bài mẫu","en":"Sample lesson","ja":"サンプル教材あり"},
 "foundation.statusTool":{"vi":"Có công cụ luyện","en":"Practice tool ready","ja":"練習ツールあり"},
 "foundation.statusPlanned":{"vi":"Đang biên soạn","en":"In preparation","ja":"準備中"},
 "foundation.unit.f01":{"vi":"Hiragana cơ bản · nhóm nhỏ","en":"Basic Hiragana · short groups","ja":"ひらがなの基本・小グループ"},
 "foundation.unit.f02":{"vi":"Katakana cơ bản · nhóm nhỏ","en":"Basic Katakana · short groups","ja":"カタカナの基本・小グループ"},
 "foundation.unit.f03":{"vi":"Âm đục và âm bán đục","en":"Voiced and semi-voiced sounds","ja":"濁音・半濁音"},
 "foundation.unit.f04":{"vi":"Âm ghép, âm ngắt và trường âm","en":"Combined sounds, small っ and long vowels","ja":"拗音・促音・長音"},
 "foundation.unit.f05":{"vi":"Đọc từ và mẫu câu ngắn","en":"Read words and short expressions","ja":"単語と短い表現を読む"},
 "foundation.unit.f06":{"vi":"Kiểm tra tổng hợp trước N5","en":"Foundation readiness check","ja":"N5前の基礎確認"},
 "foundation.unit.open":{"vi":"Xem bài mẫu","en":"Open sample lesson","ja":"サンプル教材を見る"},
 "foundation.unit.writing":{"vi":"Luyện viết chữ","en":"Practice writing","ja":"書く練習をする"},
 "foundation.unit.pending":{"vi":"Chưa phát hành bài đầy đủ","en":"Full lesson not yet released","ja":"正式なレッスンは未公開"},
 "foundation.bridgeTitle":{"vi":"Tiếp tục đến N5","en":"Continue toward N5","ja":"N5につなげる"},
 "foundation.bridgeText":{"vi":"Không cần hoàn thành toàn bộ Foundation mới được xem N5. Khi có dữ liệu kiểm tra đáng tin cậy, hệ thống sẽ gợi ý chữ cần ôn khi học N5.","en":"You can explore N5 without finishing Foundation. Once reliable assessment data is connected, relevant Kana review will appear alongside N5 lessons.","ja":"基礎をすべて終えなくてもN5を学べます。信頼できる評価データがつながったら、N5の学習中に必要な仮名の復習を提案します。"},
 "foundation.bridgeAction":{"vi":"Xem lộ trình N5","en":"Explore N5 path","ja":"N5の学習プランを見る"},
 "foundation.reviewAction":{"vi":"Ôn tập","en":"Review","ja":"復習"},
 "foundation.readiness":{"vi":"Sẵn sàng lên N5: chưa được đánh giá","en":"N5 readiness: not yet assessed","ja":"N5への準備度：未評価"},
 "foundation.privacy":{"vi":"Đổi ngôn ngữ hoặc mùa không làm thay đổi kết quả học đã lưu.","en":"Changing language or season does not modify saved learning records.","ja":"言語や季節を変えても保存した学習記録は変更されません。"},
  "map.demoGroup": {"vi":"07 · Mô hình với dữ liệu giả lập","en":"07 · Simulation with sample data","ja":"07・サンプルデータによるシミュレーション"},
  "profile.heading": {"vi":"Hồ sơ học viên","en":"Learner profile","ja":"学習者プロフィール"},
  "profile.subtitle": {"vi":"Thông tin được lấy từ dữ liệu hồ sơ và có thể chỉnh sửa.","en":"Details come from your profile and can be edited.","ja":"プロフィール情報は編集できます。"},
  "profile.eyebrow": {"vi":"CÁ NHÂN","en":"PERSONAL PROFILE","ja":"個人プロフィール"},
  "profile.mySpace": {"vi":"Không gian của tôi","en":"My space","ja":"マイスペース"},
  "profile.sessionMinutes": {"vi":"{minutes} phút mỗi buổi","en":"{minutes} min per session","ja":"1回{minutes}分"},
  "profile.manager": {"vi":"Quản lý gia đình mẫu","en":"Demo family manager","ja":"体験版の家族管理者"},
  "profile.learner": {"vi":"Học viên mẫu","en":"Demo learner","ja":"体験版の学習者"},
  "profile.goalTitle": {"vi":"Mục tiêu mong muốn","en":"Your chosen goal","ja":"選んだ目標"},
  "profile.goalDescription": {"vi":"Do bạn chọn. Không phải trình độ đã đạt.","en":"Chosen by you, not an assessed level.","ja":"自分で選んだ目標です。評価された習熟度ではありません。"},
  "profile.changeGoal": {"vi":"Đổi mục tiêu","en":"Change goal","ja":"目標を変更"},
  "profile.courseTitle": {"vi":"Khóa đang theo","en":"Current course","ja":"現在のコース"},
  "profile.courseForecast": {"vi":"{course} · Lộ trình dự kiến (chưa có khóa đầy đủ)","en":"{course} · Planned path (full course unavailable)","ja":"{course}・予定の学習プラン（全課程は未公開）"},
  "profile.courseN5": {"vi":"N5 · Nội dung mẫu","en":"N5 · Sample content","ja":"N5・サンプル教材"},
  "profile.courseFoundation": {"vi":"Nền tảng tiếng Nhật · Bản mẫu","en":"Japanese foundation · Sample","ja":"日本語の基礎・サンプル"},
  "profile.viewPath": {"vi":"Xem lộ trình","en":"View learning path","ja":"学習プランを見る"},
  "profile.proficiencyTitle": {"vi":"Năng lực ghi nhận","en":"Recorded proficiency","ja":"記録された習熟度"},
  "profile.proficiencySample": {"vi":"Có kết quả bài mẫu; chưa đánh giá trình độ.","en":"Sample results available; proficiency not yet assessed.","ja":"サンプルの結果はありますが、習熟度は未評価です。"},
  "profile.proficiencyNone": {"vi":"Chưa có dữ liệu đánh giá.","en":"No assessment data yet.","ja":"評価データはまだありません。"},
  "profile.viewEvidence": {"vi":"Xem bằng chứng","en":"View evidence","ja":"学習記録を見る"},
  "profile.journal": {"vi":"Sổ học tập","en":"Learning journal","ja":"学習ノート"},
  "profile.milestones": {"vi":"Thành tích","en":"Milestones","ja":"達成記録"},
  "profile.family": {"vi":"Gia đình","en":"Family","ja":"家族"},
  "profile.switch": {"vi":"Chọn người học khác","en":"Switch learner","ja":"学習者を切り替える"},
  "profile.seedPurpose": {"vi":"Ôn Hiragana, Katakana và các bài nhập môn N5","en":"Review Hiragana, Katakana and introductory N5 lessons","ja":"ひらがな・カタカナとN5入門を復習する"},
  "profile.goalIntent": {"vi":"{purpose} · {minutes} phút mỗi buổi","en":"{purpose} · {minutes} min per session","ja":"{purpose}・1回{minutes}分"},
  "settings.heading": {"vi":"Không gian của tôi","en":"My space","ja":"マイスペース"},
  "settings.subtitle": {"vi":"Điều chỉnh việc học theo cách phù hợp với bạn.","en":"Make your learning space work for you.","ja":"自分に合った学習スペースに整えましょう。"},
  "settings.eyebrow": {"vi":"CÁ NHÂN","en":"PERSONAL","ja":"個人設定"},
  "settings.profileLine": {"vi":"Hồ sơ cá nhân · Mục tiêu {goal}","en":"Personal profile · Goal: {goal}","ja":"個人プロフィール・目標：{goal}"},
  "settings.editProfile": {"vi":"Sửa hồ sơ","en":"Edit profile","ja":"プロフィールを編集"},
  "settings.nav.profile": {"vi":"Hồ sơ","en":"Profile","ja":"プロフィール"},
  "settings.nav.goals": {"vi":"Mục tiêu & lịch học","en":"Goals & schedule","ja":"目標と学習予定"},
  "settings.nav.learning": {"vi":"Cách học","en":"Learning preferences","ja":"学習方法"},
  "settings.nav.display": {"vi":"Hiển thị & hỗ trợ","en":"Display & accessibility","ja":"表示とアクセシビリティ"},
  "settings.nav.reminders": {"vi":"Nhắc nhở","en":"Reminders","ja":"リマインダー"},
  "settings.nav.data": {"vi":"Dữ liệu & quyền riêng tư","en":"Data & privacy","ja":"データとプライバシー"},
  "settings.nav.account": {"vi":"Tài khoản & bảo mật","en":"Account & security","ja":"アカウントとセキュリティ"},
  "settings.navLabel": {"vi":"Nhóm cấu hình cá nhân","en":"Settings sections","ja":"設定項目"},
  "settings.navSelect": {"vi":"Chọn nhóm cấu hình","en":"Choose settings section","ja":"設定項目を選ぶ"},
  "settings.savedFor": {"vi":"Áp dụng cho {name} · lưu trên trình duyệt này","en":"Applies to {name} · saved in this browser","ja":"{name}に適用・このブラウザーに保存"},
  "settings.cancel": {"vi":"Hủy thay đổi","en":"Discard changes","ja":"変更を破棄"},
  "settings.save": {"vi":"Lưu bản thử","en":"Save demo settings","ja":"体験設定を保存"},
  "settings.account.heading": {"vi":"Tài khoản & bảo mật","en":"Account & security","ja":"アカウントとセキュリティ"},
  "settings.account.preview": {"vi":"Đây là bản review giao diện.","en":"This is a UI preview.","ja":"これはUIのプレビューです。"},
  "settings.account.previewBody": {"vi":"Chưa có đăng nhập thật, khôi phục mật khẩu hoặc phân quyền server.","en":"Live sign-in, password recovery and server permissions are not implemented.","ja":"本番のサインイン、パスワード回復、サーバー権限は未実装です。"},
  "settings.account.auth": {"vi":"Xác thực tài khoản","en":"Account authentication","ja":"アカウント認証"},
  "settings.account.authDesc": {"vi":"Chọn phương án phù hợp cho người lớn và hồ sơ trẻ em khi triển khai.","en":"Choose suitable authentication for adults and children when implementing the live version.","ja":"本番運用時には大人と子どものプロフィールに適した認証方式を選びます。"},
  "settings.account.disconnected": {"vi":"Chưa kết nối","en":"Not connected","ja":"未接続"},
  "settings.account.role": {"vi":"Vai trò trong nhóm mẫu","en":"Role in the demo group","ja":"体験グループでの役割"},
  "settings.account.noEscalation": {"vi":"Không tự nâng quyền trong cấu hình.","en":"Permissions cannot be elevated through settings.","ja":"設定から権限を昇格することはできません。"},
  "settings.account.viewSignin": {"vi":"Xem màn đăng nhập","en":"View sign-in","ja":"サインインを見る"},
  "settings.account.chooseProfile": {"vi":"Chọn hồ sơ khác","en":"Choose another profile","ja":"別のプロフィールを選ぶ"},
  "settings.account.pinNote": {"vi":"Mã PIN hồ sơ trong tương lai không thay thế xác thực tài khoản và quyền truy cập server.","en":"A future profile PIN will not replace authentication or server access controls.","ja":"将来のプロフィールPINはアカウント認証やサーバーのアクセス制御に代わるものではありません。"},
  "map.group07": {"vi":"07 · Không gian của tôi","en":"07 · My space","ja":"07・マイスペース"},
  "map.settingsDescription": {"vi":"Cấu hình theo từng hồ sơ","en":"Settings for each learner profile","ja":"学習者プロフィールごとの設定"},
  "map.demoHeading": {"vi":"Mô hình với dữ liệu giả lập","en":"Demo with sample data","ja":"サンプルデータによる体験"},
  "map.today": {"vi":"Hôm nay · mô phỏng","en":"Today · simulation","ja":"今日・シミュレーション"},
  "map.todayDesc": {"vi":"6 hồ sơ, 8 tình huống, phiên 5/15/30 phút","en":"6 profiles, 8 scenarios, 5/15/30-minute sessions","ja":"6プロフィール、8場面、5/15/30分セッション"},
  "map.beforeAfter": {"vi":"Trước / Sau","en":"Before / After","ja":"変更前と変更後"},
  "map.beforeAfterDesc": {"vi":"Cùng dữ liệu đầu vào, so sánh quy tắc gợi ý","en":"Compare recommendation rules with the same input data","ja":"同じ入力データで提案ルールを比較"},
  "map.dataRules": {"vi":"Dữ liệu & quy tắc","en":"Data & rules","ja":"データとルール"},
  "map.dataRulesDesc": {"vi":"SQLite, JSON, lịch sử và hợp đồng module","en":"SQLite, JSON, history and module contracts","ja":"SQLite、JSON、履歴、モジュールの契約仕様"},
  "reports.versioned.summary": {"vi":"{completed} phiên hoàn tất · {pending} phiên đang dở · {correct}/{total} câu tự trả lời đúng.","en":"{completed} sessions completed · {pending} in progress · {correct}/{total} answered correctly without hints.","ja":"完了{completed}セッション・進行中{pending}セッション・ヒントなしの正解{correct}/{total}問"},
  "reports.versioned.export": {"vi":"Xuất dữ liệu phiên học","en":"Export session data","ja":"セッションデータを書き出す"},
  "reports.versioned.early": {"vi":"Luyện sớm","en":"Early practice","ja":"早めの練習"},
  "reports.versioned.spaced": {"vi":"Ôn giãn cách","en":"Spaced review","ja":"間隔反復"},
  "reports.versioned.practice": {"vi":"Luyện nhớ","en":"Recall practice","ja":"思い出す練習"},
  "reports.versioned.lesson": {"vi":"Bài học","en":"Lesson","ja":"レッスン"},
  "reports.versioned.result": {"vi":"{correct}/{total} đúng · {hinted} có gợi ý","en":"{correct}/{total} correct · {hinted} with hints","ja":"{correct}/{total}問正解・ヒントあり{hinted}件"},
  "kana.localDraft": {"vi":"Bản thử cục bộ · Chưa đồng bộ server.","en":"Local demo · Not synced to server.","ja":"ローカル体験版・サーバー未同期"},
  "kana.localStatus": {"vi":"Đang ở bản thử cục bộ; kết quả không đi vào database học thật.","en":"You are in a local demo; results are not saved to the live learning database.","ja":"ローカル体験版です。結果は本番の学習データベースに保存されません。"},
  "kana.onlineStatus": {"vi":"Bản viết được lưu lên tài khoản khi có mạng.","en":"Your writing is saved to your account when online.","ja":"オンライン時に書いた内容がアカウントに保存されます。"},
  "kana.progressCount": {"vi":"{total} lượt tự luyện · {characters}/92 chữ","en":"{total} practice attempts · {characters}/92 characters","ja":"練習{total}回・{characters}/92文字"},
  "kana.last": {"vi":"Gần nhất:","en":"Most recent:","ja":"直近："},
  "kana.progressInformation": {"vi":"Thông tin tiến độ","en":"Progress information","ja":"進捗について"},
  "kana.download": {"vi":"Tải bản viết để giữ lại","en":"Download your writing","ja":"書いた文字をダウンロード"},
  "kana.reviewStrokes": {"vi":"Xem lại nét mẫu","en":"Review sample strokes","ja":"書き順の見本を確認"},
  "kana.markPractice": {"vi":"Ghi nhận lượt luyện","en":"Mark practice","ja":"練習を記録"},
  "kana.offlineWarning": {"vi":"Chưa đồng bộ dữ liệu học lên server.","en":"Learning data has not been synced to the server.","ja":"学習データはサーバーに同期されていません。"},
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
