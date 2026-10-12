import {Node,UITransform,Graphics,Color,Label} from 'cc';
import {toWorld} from '../world/VillageModel';
/** Village-native vector scenery; all decoration remains outside navigation blockers. */
export function createExpansionScenery(actors:Node,world:Node):void{
    const make=(name:string,x:number,y:number)=>{const n=new Node('Expansion-'+name);n.layer=actors.layer;actors.addChild(n);n.addComponent(UITransform).setContentSize(260,160);const p=toWorld({x,y});n.setPosition(p.x,p.y);return n;};
    const garden=make('Garden',40,12),g=garden.addComponent(Graphics);
    g.fillColor=new Color(139,99,57);g.roundRect(-135,0,270,18,6);g.fill();
    for(let i=0;i<7;i++){const x=-108+i*36;g.fillColor=new Color(81,135,69);g.rect(x-2,10,4,40+(i%2)*12);g.fill();g.ellipse(x-10,28,12,6);g.fill();g.ellipse(x+10,40,12,6);g.fill();g.fillColor=[new Color(225,127,143),new Color(237,187,78),new Color(155,126,187)][i%3];for(let k=0;k<5;k++){const a=k*Math.PI*2/5;g.circle(x+Math.cos(a)*8,55+(i%2)*12+Math.sin(a)*8,6);g.fill();}g.fillColor=new Color(255,224,114);g.circle(x,55+(i%2)*12,4);g.fill();}
    const tree=make('FruitTree',44,20),t=tree.addComponent(Graphics);t.fillColor=new Color(132,91,55);t.roundRect(-10,0,20,90,7);t.fill();t.fillColor=new Color(94,143,70);for(const [x,y] of [[-35,75],[30,82],[0,112]]){t.circle(x,y,40);t.fill();}t.fillColor=new Color(232,130,64);for(const [x,y] of [[-35,82],[22,90],[0,120]]){t.circle(x,y,8);t.fill();}
    const dock=make('RiverDock',19,40),d=dock.addComponent(Graphics);d.fillColor=new Color(168,121,67);for(let i=0;i<7;i++){d.roundRect(-90+i*25,0,23,52,3);d.fill();}d.strokeColor=new Color(119,87,53);d.lineWidth=5;for(const x of [-87,84]){d.moveTo(x,0);d.lineTo(x,74);d.stroke();}d.moveTo(-87, 60);d.lineTo(84,60);d.stroke();
    const boat=make('Boat',16,42),b=boat.addComponent(Graphics);b.fillColor=new Color(119,78,42);b.moveTo(-58,5);b.lineTo(65,5);b.lineTo(38,-20);b.lineTo(-38,-20);b.close();b.fill();b.fillColor=new Color(161,111,58);b.rect(-3,5,6,80);b.fill();b.fillColor=new Color(255,237,186);b.moveTo(5,80);b.lineTo(5,12);b.lineTo(55,12);b.close();b.fill();
    const school=make('SchoolPlay',40,30),s=school.addComponent(Graphics);s.fillColor=new Color(183,127,79);s.roundRect(-105,0,210,18,5);s.fill();s.fillColor=new Color(237,208,150);s.roundRect(-97,18,194,95,8);s.fill();s.fillColor=new Color(156,94,55);s.moveTo(-112,107);s.lineTo(0,152);s.lineTo(112,107);s.close();s.fill();s.fillColor=new Color(82,126,96);s.roundRect(-66,40,132,52,5);s.fill();s.strokeColor=new Color(255,240,196);s.lineWidth=3;for(const x of [-35,0,35]){s.circle(x,66,10);s.stroke();}
    for(const zone of [{id:'seasons',name:'Vườn bốn mùa',x:40,y:16},{id:'riverside',name:'Bến sông quê',x:20,y:40},{id:'playground',name:'Sân trường tuổi thơ',x:40,y:33}]){
        const n=make('Sign-'+zone.id,zone.x,zone.y);n.setParent(world);const art=n.addComponent(Graphics);art.fillColor=new Color(128,88,49);art.rect(-3,0,6,55);art.fill();art.fillColor=new Color(252,236,192);art.roundRect(-94,46,188,38,7);art.fill();art.strokeColor=new Color(165,121,66);art.lineWidth=2;art.roundRect(-94,46,188,38,7);art.stroke();const label=new Node('ZoneName');label.layer=n.layer;n.addChild(label);label.addComponent(UITransform).setContentSize(178,34);label.setPosition(0,65);const text=label.addComponent(Label);text.string=zone.name;text.fontSize=16;text.lineHeight=21;text.color=new Color(63,82,48);text.overflow=Label.Overflow.SHRINK;
    }
}


