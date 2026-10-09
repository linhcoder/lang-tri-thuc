import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createApi} from '../src/main';
import {SqliteRepository,MySqlRepository} from '../src/Store';
import {verifyTicket} from '../src/Auth';
const secret='test-only-room-secret-at-least-32-characters';
test('parent API protects ownership, sessions, invitations, revisions and admin review',async()=>{
    const store=process.env.MYSQL_TEST_URL?new MySqlRepository(process.env.MYSQL_TEST_URL):new SqliteRepository();if(process.env.MYSQL_TEST_URL){if(!new URL(process.env.MYSQL_TEST_URL).pathname.endsWith('_test'))throw Error('Isolated test database required');await store.transaction(d=>{for(const key of Object.keys(d) as Array<keyof typeof d>)(d as any)[key]=Array.isArray(d[key])?[]:{};});}
    const app=await createApi({store,roomSecret:secret,adminPassword:'TestAdminPassword123!'});
    const request=async(method:any,url:string,body?:any,token?:string)=>app.inject({method,url,payload:body,headers:token?{authorization:'Bearer '+token}:{}});
    try{
        assert.equal((await request('GET','/profiles')).statusCode,401);
        for(const alias of ['parent-a','parent-b'])assert.equal((await request('POST','/parents',{alias,password:'TestParentPassword123!'})).statusCode,201);
        const a=(await request('POST','/sessions',{alias:'parent-a',password:'TestParentPassword123!'})).json().token,b=(await request('POST','/sessions',{alias:'parent-b',password:'TestParentPassword123!'})).json().token;
        const profile=(await request('POST','/profiles',{age:'6-8'},a)).json();assert.match(profile.label,/^Bé /);
        assert.equal((await request('GET','/profiles/'+profile.id+'/progress',undefined,b)).statusCode,404);
        const invite=(await request('POST','/invites',{profileId:profile.id},a)).json(),ticket=verifyTicket(invite.ticket,secret);assert.equal(ticket?.profileId,profile.id);assert.equal(verifyTicket(invite.ticket+'bad',secret),null);
        const data={version:1,completed:[],introduced:[],receipts:[],age:'3-5',quality:'low',sound:false,avatar:0,resume:{}};
        assert.equal((await request('PUT','/profiles/'+profile.id+'/progress',{revision:0,campaign:JSON.stringify(data)},a)).statusCode,200);
        assert.equal((await request('PUT','/profiles/'+profile.id+'/progress',{revision:0,campaign:JSON.stringify(data)},a)).statusCode,409);
        assert.equal((await request('GET','/admin/content',undefined,a)).statusCode,401);
        assert.equal((await request('POST','/internal/result',{profileId:profile.id,gameId:'fake',attemptId:'fake'})).statusCode,401);
        const admin=(await request('POST','/sessions',{alias:'admin',password:'TestAdminPassword123!'})).json().token;
        assert.equal((await request('PUT','/admin/content/ch01',{status:'reviewed',note:'Test review only, not production approval'},admin)).statusCode,200);
        assert.equal((await request('GET','/admin/audit',undefined,admin)).json().length,1);
        const text={title:'Test title',intro:'Test intro',ending:'Test ending',questTitles:{'q.ch01.greet':'Test greeting'},note:'Test editorial changes only'};
        assert.equal((await request('PUT','/admin/content/ch01/text',text,a)).statusCode,401);
        assert.equal((await request('PUT','/admin/content/ch01/text',text,admin)).statusCode,200);
        const edited=(await request('GET','/admin/content-export',undefined,admin)).json();assert.equal(edited.chapters[0].title,'Test title');assert.equal(edited.chapters[0].reviewRecord.status,'draft');
        assert.equal((await request('PUT','/admin/content/ch01',{status:'approved',note:'Test approval without review'},admin)).statusCode,409);
        const exported=(await request('GET','/export',undefined,a)).json();assert.equal(JSON.stringify(exported).includes('passwordHash'),false);
        assert.equal((await request('DELETE','/sessions',undefined,a)).statusCode,200);assert.equal((await request('GET','/profiles',undefined,a)).statusCode,401);
    }finally{await app.close();}
});
test('SQLite transaction rollback does not save failed changes',async()=>{
    const db=new SqliteRepository();try{await assert.rejects(db.transaction(d=>{d.results.push('bad');throw Error('rollback');}));assert.deepEqual(await db.transaction(d=>d.results),[]);}finally{await db.close();}
});
