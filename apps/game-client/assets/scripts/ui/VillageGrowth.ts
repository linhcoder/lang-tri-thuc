import {Node,UITransform} from 'cc';
import {CampaignEngine} from '../world/CampaignEngine';
import {toWorld} from '../world/VillageModel';
import type {VillageArt} from '../world/VillageArt';
/** Painted reward trees share actor depth sorting and never add collision geometry. */
export class VillageGrowth{
 private nodes:Node[]=[];private signature='';
 update(parent:Node,engine:CampaignEngine,art:VillageArt):void{
  const stage=Math.min(5,Math.floor(engine.data.completed.length/6)+Math.floor(engine.journey.completed.length/20)),key=stage+':'+engine.stars;if(key===this.signature)return;this.signature=key;this.nodes.forEach(n=>n.destroy());this.nodes=[];
  for(let i=0;i<stage;i++){const n=new Node('RewardGarden-'+i);n.layer=parent.layer;parent.addChild(n);n.addComponent(UITransform).setContentSize(130,140);const p=toWorld({x:9+i*2,y:35});n.setPosition(p.x,p.y);this.nodes.push(n);void art.ensureObject('reward.tree',-1).then(frame=>{if(!n.isValid||!frame)return;const height=116+engine.stars*2,scale=Math.min(140/frame.rect.width,height/frame.rect.height);art.sprite(n,'RewardTreeArt',frame,frame.rect.width*scale,frame.rect.height*scale);});}
 }
}
