# aaPanel staging: ltt.vui-hoc.xyz

## Nghệ Nhân Gốm theo ảnh tham chiếu — 15/10/2026

Release hiện tại `potter-1a05ffb-20261015`, source commit `1a05ffb`, build `web-desktop`, contentVersion `d92c670c`. Nghệ Nhân Gốm dùng atlas riêng theo ảnh với áo nâu và tạp dề làm gốm. Overlay 14 file SHA-256 `5ab82c018e129cef9a2d70b46ac17117e4bc216e04ff766f9ca77c972eee82ee`; source/Web checksum khớp, backup `/opt/lang-tri-thuc/backups/database-20261015T084242Z.sql` phục hồi thử đạt. Hai API MySQL healthy, CMS giữ nguyên; release trước được giữ để rollback. Chi tiết tại [POTTER_REFERENCE](../../docs/design/POTTER_REFERENCE.md). Các release dưới đây là lịch sử.

## Cô Giáo Lan theo ảnh tham chiếu — 15/10/2026

Release hiện tại `teacher-lan-6870386-20261015`, source commit `6870386`, build `web-desktop`, contentVersion `d92c670c`. Cô Giáo Lan dùng atlas riêng theo ảnh với kính tròn, tóc tết và áo dài xanh nhạt. Overlay 14 file SHA-256 `36423f260383e19d82efc8141b020a0209e9d92be99fb85e06755fdc4ab263ca`; source/Web checksum khớp, backup `/opt/lang-tri-thuc/backups/database-20261015T083242Z.sql` phục hồi thử đạt. Hai API MySQL healthy, CMS giữ nguyên; release trước được giữ để rollback. Chi tiết tại [TEACHER_LAN_REFERENCE](../../docs/design/TEACHER_LAN_REFERENCE.md). Các release dưới đây là lịch sử.

## Bà bán hàng theo ảnh tham chiếu — 15/10/2026

Release hiện tại `market-lady-fb92eda-20261015`, source commit `fb92eda`, build `web-desktop`, contentVersion `d92c670c`. Bà bán hàng dùng atlas riêng theo khuôn mặt tham chiếu với áo bà ba và tạp dề. Overlay 14 file SHA-256 `140dca770cab988f1fb95a54d0f842c984c25c628c5a1408699b4f18179f3dae`; source/Web checksum khớp, backup `/opt/lang-tri-thuc/backups/database-20261015T082245Z.sql` phục hồi thử đạt. Hai API MySQL healthy, CMS giữ nguyên; release trước được giữ để rollback. Chi tiết tại [MARKET_LADY_REFERENCE](../../docs/design/MARKET_LADY_REFERENCE.md). Các release dưới đây là lịch sử.

## Cô Tấm theo ảnh tham chiếu — 15/10/2026

Release hiện tại `co-tam-bfa9954-20261015`, source commit `bfa9954`, build `web-desktop`, contentVersion `d92c670c`. Cô Tấm dùng atlas riêng theo khuôn mặt tham chiếu với trang phục dân gian; Bác Nông Dân tiếp tục mặc đồ lao động nâu. Overlay 14 file SHA-256 `6296ab3c74c47794fa330c4310793481ef04aa225ce74135ba0ee74b2670185d`; source/Web checksum khớp, backup `/opt/lang-tri-thuc/backups/database-20261015T081413Z.sql` phục hồi thử đạt. Hai API MySQL healthy, CMS giữ nguyên; release trước được giữ để rollback. Chi tiết tại [CO_TAM_REFERENCE](../../docs/design/CO_TAM_REFERENCE.md). Các release dưới đây là lịch sử.

## Trang phục nông dân, giữ mặt tham khảo — 15/10/2026

