const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'../../..'),live=process.env.CITY_ART_ORIGIN;
const output=path.join(root,live?'temp/deploy/qa/city-art-live':'apps/game-client/temp/city-art-qa');fs.mkdirSync(output,{recursive:true});
const ready=(child,match)=>new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Startup timeout')),20000);child.on('error',reject);child.on('exit',()=>reject(Error('Server exited')));child.stdout.on('data',d=>{if(String(d).includes(match)){clearTimeout(timer);resolve();}});child.stderr.on('data',d=>process.stderr.write(d));});
(async()=>{let web,api,browser,token;const report=[];
const origin=live||'http://127.0.0.1:8172',apiOrigin=live?live.replace(/\/game\/?$/,'')+'/api':'http://127.0.0.1:33129';
const request=async(route,body,method='POST')=>{const r=await fetch(apiOrigin+route,{method,headers:{...(body?{'Content-Type':'application/json'}:{}),...(token?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{})});assert.ok(r.ok,await r.clone().text());return r.status===204?null:r.json();};
try{
 if(!live){
  web=spawn(process.execPath,['tools/serve-web.cjs'],{cwd:root,env:{...process.env,WEB_PORT:'8172'},windowsHide:true,stdio:['ignore','pipe','pipe']});
  api=spawn(process.execPath,['--input-type=module','-e',"const {createApi}=await import('./apps/backend/dist/main.js');const {SqliteRepository}=await import('./apps/backend/dist/Store.js');const app=await createApi({store:new SqliteRepository(),roomSecret:'city-art-fixture-secret-32-characters',origin:['http://127.0.0.1:8172']});await app.listen({host:'127.0.0.1',port:33129});console.log('READY');"],{cwd:root,windowsHide:true,stdio:['ignore','pipe','pipe']});
  await Promise.all([ready(web,'Game web:'),ready(api,'READY')]);
 }
 const alias='city_art_'+Date.now(),password='CityArtFixture123!';await request('/parents',{alias,password});token=(await request('/sessions',{alias,password})).token;
 const profile=await request('/profiles',{label:'City Art QA',age:'9-11',gender:'male',avatar:0});
 let httpCredentials;
 if(live){const raw=/^Preview password: (.+)$/m.exec(fs.readFileSync(path.join(root,'temp/deploy/access.txt'),'utf8'))[1];httpCredentials={username:'staging',password:raw.startsWith('"')?JSON.parse(raw):raw};}
 browser=await chromium.launch({executablePath:require('../../../tools/browser-path.cjs')(),headless:true,args:['--enable-webgl','--use-angle=d3d11']});
 for(const [width,height] of [[1600,900],[844,390]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:width<1000,hasTouch:width<1000,serviceWorkers:'block',...(httpCredentials?{httpCredentials}:{})}),page=await context.newPage(),errors=[],failed=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>{if(!r.url().includes('2567'))failed.push({url:r.url(),error:r.failure()?.errorText});});
  await context.addInitScript(({token,id})=>{localStorage.setItem('lang-tri-thuc.student-token.v1',token);localStorage.setItem('lang-tri-thuc.last-student.v1',id);},{token,id:profile.id});
  if(!live)await page.route('http://127.0.0.1:33000/**',async route=>{const response=await route.fetch({url:route.request().url().replace(':33000',':33129')});await route.fulfill({response});});
  await page.goto(origin);await page.waitForFunction(()=>window.System);await page.evaluate(async()=>window.cc=await System.import('cc'));
  await page.waitForFunction(()=>{window.v=cc.director.getScene()?.getChildByName('Canvas')?.getComponent('VillageBootstrap');return v?.assetsReady;},undefined,{timeout:90000});
  await page.evaluate(()=>{v.chapter.close();v.hub.close();v.guide.dispose();v.guide.update=()=>{};v.player.cancel();});
  await page.waitForFunction(()=>document.querySelector('#app-splash')?.hidden);
  assert.equal(await page.evaluate(()=>v.actors.children.filter(n=>n.name.startsWith('CityLandmark-')&&n.getChildByName('PaintedLandmark')).length),0,'City art is deferred at village spawn');
  const frames=[];
  for(const id of ['city-library','city-station','city-lab','city-park']){
   await page.evaluate(id=>{const n=v.actors.getChildByName('CityLandmark-'+id),p=n.position;v.player.cancel();v.player.position={x:p.x,y:p.y-65};v.freeCameraOffset={x:-p.x,y:-(p.y+65)};},id);
   await page.waitForFunction(id=>v.actors.getChildByName('CityLandmark-'+id)?.getChildByName('PaintedLandmark')?.getComponent(cc.Sprite)?.spriteFrame,id,{timeout:60000});
   await page.waitForTimeout(300);
   const state=await page.evaluate(id=>{const n=v.actors.getChildByName('CityLandmark-'+id),a=n.getChildByName('PaintedLandmark'),frame=a.getComponent(cc.Sprite).spriteFrame,t=a.getComponent(cc.UITransform),p=n.position;return{id,uuid:frame.texture._uuid,pixels:[frame.texture.width,frame.texture.height],size:[t.width,t.height],ratio:frame.rect.width/frame.rect.height,captionY:n.getChildByName('CityCaption').position.y,collision:[v.map.canStand({x:p.x,y:p.y+30}),v.map.canStand({x:p.x-125,y:p.y+30}),v.map.canStand({x:p.x+125,y:p.y+30}),v.map.canStand({x:p.x,y:p.y-65}),v.map.canStand({x:p.x,y:p.y+115})],inScenery:v.sceneryNodes.includes(n),alpha:a.getComponent(cc.Sprite).color.a};},id);
   assert.ok(state.uuid&&state.pixels[0]>500);assert.ok(Math.abs(state.size[0]/state.size[1]-state.ratio)<.001);assert.ok(state.captionY>state.size[1]);assert.deepEqual(state.collision,[false,true,true,true,true]);assert.ok(state.inScenery);assert.equal(state.alpha,255);frames.push(state);
   await page.screenshot({path:path.join(output,id+'-'+width+'.png')});
   const fade=await page.evaluate(async id=>{const n=v.actors.getChildByName('CityLandmark-'+id),p=n.position;v.player.position={x:p.x,y:p.y+85};await new Promise(r=>setTimeout(r,150));return n.getChildByName('PaintedLandmark').getComponent(cc.Sprite).color.a;},id);assert.equal(fade,92,'Roof fades over player');
   await page.evaluate(id=>{const n=v.actors.getChildByName('CityLandmark-'+id);v.player.position={x:n.position.x,y:n.position.y-65};},id);
  }
  assert.equal(new Set(frames.map(f=>f.uuid)).size,4);
  await page.evaluate(()=>{v.hub.campaign.data.quality='low';v.hub.close();});await page.waitForTimeout(200);
  assert.equal(await page.evaluate(()=>v.actors.getChildByName('CityLandmark-city-park').active),true,'City landmark remains visible on Low');
  const performanceSample=await page.evaluate(()=>new Promise(resolve=>{const intervals=[];let previous=performance.now();const tick=now=>{intervals.push(now-previous);previous=now;if(intervals.length<120)return requestAnimationFrame(tick);intervals.shift();intervals.sort((a,b)=>a-b);resolve({samples:intervals.length,medianRafMs:intervals[Math.floor(intervals.length/2)],p95RafMs:intervals[Math.floor(intervals.length*.95)],jsHeapBytes:performance.memory?.usedJSHeapSize??null});};requestAnimationFrame(tick);}));
  await page.reload();await page.waitForFunction(()=>window.System);await page.evaluate(async()=>window.cc=await System.import('cc'));await page.waitForFunction(()=>cc.director.getScene()?.getChildByName('Canvas')?.getComponent('VillageBootstrap')?.assetsReady,undefined,{timeout:90000});
  assert.deepEqual(errors,[]);report.push({width,height,frames,performanceSample,errors,failed});await context.close();
 }
 fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({live:!!live,report},null,2));console.log('PASS city art: four unique textures, lazy loading, proportions, collision, roof fade, Low, reload, desktop/mobile');
}finally{await browser?.close();try{if(token)await request('/parents/me',undefined,'DELETE');}finally{web?.kill();api?.kill();}}})().catch(e=>{console.error(e);process.exitCode=1;});
