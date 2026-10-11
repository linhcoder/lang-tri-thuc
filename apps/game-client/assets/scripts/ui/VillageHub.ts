import {paintModalFrame,paintModalButton,modalButtonColor} from './ModalTheme';
import { Color, Graphics, HorizontalTextAlignment, Label, Node, UITransform, Vec3, sys } from 'cc';
import { CampaignSave } from '../world/CampaignSave';
import { ChapterOneSave } from '../world/ChapterOneSave';
import { AgeBand, chapters, miniGameIds, MiniGameId, storyNpcs,seasonalActivities } from '../world/CampaignContent';
import { EducationEngine, lessonQuestions } from '../world/EducationEngine';
import { gameNames, MiniGameRules } from '../world/MiniGameRules';
import { CampaignEngine } from '../world/CampaignEngine';
import { worldZones } from '../world/WorldZones';
import { Point, toWorld,tileAt,villageDetails,environmentGuides } from '../world/VillageModel';
import { PlayerController } from '../player/PlayerController';
import { SpeechReader } from './SpeechReader';
import { MiniGameView } from './MiniGameView';
import {paintVillageMap} from './VillageHUD';
import {AvatarGesture,avatarGestures} from '../world/AvatarGestures';
import {traditionalFestivals} from '../world/TraditionalFestivals';
import {downloadPainting} from '../world/PaintingExport';
import {festivalDateLabel} from '../world/FestivalCalendar';
import {folkPuzzleTile} from './FolkPuzzleArt';
import {careActivities,isCareId,PaintStroke,paintColors,paintBounds,maxPaintStrokes,maxPaintPoints} from '../world/VillageActivities';
interface Button {node:Node;width:number;action:()=>void}
type Mode='menu'|'gestures'|'achievements'|'settings'|'journal'|'chapter'|'lesson'|'game'|'gate'|'parent'|'age'|'quality'|'avatar'|'accessory'|'hair'|'activities'|'inventory'|'map'|'reset'|'help'|'online'|'home'|'explore'|'collection'|'care'|'painting'|'holidays'|'holiday';
export class VillageHub {
    onGesture?:(id:AvatarGesture)=>void;
    onAvatarPreview?:(parent:Node,id:number,hair?:number)=>void;
    onDetailPreview?:(parent:Node,id:string)=>void;
    onChapterIntro?:(index:number)=>void;onClaim?:(index:number)=>void;
    onLessonAnswer?:(data:{questId:string;round:number;index:number})=>void;
    onGameStart?:(questId:string)=>void;onGameAction?:(type:string,index:number)=>void;onGamePause?:(paused:boolean)=>void;
    onActivitySave?:()=>void;
    onPortal?:(id:string)=>void;private usePortal=false;onOnline?:(action:string,id?:string)=>void;onlinePeers?:()=>Array<{id:string;name:string}>;private mapPage=0;private peerIndex=0;readonly node:Node;readonly npcNodes:Node[]=[];
    readonly campaign:CampaignEngine;
    private reader=new SpeechReader();private spokenParts:string[]=[];private readingButton?:Label;private readingNotice?:Label;
    private practice=false;private activityPage=0;private festivalOnly=false;private mode:Mode='journal';private chapterIndex=1;private questId='';private buttons:Button[]=[];private message='';
    private dragPiece?:{index:number;node:Node};
    private boardState='';private gameBoard?:MiniGameView;private lesson?:EducationEngine;private game?:MiniGameRules;private indicator?:Graphics;
    private serverGameSignature='';private gateAnswer=0;private pendingNpc:number|null=null;private syncSignature='';private lastRhythm:boolean|null=null;
    private pendingDetail:string|null=null;private selectedDetail:string|null=null;
    private selectedHoliday='tet';private holidayRun:string|null=null;
    private startHolidayGame():void{const holiday=traditionalFestivals.find(h=>h.id===this.selectedHoliday)!;this.practice=true;this.holidayRun=holiday.id;this.questId='';this.lesson=undefined;const saved=this.campaign.data.practiceResume?.[holiday.game];try{this.game=saved?MiniGameRules.restore(saved):new MiniGameRules(holiday.game,this.campaign.data.age);}catch{this.game=new MiniGameRules(holiday.game,this.campaign.data.age);}this.game.resume();this.mode='game';this.message='';this.render();}
    private holidayArt(id:string):void{const n=this.make(this.node,'HolidayArt',130,80);n.setPosition(0,80);const g=n.addComponent(Graphics);if(id==='tet'){g.fillColor=new Color(60,126,68);g.roundRect(-48,-27,96,54,8);g.fill();g.strokeColor=new Color(246,218,134);g.lineWidth=4;for(const x of [-17,17]){g.moveTo(x,-27);g.lineTo(x,27);g.stroke();}for(const y of [-10,10]){g.moveTo(-48,y);g.lineTo(48,y);g.stroke();}}else{g.fillColor=new Color(249,216,114);g.circle(42,12,18);g.fill();g.fillColor=new Color(221,88,55);for(let i=0;i<10;i++){const a=Math.PI/2+i*Math.PI/5,r=i%2?14:32;if(!i)g.moveTo(Math.cos(a)*r-15,Math.sin(a)*r);else g.lineTo(Math.cos(a)*r-15,Math.sin(a)*r);}g.close();g.fill();g.strokeColor=new Color(145,91,44);g.lineWidth=2;g.moveTo(-15,-32);g.lineTo(-15,-42);g.stroke();}}
    private npcDestination?:Point;private npcReplan=0;
    private paintColor=0;private paintingGraphic?:Graphics;private paintStroke?:PaintStroke;private clearPainting=false;private clearedPainting?:PaintStroke[];
    private paintingPoint(point:Point):Point|null{const p=this.node.getComponent(UITransform)!.convertToNodeSpaceAR(new Vec3(point.x,point.y));return Math.abs(p.x)<=paintBounds.x&&Math.abs(p.y-30)<=paintBounds.y?{x:Math.round(p.x),y:Math.round(p.y-30)}:null;}
    private drawPainting():void{
        const g=this.paintingGraphic;if(!g)return;g.clear();g.fillColor=new Color(255,251,231);g.roundRect(-270,-125,540,250,10);g.fill();g.lineWidth=7;g.lineCap=Graphics.LineCap.ROUND;g.lineJoin=Graphics.LineJoin.ROUND;
        for(const stroke of [...(this.campaign.data.painting??[]),...(this.paintStroke?[this.paintStroke]:[])]){g.fillColor=g.strokeColor=new Color(...paintColors[stroke.color]);const first=stroke.points[0];if(!first)continue;g.circle(first.x,first.y,3.5);g.fill();g.moveTo(first.x,first.y);for(const p of stroke.points.slice(1))g.lineTo(p.x,p.y);if(stroke.points.length>1)g.stroke();}
    }
    selectDetail(world:Point):'accepted'|'blocked'|null{
        const detail=villageDetails.find(d=>environmentGuides.some(g=>g.id===d.id)&&Math.abs(world.x-toWorld(d).x)<=d.width/2&&world.y>=toWorld(d).y-10&&world.y<=toWorld(d).y+d.height);
        if(!detail)return null;
        return this.approachDetail(detail.id)?'accepted':'blocked';
    }
    private approachDetail(id:string):boolean{
        const detail=villageDetails.find(d=>d.id===id);if(!detail)return false;
        const candidates=[{x:detail.x+1,y:detail.y},{x:detail.x-1,y:detail.y},{x:detail.x,y:detail.y+1},{x:detail.x,y:detail.y-1}];
        candidates.sort((a,b)=>{const pa=toWorld(a),pb=toWorld(b);return Math.hypot(pa.x-this.player.position.x,pa.y-this.player.position.y)-Math.hypot(pb.x-this.player.position.x,pb.y-this.player.position.y);});
        for(const goal of candidates)if(this.player.goTo(goal)){this.pendingDetail=detail.id;this.pendingNpc=null;this.destination(goal);return true;}return false;
    }
    constructor(parent:Node,actors:Node,readonly save:CampaignSave,private first:ChapterOneSave,private player:PlayerController,private reset:()=>void,private destination:(p:Point)=>void){
        this.campaign=save.engine;this.node=this.make(parent,'VillageHub',620,560);paintModalFrame(this.node);this.node.active=false;
        for(const npc of storyNpcs){const n=this.make(actors,npc.id,70,110),p=toWorld(npc);n.setPosition(p.x,p.y);const g=n.addComponent(Graphics);g.fillColor=new Color(...npc.color);g.roundRect(-20,10,40,55,10);g.fill();g.fillColor=new Color(250,214,174);g.circle(0,82,18);g.fill();g.fillColor=new Color(55,45,35);g.circle(-6,84,2);g.circle(6,84,2);g.fill();this.text(n,npc.name,0,125,235,45,18);this.npcNodes.push(n);}
        this.syncFirst();
    }
    private make(parent:Node,name:string,width:number,height:number):Node{const n=new Node(name);n.layer=parent.layer;parent.addChild(n);n.addComponent(UITransform).setContentSize(width,height);return n;}
    private text(parent:Node,value:string,x:number,y:number,width=560,height=75,size=24):Node{if(parent===this.node)this.spokenParts.push(value);const n=this.make(parent,'Text',width,height);n.setPosition(x,y);const l=n.addComponent(Label);l.string=value;l.fontSize=size;l.lineHeight=size+8;l.enableWrapText=true;l.overflow=Label.Overflow.CLAMP;l.color=parent===this.node&&y>=210?new Color(255,245,211):new Color(70,63,40);if(parent===this.node&&y>=210)n.getComponent(UITransform)!.setContentSize(Math.min(width,536),height);return n;}
    private button(id:string,label:string,x:number,y:number,width:number,action:()=>void):Node{const n=this.make(this.node,id,width,76);n.setPosition(x,y);paintModalButton(n,id);const caption=this.text(n,label,0,0,width-20,70,21);caption.getComponent(Label)!.color=modalButtonColor(id);caption.getComponent(Label)!.overflow=Label.Overflow.SHRINK;this.buttons.push({node:n,width,action});return n;}
    private grid(items:Array<{id:string;label:string;action:()=>void}>,columns=2):void{const width=columns===1?560:columns===2?280:165;items.forEach((b,i)=>this.button(b.id,b.label,(i%columns-(columns-1)/2)*(width+12),120-Math.floor(i/columns)*92,width,b.action));}
    private chapterTasks():void{
        const chapter=chapters[this.chapterIndex],done=chapter.quests.filter(q=>this.campaign.data.completed.includes(q.id)).length;
        this.readingNotice=this.text(this.node,`${chapter.npc} • ${done}/${chapter.quests.length} việc đã xong`,0,160,540,35,19).getComponent(Label)!;
        chapter.quests.forEach((q,i)=>{
            const complete=this.campaign.data.completed.includes(q.id),ready=this.campaign.available(q.id)&&!complete;
            const row=this.button(q.id,q.title,0,chapter.quests.length===4?99-i*81:94-i*94,550,()=>{
                if(complete||!ready)return;
                this.startQuest(q.id);
            });
            const g=row.getComponent(Graphics)!;g.clear();g.fillColor=new Color(151,112,57);g.roundRect(-275,-38,550,76,12);g.fill();
            g.fillColor=ready?new Color(237,241,202):complete?new Color(245,239,210):new Color(237,228,204);g.roundRect(-273,-36,546,72,10);g.fill();
            g.fillColor=ready?new Color(71,113,66):complete?new Color(104,132,76):new Color(175,157,119);g.circle(-235,0,22);g.fill();
            const badge=this.text(row,complete?'✓':String(i+1),-235,0,40,36,23);badge.getComponent(Label)!.color=new Color(255,249,220);
            const title=row.getChildByName('Text')!,label=title.getComponent(Label)!;title.setPosition(25,13);title.getComponent(UITransform)!.setContentSize(430,32);label.fontSize=23;label.lineHeight=30;label.horizontalAlign=HorizontalTextAlignment.LEFT;label.color=new Color(65,62,38);
            const status=this.text(row,complete?'Đã hoàn thành':ready?'Chạm để bắt đầu':'Mở sau khi xong việc trước',25,-17,430,25,16).getComponent(Label)!;status.horizontalAlign=HorizontalTextAlignment.LEFT;status.color=ready?new Color(55,99,50):new Color(117,105,76);
            this.spokenParts.push(q.title+' '+status.string);
        });
    }
    private mapChoices(items:Array<{id:string;label:string;action:()=>void}>):void{
        const map=this.make(this.node,'IllustratedVillageMap',560,170);map.setPosition(0,85);paintVillageMap(map.addComponent(Graphics),.14,true);
        const p=this.player.position,pin=this.make(map,'CurrentPosition',12,12);pin.setPosition(p.x*.14,(p.y+640)*.14);const g=pin.addComponent(Graphics);g.fillColor=new Color(220,63,40);g.circle(0,0,5);g.fill();
        items.forEach((item,i)=>{const h=sys.isMobile?96:48;const n=this.button(item.id,item.label,(i%2-.5)*290,-35-Math.floor(i/2)*(h+9),280,item.action);n.getComponent(UITransform)!.setContentSize(280,h);const g=n.getComponent(Graphics)!;g.clear();g.fillColor=new Color(191,144,65);g.roundRect(-140,-h/2,280,h,8);g.fill();g.fillColor=new Color(251,237,194);g.roundRect(-137,-h/2+3,274,h-6,6);g.fill();const l=n.getChildByName('Text')!.getComponent(Label)!;l.node.getComponent(UITransform)!.setContentSize(268,h-4);l.fontSize=sys.isMobile?28:18;l.lineHeight=sys.isMobile?32:22;});
    }
    private persist():void{if(this.practice&&this.game){const checkpoints=this.campaign.data.practiceResume??={};if(this.game.ended)delete checkpoints[this.game.id];else checkpoints[this.game.id]=this.game.save();}this.onActivitySave?.();this.save.save();}
    syncFirst():void{const d=this.first.progress.data,signature=[d.greeted,d.planted.length,d.countRound,d.rewardReceipts.length].join(':');if(signature!==this.syncSignature){this.syncSignature=signature;this.campaign.syncChapterOne(d);this.persist();}}
    get objective():string{const index=chapters.findIndex((c,i)=>this.campaign.unlocked(i)&&!this.campaign.data.receipts.includes(`reward.star.${c.id}`));if(index<0)return 'Cây đa đã sáng • 8 Sao Tri Thức';if(index===0)return this.first.progress.description;const c=chapters[index],q=c.quests.find(q=>!this.campaign.data.completed.includes(q.id));return `${c.title} • ${q?.title??'Về nhận sao'}`;}
    applyServerProgress():void{if(this.node.active&&this.mode!=='game'&&this.mode!=='lesson')this.render();}
    refreshActivities():void{if(this.mode!=='painting')this.applyServerProgress();}
    applyServerGame(game:MiniGameRules):void{const q=chapters[this.chapterIndex].quests.find(q=>q.id===this.questId);if(q?.game!==game.id)return;const signature=game.save().actions.length+':'+game.status;this.game=game;if(this.node.active&&this.mode==='game'&&signature!==this.serverGameSignature)this.render();this.serverGameSignature=signature;}
    open(mode:Mode='journal',chapter?:number):void{this.reset();this.game?.pause();if(chapter!==undefined)this.chapterIndex=chapter;this.mode=mode;this.message='';this.node.active=true;if(mode==='gate')this.gateAnswer=12+Math.floor(Math.random()*9);this.render();}
    close():void{this.cancelDrag();this.stopReading();this.game?.pause();if(!this.practice)this.onGamePause?.(true);if(!this.practice&&this.game&&this.questId)this.campaign.data.resume[this.questId]={kind:'game',data:this.game.save()};this.persist();this.node.active=false;}
    cancel():void{this.pendingNpc=null;this.pendingDetail=null;this.cancelDrag();this.stopReading();}
    beginDrag(point:Point):boolean{
        if(this.node.active&&this.mode==='painting'){const p=this.paintingPoint(point);if(!p)return false;if((this.campaign.data.painting?.length??0)>=maxPaintStrokes)return true;this.clearPainting=false;this.paintStroke={color:this.paintColor,points:[p]};this.drawPainting();return true;}
        if(this.dragPiece||!this.node.active||this.mode!=='game'||this.game?.id!=='mg.star-lantern'||this.game.status!=='running'||this.game.data.selected>=0)return false;
        const p=this.node.getComponent(UITransform)!.convertToNodeSpaceAR(new Vec3(point.x,point.y));
        const hit=this.buttons.find(b=>b.node.name.startsWith('GameAction-part-')&&Math.abs(p.x-b.node.position.x)<=b.width/2&&Math.abs(p.y-b.node.position.y)<=38);
        if(!hit)return false;const index=Number(hit.node.name.slice('GameAction-part-'.length));if(this.game.data.placed.includes(index))return false;
        const node=this.make(this.node,'DraggedLanternPiece',60,60),g=node.addComponent(Graphics);g.fillColor=new Color(245,192,61);g.moveTo(0,25);g.lineTo(-25,-20);g.lineTo(25,-20);g.close();g.fill();node.active=false;this.dragPiece={index,node};return true;
    }
    moveDrag(point:Point):void{if(this.paintStroke){const p=this.paintingPoint(point),last=this.paintStroke.points[this.paintStroke.points.length-1];if(p&&Math.hypot(p.x-last.x,p.y-last.y)>=2&&this.paintStroke.points.length<maxPaintPoints){this.paintStroke.points.push(p);this.drawPainting();}}if(this.dragPiece){const p=this.node.getComponent(UITransform)!.convertToNodeSpaceAR(new Vec3(point.x,point.y));this.dragPiece.node.active=true;this.dragPiece.node.setPosition(p.x,p.y);}}
    cancelDrag():void{if(this.paintStroke){this.paintStroke=undefined;this.drawPainting();}if(this.dragPiece){this.dragPiece.node.active=false;this.dragPiece.node.destroy();this.dragPiece=undefined;}}
    endDrag(point:Point,dragged:boolean):boolean{
        if(this.node.active&&this.mode==='painting'){if(this.paintStroke){this.moveDrag(point);(this.campaign.data.painting??=[]).push(this.paintStroke);this.paintStroke=undefined;this.clearedPainting=undefined;this.persist();this.render();}return true;}
        const piece=this.dragPiece;this.cancelDrag();if(!piece||!dragged)return false;
        const p=this.node.getComponent(UITransform)!.convertToNodeSpaceAR(new Vec3(point.x,point.y));
        if(this.mode!=='game'||this.game?.id!=='mg.star-lantern'||Math.abs(p.x)>275||Math.abs(p.y-99)>40)return true;
        if(!this.practice&&this.onGameAction){this.onGameAction('part',piece.index);this.onGameAction('place',piece.index);}
        else if(this.game.action('part',piece.index)){this.game.action('place',piece.index);if(!this.practice)this.campaign.data.resume[this.questId]={kind:'game',data:this.game.save()};this.persist();this.render();}
        return true;
    }
    select(world:Point,minHalfWidth=0):'accepted'|'blocked'|null{
        const index=this.npcNodes.findIndex(n=>{const size=n.getComponent(UITransform)!;return Math.abs(world.x-n.position.x)<=Math.max(size.width/2,minHalfWidth)&&world.y>=n.position.y-12&&world.y<=n.position.y+size.height;});if(index<0)return null;
        return this.approachNpc(index)?'accepted':'blocked';
    }
    private approachNpc(index:number):boolean{
        const node=this.npcNodes[index],npc=tileAt(node.position),candidates=[{x:npc.x+1,y:npc.y},{x:npc.x-1,y:npc.y},{x:npc.x,y:npc.y+1},{x:npc.x,y:npc.y-1}];
        candidates.sort((a,b)=>{const pa=toWorld(a),pb=toWorld(b);return Math.hypot(pa.x-this.player.position.x,pa.y-this.player.position.y)-Math.hypot(pb.x-this.player.position.x,pb.y-this.player.position.y);});
        for(const goal of candidates)if(this.player.goTo(goal)){this.pendingNpc=index;this.pendingDetail=null;this.npcDestination={x:node.position.x,y:node.position.y};this.npcReplan=.5;this.destination(goal);return true;}return false;
    }
    step(dt:number):void{
        if(this.pendingDetail&&!this.player.hasPath){const id=this.pendingDetail,detail=villageDetails.find(d=>d.id===id)!,p=toWorld(detail);if(Math.hypot(p.x-this.player.position.x,p.y-this.player.position.y)<60){this.pendingDetail=null;this.selectedDetail=id;const explored=this.campaign.data.explored??=[];if(!explored.includes(id))explored.push(id);this.persist();this.open('explore');}else if(!this.approachDetail(id))this.pendingDetail=null;}
        if(this.gameBoard&&this.game&&this.node.active&&this.mode==='game')this.gameBoard.update(this.game);this.syncFirst();
        this.npcReplan=Math.max(0,this.npcReplan-dt);
        if(this.pendingNpc!==null){const index=this.pendingNpc,npc=this.npcNodes[index];if(!this.player.hasPath&&Math.hypot(npc.position.x-this.player.position.x,npc.position.y-this.player.position.y)<55){this.pendingNpc=null;this.open('chapter',storyNpcs[index].chapter);}else if(this.npcReplan===0&&(!this.player.hasPath||this.npcDestination&&Math.hypot(npc.position.x-this.npcDestination.x,npc.position.y-this.npcDestination.y)>18)){if(!this.approachNpc(index))this.pendingNpc=null;}}
        if(this.node.active&&this.mode==='game'&&this.game){if(this.practice||!this.onGameAction)this.game.advance(dt);const rhythm=this.game.rhythmOpen;if(this.indicator&&(this.game.id==='mg.tug-of-war'||this.game.id==='mg.bamboo-dance')&&rhythm!==this.lastRhythm){this.lastRhythm=rhythm;this.indicator.clear();this.indicator.fillColor=rhythm?new Color(95,185,90):new Color(185,160,120);this.indicator.roundRect(-220,51,440,10,5);this.indicator.fill();}
            if(this.indicator&&this.game.id==='mg.fishing'){const g=this.indicator;g.clear();g.strokeColor=new Color(90,150,205);g.rect(-70,55,140,45);g.stroke();for(let i=0;i<3;i++){if(this.game.data.observed.includes(i))continue;g.fillColor=[new Color(80,175,120),new Color(230,150,60),new Color(155,110,190)][i];g.ellipse(this.game.fishX(i),75,15,9);g.fill();}}
        }
    }
    handle(point:Point):void{const p=this.node.getComponent(UITransform)!.convertToNodeSpaceAR(new Vec3(point.x,point.y));
        if(this.mode==='game'&&this.game&&this.gameBoard){const local=this.gameBoard.node.getComponent(UITransform)!.convertToNodeSpaceAR(new Vec3(point.x,point.y));const action=this.gameBoard.actionAt(this.game,local.x,local.y);if(action){this.performGameAction(action.type,action.index);return;}}
        const hit=this.buttons.find(b=>Math.abs(p.x-b.node.position.x)<=b.width/2&&Math.abs(p.y-b.node.position.y)<=b.node.getComponent(UITransform)!.height/2);hit?.action();}
    private performGameAction(type:string,index:number):void{
        const game=this.game;if(!game||game.status!=='running')return;
        if(!this.practice&&this.onGameAction){this.onGameAction(type,index);return;}
        game.action(type,index);this.message=game.feedback;
        if(!this.practice)this.campaign.data.resume[this.questId]={kind:'game',data:game.save()};
        this.persist();this.render();
    }
    private finishQuest():void{if(this.practice){if(this.holidayRun&&this.game?.ended){const holiday=traditionalFestivals.find(h=>h.id===this.holidayRun);if(holiday&&this.game.id===holiday.game&&(this.campaign.data.holidayProgress?.[holiday.id]??0)>=2){(this.campaign.data.holidayProgress??={})[holiday.id]=3;if(!this.campaign.data.practice.includes(this.game.id))this.campaign.data.practice.push(this.game.id);this.selectedHoliday=holiday.id;this.persist();this.game=undefined;this.holidayRun=null;this.mode='holiday';this.message='';this.render();return;}}if(this.festivalOnly&&this.game?.ended){const season=seasonalActivities(),progress=this.campaign.data.festivalProgress??={},games=progress[season.key]??=[];if(season.games.includes(this.game.id)&&!games.includes(this.game.id))games.push(this.game.id);}if(this.game?.ended&&!this.campaign.data.practice.includes(this.game.id))this.campaign.data.practice.push(this.game.id);this.persist();this.game=undefined;this.mode='activities';this.message='Đã luyện xong! Sao cốt truyện được giữ nguyên.';this.render();return;}this.campaign.complete(this.questId);this.persist();this.mode='chapter';this.lesson=undefined;this.game=undefined;this.message='Hoàn thành việc này! Không mất điểm khi dùng gợi ý.';this.render();}
    private startQuest(id:string):void{this.practice=false;
        const q=chapters[this.chapterIndex].quests.find(q=>q.id===id);if(!q||!this.campaign.available(id))return;this.questId=id;this.message='';
        const resume=this.campaign.data.resume[id];
        if(q.game){try{this.game=resume?.kind==='game'?MiniGameRules.restore(resume.data):new MiniGameRules(q.game as any,this.campaign.data.age);}catch{this.game=new MiniGameRules(q.game as any,this.campaign.data.age);this.message='Bài chưa đọc được, mình bắt đầu bài này lại nhé.';}this.game.resume();this.mode='game';}
        else{const round=resume?.kind==='lesson'&&typeof resume.data==='number'?resume.data:0;this.lesson=new EducationEngine(lessonQuestions(q.lesson??'fair-play',this.campaign.data.age),round);this.mode='lesson';}
        if(q.game)this.onGameStart?.(q.id);this.render();
    }
    private exportSave():void{if(typeof document==='undefined')return;const raw=JSON.stringify({version:1,chapterOne:this.first.progress.data,campaign:this.campaign.data},null,2),url=URL.createObjectURL(new Blob([raw],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='lang-tri-thuc-progress.json';a.click();URL.revokeObjectURL(url);this.message='Đã tạo bản sao tiến độ, không có tên thật hay tài khoản.';this.render();}
    stopReading():void{this.reader.stop();if(this.readingButton)this.readingButton.string='Nghe';}
    dispose():void{this.cancelDrag();this.stopReading();}
    private readingMessage(value:string):void{if(this.readingNotice){this.readingNotice.string=value;this.readingNotice.fontSize=18;this.readingNotice.lineHeight=26;}}
    private read():void{
        if(this.reader.reading){this.stopReading();return;}
        const message=this.reader.read(this.spokenParts.join('\n'),this.campaign.data.sound,value=>{
            if(this.readingButton)this.readingButton.string='Nghe';
            if(value)this.readingMessage(value);
        });
        if(message)this.readingMessage(message);
        if(this.readingButton)this.readingButton.string=this.reader.reading?'D\u1eebng \u0111\u1ecdc':'Nghe';
    }
    private render():void{
        this.cancelDrag();
        this.stopReading();this.spokenParts=[];this.readingButton=undefined;this.readingNotice=undefined;
        for(const n of [...this.node.children]){n.active=false;n.destroy();}this.buttons=[];this.gameBoard=undefined;this.indicator=undefined;this.lastRhythm=null;
        const titles:Record<Mode,string>={holidays:'SỔ NGÀY LỄ',holiday:'CÙNG VUI NGÀY LỄ',care:'CHĂM GÓC LÀNG',painting:'GÓC VẼ CỦA BÉ',collection:'SỔ KHÁM PHÁ VÀ NGÀY HỘI',explore:'KHÁM PHÁ LÀNG',gestures:'BI\u1ec2U C\u1ea2M',menu:'SỔ TAY CỦA BÉ',achievements:'THÀNH TÍCH CỦA BÉ',settings:'CÀI ĐẶT',activities:'HOẠT ĐỘNG MỞ RỘNG',hair:'CH\u1eccN KI\u1ec2U T\u00d3C',accessory:'KHĂN QUÀNG CỦA BÉ',home:'NHÀ CỦA BÉ',online:'BẠN BÈ • PHÒNG RIÊNG',journal:'SỔ LÀNG • TÁM CHƯƠNG',chapter:chapters[this.chapterIndex].title.toUpperCase(),lesson:'BÀI HỌC',game:this.game?gameNames[this.game.id]:'TRÒ CHƠI',gate:'GÓC PHỤ HUYNH',parent:'PHỤ HUYNH • BẢN THỬ',age:'MỨC HỌC',quality:'HÌNH ẢNH',avatar:'CHỌN NHÂN VẬT',inventory:'SAO VÀ BỘ SƯU TẬP',map:'BẢN ĐỒ LÀNG',reset:'XÁC NHẬN XÓA SỔ',help:'HƯỚNG DẪN TRÒ CHƠI'};
        const heading=['chapter','activities','collection','explore','care','painting','holidays','holiday'].includes(this.mode)?titles[this.mode]:this.message||titles[this.mode];
        this.readingNotice=this.text(this.node,heading,0,225,590,65,this.message&&heading===this.message?20:26).getComponent(Label)!;const close=this.button('HubClose',this.mode==='chapter'?'Về làng':'Đóng',this.mode==='chapter'?145:0,-235,this.mode==='chapter'?260:155,()=>this.close());
        if(this.mode==='chapter'){paintModalButton(close,'Continue');close.getChildByName('Text')!.getComponent(Label)!.color=modalButtonColor('Continue');}
        if(this.mode==='holidays'){
            this.text(this.node,'Cùng tìm hiểu ngày lễ quanh năm',0,163,540,38,21);
            traditionalFestivals.forEach((h,i)=>this.button('Holiday-'+h.id,h.title+((this.campaign.data.holidayProgress?.[h.id]??0)===3?' ✓':'')+'\n'+festivalDateLabel(h.id),0,70-i*104,540,()=>{this.selectedHoliday=h.id;this.holidayRun=null;this.mode='holiday';this.message='';this.render();}));
            this.text(this.node,`Đã hoàn thành ${traditionalFestivals.filter(h=>this.campaign.data.holidayProgress?.[h.id]===3).length}/${traditionalFestivals.length} ngày lễ`,0,-151,540,45,20);
        }else if(this.mode==='holiday'){
            const h=traditionalFestivals.find(h=>h.id===this.selectedHoliday)!,step=this.campaign.data.holidayProgress?.[h.id]??0;
            this.text(this.node,h.title,0,174,540,35,24);this.text(this.node,h.lunarDate,0,138,540,28,18);this.holidayArt(h.id);
            if(step===0){this.text(this.node,h.body,0,-22,530,145,22);this.button('HolidayContinue','Cùng tìm hiểu',0,-145,420,()=>{(this.campaign.data.holidayProgress??={})[h.id]=1;this.message='';this.persist();this.render();});}
            else if(step===1){this.text(this.node,this.message||h.question,0,0,530,75,22);this.spokenParts.push(...h.choices);h.choices.forEach((choice,i)=>this.button('HolidayAnswer-'+i,choice,0,-70-i*85,540,()=>{if(i===h.answer){(this.campaign.data.holidayProgress??={})[h.id]=2;this.message='';this.persist();}else this.message=h.hint;this.render();}));}
            else{this.text(this.node,step===3?'✓ Bé đã hoàn thành ngày lễ này!\nCó thể chơi lại để cùng vui.':`Mình cùng chơi ${gameNames[h.game].toLowerCase()} nhé!\nVán đang làm được lưu để tiếp tục.`,0,-10,530,100,22);this.button('HolidayPlay',step===3?'Chơi lại':'Cùng chơi',0,-120,420,()=>this.startHolidayGame());}
            this.button('HolidayBack','Sổ ngày lễ',215,-235,180,()=>{this.mode='holidays';this.message='';this.render();});
        }else if(this.mode==='painting'){
            this.text(this.node,this.message||'Chọn màu rồi vẽ. Tranh tự lưu.',-75,175,360,42,18);
            const exportButton=this.button('PaintExport','Lưu ảnh',210,180,180,()=>{try{downloadPainting(this.campaign.data.painting??[]);this.message='Đã gửi tranh tới trình duyệt để lưu.';}catch{this.message='Chưa lưu được ảnh. Tranh vẫn còn trong sổ.';}this.render();});exportButton.setScale(.65,.65,1);
            const canvas=this.make(this.node,'PaintingCanvas',540,250);canvas.setPosition(0,30);this.paintingGraphic=canvas.addComponent(Graphics);this.drawPainting();
            paintColors.forEach((color,i)=>{const n=this.button('PaintColor-'+i,this.paintColor===i?'✓':'',(i-2.5)*88,-145,76,()=>{this.paintColor=i;this.clearPainting=false;this.render();});const g=n.getComponent(Graphics)!;g.clear();g.fillColor=new Color(...color);g.roundRect(-38,-30,76,60,10);g.fill();n.getChildByName('Text')!.getComponent(Label)!.color=new Color(255,255,235);this.spokenParts.push(['Đỏ','Vàng','Xanh lá','Xanh dương','Tím','Nâu'][i]);});
            this.button('PaintUndo','Lùi nét',-215,-235,180,()=>{const strokes=this.campaign.data.painting??=[];if(strokes.length)strokes.pop();else if(this.clearedPainting){this.campaign.data.painting=this.clearedPainting;this.clearedPainting=undefined;}this.clearPainting=false;this.persist();this.render();});
            this.button('PaintClear',this.clearPainting?'Xóa tranh?':'Trang mới',215,-235,180,()=>{if(this.clearPainting){this.clearedPainting=this.campaign.data.painting??[];this.campaign.data.painting=[];this.persist();}this.clearPainting=!this.clearPainting;this.render();});
            if((this.campaign.data.painting?.length??0)>=maxPaintStrokes)this.text(this.node,'Trang đã đầy. Lùi nét hoặc mở trang mới để vẽ tiếp.',0,-194,540,30,17);
        }else if(this.mode==='care'&&isCareId(this.selectedDetail)){
            const id=this.selectedDetail,activity=careActivities[id],step=this.campaign.data.care?.[id]??0;
            this.text(this.node,activity.title,0,160,540,40,25);const preview=this.make(this.node,'CarePreview',120,90);preview.setPosition(0,90);this.onDetailPreview?.(preview,id);
            this.text(this.node,step===3?(id==='garden'?'✓ Vườn rau đã được chăm xong!':'✓ Đã chăm xong. Bạn nhỏ cảm ơn bé!'):`${step+1}/3 • ${activity.steps[step]}`,0,15,540,50,23);
            if(step<3)activity.choices.forEach((label,i)=>this.button('CareAction-'+i,label,(i-1)*184,-65,175,()=>{if(i===activity.order[step]){(this.campaign.data.care??={})[id]=step+1;this.message=step===2?'Hoàn thành rồi!':'Đúng rồi, mình làm tiếp nhé!';this.persist();}else this.message=activity.hint;this.render();}));
            else this.button('CareAgain','Chăm lại',0,-65,330,()=>{(this.campaign.data.care??={})[id]=0;this.message='';this.persist();this.render();});
            this.text(this.node,this.message||activity.hint,0,-152,530,80,20);
        }else if(this.mode==='explore'){
            const guide=environmentGuides.find(g=>g.id===this.selectedDetail);
            if(guide){this.text(this.node,guide.title,0,150,540,65,26);this.text(this.node,guide.body,0,35,530,175,23);if(isCareId(guide.id))this.button('CareStart',careActivities[guide.id].title,0,-125,410,()=>{this.mode='care';this.message='';this.render();});else this.text(this.node,`Đã khám phá ${this.campaign.data.explored?.length??0}/${environmentGuides.length} góc làng`,0,-135,530,45,20);}
        }else if(this.mode==='collection'){
            this.text(this.node,`Góc làng đã khám phá: ${this.campaign.data.explored?.length??0}/${environmentGuides.length}`,0,166,540,35,21);
            this.grid(environmentGuides.map(guide=>({id:'Explore-'+guide.id,label:(this.campaign.data.explored?.includes(guide.id)?'✓ ':'○ ')+guide.title,action:()=>{this.close();const detail=villageDetails.find(d=>d.id===guide.id)!;const p=toWorld(detail);this.selectDetail({x:p.x,y:p.y+20});}})));
            this.buttons.filter(b=>b.node.name.startsWith('Explore-')).forEach(b=>b.node.setPosition(b.node.position.x,b.node.position.y-20));
            const badges=Object.entries(this.campaign.data.festivalProgress??{}).filter(([,games])=>games.length===2);
            this.text(this.node,`★ Huy hiệu ngày hội: ${badges.length}\n${badges.slice(-2).map(([key])=>key.replace('spring','mùa xuân').replace('summer','mùa hè').replace('autumn','mùa thu').replace('winter','mùa đông')).join(' • ')}`,0,-152,540,70,18);
        }else if(this.mode==='journal'){
            this.grid(chapters.map((c,i)=>({id:'Chapter-'+i,label:`${i+1}. ${c.title}${this.campaign.data.receipts.includes('reward.star.'+c.id)?' ★':this.campaign.unlocked(i)?'':' 🔒'}`,action:()=>{if(i===0){this.message='Chương 1 chơi cùng Ông Đồ và bác trong làng.';this.render();}else{this.chapterIndex=i;this.mode='chapter';this.render();}}})));
        }else if(this.mode==='chapter'){
            const c=chapters[this.chapterIndex];
            if(!this.campaign.unlocked(this.chapterIndex))this.text(this.node,'Chương này mở sau khi nhận sao của chương trước. Cháu có thể luyện lại các chương đã mở.',0,65,550,235);
            else if(!this.campaign.data.introduced.includes(c.id)){this.text(this.node,(storyNpcs.find(n=>n.chapter===this.chapterIndex)?.name??c.npc)+'\n'+c.intro,0,65,550,235);this.button('ChapterIntro','Bắt đầu',0,-110,350,()=>{this.campaign.introduce(this.chapterIndex);this.onChapterIntro?.(this.chapterIndex);this.persist();this.render();});}
            else if(c.quests.every(q=>this.campaign.data.completed.includes(q.id))){this.text(this.node,c.ending+`\nSao Tri Thức: ${this.campaign.stars}/8`,0,70,550,220);if(!this.campaign.data.receipts.includes('reward.star.'+c.id))this.button('ClaimStar','Nhận sao chương',0,-115,360,()=>{this.campaign.claim(this.chapterIndex);this.onClaim?.(this.chapterIndex);this.persist();this.render();});else this.button('NextChapter',this.chapterIndex<7?'Xem chương tiếp':'Cây đa đã sáng!',0,-115,360,()=>{if(this.chapterIndex<7){this.chapterIndex++;this.render();}else{this.mode='inventory';this.render();}});}
            else this.chapterTasks();
        }else if(this.mode==='lesson'&&this.lesson){
            const q=this.lesson.question;if(!q){this.finishQuest();return;}
            this.text(this.node,q.prompt+(q.illustration?'\n'+q.illustration:''),0,145,550,105,24);
            this.spokenParts.push(...q.choices.map((choice,i)=>`Lựa chọn ${i+1}: ${choice}`));
            q.choices.forEach((s,i)=>this.button('LessonAnswer-'+i,s,0,40-i*92,550,()=>{const round=this.lesson!.round;if(this.lesson!.answer(i)){this.onLessonAnswer?.({questId:this.questId,round,index:i});this.campaign.data.resume[this.questId]={kind:'lesson',data:this.lesson!.round};this.persist();if(this.lesson!.complete){this.finishQuest();return;}this.message='Đúng rồi!';}else this.message=q.hint;this.render();}));
            this.button('LessonHint','Gợi ý',215,-235,140,()=>{this.message=q.hint;this.render();});
        }else if(this.mode==='game'&&this.game){
            if(this.practice||!this.onGameAction)this.game.resume();const game=this.game;
            if(game.status==='paused'){this.text(this.node,'Trò chơi đang tạm nghỉ. Chủ trò có thể tiếp tục; các bạn cùng chờ hoặc đóng để chơi riêng.',0,70,550,200);this.button('ServerGameResume','Tiếp tục (chủ trò)',0,-100,390,()=>this.onGamePause?.(false));}
            else if(game.status==='ended'){this.text(this.node,game.feedback,0,80,550,190);this.button('GameFinish','Xong • nhận tiến độ',0,-100,390,()=>this.finishQuest());}
            else{
                const summary=game.id==='mg.o-an-quan'?`Cháu: ${game.data.scores[0]} • NPC: ${game.data.scores[1]}\nChọn ô dân 1–5; NPC chơi lượt kế.`:game.id==='mg.fishing'?'Chờ cá vào vùng giữa; quan sát màu rồi thả.':game.prompt;
                this.text(this.node,summary,0,167,550,55,18);const boardState=game.id+JSON.stringify(game.data);this.gameBoard=new MiniGameView(this.node,this.boardState.startsWith(game.id)&&this.boardState!==boardState);this.boardState=boardState;this.gameBoard.update(game);
                const options=game.options,columns=options.length>3?3:options.length===1?1:3,width=columns===1?400:165;
                options.forEach((o,i)=>{const n=this.button('GameAction-'+o.type+'-'+o.index,o.label,(i%columns-(columns-1)/2)*(width+10),options.length>3?20-Math.floor(i/columns)*86:-65,width,()=>this.performGameAction(o.type,o.index));if(game.id==='mg.dong-ho'){folkPuzzleTile(n,game.data.tiles[i]);const caption=n.getChildByName('Text')!;caption.setSiblingIndex(n.children.length-1);caption.setPosition(56,22);caption.getComponent(UITransform)!.setContentSize(30,25);caption.getComponent(Label)!.fontSize=15;}});
                if(['mg.tug-of-war','mg.bamboo-dance'].includes(game.id))this.indicator=this.make(this.node,'GameMotion',1,1).addComponent(Graphics);
                this.button('GameHelp','Luật / gợi ý',210,-235,170,()=>{game.pause();if(!this.practice)this.onGamePause?.(true);this.mode='help';this.render();});
                this.button('GamePause','Tạm nghỉ',-210,-235,170,()=>{game.pause();if(!this.practice)this.onGamePause?.(true);if(!this.practice)this.campaign.data.resume[this.questId]={kind:'game',data:game.save()};this.persist();this.mode=this.practice?(this.holidayRun?'holiday':'activities'):'chapter';this.render();});
            }
        }else if(this.mode==='help'&&this.game){this.text(this.node,this.game.hint(),0,65,550,255,22);this.button('GameResume','Tiếp tục',0,-115,340,()=>{this.mode='game';this.game?.resume();if(!this.practice)this.onGamePause?.(false);this.render();});}
        else if(this.mode==='gate'){this.text(this.node,'Dành cho người lớn. Cổng này giúp tránh chạm nhầm, không thay thế tài khoản phụ huynh.\n12 + '+(this.gateAnswer-12)+' = ?',0,80,550,190,24);[this.gateAnswer-1,this.gateAnswer,this.gateAnswer+2].forEach((n,i)=>this.button('ParentAnswer-'+i,String(n),(i-1)*170,-100,150,()=>{if(n===this.gateAnswer){this.mode='parent';this.render();}else{this.message='Mời người lớn giúp mở góc này.';this.render();}}));}
        else if(this.mode==='parent'){this.button('OnlineMenu','Bạn bè',-215,-235,155,()=>{this.mode='online';this.render();});this.grid([
            {id:'ChooseAge',label:'Mức học: '+this.campaign.data.age,action:()=>{this.mode='age';this.render();}},
            {id:'ChooseQuality',label:'Hình ảnh: '+this.campaign.data.quality,action:()=>{this.mode='quality';this.render();}},
            {id:'Sound',label:this.campaign.data.sound?'Âm thanh: bật':'Âm thanh: tắt',action:()=>{this.campaign.data.sound=!this.campaign.data.sound;this.persist();this.render();}},
            {id:'Avatar',label:'Chọn nhân vật',action:()=>{this.mode='avatar';this.render();}},
            {id:'Export',label:'Xuất bản sao',action:()=>this.exportSave()},
            {id:'Reset',label:'Xóa sổ chương 2–8',action:()=>{this.mode='reset';this.render();}},
            {id:'Collection',label:'Sao / bộ sưu tập',action:()=>{this.mode='inventory';this.render();}},
            {id:'WorldMap',label:'Bản đồ làng',action:()=>{this.mode='map';this.render();}},
        ]);}
        else if(this.mode==='online'){
            const peers=this.onlinePeers?.()??[],peer=peers[this.peerIndex%Math.max(1,peers.length)];
            ['hello','thanks','need-help'].forEach((id,i)=>this.button('Emote-'+id,['Chào bạn','Cảm ơn','Cần giúp'][i],(i-1)*180,115,165,()=>this.onOnline?.('emote',id)));
            this.button('ChooseFriend',peer?peer.name+' • chọn bạn tiếp':'Chưa có bạn trong phòng',0,15,500,()=>{this.peerIndex++;this.render();});
            if(peer){this.button('BlockFriend','Ẩn bạn này',-145,-95,270,()=>{this.onOnline?.('block',peer.id);this.render();});this.button('ReportFriend','Báo người lớn',145,-95,270,()=>{this.onOnline?.('report',peer.id);this.message='Đã yêu cầu gửi báo cáo tới người lớn.';this.render();});}
            this.button('PlayOffline','Chơi một mình',-215,-235,175,()=>{this.onOnline?.('offline');this.close();});
        }
        else if(this.mode==='age'){this.text(this.node,'Chọn mức bắt đầu; không cần ngày sinh hoặc tên thật. Trẻ có thể dùng gợi ý ở mọi mức.',0,100,550,150);(['3-5','6-8','9-11'] as AgeBand[]).forEach((a,i)=>this.button('Age-'+a,a+' tuổi',(i-1)*180,-100,160,()=>{this.campaign.data.age=a;this.persist();this.mode='parent';this.render();}));}
        else if(this.mode==='quality'){this.text(this.node,'Low giảm hiệu ứng; Medium và High dùng hình ảnh đầy đủ hơn. Tốc độ và luật chơi giữ nguyên.',0,100,550,150);(['low','medium','high'] as const).forEach((a,i)=>this.button('Quality-'+a,a,(i-1)*180,-100,160,()=>{this.campaign.data.quality=a;this.persist();this.mode='parent';this.render();}));}
        else if(this.mode==='avatar'){
            ['Bé trai • áo đỏ','Bé trai • áo xanh','Bé gái • áo hồng','Bé gái • áo vàng'].forEach((value,i)=>{
                const selected=this.campaign.data.avatar===i;
                const n=this.button('Avatar-'+i,'',(i%2-.5)*292,120-Math.floor(i/2)*92,280,()=>{this.campaign.data.avatar=i;this.persist();this.message='Đã chọn '+value.toLowerCase()+'.';this.render();});
                this.text(n,value+(selected?' ✓':''),30,0,200,76,21);this.onAvatarPreview?.(n,i);
            });
            this.button('Accessories','Chọn khăn quàng',-146,-95,280,()=>{this.mode='accessory';this.render();});
            this.button('Hair','Chọn kiểu tóc',146,-95,280,()=>{this.mode='hair';this.render();});
            this.button('Gesture-hello','Vẫy chào',-146,-165,280,()=>{this.close();this.onGesture?.('hello');});
            this.button('Gesture-happy','Vui mừng',146,-165,280,()=>{this.close();this.onGesture?.('happy');});
        }
        else if(this.mode==='hair'){
            ['Tóc gốc',this.campaign.data.avatar<2?'Tóc rẽ ngôi':'Tóc tết'].forEach((value,i)=>{
                const n=this.button('Hair-'+i,'',0,120-i*100,560,()=>{this.campaign.data.hair=i;this.persist();this.message='Đã chọn '+value.toLowerCase()+'.';this.render();});
                this.text(n,value+(this.campaign.data.hair===i?' ✓':''),70,0,330,76,24);this.onAvatarPreview?.(n,this.campaign.data.avatar,i);
            });
            this.text(this.node,'Kiểu tóc được giữ khi đổi màu áo và đồng bộ với bạn cùng phòng.',0,-90,540,100,22);
            this.button('BackToAvatar','Chọn nhân vật',0,-165,350,()=>{this.mode='avatar';this.render();});
        }
        else if(this.mode==='accessory'){
            this.grid(['Không dùng khăn','Khăn đỏ','Khăn xanh','Khăn vàng'].map((value,i)=>({id:'Accessory-'+i,label:value+(this.campaign.data.accessory===i?' ✓':''),action:()=>{this.campaign.data.accessory=i;this.persist();this.message='Đã chọn '+value.toLowerCase()+'.';this.render();}})));
            this.text(this.node,'Khăn được giữ khi đổi nhân vật và hiển thị với bạn cùng phòng.',0,-75,540,95,22);
            this.button('BackToAvatar','Chọn nhân vật',0,-165,350,()=>{this.mode='avatar';this.render();});
        }
        else if(this.mode==='home'){this.grid(['Nhà mái ngói','Nhà xanh • 2 sao','Nhà tím • 4 sao','Nhà vàng • 8 sao'].map((label,i)=>({id:'Home-'+i,label,action:()=>{if(this.campaign.stars>=[0,2,4,8][i]){this.campaign.data.home=i;this.persist();this.message='Đã trang trí ngôi nhà.';}else this.message='Màu này mở khi có thêm sao.';this.render();}})));}
        else if(this.mode==='menu'){this.grid([
            {id:'MenuBag',label:'Túi đồ',action:()=>{this.mode='inventory';this.render();}},
            {id:'MenuBadges',label:'Thành tích',action:()=>{this.mode='achievements';this.render();}},
            {id:'MenuMap',label:'Bản đồ',action:()=>{this.mode='map';this.render();}},
            {id:'MenuSettings',label:'Cài đặt',action:()=>{this.mode='settings';this.render();}},
            {id:'MenuGestures',label:'Biểu cảm',action:()=>{this.mode='gestures';this.render();}},
            {id:'MenuPainting',label:'Vẽ tự do',action:()=>{this.practice=false;this.mode='painting';this.clearPainting=false;this.message='';this.render();}},
        ]);this.button('MenuFestivals','Sổ ngày lễ',0,-156,550,()=>{this.mode='holidays';this.message='';this.render();});}
        else if(this.mode==='gestures')this.grid(avatarGestures.map(g=>({id:'Gesture-'+g.id,label:g.title,action:()=>{this.close();this.onGesture?.(g.id);}})));
        else if(this.mode==='settings'){
            this.text(this.node,'Hình ảnh và âm thanh',0,135,550,60);
            (['low','medium','high'] as const).forEach((quality,i)=>this.button('HudQuality-'+quality,(quality===this.campaign.data.quality?'✓ ':'')+quality,(i-1)*180,40,160,()=>{this.campaign.data.quality=quality;this.persist();this.render();}));
            this.button('HudSound',this.campaign.data.sound?'Âm thanh: bật':'Âm thanh: tắt',0,-60,360,()=>{this.campaign.data.sound=!this.campaign.data.sound;this.stopReading();this.persist();this.render();});
            this.button('HudParent','Góc người lớn',0,-160,360,()=>{this.mode='gate';this.gateAnswer=12+Math.floor(Math.random()*9);this.render();});
        }
        else if(this.mode==='achievements'){
            this.text(this.node,`★ Sao Tri Thức: ${this.campaign.stars}/8\nLuyện tập: ${this.campaign.data.practice.length}/12 trò chơi\n${chapters.map(c=>(this.campaign.data.receipts.includes('reward.star.'+c.id)?'★ ':'○ ')+c.title).join('\n')}`,0,20,550,360,20);
            this.button('Practice','Luyện tập nhận huy hiệu',0,-205,400,()=>{this.mode='activities';this.render();});
        }
        else if(this.mode==='inventory'){
            this.text(this.node,`★ Sao Tri Thức: ${this.campaign.stars}/8\nLuyện tập: ${this.campaign.data.practice.length}/12 trò\nKhám phá: ${this.campaign.data.explored?.length??0}/6 góc làng`,0,100,540,110,22);
            this.button('HolidayBook','Sổ ngày lễ',0,-45,430,()=>{this.mode='holidays';this.message='';this.render();});
            this.button('ExplorationCollection','Sổ khám phá / ngày hội',0,-155,430,()=>{this.mode='collection';this.render();});
            this.button('Activities','Luyện / lễ hội',215,-235,180,()=>{this.mode='activities';this.render();});this.button('MyHome','Nhà của bé',-215,-235,180,()=>{this.mode='home';this.render();});
        }
        else if(this.mode==='activities'){
            if(this.campaign.stars<8||!this.festivalOnly)this.button('FreePainting','Vẽ tự do',this.campaign.stars<8?0:146,this.campaign.stars<8?-100:-64,this.campaign.stars<8?350:280,()=>{this.practice=false;this.mode='painting';this.message='';this.clearPainting=false;this.render();});
            if(this.campaign.stars<8)this.text(this.node,'Cháu có thể vẽ tự do ngay. Sau khi thắp sáng đủ tám sao, các trò luyện và ngày hội sẽ mở.',0,60,550,210,24);
            else{
                const season=seasonalActivities(),games=this.festivalOnly?season.games:[...miniGameIds.filter(id=>id!=='mg.o-an-quan'),'mg.o-an-quan' as MiniGameId];if(this.festivalOnly)this.text(this.node,season.title,0,174,540,28,20);
                this.grid(games.slice(this.activityPage*(this.festivalOnly?6:5),this.activityPage*(this.festivalOnly?6:5)+(this.festivalOnly?6:5)).map(id=>({id:'Practice-'+id,label:gameNames[id]+(this.campaign.data.practiceResume?.[id]?' • tiếp tục':this.campaign.data.practice.includes(id)?' ✓':''),action:()=>{this.practice=true;this.holidayRun=null;this.questId='';this.lesson=undefined;try{const saved=this.campaign.data.practiceResume?.[id];this.game=saved?MiniGameRules.restore(saved):new MiniGameRules(id,this.campaign.data.age);}catch{this.game=new MiniGameRules(id,this.campaign.data.age);}this.game.resume();this.message='';this.mode='game';this.render();}})));
                this.button('ActivityPage',this.festivalOnly?'Sổ ngày hội':'Trang tiếp',-215,-235,180,()=>{if(this.festivalOnly){this.mode='collection';this.message='';}else this.activityPage=(this.activityPage+1)%Math.ceil(games.length/5);this.render();});
                this.button('FestivalOnly',this.festivalOnly?'Tất cả trò':'Lễ hội',215,-235,180,()=>{this.festivalOnly=!this.festivalOnly;this.activityPage=0;this.render();});
                if(this.festivalOnly){const count=this.campaign.data.festivalProgress?.[season.key]?.length??0;this.text(this.node,'Cùng chơi, cùng khám phá',0,43,520,38,23);const badge=this.make(this.node,'SeasonBadge',90,90);badge.setPosition(0,-29);const g=badge.addComponent(Graphics);g.fillColor=count===season.games.length?new Color(242,190,58):new Color(224,212,162);for(let i=0;i<10;i++){const a=Math.PI/2+i*Math.PI/5,r=i%2?18:42;if(i===0)g.moveTo(Math.cos(a)*r,Math.sin(a)*r);else g.lineTo(Math.cos(a)*r,Math.sin(a)*r);}g.close();g.fill();this.text(this.node,'Hai hoạt động nhỏ • Một huy hiệu mùa',0,-98,530,38,18);}
                this.text(this.node,this.festivalOnly?`Đã chơi ${this.campaign.data.festivalProgress?.[season.key]?.length??0}/${season.games.length} hoạt động ngày hội.\nChơi đủ để lưu huy hiệu mùa này.`:`Đã luyện ${this.campaign.data.practice.length}/12 trò. Ván dở được lưu.`,0,-165,540,70,20);
            }
        }
        else if(this.mode==='map'){this.button('PortalMode',this.usePortal?'Cổng khu: bật':'Cổng khu: tắt',215,-235,180,()=>{this.usePortal=!this.usePortal;this.message='Cổng chuyển khu hoạt động khi đứng gần một mốc khu trên bản đồ.';this.render();});this.mapChoices(worldZones.slice(this.mapPage*(sys.isMobile?4:6),(this.mapPage+1)*(sys.isMobile?4:6)).map(zone=>({id:'Zone-'+zone.id,label:zone.name,action:()=>{this.close();if(this.usePortal){this.onPortal?.(zone.id);return;}if(this.player.goTo(zone.spawn))this.destination(zone.spawn);}})));this.button('MapPage','Trang tiếp',-215,-235,170,()=>{this.mapPage=(this.mapPage+1)%Math.ceil(worldZones.length/(sys.isMobile?4:6));this.render();});}
        else if(this.mode==='reset'){this.text(this.node,'Xóa sổ chương 2–8? Bản sao trước xóa được giữ trong bộ nhớ. Chương 1 và demo cũ giữ nguyên.',0,90,550,200);this.button('ConfirmReset','Xóa sổ mới',0,-110,340,()=>{const ok=this.save.resetLaterChapters();this.syncSignature='';this.syncFirst();this.message=ok?'Đã xóa sổ chương 2–8, giữ bản sao.':'Chưa xóa được; dữ liệu được giữ lại.';this.mode='parent';this.render();});}
        if(['chapter','lesson','help','explore','care','holidays','holiday'].includes(this.mode))this.readingButton=this.button('HubRead',this.mode==='chapter'?'Nghe hướng dẫn':'Nghe',this.mode==='chapter'?-145:-215,-235,this.mode==='chapter'?260:180,()=>this.read()).children[0].getComponent(Label)!;
    }
}
