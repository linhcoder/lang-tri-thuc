import {applyNpcPack,NpcText} from './NpcCatalog';
import {setLayoutOverrides,LayoutPack} from './LayoutOverrides';
import {layoutErrors} from './SceneLayout';
import {applyLayoutGeometry} from './VillageModel';
import {cmsApiUrl} from './CmsLoader';
import {contentVersion} from './ContentVersion';
export let loadedLayoutRevision=0;
let liveNpcs:NpcText[]|undefined;
export function applyLiveNpcs():boolean{return !!liveNpcs&&applyNpcPack({version:1,npcs:liveNpcs});}
/** Resolve a published layout before building any actors or collision geometry. */
export async function loadPublishedLayout():Promise<void>{
 if(typeof window==='undefined')return;
 try{if(new URLSearchParams(location.search).get('layoutPreview')==='1'){const preview=JSON.parse(localStorage.getItem('ltt.layout.preview')??'null');if(preview&&!layoutErrors(preview).length){setLayoutOverrides(preview);applyLayoutGeometry();return;}}const query=new URL(location.href),revision=query.searchParams.get('layoutRevision');const response=await fetch(cmsApiUrl()+'/content/layout'+(revision?'?revision='+encodeURIComponent(revision):''),{cache:'no-store',signal:AbortSignal.timeout(5000)});if(!response.ok)return;const value=await response.json() as {version:number;baseVersion:string;revision:number;pack:LayoutPack;npcs?:NpcText[]};
  if(value.version!==1||value.baseVersion!==contentVersion()||layoutErrors(value.pack).length)return;
  loadedLayoutRevision=value.revision;if(revision){query.searchParams.delete('layoutRevision');history.replaceState(null,'',query.href);}
  setLayoutOverrides(value.pack);applyLayoutGeometry();liveNpcs=value.npcs;applyLiveNpcs();window.dispatchEvent(new CustomEvent('ltt-layout-loaded',{detail:{revision:value.revision}}));
 }catch{/* A temporary outage keeps the built-in, playable village. */}
}
