"""Application-only Redis, second room process, and authenticated operational monitoring."""
import argparse, os, pathlib, secrets, shutil, subprocess
ROOT=pathlib.Path('/opt/lang-tri-thuc');CONFIG=pathlib.Path('/etc/lang-tri-thuc');SOURCE=pathlib.Path(__file__).resolve().parent
def run(args):subprocess.run(args,check=True)
def write(path,text,mode=0o600):path.parent.mkdir(parents=True,exist_ok=True);path.write_text(text);os.chmod(path,mode)
def main():
 parser=argparse.ArgumentParser();parser.add_argument('stage',choices=['prepare','enable']);stage=parser.parse_args().stage
 if os.geteuid()!=0:raise SystemExit('Run application installer as root')
 binary=ROOT/'runtime/redis/usr/bin/redis-server';assert binary.is_file()
 redisdir=ROOT/'redis';redisdir.mkdir(exist_ok=True);shutil.chown(redisdir,user='langtri',group='langtri');os.chmod(redisdir,0o700)
 scale=CONFIG/'scale.env'
 if not scale.exists():
  password=secrets.token_urlsafe(36);write(scale,'REDIS_URL=redis://:'+password+'@127.0.0.1:36379/0\n')
  conf=CONFIG/'redis.conf';write(conf,'bind 127.0.0.1\nport 36379\nprotected-mode yes\nrequirepass '+password+'\nsave ""\nappendonly no\nmaxmemory 256mb\nmaxmemory-policy noeviction\ndir /opt/lang-tri-thuc/redis\n');shutil.chown(conf,user='root',group='langtri');os.chmod(conf,0o640)
 unit='''[Unit]
Description=Lang Tri Thuc isolated Redis presence
After=network.target
[Service]
User=langtri
Group=langtri
Environment=LD_LIBRARY_PATH=/opt/lang-tri-thuc/runtime/redis/usr/lib/x86_64-linux-gnu
ExecStart=/opt/lang-tri-thuc/runtime/redis/usr/bin/redis-server /etc/lang-tri-thuc/redis.conf
Restart=on-failure
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/lang-tri-thuc/redis
[Install]
WantedBy=multi-user.target
'''
 write(pathlib.Path('/etc/systemd/system/lang-tri-thuc-redis.service'),unit,0o644);run(['systemctl','daemon-reload']);run(['systemctl','enable','--now','lang-tri-thuc-redis']);run(['systemctl','is-active','--quiet','lang-tri-thuc-redis'])
 if stage=='prepare':print('Application Redis ready; live rooms unchanged');return
 roomunit=(SOURCE/'lang-tri-thuc-rooms.service').read_text().replace('Description=Lang Tri Thuc private multiplayer rooms','Description=Lang Tri Thuc second room instance').replace('After=network.target lang-tri-thuc-api.service','After=network.target lang-tri-thuc-api.service lang-tri-thuc-redis.service').replace('EnvironmentFile=/etc/lang-tri-thuc/rooms.env','EnvironmentFile=/etc/lang-tri-thuc/rooms.env\nEnvironmentFile=/etc/lang-tri-thuc/scale.env\nEnvironment=PORT=32581\nEnvironment=API_URL=http://127.0.0.1:33082\nEnvironment=PUBLIC_ADDRESS=ltt.vui-hoc.xyz/colyseus/b')
 write(pathlib.Path('/etc/systemd/system/lang-tri-thuc-rooms-b.service'),roomunit,0o644)
 write(pathlib.Path('/etc/systemd/system/lang-tri-thuc-rooms.service.d/scaling.conf'),'[Unit]\nAfter=lang-tri-thuc-redis.service\n[Service]\nEnvironmentFile=/etc/lang-tri-thuc/scale.env\nEnvironment=API_URL=http://127.0.0.1:33082\nEnvironment=PUBLIC_ADDRESS=ltt.vui-hoc.xyz/colyseus/a\n',0o644)
 apiunit=(SOURCE/'lang-tri-thuc-api.service').read_text().replace('Description=Lang Tri Thuc parent API','Description=Lang Tri Thuc second API instance').replace('After=network.target mariadb.service','After=network.target mariadb.service lang-tri-thuc-redis.service').replace('EnvironmentFile=/etc/lang-tri-thuc/api.env','EnvironmentFile=/etc/lang-tri-thuc/api.env\nEnvironmentFile=/etc/lang-tri-thuc/scale.env\nEnvironment=API_PORT=33081\nEnvironment=INSTANCE_ID=b\nEnvironment=TRUST_LOOPBACK_PROXY=1')
 write(pathlib.Path('/etc/systemd/system/lang-tri-thuc-api-b.service'),apiunit,0o644)
 write(pathlib.Path('/etc/systemd/system/lang-tri-thuc-api.service.d/scaling.conf'),'[Unit]\nAfter=lang-tri-thuc-redis.service\n[Service]\nEnvironmentFile=/etc/lang-tri-thuc/scale.env\nEnvironment=INSTANCE_ID=a\nEnvironment=TRUST_LOOPBACK_PROXY=1\n',0o644)
 target=pathlib.Path('/www/server/panel/vhost/nginx/extension/ltt.vui-hoc.xyz/lang-tri-thuc.conf');before=target.read_text();backup=ROOT/'operations/nginx-before-scaling.conf'
 if 'location ^~ /colyseus/a/' not in before:
  write(backup,before)
  assert '/www/server/panel/vhost/nginx/*.conf' in pathlib.Path('/www/server/nginx/conf/nginx.conf').read_text()
  upstream=pathlib.Path('/www/server/panel/vhost/nginx/lang-tri-thuc-upstreams.conf')
  write(upstream,'upstream lang_tri_thuc_api { least_conn; server 127.0.0.1:33080; server 127.0.0.1:33081; }\nupstream lang_tri_thuc_rooms { least_conn; server 127.0.0.1:32580; server 127.0.0.1:32581; }\nserver { listen 127.0.0.1:33082; server_name localhost; access_log off; location / { proxy_pass http://lang_tri_thuc_api; proxy_set_header Host $host; proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; } }\n',0o644)
  before=before.replace('proxy_pass http://127.0.0.1:33080/;','proxy_pass http://lang_tri_thuc_api/;').replace('proxy_pass http://127.0.0.1:32580/;','proxy_pass http://lang_tri_thuc_rooms/;')
  locations=''
  for name,port in [('a',32580),('b',32581)]:locations+='location ^~ /colyseus/'+name+'/ {\n auth_basic off;\n proxy_pass http://127.0.0.1:'+str(port)+'/;\n proxy_http_version 1.1;\n proxy_set_header Upgrade $http_upgrade;\n proxy_set_header Connection "upgrade";\n proxy_set_header Host $host;\n proxy_set_header X-Forwarded-Proto $scheme;\n proxy_read_timeout 90s;\n proxy_buffering off;\n access_log off;\n}\n'
  write(target,locations+before,0o644)
  try:run(['/www/server/nginx/sbin/nginx','-t'])
  except Exception:write(target,backup.read_text(),0o644);upstream.unlink(missing_ok=True);raise
 api=CONFIG/'api.env';data=api.read_text()
 if 'OPERATIONS_STATUS_FILE=' not in data:write(api,data.rstrip()+'\nOPERATIONS_STATUS_FILE=/opt/lang-tri-thuc/monitor/status.json\n')
 monitor=ROOT/'monitor';monitor.mkdir(exist_ok=True);shutil.chown(monitor,user='root',group='langtri');os.chmod(monitor,0o750)
 operations=ROOT/'operations';operations.mkdir(exist_ok=True);shutil.copyfile(SOURCE/'monitor-job.py',operations/'monitor-job.py')
 for filename in ['lang-tri-thuc-monitor.service','lang-tri-thuc-monitor.timer']:shutil.copyfile(SOURCE/filename,pathlib.Path('/etc/systemd/system')/filename)
 run(['systemctl','daemon-reload']);run(['systemctl','restart','lang-tri-thuc-api','lang-tri-thuc-rooms']);run(['systemctl','enable','--now','lang-tri-thuc-api-b','lang-tri-thuc-rooms-b','lang-tri-thuc-monitor.timer']);run(['systemctl','reload','nginx']);run(['systemctl','start','lang-tri-thuc-monitor.service']);print('Two API/room instances and operational monitor enabled')
if __name__=='__main__':main()
