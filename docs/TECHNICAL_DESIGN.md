# Technical Design

10/10/2026 — visual pipeline mới: [Art direction](design/ART_DIRECTION.md), [registry/manifest](design/ASSET_MANIFEST.md), [báo cáo sáu milestone](design/VISUAL_UPGRADE_REPORT.md). Map vẫn 40×40/64×32; bố cục/footprint/NPC/portal đã đổi, contentVersion thêm walkability và portal spawn. Cần chạy client/API/server cùng bản. Các snapshot M0 bên dưới là lịch sử.

09/10/2026. Phần “hiện tại” là snapshot audit M0 trước M2; phần “đích” là proposal. Thay đổi Chương 1/save/input/resize mới nằm ở [MILESTONE_M2.md](MILESTONE_M2.md). Không tạo thêm service ở M0/M1/M2.

## Kiến trúc hiện tại sau prototype tám chương

Client gồm ChapterOneProgress/Save, CampaignEngine/Save, EducationEngine, MiniGameRules/Registry, WorldZones và VillageHub. Server có VillageRoom development, PrivateFriendRoom và MiniGameRoom; online xác nhận action và reward phía server. Fastify API và React admin/phụ huynh đã triển khai. Runtime dùng MySQL Laragon hoặc MySQL 8.4 Docker với snapshot JSON single-row, transaction/row lock; SQLite chỉ phục vụ test và migration legacy. Redis chưa cần cho một instance. Xem [bàn giao](DELIVERY_FULL_PROTOTYPE.md) và [MySQL](MYSQL_LOCAL.md) để chạy bản hiện tại.

## Snapshot audit M0 — lịch sử

- Cocos Creator 3.8.8, TypeScript, scene `assets/scenes/VillageScene.scene`, Canvas 1280 × 720. Bootstrap đã gắn, tạo world/HUD/NPC runtime.
- `VillageModel`: map cố định 40 × 40, diamond 64 × 32, 5 terrain, objects có footprint; A* bốn láng giềng, cost bằng nhau; `canStand` bốn mẫu quanh chân.
- `PlayerController`: speed 150 world px/s, dt cap 0,1 s, substep ≤2 px, manual slide theo cạnh iso, path recenter, direction 0…7.
- `VillageBootstrap`: mouse chuyển thành touch của Cocos, gesture ownership, header/modal, camera dịch world dưới Canvas, chunk culling, y-sort theo chân.
- `VillageArt`: 8 texture tải cùng lúc, child sheet 8 × 3, 25 chunk canvas/texture 8 × 8; chưa có streaming theo khu hay atlas environment.
- `LearningProgress` version 1: state welcome/collect/count/sow/complete, localStorage `lang-tri-thuc.learning.v1`; chỉ một flow thử nghiệm, reward local và có thể chỉnh qua DevTools.
- Colyseus core 0.18.9/schema 5.0.36/ws-transport 0.18.4/SDK 0.18.5; browser bundle official là TextAsset local. Server ESM, chung model collision; 16 slot, patch 50 ms. Client gửi tọa độ, server kiểm giới hạn tốc độ và tuyến, interpolation phía người xem.
- Chưa có Fastify, DB, auth, server quest/reward, minigame room, parental access hay moderation. Vận tốc budget hiện tại không phải packet-rate limiter.

## Toạ độ và thứ tự vẽ

Grid `(gx, gy)` → world `(32(gx−gy), −16(gx+gy))`. Ngược: `(wx/64−wy/32, −wx/64−wy/32)`. Tile là tâm diamond, làm tròn grid. Không dùng screen pixel trực tiếp cho collision; input đi qua UITransform về world.

Depth sort sibling: y lớn trước, y nhỏ sau, gốc chân cho sprite. Footprint map chặn nhà/đình/cây và NPC, không suy collision từ alpha PNG. Camera hiện clamp bounding rectangle, vì map diamond nên ở góc có thể thấy nền ngoài map; đây là lựa chọn prototype, không phải lỗi vượt collision.

## Kiến trúc đích và thứ tự tách

1. M1 giữ API và scene, chỉ sửa lỗi input/world đã chứng minh. Không tách hàng loạt bootstrap.
2. M2 thêm `ChapterOneProgress` pure state + `RiceCountGame` + `ChapterOneView`; dùng adapter NPC/story nhỏ, giữ flow cũ như demo riêng hoặc migration rõ ràng.
3. M3 tách `WorldDefinition`, `NpcDefinition`, `DialogueEngine`, `QuestEngine`, `EducationEngine`, `RewardLedger`, `SaveRepository`, `MiniGameRegistry`. Pure logic không import `cc`; view Cocos nhận state/event.
4. M4 tách `NetworkSession`, giao thức và policy room; server xác nhận game event/result/reward. Client chỉ đề xuất action, không tự cấp thưởng online.
5. M8 mới thêm API Fastify, PostgreSQL, admin React; Redis khi có nhu cầu nhiều process.

