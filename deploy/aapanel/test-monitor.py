"""Linux staging regression test; isolated files, no live service changes."""
import importlib.util,pathlib,tempfile,json,io,time,datetime
source=str(pathlib.Path(__file__).with_name('monitor-job.py'));spec=importlib.util.spec_from_file_location('monitor_test',source);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
with tempfile.TemporaryDirectory(prefix='monitor-test-',dir='/opt/lang-tri-thuc/operations') as folder:
 m.ROOT=pathlib.Path(folder);(m.ROOT/'backups/automatic').mkdir(parents=True);(m.ROOT/'operations').mkdir()
 (m.ROOT/'backups/automatic/auto-fixture.sql').write_text('fixture')
 (m.ROOT/'backups/automatic/last-restore.json').write_text(json.dumps({'ok':True,'verifiedAt':datetime.datetime.now(datetime.timezone.utc).isoformat()}))
 (m.ROOT/'operations/offsite.json').write_text(json.dumps({'configured':False}));m.active=lambda _:True;m.succeeded=lambda _:True
 failed=True
 def fake(url,timeout):return io.StringIO(json.dumps({'ok':not(failed and ':33081/' in url),'storage':'mysql'}))
 m.urllib.request.urlopen=fake;m.main();status=json.loads((m.ROOT/'monitor/status.json').read_text());assert status['checks'][0]['status']=='warning','Second API failure must warn'
 failed=False;m.main();status=json.loads((m.ROOT/'monitor/status.json').read_text());assert all(c['status']=='ok' for c in status['checks'] if c['id']!='offsite');assert status['checks'][0]['detail'].endswith('2/2')
 print('PASS isolated monitor second-instance failure/recovery and pending offsite')
