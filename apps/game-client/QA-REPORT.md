# Kết quả nghiệm thu bản playable

## Cập nhật VPS — 10/10/2026

Đã deploy các thay đổi hình ảnh, HUD, lúa nhiệm vụ và modal lên https://ltt.vui-hoc.xyz/game/. Release `9ff50a2-working-visual-d129e24c-20261010` gồm HEAD và thay đổi working tree; không commit/push. Client, API và multiplayer đồng bộ contentVersion `d129e24c`; admin build dùng URL production. SHA-256 gói local/remote khớp. Hai service active, HTTPS health đạt, storage MySQL. Giữ secret, DB và cấu hình aaPanel hiện có.

Trước cập nhật đã dump DB và restore vào DB thử riêng, hash state khớp; DB thử đã xóa. Release cũ `8940ae6-zoom-20261010` giữ để rollback. Live verify-api và verify-web đạt: đăng nhập admin/catalog, chặn anonymous/internal/dev room/room thiếu vé; UI phụ huynh, signed WebSocket hai client, avatar/tóc/phụ kiện, emote, lưu tiến độ, online reload và offline reload. Tài khoản QA được xóa trong finally. Live zoom desktop/mobile đạt wheel/button/pinch, clamp/reset/reload, click-to-move, modal blocking, joystick và portrait/landscape; errors rỗng. Đã xem screenshot signed-room trực tiếp. Báo cáo ignored: `temp/deploy/qa` và `apps/game-client/temp/zoom-qa`. Đây là browser viewport mobile, chưa chứng nhận điện thoại thật. Ctrl+F5 để tải bản mới.

## Thiết kế lại modal tương tác — 10/10/2026

ChapterOneView, VillageHub và LearningPanel dùng chung `assets/scripts/ui/ModalTheme.ts`: giấy kem viền gỗ/vàng, thanh tiêu đề xanh, nút tiếp tục xanh và đáp án vàng. Footer và nội dung có khoảng cách rõ; hàng đáp án Chương 1 dời xuống để tách Gợi ý. Caption dài tự SHRINK trong nút; đã xem ảnh minigame có “Nhờ người lớn cho nước sạch” hiển thị trọn hai dòng. Giữ ID, hit region, nút đọc/dừng/đóng, dữ liệu và reward; không vẽ Graphics lại mỗi frame.

- Strict TypeScript, 48 nhóm client + 3 network lifecycle và Web build Creator 3.8.8 đạt.
- Browser Chương 1 desktop/mobile (plant/count/replay/reload/recovery), toàn bộ 8 chương và 12 board minigame đạt, errors rỗng. Bản cuối sau sửa caption đã chạy lại hai suite này.
- Browser visual bốn viewport trước chỉnh SHRINK đạt bounds/non-overlap, modal/menu controls và quality/reload; chỉnh SHRINK chỉ đổi caption, giữ geometry/hit rectangle. Đã xem screenshot desktop/mobile của bài đếm, Sổ làng và minigame.
- Evidence: `temp/chapter-one-qa/count-hint.png`, `count-mobile.png`, `temp/campaign-qa/all-chapters.png`, `animal-care-board.png`. Preview Creator 3.8.8 → VillageScene → Preview Browser, hoặc http://127.0.0.1:38080/ rồi Ctrl+F5.

Không commit/push/deploy trong đợt này. Demo LearningPanel dùng cùng theme nhưng không chạy lại full demo flow trong lượt kiểm thử này.

## Sửa hình lúa nhiệm vụ — 10/10/2026

Thay nét vẽ Graphics bằng sprite mạ xanh riêng, đồng bộ cây vừa trồng và bài đếm; dời năm ô ra khỏi NPC/nhãn và mái đình. ID/index/save/reward giữ nguyên. Strict TypeScript, 48 nhóm client + 3 network, build Creator/client/API/server đạt; server 5/5, API 4/4 đạt (MySQL skip lượt này). Browser Chương 1 desktop/mobile, sprite sau planting/reload, bài đếm, replay/unique star và recovery save; signed online/parent/server progress đạt, errors rỗng. Đã xem planted-rice-full và count-hint trực tiếp. ContentVersion d129e24c có tọa độ ô; cần client/API/server cùng bản. Xem [asset, prompt và kiểm chứng](../../docs/design/RICE_MISSION_FIX.md). Local http://127.0.0.1:38080/, Ctrl+F5; không cần High để thấy lúa nhiệm vụ. Không commit/push/deploy.

## Skin các nút khoanh đỏ — 10/10/2026

Đã thiết kế Sổ làng, Tới mục tiêu, Người lớn và cụm zoom bằng khung nâu/vàng, nền giấy và icon atlas hiện có; reset zoom nền xanh đậm, phần trăm vẫn cập nhật thật. Giữ ID, hit rectangle và chức năng; skin chỉ vẽ lại khi kích thước/atlas đổi, không redraw Graphics mỗi frame. Strict TypeScript và Creator 3.8.8 Web build đạt. Browser bốn viewport đạt mở Sổ làng/parent gate, đi tới mục tiêu, HUD bounds/non-overlap và vùng bấm mobile ≥44 CSS px; wheel/button/pinch, reset/clamp/reload, joystick/modal và portrait/landscape đạt; errors rỗng. Đã xem screenshot desktop/mobile. Mẫu High khoảng 60.1–60.4 FPS, p95 17–17.1 ms trên máy hiện tại; chưa chứng nhận mobile thật. Local http://127.0.0.1:38080/. Không commit/push/deploy phần mới.

## HUD, biển làng và lúa — 10/10/2026

Đã thêm 89 bụi lúa vàng, 6 biển gỗ tên khu, icon minh họa cho HUD và khung parchment minimap. Bản đồ có hình làng/vị trí bé và chọn khu tạo đường đi; mobile 4 khu/trang. Registry hiện 51 asset, 159 instance. Strict TypeScript, 48 nhóm client + 3 network, Web build Creator 3.8.8, browser visual bốn viewport, assets/NPC, zoom và Chương 1 desktop/mobile/save đạt. Mẫu High khoảng 60.3 FPS, p95 17 ms, 83–124 draw calls; chưa benchmark mobile thật. Các PNG vẫn candidate và map còn ký hiệu procedural. Xem [asset, prompt imagegen, khác biệt và kiểm chứng](../../docs/design/UI_RICE_ART_PASS.md). Local http://127.0.0.1:38080/; chọn High để xem đầy đủ ruộng. Không commit/push/deploy phần mới.

## Reference art pass — 10/10/2026

Đã thay sprite cây đa chính và đình bằng hai PNG riêng tạo qua imagegen, chỉnh kích thước 420×280; thêm 21 cụm hoa/bụi thấp (64 scenery instance). Giữ footprint, NPC/progress và contentVersion. Strict client, 48 nhóm client + 3 network, Web build Creator 3.8.8 và browser visual bốn viewport đạt. Mẫu ngắn 60.14–60.38 FPS trên máy hiện tại; chưa chứng nhận điện thoại thật. Đã xem screenshot game thật; asset vẫn là candidate, chưa đạt giống hoàn toàn reference. Xem [prompt, asset và kết quả](../../docs/design/REFERENCE_ART_PASS.md). Không commit/push/deploy trong đợt này.

## Visual upgrade — hoàn thành milestone 1–6 — 10/10/2026

Đã hoàn thành triển khai Ground/Paths, Vegetation/Props, Buildings/Water, Characters/NPC, responsive HUD và tối ưu render. Xem [báo cáo nghiệm thu đầy đủ](../../docs/design/VISUAL_UPGRADE_REPORT.md), [art direction](../../docs/design/ART_DIRECTION.md) và [asset manifest](../../docs/design/ASSET_MANIFEST.md). Các mục bên dưới là lịch sử những phiên trước.

- Strict TypeScript và Web build Creator 3.8.8 đạt; 48 nhóm client + 3 network lifecycle, 5 server và 5 MySQL/API test đạt.
- Browser visual bốn viewport, assets, avatars, zoom, Chương 1 desktop/mobile, signed online/offline stack và toàn bộ 8 chương đạt; report cuối không có JavaScript error.
- 25 chunk terrain dùng hai atlas; culling, tải sprite theo khu, baked shadows, Low/Medium/High và dispose đã kiểm thử. Mẫu High khoảng 60.27–60.33 FPS, p95 17 ms trên AMD/ANGLE; chưa chứng nhận điện thoại/Intel yếu thật.
- 48 record / 10 nhóm, 43 scenery instance; asset độc lập, có metadata/provenance. Tất cả còn placeholder/candidate; đường/bờ ao, lighting, icon HUD và padding atlas cần artist hoàn thiện, chưa đạt ngang ảnh mẫu.
- Cầu đi được, cây/mái mờ khi che bé, NPC/nameplate được bố trí lại. Footprint/portal mới đồng bộ client/API/server, contentVersion acac7f05; deploy sau này cần cập nhật cả ba.
- Preview: Creator 3.8.8 → assets/scenes/VillageScene.scene → Preview Browser; local http://127.0.0.1:38080/. Không commit/push/deploy trong đợt này.

