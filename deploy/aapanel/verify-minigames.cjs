// Live QA: only disposable accounts, genuine signed tickets and valid campaign events.
// Run after activating the release. No trusted-progress fixtures or database writes.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright'),{Client}=require('@colyseus/sdk'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f);
const world=require('../../apps/game-client/assets/scripts/world/VillageModel.ts');
const {riceQuestions,lessonQuestions}=require('../../apps/game-client/assets/scripts/world/EducationEngine.ts');
const origin=process.env.QA_ORIGIN||'https://ltt.vui-hoc.xyz';
const preview=/^Preview password: (.+)$/m.exec(fs.readFileSync(path.resolve(__dirname,'../../temp/deploy/access.txt'),'utf8'))?.[1];assert.ok(preview);
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn,label){for(let i=0;i<150;i++){if(await fn())return;await wait(100);}throw Error('Timeout: '+label);}
(async()=>{
 const browser=await chromium.launch({executablePath:require('../../tools/browser-path.cjs')(),headless:true,args:['--enable-webgl','--use-angle=d3d11']});
 const context=await browser.newContext({viewport:{width:1280,height:720},httpCredentials:{username:'staging',password:preview,origin}});
 const page=await context.newPage();let token='',profileId='',invitation,peer;const errors=[],peerFeedback=[];
 context.on('page',p=>p.on('pageerror',e=>errors.push(e.message)));page.on('pageerror',e=>errors.push(e.message));
 page.on('response',async r=>{if(r.url().endsWith('/sessions')&&r.status()===200)token=(await r.json()).token;if(r.url().endsWith('/invites')&&r.status()===200)invitation=await r.json();if(r.url().endsWith('/profiles')&&r.request().method()==='POST'&&r.status()===201)profileId=(await r.json()).id;});
 async function api(route,body,method='POST'){const r=await fetch(origin+'/api'+route,{method,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});assert.ok(r.ok,route+' HTTP '+r.status);return r.json();}
 try{
  await page.goto(origin);await page.getByLabel('Bí danh tài khoản').fill('minigame-qa-'+Date.now());await page.getByLabel('Mật khẩu',{exact:true}).fill('LiveMinigameTest123!');await page.getByRole('button',{name:'Tạo tài khoản phụ huynh',exact:true}).click();
  await page.getByRole('button',{name:'Thêm hồ sơ',exact:true}).click();await page.getByRole('button',{name:'Cho phép vào phòng riêng',exact:true}).click();const popup=context.waitForEvent('page');await page.getByRole('button',{name:'Mở làng cho hồ sơ này',exact:true}).click();const game=await popup;
  async function bootstrap(){await game.waitForFunction(()=>!!window.System);await game.evaluate(async()=>window.cc=await System.import('cc'));await game.waitForFunction(()=>{const b=cc.director.getScene()?.getChildByName('Canvas')?.getComponent('VillageBootstrap');return b?.assetsReady&&b.network.canSend;},undefined,{timeout:120000});await game.evaluate(()=>window.village=cc.director.getScene().getChildByName('Canvas').getComponent('VillageBootstrap'));}
  await bootstrap();assert.equal(await game.evaluate(()=>village.network.privateMode),true);
  if(process.env.EXPECTED_CONTENT_VERSION){await game.evaluate(()=>{village.network.room.onMessage('content-version',v=>window.qaVersion=v);village.network.room.send('ready');});await until(()=>game.evaluate(()=>!!window.qaVersion),'content version');assert.equal(await game.evaluate(()=>window.qaVersion),process.env.EXPECTED_CONTENT_VERSION,'Unexpected live content release');}
  const send=(type,data)=>game.evaluate(({type,data})=>village.network.room.send(type,data),{type,data});
  const elderApproach={x:world.elderTile.x+1,y:world.elderTile.y},farmerApproach={x:world.farmerTile.x,y:world.farmerTile.y-1};
  async function move(tile){await game.bringToFront();await game.evaluate(()=>{village.chapter?.close();village.hub?.close();village.dialog.active=false;});const target=world.toWorld(tile);assert.ok(await game.evaluate(tile=>village.player.goTo(tile),tile),'QA route available');try{await until(async()=>{const p=await game.evaluate(()=>{const p=village.network.room.state.players.get(village.network.room.sessionId);return{x:p.x,y:p.y};});return Math.hypot(p.x-target.x,p.y-target.y)<2;},'engine movement to story target');}catch(error){const state=await game.evaluate(()=>({local:village.player.position,route:village.player.hasPath,modal:village.modalActive,online:village.network.canSend,server:{x:village.network.room.state.players.get(village.network.room.sessionId).x,y:village.network.room.state.players.get(village.network.room.sessionId).y}}));throw Error(error.message+' '+JSON.stringify({tile,target,...state}));}}
  async function story(data,predicate){await send('story',data);await until(()=>game.evaluate(predicate),'story '+data.type);}
  console.log('QA: progressing chapter one with valid story events');
  await story({type:'enter'},()=>village.chapterSave.progress.data.introSeen);
  await move(elderApproach);await story({type:'greet'},()=>village.chapterSave.progress.data.greeted);
  await move(farmerApproach);await story({type:'accept'},()=>village.chapterSave.progress.data.accepted);
  for(let index=0;index<5;index++){await move(world.ricePlantingPlots[index]);await send('story',{type:'plant',index});await until(()=>game.evaluate(index=>village.chapterSave.progress.data.planted.includes(index),index),'plant');}
  await move(farmerApproach);for(let round=0;round<3;round++){await send('story',{type:'count',round,value:riceQuestions[round].count});await until(()=>game.evaluate(n=>village.chapterSave.progress.data.countRound===n,round+1),'count');}
  await move(elderApproach);await story({type:'turn-in'},()=>village.chapterSave.progress.stars===1);
  await send('chapter-intro',{index:1});await until(()=>game.evaluate(()=>village.hub.campaign.data.introduced.includes('ch02')),'chapter two');
  const age=await game.evaluate(()=>village.hub.campaign.data.age);for(const [round,q] of lessonQuestions('fair-play',age).entries()){await send('lesson-answer',{questId:'q.ch02.learn-rules',round,index:q.answer});await wait(200);}await until(()=>game.evaluate(()=>village.hub.campaign.data.completed.includes('q.ch02.learn-rules')),'lesson');
  const second=await api('/profiles',{age}),admitted=await api('/invites',{profileId:second.id,invitation:invitation.friendInvitation});peer=await new Client(origin+'/colyseus').joinOrCreate('private-friend',{roomCode:admitted.roomCode,ticket:admitted.ticket});for(const type of ['progress-state','storage-warning','emote','content-version','activities-state'])peer.onMessage(type,()=>{});peer.onMessage('game-feedback',v=>peerFeedback.push(v));
  // The fresh peer observes room state; it has no forged campaign unlock.
  await game.evaluate(()=>{village.network.room.onMessage('game-feedback',v=>(window.qaFeedback??=[]).push(v));village.hub.open('chapter',1);village.hub.startQuest('q.ch02.play-o-an-quan');});
  await until(()=>game.evaluate(()=>JSON.parse(village.network.room.state.gameJson||'{}').id==='mg.star-lantern'),'authoritative game');
  await wait(600);const before=await api('/profiles/'+profileId+'/progress',undefined,'GET');const trace=await game.evaluate(()=>JSON.parse(village.network.room.state.gameJson).actions);const title=await game.evaluate(()=>village.hub.node.getChildByName('GameTitle').getComponent(cc.Label).string);
  await send('game-action',{type:'place',index:0});await until(()=>game.evaluate(()=>window.qaFeedback?.length===1),'rejection feedback');await wait(500);
  assert.equal(await game.evaluate(()=>village.hub.node.getChildByName('GameTitle').getComponent(cc.Label).string),title);assert.ok(await game.evaluate(()=>village.hub.node.getChildByName('GameFeedback').getComponent(cc.Label).string.length>0));assert.deepEqual(peerFeedback,[]);assert.deepEqual(await game.evaluate(()=>JSON.parse(village.network.room.state.gameJson).actions),trace);assert.deepEqual(await api('/profiles/'+profileId+'/progress',undefined,'GET'),before);
  await send('game-action',{type:'part',index:0});await until(()=>game.evaluate(()=>JSON.parse(village.network.room.state.gameJson).actions.some(a=>a.type==='part'&&a.index===0)),'accepted action');await send('pause-game',{paused:true});await until(async()=>{const p=await api('/profiles/'+profileId+'/progress',undefined,'GET');return p.trusted?.campaign?.resume?.['q.ch02.play-o-an-quan']?.data?.actions?.some(a=>a.type==='part'&&a.index===0);},'saved action');
  await game.reload();await bootstrap();assert.ok(await game.evaluate(()=>village.hub.campaign.data.resume['q.ch02.play-o-an-quan'].data.actions.some(a=>a.type==='part'&&a.index===0)));assert.deepEqual(errors,[]);
  const output=path.resolve(__dirname,'../../temp/deploy/qa');fs.mkdirSync(output,{recursive:true});await game.screenshot({path:path.join(output,'minigame-reload.png')});fs.writeFileSync(path.join(output,'minigame-report.json'),JSON.stringify({signedRoom:true,genuineCampaignProgress:true,rejectedActionUnchanged:true,feedbackInitiatorOnly:true,stableTitle:true,acceptedActionSaved:true,reload:true,peerIsObserver:true,errors},null,2));console.log('QA: signed minigame rejection, accepted action and reload passed');
 }finally{try{if(peer)await peer.leave();}finally{try{if(token){const r=await fetch(origin+'/api/parents/me',{method:'DELETE',headers:{Authorization:'Bearer '+token}});assert.ok(r.ok,'Disposable QA account cleanup failed');}}finally{await browser.close();}}}
})().catch(e=>{console.error(e.message);process.exitCode=1;});




