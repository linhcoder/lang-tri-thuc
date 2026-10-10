import { Point, terrain, toWorld } from './VillageModel';

/** Visual geometry only: navigation and saved grid coordinates remain authoritative. */
export const groundAssets = [
    {id:'ground.meadow',name:'Cỏ mảng mềm',group:'Ground',path:'assets/scripts/world/GroundPaths.ts',size:[64,32],anchor:[.5,.5],layer:'Ground',collision:null,status:'placeholder'},
    {id:'paths.dirt',name:'Đường đất bo mềm',group:'Paths',path:'assets/scripts/world/GroundPaths.ts',size:[64,32],anchor:[.5,.5],layer:'Ground',collision:null,status:'placeholder'},
] as const;

// Connected spines with bends and branches. Independent control points are editable.
export const villagePaths:ReadonlyArray<ReadonlyArray<Point>> = [
    [{x:0,y:23},{x:6,y:23},{x:9,y:24},{x:15.5,y:20.5},{x:24,y:21},{x:32,y:22},{x:39,y:21}],
    [{x:15.5,y:0},{x:15,y:10},{x:15.5,y:20.5},{x:16,y:29},{x:15,y:39}],
    [{x:9,y:24},{x:7,y:27},{x:8,y:30}],
    [{x:24,y:21},{x:27,y:24},{x:30,y:25}],
    [{x:16,y:29},{x:21,y:30},{x:25,y:34}],
];
export function groundNoise(x:number,y:number,salt=0):number {
    let n=Math.imul(x|0,374761393)^Math.imul(y|0,668265263)^Math.imul(salt,1274126177);
    n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296;
}

/** Paint in global pixel coordinates so neighboring baked chunks share patterns. */
export function paintGround(context:CanvasRenderingContext2D,cx:number,cy:number,grass?:CanvasImageSource):void {
    const center=toWorld({x:cx+3.5,y:cy+3.5});
    context.save();context.translate(257-center.x,129+center.y);
    context.beginPath();
    for(let dx=0;dx<8;dx++)for(let dy=0;dy<8;dy++){
        const x=cx+dx,y=cy+dy,type=terrain(x,y);if(type!=='grass'&&type!=='road')continue;
        const p=toWorld({x,y}),py=-p.y;
        context.moveTo(p.x,py-16);context.lineTo(p.x+32,py);context.lineTo(p.x,py+16);context.lineTo(p.x-32,py);context.closePath();
    }
    context.clip();context.fillStyle='#779647';context.fillRect(-1300,-32,2600,1340);
    if(grass){const pattern=context.createPattern(grass,'repeat');if(pattern){context.save();context.scale(.18,.09);context.fillStyle=pattern;context.fillRect(-1300/.18,-32/.09,2600/.18,1340/.09);context.restore();}}
    // Broad translucent patches replace the conspicuous repeating grass tile.
    for(let x=-1344;x<=1344;x+=96)for(let y=-64;y<=1344;y+=64){
        if(Math.abs(x-center.x)>440||Math.abs(y+center.y)>250)continue;
        const n=groundNoise(x,y);context.save();context.translate(x+n*48,y+groundNoise(x,y,1)*32);context.scale(1,.5);
        const gradient=context.createRadialGradient(0,0,0,0,0,100+n*45);
        gradient.addColorStop(0,n>.5?'rgba(196,207,104,.24)':'rgba(37,83,44,.14)');gradient.addColorStop(1,'rgba(119,150,71,0)');
        context.fillStyle=gradient;context.fillRect(-145,-145,290,290);context.restore();
    }
    for(const points of villagePaths){
        const world=points.map(p=>{const w=toWorld(p);return {x:w.x,y:-w.y};});
        // Squash Y while stroking: road width follows the 2:1 ground projection.
        context.save();context.scale(1,.5);context.beginPath();context.moveTo(world[0].x,world[0].y*2);
        for(let i=1;i<world.length-1;i++)context.quadraticCurveTo(world[i].x,world[i].y*2,(world[i].x+world[i+1].x)/2,world[i].y+world[i+1].y);
        const end=world[world.length-1];context.lineTo(end.x,end.y*2);context.lineCap='round';context.lineJoin='round';
        for(const [width,color] of [[76,'rgba(107,119,53,.3)'],[67,'#baa069'],[58,'#d7b57b'],[43,'#dfbf8b']] as const){context.lineWidth=width;context.strokeStyle=color;context.stroke();}
        context.restore();
    }
    // Sparse global speckles; deterministic across chunk boundaries, no per-frame work.
    for(let x=Math.floor((center.x-300)/12)*12;x<center.x+300;x+=12)for(let y=Math.floor((-center.y-160)/12)*12;y<-center.y+160;y+=12){
        const n=groundNoise(x,y,3);if(n<.66)continue;
        context.fillStyle=n>.87?'rgba(255,239,181,.16)':'rgba(62,80,35,.10)';context.fillRect(x+n*8,y+groundNoise(x,y,4)*8,1+n*2,1);
    }
    context.restore();
}
