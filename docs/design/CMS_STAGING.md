# CMS — luồng nội dung staging

## Nhân vật bé trai áo đỏ sao vàng — 15/10/2026

Release hiện tại `red-star-boy-d92c670c-20261015`, build `web-desktop`, contentVersion `d92c670c`. Bé trai nhóm 6–8 tuổi chọn avatar 0 có hình vẽ theo ảnh tham khảo và concept `docs/design/characters/boy-6-8-red-star-concept-v1.png`. Atlas `apps/game-client/web/characters/boy-red-star-6-8-v1.png` gồm tám hướng, một hàng đứng và hai hàng bước đi. Cắt hàng theo các rãnh thực tế, chuẩn hóa khung 96×128 và đặt chân cùng đường chuẩn; dùng chung trong làng, HUD và xem trước. Màn hồ sơ ghi “Áo đỏ sao vàng”. Giữ avatar ID cũ, không đổi cấu trúc dữ liệu. Hình painted dùng tóc/màu da mặc định; tùy chỉnh tóc hoặc da dùng fallback vẽ với áo đỏ sao vàng. Nhóm tuổi và avatar khác giữ hình hiện có.

Overlay 15 file, SHA-256 `f4122498242f76f74ed8be75e359514d75e994e9b12be04db3bc4a2786d2759b`; checksum source/Web khớp. Backup `/opt/lang-tri-thuc/backups/database-20261014T184047Z.sql` đã phục hồi thử đạt. Giữ release `level100-students-d92c670c-20261015` để rollback. Hai API health MySQL đạt; CMS manifest và nội dung không thay đổi. QA local TypeScript, client logic/lifecycle và Cocos desktop/mobile đạt; kiểm 24 frame, hình xem trước, tên HUD và phân biệt tuổi/avatar, không có page error. Artifact local `apps/game-client/temp/red-star-qa/`.

## Triển khai VPS — 15/10/2026

Release `/opt/lang-tri-thuc/releases/level100-students-d92c670c-20261015`, build `web-desktop`, contentVersion `d92c670c`, game https://ltt.vui-hoc.xyz/game/. Source working tree được đóng gói đầy đủ; 43 file khác release trước được tải bằng overlay sau khi đối chiếu SHA-256 từng file. Overlay SHA-256 `769465ccf15c78da1f29ffe832a4340a0b17fb676352fa29f8b675248fe81420`. `package-lock.json` được npm prune cập nhật trên Linux.

Backup `/opt/lang-tri-thuc/backups/database-20261014T181651Z.sql` đã phục hồi thử và khớp dữ liệu. Giữ release `schoolyard-mobile-e5d974a-20261014` để rollback ứng dụng. Hai API và hai rooms active; cả hai API health MySQL/version đạt. CMS được nâng compatibility sang bản mới, NPC không thay đổi; manifest mới `9526d4b358c398958d5b83d7beb1a45fe8ad475c3eb6e3b5caf15ce3e060c1f4`.

QA HTTPS quản trị/CMS, chặn API nội bộ và phòng không vé đạt. QA signed WebSocket đạt tên/tuổi/nhân vật, câu trả lời hành trình do server xác nhận và đọc lại tiến độ MySQL. Tài khoản QA đã xóa. Thông tin mật khẩu QA local là JSON string có dấu nháy; cần giải mã trước khi đăng nhập.

Đợt 13/10/2026 triển khai luồng ưu tiên người dùng đã chọn: **asset có sẵn → NPC mới → đặt trên bản đồ → hội thoại / nhiệm vụ liên kết → kiểm duyệt → xuất bản staging → Cocos**. Đây là lớp NPC bổ sung; các phân hệ nâng cao trong master prompt tiếp tục theo giai đoạn, không được coi là đã hoàn thành toàn bộ.

