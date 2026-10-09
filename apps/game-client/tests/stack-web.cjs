const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const output=path.resolve(__dirname,'../temp/stack-qa');fs.mkdirSync(output,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:require('../../../tools/browser-path.cjs')(),headless:true,args:['--enable-webgl','--enable-gpu','--use-angle=d3d11']});
 const context=await browser.newContext({viewport:{width:1280,height:720}}),page=await context.newPage(),errors=[];let token='',profileId='';
 context.on('page',p=>p.on('pageerror',e=>errors.push(String(e))));page.on('pageerror',e=>errors.push(String(e)));
 page.on('response',async r=>{if(r.url().endsWith('/sessions')&&r.status()===200)token=(await r.json()).token;if(r.url().endsWith('/profiles')&&r.request().method()==='POST'&&r.status()===201)profileId=(await r.json()).id;});
 try{
  await page.goto('http://127.0.0.1:35173/');await page.getByLabel('Bí danh tài khoản').fill('qa-'+Date.now());await page.getByLabel('Mật khẩu',{exact:true}).fill('BrowserTestPassword123!');await page.getByRole('button',{name:'Tạo tài khoản phụ huynh',exact:true}).click();
  await page.getByRole('button',{name:'Thêm hồ sơ',exact:true}).click();await page.getByRole('button',{name:'Cho phép vào phòng riêng',exact:true}).click();
  const popup=context.waitForEvent('page');await page.getByRole('button',{name:'Mở làng cho hồ sơ này',exact:true}).click();const game=await popup;
  await game.waitForFunction(()=>!!window.System);await game.evaluate(async()=>window.cc=await System.import('cc'));await game.waitForFunction(()=>cc.director.getScene()?.getChildByName('Canvas')?.getComponent('VillageBootstrap')?.network.room,undefined,{timeout:90000});
  await game.evaluate(()=>window.village=cc.director.getScene().getChildByName('Canvas').getComponent('VillageBootstrap'));assert.equal(await game.evaluate(()=>village.network.privateMode),true);assert.equal(new URL(game.url()).hash,'');
  const point=await game.evaluate(()=>{const n=village.chapter.node.getChildByName('Continue'),world=n.getComponent(cc.UITransform).convertToWorldSpaceAR(new cc.Vec3()),p=village.node.getComponent(cc.Canvas).cameraComponent.worldToScreen(world),c=cc.game.canvas,r=c.getBoundingClientRect();return {x:r.left+p.x/c.width*r.width,y:r.top+(c.height-p.y)/c.height*r.height};});await game.mouse.click(point.x,point.y);
  await game.waitForFunction(()=>village.chapterSave.progress.stage==='greet');await game.waitForTimeout(400);
  const progress=await (await fetch('http://127.0.0.1:33000/profiles/'+profileId+'/progress',{headers:{Authorization:'Bearer '+token}})).json();assert.equal(progress.trusted.chapterOne.introSeen,true);
  assert.equal(await game.evaluate(id=>localStorage.getItem('lang-tri-thuc.chapter-one.v2.'+id)!==null,profileId),true);assert.equal(await game.evaluate(()=>localStorage.getItem('lang-tri-thuc.chapter-one.v2')),null);
  async function tapGame(id,root=false){const p=await game.evaluate(({id,root})=>{const n=root?village[id]:village.hub.node.getChildByName(id),world=n.getComponent(cc.UITransform).convertToWorldSpaceAR(new cc.Vec3()),s=village.node.getComponent(cc.Canvas).cameraComponent.worldToScreen(world),c=cc.game.canvas,r=c.getBoundingClientRect();return {x:r.left+s.x/c.width*r.width,y:r.top+(c.height-s.y)/c.height*r.height};},{id,root});await game.mouse.click(p.x,p.y);await game.waitForTimeout(100);}
  async function parent(){await tapGame('parentButton',true);await tapGame('ParentAnswer-1');}
  await parent();await tapGame('Avatar');await tapGame('Avatar-2');await tapGame('HubClose');
  await game.waitForFunction(()=>village.network.room.state.players.get(village.network.room.sessionId)?.avatar===2);
  assert.equal(await game.evaluate(()=>village.art.avatarVariants[2].includes(village.childSprite.spriteFrame)),true);
  await parent();await tapGame('WorldMap');await tapGame('Zone-courtyard');await game.waitForFunction(()=>!village.player.hasPath);await game.waitForTimeout(250);
  await parent();await tapGame('WorldMap');await tapGame('PortalMode');await tapGame('Zone-farm');await game.waitForFunction(()=>Math.abs(village.player.position.x-96)<.1&&Math.abs(village.player.position.y+400)<.1);
  await parent();await tapGame('Collection');await tapGame('MyHome');await tapGame('Home-0');await game.screenshot({path:path.join(output,'home.png')});await tapGame('HubClose');
  await parent();await tapGame('OnlineMenu');await tapGame('Emote-hello');await game.waitForFunction(()=>village.network.visibleMessage.includes('Chào bạn'));await tapGame('HubClose');
  const metrics=[];
  for(const quality of ['low','medium','high']){await game.evaluate(q=>village.hub.campaign.data.quality=q,quality);await game.waitForTimeout(250);const sample=await game.evaluate(async()=>{const times=[];let last=performance.now();await new Promise(resolve=>{function frame(now){times.push(now-last);last=now;if(times.length<180)requestAnimationFrame(frame);else resolve();}requestAnimationFrame(frame);});times.shift();times.sort((a,b)=>a-b);const debug=cc.game.canvas.getContext('webgl2')||cc.game.canvas.getContext('webgl'),ext=debug?.getExtension('WEBGL_debug_renderer_info');return {p95FrameMs:times[Math.floor(times.length*.95)],meanFrameMs:times.reduce((a,b)=>a+b)/times.length,shadingScale:cc.director.root.pipeline.shadingScale,renderer:ext?debug.getParameter(ext.UNMASKED_RENDERER_WEBGL):'unavailable',jsHeapBytes:performance.memory?.usedJSHeapSize,assetTransferBytes:performance.getEntriesByType('resource').reduce((s,r)=>s+r.transferSize,0)};});metrics.push({quality,...sample});assert.equal(sample.shadingScale,{low:.75,medium:.9,high:1}[quality]);}
  await game.screenshot({path:path.join(output,'private-village.png')});await page.screenshot({path:path.join(output,'parent-room.png')});
  // Explicit offline choice stops reconnection and retains the scoped local save.
  await parent();await tapGame('OnlineMenu');await tapGame('PlayOffline');assert.equal(await game.evaluate(()=>village.network.room),null);assert.equal(await game.evaluate(()=>village.hub.onGameAction),undefined);
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({parentFlow:true,signedRoom:true,scopedSave:true,serverProgress:true,offlineFallback:true,portal:true,home:true,approvedEmote:true,metrics,errors},null,2));console.log(JSON.stringify({parentFlow:true,signedRoom:true,serverProgress:true,metrics,errors},null,2));
 }finally{if(token)await fetch('http://127.0.0.1:33000/parents/me',{method:'DELETE',headers:{Authorization:'Bearer '+token}});await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
