# Chỉnh bố trí vật thể trong admin

## Áp dụng bố trí đã lưu vào game — 15/10/2026

Đã lấy bản nháp revision 3 trên VPS và nhập đủ 23 vật thể bằng `tools/import-scene-layout.cjs`; kiểm tra điểm xuất hiện, ô nhiệm vụ và lối tiếp cận NPC đạt. Bố trí được ghi vào `SceneLayoutPack.ts`, dựng Cocos và API/rooms từ cùng nguồn. ContentVersion chuyển từ `d92c670c` sang `0d971c1a`. Kiểm tra Cocos local xác nhận cả 23 node có đúng vị trí và kích thước theo bản đã lưu; desktop/mobile không page error.

Admin nhận thêm `appliedPack` qua API bố trí để phân biệt **Đã áp dụng trong game** với **Đã lưu, chờ áp dụng**. Lưu bản nháp tiếp theo vẫn cần dựng/phát hành để thay bản đồ game; trạng thái chờ áp dụng hiển thị rõ. Các NPC CMS đã xuất bản được giữ nguyên nội dung và tạo snapshot tương thích với phiên bản nền mới, lịch sử cũ giữ nguyên.

Release `applied-layout-501aa6a-20261015`, source `501aa6a`. Overlay 10 file SHA-256 `b0be1d8c9e7c845cbe584f435849496806018d13a3161b3da7fab8978cf143eb`. Backup `/opt/lang-tri-thuc/backups/database-20261015T154600Z.sql` phục hồi thử đạt; hai API MySQL healthy ở contentVersion mới. Release trước giữ để rollback. API 20 test đạt, một MySQL fixture bỏ qua; build admin/API/client và QA admin HTTPS đạt.

QA game HTTPS đối chiếu đủ 23 node thật với bản lưu revision 3: tồn tại, tọa độ và rộng/cao đều khớp; desktop 1440×900 và mobile ngang 844×390 không page error. Tài khoản game QA đã xóa. API/quyền phòng đạt ở `0d971c1a`. Evidence: `temp/deploy/qa/applied-layout-live/` và `temp/deploy/qa/applied-layout-admin-live/`.

## Lưu nhiều NPC và ghi chú tùy chọn — 15/10/2026

Release hiện tại `npc-batch-c10b260-20261015`, source `c10b260`. Ghi chú vật thể và ghi chú bố trí NPC đều tùy chọn. Thay đổi nhiều NPC được giữ khi chuyển lựa chọn, hiển thị số lượng và dấu `*`, lưu nguyên tử qua `PUT /admin/npc-layout`. Gửi kèm giá trị cũ để tránh ghi đè phiên khác; kiểm tra toàn bộ nhóm cho phép hoán đổi ô và từ chối toàn bộ nhóm nếu có lỗi.

Kiểm tra API: 20 đạt, một MySQL fixture bỏ qua. Kiểm tra trình duyệt riêng xác nhận hoán đổi hai NPC, lưu không ghi chú và tải lại đúng cả hai; lưu vật thể không ghi chú đạt. QA HTTPS xác nhận hai thay đổi NPC vẫn giữ khi chuyển lựa chọn, nút lưu hàng loạt và ghi chú tùy chọn, hoàn tác và desktop/mobile đạt; không ghi thay đổi kiểm thử vào bản nháp live, không page error. Build admin/API đạt.

Overlay 13 file SHA-256 `bac86990492158a1afa560fb5b4276598de50ebce018861f157c78732e8a75a0`; source/game/admin checksum khớp. Backup `/opt/lang-tri-thuc/backups/database-20261015T152311Z.sql` phục hồi thử đạt; hai API MySQL healthy, CMS giữ nguyên và release trước giữ để rollback. Evidence live: `temp/deploy/qa/npc-batch-live/`.

## Sửa thao tác kéo và toàn màn hình — 15/10/2026

Nút chuyển **Nhân vật NPC / Cây, nhà và sân chơi** nằm trong vùng toàn màn hình, luôn có thể chuyển loại đối tượng. Chọn từ danh sách tự bật chế độ chọn. Khi đang kéo nền, vẫn có thể kéo NPC/vật thể đang chọn và nút đổi kích thước của nó. Bấm vật thể khác cần chuyển về chế độ chọn.

Đã triển khai release `scene-drag-84ae6b0-20261015`, source `84ae6b0`; overlay tám file SHA-256 `961e76a9704f6788ffe60ee9f3be0db38154db3f5485d3e17b9db182efdcbcb2`. Backup `/opt/lang-tri-thuc/backups/database-20261015T145609Z.sql` phục hồi thử đạt; hai API MySQL healthy và CMS giữ nguyên. QA local tái hiện kéo NPC ở chế độ kéo nền, chuyển loại trong toàn màn hình và kéo vật thể/đổi kích thước đạt. QA HTTPS toàn màn hình, chuyển sang vật thể, đổi kích thước/hoàn tác và desktop/mobile đạt; bản nháp giữ nguyên, không page error. Evidence: `temp/deploy/qa/scene-drag-live/`.

Mở **Bản đồ NPC → Cây, nhà và sân chơi**. Chọn vật thể từ danh sách hoặc bấm ảnh trên bản đồ. Có thể tìm theo tên/ID, kéo vị trí theo bước ¼ ô, nhập tọa độ và rộng/cao, giữ tỉ lệ hoặc kéo nút vuông ở góc phải dưới để đổi kích thước. Nút **Đến vật thể đang chọn** đưa camera đến vật thể. Kéo nền để xem quanh; có thu phóng và bật/tắt lưới.

**Hoàn tác/Làm lại** áp dụng cho phiên chỉnh sửa; **Hoàn tác vật thể** trả vật thể về lần lưu gần nhất. Ghi chú không bắt buộc và không có độ dài tối thiểu. **Lưu bố trí vật thể** lưu toàn bộ thay đổi vào database bằng giao dịch và số phiên bản; phiên cũ bị từ chối để tránh ghi đè người khác. Bản nháp tồn tại sau khi tải lại trang và không sửa dữ liệu người chơi. Cầu qua ao được khóa vì gắn với đường đi trên mặt nước.

Ở mục **Nhân vật NPC**, có thể chỉnh nhiều NPC rồi chọn **Lưu tất cả vị trí NPC**. Chuyển NPC giữ nguyên các thay đổi chưa lưu; dấu `*` và số lượng NPC chưa lưu giúp theo dõi. **Hoàn tác NPC** chỉ bỏ thay đổi của NPC đang chọn, **Hoàn tác tất cả NPC** bỏ toàn bộ thay đổi trong phiên. Hệ thống kiểm tra cả nhóm rồi lưu trong một giao dịch, hỗ trợ hoán đổi vị trí và từ chối toàn bộ nếu có vị trí sai hoặc một NPC đã được sửa bởi phiên khác. Ghi chú bố trí NPC cũng không bắt buộc.

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
