import {Color,Graphics,Label,Node,UITransform,Vec3} from 'cc';
import {Point} from '../world/VillageModel';
import {HouseChallenge} from '../world/HouseTasks';
import {paintHouseItem} from './HouseArt';
import {SpeechReader} from './SpeechReader';
export class HouseTaskView {
 readonly node:Node;private item:Node;private feedback:Label;private prompt:Label;private drag=false;private selected=false;private challenge?:HouseChallenge;private speech=new SpeechReader();private answer?:(index:number)=>void;private wrong?:()=>void;private soundEnabled=false;
 constructor(parent:Node){
  this.node=this.make(parent,'HouseTask',880,490);this.node.active=false;this.box(this.node,0,0,880,490,'#f2e4c7');
  this.prompt=this.text(this.node,'',0,173,26,760,85);
  this.item=this.make(this.node,'HouseTaskItem',120,100);this.item.setPosition(0,45);this.item.addComponent(Graphics);
  this.text(this.node,'Kéo vật vào ô phù hợp hoặc chạm một đáp án',0,-195,18,820,40);
  this.feedback=this.text(this.node,'',0,-150,20,800,40);
  this.box(this.node,390,207,62,48,'#d3bd99');this.text(this.node,'×',390,207,28,60,48);
  this.box(this.node,-300,215,165,40,'#dbc9a5');this.text(this.node,'Nghe lại',-300,215,17,160,40);
  this.box(this.node,290,-210,160,42,'#dbc9a5');this.text(this.node,'Gợi ý',290,-210,18,150,40);
 }
 private make(parent:Node,name:string,w:number,h:number):Node{const n=new Node(name);n.layer=parent.layer;parent.addChild(n);n.addComponent(UITransform).setContentSize(w,h);return n;}
 private box(n:Node,x:number,y:number,w:number,h:number,c:string):void{const g=n.getComponent(Graphics)??n.addComponent(Graphics);g.fillColor=new Color(c);g.roundRect(x-w/2,y-h/2,w,h,12);g.fill();}
 private text(n:Node,s:string,x:number,y:number,size:number,w:number,h:number):Label{const node=this.make(n,'Text',w,h);node.setPosition(x,y);const l=node.addComponent(Label);l.string=s;l.fontSize=size;l.lineHeight=size+5;l.color=new Color('#4c513b');l.cacheMode=Label.CacheMode.CHAR;l.overflow=Label.Overflow.SHRINK;node.getComponent(UITransform)!.setContentSize(w,h);return l;}
 open(challenge:HouseChallenge,enabled:boolean,answer:(index:number)=>void,wrong?:()=>void):void{
  this.challenge=challenge;this.answer=answer;this.wrong=wrong;this.soundEnabled=enabled;this.node.active=true;this.node.setSiblingIndex(this.node.parent!.children.length-1);this.selected=false;this.cancelDrag();this.prompt.string=challenge.prompt;this.feedback.string='';this.node.children.filter(n=>n.name.startsWith('HouseChoice-')).forEach(n=>n.destroy());
  const icon=this.item.getComponent(Graphics)!;icon.clear();paintHouseItem(icon,challenge.kind==='sort'?this.sourceSymbol(challenge.item):challenge.symbols[challenge.answer],58);
  challenge.choices.forEach((choice,i)=>{const card=this.make(this.node,'HouseChoice-'+i,250,125);card.setPosition((i-1)*275,-65);this.box(card,0,0,250,125,'#e2cca6');const art=this.make(card,'ChoiceArt',210,60);art.setPosition(0,15);const g=art.addComponent(Graphics);
   if(challenge.kind==='count'){const count=Number.parseInt(choice,10),symbol=challenge.symbols[i]==='pens'?'pencil':challenge.symbols[i]==='seed'?'single-seed':challenge.symbols[i];for(let j=0;j<Math.min(7,count);j++){const piece=this.make(art,'CountItem-'+j,30,36);piece.setPosition((j-(count-1)/2)*27,0);paintHouseItem(piece.addComponent(Graphics),symbol,24);}}
   else paintHouseItem(g,challenge.symbols[i],40);
   this.text(card,choice,0,-37,21,235,45);
  });this.speech.read(challenge.prompt,enabled);
 }
 private sourceSymbol(item:string):string{return item.includes('Sách')||item.includes('sách')||item.includes('Truyện')?'book':item.includes('Bút')?'pens':item.includes('Rau')?'leaf':item.includes('Bát')?'bowl':item.includes('Hạt')?'seed':item.includes('Đất')?'clay':'card';}
 private local(p:Point):Vec3{return this.node.getComponent(UITransform)!.convertToNodeSpaceAR(new Vec3(p.x,p.y,0));}
 begin(p:Point):boolean{if(!this.node.active)return false;const q=this.local(p);if(Math.abs(q.x)<70&&Math.abs(q.y-45)<60&&this.challenge?.kind==='sort'){this.drag=true;this.selected=true;}return true;}
 move(p:Point):void{if(this.drag){const q=this.local(p);this.item.setPosition(q.x,q.y);}}
 end(p:Point):void{if(!this.node.active)return;const q=this.local(p),wasDrag=this.drag;this.cancelDrag();if(wasDrag){const index=this.choice(q);if(index>=0)this.choose(index);else this.feedback.string='Thả vật vào một ô bên dưới nhé!';}else this.handle(p);}
 private choice(q:Point):number{return Math.abs(q.y+65)<65?[-275,0,275].findIndex(x=>Math.abs(q.x-x)<125):-1;}
 handle(p:Point):void{const q=this.local(p);if(q.x>355&&q.y>180){this.close();return;}if(q.x<-210&&q.y>190){this.speech.read(this.challenge?.prompt??'',this.soundEnabled);return;}if(q.x>200&&q.y<-175){this.feedback.string=this.challenge?.hint??'';return;}const index=this.choice(q);if(index>=0)this.choose(index);else if(Math.abs(q.x)<70&&Math.abs(q.y-45)<60){this.selected=true;this.feedback.string='Chọn nơi đặt vật ở bên dưới.';}}
 choose(index:number):void{if(!this.challenge||!this.node.active||!Number.isInteger(index)||index<0||index>2)return;if(index!==this.challenge.answer){this.wrong?.();this.feedback.string=this.challenge.hint;const card=this.node.getChildByName('HouseChoice-'+index);if(card){card.getComponent(Graphics)!.clear();this.box(card,0,0,250,125,'#e5b29e');}return;}const answer=this.answer;this.close();answer?.(index);}
 cancelDrag():void{this.drag=false;this.item.setPosition(0,45);}
 close():void{this.cancelDrag();this.node.active=false;this.speech.stop();}
}
