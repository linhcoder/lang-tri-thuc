import {newerHistory} from './LearningHistory';
import {restoreUpgrades} from './LearningUpgrades';
import {mergeHouseSteps} from './HouseInterior';
import {mergeHouseRuns} from './HouseTasks';
import {mergePotteryDraft} from './PotteryDraft';
import {CampaignData,CampaignEngine} from './CampaignEngine';
const keys=['upgrades','practice','practiceResume','explored','care','painting','holidayProgress','festivalProgress','expansion','expansionProgress'] as const;
export type ActivitySnapshot=Pick<CampaignData,typeof keys[number]>;
export function activitySnapshot(data:CampaignData):ActivitySnapshot{return Object.fromEntries(keys.map(key=>[key,data[key]])) as ActivitySnapshot;}
export function restoreActivities(raw:unknown):ActivitySnapshot{
    const engine=new CampaignEngine();
    const source=raw&&typeof raw==='object'?raw:{};
    engine.restore(JSON.stringify({...engine.data,...source,version:1,completed:[],introduced:[],receipts:[],resume:{}}));
    return activitySnapshot(engine.data);
}
/** Completion is cumulative; drawings and checkpoints follow the last uploaded snapshot. */
export function mergeActivities(remote:ActivitySnapshot,local:ActivitySnapshot):ActivitySnapshot{
    const result=restoreActivities(local);
    result.expansionProgress={...remote.expansionProgress};
    for(const [id,checkpoint] of Object.entries(local.expansionProgress??{})){if(checkpoint&&(!result.expansionProgress[id as keyof typeof result.expansionProgress]||(checkpoint.updated??0)>=(result.expansionProgress[id as keyof typeof result.expansionProgress]?.updated??0)))result.expansionProgress[id as keyof typeof result.expansionProgress]=checkpoint;}
    result.expansion=Array.from(new Set([...(remote.expansion??[]),...(result.expansion??[])]));
    result.practice=Array.from(new Set([...remote.practice,...result.practice]));
    result.explored=Array.from(new Set([...(remote.explored??[]),...(result.explored??[])]));
    result.care={...remote.care,...result.care};
    const combined:Record<string,number>={...remote.holidayProgress};for(const [id,step] of Object.entries(result.holidayProgress??{}))combined[id]=Math.max(combined[id]??0,step);result.holidayProgress=combined;
    result.festivalProgress={...remote.festivalProgress};for(const [id,games] of Object.entries(local.festivalProgress??{}))result.festivalProgress[id]=Array.from(new Set([...(result.festivalProgress[id]??[]),...games]));
    const remoteUpgrade=restoreUpgrades(remote.upgrades),localUpgrade=restoreUpgrades(local.upgrades);result.upgrades=restoreUpgrades({...localUpgrade,tutorial:[...remoteUpgrade.tutorial,...localUpgrade.tutorial],history:newerHistory(remoteUpgrade.history,localUpgrade.history),events:[...remoteUpgrade.events,...localUpgrade.events]});
    for(const [id,checkpoint] of Object.entries(remoteUpgrade.regional??{})){
        const regional=result.upgrades!.regional??={};if(!regional[id]||checkpoint.updated>regional[id].updated)regional[id]=checkpoint;
    }
    if(result.upgrades)result.upgrades.homeStep=Math.max(remoteUpgrade.homeStep??0,localUpgrade.homeStep??0);
    if(result.upgrades)result.upgrades.houseSteps=mergeHouseSteps(remoteUpgrade.houseSteps,localUpgrade.houseSteps);
    if(result.upgrades)result.upgrades.houseRuns=mergeHouseRuns(remoteUpgrade.houseRuns,localUpgrade.houseRuns);
    if(result.upgrades)result.upgrades.potteryDraft=mergePotteryDraft(remoteUpgrade.potteryDraft,localUpgrade.potteryDraft);
    return restoreActivities(result);
}
