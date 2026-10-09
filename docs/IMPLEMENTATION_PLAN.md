# Implementation Plan

## Đợt hoàn thiện hiện tại — 09/10/2026

Phạm vi người dùng xác nhận: sửa lỗi bản hiện tại, cập nhật tài liệu theo MySQL và kiểm thử lại offline/online. Sửa demo rải hạt để giữ kết quả cả câu cuối trước màn huy hiệu; bổ sung test hồi quy. Cập nhật tài liệu kiến trúc/an toàn/bàn giao và bỏ qua thư mục sinh tự động. Không commit/push trong đợt này. Những mô tả chỉ đạo và mốc M0–M9 bên dưới là lịch sử/lộ trình, không thay thế phạm vi đợt hiện tại.

Acceptance: client strict/test, build Cocos/API/admin, integration API/server/MySQL và browser demo/Chương 1/campaign/phụ huynh đạt. Các gate thiết bị thật, chuyên gia nội dung và VPS vẫn chưa được nghiệm thu.

## Lộ trình và chỉ đạo lịch sử

Chỉ đạo mới của người dùng sau M2: tiếp tục các phần còn lại và commit để lưu thay đổi, không cần dừng xác nhận giữa milestone. Quy tắc chờ xác nhận/không commit bên dưới là kế hoạch lịch sử, được chỉ đạo này thay thế. Vẫn không tự push, không khẳng định nghiệm thu thiết bị/nội dung hoặc VPS khi chưa có bằng chứng.

09/10/2026. Baseline `cf910ac`. M0/M1 đợt này không commit/push. Mỗi milestone kết thúc bằng báo cáo, build/test cụ thể và chờ người dùng xác nhận trước milestone tiếp theo.

M0/M1 đã báo cáo; người dùng đã yêu cầu tiếp tục M2. Slice Chương 1 và kết quả nghiệm thu ở [MILESTONE_M2.md](MILESTONE_M2.md). Những yêu cầu chờ xác nhận ở phần M1 ghi lại gate đã qua; M3 vẫn chờ xác nhận.

## M0 — Audit và bộ thiết kế (đợt hiện tại)

Deliverables: audit thực tế và tám tài liệu được master prompt yêu cầu. Acceptance: phân biệt implemented/design, Story Bible đủ 8 chương với quest IDs/intro/unlock/NPC/lesson/reward/save/end, nêu rõ gaps an toàn/nội dung/performance, kiểm tra code và test baseline. Dependency: repo và engine đã có. Rủi ro: nhầm prototype ba bó lúa là Chương 1; phòng 16 slot bị hiểu là đã benchmark; nội dung AI bị coi là đã duyệt. QA: đọc asset/scene/meta, TypeScript/client/server test; ghi thông tin run và môi trường trong audit.

## M1 — Ổn định interaction/world (đợt hiện tại, phạm vi nhỏ)

Giữ map, camera, controller và scene đã chạy; không refactor toàn bộ bootstrap. Sửa quyền sở hữu thao tác khi đang tới bó lúa mà chuyển sang NPC/joystick: lệnh mới thay lệnh cũ, không giữ pending harvest. Giữ lệnh cũ nếu điểm đến mới không hợp lệ. Acceptance: không nhặt nhầm sau hủy; một input owner; không regression A*/collision/modal/save/multiplayer. Dependency: M0 audit. Tests: regression controller/input + Cocos build và browser end-to-end. Editor: mở scene, kiểm Canvas/bootstrap, thử NPC/joystick và ao. Không sửa `.meta`/scene/cấu hình engine.

Sau M1 dừng và chờ xác nhận M2. Chưa đổi save version, chưa thêm NPC/portal/chapter ở đợt này.

## M2 — Chương 1 + Trồng Lúa – Học Đếm

Dependency: M1 nghiệm thu, kịch bản Chương 1 được chấp nhận. Scope: Ông Đồ, intro/end, năm ô trồng duy nhất, ba câu đếm, sao đầu, local save/migration demo v1. Tách pure progress/game state, Cocos view; có fallback ảnh và bản đọc. Acceptance: đi hết `q.ch01.greet/plant/count/return` offline; sao cấp một lần; save giữa 0…5 cây/round/turn-in/replay; corrupt save recover; dialogue đóng được; không phải rải hạt để mở Chương 2. Risks: migration mất badge cũ, audio browser không có giọng, ray hit vùng NPC. Tests: state transition và duplicate events, migration fixtures, browser flow/reload/mobile; Editor đọc/click Ông Đồ và năm cây. M2 không triển khai trọn QuestEngine tổng quát hay DB.

## M3 — Data-driven engines + UX phụ huynh local

Dependency: M2 stable slice. Scope: Quest/Dialogue/Reward/Education/MiniGameRegistry, validators, journal, ageBand/settings/audio controls, vùng phụ huynh local có gate phù hợp. Acceptance: Chương 1 chuyển sang data không đổi behavior; content draft bị chặn; reward ledger idempotent; quest/dialogue reference không thiếu/cycle khóa progress; setting lưu và có reset/export rõ. Risks: overengineering/schema drift; parental gate local không phải auth server. Tests: data graph, engine invariants, save migration, settings/UI chạm; Editor chọn hồ sơ và xem nhật ký. Không tạo tài khoản/DB ở M3.

