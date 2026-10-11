# Đối chiếu hoàn thiện — 11/10/2026

Đối chiếu master prompt với mã, build và kiểm thử thực tế. Đây là prototype chạy được, chưa phải nghiệm thu phát hành beta. Người dùng đã cho phép làm liên tục, commit và push; các yêu cầu chờ từng milestone trong tài liệu gốc là lịch sử.

Staging aaPanel hiện đã triển khai và nghiệm thu kỹ thuật: [runbook](../deploy/aapanel/README.md). Gate VPS/domain/TLS/WebSocket/backup-restore đã thực hiện; còn nội dung, trẻ có giám sát và thiết bị thật trước public beta.

Tỷ lệ nhân vật bản local hiện là 78%; zoom cảnh 60–180% có wheel/nút/pinch, giữ HUD và lưu lựa chọn. Bản local 11/10 bổ sung minimap NPC/bạn, camera kéo, sáu góc khám phá, checkpoint luyện, ngày hội theo mùa, chăm góc làng, vẽ tự do sáu NPC đi tuần và sổ Tết/Trung thu; đã triển khai các thay đổi này lên staging ngày 11/10/2026, bản completion commit `0b4a42e`, tiếp theo bản art `9b48e24`; contentVersion `e48dccf3`. [Backlog phát triển cụ thể](DEVELOPMENT_BACKLOG.md) phân biệt phần prototype đang chạy với chức năng chưa làm đầy đủ.

| Nhóm yêu cầu | Bản hiện tại | Giới hạn / việc còn lại |
| --- | --- | --- |
| Cocos / scene | Giữ Creator 3.8.8, scene/UUID cũ; build Web thật | Kiểm tra trực tiếp bằng Editor và thiết bị đích trước beta |
| Cốt truyện | 8 chương, dependency, intro/end, quest, 8 sao duy nhất, save/reload | Nội dung còn draft; cần biên tập sư phạm và văn hóa |
| Thế giới | 10 khu trên map 40×40, A*, collision, keyboard/touch/joystick, camera, depth, portal; zoom wheel/nút/pinch 60–180%, kéo camera, minimap NPC/bạn | Không phải 10 scene riêng; cần nghiệm thu điện thoại thật |
| Art làng | NPC truyện, ao sen, giếng, tre, cầu đi qua ao, trâu/gà/vịt/rau/cổng; sáu điểm khám phá có sổ và Nghe; năm hoạt động chăm góc làng có checkpoint/chơi lại; sáu NPC đi tuyến ngắn, dừng gần bé, đồng bộ server và collision theo vị trí | Đã có 128 khung tám hướng × hai pha đi/nghỉ và atlas 24 khung chào/fallback; còn gait bốn/tám khung tinh chỉnh và duyệt art; chăm góc làng là mô phỏng ba bước, không có đói/khát theo thời gian |
| Avatar | 4 trang phục trai/gái, 2 kiểu tóc mỗi avatar, 4 lựa chọn khăn, idle/walk 8 hướng; hello/happy online/offline | Biểu cảm bằng code; không có sheet cử chỉ riêng |
| NPC data | ID, spawn, tên, chương, tương tác/hội thoại; editor 6 NPC truyện; tuyến ngắn sinh từ spawn hợp lệ, bấm/tương tác tới vị trí hiện tại | Ông Đồ/Bác Nông Dân giữ vị trí chương 1; chưa editor tuyến tùy ý, lịch xuất hiện tùy chọn hoặc NPC AI |
| Giáo dục | 90 câu cấu hình: 3 nhóm tuổi × 10 kỹ năng × 3 lượt; nhân/chia/toán lời văn, ghép vần, địa lý có nguồn; hint, đọc thoại | Chưa có xác nhận chuyên gia; giọng thật phụ thuộc trình duyệt/hệ điều hành |
| Mini game | 12 luật riêng, hình minh họa theo state, chơi solo, pause/resume truyện, trace validation; kéo thả đèn + click thay thế; góc vẽ tự do sáu màu có undo/lưu local | Bản mô phỏng giáo dục, chưa đạt mức art/animation thương mại; ghép tranh vẫn dùng ô trượt, câu cá quan sát/thả. Góc vẽ là hoạt động riêng, xuất PNG 1080 × 500 và đồng bộ theo hồ sơ phòng riêng; chưa đồng biên tập tranh cùng lúc |
| Quest / thưởng | Main quest, receipt sao, sổ khám phá, nhà/trang trí; checkpoint luyện local, huy hiệu theo bốn mùa/năm và hai chuỗi Tết/Trung thu quanh năm | Đồng bộ hoạt động/checkpoint theo hồ sơ phòng riêng và nhận diện lễ 2026–2028 đã có. Module âm/dương 1900–2199 đã tích hợp runtime và có fixtures/QA riêng; còn nội dung lễ khác và art đã duyệt |
| Multiplayer | Colyseus, phòng riêng vé phụ huynh, room minigame, authoritative action/reward, rate limit, block/report, reconnect/solo; bốn client × 11 trò chính × ba nhóm tuổi, reconnect giữa mỗi ván đạt | Bench local 20 client; chưa soak WAN/multi-instance hoặc nghiệm thu thiết bị thật. Ô ăn quan là luyện solo tùy chọn |
| Backend | Fastify, tài khoản/hồ sơ/tiến độ, ownership, revision, MySQL transaction, xuất/xóa | MySQL theo quyết định hiện tại; snapshot JSON single-row, chưa schema chuẩn hóa/Redis đa instance |
| Admin | Biên tập chương/quest title/hội thoại/câu hỏi/NPC/metadata asset; review/audit/report, export/import | Quy tắc, ID, đáp án runtime và game graph có validation; không editor luật mini game tùy ý |
| UI | Loading, avatar, HUD, dialogue, nhật ký, túi, map, mini game, thành tích, nhà, settings, phụ huynh | Browser desktop + Android giả lập; cần điện thoại thật và thử trẻ có giám sát |
| Hiệu năng | Atlas, culling, lazy NPC/avatar/tóc, pooled board labels, Low/Medium/High | Chưa nghiệm thu RAM/giọng/load/FPS trên Intel HD/UHD và mobile thật; không cam kết 30 FPS trên mọi máy |
| Vận hành | aaPanel VPS live: Nginx/Node 24/MariaDB, services user riêng, HTTPS/WS, backup và restore drill đạt; giữ gói Compose tùy chọn | Chưa chạy Docker/Compose; không cần Docker trên aaPanel hiện tại |
| Tài liệu | Có đủ 8 tài liệu thiết kế và báo cáo QA/art/deploy | Các số liệu từng đợt giữ lại như lịch sử |

