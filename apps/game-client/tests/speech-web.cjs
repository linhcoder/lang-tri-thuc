// UI integration uses a deterministic speech adapter; it does not certify audible OS voices.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const output=path.resolve(__dirname,'../temp/speech-qa');fs.mkdirSync(output,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:require('../../../tools/browser-path.cjs')(),headless:true,args:['--enable-webgl','--use-angle=d3d11']});
 const errors=[],contexts=[];
 async function boot(mobile=false){
  const context=await browser.newContext(mobile?{viewport:{width:390,height:844},isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36'}:{viewport:{width:1280,height:720}});contexts.push(context);
  await context.addInitScript(()=>{
   localStorage.setItem('lang-tri-thuc.chapter-one.v2',JSON.stringify({version:2,introSeen:true,greeted:true,accepted:true,planted:[0,1,2,3,4],countRound:3,rewardReceipts:['reward.star.ch01'],replayRound:null,legacyDemoBadge:false}));
   window.speechQA={voices:[{lang:'vi-VN',localService:true}],spoken:[],cancelled:0,current:null};
   Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,value:class {constructor(text){this.text=text;}}});
   Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{getVoices:()=>speechQA.voices,cancel:()=>{speechQA.cancelled++;speechQA.current=null;},speak:u=>{speechQA.spoken.push({text:u.text,lang:u.lang,rate:u.rate});speechQA.current=u;}}});
  });
  const page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));await page.goto(process.env.GAME_WEB_URL||'http://127.0.0.1:38080/');
  await page.waitForFunction(()=>!!window.System);await page.evaluate(async()=>window.cc=await System.import('cc'));
  await page.waitForFunction(()=>cc.director.getScene()?.getChildByName('Canvas')?.getComponent('VillageBootstrap')?.assetsReady,undefined,{timeout:90000});
  await page.evaluate(()=>window.village=cc.director.getScene().getChildByName('Canvas').getComponent('VillageBootstrap'));return page;
 }
 async function tap(page,id,kind='hub',mobile=false){
  const p=await page.evaluate(({id,kind})=>{const b=village,n=kind==='root'?b[id]:b[kind].node.getChildByName(id);if(!n)throw Error('Missing '+id);const w=n.getComponent(cc.UITransform).convertToWorldSpaceAR(new cc.Vec3()),s=b.node.getComponent(cc.Canvas).cameraComponent.worldToScreen(w),c=cc.game.canvas,r=c.getBoundingClientRect();return {x:r.left+s.x/c.width*r.width,y:r.top+(c.height-s.y)/c.height*r.height};},{id,kind});
  if(mobile)await page.touchscreen.tap(p.x,p.y);else await page.mouse.click(p.x,p.y);
 }
 async function enableSound(page,mobile=false){await tap(page,'parentButton','root',mobile);await tap(page,'ParentAnswer-1','hub',mobile);await tap(page,'Sound','hub',mobile);await tap(page,'HubClose','hub',mobile);}
 try{
  const page=await boot();await page.evaluate(()=>village.chapter.open('elder'));await tap(page,'Read','chapter');
  assert.equal(await page.evaluate(()=>speechQA.spoken.length),0);assert.ok(await page.evaluate(()=>village.chapter.feedback.includes('đang tắt')));await tap(page,'Close','chapter');
  await enableSound(page);await page.evaluate(()=>village.chapter.open('elder'));await tap(page,'Read','chapter');
  assert.equal(await page.evaluate(()=>speechQA.spoken.at(-1).lang),'vi-VN');await tap(page,'StopRead','chapter');assert.equal(await page.evaluate(()=>speechQA.current),null);await tap(page,'Close','chapter');
  for(let i=1;i<8;i++){
   // Completed chapter-one fixture and sequential engine completion expose each dialogue.
   await page.evaluate(i=>village.hub.open('chapter',i),i);const before=await page.evaluate(()=>JSON.stringify(village.hub.campaign.data));
   await tap(page,'HubRead');assert.equal(await page.evaluate(()=>village.hub.reader.reading),true);assert.equal(await page.evaluate(()=>JSON.stringify(village.hub.campaign.data)),before);
   const read=await page.evaluate(()=>speechQA.spoken.at(-1));assert.ok(read.text.length>50);assert.equal(read.rate,.85);
   await tap(page,'HubRead');assert.equal(await page.evaluate(()=>speechQA.current),null);
   if(i===1){
    await page.evaluate(()=>speechQA.voices=[]);await tap(page,'HubRead');assert.ok(await page.evaluate(()=>village.hub.readingNotice.string.includes('giọng tiếng Việt')));
    await page.screenshot({path:path.join(output,'no-vietnamese-voice.png')});await page.evaluate(()=>speechQA.voices=[{lang:'vi-VN',localService:true}]);
   }
   await tap(page,'ChapterIntro');
   const quests=await page.evaluate(()=>village.hub.node.children.map(n=>n.name).filter(n=>n.startsWith('q.')));
   if(i===1){
    await tap(page,quests[0]);await tap(page,'HubRead');assert.equal(await page.evaluate(()=>village.hub.reader.reading),true);
    assert.ok(await page.evaluate(()=>speechQA.spoken.at(-1).text.includes('Lựa chọn 3:')));
    await page.screenshot({path:path.join(output,'lesson-reading.png')});await tap(page,'LessonHint');assert.equal(await page.evaluate(()=>speechQA.current),null);
    await tap(page,'HubRead');await page.evaluate(()=>speechQA.current.onerror());assert.equal(await page.evaluate(()=>village.hub.reader.reading),false);assert.ok(await page.evaluate(()=>village.hub.readingNotice.string.includes('Chưa đọc được')));
    await tap(page,'HubClose');await page.evaluate(()=>village.hub.open('chapter',1));
    await page.evaluate(id=>village.hub.campaign.complete(id),quests[0]);await page.evaluate(()=>village.hub.applyServerProgress());await tap(page,quests[1]);await tap(page,'GameHelp');await tap(page,'HubRead');
    assert.equal(await page.evaluate(()=>village.hub.reader.reading),true);await page.screenshot({path:path.join(output,'game-help-reading.png')});await tap(page,'GameResume');assert.equal(await page.evaluate(()=>speechQA.current),null);await tap(page,'HubClose');
   }
   await page.evaluate(({i,quests})=>{for(const id of quests)village.hub.campaign.complete(id);village.hub.campaign.claim(i);village.hub.close();},{i,quests});
  }
  await page.evaluate(()=>village.hub.open('chapter',7));await tap(page,'HubRead');await page.evaluate(()=>window.dispatchEvent(new Event('blur')));assert.equal(await page.evaluate(()=>speechQA.current),null);await tap(page,'HubClose');
  const mobile=await boot(true);await enableSound(mobile,true);await mobile.evaluate(()=>village.hub.open('chapter',1));await tap(mobile,'HubRead','hub',true);assert.equal(await mobile.evaluate(()=>village.hub.reader.reading),true);
  await mobile.screenshot({path:path.join(output,'reading-mobile.png')});await tap(mobile,'HubRead','hub',true);assert.equal(await mobile.evaluate(()=>speechQA.current),null);
  assert.deepEqual(errors,[]);const report={chapters:8,dialogue:true,lesson:true,gameHelp:true,mute:true,voiceRetry:true,asyncError:true,stopAndBlur:true,mobileTouch:true,speechAdapter:'mock; actual audible voice not tested',errors};fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
 }finally{for(const context of contexts)await context.close();await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
