import { Room, Client } from '@colyseus/core';
import { schema, t } from '@colyseus/schema';
import { Point, toWorld, VillageMap } from '../../game-client/assets/scripts/world/VillageModel.js';

export class PlayerState extends schema({x:t.number().default(0),y:t.number().default(-640),direction:t.uint8().default(6),moving:t.boolean().default(false),name:t.string().default(''),avatar:t.uint8().default(0),accessory:t.uint8().default(0)}) {}
export class VillageState extends schema({players:t.map(PlayerState),gameJson:t.string().default(''),gameQuest:t.string().default('')}) {}
export interface MovePacket extends Point { direction:number; moving:boolean; seq:number; avatar?:number; accessory?:number }
export function validMove(map:VillageMap, from:Point, packet:unknown, budget:number): packet is MovePacket {
    if (!packet || typeof packet !== 'object') return false;
    const p = packet as MovePacket;
    if (![p.x,p.y,p.direction,p.seq].every(Number.isFinite) || !Number.isInteger(p.direction) || p.direction<0 || p.direction>7 || !Number.isSafeInteger(p.seq) || p.seq<0 || typeof p.moving!=='boolean') return false;
    if(p.accessory!==undefined&&(!Number.isInteger(p.accessory)||p.accessory<0||p.accessory>3))return false;
    if(p.avatar!==undefined&&(!Number.isInteger(p.avatar)||p.avatar<0||p.avatar>3))return false;
    const distance=Math.hypot(p.x-from.x,p.y-from.y);
    if(distance>budget+0.01 || !map.canStand(p))return false;
    const steps=Math.max(1,Math.ceil(distance/2));
    for(let i=1;i<=steps;i++)if(!map.canStand({x:from.x+(p.x-from.x)*i/steps,y:from.y+(p.y-from.y)*i/steps}))return false;
    return true;
}
export class VillageRoom extends Room<{state:VillageState}> {
    private map = new VillageMap();
    private limits = new Map<string,{time:number;budget:number;seq:number}>();
    onCreate():void {
        this.maxClients=16;this.maxMessagesPerSecond=32;this.setState(new VillageState());this.setPatchRate(50);
        this.onMessage('move',(client,packet:unknown)=>{
            const player=this.state.players.get(client.sessionId), limit=this.limits.get(client.sessionId);
            if(!player||!limit)return;
            const now=performance.now();limit.budget=Math.min(30,limit.budget+(now-limit.time)*0.15);limit.time=now;
            const p=packet as MovePacket;
            if(!validMove(this.map,player,packet,limit.budget)||p.seq<=limit.seq){client.send('correction',{x:player.x,y:player.y});return;}
            limit.budget-=Math.hypot(p.x-player.x,p.y-player.y);limit.seq=p.seq;
            player.x=p.x;player.y=p.y;player.direction=p.direction;player.moving=p.moving;
            if(p.avatar!==undefined)player.avatar=p.avatar;
            if(p.accessory!==undefined)player.accessory=p.accessory;
        });
    }
    onJoin(client:Client):void {
        const p=new PlayerState(), spawn=toWorld({x:20,y:20});p.x=spawn.x;p.y=spawn.y;p.name=`Bạn ${client.sessionId.slice(0,4)}`;
        this.state.players.set(client.sessionId,p);this.limits.set(client.sessionId,{time:performance.now(),budget:30,seq:-1});
    }
    onLeave(client:Client):void {this.state.players.delete(client.sessionId);this.limits.delete(client.sessionId);}
    protected relocate(client:Client,p:Point):void{const player=this.state.players.get(client.sessionId),limit=this.limits.get(client.sessionId);if(!player||!limit||!this.map.canStand(p))return;player.x=p.x;player.y=p.y;player.moving=false;limit.budget=0;limit.time=performance.now();client.send('correction',p);}
}
