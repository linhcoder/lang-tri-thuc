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
| Trước beta online | Multiplayer trên mạng/thiết bị thật | Bốn client × 11 trò chính × ba nhóm tuổi, reconnect giữa lượt và thưởng authoritative đạt local. Soak WAN một giờ/bốn client/59 reconnect đạt ngày 12/10, đủ 13.684 probe, p95 265 ms, MySQL/save giữ nguyên. Chưa nghiệm thu thiết bị thật, phiên render browser dài hoặc tải production lớn |
| Mở rộng nội dung | Nhiệm vụ mùa và ngày lễ truyền thống | Đã có lịch bốn mùa, hai hoạt động/mùa, huy hiệu theo năm và sáu góc khám phá. Đã có hai chuỗi Tết/Trung thu quanh năm với câu hỏi có gợi ý, trò chơi và tiến độ local. Module âm/dương 1900–2199 đã tích hợp runtime, kiểm chứng 30 fixtures độc lập và 109.573 ngày đổi hai chiều. Còn mở rộng các ngày lễ khác |
| Khi cần mở rộng | Công cụ biên tập sâu | Sửa chương/quest title/câu hỏi/NPC/asset và review đã có. Chưa editor quest graph, luật/board mini game tùy ý; hai NPC chương 1 giữ cấu hình cố định |
| Khi tăng tải | Backend nhiều instance | MySQL-compatible snapshot JSON single-row, transaction/locking và backup đã có. Chưa schema chuẩn hóa, Redis presence/room coordination hoặc benchmark production đa instance |

NPC AI và lịch xuất hiện là tùy chọn trong master prompt, không phải chức năng đang chạy. Không bổ sung AI hội thoại tự do khi chưa có phương án kiểm duyệt phù hợp trẻ.

## Gate phát hành cần người/thiết bị

- Biên tập sư phạm, tiếng Việt, văn hóa và nguồn/license art; nội dung còn draft.
- Thử trẻ có giám sát ở ba nhóm tuổi, điện thoại Android/iOS và Intel HD/UHD thật; xác nhận giọng Việt, touch, tải lạnh, RAM và phiên dài.
- Soak WAN một giờ/bốn SDK client đã đạt; còn phiên render browser dài, tải production lớn, bản sao offsite và kênh báo lỗi. Backup ngày/retention và phục hồi thử tuần đã được triển khai riêng. aaPanel staging/HTTPS/WebSocket và restore drill đã chạy; Docker tùy chọn chưa kiểm thử.

Chi tiết yêu cầu gốc và giới hạn: [COMPLETION_CHECKLIST](COMPLETION_CHECKLIST.md). Bằng chứng chạy: [QA-REPORT](../apps/game-client/QA-REPORT.md).


Đợt hoàn thiện mới có đồng bộ tranh/chăm/ngày lễ/checkpoint theo hồ sơ phòng riêng (không cấp sao truyện), lịch lễ giờ Việt Nam 2026–2028, art ghép tranh/ao cá và atlas 24 tư thế NPC. Chi tiết: [ACTIVITY_SYNC](design/ACTIVITY_SYNC.md), [TRADITIONAL_FESTIVALS](design/TRADITIONAL_FESTIVALS.md), [NPC_POSES](design/NPC_POSES.md). Cần cập nhật Web, API và game server cùng rules 6.

Đợt art tiếp theo bổ sung tám hướng NPC, nền ruộng liền/chi tiết bờ ao và đường, cùng minh họa/phản hồi thị giác 12 bảng mini game. Chi tiết [ART_POLISH_PASS](design/ART_POLISH_PASS.md). Việc này không thay thế nghiệm thu art hoặc QA thiết bị thật.

Bản art đã deploy trên staging ngày 11/10/2026, commit `9b48e24`; API/room và browser QA live đạt, giữ release completion để rollback.

Lịch âm runtime và vận hành backup: [LUNAR_CALENDAR_QA](design/LUNAR_CALENDAR_QA.md), [BACKUP_OPERATIONS](BACKUP_OPERATIONS.md). Lịch UTC+7 tính ngày lễ sau 2028; backup tự động giữ 30 ngày, tối thiểu bảy bản và bản verify gần nhất. Backup thủ công cũ không bị dọn.

