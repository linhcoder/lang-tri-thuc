# M0 Audit / M1 hardening

Ngày: 09/10/2026. Baseline Git: `cf910ac` trên `main`; commit này đã có trên `origin/main` ở lần kiểm tra trước. Đợt hiện tại không commit/push. File master prompt người dùng cung cấp vẫn là untracked, không sửa.

## Cấu trúc và phiên bản

```text
apps/game-client/
  assets/scenes/VillageScene.scene (+ .meta)
  assets/scripts/core/VillageBootstrap.ts
  assets/scripts/player/PlayerController.ts
  assets/scripts/npc/FarmerNPC.ts
  assets/scripts/world/{VillageModel,LearningProgress,VillageArt}.ts
  assets/scripts/ui/LearningPanel.ts
  assets/scripts/network/VillageNetwork.ts
  assets/resources/village/ (8 PNG + .meta)
  assets/resources/vendor/colyseus.txt (+ .meta)
  assets/{maps,prefabs,animations,audio,textures}/
  settings/v2/packages/, build-web.json, tsconfig.json
  tests/{milestone01a,browser-smoke,build-smoke}.cjs
apps/game-server/
  src/{main,VillageRoom}.ts
  tests/{room,production}.test.ts
  package.json, tsconfig.json
tools/{build-web,serve-web,browser-path}.cjs
package.json, package-lock.json, README.md
docs/ (mới trong M0)
```

Các thư mục maps/prefabs/animations/audio/textures đã có nhưng chưa chứa hệ thống gameplay data/prefab/clip/audio được dùng. `.meta` thư mục không chứng minh tính năng đã có. Map và UI hiện xây bằng TypeScript tại runtime.

Client package creator 3.8.8, SDK 0.18.5. Server core 0.18.9/schema 5.0.36/ws-transport 0.18.4, TypeScript 5.9; môi trường Node 24.13.0. Server build ESM; production test riêng tránh lỗi split CJS/ESM matchmaker đã sửa trước đây. Root workspace npm có scripts check:client/test:client/test:server/server:build/web:build/web/test:web.

Scene UUID `c1ee127e-883a-4ebc-8fac-969a61c11dd8`; Canvas 1280 × 720, UI camera và VillageBootstrap hợp lệ theo test scene references. Không đổi scene/prefab/meta/engine config trong M0/M1; Cocos CLI có thể thay line endings nhưng diff nội dung config phải rỗng.

## Tính năng và bằng chứng

| Phần | Code hiện có | Mức xác nhận |
| --- | --- | --- |
| Isometric | 40 × 40, 64 × 32, terrain/collision objects | Round-trip 1.600 tile, A* so BFS, browser render |
| Movement | WASD/arrows/click/touch/analog joystick, slide, bounds | Harness + keyboard/touch browser |
| Camera/depth | World translation, rectangular clamp, chunk cull, actor y-sort | Render browser; chưa kiểm mọi góc bằng mắt trên hardware thật |
| Art | 8 PNG, child 24 frame, sprite đình/nhà/cây/NPC/lúa | Engine import/build, browser asset-ready; chưa review từng frame văn hóa |
| NPC | Một Bác Nông Dân, path đến ô cạnh, modal có đóng | Harness + browser interaction |
| Demo learning | 3 bó lúa → 3 câu đếm hoặc cộng → 3 bài rải → badge | Flow đếm/rải/reload browser; mode cộng có code nhưng chưa E2E riêng |
| Save | Local v1, validate corrupt state | Unit + complete reload browser; chưa test storage full/disabled bằng browser |
| Multiplayer | VillageRoom 16 slot, position validation/interpolation/rejoin | Hai client và browser; chưa benchmark 16, không server reward |
| Audio/chapter/data engines | Chưa có | Không coi hoàn thành |
| Parent/backend/admin | Chưa có | Không coi hoàn thành |

Nhà, đình, cây và ao là décor/collision, chưa tương tác. Chưa có avatar selection/wave/cheer, Ông Đồ, intro/ending chương, trigger/portal/streaming, journal/inventory, EducationEngine, QuestEngine chung, reward ledger hay 12 mini game hoàn chỉnh. Prototype bài rải không có capture/end/AI của Ô ăn quan.

## Lỗi và khoảng trống ưu tiên

