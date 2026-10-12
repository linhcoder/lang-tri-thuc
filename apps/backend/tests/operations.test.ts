import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {operationalStatus} from '../src/Operations';
import {createApi} from '../src/main';
import {SqliteRepository} from '../src/Store';
test('operational status bounds exposed fields and marks missing/stale results unknown',async()=>{
 const folder=await mkdtemp(join(tmpdir(),'ltt-ops-')),file=join(folder,'status.json');
 try{
  assert.equal((await operationalStatus(file)).stale,true);
  await writeFile(file,JSON.stringify({checkedAt:Date.now(),checks:[{id:'api',status:'warning',detail:'x'.repeat(500),secret:'must-not-leak'},{id:'secret',status:'ok',detail:'hidden'}]}));
  const result=await operationalStatus(file);assert.equal(result.stale,false);assert.equal(result.checks[0].status,'warning');assert.equal(result.checks[0].detail.length,240);assert.equal(JSON.stringify(result).includes('must-not-leak'),false);assert.equal(result.checks.length,6);
  await writeFile(file,JSON.stringify({checkedAt:Date.now()-600000,checks:[{id:'api',status:'ok'}]}));assert.equal((await operationalStatus(file)).checks[0].status,'unknown');
  await writeFile(file,'invalid JSON');assert.equal((await operationalStatus(file)).stale,true);
 }finally{await rm(folder,{recursive:true,force:true});}
});
test('operational status requires admin; parent and anonymous requests cannot inspect it',async()=>{
 const app=await createApi({store:new SqliteRepository(),roomSecret:'operations-only-fixture-secret-long',adminPassword:'OperationsAdminPassword!'});
 try{
  assert.equal((await app.inject({method:'GET',url:'/admin/operations'})).statusCode,401);
  await app.inject({method:'POST',url:'/parents',payload:{alias:'ops-parent',password:'OperationsParentPassword!'}});
  const login=async(alias:string,password:string)=>(await app.inject({method:'POST',url:'/sessions',payload:{alias,password}})).json().token;
  const parent=await login('ops-parent','OperationsParentPassword!'),admin=await login('admin','OperationsAdminPassword!');
  assert.equal((await app.inject({method:'GET',url:'/admin/operations',headers:{authorization:'Bearer '+parent}})).statusCode,401);
  assert.equal((await app.inject({method:'GET',url:'/admin/operations',headers:{authorization:'Bearer '+admin}})).statusCode,200);
 }finally{await app.close();}
});