| Dữ liệu đích | Trường bắt buộc |
| --- | --- |
| WorldDefinition | id/version, size/tileDimensions, terrain, collision, spawns, object footprints, zones, portals, assetBundleIds |
| NpcDefinition | id/name, portrait, spawn/zone, interactionRadius, dialogueRoot, questIds, optional schedule |
| DialogueNode | id/speaker/text/voiceAsset, choices, conditions, approved actions, nextId, contentVersion |
| QuestDefinition | id/type/chapterId, prerequisites, objectives/event IDs, turn-in NPC, rewards, contentVersion |
| QuestionDefinition | id/ageBand/skill, prompt, approved answers, hint, explanation, audio, review/source metadata |
| MiniGameDefinition | id/ageBands/topics/modes, min/maxPlayers, assets, difficulty, saveVersion, implementation factory |
| SaveEnvelope | schemaVersion/contentVersion, localProfileId, quest states, game resume data, reward receipts, settings |

Dialogue action và question evaluator là whitelist; không eval JavaScript từ nội dung. Validate data reference/cycle, tất cả quest có đường hoàn thành solo. NPC schedule không được làm nhiệm vụ chính biến mất vĩnh viễn.

MiniGame lifecycle: `idle → running ↔ paused → ended`; start/pause/resume/end có thể gọi an toàn, cleanup listener/timer. Result gồm attemptId, contentVersion, learning outcomes, completed objectives; không tự ghi reward trong UI. Reward ledger key `(profile, questId, rewardVersion)` để retry/replay không cấp lặp.

## Save và migration

M2 phải quyết định kế thừa v1: không coi ba bó thu hoạch là năm cây đã trồng; giữ badge demo hoặc lưu bản backup, tạo tiến độ Chương 1 mới có thông báo ngắn. Không xóa raw save trước khi migration validate. Unknown/newer version giữ backup và cho recovery, không ghi đè im lặng. Test save sau mỗi objective, giữa mini game, trước/sau turn-in, replay và storage unavailable.

M8 server revision + idempotency key xử lý sync; không tin totalStars do client gửi. Offline receipt phải được server xác minh hoặc đánh dấu local-only, không tự đổi thành reward cạnh tranh.

## Network và an toàn

Protocol version cố định, packet schema/size validation, per-session packet token bucket, connection/join throttling, server simulation và reward validation. 10/16/20 client benchmark trước chọn capacity phát hành; 16 hiện là cấu hình, chưa là benchmark.

PrivateFriendRoom do phụ huynh tạo; invite token ngắn hạn, server kiểm quyền và room lock. Câu/emoji approved ID, rate limit/cooldown, block/report không gửi thông tin riêng. Không tự mở kết nối từ một nội dung NPC. Online URL hiện tại chỉ phục vụ dev local; chưa coi query endpoint là parental consent.

## Hiệu năng và tài nguyên

Mục tiêu p95 frame ≤33,3 ms trên GPU tích hợp mục tiêu; Low/Medium/High sẽ chọn render scale/effects/audio và asset tier. Không đổi speed/collision theo quality. Tải bundle theo khu, pool actor/FX khi có churn, reuse array cho sort nếu profiling chứng minh cần. Hiện source PNG tổng khoảng 12,4 MB, không đồng nghĩa băng thông HTTP vì có cache/compression; cần đo network thực tế.

Browser SDK đang chèn inline script local; nếu triển khai CSP nghiêm phải chuyển sang script URL cùng origin hoặc nonce phù hợp. M8 nghiệm thu CSP/TLS/cache/CORS và secret handling trước public deploy. Engine native không là mục tiêu M1, chunk painter hiện phụ thuộc canvas browser.

## Chạy và integration

`npm ci`, `npm run web:build`, hai terminal `npm run web`/`npm run server`; xem [QA_TEST_PLAN.md](QA_TEST_PLAN.md). Giữ `.meta`, scene UUID và node gốc; không tự sinh scene/prefab JSON. File build/temp/dist không commit. Phiên bản lock ở package-lock; nếu đổi dependency phải chạy production-process test vì CJS/ESM từng gây split matchmaker.
