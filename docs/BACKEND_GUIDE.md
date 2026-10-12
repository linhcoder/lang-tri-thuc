# Quản trị, phụ huynh và vận hành

Bản nâng cấp và bằng chứng kiểm tra: [BACKEND_QA](BACKEND_QA.md).

Đã bổ sung Góp ý chơi thử/Phản hồi chơi thử cho phụ huynh và quản trị: [PLAYTEST_GUIDE](PLAYTEST_GUIDE.md). Góp ý được xuất theo tài khoản và xóa khi rút lại/xóa tài khoản; API mới có trong OpenAPI.

## Dùng giao diện

Phụ huynh đăng nhập bằng bí danh, thêm tối đa tám hồ sơ theo mức học. Đổi tên hiển thị bằng nút Đổi tên; không cần tên thật của trẻ. Xem tiến độ hiển thị sao truyện riêng với kết quả mini game. Phiên đăng nhập giữ trong tab khi tải lại và được kiểm tra với máy chủ; đăng xuất sẽ xóa phiên.

Trong Chuẩn bị phòng chơi, chọn hồ sơ và một trong ba cách: tạo mới, dùng lại phòng đã tham gia hoặc nhận mã mời. Vé và mã mời hết hạn sau 15 phút. Chỉ chia sẻ mã mời với phụ huynh bạn; nút mở game dùng vé riêng của hồ sơ đã chọn. Đổi hồ sơ/cách vào phòng sẽ xóa vé đang chọn, tránh mở nhầm trẻ. Chủ phòng có thể khóa hoặc mở khóa. Danh sách chỉ hiển thị phòng còn hạn và đã được cấp quyền.

Quản trị viên có Tổng quan: tài khoản, hồ sơ, phòng còn hạn, báo cáo và trạng thái nội dung. Nội dung/Bài học/NPC có tìm kiếm và lọc. Kiểm duyệt dùng form ghi chú; chỉ có thể duyệt sau khi kiểm tra. Sửa nội dung đưa bản ghi về nháp. Xuất gói và build game/server để áp dụng nội dung, theo quy trình sẵn có. Nhật ký lưu thao tác quản trị. Hệ thống và API kiểm tra API/DB và cho tải tài liệu OpenAPI.

## Khởi động local

```powershell
npm.cmd run db:setup
npm.cmd run api:build
npm.cmd run server:build
npm.cmd run admin:build
npm.cmd run local:stack
```

Game cần có build `apps/game-client/build/web-desktop/index.html` (tạo bằng `npm.cmd run web:build`). Trang phụ huynh/quản trị: http://127.0.0.1:35173, game: http://127.0.0.1:38080, API: http://127.0.0.1:33000. Thông tin local ở `.env.local`, không chia sẻ hoặc đưa vào Git.

```powershell
npm.cmd run backend:doctor
npm.cmd run backend:doctor -- --json
```

Doctor chỉ đọc và kiểm tra build/kết nối, không sửa hoặc in mật khẩu. Mã thoát 1 nghĩa là có mục cần xử lý. API khác địa chỉ mặc định có thể đặt `DOCTOR_API_URL`.

## API

Đường dẫn tương đối dưới API_URL; trên staging là `/api`. Đăng nhập bằng `POST /sessions` với `{alias,password}`. Dùng token trả về trong `Authorization: Bearer TOKEN`, không đưa token vào URL hoặc nhật ký.

| Endpoint | Dùng để | Quyền |
| --- | --- | --- |
| GET /health | Phiên bản ứng dụng | Công khai |
| GET /ready | Kiểm tra kết nối DB | Công khai |
| GET /me | Kiểm tra phiên, vai trò và bí danh | Đăng nhập |
| GET /profiles | Hồ sơ của tài khoản | Chủ sở hữu |
| PUT /profiles/:id | Đổi tên `{label}`, tối đa 40 ký tự | Chủ sở hữu |
| GET /rooms | Phòng còn hạn đã được cấp quyền | Đăng nhập |
| GET /admin/overview | Số liệu tổng quan, không trả mật khẩu/vé | Quản trị |
| GET /admin/api-docs | OpenAPI sinh từ route/schema hiện tại | Quản trị |

Lỗi có `statusCode`, `code`, `message` tiếng Việt và `requestId`; lỗi nhập có thêm `fields`. 401 cần đăng nhập lại hoặc tài khoản có quyền; 409 cần tải dữ liệu mới hoặc hoàn tất bước kiểm tra trước khi duyệt; 429 chờ một phút. Lỗi máy chủ không trả thông tin kết nối hay stack trace.

Sao lưu/phục hồi và cập nhật VPS theo [runbook](../deploy/aapanel/README.md). Không chạy sửa nội dung hoặc xóa dữ liệu trên tài khoản thật để thử chức năng; kiểm thử dùng database riêng.
