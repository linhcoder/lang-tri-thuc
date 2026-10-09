import {Color,Graphics,Label,Node,UITransform} from 'cc';
import {MiniGameRules} from '../world/MiniGameRules';
/** Read-only illustration of authoritative rules. Actions remain in the large buttons. */
export class MiniGameView {
    readonly node:Node;private graphics:Graphics;private signature='';private labels:Node[]=[];
    constructor(parent:Node){this.node=new Node('MiniGameBoard');this.node.layer=parent.layer;parent.addChild(this.node);this.node.addComponent(UITransform).setContentSize(550,70);this.node.setPosition(0,99);this.graphics=this.node.addComponent(Graphics);}
    update(game:MiniGameRules):void{
        const animated=['mg.tug-of-war','mg.bamboo-dance','mg.fishing'].includes(game.id);
        const signature=JSON.stringify(game.data)+(animated?Math.floor(game.clock*12):'');if(signature===this.signature)return;this.signature=signature;
        const g=this.graphics;g.clear();this.labels.forEach(n=>n.active=false);let labelIndex=0;
        const text=(parent:Node,value:string,x:number,y:number,width=60)=>{
            let n=this.labels[labelIndex++];if(!n){n=new Node('BoardLabel');n.layer=parent.layer;parent.addChild(n);n.addComponent(UITransform);n.addComponent(Label);this.labels.push(n);}
            n.active=true;n.getComponent(UITransform)!.setContentSize(width,24);n.setPosition(x,y);const l=n.getComponent(Label)!;l.string=value;l.fontSize=16;l.lineHeight=20;l.color=new Color(44,65,43);
        };
        const rect=(x:number,y:number,w:number,h:number,color:Color)=>{g.fillColor=color;g.roundRect(x,y,w,h,4);g.fill();};
        const dot=(x:number,y:number,r:number,color:Color)=>{g.fillColor=color;g.circle(x,y,r);g.fill();};
        const green=new Color(65,145,74),gold=new Color(245,192,61),pale=new Color(223,232,190),blue=new Color(65,157,211),brown=new Color(144,100,59),d=game.data;
        switch(game.id){
            case 'mg.o-an-quan':
                for(let row=0;row<2;row++)for(let col=0;col<5;col++){const index=row?4-col:6+col,x=(col-2)*72;rect(x-31,row?-32:3,62,29,pale);text(this.node,String(d.board[index]),x,row?-17:18);}
                for(const [x,index,quan] of [[-225,11,1],[225,5,0]]){dot(x,0,29,brown);text(this.node,String(d.board[index]+(d.quan[quan]?10:0)),x,0);}
                break;
            case 'mg.rice-count':
                for(let i=0;i<5;i++){const x=(i-2)*86;rect(x-30,-28,60,16,brown);if(d.planted.includes(i)){g.strokeColor=green;g.lineWidth=4;g.moveTo(x,-15);g.lineTo(x,25);g.moveTo(x,2);g.lineTo(x-14,15);g.moveTo(x,10);g.lineTo(x+14,24);g.stroke();}if(d.watered.includes(i))dot(x+21,5,5,blue);}
                break;
            case 'mg.tug-of-war':
                rect(-220,-3,440,6,brown);dot(-180+d.hits*30,0,12,gold);for(const x of [-220,220]){dot(x,15,10,green);rect(x-5,-20,10,27,green);}text(this.node,`${d.hits}/6`,0,23);break;
            case 'mg.bamboo-dance':{
                const gap=game.rhythmOpen?24:5;for(let i=0;i<3;i++){rect(-180+i*120-gap,-30,7,60,brown);rect(-180+i*120+gap,-30,7,60,brown);}dot(-120+d.hits*40,0,10,gold);break;}
            case 'mg.market':
                ['Cà rốt','Rau cải','Cà tím'].forEach((name,i)=>{const x=(i-1)*170;rect(x-65,-28,130,56,pale);text(this.node,name,x,14,125);text(this.node,`${d.cart[i]}/${d.wants[i]} • ${d.prices[i]} xu`,x,-12,125);});break;
            case 'mg.star-lantern':
                for(let i=0;i<5;i++){const a=Math.PI/2+i*2*Math.PI/5,x=Math.cos(a)*38,y=Math.sin(a)*30;g.fillColor=d.placed.includes(i)?gold:pale;g.moveTo(0,0);g.lineTo(x-12,y-6);g.lineTo(x,y);g.lineTo(x+12,y-6);g.close();g.fill();}text(this.node,`${d.placed.length}/5 cánh`,135,0,150);break;
            case 'mg.banh-chung':
                for(let i=0;i<6;i++)rect(-90+i*30,-25,27,50,i<d.step?(i%2?gold:green):pale);text(this.node,`${d.step}/6 lớp`,170,0,130);break;
            case 'mg.dong-ho':
                d.tiles.forEach((tile:number,i:number)=>{const x=(i%3-1)*43,y=(1-Math.floor(i/3))*22;rect(x-19,y-10,38,19,tile===8?pale:new Color(116+tile*12,180,105));if(tile!==8)text(this.node,String(tile+1),x,y);});break;
            case 'mg.fishing':
                rect(-240,-31,480,62,new Color(190,226,238));rect(-70,-31,140,62,new Color(222,241,219));
                for(let i=0;i<3;i++)if(!d.observed.includes(i)){const x=game.fishX(i),y=(i-1)*17;g.fillColor=[blue,new Color(239,150,65),new Color(171,104,196)][i];g.ellipse(x,y,12,6);g.fill();g.moveTo(x-10,y);g.lineTo(x-20,y+7);g.lineTo(x-20,y-7);g.close();g.fill();}break;
            case 'mg.secret-letters':
                d.word.forEach((letter:string,i:number)=>{const x=(i-(d.word.length-1)/2)*55;rect(x-23,-24,46,48,i<d.step?gold:pale);text(this.node,i<d.step?letter:'?',x,0);});break;
            case 'mg.animal-care':
                dot(-70,3,22,gold);dot(-48,19,10,gold);g.fillColor=new Color(220,98,48);g.moveTo(-40,19);g.lineTo(-23,14);g.lineTo(-40,10);g.close();g.fill();text(this.node,['Nước sạch','Chỗ nghỉ','Nhờ người lớn'][d.step]??'Xong',85,0,210);break;
            case 'mg.village-maze':
                for(let i=0;i<25;i++){const x=(i%5-2)*18,y=(2-Math.floor(i/5))*13,wall=[2,5,7,9,14,16,17,23].includes(i);rect(x-8,y-6,16,11,wall?brown:i===24?green:pale);if(i===d.cursor)dot(x,y,4,gold);}text(this.node,`Ô ${d.cursor+1} → 25`,155,0,180);break;
        }
    }
}
