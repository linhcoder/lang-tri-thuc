# Bàn giao prototype tám chương — 09/10/2026

Backend hiện dùng MySQL Laragon local và MySQL 8.4 trong gói Docker. SQLite chỉ giữ cho kiểm thử in-memory và migration/backup dữ liệu cũ. Xem [MySQL localhost](MYSQL_LOCAL.md).

Ngày 10/10/2026 bổ sung tám PNG nền alpha: Ông Đồ, Cô Tấm, Cô Giáo Lan, Bà Bán Hàng, Nghệ Nhân Gốm, Tí–Na, Hằng–Cuội và sen ao làng. NPC trong làng đã dùng sprite idle thay Graphics; chưa có animation riêng. Cô Giáo Lan/Nghệ Nhân Gốm được dịch để tránh cây/mái nhà che hình. Xem [art/prompt](../apps/game-client/ART.md) và [QA](../apps/game-client/QA-REPORT.md); các mô tả placeholder trong bản bàn giao gốc bên dưới là lịch sử.

Đợt sửa lỗi và kiểm thử lại mới nhất: [QA-REPORT.md](../apps/game-client/QA-REPORT.md), gồm 31 nhóm test client, API/server/MySQL và browser demo/Chương 1/campaign/phụ huynh. Màn kết quả rải hạt cuối trong demo đã được sửa. Bảng kiểm thử bên dưới giữ số liệu bàn giao ban đầu.

Yêu cầu mới nhất cho phép tiếp tục toàn bộ phần còn lại và commit. Các câu “chờ xác nhận từng milestone / không commit” trong master prompt và tài liệu kế hoạch cũ là quy trình lịch sử, đã được yêu cầu mới thay thế. Đợt này không push.

## Đã triển khai và chạy được

- Cocos Creator **3.8.8**, giữ project `apps/game-client`, Canvas và `VillageScene.scene` hiện có. Không dựng scene/prefab giả hoặc đổi UUID cũ. Creator sinh `.meta` thật cho script/resource mới.
- Campaign tám chương, nhiệm vụ có dependency, intro/end, bài học ba mức tuổi, gợi ý và tám receipt sao duy nhất. Chương 1 chạy trong làng; chương 2–8 vào bằng Sổ làng hoặc NPC. Nội dung vẫn là **draft tự biên soạn**.
- 12 mini game có luật và thao tác riêng: trồng/đếm lúa, Ô ăn quan, kéo co nhịp, nhảy sạp nhịp, đi chợ, đèn ông sao, bánh chưng mô phỏng, ghép tranh trượt, quan sát/thả cá, tìm chữ, chăm vật nuôi và mê cung. Có pause/resume, action trace được kiểm tra khi tải lại; không tin trường score/completed do client gửi.
- Sáu NPC mới bằng Graphics, avatar, túi sao, trang trí màu nhà cạnh chợ, tám đèn trên cây đa. Bản đồ có mười mốc đi bằng A* và cổng chuyển khu khi đứng gần mốc; server kiểm tra vị trí trước khi dịch chuyển. Các khu nằm trên cùng map 40×40.
- Keyboard/click/touch/joystick, collision/depth/camera, mobile portrait/landscape và kiểm soát chủ sở hữu input giữ lại từ các milestone trước.
- Low/Medium/High điều chỉnh `pipeline.shadingScale` thành 0,75/0,9/1; culling terrain theo camera. Tiles/nhân vật/vật thể dùng atlas chung tải một lần; chưa có nhiều scene lớn hoặc tải atlas độc lập cho từng vùng.
- Save chapter/campaign có version, giữ save cũ/future/corrupt, export và bản sao trước reset. Online dùng key riêng theo UUID hồ sơ; backup local không tự cấp kết quả online.
- PrivateFriendRoom tối đa 20, MiniGameRoom tối đa 4; vé HMAC do tài khoản phụ huynh cấp, lời mời bạn riêng với vé của trẻ, khóa phòng, revoke hồ sơ, approved emote, chặn và báo cáo. Có reconnect/solo fallback, không chat tự do/voice chat. Server kiểm tra di chuyển, bài học, nhiệm vụ, mini game và cấp kết quả idempotent.
- Fastify API: scrypt password, token phiên có hạn, ownership/admin role, profile không tên thật/ngày sinh, revision conflict, xuất/xóa dữ liệu và báo cáo. Runtime dùng MySQL, pool và transaction với row lock; dữ liệu prototype là snapshot JSON single-row.
- React admin/phụ huynh: tạo hồ sơ, cấp/mời/khóa phòng, mở game, xem tiến độ, xuất/xóa dữ liệu, sửa hội thoại, review nội dung, audit và xử lý report. Sửa hội thoại tự trở về draft. ID/đáp án/luật thưởng không sửa từ trang này.
- Gói Docker Compose MySQL/API/Colyseus/Caddy và runbook staging. Backup MySQL xuất snapshot JSON kèm SHA-256; backup SQLite legacy được giữ riêng.

