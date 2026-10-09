# Art và prompt

Biểu cảm `hello` dùng bàn tay hình học vẽ bằng Graphics; `happy` dịch chuyển sprite/khăn và đốm sáng trong 1,6 giây. Không thêm atlas cử chỉ; sprite gốc giữ nguyên, biểu cảm chỉ là lớp trình bày tạm thời.

Khăn quàng độc lập dùng Cocos Graphics trong `VillageBootstrap.ts`: ba màu, vòng cổ và đuôi khăn theo hướng/bước đi. Đây là phụ kiện hình học vẽ bằng code, không phải PNG mới. Các sprite avatar bên dưới giữ nguyên.

Bộ ảnh được tạo bằng skill imagegen và công cụ built-in `image_gen`; không dùng CLI/API fallback. Các ảnh chọn cuối đã được lưu trong `assets/resources/village/`, đi cùng `.meta` do Cocos import. Hai atlas môi trường thử nghiệm đã được thay bằng sprite riêng để tránh cắt nhầm hình.

| File | Nội dung |
| --- | --- |
| `child.png` | Tám hướng × ba trạng thái (24 frame), trẻ áo đỏ |
| `tiles.png` | Grass, road, rice, pond, courtyard và grass có hoa; atlas 3 × 2 |
| `temple.png` | Đình làng |
| `house.png` | Nhà mái ngói |
| `banyan.png` | Cây đa |
| `banana.png` | Cây chuối |
| `farmer.png` | Bác Nông Dân |
| `rice.png` | Bó lúa thu hoạch |
| `elder.png` | Ông Đồ áo dài xanh, khăn đóng và sách; thay Graphics trong Chương 1 |
| `co-tam.png` | Cô Tấm áo xanh, váy nâu, giỏ rau; thay Graphics ở nông trại |
| `lotus.png` | Cụm lá/hoa sen, đặt trên mặt ao hiện có ở ba vị trí |

## Bổ sung ngày 10/10/2026

Dùng built-in `image_gen`, nền alpha; không dùng CLI/API fallback. Ảnh được copy vào `assets/resources/village/`; `.meta` mới do Creator import. Đây là minh họa nhân vật hư cấu/phong cách trò chơi, chưa là tài liệu xác thực trang phục lịch sử. Cô Giáo Lan và Nghệ Nhân Gốm được dịch sang ô đất gần đó để không bị cây đa/mái nhà che; điểm trường học theo vị trí mới. Collision dùng chung model client/server. Vùng chạm NPC ở Sổ làng theo kích thước sprite, gồm hai cặp nhân vật rộng hơn. Hoa sen là trang trí, không tạo hành động thu hoạch hoặc đổi collision ao. NPC dùng sprite idle tĩnh; chưa có walk/gesture animation riêng.

Các sprite bổ sung: `teacher.png` (Cô Giáo Lan), `market-lady.png` (Bà Bán Hàng), `potter.png` (Nghệ Nhân Gốm), `ti-na.png` (hai bạn cùng một sprite), `hang-cuoi.png` (Chị Hằng và Chú Cuội cùng một sprite). Hai cặp nhân vật giữ một điểm tương tác như model cũ.

Prompt set NPC bổ sung, một lần gọi cho mỗi ảnh:

Ảnh Nghệ Nhân Gốm được chỉnh lại với prompt: Edit target image into ONE standalone game NPC sprite. Remove the woman on the left entirely. Keep ONLY the male pottery artisan on the right, wearing cream shirt and ochre apron, holding the bowl. Preserve his face, clothing, bowl, style and full visible body. Recenter this one male artisan in the square canvas at the original height, feet at same baseline. No other people, no woman, no additional objects, no background, no glow or shadow. Genuine alpha zero transparent background.

