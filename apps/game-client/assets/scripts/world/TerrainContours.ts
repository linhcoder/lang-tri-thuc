import {Point,SIZE,toWorld} from './VillageModel';

/** Merge tile borders into continuous visual outlines; gameplay keeps its grid. */
export function terrainContours(contains:(x:number,y:number)=>boolean):Point[][]{
    const key=(p:Point)=>`${p.x},${p.y}`,edges=new Map<string,{a:Point;b:Point}>();
    for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++)if(contains(x,y)){
        const p=toWorld({x,y}),corners=[{x:p.x,y:-p.y-16},{x:p.x+32,y:-p.y},{x:p.x,y:-p.y+16},{x:p.x-32,y:-p.y}];
        for(let i=0;i<4;i++){const a=corners[i],b=corners[(i+1)%4],id=[key(a),key(b)].sort().join(':');if(edges.has(id))edges.delete(id);else edges.set(id,{a,b});}
    }
    const remaining=new Set(edges.values()),from=new Map<string,Array<{a:Point;b:Point}>>();
    for(const edge of remaining){const bucket=from.get(key(edge.a))??[];bucket.push(edge);from.set(key(edge.a),bucket);}
    const loops:Point[][]=[];
    while(remaining.size){let edge=remaining.values().next().value!;const start=key(edge.a),loop:Point[]=[];
        while(remaining.has(edge)){remaining.delete(edge);loop.push(edge.a);if(key(edge.b)===start)break;const next=from.get(key(edge.b))?.find(e=>remaining.has(e));if(!next)break;edge=next;}
        if(loop.length>2)loops.push(loop);
    }
    return loops;
}

export function traceTerrain(ctx:CanvasRenderingContext2D,loops:ReadonlyArray<ReadonlyArray<Point>>):void{
    ctx.beginPath();for(const points of loops){const first=points[0],last=points[points.length-1];ctx.moveTo((first.x+last.x)/2,(first.y+last.y)/2);
        for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];ctx.quadraticCurveTo(a.x,a.y,(a.x+b.x)/2,(a.y+b.y)/2);}ctx.closePath();}
}
