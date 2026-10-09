import {AgeBand} from './CampaignContent';
import {baseLessonQuestions,lessonQuestions,lessonKey,lessonSkills,Question,setLessonOverrides} from './EducationEngine';
export interface LessonRecord {key:string;skill:string;age:AgeBand;question:Question;reviewRecord?:{status:string;note?:string;reviewer?:string}}
export function lessonCatalog():LessonRecord[]{return (['3-5','6-8','9-11'] as AgeBand[]).flatMap(age=>lessonSkills.flatMap(skill=>baseLessonQuestions(skill,age).map((question,i)=>({key:lessonKey(skill,age,i),skill,age,question}))));}
export function shippedLessonCatalog():LessonRecord[]{return lessonCatalog().map(row=>({...row,question:lessonQuestions(row.skill,row.age).find(q=>q.id===row.question.id)!}));}
export function validQuestion(value:unknown):value is Question {
    const q=value as Question,nonempty=(text:unknown,max:number)=>typeof text==='string'&&text.trim().length>0&&text.length<=max;
    return !!q&&nonempty(q.id,100)&&nonempty(q.prompt,500)&&nonempty(q.hint,500)&&Array.isArray(q.choices)&&q.choices.length===3&&q.choices.every(t=>nonempty(t,150))&&new Set(q.choices.map(t=>t.trim())).size===3&&Number.isInteger(q.answer)&&q.answer>=0&&q.answer<3&&['draft','approved'].includes(q.review)&&(q.illustration===undefined||typeof q.illustration==='string'&&q.illustration.length<=100)&&(q.sources===undefined||Array.isArray(q.sources)&&q.sources.length<=5&&q.sources.every(url=>typeof url==='string'&&url.length<=500&&/^https:\/\//.test(url)));
}
/** Validate the complete pack before publishing any answers to shared runtime state. */
export function applyLessonPack(value:unknown,requireApproved=false):boolean {
    const pack=value as {version:number;lessons:LessonRecord[]};if(!pack||pack.version!==1||!Array.isArray(pack.lessons)||pack.lessons.length>150)return false;
    const catalog=new Map(lessonCatalog().map(row=>[row.key,row])),seen=new Set<string>();
    for(const row of pack.lessons){const original=row&&catalog.get(row.key);if(!original||seen.has(row.key)||!validQuestion(row.question)||row.question.id!==original.question.id||row.skill!==original.skill||row.age!==original.age||requireApproved&&row.reviewRecord?.status!=='approved')return false;seen.add(row.key);}
    setLessonOverrides(pack.lessons.map(row=>({key:row.key,question:{...row.question,review:row.reviewRecord?.status==='approved'?'approved':'draft'}})));return true;
}
