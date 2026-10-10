import {elderTile,SIZE,storyNpcs,terrain,VillageMap,villageDetails,villageObjects,villageSolids} from './VillageModel';
import {worldZones} from './WorldZones';
import {plantingPlots} from './ChapterOneProgress';
export interface NpcText {id:string;name:string;x:number;y:number}
const baseline: NpcText[]=storyNpcs.map(({id,name,x,y})=>({id,name,x,y}));
export function npcCatalog():NpcText[]{return baseline.map(row=>({...row}));}
/** Spawn edits are staged as a pack; no collision state changes during an admin request. */
export function applyNpcPack(value:unknown,dryRun=false):boolean{
    const pack=value as {version:number;npcs:NpcText[]};if(!pack||pack.version!==1||!Array.isArray(pack.npcs)||pack.npcs.length>baseline.length)return false;
    const seen=new Set<string>(),next=baseline.map(row=>({...row}));
    for(const row of pack.npcs){
        const target=row&&next.find(n=>n.id===row.id);
        if(!target||seen.has(row.id)||typeof row.name!=='string'||!row.name.trim()||row.name.length>50||![row.x,row.y].every(n=>Number.isInteger(n)&&n>0&&n<SIZE-1))return false;
        seen.add(row.id);Object.assign(target,{name:row.name,x:row.x,y:row.y});
    }
    const map=new VillageMap(),blocked=[elderTile,map.npc,{x:20,y:20},...plantingPlots,...worldZones.map(z=>z.spawn)];
    if(new Set(next.map(n=>`${n.x}:${n.y}`)).size!==next.length||next.some(n=>terrain(n.x,n.y)==='pond'||blocked.some(p=>p.x===n.x&&p.y===n.y)||[...villageObjects,...villageSolids].some(o=>Math.abs(o.x-n.x)<=o.radius&&Math.abs(o.y-n.y)<=o.radius)||villageDetails.some(o=>o.blocked&&o.x===n.x&&o.y===n.y)))return false;
    const previous=storyNpcs.map(n=>({...n}));next.forEach(n=>Object.assign(storyNpcs.find(p=>p.id===n.id)!,n));
    const reachable=next.every(n=>[{x:n.x+1,y:n.y},{x:n.x-1,y:n.y},{x:n.x,y:n.y+1},{x:n.x,y:n.y-1}].some(p=>map.walkable(p.x,p.y)&&map.path({x:20,y:20},p).length>0));
    if(!reachable||dryRun)previous.forEach(n=>Object.assign(storyNpcs.find(p=>p.id===n.id)!,n));return reachable;
}
