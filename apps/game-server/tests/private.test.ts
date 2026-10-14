import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {Client} from '@colyseus/sdk';
import {createApi} from '../../backend/src/main';
import {SqliteRepository} from '../../backend/src/Store';
import {startServer} from '../src/main';
import {MiniGameRules} from '../../game-client/assets/scripts/world/MiniGameRules';
import {CampaignEngine} from '../../game-client/assets/scripts/world/CampaignEngine';
import {ChapterOneProgress} from '../../game-client/assets/scripts/world/ChapterOneProgress';
import {toWorld} from '../../game-client/assets/scripts/world/VillageModel';
import {worldZones} from '../../game-client/assets/scripts/world/WorldZones';
import {journeyQuestions} from '../../game-client/assets/scripts/world/LevelJourney';
import {lessonQuestions} from '../../game-client/assets/scripts/world/EducationEngine';
import {mkdir,writeFile} from 'node:fs/promises';
const secret='integration-only-room-secret-32-characters-long';

test('personal learning survives entering a friend room while story stars remain verified',{timeout:30000},async()=>{
 const store=new SqliteRepository(),api=await createApi({store,roomSecret:secret});await api.listen({port:26618,host:'127.0.0.1'});
 const server=await startServer(26619,'127.0.0.1',{roomSecret:secret,apiUrl:'http://127.0.0.1:26618'});let room:any;
 const req=(method:any,url:string,payload?:any,token?:string)=>api.inject({method,url,payload,headers:token?{authorization:'Bearer '+token}:{}});
 try{
  await req('POST','/parents',{alias:'learning-history-parent',password:'LearningHistoryPassword123!'});const token=(await req('POST','/sessions',{alias:'learning-history-parent',password:'LearningHistoryPassword123!'})).json().token;
  const profile=(await req('POST','/profiles',{label:'Minh Anh',age:'3-5',gender:'female',avatar:2},token)).json(),solo=new CampaignEngine();
  solo.syncChapterOne({version:2,introSeen:true,greeted:true,accepted:true,planted:[0,1,2,3,4],countRound:3,rewardReceipts:['reward.star.ch01'],replayRound:null,legacyDemoBadge:false});
  for(let round=0;round<3;round++)solo.answerJourney('journey.village.1',round,journeyQuestions('journey.village.1',solo.data.age,lessonQuestions)[round].answer);
  solo.answerJourney('journey.village.2',0,journeyQuestions('journey.village.2',solo.data.age,lessonQuestions)[0].answer);
  assert.equal((await req('PUT',`/profiles/${profile.id}/progress`,{revision:0,campaign:JSON.stringify(solo.data)},token)).statusCode,200);
  const invitation=(await req('POST','/invites',{profileId:profile.id},token)).json();room=await new Client('http://127.0.0.1:26619').joinOrCreate('private-friend',{roomCode:invitation.roomCode,ticket:invitation.ticket});
  let progress:any;room.onMessage('content-version',()=>{});room.onMessage('activities-state',()=>{});room.onMessage('progress-state',(value:any)=>progress=value);room.onMessage('storage-warning',()=>{});room.send('ready');await until(()=>!!progress);
  const restored=new CampaignEngine();assert.equal(restored.restore(JSON.stringify(progress.campaign)),true);assert.equal(restored.xp,solo.xp);assert.equal(restored.level,solo.level);assert.equal(restored.stars,0);assert.equal(restored.journey.rounds['journey.village.2'],1);
  assert.equal(room.state.players.get(room.sessionId).name,'Minh Anh');assert.equal(room.state.players.get(room.sessionId).age,'3-5');
  for(const round of [1,2]){room.send('journey-answer',{id:'journey.village.2',round,index:journeyQuestions('journey.village.2','3-5',lessonQuestions)[round].answer});await until(()=>round===2?progress.campaign.journey.completed.includes('journey.village.2'):progress.campaign.journey.rounds['journey.village.2']===2);}
  assert.deepEqual(progress.campaign.receipts,[]);for(let i=0;i<100;i++){const saved=await store.transaction(d=>d.progress[profile.id]?.trusted?.campaign as any);if(saved?.journey.completed.includes('journey.village.2'))break;await wait(20);}
  const saved=(await req('GET',`/profiles/${profile.id}/play`,undefined,token)).json().progress.data;assert.ok(saved.journey.completed.includes('journey.village.2'));assert.deepEqual(saved.receipts,[]);
 }finally{await room?.leave();await server.gracefullyShutdown(false);await api.close();}
});
const wait=(ms:number)=>new Promise(r=>setTimeout(r,ms));
async function until(fn:()=>boolean){for(let i=0;i<150;i++){if(fn())return;await wait(30);}throw Error('Synchronization timeout');}
test('private rooms enforce invitations, authoritative results, emotes and 10/16/20 client load',{timeout:90000},async()=>{
 const store=new SqliteRepository(),api=await createApi({store,roomSecret:secret});await api.listen({port:26573,host:'127.0.0.1'});
 const server=await startServer(26574,'127.0.0.1',{roomSecret:secret,apiUrl:'http://127.0.0.1:26573'});let rooms:any[]=[];const metrics:any[]=[];
 let requestIndex=0;const req=async(url:string,body:any,token?:string,method:any='POST')=>api.inject({method,url,payload:body,remoteAddress:'10.0.'+Math.floor(++requestIndex/250)+'.'+(requestIndex%250+1),headers:token?{authorization:'Bearer '+token}:{}});
 try{
  await req('/parents',{alias:'load-owner',password:'IntegrationPassword123!'});const token=(await req('/sessions',{alias:'load-owner',password:'IntegrationPassword123!'})).json().token;
  await req('/parents',{alias:'load-friend',password:'IntegrationPassword123!'});const friend=(await req('/sessions',{alias:'load-friend',password:'IntegrationPassword123!'})).json().token;
  const profile=(await req('/profiles',{age:'3-5'},token)).json(),other=(await req('/profiles',{age:'3-5'},friend)).json();const invitation=(await req('/invites',{profileId:profile.id},token)).json();
  assert.equal((await req('/invites',{profileId:other.id,roomCode:invitation.roomCode},friend)).statusCode,403);
  const admitted=(await req('/invites',{profileId:other.id,invitation:invitation.friendInvitation},friend)).json();assert.equal(admitted.roomCode,invitation.roomCode);
  const client=new Client('http://127.0.0.1:26574');
  await assert.rejects(client.joinOrCreate('private-friend',{roomCode:invitation.roomCode,ticket:invitation.ticket+'bad'}));
  await req('/rooms/'+invitation.roomCode,{locked:true},token,'PUT');await assert.rejects(client.joinOrCreate('private-friend',{roomCode:invitation.roomCode,ticket:invitation.ticket}));await req('/rooms/'+invitation.roomCode,{locked:false},token,'PUT');
  const first=new ChapterOneProgress();Object.assign(first.data,{introSeen:true,greeted:true,accepted:true,planted:[0,1,2,3,4],countRound:3,rewardReceipts:['reward.star.ch01']});const campaign=new CampaignEngine();campaign.syncChapterOne(first.data);campaign.introduce(1);campaign.complete('q.ch02.learn-rules');
  await store.transaction(d=>{for(const id of [profile.id,other.id])d.progress[id]={revision:0,data:{},receipts:[],trusted:{chapterOne:first.data,campaign:campaign.data}};});
  const a=await client.joinOrCreate('private-friend',{roomCode:invitation.roomCode,ticket:invitation.ticket}),b=await client.joinOrCreate('private-friend',{roomCode:admitted.roomCode,ticket:admitted.ticket});rooms=[a,b];let progress:any,emotes=0,version='';a.onMessage('content-version',(v:string)=>version=v);b.onMessage('content-version',()=>{});
  a.onMessage('progress-state',v=>progress=v);a.onMessage('correction',()=>{});a.onMessage('storage-warning',()=>{});b.onMessage('progress-state',()=>{});b.onMessage('storage-warning',()=>{});b.onMessage('emote',()=>emotes++);a.onMessage('emote',()=>{});a.onMessage('blocked',()=>{});a.onMessage('report-sent',()=>{});
  a.send('ready');await until(()=>!!progress);assert.match(version,/^[a-f0-9]{8}$/);a.send('claim-star',{index:7});await wait(100);assert.equal(progress.campaign.receipts.length,1);
  a.send('journey-answer',{id:'journey.village.1',round:0,index:1});await wait(100);assert.equal(progress.campaign.journey.rounds['journey.village.1']??0,0);
  for(const [round,index] of [0,2,1].entries()){a.send('journey-answer',{id:'journey.village.1',round,index});await until(()=>round===2?progress.campaign.journey.completed.includes('journey.village.1'):progress.campaign.journey.rounds['journey.village.1']===round+1);}
  a.send('journey-answer',{id:'journey.village.1',round:2,index:1});await wait(100);assert.deepEqual(progress.campaign.journey.completed,['journey.village.1']);assert.equal(progress.campaign.receipts.length,1);
  a.send('move',{x:999,y:999,direction:0,moving:true,seq:1});await wait(100);assert.equal(a.state.players.get(a.sessionId).x,0);a.send('portal',{id:'farm'});await wait(100);assert.equal(a.state.players.get(a.sessionId).x,0);for(let n=1;n<=8;n++){a.send('move',{x:-16*n,y:-640-8*n,direction:4,moving:true,seq:n+1});await wait(150);}a.send('portal',{id:'farm'});await wait(100);assert.equal(a.state.players.get(a.sessionId).x,-128,'Low-level players cannot use the locked farm portal');a.send('portal',{id:'home'});const farm=toWorld(worldZones.find(z=>z.id==='home')!.spawn);await until(()=>a.state.players.get(a.sessionId).x===farm.x&&a.state.players.get(a.sessionId).y===farm.y);assert.equal(a.state.players.get(a.sessionId).y,farm.y);
  a.send('start-game',{questId:'q.ch02.play-o-an-quan'});await until(()=>!!b.state.gameJson);assert.equal(a.state.gameJson,b.state.gameJson);a.send('pause-game',{paused:true});await until(()=>JSON.parse(a.state.gameJson).paused===true);const pausedClock=JSON.parse(a.state.gameJson).clock;await wait(250);assert.equal(JSON.parse(a.state.gameJson).clock,pausedClock);a.send('pause-game',{paused:false});await until(()=>JSON.parse(a.state.gameJson).paused===false);
  const feedback:any[]=[],peerFeedback:any[]=[];a.onMessage('game-feedback',v=>feedback.push(v));b.onMessage('game-feedback',v=>peerFeedback.push(v));
  const acceptedTrace=JSON.stringify(JSON.parse(a.state.gameJson).actions),beforeRejection=JSON.stringify(await store.transaction(d=>d.progress[profile.id]));
  a.send('game-action',{type:'place',index:0});await until(()=>feedback.length===1);await wait(100);
  assert.equal(feedback[0].id,'mg.star-lantern');assert.equal(typeof feedback[0].message,'string');assert.ok(feedback[0].message.length>0&&feedback[0].message.length<=200);assert.deepEqual(peerFeedback,[]);
  assert.equal(JSON.stringify(JSON.parse(a.state.gameJson).actions),acceptedTrace);assert.equal(JSON.stringify(await store.transaction(d=>d.progress[profile.id])),beforeRejection);
  a.send('game-action',{type:'forged-win',index:0});await wait(100);assert.equal((await store.transaction(d=>d.progress[profile.id].receipts.length)),0);
  assert.equal(MiniGameRules.restore(JSON.parse(a.state.gameJson)).id,'mg.star-lantern');
  for(let index=0;index<5;index++){(index%2?a:b).send('game-action',{type:'part',index});await until(()=>MiniGameRules.restore(JSON.parse(a.state.gameJson)).data.selected===index);(index%2?b:a).send('game-action',{type:'place',index});await until(()=>MiniGameRules.restore(JSON.parse(a.state.gameJson)).data.placed.includes(index));}
  await until(()=>MiniGameRules.restore(JSON.parse(a.state.gameJson)).ended);await wait(250);assert.equal(await store.transaction(d=>d.progress[profile.id].receipts.length),1);assert.equal(await store.transaction(d=>d.progress[other.id].receipts.length),1);
  a.send('emote',{id:'free-text'});a.send('emote',{id:'hello'});await until(()=>emotes===1);a.send('emote',{id:'happy'});await wait(100);assert.equal(emotes,1);
  a.send('report',{sessionId:b.sessionId,reason:'uncomfortable'});await wait(150);assert.equal((await store.transaction(d=>d.reports.length)),1);
  await wait(2100);a.send('emote',{id:'happy'});await until(()=>emotes===2);
  for(const [i,id] of ['wave','sit','sad','jump'].entries()){await wait(2100);a.send('emote',{id});await until(()=>emotes===3+i);}
  a.send('block',{sessionId:b.sessionId});await wait(100);await wait(2100);a.send('emote',{id:'happy'});await wait(100);assert.equal(emotes,6);
  for(const r of rooms)await r.leave();rooms=[];
  // Independent authenticated profiles: no bypass or forged client progress.
  for(const count of [10,16,20]){
   const ids:string[]=[];const invitations:any[]=[];let roomCode='';
   for(let i=0;i<count;i++){const alias='load-'+count+'-'+i;await req('/parents',{alias,password:'IntegrationPassword123!'});const t=(await req('/sessions',{alias,password:'IntegrationPassword123!'})).json().token;const p=(await req('/profiles',{age:'3-5'},t)).json();ids.push(p.id);const inv=(await req('/invites',{profileId:p.id},t)).json();if(i===0)roomCode=inv.roomCode;invitations.push({token:t,profileId:p.id,own:inv});}
   // Populate the owner-approved parent membership in the test fixture, preserving real signed tickets.
   await store.transaction(d=>{const allowed=ids.map(id=>d.profiles[id].parentId);d.rooms[roomCode].allowedParents=allowed;});
   for(const inv of invitations){const ticket=(await req('/invites',{profileId:inv.profileId,roomCode},inv.token)).json().ticket;const r=await client.joinOrCreate('private-friend',{roomCode,ticket});r.onMessage('progress-state',()=>{});r.onMessage('correction',()=>{});r.onMessage('storage-warning',()=>{});rooms.push(r);}
   await until(()=>rooms.every(r=>r.state.players.size===count));const latencies:number[]=[];rooms.forEach(r=>r.onMessage('probe',v=>latencies.push(performance.now()-v)));
   const start=performance.now(),heapStart=process.memoryUsage().heapUsed;
   for(let tick=0;tick<60;tick++){for(const r of rooms){r.send('move',{x:Math.sin(tick*.05)*12,y:-640,direction:2,moving:true,seq:tick});if(tick%10===0)r.send('probe',performance.now());}await wait(50);}
   await until(()=>latencies.length===count*6);latencies.sort((a,b)=>a-b);metrics.push({clients:count,durationMs:performance.now()-start,probeSamples:latencies.length,p95RttMs:latencies[Math.floor(latencies.length*.95)],heapDeltaBytes:process.memoryUsage().heapUsed-heapStart});assert.ok(latencies[Math.floor(latencies.length*.95)]<1000);
   for(const r of rooms)await r.leave();rooms=[];
  }
  await mkdir('../../temp/private-room-qa',{recursive:true});await writeFile('../../temp/private-room-qa/report.json',JSON.stringify(metrics,null,2));console.log('Private room load:',JSON.stringify(metrics));
 }finally{for(const r of rooms)await r.leave();await server.gracefullyShutdown(false);await api.close();}
});
