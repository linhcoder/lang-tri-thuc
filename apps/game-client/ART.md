# Art và prompt

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

## Prompt sprite nhân vật

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
