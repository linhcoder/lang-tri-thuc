# Asset generation prompts

Ngày 10/10/2026. Công cụ: built-in `image_gen` qua skill imagegen; không dùng CLI/API fallback. Các PNG được tạo mới, giữ nguyên asset cũ. Trạng thái: generated candidate / placeholder chờ nghiệm thu artist, không tự coi là final hoặc đạt ảnh mẫu.

## Scenery atlas

File project: `apps/game-client/assets/resources/village/scenery-v2.png`. Alpha được giữ nguyên. Bốn cột × hai hàng; sprite được cắt bằng SpriteFrame, không chỉnh/cắt ảnh bằng Python. Ảnh người dùng `village-reference.png` chỉ làm tham chiếu phong cách.

```text
Create a production game sprite atlas, exactly four columns and two rows of equal square cells, 1536x768 wide composition. Transparent background alpha, absolutely no text, grid lines, watermark or labels. Each independent sprite centered horizontally in its own cell, its ground contact at 90% of cell height, at least 10% empty margin around each sprite, never crossing cells. Warm hand-painted detailed Vietnamese village art, cute children's 2.5D game, consistent isometric 2:1 ground plane, light from upper left, soft baked contact shadows. Row 1 left to right: dense pink/yellow wildflower bush; leafy green shrub with small white flowers; cluster of weathered grey village stones; small thatched Vietnamese market stall with bamboo posts and baskets of fruit. Row 2 left to right: section of bamboo fence; small lush shade tree; tuft of lush meadow grass with daisies; stone lantern with warm orange lamp. Keep all assets isolated, no scenery background, no human characters. Reference image is style inspiration only; do not reproduce its UI or scene.
```

## Ground texture

File project: `apps/game-client/assets/resources/village/ground-v2.png`. Texture vật liệu lặp theo tọa độ world, phối thêm mảng màu procedural và đường độc lập; không phải ảnh background toàn cảnh.

```text
A seamless tileable ground texture for a warm hand-painted Vietnamese village children's isometric 2D game. Orthographic overhead texture filling the square completely, no perspective horizon. Olive green meadow base with fine short grass blades, tiny clover, subtle mossy green color variation and occasional small sunlit yellow-green tufts. Natural soft painted texture, delicate detail, NO large plants, NO flowers, NO rocks, NO paths, NO buildings, NO animals, NO text, NO borders, NO watermark, NO UI. Even warm diffuse illumination, no cast shadows or vignette. Seamless repeat on all four edges, restrained contrast so sprites read clearly. Game terrain material only, never a full scene background.
```

## Kiểm tra và giới hạn

Đã xem output và renderer Cocos Web thật. Atlas có tám đối tượng riêng, không text hoặc watermark quan sát được; đã dùng quầy chợ, hoa, đèn, hàng rào, cây và dressing. Texture cỏ đã được dùng trong terrain bake. Generated atlas cần artist rà padding/cell, ánh sáng và mép alpha trước nghiệm thu final; texture repeat chưa được chứng nhận seamless pixel tuyệt đối. Không khẳng định quyền dùng các PNG cũ khi thiếu hồ sơ provenance. Không dùng pixel từ ảnh tham chiếu làm map.