teacher: Standalone square transparent PNG sprite for Vietnamese children's isometric village game. Polished hand-painted warm storybook art, cute round expressive heads, softly shaded clean edges, matching friendly farmer and green-clad Co Tam sprites. Elevated orthographic view, front three-quarter, full bodies centered, feet at 93% canvas height, generous transparent padding. No scenery, no text, no labels, no watermark, no halo or glow, only clean silhouettes with genuine transparent alpha. One friendly Vietnamese young adult female teacher Cô Giáo Lan, black hair to shoulders, modest rose pink áo dài over cream trousers, flat sandals, holding a closed book, kind encouraging smile.

market-lady: Standalone square transparent PNG sprite for Vietnamese children's isometric village game. Polished hand-painted warm storybook art, cute round expressive heads, softly shaded clean edges, matching friendly farmer and green-clad Co Tam sprites. Elevated orthographic view, front three-quarter, full bodies centered, feet at 93% canvas height, generous transparent padding. No scenery, no text, no labels, no watermark, no halo or glow, only clean silhouettes with genuine transparent alpha. One warm friendly older Vietnamese market seller Bà Bán Hàng, salt-and-pepper hair in a bun, simple purple blouse, dark brown loose trousers, sandals, holding a small woven basket with carrots and leafy greens, round face and warm smile.

potter: Standalone square transparent PNG sprite for Vietnamese children's isometric village game. Polished hand-painted warm storybook art, cute round expressive heads, softly shaded clean edges, matching friendly farmer and green-clad Co Tam sprites. Elevated orthographic view, front three-quarter, full bodies centered, feet at 93% canvas height, generous transparent padding. No scenery, no text, no labels, no watermark, no halo or glow, only clean silhouettes with genuine transparent alpha. One friendly middle-aged Vietnamese male pottery artisan Nghệ Nhân Gốm, short black hair, small moustache, simple cream shirt and ochre apron over brown trousers, sandals, holding one small finished terracotta bowl, no tools, cheerful calm face.

ti-na: Standalone square transparent PNG sprite for Vietnamese children's isometric village game. Polished hand-painted warm storybook art, cute round expressive heads, softly shaded clean edges, matching friendly farmer and green-clad Co Tam sprites. Elevated orthographic view, front three-quarter, full bodies centered, feet at 93% canvas height, generous transparent padding. No scenery, no text, no labels, no watermark, no halo or glow, only clean silhouettes with genuine transparent alpha. Exactly two young Vietnamese children friends Tí and Na standing side by side with separate readable silhouettes, entire full bodies visible. Boy with short black hair, orange shirt and dark blue shorts, girl with black pigtails, yellow blouse and blue skirt, simple sandals. Both smiling, friendly waving hands. No other characters.

hang-cuoi: Standalone square transparent PNG sprite for Vietnamese children's isometric village game. Polished hand-painted warm storybook art, cute round expressive heads, softly shaded clean edges, matching friendly farmer and green-clad Co Tam sprites. Elevated orthographic view, front three-quarter, full bodies centered, feet at 93% canvas height, generous transparent padding. No scenery, no text, no labels, no watermark, no halo or glow, only clean silhouettes with genuine transparent alpha. Exactly two friendly Vietnamese folk-tale festival characters Chị Hằng and Chú Cuội standing side by side with separate readable silhouettes. Young woman with long black hair, modest flowing pale lavender áo dài and cream trousers, holding a small unlit decorative star lantern; young man short black hair under simple dark head scarf, teal rural shirt, brown loose trousers and sandals, cheerful grin. Cute child-friendly human characters, no wings, no glowing aura, no flame. Full bodies visible.


Prompt Ông Đồ:

Create a standalone transparent PNG game sprite for Làng Tri Thức Vietnamese children's isometric village. One friendly elderly Vietnamese scholar Ông Đồ, full body centered, warm smile, white eyebrows and small white beard, indigo traditional áo dài tunic, dark khăn đóng headwear, loose ivory trousers and brown sandals, holding a small closed plain book. Cute rounded proportions and expressive large head, polished hand painted storybook art with soft warm shading and clean edges, matching a friendly blue-shirt farmer sprite. Slight elevated orthographic 2:1 game camera, facing front slightly three-quarter. Entire figure fully visible, feet baseline at 93% canvas height, generous transparent padding, no scenery, no text, no lettering, no watermark. Real alpha transparency. Save usable project asset.

