import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createApi} from '../src/main';
import {SqliteRepository} from '../src/Store';
import {cmsErrors,cmsAssets,CmsNpc,validCmsManifest} from '../../game-client/assets/scripts/world/CmsContent';
import {loadCms} from '../../game-client/assets/scripts/world/CmsLoader';
import {contentVersion} from '../../game-client/assets/scripts/world/ContentVersion';

for(const previousVersion of ['785f4e7e','0d971c1a'])test('known navigation upgrade from '+previousVersion+' preserves published NPCs, immutable history and unpublished drafts',async()=>{
 const store=new SqliteRepository(),app=await createApi({store,roomSecret:'navigation-upgrade-secret-32-characters'});
 const npc:CmsNpc={id:'cms-storyteller',name:'Storyteller',assetId:cmsAssets()[0].id,x:23,y:27,enabled:true,entry:'hello',questId:'q.ch01.greet',dialogue:[{id:'hello',text:'Hello village',choices:[]}]};assert.deepEqual(cmsErrors([npc]),[]);
 const old={schema:1 as const,baseVersion:previousVersion,version:'a'.repeat(64),npcs:[npc]};
 try{await store.transaction(d=>{d.cms={revision:5,status:'draft',note:'Unpublished edit',npcs:[{...npc,name:'Draft name'}],active:old.version,releases:[{id:old.version,created:1,note:'Approved original',manifest:old}]};});
  const response=await app.inject({method:'GET',url:'/content/staging'});assert.equal(response.statusCode,200);const upgraded=response.json();assert.equal(upgraded.baseVersion,contentVersion());assert.equal(validCmsManifest(upgraded),true);assert.deepEqual(upgraded.npcs,[npc]);assert.notEqual(upgraded.version,old.version);
  await store.transaction(d=>{assert.equal(d.cms!.revision,6);assert.equal(d.cms!.status,'draft');assert.equal(d.cms!.npcs[0].name,'Draft name');assert.deepEqual(d.cms!.releases[0].manifest,old);assert.equal(d.cms!.releases.length,2);assert.equal(d.audit.filter(a=>a.action==='cms.navigation.upgrade').length,1);});
  assert.deepEqual((await app.inject({method:'GET',url:'/content/staging'})).json(),upgraded);await store.transaction(d=>assert.equal(d.cms!.revision,6));
  await store.transaction(d=>{d.cms!.releases[0].manifest.baseVersion='unknown1';d.cms!.active=old.version;});assert.equal((await app.inject({method:'GET',url:'/content/staging'})).json().baseVersion,'unknown1');
  await store.transaction(d=>{const m=d.cms!.releases[0].manifest;m.baseVersion=previousVersion;m.npcs[0].x=12;m.npcs[0].y=25;});assert.equal((await app.inject({method:'GET',url:'/content/staging'})).json().version,old.version);await store.transaction(d=>{assert.equal(d.cms!.revision,6);assert.equal(d.cms!.releases.length,2);});
 }finally{await app.close();}
});

