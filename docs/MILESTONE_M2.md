# M2 — Ngày Về Làng / Trồng Lúa – Học Đếm

## Phạm vi hoàn thành

Chương 1 là luồng mặc định: intro hư cấu → chào Ông Đồ → nhận việc của Bác Nông Dân → trồng năm cây ở năm ô khác nhau → ba câu đếm 1–5 → về Ông Đồ nhận một Sao Tri Thức → đoạn kết và luyện lại. Không phải hoàn thành bài rải hạt để mở cờ Chương 2.

Ông Đồ là placeholder Graphics có mặt/râu/áo/mũ và tên, đứng cạnh cây đa; chưa có sprite AI mới. Cây đa hiện ngôi sao xám trước completion và vàng khi nhận sao. Nút **Tới mục tiêu** tìm đường A* đến NPC/ô trồng tiếp theo, hỗ trợ màn hình hẹp. NPC/cây trồng có vị trí và collision thống nhất giữa client/server; cây lúa nhỏ là hình học và đi qua được, NPC chặn tile.

Nội dung Chương 2 chưa được triển khai; hoàn thành Chương 1 chỉ ghi cờ mở trong cốt truyện. Không có portal sang một chương giả hoặc UI giả vờ đã chạy tám chương. Nội dung draft tự soạn chưa được giáo viên/người biên tập chuyên môn nghiệm thu trước beta.

## File và kiến trúc

- `ChapterOneProgress.ts`: pure state, thứ tự unlock, năm plot IDs, round, receipt sao duy nhất, replay không xóa completion.
- `RiceCountGame.ts`: pure evaluator ba câu, choices có vị trí đáp án khác nhau, đáp án do logic xác định thay vì nhận expected từ UI.
- `ChapterOneSave.ts`: storage adapter, key v2 riêng, giữ raw save legacy/corrupt/future, warning khi không ghi được.
- `ChapterOneView.ts`: elder/plots/star Graphics, modal hội thoại/count/replay, nút Nghe/Dừng đọc, tương tác/cancel.
- `VillageBootstrap.ts`: tích hợp view mặc định, input ownership, status/HUD và nút mục tiêu; giữ demo mode.
- `tools/build-web.cjs`: bỏ viền template web để canvas chiếm đúng viewport. Bootstrap reapply resolution policy và resize render window/camera bằng API công khai khi viewport đổi; modal che/hide nút mục tiêu, không bị HUD đè nội dung.
- `VillageModel.ts`: tile Ông Đồ bị chặn chung client/server. Không đổi kích thước map hoặc scene.
- `tests/milestone01a.cjs`: kiểm logic Chương 1/save/replay/legacy/corrupt/future/storage.
- `tests/chapter-one-web.cjs`: production browser flow, reload từng bước, mobile, migration.
- `tests/build-smoke.cjs`: tiếp tục test flow demo bằng `?demo=1` và multiplayer.

Các script mới có `.meta` do Cocos CLI import thật. Scene, prefab và `.meta` có sẵn giữ nguyên. Không commit/push.

## Điều khiển và đọc thoại

Click/chạm Ông Đồ hoặc bác → nhân vật đến cạnh rồi mở hội thoại. Click/chạm tâm ô đất sáng → nhân vật đến nơi mới trồng; chạm lặp không tăng số cây. Manual/WASD/joystick, mất focus hoặc chọn đường mới hủy mục tiêu cũ. Modal chặn input world; Đóng/Esc không mất tiến độ.

Nghe chỉ phát khi người dùng bấm, chọn giọng `vi` có sẵn trong browser/OS; Dừng đọc/đóng/chuyển thoại hủy phát. Nếu không có giọng Việt, hiện thông báo và giữ nguyên chữ để đọc cùng người lớn. Đây là speech synthesis tùy thiết bị, chưa là voice-over Việt được thu/biên tập. Không có microphone và không chấm phát âm. Cần nghe thủ công trên thiết bị có voice Việt; kiểm browser headless không chứng minh audio nghe đúng.

## Save và migration

Key mới `lang-tri-thuc.chapter-one.v2`; key cũ `lang-tri-thuc.learning.v1` không bị xóa/sửa khi chơi Chương 1. Nếu demo cũ thực sự complete theo validator, v2 lưu `legacyDemoBadge`; không biến ba bó lúa demo thành năm cây trồng hoặc sao chương. Thông báo intro giải thích tiến độ mới riêng biệt.

