import { Node, UITransform, Sprite, SpriteFrame, Texture2D, Rect, resources, ImageAsset } from 'cc';
import {paintCharacter} from './CharacterArt';
import {characterAsset} from './RedStarBoy';
import { terrain,toWorld,villageDetails,SIZE } from './VillageModel';
import { paintGround,paintMeadow } from './GroundPaths';
import {paintWaterAndShadows} from './WaterGround';
import {assetResourceKey,sceneryAssets} from './VisualAssets';
import {assetFrame,animationFrames,npcPoseFrames,npcDirectionFrames} from './TextureFrames';
export class VillageArt {
    private paintedCharacters:SpriteFrame[][]=[];
    private async loadRedStarBoy(id=0):Promise<void>{
        if(typeof document==='undefined')return;
        const asset=characterAsset(id);if(!asset)return;
        const image=new Image();image.src=new URL(asset.atlas,document.baseURI).href;
        try{await image.decode();if(this.disposed)return;
            const canvas=document.createElement('canvas');canvas.width=768;canvas.height=384;
            const c=canvas.getContext('2d');if(!c)return;
            for(let row=0;row<3;row++)for(let direction=0;direction<8;direction++){
                const y=asset.rows[row]*image.height,h=(asset.rows[row+1]-asset.rows[row])*image.height,w=image.width/8;
                const height=112,width=height*w/h;
                c.drawImage(image,direction*w,y,w,h,direction*96+(96-width)/2,row*128,width,height);
            }
            const texture=new Texture2D();texture.image=new ImageAsset(canvas);this.generatedTextures.push(texture);this.paintedCharacters[id]=this.slice(texture,8,3);
        }catch{console.warn('Character art unavailable; keeping character fallback',asset.atlas);}
    }
    private farmerFrames:SpriteFrame[]=[];
    private installFarmerFrames(texture:Texture2D):void{
        if(!Number.isFinite(texture.width)||!Number.isFinite(texture.height))return;
        // Source row gutters measured against alpha; crop only empty horizontal bands.
        for(const [top,bottom] of [[8,295],[306,574],[583,872]])for(let direction=0;direction<8;direction++){
            const frame=new SpriteFrame();frame.texture=texture;
            frame.rect=new Rect(direction*texture.width/8,top/887*texture.height,texture.width/8,(bottom-top)/887*texture.height);
            this.farmerFrames.push(frame);
        }
    }
    farmerFrame(direction:number,pose=0):SpriteFrame|null{return this.farmerFrames[pose*8+direction]??null;}
    child:SpriteFrame[]=[];environment:SpriteFrame[]=[];
    npcPoses:SpriteFrame[][]=[];
    npcDirections:SpriteFrame[][]=[];
    npcWalkSteps:SpriteFrame[][]=[];
    private expansionRows=new Map<string,number>();
    async ensureExpansionCharacters():Promise<void>{
        await Promise.all(['anh-nam','chi-mai','chu-hai','co-lan-song','be-minh','be-an'].map((id,index)=>new Promise<void>(resolve=>resources.load(assetResourceKey('character.'+id)+'/texture',Texture2D,(error,texture)=>{
            if(!error&&!this.disposed){const frames:SpriteFrame[]=[];for(let direction=0;direction<8;direction++){const frame=new SpriteFrame();frame.texture=texture;frame.rect=new Rect(direction%4*texture.width/4,Math.floor(direction/4)*texture.height/2,texture.width/4,texture.height/2);frames.push(frame);}this.npcDirections[8+index]=frames;this.expansionRows.set(id,8+index);}resolve();
        }))));
    }
    expansionCharacterFrame(id:string,direction:number,phase:number):SpriteFrame|null{const row=this.expansionRows.get(id);return row===undefined?null:phase<0?this.npcDirections[row][direction]:this.npcCycleFrame(row,direction,phase);}
    avatarVariants:Partial<Record<number,SpriteFrame[]>>={};
    details:SpriteFrame[]=[];
    hairVariants:Partial<Record<number,SpriteFrame[]>>={};private decorationLoads=new Map<string,Promise<void>>();private avatarLoads=new Map<number,Promise<void>>();private hairLoads=new Map<number,Promise<void>>();private disposed=false;
    decorations:Partial<Record<'elder'|'co-tam'|'lotus'|'teacher'|'market-lady'|'potter'|'ti-na'|'hang-cuoi'|'seedling',SpriteFrame>>={};
    private tiles?:Texture2D;
    private groundTexture?:Texture2D;private dirtTexture?:Texture2D;
    private generatedTextures:Texture2D[]=[];
    readonly environmentLoaded=new Set<number>();private environmentLoads=new Map<number,Promise<void>>();
    private objectFrames=new Map<string,SpriteFrame>();private objectLoads=new Map<string,Promise<SpriteFrame|undefined>>();
    private environmentIds=['dinh','house','banyan','banana','vegetation.rice','vegetation.rice','character.farmer'];
    objectFrame(id:string,index:number):SpriteFrame|undefined{return this.objectFrames.get(id)??(this.environmentLoaded.has(index)&&!!this.environmentIds[index]&&assetResourceKey(id)===assetResourceKey(this.environmentIds[index])?this.environment[index]:undefined);}
    ensureObject(id:string,index:number):Promise<SpriteFrame|undefined>{
        if(this.disposed)return Promise.resolve(undefined);const existing=this.objectFrame(id,index);if(existing)return Promise.resolve(existing);
        if(this.environmentIds[index]&&assetResourceKey(id)===assetResourceKey(this.environmentIds[index]))return this.ensureEnvironment(index).then(()=>this.objectFrame(id,index));
        const previous=this.objectLoads.get(id);if(previous)return previous;
        const task=new Promise<SpriteFrame|undefined>(resolve=>resources.load(assetResourceKey(id)+'/texture',Texture2D,(error,texture)=>{if(this.disposed||error){resolve(undefined);return;}const frame=assetFrame(texture,id);this.objectFrames.set(id,frame);resolve(frame);}));this.objectLoads.set(id,task);return task;
    }
    ensureEnvironment(index:number):Promise<void>{
        if(this.disposed||this.environmentLoaded.has(index))return Promise.resolve();const previous=this.environmentLoads.get(index);if(previous)return previous;
        const ids=['dinh','house','banyan','banana','vegetation.rice','vegetation.rice','character.farmer'];if(!ids[index])return Promise.resolve();
        const task=new Promise<void>(resolve=>resources.load(`${assetResourceKey(ids[index])}/texture`,Texture2D,(error,texture)=>{if(!this.disposed&&!error){this.environment[index]?.destroy();this.environment[index]=assetFrame(texture,ids[index]);this.environmentLoaded.add(index);}else if(error)console.warn('Regional scenery unavailable; keeping placeholder');resolve();}));this.environmentLoads.set(index,task);return task;
    }
    scenery:SpriteFrame[]=[];private sceneryLoad?:Promise<void>;
    ensureScenery():Promise<void>{
        if(this.disposed)return Promise.resolve();if(this.sceneryLoad)return this.sceneryLoad;
        const requests=new Map<string,Promise<Texture2D>>();
        this.sceneryLoad=Promise.all(sceneryAssets.map(async(asset,index)=>{
            const key=assetResourceKey(asset.id);let task=requests.get(key);
            if(!task){task=new Promise<Texture2D>((resolve,reject)=>resources.load(key+'/texture',Texture2D,(error,texture)=>error?reject(error):resolve(texture)));requests.set(key,task);}
            try{const texture=await task;if(this.disposed)return;const frame=assetFrame(texture,asset.id);
                this.scenery[index]=frame;
            }catch{console.warn('Scenery '+asset.id+' unavailable; base map remains playable');}
        })).then(()=>{});return this.sceneryLoad;
    }
    async load(onProgress:(value:number)=>void=()=>{}):Promise<void>{
        let completed=0;
        const load=(id:string)=>new Promise<Texture2D>((resolve,reject)=>resources.load(`${assetResourceKey(id)}/texture`,Texture2D,(error,asset)=>{onProgress(Math.min(.7,++completed/10));error?reject(error):resolve(asset);}));
        // Start independent downloads together instead of adding network round trips.
        const optional=(id:string,message:string)=>load(id).catch(()=>{console.warn(message);return undefined;});
        const [child,temple,banyan,farmer,tiles,ground,bamboo,dirt]=await Promise.all([
            load('avatar.child'),load('dinh'),load('banyan'),load('character.farmer'),load('ground.legacy'),
            optional('ground.meadow-texture','Ground texture unavailable; procedural terrain remains playable'),
            optional('bamboo','Village details unavailable; keeping base map'),
            optional('ground.dirt-texture','Dirt texture unavailable; keeping painted path colors'),
        ]);
        if(this.disposed)return;
        this.child=animationFrames(child,'avatar.child');this.tiles=tiles;
        this.groundTexture=ground;this.dirtTexture=dirt;
        if(bamboo)this.details=this.slice(bamboo,4,2);
        if(this.disposed)return;
        const frame=(texture:Texture2D,id:string)=>assetFrame(texture,id);
        this.environment=[frame(temple,'dinh'),frame(temple,'dinh'),frame(banyan,'banyan'),frame(temple,'dinh'),frame(temple,'dinh'),frame(temple,'dinh'),frame(farmer,'character.farmer')];[0,2,6].forEach(index=>this.environmentLoaded.add(index));
        await Promise.all([this.loadRedStarBoy(),this.loadRedStarBoy(1),this.loadNpcPoses(),...(['elder','lotus','seedling'] as const).map(name=>this.ensureDecoration(name)),...villageDetails.filter(o=>assetResourceKey(o.id)!==assetResourceKey('bamboo')).map(o=>this.ensureObject(o.id,-1))]);
        if(!this.disposed){this.installFarmerFrames(farmer);onProgress(1);}
    }
    private async loadNpcPoses():Promise<void>{
        await Promise.all([
            new Promise<void>(resolve=>resources.load('village/npc-poses-v1/texture',Texture2D,(error,texture)=>{if(!error&&!this.disposed){try{this.npcPoses=npcPoseFrames(texture);}catch{this.npcPoses=[];}}resolve();})),
            new Promise<void>(resolve=>resources.load('village/npc-directions-v1/texture',Texture2D,(error,texture)=>{if(!error&&!this.disposed)this.npcDirections=npcDirectionFrames(texture);resolve();})),
            new Promise<void>(resolve=>resources.load('village/npc-walk-step-v1/texture',Texture2D,(error,texture)=>{if(!error&&!this.disposed)this.npcWalkSteps=npcDirectionFrames(texture);resolve();})),
        ]);
    }
    detailFrame(id:string,index:number):SpriteFrame|undefined{return this.objectFrames.get(id)??this.details[index];}
    private slice(texture:Texture2D,columns:number,rows:number):SpriteFrame[]{
        const result:SpriteFrame[]=[];const width=texture.width/columns,height=texture.height/rows;
        for(let row=0;row<rows;row++)for(let col=0;col<columns;col++){
            const frame=new SpriteFrame();frame.texture=texture;frame.rect=new Rect(col*width,row*height,width,height);result.push(frame);
        }return result;
    }
    ensureDecoration(name:keyof VillageArt['decorations']):Promise<void>{
        if(this.disposed)return Promise.resolve();const existing=this.decorationLoads.get(name);if(existing)return existing;
        const ids={seedling:'vegetation.seedling',elder:'character.elder',lotus:'water.lotus','co-tam':'character.co-tam',teacher:'character.co-giao-lan','market-lady':'character.ba-ban-hang',potter:'character.nghe-nhan-gom','ti-na':'character.ti-na','hang-cuoi':'character.chi-hang-cuoi'};
        const task=new Promise<void>(resolve=>resources.load(`${assetResourceKey(ids[name])}/texture`,Texture2D,(error,texture)=>{
            if(!this.disposed&&!error)this.decorations[name]=assetFrame(texture,ids[name]);
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
    private drawnCharacters=new Map<string,SpriteFrame[]>();
    /** Keep authored poses at source resolution; gait moves the whole actor. */
    npcCycleFrame(row:number,direction:number,phaseFrame:number):SpriteFrame|null{
        const base=this.npcDirections[row],step=this.npcWalkSteps[row];
        // Never split the legs or resample into a tiny animation atlas.
        return (phaseFrame>=4?step?.[direction]:undefined)??base?.[direction]??null;
    }
    npcCharacterFrame(id:number,direction:number,phaseFrame:number,hair=1,skin=1):SpriteFrame{
        const key=`npc:${id}:${hair}:${skin}`;let frames=this.drawnCharacters.get(key);
        if(!frames&&typeof document!=='undefined'){
            const canvas=document.createElement('canvas');canvas.width=384;canvas.height=576;const context=canvas.getContext('2d');
            if(context){for(let row=0;row<9;row++)for(let d=0;d<8;d++){context.save();context.translate(d*48,row*64);context.scale(.5,.5);paintCharacter(context,id,row?1:0,d,hair,skin,row?(row-1)/8:undefined);context.restore();}const texture=new Texture2D();texture.image=new ImageAsset(canvas);this.generatedTextures.push(texture);frames=this.slice(texture,8,9);this.drawnCharacters.set(key,frames);}
        }
        return frames?.[Math.max(0,Math.min(8,phaseFrame))*8+direction]??this.avatarFrame(id,phaseFrame?1:0,direction,hair,skin);
    }
    avatarFrame(id:number,row:number,direction:number,hair=0,skin=0,age?:'3-5'|'6-8'|'9-11'):SpriteFrame{
        if(age!==undefined&&this.paintedCharacters[id]?.length)return this.paintedCharacters[id][row*8+direction];
        if((age!==undefined||id>=4||skin>0||hair===2)&&typeof document!=='undefined'){
            const key=id+':'+hair+':'+skin+':'+(age??'default');let frames=this.drawnCharacters.get(key);
            if(!frames){const canvas=document.createElement('canvas');canvas.width=768;canvas.height=384;const c=canvas.getContext('2d');if(c){for(let r=0;r<3;r++)for(let d=0;d<8;d++){c.save();c.translate(d*96,r*128);paintCharacter(c,id,r,d,hair,skin,undefined,age);c.restore();}const image=new ImageAsset(canvas),texture=new Texture2D();texture.image=image;this.generatedTextures.push(texture);frames=this.slice(texture,8,3);this.drawnCharacters.set(key,frames);}}
            if(frames)return frames[row*8+direction];
        }
        return (hair===1&&this.hairVariants[id]||this.avatarVariants[id]||this.child)[row*8+direction];}
    sprite(parent:Node,name:string,frame:SpriteFrame,width:number,height:number):Node {
        const node=new Node(name);node.layer=parent.layer;parent.addChild(node);
        const transform=node.addComponent(UITransform);transform.setContentSize(width,height);transform.setAnchorPoint(0.5,0);
        const sprite=node.addComponent(Sprite);sprite.sizeMode=Sprite.SizeMode.CUSTOM;sprite.spriteFrame=frame;
        return node;
    }
    private terrainFrames=new Map<string,SpriteFrame>();
    private bakeTerrain():void {
        if(typeof document==='undefined'||!this.tiles?.image)return;

        const chunks:Array<{x:number;y:number}>=[];for(let y=0;y<SIZE;y+=8)for(let x=0;x<SIZE;x+=8)chunks.push({x,y});
        // Both atlas pages stay below 2048px. Each cell includes a one-pixel painted sampling border.
        for(let start=0;start<chunks.length;start+=21){
            const page=chunks.slice(start,start+21),cols=page.length===4?2:3;
            const canvas=document.createElement('canvas');canvas.width=cols*514;canvas.height=Math.ceil(page.length/cols)*258;
            const context=canvas.getContext('2d');if(!context)return;
            page.forEach(({x:cx,y:cy},slot)=>{
                context.save();context.translate((slot%cols)*514,Math.floor(slot/cols)*258);
                paintGround(context,cx,cy,this.groundTexture?.image?.data as CanvasImageSource|undefined,this.dirtTexture?.image?.data as CanvasImageSource|undefined);paintWaterAndShadows(context,cx,cy);context.restore();
            });
            const image=new ImageAsset(canvas),texture=new Texture2D();texture.image=image;this.generatedTextures.push(texture);
            page.forEach(({x,y},slot)=>{const frame=new SpriteFrame();frame.texture=texture;frame.rect=new Rect((slot%cols)*514+1,Math.floor(slot/cols)*258+1,512,256);this.environment.push(frame);this.terrainFrames.set(x+':'+y,frame);});
        }
    }
    terrainChunk(parent:Node,cx:number,cy:number):Node|null {
        if(!this.terrainFrames.size)this.bakeTerrain();const frame=this.terrainFrames.get(cx+':'+cy);if(!frame)return null;
        const center=toWorld({x:cx+3.5,y:cy+3.5}),node=this.sprite(parent,`PaintedTerrain-${cx}-${cy}`,frame,512,256);
        node.getComponent(UITransform)!.setAnchorPoint(0.5,0.5);node.setPosition(center.x,center.y);return node;
    }
    meadowBackdrop(parent:Node):Node|null{
        if(this.disposed||typeof document==='undefined')return null;
        const canvas=document.createElement('canvas');canvas.width=1536;canvas.height=720;const context=canvas.getContext('2d');if(!context)return null;
        context.scale(.25,.25);context.translate(3072,720);paintMeadow(context,-3072,-720,3072,2160,this.groundTexture?.image?.data as CanvasImageSource|undefined);
        const image=new ImageAsset(canvas),texture=new Texture2D();texture.image=image;this.generatedTextures.push(texture);const frame=new SpriteFrame();frame.texture=texture;frame.rect=new Rect(0,0,canvas.width,canvas.height);this.environment.push(frame);
        const node=this.sprite(parent,'MeadowOutskirts',frame,6144,2880);node.getComponent(UITransform)!.setAnchorPoint(.5,.5);node.setPosition(0,-720);node.setSiblingIndex(0);return node;
    }
    dispose():void{this.disposed=true;for(const frame of [...Array.from(this.objectFrames.values()),...Array.from(this.drawnCharacters.values()).flat(),...this.npcPoses.flat(),...this.npcDirections.flat(),...this.npcWalkSteps.flat(),...this.paintedCharacters.flat(),...this.farmerFrames,...this.scenery,...this.child,...this.details,...this.environment,...Object.values(this.decorations),...Object.values(this.avatarVariants).flat(),...Object.values(this.hairVariants).flat()])frame?.destroy();for(const texture of this.generatedTextures){const image=texture.image;texture.destroy();image?.destroy();}this.paintedCharacters=[];this.farmerFrames=[];this.drawnCharacters.clear();this.objectFrames.clear();this.objectLoads.clear();this.environmentLoads.clear();this.environmentLoaded.clear();this.sceneryLoad=undefined;this.terrainFrames.clear();this.scenery=[];this.npcPoses=[];this.npcDirections=[];this.npcWalkSteps=[];this.child=[];this.details=[];this.environment=[];this.decorations={};this.avatarVariants={};this.hairVariants={};this.hairLoads.clear();this.avatarLoads.clear();this.decorationLoads.clear();this.generatedTextures=[];}
}
