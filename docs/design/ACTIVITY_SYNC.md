# Đồng bộ hoạt động theo hồ sơ

Tranh, bước chăm góc làng, bước ngày lễ, sổ khám phá, huy hiệu mùa và ván luyện được lưu qua phòng riêng có vé phụ huynh. Máy mới đăng nhập cùng hồ sơ nhận bản lưu. Thay đổi offline được giữ trên máy và gửi lại khi kết nối; chỉ xóa cờ chờ đồng bộ sau xác nhận lưu thành công. Bản local cũ có hoạt động được đánh dấu chờ tải lên khi nâng phiên bản.

API lưu snapshot hoạt động riêng với tiến độ truyện. Whitelist và bộ khôi phục giới hạn màu/nét/điểm, ID và action trace; payload không được dùng để cấp sao hoặc hoàn thành nhiệm vụ truyện. API nội bộ cần chữ ký service, profile lấy từ vé xác thực của client. Receipt truyện giữ nguyên.

Huy hiệu ngày lễ, trò đã luyện, khám phá và huy hiệu mùa được hợp nhất. Tranh và checkpoint luyện lấy snapshot tải lên cuối; bước chăm cho phép về 0 để chơi lại. Đây chưa phải đồng biên tập cùng lúc: nếu hai máy cùng thay đổi tranh, bản tải lên cuối thay thế tranh trước. Chưa đồng bộ hồ sơ solo không có tài khoản/vé; không tự chuyển tranh của hồ sơ solo sang hồ sơ trẻ khác.

Upload có xác nhận ID, bỏ xác nhận cũ khi có thay đổi mới, giữ cờ dirty khi mất mạng/lỗi lưu, thử lại theo lịch. Không render lại góc vẽ khi nhận xác nhận để tránh hủy nét đang kéo. Dữ liệu nằm trong snapshot database hiện có, được export/xóa cùng hồ sơ và backup chung.
