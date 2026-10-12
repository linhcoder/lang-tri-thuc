import { Point, VillageMap, toWorld,zoneSpawns } from './VillageModel';
export interface WorldZone {id:string;name:string;spawn:Point;chapter:number|null}
export const worldZones:WorldZone[]=[
    {id:'seasons',name:'Vườn bốn mùa',spawn:zoneSpawns.seasons,chapter:null},
    {id:'riverside',name:'Bến sông quê',spawn:zoneSpawns.riverside,chapter:null},
    {id:'playground',name:'Sân trường tuổi thơ',spawn:zoneSpawns.playground,chapter:null},
    {id:'gate',name:'Cổng làng',spawn:zoneSpawns.gate,chapter:null},
    {id:'courtyard',name:'Sân đình',spawn:zoneSpawns.courtyard,chapter:1},
    {id:'school',name:'Trường học',spawn:zoneSpawns.school,chapter:3},
    {id:'farm',name:'Nông trại',spawn:zoneSpawns.farm,chapter:5},
    {id:'market',name:'Chợ quê',spawn:zoneSpawns.market,chapter:2},
    {id:'craft',name:'Làng nghề',spawn:zoneSpawns.craft,chapter:4},
    {id:'pond',name:'Ao làng',spawn:zoneSpawns.pond,chapter:null},
    {id:'home',name:'Nhà của bé',spawn:zoneSpawns.home,chapter:null},
    {id:'banyan',name:'Cây đa tri thức',spawn:zoneSpawns.banyan,chapter:0},
    {id:'festival',name:'Khu lễ hội',spawn:zoneSpawns.festival,chapter:6},
];
export function nearestZone(tile:Point):WorldZone{return worldZones.reduce((a,b)=>Math.hypot(a.spawn.x-tile.x,a.spawn.y-tile.y)<=Math.hypot(b.spawn.x-tile.x,b.spawn.y-tile.y)?a:b);}
export function validateZones():boolean{const map=new VillageMap();return new Set(worldZones.map(z=>z.id)).size===worldZones.length&&worldZones.every(z=>map.walkable(z.spawn.x,z.spawn.y)&&map.path({x:20,y:20},z.spawn).length>0);}
export function portalDestination(from:Point,id:string):Point|null{const target=worldZones.find(z=>z.id===id);if(!target||![from.x,from.y].every(Number.isFinite)||!worldZones.some(z=>{const p=toWorld(z.spawn);return Math.hypot(p.x-from.x,p.y-from.y)<=48;}))return null;const p=toWorld(target.spawn);return new VillageMap().canStand(p)?p:null;}
