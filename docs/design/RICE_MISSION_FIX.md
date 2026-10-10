# Sửa hình lúa nhiệm vụ — 10/10/2026

Nguyên nhân: ChapterOneView vẫn dùng Graphics nét thẳng cho plot đã trồng và bài đếm; sprite lúa của ruộng trang trí chưa nối với nhiệm vụ. Nét vẽ giống cành cây và không đồng bộ cảnh.

Thêm `apps/game-client/assets/resources/village/rice-seedling.png`, tạo bằng built-in imagegen qua skill imagegen, giữ alpha và các PNG cũ. Đây là mạ xanh vừa trồng, không phải lúa chín vàng. Asset candidate/placeholder, ID vegetation.seedling trong registry (52 record). Sprite plot 31×46, anchor (.5,0); vòng ô và hit region giữ nguyên. Năm ô được dời vào phần ruộng thoáng, tránh NPC và mái đình; ID/index và save/reward giữ nguyên. Hash nội dung bổ sung tọa độ ô để chống client/server lệch nhiệm vụ; phải build client, API và server cùng nhau. Counting dùng cùng sprite 42×62, một hình cho một cây, không bị nút Gợi ý che gốc. Texture/frame do VillageArt sở hữu và dispose; dùng lại giữa plot và bài đếm. Nếu tải asset thất bại vẫn có fallback mảnh, game tiếp tục hoạt động.

Prompt:

```text
Create ONE isolated transparent RGBA sprite of a young Vietnamese rice seedling (ma lua) for a children's educational 2.5D village game. A single small planted unit with 4 to 6 slender gently curved fresh green rice leaves, tapered pointed leaf tips, a short delicate central stalk, roots meeting one tiny dark moist soil tuft. No mature grain, no golden rice heads, no tree branches, no flowers, no stones, no pot, no large soil island. Warm hand-painted detailed storybook style, sunlight upper left, three-quarter slightly elevated view compatible with 2:1 isometric ground. Entire plant fully visible with 15 percent clear margin. Simple clearly readable silhouette at 40x46 game pixels. One seedling unit, not several separate plants or an atlas. Completely transparent outside leaves and through leaf gaps; no opaque backdrop, glow, vignette, lettering or watermark.
```

Preview: Creator 3.8.8 → VillageScene → Preview Browser; hoặc local http://127.0.0.1:38080/. Tiếp tục nhiệm vụ, trồng một ô, tải lại, xem hình vẫn đúng; mở bài đếm với Bác Nông Dân. Screenshot kiểm chứng trong apps/game-client/temp/chapter-one-qa (planted-rice-desktop, count-hint, count-mobile). Không commit/push/deploy phần mới.

Bố cục cuối (index 0–4): (6,13), (8,11), (7,12), (6,11), (8,9). Cả năm ô vẫn nằm trong rice terrain và reachable. ContentVersion hiện d129e24c; không deploy frontend riêng với server/API cũ. Đã xem ảnh planted-rice-full.png: cả năm mạ hiện rõ khi bé rời ô, không bị Bác Nông Dân/nhãn hoặc mái đình che. count-hint.png hiển thị ba mạ tách nhau, nút Gợi ý không che gốc.

Kiểm chứng bản cuối: strict TypeScript, 48 nhóm client + 3 network lifecycle, Web build Creator 3.8.8, server/API build đạt. Server 5/5 và API 4/4 đạt (MySQL integration skip vì không cấu hình lượt này). Browser Chương 1 desktop/mobile, sprite tương ứng từng ô đã trồng và sau reload, bài đếm, replay/unique star, legacy/future/corrupt save đạt. Signed online stack/parent flow/server progress đạt, errors rỗng. Mẫu Chương 1 khoảng 60.2 FPS, p95 16.9 ms trên máy AMD/ANGLE hiện tại; chưa chứng nhận thiết bị thật. Lúa nhiệm vụ không bị ẩn ở Low.