## Visual upgrade — milestone 1 Ground + Paths — 10/10/2026

Đã phân tích `docs/design/village-reference.png` và scene/runtime renderer; xem [Art direction](../../docs/design/ART_DIRECTION.md) và [Asset manifest](../../docs/design/ASSET_MANIFEST.md). GroundPaths tạo nền cỏ có mảng màu mềm/seed ổn định và đường đất cong, ngã rẽ bằng control point độc lập. Bake vào 25 chunk hiện có, không tăng node terrain hoặc vẽ lại mỗi frame. Giữ nguyên projection 64×32, navigation, NPC, collision và save. Không dùng ảnh tham chiếu làm background. Chỉ triển khai milestone 1, chưa commit/push/deploy.

- TypeScript strict và Cocos Creator 3.8.8 Web build đạt; 45 nhóm client + 3 test network lifecycle đạt.
- Browser assets: Ông Đồ, Cô Tấm, sen, toàn bộ NPC truyện và detail atlas hiển thị; click NPC đạt, không lỗi JS. Đã xem screenshot thật và sửa mảng cỏ quá rõ thành gradient mềm. Ảnh cuối: `temp/assets-qa/elder.png`, cùng các khu khác trong thư mục đó.
- Browser zoom bản cuối: wheel, nút ±, pinch, giới hạn 60–180%, HUD cố định, click-to-move, modal, reload zoom, joystick, portrait/landscape đều đạt; không lỗi JS. Report `temp/zoom-qa/report.json`.
- Chương 1 bản cuối: full desktop/mobile, gieo trồng, trả lời sai/hint, reload progress/replay, sao không trùng, migration legacy/future/corrupt save đạt. Lượt đầu timeout 90 giây ở reload legacy; chạy lại toàn suite trên build cuối ổn định đạt. Không xác định nguyên nhân timeout từ bằng chứng hiện có; không tính lượt đầu là pass. Report `temp/chapter-one-qa/report.json`.
- Mẫu 5 giây trên AMD Radeon integrated/ANGLE D3D11: khoảng 60.1 FPS, p95 16.9 ms, 75 draw calls, JS heap 74.4 MiB. Đây là một mẫu ngắn desktop, chưa chứng nhận GPU Intel yếu/mobile thật hoặc worst-case; Low mode, atlas batching và streaming theo khu thuộc milestone 6.

**Art còn thiếu:** texture cỏ/đất vẽ tay final, alpha edge/corner/junction, transitions bờ ao/ruộng, đá/cỏ/hoa mép đường và baked shadow. Ground/Paths hiện là procedural placeholder; đường còn màu phẳng và ranh tile/đường nối chunk có thể thấy ở mức zoom lớn. Ao/ruộng/sân vẫn atlas cũ. Tỷ lệ nhà/cây, bố cục trái/phải, chợ có quầy riêng và HUD chưa theo ảnh mẫu, dành cho milestone tiếp theo.

**Preview:** mở `apps/game-client` bằng Creator **3.8.8**, chờ import, mở `assets/scenes/VillageScene.scene`, chọn **Preview Browser**. Build local đang xem tại `http://127.0.0.1:38080/`. Thử zoom, đi qua nhánh đường và chơi Ông Đồ → ruộng → sân đình. Chưa hỗ trợ terrain Canvas ở Native Preview.

## Tỷ lệ nhân vật và zoom cảnh — 10/10/2026

Avatar local/remote và NPC dùng phần hình 65% kích thước cũ; tên không bị thu theo phần hình, phụ kiện/gesture đi cùng body. Không đổi tọa độ/collision/speed. Cổng dời sang ô 17,25 để hết che Tí–Na; cổng vẫn là scenery không blocked. Vùng chạm NPC có mức tối thiểu theo zoom; hai điểm NPC cặp vẫn nhận click lệch tâm.

Zoom cảnh 60–180% qua −/+, tỷ lệ/reset 100%, wheel và pinch. HUD/modal/joystick giữ kích thước CSS; nút zoom 56×48 CSS px ở mobile. Zoom lưu browser preference riêng, không ghi campaign/reward. Hai ngón hủy đường đi và không phát click sau end/cancel/blur; joystick và HUD không bị chiếm để pinch. Modal chặn zoom; resize hủy input đang dở và giữ mức zoom.

- Strict client, 45 nhóm client + 3 network lifecycle và build Creator thật đạt. CameraZoom.meta do Creator import; scene/UUID giữ nguyên.
- `test:zoom` đạt local **và HTTPS live**, desktop/mobile giả lập: wheel/button/pinch, clamp/reset, HUD cố định, click-to-move tại 60%, modal, reload preference, joystick ownership, portrait/landscape; không lỗi JS. Ảnh `temp/zoom-qa` đã xem trực tiếp.
- `test:assets` đạt mọi NPC/ao/scenery/click cặp sau đổi tỷ lệ. `test:m2` đạt chương 1 desktop/mobile, save/reload/replay/legacy/future/recovery. Mẫu AMD 60,07 FPS, p95 17 ms, 75 draw calls, JS heap 75,34 MB; chưa suy ra máy yếu/mobile thật.
- Live signed-room suite đạt hai client, cùng tỷ lệ body local/remote, tóc/khăn/emote, authoritative save, online reload và offline reload. API vẫn contentVersion 8f30f2cc; cập nhật frontend tương thích, DB/vé không đổi.
- QA bắt được wheel bị handler Cocos chặn bubbling (đổi capture listener) và Babel loose biến spread Map thành concat thay vì iteration (đổi Array.from(entries)). Lượt pinch đầu timeout không tính là pass; sau sửa suite local/live đều đạt.

Phần còn phát triển ghi riêng tại [DEVELOPMENT_BACKLOG](../../docs/DEVELOPMENT_BACKLOG.md). Đây vẫn là staging/prototype, còn biên tập và thiết bị thật trước beta.

## Staging aaPanel live — 10/10/2026

Đã triển khai `https://ltt.vui-hoc.xyz/` và `/game/` trên Nginx/Node 24.16/MariaDB 10.11 có sẵn. Hai service user langtri bind loopback 33080/32580, systemd enabled, giữ nguyên root/cert aaPanel và các vhost khác. Health external TLS hợp lệ: storage mysql, contentVersion 8f30f2cc. UI anonymous 401, internal API 403; admin login và catalog 90/6/24 đạt; room development và private room không vé bị từ chối.

- Browser live: UI phụ huynh tạo hồ sơ/vé, signed WebSocket, hai client, emote, avatar/tóc/khăn, tiến độ authoritative, reload vào lại online, offline rồi reload giữ scope; không lỗi JavaScript. Tài khoản QA được xóa sau kiểm thử. Screenshot/report nằm `temp/deploy/qa`, đã xem renderer trực tiếp.
- Backup SQL riêng và restore vào DB tạm đạt, SHA-256 state khớp; chỉ xóa DB restore tạm. Backup cuối `/opt/lang-tri-thuc/backups/database-20261010T014858Z.sql`, mode 600; secret ứng dụng mode 600 ngoài web root.
- Sửa entrypoint API/server so realpath để chạy qua symlink current; lần khởi động đầu thoát 0 và chưa chuyển Nginx, sau sửa build Linux/start/health đạt.
- Sửa reload sau xóa vé khỏi URL: giữ vé chưa hết hạn trong sessionStorage của tab; lựa chọn solo/hết hạn loại vé, giữ scope backup. Client routing không xác thực chữ ký, server vẫn kiểm vé/expiry/ownership. Fragment malformed không tái dùng hồ sơ trước. Khi storage bị chặn, chơi từ vé mới vẫn được, reload cần người lớn mở lại.
- Strict client/Cocos build đạt; 43 nhóm client + 3 network lifecycle đạt. Server 5 test đạt (thêm tắt room dev loopback), production binary reservation đạt sau sửa realpath; API/MySQL 5 test đạt.

