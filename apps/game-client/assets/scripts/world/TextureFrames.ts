import {Texture2D,SpriteFrame,Rect} from 'cc';
import {visualAssets} from './VisualAssets';

const pixels=new WeakMap<Texture2D,Uint8ClampedArray>();
/** Atlas geometry belongs to the asset registry; sprites and minimaps share it. */
export function assetFrame(texture:Texture2D,id:string):SpriteFrame {
    const asset=visualAssets.find(a=>a.id===id),columns=asset?.columns??4,rows=asset?.rows??2;
    let x=0,y=0,width=texture.width,height=texture.height;
    if(asset?.region){[x,y,width,height]=asset.region.map((value,index)=>value*(index%2===0?texture.width:texture.height));}
    if(asset?.cell!==undefined){width=texture.width/columns;const row=Math.floor(asset.cell/columns),cuts=[0,...(asset.rowCuts??Array.from({length:rows-1},(_,i)=>(i+1)/rows)),1];height=(cuts[row+1]-cuts[row])*texture.height;x=asset.cell%columns*width;y=cuts[row]*texture.height;}
    if(asset?.trim&&typeof document!=='undefined'&&texture.image?.data){
        try{
            let data=pixels.get(texture);if(!data){const canvas=document.createElement('canvas');canvas.width=texture.width;canvas.height=texture.height;const ctx=canvas.getContext('2d',{willReadFrequently:true});if(ctx){ctx.drawImage(texture.image.data as CanvasImageSource,0,0);data=ctx.getImageData(0,0,texture.width,texture.height).data;pixels.set(texture,data);}}
            if(data){const left=Math.ceil(x),top=Math.ceil(y),right=Math.floor(x+width),bottom=Math.floor(y+height);let minX=right,minY=bottom,maxX=-1,maxY=-1;
                for(let py=top;py<bottom;py++)for(let px=left;px<right;px++)if(data[(py*texture.width+px)*4+3]>24){minX=Math.min(minX,px);minY=Math.min(minY,py);maxX=Math.max(maxX,px);maxY=Math.max(maxY,py);}
                if(maxX>=minX&&maxY>=minY){x=Math.max(left,minX-2);y=Math.max(top,minY-2);width=Math.min(right,maxX+3)-x;height=Math.min(bottom,maxY+3)-y;}
            }
        }catch{/* Keep the atlas cell if this runtime cannot read texture pixels. */}
    }
    const frame=new SpriteFrame();frame.texture=texture;frame.rect=new Rect(x,y,width,height);return frame;
}

/** Preserve one scale and floor baseline for the 24 directional animation frames. */
export function animationFrames(texture:Texture2D,id:string):SpriteFrame[]{
    const rows=visualAssets.find(a=>a.id===id)?.animationRows??[[0,1/3],[1/3,1/3],[2/3,1/3]],frames:SpriteFrame[]=[];
    for(const [top,height] of rows)for(let col=0;col<8;col++){const frame=new SpriteFrame();frame.texture=texture;frame.rect=new Rect(col*texture.width/8,top*texture.height,texture.width/8,height*texture.height);frames.push(frame);}return frames;
}

/** One shared crop per actor keeps its three poses aligned at the same floor line. */
export function npcPoseFrames(texture:Texture2D):SpriteFrame[][]{
    const canvas=document.createElement('canvas');canvas.width=texture.width;canvas.height=texture.height;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)return [];
    ctx.drawImage(texture.image!.data as CanvasImageSource,0,0);const data=ctx.getImageData(0,0,canvas.width,canvas.height).data;
    const width=Math.floor(texture.width/3),cuts=[0,256,512,768,1040,1280,1536,1792,2048].map(y=>Math.round(y/2048*texture.height)),rows:SpriteFrame[][]=[];
    for(let row=0;row<8;row++){
        const top=cuts[row],height=cuts[row+1]-top;
        let minX=width,minY=height,maxX=-1,maxY=-1;
        for(let col=0;col<3;col++)for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(data[((top+y)*texture.width+col*width+x)*4+3]>24){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}
        if(maxX<minX)return [];
        minX=Math.max(0,minX-2);minY=Math.max(0,minY-2);maxX=Math.min(width-1,maxX+2);maxY=Math.min(height-1,maxY+2);
        const frames:SpriteFrame[]=[];for(let col=0;col<3;col++){const frame=new SpriteFrame();frame.texture=texture;frame.rect=new Rect(col*width+minX,top+minY,maxX-minX+1,maxY-minY+1);frames.push(frame);}rows.push(frames);
    }
    return rows;
}

/** Eight genuine viewpoints per NPC, in the same east-to-northeast order as direction8. */
export function npcDirectionFrames(texture:Texture2D):SpriteFrame[][]{
    const width=texture.width/8,height=texture.height/8,rows:SpriteFrame[][]=[];
    for(let row=0;row<8;row++){
        const frames:SpriteFrame[]=[];
        for(let direction=0;direction<8;direction++){const frame=new SpriteFrame();frame.texture=texture;frame.rect=new Rect(direction*width,row*height,width,height);frames.push(frame);}
        rows.push(frames);
    }
    return rows;
}
