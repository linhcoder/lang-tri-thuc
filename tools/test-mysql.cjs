const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),config=JSON.parse(fs.readFileSync(path.join(root,'.env.local'),'utf8'));
if(!config.MYSQL_TEST_URL||!new URL(config.MYSQL_TEST_URL).pathname.endsWith('_test'))throw Error('Run npm run db:setup to provision the isolated MySQL test database.');
const result=spawnSync(process.execPath,['--import','tsx','--test','--test-concurrency=1','apps/backend/tests/api.test.ts','apps/backend/tests/mysql.test.ts'],{cwd:root,env:{...process.env,MYSQL_TEST_URL:config.MYSQL_TEST_URL},windowsHide:true,stdio:'inherit'});
if(result.error)throw result.error;process.exitCode=result.status??1;
