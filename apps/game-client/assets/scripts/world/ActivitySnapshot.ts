import {CampaignData,CampaignEngine} from './CampaignEngine';
const keys=['practice','practiceResume','explored','care','painting','holidayProgress','festivalProgress'] as const;
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
    result.practice=Array.from(new Set([...remote.practice,...result.practice]));
    result.explored=Array.from(new Set([...(remote.explored??[]),...(result.explored??[])]));
    result.care={...remote.care,...result.care};
    const combined:Record<string,number>={...remote.holidayProgress};for(const [id,step] of Object.entries(result.holidayProgress??{}))combined[id]=Math.max(combined[id]??0,step);result.holidayProgress=combined;
    result.festivalProgress={...remote.festivalProgress};for(const [id,games] of Object.entries(local.festivalProgress??{}))result.festivalProgress[id]=Array.from(new Set([...(result.festivalProgress[id]??[]),...games]));
    return restoreActivities(result);
}
