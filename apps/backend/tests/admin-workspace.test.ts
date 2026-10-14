import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createApi} from '../src/main';
import {SqliteRepository} from '../src/Store';
test('admin manages families without exposing credentials, resets sessions and audits changes',async()=>{
 const store=new SqliteRepository(),app=await createApi({store,roomSecret:'admin-workspace-test-secret-32-characters',adminPassword:'WorkspaceAdmin123!'});
 const request=(method:any,url:string,payload?:any,token?:string)=>app.inject({method,url,payload,headers:token?{authorization:'Bearer '+token}:{}});
 try{const admin=(await request('POST','/sessions',{alias:'admin',password:'WorkspaceAdmin123!'})).json().token;
 assert.equal((await request('GET','/admin/accounts')).statusCode,401);
 const created=await request('POST','/admin/accounts',{alias:'parent_first',password:'ParentPassword123!'},admin);assert.equal(created.statusCode,201);const parent=created.json();assert.deepEqual(Object.keys(parent).sort(),['alias','id']);
 const parentToken=(await request('POST','/sessions',{alias:parent.alias,password:'ParentPassword123!'})).json().token;
 for(const [method,url,payload] of [['GET','/admin/accounts',undefined],['GET','/admin/scene',undefined],['GET','/admin/asset-preview/expansion.garden',undefined],['PUT','/admin/accounts/'+parent.id,{alias:'intruder'}],['POST','/admin/accounts/'+parent.id+'/students',{label:'Blocked',age:'3-5'}]] as const)assert.equal((await request(method,url,payload,parentToken)).statusCode,401);
 const student=(await request('POST','/admin/accounts/'+parent.id+'/students',{label:'Bé Lan',age:'3-5'},admin)).json();assert.equal(student.parentId,parent.id);
 const update=await request('PUT','/admin/students/'+student.id,{label:'Bé Lan mới',age:'6-8'},admin);assert.equal(update.statusCode,200);
 const list=(await request('GET','/admin/accounts?q=Lan&age=6-8&page=1',undefined,admin)).json();assert.equal(list.total,1);assert.equal(list.rows[0].profiles[0].label,'Bé Lan mới');assert.equal(JSON.stringify(list).includes('password'),false);
 assert.equal((await request('GET','/admin/accounts?age=9-11',undefined,admin)).json().total,0);
 assert.equal((await request('PUT','/admin/accounts/'+parent.id,{alias:'parent_renamed',password:'short'},admin)).statusCode,400);
 await request('POST','/admin/accounts',{alias:'another_parent',password:'AnotherPassword123!'},admin);
 assert.equal((await request('PUT','/admin/accounts/'+parent.id,{alias:'ANOTHER_PARENT'},admin)).statusCode,409);
 assert.equal((await request('PUT','/admin/accounts/'+parent.id,{alias:'parent_renamed'},admin)).statusCode,200);assert.equal((await request('GET','/me',undefined,parentToken)).statusCode,200);
 assert.equal((await request('PUT','/admin/accounts/'+parent.id,{alias:'parent_renamed',password:'NewParentPassword123!'},admin)).statusCode,200);
 assert.equal((await request('GET','/me',undefined,parentToken)).statusCode,401);assert.equal((await request('GET','/me',undefined,admin)).statusCode,200);
 assert.equal((await request('POST','/sessions',{alias:'parent_renamed',password:'ParentPassword123!'})).statusCode,401);assert.equal((await request('POST','/sessions',{alias:'parent_renamed',password:'NewParentPassword123!'})).statusCode,200);
 const me=(await request('GET','/me',undefined,admin)).json();assert.equal((await request('PUT','/admin/accounts/'+me.id,{alias:'changed_admin'},admin)).statusCode,404);
 const audit=(await request('GET','/admin/audit',undefined,admin)).json();assert.ok(audit.some((a:any)=>a.action==='account.password-reset'));assert.ok(audit.some((a:any)=>a.action==='profile.admin-edit'));assert.equal(JSON.stringify(audit).includes('NewParentPassword123!'),false);
 const scene=(await request('GET','/admin/scene',undefined,admin)).json();assert.equal(scene.tiles.length,72*72);assert.ok(scene.assets.some((a:any)=>a.id==='expansion.garden'));assert.ok(scene.assets.some((a:any)=>a.region));
 const image=await request('GET','/admin/asset-preview/expansion.garden',undefined,admin);assert.equal(image.statusCode,200);assert.equal(image.headers['content-type'],'image/png');assert.equal(image.rawPayload.subarray(1,4).toString(),'PNG');assert.equal((await request('GET','/admin/asset-preview/not-a-resource',undefined,admin)).statusCode,404);
 }finally{await app.close();}
});
