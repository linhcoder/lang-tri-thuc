# Texture cỏ và đường đất — 15/10/2026

Hai ảnh riêng được tạo bằng OpenAI built-in `image_gen` theo mẫu người dùng, giữ nguyên ảnh gốc:

- Cỏ: `apps/game-client/assets/resources/village/grass-meadow-v1.png`, 1254×1254; prompt tại [grass-meadow-v1.prompt.json](grass-meadow-v1.prompt.json).
- Đất: `apps/game-client/assets/resources/village/dirt-path-v1.png`, 1254×1254; prompt tại [dirt-path-v1.prompt.json](dirt-path-v1.prompt.json).

Registry `ground.meadow-texture` dùng ảnh cỏ mới cho nền trong làng và vùng ngoài bản đồ. `ground.dirt-texture` được tải tùy chọn và phủ lên lõi đường đất bằng CanvasPattern theo tọa độ thế giới. Tỉ lệ chiếu 2:1, độ rộng, đường cong và mép mềm của các tuyến giữ theo bố cục hiện có. Texture được bake vào chunk, không vẽ lại theo từng frame. Khi ảnh lỗi, màu nền và đường dự phòng vẫn hoạt động.

TypeScript, test client và build Cocos đạt. QA trình duyệt xác nhận hai texture khác UUID và đủ kích thước nguồn, mười cảnh vùng, 20 ảnh 1440×900/844×390, không có page error; đã xem ảnh làng và đồi khoa học. Báo cáo/ảnh local ignored: `apps/game-client/temp/ground-textures-qa/`.

Triển khai VPS và QA HTTPS sẽ được ghi sau khi kích hoạt release.
