const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process'),{chromium}=require('playwright');
const output=path.resolve(__dirname,'../temp/level-journey-qa');fs.mkdirSync(output,{recursive:true});
const ready=(child,match)=>new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Server startup timeout')),15000);child.once('error',reject);child.once('exit',code=>{clearTimeout(timer);reject(Error('Server exited '+code));});child.stdout.on('data',data=>{if(String(data).includes(match)){clearTimeout(timer);resolve();}});child.stderr.on('data',data=>process.stderr.write(data));});
(async()=>{
    const web=spawn(process.execPath,['tools/serve-web.cjs'],{env:{...process.env,WEB_PORT:'8138',GAME_BUILD_NAME:'web-desktop'},windowsHide:true,stdio:['ignore','pipe','pipe']});
    const api=spawn(process.execPath,['--input-type=module','-e',"const {createApi}=await import('./apps/backend/dist/main.js');const {SqliteRepository}=await import('./apps/backend/dist/Store.js');const app=await createApi({store:new SqliteRepository(),roomSecret:'student-browser-test-secret-at-least-32',origin:['http://127.0.0.1:8138']});await app.listen({host:'127.0.0.1',port:33018});console.log('READY');"],{windowsHide:true,stdio:['ignore','pipe','pipe']});
    let browser;
    try{
        await Promise.all([ready(web,'Game web'),ready(api,'READY')]);
        browser=await chromium.launch({executablePath:require('../../../tools/browser-path.cjs')(),headless:true,args:['--enable-webgl','--use-angle=d3d11']});
        const context=await browser.newContext({viewport:{width:1440,height:900}}),page=await context.newPage(),errors=[];page.on('console',message=>{if(message.type()==='error')console.error('BROWSER:',message.text());});page.on('pageerror',error=>{errors.push(error.message);console.error('PAGE ERROR:',error.message);});
        await page.addInitScript(()=>{const nativeFetch=window.fetch.bind(window);window.fetch=(input,options)=>nativeFetch(typeof input==='string'?input.replace('http://127.0.0.1:33000/','http://127.0.0.1:33018/'):input,options);});
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
        await page.goto('http://127.0.0.1:8138/?demo=1');await page.locator('#student-gate').waitFor();
        await page.screenshot({path:path.join(output,'login-desktop.png')});
        await page.getByRole('button',{name:'Tạo tài khoản mới',exact:true}).click();await page.getByLabel('Tên tài khoản').fill('student-qa-'+Date.now());await page.getByLabel('Mật khẩu (ít nhất 12 ký tự)').fill('StudentBrowser123!');await page.getByRole('button',{name:'Tạo tài khoản',exact:true}).click();
        await page.getByRole('button',{name:'Thêm học sinh',exact:true}).click();await page.getByLabel('Tên hiển thị của bé').fill('Minh Anh');await page.getByLabel('Nhóm tuổi').selectOption('6-8');await page.getByLabel('Giới tính nhân vật').selectOption('female');await page.getByLabel('Trang phục nhân vật').selectOption('2');await page.screenshot({path:path.join(output,'student-profile.png')});await page.getByRole('button',{name:'Lưu và vào làng',exact:true}).click();await gameReady();
        const profile=await page.evaluate(()=>({name:v.hud.info.string,age:v.hub.campaign.data.age,avatar:v.hub.campaign.data.avatar,level:v.hub.campaign.level,scope:v.profileScope,demo:v.demo,landmarks:['forest','science','culture','island'].map(id=>!!v.actors.getChildByName('JourneyLandmark-'+id))}));assert.equal(profile.name,'Minh Anh');assert.equal(profile.age,'6-8');assert.equal(profile.avatar,2);assert.equal(profile.demo,false);assert.deepEqual(profile.landmarks,[true,true,true,true]);
        await page.evaluate(()=>{v.hub.open('avatar');v.hub.buttons.find(b=>b.node.name==='Avatar-3').action();v.hub.close();});await page.waitForFunction(()=>v.student.profile.avatar===3&&!v.appearanceBusy);
        await page.evaluate(()=>{v.chapter.close();v.hub.open('journey');});await page.waitForTimeout(300);await page.screenshot({path:path.join(output,'journey-desktop.png')});
        const progress=await page.evaluate(()=>{v.hub.buttons.find(b=>b.node.name==='Journey-journey.village.1').action();const wrong=v.hub.campaign.xp;v.hub.buttons.find(b=>b.node.name==='JourneyAnswer-1').action();const afterWrong=v.hub.campaign.xp;for(const index of [0,2,1])v.hub.buttons.find(b=>b.node.name==='JourneyAnswer-'+index).action();return {wrong,afterWrong,xp:v.hub.campaign.xp,level:v.hub.campaign.level,done:v.hub.campaign.journey.completed};});assert.equal(progress.wrong,progress.afterWrong);assert.equal(progress.xp,100);assert.equal(progress.level,2);assert.deepEqual(progress.done,['journey.village.1']);
        await page.waitForFunction(()=>v.cloudSignature.includes('journey.village.1')&&!v.cloudBusy,undefined,{timeout:15000});
        const cloud=await page.evaluate(async()=>{const response=await fetch(v.student.api+'/profiles/'+v.student.profile.id+'/progress',{headers:{Authorization:'Bearer '+v.student.token}});return (await response.json()).data.journey.completed;});assert.deepEqual(cloud,['journey.village.1']);
        await page.reload();await gameReady();assert.equal(await page.evaluate(()=>v.hub.campaign.level),2);assert.equal(await page.evaluate(()=>v.hud.info.string),'Minh Anh');assert.equal(await page.evaluate(()=>v.hub.campaign.data.avatar),3);
        await page.evaluate(()=>v.hub.onStudentChange());await page.getByRole('button',{name:'Thêm học sinh',exact:true}).click();await page.getByLabel('Tên hiển thị của bé').fill('Bảo');await page.getByLabel('Nhóm tuổi').selectOption('3-5');await page.getByLabel('Giới tính nhân vật').selectOption('male');await page.getByRole('button',{name:'Lưu và vào làng',exact:true}).click();await gameReady();assert.equal(await page.evaluate(()=>v.hub.campaign.level),1);assert.equal(await page.evaluate(()=>v.hud.info.string),'Bảo');assert.notEqual(await page.evaluate(()=>v.profileScope),profile.scope);
        await page.evaluate(()=>v.hub.onStudentChange());await page.getByRole('button',{name:'Sửa hồ sơ Bảo',exact:true}).click();await page.getByLabel('Nhóm tuổi').selectOption('9-11');await page.getByRole('button',{name:'Lưu và vào làng',exact:true}).click();await gameReady();assert.equal(await page.evaluate(()=>v.hub.campaign.data.age),'9-11');assert.equal(await page.evaluate(()=>v.childSprite.spriteFrame.rect.height),128);
        // Regional art is loaded on approach, rather than blocking initial play.
        for(const id of ['village','school','farm','market','craft','forest','river','science','culture','island']){
            await page.evaluate(id=>{v.player.cancel();const p=v.actors.getChildByName('JourneyLandmark-'+id).position;v.player.position={x:p.x,y:p.y-90};v.player.node.setPosition(v.player.position.x,v.player.position.y);v.freeCameraOffset=undefined;v.update(.05);},id);
            await page.waitForFunction(id=>{const n=v.actors.getChildByName('JourneyLandmark-'+id);return !!(n?.getChildByName('PrivateHouseArt')??n?.getChildByName('PaintedLandmark'))?.getComponent(cc.Sprite)?.spriteFrame;},id,{timeout:30000});
        }
        await page.evaluate(()=>{v.chapter.close();v.hub.close();v.player.cancel();v.player.position={x:736,y:-1424};});await page.waitForTimeout(400);await page.screenshot({path:path.join(output,'science-region.png')});
        await page.setViewportSize({width:844,height:390});await page.evaluate(()=>v.hub.open('journey'));await page.waitForTimeout(400);await page.screenshot({path:path.join(output,'journey-mobile-landscape.png')});
        await page.evaluate(()=>v.hub.close());
        const regionalTextures=await page.evaluate(()=>['village','school','farm','market','craft','forest','river','science','culture','island'].map(id=>{const n=v.actors.getChildByName('JourneyLandmark-'+id);return (n.getChildByName('PrivateHouseArt')??n.getChildByName('PaintedLandmark')).getComponent(cc.Sprite).spriteFrame.texture._uuid;}));
        assert.equal(new Set(regionalTextures).size,10,'Every region must have its own texture');
        for(const id of ['village','school','farm','market','craft','forest','river','science','culture','island']){
            await page.evaluate(id=>{v.player.cancel();const p=v.actors.getChildByName('JourneyLandmark-'+id).position;v.player.position={x:p.x,y:p.y-90};},id);
            await page.waitForTimeout(450);await page.screenshot({path:path.join(output,'region-'+id+'-landscape.png')});
        }
        await page.evaluate(()=>v.hub.onStudentChange());await page.getByRole('button',{name:'Sửa hồ sơ Bảo',exact:true}).waitFor();await page.screenshot({path:path.join(output,'student-mobile-landscape.png')});
        await page.getByRole('button',{name:'Đăng xuất',exact:true}).click();await page.getByLabel('Tên tài khoản').waitFor();await page.reload();await page.getByLabel('Tên tài khoản').waitFor();assert.equal(await page.locator('#student-gate').count(),1);
        assert.deepEqual(errors,[]);fs.rmSync(path.join(output,'failure.png'),{force:true});fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({profile,progress,cloud,appearancePersistence:true,ageBandsChecked:['3-5','6-8','9-11'],paintedRegions:true,logout:true,errors},null,2));console.log('Browser QA passed: mandatory login, age/gender profile, correct name, level rewards, cloud and outfit persistence, student isolation, desktop and mobile landscape.');
    }finally{await browser?.close();web.kill();api.kill();}
})().catch(error=>{console.error(error);process.exitCode=1;});
