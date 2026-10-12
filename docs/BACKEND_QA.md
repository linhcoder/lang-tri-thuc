# Backend dễ dùng hơn — 12/10/2026

Đợt này nâng cả ba phần: quản trị, phụ huynh và API/vận hành. Giữ rules/contentVersion `8f4c4bbd`, game build `piece-maze-npc-v5` và dữ liệu MySQL hiện có.

## Chức năng

- Tổng quan quản trị: tài khoản, hồ sơ, phòng còn hạn, báo cáo chờ xử lý, nội dung nháp/đã kiểm tra/đã duyệt và nhật ký gần nhất.
- Tìm kiếm không phân biệt dấu/case, lọc trạng thái, tên chủ đề tiếng Việt. Kiểm duyệt bằng form có ghi chú và validation; chỉ duyệt sau khi đã kiểm tra. Báo cáo/nhật ký dễ đọc hơn, layout responsive, trạng thái tải và phản hồi thành công/lỗi.
- Phụ huynh: đổi tên hồ sơ; tiến độ sao truyện riêng với receipt mini game; tạo/dùng lại/tham gia phòng, danh sách phòng còn hạn, khóa/mở, mã mời sao chép và vé gắn đúng hồ sơ. Vé hết hạn khóa nút mở game. Tải lại giữ phiên trong tab, đăng xuất xóa phiên. Có cảnh báo khi rời nội dung đang sửa.
- API: `/me`, `/ready`, `/rooms`, đổi tên hồ sơ, `/admin/overview`, tài liệu OpenAPI sinh từ route/schema tại `/admin/api-docs`. Giữ kiểm tra vai trò/ownership. Lỗi có code/requestId, thông báo tiếng Việt và fields cho validation; lỗi server không lộ thông tin kết nối. Giữ HTTP 429 khi rate-limit.
- `npm run backend:doctor`: kiểm tra local config/build/API+DB/ports, có JSON và mã thoát; không in credential hay sửa dữ liệu. Hướng dẫn tại [BACKEND_GUIDE](BACKEND_GUIDE.md).

## Kiểm tra

`test:api`: bảy ca đạt, một ca MySQL có điều kiện được bỏ qua; gồm validation, ownership, roles, room expiry, OpenAPI và readiness/rate-limit. `test:mysql`: năm ca trên database `_test` đạt, gồm rollback, ghi đồng thời, Unicode và reconnect. `test:server`: bảy integration đạt, gồm multiplayer/chống giả action/reconnect/tải local. Các warning SDK thiếu handler fixture vẫn được ghi trong log; không phải lỗi test.

`test:admin` đạt biên tập chương/nhiệm vụ/bài học/NPC/asset, kiểm duyệt, export và xóa có xác nhận. `test:backend-ui` đạt dashboard, tìm kiếm/lọc, cảnh báo bỏ sửa, restore phiên, OpenAPI download, profile rename/progress, khóa phòng, đổi hồ sơ xóa vé cũ, vé hết hạn và mobile không tràn ngang. Các thao tác biên tập chạy trên SQLite in-memory riêng, không sửa nội dung thật. Đã xem ảnh desktop/mobile trong `apps/admin/temp/usability-qa` (ignored). Build API/admin/server và diff whitespace đạt.

Local MySQL Laragon đã khởi động với cấu hình/data cũ; stack nền chạy API 33000, admin 35173, game 38080 và rooms 32567. Doctor báo mọi mục OK.

## Triển khai

Release `68f79b9-backend-usability-8f4c4bbd-20261012`, source baseline `68f79b9` cùng working tree. Overlay SHA-256 `1e76a59588f34e9708ee9a0fdc6fbc96da03dd1ba8e653e8cd96ebce94672188` khớp remote. Backup/restore drill `/opt/lang-tri-thuc/backups/database-20261012T094527Z.sql` khớp state, DB thử được dọn. Linux API/rooms build và nginx -t đạt. Release ghép tranh v5 giữ để rollback.

Live `verify-backend.cjs` đạt MySQL readiness, tổng quan/tìm kiếm/OpenAPI, đổi tên lưu bền, tiến độ, khóa/mở phòng, giữ phiên và mobile bounds; errors rỗng. Quản trị chỉ đọc; mọi parent write dùng tài khoản QA riêng và xóa trong finally. `verify-api.cjs` đạt quyền truy cập/catalog/login/phòng vé. Báo cáo/ảnh local ở `temp/deploy/qa/backend-usability` (ignored).

`verify-web.cjs` trên cùng release đạt parent UI, signed WebSocket hai client, ngoại hình/emote, lưu server và reload online/offline; errors rỗng. Kiểm tra cuối xác nhận services/timers active, health MySQL/contentVersion đúng và symlink release mới.

Không thay các gate đã ghi: chuyên gia/trẻ có giám sát, điện thoại thật, render dài và tải production lớn. Giao diện được kiểm tra bằng browser và viewport giả lập.
