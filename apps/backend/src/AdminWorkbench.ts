import {journeyTasks,journeyQuestions} from '../../game-client/assets/scripts/world/LevelJourney';
import {lessonQuestions} from '../../game-client/assets/scripts/world/EducationEngine';
import {layoutWarnings} from './ScenePublishing';
import baked from '../../game-client/assets/scripts/world/SceneLayoutPack';
import {VillageMap,SIZE} from '../../game-client/assets/scripts/world/VillageModel';
import type {FastifyInstance,FastifyRequest} from 'fastify';
import type {Repository,ParentRecord,BackendData} from './Store';
import {createHash,randomUUID} from 'node:crypto';
import {chapters} from '../../game-client/assets/scripts/world/CampaignContent';
import {shippedLessonCatalog} from '../../game-client/assets/scripts/world/LessonCatalog';
import {npcCatalog,applyNpcPack} from '../../game-client/assets/scripts/world/NpcCatalog';
import {assetCatalog} from '../../game-client/assets/scripts/world/AssetCatalog';
import {studentSummary} from './StudentSummary';
import {learningReport,LearningUpgrades,skillNames} from '../../game-client/assets/scripts/world/LearningUpgrades';
import {operationalStatus} from './Operations';
const hash=(v:unknown)=>createHash('sha256').update(JSON.stringify(v??null)).digest('hex');
const fail=(message:string,statusCode=400):never=>{throw Object.assign(Error(message),{statusCode});};
const normalize=(s:string)=>s.toLocaleLowerCase('vi').normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/đ/g,'d');
const kinds=['content','lessons','npcs','assets','review'] as const;
/** Snapshots contain editorial data only, never credentials or student saves. */
export function trackAdminChanges(store:Repository){
 const transaction=store.transaction.bind(store);
 store.transaction=((operation:any)=>transaction(async d=>{
  const before=Object.fromEntries(kinds.map(k=>[k,structuredClone(d[k])])) as Pick<BackendData,typeof kinds[number]>;
  const revisions=Object.fromEntries(Object.entries(d.progress).map(([id,p])=>[id,p.revision]));
  const auditStart=d.audit.length,result=await operation(d),created=Date.now();
  for(const [id,p] of Object.entries(d.progress))if(revisions[id]!==p.revision)p.updatedAt=created;
  for(const kind of kinds)for(const key of new Set([...Object.keys(before[kind]),...Object.keys(d[kind])])){
   const previous=(before[kind] as any)[key]??null,next=(d[kind] as any)[key]??null;if(hash(previous)===hash(next))continue;
   const actor=d.audit.slice(auditStart).at(-1)?.actor??'system';
   (d.adminChanges??=[]).push({id:randomUUID(),kind,key,before:previous,after:structuredClone(next),actor,created});
  }
  if(d.adminChanges)d.adminChanges=d.adminChanges.slice(-300);
  if(d.adminIssues)d.adminIssues=d.adminIssues.filter(i=>!!d.profiles[i.profileId]);
  return result;
 })) as Repository['transaction'];
}
export function registerAdminWorkbench(app:FastifyInstance,store:Repository,auth:(req:FastifyRequest,admin?:boolean)=>Promise<ParentRecord>,upgrades:(saved:BackendData['progress'][string]|undefined)=>LearningUpgrades){
 const contentRows=(d:BackendData)=>[
  ...chapters.map(c=>({id:c.id,key:c.id,kind:'content',title:d.content[c.id]?.title??c.title,age:'all',value:{title:d.content[c.id]?.title??c.title,intro:d.content[c.id]?.intro??c.intro,ending:d.content[c.id]?.ending??c.ending,questTitles:{...Object.fromEntries(c.quests.map(q=>[q.id,q.title])),...d.content[c.id]?.questTitles}}})),
  ...shippedLessonCatalog().map(r=>({id:r.key,key:'lesson:'+r.key,kind:'lessons',title:(d.lessons[r.key]??r.question).prompt,age:r.age,value:d.lessons[r.key]??r.question})),
  ...npcCatalog().map(r=>({id:r.id,key:'npc:'+r.id,kind:'npcs',title:d.npcs[r.id]?.name??r.name,age:'all',value:d.npcs[r.id]??r})),
  ...assetCatalog().map(r=>({id:r.id,key:'asset:'+r.id,kind:'assets',title:d.assets[r.id]?.title??r.title,age:'all',value:d.assets[r.id]??r}))
 ].map(r=>{const running=r.kind==='content'?chapters.find(c=>c.id===r.id):r.kind==='lessons'?shippedLessonCatalog().find(v=>v.key===r.id)?.question:r.kind==='npcs'?(d.scenePublished?.npcs??npcCatalog()).find(n=>n.id===r.id):assetCatalog().find(a=>a.id===r.id);const plain=(v:any)=>v&&Object.fromEntries(Object.entries(v).filter(([k])=>k!=='review'&&k!=='reviewRecord'));const runtime=r.kind==='content'&&running?{title:(running as any).title,intro:(running as any).intro,ending:(running as any).ending,questTitles:Object.fromEntries((running as any).quests.map((q:any)=>[q.id,q.title]))}:running;const inGame=hash(plain(r.value))===hash(plain(runtime));return {...r,runningValue:runtime,inGame,status:d.review[r.key]?.status??'draft',review:d.review[r.key]??null,fingerprint:hash({value:r.value,review:d.review[r.key]})};});
 const students=(d:BackendData)=>Object.values(d.profiles).map(p=>{
  const saved=d.progress[p.id],u=upgrades(saved),r=learningReport(u),lastEventAt=Math.max(0,...u.events.map(e=>e.at)),lastSavedAt=saved?.updatedAt??0;
  return {id:p.id,label:p.label,age:p.age,parent:d.parents[p.parentId]?.alias??'',parentId:p.parentId,summary:studentSummary(saved),lastEventAt,lastSavedAt,revision:saved?.revision??0,source:saved?.source??'solo',answers:r.answers,correct:r.correct,weak:r.skills.filter(s=>s.attempts>=5&&s.correct/s.attempts<.6),issues:(d.adminIssues??[]).filter(i=>i.profileId===p.id&&i.status==='open').length};
 });
 app.get('/admin/workbench',async req=>{await auth(req,true);const operations=await operationalStatus();return store.transaction(d=>{
  const rows=contentRows(d),learners=students(d),queue:any[]=[];
  for(const [i,reason] of layoutWarnings(d.sceneLayout?.pack??((baked as any).default??baked),npcCatalog().map(n=>({...n,...d.npcs[n.id]}))).entries())queue.push({id:'map-'+i,title:'Bản đồ cần kiểm tra',reason,tab:'scene',query:'',priority:'high'});
  for(const r of rows.filter(r=>r.status==='reviewed'))queue.push({id:r.key,title:r.title,reason:'Đã kiểm tra, đang chờ duyệt',tab:'workflow',query:r.id,priority:'normal'});
  if(d.cms?.status==='reviewed'||d.cms?.status==='approved')queue.push({id:'cms',title:'Bản nháp NPC CMS',reason:d.cms.status==='reviewed'?'Chờ duyệt nội dung':'Đã duyệt, cần xem trước khi xuất bản',tab:'studio',query:'',priority:'normal'});
  for(const f of d.feedback.filter(f=>f.status!=='resolved'))queue.push({id:f.id,title:f.message.slice(0,100),reason:'Phản hồi '+f.category,tab:'feedback',query:f.id,priority:f.category==='bug'?'high':'normal'});
  for(const r of d.reports.filter(r=>r.status==='open'))queue.push({id:r.id,title:'Báo cáo tương tác',reason:r.reason,tab:'reports',query:r.id,priority:'high'});
  for(const issue of (d.adminIssues??[]).filter(i=>i.status==='open'))queue.push({id:issue.id,title:learners.find(s=>s.id===issue.profileId)?.label??'Hồ sơ đã xóa',reason:issue.code===409?'API ghi nhận xung đột lưu tiến độ':'API ghi nhận lỗi lưu tiến độ',tab:'students',query:issue.profileId,priority:'high',issue:true});
  for(const c of operations.checks.filter(c=>c.status==='warning'))queue.push({id:'operation-'+c.id,title:c.label,reason:c.detail,tab:'operations',query:'',priority:'high'});
  return {queue:queue.sort((a,b)=>Number(b.priority==='high')-Number(a.priority==='high')),students:learners,counts:{draft:rows.filter(r=>r.status==='draft').length,reviewed:rows.filter(r=>r.status==='reviewed').length,approved:rows.filter(r=>r.status==='approved').length},updatedAt:Date.now()};
 });});
 app.get<{Querystring:{q?:string}}>('/admin/search',{schema:{querystring:{type:'object',additionalProperties:false,properties:{q:{type:'string',maxLength:80}}}}},async req=>{await auth(req,true);const q=normalize(req.query.q?.trim()??'');if(!q)return [];return store.transaction(d=>{
  const activeCms=d.cms?.releases.find(r=>r.id===d.cms?.active)?.manifest.npcs??[],cms=[...(d.cms?.npcs??[]),...activeCms.filter(n=>!d.cms?.npcs.some(v=>v.id===n.id))];
  const result=[...Object.values(d.profiles).map(s=>({id:s.id,label:s.label,detail:(d.parents[s.parentId]?.alias??'')+' · '+s.age+' tuổi',tab:'students',query:s.id})),...Object.values(d.parents).filter(p=>p.role==='parent').map(p=>({id:p.id,label:p.alias,detail:'Phụ huynh',tab:'accounts',query:p.alias})),...cms.map(n=>({id:n.id,label:n.name,detail:'NPC CMS · '+(d.cms?.npcs.some(v=>v.id===n.id)?'Bản nháp':'Đang xuất bản'),tab:'studio',query:n.id})),...contentRows(d).map(r=>({id:r.id,label:r.title,detail:r.kind+' · '+r.status,tab:'workflow',query:r.id})),...chapters.flatMap(c=>c.quests.map(q=>({id:q.id,label:q.title,detail:'Nhiệm vụ · '+c.title,tab:'content',query:c.id})))];
  return result.filter(r=>normalize(r.id+' '+r.label+' '+r.detail).includes(q)).slice(0,30);
 });});
 app.get('/admin/map-diagnostics',async req=>{await auth(req,true);return store.transaction(d=>{const pack=d.sceneLayout?.pack??((baked as any).default??baked),npcs=npcCatalog().map(n=>({...n,...d.npcs[n.id]})),map=new VillageMap();map.configureLayout(pack.placements);map.configureNpcs(npcs);return {revision:d.sceneLayout?.revision??0,pack,npcs,warnings:layoutWarnings(pack,npcs),tiles:Array.from({length:SIZE*SIZE},(_,i)=>({x:i%SIZE,y:Math.floor(i/SIZE),walkable:map.walkableForNpc(i%SIZE,Math.floor(i/SIZE),'*')}))};});});
 app.get('/admin/workflow',async req=>{await auth(req,true);return store.transaction(contentRows);});
 const batchBody={type:'object',additionalProperties:false,required:['items','status','note'],properties:{items:{type:'array',minItems:1,maxItems:50,items:{type:'object',additionalProperties:false,required:['key','fingerprint'],properties:{key:{type:'string',maxLength:150},fingerprint:{type:'string',pattern:'^[a-f0-9]{64}$'}}}},status:{type:'string',enum:['draft','reviewed','approved']},note:{type:'string',minLength:12,maxLength:500}}};
 const preview=(d:BackendData,b:any)=>{
  if(b.note.trim().length<12)fail('Ghi chú cần ít nhất 12 ký tự.');const rows=contentRows(d),seen=new Set<string>();
  return b.items.map((item:any)=>{if(seen.has(item.key))fail('Mục chọn bị trùng.');seen.add(item.key);const row=rows.find(r=>r.key===item.key);if(!row)fail('Không tìm thấy nội dung.',404);if(row!.fingerprint!==item.fingerprint)fail('Nội dung đã thay đổi. Hãy tải lại danh sách.',409);if(b.status==='approved'&&row!.status!=='reviewed')fail('Cần kiểm tra từng mục trước khi duyệt.',409);return {key:row!.key,title:row!.title,before:row!.status,after:b.status};});
 };
 app.post('/admin/workflow/preview',{schema:{body:batchBody}},async req=>{await auth(req,true);return store.transaction(d=>({changes:preview(d,req.body),effect:'Chỉ cập nhật kiểm duyệt. Không tự xuất bản vào game.'}));});
 app.post('/admin/workflow/apply',{schema:{body:batchBody}},async req=>{const actor=await auth(req,true);return store.transaction(d=>{const b=req.body as any,changes=preview(d,b);for(const r of changes){d.review[r.key]={status:b.status,reviewer:actor.alias,note:b.note.trim(),updated:Date.now()};d.audit.push({actor:actor.id,action:'workflow.'+b.status,entity:r.key,created:Date.now()});}return {count:changes.length};});});
 app.get('/admin/learning-insights',async req=>{await auth(req,true);return store.transaction(d=>{
  const questions=new Map<string,{id:string;skill:string;age:string;attempts:number;correct:number;profiles:Set<string>}>(),unfinished=new Map<string,number>();
  for(const p of Object.values(d.profiles)){
   for(const e of upgrades(d.progress[p.id]).events.filter(e=>e.kind==='answer')){const questionKey=p.age+'|'+e.target,row=questions.get(questionKey)??{id:e.target,skill:e.skill,age:p.age,attempts:0,correct:0,profiles:new Set<string>()};row.attempts++;if(e.correct)row.correct++;row.profiles.add(p.id);questions.set(questionKey,row);}
   const saved=d.progress[p.id],raw=(saved?.source==='online'?saved.trusted?.campaign:saved?.data) as any;
   for(const key of [...Object.keys(raw?.resume??{}),...Object.keys(raw?.journey?.rounds??{})])unfinished.set(key,(unfinished.get(key)??0)+1);
  }
  const questionRows=[...questions.values()].map(r=>{const lesson=shippedLessonCatalog().find(v=>v.age===r.age&&v.skill===r.skill&&r.id.endsWith(v.question.id)),task=journeyTasks.find(t=>r.id.startsWith(t.id+'.')),round=Number(r.id.split('.').at(-1)),question=task&&Number.isInteger(round)&&round>=0&&round<3?journeyQuestions(task.id,r.age as any,lessonQuestions)[round]:undefined;return {...r,title:question?.prompt??(lesson?(d.lessons[lesson.key]??lesson.question).prompt:r.id),contentKey:!task?lesson?.key:undefined,profiles:r.profiles.size,rate:r.correct/r.attempts,sufficient:r.attempts>=10&&r.profiles.size>=3};}).sort((a,b)=>a.rate-b.rate);
  const skills=Object.entries(skillNames).map(([id,name])=>{const rows=questionRows.filter(r=>r.skill===id);return {id,name,attempts:rows.reduce((n,r)=>n+r.attempts,0),correct:rows.reduce((n,r)=>n+r.correct,0)};}).sort((a,b)=>a.attempts-b.attempts);
  return {questions:questionRows.slice(0,100),skills,unfinished:[...unfinished].map(([id,profiles])=>({id,title:journeyTasks.find(t=>t.id===id)?.title??chapters.flatMap(c=>c.quests).find(q=>q.id===id)?.title??id,profiles})),students:students(d),limitations:'Câu hỏi/kỹ năng: tối đa 200 sự kiện gần nhất mỗi hồ sơ, không phải toàn bộ lịch sử. Lượt chưa hoàn tất là checkpoint còn lưu, không đồng nghĩa trẻ bỏ học. Chỉ gợi ý đánh giá khi có ít nhất 10 lượt từ 3 hồ sơ.'};
 });});
 app.get('/admin/change-history',async req=>{await auth(req,true);return store.transaction(d=>({changes:[...(d.adminChanges??[])].reverse().map(c=>({...c,actor:d.parents[c.actor]?.alias??c.actor,canRestore:c.kind!=='review'&&hash((d[c.kind] as any)[c.key])===hash(c.after),fingerprint:hash((d[c.kind] as any)[c.key])})),audit:d.audit.slice(-300).reverse().map(a=>({...a,actor:d.parents[a.actor]?.alias??a.actor})),limit:300}));});
 const restoreBody={type:'object',additionalProperties:false,required:['fingerprint','note'],properties:{fingerprint:{type:'string',pattern:'^[a-f0-9]{64}$'},note:{type:'string',minLength:12,maxLength:500}}};
 app.post<{Params:{id:string}}>('/admin/change-history/:id/restore',{schema:{body:restoreBody}},async req=>{const actor=await auth(req,true);return store.transaction(d=>{
  const c=d.adminChanges?.find(c=>c.id===req.params.id);if(!c||c.kind==='review')fail('Chỉ khôi phục nội dung biên tập còn trong lịch sử.',404);const b=req.body as any;if(b.note.trim().length<12)fail('Cần ghi rõ lý do khôi phục.');if(hash((d[c!.kind] as any)[c!.key])!==b.fingerprint||b.fingerprint!==hash(c!.after))fail('Nội dung đã thay đổi sau phiên bản này. Hãy kiểm tra lại.',409);
  if(c!.kind==='npcs'){const rows=npcCatalog().map(n=>n.id===c!.key?c!.before??n:d.npcs[n.id]??n);if(!applyNpcPack({version:1,npcs:rows},true))fail('Vị trí cũ không còn phù hợp bản đồ hiện tại.');d.sceneLayout={revision:(d.sceneLayout?.revision??0)+1,pack:d.sceneLayout?.pack??structuredClone((baked as any).default??baked),note:d.sceneLayout?.note??''};}
  if(c!.before===null)delete (d[c!.kind] as any)[c!.key];else (d[c!.kind] as any)[c!.key]=structuredClone(c!.before);
  const reviewKey=c!.kind==='content'?c!.key:(c!.kind==='lessons'?'lesson:':c!.kind==='npcs'?'npc:':'asset:')+c!.key;d.review[reviewKey]={status:'draft',reviewer:actor.alias,note:b.note.trim(),updated:Date.now()};d.audit.push({actor:actor.id,action:'content.restore',entity:c!.key,created:Date.now()});return {ok:true,status:'draft'};
 });});
 app.put<{Params:{id:string}}>('/admin/workbench/issues/:id/resolve',async req=>{const actor=await auth(req,true);return store.transaction(d=>{const issue=d.adminIssues?.find(i=>i.id===req.params.id);if(!issue)fail('Không tìm thấy cảnh báo.',404);issue!.status='resolved';d.audit.push({actor:actor.id,action:'save-issue.resolve',entity:req.params.id,created:Date.now()});return {ok:true};});});
 app.addHook('onError',async(req,_reply,error)=>{if(!req.url.match(/^\/profiles\/[^/]+\/progress/)||![409,500,503].includes((error as any).statusCode??500))return;const profileId=(req.params as any)?.id;if(!profileId)return;await store.transaction(d=>{if(!d.profiles[profileId])return;const code=(error as any).statusCode??500;if(!(d.adminIssues??=[]).some(i=>i.profileId===profileId&&i.code===code&&i.status==='open'))d.adminIssues.push({id:randomUUID(),profileId,code,status:'open',created:Date.now()});d.adminIssues=d.adminIssues.slice(-100);}).catch(()=>{});});
}
