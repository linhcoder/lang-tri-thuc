# Chuẩn bị chơi thử — 12/10/2026

## Chốt nghiệm thu — 13/10/2026

Người dùng xác nhận đã thực hiện các bước chơi thử Android với phụ huynh/bé và thấy ổn, sau đó xác nhận “xong hết rồi chốt đi”. Đóng đợt bàn giao `beta-ready-v6`, rules 10 / `785f4e7e`; chưa ghi nhận lỗi cần sửa từ lượt thử này. Đây là kết quả do người dùng báo lại, không bổ sung số đo hoặc mẫu thiết bị chưa được cung cấp.

Offsite giữ cấu hình chờ kết nối theo lựa chọn trước đó. Các mục dưới đây là lịch sử trước xác nhận nghiệm thu; bằng chứng kỹ thuật tại [BETA_TECHNICAL_QA](BETA_TECHNICAL_QA.md).

Cập nhật 13/10: bản mục tiêu mới là `beta-ready-v6`, rules 10 / `785f4e7e`. QA ba khu, chơi chung, đồng bộ giữa thiết bị, vận hành và các lượt chạy dài nằm tại [BETA_TECHNICAL_QA](BETA_TECHNICAL_QA.md). Các số liệu/rules bên dưới là lịch sử. Chưa có kết quả Android/iOS thật hoặc chơi thử với trẻ.

Đã thêm góp ý chơi thử cho phụ huynh và hàng đợi phản hồi của quản trị. Giữ game v5/rules 8/contentVersion `8f4c4bbd`. Hướng dẫn thao tác và chạy lại kiểm tra: [PLAYTEST_GUIDE](PLAYTEST_GUIDE.md).

## Render thực 15 phút

`test:render-soak` chạy 902 giây trên Chromium/D3D11 local, 174 chu kỳ xen kẽ ghép tranh/mê cung bằng touch, ba mức tuổi, viewport desktop/dọc/ngang đổi định kỳ và di chuyển bằng bàn phím. Fixture cốt truyện/storage trong context riêng, không dùng hồ sơ người thật; không thay clock hoặc render của Cocos. Các thao tác luyện không đổi tám sao truyện. Browser page errors rỗng.

Số node 405–411, không tăng theo số lần mở/đóng bảng. JS heap sau GC: ban đầu 21,04 MiB, sau warmup 23,18 MiB và cuối 23,68 MiB. Median RAF trong các mẫu khoảng 16,7 ms; p95 lớn nhất trong các mẫu là 66,7 ms. Có đo GC định kỳ, có chạy benchmark load đồng thời một phần phiên; đây không phải đo tổng RAM/GPU, điện thoại thật hoặc cam kết 60 FPS mọi máy. Không kết luận không có leak chỉ từ một phiên 15 phút. Report `apps/game-client/temp/render-soak/report.json` và ảnh cuối là ignored.

## 50 client / 10 phòng local

`test:load-private`: 300 giây, năm client/phòng, vé cấp bằng API thật và kết nối SDK qua HTTP/WebSocket local. Không sửa giới hạn 20 người/phòng. API/SQLite in-memory riêng, không ghi MySQL ứng dụng/VPS. Movement năm lần/giây/client, probe khoảng mỗi năm giây, state NPC/roster và bốn lần ngắt 500 ms/reconnect giữ session.

Nhận 2.950/2.950 probes, p95 RTT 5,98 ms, max 13,01 ms; correction/warning/error đều bằng 0. Event-loop p95 cuối 32,95 ms. Heap không ép GC: đầu 44.736.112 bytes, cuối 43.479.952 bytes; đây không phải chứng minh heap luôn giảm. Cleanup rời phòng/xóa tài khoản đạt, fixture không còn parent/profile/room. Report `temp/load-private/report.json` là ignored. Chưa suy ra khả năng tải MySQL/VPS, public API signup hoặc nhiều instance từ kết quả local này.

## Góp ý và kiểm tra

