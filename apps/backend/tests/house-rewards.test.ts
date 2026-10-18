import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createApi} from '../src/main';
import {SqliteRepository} from '../src/Store';
import {houseChallenge,houseIds,houseRewardIds} from '../../game-client/assets/scripts/world/HouseTasks';

test('house rewards validate age and answers, remain server owned, and grant each collectible once',async()=>{
 const store=new SqliteRepository(),app=await createApi({store,roomSecret:'house-rewards-test-secret-32-characters'});
 try{
  await app.inject({method:'POST',url:'/parents',payload:{alias:'house_parent',password:'HouseParentPassword123!'}});
  const session=(await app.inject({method:'POST',url:'/sessions',payload:{alias:'house_parent',password:'HouseParentPassword123!'}})).json(),headers={authorization:'Bearer '+session.token};
  const profile=(await app.inject({method:'POST',url:'/profiles',headers,payload:{label:'House learner',age:'6-8',gender:'male',avatar:0}})).json();
  const other=(await app.inject({method:'POST',url:'/profiles',headers,payload:{label:'Other learner',age:'3-5',gender:'male',avatar:0}})).json();
  const base='/profiles/'+profile.id+'/houses';
  assert.equal((await app.inject({method:'GET',url:base})).statusCode,401);
  assert.equal((await app.inject({method:'GET',url:'/profiles/not-owned/houses',headers})).statusCode,404);
  assert.deepEqual((await app.inject({method:'GET',url:base,headers})).json().rewards,[]);
  assert.equal((await app.inject({method:'POST',url:base+'/home/claim',headers,payload:{age:'6-8',answers:[0,0,0,0,0]}})).statusCode,422);
  assert.equal((await app.inject({method:'POST',url:base+'/home/claim',headers,payload:{age:'6-8',answers:[1,1]}})).statusCode,400);
  assert.equal((await app.inject({method:'POST',url:base+'/home/claim',headers,payload:{age:'3-5',answers:[1,1,0,2,1]}})).statusCode,422);
  assert.equal((await app.inject({method:'POST',url:base+'/unknown/claim',headers,payload:{age:'6-8',answers:[0,0,0,0,0]}})).statusCode,404);
  for(const id of houseIds){const payload={age:'6-8',answers:Array.from({length:5},(_,step)=>houseChallenge(id,step,'6-8').answer)},url=base+'/'+id+'/claim';
   const responses=await Promise.all([app.inject({method:'POST',url,headers,payload}),app.inject({method:'POST',url,headers,payload})]);
   assert.ok(responses.every(r=>r.statusCode===200));assert.equal(responses.filter(r=>r.json().newReward).length,1);
  }
  const earned=(await app.inject({method:'GET',url:base,headers})).json().rewards;
  assert.deepEqual(earned,houseIds.map(id=>houseRewardIds[id]));
  assert.deepEqual((await app.inject({method:'GET',url:'/profiles/'+other.id+'/houses',headers})).json().rewards,[]);
  // A forged local backup cannot add or replace authoritative collectibles.
  await store.transaction(d=>{d.progress[other.id]={revision:1,data:{upgrades:{houseSteps:{home:5},houseRewards:['tidy-mat']}},receipts:[]};});
  assert.deepEqual((await app.inject({method:'GET',url:'/profiles/'+other.id+'/houses',headers})).json().rewards,[]);
  await app.inject({method:'DELETE',url:'/profiles/'+profile.id,headers});
  await store.transaction(d=>assert.equal(d.houseRewards?.[profile.id],undefined));
  await store.transaction(d=>{(d.houseRewards??={})[other.id]=['tidy-mat'];});
  assert.equal((await app.inject({method:'DELETE',url:'/parents/me',headers})).statusCode,200);
  await store.transaction(d=>assert.equal(d.houseRewards?.[other.id],undefined));
 }finally{await app.close();}
});