Release hiện tại `farmer-workwear-1bc07ed-20261015`, commit `1bc07ed`, build `web-desktop`, contentVersion `d92c670c`. Bác Nông Dân mặc áo nâu, quần tối màu và dép; giữ mặt/kính/tóc từ ảnh. Atlas mới đủ 24 frame, tám hướng đứng/đi/vẫy chào. Overlay 13 file SHA-256 `7970a711a537c2f6e9b7e019ba039cf29817730dd9abf1859d97ac9b57af84a9`, checksum source/Web khớp. Backup `/opt/lang-tri-thuc/backups/database-20261015T080024Z.sql` phục hồi thử đạt. Giữ `farmer-reference-3626919-20261015` để rollback. Hai API MySQL khỏe, CMS giữ nguyên. QA HTTPS desktop/mobile, 24 frame/hướng đứng/vẫy chào/không lật ảnh và API/quyền phòng đạt; page errors rỗng, tài khoản QA đã xóa. Evidence local ignored: `temp/deploy/qa/farmer-workwear-live/`. Chi tiết tại [FARMER_REFERENCE](../../docs/design/FARMER_REFERENCE.md). Các release dưới đây là lịch sử.

## Bác Nông Dân theo ảnh tham khảo — 15/10/2026

Release hiện tại `farmer-reference-3626919-20261015`, source commit `3626919`, build `web-desktop`, contentVersion `d92c670c`. Atlas riêng cho Bác Nông Dân từ ảnh người dùng, 24 frame đứng/bước đi/vẫy chào theo tám hướng. Overlay 14 file SHA-256 `694a3e7d315d696c6a744f6e78b26ed5b3f66bdb123c75eb5aa6557553d2aa1e`; checksum source/Web khớp. Backup `/opt/lang-tri-thuc/backups/database-20261015T074244Z.sql` phục hồi thử đạt. Giữ `ground-materials-b08555b-20261015` để rollback. Hai API MySQL khỏe, CMS không đổi. QA HTTPS 24 frame/hướng đứng/vẫy chào, không lật ảnh, desktop/mobile ngang và API/quyền phòng đạt; page errors rỗng, tài khoản QA đã xóa. Evidence local ignored: `temp/deploy/qa/farmer-reference-live/`. Chi tiết tại [FARMER_REFERENCE](../../docs/design/FARMER_REFERENCE.md). Các release dưới đây là lịch sử.

## Texture cỏ/đất và ghi nhớ phiên — 15/10/2026

Release hiện tại `ground-materials-b08555b-20261015`, build `web-desktop`, contentVersion `d92c670c`. Texture cỏ/đất mới từ commit `83a0812`; ghi nhớ đăng nhập/chuyển học sinh từ `43056e4`; sửa thời gian chờ mở hồ sơ từ `b08555b`. Overlay nền 29 file SHA-256 `8690bd5b27fce24b9ceb4ae27cdae12ab14ccde1989439c45f69561b0e0ad043`; overlay cuối ba file SHA-256 `b8159ced9b51027cedecfd1260f7420eb5f95289233d15feca6cc04415b999ba`. Checksum source/Web khớp; backup `/opt/lang-tri-thuc/backups/database-20261015T031737Z.sql` phục hồi thử đạt. Hai API MySQL khỏe, CMS giữ nguyên. QA HTTPS hai texture, mười cảnh desktop/mobile, phiên 30 ngày/reload/chuyển học sinh đạt; page errors rỗng, các fixture đã xóa. Release `ground-materials-83a0812-20261015` và `journey-regions-546c4ff-20261015` giữ để rollback. Chi tiết tại [GROUND_MATERIALS](../../docs/design/GROUND_MATERIALS.md). Các release dưới đây là lịch sử.

## Cảnh mới cho 10 vùng — 15/10/2026

Release hiện tại `journey-regions-546c4ff-20261015`, source commit `546c4ff`, build `web-desktop`, contentVersion `d92c670c`. Mỗi vùng có một ảnh cảnh mới riêng. Overlay 66 file SHA-256 `a9083d2f9556f600a16972fbc97687a5a4edd8ef80bdd23e38c3f50f8e5a59c2`, checksum source/Web khớp. Backup `/opt/lang-tri-thuc/backups/database-20261014T231650Z.sql` phục hồi thử khớp dữ liệu; giữ release `character-assets-8eb9f85-20261015` để rollback. Hai API MySQL healthy, CMS giữ nguyên. QA HTTPS đủ mười texture riêng, 20 ảnh desktop/mobile ngang, không có page error; API/quyền phòng đạt và tài khoản QA đã xóa. Evidence local ignored: `temp/deploy/qa/journey-regions-live/`. Chi tiết tại [JOURNEY_REGION_ASSETS](../../docs/design/JOURNEY_REGION_ASSETS.md). Các release dưới đây là lịch sử.

