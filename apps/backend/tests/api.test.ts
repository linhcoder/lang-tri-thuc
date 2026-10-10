import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createApi} from '../src/main';
import {SqliteRepository,MySqlRepository} from '../src/Store';
import {verifyTicket} from '../src/Auth';
import {applyLessonPack,lessonCatalog} from '../../game-client/assets/scripts/world/LessonCatalog';
const secret='test-only-room-secret-at-least-32-characters';

test('admin reads shipped lesson defaults before database drafts',async()=>{
    const row=lessonCatalog()[0],prompt='Nội dung từ gói đã build';
    assert.equal(applyLessonPack({version:1,lessons:[{...row,question:{...row.question,prompt}}]}),true);
    const app=await createApi({store:new SqliteRepository(),roomSecret:secret,adminPassword:'TestAdminPassword123!'});
    try{
        const login=await app.inject({method:'POST',url:'/sessions',payload:{alias:'admin',password:'TestAdminPassword123!'}});
        const token=login.json().token;
        const headers={authorization:'Bearer '+token};
        const lessons=(await app.inject({method:'GET',url:'/admin/lessons',headers})).json();
        assert.equal(lessons.find((item:any)=>item.key===row.key).question.prompt,prompt);
        const pack=(await app.inject({method:'GET',url:'/admin/content-export',headers})).json();
        assert.equal(pack.lessons.find((item:any)=>item.key===row.key).question.prompt,prompt);
    }finally{await app.close();applyLessonPack({version:1,lessons:[]});}
});

test('lesson administration validates answers, protects roles, resets review and exports records',async()=>{
    const app=await createApi({store:new SqliteRepository(),roomSecret:secret,adminPassword:'TestAdminPassword123!'});
    const req=async(method:any,url:string,body?:any,token?:string)=>app.inject({method,url,payload:body,headers:token?{authorization:'Bearer '+token}:{}});
    try{
        assert.equal((await req('GET','/admin/lessons')).statusCode,401);assert.equal((await req('GET','/admin/catalog')).statusCode,401);
        const token=(await req('POST','/sessions',{alias:'admin',password:'TestAdminPassword123!'})).json().token;
        const rows=(await req('GET','/admin/lessons',undefined,token)).json();assert.equal(rows.length,90);
        const row=rows[0],url='/admin/lessons/'+encodeURIComponent(row.key),body={question:row.question,note:'Fixture editorial validation only'};
        for(const question of [{...row.question,answer:99},{...row.question,choices:['x','x','z']},{...row.question,id:'changed-id'}])assert.equal((await req('PUT',url,{...body,question},token)).statusCode,400);
        assert.equal((await req('PUT',url+'/review',{status:'approved',note:body.note},token)).statusCode,409);
        assert.equal((await req('PUT',url,body,token)).statusCode,200);
        for(const status of ['reviewed','approved'])assert.equal((await req('PUT',url+'/review',{status,note:body.note},token)).statusCode,200);
        let exported=(await req('GET','/admin/content-export',undefined,token)).json();assert.equal(exported.lessons[0].reviewRecord.status,'approved');
        assert.equal((await req('PUT',url,{...body,question:{...row.question,prompt:'New fixture prompt'}},token)).statusCode,200);
        exported=(await req('GET','/admin/content-export',undefined,token)).json();assert.equal(exported.lessons[0].reviewRecord.status,'draft');assert.equal(exported.lessons[0].question.prompt,'New fixture prompt');
        const catalog=(await req('GET','/admin/catalog',undefined,token)).json();assert.equal(catalog.games.length,12);assert.equal(catalog.zones.length,10);assert.equal(catalog.npcs.length,6);
        assert.equal(catalog.assets.length,24);
        const npc=catalog.npcs[0],npcUrl='/admin/catalog/npc/'+npc.id;
        assert.equal((await req('PUT',npcUrl,{value:{...npc,x:2,y:21},note:body.note},token)).statusCode,400);
        assert.equal((await req('PUT',npcUrl,{value:{...npc,name:'Fixture NPC'},note:body.note},token)).statusCode,200);
        const assetUrl='/admin/catalog/asset/child';assert.equal((await req('PUT',assetUrl,{value:{title:'Fixture asset',source:'Fixture origin',license:'Fixture only'},note:body.note},token)).statusCode,200);
        assert.equal((await req('PUT',assetUrl+'/review',{status:'approved',note:body.note},token)).statusCode,409);
        assert.equal((await req('PUT',assetUrl+'/review',{status:'reviewed',note:body.note},token)).statusCode,200);
        assert.equal((await req('GET','/admin/content-export',undefined,token)).json().assets[0].reviewRecord.status,'reviewed');

    }finally{await app.close();}
});
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
