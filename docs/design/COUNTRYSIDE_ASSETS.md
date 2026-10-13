# Cảnh quê và động vật — v1

PNG RGBA `apps/game-client/assets/resources/village/countryside-v1/atlas.png`, tạo bằng OpenAI built-in imagegen ngày 13/10/2026. Sáu hình: đồi xanh, ruộng lúa, đống rơm, gà trống, chó vàng, mèo mướp cam. Registry dùng vùng ảnh riêng vì bố cục ảnh sinh ra không khớp hoàn toàn lưới 3×2.

Năm cụm đồi và tám cụm ruộng tạo cảnh xa phía bắc làng; ba đống rơm đặt ở rìa. Chó và mèo dùng tuyến A* qua các điểm trong làng, nghỉ chân, dừng khi gặp người chơi hoặc NPC. Các động vật chỉ trang trí tại client, không thêm collider, phần thưởng hoặc dữ liệu đồng bộ phòng. Hình chạy là một góc nhìn với chuyển động nhún và đổi hướng trái/phải.

Gà trống có cử động gáy và chữ “Ò ó o…” theo chu kỳ 22 giây. Tiếng gáy tổng hợp ngắn, nhỏ, chỉ phát sau tương tác mở âm thanh của trình duyệt, khi bật cài đặt âm thanh và người chơi ở gần; không phát khi tab ẩn. Đây là âm tổng hợp, không phải bản ghi gà thật. Dọn listener và AudioContext khi hủy scene.

Prompt lưu trong `countryside-v1-prompt.txt`. Asset AI vẫn chờ duyệt mỹ thuật; nhiệm vụ và hash tương thích không thay đổi.

Kiểm tra: TypeScript và toàn bộ test client đã qua. `npm run test:countryside` kiểm tra ba viewport desktop/mobile, tuyến động vật trong 120 giây mô phỏng không vượt ô đi được, bước di chuyển tối đa 5,2 đơn vị, nghỉ khi gặp người và bật/tắt tiếng gáy theo khoảng cách/cài đặt. Ảnh và báo cáo tại `apps/game-client/temp/countryside-qa/` (không commit).
