import {journeyPlacements} from '../world/JourneyPlacements';
import {layoutPlacement} from '../world/LayoutOverrides';
import {Node,Graphics,Color,Label,UITransform} from 'cc';
import {toWorld} from '../world/VillageModel';
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
        const spawn=toWorld(layoutPlacement({...item,id:'journey.'+item.id}));
        const sign=new Node('JourneySign-'+item.id);sign.layer=world.layer;world.addChild(sign);
        sign.addComponent(UITransform).setContentSize(240,80);sign.setPosition(spawn.x,spawn.y-44);
        const fallback=new Node('WoodFallback');fallback.layer=world.layer;sign.addChild(fallback);
        const bg=fallback.addComponent(Graphics);bg.fillColor=new Color('#614028');
        bg.rect(-83,0,10,48);bg.rect(73,0,10,48);bg.fill();
        bg.fillColor=new Color('#996638');bg.roundRect(-120,20,240,48,5);bg.fill();
        bg.strokeColor=new Color('#d3a466');bg.lineWidth=2;
        for(const y of [27,59]){bg.moveTo(-112,y);bg.lineTo(112,y);}bg.stroke();
        const caption=new Node('Text');caption.layer=world.layer;sign.addChild(caption);
        caption.setPosition(0,40);caption.addComponent(UITransform).setContentSize(216,34);
        const label=caption.addComponent(Label);label.string=region.name+' / Lv.'+region.level;
        label.fontSize=15;label.lineHeight=20;label.overflow=Label.Overflow.SHRINK;label.enableWrapText=false;label.color=new Color('#fff2ce');
    }
}

export async function decorateJourneyScenery(actors:Node,art:VillageArt,include:(item:typeof journeyScenery[number])=>boolean=()=>true):Promise<void>{
    await Promise.all(journeyScenery.filter(include).map(async item=>{
        const sign=actors.parent?.getChildByName('JourneySign-'+item.id);
        if(sign&&!sign.getChildByName('WoodenSign')){
            const wood=await art.ensureObject('scenery.wood-sign',-1);
            if(sign.isValid&&wood&&!sign.getChildByName('WoodenSign')){
                const painted=art.sprite(sign,'WoodenSign',wood,240,80);painted.setSiblingIndex(0);
                sign.getChildByName('WoodFallback')?.destroy();
            }
        }
        const frame=await art.ensureObject('journey.'+item.id,-1);
        if(!actors.isValid||!frame)return;
        const node=actors.getChildByName('JourneyLandmark-'+item.id);
        if(!node||node.getChildByName('PaintedLandmark')||node.getChildByName('PrivateHouseArt'))return;
        const placement=layoutPlacement({...item,id:'journey.'+item.id,height:item.width*frame.rect.height/frame.rect.width});art.sprite(node,'PaintedLandmark',frame,placement.width,placement.height);node.getComponent(UITransform)!.setContentSize(placement.width,placement.height);
    }));
}
