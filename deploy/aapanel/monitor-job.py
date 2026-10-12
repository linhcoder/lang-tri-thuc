"""Write credential-free operational checks for the authenticated admin page."""
import datetime, grp, json, os, pathlib, subprocess, time, urllib.request

ROOT=pathlib.Path('/opt/lang-tri-thuc')
def active(name):
    return subprocess.run(['systemctl','is-active','--quiet',name],capture_output=True).returncode==0
def succeeded(name):
    return subprocess.run(['systemctl','show',name,'--property=Result','--value'],capture_output=True,text=True).stdout.strip()=='success'
def read(path):
    try:return json.loads(path.read_text())
    except (OSError,ValueError):return {}
def main():
    checks=[]
    def add(name,ok,detail):checks.append({'id':name,'status':'ok' if ok else 'warning','detail':detail})
    try:
        with urllib.request.urlopen('http://127.0.0.1:33080/ready',timeout=5) as response:health=json.load(response)
        add('api',health.get('ok') is True and active('lang-tri-thuc-api-b'),'API/MySQL readiness: '+str(health.get('ok') is True))
    except Exception:add('api',False,'API hoặc cơ sở dữ liệu chưa sẵn sàng.')
    rooms=active('lang-tri-thuc-rooms') and active('lang-tri-thuc-rooms-b')
    add('rooms',rooms,'Hai instance phòng chơi đang chạy.' if rooms else 'Có instance phòng chơi ngừng hoạt động.')
    add('redis',active('lang-tri-thuc-redis'),'Redis presence/driver riêng của ứng dụng.')
    backups=list((ROOT/'backups/automatic').glob('auto-*.sql'))
    latest=max((p.stat().st_mtime for p in backups if p.is_file() and not p.is_symlink()),default=0)
    hours=(time.time()-latest)/3600 if latest else None
    add('backup',hours is not None and hours<26 and active('lang-tri-thuc-backup.timer') and succeeded('lang-tri-thuc-backup.service'),'Backup gần nhất: '+(str(round(hours,1))+' giờ trước.' if hours is not None else 'chưa có.')+' Job: '+('thành công.' if succeeded('lang-tri-thuc-backup.service') else 'cần kiểm tra.'))
    restore=read(ROOT/'backups/automatic/last-restore.json')
    try:restored=datetime.datetime.fromisoformat(restore['verifiedAt']).timestamp()
    except (KeyError,ValueError,TypeError):restored=0
    add('restore',restore.get('ok') is True and time.time()-restored<8*86400 and active('lang-tri-thuc-restore-verify.timer') and succeeded('lang-tri-thuc-restore-verify.service'),'Phục hồi thử có checksum/snapshot khớp.' if restore.get('ok') else 'Chưa có phục hồi thử thành công.')
    offsite=read(ROOT/'operations/offsite.json');stamp=offsite.get('completedAt',0)
    ok=offsite.get('ok') is True and isinstance(stamp,(int,float)) and time.time()*1000-stamp<30*3600000
    if offsite.get('configured') is False:
        checks.append({'id':'offsite','status':'unknown','detail':'Backup offsite: ch\u1edd k\u1ebft n\u1ed1i. Ch\u01b0a c\u00f3 \u0111\u00edch \u0111ang ho\u1ea1t \u0111\u1ed9ng.'})
    else:
        add('offsite',ok,'Bản sao mã hóa ngoài VPS đã kiểm tra.' if ok else 'Bản sao ngoài VPS chưa có, đã cũ hoặc job thất bại. Máy nhận cần bật để chạy lịch.')
    directory=ROOT/'monitor';directory.mkdir(exist_ok=True);os.chown(directory,0,grp.getgrnam('langtri').gr_gid);os.chmod(directory,0o750)
    output=directory/'status.json';temporary=directory/'status.json.partial'
    temporary.write_text(json.dumps({'checkedAt':round(time.time()*1000),'checks':checks},ensure_ascii=False)+'\n')
    os.chmod(temporary,0o640);os.chown(temporary,0,grp.getgrnam('langtri').gr_gid);os.replace(temporary,output)
    print(json.dumps({'checks':len(checks),'warnings':sum(c['status']=='warning' for c in checks)}))
if __name__=='__main__':main()
