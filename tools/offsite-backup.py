"""Pull only this application's backup, verify SHA, and retain encrypted copies locally."""
import datetime, hashlib, io, json, os, pathlib, re, time
import paramiko
from cryptography.fernet import Fernet

ROOT=pathlib.Path(__file__).resolve().parents[1]
DEST=ROOT/'temp/deploy/offsite'
REMOTE='/opt/lang-tri-thuc/backups/automatic/'
def main():
    DEST.mkdir(parents=True,exist_ok=True)
    keyfile=ROOT/'.cache/offsite-backup.key'
    if not keyfile.exists():
        with keyfile.open('xb') as key:key.write(Fernet.generate_key())
        os.chmod(keyfile,0o600)
    cipher=Fernet(keyfile.read_bytes());ssh=paramiko.SSHClient();ssh.load_host_keys(str(ROOT/'.cache/deploy-known-hosts'));ssh.set_missing_host_key_policy(paramiko.RejectPolicy())
    report={'ok':False,'completedAt':round(time.time()*1000)}
    try:
        ssh.connect('158.220.98.34',username='root',password=(ROOT/'temp/deploy/ssh-password.txt').read_text(encoding='utf-8-sig').rstrip('\r\n'),look_for_keys=False,allow_agent=False,timeout=25)
        with ssh.open_sftp() as sftp:
            files=[a for a in sftp.listdir_attr(REMOTE) if re.fullmatch(r'auto-\d{8}T\d{6}Z-[a-f0-9]{8}\.sql',a.filename)]
            if not files:raise RuntimeError('Application backup unavailable')
            latest=max(files,key=lambda f:f.filename)
            if latest.st_size>128*1024*1024:raise RuntimeError('Backup exceeds configured transfer bound')
            with sftp.open(REMOTE+latest.filename[:-4]+'.json','r') as f:metadata=json.loads(f.read())
            raw=io.BytesIO();sftp.getfo(REMOTE+latest.filename,raw);payload=raw.getvalue();digest=hashlib.sha256(payload).hexdigest()
            if digest!=metadata.get('sha256'):raise RuntimeError('Backup SHA mismatch')
            encrypted=cipher.encrypt(payload);output=DEST/(latest.filename+'.fernet');partial=output.with_suffix('.partial')
            with partial.open('wb') as f:f.write(encrypted);f.flush();os.fsync(f.fileno())
            if hashlib.sha256(cipher.decrypt(partial.read_bytes())).hexdigest()!=digest:raise RuntimeError('Encrypted restore verification failed')
            os.replace(partial,output)
            report.update(ok=True,backup=latest.filename,sha256=digest,bytes=len(encrypted),encryptedRestoreVerified=True)
            (DEST/(latest.filename+'.json')).write_text(json.dumps(report,indent=2)+'\n')
            # Only managed files in this explicit directory; retain at least seven copies.
            managed=sorted((p for p in DEST.glob('auto-*.sql.fernet') if re.fullmatch(r'auto-\d{8}T\d{6}Z-[a-f0-9]{8}\.sql\.fernet',p.name) and p.is_file() and not p.is_symlink()),reverse=True)
            for old in managed[7:]:
                stamp=datetime.datetime.strptime(old.name[5:21],'%Y%m%dT%H%M%SZ').replace(tzinfo=datetime.timezone.utc).timestamp()
                if time.time()-stamp>30*86400 and old.parent.resolve()==DEST.resolve():old.unlink();old.with_name(old.name[:-7]+'.json').unlink(missing_ok=True)
            with sftp.open('/opt/lang-tri-thuc/operations/offsite.json.partial','w') as f:f.write(json.dumps(report))
            sftp.chmod('/opt/lang-tri-thuc/operations/offsite.json.partial',0o600)
            sftp.posix_rename('/opt/lang-tri-thuc/operations/offsite.json.partial','/opt/lang-tri-thuc/operations/offsite.json')
        print(json.dumps({'ok':True,'encryptedRestoreVerified':True,'bytes':report['bytes']}))
    finally:
        ssh.close();(DEST/'last-run.json').write_text(json.dumps(report,indent=2)+'\n')
if __name__=='__main__':
    try:main()
    except Exception:print('Offsite backup failed; credentials and account data withheld.');raise SystemExit(1)
