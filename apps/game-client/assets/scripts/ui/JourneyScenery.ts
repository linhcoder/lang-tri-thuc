import {Node,Graphics,Color,Label,UITransform} from 'cc';
import {toWorld,zoneSpawns} from '../world/VillageModel';
import {journeyRegions} from '../world/LevelJourney';
import {VillageArt} from '../world/VillageArt';

/** Each region owns an original illustration; no cross-region landmark aliases. */
export const journeyScenery=[
    {id:'village',x:14,y:20,width:490},
    {id:'school',x:3,y:28,width:300},
    {id:'farm',x:35,y:17,width:320},
    {id:'market',x:23,y:29,width:300},
    {id:'craft',x:8,y:28,width:300},
    {id:'forest',x:53,y:15,width:390},
    {id:'river',x:19,y:40,width:340},
    {id:'science',x:53,y:30,width:330},
    {id:'culture',x:31,y:53,width:370},
    {id:'island',x:53,y:53,width:340},
] as const;

export function createJourneyScenery(world:Node,actors:Node):void{
    for(const item of journeyScenery){
        const n=new Node('JourneyLandmark-'+item.id);n.layer=actors.layer;actors.addChild(n);
        n.addComponent(UITransform).setContentSize(item.width,220);
        const position=toWorld(item);n.setPosition(position.x,position.y);
        if(!['forest','science','culture','island'].includes(item.id))continue;
        const region=journeyRegions.find(r=>r.id===item.id)!;
        const spawn=toWorld(zoneSpawns[region.zone]);
        const sign=new Node('JourneySign-'+item.id);sign.layer=world.layer;world.addChild(sign);
        sign.addComponent(UITransform).setContentSize(280,52);sign.setPosition(spawn.x,spawn.y-35);
        const bg=sign.addComponent(Graphics);bg.fillColor=new Color('#72533b');bg.roundRect(-140,-26,280,52,9);bg.fill();
        const caption=new Node('Text');caption.layer=world.layer;sign.addChild(caption);
        caption.addComponent(UITransform).setContentSize(270,48);
        const label=caption.addComponent(Label);label.string=region.name+' / Lv.'+region.level;
        label.fontSize=19;label.lineHeight=24;label.color=new Color('#fff2ce');
    }
}

export async function decorateJourneyScenery(actors:Node,art:VillageArt):Promise<void>{
    await Promise.all(journeyScenery.map(async item=>{
        const frame=await art.ensureObject('journey.'+item.id,-1);
        if(!actors.isValid||!frame)return;
        const node=actors.getChildByName('JourneyLandmark-'+item.id);
        if(!node||node.getChildByName('PaintedLandmark'))return;
        art.sprite(node,'PaintedLandmark',frame,item.width,item.width*frame.rect.height/frame.rect.width);
    }));
}