Phụ huynh chọn lỗi/độ khó/ý tưởng và trò liên quan; gửi 12–1000 ký tự, xem trạng thái/ghi chú quản trị, tìm/lọc và rút lại. Quản trị xem hàng đợi, đổi Chờ xem/Đang xử lý/Đã xử lý, ghi chú tối đa 500 ký tự, có audit. Parent chỉ thấy góp ý của mình; export bao gồm góp ý, xóa tài khoản xóa góp ý. Rate/size/count bounds có validation; dữ liệu cũ được thêm mảng feedback rỗng khi đọc, không cần thay schema SQL.

`test:api`: tám ca đạt, một ca MySQL có điều kiện skip; ca mới kiểm tra quyền, dữ liệu không hợp lệ, trạng thái/audit, export/rút lại/account delete và limit. `test:mysql`: năm ca trên DB `_test` đạt. `test:feedback-ui`: gửi/chặn bỏ sửa/literal text/ghi chú/status/filter/rút lại/mobile đạt với DB thử riêng. `test:admin` và `test:backend-ui` hồi quy đạt. Build API/admin/Linux rooms và diff whitespace đạt. Đã xem ảnh local `apps/admin/temp/feedback-qa`.

## Triển khai và QA live

Release `68f79b9-playtest-feedback-8f4c4bbd-20261012`, source baseline `68f79b9` cùng working tree; overlay SHA-256 `5fb35242f46583c1d4148b6453656e8df8c1ec3e1f18ad7ed34827f9f1c0f94a` khớp remote. Backup/restore drill `/opt/lang-tri-thuc/backups/database-20261012T123052Z.sql` khớp state, DB thử dọn thành công. Giữ release backend usability để rollback. Local stack cũng đã cập nhật và doctor OK.

`verify-feedback.cjs` qua HTTPS đạt parent submit/MySQL durable, admin chỉ cập nhật góp ý tạo bởi QA, parent nhận ghi chú, export/rút lại/mobile bounds; errors rỗng. Tài khoản QA được xóa trong finally; không sửa nội dung game hoặc góp ý người thật. `verify-api.cjs` đạt login/catalog/quyền truy cập/phòng vé trên cùng phiên bản. Report ignored tại `temp/deploy/qa/feedback`.

Gate còn lại là trẻ có giám sát, điện thoại thật, duyệt nội dung/quyền art, phiên nhiều giờ và benchmark production. Đợt này không tự đánh dấu nội dung là approved, không tạo NPC AI hoặc mở game công khai.

## Chuẩn bị lượt Android và rà lại sau commit — 12/10/2026

Source các đợt nâng cấp/mở rộng được commit tại `1de349a`. Health staging kiểm tra lại trả `ok=true`, MySQL và contentVersion `547e04f2`; không triển khai app mới trong lượt chuẩn bị này. Hai tài khoản expansion QA còn tồn đã được xác minh alias/role, xóa bằng API của chính fixture, kiểm tra phiên/đăng nhập cũ trả 401 và audit database không còn alias expansion. Audit dùng tài khoản database ứng dụng, không đọc cấu hình MySQL root aaPanel; report ignored `temp/deploy/qa/expansion-cleanup.json`.

Chạy lại `test:feedback-ui` và `test:backend-ui` đạt trên API/SQLite fixture riêng. Preview đầu thiếu VITE_API_URL nên ca góp ý timeout; cấu hình lại URL local 33000 rồi chạy lại đạt. `test:expansion-ui` trên build local mặc định đạt bảy hoạt động và reload ở desktop 1280×720, touch dọc 390×844, ngang 844×390 cho ba nhóm tuổi. Đã xem ảnh phụ huynh mobile và bảng chăm hoa dọc. Các kiểm tra này dùng browser giả lập; không ghi là Android thật.

Doctor ban đầu thấy build/config có đủ nhưng stack local đầy đủ không chạy. Preview UI/game chỉ được bật riêng cho lượt QA, không khởi động hay thay dữ liệu MySQL local. Hướng dẫn đã thêm lịch 10–15 phút, phiếu quan sát và checklist Android theo lựa chọn của người dùng. Phần chơi thử với phụ huynh/bé chưa có kết quả; ưu tiên nhận và xử lý góp ý từ lượt Android tiếp theo.
