import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createApi} from '../src/main';
import {SqliteRepository} from '../src/Store';
test('scene layouts persist atomically, reject invalid objects and stale edits, and require admin',async()=>{
 const store=new SqliteRepository(),app=await createApi({store,adminPassword:'SceneLayoutAdmin123!',roomSecret:'scene-layout-test-secret-at-least-32'});
 try{
  const request=(method:any,url:string,payload?:any,token='')=>app.inject({method,url,payload,headers:token?{authorization:'Bearer '+token}:{}});
  assert.equal((await request('GET','/admin/scene-layout')).statusCode,401);
  const token=(await request('POST','/sessions',{alias:'admin',password:'SceneLayoutAdmin123!'})).json().token;
  const scene=(await request('GET','/admin/scene',undefined,token)).json();assert.ok(scene.layoutObjects.some((o:any)=>o.id==='schoolyard.dirt-pitch'));assert.ok(scene.layoutObjects.some((o:any)=>o.id==='journey.village'));
  const initial=(await request('GET','/admin/scene-layout',undefined,token)).json();
  const pack={version:1,placements:[{id:'schoolyard.dirt-pitch',x:46.25,y:34,width:420,height:280}]},body={revision:initial.revision,pack,note:'Move and resize football pitch for layout test'};
  assert.equal((await request('PUT','/admin/scene-layout',body,token)).statusCode,200);
  assert.equal((await request('PUT','/admin/scene-layout',body,token)).statusCode,409);
  const persisted=(await request('GET','/admin/scene-layout',undefined,token)).json();assert.deepEqual(persisted.pack,pack);
  for(const placements of [[{...pack.placements[0],width:-1}],[{...pack.placements[0],x:72}],[{...pack.placements[0],id:'not-real'}],[{...pack.placements[0],id:'bridge'}],[pack.placements[0],pack.placements[0]]]){
   assert.equal((await request('PUT','/admin/scene-layout',{...body,revision:persisted.revision,pack:{version:1,placements}},token)).statusCode,400);
  }
  assert.deepEqual((await request('GET','/admin/scene-layout',undefined,token)).json(),persisted);
 }finally{await app.close();}
});
