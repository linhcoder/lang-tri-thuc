import {Color,Graphics} from 'cc';
import {MiniGameRules} from '../world/MiniGameRules';

const walls=new Set([2,5,7,9,14,16,17,23]);
export function mazeActionAt(game:MiniGameRules,x:number,y:number):{type:string;index:number}|undefined{
    if(game.status!=='running'||!Number.isFinite(x)||!Number.isFinite(y))return;
    const col=Math.round(x/50)+2,row=2-Math.round(y/46),cell=row*5+col;
    if(col<0||col>4||row<0||row>4||Math.abs(x-(col-2)*50)>23||Math.abs(y-(2-row)*46)>21||walls.has(cell))return;
    const cursor=game.data.cursor;
    if(Math.abs(col-cursor%5)+Math.abs(row-Math.floor(cursor/5))!==1)return;
    const index=[-5,1,5,-1].indexOf(cell-cursor);
    return index>=0?{type:'move',index}:undefined;
}

/** Large, readable village paths. Highlighting shows legal adjacent moves, never solves the maze. */
export function drawMaze(g:Graphics,game:MiniGameRules,text:(value:string,x:number,y:number,width?:number)=>void):void{
    const cursor=game.data.cursor;
    g.fillColor=new Color(156,109,62,90);g.roundRect(-128,-119,256,238,12);g.fill();
    g.fillColor=new Color(244,235,203);g.roundRect(-125,-116,250,232,10);g.fill();
    for(let i=0;i<25;i++){
        const x=(i%5-2)*50,y=(2-Math.floor(i/5))*46,wall=walls.has(i),reachable=!!mazeActionAt(game,x,y);
        g.fillColor=wall?new Color(132,94,63):reachable?new Color(189,224,157):i===24?new Color(102,179,111):new Color(230,215,176);
        g.roundRect(x-23,y-21,46,42,6);g.fill();
        g.strokeColor=reachable?new Color(61,127,55):new Color(180,157,109);g.lineWidth=reachable?2:1;g.roundRect(x-22,y-20,44,40,5);g.stroke();
        if(wall){
            g.strokeColor=new Color(225,195,145);g.lineWidth=3;
            for(const dy of [-7,7]){g.moveTo(x-18,y+dy);g.lineTo(x+18,y+dy);}
            for(const dx of [-13,0,13]){g.moveTo(x+dx,y-17);g.lineTo(x+dx,y+17);}g.stroke();
        }else if(i===24){
            g.fillColor=new Color(248,199,57);g.moveTo(x-5,y+16);g.lineTo(x+16,y+9);g.lineTo(x-5,y+3);g.close();g.fill();
            g.strokeColor=new Color(80,93,52);g.lineWidth=3;g.moveTo(x-5,y+16);g.lineTo(x-5,y-8);g.stroke();text('ĐÍCH',x,y-13,44);
        }else if(i!==cursor){text(String(i+1),x,y,36);}
        if(i===cursor){
            g.fillColor=new Color(85,130,62,60);g.ellipse(x,y-13,13,4);g.fill();
            g.fillColor=new Color(50,128,183);g.roundRect(x-8,y-12,16,17,4);g.fill();
            g.fillColor=new Color(244,194,139);g.circle(x,y+10,9);g.fill();
            g.fillColor=new Color(86,59,40);g.arc(x,y+11,9,0,Math.PI,false);g.fill();
            g.strokeColor=new Color(89,68,46);g.lineWidth=3;g.moveTo(x-4,y-12);g.lineTo(x-7,y-18);g.moveTo(x+4,y-12);g.lineTo(x+7,y-18);g.stroke();
        }
    }
}
