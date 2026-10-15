import {Client,CloseCode} from '@colyseus/core';
import {createHmac,randomUUID} from 'node:crypto';
import {VillageRoom} from './VillageRoom';
import {verifyTicket} from '../../backend/src/Auth';
import {ChapterOneProgress,plantingPlots} from '../../game-client/assets/scripts/world/ChapterOneProgress';
import {CampaignEngine} from '../../game-client/assets/scripts/world/CampaignEngine';
import {ActivitySnapshot,restoreActivities} from '../../game-client/assets/scripts/world/ActivitySnapshot';
import {EducationEngine,lessonQuestions,riceQuestions} from '../../game-client/assets/scripts/world/EducationEngine';
import {chapters,AgeBand,miniGameIds} from '../../game-client/assets/scripts/world/CampaignContent';
import {MiniGameRules} from '../../game-client/assets/scripts/world/MiniGameRules';
import {elderTile,farmerTile,toWorld} from '../../game-client/assets/scripts/world/VillageModel';
import {portalDestination} from '../../game-client/assets/scripts/world/WorldZones';
import {contentVersion} from '../../game-client/assets/scripts/world/ContentVersion';
import {avatarGestures} from '../../game-client/assets/scripts/world/AvatarGestures';
import {ExpansionGame,ExpansionId,expansionActivities} from '../../game-client/assets/scripts/world/ExpansionActivities';
interface Member {profileId:string;parentId:string;age:AgeBand;blocked:string[];first:ChapterOneProgress;campaign:CampaignEngine;lastEmote:number;activities:ActivitySnapshot|null;cancelledExpansion?:ExpansionId;saveQueue:Promise<unknown>}
export const approvedEmotes=[...avatarGestures.map(g=>g.id),'thanks','your-turn','need-help','bye'] as const;
export class PrivateFriendRoom extends VillageRoom {
    private layoutSnapshot:any;private secret='';private api='';private code='';private members=new Map<string,Member>();
    private participants=new Set<string>();private game?:MiniGameRules;private gameOwner='';private attemptId='';private gameQuest='';
    private expansionGroups=new Map<ExpansionId,{game:ExpansionGame;attempt:string;participants:Set<string>}>();
    async onCreate(options:any={}):Promise<void>{
        if(options.apiUrl){const r=await fetch(options.apiUrl+'/content/layout',{signal:AbortSignal.timeout(5000)});if(!r.ok)throw Error('Layout unavailable');const layout=await r.json() as any;this.map.configureLayout(layout.pack.placements);if(layout.npcs)this.map.configureNpcs(layout.npcs);this.layoutSnapshot=layout;}
        super.onCreate();this.maxClients=20;this.secret=options.secret;this.api=options.apiUrl;this.code=options.roomCode;
        if(typeof this.secret!=='string'||this.secret.length<32||!/^[A-Z0-9]{8}$/.test(this.code))throw Error('Private room configuration invalid');
        this.onMessage('ready',client=>{if(this.layoutSnapshot)client.send('scene-layout',this.layoutSnapshot);client.send('content-version',contentVersion());this.sendProgress(client);this.sendExpansionCancellation(client);for(const [id,group] of this.expansionGroups)if(group.participants.has(client.sessionId))this.publishExpansion(id);client.send('activities-state',{snapshot:this.members.get(client.sessionId)?.activities??null});});
        this.onMessage('activities-save',(client,value:unknown)=>{
            const m=this.members.get(client.sessionId),v=value as {id?:unknown;snapshot?:unknown};
            if(!m||typeof v?.id!=='string'||v.id.length>80||!v.snapshot||typeof v.snapshot!=='object')return;
            const raw=JSON.stringify(v.snapshot);if(raw.length>240000)return;
            const snapshot=JSON.stringify(restoreActivities(v.snapshot));
            m.saveQueue=m.saveQueue.then(async()=>{const saved=await this.service('/internal/activities',{profileId:m.profileId,snapshot});m.activities=saved.snapshot;Object.assign(m.campaign.data,restoreActivities(saved.snapshot));(client.auth as any).activities=saved.snapshot;client.send('activities-state',{id:v.id,snapshot:saved.snapshot});}).catch(()=>this.warn(client,'Hoạt động chưa đồng bộ được. Bản lưu trên máy vẫn còn.'));
        });
        this.onMessage('journey-answer',(client,value:unknown)=>{const member=this.members.get(client.sessionId),v=value as any;if(!member||typeof v?.id!=='string'||!Number.isInteger(v.round)||!Number.isInteger(v.index))return;member.campaign.answerJourney(v.id,v.round,v.index);this.persist(client,member);});
        this.onMessage('portal',(client,value:unknown)=>{const p=this.state.players.get(client.sessionId),id=(value as any)?.id;if(!p||typeof id!=='string')return;const target=portalDestination(p,id,this.members.get(client.sessionId)?.campaign.level??1);if(target)this.relocate(client,target);});
        this.onMessage('probe',(client,value:unknown)=>{if(typeof value==='number'&&Number.isFinite(value))client.send('probe',value);});
        this.onMessage('emote',(client,value:unknown)=>{
            const id=(value as any)?.id,m=this.members.get(client.sessionId);if(!m||!(approvedEmotes as readonly string[]).includes(id)||Date.now()-m.lastEmote<2000)return;m.lastEmote=Date.now();
            for(const target of this.clients){const t=this.members.get(target.sessionId);if(t&&!t.blocked.includes(m.profileId)&&!m.blocked.includes(t.profileId))target.send('emote',{sessionId:client.sessionId,id});}
        });
        this.onMessage('block',(client,value:unknown)=>{const m=this.members.get(client.sessionId),target=this.members.get((value as any)?.sessionId);if(!m||!target||m===target)return;if(!m.blocked.includes(target.profileId))m.blocked.push(target.profileId);for(const [id,group] of this.expansionGroups)if(group.participants.has(client.sessionId)&&group.participants.has((value as any).sessionId)){target.cancelledExpansion=id;this.leaveExpansion((value as any).sessionId);const peer=this.clients.find(c=>c.sessionId===(value as any).sessionId);if(peer)this.sendExpansionCancellation(peer);}void this.service('/internal/block',{profileId:m.profileId,target:target.profileId}).catch(()=>this.warn(client,'Chưa lưu được chặn. Phiên này vẫn ẩn bạn đã chọn.'));client.send('blocked',{sessionId:(value as any).sessionId});});
        this.onMessage('report',(client,value:unknown)=>{const m=this.members.get(client.sessionId),v=value as any,target=this.members.get(v?.sessionId);if(!m||!target||!['spam','uncomfortable','other'].includes(v?.reason))return;void this.service('/internal/report',{profileId:m.profileId,target:target.profileId,reason:v.reason}).then(()=>client.send('report-sent',{})).catch(()=>this.warn(client,'Chưa gửi được báo cáo. Mời người lớn giúp.'));});
        this.onMessage('story',(client,value:unknown)=>this.story(client,value));
        this.onMessage('expansion-start',(client,value:unknown)=>{
            const member=this.members.get(client.sessionId),id=(value as {id?:unknown})?.id;
            if(!member||!expansionActivities.some(a=>a.id===id))return;
            const key=id as ExpansionId;if(this.expansionGroups.get(key)?.participants.has(client.sessionId)){this.publishExpansion(key);return;}this.leaveExpansion(client.sessionId);
            let group=this.expansionGroups.get(key);
            if(!group||group.game.ended){const checkpoint=member.activities?.expansionProgress?.[key];group={game:new ExpansionGame(key,member.age,checkpoint?.age===member.age?checkpoint.step:0),attempt:randomUUID(),participants:new Set()};this.expansionGroups.set(key,group);}
            if(group.participants.size>=4){client.send('expansion-feedback',{id:key,message:'Nhóm đã đủ bốn bạn. Bé có thể luyện một mình.'});return;}
            if(Array.from(group.participants).some(session=>{const peer=this.members.get(session);return peer&&(peer.blocked.includes(member.profileId)||member.blocked.includes(peer.profileId));})){client.send('expansion-feedback',{id:key,message:'Không thể vào nhóm này. Bé có thể luyện một mình hoặc chọn nhóm khác.'});return;}
            group.participants.add(client.sessionId);this.publishExpansion(key);
        });
        this.onMessage('expansion-choice',(client,value:unknown)=>{
            const v=value as {id?:unknown;attempt?:unknown;step?:unknown;index?:unknown},group=this.expansionGroups.get(v?.id as ExpansionId),member=this.members.get(client.sessionId);
            if(!member||!group||!group.participants.has(client.sessionId)||group.game.ended||v.attempt!==group.attempt||v.step!==group.game.step||!Number.isInteger(v.index))return;
            if(Array.from(group.participants).some(session=>{const peer=this.members.get(session);return peer&&(peer.blocked.includes(member.profileId)||member.blocked.includes(peer.profileId));})){this.leaveExpansion(client.sessionId);return;}
            if(!group.game.choose(v.index as number)){client.send('expansion-feedback',{id:group.game.id,message:group.game.feedback});return;}
            for(const session of group.participants){const m=this.members.get(session);if(!m)continue;
                const patch={profileId:m.profileId,id:group.game.id,step:group.game.ended?0:group.game.step,age:group.game.age,completed:group.game.ended};
                m.saveQueue=m.saveQueue.then(async()=>{const saved=await this.service('/internal/expansion-progress',patch);m.activities=saved.snapshot;Object.assign(m.campaign.data,restoreActivities(saved.snapshot));const peer=this.clients.find(c=>c.sessionId===session);if(peer){(peer.auth as any).activities=saved.snapshot;peer.send('activities-state',{snapshot:saved.snapshot});}}).catch(()=>{const peer=this.clients.find(c=>c.sessionId===session);if(peer)this.warn(peer,'Kết quả nhóm chưa lưu được. Hãy giữ trang mở và thử lại.');});
            }
            this.publishExpansion(group.game.id);
        });
        this.onMessage('expansion-leave',client=>this.leaveExpansion(client.sessionId));
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
            else if(this.game.status==='running')client.send('game-feedback',{id:this.game.id,message:this.game.feedback.slice(0,200)});
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
        super.onJoin(client);const p=client.auth as any,first=new ChapterOneProgress(),campaign=new CampaignEngine();if(p.trusted){first.restore(JSON.stringify(p.trusted.chapterOne));campaign.restore(JSON.stringify(p.trusted.campaign));}campaign.data.age=p.age;if(p.avatar!==undefined)campaign.data.avatar=p.avatar;const player=this.state.players.get(client.sessionId);if(player){player.name=p.label;player.age=p.age;player.avatar=campaign.data.avatar;}campaign.syncChapterOne(first.data);campaign.preserveLearningFrom(p.backup);if(p.activities)Object.assign(campaign.data,restoreActivities(p.activities));
        this.members.set(client.sessionId,{profileId:p.id,parentId:p.parentId,age:p.age,blocked:p.blocked,first,campaign,lastEmote:0,activities:p.activities?restoreActivities(p.activities):null,saveQueue:Promise.resolve()});
    }
    async onLeave(client:Client,code?:number):Promise<void>{
        if(client.sessionId===this.gameOwner&&this.game&&!this.game.ended){this.game.pause();this.publishGame();}
        if(code!==CloseCode.CONSENTED&&code!==4403&&code!==4008){try{await this.allowReconnection(client,15);this.sendProgress(client);this.sendExpansionCancellation(client);for(const [id,group] of this.expansionGroups)if(group.participants.has(client.sessionId))this.publishExpansion(id);return;}catch{}}
        this.leaveExpansion(client.sessionId);this.participants.delete(client.sessionId);this.members.delete(client.sessionId);super.onLeave(client);
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
    private sendExpansionCancellation(client:Client):void{const m=this.members.get(client.sessionId);if(m?.cancelledExpansion){client.send('expansion-feedback',{id:m.cancelledExpansion,cancelled:true,message:'Nhóm đã thay đổi. Bé có thể luyện một mình hoặc chọn nhóm khác.'});delete m.cancelledExpansion;}}
    private leaveExpansion(session:string):void{
        for(const [id,group] of this.expansionGroups)if(group.participants.delete(session)){if(!group.participants.size)this.expansionGroups.delete(id);else this.publishExpansion(id);}
    }
    private publishExpansion(id:ExpansionId):void{
        const group=this.expansionGroups.get(id);if(!group)return;
        const state={id,age:group.game.age,step:group.game.step,attempt:group.attempt,players:group.participants.size};
        for(const client of this.clients)if(group.participants.has(client.sessionId))client.send('expansion-state',state);
    }
    private persist(client:Client,m:Member):void{this.sendProgress(client);const payload={profileId:m.profileId,first:JSON.stringify(m.first.data),campaign:JSON.stringify(m.campaign.data)};m.saveQueue=m.saveQueue.then(()=>this.service('/internal/progress',payload)).catch(()=>{client.send('storage-warning','Kết nối lưu tiến độ chưa sẵn sàng. Mời người lớn giúp.');});}
    private warn(client:Client,text:string):void{if(this.clients.includes(client))client.send('storage-warning',text);}
    private publishGame():void{if(this.game)this.state.gameJson=JSON.stringify({...this.game.save(),paused:this.game.status==='paused'});}
    private async service(path:string,body:unknown):Promise<any>{
        const raw=JSON.stringify(body),signature=createHmac('sha256',this.secret).update(raw).digest('hex');const response=await fetch(this.api+path,{method:'POST',headers:{'content-type':'application/json','x-service-signature':signature},body:raw,signal:AbortSignal.timeout(5000)});if(!response.ok)throw Error('Parent service unavailable');return response.json();
    }
}
export class MiniGameRoom extends PrivateFriendRoom {async onCreate(options:any={}):Promise<void>{await super.onCreate(options);this.maxClients=4;}}
