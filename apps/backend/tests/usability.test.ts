import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createApi} from '../src/main';
import {SqliteRepository} from '../src/Store';

test('dashboard and API docs protect roles; profile editing and room list isolate owners',async()=>{
 const store=new SqliteRepository(),app=await createApi({store,roomSecret:'usability-fixture-room-secret-only',adminPassword:'UsabilityFixturePassword!'});
 const req=(method:any,url:string,payload?:any,token?:string)=>app.inject({method,url,payload,headers:token?{authorization:'Bearer '+token}:{}});
 try{
  for(const alias of ['owner','other'])assert.equal((await req('POST','/parents',{alias,password:'UsabilityParentPassword!'})).statusCode,201);
  const login=async(alias:string,password='UsabilityParentPassword!')=>(await req('POST','/sessions',{alias,password})).json().token;
  const a=await login('owner'),b=await login('other'),admin=await login('admin','UsabilityFixturePassword!');
  assert.equal((await req('GET','/me',undefined,a)).json().alias,'owner');
  const profile=(await req('POST','/profiles',{age:'3-5'},a)).json();
  assert.equal((await req('PUT','/profiles/'+profile.id,{label:'  Bé Mây  '},a)).json().label,'Bé Mây');
  assert.equal((await req('PUT','/profiles/'+profile.id,{label:'Không được đổi'},b)).statusCode,404);
  for(const label of ['', ' '.repeat(3),'x'.repeat(41)])assert.equal((await req('PUT','/profiles/'+profile.id,{label},a)).statusCode,400);
  const room=(await req('POST','/invites',{profileId:profile.id},a)).json();
  assert.equal((await req('GET','/rooms',undefined,b)).json().length,0);
  const ownRooms=(await req('GET','/rooms',undefined,a)).json();assert.equal(ownRooms[0].code,room.roomCode);assert.equal(ownRooms[0].owner,true);assert.equal('ticket' in ownRooms[0],false);
  await req('PUT','/rooms/'+room.roomCode,{locked:true},a);assert.equal((await req('GET','/rooms',undefined,a)).json()[0].locked,true);
  await store.transaction(d=>{d.rooms[room.roomCode].expires=Date.now()-1;});assert.equal((await req('GET','/rooms',undefined,a)).json().length,0);
  for(const path of ['/admin/overview','/admin/api-docs']){assert.equal((await req('GET',path)).statusCode,401);assert.equal((await req('GET',path,undefined,a)).statusCode,401);}
  const overview=(await req('GET','/admin/overview',undefined,admin)).json();assert.equal(overview.parents,2);assert.equal(overview.profiles,1);assert.equal(overview.activeRooms,0);assert.equal(overview.lessons,90);assert.equal(overview.review.draft+overview.review.reviewed+overview.review.approved,overview.chapters+overview.lessons+overview.npcs+overview.assets);
  assert.equal(JSON.stringify(overview).includes('passwordHash'),false);
  const doc=(await req('GET','/admin/api-docs',undefined,admin)).json();assert.equal(doc.openapi,'3.0.3');assert.ok(doc.paths['/profiles/{id}'].put.requestBody.content['application/json'].schema.properties.label);assert.ok(doc.paths['/profiles/{id}'].put.parameters.some((p:any)=>p.name==='id'&&p.required));assert.deepEqual(doc.paths['/health'].get.security,[]);assert.ok(!Object.keys(doc.paths).some(p=>p.startsWith('/internal/')));
  const failure=(await req('POST','/sessions',{alias:'owner',password:'wrong'})).json();assert.equal(failure.code,'INVALID_CREDENTIALS');assert.ok(failure.requestId);assert.match(failure.message,/mật khẩu/);
  const invalid=(await req('PUT','/profiles/'+profile.id,{label:'x'.repeat(41)},a)).json();assert.equal(invalid.code,'VALIDATION_ERROR');assert.ok(invalid.fields.length);
  assert.equal((await req('GET','/ready')).json().ok,true);
 }finally{await app.close();}
});

test('readiness fails safely when storage is unavailable',async()=>{
 let offline=false;const app=await createApi({store:{kind:'fixture',transaction:async(fn:any)=>{if(offline)throw Error('database-private-password');return fn({});},close:async()=>{}},roomSecret:'usability-fixture-room-secret-only'});
 try{offline=true;const response=await app.inject('/ready');assert.equal(response.statusCode,500);assert.equal(response.json().code,'SERVER_ERROR');assert.equal(response.body.includes('database-private-password'),false);}finally{await app.close();}
});

test('friendly errors preserve the HTTP rate-limit status',async()=>{
 const app=await createApi({store:new SqliteRepository(),roomSecret:'usability-fixture-room-secret-only'});
 try{for(let i=0;i<120;i++)assert.equal((await app.inject('/health')).statusCode,200);const response=await app.inject('/health');assert.equal(response.statusCode,429);assert.equal(response.json().code,'RATE_LIMITED');}finally{await app.close();}
});
