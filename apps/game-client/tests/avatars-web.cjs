// Real Cocos UI/input/rendering and a separate production Colyseus server.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {spawn}=require('node:child_process'),{chromium}=require('playwright'),{Client}=require('@colyseus/sdk');
const output=path.resolve(__dirname,'../temp/avatars-qa');fs.mkdirSync(output,{recursive:true});
const origin=process.env.GAME_WEB_URL||'http://127.0.0.1:8080';
(async()=>{
 const browser=await chromium.launch({executablePath:require('../../../tools/browser-path.cjs')(),headless:true,args:['--enable-webgl','--enable-gpu',...(process.platform==='win32'?['--use-angle=d3d11']:[])]});
 const contexts=[],errors=[];let server,peer;
 async function ready(page){
  await page.waitForFunction(()=>!!window.System);await page.evaluate(async()=>window.cc=await System.import('cc'));
  await page.waitForFunction(()=>cc.director.getScene()?.getChildByName('Canvas')?.getComponent('VillageBootstrap')?.assetsReady,undefined,{timeout:90000});
  await page.evaluate(()=>window.village=cc.director.getScene().getChildByName('Canvas').getComponent('VillageBootstrap'));
 }
 async function boot(mobile=false,query=''){
  const context=await browser.newContext(mobile?{viewport:{width:390,height:844},isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36'}:{viewport:{width:1280,height:720}});contexts.push(context);
  const page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto(origin+query);await ready(page);return page;
 }
 async function tap(page,id,kind='hub',mobile=false){
  const point=await page.evaluate(({id,kind})=>{const b=village,n=kind==='root'?b[id]:b[kind].node.getChildByName(id);const w=n.getComponent(cc.UITransform).convertToWorldSpaceAR(new cc.Vec3()),s=b.node.getComponent(cc.Canvas).cameraComponent.worldToScreen(w),c=cc.game.canvas,r=c.getBoundingClientRect();return {x:r.left+s.x/c.width*r.width,y:r.top+(c.height-s.y)/c.height*r.height};},{id,kind});
  if(mobile)await page.touchscreen.tap(point.x,point.y);else await page.mouse.click(point.x,point.y);
 }
 async function avatarMenu(page,mobile=false){await tap(page,'parentButton','root',mobile);await tap(page,'ParentAnswer-1','hub',mobile);await tap(page,'Avatar','hub',mobile);}
 async function matches(page,id){await page.waitForFunction(id=>{const b=village,frames=b.art.avatarVariants[id]??b.art.child;return b.hub.campaign.data.avatar===id&&frames.includes(b.childSprite.spriteFrame);},id);}
 try{
  const page=await boot();await tap(page,'Continue','chapter');
  assert.deepEqual(await page.evaluate(()=>Object.values(village.art.avatarVariants).map(f=>f.length)),[24,24,24]);
  const directions=[['d'],['d','w'],['w'],['w','a'],['a'],['a','s'],['s'],['s','d']];
  for(let id=0;id<4;id++){
   await avatarMenu(page);
   assert.equal(await page.evaluate(()=>village.hub.node.children.filter(n=>n.name.startsWith('Avatar-')&&n.getChildByName('AvatarPreview')?.getComponent(cc.Sprite)?.spriteFrame).length),4);
   if(id===2)await page.screenshot({path:path.join(output,'avatar-menu.png')});
   await tap(page,'Avatar-'+id);await matches(page,id);await tap(page,'HubClose');
   await page.screenshot({path:path.join(output,'avatar-'+id+'.png')});
   await page.reload();await ready(page);await matches(page,id);
   assert.deepEqual(await page.evaluate(()=>{const c=village.childSprite.color;return [c.r,c.g,c.b];}),[255,255,255]);
   await page.locator('#GameCanvas').focus();
   for(let d=0;d<8;d++){
    for(const key of directions[d])await page.keyboard.down(key);
    await page.waitForFunction(({id,d})=>{const b=village,frames=b.art.avatarVariants[id]??b.art.child,i=frames.indexOf(b.childSprite.spriteFrame);return b.player.moving&&b.player.direction===d&&i>=8&&i%8===d;},{id,d});
    if(d===6)await page.screenshot({path:path.join(output,'walk-'+id+'.png')});
    for(const key of directions[d])await page.keyboard.up(key);
    await page.waitForFunction(()=>!village.player.moving);
   }
  }
  const mobile=await boot(true);await tap(mobile,'Continue','chapter',true);await avatarMenu(mobile,true);
  const height=await mobile.evaluate(()=>{const n=village.hub.node.getChildByName('Avatar-3'),c=cc.game.canvas,r=c.getBoundingClientRect();return n.getComponent(cc.UITransform).height*n.worldScale.y*cc.view.getScaleY()*r.height/c.height;});assert.ok(height>=44);
  await tap(mobile,'Avatar-3','hub',true);await matches(mobile,3);await mobile.screenshot({path:path.join(output,'avatar-mobile.png')});
  await mobile.reload();await ready(mobile);await matches(mobile,3);
  server=spawn(process.execPath,['dist/game-server/src/main.js'],{cwd:path.resolve(__dirname,'../../game-server'),env:{...process.env,PORT:'26573',HOST:'127.0.0.1',ROOM_SECRET:''},windowsHide:true,stdio:['ignore','pipe','pipe']});
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Avatar test server startup timeout')),8000);server.stdout.on('data',data=>{if(String(data).includes(':26573')){clearTimeout(timer);resolve();}});server.once('error',e=>{clearTimeout(timer);reject(e);});server.once('exit',code=>{clearTimeout(timer);reject(Error('Avatar server exited '+code));});});
  const online=await boot(false,'/?demo=1&server=http://127.0.0.1:26573');await online.waitForFunction(()=>!!village.network.room);
  peer=await new Client('http://127.0.0.1:26573').joinOrCreate('village');peer.onMessage('correction',()=>{});
  let seq=0;
  for(let avatar=0;avatar<4;avatar++)for(let direction=0;direction<8;direction++){
   const moving=direction%2===0;peer.send('move',{x:0,y:-640,direction,moving,avatar,seq:seq++});
   await online.waitForFunction(({id,avatar,direction,moving})=>{const b=village,p=b.network.players.get(id),actor=b.remoteActors.get(id),frames=b.art.avatarVariants[avatar]??b.art.child,i=actor?frames.indexOf(actor.sprite.spriteFrame):-1;return p?.avatar===avatar&&p.direction===direction&&i>=0&&i%8===direction&&(moving?i>=8:i<8);},{id:peer.sessionId,avatar,direction,moving},{timeout:10000});
  }
  await online.screenshot({path:path.join(output,'avatar-online.png')});assert.deepEqual(errors,[]);
  const result={avatars:4,framesPerAvatar:24,localDirections:true,reload:true,mobileTouch:true,remoteDirections:true,errors};fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
 }finally{if(peer)await peer.leave();for(const context of contexts)await context.close();await browser.close();server?.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
