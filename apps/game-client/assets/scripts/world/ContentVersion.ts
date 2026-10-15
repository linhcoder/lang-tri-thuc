import {journeyRegions,journeyTasks} from './LevelJourney';
import {expansionActivities,expansionFriends} from './ExpansionActivities';
import {chapters,AgeBand} from './CampaignContent';
import {lessonQuestions,lessonSkills} from './EducationEngine';
import {worldZones} from './WorldZones';
import {storyNpcs,VillageMap,SIZE,npcPatrolRoutes} from './VillageModel';
import {plantingPlots} from './ChapterOneProgress';
import {avatarGestures} from './AvatarGestures';
let compatibility:string|undefined;
/** Compatibility marker, not an authentication or cryptographic signature. */
export function contentVersion():string{
    if(compatibility)return compatibility;
    const map=new VillageMap();
    const content=JSON.stringify({rules:12,journeyRegions,journeyTasks,expansionActivities,expansionFriends,patrol:npcPatrolRoutes(),gestures:avatarGestures.map(g=>g.id),plantingPlots,zones:worldZones.map(z=>({id:z.id,spawn:z.spawn})),walkable:Array.from({length:SIZE*SIZE},(_,i)=>map.walkable(i%SIZE,Math.floor(i/SIZE))),quests:chapters.map(c=>({id:c.id,quests:c.quests.map(q=>({id:q.id,lesson:q.lesson,game:q.game,prerequisites:q.prerequisites}))})),npcs:storyNpcs.map(n=>({id:n.id,name:n.name,x:n.x,y:n.y})),lessons:(['3-5','6-8','9-11'] as AgeBand[]).flatMap(age=>lessonSkills.map(skill=>({age,skill,questions:lessonQuestions(skill,age)})))});
    let hash=2166136261;for(let i=0;i<content.length;i++)hash=Math.imul(hash^content.charCodeAt(i),16777619);return compatibility=(hash>>>0).toString(16).padStart(8,'0');
}
