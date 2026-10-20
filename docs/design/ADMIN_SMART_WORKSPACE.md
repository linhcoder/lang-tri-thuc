# Không gian quản trị thông minh

Ngày 19/10/2026. Đã phát hành lên VPS: `admin-smart-verified-2e57529e-20261019`. Giữ nguyên contentVersion `2e57529e`; không cần dựng lại Cocos hoặc thay nội dung đang chơi.

## Bảy nâng cấp

1. **Cần xử lý** tổng hợp nội dung đã kiểm tra chờ duyệt, CMS chờ xuất bản, phản hồi, báo cáo tương tác, cảnh báo bản đồ, lỗi/xung đột lưu API và cảnh báo vận hành đã ghi nhận. Mỗi mục mở đúng màn hình với bộ lọc tương ứng. Đánh dấu đã kiểm tra lỗi lưu không sửa tiến độ học sinh.
2. **Theo dõi học sinh** hiển thị cấp/sao/hành trình, báo cáo tuần/tháng, kỹ năng cần luyện, nguồn tiến độ, lần lưu máy chủ, sự kiện gần nhất và số cảnh báo lưu. Lọc nhóm tuổi, ít hoạt động, kỹ năng yếu, có lỗi lưu hoặc chưa có thời gian. Không suy đoán thời gian cho bản lưu cũ. Nút quản lý hồ sơ mở đúng gia đình.
3. **Tìm toàn hệ thống** tìm không dấu theo học sinh, phụ huynh, NPC, tài nguyên, chương, bài học và nhiệm vụ. Tìm có debounce và bỏ kết quả cũ khi đổi truy vấn. Các màn danh sách có bộ lọc đặt tên, giữ tối đa 12 bộ lọc trên trình duyệt, tách theo tài khoản quản trị và màn hình.
4. **Luồng kiểm duyệt** lọc loại/tuổi/trạng thái; xem bài học và đáp án, so sánh với gói đang chạy; chọn tối đa 50 mục. Xem trước các chuyển trạng thái rồi xác nhận. Không được duyệt mục chưa kiểm tra; bất kỳ fingerprint cũ hoặc mục trùng nào làm cả lô bị từ chối. Đã duyệt không tự xuất bản: nội dung gói vẫn cần quy trình triển khai, CMS và bản đồ có quy trình riêng. Giao diện chỉ rõ nội dung có trong gói đang chạy hoặc khác gói đó.
5. **Lớp kiểm tra bản đồ** bật/tắt công trình, NPC, va chạm và đường tới ô tiếp cận; chọn NPC để thấy nhiệm vụ của chương, mở đúng NPC trong trình chỉnh sửa. Dùng hình học của bản nháp đã lưu từ API; cần lưu trước khi cập nhật lớp. Cảnh báo che hình vẫn cần xem ảnh trong game. Xuất bản và khôi phục bản đồ có bản xem trước công trình/NPC thay đổi và bước xác nhận riêng, kiểm tra revision trên máy chủ.
6. **Phân tích học tập** có tỷ lệ đúng, số lượt và số học sinh cho từng câu/hoạt động, danh sách kỹ năng ít luyện và checkpoint chưa hoàn tất. Chỉ gợi ý xem lại câu khi có ít nhất 10 lượt từ 3 hồ sơ. Bộ lọc tuổi áp dụng cho câu hỏi; bảng kỹ năng và checkpoint ghi rõ mọi tuổi. Có xuất JSON của báo cáo đang xem.
7. **Nhật ký và khôi phục** giữ tối đa 300 thay đổi biên tập gần nhất, ghi người sửa/thời điểm/đối tượng và nội dung trước/sau. Theo dõi chương, bài học, danh mục NPC/tài nguyên và kiểm duyệt. Chỉ khôi phục nội dung đang khớp fingerprint của phiên bản được chọn; tạo bản nháp, ghi thêm lịch sử và cần kiểm tra lại. Không khôi phục trạng thái duyệt hoặc tiến độ học sinh bằng công cụ này. Nhật ký thao tác cũ vẫn có trong dữ liệu; màn hình tải 300 mục gần nhất.

## Cách quản lý hằng ngày

- Mở **Cần xử lý**, ưu tiên phản hồi/lỗi lưu/bản đồ. Chọn **Mở để xử lý** để xem đúng đối tượng.
- Tìm tên bé ở thanh trên hoặc vào **Theo dõi học sinh**. Lưu các bộ lọc thường dùng, ví dụ kỹ năng cần luyện hoặc chưa hoạt động 7 ngày.
- Vào **Luồng kiểm duyệt**, lọc nhóm tuổi và loại nội dung, xem câu hỏi/nguồn/gợi ý trước khi chọn trạng thái. Xem trước cả lô rồi xác nhận.
- Khi chỉnh thế giới, lưu bản nháp, cập nhật lớp đường đi, xem trước trong game và kiểm tra bố trí. Bước xuất bản cuối hiển thị phạm vi thay đổi.
- Muốn sửa lại một thay đổi nội dung, mở **Nhật ký quản trị**, so sánh phiên bản, ghi lý do và khôi phục thành bản nháp.

## Dữ liệu và giới hạn