| ID | Vấn đề | Xử lý/gate |
| --- | --- | --- |
| M1-INPUT-01 | NPC route mới không xóa pending harvest cũ | Sửa trong đợt M1, chỉ khi route mới hợp lệ |
| M1-INPUT-02 | Joystick takeover hủy route nhưng giữ pending harvest | Sửa khi joystick nhận ownership, kể cả chạm tâm |
| M2-STORY-01 | Demo thu hoạch 3 bó không đúng Chương 1 trồng 5 cây | M2 thiết kế gameplay + migration, không đổi tên giả |
| M3-EDU-01 | Answer đúng luôn nằm giữa, evaluator nhận expected từ UI | M3 engine/seeded choice; M4 server validation |
| M4-SAFE-01 | Room dev/query endpoint không parent auth/private/block/report | Chặn public trẻ online cho đến nghiệm thu M4/M8 |
| M4-NET-01 | Budget tốc độ không packet flood limiter, reward local | M4 packet/join limits + authoritative results/reward |
| M4-REJOIN-01 | Test rejoin hiện gọi room.leave; không chứng minh mọi transport outage/khôi phục vị trí cũ | M4 disconnect/delay/backoff tests |
| M9-PERF-01 | Texture lớn tải đồng thời, chưa quality tiers/Intel/phone/load benchmark | Đo và tối ưu theo target, không hứa FPS mọi máy |

Các phần thiếu là backlog, không đồng nghĩa crash hiện tại. `canStand`/camera map cố định là thiết kế prototype; data-driven refactor nằm ở M3 sau M2 slice, tránh sửa ồ ạt.

## Thay đổi M1 nhỏ

Chỉ hai nhánh input của VillageBootstrap: nhận route NPC thành công xóa pendingBundle; joystick ownership xóa pendingBundle cùng NPC/path. Nếu không tìm được route NPC, giữ harvest intent đang có. Thêm hai regression test gọi hành vi thật của bootstrap; test mới đã fail trên baseline (`1 !== null`) trước sửa rồi pass sau sửa. Save/schema/map/camera/network không thay đổi.

## Kiểm thử đợt này

- Baseline: `npm run check:client` đạt, `npm run test:client` 17 nhóm đạt, `npm run test:server` build + 3 test đạt.
- Sau M1: client strict đạt; 19 nhóm test client đạt, gồm hai test ownership mới.
- `npm run web:build`: Cocos Creator 3.8.8 CLI thật, xuất index.html thành công; không dùng renderer giả.
- `npm run test:web` trên build M1: desktop harvest/count/sow/reward/reload, mobile touch/joystick/dialogue/rotation và hai browser sync/leave/rejoin đều đạt; không có lỗi JavaScript. Mẫu đo 5 giây: 60,02 FPS, p95 17 ms, 48 draw calls, JS heap 22,5 MB, 20 chunk active trên AMD Radeon/D3D11. Heap phụ thuộc thời điểm GC, không phải tổng GPU/process memory. JSON và screenshots sinh tại `apps/game-client/temp/release-qa/` (Git ignored).
- Không chạy GUI Editor tự động, không thử trẻ em có giám sát, không có phone thật/Intel trong môi trường hiện tại. Môi trường trước đã xác nhận AMD Radeon và không có phone ADB; browser Android chỉ là giả lập.

Chạy test bằng harness không thay browser engine. Chi tiết checklist Editor và commands ở [QA_TEST_PLAN.md](QA_TEST_PLAN.md). Build/script checks không là review giáo dục hay security certification.

## Bộ tài liệu M0

- [GAME_DESIGN_DOCUMENT.md](GAME_DESIGN_DOCUMENT.md): gameplay, bản đồ, 12 game theo giai đoạn, UX và progress.
- [STORY_BIBLE.md](STORY_BIBLE.md): 8 chương, quest IDs, mở khóa, mẫu dialogue và kết nối gameplay/save.
- [TECHNICAL_DESIGN.md](TECHNICAL_DESIGN.md): hiện trạng/API đích, engines, save/network/performance.
- [EDUCATION_CONTENT_PLAN.md](EDUCATION_CONTENT_PLAN.md): nhóm tuổi, lesson, review, nguồn và content gates.
- [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md): M0–M9, scope/dependency/acceptance/risk/test Editor.
- [ASSET_STYLE_GUIDE.md](ASSET_STYLE_GUIDE.md): art/pivot/atlas/provenance/ngân sách.
- [QA_TEST_PLAN.md](QA_TEST_PLAN.md): commands và checklist engine/browser/hardware/content.
- [CHILD_SAFETY.md](CHILD_SAFETY.md): private rooms, parent controls, data và release gates.

## Tiếp theo

Đề xuất M2 đúng Chương 1: Ông Đồ, trồng 5 cây, học đếm 1–5, sao đầu và migration local save. Chờ người dùng xem M0/M1 và xác nhận; chưa triển khai M2 hoặc các chương còn lại, DB/admin/VPS trong đợt này.
