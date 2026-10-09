import { AgeBand, chapters, validateContent } from './CampaignContent';
import { ChapterOneData } from './ChapterOneProgress';
export interface CampaignData {version:1;completed:string[];introduced:string[];receipts:string[];age:AgeBand;quality:'low'|'medium'|'high';sound:boolean;avatar:number;accessory:number;home:number;onlineAllowed:boolean;resume:Record<string,{kind:string;data:unknown}>}
export class CampaignEngine {
    data:CampaignData={version:1,completed:[],introduced:[],receipts:[],age:'3-5',quality:'low',sound:false,avatar:0,accessory:0,home:0,onlineAllowed:false,resume:{}};
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
    get stars():number{return this.data.receipts.length;}
    restore(raw:string):boolean{
        try{const d=JSON.parse(raw) as CampaignData;if(!d||d.version!==1||!Array.isArray(d.completed)||!Array.isArray(d.receipts)||!Array.isArray(d.introduced))return false;
            this.data={version:1,completed:[],introduced:[],receipts:[],age:['3-5','6-8','9-11'].includes(d.age)?d.age:'3-5',quality:['low','medium','high'].includes(d.quality)?d.quality:'low',sound:d.sound===true,avatar:Number.isInteger(d.avatar)?Math.max(0,Math.min(3,d.avatar)):0,accessory:Number.isInteger(d.accessory)&&d.accessory>=0&&d.accessory<=3?d.accessory:0,home:Number.isInteger(d.home)?Math.max(0,Math.min(3,d.home)):0,onlineAllowed:false,resume:{}};
            for(let i=0;i<8;i++){const c=chapters[i];if(!this.unlocked(i))break;if(d.introduced.includes(c.id))this.introduce(i);for(const q of c.quests)if(d.completed.includes(q.id)&&this.available(q.id))this.complete(q.id);if(d.receipts.includes(`reward.star.${c.id}`))this.claim(i);}
            if(d.resume&&typeof d.resume==='object')for(const q of chapters.flatMap(c=>c.quests)){const r=d.resume[q.id];if(this.available(q.id)&&!this.data.completed.includes(q.id)&&r&&typeof r.kind==='string'&&JSON.stringify(r).length<16000)this.data.resume[q.id]=r;}
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
