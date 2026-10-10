import {Client,CloseCode} from '@colyseus/core';
import {createHmac,randomUUID} from 'node:crypto';
import {VillageRoom} from './VillageRoom';
import {verifyTicket} from '../../backend/src/Auth';
import {ChapterOneProgress,plantingPlots} from '../../game-client/assets/scripts/world/ChapterOneProgress';
import {CampaignEngine} from '../../game-client/assets/scripts/world/CampaignEngine';
import {EducationEngine,lessonQuestions,riceQuestions} from '../../game-client/assets/scripts/world/EducationEngine';
import {chapters,AgeBand,miniGameIds} from '../../game-client/assets/scripts/world/CampaignContent';
import {MiniGameRules} from '../../game-client/assets/scripts/world/MiniGameRules';
import {elderTile,farmerTile,toWorld} from '../../game-client/assets/scripts/world/VillageModel';
import {portalDestination} from '../../game-client/assets/scripts/world/WorldZones';
import {contentVersion} from '../../game-client/assets/scripts/world/ContentVersion';
interface Member {profileId:string;parentId:string;age:AgeBand;blocked:string[];first:ChapterOneProgress;campaign:CampaignEngine;lastEmote:number;saveQueue:Promise<unknown>}
export const approvedEmotes=['hello','happy','thanks','your-turn','need-help','bye'] as const;
export class PrivateFriendRoom extends VillageRoom {
    private secret='';private api='';private code='';private members=new Map<string,Member>();
    private participants=new Set<string>();private game?:MiniGameRules;private gameOwner='';private attemptId='';private gameQuest='';
    onCreate(options:any={}):void{
        super.onCreate();this.maxClients=20;this.secret=options.secret;this.api=options.apiUrl;this.code=options.roomCode;
        if(typeof this.secret!=='string'||this.secret.length<32||!/^[A-Z0-9]{8}$/.test(this.code))throw Error('Private room configuration invalid');
        this.onMessage('ready',client=>{client.send('content-version',contentVersion());this.sendProgress(client);});
        this.onMessage('portal',(client,value:unknown)=>{const p=this.state.players.get(client.sessionId),id=(value as any)?.id;if(!p||typeof id!=='string')return;const target=portalDestination(p,id);if(target)this.relocate(client,target);});
        this.onMessage('probe',(client,value:unknown)=>{if(typeof value==='number'&&Number.isFinite(value))client.send('probe',value);});
        this.onMessage('emote',(client,value:unknown)=>{
            const id=(value as any)?.id,m=this.members.get(client.sessionId);if(!m||!(approvedEmotes as readonly string[]).includes(id)||Date.now()-m.lastEmote<2000)return;m.lastEmote=Date.now();
            for(const target of this.clients){const t=this.members.get(target.sessionId);if(t&&!t.blocked.includes(m.profileId)&&!m.blocked.includes(t.profileId))target.send('emote',{sessionId:client.sessionId,id});}
        });
        this.onMessage('block',(client,value:unknown)=>{const m=this.members.get(client.sessionId),target=this.members.get((value as any)?.sessionId);if(!m||!target||m===target)return;if(!m.blocked.includes(target.profileId))m.blocked.push(target.profileId);void this.service('/internal/block',{profileId:m.profileId,target:target.profileId}).catch(()=>this.warn(client,'Chưa lưu được chặn. Phiên này vẫn ẩn bạn đã chọn.'));client.send('blocked',{sessionId:(value as any).sessionId});});
        this.onMessage('report',(client,value:unknown)=>{const m=this.members.get(client.sessionId),v=value as any,target=this.members.get(v?.sessionId);if(!m||!target||!['spam','uncomfortable','other'].includes(v?.reason))return;void this.service('/internal/report',{profileId:m.profileId,target:target.profileId,reason:v.reason}).then(()=>client.send('report-sent',{})).catch(()=>this.warn(client,'Chưa gửi được báo cáo. Mời người lớn giúp.'));});
        this.onMessage('story',(client,value:unknown)=>this.story(client,value));
        this.onMessage('chapter-intro',(client,value:unknown)=>{const m=this.members.get(client.sessionId),index=(value as any)?.index;if(m&&Number.isInteger(index)&&m.campaign.introduce(index))this.persist(client,m);});
        this.onMessage('claim-star',(client,value:unknown)=>{const m=this.members.get(client.sessionId),index=(value as any)?.index;if(m&&Number.isInteger(index)&&m.campaign.claim(index))this.persist(client,m);else this.sendProgress(client);});
        this.onMessage('lesson-answer',(client,value:unknown)=>{
            const m=this.members.get(client.sessionId),v=value as any;if(!m||typeof v?.questId!=='string'||!m.campaign.available(v.questId)||m.campaign.data.completed.includes(v.questId))return;
            const q=chapters.flatMap(c=>c.quests).find(q=>q.id===v.questId);if(!q?.lesson)return;const round=m.campaign.data.resume[q.id]?.data??0;if(v.round!==round)return;
            const lesson=new EducationEngine(lessonQuestions(q.lesson,m.age),round as number);if(!lesson.answer(v.index))return;m.campaign.data.resume[q.id]={kind:'lesson',data:lesson.round};if(lesson.complete)m.campaign.complete(q.id);this.persist(client,m);
        });
        this.onMessage('start-game',(client,value:unknown)=>{
            const m=this.members.get(client.sessionId),id=(value as any)?.questId;if(!m||typeof id!=='string'||!m.campaign.available(id)||m.campaign.data.completed.includes(id))return;const q=chapters.flatMap(c=>c.quests).find(q=>q.id===id);if(!q?.game)return;
            if(this.game&&!this.game.ended){if(this.gameQuest===id&&this.participants.size<4)this.participants.add(client.sessionId);if(client.sessionId===this.gameOwner||!this.members.has(this.gameOwner)){this.gameOwner=client.sessionId;this.game.resume();}this.publishGame();return;}const resume=m.campaign.data.resume[id];try{this.game=resume?.kind==='game'?MiniGameRules.restore(resume.data):new MiniGameRules(q.game as any,m.age);}catch{this.game=new MiniGameRules(q.game as any,m.age);}this.game.resume();this.gameOwner=client.sessionId;this.participants=new Set([client.sessionId,...Array.from(this.members.entries()).filter(([id,member])=>id!==client.sessionId&&member.campaign.available(q.id)&&!member.campaign.data.completed.includes(q.id)).slice(0,3).map(([id])=>id)]);this.attemptId=randomUUID();this.gameQuest=id;this.state.gameQuest=id;this.publishGame();
        });
        this.onMessage('game-action',(client,value:unknown)=>{
            const m=this.members.get(client.sessionId),v=value as any;if(!m||!this.participants.has(client.sessionId)||!this.game||this.game.ended||!m.campaign.available(this.gameQuest)||typeof v?.type!=='string'||!Number.isInteger(v.index))return;
            if(this.game.action(v.type,v.index)){this.publishGame();for(const peer of this.clients){const member=this.members.get(peer.sessionId);if(this.participants.has(peer.sessionId)&&member?.campaign.available(this.gameQuest)&&!member.campaign.data.completed.includes(this.gameQuest)){member.campaign.data.resume[this.gameQuest]={kind:'game',data:this.game.save()};if(this.game.ended){member.campaign.complete(this.gameQuest);void this.service('/internal/result',{profileId:member.profileId,gameId:this.game.id,attemptId:this.attemptId}).catch(()=>this.warn(peer,'Kết quả chưa lưu được. Mời người lớn giữ bản sao.'));}this.persist(peer,member);}}}
        });
        this.onMessage('pause-game',(client,value:unknown)=>{if(client.sessionId===this.gameOwner&&this.game){(value as any)?.paused?this.game.pause():this.game.resume();this.publishGame();if(this.game.status==='paused')for(const peer of this.clients){const member=this.members.get(peer.sessionId);if(member&&this.participants.has(peer.sessionId)){member.campaign.data.resume[this.gameQuest]={kind:'game',data:this.game.save()};this.persist(peer,member);}}}});
        this.setSimulationInterval(dt=>{if(this.game&&!this.game.ended){this.game.advance(dt/1000);this.publishGame();}},100);
        this.clock.setInterval(()=>{for(const client of this.clients){const m=this.members.get(client.sessionId);if(m)void this.service('/internal/profile',{profileId:m.profileId,roomCode:this.code,existing:true}).catch(()=>client.leave(4403));}},30000);
    }
    async onAuth(client:Client,options:any):Promise<any>{
        const ticket=verifyTicket(options.ticket,this.secret);if(!ticket||ticket.roomCode!==this.code)throw Error('Parent invitation required');
        const profile=await this.service('/internal/profile',{profileId:ticket.profileId,roomCode:this.code});
        if(Array.from(this.members.values()).some(m=>m.profileId===ticket.profileId||m.blocked.includes(ticket.profileId)||profile.blocked.includes(m.profileId)))throw Error('Profile already present or blocked');
        return profile;
    }
    onJoin(client:Client):void{
        super.onJoin(client);const p=client.auth as any,first=new ChapterOneProgress(),campaign=new CampaignEngine();if(p.trusted){first.restore(JSON.stringify(p.trusted.chapterOne));campaign.restore(JSON.stringify(p.trusted.campaign));}campaign.data.age=p.age;campaign.syncChapterOne(first.data);
        this.members.set(client.sessionId,{profileId:p.id,parentId:p.parentId,age:p.age,blocked:p.blocked,first,campaign,lastEmote:0,saveQueue:Promise.resolve()});
    }
    async onLeave(client:Client,code?:number):Promise<void>{
        if(client.sessionId===this.gameOwner&&this.game&&!this.game.ended){this.game.pause();this.publishGame();}
        if(code!==CloseCode.CONSENTED&&code!==4403&&code!==4008){try{await this.allowReconnection(client,15);this.sendProgress(client);return;}catch{}}
        this.participants.delete(client.sessionId);this.members.delete(client.sessionId);super.onLeave(client);
    }
    private story(client:Client,value:unknown):void{
        const m=this.members.get(client.sessionId),v=value as any,p=this.state.players.get(client.sessionId);if(!m||!p||typeof v?.type!=='string')return;
        const near=(tile:{x:number;y:number},distance=55)=>{const w=toWorld(tile);return Math.hypot(p.x-w.x,p.y-w.y)<distance;};let accepted=false;
        if(v.type==='enter')accepted=m.first.enterVillage();
        else if(v.type==='greet'&&near(elderTile))accepted=m.first.greet();
        else if(v.type==='accept'&&near(farmerTile))accepted=m.first.accept();
        else if(v.type==='plant'&&Number.isInteger(v.index)&&plantingPlots[v.index]&&near(plantingPlots[v.index],9))accepted=m.first.plant(v.index);
        else if(v.type==='count'&&near(farmerTile)&&v.round===m.first.data.countRound&&riceQuestions[v.round]?.count===v.value)accepted=m.first.finishCountRound();
        else if(v.type==='turn-in'&&near(elderTile))accepted=m.first.turnIn();
        if(accepted){m.campaign.syncChapterOne(m.first.data);this.persist(client,m);}else this.sendProgress(client);
    }
    private sendProgress(client:Client):void{const m=this.members.get(client.sessionId);if(m)client.send('progress-state',{first:m.first.data,campaign:m.campaign.data});}
    private persist(client:Client,m:Member):void{this.sendProgress(client);const payload={profileId:m.profileId,first:JSON.stringify(m.first.data),campaign:JSON.stringify(m.campaign.data)};m.saveQueue=m.saveQueue.then(()=>this.service('/internal/progress',payload)).catch(()=>{client.send('storage-warning','Kết nối lưu tiến độ chưa sẵn sàng. Mời người lớn giúp.');});}
    private warn(client:Client,text:string):void{if(this.clients.includes(client))client.send('storage-warning',text);}
    private publishGame():void{if(this.game)this.state.gameJson=JSON.stringify({...this.game.save(),paused:this.game.status==='paused'});}
    private async service(path:string,body:unknown):Promise<any>{
        const raw=JSON.stringify(body),signature=createHmac('sha256',this.secret).update(raw).digest('hex');const response=await fetch(this.api+path,{method:'POST',headers:{'content-type':'application/json','x-service-signature':signature},body:raw,signal:AbortSignal.timeout(5000)});if(!response.ok)throw Error('Parent service unavailable');return response.json();
    }
}
export class MiniGameRoom extends PrivateFriendRoom {onCreate(options:any={}):void{super.onCreate(options);this.maxClients=4;}}
