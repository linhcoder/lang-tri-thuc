"""Root-only backup and restore drill into a uniquely named disposable database."""
import os,pathlib,sqlite3,subprocess,datetime,secrets,json
connection=sqlite3.connect('/www/server/panel/data/default.db')
password=connection.execute('SELECT mysql_root FROM config LIMIT 1').fetchone()[0];connection.close()
environment={**os.environ,'MYSQL_PWD':password}
def sql(query):
    result=subprocess.run(['mysql','-uroot','-N','-B'],input=query,text=True,env=environment,capture_output=True)
    if result.returncode:raise RuntimeError('Backup SQL operation failed (credentials not logged)')
    return result.stdout.strip()
stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
directory=pathlib.Path('/opt/lang-tri-thuc/backups');directory.mkdir(mode=0o700,exist_ok=True)
dump=directory/('database-'+stamp+'.sql')
with dump.open('xb') as output:
    os.chmod(dump,0o600)
    process=subprocess.run(['mysqldump','-uroot','--single-transaction','--skip-lock-tables','lang_tri_thuc'],stdout=output,stderr=subprocess.PIPE,env=environment)
if process.returncode:raise RuntimeError('Database dump failed')
temporary='lang_tri_thuc_restore_'+secrets.token_hex(6)
assert temporary.startswith('lang_tri_thuc_restore_') and temporary.replace('_','').isalnum()
sql('CREATE DATABASE '+temporary+' CHARACTER SET utf8mb4;')
try:
    with dump.open('rb') as source:
        result=subprocess.run(['mysql','-uroot',temporary],stdin=source,env=environment,capture_output=True)
    if result.returncode:raise RuntimeError('Restore failed')
    before=sql('SELECT SHA2(CAST(value AS CHAR),256) FROM lang_tri_thuc.lang_tri_thuc_state WHERE id=1;')
    after=sql('SELECT SHA2(CAST(value AS CHAR),256) FROM '+temporary+'.lang_tri_thuc_state WHERE id=1;')
    if not before or before!=after:raise RuntimeError('Restored state differs')
    print(json.dumps({'backup':str(dump),'restoredStateMatches':True,'disposableDatabaseRemoved':True}))
finally:
    sql('DROP DATABASE '+temporary+';')