Corrupt/unsupported save v2 giữ raw ở `.recovery` (và `.recovery.latest` khi cần) trước ghi state mới; nếu backup thất bại thì không ghi đè original. Save future version >2 được giữ nguyên, chơi session-only và cảnh báo. Storage đọc/ghi bị chặn hoặc full không crash gameplay; HUD báo chưa lưu được. Không thể hứa persistence khi browser không cho ghi.

Progress ghi sau intro/greet/accept, từng cây, từng câu đúng, nhận sao và replay. Sai/gợi ý không giảm state. Restore chuẩn hóa duplicate/out-of-range và prerequisites; đây là validation local chống lỗi dữ liệu, không chống DevTools/gian lận online. Sao/reward vẫn local, server authoritative reward là M4.

## Chạy và thao tác Editor

Từ root:

```powershell
npm ci
npm run web:build
npm run check:client
npm run test:client
npm run test:server
```

Terminal khác `npm run web`, mở `http://127.0.0.1:8080/`. Chương 1 chơi offline, không cần server. Demo cũ: `http://127.0.0.1:8080/?demo=1`. Server `npm run server` chỉ cần khi test online; query `?server=http://127.0.0.1:2567` vẫn là dev multiplayer, chưa có parental/private-room protection.

`npm run test:m2` cần web build + web server; `npm run test:web` cần web và multiplayer server, chạy hồi quy demo cũ. Chrome/Edge được tự tìm hoặc cấu hình `CHROME_EXECUTABLE`. Artifact M2 ở `apps/game-client/temp/chapter-one-qa/`, demo/multiplayer ở `temp/release-qa/` (ignored).

Editor 3.8.8: mở project `apps/game-client`, đợi import, mở `assets/scenes/VillageScene.scene`; Canvas đã có VillageBootstrap, không gắn thêm component hoặc chỉnh scene. Preview in Browser, bấm Vào làng, dùng Tới mục tiêu/joystick/click. Nếu Editor đang giữ scene cũ, reload/reopen trước khi thao tác, không save đè scene repo. Test thủ công Nghe/Dừng đọc và mobile thật theo [QA_TEST_PLAN.md](QA_TEST_PLAN.md).

## Nghiệm thu và phần chưa kiểm

TypeScript client strict đạt; `test:client` 24 nhóm đạt, gồm gating, năm cây duy nhất, reload round/replay, sao idempotent, migration, corrupt/future/storage failure. Server build và ba test (bao gồm production process join) đạt. Cocos CLI build thật hoàn tất, không đổi scene/config/meta có sẵn.

Browser production đã đi hết chapter desktop/mobile, reload sau cây 1/4, giữa bài và replay, đáp án sai/gợi ý, sao duy nhất, raw legacy giữ nguyên, future save session-only và corrupt save backup. Hồi quy demo cũ/multiplayer hai browser cũng đạt. Lượt M2 cuối đạt đủ năm nhóm E2E, không có lỗi JavaScript; ảnh/modal sau resize đã kiểm lại, render window bằng canvas, nút chạm ≥44 CSS px, HUD không che thoại và Đóng hoạt động sau xoay ngang.

Đo 5 giây ở viewport desktop 1280 × 720 sau replay: 60,10 FPS, p95 16,8 ms, 46 draw calls trên AMD Radeon/D3D11. JS heap lượt cuối 81,2 MB; các lượt trước khoảng 48–80 MB tùy GC/các lần reload, không phải tổng RAM/GPU hay bằng chứng không leak. Chưa làm soak 30 phút hoặc benchmark máy mục tiêu; không cam kết 60 FPS trên Intel/phone.

Không dùng harness `cc` thay engine rendering. Editor GUI/Intel HD/UHD/điện thoại thật/giọng Việt nghe thực tế và review trẻ có giám sát chưa được kiểm trong môi trường này. Đã smoke nút Nghe/Dừng đọc và fallback browser, không coi đó là nghiệm thu giọng/audio chuyên môn.

## Bước tiếp theo

M3: chuyển slice đã ổn định sang Quest/Dialogue/Reward/Education data-driven, validators, nhật ký và UX phụ huynh local. Chờ xác nhận milestone, không bắt đầu database/admin hoặc mở public online cho trẻ ở M2.
