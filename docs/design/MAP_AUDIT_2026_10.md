# Rà soát bản đồ — 16/10/2026

Đã xuất bản bản đồ revision **2**, từ bản nháp revision **6**, trên VPS `ltt.vui-hoc.xyz`. Dùng cơ chế xuất bản dữ liệu hiện có; không cần thay bản build game. Content version vẫn là `0d971c1a`.

## Điều chỉnh

- Giữ 25 ghi đè vị trí/kích thước vật thể đã lưu trong admin, cùng các chỉnh sửa NPC của người dùng: Tí và Na `(18,12)`, nghệ nhân gốm `(43,42)`, Chị Mai `(43,25)`.
- Anh Nam: `(39,14)` → `(44,19)`, đứng phía trước vườn thay vì bị luống rau che thân.
- Chị Hằng–Chú Cuội: `(33,28)` → `(36,35)`, tránh bị cây và khu trường che khuất.
- Xác nhận cô giáo Lan hiển thị phía trước sân trường trong góc nhìn đã kiểm tra.

Lần xuất bản đầu là revision 1; revision 2 bổ sung vị trí Chị Hằng–Chú Cuội sau khi xem thêm ảnh kiểm tra. Các lần ghi kiểm tra bản nháp, bản đang công bố và tọa độ NPC trước khi thay đổi để tránh ghi đè chỉnh sửa đồng thời.

## Kiểm tra

Snapshot công khai của bản cuối: [map-layout-2026-10-16.json](map-layout-2026-10-16.json).

```sh
node tools/check-published-layout.cjs docs/design/map-layout-2026-10-16.json
```

Kiểm tra hình học và cấu hình NPC đạt: cả 12 NPC có ô đứng hợp lệ và ít nhất một đường từ điểm xuất phát `(20,20)` tới ô tiếp cận liền kề. Công cụ cũng phát hiện lỗi ô đứng Chị Mai trong snapshot công bố ban đầu. Đây là kiểm tra ô đứng/đường tiếp cận, không thay cho kiểm tra toàn bộ chuyển động tuần tra hay mọi vùng nhiệm vụ.

Xem trước trong trình duyệt dùng chính build trên VPS và chỉ thay phản hồi bản đồ trong phiên kiểm tra. Chụp các góc nhìn 12 NPC, kiểm tra lại các vị trí điều chỉnh, desktop `1440×900` và màn hình ngang `844×390`. Ảnh cục bộ: `temp/deploy/qa/map-audit/`; xác minh bản công bố: `temp/deploy/qa/map-live/`. Tài khoản gia đình kiểm tra được xóa sau mỗi lượt.

Trình kiểm tra admin còn hai cảnh báo sai về Ông Đồ và bác nông dân: hàm kiểm tra địa hình coi ô đứng cố định của chính hai nhân vật là ô bị chiếm. Đã xác nhận nguyên nhân trong mã và chấp nhận riêng hai cảnh báo này khi xuất bản. Chưa thay mã của bộ cảnh báo trong đợt chỉnh dữ liệu này.

Backup trước thay đổi: `/opt/lang-tri-thuc/backups/database-20261015T184622Z.sql`; khôi phục vào cơ sở dữ liệu tạm cho kết quả trùng khớp, cơ sở dữ liệu tạm đã xóa. Lịch sử xuất bản giữ revision 0, 1 và 2; snapshot trước chỉnh sửa cũng lưu cục bộ tại `temp/deploy/map-audit-before.json`.

Lượt xác minh cuối tải trực tiếp revision 2 từ API thật, không thay phản hồi: tọa độ 12 NPC và toàn bộ ghi đè vật thể trùng snapshot; các góc nhìn Anh Nam, Chị Mai, cô giáo Lan và Chị Hằng–Chú Cuội cùng màn hình ngang được chụp lại. Không có lỗi JavaScript của trang trong lượt này.

Người chơi đang mở game cần tải lại trang hoặc vào lại làng để nhận bản đồ mới.
