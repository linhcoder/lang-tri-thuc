// Live acceptance: isolated QA account; credentials are read only from ignored local file.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const origin='https://ltt.vui-hoc.xyz',access=fs.readFileSync(path.resolve(__dirname,'../../temp/deploy/access.txt'),'utf8');
const preview=/^Preview password: (.+)$/m.exec(access)?.[1];assert.ok(preview);
const output=path.resolve(__dirname,'../../temp/deploy/qa');fs.mkdirSync(output,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:require('../../tools/browser-path.cjs')(),headless:true,args:['--enable-webgl','--use-angle=d3d11']});
 const context=await browser.newContext({viewport:{width:1280,height:720},httpCredentials:{username:'staging',password:preview,origin}}),page=await context.newPage(),errors=[];
 let token='',profileId='',invitation,peer;
 context.on('page',p=>p.on('pageerror',e=>errors.push(String(e))));page.on('pageerror',e=>errors.push(String(e)));
 page.on('response',async r=>{if(r.url().endsWith('/sessions')&&r.status()===200)token=(await r.json()).token;if(r.url().endsWith('/invites')&&r.status()===200)invitation=await r.json();if(r.url().endsWith('/profiles')&&r.request().method()==='POST'&&r.status()===201)profileId=(await r.json()).id;});
 const api=async(route,body,method='POST')=>{const response=await fetch(origin+'/api'+route,{method,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});assert.ok(response.ok,route+' HTTP '+response.status);return response.json();};
 try{
  console.log('QA: opening HTTPS parent UI');await page.goto(origin);await page.getByLabel('Bí danh tài khoản').fill('deploy-qa-'+Date.now());await page.getByLabel('Mật khẩu',{exact:true}).fill('BrowserDeploymentTest123!');await page.getByRole('button',{name:'Tạo tài khoản phụ huynh',exact:true}).click();
  await page.getByRole('button',{name:'Thêm hồ sơ',exact:true}).click();await page.getByRole('button',{name:'Cho phép vào phòng riêng',exact:true}).click();
  const popup=context.waitForEvent('page');await page.getByRole('button',{name:'Mở làng cho hồ sơ này',exact:true}).click();const game=await popup;
  console.log('QA: loading signed game');await game.waitForFunction(()=>!!window.System);await game.evaluate(async()=>window.cc=await System.import('cc'));
  await game.waitForFunction(()=>{const b=cc.director.getScene()?.getChildByName('Canvas')?.getComponent('VillageBootstrap');return b?.assetsReady&&b.network.canSend;},undefined,{timeout:120000});
  await game.evaluate(()=>window.village=cc.director.getScene().getChildByName('Canvas').getComponent('VillageBootstrap'));
  assert.equal(new URL(game.url()).origin,origin);assert.equal(new URL(game.url()).hash,'');assert.equal(await game.evaluate(()=>village.network.privateMode),true);
  async function tap(id,kind='hub'){await game.waitForFunction(({id,kind})=>{const b=village;return kind==='root'?!!b[id]:!!(kind==='chapter'?b.chapter.node:b.hub.node).getChildByName(id);},{id,kind});const point=await game.evaluate(({id,kind})=>{const b=village,n=kind==='root'?b[id]:(kind==='chapter'?b.chapter.node:b.hub.node).getChildByName(id),world=n.getComponent(cc.UITransform).convertToWorldSpaceAR(new cc.Vec3()),p=b.node.getComponent(cc.Canvas).cameraComponent.worldToScreen(world),c=cc.game.canvas,r=c.getBoundingClientRect();return{x:r.left+p.x/c.width*r.width,y:r.top+(c.height-p.y)/c.height*r.height};},{id,kind});await game.mouse.click(point.x,point.y);await game.waitForTimeout(150);}
  async function parent(){await tap('parentButton','root');await tap('ParentAnswer-1');}
  await tap('Continue','chapter');await game.waitForFunction(()=>village.chapterSave.progress.stage==='greet');
  for(let i=0;i<30;i++){const progress=await api('/profiles/'+profileId+'/progress',undefined,'GET');if(progress.trusted?.chapterOne?.introSeen)break;if(i===29)throw Error('Server progress not stored');await game.waitForTimeout(200);}
  await parent();await tap('Avatar');await tap('Avatar-2');await tap('Hair');await tap('Hair-1');await tap('BackToAvatar');await tap('Accessories');await tap('Accessory-3');await tap('HubClose');
  await game.waitForFunction(()=>{const p=village.network.room.state.players.get(village.network.room.sessionId);return p?.avatar===2&&p?.hair===1&&p?.accessory===3;});
  await game.waitForFunction(()=>village.art.hairVariants[2]?.includes(village.childSprite.spriteFrame));
  const second=await api('/profiles',{age:'3-5'}),admitted=await api('/invites',{profileId:second.id,invitation:invitation.friendInvitation});
  peer=await new (require('@colyseus/sdk').Client)(origin+'/colyseus').joinOrCreate('private-friend',{roomCode:admitted.roomCode,ticket:admitted.ticket});
  for(const kind of ['progress-state','storage-warning','emote','content-version'])peer.onMessage(kind,()=>{});
  await game.waitForFunction(id=>village.remoteActors.has(id),peer.sessionId);peer.send('emote',{id:'hello'});await game.waitForFunction(id=>village.remoteActors.get(id)?.gesture.kind==='hello',peer.sessionId);
  await game.screenshot({path:path.join(output,'signed-room.png')});await peer.leave();peer=null;console.log('QA: two clients and saved progress passed; reloading');
  await game.reload();await game.waitForFunction(()=>!!window.System);await game.evaluate(async()=>window.cc=await System.import('cc'));await game.waitForFunction(()=>{const b=cc.director.getScene()?.getChildByName('Canvas')?.getComponent('VillageBootstrap');return b?.assetsReady&&b.network.canSend;},undefined,{timeout:120000});await game.evaluate(()=>window.village=cc.director.getScene().getChildByName('Canvas').getComponent('VillageBootstrap'));assert.equal(await game.evaluate(()=>village.chapterSave.progress.stage),'greet');
  await parent();await tap('OnlineMenu');await tap('PlayOffline');assert.equal(await game.evaluate(()=>village.network.room),null);assert.equal(await game.evaluate(()=>village.hub.onGameAction),undefined);
  console.log('QA: online reload passed; testing offline reload');await game.reload();await game.waitForFunction(()=>!!window.System);await game.evaluate(async()=>window.cc=await System.import('cc'));await game.waitForFunction(()=>cc.director.getScene()?.getChildByName('Canvas')?.getComponent('VillageBootstrap')?.assetsReady,undefined,{timeout:120000});await game.evaluate(()=>window.village=cc.director.getScene().getChildByName('Canvas').getComponent('VillageBootstrap'));assert.equal(await game.evaluate(()=>village.network.canSend),false);assert.equal(await game.evaluate(()=>village.chapterSave.progress.stage),'greet');
  assert.deepEqual(errors,[]);const report={https:true,parentUi:true,signedWebSocket:true,serverProgress:true,hairSync:true,twoClients:true,emote:true,reload:true,offlineFallback:true,errors};fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
 }finally{if(peer)await peer.leave();if(token)await fetch(origin+'/api/parents/me',{method:'DELETE',headers:{Authorization:'Bearer '+token}});await browser.close();}
})().catch(error=>{console.error(error.message);process.exitCode=1;});