Đợt 12/10 bổ sung chạm trực tiếp trên bảng cho trồng/tưới lúa, lấy rau ở chợ, kéo co và nhảy sạp. Chuột/touch dùng chung xử lý với nút; phòng online gửi thao tác về server, không tự cập nhật kết quả. Không đổi luật/save/contentVersion. Đã kiểm tra desktop/mobile giả lập, chạm lặp và giữ nguyên sao truyện. Chu kỳ đi NPC nhiều khung mỗi hướng vẫn còn; kiểm tra trên thiết bị thật chưa hoàn tất.

QA vận hành tiếp theo: [WAN_SOAK_QA](WAN_SOAK_QA.md). Đã sửa JSON header dư ở request không có body trong góc phụ huynh, khôi phục xóa hồ sơ/tài khoản và đăng xuất. Backup ngoài VPS/kênh báo lỗi để sau theo lựa chọn người dùng ngày 12/10; ưu tiên QA và sửa lỗi trước.

Animation đợt 12/10 tiếp theo: commit `4fe699c` bổ sung chu kỳ hai khung × tám hướng cho tám NPC, giữ chào/idle/fallback. Chi tiết [NPC_POSES](design/NPC_POSES.md). Test 128 lựa chọn khung, dừng/fallback/dispose và patrol online/offline đạt; art vẫn là candidate, cần duyệt thủ công và RAM thiết bị thật.

Đợt mini game local tiếp theo: build `minigame-touch-v2` thêm chạm cá đang bơi và thẻ sáu nguyên liệu bánh chưng. Cá được chọn hiện lớn ở giữa để quan sát màu; hướng dẫn đổi theo bước. Thẻ nguyên liệu có hình, tên và dấu hoàn thành, giữ nút lớn thay thế. Cùng đường xử lý chuột/touch và server authoritative; không đổi luật/save/contentVersion. Preview tại `http://127.0.0.1:8099/`; chưa triển khai staging. Các trò còn lại và nghiệm thu điện thoại thật tiếp tục nằm trong backlog.

Đợt nhiều AI tiếp theo: build local `minigame-complete-v3` thêm chạm thẻ chữ và ô dân Ô ăn quan, tiến độ chữ/ô có thể chơi, hình gà/chó/con vật lạ theo đúng bước chăm sóc. Tên trò chơi giữ cố định, phản hồi đúng/sai có dòng riêng. Online gửi phản hồi từ chối riêng cho người thao tác, giữ nguyên trace và thưởng. Sửa lỗi clock dừng ở 3.600 giây khiến cá và trò nhịp không hoàn thành; giữ save v1 và giới hạn 2.000 hành động, kiểm tra timestamp hữu hạn/đủ độ chính xác. Rules **7**, contentVersion **`6f44a0a8`**: cần build/triển khai Web, API và game server cùng phiên bản; staging vẫn chạy bản trước. Preview mới `http://127.0.0.1:8100/` thay cho preview 8099 của đợt trước. Chưa nghiệm thu thiết bị thật hoặc phiên browser dài.

Đã triển khai bản này lên staging ngày 12/10: release `68f79b9-worktree-minigame-6f44a0a8-20261012`, source baseline `68f79b9` cùng working tree. Web/API/rooms cùng phiên bản; SHA archive khớp, backup/restore drill và build Linux đạt, services/timers active. QA live API, hai client, save/reload/offline, 12 bảng desktop/mobile và phản hồi mini game online/tiến độ hợp lệ đạt, errors rỗng. Giữ release `4fe699c-npc-walk-e48dccf3-20261012` để rollback. Gate còn lại vẫn là duyệt nội dung/art, trẻ/thiết bị thật, phiên render dài và tải lớn.

### Ghép từng miếng, mê cung và bước chân NPC — 12/10/2026

Theo phản hồi của người dùng, ghép tranh chuyển sang đặt từng miếng vào hình mẫu: 4 miếng cho 3–5 tuổi, 6 cho 6–8 và 9 cho 9–11. Chạm hoặc kéo thả, chọn sai giữ tiến độ; không cần đọc số hay giải ô trượt. Modal riêng lớn, bố cục dọc/ngang, hình mẫu mờ và khay mảnh. Checkpoint mới có variant `picture-match-v1`; ván ô trượt cũ được kiểm chứng trước khi chuyển sang ván mới, ván đã hoàn thành giữ kết quả. Rules 8, contentVersion `8f4c4bbd`.

