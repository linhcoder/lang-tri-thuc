# Đối chiếu hoàn thiện — 10/10/2026

Đối chiếu master prompt với mã, build và kiểm thử thực tế. Đây là prototype chạy được, chưa phải nghiệm thu phát hành beta. Người dùng đã cho phép làm liên tục, commit và push; các yêu cầu chờ từng milestone trong tài liệu gốc là lịch sử.

| Nhóm yêu cầu | Bản hiện tại | Giới hạn / việc còn lại |
| --- | --- | --- |
| Cocos / scene | Giữ Creator 3.8.8, scene/UUID cũ; build Web thật | Kiểm tra trực tiếp bằng Editor và thiết bị đích trước beta |
| Cốt truyện | 8 chương, dependency, intro/end, quest, 8 sao duy nhất, save/reload | Nội dung còn draft; cần biên tập sư phạm và văn hóa |
| Thế giới | 10 khu trên map 40×40, A*, collision, keyboard/touch/joystick, camera, depth, portal | Không phải 10 scene riêng |
| Art làng | NPC Ông Đồ/Cô Tấm và các NPC truyện, ao sen; giếng, tre, cầu, trâu, gà, vịt, rau, cổng | NPC idle tĩnh; cầu tre là trang trí, chưa đi qua mặt ao |
| Avatar | 4 trang phục trai/gái, 2 kiểu tóc mỗi avatar, 4 lựa chọn khăn, idle/walk 8 hướng; hello/happy online/offline | Biểu cảm bằng code; không có sheet cử chỉ riêng |
| NPC data | ID, spawn, tên, chương, tương tác/hội thoại; editor 6 NPC truyện | Ông Đồ/Bác Nông Dân giữ vị trí chương 1; lịch xuất hiện tùy chọn và NPC AI chưa triển khai |
| Giáo dục | 90 câu cấu hình: 3 nhóm tuổi × 10 kỹ năng × 3 lượt; nhân/chia/toán lời văn, ghép vần, địa lý có nguồn; hint, đọc thoại | Chưa có xác nhận chuyên gia; giọng thật phụ thuộc trình duyệt/hệ điều hành |
| Mini game | 12 luật riêng, hình minh họa theo state, chơi solo, pause/resume truyện, trace validation; kéo thả đèn + click thay thế | Bản mô phỏng giáo dục, chưa đạt mức art/animation thương mại; tô tranh dùng ghép ô, câu cá quan sát/thả |
| Quest / thưởng | Main quest, receipt sao, huy hiệu/bộ sưu tập, nhà/trang trí; luyện và lễ hội sau 8 sao | Lễ hội chơi quanh năm, chưa lịch mùa riêng; luyện không có checkpoint giữa trò |
| Multiplayer | Colyseus, phòng riêng vé phụ huynh, room minigame, authoritative action/reward, rate limit, block/report, reconnect/solo | Bench local 20 client; chưa soak WAN/multi-instance hoặc nghiệm thu đồng chơi tất cả 12 trò |
| Backend | Fastify, tài khoản/hồ sơ/tiến độ, ownership, revision, MySQL transaction, xuất/xóa | MySQL theo quyết định hiện tại; snapshot JSON single-row, chưa schema chuẩn hóa/Redis đa instance |
| Admin | Biên tập chương/quest title/hội thoại/câu hỏi/NPC/metadata asset; review/audit/report, export/import | Quy tắc, ID, đáp án runtime và game graph có validation; không editor luật mini game tùy ý |
| UI | Loading, avatar, HUD, dialogue, nhật ký, túi, map, mini game, thành tích, nhà, settings, phụ huynh | Browser desktop + Android giả lập; cần điện thoại thật và thử trẻ có giám sát |
| Hiệu năng | Atlas, culling, lazy NPC/avatar/tóc, pooled board labels, Low/Medium/High | Chưa nghiệm thu RAM/giọng/load/FPS trên Intel HD/UHD và mobile thật; không cam kết 30 FPS trên mọi máy |
| Vận hành | Compose MySQL/API/Colyseus/Caddy, Docker nhiều stage chạy node user, backup/runbook | Máy hiện tại không có Docker; chưa build/run Compose hoặc deploy VPS/domain/TLS live |
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
4. Cung cấp VPS/domain/SSH, chạy Docker staging, TLS/WS, backup và thử phục hồi DB riêng. Chưa có thông tin máy đích, chưa thực hiện deployment.
