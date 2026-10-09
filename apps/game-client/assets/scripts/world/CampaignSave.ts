import { CampaignEngine } from './CampaignEngine';
import { StoragePort } from './ChapterOneSave';
export const CAMPAIGN_KEY='lang-tri-thuc.campaign.v1';
export class CampaignSave {
    readonly engine=new CampaignEngine();notice='';private writable=true;
    constructor(private storage:StoragePort,private key=CAMPAIGN_KEY){
        try{const raw=storage.getItem(this.key);if(raw!==null){let version:unknown;try{version=JSON.parse(raw)?.version;}catch{}
            if(typeof version==='number'&&version>1){this.writable=false;this.notice='Tiến độ mới hơn được giữ nguyên; sổ này chỉ dùng trong phiên.';}
            else if(!this.engine.restore(raw)){storage.setItem(this.key+'.recovery',raw);this.notice='Đã giữ bản phục hồi cho sổ chưa đọc được.';}}}
        catch{this.writable=false;this.notice='Bộ nhớ chưa sẵn sàng. Phiên này vẫn chơi được.';}
    }
    save():boolean{if(!this.writable)return false;try{this.storage.setItem(this.key,JSON.stringify(this.engine.data));return true;}catch{this.notice='Chưa lưu được sổ. Hãy giữ trang mở hoặc xuất bản sao.';return false;}}
    resetLaterChapters():boolean{if(!this.writable)return false;try{this.storage.setItem(this.key+'.parent-backup',JSON.stringify(this.engine.data));const age=this.engine.data.age,quality=this.engine.data.quality,sound=this.engine.data.sound,avatar=this.engine.data.avatar;this.engine.data=new CampaignEngine().data;Object.assign(this.engine.data,{age,quality,sound,avatar});return this.save();}catch{return false;}}
}
