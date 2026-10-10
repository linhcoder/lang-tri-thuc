const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const output=path.resolve(__dirname,'../temp/reference-layout-qa');fs.mkdirSync(output,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:require('../../../tools/browser-path.cjs')(),headless:true,args:['--enable-webgl','--use-angle=d3d11']});
 try{
  const page=await browser.newPage({viewport:{width:1704,height:923}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(process.env.GAME_WEB_URL||'http://127.0.0.1:8081/');await page.waitForFunction(()=>!!window.System);
  await page.evaluate(async()=>{window.cc=await System.import('cc');});
  await page.waitForFunction(()=>cc.director.getScene()?.getChildByName('Canvas')?.getComponent('VillageBootstrap')?.hud?.artReady,undefined,{timeout:120000});
  await page.evaluate(()=>{window.village=cc.director.getScene().getChildByName('Canvas').getComponent('VillageBootstrap');});
  async function tapNode(area,id){const p=await page.evaluate(({area,id})=>{const b=village,n=area==='nameplates'?b.nameplates.node.getChildByName(id):b[area].node.getChildByName(id),w=n.getComponent(cc.UITransform).convertToWorldSpaceAR(new cc.Vec3()),s=b.node.getComponent(cc.Canvas).cameraComponent.worldToScreen(w),c=cc.game.canvas,r=c.getBoundingClientRect();return{x:r.left+s.x/c.width*r.width,y:r.top+(c.height-s.y)/c.height*r.height};},{area,id});await page.mouse.click(p.x,p.y);await page.waitForTimeout(100);}
  await tapNode('chapter','Continue');await page.waitForFunction(()=>!village.modalActive);
  await page.waitForFunction(()=>!!village.actors.getChildByName('house')?.getChildByName('RegionalArt')?.getComponent(cc.Sprite)?.spriteFrame,undefined,{timeout:30000});
  await page.waitForFunction(()=>village.hud.mapFrames.length===6);
  await page.evaluate(()=>{village.hub.campaign.data.quality='high';});await page.waitForTimeout(300);
  await page.screenshot({path:path.join(output,'1704x923-village.png')});
  await tapNode('nameplates','Talk-ti-na');await page.waitForFunction(()=>village.player.hasPath||village.hub.node.active);
  await page.evaluate(()=>{village.resetInput();village.player.cancel();});
  await tapNode('hud','HudGesture-hello');await page.waitForFunction(()=>village.gesture.kind==='hello');
  await page.keyboard.down('d');await page.waitForFunction(()=>village.gesture.kind===null);await page.keyboard.up('d');
  for(const id of ['happy','wave','sit','sad','jump']){await tapNode('hud','HudGesture-'+id);await page.waitForFunction(id=>village.gesture.kind===id&&(id!=='sit'||village.childSprite.node.scale.y===.76),id);await page.keyboard.down('d');await page.waitForFunction(()=>village.gesture.kind===null&&village.childSprite.node.scale.y===1&&village.childSprite.node.angle===0);await page.keyboard.up('d');}
  if(await page.evaluate(()=>village.joystick.active)){await tapNode('hud','HudMove');await page.waitForFunction(()=>!village.joystick.active);}
  await tapNode('hud','HudMove');await page.waitForFunction(()=>village.joystick.active);
  const stick=await page.evaluate(()=>{const b=village,n=b.joystick,w=n.getComponent(cc.UITransform).convertToWorldSpaceAR(new cc.Vec3()),s=b.node.getComponent(cc.Canvas).cameraComponent.worldToScreen(w),c=cc.game.canvas,r=c.getBoundingClientRect();return{x:r.left+s.x/c.width*r.width,y:r.top+(c.height-s.y)/c.height*r.height,player:{...b.player.position}};});
  await page.mouse.move(stick.x,stick.y);await page.mouse.down();await page.mouse.move(stick.x+40,stick.y);await page.waitForFunction(p=>Math.hypot(village.player.position.x-p.x,village.player.position.y-p.y)>3,stick.player);await page.mouse.up();await page.waitForFunction(()=>village.stickId===null&&village.stick.x===0);await tapNode('hud','HudMove');await page.waitForFunction(()=>!village.joystick.active);
  await tapNode('hud','HudMap');await page.waitForFunction(()=>village.hub.node.active);await tapNode('hub','MapPage');await tapNode('hub','Zone-pond');await page.waitForFunction(()=>!village.player.hasPath&&Math.hypot(village.player.position.x+384,village.player.position.y+704)<8,undefined,{timeout:30000});await page.screenshot({path:path.join(output,'1704x923-pond.png')});
  await tapNode('hud','HudMap');await page.waitForFunction(()=>village.hub.node.active);if(!await page.evaluate(()=>!!village.hub.node.getChildByName('Zone-home')))await tapNode('hub','MapPage');await tapNode('hub','Zone-home');await page.waitForFunction(()=>!village.player.hasPath&&Math.hypot(village.player.position.x-448,village.player.position.y+704)<8,undefined,{timeout:60000});await page.screenshot({path:path.join(output,'1704x923-home.png')});
  await tapNode('hud','HudChapter');await page.waitForFunction(()=>village.hub.mode==='journal'&&village.hub.node.active);
  assert.deepEqual(errors,[]);console.log('PASS wide village preview, house art, speech-bubble navigation, six gestures, animation cleanup, joystick movement and chapter journal');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
