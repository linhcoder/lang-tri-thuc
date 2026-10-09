export interface ReadingVoice {lang:string;localService?:boolean}
export interface SpeechPort {
    voices():readonly ReadingVoice[];
    speak(text:string,voice:ReadingVoice,done:()=>void,failed:()=>void):void;
    cancel():void;
}
const unavailable='Thiết bị chưa có đọc thoại. Cháu có thể đọc cùng người lớn.';
function browserSpeech():SpeechPort|null {
    if(typeof window==='undefined'||!window.speechSynthesis||!window.SpeechSynthesisUtterance)return null;
    const engine=window.speechSynthesis;
    return {voices:()=>engine.getVoices(),cancel:()=>engine.cancel(),speak:(text,voice,done,failed)=>{
        const utterance=new window.SpeechSynthesisUtterance(text);utterance.lang='vi-VN';
        utterance.voice=voice as SpeechSynthesisVoice;utterance.rate=.85;
        utterance.onend=done;utterance.onerror=failed;engine.speak(utterance);
    }};
}
/** One utterance at a time. Cancelled callbacks cannot update a newer panel. */
export class SpeechReader {
    reading=false;private generation=0;private port:SpeechPort|null=null;
    constructor(private provider:()=>SpeechPort|null=browserSpeech){}
    stop():void{this.generation++;this.reading=false;try{this.port?.cancel();}catch{}this.port=null;}
    read(text:string,enabled:boolean,changed:(message:string)=>void=()=>{}):string {
        this.stop();
        if(!enabled)return 'Âm thanh đang tắt. Người lớn có thể bật trong góc phụ huynh.';
        if(!text.trim())return 'Chưa có lời thoại để đọc.';
        try{
            this.port=this.provider();if(!this.port)return unavailable;
            const voices=this.port.voices().filter(v=>/^vi(?:[-_]|$)/i.test(v.lang));
            const voice=voices.find(v=>v.localService)??voices[0];
            if(!voice)return 'Chưa có giọng tiếng Việt. Lời thoại vẫn hiển thị; có thể thử Nghe lại sau.';
            const generation=this.generation;this.reading=true;
            const finish=(message:string)=>{if(this.generation!==generation)return;this.reading=false;changed(message);};
            this.port.speak(text,voice,()=>finish(''),()=>finish('Chưa đọc được lời thoại. Cháu có thể thử Nghe lại.'));
            return '';
        }catch{this.stop();return unavailable;}
    }
}
