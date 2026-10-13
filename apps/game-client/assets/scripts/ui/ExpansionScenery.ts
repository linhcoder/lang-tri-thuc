import {_decorator,Component,Graphics,Node,UITransform,Color,Label,Sprite,SpriteFrame,Rect} from 'cc';
import {toWorld,landmarkFootprints} from '../world/VillageModel';
import {VillageArt} from '../world/VillageArt';
const {ccclass}=_decorator;
/** Authored bitmap poses keep the red cloth and yellow star together. */
@ccclass('SchoolVietnamFlag')
export class SchoolVietnamFlag extends Component{
    private elapsed=0;private tick=0;private sprite?:Sprite;private frames:SpriteFrame[]=[];
    onLoad():void{this.sprite=this.node.getChildByName('FlagCloth')?.getComponent(Sprite)??undefined;}
    useAtlas(sheet:SpriteFrame):void{
        for(let i=0;i<8;i++){const frame=new SpriteFrame();frame.texture=sheet.texture;frame.rect=new Rect(i*240,0,240,160);this.frames.push(frame);}
        this.draw();
    }
    update(dt:number):void{this.elapsed+=Math.max(0,Math.min(.1,dt));this.tick+=dt;if(this.tick>=.05){this.tick=0;this.draw();}}
    private draw():void{if(this.sprite&&this.frames.length)this.sprite.spriteFrame=this.frames[Math.floor(this.elapsed*10)%8];}
    onDestroy():void{this.frames.forEach(frame=>frame.destroy());this.frames=[];}
}
function schoolyardNode(parent:Node,name:string,x:number,y:number):Node{
    const n=new Node(name);n.layer=parent.layer;parent.addChild(n);n.addComponent(UITransform).setContentSize(360,190);
    const p=toWorld({x,y});n.setPosition(p.x,p.y);return n;
}
/** Painted scenery stays below actors; the school flag is a separate animated asset. */
async function createSchoolyard(world:Node,actors:Node,assets:VillageArt):Promise<void>{
    const [pitch,flag]=await Promise.all([assets.ensureObject('schoolyard.dirt-pitch',-1),assets.ensureObject('schoolyard.vietnam-flag',-1)]);
    if(!world.isValid||!actors.isValid)return;
    if(pitch){const ground=schoolyardNode(world,'Schoolyard-DirtFootball',45,33);ground.setSiblingIndex(actors.getSiblingIndex());const body=assets.sprite(ground,'PaintedPitch',pitch,360,240);body.getComponent(UITransform)!.setAnchorPoint(.5,.5);}
    if(!flag)return;
    const pole=schoolyardNode(actors,'Schoolyard-VietnamFlag',42,32),pg=pole.addComponent(Graphics);
    pg.fillColor=new Color(122,117,98);pg.ellipse(0,0,12,5);pg.fill();pg.fillColor=new Color(215,213,187);pg.rect(-2,0,4,160);pg.fill();pg.fillColor=new Color(246,215,112);pg.circle(0,161,3.5);pg.fill();
    const cloth=assets.sprite(pole,'FlagCloth',flag,72,48);cloth.getComponent(UITransform)!.setAnchorPoint(0,1);cloth.setPosition(2,155);
    pole.addComponent(SchoolVietnamFlag).useAtlas(flag);
}
/** Text stays inside the wooden plank, above its legs and below its ropes. */
export function villageSignLabel(parent:Node,title:string,width:number,height:number,name='ZoneName'):Label{
    const n=new Node(name);n.layer=parent.layer;parent.addChild(n);
    n.addComponent(UITransform).setContentSize(width*.82,height*.42);n.setPosition(0,height*.49);
    const text=n.addComponent(Label);text.string=title;text.fontSize=height>=60?13:12;text.lineHeight=height>=60?15:14;
    text.color=new Color(255,244,205);text.overflow=Label.Overflow.SHRINK;text.enableWrapText=false;
    return text;
}
/** Painted landmarks remain decorative; interaction and navigation use the existing roots. */
export async function createExpansionScenery(actors:Node,world:Node,assets:VillageArt):Promise<void>{
    await createSchoolyard(world,actors,assets);
    const make=(name:string,x:number,y:number)=>{const n=new Node('Expansion-'+name);n.layer=actors.layer;actors.addChild(n);n.addComponent(UITransform).setContentSize(260,160);const p=toWorld({x,y});n.setPosition(p.x,p.y);return n;};
    const garden=landmarkFootprints.find(f=>f.id==='expansion.garden')!,school=landmarkFootprints.find(f=>f.id==='expansion.school')!;
    await Promise.all([{id:'garden',name:'Garden',x:garden.x,y:garden.y,width:280},{id:'riverside',name:'RiverDock',x:19,y:40,width:340},{id:'school',name:'SchoolPlay',x:school.x,y:school.y,width:360}].map(async item=>{
        const frame=await assets.ensureObject('expansion.'+item.id,-1);if(!actors.isValid||!frame)return;const root=make(item.name,item.x,item.y);assets.sprite(root,'PaintedLandmark',frame,item.width,item.width*frame.rect.height/frame.rect.width);
    }));
    const signFrame=await assets.ensureObject('scenery.wood-sign',-1);if(!world.isValid||!signFrame)return;
    for(const zone of [{id:'seasons',name:'Vườn bốn mùa',x:43,y:22},{id:'riverside',name:'Bến sông quê',x:22,y:46},{id:'playground',name:'Sân trường tuổi thơ',x:41,y:37}]){
        const n=make('Sign-'+zone.id,zone.x,zone.y);n.setParent(world);
        assets.sprite(n,'WoodenSign',signFrame,180,68);
        villageSignLabel(n,zone.name,180,68);
    }
}


