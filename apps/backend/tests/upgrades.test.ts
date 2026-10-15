import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createApi} from '../src/main';
import {SqliteRepository} from '../src/Store';
import {CampaignEngine} from '../../game-client/assets/scripts/world/CampaignEngine';
import {learningReport,recordLearning,restoreUpgrades} from '../../game-client/assets/scripts/world/LearningUpgrades';
import {mergeActivities,activitySnapshot} from '../../game-client/assets/scripts/world/ActivitySnapshot';
import {VillageMap} from '../../game-client/assets/scripts/world/VillageModel';
test('published layouts are versioned, isolated from drafts, protected and recoverable',async()=>{
 const store=new SqliteRepository(),app=await createApi({store,adminPassword:'UpgradeLayoutAdmin123!',roomSecret:'upgrade-layout-test-secret-32-chars'});
 try{const token=(await app.inject({method:'POST',url:'/sessions',payload:{alias:'admin',password:'UpgradeLayoutAdmin123!'}})).json().token,headers={authorization:'Bearer '+token};
  const before=(await app.inject('/content/layout')).json();assert.equal(before.revision,0);
  assert.equal((await app.inject({method:'POST',url:'/admin/scene-layout/publish',payload:{revision:0}})).statusCode,401);
  const pack={version:1,placements:[{id:'house',x:62,y:10,width:400,height:300}]};
  const save=await app.inject({method:'PUT',url:'/admin/scene-layout',headers,payload:{revision:0,pack}});assert.equal(save.statusCode,200);
  assert.deepEqual((await app.inject('/content/layout')).json(),before);
  assert.equal((await app.inject({method:'POST',url:'/admin/scene-layout/publish',headers,payload:{revision:0}})).statusCode,409);
  assert.equal((await app.inject({method:'POST',url:'/admin/scene-layout/check',headers,payload:{revision:1}})).statusCode,200);
  const publish=await app.inject({method:'POST',url:'/admin/scene-layout/publish',headers,payload:{revision:1,acknowledgeWarnings:true}});assert.equal(publish.statusCode,200);assert.deepEqual((await app.inject('/content/layout')).json().pack,pack);
  const original=new VillageMap(),updated=new VillageMap();updated.configureLayout(pack.placements);assert.equal(updated.walkable(62,10),false);assert.equal(original.walkable(62,10),true);assert.equal(new VillageMap().walkable(62,10),true);
  assert.equal((await app.inject({method:'POST',url:'/admin/scene-layout/rollback',headers,payload:{revision:0,activeRevision:0}})).statusCode,409);
  assert.equal((await app.inject({method:'POST',url:'/admin/scene-layout/rollback',headers,payload:{revision:0,activeRevision:1}})).statusCode,200);
  assert.deepEqual((await app.inject('/content/layout')).json().pack,before.pack);assert.deepEqual((await app.inject('/content/layout?revision=1')).json().pack,pack);
 }finally{await app.close();}
});
test('learning upgrades survive restore and activity merges without granting story rewards',()=>{
 const engine=new CampaignEngine();engine.data.upgrades=restoreUpgrades({tutorial:['move','garbage'],room:{left:'plant',bad:'trophy'}});
 recordLearning(engine.data,'math',false,'q.test');recordLearning(engine.data,'math',true,'q.test');recordLearning(engine.data,'story',true,'q.test','complete');recordLearning(engine.data,'story',true,'q.test','complete');
 const report=learningReport(engine.data.upgrades);assert.equal(report.answers,2);assert.equal(report.correct,1);assert.equal(report.completed,1);assert.match(report.recommendation,/toán/);assert.equal(engine.stars,0);
 const restored=new CampaignEngine();assert.equal(restored.restore(JSON.stringify(engine.data)),true);assert.deepEqual(restored.data.upgrades,engine.data.upgrades);
 const merged=mergeActivities(activitySnapshot(engine.data),activitySnapshot(restored.data));assert.equal(merged.upgrades!.events.length,3);assert.deepEqual(merged.upgrades!.room,{left:'plant'});assert.deepEqual(merged.upgrades!.tutorial,['move']);
});
test('parent learning reports enforce profile ownership and admin reports enforce role',async()=>{
 const store=new SqliteRepository(),app=await createApi({store,adminPassword:'UpgradeReportsAdmin123!',roomSecret:'upgrade-report-test-secret-32-chars'});
 try{await app.inject({method:'POST',url:'/parents',payload:{alias:'report_parent',password:'ReportParentPassword123!'}});const session=(await app.inject({method:'POST',url:'/sessions',payload:{alias:'report_parent',password:'ReportParentPassword123!'}})).json();const headers={authorization:'Bearer '+session.token};
  const profile=(await app.inject({method:'POST',url:'/profiles',headers,payload:{label:'Report student',age:'6-8',gender:'male',avatar:0}})).json();
  await store.transaction(d=>{const engine=new CampaignEngine();recordLearning(engine.data,'math',false,'test.one');const activities=structuredClone(activitySnapshot(engine.data));recordLearning(engine.data,'math',true,'test.two');d.progress[profile.id]={revision:1,data:engine.data,receipts:[],source:'solo',activities};});
  assert.equal((await app.inject({method:'GET',url:'/profiles/'+profile.id+'/learning-report',headers})).statusCode,200);
  assert.equal((await app.inject({method:'GET',url:'/profiles/'+profile.id+'/learning-report',headers})).json().answers,2);
  assert.equal((await app.inject({method:'GET',url:'/profiles/'+profile.id+'/play',headers})).json().progress.data.upgrades.events.length,2);
  await store.transaction(d=>{const saved=d.progress[profile.id];const trusted=new CampaignEngine();trusted.data.upgrades=restoreUpgrades({room:{left:'plant'},events:(saved.data as any).upgrades.events});saved.source='online';saved.trusted={chapterOne:null,campaign:trusted.data};delete saved.activities;});
  assert.equal((await app.inject({method:'GET',url:'/profiles/'+profile.id+'/play',headers})).json().progress.data.upgrades.room.left,'plant');
  assert.equal((await app.inject({method:'GET',url:'/profiles/not-owned/learning-report',headers})).statusCode,404);
  assert.equal((await app.inject({method:'GET',url:'/admin/students/'+profile.id+'/learning-report',headers})).statusCode,401);
 }finally{await app.close();}
});
