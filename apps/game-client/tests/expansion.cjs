const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,f);
const root='../assets/scripts/world/',{VillageMap,SIZE,storyNpcs,toWorld}=require(root+'VillageModel.ts'),{worldZones,validateZones,portalDestination}=require(root+'WorldZones.ts'),{ExpansionGame,expansionActivities,restoreExpansion}=require(root+'ExpansionActivities.ts'),{CampaignEngine}=require(root+'CampaignEngine.ts'),{restoreActivities,mergeActivities}=require(root+'ActivitySnapshot.ts');
assert.equal(SIZE,48);assert.equal(worldZones.length,13);assert.equal(storyNpcs.length,12);assert.equal(validateZones(),true);
const map=new VillageMap();for(const z of worldZones.filter(z=>['seasons','riverside','playground'].includes(z.id))){assert.ok(map.path({x:20,y:20},z.spawn).length);assert.deepEqual(portalDestination(toWorld(worldZones[0].spawn),z.id),toWorld(z.spawn));}
assert.equal(map.walkable(16,42),false);assert.equal(map.walkable(48,20),false);assert.equal(map.walkable(40,16),true);
for(const age of ['3-5','6-8','9-11'])for(const a of expansionActivities){const g=new ExpansionGame(a.id,age);assert.equal(g.choose(-1),false);assert.equal(g.choose(NaN),false);for(let round=0;round<3;round++){assert.equal(g.choicePictures.length,g.round.choices.length);const step=g.step;assert.equal(g.choose((g.round.answer+1)%g.round.choices.length),false);assert.equal(g.step,step);g.hint();if(a.id==='flower-care')assert.ok(!g.feedback.includes(g.round.choices[g.round.answer]));else assert.ok(g.feedback.includes(g.round.choices[g.round.answer]));assert.equal(g.choose(g.round.answer),true);}assert.equal(g.ended,true);assert.equal(g.choose(0),false);}
assert.deepEqual(restoreExpansion(['flower-care','fake','flower-care',null]),['flower-care']);
const old=new CampaignEngine();const legacy={...old.data};delete legacy.skin;assert.equal(old.restore(JSON.stringify(legacy)),true);assert.equal(old.data.skin,0);assert.equal(old.stars,0);
assert.equal(old.restore(JSON.stringify({...old.data,avatar:5,hair:2,skin:2,expansion:['school-find','fake']})),true);assert.equal(old.data.avatar,5);assert.equal(old.data.hair,2);assert.equal(old.data.skin,2);assert.deepEqual(old.data.expansion,['school-find']);assert.equal(old.stars,0);
const merged=mergeActivities(restoreActivities({expansion:['flower-care']}),restoreActivities({expansion:['school-find'],receipts:['reward.star.ch08']}));assert.deepEqual(merged.expansion,['flower-care','school-find']);assert.equal(merged.receipts,undefined);
console.log('Expansion: 13 reachable zones, river collision, 21 activity runs, safe migration, cosmetics and cumulative cloud badges passed');

const {restoreExpansionProgress}=require(root+'ExpansionActivities.ts'),{CampaignSave}=require(root+'CampaignSave.ts');
assert.deepEqual(restoreExpansionProgress({'flower-care':{step:1,age:'3-5'},'boat-build':{step:3,age:'6-8'},'fish-count':{step:2,age:'unknown'},fake:{step:1,age:'3-5'}}),{'flower-care':{step:1,age:'3-5',updated:0}});
for(const age of ['3-5','6-8','9-11']){
 const fish=new ExpansionGame('fish-count',age);assert.equal(fish.countFish(-1),false);assert.equal(fish.countFish(NaN),false);assert.equal(fish.countFish(fish.round.count),false);
 for(let i=0;i<fish.round.count;i++){assert.equal(fish.countFish(i),true);assert.equal(fish.countFish(i),false);}
 assert.equal(fish.countedFish.size,fish.round.count);assert.equal(fish.step,0);fish.choose((fish.round.answer+1)%3);assert.equal(fish.countedFish.size,fish.round.count);fish.choose(fish.round.answer);assert.equal(fish.countedFish.size,0);
}
const entries=new Map(),storage={getItem:key=>entries.get(key)??null,setItem:(key,value)=>entries.set(key,value)},saved=new CampaignSave(storage);
saved.engine.data.expansionProgress={'flower-care':{step:2,age:'3-5'}};assert.equal(saved.save(),true);const loaded=new CampaignSave(storage);assert.equal(loaded.engine.data.expansionProgress['flower-care'].step,2);assert.equal(loaded.engine.stars,0);assert.deepEqual(loaded.engine.data.expansion,[]);
assert.equal(new ExpansionGame('flower-care','3-5',99).step,0);assert.equal(new ExpansionGame('flower-care','3-5',2).ended,false);
console.log('Expansion checkpoints survive storage reload without awarding badges; fish counting rejects duplicates and resets only after correct answers');

const remoteCheckpoint=restoreActivities({expansionProgress:{'flower-care':{step:2,age:'3-5',updated:10}}}),completedCheckpoint=restoreActivities({expansionProgress:{'flower-care':{step:0,age:'3-5',updated:20}}});assert.equal(mergeActivities(remoteCheckpoint,completedCheckpoint).expansionProgress['flower-care'].step,0);assert.equal(mergeActivities(completedCheckpoint,remoteCheckpoint).expansionProgress['flower-care'].step,0);
