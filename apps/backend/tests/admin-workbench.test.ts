import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createApi} from '../src/main';
import {SqliteRepository} from '../src/Store';
import {CampaignEngine} from '../../game-client/assets/scripts/world/CampaignEngine';
import {recordLearning} from '../../game-client/assets/scripts/world/LearningUpgrades';
async function fixture(){const store=new SqliteRepository(),app=await createApi({store,roomSecret:'admin-workbench-tests-secret-32-characters',adminPassword:'WorkbenchTests123!'});const req=async(url:string,method:any='GET',payload?:any,token='')=>app.inject({url,method,payload,headers:token?{authorization:'Bearer '+token}:{}});const admin=(await req('/sessions','POST',{alias:'admin',password:'WorkbenchTests123!'})).json().token;return {store,app,req,admin};}
test('workbench search, diagnostics, insights and history require admin and never expose credentials',async()=>{
 const {app,req,admin}=await fixture();try{
  await req('/parents','POST',{alias:'workbench_parent',password:'ParentWorkbench123!'});const parent=(await req('/sessions','POST',{alias:'workbench_parent',password:'ParentWorkbench123!'})).json().token;
  for(const url of ['/admin/workbench','/admin/search?q=admin','/admin/workflow','/admin/learning-insights','/admin/change-history','/admin/map-diagnostics']){assert.equal((await req(url)).statusCode,401);assert.equal((await req(url,'GET',undefined,parent)).statusCode,401);const r=await req(url,'GET',undefined,admin);assert.equal(r.statusCode,200,r.body);assert.ok(!r.body.includes('passwordHash'));assert.ok(!r.body.includes(parent));}
 }finally{await app.close();}
});
test('batch approval previews effects, rejects stale and duplicate selections and applies atomically',async()=>{
 const {app,req,admin,store}=await fixture();try{
  const rows=(await req('/admin/workflow','GET',undefined,admin)).json(),selected=rows.filter((r:any)=>r.kind==='lessons').slice(0,2),items=selected.map((r:any)=>({key:r.key,fingerprint:r.fingerprint}));
  const body={items,status:'reviewed',note:'Checked wording and answer choices.'};
  assert.equal((await req('/admin/workflow/preview','POST',body,admin)).statusCode,200);assert.equal((await req('/admin/workflow/apply','POST',{...body,status:'approved'},admin)).statusCode,409);
  assert.equal((await req('/admin/workflow/apply','POST',{...body,items:[items[0],items[0]]},admin)).statusCode,400);
  assert.equal((await req('/admin/workflow/apply','POST',body,admin)).json().count,2);
  assert.equal((await req('/admin/workflow/apply','POST',body,admin)).statusCode,409);
  await store.transaction(d=>{assert.equal(d.review[items[0].key].status,'reviewed');assert.equal(d.review[items[1].key].status,'reviewed');assert.equal(d.cms,undefined);assert.equal(d.scenePublished,undefined);});
  const next=(await req('/admin/workflow','GET',undefined,admin)).json().filter((r:any)=>items.some((v:any)=>v.key===r.key)).map((r:any)=>({key:r.key,fingerprint:r.fingerprint}));
  assert.equal((await req('/admin/workflow/apply','POST',{...body,items:next,status:'approved'},admin)).statusCode,200);
 }finally{await app.close();}
});
test('editor changes capture before and after, restore creates a draft and stale restore never overwrites newer edits',async()=>{
 const {app,req,admin}=await fixture();try{
  const c=(await req('/admin/content','GET',undefined,admin)).json()[0],body={title:c.title+' edited',intro:c.intro,ending:c.ending,questTitles:{},note:'Updated title for editorial review.'};
  assert.equal((await req('/admin/content/'+c.id+'/text','PUT',body,admin)).statusCode,200);
  const changes=(await req('/admin/change-history','GET',undefined,admin)).json().changes,change=changes.find((v:any)=>v.kind==='content'&&v.key===c.id);assert.equal(change.before,null);assert.equal(change.after.title,body.title);assert.equal(change.canRestore,true);
  await req('/admin/content/'+c.id+'/text','PUT',{...body,title:c.title+' newer'},admin);
  assert.equal((await req('/admin/change-history/'+change.id+'/restore','POST',{fingerprint:change.fingerprint,note:'Restore previous checked wording.'},admin)).statusCode,409);
  const latest=(await req('/admin/change-history','GET',undefined,admin)).json().changes.find((v:any)=>v.kind==='content'&&v.key===c.id);
  assert.equal((await req('/admin/change-history/'+latest.id+'/restore','POST',{fingerprint:latest.fingerprint,note:'Restore previous checked wording.'},admin)).statusCode,200);
  const restored=(await req('/admin/content','GET',undefined,admin)).json().find((v:any)=>v.id===c.id);assert.equal(restored.title,body.title);assert.equal(restored.reviewRecord.status,'draft');
 }finally{await app.close();}
});
test('student summaries use observed saves, question reports expose sample size and save conflicts become resolvable work items',async()=>{
 const {app,req,admin}=await fixture();try{
  await req('/parents','POST',{alias:'learning_workbench',password:'LearningWorkbench123!'});const token=(await req('/sessions','POST',{alias:'learning_workbench',password:'LearningWorkbench123!'})).json().token;
  const ids:string[]=[];for(let n=0;n<3;n++){const profile=(await req('/profiles','POST',{label:'Learner '+n,age:'6-8',gender:'male',avatar:0},token)).json();ids.push(profile.id);const engine=new CampaignEngine();for(let i=0;i<5;i++)recordLearning(engine.data,'math',false,'same-question');assert.equal((await req('/profiles/'+profile.id+'/progress','PUT',{revision:0,campaign:JSON.stringify(engine.data)},token)).statusCode,200);}
  const insights=(await req('/admin/learning-insights','GET',undefined,admin)).json();assert.equal(insights.questions[0].attempts,15);assert.equal(insights.questions[0].profiles,3);assert.equal(insights.questions[0].sufficient,true);assert.ok(insights.students.every((s:any)=>s.lastSavedAt>0&&s.weak.length===1));
  assert.equal((await req('/profiles/'+ids[0]+'/progress','PUT',{revision:0,campaign:'{}'},token)).statusCode,409);
  const response=await req('/admin/workbench','GET',undefined,admin);assert.equal(response.statusCode,200,response.body);const queue=response.json().queue,issue=queue.find((q:any)=>q.issue);assert.ok(issue);assert.equal((await req('/admin/workbench/issues/'+issue.id+'/resolve','PUT',undefined,admin)).statusCode,200);
  assert.ok(!(await req('/admin/workbench','GET',undefined,admin)).json().queue.some((q:any)=>q.issue));
  const search=(await req('/admin/search?q=Learner','GET',undefined,admin)).json();assert.equal(search.filter((r:any)=>r.tab==='students').length,3);
 }finally{await app.close();}
});

