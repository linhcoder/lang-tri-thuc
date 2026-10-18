import {Color,Graphics,Label,Node,UITransform,Vec3} from 'cc';
import {Point} from '../world/VillageModel';
import {insidePottery,potteryMaxStrokes,potteryMaxPoints,PotteryDraft,potteryColors,potteryRadius,restorePotteryDraft,shapePottery} from '../world/PotteryDraft';
export class PotteryWorkshopView {
 readonly node:Node;draft=restorePotteryDraft(null);private drawing:Node;private message:Label;private mode:'shape'|'paint'='shape';private activeStroke=-1;private dragging=false;private brushColor=3;
 constructor(parent:Node,private save:(draft:PotteryDraft)=>void){
  this.node=this.make(parent,'PotteryWorkshop',900,550);this.node.active=false;this.node.setPosition(0,25);this.box(this.node,0,0,900,550,'#eedfc3');this.text('Xưởng gốm của bé',0,225,28,650,55);
  this.drawing=this.make(this.node,'SculptingCanvas',270,310);this.drawing.setPosition(-180,5);this.drawing.addComponent(Graphics);
  this.message=this.text('',150,135,21,450,100);
  this.button('ShapeMode','Nặn dáng bình',155,35,330,'#d5b58d');this.button('PaintMode','Vẽ hoa văn',155,-40,330,'#d5b58d');
  potteryColors.forEach((c,i)=>this.button('Glaze-'+i,'',(i-2)*65+145,-125,52,c));
  this.button('UndoStroke','Xóa nét cuối',-165,-205,230,'#d5b58d');this.button('SavePottery','Lưu tác phẩm',145,-205,280,'#b9c19a');
  this.button('ClosePottery','×',395,225,55,'#dbc5a3');
 }
 private make(parent:Node,name:string,w:number,h:number):Node{const n=new Node(name);n.layer=parent.layer;parent.addChild(n);n.addComponent(UITransform).setContentSize(w,h);return n;}
 private box(n:Node,x:number,y:number,w:number,h:number,c:string):void{const g=n.getComponent(Graphics)??n.addComponent(Graphics);g.fillColor=new Color(c);g.roundRect(x-w/2,y-h/2,w,h,10);g.fill();}
 private text(s:string,x:number,y:number,size:number,w:number,h:number,parent=this.node):Label{const n=this.make(parent,'Text',w,h);n.setPosition(x,y);const l=n.addComponent(Label);l.cacheMode=Label.CacheMode.CHAR;l.overflow=Label.Overflow.SHRINK;l.fontSize=size;l.lineHeight=size+5;l.color=new Color('#544f3c');l.string=s;n.getComponent(UITransform)!.setContentSize(w,h);return l;}
 private button(id:string,s:string,x:number,y:number,w:number,c:string):void{const n=this.make(this.node,id,w,52);n.setPosition(x,y);this.box(n,0,0,w,52,c);this.text(s,0,0,21,w-10,48,n);}
 open(raw:unknown):void{this.draft=restorePotteryDraft(raw);this.mode='shape';this.node.active=true;this.node.setSiblingIndex(this.node.parent!.children.length-1);this.paint();}
 private local(p:Point,n=this.node):Vec3{return n.getComponent(UITransform)!.convertToNodeSpaceAR(new Vec3(p.x,p.y,0));}
 begin(p:Point):void{const q=this.local(p,this.drawing);this.dragging=Math.abs(q.x)<=110&&Math.abs(q.y)<=125;this.activeStroke=-1;if(!this.dragging)return;if(this.mode==='paint'){if(this.draft.strokes.length>=potteryMaxStrokes||!insidePottery(this.draft,q)){this.dragging=false;return;}this.activeStroke=this.draft.strokes.push({color:this.brushColor,points:[]})-1;}this.move(p);}
 move(p:Point):void{if(!this.dragging)return;const q=this.local(p,this.drawing);if(this.mode==='shape')shapePottery(this.draft,q.x,q.y);else if(this.activeStroke>=0&&insidePottery(this.draft,q)){const points=this.draft.strokes[this.activeStroke].points;if(points.length<potteryMaxPoints&&(!points.length||Math.hypot(q.x-points[points.length-1].x,q.y-points[points.length-1].y)>2))points.push({x:Math.round(q.x),y:Math.round(q.y)});}this.paint();}
 end(p:Point):void{if(this.dragging){this.move(p);this.cancel();this.persist();return;}this.handle(p);}
 cancel():void{this.dragging=false;this.activeStroke=-1;}
 pause():void{if(this.node.active&&this.dragging){this.cancel();this.persist();}}
 private persist():void{this.draft.updated=Math.max(Date.now(),this.draft.updated+1);this.save(restorePotteryDraft(this.draft));}
 handle(p:Point):void{const q=this.local(p);if(q.x>360&&q.y>195){this.close();return;}if(Math.abs(q.x-155)<165&&Math.abs(q.y-35)<28){this.mode='shape';this.paint();return;}if(Math.abs(q.x-155)<165&&Math.abs(q.y+40)<28){this.mode='paint';this.paint();return;}if(Math.abs(q.y+125)<28){const i=Math.round((q.x-145)/65+2);if(i>=0&&i<5){if(this.mode==='paint')this.brushColor=i;else this.draft.color=i;this.persist();this.paint();}return;}if(Math.abs(q.y+205)<28){if(q.x<-50){this.draft.strokes.pop();this.persist();this.paint();}else if(q.x>0)this.close();}}
 close():void{if(!this.node.active)return;this.cancel();this.persist();this.node.active=false;}
 private paint():void{const g=this.drawing.getComponent(Graphics)!;g.clear();g.fillColor=new Color('#a58b6b');g.ellipse(0,-143,115,19);g.fill();g.fillColor=new Color(potteryColors[this.draft.color]);g.moveTo(-this.draft.radii[0],-125);for(let i=0;i<12;i++)g.lineTo(-this.draft.radii[i],-125+i/11*250);for(let i=11;i>=0;i--)g.lineTo(this.draft.radii[i],-125+i/11*250);g.close();g.fill();
  g.fillColor=new Color('#765b47');g.ellipse(0,125,this.draft.radii[11],7);g.fill();for(const stroke of this.draft.strokes){g.strokeColor=new Color(potteryColors[stroke.color]);g.lineWidth=5;let connected=false;for(const p of stroke.points){if(!insidePottery(this.draft,p)){connected=false;continue;}if(connected)g.lineTo(p.x,p.y);else g.moveTo(p.x,p.y);connected=true;}g.stroke();}
  g.strokeColor=new Color(255,240,211,100);g.lineWidth=4;g.moveTo(-potteryRadius(this.draft,-100)*.65,-100);g.lineTo(-potteryRadius(this.draft,100)*.65,100);g.stroke();this.message.string=this.mode==='shape'?'Kéo hai bên thân bình để nặn rộng hoặc thu nhỏ.':'Chọn màu rồi kéo trên bình để vẽ hoa văn.\nTác phẩm tự lưu theo hồ sơ của bé.';
 }
}
