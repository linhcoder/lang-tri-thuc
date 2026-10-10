# Asset manifest

Snapshot 10/10/2026. Registry runtime: apps/game-client/assets/scripts/world/VisualAssets.ts. Snapshot máy đọc được: [asset-manifest.json](asset-manifest.json). Xuất lại bằng npm.cmd run assets:manifest; script kiểm ID trùng/source tồn tại và ghi pixel/byte PNG thật.

48 record trong 10 nhóm, 43 scenery placement. Mỗi record có ID, name, group, file path, design size, anchor, logical sorting layer, collision, status/source. PNG có pixels/bytes; atlas cell có cell index. solidFootprints ghi collision instance. Layer logical Ground/Actors/HUD, không tạo Cocos Layer ID mới. Anchor actor (.5,0), ground (.5,.5), UI responsive.

| Nhóm | Asset chính | Nguồn / sử dụng |
|---|---|---|
| Ground | ground.meadow, meadow-texture, legacy | GroundPaths.ts, ground-v2.png, tiles.png; chunk bake |
| Paths | paths.dirt | GroundPaths.ts; control point / quadratic curve |
| Buildings | dinh, house, house-west, scenery.market | temple.png, house.png, scenery-v2 cell 3 |
| Vegetation | đa/chuối/lúa; hoa/bụi/cây/cỏ | PNG riêng, scenery-v2 cells 0,1,5,6 |
| Water | water.pond, water.lotus | WaterGround.ts với blocked tile list; lotus.png |
| Props | giếng/cầu/cổng/vườn/tre; fence/stones/lantern | village-details 4×2, scenery-v2 4×2 |
| Characters | 8 avatar/hair sheets; farmer/elder/6 NPC | PNG/sheet riêng, lazy theo ID |
| Animals | buffalo, hen, duck | village-details cells 3,4,5 |
| UI | ui.village-hud | VillageHUD.ts; Graphics/Label/Sprite |
| Effects | effects.contact-shadow | Shadow bake trong terrain/sprite, không realtime |

## Asset mới và provenance

| File | Pixel thực | PNG bytes | Status |
|---|---|---|---|
| assets/resources/village/ground-v2.png | 1254×1254 | 3,008,857 | generated candidate / placeholder |
| assets/resources/village/scenery-v2.png | 1774×887, logical 4×2 | 2,397,377 | generated candidate / placeholder |

Built-in imagegen tạo mới, prompt ở [GENERATION_PROMPTS.md](GENERATION_PROMPTS.md). Giữ alpha; không chỉnh hình bằng Python, không lấy pixel ảnh mẫu, không ghi đè PNG cũ. Cell generated 443.5×443.5 theo tỷ lệ 4×2; SpriteFrame rect hỗ trợ fractional coordinates nhưng cần artist chuẩn hóa padding/grid trước final. Prompt seamless không chứng minh cạnh texture hoàn hảo.

Tất cả record ghi placeholder, gồm candidate đang dùng chưa nghiệm thu artist. Nguồn AI/prompt và file gốc của PNG cũ đã xác định tại [ART.md](../../apps/game-client/ART.md); registry dẫn tài liệu này. Review văn hóa/điều kiện phát hành không đồng nghĩa xác nhận chỉ từ tên file. Không thêm ảnh internet hay watermark quan sát được. Reference chỉ phục vụ art direction, không trích pixel làm map.

## Thay thế và footprint

assetResourceKey(id) đọc path registry dưới assets/resources và load /texture. Giữ ID khi thay PNG. Scenery có cell dùng atlas 4×2; đổi path sang PNG riêng và bỏ cell để dùng một sprite. sceneryPlacements() là instance độc lập. Promise cache chống tải trùng. Ground/UI procedural có source TypeScript.

VillageModel là authority client/server. Ao chặn 30 tile nước, cầu mở 5 tile. Công trình có radius, quầy radius 1, đèn/fence/gốc cây radius 0. Dressing cỏ/hoa/đá phẳng không cản. Physical actor footprint ±5×±3 world pixel, khác hit UI. Khi sửa footprint/NPC/portal phải build API/server cùng client; contentVersion bao gồm walkability và portal spawn. Progress/reward ID giữ nguyên.

## Cần art final

- Path alpha edge/corner/junction và transition đất–cỏ–ruộng–nước.
- Bờ ao/ruộng hữu cơ; bridge geometry khớp hoàn toàn navigation strip.
- Icon atlas HUD, minimap art, UI frame minh họa.
- Shadow/lighting thống nhất PNG cũ và atlas mới.
- Chuẩn pixel grid/padding, texture tier thấp và provenance PNG cũ.

Không ghi các mục này là final. Xem [ART_DIRECTION.md](ART_DIRECTION.md) và [VISUAL_UPGRADE_REPORT.md](VISUAL_UPGRADE_REPORT.md) để đối chiếu ảnh và test.
