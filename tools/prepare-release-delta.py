"""Prepare a checksum-verified overlay against an existing full staging archive."""
import argparse, hashlib, json, pathlib, re, subprocess, tarfile

root = pathlib.Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser()
parser.add_argument('--base', required=True, help='Full archive basename in temp/deploy')
parser.add_argument('--build', required=True)
parser.add_argument('--archive', required=True, help='Delta archive basename in temp/deploy')
args = parser.parse_args()
for value in [args.base, args.archive]:
    if not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9_-]*\.tar\.gz', value):
        parser.error('Invalid archive basename')
if not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9_-]*', args.build) or args.base == args.archive:
    parser.error('Invalid build or identical base/output')
base = root / 'temp/deploy' / args.base
base_info = json.loads(base.with_name(args.base[:-7] + '.json').read_text(encoding='utf-8'))
if hashlib.file_digest(base.open('rb'), 'sha256').hexdigest() != base_info['sha256']:
    parser.error('Base archive checksum mismatch')
old = {}
with tarfile.open(base, 'r|gz') as archive:
    for member in archive:
        if member.isfile():
            with archive.extractfile(member) as source:
                old[member.name] = hashlib.file_digest(source, 'sha256').hexdigest()
names = subprocess.check_output(['git', '-c', f'safe.directory={root.as_posix()}', 'ls-files', '-z', '--cached', '--others', '--exclude-standard'], cwd=root).decode().split('\0')
current = {}
for name in sorted(set(names)):
    if not name:
        continue
    path = pathlib.PurePosixPath(name)
    if path.parts[0] in {'.git', '.cache', '.codex', '.agents', 'temp', 'node_modules'} or any(p in {'node_modules', 'temp', 'library', 'build', 'dist'} for p in path.parts):
        continue
    if path.name.startswith('.env') and path.name != '.env.example' or path.suffix.lower() in {'.pem', '.key', '.pfx', '.p12'}:
        continue
    source = root / name
    if source.is_file() and not source.is_symlink():
        current[name] = source
for folder, prefix in [(root / 'apps/game-client/build' / args.build, 'public/game'), (root / 'apps/admin/dist', 'public/admin')]:
    if not (folder / 'index.html').is_file():
        parser.error('Build game and admin first')
    for source in sorted(folder.rglob('*')):
        if source.is_file() and not source.is_symlink():
            current[prefix + '/' + source.relative_to(folder).as_posix()] = source
# Retain obsolete hashed static files for rollback/cached clients. Source deletion
# requires an explicit migration rather than silently keeping deleted runtime code.
removed = [name for name in old if not name.startswith('public/') and name not in current]
if removed:
    parser.error('Source deletions require a full release: ' + ', '.join(removed))
changed = {}
for name, source in current.items():
    with source.open('rb') as stream:
        digest = hashlib.file_digest(stream, 'sha256').hexdigest()
    if old.get(name) != digest:
        changed[name] = digest
output = root / 'temp/deploy' / args.archive
with tarfile.open(output, 'w:gz') as archive:
    for name in changed:
        archive.add(current[name], arcname=name, recursive=False)
version = subprocess.check_output(['node', str(root / 'tools/content-version.cjs')], cwd=root, text=True).strip()
report = {'baseArchive': args.base, 'baseSha256': base_info['sha256'], 'contentVersion': version,
          'gameBuild': args.build, 'files': changed, 'workingTreeIncluded': True,
          'sha256': hashlib.file_digest(output.open('rb'), 'sha256').hexdigest(), 'bytes': output.stat().st_size}
output.with_name(args.archive[:-7] + '.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'archive': str(output), 'changedFiles': len(changed), 'bytes': report['bytes'], 'sha256': report['sha256'], 'contentVersion': version}, indent=2))
