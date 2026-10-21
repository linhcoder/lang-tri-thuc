const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
function fixture(){
 const requests=new Map(),module={exports:{}};
 const source=fs.readFileSync(path.resolve(__dirname,'../assets/scripts/world/VillageArt.ts'),'utf8');
 const dependencies={
  cc:{Texture2D:class {},resources:{load:(key,type,callback)=>requests.set(key,callback)}},
  './VisualAssets':{assetResourceKey:id=>id},'./VillageModel':{villageDetails:[]},
  './TextureFrames':{animationFrames:texture=>[texture],assetFrame:(texture,id)=>({texture,id})},
 };
 const code=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
 vm.runInNewContext(code,{module,exports:module.exports,require:name=>dependencies[name]??{},console:{warn:()=>{}}});
 const art=new module.exports.VillageArt();art.loadNpcPoses=async()=>{};
 return {art,requests};
}
test('core startup completes without downloading decorative atlases or ground; failed background loads preserve playable art',async()=>{
 const {art,requests}=fixture(),pending=art.load();
 assert.equal(requests.size,2);for(const id of ['dinh','banyan','ground.meadow-texture','character.elder','vegetation.seedling'])assert.equal(requests.has(id+'/texture'),false);
 for(const [key,callback] of requests)callback(key.startsWith('ground.meadow')||key.startsWith('ground.dirt')||key.startsWith('bamboo')?Error('offline'):null,{key});
 await pending;assert.equal(art.child.length,1);assert.equal(art.environmentLoaded.has(6),true);const background=art.ensureTerrainTextures();assert.equal(requests.has('ground.meadow-texture/texture'),true);requests.get('ground.meadow-texture/texture')(Error('offline'));requests.get('ground.dirt-texture/texture')(Error('offline'));await background;assert.equal(art.groundTexture,undefined);
});
test('disposing during parallel downloads prevents late frames from being installed',async()=>{
 const {art,requests}=fixture(),pending=art.load();art.dispose();
 for(const callback of requests.values())callback(null,{});
 await pending;assert.equal(art.child.length,0);assert.equal(art.environment.length,0);
});
test('slow motion atlases never gate core startup and background loading is deduplicated',async()=>{
 const {art,requests}=fixture();let started=0,finish;
 const delayed=new Promise(resolve=>{finish=resolve;});
 art.loadRedStarBoy=()=>{started++;return delayed;};art.loadNpcPoses=()=>{started++;return delayed;};
 const core=art.load();for(const [key,callback] of requests)callback(key.startsWith('bamboo')?Error('offline'):null,{});await core;
 assert.equal(started,0);assert.equal(art.environmentLoaded.has(6),true);
 const first=art.ensureMotion(),second=art.ensureMotion();assert.equal(first,second);assert.equal(started,3);
 finish();await first;
});
test('warm artwork bypasses the network while code and release configuration stay network-first',async()=>{
 const handlers={},saved={cached:true},network={ok:true,type:'basic',clone(){return this;}},hits=[];
 const cache={match:async()=>saved,put:async()=>{}};
 const source=fs.readFileSync(path.resolve(__dirname,'../web/sw.js'),'utf8');
 vm.runInNewContext(source,{URL,Response,self:{location:new URL('https://game.test/game/sw.js'),addEventListener:(type,handler)=>handlers[type]=handler},caches:{open:async()=>cache},fetch:async request=>{hits.push(request.url);return network;}});
 const request=async file=>{let pending;handlers.fetch({request:{method:'GET',url:'https://game.test/game/'+file,mode:'cors',headers:{has:()=>false}},respondWith:value=>{pending=value;}});return pending;};
 assert.equal(await request('assets/resources/native/example.png'),saved);assert.equal(hits.length,0);
 assert.equal(await request('assets/resources/config.json'),network);assert.equal(hits.length,1);
 assert.equal(await request('assets/main/index.js'),network);assert.equal(hits.length,2);
 cache.match=async()=>undefined;assert.equal(await request('assets/resources/native/new.png'),network);assert.equal(hits.length,3);
});

// Content fingerprints allow engine cache reuse without hiding a changed application bundle.
test('fingerprinted engine scripts reuse the current build cache',async()=>{
 const handlers={},saved={},network={},cache={match:async()=>saved,put:async()=>{}};let hits=0;
 const source=fs.readFileSync(path.resolve(__dirname,'../web/sw.js'),'utf8');
 vm.runInNewContext(source,{self:{location:new URL('https://example.test/game/sw.js'),addEventListener:(name,fn)=>handlers[name]=fn},URL,caches:{open:async()=>cache},fetch:async()=>{hits++;return network;}});
 let result;handlers.fetch({request:{method:'GET',url:'https://example.test/game/cocos-js/_virtual_cc-Bp5iGE8z.js',mode:'cors',headers:{has:()=>false}},respondWith:value=>result=value});assert.equal(await result,saved);assert.equal(hits,0);
});
