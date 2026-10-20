// Actual Cocos build: review, milestone decor, reports, cloud retry and conflict backups.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'../../..'),children=[];
async function start(args,ready,env={}){const child=spawn(process.execPath,args,{cwd:root,env:{...process.env,...env},windowsHide:true,stdio:['ignore','pipe','pipe']});children.push(child);await new Promise((resolve,reject)=>{child.stdout.on('data',d=>String(d).includes(ready)&&resolve());child.on('error',reject);child.on('exit',code=>reject(Error('Fixture exited '+code)));child.stderr.on('data',d=>process.stderr.write(d));});}
(async()=>{let browser;try{
 await start(['tools/serve-web.cjs'],'Game web:',{WEB_PORT:'8157'});
 await start(['--input-type=module','-e',"const {createApi}=await import('./apps/backend/dist/main.js');const {SqliteRepository}=await import('./apps/backend/dist/Store.js');const app=await createApi({store:new SqliteRepository(),roomSecret:'progressive-fixture-secret-32-characters',adminPassword:'ProgressiveAdmin123!',origin:['http://127.0.0.1:8157']});await app.listen({host:'127.0.0.1',port:33127});console.log('READY');"],'READY');
 const request=async(route,body,token)=>{const response=await fetch('http://127.0.0.1:33127'+route,{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(body)});assert.ok(response.ok,await response.clone().text());return response.json();};
 await request('/parents',{alias:'six_upgrades_qa',password:'ProgressiveQa123!'});const session=await request('/sessions',{alias:'six_upgrades_qa',password:'ProgressiveQa123!'}),profile=await request('/profiles',{label:'Loading QA',age:'6-8',gender:'male',avatar:0},session.token);
 browser=await chromium.launch({executablePath:require('../../../tools/browser-path.cjs')(),headless:true,args:['--enable-webgl','--use-angle=d3d11']});
 const reports=[];
 let httpCredentials;
 if(process.env.SIX_BASE){const access=fs.readFileSync(path.join(root,'temp/deploy/access.txt'),'utf8'),value=/^Preview password: (.+)$/m.exec(access)?.[1];assert.ok(value);httpCredentials={username:'staging',password:value.startsWith('"')?JSON.parse(value):value};}
 for(const [width,height] of [[1600,900],[844,390]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:width<1000,isMobile:width<1000,serviceWorkers:'block',...(httpCredentials?{httpCredentials}:{})}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await context.addInitScript(({token,id})=>{localStorage.setItem('lang-tri-thuc.student-token.v1',token);localStorage.setItem('lang-tri-thuc.last-student.v1',id);},{token:session.token,id:profile.id});
  await page.route('http://127.0.0.1:33000/**',async route=>{const response=await route.fetch({url:route.request().url().replace(':33000',':33127')});await route.fulfill({response});});

  if(process.env.SIX_BASE){const origin=new URL(process.env.SIX_BASE).origin;await page.route(origin+'/api/**',async route=>{const response=await route.fetch({url:route.request().url().replace(origin+'/api','http://127.0.0.1:33127')});await route.fulfill({response});});}
  const started=Date.now();await page.goto(process.env.SIX_BASE||'http://127.0.0.1:8157/');await page.waitForFunction(()=>!!window.System);await page.evaluate(async()=>{window.cc=await System.import('cc');});
  const ready=async()=>{await page.waitForFunction(()=>cc.director.getScene()?.getChildByName('Canvas')?.getComponent('VillageBootstrap')?.assetsReady,undefined,{timeout:90000});await page.evaluate(()=>{window.v=cc.director.getScene().getChildByName('Canvas').getComponent('VillageBootstrap');v.hub.close();v.chapter.close();v.guide.dispose();v.guide.update=()=>{};});await page.waitForFunction(()=>document.querySelector('#app-splash')?.hidden);};await ready();

  // Freeze fixture cloud writes while exercising all three age branches on one page.
  await page.evaluate(()=>{v.cloudBusy=true;v.authElapsed=-1000000;});
  async function tap(id){const p=await page.evaluate(id=>{const n=v.hub.node.getChildByName(id);if(!n)throw Error('Missing '+id);const w=n.getComponent(cc.UITransform).convertToWorldSpaceAR(new cc.Vec3()),s=v.node.getComponent(cc.Canvas).cameraComponent.worldToScreen(w),c=cc.game.canvas,r=c.getBoundingClientRect();return {x:r.left+s.x/c.width*r.width,y:r.top+(c.height-s.y)/c.height*r.height};},id);if(width<1000)await page.touchscreen.tap(p.x,p.y);else await page.mouse.click(p.x,p.y);await page.waitForTimeout(90);}
  const overlaps=()=>page.evaluate(()=>{const bs=v.hub.buttons;return bs.flatMap((a,i)=>bs.slice(i+1).filter(b=>Math.abs(a.node.position.x-b.node.position.x)<(a.width+b.width)/2-2&&Math.abs(a.node.position.y-b.node.position.y)<(a.node.getComponent(cc.UITransform).height+b.node.getComponent(cc.UITransform).height)/2-2).map(b=>a.node.name+' / '+b.node.name));});
  for(const mode of ['menu','settings','quest-help','journey']){await page.evaluate(mode=>v.hub.open(mode),mode);assert.deepEqual(await overlaps(),[],mode+' buttons overlap');}
  await tap('JourneyPlay');assert.equal(await page.evaluate(()=>v.hub.mode),'regional');
  for(let i=0;i<3;i++)await tap('RegionalAction-'+i);assert.equal(await page.evaluate(()=>v.hub.regional.done),true);
  const regional=[];
  for(const age of ['3-5','6-8','9-11']){
   await page.evaluate(age=>{v.student.profile.age=age;v.hub.campaign.data.age=age;const regions=['village','school','farm','market','craft','forest','river','science','culture','island'];v.hub.campaign.data.journey={completed:regions.flatMap(r=>Array.from({length:10},(_,i)=>'journey.'+r+'.'+(i+1))),rounds:{}};},age);
   for(const [name,index] of [['farm',2],['market',3],['forest',5]]){
    await page.evaluate(index=>{v.hub.journeyRegion=index;v.hub.open('journey');},index);await tap('JourneyPlay');assert.deepEqual(await overlaps(),[]);
    const before=await page.evaluate(()=>v.hub.campaign.stars);
    for(let stage=0;stage<3;stage++){
     if(name==='farm'){await tap('RegionalAction-'+((stage+1)%3));assert.equal(await page.evaluate(()=>v.hub.regional.stage),stage);await tap('RegionalAction-'+stage);}
     else if(name==='market'){await tap('RegionalAction-2');assert.equal(await page.evaluate(()=>v.hub.regional.stage),stage);const target=await page.evaluate(()=>v.hub.regional.target+v.hub.regional.stage);for(let i=0;i<target;i++)await tap('RegionalAction-0');await tap('RegionalAction-2');}
     else{const path=await page.evaluate(()=>v.hub.regional.path);await tap('RegionalAction-'+((path[0]+1)%3));assert.equal(await page.evaluate(()=>v.hub.regional.memory.length),0);for(const i of path)await tap('RegionalAction-'+i);}
    }
    assert.equal(await page.evaluate(()=>v.hub.regional.done),true);assert.equal(await page.evaluate(()=>v.hub.campaign.stars),before);regional.push({age,name});
    if(age==='6-8'){await page.screenshot({path:path.join(root,'apps/game-client/temp/six-'+name+'-'+width+'.png')});}
   }
  }
  await page.evaluate(()=>{v.student.profile.age='3-5';v.hub.campaign.data.age='3-5';v.hub.campaign.data.sound=true;v.hub.campaign.data.journey={completed:[],rounds:{}};v.hub.campaign.data.upgrades.autoRead=true;v.hub.autoReadKey='';window.spoken=[];v.hub.reader.provider=()=>({voices:()=>[{lang:'vi-VN',localService:true}],speak:(text,voice,done)=>{spoken.push(text);done();},cancel:()=>{}});v.hub.openJourneyRegion('village');});await tap('Journey-journey.village.1');
  assert.ok(await page.evaluate(()=>spoken.length)>0,'automatic reading');assert.deepEqual(await overlaps(),[]);const round=await page.evaluate(()=>v.hub.campaign.journey.rounds['journey.village.1']??0);await tap('ReadChoice');assert.equal(await page.evaluate(()=>v.hub.campaign.journey.rounds['journey.village.1']??0),round);assert.match(await page.evaluate(()=>spoken.at(-1)),/Lựa chọn 1:/);
  await page.evaluate(()=>v.hub.open('settings'));await tap('AutoRead');assert.equal(await page.evaluate(()=>v.hub.campaign.data.upgrades.autoRead),false);
  await page.evaluate(()=>{v.hub.campaign.data.journey={completed:Array.from({length:10},(_,i)=>'journey.village.'+(i+1)),rounds:{}};v.hub.campaign.data.upgrades.room={left:'level-10',right:'plant'};v.hub.open('room');});
  const points=await page.evaluate(()=>{const n=v.hub.node;return [-137,137].map(x=>{const w=n.getComponent(cc.UITransform).convertToWorldSpaceAR(new cc.Vec3(x,65)),s=v.node.getComponent(cc.Canvas).cameraComponent.worldToScreen(w),r=cc.game.canvas.getBoundingClientRect(),c=cc.game.canvas;return{x:r.left+s.x/c.width*r.width,y:r.top+(c.height-s.y)/c.height*r.height};});});
  if(width<1000){const cdp=await context.newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[points[0]]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[points[1]]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}else{await page.mouse.move(points[0].x,points[0].y);await page.mouse.down();await page.mouse.move(points[1].x,points[1].y,{steps:10});await page.mouse.up();}
  await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>v.hub.campaign.data.upgrades.room.right),'level-10');
  await tap('RoomSlot-left');assert.equal(await page.evaluate(()=>v.hub.mode),'decor-catalog');assert.deepEqual(await overlaps(),[]);await tap('DecorNext');await page.screenshot({path:path.join(root,'apps/game-client/temp/six-catalog-'+width+'.png')});await tap('DecorBack');
  await page.evaluate(()=>{v.student.profile.age='6-8';v.hub.campaign.data.age='6-8';delete v.hub.campaign.data.upgrades.regional.village;v.hub.journeyRegion=0;v.hub.open('journey');});await tap('JourneyPlay');await tap('RegionalAction-0');assert.equal(await page.evaluate(()=>v.hub.regional.stage),1);
  await page.evaluate(()=>{v.cloudBusy=false;v.hub.persist();v.cloudElapsed=4;v.syncStudent(0);});await page.waitForFunction(()=>document.querySelector('#save-status')?.dataset.state==='saved',undefined,{timeout:20000});
  await page.reload();await page.waitForFunction(()=>!!window.System);await page.evaluate(async()=>window.cc=await System.import('cc'));await ready();assert.equal(await page.evaluate(()=>v.hub.campaign.data.upgrades.room.right),'level-10');assert.equal(await page.evaluate(()=>v.hub.campaign.data.upgrades.autoRead),false);
  await page.evaluate(()=>{v.hub.journeyRegion=0;v.hub.open('journey');});await tap('JourneyPlay');assert.equal(await page.evaluate(()=>v.hub.regional.stage),1,'regional checkpoint survives cloud reload');
  await page.waitForTimeout(4000);assert.ok(await page.evaluate(()=>v.terrainChunks.every(c=>c.node.isValid)));assert.deepEqual(errors,[]);
  reports.push({width,height,regional,choiceReadNoAnswer:true,dragDecor:true,cloudReload:true,errors});console.log('SIX_UPGRADES_PASS',width,height);await context.close();
 }
 fs.writeFileSync(path.join(root,'apps/game-client/temp/six-upgrades-report.json'),JSON.stringify(reports,null,2));
}finally{await browser?.close();children.forEach(child=>child.kill());}})().catch(error=>{console.error(error);process.exitCode=1;});
