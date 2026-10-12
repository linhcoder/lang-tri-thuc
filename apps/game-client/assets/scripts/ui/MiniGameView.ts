import {Color,Graphics,Label,Node,UITransform} from 'cc';
import {MiniGameRules} from '../world/MiniGameRules';
import {drawMaze,mazeActionAt} from './MazeBoard';
/** Illustrated controls; the hub routes both board taps and buttons through the same rules. */
export class MiniGameView {
    readonly node:Node;private graphics:Graphics;private signature='';private labels:Node[]=[];
    private lastState='';private feedback=0;private lastClock=0;
    private selectedGame?:MiniGameRules;private selectedPit=-1;private selectedLetter=-1;
    constructor(parent:Node,feedback=false){this.feedback=feedback?1:0;this.node=new Node('MiniGameBoard');this.node.layer=parent.layer;parent.addChild(this.node);this.node.addComponent(UITransform).setContentSize(550,70);this.node.setPosition(0,99);this.graphics=this.node.addComponent(Graphics);}
    actionAt(game:MiniGameRules,x:number,y:number):{type:string;index:number}|undefined{
        if(game.status!=='running'||!Number.isFinite(x)||!Number.isFinite(y))return;
        if(game.id==='mg.village-maze')return mazeActionAt(game,x,y);
        if(Math.abs(y)>33)return;
        this.resetSelection(game);
        if(game.id==='mg.o-an-quan'){
            const col=Math.round(x/72)+2,index=4-col;
            if(y>=-32&&y<=-3&&col>=0&&col<5&&Math.abs(x-(col-2)*72)<=31&&game.data.board[index]>0){this.selectedPit=index;this.signature='';return {type:'pit',index};}
        }else if(game.id==='mg.secret-letters'){
            const index=Math.round(x/50+(game.data.grid.length-1)/2);
            if(y>=-29&&y<=11&&index>=0&&index<game.data.grid.length&&Math.abs(x-(index-(game.data.grid.length-1)/2)*50)<=23){this.selectedLetter=index;this.signature='';return {type:'letter',index};}
        }else if(game.id==='mg.rice-count'){
            const index=Math.round(x/86)+2;
            if(index<0||index>4||Math.abs(x-(index-2)*86)>40)return;
            if(game.data.planted.length<5&&!game.data.planted.includes(index))return {type:'plant',index};
            if(game.data.planted.length===5&&game.data.watered.length<5&&!game.data.watered.includes(index))return {type:'water',index};
        }else if(game.id==='mg.market'){
            const index=Math.round(x/170)+1;
            if(index>=0&&index<3&&Math.abs(x-(index-1)*170)<=65&&game.data.cart[index]<game.data.wants[index])return {type:'add',index};
        }else if(game.id==='mg.banh-chung'){
            const index=[3,0,4,1,5,2][Math.round((x+195)/78)];
            if(index!==undefined&&Math.abs(x-(Math.round((x+195)/78)-2.5)*78)<=35)return {type:'layer',index};
        }else if(game.id==='mg.fishing'&&game.data.caught<0){
            const hits=[0,1,2].filter(i=>!game.data.observed.includes(i)&&Math.abs(x-game.fishX(i))<=25&&Math.abs(y-(i-1)*17)<=12);
            hits.sort((a,b)=>Math.hypot(x-game.fishX(a),y-(a-1)*17)-Math.hypot(x-game.fishX(b),y-(b-1)*17));
            if(hits.length)return {type:'fish',index:hits[0]};
        }else if((game.id==='mg.tug-of-war'||game.id==='mg.bamboo-dance')&&Math.abs(x)<=240)return {type:'beat',index:0};
    }
    private resetSelection(game:MiniGameRules):void{if(this.selectedGame!==game){this.selectedGame=game;this.selectedPit=-1;this.selectedLetter=-1;this.signature='';}}
    update(game:MiniGameRules):void{
        this.resetSelection(game);
        const maze=game.id==='mg.village-maze';
        this.node.setPosition(0,maze?10:99);this.node.getComponent(UITransform)!.setContentSize(maze?300:550,maze?250:70);
        const state=game.id+JSON.stringify(game.data),elapsed=Math.max(0,Math.min(.1,game.clock-this.lastClock));this.lastClock=game.clock;
        if(state!==this.lastState){if(this.lastState)this.feedback=this.lastState.startsWith(game.id)?1:0;this.lastState=state;}else this.feedback=Math.max(0,this.feedback-elapsed*3);
        const animated=['mg.tug-of-war','mg.bamboo-dance','mg.fishing','mg.star-lantern','mg.animal-care'].includes(game.id)||this.feedback>0;
        const signature=state+game.status+(animated?Math.floor(game.clock*12):'');if(signature===this.signature)return;this.signature=signature;
        const g=this.graphics;g.clear();this.labels.forEach(n=>n.active=false);let labelIndex=0;
        const text=(parent:Node,value:string,x:number,y:number,width=60)=>{
            let n=this.labels[labelIndex++];if(!n){n=new Node('BoardLabel');n.layer=parent.layer;parent.addChild(n);n.addComponent(UITransform);n.addComponent(Label);this.labels.push(n);}
            n.active=true;n.getComponent(UITransform)!.setContentSize(width,24);n.setPosition(x,y);const l=n.getComponent(Label)!;l.string=value;l.fontSize=16;l.lineHeight=20;l.color=new Color(44,65,43);
        };
        const rect=(x:number,y:number,w:number,h:number,color:Color)=>{g.fillColor=color;g.roundRect(x,y,w,h,4);g.fill();};
        const dot=(x:number,y:number,r:number,color:Color)=>{g.fillColor=color;g.circle(x,y,r);g.fill();};
        const green=new Color(65,145,74),gold=new Color(245,192,61),pale=new Color(223,232,190),blue=new Color(65,157,211),brown=new Color(144,100,59),d=game.data;
        if(maze){drawMaze(g,game,(value,x,y,width)=>text(this.node,value,x,y,width));return;}
        rect(-254,-37,508,74,new Color(126,86,49,50));rect(-250,-33,500,70,new Color(255,245,214));
        g.strokeColor=new Color(171,131,80,160);g.lineWidth=1;g.roundRect(-250,-33,500,70,8);g.stroke();
        switch(game.id){
            case 'mg.o-an-quan':
                for(let row=0;row<2;row++)for(let col=0;col<5;col++){const index=row?4-col:6+col,x=(col-2)*72,y=row?-17:18;rect(x-31,row?-32:3,62,29,row?(d.board[index]>0?new Color(194,224,173):new Color(233,229,216)):pale);if(row){g.strokeColor=index===this.selectedPit?gold:green;g.lineWidth=index===this.selectedPit?3:1;g.roundRect(x-30,-31,60,27,4);g.stroke();}for(let j=0;j<Math.min(6,d.board[index]);j++)dot(x-21+j%3*7,y-5+Math.floor(j/3)*8,2,brown);text(this.node,String(d.board[index]),x+12,y,30);}
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
                [3,0,4,1,5,2].forEach((layer,i)=>{const x=(i-2.5)*78,done=layer<d.step;rect(x-35,-28,70,56,done?new Color(194,224,173):pale);rect(x-13,0,26,20,[green,new Color(255,250,227),gold,new Color(198,120,87),new Color(255,250,227),green][layer]);if(layer===5){g.strokeColor=brown;g.lineWidth=2;g.moveTo(x,0);g.lineTo(x,20);g.moveTo(x-13,10);g.lineTo(x+13,10);g.stroke();}text(this.node,['Lá','Gạo','Đậu','Nhân','Gạo phủ','Gấp lá'][layer],x,-15,70);if(done)text(this.node,'✓',x+23,15,22);});break;
            case 'mg.dong-ho':
                if(d.pictureMode==='matching')text(this.node,`${d.placed.length}/${d.pictureCols*d.pictureRows} miếng tranh`,0,0,240);
                else d.tiles?.forEach((tile:number,i:number)=>{const x=(i%3-1)*43,y=(1-Math.floor(i/3))*22;rect(x-19,y-10,38,19,tile===8?pale:new Color(116+tile*12,180,105));if(tile!==8){g.strokeColor=brown;g.lineWidth=1;g.roundRect(x-18,y-9,36,17,3);g.stroke();text(this.node,String(tile+1),x,y);}});break;
            case 'mg.fishing':
                rect(-240,-31,480,62,new Color(190,226,238));rect(-70,-31,140,62,new Color(222,241,219));
                g.strokeColor=new Color(120,187,199,160);g.lineWidth=1;
                for(let i=0;i<8;i++){const x=-200+i*58+Math.sin(game.clock+i)*3;g.moveTo(x,-23);g.quadraticCurveTo(x+8,-19,x+16,-23);g.stroke();}
                for(const x of [-224,220]){g.strokeColor=green;g.lineWidth=2;for(let j=0;j<3;j++){g.moveTo(x+j*5,-30);g.quadraticCurveTo(x+j*5-3,-10,x+j*5+2,8);g.stroke();}g.fillColor=green;g.ellipse(x-14,20,13,5);g.fill();dot(x-14,21,3,new Color(232,132,162));}
                for(let i=0;i<3;i++)if(!d.observed.includes(i)&&(d.caught<0||d.caught===i)){const caught=d.caught===i,x=caught?0:game.fishX(i),y=caught?0:(i-1)*17;g.fillColor=[blue,new Color(239,150,65),new Color(171,104,196)][i];g.ellipse(x,y,caught?24:16,caught?12:8);g.fill();g.moveTo(x-(caught?20:14),y);g.lineTo(x-(caught?36:25),y+(caught?13:9));g.lineTo(x-(caught?36:25),y-(caught?13:9));g.close();g.fill();dot(x+(caught?14:9),y+2,3,new Color(255,255,235));dot(x+(caught?15:10),y+2,1,brown);if(caught)text(this.node,'Quan sát màu rồi thả',140,0,205);}
                if(d.caught<0){g.strokeColor=green;g.lineWidth=2;g.roundRect(-70,-30,140,60,5);g.stroke();}break;
            case 'mg.secret-letters':
                d.word.forEach((letter:string,i:number)=>{const x=(i-(d.word.length-1)/2)*30;text(this.node,i<d.step?letter:'?',x,25,28);});
                d.grid.forEach((letter:string,i:number)=>{const x=(i-(d.grid.length-1)/2)*50,done=d.word.slice(0,d.step).includes(letter);rect(x-23,-29,46,40,done?new Color(194,224,173):pale);g.strokeColor=i===this.selectedLetter?gold:brown;g.lineWidth=i===this.selectedLetter?3:1;g.roundRect(x-22,-28,44,38,4);g.stroke();text(this.node,letter,x,-8,40);});break;
            case 'mg.animal-care':
                if(d.step===0){dot(-70,3+Math.sin(game.clock*2),22,gold);dot(-48,19,10,gold);dot(-44,22,2,brown);g.fillColor=new Color(220,98,48);g.moveTo(-40,19);g.lineTo(-23,14);g.lineTo(-40,10);g.close();g.fill();}
                else if(d.step===1){rect(-103,-9,62,28,brown);dot(-37,17,16,brown);dot(-40,29,9,new Color(102,73,49));dot(-30,21,2,new Color(255,245,214));dot(-19,14,4,new Color(69,53,41));for(const x of [-92,-53])rect(x,-26,9,20,brown);g.strokeColor=brown;g.lineWidth=5;g.moveTo(-103,9);g.quadraticCurveTo(-121,15,-113,27);g.stroke();}
                else {dot(-76,0,23,new Color(150,166,161));dot(-53,17,15,new Color(150,166,161));dot(-62,30,6,new Color(150,166,161));dot(-44,30,6,new Color(150,166,161));text(this.node,'?',-75,0,32);dot(143,20,9,new Color(237,191,142));rect(136,-10,14,21,blue);g.strokeColor=brown;g.lineWidth=3;for(const side of [-1,1]){g.moveTo(143+side*3,-9);g.lineTo(143+side*8,-26);}g.stroke();}
                text(this.node,['Gà trong làng','Chó trong làng','Con vật lạ'][d.step]??'Hoàn thành',d.step<2?100:50,0,d.step<2?220:120);break;
        }
        // Brief visual acknowledgement of state changes; no additional rules or rewards.
        if(this.feedback>0){g.strokeColor=new Color(229,166,59,Math.round(this.feedback*180));g.lineWidth=2;g.roundRect(-248,-31,496,66,8);g.stroke();}
    }
}
