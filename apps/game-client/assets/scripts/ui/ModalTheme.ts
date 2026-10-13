import {Color,Graphics,Node,UITransform,Sprite,SpriteFrame,Texture2D,Rect,Size,Vec2,Vec3,resources,tween,Tween,isValid} from 'cc';
import {flowerCareAtlasRects} from './FlowerCareAtlasRects';
const ink=new Color(80,59,35),cream=new Color(255,245,212);
const primaryIds=new Set(['Continue','Campaign','GameFinish','ExpansionFinish','ClaimStar','ChapterIntro','NextChapter','HolidayContinue','HolidayPlay','GameResume','ServerGameResume']);
const frames=new Map<number,SpriteFrame>(),pending=new Map<Sprite,number>();
let texture:Texture2D|undefined,loading=false;
const buttons=new Set<Node>();let pressed:Node|undefined,pressedCaption:Node|undefined;
function frame(art:number):SpriteFrame{
 let f=frames.get(art);if(f)return f;
 const [x,y,w,h]=flowerCareAtlasRects[art];f=new SpriteFrame();f.texture=texture!;f.rect=new Rect(x,y,w,h);f.originalSize=new Size(w,h);f.offset=new Vec2();
 f.insetLeft=f.insetRight=art===1||art===3?90:art===2?80:65;f.insetTop=f.insetBottom=art===0?65:art===2?60:45;frames.set(art,f);return f;
}
function skin(node:Node,art:number):Sprite{
 const sprite=node.getComponent(Sprite)??node.addComponent(Sprite);sprite.sizeMode=Sprite.SizeMode.CUSTOM;sprite.type=Sprite.Type.SLICED;
 if(texture)sprite.spriteFrame=frame(art);
 else{pending.set(sprite,art);if(!loading){loading=true;resources.load('village/flower-care-v1/atlas/texture',Texture2D,(error,asset)=>{
  loading=false;if(error||!asset)return;texture=asset;
  for(const [s,id] of pending)if(isValid(s)&&isValid(s.node))s.spriteFrame=frame(id);pending.clear();
 });}}
 return sprite;
}
/** Shared atlas skin; Graphics remains available for game-specific boards. */
export function paintModalFrame(node:Node):void{const s=skin(node,0);s.enabled=true;s.color=Color.WHITE;(node.getComponent(Graphics)??node.addComponent(Graphics)).clear();}
export function paintModalHeader(node:Node,y?:number):void{
 const t=node.getComponent(UITransform)!;
 const header=new Node('ModalWoodTitle');header.layer=node.layer;node.addChild(header);header.setSiblingIndex(0);
 header.addComponent(UITransform).setContentSize(t.width-80,64);header.setPosition(0,y??t.height/2-55);skin(header,1);
}
export function modalButtonColor(id:string):Color{return primaryIds.has(id)?cream:ink;}
export function paintModalButton(node:Node,id:string):void{for(const old of buttons)if(!isValid(old))buttons.delete(old);skin(node,primaryIds.has(id)?3:2).color=Color.WHITE;(node.getComponent(Graphics)??node.addComponent(Graphics)).clear();buttons.add(node);}
/** Apply feedback only to the current answer; never mark a choice in the next round. */
export function markModalAnswer(node:Node|undefined,correct:boolean):void{
 if(!node||!isValid(node))return;const sprite=node.getComponent(Sprite);if(!sprite)return;
 Tween.stopAllByTarget(sprite);sprite.color=correct?new Color(181,235,173):new Color(255,190,179);
 tween(sprite).to(.25,{color:Color.WHITE}).start();
}
/** Tint artwork without moving hit boxes or drag coordinates. */
export function beginModalPress(root:Node,point:{x:number;y:number}):void{
 endModalPress();
 for(const node of buttons){
  if(!isValid(node)){buttons.delete(node);continue;}
  if(!node.activeInHierarchy||!node.isChildOf(root))continue;
  const t=node.getComponent(UITransform)!,p=t.convertToNodeSpaceAR(new Vec3(point.x,point.y,0));
  if(Math.abs(p.x)>t.width/2||Math.abs(p.y)>t.height/2)continue;
  const sprite=node.getComponent(Sprite);if(sprite){Tween.stopAllByTarget(sprite);sprite.color=new Color(226,239,190);}
  pressedCaption=node.getChildByName('Text')??undefined;
  if(pressedCaption){Tween.stopAllByTarget(pressedCaption);tween(pressedCaption).to(.08,{scale:new Vec3(.94,.94,1)}).start();}
  pressed=node;return;
 }
}
export function endModalPress():void{
 if(pressed&&isValid(pressed)){const sprite=pressed.getComponent(Sprite);if(sprite){Tween.stopAllByTarget(sprite);tween(sprite).to(.18,{color:Color.WHITE}).start();}}
 if(pressedCaption&&isValid(pressedCaption)){Tween.stopAllByTarget(pressedCaption);tween(pressedCaption).to(.18,{scale:new Vec3(1,1,1)}).start();}
 pressed=pressedCaption=undefined;
}
