# MySQL Laragon — 09/10/2026

Backend hiện dùng **MySQL**, thay adapter PostgreSQL và SQLite runtime. Laragon localhost đã kiểm tra là MySQL **8.4.3**, cổng **3306**. Database `lang_tri_thuc`, tài khoản dự án `lang_tri_thuc_app` giới hạn trong database dự án/test; password ngẫu nhiên nằm trong `.env.local` bị Git ignore. Backend không chạy bằng root.

Dữ liệu cũ từ `apps/backend/.data/game.sqlite` đã chuyển và so sánh đọc lại khớp bằng deep equality. File SQLite gốc và backup trước chuyển giữ nguyên. Admin, hồ sơ, tiến độ, receipt, nội dung và báo cáo đều đi cùng state. Không có thay đổi scene, asset hoặc code gameplay.

## Chạy

Laragon → Start MySQL, rồi tại root repo:

```powershell
npm.cmd ci
npm.cmd run db:setup
npm.cmd run server:build
npm.cmd run local:stack
```

`db:setup` tạo database/app user nếu chưa có, ghi cấu hình riêng; không reset mật khẩu user có sẵn. Nếu Laragon root có password, đặt `MYSQL_ADMIN_PASSWORD` chỉ trong môi trường terminal trước setup; không đưa password vào lệnh/log/Git. `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_ADMIN_USER` có thể cấu hình khi provisioning; helper mặc định 127.0.0.1:3306. Setup dành cho database localhost của dự án, không tự cấp quyền vào database ngoài.

Trên máy mới còn SQLite cần chuyển: dừng local stack, chạy `npm run backup:sqlite`, rồi `npm run db:setup -- --migrate-sqlite`. Migration từ chối ghi đè nếu MySQL đã có dữ liệu; không chạy lại migration để reset database.

Game: `http://127.0.0.1:38080/`; phụ huynh/admin: `http://127.0.0.1:35173/`; health: `http://127.0.0.1:33000/health` trả `storage: mysql`. Save browser vẫn giữ key/profile và hoạt động offline như cũ; chỉ dữ liệu backend chuyển storage.

## Kiểm thử và backup

```powershell
npm.cmd run test:mysql
npm.cmd run test:stack
npm.cmd run backup:local
node tools/backup-mysql.cjs --verify artifacts/backups/<ten-file>.json
```

`test:mysql` chạy API auth/ownership/review trên **`lang_tri_thuc_test`**, kiểm tra rollback, 20 transaction ghi đồng thời qua hai pool, Unicode tiếng Việt/emoji và reconnect bền vững. Test database được reset; không dùng production URL cho test. Các kiểm thử này đã pass trên MySQL Laragon thật. SQLite in-memory chỉ giữ cho unit test và công cụ migration/backup cũ.

`backup:local` đọc snapshot MySQL nhất quán của row state, lưu JSON kèm SHA-256, đọc lại kiểm chứng trong `artifacts/backups` (Git ignored). Backup có credential hash và tiến độ, cần giữ riêng. `backup:sqlite` chỉ dành cho file legacy, không backup dữ liệu MySQL mới.

Phục hồi vào **database riêng còn trống**, kiểm checksum/format trước, khởi tạo `MySqlRepository` rồi nhập `state` trong transaction; xác minh API/profile/progress trước đổi `DATABASE_URL`. Không import đè database đang phục vụ. Chưa tự chạy phục hồi production hoặc Docker/VPS.

Storage vẫn là snapshot JSON single-row của prototype, InnoDB và transaction `SELECT ... FOR UPDATE` ngăn mất cập nhật đồng thời; chưa chuyển sang schema nhiều bảng cho quy mô production. Driver dùng pool/prepared statements theo [MySQL2](https://sidorares.github.io/node-mysql2/docs); row locking theo [MySQL 8.4](https://dev.mysql.com/doc/refman/8.4/en/innodb-locking-reads.html).
