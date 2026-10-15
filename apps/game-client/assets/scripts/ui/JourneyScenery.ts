import {journeyPlacements} from '../world/JourneyPlacements';
import {layoutPlacement,layoutOverrides} from '../world/LayoutOverrides';
import {Node,Graphics,Color,Label,UITransform} from 'cc';
import {toWorld,zoneSpawns} from '../world/VillageModel';
import {journeyRegions} from '../world/LevelJourney';
import {VillageArt} from '../world/VillageArt';

/** Each region owns an original illustration; no cross-region landmark aliases. */
export const journeyScenery=journeyPlacements;

export function createJourneyScenery(world:Node,actors:Node):void{
    for(const item of journeyScenery){
        const n=new Node('JourneyLandmark-'+item.id);n.layer=actors.layer;actors.addChild(n);
        n.addComponent(UITransform).setContentSize(item.width,220);
        const position=toWorld(layoutPlacement({...item,id:'journey.'+item.id}));n.setPosition(position.x,position.y);
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
        const placement=layoutPlacement({...item,id:'journey.'+item.id,height:item.width*frame.rect.height/frame.rect.width});art.sprite(node,'PaintedLandmark',frame,placement.width,placement.height);node.getComponent(UITransform)!.setContentSize(placement.width,placement.height);
    }));
}
