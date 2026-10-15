import {flowerCareAtlasRects} from '../ui/FlowerCareAtlasRects';
import { villageObjects, villageDetails, storyNpcs, Point, SIZE, VillageMap, terrain, bridgeTile,villageSolids,toWorld,npcPatrolRoutes } from './VillageModel';
import { groundAssets, groundNoise } from './GroundPaths';
import {plantingPlots} from './ChapterOneProgress';
export const assetGroups=['Ground','Paths','Buildings','Vegetation','Water','Props','Characters','Animals','UI','Effects'] as const;
export type AssetGroup=typeof assetGroups[number];
export interface VisualAsset {id:string;name:string;group:AssetGroup;path:string;size:readonly number[];anchor:readonly number[];layer:'Ground'|'Actors'|'HUD';collision:null|{radius:number}|{tiles:ReadonlyArray<Point>};status:'placeholder'|'final';source:string;region?:readonly number[];cell?:number;columns?:number;rows?:number;trim?:boolean;rowCuts?:readonly number[];animationRows?:ReadonlyArray<readonly [number,number]>;}
const resource='assets/resources/village/';
const names=['flowers','shrub','stones','market','fence','shade-tree','grass-tuft','lantern'];
export const sceneryAssets:VisualAsset[]=names.map((name,cell)=>({id:'scenery.'+name,name,group:cell===3?'Buildings':cell===2||cell===4||cell===7?'Props':'Vegetation',path:resource+'scenery-v2.png',size:[cell===3?250:100,cell===3?220:100],anchor:[.5,0],layer:'Actors',collision:cell===3?{radius:1}:cell===4||cell===5||cell===7?{radius:0}:null,status:'placeholder',source:'OpenAI built-in imagegen, 2026-10-10; generated candidate awaiting artist approval',cell}));
sceneryAssets.push({id:'scenery.golden-rice',name:'Ripe rice clump',group:'Vegetation',path:resource+'rice-v4.png',size:[62,58],anchor:[.5,0],layer:'Actors',collision:null,status:'placeholder',source:'OpenAI built-in imagegen; docs/design/UI_RICE_ART_PASS.md'},{id:'scenery.wood-sign',name:'Wooden village sign',group:'Props',path:resource+'ui-v4.png',size:[132,68],anchor:[.5,0],layer:'Actors',collision:null,status:'placeholder',cell:6,source:'OpenAI built-in imagegen; docs/design/UI_RICE_ART_PASS.md'});
export const visualAssets:VisualAsset[]=[
    {id:'ground.dirt-texture',name:'Painted dirt material',group:'Ground',path:resource+'dirt-path-v1.png',size:[256,128],anchor:[.5,.5],layer:'Ground',collision:null,status:'placeholder',source:'OpenAI built-in image_gen; docs/design/dirt-path-v1.prompt.json'},
    ...['village','school','farm','market','craft','forest','river','science','culture','island'].map(id=>({id:'journey.'+id,name:'Journey region / '+id,group:'Buildings' as const,path:resource+'journey-regions-v1/'+id+'.png',size:[360,240],anchor:[.5,0],layer:'Actors' as const,collision:null,status:'placeholder' as const,trim:true,source:'OpenAI built-in imagegen, 2026-10-15; original illustration per region; docs/design/JOURNEY_REGION_ASSETS.md'})),
    {id:'schoolyard.dirt-pitch',name:'Traditional dirt football pitch',group:'Props',path:resource+'schoolyard-v2/dirt-pitch.png',size:[360,240],anchor:[.5,.5],layer:'Ground',collision:null,status:'placeholder',source:'OpenAI built-in imagegen; docs/design/schoolyard-v2.prompt.txt'},
    {id:'schoolyard.vietnam-flag',name:'Vietnam flag cloth: eight animated poses',group:'Props',path:resource+'schoolyard-v2/vietnam-flag-atlas.png',size:[72,48],anchor:[0,1],layer:'Actors',collision:null,status:'final',source:'Editable vector: docs/design/vietnam-flag-atlas.svg; tools/render-school-flag.cjs'},
    ...['panel','title','card','continue','close','seed','stone','pencil','water','book','ball','broken','foot','correct','wrong','hint'].map((name,i)=>({id:'ui.flower-care.'+name,name:'Chăm hoa • '+name,group:'UI' as const,path:resource+'flower-care-v1/atlas.png',size:[100,100],anchor:[.5,.5],layer:'HUD' as const,collision:null,status:'final' as const,region:flowerCareAtlasRects[i].map(n=>n/1254),source:'OpenAI built-in imagegen, 2026-10-13; docs/design/FLOWER_CARE_UI.md'})),
    ...[{id:'hills',region:[0,75,640,305]},{id:'fields',region:[640,45,685,365]},{id:'hay',region:[1320,0,454,448]},{id:'rooster',region:[35,380,485,500]},{id:'dog',region:[625,440,560,400]},{id:'cat',region:[1260,445,514,400]}].map(item=>({id:'countryside.'+item.id,name:item.id,group:(['dog','cat','rooster'].includes(item.id)?'Animals':'Vegetation') as AssetGroup,path:resource+'countryside-v1/atlas.png',region:item.region.map((value,index)=>value/(index%2===0?1774:887)),size:[100,80],anchor:[.5,0],layer:'Actors' as const,collision:null,status:'placeholder' as const,trim:true,source:'OpenAI built-in imagegen; docs/design/COUNTRYSIDE_ASSETS.md'})),
    ...['riverside','garden','school'].map(name=>({id:'expansion.'+name,name,group:'Buildings' as const,path:resource+'expansion-v1/'+name+'.png',size:[360,270],anchor:[.5,0],layer:'Actors' as const,collision:null,status:'placeholder' as const,trim:true,source:'OpenAI built-in imagegen; docs/design/EXPANSION_ASSETS.md'})),
    {id:'animation.npc-directions',name:'Eight viewpoints for eight village NPCs',group:'Characters',path:resource+'npc-directions-v1.png',size:[256,256],anchor:[.5,0],layer:'Actors',collision:null,status:'placeholder',columns:8,rows:8,source:'OpenAI built-in imagegen, 11/10/2026; docs/design/npc-directions-v1.prompt.txt; candidate pending artist review'},
    {id:'animation.npc-walk-step',name:'Second walking phase for eight NPC viewpoints',group:'Characters',path:resource+'npc-walk-step-v1.png',size:[256,256],anchor:[.5,0],layer:'Actors',collision:null,status:'placeholder',columns:8,rows:8,source:'OpenAI built-in imagegen, 12/10/2026; docs/design/npc-walk-step-v1.prompt.txt; candidate pending artist review'},
    {id:'animation.npc-poses',name:'Eight NPC walk and greeting poses',group:'Characters',path:resource+'npc-poses-v1.png',size:[256,256],anchor:[.5,0],layer:'Actors',collision:null,status:'placeholder',columns:3,rows:8,source:'OpenAI built-in imagegen, 11/10/2026; docs/design/NPC_POSES.md; artist review pending'},
    {id:'vegetation.seedling',name:'Young rice for chapter one',group:'Vegetation',path:resource+'rice-seedling.png',size:[40,56],anchor:[.5,0],layer:'Actors',collision:null,status:'placeholder',trim:true,source:'OpenAI built-in imagegen, replacement 11/10/2026; docs/design/RICE_MISSION_FIX.md'},
    {id:'ui.painted-atlas',name:'Painted HUD icons and signs',group:'UI',path:resource+'ui-v4.png',size:[82,48],anchor:[.5,.5],layer:'HUD',collision:null,status:'placeholder',source:'OpenAI built-in imagegen; docs/design/UI_RICE_ART_PASS.md'},
    ...groundAssets.map(a=>({...a,layer:'Ground' as const,source:'Project Canvas renderer'})),
    {id:'ground.meadow-texture',name:'Painted meadow',group:'Ground',path:resource+'grass-meadow-v1.png',size:[276,138],anchor:[.5,.5],layer:'Ground',collision:null,status:'placeholder',source:'OpenAI built-in image_gen, 2026-10-15; docs/design/grass-meadow-v1.prompt.json'},
    {id:'ground.legacy',name:'Rice, courtyard and fallback tiles',group:'Ground',path:resource+'tiles.png',size:[64,32],anchor:[.5,.5],layer:'Ground',collision:null,status:'placeholder',source:'Project AI 3×2 atlas; source/prompt in apps/game-client/ART.md; art approval pending'},
    {id:'vegetation.rice',name:'Rice plant',group:'Vegetation',path:resource+'rice.png',size:[65,75],anchor:[.5,0],layer:'Actors',collision:null,status:'placeholder',source:'Project AI prototype; built-in imagegen prompts/source in apps/game-client/ART.md; art approval pending'},
    ...sceneryAssets,
    ...['child','boy-blue','girl-pink','girl-yellow','boy-red-hair','boy-blue-hair','girl-pink-hair','girl-yellow-hair'].map(name=>({id:'avatar.'+name,name,group:'Characters' as const,path:resource+name+'.png',size:[90,110],anchor:[.5,0],layer:'Actors' as const,collision:null,status:'placeholder' as const,source:'Project AI 8×3 sheet; built-in imagegen prompts/source in apps/game-client/ART.md; art approval pending'})),
    {id:'character.farmer',name:'Bác Nông Dân',group:'Characters',path:resource+'farmer.png',size:[130,145],anchor:[.5,0],layer:'Actors',collision:{radius:0},status:'placeholder',source:'Project AI prototype; built-in imagegen prompts/source in apps/game-client/ART.md; art approval pending'},
    {id:'character.elder',name:'Ông Đồ',group:'Characters',path:resource+'elder.png',size:[90,140],anchor:[.5,0],layer:'Actors',collision:{radius:0},status:'placeholder',source:'Project AI sprite; source/prompt in apps/game-client/ART.md; rendered width follows source aspect ratio; art approval pending'},
    ...villageObjects.map(o=>({id:o.id,name:o.id,group:(o.frame<2?'Buildings':'Vegetation') as AssetGroup,path:resource+(o.id==='dinh'?'temple-v3':o.id==='house'?'house-v5':o.id==='banyan'?'banyan-v3-clean':['temple','house','banyan','banana'][o.frame])+'.png',size:[o.width,o.height],anchor:[.5,0],layer:'Actors' as const,collision:{radius:o.radius},status:'placeholder' as const,source:o.id==='house'?'OpenAI built-in imagegen, 2026-10-10; exact prompt in docs/design/house-v5.prompt.txt; transparent candidate awaiting artist approval':o.id==='dinh'||o.id==='banyan'?'OpenAI built-in imagegen; prompts/source in docs/design/REFERENCE_ART_PASS.md; art approval pending':'Project AI prototype; built-in imagegen prompts/source in apps/game-client/ART.md; art approval pending'})),
    ...villageDetails.map(o=>({id:o.id,name:o.id,group:(o.frame>=3&&o.frame<=5?'Animals':o.frame===1?'Vegetation':'Props') as AssetGroup,path:resource+'village-details.png',size:[o.width,o.height],anchor:[.5,o.id.startsWith('bridge')?.5:0],layer:o.id.startsWith('bridge')?'Ground' as const:'Actors' as const,collision:o.blocked?{radius:0}:null,status:'placeholder' as const,source:'Project AI atlas; built-in imagegen prompts/source in apps/game-client/ART.md; art approval pending',cell:o.frame})),
    ...storyNpcs.map((n,i)=>({id:'character.'+n.id,name:n.name,group:'Characters' as const,path:i<6?resource+['ti-na','market-lady','teacher','potter','co-tam','hang-cuoi'][i]+'.png':'assets/scripts/world/CharacterArt.ts',size:[96,110],anchor:[.5,0],layer:'Actors' as const,collision:{radius:0},status:'placeholder' as const,source:'Project AI prototype; built-in imagegen prompts/source in apps/game-client/ART.md; art approval pending'})),
    {id:'water.lotus',name:'Sen',group:'Water',path:resource+'lotus.png',size:[80,80],anchor:[.5,.5],layer:'Actors',collision:null,status:'placeholder',source:'Project AI prototype; built-in imagegen prompts/source in apps/game-client/ART.md; art approval pending'},
    {id:'water.pond',name:'Ao và bờ nước',group:'Water',path:'assets/scripts/world/WaterGround.ts',size:[384,192],anchor:[.5,.5],layer:'Ground',collision:{tiles:Array.from({length:SIZE*SIZE},(_,i)=>({x:i%SIZE,y:Math.floor(i/SIZE)})).filter(p=>terrain(p.x,p.y)==='pond'&&!bridgeTile(p.x,p.y))},status:'placeholder',source:'Project Canvas renderer; blocked water and walkable bridge footprint in VillageModel'},
    {id:'ui.village-hud',name:'Village HUD',group:'UI',path:'assets/scripts/ui/VillageHUD.ts',size:[1280,720],anchor:[.5,.5],layer:'HUD',collision:null,status:'placeholder',source:'Project Graphics + Label'},
    {id:'effects.contact-shadow',name:'Baked contact shadow',group:'Effects',path:resource+'scenery-v2.png',size:[100,30],anchor:[.5,0],layer:'Ground',collision:null,status:'placeholder',source:'Baked in imagegen sprites'},
];
// One illustration pass supplies the main landmarks, characters and garden borders.
const propCells:Record<string,number>={dinh:0,banyan:1,house:2,'house-west':2,'scenery.market':3,well:4,bridge:5,'bridge-west':5,buffalo:6,'gate-arch':7,boat:8,cat:9,'scenery.flowers':10,'scenery.shrub':11};
const npcCells:Record<string,number>={'character.elder':0,'character.farmer':1,'character.co-tam':2,'character.ba-ban-hang':3,'character.ti-na':4,'character.co-giao-lan':5,'character.nghe-nhan-gom':6,'character.chi-hang-cuoi':7};
for(const asset of visualAssets){
    if(['anh-nam','chi-mai','chu-hai','co-lan-song','be-minh','be-an'].some(id=>asset.id==='character.'+id))Object.assign(asset,{path:resource+'expansion-v1/'+asset.id.slice(10)+'.png',cell:6,columns:4,rows:2,trim:true,source:'OpenAI built-in imagegen; eight authored viewpoints; docs/design/EXPANSION_ASSETS.md'});
    if(propCells[asset.id]!==undefined)Object.assign(asset,{path:resource+'reference-props-v1.png',cell:propCells[asset.id],columns:4,rows:3,rowCuts:[398/1086,734/1086],trim:true,source:'OpenAI built-in imagegen; exact prompts and source in docs/design/reference-completion-prompts.json'});
    if(npcCells[asset.id]!==undefined)Object.assign(asset,{path:resource+'reference-npcs-v1.png',cell:npcCells[asset.id],columns:4,rows:2,rowCuts:[450/887],trim:true,source:'OpenAI built-in imagegen; exact prompts and source in docs/design/reference-completion-prompts.json'});
    if(asset.id==='avatar.child')Object.assign(asset,{path:resource+'reference-child-v1.png',animationRows:[[27/887,283/887],[306/887,283/887],[583/887,283/887]],source:'OpenAI built-in imagegen; 8x3 layout preserved; docs/design/reference-completion-prompts.json'});
    if(asset.id==='banyan')Object.assign(asset,{path:resource+'reference-banyan-v1.png',cell:undefined,columns:undefined,rows:undefined,rowCuts:undefined,trim:true});
}
// Farmer identity comes from the user's portrait, with dedicated eight-view poses.
const farmerAsset=visualAssets.find(asset=>asset.id==='character.farmer')!;
Object.assign(farmerAsset,{path:resource+'farmer-workwear-v2.png',cell:6,columns:8,rows:3,rowCuts:[300/887,578/887],trim:false,source:'OpenAI built-in image_gen; user portrait reference; docs/design/farmer-workwear-v2.prompt.json'});
Object.assign(visualAssets.find(asset=>asset.id==='character.co-tam')!,{path:resource+'co-tam-reference-v1.png',cell:6,columns:8,rows:3,rowCuts:[296/887,592/887],trim:false,source:'OpenAI built-in image_gen; docs/design/co-tam-reference-v1.prompt.json'});
Object.assign(visualAssets.find(asset=>asset.id==='character.ba-ban-hang')!,{path:resource+'market-lady-reference-v1.png',cell:6,columns:8,rows:3,rowCuts:[296/887,592/887],trim:false,source:'OpenAI built-in image_gen; docs/design/market-lady-reference-v1.prompt.json'});
Object.assign(visualAssets.find(asset=>asset.id==='character.co-giao-lan')!,{path:resource+'teacher-lan-reference-v1.png',cell:6,columns:8,rows:3,rowCuts:[296/887,592/887],trim:false,source:'OpenAI built-in image_gen; docs/design/teacher-lan-reference-v1.prompt.json'});
/** Registry paths are the actual loader source; replacing a PNG keeps the stable ID. */
export function assetResourceKey(id:string):string{const asset=visualAssets.find(a=>a.id===id);if(!asset||!asset.path.startsWith('assets/resources/')||!asset.path.endsWith('.png'))throw new Error('Not a texture resource: '+id);return asset.path.slice('assets/resources/'.length,-4);}
export interface SceneryPlacement extends Point {id:string;cell:number;width:number;height:number;essential:boolean;}
export function sceneryPlacements():SceneryPlacement[]{
    const map=new VillageMap(),placements:SceneryPlacement[]=[{id:'market',cell:3,x:23,y:29,width:340,height:180,essential:true}];
    const patrolPoints=npcPatrolRoutes().flatMap(route=>route.points.map(toWorld));
    // Sparse repeatable foliage. Skip the interaction routes and all solid footprints.
    for(let y=3;y<38;y+=3)for(let x=2;x<38;x+=3){
        if(terrain(x,y)!=='grass'||!map.walkable(x,y)||storyNpcs.some(n=>Math.hypot(n.x-x,n.y-y)<3)||villageObjects.some(o=>Math.hypot(o.x-x,o.y-y)<3)||Math.abs(x-16)<3||Math.abs(y-21)<3)continue;
        const n=groundNoise(x,y,12),cell=n<.35?0:n<.6?1:n<.8?6:2;
        placements.push({id:`foliage-${x}-${y}`,cell,x,y,width:cell===2?65:95,height:cell===2?50:72,essential:false});
    }
    placements.push(...[{x:8,y:24},{x:6,y:26},{x:20,y:33},{x:24,y:21}].map((p,i)=>({...p,id:'flower-border-'+i,cell:0,width:80,height:65,essential:true})));
    for(const fence of villageSolids.filter(o=>o.id.startsWith('rice-fence-')))placements.push({...fence,cell:4,width:fence.id.includes('west')?72:110,height:45,essential:true});
    // Canopy behind the central landmarks fills the upper frame in low quality too.
    for(const [i,p] of [{x:11,y:15},{x:15,y:12},{x:18,y:10}].entries())placements.push({...p,id:'back-canopy-'+i,cell:5,width:260,height:240,essential:true});
    placements.push({id:'courtyard-lantern-left',cell:7,x:20,y:16,width:65,height:85,essential:true},{id:'courtyard-lantern-right',cell:7,x:22,y:17,width:65,height:85,essential:true},{id:'east-fence',cell:4,x:34,y:21,width:120,height:65,essential:true},{id:'foreground-tree',cell:5,x:35,y:34,width:220,height:250,essential:true});
    // Layered, low planting along water, field and courtyard edges. These are
    // cosmetic skirts, never new obstacles; keep interaction tiles clear.
    const borders=[...Array.from({length:7},(_,i)=>({x:6,y:20+i})),...Array.from({length:6},(_,i)=>({x:25+i,y:21})),...Array.from({length:6},(_,i)=>({x:24,y:14+i})),{x:17,y:24},{x:21,y:24},{x:24,y:24},{x:8,y:19},{x:9,y:19}];
    borders.forEach((p,i)=>{if(!map.walkable(p.x,p.y)||storyNpcs.some(n=>Math.hypot(n.x-p.x,n.y-p.y)<2)||Math.hypot(map.npc.x-p.x,map.npc.y-p.y)<2)return;placements.push({...p,id:'landscape-border-'+i,cell:i%3===0?1:0,width:72,height:42,essential:true});});
    // Low bank planting follows the pond without covering the bridge approach.
    for(let y=24;y<=31;y++)if(y!==28)placements.push({id:'pond-bank-'+y,cell:y%3===0?2:0,x:16,y,width:100,height:42,essential:true});
    for(const [i,p] of [{x:1,y:18},{x:9,y:31},{x:33,y:25},{x:36,y:15}].entries()){
        if(map.walkable(p.x,p.y)&&!storyNpcs.some(n=>Math.hypot(n.x-p.x,n.y-p.y)<4))placements.push({...p,id:'village-grove-'+i,cell:5,width:160,height:180,essential:false});
    }
    for(let y=12;y<=20;y++)for(let x=25;x<=34;x++){if(!map.walkable(x,y)||storyNpcs.some(n=>Math.hypot(n.x-x,n.y-y)<=1)||Math.hypot(x-30,y-12)<=2||[{x:29,y:15},{x:26,y:17}].some(p=>Math.hypot(p.x-x,p.y-y)<=1))continue;
        // Reserve the full projected sprite footprint, not just its ground tile.
        const base=toWorld({x,y});
        if(plantingPlots.some(p=>{const plot=toWorld(p);return Math.abs(plot.x-base.x)<76&&base.y<plot.y+62&&base.y+68>plot.y-22;}))continue;
        placements.push({id:`golden-rice-${x}-${y}`,cell:8,x,y,width:86,height:68,essential:true});
    }
    for(const [id,title,x,y] of [['banyan','Cây Đa Tri Thức',12.5,18.5],['courtyard','Sân Đình',19,12],['well','Giếng Làng',16,23],['market','Chợ Quê',21.5,26.5],['home','Nhà Của Bé',27,9.5],['rice','Ruộng Lúa',28,21]] as const)placements.push({id:'sign-'+id,cell:9,x,y,width:id==='banyan'?132:100,height:id==='banyan'?68:48,essential:true});
    for(const item of placements)if(item.cell===0){item.width=Math.max(item.width,95);item.height=Math.min(item.height,45);}
    return placements.filter(item=>{
        if(![0,1,6,8].includes(item.cell))return true;
        const base=toWorld(item);
        return !plantingPlots.some(p=>{const plot=toWorld(p);return Math.abs(plot.x-base.x)<item.width/2+33&&base.y<plot.y+62&&base.y+item.height>plot.y-22;})&&(item.cell===8||!patrolPoints.some(p=>Math.abs(p.x-base.x)<item.width/2+24&&base.y<=p.y+2&&base.y+item.height>p.y-8));
    });
}
