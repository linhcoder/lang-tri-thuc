import {restoreCity} from './CityMissions';
import {RegionalCheckpoint,restoreRegional} from './RegionalPlay';
import {LearningHistory,restoreHistory,archiveLearning,learningDay,Counts,archivedEvent} from './LearningHistory';
import {restoreHouseSteps} from './HouseInterior';
import {HouseRun,HouseId,restoreHouseRuns} from './HouseTasks';
import {PotteryDraft,restorePotteryDraft} from './PotteryDraft';
export interface LearningEvent {id:string;at:number;skill:string;correct:boolean;kind:'answer'|'complete';target:string}
export interface LearningUpgrades {city?:Record<string,number>;regional?:Record<string,RegionalCheckpoint>;autoRead?:boolean;history?:LearningHistory;review?:Array<{skill:string;target:string}>;tutorial:string[];events:LearningEvent[];room:Record<string,string>;largeControls:boolean;homeStep?:number;houseSteps?:Record<string,number>;houseRuns?:Partial<Record<HouseId,HouseRun>>;potteryDraft?:PotteryDraft}
export interface Furniture {id:string;name:string;stars:number;color:string;level?:number;reward?:string}
export const furniture:Furniture[]=[{id:'plant',name:'Chậu cây',stars:0,color:'#68a34c'},{id:'pottery',name:'Bình gốm',stars:1,color:'#bb784f'},{id:'books',name:'Kệ sách',stars:2,color:'#568dcc'},{id:'lantern',name:'Đèn lồng',stars:4,color:'#db6556'},{id:'trophy',name:'Cúp tri thức',stars:8,color:'#e8b635'},
 {id:'tidy-mat',name:'Thảm gọn gàng',stars:0,color:'#ad765d',reward:'tidy-mat'},
 {id:'flower-basket',name:'Giỏ hoa Cô Tấm',stars:0,color:'#d39088',reward:'flower-basket'},
 {id:'seed-planter',name:'Chậu mầm xanh',stars:0,color:'#83a061',reward:'seed-planter'},
 {id:'painted-vase',name:'Bình gốm hoa văn',stars:0,color:'#bc7d57',reward:'painted-vase'},
 {id:'reading-lamp',name:'Đèn góc đọc sách',stars:0,color:'#dab975',reward:'reading-lamp'}];
