#!/bin/sh
set -eu
test "$(id -u)" = 0
test -f /opt/lang-tri-thuc/current/deploy/aapanel/backup-job.py
install -d -m 0700 /opt/lang-tri-thuc/backups/automatic
install -d -m 0700 /opt/lang-tri-thuc/operations
install -m 0700 /opt/lang-tri-thuc/current/deploy/aapanel/backup-job.py /opt/lang-tri-thuc/operations/backup-job.py
for unit in lang-tri-thuc-backup.service lang-tri-thuc-backup.timer lang-tri-thuc-restore-verify.service lang-tri-thuc-restore-verify.timer; do
    install -m 0644 "/opt/lang-tri-thuc/current/deploy/aapanel/$unit" "/etc/systemd/system/$unit"
done
systemd-analyze verify /etc/systemd/system/lang-tri-thuc-backup.service /etc/systemd/system/lang-tri-thuc-backup.timer /etc/systemd/system/lang-tri-thuc-restore-verify.service /etc/systemd/system/lang-tri-thuc-restore-verify.timer
systemctl daemon-reload
systemctl start lang-tri-thuc-backup.service
systemctl start lang-tri-thuc-restore-verify.service
systemctl enable --now lang-tri-thuc-backup.timer lang-tri-thuc-restore-verify.timer
systemctl list-timers --all lang-tri-thuc-backup.timer lang-tri-thuc-restore-verify.timer --no-pager
