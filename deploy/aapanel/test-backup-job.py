"""Policy checks independent of a VPS; live jobs verify real dump/restore separately."""
import datetime,importlib.util,json,pathlib,tempfile,unittest
from unittest.mock import patch
spec=importlib.util.spec_from_file_location('backup_job',pathlib.Path(__file__).with_name('backup-job.py'))
job=importlib.util.module_from_spec(spec);spec.loader.exec_module(job)

class BackupPolicy(unittest.TestCase):
    def test_retention_keeps_seven_and_last_verified_without_touching_manual(self):
        with tempfile.TemporaryDirectory() as folder:
            directory=pathlib.Path(folder);paths=[]
            for day in range(1,13):
                path=directory/f'auto-202401{day:02}T020000Z-12345678.sql';path.write_text('fixture');paths.append(path)
            manual=directory/'database-20240101T020000Z.sql';manual.write_text('manual')
            unknown=directory/'auto-invalid-12345678.sql';unknown.write_text('unknown')
            (directory/'last-restore.json').write_text(json.dumps({'backup':paths[0].name}))
            clock=datetime.datetime(2026,10,11,tzinfo=datetime.timezone.utc)
            candidates=job.retention_candidates(directory,30,clock)
            self.assertEqual({p.name for p in candidates},{p.name for p in paths[1:5]})
            self.assertTrue(manual.exists());self.assertTrue(unknown.exists())

    def test_recent_dumps_remain_even_with_more_than_seven(self):
        with tempfile.TemporaryDirectory() as folder:
            directory=pathlib.Path(folder)
            for day in range(1,13):(directory/f'auto-202610{day:02}T020000Z-12345678.sql').write_text('fixture')
            self.assertEqual(job.retention_candidates(directory,30,datetime.datetime(2026,10,20,tzinfo=datetime.timezone.utc)),[])

    def test_restore_data_hash_ignores_schema_but_detects_changed_snapshot(self):
        with tempfile.TemporaryDirectory() as folder:
            a=pathlib.Path(folder)/'a.sql';b=pathlib.Path(folder)/'b.sql'
            a.write_bytes(b'CREATE TABLE fixture;\nINSERT INTO `state` VALUES (1,\'old\');\n')
            b.write_bytes(b'-- restored schema\nINSERT INTO `state` VALUES (1,\'old\');\n')
            self.assertEqual(job.data_hash(a),job.data_hash(b))
            b.write_bytes(b'INSERT INTO `state` VALUES (1,\'new\');\n')
            self.assertNotEqual(job.data_hash(a),job.data_hash(b))
            b.write_bytes(b'-- failed/empty dump\n')
            with self.assertRaises(RuntimeError):job.data_hash(b)

    def test_tampered_dump_is_rejected_before_any_database_operation(self):
        with tempfile.TemporaryDirectory() as folder:
            directory=pathlib.Path(folder);dump=directory/'auto-20261011T020000Z-12345678.sql'
            dump.write_bytes(b'INSERT INTO `state` VALUES (1,\'original\');\n')
            dump.with_suffix('.json').write_text(json.dumps({'backup':dump.name,'sha256':job.file_hash(dump),'dataSha256':job.data_hash(dump)}))
            dump.write_bytes(b'INSERT INTO `state` VALUES (1,\'tampered\');\n')
            with patch.object(job,'sql') as sql:
                with self.assertRaisesRegex(RuntimeError,'checksum'):job.verify(directory,{})
                sql.assert_not_called()

    def test_restore_failure_drops_only_its_disposable_database(self):
        with tempfile.TemporaryDirectory() as folder:
            directory=pathlib.Path(folder);dump=directory/'auto-20261011T020000Z-12345678.sql'
            dump.write_bytes(b'INSERT INTO `state` VALUES (1,\'original\');\n')
            dump.with_suffix('.json').write_text(json.dumps({'backup':dump.name,'sha256':job.file_hash(dump),'dataSha256':job.data_hash(dump)}))
            queries=[]
            def fake_sql(query,environment):queries.append(query);return '1'
            class FailedRestore:returncode=1
            with patch.object(job,'sql',side_effect=fake_sql),patch.object(job.subprocess,'run',return_value=FailedRestore()):
                with self.assertRaisesRegex(RuntimeError,'restore failed'):job.verify(directory,{})
            self.assertEqual(len(queries),2)
            temporary=queries[0].split()[2]
            self.assertRegex(temporary,r'^lang_tri_thuc_restore_[a-f0-9]{12}$')
            self.assertEqual(queries[1],'DROP DATABASE '+temporary+';')
            self.assertFalse((directory/'last-restore.json').exists())

if __name__=='__main__':unittest.main()
