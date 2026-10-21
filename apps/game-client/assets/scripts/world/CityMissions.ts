import type {Question} from './EducationEngine';
export const cityDistricts=[
 {id:'city-library',name:'Thư viện thành phố',x:65,y:20,color:'#628fc5'},
 {id:'city-station',name:'Ga giao thông',x:65,y:28,color:'#d49357'},
 {id:'city-lab',name:'Trung tâm khoa học',x:65,y:36,color:'#7b98bd'},
 {id:'city-park',name:'Công viên sinh thái',x:65,y:44,color:'#6ca878'},
] as const;
const step=(prompt:string,right:string,a:string,b:string,hint:string)=>({prompt,choices:[right,a,b],answer:0,hint});
export const cityMissions=cityDistricts.map((district,i)=>({id:district.id,title:district.name,skill:['language','math','nature','math'][i],steps:[
 [step('Thư viện có 120 sách. 1/4 là sách khoa học. Có bao nhiêu sách khoa học?','30 sách','40 sách','90 sách','Chia 120 thành 4 phần bằng nhau.'),step('Có 30 sách khoa học; 18 sách đã được mượn. Cần đủ 20 sách trên kệ. Phải bổ sung bao nhiêu?','8 sách','2 sách','12 sách','Tính số sách còn lại, rồi lấy 20 trừ số đó.'),step('Mỗi gói bổ sung có 4 sách. Để thêm 8 sách, cần mấy gói?','2 gói','4 gói','8 gói','Lấy số sách cần thêm chia cho 4.'),step('Báo cáo nào nêu đủ dữ kiện và kết luận?','Còn 12 sách, thêm 2 gói để đủ 20.','Có nhiều sách nên không cần thêm.','Thêm 8 gói vì thiếu 8 sách.','Đối chiếu số sách còn, số gói và mục tiêu 20 sách.')],
 [step('Xe A đi 8:10, đến 8:35. Xe B đi 8:15, đến 8:45. Cần đến trước 8:40. Chọn xe nào?','Xe A','Xe B','Cả hai xe','So sánh giờ đến của từng xe với 8:40.'),step('Đi bộ tới ga mất 12 phút. Cần có mặt trước giờ xe A chạy 5 phút. Rời nhà muộn nhất lúc nào?','7:53','8:03','7:58','Lấy 8:10 trừ 5 phút chờ, rồi trừ 12 phút đi bộ.'),step('Vé mỗi người 12 nghìn. Nhóm 4 người có 60 nghìn. Sau khi mua vé còn bao nhiêu?','12 nghìn','48 nghìn','24 nghìn','Tính 4 vé trước, sau đó trừ khỏi 60.'),step('Đường tới ga đang sửa, đi bộ thêm 10 phút. Muốn giữ kế hoạch, cần rời nhà muộn nhất lúc nào?','7:43','7:53','8:03','Dời giờ rời nhà ở bước trước sớm hơn 10 phút.')],
 [step('Hai chậu cùng loài, cùng đất và nước; một chậu có ánh sáng, một chậu đặt tối. Đang so sánh yếu tố nào?','Ánh sáng','Loại đất','Lượng nước','Tìm yếu tố duy nhất được thay đổi.'),step('Sau 7 ngày, chậu sáng cao 14 cm, chậu tối cao 10 cm. Chênh lệch bao nhiêu?','4 cm','24 cm','7 cm','Lấy chiều cao lớn trừ chiều cao nhỏ.'),step('Chỉ từ hai chậu trên, kết luận nào phù hợp?','Trong lần thử này, chậu sáng cao hơn.','Mọi cây luôn cao thêm đúng 4 cm.','Không cây nào cần nước.','Chỉ kết luận trong phạm vi dữ liệu đã quan sát.'),step('Muốn kết quả đáng tin cậy hơn, nên làm gì?','Lặp lại với nhiều cặp chậu cùng điều kiện.','Đổi cả đất và nước cùng lúc.','Chỉ giữ số đo hợp dự đoán.','Lặp lại và giữ các yếu tố khác giống nhau.')],
 [step('Công viên thu 80 kg rác; 3/8 là giấy. Có bao nhiêu kg giấy?','30 kg','24 kg','50 kg','Chia 80 cho 8 rồi nhân 3.'),step('Đã xử lý 30 kg giấy và 20 kg nhựa. Còn bao nhiêu kg trong 80 kg ban đầu?','30 kg','50 kg','20 kg','Cộng phần đã xử lý rồi trừ khỏi tổng.'),step('Mỗi thùng chứa tối đa 12 kg. Cần ít nhất bao nhiêu thùng cho 30 kg còn lại?','3 thùng','2 thùng','4 thùng','Hai thùng chứa được 24 kg; xem có đủ không.'),step('Có 100 điểm để trồng cây: cây bóng mát 30 điểm, cây hoa 20 điểm. Phương án nào dùng đúng 100 điểm và có cả hai loại?','2 cây bóng mát và 2 cây hoa','3 cây bóng mát và 1 cây hoa','1 cây bóng mát và 3 cây hoa','Nhân số cây với chi phí từng loại rồi cộng lại.')]
 ][i]}));
export function cityQuestion(id:string,round:number):Question|undefined{
 const mission=cityMissions.find(m=>m.id===id),q=mission?.steps[round];if(!q)return;
 const shift=(cityMissions.indexOf(mission!)+round)%3;
 return {...q,id:`${id}.${round}`,choices:q.choices.slice(shift).concat(q.choices.slice(0,shift)),answer:(3-shift)%3,review:'draft'};
}
export function restoreCity(raw:unknown):Record<string,number>{
 const result:Record<string,number>={};if(!raw||typeof raw!=='object')return result;
 for(const m of cityMissions){const n=(raw as Record<string,unknown>)[m.id];if(typeof n==='number'&&Number.isInteger(n)&&n>=0&&n<=m.steps.length)result[m.id]=n;}
 return result;
}
export function mergeCity(a:unknown,b:unknown):Record<string,number>{const left=restoreCity(a),right=restoreCity(b);for(const [id,n] of Object.entries(left))right[id]=Math.max(n,right[id]??0);return right;}
