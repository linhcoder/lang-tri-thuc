# Bà bán hàng theo ảnh tham chiếu

Asset được tạo bằng OpenAI built-in image_gen, giữ nét mặt, nụ cười và tóc búi theo ảnh người dùng cung cấp. Trang phục đổi thành áo bà ba tím trầm, quần đen, tạp dề màu kem và dép phù hợp chợ quê.

- PNG: `apps/game-client/assets/resources/village/market-lady-reference-v1.png`.
- Prompt: `docs/design/market-lady-reference-v1.prompt.json`.
- Atlas nền trong suốt 1774 × 887, tám hướng × ba trạng thái đứng/đi/chào.
- ID NPC `ba-ban-hang`, ID asset `character.ba-ban-hang` được giữ nguyên.
- Sprite dùng atlas riêng cả khi chuyển động và chào, không quay về hình NPC chung; các frame được giải phóng khi đóng scene.
