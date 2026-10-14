import type {AgeBand} from './CampaignContent';
import type {Question} from './EducationEngine';

export const MAX_LEVEL=100;
export const XP_PER_LEVEL=100;
export const journeyRegions=[
    {id:'village',name:'Làng khởi đầu',zone:'banyan',level:1,skills:['math','language','polite']},
    {id:'school',name:'Trường học tuổi thơ',zone:'school',level:11,skills:['language','math','english']},
    {id:'farm',name:'Nông trại xanh',zone:'farm',level:21,skills:['nature','math','sorting']},
    {id:'market',name:'Chợ quê',zone:'market',level:31,skills:['math','polite','sorting']},
    {id:'craft',name:'Làng nghề',zone:'craft',level:41,skills:['shapes','clay','math']},
    {id:'forest',name:'Rừng khám phá',zone:'forest',level:51,skills:['nature','sorting','math']},
    {id:'river',name:'Sông nước',zone:'riverside',level:61,skills:['nature','polite','math']},
    {id:'science',name:'Đồi khoa học',zone:'science',level:71,skills:['shapes','nature','math']},
    {id:'culture',name:'Phố văn hóa',zone:'culture',level:81,skills:['language','clay','polite']},
    {id:'island',name:'Đảo tri thức',zone:'island',level:91,skills:['math','english','fair-play']},
] as const;
export interface JourneyProgress {completed:string[];rounds:Record<string,number>}
export const journeyTasks=journeyRegions.flatMap(region=>Array.from({length:10},(_,i)=>({id:`journey.${region.id}.${i+1}`,region:region.id,title:`${region.name} · Thử thách ${i+1}`,skill:region.skills[i%region.skills.length],index:i,level:region.level})));
export function restoreJourney(raw:unknown):JourneyProgress{
    const value=raw as Partial<JourneyProgress>|null,completed:string[]=[],rounds:Record<string,number>={};
    for(const task of journeyTasks){if(Array.isArray(value?.completed)&&value!.completed.includes(task.id))completed.push(task.id);const round=value?.rounds?.[task.id];if(Number.isInteger(round)&&round!>0&&round!<3&&!completed.includes(task.id))rounds[task.id]=round!;}
    // Retain only a contiguous sequence within each region.
    const valid:string[]=[];for(const region of journeyRegions)for(let i=1;i<=10;i++){const id=`journey.${region.id}.${i}`;if(!completed.includes(id))break;valid.push(id);}
    for(const id of Object.keys(rounds)){const task=journeyTasks.find(t=>t.id===id)!;if(task.index>0&&!valid.includes(`journey.${task.region}.${task.index}`))delete rounds[id];}
    return {completed:valid,rounds};
}
export function levelForXp(xp:number):number{return Math.min(MAX_LEVEL,1+Math.floor(Math.max(0,xp)/XP_PER_LEVEL));}
export function regionForZone(zone:string){return journeyRegions.find(r=>r.zone===zone);}
export function journeyAvailable(id:string,progress:JourneyProgress,level:number):boolean{
    const task=journeyTasks.find(t=>t.id===id);if(!task||level<task.level||progress.completed.includes(id))return false;
    return task.index===0||progress.completed.includes(`journey.${task.region}.${task.index}`);
}
/** Three short questions per task; arithmetic varies by task, age and round. */
export function journeyQuestions(id:string,age:AgeBand,base:(skill:string,age:AgeBand)=>Question[]):Question[]{
    const task=journeyTasks.find(t=>t.id===id);if(!task)return [];
    const source=base(task.skill,age);
    return Array.from({length:3},(_,round)=>{
        const key=`${id}.${age}.${round}`;
        if(task.skill!=='math')return {...source[(task.index+round)%source.length],id:key};
        const small=age==='3-5',older=age==='9-11',a=small?1+(task.index+round)%5:older?12+task.index*3+round:5+task.index+round;
        const b=small?1+(task.index+round)%3:2+(task.index+round)%6;
        const subtract=!small&&(task.index+round)%2===1,multiply=older&&task.index%3===2;
        const answer=multiply?a*b:subtract?a-b:a+b;
        const options=[answer,answer+1,Math.max(0,answer-1)].map(String),rotation=(task.index+round)%3,choices=options.slice(rotation).concat(options.slice(0,rotation));
        return {id:key,prompt:small?`Có ${a} hạt giống, thêm ${b} hạt. Có tất cả bao nhiêu hạt?`:`${a} ${multiply?'×':subtract?'−':'+'} ${b} = ?`,choices,answer:choices.indexOf(String(answer)),hint:multiply?`Có ${a} nhóm, mỗi nhóm ${b}.`:subtract?`Bớt ${b} từ ${a}.`:`Gộp ${a} và ${b}, rồi đếm lại.`,illustration:small?'●'.repeat(a)+' + '+'●'.repeat(b):undefined,review:'approved'};
    });
}
