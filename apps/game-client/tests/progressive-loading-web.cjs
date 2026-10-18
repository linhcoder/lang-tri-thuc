// Actual Cocos build: optional downloads must never hold gameplay hostage.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'../../..'),children=[];
async function start(args,ready,env={}){const child=spawn(process.execPath,args,{cwd:root,env:{...process.env,...env},windowsHide:true,stdio:['ignore','pipe','pipe']});children.push(child);await new Promise((resolve,reject)=>{child.stdout.on('data',d=>String(d).includes(ready)&&resolve());child.on('error',reject);child.on('exit',code=>reject(Error('Fixture exited '+code)));child.stderr.on('data',d=>process.stderr.write(d));});}
const uuid=name=>JSON.parse(fs.readFileSync(path.join(root,'apps/game-client/assets/resources/village',name+'.png.meta'),'utf8').replace(/^\uFEFF/,'')).uuid;
(async()=>{let browser,releaseMotion;try{
 await start(['tools/serve-web.cjs'],'Game web:',{WEB_PORT:'8151'});
 await start(['--input-type=module','-e',"const {createApi}=await import('./apps/backend/dist/main.js');const {SqliteRepository}=await import('./apps/backend/dist/Store.js');const app=await createApi({store:new SqliteRepository(),roomSecret:'progressive-fixture-secret-32-characters',adminPassword:'ProgressiveAdmin123!',origin:['http://127.0.0.1:8151']});await app.listen({host:'127.0.0.1',port:33121});console.log('READY');"],'READY');
 const request=async(route,body,token)=>{const response=await fetch('http://127.0.0.1:33121'+route,{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(body)});assert.ok(response.ok,await response.clone().text());return response.json();};
 await request('/parents',{alias:'progressive_qa',password:'ProgressiveQa123!'});const session=await request('/sessions',{alias:'progressive_qa',password:'ProgressiveQa123!'}),profile=await request('/profiles',{label:'Loading QA',age:'6-8',gender:'male',avatar:0},session.token);
 browser=await chromium.launch({executablePath:require('../../../tools/browser-path.cjs')(),headless:true,args:['--enable-webgl','--use-angle=d3d11']});
 const reports=[];
 for(const [width,height] of [[1600,900],[844,390]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:width<1000,isMobile:width<1000,serviceWorkers:'block'}),page=await context.newPage(),errors=[];let bytes=0,requests=0,interiorRequests=0,held=0;
  page.on('pageerror',e=>errors.push(e.message));page.on('response',response=>{requests++;bytes+=Number(response.headers()['content-length']||0);});
  await context.addInitScript(({token,id})=>{localStorage.setItem('lang-tri-thuc.student-token.v1',token);localStorage.setItem('lang-tri-thuc.last-student.v1',id);},{token:session.token,id:profile.id});
  await page.route('http://127.0.0.1:33000/**',async route=>{const response=await route.fetch({url:route.request().url().replace(':33000',':33121')});await route.fulfill({response});});
  const motionIds=['npc-directions-v1','npc-walk-step-v1','npc-poses-v1'].map(uuid),interiorId=uuid('interior-furniture-v1'),gate=new Promise(resolve=>{releaseMotion=resolve;});
  await page.route('**/assets/resources/native/**',async route=>{const url=route.request().url();if(url.includes(interiorId))interiorRequests++;if(motionIds.some(id=>url.includes(id))){held++;await gate;}await route.continue();});
  const started=Date.now();await page.goto('http://127.0.0.1:8151/');await page.waitForFunction(()=>!!window.System);await page.evaluate(async()=>{window.cc=await System.import('cc');});
  await page.waitForFunction(()=>cc.director.getScene()?.getChildByName('Canvas')?.getComponent('VillageBootstrap')?.assetsReady,undefined,{timeout:90000});
  const report={width,height,readyMs:Date.now()-started,requests,bytes};assert.equal(interiorRequests,0,'Interior atlas must wait for entering a house');
  await page.evaluate(()=>{window.v=cc.director.getScene().getChildByName('Canvas').getComponent('VillageBootstrap');v.hub.close();v.chapter.close();});
  await page.bringToFront();const motionDeadline=Date.now()+15000;while(!held&&Date.now()<motionDeadline)await page.waitForTimeout(100);assert.ok(held>0,'Background motion requests should be held');
  const movement=await page.evaluate(()=>{const start={...v.player.position};v.keys.add(cc.KeyCode.ARROW_RIGHT);for(let i=0;i<8;i++)v.update(.05);v.keys.clear();return Math.hypot(v.player.position.x-start.x,v.player.position.y-start.y);});assert.ok(movement>0,'Player must move while NPC motion art is stalled');
  assert.equal(await page.evaluate(()=>!!v.art.objectFrame('journey.island',-1)),false,'Far island should not download during startup');
  await page.evaluate(()=>v.interior.open());await page.waitForFunction(()=>{const n=v.interior.board.getChildByName('HomeObject-desk');return !!n?.getChildByName('PaintedFurniture')?.getComponent(cc.Sprite)?.spriteFrame;},undefined,{timeout:30000});assert.ok(interiorRequests>0);
  await page.screenshot({path:path.join(root,'apps/game-client/temp/progressive-loading-'+width+'.png')});await page.evaluate(()=>v.interior.close());
  releaseMotion();await page.waitForFunction(()=>v.art.npcDirections.length>0,undefined,{timeout:30000});
  await page.evaluate(()=>{const island=v.actors.getChildByName('JourneyLandmark-island');v.player.cancel();v.player.position={x:island.position.x,y:island.position.y-80};v.player.node.setPosition(v.player.position.x,v.player.position.y);v.update(.05);});
  try{await page.waitForFunction(()=>!!v.art.objectFrame('journey.island',-1),undefined,{timeout:30000});}catch(error){console.error(await page.evaluate(()=>({player:v.player.position,world:v.world.position,scale:v.worldScale,island:v.actors.getChildByName('JourneyLandmark-island').position,loaded:[...v.journeyDecorated],modal:v.modalActive})));throw error;}
  assert.deepEqual(errors,[]);reports.push({...report,stalledMotionPlayable:true,interiorOnDemand:true,islandOnApproach:true});console.log(reports.at(-1));await context.close();
 }
 fs.writeFileSync(path.join(root,'apps/game-client/temp/progressive-loading-report.json'),JSON.stringify(reports,null,2));
}finally{releaseMotion?.();await browser?.close();children.forEach(child=>child.kill());}})().catch(error=>{console.error(error);process.exitCode=1;});
