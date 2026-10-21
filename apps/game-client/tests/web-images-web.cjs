// Verify actual Cocos format negotiation, a throttled mobile boot and warm SW cache.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),{spawn}=require('node:child_process'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'../../..'),build=path.join(root,'apps/game-client/build/web-desktop'),output=path.join(root,'apps/game-client/temp/web-images-qa'),nativeRequests=new Map();fs.mkdirSync(output,{recursive:true});
const gzip=process.env.IMAGE_QA_GZIP==='1',compress=require('node:zlib').gzipSync;
let slowLink=false;const transfers=[],linkBytesPerSecond=1.6*1024*1024/8;
// Throttle at the fixture server so service-worker fetches share the same
// aggregate bandwidth cap; page-only CDP throttling can miss worker traffic.
const linkTimer=setInterval(()=>{let budget=Math.floor(linkBytesPerSecond*.05);for(let i=transfers.length-1;i>=0;i--)if(transfers[i].response.destroyed)transfers.splice(i,1);while(budget>0&&transfers.length){const transfer=transfers.shift();if(Date.now()<transfer.ready){transfers.push(transfer);break;}const length=Math.min(budget,8192,transfer.body.length-transfer.offset);transfer.response.write(transfer.body.subarray(transfer.offset,transfer.offset+length));transfer.offset+=length;budget-=length;if(transfer.offset===transfer.body.length)transfer.response.end();else transfers.push(transfer);}},50);
const flushLink=()=>{slowLink=false;for(const transfer of transfers.splice(0))if(!transfer.response.destroyed)transfer.response.end(transfer.body.subarray(transfer.offset));};
const mime={'.html':'text/html','.js':'application/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.webmanifest':'application/manifest+json','.wasm':'application/wasm'};
const server=http.createServer((request,response)=>{const url=new URL(request.url,'http://localhost'),file=path.resolve(build,'.'+(url.pathname==='/'?'/index.html':url.pathname));if(!file.startsWith(build+path.sep)){response.writeHead(403);response.end();return;}fs.stat(file,(error,stat)=>{if(error||!stat.isFile()){response.writeHead(404);response.end();return;}if(url.pathname.includes('/native/'))nativeRequests.set(url.pathname,(nativeRequests.get(url.pathname)||0)+1);const encoded=gzip&&stat.size>=1024&&/\.(?:html|js|json|css|svg|wasm|webmanifest)$/.test(file)&&/\bgzip\b/.test(request.headers['accept-encoding']||'');const body=encoded?compress(fs.readFileSync(file),{level:5}):fs.readFileSync(file);response.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Content-Length':body.length,'Cache-Control':'no-cache',...(encoded?{'Content-Encoding':'gzip','Vary':'Accept-Encoding'}:{})});if(slowLink)transfers.push({response,body,offset:0,ready:Date.now()+80});else response.end(body);});});
(async()=>{let api,browser;try{
 await new Promise(resolve=>server.listen(8153,'127.0.0.1',resolve));
 api=spawn(process.execPath,['--input-type=module','-e',"const {createApi}=await import('./apps/backend/dist/main.js');const {SqliteRepository}=await import('./apps/backend/dist/Store.js');const app=await createApi({store:new SqliteRepository(),roomSecret:'image-fixture-secret-32-characters',adminPassword:'ImageQaAdmin123!',origin:['http://127.0.0.1:8153']});await app.listen({host:'127.0.0.1',port:33123});console.log('READY');"],{cwd:root,windowsHide:true,stdio:['ignore','pipe','pipe']});
 await new Promise((resolve,reject)=>{api.stdout.on('data',d=>String(d).includes('READY')&&resolve());api.on('error',reject);api.on('exit',code=>reject(Error('API fixture exited '+code)));});
 const post=async(route,body,token)=>{const response=await fetch('http://127.0.0.1:33123'+route,{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(body)});assert.ok(response.ok,await response.clone().text());return response.json();};
 await post('/parents',{alias:'image_qa',password:'ImageQaPassword123!'});const session=await post('/sessions',{alias:'image_qa',password:'ImageQaPassword123!'}),profile=await post('/profiles',{label:'Image QA',age:'6-8',gender:'male',avatar:0},session.token);
 browser=await chromium.launch({executablePath:require('../../../tools/browser-path.cjs')(),headless:true,args:['--enable-webgl','--use-angle=d3d11']});const report=[];
 for(const scenario of ['webp','png-fallback','mobile-4g-cache']){
  const mobile=scenario.startsWith('mobile'),context=await browser.newContext({viewport:mobile?{width:844,height:390}:{width:1600,height:900},isMobile:mobile,hasTouch:mobile,serviceWorkers:mobile?'allow':'block'}),page=await context.newPage(),errors=[];let unlock;const gate=new Promise(resolve=>{unlock=resolve;});
  page.on('pageerror',error=>errors.push(error.message));await page.addInitScript(({token,id})=>{localStorage.setItem('lang-tri-thuc.student-token.v1',token);localStorage.setItem('lang-tri-thuc.last-student.v1',id);},{token:session.token,id:profile.id});
  await page.route('http://127.0.0.1:33000/**',async route=>{await gate;const response=await route.fetch({url:route.request().url().replace(':33000',':33123')});await route.fulfill({response});});
  slowLink=mobile;
  let png=0,webp=0;page.on('response',response=>{const url=response.url();if(url.includes('/assets/resources/native/')){if(url.endsWith('.webp'))webp++;else if(url.endsWith('.png'))png++;}});
  const ready=async()=>{await page.waitForFunction(()=>!!window.System);await page.evaluate(async()=>{window.cc=await System.import('cc');});await page.waitForFunction(()=>cc.director.getScene()?.getChildByName('Canvas')?.getComponent('VillageBootstrap')?.assetsReady,undefined,{timeout:180000});await page.waitForFunction(()=>document.getElementById('app-splash').hidden);};
  const started=Date.now();await page.goto('http://127.0.0.1:8153/',{waitUntil:'domcontentloaded',timeout:180000});await page.waitForFunction(()=>!!window.System);
  await page.evaluate(async disable=>{const cc=window.cc=await System.import('cc');if(disable){const hasFeature=cc.sys.hasFeature.bind(cc.sys);cc.sys.hasFeature=feature=>feature===cc.sys.Feature.WEBP?false:hasFeature(feature);}return cc.sys.hasFeature(cc.sys.Feature.WEBP);},scenario==='png-fallback');unlock();await ready();
  const coldMs=Date.now()-started;if(scenario==='png-fallback'){assert.equal(webp,0);assert.ok(png>0);}else assert.ok(webp>0,'Cocos must request WebP');
  const item={scenario,coldMs,pngRequests:png,webpRequests:webp};
  console.log('Cold ready',item);
  await page.screenshot({path:path.join(output,scenario+'.png')});
  if(mobile){
   await page.waitForFunction(()=>!!navigator.serviceWorker.controller,undefined,{timeout:30000});
   // Measure playable time first, then let deferred ground art fill the cache.
   flushLink();await page.waitForFunction(()=>!!cc.director.getScene().getChildByName('Canvas').getComponent('VillageBootstrap').art.groundTexture,undefined,{timeout:90000});
   // Preload the same three textures into the active worker cache.
   const ids=['reference-props-v1','reference-banyan-v1','grass-meadow-v1'].map(name=>JSON.parse(fs.readFileSync(path.join(root,'apps/game-client/assets/resources/village',name+'.png.meta'),'utf8')).uuid);
   const coreUrls=[...nativeRequests.keys()].filter(url=>ids.some(id=>url.includes(id))&&url.endsWith('.webp'));assert.equal(coreUrls.length,3);
   flushLink();await page.evaluate(async urls=>{await Promise.all(urls.map(async url=>{const response=await fetch(url);await response.arrayBuffer();}));},coreUrls);
   await page.waitForFunction(()=>!!cc.director.getScene().getChildByName('Canvas').getComponent('VillageBootstrap').art.objectFrame('countryside.cat',-1),undefined,{timeout:30000});await page.waitForLoadState('networkidle',{timeout:30000});
   const counts=coreUrls.map(url=>nativeRequests.get(url)),warmStarted=Date.now();slowLink=true;await page.reload({waitUntil:'domcontentloaded',timeout:180000});await ready();
   item.warmMs=Date.now()-warmStarted;assert.deepEqual(coreUrls.map(url=>nativeRequests.get(url)),counts,'Warm core images must not make another server request');item.coreTextureCacheHits=coreUrls.length;item.network={downloadMbps:1.6,latencyMs:80,gzip,scope:'game HTTP, including service-worker fetches; API fixture unthrottled'};
  }
  assert.deepEqual(errors,[]);report.push(item);console.log(item);await context.close();flushLink();
 }
 fs.writeFileSync(path.join(output,gzip?'report-gzip.json':'report.json'),JSON.stringify(report,null,2));
}finally{await browser?.close();api?.kill();clearInterval(linkTimer);server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}})().catch(error=>{console.error(error);process.exitCode=1;});
