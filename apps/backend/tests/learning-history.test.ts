import {test} from 'node:test';
import assert from 'node:assert/strict';
import {recordLearning,restoreUpgrades,learningReport,furniture,furnitureUnlocked} from '../../game-client/assets/scripts/world/LearningUpgrades';
import {restoreActivities,mergeActivities} from '../../game-client/assets/scripts/world/ActivitySnapshot';
import {journeyQuestions,journeyTasks} from '../../game-client/assets/scripts/world/LevelJourney';
import {lessonQuestions} from '../../game-client/assets/scripts/world/EducationEngine';

test('more than 200 answers retain weekly and monthly totals across repeated restore and upload merges',()=>{
 const data={upgrades:restoreUpgrades(null)};
 for(let i=0;i<800;i++)recordLearning(data,'math',i%2===0,'test.'+i);
 assert.equal(data.upgrades.events.length,200);
 for(let i=0;i<3;i++)data.upgrades=restoreUpgrades(JSON.parse(JSON.stringify(data.upgrades)));
 const report=learningReport(data.upgrades);assert.equal(report.answers,800);assert.equal(report.correct,400);
 const month=Object.values(report.months)[0];assert.equal(month.math[0],800);
 const remote=restoreActivities({upgrades:data.upgrades});
 for(let i=0;i<40;i++)recordLearning(data,'math',true,'new.'+i);
 const merged=mergeActivities(remote,restoreActivities({upgrades:data.upgrades}));
 assert.equal(learningReport(merged.upgrades).answers,840);
 assert.equal(learningReport(mergeActivities(restoreActivities({upgrades:data.upgrades}),remote).upgrades).answers,840);
 assert.ok(JSON.stringify(merged).length<96000);
});
test('old events become monthly totals and do not inflate current activity days',()=>{
 const now=Date.now(),events=Array.from({length:240},(_,i)=>({id:'old-'+i,at:now-100*86400000,skill:'math',correct:true,kind:'answer' as const,target:'old'}));
 const data=restoreUpgrades({events});assert.equal(learningReport(data,now).answers,0);
 const report=learningReport(data,now);assert.equal(Object.values(report.months)[0].math[0],240);
 assert.deepEqual(learningReport(restoreUpgrades(data),now).months,report.months);
});
test('review queue survives saves and removes exactly the corrected question',()=>{
 const data={upgrades:restoreUpgrades(null)};recordLearning(data,'math',false,'a');recordLearning(data,'math',false,'b');data.upgrades=restoreUpgrades(data.upgrades);recordLearning(data,'math',true,'a','answer',true);
 assert.deepEqual(data.upgrades.review,[{skill:'math',target:'b'}]);
});
test('one hundred level collectibles unlock at their level independently of story stars',()=>{
 const rewards=furniture.filter(f=>f.level);assert.equal(rewards.length,100);
 for(const item of rewards){assert.equal(furnitureUnlocked(item,8,[],item.level!-1),false);assert.equal(furnitureUnlocked(item,0,[],item.level!),true);}
});
test('journey questions remain deterministic and valid at all ages with additional non-math prompts',()=>{
 const prompts=new Set<string>();
 for(const age of ['3-5','6-8','9-11'] as const)for(const task of journeyTasks){const questions=journeyQuestions(task.id,age,lessonQuestions);assert.deepEqual(questions,journeyQuestions(task.id,age,lessonQuestions));assert.equal(questions.length,3);for(const q of questions){assert.ok(q.answer>=0&&q.answer<q.choices.length);assert.equal(new Set(q.choices).size,q.choices.length);if(task.skill!=='math')prompts.add(q.prompt);}}
 assert.ok(prompts.size>=40);
});
