import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CampaignEngine} from '../../game-client/assets/scripts/world/CampaignEngine';
import {journeyRegions,journeyTasks,journeyQuestions,levelForXp} from '../../game-client/assets/scripts/world/LevelJourney';
import {lessonQuestions} from '../../game-client/assets/scripts/world/EducationEngine';
import {worldZones,validateZones,portalDestination} from '../../game-client/assets/scripts/world/WorldZones';
import {toWorld,VillageMap} from '../../game-client/assets/scripts/world/VillageModel';
import {createApi} from '../src/main';
import {SqliteRepository} from '../src/Store';

test('all three age bands can reach level 100 without replay rewards or skipped rounds',()=>{
    for(const age of ['3-5','6-8','9-11'] as const){
        const engine=new CampaignEngine();engine.data.age=age;
        assert.equal(engine.level,1);assert.equal(engine.answerJourney('journey.school.1',0,0),false);
        for(const task of journeyTasks){
            const questions=journeyQuestions(task.id,age,lessonQuestions);assert.equal(questions.length,3);
            assert.equal(engine.answerJourney(task.id,2,questions[2].answer),false);
            for(let round=0;round<3;round++){
                const q=questions[round];assert.equal(new Set(q.choices).size,q.choices.length);
                assert.equal(engine.answerJourney(task.id,round,(q.answer+1)%q.choices.length),false);
                assert.equal(engine.answerJourney(task.id,round,q.answer),true);
                assert.equal(engine.answerJourney(task.id,round,q.answer),false);
            }
            const restored=new CampaignEngine();assert.equal(restored.restore(JSON.stringify(engine.data)),true);assert.equal(restored.xp,engine.xp);
        }
        assert.equal(engine.level,100);assert.equal(engine.journey.completed.length,100);assert.equal(engine.stars,0);
        assert.equal(engine.levelProgress,1);assert.equal(levelForXp(999999),100);
    }
});

test('legacy saves retain story stars and gain derived experience; new region spawns are reachable',()=>{
    const engine=new CampaignEngine();engine.syncChapterOne({version:2,introSeen:true,greeted:true,accepted:true,planted:[0,1,2,3,4],countRound:3,rewardReceipts:['reward.star.ch01'],replayRound:null,legacyDemoBadge:false});
    const old=JSON.parse(JSON.stringify(engine.data));delete old.journey;const restored=new CampaignEngine();assert.equal(restored.restore(JSON.stringify(old)),true);assert.equal(restored.stars,1);assert.equal(restored.xp,180);assert.equal(restored.level,2);
    assert.equal(validateZones(),true);const map=new VillageMap();for(const region of journeyRegions){const zone=worldZones.find(z=>z.id===region.zone)!;assert.ok(map.path({x:20,y:20},zone.spawn).length);if(region.level>1)assert.equal(portalDestination(toWorld(worldZones.find(z=>z.id==='banyan')!.spawn),zone.id,1),null);}
});

test('student play requires authentication, ownership and a complete profile; saves stay isolated',async()=>{
    const app=await createApi({store:new SqliteRepository(),roomSecret:'test-only-student-profile-secret-at-least-32'});
    const req=(method:any,url:string,payload?:any,token?:string)=>app.inject({method,url,payload,headers:token?{authorization:'Bearer '+token}:{}});
    try{
        assert.equal((await req('GET','/profiles')).statusCode,401);
        await req('POST','/parents',{alias:'journey-parent',password:'JourneyPassword123!'});
        const token=(await req('POST','/sessions',{alias:'journey-parent',password:'JourneyPassword123!'})).json().token;
        const old=(await req('POST','/profiles',{age:'3-5'},token)).json();assert.equal((await req('GET',`/profiles/${old.id}/play`,undefined,token)).statusCode,409);
        const updated=await req('PUT',`/profiles/${old.id}`,{label:'Minh Anh',age:'6-8',gender:'female',avatar:2},token);assert.equal(updated.statusCode,200);
        const first=(await req('GET',`/profiles/${old.id}/play`,undefined,token)).json();assert.equal(first.profile.label,'Minh Anh');assert.equal(first.profile.age,'6-8');assert.equal(first.profile.gender,'female');
        const appearance=await req('PUT',`/profiles/${old.id}/appearance`,{avatar:3},token);assert.equal(appearance.statusCode,200);assert.equal(appearance.json().label,'Minh Anh');assert.equal(appearance.json().age,'6-8');assert.equal(appearance.json().avatar,3);
        assert.equal((await req('PUT',`/profiles/${old.id}/appearance`,{avatar:0},token)).statusCode,400);
        const other=(await req('POST','/profiles',{label:'Bảo',age:'9-11',gender:'male',avatar:1},token)).json();
        const engine=new CampaignEngine();for(let round=0;round<3;round++)engine.answerJourney('journey.village.1',round,journeyQuestions('journey.village.1',engine.data.age,lessonQuestions)[round].answer);
        assert.equal((await req('PUT',`/profiles/${old.id}/progress`,{revision:0,campaign:JSON.stringify(engine.data)},token)).statusCode,200);
        assert.equal((await req('GET',`/profiles/${other.id}/play`,undefined,token)).json().progress.data,null);
        assert.equal((await req('PUT',`/profiles/${old.id}/progress`,{revision:0,campaign:JSON.stringify(engine.data)},token)).statusCode,409);
        await req('POST','/parents',{alias:'journey-outsider',password:'JourneyPassword123!'});const outsider=(await req('POST','/sessions',{alias:'journey-outsider',password:'JourneyPassword123!'})).json().token;
        assert.equal((await req('GET',`/profiles/${old.id}/play`,undefined,outsider)).statusCode,404);
        assert.equal((await req('PUT',`/profiles/${old.id}/appearance`,{avatar:3},outsider)).statusCode,404);
        assert.equal((await req('POST','/profiles',{label:'Sai',age:'6-8',gender:'female',avatar:0},token)).statusCode,400);
        await req('DELETE','/sessions',undefined,token);assert.equal((await req('GET',`/profiles/${old.id}/play`,undefined,token)).statusCode,401);
    }finally{await app.close();}
});

test('joining a room keeps personal learning and partial rounds without claiming unverified story stars',()=>{
    const solo=new CampaignEngine();solo.syncChapterOne({version:2,introSeen:true,greeted:true,accepted:true,planted:[0,1,2,3,4],countRound:3,rewardReceipts:['reward.star.ch01'],replayRound:null,legacyDemoBadge:false});
    for(let round=0;round<3;round++)solo.answerJourney('journey.village.1',round,journeyQuestions('journey.village.1',solo.data.age,lessonQuestions)[round].answer);
    solo.answerJourney('journey.village.2',0,journeyQuestions('journey.village.2',solo.data.age,lessonQuestions)[0].answer);
    const room=new CampaignEngine();room.preserveLearningFrom(solo.data);assert.equal(room.xp,solo.xp);assert.equal(room.level,solo.level);assert.equal(room.stars,0);assert.deepEqual(room.data.completed,[]);assert.deepEqual(room.journey.completed,['journey.village.1']);assert.equal(room.journey.rounds['journey.village.2'],1);
    room.preserveLearningFrom(solo.data);assert.equal(room.xp,solo.xp);assert.equal(room.stars,0);
    const restored=new CampaignEngine();assert.equal(restored.restore(JSON.stringify(room.data)),true);assert.equal(restored.xp,room.xp);assert.equal(restored.stars,0);
});
