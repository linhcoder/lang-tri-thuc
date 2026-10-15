# Quản lý phụ huynh và học sinh

Giao diện được cập nhật theo ảnh thiết kế đã duyệt ngày 15/10/2026: danh sách gia đình bên trái, hồ sơ học sinh đang chọn bên phải. Các nút thêm học sinh, sửa tài khoản và sửa hồ sơ đặt cạnh nội dung tương ứng. Màn hình nhỏ xếp hai phần theo chiều dọc.

Tiến độ lấy từ bản lưu thật: cấp độ, sao, nhiệm vụ, hành trình và trò chơi đã luyện. Ưu tiên bản lưu online đã xác thực khi phiên chơi sử dụng nguồn online; không có bản lưu thì hiển thị trạng thái chưa có tiến độ. API chỉ trả số liệu tổng hợp, không gửi toàn bộ bản lưu.

Kiểm tra: build admin/backend; bộ test API (22 đạt, 1 fixture MySQL bỏ qua); trình duyệt kiểm tra thêm/sửa phụ huynh, đổi mật khẩu, thêm/sửa/chuyển học sinh, tìm kiếm, xem tiến độ và ba kích thước màn hình.
