// Inspect generated sprites in the real Cocos renderer and click both NPCs.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const output=path.resolve(__dirname,'../temp/assets-qa');fs.mkdirSync(output,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:require('../../../tools/browser-path.cjs')(),headless:true,args:['--enable-webgl','--enable-gpu',...(process.platform==='win32'?['--use-angle=d3d11']:[])]});
 const errors=[];const context=await browser.newContext({viewport:{width:1280,height:720}}),page=await context.newPage();
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 try{
  await page.goto(process.env.GAME_WEB_URL||'http://127.0.0.1:8080');
  await page.waitForFunction(()=>!!window.System);await page.evaluate(async()=>window.cc=await System.import('cc'));
  await page.waitForFunction(()=>cc.director.getScene()?.getChildByName('Canvas')?.getComponent('VillageBootstrap')?.assetsReady,undefined,{timeout:90000});
  await page.evaluate(()=>window.village=cc.director.getScene().getChildByName('Canvas').getComponent('VillageBootstrap'));
  // Camera positions are set for visual inspection; clicks still use browser input.
  async function inspect(name,tile){
   await page.evaluate(({x,y})=>{const b=village;b.chapter.close();b.hub.node.active=false;b.resetInput();b.player.position={x:(x-y)*32,y:-(x+y)*16};},tile);
   await page.waitForTimeout(350);await page.screenshot({path:path.join(output,name+'.png')});
  }
  async function clickNpc(name,offsetX=0){
   const point=await page.evaluate(({name,offsetX})=>{const b=village,n=name==='elder'?b.chapter.elder:b.hub.npcNodes.find(n=>n.name===(name==='tam'?'co-tam':name));const p=n.getComponent(cc.UITransform).convertToWorldSpaceAR(new cc.Vec3(offsetX,60,0)),s=b.node.getComponent(cc.Canvas).cameraComponent.worldToScreen(p),c=cc.game.canvas,r=c.getBoundingClientRect();return {x:r.left+s.x/c.width*r.width,y:r.top+(c.height-s.y)/c.height*r.height};},{name,offsetX});
   await page.mouse.click(point.x,point.y);
   await page.waitForFunction(name=>name==='elder'?village.chapter.node.active:village.hub.node.active,name,{timeout:10000});
  }
  const sprites=await page.evaluate(()=>({elder:!!village.chapter.elder.getChildByName('ElderSprite')?.getComponent(cc.Sprite)?.spriteFrame,tam:!!village.hub.npcNodes.find(n=>n.name==='co-tam')?.getChildByName('CoTamSprite')?.getComponent(cc.Sprite)?.spriteFrame,lotus:village.actors.children.filter(n=>n.name.startsWith('PondLotus-')&&n.getComponent(cc.Sprite)?.spriteFrame).length}));
  assert.deepEqual(sprites,{elder:true,tam:true,lotus:3});
  assert.equal(await page.evaluate(()=>village.hub.npcNodes.filter(n=>n.children.some(c=>c.getComponent(cc.Sprite)?.spriteFrame)).length),6);
  await inspect('elder',{x:11,y:21});await clickNpc('elder');
  await inspect('co-tam',{x:11,y:8});await clickNpc('tam');
  await inspect('pond',{x:24,y:12});
  await inspect('teacher',{x:6,y:23});await clickNpc('co-giao-lan');
  await inspect('potter',{x:6,y:28});await clickNpc('nghe-nhan-gom');
  await inspect('friends',{x:20,y:24});await clickNpc('ti-na',-45);
  await inspect('market',{x:29,y:23});await clickNpc('ba-ban-hang');
  await inspect('festival',{x:32,y:28});await clickNpc('chi-hang-cuoi',45);
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({sprites,npcClicks:true,errors},null,2));console.log(JSON.stringify({sprites,npcClicks:true,errors},null,2));
 }finally{await context.close();await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
