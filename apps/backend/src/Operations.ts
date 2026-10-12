import {readFile,stat} from 'node:fs/promises';
export async function operationalStatus(file=process.env.OPERATIONS_STATUS_FILE):Promise<{checkedAt:number;stale:boolean;checks:Array<{id:string;label:string;status:string;detail:string}>}>{
    const labels:Record<string,string>={api:'API và MySQL',rooms:'Phòng chơi',redis:'Redis',backup:'Backup trên VPS',restore:'Phục hồi thử',offsite:'Bản sao ngoài VPS'};
    let raw:any=null;
    try{if(file&&(await stat(file)).size<=16000)raw=JSON.parse(await readFile(file,'utf8'));}catch{/* No infrastructure paths or credentials in the response. */}
    const checkedAt=Number.isSafeInteger(raw?.checkedAt)?raw.checkedAt:0,stale=!checkedAt||Date.now()-checkedAt>300000;
    const checks=Object.entries(labels).map(([id,label])=>{const row=raw?.checks?.find((c:any)=>c?.id===id);return {id,label,status:!stale&&['ok','warning'].includes(row?.status)?row.status:'unknown',detail:typeof row?.detail==='string'?row.detail.slice(0,240):'Chưa có kết quả kiểm tra.'};});
    return {checkedAt,stale,checks};
}
