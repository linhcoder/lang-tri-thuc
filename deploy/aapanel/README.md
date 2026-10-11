# aaPanel staging: ltt.vui-hoc.xyz

Triển khai riêng dưới `/opt/lang-tri-thuc`, dùng Nginx/Node 24/MariaDB hiện có của aaPanel. Không dùng Compose/Caddy vì cổng 80/443 đang phục vụ các site khác. Giao diện preview yêu cầu tài khoản staging; API dùng bearer, WebSocket dùng vé phụ huynh.

## Bố trí

- Release đang chạy: `/opt/lang-tri-thuc/releases/72a3a50-no-logo-e48dccf3-20261011`, source commit `72a3a50`, contentVersion `e48dccf3`. Bản trước `/opt/lang-tri-thuc/releases/9b48e24-art-e48dccf3-20261011` giữ để rollback. Symlink `/opt/lang-tri-thuc/current`; RELEASE.txt ghi nguồn bản phát hành.
- Admin: `https://ltt.vui-hoc.xyz/`; game: `/game/`; API: `/api/`; Colyseus: `/colyseus/`.
- Hai systemd service `lang-tri-thuc-api`, `lang-tri-thuc-rooms`, user `langtri`.
- Cổng chỉ bind `127.0.0.1:33080` và `127.0.0.1:32580`; `ALLOW_DEV_ROOMS=0` tắt room development kể cả loopback. `/api/internal/` bị chặn từ Nginx.
- DB riêng `lang_tri_thuc`, user giới hạn database `lang_tri_thuc_app` trên MariaDB 10.11 của VPS; repository tương thích MySQL.
- Secret root-only `/etc/lang-tri-thuc/api.env`, `rooms.env`, `access.txt`; Nginx chỉ đọc hash preview qua nhóm `www`. Không copy các file này vào repo/web root.
- aaPanel giữ cấu hình chính/certificate và đường dẫn `/.well-known/` cũ; extension riêng `.../vhost/nginx/extension/ltt.vui-hoc.xyz/lang-tri-thuc.conf`.

## Build và cập nhật

`prepare.py` dành cho lần triển khai đầu và cố ý từ chối database đã có. Nó sao lưu site trước khi tạo DB, sinh secret riêng và không in mật khẩu. Không chạy lại để reset tài khoản. Node path trong unit/install hiện khớp bản aaPanel đã kiểm tra, cần cập nhật nếu aaPanel gỡ Node đó.

Build Cocos trên máy có Creator 3.8.8. Build admin với VITE_API_URL/VITE_SERVER_URL/VITE_GAME_URL trỏ domain. Bundle source từ Git và hai thư mục build thành `public/game`, `public/admin`; loại `.env`, backup, temp, node_modules. `install.sh` cài dependencies, build backend/rooms trên Linux, prune dev, tạo symlink, cài services và test Nginx trước reload. Script này là **lần cài đầu**; nó từ chối ghi đè extension đã có.

Lần cập nhật sau dùng release mới, build và health check trước khi đổi symlink; giữ secret/DB và release trước. Sau đổi symlink phải restart cả hai service để tránh client/server khác gói nội dung. Kiểm tra health, admin, signed WebSocket, save/reload trước khi kết thúc.

## Vận hành / rollback

```sh
systemctl status lang-tri-thuc-api lang-tri-thuc-rooms
curl -fsS http://127.0.0.1:33080/health
/www/server/nginx/sbin/nginx -t
python3 /opt/lang-tri-thuc/current/deploy/aapanel/backup-verify.py
```

Backup SQL lưu root-only trong `/opt/lang-tri-thuc/backups/`. Restore drill tạo một DB tên ngẫu nhiên riêng, so SHA-256 state và chỉ xóa DB thử đó; không sửa DB đang phục vụ. Snapshot state prototype chứa dữ liệu tài khoản nên phải bảo vệ và có retention theo chính sách vận hành.

Rollback app: đổi `current` về release đã kiểm tra trước, restart hai service; giữ DB. Rollback lần cài đầu: dừng/disable **hai service của ứng dụng**, chuyển extension riêng ra thư mục backup, chạy nginx -t rồi reload. Site aaPanel gốc chưa bị thay root/cert/file; không xóa database hoặc thư mục backup.

