# Kết quả nghiệm thu bản playable

Ngày kiểm tra: 09/10/2026. Cocos Creator 3.8.8, Node.js 24, Chrome headless/WebGL D3D11 trên AMD Radeon tích hợp.

- TypeScript client strict và server build: đạt.
- Client: 17 nhóm kiểm thử đạt (1.600 tile round-trip, A* so với BFS, collision, input, camera, scene, nhiệm vụ và lưu tiến độ).
- Server: 3 kiểm thử đạt, gồm hai client đồng bộ/thoát, chống teleport và kết nối bản JavaScript production trong tiến trình riêng.
- Bản web Cocos thực tế: hoàn thành thu hoạch → đếm → rải hạt → huy hiệu; kiểm tra trả lời sai và khôi phục tiến độ sau reload.
- Browser giả lập Android: joystick, touch tương tác NPC, đóng hội thoại và xoay ngang đạt.
- Hai browser online: đồng bộ di chuyển, xóa người đã thoát và tự vào lại phòng đạt; không có lỗi JavaScript.

Hai lần đo trong 5 giây ở viewport 1280 × 720: khoảng **60 FPS**, p95 **16,9 ms**, **48 draw calls**, JS heap khoảng **34–39 MB**, 20 chunk terrain đang hiển thị. Đây là mẫu đo ngắn trên AMD Radeon, chưa xác nhận Intel HD/UHD hoặc điện thoại vật lý. Không dùng kết quả này để khẳng định mọi thiết bị đạt 60 FPS.

Ảnh kiểm tra và báo cáo JSON được tạo tại `temp/release-qa/` khi chạy `npm run test:web`; thư mục sinh tự động không đưa vào Git. Hướng dẫn chạy ở [PLAYABLE-VILLAGE.md](PLAYABLE-VILLAGE.md) và README root.

Scene và các `.meta` có sẵn được giữ nguyên trong đợt mở rộng này; asset mới được Cocos CLI import thật. Công cụ điều khiển giao diện Windows không khởi tạo được trong môi trường hiện tại, nên thao tác GUI Editor chưa được kiểm tra tự động. Không có điện thoại kết nối ADB để nghiệm thu phần cứng. Không commit hoặc push các thay đổi mới.