## Gói nội dung và nghiệm thu

Admin xuất 8 chương, 90 câu, 6 NPC và 24 asset. Sửa nội dung đưa bản ghi về draft; phải qua reviewed rồi approved. Approval trong hệ thống là trạng thái workflow, không thay thế người biên tập hoặc xác minh quyền sử dụng art.

```powershell
node tools/import-content.cjs path/to/export.json --draft --check
node tools/import-content.cjs path/to/export.json --check
node tools/import-content.cjs path/to/export.json
npm.cmd run web:build
npm.cmd run api:build
npm.cmd run server:build
```

`--check` chỉ kiểm tra, không ghi file. `--draft` chỉ dành cho prototype/staging. Import kiểm tra ID, đáp án, tọa độ/collision/path và metadata; không cho đổi đường dẫn asset. Cần build và triển khai client/server cùng gói; dấu phiên bản nội dung khác nhau chuyển về solo.

## Gate ngoài môi trường local

1. Biên tập từng câu/thoại/luật/văn hóa và nguồn/license của toàn bộ art; không duyệt tự động hàng loạt.
2. Thử trẻ 3–5, 6–8, 9–11 có phụ huynh giám sát; ghi nhận khả năng đọc, thao tác, thời lượng và độ khó.
3. QA Intel HD/UHD, Android/iOS thật: portrait/landscape, touch, giọng Việt, tải lạnh, RAM, FPS, mất mạng, phiên dài.
4. VPS aaPanel/domain/HTTPS/WS/backup-restore đã đạt. Đã có backup ngày/restore drill tuần và retention tự động riêng; còn soak WAN dài, offsite và báo lỗi chủ động trước beta; Docker là lựa chọn khác chưa được kiểm thử.

Đợt lịch/vận hành: lịch lễ đã tính âm/dương qua module UTC+7, kiểm chứng tại [LUNAR_CALENDAR_QA](design/LUNAR_CALENDAR_QA.md). Backup ngày, phục hồi thử tuần và retention riêng xem [BACKUP_OPERATIONS](BACKUP_OPERATIONS.md). Nghiệm thu trẻ/thiết bị thật, soak WAN dài và duyệt nội dung/art vẫn còn.
