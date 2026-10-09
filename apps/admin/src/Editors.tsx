import React,{useState} from 'react';
export type EditableQuestion={id:string;prompt:string;choices:string[];answer:number;hint:string;illustration?:string;sources?:string[];review:'draft'|'approved'};
export type LessonRow={key:string;skill:string;age:string;question:EditableQuestion;reviewRecord:{status:string;reviewer:string;note:string}};
export function CatalogEditor({kind,row,save,cancel}:{kind:'npc'|'asset';row:any;save:(value:unknown,note:string)=>Promise<void>;cancel:()=>void}){
 const fields=kind==='npc'?['name','x','y']:['title','source','license'],labels:Record<string,string>={name:'Tên NPC',x:'Ô X',y:'Ô Y',title:'Tên tài nguyên',source:'Nguồn tạo',license:'Giấy phép / quyền sử dụng'};
 const [value,setValue]=useState<Record<string,string|number>>(Object.fromEntries(fields.map(key=>[key,row[key]]))),[note,setNote]=useState('');
 return <form onSubmit={e=>{e.preventDefault();void save(value,note);}}><h3>Sửa {kind==='npc'?'NPC':'tài nguyên'} • {row.id}</h3>{fields.map(key=><label key={key}>{labels[key]}<input required type={key==='x'||key==='y'?'number':'text'} min={1} max={38} maxLength={500} value={value[key]} onChange={e=>setValue({...value,[key]:key==='x'||key==='y'?Number(e.target.value):e.target.value})}/></label>)}<label>Ghi chú kiểm tra<textarea aria-label="Ghi chú kiểm tra" required minLength={12} maxLength={500} value={note} onChange={e=>setNote(e.target.value)}/></label><p>Thay đổi được lưu ở trạng thái draft. Bố trí NPC áp dụng sau khi xuất gói và build lại game/server. Tệp ảnh và ID giữ nguyên.</p><button type="submit">Lưu danh mục</button><button type="button" className="secondary" onClick={cancel}>Hủy chỉnh sửa</button></form>;
}
export function LessonEditor({row,save,cancel}:{row:LessonRow;save:(question:EditableQuestion,note:string)=>Promise<void>;cancel:()=>void}){
 const [q,setQ]=useState(row.question),[note,setNote]=useState(''),[sources,setSources]=useState(row.question.sources?.join('\n')??'');
 return <form onSubmit={e=>{e.preventDefault();void save({...q,review:'draft',sources:sources.split('\n').map(s=>s.trim()).filter(Boolean)},note);}}>
  <h3>Sửa bài học • {row.age} tuổi • {row.skill}</h3>
  <label>Câu hỏi<textarea aria-label="Câu hỏi" required maxLength={500} value={q.prompt} onChange={e=>setQ({...q,prompt:e.target.value})}/></label>
  {q.choices.map((value,i)=><label key={i}>Lựa chọn {i+1}<input required maxLength={150} value={value} onChange={e=>setQ({...q,choices:q.choices.map((c,n)=>n===i?e.target.value:c)})}/></label>)}
  <label>Đáp án đúng<select value={q.answer} onChange={e=>setQ({...q,answer:Number(e.target.value)})}>{q.choices.map((c,i)=><option key={i} value={i}>{i+1}. {c}</option>)}</select></label>
  <label>Gợi ý<textarea aria-label="Gợi ý" required maxLength={500} value={q.hint} onChange={e=>setQ({...q,hint:e.target.value})}/></label>
  <label>Nguồn kiểm chứng (mỗi dòng một liên kết HTTPS)<textarea aria-label="Nguồn kiểm chứng" value={sources} onChange={e=>setSources(e.target.value)}/></label>
  <label>Ghi chú biên tập<textarea aria-label="Ghi chú biên tập" required minLength={12} maxLength={500} value={note} onChange={e=>setNote(e.target.value)}/></label>
  <p>Lưu thay đổi sẽ đưa bài về draft. Xuất gói và build lại cả game/server để áp dụng đồng nhất.</p>
  <button type="submit">Lưu bài học</button><button type="button" className="secondary" onClick={cancel}>Hủy chỉnh sửa</button>
 </form>;
}
export function ChapterEditor({chapter,save,cancel}:{chapter:{id:string;title:string;intro:string;ending:string;quests:Array<{id:string;title:string}>};save:(body:unknown)=>Promise<void>;cancel:()=>void}){
 const [title,setTitle]=useState(chapter.title),[intro,setIntro]=useState(chapter.intro),[ending,setEnding]=useState(chapter.ending),[quests,setQuests]=useState(Object.fromEntries(chapter.quests.map(q=>[q.id,q.title]))),[note,setNote]=useState('');
 return <form onSubmit={e=>{e.preventDefault();void save({title,intro,ending,questTitles:quests,note});}}><h3>Sửa chương {chapter.id}</h3>
  <label>Tên chương<input required maxLength={120} value={title} onChange={e=>setTitle(e.target.value)}/></label>
  <label>Mở đầu<textarea aria-label="Mở đầu" required maxLength={800} value={intro} onChange={e=>setIntro(e.target.value)}/></label>
  <label>Kết thúc<textarea aria-label="Kết thúc" required maxLength={800} value={ending} onChange={e=>setEnding(e.target.value)}/></label>
  {chapter.quests.map((q,i)=><label key={q.id}>Tên nhiệm vụ {i+1}<input required maxLength={120} value={quests[q.id]} onChange={e=>setQuests({...quests,[q.id]:e.target.value})}/></label>)}
  <label>Ghi chú chỉnh sửa<textarea aria-label="Ghi chú chỉnh sửa" required minLength={12} maxLength={500} value={note} onChange={e=>setNote(e.target.value)}/></label>
  <button type="submit">Lưu chương</button><button type="button" className="secondary" onClick={cancel}>Hủy chỉnh sửa</button>
 </form>;
}
