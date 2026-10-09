# Làng Tri Thức — Game Design Document

Phiên bản thiết kế 0.1, 09/10/2026. Tài liệu là thiết kế đích; trạng thái code trước M2 được ghi ở [AUDIT_M0.md](AUDIT_M0.md), Chương 1 mới ở [MILESTONE_M2.md](MILESTONE_M2.md). Các cột hiện trạng bên dưới là snapshot M0; chưa coi tám chương là đã triển khai.

## Trải nghiệm cốt lõi

Trẻ về một ngôi làng hư cấu nghỉ hè, giúp dân làng qua những việc nhỏ, học qua thao tác và thắp sáng Cây Đa Tri Thức. Không chiến đấu, phản diện đáng sợ hay thất bại trừng phạt. Một phiên chơi ngắn có thể kết thúc sau một nhiệm vụ; thoát giữa chừng vẫn giữ tiến độ đã xác nhận.

Vòng lặp: khám phá → gặp NPC → nhận một việc rõ ràng → thao tác/bài học → nhận phản hồi và Sao Tri Thức → nghe đoạn kết → chọn chơi lại hoặc nghỉ. Tất cả hoạt động bắt buộc có đường hoàn thành single-player; bạn bè chỉ bổ sung hợp tác, không chặn tiến trình.

Các trụ cột: tò mò; lễ phép; hợp tác; chăm sóc thiên nhiên; văn hóa Việt Nam có nguồn và biên tập. Trò chơi không thay thế chương trình học hay đánh giá năng lực trẻ.

## Người chơi và độ khó

| Hồ sơ | Thiết kế tương tác | Nội dung dự kiến |
| --- | --- | --- |
| 3–5 | Một yêu cầu mỗi màn, biểu tượng lớn, đọc thoại, chạm thay kéo chính xác | Màu/hình, đếm 1–10, động vật, nhận diện chữ |
| 6–8 | Chuỗi ngắn, hình + chữ, gợi ý từng bước | Cộng trừ, ghép vần, logic, từ Anh cơ bản |
| 9–11 | Nhiều bước có thể xem lại, câu hỏi có ngữ cảnh | Nhân chia, lời văn, khoa học, địa lý/lịch sử đã kiểm chứng |

Phụ huynh chọn nhóm tuổi, không yêu cầu ngày sinh hay tên thật. Tuổi chỉ đặt mức khởi đầu; trẻ có thể đổi mức với hỗ trợ. Không tự gán chẩn đoán hoặc xếp hạng công khai từ câu trả lời sai.

## Thế giới và hoạt động

Làng mang cảm hứng đồng bằng Bắc Bộ, không đại diện toàn bộ vùng miền Việt Nam. Các khu mới dùng portal/trigger sau khi hệ thống khu vực sẵn sàng; hiện chỉ có một map 40 × 40.

| Khu đích | Vai trò | Trạng thái hiện tại |
| --- | --- | --- |
| Cổng Làng | Intro, hướng dẫn di chuyển | Chưa có |
| Sân Đình | Ô ăn quan, kéo co, nhảy sạp | Có nền và sprite đình; chưa có trò hoàn chỉnh |
| Trường Học | Bài chữ/Toán/Anh | Chưa có |
| Nông Trại | Trồng, chăm, thu hoạch | Có ruộng và ba bó lúa thử nghiệm |
| Chợ Quê | Phân loại, cộng trừ, giao tiếp | Chưa có |
| Làng Nghề | Gốm, tranh | Chưa có |
| Ao Làng | Quan sát thiên nhiên, câu cá mô phỏng | Có terrain nước, không tương tác |
| Nhà Của Bé | Avatar, đồ trang trí, điểm nghỉ | Có sprite nhà; chưa phải tính năng |
| Cây Đa Tri Thức | Sao/chương và đoạn kết | Có cây trang trí; chưa tương tác |
| Khu Lễ Hội | Đèn, nhịp điệu, hoạt động theo mùa | Chưa có |

Vật thể tương tác phải có vòng sáng/biểu tượng và phản hồi rõ. Đồ trang trí không được quảng bá như có thể tương tác. Không cho trẻ đi xuống ao; không đưa thao tác thực tế với lửa, dao, bếp hoặc vật sắc vào nhiệm vụ.

