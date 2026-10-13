import {paintModalFrame,paintModalHeader,paintModalButton,modalButtonColor} from './ModalTheme';
import {DialoguePresentation,dialoguePages} from './DialoguePresentation';
import {Color,Graphics,Label,Layers,Node,UITransform,Vec3,view,game} from 'cc';
import {CmsNpc} from '../world/CmsContent';
import {loadCms,cmsApiUrl} from '../world/CmsLoader';
import {toWorld,Point} from '../world/VillageModel';
import {VillageArt} from '../world/VillageArt';
import {PlayerController} from '../player/PlayerController';

function node(parent:Node,name:string,w:number,h:number):Node{const n=new Node(name);n.layer=Layers.Enum.UI_2D;parent.addChild(n);n.addComponent(UITransform).setContentSize(w,h);return n;}
function text(parent:Node,value:string,y:number,w=540,h=80,size=22):Node{const n=node(parent,'Text',w,h);n.setPosition(0,y);const label=n.addComponent(Label);label.string=value;label.fontSize=size;label.lineHeight=size+8;label.enableWrapText=true;label.overflow=Label.Overflow.CLAMP;label.color=new Color(48,56,44);return n;}
export class CmsActors {
 private presentation=new DialoguePresentation();
 close(){this.dialog.active=false;this.pending=undefined;}
 key(code:number){if(code===13||code===32){if(!this.presentation.reveal()&&code===13&&this.buttons[0]?.node.children.some(n=>n.getComponent(Label)?.string==='Đọc tiếp'))this.buttons[0].action();}else if(code>=49&&code<=52){if(!this.presentation.reveal())this.buttons[code-49]?.action();}}
 readonly nodes:Node[]=[];readonly dialog:Node;private records:CmsNpc[]=[];private selected?:CmsNpc;private pending?:CmsNpc;private buttons:Array<{node:Node;action:()=>void}>=[];private disposed=false;
 constructor(private root:Node,private actors:Node,private art:VillageArt,private player:PlayerController,private quest:(id:string)=>void){this.dialog=node(root,'CmsDialogue',620,680);this.dialog.active=false;}
 async load():Promise<void>{if(typeof window==='undefined')return;const preview=new URLSearchParams(location.search).get('cmsPreview')==='1';const manifest=await loadCms(async()=>{let token='';if(preview){try{token=sessionStorage.getItem('ltt.parent.session')??'';}catch{}if(!token&&window.parent!==window)token=await new Promise<string>(resolve=>{const allowed=['localhost','127.0.0.1'].includes(location.hostname)?'http://127.0.0.1:35173':location.origin;const handler=(event:MessageEvent)=>{if(event.origin===allowed&&event.source===window.parent&&event.data?.type==='ltt-cms-preview'&&typeof event.data.token==='string'){clearTimeout(timer);window.removeEventListener('message',handler);resolve(event.data.token);}};const timer=setTimeout(()=>{window.removeEventListener('message',handler);resolve('');},4000);window.addEventListener('message',handler);window.parent.postMessage({type:'ltt-cms-ready'},allowed);});}const r=await fetch(cmsApiUrl()+(preview?'/admin/cms/preview':'/content/staging'),{headers:token?{Authorization:'Bearer '+token}:{},signal:AbortSignal.timeout(5000)});if(!r.ok)throw Error('CMS unavailable');return r.json();},window.localStorage,preview);if(this.disposed||!manifest)return;
  this.records=manifest.npcs.filter(n=>n.enabled);for(const record of this.records){const frame=await this.art.ensureObject(record.assetId,-1);if(this.disposed)return;if(!frame)continue;const n=node(this.actors,record.id,80,110),p=toWorld(record);n.setPosition(p.x,p.y);const h=90;this.art.sprite(n,'CmsSprite',frame,h*frame.rect.width/frame.rect.height,h);text(n,record.name,112,200,36,16);this.nodes.push(n);}this.actors.emit('cms-loaded',manifest.version);
 }
 select(world:Point):boolean{const hit=this.nodes.slice().reverse().find(n=>Math.abs(world.x-n.position.x)<38&&world.y>=n.position.y-10&&world.y<n.position.y+115);if(!hit){this.pending=undefined;return false;}const record=this.records.find(n=>n.id===hit.name)!;if(this.player.goTo(record)){this.pending=record;return true;}return false;}
 cancel(){this.pending=undefined;}
 step(dt=0){this.presentation.step(dt);if(this.pending&&!this.player.hasPath){const p=toWorld(this.pending);if(Math.hypot(p.x-this.player.position.x,p.y-this.player.position.y)<75){this.player.cancel();this.open(this.pending,this.pending.entry);}this.pending=undefined;}const size=this.root.parent!.getComponent(UITransform)!;const css=Math.max(1,view.getDevicePixelRatio()/view.getScaleX()),short=(game.canvas?.clientHeight??768)<500;const scale=Math.min(short?css:620*css/680,(size.width-24*css)/(short?720:620),(size.height-24*css)/(short?440:680));this.dialog.setScale(scale,scale,1);}
 open(record:CmsNpc,id:string,page=0){this.selected=record;const entry=record.dialogue.find(n=>n.id===id);if(!entry)return;for(const child of [...this.dialog.children])child.destroy();this.buttons=[];this.dialog.active=true;const short=(game.canvas?.clientHeight??768)<500,w=short?720:620,h=short?440:680;this.dialog.getComponent(UITransform)!.setContentSize(w,h);paintModalFrame(this.dialog);paintModalHeader(this.dialog,short?175:285);text(this.dialog,record.name,short?175:285,w-150,45,24);this.presentation.portrait(this.dialog,record.assetId).setPosition(-w/2+60,short?175:285);
  const parts=dialoguePages(entry.text),pages=parts.length,body=text(this.dialog,parts[page]+(pages>1?'\n'+(page+1)+' / '+pages:''),short?85:185,w-60,short?110:120,24);this.presentation.bind(body.getComponent(Label)!,body.getComponent(Label)!.string);
  const button=(caption:string,x:number,y:number,width:number,action:()=>void)=>{const height=short?56:76,n=node(this.dialog,'Choice',width,height);n.setPosition(x,y);paintModalButton(n,'Secondary');const label=text(n,caption,0,width-16,height-8,20).getComponent(Label)!;label.color=modalButtonColor('Secondary');label.overflow=Label.Overflow.SHRINK;this.buttons.push({node:n,action});};
  const options=page<pages-1?[{label:'Đọc tiếp',action:()=>this.open(record,id,page+1)}]:entry.choices.map(c=>({label:c.label,action:()=>{if(c.questId){this.dialog.active=false;this.quest(c.questId);}else this.open(record,c.next);}}));
  if(page===pages-1&&!entry.choices.length&&record.questId)options.push({label:'Xem nhiệm vụ liên kết',action:()=>{this.dialog.active=false;this.quest(record.questId);}});
  options.forEach((choice,i)=>button(choice.label,short?(i%2?170:-170):0,short?-15-Math.floor(i/2)*66:65-i*88,short?320:540,choice.action));button('Đóng',0,short?-175:-285,short?240:540,()=>this.close());
 }

 handle(point:Point){for(const b of this.buttons){const p=b.node.getComponent(UITransform)!.convertToNodeSpaceAR(new Vec3(point.x,point.y,0));if(Math.abs(p.x)<b.node.getComponent(UITransform)!.width/2&&Math.abs(p.y)<b.node.getComponent(UITransform)!.height/2){this.presentation.reveal();b.action();return;}}this.presentation.reveal();}
 dispose(){this.presentation.dispose();this.disposed=true;this.nodes.forEach(n=>n.destroy());this.dialog.destroy();}
}
