const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const output=path.resolve(__dirname,'../temp/drag-qa');fs.mkdirSync(output,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:require('../../../tools/browser-path.cjs')(),headless:true,args:['--enable-webgl','--use-angle=d3d11']}),errors=[];
 try{for(const mobile of [false,true]){
  const context=await browser.newContext(mobile?{viewport:{width:390,height:844},isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36'}:{viewport:{width:1280,height:720}}),page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));
  await page.goto('http://127.0.0.1:38080/');await page.waitForFunction(()=>!!window.System);await page.evaluate(async()=>window.cc=await System.import('cc'));await page.waitForFunction(()=>cc.director.getScene()?.getChildByName('Canvas')?.getComponent('VillageBootstrap')?.assetsReady,undefined,{timeout:90000});
  // A completed story fixture exposes optional practice; pointer actions exercise real input handlers.
  await page.evaluate(()=>{window.village=cc.director.getScene().getChildByName('Canvas').getComponent('VillageBootstrap');village.chapter.close();village.hub.campaign.data.receipts=Array.from({length:8},(_,i)=>'reward.star.ch'+String(i+1).padStart(2,'0'));village.hub.open('activities');});
  async function point(id){return page.evaluate(id=>{const b=village,n=id==='board'?b.hub.gameBoard.node:b.hub.node.getChildByName(id),w=n.getComponent(cc.UITransform).convertToWorldSpaceAR(new cc.Vec3()),s=b.node.getComponent(cc.Canvas).cameraComponent.worldToScreen(w),c=cc.game.canvas,r=c.getBoundingClientRect();return {x:r.left+s.x/c.width*r.width,y:r.top+(c.height-s.y)/c.height*r.height};},id);}
  async function tap(id){await page.waitForFunction(id=>!!village.hub.node.getChildByName(id),id);const p=await point(id);if(mobile)await page.touchscreen.tap(p.x,p.y);else await page.mouse.click(p.x,p.y);await page.waitForTimeout(100);}
  await tap('FestivalOnly');await tap('Practice-mg.star-lantern');const before=await page.evaluate(()=>JSON.stringify(village.hub.campaign.data));
  const cdp=mobile?await context.newCDPSession(page):null;
  async function drag(index,valid,cancel=false){const from=await point('GameAction-part-'+index),to=valid?await point('board'):{x:from.x+70,y:from.y};
   if(cdp){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...from,id:1}]});await page.waitForFunction(()=>!!village.hub.dragPiece);await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...to,id:1}]});await page.waitForFunction(()=>village.hub.dragPiece?.node.active);await page.waitForTimeout(80);await cdp.send('Input.dispatchTouchEvent',{type:cancel?'touchCancel':'touchEnd',touchPoints:[]});}
   else{await page.mouse.move(from.x,from.y);await page.mouse.down();await page.waitForFunction(()=>!!village.hub.dragPiece);await page.mouse.move(to.x,to.y,{steps:8});await page.waitForFunction(()=>village.hub.dragPiece?.node.active);await page.waitForTimeout(80);if(cancel)await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await page.mouse.up();}
   await page.waitForFunction(()=>!village.hub.dragPiece);
  }
  await drag(0,false);assert.deepEqual(await page.evaluate(()=>village.hub.game.data),{placed:[],selected:-1});await drag(0,true,true);assert.deepEqual(await page.evaluate(()=>village.hub.game.data),{placed:[],selected:-1});
  await drag(0,true);await page.waitForFunction(()=>village.hub.game.data.placed.includes(0));assert.equal(await page.evaluate(()=>JSON.stringify(village.hub.campaign.data)),before);
  await page.screenshot({path:path.join(output,mobile?'drag-mobile.png':'drag-desktop.png')});
  for(let i=1;i<5;i++){await tap('GameAction-part-'+i);await tap('GameAction-place-'+i);}
  assert.equal(await page.evaluate(()=>village.hub.game.ended),true);await tap('GameFinish');assert.equal(await page.evaluate(()=>village.hub.campaign.stars),8);assert.equal(await page.evaluate(()=>village.hub.campaign.data.practice.length),1);await context.close();
 }assert.deepEqual(errors,[]);const report={mouse:true,touch:true,invalidDrop:true,cancel:true,clickAlternative:true,noStoryReward:true,errors};fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
