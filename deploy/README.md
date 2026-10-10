# Staging MySQL / API / Colyseus / Caddy

## Triển khai aaPanel thực tế — 10/10/2026

Đã triển khai trên `ltt.vui-hoc.xyz` bằng Nginx, Node 24 và MariaDB sẵn có của aaPanel; không chạy Compose/Caddy và không chiếm cổng các site khác. HTTPS/API, phòng riêng hai client, save/reload và restore DB tạm đã đạt. Hướng dẫn vận hành tại [aapanel/README.md](aapanel/README.md). Những ghi chú “chưa có SSH/domain, chưa deploy” bên dưới là trạng thái trước đợt này. Docker vẫn chưa chạy, không cần cho bản aaPanel.

## Tình trạng kiểm chứng — 10/10/2026

Dockerfile hiện dùng build/runtime riêng, cài dependencies production và chạy với user node. Client/server phải build cùng lesson/NPC pack để dấu phiên bản nội dung khớp. Admin export/import không tự triển khai runtime.

API và phòng riêng đã chạy MySQL local. Máy làm việc không có Docker nên **chưa build hoặc chạy Compose**; chưa có VPS/domain/SSH đích nên chưa deploy, kiểm tra TLS/WebSocket hay phục hồi DB Docker live. Các bước dưới đây là runbook cần thực thi tại staging, không phải bằng chứng deployment đã hoàn tất.
Gói cấu hình chuẩn bị cho VPS Linux có Docker Compose. **Chưa triển khai live**: workspace có MySQL Laragon đã kiểm thử, nhưng không có Docker và chưa có SSH host/domain. Không chứa credential thật. Game là prototype nội dung draft, staging UI cần mật khẩu.

1. Chạy `npm ci`, `npm run web:build` trên máy có Creator 3.8.8; chuyển source + `apps/game-client/build/web-desktop` sang checkout staging.
2. Copy `deploy/.env.example` thành `deploy/.env`, thay mọi placeholder bằng secret riêng. Database password dùng ký tự URL-safe. `ROOM_SECRET` tối thiểu 32 ký tự ngẫu nhiên. Giữ file quyền 600.
3. Trỏ DNS domain staging về VPS, mở TCP 80/443; không expose 3000, 2567 hoặc MySQL ra Internet.
4. Sinh mật khẩu hash bằng `docker run --rm -it caddy:2 caddy hash-password`. Trong `.env`, bọc bcrypt hash bằng dấu nháy đơn để Compose không nội suy `$`. [Caddy yêu cầu password hash](https://caddyserver.com/docs/caddyfile/directives/basic_auth).
5. Build admin với URL staging trong PowerShell (thay domain):

```powershell
$env:VITE_API_URL='https://staging.example.com/api'
$env:VITE_SERVER_URL='https://staging.example.com/colyseus'
$env:VITE_GAME_URL='https://staging.example.com/game/'
npm.cmd run admin:build
```

Chuyển `apps/admin/dist` sang VPS. Dockerfile build API/room, không tự cài Creator hoặc tạo web build giả.

```sh
docker compose --env-file deploy/.env -f deploy/compose.yaml config --quiet
docker compose --env-file deploy/.env -f deploy/compose.yaml up --build -d
```

Kiểm tra TLS, UI mật khẩu staging, API health, admin login, tạo hồ sơ, lời mời bạn, WebSocket, server save, reload/rejoin và revoke. Basic auth chỉ bảo vệ UI/static: bearer Authorization của API không bị basic auth chiếm header; WebSocket tự xác thực signed ticket. Không có room `village` development khi bind `0.0.0.0` trừ khi cố ý bật `ALLOW_DEV_ROOMS`.

Admin `admin` chỉ bootstrap khi DB chưa có admin. Thay đổi biến môi trường không reset mật khẩu đã lưu. Không in secret hoặc vé vào access log. Chưa cấu hình CSP chặt vì Creator/browser SDK dùng script runtime; cần CSP audit cùng bản web trước public beta.

## Backup và rollback

Dùng snapshot backup của ứng dụng local bằng `npm run backup:local`. Trên VPS MySQL, có thể dump InnoDB bằng `mysqldump --single-transaction --no-tablespaces`; giữ file riêng và phục hồi thử vào database trống khác trước chuyển dịch vụ.

```sh
mkdir -p private-backups
docker compose --env-file deploy/.env -f deploy/compose.yaml exec -T mysql sh -c 'MYSQL_PWD="$MYSQL_PASSWORD" exec mysqldump --single-transaction --no-tablespaces -u"$MYSQL_USER" "$MYSQL_DATABASE"' > private-backups/staging.sql
```

Không tái sử dụng volume PostgreSQL cũ: compose mới dùng `mysql_database`, giữ nguyên volume cũ nếu có. Database password trong `MYSQL_PASSWORD` dùng ký tự URL-safe; `MYSQL_ROOT_PASSWORD` là secret khác, không cấp cho API.

Kiểm tra row count/state và API với DB phục hồi riêng trước khi chọn nó làm database phục vụ. Không dùng `--clean` hoặc xóa volume trong runbook mặc định. Lưu image/source/build của phiên bản trước; rollback app bằng checkout/tag trước và image trước, giữ DB và backup. Không chạy `docker compose down -v` vì xóa dữ liệu.

Secret DB dump cần giữ ngoài web root, mã hóa và kiểm tra lịch retention/xóa khi phụ huynh yêu cầu. Single JSON row có transaction/row lock nhưng tuần tự hóa toàn bộ state; không dùng benchmark local 20 người để cam kết quy mô production. Multi-instance/Redis/migrations chuẩn hóa là công việc vận hành tiếp sau staging nhỏ.