## Chọn nhân vật từ assets — 15/10/2026

Release hiện tại `character-assets-8eb9f85-20261015`, source commit `8eb9f85`, build `web-desktop`, contentVersion `d92c670c`. Chọn mẫu áo đỏ sao vàng hoặc xanh–trắng ở màn hồ sơ và trong game, dùng cùng atlas cho preview/HUD/đứng/đi tám hướng ở mọi nhóm tuổi. Overlay 12 file SHA-256 `a95878c515d9fd231fa252db3b65aa4c2f85ea48d1dc853ac2591251e9ac8d3a`; checksum source/Web khớp. Backup `/opt/lang-tri-thuc/backups/database-20261014T194401Z.sql` phục hồi thử đạt; bản `red-star-boy-d92c670c-20261015` giữ để rollback. Hai API MySQL healthy, CMS giữ nguyên. QA HTTPS avatar xanh–trắng/24 frame/HUD/hồ sơ MySQL/desktop/mobile ngang và API/quyền phòng đạt, page errors rỗng; tài khoản QA đã xóa. Evidence local ignored: `temp/deploy/qa/character-assets-live/`. Các release dưới đây là lịch sử.

## Nhân vật bé trai áo đỏ sao vàng — 15/10/2026

Release hiện tại `red-star-boy-d92c670c-20261015`, build `web-desktop`, contentVersion `d92c670c`. Bé trai nhóm 6–8 tuổi chọn avatar 0 có hình vẽ theo ảnh tham khảo và concept `docs/design/characters/boy-6-8-red-star-concept-v1.png`. Atlas `apps/game-client/web/characters/boy-red-star-6-8-v1.png` gồm tám hướng, một hàng đứng và hai hàng bước đi. Cắt hàng theo các rãnh thực tế, chuẩn hóa khung 96×128 và đặt chân cùng đường chuẩn; dùng chung trong làng, HUD và xem trước. Màn hồ sơ ghi “Áo đỏ sao vàng”. Giữ avatar ID cũ, không đổi cấu trúc dữ liệu. Hình painted dùng tóc/màu da mặc định; tùy chỉnh tóc hoặc da dùng fallback vẽ với áo đỏ sao vàng. Nhóm tuổi và avatar khác giữ hình hiện có.

Overlay 15 file, SHA-256 `f4122498242f76f74ed8be75e359514d75e994e9b12be04db3bc4a2786d2759b`; checksum source/Web khớp. Backup `/opt/lang-tri-thuc/backups/database-20261014T184047Z.sql` đã phục hồi thử đạt. Giữ release `level100-students-d92c670c-20261015` để rollback. Hai API health MySQL đạt; CMS manifest và nội dung không thay đổi. QA local TypeScript, client logic/lifecycle và Cocos desktop/mobile đạt; kiểm 24 frame, hình xem trước, tên HUD và phân biệt tuổi/avatar, không có page error. Artifact local `apps/game-client/temp/red-star-qa/`.

## Triển khai VPS — 15/10/2026

Release `/opt/lang-tri-thuc/releases/level100-students-d92c670c-20261015`, build `web-desktop`, contentVersion `d92c670c`, game https://ltt.vui-hoc.xyz/game/. Source working tree được đóng gói đầy đủ; 43 file khác release trước được tải bằng overlay sau khi đối chiếu SHA-256 từng file. Overlay SHA-256 `769465ccf15c78da1f29ffe832a4340a0b17fb676352fa29f8b675248fe81420`. `package-lock.json` được npm prune cập nhật trên Linux.

Backup `/opt/lang-tri-thuc/backups/database-20261014T181651Z.sql` đã phục hồi thử và khớp dữ liệu. Giữ release `schoolyard-mobile-e5d974a-20261014` để rollback ứng dụng. Hai API và hai rooms active; cả hai API health MySQL/version đạt. CMS được nâng compatibility sang bản mới, NPC không thay đổi; manifest mới `9526d4b358c398958d5b83d7beb1a45fe8ad475c3eb6e3b5caf15ce3e060c1f4`.

