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
 const art=new module.exports.VillageArt();art.loadNpcPoses=async()=>{};art.ensureDecoration=async()=>{};
 return {art,requests};
}
test('startup launches ground and details before core downloads finish; optional failures preserve playable art',async()=>{
 const {art,requests}=fixture(),pending=art.load();
 assert.equal(requests.size,8);
 for(const [key,callback] of requests)callback(key.startsWith('ground.meadow')||key.startsWith('ground.dirt')||key.startsWith('bamboo')?Error('offline'):null,{key});
 await pending;assert.equal(art.child.length,1);assert.equal(art.environmentLoaded.has(6),true);assert.equal(art.groundTexture,undefined);
});
test('disposing during parallel downloads prevents late frames from being installed',async()=>{
 const {art,requests}=fixture(),pending=art.load();art.dispose();
 for(const callback of requests.values())callback(null,{});
 await pending;assert.equal(art.child.length,0);assert.equal(art.environment.length,0);
});
