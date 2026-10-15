# Cô Giáo Lan theo ảnh tham chiếu

Asset được tạo bằng OpenAI built-in image_gen, giữ nét mặt, nụ cười, kính tròn và tóc tết theo ảnh người dùng cung cấp. Trang phục đổi thành áo dài xanh nhạt, quần trắng và giày kín phù hợp cô giáo.

- PNG: `apps/game-client/assets/resources/village/teacher-lan-reference-v1.png`.
- Prompt: `docs/design/teacher-lan-reference-v1.prompt.json`.
- Atlas nền trong suốt 1774 × 887, tám hướng × ba trạng thái đứng/đi/chào.
- Giữ ID NPC `co-giao-lan` và ID asset `character.co-giao-lan`.
- Sprite dùng atlas riêng cả khi chuyển động và chào; frame được giải phóng khi đóng scene.
