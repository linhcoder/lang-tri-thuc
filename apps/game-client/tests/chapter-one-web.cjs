// Production Cocos build: real pointer/touch input, no substituted gameplay code.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const origin=process.env.GAME_WEB_URL||'http://127.0.0.1:8080';
const output=path.resolve(__dirname,'../temp/chapter-one-qa');fs.mkdirSync(output,{recursive:true});
const saveKey='lang-tri-thuc.chapter-one.v2',legacyKey='lang-tri-thuc.learning.v1';
(async()=>{
    const browser=await chromium.launch({executablePath:require('../../../tools/browser-path.cjs')(),headless:true,args:['--enable-webgl','--enable-gpu',...(process.platform==='win32'?['--use-angle=d3d11']:[])]});
    const errors=[],results=[];let metrics;
    async function aspect(page){const sizes=await page.evaluate(()=>{const c=ccQA.game.canvas,r=c.getBoundingClientRect(),w=ccQA.director.root.mainWindow;return {backing:c.width/c.height,css:r.width/r.height,canvas:[c.width,c.height],renderWindow:[w.width,w.height]};});assert.ok(Math.abs(sizes.backing/sizes.css-1)<0.01,'Canvas must retain aspect ratio after resize');assert.deepEqual(sizes.renderWindow,sizes.canvas,'Render window and cameras must resize with the canvas');}
    async function touchSize(page){const height=await page.evaluate(()=>{const b=village,c=ccQA.game.canvas,r=c.getBoundingClientRect();return b.chapter.node.getScale().y*76*ccQA.view.getScaleY()*r.height/c.height;});assert.ok(height>=44,'Chapter controls need at least 44 CSS pixels');}
    async function ready(page){
        await page.waitForFunction(()=>!!window.System,undefined,{timeout:90000});
        await page.evaluate(async()=>{window.ccQA=await System.import('cc');});
        await page.waitForFunction(()=>ccQA.director.getScene()?.getChildByName('Canvas')?.getComponent('VillageBootstrap')?.assetsReady,undefined,{timeout:90000});
        await page.evaluate(()=>{window.village=ccQA.director.getScene().getChildByName('Canvas').getComponent('VillageBootstrap');});
    }
    async function boot(mobile=false,seed){
        const context=await browser.newContext(mobile?{viewport:{width:390,height:844},isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36'}:{viewport:{width:1280,height:720}});
        if(seed)await context.addInitScript(({key,value})=>{if(!sessionStorage.seeded){localStorage.setItem(key,value);sessionStorage.seeded='1';}},seed);
        const page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
        await page.goto(origin);await ready(page);return {context,page};
    }
    async function point(page,kind,id){return page.evaluate(({kind,id})=>{
        const cc=ccQA,b=village,c=b.chapter;
        const node=kind==='button'?c.node.getChildByName(id):kind==='objective'?b.questButton:kind==='elder'?c.elder:kind==='farmer'?b.farmer.node:kind==='plot'?c.plots[id]:b.joystick;
        const y=kind==='elder'||kind==='farmer'?60:0;
        const w=node.getComponent(cc.UITransform).convertToWorldSpaceAR(new cc.Vec3(0,y,0)),s=b.node.getComponent(cc.Canvas).cameraComponent.worldToScreen(w),canvas=cc.game.canvas,r=canvas.getBoundingClientRect();
        return {x:r.left+s.x/canvas.width*r.width,y:r.top+(canvas.height-s.y)/canvas.height*r.height};
    },{kind,id});}
    async function tap(page,kind,id,mobile=false){const p=await point(page,kind,id);assert.ok(p.x>=0&&p.y>=0,`${kind} outside viewport`);if(mobile)await page.touchscreen.tap(p.x,p.y);else await page.mouse.click(p.x,p.y);}
    async function npc(page,kind,mobile=false){const p=await point(page,kind,null),size=page.viewportSize();await tap(page,p.x<0||p.x>size.width||p.y<180||p.y>size.height?'objective':kind,null,mobile);await page.waitForFunction(()=>village.dialog.active,undefined,{timeout:20000});}
    async function reload(page){await page.reload();await ready(page);}
    async function answer(page,value,mobile=false){await tap(page,'button','Answer-'+value,mobile);}
    try{
        const {page,context}=await boot();
        await page.screenshot({path:path.join(output,'intro-desktop.png')});
        await tap(page,'button','Read');await tap(page,'button','StopRead');assert.equal(await page.evaluate(()=>village.chapterSave.progress.stage),'intro');
        assert.equal(await page.evaluate(()=>village.chapterSave.progress.stage),'intro');await tap(page,'button','Continue');
        await npc(page,'elder');await tap(page,'button','Continue');assert.equal(await page.evaluate(()=>village.chapterSave.progress.stage),'meet-farmer');
        await npc(page,'farmer');await tap(page,'button','Continue');assert.equal(await page.evaluate(()=>village.chapterSave.progress.stage),'plant');
        for(let i=0;i<5;i++){
            await tap(page,'plot',i);await page.waitForFunction(i=>village.chapterSave.progress.data.planted.includes(i),i,{timeout:20000});
            if(i===0||i===3){await reload(page);assert.equal(await page.evaluate(()=>village.chapterSave.progress.data.planted.length),i+1);}
        }
        assert.equal(await page.evaluate(()=>village.chapterSave.progress.stage),'count');await npc(page,'farmer');
        await answer(page,2);assert.equal(await page.evaluate(()=>village.chapterSave.progress.data.countRound),0);
        await tap(page,'button','Hint');await page.screenshot({path:path.join(output,'count-hint.png')});
        await answer(page,3);await reload(page);assert.equal(await page.evaluate(()=>village.chapterSave.progress.data.countRound),1);
        await npc(page,'farmer');await answer(page,5);await answer(page,2);
        assert.equal(await page.evaluate(()=>village.chapterSave.progress.stage),'return');assert.equal(await page.evaluate(()=>village.chapterSave.progress.stars),0);await tap(page,'button','Close');
        await npc(page,'elder');await tap(page,'button','Continue');await page.screenshot({path:path.join(output,'first-star.png')});
        assert.equal(await page.evaluate(()=>village.chapterSave.progress.stars),1);await tap(page,'button','Close');await reload(page);
        assert.equal(await page.evaluate(()=>village.chapterSave.progress.chapterTwoUnlocked),true);
        await npc(page,'elder');await tap(page,'button','Continue');await answer(page,3);await reload(page);
        assert.equal(await page.evaluate(()=>village.chapterSave.progress.data.replayRound),1);await npc(page,'farmer');await answer(page,5);await answer(page,2);await tap(page,'button','Continue');
        assert.equal(await page.evaluate(()=>village.chapterSave.progress.stars),1);assert.equal(await page.evaluate(()=>village.chapterSave.progress.data.rewardReceipts.length),1);
        metrics=await page.evaluate(async()=>{
            const intervals=[];let last=performance.now();await new Promise(resolve=>{const start=last;function frame(now){intervals.push(now-last);last=now;if(now-start<5000)requestAnimationFrame(frame);else resolve();}requestAnimationFrame(frame);});intervals.sort((a,b)=>a-b);
            const gl=ccQA.game.canvas.getContext('webgl2')||ccQA.game.canvas.getContext('webgl'),ext=gl?.getExtension('WEBGL_debug_renderer_info');
            return {fps:1000/(intervals.reduce((a,b)=>a+b)/intervals.length),p95FrameMs:intervals[Math.floor(intervals.length*0.95)],drawCalls:ccQA.director.root.device.numDrawCalls,heapMB:performance.memory?.usedJSHeapSize/1048576,renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):null};
        });results.push('desktop full chapter, partial planting/count/replay reload, wrong answer/hint, unique star');await context.close();
        const mobile=await boot(true);await tap(mobile.page,'button','Continue',true);await npc(mobile.page,'elder',true);await tap(mobile.page,'button','Continue',true);await npc(mobile.page,'farmer',true);await tap(mobile.page,'button','Continue',true);
        const stick=await point(mobile.page,'stick'),cdp=await mobile.context.newCDPSession(mobile.page);
        await tap(mobile.page,'plot',0,true);
        await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:stick.x,y:stick.y,id:1}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
        assert.equal(await mobile.page.evaluate(()=>village.chapter.pending),null);
        for(let i=0;i<5;i++){await tap(mobile.page,'plot',i,true);await mobile.page.waitForFunction(i=>village.chapterSave.progress.data.planted.includes(i),i,{timeout:20000});}
        await npc(mobile.page,'farmer',true);await mobile.page.screenshot({path:path.join(output,'count-mobile.png')});for(const n of [3,5,2])await answer(mobile.page,n,true);await tap(mobile.page,'button','Close',true);
        await npc(mobile.page,'elder',true);await tap(mobile.page,'button','Continue',true);assert.equal(await mobile.page.evaluate(()=>village.chapterSave.progress.stars),1);
        await aspect(mobile.page);await touchSize(mobile.page);await mobile.page.setViewportSize({width:844,height:390});await mobile.page.waitForTimeout(400);await aspect(mobile.page);await touchSize(mobile.page);assert.equal(await mobile.page.evaluate(()=>village.questButton.active),false);await mobile.page.screenshot({path:path.join(output,'ending-landscape.png')});await tap(mobile.page,'button','Close',true);assert.equal(await mobile.page.evaluate(()=>village.dialog.active),false);results.push('mobile full chapter, touch/joystick ownership, 44px controls and landscape without canvas stretch or HUD obstruction');await mobile.context.close();
        const legacy=JSON.stringify({version:1,stage:'complete',collected:[0,1,2],countWins:3,sowWins:3});const migrated=await boot(false,{key:legacyKey,value:legacy});
        assert.equal(await migrated.page.evaluate(()=>village.chapterSave.progress.data.legacyDemoBadge),true);assert.equal(await migrated.page.evaluate(()=>village.chapterSave.progress.stars),0);await tap(migrated.page,'button','Continue');
        assert.equal(await migrated.page.evaluate(key=>localStorage.getItem(key),legacyKey),legacy);await reload(migrated.page);assert.equal(await migrated.page.evaluate(()=>village.chapterSave.progress.stage),'greet');await migrated.context.close();results.push('legacy badge kept, demo raw save untouched, chapter starts fresh');
        const future='{"version":3,"keep":"future-progress"}',newer=await boot(false,{key:saveKey,value:future});await tap(newer.page,'button','Continue');assert.equal(await newer.page.evaluate(key=>localStorage.getItem(key),saveKey),future);assert.equal(await newer.page.evaluate(()=>village.chapterSave.sessionOnly),true);await newer.context.close();results.push('future save remains untouched in session-only mode');
        const broken='{broken-save',recovered=await boot(false,{key:saveKey,value:broken});await tap(recovered.page,'button','Continue');assert.equal(await recovered.page.evaluate(key=>localStorage.getItem(key+'.recovery'),saveKey),broken);await reload(recovered.page);assert.equal(await recovered.page.evaluate(()=>village.chapterSave.progress.stage),'greet');await recovered.context.close();results.push('corrupt save backed up before fresh progress is written');
        assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({results,metrics,errors},null,2));console.log(JSON.stringify({results,metrics,errors},null,2));
    }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