Lượt browser đầu đã vào room/lưu nhưng timeout ở reload; đã sửa session và chạy lại toàn suite live đạt. Build Linux có cảnh báo thiếu tsconfig Cocos generated, nhưng build API/server đạt; Cocos Web được build thật trên máy Creator. Nginx -t có warning từ hai vhost có sẵn, syntax test và reload đạt. Đây là staging có preview password, chưa thay thế biên tập nội dung, QA thiết bị thật, trẻ có giám sát hoặc soak WAN.

Runbook và rollback: [deploy/aapanel](../../deploy/aapanel/README.md). Những dòng “chưa deploy VPS” ở các đợt cũ bên dưới là lịch sử.

## Đợt hoàn thiện tổng thể — 10/10/2026

Trạng thái hiện hành: [đối chiếu toàn bộ yêu cầu](../../docs/COMPLETION_CHECKLIST.md). Các mục “chưa có tóc/khăn/biểu cảm” và số test phía dưới là lịch sử.

- Tóc riêng cho bốn avatar, lưu/migration và đồng bộ room; lazy avatar/NPC/tóc, loading overlay. Thêm atlas tám loại scenery, chín node; collision/A* dùng model chung.
- 12 trò có minh họa state bằng Graphics, pool label; cửa sổ nhịp rộng hơn cho trẻ nhỏ. Đèn ông sao có kéo thả và nút thay thế. Luyện/lễ hội sau tám sao không nhận lại sao truyện.
- 90 câu theo tuổi/kỹ năng; admin form chương/quest title, câu hỏi, sáu NPC, 24 metadata asset; review/audit/export. Import kiểm tra toàn gói, hỗ trợ --check, release từ chối draft. Admin mặc định đọc nội dung từ shipped pack trước draft trong DB.
- Sửa pending join sau offline/dispose, callback room cũ, sai phiên bản nội dung, thất bại ba lần; callback chuyển solo gỡ hook authoritative để trò local tiếp tục chạy.

### Kiểm thử đã chạy

| Nhóm | Kết quả / phạm vi |
| --- | --- |
| Strict client, Cocos Web, API, admin build | Đạt; Creator import meta thật; giữ nguyên scene |
| Client | 42 nhóm engine/save/content/input + 3 test lifecycle network đạt |
| API | 4 test logic trong suite MySQL đạt; lượt standalone trước khi bổ sung hồi quy shipped-pack có 3 đạt/1 MySQL skip |
| MySQL riêng | 5 đạt, gồm admin shipped defaults, rollback, concurrent lock, Unicode, reconnect durable |
| Colyseus | 4 đạt; invalid avatar/hair, packet cũ giữ appearance, handshake và 20 client local |
| Campaign | Đủ 8 chương, 12 trò minh họa, 8 receipt, luyện, reload, reset thất bại giữ dữ liệu |
| Avatar | 4×24 frame, tóc, khăn, gesture, reload, touch mobile, remote appearance; không lỗi JS |
| Assets | Lazy NPC theo vùng, click 7 điểm NPC, 3 sen, 9 node/8 frame scenery; không lỗi JS |
| Drag | Desktop/mobile touch, thả sai, cancel/blur, click thay thế, không tăng sao truyện; không lỗi JS |
| Speech | Đủ 8 chương, câu/lựa chọn, hint, mute, stop/blur, callback lỗi, thiếu giọng rồi thử lại; API giọng mock |
| Admin browser | Form chapter/quest/lesson/NPC/asset, review và full export; API fixture riêng |
| Chương 1 browser | Desktop/mobile đầy đủ, partial reload/replay, save legacy/future/corrupt, touch ≥44 CSS px, landscape; không lỗi JS |
| Stack browser | MySQL/phụ huynh, vé riêng, save scoped, avatar 2/tóc 1/khăn 3, portal/nhà/emote và offline gỡ hook server; không lỗi JS |

Mẫu chương 1 bản cuối trên AMD Radeon: 60,14 FPS, p95 16,9 ms, 68 draw calls, JS heap 62,65 MB. Đây là mẫu ngắn trên một GPU; không suy ra kết quả Intel/điện thoại thật hoặc RAM toàn tiến trình.

Stack Low/Medium/High đo p95 16,9/16,9/17 ms, shading scale 0,75/0,9/1, JS heap khoảng 43,5–46,9 MiB. Session có tổng resource transfer khoảng 35,53 MiB sau mở avatar/tóc; không phải dung lượng tải ban đầu.

### Sửa lỗi trong quá trình QA

Đã sửa label form để tên truy cập không thay đổi theo nội dung textarea, tăng cửa sổ nhịp cho trẻ nhỏ và rút hướng dẫn Ô ăn quan về hai dòng để hết clipping. Drag test chờ trạng thái input/ghost và UI thật thay vì giả định frame đã xử lý sự kiện. Một lượt chương 1 nhầm cổng mặc định 8080 đã dừng, chạy lại đúng GAME_WEB_URL=38080 đạt. API test trong sandbox gặp uv_os_get_passwd; chạy lại ngoài sandbox đạt. Không tính các lượt lỗi này là pass.

Hồi quy shipped-pack phát hiện admin đọc lại câu mặc định khi runtime được import qua module khác trong tsx. Đã gom getter câu hiện hành vào LessonCatalog, kiểm tra GET và export cùng đọc prompt đã import; suite MySQL cuối đạt cả năm test.

Gói fixture import --draft --check đạt 8/90/6/24; --check release từ chối draft trước ghi. Không import fixture vào resource thật. Screenshot/report trong temp của từng suite và apps/admin/temp đã xem mẫu avatar/mobile, NPC/ao/scenery, Ô ăn quan/mê cung và form admin. Dữ liệu fixture không được duyệt để phát hành.

Còn gate người biên tập, nguồn/license art, thử trẻ có giám sát, Intel/mobile thật, soak mạng, Docker/VPS. Máy hiện tại không có Docker; chưa deploy. Nội dung vẫn draft; giọng mock không chứng minh âm thanh thực nghe được.


## Đọc thoại và bài học đủ tám chương — 10/10/2026

Chương 2–8 có nút Nghe/Dừng đọc ở hội thoại, câu hỏi bài học và luật/gợi ý mini game. Bài học đọc cả các lựa chọn theo thứ tự, không tiết lộ đáp án đúng. Dùng chung `SpeechReader` với chương 1: chỉ đọc khi bật âm thanh, chọn giọng tiếng Việt (ưu tiên giọng local), tốc độ 0,85; thiếu API/giọng hoặc lỗi engine có thông báo. Có thể bấm lại khi danh sách giọng tải xong.

Đóng/đổi bảng, gợi ý, chuyển câu, blur/hide và dispose dừng đọc; callback cũ sau khi hủy không ghi lên bảng mới. Việc nghe không đổi tiến độ hoặc nhận thưởng. Không thêm file âm thanh hay dịch vụ đọc thoại ngoài.

- Strict TypeScript, 38 nhóm test client và Cocos build đạt; `.meta` của module mới do Creator import.
- `test:speech` đạt: click đọc hội thoại cả tám chương, bài học/lựa chọn, luật trò chơi; mute, thiếu giọng rồi thử lại, lỗi callback, dừng/blur và touch Android giả lập. Không có lỗi JavaScript. Fixture hoàn thành chương 1 và completion qua engine dùng để mở các bảng, không thay thế nghiệm thu gameplay tám chương.
- Speech API trong test được giả lập: đã xác nhận nội dung gửi, lang/rate và lifecycle; chưa xác nhận âm thanh nghe được hoặc chất lượng giọng tiếng Việt trên máy/điện thoại thật. Ảnh desktop/mobile và report ở `temp/speech-qa` đã xem trực tiếp.
- `test:m2` trên stack cổng 38080 đạt: toàn luồng chương 1 desktop/mobile, lưu và reload giữa bài, replay, sao duy nhất, giữ save legacy/future và phục hồi save lỗi. Không có lỗi JavaScript; mẫu AMD p95 17 ms. Lượt đầu ở server cũ cổng 8080 lỗi HTTP; chạy lại trên stack đang dùng đã đạt.

Còn thiếu chỉnh tóc riêng và nghiệm thu thiết bị thật. Các mục dưới ghi kết quả các đợt trước.

## Biểu cảm avatar — 10/10/2026

Người lớn → Chọn nhân vật có nút Vẫy chào/Vui mừng. Bàn tay vẫy dùng Graphics; vui mừng nhún sprite và khăn, thêm đốm sáng. Đây là animation bằng code trên sprite idle hiện tại, chưa phải bộ sprite cử chỉ vẽ riêng. Chạy 1,6 giây, dừng khi di chuyển, không đổi tọa độ/collision/save/tiến độ.

