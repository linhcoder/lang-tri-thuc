import {Node,UITransform,Graphics,Color,Label,sys,Sprite} from 'cc';
import {Point} from '../world/VillageModel';
export class VillageNameplates {
    readonly node:Node;private plates:Array<{actor:Node;source:Label;node:Node;text:Label;bubble:Node;width:number}>=[];
    constructor(world:Node,private actors:Node){
        this.node=new Node('WorldNameplates');this.node.layer=world.layer;world.addChild(this.node);this.node.addComponent(UITransform);
        for(const actor of actors.children){const source=actor.getChildByName('FarmerName')?.getComponent(Label)??actor.getChildByName('Text')?.getComponent(Label);if(!source)continue;
            source.node.active=false;const width=Math.max(62,Math.min(132,source.string.length*7+14)),n=new Node('Nameplate-'+actor.name);n.layer=world.layer;this.node.addChild(n);n.addComponent(UITransform).setContentSize(width,25);
            const g=n.addComponent(Graphics);g.fillColor=new Color(24,47,36,205);g.roundRect(-width/2,-12.5,width,25,7);g.fill();g.strokeColor=new Color(239,220,170,180);g.lineWidth=1;g.roundRect(-width/2,-12.5,width,25,7);g.stroke();
            const t=new Node('Name');t.layer=world.layer;n.addChild(t);t.addComponent(UITransform).setContentSize(width-8,23);const l=t.addComponent(Label);l.string=source.string;l.fontSize=13;l.lineHeight=17;l.overflow=Label.Overflow.SHRINK;l.color=new Color(255,246,209);
            const bubble=new Node('Talk-'+actor.name);bubble.layer=world.layer;this.node.addChild(bubble);bubble.addComponent(UITransform).setContentSize(38,30);const bg=bubble.addComponent(Graphics);bg.fillColor=new Color(255,250,225);bg.roundRect(-19,-11,38,24,7);bg.fill();bg.moveTo(-9,-9);bg.lineTo(-9,-19);bg.lineTo(0,-9);bg.close();bg.fill();bg.fillColor=new Color(166,60,69);for(const x of [-9,0,9]){bg.circle(x,1,2.5);bg.fill();}
            this.plates.push({actor,source,node:n,text:l,bubble,width});
        }
    }
    step(player:Point,modal:boolean,bounds?:{left:number;right:number;bottom:number;top:number}):void{
        this.node.active=!modal;this.node.setSiblingIndex(this.node.parent!.children.length-1);
        const occupied:Array<{x:number;y:number;width:number}>=[...this.actors.children,...(this.actors.parent?.children??[])].filter(n=>n.active&&(n.name.startsWith('Scenery-sign-')||n.name.startsWith('Expansion-Sign-'))).map(n=>({x:n.position.x,y:n.position.y+(n.name.startsWith('Expansion-')?65:34),width:n.getComponent(UITransform)!.width}));
        this.plates.sort((a,b)=>Math.hypot(a.actor.position.x-player.x,a.actor.position.y-player.y)-Math.hypot(b.actor.position.x-player.x,b.actor.position.y-player.y));
        for(const p of this.plates){const body=p.actor.children.find(n=>n.getComponent(Sprite)?.spriteFrame),head=body?body.position.y+body.getComponent(UITransform)!.height*body.scale.y:79,x=p.actor.position.x,y=p.actor.position.y+head+17;p.node.active=false;p.bubble.active=false;
            if(!p.actor.active||Math.hypot(x-player.x,p.actor.position.y-player.y)>(sys.isMobile?260:600)||bounds&&(x<bounds.left||x>bounds.right||p.actor.position.y<bounds.bottom||p.actor.position.y>bounds.top))continue;
            for(const offset of [0,36,72]){const py=y+offset;if(occupied.some(o=>Math.abs(o.x-x)<(o.width+p.width)/2+6&&Math.abs(o.y-py)<32))continue;p.node.setPosition(x,py);p.node.active=true;p.text.string=p.source.string;p.bubble.setPosition(x+25,py+32);p.bubble.active=true;occupied.push({x,y:py,width:p.width},{x:x+25,y:py+32,width:38});break;}
        }
    }
    target(point:Point):Point|undefined{if(!this.node.activeInHierarchy)return;const p=this.plates.find(p=>p.bubble.active&&Math.abs(point.x-p.bubble.position.x)<=22&&Math.abs(point.y-p.bubble.position.y)<=20);return p?{x:p.actor.position.x,y:p.actor.position.y+60}:undefined;}
}