Mê cung chạm ô kề hợp lệ, tường rõ, đích và vị trí bé có hình; nút hướng vẫn dùng được. Modal thường fit kích thước CSS của điện thoại. NPC có nhịp chân theo quãng đường, chuyển trọng tâm và nội suy nhịp giữa snapshot mạng; root giữ vị trí authoritative. Dùng lại hai frame đi mỗi hướng, chưa phải atlas nhiều frame mới.

Bản cuối `piece-maze-npc-v5` còn giữ bức tranh đầy đủ khi ghép xong, lời chúc và nút Hoàn thành; sửa nhãn cũ pending destroy khiến tiêu đề mất sau thao tác. Đã activate release `68f79b9-piece-maze-gait-8f4c4bbd-20261012-v5` trên staging: Web/API/rooms cùng `8f4c4bbd`, services và timers active. SHA overlay `6a143b2fdfcaffe8e6a8c97f89b38bc566c9d6c732e0e13445e4b84290858856`; backup/restore drill `/opt/lang-tri-thuc/backups/database-20261012T081334Z.sql` đạt. Giữ release mini game rules 7 để rollback. Chi tiết kiểm tra tại [PICTURE_MATCH_QA](design/PICTURE_MATCH_QA.md).

### Backend dễ dùng hơn — 12/10/2026

Theo yêu cầu nâng cả ba phần, đã thêm tổng quan quản trị, tìm kiếm không dấu/lọc trạng thái, form kiểm duyệt, bố cục responsive và phản hồi tải/lỗi. Phụ huynh đổi tên hồ sơ, xem sao truyện riêng với kết quả mini game, tạo/dùng lại/tham gia phòng, xem phòng còn hạn/khóa, sao chép mã mời, vé gắn hồ sơ và chặn vé hết hạn; phiên giữ trong tab sau reload. API thêm readiness, kiểm tra phiên, overview, room list và tài liệu OpenAPI; có code/requestId/thông báo tiếng Việt, doctor local và hướng dẫn.

Đã deploy release `68f79b9-backend-usability-8f4c4bbd-20261012` cùng game v5/rules 8; local stack MySQL cũng đang chạy. QA API/MySQL/server/UI và kiểm tra backend qua HTTPS đạt; nội dung thật không dùng làm fixture biên tập. Xem [BACKEND_GUIDE](BACKEND_GUIDE.md) và [BACKEND_QA](BACKEND_QA.md). Các gate trẻ/thiết bị thật/render dài/tải lớn còn như trước.

### Chuẩn bị chơi thử và kiểm tra dài hơn — 12/10/2026

Đã có Góp ý chơi thử cho phụ huynh và hàng đợi xử lý của quản trị; có trạng thái/ghi chú, quyền riêng của tài khoản, export/rút lại/account delete, validation và audit. Local/web cùng release `68f79b9-playtest-feedback-8f4c4bbd-20261012`, rules 8. QA live góp ý và API đạt, fixture/tài khoản QA đã dọn.

Render Cocos thực 902 giây/174 chu kỳ desktop-dọc-ngang đạt, node và JS heap sau GC ổn định trong phiên. Benchmark local 50 client/10 phòng trong 300 giây đạt đủ 2.950 probe, bốn reconnect, không correction/warning/error. Đây chưa phải nghiệm thu điện thoại thật, nhiều giờ hoặc tải MySQL/VPS/multi-instance. Xem [PLAYTEST_GUIDE](PLAYTEST_GUIDE.md) và [PLAYTEST_QA](PLAYTEST_QA.md). Backup offsite/cảnh báo tự động vẫn để sau theo lựa chọn trước.

### Mở rộng bản đồ và nhân vật — 12/10/2026

Đã thêm Vườn bốn mùa, Bến sông quê, Sân trường tuổi thơ: 48×48 ô, 13 khu, sáu NPC nam/nữ và bảy hoạt động luyện tập không cộng sao truyện. Có sáu mẫu nhân vật, ba tóc, ba màu da, biểu cảm Cảm ơn/Chỉ hướng; phòng riêng đồng bộ ngoại hình và lưu huy hiệu khi đổi client. Tám chương cũ cùng kiểm thử client/server/API và Cocos desktop/dọc/ngang đạt. Xem [VILLAGE_EXPANSION](design/VILLAGE_EXPANSION.md). Hoạt động mới luyện tập cá nhân; chơi thử trẻ/thiết bị thật vẫn cần người tổ chức.