- Strict TypeScript, 36 nhóm test client, build Cocos và 4 test server đạt. Test thời gian hữu hạn, hết hạn, hủy khi di chuyển; server chỉ nhận emote có sẵn, giới hạn 2 giây và tôn trọng chặn bạn.
- `test:avatars`: cả bốn avatar chạy hai biểu cảm, kết thúc trả sprite/khăn về vị trí gốc, không đổi tọa độ; chọn vẫy chào bằng touch trên Android giả lập. Các kiểm tra phụ kiện, reload, tám hướng và remote avatar vẫn đạt.
- `test:stack`: UI phát vui mừng sau phản hồi server; SDK peer từ hồ sơ thứ hai gửi hello/happy, browser nhận và chạy animation remote. Sau chọn offline, nút vẫy chào chạy local. Không có lỗi JavaScript. Ảnh ở `temp/avatars-qa/gesture-*.png` và `temp/stack-qa/remote-*.png`.

Còn thiếu chỉnh tóc riêng và nghiệm thu điện thoại thật. Các mục bên dưới ghi kết quả từng đợt trước.

## Khăn quàng độc lập — 10/10/2026

Người lớn → Chọn nhân vật → Chọn khăn quàng: không dùng khăn, đỏ, xanh hoặc vàng. Khăn vẽ bằng Cocos Graphics, gắn ở cổ theo tám hướng và nhịp bước; dùng được với cả bốn avatar. Save cũ thiếu phụ kiện mặc định không khăn; mã không hợp lệ về 0. Xóa sổ chương 2–8 giữ lựa chọn. Tiến độ từ server không ghi đè phụ kiện local.

- Strict TypeScript và 35 nhóm test client đạt, gồm migration/normalization và reset khi storage lỗi.
- Bốn test server đạt; kiểm mã phụ kiện không hợp lệ, đồng bộ giữa hai client và packet cũ giữ lựa chọn.
- Cocos build và `test:avatars` đạt: click bốn lựa chọn, reload, tám hướng di chuyển, chọn khăn bằng touch trên mobile Android giả lập, nhận phụ kiện remote qua production Colyseus. Không có lỗi JavaScript. Ảnh và JSON tại `temp/avatars-qa`.

- `test:stack` chạy lại trên MySQL local đạt: UI hồ sơ chọn avatar 2/khăn 3, state phòng riêng nhận đúng cả hai; portal, nhà, emote, tiến độ server và offline fallback đạt. Không có lỗi JavaScript; mẫu AMD Low/Medium/High p95 ≤17 ms.

Chưa có chỉnh tóc riêng hoặc animation vẫy tay/vui mừng; mobile hiện kiểm bằng giả lập.

## Avatar bé trai/bé gái — 10/10/2026

Bổ sung `boy-blue.png`, `girl-pink.png`, `girl-yellow.png` (mỗi sheet 8 hướng × idle/hai bước chân), giữ sheet bé trai áo đỏ gốc. Menu Người lớn → Chọn nhân vật có bốn preview và dấu chọn. Không nhuộm màu da hoặc thêm nơ Graphics lên boy. Avatar IDs 0–3 và save version giữ nguyên; lựa chọn lưu theo campaign/profile. Nhân vật remote dùng cùng sheet/avatar ID; tên màu xanh giúp nhận ra bạn online.

- Client strict, 34 nhóm test client, Cocos build và 4 test server: đạt.
- Server kiểm avatar là integer 0–3; gói tin cũ thiếu avatar giữ lựa chọn trước đó. Test hai client xác nhận thay avatar 2 → 3 được đồng bộ, mã 99 không làm đổi state.
- `test:avatars`: UI chọn đủ bốn avatar bằng click; mỗi lựa chọn sống qua reload; input bàn phím kiểm đứng/đi cả tám hướng; mobile Android giả lập chọn bằng touch với nút ≥44 CSS px. Browser khác nhận đúng avatar/hướng/idle hoặc walk qua production server Colyseus riêng. Không có lỗi JavaScript. Ảnh menu/nhân vật/mobile/online và JSON tại `temp/avatars-qa` đã được xem trực tiếp.
- `test:stack`: phòng riêng có vé phụ huynh chọn bé gái, server state và SpriteFrame cùng avatar 2; các kiểm tra portal/nhà/emote/offline fallback vẫn đạt. Mẫu AMD Radeon Low/Medium/High có p95 17 ms; tổng resource tải cold khoảng 29,27 MB trong session. Đây chưa là nghiệm thu điện thoại thật hoặc Intel HD/UHD.

Đợt này chưa thêm trình chỉnh tóc/phụ kiện độc lập hoặc animation vẫy tay/vui mừng. Bộ mới có idle/walk hai bước như baseline. Prompt dùng built-in imagegen và đường dẫn asset ghi trong [ART.md](ART.md).

## Asset NPC và ao sen — 10/10/2026

Tám PNG alpha được tạo bằng built-in imagegen và lưu trong `assets/resources/village`: `elder`, `co-tam`, `teacher`, `market-lady`, `potter`, `ti-na`, `hang-cuoi`, `lotus`. Creator import `.meta` thật. Sprite thay Graphics cho Ông Đồ và sáu điểm NPC trong Sổ làng; ba cụm sen trang trí mặt ao. Hai cặp nhân vật có vùng chạm rộng theo sprite. Cô Giáo Lan/Nghệ Nhân Gốm dịch sang ô đất gần đó để tránh cây/mái nhà che hình; điểm trường học và model collision client/server đồng bộ.

- `check:client`, 34 nhóm test client, build Cocos và 4 test server: đạt.
- `test:assets`: xác nhận SpriteFrame thật cho mọi NPC và ba cụm sen; click cả bảy điểm NPC mở hội thoại, gồm click lệch tâm ±45 px ở hai cặp nhân vật. Không có lỗi JavaScript. Ảnh từng khu và report ở `temp/assets-qa`; đã xem trực tiếp ảnh trong renderer để kiểm tra nền alpha, tỉ lệ và tình trạng che khuất.
- `test:m2` trên bản cuối: đạt toàn luồng desktop/mobile giả lập, lưu/reload/replay, sao duy nhất và recovery save. Mẫu AMD Radeon: 60,11 FPS, p95 17 ms, 65 draw calls, JS heap 83,02 MB. Asset mới làm tăng dung lượng/chi phí bộ nhớ; mẫu ngắn này chưa xác nhận điện thoại thật hoặc Intel HD/UHD.
- Các sprite NPC mới là idle tĩnh; chưa có animation walk/gesture riêng. Cụm sen không tạo tương tác hoặc đổi collision ao. Prompt và nguồn tạo ảnh ở [ART.md](ART.md).

## Giữ tiến độ khi bộ nhớ lỗi — 10/10/2026

`CampaignSave.resetLaterChapters` chỉ thay tiến độ trong phiên sau khi ghi thành công cả bản sao trước xóa và save mới. Nếu một bước ghi thất bại, giữ nguyên tiến độ trong phiên và save đang dùng. Khôi phục save lỗi giữ bản `.recovery` đầu tiên; dữ liệu lỗi mới nằm trong `.recovery.latest`. Nếu không ghi được bản phục hồi, phiên không ghi đè raw save.

Client strict và 34 nhóm kiểm thử đạt; build Cocos đạt. Các test mới kiểm tra lỗi ghi backup, lỗi ghi save chính, reset thành công giữ setting và bảo toàn bản phục hồi đầu tiên.

`test:campaign` chạy trên Cocos build thật: hoàn thành 12 mini game và đủ 8 sao; giả lập `QuotaExceededError` khi ghi save chính trong thao tác xóa từ giao diện phụ huynh, kiểm tra tiến độ trong phiên và localStorage giữ nguyên, reload vẫn đủ 8 sao. Kết quả `failedResetPreservesProgress: true`, không có lỗi JavaScript; report ở `temp/campaign-qa/report.json`. Lỗi bộ nhớ được giả lập, không phải đo ổ đĩa đầy trên thiết bị thật.

## Kiểm tra lại bản tám chương — 09/10/2026

Môi trường: Node.js 22.14.0, Cocos Creator 3.8.8, Chrome headless/WebGL D3D11 trên AMD Radeon. Phiên bản Node khuyến nghị trong README vẫn là 24.13+.

