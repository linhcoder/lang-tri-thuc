import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createApi} from '../src/main';
import {SqliteRepository} from '../src/Store';
test('playtest feedback validates data, isolates parents, records admin updates and deletes on account removal',async()=>{
 const store=new SqliteRepository(),api=await createApi({store,roomSecret:'feedback-test-only-room-secret-32-chars',adminPassword:'FeedbackAdminFixture!'});
 const req=(method:any,url:string,payload?:any,token?:string)=>api.inject({method,url,payload,headers:token?{authorization:'Bearer '+token}:{}});
 try{
  const parent=async(alias:string)=>{await req('POST','/parents',{alias,password:'FeedbackParentFixture!'});return(await req('POST','/sessions',{alias,password:'FeedbackParentFixture!'})).json().token;};
  const a=await parent('parent-a'),b=await parent('parent-b'),admin=(await req('POST','/sessions',{alias:'admin',password:'FeedbackAdminFixture!'})).json().token;
  assert.equal((await req('GET','/feedback')).statusCode,401);assert.equal((await req('GET','/admin/feedback',undefined,a)).statusCode,401);
  const options=(await req('GET','/feedback/options',undefined,a)).json();assert.equal(options.games.length,12);
  const body={category:'difficulty',gameId:'mg.dong-ho',message:'Bé cần miếng tranh lớn hơn để dễ chạm.'};
  for(const invalid of [{...body,gameId:'fake'}, {...body,message:' '.repeat(12)}, {...body,category:'fake'}, {...body,message:'x'.repeat(1001)}])assert.equal((await req('POST','/feedback',invalid,a)).statusCode,400);
  const response=await req('POST','/feedback',body,a);assert.equal(response.statusCode,201);const row=response.json();assert.equal(row.status,'open');assert.equal((await req('GET','/feedback',undefined,a)).json().length,1);assert.equal((await req('GET','/feedback',undefined,b)).json().length,0);
  assert.equal((await req('DELETE','/feedback/'+row.id,undefined,b)).statusCode,404);assert.equal((await req('PUT','/admin/feedback/'+row.id,{status:'resolved',note:'Đã sửa.'},a)).statusCode,401);
  assert.equal((await req('GET','/admin/overview',undefined,admin)).json().openFeedback,1);
  const update=await req('PUT','/admin/feedback/'+row.id,{status:'planned',note:'Đang kiểm tra thao tác trên điện thoại.'},admin);assert.equal(update.statusCode,200);assert.equal((await req('GET','/feedback',undefined,a)).json()[0].status,'planned');assert.equal((await req('GET','/admin/audit',undefined,admin)).json().at(-1).action,'feedback.planned');
  assert.equal((await req('GET','/export',undefined,a)).json().feedback.length,1);assert.equal((await req('GET','/export',undefined,b)).json().feedback.length,0);
  await req('POST','/feedback',body,a);await req('POST','/feedback',body,a);assert.equal((await req('POST','/feedback',body,a)).statusCode,429);
  assert.equal((await req('DELETE','/feedback/'+row.id,undefined,a)).statusCode,200);assert.equal((await req('GET','/feedback',undefined,a)).json().length,2);
  await req('DELETE','/parents/me',undefined,a);assert.equal((await req('GET','/admin/feedback',undefined,admin)).json().length,0);
 }finally{await api.close();}
});
