export const careActivities = {
    buffalo: { title:'Chăm bạn trâu', steps:['Cho trâu ăn cỏ','Cho trâu uống nước','Dọn chỗ nghỉ sạch'], choices:['Cỏ xanh','Nước sạch','Dọn chỗ nghỉ'], order:[0,1,2], hint:'Bạn trâu ăn cỏ. Sau đó uống nước và nghỉ ở chỗ sạch.' },
    hen: { title:'Chăm cô gà', steps:['Cho gà ăn thóc','Cho gà uống nước','Dọn chuồng sạch'], choices:['Thóc','Nước sạch','Dọn chuồng'], order:[0,1,2], hint:'Gà ăn thóc. Sau đó uống nước và ở trong chuồng sạch.' },
    duck: { title:'Chăm bạn vịt', steps:['Cho vịt ăn thóc','Cho vịt uống nước','Dọn chỗ nghỉ sạch'], choices:['Thóc','Nước sạch','Dọn chỗ nghỉ'], order:[0,1,2], hint:'Vịt ăn thóc. Sau đó uống nước và nghỉ ở chỗ sạch.' },
    cat: { title:'Chăm bạn mèo', steps:['Cho mèo ăn thức ăn phù hợp','Cho mèo uống nước','Dọn chỗ nghỉ sạch'], choices:['Thức ăn mèo','Nước sạch','Dọn chỗ nghỉ'], order:[0,1,2], hint:'Mèo ăn thức ăn dành cho mèo, uống nước sạch và cần chỗ nghỉ sạch.' },
    garden: { title:'Chăm vườn rau', steps:['Tưới nước cho rau','Nhổ cỏ quanh rau','Phủ rơm giữ ẩm'], choices:['Phủ rơm','Tưới nước','Nhổ cỏ'], order:[1,2,0], hint:'Tưới nước, nhổ cỏ rồi phủ rơm để giữ ẩm cho đất.' },
};
export type CareId=keyof typeof careActivities;
export function isCareId(id:unknown):id is CareId{return typeof id==='string'&&Object.prototype.hasOwnProperty.call(careActivities,id);}
export function restoreCare(raw:unknown):Partial<Record<CareId,number>>{
    const result:Partial<Record<CareId,number>>={};if(!raw||typeof raw!=='object')return result;
    for(const id of Object.keys(careActivities) as CareId[]){const n=(raw as Record<string,unknown>)[id];if(typeof n==='number'&&Number.isInteger(n)&&n>=0&&n<=3)result[id]=n;}return result;
}
export interface PaintPoint{x:number;y:number}
export interface PaintStroke{color:number;points:PaintPoint[]}
export const paintColors=[[207,66,48],[236,171,39],[61,130,72],[56,123,183],[155,88,163],[92,64,43]] as const;
export const paintBounds={x:260,y:115},maxPaintStrokes=64,maxPaintPoints=128;
export function restorePainting(raw:unknown):PaintStroke[]{
    if(!Array.isArray(raw))return [];const result:PaintStroke[]=[];
    for(const stroke of raw.slice(0,maxPaintStrokes)){
        if(!stroke||!Number.isInteger(stroke.color)||stroke.color<0||stroke.color>=paintColors.length||!Array.isArray(stroke.points)||stroke.points.length===0||stroke.points.length>maxPaintPoints)continue;
        if(!stroke.points.every((p:PaintPoint)=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&Math.abs(p.x)<=paintBounds.x&&Math.abs(p.y)<=paintBounds.y))continue;
        result.push({color:stroke.color,points:stroke.points.map((p:PaintPoint)=>({x:Math.round(p.x),y:Math.round(p.y)}))});
    }return result;
}
