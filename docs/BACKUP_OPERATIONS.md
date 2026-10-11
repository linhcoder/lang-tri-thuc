# Backup tự động và phục hồi thử — 11/10/2026

Job của ứng dụng dùng systemd timer riêng, không thay cron/timer của aaPanel hay các site khác:

- Backup mỗi ngày lúc 02:00, giờ Việt Nam (UTC+7).
- Phục hồi thử Chủ nhật lúc 02:30, giờ Việt Nam.
- Persistent=true chạy bù nếu VPS tắt đúng thời điểm lịch.
- Dump tự động ở `/opt/lang-tri-thuc/backups/automatic`, thư mục 0700, SQL/JSON 0600, chỉ root đọc. Không đưa vào web root hoặc Git.

`backup-job.py` dùng mysqldump single transaction, ghi file tạm trước khi công bố và tạo SHA-256. Hai job dùng cùng file lock. Khi verify, kiểm tra checksum rồi import vào DB ngẫu nhiên có prefix `lang_tri_thuc_restore_`; redump dữ liệu và so với snapshot trong file backup. Không so với DB live vì live có thể thay đổi trong lúc kiểm tra. DB thử bị xóa trong finally; chỉ ghi last-restore.json sau khi hoàn tất đúng.

Installer lưu bản chạy tại `/opt/lang-tri-thuc/operations/backup-job.py`, độc lập với symlink release game, để rollback ứng dụng không làm mất job backup. Cài lại installer khi cập nhật code vận hành này.

## Retention

Mặc định giữ 30 ngày, luôn giữ ít nhất bảy bản mới nhất và bản được phục hồi thành công gần nhất. Chỉ dọn file regular khớp tên `auto-YYYYMMDDTHHMMSSZ-xxxxxxxx.sql` trong thư mục automatic và metadata tương ứng. Backup thủ công, release, file lạ hoặc symlink không nằm trong phạm vi dọn. Dọn sau một backup mới thành công.

Thay LTT_BACKUP_RETENTION_DAYS trong drop-in của service nếu cần chính sách khác (7–365 ngày). Không sửa trực tiếp unit sẽ bị ghi đè khi cài lại từ repo.

## Cài và kiểm tra

Chạy `sh /opt/lang-tri-thuc/current/deploy/aapanel/install-backup-timers.sh`. Script cài unit, kiểm tra cú pháp, chạy backup và phục hồi thử ngay rồi bật hai timer. Chỉ hoàn tất cài khi hai job đầu thành công.

```sh
TZ=Asia/Bangkok systemctl list-timers --all lang-tri-thuc-backup.timer lang-tri-thuc-restore-verify.timer
systemctl status lang-tri-thuc-backup.service lang-tri-thuc-restore-verify.service
journalctl -u lang-tri-thuc-backup.service -u lang-tri-thuc-restore-verify.service --since today
cat /opt/lang-tri-thuc/backups/automatic/last-restore.json
```

Lỗi job hiện trong status/journal; chưa có thông báo ra email/chat hoặc bản sao offsite. Backup trên cùng VPS không bảo vệ trước mất toàn bộ VPS. Mục này cần bổ sung đích offsite và kênh báo lỗi khi triển khai vận hành rộng hơn.

## Kết quả cài live

Ngày 11/10/2026, hai timers đã enabled trên VPS, cả backup và restore service Result=success/ExecMainStatus=0. Lịch kế tiếp lúc kiểm tra: backup 02:00 ngày 12/10/2026 và restore drill 02:30 Chủ nhật 18/10/2026, UTC+7. Phục hồi dump khớp checksum/snapshot kể cả trong khi QA live thêm/xóa tài khoản. DB thử đã xóa, thư mục mode 0700 và metadata mode 0600.
