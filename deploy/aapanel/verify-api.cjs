const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const origin='https://ltt.vui-hoc.xyz',access=fs.readFileSync(path.resolve(__dirname,'../../temp/deploy/access.txt'),'utf8'),password=/^Admin password: (.+)$/m.exec(access)?.[1];assert.ok(password);
const request=(route,options={})=>fetch(origin+route,{...options,signal:AbortSignal.timeout(15000)});
(async()=>{
 const health=await (await request('/api/health')).json();assert.equal(health.storage,'mysql');
 assert.equal((await request('/')).status,401);assert.equal((await request('/api/internal/profile')).status,403);
 const response=await request('/api/sessions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({alias:'admin',password})});assert.equal(response.status,200);const session=await response.json();assert.equal(session.role,'admin');
 const headers={Authorization:'Bearer '+session.token};
 try{
  const lessons=await (await request('/api/admin/lessons',{headers})).json(),catalog=await (await request('/api/admin/catalog',{headers})).json();assert.equal(lessons.length,90);assert.equal(catalog.npcs.length,6);assert.equal(catalog.assets.length,24);
  const client=new (require('@colyseus/sdk').Client)(origin+'/colyseus');await assert.rejects(()=>client.joinOrCreate('village'));await assert.rejects(()=>client.joinOrCreate('private-friend',{roomCode:'TEST1234'}));
  const report={https:true,adminLogin:true,lessons:90,npcs:6,assets:24,anonymousUiBlocked:true,internalApiBlocked:true,developmentRoomBlocked:true,unsignedPrivateRoomBlocked:true,contentVersion:health.contentVersion};
  const output=path.resolve(__dirname,'../../temp/deploy/qa');fs.mkdirSync(output,{recursive:true});fs.writeFileSync(path.join(output,'api-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
 }finally{await request('/api/sessions',{method:'DELETE',headers});}
})().catch(error=>{console.error(error.message);process.exitCode=1;});
