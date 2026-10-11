# Phần còn phát triển — 12/10/2026

Bản hiện tại là prototype tám chương đã có staging. Tỷ lệ người/cảnh đã sửa; cảnh làng có zoom 60–180% bằng nút, wheel và pinch. Các mục sau chưa có đầy đủ, không tính là đã hoàn thành chỉ vì có tên trong menu hoặc registry.

Đợt 11/10: năm ô trồng Chương 1 chuyển sang ruộng phải cạnh Bác Nông Dân, dùng chung tọa độ client/server. Ruộng có nền đất/rạ và lúa chín dày hơn, giữ lúa ở chất lượng Low; chừa khu trồng cây non. Save theo chỉ số ô giữ nguyên tiến độ. Khi triển khai cần cập nhật cả client và game server vì hash nội dung thay đổi.

Trâu đã thu nhỏ và đưa ra bờ ngoài khu trồng; sprite mạ thay bằng bụi lá dài không có rễ/cục đất lộ thiên. Có kiểm tra hình trâu không che năm ô trồng.

Năm ô trồng được giãn và đánh số 1–5 (đã trồng hiện ✓). Khoảng trống xét toàn bộ hình lúa/hoa/cỏ trên màn hình để tránh che ô, thay cho khoảng cách tile đơn thuần. Save vẫn giữ chỉ số ô; cần build client/server cùng phiên bản.

Chương 2 thay nhiệm vụ Ô ăn quan bằng ghép đèn ông sao: năm cặp cùng số, bấm hoặc kéo thả, không đấu điểm/giới hạn thời gian. Giữ quest ID để không mất nhiệm vụ đã hoàn thành; checkpoint Ô ăn quan dở được bỏ, mở trò ghép đèn mới. Ô ăn quan còn trong luyện tùy chọn sau tám sao.

Bảng nhiệm vụ chương đã thiết kế lại: tên chương cố định, NPC/tiến độ, thẻ số thứ tự và trạng thái rõ ràng, hai nút Nghe hướng dẫn/Về làng cân đối. Kiểm tra desktop và mobile dọc/ngang đạt.

## Đã bổ sung và triển khai staging

- Minimap có dấu của tám NPC và bạn trong phòng; vị trí bạn cập nhật theo trạng thái mạng, bị chặn/rời phòng thì xóa dấu. Có chú giải màu.
- Kéo nền bằng chuột hoặc một ngón để xem làng. Di chuyển hoặc mở menu đưa camera về theo bé; pinch và joystick vẫn có quyền riêng.
- Giếng, vườn rau, trâu, gà, vịt và mèo có nội dung khám phá, đi tới trước khi mở; có nút Nghe và lưu sáu điểm vào sổ. Nút Tương tác chọn cả NPC và cảnh vật gần nhất.
- Ván luyện lưu checkpoint theo từng trò trong hồ sơ local; đóng/tạm nghỉ/reload rồi tiếp tục. Trò đã kết thúc xóa checkpoint, không cấp thêm sao truyện. Checkpoint được đồng bộ theo hồ sơ phòng riêng; hồ sơ solo vẫn lưu trên máy.
- Ngày hội thay bộ hai hoạt động theo bốn mùa (giờ Việt Nam), lưu huy hiệu mùa/năm vào sổ sau khi xong cả hai. Đây là lịch mùa của game, không phải lịch âm/Tết/Trung thu.
- Server QA đã có bốn client dùng vé thật chơi đủ 11 trò chính ở cả ba nhóm tuổi, kết nối lại giữa mỗi ván và xác nhận thưởng cho cả bốn (33 kịch bản). Ô ăn quan còn trong luyện solo; bộ registry vẫn có 12 trò.
- Chăm trâu, gà, vịt, mèo và vườn rau ngay sau khi đi tới góc khám phá: ba bước, gợi ý khi chọn sai, lưu bước đang làm và chơi lại. Hoạt động mô phỏng giáo dục, không có đói/khát theo thời gian và không cấp sao truyện.
- Góc vẽ tự do mở ngay từ menu hoặc hoạt động: sáu màu, vẽ chuột/touch, chấm màu, lùi nét, xác nhận trang mới và phục hồi vừa xóa. Tranh tự lưu local theo hồ sơ; giới hạn 64 nét × 128 điểm để tránh save phình to. Đã xuất PNG 1080 × 500 qua nút Lưu ảnh; tranh/chăm góc làng được đồng bộ theo hồ sơ phòng riêng.
- Sáu NPC chương 2–7 đi tuyến ngắn quanh điểm xuất hiện; Cô Tấm đi một đoạn ngắn cạnh ruộng. Dừng khi bé/bạn tới gần để nói chuyện. Bấm NPC/bóng thoại tiếp cận vị trí hiện tại và cập nhật đường khi NPC di chuyển. Collision theo vị trí hiện tại; đoạn đã trống đi qua được. Server phát vị trí/hướng/trạng thái đi cho các client; offline dùng cùng luật. Ông Đồ/Bác Nông Dân giữ vị trí Chương 1. Đã có atlas 24 tư thế chào/fallback và atlas 64 khung tám hướng đi/nghỉ; khung tám hướng không mirror.

