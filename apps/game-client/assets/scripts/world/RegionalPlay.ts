import type {AgeBand} from './CampaignContent';
export interface RegionalCheckpoint {age:AgeBand;stage:number;count:number;memory:number[];updated:number}
const regions=['village','school','farm','market','craft','forest','river','science','culture','island'];
export function restoreRegional(raw:unknown):Record<string,RegionalCheckpoint>{
    const result:Record<string,RegionalCheckpoint>={};
    if(!raw||typeof raw!=='object')return result;
    for(const region of regions){const v=(raw as Record<string,RegionalCheckpoint>)[region];
        if(!v||!['3-5','6-8','9-11'].includes(v.age)||!Number.isInteger(v.stage)||v.stage<0||v.stage>3||!Number.isInteger(v.count)||v.count<0||v.count>20||!Number.isFinite(v.updated)||v.updated<0||v.updated>Date.now()+86400000||!Array.isArray(v.memory)||v.memory.length>3||v.memory.some(i=>!Number.isInteger(i)||i<0||i>2))continue;
        result[region]={age:v.age,stage:v.stage,count:v.count,memory:[...v.memory],updated:v.updated};
    }return result;
}
/** Optional hands-on practice: no story XP, purchases or trusted reward receipts. */
export class RegionalPlay {
    stage=0;count=0;feedback='';private memory:number[]=[];
    constructor(readonly region:string,readonly age:AgeBand,raw?:RegionalCheckpoint){
        const v=restoreRegional({[region]:raw})[region];if(!v||v.age!==age)return;
        this.stage=v.stage;this.count=v.count;
        if(!this.done&&v.memory.length<this.path.length&&v.memory.every((n,i)=>n===this.path[i]))this.memory=[...v.memory];
    }
    save():RegionalCheckpoint{return {age:this.age,stage:this.stage,count:this.count,memory:[...this.memory],updated:Date.now()};}
    private get kind(){return ['farm','village','craft','culture'].includes(this.region)?'grow':['market','school','science'].includes(this.region)?'basket':'trail';}
    get title(){return this.kind==='grow'?(this.region==='craft'?'Xưởng gốm nhỏ':this.region==='culture'?'Vườn hoa ngày hội':'Vườn của bé'):this.kind==='basket'?(this.region==='school'?'Giỏ đồ dùng học tập':this.region==='science'?'Bàn cân khoa học':'Đi chợ giúp bà'):'Đường mòn khám phá';}
    get skill(){return this.kind==='grow'?'nature':this.kind==='basket'?'math':'sorting';}
    get target(){return this.age==='3-5'?3:this.age==='6-8'?5:8;}
    get done(){return this.stage>=3;}
    get options():string[]{return this.kind==='grow'?(this.region==='craft'?['Đất sét','Bàn xoay','Trang trí']:['Gieo hạt','Tưới nước','Thu hoạch']):this.kind==='basket'?['Thêm 1','Bớt 1','Xong giỏ']:['Lối trái','Lối giữa','Lối phải'];}
    get prompt(){if(this.done)return 'Hoàn thành! Kết quả luyện tập đã lưu vào báo cáo.';if(this.kind==='grow')return (this.region==='craft'?['Lấy đất sét để chuẩn bị.','Xoay và tạo dáng chiếc bình.','Trang trí chiếc bình của bé.']:['Đặt hạt vào luống đất.','Mầm nhỏ cần nước.','Cây đã lớn, cùng thu hoạch!'])[this.stage];if(this.kind==='basket')return `Giỏ ${this.stage+1}/3: lấy đúng ${this.target+this.stage} món rồi chạm Xong giỏ.`;return `Ghi nhớ rồi đi theo đường: ${this.path.map(i=>['Trái','Giữa','Phải'][i]).join(' → ')}. Bước ${this.memory.length+1}/${this.path.length}.`;}
    private get path(){return (this.age==='3-5'?[0,2]:this.age==='6-8'?[0,2,1]:[2,0,1,2]).map(i=>(i+this.stage)%3);}
    get scene(){if(this.done)return '✓   ✓   ✓';if(this.kind==='grow')return (this.region==='craft'?['ĐẤT SÉT','BÌNH MỘC','BÌNH HOA']:['HẠT   ·   ·','MẦM   |   |','CÂY   *   *'])[this.stage];if(this.kind==='basket')return `Trong giỏ: ${this.count} / ${this.target+this.stage}`;return this.memory.map(()=> '✓').join('   ')+'   · '.repeat(this.path.length-this.memory.length);}
    act(index:number):boolean{
        if(this.done||!Number.isInteger(index)||index<0||index>2)return false;
        if(this.kind==='grow'){if(index!==this.stage){this.feedback='Làm theo từng bước: '+this.prompt;return false;}this.stage++;}
        else if(this.kind==='basket'){if(index<2){this.count=Math.max(0,Math.min(20,this.count+(index===0?1:-1)));this.feedback='';return false;}if(this.count!==this.target+this.stage){this.feedback='Giỏ chưa đúng số lượng. Thêm hoặc bớt rồi đếm lại nhé!';return false;}this.stage++;this.count=0;}
        else{if(index!==this.path[this.memory.length]){this.memory=[];this.feedback='Thử lại từ đầu đường: '+this.path.map(i=>['Trái','Giữa','Phải'][i]).join(' → ');return false;}this.memory.push(index);if(this.memory.length<this.path.length){this.feedback='';return false;}this.memory=[];this.stage++;}
        this.feedback=this.done?'Bé đã hoàn thành cả ba lượt!':this.prompt;return true;
    }
}
