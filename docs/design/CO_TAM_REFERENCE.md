# Cô Tấm theo ảnh tham chiếu

Asset được tạo bằng OpenAI built-in image_gen, giữ nét mặt và tóc theo ảnh người dùng cung cấp. Trang phục đổi thành áo tứ thân nâu, áo trong màu kem, thắt lưng hồng trầm, váy đen và dép; bỏ mũ, áo tốt nghiệp và bó hoa.

- PNG: `apps/game-client/assets/resources/village/co-tam-reference-v1.png`.
- Prompt: `docs/design/co-tam-reference-v1.prompt.json`.
- Atlas nền trong suốt 1774 × 887, 8 hướng × 3 trạng thái đứng/đi/chào.
- Bác Nông Dân tiếp tục dùng `farmer-workwear-v2.png`, giữ khuôn mặt và kính theo ảnh tham chiếu, mặc áo nâu và quần lao động.
- Cả hai nhân vật dùng atlas riêng khi chuyển động và chào, được giải phóng SpriteFrame khi đóng scene.
