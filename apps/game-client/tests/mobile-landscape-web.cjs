const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const origin=process.env.GAME_WEB_URL||'http://127.0.0.1:38088/';
(async()=>{const browser=await chromium.launch({executablePath:require('../../../tools/browser-path.cjs')(),headless:true,args:['--enable-webgl','--use-angle=d3d11']});try{
 let credentials;if(origin.startsWith('https://ltt.vui-hoc.xyz/')){const s=fs.readFileSync('temp/deploy/access.txt','utf8'),get=n=>new RegExp('^'+n+': (.+)$','m').exec(s)?.[1];credentials={username:get('Preview user'),password:get('Preview password'),origin:'https://ltt.vui-hoc.xyz'};}
 const out=path.resolve('apps/game-client/temp/mobile-landscape-qa');fs.mkdirSync(out,{recursive:true});
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,httpCredentials:credentials}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin);assert.equal(await page.locator('#rotate-device').isVisible(),true);assert.ok((await page.locator('#rotate-title').textContent()).includes('Xoay ngang'));
 await page.screenshot({path:path.join(out,'portrait.png')});
 await page.waitForFunction(()=>document.getElementById('app-splash').hidden,undefined,{timeout:120000});
 await page.evaluate(async()=>{window.cc=await System.import('cc');window.v=cc.director.getScene().getChildByName('Canvas').getComponent('VillageBootstrap');});
 await page.setViewportSize({width:844,height:390});await page.waitForFunction(()=>document.getElementById('rotate-device').hidden);
 await page.evaluate(()=>{v.chapter.close();v.hub.close();v.player.position={x:352,y:-1184};v.zoom.set(.65);});
 await page.waitForTimeout(400);
 const assets=await page.evaluate(()=>{const flag=v.actors.getChildByName('Schoolyard-VietnamFlag').getComponent('SchoolVietnamFlag'),pitch=v.world.getChildByName('Schoolyard-DirtFootball').getChildByName('PaintedPitch').getComponent(cc.Sprite);return {pitch:[pitch.spriteFrame.texture.width,pitch.spriteFrame.texture.height],flag:[flag.frames[0].texture.width,flag.frames[0].texture.height],frames:flag.frames.length,phase:flag.sprite.spriteFrame.rect.x};});
 assert.deepEqual(assets.pitch,[1536,1024]);assert.deepEqual(assets.flag,[1920,160]);assert.equal(assets.frames,8);
 await page.waitForTimeout(250);assert.notEqual(await page.evaluate(()=>v.actors.getChildByName('Schoolyard-VietnamFlag').getComponent('SchoolVietnamFlag').sprite.spriteFrame.rect.x),assets.phase);
 const bounds=await page.evaluate(()=>{const r=document.getElementById('GameDiv').getBoundingClientRect();return {width:r.width,height:r.height,vw:innerWidth,vh:innerHeight};});assert.equal(bounds.width,bounds.vw);assert.equal(bounds.height,bounds.vh);
 await page.screenshot({path:path.join(out,'landscape.png')});
 assert.equal(await page.locator('#fullscreen-game').isVisible(),true);await page.locator('#fullscreen-game').click();await page.waitForFunction(()=>!!document.fullscreenElement);
 assert.equal(await page.locator('#fullscreen-game').isVisible(),false);await page.evaluate(()=>document.exitFullscreen());
 await page.setViewportSize({width:390,height:844});await page.waitForFunction(()=>!document.getElementById('rotate-device').hidden);
 const position=await page.evaluate(()=>({...v.player.position}));await page.keyboard.down('ArrowRight');await page.waitForTimeout(200);assert.deepEqual(await page.evaluate(()=>({...v.player.position})),position);await page.keyboard.up('ArrowRight');assert.deepEqual(errors,[]);
 console.log(JSON.stringify({assets,bounds,portraitGate:true,landscapeFits:true,fullscreen:true,errors}));await context.close();
 const desktop=await browser.newContext({viewport:{width:390,height:844},httpCredentials:credentials}),tab=await desktop.newPage();await tab.goto(origin);assert.equal(await tab.locator('#rotate-device').isVisible(),false);await desktop.close();
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
