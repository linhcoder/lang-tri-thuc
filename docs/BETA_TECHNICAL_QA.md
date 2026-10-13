# Kiểm tra kỹ thuật trước lượt chơi thử — 13/10/2026

## Xác nhận bàn giao

Ngày 13/10/2026, người dùng báo đã chơi thử Android với phụ huynh/bé và thấy ổn, sau đó xác nhận các bước đã xong và yêu cầu chốt. Đóng đợt hiện tại theo xác nhận này. Bằng chứng bên dưới giữ nguyên; không suy diễn thêm số đo thiết bị, kết quả iOS hoặc hồ sơ quyền hình ảnh. Trạng thái duyệt chi tiết trong admin giữ nguyên. Offsite chờ kết nối theo lựa chọn đã thống nhất; staging giữ cơ chế truy cập hiện tại.

Bản staging dùng Cocos `beta-ready-v6`, rules 10, contentVersion `785f4e7e`. Release: `29b35d8-beta-ready-785f4e7e-20261013`; source game client `2abd101`, bổ sung vận hành `bb712c9`/`f4bbb06`, sửa máy chủ `d75a13a`, QA mất mạng `8160f20`. Tên thư mục release giữ mã của bước chuẩn bị, nguồn thực tế ghi trong `RELEASE.txt`.

## Ba khu mở rộng

Vườn bốn mùa, Bến sông quê và Sân trường tuổi thơ có bảy hoạt động. Có thể luyện cá nhân hoặc cùng phòng với tối đa bốn người trong mỗi hoạt động. Tuổi của người mở nhóm quyết định độ khó chung. Máy chủ kiểm tra mã lượt và bước hiện tại, nên bấm lặp hoặc trả lời cũ không bỏ qua vòng. Hoạt động luyện tập không cộng sao truyện.

Tiến độ dở dang đồng bộ theo từng hoạt động, dùng thời điểm cập nhật và dấu hoàn thành bước 0 để tránh khôi phục vòng cũ. Hoàn thành nhóm lưu riêng vào từng hồ sơ, giữ nguyên tranh vẽ và các hoạt động khác. Đổi thiết bị khôi phục được checkpoint. Chặn bạn chơi loại người đó khỏi nhóm ngay và ngừng gửi trạng thái nhóm cho họ.

Kiểm tra máy chủ đạt cả ba nhóm tuổi, bốn người cùng chơi, từ chối người thứ năm, chặn và khôi phục trên client mới. Giao diện Cocos bản cuối đạt bảy hoạt động, lưu/reload ở desktop 1280×720, touch dọc 390×844 và ngang 844×390. Chơi chung desktop/mobile qua HTTPS đạt bảy hoạt động và checkpoint trên browser context mới. Đây là trình duyệt giả lập, chưa phải điện thoại thật.

Thành viên mất mạng tạm thời vẫn được lưu checkpoint/huy hiệu khi nhóm tiếp tục, trong thời gian giữ chỗ reconnect 15 giây. Máy chủ giữ snapshot của thành viên và gửi bản mới khi người đó trở lại. Kiểm tra ba nhóm tuổi và kiểm tra MySQL/HTTPS thực đều đạt: hoàn thành lúc bạn offline, huy hiệu khi reconnect, độ khó theo người mở nhóm, sao truyện bằng 0. Toàn bộ 10 kiểm thử máy chủ đạt sau bản sửa này, gồm 33 lượt mini game truyện với bốn người và reconnect.

NPC có tám pha bước theo quãng đường cho tám hướng, tái sử dụng atlas và ngừng bước khi đứng. NPC mở rộng giữ hướng mặt đúng. Các pha được tạo từ hình hiện có bằng mã; không được coi là tám khung vẽ mới đã được họa sĩ nghiệm thu.

## Hạ tầng staging

Hai API (33080/33081), hai tiến trình phòng (32580/32581), Redis riêng loopback 36379, API nội bộ qua upstream loopback 33082. Nginx định tuyến WebSocket tới `/colyseus/a/` hoặc `/colyseus/b/`; phòng vẫn yêu cầu vé của phụ huynh. API nội bộ không mở ra ngoài. Redis AOF bật, giới hạn RAM 256 MiB, không tự loại key. Giới hạn API dùng chung giữa hai instance: 120 yêu cầu/phút/IP, yêu cầu thứ 121 trả 429.

Mỗi phòng chạy trên một tiến trình. Nếu tiến trình khởi động lại, người chơi có thể cần mở lại phòng và tiếp tục từ checkpoint MySQL; đây chưa phải chuyển phòng liên tục sang tiến trình khác khi có lỗi.

Thư mục cấu hình có quyền đi qua cho Redis/Nginx; các environment file bí mật giữ 0600. Chỉ loopback được tin cậy khi đọc địa chỉ IP từ proxy. Không dùng thư mục cấu hình của ứng dụng khác.

Trang **Hệ thống và API** của quản trị viên đọc sáu kiểm tra mỗi phút: API/MySQL, phòng, Redis, backup, restore, offsite. File trạng thái chỉ chứa dữ liệu vận hành an toàn; phụ huynh không có quyền đọc endpoint quản trị. Backup ngày và restore tuần trên VPS tiếp tục chạy.

Offsite **chờ kết nối** theo lựa chọn của người dùng. Lịch Windows thử nghiệm đã tắt; không tự sao chép sang máy này nữa. Bản thử mã hóa được giữ riêng trong thư mục ignored, không được coi là đích offsite đang vận hành. Có mẫu `deploy/aapanel/offsite.config.example.json`; script sao chép và cài lịch từ chối chạy khi cấu hình chưa bật/chưa có đích. Chưa cấu hình email, chat hoặc dịch vụ cảnh báo bên ngoài.