QA HTTPS quản trị/CMS, chặn API nội bộ và phòng không vé đạt. QA signed WebSocket đạt tên/tuổi/nhân vật, câu trả lời hành trình do server xác nhận và đọc lại tiến độ MySQL. Tài khoản QA đã xóa. Thông tin mật khẩu QA local là JSON string có dấu nháy; cần giải mã trước khi đăng nhập.

Triển khai riêng dưới `/opt/lang-tri-thuc`, dùng Nginx/Node 24/MariaDB hiện có của aaPanel. Không dùng Compose/Caddy vì cổng 80/443 đang phục vụ các site khác. Giao diện preview yêu cầu tài khoản staging; API dùng bearer, WebSocket dùng vé phụ huynh.

## Bố trí

Release hiện tại ngày 14/10/2026: `/opt/lang-tri-thuc/releases/schoolyard-mobile-e5d974a-20261014`, build `schoolyard-mobile-v3`, contentVersion `818a32e3`. Asset sân đất có khung thành gỗ và cờ Việt Nam 8 khung; điện thoại dọc có thông báo xoay ngang, ngang phủ viewport và có nút fullscreen. PWA khai báo landscape/fullscreen; native fullscreen phụ thuộc API trình duyệt và thao tác người dùng. Overlay SHA-256 `e6243cc4d6d2bbe5c00cf812f729588a4bb0e422fa1823f64f872711da4f87b2`; backup/restore drill và checksum đạt, snapshot CMS giữ nguyên khi kích hoạt. Bản trước `schoolyard-e5d974a-20261014` giữ để rollback. Các release bên dưới là lịch sử.

Release hiện tại ngày 14/10/2026: `/opt/lang-tri-thuc/releases/schoolyard-e5d974a-20261014`, build `schoolyard-v1`, contentVersion `818a32e3`. Thêm sân bóng đất/khung thành gỗ cạnh trường và cờ Việt Nam chuyển động, bảng nhiệm vụ tránh che khu này trên mobile. Overlay SHA-256 `af62cf331d9456482482f5767c319ea63f78b21a5dedbd21ae1ad800293eaef9`; backup/restore drill, checksum và health MySQL đạt; snapshot CMS giữ nguyên. Bản trước `pwa-brand-e5d974a-20261014` giữ để rollback. Các release bên dưới là lịch sử.

Release hiện tại ngày 14/10/2026: `/opt/lang-tri-thuc/releases/pwa-brand-e5d974a-20261014`, build `pwa-brand-v1`, contentVersion `818a32e3`. Logo/favicon, PWA giới hạn `/game/` và splash logo/tiến độ đã bật. Overlay SHA-256 `b92a0eab66627dc4cb51b81e63740db45f17964bb16cea0fd02568787ac4952d`; backup/restore drill, checksum, health MySQL, QA manifest/splash/offline HTTPS desktop/mobile đạt; snapshot CMS không đổi. Bản trước `village-signs-e5d974a-20261014` giữ để rollback. Chi tiết và lưu ý vòng đời service worker tại [CMS_STAGING](../../docs/design/CMS_STAGING.md). Các release bên dưới là lịch sử.

Release hiện tại ngày 14/10/2026: `/opt/lang-tri-thuc/releases/village-signs-e5d974a-20261014`, build `village-signs-v1`, contentVersion `818a32e3`. Sửa chữ biển Cây Đa và đồng bộ ba biển khu mở rộng sang asset gỗ. Overlay SHA-256 `cbe85f62e0c65febe0ad579f5162ded37f9c4565ad1fe05a06ecef9a71e1bfe1`; backup/restore drill, checksum, health MySQL và QA HTTPS desktop/mobile đạt; snapshot CMS không đổi. Bản trước `npc-walk-clean-e5d974a-20261013` giữ để rollback. Các release bên dưới là lịch sử.

