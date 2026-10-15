# Quản lý phụ huynh và học sinh

Giao diện được cập nhật theo ảnh thiết kế đã duyệt ngày 15/10/2026: danh sách gia đình bên trái, hồ sơ học sinh đang chọn bên phải. Các nút thêm học sinh, sửa tài khoản và sửa hồ sơ đặt cạnh nội dung tương ứng. Màn hình nhỏ xếp hai phần theo chiều dọc.

Tiến độ lấy từ bản lưu thật: cấp độ, sao, nhiệm vụ, hành trình và trò chơi đã luyện. Ưu tiên bản lưu online đã xác thực khi phiên chơi sử dụng nguồn online; không có bản lưu thì hiển thị trạng thái chưa có tiến độ. API chỉ trả số liệu tổng hợp, không gửi toàn bộ bản lưu.

Kiểm tra: build admin/backend; bộ test API (22 đạt, 1 fixture MySQL bỏ qua); trình duyệt kiểm tra thêm/sửa phụ huynh, đổi mật khẩu, thêm/sửa/chuyển học sinh, tìm kiếm, xem tiến độ và ba kích thước màn hình.

Đã triển khai VPS: release `families-c716680-20261015`, source `c716680`, contentVersion giữ `0d971c1a`. Overlay gồm 12 file, SHA-256 `3a1d941fe0632f9941282888d76a7f42575a355a13eddf6dbb06949834a9842c`. Bản sao lưu `/opt/lang-tri-thuc/backups/database-20261015T165347Z.sql` đã được kiểm tra khôi phục trước kích hoạt.

Kiểm tra trực tiếp HTTPS đạt: chọn lần lượt các học sinh đã lưu, mở tiến độ thật, desktop 1600 và mobile 390 không tràn ngang, không có lỗi JavaScript; hai API MySQL khỏe và dữ liệu CMS NPC được giữ nguyên. Kiểm tra API sau triển khai xác nhận đủ 90 bài học, 12 NPC và 24 asset. Ảnh kiểm tra lưu cục bộ trong `temp/deploy/qa/families-live/`.
