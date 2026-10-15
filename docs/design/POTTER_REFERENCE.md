# Nghệ Nhân Gốm theo ảnh tham chiếu

Asset được tạo bằng OpenAI built-in image_gen, giữ nét mặt, nụ cười, kính chữ nhật và tóc ngắn theo ảnh người dùng cung cấp. Trang phục đổi thành áo nâu xắn tay, tạp dề màu kem có vết đất sét, quần tối màu và dép phù hợp làm gốm.

- PNG: `apps/game-client/assets/resources/village/potter-reference-v1.png`.
- Prompt: `docs/design/potter-reference-v1.prompt.json`.
- Atlas nền trong suốt 1774 × 887, tám hướng × ba trạng thái đứng/đi/chào.
- Giữ ID NPC `nghe-nhan-gom` và ID asset `character.nghe-nhan-gom`.
- Sprite dùng atlas riêng khi chuyển động và chào; frame được giải phóng khi đóng scene.
