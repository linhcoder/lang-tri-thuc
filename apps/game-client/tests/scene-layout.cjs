const assert=require('node:assert/strict'),path=require('node:path'),esbuild=require('esbuild');
const world=path.resolve(__dirname,'../assets/scripts/world');
async function load(entry,pack){const module={exports:{}};const plugins=pack?[{name:'candidate',setup(b){b.onLoad({filter:/SceneLayoutPack\.ts$/},()=>({contents:'export default '+JSON.stringify(pack),loader:'ts'}));}}]:[];const result=await esbuild.build({entryPoints:[path.join(world,entry+'.ts')],bundle:true,write:false,platform:'node',format:'cjs',plugins});const code=result.outputFiles[0].text;new Function('module','exports','require',code)(module,module.exports,require);return module.exports;}
(async()=>{
const candidate={version:1,placements:[{id:'house',x:62,y:10,width:520,height:460},{id:'journey.village',x:63,y:17,width:490,height:390},{id:'schoolyard.dirt-pitch',x:47.25,y:34.5,width:420,height:280}]};
assert.deepEqual((await load('SceneLayout')).layoutErrors(candidate),[]);
const base=(await load('VillageModel')),changed=(await load('VillageModel',candidate)),before=new base.VillageMap(),after=new changed.VillageMap();
assert.equal(before.walkable(29,12),false);assert.equal(after.walkable(29,12),true);
assert.equal(before.walkable(62,10),true);assert.equal(after.walkable(62,10),false);
assert.equal(changed.villageObjects.find(o=>o.id==='house').width,520);
assert.equal(changed.landmarkFootprints.find(o=>o.id==='house').halfWidth,210);
assert.equal(changed.villageObjects.find(o=>o.id==='banyan').x,63);
const scene=(await load('SceneLayout',candidate)).sceneObjects();assert.equal(scene.find(o=>o.id==='schoolyard.dirt-pitch').height,280);
assert.notEqual((await load('ContentVersion')).contentVersion(),(await load('ContentVersion',candidate)).contentVersion());
console.log('Scene layout passed: rendering data, moved/scaled collisions, linked tree and client/server compatibility.');

})().catch(e=>{console.error(e);process.exitCode=1;});
