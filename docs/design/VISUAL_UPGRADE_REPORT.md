# Visual Quality Upgrade — nghiệm thu local

Ngày 10/10/2026. Hoàn thành phần triển khai của cả sáu milestone theo yêu cầu tiếp tục. Không commit, push hoặc deploy. Reference dùng để phân tích bố cục và phong cách, không làm background hay lấy pixel ghép cảnh.

## Kết quả theo milestone

| Milestone | Phần đã triển khai | Kiểm chứng | Asset / khác biệt còn lại |
|---|---|---|---|
| 1. Ground + Paths | Cỏ có texture và biến thiên seeded; đường cong, ngã rẽ bằng control point; bake theo chunk | Strict TypeScript, unit navigation, build Creator, browser zoom | Path procedural; cần alpha edge/corner/junction và transition vẽ tay |
| 2. Vegetation + Props | Hoa, bụi, cỏ, đá, hàng rào, đèn, quầy chợ, cây tiền cảnh; 43 instance độc lập | Registry/file metadata, collision/reachability, browser Low/High và culling | Atlas AI candidate; cần chuẩn cell/padding, ánh sáng và shadow thống nhất |
| 3. Buildings + Water | Đa lớn, đình trung tâm, nhà mái ngói, giếng/ao bên trái, ruộng bên phải; ao gradient/shore/ripple bake; cầu có 5 tile đi được | Unit đường đi; server từ chối băng nước, cho qua cầu; browser scenery/cầu dưới nhân vật | Bờ nước và ruộng còn theo grid; bridge art cần khớp navigation strip hơn |
| 4. Characters + NPC | Giữ body .65, dời NPC tránh mái/tán, nameplate ưu tiên gần và tránh nhau; cây/mái mờ khi che mặt bé | Assets/NPC click, avatar/hair/accessory/remote, Chương 1 desktop/mobile, fade fixture | PNG nhân vật/công trình cũ và mới chưa đồng nhất mỹ thuật; cần artist review |
| 5. UI/HUD | Avatar/level theo sao, progress, sao, nhiệm vụ chính/luyện tập phụ, minimap, túi/bộ sưu tập, thành tích, settings, tương tác và joystick; mobile menu gọn | Bốn viewport, bounds/non-overlap, controls, quality reload; zoom/pinch; parent gate và signed room | UI còn chữ và shape procedural, cần icon/frame atlas; level chưa có hệ XP riêng |
| 6. Performance | 25 chunk dùng hai terrain atlas; shared frames/cache; culling; tải sprite khi vào khu; baked shadow; Low/Medium/High; dispose resource | Build Creator 3.8.8, browser atlas/dispose, samples ba quality và bốn viewport | Chưa có streaming eviction/zone bundle riêng; chưa benchmark điện thoại hoặc Intel yếu thật |

Tất cả 48 record thuộc 10 nhóm đều ghi placeholder/candidate, không được coi là art final hoặc đạt chất lượng ảnh mẫu. Danh sách và provenance: [ASSET_MANIFEST.md](ASSET_MANIFEST.md), [asset-manifest.json](asset-manifest.json), [GENERATION_PROMPTS.md](GENERATION_PROMPTS.md), [ART.md](../../apps/game-client/ART.md). Hai PNG mới tạo bằng built-in imagegen; không thêm ảnh internet có nguồn không rõ.

## Kiểm thử cuối

- Strict client TypeScript và build Web bằng Cocos Creator **3.8.8** đạt.
- **48 nhóm client + 3 network lifecycle**, **5 server tests**, **5 MySQL/API tests** đạt. Server test gồm private multiplayer 10/16/20 client và kiểm tra movement/cầu.
- Browser `test:visual`: 1280×720, 390×844, 844×390, 320×568; HUD trong viewport, không chồng controls, thông báo tránh HUD, NPC interaction, occlusion fade, atlas, quality reload và dispose đạt; errors rỗng.
- `test:assets`, `test:avatars`, `test:zoom`: NPC/detail, cầu dưới actor, avatar/phụ kiện/tóc/remote, wheel/button/pinch 60–180%, joystick/modal/reload đạt.
- `test:m2`: Chương 1 desktop/mobile, planting/count/replay/reload, wrong answer/hint, unique star, legacy/future/corrupt save đạt.
- `test:stack`: parent flow, signed room, scoped save, server progress, offline fallback, farm portal, home và approved emote đạt.
- `test:campaign`: hoàn thành **8 chương**, 12 loại minigame, practice giữ story và reset thất bại giữ progress; errors rỗng.

