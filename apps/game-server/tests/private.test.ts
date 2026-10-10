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
import {mkdir,writeFile} from 'node:fs/promises';
const secret='integration-only-room-secret-32-characters-long';
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
  a.send('move',{x:999,y:999,direction:0,moving:true,seq:1});await wait(100);assert.equal(a.state.players.get(a.sessionId).x,0);a.send('portal',{id:'farm'});await wait(100);assert.equal(a.state.players.get(a.sessionId).x,0);for(let n=1;n<=4;n++){a.send('move',{x:-16*n,y:-640-8*n,direction:4,moving:true,seq:n+1});await wait(150);}a.send('portal',{id:'farm'});const farm=toWorld(worldZones.find(z=>z.id==='farm')!.spawn);await until(()=>a.state.players.get(a.sessionId).x===farm.x&&a.state.players.get(a.sessionId).y===farm.y);assert.equal(a.state.players.get(a.sessionId).y,farm.y);
  a.send('start-game',{questId:'q.ch02.play-o-an-quan'});await until(()=>!!b.state.gameJson);assert.equal(a.state.gameJson,b.state.gameJson);a.send('pause-game',{paused:true});await until(()=>JSON.parse(a.state.gameJson).paused===true);const pausedClock=JSON.parse(a.state.gameJson).clock;await wait(250);assert.equal(JSON.parse(a.state.gameJson).clock,pausedClock);a.send('pause-game',{paused:false});await until(()=>JSON.parse(a.state.gameJson).paused===false);
  a.send('game-action',{type:'forged-win',index:0});await wait(100);assert.equal((await store.transaction(d=>d.progress[profile.id].receipts.length)),0);
  for(let turn=0;turn<130;turn++){const g=MiniGameRules.restore(JSON.parse(a.state.gameJson));if(g.ended)break;(turn%2?a:b).send('game-action',{type:'pit',index:g.data.board.slice(0,5).findIndex((n:number)=>n>0)});await wait(100);}
  await until(()=>MiniGameRules.restore(JSON.parse(a.state.gameJson)).ended);await wait(250);assert.equal(await store.transaction(d=>d.progress[profile.id].receipts.length),1);assert.equal(await store.transaction(d=>d.progress[other.id].receipts.length),1);
  a.send('emote',{id:'free-text'});a.send('emote',{id:'hello'});await until(()=>emotes===1);a.send('emote',{id:'happy'});await wait(100);assert.equal(emotes,1);
  a.send('report',{sessionId:b.sessionId,reason:'uncomfortable'});await wait(150);assert.equal((await store.transaction(d=>d.reports.length)),1);
  await wait(2100);a.send('emote',{id:'happy'});await until(()=>emotes===2);
  a.send('block',{sessionId:b.sessionId});await wait(100);await wait(2100);a.send('emote',{id:'happy'});await wait(100);assert.equal(emotes,2);
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
