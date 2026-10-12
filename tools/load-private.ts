// Bounded local load only: isolated SQLite, actual HTTP service and signed SDK joins.
import assert from 'node:assert/strict';
import {monitorEventLoopDelay,performance} from 'node:perf_hooks';
import {mkdir,writeFile} from 'node:fs/promises';
import {Client,Room} from '@colyseus/sdk';
import {createApi} from '../apps/backend/src/main';
import {SqliteRepository} from '../apps/backend/src/Store';
import {startServer} from '../apps/game-server/src/main';
const seconds=Number(process.env.LOAD_SECONDS||300),count=Number(process.env.LOAD_CLIENTS||50);
assert.ok(Number.isInteger(seconds)&&seconds>=30&&seconds<=900);assert.ok(Number.isInteger(count)&&count>=5&&count<=100&&count%5===0);
const secret='local-load-fixture-only-secret-32-chars',store=new SqliteRepository(),sdk=new Client('http://127.0.0.1:33111');
const report:any={requestedSeconds:seconds,clients:count,rooms:count/5,startedAt:new Date().toISOString(),samples:[],reconnections:[],warnings:[],errors:[],ok:false};
const slots:Array<{room:Room<any>;seq:number;version:string}>=[],tokens:string[]=[],pending=new Map<number,number>(),latencies:number[]=[];let sent=0,corrections=0,index=0,interrupted=false;
const wait=(ms:number)=>new Promise(r=>setTimeout(r,ms));process.on('SIGINT',()=>interrupted=true);
async function until(fn:()=>boolean,label:string,timeout=15000){const end=performance.now()+timeout;while(performance.now()<end){if(fn())return;await wait(25);}throw Error(label+' timeout');}
function bind(slot:typeof slots[number],room:Room<any>){slot.room=room;room.reconnection.enabled=false;slot.version='';room.onMessage('content-version',v=>slot.version=v);room.onMessage('progress-state',()=>{});room.onMessage('activities-state',()=>{});room.onMessage('emote',()=>{});room.onMessage('storage-warning',()=>report.warnings.push('storage-warning'));room.onMessage('correction',()=>corrections++);room.onError(code=>report.errors.push('room-error-'+code));room.onMessage('probe',id=>{const start=pending.get(id);if(start!==undefined){latencies.push(performance.now()-start);pending.delete(id);}});room.send('ready');}
(async()=>{const api=await createApi({store,roomSecret:secret}),delay=monitorEventLoopDelay({resolution:20});let server;
 const req=async(method:any,url:string,body?:any,token?:string)=>{const r=await api.inject({method,url,payload:body,remoteAddress:'10.50.0.'+(++index%250+1),headers:token?{authorization:'Bearer '+token}:{}});assert.ok(r.statusCode<300,url+' HTTP '+r.statusCode);return r.json();};
 try{
  await api.listen({host:'127.0.0.1',port:33110});server=await startServer(33111,'127.0.0.1',{roomSecret:secret,apiUrl:'http://127.0.0.1:33110'});
  for(let group=0;group<count/5;group++){const alias='local-load-'+group,password='LocalLoadFixturePassword!';await req('POST','/parents',{alias,password});const token=(await req('POST','/sessions',{alias,password})).token;tokens.push(token);let roomCode='';for(let j=0;j<5;j++){const p=await req('POST','/profiles',{age:'3-5'},token),invite=await req('POST','/invites',{profileId:p.id,...(roomCode?{roomCode}:{})},token);roomCode=invite.roomCode;const slot={room:await sdk.joinOrCreate<any>('private-friend',{roomCode,ticket:invite.ticket}),seq:1,version:''};bind(slot,slot.room);slots.push(slot);}}
  await until(()=>slots.every(s=>s.version&&s.room.state.players.size===5),'all clients ready');report.contentVersion=slots[0].version;assert.ok(slots.every(s=>s.version===report.contentVersion));
  delay.enable();const start=performance.now();let tick=0,nextProbe=0,nextLog=0,nextReconnect=60;
  while(performance.now()-start<seconds*1000){if(interrupted)throw Error('Interrupted');const elapsed=(performance.now()-start)/1000;
   for(const s of slots)s.room.send('move',{x:Math.sin(tick*.08)*8,y:-640,direction:tick%8,moving:true,seq:s.seq++});tick++;
   if(elapsed>=nextProbe){for(const s of slots){assert.equal(s.room.state.players.size,5);assert.ok(s.room.state.npcs.size>=6);const id=++sent;pending.set(id,performance.now());s.room.send('probe',id);}nextProbe=elapsed+5;}
   if(elapsed>=nextReconnect&&elapsed+10<seconds){await until(()=>pending.size===0,'drain probes');const slot=slots[(Math.floor(nextReconnect/60)-1)*5%slots.length],old=slot.room,id=old.sessionId,token=old.reconnectionToken,began=performance.now();old.connection.close(4001,'Local QA interruption');await wait(500);bind(slot,await sdk.reconnect<any>(token));assert.equal(slot.room.sessionId,id);await until(()=>slot.version===report.contentVersion&&slots.every(s=>s.room.state.players.size===5),'reconnect roster');report.reconnections.push({recoveredMs:Math.round(performance.now()-began)});nextReconnect+=60;}
   for(const at of pending.values())assert.ok(performance.now()-at<10000,'probe timeout');
   if(elapsed>=nextLog){const memory=process.memoryUsage();report.samples.push({seconds:Math.round(elapsed),heapUsedBytes:memory.heapUsed,rssBytes:memory.rss,eventLoopP95Ms:delay.percentile(95)/1e6});console.log('LOAD '+Math.round(elapsed)+'s · '+latencies.length+' probes · '+count+' clients');nextLog+=30;}
   await wait(200);
  }
  await until(()=>pending.size===0,'final probes');latencies.sort((a,b)=>a-b);report.actualSeconds=Math.round((performance.now()-start)/1000);report.probes={sent,received:latencies.length,p95Ms:latencies[Math.floor(latencies.length*.95)],maxMs:latencies.at(-1)};report.corrections=corrections;assert.equal(sent,latencies.length);assert.equal(corrections,0);assert.deepEqual(report.warnings,[]);assert.deepEqual(report.errors,[]);assert.ok(report.probes.p95Ms<1000);report.ok=true;
 }catch(e){report.failure=(e as Error).message;process.exitCode=1;}finally{
  delay.disable();const cleanup=await Promise.allSettled(slots.map(s=>s.room.leave()));if(cleanup.some(r=>r.status==='rejected'))report.cleanupError='room leave';
  for(const token of tokens){try{await req('DELETE','/parents/me',undefined,token);}catch{report.cleanupError='account deletion';}}
  report.fixtureEmpty=await store.transaction(d=>Object.keys(d.parents).length===0&&Object.keys(d.profiles).length===0&&Object.keys(d.rooms).length===0);if(!report.fixtureEmpty||report.cleanupError){report.ok=false;process.exitCode=1;}
  await server?.gracefullyShutdown(false);await api.close();report.finishedAt=new Date().toISOString();await mkdir('temp/load-private',{recursive:true});await writeFile('temp/load-private/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify({ok:report.ok,clients:count,actualSeconds:report.actualSeconds,probes:report.probes,reconnects:report.reconnections.length,failure:report.failure}));
 }
})().catch(e=>{console.error(e.message);process.exitCode=1;});
