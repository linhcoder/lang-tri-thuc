const fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process');
const project=path.resolve(__dirname,'../apps/game-client');
const buildName=process.env.GAME_BUILD_NAME||'web-desktop';
if(!/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(buildName))throw Error('Invalid GAME_BUILD_NAME');
const executable=process.argv[2]||process.env.COCOS_CREATOR||'C:/ProgramData/cocos/editors/Creator/3.8.8/CocosCreator.exe';
const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
fs.mkdirSync(path.join(project,'temp'),{recursive:true});
let configPath=path.join(project,'build-web.json');
if(buildName!=='web-desktop'){const config=JSON.parse(fs.readFileSync(configPath,'utf8'));config.outputName=buildName;configPath=path.join(project,'temp',`build-${buildName}.json`);fs.writeFileSync(configPath,JSON.stringify(config));}
const sdkRoot=path.resolve(__dirname,'../node_modules/@colyseus/sdk');
fs.mkdirSync(path.join(project,'assets/resources/vendor'),{recursive:true});
fs.copyFileSync(path.join(sdkRoot,'dist/colyseus.js'),path.join(project,'assets/resources/vendor/colyseus.txt'));
const log=fs.createWriteStream(path.join(project,'temp/release-build.log'));
const child=spawn(executable,['--project',project,'--build',`configPath=${configPath}`],{env,windowsHide:true,stdio:['ignore','pipe','pipe']});
child.stdout.pipe(log);child.stderr.pipe(log);
child.on('error',error=>{console.error(error);process.exitCode=1;});
child.on('exit',code=>{
    log.end();if(code!==36&&code!==0){console.error(`Cocos build failed (${code}); see apps/game-client/temp/release-build.log`);process.exitCode=1;return;}
    const htmlPath=path.join(project,'build',buildName,'index.html');
    if(!fs.existsSync(htmlPath)){console.error('No web output produced');process.exitCode=1;return;}
    // Disable the engine splash for every web release, including its Cocos watermark.
    const settingsPath=path.join(project,'build',buildName,'src/settings.json');
    const settings=JSON.parse(fs.readFileSync(settingsPath,'utf8'));
    settings.splashScreen={...settings.splashScreen,totalTime:0,logo:{type:'none'}};
    fs.writeFileSync(settingsPath,JSON.stringify(settings));
    let html=fs.readFileSync(htmlPath,'utf8');
    html=html.replace('<html>','<html lang="vi">').replace(/<title>[^<]*<\/title>/,'<title>Làng Tri Thức</title>').replace(/\s*<h1 class="header">[\s\S]*?<\/h1>/,'').replace(/\s*<p class="footer">[\s\S]*?<\/p>/,'');
    html=html.replace('minimal-ui=true','minimal-ui=true,viewport-fit=cover');
    html=html.replace('</head>','<style>html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#c1dab3}#GameDiv{position:fixed!important;inset:0;width:100vw!important;height:100vh!important;border:0;border-radius:0;box-shadow:none}canvas{touch-action:none;outline:none;display:block}</style></head>');
    fs.writeFileSync(htmlPath,html);fs.copyFileSync(path.join(sdkRoot,'LICENSE'),path.join(project,'build',buildName,'COLYSEUS-LICENSE.txt'));console.log(`Web build ready: ${htmlPath}`);
});
