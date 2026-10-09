import { Node, UITransform, Sprite, SpriteFrame, Texture2D, Rect, resources, ImageAsset } from 'cc';
import { terrain,toWorld } from './VillageModel';
export class VillageArt {
    child:SpriteFrame[]=[];environment:SpriteFrame[]=[];
    avatarVariants:Partial<Record<number,SpriteFrame[]>>={};
    details:SpriteFrame[]=[];
    hairVariants:Partial<Record<number,SpriteFrame[]>>={};private decorationLoads=new Map<string,Promise<void>>();private avatarLoads=new Map<number,Promise<void>>();private hairLoads=new Map<number,Promise<void>>();private disposed=false;
    decorations:Partial<Record<'elder'|'co-tam'|'lotus'|'teacher'|'market-lady'|'potter'|'ti-na'|'hang-cuoi',SpriteFrame>>={};
    private tiles?:Texture2D;
    private generatedTextures:Texture2D[]=[];
    async load():Promise<void>{
        const load=(name:string)=>new Promise<Texture2D>((resolve,reject)=>resources.load(`${name}/texture`,Texture2D,(error,asset)=>error?reject(error):resolve(asset)));
        const [child,temple,house,banyan,banana,rice,farmer,tiles]=await Promise.all(['child','temple','house','banyan','banana','rice','farmer','tiles'].map(name=>load(`village/${name}`)));
        this.child=this.slice(child,8,3);this.tiles=tiles;
        try{this.details=this.slice(await load('village/village-details'),4,2);}catch{console.warn('Village details unavailable; keeping base map');}
        const frame=(texture:Texture2D)=>this.slice(texture,1,1)[0];
        this.environment=[frame(temple),frame(house),frame(banyan),frame(banana),frame(rice),frame(rice),frame(farmer)];
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
        const task=new Promise<void>(resolve=>resources.load(`village/${name}/texture`,Texture2D,(error,texture)=>{
            if(!this.disposed&&!error)this.decorations[name]=this.slice(texture,1,1)[0];
            else if(error)console.warn(`Village decoration ${name} unavailable; keeping fallback`);resolve();
        }));this.decorationLoads.set(name,task);return task;
    }
    ensureAvatar(id:number):Promise<void>{
        if(this.disposed||id===0||!Number.isInteger(id)||id<0||id>3)return Promise.resolve();
        const previous=this.avatarLoads.get(id);if(previous)return previous;
        const names=['child','boy-blue','girl-pink','girl-yellow'];
        const task=new Promise<void>(resolve=>resources.load(`village/${names[id]}/texture`,Texture2D,(error,texture)=>{
            if(!this.disposed&&!error)this.avatarVariants[id]=this.slice(texture,8,3);
            else if(error)console.warn('Avatar unavailable; using original sprite');resolve();
        }));this.avatarLoads.set(id,task);return task;
    }
    ensureHair(id:number):Promise<void>{
        if(this.disposed||!Number.isInteger(id)||id<0||id>3)return Promise.resolve();
        const existing=this.hairLoads.get(id);if(existing)return existing;
        const names=['boy-red-hair','boy-blue-hair','girl-pink-hair','girl-yellow-hair'];
        const task=new Promise<void>(resolve=>resources.load(`village/${names[id]}/texture`,Texture2D,(error,texture)=>{
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
    terrainChunk(parent:Node,cx:number,cy:number):Node|null {
        if(typeof document==='undefined'||!this.tiles?.image)return null;
        const canvas=document.createElement('canvas');canvas.width=514;canvas.height=258;
        const context=canvas.getContext('2d');if(!context)return null;
        const center=toWorld({x:cx+3.5,y:cy+3.5}),source=this.tiles.image.data as CanvasImageSource;
        const tw=this.tiles.width/3,th=this.tiles.height/2;
        for(let sum=0;sum<=14;sum++)for(let dx=0;dx<8;dx++){
            const dy=sum-dx;if(dy<0||dy>=8)continue;
            const x=cx+dx,y=cy+dy,p=toWorld({x,y}),type=terrain(x,y);
            const index=type==='road'?1:type==='rice'?2:type==='pond'?3:type==='courtyard'?4:(x+y)%13===0?5:0;
            context.drawImage(source,(index%3)*tw,Math.floor(index/3)*th,tw,th,p.x-center.x+257-32,-p.y+center.y+129-16,64,32);
        }
        const image=new ImageAsset(canvas),texture=new Texture2D();texture.image=image;this.generatedTextures.push(texture);
        const frame=new SpriteFrame();frame.texture=texture;this.environment.push(frame);
        const node=this.sprite(parent,`PaintedTerrain-${cx}-${cy}`,frame,514,258);node.getComponent(UITransform)!.setAnchorPoint(0.5,0.5);node.setPosition(center.x,center.y);return node;
    }
    dispose():void{this.disposed=true;for(const frame of [...this.child,...this.details,...this.environment,...Object.values(this.decorations),...Object.values(this.avatarVariants).flat(),...Object.values(this.hairVariants).flat()])frame?.destroy();for(const texture of this.generatedTextures){const image=texture.image;texture.destroy();image?.destroy();}this.child=[];this.details=[];this.environment=[];this.decorations={};this.avatarVariants={};this.hairVariants={};this.hairLoads.clear();this.avatarLoads.clear();this.decorationLoads.clear();this.generatedTextures=[];}
}