Chạy `node deploy/aapanel/verify-web.cjs` trên máy QA có file local ignored `temp/deploy/access.txt`. Suite tạo tài khoản thử rồi xóa nó ở finally, không sử dụng tài khoản admin thật. Chưa thay thế soak WAN, kiểm thử thiết bị thật hoặc biên tập nội dung trước beta.

`node deploy/aapanel/verify-api.cjs` kiểm tra admin/catalog, chặn UI anonymous/internal API, từ chối room development và phòng riêng thiếu vé; logout phiên admin thử ở finally.

## Cập nhật completion — đã triển khai 11/10/2026

Gói `temp/deploy/completion-release.tar.gz` chứa source working tree, public/admin dùng URL staging, public/game build completion-v1. Metadata/SHA-256 ở completion-release.json; contentVersion e48dccf3. Đã upload và activate qua SSH ngày 11/10/2026; SHA-256 archive khớp local, backend/rooms build trên Linux đạt, hai services active và HTTPS health MySQL trả contentVersion e48dccf3. Backup SQL và restore drill khớp state trước khi chuyển release.

Để triển khai một bản cập nhật tương tự, upload archive vào `/opt/lang-tri-thuc/completion-release.tar.gz` và script local `deploy/aapanel/update-release.sh` vào `/opt/lang-tri-thuc/update-release.sh`, rồi chạy:

```sh
sh /opt/lang-tri-thuc/update-release.sh 0b4a42e-completion-e48dccf3-20261011 completion-release.tar.gz
python3 /opt/lang-tri-thuc/releases/0b4a42e-completion-e48dccf3-20261011/deploy/aapanel/activate-release.py 0b4a42e-completion-e48dccf3-20261011 e48dccf3
```

Script update chỉ chuẩn bị release mới. Script activate kiểm tra health MySQL/contentVersion và hai services, tự rollback app khi sai; giữ DB/secret. Sau activate chạy verify-api.cjs, verify-web.cjs và test đồng bộ trên hai browser. Chưa thay thế nghiệm thu trẻ/thiết bị thật hoặc soak WAN.

QA live ngày 11/10/2026 đạt HTTPS/admin/catalog, chặn UI anonymous/internal API/room không có vé, parent UI, signed WebSocket hai client, ngoại hình/cử chỉ, lưu tiến trình và reload online/offline. Tranh vẽ desktop được lưu trên MySQL và khôi phục ở browser mobile cùng hồ sơ trong phòng riêng khác; không mở trùng một hồ sơ trong cùng phòng. Browser errors rỗng. Báo cáo local ignored tại `temp/deploy/qa/api-report.json` và `report.json`.

## Deploy art — 11/10/2026

Đã activate release art sau khi kiểm tra SHA-256 delta, backup/restore drill khớp state, build backend/rooms trên Linux và nginx -t đạt. Delta được áp dụng vào bản sao release completion; không sửa thư mục đang phục vụ trong lúc chuẩn bị. Hai services active, health MySQL cùng contentVersion e48dccf3. Các file static cũ giữ trong bản sao release nhưng index/manifest dùng bundle art mới.

QA live đạt API/admin/quyền truy cập, parent UI, signed WebSocket hai client, avatar/hair/emote, save/reload online/offline và errors rỗng. Test art trên HTTPS đạt tám NPC × tám hướng không mirror và đủ 12 bảng desktop/Android giả lập; ảnh ở apps/game-client/temp/art-polish-qa. Các gate biên tập, người làm art, trẻ và thiết bị thật vẫn còn.

## Bỏ splash Cocos — 11/10/2026

Commit `72a3a50` tắt splash trong tools/build-web.cjs: totalTime=0, logo.type=none và bỏ base64 logo. Mỗi lần build Web đều áp dụng cấu hình này. So sánh build cho thấy chỉ public/game/src/settings.json thay đổi. Đã deploy vào release riêng, SHA-256 khớp, giữ release art để rollback; API/rooms dùng runtime cũ cùng contentVersion, không thay DB/secret. Browser local/live xác nhận settings không có logo, splash thời lượng 0, game tải được và errors rỗng.