Sổ ngày lễ mở từ menu hoặc bộ sưu tập: hai chuỗi Tết/Trung thu có minh họa Graphics, câu hỏi có gợi ý, ghép bánh chưng/đèn ông sao, lưu bước và ván đang chơi. Chơi lại giữ dấu hoàn thành, không cộng sao truyện. Nội dung học mở quanh năm; sổ tự nhận diện ngày Tết/Trung thu bằng lịch âm runtime 1900–2199, giờ Việt Nam. Ngoài phạm vi tính giữ chế độ quanh năm.

Preview offline giữ tại `http://127.0.0.1:8085/`; bản cuối dùng build `completion-v1`. Stack online local dùng game 38080, phụ huynh 35173, API 33000. Các bổ sung này đã triển khai lên https://ltt.vui-hoc.xyz ngày 11/10/2026, source commit `0b4a42e`, contentVersion `e48dccf3`; Web, API và game server cùng phiên bản. QA live đạt phòng riêng hai client, save/reload, offline fallback và tranh desktop → mobile; errors rỗng.

| Mức ưu tiên | Phần còn lại | Hiện có / giới hạn |
| --- | --- | --- |
| Nâng cấp hình ảnh | Nâng animation NPC | Sáu NPC đã đi tuần với vị trí/collision client-server; tám NPC có nghỉ/chào, sáu cảnh vật có khám phá và năm hoạt động chăm. Đã có 24 khung đi/chào, atlas 64 góc nhìn và 64 khung bước chân bổ sung: hai khung mỗi hướng. Còn gait bốn/tám khung tinh chỉnh, duyệt art và QA RAM thiết bị thật |
| Tiếp theo | Art/animation và thao tác trực quan sâu hơn cho mini game | 12 bộ luật solo, minh họa Graphics và nút; kéo thả đèn và góc vẽ tự do đã có. Ghép tranh là ô trượt có tranh gà–hoa tự vẽ, cá/ao có mắt/vây/sóng/hoa sen; mô phỏng sâu và art riêng cho toàn bộ trò vẫn là nâng cấp tiếp |
| Trước beta online | Multiplayer trên mạng/thiết bị thật | Bốn client × 11 trò chính × ba nhóm tuổi, reconnect giữa lượt và thưởng authoritative đạt local. Soak WAN năm phút/bốn client/bốn reconnect đạt ngày 12/10, p95 228 ms, MySQL/save giữ nguyên. Chưa nghiệm thu thiết bị thật hoặc soak nhiều giờ |
| Mở rộng nội dung | Nhiệm vụ mùa và ngày lễ truyền thống | Đã có lịch bốn mùa, hai hoạt động/mùa, huy hiệu theo năm và sáu góc khám phá. Đã có hai chuỗi Tết/Trung thu quanh năm với câu hỏi có gợi ý, trò chơi và tiến độ local. Module âm/dương 1900–2199 đã tích hợp runtime, kiểm chứng 30 fixtures độc lập và 109.573 ngày đổi hai chiều. Còn mở rộng các ngày lễ khác |
| Khi cần mở rộng | Công cụ biên tập sâu | Sửa chương/quest title/câu hỏi/NPC/asset và review đã có. Chưa editor quest graph, luật/board mini game tùy ý; hai NPC chương 1 giữ cấu hình cố định |
| Khi tăng tải | Backend nhiều instance | MySQL-compatible snapshot JSON single-row, transaction/locking và backup đã có. Chưa schema chuẩn hóa, Redis presence/room coordination hoặc benchmark production đa instance |

