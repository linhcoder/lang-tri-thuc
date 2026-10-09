import { AgeBand } from './CampaignContent';
export interface Question {id:string;prompt:string;choices:string[];answer:number;hint:string;illustration?:string;review:'draft'|'approved'}
export const riceQuestions=[{count:3,choices:[3,2,4]},{count:5,choices:[4,3,5]},{count:2,choices:[1,2,3]}];
const choice=(id:string,prompt:string,answer:string,wrong:string[],hint:string,illustration?:string):Question=>{
    const options=[answer,...wrong],rotate=id.length%3,choices=options.slice(rotate).concat(options.slice(0,rotate));
    return {id,prompt,choices,answer:choices.indexOf(answer),hint,illustration,review:'draft'};
};
export function lessonQuestions(skill:string,age:AgeBand):Question[]{
    if(skill==='math'||skill==='mixed'){
        const pairs=age==='3-5'?[[2,1],[3,2],[4,1]]:age==='6-8'?[[7,5],[9,6],[8,4]]:[[3,4],[6,3],[4,5]];
        return pairs.map(([a,b],i)=>{const multiply=age==='9-11',n=multiply?a*b:a+b;return choice(`${skill}.${age}.${i}`,`${a} ${multiply?'×':'+'} ${b} = ?`,String(n),[String(n-1),String(n+1)],multiply?`Có ${a} nhóm, mỗi nhóm ${b}. Đếm các nhóm cùng nhau nhé.`:`Gộp nhóm ${a} và nhóm ${b}, rồi đếm lại nhé.`,age==='3-5'?'●'.repeat(a)+' + '+'●'.repeat(b):undefined);});
    }
    const data:Record<string,Array<[string,string,string[],string,string?]>>={
        'fair-play':[['Đến lượt bạn, mình làm gì?','Chờ bạn',['Giành lượt','Bỏ đồ của bạn'],'Mình cùng chia lượt để ai cũng được chơi.'],['Bạn cần giúp, mình nói gì?','Mình giúp bạn nhé',['Bạn tự làm đi','Mình không chờ'],'Lời mời giúp đỡ làm buổi chơi vui hơn.'],['Kết thúc ván, mình nói gì?','Cảm ơn bạn',['Bạn phải thua','Không được nghỉ'],'Chơi vui không cần ai cũng thắng.']],
        polite:[['Nhận giỏ từ bà, cháu nói gì?','Cháu cảm ơn bà ạ',['Đưa đây','Không nói gì'],'Mình nói lời cảm ơn khi được giúp.'],['Gặp cô, cháu nói gì?','Cháu chào cô ạ',['Đi chỗ khác','Đưa đồ cho cháu'],'Mình chào hỏi lịch sự.'],['Muốn nghỉ, cháu nói gì?','Cho cháu nghỉ nhé',['Cháu phải chơi mãi','Không được nghỉ'],'Cháu có thể xin nghỉ bất cứ khi nào.']],
        sorting:[['Chọn củ màu cam trong bài này.','Cà rốt',['Rau cải','Cà tím'],'Quan sát màu và tên trên hình.','🥕'],['Chọn rau có lá xanh.','Rau cải',['Cà rốt','Cà tím'],'Nhìn nhóm lá xanh trong hình.','🥬'],['Chọn quả màu tím trong bài này.','Cà tím',['Cà rốt','Rau cải'],'Mình tìm hình tím nhé.','🍆']],
        english:[['Từ nào là “mèo”?','cat',['dog','sun'],'Cat là từ tiếng Anh chỉ mèo.','🐱'],['Từ nào là “chó”?','dog',['cat','sun'],'Dog là từ tiếng Anh chỉ chó.','🐶'],['Từ nào là “mặt trời”?','sun',['cat','dog'],'Sun là từ tiếng Anh chỉ mặt trời.','☀']],
        clay:[['Trong bài mô phỏng, chọn vật liệu đầu tiên.','Đất mềm',['Giấy đã cắt','Bát đã xong'],'Chúng ta bắt đầu từ đất mềm trong hình.'],['Sau khi chọn đất, mình làm gì trên màn hình?','Tạo hình',['Đưa tay vào lò','Bỏ qua mọi bước'],'Chọn hình chiếc bát trên màn hình; không dùng lò thật.'],['Bước cuối trong bài này là gì?','Xem tác phẩm',['Dùng lửa thật','Dùng dao thật'],'Bài học chỉ mô phỏng trên màn hình.']],
        shapes:[['Hình nào có ba cạnh?','Tam giác',['Hình tròn','Hình vuông'],'Đếm ba cạnh của tam giác.','△'],['Hình nào có bốn cạnh bằng nhau trong bài này?','Hình vuông',['Tam giác','Hình tròn'],'Quan sát bốn cạnh và bốn góc.','□'],['Chọn hình tròn.','Hình tròn',['Tam giác','Hình vuông'],'Đường bao hình tròn cong liền nhau.','○']],
        nature:[['Trong bài, chọn nước cho cây.','Nước sạch',['Nước bẩn','Không bao giờ tưới'],'Quan sát biểu tượng nước sạch. Ngoài đời hãy nhờ người lớn.'],['Thấy rác cạnh cây, mình làm gì?','Nhờ người lớn giúp',['Ném xuống ao','Đốt rác'],'Nhờ người lớn để xử lý an toàn.'],['Cây trong game lớn rất nhanh. Ngoài đời có giống vậy không?','Không, đây là mô phỏng',['Luôn lớn trong giây lát','Không cần chăm'],'Game giản lược để học; cây thật cần thời gian.']],
    };
    return (data[skill]||data['fair-play']).map(([p,a,w,h,image],i)=>choice(`${skill}.${i}`,p,a,w,h,image));
}
export class EducationEngine {
    round=0;
    constructor(readonly questions:Question[],round=0,requireApproved=false){if(requireApproved&&questions.some(q=>q.review!=='approved'))throw Error('Unapproved lesson');this.round=Math.max(0,Math.min(questions.length,Number.isInteger(round)?round:0));}
    get question():Question|null{return this.questions[this.round]??null;}
    answer(index:number):boolean{const q=this.question;if(!q||!Number.isInteger(index)||index!==q.answer)return false;this.round++;return true;}
    get complete():boolean{return this.round===this.questions.length;}
}
