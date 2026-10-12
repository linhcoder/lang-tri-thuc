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

### Tiếp tục ván và chạm đếm cá — 13/10/2026

Build local `expansion-interactive-v5` giữ các cải thiện hình ảnh/điều hướng của `expansion-polish-v2`, thêm checkpoint cho cả bảy hoạt động. Đóng bảng hoặc tải lại trên cùng thiết bị mở lại bước 1/2 còn dở; nút hoạt động ghi Tiếp tục. Checkpoint lưu nhóm tuổi, chỉ tiếp tục khi nhóm tuổi khớp; dữ liệu sai/không rõ hoạt động/bước hoàn thành bị bỏ qua. Hoàn thành xóa checkpoint, giữ huy hiệu; replay không thêm sao truyện. Checkpoint là local theo hồ sơ, không đồng bộ giữa thiết bị như huy hiệu; callback tiến độ online giữ phần local này.

Trong Đếm cá, chạm mỗi con để đánh số thứ tự đã đếm. Chạm lại một con không tăng số; vẫn chọn đáp án số để sang bước tiếp theo. Chọn sai giữ dấu đếm, chọn đúng xóa dấu để đếm nhóm cá mới. Trò không tự cấp huy hiệu chỉ vì đã chạm đủ cá.

Không đổi luật câu hỏi/đáp án, rules 9/contentVersion `547e04f2`; chưa triển khai staging. Kiểm thử logic đạt checkpoint sau reload storage, dữ liệu giả mạo, không cấp huy hiệu/sao khi restore và đếm không trùng ở ba nhóm tuổi. Cocos QA bản v5 đạt reload ván Chăm hoa, đóng/mở bảy hoạt động, chạm cá hai lần không đếm trùng, nhãn số thứ tự là 1 và completion cleanup trên desktop/dọc/ngang; cuối phiên giữ bảy huy hiệu, sao truyện bằng 0, page errors rỗng. Đã xem ảnh số thứ tự cá desktop. Typecheck, 63 nhóm client/4 test vòng đời mạng, build API/rooms đạt. Preview `http://127.0.0.1:8116/`; report/ảnh trong thư mục ignored `apps/game-client/temp/expansion-qa`. Chưa kiểm tra điện thoại thật hoặc đồng bộ checkpoint giữa thiết bị.

### Tối ưu ba khu — bản local tiếp theo

Build `expansion-polish-v2` bổ sung luống cây và giỏ quả tại Vườn bốn mùa, lau sậy/phao tại Bến sông quê, ô nhảy lò cò/ghế sách tại Sân trường tuổi thơ. Chi tiết dùng Graphics tĩnh theo nhóm, không thêm vòng cập nhật animation hoặc collision. Bản đồ khám phá hiển thị huy hiệu đã hoàn thành/tổng hoạt động theo khu và nút Cùng chơi mở đúng người bạn của khu; từ hội thoại có thể quay lại Chọn khu.

Lựa chọn của sáu hoạt động có hình bên cạnh chữ; đếm cá vẫn dùng lựa chọn số. Tên hoạt động giữ cố định khi chọn sai hoặc xin gợi ý; phản hồi có dòng riêng và ba chấm tiến độ. Quả bóng có đường bóng, viên đá trong thẻ không dùng mặt nước của tranh mô phỏng. Kích thước hình được giới hạn để không tràn thẻ.

Luật ba bước, đáp án, phần thưởng và save không đổi; vẫn rules 9/contentVersion `547e04f2`. Bản này là preview local, chưa triển khai staging; đường dẫn staging và release bên dưới ghi lần phát hành trước.

QA bản cuối đạt typecheck, 63 nhóm client/4 test mạng, 21 lượt logic hoạt động và Cocos desktop 1280×720/touch dọc 390×844/ngang 844×390. Test đi qua nút Cùng chơi/Chọn khu, kiểm tra hình trên lựa chọn và tên Chăm hoa giữ nguyên sau chọn sai/gợi ý, hoàn thành bảy hoạt động, tới ba khu, reload giữ huy hiệu/ngoại hình và không tăng sao truyện; page errors rỗng. Đã xem ảnh lựa chọn lắp thuyền desktop và đồ dùng đi học dọc. Preview `http://127.0.0.1:8116/`; ảnh/report ignored ở `apps/game-client/temp/expansion-qa`. Chưa coi đây là kết quả chơi thử Android thật.

Đã kích hoạt `68f79b9-village-expansion-547e04f2-20261012` tại https://ltt.vui-hoc.xyz/. API/rooms active, MySQL health cùng phiên bản `547e04f2`. Local game mặc định và stack phụ huynh 35173 cũng đã cập nhật `village-expansion-v4`.

Overlay 405.657 byte / 80 file, SHA-256 `db15a0d67487e5b77280a3f032a3bceee07df769ac7d182f4297023076b83fd8`. Backup `/opt/lang-tri-thuc/backups/database-20261012T132257Z.sql` đã restore vào DB tạm và khớp trạng thái; release `68f79b9-playtest-feedback-8f4c4bbd-20261012` giữ để rollback.

QA Cocos trực tiếp trên HTTPS đạt cả desktop/dọc/ngang và kiểm đúng tọa độ đến cả ba khu. Kiểm tra hai tài khoản QA qua API/WebSocket đạt 12 NPC, ngoại hình avatar 5 / tóc 2 / da 2, ba cổng khu và ba huy hiệu bền sau reconnect MySQL, sao truyện bằng 0. API role/anonymous/internal/unsigned-room checks đạt. Tài khoản của các lượt QA thành công đã dọn qua API. Hai tài khoản fixture của lần chạy đầu đã được dọn ngày 12/10/2026: tra tên bằng tài khoản database riêng của ứng dụng, xác minh alias/role bằng đăng nhập fixture, xóa qua API parents/me. Phiên và đăng nhập cũ bị từ chối sau khi xóa; truy vấn kiểm tra không còn tài khoản expansion. Không đọc cấu hình MySQL root của aaPanel. Bằng chứng local ignored: temp/deploy/qa/expansion-cleanup.json.