Bản sửa va chạm/bố trí ngày 13/10/2026 chuyển navigation sang `818a32e3`; snapshot staging hiện tại `500f4374bb2c…` giữ nguyên NPC/hội thoại từ `578f129d038e…`, có baseVersion mới. Migration chỉ áp dụng bản đã xuất bản hợp lệ từ `785f4e7e`, giữ lịch sử và bản nháp; chi tiết tại [LANDMARK_FIXES](LANDMARK_FIXES.md). Tải lại game sau cập nhật và làm mới workspace CMS nếu đang mở revision cũ.

## Sử dụng

Release hiện tại ngày 14/10/2026: `schoolyard-mobile-e5d974a-20261014`, build `schoolyard-mobile-v3`, contentVersion `818a32e3`. Sân đất dùng asset RGBA `assets/resources/village/schoolyard-v2/dirt-pitch.png` tại (45,33), khung thành gỗ/lưới và bóng nằm trong hình; prompt lưu tại `docs/design/schoolyard-v2.prompt.txt`. Cờ dùng atlas 8 khung `vietnam-flag-atlas.png`, master SVG tại `docs/design/vietnam-flag-atlas.svg`, công cụ dựng `tools/render-school-flag.cjs`. Điện thoại dọc hiện thông báo xoay ngang và khóa điều khiển; ngang dùng toàn bộ viewport, camera giảm khoảng chừa dưới cho màn thấp. Nút toàn màn hình cần thao tác người dùng và hỗ trợ của trình duyệt; PWA khai báo landscape/fullscreen, trình duyệt thiếu API dùng viewport và hướng dẫn mở app đã cài. Kiểm tra Chromium giả lập mobile xác nhận texture, animation, portrait/landscape, fullscreen, khóa di chuyển; PWA desktop/mobile chạy offline. Chưa kiểm tra thiết bị Android/iPhone thật. Snapshot CMS giữ nguyên. Bản trước `schoolyard-e5d974a-20261014` giữ để rollback. Các release bên dưới là lịch sử.

Release hiện tại ngày 14/10/2026: `schoolyard-e5d974a-20261014`, build `schoolyard-v1`. Thêm sân bóng đất ở cạnh sân trường (45,31), vạch phấn, hai khung thành gỗ/lưới và bóng kiểu cũ; mặt sân vẽ dưới actor để không che nhân vật. Cột cờ tại (42,32), lá cờ đỏ/sao vàng năm cánh, tỷ lệ 3:2, gợn vải và sao dùng cùng phép biến dạng, cập nhật tối đa 20 Hz. Bảng nhiệm vụ tránh che sân/cờ khi đứng gần, theo cơ chế tránh che hiện có. Đồ họa native, không thêm tải texture; không đổi navigation, nhiệm vụ hay phần thưởng. Bản trước `pwa-brand-e5d974a-20261014` giữ để rollback. Các release bên dưới là lịch sử.

QA local/HTTPS desktop 1920×925 và mobile giả lập 390×844 đạt: đủ mặt sân/hai khung thành, thứ tự ground dưới actor, cờ tỷ lệ 3:2 và clock chuyển động tăng, tracker không che trên mobile, không có page error. TypeScript đạt; health MySQL/contentVersion `818a32e3` và snapshot CMS không đổi. Ảnh/report ở `apps/game-client/temp/schoolyard-live/` (gitignore).

Release hiện tại ngày 14/10/2026: `pwa-brand-e5d974a-20261014`, build `pwa-brand-v1`. Logo vector cây đa mọc từ sách, màu xanh/vàng, ở `apps/game-client/web/brand/logo.svg`; export favicon ICO/SVG, icon 192/512, maskable 512 và Apple touch 180. Build tự thêm manifest `standalone` với scope/start URL `/game/`, nút cài khi trình duyệt cung cấp `beforeinstallprompt`, và splash DOM có logo/tiến độ trước khi engine khởi động. Phần trăm theo các bước khởi tạo đã hoàn thành, không phải phần trăm byte tải; chỉ 100% khi `assetsReady`. Lỗi có nút thử lại.

