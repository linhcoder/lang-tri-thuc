import {Color,Graphics,Label,Node,Sprite,UITransform,Vec3} from 'cc';
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
export interface HouseRewardService {load():Promise<string[]>;claim(id:HouseId,age:HouseAge,answers:number[]):Promise<string[]>}

/** Interior coordinates never replace the outdoor multiplayer position. */
export class HouseInteriorView {
 private house:EnterableHouse=enterableHouses[0];readonly node:Node;private board:Node;private player:PlayerController;private sprite:Sprite;
 private title:Label;private objective:Label;private instructions:Label;private rewardNotice:Label;private replayLabel:Label;readonly task:HouseTaskView;
 private carried:Node;private pending?:string;private keys=new Set<number>();private axis:Point={x:0,y:0};private stickHeld=false;private pointerStart?:Point;private time=0;private stamp='';private fullscreenVisibility?:string;
 private rewardBusy=false;private rewardMessage='';private decorStamp='';
 readonly studio:PotteryWorkshopView;
 constructor(parent:Node,private hub:VillageHub,private art:VillageArt,private exit:()=>void,private service?:HouseRewardService){
  this.node=this.make(parent,'HouseInterior',960,640);this.node.active=false;this.box(this.node,0,0,960,640,'#364d42');
  this.title=this.text(this.node,'Nhà của bé',0,283,27,850,50);this.objective=this.text(this.node,'',0,233,21,900,60);
  this.board=this.make(this.node,'InteriorFloor',800,440);this.board.setPosition(-35,120);this.board.setScale(.96,.96,1);this.board.addComponent(Graphics);
  for(const o of houseObjects()){const n=this.make(this.board,'HomeObject-'+o.id,110,100);n.addComponent(Graphics);this.text(n,o.name,0,59,16,135,44);}
  const door=toWorld({x:6,y:8});this.text(this.board,'↓ Ra sân',door.x,door.y-8,18,130,40);
  const actor=this.make(this.board,'InteriorPlayer',70,90);this.player=actor.addComponent(PlayerController);this.player.map=new InteriorMap();
  const body=this.make(actor,'InteriorAvatar',70,90);body.setPosition(0,33);this.sprite=body.addComponent(Sprite);this.sprite.sizeMode=Sprite.SizeMode.CUSTOM;
  this.carried=this.make(actor,'CarriedHouseItem',50,50);this.carried.setPosition(23,36);this.carried.addComponent(Graphics);
  const reward=this.make(this.node,'HouseReward',120,140);reward.setPosition(360,100);reward.addComponent(Graphics);this.rewardNotice=this.text(reward,'',0,-78,17,190,70);
  this.control('HouseExit','Ra sân',365,-270,180,58,'#a86f49',22);
  this.control('HouseDecorate','Trang trí nhà bé',95,-270,275,58,'#62865d',21);
  this.control('HouseStick','↑\n←     →\n↓',-300,-240,150,120,'#597963',24);
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
  this.stop();this.task.close();this.studio.close();this.house=house;this.node.active=true;this.node.setSiblingIndex(this.node.parent!.children.length-1);this.player.map=new InteriorMap(house.id);this.player.position=toWorld({x:6,y:7});this.player.node.setPosition(this.player.position.x,this.player.position.y);this.node.getChildByName('PotteryStudio')!.active=house.id==='pottery';
  if(this.step<5){this.ensureRun();this.save();}
  for(const [i,o]of houseObjects(house.id).entries()){const n=this.board.getChildByName('HomeObject-'+o.id)!,p=toWorld(o);n.setPosition(p.x,p.y);n.children[0].getComponent(Label)!.string=house.objects[i];}
  paintHouseRoom(this.board.getComponent(Graphics)!,house.id,house.wall);this.rewardMessage='';this.stamp='';this.decorStamp='';this.showDecor();void this.refreshRewards();
 }
 private ensureRun():void{const data=this.hub.campaign.data.upgrades??=restoreUpgrades(null);if(!this.run||this.run.age!==this.age)(data.houseRuns??={})[this.house.id]={age:this.age,answers:[],updated:Date.now()};}
 restart():void{this.stop();this.task.close();const data=this.hub.campaign.data.upgrades??=restoreUpgrades(null);(data.houseRuns??={})[this.house.id]={age:this.age,answers:[],updated:Math.max(Date.now(),(this.run?.updated??0)+1)};this.rewardMessage='Lượt luyện mới đã sẵn sàng.';this.stamp='';this.save();}
 async refreshRewards():Promise<void>{try{if(this.service){const received=await this.service.load();this.hub.houseRewards=Array.from(new Set([...this.hub.houseRewards,...received]));}}catch{/* Local play remains available; no unverified reward is unlocked. */}}
 async claimReward():Promise<void>{if(this.rewardBusy)return;const run=this.run;if(!run||run.age!==this.age||run.answers.length!==5){this.rewardMessage='Chọn Chơi lại để hoàn thành bài mới và nhận quà.';return;}if(!this.service){this.rewardMessage='Bài đã lưu. Kết nối tài khoản để nhận quà.';return;}
  this.rewardBusy=true;const id=this.house.id,age=run.age,answers=[...run.answers];this.rewardMessage='Đang kiểm tra phần thưởng…';
  try{const received=await this.service.claim(id,age,answers);this.hub.houseRewards=Array.from(new Set([...this.hub.houseRewards,...received]));if(this.house.id===id)this.rewardMessage='Đã mở đồ trang trí! Xem trong Trang trí nhà bé.';}catch(error){if(this.house.id===id)this.rewardMessage=(error as {status?:number}).status===422?'Nhóm tuổi của hồ sơ đã đổi. Tải lại và chơi bài theo tuổi mới nhé!':'Chưa kết nối được. Bài đã lưu; chạm Nhận quà để thử lại.';}finally{this.rewardBusy=false;this.decorStamp='';}
 }
 private showDecor():void{this.board.children.filter(n=>n.name.startsWith('HomeDecor-')).forEach(n=>n.destroy());if(this.house.id!=='home')return;['left','middle','right'].forEach((slot,i)=>{const item=furniture.find(f=>f.id===this.hub.campaign.data.upgrades?.room[slot]&&furnitureUnlocked(f,this.hub.campaign.stars,this.hub.houseRewards));if(!item)return;const holder=this.make(this.board,'HomeDecor-'+slot,60,80),p=toWorld({x:2+i*3,y:1});holder.setPosition(p.x,p.y+10);if(item.reward){paintHouseItem(holder.addComponent(Graphics),item.id,50);return;}void this.art.ensureObject('reward.'+item.id,-1).then(frame=>{if(holder.isValid&&frame)this.art.sprite(holder,'Collectible',frame,50,50*frame.rect.height/frame.rect.width);});});}
 close():void{this.stop();this.task.close();this.studio.close();this.node.active=false;if(typeof document!=='undefined'&&this.fullscreenVisibility!==undefined){const button=document.getElementById('fullscreen-game');if(button)button.style.visibility=this.fullscreenVisibility;this.fullscreenVisibility=undefined;}this.exit();}
 stop():void{this.keys.clear();this.axis={x:0,y:0};this.stickHeld=false;this.pointerStart=undefined;this.pending=undefined;this.player.cancel();this.task?.cancelDrag();this.studio?.pause();}
 key(code:number,down:boolean):void{if(!down){this.keys.delete(code);return;}if(this.studio.node.active){if(code===27)this.studio.close();return;}if(this.task.node.active){if(code===27)this.task.close();else if(code>=49&&code<=51)this.task.choose(code-49);return;}if(code===27){this.close();return;}if(code===69){const id=this.house.actions[this.step];if(id)this.target(id);return;}this.keys.add(code);}
 private local(p:Point,n=this.node):Vec3{return n.getComponent(UITransform)!.convertToNodeSpaceAR(new Vec3(p.x,p.y,0));}
 beginPointer(p:Point):void{this.pointerStart={...p};if(this.studio.node.active){this.studio.begin(p);return;}if(this.task.node.active){this.task.begin(p);return;}this.stick(p,true);}
 movePointer(p:Point):void{if(this.studio.node.active){this.studio.move(p);return;}if(this.task.node.active)this.task.move(p);else this.stick(p);}
 endPointer(p:Point):void{if(this.studio.node.active){const q=this.local(p);if(q.y<-235&&q.x>265)this.close();else this.studio.end(p);this.pointerStart=undefined;return;}if(this.task.node.active){const q=this.local(p);if(q.y<-235&&q.x>265){this.close();return;}this.task.end(p);this.pointerStart=undefined;return;}const held=this.stickHeld,start=this.pointerStart;this.release();this.pointerStart=undefined;if(!held&&start&&Math.hypot(p.x-start.x,p.y-start.y)<18*this.node.scale.x)this.handle(p);}
 cancelPointer():void{this.release();this.pointerStart=undefined;this.task.cancelDrag();this.studio.pause();}
 stick(p:Point,start=false):boolean{const q=this.local(p);if(start)this.stickHeld=Math.abs(q.x+300)<80&&Math.abs(q.y+240)<65;if(!this.stickHeld)return false;const dx=q.x+300,dy=q.y+240,length=Math.max(25,Math.hypot(dx,dy));this.axis={x:dx/length,y:dy/length};this.pending=undefined;return true;}
 release():void{this.axis={x:0,y:0};this.stickHeld=false;}
 handle(p:Point):void{
  const q=this.local(p);if(q.y<-235&&q.x>265){this.close();return;}if(this.studio.node.active){this.studio.handle(p);return;}if(this.task.node.active){this.task.handle(p);return;}if(this.house.id==='pottery'&&Math.abs(q.x-350)<105&&Math.abs(q.y+65)<26){this.stop();this.studio.open(this.hub.campaign.data.upgrades?.potteryDraft);return;}if(q.y<-235&&q.x>-45&&q.x<245){this.stop();this.hub.open('room');return;}
  if(Math.abs(q.x-325)<120&&Math.abs(q.y+170)<28&&this.step===5){if(this.run?.answers.length===5&&!this.hub.houseRewards.includes(houseRewardIds[this.house.id]))void this.claimReward();else this.restart();return;}
  if(q.x<-220&&q.y<-175)return;const world=this.local(p,this.board),objects=houseObjects(this.house.id);const object=objects.find(o=>{const a=toWorld(o);return Math.abs(a.x-world.x)<50&&world.y>a.y-17&&world.y<a.y+80;});if(object){this.target(object.id);return;}this.pending=undefined;const tile=tileAt(world);if(tile.x===6&&tile.y===8){this.target('exit');return;}this.player.goTo(tile);
 }
 private target(id:string):void{if(this.task.node.active)return;const o=id==='exit'?{x:6,y:9}:houseObjects(this.house.id).find(o=>o.id===id);if(!o)return;const start=tileAt(this.player.position),goals=[{x:o.x+1,y:o.y},{x:o.x-1,y:o.y},{x:o.x,y:o.y+1},{x:o.x,y:o.y-1}].filter(p=>this.player.map.walkable(p.x,p.y));goals.sort((a,b)=>Math.hypot(a.x-start.x,a.y-start.y)-Math.hypot(b.x-start.x,b.y-start.y));for(const goal of goals)if(this.player.goTo(goal)){this.pending=id;break;}}
 private interact(id:string):void{
  if(id==='exit'){this.close();return;}if(this.step===5){this.rewardMessage='Bé đã hoàn thành. Chọn Chơi lại để luyện thêm nhé!';return;}if(id!==this.house.actions[this.step]){this.rewardMessage='Hãy đến đồ vật có viền vàng trước nhé!';return;}
  this.ensureRun();const step=this.step,house=this.house.id,age=this.age;this.stop();this.task.open(houseChallenge(house,step,age),this.hub.campaign.data.sound,index=>{
   if(this.house.id!==house||this.age!==age||this.step!==step)return;const run=this.run!;run.answers.push(index);run.updated=Math.max(Date.now(),run.updated+1);const data=this.hub.campaign.data.upgrades!;(data.houseSteps??={})[house]=Math.max(data.houseSteps?.[house]??0,run.answers.length);if(house==='home')data.homeStep=Math.max(data.homeStep??0,run.answers.length);
   recordLearning(this.hub.campaign.data,house==='tam'?'math':house==='books'?'language':house==='pottery'?'clay':'sorting',true,'house.'+house+'.'+step);this.rewardMessage='Đúng rồi!';this.save();if(run.answers.length===5){recordLearning(this.hub.campaign.data,'sorting',true,'house.'+house,'complete');this.save();void this.claimReward();}
  },()=>{recordLearning(this.hub.campaign.data,house==='tam'?'math':house==='books'?'language':house==='pottery'?'clay':'sorting',false,'house.'+house+'.'+step);this.save();});
 }
 update(dt:number,w:number,h:number):void{
  if(!this.node.active)return;const scale=Math.min((w-12)/960,(h-12)/640);this.node.setScale(scale,scale,1);if(this.hub.node.active){this.hub.node.setSiblingIndex(this.node.parent!.children.length-1);this.stop();return;}
  if(this.run&&this.run.age!==this.age){this.task.close();this.restart();}
  this.player.axis=(this.task.node.active||this.studio.node.active)?{x:0,y:0}:Math.hypot(this.axis.x,this.axis.y)>.05?this.axis:inputAxis(this.keys);if(Math.hypot(this.player.axis.x,this.player.axis.y)>.05)this.pending=undefined;this.player.step(dt);this.time+=Math.min(dt,.1);const d=this.hub.campaign.data;this.sprite.spriteFrame=this.art.avatarFrame(d.avatar,this.player.moving?1+Math.floor(this.time*8)%2:0,this.player.direction,d.hair,d.skin,d.age);
  [...this.board.children].sort((a,b)=>b.position.y-a.position.y).forEach((n,i)=>n.setSiblingIndex(i));
  if(this.pending&&!this.player.hasPath){const id=this.pending;this.pending=undefined;const object=id==='exit'?{x:6,y:9}:houseObjects(this.house.id).find(o=>o.id===id),tile=tileAt(this.player.position);if(object&&Math.abs(tile.x-object.x)+Math.abs(tile.y-object.y)===1)this.interact(id);}
  const signature=this.house.id+':'+this.step+':'+this.age;if(this.stamp!==signature){this.stamp=signature;this.objective.string=this.house.objectives[this.step]+' • '+this.age+' tuổi';houseObjects(this.house.id).forEach((o,i)=>{const n=this.board.getChildByName('HomeObject-'+o.id)!;paintStation(n.getComponent(Graphics)!,this.house.id,i,(i===1&&this.step>=2)||(i===2&&this.step>=3)||(i===3&&this.step>=4)||(i===0&&this.step===5),this.house.actions[this.step]===o.id);});
   const carry=this.carried.getComponent(Graphics)!;carry.clear();this.carried.active=this.step===2||this.step===4;if(this.carried.active){const symbols:Record<HouseId,string[]>={home:['book','pens'],tam:['leaf','bowl'],farm:['seed','water'],pottery:['clay','paint'],books:['tree-book','card']};paintHouseItem(carry,symbols[this.house.id][this.step===2?0:1],26);}
  }
  this.carried.setPosition(this.player.direction>=2&&this.player.direction<=5?-23:23,36+(this.player.moving?Math.sin(this.time*9)*2:0));
  this.title.string=this.house.name+(this.step===5?' • Hoàn thành ✓':'');const reward=this.node.getChildByName('HouseReward')!,earned=this.hub.houseRewards.includes(houseRewardIds[this.house.id]);reward.getComponent(Graphics)!.clear();if(earned)paintHouseItem(reward.getComponent(Graphics)!,houseRewardIds[this.house.id],65);this.rewardNotice.string=earned?(furniture.find(f=>f.id===houseRewardIds[this.house.id])?.name??'Đã nhận quà'):'Hoàn thành bài\nđể mở quà';
  this.instructions.string=this.rewardMessage||'Chạm sàn để đi • Chạm đồ vật để làm bài\nWASD / mũi tên • E: đến mục tiêu';this.replayLabel.string=this.step===5?(this.rewardBusy?'Đang kiểm tra…':!earned&&this.run?.answers.length===5?'Nhận quà':'Chơi lại'):'';
  const decor=JSON.stringify(d.upgrades?.room)+this.hub.houseRewards.join();if(this.decorStamp!==decor){this.decorStamp=decor;this.showDecor();}
  if(typeof document!=='undefined'){const button=document.getElementById('fullscreen-game');if(button){this.fullscreenVisibility??=button.style.visibility;button.style.visibility='hidden';}}
 }
}