- Client strict và 31 nhóm kiểm thử: đạt. Test mới kiểm tra kết quả từng câu rải hạt, chặn trả lời thêm khi đang xem kết quả và hiển thị câu cuối trước huy hiệu trong demo.
- Build Cocos web, API và admin: đạt; server build và 4 integration test: đạt, gồm phòng riêng/authorization/result/emote và tải 10/16/20 client.
- API: 2 test đạt bằng SQLite in-memory; test MySQL được bỏ qua khi chưa có cấu hình. Sau khi provision MySQL local bằng helper, `test:mysql` đạt cả 3 test, gồm API và rollback/20 transaction đồng thời/Unicode/reconnect trên database `_test` riêng.
- Browser demo: đạt luồng thu hoạch/đếm/rải hạt/huy hiệu, cảm ứng, reload và hai người chơi leave/reconnect. Ảnh `temp/release-qa/sowing-final-result.png` xác nhận kết quả cuối cùng và nút **Nhận huy hiệu**.
- Browser Chương 1: đạt desktop/mobile, reload giữa trồng/đếm/replay, sao duy nhất, legacy migration và save future/corrupt.
- Browser campaign: hoàn thành chương 2–8, đủ 12 mini game và 8 sao; reload mỗi chương giữ tiến độ, không có lỗi JavaScript. Chương 1 được kiểm tra riêng bằng `test:m2`.
- Browser phụ huynh/game/MySQL: đạt đăng ký/cấp vé, phòng riêng, save theo profile, tiến độ server, portal/nhà/emote và offline fallback. `test:stack` xóa tài khoản thử sau khi chạy.

Demo đo khoảng 60,04 FPS, p95 17 ms, 48 draw calls. Chương 1 khoảng 60,26 FPS, p95 16,9 ms, 63 draw calls. Stack Low/Medium/High đều có p95 17 ms trong mẫu ngắn. Không dùng các mẫu AMD này để xác nhận Intel HD/UHD, điện thoại thật hoặc soak 30 phút.

Dependency được cài lại từ lockfile. Cấu hình local sinh trong `.env.local` bị ignore; không ghi credential vào báo cáo/Git. Test MySQL chỉ reset database `_test`; không migration hoặc reset dữ liệu legacy trong đợt này.

Đợt tiếp theo: validator chapter pack từ chối phần tử null/primitive, questTitles dạng array, văn bản trống và title vượt giới hạn API; kiểm tra toàn gói trước khi thay nội dung. Client strict và 32 nhóm test đạt, bao gồm kiểm tra dữ liệu lỗi không gây exception hoặc cập nhật dở dang.

## Kết quả baseline playable — lịch sử

Ngày kiểm tra: 09/10/2026. Cocos Creator 3.8.8, Node.js 24, Chrome headless/WebGL D3D11 trên AMD Radeon tích hợp.

- TypeScript client strict và server build: đạt.
- Client: 17 nhóm kiểm thử đạt (1.600 tile round-trip, A* so với BFS, collision, input, camera, scene, nhiệm vụ và lưu tiến độ).
- Server: 3 kiểm thử đạt, gồm hai client đồng bộ/thoát, chống teleport và kết nối bản JavaScript production trong tiến trình riêng.
- Bản web Cocos thực tế: hoàn thành thu hoạch → đếm → rải hạt → huy hiệu; kiểm tra trả lời sai và khôi phục tiến độ sau reload.
- Browser giả lập Android: joystick, touch tương tác NPC, đóng hội thoại và xoay ngang đạt.
- Hai browser online: đồng bộ di chuyển, xóa người đã thoát và tự vào lại phòng đạt; không có lỗi JavaScript.

Hai lần đo trong 5 giây ở viewport 1280 × 720: khoảng **60 FPS**, p95 **16,9 ms**, **48 draw calls**, JS heap khoảng **34–39 MB**, 20 chunk terrain đang hiển thị. Đây là mẫu đo ngắn trên AMD Radeon, chưa xác nhận Intel HD/UHD hoặc điện thoại vật lý. Không dùng kết quả này để khẳng định mọi thiết bị đạt 60 FPS.

Ảnh kiểm tra và báo cáo JSON được tạo tại `temp/release-qa/` khi chạy `npm run test:web`; thư mục sinh tự động không đưa vào Git. Hướng dẫn chạy ở [PLAYABLE-VILLAGE.md](PLAYABLE-VILLAGE.md) và README root.

Scene và các `.meta` có sẵn được giữ nguyên trong đợt mở rộng này; asset mới được Cocos CLI import thật. Công cụ điều khiển giao diện Windows không khởi tạo được trong môi trường hiện tại, nên thao tác GUI Editor chưa được kiểm tra tự động. Không có điện thoại kết nối ADB để nghiệm thu phần cứng. Không commit hoặc push các thay đổi mới.
# NPC chuyển động — 11/10/2026

- Tám NPC có chuyển động nghỉ nhẹ và phản ứng chào 1,4 giây khi người chơi tới gần; chỉ biến đổi sprite, giữ điểm nhiệm vụ/collision/tên. NPC ngoài khung nhìn bỏ qua cập nhật animation. Chưa có sprite sheet cử chỉ riêng hoặc đi tuần.
- `check:client`, `test:client` (49 nhóm + 3 network tests), build Cocos `npc-motion` và `test:reference` tại cổng 8083 đạt. Browser kiểm tra chào/kết thúc và điểm đứng NPC không đổi, rồi chạy lại luồng HUD/joystick/map/journal.
- Build trong sandbox thất bại do cache/GPU Creator; chạy ngoài sandbox đạt. Chưa kiểm tra thiết bị thật.

## Sửa ruộng và mục tiêu trồng — 11/10/2026

Năm ô trồng dùng tọa độ ruộng phải thay cho ruộng cũ, client/server cùng import `plantingPlots`; save theo chỉ số ô không đổi. Lúa chín có kích thước lớn hơn, hiển thị ở Low, chừa ô nhiệm vụ. Thêm nền đất/rạ baked và tăng kích thước cây non.

Typecheck, 49 nhóm client + 3 network tests, build server/Cocos `rice-location-fix`, và 5 server tests đạt. `test:m2` đạt toàn bộ desktop/mobile giả lập, năm ô trồng, đếm/nhận sao, reload/replay, legacy/future/corrupt save; không lỗi browser. Ảnh ruộng được kiểm tra trực tiếp. Mẫu AMD trong lượt này khoảng 34 FPS, p95 50 ms, 187 draw calls, JS heap 59,56 MB; chưa nghiệm thu hiệu năng thiết bị thật. Khi triển khai phải cập nhật client và server cùng phiên bản.

`test:visual` chạy tuần tự đạt cả 1280×720, 960×540, 390×844, 844×390 và 320×568: HUD/vùng chạm, Low/High, reload, tương tác và dispose; không lỗi browser. Mẫu ngắn khoảng 55–60 FPS trên máy AMD, không đại diện điện thoại vật lý. Lượt chạy đồng thời trước đó bị dừng rồi chạy lại tuần tự.

## Trâu ngoài khu trồng, thay sprite mạ — 11/10/2026

Trâu thu về 100×78 ở bờ (31,23); biển ruộng (34,24). Regression xác nhận sprite trâu không giao bounding box năm ô trồng và đường đi vẫn tới được từng ô. Thay PNG mạ bằng built-in imagegen: nhiều lá dài cong, không rễ/cục đất/củ lộ thiên; alpha trim, giữ UUID. Manifest xuất lại.

### Thiết kế bảng nhiệm vụ chương

Tên chương cố định thay cho thông báo hoàn thành; dòng NPC/tiến độ, thẻ nhiệm vụ có số/✓, mô tả trạng thái, màu xanh cho việc mở và màu trung tính cho việc chưa mở. Footer Nghe hướng dẫn/Về làng đối xứng. Giữ quest IDs, phần thưởng và điều kiện mở.

Typecheck và build Cocos `chapter-mission-layout` đạt. Browser QA riêng tại `temp/check-chapter-layout.cjs` dùng state fixture rồi click/touch thật ở 1280×720, 390×844, 844×390: bố cục/tiến độ, nhiệm vụ khóa giữ nguyên màn, nhiệm vụ mở vào Đi Chợ Quê đạt, pageerrors rỗng. Đã xem ảnh desktop/mobile trong `temp/chapter-layout-qa`. Preview 8085 cập nhật; chưa staging.

### Chương 2 dễ tiếp cận hơn

Thay nhiệm vụ bắt buộc Ô ăn quan bằng Ghép đèn cùng Tí và Na (`mg.star-lantern`): năm cặp cùng số, bấm/kéo thả, không timer/đấu điểm. Giữ quest ID và completion; restore loại checkpoint game cũ không khớp game hiện tại. Ô ăn quan giữ trong luyện tùy chọn. Khi mở nhiệm vụ mới xóa thông báo hoàn thành bài trước.

