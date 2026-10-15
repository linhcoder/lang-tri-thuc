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
