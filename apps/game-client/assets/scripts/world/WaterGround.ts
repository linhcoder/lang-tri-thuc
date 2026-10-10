import {terrain,toWorld,villageObjects} from './VillageModel';
import {groundNoise} from './GroundPaths';
/** Static shore, ripples and contact shadows baked into terrain atlases. */
export function paintWaterAndShadows(ctx:CanvasRenderingContext2D,cx:number,cy:number):void{
    const center=toWorld({x:cx+3.5,y:cy+3.5});ctx.save();ctx.translate(257-center.x,129+center.y);
    ctx.beginPath();
    for(let x=cx;x<cx+8;x++)for(let y=cy;y<cy+8;y++)if(terrain(x,y)==='pond'){
        const p=toWorld({x,y});ctx.moveTo(p.x,-p.y-16);ctx.lineTo(p.x+32,-p.y);ctx.lineTo(p.x,-p.y+16);ctx.lineTo(p.x-32,-p.y);ctx.closePath();
    }
    ctx.clip();const gradient=ctx.createLinearGradient(-800,300,-400,580);gradient.addColorStop(0,'#53b0be');gradient.addColorStop(1,'#277e94');ctx.fillStyle=gradient;ctx.fillRect(-1300,0,2600,1300);
    for(let x=-850;x<-300;x+=24)for(let y=300;y<550;y+=14){const n=groundNoise(x,y,28);if(n<.5)continue;ctx.strokeStyle='rgba(201,244,219,.24)';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(x+n*14,y,5+n*7,2,0,.2,2.6);ctx.stroke();}
    const corners=[{x:.5,y:19.5},{x:5.5,y:19.5},{x:5.5,y:26.5},{x:.5,y:26.5}].map(toWorld);
    ctx.beginPath();corners.forEach((p,i)=>i?ctx.lineTo(p.x,-p.y):ctx.moveTo(p.x,-p.y));ctx.closePath();ctx.strokeStyle='#bbb27b';ctx.lineWidth=10;ctx.stroke();ctx.strokeStyle='rgba(228,226,147,.6)';ctx.lineWidth=3;ctx.stroke();ctx.restore();
    ctx.save();ctx.beginPath();ctx.moveTo(257,1);ctx.lineTo(513,129);ctx.lineTo(257,257);ctx.lineTo(1,129);ctx.closePath();ctx.clip();ctx.translate(257-center.x,129+center.y);
    for(const o of villageObjects){const p=toWorld(o),width=o.width*.38;if(Math.abs(p.x-center.x)>257+width||Math.abs(p.y-center.y)>150)continue;ctx.fillStyle='rgba(38,62,32,.20)';ctx.beginPath();ctx.ellipse(p.x+8,-p.y+3,width,Math.max(9,width*.21),0,0,Math.PI*2);ctx.fill();}
    ctx.restore();
}