Typecheck, 50 nhóm client + 3 network tests, build server/API và Web Cocos đạt. Browser campaign qua đủ tám chương, xác nhận Chương 2 dùng ghép đèn, mở nhiệm vụ sau, sao/reload/practice/reset failure đều đạt; errors rỗng. Browser harness cập nhật đường vào phụ huynh qua HUD Settings hiện hành. Bản cuối `easy-chapter-two-final` cập nhật preview 8085; dữ liệu theo origin giữ nguyên, chưa triển khai staging. Client/server cần cùng phiên bản.

### Năm ô trồng nhìn rõ và bấm được

Giãn ô thành (26,18), (28,18), (30,18), (28,20), (32,17); hiển thị số 1–5/dấu ✓. Loại lúa/hoa/cỏ trang trí khi bounding box hình phủ vùng ô trồng; regression kiểm tra thêm hàng rào, trâu và khoảng cách giữa các ô. Giữ tiến độ theo index. Đã xem `five-empty-plots.png`: đủ năm số, ô 5 tránh hàng rào.

Typecheck, client 49 nhóm + 3 network tests, build server/Cocos `five-visible-plots-v2` đạt. `test:m2` bản cuối đạt desktop/mobile, click đủ năm cây, lưu/reload sau bốn cây rồi trồng cây cuối, đếm/nhận sao/replay và legacy/future/corrupt save; errors rỗng. Mẫu AMD 60,13 FPS/p95 16,7 ms, không thay thế thiết bị thật. Bản cuối được sao chép vào preview 8085 để giữ origin và dữ liệu người chơi; staging chưa cập nhật.

Strict typecheck, 49 nhóm client + 3 network tests, build server và Cocos `rice-buffalo-fix` đạt. `test:m2` desktop/mobile giả lập đạt đủ trồng/đếm/sao, reload/replay và legacy/future/corrupt save; browser errors rỗng. Đã xem trực tiếp ảnh trồng trong cảnh: trâu đứng ngoài ruộng, mạ không có gốc củ. Mẫu AMD khoảng 60,17 FPS, p95 16,8 ms, 188 draw calls; chưa nghiệm thu thiết bị thật. Preview cổng 8085; chưa triển khai staging.

### Hoàn thiện local: khám phá, ngày hội và tiếp tục ván luyện — 11/10/2026

Build Cocos `backlog-complete-v1` thêm minimap tám NPC/bạn trong phòng, kéo camera chuột/touch, sáu điểm khám phá có Nghe và sổ lưu, checkpoint từng trò luyện, hai hoạt động ngày hội theo mùa và huy hiệu mùa/năm. Checkpoint luyện/sổ khám phá hiện lưu local; lịch mùa không phải lịch âm. Preview 8085 đã cập nhật cùng build, giữ origin; HTTP 200. Chưa triển khai staging.

Strict typecheck, 53 nhóm client + 3 network tests, build client/server/API/admin đạt. Browser `test:backlog` xác nhận resume sau reload, xóa checkpoint khi kết thúc, không tăng sao truyện, huy hiệu sau hai hoạt động, đủ sáu khám phá, hủy ý định bằng phím, minimap bạn/chặn bạn và pan desktop/mobile; errors rỗng. Ảnh ở `temp/backlog-qa` đã kiểm tra bố cục.

Hồi quy `test:m2`, `test:campaign` đủ tám chương, `test:visual` năm viewport, `test:reference`, `test:zoom`, `test:drag`, `test:assets`, `test:stack`, avatar và đọc hướng dẫn đều đạt. Harness sửa các giả định cũ: đường vào phụ huynh qua HUD, scale 0.78, tương tác cảnh vật gần nhất và checkpoint luyện có thay đổi save. Browser desktop/mobile là giả lập; đọc hướng dẫn dùng speech adapter, chưa xác nhận âm thanh giọng OS. Mẫu máy phát triển khoảng 60 FPS/p95 16.8–16.9 ms, không thay thế Intel/mobile thật.

MySQL Laragon local chạy trở lại; `test:mysql` đạt 5/5 trên database test riêng. Server có bài kiểm tra mới `cooperative-games.test.ts`: bốn tài khoản/vé thật × 11 trò truyện × ba nhóm tuổi (33 kịch bản), ngắt/kết nối lại người thứ tư giữa mỗi ván, cả bốn nhận đúng receipt/completion; đạt trong khoảng 83 giây. Suite server trước đó đạt 6 tests và tải 10/16/20 client. Bài matrix dùng API/SQLite in-memory riêng và signed sockets thật, không thay đổi tiến độ người dùng.

Còn cần nghiệm thu với trẻ/thiết bị thật, soak WAN và biên tập nội dung/art. NPC đi tuần, sprite cử chỉ riêng, art mini game chuyên biệt và chuỗi lễ âm lịch vẫn là phần mở rộng, không ghi nhận đã hoàn thành.
### Chăm góc làng và góc vẽ tự do — 11/10/2026

Build Cocos `village-creative-v1` thêm năm hoạt động ở trâu/gà/vịt/mèo/vườn rau. Đi tới góc khám phá rồi chọn Chăm; ba bước có gợi ý khi sai, checkpoint và Chăm lại. Dùng art sẵn của đúng cảnh vật trong khung chơi. Đây là mô phỏng giáo dục ba bước, không phải hệ thống đói/khát theo thời gian.

Góc vẽ mở ngay từ menu hoặc màn hoạt động: sáu màu, nét chuột/touch và chấm màu, lùi nét, xác nhận Trang mới, phục hồi trang vừa xóa bằng Lùi nét và tự lưu theo hồ sơ local. Giới hạn 64 nét × 128 điểm, loại dữ liệu ngoài canvas/màu không hợp lệ/quá dài khi restore. Modal giữ một pointer để ngón thứ hai không thay nét hoặc chạm nhầm nút. Tranh và chăm góc làng được giữ khi server cập nhật tiến độ; chưa đồng bộ giữa thiết bị hoặc xuất PNG.

Màn luyện dùng năm trò/trang và một thẻ Vẽ tự do đủ lớn; đủ 12 trò qua ba trang, Ô ăn quan chuyển về cuối. Không thay game bắt buộc, quest ID hoặc receipt truyện.

Strict typecheck, 54 nhóm client + 3 network tests, build server/API và Cocos đạt. `test:creative` bản cuối đạt desktop 1280×720 và mobile giả lập 390×844: hai lối vào vẽ, chọn màu/nét/chấm, undo, cancel/blur, ngón thứ hai không thay nét, reload, xác nhận xóa/phục hồi, năm góc chăm đi tới được, chọn sai không tiến bước, lưu bước giữa chừng, hoàn thành/chơi lại và đủ 12 thẻ trò trên ba trang. Sao/completion truyện giữ nguyên; pageerrors rỗng. Đã xem ảnh `temp/creative-qa` desktop/mobile và màn hoạt động.

Harness đa chạm dùng `touchMove` với danh sách ngón còn giữ để nhấc riêng ngón thứ hai; `touchEnd` có ngón còn giữ tạo kết thúc sai nên đã sửa. Thử giọng OS, trẻ/điện thoại thật và WAN vẫn cần nghiệm thu riêng; chưa staging.

Hồi quy bản cuối `test:backlog` và `test:drag` đạt: checkpoint/reload, huy hiệu mùa, khám phá, minimap/chặn bạn, pan desktop/mobile và kéo đèn/cancel/click thay thế; errors rỗng. Đã sao chép build cuối vào cả preview 8085 và thư mục game của stack local 38080, HTTP 200, giữ origin. Staging chưa cập nhật.

### NPC đi tuần, tiếp cận đúng chỗ và collision theo vị trí — 11/10/2026

Sáu NPC chương 2–7 có tuyến ngắn quanh spawn hợp lệ, dừng khi bất kỳ bé/bạn trong phòng ở gần 80 world pixels. Cô Tấm đi một đoạn ngắn cạnh ruộng; tuyến tránh năm ô trồng và các spawn chuyển khu. Bấm NPC/bóng thoại dùng vị trí hiện tại và cập nhật đường khi NPC đi; khám phá giữ ý định/tìm đường lại nếu route bị ngắt. Ông Đồ và Bác Nông Dân giữ nguyên tọa độ Chương 1.

`NpcPatrol` dùng chung luật solo/server; room phát sáu trạng thái NPC bằng schema (x/y/hướng/đi), client theo vị trí server và minimap theo node thực. Map collision lấy ô của vị trí NPC hiện tại; ô cũ và đoạn đường trống đi qua được. Lúa chín giữ mật độ; vật trang trí che NPC mờ tạm thời giống khi che bé. Sprite sẵn được đổi hướng nhìn/nhún/nghiêng bằng code, chưa có sheet đi/cử chỉ theo từng hướng.

