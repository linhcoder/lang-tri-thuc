import {Color,Graphics,Label,Node,Sprite,UITransform,Vec3,sys,view} from 'cc';
import {PlayerController} from '../player/PlayerController';
import {Point,inputAxis,tileAt,toWorld} from '../world/VillageModel';
import {houseObjects,InteriorMap,restoreHomeStep,enterableHouses,EnterableHouse} from '../world/HouseInterior';
import {HouseAge,HouseId,houseChallenge,houseRewardIds} from '../world/HouseTasks';
import {restoreUpgrades,recordLearning,furniture,furnitureUnlocked} from '../world/LearningUpgrades';
import {VillageHub} from './VillageHub';
import {VillageArt} from '../world/VillageArt';
import {paintHouseItem,paintHouseRoom,paintStation} from './HouseArt';
import {HouseTaskView} from './HouseTaskView';
import {PotteryWorkshopView} from './PotteryWorkshopView';
import {InteriorFurniture} from './InteriorFurniture';
import {hudLayout,readSafeInsets} from './ResponsiveHudLayout';
import {requestHouseReward} from './HouseRewardRequest';
export interface HouseRewardService {load():Promise<string[]>;claim(id:HouseId,age:HouseAge,answers:number[]):Promise<string[]>}

/** Interior coordinates never replace the outdoor multiplayer position. */
export class HouseInteriorView {
 private house:EnterableHouse=enterableHouses[0];readonly node:Node;private board:Node;private player:PlayerController;private sprite:Sprite;
 private title:Label;private objective:Label;private instructions:Label;private rewardNotice:Label;private replayLabel:Label;readonly task:HouseTaskView;
 private carried:Node;private pending?:string;private keys=new Set<number>();private axis:Point={x:0,y:0};private stickHeld=false;private pointerStart?:Point;private time=0;private stamp='';
 private rewardBusy=false;private rewardMessage='';private decorStamp='';
 private furnitureArt=new InteriorFurniture();
 private layoutStamp='';private safeInsets=readSafeInsets();
 readonly studio:PotteryWorkshopView;
 constructor(parent:Node,private hub:VillageHub,private art:VillageArt,private exit:()=>void,private service?:HouseRewardService){
  this.node=this.make(parent,'HouseInterior',960,640);this.node.active=false;this.box(this.node,0,0,960,640,'#364d42');
  this.make(this.node,'InteriorHeader',1,1).addComponent(Graphics);
  this.title=this.text(this.node,'Nhà của bé',0,283,27,850,50);this.objective=this.text(this.node,'',0,233,21,900,60);
  this.board=this.make(this.node,'InteriorFloor',800,440);this.board.setPosition(-35,120);this.board.setScale(.96,.96,1);this.board.addComponent(Graphics);this.board.setSiblingIndex(0);
  for(const o of houseObjects()){const n=this.make(this.board,'HomeObject-'+o.id,110,100);n.addComponent(Graphics);this.text(n,o.name,0,65,16,135,44);const art=this.make(n,'PaintedFurniture',112,112);art.setPosition(0,12);art.addComponent(Sprite).sizeMode=Sprite.SizeMode.CUSTOM;this.make(n,'TaskItemOverlay',90,80).addComponent(Graphics);}
  const door=toWorld({x:6,y:8});this.text(this.board,'↓ Ra sân',door.x,door.y-8,18,130,40);
  const actor=this.make(this.board,'InteriorPlayer',70,90);this.player=actor.addComponent(PlayerController);this.player.map=new InteriorMap();
  const body=this.make(actor,'InteriorAvatar',70,90);body.setPosition(0,33);this.sprite=body.addComponent(Sprite);this.sprite.sizeMode=Sprite.SizeMode.CUSTOM;
  this.carried=this.make(actor,'CarriedHouseItem',50,50);this.carried.setPosition(23,36);this.carried.addComponent(Graphics);
  const reward=this.make(this.node,'HouseReward',120,140);reward.setPosition(360,100);reward.addComponent(Graphics);this.rewardNotice=this.text(reward,'',0,-78,17,190,70);
  this.control('HouseExit','Ra sân',365,-270,180,58,'#a86f49',22);
  this.control('HouseDecorate','Trang trí nhà bé',95,-270,275,58,'#62865d',21);
  const stick=this.make(this.node,'HouseStick',140,140),ring=stick.addComponent(Graphics);ring.fillColor=new Color(255,255,255,100);ring.circle(0,0,65);ring.fill();const knob=this.make(stick,'Knob',50,50),kg=knob.addComponent(Graphics);kg.fillColor=new Color(70,100,80,170);kg.circle(0,0,25);kg.fill();
  const action=this.control('HouseInteract','Tương tác',0,0,76,76,'#a86f49',16).node.parent!,ag=action.getComponent(Graphics)!;ag.clear();ag.fillColor=new Color(28,48,38,215);ag.circle(0,0,36);ag.fill();ag.strokeColor=new Color(244,226,169);ag.lineWidth=2;ag.circle(0,0,36);ag.stroke();
  this.replayLabel=this.control('HouseReplay','',325,-170,240,55,'#806c49',20);
  this.instructions=this.text(this.node,'Chạm sàn để đi • Chạm đồ vật để làm bài\nWASD / mũi tên • E: đến mục tiêu',-10,-170,17,550,65);
  const studioButton=this.control('PotteryStudio','Nặn gốm tự do',350,-65,210,52,'#a77a58',20);studioButton.node.parent!.active=false;
  this.task=new HouseTaskView(this.node);this.studio=new PotteryWorkshopView(this.node,draft=>{const data=this.hub.campaign.data.upgrades??=restoreUpgrades(null);data.potteryDraft=draft;this.save();});void this.refreshRewards();
 }
 private make(parent:Node,name:string,w:number,h:number):Node{const n=new Node(name);n.layer=parent.layer;parent.addChild(n);n.addComponent(UITransform).setContentSize(w,h);return n;}
 private box(n:Node,x:number,y:number,w:number,h:number,c:string):void{const g=n.getComponent(Graphics)??n.addComponent(Graphics);g.fillColor=new Color(c);g.roundRect(x-w/2,y-h/2,w,h,10);g.fill();}
 private control(name:string,s:string,x:number,y:number,w:number,h:number,c:string,size:number):Label{const n=this.make(this.node,name,w,h);n.setPosition(x,y);this.box(n,0,0,w,h,c);return this.text(n,s,0,0,size,w-10,h-4);}
 private text(n:Node,s:string,x:number,y:number,size:number,w:number,h:number):Label{const node=this.make(n,'Text',w,h);node.setPosition(x,y);const l=node.addComponent(Label);l.string=s;l.fontSize=size;l.lineHeight=size+5;l.color=new Color('#fff1d3');l.cacheMode=Label.CacheMode.CHAR;l.overflow=Label.Overflow.SHRINK;node.getComponent(UITransform)!.setContentSize(w,h);return l;}
 private get age():HouseAge{return this.hub.campaign.data.age;}
 private get run(){return this.hub.campaign.data.upgrades?.houseRuns?.[this.house.id];}
 private get step():number{const run=this.run;if(run&&run.age===this.age)return run.answers.length;const data=this.hub.campaign.data.upgrades;return Math.max(restoreHomeStep(data?.houseSteps?.[this.house.id]),this.house.id==='home'?restoreHomeStep(data?.homeStep):0);}
 private save():void{this.hub.onActivitySave?.();this.hub.save.save();}
 open(house:EnterableHouse=enterableHouses[0]):void{
  void this.furnitureArt.load().then(()=>{if(this.node.isValid)this.stamp='';});
  this.stop();this.task.close();this.studio.close();this.house=house;this.node.active=true;this.node.setSiblingIndex(this.node.parent!.children.length-1);this.player.map=new InteriorMap(house.id);this.player.position=toWorld({x:6,y:7});this.player.node.setPosition(this.player.position.x,this.player.position.y);this.node.getChildByName('PotteryStudio')!.active=house.id==='pottery';
  if(this.step<5){this.ensureRun();this.save();}
  for(const [i,o]of houseObjects(house.id).entries()){const n=this.board.getChildByName('HomeObject-'+o.id)!,p=toWorld(o);n.setPosition(p.x,p.y);n.children[0].getComponent(Label)!.string=house.objects[i];}
  paintHouseRoom(this.board.getComponent(Graphics)!,house.id,house.wall);this.rewardMessage='';this.stamp='';this.layoutStamp='';this.decorStamp='';this.showDecor();let viewport=this.node.parent;while(viewport&&(viewport.getComponent(UITransform)?.width??0)<100)viewport=viewport.parent;const size=viewport?.getComponent(UITransform);if(size)this.layout(size.width,size.height);void this.refreshRewards();
 }
 private ensureRun():void{const data=this.hub.campaign.data.upgrades??=restoreUpgrades(null);if(!this.run||this.run.age!==this.age)(data.houseRuns??={})[this.house.id]={age:this.age,answers:[],updated:Date.now()};}
 restart():void{this.stop();this.task.close();const data=this.hub.campaign.data.upgrades??=restoreUpgrades(null);(data.houseRuns??={})[this.house.id]={age:this.age,answers:[],updated:Math.max(Date.now(),(this.run?.updated??0)+1)};this.rewardMessage='Lượt luyện mới đã sẵn sàng.';this.stamp='';this.save();}
 async refreshRewards():Promise<void>{try{if(this.service){const received=await this.service.load();this.hub.houseRewards=Array.from(new Set([...this.hub.houseRewards,...received]));}}catch{/* Local play remains available; no unverified reward is unlocked. */}}
 async claimReward():Promise<void>{if(this.rewardBusy)return;const run=this.run;if(!run||run.age!==this.age||run.answers.length!==5){this.rewardMessage='Chọn Chơi lại để hoàn thành bài mới và nhận quà.';return;}if(!this.service){this.rewardMessage='Bài đã lưu. Kết nối tài khoản để nhận quà.';return;}
  this.rewardBusy=true;const id=this.house.id,age=run.age,answers=[...run.answers];this.rewardMessage='Đang kiểm tra phần thưởng…';
  try{const received=await requestHouseReward(()=>this.service!.claim(id,age,answers),()=>{if(this.house.id===id)this.rewardMessage='Kết nối chậm. Đang thử nhận quà lại…';});this.hub.houseRewards=Array.from(new Set([...this.hub.houseRewards,...received]));if(this.house.id===id)this.rewardMessage='Đã mở đồ trang trí! Xem trong Trang trí nhà bé.';}catch(error){if(this.house.id===id){const status=(error as {status?:number}).status;this.rewardMessage=status===422?'Nhóm tuổi của hồ sơ đã đổi. Tải lại và chơi bài theo tuổi mới nhé!':status===429?'Máy chủ đang bận. Bài đã lưu; đợi một chút rồi chạm Nhận quà.':'Chưa kết nối được. Bài đã lưu; chạm Nhận quà để thử lại.';}}finally{this.rewardBusy=false;this.decorStamp='';}
 }
 private showDecor():void{this.board.children.filter(n=>n.name.startsWith('HomeDecor-')).forEach(n=>n.destroy());if(this.house.id!=='home')return;['left','middle','right'].forEach((slot,i)=>{const item=furniture.find(f=>f.id===this.hub.campaign.data.upgrades?.room[slot]&&furnitureUnlocked(f,this.hub.campaign.stars,this.hub.houseRewards,this.hub.campaign.level));if(!item)return;const holder=this.make(this.board,'HomeDecor-'+slot,60,80),p=toWorld({x:2+i*3,y:1});holder.setPosition(p.x,p.y+10);if(item.level){paintHouseItem(holder.addComponent(Graphics),item.id,50);return;}if(item.reward){paintHouseItem(holder.addComponent(Graphics),item.id,50);return;}void this.art.ensureObject('reward.'+item.id,-1).then(frame=>{if(holder.isValid&&frame)this.art.sprite(holder,'Collectible',frame,50,50*frame.rect.height/frame.rect.width);});});}
 close():void{this.stop();this.task.close();this.studio.close();this.node.active=false;this.exit();}
 stop():void{this.keys.clear();this.release();this.pointerStart=undefined;this.pending=undefined;this.player.cancel();this.task?.cancelDrag();this.studio?.pause();}
 key(code:number,down:boolean):void{if(!down){this.keys.delete(code);return;}if(this.studio.node.active){if(code===27)this.studio.close();return;}if(this.task.node.active){if(code===27)this.task.close();else if(code>=49&&code<=51)this.task.choose(code-49);return;}if(code===27){this.close();return;}if(code===69){const id=this.house.actions[this.step];this.stop();if(id)this.target(id);return;}this.keys.add(code);}
 private local(p:Point,n=this.node):Vec3{return n.getComponent(UITransform)!.convertToNodeSpaceAR(new Vec3(p.x,p.y,0));}
 beginPointer(p:Point):void{this.pointerStart={...p};if(this.studio.node.active){this.studio.begin(p);return;}if(this.task.node.active){this.task.begin(p);return;}this.stick(p,true);}
 movePointer(p:Point):void{if(this.studio.node.active){this.studio.move(p);return;}if(this.task.node.active)this.task.move(p);else this.stick(p);}
 endPointer(p:Point):void{if(this.studio.node.active){if(this.inside(p,'HouseExit'))this.close();else this.studio.end(p);this.pointerStart=undefined;return;}if(this.task.node.active){if(this.inside(p,'HouseExit')){this.close();return;}this.task.end(p);this.pointerStart=undefined;return;}const held=this.stickHeld,start=this.pointerStart;this.release();this.pointerStart=undefined;if(!held&&start&&Math.hypot(p.x-start.x,p.y-start.y)<18*this.node.getChildByName('HouseExit')!.scale.x)this.handle(p);}
 cancelPointer():void{this.release();this.pointerStart=undefined;this.task.cancelDrag();this.studio.pause();}
 stick(p:Point,start=false):boolean{const node=this.node.getChildByName('HouseStick')!,q=this.local(p,node);if(start)this.stickHeld=Math.hypot(q.x,q.y)<70;if(!this.stickHeld)return false;const length=Math.max(45,Math.hypot(q.x,q.y));this.axis=Math.hypot(q.x,q.y)<7?{x:0,y:0}:{x:q.x/length,y:q.y/length};node.getChildByName('Knob')!.setPosition(this.axis.x*45,this.axis.y*45);this.pending=undefined;return true;}
 release():void{this.axis={x:0,y:0};this.stickHeld=false;this.node.getChildByName('HouseStick')?.getChildByName('Knob')?.setPosition(0,0);}
 private inside(p:Point,name:string):boolean{const node=this.node.getChildByName(name);if(!node?.activeInHierarchy)return false;const q=this.local(p,node),size=node.getComponent(UITransform)!;return Math.abs(q.x)<=size.width/2&&Math.abs(q.y)<=size.height/2;}
 secondaryPointer(p:Point):void{if(!this.task.node.active&&!this.studio.node.active&&(this.inside(p,'HouseInteract')||this.inside(p,'HouseExit')))this.handle(p);}
 handle(p:Point):void{
  if(this.inside(p,'HouseExit')){this.close();return;}if(this.studio.node.active){this.studio.handle(p);return;}if(this.task.node.active){this.task.handle(p);return;}if(this.house.id==='pottery'&&this.inside(p,'PotteryStudio')){this.stop();this.studio.open(this.hub.campaign.data.upgrades?.potteryDraft);return;}if(this.inside(p,'HouseDecorate')){this.stop();this.hub.open('room');return;}
  if(this.inside(p,'HouseReplay')&&this.step===5){if(this.run?.answers.length===5&&!this.hub.houseRewards.includes(houseRewardIds[this.house.id]))void this.claimReward();else this.restart();return;}
  if(this.inside(p,'HouseInteract')){const id=this.house.actions[this.step];this.stop();if(id)this.target(id);return;}
  if(this.inside(p,'HouseStick'))return;const world=this.local(p,this.board),objects=houseObjects(this.house.id);const object=objects.find(o=>{const a=toWorld(o);return Math.abs(a.x-world.x)<50&&world.y>a.y-17&&world.y<a.y+80;});if(object){this.target(object.id);return;}this.pending=undefined;const tile=tileAt(world);if(tile.x===6&&tile.y===8){this.target('exit');return;}this.player.goTo(tile);
 }
 private target(id:string):void{if(this.task.node.active)return;const o=id==='exit'?{x:6,y:9}:houseObjects(this.house.id).find(o=>o.id===id);if(!o)return;const start=tileAt(this.player.position),goals=[{x:o.x+1,y:o.y},{x:o.x-1,y:o.y},{x:o.x,y:o.y+1},{x:o.x,y:o.y-1}].filter(p=>this.player.map.walkable(p.x,p.y));goals.sort((a,b)=>Math.hypot(a.x-start.x,a.y-start.y)-Math.hypot(b.x-start.x,b.y-start.y));for(const goal of goals)if(this.player.goTo(goal)){this.pending=id;break;}}
 private interact(id:string):void{
  if(id==='exit'){this.close();return;}if(this.step===5){this.rewardMessage='Bé đã hoàn thành. Chọn Chơi lại để luyện thêm nhé!';return;}if(id!==this.house.actions[this.step]){this.rewardMessage='Hãy đến đồ vật có viền vàng trước nhé!';return;}
  this.ensureRun();const step=this.step,house=this.house.id,age=this.age;this.stop();this.task.open(houseChallenge(house,step,age),this.hub.campaign.data.sound,index=>{
   if(this.house.id!==house||this.age!==age||this.step!==step)return;const run=this.run!;run.answers.push(index);run.updated=Math.max(Date.now(),run.updated+1);const data=this.hub.campaign.data.upgrades!;(data.houseSteps??={})[house]=Math.max(data.houseSteps?.[house]??0,run.answers.length);if(house==='home')data.homeStep=Math.max(data.homeStep??0,run.answers.length);
   recordLearning(this.hub.campaign.data,house==='tam'?'math':house==='books'?'language':house==='pottery'?'clay':'sorting',true,'house.'+house+'.'+step);this.rewardMessage='Đúng rồi!';this.save();if(run.answers.length===5){recordLearning(this.hub.campaign.data,'sorting',true,'house.'+house,'complete');this.save();void this.claimReward();}
  },()=>{recordLearning(this.hub.campaign.data,house==='tam'?'math':house==='books'?'language':house==='pottery'?'clay':'sorting',false,'house.'+house+'.'+step);this.save();});
 }
 private layout(w:number,h:number):void{
  const pixelScale=view.getScaleX()/view.getDevicePixelRatio(),compact=sys.isMobile||w<900||h<600,s=compact?Math.max(1,1/pixelScale):1,key=[w,h,s,this.house.id].join(':');if(key===this.layoutStamp)return;this.layoutStamp=key;
  this.safeInsets=readSafeInsets();const width=w/s,height=h/s,l=hudLayout(width,height,this.safeInsets);this.node.setScale(1,1,1);this.node.getComponent(UITransform)!.setContentSize(w,h);
  const background=this.node.getComponent(Graphics)!;background.clear();background.fillColor=new Color(this.house.id==='books'?'#b9c7b6':this.house.id==='farm'?'#c5c5a0':'#d8c4a3');background.rect(-w/2,-h/2,w,h);background.fill();
  background.fillColor=new Color('#f8ebd324');background.rect(-w/2,0,w,h/2);background.fill();
  const header=this.node.getChildByName('InteriorHeader')!.getComponent(Graphics)!;header.clear();header.fillColor=new Color('#3d4a3be8');header.roundRect((l.left-2)*s,(l.top-69)*s,(l.right-l.left+4)*s,72*s,12*s);header.fill();
  const place=(name:string,x:number,y:number,width?:number,height?:number)=>{const n=this.node.getChildByName(name)!;n.setScale(s,s,1);n.setPosition(x*s,y*s);if(width!==undefined){n.getComponent(UITransform)!.setContentSize(width,height!);const g=n.getComponent(Graphics);if(g){g.clear();this.box(n,0,0,width,height!,'#72563e');}const text=n.getChildByName('Text');if(text)text.getComponent(UITransform)!.setContentSize(width-8,height!-4);}return n;};
  const textWidth=Math.max(160,width-180);this.title.node.setScale(s,s,1);this.title.node.setPosition((l.left+textWidth/2+12)*s,(l.top-17)*s);this.title.node.getComponent(UITransform)!.setContentSize(textWidth,30);this.title.fontSize=l.short?19:23;this.title.horizontalAlign=Label.HorizontalAlign.LEFT;
  this.objective.node.setScale(s,s,1);this.objective.node.setPosition((l.left+textWidth/2+12)*s,(l.top-47)*s);this.objective.node.getComponent(UITransform)!.setContentSize(textWidth,28);this.objective.fontSize=l.short?14:17;this.objective.horizontalAlign=Label.HorizontalAlign.LEFT;
  place('HouseExit',l.right-54,l.top-23,108,44);place('HouseReplay',l.right-65,l.top-99,130,44);
  const decor=place('HouseDecorate',-78,l.bottom+28,132,44);decor.getChildByName('Text')!.getComponent(Label)!.string='Trang trí';
  place('PotteryStudio',80,l.bottom+28,158,44);
  const action=place('HouseInteract',l.actionX,l.actionY);action.setScale(.84*s,.84*s,1);
  const stick=place('HouseStick',compact?l.left+83:l.right-158,l.bottom+(compact?83:63));if(!compact)stick.setScale(.65*s,.65*s,1);
  const roomScale=Math.max((w-24*s)/600,(h-76*s)/380);this.board.setScale(roomScale,roomScale,1);this.board.setPosition(-32*roomScale,126*roomScale);
  for(const node of this.board.children){const label=node.getComponent(Label)??node.children[0]?.getComponent(Label);if(label){label.node.setScale(s/roomScale,s/roomScale,1);label.color=new Color('#654c36');}}
  const dialogScale=Math.min((w-24*s)/900,(h-90*s)/560);this.task.node.setScale(dialogScale,dialogScale,1);this.studio.node.setScale(dialogScale,dialogScale,1);this.studio.node.setPosition(0,0);
  const reward=place('HouseReward',l.right-220,l.top-103);reward.setScale(.5*s,.5*s,1);this.rewardNotice.fontSize=24;this.rewardNotice.color=new Color('#654c36');this.rewardNotice.node.setPosition(-140,0);this.rewardNotice.node.getComponent(UITransform)!.setContentSize(185,60);
  this.instructions.node.setScale(s,s,1);this.instructions.node.setPosition(0,(l.bottom+78)*s);this.instructions.node.getComponent(UITransform)!.setContentSize(Math.max(240,width-330),34);this.instructions.fontSize=14;this.instructions.color=new Color('#654c36');
 }
 update(dt:number,w:number,h:number):void{
  if(!this.node.active)return;this.layout(w,h);if(this.hub.node.active){this.hub.node.setSiblingIndex(this.node.parent!.children.length-1);this.stop();return;}
  if(this.run&&this.run.age!==this.age){this.task.close();this.restart();}
  this.player.axis=(this.task.node.active||this.studio.node.active)?{x:0,y:0}:Math.hypot(this.axis.x,this.axis.y)>.05?this.axis:inputAxis(this.keys);if(Math.hypot(this.player.axis.x,this.player.axis.y)>.05)this.pending=undefined;this.player.step(dt);this.time+=Math.min(dt,.1);const d=this.hub.campaign.data;this.sprite.spriteFrame=this.art.avatarFrame(d.avatar,this.player.moving?1+Math.floor(this.time*8)%2:0,this.player.direction,d.hair,d.skin,d.age);
  const roomScale=this.board.scale.x,controlScale=this.node.getChildByName('HouseExit')!.scale.x,top=h/2-74*controlScale,bottom=-h/2+46*controlScale;this.board.setPosition(-32*roomScale,Math.max(top-64*roomScale,Math.min(bottom+316*roomScale,-(this.player.position.y+35)*roomScale)));
  [...this.board.children].sort((a,b)=>b.position.y-a.position.y).forEach((n,i)=>n.setSiblingIndex(i));
  if(this.pending&&!this.player.hasPath){const id=this.pending;this.pending=undefined;const object=id==='exit'?{x:6,y:9}:houseObjects(this.house.id).find(o=>o.id===id),tile=tileAt(this.player.position);if(object&&Math.abs(tile.x-object.x)+Math.abs(tile.y-object.y)===1)this.interact(id);}
  const signature=this.house.id+':'+this.step+':'+this.age;if(this.stamp!==signature){this.stamp=signature;this.objective.string=this.house.objectives[this.step]+' • '+this.age+' tuổi';houseObjects(this.house.id).forEach((o,i)=>{const n=this.board.getChildByName('HomeObject-'+o.id)!,frame=this.furnitureArt.frame(this.house.id,i),visual=n.getChildByName('PaintedFurniture')!,overlay=n.getChildByName('TaskItemOverlay')!.getComponent(Graphics)!;visual.active=!!frame;if(frame)visual.getComponent(Sprite)!.spriteFrame=frame;n.getComponent(Graphics)!.clear();overlay.clear();paintStation(frame?overlay:n.getComponent(Graphics)!,this.house.id,i,(i===1&&this.step>=2)||(i===2&&this.step>=3)||(i===3&&this.step>=4)||(i===0&&this.step===5),this.house.actions[this.step]===o.id,!!frame);});
   const carry=this.carried.getComponent(Graphics)!;carry.clear();this.carried.active=this.step===2||this.step===4;if(this.carried.active){const symbols:Record<HouseId,string[]>={home:['book','pens'],tam:['leaf','bowl'],farm:['seed','water'],pottery:['clay','paint'],books:['tree-book','card']};paintHouseItem(carry,symbols[this.house.id][this.step===2?0:1],26);}
  }
  this.carried.setPosition(this.player.direction>=2&&this.player.direction<=5?-23:23,36+(this.player.moving?Math.sin(this.time*9)*2:0));
  this.title.string=this.house.name+(this.step===5?' • Hoàn thành ✓':'');const reward=this.node.getChildByName('HouseReward')!,earned=this.hub.houseRewards.includes(houseRewardIds[this.house.id]);reward.getComponent(Graphics)!.clear();if(earned)paintHouseItem(reward.getComponent(Graphics)!,houseRewardIds[this.house.id],65);this.rewardNotice.string=earned?(furniture.find(f=>f.id===houseRewardIds[this.house.id])?.name??'Đã nhận quà'):'Hoàn thành bài\nđể mở quà';
  this.instructions.string=this.rewardMessage||'Chạm sàn để đi • Chạm đồ vật để làm bài\nWASD / mũi tên • E: đến mục tiêu';this.replayLabel.string=this.step===5?(this.rewardBusy?'Đang kiểm tra…':!earned&&this.run?.answers.length===5?'Nhận quà':'Chơi lại'):'';
  const playing=!this.task.node.active&&!this.studio.node.active;this.node.getChildByName('HouseStick')!.active=playing;this.node.getChildByName('HouseInteract')!.active=playing&&this.step<5;this.node.getChildByName('HouseReplay')!.active=playing&&this.step===5;reward.active=playing&&earned;this.instructions.node.active=playing&&!!this.rewardMessage;
  const decor=JSON.stringify(d.upgrades?.room)+this.hub.houseRewards.join();if(this.decorStamp!==decor){this.decorStamp=decor;this.showDecor();}
 }
}
