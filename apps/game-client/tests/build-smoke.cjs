// Verify the actual Cocos web build (no script overrides or fake rendering).
// node tests/build-smoke.cjs <playwright-module> <chrome.exe> [web-url]
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.argv[2]||'playwright');
const origin=process.argv[4]||'http://127.0.0.1:8080';
const output=path.resolve(__dirname,'../temp/release-qa');fs.mkdirSync(output,{recursive:true});
const untilOptions={timeout:20000};
(async()=>{
    const browser=await chromium.launch({executablePath:require('../../../tools/browser-path.cjs')(process.argv[3]),headless:true,args:['--enable-webgl','--enable-gpu',...(process.platform==='win32'?['--use-angle=d3d11']:[])]});
    const errors=[];const results=[];
    async function boot(mobile=false,online=false){
        const context=await browser.newContext(mobile?{viewport:{width:390,height:844},isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36'}:{viewport:{width:1280,height:720}});
        const page=await context.newPage();page.on('pageerror',e=>{errors.push(String(e));console.error('PAGE ERROR',String(e));});page.on('console',m=>{if(m.type()==='error'){errors.push(m.text());console.error('CONSOLE ERROR',m.text());}else if(m.type()==='warning')console.log('BROWSER WARNING',m.text());});
        if(online)page.on('websocket',socket=>console.log('WEBSOCKET',socket.url()));
        await page.goto(origin+(online?'/?demo=1&server=http://127.0.0.1:2567':'/?demo=1'));
        await page.waitForFunction(()=>!!window.System,undefined,{timeout:90000});
        await page.evaluate(async()=>{window.ccQA=await System.import('cc');});
        await page.waitForFunction(()=>{const n=ccQA.director.getScene()?.getChildByName('Canvas');return !!n?.getComponent('VillageBootstrap')?.assetsReady;},undefined,{timeout:90000});
        await page.evaluate(()=>{window.village=ccQA.director.getScene().getChildByName('Canvas').getComponent('VillageBootstrap');});
        return {context,page};
    }
    async function point(page,node,key={x:0,y:0}){
        return page.evaluate(({node,key})=>{
            const cc=ccQA,b=village,n=node==='farmer'?b.farmer.node:node.startsWith('bundle')?b.bundleNodes[Number(node.slice(6))]:b[node];
            const world=n.getComponent(cc.UITransform).convertToWorldSpaceAR(new cc.Vec3(key.x,key.y,0));
            const p=b.node.getComponent(cc.Canvas).cameraComponent.worldToScreen(world),canvas=cc.game.canvas,r=canvas.getBoundingClientRect();
            return {x:r.left+p.x/canvas.width*r.width,y:r.top+(canvas.height-p.y)/canvas.height*r.height};
        },{node,key});
    }
    async function tap(page,node,key,mobile=false){const p=await point(page,node,key);if(mobile)await page.touchscreen.tap(p.x,p.y);else await page.mouse.click(p.x,p.y);}
    async function farmer(page,mobile=false){await tap(page,'farmer',{x:0,y:60},mobile);console.log('NPC REQUEST',JSON.stringify(await page.evaluate(()=>({pending:village.pendingNpc,path:village.player.hasPath,position:village.player.position,npc:village.farmer.node.position,dialog:village.dialog.active}))));await page.waitForFunction(()=>village.dialog.active,undefined,untilOptions);}
    try{
        const {context,page}=await boot();
        assert.equal(await page.evaluate(()=>village.art.child.length),24);
        assert.equal(await page.evaluate(()=>village.terrainChunks.filter(c=>c.node.name.startsWith('PaintedTerrain')).length),25);
        await page.screenshot({path:path.join(output,'village-desktop.png')});
        await page.locator('#GameCanvas').focus();const start=await page.evaluate(()=>village.player.position.x);
        await page.keyboard.down('d');await page.waitForTimeout(200);await page.keyboard.up('d');assert.ok((await page.evaluate(()=>village.player.position.x))>start+5);
        await farmer(page);await tap(page,'dialog',{x:0,y:-110});assert.equal(await page.evaluate(()=>village.learning.data.stage),'collect');
        for(let i=0;i<3;i++){
            await tap(page,`bundle${i}`,{x:0,y:25});
            await page.waitForFunction(index=>village.learning.data.collected.indexOf(index)>=0,i,untilOptions);
        }
        assert.equal(await page.evaluate(()=>village.learning.data.stage),'count');
        await farmer(page);await page.screenshot({path:path.join(output,'counting.png')});
        // First choose a wrong answer: lesson must remain unchanged, without punishment.
        await tap(page,'dialog',{x:-160,y:-85});assert.equal(await page.evaluate(()=>village.learning.data.countWins),0);
        for(let i=0;i<3;i++)await tap(page,'dialog',{x:0,y:-85});
        assert.equal(await page.evaluate(()=>village.learning.data.stage),'sow');
        await page.screenshot({path:path.join(output,'sowing.png')});
        const cells=[[-180,-25],[-90,-25],[0,-25],[90,-25],[180,-25],[245,25],[180,75],[90,75],[0,75],[-90,75],[-180,75],[-245,25]];
        for(let i=0;i<3;i++){
            const answer=[4,0,3][i];await tap(page,'dialog',{x:cells[answer][0],y:cells[answer][1]});
            assert.equal(await page.evaluate(()=>village.learning.data.sowWins),i+1);
            if(i<2)await tap(page,'dialog',{x:0,y:-185});
        }
        assert.equal(await page.evaluate(()=>village.learning.data.stage),'complete');await page.screenshot({path:path.join(output,'reward.png')});
        await page.reload();await page.waitForFunction(()=>!!window.System);await page.evaluate(async()=>{window.ccQA=await System.import('cc');});
        await page.waitForFunction(()=>ccQA.director.getScene()?.getChildByName('Canvas')?.getComponent('VillageBootstrap')?.assetsReady,undefined,{timeout:60000});
        assert.equal(await page.evaluate(()=>ccQA.director.getScene().getChildByName('Canvas').getComponent('VillageBootstrap').learning.data.stage),'complete');
        results.push('desktop movement; full harvest/count/sowing/reward flow; wrong-answer feedback; persistence');
        await context.close();
        const mobile=await boot(true);await mobile.page.screenshot({path:path.join(output,'village-mobile.png')});
        assert.equal(await mobile.page.evaluate(()=>village.joystick.active),true);
        const stick=await point(mobile.page,'joystick'),cdp=await mobile.context.newCDPSession(mobile.page);
        const before=await mobile.page.evaluate(()=>village.player.position.x);
        await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:stick.x,y:stick.y,id:1}]});
        await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:stick.x+35,y:stick.y,id:1}]});await mobile.page.waitForTimeout(250);
        await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.ok((await mobile.page.evaluate(()=>village.player.position.x))>before+5);
        await farmer(mobile.page,true);await mobile.page.screenshot({path:path.join(output,'dialogue-mobile.png')});await tap(mobile.page,'dialog',{x:0,y:-230},true);
        assert.equal(await mobile.page.evaluate(()=>village.dialog.active),false);
        await mobile.page.setViewportSize({width:844,height:390});await mobile.page.waitForTimeout(400);await mobile.page.screenshot({path:path.join(output,'mobile-landscape.png')});
        results.push('mobile joystick/touch/NPC dialogue/rotation');await mobile.context.close();
        const a=await boot(false,true),b=await boot(false,true);
        await a.page.waitForFunction(()=>village.network.room&&village.network.players.size===1,undefined,untilOptions);
        await b.page.waitForFunction(()=>village.network.room&&village.network.players.size===1,undefined,untilOptions);
        await a.page.locator('#GameCanvas').focus();await a.page.keyboard.down('d');await a.page.waitForTimeout(400);await a.page.keyboard.up('d');
        await b.page.waitForFunction(()=>[...village.network.players.values()][0]?.x>20,undefined,untilOptions);
        await b.page.screenshot({path:path.join(output,'multiplayer.png')});
        await a.context.close();await b.page.waitForFunction(()=>village.network.players.size===0,undefined,untilOptions);
        const oldSession=await b.page.evaluate(()=>village.network.room.sessionId);
        await b.page.evaluate(()=>village.network.room.leave());
        await b.page.waitForFunction(id=>!!village.network.room&&village.network.room.sessionId!==id,oldSession,{timeout:30000});
        const metrics=await b.page.evaluate(async()=>{
            const intervals=[];let last=performance.now();await new Promise(resolve=>{const begin=last;function frame(now){intervals.push(now-last);last=now;if(now-begin<5000)requestAnimationFrame(frame);else resolve();}requestAnimationFrame(frame);});
            intervals.sort((a,b)=>a-b);const total=intervals.reduce((x,y)=>x+y,0),device=ccQA.director.root.device;
            const gl=ccQA.game.canvas.getContext('webgl2')||ccQA.game.canvas.getContext('webgl'),extension=gl?.getExtension('WEBGL_debug_renderer_info');
            return {fps:1000/(total/intervals.length),p95FrameMs:intervals[Math.floor(intervals.length*0.95)],drawCalls:device.numDrawCalls,renderer:extension?gl.getParameter(extension.UNMASKED_RENDERER_WEBGL):device.renderer,heapMB:performance.memory?performance.memory.usedJSHeapSize/1048576:null,activeChunks:village.terrainChunks.filter(c=>c.node.active).length,hardware:'Current workstation (AMD Radeon); Intel HD/UHD and physical phone unverified'};
        });
        results.push('two browser players synchronize, leave cleanly and reconnect');await b.context.close();
        assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({results,metrics,errors},null,2));console.log(JSON.stringify({results,metrics,errors},null,2));
    }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
