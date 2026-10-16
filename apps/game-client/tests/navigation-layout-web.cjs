const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const origin=process.env.GAME_WEB_URL||'http://127.0.0.1:8136',output=path.resolve(__dirname,'../temp/navigation-layout-qa');
fs.mkdirSync(output,{recursive:true});
(async()=>{
 const {spawn}=require('node:child_process'),root=path.resolve(__dirname,'../../..');
 const api=spawn(process.execPath,['--input-type=module','-e',"const {createApi}=await import('./apps/backend/dist/main.js');const {SqliteRepository}=await import('./apps/backend/dist/Store.js');const app=await createApi({store:new SqliteRepository(),roomSecret:'navigation-local-fixture-secret-32-characters',adminPassword:'NavigationLocalAdmin123!',origin:['http://127.0.0.1:8136']});await app.listen({host:'127.0.0.1',port:33006});console.log('READY');"],{cwd:root,windowsHide:true,stdio:['ignore','pipe','pipe']});
 await new Promise((resolve,reject)=>{api.on('error',reject);api.on('exit',code=>reject(Error('Fixture API exited '+code)));api.stdout.on('data',d=>{if(String(d).includes('READY'))resolve();});api.stderr.on('data',d=>process.stderr.write(d));});
 const request=async(route,body,token)=>{const response=await fetch('http://127.0.0.1:33006'+route,{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(body)});assert.ok(response.ok,await response.clone().text());return response.json();};
 await request('/parents',{alias:'navigation_qa',password:'NavigationQaPassword123!'});const session=await request('/sessions',{alias:'navigation_qa',password:'NavigationQaPassword123!'}),profile=await request('/profiles',{label:'Bé kiểm tra',age:'6-8',gender:'male',avatar:0},session.token);
 const browser=await chromium.launch({executablePath:require('../../../tools/browser-path.cjs')(),headless:true,args:['--enable-webgl','--use-angle=d3d11']}),errors=[],report=[];
 try{for(const [width,height] of [[1600,900],[844,390]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:width<1000,isMobile:width<1000});
  await context.addInitScript(({token,id})=>{localStorage.setItem('lang-tri-thuc.student-token.v1',token);localStorage.setItem('lang-tri-thuc.last-student.v1',id);},{token:session.token,id:profile.id});
  await context.route('http://127.0.0.1:33000/**',async route=>{const response=await route.fetch({url:route.request().url().replace(':33000',':33006')});await route.fulfill({response});});
  try{const page=await context.newPage();page.on('pageerror',error=>errors.push(String(error)));
   await page.goto(origin+'/?demo=1');await page.waitForFunction(()=>window.System);
   await page.evaluate(async()=>window.cc=await System.import('cc'));
   await page.waitForFunction(()=>cc.director.getScene()?.getChildByName('Canvas')?.getComponent('VillageBootstrap')?.assetsReady,undefined,{timeout:120000});
   await page.waitForFunction(()=>document.getElementById('app-splash')?.hidden,undefined,{timeout:30000});
   const result=await page.evaluate(()=>{
    window.v=cc.director.getScene().getChildByName('Canvas').getComponent('VillageBootstrap');v.chapter.close();v.hub.close();
    const pose=v.npcPatrol.poses.get('chi-mai'),before={x:pose.x,y:pose.y};
    for(let i=0;i<300;i++)v.npcPatrol.step(.1,[]);
    const stationary=pose.points.length===1&&pose.x===before.x&&pose.y===before.y&&!pose.moving;
    v.player.cancel();v.player.position.x=0;v.player.position.y=-640;
    const accepted=v.hub.approachDetail('hen'),pending=v.hub.pendingDetail;
    for(let i=0;i<3000&&v.player.hasPath;i++)v.player.step(.05);
    const reached=!v.player.hasPath&&Math.hypot(v.player.position.x,v.player.position.y+640)>10;
    return {stationary,accepted,pending,reached,position:{...v.player.position}};
   });
   assert.equal(result.stationary,true);assert.equal(result.accepted,true);assert.equal(result.pending,'hen');assert.equal(result.reached,true);
   await page.screenshot({path:path.join(output,`navigation-${width}.png`)});report.push({width,height,...result});
  }finally{await context.close();}
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({report,errors},null,2));console.log('PASS built Cocos navigation: blocked NPC stationary and fractional hen reachable, desktop/mobile');
 }finally{await browser.close();api.kill();}
})().catch(error=>{console.error(error);process.exitCode=1;});
