# Asset mở rộng làng — v1

Thiết kế bằng OpenAI built-in imagegen, PNG RGBA nền trong suốt, ngày 13/10/2026. Bộ ảnh nằm tại `apps/game-client/assets/resources/village/expansion-v1/`.

- `riverside.png`: bến tre, mái lá, thuyền gỗ, mái chèo và lau sậy.
- `garden.png`: luống rau, hàng rào tre, cây ăn trái, hoa và giỏ thu hoạch.
- `school.png`: lớp học quê mái ngói, cửa xanh, bảng, ghế và sân chơi.
- Sáu atlas NPC: Anh Nam, Chị Mai, Chú Hải, Cô Lan Sông, Bé Minh, Bé An.

Atlas nhân vật có 4 cột × 2 hàng: E, NE, N, NW / W, SW, S, SE. Mỗi hướng được vẽ riêng; game tạo nhịp bước bằng chuyển động từ các góc nhìn này, không lật ảnh để giả hướng. Vị trí NPC và đường đi giữ theo dữ liệu hiện có. Các cảnh chỉ trang trí, không thêm vật cản.

Prompt nhân vật lưu trong `expansion-v1-prompts.json`. Prompt cảnh sử dụng phong cách chibi vẽ tay giàu chi tiết, góc isometric 2:1, ánh sáng ấm từ trái trên, làng quê Việt Nam, không chữ hoặc giao diện, không người, nền alpha trong suốt; nội dung cụ thể theo mô tả từng cảnh ở trên. Các ảnh là bản thiết kế AI, trạng thái registry vẫn chờ duyệt mỹ thuật.

## Kiểm tra

Bản Cocos `expansion-art-v1` dựng thành công. TypeScript, test client (63 nhóm và 4 kiểm tra vòng đời mạng), expansion và nhịp bước NPC đã qua. `npm run test:expansion-assets` xác nhận ba landmark dùng Sprite raster, sáu NPC có tám góc nhìn và 64 khung bước được cache, trên viewport 1920×1080, 390×844 và 844×390; không có lỗi JavaScript. Ảnh kiểm tra nằm tại `apps/game-client/temp/expansion-art-v1/` (không commit). Đây là kiểm tra trình duyệt tự động, không thay thế lượt chơi trên Android thật.

Biển tên được đặt lệch khỏi mặt NPC. Hash nội dung tương tác vẫn là `785f4e7e`; bản mỹ thuật không thay đổi nhiệm vụ hoặc thưởng.
