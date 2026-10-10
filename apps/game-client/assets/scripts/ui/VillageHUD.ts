import {Node,UITransform,Graphics,Color,Label,Sprite,SpriteFrame,Vec3,Texture2D,Rect,resources,RichText} from 'cc';
import {Point,SIZE,terrain,toWorld,villageObjects,villageDetails} from '../world/VillageModel';
import {villagePaths} from '../world/GroundPaths';
import {assetResourceKey} from '../world/VisualAssets';
import {assetFrame} from '../world/TextureFrames';
import {worldZones} from '../world/WorldZones';
import {AvatarGesture,avatarGestures} from '../world/AvatarGestures';
export interface HudData {stars:number;completed:number;total:number;practice:number;objective:string;avatar?:SpriteFrame;player:Point;chapterTitle?:string;quests?:Array<{title:string;done:boolean}>;}
export class VillageHUD {
    artReady=false;private disposed=false;private paintedFrames:SpriteFrame[]=[];private controlSkinSignature='';
    readonly node:Node;private title:Node;private profile:Node;private summary:Node;private map:Node;private marker:Node;private avatar:Sprite;private info:Label;private stars:Label;private quest:Label;private progress:Graphics;private buttons:Array<{node:Node;action:()=>void}>=[];private signature='';private layout='';
    private extras:Array<{node:Node;action:()=>void}>=[];private chapterLabel:Label;private portraitSource?:SpriteFrame;private portraitFrame?:SpriteFrame;private mapFrames:SpriteFrame[]=[];private counters:Node[]=[];private learningCounter:Label;
    private level:Label;private richQuests:RichText;
    constructor(parent:Node,open:(mode:'inventory'|'achievements'|'map'|'settings'|'menu'|'journal')=>void,interact:()=>void,gesture:(id:AvatarGesture)=>void=()=>{},move:()=>void=()=>{},navigate:()=>void=()=>{}){
        this.node=this.make(parent,'VillageHUD',1,1);this.profile=this.panel(this.node,'Profile',218,76);this.info=this.text(this.profile,'Bé học trò',32,18,152,26,17);this.stars=this.text(this.profile,'★ 0',32,-6,152,24,17);
        const ring=this.make(this.profile,'PortraitRing',60,60);ring.setPosition(-79,0);const rg=ring.addComponent(Graphics);rg.fillColor=new Color(30,100,138);rg.circle(0,0,29);rg.fill();rg.strokeColor=new Color(255,240,194);rg.lineWidth=2;rg.circle(0,0,29);rg.stroke();
        const a=this.make(ring,'Portrait',49,49);this.avatar=a.addComponent(Sprite);this.avatar.sizeMode=Sprite.SizeMode.CUSTOM;
        const bar=this.make(this.profile,'Progress',145,10);bar.setPosition(29,-25);this.progress=bar.addComponent(Graphics);
        this.level=this.text(this.profile,'Lv.1',-23,-10,42,20,13);this.level.color=new Color(255,223,103);this.level.horizontalAlign=Label.HorizontalAlign.LEFT;
        this.info.isBold=true;this.info.horizontalAlign=Label.HorizontalAlign.LEFT;
        const starCounter=this.panel(this.node,'StarCounter',82,34);this.counters.push(starCounter);const learning=this.panel(this.node,'LearningCounter',96,34);this.counters.push(learning);this.learningCounter=this.text(learning,'0/30',12,0,58,30,15);
        const goldStar=this.make(starCounter,'GoldStar',28,28),starArt=goldStar.addComponent(Graphics);goldStar.setPosition(-23,0);starArt.fillColor=new Color(255,199,60);starArt.strokeColor=new Color(255,234,137);starArt.lineWidth=2;for(let i=0;i<10;i++){const angle=Math.PI/2+i*Math.PI/5,r=i%2?6:13,x=Math.cos(angle)*r,y=Math.sin(angle)*r;if(!i)starArt.moveTo(x,y);else starArt.lineTo(x,y);}starArt.close();starArt.fill();starArt.stroke();
        const book=this.make(learning,'LearningBook',26,26),bookArt=book.addComponent(Graphics);book.setPosition(-30,0);bookArt.fillColor=new Color(239,197,87);bookArt.roundRect(-12,-10,24,20,3);bookArt.fill();bookArt.fillColor=new Color(255,245,196);bookArt.rect(-9,-7,7,15);bookArt.rect(2,-7,7,15);bookArt.fill();bookArt.strokeColor=new Color(152,116,43);bookArt.lineWidth=1;bookArt.moveTo(0,-8);bookArt.lineTo(0,9);bookArt.stroke();
        this.summary=this.panel(this.node,'QuestSummary',238,156);this.quest=this.text(this.summary,'',0,0,218,140,14);this.quest.horizontalAlign=Label.HorizontalAlign.LEFT;
        const questText=this.make(this.summary,'QuestRichText',218,200);this.richQuests=questText.addComponent(RichText);this.richQuests.handleTouchEvent=false;this.richQuests.fontSize=13;this.richQuests.lineHeight=20;this.richQuests.maxWidth=218;this.richQuests.horizontalAlign=Label.HorizontalAlign.LEFT;
        this.title=this.panel(this.node,'VillageTitle',300,54);
        this.text(this.title,'Làng Tri Thức',20,10,238,26,22).color=new Color(76,51,29);
        this.text(this.title,'Nơi tri thức nảy mầm từ những điều bình dị',20,-14,238,18,10).color=new Color(76,51,29);
        const sun=this.make(this.title,'Sun',38,38),sunArt=sun.addComponent(Graphics);sun.setPosition(-121,0);sunArt.fillColor=new Color(255,164,47);sunArt.circle(0,0,11);sunArt.fill();sunArt.strokeColor=new Color(217,119,34);sunArt.lineWidth=2;sunArt.circle(0,0,11);sunArt.stroke();for(let i=0;i<8;i++){const a=i*Math.PI/4;sunArt.moveTo(Math.cos(a)*15,Math.sin(a)*15);sunArt.lineTo(Math.cos(a)*19,Math.sin(a)*19);}sunArt.stroke();
        this.map=this.panel(this.node,'MiniMap',138,100);this.text(this.map,'Bản đồ làng',0,38,130,22,13).color=new Color(76,51,29);
        const ground=this.make(this.map,'MiniMapGround',128,65);ground.setPosition(0,-6);const g=ground.addComponent(Graphics),s=.045;
        const colors={grass:new Color(119,150,71),road:new Color(221,188,130),rice:new Color(195,187,72),pond:new Color(51,148,172),courtyard:new Color(177,115,72)};
        for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){const p=toWorld({x,y}),py=(p.y+640)*s;g.fillColor=colors[terrain(x,y)];g.moveTo(p.x*s-32*s,py);g.lineTo(p.x*s,py+16*s);g.lineTo(p.x*s+32*s,py);g.lineTo(p.x*s,py-16*s);g.close();g.fill();}
        for(const zone of worldZones){const p=toWorld(zone.spawn);g.fillColor=new Color(255,245,190);g.circle(p.x*s,(p.y+640)*s,1.7);g.fill();}
        this.marker=this.make(ground,'PlayerPin',8,8);const pin=this.marker.addComponent(Graphics);pin.fillColor=new Color(255,92,67);pin.circle(0,0,3);pin.fill();
        for(const [id,title,mode] of [['Bag','Túi đồ','inventory'],['Badges','Thành tích','achievements'],['Map','Bản đồ','map'],['Settings','Cài đặt','settings']] as const){const n=this.panel(this.node,'Hud'+id,82,48);this.text(n,title,0,0,78,46,14);this.buttons.push({node:n,action:()=>open(mode)});}
        const action=this.panel(this.node,'HudInteract',110,52);this.text(action,'Tương tác',0,0,106,50,16);this.buttons.push({node:action,action:interact});this.buttons.push({node:this.map,action:()=>open('map')});
        const menu=this.panel(this.node,'HudMenu',110,52);this.text(menu,'Menu',0,0,106,50,17);this.buttons.push({node:menu,action:()=>open('menu')});
        const chapter=this.panel(this.node,'HudChapter',206,32);this.chapterLabel=this.text(chapter,'Chương 1 · Ngày Về Làng  ▾',0,0,194,28,13);this.extras.push({node:chapter,action:()=>open('journal')});
        const dock=this.make(this.node,'EmoteDock',440,64),dg=dock.addComponent(Graphics);dg.fillColor=new Color(24,43,39,225);dg.roundRect(-220,-32,440,64,30);dg.fill();dg.strokeColor=new Color(215,178,107);dg.lineWidth=1;dg.roundRect(-220,-32,440,64,30);dg.stroke();
        for(const {id,title} of avatarGestures){const n=this.make(this.node,'HudGesture-'+id,68,54);this.text(n,title,0,-16,66,22,12);this.gestureIcon(n,id);this.extras.push({node:n,action:()=>gesture(id)});}
        const movement=this.panel(this.node,'HudMove',76,76);this.text(movement,'Di chuyển',0,-19,68,24,13);const shoe=this.make(movement,'ShoeIcon',36,30),sg=shoe.addComponent(Graphics);shoe.setPosition(0,8);sg.fillColor=new Color(250,248,232);sg.moveTo(-17,-8);sg.quadraticCurveTo(-4,-7,4,12);sg.lineTo(13,6);sg.lineTo(17,-5);sg.quadraticCurveTo(4,-16,-15,-13);sg.close();sg.fill();this.extras.push({node:movement,action:move});
        const tip=this.panel(this.node,'MovementTip',206,52);this.text(tip,'☀ Mẹo nhỏ\nChạm đường để đi · WASD để di chuyển',0,0,192,44,12);
        this.extras.push({node:this.summary,action:navigate});
        paintVillageMap(g,s);
        this.loadMapLandmarks(ground,s);
        void this.loadPaintedArt();
    }
    private loadMapLandmarks(ground:Node,s:number):void{
        const landmarks=[...villageObjects.filter(o=>['dinh','house','banyan'].includes(o.id)),...villageDetails.filter(o=>['well','bridge'].includes(o.id)),{id:'scenery.market',x:23,y:29,width:200,height:170}].sort((a,b)=>toWorld(b).y-toWorld(a).y);
        for(const o of landmarks){const n=this.make(ground,'MapArt-'+o.id,o.width*s,o.height*s),p=toWorld(o);n.getComponent(UITransform)!.setAnchorPoint(.5,0);n.setPosition(p.x*s,(p.y+640)*s);const sprite=n.addComponent(Sprite);sprite.sizeMode=Sprite.SizeMode.CUSTOM;
            resources.load(assetResourceKey(o.id)+'/texture',Texture2D,(error,texture)=>{if(error||this.disposed||!n.isValid)return;const f=assetFrame(texture,o.id);this.mapFrames.push(f);sprite.spriteFrame=f;});
        }this.marker.setSiblingIndex(ground.children.length-1);
    }
    private loadPaintedArt():Promise<void>{return new Promise(resolve=>resources.load(assetResourceKey('ui.painted-atlas')+'/texture',Texture2D,(error,texture)=>{if(error||this.disposed){resolve();return;}for(let i=0;i<8;i++){const f=new SpriteFrame();f.texture=texture;f.rect=new Rect(i%4*texture.width/4,Math.floor(i/4)*texture.height/2,texture.width/4,texture.height/2);this.paintedFrames.push(f);}for(const [i,cell] of [0,1,2,3,4,2,5].entries()){if(i===5)continue;const button=this.buttons[i].node,l=button.getChildByName('Text')!.getComponent(Label)!;l.node.setPosition(0,-15);l.node.getComponent(UITransform)!.setContentSize(button.getComponent(UITransform)!.width-8,18);l.fontSize=i===4?13:12;const n=this.make(button,'PaintedIcon',29,29);n.setPosition(0,8);const sprite=n.addComponent(Sprite);sprite.sizeMode=Sprite.SizeMode.CUSTOM;sprite.spriteFrame=this.paintedFrames[cell];}const paper=new SpriteFrame();paper.texture=texture;const cw=texture.width/4,ch=texture.height/2;paper.rect=new Rect(3*cw+cw*.035,ch+ch*.2,cw*.93,ch*.66);this.paintedFrames.push(paper);const background=this.make(this.map,'PaintedParchment',138,100);background.setSiblingIndex(0);background.active=false;const ps=background.addComponent(Sprite);ps.sizeMode=Sprite.SizeMode.CUSTOM;ps.spriteFrame=paper;this.skinControls();this.artReady=true;resolve();}));}
    dispose():void{this.disposed=true;this.portraitFrame?.destroy();this.portraitFrame=undefined;this.portraitSource=undefined;[...this.mapFrames,...this.paintedFrames].forEach(f=>f.destroy());this.paintedFrames=[];this.mapFrames=[];}
    skinControls():void{
        const root=this.node.parent;if(!root)return;
        const signature=[this.paintedFrames.length,...['OpenJournal','OpenParent','QuestTarget','ZoomOut'].map(id=>root.getChildByName(id)?.getComponent(UITransform)?.width)].join(':');if(signature===this.controlSkinSignature)return;this.controlSkinSignature=signature;
        for(const [id,cell] of [['OpenJournal',5],['OpenParent',3],['QuestTarget',2]] as const){const n=root.getChildByName(id);if(!n)continue;paintHudControl(n);let icon=n.getChildByName('ControlIcon');if(!icon&&this.paintedFrames[cell]){icon=this.make(n,'ControlIcon',28,28);const s=icon.addComponent(Sprite);s.sizeMode=Sprite.SizeMode.CUSTOM;s.spriteFrame=this.paintedFrames[cell];}const w=n.getComponent(UITransform)!.width,l=n.children[0].getComponent(Label)!;if(id==='QuestTarget'){icon?.setPosition(-w/2+23,0);l.node.setPosition(15,0);l.node.getComponent(UITransform)!.setContentSize(w-42,n.getComponent(UITransform)!.height-4);l.fontSize=14;}else{icon?.setPosition(0,8);l.node.setPosition(0,-15);l.node.getComponent(UITransform)!.setContentSize(w-8,20);l.fontSize=w<80?11:15;if(w<80){n.getComponent(Graphics)!.clear();l.color=new Color(255,246,219);}}l.lineHeight=20;}
        for(const id of ['ZoomOut','ZoomReset','ZoomIn']){const n=root.getChildByName(id);if(n)paintHudControl(n);}
    }
    private make(parent:Node,name:string,w:number,h:number):Node{const n=new Node(name);n.layer=parent.layer;parent.addChild(n);n.addComponent(UITransform).setContentSize(w,h);return n;}
    private panel(parent:Node,name:string,w:number,h:number):Node{const n=this.make(parent,name,w,h);n.addComponent(Graphics);this.paintPanel(n,w,h);return n;}
    private paintPanel(n:Node,w:number,h:number):void{
        n.getComponent(UITransform)!.setContentSize(w,h);const g=n.getComponent(Graphics)!;g.clear();
        if(['HudBag','HudBadges','HudMap','HudSettings'].includes(n.name))return;
        const paper=n.name==='VillageTitle'||n.name==='MiniMap';
        g.fillColor=paper?new Color(253,235,192,245):new Color(17,33,37,185);g.roundRect(-w/2,-h/2,w,h,12);g.fill();
        g.strokeColor=paper?new Color(174,126,61):new Color(224,234,224,190);g.lineWidth=paper?2:1;g.roundRect(-w/2,-h/2,w,h,12);g.stroke();
    }
    private text(parent:Node,value:string,x:number,y:number,w:number,h:number,size:number):Label{const n=this.make(parent,'Text',w,h);n.setPosition(x,y);const l=n.addComponent(Label);l.string=value;l.fontSize=size;l.lineHeight=size+4;l.overflow=Label.Overflow.SHRINK;l.enableWrapText=true;l.color=new Color(255,246,219);return l;}
    resize(width:number,height:number,scale:number):void{
        const w=width/scale,h=height/scale,key=[w,h,scale].join(':');if(key===this.layout)return;this.layout=key;this.node.setScale(scale,scale,1);
        const profileWidth=w<420?w*.51:248,mapWidth=w<420?w*.35:138;
        this.paintPanel(this.profile,248,64);this.profile.setScale(profileWidth/248,profileWidth/248,1);this.map.setScale(mapWidth/138,mapWidth/138,1);
        this.profile.setPosition(-w/2+10+profileWidth/2,h/2-42);this.map.setPosition(w/2-10-mapWidth/2,h/2-60);
        this.profile.getChildByName('PortraitRing')!.setPosition(-89,0);
        const desktop=w>=900&&h>=600;this.title.active=desktop;this.title.setPosition(w/2-358,h/2-40);
        const counters=desktop&&w>=1000;this.counters.forEach(n=>n.active=counters);this.counters[0].setPosition(-w/2+311,h/2-28);this.counters[1].setPosition(-w/2+412,h/2-28);this.stars.node.setParent(counters?this.counters[0]:this.profile);this.stars.node.setPosition(counters?15:32,counters?0:-5);this.stars.node.getComponent(UITransform)!.setContentSize(counters?48:152,counters?30:20);this.info.node.setPosition(32,17);this.level.node.active=counters;this.profile.getChildByName('Progress')!.setPosition(counters?50:29,-21);this.signature='';
        if(desktop){this.map.setScale(1.3,1.3,1);this.map.setPosition(w/2-100,h/2-75);}
        this.paintPanel(this.summary,desktop?238:350,desktop?216:48);this.quest.node.getComponent(UITransform)!.setContentSize(desktop?218:336,desktop?200:46);this.quest.horizontalAlign=desktop?Label.HorizontalAlign.LEFT:Label.HorizontalAlign.CENTER;this.quest.fontSize=desktop?13:14;this.quest.lineHeight=desktop?21:18;this.signature='';
        this.richQuests.node.active=desktop;this.quest.node.active=!desktop;
        this.summary.setPosition(desktop?-w/2+129:0,desktop?h/2-257:h/2-129);this.summary.setScale(desktop?1:Math.min(.95,(w-20)/350),desktop?1:.68,1);
        const toolbarScale=Math.min(1,(w-24)/352);this.buttons.slice(0,4).forEach((b,i)=>{b.node.active=w>=600;b.node.getComponent(UITransform)!.setContentSize(desktop?72:82,48);b.node.setScale(toolbarScale,1,1);b.node.setPosition(desktop?-w/2+116+[0,2,1,3][i]*78:(i-1.5)*90*toolbarScale,desktop?h/2-106:-h/2+36);});
        this.buttons[4].node.setPosition(w/2-74,-h/2+55);
        this.buttons[6].node.active=!desktop;this.buttons[6].node.setPosition(w>=600?-w/2+225:w/2-74,-h/2+125);
        this.extras.forEach(b=>{if(b.node!==this.summary)b.node.active=desktop;});
        this.extras[0].node.setPosition(w/2-113,h/2-162);
        this.extras.slice(1,7).forEach((b,i)=>b.node.setPosition((i-2.5)*72,-h/2+37));
        const dock=this.node.getChildByName('EmoteDock')!;dock.active=desktop;dock.setPosition(0,-h/2+37);
        const tip=this.node.getChildByName('MovementTip')!;tip.active=desktop;tip.setPosition(-w/2+113,-h/2+37);
        const action=this.buttons[4].node;if(desktop){this.circleControl(action);action.setPosition(w/2-57,-h/2+143);const movement=this.extras[7].node;this.circleControl(movement);movement.setPosition(w/2-57,-h/2+57);}else this.paintPanel(action,110,52);
    }
    private circleControl(n:Node):void{const size=n.name==='HudMove'?92:76,radius=size/2-2;n.getComponent(UITransform)!.setContentSize(size,size);const g=n.getComponent(Graphics)!;g.clear();g.fillColor=new Color(28,48,38,215);g.circle(0,0,radius);g.fill();g.strokeColor=new Color(244,226,169);g.lineWidth=2;g.circle(0,0,radius);g.stroke();}
    private gestureIcon(parent:Node,id:AvatarGesture):void{
        const n=this.make(parent,'GestureIcon',32,32);n.setPosition(0,9);const g=n.addComponent(Graphics);g.fillColor=new Color(255,248,227);g.strokeColor=new Color(255,248,227);g.lineWidth=3;
        if(id==='hello'||id==='happy'||id==='sad'){g.circle(0,0,11);g.fill();g.fillColor=new Color(38,54,45);for(const x of [-4,4]){g.circle(x,3,1.5);g.fill();}g.strokeColor=new Color(38,54,45);g.lineWidth=2;g.moveTo(-5,id==='sad'?-6:-2);g.quadraticCurveTo(0,id==='sad'?1:-10,5,id==='sad'?-6:-2);g.stroke();if(id==='sad'){g.fillColor=new Color(119,208,240);g.ellipse(8,-3,2,4);g.fill();}if(id==='happy'){g.fillColor=new Color(255,212,87);g.circle(12,11,2.5);g.fill();}}
        else if(id==='wave'){g.roundRect(-7,-9,14,16,5);g.fill();for(let i=0;i<4;i++){g.roundRect(-8+i*4,2,3,12-i%2*2,1);g.fill();}g.roundRect(-13,-2,9,4,2);g.fill();}
        else{g.circle(0,10,4);g.fill();g.moveTo(0,4);g.lineTo(0,-4);if(id==='sit'){g.lineTo(9,-4);g.lineTo(9,-12);g.moveTo(-9,-6);g.lineTo(0,-6);g.moveTo(0,1);g.lineTo(9,-1);}else{g.moveTo(-10,8);g.lineTo(0,0);g.lineTo(10,8);g.moveTo(-8,-12);g.lineTo(0,-4);g.lineTo(8,-12);}g.stroke();}
    }
    step(data:HudData,visible:boolean):void{
        this.node.active=visible;if(!visible)return;
        if(data.avatar!==this.portraitSource){this.portraitSource=data.avatar;this.portraitFrame?.destroy();this.portraitFrame=undefined;if(data.avatar){const f=new SpriteFrame(),r=data.avatar.rect;f.texture=data.avatar.texture;f.rect=new Rect(r.x+r.width*.22,r.y+r.height*.01,r.width*.56,r.height*.55);this.portraitFrame=f;}this.avatar.spriteFrame=this.portraitFrame??null;}
        this.chapterLabel.string=(data.chapterTitle??'Chương 1 · Ngày Về Làng')+'  ▾';
        this.learningCounter.string=`${data.completed}/${data.total}`;
        const signature=[data.stars,data.completed,data.total,data.practice,data.objective,JSON.stringify(data.quests)].join('|');if(signature!==this.signature){this.signature=signature;this.info.string='Bé An';this.level.string='Lv.'+(1+data.stars);this.stars.string=this.counters[0].active?`${data.stars}`:`\u2605 ${data.stars}/8  \u2022  ${data.completed}/${data.total}`;this.quest.string=this.title.active?`Nhi\u1ec7m v\u1ee5 ch\u00ednh\n${(data.quests??[]).map(q=>(q.done?'\u2611 ':'\u2610 ')+q.title).join('\n')}\n\nNhi\u1ec7m v\u1ee5 ph\u1ee5\n\u2610 Luy\u1ec7n t\u1eadp ${data.practice}/12 tr\u00f2 ch\u01a1i`:`Ch\u00ednh: ${data.objective}\nPh\u1ee5: luy\u1ec7n t\u1eadp ${data.practice}/12 tr\u00f2 ch\u01a1i`;this.progress.clear();this.progress.fillColor=new Color(186,195,146);this.progress.roundRect(this.counters[0].active?-59:-72.5,-5,this.counters[0].active?118:145,10,5);this.progress.fill();const ratio=Math.max(0,Math.min(1,data.total?data.completed/data.total:0));if(ratio>0){this.progress.fillColor=new Color(90,171,105);this.progress.roundRect(this.counters[0].active?-59:-72.5,-5,Math.max(10,(this.counters[0].active?118:145)*ratio),10,5);this.progress.fill();}}
        const escape=(value:string)=>value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        if(this.richQuests.node.active){const chapter=(data.chapterTitle??'').replace(/^Ch.+? \d+ [\u00b7-] /,'');const rows=(data.quests??[]).map(q=>(q.done?'\u2611 ':'\u2610 ')+escape(q.title)).join('\n');const text='<color=#fff5dc><b>Nhi\u1ec7m v\u1ee5 ch\u00ednh</b></color>\n<color=#ffda71>\u25c6 '+escape(chapter)+'</color>\n<color=#fff5dc>'+rows+'</color>\n\n<color=#ffda71><b>Nhi\u1ec7m v\u1ee5 ph\u1ee5</b></color>\n<color=#fff5dc>\u2610 Luy\u1ec7n t\u1eadp '+data.practice+'/12 tr\u00f2 ch\u01a1i</color>';if(this.richQuests.string!==text)this.richQuests.string=text;}
        this.marker.setPosition(data.player.x*.045,(data.player.y+640)*.045);
    }
    hit(p:Point):boolean{if(!this.node.active)return false;return [...this.buttons.map(b=>b.node),...this.extras.map(b=>b.node),...this.counters,this.profile,this.summary,this.title,this.node.getChildByName('MovementTip')!,this.node.getChildByName('EmoteDock')!].some(n=>this.inside(p,n));}
    handle(p:Point):boolean{if(!this.hit(p))return false;[...this.buttons,...this.extras].find(b=>this.inside(p,b.node))?.action();return true;}
    private inside(p:Point,n:Node):boolean{if(!n.activeInHierarchy)return false;const t=n.getComponent(UITransform)!,v=t.convertToNodeSpaceAR(new Vec3(p.x,p.y));return Math.abs(v.x)<=t.width/2&&Math.abs(v.y)<=t.height/2;}
}
/** Same live world geometry in both maps; buildings are symbols, not a screenshot. */
export function paintVillageMap(g:Graphics,s:number,base=false):void{
    if(base)for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){const p=toWorld({x,y}),py=(p.y+640)*s;const colors={grass:new Color(122,159,68),road:new Color(210,176,112),rice:new Color(223,188,65),pond:new Color(63,158,183),courtyard:new Color(177,113,68)};g.fillColor=colors[terrain(x,y)];g.moveTo(p.x*s-32*s,py);g.lineTo(p.x*s,py+16*s);g.lineTo(p.x*s+32*s,py);g.lineTo(p.x*s,py-16*s);g.close();g.fill();}
    const xy=(p:Point)=>{const w=toWorld(p);return{x:w.x*s,y:(w.y+640)*s};};
    for(let y=2;y<SIZE-2;y+=3)for(let x=2;x<SIZE-2;x+=3){const p=xy({x,y}),type=terrain(x,y);if(type==='rice'){g.strokeColor=new Color(179,142,43);g.lineWidth=Math.max(.5,5*s);g.moveTo(p.x-10*s,p.y);g.lineTo(p.x,p.y+20*s);g.lineTo(p.x+10*s,p.y);g.stroke();}else if(type==='grass'&&(x*7+y*11)%5===0){g.fillColor=new Color(74,125,52);g.circle(p.x,p.y,Math.max(.7,19*s));g.fill();}}
    g.lineWidth=Math.max(1,48*s);g.strokeColor=new Color(237,207,150);for(const path of villagePaths){const a=xy(path[0]);g.moveTo(a.x,a.y);for(const p of path.slice(1)){const b=xy(p);g.lineTo(b.x,b.y);}g.stroke();}
    for(const o of villageObjects){const p=xy(o);if(o.frame===2||o.frame===3){g.fillColor=new Color(46,102,48);g.circle(p.x,p.y+3*s*32,Math.max(2,o.width*s*.22));g.fill();g.fillColor=new Color(133,170,58);g.circle(p.x-1,p.y+4*s*32,Math.max(1,o.width*s*.15));g.fill();}else{g.fillColor=new Color(106,62,34);g.rect(p.x-60*s,p.y,120*s,60*s);g.fill();g.fillColor=new Color(185,84,46);g.moveTo(p.x-85*s,p.y+60*s);g.lineTo(p.x,p.y+110*s);g.lineTo(p.x+85*s,p.y+60*s);g.close();g.fill();}}
    for(const o of villageDetails){const p=xy(o);g.fillColor=o.id==='bridge'?new Color(224,188,111):new Color(246,227,176);if(o.id==='bridge'){g.rect(p.x-80*s,p.y-12*s,160*s,24*s);g.fill();}else if(o.id==='well'){g.circle(p.x,p.y,Math.max(1.2,25*s));g.fill();g.fillColor=new Color(45,118,137);g.circle(p.x,p.y,Math.max(.6,13*s));g.fill();}}
    for(const z of worldZones){const p=xy(z.spawn);g.fillColor=new Color(255,249,207);g.circle(p.x,p.y,Math.max(1.5,12*s));g.fill();}
}
/** Keep the existing input rectangle and node IDs while repainting their skin. */
export function paintHudControl(n:Node):void{
    const t=n.getComponent(UITransform)!,w=t.width,h=t.height,g=n.getComponent(Graphics)!;g.clear();
    g.fillColor=new Color(77,48,25,230);g.roundRect(-w/2,-h/2-2,w,h+2,11);g.fill();
    g.fillColor=new Color(183,132,55);g.roundRect(-w/2,-h/2,w,h,10);g.fill();
    const reset=n.name==='ZoomReset';g.fillColor=reset?new Color(61,87,55):new Color(251,235,189);g.roundRect(-w/2+3,-h/2+3,w-6,h-6,8);g.fill();
    g.strokeColor=new Color(231,195,123);g.lineWidth=1;g.roundRect(-w/2+6,-h/2+6,w-12,h-12,6);g.stroke();
    const l=n.children[0]?.getComponent(Label);if(l)l.color=reset?new Color(255,245,210):new Color(66,65,38);
}