Release hiện tại: `/opt/lang-tri-thuc/releases/npc-walk-clean-e5d974a-20261013`, build `npc-walk-clean-v1`, contentVersion `818a32e3`. NPC giữ nguyên ảnh nguồn khi đi bộ, bỏ atlas nhỏ/cắt chân; giữ các bản sửa tải làng và nút zoom. Overlay SHA-256 `2e9fb94ff511b623033096e367ebe75a648004fa504ccab565ace57a1c2b7b8c`; backup/restore drill, checksum và health MySQL đạt, snapshot CMS không đổi. Bản trước `zoom-flicker-e5d974a-20261013` giữ để rollback. Các release bên dưới là lịch sử.

Bản vá mới nhất: `/opt/lang-tri-thuc/releases/zoom-flicker-e5d974a-20261013`, build `zoom-flicker-v1`, contentVersion `818a32e3`. Sửa nhãn nút zoom giữa nhấp nháy; giữ bản sửa tải làng. Overlay SHA-256 `6954df45dc119a1969f02b6e7ddfaf993bdfc435dfcae73ea31223fc4e340cd3`, backup/restore drill đạt, health MySQL và snapshot CMS không đổi. Bản trước `loading-parallel-e5d974a-20261013` giữ để rollback.

Cập nhật mới nhất 13/10/2026: release `/opt/lang-tri-thuc/releases/loading-parallel-e5d974a-20261013`, build `loading-parallel-v1`, contentVersion `818a32e3`. Source working tree trên baseline `e5d974a`; overlay SHA-256 `98f77da71d1349995104c970e9876c23c88d54194453b8b1885a38448efd307d`. Đã đối chiếu 185 asset giữ lại, backup/restore drill, health MySQL và smoke HTTPS desktop/mobile. Snapshot CMS `500f4374bb2c…` giữ nguyên. Symlink `/opt/lang-tri-thuc/current`; bản trước `shared-modals-601caae-20261013` giữ để rollback. Chi tiết [CMS_STAGING](../../docs/design/CMS_STAGING.md). Mục release bên dưới là lịch sử trước đợt cập nhật này.

- Release đã kích hoạt gần nhất: `/opt/lang-tri-thuc/releases/68f79b9-village-expansion-547e04f2-20261012`, build `village-expansion-v4`, contentVersion `547e04f2` (rules 9). Source được commit thành `1de349a` sau triển khai; tên release vẫn giữ baseline `68f79b9` và working tree tại thời điểm đóng gói. Bản trước `68f79b9-playtest-feedback-8f4c4bbd-20261012` giữ để rollback. Symlink `/opt/lang-tri-thuc/current`; RELEASE.txt ghi nguồn bản phát hành. Health HTTPS kiểm tra ngày 12/10 vẫn trả MySQL/`547e04f2`; chi tiết [VILLAGE_EXPANSION](../../docs/design/VILLAGE_EXPANSION.md).
- Admin: `https://ltt.vui-hoc.xyz/`; game: `/game/`; API: `/api/`; Colyseus: `/colyseus/`.
- Hai systemd service `lang-tri-thuc-api`, `lang-tri-thuc-rooms`, user `langtri`.
- Cổng chỉ bind `127.0.0.1:33080` và `127.0.0.1:32580`; `ALLOW_DEV_ROOMS=0` tắt room development kể cả loopback. `/api/internal/` bị chặn từ Nginx.
- DB riêng `lang_tri_thuc`, user giới hạn database `lang_tri_thuc_app` trên MariaDB 10.11 của VPS; repository tương thích MySQL.
- Secret root-only `/etc/lang-tri-thuc/api.env`, `rooms.env`, `access.txt`; Nginx chỉ đọc hash preview qua nhóm `www`. Không copy các file này vào repo/web root.
- aaPanel giữ cấu hình chính/certificate và đường dẫn `/.well-known/` cũ; extension riêng `.../vhost/nginx/extension/ltt.vui-hoc.xyz/lang-tri-thuc.conf`.

## Build và cập nhật

Trạng thái hiện tại theo mục Bố trí phía trên. Các đợt mini game/art/completion dưới đây là lịch sử triển khai, không phải bản đang chạy. Sau mỗi lần cập nhật cần ghi release/build/contentVersion mới tại mục Bố trí và giữ bản đã kiểm tra để rollback.

