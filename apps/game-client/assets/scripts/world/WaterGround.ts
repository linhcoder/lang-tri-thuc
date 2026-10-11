import {terrain,toWorld,villageObjects,bridgeTile,Point,SIZE} from './VillageModel';
import {groundNoise} from './GroundPaths';
/** Cancel shared tile edges and soften the complete coastline across chunk seams. */
function waterContours():Point[][] {
    const edges=new Map<string,{a:Point;b:Point}>(),key=(p:Point)=>p.x+','+p.y;
    for(let x=0;x<SIZE;x++)for(let y=0;y<SIZE;y++)if(terrain(x,y)==='pond'){
        const p=toWorld({x,y}),v=[{x:p.x,y:-p.y-16},{x:p.x+32,y:-p.y},{x:p.x,y:-p.y+16},{x:p.x-32,y:-p.y}];
        for(let i=0;i<4;i++){const a=v[i],b=v[(i+1)%4],id=[key(a),key(b)].sort().join(':');if(edges.has(id))edges.delete(id);else edges.set(id,{a,b});}
    }
    const remaining=new Set(edges.values()),from=new Map<string,Array<{a:Point;b:Point}>>();for(const e of remaining){const bucket=from.get(key(e.a))??[];bucket.push(e);from.set(key(e.a),bucket);}
    const result:Point[][]=[];
    while(remaining.size){const first=remaining.values().next().value!,loop:Point[]=[],start=key(first.a);let edge=first;
        while(remaining.has(edge)){remaining.delete(edge);loop.push(edge.a);if(key(edge.b)===start)break;const next=from.get(key(edge.b))?.find(e=>remaining.has(e));if(!next)break;edge=next;}
        if(loop.length>2)result.push(loop);
    }return result;
}
const contours=waterContours();
function coast(ctx:CanvasRenderingContext2D):void {
    ctx.beginPath();for(const points of contours){const first=points[0],last=points[points.length-1];ctx.moveTo((first.x+last.x)/2,(first.y+last.y)/2);for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];ctx.quadraticCurveTo(a.x,a.y,(a.x+b.x)/2,(a.y+b.y)/2);}ctx.closePath();}
}
function clipChunk(ctx:CanvasRenderingContext2D):void {ctx.beginPath();ctx.rect(0,0,514,258);ctx.clip();}
/** One continuous pond, shore and reflection field, baked once into the terrain atlas. */
export function paintWaterAndShadows(ctx:CanvasRenderingContext2D,cx:number,cy:number):void {
    const center=toWorld({x:cx+3.5,y:cy+3.5});ctx.save();clipChunk(ctx);ctx.translate(257-center.x,129+center.y);
    ctx.save();coast(ctx);ctx.clip();const gradient=ctx.createLinearGradient(-800,350,-300,750);gradient.addColorStop(0,'#8cc8bb');gradient.addColorStop(.5,'#429fba');gradient.addColorStop(1,'#277f9c');ctx.fillStyle=gradient;ctx.fillRect(-1300,0,2600,1300);
    for(let x=-1100;x<-250;x+=24)for(let y=300;y<850;y+=14){const n=groundNoise(x,y,28);if(n<.5)continue;ctx.strokeStyle='rgba(227,252,225,.27)';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(x+n*14,y,5+n*7,2,0,.2,2.6);ctx.stroke();}
    for(let x=0;x<SIZE;x++)for(let y=0;y<SIZE;y++)if(terrain(x,y)==='pond'&&!bridgeTile(x,y)&&groundNoise(x,y,45)>.5){const p=toWorld({x,y});ctx.fillStyle='#81bc65';ctx.beginPath();ctx.ellipse(p.x-8,-p.y+3,9,4,0,.2,6);ctx.lineTo(p.x-8,-p.y+3);ctx.closePath();ctx.fill();ctx.fillStyle='#b9dc81';ctx.beginPath();ctx.ellipse(p.x+11,-p.y-4,6,3,0,0,Math.PI*2);ctx.fill();}
    ctx.restore();coast(ctx);ctx.lineJoin='round';for(const [width,color] of [[22,'rgba(52,104,63,.23)'],[14,'rgba(116,146,80,.62)'],[7,'#c4c29a'],[2,'#eee0b6']] as const){ctx.lineWidth=width;ctx.strokeStyle=color;ctx.stroke();}
    // Reeds, soft stone clusters and soil follow the complete shoreline across chunks.
    for(const loop of contours)for(let i=0;i<loop.length;i++){
        const a=loop[i],b=loop[(i+1)%loop.length],x=(a.x+b.x)/2,y=(a.y+b.y)/2,n=groundNoise(x,y,72);
        if(n<.55)continue;
        const length=Math.hypot(b.x-a.x,b.y-a.y)||1,nx=(b.y-a.y)/length,ny=-(b.x-a.x)/length;
        const px=x+nx*8,py=y+ny*8;
        ctx.fillStyle='rgba(99,113,67,.26)';ctx.beginPath();ctx.ellipse(px,py+2,8,3,0,0,Math.PI*2);ctx.fill();
        if(n>.80){for(let j=0;j<3;j++){ctx.fillStyle=j%2?'#d3ccb0':'#a6ad87';ctx.beginPath();ctx.ellipse(px+j*4-4,py+j%2,3+j%2,2,0,0,Math.PI*2);ctx.fill();}}
        else {ctx.strokeStyle='#668345';ctx.lineWidth=1.5;for(let j=0;j<3;j++){ctx.beginPath();ctx.moveTo(px+j*3-3,py);ctx.quadraticCurveTo(px+j*3-4,py-5,px+j*4-5,py-8-j*2);ctx.stroke();}}
    }
    for(const o of villageObjects){const p=toWorld(o),width=o.width*.38;if(Math.abs(p.x-center.x)>257+width||Math.abs(p.y-center.y)>129+Math.max(9,width*.21))continue;ctx.fillStyle='rgba(38,62,32,.20)';ctx.beginPath();ctx.ellipse(p.x+8,-p.y+3,width,Math.max(9,width*.21),0,0,Math.PI*2);ctx.fill();}
    ctx.restore();
}
