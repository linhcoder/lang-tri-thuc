#!/bin/sh
# Apply a verified overlay to a copy of the current release. Never activate here.
set -eu
export PATH=/www/server/nodejs/v24.16.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
base_id=$1
release_id=$2
archive_name=$3
expected_sha=$4
for id in "$base_id" "$release_id"; do
    case "$id" in *[!a-zA-Z0-9_-]*|'') exit 2;; esac
done
case "$archive_name" in *[!a-zA-Z0-9_.-]*|'') exit 2;; esac
case "$expected_sha" in *[!a-f0-9]*|'') exit 2;; esac
test ${#expected_sha} -eq 64
root=/opt/lang-tri-thuc
base=$root/releases/$base_id
release=$root/releases/$release_id
test "$(readlink -f "$root/current")" = "$base"
test -d "$base"
test ! -e "$release"
test -f "$root/$archive_name"
printf '%s\n' "$expected_sha  $root/$archive_name" | sha256sum -c -
cp -a "$base" "$release"
tar --no-same-owner -xzf "$root/$archive_name" -C "$release"
cd "$release"
npm ci --no-audit --no-fund
npm run api:build
npm run server:build
npm prune --omit=dev --no-audit --no-fund
chmod -R a+rX "$release"
/www/server/nginx/sbin/nginx -t
printf '%s\n' 'OVERLAY_READY; current release unchanged'
