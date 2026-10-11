// Bounded WAN acceptance using disposable profiles and real parent-issued tickets.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {randomBytes}=require('node:crypto'),{Client}=require('@colyseus/sdk');
const origin=process.env.SOAK_ORIGIN||'https://ltt.vui-hoc.xyz';
const seconds=Number(process.env.SOAK_SECONDS||300);
assert.ok(Number.isInteger(seconds)&&seconds>=60&&seconds<=3600,'SOAK_SECONDS must be 60–3600');
const output=path.resolve(__dirname,'../../temp/deploy/qa/soak-private.json');
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(fn,label,timeout=10000){const end=performance.now()+timeout;while(performance.now()<end){if(fn())return;await wait(50);}throw Error(label+' timeout');}
const report={origin,requestedSeconds:seconds,clients:4,startedAt:new Date().toISOString(),ok:false,reconnections:[],warnings:[],errors:[]};
let token='',interrupted=false;const slots=[],rtts=[],pending=new Map();let sent=0,corrections=0;
process.on('SIGINT',()=>interrupted=true);process.on('SIGTERM',()=>interrupted=true);
const request=async(route,body,method='POST')=>{
 const response=await fetch(origin+'/api'+route,{method,headers:{...(body===undefined?{}:{'Content-Type':'application/json'}),...(token?{Authorization:'Bearer '+token}:{})},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(15000)});
 assert.ok(response.ok,route+' HTTP '+response.status);return response.json();
};
function bind(slot,room){
 slot.room=room;slot.progress=null;slot.activities=null;slot.activitiesReceived=false;slot.version='';room.reconnection.enabled=false;
 room.onMessage('content-version',v=>slot.version=v);
 room.onMessage('progress-state',v=>slot.progress=v);
 room.onMessage('activities-state',v=>{slot.activities=v.snapshot;slot.activitiesReceived=true;});
 room.onMessage('storage-warning',()=>report.warnings.push('storage-warning'));
 room.onMessage('correction',()=>corrections++);
 room.onMessage('emote',()=>{});
 room.onMessage('probe',v=>{const start=pending.get(v);if(start!==undefined){rtts.push(performance.now()-start);pending.delete(v);}});
 room.onError(code=>report.errors.push('room-error-'+code));
 room.send('ready');
}
async function verifyReady(slot){await until(()=>slot.progress&&slot.version&&slot.room.state.players.size===4,'ready');assert.equal(slot.version,report.contentVersion);assert.equal(slot.progress.first.introSeen,true);assert.deepEqual(slot.progress.campaign.receipts,[]);}
(async()=>{
 try{
  const health=await request('/health',undefined,'GET');assert.equal(health.storage,'mysql');report.contentVersion=health.contentVersion;
  const alias='soak-'+Date.now(),password=randomBytes(24).toString('base64url');
  await request('/parents',{alias,password});token=(await request('/sessions',{alias,password})).token;
  const sdk=new Client(origin+'/colyseus');let invitation;
  for(let i=0;i<4;i++){
   const profile=await request('/profiles',{age:['3-5','6-8','9-11','3-5'][i]});
   const ticket=await request('/invites',i?{profileId:profile.id,invitation:invitation.friendInvitation}:{profileId:profile.id});if(!i)invitation=ticket;
   const slot={profileId:profile.id,seq:0};slots.push(slot);
   bind(slot,await sdk.joinOrCreate('private-friend',{roomCode:ticket.roomCode,ticket:ticket.ticket}));
   slot.room.send('story',{type:'enter'});
  }
  for(const slot of slots)await verifyReady(slot);
  slots[0].room.send('activities-save',{id:'soak-marker',snapshot:{practice:['mg.rice-count']}});
  await until(()=>slots[0].activities?.practice?.includes('mg.rice-count'),'activity save');
  const start=performance.now();let nextProbe=0,nextReconnect=60,nextLog=30,tick=0;
  while(performance.now()-start<seconds*1000){
   if(interrupted)throw Error('Interrupted');const elapsed=(performance.now()-start)/1000;
   for(const slot of slots)slot.room.send('move',{x:Math.sin(tick*.08)*8,y:-640,direction:tick%8,moving:true,seq:slot.seq++});tick++;
   if(elapsed>=nextProbe){
    for(const slot of slots){assert.equal(slot.room.state.players.size,4,'All clients retain four players');assert.ok(slot.room.state.npcs.size>=6,'NPC state retained');const id=++sent;pending.set(id,performance.now());slot.room.send('probe',id);}
    nextProbe=elapsed+1;
   }
   if(elapsed>=nextReconnect&&elapsed+10<seconds){
    // Drain probes before the deliberate outage; losing an in-flight packet
    // while closing its socket would measure the test injection itself.
    await until(()=>pending.size===0,'probes before simulated outage');
    const index=(nextReconnect/60-1)%4,slot=slots[index],old=slot.room,sessionId=old.sessionId,reconnectionToken=old.reconnectionToken;
    const began=performance.now();old.connection.close(4001,'QA simulated interruption');await wait(1000);
    bind(slot,await sdk.reconnect(reconnectionToken));assert.equal(slot.room.sessionId,sessionId,'Reconnection retains session identity');await verifyReady(slot);
    slot.room.send('ready');await until(()=>slot.activitiesReceived,'restored activities');if(index===0)assert.ok(slot.activities.practice.includes('mg.rice-count'));
    for(const peer of slots)await until(()=>peer.room.state.players.size===4,'peer roster after reconnect');
    report.reconnections.push({client:index,recoveredMs:Math.round(performance.now()-began)});nextReconnect+=60;
   }
   for(const sentAt of pending.values())assert.ok(performance.now()-sentAt<10000,'Probe exceeded 10 seconds');
   if(elapsed>=nextLog){console.log('SOAK '+Math.floor(elapsed)+'s: '+rtts.length+' probes, '+report.reconnections.length+' reconnects');nextLog+=30;}
   await wait(200);
  }
  report.actualSeconds=Math.round((performance.now()-start)/1000);
  await until(()=>pending.size===0,'final probes');
  for(const slot of slots){await verifyReady(slot);const saved=await request('/profiles/'+slot.profileId+'/progress',undefined,'GET');assert.equal(saved.trusted.chapterOne.introSeen,true);assert.deepEqual(saved.trusted.campaign.receipts,[]);assert.deepEqual(saved.receipts,[]);}
  const saved=await request('/profiles/'+slots[0].profileId+'/progress',undefined,'GET');assert.ok(saved.activities.practice.includes('mg.rice-count'));
  assert.deepEqual(report.warnings,[]);assert.deepEqual(report.errors,[]);assert.equal(corrections,0,'Normal movement must remain accepted');
  rtts.sort((a,b)=>a-b);report.probes={sent,received:rtts.length,p95Ms:Math.round(rtts[Math.floor(rtts.length*.95)]),maxMs:Math.round(rtts.at(-1))};assert.equal(sent,rtts.length);assert.ok(report.probes.p95Ms<3000,'WAN p95 exceeds 3s');
  report.corrections=corrections;report.progressPreserved=true;report.activityPreserved=true;report.ok=true;
 }catch(error){report.failure=error.message;process.exitCode=1;}
 finally{
  const cleanupErrors=[];
  for(const slot of slots){try{if(slot.room?.connection.isOpen)await slot.room.leave();}catch{cleanupErrors.push('room leave failed');}}
  if(token){try{await request('/parents/me',undefined,'DELETE');report.qaAccountDeleted=true;}catch{cleanupErrors.push('QA account deletion failed');}}
  if(cleanupErrors.length){report.cleanupErrors=cleanupErrors;report.ok=false;process.exitCode=1;}
  report.finishedAt=new Date().toISOString();fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
 }
})().catch(error=>{console.error(error.message);process.exitCode=1;});
