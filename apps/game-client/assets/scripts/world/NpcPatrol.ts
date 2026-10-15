import {Point,VillageMap,toWorld,npcPatrolRoutes,direction8} from './VillageModel';
export interface PatrolPose extends Point{id:string;moving:boolean;direction:number}
interface Walker extends PatrolPose{points:Point[];index:number;forward:number;wait:number}
/** Shared route simulation. Network rooms own their simulation; solo play uses the same rules. */
export class NpcPatrol{
    readonly poses=new Map<string,Walker>();private key='';
    constructor(private map?:VillageMap){this.refresh();}
    private refresh():void{const routes=npcPatrolRoutes(this.map),key=JSON.stringify(routes);if(key===this.key)return;this.key=key;this.poses.clear();routes.forEach((route,i)=>this.poses.set(route.id,{id:route.id,...toWorld(route.points[0]),direction:6,moving:false,points:route.points.map(toWorld),index:0,forward:1,wait:2+i*.35}));}
    step(dt:number,people:readonly Point[]):void{
        this.refresh();const delta=Number.isFinite(dt)?Math.max(0,Math.min(dt,.1)):0;
        for(const p of this.poses.values()){
            p.moving=false;if(p.points.length<2||people.some(person=>Number.isFinite(person.x)&&Number.isFinite(person.y)&&Math.hypot(person.x-p.x,person.y-p.y)<80))continue;
            if(p.wait>0){p.wait=Math.max(0,p.wait-delta);continue;}
            const target=p.points[p.index+p.forward],dx=target.x-p.x,dy=target.y-p.y,distance=Math.hypot(dx,dy),amount=Math.min(distance,18*delta);
            if(amount>0){p.x+=dx/distance*amount;p.y+=dy/distance*amount;p.direction=direction8({x:dx,y:dy});p.moving=true;}
            if(distance<=amount+.001){p.index+=p.forward;if(p.index===0||p.index===p.points.length-1){p.forward*=-1;p.wait=2;}}
        }
    }
}
