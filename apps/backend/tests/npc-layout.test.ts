import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createApi} from '../src/main';
import {SqliteRepository} from '../src/Store';
test('NPC layout saves a swap atomically, permits no note, and rejects stale or invalid batches',async()=>{
 const app=await createApi({store:new SqliteRepository(),adminPassword:'NpcLayoutAdmin123!',roomSecret:'npc-layout-test-secret-at-least-32'});
 try{
  const call=(method:any,url:string,payload?:any,token='')=>app.inject({method,url,payload,headers:token?{authorization:'Bearer '+token}:{}});
  const token=(await call('POST','/sessions',{alias:'admin',password:'NpcLayoutAdmin123!'})).json().token;
  const catalog=(await call('GET','/admin/catalog',undefined,token)).json();
  const clean=(n:any)=>({id:n.id,name:n.name,x:n.x,y:n.y});
  const before=['anh-nam','chi-mai'].map(id=>clean(catalog.npcs.find((n:any)=>n.id===id)));
  const values=[{...before[0],x:before[1].x,y:before[1].y},{...before[1],x:before[0].x,y:before[0].y}],body={values,previous:before};
  assert.equal((await call('PUT','/admin/npc-layout',body)).statusCode,401);
  const result=await call('PUT','/admin/npc-layout',body,token);assert.equal(result.statusCode,200,result.body);assert.equal(result.json().count,2);
  let saved=(await call('GET','/admin/catalog',undefined,token)).json();assert.deepEqual(values.map(n=>clean(saved.npcs.find((r:any)=>r.id===n.id))),values);assert.equal(saved.npcs.find((n:any)=>n.id===before[0].id).reviewRecord.note,'');
  assert.equal((await call('PUT','/admin/npc-layout',body,token)).statusCode,409);
  assert.equal((await call('PUT','/admin/npc-layout',{previous:values,values:[{...values[0],x:12,y:25},{...values[1],name:'Must not persist'}]},token)).statusCode,400);
  saved=(await call('GET','/admin/catalog',undefined,token)).json();assert.deepEqual(values.map(n=>clean(saved.npcs.find((r:any)=>r.id===n.id))),values);
 }finally{await app.close();}
});