test('restoring an NPC invalidates map publication previews made against the previous draft revision',async()=>{
 const {app,req,admin,store}=await fixture();try{
  const layout=(await req('/admin/scene-layout','GET',undefined,admin)).json();await store.transaction(d=>{d.sceneLayout={revision:2,pack:layout.pack.default??layout.pack,note:'Map draft before restoration'};});
  const npc=(await req('/admin/catalog','GET',undefined,admin)).json().npcs[0];const edit=await req('/admin/catalog/npc/'+npc.id,'PUT',{value:{id:npc.id,name:npc.name+' checked',x:npc.x,y:npc.y},note:'Checked NPC name for publication.'},admin);assert.equal(edit.statusCode,200,edit.body);
  const change=(await req('/admin/change-history','GET',undefined,admin)).json().changes.find((c:any)=>c.kind==='npcs'&&c.key===npc.id);assert.ok(change);
  const restore=await req('/admin/change-history/'+change.id+'/restore','POST',{fingerprint:change.fingerprint,note:'Restore checked original NPC name.'},admin);assert.equal(restore.statusCode,200,restore.body);
  assert.equal((await req('/admin/scene-layout','GET',undefined,admin)).json().revision,3);
  assert.equal((await req('/admin/scene-layout/publish','POST',{revision:2,acknowledgeWarnings:true},admin)).statusCode,409);
 }finally{await app.close();}
});

test('global search includes both draft and published CMS characters without touching either snapshot',async()=>{
 const {app,req,admin,store}=await fixture();try{
  await store.transaction(d=>{const npc:any={id:'cms-search-only',name:'Custom storyteller',x:24,y:32};d.cms={revision:7,status:'draft',note:'Draft retained',npcs:[npc],active:'active',releases:[{id:'active',created:1,note:'Published retained',manifest:{schema:1,baseVersion:'2e57529e',version:'active',npcs:[{...npc,id:'cms-published-only',name:'Published storyteller'}]}}]};});
  const result=(await req('/admin/search?q=storyteller','GET',undefined,admin)).json();assert.equal(result.length,2);assert.ok(result.every((r:any)=>r.tab==='studio'));assert.ok(result.some((r:any)=>r.query==='cms-search-only'));await store.transaction(d=>{assert.equal(d.cms!.revision,7);assert.equal(d.cms!.npcs.length,1);});
 }finally{await app.close();}
});
