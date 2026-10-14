import {JourneyProgress,restoreJourney,journeyAvailable,journeyQuestions,levelForXp,MAX_LEVEL,XP_PER_LEVEL} from './LevelJourney';
import {lessonQuestions} from './EducationEngine';
import {environmentGuides} from './VillageModel';
import {restoreExpansion,ExpansionId,ExpansionProgress,restoreExpansionProgress,expansionActivities} from './ExpansionActivities';
import { AgeBand, chapters, miniGameIds, validateContent,seasonalDefinitions } from './CampaignContent';
import { ChapterOneData } from './ChapterOneProgress';
import {MiniGameRules,GameSave} from './MiniGameRules';
import {CareId,PaintStroke,restoreCare,restorePainting} from './VillageActivities';
import {restoreHolidayProgress} from './TraditionalFestivals';
export interface CampaignData {version:1;xpHistory?:string[];journey?:JourneyProgress;activitiesDirty?:boolean;completed:string[];introduced:string[];receipts:string[];age:AgeBand;quality:'low'|'medium'|'high';sound:boolean;avatar:number;accessory:number;hair:number;skin:number;expansion?:ExpansionId[];expansionProgress?:ExpansionProgress;practice:string[];practiceResume?:Record<string,GameSave>;explored?:string[];care?:Partial<Record<CareId,number>>;painting?:PaintStroke[];festivalProgress?:Record<string,string[]>;holidayProgress?:Record<string,number>;home:number;onlineAllowed:boolean;resume:Record<string,{kind:string;data:unknown}>}
const xpWeights=new Map<string,number>();
for(const chapter of chapters){for(const quest of chapter.quests)xpWeights.set('quest:'+quest.id,20);xpWeights.set('star:reward.star.'+chapter.id,100);}
for(const id of miniGameIds)xpWeights.set('practice:'+id,50);
for(const guide of environmentGuides)xpWeights.set('explore:'+guide.id,20);
for(const activity of expansionActivities)xpWeights.set('expansion:'+activity.id,100);
function restoreXpHistory(raw:unknown):string[]{return Array.isArray(raw)?Array.from(new Set(raw.filter((id):id is string=>typeof id==='string'&&xpWeights.has(id)))):[];}
function learningReceipts(data:CampaignData):string[]{return restoreXpHistory([...(data.xpHistory??[]),...data.completed.map(id=>'quest:'+id),...data.receipts.map(id=>'star:'+id),...data.practice.map(id=>'practice:'+id),...(data.explored??[]).map(id=>'explore:'+id),...(data.expansion??[]).map(id=>'expansion:'+id)]);}
export class CampaignEngine {
    data:CampaignData={version:1,completed:[],introduced:[],receipts:[],age:'3-5',quality:'low',sound:false,avatar:0,accessory:0,hair:0,skin:0,practice:[],home:0,onlineAllowed:false,resume:{}};
    constructor(){const errors=validateContent();if(errors.length)throw Error(errors.join(';'));}
    syncChapterOne(d:ChapterOneData):void{
        const flags=[d.greeted,d.planted.length===5,d.countRound===3,d.rewardReceipts.includes('reward.star.ch01')];
        chapters[0].quests.forEach((q,i)=>{if(flags[i]&&!this.data.completed.includes(q.id))this.data.completed.push(q.id);});
        if(flags[3]){this.introduce(0);this.claim(0);}
    }
    unlocked(index:number):boolean{return Number.isInteger(index)&&index>=0&&index<8&&(index===0||this.data.receipts.includes(`reward.star.ch${String(index).padStart(2,'0')}`));}
    introduce(index:number):boolean{if(!this.unlocked(index))return false;const id=chapters[index].id;if(!this.data.introduced.includes(id))this.data.introduced.push(id);return true;}
    available(questId:string):boolean{
        const index=chapters.findIndex(c=>c.quests.some(q=>q.id===questId)),q=chapters[index]?.quests.find(q=>q.id===questId);
        return !!q&&this.unlocked(index)&&this.data.introduced.includes(chapters[index].id)&&q.prerequisites.every(id=>this.data.completed.includes(id));
    }
    complete(questId:string):boolean{if(!this.available(questId)||this.data.completed.includes(questId))return false;this.data.completed.push(questId);delete this.data.resume[questId];return true;}
    claim(index:number):boolean{
        const c=chapters[index];if(!c||!this.unlocked(index)||!c.quests.every(q=>this.data.completed.includes(q.id)))return false;
        const id=`reward.star.${c.id}`;if(this.data.receipts.includes(id))return false;this.data.receipts.push(id);return true;
    }
    get journey():JourneyProgress{return this.data.journey??={completed:[],rounds:{}};}
    get xp():number{return learningReceipts(this.data).reduce((sum,id)=>sum+xpWeights.get(id)!,0)+this.journey.completed.length*100;}
    /** Carry personal learning history between modes; story stars still require room verification. */
    preserveLearningFrom(raw:unknown):void{
        if(raw===null||raw===undefined)return;
        try{const saved=new CampaignEngine();if(!saved.restore(JSON.stringify(raw)))return;
            this.data.xpHistory=restoreXpHistory([...(this.data.xpHistory??[]),...learningReceipts(saved.data)]);
            const rounds={...this.journey.rounds};for(const [id,round] of Object.entries(saved.journey.rounds))rounds[id]=Math.max(rounds[id]??0,round);
            this.data.journey=restoreJourney({completed:[...this.journey.completed,...saved.journey.completed],rounds});
        }catch{/* A malformed backup never prevents entering a verified room. */}
    }
    get level():number{return levelForXp(this.xp);}
    get levelProgress():number{return this.level===MAX_LEVEL?1:(this.xp%XP_PER_LEVEL)/XP_PER_LEVEL;}
    answerJourney(id:string,round:number,index:number):boolean{
        if(!journeyAvailable(id,this.journey,this.level)||(this.journey.rounds[id]??0)!==round)return false;
        const question=journeyQuestions(id,this.data.age,lessonQuestions)[round];
        if(!question||!Number.isInteger(index)||question.answer!==index)return false;
        if(round===2){this.journey.completed.push(id);delete this.journey.rounds[id];}else this.journey.rounds[id]=round+1;
        return true;
    }
    get stars():number{return this.data.receipts.length;}
    restore(raw:string):boolean{
        try{const d=JSON.parse(raw) as CampaignData;if(!d||d.version!==1||!Array.isArray(d.completed)||!Array.isArray(d.receipts)||!Array.isArray(d.introduced))return false;
            this.data={version:1,completed:[],introduced:[],receipts:[],age:['3-5','6-8','9-11'].includes(d.age)?d.age:'3-5',quality:['low','medium','high'].includes(d.quality)?d.quality:'low',sound:d.sound===true,avatar:Number.isInteger(d.avatar)?Math.max(0,Math.min(5,d.avatar)):0,accessory:Number.isInteger(d.accessory)&&d.accessory>=0&&d.accessory<=3?d.accessory:0,hair:Number.isInteger(d.hair)&&d.hair>=0&&d.hair<=2?d.hair:0,skin:Number.isInteger(d.skin)&&d.skin>=0&&d.skin<=2?d.skin:0,expansion:restoreExpansion(d.expansion),expansionProgress:restoreExpansionProgress(d.expansionProgress),practice:Array.isArray(d.practice)?Array.from(new Set(d.practice.filter(id=>miniGameIds.some(game=>game===id)))):[],home:Number.isInteger(d.home)?Math.max(0,Math.min(3,d.home)):0,onlineAllowed:false,resume:{}};
            for(let i=0;i<8;i++){const c=chapters[i];if(!this.unlocked(i))break;if(d.introduced.includes(c.id))this.introduce(i);for(const q of c.quests)if(d.completed.includes(q.id)&&this.available(q.id))this.complete(q.id);if(d.receipts.includes(`reward.star.${c.id}`))this.claim(i);}
            this.data.journey=restoreJourney(d.journey);const history=restoreXpHistory(d.xpHistory);if(history.length)this.data.xpHistory=history;
            if(d.resume&&typeof d.resume==='object')for(const q of chapters.flatMap(c=>c.quests)){const r=d.resume[q.id];if(this.available(q.id)&&!this.data.completed.includes(q.id)&&r&&typeof r.kind==='string'&&JSON.stringify(r).length<16000){
                if(r.kind==='game'&&(!q.game||!r.data||typeof r.data!=='object'||(r.data as {id?:unknown}).id!==q.game))continue;
                this.data.resume[q.id]=r;
            }}
            this.data.practiceResume={};
            if(d.practiceResume&&typeof d.practiceResume==='object')for(const id of miniGameIds){const saved=d.practiceResume[id];if(!saved||JSON.stringify(saved).length>16000)continue;try{const game=MiniGameRules.restore(saved);if(game.id===id&&!game.ended)this.data.practiceResume[id]=game.save();}catch{/* Discard an invalid practice trace without affecting story progress. */}}
            this.data.explored=Array.isArray(d.explored)?Array.from(new Set(d.explored.filter(id=>['well','buffalo','garden','hen','duck','cat'].includes(id)))):[];
            this.data.care=restoreCare(d.care);this.data.painting=restorePainting(d.painting);
            this.data.holidayProgress=restoreHolidayProgress(d.holidayProgress);this.data.activitiesDirty=d.activitiesDirty===true;
            this.data.festivalProgress={};
            if(d.festivalProgress&&typeof d.festivalProgress==='object')for(const [key,games] of Object.entries(d.festivalProgress)){const match=key.match(/^(20\d{2})-(spring|summer|autumn|winter)$/);if(!match||!Array.isArray(games))continue;const allowed:readonly string[]=seasonalDefinitions[match[2] as keyof typeof seasonalDefinitions].games;this.data.festivalProgress[key]=Array.from(new Set(games.filter(id=>allowed.includes(id))));}
            if(d.activitiesDirty===undefined&&(this.data.expansion?.length||this.data.practice.length||Object.keys(this.data.practiceResume??{}).length||this.data.explored?.length||this.data.painting?.length||Object.values(this.data.care??{}).some(step=>step>0)||Object.values(this.data.holidayProgress??{}).some(step=>step>0)||Object.keys(this.data.festivalProgress??{}).length))this.data.activitiesDirty=true;
            return true;
        }catch{return false;}
    }
}
export interface DialogueNode {id:string;text:string;next?:string}
export class DialogueEngine {
    private index=0;
    constructor(readonly nodes:DialogueNode[]){const ids=new Set(nodes.map(n=>n.id));if(ids.size!==nodes.length||nodes.some(n=>n.next&&!ids.has(n.next)))throw Error('Invalid dialogue');const seen=new Set<string>();let node=nodes[0];while(node){if(seen.has(node.id))throw Error('Dialogue cycle');seen.add(node.id);if(!node.next)break;node=nodes.find(n=>n.id===node.next)!;}}
    get current():DialogueNode|null{return this.nodes[this.index]??null;}
    next():void{const next=this.current?.next;this.index=next?this.nodes.findIndex(n=>n.id===next):this.nodes.length;}
}
