# Xưởng nội dung · hướng dẫn và hợp đồng dữ liệu

Đợt này thêm một luồng biên tập dùng được trước khi triển khai backend. Giữ nhận diện Atelier, năm mục học chính và login hiện tại. Xưởng có không gian riêng, không biến “Quản lý gia đình” thành quyền biên tập nội dung.

Mở `#admin` hoặc vào Sơ đồ trang → Xưởng nội dung mẫu. So sánh PC/tablet/mobile tại `admin-compare.html`. Cột trước mô phỏng cách sửa tệp JSON bằng nội dung thật; trước đây chưa có màn quản trị để chụp lại.

## Thử trong vài phút

1. Mở bản nháp “Giới thiệu bản thân”. Bản thứ hai cố ý thiếu đáp án và giải thích để thử báo lỗi. Các mẫu chưa có người duyệt hoặc kết quả học được dựng sẵn.
2. Sửa tổng quan, lời thoại, khối giải thích hoặc câu hỏi. Chọn đáp án đúng bằng radio; viết lý do cho từng lựa chọn. Ghép câu dùng mũi tên đổi thứ tự, không cần kéo thả.
3. Trong Phiên học, chọn 3/5/15 phút; thêm, bỏ hoặc đổi thứ tự các bước. Thời gian là quỹ tối đa; không phải mục tiêu phải lấp đầy. Bước mới chưa tự được đưa vào mọi phiên.
4. Lưu bản nháp. Xem trước trên PC/tablet/mobile, chọn 5/15 phút và sáng/tối. Bài chạy bằng cùng renderer và engine với người học. Câu trả lời thử chỉ ở bộ nhớ của khung; không ghi điểm, lịch ôn hay sổ học tập của hồ sơ thật.
5. Mở Kiểm tra & phát hành. Nhấn một lỗi để đến đúng phần/ô cần sửa. Lưu vẫn cho phép bản nháp chưa hoàn chỉnh; phát hành bị chặn khi còn lỗi.
6. Điền người thực sự duyệt, nguồn/quyền sử dụng và xác nhận đã kiểm tra. Nội dung bên ngoài cần ghi chú căn cứ quyền sử dụng. Lưu rồi xác nhận Phát hành trong demo. Sửa nội dung sau khi duyệt sẽ yêu cầu xác nhận lại đúng bản mới.
7. Mở thư viện: lượt học mới dùng phiên bản mới. Người còn phiên dở tiếp tục đúng bản cũ. Lịch ôn cũ dùng nội dung đã học, không tự chuyển điểm sang bản mới.

Phát hành trong demo **chỉ cập nhật trên trình duyệt hiện tại**. Không tự công khai Site và không gửi nội dung sang thiết bị/người khác. Tên reviewer là dữ liệu thử, chưa phải danh tính đã xác thực. Kiểm tra tự động xác nhận cấu trúc, không thay người duyệt tiếng Nhật hoặc quyền sử dụng.

## Phạm vi đã làm / để sau

| Đã làm | Để sau |
| --- | --- |
| Một mẫu bài N5: hội thoại, giải thích, trắc nghiệm, ghép câu, tự giới thiệu | Mẫu nội dung khác, đề đầy đủ N5–N1, nghe/nói |
| Tạo bài từ mẫu, sửa bản nháp, thêm câu/khối/mẫu ôn | Nhập PDF hàng loạt, biên soạn bằng AI |
| Chọn nhân vật từ 24 hồ sơ hư cấu hiện có | Quản trị toàn bộ thế giới nhân vật và timeline |
| Kiểm tra tham chiếu, đáp án, câu sửa, kế hoạch, thời gian | Đánh giá tự động chất lượng tiếng Nhật hoặc độ khó JLPT |
| Xem trước thật, lưu nháp, phiên bản bất biến, lịch sử và gói JSON | Phân quyền server, reviewer riêng, đồng bộ và xuất bản dùng chung |

