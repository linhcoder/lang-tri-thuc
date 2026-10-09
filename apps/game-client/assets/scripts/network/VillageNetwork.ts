import type { Client, Room } from '@colyseus/sdk';
import { resources, TextAsset } from 'cc';
import { Point } from '../world/VillageModel';
export interface NetworkPlayer extends Point {direction:number;moving:boolean;name:string}
export class VillageNetwork {
    room:Room<any>|null=null;status='Chơi một mình';players=new Map<string,NetworkPlayer>();
    private disposed=false;private elapsed=0;private seq=0;private retry=0;private endpoint='';private paused=false;
    correction:Point|null=null;
    async connect(endpoint:string):Promise<void>{
        this.endpoint=endpoint;this.status='Đang kết nối…';
        try{
            // Preserve the official SDK's browser code and iterable semantics;
            // Creator does not need to transpile its networking dependencies.
            const sdk=await this.loadSdk();
            const room=await new sdk.Client(endpoint).joinOrCreate('village');
            if(this.disposed){await room.leave();return;}this.room=room;this.paused=false;this.retry=0;this.status='Đã vào làng online';
            const snapshot=()=>{
                this.players.clear();room.state.players?.forEach((p:NetworkPlayer,id:string)=>{if(id!==room.sessionId)this.players.set(id,{x:p.x,y:p.y,direction:p.direction,moving:p.moving,name:p.name});});
            };
            room.onStateChange(snapshot);snapshot();
            room.onMessage('correction',(p:Point)=>{if(Number.isFinite(p.x)&&Number.isFinite(p.y))this.correction=p;});
            room.onLeave(()=>{if(this.room===room){this.room=null;this.players.clear();this.status='Mất kết nối • đang thử lại';this.retry=3;}});
            room.onError((code,message)=>{this.status=`Kết nối đang gián đoạn (${code})`;console.warn('Colyseus room:',code,message);});
            room.onDrop(()=>{this.paused=true;this.status='Mất kết nối • đang thử lại';});
            room.onReconnect(()=>{this.paused=false;this.status='Đã vào làng online';});
        }catch{this.status='Offline • vẫn có thể chơi';this.retry=5;}
    }
    private async loadSdk():Promise<{Client:new(endpoint:string)=>Client}>{
        const global=window as unknown as {Colyseus?:{Client:new(endpoint:string)=>Client}};
        if(global.Colyseus)return global.Colyseus;
        const asset=await new Promise<TextAsset>((resolve,reject)=>resources.load('vendor/colyseus',TextAsset,(error,asset)=>error?reject(error):resolve(asset)));
        const script=document.createElement('script');script.textContent=asset.text;document.head.appendChild(script);script.remove();
        if(!global.Colyseus)throw new Error('Colyseus browser SDK did not load');return global.Colyseus;
    }
    update(dt:number,p:NetworkPlayer):void{
        if(this.disposed)return;
        if(!this.room){if(this.retry>0){this.retry-=dt;if(this.retry<=0)void this.connect(this.endpoint);}return;}
        if(this.paused)return;
        this.elapsed+=dt;if(this.elapsed>=0.05){this.elapsed=0;try{this.room.send('move',{x:p.x,y:p.y,direction:p.direction,moving:p.moving,seq:this.seq++});}catch{this.paused=true;this.status='Kết nối đang gián đoạn';}}
    }
    dispose():void{this.disposed=true;void this.room?.leave();this.room=null;this.players.clear();}
}
