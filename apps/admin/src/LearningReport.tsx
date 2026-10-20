import React,{useEffect,useState} from 'react';
export default function LearningReport({id,call}:{id:string;call:(path:string)=>Promise<any>}){
 const [data,setData]=useState<any>(),[error,setError]=useState(''),[monthly,setMonthly]=useState(false);
 useEffect(()=>{let active=true;setData(undefined);setError('');setMonthly(false);void call('/admin/students/'+id+'/learning-report').then(r=>{if(active)setData(r);}).catch(e=>{if(active)setError(e.message);});return()=>{active=false;};},[id]);
 if(error)return <p role="alert">{error}</p>;if(!data)return <p role="status">Đang tải báo cáo học tập…</p>;
 return <section aria-label="Báo cáo học tập"><h4>Báo cáo học tập</h4>
  <button className="secondary" onClick={()=>setMonthly(!monthly)}>{monthly?'Xem 7 ngày':'Xem lịch sử tháng'}</button>
  {monthly?<table><thead><tr><th>Tháng</th><th>Đúng / trả lời</th><th>Hoàn thành</th></tr></thead><tbody>
   {Object.entries(data.months??{}).sort().reverse().map(([month,skills]:[string,any])=>{const n=Object.values(skills).reduce((a:any,b:any)=>a.map((v:number,i:number)=>v+b[i]),[0,0,0]) as number[];return <tr key={month}><td>{month}</td><td>{n[1]} / {n[0]}</td><td>{n[2]}</td></tr>;})}
  </tbody></table>:<><h4>7 ngày gần nhất</h4><p>{data.activeDays} ngày hoạt động · {data.completed} nhiệm vụ hoàn thành · tuần trước {data.previousCompleted}</p><p>{data.correct}/{data.answers} lượt trả lời đúng</p>
   {data.skills.map((s:any)=><div className="learning-meter" key={s.id}><div><span>{s.name}</span><strong>{s.correct}/{s.attempts}</strong></div><progress aria-label={s.name+' trả lời đúng'} max={s.attempts} value={s.correct}/></div>)}<p>{data.recommendation}</p></>}
  <small>Tổng hợp theo tháng tối đa 10 năm, từ khi cập nhật. Dữ liệu lượt luyện do thiết bị ghi nhận; các lượt cũ đã bị loại trước cập nhật không thể khôi phục.</small>
 </section>;
}