Không nên nhân bản hàng trăm bài trước khi chốt mẫu biên soạn và quy trình review. Đổi nhãn N5 thành N2 không biến mẫu tự giới thiệu thành bài N2; mẫu hiện chặn mức/template chưa hỗ trợ.

## Nhập/xuất và khôi phục

- Xuất JSON lấy đúng bản đang chỉnh, kể cả khi chưa lưu. Sao lưu xưởng lấy các bản đã lưu, phiên bản và sự kiện biên tập; không kèm hồ sơ học viên.
- Nhập JSON luôn tạo bản nháp mới, giữ mã bài và bỏ xác nhận reviewer từ file. Không tự ghi đè bản đang dùng hoặc phát hành nội dung.
- Bản nháp chưa đủ đáp án/giải thích có thể nhập lại để sửa, nếu cấu trúc còn biên tập an toàn. Sai kiểu dữ liệu, mã không hợp lệ, template lạ, khóa nguy hiểm hoặc tham chiếu không thể sửa qua form bị từ chối.
- Hai cửa sổ cùng sửa: revision chặn ghi đè bản mới. Bản đang chỉnh vẫn ở bộ nhớ, có nút xuất riêng trước khi tải lại.
- Bản phát hành bị khóa. “Tạo nháp từ bản này” sao chép thành một phiên bản mới dựa trên head hiện hành; không sửa lịch sử tại chỗ.
- Đặt lại hồ sơ/hoạt động học không xóa nội dung biên tập. Xưởng chưa cung cấp nút xóa hàng loạt.

## Các phần kỹ thuật chính

| Tệp | Trách nhiệm |
| --- | --- |
| `dist/content-model.js` | Kiểm tra nội dung, tạo/lưu nháp, xác nhận đúng nội dung, phiên bản, import và tìm bản cần ôn |
| `dist/content-store.js` | Adapter lưu xưởng; kiểm tra cấu trúc/revision, báo lỗi, không tự ghi đè dữ liệu hỏng |
| `dist/content-catalog.js` | Tra nội dung theo ID/version; chỉ bản đã phát hành vào thư viện học |
| `dist/admin-ui.js`, `admin.css` | Form, lỗi đúng vị trí, preview, xác nhận phát hành; token kế thừa Atelier |
| `dist/lesson-ui.js` | Player dùng catalog; chế độ preview riêng trong bộ nhớ; giữ snapshot của phiên cũ |
| `dist/lesson-engine.js` | Quy tắc học độc lập giao diện; luyện tập lấy câu từ kế hoạch, không cố định mã bài |
| `scripts/build-lesson.mjs` | CLI dùng cùng validator với form |
| `scripts/build-authoring.mjs` | Hai bản nháp mẫu có chủ đích, không tạo phê duyệt giả |
| `scripts/build-demo.py` | JSON/SQLite fixture dùng chung; schema phiên bản 2 |

Hợp đồng `nihongo-content/v1` chứa `content`, trạng thái và metadata review. `engine: lesson/v1`, `template: self-introduction/v1` khai báo khả năng hỗ trợ; translation key theo content ID và version. Khi thêm loại bài, thêm mẫu/renderer tương ứng và kiểm tra hợp đồng trước khi mở trong UI.

`ContentDraft`: ID nháp, content ID, base version, revision, trạng thái, nội dung, review, thời điểm. `ContentRelease`: bản nội dung bất biến, thời điểm phát hành, xác nhận và danh sách phần đổi. `ContentEditorEvent`: loại thao tác, nháp, content, thời điểm và version.

Trong demo, dấu kiểm tra nội dung của xác nhận dùng fingerprint ổn định để phát hiện chỉnh sửa; đây không phải chữ ký số hoặc cơ chế phân quyền. Backend cần danh tính reviewer đã xác thực, digest server và kiểm tra quyền ở từng endpoint.

## Bảo toàn bằng chứng học

