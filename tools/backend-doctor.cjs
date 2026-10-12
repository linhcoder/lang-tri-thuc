// Read-only diagnostics. Never print credentials or the contents of local env files.
const fs=require('node:fs'),path=require('node:path'),net=require('node:net');
const root=path.resolve(__dirname,'..');
async function tcp(port){return new Promise(resolve=>{const s=net.connect({host:'127.0.0.1',port});s.setTimeout(2000);s.once('connect',()=>{s.destroy();resolve(true)});s.once('error',()=>resolve(false));s.once('timeout',()=>{s.destroy();resolve(false)});});}
(async()=>{
 const checks=[];let privateEnv={};const file=path.join(root,'.env.local');
 if(fs.existsSync(file)){try{privateEnv=JSON.parse(fs.readFileSync(file,'utf8'));}catch{checks.push({name:'.env.local',ok:false,help:'File JSON cấu hình không hợp lệ.'});}}
 checks.push({name:'Cấu hình MySQL',ok:!!(process.env.DATABASE_URL||privateEnv.DATABASE_URL),help:'Nếu chưa có, chạy npm run db:setup.'});
 for(const [name,file] of [['Build API','apps/backend/dist/main.js'],['Build phòng game','apps/game-server/dist/game-server/src/main.js'],['Build giao diện','apps/admin/dist/index.html'],['Build game','apps/game-client/build/web-desktop/index.html']])checks.push({name,ok:fs.existsSync(path.join(root,file)),help:'Build bằng npm run api:build / server:build / admin:build / web:build.'});
 const api=process.env.DOCTOR_API_URL||'http://127.0.0.1:33000';
 try{const r=await fetch(api.replace(/\/$/,'')+'/ready',{signal:AbortSignal.timeout(5000)}),data=await r.json();checks.push({name:'API + cơ sở dữ liệu',ok:r.ok&&data.ok===true,version:data.contentVersion,help:r.ok?'':'Khởi động npm run local:stack; kiểm tra kết nối MySQL.'});}catch{checks.push({name:'API + cơ sở dữ liệu',ok:false,help:'Khởi động npm run local:stack hoặc đặt DOCTOR_API_URL.'});}
 for(const [name,port] of [['Trang quản trị',35173],['Game online local',38080],['Máy chủ phòng chơi',32567]])checks.push({name,ok:await tcp(port),help:'Khởi động npm run local:stack.'});
 if(process.argv.includes('--json'))console.log(JSON.stringify({ok:checks.every(c=>c.ok),checks},null,2));else{for(const c of checks)console.log(`${c.ok?'OK':'CẦN KIỂM TRA'} · ${c.name}${c.version?' · '+c.version:''}${!c.ok?' — '+c.help:''}`);console.log('Không thay đổi cấu hình hoặc dữ liệu. Hướng dẫn: docs/BACKEND_GUIDE.md');}
 if(checks.some(c=>!c.ok))process.exitCode=1;
})().catch(()=>{console.error('Không kiểm tra được môi trường. Xem docs/BACKEND_GUIDE.md');process.exitCode=1;});