## Chương và tiến độ

Tám chương, quest IDs, hội thoại và điều kiện mở nằm trong [STORY_BIBLE.md](STORY_BIBLE.md). Mỗi chương trao một sao chính duy nhất; luyện lại không nhân sao. Sao mở trang cốt truyện và trang trí, không tạo lợi thế cạnh tranh. Chương tiếp theo mở từ completion flag của chương trước, không dùng giờ chờ, streak hay ép đăng nhập mỗi ngày.

Quest có main/side/seasonal/cooperative; state dự kiến `locked → available → active → readyToTurnIn → completed`. Objective đếm các event duy nhất, reward idempotent. Đi lạc hoặc sai câu trả lời không giảm sao. Đồng hồ đếm chỉ dùng làm lựa chọn trong trò nhịp điệu, có chế độ không giới hạn thời gian.

## Mini game

| ID thiết kế | Hoạt động | Giai đoạn | Single-player |
| --- | --- | --- | --- |
| mg.rice-count | Trồng Lúa – Học Đếm | M2 | Trồng 5 vị trí rồi đếm |
| mg.o-an-quan | Ô Ăn Quan | M5 | NPC đối thủ + tutorial từng nước |
| mg.tug-of-war | Kéo Co | M5 | NPC hỗ trợ, nhịp có thể giảm |
| mg.bamboo-dance | Nhảy Sạp | M5 mở rộng | Nhịp mô phỏng, không ngã/trừng phạt |
| mg.market | Đi Chợ Quê | M6 | NPC bán hàng, giỏ theo yêu cầu |
| mg.star-lantern | Làm Đèn Trung Thu | M7 | Ghép hình trên màn hình |
| mg.banh-chung | Gói Bánh Chưng | M7 mở rộng | Sắp lớp vật liệu mô phỏng |
| mg.dong-ho | Ghép Tranh Đông Hồ | M7 | Ghép bản được duyệt và cấp quyền |
| mg.fishing | Câu Cá Ao Làng | M6 mở rộng | Phân loại hình cá, không tiêu diệt |
| mg.secret-letters | Tìm Chữ Bí Mật | M6 | Nhận diện/ghép chữ theo hồ sơ |
| mg.animal-care | Chăm Sóc Động Vật | M7 | Chọn hành động chăm sóc đúng |
| mg.village-maze | Mê Cung Đường Làng | M7 mở rộng | Tìm tuyến, gợi ý A* |

Không làm đồng thời 12 trò. M2 chỉ nhận một trò hoàn chỉnh; các trò phụ không là điều kiện mở chương khi chưa được nghiệm thu. Bài rải hạt hiện tại là exercise, không phải `mg.o-an-quan`.

## UI và âm thanh

Đích: loading, chọn avatar, HUD, hội thoại, nhật ký, túi đồ, bản đồ, mini game, thành tích, nhà bé, cài đặt, vùng phụ huynh. Mỗi màn có đóng/quay lại, không chạm xuyên xuống world. Cỡ chạm mục tiêu ≥44 CSS px, chữ tiếng Việt có đầy đủ dấu. Âm thanh mặc định vừa phải; cho tắt tiếng và bật lại; phụ đề luôn có. Đọc thoại phải qua lựa chọn của người dùng để đáp ứng chính sách autoplay của browser, không tự hứa giọng Việt khi thiết bị không có.

## Multiplayer và phát hành

Offline mặc định. Online chỉ sau khi phụ huynh cho phép, ưu tiên phòng mời riêng; chưa mở matchmaking công cộng cho trẻ. Không chat tự do/voice hay tên thật. Chi tiết kiểm soát ở [CHILD_SAFETY.md](CHILD_SAFETY.md). Các phần này là yêu cầu phát hành, chưa có trong prototype hiện tại.

Beta chỉ sau test nội dung, single-player, save, an toàn và benchmark GPU tích hợp/điện thoại thật. Mục tiêu 30 FPS trên thiết bị mục tiêu; số đo hiện tại trên AMD không chứng minh Intel đạt.