- Session giữ content ID/version và snapshot. Phát hành mới không thay định nghĩa/câu đang chọn của session cũ.
- Attempt có learner/session/content/version/question/version, đáp án và mức hỗ trợ. Không cập nhật kết quả đầu tiên để làm đẹp điểm.
- Review giữ content version và concept. Nếu catalog không còn một release cục bộ, có thể dùng snapshot của session đã tạo lịch đó.
- Bảng câu hỏi SQLite dùng khóa gồm question ID, question version, content version và content ID. Khóa ngoại của attempt đồng thời kiểm tra learner/session/content/version; không gắn câu trả lời của người/bản khác.
- Fixture có trigger chặn cập nhật định nghĩa đã phát hành và câu trả lời đã ghi. Đây là mô hình minh họa, không phải migration cho một hệ thống production đang vận hành.

Production nên phát hành trong transaction: kiểm tra quyền, base revision và nội dung; tạo immutable release; đổi catalog head; ghi audit event. Bài học cần check idempotent và kiểm tra learner ownership phía server. Browser localStorage hiện chỉ có kiểm tra revision tốt nhất có thể, không phải transaction đa thiết bị.

## Design system và responsive

Kế thừa nền kem, forest/ink green, champagne, Newsreader/Manrope và Noto Serif JP. Các token mới: `--editor-width: 1280px`, gap 24px, radius 18px, soft/muted/warning theo theme. Token màu dẫn xuất được tính lại ở theme tối; đồng thời sửa nền phụ trong bài học để không bị nền sáng/chữ sáng.

Component dùng lại: field có label/help/error, tab biên tập, mục câu hỏi, lựa chọn/đáp án, mảnh câu, dòng kế hoạch, bảng ảnh hưởng, lỗi dẫn đến ô, history và action bar. Mobile có select câu hỏi, form một cột, input 16px, nút lưu luôn truy cập được. Desktop có index câu hỏi riêng; không kéo dài menu học viên.

## Kiểm tra đã hoàn tất

- 58 kiểm thử JavaScript + 3 kiểm thử SQLite đều đạt: validator, nháp, publish, import an toàn, xác nhận hết hiệu lực khi sửa, stale revision, snapshot và review khác phiên bản, foreign key và immutability; gồm 35 kiểm thử trước đợt này.
- Browser: tạo bài bằng form; sửa hai lỗi và đi đúng ô; cảnh báo chưa lưu; giữ sửa đổi sau reload; xuất rồi nhập JSON và bỏ review từ file.
- Browser: hoàn tất preview có câu dùng gợi ý. Báo cáo thật giữ nguyên `0 phiên / 0 câu`; thử lưu sổ cũng không ghi vào hồ sơ.
- Browser: phát hành v2 trong khi có session v1; reload vẫn ở v1. Người dùng khác/trình duyệt khác chưa nhận release cục bộ.
- Khung thật 1366×900, 768×1024, 390×844 không tràn ngang. Kiểm tra preview sáng/tối và sửa tương phản nền phụ. Console không có lỗi từ website ở các màn đã thử.
- Chưa kiểm tra iPhone thật, bàn phím ảo hoặc screen reader. Không tuyên bố đã đạt chứng nhận accessibility.

Ảnh: `screenshots/nihongo-studio-compare-pc.jpg`, `screenshots/nihongo-studio-compare-tablet.jpg`, `screenshots/nihongo-studio-compare-mobile.jpg`.

## Cách kiểm tra lại

```sh
node scripts/build-lesson.mjs
node scripts/build-authoring.mjs
python scripts/build-demo.py
node --test tests/*.test.cjs
python -m unittest discover -s tests -p 'test_*.py' -v
```

Bước tiếp theo cần chốt là quyền biên tập/duyệt, mô hình tài khoản–hồ sơ và hành vi khi xung đột đa thiết bị. Sau đó thay adapter bằng API/database; chưa cần microservices hoặc một trình dựng nội dung tổng quát.
