import {Point,VillageMap} from './VillageModel';
import type {HouseId} from './HouseTasks';
export const homeObjects=[
 {id:'desk',name:'Bàn học',x:3,y:2,color:'#b9814c'},
 {id:'basket',name:'Giỏ sách',x:8,y:3,color:'#cc9f57'},
 {id:'shelf',name:'Kệ sách',x:2,y:5,color:'#86613e'},
 {id:'pens',name:'Bút màu',x:8,y:7,color:'#729c83'},
] as const;
export const homeObjectives=['Đến bàn học để nhận việc','Lấy sách trong giỏ','Mang sách tới kệ','Lấy bút màu','Đặt bút lên bàn học','Góc học tập đã gọn gàng!'];
export const homeActions=['desk','basket','shelf','pens','desk'];
export const enterableHouses=[
 {id:'home',name:'Nhà của bé',node:'house',wall:'#e8cea0',objects:['Bàn học','Giỏ sách','Kệ sách','Bút màu'],objectives:homeObjectives,actions:homeActions},
 {id:'tam',name:'Nhà Cô Tấm',node:'house-west',wall:'#ecd5b8',objects:['Bàn ăn','Giỏ rau','Rổ rau sạch','Chồng bát'],objectives:['Đến bàn nhận việc chuẩn bị bữa cơm','Lấy rau trong giỏ','Mang rau tới rổ rau sạch','Lấy bát cho bữa cơm','Bày bát lên bàn ăn','Bữa cơm đã sẵn sàng!'],actions:homeActions},
 {id:'farm',name:'Nhà Bác Nông Dân',node:'JourneyLandmark-farm',wall:'#d6d8ad',objects:['Bàn gieo hạt','Túi hạt giống','Khay phân loại','Bình tưới'],objectives:['Đến bàn nhận việc gieo hạt','Tìm túi hạt giống','Mang hạt tới khay phân loại','Lấy bình tưới','Mang bình tưới tới bàn gieo hạt','Góc gieo hạt đã sẵn sàng!'],actions:homeActions},
 {id:'pottery',name:'Xưởng Nghệ Nhân Gốm',node:'JourneyLandmark-craft',wall:'#dcb8a4',objects:['Bàn tạo hình','Giỏ đất sét','Bàn xoay','Bảng màu'],objectives:['Đến bàn nhận việc làm bình gốm','Lấy đất sét','Mang đất tới bàn xoay để tạo bình','Lấy màu trang trí','Mang màu tới bàn để hoàn thiện bình','Chiếc bình gốm đã hoàn thành!'],actions:homeActions},
 {id:'books',name:'Nhà sách Cô Giáo Lan',node:'JourneyLandmark-school',wall:'#bdd2c8',objects:['Bàn đọc','Giỏ truyện','Kệ truyện','Thẻ đánh dấu'],objectives:['Đến bàn đọc nhận việc tìm truyện','Tìm truyện trong giỏ sách','Mang truyện tới kệ','Lấy thẻ đánh dấu trang','Mang thẻ về bàn đọc','Góc đọc truyện đã sẵn sàng!'],actions:homeActions},
] as const;
export type EnterableHouse=typeof enterableHouses[number];
export function restoreHouseSteps(raw:unknown):Record<string,number>{const value=raw as Record<string,unknown>|null;return Object.fromEntries(enterableHouses.map(h=>[h.id,restoreHomeStep(value?.[h.id])]));}
export function mergeHouseSteps(...values:unknown[]):Record<string,number>{const rows=values.map(restoreHouseSteps);return Object.fromEntries(enterableHouses.map(h=>[h.id,Math.max(0,...rows.map(r=>r[h.id]))]));}
export function restoreHomeStep(value:unknown):number{return Number.isInteger(value)&&Number(value)>=0&&Number(value)<=5?Number(value):0;}
export function houseObjects(id:HouseId='home'):Array<{id:string;name:string;x:number;y:number;color:string}>{
 const layouts:Record<HouseId,number[][]>={home:[[3,2],[8,3],[2,5],[8,7]],tam:[[5,3],[2,6],[8,2],[9,6]],farm:[[3,3],[8,2],[3,6],[9,6]],pottery:[[7,3],[2,3],[4,6],[9,5]],books:[[6,4],[2,6],[3,2],[9,3]]};
 return homeObjects.map((o,i)=>({...o,x:layouts[id][i][0],y:layouts[id][i][1]}));
}
export class InteriorMap extends VillageMap {
 private blocked:Set<string>;
 constructor(house:HouseId='home'){super();this.blocked=new Set(houseObjects(house).map(o=>o.x+':'+o.y));}
 override walkable(x:number,y:number):boolean{return Number.isInteger(x)&&Number.isInteger(y)&&x>=1&&x<=10&&y>=1&&y<=8&&!this.blocked.has(x+':'+y);}
}
/** Resolve against the live layout and current path, including resized footprints. */
export function homeApproach(map:VillageMap,from:Point,house:Point):Point|undefined{
 const candidates:Point[]=[];
 for(let x=Math.max(0,Math.round(house.x)-7);x<=Math.min(71,Math.round(house.x)+7);x++)for(let y=Math.max(0,Math.round(house.y)-7);y<=Math.min(71,Math.round(house.y)+7);y++)if(map.walkable(x,y))candidates.push({x,y});
 candidates.sort((a,b)=>Math.hypot(a.x-house.x,a.y-house.y)-Math.hypot(b.x-house.x,b.y-house.y));
 return candidates.find(p=>p.x===from.x&&p.y===from.y||map.path(from,p).length>0);
}
