# Asset thành phố — bộ thiết kế v1

Ngày tạo: 22/10/2026. Bốn ảnh mới được sinh riêng bằng OpenAI built-in `image_gen`, lưu tại [city-v1](city-v1/). Bộ runtime đã tích hợp tại `apps/game-client/assets/resources/village/city-v1/`, có meta/UUID riêng và registry `city.library`, `city.station`, `city.lab`, `city.park`.

| Địa điểm | Ảnh | Điểm nhận diện |
| --- | --- | --- |
| Thư viện thành phố | [library.png](city-v1/library.png) | Mái xanh gợi cuốn sách mở, góc đọc ngoài trời, cửa kính và dốc tiếp cận |
| Ga giao thông | [station.png](city-v1/station.png) | Mái ngói cong, đồng hồ lớn, xe buýt điện xanh, chỗ chờ và xe đạp |
| Trung tâm khoa học | [lab.png](city-v1/lab.png) | Mái vòm kính, mô hình phân tử, pin mặt trời và vườn thí nghiệm |
| Công viên sinh thái | [park.png](city-v1/park.png) | Chòi mái lá, hồ thực vật, cầu gỗ và ba thùng phân loại có biểu tượng |

## Hướng mỹ thuật

Góc nhìn isometric, chất liệu minh họa vẽ tay, ánh sáng ấm từ trái trên. Tường kem, gỗ ấm, xanh ngọc, ngói đất và cây xanh nối phong cách làng hiện có với kiến trúc công cộng của thành phố. Mỗi địa điểm có silhouette riêng. Không có nhân vật hoặc chữ gắn vào ảnh; tên địa điểm tiếp tục cần được render bằng UI tiếng Việt.

Các vật nhỏ trong ảnh là chi tiết của một cụm cảnh, chưa phải sprite độc lập. Xe buýt, cầu gỗ và thùng phân loại chưa có animation hoặc vùng tương tác riêng.

## Nguồn và kiểm tra

- [Prompt đầy đủ](city-v1-prompts.json): công cụ, ngày tạo, nội dung chính xác của cả bốn lần sinh ảnh và yêu cầu nền trong suốt.
- [Manifest](city-v1-manifest.json): kích thước, dung lượng, SHA-256 và thống kê alpha của từng PNG.
- Đã mở xem cả bốn ảnh; kiểm tra giải mã PNG, RGBA, có pixel trong suốt, vùng chủ thể gần đục hoàn toàn, mỗi chiều không quá 2048 và bốn checksum riêng.
- Bản thiết kế nguồn được giữ nguyên. Bộ runtime qua một lượt chỉnh bằng built-in `image_gen` để làm sạch phần nền quanh silhouette; không dùng script xóa nền. [Prompt chỉnh sửa](city-v1-cleanup-prompt.json) và [manifest runtime](city-v1-runtime-manifest.json) ghi riêng nguồn, alpha, checksum và UUID. Đã xem ảnh trên nền game thật, không thấy quầng nền màu.

## Tích hợp runtime

Ánh xạ `city-library → library.png`, `city-station → station.png`, `city-lab → lab.png`, `city-park → park.png`. `JourneyScenery.ts` giữ hình code làm fallback khi chưa tải được ảnh; khi tải xong thay bằng sprite, giữ tỷ lệ, chiều rộng 280 world px và đặt caption trên mái. Không đưa bốn ảnh vào tải bắt buộc lúc khởi động; bootstrap chỉ tải khi camera tới gần. Công trình giữ trên mức Low, được cull ngoài camera, y-sort theo chân và mờ xuống alpha 92 khi che nhân vật.

`cityBuildingPosition()` đặt công trình ở `(district.x + 2, district.y - 2)`, phía đông đại lộ, tách thư viện khỏi biển Phố văn hóa. Điểm đến/cổng ở đại lộ giữ nguyên. Footprint riêng có halfWidth 105, halfDepth 34, lift 30; client/server dùng cùng hình học. Mái và cây không mở rộng collision theo toàn bộ hình chữ nhật ảnh.

Bản đồ đổi contentVersion từ `843b7864` sang `01e767b0`. CMS chỉ nâng tương thích các bản đã biết sau khi xác thực NPC vẫn hợp lệ; giữ nguyên nội dung NPC, draft và các release lịch sử. Có ca kiểm thử nâng từ bản thành phố cũ và từ chối bản không biết/NPC bị cản.

Build Web có WebP thay thế và PNG fallback, giữ nguyên kích thước/alpha: tổng bốn PNG 10.068.476 byte, WebP 6.058.462 byte. Đây là dung lượng file, không phải số đo tải trên mạng di động. Texture được tái sử dụng khi quay lại khu.

## Xác minh

`npm run test:city-art` chạy Cocos thật ở 1600×900 và 844×390, kiểm bốn texture riêng, tải trì hoãn ở làng, tỷ lệ/caption, va chạm và lối đi bốn phía, mờ khi che người chơi, mức Low và reload. Có ảnh cả bốn khu ở hai viewport và mẫu 119 khoảng RAF. `npm run test:city-ui` kiểm 16 bước, sai không chuyển bước và bố trí nút. Bằng chứng local ignored tại `apps/game-client/temp/city-art-qa/` và `city-qa/`. Kiểm mobile bằng trình duyệt mô phỏng, chưa phải đo Android thật hoặc soak dài hạn.

TypeScript, client logic, backend/CMS, rooms, build API/rooms/admin/Web và ba bài kiểm tra bộ tối ưu WebP đã chạy. Bộ backend có một bài MySQL được bỏ qua khi không cấu hình DB riêng; kiểm tra MySQL production và backup/restore thực hiện trong quy trình triển khai.

## Triển khai VPS — 22/10/2026

Đã kích hoạt `city-art-01e767b0-20261022`, contentVersion `01e767b0`, tại https://ltt.vui-hoc.xyz/game/. Overlay 54 file, SHA-256 `8a64a219c006e0b5665c29f627eb50ecd1c36dda2b57fdcd385a0532d63ded52`. Build API/rooms Linux, checksum nguồn/Web, nginx -t, hai API MySQL và bốn services đạt. Backup `/opt/lang-tri-thuc/backups/database-20261022T020913Z.sql` đã khôi phục thử khớp và xóa DB thử.

QA HTTPS đạt bốn texture riêng, tải trì hoãn, va chạm, tỷ lệ/caption, mờ khi che người chơi, Low và reload ở 1600×900, 844×390; không page error. Đạt bốn dự án/16 bước và kiểm tra đáp án sai/bố trí nút. Hai client signed WebSocket đạt lưu tiến độ thành phố, checkpoint, trang trí và tác phẩm vào MySQL, cách ly học sinh. Tài khoản QA đã xóa. Ba hồ sơ thật, tiến độ, bản đồ published/draft, nội dung quản trị, NPC và từng release CMS cũ giữ nguyên checksum; active CMS nâng tương thích sang bản mới.

Metadata/báo cáo ignored: `temp/deploy/city-art-deploy-state.json`, `city-art-final-verification.json`, `qa/city-art-live/`. Giữ `city-843b7864-20261021` để rollback. Khi quay lại bản cũ phải chọn lại active CMS tương thích từ lịch sử, giữ tiến độ mới; không phục hồi toàn DB đè dữ liệu học sinh.
