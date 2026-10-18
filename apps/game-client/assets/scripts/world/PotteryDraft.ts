export const potteryColors=['#b87955','#72a29a','#7d91b3','#d2ad69','#bd7581'];
export const potteryMaxStrokes=16,potteryMaxPoints=64;
export interface PotteryStroke {color:number;points:Array<{x:number;y:number}>}
export interface PotteryDraft {version:1;radii:number[];color:number;strokes:PotteryStroke[];updated:number}
export function restorePotteryDraft(raw:unknown):PotteryDraft{
 const v=raw as Partial<PotteryDraft>|null,validColor=(n:unknown)=>Number.isInteger(n)&&Number(n)>=0&&Number(n)<potteryColors.length;
 const radii=Array.isArray(v?.radii)&&v.radii.length===12&&v.radii.every(n=>Number.isFinite(n)&&n>=18&&n<=100)?[...v.radii]:[42,56,68,78,82,80,72,60,42,30,30,38];
 const strokes:PotteryStroke[]=[];for(const s of Array.isArray(v?.strokes)?v.strokes.slice(0,potteryMaxStrokes):[]){if(!s||!validColor(s.color)||!Array.isArray(s.points)||!s.points.length||s.points.length>potteryMaxPoints||!s.points.every(p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&Math.abs(p.x)<=100&&Math.abs(p.y)<=125))continue;strokes.push({color:s.color,points:s.points.map(p=>({x:Math.round(p.x),y:Math.round(p.y)}))});}
 return {version:1,radii,color:validColor(v?.color)?v!.color!:0,strokes,updated:Number.isFinite(v?.updated)&&v!.updated!>=0&&v!.updated!<=Date.now()+86400000?v!.updated!:0};
}
export function potteryRadius(draft:PotteryDraft,y:number):number{const f=Math.max(0,Math.min(11,(y+125)/250*11)),i=Math.floor(f),next=Math.min(11,i+1);return draft.radii[i]+(draft.radii[next]-draft.radii[i])*(f-i);}
export function shapePottery(draft:PotteryDraft,x:number,y:number):boolean{if(!Number.isFinite(x)||!Number.isFinite(y)||Math.abs(y)>125)return false;const at=Math.round((y+125)/250*11),radius=Math.max(18,Math.min(100,Math.abs(x)));draft.radii[at]=radius;for(const offset of [-1,1]){const i=at+offset;if(i>=0&&i<12)draft.radii[i]=(draft.radii[i]+radius)/2;}return true;}
export function insidePottery(draft:PotteryDraft,p:{x:number;y:number}):boolean{return Number.isFinite(p.x)&&Number.isFinite(p.y)&&Math.abs(p.y)<=125&&Math.abs(p.x)<=potteryRadius(draft,p.y);}
export function mergePotteryDraft(...values:unknown[]):PotteryDraft{return values.map(restorePotteryDraft).reduce((a,b)=>b.updated>=a.updated?b:a,restorePotteryDraft(null));}