## M4 — Multiplayer và kiểm soát trẻ em

Dependency: M3 + [CHILD_SAFETY.md](CHILD_SAFETY.md) được review. Kế thừa VillageRoom hiện có, không coi đã hoàn tất. Scope: private friend room, parent opt-in, approved emote/message IDs, block/report, server action/reward validation, per-packet rate limit, reconnect đúng vị trí. Acceptance: offline không gọi network; join cần quyền; invite invalid/expired bị từ chối; không payload text tự do; spam bị giới hạn; reward client giả bị từ chối; NPC thay bạn vắng. Benchmark 10/16/20 client với latency và churn; chọn capacity theo số đo. Risks: room guess, token leak, dữ liệu báo cáo, patch/bandwidth. Tests: hai browser + load test + authorization/abuse; Editor xác nhận online status và trở lại offline.

## M5 — Sân Đình

Dependency: M3, M4 chỉ bắt buộc cho mode online. Chia M5A Ô ăn quan (rule set công bố, NPC solo, capture/end/stalemate/save), M5B Kéo co (nhịp chậm, không click frenzy, NPC team), M5C Nhảy sạp tùy chọn. Acceptance mỗi trò lifecycle/resume/end và reward đúng, hướng dẫn luật được review, không cần thắng để hoàn thành chương. Risks: biến thể luật, AI kéo dài ván, accessibility nhịp. Tests: golden rule cases, trận NPC có kết thúc, hai browser khi online, pause/tab hide; Editor tutorial một ván.

## M6 — Chợ và Trường Học

Dependency: M3, Chapter2 completion. M6A Chợ/phân loại/token, M6B chữ và Toán, M6C từ Anh/audio. Mỗi phần có pack nội dung được duyệt, ageBand và save. Acceptance: chương 3/4 hoàn thành solo, đáp án không luôn ở giữa, nút nghe lại và gợi ý, không thu mic; phụ huynh đổi mức được. Risks: chất lượng vần/audio, phân loại mơ hồ, font. Tests: pack validators + đáp án, browser từng nhóm tuổi, Editor bố cục mobile và audio unavailable.

## M7 — Nghề, Mùa Vàng, Lễ Hội và kết

Dependency: M5/M6 đã nghiệm thu, nguồn/giấy phép art. Chia M7A chương5 gốm/tranh; M7B chương6 chăm/thu hoạch; M7C chương7 đèn/câu đố; M7D chương8 tổng hợp/end. Acceptance từng chương có intro/unlock/quest/save/reward/end và solo fallback; không buộc chờ ngày lễ hay cây chết khi vắng; cả tám sao unique. Risks: content quá tải, dụng cụ nguy hiểm, mô tả phong tục sai. Tests: full chapter graph, replay/migration, image/audio licensing review; Editor đi từng portal và đoạn kết có skip.

## M8 — Backend/admin/deploy

Chỉ bắt đầu khi gameplay ổn định và parental/safety spec được review. Fastify/PostgreSQL cho account phụ huynh/profile/progress/content/reward; Redis chỉ khi nhiều instance có nhu cầu. Admin React/TS có role, content draft/review/publish, asset provenance, report queue/audit. Acceptance: authentication/authorization, backup-restore, idempotent sync, deletion/retention, moderation ownership, TLS/CSP/CORS và rollback, staging chạy trước VPS. Risks: luật trẻ em từng thị trường, vận hành báo cáo, secret/PII. Test security/API/migrations/load; Editor trỏ staging explicit, không hardcode production secrets. Public deploy cần xác nhận riêng khi có bản staging review được.

## M9 — Beta

Dependency: M8 nếu beta online; offline beta vẫn cần content/safety/accessibility review. QA trẻ có giám sát, consent, kế hoạch ghi nhận không định danh; Intel HD/UHD và điện thoại thật; Low/Medium/High; số đo tải/băng thông/bộ nhớ/FPS dài. Acceptance: p95 ≤33,3 ms trên danh sách máy mục tiêu ở Low, không save loss, chapter completion, không blocker safety; known issues/rollback/support. Không dùng headless AMD 5 giây thay nghiệm thu máy yếu.

## Quy trình mỗi milestone

Audit diff → phạm vi nhỏ → code/content → unit/integration → Cocos build → browser/Editor khi làm được → báo cáo files/run/results/limits → chờ xác nhận. Không tự commit/push/merge. Một thay đổi nhỏ đã có test đạt không chạy lặp vô hạn; mở rộng test khi bug hoặc scope mới yêu cầu.

## Bản triển khai sau yêu cầu tiếp tục toàn bộ

Tám chương và backend/admin đã có full prototype chạy được. Xem [bàn giao](DELIVERY_FULL_PROTOTYPE.md) để phân biệt các tính năng đã kiểm thử với gate VPS, thiết bị mục tiêu, content và beta. Yêu cầu mới cho phép commit, không yêu cầu push.