Service worker dùng cache riêng theo hash bản build, network-first với fallback offline cho HTML/asset game; không cache API, URL có query/vé preview, request Authorization, và không đăng ký trong iframe CMS. Worker mới đợi phiên cũ đóng, không thay nội dung giữa lượt chơi. Game offline cần đã tải đủ trong phiên có worker; chơi cùng mạng và đồng bộ server vẫn cần kết nối. Không phát hành APK/IPA trong đợt này.

QA local và HTTPS desktop 1920×925/mobile giả lập 390×844 đạt: Chrome đọc manifest không lỗi; splash tăng đơn điệu 8→100%, đóng khi sẵn sàng; worker đúng scope; tải lại offline sau warm cache vào game thành công, không có page error. TypeScript và 70 nhóm logic/lifecycle/loading đạt. Chạy `GAME_WEB_URL=… npm run test:pwa`; ảnh ở `apps/game-client/temp/pwa-qa/` (gitignore). Backup/restore drill và health MySQL đạt; contentVersion `818a32e3` và snapshot CMS giữ nguyên. Bản trước `village-signs-e5d974a-20261014` giữ để rollback. Ctrl+F5 để nhận bản mới; khi PWA cập nhật sau này, đóng các tab/app cũ rồi mở lại để worker mới kích hoạt. Các release bên dưới là lịch sử.

Release hiện tại ngày 14/10/2026: `village-signs-e5d974a-20261014`, build `village-signs-v1`. Biển Cây Đa Tri Thức giữ hai dòng trong mặt gỗ; ba biển Vườn bốn mùa, Bến sông quê, Sân trường tuổi thơ dùng cùng asset gỗ và màu chữ với các vùng cũ, dùng chung hàm bố trí nhãn. QA local/HTTPS desktop 1920×925 và mobile giả lập 390×844 đạt bốn biển, không có page error. Báo cáo/ảnh ở `apps/game-client/temp/village-signs-live/` (gitignore). Health MySQL, contentVersion `818a32e3`, snapshot CMS giữ nguyên; bản trước `npc-walk-clean-e5d974a-20261013` giữ để rollback. Dùng Ctrl+F5 để nhận script mới. Các release bên dưới là lịch sử.

Release hiện tại: `npc-walk-clean-e5d974a-20261013`, build `npc-walk-clean-v1`. NPC đi bộ dùng nguyên pose nguồn; bỏ atlas 48×64 và thao tác cắt/dịch hai nửa chân gây mờ và khe hở. NPC có pose đi bộ thứ hai dùng pose gốc đó; NPC mở rộng dùng hướng gốc cùng chuyển động toàn thân của `NpcGait`. Health MySQL, contentVersion `818a32e3` và snapshot CMS giữ nguyên; bản trước `zoom-flicker-e5d974a-20261013` giữ để rollback.

QA local/HTTPS desktop 1920×925 và mobile giả lập 390×844: 896 tổ hợp NPC/hướng/pha giữ đúng frame nguồn, không tạo atlas đi bộ; không có page error. TypeScript và bộ kiểm tra `NpcGait` đạt. Ảnh/report ở `apps/game-client/temp/npc-walk-clean-live/` (gitignore).

Bản vá tiếp theo đã kích hoạt: release `zoom-flicker-e5d974a-20261013`, build `zoom-flicker-v1`. Sửa nút zoom giữa nhấp nháy do hai đoạn cập nhật luân phiên ghi phần trăm và ký hiệu `⌖`; nhãn hiện được chọn ở một chỗ theo bố cục desktop/mobile. Giữ bản sửa tải làng bên dưới; health MySQL và snapshot CMS không đổi. Bản trước `loading-parallel-e5d974a-20261013` giữ để rollback.

