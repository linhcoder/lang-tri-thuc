# Kiểm tra phiên phòng riêng qua WAN

Chạy từ máy ngoài VPS, tại root repository đã cài dependencies:

```powershell
$env:SOAK_SECONDS='300'
node deploy/aapanel/soak-private.cjs
```

Mặc định HTTPS `https://ltt.vui-hoc.xyz`, bốn client SDK trong một phòng riêng, năm phút. `SOAK_ORIGIN` đổi môi trường kiểm tra; `SOAK_SECONDS` nhận 60–3600 giây. Không cần đọc admin/SSH credentials. Bộ kiểm tra tạo tài khoản phụ huynh QA với mật khẩu ngẫu nhiên và bốn hồ sơ, xin vé qua API thông thường; cuối phiên rời phòng rồi xóa tài khoản cùng dữ liệu QA. Không lưu mật khẩu, token hay vé vào report. Nếu cleanup không thành công, report báo lỗi và tiến trình trả exit code khác 0.

Report tại `temp/deploy/qa/soak-private.json`, không đưa dữ liệu chạy vào Git. Mỗi 30 giây in tiến độ để theo dõi phiên. Ctrl+C yêu cầu dừng và thực hiện cleanup.

## Điều kiện đạt

- Bốn client giữ roster và state NPC; di chuyển 5 lần/giây/client không bị correction. Probe khoảng một lần/giây/client, tất cả nhận lại, p95 dưới ba giây và mỗi probe dưới mười giây.
- Mỗi phút ngắt một client trong một giây rồi dùng reconnection token. Reconnect phải giữ session ID, roster, phiên bản nội dung và intro đã lưu. Phiên năm phút kiểm tra lần lượt cả bốn client.
- Hoạt động luyện lúa của hồ sơ đầu được lưu và đọc lại sau reconnect; tiến độ truyện được đọc từ MySQL cuối phiên. Không có receipt/sao phát sinh từ kiểm tra này.
- Không có storage-warning hoặc room error; tài khoản QA được xóa khi hoàn tất.

RTT là vòng request/response probe SDK qua HTTPS/WebSocket, chưa đo độ trễ input tới hình render. Bốn client chạy từ cùng một máy; ngắt WebSocket có chủ đích trong một giây chưa mô phỏng mọi lỗi mạng, chuyển Wi-Fi/4G, background điện thoại hay browser reload. Kết quả năm phút không thay soak nhiều giờ, kiểm tra tải lớn hoặc nghiệm thu Android/iOS thật.

## Kết quả live

Chưa ghi nhận kết quả cho tới khi bộ kiểm tra hoàn tất. Report có requested/actual duration, số probe, p95/max, từng lần reconnect, trạng thái save và cleanup.
