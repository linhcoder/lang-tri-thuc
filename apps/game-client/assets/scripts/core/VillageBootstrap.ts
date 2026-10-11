import { _decorator, Color, Component, director, EventKeyboard, EventTouch, game, Game, Graphics, input, Input, JsonAsset, resources, Label, Layers, Node, Sprite, SpriteFrame, sys, UITransform, Vec3, view } from 'cc';
import { cameraOffset, inputAxis, Point, SIZE, terrain, tileAt, toWorld, VillageMap, storyNpcs, villageDetails, villageObjects,environmentGuides } from '../world/VillageModel';
import {referenceCameraFocus} from '../world/ReferenceCamera';
import { AvatarGesture, AvatarGestureState, PlayerController, PlayerVisual } from '../player/PlayerController';
import { FarmerNPC } from '../npc/FarmerNPC';
import {CameraZoom} from '../player/CameraZoom';
import {NpcPatrol,PatrolPose} from '../world/NpcPatrol';
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
import {VillageNameplates} from '../ui/VillageNameplates';
import {VillageHUD} from '../ui/VillageHUD';
import {chapters} from '../world/CampaignContent';
const { ccclass, disallowMultiple, requireComponent } = _decorator;
const npcArt=[['co-tam','co-tam','CoTamSprite'],['co-giao-lan','teacher','TeacherSprite'],['ba-ban-hang','market-lady','MarketLadySprite'],['nghe-nhan-gom','potter','PotterSprite'],['ti-na','ti-na','FriendsSprite'],['chi-hang-cuoi','hang-cuoi','FestivalSprite']] as const;
const actorScale=0.78;
function scenerySprite(node:Node):Sprite|null{return node.getComponent(Sprite)??node.getChildByName('RegionalArt')?.getComponent(Sprite)??null;}
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
    if(state.kind==='hello'||state.kind==='wave'){
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
    private map = new VillageMap();
    private desktopJoystick=true;
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
    private art=new VillageArt();
    private childSprite?:Sprite;
    private gesture=new AvatarGestureState();private gestureGraphic?:Graphics;private spriteTime=0;private accessoryGraphic?:Graphics;
    private learning=new LearningProgress();
    private panel?:LearningPanel;
    private bundleNodes:Node[]=[];
    private pendingBundle:number|null=null;
    private network=new VillageNetwork();
    private remoteActors=new Map<string,{node:Node;sprite:Sprite;accessory:Graphics;gesture:AvatarGestureState;gestureGraphic:Graphics}>();
    private npcHitHeight=85;
    private npcMotion=new Map<Node,{body:Node;time:number;near:boolean;greeting:number;baseY:number;scale:number;row:number;width:number;height:number;idle:SpriteFrame|null}>();
    private npcPatrol=new NpcPatrol();private npcWalking=new Map<Node,PatrolPose>();
    private updateNpcPatrol(dt:number):void{
        if(!this.hub||!this.assetsReady)return;const online=!!this.network.room&&this.network.npcs.size===this.hub.npcNodes.length;
        if(!online)this.npcPatrol.step(dt,[this.player.position]);
        for(const node of this.hub.npcNodes){const p=online?this.network.npcs.get(node.name):this.npcPatrol.poses.get(node.name);if(!p)continue;const t=online?Math.min(1,dt*16):1;node.setPosition(node.position.x+(p.x-node.position.x)*t,node.position.y+(p.y-node.position.y)*t);this.npcWalking.set(node,p);}
        this.map.npcPositions=this.hub.npcNodes.map(n=>({x:n.position.x,y:n.position.y}));
    }
    private registerNpcMotion(node:Node,body:Node):void{
        const row=['ElderSprite','FarmerSprite','CoTamSprite','MarketLadySprite','FriendsSprite','TeacherSprite','PotterSprite','FestivalSprite'].indexOf(body.name);
        const transform=body.getComponent(UITransform)!;
        this.npcMotion.set(node,{body,time:this.npcMotion.size*.73,near:false,greeting:0,baseY:body.position.y,scale:body.scale.x,row,width:transform.width,height:transform.height,idle:body.getComponent(Sprite)?.spriteFrame??null});
    }
    private animateNpcs(dt:number,camera:Point,width:number,height:number):void{
        for(const [node,state] of this.npcMotion){
            if(!node.isValid||!state.body.isValid){this.npcMotion.delete(node);continue;}
            if(Math.abs(node.position.x+camera.x)>width/2+150||Math.abs(node.position.y+camera.y)>height/2+150)continue;
            const near=Math.hypot(node.position.x-this.player.position.x,node.position.y-this.player.position.y)<110;
            if(near&&!state.near&&!this.modalActive)state.greeting=1.4;
            state.near=near;state.time+=Math.min(dt,.1);state.greeting=Math.max(0,state.greeting-Math.min(dt,.1));
            const greeting=state.greeting>0?Math.sin((1.4-state.greeting)*Math.PI/1.4):0;
            const walk=this.npcWalking.get(node),moving=walk?.moving===true,facing=walk&&[3,4,5].includes(walk.direction)?-1:1;
            const sprite=state.body.getComponent(Sprite),poses=this.art.npcPoses[state.row],directions=this.art.npcDirections[state.row];
            const directional=!!directions&&(moving||greeting===0);
            if(sprite)sprite.spriteFrame=directional?directions[walk?.direction??6]:poses&&(moving||greeting>0)?poses[moving?Math.floor(state.time*6)%2:2]:state.idle;
            state.body.getComponent(UITransform)!.setContentSize(directional?state.height*directions[0].rect.width/directions[0].rect.height:state.width,state.height);
            state.body.setPosition(0,state.baseY+(moving?Math.abs(Math.sin(state.time*9))*2:Math.sin(state.time*1.8)*.65)+greeting*3);
            state.body.setScale(state.scale*(directional?1:facing),state.scale*(1+Math.sin(state.time*1.8)*.006),1);
            state.body.angle=(moving?Math.sin(state.time*9)*2:0)+greeting*Math.sin((1.4-state.greeting)*9)*3;
        }
    }
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
    private get modalActive():boolean{return this.dialog.active||!!this.hub?.node.active;}
    private get objective():string{return this.hub?.objective??this.chapterSave?.progress.description??this.learning.description;}
    onLoad(): void {
        this.demo=sys.isBrowser&&new URLSearchParams(window.location.search).get('demo')==='1';
        try{const saved=sys.localStorage.getItem('lang-tri-thuc.view-zoom.v1'),value=Number(saved);if(saved?.trim()&&Number.isFinite(value)&&value>=this.zoom.min&&value<=this.zoom.max)this.zoom.set(value);}catch{}
        if(sys.isBrowser&&!this.demo){const fragment=new URLSearchParams(window.location.hash.slice(1));let storage:Storage|undefined;try{storage=window.sessionStorage;}catch{}const session=restoreJoinSession(fragment.get('ticket'),fragment.get('room'),storage,raw=>atob(raw.replace(/-/g,'+').replace(/_/g,'/')));if(session){this.profileScope='.'+session.profileId;this.privateJoin=session.join;}if(fragment.has('ticket')||fragment.has('room'))history.replaceState(null,'',window.location.pathname+window.location.search);}
        if(!this.demo){this.chapterSave=new ChapterOneSave(sys.localStorage,'lang-tri-thuc.chapter-one.v2'+this.profileScope);this.chapterSave.load();}
        try{this.learning.restore(sys.localStorage.getItem('lang-tri-thuc.learning.v1'));}catch{}
        this.root = ui(this.node, 'Milestone01A');
        this.backdrop = ui(this.root, 'VillageBackground').addComponent(Graphics);
        this.world = ui(this.root, 'VillageWorld');
        this.drawMap();
        this.marker = ui(this.world, 'Destination'); const mg=this.marker.addComponent(Graphics);
        mg.strokeColor=new Color(255,250,210);mg.lineWidth=3;mg.ellipse(0,0,20,10);mg.stroke();this.marker.active=false;
        this.actors = ui(this.world, 'DepthSortedActors');
        const pn = this.character('Em bé', new Color(237, 115, 86), false);
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
        this.joystick.active = sys.isMobile;
        if(this.demo){this.panel=new LearningPanel(this.root,this.learning,()=>this.saveLearning());this.dialog=this.panel.node;}
        else{this.chapter=new ChapterOneView(this.root,this.actors,this.chapterSave!.progress,this.player,this.chapterSave!,()=>this.resetInput(),p=>this.showDestination(p));this.dialog=this.chapter.node;}
        if(this.chapter){
            this.hub=new VillageHub(this.root,this.actors,new CampaignSave(sys.localStorage,'lang-tri-thuc.campaign.v1'+this.profileScope),this.chapterSave!,this.player,()=>this.resetInput(),p=>this.showDestination(p));
            let localActivityJson=JSON.stringify(activitySnapshot(this.hub.campaign.data));
            this.hub.onActivitySave=()=>{if(!this.hub)return;const current=JSON.stringify(activitySnapshot(this.hub.campaign.data));if(current!==localActivityJson){localActivityJson=current;this.hub.campaign.data.activitiesDirty=true;}};
            this.hub.onPortal=id=>{const p=portalDestination(this.player.position,id);if(p){this.resetInput();this.player.position=p;}};
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
        this.loadingPanel=ui(this.root,'LoadingVillage');this.loadingPanel.addComponent(Graphics);this.loadingLabel=label(this.loadingPanel,'Đang mở làng…',520,100,26).getComponent(Label)!;this.loadingLabel.color=new Color(255,251,231);this.network.onOffline=()=>this.enableSolo();void this.loadArt();
    }
    private async loadArt():Promise<void>{
        try{
            await this.art.load();if(!this.isValid)return;const pack=await new Promise<JsonAsset>((resolve,reject)=>resources.load('chapter-pack',JsonAsset,(error,asset)=>error?reject(error):resolve(asset)));if(!applyChapterText(pack.json))console.warn('Invalid chapter text pack: using built-in content');const lessons=await new Promise<JsonAsset>((resolve,reject)=>resources.load('lesson-pack',JsonAsset,(error,asset)=>error?reject(error):resolve(asset)));if(!applyLessonPack(lessons.json))console.warn('Invalid lesson pack: using built-in questions');const npcPack=await new Promise<JsonAsset>((resolve,reject)=>resources.load('npc-pack',JsonAsset,(error,asset)=>error?reject(error):resolve(asset)));if(!applyNpcPack(npcPack.json))console.warn('Invalid NPC pack: keeping default spawns');if(this.hub)this.hub.npcNodes.forEach((node,i)=>{const npc=storyNpcs[i],p=toWorld(npc);node.setPosition(p.x,p.y);const text=node.getChildByName('Text')?.getComponent(Label);if(text)text.string=npc.name;});this.chapter?.setRiceFrame(this.art.decorations.seedling);this.chapter?.refreshContent();
            for(let cy=0;cy<SIZE;cy+=8)for(let cx=0;cx<SIZE;cx+=8){const node=this.art.terrainChunk(this.world,cx,cy);if(node){
                const old=this.terrainChunks.find(chunk=>chunk.node.name===`Terrain-${cx}-${cy}`);if(old){old.node.active=false;old.node.destroy();old.node=node;}
                node.setSiblingIndex(0);
            }}
            this.art.meadowBackdrop(this.world);
            for(const child of [...this.player.node.children])if(child!==this.arrow)child.destroy();
            const body=ui(this.player.node,'ActorBody');body.setScale(actorScale,actorScale,1);this.playerVisual=undefined;this.childSprite=this.art.sprite(body,'ChildSprite',this.art.child[6],90,110).getComponent(Sprite)!;this.accessoryGraphic=ui(body,'Scarf').addComponent(Graphics);this.gestureGraphic=ui(body,'Gesture').addComponent(Graphics);
            this.childSprite.node.setPosition(0,-7);
            if(this.hub){this.hub.onGesture=id=>{if(this.networkStarted&&this.network.privateMode&&!this.network.offlineMode){this.network.emote(id);}else this.gesture.start(id);};this.network.onEmote=(sessionId,id)=>{if(!isAvatarGesture(id))return;const state=sessionId===this.network.room?.sessionId?this.gesture:this.remoteActors.get(sessionId)?.gesture;state?.start(id as AvatarGesture);};this.hub.onAvatarPreview=(parent,id,hair=this.hub?.campaign.data.hair??0)=>{const n=this.art.sprite(parent,'AvatarPreview',this.art.avatarFrame(id,0,6,hair),55,70);n.setPosition(-100,-35);void Promise.all([this.art.ensureAvatar(id),hair===1?this.art.ensureHair(id):Promise.resolve()]).then(()=>{if(n.isValid)n.getComponent(Sprite)!.spriteFrame=this.art.avatarFrame(id,0,6,hair);});};this.hub.applyServerProgress();}
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
            for(const object of villageObjects){let node:Node;const objectFrame=this.art.objectFrame(object.id,object.frame);if(objectFrame)node=this.art.sprite(this.actors,object.id,objectFrame,object.width,object.height);else{node=ui(this.actors,object.id,object.width,object.height);node.getComponent(UITransform)!.setAnchorPoint(.5,0);const g=node.addComponent(Graphics);g.fillColor=new Color(139,161,102,150);g.ellipse(0,10,object.width*.3,15);g.fill();this.regionalScenery.push({node,id:object.id,frame:object.frame,pending:false});}const p=toWorld(object);node.setPosition(p.x,p.y);this.sceneryNodes.push(node);}
            if(this.demo)await this.art.ensureEnvironment(4);
            for(let i=0;this.demo&&i<riceBundles.length;i++){
                const p=toWorld(riceBundles[i]),node=ui(this.actors,`RiceBundle-${i}`,75,95);node.setPosition(p.x,p.y);
                this.art.sprite(node,'Rice',this.art.environment[4],65,75);
                const ring=ui(node,'HarvestRing').addComponent(Graphics);ring.strokeColor=new Color(255,255,180);ring.lineWidth=3;ring.ellipse(0,2,23,12);ring.stroke();
                label(node,'Thu hoạch',100,25,16).setPosition(0,80);node.active=this.learning.data.collected.indexOf(i)<0;this.bundleNodes.push(node);
            }
            this.nameplates=new VillageNameplates(this.world,this.actors);
            if(this.hub){this.hud=new VillageHUD(this.root,mode=>this.hub?.open(mode),()=>this.interactNearest(),id=>{this.resetInput();this.player.cancel();this.hub?.onGesture?.(id);},()=>{this.desktopJoystick=!this.desktopJoystick;this.releaseStick();},()=>this.navigateQuest());this.header.active=false;this.networkBadge!.node.active=false;this.status.node.active=false;}
            this.assetsReady=true;if(this.loadingPanel)this.loadingPanel.active=false;
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
                            this.network.onProgress=value=>{const cosmetics={activitiesDirty:hub.campaign.data.activitiesDirty,quality:hub.campaign.data.quality,sound:hub.campaign.data.sound,avatar:hub.campaign.data.avatar,accessory:hub.campaign.data.accessory,hair:hub.campaign.data.hair,practice:hub.campaign.data.practice,practiceResume:hub.campaign.data.practiceResume,explored:hub.campaign.data.explored,care:hub.campaign.data.care,painting:hub.campaign.data.painting,holidayProgress:hub.campaign.data.holidayProgress,festivalProgress:hub.campaign.data.festivalProgress,home:hub.campaign.data.home};if(!value||!first.progress.restore(JSON.stringify(value.first))||!hub.campaign.restore(JSON.stringify(value.campaign)))return;Object.assign(hub.campaign.data,cosmetics);first.save();this.chapter?.refreshWorld();hub.save.save();hub.applyServerProgress();};
                            this.network.onGame=state=>hub.applyServerGame(state);
                            first.progress.onIntent=v=>this.network.intent('story',v);
                            hub.onChapterIntro=index=>this.network.intent('chapter-intro',{index});hub.onClaim=index=>this.network.intent('claim-star',{index});
                            hub.onLessonAnswer=v=>this.network.intent('lesson-answer',v);hub.onGameStart=questId=>this.network.intent('start-game',{questId});
                            hub.onPortal=id=>{this.network.intent('portal',{id});};hub.onlinePeers=()=>Array.from(this.network.players.entries()).map(([id,p])=>({id,name:p.name}));hub.onOnline=(action,id)=>{if(action==='emote')this.network.emote(id!);else if(action==='block')this.network.block(id!);else if(action==='report')this.network.report(id!,'uncomfortable');else if(action==='offline')this.network.offline();};
                            hub.onGameAction=(type,index)=>this.network.intent('game-action',{type,index});hub.onGamePause=paused=>this.network.intent('pause-game',{paused});
                        }
                        void this.network.connect(endpoint.href,this.privateJoin);
                    }else this.networkBadge!.string='Mời người lớn mở vé phòng riêng từ trang phụ huynh';
                }
            }
        }catch(error){if(this.loadingPanel)this.loadingPanel.active=false;this.statusRemaining=10;this.status.string='Chưa tải được hình. Nhờ người lớn mở lại giúp bé nhé!';console.warn('Village art:',error);}
    }
    private enableSolo():void{
        if(sys.isBrowser){try{saveSoloSession(window.sessionStorage,this.profileScope.slice(1));}catch{}}
        const hub=this.hub,first=this.chapterSave;if(!hub||!first)return;
        first.progress.onIntent=undefined;hub.onChapterIntro=undefined;hub.onClaim=undefined;hub.onLessonAnswer=undefined;
        hub.onGameStart=undefined;hub.onGameAction=undefined;hub.onGamePause=undefined;
        hub.onPortal=id=>{const p=portalDestination(this.player.position,id);if(p){this.resetInput();this.player.position=p;}};
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
    update(dt: number): void {
        const size = this.node.getComponent(UITransform)!;
        const pixelScale = view.getScaleX() / view.getDevicePixelRatio();
        if (size.width !== this.viewWidth || size.height !== this.viewHeight || (sys.isMobile && pixelScale !== this.lastPixelScale)) {
            this.viewWidth = size.width; this.viewHeight = size.height;
            this.lastPixelScale = pixelScale;
            // Keep mobile HUD dimensions in CSS pixels despite a 1280px design Canvas.
            const uiScale = sys.isMobile ? Math.max(1, 1 / pixelScale) : 1;
            this.baseWorldScale = sys.isMobile ? uiScale * 0.8 : Math.max(1,Math.min(size.width/1440,size.height/810));
            this.zoomButtons.forEach((button,i)=>{button.setScale(uiScale,uiScale,1);button.setPosition(size.width/2-(168-i*64)*uiScale,size.height/uiScale<500?-10*uiScale:size.height/2-225*uiScale);});
            this.backdrop.clear(); this.backdrop.fillColor = new Color(193, 218, 179);
            this.backdrop.rect(-size.width / 2, -size.height / 2, size.width, size.height); this.backdrop.fill();
            const width = Math.min(840, size.width / uiScale - 24), hint = this.header.getChildByName('Instructions')!;
            hint.getComponent(UITransform)!.setContentSize(width - 20, 90);
            this.header.setScale(uiScale, uiScale, 1); this.header.setPosition(0, size.height / 2 - 60 * uiScale);
            if(this.questButton){const w=sys.isMobile?140:200;this.questButton.setScale(uiScale,uiScale,1);this.questButton.setPosition(0,size.height/2-148*uiScale);this.questButton.getComponent(UITransform)!.setContentSize(w,58);}
            for(const [button,sign] of [[this.journalButton,-1],[this.parentButton,1]] as const)if(button){button.setScale(uiScale,uiScale,1);button.setPosition(sign*(size.width/2-68*uiScale),size.height/2-148*uiScale);}
            if(this.networkBadge){this.networkBadge.node.setScale(uiScale,uiScale,1);this.networkBadge.node.setPosition(sys.isMobile?size.width/2-(110+10)*uiScale:0,-size.height/2+125*uiScale);this.networkBadge.node.getComponent(UITransform)!.setContentSize(sys.isMobile?220:500,55);}
            const hg = this.header.getComponent(Graphics)!; hg.clear(); hg.fillColor = new Color(43, 78, 50, 235);
            hg.roundRect(-width / 2, -48, width, 96, 12); hg.fill();
            const statusWidth=Math.min(500,size.width/uiScale-(sys.isMobile?175:20));
            this.status.node.setScale(uiScale, uiScale, 1); this.status.node.setPosition(sys.isMobile?size.width/2-(statusWidth/2+10)*uiScale:0, -size.height / 2 + 40 * uiScale);
            this.status.fontSize=sys.isMobile?16:20;this.status.lineHeight=sys.isMobile?24:28;
            this.status.node.getComponent(UITransform)!.setContentSize(statusWidth, 80);
            this.joystick.setScale(uiScale, uiScale, 1); this.joystick.setPosition(-size.width / 2 + 95 * uiScale, -size.height / 2 + 95 * uiScale);
            const scale = Math.min(uiScale, (size.width - 24 * uiScale) / 620,(size.height-24*uiScale)/560); this.dialog.setScale(scale, scale, 1);
            this.hub?.node.setScale(scale,scale,1);
        }
        for(const button of [this.questButton,this.journalButton,this.parentButton])if(button)button.active=!this.modalActive;
        this.zoomButtons.forEach(button=>button.active=!this.modalActive&&!this.loadingPanel?.active);
        const zoomScale=this.baseWorldScale*this.zoom.value;if(zoomScale!==this.worldScale){this.worldScale=zoomScale;this.world.setScale(zoomScale,zoomScale,1);}
        if(this.zoomLabel)this.zoomLabel.string=Math.round(this.zoom.value*100)+'%';
        if(this.zoomSaveDelay>0){this.zoomSaveDelay-=Math.max(0,Math.min(dt,0.1));if(this.zoomSaveDelay<=0)try{sys.localStorage.setItem('lang-tri-thuc.view-zoom.v1',String(this.zoom.value));}catch{}}
        const keyboard = inputAxis(this.keys);
        this.player.axis = this.modalActive ? { x: 0, y: 0 } : Math.hypot(this.stick.x, this.stick.y) > 0.05 ? this.stick : keyboard;
        if (Math.hypot(this.player.axis.x, this.player.axis.y) > 0.05) {this.pendingNpc = false;this.pendingBundle=null;this.chapter?.cancel();this.hub?.cancel();}
        this.updateNpcPatrol(dt);
        this.player.step(dt);
        this.chapter?.step();
        this.hub?.step(dt);
        if(this.hud&&this.hub){const scale=sys.isMobile?Math.max(1,1/pixelScale):1;this.hud.resize(size.width,size.height,scale);const data=this.hub.campaign.data;const chapterIndex=chapters.findIndex(c=>!data.receipts.includes('reward.star.'+c.id)),currentChapter=chapters[chapterIndex<0?chapters.length-1:chapterIndex];this.hud.step({stars:this.hub.campaign.stars,completed:data.completed.length,total:chapters.reduce((sum,c)=>sum+c.quests.length,0),practice:data.practice.length,objective:this.objective,chapterTitle:`Ch\u01b0\u01a1ng ${chapterIndex<0?8:chapterIndex+1} - ${currentChapter.title}`,quests:currentChapter.quests.map(q=>({title:q.title,done:data.completed.includes(q.id)})),avatar:this.art.avatarFrame(data.avatar,0,6,data.hair),player:this.player.position},!this.modalActive&&!this.loadingPanel?.active);
            this.header.active=false;this.networkBadge!.node.active=false;this.status.node.active=this.statusRemaining>0&&!this.modalActive;
            if(this.status.node.active){const portraitNotice=size.width/scale<600;this.status.node.setPosition(portraitNotice?-size.width/2+105*scale:((size.width/scale<900||size.height/scale<600)?50*scale:0),-size.height/2+(portraitNotice?210:115)*scale);this.status.node.getComponent(UITransform)!.setContentSize(portraitNotice?180:320,48);this.status.fontSize=14;this.status.lineHeight=20;}
            this.hud.skinControls();
            this.joystick.active=!this.modalActive&&(sys.isMobile||this.desktopJoystick&&size.width/scale>=900&&size.height/scale>=600);if(!sys.isMobile){this.joystick.setScale(scale*.65,scale*.65,1);this.joystick.setPosition(size.width/2-170*scale,-size.height/2+75*scale);}
            const narrow=size.width/scale<360,controlScale=scale*(narrow?.8:1),edge=narrow?55:65;
            for(const button of [this.journalButton,this.parentButton])button?.getComponent(UITransform)!.setContentSize(110,58);this.questButton?.getComponent(UITransform)!.setContentSize(sys.isMobile?140:200,58);
            this.journalButton?.setScale(controlScale,controlScale,1);this.parentButton?.setScale(controlScale,controlScale,1);this.questButton?.setScale(controlScale,controlScale,1);
            this.journalButton?.setPosition(-size.width/2+edge*scale,size.height/2-178*scale);this.parentButton?.setPosition(size.width/2-edge*scale,size.height/2-178*scale);this.questButton?.setPosition(0,size.height/2-178*scale);
            const desktop=size.width/scale>=900&&size.height/scale>=600;if(desktop){
                for(const button of [this.journalButton,this.parentButton])button?.getComponent(UITransform)!.setContentSize(64,48);
                this.journalButton?.setPosition(-size.width/2+42*scale,size.height/2-106*scale);if(this.parentButton)this.parentButton.active=false;if(this.questButton)this.questButton.active=false;
                this.parentButton?.setPosition(-size.width/2+428*scale,size.height/2-112*scale);
                this.questButton?.getComponent(UITransform)!.setContentSize(200,36);this.questButton?.setPosition(-size.width/2+129*scale,size.height/2-390*scale);
            }
            const portrait=size.width/scale<600;this.zoomButtons.forEach((button,i)=>button.setPosition(size.width/2-(portrait?38:168-i*64)*scale,size.height/2-(portrait?248+i*56:245)*scale));
            this.zoomButtons.forEach((button,i)=>{button.setSiblingIndex(this.root.children.length-1);button.getComponent(UITransform)!.setContentSize(desktop?24:56,desktop?24:48);if(desktop)button.setPosition(size.width/2-24*scale,size.height/2-(46+i*28)*scale);const caption=button.children[0].getComponent(Label)!;caption.node.getComponent(UITransform)!.setContentSize(desktop?22:52,desktop?22:46);caption.fontSize=desktop?18:i===1?16:26;});
            if(desktop&&this.zoomLabel)this.zoomLabel.string='⌖';
        }
        if(this.hub&&this.assetsReady){const home=this.hub.campaign.data.home,houseNode=this.actors.getChildByName('house'),house=houseNode?scenerySprite(houseNode):null;if(home!==this.homeStyle&&house){this.homeStyle=home;house.color=[new Color(255,255,255),new Color(175,235,205),new Color(225,190,255),new Color(255,240,150)][home];}
            const stars=this.hub.campaign.stars;if(stars!==this.starCount){this.starCount=stars;if(!this.treeLights){const n=ui(this.world,'BanyanLights'),p=toWorld(villageObjects.find(o=>o.id==='banyan')!);n.setPosition(p.x,p.y+280);this.treeLights=n.addComponent(Graphics);}const g=this.treeLights;g.clear();for(let i=0;i<8;i++){g.fillColor=i<stars?new Color(255,228,100):new Color(110,135,100);g.circle(Math.cos(i*Math.PI/4)*60,Math.sin(i*Math.PI/4)*35,7);g.fill();}}}

        if(this.hud&&this.hub){const people=[{id:'farmer',position:this.farmer.node.position,friend:false},...(this.chapter?[{id:'elder',position:this.chapter.elder.position,friend:false}]:[]),...this.hub.npcNodes.map(n=>({id:n.name,position:n.position,friend:false})),...Array.from(this.network.players,([id,p])=>({id:'friend-'+id,position:p,friend:true}))];this.hud.updateMapPeople(people);}
        if(this.hub&&this.qualityStyle!==this.hub.campaign.data.quality){this.qualityStyle=this.hub.campaign.data.quality;const pipeline=director.root?.pipeline;if(pipeline)pipeline.shadingScale=this.qualityStyle==='low'?0.75:this.qualityStyle==='medium'?0.9:1;}
        this.playerVisual?.step(dt,this.player.moving,this.player.direction);
        if(this.hub)void this.art.ensureAvatar(this.hub.campaign.data.avatar);if(this.hub?.campaign.data.hair===1)void this.art.ensureHair(this.hub.campaign.data.avatar);if(this.childSprite){this.spriteTime+=dt;const row=this.player.moving?1+(Math.floor(this.spriteTime*8)%2):0;this.childSprite.spriteFrame=this.art.avatarFrame(this.hub?.campaign.data.avatar??0,row,this.player.direction,this.hub?.campaign.data.hair??0);if(this.accessoryGraphic)drawAccessory(this.accessoryGraphic,this.hub?.campaign.data.accessory??0,this.player.direction,row);if(this.accessoryGraphic&&this.gestureGraphic)animateGesture(this.gesture,this.childSprite,this.accessoryGraphic,this.gestureGraphic,dt,this.player.moving);}
        if(this.networkStarted){
            this.network.update(dt,{...this.player.position,direction:this.player.direction,moving:this.player.moving,name:'',avatar:this.hub?.campaign.data.avatar??0,accessory:this.hub?.campaign.data.accessory??0,hair:this.hub?.campaign.data.hair??0});
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
        const hudScale=sys.isMobile?Math.max(1,1/pixelScale):1;
        const focus=referenceCameraFocus(this.player.position,cameraWidth,cameraHeight,sys.isMobile||size.width<900||size.height<600,(sys.isMobile?160:45)*hudScale/this.worldScale);
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
            this.sceneryPending=true;void this.art.ensureScenery().then(()=>{if(!this.isValid)return;for(const item of sceneryPlacements()){const frame=this.art.scenery[item.cell];if(!frame)continue;const n=this.art.sprite(this.actors,'Scenery-'+item.id,frame,item.width,item.height),p=toWorld(item);n.setPosition(p.x,p.y);this.sceneryNodes.push(n);if(item.id.startsWith('sign-')){n.setParent(this.world);n.setSiblingIndex(this.world.children.length-1);const titles:Record<string,string>={'sign-banyan':'Cây Đa Tri Thức','sign-courtyard':'Sân Đình','sign-well':'Giếng Làng','sign-market':'Chợ Quê','sign-home':'Nhà Của Bé','sign-rice':'Ruộng Lúa'};const sign=label(n,titles[item.id]??'',90,item.id==='sign-banyan'?45:24,item.id==='sign-banyan'?14:12);sign.setPosition(0,item.id==='sign-banyan'?36:23);if(item.id==='sign-banyan'){const words=(titles[item.id]??'').split(' ');sign.getComponent(Label)!.string=words.slice(0,2).join(' ')+'\n'+words.slice(2).join(' ');const pin=ui(n,'QuestPin',30,38),g=pin.addComponent(Graphics);pin.setPosition(0,87);g.fillColor=new Color(255,204,64);g.circle(0,0,13);g.fill();g.moveTo(-5,-9);g.lineTo(0,-22);g.lineTo(5,-9);g.close();g.fill();g.strokeColor=new Color(255,246,196);g.lineWidth=2;g.circle(0,0,13);g.stroke();label(pin,'!',22,25,20).getComponent(Label)!.color=new Color(70,48,25);}sign.getComponent(Label)!.color=new Color(255,244,205);}if(!item.essential)this.optionalScenery.add(n);}this.sceneryReady=this.art.scenery.length===10;});
        }
        for(const scenery of this.sceneryNodes){const bounds=scenery.getComponent(UITransform)!;scenery.active=(!this.optionalScenery.has(scenery)||this.hub?.campaign.data.quality!=='low')&&Math.abs(scenery.position.x+camera.x)<cameraWidth/2+bounds.width&&Math.abs(scenery.position.y+camera.y)<cameraHeight/2+bounds.height;}
        // Foliage/roofs fade when they would cover the local child's face. Collision is unchanged.
        const silhouettes=[this.player.position,...(this.hub?.npcNodes.map(n=>n.position)??[])];
        for(const scenery of this.sceneryNodes){const sprite=scenerySprite(scenery);if(!sprite||scenery.parent!==this.actors)continue;const bounds=scenery.getComponent(UITransform)!,covered=silhouettes.some(p=>p.y>scenery.position.y&&Math.abs(p.x-scenery.position.x)<bounds.width*.5&&p.y+58>scenery.position.y&&p.y+58<scenery.position.y+bounds.height),alpha=covered?92:255;if(sprite.color.a!==alpha){const color=sprite.color;sprite.color=new Color(color.r,color.g,color.b,alpha);}}
        for(const item of this.regionalScenery)if(item.node.active&&!item.pending){item.pending=true;void this.art.ensureObject(item.id,item.frame).then(frame=>{if(!this.isValid||!item.node.isValid||!frame)return;item.node.getComponent(Graphics)?.clear();const bounds=item.node.getComponent(UITransform)!;this.art.sprite(item.node,'RegionalArt',frame,bounds.width,bounds.height);});}
        for (const chunk of this.terrainChunks) {
            chunk.node.active = Math.abs(chunk.center.x + camera.x) < cameraWidth / 2 + 256
                && Math.abs(chunk.center.y + camera.y) < cameraHeight / 2 + 128;
        }
        if (this.statusRemaining > 0) { this.statusRemaining -= dt; if (this.statusRemaining <= 0) this.status.string = this.objective; }
        else if(this.status.string!==this.objective)this.status.string=this.objective;
        const sorted=[...this.actors.children].sort((a,b)=>b.position.y-a.position.y);
        for(let i=0;i<sorted.length;i++)if(sorted[i].getSiblingIndex()!==i)sorted[i].setSiblingIndex(i);
        this.nameplates?.step(this.player.position,this.modalActive,{left:-camera.x-cameraWidth/2,right:-camera.x+cameraWidth/2,bottom:-camera.y-cameraHeight/2+75/this.worldScale,top:-camera.y+cameraHeight/2});
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
    }
    private updateRemoteActors(dt:number):void{
        this.remoteActors.forEach((actor,id)=>{if(!this.network.players.has(id)){actor.node.destroy();this.remoteActors.delete(id);}});
        this.network.players.forEach((p,id)=>{void this.art.ensureAvatar(p.avatar??0);if(p.hair===1)void this.art.ensureHair(p.avatar??0);let actor=this.remoteActors.get(id);
            if(!actor){const node=ui(this.actors,`Online-${id}`);node.setPosition(p.x,p.y);const body=ui(node,'ActorBody');body.setScale(actorScale,actorScale,1);const sprite=this.art.sprite(body,'OnlineSprite',this.art.avatarFrame(p.avatar??0,0,6),90,110).getComponent(Sprite)!;const name=label(node,p.name,160,30,18);name.getComponent(Label)!.color=new Color(50,105,160);name.setPosition(0,85);const accessory=ui(body,'Scarf').addComponent(Graphics);const gestureGraphic=ui(body,'Gesture').addComponent(Graphics);actor={node,sprite,accessory,gesture:new AvatarGestureState(),gestureGraphic};this.remoteActors.set(id,actor);}
            const t=Math.min(1,dt*12);actor.node.setPosition(actor.node.position.x+(p.x-actor.node.position.x)*t,actor.node.position.y+(p.y-actor.node.position.y)*t);
            actor.sprite.spriteFrame=this.art.avatarFrame(p.avatar??0,p.moving?1+(Math.floor(this.spriteTime*8)%2):0,p.direction,p.hair??0);drawAccessory(actor.accessory,p.accessory??0,p.direction,p.moving?1+(Math.floor(this.spriteTime*8)%2):0);animateGesture(actor.gesture,actor.sprite,actor.accessory,actor.gestureGraphic,dt,p.moving);
        });
    }
    private local(p: Point, node = this.root): Vec3 { return node.getComponent(UITransform)!.convertToNodeSpaceAR(new Vec3(p.x, p.y, 0)); }
    private select(p: Point): void {
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
    private interactNearest():void{const details=environmentGuides.map(g=>this.actors.getChildByName('Detail-'+g.id)).filter((n):n is Node=>!!n),targets=[this.farmer.node,...(this.chapter?[this.chapter.elder]:[]),...(this.hub?.npcNodes??[]),...details].sort((a,b)=>Math.hypot(a.position.x-this.player.position.x,a.position.y-this.player.position.y)-Math.hypot(b.position.x-this.player.position.x,b.position.y-this.player.position.y));const n=targets[0];if(n&&Math.hypot(n.position.x-this.player.position.x,n.position.y-this.player.position.y)<100)this.selectWorld({x:n.position.x,y:n.position.y+(n.name.startsWith('Detail-')?20:60)});else this.chapter?.navigateObjective();}
    private changeZoom(value:number):void{this.zoom.set(value);this.zoomSaveDelay=0.3;}
    private handleWheel=(event:WheelEvent):void=>{if(event.ctrlKey||this.modalActive||this.loadingPanel?.active||this.pinchIds||event.target!==game.canvas)return;event.preventDefault();this.changeZoom(this.zoom.wheel(event.deltaY));};
    private keyDown(e: EventKeyboard): void {if(this.loadingPanel?.active)return;
        if (e.keyCode === 27) { this.hub?.close();this.chapter?.close();this.dialog.active = false; this.resetInput(); return; }
        if (!this.modalActive) this.keys.add(e.keyCode);
    }
    private keyUp(e: EventKeyboard): void { this.keys.delete(e.keyCode); }
    // Cocos 3.8.8 converts left mouse events to touch events. One shared handler avoids double clicks.
    private touchStart(e: EventTouch): void {if(this.loadingPanel?.active)return;
        const id=e.getID();if(id===null)return;
        const point=e.getUILocation(), start={x:point.x,y:point.y};
        // A modal owns one pointer; a second finger must not replace a drawing stroke or tap a button.
        if(this.modalActive&&this.touches.size){this.touches.set(id,{start,current:start,dragged:false,blocked:true,control:true});return;}
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
    private touchMove(e: EventTouch): void {
        const id=e.getID();if(id===null)return;
        const gesture=this.touches.get(id),p=e.getUILocation();
        if(gesture)gesture.current={x:p.x,y:p.y};
        if(this.pinchIds){const a=this.touches.get(this.pinchIds[0]),b=this.touches.get(this.pinchIds[1]);if(a&&b)this.changeZoom(this.zoom.pinch(Math.hypot(a.current.x-b.current.x,a.current.y-b.current.y)));return;}
        if(gesture&&Math.hypot(p.x-gesture.start.x,p.y-gesture.start.y)>this.tapThreshold())gesture.dragged=true;
        if(this.world&&this.player&&gesture?.dragged&&!gesture.blocked&&!gesture.control&&!gesture.hubDrag&&!this.modalActive&&this.touches.size===1&&id!==this.stickId){const base=gesture.panBase!;this.freeCameraOffset={x:base.x+(p.x-gesture.start.x)/this.worldScale,y:base.y+(p.y-gesture.start.y)/this.worldScale};this.keys.clear();this.player.cancel();this.pendingNpc=false;this.pendingBundle=null;this.chapter?.cancel();this.hub?.cancel();}
        if(gesture?.hubDrag&&gesture.dragged)this.hub?.moveDrag(p);if (id === this.stickId) this.updateStick(e);
    }
    private touchEnd(e: EventTouch): void {if(this.loadingPanel?.active)return;
        const id=e.getID();if(id===null)return;
        const gesture=this.touches.get(id);this.touches.delete(id);
        if(this.pinchIds){this.pinchIds=undefined;this.zoom.endPinch();this.touches.forEach(g=>g.blocked=true);return;}
        if (id === this.stickId) { this.releaseStick(); return; }
        const p=e.getUILocation();
        if(gesture?.hubDrag&&this.hub?.endDrag(p,gesture.dragged))return;
        if(gesture&&!gesture.blocked&&!gesture.dragged&&Math.hypot(p.x-gesture.start.x,p.y-gesture.start.y)<=this.tapThreshold())this.select(p);
    }
    private touchCancel(e: EventTouch): void { const id=e.getID();if(id===null)return;if(this.touches.get(id)?.hubDrag)this.hub?.cancelDrag();this.touches.delete(id);if(this.pinchIds){this.pinchIds=undefined;this.zoom.endPinch();this.touches.forEach(g=>g.blocked=true);} if (id === this.stickId) this.releaseStick(); }
    private releaseStick(): void { this.stickId = null; this.stick = { x: 0, y: 0 }; this.knob.setPosition(0, 0); }
    private resetInput(): void { this.keys.clear(); this.freeCameraOffset=undefined;this.releaseStick();this.pinchIds=undefined;this.zoom.endPinch();this.touches.clear();this.player?.cancel();this.pendingNpc=false;this.pendingBundle=null;this.chapter?.cancel();this.hub?.cancel(); }
    private handleBlur = (): void => { this.resetInput(); };
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
    onDestroy(): void {this.hud?.dispose();this.hub?.dispose();this.chapter?.dispose();this.network.dispose();this.art.dispose(); if (this.root) this.root.destroy();}
}
