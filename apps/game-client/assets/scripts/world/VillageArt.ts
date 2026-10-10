import { Node, UITransform, Sprite, SpriteFrame, Texture2D, Rect, resources, ImageAsset } from 'cc';
import { terrain,toWorld } from './VillageModel';
import { paintGround } from './GroundPaths';
import {paintWaterAndShadows} from './WaterGround';
import {assetResourceKey,sceneryAssets} from './VisualAssets';
export class VillageArt {
    child:SpriteFrame[]=[];environment:SpriteFrame[]=[];
    avatarVariants:Partial<Record<number,SpriteFrame[]>>={};
    details:SpriteFrame[]=[];
    hairVariants:Partial<Record<number,SpriteFrame[]>>={};private decorationLoads=new Map<string,Promise<void>>();private avatarLoads=new Map<number,Promise<void>>();private hairLoads=new Map<number,Promise<void>>();private disposed=false;
    decorations:Partial<Record<'elder'|'co-tam'|'lotus'|'teacher'|'market-lady'|'potter'|'ti-na'|'hang-cuoi',SpriteFrame>>={};
    private tiles?:Texture2D;
    private groundTexture?:Texture2D;
    private generatedTextures:Texture2D[]=[];
    readonly environmentLoaded=new Set<number>();private environmentLoads=new Map<number,Promise<void>>();
    private objectFrames=new Map<string,SpriteFrame>();private objectLoads=new Map<string,Promise<SpriteFrame|undefined>>();
    private environmentIds=['dinh','house','banyan','banana','vegetation.rice','vegetation.rice','character.farmer'];
    objectFrame(id:string,index:number):SpriteFrame|undefined{return this.objectFrames.get(id)??(this.environmentLoaded.has(index)&&assetResourceKey(id)===assetResourceKey(this.environmentIds[index])?this.environment[index]:undefined);}
    ensureObject(id:string,index:number):Promise<SpriteFrame|undefined>{
        if(this.disposed)return Promise.resolve(undefined);const existing=this.objectFrame(id,index);if(existing)return Promise.resolve(existing);
        if(assetResourceKey(id)===assetResourceKey(this.environmentIds[index]))return this.ensureEnvironment(index).then(()=>this.objectFrame(id,index));
        const previous=this.objectLoads.get(id);if(previous)return previous;
        const task=new Promise<SpriteFrame|undefined>(resolve=>resources.load(assetResourceKey(id)+'/texture',Texture2D,(error,texture)=>{if(this.disposed||error){resolve(undefined);return;}const frame=this.slice(texture,1,1)[0];this.objectFrames.set(id,frame);resolve(frame);}));this.objectLoads.set(id,task);return task;
    }
    ensureEnvironment(index:number):Promise<void>{
        if(this.disposed||this.environmentLoaded.has(index))return Promise.resolve();const previous=this.environmentLoads.get(index);if(previous)return previous;
        const ids=['dinh','house','banyan','banana','vegetation.rice','vegetation.rice','character.farmer'];if(!ids[index])return Promise.resolve();
        const task=new Promise<void>(resolve=>resources.load(`${assetResourceKey(ids[index])}/texture`,Texture2D,(error,texture)=>{if(!this.disposed&&!error){this.environment[index]?.destroy();this.environment[index]=this.slice(texture,1,1)[0];this.environmentLoaded.add(index);}else if(error)console.warn('Regional scenery unavailable; keeping placeholder');resolve();}));this.environmentLoads.set(index,task);return task;
    }
    scenery:SpriteFrame[]=[];private sceneryLoad?:Promise<void>;
    ensureScenery():Promise<void>{
        if(this.disposed)return Promise.resolve();if(this.sceneryLoad)return this.sceneryLoad;
        const requests=new Map<string,Promise<Texture2D>>();
        this.sceneryLoad=Promise.all(sceneryAssets.map(async(asset,index)=>{
            const key=assetResourceKey(asset.id);let task=requests.get(key);
            if(!task){task=new Promise<Texture2D>((resolve,reject)=>resources.load(key+'/texture',Texture2D,(error,texture)=>error?reject(error):resolve(texture)));requests.set(key,task);}
            try{const texture=await task;if(this.disposed)return;const frame=new SpriteFrame();frame.texture=texture;
                if(asset.cell!==undefined){const width=texture.width/4,height=texture.height/2;frame.rect=new Rect(asset.cell%4*width,Math.floor(asset.cell/4)*height,width,height);}
                this.scenery[index]=frame;
            }catch{console.warn('Scenery '+asset.id+' unavailable; base map remains playable');}
        })).then(()=>{});return this.sceneryLoad;
    }
    async load():Promise<void>{
        const load=(id:string)=>new Promise<Texture2D>((resolve,reject)=>resources.load(`${assetResourceKey(id)}/texture`,Texture2D,(error,asset)=>error?reject(error):resolve(asset)));
        const [child,temple,banyan,farmer,tiles]=await Promise.all(['avatar.child','dinh','banyan','character.farmer','ground.legacy'].map(id=>load(id)));
        if(this.disposed)return;
        this.child=this.slice(child,8,3);this.tiles=tiles;
        try{this.groundTexture=await load('ground.meadow-texture');}catch{console.warn('Ground texture unavailable; procedural terrain remains playable');}
        try{const texture=await load('well');if(!this.disposed)this.details=this.slice(texture,4,2);}catch{console.warn('Village details unavailable; keeping base map');}
        if(this.disposed)return;
        const frame=(texture:Texture2D)=>this.slice(texture,1,1)[0];
        this.environment=[frame(temple),frame(temple),frame(banyan),frame(temple),frame(temple),frame(temple),frame(farmer)];[0,2,6].forEach(index=>this.environmentLoaded.add(index));
        await Promise.all((['elder','lotus'] as const).map(name=>this.ensureDecoration(name)));
    }
    private slice(texture:Texture2D,columns:number,rows:number):SpriteFrame[]{
        const result:SpriteFrame[]=[];const width=texture.width/columns,height=texture.height/rows;
        for(let row=0;row<rows;row++)for(let col=0;col<columns;col++){
            const frame=new SpriteFrame();frame.texture=texture;frame.rect=new Rect(col*width,row*height,width,height);result.push(frame);
        }return result;
    }
    ensureDecoration(name:keyof VillageArt['decorations']):Promise<void>{
        if(this.disposed)return Promise.resolve();const existing=this.decorationLoads.get(name);if(existing)return existing;
        const ids={elder:'character.elder',lotus:'water.lotus','co-tam':'character.co-tam',teacher:'character.co-giao-lan','market-lady':'character.ba-ban-hang',potter:'character.nghe-nhan-gom','ti-na':'character.ti-na','hang-cuoi':'character.chi-hang-cuoi'};
        const task=new Promise<void>(resolve=>resources.load(`${assetResourceKey(ids[name])}/texture`,Texture2D,(error,texture)=>{
            if(!this.disposed&&!error)this.decorations[name]=this.slice(texture,1,1)[0];
            else if(error)console.warn(`Village decoration ${name} unavailable; keeping fallback`);resolve();
        }));this.decorationLoads.set(name,task);return task;
    }
    ensureAvatar(id:number):Promise<void>{
        if(this.disposed||id===0||!Number.isInteger(id)||id<0||id>3)return Promise.resolve();
        const previous=this.avatarLoads.get(id);if(previous)return previous;
        const names=['child','boy-blue','girl-pink','girl-yellow'];
        const task=new Promise<void>(resolve=>resources.load(`${assetResourceKey('avatar.'+names[id])}/texture`,Texture2D,(error,texture)=>{
            if(!this.disposed&&!error)this.avatarVariants[id]=this.slice(texture,8,3);
            else if(error)console.warn('Avatar unavailable; using original sprite');resolve();
        }));this.avatarLoads.set(id,task);return task;
    }
    ensureHair(id:number):Promise<void>{
        if(this.disposed||!Number.isInteger(id)||id<0||id>3)return Promise.resolve();
        const existing=this.hairLoads.get(id);if(existing)return existing;
        const names=['boy-red-hair','boy-blue-hair','girl-pink-hair','girl-yellow-hair'];
        const task=new Promise<void>(resolve=>resources.load(`${assetResourceKey('avatar.'+names[id])}/texture`,Texture2D,(error,texture)=>{
            if(!this.disposed&&!error)this.hairVariants[id]=this.slice(texture,8,3);
            else if(error)console.warn('Hair asset unavailable; keeping original hairstyle');resolve();
        }));this.hairLoads.set(id,task);return task;
    }
    avatarFrame(id:number,row:number,direction:number,hair=0):SpriteFrame{return (hair===1&&this.hairVariants[id]||this.avatarVariants[id]||this.child)[row*8+direction];}
    sprite(parent:Node,name:string,frame:SpriteFrame,width:number,height:number):Node {
        const node=new Node(name);node.layer=parent.layer;parent.addChild(node);
        const transform=node.addComponent(UITransform);transform.setContentSize(width,height);transform.setAnchorPoint(0.5,0);
        const sprite=node.addComponent(Sprite);sprite.sizeMode=Sprite.SizeMode.CUSTOM;sprite.spriteFrame=frame;
        return node;
    }
    private terrainFrames=new Map<string,SpriteFrame>();
    private bakeTerrain():void {
        if(typeof document==='undefined'||!this.tiles?.image)return;
        const source=this.tiles.image.data as CanvasImageSource,tw=this.tiles.width/3,th=this.tiles.height/2;
        const chunks:Array<{x:number;y:number}>=[];for(let y=0;y<40;y+=8)for(let x=0;x<40;x+=8)chunks.push({x,y});
        // Both atlas pages stay below 2048px. Keep one-pixel transparent cell gutters.
        for(let start=0;start<chunks.length;start+=21){
            const page=chunks.slice(start,start+21),cols=page.length===4?2:3;
            const canvas=document.createElement('canvas');canvas.width=cols*514;canvas.height=Math.ceil(page.length/cols)*258;
            const context=canvas.getContext('2d');if(!context)return;
            page.forEach(({x:cx,y:cy},slot)=>{
                context.save();context.translate((slot%cols)*514,Math.floor(slot/cols)*258);
                const center=toWorld({x:cx+3.5,y:cy+3.5});
                for(let sum=0;sum<=14;sum++)for(let dx=0;dx<8;dx++){
                    const dy=sum-dx;if(dy<0||dy>=8)continue;
                    const x=cx+dx,y=cy+dy,p=toWorld({x,y}),type=terrain(x,y);
                    const index=type==='road'?1:type==='rice'?2:type==='pond'?3:type==='courtyard'?4:(x+y)%13===0?5:0;
                    context.drawImage(source,(index%3)*tw,Math.floor(index/3)*th,tw,th,p.x-center.x+257-32,-p.y+center.y+129-16,64,32);
                }
                paintGround(context,cx,cy,this.groundTexture?.image?.data as CanvasImageSource|undefined);paintWaterAndShadows(context,cx,cy);context.restore();
            });
            const image=new ImageAsset(canvas),texture=new Texture2D();texture.image=image;this.generatedTextures.push(texture);
            page.forEach(({x,y},slot)=>{const frame=new SpriteFrame();frame.texture=texture;frame.rect=new Rect((slot%cols)*514,Math.floor(slot/cols)*258,514,258);this.environment.push(frame);this.terrainFrames.set(x+':'+y,frame);});
        }
    }
    terrainChunk(parent:Node,cx:number,cy:number):Node|null {
        if(!this.terrainFrames.size)this.bakeTerrain();const frame=this.terrainFrames.get(cx+':'+cy);if(!frame)return null;
        const center=toWorld({x:cx+3.5,y:cy+3.5}),node=this.sprite(parent,`PaintedTerrain-${cx}-${cy}`,frame,514,258);
        node.getComponent(UITransform)!.setAnchorPoint(0.5,0.5);node.setPosition(center.x,center.y);return node;
    }
    dispose():void{this.disposed=true;for(const frame of [...Array.from(this.objectFrames.values()),...this.scenery,...this.child,...this.details,...this.environment,...Object.values(this.decorations),...Object.values(this.avatarVariants).flat(),...Object.values(this.hairVariants).flat()])frame?.destroy();for(const texture of this.generatedTextures){const image=texture.image;texture.destroy();image?.destroy();}this.objectFrames.clear();this.objectLoads.clear();this.environmentLoads.clear();this.environmentLoaded.clear();this.sceneryLoad=undefined;this.terrainFrames.clear();this.scenery=[];this.child=[];this.details=[];this.environment=[];this.decorations={};this.avatarVariants={};this.hairVariants={};this.hairLoads.clear();this.avatarLoads.clear();this.decorationLoads.clear();this.generatedTextures=[];}
}
