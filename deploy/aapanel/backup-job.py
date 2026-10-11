"""Private scheduled dumps, isolated restore drills and retention of managed dumps only."""
import argparse,datetime,hashlib,json,os,pathlib,re,secrets,signal,sqlite3,stat,subprocess,tempfile

DIRECTORY=pathlib.Path('/opt/lang-tri-thuc/backups/automatic')
NAME=re.compile(r'auto-(\d{8}T\d{6}Z)-[a-f0-9]{8}\.sql\Z')
DUMP_FLAGS=['--single-transaction','--skip-lock-tables','--skip-comments','--skip-extended-insert','--hex-blob','--order-by-primary','--default-character-set=utf8mb4','--skip-add-locks']

def now():return datetime.datetime.now(datetime.timezone.utc)
def private_json(path,value):
    temporary=path.with_name(path.name+'.'+secrets.token_hex(4)+'.partial')
    try:
        with temporary.open('x',encoding='utf-8') as output:
            os.chmod(temporary,0o600);json.dump(value,output,indent=2);output.write('\n')
        os.replace(temporary,path)
    finally:
        if temporary.exists():temporary.unlink()

def file_hash(path):
    digest=hashlib.sha256()
    with path.open('rb') as source:
        for block in iter(lambda:source.read(1024*1024),b''):digest.update(block)
    return digest.hexdigest()

def data_hash(path):
    digest=hashlib.sha256();rows=0
    with path.open('rb') as source:
        for line in source:
            if line.startswith(b'INSERT INTO '):digest.update(line);rows+=1
    if not rows:raise RuntimeError('Dump contains no application data')
    return digest.hexdigest()

def managed_files(directory):
    result=[]
    for path in directory.iterdir():
        match=NAME.fullmatch(path.name)
        if match and stat.S_ISREG(path.lstat().st_mode):
            try:date=datetime.datetime.strptime(match[1],'%Y%m%dT%H%M%SZ').replace(tzinfo=datetime.timezone.utc)
            except ValueError:continue
            result.append((date,path))
    return sorted(result,key=lambda item:(item[0],item[1].name),reverse=True)

def retention_candidates(directory,days,current=None):
    current=current or now();files=managed_files(directory);protected={path.name for _,path in files[:7]}
    marker=directory/'last-restore.json'
    if marker.is_file() and not marker.is_symlink():
        protected.add(json.loads(marker.read_text(encoding='utf-8')).get('backup',''))
    cutoff=current-datetime.timedelta(days=days)
    return [path for date,path in files if date<cutoff and path.name not in protected]

def dump(database,path,environment):
    with path.open('xb') as output:
        os.chmod(path,0o600)
        result=subprocess.run(['mysqldump','-uroot',*DUMP_FLAGS,database],stdout=output,stderr=subprocess.PIPE,env=environment)
    if result.returncode:raise RuntimeError('Database dump failed; credentials are not logged')

def sql(query,environment):
    result=subprocess.run(['mysql','-uroot','-N','-B'],input=query,text=True,env=environment,capture_output=True)
    if result.returncode:raise RuntimeError('Database operation failed; credentials are not logged')
    return result.stdout.strip()

def backup(directory,environment,days):
    stamp=now().strftime('%Y%m%dT%H%M%SZ');path=directory/f'auto-{stamp}-{secrets.token_hex(4)}.sql';partial=path.with_suffix('.sql.partial')
    try:
        dump('lang_tri_thuc',partial,environment)
        report={'version':1,'backup':path.name,'createdAt':now().isoformat(),'sha256':file_hash(partial),'dataSha256':data_hash(partial),'bytes':partial.stat().st_size}
        os.replace(partial,path);private_json(path.with_suffix('.json'),report)
    finally:
        if partial.exists():partial.unlink()
    removed=[]
    for expired in retention_candidates(directory,days):
        expired.unlink();metadata=expired.with_suffix('.json')
        if metadata.exists() and not metadata.is_symlink() and stat.S_ISREG(metadata.lstat().st_mode):metadata.unlink()
        removed.append(expired.name)
    print(json.dumps({'ok':True,'operation':'backup','backup':path.name,'sha256':report['sha256'],'retentionDays':days,'removedManagedBackups':len(removed)}))

def verify(directory,environment):
    files=managed_files(directory)
    if not files:raise RuntimeError('No managed backup available')
    path=files[0][1];metadata=path.with_suffix('.json')
    if metadata.is_symlink() or not metadata.is_file():raise RuntimeError('Missing regular backup metadata')
    expected=json.loads(metadata.read_text(encoding='utf-8'))
    if expected.get('backup')!=path.name or expected.get('sha256')!=file_hash(path) or expected.get('dataSha256')!=data_hash(path):raise RuntimeError('Backup checksum differs')
    temporary='lang_tri_thuc_restore_'+secrets.token_hex(6)
    sql('CREATE DATABASE '+temporary+' CHARACTER SET utf8mb4;',environment)
    try:
        with path.open('rb') as source:
            result=subprocess.run(['mysql','-uroot',temporary],stdin=source,env=environment,capture_output=True)
        if result.returncode:raise RuntimeError('Isolated restore failed; credentials are not logged')
        if sql('SELECT COUNT(*) FROM '+temporary+'.lang_tri_thuc_state WHERE id=1;',environment)!='1':raise RuntimeError('Restored application row missing')
        with tempfile.TemporaryDirectory(prefix='.restore-',dir=directory) as folder:
            restored=pathlib.Path(folder)/'restored.sql';dump(temporary,restored,environment)
            if data_hash(restored)!=expected['dataSha256']:raise RuntimeError('Restored data differs from the dump snapshot')
    finally:
        sql('DROP DATABASE '+temporary+';',environment)
    report={'ok':True,'operation':'restore-verify','backup':path.name,'verifiedAt':now().isoformat(),'sha256':expected['sha256'],'restoredSnapshotMatches':True,'disposableDatabaseRemoved':True}
    private_json(directory/'last-restore.json',report);print(json.dumps(report))

def main():
    parser=argparse.ArgumentParser();parser.add_argument('operation',choices=['backup','verify']);parser.add_argument('--retention-days',type=int,default=30);args=parser.parse_args()
    if not 7<=args.retention_days<=365:parser.error('Retention must be 7–365 days')
    if os.geteuid()!=0:raise SystemExit('Run as root')
    def interrupted(signum,frame):raise RuntimeError('Backup job interrupted')
    signal.signal(signal.SIGTERM,interrupted);signal.signal(signal.SIGINT,interrupted)
    os.umask(0o077);DIRECTORY.mkdir(mode=0o700,parents=True,exist_ok=True)
    if DIRECTORY.is_symlink() or DIRECTORY.resolve()!=DIRECTORY:raise SystemExit('Unexpected backup directory')
    os.chmod(DIRECTORY,0o700)
    import fcntl
    with (DIRECTORY/'job.lock').open('a') as lock:
        fcntl.flock(lock,fcntl.LOCK_EX)
        connection=sqlite3.connect('file:/www/server/panel/data/default.db?mode=ro',uri=True)
        try:password=connection.execute('SELECT mysql_root FROM config LIMIT 1').fetchone()[0]
        finally:connection.close()
        environment={**os.environ,'MYSQL_PWD':password}
        if args.operation=='backup':backup(DIRECTORY,environment,args.retention_days)
        else:verify(DIRECTORY,environment)

if __name__=='__main__':main()
