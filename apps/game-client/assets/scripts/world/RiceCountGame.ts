import { ChapterOneProgress } from './ChapterOneProgress';
const questions=[{count:3,choices:[3,2,4]},{count:5,choices:[4,3,5]},{count:2,choices:[1,2,3]}];
/** Fixed three-round lesson; answer validation stays outside the Cocos UI. */
export class RiceCountGame {
    constructor(readonly progress:ChapterOneProgress){}
    get round():number{return this.progress.data.replayRound??this.progress.data.countRound;}
    get question():{count:number;choices:ReadonlyArray<number>}|null {
        if(this.progress.stage!=='count'&&this.progress.data.replayRound===null)return null;
        const q=questions[this.round];return q?{count:q.count,choices:q.choices.slice()}:null;
    }
    answer(value:number):boolean{const q=this.question;if(!q||value!==q.count)return false;return this.progress.finishCountRound();}
}
