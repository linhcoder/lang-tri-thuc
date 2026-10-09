import { AgeBand } from './CampaignContent';
export interface Question {id:string;prompt:string;choices:string[];answer:number;hint:string;illustration?:string;sources?:string[];review:'draft'|'approved'}
export const riceQuestions=[{count:3,choices:[3,2,4]},{count:5,choices:[4,3,5]},{count:2,choices:[1,2,3]}];
const choice=(id:string,prompt:string,answer:string,wrong:string[],hint:string,illustration?:string):Question=>{
    const options=[answer,...wrong],rotate=id.length%3,choices=options.slice(rotate).concat(options.slice(0,rotate));
    return {id,prompt,choices,answer:choices.indexOf(answer),hint,illustration,review:'draft'};
};
export const lessonSkills=['math','mixed','fair-play','polite','sorting','english','clay','shapes','nature','language'] as const;
const overrides=new Map<string,Question>();
export function lessonKey(skill:string,age:AgeBand,round:number):string{return `${age}:${skill}:${round}`;}
export function lessonQuestions(skill:string,age:AgeBand):Question[]{return baseLessonQuestions(skill,age).map((q,i)=>{const selected=overrides.get(lessonKey(skill,age,i))??q;return {...selected,choices:[...selected.choices],sources:selected.sources?[...selected.sources]:undefined};});}
export function setLessonOverrides(records:Array<{key:string;question:Question}>):void{overrides.clear();for(const row of records)overrides.set(row.key,{...row.question,choices:[...row.question.choices]});}
export function baseLessonQuestions(skill:string,age:AgeBand):Question[]{
    if(skill==='math'){
        const tasks:Array<[number,string,number,number]>=age==='3-5'?[[2,'+',1,3],[5,'−',1,4],[4,'+',3,7]]:age==='6-8'?[[7,'+',5,12],[9,'−',4,5],[8,'+',4,12]]:[[3,'×',4,12],[18,'÷',3,6],[4,'×',5,20]];
        return tasks.map(([a,op,b,n],i)=>choice(`${skill}.${age}.${i}`,i===2&&age==='9-11'?`Có ${a} giỏ, mỗi giỏ ${b} quả. Có tất cả bao nhiêu quả? (${a} ${op} ${b})`:`${a} ${op} ${b} = ?`,String(n),[String(n-1),String(n+1)],op==='−'?`Bớt ${b} từ ${a}, rồi đếm phần còn lại.`:op==='÷'?`Chia đều ${a} thành ${b} nhóm.`:op==='×'?`Có ${a} nhóm, mỗi nhóm ${b}.`:`Gộp ${a} và ${b}, rồi đếm lại.`,age==='3-5'?'●'.repeat(a)+(op==='+'?' + ':' bớt ')+'●'.repeat(b):undefined));
    }
    if(skill==='mixed'){
        if(age==='9-11'){
            const geography=choice('mixed.9-11.1','Thủ đô của Việt Nam là thành phố nào?','Hà Nội',['Huế','Đà Nẵng'],'Hà Nội là thủ đô của Việt Nam.');
            geography.sources=['https://hanoi.gov.vn/dia-ly-dia-hinh/gioi-thieu-tong-quan-va-khai-quat-ve-dia-li-thanh-pho-ha-noi-4241009114844999.htm'];
            const history=choice('mixed.9-11.2','Khu trung tâm Hoàng thành Thăng Long ở thành phố nào?','Hà Nội',['Đà Nẵng','Cần Thơ'],'Địa điểm này gắn với lịch sử Thăng Long – Hà Nội.');history.sources=['https://whc.unesco.org/en/list/1328/'];
            return [baseLessonQuestions('math',age)[0],geography,history];
        }
        return [baseLessonQuestions('math',age)[0],baseLessonQuestions('nature',age)[0],baseLessonQuestions('fair-play',age)[0]];
    }
    if(skill==='language'){
        const rows:Array<[string,string,string[],string]>=age==='3-5'?[['Chọn chữ A.','A',['B','C'],'Quan sát nét của chữ A.'],['Chọn chữ B.','B',['A','C'],'Quan sát nét của chữ B.'],['Chọn chữ C.','C',['A','B'],'Chữ C có nét cong.']]:age==='6-8'?[['Ghép l + úa thành tiếng nào?','lúa',['cá','nhà'],'Âm l ghép với vần úa trong tiếng lúa.'],['Ghép c + á thành tiếng nào?','cá',['lúa','nhà'],'Đọc chậm tiếng cá.'],['Chọn câu chào lịch sự.','Cháu chào cô ạ.',['Đi đi!','Đưa đây!'],'Câu chào dùng lời lễ phép.']]:[['Trong câu “Cây lúa xanh”, từ nào chỉ màu?','xanh',['cây','lúa'],'Từ xanh mô tả màu.'],['Chọn câu có dấu hỏi.','Bạn cần giúp không?',['Cảm ơn bạn.','Chào bạn!'],'Dấu ? thường kết thúc câu hỏi.'],['Chọn cách viết lời cảm ơn.','Cảm ơn bạn.',['cảm ơn bạn','Cảm Ơn BẠN'],'Đầu câu viết hoa, cuối câu có dấu câu.']];
        return rows.map(([p,a,w,h],i)=>choice(`language.${age}.${i}`,p,a,w,h));
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