Prompt chỉnh alpha Ông Đồ:

Edit this game character sprite. Preserve the complete elderly scholar exactly: face, clothes, book, pose, scale, full body and sandals. Remove ALL background, ALL colored halo and ALL glow outside the character silhouette. Background must be completely alpha zero, with only clean antialiased edges around the isolated character, no shadow, no haze. Keep original composition and dimensions; no text.

Prompt Cô Tấm:

Standalone square transparent PNG game sprite for Vietnamese children's village, one character Cô Tấm. Kind young adult Vietnamese woman, black hair tied neatly in a low bun, gentle smiling face, simple traditional modest pale green áo tứ thân outer garment with cream inner shirt, brown flowing skirt and simple sandals, carrying a small woven basket of green vegetables. Friendly oversized head and cute readable full body proportions. Polished hand-painted children's storybook art, soft warm shading, clean readable edges, vivid natural palette; slightly elevated orthographic isometric 2:1 camera, facing front three-quarter. Entire figure visible, centered, feet at 93% canvas height, at least 10% transparent padding all sides. No scenery, no other characters, no text or lettering, no logo, no watermark. Genuine alpha transparent background.

Prompt sen ao làng:

Standalone transparent PNG game environment sprite: a small cluster of three broad green lotus leaves floating with one open pink lotus blossom and one pink bud, to place ON TOP of existing blue water tiles in a Vietnamese children's village game. Orthographic isometric 2:1 elevated view, broad horizontal composition, soft clean hand-painted storybook style, sunny gentle colors and clean readable silhouettes matching warm rural village sprite art. Only the lotus cluster, with a few delicate short pale-blue water ripple arcs directly under the leaves. No pond basin, no full water surface, no land, no shore, no trees, no houses, no rocks, no people, no text, no watermark. Centered in square canvas with generous 15% padding. Genuine alpha transparency around and between the leaves.

## Prompt sprite nhân vật

### Avatar bổ sung ngày 10/10/2026

Built-in imagegen chỉnh sprite sheet tham chiếu; giữ `child.png` gốc và UUID. File mới `boy-blue.png`, `girl-pink.png`, `girl-yellow.png`, mỗi sheet 8 cột × 3 hàng: idle và hai bước chân, thứ tự E/NE/N/NW/W/SW/S/SE. Avatar IDs 0–3 giữ nguyên để save cũ không phải đổi version; ID 2/3 nay dùng bé gái thay boy nhuộm màu/nơ Graphics. Trang phục dùng ảnh riêng, không tint da. Bốn lựa chọn miễn phí, có hình xem trước và có thể đổi lại.

Prompt bé gái áo hồng:

Edit this game sprite sheet into a NEW female avatar sprite sheet. The reference is the exact layout guide: preserve EIGHT equal columns and THREE equal rows, 24 cells, same canvas aspect ratio and same consistent foot baseline inside every cell. Replace the boy in EVERY cell with the same friendly Vietnamese girl, black hair in two short pigtails tied with pink ribbons, modest coral pink short-sleeved shirt, dark blue knee-length skirt, brown sandals, cute large head and warm hand-painted storybook style. Columns from left to right: E right-facing, NE back/right, N back-facing, NW back/left, W left-facing, SW front/left, S front-facing, SE front/right. Row 1 idle feet together; row 2 walking left leg forward; row 3 walking right leg forward. Every complete figure must fit completely INSIDE its own equal cell, never crossing a boundary, transparent padding around all figures. Identity/clothes/size identical in all 24 frames. ONLY the female sprite sheet, no boy, no scenery, no text, no labels, no border/grid, no glow. Genuine transparent alpha background throughout.

Prompt bé trai áo xanh:

Edit only the boy's shirt color in this existing sprite sheet: change the coral/red short-sleeved shirt to clear sky blue in ALL 24 cells. Preserve the character identity, face and skin colors, black hair, shorts, sandals, exact poses, exact EIGHT-column THREE-row grid layout, margins, dimensions and transparent background. Do not move, add or remove any frame. Do not recolor skin or background. This is a game animation sprite sheet, not a poster. Genuine alpha transparency, no text, no grid lines, no halo.

