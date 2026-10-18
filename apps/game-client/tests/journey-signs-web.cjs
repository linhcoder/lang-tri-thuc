const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'../../..'),children=[],liveOrigin=process.env.JOURNEY_QA_ORIGIN;
async function start(args,ready,env={}){const child=spawn(process.execPath,args,{cwd:root,env:{...process.env,...env},windowsHide:true,stdio:['ignore','pipe','pipe']});children.push(child);await new Promise((resolve,reject)=>{child.stdout.on('data',d=>String(d).includes(ready)&&resolve());child.on('error',reject);child.on('exit',code=>reject(Error('Fixture exited '+code)));child.stderr.on('data',d=>process.stderr.write(d));});}
(async()=>{let browser;try{
 if(!liveOrigin)await start(['tools/serve-web.cjs'],'Game web:',{WEB_PORT:'8153'});
 await start(['--input-type=module','-e',"const {createApi}=await import('./apps/backend/dist/main.js');const {SqliteRepository}=await import('./apps/backend/dist/Store.js');const app=await createApi({store:new SqliteRepository(),roomSecret:'journey-signs-fixture-secret-32-characters',adminPassword:'JourneySignsAdmin123!',origin:['http://127.0.0.1:8153']});await app.listen({host:'127.0.0.1',port:33123});console.log('READY');"],'READY');
 const post=async(route,body,token)=>{const r=await fetch('http://127.0.0.1:33123'+route,{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(body)});assert.ok(r.ok,await r.clone().text());return r.json();};
 await post('/parents',{alias:'signs_qa',password:'JourneySignsQa123!'});const session=await post('/sessions',{alias:'signs_qa',password:'JourneySignsQa123!'}),profile=await post('/profiles',{label:'Signs QA',age:'6-8',gender:'male',avatar:0},session.token);
 const layout=await (await fetch('http://127.0.0.1:33123/content/layout')).json();
 // Fractional CMS moves must carry the signs, even far from the original zone spawns.
 for(const [id,x,y] of [['forest',42.5,1.5],['science',28.75,54.25]]){const p=layout.pack.placements.find(p=>p.id==='journey.'+id);Object.assign(p,{x,y,width:p.width+40});}
 layout.npcs=layout.npcs.map(n=>n.id==='co-tam'?{...n,x:52,y:42}:n);
 browser=await chromium.launch({executablePath:require('../../../tools/browser-path.cjs')(),headless:true,args:['--enable-webgl','--use-angle=d3d11']});
 for(const [width,height] of [[1600,900],[844,390]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:width<1000,isMobile:width<1000,serviceWorkers:'block'}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await context.addInitScript(({token,id})=>{localStorage.setItem('lang-tri-thuc.student-token.v1',token);localStorage.setItem('lang-tri-thuc.last-student.v1',id);},{token:session.token,id:profile.id});
  await page.route(liveOrigin?liveOrigin+'/api/**':'http://127.0.0.1:33000/**',async route=>{const url=new URL(route.request().url()),pathname=url.pathname.replace(/^\/api/,'');if(pathname==='/content/layout')return route.fulfill({json:layout});const response=await route.fetch({url:'http://127.0.0.1:33123'+pathname+url.search});await route.fulfill({response});});
  await page.goto(liveOrigin?liveOrigin+'/game/':'http://127.0.0.1:8153/');await page.waitForFunction(()=>!!window.System);await page.evaluate(async()=>{window.cc=await System.import('cc');});
  await page.waitForFunction(()=>cc.director.getScene()?.getChildByName('Canvas')?.getComponent('VillageBootstrap')?.assetsReady,undefined,{timeout:90000});
  await page.evaluate(()=>{window.v=cc.director.getScene().getChildByName('Canvas').getComponent('VillageBootstrap');v.hub.close();v.chapter.close();v.guide.dispose();v.guide.update=()=>{};});
  for(const id of ['forest','science']){
   const anchored=await page.evaluate(id=>{const landmark=v.actors.getChildByName('JourneyLandmark-'+id),sign=v.world.getChildByName('JourneySign-'+id);v.player.cancel();v.player.position={x:landmark.position.x,y:landmark.position.y-100};v.player.node.setPosition(v.player.position.x,v.player.position.y);v.update(.05);return {dx:sign.position.x-landmark.position.x,dy:sign.position.y-landmark.position.y,hasBackground:!!(sign.getChildByName('WoodFallback')||sign.getChildByName('WoodenSign'))};},id);
   assert.deepEqual(anchored,{dx:0,dy:-44,hasBackground:true});
   await page.waitForFunction(id=>!!v.world.getChildByName('JourneySign-'+id)?.getChildByName('WoodenSign')?.getComponent(cc.Sprite)?.spriteFrame,id,{timeout:30000});
   await page.waitForFunction(id=>!!v.actors.getChildByName('JourneyLandmark-'+id)?.getChildByName('PaintedLandmark')?.getComponent(cc.Sprite)?.spriteFrame,id,{timeout:30000});
   await page.screenshot({path:path.join(root,`apps/game-client/temp/journey-sign-${id}-${width}.png`)});
  }
  const tamDistance=await page.evaluate(()=>{const tam=v.hub.npcNodes.find(n=>n.name==='co-tam'),home=v.actors.getChildByName('house-west');v.player.cancel();v.player.position={x:home.position.x,y:home.position.y-100};v.player.node.setPosition(v.player.position.x,v.player.position.y);v.update(.05);return Math.hypot(tam.position.x-home.position.x,tam.position.y-home.position.y);});assert.ok(tamDistance<180,'Cô Tấm must stand beside her house');
  await page.waitForTimeout(700);await page.screenshot({path:path.join(root,`apps/game-client/temp/journey-tam-${width}.png`)});
  assert.deepEqual(errors,[]);console.log('PASS moved region signs with wooden art:',width,height);await context.close();
 }
}finally{await browser?.close();children.forEach(child=>child.kill());}})().catch(e=>{console.error(e);process.exitCode=1;});
