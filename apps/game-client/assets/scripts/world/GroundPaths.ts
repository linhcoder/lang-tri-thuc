import { Point, terrain, toWorld } from './VillageModel';

/** Visual geometry only: navigation and saved grid coordinates remain authoritative. */
export const groundAssets = [
    {id:'ground.meadow',name:'Cỏ mảng mềm',group:'Ground',path:'assets/scripts/world/GroundPaths.ts',size:[64,32],anchor:[.5,.5],layer:'Ground',collision:null,status:'placeholder'},
    {id:'paths.dirt',name:'Đường đất bo mềm',group:'Paths',path:'assets/scripts/world/GroundPaths.ts',size:[64,32],anchor:[.5,.5],layer:'Ground',collision:null,status:'placeholder'},
] as const;

// Connected spines with bends and branches. Independent control points are editable.
export const villagePaths:ReadonlyArray<ReadonlyArray<Point>> = [
    [{x:0,y:28},{x:13,y:28},{x:16,y:28},{x:18,y:24},{x:20,y:20},{x:25,y:18},{x:29,y:15}],
    [{x:14,y:7},{x:15,y:12},{x:18,y:17},{x:20,y:20},{x:24,y:23},{x:28,y:27},{x:32,y:31}],
    [{x:14,y:27},{x:16,y:29},{x:19,y:30}],
    [{x:20,y:20},{x:24,y:21},{x:28,y:22},{x:34,y:22},{x:39,y:21}],
    [{x:17,y:24},{x:19,y:27},{x:24,y:30},{x:28,y:32}],
];
export function groundNoise(x:number,y:number,salt=0):number {
    let n=Math.imul(x|0,374761393)^Math.imul(y|0,668265263)^Math.imul(salt,1274126177);
    n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296;
}

/** One world-aligned meadow pattern for terrain and the decorative outskirts. */
export function paintMeadow(context:CanvasRenderingContext2D,left:number,top:number,right:number,bottom:number,grass?:CanvasImageSource):void{
    context.fillStyle='#879952';context.fillRect(left,top,right-left,bottom-top);
    if(grass){const pattern=context.createPattern(grass,'repeat');if(pattern){context.save();context.globalAlpha=.48;context.scale(.18,.09);context.fillStyle=pattern;context.fillRect(left/.18,top/.09,(right-left)/.18,(bottom-top)/.09);context.restore();}}
    for(let x=Math.floor((left-145)/96)*96;x<=right+145;x+=96)for(let y=Math.floor((top-75)/64)*64;y<=bottom+75;y+=64){
        const n=groundNoise(x,y);context.save();context.translate(x+n*48,y+groundNoise(x,y,1)*32);context.scale(1,.5);
        const gradient=context.createRadialGradient(0,0,0,0,0,100+n*45);gradient.addColorStop(0,n>.5?'rgba(196,207,104,.24)':'rgba(37,83,44,.14)');gradient.addColorStop(1,'rgba(119,150,71,0)');context.fillStyle=gradient;context.fillRect(-145,-145,290,290);context.restore();
    }
}

/** Paint in global pixel coordinates so neighboring baked chunks share patterns. */
export function paintGround(context:CanvasRenderingContext2D,cx:number,cy:number,grass?:CanvasImageSource):void {
    const center=toWorld({x:cx+3.5,y:cy+3.5});
    // Rectangular chunks overlap with identical world-aligned paint. Transparent
    // diamond edges would otherwise leave diagonal antialias seams in the grass.
    context.save();context.beginPath();context.rect(0,0,514,258);context.clip();context.translate(257-center.x,129+center.y);
    paintMeadow(context,center.x-400,-center.y-240,center.x+400,-center.y+240,grass);
    // A worn yard blends into the paths, instead of a bright diamond of tiles.
    const yard=toWorld({x:21,y:16});context.save();context.translate(yard.x,-yard.y);context.scale(1,.45);const yardTint=context.createRadialGradient(0,0,20,0,0,150);yardTint.addColorStop(0,'rgba(211,176,115,.90)');yardTint.addColorStop(.65,'rgba(211,176,115,.72)');yardTint.addColorStop(1,'rgba(211,176,115,0)');context.fillStyle=yardTint;context.fillRect(-150,-150,300,300);context.restore();
    for(const points of villagePaths){
        const world=points.map(p=>{const w=toWorld(p);return {x:w.x,y:-w.y};});
        // Squash Y while stroking: road width follows the 2:1 ground projection.
        context.save();context.scale(1,.5);context.beginPath();context.moveTo(world[0].x,world[0].y*2);
        for(let i=1;i<world.length-1;i++)context.quadraticCurveTo(world[i].x,world[i].y*2,(world[i].x+world[i+1].x)/2,world[i].y+world[i+1].y);
        const end=world[world.length-1];context.lineTo(end.x,end.y*2);context.lineCap='round';context.lineJoin='round';
        for(const [width,color] of [[83,'rgba(150,142,87,.06)'],[73,'rgba(190,164,113,.12)'],[65,'rgba(211,177,126,.25)'],[57,'rgba(222,185,137,.48)'],[49,'#e4bf8e'],[32,'rgba(246,213,160,.35)']] as const){context.lineWidth=width;context.strokeStyle=color;context.stroke();}
        context.restore();
    }
    // Sparse global speckles; deterministic across chunk boundaries, no per-frame work.
    for(let x=Math.floor((center.x-300)/12)*12;x<center.x+300;x+=12)for(let y=Math.floor((-center.y-160)/12)*12;y<-center.y+160;y+=12){
        const n=groundNoise(x,y,3);if(n<.66)continue;
        context.fillStyle=n>.87?'rgba(255,239,181,.16)':'rgba(62,80,35,.10)';context.fillRect(x+n*8,y+groundNoise(x,y,4)*8,1+n*2,1);
    }
    context.restore();
}