QA HTTPS xác nhận qua 90 khung hình: desktop 1920×925 chỉ có nhãn `⌖`, mobile giả lập 390×844 chỉ có `100%`; trước vá desktop có cả hai nhãn luân phiên. Không có page error. Ảnh/report ở `apps/game-client/temp/zoom-flicker-live/` (gitignore).

Staging đã cập nhật release `loading-parallel-e5d974a-20261013`, build `loading-parallel-v1`: các gói nội dung và ảnh nền độc lập tải đồng thời khi mở làng. Health MySQL đạt, contentVersion vẫn là `818a32e3` và snapshot CMS `500f4374bb2c…` giữ nguyên. Bản trước `shared-modals-601caae-20261013` giữ để rollback. Dùng Ctrl+F5 để tải script mới. Chưa xác nhận mức cải thiện thời gian tải trên mạng người dùng.

Smoke HTTPS sau deploy đạt desktop 1920×925 và mobile giả lập 390×844: màn chờ đóng, ảnh nhân vật/hội thoại-menu hoạt động, không có page error. Một lượt đo với browser context mới cho mỗi viewport: trước 13,68/13,38 giây, sau 12,36/11,96 giây (desktop/mobile). Đây là số đo tham khảo, chưa phải benchmark lặp lại; lượt sau loại bỏ upload chạy đồng thời. Báo cáo ở `apps/game-client/temp/loading-live/` (gitignore). Backup/restore drill đạt trước kích hoạt; checksum gói overlay và 185 asset giữ lại đã đối chiếu trên VPS.

1. Đăng nhập admin, mở **CMS / Xuất bản → Nhân vật mới → Thêm NPC mới**.
2. Chọn ảnh nhân vật từ asset đã đóng gói trong game; sửa tên, trạng thái, nội dung hội thoại. Mỗi hội thoại có nút bắt đầu và các lựa chọn đi tới nút khác. Có thể thử hội thoại ngay trong form và liên kết nhiệm vụ hiện có.
3. Ghi chú ít nhất 12 ký tự rồi lưu NPC. Chuyển **Đặt trên bản đồ**, kéo NPC hoặc nhập ô X/Y, ghi chú và lưu bố trí.
4. Trong **Xem trước game**, chọn bản nháp đã lưu. Iframe chạy build Cocos thật; quyền preview chỉ lấy từ phiên admin, không đưa token vào URL và không ghi bản nháp vào cache staging.
5. Trong **Kiểm duyệt / Xuất bản**, ghi chú, đánh dấu đã kiểm tra, duyệt rồi xuất bản staging. Mở lại game để nhận manifest mới; không cần build lại khi chỉ sửa những NPC này.
6. Lịch sử lưu snapshot bất biến, cho tải manifest và rollback phiên bản tương thích. Rollback thay bản staging đang chạy, không ghi đè bản nháp.

## Ranh giới dữ liệu

- NPC thêm mới có ID `cms-*`, tối đa 40. Ẩn NPC thay vì xóa cứng; lịch sử phát hành giữ ID và nội dung.
- NPC bổ sung không chặn đường và không sửa collision hay nhiệm vụ gốc. Bản đồ kiểm tra lại ô spawn, NPC khác, vật cản, nước, điểm nhiệm vụ và đường tiếp cận ở API.
- Nhiệm vụ liên kết mở chương hiện có. Không tạo hoặc tự cấp phần thưởng mới; game/server vẫn dùng quy tắc tiến độ hiện tại.
- Mỗi lần sửa tăng revision và đưa về draft. Ghi với revision cũ trả 409 để tránh ghi đè phiên khác. Duyệt và publish có kiểm tra lại tham chiếu ảnh, nhiệm vụ và cạnh hội thoại.
- Publish dùng transaction MySQL/SQLite hiện có, hash nội dung SHA-256, snapshot và audit. Giới hạn 50 snapshot, không tự xóa lịch sử. Không có endpoint publish production trong đợt này.
- Game kiểm schema và `baseVersion`, cache manifest staging hợp lệ gần nhất, fallback khi API lỗi. Cache được phân theo phiên bản game; bản nháp không được fallback sang cache staging.
- Game tải manifest khi mở; phiên đang chơi không tự đổi nội dung giữa chừng. Những thay đổi mã nguồn, asset mới ngoài bộ có sẵn hoặc schema vẫn cần build đồng bộ.

