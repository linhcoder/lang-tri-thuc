"""Run as root on the explicitly selected aaPanel VPS. Never prints secrets."""
import os,pathlib,secrets,sqlite3,subprocess,datetime,pwd,grp,json
base=pathlib.Path('/opt/lang-tri-thuc')
private=pathlib.Path('/etc/lang-tri-thuc')
stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
backup=base/'backups'/stamp
backup.mkdir(parents=True,exist_ok=False)
os.chmod(base/'backups',0o700)
for path in [pathlib.Path('/www/server/panel/vhost/nginx/ltt.vui-hoc.xyz.conf')]:
    (backup/path.name).write_bytes(path.read_bytes())
subprocess.run(['tar','-czf',str(backup/'previous-site.tar.gz'),'-C','/www/wwwroot','ltt.vui-hoc.xyz'],check=True)
connection=sqlite3.connect('/www/server/panel/data/default.db')
root_password=connection.execute('SELECT mysql_root FROM config LIMIT 1').fetchone()[0]
connection.close()
mysql_env={**os.environ,'MYSQL_PWD':root_password}
def sql(query):
    process=subprocess.run(['mysql','-uroot','-N','-B'],input=query,text=True,capture_output=True,env=mysql_env)
    if process.returncode:raise RuntimeError('Database preparation failed; check aaPanel database credentials (no secret logged)')
    return process.stdout.strip()
if sql("SELECT schema_name FROM information_schema.schemata WHERE schema_name='lang_tri_thuc';"):
    raise RuntimeError('Application database already exists: refusing to replace credentials or data')
db_password=secrets.token_urlsafe(32)
sql("CREATE DATABASE lang_tri_thuc CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; CREATE USER 'lang_tri_thuc_app'@'127.0.0.1' IDENTIFIED BY '"+db_password+"'; GRANT ALL PRIVILEGES ON lang_tri_thuc.* TO 'lang_tri_thuc_app'@'127.0.0.1';")
root_password=None;mysql_env=None
try:pwd.getpwnam('langtri')
except KeyError:subprocess.run(['useradd','--system','--home-dir','/var/lib/lang-tri-thuc','--create-home','--shell','/usr/sbin/nologin','langtri'],check=True)
private.mkdir(mode=0o700,exist_ok=True);os.chmod(private,0o700)
def secret_file(name,value):
    p=private/name;p.write_text(value,encoding='utf-8');os.chmod(p,0o600)
room_secret=secrets.token_urlsafe(48);admin_password=secrets.token_urlsafe(24);preview_password=secrets.token_urlsafe(18)
database_url='mysql://lang_tri_thuc_app:'+db_password+'@127.0.0.1:3306/lang_tri_thuc'
secret_file('api.env','NODE_ENV=production\nHOST=127.0.0.1\nAPI_PORT=33080\nDATABASE_URL='+database_url+'\nROOM_SECRET='+room_secret+'\nADMIN_BOOTSTRAP_PASSWORD='+admin_password+'\nALLOWED_ORIGINS=https://ltt.vui-hoc.xyz\n')
secret_file('rooms.env','NODE_ENV=production\nHOST=127.0.0.1\nPORT=32580\nALLOW_DEV_ROOMS=0\nAPI_URL=http://127.0.0.1:33080\nROOM_SECRET='+room_secret+'\n')
password_hash=subprocess.run(['openssl','passwd','-apr1','-stdin'],input=preview_password+'\n',text=True,capture_output=True,check=True).stdout.strip()
secret_file('preview.htpasswd','staging:'+password_hash+'\n')
# Nginx workers need only the preview hash, never the application secret files.
nginx_group=grp.getgrnam('www').gr_gid
os.chown(private,0,nginx_group);os.chmod(private,0o710)
os.chown(private/'preview.htpasswd',0,nginx_group);os.chmod(private/'preview.htpasswd',0o640)
secret_file('access.txt','Site: https://ltt.vui-hoc.xyz\nPreview user: staging\nPreview password: '+preview_password+'\nAdmin user: admin\nAdmin password: '+admin_password+'\n')
sql_env={**os.environ,'MYSQL_PWD':db_password}
process=subprocess.run(['mysql','-h','127.0.0.1','-u','lang_tri_thuc_app','lang_tri_thuc','-N','-e','SELECT 1;'],env=sql_env,capture_output=True,text=True)
if process.returncode:raise RuntimeError('Application database login failed')
print(json.dumps({'backup':str(backup),'database':'lang_tri_thuc','user':'langtri','secrets':'/etc/lang-tri-thuc','databaseLogin':'passed'}))
