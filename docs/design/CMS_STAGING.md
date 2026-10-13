# CMS — luồng nội dung staging

Đợt 13/10/2026 triển khai luồng ưu tiên người dùng đã chọn: **asset có sẵn → NPC mới → đặt trên bản đồ → hội thoại / nhiệm vụ liên kết → kiểm duyệt → xuất bản staging → Cocos**. Đây là lớp NPC bổ sung; các phân hệ nâng cao trong master prompt tiếp tục theo giai đoạn, không được coi là đã hoàn thành toàn bộ.

Bản sửa va chạm/bố trí ngày 13/10/2026 chuyển navigation sang `818a32e3`; snapshot staging hiện tại `500f4374bb2c…` giữ nguyên NPC/hội thoại từ `578f129d038e…`, có baseVersion mới. Migration chỉ áp dụng bản đã xuất bản hợp lệ từ `785f4e7e`, giữ lịch sử và bản nháp; chi tiết tại [LANDMARK_FIXES](LANDMARK_FIXES.md). Tải lại game sau cập nhật và làm mới workspace CMS nếu đang mở revision cũ.

## Sử dụng

1. Đăng nhập admin, mở **CMS / Xuất bản → Nhân vật mới → Thêm NPC mới**.
2. Chọn ảnh nhân vật từ asset đã đóng gói trong game; sửa tên, trạng thái, nội dung hội thoại. Mỗi hội thoại có nút bắt đầu và các lựa chọn đi tới nút khác. Có thể thử hội thoại ngay trong form và liên kết nhiệm vụ hiện có.
3. Ghi chú ít nhất 12 ký tự rồi lưu NPC. Chuyển **Đặt trên bản đồ**, kéo NPC hoặc nhập ô X/Y, ghi chú và lưu bố trí.
4. Trong **Xem trước game**, chọn bản nháp đã lưu. Iframe chạy build Cocos thật; quyền preview chỉ lấy từ phiên admin, không đưa token vào URL và không ghi bản nháp vào cache staging.
5. Trong **Kiểm duyệt / Xuất bản**, ghi chú, đánh dấu đã kiểm tra, duyệt rồi xuất bản staging. Mở lại game để nhận manifest mới; không cần build lại khi chỉ sửa những NPC này.
6. Lịch sử lưu snapshot bất biến, cho tải manifest và rollback phiên bản tương thích. Rollback thay bản staging đang chạy, không ghi đè bản nháp.

## Ranh giới dữ liệu

- NPC thêm mới có ID `cms-*`, tối đa 40. Ẩn NPC thay vì xóa cứng; lịch sử phát hành giữ ID và nội dung.
- NPC bổ sung không chặn đường và không sửa collision hay nhiệm vụ gốc. Bản đồ kiểm tra lại ô spawn, NPC khác, vật cản, nước, điểm nhiệm vụ và đường tiếp cận ở API.
- Nhiệm vụ liên kết mở chương hiện có. Không tạo hoặc tự cấp phần thưởng mới; game/server vẫn dùng quy tắc tiến độ hiện tại.
- Mỗi lần sửa tăng revision và đưa về draft. Ghi với revision cũ trả 409 để tránh ghi đè phiên khác. Duyệt và publish có kiểm tra lại tham chiếu ảnh, nhiệm vụ và cạnh hội thoại.
- Publish dùng transaction MySQL/SQLite hiện có, hash nội dung SHA-256, snapshot và audit. Giới hạn 50 snapshot, không tự xóa lịch sử. Không có endpoint publish production trong đợt này.
- Game kiểm schema và `baseVersion`, cache manifest staging hợp lệ gần nhất, fallback khi API lỗi. Cache được phân theo phiên bản game; bản nháp không được fallback sang cache staging.
- Game tải manifest khi mở; phiên đang chơi không tự đổi nội dung giữa chừng. Những thay đổi mã nguồn, asset mới ngoài bộ có sẵn hoặc schema vẫn cần build đồng bộ.

## API

`GET /admin/cms`, `PUT /admin/cms/draft`, `PUT /admin/cms/review`, `POST /admin/cms/publish`, `POST /admin/cms/rollback`, `GET /admin/cms/preview` yêu cầu phiên admin. `GET /content/staging` chỉ trả snapshot đã xuất bản, không chứa bản nháp. Các endpoint được liệt kê trong OpenAPI hiện có.

Repository tự bổ sung trường `cms` khi truy cập; dữ liệu cũ không cần rewrite và không đổi bảng tài khoản/tiến độ. Đây là migration tương thích trên kho JSON transactional hiện tại, chưa chuyển sang Prisma/tập bảng mới.

## Chạy và kiểm thử

Trên Windows dùng `npm.cmd run api:build`, `npm.cmd run admin:build`, `npm.cmd run check:client`, `npm.cmd run test:api`.

Build Cocos: đặt `GAME_BUILD_NAME=cms-staging-v1`, chạy `npm.cmd run web:build`. `npm.cmd run test:cms` dùng Vite admin local port 35173 (API cấu hình 33000), khởi động API fixture 33003 và game fixture 38081, không sửa dữ liệu người chơi. Kiểm tra tạo NPC, asset, hội thoại phân nhánh, kéo thả, duyệt, xuất bản, tọa độ Cocos, nhiệm vụ liên kết, tách bản nháp và preview có xác thực. Báo cáo/ảnh ở `apps/admin/temp/cms-qa/` được ignore. API test còn kiểm stale revision, rollback và cache khi offline. MySQL integration chỉ chạy khi cấu hình môi trường tương ứng.

Build admin staging cần `VITE_API_URL=https://ltt.vui-hoc.xyz/api`, `VITE_GAME_URL=https://ltt.vui-hoc.xyz/game/`; triển khai qua overlay và health/rollback trong runbook aaPanel. Giữ nguyên các UUID Cocos cũ; module mới có `.meta` riêng.

## Các giai đoạn tiếp theo chưa triển khai

Upload/versioning asset mới; world editor cho cây/nhà/trigger, layer/transform/multi-select/undo-redo; lịch sinh hoạt và điều kiện hội thoại; nhiệm vụ mới với rewards/dependency graph; ngân hàng câu hỏi mở rộng; Daily Events biên tập; publish production và manifest tải asset remote. CMS hiện tại tiếp tục giữ các màn quản lý gia đình, chương, bài học và metadata tài nguyên cũ.
