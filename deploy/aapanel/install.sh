#!/bin/sh
set -eu
export PATH=/www/server/nodejs/v24.16.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
release=/opt/lang-tri-thuc/releases/bce9172-aapanel-20261010
mkdir -p /opt/lang-tri-thuc/releases
if [ ! -d "$release" ]; then
    mkdir "$release"
    tar -xzf /root/ltt-release.tar.gz -C "$release"
fi
cd "$release"
npm ci --no-audit --no-fund
npm run api:build
npm run server:build
npm prune --omit=dev --no-audit --no-fund
chmod -R a+rX "$release"
ln -s "$release" /opt/lang-tri-thuc/current.next
mv -Tf /opt/lang-tri-thuc/current.next /opt/lang-tri-thuc/current
install -m 0644 deploy/aapanel/lang-tri-thuc-api.service /etc/systemd/system/lang-tri-thuc-api.service
install -m 0644 deploy/aapanel/lang-tri-thuc-rooms.service /etc/systemd/system/lang-tri-thuc-rooms.service
systemctl daemon-reload
systemctl enable --now lang-tri-thuc-api.service lang-tri-thuc-rooms.service
attempt=0
until curl -fsS http://127.0.0.1:33080/health >/dev/null; do
    attempt=$((attempt+1))
    if [ "$attempt" -ge 20 ]; then echo 'API did not become healthy'; exit 1; fi
    sleep 1
done
target=/www/server/panel/vhost/nginx/extension/ltt.vui-hoc.xyz/lang-tri-thuc.conf
if [ -e "$target" ]; then echo 'Existing application Nginx extension requires explicit update'; exit 1; fi
install -m 0644 deploy/aapanel/nginx.locations.conf "$target"
if ! /www/server/nginx/sbin/nginx -t; then
    mv "$target" /opt/lang-tri-thuc/nginx-extension.failed
    exit 1
fi
systemctl reload nginx
systemctl is-active lang-tri-thuc-api lang-tri-thuc-rooms
curl -fsS http://127.0.0.1:33080/health
echo
echo 'Services installed; validate external HTTPS and signed WebSocket before acceptance.'
