# Làng Tri Thức
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
npm.cmd run test:stack
```

Browser tests cần web build; `test:m2`/`test:campaign` dùng server web cổng 8080 (`npm run web`); `test:stack` dùng `npm run local:stack`. `test:web` hồi quy demo cũ cần web 8080 và server dev 2567 (`npm run server`). Browser được tìm từ Chrome/Edge; có thể đặt `CHROME_EXECUTABLE`. Typecheck client cần mở Editor/build một lần để tạo `temp/declarations`.

Nếu Creator cài khác đường dẫn mặc định, đặt `COCOS_CREATOR` hoặc `node tools/build-web.cjs <đường-dẫn-CocosCreator.exe>`.

Tài liệu: [Milestone 01A](apps/game-client/MILESTONE-01A.md), [Chương 1](docs/MILESTONE_M2.md), [nguồn art](apps/game-client/ART.md), [cốt truyện](docs/STORY_BIBLE.md), [kế hoạch](docs/IMPLEMENTATION_PLAN.md), [QA](docs/QA_TEST_PLAN.md). Các tài liệu milestone cũ ghi trạng thái tại thời điểm viết; bản bàn giao mới là trạng thái triển khai hiện tại.

MySQL localhost đã chuyển dữ liệu và kiểm thử trực tiếp; xem [cấu hình Laragon / migration / backup](docs/MYSQL_LOCAL.md). `npm run test:mysql` chạy database test riêng.