furniture.push(...Array.from({length:10},(_,i)=>({id:'level-'+(i+1)*10,name:['Cờ làng','Bảng chăm học','Giỏ nông trại','Biển chợ quê','Huy hiệu làng nghề','Lá rừng xanh','Thuyền tri thức','Ngôi sao khoa học','Trống văn hóa','Vương miện tri thức'][i],stars:0,level:(i+1)*10,color:['#68a34c','#568dcc','#bb784f','#db6556','#e8b635'][i%5]})));
// Preserve the ten published milestone IDs; add one collectible at every other level.
const levelThemes=['Làng khởi đầu','Trường học','Nông trại','Chợ quê','Làng nghề','Rừng xanh','Sông nước','Khoa học','Văn hóa','Đảo tri thức'];
const levelObjects=['Hạt giống','Búp lá','Bông hoa','Quyển sách','Bút màu','Đèn nhỏ','Giỏ tre','Chuông gió','Ngôi sao'];
furniture.push(...Array.from({length:100},(_,i)=>i+1).filter(level=>level%10!==0).map(level=>({id:'level-'+level,name:levelObjects[(level-1)%10]+' '+levelThemes[Math.floor((level-1)/10)],stars:0,level,color:['#68a34c','#568dcc','#bb784f','#db6556','#e8b635'][Math.floor((level-1)/10)%5]})));
furniture.sort((a,b)=>(a.level??0)-(b.level??0));
export function furnitureUnlocked(item:Furniture,stars:number,rewards:readonly string[]=[],level=1):boolean{return item.level?level>=item.level:item.reward?rewards.includes(item.reward):stars>=item.stars;}
export function restoreUpgrades(raw:unknown):LearningUpgrades{
 const v=raw as Partial<LearningUpgrades>|null;
 const checkpoint=restoreHistory(v?.history);const events:LearningEvent[]=[],seen=new Set<string>();for(const e of Array.isArray(v?.events)?v!.events:[]){if(!e||archivedEvent(checkpoint,e)||typeof e.id!=='string'||e.id.length>90||seen.has(e.id)||!Number.isFinite(e.at)||e.at<0||e.at>Date.now()+86400000||typeof e.skill!=='string'||!/^[a-z][a-z-]{0,39}$/.test(e.skill)||['constructor','prototype'].includes(e.skill)||typeof e.target!=='string'||e.target.length>100||typeof e.correct!=='boolean'||!['answer','complete'].includes(e.kind))continue;seen.add(e.id);events.push({...e});}
 const history=restoreHistory(v?.history);for(const e of events.sort((a,b)=>a.at-b.at).slice(0,-200))archiveLearning(history,e);
 const review=Array.isArray(v?.review)?v!.review.filter(r=>r&&typeof r.skill==='string'&&r.skill.length<=40&&typeof r.target==='string'&&r.target.length<=100).slice(-12):[];
 const room:Record<string,string>={};for(const [slot,id]of Object.entries(v?.room??{}))if(['left','middle','right'].includes(slot)&&furniture.some(f=>f.id===id))room[slot]=id;
 return {city:restoreCity(v?.city),regional:restoreRegional(v?.regional),autoRead:v?.autoRead!==false,history,review,tutorial:Array.isArray(v?.tutorial)?Array.from(new Set(v!.tutorial.filter(id=>['move','talk','reward','done'].includes(id)))):[],events:events.sort((a,b)=>a.at-b.at).slice(-200),room,largeControls:v?.largeControls===true,houseSteps:restoreHouseSteps(v?.houseSteps),houseRuns:restoreHouseRuns(v?.houseRuns),potteryDraft:restorePotteryDraft(v?.potteryDraft),homeStep:Number.isInteger(v?.homeStep)&&v!.homeStep!>=0&&v!.homeStep!<=5?v!.homeStep:0};
}
export function recordLearning(data:{upgrades?:LearningUpgrades},skill:string,correct:boolean,target:string,kind:LearningEvent['kind']='answer',reviewed=false):void{
 const v=data.upgrades??=restoreUpgrades(null);if(kind==='complete'&&v.events.some(e=>e.kind===kind&&e.target===target))return;
 if(kind==='answer'){const review=v.review??=[];const index=review.findIndex(r=>r.target===target);if(correct){if(reviewed&&index>=0)review.splice(index,1);}else if(index<0){review.push({skill,target});v.review=review.slice(-12);}}
 v.events.push({id:Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10),at:Date.now(),skill,correct,target,kind});const overflow=v.events.splice(0,Math.max(0,v.events.length-200));for(const e of overflow)archiveLearning(v.history??=restoreHistory(null),e);
}
export const skillNames:Record<string,string>={math:'Toán',language:'Tiếng Việt',english:'Tiếng Anh',nature:'Thiên nhiên',polite:'Ứng xử',sorting:'Phân loại',shapes:'Hình học',clay:'Sáng tạo','fair-play':'Chơi đẹp',story:'Nhiệm vụ'};
export function learningReport(raw:unknown,now=Date.now(),days=7){
 const v=restoreUpgrades(raw),today=learningDay(now),startDay=learningDay(now-(days-1)*86400000),previousDay=learningDay(now-(days*2-1)*86400000);
 const rows:Record<string,Counts>=JSON.parse(JSON.stringify(v.history?.days??{}));
 for(const e of v.events){if(e.at>now)continue;const date=learningDay(e.at),n=((rows[date]??={})[e.skill]??=[0,0,0]);if(e.kind==='answer'){n[0]++;if(e.correct)n[1]++;}else n[2]++;}
 const totals:Counts={};let activeDays=0,previousCompleted=0;
 for(const [day,counts] of Object.entries(rows)){if(day>today)continue;if(day>=startDay){activeDays++;for(const [skill,n] of Object.entries(counts)){const t=totals[skill]??=[0,0,0];n.forEach((x,i)=>t[i]+=x);}}else if(day>=previousDay)for(const n of Object.values(counts))previousCompleted+=n[2];}
 const skills=Object.entries(totals).filter(([,n])=>n[0]>0).map(([id,n])=>({id,name:skillNames[id]??id,attempts:n[0],correct:n[1]}));
 const weakest=skills.filter(s=>s.correct/s.attempts<.75).sort((a,b)=>a.correct/a.attempts-b.correct/b.attempts)[0];
 const answers=skills.reduce((n,s)=>n+s.attempts,0),correct=skills.reduce((n,s)=>n+s.correct,0),completed=Object.values(totals).reduce((n,s)=>n+s[2],0);
 const months:Record<string,Counts>=JSON.parse(JSON.stringify(v.history?.months??{}));for(const e of v.events){if(e.at>now)continue;const n=((months[learningDay(e.at).slice(0,7)]??={})[e.skill]??=[0,0,0]);if(e.kind==='answer'){n[0]++;if(e.correct)n[1]++;}else n[2]++;}
 return {from:now-(days-1)*86400000,to:now,answers,correct,completed,previousCompleted,activeDays,skills,months,recommendation:weakest?`Cùng bé luyện thêm ${weakest.name.toLowerCase()} trong 5–10 phút, dùng gợi ý trước khi trả lời lại.`:answers?'Bé đang làm tốt. Hãy thử nhiệm vụ tiếp theo và dành thời gian nghỉ giữa các lượt.':'Chưa có lượt trả lời trong thời gian này. Hãy cùng bé bắt đầu một nhiệm vụ ngắn.',limited:false};
}
