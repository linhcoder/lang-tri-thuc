# Texture cỏ và đường đất — 15/10/2026

Hai ảnh riêng được tạo bằng OpenAI built-in `image_gen` theo mẫu người dùng, giữ nguyên ảnh gốc:

- Cỏ: `apps/game-client/assets/resources/village/grass-meadow-v1.png`, 1254×1254; prompt tại [grass-meadow-v1.prompt.json](grass-meadow-v1.prompt.json).
- Đất: `apps/game-client/assets/resources/village/dirt-path-v1.png`, 1254×1254; prompt tại [dirt-path-v1.prompt.json](dirt-path-v1.prompt.json).

Registry `ground.meadow-texture` dùng ảnh cỏ mới cho nền trong làng và vùng ngoài bản đồ. `ground.dirt-texture` được tải tùy chọn và phủ lên lõi đường đất bằng CanvasPattern theo tọa độ thế giới. Tỉ lệ chiếu 2:1, độ rộng, đường cong và mép mềm của các tuyến giữ theo bố cục hiện có. Texture được bake vào chunk, không vẽ lại theo từng frame. Khi ảnh lỗi, màu nền và đường dự phòng vẫn hoạt động.

TypeScript, test client và build Cocos đạt. QA trình duyệt xác nhận hai texture khác UUID và đủ kích thước nguồn, mười cảnh vùng, 20 ảnh 1440×900/844×390, không có page error; đã xem ảnh làng và đồi khoa học. Báo cáo/ảnh local ignored: `apps/game-client/temp/ground-textures-qa/`.

## Triển khai VPS

Đã phát hành tại https://ltt.vui-hoc.xyz/game/, release `ground-materials-b08555b-20261015`, build `web-desktop`, contentVersion `d92c670c`. Commit ảnh/tích hợp `83a0812`; commit sửa thời gian chờ mở hồ sơ `b08555b`. Release này đồng thời đưa chức năng ghi nhớ phiên/chuyển học sinh của commit `43056e4` lên VPS.

Gói nền gồm 29 file, SHA-256 `8690bd5b27fce24b9ceb4ae27cdae12ab14ccde1989439c45f69561b0e0ad043`. Overlay cuối ba file, SHA-256 `b8159ced9b51027cedecfd1260f7420eb5f95289233d15feca6cc04415b999ba`; checksum source/Web khớp. Backup cuối `/opt/lang-tri-thuc/backups/database-20261015T031737Z.sql` phục hồi thử đạt. Giữ release `ground-materials-83a0812-20261015` và bản cảnh trước `journey-regions-546c4ff-20261015` để rollback. Hai API MySQL khỏe, CMS không đổi.

QA HTTPS đạt hai texture riêng 1254×1254, đủ mười cảnh, ảnh desktop/mobile ngang và không có page error; đã xem ảnh làng/đồi khoa học. API/quyền quản trị và chặn phòng không vé đạt. Kiểm tra cuối xác nhận phiên phụ huynh 30 ngày, reload tự vào học sinh A, chuyển sang B và reload tiếp tục B. Yêu cầu `/profiles/:id/play` có hạn chờ 30 giây để tránh timeout 10 giây trên WAN; các request khác vẫn giữ hạn cũ. Tài khoản QA của cả các lượt chẩn đoán và lượt cuối đã xóa. Báo cáo/ảnh local ignored: `temp/deploy/qa/ground-textures-live/`.
