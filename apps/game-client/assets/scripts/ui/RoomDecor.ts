import {Color,Graphics,Label,Node,UITransform} from 'cc';
import {furniture,LearningUpgrades} from '../world/LearningUpgrades';
import type {VillageArt} from '../world/VillageArt';
/** Painted collectibles load on demand; saved slot IDs and unlock rules stay stable. */
export function paintRoom(parent:Node,data:LearningUpgrades,stars:number,art?:VillageArt):void{
 const root=new Node('PrivateRoom');root.layer=parent.layer;parent.addChild(root);root.addComponent(UITransform).setContentSize(530,190);root.setPosition(0,65);
 const g=root.addComponent(Graphics);g.fillColor=new Color('#f3e2ba');g.roundRect(-265,-95,530,190,12);g.fill();
 if(art)void art.ensureObject('reward.room',-1).then(frame=>{if(!root.isValid||!frame)return;const bg=art.sprite(root,'RoomBackdrop',frame,530,530*frame.rect.height/frame.rect.width);bg.setPosition(0,-88);bg.setSiblingIndex(0);g.clear();});
 ['left','middle','right'].forEach((slot,i)=>{const item=furniture.find(f=>f.id===data.room[slot]&&stars>=f.stars),x=(i-1)*137;if(!item)return;
  const caption=new Node('Furniture-'+slot);caption.layer=root.layer;root.addChild(caption);caption.addComponent(UITransform).setContentSize(140,28);caption.setPosition(x,-76);const plaque=caption.addComponent(Graphics);plaque.fillColor=new Color(90,55,29,230);plaque.roundRect(-65,-12,130,24,5);plaque.fill();const text=new Node('Caption');text.layer=root.layer;caption.addChild(text);text.addComponent(UITransform).setContentSize(128,26);const l=text.addComponent(Label);l.string=item.name;l.fontSize=16;l.color=new Color('#fff0cd');
  const pending=new Node('Loading-'+slot);pending.layer=root.layer;root.addChild(pending);pending.addComponent(UITransform).setContentSize(145,60);pending.setPosition(x,10);const notice=pending.addComponent(Label);notice.string='Đang tải…';notice.fontSize=16;notice.color=new Color('#705332');
  if(art)void art.ensureObject('reward.'+item.id,-1).then(frame=>{if(!root.isValid)return;if(!frame){notice.string='Chưa tải được ảnh';return;}const scale=Math.min(133/frame.rect.width,122/frame.rect.height);const sprite=art.sprite(root,'FurnitureArt-'+slot,frame,frame.rect.width*scale,frame.rect.height*scale);sprite.setPosition(x,-43);pending.destroy();});
 });
}