## API

`GET /admin/cms`, `PUT /admin/cms/draft`, `PUT /admin/cms/review`, `POST /admin/cms/publish`, `POST /admin/cms/rollback`, `GET /admin/cms/preview` yêu cầu phiên admin. `GET /content/staging` chỉ trả snapshot đã xuất bản, không chứa bản nháp. Các endpoint được liệt kê trong OpenAPI hiện có.

Repository tự bổ sung trường `cms` khi truy cập; dữ liệu cũ không cần rewrite và không đổi bảng tài khoản/tiến độ. Đây là migration tương thích trên kho JSON transactional hiện tại, chưa chuyển sang Prisma/tập bảng mới.

## Chạy và kiểm thử

Trên Windows dùng `npm.cmd run api:build`, `npm.cmd run admin:build`, `npm.cmd run check:client`, `npm.cmd run test:api`.

Build Cocos: đặt `GAME_BUILD_NAME=cms-staging-v1`, chạy `npm.cmd run web:build`. `npm.cmd run test:cms` dùng Vite admin local port 35173 (API cấu hình 33000), khởi động API fixture 33003 và game fixture 38081, không sửa dữ liệu người chơi. Kiểm tra tạo NPC, asset, hội thoại phân nhánh, kéo thả, duyệt, xuất bản, tọa độ Cocos, nhiệm vụ liên kết, tách bản nháp và preview có xác thực. Báo cáo/ảnh ở `apps/admin/temp/cms-qa/` được ignore. API test còn kiểm stale revision, rollback và cache khi offline. MySQL integration chỉ chạy khi cấu hình môi trường tương ứng.

Build admin staging cần `VITE_API_URL=https://ltt.vui-hoc.xyz/api`, `VITE_GAME_URL=https://ltt.vui-hoc.xyz/game/`; triển khai qua overlay và health/rollback trong runbook aaPanel. Giữ nguyên các UUID Cocos cũ; module mới có `.meta` riêng.

## Các giai đoạn tiếp theo chưa triển khai

Upload/versioning asset mới; world editor cho cây/nhà/trigger, layer/transform/multi-select/undo-redo; lịch sinh hoạt và điều kiện hội thoại; nhiệm vụ mới với rewards/dependency graph; ngân hàng câu hỏi mở rộng; Daily Events biên tập; publish production và manifest tải asset remote. CMS hiện tại tiếp tục giữ các màn quản lý gia đình, chương, bài học và metadata tài nguyên cũ.

QA trình duyệt HTTPS đã đạt đăng nhập bắt buộc, tên bé chính xác, ba nhóm tuổi/giới tính, thưởng cấp một lần, tiến độ MySQL và trang phục sau reload, cách ly học sinh, bốn khu mới, desktop/mobile ngang và logout; page errors rỗng. Báo cáo/ảnh local ignored `temp/deploy/qa/level100-live/`. Cleanup sau logout cần đăng nhập lại tài khoản fixture vì token cũ đã bị thu hồi; đã xác minh và tự xóa qua API.

QA HTTPS cuối cùng đã đạt hình xem trước sau khi ảnh tải xong, 24 khung painted trong Cocos, đúng tên HUD, phân biệt nhóm tuổi/avatar, ảnh làng sau khi splash đóng, desktop/mobile ngang; page errors rỗng. API quản trị/quyền phòng đạt. Tài khoản QA đã tự xóa. Hai lượt đầu bị timeout 10 giây ở request hồ sơ; các lượt cuối GET play/PUT progress đạt và không đổi mã xác thực. Báo cáo/ảnh local ignored `temp/deploy/qa/red-star-live/`.
