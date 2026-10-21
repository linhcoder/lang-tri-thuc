const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'../../..'),output=path.join(root,'apps/game-client/temp/city-qa');fs.mkdirSync(output,{recursive:true});
(async()=>{let browser,api;const server=spawn(process.execPath,['tools/serve-web.cjs'],{cwd:root,env:{...process.env,WEB_PORT:'8168'},windowsHide:true,stdio:['ignore','pipe','pipe']});try{
 await new Promise((resolve,reject)=>{server.stdout.on('data',d=>String(d).includes('Game web:')&&resolve());server.on('error',reject);server.on('exit',()=>reject(Error('Server exited')));});
 api=spawn(process.execPath,['--input-type=module','-e',"const {createApi}=await import('./apps/backend/dist/main.js');const {SqliteRepository}=await import('./apps/backend/dist/Store.js');const app=await createApi({store:new SqliteRepository(),roomSecret:'city-fixture-secret-32-characters',adminPassword:'CityFixture123!',origin:['http://127.0.0.1:8168']});await app.listen({host:'127.0.0.1',port:33128});console.log('READY');"],{cwd:root,windowsHide:true,stdio:['ignore','pipe','pipe']});
 await new Promise((resolve,reject)=>{api.stdout.on('data',d=>String(d).includes('READY')&&resolve());api.on('error',reject);api.on('exit',()=>reject(Error('API exited')));});
 const request=async(route,body,token)=>{const r=await fetch('http://127.0.0.1:33128'+route,{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(body)});assert.ok(r.ok,await r.clone().text());return r.json();};
 await request('/parents',{alias:'city_qa',password:'CityFixture123!'});const session=await request('/sessions',{alias:'city_qa',password:'CityFixture123!'}),profile=await request('/profiles',{label:'City QA',age:'9-11',gender:'male',avatar:0},session.token);
 browser=await chromium.launch({executablePath:require('../../../tools/browser-path.cjs')(),headless:true,args:['--enable-webgl','--use-angle=d3d11']});
 const report=[];
 for(const [width,height] of [[1600,900],[844,390]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:width<1000,hasTouch:width<1000,serviceWorkers:'block'}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await context.addInitScript(({token,id})=>{localStorage.setItem('lang-tri-thuc.student-token.v1',token);localStorage.setItem('lang-tri-thuc.last-student.v1',id);},{token:session.token,id:profile.id});
  await page.route('http://127.0.0.1:33000/**',async route=>{const response=await route.fetch({url:route.request().url().replace(':33000',':33128')});await route.fulfill({response});});
  await page.goto('http://127.0.0.1:8168/');
  await page.waitForFunction(()=>!!window.System);await page.evaluate(async()=>window.cc=await System.import('cc'));
  await page.waitForFunction(()=>cc.director.getScene()?.getChildByName('Canvas')?.getComponent('VillageBootstrap')?.assetsReady,undefined,{timeout:90000});
  await page.evaluate(()=>{window.v=cc.director.getScene().getChildByName('Canvas').getComponent('VillageBootstrap');v.chapter.close();v.guide.dispose();v.guide.update=()=>{};v.cloudBusy=true;v.authElapsed=-1000000;if(v.hub.campaign.data.upgrades)v.hub.campaign.data.upgrades.city={};v.hub.open('map');});
  await page.waitForFunction(()=>document.querySelector('#app-splash')?.hidden);
  const tap=async id=>{const p=await page.evaluate(id=>{const n=v.hub.node.getChildByName(id);if(!n)throw Error('Missing '+id);const w=n.getComponent(cc.UITransform).convertToWorldSpaceAR(new cc.Vec3()),s=v.node.getComponent(cc.Canvas).cameraComponent.worldToScreen(w),c=cc.game.canvas,r=c.getBoundingClientRect();return{x:r.left+s.x/c.width*r.width,y:r.top+(c.height-s.y)/c.height*r.height};},id);await page.mouse.click(p.x,p.y);await page.waitForTimeout(120);};
  const overlaps=()=>page.evaluate(()=>v.hub.buttons.flatMap((a,i,bs)=>bs.slice(i+1).filter(b=>Math.abs(a.node.position.x-b.node.position.x)<(a.width+b.width)/2-2&&Math.abs(a.node.position.y-b.node.position.y)<(a.node.getComponent(cc.UITransform).height+b.node.getComponent(cc.UITransform).height)/2-2).map(b=>a.node.name+'/'+b.node.name)));
  await tap('CityProjects');assert.equal(await page.evaluate(()=>v.hub.mode),'city');assert.deepEqual(await overlaps(),[]);
  await page.screenshot({path:path.join(output,'projects-'+width+'.png')});
  for(const [i,id] of ['city-library','city-station','city-lab','city-park'].entries()){
   await page.evaluate(()=>v.hub.open('city'));await tap('City-'+id);assert.deepEqual(await overlaps(),[]);
   await tap('CityAnswer-'+(((3-i%3)%3+1)%3));assert.equal(await page.evaluate(id=>v.hub.campaign.data.upgrades?.city?.[id]??0,id),0);
   for(let round=0;round<4;round++){if(round===1){await page.screenshot({path:path.join(output,id+'-'+width+'.png')});}await tap('CityAnswer-'+((3-(i+round)%3)%3));}
   assert.equal(await page.evaluate(id=>v.hub.campaign.data.upgrades.city[id],id),4);assert.deepEqual(await overlaps(),[]);
  }
  assert.deepEqual(errors,[]);report.push({width,height,completed:4,errors});await context.close();
 }
 fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2));console.log('PASS city Web: desktop/mobile, map entry, 16 steps, incorrect answers and button layout');
}finally{await browser?.close();server.kill();api?.kill();}})().catch(e=>{console.error(e);process.exitCode=1;});
