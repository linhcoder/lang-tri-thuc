import {Node,UITransform,Graphics,Color,Label,Sprite,SpriteFrame,Vec3} from 'cc';
import {Point,SIZE,terrain,toWorld} from '../world/VillageModel';
import {worldZones} from '../world/WorldZones';
export interface HudData {stars:number;completed:number;total:number;practice:number;objective:string;avatar?:SpriteFrame;player:Point;}
export class VillageHUD {
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
    }
    private make(parent:Node,name:string,w:number,h:number):Node{const n=new Node(name);n.layer=parent.layer;parent.addChild(n);n.addComponent(UITransform).setContentSize(w,h);return n;}
    private panel(parent:Node,name:string,w:number,h:number):Node{const n=this.make(parent,name,w,h),g=n.addComponent(Graphics);g.fillColor=new Color(64,85,52,235);g.roundRect(-w/2-2,-h/2-2,w+4,h+4,12);g.fill();g.fillColor=new Color(250,239,197,245);g.roundRect(-w/2,-h/2,w,h,10);g.fill();return n;}
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