Strict typecheck, 55 nhóm client + 3 network tests và build Cocos `npc-patrol-v1` đạt. Unit kiểm tra tuyến không chồng nhau/không vào plot/portal, đủ sáu NPC thực sự di chuyển, dừng gần người, nằm trong tuyến, thời gian không hợp lệ và collision ô hiện tại/ô cũ. Server suite cuối đạt 6 tests, gồm bốn người × 11 trò × ba nhóm tuổi với reconnect (33 kịch bản), room đồng bộ NPC và tải 10/16/20 client; p95 RTT local khoảng 5.9–17.8 ms. Build server/API đạt.

Browser `test:npc` đạt sáu cuộc tiếp cận bằng click tại vị trí đang đi, dừng gần bé, hủy bằng phím, giữ anchor Chương 1, mobile touch, hai browser dùng tài khoản/vé phòng riêng thật, trò chuyện online và về solo/rời NPC thì đi tiếp. API/SQLite test riêng dùng cổng 26601–26602, không dùng DB người chơi. `test:reference` đạt bóng thoại/nameplate, gesture và journal. Đã xem ảnh `temp/npc-patrol-qa`.

`test:m2` đạt desktop/mobile, đủ năm cây, partial reload/count/replay và legacy/future/corrupt save. `test:visual` đạt năm viewport, rice density, fade, HUD/control, quality reload/dispose; errors rỗng. Mẫu AMD của visual khoảng 59–60 FPS/p95 16.8–16.9 ms. Các mẫu khi nhiều browser/build chạy đồng thời thấp hơn, không thay thế máy/điện thoại thật. `test:creative`/`test:backlog` đạt chăm/vẽ, lưu ván, sáu khám phá (bao gồm fixture ngắt route rồi đi tiếp), minimap và camera. `test:stack` đạt xác thực/phòng riêng/MySQL/server progress/portal/home/offline; errors rỗng.

Khoảng trống quanh tuyến ban đầu làm ruộng quá thưa nên đã sửa thành fade theo vị trí NPC, giữ kiểm tra mật độ lúa. Test fallback ban đầu chờ NPC đi ngay khi bé còn đứng gần, được sửa bằng thao tác cho bé rời đi trước. Đây là lỗi kỳ vọng QA; dừng khi bé gần là hành vi chủ đích.

Hash nội dung đổi (rules 5 và tuyến NPC). Stack local đã khởi động lại với client/game server/API cùng phiên bản, game 38080 và phụ huynh 35173. Preview 8085 cập nhật cùng build, HTTP 200 cả hai origin; dữ liệu theo origin giữ nguyên. Chưa cập nhật staging. Các gate nội dung/art, thử trẻ, thiết bị thật và WAN vẫn còn.
### Sổ Tết/Trung thu quanh năm — 11/10/2026

Build `traditional-festivals-v1` bổ sung hai chuỗi đọc/nghe → câu hỏi có gợi ý → ghép bánh chưng/đèn ông sao. Mở từ menu hoặc bộ sưu tập, lưu bước theo hồ sơ local, tiếp tục ván sau đóng/reload và giữ dấu hoàn thành khi chơi lại. Không tăng sao truyện. Minh họa Graphics tự vẽ; nguồn văn hóa và giới hạn ghi trong `docs/design/TRADITIONAL_FESTIVALS.md`. Chưa có lịch âm runtime hoặc đồng bộ tiến độ ngày lễ giữa thiết bị.

Strict client typecheck, 56 nhóm client + 3 network tests, build server/API và Cocos đạt. `test:holidays` đạt desktop/mobile: sai đáp án không qua bước, đúng mở trò tương ứng, pause/reload tiếp tục ván, hoàn thành cả hai, checkpoint kết thúc bị xóa và sao/receipt truyện không đổi; page errors rỗng. Đã xem ảnh mobile Tết và desktop bộ sưu tập trong `temp/holidays-qa`, bố cục không chồng lấn. `test:backlog` hồi quy checkpoint luyện, huy hiệu mùa, sáu điểm khám phá, minimap và camera đạt.

Đã cập nhật preview 8085 và game local 38080 cùng build; HTTP 200 cả hai, giữ origin. Đợt sổ ngày lễ không đổi protocol/hash so với bản NPC; chưa cập nhật staging. Các gate art, biên tập, trẻ/thiết bị thật và WAN vẫn còn.

Hồi quy cuối test:campaign đạt đủ tám chương và 11 board khác nhau; luyện không đổi truyện, reset thất bại do quota giữ dữ liệu, reload giữ tám sao; errors rỗng.

### Xuất tranh PNG — 11/10/2026

Build `painting-export-v1` thêm Lưu ảnh tại góc vẽ. Canvas riêng xuất PNG 1080 × 500 chỉ chứa nền giấy và nét đã lưu, không chứa HUD hay hồ sơ; màu, độ dày và trục Y khớp bản vẽ. Không thay đổi save hay protocol. Nếu trình duyệt không hỗ trợ, hiển thị thông báo và giữ tranh.

Strict typecheck, 56 nhóm client + 3 network tests và build Cocos đạt. Browser creative đạt desktop/mobile với tải file thật, tên/PNG signature/kích thước, pixel xanh tại vị trí nét, dữ liệu tranh không đổi; hồi quy cancel/dot/undo/reload/clear/recovery và năm hoạt động chăm đạt, không tăng sao truyện. Xem ảnh trong `temp/creative-qa`; ảnh xuất là `drawing-desktop.png` và `drawing-mobile.png`. Preview 8085 và game local 38080 đã cập nhật, chưa staging. Lịch âm tự động, art/animation riêng và nghiệm thu thiết bị/người vẫn còn.
### Hoàn thiện đồng bộ, lịch lễ, art trò chơi và NPC — 11/10/2026

Build `completion-v1`, contentVersion `e48dccf3` (rules 6). Hoạt động có snapshot riêng qua vé hồ sơ: tranh, chăm, khám phá, ngày lễ, huy hiệu mùa và checkpoint luyện. Không dùng snapshot này để cấp sao/quest truyện. Giữ dirty khi offline/lỗi, xác nhận ID tránh áp bản lưu cũ lên thay đổi mới, thử lại và khôi phục trên thiết bị khác; snapshot tranh/checkpoint tải lên cuối thắng, không đồng biên tập. Save cũ có hoạt động chưa sync được giữ để tải lên.

Calendar dùng ngày Tết/Trung thu đã đối chiếu cho 2026–2028, qua mốc 00:00 UTC+7, Tết ba ngày trong game/Trung thu một ngày, không khóa bài học ngoài lễ. Đây là bảng lịch lễ có phạm vi xác minh, chưa bộ chuyển đổi âm/dương tổng quát. Nguồn ghi trong TRADITIONAL_FESTIVALS.md. Tranh gà–hoa original Canvas được cắt thật thành tám mảnh cho board trượt; ao có sóng/sen/sậy/vây/mắt. Không tái tạo tranh lịch sử được bảo hộ.

Atlas NPC mới RGBA 768 × 2048 có 24 tư thế đi/chào của tám NPC; idle dùng art gốc, mirror trái/phải. Xem NPC_POSES.md. Ảnh tạo bằng imagegen rồi bỏ nền bằng imagegen; kiểm tra alpha thật, sửa ranh crop y1040 tránh cắt chân và dùng crop chung mỗi hàng. Dự phòng art gốc khi tải lỗi; giải phóng khung với VillageArt.

Strict client typecheck, 58 nhóm client + 3 network tests, build Cocos/API/server/admin đạt. API suite 4 tests đạt, MySQL test riêng có điều kiện bị skip khi không truyền DB test. Server 7 tests đạt, gồm đồng bộ hai client cùng hồ sơ, từ chối chữ ký thiếu, không cấp sao giả, 33 kịch bản bốn người × 11 trò × ba nhóm tuổi có reconnect và tải phòng 10/16/20 người (p95 RTT local khoảng 2.5–3.4 ms).

Browser activity-sync đạt với Cocos thật desktop/mobile: nhận tranh/bước ngày lễ/checkpoint, xóa trên máy khác, tải lại máy trước nhận xóa và vẽ offline rồi gửi lên sau reconnect. Browser NPC đạt sáu cuộc tiếp cận, atlas 8 × 3 khung căn chung, Bác Nông Dân chào thật, pause gần bé, anchors Chương 1, mobile, hai client và fallback offline. Kiểm thử fallback chọn hướng có đường trống ra xa NPC thay cho cố định phím phải; điều hướng chỉ đổi fragment được sửa thành reload thật trong harness sync.