NPC AI và lịch xuất hiện là tùy chọn trong master prompt, không phải chức năng đang chạy. Không bổ sung AI hội thoại tự do khi chưa có phương án kiểm duyệt phù hợp trẻ.

## Gate phát hành cần người/thiết bị

- Biên tập sư phạm, tiếng Việt, văn hóa và nguồn/license art; nội dung còn draft.
- Thử trẻ có giám sát ở ba nhóm tuổi, điện thoại Android/iOS và Intel HD/UHD thật; xác nhận giọng Việt, touch, tải lạnh, RAM và phiên dài.
- Soak mạng dài, bản sao offsite và kênh báo lỗi trước beta công khai. Backup ngày/retention và phục hồi thử tuần đã được triển khai riêng. aaPanel staging/HTTPS/WebSocket và restore drill đã chạy; Docker tùy chọn chưa kiểm thử.

Chi tiết yêu cầu gốc và giới hạn: [COMPLETION_CHECKLIST](COMPLETION_CHECKLIST.md). Bằng chứng chạy: [QA-REPORT](../apps/game-client/QA-REPORT.md).


Đợt hoàn thiện mới có đồng bộ tranh/chăm/ngày lễ/checkpoint theo hồ sơ phòng riêng (không cấp sao truyện), lịch lễ giờ Việt Nam 2026–2028, art ghép tranh/ao cá và atlas 24 tư thế NPC. Chi tiết: [ACTIVITY_SYNC](design/ACTIVITY_SYNC.md), [TRADITIONAL_FESTIVALS](design/TRADITIONAL_FESTIVALS.md), [NPC_POSES](design/NPC_POSES.md). Cần cập nhật Web, API và game server cùng rules 6.

Đợt art tiếp theo bổ sung tám hướng NPC, nền ruộng liền/chi tiết bờ ao và đường, cùng minh họa/phản hồi thị giác 12 bảng mini game. Chi tiết [ART_POLISH_PASS](design/ART_POLISH_PASS.md). Việc này không thay thế nghiệm thu art hoặc QA thiết bị thật.

Bản art đã deploy trên staging ngày 11/10/2026, commit `9b48e24`; API/room và browser QA live đạt, giữ release completion để rollback.

Lịch âm runtime và vận hành backup: [LUNAR_CALENDAR_QA](design/LUNAR_CALENDAR_QA.md), [BACKUP_OPERATIONS](BACKUP_OPERATIONS.md). Lịch UTC+7 tính ngày lễ sau 2028; backup tự động giữ 30 ngày, tối thiểu bảy bản và bản verify gần nhất. Backup thủ công cũ không bị dọn.

Đợt 12/10 bổ sung chạm trực tiếp trên bảng cho trồng/tưới lúa, lấy rau ở chợ, kéo co và nhảy sạp. Chuột/touch dùng chung xử lý với nút; phòng online gửi thao tác về server, không tự cập nhật kết quả. Không đổi luật/save/contentVersion. Đã kiểm tra desktop/mobile giả lập, chạm lặp và giữ nguyên sao truyện. Chu kỳ đi NPC nhiều khung mỗi hướng vẫn còn; kiểm tra trên thiết bị thật chưa hoàn tất.

QA vận hành tiếp theo: [WAN_SOAK_QA](WAN_SOAK_QA.md). Đã sửa JSON header dư ở request không có body trong góc phụ huynh, khôi phục xóa hồ sơ/tài khoản và đăng xuất. Backup ngoài VPS/kênh báo lỗi để sau theo lựa chọn người dùng ngày 12/10; ưu tiên QA và sửa lỗi trước.
