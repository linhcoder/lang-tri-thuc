import {Node,UITransform,Graphics,Color,Label} from 'cc';
import {Point} from '../world/VillageModel';
export class VillageNameplates {
    readonly node:Node;private plates:Array<{actor:Node;source:Label;node:Node;text:Label}>=[];
    constructor(world:Node,actors:Node){
        this.node=new Node('WorldNameplates');this.node.layer=world.layer;world.addChild(this.node);this.node.addComponent(UITransform);
        for(const actor of actors.children){const source=actor.getChildByName('FarmerName')?.getComponent(Label)??actor.getChildByName('Text')?.getComponent(Label);if(!source)continue;
            source.node.active=false;const n=new Node('Nameplate-'+actor.name);n.layer=world.layer;this.node.addChild(n);n.addComponent(UITransform).setContentSize(170,36);
            const g=n.addComponent(Graphics);g.fillColor=new Color(45,70,44,230);g.roundRect(-85,-18,170,36,9);g.fill();
            const t=new Node('Name');t.layer=world.layer;n.addChild(t);t.addComponent(UITransform).setContentSize(164,34);const l=t.addComponent(Label);l.string=source.string;l.fontSize=15;l.lineHeight=17;l.overflow=Label.Overflow.SHRINK;l.color=new Color(255,246,209);this.plates.push({actor,source,node:n,text:l});
        }
    }
    step(player:Point,modal:boolean):void{
        this.node.active=!modal;this.node.setSiblingIndex(this.node.parent!.children.length-1);
        const occupied:Array<{x:number;y:number}>=[];
        this.plates.sort((a,b)=>Math.hypot(a.actor.position.x-player.x,a.actor.position.y-player.y)-Math.hypot(b.actor.position.x-player.x,b.actor.position.y-player.y));
        for(const p of this.plates){const x=p.actor.position.x,y=p.actor.position.y+96;p.node.active=false;
            if(!p.actor.active||Math.hypot(x-player.x,y-96-player.y)>260)continue;
            for(const offset of [0,40,80]){const py=y+offset;if(occupied.some(o=>Math.abs(o.x-x)<176&&Math.abs(o.y-py)<40))continue;p.node.setPosition(x,py);p.node.active=true;p.text.string=p.source.string;occupied.push({x,y:py});break;}
        }
    }
}
