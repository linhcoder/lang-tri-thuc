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

Ngày 12/10/2026, lúc 00:27–00:32 UTC+7, chạy từ máy phát triển tới VPS staging, contentVersion `e48dccf3`: 300 giây, bốn client, 1.144/1.144 probe. P95 228 ms, max 532 ms; bốn lần reconnect 2.683/2.617/2.568/2.579 ms, gồm một giây chờ ngắt có chủ đích. Không correction, storage-warning hay room error. Intro/hoạt động luyện lúa giữ nguyên sau reconnect và được đọc lại từ MySQL; tài khoản QA đã xóa. Hai services active, NRestarts=0 trong phiên đo.

Các lần chạy thử harness trước đó phát hiện mã close 4000 là rời tự nguyện, probe đang bay bị mất khi cố ý đóng socket, và snapshot null là hợp lệ cho hồ sơ chưa có hoạt động. Harness dùng close 4001, đợi probe trả về trước ngắt và phân biệt nhận snapshot với giá trị snapshot. Tài khoản lần thử đầu đã được dọn riêng; các lần sau cleanup qua API thành công.

Đợt này cũng phát hiện UI phụ huynh gửi JSON header cho DELETE không có body. Bản sửa nằm trong commit `f5b6721`, cùng công cụ soak. Phiên năm phút chạy trước activation để restart triển khai không ảnh hưởng phép đo. Soak nhiều giờ/thiết bị thật vẫn còn; backup offsite và kênh báo lỗi được để sau theo lựa chọn người dùng ngày 12/10.

### Phiên một giờ — 12/10/2026

Chạy `SOAK_SECONDS=3600` từ 01:17:43 tới 02:17:56 UTC+7, trên release `4fe699c-npc-walk-e48dccf3-20261012` giữ nguyên cả phiên. Bốn client SDK, actualSeconds=3600; 13.684/13.684 probe, p95 265 ms, max 476 ms. 59 lần reconnect giữ session ID/roster/intro; thời gian phục hồi 2.500–2.896 ms, gồm một giây mô phỏng ngắt. Không correction/storage-warning/room error. Đối chiếu MySQL cuối phiên giữ intro và hoạt động luyện lúa, không sinh receipt thưởng; QA account được xóa thành công.

Theo dõi 11 snapshot systemd và kiểm tra cuối phiên: API/game server active, PID không đổi, NRestarts=0. MemoryCurrent trước/sau: API khoảng 46,3 → 49,5 MiB; rooms 44,6 → 53,8 MiB. Đây là bộ nhớ cgroup dịch vụ, không phải heap/GPU và không chứng minh không có leak trong mọi tải. Backup timer chạy trong phiên lúc 02:00:02–02:00:03 UTC+7, Result=success/ExecMainStatus=0. Hai backup timers vẫn active.

Bằng chứng local: `temp/deploy/qa/soak-private-hour.json` và `soak-private-hour-services.json`. Chỉ ghi metric/trạng thái, không có token/vé/mật khẩu. Gate soak một giờ/bốn client đã đạt; còn soak nhiều giờ hơn/tải production lớn và thiết bị thật. Đây là SDK từ một máy, chưa kiểm phiên render browser một giờ hoặc Wi-Fi/4G/background trên điện thoại.
