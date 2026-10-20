// Actual Cocos build: review, milestone decor, reports, cloud retry and conflict backups.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'../../..'),children=[];
async function start(args,ready,env={}){const child=spawn(process.execPath,args,{cwd:root,env:{...process.env,...env},windowsHide:true,stdio:['ignore','pipe','pipe']});children.push(child);await new Promise((resolve,reject)=>{child.stdout.on('data',d=>String(d).includes(ready)&&resolve());child.on('error',reject);child.on('exit',code=>reject(Error('Fixture exited '+code)));child.stderr.on('data',d=>process.stderr.write(d));});}
(async()=>{let browser;try{
 await start(['tools/serve-web.cjs'],'Game web:',{WEB_PORT:'8157'});
 await start(['--input-type=module','-e',"const {createApi}=await import('./apps/backend/dist/main.js');const {SqliteRepository}=await import('./apps/backend/dist/Store.js');const app=await createApi({store:new SqliteRepository(),roomSecret:'progressive-fixture-secret-32-characters',adminPassword:'ProgressiveAdmin123!',origin:['http://127.0.0.1:8157']});await app.listen({host:'127.0.0.1',port:33127});console.log('READY');"],'READY');
 const request=async(route,body,token)=>{const response=await fetch('http://127.0.0.1:33127'+route,{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(body)});assert.ok(response.ok,await response.clone().text());return response.json();};
 await request('/parents',{alias:'five_upgrades_qa',password:'ProgressiveQa123!'});const session=await request('/sessions',{alias:'five_upgrades_qa',password:'ProgressiveQa123!'}),profile=await request('/profiles',{label:'Loading QA',age:'6-8',gender:'male',avatar:0},session.token);
 browser=await chromium.launch({executablePath:require('../../../tools/browser-path.cjs')(),headless:true,args:['--enable-webgl','--use-angle=d3d11']});
 const reports=[];
 for(const [width,height] of [[1600,900],[844,390]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:width<1000,isMobile:width<1000,serviceWorkers:'block'}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await context.addInitScript(({token,id})=>{localStorage.setItem('lang-tri-thuc.student-token.v1',token);localStorage.setItem('lang-tri-thuc.last-student.v1',id);},{token:session.token,id:profile.id});
  await page.route('http://127.0.0.1:33000/**',async route=>{const response=await route.fetch({url:route.request().url().replace(':33000',':33127')});await route.fulfill({response});});

  if(process.env.FIVE_BASE){const origin=new URL(process.env.FIVE_BASE).origin;await page.route(origin+'/api/**',async route=>{const response=await route.fetch({url:route.request().url().replace(origin+'/api','http://127.0.0.1:33127')});await route.fulfill({response});});}
  const started=Date.now();await page.goto(process.env.FIVE_BASE||'http://127.0.0.1:8157/');await page.waitForFunction(()=>!!window.System);await page.evaluate(async()=>{window.cc=await System.import('cc');});
  const ready=async()=>{await page.waitForFunction(()=>cc.director.getScene()?.getChildByName('Canvas')?.getComponent('VillageBootstrap')?.assetsReady,undefined,{timeout:90000});await page.evaluate(()=>{window.v=cc.director.getScene().getChildByName('Canvas').getComponent('VillageBootstrap');v.hub.close();v.chapter.close();v.guide.dispose();v.guide.update=()=>{};});};await ready();
  const result=await page.evaluate(()=>{
   const hub=v.hub;hub.node.active=true;v.cloudBusy=true;hub.campaign.data.upgrades.events=[];hub.campaign.data.upgrades.history={days:{},months:{}};hub.campaign.data.upgrades.review=[];
   hub.campaign.data.journey={completed:[],rounds:{}};hub.journeyTask='journey.village.1';hub.mode='journey-lesson';hub.render();
   const before=hub.campaign.journey.rounds[hub.journeyTask]??0;
   const snapshot=JSON.stringify(hub.campaign.data);let right=-1;
   for(let i=0;i<3;i++){hub.campaign.restore(snapshot);if(hub.campaign.answerJourney(hub.journeyTask,before,i)){right=i;break;}}
   hub.campaign.restore(snapshot);hub.mode='journey-lesson';hub.render();hub.buttons.find(b=>b.node.name==='JourneyAnswer-'+((right+1)%3)).action();
   const queue=hub.campaign.data.upgrades.review.length;hub.buttons.find(b=>b.node.name==='JourneyAnswer-'+right).action();const retained=hub.campaign.data.upgrades.review.length;
   hub.startPersonal();const entry=hub.personalQuestions[0];if(!entry.target.startsWith('journey.village.1'))throw Error('Exact missed question was not prioritized');hub.buttons.find(b=>b.node.name==='PersonalAnswer-'+entry.question.answer).action();const resolved=hub.campaign.data.upgrades.review.length;
   hub.campaign.data.journey={completed:Array.from({length:10},(_,i)=>'journey.village.'+(i+1)),rounds:{}};hub.campaign.data.upgrades.room.left='level-10';hub.mode='room';hub.render();const collectible=!!hub.node.getChildByName('PrivateRoom')?.getChildByName('LevelReward-left');
   hub.mode='weekly';hub.render();hub.buttons.find(b=>b.node.name==='ReportPeriod').action();const month=hub.reportDays===30;hub.buttons.find(b=>b.node.name==='ReportPeriod').action();const history=hub.reportDays===0;
   hub.persist();v.cloudBusy=false;v.cloudElapsed=4;v.syncStudent(0);
   return {queue,retained,resolved,collectible,month,history};
  });
  async function tap(id){const p=await page.evaluate(id=>{const n=v.hub.node.getChildByName(id),w=n.getComponent(cc.UITransform).convertToWorldSpaceAR(new cc.Vec3()),s=v.node.getComponent(cc.Canvas).cameraComponent.worldToScreen(w),c=cc.game.canvas,r=c.getBoundingClientRect();return {x:r.left+s.x/c.width*r.width,y:r.top+(c.height-s.y)/c.height*r.height};},id);if(width<1000)await page.touchscreen.tap(p.x,p.y);else await page.mouse.click(p.x,p.y);await page.waitForTimeout(150);}
  await tap('ReportPeriod');assert.equal(await page.evaluate(()=>v.hub.reportDays),7);await tap('ReportPeriod');assert.equal(await page.evaluate(()=>v.hub.reportDays),30);await tap('ReportPeriod');assert.equal(await page.evaluate(()=>v.hub.reportDays),0);
  assert.equal(result.queue,1);assert.equal(result.retained,1);assert.equal(result.resolved,0);assert.ok(result.collectible&&result.month&&result.history);
  await page.waitForFunction(()=>document.querySelector('#save-status')?.dataset.state==='saved',{},{timeout:20000});
  await page.screenshot({path:path.join(root,'apps/game-client/temp/five-upgrades-history-'+width+'.png')});
  await page.evaluate(()=>v.hub.open('room'));await page.waitForTimeout(300);await page.screenshot({path:path.join(root,'apps/game-client/temp/five-upgrades-room-'+width+'.png')});
  await page.reload();await page.waitForFunction(()=>!!window.System);await page.evaluate(async()=>{window.cc=await System.import('cc');});await ready();assert.equal(await page.evaluate(()=>v.hub.campaign.data.upgrades.room.left),'level-10');
  await page.route('**/profiles/*/progress',route=>route.request().method()==='PUT'?route.abort():route.fallback());
  await page.evaluate(()=>{v.hub.campaign.data.sound=!v.hub.campaign.data.sound;v.hub.persist();v.cloudElapsed=4;v.syncStudent(0);});
  await page.waitForFunction(()=>document.querySelector('#save-status')?.dataset.state==='local');
  await page.unroute('**/profiles/*/progress');await page.waitForFunction(()=>document.querySelector('#save-status')?.dataset.state==='saved',undefined,{timeout:20000});
  await page.route('**/profiles/*/progress',route=>route.request().method()==='PUT'?route.fulfill({status:409,contentType:'application/json',body:JSON.stringify({message:'Revision conflict'})}):route.fallback());
  await page.evaluate(()=>{v.hub.campaign.data.sound=!v.hub.campaign.data.sound;v.hub.persist();v.cloudElapsed=4;v.syncStudent(0);});await page.waitForFunction(()=>document.querySelector('#save-status')?.dataset.state==='conflict');
  assert.ok(await page.evaluate(()=>Object.keys(localStorage).some(key=>key.endsWith('.before-conflict'))));
  const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Tải bản sao',exact:true}).click();const download=await downloadPromise;assert.equal(download.suggestedFilename(),'lang-tri-thuc-backup.json');
  await page.screenshot({path:path.join(root,'apps/game-client/temp/five-upgrades-conflict-'+width+'.png')});
  assert.deepEqual(errors,[]);reports.push({width,height,...result,persisted:true,offlineRetry:true,conflictBackup:true});console.log(reports.at(-1));await context.close();
 }
 fs.writeFileSync(path.join(root,'apps/game-client/temp/five-upgrades-report.json'),JSON.stringify(reports,null,2));
}finally{await browser?.close();children.forEach(child=>child.kill());}})().catch(error=>{console.error(error);process.exitCode=1;});
