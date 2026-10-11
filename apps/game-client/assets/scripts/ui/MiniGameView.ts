import {Color,Graphics,Label,Node,UITransform} from 'cc';
import {MiniGameRules} from '../world/MiniGameRules';
/** Illustrated controls; the hub routes both board taps and buttons through the same rules. */
export class MiniGameView {
    readonly node:Node;private graphics:Graphics;private signature='';private labels:Node[]=[];
    private lastState='';private feedback=0;private lastClock=0;
    constructor(parent:Node,feedback=false){this.feedback=feedback?1:0;this.node=new Node('MiniGameBoard');this.node.layer=parent.layer;parent.addChild(this.node);this.node.addComponent(UITransform).setContentSize(550,70);this.node.setPosition(0,99);this.graphics=this.node.addComponent(Graphics);}
    actionAt(game:MiniGameRules,x:number,y:number):{type:string;index:number}|undefined{
        if(game.status!=='running'||Math.abs(y)>33)return;
        if(game.id==='mg.rice-count'){
            const index=Math.round(x/86)+2;
            if(index<0||index>4||Math.abs(x-(index-2)*86)>40)return;
            if(game.data.planted.length<5&&!game.data.planted.includes(index))return {type:'plant',index};
            if(game.data.planted.length===5&&game.data.watered.length<5&&!game.data.watered.includes(index))return {type:'water',index};
        }else if(game.id==='mg.market'){
            const index=Math.round(x/170)+1;
            if(index>=0&&index<3&&Math.abs(x-(index-1)*170)<=65&&game.data.cart[index]<game.data.wants[index])return {type:'add',index};
        }else if((game.id==='mg.tug-of-war'||game.id==='mg.bamboo-dance')&&Math.abs(x)<=240)return {type:'beat',index:0};
    }
    update(game:MiniGameRules):void{
        const state=game.id+JSON.stringify(game.data),elapsed=Math.max(0,Math.min(.1,game.clock-this.lastClock));this.lastClock=game.clock;
        if(state!==this.lastState){if(this.lastState)this.feedback=this.lastState.startsWith(game.id)?1:0;this.lastState=state;}else this.feedback=Math.max(0,this.feedback-elapsed*3);
        const animated=['mg.tug-of-war','mg.bamboo-dance','mg.fishing','mg.star-lantern','mg.animal-care'].includes(game.id)||this.feedback>0;
        const signature=state+(animated?Math.floor(game.clock*12):'');if(signature===this.signature)return;this.signature=signature;
        const g=this.graphics;g.clear();this.labels.forEach(n=>n.active=false);let labelIndex=0;
        const text=(parent:Node,value:string,x:number,y:number,width=60)=>{
            let n=this.labels[labelIndex++];if(!n){n=new Node('BoardLabel');n.layer=parent.layer;parent.addChild(n);n.addComponent(UITransform);n.addComponent(Label);this.labels.push(n);}
            n.active=true;n.getComponent(UITransform)!.setContentSize(width,24);n.setPosition(x,y);const l=n.getComponent(Label)!;l.string=value;l.fontSize=16;l.lineHeight=20;l.color=new Color(44,65,43);
        };
        const rect=(x:number,y:number,w:number,h:number,color:Color)=>{g.fillColor=color;g.roundRect(x,y,w,h,4);g.fill();};
        const dot=(x:number,y:number,r:number,color:Color)=>{g.fillColor=color;g.circle(x,y,r);g.fill();};
        const green=new Color(65,145,74),gold=new Color(245,192,61),pale=new Color(223,232,190),blue=new Color(65,157,211),brown=new Color(144,100,59),d=game.data;
        rect(-254,-37,508,74,new Color(126,86,49,50));rect(-250,-33,500,70,new Color(255,245,214));
        g.strokeColor=new Color(171,131,80,160);g.lineWidth=1;g.roundRect(-250,-33,500,70,8);g.stroke();
        switch(game.id){
            case 'mg.o-an-quan':
                for(let row=0;row<2;row++)for(let col=0;col<5;col++){const index=row?4-col:6+col,x=(col-2)*72,y=row?-17:18;rect(x-31,row?-32:3,62,29,pale);for(let j=0;j<Math.min(6,d.board[index]);j++)dot(x-21+j%3*7,y-5+Math.floor(j/3)*8,2,brown);text(this.node,String(d.board[index]),x+12,y,30);}
                for(const [x,index,quan] of [[-225,11,1],[225,5,0]]){dot(x,0,29,brown);text(this.node,String(d.board[index]+(d.quan[quan]?10:0)),x,0);}
                break;
            case 'mg.rice-count':
                for(let i=0;i<5;i++){const x=(i-2)*86;rect(x-30,-28,60,16,brown);if(d.planted.includes(i)){g.strokeColor=green;g.lineWidth=3;for(let j=-1;j<=1;j++){g.moveTo(x,-15);g.quadraticCurveTo(x+j*9,-2,x+j*16,22-Math.abs(j)*5);}g.stroke();dot(x,-16,3,new Color(101,74,42));}if(d.watered.includes(i)){for(let j=0;j<3;j++)dot(x+17+j*4,3+j%2*6,2,blue);}}
                break;
            case 'mg.tug-of-war':
                rect(-220,-3,440,6,brown);for(let x=-215;x<=215;x+=14){g.strokeColor=new Color(225,192,128);g.lineWidth=1;g.moveTo(x,-3);g.lineTo(x+5,3);g.stroke();}dot(-180+d.hits*30,0,8,gold);
                for(const x of [-220,220]){const bob=Math.sin(game.clock*3)*1.5;dot(x,18+bob,9,new Color(237,191,142));rect(x-7,-13+bob,14,23,x<0?green:blue);g.strokeColor=brown;g.lineWidth=3;g.moveTo(x-4,-13+bob);g.lineTo(x-8,-28);g.moveTo(x+4,-13+bob);g.lineTo(x+10,-28);g.moveTo(x,6+bob);g.lineTo(x+(x<0?17:-17),0);g.stroke();}text(this.node,`${d.hits}/6`,0,23);break;
            case 'mg.bamboo-dance':{
                const gap=game.rhythmOpen?24:5;for(let i=0;i<3;i++)for(const side of [-1,1]){const x=-180+i*120+side*gap;rect(x,-30,7,60,green);g.strokeColor=new Color(201,217,130);g.lineWidth=2;for(const y of [-18,0,18]){g.moveTo(x,y);g.lineTo(x+7,y);}g.stroke();}const x=-120+d.hits*40;dot(x,10,8,new Color(237,191,142));rect(x-6,-10,12,16,gold);g.strokeColor=brown;g.lineWidth=3;g.moveTo(x-3,-10);g.lineTo(x-8,-22);g.moveTo(x+3,-10);g.lineTo(x+9,-17);g.stroke();break;}
            case 'mg.market':
                ['Cà rốt','Rau cải','Cà tím'].forEach((name,i)=>{const x=(i-1)*170;rect(x-65,-28,130,56,pale);text(this.node,name,x+12,14,100);text(this.node,`${d.cart[i]}/${d.wants[i]} • ${d.prices[i]} xu`,x,-12,125);g.fillColor=[new Color(234,134,55),green,new Color(126,79,161)][i];g.ellipse(x-48,12,7,12);g.fill();g.strokeColor=green;g.lineWidth=2;g.moveTo(x-48,23);g.lineTo(x-52,29);g.moveTo(x-48,23);g.lineTo(x-43,28);g.stroke();});break;
            case 'mg.star-lantern':
                for(let i=0;i<5;i++){const a=Math.PI/2+i*2*Math.PI/5,x=Math.cos(a)*38,y=Math.sin(a)*30;g.fillColor=d.placed.includes(i)?gold:pale;g.moveTo(0,0);g.lineTo(x-12,y-6);g.lineTo(x,y);g.lineTo(x+12,y-6);g.close();g.fill();g.strokeColor=brown;g.lineWidth=1;g.moveTo(0,0);g.lineTo(x,y);g.stroke();}g.strokeColor=gold;g.lineWidth=2;g.moveTo(0,-12);g.quadraticCurveTo(Math.sin(game.clock*2)*6,-22,Math.sin(game.clock*2)*8,-30);g.stroke();text(this.node,`${d.placed.length}/5 cánh`,135,0,150);break;
            case 'mg.banh-chung':
                for(let i=0;i<6;i++)rect(-115+i*28,-25,25,50,i<d.step?(i%2?gold:green):pale);
                rect(64,-26,54,54,d.step>=4?green:pale);g.strokeColor=d.step>=5?new Color(241,223,150):brown;g.lineWidth=2;for(const offset of [80,102]){g.moveTo(offset,-26);g.lineTo(offset,28);g.moveTo(64,offset-92);g.lineTo(118,offset-92);}g.stroke();text(this.node,`${d.step}/6 lớp`,182,0,110);break;
            case 'mg.dong-ho':
                d.tiles.forEach((tile:number,i:number)=>{const x=(i%3-1)*43,y=(1-Math.floor(i/3))*22;rect(x-19,y-10,38,19,tile===8?pale:new Color(116+tile*12,180,105));if(tile!==8){g.strokeColor=brown;g.lineWidth=1;g.roundRect(x-18,y-9,36,17,3);g.stroke();text(this.node,String(tile+1),x,y);}});break;
            case 'mg.fishing':
                rect(-240,-31,480,62,new Color(190,226,238));rect(-70,-31,140,62,new Color(222,241,219));
                g.strokeColor=new Color(120,187,199,160);g.lineWidth=1;
                for(let i=0;i<8;i++){const x=-200+i*58+Math.sin(game.clock+i)*3;g.moveTo(x,-23);g.quadraticCurveTo(x+8,-19,x+16,-23);g.stroke();}
                for(const x of [-224,220]){g.strokeColor=green;g.lineWidth=2;for(let j=0;j<3;j++){g.moveTo(x+j*5,-30);g.quadraticCurveTo(x+j*5-3,-10,x+j*5+2,8);g.stroke();}g.fillColor=green;g.ellipse(x-14,20,13,5);g.fill();dot(x-14,21,3,new Color(232,132,162));}
                for(let i=0;i<3;i++)if(!d.observed.includes(i)){const x=game.fishX(i),y=(i-1)*17;g.fillColor=[blue,new Color(239,150,65),new Color(171,104,196)][i];g.ellipse(x,y,12,6);g.fill();g.moveTo(x-10,y);g.lineTo(x-20,y+7);g.lineTo(x-20,y-7);g.close();g.fill();dot(x+7,y+1,2,new Color(255,255,235));dot(x+8,y+1,1,brown);}break;
            case 'mg.secret-letters':
                d.word.forEach((letter:string,i:number)=>{const x=(i-(d.word.length-1)/2)*55;rect(x-23,-24,46,48,i<d.step?gold:pale);g.strokeColor=brown;g.lineWidth=1;g.roundRect(x-21,-22,42,44,4);g.stroke();dot(x,18,2,brown);text(this.node,i<d.step?letter:'?',x,0);});break;
            case 'mg.animal-care':
                dot(-70,3+Math.sin(game.clock*2),22,gold);dot(-48,19,10,gold);dot(-44,22,2,brown);g.fillColor=new Color(220,98,48);g.moveTo(-40,19);g.lineTo(-23,14);g.lineTo(-40,10);g.close();g.fill();rect(-112,-25,33,9,brown);rect(-108,-18,25,4,blue);text(this.node,['Nước sạch','Chỗ nghỉ','Nhờ người lớn'][d.step]??'Xong',85,0,210);break;
            case 'mg.village-maze':
                for(let i=0;i<25;i++){const x=(i%5-2)*18,y=(2-Math.floor(i/5))*13,wall=[2,5,7,9,14,16,17,23].includes(i);rect(x-8,y-6,16,11,wall?brown:i===24?green:pale);if(wall){g.strokeColor=new Color(190,158,111);g.lineWidth=1;g.moveTo(x-6,y+1);g.lineTo(x+6,y+1);g.stroke();}if(i===d.cursor)dot(x,y,4,gold);if(i===24){g.strokeColor=gold;g.lineWidth=1;g.moveTo(x,y-4);g.lineTo(x,y+4);g.lineTo(x+5,y+1);g.lineTo(x,y+1);g.stroke();}}text(this.node,`Ô ${d.cursor+1} → 25`,155,0,180);break;
        }
        // Brief visual acknowledgement of state changes; no additional rules or rewards.
        if(this.feedback>0){g.strokeColor=new Color(229,166,59,Math.round(this.feedback*180));g.lineWidth=2;g.roundRect(-248,-31,496,66,8);g.stroke();}
    }
}
