const CACHE='ltt-game-__BUILD_HASH__';
const ROOT=new URL('./',self.location).href;
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(['./','./app-shell.css','./app-shell.js','./brand/logo.svg','./manifest.webmanifest','./brand/icon-192.png','./brand/icon-512.png']))));
// A new worker waits for the old game tabs to close, keeping a session consistent.
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('ltt-game-')&&key!==CACHE)await caches.delete(key);await self.clients.claim();})()));
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(ROOT)||url.search||request.headers.has('Authorization'))return;
 if(request.mode!=='navigate'&&!/\.(?:js|json|bin|txt|css|png|jpg|jpeg|webp|svg|wasm|ttf|woff2?|webmanifest|ico)$/.test(url.pathname))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE),key=request.mode==='navigate'?ROOT:request;
  try{const response=await fetch(request);if(response.ok&&response.type==='basic')try{await cache.put(key,response.clone());}catch{}return response;}
  catch{const saved=await cache.match(key);return saved||Response.error();}
 })());
});
