export const JOIN_SESSION_KEY='lang-tri-thuc.private-tab.v1';
interface SessionStorage {getItem(key:string):string|null;setItem(key:string,value:string):void;removeItem(key:string):void}
export interface JoinSession {profileId:string;join?:{roomCode:string;ticket:string}}
const profile=(id:unknown):id is string=>typeof id==='string'&&/^[a-f0-9-]{36}$/.test(id);
/** Untrusted local routing only: the server still verifies signatures, expiry and ownership. */
export function restoreJoinSession(ticket:string|null,roomCode:string|null,storage:SessionStorage|undefined,decode:(raw:string)=>string,now=Date.now()):JoinSession|null{
    let record:any;const fresh=ticket!==null||roomCode!==null;
    const write=(value:unknown)=>{try{if(value===null)storage?.removeItem(JOIN_SESSION_KEY);else storage?.setItem(JOIN_SESSION_KEY,JSON.stringify(value));}catch{}};
    try{
        if(fresh)record={ticket,roomCode};else{const raw=storage?.getItem(JOIN_SESSION_KEY);if(!raw)return null;record=JSON.parse(raw);}
        if(!fresh&&record?.offline===true&&profile(record.profileId))return {profileId:record.profileId};
        if(typeof record?.ticket!=='string'||record.ticket.length>2048||typeof record.roomCode!=='string'||!/^[A-Z0-9]{8}$/.test(record.roomCode)||record.ticket.split('.').length!==2)throw Error('Invalid routing');
        const payload=JSON.parse(decode(record.ticket.split('.')[0]));
        if(!profile(payload.profileId)||payload.roomCode!==record.roomCode||payload.consent!==true||!['3-5','6-8','9-11'].includes(payload.age)||!Number.isFinite(payload.expires))throw Error('Invalid routing');
        if(payload.expires<=now){write({profileId:payload.profileId,offline:true});return {profileId:payload.profileId};}
        write({ticket:record.ticket,roomCode:record.roomCode});return {profileId:payload.profileId,join:{roomCode:record.roomCode,ticket:record.ticket}};
    }catch{write(null);return null;}
}
/** Explicit/offline fallback removes the credential while keeping this tab's scoped backup. */
export function saveSoloSession(storage:SessionStorage|undefined,profileId:string):void{
    try{if(profile(profileId))storage?.setItem(JOIN_SESSION_KEY,JSON.stringify({profileId,offline:true}));else storage?.removeItem(JOIN_SESSION_KEY);}catch{}
}
