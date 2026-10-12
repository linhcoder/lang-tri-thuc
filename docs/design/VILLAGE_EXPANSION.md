# Mở rộng làng — 12/10/2026

Bản đồ tăng từ 40×40 lên 48×48 ô, có 13 khu. Vị trí nhiệm vụ, NPC cũ, cầu và ruộng của tám chương được giữ. Các đường mới nối vườn, sân trường và bến sông; camera theo bé ở vùng mở rộng, tự tìm lại đường khi NPC đi tuần chắn lối, minimap dùng cùng tỷ lệ cho nền và các ghim di chuyển.

| Khu | Người bạn | Hoạt động |
| --- | --- | --- |
| Vườn bốn mùa | Anh Nam, chị Mai | Chăm hoa; Giỏ quả nhiều màu |
| Bến sông quê | Chú Hải, cô Lan | Lắp thuyền mô hình; Đếm cá; Nổi hay chìm |
| Sân trường tuổi thơ | Bé Minh, bé An | Đồ vật cùng đôi; Tìm đồ dùng đi học |

Mở **Bản đồ → Khám phá khu mới**, chọn khu để bé tự đi theo đường. Chạm người bạn hoặc bong bóng trò chuyện để đến gần và mở lời chào. Nút **Gặp các bạn mới** cho phép xem lời chào và chơi mà không cần đi xa. NPC mới đi tuần theo máy chủ trong phòng riêng và nhường khi người chơi đến gần.

Mỗi hoạt động có ba bước, không giới hạn thời gian, có gợi ý và thử lại. Đếm cá dùng 1–3, 3–5 hoặc 6–8 con theo mức tuổi. Bảy huy hiệu được lưu riêng trong `expansion`, hợp nhất cộng dồn khi đổi client. Chơi lại không tăng Sao Tri Thức; tám sao vẫn theo tám chương. Hoạt động mới là luyện tập cá nhân, chưa có lượt chơi hợp tác chung như mini game cốt truyện.

Trong **Cài đặt → Người lớn → Chọn nhân vật**, có sáu lựa chọn áo/nhân vật, ba kiểu tóc, ba màu da và bốn lựa chọn khăn. Nút **Thêm nhân vật** chuyển trang. Hai mẫu mới là bé trai áo lá và bé gái áo tím. Các lựa chọn có cùng tốc độ và khả năng; tóc, màu da và quần áo hiển thị cho bạn cùng phòng. Kiểu tóc thứ ba và màu da ấm/nâu dùng hình nhân vật vẽ bằng Canvas; bốn hình cũ ở ngoại hình mặc định vẫn dùng sprite hiện có.

**Biểu cảm** bổ sung Cảm ơn và Chỉ hướng. Dock desktop giữ sáu nút ban đầu để vừa màn hình; hai biểu cảm mới nằm trong sổ biểu cảm. Trang phục, cảnh mới và biểu tượng hoạt động là hình vẽ bằng mã nguồn, không phụ thuộc tải ảnh bên ngoài.

Tiến độ cũ không có `skin`/`expansion` tự nhận mặc định; giữ nguyên sao/nhiệm vụ. Reset chương sau giữ cả màu da cùng các lựa chọn ngoại hình khác. Quy tắc 9 / content version `547e04f2`: client, API và server phải phát hành cùng nhau. Tab/vé cũ cần tải lại và mở vé mới nếu đang giữ phiên bản trước.

## Kiểm chứng

- Kiểm tra TypeScript, 63 nhóm logic client và 4 test vòng đời mạng đạt.
- Kiểm tra mới: 13 mốc tới được, bờ sông có va chạm, 21 lượt hoạt động ở ba mức tuổi, retry/gợi ý/giới hạn, migration và hợp nhất huy hiệu đạt.
- Cocos thật: desktop 1280×720, cảm ứng dọc 390×844 và ngang 844×390; bảy hoạt động, chọn nhân vật/tóc/da, đi theo đường tới khu mới và reload giữ bảy huy hiệu, không cộng sao.
- Tám chương cũ hoàn thành trong trình duyệt, không lỗi JS.
- Server: 7 test đạt, bao gồm bốn người chơi chạy mini game cốt truyện ở ba mức tuổi; test hai client xác nhận 12 NPC và avatar 5 / tóc 2 / da 2; huy hiệu mới giữ được khi đổi client.
- API: 8 test đạt, 1 test MySQL có điều kiện bỏ qua trong bộ mặc định. Không coi test SQLite này là kiểm tra tải MySQL.

Bản build: `village-expansion-v4`. Ảnh và báo cáo kiểm thử local nằm trong thư mục ignored `apps/game-client/temp/expansion-qa/`. Kiểm tra desktop/cảm ứng ở đây dùng Chromium; chưa thay thế chơi thử với trẻ hoặc thiết bị thật. Chạy `npm run test:expansion` và `GAME_WEB_URL=... npm run test:expansion-ui` để kiểm tra lại.

## Staging và localhost

Đã kích hoạt `68f79b9-village-expansion-547e04f2-20261012` tại https://ltt.vui-hoc.xyz/. API/rooms active, MySQL health cùng phiên bản `547e04f2`. Local game mặc định và stack phụ huynh 35173 cũng đã cập nhật `village-expansion-v4`.

Overlay 405.657 byte / 80 file, SHA-256 `db15a0d67487e5b77280a3f032a3bceee07df769ac7d182f4297023076b83fd8`. Backup `/opt/lang-tri-thuc/backups/database-20261012T132257Z.sql` đã restore vào DB tạm và khớp trạng thái; release `68f79b9-playtest-feedback-8f4c4bbd-20261012` giữ để rollback.

QA Cocos trực tiếp trên HTTPS đạt cả desktop/dọc/ngang và kiểm đúng tọa độ đến cả ba khu. Kiểm tra hai tài khoản QA qua API/WebSocket đạt 12 NPC, ngoại hình avatar 5 / tóc 2 / da 2, ba cổng khu và ba huy hiệu bền sau reconnect MySQL, sao truyện bằng 0. API role/anonymous/internal/unsigned-room checks đạt. Tài khoản của các lượt QA thành công đã dọn qua API. Hai tài khoản fixture của lần chạy đầu còn chờ quyền dọn sau khi tự động kiểm duyệt từ chối script đọc cấu hình MySQL root; không coi phần dọn này là hoàn tất.
