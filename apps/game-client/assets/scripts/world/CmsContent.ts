import {contentVersion} from './ContentVersion';
import {VillageMap,storyNpcs,elderTile,farmerTile} from './VillageModel';
import {worldZones} from './WorldZones';
import {plantingPlots} from './ChapterOneProgress';
import {visualAssets} from './VisualAssets';
import {chapters} from './CampaignContent';

export interface DialogueNode {id:string;text:string;choices:Array<{label:string;next:string;questId?:string}>}
export interface CmsNpc {id:string;name:string;assetId:string;x:number;y:number;dialogue:DialogueNode[];entry:string;questId:string;enabled:boolean}
export interface CmsManifest {schema:1;baseVersion:string;version:string;npcs:CmsNpc[]}
export interface CmsState {revision:number;status:'draft'|'reviewed'|'approved';note:string;npcs:CmsNpc[];active:string;releases:Array<{id:string;created:number;note:string;manifest:CmsManifest}>}
export const emptyCms=():CmsState=>({revision:0,status:'draft',note:'',npcs:[],active:'',releases:[]});
export const cmsAssets=()=>visualAssets.filter(a=>a.id.startsWith('character.')&&a.group==='Characters'&&a.path.endsWith('.png'));
export const cmsQuests=()=>chapters.flatMap(c=>c.quests.map(q=>({id:q.id,title:q.title,chapter:c.id})));
/** Additive, non-blocking village actors never change campaign or multiplayer rules. */
export function cmsErrors(npcs:unknown):string[]{
 const errors:string[]=[];if(!Array.isArray(npcs)||npcs.length>40)return ['Danh sách NPC phải có tối đa 40 nhân vật.'];
 const map=new VillageMap(),ids=new Set<string>(),occupied=new Set(storyNpcs.map(n=>n.x+':'+n.y)),reserved=[{x:20,y:20},elderTile,farmerTile,...plantingPlots,...worldZones.map(z=>z.spawn)];
 const text=(s:unknown,max:number)=>typeof s==='string'&&s.trim().length>0&&s.length<=max;
 for(const n of npcs){if(!n||typeof n!=='object'){errors.push('NPC không hợp lệ.');continue;}const prefix=String(n.id)+': ';
  if(typeof n.id!=='string'||!/^cms-[a-z0-9][a-z0-9-]{0,43}$/.test(n.id)||ids.has(n.id))errors.push(prefix+'ID không hợp lệ hoặc bị trùng.');ids.add(n.id);
  if(!text(n.name,50)||typeof n.enabled!=='boolean'||!cmsAssets().some(a=>a.id===n.assetId))errors.push(prefix+'Tên, trạng thái hoặc ảnh nhân vật không hợp lệ.');
  if(![n.x,n.y].every(v=>Number.isInteger(v)&&v>=1&&v<=46)||!map.walkable(n.x,n.y)||reserved.some(p=>p.x===n.x&&p.y===n.y)||occupied.has(n.x+':'+n.y))errors.push(prefix+'Vị trí không thể đặt NPC.');occupied.add(n.x+':'+n.y);
  if(Number.isInteger(n.x)&&Number.isInteger(n.y)&&![[1,0],[-1,0],[0,1],[0,-1]].some(([x,y])=>map.walkable(n.x+x,n.y+y)&&map.path({x:20,y:20},{x:n.x+x,y:n.y+y}).length>0))errors.push(prefix+'Không có lối tiếp cận.');
  if(typeof n.questId!=='string'||n.questId&&!cmsQuests().some(q=>q.id===n.questId))errors.push(prefix+'Nhiệm vụ tham chiếu không tồn tại.');
  if(!Array.isArray(n.dialogue)||!n.dialogue.length||n.dialogue.length>12){errors.push(prefix+'Hội thoại cần 1–12 nút.');continue;}
  const nodes=new Set<string>();for(const d of n.dialogue){if(!d||typeof d.id!=='string'||!/^[a-z0-9-]{1,32}$/.test(d.id)||nodes.has(d.id)||!text(d.text,600)||!Array.isArray(d.choices)||d.choices.length>4){errors.push(prefix+'Nút hội thoại không hợp lệ.');continue;}nodes.add(d.id);}
  if(!nodes.has(n.entry))errors.push(prefix+'Thiếu nút bắt đầu.');
  for(const d of n.dialogue)if(Array.isArray(d?.choices))for(const c of d.choices)if(!c||!text(c.label,80)||!nodes.has(c.next)||c.questId&&!cmsQuests().some(q=>q.id===c.questId))errors.push(prefix+'Lựa chọn hội thoại thiếu nút hoặc nhiệm vụ.');
 }
 return errors;
}
export function validCmsManifest(value:unknown):value is CmsManifest {const v=value as CmsManifest;return !!v&&v.schema===1&&v.baseVersion===contentVersion()&&typeof v.version==='string'&&/^[a-f0-9]{8,64}$/.test(v.version)&&cmsErrors(v.npcs).length===0;}
