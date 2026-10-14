import {Node,Graphics,Color,Label,UITransform} from 'cc';
import {toWorld,zoneSpawns} from '../world/VillageModel';
import {journeyRegions} from '../world/LevelJourney';
import {VillageArt} from '../world/VillageArt';

/** Distinct, code-drawn landmarks for the four new walkable regions. */
export function createJourneyScenery(world:Node):void{
    for(const id of ['forest','science','culture','island'] as const){
        const n=new Node('JourneyLandmark-'+id);n.layer=world.layer;world.addChild(n);n.addComponent(UITransform).setContentSize(300,220);
        const spawn=toWorld(zoneSpawns[id]);n.setPosition(spawn.x,spawn.y+95);const g=n.addComponent(Graphics);
        const color=(hex:string)=>new Color(hex);
        const rect=(x:number,y:number,w:number,h:number,hex:string)=>{g.fillColor=color(hex);g.roundRect(x,y,w,h,8);g.fill();};
        const circle=(x:number,y:number,r:number,hex:string)=>{g.fillColor=color(hex);g.circle(x,y,r);g.fill();};
        const line=(x:number,y:number,a:number,b:number,hex:string,width=5)=>{g.strokeColor=color(hex);g.lineWidth=width;g.moveTo(x,y);g.lineTo(a,b);g.stroke();};
        if(id==='forest'){
            for(const [x,y] of [[-95,10],[0,50],[95,10]]){rect(x-7,y,14,75,'#815839');circle(x,y+76,38,'#477d45');circle(x-18,y+62,25,'#598f48');circle(x+19,y+66,26,'#679952');}
            rect(-48,-12,96,42,'#d5b075');circle(-16,7,6,'#eadcb6');circle(15,7,6,'#eadcb6');
        }else if(id==='science'){
            rect(-105,0,145,105,'#e3c08c');g.fillColor=color('#6585a4');g.moveTo(-120,105);g.lineTo(-33,161);g.lineTo(54,105);g.close();g.fill();
            rect(-80,30,35,42,'#98c9d8');rect(-20,5,40,75,'#795740');line(87,54,65,0,'#765942');line(87,54,110,0,'#765942');line(66,68,126,100,'#527784',17);circle(129,102,12,'#c4e2da');
        }else if(id==='culture'){
            rect(-120,0,240,24,'#a98553');rect(-95,22,18,105,'#b85949');rect(77,22,18,105,'#b85949');
            g.fillColor=color('#b85e45');g.moveTo(-140,115);g.quadraticCurveTo(0,170,140,115);g.lineTo(108,139);g.quadraticCurveTo(0,188,-108,139);g.close();g.fill();
            for(const x of [-55,0,55]){line(x,120,x,91,'#805e3b',2);circle(x,80,13,'#e6b75a');}rect(-56,30,112,43,'#c89057');
        }else{
            g.fillColor=color('#8dbdc4');g.ellipse(0,-14,155,35);g.fill();g.fillColor=color('#c5dba1');g.ellipse(0,0,125,30);g.fill();
            rect(-75,10,150,115,'#e8d8a7');g.fillColor=color('#638973');g.moveTo(-98,120);g.lineTo(0,176);g.lineTo(98,120);g.close();g.fill();
            rect(-20,10,40,72,'#806247');rect(-57,52,25,37,'#90c7c6');rect(32,52,25,37,'#90c7c6');circle(0,114,17,'#edc25a');
        }
        const sign=new Node('JourneySign-'+id);sign.layer=world.layer;world.addChild(sign);sign.addComponent(UITransform).setContentSize(280,52);sign.setPosition(spawn.x,spawn.y-35);
        const bg=sign.addComponent(Graphics);bg.fillColor=color('#72533b');bg.roundRect(-140,-26,280,52,9);bg.fill();
        const caption=new Node('Text');caption.layer=world.layer;sign.addChild(caption);caption.addComponent(UITransform).setContentSize(270,48);
        const label=caption.addComponent(Label),region=journeyRegions.find(r=>r.id===id)!;label.string=region.name+' · Lv.'+region.level;label.fontSize=19;label.lineHeight=24;label.color=color('#fff2ce');
    }
}

/** Reuse the village's painted landmarks so new regions share its visual style. */
export async function decorateJourneyScenery(world:Node,art:VillageArt):Promise<void>{
    const [tree,house,temple]=await Promise.all([art.ensureObject('banyan',2),art.ensureObject('house',1),art.ensureObject('dinh',0)]);
    if(!world.isValid)return;
    for(const id of ['forest','science','culture','island'] as const){
        const node=world.getChildByName('JourneyLandmark-'+id),frame=id==='forest'?tree:id==='culture'?temple:house;
        if(!node||!frame)continue;const g=node.getComponent(Graphics)!;g.clear();
        if(id==='forest'){
            for(const [i,x,y] of [[0,-105,-15],[1,105,-15],[2,0,55]])art.sprite(node,'PaintedTree-'+i,frame,210,180).setPosition(x,y);
        }else{
            if(id==='island'){g.fillColor=new Color('#8dbdc4');g.ellipse(0,-14,155,35);g.fill();g.fillColor=new Color('#c5dba1');g.ellipse(0,0,125,30);g.fill();}
            art.sprite(node,'PaintedLandmark',frame,id==='culture'?350:280,id==='culture'?210:240);
            const emblem=new Node('RegionEmblem');emblem.layer=world.layer;node.addChild(emblem);emblem.addComponent(UITransform).setContentSize(120,120);const symbol=emblem.addComponent(Graphics);
            if(id==='science'){
                emblem.setPosition(145,10);symbol.strokeColor=new Color('#765942');symbol.lineWidth=5;
                for(const x of [-20,20]){symbol.moveTo(0,44);symbol.lineTo(x,0);symbol.stroke();}
                symbol.strokeColor=new Color('#527784');symbol.lineWidth=17;symbol.moveTo(-18,60);symbol.lineTo(42,92);symbol.stroke();symbol.fillColor=new Color('#c4e2da');symbol.circle(45,94,12);symbol.fill();
            }else if(id==='island'){
                emblem.setPosition(0,85);symbol.fillColor=new Color('#806247');symbol.roundRect(-28,-19,56,38,5);symbol.fill();symbol.fillColor=new Color('#fff2ce');symbol.rect(-23,-14,20,28);symbol.rect(3,-14,20,28);symbol.fill();
            }else{
                emblem.setPosition(0,15);symbol.fillColor=new Color('#e6b75a');for(const x of [-85,85]){symbol.circle(x,95,12);symbol.fill();}
            }
        }
    }
}