- Tất cả API mới yêu cầu quyền quản trị. Kết quả tìm kiếm, lịch sử và thống kê không chứa mật khẩu, password hash, session token hoặc bản lưu đầy đủ của học sinh.
- `updatedAt` chỉ được ghi khi revision bản lưu thay đổi thành công từ phiên bản này. Lỗi mạng không tới được API không thể xuất hiện trong cảnh báo lưu máy chủ. Cảnh báo API giữ tối đa 100 mục và được xóa cùng hồ sơ.
- Tổng hợp câu hỏi sử dụng tối đa 200 sự kiện chi tiết gần nhất mỗi hồ sơ; hiển thị tối đa 100 nhóm câu có tỷ lệ đúng thấp. Đây không phải thống kê toàn bộ lịch sử. Tiêu đề câu hỏi là nội dung hiện tại, không phải snapshot đề tại thời điểm học. Lượt cũ không có tuổi riêng dùng nhóm tuổi hồ sơ hiện tại.
- Checkpoint chưa hoàn tất không chứng minh trẻ bỏ dở hay bỏ học. Số liệu do thiết bị ghi nhận không tự cấp hoặc thu hồi XP/sao, không tự thay đổi nội dung.
- Lịch sử mới bắt đầu từ lần nâng cấp này. Snapshot chỉ chứa dữ liệu biên tập; không có dữ liệu tài khoản hay bản lưu học sinh. Khôi phục NPC còn kiểm tra vị trí hợp lệ và tăng revision bản nháp bản đồ để từ chối các phiên xuất bản đã xem trước dữ liệu cũ.
- Các gợi ý dùng quy tắc có giải thích, không gửi dữ liệu ra dịch vụ AI bên ngoài. Giao diện tổng hợp khi mở/tải lại, không giả định là giám sát thời gian thực.

## Kiểm tra

`npm run api:build`, `npm run admin:build`, `npm run server:build`, `npm run test:api`, `npm run test:admin-workbench`, `node apps/admin/tests/families-web.cjs`, `node apps/admin/tests/publishing-web.cjs`.

Fixture trình duyệt dùng API/SQLite và tài khoản riêng, không dùng dữ liệu thật. QA gồm desktop 1600×1000 và mobile 390×844, điều hướng từ cảnh báo/tìm kiếm, hồ sơ, bộ lọc, duyệt có xem trước, lịch sử khôi phục, lớp bản đồ và phân tích. Kiểm thử xuất bản xác nhận chọn bản/nhấn xuất bản chưa đổi bản đang chạy cho tới bước xác nhận. Ảnh và báo cáo tại `apps/admin/temp/workbench-qa/`, `family-design-qa/`, `publishing-qa/`.

## Xác minh VPS — 19/10/2026

- Release đang chạy: `admin-smart-verified-2e57529e-20261019`, contentVersion `2e57529e`. Bản đầu `admin-smart-2e57529e-20261019` gồm 25 file; bản hoàn thiện gồm 9 file bổ sung/sửa, SHA-256 `bb7887dfb99ac072b8c9d02dfbefef03eb6de6375d017b728f995f5d7f9382b7`. Checksum từng file, build Linux API/rooms và nginx -t đạt. Lockfile bị npm prune đổi metadata đã được đối chiếu/phục hồi từ archive khi chốt bản đầu.
- Backup mới nhất `/opt/lang-tri-thuc/backups/database-20261019T032451Z.sql` đã phục hồi thử khớp vào DB tạm; hai API MySQL healthy sau kích hoạt. Giữ release `five-upgrades-2e57529e-20261019` trước đợt quản trị và các release trung gian để rollback ứng dụng, không cần đổi phiên bản CMS vì cùng rules `2e57529e`.
- Kiểm tra local: API 39 đạt, một fixture MySQL riêng bỏ qua; build API/admin/rooms đạt. Browser desktop 1600×1000 và mobile 390×844 đạt tìm học sinh/NPC CMS, mở đúng hồ sơ/phản hồi, lưu bộ lọc, preview/duyệt hàng loạt, lịch sử khôi phục, lớp bản đồ và liên kết NPC vào trình chỉnh sửa. Ca xuất bản/khôi phục bản đồ có xác nhận và hồi quy quản lý gia đình đạt.
- QA HTTPS hai viewport đạt với tài khoản QA riêng: cảnh báo xung đột dẫn đúng học sinh, tìm kiếm gồm NPC CMS thật, hồ sơ/timestamp, preview kiểm duyệt, đọc lịch sử, bật/tắt lớp bản đồ và thống kê 15 lượt từ 3 hồ sơ với ngưỡng mẫu đúng. Không áp dụng duyệt/khôi phục/xuất bản trên nội dung thật trong QA; các ca ghi đó đã kiểm tra bằng fixture độc lập. Không có page error, đã xem ảnh mobile và desktop.
- Signed WebSocket hai hồ sơ kiểm tra câu hỏi hành trình do server xác nhận, lưu checkpoint/tác phẩm MySQL và cách ly học sinh đạt. API/admin/quyền truy cập và chặn phòng không vé đạt.
- Tất cả gia đình QA đã xóa. Kiểm tra checksum cuối so với trước toàn bộ đợt nâng cấp đạt cho 3 hồ sơ thật, toàn bộ tiến độ cũ, nội dung biên tập, bản đồ công bố, bản nháp và NPC/CMS. Dữ liệu người chơi và nội dung hiện hành không bị QA sửa.
- Báo cáo/ảnh: `temp/deploy/qa/admin-smart-live/`; bằng chứng bảo toàn tại `preservation.json`. Metadata: `temp/deploy/admin-smart-verified-deploy-state.json`. Bằng chứng signed room tại `temp/deploy/qa/five-upgrades-live/private-sync.json`.
