#!/bin/sh
set -eu
export PATH=/www/server/nodejs/v24.16.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
release_id=$1
archive_name=$2
case "$release_id" in *[!a-zA-Z0-9_-]*|'') exit 2;; esac
case "$archive_name" in *[!a-zA-Z0-9_.-]*|'') exit 2;; esac
release=/opt/lang-tri-thuc/releases/$release_id
[ ! -e "$release" ]
[ -f "/opt/lang-tri-thuc/$archive_name" ]
mkdir "$release"
tar --no-same-owner -xzf "/opt/lang-tri-thuc/$archive_name" -C "$release"
cd "$release"
npm ci --no-audit --no-fund
npm run api:build
npm run server:build
npm prune --omit=dev --no-audit --no-fund
chmod -R a+rX "$release"
/www/server/nginx/sbin/nginx -t
printf '%s\n' 'RELEASE_READY; current release unchanged'
