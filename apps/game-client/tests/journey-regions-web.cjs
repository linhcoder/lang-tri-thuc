const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process'),{chromium}=require('playwright');
const output=path.resolve(__dirname,'../temp/journey-regions-qa');fs.mkdirSync(output,{recursive:true});
const ready=(child,match)=>new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Server startup timeout')),15000);child.once('error',reject);child.once('exit',code=>{clearTimeout(timer);reject(Error('Server exited '+code));});child.stdout.on('data',data=>{if(String(data).includes(match)){clearTimeout(timer);resolve();}});child.stderr.on('data',data=>process.stderr.write(data));});
(async()=>{
    const web=spawn(process.execPath,['tools/serve-web.cjs'],{env:{...process.env,WEB_PORT:'8139',GAME_BUILD_NAME:'web-desktop'},windowsHide:true,stdio:['ignore','pipe','pipe']});
    const api=spawn(process.execPath,['--input-type=module','-e',"const {createApi}=await import('./apps/backend/dist/main.js');const {SqliteRepository}=await import('./apps/backend/dist/Store.js');const app=await createApi({store:new SqliteRepository(),roomSecret:'student-browser-test-secret-at-least-32',origin:['http://127.0.0.1:8139']});await app.listen({host:'127.0.0.1',port:33019});console.log('READY');"],{windowsHide:true,stdio:['ignore','pipe','pipe']});
    let browser;
    try{
        await Promise.all([ready(web,'Game web'),ready(api,'READY')]);
        browser=await chromium.launch({executablePath:require('../../../tools/browser-path.cjs')(),headless:true,args:['--enable-webgl','--use-angle=d3d11']});
        const context=await browser.newContext({viewport:{width:1440,height:900}}),page=await context.newPage(),errors=[];page.on('console',message=>{if(message.type()==='error')console.error('BROWSER:',message.text());});page.on('pageerror',error=>{errors.push(error.message);console.error('PAGE ERROR:',error.message);});
        await page.addInitScript(()=>{const nativeFetch=window.fetch.bind(window);window.fetch=(input,options)=>nativeFetch(typeof input==='string'?input.replace('http://127.0.0.1:33000/','http://127.0.0.1:33019/'):input,options);});
        const gameReady=async()=>{
            await page.locator('#student-gate').waitFor({state:'detached',timeout:20000});
            await page.waitForFunction(()=>window.System);
            await page.evaluate(async()=>window.cc=await System.import('cc'));
            try{
                await page.waitForFunction(()=>{window.v=cc.director.getScene()?.getChildByName('Canvas')?.getComponent('VillageBootstrap');return v?.assetsReady;},undefined,{timeout:45000});
                await page.evaluate(()=>{v.chapter.close();v.hub.close();});
                await page.waitForFunction(()=>v.hud.info.string===v.hub.studentName);
            }catch(error){
                console.log(await page.evaluate(()=>({initialized:v?.initialized,student:v?.student?.profile,loading:v?.loadingLabel?.string,gate:document.getElementById('student-gate')?.textContent,splash:document.getElementById('splash-message')?.textContent})));
                await page.screenshot({path:path.join(output,'failure.png')});throw error;
            }
        };
        await page.goto('http://127.0.0.1:8139/?demo=1');await page.locator('#student-gate').waitFor();
        await page.screenshot({path:path.join(output,'login-desktop.png')});
        await page.getByRole('button',{name:'Tạo tài khoản mới',exact:true}).click();await page.getByLabel('Tên tài khoản').fill('student-qa-'+Date.now());await page.getByLabel('Mật khẩu (ít nhất 12 ký tự)').fill('StudentBrowser123!');await page.getByRole('button',{name:'Tạo tài khoản',exact:true}).click();
        await page.getByRole('button',{name:'Thêm học sinh',exact:true}).click();await page.getByLabel('Tên hiển thị của bé').fill('Minh Anh');await page.getByLabel('Nhóm tuổi').selectOption('6-8');await page.getByLabel('Giới tính nhân vật').selectOption('female');await page.getByLabel('Trang phục nhân vật').selectOption('2');await page.screenshot({path:path.join(output,'student-profile.png')});await page.getByRole('button',{name:'Lưu và vào làng',exact:true}).click();await gameReady();
        const ids=['village','school','farm','market','craft','forest','river','science','culture','island'];
        const frames=await page.evaluate(ids=>ids.map(id=>{const node=v.actors.getChildByName('JourneyLandmark-'+id),frame=node?.getChildByName('PaintedLandmark')?.getComponent(cc.Sprite)?.spriteFrame;return {id,uuid:frame?.texture._uuid,width:frame?.rect.width,height:frame?.rect.height};}),ids);
        assert.ok(frames.every(f=>f.uuid&&f.width>500&&f.height>300));assert.equal(new Set(frames.map(f=>f.uuid)).size,10);
        for(const viewport of [{width:1440,height:900},{width:844,height:390}]){
            await page.setViewportSize(viewport);
            for(const id of ids){
                await page.evaluate(id=>{v.hub.close();v.chapter.close();v.player.cancel();const node=v.actors.getChildByName('JourneyLandmark-'+id),p=node.position,height=node.getChildByName('PaintedLandmark').getComponent(cc.UITransform).height;v.player.position={x:p.x,y:p.y-65};v.freeCameraOffset={x:-p.x,y:-(p.y+height*.25)};},id);
                await page.waitForTimeout(250);await page.screenshot({path:path.join(output,id+'-'+viewport.width+'.png')});
            }
        }
        assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({frames,viewports:['1440x900','844x390'],errors},null,2));
        console.log('Journey region art QA passed: ten distinct textures, depth-sorted landmarks, desktop/mobile, no page errors.');
    }finally{await browser?.close();web.kill();api.kill();}
})().catch(error=>{console.error(error);process.exitCode=1;});
