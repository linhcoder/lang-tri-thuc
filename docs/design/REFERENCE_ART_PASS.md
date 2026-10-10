# Reference art pass — 10/10/2026

Công cụ: built-in imagegen, skill imagegen. Asset candidate, chưa nghiệm thu mỹ thuật final. Reference là mục tiêu phong cách; không làm background tĩnh. PNG cũ giữ nguyên.

## Cây đa

File dùng trong game: `apps/game-client/assets/resources/village/banyan-v3-clean.png` (1536×1024). Sprite design 420×280, footprint giữ nguyên. Bản nháp không dùng được chuyển vào temp. Prompt tạo:

```text
Use case: stylized-concept. Create ONE modular transparent-background 2.5D isometric game sprite: ancient Vietnamese banyan knowledge tree, matching the warm richly painted storybook village style of the user reference. Broad dense spreading golden-green canopy, massive weathered brown trunk, hanging aerial roots, interwoven buttress roots, mossy rounded stones and tiny white/yellow flowers tight around the root base. Three-quarter view from above, compatible with 2:1 isometric village ground, sunlight upper left, detailed painted textures, charming children's educational game. Entire tree visible, canopy fills upper 65 percent, stout base in lower 25 percent, wide silhouette, no cropping. No characters, no buildings, no pond, no UI, no labels, no lettering, no watermark, no opaque background and no large ground island. Small soft baked contact shadow only immediately around roots. Output a standalone RGBA sprite, not a complete village screenshot.
```

Prompt chỉnh alpha:

```text
Edit this banyan tree sprite to remove ALL glowing yellow/brown haze and background. Preserve the tree, detailed leaves, roots, rocks and flowers exactly. Make every area outside the tree silhouette completely transparent alpha=0, including gaps between branches and hanging roots. No vignette, no glow, no colored backdrop, no checkerboard painted into the file. Clean transparent game sprite edges. Only a very small contact shadow under the root base. Keep entire tree uncropped.
```

## Đình

File: `apps/game-client/assets/resources/village/temple-v3.png` (1536×1024). Sprite design 420×280, footprint giữ nguyên.

```text
Create ONE transparent RGBA game sprite of a traditional northern Vietnamese village communal house (dinh), warm hand-painted highly detailed storybook style for a children's 2.5D isometric game. Broad red terracotta tiled roof with graceful upward-curving ends and Vietnamese ornamental roof ridge, aged dark wooden columns and doors, wide stone steps at front, grey stone foundation, small mossy stone planters at the building corners. Three-quarter elevated view compatible with a 2:1 isometric ground plane, front facade facing lower left, right side visible, sunlight upper left. Single storey, authentic village communal hall, no Chinese pagoda tower. Entire building contained in frame with 8 percent clear margin, no cropping. Isolated standalone modular building, no people, no tree, no UI, no text, no watermark, no large courtyard ground island. Absolutely transparent outside silhouette, no fog or glow or colored background. Small soft baked contact shadow directly below foundation.
```

## Bố cục

Scenery tăng 43 → 64 instance: thêm 21 cụm thấp trên bờ ao, mép ruộng và sân. Không thêm collider; giữ NPC/reward/contentVersion. Low ẩn các cụm mới. Chỉ cây đa chính đổi PNG; cây phía đông giữ sprite cũ qua loader theo instance ID.

Còn khác ảnh mẫu: mặt đất/shore grid, HUD chưa có icon minh họa, nhà/giếng/chợ/NPC chưa cùng bộ mỹ thuật; camera theo nhân vật thay vì screenshot cố định. Không tuyên bố cảnh đã giống hoàn toàn ảnh mẫu.

## Kiểm chứng bản mới

Strict TypeScript, 48 nhóm client + 3 network lifecycle và build Creator 3.8.8 đạt. Browser visual bốn viewport 1280×720, 390×844, 844×390, 320×568 đạt HUD bounds/non-overlap, quality/reload, occlusion, interaction và dispose; errors rỗng. Mẫu ngắn khoảng 60.14–60.38 FPS, p95 17–17.1 ms, 67–84 draw calls trên máy AMD/ANGLE hiện tại, không chứng nhận điện thoại thật.

Đã xem screenshot game thật `apps/game-client/temp/visual-upgrade-qa/1280x720-high.png`: hai sprite mới alpha không tạo hình chữ nhật nền, tán đa và đình có độ chi tiết cao hơn, hoa ôm mép sân. Evidence generated nằm trong temp, không đưa vào Git. Preview Creator 3.8.8 → VillageScene → Preview Browser hoặc http://127.0.0.1:38080/. Không commit/push/deploy trong đợt art này.
