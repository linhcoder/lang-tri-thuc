import {CampaignEngine} from '../../game-client/assets/scripts/world/CampaignEngine';
import {ChapterOneProgress} from '../../game-client/assets/scripts/world/ChapterOneProgress';
import {chapters,miniGameIds} from '../../game-client/assets/scripts/world/CampaignContent';
import type {BackendData} from './Store';

/** Read-only summary of the same save chosen by /profiles/:id/play. */
export function studentSummary(saved:BackendData['progress'][string]|undefined){
 if(!saved)return null;
 const online=saved.source==='online'&&!!saved.trusted;
 const raw=online?saved.trusted!.campaign:saved.data;
 if(!raw)return null;
 try{
  const engine=new CampaignEngine();if(!engine.restore(JSON.stringify(raw)))return null;
  const firstRaw=online?saved.trusted!.chapterOne:saved.chapterOne;
  if(firstRaw){const first=new ChapterOneProgress();if(first.restore(JSON.stringify(firstRaw)))engine.syncChapterOne(first.data);}
  const total=chapters.reduce((sum,c)=>sum+c.quests.length,0);
  return {level:engine.level,stars:engine.stars,completed:engine.data.completed.length,total,
   journey:engine.journey.completed.length,journeyTotal:100,practice:engine.data.practice.length,practiceTotal:miniGameIds.length,
   source:online?'online' as const:'solo' as const};
 }catch{return null;}
}