Report/screenshot thực nằm trong `apps/game-client/temp/{visual-upgrade-qa,assets-qa,avatars-qa,zoom-qa,chapter-one-qa,stack-qa,campaign-qa}` (generated/ignored). Screenshot đã được xem trực tiếp trong quá trình chỉnh bố cục, cầu và occlusion.

## Số đo và giới hạn

Browser dùng ANGLE/AMD Radeon integrated, D3D11. Bốn viewport High có mẫu ngắn khoảng **60.27–60.33 FPS**, p95 **17 ms**, **67–82 draw calls** tùy viewport. Chương 1 khoảng **60.15 FPS**, p95 17 ms, 77 draw calls, JS heap 53.37 MiB. Ba quality trong online suite đều p95 17 ms; Low shadingScale .75, Medium .9, High 1. Asset transfer của online suite khoảng 40.93 MB, vẫn cần texture tier/compression trước phát hành.

Terrain atlas 1542×1806 và 1028×516, dưới 2048 mỗi chiều; khoảng 12.65 MiB RGBA terrain, bằng ngân sách chunk trước. Atlas giảm số texture terrain, không chứng minh tổng draw calls giảm khi cảnh và HUD đã thêm sprite. Mobile trong test là emulation trên cùng máy; số đo này chưa chứng nhận mục tiêu 30 FPS trên mọi máy yếu.

## Lỗi đã sửa khi kiểm thử

- Đồng bộ vị trí nông dân/portal và footprint giữa client, API và room server; contentVersion hiện tại **acac7f05**. Reward/progress ID giữ nguyên; khi deploy phải cập nhật cả ba service.
- Tách tương tác world khỏi hit-test HUD để nút tương tác không kích hoạt zoom.
- Đưa cầu xuống Ground, neo giữa cầu, thêm fade tán/mái che nhân vật.
- Dùng `Array.from(Map.values())` trước spread để tránh Babel loose tạo sai danh sách khi dispose.
- Sửa fixture farm portal theo vị trí mới và chờ cả x/y; browser tap chờ frame sau đóng modal để không bấm HUD vừa hiện; chuẩn hóa trailing slash URL của avatar suite. Các lượt thất bại trước sửa không tính là pass; các suite nêu trên đã chạy lại đạt.

## Preview từng milestone

Mở `apps/game-client` bằng **Cocos Creator 3.8.8**, chờ import, mở `assets/scenes/VillageScene.scene`, chọn **Preview Browser**. Terrain Canvas hiện yêu cầu Browser, chưa hỗ trợ Native Preview. Bản build/stack local đang mở tại **http://127.0.0.1:38080/**.

1. Đi và zoom dọc đường cong/ngã rẽ, xem biến thiên cỏ.
2. Đi đến chợ/hoa/hàng rào/cây tiền cảnh; đổi Low và High trong Cài đặt.
3. Đi cầu qua ao bên trái, đến giếng, sân đình, nhà và ruộng bên phải; nước ngoài cầu phải chặn.
4. Chạm Ông Đồ, Cô Tấm, Cô Giáo và nông dân; đi sau tán cây; thử avatar/phụ kiện và hai client.
5. Resize desktop/portrait/landscape; mở minimap, túi, thành tích, settings và menu mobile; dùng joystick/nút tương tác.
6. Di chuyển qua nhiều khu, reload quality/zoom; xem Profiler. Đo lại trên thiết bị đích trước beta.

Ảnh mẫu có mật độ, đường/bờ hữu cơ và ánh sáng thống nhất hơn. Phần kỹ thuật đã hoàn thành sáu bước; art final, review văn hóa/điều kiện phát hành và benchmark thiết bị thật vẫn cần làm trước nghiệm thu chất lượng mỹ thuật cuối.
