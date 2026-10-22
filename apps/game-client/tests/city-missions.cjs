const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,f);
const {cityDistricts,cityBuildingPosition,cityMissions,cityQuestion,restoreCity,mergeCity}=require('../assets/scripts/world/CityMissions.ts');
const {VillageMap,toWorld}=require('../assets/scripts/world/VillageModel.ts');
const {validateZones,portalDestination,worldZones}=require('../assets/scripts/world/WorldZones.ts');
const {CampaignSave}=require('../assets/scripts/world/CampaignSave.ts');
const {restoreActivities,mergeActivities}=require('../assets/scripts/world/ActivitySnapshot.ts');
const map=new VillageMap();assert.equal(validateZones(),true);
for(const d of cityDistricts){
 assert.ok(map.path({x:20,y:20},d).length,d.id+' reachable');
 assert.deepEqual(portalDestination(toWorld(worldZones[0].spawn),d.id),toWorld(d));
 assert.equal(map.canStand(toWorld(cityBuildingPosition(d))),false,'building collision');
}
const answers=[['30 sách','8 sách','2 gói','Còn 12 sách, thêm 2 gói để đủ 20.'],['Xe A','7:53','12 nghìn','7:43'],['Ánh sáng','4 cm','Trong lần thử này, chậu sáng cao hơn.','Lặp lại với nhiều cặp chậu cùng điều kiện.'],['30 kg','30 kg','3 thùng','2 cây bóng mát và 2 cây hoa']];
for(const [i,m] of cityMissions.entries()){
 assert.equal(m.steps.length,4);
 for(let round=0;round<4;round++){const q=cityQuestion(m.id,round);assert.equal(q.choices[q.answer],answers[i][round]);assert.equal(new Set(q.choices).size,3);assert.ok(q.hint);assert.equal(q.prompt.includes('??'),false);}
 assert.equal(cityQuestion(m.id,4),undefined);
}
assert.equal(cityQuestion('unknown',0),undefined);
assert.deepEqual(restoreCity({'city-library':4,'city-station':-1,'city-lab':2.5,'city-park':99,unknown:2}),{'city-library':4});
assert.deepEqual(mergeCity({'city-library':4},{'city-library':1,'city-lab':2}),{'city-library':4,'city-lab':2});
const entries=new Map(),storage={getItem:k=>entries.get(k)??null,setItem:(k,v)=>entries.set(k,v)};
const save=new CampaignSave(storage);save.engine.data.upgrades=require('../assets/scripts/world/LearningUpgrades.ts').restoreUpgrades(null);save.engine.data.upgrades.city={'city-library':2};const xp=save.engine.xp;save.save();
const loaded=new CampaignSave(storage);assert.equal(loaded.engine.data.upgrades.city['city-library'],2);assert.equal(loaded.engine.xp,xp);
const a=restoreActivities({upgrades:{city:{'city-library':4}}}),b=restoreActivities({upgrades:{city:{'city-library':1,'city-lab':2}}});
assert.deepEqual(mergeActivities(a,b).upgrades.city,mergeActivities(b,a).upgrades.city);
assert.equal(mergeActivities(a,b).upgrades.city['city-library'],4);
console.log('PASS city: four reachable districts, collisions, 16 answers, checkpoint reload and cumulative cloud merge');
