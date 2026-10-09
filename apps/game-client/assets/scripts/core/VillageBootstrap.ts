import { _decorator, Color, Component, director, EventKeyboard, EventTouch, game, Game, Graphics, input, Input, JsonAsset, resources, Label, Layers, Node, Sprite, sys, UITransform, Vec3, view } from 'cc';
import { cameraOffset, inputAxis, Point, SIZE, terrain, tileAt, toWorld, VillageMap, villageObjects } from '../world/VillageModel';
import { PlayerController, PlayerVisual } from '../player/PlayerController';
import { FarmerNPC } from '../npc/FarmerNPC';
import { VillageArt } from '../world/VillageArt';
import { LearningProgress, riceBundles } from '../world/LearningProgress';
import { LearningPanel } from '../ui/LearningPanel';
import { VillageNetwork } from '../network/VillageNetwork';
import { ChapterOneSave } from '../world/ChapterOneSave';
import { ChapterOneView } from '../ui/ChapterOneView';
import { CampaignSave } from '../world/CampaignSave';
import { applyChapterText } from '../world/ContentPack';
import { portalDestination } from '../world/WorldZones';
import { VillageHub } from '../ui/VillageHub';
const { ccclass, disallowMultiple, requireComponent } = _decorator;
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
@ccclass('VillageBootstrap')
@disallowMultiple
@requireComponent(UITransform)
export class VillageBootstrap extends Component {
    private map = new VillageMap();
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
    private lastPixelScale = 0;
    private playerVisual?: PlayerVisual;
    private marker?: Node;
    private markerTime = 0;
    private touches = new Map<number, { start: Point; dragged: boolean; blocked: boolean }>();
    private art=new VillageArt();
    private childSprite?:Sprite;
    private spriteTime=0;
    private learning=new LearningProgress();
    private panel?:LearningPanel;
    private bundleNodes:Node[]=[];
    private pendingBundle:number|null=null;
    private network=new VillageNetwork();
    private remoteActors=new Map<string,{node:Node;sprite:Sprite}>();
    private npcHitHeight=85;
    private assetsReady=false;
    private networkStarted=false;
    private networkBadge?:Label;
    private demo=false;
    private chapterSave?:ChapterOneSave;
    private chapter?:ChapterOneView;
    private questButton?:Node;
    private journalButton?:Node;private parentButton?:Node;
    private privateJoin?:{roomCode:string;ticket:string};private profileScope='';private hub?:VillageHub;private homeStyle=-1;private starCount=-1;private treeLights?:Graphics;private qualityStyle='';private avatarStyle=-1;private accessory?:Graphics;
    private get modalActive():boolean{return this.dialog.active||!!this.hub?.node.active;}
    private get objective():string{return this.hub?.objective??this.chapterSave?.progress.description??this.learning.description;}
    onLoad(): void {
        this.demo=sys.isBrowser&&new URLSearchParams(window.location.search).get('demo')==='1';
        if(sys.isBrowser&&!this.demo){const fragment=new URLSearchParams(window.location.hash.slice(1)),ticket=fragment.get('ticket'),roomCode=fragment.get('room');if(ticket&&roomCode&&/^[A-Z0-9]{8}$/.test(roomCode)){try{const payload=JSON.parse(atob(ticket.split('.')[0].replace(/-/g,'+').replace(/_/g,'/')));if(typeof payload.profileId==='string'&&/^[a-f0-9-]{36}$/.test(payload.profileId)){this.profileScope='.'+payload.profileId;this.privateJoin={roomCode,ticket};}}catch{}history.replaceState(null,'',window.location.pathname+window.location.search);}}
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
            this.hub.onPortal=id=>{const p=portalDestination(this.player.position,id);if(p){this.resetInput();this.player.position=p;}};
            this.chapter.onCampaignRequested=()=>this.hub?.open('chapter',1);this.chapter.canRead=()=>!!this.hub?.campaign.data.sound;
            this.journalButton=ui(this.root,'OpenJournal',110,58);const j=this.journalButton.addComponent(Graphics);j.fillColor=new Color(235,235,187);j.roundRect(-55,-29,110,58,10);j.fill();label(this.journalButton,'Sổ làng',105,55,19);
            this.parentButton=ui(this.root,'OpenParent',110,58);const p=this.parentButton.addComponent(Graphics);p.fillColor=new Color(235,235,187);p.roundRect(-55,-29,110,58,10);p.fill();label(this.parentButton,'Người lớn',105,55,19);
            this.journalButton.active=this.parentButton.active=!this.modalActive;
        }
        if(this.chapter){
            this.questButton=ui(this.root,'QuestTarget',240,58);const g=this.questButton.addComponent(Graphics);g.fillColor=new Color(250,231,158);g.roundRect(-120,-29,240,58,12);g.fill();
            label(this.questButton,'Tới mục tiêu',230,55,22);
            this.questButton.active=!this.modalActive;
        }
        void this.loadArt();
    }
    private async loadArt():Promise<void>{
        try{
            await this.art.load();if(!this.isValid)return;const pack=await new Promise<JsonAsset>((resolve,reject)=>resources.load('chapter-pack',JsonAsset,(error,asset)=>error?reject(error):resolve(asset)));if(!applyChapterText(pack.json))console.warn('Invalid chapter text pack: using built-in content');this.chapter?.refreshContent();
            for(let cy=0;cy<SIZE;cy+=8)for(let cx=0;cx<SIZE;cx+=8){const node=this.art.terrainChunk(this.world,cx,cy);if(node){
                const old=this.terrainChunks.find(chunk=>chunk.node.name===`Terrain-${cx}-${cy}`);if(old){old.node.active=false;old.node.destroy();old.node=node;}
                node.setSiblingIndex(0);
            }}
            for(const child of [...this.player.node.children])if(child!==this.arrow)child.destroy();
            this.playerVisual=undefined;this.childSprite=this.art.sprite(this.player.node,'ChildSprite',this.art.child[6],90,110).getComponent(Sprite)!;
            this.childSprite.node.setPosition(0,-7);
            this.farmer.node.getComponent(Graphics)!.clear();this.art.sprite(this.farmer.node,'FarmerSprite',this.art.environment[6],130,145).setPosition(0,-5);
            this.farmer.node.getChildByName('FarmerName')!.setPosition(0,140);this.npcHitHeight=140;
            const elderFrame=this.art.decorations.elder;
            if(this.chapter&&elderFrame){
                const elder=this.chapter.elder;this.art.sprite(elder,'ElderSprite',elderFrame,140*elderFrame.rect.width/elderFrame.rect.height,140).setPosition(0,-5);elder.getComponent(Graphics)!.clear();
            }
            const npcArt=[['co-tam','co-tam','CoTamSprite'],['co-giao-lan','teacher','TeacherSprite'],['ba-ban-hang','market-lady','MarketLadySprite'],['nghe-nhan-gom','potter','PotterSprite'],['ti-na','ti-na','FriendsSprite'],['chi-hang-cuoi','hang-cuoi','FestivalSprite']] as const;
            for(const [id,asset,name] of npcArt){
                const node=this.hub?.npcNodes.find(node=>node.name===id),frame=this.art.decorations[asset];
                if(node&&frame){
                    const width=125*frame.rect.width/frame.rect.height;
                    this.art.sprite(node,name,frame,width,125).setPosition(0,-5);node.getComponent(Graphics)!.clear();
                    node.getComponent(UITransform)!.setContentSize(Math.max(70,width),125);
                }
            }
            const lotus=this.art.decorations.lotus;
            if(lotus)for(const [i,tile] of [{x:26,y:10},{x:29,y:12},{x:31,y:9}].entries()){
                const node=this.art.sprite(this.actors,`PondLotus-${i}`,lotus,100,100),p=toWorld(tile);
                node.getComponent(UITransform)!.setAnchorPoint(0.5,0.5);node.setPosition(p.x,p.y);
            }
            for(const object of villageObjects){const node=this.art.sprite(this.actors,object.id,this.art.environment[object.frame],object.width,object.height);const p=toWorld(object);node.setPosition(p.x,p.y);}
            for(let i=0;this.demo&&i<riceBundles.length;i++){
                const p=toWorld(riceBundles[i]),node=ui(this.actors,`RiceBundle-${i}`,75,95);node.setPosition(p.x,p.y);
                this.art.sprite(node,'Rice',this.art.environment[4],65,75);
                const ring=ui(node,'HarvestRing').addComponent(Graphics);ring.strokeColor=new Color(255,255,180);ring.lineWidth=3;ring.ellipse(0,2,23,12);ring.stroke();
                label(node,'Thu hoạch',100,25,16).setPosition(0,80);node.active=this.learning.data.collected.indexOf(i)<0;this.bundleNodes.push(node);
            }
            this.assetsReady=true;
            if(sys.isBrowser){const requested=new URLSearchParams(window.location.search).get('server');
                if(requested){let endpoint:URL;try{endpoint=new URL(requested);}catch{throw new Error('Địa chỉ server không hợp lệ');}
                    if(['http:','https:','ws:','wss:'].indexOf(endpoint.protocol)<0)throw new Error('Giao thức server không hợp lệ');
                    if(this.demo||this.privateJoin){this.networkStarted=true;
                        if(this.privateJoin&&this.hub&&this.chapterSave){const hub=this.hub,first=this.chapterSave;
                            this.network.onProgress=value=>{const cosmetics={quality:hub.campaign.data.quality,sound:hub.campaign.data.sound,avatar:hub.campaign.data.avatar,home:hub.campaign.data.home};if(!value||!first.progress.restore(JSON.stringify(value.first))||!hub.campaign.restore(JSON.stringify(value.campaign)))return;Object.assign(hub.campaign.data,cosmetics);first.save();this.chapter?.refreshWorld();hub.save.save();hub.applyServerProgress();};
                            this.network.onGame=state=>hub.applyServerGame(state);
                            first.progress.onIntent=v=>this.network.intent('story',v);
                            hub.onChapterIntro=index=>this.network.intent('chapter-intro',{index});hub.onClaim=index=>this.network.intent('claim-star',{index});
                            hub.onLessonAnswer=v=>this.network.intent('lesson-answer',v);hub.onGameStart=questId=>this.network.intent('start-game',{questId});
                            hub.onPortal=id=>{this.network.intent('portal',{id});};hub.onlinePeers=()=>Array.from(this.network.players.entries()).map(([id,p])=>({id,name:p.name}));hub.onOnline=(action,id)=>{if(action==='emote')this.network.emote(id!);else if(action==='block')this.network.block(id!);else if(action==='report')this.network.report(id!,'uncomfortable');else if(action==='offline'){this.network.offline();hub.onPortal=id=>{const p=portalDestination(this.player.position,id);if(p){this.resetInput();this.player.position=p;}};first.progress.onIntent=undefined;hub.onChapterIntro=undefined;hub.onClaim=undefined;hub.onLessonAnswer=undefined;hub.onGameStart=undefined;hub.onGameAction=undefined;hub.onGamePause=undefined;}};
                            hub.onGameAction=(type,index)=>this.network.intent('game-action',{type,index});hub.onGamePause=paused=>this.network.intent('pause-game',{paused});
                        }
                        void this.network.connect(endpoint.href,this.privateJoin);
                    }else this.networkBadge!.string='Mời người lớn mở vé phòng riêng từ trang phụ huynh';
                }
            }
        }catch(error){this.status.string='Không tải được hình ảnh. Prototype vẫn chạy; hãy mở lại project.';console.warn('Village art:',error);}
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
        if (sys.isBrowser){window.addEventListener('blur', this.handleBlur);window.addEventListener('resize',this.handleResize);}
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
        for (const place of [{ text: 'SÂN ĐÌNH', x: 20, y: 23 }, { text: 'AO LÀNG', x: 28, y: 11 }, { text: 'RUỘNG LÚA', x: 9, y: 15 }]) {
            const p = toWorld(place); label(this.world, place.text, 200, 32, 18).setPosition(p.x, p.y);
        }
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
            this.worldScale = sys.isMobile ? uiScale * 0.8 : 1; this.world.setScale(this.worldScale, this.worldScale, 1);
            this.backdrop.clear(); this.backdrop.fillColor = new Color(193, 218, 179);
            this.backdrop.rect(-size.width / 2, -size.height / 2, size.width, size.height); this.backdrop.fill();
            const width = Math.min(840, size.width / uiScale - 24), hint = this.header.getChildByName('Instructions')!;
            hint.getComponent(UITransform)!.setContentSize(width - 20, 90);
            this.header.setScale(uiScale, uiScale, 1); this.header.setPosition(0, size.height / 2 - 60 * uiScale);
            if(this.questButton){const w=sys.isMobile?140:200;this.questButton.setScale(uiScale,uiScale,1);this.questButton.setPosition(0,size.height/2-148*uiScale);this.questButton.getComponent(UITransform)!.setContentSize(w,58);const g=this.questButton.getComponent(Graphics)!;g.clear();g.fillColor=new Color(250,231,158);g.roundRect(-w/2,-29,w,58,12);g.fill();this.questButton.children[0].getComponent(UITransform)!.setContentSize(w-10,55);this.questButton.children[0].getComponent(Label)!.fontSize=sys.isMobile?18:22;}
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
        const keyboard = inputAxis(this.keys);
        this.player.axis = this.modalActive ? { x: 0, y: 0 } : Math.hypot(this.stick.x, this.stick.y) > 0.05 ? this.stick : keyboard;
        if (Math.hypot(this.player.axis.x, this.player.axis.y) > 0.05) {this.pendingNpc = false;this.pendingBundle=null;this.chapter?.cancel();this.hub?.cancel();}
        this.player.step(dt);
        this.chapter?.step();
        this.hub?.step(dt);
        if(this.hub&&this.assetsReady){const home=this.hub.campaign.data.home,house=this.actors.getChildByName('house')?.getComponent(Sprite);if(home!==this.homeStyle&&house){this.homeStyle=home;house.color=[new Color(255,255,255),new Color(175,235,205),new Color(225,190,255),new Color(255,240,150)][home];}
            const stars=this.hub.campaign.stars;if(stars!==this.starCount){this.starCount=stars;if(!this.treeLights){const n=ui(this.actors,'BanyanLights'),p=toWorld({x:8,y:23});n.setPosition(p.x,p.y+180);this.treeLights=n.addComponent(Graphics);}const g=this.treeLights;g.clear();for(let i=0;i<8;i++){g.fillColor=i<stars?new Color(255,228,100):new Color(110,135,100);g.circle(Math.cos(i*Math.PI/4)*60,Math.sin(i*Math.PI/4)*35,7);g.fill();}}}

        if(this.hub&&this.qualityStyle!==this.hub.campaign.data.quality){this.qualityStyle=this.hub.campaign.data.quality;const pipeline=director.root?.pipeline;if(pipeline)pipeline.shadingScale=this.qualityStyle==='low'?0.75:this.qualityStyle==='medium'?0.9:1;}
        if(this.hub&&this.childSprite){const style=this.hub.campaign.data.avatar;if(style!==this.avatarStyle){this.avatarStyle=style;this.childSprite.color=[new Color(255,255,255),new Color(165,220,255),new Color(235,170,250),new Color(255,230,120)][style];if(!this.accessory)this.accessory=ui(this.player.node,'HairAccessory').addComponent(Graphics);this.accessory.clear();if(style>=2){this.accessory.fillColor=new Color(244,113,145);this.accessory.moveTo(5,85);this.accessory.lineTo(20,98);this.accessory.lineTo(20,75);this.accessory.close();this.accessory.fill();this.accessory.moveTo(5,85);this.accessory.lineTo(-10,98);this.accessory.lineTo(-10,75);this.accessory.close();this.accessory.fill();}}}
        this.playerVisual?.step(dt,this.player.moving,this.player.direction);
        if(this.childSprite){this.spriteTime+=dt;const row=this.player.moving?1+(Math.floor(this.spriteTime*8)%2):0;this.childSprite.spriteFrame=this.art.child[row*8+this.player.direction];}
        if(this.networkStarted){
            this.network.update(dt,{...this.player.position,direction:this.player.direction,moving:this.player.moving,name:''});
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
        const cameraWidth = size.width / this.worldScale, cameraHeight = size.height / this.worldScale;
        // Reserve the top HUD area: put the player below center so nearby NPC heads stay visible.
        const hudScale=sys.isMobile?Math.max(1,1/pixelScale):1;
        const focus={x:this.player.position.x,y:this.player.position.y+160*hudScale/this.worldScale};
        const camera = cameraOffset(focus, cameraWidth, cameraHeight); this.world.setPosition(camera.x * this.worldScale, camera.y * this.worldScale);
        for (const chunk of this.terrainChunks) {
            chunk.node.active = Math.abs(chunk.center.x + camera.x) < cameraWidth / 2 + 256
                && Math.abs(chunk.center.y + camera.y) < cameraHeight / 2 + 128;
        }
        if (this.statusRemaining > 0) { this.statusRemaining -= dt; if (this.statusRemaining <= 0) this.status.string = this.objective; }
        else if(this.status.string!==this.objective)this.status.string=this.objective;
        const sorted=[...this.actors.children].sort((a,b)=>b.position.y-a.position.y);
        for(let i=0;i<sorted.length;i++)if(sorted[i].getSiblingIndex()!==i)sorted[i].setSiblingIndex(i);
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
        this.network.players.forEach((p,id)=>{let actor=this.remoteActors.get(id);
            if(!actor){const node=ui(this.actors,`Online-${id}`);node.setPosition(p.x,p.y);const sprite=this.art.sprite(node,'OnlineSprite',this.art.child[6],90,110).getComponent(Sprite)!;sprite.color=new Color(180,215,255);label(node,p.name,160,30,18).setPosition(0,120);actor={node,sprite};this.remoteActors.set(id,actor);}
            const t=Math.min(1,dt*12);actor.node.setPosition(actor.node.position.x+(p.x-actor.node.position.x)*t,actor.node.position.y+(p.y-actor.node.position.y)*t);
            actor.sprite.spriteFrame=this.art.child[(p.moving?1+(Math.floor(this.spriteTime*8)%2):0)*8+p.direction];
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
        for(const [button,mode] of [[this.journalButton,'journal'],[this.parentButton,'gate']] as const)if(button){const local=this.local(p,button);if(Math.abs(local.x)<=55&&Math.abs(local.y)<=29){this.hub?.open(mode);return;}}
        if(this.questButton){const local=this.local(p,this.questButton);if(Math.abs(local.x)<=this.questButton.getComponent(UITransform)!.width/2&&Math.abs(local.y)<=29){
            if(this.chapter?.navigateObjective()){this.keys.clear();this.releaseStick();this.pendingNpc=false;this.pendingBundle=null;}return;
        }}
        if(this.isHeader(p))return;
        const world = this.local(p, this.world), npc = this.farmer.node.position;
        const hubTarget=this.hub?.select(world);if(hubTarget){if(hubTarget==='accepted'){this.chapter?.cancel();this.pendingNpc=false;this.pendingBundle=null;}return;}
        const chapterTarget=this.chapter?.select(world);
        if(chapterTarget){if(chapterTarget==='accepted'){this.hub?.cancel();this.pendingNpc=false;this.pendingBundle=null;}return;}
        if (Math.abs(world.x - npc.x) <= 40 && world.y >= npc.y - 12 && world.y <= npc.y + this.npcHitHeight) {
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
        if(!this.header)return false;
        const local=this.local(p,this.header),width=this.header.getChildByName('Instructions')!.getComponent(UITransform)!.width+20;
        return Math.abs(local.x)<=width/2&&Math.abs(local.y)<=48;
    }
    private tapThreshold():number { return 15*view.getDevicePixelRatio()/view.getScaleX(); }
    private keyDown(e: EventKeyboard): void {
        if (e.keyCode === 27) { this.hub?.close();this.chapter?.close();this.dialog.active = false; this.resetInput(); return; }
        if (!this.modalActive) this.keys.add(e.keyCode);
    }
    private keyUp(e: EventKeyboard): void { this.keys.delete(e.keyCode); }
    // Cocos 3.8.8 converts left mouse events to touch events. One shared handler avoids double clicks.
    private touchStart(e: EventTouch): void {
        const id=e.getID();if(id===null)return;
        const point=e.getUILocation(), start={x:point.x,y:point.y};
        const stickPoint=this.joystick.active?this.local(point,this.joystick):null;
        const onStick=!!stickPoint&&Math.hypot(stickPoint.x,stickPoint.y)<=75;
        this.touches.set(id,{start,dragged:false,blocked:!this.modalActive&&(this.isHeader(point)||onStick)});
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
        if(gesture&&Math.hypot(p.x-gesture.start.x,p.y-gesture.start.y)>this.tapThreshold())gesture.dragged=true;
        if (id === this.stickId) this.updateStick(e);
    }
    private touchEnd(e: EventTouch): void {
        const id=e.getID();if(id===null)return;
        const gesture=this.touches.get(id);this.touches.delete(id);
        if (id === this.stickId) { this.releaseStick(); return; }
        const p=e.getUILocation();
        if(gesture&&!gesture.blocked&&!gesture.dragged&&Math.hypot(p.x-gesture.start.x,p.y-gesture.start.y)<=this.tapThreshold())this.select(p);
    }
    private touchCancel(e: EventTouch): void { const id=e.getID();if(id===null)return;this.touches.delete(id); if (id === this.stickId) this.releaseStick(); }
    private releaseStick(): void { this.stickId = null; this.stick = { x: 0, y: 0 }; this.knob.setPosition(0, 0); }
    private resetInput(): void { this.keys.clear(); this.releaseStick();this.touches.clear();this.player?.cancel();this.pendingNpc=false;this.pendingBundle=null;this.chapter?.cancel();this.hub?.cancel(); }
    private handleBlur = (): void => { this.resetInput(); };
    // Full-screen CSS keeps frame style strings constant; explicitly reapply the
    // public policy so Creator updates its backing canvas after viewport rotation.
    private handleResize = ():void=>{
        const size=view.getDesignResolutionSize();view.setDesignResolutionSize(size.width,size.height,view.getResolutionPolicy());
        const canvas=game.canvas;if(canvas)director.root?.resize(canvas.width,canvas.height);
    };
    onDisable(): void {
        if (this.player) { this.player.cancel(); this.pendingNpc = false; this.resetInput(); }
        input.off(Input.EventType.KEY_DOWN, this.keyDown, this); input.off(Input.EventType.KEY_UP, this.keyUp, this);
        input.off(Input.EventType.TOUCH_START, this.touchStart, this); input.off(Input.EventType.TOUCH_MOVE, this.touchMove, this);
        input.off(Input.EventType.TOUCH_END, this.touchEnd, this); input.off(Input.EventType.TOUCH_CANCEL, this.touchCancel, this);
        game.off(Game.EVENT_HIDE, this.resetInput, this);
        if (sys.isBrowser){window.removeEventListener('blur', this.handleBlur);window.removeEventListener('resize',this.handleResize);}
    }
    onDestroy(): void {this.chapter?.dispose();this.network.dispose();this.art.dispose(); if (this.root) this.root.destroy();}
}
