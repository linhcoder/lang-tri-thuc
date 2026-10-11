# Làng Tri Thức

Trong bản preview hiện tại, cây đa và Ông Đồ nằm phía trên bên trái; đình ở phía trên bên phải, chợ ở tiền cảnh và bác nông dân đứng cạnh trâu ở bờ ruộng. Ao mở rộng vào khung cảnh với cầu tre có thể đi qua và giếng bên bờ. Nhà bé nằm phía trên ruộng, có lối đi trống tới cửa nhà. Các điểm đến trên bản đồ dùng cùng bố cục này. HUD dùng bảng tối trong suốt, biểu tượng không có khung dày và nút zoom nằm trong bản đồ nhỏ trên desktop.

**Preview bố cục theo ảnh thiết kế:** chân dung, checklist theo tiến độ thật, sổ chương dưới bản đồ và bong bóng thoại có thể chạm để tới NPC. Thanh biểu cảm có Chào, Vui mừng, Vẫy tay, Ngồi, Khóc và Nhảy; màn hình nhỏ mở qua **Menu → Biểu cảm**. Di chuyển tự dừng biểu cảm và trả nhân vật về tư thế thường. Nút **Di chuyển** trên desktop bật/tắt joystick dùng được bằng chuột; điện thoại vẫn có joystick cảm ứng. Bản đồ nhỏ dùng hình công trình thật, bờ ao có nước chuyển màu, lá sen và đường bờ mềm hơn. Cây đa lớn hơn, nhà bé và Cô Tấm ở phía phải. Các công trình tải muộn dùng renderer riêng để hiển thị đúng. Bộ art hiện tại vẫn chưa giống hoàn toàn ảnh tham chiếu.

Nếu Windows khóa thư mục build cũ, có thể build và chạy preview riêng:

```powershell
$env:GAME_BUILD_NAME='reference-complete-v6'
npm.cmd run web:build
$env:WEB_PORT='8081'
npm.cmd run web
```

Mở `http://127.0.0.1:8081/`. QA bản preview: `$env:GAME_WEB_URL='http://127.0.0.1:8081/'; npm.cmd run test:visual`, rồi `npm.cmd run test:reference` và `npm.cmd run test:assets`. Khi chạy online cần build game server cùng phiên bản vì vị trí bản đồ và danh sách biểu cảm cùng tham gia kiểm tra tương thích. Nền cỏ mở rộng ngoài khu chơi để không lộ nền màu phẳng ở mép bản đồ; giới hạn đường đi giữ nguyên. Màn hình rộng có ô sao và tiến độ riêng, dùng số liệu thật. Bộ minh họa công trình, NPC và nhân vật đã được thay đồng bộ; cây đa dùng ảnh riêng có độ nét cao. [Chi tiết thay đổi](docs/design/REFERENCE_COMPLETION.md), [prompt và nguồn imagegen](docs/design/reference-completion-prompts.json). Bấm bảng nhiệm vụ để đi tới mục tiêu; mở mục phụ huynh qua Cài đặt. Camera desktop giữ bố cục trung tâm và chừa vùng HUD khi theo nhân vật. `GAME_BUILD_NAME` không đặt vẫn dùng `web-desktop` như trước.

**Tỷ lệ và zoom:** người trong làng/online đã thu về 78% kích thước cũ, giữ tên và vùng chạm. Dùng **− / +**, bấm tỷ lệ để về **100%**, lăn chuột hoặc chụm/tách hai ngón trên cảnh; giới hạn **60–180%**. HUD giữ kích thước, zoom lưu theo trình duyệt. [Phần còn phát triển](docs/DEVELOPMENT_BACKLOG.md).

