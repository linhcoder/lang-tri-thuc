import {Graphics,Node,Sprite,UITransform} from 'cc';
import {enterableHouses} from '../world/HouseInterior';
import {VillageArt} from '../world/VillageArt';
/** Replace only artwork; published layout, footprints and NPC locations stay authoritative. */
export async function decorateHouseExteriors(actors:Node,art:VillageArt):Promise<number>{
 const loaded=await Promise.all(enterableHouses.map(async house=>{
  const frame=await art.ensureObject('house.exterior.'+house.id,-1);if(!actors.isValid||!frame)return false;
  const node=actors.getChildByName(house.node);if(!node)return false;
  const visual=node.getChildByName('PaintedLandmark')??node.getChildByName('RegionalArt')??node;
  const sprite=visual.getComponent(Sprite),bounds=visual.getComponent(UITransform)!,width=bounds.width,height=bounds.height;
  if(sprite)sprite.enabled=false;node.getComponent(Graphics)?.clear();
  const ratio=frame.rect.width/frame.rect.height,fitWidth=Math.min(width,height*ratio),fitHeight=fitWidth/ratio;
  art.sprite(node,'PrivateHouseArt',frame,fitWidth,fitHeight);return true;
 }));return loaded.filter(Boolean).length;
}
