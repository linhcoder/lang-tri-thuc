import { Point, VillageMap, toWorld } from './VillageModel';
export interface WorldZone {id:string;name:string;spawn:Point;chapter:number|null}
export const worldZones:WorldZone[]=[
    {id:'gate',name:'Cổng làng',spawn:{x:20,y:25},chapter:null},
    {id:'courtyard',name:'Sân đình',spawn:{x:20,y:22},chapter:1},
    {id:'school',name:'Trường học',spawn:{x:6,y:23},chapter:3},
    {id:'farm',name:'Nông trại',spawn:{x:14,y:11},chapter:5},
    {id:'market',name:'Chợ quê',spawn:{x:29,y:23},chapter:2},
    {id:'craft',name:'Làng nghề',spawn:{x:6,y:28},chapter:4},
    {id:'pond',name:'Ao làng',spawn:{x:24,y:12},chapter:null},
    {id:'home',name:'Nhà của bé',spawn:{x:28,y:26},chapter:null},
    {id:'banyan',name:'Cây đa tri thức',spawn:{x:9,y:23},chapter:0},
    {id:'festival',name:'Khu lễ hội',spawn:{x:32,y:28},chapter:6},
];
export function nearestZone(tile:Point):WorldZone{return worldZones.reduce((a,b)=>Math.hypot(a.spawn.x-tile.x,a.spawn.y-tile.y)<=Math.hypot(b.spawn.x-tile.x,b.spawn.y-tile.y)?a:b);}
export function validateZones():boolean{const map=new VillageMap();return new Set(worldZones.map(z=>z.id)).size===worldZones.length&&worldZones.every(z=>map.walkable(z.spawn.x,z.spawn.y)&&map.path({x:20,y:20},z.spawn).length>0);}
export function portalDestination(from:Point,id:string):Point|null{const target=worldZones.find(z=>z.id===id);if(!target||![from.x,from.y].every(Number.isFinite)||!worldZones.some(z=>{const p=toWorld(z.spawn);return Math.hypot(p.x-from.x,p.y-from.y)<=48;}))return null;const p=toWorld(target.spawn);return new VillageMap().canStand(p)?p:null;}
