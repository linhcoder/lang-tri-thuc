import {FirstVisitGuide} from '../ui/FirstVisitGuide';
import {VillageGrowth} from '../ui/VillageGrowth';
import {restoreUpgrades} from '../world/LearningUpgrades';
import {direction8} from '../world/VillageModel';
import {loadedLayoutRevision} from '../world/LiveLayout';
import {applyLiveNpcs,loadPublishedLayout} from '../world/LiveLayout';
import {chooseStudent,selectAnotherStudent,StudentSession,studentRequest} from '../network/StudentSession';
import {createJourneyScenery,decorateJourneyScenery} from '../ui/JourneyScenery';
import {beginModalPress,endModalPress} from '../ui/ModalTheme';
import {UiClickSound} from '../ui/UiClickSound';
import {CmsActors} from '../ui/CmsActors';
import { _decorator, Color, Component, director, EventKeyboard, EventTouch, game, Game, Graphics, input, Input, JsonAsset, resources, Label, Layers, Node, Sprite, SpriteFrame, sys, UITransform, Vec3, view } from 'cc';
import {CountrysideLife} from '../world/CountrysideLife';
import {expansionFriends} from '../world/ExpansionActivities';
import {createExpansionScenery,villageSignLabel} from '../ui/ExpansionScenery';
import { cameraOffset, inputAxis, Point, SIZE, terrain, tileAt, toWorld, VillageMap, storyNpcs, villageDetails, villageObjects,environmentGuides } from '../world/VillageModel';
import {referenceCameraFocus} from '../world/ReferenceCamera';
import { AvatarGesture, AvatarGestureState, PlayerController, PlayerVisual } from '../player/PlayerController';
import { FarmerNPC } from '../npc/FarmerNPC';
import {CameraZoom} from '../player/CameraZoom';
import {NpcPatrol,PatrolPose} from '../world/NpcPatrol';
import {NpcGait} from '../world/NpcGait';
import {activitySnapshot,restoreActivities,mergeActivities} from '../world/ActivitySnapshot';
import {isAvatarGesture} from '../world/AvatarGestures';
import { VillageArt } from '../world/VillageArt';
import {sceneryPlacements} from '../world/VisualAssets';
import { LearningProgress, riceBundles } from '../world/LearningProgress';
import { LearningPanel } from '../ui/LearningPanel';
import { VillageNetwork } from '../network/VillageNetwork';
import {restoreJoinSession,saveSoloSession} from '../network/JoinSession';
import { ChapterOneSave } from '../world/ChapterOneSave';
import { ChapterOneView } from '../ui/ChapterOneView';
import { CampaignSave } from '../world/CampaignSave';
import {applyNpcPack} from '../world/NpcCatalog';
import {applyLessonPack} from '../world/LessonCatalog';
import { applyChapterText } from '../world/ContentPack';
import { portalDestination } from '../world/WorldZones';
import { VillageHub } from '../ui/VillageHub';
import {HouseInteriorView} from '../ui/HouseInteriorView';
import {decorateHouseExteriors} from '../ui/HouseExteriors';
import {homeApproach,enterableHouses,EnterableHouse} from '../world/HouseInterior';
import {VillageNameplates} from '../ui/VillageNameplates';
import {VillageHUD} from '../ui/VillageHUD';
import {chapters} from '../world/CampaignContent';
const { ccclass, disallowMultiple, requireComponent } = _decorator;
const npcArt=[['co-tam','co-tam','CoTamSprite'],['co-giao-lan','teacher','TeacherSprite'],['ba-ban-hang','market-lady','MarketLadySprite'],['nghe-nhan-gom','potter','PotterSprite'],['ti-na','ti-na','FriendsSprite'],['chi-hang-cuoi','hang-cuoi','FestivalSprite']] as const;
const actorScale=0.78;
function scenerySprite(node:Node):Sprite|null{return node.getChildByName('PrivateHouseArt')?.getComponent(Sprite)??node.getComponent(Sprite)??node.getChildByName('RegionalArt')?.getComponent(Sprite)??null;}
function ui(parent: Node, name: string, width = 1, height = 1): Node {
    const n = new Node(name); n.layer = Layers.Enum.UI_2D; parent.addChild(n);
    n.addComponent(UITransform).setContentSize(width, height); return n;
}
function label(parent: Node, text: string, width: number, height: number, size = 22): Node {
    const n = ui(parent, text, width, height), l = n.addComponent(Label);
    l.string = text; l.fontSize = size; l.lineHeight = size + 8; l.overflow = Label.Overflow.CLAMP; l.enableWrapText = true;
    l.color = new Color(48, 48, 35); return n;
}
function circle(g: Graphics, x: number, y: number, radius: number, color: Color): void { g.fillColor = color; g.circle(x, y, radius); g.fill(); }
// Code-native scarf attached to the neck in every direction.
function drawAccessory(g:Graphics,id:number,direction:number,row:number):void {
    const signature=id+':'+direction+':'+row;
    if(g.node.name===signature)return;
    g.node.name=signature;g.clear();if(id===0)return;
    const colors=[new Color(0,0,0),new Color(207,57,56),new Color(40,125,195),new Color(234,179,44)];
    g.fillColor=colors[id]??colors[1];const y=43+(row===2?1:0);
    g.ellipse(0,y,12,4);g.fill();
    const side=[1,1,1,-1,-1,-1,1,1][direction]??1;
    g.moveTo(side*5,y);g.lineTo(side*13,y-16);g.lineTo(side*4,y-13);g.close();g.fill();
}
function animateGesture(state:AvatarGestureState,sprite:Sprite,scarf:Graphics,g:Graphics,dt:number,moving:boolean):void {
    state.step(dt,moving);const jump=state.jump;
    const seated=state.kind==='sit',sway=state.kind==='wave'?Math.sin(state.elapsed*15)*4:state.kind==='sad'?-4:0;
    sprite.node.setPosition(0,(seated?-13:-7)+jump);scarf.node.setPosition(0,(seated?-6:0)+jump);sprite.node.setScale(1,seated?.76:1,1);scarf.node.setScale(1,seated?.76:1,1);sprite.node.angle=scarf.node.angle=sway;g.clear();
    if(state.kind==='thanks'){g.fillColor=new Color(243,157,153);g.circle(-7,92,8);g.circle(7,92,8);g.moveTo(-15,91);g.lineTo(0,73);g.lineTo(15,91);g.close();g.fill();}
    else if(state.kind==='point'){g.strokeColor=new Color(251,213,107);g.lineWidth=5;g.moveTo(23,65);g.lineTo(57,65);g.lineTo(48,74);g.moveTo(57,65);g.lineTo(48,56);g.stroke();}
    else if(state.kind==='hello'||state.kind==='wave'){
        const x=32+Math.sin(state.elapsed*18)*(state.kind==='wave'?11:5),y=68+Math.cos(state.elapsed*18)*3;
        g.fillColor=new Color(250,207,163);g.roundRect(x-6,y-7,12,14,4);g.fill();
        for(let i=0;i<4;i++){g.roundRect(x-6+i*3,y+3,2.5,9,1);g.fill();}
        g.roundRect(x-10,y-3,5,3,1);g.fill();
    }else if(state.kind==='happy'){
        g.fillColor=new Color(255,210,65);
        for(const x of [-32,32]){g.circle(x,92+jump,3+Math.sin(state.elapsed*12));g.fill();}
    }else if(state.kind==='sad'){
        g.fillColor=new Color(111,202,239);for(const x of [-11,11]){const y=81-(state.elapsed*38)%28;g.moveTo(x,y+5);g.quadraticCurveTo(x-6,y-3,x,y-5);g.quadraticCurveTo(x+6,y-3,x,y+5);g.close();g.fill();}
    }else if(state.kind==='sit'){
        g.fillColor=new Color(77,66,47,85);g.ellipse(0,-6,28,8);g.fill();g.strokeColor=new Color(255,239,185);g.lineWidth=2;g.moveTo(-19,0);g.lineTo(19,0);g.stroke();
    }else if(state.kind==='jump'){
        g.fillColor=new Color(64,64,45,75);g.ellipse(0,-6,Math.max(10,22-jump*.25),6);g.fill();g.strokeColor=new Color(255,241,186);g.lineWidth=2;for(const x of [-24,24]){g.moveTo(x,8+jump*.3);g.lineTo(x,22+jump*.6);g.stroke();}
    }
}
@ccclass('VillageBootstrap')
@disallowMultiple
@requireComponent(UITransform)
export class VillageBootstrap extends Component {
    private guide=new FirstVisitGuide(()=>this.hub?.campaign.data.upgrades);private growth=new VillageGrowth();private guideStart?:Point;private guideElapsed=0;
    private map = new VillageMap();
    private get compactScreen():boolean{return sys.isMobile||(game?.canvas?.clientWidth??1280)<900;}
    private uiClick=new UiClickSound();
    private desktopJoystick=false;
    private root!: Node;
    private world!: Node;
    private actors!: Node;
    private player!: PlayerController;
    private farmer!: FarmerNPC;
    private arrow!: Node;
    private dialog!: Node;
    private joystick!: Node;
    private knob!: Node;
    private keys = new Set<number>();
    private stick: Point = { x: 0, y: 0 };
    private stickId: number | null = null;
    private pendingNpc = false;
    private lastDirection = -1;
    private viewWidth = 0;
    private viewHeight = 0;
    private backdrop!: Graphics;
    private header!: Node;
    private status!: Label;
    private statusRemaining = 0;
    private terrainChunks: { node: Node; center: Point }[] = [];
    private worldScale = 1;
    private baseWorldScale=1;private zoom=new CameraZoom();private zoomButtons:Node[]=[];private zoomLabel?:Label;private pinchIds?:[number,number];private zoomSaveDelay=0;
    private lastPixelScale = 0;
    private playerVisual?: PlayerVisual;
    private marker?: Node;
    private markerTime = 0;
    private touches = new Map<number, { start: Point; current:Point; dragged: boolean; blocked: boolean;control?:boolean;hubDrag?:boolean;panBase?:Point }>();
    private freeCameraOffset?:Point;
    private art=new VillageArt();private countryside=new CountrysideLife();
    private childSprite?:Sprite;
    private gesture=new AvatarGestureState();private gestureGraphic?:Graphics;private spriteTime=0;private accessoryGraphic?:Graphics;
    private learning=new LearningProgress();
    private panel?:LearningPanel;
    private bundleNodes:Node[]=[];
    private pendingBundle:number|null=null;
    private network=new VillageNetwork();
    private remoteActors=new Map<string,{node:Node;sprite:Sprite;accessory:Graphics;gesture:AvatarGestureState;gestureGraphic:Graphics}>();
    private npcHitHeight=85;
    private npcMotion=new Map<Node,{body:Node;sprite:Sprite|null;transform:UITransform;gait:NpcGait;time:number;near:boolean;greeting:number;baseY:number;scale:number;row:number;width:number;height:number;idle:SpriteFrame|null}>();
    private npcPatrol=new NpcPatrol();private npcWalking=new Map<Node,PatrolPose>();private npcCollisionPositions:Point[]=[];
    private updateNpcPatrol(dt:number):void{
        if(!this.hub||!this.assetsReady)return;const online=!!this.network.room&&this.network.npcs.size===this.hub.npcNodes.length;
        if(!online)this.npcPatrol.step(dt,[this.player.position]);
        for(const node of this.hub.npcNodes){const p=online?this.network.npcs.get(node.name):this.npcPatrol.poses.get(node.name);if(!p)continue;node.setPosition(p.x,p.y);this.npcWalking.set(node,p);}
        const positions=this.npcCollisionPositions,nodes=this.hub.npcNodes;
        while(positions.length<nodes.length)positions.push({x:0,y:0});positions.length=nodes.length;
        for(let i=0;i<nodes.length;i++){positions[i].x=nodes[i].position.x;positions[i].y=nodes[i].position.y;}
        this.map.npcPositions=positions;
    }
    private registerNpcMotion(node:Node,body:Node):void{
        const row=['ElderSprite','FarmerSprite','CoTamSprite','MarketLadySprite','FriendsSprite','TeacherSprite','PotterSprite','FestivalSprite'].indexOf(body.name);
        const transform=body.getComponent(UITransform)!;
        this.npcMotion.set(node,{body,sprite:body.getComponent(Sprite),transform,gait:new NpcGait(this.npcMotion.size*.17),time:this.npcMotion.size*.73,near:false,greeting:0,baseY:body.position.y,scale:body.scale.x,row,width:transform.width,height:transform.height,idle:body.getComponent(Sprite)?.spriteFrame??null});
    }
    private animateNpcs(dt:number,camera:Point,width:number,height:number):void{
        for(const [node,state] of this.npcMotion){
            if(!node.isValid||!state.body.isValid){this.npcMotion.delete(node);continue;}
            const walk=this.npcWalking.get(node),moving=walk?.moving===true;
            state.gait.update(dt,node.position.x,node.position.y,moving);
            const near=Math.hypot(node.position.x-this.player.position.x,node.position.y-this.player.position.y)<(state.near?130:100);
            if(near&&!state.near&&!this.modalActive)state.greeting=1.4;
            state.near=near;state.time+=Math.min(dt,.1);state.greeting=Math.max(0,state.greeting-Math.min(dt,.1));
            const greeting=state.greeting>0?Math.sin((1.4-state.greeting)*Math.PI/1.4):0;
            if(Math.abs(node.position.x+camera.x)>width/2+150||Math.abs(node.position.y+camera.y)>height/2+150)continue;
            const facingDirection=near&&!moving?direction8({x:this.player.position.x-node.position.x,y:this.player.position.y-node.position.y}):walk?.direction??6;
            const facing=walk&&(walk.direction===3||walk.direction===4||walk.direction===5)?-1:1;
            const sprite=state.sprite,poses=this.art.npcPoses[state.row],directions=this.art.npcDirections[state.row],steps=this.art.npcWalkSteps[state.row];
            const expansionBody=state.body.name.startsWith('ExpansionSprite-');
            const authoredPortrait=state.body.name==='FarmerSprite'?this.art.farmerFrame(facingDirection,moving?(state.gait.cycleFrame>=4?1:0):greeting>0?2:0):state.body.name==='CoTamSprite'?this.art.coTamFrame(facingDirection,moving?(state.gait.cycleFrame>=4?1:0):greeting>0?2:0):state.body.name==='MarketLadySprite'?this.art.marketLadyFrame(facingDirection,moving?(state.gait.cycleFrame>=4?1:0):greeting>0?2:0):state.body.name==='TeacherSprite'?this.art.teacherLanFrame(facingDirection,moving?(state.gait.cycleFrame>=4?1:0):greeting>0?2:0):state.body.name==='PotterSprite'?this.art.potterFrame(facingDirection,moving?(state.gait.cycleFrame>=4?1:0):greeting>0?2:0):null;
            const directional=!!authoredPortrait||expansionBody||!!directions&&(moving||greeting===0);
            const walkingFrames=moving&&steps&&state.gait.stepFrame===1?steps:directions;
            if(sprite&&state.body.name.startsWith('ExpansionSprite-'))sprite.spriteFrame=this.art.expansionCharacterFrame(node.name,facingDirection,moving?state.gait.cycleFrame:-1)??this.art.npcCharacterFrame(Number(state.body.name.slice(16)),facingDirection,moving?1+state.gait.cycleFrame:0,1,node.name==='chu-hai'?2:1);
            else if(sprite&&authoredPortrait)sprite.spriteFrame=authoredPortrait;
            else if(sprite)sprite.spriteFrame=directional?(moving?this.art.npcCycleFrame(state.row,walk?.direction??6,state.gait.cycleFrame):walkingFrames[walk?.direction??6]):poses&&(moving||greeting>0)?poses[moving?state.gait.stepFrame:2]:state.idle;
            state.transform.setContentSize((expansionBody||!!authoredPortrait)&&sprite?.spriteFrame?state.height*sprite.spriteFrame.rect.width/sprite.spriteFrame.rect.height:directional?state.height*directions[0].rect.width/directions[0].rect.height:state.width,state.height);
            state.body.setPosition(state.gait.offsetX+state.gait.sway,state.baseY+state.gait.offsetY+state.gait.bob+Math.sin(state.time*1.8)*.65*(1-state.gait.weight)+greeting*3);
            state.body.setScale(state.scale*(directional?1:facing),state.scale*(state.gait.stretch+Math.sin(state.time*1.8)*.004*(1-state.gait.weight)),1);
            state.body.angle=state.gait.angle+greeting*Math.sin((1.4-state.greeting)*9)*3;
        }
    }
    private cms?:CmsActors;
    private hudTick=0;private namesTick=0;
    private assetsReady=false;private sceneryNodes:Node[]=[];private npcDecorated=new Set<string>();private loadingLabel?:Label;private loadingPanel?:Node;
    private sceneryPending=false;private sceneryReady=false;private optionalScenery=new Set<Node>();
    private nameplates?:VillageNameplates;
    private hud?:VillageHUD;
    private regionalScenery:Array<{node:Node;id:string;frame:number;pending:boolean}>=[];
    private networkStarted=false;
    private networkBadge?:Label;
    private demo=false;
    private chapterSave?:ChapterOneSave;
    private chapter?:ChapterOneView;
    private questButton?:Node;
    private journalButton?:Node;private parentButton?:Node;
    private privateJoin?:{roomCode:string;ticket:string};private profileScope='';private hub?:VillageHub;private homeStyle=-1;private starCount=-1;private treeLights?:Graphics;private qualityStyle='';
    private interior?:HouseInteriorView;
    private houseArtCount=0;
    private interiorPointer:number|null=null;
    private homeDoor?:Node;
    private homeGoal?:Point;
    private houseDoors:Array<{house:EnterableHouse;node:Node;goal:Point}>=[];
    private get modalActive():boolean{return !!this.interior?.node.active||!!this.cms?.dialog.active||this.dialog.active||!!this.hub?.node.active;}
    private get objective():string{return this.hub?.objective??this.chapterSave?.progress.description??this.learning.description;}
    private student?:StudentSession;private studentAbort=new AbortController();private initialized=false;private cloudElapsed=0;private cloudBusy=false;private cloudSignature='';private cloudConflict=false;private authElapsed=0;private appearanceBusy=false;private appearanceWait=0;
    onLoad():void{
        if(!sys.isBrowser){this.initializeVillage();return;}
        void chooseStudent(this.studentAbort.signal).then(async session=>{if(!this.isValid)return;await loadPublishedLayout();if(!this.isValid)return;this.map=new VillageMap();this.student=session;this.profileScope='.'+session.profile.id;this.initializeVillage();}).catch(error=>{if(!this.studentAbort.signal.aborted)this.reportLoading(0,(error as Error).message,true);});
    }
    private initializeVillage(): void {
        this.initialized=true;
        this.demo=!this.student&&sys.isBrowser&&new URLSearchParams(window.location.search).get('demo')==='1';
        try{const saved=sys.localStorage.getItem('lang-tri-thuc.view-zoom.v1'),value=Number(saved);if(saved?.trim()&&Number.isFinite(value)&&value>=this.zoom.min&&value<=this.zoom.max)this.zoom.set(value);}catch{}
        if(sys.isBrowser&&!this.demo){const fragment=new URLSearchParams(window.location.hash.slice(1));let storage:Storage|undefined;try{storage=window.sessionStorage;}catch{}const session=restoreJoinSession(fragment.get('ticket'),fragment.get('room'),storage,raw=>atob(raw.replace(/-/g,'+').replace(/_/g,'/')));if(session&&(!this.student||session.profileId===this.student.profile.id)){this.profileScope='.'+session.profileId;this.privateJoin=session.join;}if(fragment.has('ticket')||fragment.has('room'))history.replaceState(null,'',window.location.pathname+window.location.search);}
        if(!this.demo){this.chapterSave=new ChapterOneSave(sys.localStorage,'lang-tri-thuc.chapter-one.v2'+this.profileScope);this.chapterSave.load();if(this.student?.first&&!this.student.useLocalBackup)this.chapterSave.progress.restore(JSON.stringify(this.student.first));}
        try{this.learning.restore(sys.localStorage.getItem('lang-tri-thuc.learning.v1'));}catch{}
        this.root = ui(this.node, 'Milestone01A');
        this.backdrop = ui(this.root, 'VillageBackground').addComponent(Graphics);
        this.world = ui(this.root, 'VillageWorld');
        this.drawMap();
        this.marker = ui(this.world, 'Destination'); const mg=this.marker.addComponent(Graphics);
        mg.strokeColor=new Color(255,250,210);mg.lineWidth=3;mg.ellipse(0,0,20,10);mg.stroke();this.marker.active=false;
        this.actors = ui(this.world, 'DepthSortedActors');
        createJourneyScenery(this.world,this.actors);
        const pn = this.character(this.student?.profile.label??'Em bé', new Color(237, 115, 86), false);
        this.player = pn.addComponent(PlayerController); this.player.map = this.map;
        this.playerVisual = new PlayerVisual(pn);
        this.arrow = ui(pn, 'Facing'); this.arrow.addComponent(Graphics);
        const fn = this.character('Bác Nông Dân', new Color(80, 135, 190), true), fp = toWorld(this.map.npc);
        fn.setPosition(fp.x, fp.y); this.farmer = fn.addComponent(FarmerNPC);
        const farmerName=label(fn, 'Bác Nông Dân', 180, 32, 18);farmerName.name='FarmerName';farmerName.setPosition(0, 74);
        this.header = ui(this.root, 'Header'); this.header.addComponent(Graphics);
        const hint = label(this.header, this.demo?'LÀNG TRI THỨC\nWASD / mũi tên / chạm để đi • Chạm bác nông dân để trò chuyện':'NGÀY VỀ LÀNG • CHƯƠNG 1\nWASD / mũi tên / chạm để đi • Chạm Ông Đồ bên cây đa', 800, 90, 20);
        hint.name = 'Instructions';
        hint.getComponent(Label)!.color = new Color(255, 251, 231);
        this.networkBadge=label(this.root,'Chơi offline • tiến độ lưu trên máy',500,45,16).getComponent(Label)!;
        this.status = label(this.root, '', 500, 42, 20).getComponent(Label)!;
        this.status.string=this.objective;
        this.joystick = ui(this.root, 'Joystick', 140, 140);
        const jg = this.joystick.addComponent(Graphics); circle(jg, 0, 0, 65, new Color(255, 255, 255, 100));
        this.knob = ui(this.joystick, 'Knob'); circle(this.knob.addComponent(Graphics), 0, 0, 25, new Color(70, 100, 80, 170));
        this.joystick.active = this.compactScreen;
        if(this.demo){this.panel=new LearningPanel(this.root,this.learning,()=>this.saveLearning());this.dialog=this.panel.node;}
        else{this.chapter=new ChapterOneView(this.root,this.actors,this.chapterSave!.progress,this.player,this.chapterSave!,()=>this.resetInput(),p=>this.showDestination(p));this.dialog=this.chapter.node;}
        if(this.chapter){
            if(this.student&&!this.student.useLocalBackup){try{for(const key of ['lang-tri-thuc.campaign.v1','lang-tri-thuc.chapter-one.v2']){const scoped=key+this.profileScope,raw=sys.localStorage.getItem(scoped);if(raw)sys.localStorage.setItem(scoped+'.before-cloud',raw);}}catch{}}
            this.hub=new VillageHub(this.root,this.actors,new CampaignSave(sys.localStorage,'lang-tri-thuc.campaign.v1'+this.profileScope),this.chapterSave!,this.player,()=>this.resetInput(),p=>this.showDestination(p));
            if(this.student){const profile=this.student.profile;if(this.student.campaign&&!this.student.useLocalBackup)this.hub.campaign.restore(JSON.stringify(this.student.campaign));Object.assign(this.hub.campaign.data,{age:profile.age,avatar:profile.avatar});this.hub.studentName=profile.label;this.hub.studentGender=profile.gender;this.hub.onStudentChange=()=>selectAnotherStudent();this.hub.campaign.syncChapterOne(this.chapterSave!.progress.data);this.hub.save.save();try{sys.localStorage.setItem('lang-tri-thuc.cloud-revision.'+profile.id,String(this.student.revision));}catch{}}
            this.hub.rewardArt=this.art;this.hub.primeLearning();this.hub.onReplayGuide=()=>{if(!this.hub)return;const data=this.hub.campaign.data.upgrades??=restoreUpgrades(null);this.guide.replay(data);this.guideStart={...this.player.position};this.hub.save.save();};
            let localActivityJson=JSON.stringify(activitySnapshot(this.hub.campaign.data));
            this.hub.onActivitySave=()=>{if(!this.hub)return;const current=JSON.stringify(activitySnapshot(this.hub.campaign.data));if(current!==localActivityJson){localActivityJson=current;this.hub.campaign.data.activitiesDirty=true;}};
            this.hub.onJourneyAnswer=undefined;this.hub.onPortal=id=>{const p=portalDestination(this.player.position,id,this.hub?.campaign.level??1);if(p){this.resetInput();this.player.position=p;}};
            this.hub.onDetailPreview=(parent,id)=>{const detail=villageDetails.find(d=>d.id===id);if(!detail)return;const frame=this.art.detailFrame(id,detail.frame);if(!frame)return;const ratio=Math.min(120/detail.width,85/detail.height);const n=this.art.sprite(parent,'DetailPreview',frame,detail.width*ratio,detail.height*ratio);n.setPosition(0,-42);};
            this.chapter.onCampaignRequested=()=>this.hub?.open('chapter',1);this.chapter.canRead=()=>!!this.hub?.campaign.data.sound;
            this.journalButton=ui(this.root,'OpenJournal',110,58);const j=this.journalButton.addComponent(Graphics);j.fillColor=new Color(235,235,187);j.roundRect(-55,-29,110,58,10);j.fill();label(this.journalButton,'Nhiệm vụ',105,55,19);
            this.parentButton=ui(this.root,'OpenParent',110,58);const p=this.parentButton.addComponent(Graphics);p.fillColor=new Color(235,235,187);p.roundRect(-55,-29,110,58,10);p.fill();label(this.parentButton,'Người lớn',105,55,19);
            this.journalButton.active=this.parentButton.active=!this.modalActive;
        }
        if(this.chapter){
            this.questButton=ui(this.root,'QuestTarget',240,58);const g=this.questButton.addComponent(Graphics);g.fillColor=new Color(250,231,158);g.roundRect(-120,-29,240,58,12);g.fill();
            label(this.questButton,'Tới mục tiêu',230,55,22);
            this.questButton.active=!this.modalActive;
        }
        for(const [name,text] of [['ZoomOut','−'],['ZoomReset','100%'],['ZoomIn','+']]){const n=ui(this.root,name,56,48),g=n.addComponent(Graphics);g.fillColor=new Color(235,235,187);g.roundRect(-28,-24,56,48,10);g.fill();const l=label(n,text,52,46,text==='100%'?16:26).getComponent(Label)!;if(name==='ZoomReset')this.zoomLabel=l;this.zoomButtons.push(n);}
        this.loadingPanel=ui(this.root,'LoadingVillage');this.loadingPanel.addComponent(Graphics);this.loadingLabel=label(this.loadingPanel,'Đang mở làng…',520,100,26).getComponent(Label)!;this.loadingLabel.color=new Color(255,251,231);if(sys.isBrowser&&document.getElementById('app-splash'))this.loadingPanel.active=false;this.reportLoading(8,'Đang chuẩn bị ngôi làng…');this.network.onLayout=value=>{if(value.revision!==loadedLayoutRevision){const url=new URL(location.href);url.searchParams.set('layoutRevision',String(value.revision));location.replace(url.href);}};this.network.onOffline=()=>this.enableSolo();void this.loadArt();
    }
    private reportLoading(percent:number,message:string,error=false):void{
        if(sys.isBrowser)window.dispatchEvent(new CustomEvent('ltt-loading',{detail:{percent,message,error}}));
        if(this.loadingLabel)this.loadingLabel.string=message+' '+Math.round(percent)+'%';
    }
    private async loadArt():Promise<void>{
        try{
            let artProgress=0,packCount=0;
            const progress=()=>this.reportLoading(10+Math.round(artProgress*65+packCount*3),'Đang tải hình ảnh và câu chuyện…');
            const loadPack=(name:string)=>new Promise<JsonAsset>((resolve,reject)=>resources.load(name,JsonAsset,(error,asset)=>{packCount++;progress();error?reject(error):resolve(asset);}));
            const [,pack,lessons,npcPack]=await Promise.all([this.art.load(value=>{artProgress=value;progress();}),loadPack('chapter-pack'),loadPack('lesson-pack'),loadPack('npc-pack')]);
            if(!this.isValid)return;
            await decorateJourneyScenery(this.actors,this.art);if(!this.isValid)return;
            this.sceneryNodes.push(...this.actors.children.filter(n=>n.name.startsWith('JourneyLandmark-')));
            this.cms=new CmsActors(this.root,this.actors,this.art,this.player,id=>{const index=chapters.findIndex(c=>c.quests.some(q=>q.id===id));if(index===0){this.hub?.close();this.chapter?.open(['q.ch01.plant','q.ch01.count'].includes(id)?'farmer':'elder');}else if(index>0)this.hub?.open('chapter',index);});void this.cms.load();
            if(!applyChapterText(pack.json))console.warn('Invalid chapter text pack: using built-in content');
            if(!applyLessonPack(lessons.json))console.warn('Invalid lesson pack: using built-in questions');
            if(!applyLiveNpcs()&&!applyNpcPack(npcPack.json))console.warn('Invalid NPC pack: keeping default spawns');if(this.hub)this.hub.npcNodes.forEach((node,i)=>{const npc=storyNpcs[i],p=toWorld(npc);node.setPosition(p.x,p.y);const text=node.getChildByName('Text')?.getComponent(Label);if(text)text.string=npc.name;});this.chapter?.setRiceFrame(this.art.decorations.seedling);this.chapter?.refreshContent();
            for(let cy=0;cy<SIZE;cy+=8)for(let cx=0;cx<SIZE;cx+=8){const node=this.art.terrainChunk(this.world,cx,cy);if(node){
                const old=this.terrainChunks.find(chunk=>chunk.node.name===`Terrain-${cx}-${cy}`);if(old){old.node.active=false;old.node.destroy();old.node=node;}
                node.setSiblingIndex(0);
            }}
            this.art.meadowBackdrop(this.world);this.reportLoading(88,'Đang dựng đường làng…');
            for(const child of [...this.player.node.children])if(child!==this.arrow)child.destroy();
            const body=ui(this.player.node,'ActorBody');body.setScale(actorScale,actorScale,1);this.playerVisual=undefined;this.childSprite=this.art.sprite(body,'ChildSprite',this.art.child[6],90,110).getComponent(Sprite)!;this.accessoryGraphic=ui(body,'Scarf').addComponent(Graphics);this.gestureGraphic=ui(body,'Gesture').addComponent(Graphics);
            this.childSprite.node.setPosition(0,-7);
            if(this.hub){this.hub.onGesture=id=>{if(this.networkStarted&&this.network.privateMode&&!this.network.offlineMode){this.network.emote(id);}else this.gesture.start(id);};this.network.onEmote=(sessionId,id)=>{if(!isAvatarGesture(id))return;const state=sessionId===this.network.room?.sessionId?this.gesture:this.remoteActors.get(sessionId)?.gesture;state?.start(id as AvatarGesture);};this.hub.onAvatarPreview=(parent,id,hair=this.hub?.campaign.data.hair??0,skin=this.hub?.campaign.data.skin??0)=>{const n=this.art.sprite(parent,'AvatarPreview',this.art.avatarFrame(id,0,6,hair,skin,this.hub?.campaign.data.age),55,70);n.setPosition(-100,-35);void Promise.all([this.art.ensureAvatar(id),hair===1?this.art.ensureHair(id):Promise.resolve()]).then(()=>{if(n.isValid)n.getComponent(Sprite)!.spriteFrame=this.art.avatarFrame(id,0,6,hair,skin,this.hub?.campaign.data.age);});};this.hub.applyServerProgress();}
            this.farmer.node.getComponent(Graphics)!.clear();const farmerFrame=this.art.environment[6],farmerSprite=this.art.sprite(this.farmer.node,'FarmerSprite',farmerFrame,145*farmerFrame.rect.width/farmerFrame.rect.height,145);farmerSprite.setPosition(0,-5);farmerSprite.setScale(actorScale,actorScale,1);
            this.farmer.node.getChildByName('FarmerName')!.setPosition(0,104);this.npcHitHeight=110;
            this.registerNpcMotion(this.farmer.node,farmerSprite);
            const elderFrame=this.art.decorations.elder;
            if(this.chapter&&elderFrame){
                const elder=this.chapter.elder,body=this.art.sprite(elder,'ElderSprite',elderFrame,140*elderFrame.rect.width/elderFrame.rect.height,140);body.setPosition(0,-5);body.setScale(actorScale,actorScale,1);elder.getComponent(Graphics)!.clear();const name=elder.getChildByName('Text');if(name){name.setPosition(0,104);const l=name.getComponent(Label)!;l.fontSize=18;l.lineHeight=24;}
            }
            const lotus=this.art.decorations.lotus;
            const elderBody=this.chapter?.elder.getChildByName('ElderSprite');if(elderBody)this.registerNpcMotion(this.chapter!.elder,elderBody);
            if(lotus)for(const [i,tile] of [{x:14,y:29},{x:15,y:30},{x:12,y:29},{x:11,y:30},{x:14,y:24},{x:12,y:26},{x:7,y:25}].entries()){
                const node=this.art.sprite(this.actors,`PondLotus-${i}`,lotus,100,100),p=toWorld(tile);
                node.getComponent(UITransform)!.setAnchorPoint(0.5,0.5);node.setPosition(p.x,p.y);
            }
            for(const object of villageDetails){const frame=this.art.detailFrame(object.id,object.frame);if(!frame)continue;const node=this.art.sprite(this.actors,'Detail-'+object.id,frame,object.width,object.height),p=toWorld(object);node.setPosition(p.x,p.y);if(object.id.startsWith('bridge')){node.getComponent(UITransform)!.setAnchorPoint(.5,.5);node.setParent(this.world);node.setSiblingIndex(this.actors.getSiblingIndex());}this.sceneryNodes.push(node);}
            for(const object of villageObjects){if(object.id==='banyan'||object.id==='tree-east')continue;let node:Node;const objectFrame=this.art.objectFrame(object.id,object.frame);if(objectFrame)node=this.art.sprite(this.actors,object.id,objectFrame,object.width,object.height);else{node=ui(this.actors,object.id,object.width,object.height);node.getComponent(UITransform)!.setAnchorPoint(.5,0);const g=node.addComponent(Graphics);g.fillColor=new Color(139,161,102,150);g.ellipse(0,10,object.width*.3,15);g.fill();this.regionalScenery.push({node,id:object.id,frame:object.frame,pending:false});}const p=toWorld(object);node.setPosition(p.x,p.y);this.sceneryNodes.push(node);}
            if(this.demo)await this.art.ensureEnvironment(4);
            for(let i=0;this.demo&&i<riceBundles.length;i++){
                const p=toWorld(riceBundles[i]),node=ui(this.actors,`RiceBundle-${i}`,75,95);node.setPosition(p.x,p.y);
                this.art.sprite(node,'Rice',this.art.environment[4],65,75);
                const ring=ui(node,'HarvestRing').addComponent(Graphics);ring.strokeColor=new Color(255,255,180);ring.lineWidth=3;ring.ellipse(0,2,23,12);ring.stroke();
                label(node,'Thu hoạch',100,25,16).setPosition(0,80);node.active=this.learning.data.collected.indexOf(i)<0;this.bundleNodes.push(node);
            }
            this.reportLoading(92,'Đang đón các bạn trong làng…');
            await Promise.all([createExpansionScenery(this.actors,this.world,this.art),this.art.ensureExpansionCharacters(),this.countryside.create(this.world,this.actors,this.art)]);
            for(const friend of expansionFriends){const node=this.hub?.npcNodes.find(n=>n.name===friend.id);if(!node)continue;node.getComponent(Graphics)!.clear();const height=friend.id.startsWith('be-')?100:130,body=this.art.sprite(node,'ExpansionSprite-'+friend.avatar,this.art.avatarFrame(friend.avatar,0,6,1,friend.id==='chu-hai'?2:1),height*.75,height);body.setScale(actorScale,actorScale,1);this.registerNpcMotion(node,body);}
            this.nameplates=new VillageNameplates(this.world,this.actors);
            if(this.hub){this.hud=new VillageHUD(this.root,mode=>this.hub?.open(mode),()=>this.interactNearest(),id=>{this.resetInput();this.player.cancel();this.hub?.onGesture?.(id);},()=>{this.desktopJoystick=!this.desktopJoystick;this.releaseStick();},()=>this.navigateQuest());this.hud.onClick=()=>{if(this.hub?.campaign.data.sound)this.uiClick.play();};if(this.questButton)this.hud.bindQuestTarget(this.questButton,()=>this.navigateQuest());this.header.active=false;this.networkBadge!.node.active=false;this.status.node.active=false;}
            void decorateHouseExteriors(this.actors,this.art).then(count=>{if(this.isValid)this.houseArtCount=count;});this.assetsReady=true;this.reportLoading(100,'Ngôi làng đã sẵn sàng!');if(this.loadingPanel)this.loadingPanel.active=false;
            if(sys.isBrowser){const requested=new URLSearchParams(window.location.search).get('server');
                if(requested){let endpoint:URL;try{endpoint=new URL(requested);}catch{throw new Error('Địa chỉ server không hợp lệ');}
                    if(['http:','https:','ws:','wss:'].indexOf(endpoint.protocol)<0)throw new Error('Giao thức server không hợp lệ');
                    if(this.demo||this.privateJoin){this.networkStarted=true;
                        if(this.privateJoin&&this.hub&&this.chapterSave){const hub=this.hub,first=this.chapterSave;
                            let activityJson=JSON.stringify(activitySnapshot(hub.campaign.data)),uploadId='',uploadIndex=0,uploadSentAt=0;
                            const uploadActivities=()=>{if(!hub.campaign.data.activitiesDirty||!this.network.canSend||uploadId&&Date.now()-uploadSentAt<5000)return;const id=String(++uploadIndex);if(this.network.intent('activities-save',{id,snapshot:activitySnapshot(hub.campaign.data)})){uploadId=id;uploadSentAt=Date.now();}};
                            this.schedule(uploadActivities,1);
                            hub.onActivitySave=()=>{const current=JSON.stringify(activitySnapshot(hub.campaign.data));if(current!==activityJson){activityJson=current;uploadId='';hub.campaign.data.activitiesDirty=true;}uploadActivities();};
                            this.network.onActivities=value=>{
                                if(!value||value.id&&value.id!==uploadId)return;
                                if(value.id){Object.assign(hub.campaign.data,restoreActivities(value.snapshot));hub.campaign.data.activitiesDirty=false;}
                                else if(value.snapshot){const remote=restoreActivities(value.snapshot);Object.assign(hub.campaign.data,hub.campaign.data.activitiesDirty?mergeActivities(remote,activitySnapshot(hub.campaign.data)):remote);}
                                else hub.campaign.data.activitiesDirty=true;
                                activityJson=JSON.stringify(activitySnapshot(hub.campaign.data));hub.save.save();if(!value.id){hub.refreshActivities();uploadActivities();}
                            };
                            this.network.onProgress=value=>{const cosmetics={upgrades:hub.campaign.data.upgrades,activitiesDirty:hub.campaign.data.activitiesDirty,quality:hub.campaign.data.quality,sound:hub.campaign.data.sound,avatar:hub.campaign.data.avatar,accessory:hub.campaign.data.accessory,hair:hub.campaign.data.hair,skin:hub.campaign.data.skin,expansion:hub.campaign.data.expansion,expansionProgress:hub.campaign.data.expansionProgress,practice:hub.campaign.data.practice,practiceResume:hub.campaign.data.practiceResume,explored:hub.campaign.data.explored,care:hub.campaign.data.care,painting:hub.campaign.data.painting,holidayProgress:hub.campaign.data.holidayProgress,festivalProgress:hub.campaign.data.festivalProgress,home:hub.campaign.data.home};if(!value||!first.progress.restore(JSON.stringify(value.first))||!hub.campaign.restore(JSON.stringify(value.campaign)))return;Object.assign(hub.campaign.data,cosmetics);first.save();this.chapter?.refreshWorld();hub.save.save();hub.applyServerProgress();};
                            this.network.onGame=state=>hub.applyServerGame(state);
                            this.network.onGameFeedback=(id,message)=>hub.applyGameFeedback(id,message);
                            first.progress.onIntent=v=>this.network.intent('story',v);
                            hub.onJourneyAnswer=(id,round,index)=>this.network.intent('journey-answer',{id,round,index});hub.onChapterIntro=index=>this.network.intent('chapter-intro',{index});hub.onClaim=index=>this.network.intent('claim-star',{index});
                            hub.onLessonAnswer=v=>this.network.intent('lesson-answer',v);hub.onGameStart=questId=>this.network.intent('start-game',{questId});
                            hub.onPortal=id=>{this.network.intent('portal',{id});};hub.onlinePeers=()=>Array.from(this.network.players.entries()).map(([id,p])=>({id,name:p.name}));hub.onOnline=(action,id)=>{if(action==='emote')this.network.emote(id!);else if(action==='block')this.network.block(id!);else if(action==='report')this.network.report(id!,'uncomfortable');else if(action==='offline')this.network.offline();};
                            hub.onExpansionStart=id=>this.network.intent('expansion-start',{id});hub.onExpansionChoice=(id,attempt,step,index)=>this.network.intent('expansion-choice',{id,attempt,step,index});hub.onExpansionLeave=()=>this.network.intent('expansion-leave',{});this.network.onExpansion=v=>hub.applyExpansionState(v);this.network.onExpansionFeedback=(id,message,cancelled)=>hub.applyExpansionFeedback(id,message,cancelled);
                            hub.onGameAction=(type,index)=>this.network.intent('game-action',{type,index});hub.onGamePause=paused=>this.network.intent('pause-game',{paused});
                        }
                        void this.network.connect(endpoint.href,this.privateJoin);
                    }else this.networkBadge!.string='Mời người lớn mở vé phòng riêng từ trang phụ huynh';
                }
            }
        }catch(error){this.reportLoading(0,'Chưa mở được làng. Thử tải lại nhé!',true);if(this.loadingPanel)this.loadingPanel.active=false;this.statusRemaining=10;this.status.string='Chưa tải được hình. Nhờ người lớn mở lại giúp bé nhé!';console.warn('Village art:',error);}
    }
    private enableSolo():void{
        this.network.onGameFeedback=undefined;
        if(sys.isBrowser){try{saveSoloSession(window.sessionStorage,this.profileScope.slice(1));}catch{}}
        const hub=this.hub,first=this.chapterSave;if(!hub||!first)return;
        first.progress.onIntent=undefined;hub.onChapterIntro=undefined;hub.onClaim=undefined;hub.onLessonAnswer=undefined;
        hub.onGameStart=undefined;hub.onGameAction=undefined;hub.onGamePause=undefined;hub.onExpansionStart=undefined;hub.onExpansionChoice=undefined;hub.onExpansionLeave=undefined;hub.endExpansionOnline();
        hub.onJourneyAnswer=undefined;hub.onPortal=id=>{const p=portalDestination(this.player.position,id,this.hub?.campaign.level??1);if(p){this.resetInput();this.player.position=p;}};
    }
    private saveLearning():void{
        try{sys.localStorage.setItem('lang-tri-thuc.learning.v1',JSON.stringify(this.learning.data));}catch{}
        if(this.status)this.status.string=this.objective;
        for(let i=0;i<this.bundleNodes.length;i++)this.bundleNodes[i].active=this.learning.data.collected.indexOf(i)<0;
    }
    onEnable(): void {
        input.on(Input.EventType.KEY_DOWN, this.keyDown, this); input.on(Input.EventType.KEY_UP, this.keyUp, this);
        input.on(Input.EventType.TOUCH_START, this.touchStart, this); input.on(Input.EventType.TOUCH_MOVE, this.touchMove, this);
        input.on(Input.EventType.TOUCH_END, this.touchEnd, this); input.on(Input.EventType.TOUCH_CANCEL, this.touchCancel, this);
        game.on(Game.EVENT_HIDE, this.resetInput, this);
        if (sys.isBrowser){window.addEventListener('blur', this.handleBlur);window.addEventListener('resize',this.handleResize);window.addEventListener('wheel',this.handleWheel,{passive:false,capture:true});}
    }
    private drawMap(): void {
        const colors = { grass: new Color(130, 183, 100), road: new Color(201, 171, 121), rice: new Color(170, 198, 75), pond: new Color(83, 174, 204), courtyard: new Color(215, 185, 145) };
        // 25 static chunks, 64 diamonds per chunk. No per-frame map redraw or per-tile nodes.
        for (let cy = 0; cy < SIZE; cy += 8) for (let cx = 0; cx < SIZE; cx += 8) {
            const chunk = ui(this.world, `Terrain-${cx}-${cy}`), g = chunk.addComponent(Graphics);
            this.terrainChunks.push({ node: chunk, center: toWorld({ x: cx + 3.5, y: cy + 3.5 }) });
            for (let y = cy; y < cy + 8; y++) for (let x = cx; x < cx + 8; x++) {
                const p = toWorld({ x, y }), type = terrain(x, y); g.fillColor = colors[type];
                g.moveTo(p.x - 32, p.y); g.lineTo(p.x, p.y + 16); g.lineTo(p.x + 32, p.y); g.lineTo(p.x, p.y - 16); g.close(); g.fill();
                if (type === 'rice') {
                    g.strokeColor = new Color(85, 140, 53); g.lineWidth = 2;
                    for (const dx of [-12, 0, 12]) { g.moveTo(p.x + dx, p.y - 4); g.lineTo(p.x + dx - 3, p.y + 4); g.moveTo(p.x + dx, p.y - 4); g.lineTo(p.x + dx + 4, p.y + 5); } g.stroke();
                }
                if (type === 'pond' && (x + y) % 3 === 0) { g.strokeColor = new Color(155, 218, 231); g.moveTo(p.x - 9, p.y); g.lineTo(p.x + 9, p.y); g.stroke(); }
            }
        }
        // Zone names belong to the minimap: world labels otherwise collide with roofs/NPCs.
    }
    private character(name: string, shirt: Color, farmer: boolean): Node {
        const n = ui(this.actors, name, 64, 90), g = n.addComponent(Graphics);
        g.fillColor = new Color(40, 60, 30, 80); g.ellipse(0, 0, 17, 7); g.fill();
        if (!farmer) return n;
        g.fillColor = new Color(75, 64, 61); g.rect(-12, 4, 9, 16); g.rect(3, 4, 9, 16); g.fill();
        g.fillColor = shirt; g.roundRect(-16, 18, 32, 27, 6); g.fill();
        circle(g, 0, 52, 14, new Color(255, 209, 154));
        circle(g, -5, 54, 2, new Color(50, 40, 30)); circle(g, 5, 54, 2, new Color(50, 40, 30));
        if (farmer) { g.fillColor = new Color(239, 210, 130); g.moveTo(-25, 61); g.lineTo(0, 83); g.lineTo(25, 61); g.close(); g.fill(); }
        return n;
    }
    private syncStudent(dt:number):void{
        if(!this.student||!this.hub||!this.chapterSave)return;
        this.hub.campaign.data.age=this.student.profile.age;
        this.cloudElapsed+=dt;this.authElapsed+=dt;
        this.appearanceWait=Math.max(0,this.appearanceWait-dt);
        if(!this.appearanceBusy&&this.appearanceWait===0&&this.student.profile.avatar!==this.hub.campaign.data.avatar){
            this.appearanceBusy=true;this.appearanceWait=3;const session=this.student,avatar=this.hub.campaign.data.avatar;
            void studentRequest(session.api,session.token,'/profiles/'+session.profile.id+'/appearance','PUT',{avatar}).then(value=>{session.profile.avatar=value.avatar;}).catch(error=>{if(error.status===401||error.status===404)location.reload();else if(this.networkBadge){this.networkBadge.node.active=true;this.networkBadge.string='Chưa đồng bộ được nhân vật. Tiến độ trên máy được giữ.';}}).finally(()=>{this.appearanceBusy=false;});
        }
        if(this.authElapsed>60){this.authElapsed=0;void studentRequest(this.student.api,this.student.token,'/profiles/'+this.student.profile.id+'/play').then(value=>{if(!this.student)return;this.student.profile=value.profile;this.hub!.studentName=value.profile.label;this.hub!.studentGender=value.profile.gender;}).catch(error=>{if(error.status===401||error.status===404)location.reload();});}
        if(this.privateJoin&&this.networkStarted&&!this.network.offlineMode)return;
        if(this.cloudBusy||this.cloudConflict||this.cloudElapsed<3)return;
        this.cloudElapsed=0;this.hub.campaign.syncChapterOne(this.chapterSave.progress.data);
        const campaign=JSON.stringify(this.hub.campaign.data),chapterOne=JSON.stringify(this.chapterSave.progress.data),signature=campaign+chapterOne;
        if(signature===this.cloudSignature)return;this.cloudBusy=true;const session=this.student;
        void studentRequest(session.api,session.token,'/profiles/'+session.profile.id+'/progress','PUT',{revision:session.revision,campaign,chapterOne}).then(value=>{session.revision=value.revision;this.cloudSignature=signature;try{sys.localStorage.setItem('lang-tri-thuc.cloud-revision.'+session.profile.id,String(value.revision));}catch{}}).catch(error=>{if(error.status===401||error.status===404){location.reload();return;}if(error.status===409){this.cloudConflict=true;this.networkBadge!.node.active=true;this.networkBadge!.string='Tiến độ đã đổi trên thiết bị khác. Hãy tải lại; bản trên máy được giữ.';}else if(this.networkBadge){this.networkBadge.node.active=true;this.networkBadge.string='Chưa đồng bộ được. Tiến độ đang lưu trên máy.';}}).finally(()=>{this.cloudBusy=false;});
    }
    update(dt: number): void {
        if(!this.player)return;
        if(this.hub&&this.assetsReady&&!this.interior)this.interior=new HouseInteriorView(this.root,this.hub,this.art,()=>this.resetInput(),{
            load:async()=>{const s=this.student;if(!s)throw Error('No student session');return (await studentRequest(s.api,s.token,'/profiles/'+s.profile.id+'/houses')).rewards;},
            claim:async(id,age,answers)=>{const s=this.student;if(!s)throw Error('No student session');return (await studentRequest(s.api,s.token,'/profiles/'+s.profile.id+'/houses/'+id+'/claim','POST',{age,answers})).rewards;}
        });
        if(this.interior?.node.active){const size=this.node.getComponent(UITransform)!;this.interior.update(dt,size.width,size.height);}
        this.guide?.setModal(this.modalActive);
        if(this.hub&&this.assetsReady&&!this.modalActive){
            for(const config of enterableHouses){if(this.houseDoors.some(d=>d.house.id===config.id))continue;const exterior=this.actors.getChildByName(config.node);if(!exterior)continue;const goal=homeApproach(this.map,tileAt(this.player.position),tileAt(exterior.position));if(!goal)continue;const node=ui(this.world,'HouseEntrance-'+config.id,180,44),p=toWorld(goal);node.setPosition(p.x,p.y+35);const g=node.addComponent(Graphics);g.fillColor=new Color('#547044');g.roundRect(-90,-22,180,44,8);g.fill();const caption=label(node,config.name,175,42,17);caption.getComponent(Label)!.color=new Color('#fff4da');this.houseDoors.push({house:config,node,goal});if(config.id==='home'){this.homeDoor=node;this.homeGoal=goal;}}
            const house=this.actors.getChildByName('house');
            if(house&&!this.homeDoor){this.homeGoal=homeApproach(this.map,tileAt(this.player.position),tileAt(house.position));if(this.homeGoal){this.homeDoor=ui(this.world,'HomeEntrance',160,50);const p=toWorld(this.homeGoal);this.homeDoor.setPosition(p.x,p.y+35);const g=this.homeDoor.addComponent(Graphics);g.fillColor=new Color('#547044');g.roundRect(-80,-25,160,50,9);g.fill();label(this.homeDoor,'Nhà của bé',155,45,20);}}
            if(this.homeDoor&&this.homeGoal){const p=toWorld(this.homeGoal);this.homeDoor.children[0].getComponent(Label)!.string=Math.hypot(p.x-this.player.position.x,p.y-this.player.position.y)<12?'Vào nhà →':'Nhà của bé';}
            for(const door of this.houseDoors){const p=toWorld(door.goal);door.node.children[0].getComponent(Label)!.string=Math.hypot(p.x-this.player.position.x,p.y-this.player.position.y)<12?'Vào nhà →':door.house.name;}
        }
        this.syncStudent(dt);
        if(this.hub&&this.assetsReady){this.growth.update(this.actors,this.hub.campaign,this.art);this.guideElapsed+=dt;if(this.guideElapsed>.4){this.guideElapsed=0;this.guideStart??={...this.player.position};const data=this.hub.campaign.data.upgrades??=restoreUpgrades(null);this.guide.update(data,{move:Math.hypot(this.player.position.x-this.guideStart.x,this.player.position.y-this.guideStart.y)>30,talk:this.chapterSave?.progress.data.greeted===true,reward:this.hub.campaign.stars>0,modal:this.modalActive},()=>{this.hub!.onActivitySave?.();this.hub!.save.save();},()=>this.chapter?.navigateObjective());}}
        const orientationGate=sys.isBrowser?document.getElementById('rotate-device'):null;
        if(this.assetsReady&&orientationGate&&!orientationGate.hidden){this.resetInput();return;}

        this.cms?.step(dt);this.chapter?.stepDialogue?.(dt);
        if(this.assetsReady)this.countryside.step(dt,[this.player.position,...this.npcCollisionPositions],this.hub?.campaign.data.sound===true);
        const size = this.node.getComponent(UITransform)!;
        const pixelScale = view.getScaleX() / view.getDevicePixelRatio();
        if (size.width !== this.viewWidth || size.height !== this.viewHeight || (this.compactScreen && pixelScale !== this.lastPixelScale)) {
            this.viewWidth = size.width; this.viewHeight = size.height;
            this.lastPixelScale = pixelScale;
            // Keep mobile HUD dimensions in CSS pixels despite a 1280px design Canvas.
            const uiScale = this.compactScreen ? Math.max(1, 1 / pixelScale) : 1;
            this.baseWorldScale = this.compactScreen ? uiScale * 0.8 : Math.max(1,Math.min(size.width/1440,size.height/810));
            this.zoomButtons.forEach((button,i)=>{button.setScale(uiScale,uiScale,1);button.setPosition(size.width/2-(168-i*64)*uiScale,size.height/uiScale<500?-10*uiScale:size.height/2-225*uiScale);});
            this.backdrop.clear(); this.backdrop.fillColor = new Color(193, 218, 179);
            this.backdrop.rect(-size.width / 2, -size.height / 2, size.width, size.height); this.backdrop.fill();
            const width = Math.min(840, size.width / uiScale - 24), hint = this.header.getChildByName('Instructions')!;
            hint.getComponent(UITransform)!.setContentSize(width - 20, 90);
            this.header.setScale(uiScale, uiScale, 1); this.header.setPosition(0, size.height / 2 - 60 * uiScale);
            if(this.questButton){const w=this.compactScreen?140:200;this.questButton.setScale(uiScale,uiScale,1);this.questButton.setPosition(0,size.height/2-148*uiScale);this.questButton.getComponent(UITransform)!.setContentSize(w,58);}
            for(const [button,sign] of [[this.journalButton,-1],[this.parentButton,1]] as const)if(button){button.setScale(uiScale,uiScale,1);button.setPosition(sign*(size.width/2-68*uiScale),size.height/2-148*uiScale);}
            if(this.networkBadge){this.networkBadge.node.setScale(uiScale,uiScale,1);this.networkBadge.node.setPosition(this.compactScreen?size.width/2-(110+10)*uiScale:0,-size.height/2+125*uiScale);this.networkBadge.node.getComponent(UITransform)!.setContentSize(this.compactScreen?220:500,55);}
            const hg = this.header.getComponent(Graphics)!; hg.clear(); hg.fillColor = new Color(43, 78, 50, 235);
            hg.roundRect(-width / 2, -48, width, 96, 12); hg.fill();
            const statusWidth=Math.min(500,size.width/uiScale-(this.compactScreen?175:20));
            this.status.node.setScale(uiScale, uiScale, 1); this.status.node.setPosition(this.compactScreen?size.width/2-(statusWidth/2+10)*uiScale:0, -size.height / 2 + 40 * uiScale);
            this.status.fontSize=this.compactScreen?16:20;this.status.lineHeight=this.compactScreen?24:28;
            this.status.node.getComponent(UITransform)!.setContentSize(statusWidth, 80);
            this.joystick.setScale(uiScale, uiScale, 1); this.joystick.setPosition(-size.width / 2 + 95 * uiScale, -size.height / 2 + 95 * uiScale);
            const scale = Math.min(uiScale, (size.width - 24 * uiScale) / 620,(size.height-24*uiScale)/560); this.dialog.setScale(scale, scale, 1);
        }
        // A puzzle can open without a viewport resize. Fit its responsive board immediately.
        if(this.hub){
            const uiScale=this.compactScreen?Math.max(1,1/pixelScale):1;
            const cssWidth=game.canvas?.clientWidth||size.width,cssHeight=game.canvas?.clientHeight||size.height;
            const cssScale=Math.max(size.width/cssWidth,size.height/cssHeight);
            const compactViewport=cssWidth<700||cssHeight<500;
            this.hub.configurePuzzleLayout(size.width>size.height);
            this.hub.configureFlowerLayout?.(cssWidth>cssHeight&&cssHeight<500);
            const hubSize=this.hub.node.getComponent(UITransform)!;
            let scale=this.hub.largePuzzle||this.hub.flowerCareActive
                ?Math.min((size.width-16*cssScale)/hubSize.width,(size.height-16*cssScale)/hubSize.height)
                :Math.min(compactViewport?Infinity:uiScale,(size.width-24*cssScale)/620,(size.height-24*cssScale)/560);
            if(!compactViewport)scale=Math.min(scale,Math.min(960,cssWidth*.84)*cssScale/hubSize.width,Math.min(size.width>size.height?620:900,cssHeight*.84)*cssScale/hubSize.height);
            if(this.hub.node.scale.x!==scale)this.hub.node.setScale(scale,scale,1);
            if(!compactViewport&&this.dialog){
                const bounds=this.dialog.getComponent(UITransform)!;
                const dialogScale=Math.min(uiScale,Math.min(960,cssWidth*.84)*cssScale/bounds.width,Math.min(620,cssHeight*.84)*cssScale/bounds.height);
                this.dialog.setScale(dialogScale,dialogScale,1);
            }
        }
        for(const button of [this.questButton,this.journalButton,this.parentButton])if(button)button.active=!this.modalActive&&(!this.hud||button===this.questButton);
        this.zoomButtons.forEach(button=>button.active=!this.modalActive&&!this.loadingPanel?.active);
        const zoomScale=this.baseWorldScale*this.zoom.value;if(zoomScale!==this.worldScale){this.worldScale=zoomScale;this.world.setScale(zoomScale,zoomScale,1);}
        const zoomUiScale=this.compactScreen?Math.max(1,1/pixelScale):1;
        const desktopZoom=!!this.hud&&!!this.hub&&size.width/zoomUiScale>=900&&size.height/zoomUiScale>=600;
        if(this.zoomLabel)this.zoomLabel.string=desktopZoom?'⌖':Math.round(this.zoom.value*100)+'%';
        if(this.zoomSaveDelay>0){this.zoomSaveDelay-=Math.max(0,Math.min(dt,0.1));if(this.zoomSaveDelay<=0)try{sys.localStorage.setItem('lang-tri-thuc.view-zoom.v1',String(this.zoom.value));}catch{}}
        const keyboard = inputAxis(this.keys);
        this.player.axis = this.modalActive ? { x: 0, y: 0 } : Math.hypot(this.stick.x, this.stick.y) > 0.05 ? this.stick : keyboard;
        if (Math.hypot(this.player.axis.x, this.player.axis.y) > 0.05) {this.pendingNpc = false;this.pendingBundle=null;this.chapter?.cancel();this.hub?.cancel();}
        this.updateNpcPatrol(dt);
        this.player.step(dt);
        this.chapter?.step();
        this.hub?.step(dt);
        this.hudTick+=dt;const refreshHud=this.hudTick>=.1;
        if(this.hud&&this.hub&&refreshHud){const scale=this.compactScreen?Math.max(1,1/pixelScale):1;this.hud.resize(size.width,size.height,scale);const data=this.hub.campaign.data;const chapterIndex=chapters.findIndex(c=>!data.receipts.includes('reward.star.'+c.id)),currentChapter=chapters[chapterIndex<0?chapters.length-1:chapterIndex];this.hud.step({studentName:this.hub.studentName,level:this.hub.campaign.level,levelProgress:this.hub.campaign.levelProgress,stars:this.hub.campaign.stars,completed:data.completed.length,total:chapters.reduce((sum,c)=>sum+c.quests.length,0),practice:data.practice.length,objective:this.objective,chapterTitle:`Ch\u01b0\u01a1ng ${chapterIndex<0?8:chapterIndex+1} - ${currentChapter.title}`,quests:currentChapter.quests.map(q=>({title:q.title,done:data.completed.includes(q.id)})),avatar:this.art.avatarFrame(data.avatar,0,6,data.hair,data.skin,data.age),player:this.player.position,dt:this.hudTick,protectedTargets:[...(this.chapterSave?.progress.stage==='plant'?this.chapter?.plots.filter((_,i)=>!this.chapterSave!.progress.data.planted.includes(i))??[]:[]),...this.world.children.filter(n=>n.name.startsWith('Expansion-Sign-')&&Math.hypot(n.position.x-this.player.position.x,n.position.y-this.player.position.y)<140),...[this.actors.getChildByName('Schoolyard-VietnamFlag'),this.world.getChildByName('Schoolyard-DirtFootball')].filter((n):n is Node=>!!n&&Math.hypot(n.position.x-this.player.position.x,n.position.y-this.player.position.y)<240)],canInteract:[this.farmer.node,...(this.chapter?[this.chapter.elder]:[]),...(this.hub?.npcNodes??[]),...(this.cms?.nodes??[])].some(n=>Math.hypot(n.position.x-this.player.position.x,n.position.y-this.player.position.y)<100)},!this.modalActive&&!this.loadingPanel?.active);
            this.header.active=false;this.networkBadge!.node.active=false;this.status.node.active=this.statusRemaining>0&&!this.modalActive;
            if(this.status.node.active){const portraitNotice=size.width/scale<600;this.status.node.setPosition(portraitNotice?-size.width/2+105*scale:((size.width/scale<900||size.height/scale<600)?50*scale:0),-size.height/2+(portraitNotice?210:115)*scale);this.status.node.getComponent(UITransform)!.setContentSize(portraitNotice?180:320,48);this.status.fontSize=14;this.status.lineHeight=20;}
            this.hud.skinControls();
            this.joystick.active=!this.modalActive&&(this.compactScreen||this.desktopJoystick&&size.width/scale>=900&&size.height/scale>=600);if(!this.compactScreen){this.joystick.setScale(scale*.65,scale*.65,1);this.joystick.setPosition(size.width/2-170*scale,-size.height/2+75*scale);}
            if(this.journalButton)this.journalButton.active=false;if(this.parentButton)this.parentButton.active=false;if(this.questButton)this.questButton.active=!this.modalActive;
            const desktop=size.width/scale>=900&&size.height/scale>=600;
            this.zoomButtons.forEach((button,i)=>{button.setSiblingIndex(this.root.children.length-1);button.getComponent(UITransform)!.setContentSize(desktop?24:56,desktop?24:48);if(desktop)button.setPosition(size.width/2-24*scale,size.height/2-(46+i*28)*scale);const caption=button.children[0].getComponent(Label)!;caption.node.getComponent(UITransform)!.setContentSize(desktop?22:52,desktop?22:46);caption.fontSize=desktop?18:i===1?16:26;});
        }
        if(this.compactScreen&&this.joystick){const controlScale=Math.max(1,1/pixelScale)*(this.hub?.campaign.data.upgrades?.largeControls?1.2:1);this.joystick.setScale(controlScale,controlScale,1);}
        if(this.hub&&this.assetsReady){const home=this.hub.campaign.data.home,houseNode=this.actors.getChildByName('house'),house=houseNode?scenerySprite(houseNode):null;if(home!==this.homeStyle&&house){this.homeStyle=home;house.color=[new Color(255,255,255),new Color(175,235,205),new Color(225,190,255),new Color(255,240,150)][home];}
            const stars=this.hub.campaign.stars;if(stars!==this.starCount){this.starCount=stars;if(!this.treeLights){const n=ui(this.world,'BanyanLights'),p=toWorld(villageObjects.find(o=>o.id==='banyan')!);n.setPosition(p.x,p.y+280);this.treeLights=n.addComponent(Graphics);}const g=this.treeLights;g.clear();for(let i=0;i<8;i++){g.fillColor=i<stars?new Color(255,228,100):new Color(110,135,100);g.circle(Math.cos(i*Math.PI/4)*60,Math.sin(i*Math.PI/4)*35,7);g.fill();}}}

        if(this.hud&&this.hub&&refreshHud){const people=[{id:'farmer',position:this.farmer.node.position,friend:false},...(this.chapter?[{id:'elder',position:this.chapter.elder.position,friend:false}]:[]),...this.hub.npcNodes.map(n=>({id:n.name,position:n.position,friend:false})),...Array.from(this.network.players,([id,p])=>({id:'friend-'+id,position:p,friend:true}))];this.hud.updateMapPeople(people);}
        if(refreshHud)this.hudTick=0;
        if(this.hub&&this.qualityStyle!==this.hub.campaign.data.quality){this.qualityStyle=this.hub.campaign.data.quality;const pipeline=director.root?.pipeline;if(pipeline)pipeline.shadingScale=this.qualityStyle==='low'?0.75:this.qualityStyle==='medium'?0.9:1;}
        this.playerVisual?.step(dt,this.player.moving,this.player.direction);
        if(this.hub)void this.art.ensureAvatar(this.hub.campaign.data.avatar);if(this.hub?.campaign.data.hair===1)void this.art.ensureHair(this.hub.campaign.data.avatar);if(this.childSprite){this.spriteTime+=dt;const row=this.player.moving?1+(Math.floor(this.spriteTime*8)%2):0;this.childSprite.spriteFrame=this.art.avatarFrame(this.hub?.campaign.data.avatar??0,row,this.player.direction,this.hub?.campaign.data.hair??0,this.hub?.campaign.data.skin??0,this.hub?.campaign.data.age);if(this.accessoryGraphic)drawAccessory(this.accessoryGraphic,this.hub?.campaign.data.accessory??0,this.player.direction,row);if(this.accessoryGraphic&&this.gestureGraphic)animateGesture(this.gesture,this.childSprite,this.accessoryGraphic,this.gestureGraphic,dt,this.player.moving);}
        if(this.networkStarted){
            this.network.update(dt,{...this.player.position,direction:this.player.direction,moving:this.player.moving,name:'',avatar:this.hub?.campaign.data.avatar??0,accessory:this.hub?.campaign.data.accessory??0,hair:this.hub?.campaign.data.hair??0,skin:this.hub?.campaign.data.skin??0});
            if(this.network.correction){this.player.cancel();this.player.position=this.network.correction;this.network.correction=null;this.pendingBundle=null;this.pendingNpc=false;this.chapter?.cancel();}
            this.updateRemoteActors(dt);
            const badge=this.network.visibleMessage||(this.network.room?`Làng online • ${this.network.players.size+1} bạn`:this.network.status);
            if(this.networkBadge&&this.networkBadge.string!==badge)this.networkBadge.string=badge;
        }
        if(this.chapterSave?.sessionOnly&&this.networkBadge)this.networkBadge.string='Chơi trong phiên này • Bộ nhớ chưa lưu được';
        if(this.marker){
            this.marker.active=this.player.hasPath&&!this.modalActive;
            this.markerTime+=Math.min(dt,0.1);const pulse=1+Math.sin(this.markerTime*5)*0.08;this.marker.setScale(pulse,pulse,1);
        }
        if(this.loadingPanel?.active){const g=this.loadingPanel.getComponent(Graphics)!;g.clear();g.fillColor=new Color(43,78,50,250);g.rect(-size.width/2,-size.height/2,size.width,size.height);g.fill();}
        const cameraWidth = size.width / this.worldScale, cameraHeight = size.height / this.worldScale;
        // Reserve the top HUD area: put the player below center so nearby NPC heads stay visible.
        const hudScale=this.compactScreen?Math.max(1,1/pixelScale):1;
        const focus=referenceCameraFocus(this.player.position,cameraWidth,cameraHeight,this.compactScreen||size.width<900||size.height<600||tileAt(this.player.position).x>=36||tileAt(this.player.position).y>=36,(this.compactScreen?(size.width>size.height?60:160):45)*hudScale/this.worldScale);
        if(this.player.moving)this.freeCameraOffset=undefined;
        const camera = cameraOffset(this.freeCameraOffset?{x:-this.freeCameraOffset.x,y:-this.freeCameraOffset.y}:focus, cameraWidth, cameraHeight); this.world.setPosition(camera.x * this.worldScale, camera.y * this.worldScale);
        this.animateNpcs(dt,camera,cameraWidth,cameraHeight);
        if(this.assetsReady)for(const [id,asset,name] of npcArt){
            const node=this.hub?.npcNodes.find(n=>n.name===id);if(!node||this.npcDecorated.has(id)||Math.abs(node.position.x+camera.x)>cameraWidth/2+150||Math.abs(node.position.y+camera.y)>cameraHeight/2+150)continue;
            this.npcDecorated.add(id);void this.art.ensureDecoration(asset).then(()=>{
                const frame=this.art.decorations[asset];if(!this.isValid||!node.isValid||!frame)return;
                const height=id==='ti-na'?90:id==='ba-ban-hang'?105:140,width=height*frame.rect.width/frame.rect.height,body=this.art.sprite(node,name,frame,width,height);body.setPosition(0,-5);body.setScale(actorScale,actorScale,1);node.getComponent(Graphics)!.clear();node.getComponent(UITransform)!.setContentSize(Math.max(96,width),110);node.getChildByName('Text')?.setPosition(0,95);
                this.registerNpcMotion(node,body);
            });
        }
        if(this.assetsReady&&!this.sceneryPending&&sceneryPlacements().some(item=>{const p=toWorld(item);return Math.abs(p.x+camera.x)<cameraWidth/2+250&&Math.abs(p.y+camera.y)<cameraHeight/2+250;})){
            this.sceneryPending=true;void this.art.ensureScenery().then(()=>{if(!this.isValid)return;for(const item of sceneryPlacements()){if(item.id==='market')continue;const frame=this.art.scenery[item.cell];if(!frame)continue;const n=this.art.sprite(this.actors,'Scenery-'+item.id,frame,item.width,item.height),p=toWorld(item);n.setPosition(p.x,p.y);this.sceneryNodes.push(n);if(item.id.startsWith('sign-')){n.setParent(this.world);n.setSiblingIndex(this.world.children.length-1);const titles:Record<string,string>={'sign-banyan':'Cây Đa Tri Thức','sign-courtyard':'Sân Đình','sign-well':'Giếng Làng','sign-market':'Chợ Quê','sign-home':'Nhà Của Bé','sign-rice':'Ruộng Lúa'};const sign=villageSignLabel(n,titles[item.id]??'',item.width,item.height,'Text').node;if(item.id==='sign-banyan'){const words=(titles[item.id]??'').split(' ');sign.getComponent(Label)!.string=words.slice(0,2).join(' ')+'\n'+words.slice(2).join(' ');const pin=ui(n,'QuestPin',30,38),g=pin.addComponent(Graphics);pin.setPosition(0,87);g.fillColor=new Color(255,204,64);g.circle(0,0,13);g.fill();g.moveTo(-5,-9);g.lineTo(0,-22);g.lineTo(5,-9);g.close();g.fill();g.strokeColor=new Color(255,246,196);g.lineWidth=2;g.circle(0,0,13);g.stroke();label(pin,'!',22,25,20).getComponent(Label)!.color=new Color(70,48,25);}sign.getComponent(Label)!.color=new Color(255,244,205);}if(!item.essential)this.optionalScenery.add(n);}this.sceneryReady=this.art.scenery.length===10;});
        }
        for(const scenery of this.sceneryNodes){const bounds=scenery.getComponent(UITransform)!;scenery.active=(!this.optionalScenery.has(scenery)||this.hub?.campaign.data.quality!=='low')&&Math.abs(scenery.position.x+camera.x)<cameraWidth/2+bounds.width&&Math.abs(scenery.position.y+camera.y)<cameraHeight/2+bounds.height;}
        // Foliage/roofs fade when they would cover the local child's face. Collision is unchanged.
        const depth=(node:Node)=>node.position.y+(node.name==='JourneyLandmark-school'?(node.getComponent(UITransform)?.height??0)*.3:0);
        const silhouettes=[this.player.position,...(this.hub?.npcNodes.map(n=>n.position)??[]),...(this.cms?.nodes.map(n=>n.position)??[])];
        for(const scenery of this.sceneryNodes){const sprite=scenerySprite(scenery);if(!sprite||scenery.parent!==this.actors)continue;if(scenery.name==='dinh'||scenery.name==='house'||scenery.name==='house-west'||scenery.name==='Scenery-market'){if(sprite.color.a!==255){const c=sprite.color;sprite.color=new Color(c.r,c.g,c.b,255);}continue;}const bounds=scenery.getComponent(UITransform)!,covered=silhouettes.some(p=>p.y>depth(scenery)&&Math.abs(p.x-scenery.position.x)<bounds.width*.5&&p.y+58>scenery.position.y&&p.y+58<scenery.position.y+bounds.height),alpha=covered?92:255;if(sprite.color.a!==alpha){const color=sprite.color;sprite.color=new Color(color.r,color.g,color.b,alpha);}}
        for(const item of this.regionalScenery)if(item.node.active&&!item.pending){if(item.node.getChildByName('PrivateHouseArt')){item.pending=true;continue;}item.pending=true;void this.art.ensureObject(item.id,item.frame).then(frame=>{if(!this.isValid||!item.node.isValid||!frame||item.node.getChildByName('PrivateHouseArt'))return;item.node.getComponent(Graphics)?.clear();const bounds=item.node.getComponent(UITransform)!;this.art.sprite(item.node,'RegionalArt',frame,bounds.width,bounds.height);});}
        for (const chunk of this.terrainChunks) {
            chunk.node.active = Math.abs(chunk.center.x + camera.x) < cameraWidth / 2 + 256
                && Math.abs(chunk.center.y + camera.y) < cameraHeight / 2 + 128;
        }
        if (this.statusRemaining > 0) { this.statusRemaining -= dt; if (this.statusRemaining <= 0) this.status.string = this.objective; }
        else if(this.status.string!==this.objective)this.status.string=this.objective;
        // The school illustration includes a deep courtyard below the building.
        // Sort at the building's front edge so people in the yard remain visible.
        const sorted=[...this.actors.children].sort((a,b)=>depth(b)-depth(a));
        for(let i=0;i<sorted.length;i++)if(sorted[i].getSiblingIndex()!==i)sorted[i].setSiblingIndex(i);
        this.namesTick+=dt;if(this.namesTick>=.1){this.namesTick=0;this.nameplates?.step(this.player.position,this.modalActive,{left:-camera.x-cameraWidth/2,right:-camera.x+cameraWidth/2,bottom:-camera.y-cameraHeight/2+75/this.worldScale,top:-camera.y+cameraHeight/2},{OngDo:this.chapterSave?.progress.stage==='return'?'?':this.chapterSave?.progress.stage==='greet'?'!':'',...(this.chapterSave?.progress.stage==='plant'||this.chapterSave?.progress.stage==='count'?{[this.farmer.node.name]:'!'}:{})});}
        if (this.lastDirection !== this.player.direction) {
            this.lastDirection = this.player.direction; const angle = this.lastDirection * Math.PI / 4, g = this.arrow.getComponent(Graphics)!;
            g.clear(); g.fillColor = new Color(255, 255, 245); const x = Math.cos(angle), y = Math.sin(angle);
            g.moveTo(x * 30, y * 15); g.lineTo(x * 19 - y * 5, y * 10 + x * 5); g.lineTo(x * 19 + y * 5, y * 10 - x * 5); g.close(); g.fill();
        }
        if (this.pendingNpc) {
            const p = this.farmer.node.position;
            if (!this.player.hasPath && Math.hypot(p.x - this.player.position.x, p.y - this.player.position.y) < 55) {
                this.pendingNpc = false; this.player.cancel(); this.resetInput(); if(this.chapter)this.chapter.open('farmer');else if(this.panel)this.panel.open();else this.dialog.active = true; this.farmer.interact();
            }
        }
        if(this.pendingBundle!==null&&!this.player.hasPath){const p=toWorld(riceBundles[this.pendingBundle]);if(Math.hypot(p.x-this.player.position.x,p.y-this.player.position.y)<8){this.learning.collect(this.pendingBundle);this.pendingBundle=null;this.saveLearning();}}
        // Modal visibility is immediate; only HUD data/layout waits for the 10 Hz refresh.
        if(this.hud)this.hud.node.active=!this.modalActive&&!this.loadingPanel?.active;
        if(this.modalActive){if(this.joystick)this.joystick.active=false;if(this.status?.node)this.status.node.active=false;this.zoomButtons.forEach(button=>button.active=false);if(this.questButton)this.questButton.active=false;}
    }
    private updateRemoteActors(dt:number):void{
        this.remoteActors.forEach((actor,id)=>{if(!this.network.players.has(id)){actor.node.destroy();this.remoteActors.delete(id);}});
        this.network.players.forEach((p,id)=>{void this.art.ensureAvatar(p.avatar??0);if(p.hair===1)void this.art.ensureHair(p.avatar??0);let actor=this.remoteActors.get(id);
            if(!actor){const node=ui(this.actors,`Online-${id}`);node.setPosition(p.x,p.y);const body=ui(node,'ActorBody');body.setScale(actorScale,actorScale,1);const sprite=this.art.sprite(body,'OnlineSprite',this.art.avatarFrame(p.avatar??0,0,6),90,110).getComponent(Sprite)!;const name=label(node,p.name,160,30,18);name.getComponent(Label)!.color=new Color(50,105,160);name.setPosition(0,85);const accessory=ui(body,'Scarf').addComponent(Graphics);const gestureGraphic=ui(body,'Gesture').addComponent(Graphics);actor={node,sprite,accessory,gesture:new AvatarGestureState(),gestureGraphic};this.remoteActors.set(id,actor);}
            const t=Math.min(1,dt*12);actor.node.setPosition(actor.node.position.x+(p.x-actor.node.position.x)*t,actor.node.position.y+(p.y-actor.node.position.y)*t);
            actor.sprite.spriteFrame=this.art.avatarFrame(p.avatar??0,p.moving?1+(Math.floor(this.spriteTime*8)%2):0,p.direction,p.hair??0,p.skin??0,p.age);drawAccessory(actor.accessory,p.accessory??0,p.direction,p.moving?1+(Math.floor(this.spriteTime*8)%2):0);animateGesture(actor.gesture,actor.sprite,actor.accessory,actor.gestureGraphic,dt,p.moving);
        });
    }
    private local(p: Point, node = this.root): Vec3 { return node.getComponent(UITransform)!.convertToNodeSpaceAR(new Vec3(p.x, p.y, 0)); }
    private select(p: Point): void {
        if(this.interior?.node.active&&!this.hub?.node.active){this.interior.handle(p);return;}
        if(this.cms?.dialog.active){this.cms.handle(p);return;}
        if(this.hub?.node.active){this.hub.handle(p);return;}
        if (this.dialog.active) {
            if(this.chapter){this.chapter.handle(p);return;}
            if(this.panel){this.panel.handle(p);return;}
            const d = this.local(p, this.dialog); if (Math.abs(d.x) <= 310 && Math.abs(d.y) <= 170) this.dialog.active = false;
            return;
        }
        const zoomControl=this.zoomControl(p);if(zoomControl){this.changeZoom(zoomControl.name==='ZoomReset'?1:this.zoom.value*(zoomControl.name==='ZoomIn'?1.2:1/1.2));return;}
        if(this.hud?.handle(p))return;
        for(const [button,mode] of [[this.journalButton,'journal'],[this.parentButton,'gate']] as const)if(button?.activeInHierarchy){const local=this.local(p,button),bounds=button.getComponent(UITransform)!;if(Math.abs(local.x)<=bounds.width/2&&Math.abs(local.y)<=bounds.height/2){this.hub?.open(mode);return;}}
        if(this.questButton?.activeInHierarchy){const local=this.local(p,this.questButton),bounds=this.questButton.getComponent(UITransform)!;if(Math.abs(local.x)<=bounds.width/2&&Math.abs(local.y)<=bounds.height/2){
            if(this.chapter?.navigateObjective()){this.keys.clear();this.releaseStick();this.pendingNpc=false;this.pendingBundle=null;}return;
        }}
        if(this.isHeader(p))return;
        this.selectWorld(this.local(p,this.world));
    }
    private selectWorld(world:Point):void{
        const entrance=this.houseDoors?.find(d=>Math.abs(world.x-d.node.position.x)<90&&Math.abs(world.y-d.node.position.y)<22);
        if(entrance&&this.interior){const p=toWorld(entrance.goal);this.resetInput();if(Math.hypot(p.x-this.player.position.x,p.y-this.player.position.y)<12)this.interior.open(entrance.house);else if(this.player.goTo(entrance.goal))this.showDestination(entrance.goal);return;}
        const house=this.interior?this.actors.getChildByName('house'):null;
        const door=this.homeDoor;
        if(this.interior&&this.homeGoal&&((door&&Math.abs(world.x-door.position.x)<80&&Math.abs(world.y-door.position.y)<25)||(house&&Math.abs(world.x-house.position.x)<100&&world.y>house.position.y&&world.y<house.position.y+180))){
            const p=toWorld(this.homeGoal);if(Math.hypot(p.x-this.player.position.x,p.y-this.player.position.y)<12){this.resetInput();this.interior.open();}else{this.resetInput();this.player.goTo(this.homeGoal);this.showDestination(this.homeGoal);}return;
        }
        const sign=this.world?.children?.find(n=>n.name.startsWith('JourneySign-')&&Math.abs(n.position.x-world.x)<140&&Math.abs(n.position.y-world.y)<26);if(sign){this.hub?.openJourneyRegion(sign.name.slice(12));return;}
        if(this.cms?.select(world)){this.chapter?.cancel();this.hub?.cancel();this.pendingNpc=false;this.pendingBundle=null;return;}
        world=this.nameplates?.target(world)??world;
        const npc = this.farmer.node.position,minHalfWidth=22/(this.worldScale*view.getScaleX()/view.getDevicePixelRatio());
        const hubTarget=this.hub?.select(world,minHalfWidth);if(hubTarget){if(hubTarget==='accepted'){this.chapter?.cancel();this.pendingNpc=false;this.pendingBundle=null;}return;}
        const chapterTarget=this.chapter?.select(world,minHalfWidth);
        if(chapterTarget){if(chapterTarget==='accepted'){this.hub?.cancel();this.pendingNpc=false;this.pendingBundle=null;}return;}
        const detailTarget=this.hub?.selectDetail(world);if(detailTarget){if(detailTarget==='accepted'){this.chapter?.cancel();this.pendingNpc=false;this.pendingBundle=null;}return;}
        if (Math.abs(world.x - npc.x) <= Math.max(40,minHalfWidth) && world.y >= npc.y - 12 && world.y <= npc.y + this.npcHitHeight) {
            const n=this.map.npc;
            const candidates = [{ x:n.x+1,y:n.y },{x:n.x-1,y:n.y},{x:n.x,y:n.y-1},{x:n.x,y:n.y+1}];
            const distance=(goal:Point)=>{const p=toWorld(goal);return Math.hypot(p.x-this.player.position.x,p.y-this.player.position.y);};
            candidates.sort((a,b)=>distance(a)-distance(b));
            for (const goal of candidates) if (this.player.goTo(goal)) { this.pendingNpc = true; this.pendingBundle = null; this.chapter?.cancel();this.hub?.cancel(); this.showDestination(goal); break; }
        } else {
            const bundle=this.bundleNodes.findIndex(node=>node.active&&Math.abs(world.x-node.position.x)<35&&world.y>=node.position.y-12&&world.y<=node.position.y+95);
            if(bundle>=0&&this.learning.data.stage==='collect'){
                if(this.player.goTo(riceBundles[bundle])){this.pendingBundle=bundle;this.pendingNpc=false;this.showDestination(riceBundles[bundle]);}return;
            }
            const goal=tileAt(world);
            if(this.player.goTo(goal)){this.pendingNpc=false;this.pendingBundle=null;this.chapter?.cancel();this.hub?.cancel();this.showDestination(goal);}
            else {this.status.string = 'Chỗ này chưa đi tới được. Chọn ô đất khác nhé!'; this.statusRemaining = 2.5;}
        }
    }
    private showDestination(goal: Point): void {
        if(this.marker){const p=toWorld(goal);this.marker.setPosition(p.x,p.y);this.marker.active=true;this.markerTime=0;}
        if(this.status)this.status.string=this.objective;this.statusRemaining=0;
    }
    private isHeader(p:Point):boolean {
        if(!this.header||!this.header.active)return false;
        const local=this.local(p,this.header),width=this.header.getChildByName('Instructions')!.getComponent(UITransform)!.width+20;
        return Math.abs(local.x)<=width/2&&Math.abs(local.y)<=48;
    }
    private tapThreshold():number { return 15*view.getDevicePixelRatio()/view.getScaleX(); }
    private zoomControl(p:Point):Node|undefined{return this.zoomButtons.find(n=>{if(!n.activeInHierarchy)return false;const point=this.local(p,n),t=n.getComponent(UITransform)!;return Math.abs(point.x)<=t.width/2&&Math.abs(point.y)<=t.height/2;});}
    private isHudControl(p:Point):boolean{return !!this.hud?.hit(p)||!!this.zoomControl(p)||[this.questButton,this.journalButton,this.parentButton].some(n=>{if(!n?.active)return false;const point=this.local(p,n),size=n.getComponent(UITransform)!;return Math.abs(point.x)<=size.width/2&&Math.abs(point.y)<=size.height/2;});}
    private navigateQuest():void{if(this.chapter?.navigateObjective()){this.keys.clear();this.releaseStick();this.pendingNpc=false;this.pendingBundle=null;}}
    private interactNearest():void{const details=environmentGuides.map(g=>this.actors.getChildByName('Detail-'+g.id)).filter((n):n is Node=>!!n),targets=[...(this.cms?.nodes??[]),this.farmer.node,...(this.chapter?[this.chapter.elder]:[]),...(this.hub?.npcNodes??[]),...details].sort((a,b)=>Math.hypot(a.position.x-this.player.position.x,a.position.y-this.player.position.y)-Math.hypot(b.position.x-this.player.position.x,b.position.y-this.player.position.y));const n=targets[0];if(n&&Math.hypot(n.position.x-this.player.position.x,n.position.y-this.player.position.y)<100)this.selectWorld({x:n.position.x,y:n.position.y+(n.name.startsWith('Detail-')?20:60)});else this.chapter?.navigateObjective();}
    private changeZoom(value:number):void{this.zoom.set(value);this.zoomSaveDelay=0.3;}
    private handleWheel=(event:WheelEvent):void=>{if(!this.player)return;if(event.ctrlKey||this.modalActive||this.loadingPanel?.active||this.pinchIds||event.target!==game.canvas)return;event.preventDefault();this.changeZoom(this.zoom.wheel(event.deltaY));};
    private keyDown(e: EventKeyboard): void {if(!this.dialog)return;if(this.loadingPanel?.active)return;
        if(this.interior?.node.active&&!this.hub?.node.active){this.interior.key(e.keyCode,true);return;}
        if (e.keyCode === 27) { this.hud?.closeEmotion?.(); this.cms?.close();this.hub?.close();this.chapter?.close();this.dialog.active = false; this.resetInput(); return; }
        if(e.keyCode===69&&!this.modalActive){this.interactNearest();return;}
        if(this.cms?.dialog.active){this.cms.key(e.keyCode);return;}
        if(this.chapter?.node.active){this.chapter.key(e.keyCode);return;}
        if(this.hub?.node.active){this.hub.key(e.keyCode);return;}
        if (!this.modalActive) this.keys.add(e.keyCode);
    }
    private keyUp(e: EventKeyboard): void { this.keys.delete(e.keyCode);this.interior?.key(e.keyCode,false); }
    // Cocos 3.8.8 converts left mouse events to touch events. One shared handler avoids double clicks.
    private touchStart(e: EventTouch): void {if(!this.joystick)return;if(this.loadingPanel?.active)return;
        const id=e.getID();if(id===null)return;
        const point=e.getUILocation(), start={x:point.x,y:point.y};
        if(this.interior?.node.active&&!this.hub?.node.active){if(this.interiorPointer===null){this.interiorPointer=id;this.interior.beginPointer(point);}return;}
        // A modal owns one pointer; a second finger must not replace a drawing stroke or tap a button.
        if(this.modalActive&&this.touches.size){this.touches.set(id,{start,current:start,dragged:false,blocked:true,control:true});return;}
        if(this.hub?.node.active)this.hub.beginPress?.(point);
        if(this.modalActive&&!(this.hub?.node.active&&this.hub.flowerCareActive))beginModalPress(this.node,point);
        const stickPoint=this.joystick.active?this.local(point,this.joystick):null;
        const onStick=!!stickPoint&&Math.hypot(stickPoint.x,stickPoint.y)<=75;
        this.touches.set(id,{start,current:start,dragged:false,control:this.isHudControl(point),hubDrag:this.hub?.beginDrag?.(point),panBase:{x:(this.world?.position.x??0)/this.worldScale,y:(this.world?.position.y??0)/this.worldScale},blocked:!!this.pinchIds||!this.modalActive&&(this.isHeader(point)||onStick)});
        if(!this.modalActive&&this.stickId===null&&!this.pinchIds){const pair=Array.from(this.touches.entries()).filter(([,g])=>!g.blocked&&!g.control&&!g.hubDrag);if(pair.length===2){const [[first,a],[second,b]]=pair;if(this.zoom.beginPinch(Math.hypot(a.current.x-b.current.x,a.current.y-b.current.y))){this.pinchIds=[first,second];a.blocked=b.blocked=a.dragged=b.dragged=true;this.keys.clear();this.player?.cancel();this.pendingNpc=false;this.pendingBundle=null;this.chapter?.cancel();this.hub?.cancel();return;}}}
        if (!this.joystick.active || this.modalActive || this.stickId !== null) return;
        if (onStick) { this.stickId = id; this.pendingNpc = false; this.pendingBundle = null; this.chapter?.cancel();this.hub?.cancel(); this.player?.cancel(); this.updateStick(e); }
    }
    private updateStick(e: EventTouch): void {
        const p = this.local(e.getUILocation(), this.joystick), length = Math.hypot(p.x, p.y), scale = Math.max(45, length);
        this.stick = length < 7 ? { x: 0, y: 0 } : { x: p.x / scale, y: p.y / scale }; this.knob.setPosition(this.stick.x * 45, this.stick.y * 45);
    }
    private touchMove(e: EventTouch): void {if(!this.joystick)return;
        if(this.interior?.node.active&&!this.hub?.node.active){if(e.getID()===this.interiorPointer)this.interior.movePointer(e.getUILocation());return;}
        const id=e.getID();if(id===null)return;
        const gesture=this.touches.get(id),p=e.getUILocation();
        if(gesture)gesture.current={x:p.x,y:p.y};
        if(this.pinchIds){const a=this.touches.get(this.pinchIds[0]),b=this.touches.get(this.pinchIds[1]);if(a&&b)this.changeZoom(this.zoom.pinch(Math.hypot(a.current.x-b.current.x,a.current.y-b.current.y)));return;}
        if(gesture&&Math.hypot(p.x-gesture.start.x,p.y-gesture.start.y)>this.tapThreshold()){gesture.dragged=true;this.hub?.endPress?.();endModalPress();}
        if(this.world&&this.player&&gesture?.dragged&&!gesture.blocked&&!gesture.control&&!gesture.hubDrag&&!this.modalActive&&this.touches.size===1&&id!==this.stickId){const base=gesture.panBase!;this.freeCameraOffset={x:base.x+(p.x-gesture.start.x)/this.worldScale,y:base.y+(p.y-gesture.start.y)/this.worldScale};this.keys.clear();this.player.cancel();this.pendingNpc=false;this.pendingBundle=null;this.chapter?.cancel();this.hub?.cancel();}
        if(gesture?.hubDrag&&gesture.dragged)this.hub?.moveDrag(p);if (id === this.stickId) this.updateStick(e);
    }
    private touchEnd(e: EventTouch): void {if(!this.joystick)return;if(this.loadingPanel?.active)return;
        if(e.getID()===this.interiorPointer&&this.interiorPointer!==null){this.interiorPointer=null;this.interior?.endPointer(e.getUILocation());return;}
        this.interior?.release();
        this.hub?.endPress?.();endModalPress();
        const id=e.getID();if(id===null)return;
        const gesture=this.touches.get(id);this.touches.delete(id);
        if(this.pinchIds){this.pinchIds=undefined;this.zoom.endPinch();this.touches.forEach(g=>g.blocked=true);return;}
        if (id === this.stickId) { this.releaseStick(); return; }
        const p=e.getUILocation();
        if(gesture?.hubDrag&&this.hub?.endDrag(p,gesture.dragged))return;
        if(gesture&&!gesture.blocked&&!gesture.dragged&&Math.hypot(p.x-gesture.start.x,p.y-gesture.start.y)<=this.tapThreshold())this.select(p);
    }
    private touchCancel(e: EventTouch): void {if(e.getID()===this.interiorPointer){this.interiorPointer=null;this.interior?.cancelPointer();}this.interior?.release();this.hub?.endPress?.();endModalPress(); const id=e.getID();if(id===null)return;if(this.touches.get(id)?.hubDrag)this.hub?.cancelDrag();this.touches.delete(id);if(this.pinchIds){this.pinchIds=undefined;this.zoom.endPinch();this.touches.forEach(g=>g.blocked=true);} if (id === this.stickId) this.releaseStick(); }
    private releaseStick(): void { this.stickId = null; this.stick = { x: 0, y: 0 }; this.knob?.setPosition(0, 0); }
    private resetInput(): void {this.interiorPointer=null;this.interior?.stop();this.hub?.endPress?.();endModalPress(); this.keys.clear(); this.freeCameraOffset=undefined;this.releaseStick();this.pinchIds=undefined;this.zoom.endPinch();this.touches.clear();this.player?.cancel();this.pendingNpc=false;this.pendingBundle=null;this.chapter?.cancel();this.hub?.cancel(); }
    private handleBlur = (): void => { this.interior?.stop();this.resetInput(); };
    // Full-screen CSS keeps frame style strings constant; explicitly reapply the
    // public policy so Creator updates its backing canvas after viewport rotation.
    private handleResize = ():void=>{
        this.resetInput();
        const size=view.getDesignResolutionSize();view.setDesignResolutionSize(size.width,size.height,view.getResolutionPolicy());
        const canvas=game.canvas;if(canvas)director.root?.resize(canvas.width,canvas.height);
    };
    onDisable(): void {
        if (this.player) { this.player.cancel(); this.pendingNpc = false; this.resetInput(); }
        input.off(Input.EventType.KEY_DOWN, this.keyDown, this); input.off(Input.EventType.KEY_UP, this.keyUp, this);
        input.off(Input.EventType.TOUCH_START, this.touchStart, this); input.off(Input.EventType.TOUCH_MOVE, this.touchMove, this);
        input.off(Input.EventType.TOUCH_END, this.touchEnd, this); input.off(Input.EventType.TOUCH_CANCEL, this.touchCancel, this);
        game.off(Game.EVENT_HIDE, this.resetInput, this);
        if (sys.isBrowser){window.removeEventListener('blur', this.handleBlur);window.removeEventListener('resize',this.handleResize);window.removeEventListener('wheel',this.handleWheel,true);}
    }
    onDestroy(): void {this.guide.dispose();this.studentAbort.abort();this.uiClick.dispose();this.cms?.dispose();this.countryside.dispose();this.hud?.dispose();this.hub?.dispose();this.chapter?.dispose();this.network.dispose();this.art.dispose(); if (this.root) this.root.destroy();}
}