Bản mini game ngày 12/10 đã triển khai: build `minigame-complete-v3`, rules 7 / contentVersion `6f44a0a8`. Baseline HTTPS/API trước deploy trả `e48dccf3`; sau activate trả `6f44a0a8`, MySQL và hai services active. SHA-256 archive local/remote khớp, backup/restore drill khớp state, API/rooms build Linux và nginx -t đạt. Giữ release NPC trước để rollback.

Đóng gói tên riêng để giữ archive các bản trước:

```powershell
python tools/prepare-release.py --build minigame-complete-v3 --archive minigame-6f44a0a8-20261012.tar.gz
```

Metadata/SHA-256 ở `temp/deploy/minigame-6f44a0a8-20261012.json`. Gói chứa source working tree (bao gồm thay đổi chưa commit), Web đã build và admin dùng URL staging. Release mới cần cập nhật cả API/rooms/Web vì rules đã đổi; giữ DB và secrets hiện có.

QA live: `verify-api.cjs` đạt quyền truy cập/admin/catalog; `verify-web.cjs` đạt parent UI, hai client signed WebSocket/avatar/hair/emote, MySQL save/reload và offline. `test:art` trên HTTPS đạt 12 bảng desktop/mobile giả lập và điều khiển trực tiếp. `verify-minigames.cjs` dùng tài khoản tạm, tiến độ chương 1 thật và bài học chương 2 hợp lệ để kiểm tra phản hồi từ chối riêng cho người thao tác, trace/progress giữ nguyên, thao tác đúng lưu và khôi phục sau reload. Các tài khoản QA được xóa ở finally; browser errors rỗng. Ca di chuyển đầu timeout do tab không ở trước; QA bổ sung `bringToFront()` và chạy lại đạt, không thay mã runtime. Báo cáo ở `temp/deploy/qa/`.

`prepare.py` dành cho lần triển khai đầu và cố ý từ chối database đã có. Nó sao lưu site trước khi tạo DB, sinh secret riêng và không in mật khẩu. Không chạy lại để reset tài khoản. Node path trong unit/install hiện khớp bản aaPanel đã kiểm tra, cần cập nhật nếu aaPanel gỡ Node đó.

Build Cocos trên máy có Creator 3.8.8. Build admin với VITE_API_URL/VITE_SERVER_URL/VITE_GAME_URL trỏ domain. Bundle source từ Git và hai thư mục build thành `public/game`, `public/admin`; loại `.env`, backup, temp, node_modules. `install.sh` cài dependencies, build backend/rooms trên Linux, prune dev, tạo symlink, cài services và test Nginx trước reload. Script này là **lần cài đầu**; nó từ chối ghi đè extension đã có.

Lần cập nhật sau dùng release mới, build và health check trước khi đổi symlink; giữ secret/DB và release trước. Sau đổi symlink phải restart cả hai service để tránh client/server khác gói nội dung. Kiểm tra health, admin, signed WebSocket, save/reload trước khi kết thúc.

## Vận hành / rollback

```sh
systemctl status lang-tri-thuc-api lang-tri-thuc-rooms
curl -fsS http://127.0.0.1:33080/health
/www/server/nginx/sbin/nginx -t
python3 /opt/lang-tri-thuc/current/deploy/aapanel/backup-verify.py
```

Backup SQL lưu root-only trong `/opt/lang-tri-thuc/backups/`. Restore drill tạo một DB tên ngẫu nhiên riêng, so SHA-256 state và chỉ xóa DB thử đó; không sửa DB đang phục vụ. Snapshot state prototype chứa dữ liệu tài khoản nên phải bảo vệ và có retention theo chính sách vận hành.

Rollback app: đổi `current` về release đã kiểm tra trước, restart hai service; giữ DB. Rollback lần cài đầu: dừng/disable **hai service của ứng dụng**, chuyển extension riêng ra thư mục backup, chạy nginx -t rồi reload. Site aaPanel gốc chưa bị thay root/cert/file; không xóa database hoặc thư mục backup.

