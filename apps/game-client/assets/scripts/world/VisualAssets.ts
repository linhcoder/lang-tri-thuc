import { villageObjects, villageDetails, storyNpcs, Point, VillageMap, terrain, bridgeTile } from './VillageModel';
import { groundAssets, groundNoise } from './GroundPaths';
export const assetGroups=['Ground','Paths','Buildings','Vegetation','Water','Props','Characters','Animals','UI','Effects'] as const;
export type AssetGroup=typeof assetGroups[number];
export interface VisualAsset {id:string;name:string;group:AssetGroup;path:string;size:readonly number[];anchor:readonly number[];layer:'Ground'|'Actors'|'HUD';collision:null|{radius:number}|{tiles:ReadonlyArray<Point>};status:'placeholder'|'final';source:string;cell?:number;}
const resource='assets/resources/village/';
const names=['flowers','shrub','stones','market','fence','shade-tree','grass-tuft','lantern'];
export const sceneryAssets:VisualAsset[]=names.map((name,cell)=>({id:'scenery.'+name,name,group:cell===3?'Buildings':cell===2||cell===4||cell===7?'Props':'Vegetation',path:resource+'scenery-v2.png',size:[cell===3?250:100,cell===3?220:100],anchor:[.5,0],layer:'Actors',collision:cell===3?{radius:1}:cell===4||cell===5||cell===7?{radius:0}:null,status:'placeholder',source:'OpenAI built-in imagegen, 2026-10-10; generated candidate awaiting artist approval',cell}));
export const visualAssets:VisualAsset[]=[
    ...groundAssets.map(a=>({...a,layer:'Ground' as const,source:'Project Canvas renderer'})),
    {id:'ground.meadow-texture',name:'Painted meadow',group:'Ground',path:resource+'ground-v2.png',size:[276,138],anchor:[.5,.5],layer:'Ground',collision:null,status:'placeholder',source:'OpenAI built-in imagegen, 2026-10-10; generated candidate awaiting artist approval'},
    {id:'ground.legacy',name:'Rice, courtyard and fallback tiles',group:'Ground',path:resource+'tiles.png',size:[64,32],anchor:[.5,.5],layer:'Ground',collision:null,status:'placeholder',source:'Project AI 3×2 atlas; source/prompt in apps/game-client/ART.md; art approval pending'},
    {id:'vegetation.rice',name:'Rice plant',group:'Vegetation',path:resource+'rice.png',size:[65,75],anchor:[.5,0],layer:'Actors',collision:null,status:'placeholder',source:'Project AI prototype; built-in imagegen prompts/source in apps/game-client/ART.md; art approval pending'},
    ...sceneryAssets,
    ...['child','boy-blue','girl-pink','girl-yellow','boy-red-hair','boy-blue-hair','girl-pink-hair','girl-yellow-hair'].map(name=>({id:'avatar.'+name,name,group:'Characters' as const,path:resource+name+'.png',size:[90,110],anchor:[.5,0],layer:'Actors' as const,collision:null,status:'placeholder' as const,source:'Project AI 8×3 sheet; built-in imagegen prompts/source in apps/game-client/ART.md; art approval pending'})),
    {id:'character.farmer',name:'Bác Nông Dân',group:'Characters',path:resource+'farmer.png',size:[130,145],anchor:[.5,0],layer:'Actors',collision:{radius:0},status:'placeholder',source:'Project AI prototype; built-in imagegen prompts/source in apps/game-client/ART.md; art approval pending'},
    {id:'character.elder',name:'Ông Đồ',group:'Characters',path:resource+'elder.png',size:[90,140],anchor:[.5,0],layer:'Actors',collision:{radius:0},status:'placeholder',source:'Project AI sprite; source/prompt in apps/game-client/ART.md; rendered width follows source aspect ratio; art approval pending'},
    ...villageObjects.map(o=>({id:o.id,name:o.id,group:(o.frame<2?'Buildings':'Vegetation') as AssetGroup,path:resource+['temple','house','banyan','banana'][o.frame]+'.png',size:[o.width,o.height],anchor:[.5,0],layer:'Actors' as const,collision:{radius:o.radius},status:'placeholder' as const,source:'Project AI prototype; built-in imagegen prompts/source in apps/game-client/ART.md; art approval pending'})),
    ...villageDetails.map(o=>({id:o.id,name:o.id,group:(o.frame>=3&&o.frame<=5?'Animals':o.frame===1?'Vegetation':'Props') as AssetGroup,path:resource+'village-details.png',size:[o.width,o.height],anchor:[.5,o.id==='bridge'?.5:0],layer:o.id==='bridge'?'Ground' as const:'Actors' as const,collision:o.blocked?{radius:0}:null,status:'placeholder' as const,source:'Project AI atlas; built-in imagegen prompts/source in apps/game-client/ART.md; art approval pending',cell:o.frame})),
    ...storyNpcs.map((n,i)=>({id:'character.'+n.id,name:n.name,group:'Characters' as const,path:resource+['ti-na','market-lady','teacher','potter','co-tam','hang-cuoi'][i]+'.png',size:[96,110],anchor:[.5,0],layer:'Actors' as const,collision:{radius:0},status:'placeholder' as const,source:'Project AI prototype; built-in imagegen prompts/source in apps/game-client/ART.md; art approval pending'})),
    {id:'water.lotus',name:'Sen',group:'Water',path:resource+'lotus.png',size:[80,80],anchor:[.5,.5],layer:'Actors',collision:null,status:'placeholder',source:'Project AI prototype; built-in imagegen prompts/source in apps/game-client/ART.md; art approval pending'},
    {id:'water.pond',name:'Ao và bờ nước',group:'Water',path:'assets/scripts/world/WaterGround.ts',size:[384,192],anchor:[.5,.5],layer:'Ground',collision:{tiles:Array.from({length:35},(_,i)=>({x:1+i%5,y:20+Math.floor(i/5)})).filter(p=>!bridgeTile(p.x,p.y))},status:'placeholder',source:'Project Canvas renderer; blocked water and walkable bridge footprint in VillageModel'},
    {id:'ui.village-hud',name:'Village HUD',group:'UI',path:'assets/scripts/ui/VillageHUD.ts',size:[1280,720],anchor:[.5,.5],layer:'HUD',collision:null,status:'placeholder',source:'Project Graphics + Label'},
    {id:'effects.contact-shadow',name:'Baked contact shadow',group:'Effects',path:resource+'scenery-v2.png',size:[100,30],anchor:[.5,0],layer:'Ground',collision:null,status:'placeholder',source:'Baked in imagegen sprites'},
];
/** Registry paths are the actual loader source; replacing a PNG keeps the stable ID. */
export function assetResourceKey(id:string):string{const asset=visualAssets.find(a=>a.id===id);if(!asset||!asset.path.startsWith('assets/resources/')||!asset.path.endsWith('.png'))throw new Error('Not a texture resource: '+id);return asset.path.slice('assets/resources/'.length,-4);}
export interface SceneryPlacement extends Point {id:string;cell:number;width:number;height:number;essential:boolean;}
export function sceneryPlacements():SceneryPlacement[]{
    const map=new VillageMap(),placements:SceneryPlacement[]=[{id:'market',cell:3,x:26,y:32,width:250,height:220,essential:true}];
    // Sparse repeatable foliage. Skip the interaction routes and all solid footprints.
    for(let y=3;y<38;y+=4)for(let x=2;x<38;x+=4){
        if(terrain(x,y)!=='grass'||!map.walkable(x,y)||storyNpcs.some(n=>Math.hypot(n.x-x,n.y-y)<3)||villageObjects.some(o=>Math.hypot(o.x-x,o.y-y)<3)||Math.abs(x-16)<3||Math.abs(y-21)<3)continue;
        const n=groundNoise(x,y,12),cell=n<.35?0:n<.6?1:n<.8?6:2;
        placements.push({id:`foliage-${x}-${y}`,cell,x,y,width:cell===2?65:80,height:cell===2?50:65,essential:false});
    }
    placements.push(...[{x:8,y:24},{x:6,y:26},{x:20,y:33},{x:24,y:21}].map((p,i)=>({...p,id:'flower-border-'+i,cell:0,width:80,height:65,essential:true})));
    placements.push({id:'courtyard-lantern-left',cell:7,x:17,y:18,width:65,height:85,essential:true},{id:'courtyard-lantern-right',cell:7,x:23,y:18,width:65,height:85,essential:true},{id:'east-fence',cell:4,x:34,y:21,width:120,height:65,essential:true},{id:'foreground-tree',cell:5,x:35,y:34,width:220,height:250,essential:true});
    return placements;
}
