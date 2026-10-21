const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),configPath=path.join(root,'.env.local');
const config=fs.existsSync(configPath)?JSON.parse(fs.readFileSync(configPath,'utf8')):{};
const testUrl=process.env.MYSQL_TEST_URL||config.MYSQL_TEST_URL;
if(!testUrl||!new URL(testUrl).pathname.endsWith('_test'))throw Error('Set MYSQL_TEST_URL to an isolated database ending in _test, or run npm run db:setup.');
const result=spawnSync(process.execPath,['--import','tsx','--test','--test-concurrency=1','apps/backend/tests/api.test.ts','apps/backend/tests/mysql.test.ts'],{cwd:root,env:{...process.env,MYSQL_TEST_URL:testUrl},windowsHide:true,stdio:'inherit'});
if(result.error)throw result.error;process.exitCode=result.status??1;
