import { Point } from './VillageModel';
export const plantingPlots:ReadonlyArray<Point>=[{x:11,y:14},{x:10,y:13},{x:12,y:12},{x:9,y:12},{x:11,y:10}];
export const FIRST_STAR='reward.star.ch01';
export type ChapterStage='intro'|'greet'|'meet-farmer'|'plant'|'count'|'return'|'complete';
export interface ChapterOneData {
    version:2;introSeen:boolean;greeted:boolean;accepted:boolean;planted:number[];
    countRound:number;rewardReceipts:string[];replayRound:number|null;legacyDemoBadge:boolean;
}
export class ChapterOneProgress {
    data:ChapterOneData={version:2,introSeen:false,greeted:false,accepted:false,planted:[],countRound:0,rewardReceipts:[],replayRound:null,legacyDemoBadge:false};
    get stage():ChapterStage {
        const d=this.data;
        return !d.introSeen?'intro':!d.greeted?'greet':!d.accepted?'meet-farmer':d.planted.length<5?'plant':d.countRound<3?'count':this.stars===0?'return':'complete';
    }
    get stars():number{return this.data.rewardReceipts.indexOf(FIRST_STAR)>=0?1:0;}
    get chapterTwoUnlocked():boolean{return this.stage==='complete';}
    enterVillage():boolean{if(this.stage!=='intro')return false;this.data.introSeen=true;return true;}
    greet():boolean{if(this.stage!=='greet')return false;this.data.greeted=true;return true;}
    accept():boolean{if(this.stage!=='meet-farmer')return false;this.data.accepted=true;return true;}
    plant(index:number):boolean {
        if(this.stage!=='plant'||!Number.isInteger(index)||index<0||index>=plantingPlots.length||this.data.planted.indexOf(index)>=0)return false;
        this.data.planted.push(index);return true;
    }
    finishCountRound():boolean {
        if(this.data.replayRound!==null){if(this.stage!=='complete'||this.data.replayRound>=3)return false;this.data.replayRound++;return true;}
        if(this.stage!=='count')return false;this.data.countRound++;return true;
    }
    turnIn():boolean{if(this.stage!=='return')return false;this.data.rewardReceipts.push(FIRST_STAR);return true;}
    startReplay():boolean{if(this.stage!=='complete')return false;this.data.replayRound=0;return true;}
    endReplay():void{this.data.replayRound=null;}
    restore(raw:string):boolean {
        try {
            const d=JSON.parse(raw) as ChapterOneData;
            if(!d||d.version!==2||typeof d.introSeen!=='boolean'||typeof d.greeted!=='boolean'||typeof d.accepted!=='boolean'||!Array.isArray(d.planted)||!Array.isArray(d.rewardReceipts))return false;
            const planted=Array.from(new Set(d.planted.filter(n=>Number.isInteger(n)&&n>=0&&n<5)));
            const introSeen=d.introSeen,greeted=introSeen&&d.greeted,accepted=greeted&&d.accepted;
            const validRound=Number.isInteger(d.countRound)?Math.max(0,Math.min(3,d.countRound)):0;
            const countRound=accepted&&planted.length===5?validRound:0;
            const rewarded=countRound===3&&d.rewardReceipts.indexOf(FIRST_STAR)>=0;
            this.data={version:2,introSeen,greeted,accepted,planted:accepted?planted:[],countRound,rewardReceipts:rewarded?[FIRST_STAR]:[],
                replayRound:rewarded&&Number.isInteger(d.replayRound)&&d.replayRound!>=0&&d.replayRound!<=3?d.replayRound:null,legacyDemoBadge:d.legacyDemoBadge===true};
            return true;
        }catch{return false;}
    }
    get description():string {
        switch(this.stage){
            case 'intro':return 'Ngày về làng • Mở lời chào của Ông Đồ';
            case 'greet':return 'Đến chào Ông Đồ bên cây đa';
            case 'meet-farmer':return 'Gặp Bác Nông Dân để nhận việc trồng lúa';
            case 'plant':return `Trồng Lúa – Học Đếm • ${this.data.planted.length}/5 cây`;
            case 'count':return `Về gặp bác • Học đếm: ${this.data.countRound}/3 câu`;
            case 'return':return 'Về Ông Đồ để nhận Sao Tri Thức đầu tiên';
            case 'complete':return 'Chương 1 hoàn thành • Sao Tri Thức: 1';
        }
    }
}
