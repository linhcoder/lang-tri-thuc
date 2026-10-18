export type HouseId='home'|'tam'|'farm'|'pottery'|'books';
export type HouseAge='3-5'|'6-8'|'9-11';
export const houseIds:HouseId[]=['home','tam','farm','pottery','books'];
export const houseRewardIds:Record<HouseId,string>={home:'tidy-mat',tam:'flower-basket',farm:'seed-planter',pottery:'painted-vase',books:'reading-lamp'};
export interface HouseChallenge {prompt:string;choices:string[];answer:number;hint:string;kind:'sort'|'count'|'order'|'color';item:string;symbols:string[]}
export interface HouseRun {age:HouseAge;answers:number[];updated:number}
export function houseChallenge(id:HouseId,step:number,age:HouseAge):HouseChallenge {
 const tier=age==='3-5'?0:age==='6-8'?1:2,count=[2,4,6][tier];
 const rounds:Record<HouseId,HouseChallenge[]>={
  home:[
   {prompt:'Bắt đầu dọn góc học tập: đồ nào cần lên kệ sách?',choices:['Quả bóng','Quyển sách','Chiếc bát'],answer:1,hint:'Sách cần được xếp ngay ngắn trên kệ.',kind:'sort',item:'Quyển sách',symbols:['ball','book','bowl']},
   {prompt:tier===0?'Chọn quyển sách có màu xanh.':'Tìm sách Tiếng Việt theo ký hiệu chữ A.',choices:['Sách toán','Sách Tiếng Việt','Sách tranh'],answer:1,hint:'Tìm cuốn sách xanh có chữ A.',kind:'sort',item:'Sách Tiếng Việt',symbols:['math-book','book','picture-book']},
   {prompt:'Kéo sách vào đúng nơi cất.',choices:['Kệ sách','Giỏ đồ chơi','Bàn ăn'],answer:0,hint:'Kệ sách là nơi cất sách sau khi đọc.',kind:'sort',item:'Quyển sách',symbols:['shelf','basket','table']},
   {prompt:`Góc học tập cần ${count} bút. Chọn khay có đủ bút.`,choices:[`${count-1} bút`,`${count+1} bút`,`${count} bút`],answer:2,hint:`Đếm lần lượt cho tới ${count}.`,kind:'count',item:'Bút màu',symbols:['pens','pens','pens']},
   {prompt:'Kéo bút vào chỗ để bàn học gọn gàng.',choices:['Dưới sàn','Hộp bút','Trên ghế'],answer:1,hint:'Bút nằm trong hộp sẽ dễ tìm hơn.',kind:'sort',item:'Bút màu',symbols:['floor','cup','chair']},
  ],
  tam:[
   {prompt:'Trước khi chuẩn bị bữa cơm, bé cần làm gì?',choices:['Rửa tay','Chơi bóng','Cất dép'],answer:0,hint:'Rửa tay sạch trước khi chạm vào thức ăn.',kind:'order',item:'Bữa cơm',symbols:['wash','ball','shoes']},
   {prompt:'Chọn rau để chuẩn bị bữa cơm.',choices:['Bình hoa','Rau cải','Quyển sách'],answer:1,hint:'Rau cải có lá xanh.',kind:'sort',item:'Rau cải',symbols:['vase','leaf','book']},
   {prompt:'Kéo rau vào rổ để rửa sạch.',choices:['Kệ sách','Giỏ đồ chơi','Rổ rau'],answer:2,hint:'Rau cần được rửa trong rổ rau.',kind:'sort',item:'Rau cải',symbols:['shelf','basket','colander']},
   {prompt:tier===2?'Có 4 người lớn và 2 bạn nhỏ. Cần bao nhiêu bát?':`Có ${count} người ăn. Cần bao nhiêu bát?`,choices:[`${count} bát`,`${count+1} bát`,`${count-1} bát`],answer:0,hint:'Mỗi người dùng một bát.',kind:'count',item:'Bát ăn',symbols:['bowl','bowl','bowl']},
   {prompt:'Kéo bát sạch lên nơi bày bữa cơm.',choices:['Sàn nhà','Bàn ăn','Giỏ đồ'],answer:1,hint:'Bày bát lên bàn để mọi người cùng ăn.',kind:'sort',item:'Bát sạch',symbols:['floor','table','basket']},
  ],
  farm:[
   {prompt:'Việc nào nên làm trước khi gieo hạt?',choices:['Thu hoạch','Tưới cây lớn','Chuẩn bị đất'],answer:2,hint:'Hạt cần đất tơi xốp để nảy mầm.',kind:'order',item:'Luống rau',symbols:['harvest','water','soil']},
   {prompt:'Chọn hạt giống để gieo rau.',choices:['Hạt rau','Viên sỏi','Nắp chai'],answer:0,hint:'Hạt rau có thể nảy thành cây.',kind:'sort',item:'Hạt giống',symbols:['seed','stone','cap']},
   {prompt:'Kéo hạt vào đúng khay gieo.',choices:['Giỏ thu hoạch','Khay đất','Hộp bút'],answer:1,hint:'Gieo hạt vào khay có đất.',kind:'sort',item:'Hạt giống',symbols:['basket','soil','cup']},
   {prompt:tier===2?'Mỗi hàng có 3 hạt, có 2 hàng. Bé đếm được bao nhiêu hạt?':`Chọn khay có ${count} hạt giống.`,choices:[`${count+1} hạt`,`${count} hạt`,`${count-1} hạt`],answer:1,hint:`Có tất cả ${count} hạt giống.`,kind:'count',item:'Hạt giống',symbols:['seed','seed','seed']},
   {prompt:'Gieo hạt xong, bé làm gì tiếp theo?',choices:['Tưới nước nhẹ','Nhổ hạt lên','Đậy bằng đá'],answer:0,hint:'Hạt cần nước để nảy mầm.',kind:'order',item:'Bình tưới',symbols:['water','seed','stone']},
  ],
  pottery:[
   {prompt:'Chọn vật liệu làm bình gốm.',choices:['Giấy','Đất sét','Vải'],answer:1,hint:'Đất sét mềm có thể nặn thành bình.',kind:'sort',item:'Bình gốm',symbols:['paper','clay','cloth']},
   {prompt:'Chọn khối đất để nặn thân bình tròn.',choices:['Khối cầu','Tấm giấy','Thanh gỗ'],answer:0,hint:'Khối cầu có dạng tròn đều.',kind:'sort',item:'Đất sét',symbols:['ball','paper','wood']},
   {prompt:'Kéo đất sét tới đúng dụng cụ tạo hình.',choices:['Giá sách','Bàn ăn','Bàn xoay'],answer:2,hint:'Bàn xoay giúp nặn bình tròn.',kind:'sort',item:'Đất sét',symbols:['shelf','table','wheel']},
   {prompt:tier===0?'Chọn màu xanh để trang trí bình.':tier===1?'Trộn xanh dương và vàng được màu gì?':'Họa tiết đỏ – xanh – đỏ – xanh. Màu tiếp theo là gì?',choices:['Đỏ','Xanh lá','Vàng'],answer:tier===2?0:1,hint:tier===2?'Hai màu thay phiên nhau: tiếp theo là đỏ.':'Xanh dương và vàng tạo thành xanh lá.',kind:'color',item:'Màu vẽ',symbols:['red','green','yellow']},
   {prompt:'Sau khi tạo hình, bước nào giúp bình có họa tiết?',choices:['Đập bình','Tô trang trí','Vò lại đất'],answer:1,hint:'Tô họa tiết lên bình đã tạo hình.',kind:'order',item:'Bình gốm',symbols:['stone','paint','clay']},
  ],
  books:[
   {prompt:'Khi đọc sách trong thư viện, bé nên làm gì?',choices:['Giữ yên lặng','Hét thật to','Xé trang'],answer:0,hint:'Giữ yên lặng để mọi người cùng đọc.',kind:'order',item:'Góc đọc sách',symbols:['quiet','sound','paper']},
   {prompt:tier===0?'Tìm cuốn truyện có hình cây.':'Tìm sách có chữ C như trong từ Cây.',choices:['Sách toán','Truyện về cây','Truyện về cá'],answer:1,hint:'Cuốn truyện có cây xanh và chữ C.',kind:'sort',item:'Truyện về cây',symbols:['math-book','tree-book','fish-book']},
   {prompt:'Kéo truyện tới kệ sách.',choices:['Giỏ bát','Kệ truyện','Chậu cây'],answer:1,hint:'Cất sách lên kệ để bạn khác dễ tìm.',kind:'sort',item:'Truyện về cây',symbols:['bowl','shelf','plant']},
   {prompt:tier===0?'Chọn thẻ đánh dấu màu vàng.':tier===1?'Đang đọc trang 3, lật thêm 1 trang. Chọn thẻ số trang mới.':'Đang đọc trang 4, đọc tiếp 2 trang. Chọn thẻ số trang mới.',choices:tier===0?['Thẻ đỏ','Thẻ xanh','Thẻ vàng']:[`Trang ${count-1}`,`Trang ${count}`,`Trang ${count+1}`],answer:tier===0?2:1,hint:tier===0?'Tìm thẻ có màu vàng.':`Trang mới là trang ${count}.`,kind:tier===0?'color':'count',item:'Thẻ đánh dấu',symbols:tier===0?['red','green','yellow']:['card','card','card']},
   {prompt:'Chuyện trồng cây: gieo hạt → tưới nước → điều gì xảy ra?',choices:['Cây nảy mầm','Hạt thành đá','Sách biến mất'],answer:0,hint:'Đủ đất và nước, hạt sẽ nảy thành cây.',kind:'order',item:'Câu chuyện',symbols:['plant','stone','book']},
  ],
 };
 if(!Number.isInteger(step)||step<0||step>4)throw Error('Invalid house step');
 return rounds[id][step];
}
export function validHouseProof(id:HouseId,age:HouseAge,answers:unknown):answers is number[]{return Array.isArray(answers)&&answers.length===5&&answers.every((choice,step)=>choice===houseChallenge(id,step,age).answer);}
export function restoreHouseRuns(raw:unknown):Partial<Record<HouseId,HouseRun>>{
 const value=raw as Record<string,HouseRun>|null,result:Partial<Record<HouseId,HouseRun>>={};
 for(const id of houseIds){const run=value?.[id];if(!run||!['3-5','6-8','9-11'].includes(run.age)||!Array.isArray(run.answers)||run.answers.length>5||!Number.isFinite(run.updated)||run.updated<0||run.updated>Date.now()+86400000)continue;if(run.answers.every((n,i)=>n===houseChallenge(id,i,run.age).answer))result[id]={age:run.age,answers:[...run.answers],updated:run.updated};}
 return result;
}
export function mergeHouseRuns(remote:unknown,local:unknown):Partial<Record<HouseId,HouseRun>>{const a=restoreHouseRuns(remote),b=restoreHouseRuns(local);for(const id of houseIds)if(b[id]&&(!a[id]||b[id]!.updated>=a[id]!.updated))a[id]=b[id];return a;}
