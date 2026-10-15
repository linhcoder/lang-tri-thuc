# Chỉnh bố trí vật thể trong admin

Mở **Bản đồ NPC → Cây, nhà và sân chơi**. Chọn vật thể từ danh sách hoặc bấm ảnh trên bản đồ. Có thể tìm theo tên/ID, kéo vị trí theo bước ¼ ô, nhập tọa độ và rộng/cao, giữ tỉ lệ hoặc kéo nút vuông ở góc phải dưới để đổi kích thước. Nút **Đến vật thể đang chọn** đưa camera đến vật thể. Kéo nền để xem quanh; có thu phóng và bật/tắt lưới.

**Hoàn tác/Làm lại** áp dụng cho phiên chỉnh sửa; **Hoàn tác vật thể** trả vật thể về lần lưu gần nhất. Ghi chú cần ít nhất 12 ký tự. **Lưu bố trí vật thể** lưu toàn bộ thay đổi vào database bằng giao dịch và số phiên bản; phiên cũ bị từ chối để tránh ghi đè người khác. Bản nháp tồn tại sau khi tải lại trang và không sửa dữ liệu người chơi. Cầu qua ao được khóa vì gắn với đường đi trên mặt nước.

Bản đồ dùng các ảnh cảnh hiện có trong game, gồm cây đa, nhà, xưởng gốm, trường học, sân bóng, hàng rào, cây và các vật trang trí. Mỗi vật thể có ID riêng dù dùng cùng ảnh.

## Áp dụng vào game

Lưu rồi chọn **Xuất bố trí đã lưu** để tải `scene-layout.json`. Bản nháp chưa tự thay đổi làng đang chơi. Kiểm tra và nhập bằng:

```powershell
node tools/import-scene-layout.cjs C:/path/scene-layout.json --check
node tools/import-scene-layout.cjs C:/path/scene-layout.json
```

Công cụ kiểm tra ID, trùng lặp, tọa độ, kích thước và lối đi trước khi ghi `SceneLayoutPack.ts`. Bố trí chặn điểm xuất hiện, ô trồng lúa hoặc lối tiếp cận NPC bị từ chối. Sau đó build và triển khai **game, backend và room server cùng nhau**. Không chỉ thay ảnh trên client: vị trí và kích thước vùng va chạm được cập nhật từ cùng gói; contentVersion phản ánh thay đổi đường đi. Giữ bản release trước để rollback.

## Kiểm tra

- `npm run test:scene-layout`: kiểm tra dữ liệu render, va chạm và tương thích client/server; chạy trình duyệt kiểm tra kéo vị trí, kéo góc, giữ tỉ lệ, hoàn tác, lưu/tải lại, cầu khóa và desktop/mobile trên database SQLite riêng.
- `npm run test:api`: kiểm tra quyền admin, lưu nguyên tử, xung đột phiên và từ chối dữ liệu sai.
- `npm run check:client`, `npm run test:client`, build admin/API/server/Cocos.

API riêng: `GET/PUT /admin/scene-layout`, danh sách vật thể nằm trong `GET /admin/scene`. Dữ liệu được lưu ở `BackendData.sceneLayout`; không cần đổi cấu trúc bảng MySQL.

## VPS 15/10/2026

Đã triển khai `scene-layout-c379c7f-20261015`, source commit `c379c7f`, contentVersion `d92c670c`. Chưa áp dụng thay đổi bố trí nào vào bản game mặc định. Backup `/opt/lang-tri-thuc/backups/database-20261015T130613Z.sql` phục hồi thử đạt. Hai API MySQL healthy; CMS giữ nguyên, bản `potter-1a05ffb-20261015` giữ để rollback.

Admin được phục vụ ở gốc domain, build dùng base `/`. Đã sửa index sau khi kiểm tra phát hiện tiền tố `/admin/` không khớp Nginx. Gói overlay cuối gồm 28 file, SHA-256 `4f8f4b6d4e6946d0f60d942716fa98603e6ba087f22569faabcd2e5b43740e02`; manifest cuối kiểm tra lại toàn bộ source/game/admin.

QA local: TypeScript, 64 nhóm test client và sáu lifecycle/startup; API 19 đạt, một MySQL fixture bỏ qua; build admin/API/rooms/Cocos đạt. Kiểm tra import chấp nhận sân bóng hợp lệ và từ chối nhà chặn điểm xuất hiện. Kiểm tra trình duyệt riêng xác nhận lưu/tải lại, kéo vị trí, kéo góc, giữ tỉ lệ, hoàn tác và desktop/mobile. Game Cocos với bố trí mặc định tiếp tục qua QA.

QA HTTPS đăng nhập admin, tải ảnh cảnh, chọn sân bóng, đổi kích thước và hoàn tác, desktop/mobile đạt, không page error; bản nháp trên VPS trước/sau giống nhau và phiên QA đã thu hồi. Kiểm tra API/quyền phòng đạt. Evidence local: `apps/admin/temp/layout-qa/`; live: `temp/deploy/qa/scene-layout-live/`.
