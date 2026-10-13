import {Node,UITransform,Graphics,Color,Label} from 'cc';
import {toWorld,landmarkFootprints} from '../world/VillageModel';
import {VillageArt} from '../world/VillageArt';
/** Painted landmarks remain decorative; interaction and navigation use the existing roots. */
export async function createExpansionScenery(actors:Node,world:Node,assets:VillageArt):Promise<void>{
    const make=(name:string,x:number,y:number)=>{const n=new Node('Expansion-'+name);n.layer=actors.layer;actors.addChild(n);n.addComponent(UITransform).setContentSize(260,160);const p=toWorld({x,y});n.setPosition(p.x,p.y);return n;};
    const garden=landmarkFootprints.find(f=>f.id==='expansion.garden')!,school=landmarkFootprints.find(f=>f.id==='expansion.school')!;
    await Promise.all([{id:'garden',name:'Garden',x:garden.x,y:garden.y,width:280},{id:'riverside',name:'RiverDock',x:19,y:40,width:340},{id:'school',name:'SchoolPlay',x:school.x,y:school.y,width:360}].map(async item=>{
        const frame=await assets.ensureObject('expansion.'+item.id,-1);if(!actors.isValid||!frame)return;const root=make(item.name,item.x,item.y);assets.sprite(root,'PaintedLandmark',frame,item.width,item.width*frame.rect.height/frame.rect.width);
    }));
    for(const zone of [{id:'seasons',name:'Vườn bốn mùa',x:43,y:22},{id:'riverside',name:'Bến sông quê',x:22,y:46},{id:'playground',name:'Sân trường tuổi thơ',x:41,y:37}]){
        const n=make('Sign-'+zone.id,zone.x,zone.y);n.setParent(world);const art=n.addComponent(Graphics);art.fillColor=new Color(128,88,49);art.rect(-3,0,6,55);art.fill();art.fillColor=new Color(252,236,192);art.roundRect(-94,46,188,38,7);art.fill();art.strokeColor=new Color(165,121,66);art.lineWidth=2;art.roundRect(-94,46,188,38,7);art.stroke();const label=new Node('ZoneName');label.layer=n.layer;n.addChild(label);label.addComponent(UITransform).setContentSize(178,34);label.setPosition(0,65);const text=label.addComponent(Label);text.string=zone.name;text.fontSize=16;text.lineHeight=21;text.color=new Color(63,82,48);text.overflow=Label.Overflow.SHRINK;
    }
}


