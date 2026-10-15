import {journeyPlacements} from './JourneyPlacements';
import {villageObjects,villageDetails,SIZE} from './VillageModel';
import {sceneryPlacements,visualAssets} from './VisualAssets';
import {LayoutPack,LayoutPlacement,layoutPlacement} from './LayoutOverrides';
export interface SceneObject extends LayoutPlacement {assetId:string;name:string;locked?:boolean;centered?:boolean}
const names:Record<string,string>={dinh:'Đình làng',house:'Nhà của bé','house-west':'Nhà phía tây',banyan:'Cây đa',banana:'Cây chuối','tree-east':'Cây phía đông',well:'Giếng làng',bamboo:'Bụi tre','bamboo-east':'Tre phía đông',bridge:'Cầu ao','bridge-west':'Cầu phía tây',buffalo:'Trâu',hen:'Gà',duck:'Vịt',garden:'Vườn rau','gate-arch':'Cổng làng',boat:'Thuyền',cat:'Mèo',market:'Chợ quê'};
export function sceneObjects():SceneObject[]{
 const sceneryIds=['flowers','shrub','stones','market','fence','shade-tree','grass-tuft','lantern','golden-rice','wood-sign'];
 return [
  ...[...villageObjects.filter(o=>!['banyan','tree-east'].includes(o.id)),...villageDetails].map(o=>({...o,assetId:o.id,name:names[o.id]??o.id,locked:o.id.startsWith('bridge'),centered:o.id.startsWith('bridge')})),
  ...journeyPlacements.map(o=>({...layoutPlacement({...o,id:'journey.'+o.id}),assetId:'journey.'+o.id})),
  ...sceneryPlacements().filter(o=>o.id!=='market').map(o=>({...o,assetId:'scenery.'+sceneryIds[o.cell],name:names[o.id]??(visualAssets.find(a=>a.id==='scenery.'+sceneryIds[o.cell])?.name+' · '+o.id)})),
  ...[{id:'expansion.garden',name:'Vườn bốn mùa',x:42,y:20,width:280,height:220},{id:'expansion.school',name:'Trường học',x:40,y:30,width:360,height:260},{id:'schoolyard.dirt-pitch',name:'Sân bóng đất',x:45,y:33,width:360,height:240,centered:true}].map(o=>({...layoutPlacement(o),assetId:o.id})),
 ];
}
export function layoutErrors(value:unknown):string[]{
 const p=value as LayoutPack;if(!p||p.version!==1||!Array.isArray(p.placements)||p.placements.length>500)return ['Gói bố trí không hợp lệ.'];
 const known=new Map(sceneObjects().map(o=>[o.id,o])),seen=new Set<string>(),errors:string[]=[];
 for(const row of p.placements){
  const base=known.get(row?.id);
  if(!base||base.locked||seen.has(row.id)){errors.push('Vật thể không tồn tại, bị khóa hoặc trùng ID.');continue;}seen.add(row.id);
  if(![row.x,row.y,row.width,row.height].every(Number.isFinite)||row.x<0||row.y<0||row.x>SIZE-1||row.y>SIZE-1||row.width<16||row.height<16||row.width>1200||row.height>1200)errors.push(base.name+': vị trí hoặc kích thước không hợp lệ.');
  if(Object.keys(row).some(k=>!['id','x','y','width','height'].includes(k)))errors.push(base.name+': thuộc tính không được hỗ trợ.');
 }
 return errors;
}
