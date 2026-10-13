import {Label,Node,UITransform,Sprite,SpriteFrame,Texture2D,resources,Rect} from 'cc';
import {assetResourceKey} from '../world/VisualAssets';
import {assetFrame} from '../world/TextureFrames';
/** Unicode code points keep Vietnamese letters intact; actions never run on a skip tap. */
export class DialoguePresentation {
 private label?:Label;private full='';private characters:string[]=[];private elapsed=0;private shown=0;private frame?:SpriteFrame;private generation=0;
 bind(label:Label,value:string){this.label=label;this.full=value;this.characters=Array.from(value);this.elapsed=0;this.shown=0;label.string='';}
 step(dt:number){if(!this.label?.isValid||!this.label.node.activeInHierarchy||this.shown>=this.characters.length)return;this.elapsed+=dt;const count=Math.min(this.characters.length,Math.floor(this.elapsed*48));if(count!==this.shown){this.shown=count;this.label.string=this.characters.slice(0,count).join('');}}
 reveal():boolean{if(!this.label?.isValid||this.shown>=this.characters.length)return false;this.shown=this.characters.length;this.label.string=this.full;return true;}
 portrait(parent:Node,assetId:string){const generation=++this.generation;this.frame?.destroy();this.frame=undefined;const n=new Node('DialoguePortrait');n.layer=parent.layer;parent.addChild(n);n.addComponent(UITransform).setContentSize(48,52);n.setPosition(-247,225);const sprite=n.addComponent(Sprite);sprite.sizeMode=Sprite.SizeMode.CUSTOM;
  resources.load(assetResourceKey(assetId)+'/texture',Texture2D,(error,texture)=>{if(error||generation!==this.generation||!n.isValid)return;this.frame=assetFrame(texture,assetId);const r=this.frame.rect;this.frame.rect=new Rect(r.x+r.width*.14,r.y+r.height*.01,r.width*.72,r.height*.48);sprite.spriteFrame=this.frame;const h=52;n.getComponent(UITransform)!.setContentSize(Math.min(52,h*this.frame.rect.width/this.frame.rect.height),h);});return n;
 }
 dispose(){this.generation++;this.frame?.destroy();this.frame=undefined;this.label=undefined;}
}

export function dialoguePages(value:string,limit=140):string[]{const chars=Array.from(value),pages:string[]=[];while(chars.length>limit){let cut=chars.slice(0,limit+1).lastIndexOf(' ');cut=cut<limit/2?limit:cut+1;pages.push(chars.splice(0,cut).join(''));}pages.push(chars.join(''));return pages;}
