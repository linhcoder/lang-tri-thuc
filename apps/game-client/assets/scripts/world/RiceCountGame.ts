import { ChapterOneProgress } from './ChapterOneProgress';
import { riceQuestions as questions } from './EducationEngine';
/** Fixed three-round lesson; answer validation stays outside the Cocos UI. */
export class RiceCountGame {
    constructor(readonly progress:ChapterOneProgress){}
    get round():number{return this.progress.data.replayRound??this.progress.data.countRound;}
    get question():{count:number;choices:ReadonlyArray<number>}|null {
        if(this.progress.stage!=='count'&&this.progress.data.replayRound===null)return null;
        const q=questions[this.round];return q?{count:q.count,choices:q.choices.slice()}:null;
    }
    answer(value:number):boolean{const q=this.question;if(!q||value!==q.count)return false;return this.progress.finishCountRound(value);}
}
