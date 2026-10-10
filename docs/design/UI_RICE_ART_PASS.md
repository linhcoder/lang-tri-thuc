# HUD, biển làng và lúa — art pass 10/10/2026

Công cụ built-in imagegen qua skill imagegen, không dùng API fallback. Các sprite mới vẫn candidate/placeholder, giữ PNG cũ. Không dùng ảnh reference làm background.

## HUD atlas

File: `apps/game-client/assets/resources/village/ui-v4.png`; 4×2 cell. Sáu icon túi, cúp, bản đồ, gear, speech và scroll; biển gỗ cell 6 và parchment cell 7. Nhãn tiếng Việt là Label riêng, không sinh chữ trong PNG.

```text
Create one transparent RGBA sprite atlas for a warm hand-painted Vietnamese children's village game. EXACTLY 4 columns and 2 rows, equal square cells, each isolated object centered with at least 15 percent empty margins, no overlap between cells. Row1: cute brown cloth inventory satchel with vegetables; golden trophy with a star; folded colorful village map; silver grey settings cogwheel. Row2: cream speech bubble with three dark brown dots; rolled parchment quest scroll tied with red ribbon; wide BLANK wooden hanging village sign with rustic frame and two short posts, absolutely no letters; BLANK cream parchment rectangular plaque with ornate golden brown corners. Each icon occupies middle 70 percent of cell. Rich painted storybook shading, upper-left warm light, coherent style, clear at small sizes, no people, no background, no labels, no watermark. All outside objects must be true transparent alpha. A reusable game UI sprite atlas, not a screenshot.
```

## Lúa vàng

File: `apps/game-client/assets/resources/village/rice-v4.png`. 89 cụm trong ruộng phía phải, 62×58 world px, không collider; Low giữ tập thưa, High/Medium đầy đủ, culling theo camera. Không thay plot/reward Chương 1.

```text
ONE isolated modular 2.5D isometric sprite of a thick clump of ripe golden Vietnamese rice plants, about 15 curved stems bearing heavy grain panicles, narrow green and gold leaves, roots meet a tight low oval base. Warm richly hand painted children's storybook village game, sunlight upper left, 2:1 isometric perspective from above. Crop cluster, no people, no rice sack, no bowl, no field rectangle, no buildings. Entire cluster fully visible with empty margin. True transparent RGBA background outside stalks and between leaves, no glow or vignette, no text or watermark. Designed to repeat as individual harvest rice plants across a field. Silhouette roughly square.
```

## Chức năng và pipeline

Registry hiện 51 asset, 159 instance cảnh (bao gồm 89 lúa và 6 biển). UI frame/icon dùng chung một texture atlas. HUD giữ ID và vùng hit cũ; frame/icon dispose khi scene kết thúc. Nameplate tránh biển gỗ đang hiện.

Minimap và map modal vẽ từ terrain, đường, công trình, worldZones và vị trí thật của bé; không phải ảnh mẫu cố định. Map modal giữ nút chọn khu và portal/page. Mobile dùng 4 khu/trang, desktop 6, nút di chuyển gọi navigation hiện có. Phong cách khung parchment/nâu-vàng và icon minh họa đã được thay cho nút chữ thuần.

Preview: Creator 3.8.8 → VillageScene → Preview Browser; local http://127.0.0.1:38080/. Chuyển High trong Cài đặt để xem đầy đủ lúa; mở Bản đồ và chọn Nông trại. Low chủ ý giảm mật độ để giữ hiệu năng.

Khác biệt còn lại: bản đồ dùng ký hiệu procedural chưa có bộ landmark vẽ tay; HUD modal khác layout ảnh mẫu; đường/bờ ao và NPC chưa đồng bộ toàn bộ mỹ thuật. Chưa tuyên bố giống hoàn toàn ảnh mẫu. Không commit/push/deploy trong đợt này.

## Kiểm chứng

- Strict TypeScript, 48 nhóm client + 3 network lifecycle, Creator 3.8.8 Web build đạt.
- Browser bốn viewport: HUD không chồng/vượt viewport, icon atlas tải được, 89 cụm lúa và 6 biển được tạo, mở map có hình làng và chọn Nông trại tạo đường đi; quality/reload, occlusion, interaction/dispose đạt. Không có page error.
- NPC/detail click, wheel/button/pinch/joystick, Chương 1 desktop/mobile, replay/reload và legacy/future/corrupt save đạt.
- Mẫu High khoảng 60.3 FPS, p95 17 ms, 83–124 draw calls tùy viewport. Chương 1 khoảng 60.16 FPS, 90 draw calls, JS heap 56.51 MiB. Có tăng draw calls so với trước khi thêm biển/icon/lúa; chưa chứng nhận máy yếu hoặc mobile thật.
- Đã xem ảnh desktop/mobile trực tiếp, dời biển sân/ruộng/nhà/chợ để tránh cây, mái và NPC. Evidence trong `apps/game-client/temp/visual-upgrade-qa` (High, map, rice-signs) và `temp/assets-qa`; generated, không commit.

Lượt build ENOTEMPTY trên Windows không tính là pass: dừng stack, xác minh rồi xóa riêng output build và build lại thành công. Lượt test đầu có lỗi cú pháp tên screenshot đã sửa; các kết quả trên là lượt chạy lại đạt.