Prompt bé gái áo vàng:

Edit ONLY the shirt color in this girl's animation sheet from coral pink to warm sunflower yellow in every one of the 24 cells. Preserve exactly the same girl identity, face, skin colors, black pigtails and ribbons, dark blue skirt, brown sandals, all eight directions and all three idle/walk rows, exact canvas dimensions and cell layout. No new characters or poses, no moving frames, no recoloring skin. Genuine transparent alpha, no text, no background, no grid, no halo.

Use case: stylized-concept. Asset type: production game sprite sheet for a Vietnamese children's isometric village game. Generate a precisely aligned transparent PNG sprite sheet with EIGHT columns and THREE rows (24 equal cells), no margins between cells, preferably 1536x768. Every cell shows the same adorable Vietnamese child, short black hair, coral red shirt, dark shorts, sandals, big friendly head, soft storybook watercolor with clean readable edges, orthographic isometric 2:1 view, fully visible body, same size and feet aligned to same baseline in every cell. Columns, left to right, are E (right), NE (upper right/back), N (back), NW (upper left/back), W (left), SW (lower left/front), S (front), SE (lower right/front). Row 1: idle standing; Row 2: walk left leg forward; Row 3: walk right leg forward. All 24 silhouettes are separate with generous transparent padding inside each cell; no overlapping cells. No scenery, no shadows outside own cell, no words, no labels, no watermark, real alpha transparency. Consistent identity, clothing and scale across the whole sheet. This is a game asset, NOT a presentation of a sprite sheet.

## Prompt tile

Use case: stylized-concept. Asset type: seamless isometric 2:1 TOP-FACE ground tile atlas for a Vietnamese village game. STRICT 3 columns, 2 rows, overall canvas aspect ratio 3:1 (1536x512 or 1920x640), exactly six equal rectangular cells, each cell ratio 2:1. EACH cell is completely occupied by a flat diamond top face whose four vertices touch that cell's left middle, top middle, right middle and bottom middle. Transparent corners outside each diamond. Row1 left grass short green blades, middle warm sandy dirt path, right rice-paddy green ground with tiny sprouts. Row2 left blue pond water subtle ripples, middle warm reddish courtyard brick paving, right grass with tiny wild flowers. Cute hand-painted pastel children's storybook style, clean tile geometry, not photorealistic. NO tile thickness or side faces, no shadows extending beyond diamond, no text, no grid lines, no building, no props. Tile diamond faces must all be the SAME dimensions and perfectly align with equal cell boundaries, no margins or padding, no rounded diamond shapes. Real alpha transparency.

## Prompt chung cho sprite môi trường

Ảnh atlas môi trường được dùng làm style reference. Mỗi subject bên dưới được tạo bằng một lần gọi riêng với prompt:

Asset type: standalone transparent game sprite PNG, NOT an atlas. Use the provided atlas solely as style and subject reference. Recreate ONLY this one subject: **{subject}**. Cute hand-painted children's storybook style, isometric orthographic 2:1 camera, clean readable edges and soft lighting. Entire object must be visible, centered in a square transparent canvas, scaled to occupy at most 80% canvas width and 85% canvas height, ground contact at 93% of canvas height. Only one object, no other atlas objects, no environment/background, no text, no logos. Real transparent alpha. Preserve Vietnamese character and architectural details from reference.

- temple: Vietnamese rural communal house đình with curved red tiled roof, modest yellow plaster walls and wooden doors.
- house: small Vietnamese rural yellow plaster house with red tile roof and open veranda.
- banyan: lush Vietnamese banyan tree, rounded foliage and visible sturdy trunk.
- banana: Vietnamese banana tree with vivid broad leaves and short trunk.
- farmer: friendly older Vietnamese farmer full body, blue shirt brown trousers straw conical hat, front facing toward camera.
- rice: one harvest-ready clump of golden Vietnamese rice stalks with grain heads.
