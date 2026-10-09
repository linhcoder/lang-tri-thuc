const fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process');
const project=path.resolve(__dirname,'../apps/game-client');
const executable=process.argv[2]||process.env.COCOS_CREATOR||'C:/ProgramData/cocos/editors/Creator/3.8.8/CocosCreator.exe';
const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
fs.mkdirSync(path.join(project,'temp'),{recursive:true});
const sdkRoot=path.resolve(__dirname,'../node_modules/@colyseus/sdk');
fs.mkdirSync(path.join(project,'assets/resources/vendor'),{recursive:true});
fs.copyFileSync(path.join(sdkRoot,'dist/colyseus.js'),path.join(project,'assets/resources/vendor/colyseus.txt'));
const log=fs.createWriteStream(path.join(project,'temp/release-build.log'));
const child=spawn(executable,['--project',project,'--build',`configPath=${path.join(project,'build-web.json')}`],{env,windowsHide:true,stdio:['ignore','pipe','pipe']});
child.stdout.pipe(log);child.stderr.pipe(log);
child.on('error',error=>{console.error(error);process.exitCode=1;});
child.on('exit',code=>{
    log.end();if(code!==36&&code!==0){console.error(`Cocos build failed (${code}); see apps/game-client/temp/release-build.log`);process.exitCode=1;return;}
    const htmlPath=path.join(project,'build/web-desktop/index.html');
    if(!fs.existsSync(htmlPath)){console.error('No web output produced');process.exitCode=1;return;}
    let html=fs.readFileSync(htmlPath,'utf8');
    html=html.replace('<html>','<html lang="vi">').replace(/<title>[^<]*<\/title>/,'<title>Làng Tri Thức</title>').replace(/\s*<h1 class="header">[\s\S]*?<\/h1>/,'').replace(/\s*<p class="footer">[\s\S]*?<\/p>/,'');
    html=html.replace('</head>','<style>html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#c1dab3}#GameDiv{position:fixed!important;inset:0;width:100vw!important;height:100vh!important}canvas{touch-action:none;outline:none}</style></head>');
    fs.writeFileSync(htmlPath,html);fs.copyFileSync(path.join(sdkRoot,'LICENSE'),path.join(project,'build/web-desktop/COLYSEUS-LICENSE.txt'));console.log(`Web build ready: ${htmlPath}`);
});
