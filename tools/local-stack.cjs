const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..'),file=path.join(root,'.env.local');
if(!fs.existsSync(path.join(root,'apps/game-client/build/web-desktop/index.html')))throw Error('Missing Cocos web build. Run npm run web:build first.');
if(!fs.existsSync(file))fs.writeFileSync(file,JSON.stringify({ROOM_SECRET:crypto.randomBytes(48).toString('base64url'),ADMIN_BOOTSTRAP_PASSWORD:crypto.randomBytes(24).toString('base64url')},null,2),{mode:0o600});
const privateEnv=JSON.parse(fs.readFileSync(file,'utf8'));
if(!privateEnv.DATABASE_URL&&!process.env.DATABASE_URL)throw Error('MySQL is not configured. Run npm run db:setup first.');
if(process.argv.includes('--credentials')){console.log('Admin credentials are stored in .env.local. Open this local file; do not share or commit it.');process.exit(0);}
const env={...process.env,...privateEnv,HOST:'127.0.0.1',API_PORT:'33000',PORT:'32567',WEB_PORT:'38080',API_URL:'http://127.0.0.1:33000',VITE_API_URL:'http://127.0.0.1:33000',VITE_SERVER_URL:'http://127.0.0.1:32567',VITE_GAME_URL:'http://127.0.0.1:38080/',ALLOWED_ORIGINS:'http://127.0.0.1:35173'};
const children=[];let stopping=false;
function stop(){if(stopping)return;stopping=true;for(const child of children)child.kill();}
for(const args of [['apps/backend/dist/main.js'],['apps/game-server/dist/game-server/src/main.js'],['tools/serve-web.cjs'],['node_modules/vite/bin/vite.js','apps/admin','--host','127.0.0.1','--port','35173','--strictPort']]){
 if(!fs.existsSync(path.join(root,args[0]))){console.error('Missing build: '+args[0]+'. Run npm run api:build and npm run server:build first.');stop();process.exit(1);}
 const child=spawn(process.execPath,args,{cwd:root,env,windowsHide:true,stdio:'inherit'});children.push(child);child.on('error',()=>{stop();process.exitCode=1;});child.on('exit',code=>{if(!stopping){console.error('Local service stopped: '+args[0]+' ('+code+')');stop();process.exitCode=1;}});
}
process.on('SIGINT',stop);process.on('SIGTERM',stop);process.on('exit',stop);
console.log('Parent/admin: http://127.0.0.1:35173 | Offline game: http://127.0.0.1:38080 | Credentials: .env.local (local only)');
