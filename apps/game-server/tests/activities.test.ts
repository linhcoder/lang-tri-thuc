import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Client} from '@colyseus/sdk';
import {createApi} from '../../backend/src/main';
import {SqliteRepository} from '../../backend/src/Store';
import {startServer} from '../src/main';
import {MiniGameRules} from '../../game-client/assets/scripts/world/MiniGameRules';
const pause=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(check:()=>boolean){for(let i=0;i<150;i++){if(check())return;await pause(30);}throw Error('Activities timeout');}
test('authenticated profile activities survive switching clients without granting story rewards',{timeout:30000},async()=>{
 const store=new SqliteRepository(),secret='activities-integration-secret-at-least-32-characters',api=await createApi({store,roomSecret:secret});
 await api.listen({port:26613,host:'127.0.0.1'});const server=await startServer(26614,'127.0.0.1',{roomSecret:secret,apiUrl:'http://127.0.0.1:26613'});let room:any;
 try{
  const request=async(url:string,payload:any,token?:string)=>{const result=await api.inject({method:'POST',url,payload,headers:token?{authorization:'Bearer '+token}:{}});assert.ok(result.statusCode<300,result.body);return result.json();};
  await request('/parents',{alias:'activities-parent',password:'ActivitiesTestPassword123!'});const {token}=await request('/sessions',{alias:'activities-parent',password:'ActivitiesTestPassword123!'}),profile=await request('/profiles',{age:'3-5'},token),invite=await request('/invites',{profileId:profile.id},token);
  let state:any,progress:any;const connect=async()=>{state=undefined;room=await new Client('http://127.0.0.1:26614').joinOrCreate('private-friend',{roomCode:invite.roomCode,ticket:invite.ticket});room.onMessage('content-version',()=>{});room.onMessage('progress-state',(v:any)=>progress=v);room.onMessage('activities-state',(v:any)=>state=v);room.onMessage('storage-warning',()=>{});room.send('ready');await until(()=>state!==undefined);};
  await connect();assert.equal(state.snapshot,null);const game=new MiniGameRules('mg.star-lantern','3-5');game.action('part',0);game.action('place',0);
  room.send('activities-save',{id:'one',snapshot:{expansion:['flower-care','fish-count','fake'],practice:['mg.star-lantern'],practiceResume:{'mg.star-lantern':game.save()},painting:[{color:3,points:[{x:0,y:0},{x:20,y:10}]}],care:{garden:3},holidayProgress:{tet:3},explored:['garden'],receipts:['reward.star.ch08'],completed:['q.ch08.restore']}});
  await until(()=>state?.id==='one');assert.equal(state.snapshot.painting.length,1);assert.equal(state.snapshot.receipts,undefined);assert.equal(progress.campaign.receipts.length,0);
  await room.leave();await pause(100);await connect();assert.deepEqual(state.snapshot.expansion,['flower-care','fish-count']);assert.equal(state.snapshot.holidayProgress.tet,3);assert.equal(state.snapshot.care.garden,3);assert.equal(state.snapshot.practiceResume['mg.star-lantern'].actions.length,2);assert.equal(state.snapshot.painting[0].color,3);
  room.send('activities-save',{id:'two',snapshot:{practice:[],practiceResume:{},painting:[],care:{garden:0},holidayProgress:{tet:0},explored:[]}});await until(()=>state?.id==='two');assert.equal(state.snapshot.painting.length,0);assert.equal(state.snapshot.care.garden,0);assert.equal(state.snapshot.practiceResume['mg.star-lantern'],undefined);assert.deepEqual(state.snapshot.expansion,['flower-care','fish-count']);assert.equal(state.snapshot.holidayProgress.tet,3);assert.deepEqual(state.snapshot.explored,['garden']);assert.deepEqual(state.snapshot.practice,['mg.star-lantern']);
  const record=await store.transaction(d=>d.progress[profile.id]);assert.equal(record.receipts.length,0);assert.equal(record.trusted,undefined);
  const unauthorized=await api.inject({method:'POST',url:'/internal/activities',payload:{profileId:profile.id,snapshot:'{}'}});assert.equal(unauthorized.statusCode,401);
 }finally{await room?.leave();await server.gracefullyShutdown(false);await api.close();}
});
