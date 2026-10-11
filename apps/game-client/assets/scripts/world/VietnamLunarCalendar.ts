import {lunarEpoch,lunarPeriod,newMoonUtc,solarLongitude} from './LunarAstronomy';
export interface CivilDate {year:number;month:number;day:number}
export interface LunarDate extends CivilDate {leap:boolean}
export const lunarCalendarRange={min:1900,max:2199};
const dayMs=86400000,jdUnix=2440587.5,zone=7/24;
interface Month {start:number;end:number;year:number;month:number;leap:boolean}
const periods=new Map<number,Month[]>();
function civilDay(utc:number):number{return Math.floor(utc+.5+zone);}
function civilJd(date:CivilDate):number{return Date.UTC(date.year,date.month-1,date.day)/dayMs+jdUnix+.5;}
function fromJd(jd:number):CivilDate{const d=new Date((jd-.5-jdUnix)*dayMs);return {year:d.getUTCFullYear(),month:d.getUTCMonth()+1,day:d.getUTCDate()};}
function valid(date:CivilDate):boolean{if(!date||![date.year,date.month,date.day].every(Number.isInteger)||date.year<1900||date.year>2199)return false;const actual=fromJd(civilJd(date));return actual.year===date.year&&actual.month===date.month&&actual.day===date.day;}
function anchor(year:number):number{
    let low=Date.UTC(year,11,19)/dayMs+jdUnix,high=low+8;
    for(let i=0;i<40;i++){const middle=(low+high)/2;if(solarLongitude(middle)<270)low=middle;else high=middle;}
    const solstice=civilDay((low+high)/2);let k=Math.floor((solstice-lunarEpoch)/lunarPeriod);
    while(civilDay(newMoonUtc(k+1))<=solstice)k++;while(civilDay(newMoonUtc(k))>solstice)k--;return k;
}
function winterPeriod(year:number):Month[]{
    const cached=periods.get(year);if(cached)return cached;
    const first=anchor(year),last=anchor(year+1),starts=Array.from({length:last-first+1},(_,i)=>civilDay(newMoonUtc(first+i)));
    const sector=(jd:number)=>Math.floor(solarLongitude(jd-.5-zone)/30);
    let leapIndex=-1;if(last-first===13)for(let i=1;i<starts.length-1;i++)if(sector(starts[i])===sector(starts[i+1])){leapIndex=i;break;}
    if(last-first!==12&&last-first!==13||last-first===13&&leapIndex<0)throw Error('Lunar month construction failed');
    let month=11;const result:Month[]=[];for(let i=0;i<starts.length-1;i++){if(i&&i!==leapIndex)month=month%12+1;result.push({start:starts[i],end:starts[i+1],year:month>=11?year:year+1,month,leap:i===leapIndex});}
    periods.set(year,result);return result;
}
export function solarToLunar(date:CivilDate):LunarDate|null{
    if(!valid(date))return null;const jd=civilJd(date),month=[...winterPeriod(date.year-1),...winterPeriod(date.year)].find(m=>jd>=m.start&&jd<m.end);
    return month?{year:month.year,month:month.month,day:jd-month.start+1,leap:month.leap}:null;
}
export function lunarToSolar(date:LunarDate):CivilDate|null{
    // January at the civil lower boundary can still belong to the previous lunar year.
    if(!date||![date.year,date.month,date.day].every(Number.isInteger)||date.year<lunarCalendarRange.min-1||date.year>lunarCalendarRange.max||date.month<1||date.month>12||date.day<1||date.day>30||typeof date.leap!=='boolean')return null;
    const month=[...winterPeriod(date.year-1),...winterPeriod(date.year)].find(m=>m.year===date.year&&m.month===date.month&&m.leap===date.leap);
    if(!month||date.day>month.end-month.start)return null;const result=fromJd(month.start+date.day-1);return valid(result)?result:null;
}
