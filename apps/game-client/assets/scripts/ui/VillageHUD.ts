import {Node,UITransform,Graphics,Color,Label,Sprite,SpriteFrame,Vec3,Texture2D,Rect,resources} from 'cc';
import {Point,SIZE,terrain,toWorld,villageObjects} from '../world/VillageModel';
import {villagePaths} from '../world/GroundPaths';
import {assetResourceKey} from '../world/VisualAssets';
import {worldZones} from '../world/WorldZones';
export interface HudData {stars:number;completed:number;total:number;practice:number;objective:string;avatar?:SpriteFrame;player:Point;}
export class VillageHUD {
    artReady=false;private disposed=false;private paintedFrames:SpriteFrame[]=[];private controlSkinSignature='';
    readonly node:Node;private profile:Node;private summary:Node;private map:Node;private marker:Node;private avatar:Sprite;private info:Label;private stars:Label;private quest:Label;private progress:Graphics;private buttons:Array<{node:Node;action:()=>void}>=[];private signature='';private layout='';
    constructor(parent:Node,open:(mode:'inventory'|'achievements'|'map'|'settings'|'menu')=>void,interact:()=>void){
        this.node=this.make(parent,'VillageHUD',1,1);this.profile=this.panel(this.node,'Profile',218,76);this.info=this.text(this.profile,'Bé học trò',32,18,152,26,17);this.stars=this.text(this.profile,'★ 0',32,-6,152,24,17);
        const a=this.make(this.profile,'Portrait',48,60);a.setPosition(-79,-26);a.getComponent(UITransform)!.setAnchorPoint(.5,0);this.avatar=a.addComponent(Sprite);this.avatar.sizeMode=Sprite.SizeMode.CUSTOM;
        const bar=this.make(this.profile,'Progress',145,10);bar.setPosition(29,-25);this.progress=bar.addComponent(Graphics);
        this.summary=this.panel(this.node,'QuestSummary',350,48);this.quest=this.text(this.summary,'',0,0,336,46,15);
        this.map=this.panel(this.node,'MiniMap',138,100);this.text(this.map,'Bản đồ làng',0,38,130,22,13);
        const ground=this.make(this.map,'MiniMapGround',128,65);ground.setPosition(0,-6);const g=ground.addComponent(Graphics),s=.045;
        const colors={grass:new Color(119,150,71),road:new Color(221,188,130),rice:new Color(195,187,72),pond:new Color(51,148,172),courtyard:new Color(177,115,72)};
        for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){const p=toWorld({x,y}),py=(p.y+640)*s;g.fillColor=colors[terrain(x,y)];g.moveTo(p.x*s-32*s,py);g.lineTo(p.x*s,py+16*s);g.lineTo(p.x*s+32*s,py);g.lineTo(p.x*s,py-16*s);g.close();g.fill();}
        for(const zone of worldZones){const p=toWorld(zone.spawn);g.fillColor=new Color(255,245,190);g.circle(p.x*s,(p.y+640)*s,1.7);g.fill();}
        this.marker=this.make(ground,'PlayerPin',8,8);const pin=this.marker.addComponent(Graphics);pin.fillColor=new Color(255,92,67);pin.circle(0,0,3);pin.fill();
        for(const [id,title,mode] of [['Bag','Túi đồ','inventory'],['Badges','Thành tích','achievements'],['Map','Bản đồ','map'],['Settings','Cài đặt','settings']] as const){const n=this.panel(this.node,'Hud'+id,82,48);this.text(n,title,0,0,78,46,14);this.buttons.push({node:n,action:()=>open(mode)});}
        const action=this.panel(this.node,'HudInteract',110,52);this.text(action,'Tương tác',0,0,106,50,16);this.buttons.push({node:action,action:interact});this.buttons.push({node:this.map,action:()=>open('map')});
        const menu=this.panel(this.node,'HudMenu',110,52);this.text(menu,'Menu',0,0,106,50,17);this.buttons.push({node:menu,action:()=>open('menu')});
        paintVillageMap(g,s);
        void this.loadPaintedArt();
    }
    private loadPaintedArt():Promise<void>{return new Promise(resolve=>resources.load(assetResourceKey('ui.painted-atlas')+'/texture',Texture2D,(error,texture)=>{if(error||this.disposed){resolve();return;}for(let i=0;i<8;i++){const f=new SpriteFrame();f.texture=texture;f.rect=new Rect(i%4*texture.width/4,Math.floor(i/4)*texture.height/2,texture.width/4,texture.height/2);this.paintedFrames.push(f);}for(const [i,cell] of [0,1,2,3,4,2,5].entries()){if(i===5)continue;const button=this.buttons[i].node,l=button.getChildByName('Text')!.getComponent(Label)!;l.node.setPosition(0,-15);l.node.getComponent(UITransform)!.setContentSize(button.getComponent(UITransform)!.width-8,18);l.fontSize=i===4?13:12;const n=this.make(button,'PaintedIcon',29,29);n.setPosition(0,8);const sprite=n.addComponent(Sprite);sprite.sizeMode=Sprite.SizeMode.CUSTOM;sprite.spriteFrame=this.paintedFrames[cell];}const paper=new SpriteFrame();paper.texture=texture;const cw=texture.width/4,ch=texture.height/2;paper.rect=new Rect(3*cw+cw*.035,ch+ch*.2,cw*.93,ch*.66);this.paintedFrames.push(paper);const background=this.make(this.map,'PaintedParchment',138,100);background.setSiblingIndex(0);const ps=background.addComponent(Sprite);ps.sizeMode=Sprite.SizeMode.CUSTOM;ps.spriteFrame=paper;this.skinControls();this.artReady=true;resolve();}));}
    dispose():void{this.disposed=true;this.paintedFrames.forEach(f=>f.destroy());this.paintedFrames=[];}
    skinControls():void{
        const root=this.node.parent;if(!root)return;
        const signature=[this.paintedFrames.length,...['OpenJournal','OpenParent','QuestTarget'].map(id=>root.getChildByName(id)?.getComponent(UITransform)?.width)].join(':');if(signature===this.controlSkinSignature)return;this.controlSkinSignature=signature;
        for(const [id,cell] of [['OpenJournal',5],['OpenParent',3],['QuestTarget',2]] as const){const n=root.getChildByName(id);if(!n)continue;paintHudControl(n);let icon=n.getChildByName('ControlIcon');if(!icon&&this.paintedFrames[cell]){icon=this.make(n,'ControlIcon',28,28);const s=icon.addComponent(Sprite);s.sizeMode=Sprite.SizeMode.CUSTOM;s.spriteFrame=this.paintedFrames[cell];}const w=n.getComponent(UITransform)!.width,l=n.children[0].getComponent(Label)!;if(id==='QuestTarget'){icon?.setPosition(-w/2+23,0);l.node.setPosition(15,0);l.node.getComponent(UITransform)!.setContentSize(w-42,50);l.fontSize=17;}else{icon?.setPosition(0,10);l.node.setPosition(0,-17);l.node.getComponent(UITransform)!.setContentSize(w-8,22);l.fontSize=15;}l.lineHeight=20;}
        for(const id of ['ZoomOut','ZoomReset','ZoomIn']){const n=root.getChildByName(id);if(n)paintHudControl(n);}
    }
    private make(parent:Node,name:string,w:number,h:number):Node{const n=new Node(name);n.layer=parent.layer;parent.addChild(n);n.addComponent(UITransform).setContentSize(w,h);return n;}
    private panel(parent:Node,name:string,w:number,h:number):Node{const n=this.make(parent,name,w,h),g=n.addComponent(Graphics);g.fillColor=new Color(58,43,27,235);g.roundRect(-w/2-2,-h/2-3,w+4,h+5,12);g.fill();g.fillColor=new Color(186,143,64);g.roundRect(-w/2,-h/2,w,h,10);g.fill();g.fillColor=new Color(250,235,191,250);g.roundRect(-w/2+3,-h/2+3,w-6,h-6,8);g.fill();g.strokeColor=new Color(215,178,107);g.lineWidth=1;g.roundRect(-w/2+6,-h/2+6,w-12,h-12,6);g.stroke();return n;}
    private text(parent:Node,value:string,x:number,y:number,w:number,h:number,size:number):Label{const n=this.make(parent,'Text',w,h);n.setPosition(x,y);const l=n.addComponent(Label);l.string=value;l.fontSize=size;l.lineHeight=size+4;l.overflow=Label.Overflow.SHRINK;l.enableWrapText=true;l.color=new Color(52,66,40);return l;}
    resize(width:number,height:number,scale:number):void{
        const w=width/scale,h=height/scale,key=[w,h,scale].join(':');if(key===this.layout)return;this.layout=key;this.node.setScale(scale,scale,1);
        const profileWidth=w<390?w*.51:218,mapWidth=w<390?w*.35:138;
        this.profile.setScale(profileWidth/218,profileWidth/218,1);this.map.setScale(mapWidth/138,mapWidth/138,1);
        this.profile.setPosition(-w/2+10+profileWidth/2,h/2-48);this.map.setPosition(w/2-10-mapWidth/2,h/2-60);
        this.summary.setPosition(0,h/2-(w<600?129:53));this.summary.setScale(w<600?Math.min(.95,(w-20)/350):Math.min(1,(w-410)/350),w<600?.68:1,1);
        const toolbarScale=Math.min(1,(w-24)/352);this.buttons.slice(0,4).forEach((b,i)=>{b.node.active=w>=600;b.node.setScale(toolbarScale,1,1);b.node.setPosition((i-1.5)*90*toolbarScale,-h/2+36);});
        this.buttons[4].node.setPosition(w/2-74,-h/2+55);
        this.buttons[6].node.active=w<600;this.buttons[6].node.setPosition(w/2-74,-h/2+125);
    }
    step(data:HudData,visible:boolean):void{
        this.node.active=visible;if(!visible)return;this.avatar.spriteFrame=data.avatar??null;
        const signature=[data.stars,data.completed,data.total,data.practice,data.objective].join('|');if(signature!==this.signature){this.signature=signature;this.info.string='Bé học trò • Lv '+(1+data.stars);this.stars.string=`★ ${data.stars}/8  •  ${data.completed}/${data.total}`;this.quest.string=`Chính: ${data.objective}\nPhụ: luyện tập ${data.practice}/12 trò chơi`;this.progress.clear();this.progress.fillColor=new Color(186,195,146);this.progress.roundRect(-72.5,-5,145,10,5);this.progress.fill();const ratio=Math.max(0,Math.min(1,data.total?data.completed/data.total:0));if(ratio>0){this.progress.fillColor=new Color(90,171,105);this.progress.roundRect(-72.5,-5,Math.max(10,145*ratio),10,5);this.progress.fill();}}
        this.marker.setPosition(data.player.x*.045,(data.player.y+640)*.045);
    }
    hit(p:Point):boolean{if(!this.node.active)return false;return [...this.buttons.map(b=>b.node),this.profile,this.summary].some(n=>this.inside(p,n));}
    handle(p:Point):boolean{if(!this.hit(p))return false;this.buttons.find(b=>this.inside(p,b.node))?.action();return true;}
    private inside(p:Point,n:Node):boolean{if(!n.activeInHierarchy)return false;const t=n.getComponent(UITransform)!,v=t.convertToNodeSpaceAR(new Vec3(p.x,p.y));return Math.abs(v.x)<=t.width/2&&Math.abs(v.y)<=t.height/2;}
}
/** Same live world geometry in both maps; buildings are symbols, not a screenshot. */
export function paintVillageMap(g:Graphics,s:number,base=false):void{
    if(base)for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){const p=toWorld({x,y}),py=(p.y+640)*s;const colors={grass:new Color(122,159,68),road:new Color(210,176,112),rice:new Color(223,188,65),pond:new Color(63,158,183),courtyard:new Color(177,113,68)};g.fillColor=colors[terrain(x,y)];g.moveTo(p.x*s-32*s,py);g.lineTo(p.x*s,py+16*s);g.lineTo(p.x*s+32*s,py);g.lineTo(p.x*s,py-16*s);g.close();g.fill();}
    const xy=(p:Point)=>{const w=toWorld(p);return{x:w.x*s,y:(w.y+640)*s};};
    g.lineWidth=Math.max(1,48*s);g.strokeColor=new Color(237,207,150);for(const path of villagePaths){const a=xy(path[0]);g.moveTo(a.x,a.y);for(const p of path.slice(1)){const b=xy(p);g.lineTo(b.x,b.y);}g.stroke();}
    for(const o of villageObjects){const p=xy(o);if(o.frame===2||o.frame===3){g.fillColor=new Color(46,102,48);g.circle(p.x,p.y+3*s*32,Math.max(2,o.width*s*.22));g.fill();g.fillColor=new Color(133,170,58);g.circle(p.x-1,p.y+4*s*32,Math.max(1,o.width*s*.15));g.fill();}else{g.fillColor=new Color(106,62,34);g.rect(p.x-60*s,p.y,120*s,60*s);g.fill();g.fillColor=new Color(185,84,46);g.moveTo(p.x-85*s,p.y+60*s);g.lineTo(p.x,p.y+110*s);g.lineTo(p.x+85*s,p.y+60*s);g.close();g.fill();}}
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