Chạy `node deploy/aapanel/verify-web.cjs` trên máy QA có file local ignored `temp/deploy/access.txt`. Suite tạo tài khoản thử rồi xóa nó ở finally, không sử dụng tài khoản admin thật. Chưa thay thế soak WAN, kiểm thử thiết bị thật hoặc biên tập nội dung trước beta.

`node deploy/aapanel/verify-api.cjs` kiểm tra admin/catalog, chặn UI anonymous/internal API, từ chối room development và phòng riêng thiếu vé; logout phiên admin thử ở finally.

## Cập nhật completion — đã triển khai 11/10/2026

Gói `temp/deploy/completion-release.tar.gz` chứa source working tree, public/admin dùng URL staging, public/game build completion-v1. Metadata/SHA-256 ở completion-release.json; contentVersion e48dccf3. Đã upload và activate qua SSH ngày 11/10/2026; SHA-256 archive khớp local, backend/rooms build trên Linux đạt, hai services active và HTTPS health MySQL trả contentVersion e48dccf3. Backup SQL và restore drill khớp state trước khi chuyển release.

Để triển khai một bản cập nhật tương tự, upload archive vào `/opt/lang-tri-thuc/completion-release.tar.gz` và script local `deploy/aapanel/update-release.sh` vào `/opt/lang-tri-thuc/update-release.sh`, rồi chạy:

```sh
sh /opt/lang-tri-thuc/update-release.sh 0b4a42e-completion-e48dccf3-20261011 completion-release.tar.gz
python3 /opt/lang-tri-thuc/releases/0b4a42e-completion-e48dccf3-20261011/deploy/aapanel/activate-release.py 0b4a42e-completion-e48dccf3-20261011 e48dccf3
```

Script update chỉ chuẩn bị release mới. Script activate kiểm tra health MySQL/contentVersion và hai services, tự rollback app khi sai; giữ DB/secret. Sau activate chạy verify-api.cjs, verify-web.cjs và test đồng bộ trên hai browser. Chưa thay thế nghiệm thu trẻ/thiết bị thật hoặc soak WAN.

QA live ngày 11/10/2026 đạt HTTPS/admin/catalog, chặn UI anonymous/internal API/room không có vé, parent UI, signed WebSocket hai client, ngoại hình/cử chỉ, lưu tiến trình và reload online/offline. Tranh vẽ desktop được lưu trên MySQL và khôi phục ở browser mobile cùng hồ sơ trong phòng riêng khác; không mở trùng một hồ sơ trong cùng phòng. Browser errors rỗng. Báo cáo local ignored tại `temp/deploy/qa/api-report.json` và `report.json`.

## Deploy art — 11/10/2026

Đợt ghép tranh ngày 12/10 dùng overlay được tạo bằng `tools/prepare-release-delta.py`. Script `update-overlay.sh BASE RELEASE ARCHIVE SHA256` yêu cầu base đúng release hiện chạy, kiểm tra SHA, sao chép sang thư mục mới rồi build API/rooms; không activate trong bước chuẩn bị. Dùng `activate-release.py RELEASE CONTENT_VERSION` sau khi chuẩn bị đạt. Giữ release trước để rollback; backup/restore drill trước mỗi lần cập nhật.

Đã activate release art sau khi kiểm tra SHA-256 delta, backup/restore drill khớp state, build backend/rooms trên Linux và nginx -t đạt. Delta được áp dụng vào bản sao release completion; không sửa thư mục đang phục vụ trong lúc chuẩn bị. Hai services active, health MySQL cùng contentVersion e48dccf3. Các file static cũ giữ trong bản sao release nhưng index/manifest dùng bundle art mới.

QA live đạt API/admin/quyền truy cập, parent UI, signed WebSocket hai client, avatar/hair/emote, save/reload online/offline và errors rỗng. Test art trên HTTPS đạt tám NPC × tám hướng không mirror và đủ 12 bảng desktop/Android giả lập; ảnh ở apps/game-client/temp/art-polish-qa. Các gate biên tập, người làm art, trẻ và thiết bị thật vẫn còn.

