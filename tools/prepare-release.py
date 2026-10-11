"""Bundle the current source and built clients without local secrets or caches."""
import argparse, hashlib, json, pathlib, re, subprocess, tarfile

root = pathlib.Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser()
parser.add_argument('--build', required=True)
args = parser.parse_args()
if not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9_-]*', args.build):
    parser.error('Invalid build name')
game = root / 'apps/game-client/build' / args.build
admin = root / 'apps/admin/dist'
if not (game / 'index.html').is_file() or not (admin / 'index.html').is_file():
    parser.error('Build game and admin first')
version = subprocess.check_output(['node', str(root / 'tools/content-version.cjs')], cwd=root, text=True).strip()
revision = subprocess.check_output(['git', '-c', f'safe.directory={root.as_posix()}', 'rev-parse', 'HEAD'], cwd=root, text=True).strip()
names = subprocess.check_output(['git', '-c', f'safe.directory={root.as_posix()}', 'ls-files', '-z', '--cached', '--others', '--exclude-standard'], cwd=root).decode('utf-8').split('\0')
output = root / 'temp/deploy/completion-release.tar.gz'
output.parent.mkdir(parents=True, exist_ok=True)
files = []
with tarfile.open(output, 'w:gz') as archive:
    for name in sorted(set(names)):
        if not name:
            continue
        p = pathlib.PurePosixPath(name)
        if p.parts[0] in {'.git', '.cache', '.codex', '.agents', 'temp', 'node_modules'} or any(part in {'node_modules', 'temp', 'library', 'build', 'dist'} for part in p.parts):
            continue
        if p.name.startswith('.env') and p.name != '.env.example' or p.suffix.lower() in {'.pem', '.key', '.pfx', '.p12'}:
            continue
        source = root / name
        if source.is_file() and not source.is_symlink():
            archive.add(source, arcname=name, recursive=False)
            files.append(name)
    for folder, prefix in [(game, 'public/game'), (admin, 'public/admin')]:
        for source in sorted(folder.rglob('*')):
            if source.is_file() and not source.is_symlink():
                archive.add(source, arcname=str(pathlib.PurePosixPath(prefix) / source.relative_to(folder).as_posix()), recursive=False)
release = {'sourceRevision': revision, 'workingTreeIncluded': True, 'contentVersion': version, 'gameBuild': args.build, 'sha256': hashlib.sha256(output.read_bytes()).hexdigest(), 'sourceFiles': len(files)}
(output.parent / 'completion-release.json').write_text(json.dumps(release, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'archive': str(output), **release}, indent=2))
