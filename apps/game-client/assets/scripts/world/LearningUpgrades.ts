import {restoreHouseSteps} from './HouseInterior';
import {HouseRun,HouseId,restoreHouseRuns} from './HouseTasks';
import {PotteryDraft,restorePotteryDraft} from './PotteryDraft';
export interface LearningEvent {id:string;at:number;skill:string;correct:boolean;kind:'answer'|'complete';target:string}
export interface LearningUpgrades {tutorial:string[];events:LearningEvent[];room:Record<string,string>;largeControls:boolean;homeStep?:number;houseSteps?:Record<string,number>;houseRuns?:Partial<Record<HouseId,HouseRun>>;potteryDraft?:PotteryDraft}
export interface Furniture {id:string;name:string;stars:number;color:string;reward?:string}
export const furniture:Furniture[]=[{id:'plant',name:'Chậu cây',stars:0,color:'#68a34c'},{id:'pottery',name:'Bình gốm',stars:1,color:'#bb784f'},{id:'books',name:'Kệ sách',stars:2,color:'#568dcc'},{id:'lantern',name:'Đèn lồng',stars:4,color:'#db6556'},{id:'trophy',name:'Cúp tri thức',stars:8,color:'#e8b635'},
 {id:'tidy-mat',name:'Thảm gọn gàng',stars:0,color:'#ad765d',reward:'tidy-mat'},
 {id:'flower-basket',name:'Giỏ hoa Cô Tấm',stars:0,color:'#d39088',reward:'flower-basket'},
 {id:'seed-planter',name:'Chậu mầm xanh',stars:0,color:'#83a061',reward:'seed-planter'},
 {id:'painted-vase',name:'Bình gốm hoa văn',stars:0,color:'#bc7d57',reward:'painted-vase'},
 {id:'reading-lamp',name:'Đèn góc đọc sách',stars:0,color:'#dab975',reward:'reading-lamp'}];
export function furnitureUnlocked(item:Furniture,stars:number,rewards:readonly string[]=[]):boolean{return item.reward?rewards.includes(item.reward):stars>=item.stars;}
export function restoreUpgrades(raw:unknown):LearningUpgrades{
 const v=raw as Partial<LearningUpgrades>|null;
 const events:LearningEvent[]=[],seen=new Set<string>();for(const e of Array.isArray(v?.events)?v!.events:[]){if(!e||typeof e.id!=='string'||e.id.length>90||seen.has(e.id)||!Number.isFinite(e.at)||e.at<0||e.at>Date.now()+86400000||typeof e.skill!=='string'||e.skill.length>40||typeof e.target!=='string'||e.target.length>100||typeof e.correct!=='boolean'||!['answer','complete'].includes(e.kind))continue;seen.add(e.id);events.push({...e});}
 const room:Record<string,string>={};for(const [slot,id]of Object.entries(v?.room??{}))if(['left','middle','right'].includes(slot)&&furniture.some(f=>f.id===id))room[slot]=id;
 return {tutorial:Array.isArray(v?.tutorial)?Array.from(new Set(v!.tutorial.filter(id=>['move','talk','reward','done'].includes(id)))):[],events:events.sort((a,b)=>a.at-b.at).slice(-200),room,largeControls:v?.largeControls===true,houseSteps:restoreHouseSteps(v?.houseSteps),houseRuns:restoreHouseRuns(v?.houseRuns),potteryDraft:restorePotteryDraft(v?.potteryDraft),homeStep:Number.isInteger(v?.homeStep)&&v!.homeStep!>=0&&v!.homeStep!<=5?v!.homeStep:0};
}
export function recordLearning(data:{upgrades?:LearningUpgrades},skill:string,correct:boolean,target:string,kind:LearningEvent['kind']='answer'):void{
 const v=data.upgrades??=restoreUpgrades(null);if(kind==='complete'&&v.events.some(e=>e.kind===kind&&e.target===target))return;
 v.events.push({id:Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10),at:Date.now(),skill,correct,target,kind});v.events=v.events.slice(-200);
}
export const skillNames:Record<string,string>={math:'Toán',language:'Tiếng Việt',english:'Tiếng Anh',nature:'Thiên nhiên',polite:'Ứng xử',sorting:'Phân loại',shapes:'Hình học',clay:'Sáng tạo','fair-play':'Chơi đẹp',story:'Nhiệm vụ'};
export function learningReport(raw:unknown,now=Date.now()){
 const v=restoreUpgrades(raw),start=now-7*86400000,previous=start-7*86400000,events=v.events.filter(e=>e.at>=start&&e.at<=now),answers=events.filter(e=>e.kind==='answer');
 const skills=Object.entries(skillNames).map(([id,name])=>{const rows=answers.filter(e=>e.skill===id);return {id,name,attempts:rows.length,correct:rows.filter(e=>e.correct).length};}).filter(s=>s.attempts>0);
 const weakest=skills.filter(s=>s.correct/s.attempts<.75).sort((a,b)=>a.correct/a.attempts-b.correct/b.attempts)[0];
 return {from:start,to:now,answers:answers.length,correct:answers.filter(e=>e.correct).length,completed:events.filter(e=>e.kind==='complete').length,previousCompleted:v.events.filter(e=>e.at>=previous&&e.at<start&&e.kind==='complete').length,activeDays:new Set(events.map(e=>Math.floor((e.at+7*3600000)/86400000))).size,skills,recommendation:weakest?`Cùng bé luyện thêm ${weakest.name.toLowerCase()} trong 5–10 phút, dùng gợi ý trước khi trả lời lại.`:answers.length?'Bé đang làm tốt. Hãy thử nhiệm vụ tiếp theo và dành thời gian nghỉ giữa các lượt.':'Chưa có lượt trả lời được ghi nhận trong 7 ngày qua. Hãy cùng bé bắt đầu một nhiệm vụ ngắn.',limited:v.events.length>=200};
}
