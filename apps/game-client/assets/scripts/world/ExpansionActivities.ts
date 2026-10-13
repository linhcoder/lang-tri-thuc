import {flowerCareContent} from './FlowerCareContent';
import {AgeBand} from './CampaignContent';
export const expansionActivities=[
    {id:'flower-care',zone:'seasons',npc:'anh-nam',title:'Chăm hoa',intro:'Cùng anh Nam gieo hạt, tưới nước và ngắm hoa nở.',kind:'care'},
    {id:'fruit-colors',zone:'seasons',npc:'chi-mai',title:'Giỏ quả nhiều màu',intro:'Cùng chị Mai tìm quả có màu giống chiếc giỏ.',kind:'color'},
    {id:'boat-build',zone:'riverside',npc:'chu-hai',title:'Lắp chiếc thuyền',intro:'Cùng chú Hải đặt thân, cột và buồm để làm thuyền mô hình.',kind:'boat'},
    {id:'fish-count',zone:'riverside',npc:'co-lan-song',title:'Đếm cá dưới sông',intro:'Cùng cô Lan đếm cá. Mình ngắm sông từ bờ cùng người lớn nhé.',kind:'count'},
    {id:'float-sink',zone:'riverside',npc:'chu-hai',title:'Nổi hay chìm?',intro:'Quan sát đồ vật trong chậu nước: gỗ nổi, viên đá chìm. Đây là mô phỏng trong game.',kind:'float'},
    {id:'school-match',zone:'playground',npc:'be-minh',title:'Đồ vật cùng đôi',intro:'Cùng Minh tìm đồ vật giống hình mẫu.',kind:'match'},
    {id:'school-find',zone:'playground',npc:'be-an',title:'Tìm đồ dùng đi học',intro:'Cùng An tìm sách, bút và cặp trong sân trường.',kind:'find'},
] as const;
export type ExpansionId=typeof expansionActivities[number]['id'];
export type ExpansionProgress=Partial<Record<ExpansionId,{step:number;age:AgeBand;updated?:number}>>;
/** Only unfinished, bounded local checkpoints; never restores a completed badge. */
export function restoreExpansionProgress(value:unknown):ExpansionProgress{
    const result:ExpansionProgress={};
    if(!value||typeof value!=='object'||Array.isArray(value))return result;
    for(const {id} of expansionActivities){
        const saved=(value as Record<string,unknown>)[id];
        if(!saved||typeof saved!=='object')continue;
        const {step,age}=saved as {step:unknown;age:unknown};
        if((step===0||step===1||step===2)&&(age==='3-5'||age==='6-8'||age==='9-11')){const timestamp=(saved as {updated?:unknown}).updated;result[id]={step,age,updated:typeof timestamp==='number'&&Number.isSafeInteger(timestamp)&&timestamp>=0&&timestamp<=Date.now()+300000?timestamp:0};}
    }
    return result;
}
export const expansionFriends=[
    {id:'anh-nam',hello:'Anh Nam chào bé! Vườn có hoa và cây đang chờ mình chăm sóc.',avatar:4},
    {id:'chi-mai',hello:'Chị Mai chào bé! Mình cùng khám phá những màu sắc trong vườn nhé.',avatar:5},
    {id:'chu-hai',hello:'Chú Hải chào bé! Mình làm thuyền mô hình trên bờ an toàn nhé.',avatar:1},
    {id:'co-lan-song',hello:'Cô Lan chào bé! Cùng ngắm và đếm những bạn cá dưới sông.',avatar:3},
    {id:'be-minh',hello:'Mình là Minh! Cùng chơi tìm đồ vật với mình nhé.',avatar:4},
    {id:'be-an',hello:'Mình là An! Mình thích sách và những trò chơi cùng bạn.',avatar:5},
] as const;
export function restoreExpansion(value:unknown):ExpansionId[]{return Array.isArray(value)?Array.from(new Set(value.filter((id):id is ExpansionId=>expansionActivities.some(a=>a.id===id)))):[];}
export interface ExpansionRound {prompt:string;choices:string[];answer:number;picture:string;count:number}
/** Untimed, retryable practice. Story stars are never awarded by this module. */
export class ExpansionGame {
    step=0;feedback='';
    readonly countedFish=new Set<number>();
    readonly activity:typeof expansionActivities[number];
    constructor(readonly id:ExpansionId,readonly age:AgeBand,step=0){this.activity=expansionActivities.find(a=>a.id===id)!;if(!this.activity)throw Error('Unknown expansion activity');if(step===1||step===2)this.step=step;}
    countFish(index:number):boolean{
        if(this.ended||this.activity.kind!=='count'||!Number.isInteger(index)||index<0||index>=this.round.count||this.countedFish.has(index))return false;
        this.countedFish.add(index);return true;
    }
    get ended():boolean{return this.step>=3;}
    get round():ExpansionRound{
        const i=Math.min(this.step,2),kind=this.activity.kind;
        if(kind==='care'){const r=flowerCareContent.rounds[i];return {prompt:r.prompt,choices:r.choices.map(c=>c.label),answer:r.answer,picture:r.picture,count:1};}
        if(kind==='boat')return {prompt:['Đặt thân thuyền trước nhé!','Thuyền cần một cột để giữ buồm.','Lắp buồm để đón gió nào!'][i],choices:['Thân thuyền','Cột buồm','Cánh buồm'],answer:i,picture:'boat',count:i+1};
        if(kind==='float')return {prompt:['Khúc gỗ này ở trên mặt nước. Nó…','Viên đá này ở dưới đáy chậu. Nó…','Chiếc lá này ở trên mặt nước. Nó…'][i],choices:['Nổi','Chìm'],answer:i===1?1:0,picture:i===1?'stone':'leaf',count:1};
        if(kind==='count'){const count=i+ (this.age==='3-5'?1:this.age==='6-8'?3:6);return {prompt:'Có bao nhiêu bạn cá?',choices:[String(count+1),String(count),String(count+2)],answer:1,picture:'fish',count};}
        if(kind==='color')return {prompt:['Tìm quả màu đỏ.','Tìm quả màu vàng.','Tìm quả màu xanh.'][i],choices:['Đỏ','Vàng','Xanh'],answer:i,picture:['red','yellow','green'][i],count:1};
        if(kind==='match')return {prompt:'Tìm đồ vật giống hình mẫu.',choices:['Quyển sách','Chiếc bút','Quả bóng'],answer:i,picture:['book','pencil','ball'][i],count:1};
        return {prompt:['Tìm quyển sách để đọc.','Tìm chiếc bút để viết.','Tìm chiếc cặp để mang sách.'][i],choices:['Quyển sách','Chiếc bút','Chiếc cặp'],answer:i,picture:['book','pencil','bag'][i],count:1};
    }
    /** Pictures follow visible choices, so children can choose without reading. */
    get choicePictures():string[]{
        const kind=this.activity.kind,i=Math.min(this.step,2);
        if(kind==='care')return flowerCareContent.rounds[i].choices.map(c=>c.id);
        if(kind==='boat')return ['hull','mast','sail'];
        if(kind==='float')return ['floating','sinking'];
        if(kind==='color')return ['red','yellow','green'];
        if(kind==='match')return ['book','pencil','ball'];
        if(kind==='find')return ['book','pencil','bag'];
        return this.round.choices.map(()=> '');
    }
    choose(index:number):boolean{if(this.ended||!Number.isInteger(index)||index<0||index>=this.round.choices.length)return false;if(index!==this.round.answer){this.feedback='Mình thử lại nhé! Chạm Gợi ý nếu cần.';return false;}this.step++;this.countedFish.clear();this.feedback=this.ended?'Hoàn thành! Cảm ơn bé đã cùng chơi.':'Đúng rồi! Cùng làm bước tiếp theo.';return true;}
    hint():void{if(this.id==='flower-care'){if(!this.ended)this.feedback=flowerCareContent.rounds[this.step].hint;return;}if(!this.ended)this.feedback='Gợi ý: '+this.round.choices[this.round.answer]+'. Không mất điểm khi dùng gợi ý.';}
}
