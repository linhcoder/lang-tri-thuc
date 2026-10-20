/** Compact counters for evicted events. Recent detail remains in the event ring. */
export type Counts=Record<string,[number,number,number]>;
export interface LearningHistory {days:Record<string,Counts>;months:Record<string,Counts>;through?:number;throughIds?:string[]}
export function restoreHistory(raw:unknown):LearningHistory{
 const v=raw as Partial<LearningHistory>|null;
 const read=(value:unknown,pattern:RegExp,limit:number)=>{const result:Record<string,Counts>={};if(!value||typeof value!=='object')return result;
  for(const [date,counts] of Object.entries(value).filter(([k])=>pattern.test(k)).sort().slice(-limit)){
   if(!counts||typeof counts!=='object')continue;const row:Counts={};
   for(const [skill,n] of Object.entries(counts).slice(0,12))if(/^[a-z-]{1,20}$/.test(skill)&&Array.isArray(n)&&n.length===3&&n.every(x=>Number.isSafeInteger(x)&&x>=0&&x<=10000000)&&n[1]<=n[0])row[skill]=[n[0],n[1],n[2]];
   result[date]=row;
  }return result;};
 return {through:Number.isFinite(v?.through)&&v!.through!>=0?v!.through:0,throughIds:Array.isArray(v?.throughIds)?v!.throughIds.filter(id=>typeof id==='string'&&id.length<=90).slice(-2000):[],days:read(v?.days,/^\d{4}-\d{2}-\d{2}$/,62),months:read(v?.months,/^\d{4}-\d{2}$/,120)};
}
export function learningDay(at:number):string{return new Date(at+7*3600000).toISOString().slice(0,10);}
export function archiveLearning(history:LearningHistory,event:{id:string;at:number;skill:string;correct:boolean;kind:string}):void{
 if(event.at>(history.through??0)){history.through=event.at;history.throughIds=[event.id];}else if(event.at===history.through)history.throughIds=Array.from(new Set([...(history.throughIds??[]),event.id])).slice(-2000);
 const day=learningDay(event.at);
 for(const [rows,key] of [[history.days,day],[history.months,day.slice(0,7)]] as const){const n=(rows[key]??={})[event.skill]??=[0,0,0];if(event.kind==='answer'){n[0]++;if(event.correct)n[1]++;}else n[2]++;}
 history.days=Object.fromEntries(Object.entries(history.days).sort().slice(-62));history.months=Object.fromEntries(Object.entries(history.months).sort().slice(-120));
}

export function archivedEvent(history:LearningHistory,e:{id:string;at:number}):boolean{return e.at<(history.through??0)||e.at===history.through&&(history.throughIds??[]).includes(e.id);}
export function newerHistory(a:LearningHistory|undefined,b:LearningHistory|undefined):LearningHistory{const score=(h:LearningHistory|undefined)=>Object.values(h?.months??{}).flatMap(Object.values).reduce((n,row)=>n+row[0]+row[2],0);return restoreHistory((a?.through??0)>(b?.through??0)||(a?.through??0)===(b?.through??0)&&score(a)>score(b)?a:b);}