## Mở chính xác trong Editor

1. Cocos Dashboard → **Add Project** → chọn `C:\CODE\lang-tri-thuc\apps\game-client` → mở bằng **Creator 3.8.8**.
2. Đợi Asset Database import xong. Mở `assets/scenes/VillageScene.scene`.
3. Chọn Canvas: component `VillageBootstrap` đã được gắn từ milestone trước. Không gắn thêm bản thứ hai. Nếu đang xem scene khác, mở VillageScene; nếu tự phục hồi scene từ bản cũ chưa có script, kéo `assets/scripts/core/VillageBootstrap.ts` vào Canvas một lần.
4. Nhấn Preview → Browser. Game mặc định chơi offline; các node runtime được dựng bởi bootstrap và không cần lưu ngược vào scene. Mở Sổ làng sau khi nhận sao đầu tiên.
5. Chương 1: Ông Đồ → Bác Nông Dân → năm ô lúa → ba câu đếm → Ông Đồ. Chương sau có thể mở từ Sổ làng/NPC. `?demo=1` giữ demo cũ.
6. Dùng Browser build để kiểm tra online và trang phụ huynh. Không chỉnh scene, UUID, prefab hay độ phân giải thiết kế để chạy prototype này.

Thao tác Editor bắt buộc chỉ là mở project, đợi import và Preview. Không cần dựng map/prefab hoặc nhập art thủ công. CLI build cũng đã chạy bằng Creator thật; thao tác GUI Editor chưa tự động kiểm chứng trong môi trường này.

## Chạy toàn bộ hệ thống local

Node **24.13+** là phiên bản khuyến nghị của dự án; npm, MySQL đang chạy và Creator 3.8.8. SQLite chỉ dùng cho test/migration legacy. Trong PowerShell, dùng `npm.cmd` nếu execution policy chặn `npm.ps1`.

```powershell
npm.cmd ci
npm.cmd run web:build
npm.cmd run db:setup
npm.cmd run server:build
npm.cmd run admin:build
npm.cmd run local:stack
```

- Game offline: `http://127.0.0.1:38080/`.
- Phụ huynh/admin: `http://127.0.0.1:35173/`.
- API: `http://127.0.0.1:33000`; phòng riêng: `http://127.0.0.1:32567`.
- Helper tự sinh secret và mật khẩu bootstrap trong **`.env.local`**, không ghi chúng ra console/Git. Mở file local này để đọc mật khẩu của bí danh `admin`. Tài khoản phụ huynh thường có thể đăng ký trong UI; mật khẩu từ 12 ký tự.
- Tạo hồ sơ → cho phép vào phòng riêng → mở làng. Chủ phòng chia sẻ **mã mời bạn** cho phụ huynh khác; người nhận điền mã mời rồi cấp vé cho hồ sơ của mình. Không chia sẻ vé hồ sơ trẻ.
- Mỗi vé có hạn 15 phút, phòng có hạn 24 giờ. Đóng/khóa phòng ngăn người mới; xóa tài khoản/hồ sơ thu hồi quyền khi server kiểm tra lại (tối đa khoảng 30 giây).
- Trong game: Người lớn → trả lời cổng tránh chạm nhầm → Bạn bè để emote/chọn bạn/chặn/báo cáo hoặc chơi một mình. Cổng số học local không phải cơ chế xác thực API.
- Ctrl+C dừng các helper; không có Windows service/autostart. Database MySQL mặc định: `lang_tri_thuc`; cấu hình nằm trong `.env.local`. File `apps/backend/.data/game.sqlite` chỉ là dữ liệu legacy nếu còn giữ.

`npm run web` vẫn phục vụ cổng 8080. Kết nối room development công khai chỉ dành cho `?demo=1&server=http://127.0.0.1:2567` và server bind loopback; game chính yêu cầu vé phụ huynh.

## Nội dung và backup

Admin → Nội dung → sửa hội thoại → reviewed → approved với ghi chú người kiểm. Xuất gói JSON; nhập cho prototype bằng:

```powershell
node tools/import-content.cjs C:\path\lang-tri-thuc-content.json --draft
npm.cmd run web:build
npm.cmd run backup:local
```

