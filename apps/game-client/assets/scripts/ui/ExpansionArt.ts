import {Color,Graphics} from 'cc';
export function paintExpansionSymbol(g:Graphics,kind:string,count=1):void{
    const fill=(hex:string)=>{g.fillColor=new Color().fromHEX(hex);};
    fill('#dcebd5');g.roundRect(-230,-58,460,116,18);g.fill();
    if(kind==='fish'){for(let i=0;i<count;i++){const x=(i%4-1.5)*95,y=28-Math.floor(i/4)*37;fill(['#e6a349','#67a9b0','#b184b1'][i%3]);g.ellipse(x,y,23,12);g.fill();g.moveTo(x-18,y);g.lineTo(x-34,y+12);g.lineTo(x-34,y-12);g.close();g.fill();fill('#303d35');g.circle(x+12,y+3,2);g.fill();}return;}
    if(kind==='boat'){fill('#aa743e');g.moveTo(-80,-12);g.lineTo(80,-12);g.lineTo(55,-42);g.lineTo(-55,-42);g.close();g.fill();if(count>1){fill('#8e643d');g.rect(-3,-12,6,63);g.fill();}if(count>2){fill('#fff0b0');g.moveTo(7,47);g.lineTo(7,-6);g.lineTo(65,-6);g.close();g.fill();}return;}
    if(['seed','water','flower'].includes(kind)){fill('#ae7651');g.roundRect(-38,-40,76,34,7);g.fill();if(kind==='seed'){fill('#e4c578');g.ellipse(0,-1,8,12);g.fill();}else{fill('#57924f');g.rect(-3,-6,6,40);g.fill();g.ellipse(-13,13,14,7);g.fill();g.ellipse(13,24,14,7);g.fill();if(kind==='flower'){fill('#e78e9b');for(let i=0;i<5;i++){const a=i*Math.PI*2/5;g.circle(Math.cos(a)*12,35+Math.sin(a)*12,9);g.fill();}fill('#f4cc64');g.circle(0,35,7);g.fill();}else{fill('#69aecd');for(const x of [-40,40]){g.ellipse(x,25,5,8);g.fill();}}}return;}
    if(['red','yellow','green','ball'].includes(kind)){fill({red:'#df6651',yellow:'#e4bd48',green:'#77a55b',ball:'#e99a61'}[kind]!);g.circle(0,0,35);g.fill();fill('#658d46');g.ellipse(10,35,14,6);g.fill();return;}
    if(kind==='book'){fill('#597fba');g.roundRect(-42,-35,84,70,6);g.fill();fill('#fff3cf');g.rect(-34,-27,29,55);g.rect(5,-27,29,55);g.fill();return;}
    if(kind==='pencil'){fill('#e9ba53');g.moveTo(-45,-30);g.lineTo(-25,-40);g.lineTo(42,24);g.lineTo(24,41);g.close();g.fill();fill('#645349');g.moveTo(24,41);g.lineTo(42,24);g.lineTo(49,48);g.close();g.fill();return;}
    if(kind==='bag'){fill('#bd809a');g.roundRect(-32,-38,64,70,12);g.fill();g.strokeColor=new Color(104,79,91);g.lineWidth=5;g.roundRect(-12,22,24,24,8);g.stroke();fill('#edc374');g.roundRect(-22,-25,44,24,5);g.fill();return;}
    fill('#6ba5bd');g.rect(-85,-32,170,9);g.fill();fill(kind==='stone'?'#92958d':'#86ad62');g.ellipse(0,kind==='stone'?-39:0,25,14);g.fill();
}
