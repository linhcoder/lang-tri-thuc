// Real Cocos preview QA. No production dependencies; pass installed Playwright and Chrome paths.
// node tests/browser-smoke.cjs <playwright-module> <chrome.exe> <preview-url> <typescript-module>
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require(process.argv[2] || 'playwright');
const ts = require(process.argv[5] || 'typescript');
const url = process.argv[4] || 'http://localhost:7456';
const output = path.resolve(__dirname, '../temp/milestone01a-qa');
const savedScene = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../assets/scenes/VillageScene.scene'), 'utf8'));
const importMap = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../temp/programming/packer-driver/targets/preview/import-map.json'), 'utf8'));
const overrides = new Map();
for (const relative of ['world/VillageModel.ts','player/PlayerController.ts','npc/FarmerNPC.ts','core/VillageBootstrap.ts']) {
    const file = path.resolve(__dirname, '../assets/scripts', relative), fileURL = pathToFileURL(file).href;
    const chunk = importMap.imports[fileURL];
    if (!chunk) throw new Error(`Import script in Editor first: ${relative}`);
    const uuid = JSON.parse(fs.readFileSync(file+'.meta','utf8')).uuid.replaceAll('-','');
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'; let id = uuid.slice(0,5);
    for(let i=5;i<uuid.length;i+=3) { const n=parseInt(uuid.slice(i,i+3),16); id+=alphabet[n>>6]+alphabet[n&63]; }
    let source = fs.readFileSync(file,'utf8').replace(/from\s+(['"])(\.\.?\/[^'"]+)\1/g, (_,q,spec) => `from ${q}${pathToFileURL(path.resolve(path.dirname(file),spec+'.ts')).href}${q}`);
    source = `import { cclegacy as __qaCCLegacy } from 'cc';\n__qaCCLegacy._RF.push({}, ${JSON.stringify(id)}, ${JSON.stringify(path.basename(file,'.ts'))}, undefined);\n${source}\n__qaCCLegacy._RF.pop();`;
    const compiled = ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.System,target:ts.ScriptTarget.ES2015,experimentalDecorators:true}}).outputText;
    overrides.set('/scripting/x/'+chunk.replace(/^\.\//,''),compiled);
}
fs.mkdirSync(output, { recursive: true });
async function routes(page) {
    await page.route('**/scripting/x/chunks/**/*.js', async route => {
        const source=overrides.get(new URL(route.request().url()).pathname);
        if(source) await route.fulfill({status:200,contentType:'application/javascript',body:source}); else await route.continue();
    });
    await page.route('**/settings.js?*', route => route.continue({ url: new URL('/settings.js?scene=c1ee127e-883a-4ebc-8fac-969a61c11dd8', url).href }));
}
(async () => {
    const browser = await chromium.launch({ executablePath: process.argv[3], headless: true, args: ['--enable-webgl', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
    const errors = [];
    try {
        const page = await browser.newPage({ viewport: { width: 1320, height: 820 } });
        // Serve exact current source with SystemJS + Cocos RF registration. The Editor's
        // cached transpiled scripts may lag external file edits; engine and assets remain real.
        await routes(page);
        page.on('pageerror', error => errors.push(String(error)));
        page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
        await page.goto(url);
        await page.waitForFunction(async () => {
            if (!window.System) return false;
            const cc = await System.import('cc');
            return !!cc.director.getScene()?.getChildByName('Canvas');
        }, undefined, { timeout: 60000 });
        await page.waitForTimeout(1500);
        // The open Editor may retain an old scene/import cache. Deserialize the exact saved
        // source through the real engine, validating its script reference and lifecycle.
        await page.evaluate(async raw => {
            const cc = await System.import('cc');
            const asset = cc.deserialize(raw);
            if (!(asset instanceof cc.SceneAsset)) throw new Error('Invalid saved SceneAsset');
            cc.director.runSceneImmediate(asset.scene);
        }, savedScene);
        await page.waitForTimeout(300);
        const initial = await page.evaluate(async () => {
            const cc = await System.import('cc'); window.qaCC = cc;
            const canvas = cc.director.getScene().getChildByName('Canvas');
            const Class = cc.js.getClassByName('VillageBootstrap');
            if (!Class) throw new Error('VillageBootstrap not imported by Cocos');
            const attached = !!canvas.getComponent(Class);
            if (!attached) throw new Error('Saved VillageScene must already contain VillageBootstrap');
            window.qaVillage = canvas.getComponent(Class);
            return { attached, engine: cc.VERSION, classId: cc.js.getClassId(Class), chunks: qaVillage.world.children.filter(n=>n.name.startsWith('Terrain-')).length };
        });
        assert.equal(initial.chunks, 25); console.log('BOOT', JSON.stringify(initial));
        assert.equal(await page.evaluate(()=>!!qaVillage.header),true,'current source loaded');
        await page.waitForTimeout(800);
        await page.screenshot({ path: path.join(output, 'desktop.png') });
        await page.locator('#GameCanvas').focus();
        const before = await page.evaluate(() => ({...qaVillage.player.position}));
        await page.keyboard.down('d'); await page.waitForTimeout(250);
        await page.waitForFunction(()=>Math.abs(qaVillage.player.node.getChildByName('LeftLeg').position.y)>0.2,undefined,{timeout:2000});
        const walkVisual=await page.evaluate(()=>({left:qaVillage.player.node.getChildByName('LeftLeg').position.y,right:qaVillage.player.node.getChildByName('RightLeg').position.y}));
        assert.ok(Math.abs(walkVisual.left+walkVisual.right)<0.001);
        await page.keyboard.up('d');
        const after = await page.evaluate(() => ({...qaVillage.player.position}));
        assert.ok(after.x > before.x + 10, 'real keyboard moves player');
        console.log('PASS real keyboard moves player');
        const screenPoint = async (point, nodeName = 'world', surface = page) => surface.evaluate(({point,nodeName}) => {
            const cc = qaCC, b = qaVillage, node = nodeName === 'farmer' ? b.farmer.node : b[nodeName];
            const world = node.getComponent(cc.UITransform).convertToWorldSpaceAR(new cc.Vec3(point.x,point.y,0));
            const camera = b.node.getComponent(cc.Canvas).cameraComponent;
            const p = camera.worldToScreen(world), canvas = document.getElementById('GameCanvas'), rect = canvas.getBoundingClientRect();
            return { x: rect.left + p.x / canvas.width * rect.width, y: rect.top + (canvas.height - p.y) / canvas.height * rect.height };
        }, {point,nodeName});
        const target = await screenPoint({x:64,y:-672});
        await page.mouse.click(target.x,target.y);
        assert.equal(await page.evaluate(()=>qaVillage.marker.active),true);
        await page.waitForFunction(() => { const p=qaVillage.player.position; return Math.hypot(p.x-64,p.y+672)<2; }, undefined, { timeout: 15000 });
        console.log('PASS real mouse click and A* arrival');
        const npc = await screenPoint({x:0,y:45},'farmer');
        await page.mouse.click(npc.x,npc.y);
        await page.waitForFunction(() => qaVillage.dialog.active, undefined, { timeout: 15000 });
        await page.screenshot({ path: path.join(output, 'dialogue.png') });
        await page.keyboard.press('Escape'); assert.equal(await page.evaluate(()=>qaVillage.dialog.active),false);
        console.log('PASS real NPC approach, dialogue and Escape');
        await page.setViewportSize({width:700,height:600}); await page.waitForTimeout(300);
        await page.screenshot({path:path.join(output,'resized.png')});
        await page.context().close();
        const mobileContext = await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36'});
        const mobile = await mobileContext.newPage(); await routes(mobile);
        mobile.on('pageerror',error=>errors.push(String(error))); mobile.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text());});
        await mobile.goto(url);
        await mobile.waitForFunction(async()=>{const cc=await System.import('cc');return !!cc.director.getScene()?.getChildByName('Canvas') && !!cc.director.root?.batcher2D;},undefined,{timeout:60000});
        await mobile.waitForTimeout(1500);
        await mobile.evaluate(async raw=>{
            window.qaCC=await System.import('cc'); qaCC.director.runSceneImmediate(qaCC.deserialize(raw).scene);
            window.qaVillage=qaCC.director.getScene().getChildByName('Canvas').getComponent('VillageBootstrap');
        },savedScene);
        await mobile.waitForTimeout(800);
        assert.equal(await mobile.evaluate(()=>qaVillage.joystick.active),true);
        const stick = await screenPoint({x:0,y:0},'joystick',mobile), session=await mobileContext.newCDPSession(mobile);
        const mobileBefore=await mobile.evaluate(()=>({...qaVillage.player.position}));
        await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:stick.x,y:stick.y,id:1}]});
        await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:stick.x+30,y:stick.y,id:1}]});
        await mobile.waitForTimeout(300);
        await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
        await mobile.waitForTimeout(100);
        assert.ok((await mobile.evaluate(()=>qaVillage.player.position.x))>mobileBefore.x+5,'real mobile joystick moves');
        assert.equal(await mobile.evaluate(()=>qaVillage.stickId),null);
        const mobileTarget=await screenPoint({x:64,y:-672},'world',mobile); await mobile.touchscreen.tap(mobileTarget.x,mobileTarget.y);
        await mobile.waitForFunction(()=>Math.hypot(qaVillage.player.position.x-64,qaVillage.player.position.y+672)<2,undefined,{timeout:15000});
        await mobile.waitForTimeout(100);assert.equal(await mobile.evaluate(()=>qaVillage.marker.active),false);
        const headerPoint=await screenPoint({x:0,y:0},'header',mobile);await mobile.touchscreen.tap(headerPoint.x,headerPoint.y);
        assert.equal(await mobile.evaluate(()=>qaVillage.player.hasPath),false,'HUD touch does not issue movement');
        const dragTarget=await screenPoint({x:96,y:-688},'world',mobile);
        await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:dragTarget.x,y:dragTarget.y,id:2}]});
        await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:dragTarget.x+50,y:dragTarget.y,id:2}]});
        await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:dragTarget.x,y:dragTarget.y,id:2}]});
        await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
        assert.equal(await mobile.evaluate(()=>qaVillage.player.hasPath),false,'returning drag must not become tap');
        await mobile.screenshot({path:path.join(output,'mobile.png')});
        const mobileNpc=await screenPoint({x:0,y:45},'farmer',mobile); await mobile.touchscreen.tap(mobileNpc.x,mobileNpc.y);
        await mobile.waitForFunction(()=>qaVillage.dialog.active,undefined,{timeout:15000});
        await mobile.screenshot({path:path.join(output,'mobile-dialogue.png')});
        const closePoint=await screenPoint({x:0,y:0},'dialog',mobile); await mobile.touchscreen.tap(closePoint.x,closePoint.y);
        assert.equal(await mobile.evaluate(()=>qaVillage.dialog.active),false);
        await mobile.setViewportSize({width:844,height:390});await mobile.waitForTimeout(500);
        const joystickPixels=await mobile.evaluate(()=>qaVillage.joystick.scale.x*140*qaCC.view.getScaleX()/qaCC.view.getDevicePixelRatio());
        assert.ok(Math.abs(joystickPixels-140)<2,'joystick retains physical size after orientation change');
        await mobile.screenshot({path:path.join(output,'mobile-landscape.png')});
        console.log('PASS mobile joystick, tap pathfinding, NPC dialogue and touch close');
        await mobileContext.close();
        console.log('ERRORS', JSON.stringify(errors)); assert.deepEqual(errors,[]);
        fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({initial,errors,checks:['source-scene-deserialization','keyboard','walk-animation','destination-marker','click-path','npc-dialogue','resize','mobile-joystick','mobile-tap-path','mobile-drag-filter','hud-input-block','mobile-dialogue','mobile-orientation'],renderer:'Chromium SwiftShader (software), not Intel benchmark',source:'Current TS transpiled for QA; Editor cache bypassed'},null,2));
    } finally { if(errors.length) console.error('BROWSER ERRORS',JSON.stringify(errors)); await browser.close(); }
})().catch(error => { console.error(error); process.exitCode=1; });
