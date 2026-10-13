const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const origin=process.env.GAME_WEB_URL||'http://127.0.0.1:38086/';
(async()=>{const browser=await chromium.launch({executablePath:require('../../../tools/browser-path.cjs')(),headless:true,args:['--enable-webgl','--use-angle=d3d11']});try{
 let credentials;
 if(origin.startsWith('https://ltt.vui-hoc.xyz/')){const access=fs.readFileSync('temp/deploy/access.txt','utf8'),get=name=>new RegExp('^'+name+': (.+)$','m').exec(access)?.[1];credentials={username:get('Preview user'),password:get('Preview password'),origin:'https://ltt.vui-hoc.xyz'};}
 const output=path.resolve('apps/game-client/temp/pwa-qa');fs.mkdirSync(output,{recursive:true});
 for(const [width,height] of [[1920,925],[390,844]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:width<900,hasTouch:width<900,httpCredentials:credentials}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('requestfailed',r=>console.log('Request unavailable',new URL(r.url()).pathname+new URL(r.url()).search));
  await page.addInitScript(()=>{window.loadingValues=[];window.addEventListener('ltt-loading',e=>window.loadingValues.push(e.detail.percent));});
  // Hold the engine long enough to verify the first paint, before gameplay code.
  await page.route('**/assets/main/index.js',async route=>{await new Promise(r=>setTimeout(r,800));await route.continue();});
  await page.goto(origin);
  if(width<900){assert.equal(await page.locator('#rotate-device').isVisible(),true);await page.setViewportSize({width:844,height:390});assert.equal(await page.locator('#rotate-device').isVisible(),false);}
  assert.equal(await page.locator('#app-splash').isVisible(),true);
  await page.screenshot({path:path.join(output,`splash-${width}.png`)});
  const manifest=await page.evaluate(async()=>{const r=await fetch(document.querySelector('link[rel=manifest]').href,{credentials:'include'});return r.json();});
  assert.equal(manifest.display,'fullscreen');assert.equal(manifest.icons.length,3);
  const cdp=await context.newCDPSession(page),appManifest=await cdp.send('Page.getAppManifest');
  assert.deepEqual(appManifest.errors,[]);await cdp.detach();
  await page.waitForFunction(()=>document.getElementById('app-splash').hidden,undefined,{timeout:120000});
  const values=await page.evaluate(()=>window.loadingValues);assert.equal(values.at(-1),100);assert.ok(values.length>5);assert.ok(values.every((v,i)=>!i||v>=values[i-1]));
  console.log('Splash ready',width,values);
  await page.waitForFunction(()=>!!navigator.serviceWorker.controller,undefined,{timeout:20000});
  assert.equal(await page.evaluate(()=>new URL(navigator.serviceWorker.controller.scriptURL).pathname),new URL('sw.js',origin).pathname);
  await page.unroute('**/assets/main/index.js');
  // Warm all startup resources under worker control, then prove offline boot.
  await page.reload();await page.waitForFunction(()=>document.getElementById('app-splash').hidden,undefined,{timeout:120000});console.log('Cache warmed',width);
  await page.waitForTimeout(500);
  await context.setOffline(true);await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.getElementById('app-splash').hidden,undefined,{timeout:30000});
  assert.deepEqual(errors,[]);console.log(JSON.stringify({width,height,values,offlineBoot:true,errors}));await context.close();
 }
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