Bỏ `--draft` sẽ từ chối chương chưa approved. Việc import văn bản **không** chứng nhận đáp án, độ tuổi, luật Ô ăn quan hoặc mô tả văn hóa đã được chuyên gia kiểm. Các lesson/rule trong source vẫn có review gate và phải được duyệt trước beta.

`backup:local` đọc snapshot MySQL nhất quán, xuất JSON kèm SHA-256 và kiểm chứng đọc lại trong `artifacts/backups` bị ignore. Phục hồi vào database riêng còn trống, xác minh dữ liệu trước khi đổi `DATABASE_URL`; xem [quy trình MySQL](MYSQL_LOCAL.md). `backup:sqlite` chỉ dành cho dữ liệu legacy. Backup chứa credential hash và tiến độ, phải giữ riêng; sau yêu cầu xóa dữ liệu phải quản lý cả các bản backup.

## Kết quả kiểm thử

| Kiểm tra | Kết quả |
|---|---|
| TypeScript strict client; build API/server/admin | Pass |
| Client algorithms/state/input/content | 30 nhóm pass; 1.600 round-trip isometric, A* so BFS |
| API auth/ownership/revision/review/rollback | 2 integration test pass, nhiều assertion |
| Server production JS + movement + private room | 4 integration test pass |
| Chương 1 browser desktop/mobile | Full flow, reload, hint/replay, save future/corrupt, rotation pass |
| Campaign browser | Chương 2–8 và toàn bộ 12 game pass; Ch1 kiểm riêng; đủ 8 sao, reload mỗi chương |
| Demo cũ / hai browser online | Full flow, input, leave/reconnect pass |
| Parent UI → vé → game Cocos → API | Pass; fragment được bỏ, key save tách profile, server ghi intro, offline fallback |
| GPU mẫu ngắn AMD Radeon/D3D11 | Low/Medium/High p95 ~16,8 ms; Ch1 ~63 draw calls; **không phải Intel certification** |
| Room load 10/16/20 | 60/96/120 probe, ~3,7s mỗi mức; p95 RTT local ~9,6/8,9/21,5 ms ở lần gần nhất |
| SQLite backup | Integrity/read-back pass |

Ảnh/log/JSON nằm trong các thư mục `apps/game-client/temp/{chapter-one-qa,campaign-qa,stack-qa}` và `temp/private-room-qa`; các artifact không commit. `assetTransferBytes` trên mẫu stack khoảng 15,8 MB, tính toàn bộ resource tải cold trong session, không phải dung lượng sprite nén duy nhất. Heap thay đổi do GC; mẫu ngắn không chứng minh không leak. Load test không mô phỏng WAN hoặc 30 phút nóng máy.

## Gate chưa thể nghiệm thu trong workspace

1. **VPS/Docker/MySQL staging/TLS**: chưa chạy triển khai VPS thật hoặc xác nhận backup/restore trên môi trường Docker staging. Kiểm thử MySQL Laragon trước đó không thay thế nghiệm thu staging. Xem `deploy/README.md`.
2. **Intel HD/UHD, điện thoại thật/Safari và soak 30 phút**: máy hiện tại là AMD; mobile đã test bằng Chromium emulation. Cần chạy trên thiết bị mục tiêu, đo cả nhiệt, RAM, băng thông và FPS dài.
3. **Review giáo dục/văn hóa/art/audio và trẻ có giám sát**: chưa có chuyên gia/nhóm thử/consent. Nội dung, Ô ăn quan theo biến thể cố định và tranh làng nghề tự vẽ phải được kiểm. Không mô tả tranh placeholder là bản Đông Hồ xác thực. TTS tùy voice Việt của thiết bị; chưa có bộ audio thu âm/licensing.
4. **Vận hành beta**: owner xử lý report, chính sách retention/backup, quy trình hỗ trợ và kiểm tra pháp lý cần người chịu trách nhiệm. Không mở public beta tự động. Caddy gate bảo vệ UI staging; API vẫn áp dụng bearer auth/rate limit riêng và socket yêu cầu signed ticket.
5. **Mức độ hoàn thiện sản phẩm**: đây là full campaign prototype. Trang trí nhà chỉ là palette, NPC mới vẫn placeholder, minigame chủ yếu dùng Graphics/nút lớn, asset chung không streaming qua nhiều scene. Repository JSONB single-row phù hợp staging nhỏ, cần tách bảng/index trước quy mô nhiều phòng/production. Không coi các chi tiết này là art/gameplay production đã được nghiệm thu.

Các gate này không được ghi pass hoặc tự đổi content sang approved. Có thể chơi thử và review bản build ngay; việc hoàn thành prototype không đồng nghĩa đã hoàn thành phát hành beta thương mại.
