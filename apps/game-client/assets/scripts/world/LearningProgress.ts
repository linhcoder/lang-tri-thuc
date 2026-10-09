import { Point } from './VillageModel';
export type QuestStage='welcome'|'collect'|'count'|'sow'|'complete';
export const riceBundles:ReadonlyArray<Point>=[{x:11,y:14},{x:10,y:13},{x:12,y:12}];
export interface ProgressData { version:1; stage:QuestStage; collected:number[]; countWins:number; sowWins:number }
export class LearningProgress {
    data:ProgressData={version:1,stage:'welcome',collected:[],countWins:0,sowWins:0};
    restore(raw:string|null):void {
        if(!raw)return;
        try{
            const d=JSON.parse(raw) as ProgressData;
            if(d.version!==1||['welcome','collect','count','sow','complete'].indexOf(d.stage)<0||!Array.isArray(d.collected))return;
            this.data={version:1,stage:'welcome',collected:Array.from(new Set(d.collected.filter(n=>Number.isInteger(n)&&n>=0&&n<3))),countWins:Math.min(3,Math.max(0,Number.isInteger(d.countWins)?d.countWins:0)),sowWins:Math.min(3,Math.max(0,Number.isInteger(d.sowWins)?d.sowWins:0))};
            if(this.data.collected.length<3){this.data.countWins=0;this.data.sowWins=0;this.data.stage=d.stage==='welcome'&&this.data.collected.length===0?'welcome':'collect';}
            else if(this.data.countWins<3){this.data.sowWins=0;this.data.stage='count';}
            else this.data.stage=this.data.sowWins===3?'complete':'sow';
        }catch{/* A corrupt save never prevents a child from playing. */}
    }
    accept():void {if(this.data.stage==='welcome')this.data.stage='collect';}
    collect(index:number):boolean {
        if(this.data.stage!=='collect'||index<0||index>=3||!Number.isInteger(index)||this.data.collected.indexOf(index)>=0)return false;
        this.data.collected.push(index);if(this.data.collected.length===3)this.data.stage='count';return true;
    }
    answerCount(answer:number,expected:number):boolean {
        if(this.data.stage!=='count'||!Number.isInteger(answer)||!Number.isInteger(expected)||expected<1||expected>10||answer!==expected)return false;
        this.data.countWins++;if(this.data.countWins>=3)this.data.stage='sow';return true;
    }
    answerSow(answer:number,expected:number):boolean {
        if(this.data.stage!=='sow'||!Number.isInteger(answer)||!Number.isInteger(expected)||expected<0||expected>11||answer!==expected)return false;
        this.data.sowWins++;if(this.data.sowWins>=3)this.data.stage='complete';return true;
    }
    get description():string {
        const d=this.data;
        return d.stage==='welcome'?'Gặp Bác Nông Dân để nhận nhiệm vụ':d.stage==='collect'?`Thu hoạch bó lúa: ${d.collected.length}/3`:d.stage==='count'?`Về gặp bác • Đếm hạt gạo: ${d.countWins}/3`:d.stage==='sow'?`Về gặp bác • Rải hạt Ô ăn quan: ${d.sowWins}/3`:'Hoàn thành! Cháu là người bạn của làng.';
    }
}
/** Ring order: five home cells, big end, five opposite cells, big end. One seed per cell. */
export function sowSeeds(start:number,count:number,direction:1|-1):{last:number;cells:number[]} {
    if(!Number.isInteger(start)||start<0||start>=12||!Number.isInteger(count)||count<1||count>20||(direction!==1&&direction!==-1))throw new Error('Invalid sowing lesson');
    const cells=Array(12).fill(0) as number[];let last=start;
    for(let i=0;i<count;i++){last=(last+direction+12)%12;cells[last]++;}return {last,cells};
}
