import { ChapterOneProgress } from './ChapterOneProgress';
import { LearningProgress } from './LearningProgress';
export const CHAPTER_SAVE_KEY='lang-tri-thuc.chapter-one.v2';
export const LEGACY_SAVE_KEY='lang-tri-thuc.learning.v1';
export interface StoragePort {getItem(key:string):string|null;setItem(key:string,value:string):void}
export class ChapterOneSave {
    readonly progress=new ChapterOneProgress();
    notice='';sessionOnly=false;private writable=true;
    constructor(private storage:StoragePort){}
    load():void {
        let raw:string|null;
        try{raw=this.storage.getItem(CHAPTER_SAVE_KEY);}catch{this.writable=false;this.sessionOnly=true;this.notice='Không đọc được bộ nhớ. Cháu vẫn chơi được trong phiên này.';return;}
        if(raw!==null){
            let version:unknown;try{version=JSON.parse(raw)?.version;}catch{}
            if(typeof version==='number'&&version>2){this.writable=false;this.sessionOnly=true;this.notice='Save thuộc phiên bản mới hơn, được giữ nguyên. Phiên này không ghi tiến độ.';return;}
            if(this.progress.restore(raw))return;
            // Preserve the original before replacing corrupt/unsupported data.
            try{const first=this.storage.getItem(CHAPTER_SAVE_KEY+'.recovery');if(first!==raw)this.storage.setItem(CHAPTER_SAVE_KEY+(first===null?'.recovery':'.recovery.latest'),raw);}
            catch{this.writable=false;this.sessionOnly=true;}
            this.notice=this.writable?'Save cũ chưa đọc được, đã giữ bản phục hồi. Cháu có thể bắt đầu lại.':'Save cũ được giữ nguyên. Phiên này không ghi tiến độ.';
            return;
        }
        try{
            const legacy=this.storage.getItem(LEGACY_SAVE_KEY);
            if(legacy!==null){
                const demo=new LearningProgress();demo.restore(legacy);
                this.progress.data.legacyDemoBadge=demo.data.stage==='complete';
                this.notice='Tiến độ demo cũ được giữ nguyên. Chương 1 bắt đầu riêng với năm cây lúa.';
            }
        }catch{this.notice='Chương 1 bắt đầu riêng. Dữ liệu demo cũ không bị thay đổi.';}
    }
    save():boolean {
        if(!this.writable)return false;
        try{this.storage.setItem(CHAPTER_SAVE_KEY,JSON.stringify(this.progress.data));this.sessionOnly=false;return true;}
        catch{this.sessionOnly=true;this.notice='Bộ nhớ chưa lưu được. Cháu vẫn chơi được; tiến độ có thể mất khi đóng trang.';return false;}
    }
}
