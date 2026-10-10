import { villageObjects, villageDetails, storyNpcs, Point, VillageMap, terrain, bridgeTile } from './VillageModel';
import { groundAssets, groundNoise } from './GroundPaths';
export const assetGroups=['Ground','Paths','Buildings','Vegetation','Water','Props','Characters','Animals','UI','Effects'] as const;
export type AssetGroup=typeof assetGroups[number];
export interface VisualAsset {id:string;name:string;group:AssetGroup;path:string;size:readonly number[];anchor:readonly number[];layer:'Ground'|'Actors'|'HUD';collision:null|{radius:number}|{tiles:ReadonlyArray<Point>};status:'placeholder'|'final';source:string;cell?:number;}
const resource='assets/resources/village/';
const names=['flowers','shrub','stones','market','fence','shade-tree','grass-tuft','lantern'];
export const sceneryAssets:VisualAsset[]=names.map((name,cell)=>({id:'scenery.'+name,name,group:cell===3?'Buildings':cell===2||cell===4||cell===7?'Props':'Vegetation',path:resource+'scenery-v2.png',size:[cell===3?250:100,cell===3?220:100],anchor:[.5,0],layer:'Actors',collision:cell===3?{radius:1}:cell===4||cell===5||cell===7?{radius:0}:null,status:'placeholder',source:'OpenAI built-in imagegen, 2026-10-10; generated candidate awaiting artist approval',cell}));
sceneryAssets.push({id:'scenery.golden-rice',name:'Ripe rice clump',group:'Vegetation',path:resource+'rice-v4.png',size:[62,58],anchor:[.5,0],layer:'Actors',collision:null,status:'placeholder',source:'OpenAI built-in imagegen; docs/design/UI_RICE_ART_PASS.md'},{id:'scenery.wood-sign',name:'Wooden village sign',group:'Props',path:resource+'ui-v4.png',size:[132,68],anchor:[.5,0],layer:'Actors',collision:null,status:'placeholder',cell:6,source:'OpenAI built-in imagegen; docs/design/UI_RICE_ART_PASS.md'});
export const visualAssets:VisualAsset[]=[
    {id:'vegetation.seedling',name:'Young rice for chapter one',group:'Vegetation',path:resource+'rice-seedling.png',size:[31,46],anchor:[.5,0],layer:'Actors',collision:null,status:'placeholder',source:'OpenAI built-in imagegen; docs/design/RICE_MISSION_FIX.md'},
    {id:'ui.painted-atlas',name:'Painted HUD icons and signs',group:'UI',path:resource+'ui-v4.png',size:[82,48],anchor:[.5,.5],layer:'HUD',collision:null,status:'placeholder',source:'OpenAI built-in imagegen; docs/design/UI_RICE_ART_PASS.md'},
    ...groundAssets.map(a=>({...a,layer:'Ground' as const,source:'Project Canvas renderer'})),
    {id:'ground.meadow-texture',name:'Painted meadow',group:'Ground',path:resource+'ground-v2.png',size:[276,138],anchor:[.5,.5],layer:'Ground',collision:null,status:'placeholder',source:'OpenAI built-in imagegen, 2026-10-10; generated candidate awaiting artist approval'},
    {id:'ground.legacy',name:'Rice, courtyard and fallback tiles',group:'Ground',path:resource+'tiles.png',size:[64,32],anchor:[.5,.5],layer:'Ground',collision:null,status:'placeholder',source:'Project AI 3×2 atlas; source/prompt in apps/game-client/ART.md; art approval pending'},
    {id:'vegetation.rice',name:'Rice plant',group:'Vegetation',path:resource+'rice.png',size:[65,75],anchor:[.5,0],layer:'Actors',collision:null,status:'placeholder',source:'Project AI prototype; built-in imagegen prompts/source in apps/game-client/ART.md; art approval pending'},
    ...sceneryAssets,
    ...['child','boy-blue','girl-pink','girl-yellow','boy-red-hair','boy-blue-hair','girl-pink-hair','girl-yellow-hair'].map(name=>({id:'avatar.'+name,name,group:'Characters' as const,path:resource+name+'.png',size:[90,110],anchor:[.5,0],layer:'Actors' as const,collision:null,status:'placeholder' as const,source:'Project AI 8×3 sheet; built-in imagegen prompts/source in apps/game-client/ART.md; art approval pending'})),
    {id:'character.farmer',name:'Bác Nông Dân',group:'Characters',path:resource+'farmer.png',size:[130,145],anchor:[.5,0],layer:'Actors',collision:{radius:0},status:'placeholder',source:'Project AI prototype; built-in imagegen prompts/source in apps/game-client/ART.md; art approval pending'},
    {id:'character.elder',name:'Ông Đồ',group:'Characters',path:resource+'elder.png',size:[90,140],anchor:[.5,0],layer:'Actors',collision:{radius:0},status:'placeholder',source:'Project AI sprite; source/prompt in apps/game-client/ART.md; rendered width follows source aspect ratio; art approval pending'},
    ...villageObjects.map(o=>({id:o.id,name:o.id,group:(o.frame<2?'Buildings':'Vegetation') as AssetGroup,path:resource+(o.id==='dinh'?'temple-v3':o.id==='banyan'?'banyan-v3-clean':['temple','house','banyan','banana'][o.frame])+'.png',size:[o.width,o.height],anchor:[.5,0],layer:'Actors' as const,collision:{radius:o.radius},status:'placeholder' as const,source:o.id==='dinh'||o.id==='banyan'?'OpenAI built-in imagegen; prompts/source in docs/design/REFERENCE_ART_PASS.md; art approval pending':'Project AI prototype; built-in imagegen prompts/source in apps/game-client/ART.md; art approval pending'})),
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
    // Layered, low planting along water, field and courtyard edges. These are
    // cosmetic skirts, never new obstacles; keep interaction tiles clear.
    const borders=[...Array.from({length:7},(_,i)=>({x:6,y:20+i})),...Array.from({length:6},(_,i)=>({x:25+i,y:21})),...Array.from({length:6},(_,i)=>({x:24,y:14+i})),{x:17,y:24},{x:21,y:24},{x:24,y:24},{x:8,y:19},{x:9,y:19}];
    borders.forEach((p,i)=>{if(!map.walkable(p.x,p.y)||storyNpcs.some(n=>Math.hypot(n.x-p.x,n.y-p.y)<2)||Math.hypot(map.npc.x-p.x,map.npc.y-p.y)<2)return;placements.push({...p,id:'landscape-border-'+i,cell:i%3===0?1:0,width:72,height:42,essential:false});});
    for(let y=12;y<=20;y++)for(let x=25;x<=34;x++){if(!map.walkable(x,y))continue;placements.push({id:`golden-rice-${x}-${y}`,cell:8,x,y,width:62,height:58,essential:x%2===0&&y%2===0});}
    for(const [id,title,x,y] of [['banyan','Cây Đa Tri Thức',8,22],['courtyard','Sân Đình',23,19],['well','Giếng Làng',1,29],['market','Chợ Quê',24,34],['home','Nhà Của Bé',33,26],['rice','Ruộng Lúa',29,22]] as const)placements.push({id:'sign-'+id,cell:9,x,y,width:132,height:68,essential:true});
    return placements;
}