test('CMS isolates drafts, validates references, rejects stale writes, publishes snapshots and rolls back',async()=>{
 const app=await createApi({store:new SqliteRepository(),roomSecret:'cms-test-secret-32-characters-long',adminPassword:'CmsAdminPassword123!'});
 const request=(method:any,url:string,payload?:any,token?:string)=>app.inject({method,url,payload,headers:token?{authorization:'Bearer '+token}:{}});
 try{const token=(await request('POST','/sessions',{alias:'admin',password:'CmsAdminPassword123!'})).json().token;
 assert.equal((await request('GET','/admin/cms')).statusCode,401);assert.equal((await request('GET','/admin/cms/preview')).statusCode,401);
 const parent=(await request('POST','/parents',{alias:'cms_parent',password:'CmsParentPassword123!'})).json();const parentToken=(await request('POST','/sessions',{alias:'cms_parent',password:'CmsParentPassword123!'})).json().token;assert.equal((await request('GET','/admin/cms',undefined,parentToken)).statusCode,401);
 const get=async()=>(await request('GET','/admin/cms',undefined,token)).json();let s=await get();
 const npc:CmsNpc={id:'cms-test',name:'Bạn kể chuyện',assetId:cmsAssets()[0].id,x:0,y:0,enabled:true,entry:'hello',questId:'q.ch01.greet',dialogue:[{id:'hello',text:'Chào bé! Cùng khám phá làng.',choices:[{label:'Bắt đầu',next:'end'}]},{id:'end',text:'Chúc bé học vui!',choices:[]}]};
 for(let y=2;y<46;y++){for(let x=2;x<46;x++){npc.x=x;npc.y=y;if(!cmsErrors([npc]).length)break;}if(!cmsErrors([npc]).length)break;}
 assert.deepEqual(cmsErrors([npc]),[]);
 assert.equal((await request('PUT','/admin/cms/draft',{revision:0,npcs:[{...npc,assetId:'../../secret'}],note:'Invalid asset reference'},token)).statusCode,400);
 assert.equal((await request('PUT','/admin/cms/draft',{revision:0,npcs:[{...npc,dialogue:[{id:'hello',text:'Test',choices:[{label:'Bad',next:'missing'}]}]}],note:'Invalid dialogue references'},token)).statusCode,400);
 assert.equal((await request('PUT','/admin/cms/draft',{revision:0,npcs:[npc],note:'Create an isolated CMS NPC'},token)).statusCode,200);
 assert.equal((await request('PUT','/admin/cms/draft',{revision:0,npcs:[],note:'Reject stale CMS overwrite'},token)).statusCode,409);
 assert.deepEqual((await request('GET','/content/staging')).json().npcs,[]);
 s=await get();assert.equal((await request('POST','/admin/cms/publish',{revision:s.revision,baseVersion:s.baseVersion,note:'Publish before approving'},token)).statusCode,409);
 assert.equal((await request('PUT','/admin/cms/review',{revision:s.revision,status:'approved',note:'Approve without reviewing'},token)).statusCode,409);
 for(const status of ['reviewed','approved']){s=await get();assert.equal((await request('PUT','/admin/cms/review',{revision:s.revision,status,note:'Review references and dialogue'},token)).statusCode,200);}
 s=await get();const first=(await request('POST','/admin/cms/publish',{revision:s.revision,baseVersion:s.baseVersion,note:'Publish first CMS release'},token)).json();assert.equal(validCmsManifest(first.manifest),true);
 const active=(await request('GET','/content/staging')).json();assert.equal(active.npcs[0].name,npc.name);
 s=await get();await request('PUT','/admin/cms/draft',{revision:s.revision,npcs:[{...npc,name:'Tên mới'}],note:'Edit draft independently'},token);assert.equal((await request('GET','/content/staging')).json().npcs[0].name,npc.name);assert.equal((await request('GET','/admin/cms/preview',undefined,token)).json().npcs[0].name,'Tên mới');
 for(const status of ['reviewed','approved']){s=await get();await request('PUT','/admin/cms/review',{revision:s.revision,status,note:'Review second release content'},token);}s=await get();await request('POST','/admin/cms/publish',{revision:s.revision,baseVersion:s.baseVersion,note:'Publish second CMS release'},token);
 s=await get();await request('POST','/admin/cms/rollback',{revision:s.revision,id:first.id,note:'Restore first immutable snapshot'},token);assert.deepEqual((await request('GET','/content/staging')).json(),active);
 const values=new Map<string,string>(),storage={getItem:(key:string)=>values.get(key)??null,setItem:(key:string,v:string)=>{values.set(key,v);}};assert.deepEqual(await loadCms(async()=>active,storage),active);assert.deepEqual(await loadCms(async()=>{throw Error('Offline');},storage),active);assert.equal(await loadCms(async()=>({schema:2}),storage,true),null);assert.deepEqual(await loadCms(async()=>({...active,baseVersion:'bad'}),storage),active);
 const audit=(await request('GET','/admin/audit',undefined,token)).json();assert.ok(audit.some((a:any)=>a.action==='cms.publish.staging'));assert.ok(audit.some((a:any)=>a.action==='cms.rollback.staging'));
 }finally{await app.close();}
});