## Bỏ splash Cocos — 11/10/2026

Commit `72a3a50` tắt splash trong tools/build-web.cjs: totalTime=0, logo.type=none và bỏ base64 logo. Mỗi lần build Web đều áp dụng cấu hình này. So sánh build cho thấy chỉ public/game/src/settings.json thay đổi. Đã deploy vào release riêng, SHA-256 khớp, giữ release art để rollback; API/rooms dùng runtime cũ cùng contentVersion, không thay DB/secret. Browser local/live xác nhận settings không có logo, splash thời lượng 0, game tải được và errors rỗng.

## Lịch âm và vận hành tự động — 11/10/2026

Cập nhật vận hành 13/10: xem [BETA_TECHNICAL_QA](../../docs/BETA_TECHNICAL_QA.md). Release `29b35d8-beta-ready-785f4e7e-20261013` đang chạy Cocos v6/rules 10. Hai API 33080/33081, hai rooms 32580/32581 và Redis loopback 36379. Redis runtime riêng nằm trong `/opt/lang-tri-thuc/runtime/redis`; dùng gói Redis/liblzf từ kho hệ điều hành có chữ ký, giải nén vào thư mục ứng dụng, không cài đè Redis của site khác. Installer yêu cầu runtime này trước khi chạy `install-scaling.py prepare`/`enable`.

Các instance dùng environment file riêng để systemd không ghi đè port bằng cấu hình chung. API nội bộ qua Nginx loopback 33082. Trước rollback cần đảm bảo bản cũ hiểu Redis/publicAddress và schema hiện tại; release giữ để rollback app, không tự coi cấu hình scale đã rollback. Muốn về một instance phải phục hồi Nginx extension đã lưu, tắt B, bỏ drop-in scale của A, kiểm tra Nginx/health và restart A; không xóa database hoặc secret. Offsite chỉ chờ kết nối, lịch Windows thử đã tắt.

Đã deploy commit 3d986c8: Web tính Tết/Trung thu bằng lịch âm UTC+7, khoảng 1900–2199. Timer backup bật: mỗi ngày 02:00 giờ Việt Nam; restore drill Chủ nhật 02:30. Hai service đầu chạy thành công trong sandbox systemd, Result=success/ExecMainStatus=0; SQL/JSON root-only, giữ 30 ngày/tối thiểu bảy bản và bản verify gần nhất. Backup thủ công cũ được giữ. Code vận hành ở /opt/lang-tri-thuc/operations độc lập symlink game. Chi tiết [BACKUP_OPERATIONS](../../docs/BACKUP_OPERATIONS.md).

QA live calendar đạt midnight/range/ngày tương lai, API/admin/quyền truy cập và signed WebSocket hai client, save/reload online/offline đạt; errors rỗng. Đã restore dump snapshot khi live QA thay đổi tài khoản, dữ liệu dump vẫn khớp. Bản sao offsite, thông báo lỗi ra kênh bên ngoài và soak WAN dài chưa được nghiệm thu.

QA trình duyệt HTTPS đã đạt đăng nhập bắt buộc, tên bé chính xác, ba nhóm tuổi/giới tính, thưởng cấp một lần, tiến độ MySQL và trang phục sau reload, cách ly học sinh, bốn khu mới, desktop/mobile ngang và logout; page errors rỗng. Báo cáo/ảnh local ignored `temp/deploy/qa/level100-live/`. Cleanup sau logout cần đăng nhập lại tài khoản fixture vì token cũ đã bị thu hồi; đã xác minh và tự xóa qua API.

QA HTTPS cuối cùng đã đạt hình xem trước sau khi ảnh tải xong, 24 khung painted trong Cocos, đúng tên HUD, phân biệt nhóm tuổi/avatar, ảnh làng sau khi splash đóng, desktop/mobile ngang; page errors rỗng. API quản trị/quyền phòng đạt. Tài khoản QA đã tự xóa. Hai lượt đầu bị timeout 10 giây ở request hồ sơ; các lượt cuối GET play/PUT progress đạt và không đổi mã xác thực. Báo cáo/ảnh local ignored `temp/deploy/qa/red-star-live/`.
