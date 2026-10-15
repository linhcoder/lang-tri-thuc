import {Color,Graphics,Node,UITransform} from 'cc';
import {CampaignEngine} from '../world/CampaignEngine';
import {toWorld} from '../world/VillageModel';
/** Non-blocking rewards appear in the village as learning milestones are earned. */
export class VillageGrowth{
 private root?:Node;private signature='';
 update(parent:Node,engine:CampaignEngine):void{const stage=Math.min(5,Math.floor(engine.data.completed.length/6)+Math.floor(engine.journey.completed.length/20)),key=stage+':'+engine.stars;if(key===this.signature)return;this.signature=key;this.root?.destroy();this.root=new Node('LearningVillageGrowth');this.root.layer=parent.layer;parent.addChild(this.root);
  for(let i=0;i<stage;i++){const n=new Node('RewardGarden-'+i);n.layer=parent.layer;this.root.addChild(n);n.addComponent(UITransform).setContentSize(76,100);const p=toWorld({x:9+i*2,y:35});n.setPosition(p.x,p.y);const g=n.addComponent(Graphics);g.fillColor=new Color('#8e6044');g.roundRect(-5,0,10,48,3);g.fill();g.fillColor=new Color('#589e48');g.circle(0,65,30);g.circle(-20,48,20);g.circle(20,48,20);g.fill();g.fillColor=new Color('#f4d269');for(let j=0;j<Math.min(engine.stars,5);j++){g.circle(-20+j*10,55+(j%2)*15,4);g.fill();}}
 }
}
