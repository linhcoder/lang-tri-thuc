import {test} from 'node:test';
import assert from 'node:assert/strict';
import {studentSummary} from '../src/StudentSummary';
import {CampaignEngine} from '../../game-client/assets/scripts/world/CampaignEngine';
import {createApi} from '../src/main';
import {SqliteRepository} from '../src/Store';
test('family summaries use real campaign progress without changing saves or trusting a solo backup as online',()=>{
 const engine=new CampaignEngine();engine.introduce(0);engine.complete('q.ch01.greet');const saved={revision:1,data:engine.data,receipts:[],source:'solo' as const};
 const expectedLevel=engine.level,before=JSON.stringify(saved),summary=studentSummary(saved)!;assert.equal(summary.completed,1);assert.equal(summary.level,expectedLevel);assert.equal(summary.stars,0);assert.equal(summary.source,'solo');assert.equal(JSON.stringify(saved),before);
 assert.equal(studentSummary(undefined),null);assert.equal(studentSummary({...saved,data:{garbage:true}}),null);
 const trusted=new CampaignEngine();assert.equal(studentSummary({...saved,source:'online',trusted:{campaign:trusted.data,chapterOne:null}})?.completed,0);
});
test('admin family API exposes bounded summary values, not raw campaign saves',async()=>{
 const store=new SqliteRepository(),app=await createApi({store,adminPassword:'FamilySummaryAdmin123!',roomSecret:'family-summary-test-secret-at-least-32'});
 try{
  const token=(await app.inject({method:'POST',url:'/sessions',payload:{alias:'admin',password:'FamilySummaryAdmin123!'}})).json().token;
  await store.transaction(d=>{d.parents['family-test']={id:'family-test',alias:'family_test',role:'parent',passwordHash:'secret-never-export'};d.profiles['student-test']={id:'student-test',parentId:'family-test',label:'Student',age:'6-8',blocked:[]};const engine=new CampaignEngine();engine.introduce(0);engine.complete('q.ch01.greet');d.progress['student-test']={revision:1,data:engine.data,receipts:[],source:'solo'};});
  const response=await app.inject({method:'GET',url:'/admin/accounts',headers:{authorization:'Bearer '+token}});assert.equal(response.statusCode,200);const student=response.json().rows[0].profiles[0];assert.equal(student.summary.completed,1);assert.equal(student.summary.source,'solo');assert.equal(student.summary.level,1);assert.equal(response.body.includes('secret-never-export'),false);assert.equal(response.body.includes('xpHistory'),false);
 }finally{await app.close();}
});
