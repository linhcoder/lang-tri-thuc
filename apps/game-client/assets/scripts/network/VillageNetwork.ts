import type { Client, Room } from '@colyseus/sdk';
import { resources, TextAsset } from 'cc';
import { Point } from '../world/VillageModel';
import { MiniGameRules } from '../world/MiniGameRules';
import {contentVersion} from '../world/ContentVersion';
export interface NetworkPlayer extends Point {direction:number;moving:boolean;name:string;avatar?:number;accessory?:number;hair?:number}
export class VillageNetwork {
    room:Room<any>|null=null;status='Chơi một mình';players=new Map<string,NetworkPlayer>();
    private disposed=false;private elapsed=0;private seq=0;private retry=0;private endpoint='';private paused=false;private contentReady=false;
    correction:Point|null=null;
    onProgress?:(value:any)=>void;onGame?:(game:MiniGameRules)=>void;
    onEmote?:(sessionId:string,id:string)=>void;
    onOffline?:()=>void;
    private joinOptions?:{roomCode:string;ticket:string;miniGame?:boolean};private pending:Array<{type:string;data:unknown}>=[];
    private blocked=new Set<string>();private wantOnline=true;private failures=0;private gameSnapshot='';
    private messageTime=0;private message='';get lastMessage():string{return this.message;}set lastMessage(value:string){this.message=value;this.messageTime=4;}get visibleMessage():string{return this.messageTime>0?this.lastMessage:'';}
    get privateMode():boolean{return !!this.joinOptions;}
    get offlineMode():boolean{return !this.wantOnline;}
    get canSend():boolean{return !!this.room&&!this.paused&&(!this.privateMode||this.contentReady);}
    async connect(endpoint:string,options?:{roomCode:string;ticket:string;miniGame?:boolean}):Promise<void>{
        if(options)this.joinOptions=options;
        this.contentReady=false;
        this.endpoint=endpoint;this.status='Đang kết nối…';
        try{
            // Preserve the official SDK's browser code and iterable semantics;
            // Creator does not need to transpile its networking dependencies.
            const sdk=await this.loadSdk();
            const room=await new sdk.Client(endpoint).joinOrCreate(this.joinOptions?(this.joinOptions.miniGame?'mini-game':'private-friend'):'village',this.joinOptions??{});
            if(this.disposed||!this.wantOnline){await room.leave();return;}this.room=room;this.paused=false;this.retry=0;this.status='Đã vào làng online';
            const snapshot=()=>{
                if(this.room!==room)return;
                this.players.clear();room.state.players?.forEach((p:NetworkPlayer,id:string)=>{if(id!==room.sessionId&&!this.blocked.has(id))this.players.set(id,{x:p.x,y:p.y,direction:p.direction,moving:p.moving,name:p.name,avatar:p.avatar??0,accessory:p.accessory??0,hair:p.hair??0});});
                if(this.privateMode&&room.state.gameJson&&this.gameSnapshot!==room.state.gameJson){this.gameSnapshot=room.state.gameJson;try{const raw=JSON.parse(this.gameSnapshot),game=MiniGameRules.restore(raw);if(raw.paused)game.pause();this.onGame?.(game);}catch{this.status='Chưa đọc được trạng thái trò chơi online';}}
            };
            room.onStateChange(snapshot);snapshot();
            room.onMessage('correction',(p:Point)=>{if(this.room===room&&p&&Number.isFinite(p.x)&&Number.isFinite(p.y))this.correction=p;});
            if(this.privateMode){
                room.onMessage('content-version',version=>{if(this.room!==room)return;if(version===contentVersion())this.contentReady=true;else{this.offline();this.lastMessage='Nội dung khác phiên bản. Mời người lớn tải lại game trước khi vào phòng.';this.status='Cần cập nhật game';}});
                room.onMessage('progress-state',v=>{if(this.room===room)this.onProgress?.(v);});room.onMessage('storage-warning',v=>{this.lastMessage=String(v).slice(0,150);});
                room.onMessage('emote',v=>{const labels:Record<string,string>={happy:'M\u00ecnh vui qu\u00e1!',hello:'Chào bạn!',thanks:'Cảm ơn!', 'your-turn':'Đến lượt bạn!', 'need-help':'Mình cần giúp',bye:'Tạm biệt!'};if(this.room===room&&v&&typeof v.sessionId==='string'&&labels[v.id]&&!this.blocked.has(v.sessionId)){this.onEmote?.(v.sessionId,v.id);this.lastMessage=(this.players.get(v.sessionId)?.name??'Bạn')+': '+labels[v.id];}});
                room.onMessage('blocked',v=>{if(typeof v.sessionId==='string'){this.blocked.add(v.sessionId);this.players.delete(v.sessionId);}});room.onMessage('report-sent',()=>{this.lastMessage='Đã gửi báo cáo tới người lớn phụ trách.';});room.send('ready');
            }
            room.onLeave(()=>{if(this.room===room){this.room=null;this.players.clear();this.status=this.wantOnline?'Mất kết nối • đang thử lại':'Chơi một mình';this.retry=this.wantOnline?3:0;}});
            room.onError((code,message)=>{this.status=`Kết nối đang gián đoạn (${code})`;console.warn('Colyseus room:',code,message);});
            room.onDrop(()=>{this.paused=true;this.status='Mất kết nối • đang thử lại';});
            room.onReconnect(()=>{this.paused=false;this.status='Đã vào làng online';});
        }catch{this.status='Offline • vẫn có thể chơi';this.retry=this.wantOnline?5:0;if(this.privateMode&&++this.failures>=3){this.offline();this.status='Nhờ người lớn mở lại phòng riêng • đang chơi offline';}}
    }
    private async loadSdk():Promise<{Client:new(endpoint:string)=>Client}>{
        const global=window as unknown as {Colyseus?:{Client:new(endpoint:string)=>Client}};
        if(global.Colyseus)return global.Colyseus;
        const asset=await new Promise<TextAsset>((resolve,reject)=>resources.load('vendor/colyseus',TextAsset,(error,asset)=>error?reject(error):resolve(asset)));
        const script=document.createElement('script');script.textContent=asset.text;document.head.appendChild(script);script.remove();
        if(!global.Colyseus)throw new Error('Colyseus browser SDK did not load');return global.Colyseus;
    }
    update(dt:number,p:NetworkPlayer):void{
        if(this.disposed)return;this.messageTime=Math.max(0,this.messageTime-dt);
        if(!this.room){if(this.retry>0){this.retry-=dt;if(this.retry<=0)void this.connect(this.endpoint);}return;}
        if(!this.canSend)return;
        this.elapsed+=dt;if(this.elapsed>=0.05||this.pending.length){this.elapsed=0;try{this.room.send('move',{x:p.x,y:p.y,direction:p.direction,moving:p.moving,avatar:p.avatar??0,accessory:p.accessory??0,hair:p.hair??0,seq:this.seq++});for(const event of this.pending.splice(0))this.room.send(event.type,event.data);}catch{this.paused=true;this.status='Kết nối đang gián đoạn';}}
    }
    intent(type:string,data:unknown):boolean{if(!this.privateMode||!this.canSend||this.pending.length>=8)return false;this.pending.push({type,data});return true;}
    emote(id:string):boolean{return this.intent('emote',{id});}
    block(sessionId:string):void{this.blocked.add(sessionId);this.players.delete(sessionId);this.intent('block',{sessionId});}
    report(sessionId:string,reason:string):void{this.intent('report',{sessionId,reason});}
    offline():void{this.wantOnline=false;this.retry=0;this.pending=[];this.correction=null;void this.room?.leave();this.room=null;this.players.clear();this.status='Chơi một mình';this.onOffline?.();}
    dispose():void{this.disposed=true;void this.room?.leave();this.room=null;this.players.clear();}
}
