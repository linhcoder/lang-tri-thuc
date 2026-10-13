# Giao diện quản trị trực quan

Thiết kế theo ảnh tham chiếu người dùng: sidebar xanh đậm, thanh tìm chức năng, nền sáng, thẻ số liệu, thư viện ảnh và bản đồ có bảng thuộc tính bên phải. Giao diện thích ứng với máy tính và màn hình điện thoại.

## Chức năng đã triển khai

- Tổng quan hiển thị số phụ huynh, hồ sơ học sinh, NPC, ảnh asset; biểu đồ thao tác quản trị 7 ngày, trạng thái kiểm duyệt và nhật ký gần đây từ API thực tế.
- Phụ huynh / học sinh: tìm theo tên đăng nhập hoặc tên bé, lọc tuổi, phân trang, thêm phụ huynh, thêm và sửa hồ sơ học sinh. Học sinh sử dụng hồ sơ thuộc tài khoản phụ huynh.
- Sửa tài khoản: đổi tên đăng nhập hoặc đặt mật khẩu mới (12–128 ký tự). Không hiển thị mật khẩu cũ. Đặt mật khẩu mới thu hồi các phiên của phụ huynh đó; tài khoản quản trị không thuộc danh sách sửa này. Thao tác được ghi nhật ký mà không ghi mật khẩu.
- Bản đồ NPC: dùng ảnh và bộ vẽ nền, đường đất, nước của game; kéo NPC, kéo nền, thu phóng, bật/tắt lưới, toàn màn hình; xem và sửa tọa độ ô X/Y, tên, ghi chú. Chặn ô nước, vật cản, điểm nhiệm vụ và vị trí có NPC khác; API kiểm tra lại trước khi lưu.
- Thư viện ảnh: tìm/lọc nhóm, xem ảnh từng asset và phóng lớn PNG/sprite sheet. Ảnh được lấy qua endpoint chỉ dành cho admin, từ danh sách tài nguyên cho phép.
- Khi rời trang đang chỉnh sửa, giao diện xác nhận bỏ thay đổi chưa lưu.

## Bố trí NPC là bản nháp

Lưu vị trí trong admin tạo bản nháp dữ liệu. Quy trình kiểm duyệt, xuất gói và dựng game/server hiện có vẫn cần thực hiện để vị trí xuất hiện trong phiên game của người chơi. Giao diện không có nút xuất bản giả hoặc tự sửa bản đồ đang chạy.

## Kiểm chứng

`npm run test:api` kiểm tra phân quyền, dữ liệu gia đình, mật khẩu, thu hồi phiên, nhật ký và ảnh preview. `npm run test:admin-workspace` kiểm tra luồng thêm/sửa tài khoản và học sinh, kéo thả NPC, chặn ô không hợp lệ, xem ảnh và độ rộng màn hình 390/844 px trên cơ sở dữ liệu riêng. `npm run test:admin` kiểm tra các chức năng quản trị cũ.

Ảnh chụp và báo cáo kiểm thử cục bộ nằm trong `apps/admin/temp/workspace-qa/` (không đưa vào Git). Kiểm thử trình duyệt không thay thế lượt thử trên Android thật.
