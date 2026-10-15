import {Color,Graphics,Label,Node,UITransform} from 'cc';
import {furniture,LearningUpgrades} from '../world/LearningUpgrades';
/** Code-native room furniture with three persistent display slots. */
export function paintRoom(parent:Node,data:LearningUpgrades,stars:number):void{
 const root=new Node('PrivateRoom');root.layer=parent.layer;parent.addChild(root);root.addComponent(UITransform).setContentSize(530,190);root.setPosition(0,80);
 const g=root.addComponent(Graphics);g.fillColor=new Color('#f3e2ba');g.roundRect(-265,-95,530,190,12);g.fill();g.fillColor=new Color('#b78c61');g.rect(-265,-95,530,50);g.fill();
 ['left','middle','right'].forEach((slot,i)=>{const id=data.room[slot],item=furniture.find(f=>f.id===id&&stars>=f.stars),x=(i-1)*165;g.fillColor=new Color('#8c6046');g.roundRect(x-60,-48,120,10,3);g.fill();if(!item)return;g.fillColor=new Color(item.color);
  if(item.id==='plant'){g.roundRect(x-20,-38,40,30,5);g.fill();g.circle(x,16,28);g.circle(x-24,4,18);g.circle(x+24,4,18);g.fill();}
  else if(item.id==='pottery'){g.ellipse(x,-2,25,38);g.fill();g.rect(x-14,24,28,12);g.fill();}
  else if(item.id==='books'){for(let j=0;j<4;j++){g.rect(x-36+j*19,-38,14,65-j*5);g.fill();}}
  else if(item.id==='lantern'){g.ellipse(x,8,27,36);g.fill();g.strokeColor=new Color('#e5b642');g.lineWidth=3;g.moveTo(x,45);g.lineTo(x,66);g.moveTo(x,-28);g.lineTo(x,-40);g.stroke();}
  else{g.moveTo(x-30,35);g.lineTo(x+30,35);g.lineTo(x+17,-4);g.lineTo(x-17,-4);g.close();g.fill();g.rect(x-5,-30,10,27);g.rect(x-23,-38,46,8);g.fill();}
  const caption=new Node('Furniture-'+slot);caption.layer=root.layer;root.addChild(caption);caption.addComponent(UITransform).setContentSize(150,32);caption.setPosition(x,-73);const l=caption.addComponent(Label);l.string=item.name;l.fontSize=18;l.color=new Color('#503d2d');
 });
}
