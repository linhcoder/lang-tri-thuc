import {Color,Graphics,Node,UITransform} from 'cc';

const ink=new Color(80,59,35),cream=new Color(255,245,212);
/** Static paper and wood skin; draw on creation, never in the frame loop. */
export function paintModalFrame(node:Node):void{
    const g=node.getComponent(Graphics)??node.addComponent(Graphics);g.clear();
    g.fillColor=new Color(76,48,27);g.roundRect(-310,-280,620,560,24);g.fill();
    g.fillColor=new Color(198,149,68);g.roundRect(-306,-276,612,552,21);g.fill();
    g.fillColor=new Color(255,246,218);g.roundRect(-300,-270,600,540,17);g.fill();
    g.strokeColor=new Color(226,197,139);g.lineWidth=2;g.roundRect(-292,-262,584,524,12);g.stroke();
    g.fillColor=new Color(60,91,59);g.roundRect(-280,192,560,66,12);g.fill();
    g.strokeColor=new Color(217,176,91);g.lineWidth=2;g.roundRect(-277,195,554,60,10);g.stroke();
    // Small corner leaves and a quiet footer divider keep learning content clear.
    g.fillColor=new Color(208,164,77);for(const x of [-285,285])for(const y of [-248,174]){g.ellipse(x,y,5,10);g.fill();g.ellipse(x+(x<0?8:-8),y+4,8,4);g.fill();}
    g.strokeColor=new Color(222,194,139);g.lineWidth=1;g.moveTo(-275,-190);g.lineTo(275,-190);g.stroke();
}
export function modalButtonColor(id:string):Color{return id==='Continue'||id==='Campaign'?cream:ink;}
export function paintModalButton(node:Node,id:string):void{
    const t=node.getComponent(UITransform)!,w=t.width,h=t.height,g=node.getComponent(Graphics)??node.addComponent(Graphics),primary=id==='Continue'||id==='Campaign',answer=id.startsWith('Answer-')||id.startsWith('LessonAnswer-');
    g.clear();g.fillColor=new Color(103,72,36);g.roundRect(-w/2,-h/2,w,h,13);g.fill();
    g.fillColor=new Color(202,157,77);g.roundRect(-w/2+2,-h/2+2,w-4,h-4,11);g.fill();
    g.fillColor=primary?new Color(66,110,65):answer?new Color(255,221,137):new Color(252,239,199);g.roundRect(-w/2+5,-h/2+5,w-10,h-10,9);g.fill();
    g.strokeColor=primary?new Color(145,179,102):new Color(232,205,145);g.lineWidth=1;g.roundRect(-w/2+8,-h/2+8,w-16,h-16,7);g.stroke();
}
