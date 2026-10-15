# Chín nâng cấp game — 16/10/2026

Đã triển khai release `upgrades-3065cfd-20261016`, source `3065cfd`, contentVersion `0d971c1a`. Backup trước kích hoạt: `/opt/lang-tri-thuc/backups/database-20261015T175726Z.sql`, kiểm tra khôi phục đạt. CMS NPC và bố trí đã lưu của người dùng được giữ nguyên.

Danh sách đề xuất ban đầu có tám mục. Phần xem trước, cảnh báo và khôi phục bản đồ được tách thành mục thứ chín.

| Mục | Cách sử dụng và hành vi |
| --- | --- |
| 1. Xuất bản bản đồ trực tiếp | Admin → Bản đồ NPC → Cây, nhà và sân chơi. Lưu nháp, kiểm tra rồi xuất bản. Game lấy vị trí, kích thước và các NPC đã lưu khi vào làng. Không cần build lại cho mỗi lần chỉnh. |
| 2. Học theo tuổi và năng lực | Câu hỏi giữ ba nhóm tuổi; hướng dẫn NPC và cỡ chữ cho nhóm nhỏ được điều chỉnh. Sổ nhiệm vụ → Bài luyện gợi ý chọn kỹ năng có tỷ lệ trả lời đúng thấp nhất trong những kỹ năng có ít nhất hai lượt trả lời. Chưa đủ dữ liệu thì bắt đầu với toán. Luyện tập ghi thống kê và không tự cấp sao cốt truyện. |
| 3. Hướng dẫn người mới | Bảng hướng dẫn ba bước: di chuyển, chào Ông Đồ, làm nhiệm vụ nhận sao. Có thể để sau hoặc mở lại trong Cài đặt → Xem hướng dẫn. Trạng thái lưu theo học sinh. |
| 4. Báo cáo phụ huynh | Góc người lớn → Báo cáo học tập tuần; admin mở tiến độ học sinh để xem báo cáo 7 ngày. Có lượt trả lời, số đúng, ngày hoạt động, nhiệm vụ mới, so sánh tuần trước và gợi ý luyện. API phụ huynh kiểm tra quyền sở hữu hồ sơ. |
| 5. Làng phát triển | Mỗi sáu nhiệm vụ cốt truyện hoặc hai mươi thử thách hành trình góp một mốc cây thưởng, tối đa năm cây. Cây có hoa theo số sao. Phần thưởng chỉ trang trí, không chặn đường. Các vùng hành trình vẫn mở theo cấp hiện có. |
| 6. NPC sinh động | NPC đang đứng quay mặt về người chơi khi đến gần; giữ hoạt ảnh chào và đi bộ đã có. Lời mở đầu chương phù hợp nhóm tuổi. Khi bật âm thanh, mở hội thoại chương/bạn mới sẽ đọc nội dung bằng giọng của thiết bị. |
| 7. Điều khiển điện thoại | Cài đặt → Nút điều khiển để đổi joystick thường/lớn. Giữ chạm đường để đi, tương tác khi ở gần và chế độ hình ảnh thấp. Sửa bố cục Cài đặt để các nút có khoảng cách rõ ràng. |
| 8. Phòng riêng và sưu tập | Túi đồ → Nhà của bé → Trang trí phòng riêng. Ba vị trí đặt đồ, bấm để lần lượt đổi đồ đã mở: chậu cây, bình gốm, sách, đèn lồng, cúp. Mở theo 0/1/2/4/8 sao, không trừ sao. Lưu và đồng bộ theo học sinh. |
| 9. Kiểm tra và khôi phục bản đồ | Xem trước trong game bằng bản nháp cục bộ; kiểm tra đường tiếp cận và nguy cơ che NPC trước xuất bản. NPC bị chặn không thể xuất bản. Cảnh báo che hình cần xem trước và xác nhận. Lưu tối đa 30 phiên bản; khôi phục tạo phiên bản mới và có kiểm tra phiên đang dùng. |

## Đồng bộ và giới hạn

- Phòng bạn bè giữ ảnh chụp bản đồ lúc tạo phòng; người vào sau tải đúng phiên bản của phòng. Mỗi phòng có va chạm và tuyến NPC riêng, không bị thay đổi bởi bản đồ của phòng khác. Bản đồ mới áp dụng cho lần vào làng/phòng mới.
- Báo cáo bắt đầu ghi từ bản nâng cấp này, không chuyển tiến độ lịch sử thành hoạt động mới. Tối đa 200 sự kiện gần nhất; giao diện báo khi chạm giới hạn, nên một tuần chơi nhiều có thể không đủ toàn bộ lịch sử. Đây là thống kê lượt luyện từ thiết bị, không phải nguồn xác thực sao online.
- Giọng đọc phụ thuộc giọng tiếng Việt có trên thiết bị và chỉ tự đọc khi bật âm thanh. Đồ trong phòng và cây thưởng đã dùng bộ sprite mới cùng phông phòng gỗ; xem [REWARD_ART_PASS](REWARD_ART_PASS.md).
- Bản xem trước không xuất bản và không thay đổi bản đồ của người khác. Khi offline hoặc API tạm lỗi, game dùng bản đồ đóng gói sẵn.

## Kiểm tra

- TypeScript client; build admin, backend và server; build game bằng Cocos Creator 3.8.8.
- API: xuất bản không làm lộ bản nháp, quyền admin/phụ huynh, xung đột phiên bản, khôi phục, va chạm riêng từng map, hợp nhất lịch sử và đồ trang trí, báo cáo không cấp sao.
- Trình duyệt admin: sửa/lưu, xem cảnh báo, xuất bản và khôi phục; hồi quy quản lý gia đình.
- Game đã build: bản đồ công bố thay đổi vị trí/kích thước/va chạm thật, hướng dẫn, bài luyện ghi báo cáo, phòng riêng qua tải lại và joystick lớn trên điện thoại.

Kết quả kiểm tra: 25 API đạt, 1 fixture MySQL bỏ qua; 11 bài server và 6 bài mạng/khởi động đạt. `test:client` còn lỗi ở giả định cũ rằng mọi ô gốc NPC đều đi được: bố trí đang dùng đặt Chị Mai `(42,17)` trong vùng va chạm vườn. Đã xác nhận cùng lỗi với `VillageModel.ts` từ commit trước nâng cấp. Không đổi vị trí đã lưu của người dùng; trình kiểm tra xuất bản mới cảnh báo tình huống này.

Kiểm tra HTTPS trên release cuối đạt: lưu và tải lại phòng riêng/hướng dẫn, bài luyện ghi vào báo cáo, nút điều khiển lớn trên mobile, xem trước bản đồ với kích thước nhà khác nhưng không đổi bản nháp hay bản đã công bố. Tài khoản gia đình kiểm tra đã xóa. Kiểm tra admin desktop/mobile đạt; xác nhận đủ 90 bài học, 12 NPC, 24 asset và các giới hạn truy cập vẫn hoạt động. Ảnh kiểm tra lưu cục bộ tại `temp/deploy/qa/upgrades-live/`. Bài kiểm tra riêng xác nhận nút đóng hướng dẫn cập nhật đúng hồ sơ khi dữ liệu online vừa thay thế bản trong bộ nhớ; API kiểm tra giữ đồ trang trí khi chưa có lần tải hoạt động đầu tiên.
