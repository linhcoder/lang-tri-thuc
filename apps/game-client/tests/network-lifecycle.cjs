const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const cache=new Map();function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file).exports;const module={exports:{}};cache.set(file,module);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;vm.runInThisContext(`(function(require,module,exports){${code}\n})`,{filename:file})(name=>name==='cc'?{}:load(path.resolve(path.dirname(file),name+'.ts')),module,module.exports);return module.exports;}
const scripts=path.resolve(__dirname,'../assets/scripts'),{VillageNetwork}=load(path.join(scripts,'network/VillageNetwork.ts')),{contentVersion}=load(path.join(scripts,'world/ContentVersion.ts'));
const options={roomCode:'12345678',ticket:'fixture-only'};
function room(){const handlers={},messages=[],r={sessionId:'self',state:{players:new Map()},handlers,messages,left:0,send:(type,value)=>messages.push({type,value}),leave:async()=>{r.left++;},onMessage:(type,fn)=>handlers[type]=fn,onStateChange:fn=>r.snapshot=fn,onLeave:()=>{},onError:()=>{},onDrop:()=>{},onReconnect:()=>{}};return r;}
function sdk(network,join){network.loadSdk=async()=>({Client:class {joinOrCreate(){return join();}}});}
test('offline/dispose during a pending join never resurrect a room',async()=>{
 for(const mode of ['offline','dispose']){const network=new VillageNetwork(),r=room();let resolve,notifications=0;const joined=new Promise(done=>resolve=done);sdk(network,()=>joined);network.onOffline=()=>notifications++;const pending=network.connect('fixture',options);await Promise.resolve();network[mode]();resolve(r);await pending;assert.equal(network.room,null);assert.equal(r.left,1);assert.equal(network.canSend,false);assert.equal(notifications,mode==='offline'?1:0);}
});
test('private content handshake rejects mismatches and ignores stale room callbacks',async()=>{
 const network=new VillageNetwork(),r=room();sdk(network,()=>Promise.resolve(r));let offline=0,progress=0;network.onOffline=()=>offline++;network.onProgress=()=>progress++;await network.connect('fixture',options);
 assert.equal(network.canSend,false);r.handlers['content-version'](contentVersion());assert.equal(network.canSend,true);r.handlers['progress-state']({});assert.equal(progress,1);
 r.handlers['content-version']('mismatched-fixture');assert.equal(network.room,null);assert.equal(network.canSend,false);assert.equal(offline,1);
 r.state.players.set('other',{x:0,y:0});r.snapshot();r.handlers['progress-state']({});r.handlers.correction({x:999,y:999});assert.equal(progress,1);assert.equal(network.players.size,0);assert.equal(network.correction,null);
});
test('three failed private joins enable explicit solo fallback without further retries',async()=>{
 const network=new VillageNetwork();let fallback=0;sdk(network,()=>Promise.reject(Error('Fixture unavailable')));network.onOffline=()=>fallback++;
 for(let i=0;i<3;i++)await network.connect('fixture',options);assert.equal(fallback,1);assert.equal(network.offlineMode,true);assert.equal(network.retry,0);assert.equal(network.canSend,false);
});