**Staging aaPanel đã chạy:** [ltt.vui-hoc.xyz](https://ltt.vui-hoc.xyz/) (phụ huynh/admin), [game](https://ltt.vui-hoc.xyz/game/). Giao diện có mật khẩu preview; thông tin truy cập sinh riêng nằm trong file local ignored `temp/deploy/access.txt`. [Runbook aaPanel](deploy/aapanel/README.md). Đã kiểm tra HTTPS, signed WebSocket hai client, MySQL-compatible MariaDB, save/reload và backup/restore. Nội dung vẫn draft, chưa nghiệm thu beta công khai.
## Hoàn thiện ngày 10/10/2026

Danh sách đối chiếu yêu cầu và giới hạn thực tế: [COMPLETION_CHECKLIST](docs/COMPLETION_CHECKLIST.md). Chọn nhân vật → **Kiểu tóc** có hai lựa chọn riêng cho mỗi avatar, lưu và đồng bộ online. Túi sao → **Luyện / lễ hội** mở sau tám sao; luyện không cấp lại sao truyện. Làng có thêm giếng, lũy tre, cầu tre, trâu, gà, vịt, vườn rau và cổng.

Admin có form sửa chương/quest title, câu hỏi theo tuổi/kỹ năng, tên/vị trí sáu NPC truyện và metadata 24 asset; sửa đưa về draft, review/audit và xuất gói JSON. Hướng dẫn kiểm tra/import và build đồng bộ nằm trong checklist. Nội dung chưa được người biên tập phê duyệt cho phát hành.

QA bổ sung: `npm.cmd run test:drag`, `npm.cmd run test:admin`, `npm.cmd run test:avatars`, `npm.cmd run test:assets`, `npm.cmd run test:campaign`, `npm.cmd run test:speech`. Browser test cần bản build và stack local tại game 38080/admin 35173/API 33000; admin QA chạy API fixture riêng, không sửa nội dung thật.

Dự án game giáo dục Web Multiplayer 2.5D Isometric dành cho trẻ em Việt Nam từ mầm non đến tiểu học.

## Công nghệ

- Cocos Creator 3.8.x + TypeScript
- Colyseus Multiplayer
- Node.js + Colyseus (server multiplayer)
- Fastify + MySQL (Laragon local/staging); Redis khi cần nhiều instance

## Mục tiêu

Xây dựng thế giới làng quê Việt Nam, nơi trẻ có thể khám phá, tương tác NPC, học tập và tham gia các mini game dân gian cùng bạn bè.

## Trạng thái hiện tại

Full campaign prototype đã chạy đủ tám chương, 12 mini game, NPC/nhật ký/sao, avatar/nhà/bản đồ/cổng khu, save local, phòng riêng có vé phụ huynh, Fastify API và React admin. Nội dung vẫn draft, art mới còn placeholder; chưa nghiệm thu public beta.

**Bàn giao và kết quả kiểm thử:** [prototype tám chương](docs/DELIVERY_FULL_PROTOTYPE.md). **Staging VPS:** [runbook](deploy/README.md). Gate còn lại: chuyên gia/nhóm trẻ có giám sát, Intel HD/UHD/điện thoại thật/soak và VPS/MySQL Docker live.

## Chạy offline

Node 24.13+ và Cocos Creator 3.8.8:

```powershell
npm.cmd ci
npm.cmd run web:build
npm.cmd run web
```

Mở `http://127.0.0.1:8080/`. Chương 1 mặc định; Sổ làng mở các chương tiếp sau khi nhận sao. `?demo=1` giữ demo cũ.

Đổi avatar trong game: **Người lớn → trả lời cổng → Chọn nhân vật**. Có bé trai áo đỏ/xanh và bé gái áo hồng/vàng, preview, animation đứng/đi tám hướng, lưu lựa chọn và đồng bộ hình với bạn trong phòng online. Avatar miễn phí, có thể đổi lại. Vào **Chọn khăn quàng** để dùng khăn đỏ/xanh/vàng hoặc bỏ khăn; lựa chọn độc lập với avatar, lưu qua reload và đồng bộ online.

Trong màn chọn nhân vật, **Vẫy chào / Vui mừng** chạy biểu cảm ngắn rồi tự kết thúc; di chuyển sẽ dừng biểu cảm. Dùng được offline; phòng riêng đồng bộ qua emote được server chấp nhận, giới hạn một lần mỗi 2 giây.

Đọc thoại: bật **Âm thanh** trong góc Người lớn, rồi bấm **Nghe** ở hội thoại, bài học hoặc luật/gợi ý trò chơi. Bấm **Dừng đọc** để dừng. Máy cần có giọng tiếng Việt của trình duyệt/hệ điều hành; khi thiếu giọng, game vẫn hiển thị chữ và cho thử lại. Bài học đọc cả câu hỏi và các lựa chọn.

## Chạy API, phòng riêng và trang phụ huynh

```powershell
npm.cmd run db:setup
npm.cmd run server:build
npm.cmd run admin:build
npm.cmd run local:stack
```

Mở `http://127.0.0.1:35173/`; game ở `http://127.0.0.1:38080/`. Secret/mật khẩu admin sinh trong `.env.local` bị ignore. Tạo hồ sơ và mở game bằng vé từ trang phụ huynh; game chính không tự vào room development chỉ bằng query `server`.

Trong Cocos Dashboard, mở project `apps/game-client` bằng **3.8.8**, đợi import, mở `assets/scenes/VillageScene.scene`, Preview Browser. Canvas đã có `VillageBootstrap`; không gắn trùng hoặc dựng prefab/map thủ công. Xem hướng dẫn đầy đủ ở tài liệu bàn giao.

## Kiểm thử

```powershell
npm.cmd run check:client
npm.cmd run test:client
npm.cmd run test:api
npm.cmd run test:server
npm.cmd run test:m2
npm.cmd run test:campaign
npm.cmd run test:backlog
npm.cmd run test:creative
npm.cmd run test:npc
npm.cmd run test:holidays
npm.cmd run test:stack
```

Browser tests cần web build; `test:m2`/`test:campaign` dùng server web cổng 8080 (`npm run web`); `test:stack` dùng `npm run local:stack`. `test:web` hồi quy demo cũ cần web 8080 và server dev 2567 (`npm run server`). Browser được tìm từ Chrome/Edge; có thể đặt `CHROME_EXECUTABLE`. Typecheck client cần mở Editor/build một lần để tạo `temp/declarations`.

`test:backlog` kiểm tra checkpoint luyện, sổ khám phá, huy hiệu mùa, minimap NPC/bạn và kéo camera bằng chuột/touch. Có thể đặt `GAME_WEB_URL` để kiểm tra bản build đang phục vụ. Checkpoint luyện và sổ khám phá hiện lưu theo hồ sơ local. Ngày hội theo bốn mùa của game, chưa dùng lịch âm. Xem [phần đã hoàn thiện và còn lại](docs/DEVELOPMENT_BACKLOG.md).

`test:creative` kiểm tra góc vẽ chuột/touch, hủy nét, chấm màu, lùi nét, tải lại, xác nhận xóa/phục hồi và năm hoạt động chăm góc làng. Góc vẽ mở từ menu hoặc hoạt động; chăm góc làng mở sau khi đi tới trâu/gà/vịt/mèo/vườn rau. Tranh và các bước chăm lưu theo hồ sơ local, không tăng sao truyện.

`test:npc` kiểm tra sáu NPC đi tuần, dừng gần bé, bấm tới vị trí hiện tại, hủy tiếp cận bằng phím, mobile và hai client qua vé phòng riêng thật. API/SQLite test riêng dùng cổng 26601–26602. NPC có collision theo vị trí hiện tại; Ông Đồ/Bác Nông Dân giữ vị trí Chương 1. Thay đổi này đổi hash nội dung, cần build/cập nhật cả Web, game server và API.

Nếu Creator cài khác đường dẫn mặc định, đặt `COCOS_CREATOR` hoặc `node tools/build-web.cjs <đường-dẫn-CocosCreator.exe>`.

Tài liệu: [Milestone 01A](apps/game-client/MILESTONE-01A.md), [Chương 1](docs/MILESTONE_M2.md), [nguồn art](apps/game-client/ART.md), [cốt truyện](docs/STORY_BIBLE.md), [kế hoạch](docs/IMPLEMENTATION_PLAN.md), [QA](docs/QA_TEST_PLAN.md). Các tài liệu milestone cũ ghi trạng thái tại thời điểm viết; bản bàn giao mới là trạng thái triển khai hiện tại.

MySQL localhost đã chuyển dữ liệu và kiểm thử trực tiếp; xem [cấu hình Laragon / migration / backup](docs/MYSQL_LOCAL.md). `npm run test:mysql` chạy database test riêng.

`test:holidays` kiểm tra hai chuỗi Tết/Trung thu trên desktop/mobile: chọn sai nhận gợi ý, lưu bước, tiếp tục ván sau reload, hoàn thành cả hai và giữ nguyên sao truyện. Mở Sổ ngày lễ từ menu hoặc bộ sưu tập. Đây là nội dung học quanh năm, chưa tự kích hoạt theo lịch âm; xem [thiết kế và nguồn](docs/design/TRADITIONAL_FESTIVALS.md).

Góc vẽ có nút Lưu ảnh tải PNG 1080 × 500, chỉ gồm tranh. Browser test creative kiểm tra tải ảnh thật, kích thước, màu nét và dữ liệu tranh vẫn giữ nguyên.

`npm.cmd run test:activity-sync` kiểm tra hai browser desktop/mobile với cùng hồ sơ thật: nhận tranh/ngày lễ/checkpoint, xóa trên thiết bị khác và vẽ offline rồi nối lại. `npm.cmd run test:calendar` kiểm tra ngày lễ qua mốc 00:00 giờ Việt Nam. Calendar hiện dùng dữ kiện đã xác minh cho 2026–2028, giữ học quanh năm khi ngoài phạm vi. NPC có atlas 24 khung đi/chào; trò ghép tranh dùng tranh gà–hoa tự vẽ.

Đóng gói staging sau khi build game và admin với URL staging: `python tools/prepare-release.py --build completion-v1`. Archive và SHA-256 tại `temp/deploy/completion-release.*`, gồm source working tree và public game/admin, loại secret/cache. Phải cập nhật cả API/server/client vì rules 6; giữ DB/secret và release trước để rollback.