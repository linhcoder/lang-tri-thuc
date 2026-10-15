import {npcCatalog,applyNpcPack,NpcText} from '../../game-client/assets/scripts/world/NpcCatalog';
import type {FastifyInstance} from 'fastify';
import type {Repository} from './Store';
import baked from '../../game-client/assets/scripts/world/SceneLayoutPack';
import {layoutErrors,sceneObjects} from '../../game-client/assets/scripts/world/SceneLayout';
import {applyLayoutGeometry,VillageMap,storyNpcs,elderTile,farmerTile,toWorld} from '../../game-client/assets/scripts/world/VillageModel';
import type {LayoutPack} from '../../game-client/assets/scripts/world/LayoutOverrides';
import {contentVersion} from '../../game-client/assets/scripts/world/ContentVersion';
export function layoutWarnings(pack:LayoutPack,npcs:readonly NpcText[]=storyNpcs):string[]{
 const map=new VillageMap();map.configureLayout(pack.placements);map.configureNpcs(npcs);const warnings:string[]=[];
 for(const npc of [...npcs,{id:'elder',...elderTile},{id:'farmer',...farmerTile}]){
  if(!map.walkableForNpc(npc.x,npc.y,npc.id))warnings.push(npc.id+': vị trí đứng nằm trong vùng va chạm của vật thể.');
  const reachable=[[1,0],[-1,0],[0,1],[0,-1]].some(([x,y])=>map.path({x:20,y:20},{x:Math.round(npc.x+x),y:Math.round(npc.y+y)}).length>0);
  if(!reachable)warnings.push(npc.id+': không có đường tiếp cận.');
  const p=toWorld(npc);for(const row of pack.placements){const o=sceneObjects().find(o=>o.id===row.id);if(o?.centered)continue;const q=toWorld(row);if(Math.abs(p.x-q.x)<row.width*.35&&p.y>q.y&&p.y-55<q.y+row.height)warnings.push(npc.id+': có thể bị che bởi '+(o?.name??row.id)+'.');}
 }
 return [...new Set(warnings)];
}
export function registerScenePublishing(app:FastifyInstance,store:Repository,auth:(req:any,admin?:boolean)=>Promise<any>){
 const fail=(message:string,statusCode=409)=>{throw Object.assign(Error(message),{statusCode});};
 app.get<{Querystring:{revision?:string}}>('/content/layout',async(req,reply)=>{reply.header('Cache-Control','no-store');return store.transaction(d=>({version:1,baseVersion:contentVersion(),revision:d.scenePublished?.revision??0,pack:d.scenePublished?.pack??baked,npcs:d.scenePublished?.npcs??npcCatalog()})).then(active=>{if(req.query.revision===undefined)return active;const revision=Number(req.query.revision);if(!Number.isSafeInteger(revision)||revision<0)fail('Invalid layout revision',400);if(revision===0)return {...active,revision:0,pack:baked,npcs:npcCatalog()};return store.transaction(d=>{const release=d.sceneReleases?.find(r=>r.revision===revision);if(!release)fail('Layout release no longer available',404);return {...active,revision,pack:release!.pack,npcs:release!.npcs??npcCatalog()};});});});
 app.get('/admin/scene-layout/releases',async req=>{await auth(req,true);return store.transaction(d=>({active:d.scenePublished?.revision??0,releases:d.sceneReleases??[]}));});
 app.post<{Body:{revision:number}}>('/admin/scene-layout/check',async req=>{await auth(req,true);return store.transaction(d=>{if((d.sceneLayout?.revision??0)!==req.body?.revision)fail('Layout revision conflict; reload before saving');return {warnings:layoutWarnings(d.sceneLayout?.pack??baked,npcCatalog().map(n=>({...n,...d.npcs[n.id]})))};});});
 app.post<{Body:{revision:number;acknowledgeWarnings?:boolean}}>('/admin/scene-layout/publish',async req=>{const actor=await auth(req,true);return store.transaction(d=>{
  const draft=d.sceneLayout??{revision:0,pack:baked,note:''};if(draft.revision!==req.body?.revision)fail('Layout revision conflict; reload before saving');const errors=layoutErrors(draft!.pack);if(errors.length)fail(errors.join(' '),400);const npcs=npcCatalog().map(n=>({...n,...d.npcs[n.id]}));let npcValid=false;try{applyLayoutGeometry(draft.pack.placements);npcValid=applyNpcPack({version:1,npcs},true);}finally{applyLayoutGeometry();}if(!npcValid)fail('Vị trí NPC bị vật thể chặn hoặc không có đường tiếp cận. Hãy sửa bố trí trước khi xuất bản.',400);const warnings=layoutWarnings(draft!.pack,npcs);if(warnings.length&&req.body.acknowledgeWarnings!==true)fail('Hãy xem và xác nhận cảnh báo trước khi xuất bản.');
  const revision=(d.scenePublished?.revision??0)+1;if(!d.sceneReleases?.length)d.sceneReleases=[{revision:0,pack:structuredClone(baked),created:Date.now(),note:'Bản đồ ban đầu',npcs:npcCatalog()}];
  const release={npcs,revision,pack:structuredClone(draft!.pack),note:draft!.note,created:Date.now()};d.scenePublished=release;d.sceneReleases=[...d.sceneReleases!,release].slice(-30);d.audit.push({actor:actor.id,action:'scene.publish',entity:String(revision),created:Date.now()});return release;
 });});
 app.post<{Body:{revision:number;activeRevision:number}}>('/admin/scene-layout/rollback',async req=>{const actor=await auth(req,true);return store.transaction(d=>{
  if((d.scenePublished?.revision??0)!==req.body?.activeRevision)fail('Layout revision conflict; reload before saving');const old=d.sceneReleases?.find(r=>r.revision===req.body.revision);if(!old)fail('Không tìm thấy phiên bản bản đồ.',404);
  const next={...structuredClone(old!),revision:(d.scenePublished?.revision??0)+1,created:Date.now(),note:'Khôi phục bản '+old!.revision};d.scenePublished=next;d.sceneReleases=[...(d.sceneReleases??[]),next].slice(-30);d.audit.push({actor:actor.id,action:'scene.rollback',entity:String(next.revision),created:Date.now()});return next;
 });});
}