Campaign đạt tám chương/11 board, luyện không đổi truyện, reset thất bại giữ save; holidays đạt hai chuỗi desktop/mobile. Creative đạt tải PNG thật, màu/kích thước/save, vẽ/chăm/replay và calendar đạt midnight/đổi năm/range/fallback. Visual đạt năm viewport, HUD/collision/fade/quality/dispose, errors rỗng. Mẫu FPS local khoảng 55.6–60.2, p95 16.8–33.3 ms khi có browser kiểm thử khác chạy; không thay thiết bị thật. Đã xem ảnh chào NPC, board ghép tranh và tranh xuất.

Preview 8085 cập nhật; stack local đã restart với Web/API/game server cùng e48dccf3, health MySQL và HTTP 200 tại 8085/38080. Gói staging chuẩn bị bằng tools/prepare-release.py, không kèm secret/cache; scripts update/activate giữ DB/secret và có rollback app khi health sai. Các gate biên tập văn hóa/art, thử trẻ, Android/iOS/Intel thật và soak WAN vẫn chưa được nghiệm thu.
Gói completion đã sẵn sàng nhưng SSH tới staging trả về `Permission denied (publickey,password)` khi kiểm tra xác thực bằng khóa hiện có. Chưa upload/activate bản mới. Cần phiên SSH đã xác thực; không cần xin lại quyền triển khai. Stack MySQL cuối `test:stack` đạt parentFlow/signedRoom/serverProgress, portal/home/offline và ba mức quality, errors rỗng; p95 frame local khoảng 16.8–17.0 ms.

### Deploy completion lên VPS — 11/10/2026

Đã triển khai commit `0b4a42e`, contentVersion `e48dccf3` lên `https://ltt.vui-hoc.xyz`. Archive SHA-256 khớp, build backend/rooms trên Linux đạt; backup/restore drill MySQL khớp state. Hai services active, giữ release trước để rollback và không thay DB/secret.

Kiểm tra lại local: strict client, client unit/network, 7 server tests và 4 API tests đạt; MySQL unit có điều kiện skip. Build API/server/admin đạt. Live API/admin/catalog và kiểm soát truy cập đạt. Browser parent UI, signed WebSocket hai client, avatar/hair/emote, lưu tiến trình/reload và offline fallback đạt. Tranh vẽ desktop lưu trên server và tải lại ở browser mobile cùng hồ sơ trong phòng riêng khác; errors rỗng. Harness staging được cập nhật sang HUD settings/parent và actor scale 0.78 theo giao diện hiện tại. Các gate trẻ/thiết bị thật/soak WAN vẫn còn.

### Art NPC tám hướng, cảnh và 12 bảng mini game — 11/10/2026

Build `art-polish-v1` có atlas NPC 64 khung tám góc quay thật, đã làm sạch alpha và căn chân bằng script theo cho phép của người dùng. Khung chào cũ/fallback giữ nguyên; chu kỳ bước chân vẫn bằng code. Nền ruộng liền, bờ ao có lau/đá và đường có vệt/ven cỏ được bake một lần. 12 bảng mini game có chi tiết theo trò và phản hồi state; thanh nhịp đặt dưới hình người nhảy. Chi tiết [ART_POLISH_PASS](../../docs/design/ART_POLISH_PASS.md).

Strict client, 58 nhóm unit + 3 network tests và Cocos build đạt. Browser art kiểm tra tám NPC × tám hướng không mirror, đủ 12 bảng desktop/Android giả lập, labels không tăng theo animation và receipts truyện giữ nguyên. NPC suite đạt tiếp cận sáu NPC, pause gần bé, anchor Chương 1, mobile, hai client online và fallback solo. Campaign đạt tám chương, 11 board cốt truyện, reset lỗi giữ tiến trình và luyện không đổi sao; errors rỗng. Visual đạt năm viewport, quality/reload, collision/fade/HUD/dispose; mẫu local khoảng 60 FPS/p95 16.8–17 ms, không thay thiết bị thật. Art vẫn cần người làm hình ảnh duyệt.

Deploy live đợt art ngày 11/10/2026: commit `9b48e24`, release `9b48e24-art-e48dccf3-20261011`. SHA-256 delta khớp, build Linux/Nginx/backup-restore đạt. API/admin/quyền truy cập, phòng riêng hai client, save/reload online/offline và bộ art tám hướng/12 bảng desktop-mobile qua HTTPS đạt; errors rỗng. Giữ bản completion để rollback, không thay DB/secret.

### Lịch âm runtime và backup/restore định kỳ — 11/10/2026

Commit 3d986c8, build lunar-ops-v1 đã deploy cùng contentVersion e48dccf3. Đã sửa biên đầu năm 1900, tích hợp lịch Tết/Trung thu tính UTC+7 thay giới hạn bảng 2026–2028. Đối chiếu 448 mốc 1976–2199 với bảng Hồ Ngọc Đức không khác biệt; test:lunar đạt 30 fixtures độc lập, tháng nhuận và 109.573 ngày đổi hai chiều. Strict client/58 nhóm unit + 3 network tests đạt, browser calendar và hai chuỗi holiday desktop/mobile đạt; không cấp thêm sao truyện.

VPS có backup ngày 02:00 và restore drill Chủ nhật 02:30, giờ Việt Nam; timers enabled, jobs Result=success. Năm test chính sách/checksum/cleanup đạt local/Linux. Restore vào DB tạm so snapshot từ dump, không so DB live; chạy cùng lúc QA thay đổi tài khoản vẫn đạt. Retention chỉ áp dụng dump tự động, giữ 30 ngày/tối thiểu bảy bản/bản verify gần nhất; mode directory 0700, SQL/JSON 0600.

Live calendar, API/admin/quyền truy cập và WebSocket hai client/save/reload online/offline đạt, errors rỗng. Cocos splash vẫn tắt. Gate trẻ/thiết bị thật, duyệt art/nội dung, offsite/báo lỗi chủ động và soak WAN dài vẫn còn.

### Chạm trực tiếp bảng mini game — 12/10/2026

Commit `148149b`, build `board-touch-v1`, release `148149b-board-touch-e48dccf3-20261012` đã triển khai HTTPS. Trồng/tưới lúa, chọn rau ở chợ, kéo co và nhảy sạp nhận chạm trên minh họa qua cùng xử lý với nút. Phòng online gửi action về server trước khi có kết quả; luật, checkpoint và contentVersion giữ nguyên.

Strict client, 58 nhóm unit + 3 network tests, Cocos build và campaign tám chương đạt. Art browser local/live kiểm tra 12 bảng desktop/mobile, thao tác chuột/touch thật qua Playwright, trồng năm ô, tưới/chạm lặp không đổi ô khác, chọn rau và forwarding rhythm không tự tăng hits. Receipts không đổi, pooled labels ổn định, errors rỗng. Live API/admin/quyền truy cập và phòng riêng hai client/save/reload online/offline đạt. Hai services và hai backup timers active; release lunar-ops trước được giữ để rollback. Mobile là browser giả lập, chưa nghiệm thu thiết bị thật; chu kỳ bước đi NPC nhiều khung mỗi hướng vẫn còn.

### Soak WAN ngắn và sửa request xóa phụ huynh — 12/10/2026

Soak 300 giây qua HTTPS/WebSocket tới staging: bốn client, 1.144 probe nhận đủ, p95 228 ms/max 532 ms, bốn reconnect giữ session ID trong 2.568–2.683 ms gồm một giây mô phỏng ngắt. Roster/NPC, intro và hoạt động luyện lúa giữ nguyên, đọc lại MySQL đạt, không correction/warning/error. Tài khoản QA đã xóa. Chi tiết và giới hạn tại [WAN_SOAK_QA](../../docs/WAN_SOAK_QA.md); chưa thay nghiệm thu nhiều giờ hoặc thiết bị thật.

Commit `f5b6721` sửa Content-Type dư cho request không có body; build admin production và browser local trên database fixture đạt. Đã deploy release `f5b6721-parent-wan-e48dccf3-20261012`, giữ release board-touch để rollback. Live UI kiểm tra hủy/xác nhận xóa hồ sơ, đăng xuất và vô hiệu session, hủy/xác nhận xóa tài khoản, đăng nhập tài khoản đã xóa bị từ chối, DELETE không gửi JSON header dư; errors rỗng và QA account được dọn. Live API/admin/quyền truy cập đạt, contentVersion giữ `e48dccf3`. Không tạo lại game build vì không đổi client game. Backup offsite/kênh báo lỗi để sau theo lựa chọn người dùng.
