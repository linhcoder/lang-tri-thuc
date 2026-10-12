// Bounded signed staging load. Only accounts created by this invocation are mutated/deleted.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{performance}=require('node:perf_hooks'),{Client}=require('@colyseus/sdk');
const origin=process.env.QA_ORIGIN||'https://ltt.vui-hoc.xyz',seconds=Number(process.env.LIVE_LOAD_SECONDS||900),clients=Number(process.env.LIVE_LOAD_CLIENTS||100);
assert.ok(Number.isInteger(seconds)&&seconds>=60&&seconds<=3600);assert.ok(Number.isInteger(clients)&&clients>=10&&clients<=100&&clients%5===0);
const output=path.resolve(__dirname,'../../temp/deploy/qa/live-load');fs.mkdirSync(output,{recursive:true});const fixtureFile=path.join(output,'sessions.json');
const report={ok:false,clients,rooms:clients/5,requestedSeconds:seconds,startedAt:new Date().toISOString(),samples:[],reconnects:[],warnings:[],errors:[]},accounts=[],slots=[],pending=new Map(),rtts=[];let sequence=0,corrections=0,interrupted=false;
const pause=ms=>new Promise(r=>setTimeout(r,ms));process.on('SIGINT',()=>interrupted=true);
const save=()=>fs.writeFileSync(fixtureFile,JSON.stringify(accounts));
async function req(route,method='GET',body,token){
 for(let attempt=0;attempt<3;attempt++){const r=await fetch(origin+'/api'+route,{method,signal:AbortSignal.timeout(20000),headers:{...(body?{'Content-Type':'application/json'}:{}),...(token?{Authorization:'Bearer '+token}:{})},body:body?JSON.stringify(body):undefined});if(r.status===429){await pause(61000);continue;}assert.ok(r.ok,route+' HTTP '+r.status);await pause(650);return r.json();}throw Error('Rate limit did not recover');
}
async function until(fn,label){for(let i=0;i<600;i++){if(fn())return;await pause(25);}throw Error(label+' timeout');}
function bind(slot,room){slot.room=room;room.reconnection.enabled=false;room.onMessage('content-version',v=>slot.version=v);room.onMessage('progress-state',()=>{});room.onMessage('activities-state',v=>{if(v.id)slot.ack=v.id;});room.onMessage('expansion-state',()=>{});room.onMessage('expansion-feedback',()=>{});room.onMessage('emote',()=>{});room.onMessage('storage-warning',()=>report.warnings.push('storage-warning'));room.onMessage('correction',()=>corrections++);room.onMessage('probe',id=>{const start=pending.get(id);if(start!==undefined){rtts.push(performance.now()-start);pending.delete(id);}});room.onError(code=>report.errors.push(code));room.send('ready');}
(async()=>{const sdk=new Client(origin+'/colyseus'),stamp=Date.now();
try{
 const health=await req('/ready');assert.equal(health.storage,'mysql');report.contentVersion=health.contentVersion;
 for(let group=0;group<clients/5;group++){
  const account={alias:'production-load-'+stamp+'-'+group,password:'BoundedLoadFixture!'+stamp+'-'+group,profiles:[]};await req('/parents','POST',{alias:account.alias,password:account.password});accounts.push(account);save();account.token=(await req('/sessions','POST',{alias:account.alias,password:account.password})).token;save();let owner;
  for(let i=0;i<5;i++){const profile=await req('/profiles','POST',{age:'3-5'},account.token);account.profiles.push(profile.id);save();if(i===4)owner=await req('/invites','POST',{profileId:account.profiles[0],roomCode:owner.roomCode},account.token);const ticket=await req('/invites','POST',{profileId:profile.id,...(i?{invitation:owner.friendInvitation}:{})},account.token);if(!i)owner=ticket;const slot={profileId:profile.id,token:account.token,seq:0,version:'',group};bind(slot,await sdk.joinOrCreate('private-friend',{roomCode:ticket.roomCode,ticket:ticket.ticket}));slots.push(slot);await until(()=>slot.version===report.contentVersion,'content handshake');}
  console.log('Prepared '+slots.length+'/'+clients+' signed MySQL clients');
 }
 const roomIds=new Set(slots.map(s=>s.room.roomId));assert.equal(roomIds.size,clients/5);report.processes=Array.from(new Set(slots.map(s=>s.room.connection?.url?.split('/').slice(3,5).join('/')).filter(Boolean)));
 assert.equal(report.processes.length,2,'Rooms must use both Redis-coordinated processes');report.apiInstances=[];for(let i=0;i<8;i++){const h=await req('/health');if(!report.apiInstances.includes(h.instance))report.apiInstances.push(h.instance);}assert.deepEqual(report.apiInstances.sort(),['a','b']);
 const began=performance.now();let nextProbe=0,nextSave=0,nextReconnect=60,nextLog=0,tick=0;
 while(performance.now()-began<seconds*1000){if(interrupted)throw Error('Interrupted');const elapsed=(performance.now()-began)/1000;
  for(const slot of slots)slot.room.send('move',{x:Math.sin(tick*.08)*8,y:-640,direction:tick%8,moving:true,seq:slot.seq++});tick++;
  if(elapsed>=nextProbe){for(const slot of slots){assert.equal(slot.room.state.players.size,5);const id=++sequence;pending.set(id,performance.now());slot.room.send('probe',id);}nextProbe=elapsed+5;}
  if(elapsed>=nextSave){for(let i=0;i<slots.length;i+=5){const slot=slots[i],id='load-'+sequence+'-'+i;slot.ack='';slot.room.send('activities-save',{id,snapshot:{expansionProgress:{'flower-care':{step:Math.floor(elapsed/30)%2?0:2,age:'3-5',updated:Date.now()}}}});slot.expectedAck=id;}await until(()=>slots.filter((_,i)=>i%5===0).every(s=>s.ack===s.expectedAck),'MySQL snapshots');nextSave=elapsed+30;}
  if(elapsed>=nextReconnect&&elapsed+15<seconds){await until(()=>pending.size===0,'probe drain');const slot=slots[(Math.floor(nextReconnect/60)-1)*5%slots.length],old=slot.room,session=old.sessionId,token=old.reconnectionToken,start=performance.now();old.connection.close(4001,'Bounded staging QA reconnect');await pause(500);bind(slot,await sdk.reconnect(token));assert.equal(slot.room.sessionId,session);await until(()=>slot.version===report.contentVersion,'reconnect handshake');report.reconnects.push({ms:Math.round(performance.now()-start)});nextReconnect+=60;}
  assert.ok(Array.from(pending.values()).every(start=>performance.now()-start<15000),'WAN probe timeout');
  if(elapsed>=nextLog){report.samples.push({seconds:Math.round(elapsed),probes:rtts.length,heapBytes:process.memoryUsage().heapUsed});console.log('LIVE LOAD '+Math.round(elapsed)+'s · '+rtts.length+' probes · '+clients+' clients');nextLog+=30;}
  await pause(200);
 }
 await until(()=>pending.size===0,'final probes');rtts.sort((a,b)=>a-b);report.actualSeconds=Math.round((performance.now()-began)/1000);report.probes={sent:sequence,received:rtts.length,p95Ms:rtts[Math.floor(rtts.length*.95)],maxMs:rtts.at(-1)};assert.equal(sequence,rtts.length);assert.equal(corrections,0);assert.deepEqual(report.errors,[]);assert.deepEqual(report.warnings,[]);assert.ok(report.probes.p95Ms<2000);
 const durable=await req('/profiles/'+slots[0].profileId+'/progress','GET',undefined,slots[0].token);assert.ok(durable.activities.expansionProgress['flower-care']);assert.equal(durable.receipts.length,0);report.mysqlCheckpointDurable=true;report.ok=true;
}catch(e){report.failure=e.message;process.exitCode=1;}finally{
 await Promise.allSettled(slots.map(s=>s.room.leave()));const leftover=[];
 for(const account of accounts){try{if(!account.token)account.token=(await req('/sessions','POST',{alias:account.alias,password:account.password})).token;await req('/parents/me','DELETE',undefined,account.token);}catch{leftover.push(account);}}
 report.cleanedAccounts=accounts.length-leftover.length;if(leftover.length){report.ok=false;report.cleanupPending=leftover.length;fs.writeFileSync(fixtureFile,JSON.stringify(leftover));process.exitCode=1;}else fs.rmSync(fixtureFile,{force:true});report.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({ok:report.ok,clients,actualSeconds:report.actualSeconds,probes:report.probes,cleanedAccounts:report.cleanedAccounts,failure:report.failure}));
}})().catch(e=>{console.error(e.message);process.exitCode=1;});