## Bằng chứng triển khai

Gói nền SHA-256: `e21b4707774d914f23c0c0190f32cda67a1974ea2828e52c417c7716e0bcd305`.

Gói cuối Cocos v6/source game: `cce6201296ee546f75e5655e65ec5b9da52eee98c5523476af08b447d12bcd64`.

Gói sửa vận hành: `dce43cb13649127eb4a43f76e16c213e9fac543810ca28bf230e3937166b2728`.

Gói sửa lưu thành viên mất mạng: `37d054b4ac2cef574edc45595f6adaa7b4f0a2d6e0afa7bcb6768a86b67b05aa`.

Checksum được kiểm tra trên VPS. API/server build Linux và Nginx validation đạt. Release trước được giữ để rollback. QA HTTPS đạt đăng nhập quản trị, 90 bài học, 12 NPC, quyền truy cập, chặn phòng không có vé, ngoại hình/cổng khu vực/lưu sau reconnect và góp ý phụ huynh. Tài khoản thử được dọn bằng API của chính fixture; không duyệt nội dung hoặc chỉnh góp ý người thật.

## Nghiệm thu cần người tham gia

Audit tự động kiểm tra cấu trúc 90 câu hỏi, 63 vòng của bảy hoạt động mới theo ba nhóm tuổi và 64 tài nguyên hình; chưa thay thế duyệt tiếng Việt, giáo dục, văn hóa và quyền sử dụng art. Gói cho người duyệt nằm tại `temp/beta-review/content.json`, report `temp/beta-review/audit.json` (ignored). Không tự chuyển draft/placeholder thành approved. Chơi thử với phụ huynh/bé, Android/iOS thật, giọng đọc và hiệu năng thiết bị thật vẫn cần người tham gia. Hướng dẫn ở [PLAYTEST_GUIDE](PLAYTEST_GUIDE.md).

## Tải MySQL/Redis trên VPS qua HTTPS

Bản máy chủ cuối `d75a13a` đạt 100 SDK client trong 20 phòng, mỗi phòng năm hồ sơ, chạy đủ 900 giây sau khi tạo đủ client. Hai tiến trình phòng và hai API đều được sử dụng. Gửi/nhận đủ 17.600 probe; p95 269,7 ms, lớn nhất 619,6 ms. Có 14 reconnect, lưu checkpoint MySQL định kỳ và kiểm tra dữ liệu bền sau phiên; không correction, storage warning hoặc lỗi. Cả 20 tài khoản QA được xóa, file phiên fixture được dọn.

Đây là benchmark SDK qua WAN, không phải 100 trình duyệt render, không phải cam kết công suất tối đa của VPS. Báo cáo ignored: `temp/deploy/qa/live-load/report.json`; lượt đạt trước bản sửa mất mạng được giữ riêng ở `pre-offline-fix-report.json`.

24 mẫu vận hành cách nhau một phút xác nhận các service đều active. Bộ nhớ service cao nhất quan sát được: API A/B 69,0/67,8 MiB; rooms A/B 111,6/111,9 MiB; Redis 4,1 MiB. Đây là bộ nhớ service từ systemd, riêng với JS heap của browser. Bằng chứng: `temp/deploy/qa/final-operations.json`. Monitor xác nhận readiness 2/2, năm kiểm tra tốt và offsite chờ kết nối.

## Backup/restore cuối

Sau khi dọn các tài khoản tải, backup và restore service đều `success`. Bản `auto-20261012T194211Z-a88e9e2f.sql` (02:42:11 ngày 13/10 UTC+7), SHA-256 `e91fdf67d383db8c309d7ca700131458e0ede9b7ecfd5d59e4947e0a1832a57f`, đã phục hồi vào DB thử; dữ liệu khớp snapshot và DB thử được xóa. Không phục hồi đè DB đang phục vụ. Offsite vẫn chờ kết nối.

## Render Cocos thực hai giờ

Đạt 7.204 giây, 1.300 chu kỳ thao tác thực với ghép tranh, mê cung và đếm cá mở rộng, đổi desktop/dọc/ngang. Có 241 mẫu GC/RAF, page errors rỗng, sao truyện giữ 8. Sau warmup và cuối phiên đều 472 node; các mẫu ổn định dao động 463–472. Heap sau GC từ 26,0 lên 27,1 MiB, đỉnh 27,2 MiB. Median RAF cuối 16,7 ms; median lớn nhất giữa các mẫu 50 ms, dưới ngưỡng kiểm tra 100 ms.

Lượt dài dùng build `beta-ready-v1` tại preview 8116, cùng lõi render tám pha bước và vòng đời UI. Các sửa hướng sprite/phản hồi/chặn nhóm trên `beta-ready-v6` đã kiểm thử chức năng riêng. Sửa máy chủ mất mạng được đo lại bằng tải VPS trên mã cuối. Không suy ra FPS hoặc RAM của Android/iOS/Intel HD thật từ kết quả này.

Báo cáo/ảnh ignored: `apps/game-client/temp/render-soak/report.json`, `final.png`. Các preview QA tạm đã dừng; local stack bản cuối ở parent 35173/game 38080 vẫn hoạt động. Hướng dẫn chơi thử đã trỏ tới Cocos v6/rules 10. Không có fixture phiên tải hoặc mất mạng còn chờ dọn.
