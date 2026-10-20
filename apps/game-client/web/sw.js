const CACHE='ltt-game-__BUILD_HASH__';
const ROOT=new URL('./',self.location).href;
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(['./','./app-shell.css','./app-shell.js','./brand/logo.svg','./manifest.webmanifest','./brand/icon-192.png','./brand/icon-512.png']))));
// A new worker waits for the old game tabs to close, keeping a session consistent.
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('ltt-game-')&&key!==CACHE)await caches.delete(key);await self.clients.claim();})()));
// First navigation can load the engine before worker control starts. Warm it
// only after the village is playable, so the next visit can reuse those bytes.
self.addEventListener('message',event=>{
 if(event.data?.type!=='warm-engine'||!Array.isArray(event.data.urls))return;
 const urls=event.data.urls.slice(0,8).filter(value=>{try{const url=new URL(value);return url.origin===self.location.origin&&url.href.startsWith(ROOT)&&/\/cocos-js\/[^/]+-[A-Za-z0-9_-]{8,}\.js$/.test(url.pathname)&&!url.search;}catch{return false;}});
 event.waitUntil((async()=>{const cache=await caches.open(CACHE);await Promise.all(urls.map(async url=>{if(!await cache.match(url))try{await cache.add(url);}catch{}}));})());
});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(ROOT)||url.search||request.headers.has('Authorization'))return;
 if(request.mode!=='navigate'&&!/\.(?:js|json|bin|txt|css|png|jpg|jpeg|webp|svg|wasm|ttf|woff2?|webmanifest|ico)$/.test(url.pathname))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE),key=request.mode==='navigate'?ROOT:request;
  // Art dominates transfer size. Reuse it immediately within this build's cache.
  // Code/config and navigation still check the server for release changes.
  if(/\.(?:png|jpg|jpeg|webp|svg|ttf|woff2?|bin|wasm)$/.test(url.pathname)||/\/cocos-js\/[^/]+-[A-Za-z0-9_-]{8,}\.js$/.test(url.pathname)){const saved=await cache.match(key);if(saved)return saved;}
  try{const response=await fetch(request);if(response.ok&&response.type==='basic')try{await cache.put(key,response.clone());}catch{}return response;}
  catch{const saved=await cache.match(key);return saved||Response.error();}
 })());
});
