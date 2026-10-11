"""Activate a prepared release; roll back the app automatically on failed health."""
import json, os, pathlib, re, subprocess, sys, time, urllib.request

name, expected = sys.argv[1:]
if not re.fullmatch(r'[a-zA-Z0-9_-]+', name) or not re.fullmatch(r'[a-f0-9]{8}', expected):
    raise SystemExit('Invalid release or content version')
base = pathlib.Path('/opt/lang-tri-thuc')
release = (base / 'releases' / name).resolve()
previous = (base / 'current').resolve()
assert release.parent == (base / 'releases').resolve() and release.is_dir()
assert previous.is_dir() and (release / 'public/game/index.html').is_file()
assert (release / 'public/admin/index.html').is_file()
(release / 'RELEASE.txt').write_text(f'{name}; contentVersion {expected}; working-tree source included\n')
(base / 'backups' / 'previous-completion-release.txt').write_text(str(previous) + '\n')

def activate(target):
    link = base / 'current.completion-next'
    assert not link.exists() and not link.is_symlink()
    link.symlink_to(target)
    os.replace(link, base / 'current')
    subprocess.run(['systemctl', 'restart', 'lang-tri-thuc-api', 'lang-tri-thuc-rooms'], check=True)

try:
    activate(release)
    for attempt in range(30):
        try:
            health = json.load(urllib.request.urlopen('http://127.0.0.1:33080/health', timeout=3))
            if health.get('ok') and health.get('storage') == 'mysql' and health.get('contentVersion') == expected:
                subprocess.run(['systemctl', 'is-active', '--quiet', 'lang-tri-thuc-api', 'lang-tri-thuc-rooms'], check=True)
                print('RELEASE_ACTIVE ' + expected)
                break
        except Exception:
            pass
        time.sleep(1)
    else:
        raise RuntimeError('Release health check failed')
except Exception:
    activate(previous)
    print('ROLLED_BACK_TO_PREVIOUS_RELEASE', file=sys.stderr)
    raise
