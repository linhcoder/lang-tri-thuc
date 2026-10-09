import { createHash,createHmac,randomBytes,scryptSync,timingSafeEqual } from 'node:crypto';
export function passwordHash(password:string):string{const salt=randomBytes(16).toString('hex');return salt+':'+scryptSync(password,salt,32).toString('hex');}
export function verifyPassword(password:string,hash:string):boolean{const [salt,key]=hash.split(':');if(!salt||!key||key.length!==64)return false;const expected=Buffer.from(key,'hex'),actual=scryptSync(password,salt,32);return expected.length===actual.length&&timingSafeEqual(expected,actual);}
export const digest=(s:string):string=>createHash('sha256').update(s).digest('hex');
export interface RoomTicket {profileId:string;roomCode:string;age:string;expires:number;consent:true}
export function signTicket(ticket:RoomTicket,secret:string):string{const raw=Buffer.from(JSON.stringify(ticket)).toString('base64url');return raw+'.'+createHmac('sha256',secret).update(raw).digest('base64url');}
export function verifyTicket(token:string,secret:string):RoomTicket|null{
    if(typeof token!=='string'||token.length>2048)return null;const [raw,sig,...rest]=token.split('.');if(!raw||!sig||rest.length)return null;
    const actual=createHmac('sha256',secret).update(raw).digest(),expected=Buffer.from(sig,'base64url');if(actual.length!==expected.length||!timingSafeEqual(actual,expected))return null;
    try{const t=JSON.parse(Buffer.from(raw,'base64url').toString()) as RoomTicket;if(typeof t.profileId!=='string'||!/^[A-Z0-9]{8}$/.test(t.roomCode)||!['3-5','6-8','9-11'].includes(t.age)||t.consent!==true||!Number.isFinite(t.expires)||t.expires<Date.now())return null;return t;}catch{return null;}
}
