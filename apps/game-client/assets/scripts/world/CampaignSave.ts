import { CampaignEngine } from './CampaignEngine';
import { StoragePort } from './ChapterOneSave';
export const CAMPAIGN_KEY='lang-tri-thuc.campaign.v1';
export class CampaignSave {
    readonly engine=new CampaignEngine();notice='';private writable=true;
    constructor(private storage:StoragePort,private key=CAMPAIGN_KEY){
        try{const raw=storage.getItem(this.key);if(raw!==null){let version:unknown;try{version=JSON.parse(raw)?.version;}catch{}
            if(typeof version==='number'&&version>1){this.writable=false;this.notice='Tiến độ mới hơn được giữ nguyên; sổ này chỉ dùng trong phiên.';}
            else if(!this.engine.restore(raw)){
                const first=storage.getItem(this.key+'.recovery');
                if(first!==raw)storage.setItem(this.key+(first===null?'.recovery':'.recovery.latest'),raw);
                this.notice='Đã giữ bản phục hồi cho sổ chưa đọc được.';}}}
        catch{this.writable=false;this.notice='Bộ nhớ chưa sẵn sàng. Phiên này vẫn chơi được.';}
    }
    save():boolean{if(!this.writable)return false;try{this.storage.setItem(this.key,JSON.stringify(this.engine.data));return true;}catch{this.notice='Chưa lưu được sổ. Hãy giữ trang mở hoặc xuất bản sao.';return false;}}
    resetLaterChapters():boolean{
        if(!this.writable)return false;
        try{
            const previous=this.engine.data;
            this.storage.setItem(this.key+'.parent-backup',JSON.stringify(previous));
            const {age,quality,sound,avatar,accessory,hair}=previous,next=new CampaignEngine().data;
            Object.assign(next,{age,quality,sound,avatar,accessory,hair});
            // Publish the reset only after durable storage accepts it.
            this.storage.setItem(this.key,JSON.stringify(next));
            this.engine.data=next;this.notice='';return true;
        }catch{this.notice='Chưa xóa được sổ. Tiến độ hiện tại được giữ nguyên.';return false;}
    }
}
