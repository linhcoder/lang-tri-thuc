import {Color,Label,Node,Rect,resources,Sprite,SpriteFrame,Texture2D,Size,Vec2,tween,Tween,UITransform,Vec3} from 'cc';
import {ExpansionGame} from '../world/ExpansionActivities';
import {flowerCareContent} from '../world/FlowerCareContent';
import {flowerCareAtlasRects} from './FlowerCareAtlasRects';
import {UiClickSound} from './UiClickSound';

type Action={node:Node;run:()=>void};
/** Native Cocos view: one atlas, fixed nodes, no state stored in the renderer. */
export class FlowerCareView {
 readonly node:Node;
 private frames:SpriteFrame[]=[];private bindings:Array<{sprite:Sprite;art:number}>=[];
 private actions:Action[]=[];private cards:Node[]=[];private icons:Sprite[]=[];private labels:Label[]=[];private badges:Sprite[]=[];
 private question:Label;private progress:Label;private notice:Label;private next:Node;private nextLabel:Label;private soundLabel:Label;
 private game?:ExpansionGame;private step=-1;private selected=-1;private complete=false;private ready=false;private disposed=false;
 private sound=new UiClickSound();private evaluating=false;private hintShown=false;private wide=true;private compact=false;
 constructor(parent:Node,private choose:(index:number)=>void,private close:()=>void,private finish:()=>void,private muted:()=>boolean,private toggleSound:()=>void){
  this.node=new Node('FlowerCarePanel');parent.addChild(this.node);this.node.addComponent(UITransform);
  this.art(this.node,'Paper',0,0,0,960,650,true);
  this.art(this.node,'WoodTitle',1,0,275,520,85,false);this.text(this.node,'Title',flowerCareContent.title,0,275,430,64,42);
  this.text(this.node,'Subtitle',flowerCareContent.subtitle,0,207,790,42,23);
  this.progress=this.text(this.node,'Progress','',-385,140,130,65,26);
  this.question=this.text(this.node,'Question','',35,145,680,80,30);
  for(let i=0;i<3;i++){
   const card=this.art(this.node,'ExpansionChoice-'+i,2,(i-1)*278,-8,256,250,true).node;this.cards.push(card);
   this.icons.push(this.art(card,'ChoicePicture',5,0,26,160,150));
   this.labels.push(this.text(card,'Text','',0,-83,220,65,26));
   const badge=this.art(card,'Result',13,94,99,52,52);badge.node.active=false;this.badges.push(badge);
   this.actions.push({node:card,run:()=>this.select(i)});
  }
  this.art(this.node,'HintPaper',2,0,-195,800,104,false).color=new Color(216,241,199);
  this.notice=this.text(this.node,'Feedback','',-30,-195,640,90,24);
  const hint=this.art(this.node,'ExpansionHint',15,350,-193,70,74).node;this.actions.push({node:hint,run:()=>this.hint()});
  const closeButton=this.art(this.node,'HubClose',2,-240,-277,250,72,false).node;this.text(closeButton,'Text','Đóng',0,0,210,65,26);this.actions.push({node:closeButton,run:()=>this.close()});
  this.next=this.art(this.node,'ExpansionContinue',3,140,-277,390,72,false).node;this.nextLabel=this.text(this.next,'Text','Tiếp tục',0,0,310,65,29);this.actions.push({node:this.next,run:()=>this.advance()});
  const x=this.art(this.node,'CloseTop',4,422,277,65,65).node;this.text(x,'Text','×',0,0,50,56,40);this.actions.push({node:x,run:()=>this.close()});
  const audio=this.art(this.node,'FlowerSound',2,-390,-277,100,72,false).node;this.soundLabel=this.text(audio,'Text','',0,0,88,64,17);this.actions.push({node:audio,run:()=>{this.toggleSound();this.refresh();}});
  this.notice.string='Đang tải hình minh họa…';
  resources.load('village/flower-care-v1/atlas/texture',Texture2D,(error,texture)=>{
   if(this.disposed)return;
   if(error){this.notice.string='Chưa tải được hình. Tải lại trang để thử lại.';return;}
   this.frames=flowerCareAtlasRects.map((r,i)=>{const f=new SpriteFrame();f.texture=texture;f.rect=new Rect(...r);f.originalSize=new Size(r[2],r[3]);f.offset=new Vec2(0,0);if(i<4){f.insetLeft=f.insetRight=i===0?65:38;f.insetTop=f.insetBottom=i===0?65:28;}return f;});
   for(const b of this.bindings)b.sprite.spriteFrame=this.frames[b.art];this.ready=true;this.refresh();
  });
 }
 get size(){return this.wide?{width:960,height:this.compact?450:650}:{width:620,height:1010};}
 layout(wide:boolean,compact=false){if(this.wide===wide&&this.compact===compact&&this.node.getComponent(UITransform)!.width)return;this.wide=wide;this.compact=compact;const {width,height}=this.size;this.node.getComponent(UITransform)!.setContentSize(width,height);
  const set=(name:string,x:number,y:number,w:number,h:number)=>{const n=this.node.getChildByName(name)!;n.setPosition(x,y);n.getComponent(UITransform)!.setContentSize(w,h);};
  if(wide){set('Paper',0,0,960,650);set('WoodTitle',0,275,520,85);set('Title',0,275,430,64);set('Subtitle',0,207,790,42);set('Progress',-385,140,130,65);set('Question',35,145,680,80);set('HintPaper',0,-195,800,104);set('Feedback',-30,-195,640,90);set('ExpansionHint',350,-193,70,74);set('HubClose',-240,-277,250,72);set('ExpansionContinue',140,-277,390,72);set('CloseTop',422,277,65,65);set('FlowerSound',-390,-277,100,72);}
  else{set('Paper',0,0,620,1010);set('WoodTitle',0,425,470,100);set('Title',0,425,410,80);set('Subtitle',0,338,500,65);set('Progress',0,277,450,45);set('Question',0,220,510,80);set('HintPaper',0,-330,520,120);set('Feedback',-25,-330,405,112);set('ExpansionHint',219,-330,76,76);set('HubClose',-112,-437,210,90);set('ExpansionContinue',120,-437,235,90);set('CloseTop',258,445,64,64);set('FlowerSound',-233,277,76,76);}
  if(wide&&compact){set('Paper',0,0,960,450);set('WoodTitle',0,177,470,68);set('Title',0,177,400,56);set('Subtitle',0,128,750,35);set('Progress',-380,89,150,40);set('Question',35,86,690,48);set('HintPaper',0,-124,800,64);set('Feedback',-25,-124,650,58);set('ExpansionHint',350,-124,74,74);set('HubClose',-235,-184,250,64);set('ExpansionContinue',135,-184,390,64);set('CloseTop',422,177,74,74);set('FlowerSound',-390,-184,100,64);}
  this.cards.forEach((card,i)=>{card.setPosition(wide?(i-1)*278:0,wide?(compact?-7:-8):105-i*145);card.getComponent(UITransform)!.setContentSize(wide?256:520,wide?(compact?162:250):132);
   const icon=this.icons[i].node;icon.setPosition(wide?0:-165,wide?(compact?20:26):0);icon.getComponent(UITransform)!.setContentSize(wide?(compact?110:160):105,wide?(compact?88:150):108);
   this.labels[i].node.setPosition(wide?0:58,wide?(compact?-53:-83):0);this.labels[i].node.getComponent(UITransform)!.setContentSize(wide?220:280,compact&&wide?44:65);this.badges[i].node.setPosition(wide?94:231,wide?(compact?60:99):40);
  });
 }
 show(game:ExpansionGame,message=''){this.node.active=true;if(this.game!==game||this.step!==game.step){this.game=game;this.step=game.step;this.selected=-1;this.complete=false;this.evaluating=false;this.hintShown=false;}this.refresh();if(message)this.notice.string=message;}
 handle(point:{x:number;y:number}){const p=this.node.getComponent(UITransform)!.convertToNodeSpaceAR(new Vec3(point.x,point.y));const hit=this.actions.find(a=>{const t=a.node.getComponent(UITransform)!;return Math.abs(p.x-a.node.position.x)<=t.width/2&&Math.abs(p.y-a.node.position.y)<=t.height/2;});hit?.run();}
 key(code:number){if(code>=49&&code<=51)this.select(code-49);else if(code===13)this.advance();else if(code===72)this.hint();}
 private select(index:number){if(!this.ready||!this.game||this.game.ended||this.complete||this.evaluating)return;this.evaluating=true;this.selected=index;this.refresh();this.notice.string='Đang chọn…';const card=this.cards[index];Tween.stopAllByTarget(card);card.setScale(1,1,1);
  tween(card).to(.08,{scale:new Vec3(.97,.97,1)}).to(.1,{scale:new Vec3(1,1,1)}).call(()=>{this.evaluating=false;if(!this.node.activeInHierarchy||this.game?.step!==this.step)return;this.complete=index===flowerCareContent.rounds[this.step].answer;this.refresh();if(!this.muted())this.sound.play(this.complete?'correct':'wrong');}).start();
 }
 private hint(){if(!this.ready||!this.game||this.game.ended)return;this.hintShown=true;this.refresh();}
 private advance(){if(!this.game||!this.ready)return;if(this.game.ended){this.finish();return;}if(this.complete)this.choose(this.selected);}
 private refresh(){if(!this.game||!this.ready)return;const ended=this.game.ended,r=flowerCareContent.rounds[Math.min(this.step,2)];this.question.string=ended?'Hoa đã được chăm sóc!':r.prompt;this.progress.string=ended?'Hoàn thành 3/3':`Bước ${this.step+1}/3`;
  this.cards.forEach((card,i)=>{card.active=!ended;const sprite=card.getComponent(Sprite)!;sprite.color=new Color(...(this.selected===i?(this.complete?[180,235,156,255]:this.evaluating?[243,230,148,255]:[255,207,179,255]):[255,255,255,255]) as [number,number,number,number]);this.icons[i].spriteFrame=this.frames[r.choices[i].art];this.labels[i].string=r.choices[i].label;this.badges[i].node.active=this.selected===i&&!this.evaluating;this.badges[i].spriteFrame=this.frames[this.complete?13:14];});
  this.notice.string=ended?'Đã hoàn thành ba bước. Bé có thể chơi lại cùng bạn.':this.complete?r.correct:this.evaluating?'Đang chọn…':this.hintShown?'Gợi ý: '+r.hint:this.selected>=0?'Chưa đúng. Mình thử cách khác nhé!':'Chạm hình hoặc tên để chọn. Cần giúp đỡ? Chạm bóng đèn.';
  this.next.getComponent(Sprite)!.color=ended||this.complete?Color.WHITE:new Color(170,170,170);this.nextLabel.string=ended?'Xong':'Tiếp tục';this.nextLabel.color=ended||this.complete?new Color(255,255,255):new Color(84,73,44);this.soundLabel.string=this.muted()?'Âm: tắt':'Âm: bật';
 }
 private art(parent:Node,name:string,art:number,x:number,y:number,w:number,h:number,sliced=false){const node=new Node(name);parent.addChild(node);node.setPosition(x,y);node.addComponent(UITransform).setContentSize(w,h);const sprite=node.addComponent(Sprite);sprite.sizeMode=Sprite.SizeMode.CUSTOM;sprite.type=sliced?Sprite.Type.SLICED:Sprite.Type.SIMPLE;this.bindings.push({sprite,art});return sprite;}
 private text(parent:Node,name:string,value:string,x:number,y:number,w:number,h:number,size:number){const n=new Node(name);parent.addChild(n);n.setPosition(x,y);n.addComponent(UITransform).setContentSize(w,h);const l=n.addComponent(Label);l.string=value;l.fontSize=size;l.lineHeight=size+6;l.color=new Color(87,44,19);l.isBold=true;l.enableWrapText=true;l.overflow=Label.Overflow.SHRINK;l.cacheMode=Label.CacheMode.CHAR;return l;}
 dispose(){this.disposed=true;this.cards.forEach(c=>Tween.stopAllByTarget(c));this.frames.forEach(f=>f.destroy());this.sound.dispose();this.node.destroy();}
}
