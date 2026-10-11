import {lunarToSolar,lunarCalendarRange} from './VietnamLunarCalendar';
/** Verified fixtures retained as references; runtime calculates lunar occurrences in UTC+7. */
export const festivalDates:Readonly<Record<number,{tet:string;'trung-thu':string}>>={
    2026:{tet:'2026-02-17','trung-thu':'2026-09-25'},
    2027:{tet:'2027-02-06','trung-thu':'2027-09-15'},
    2028:{tet:'2028-01-26','trung-thu':'2028-10-03'},
};
const calculated=new Map<number,{tet:string;'trung-thu':string}>();
export function festivalDatesForYear(year:number):{tet:string;'trung-thu':string}|null{
    if(!Number.isInteger(year)||year<lunarCalendarRange.min||year>lunarCalendarRange.max)return null;
    const cached=calculated.get(year);if(cached)return {...cached};
    const format=(month:number,day:number):string|null=>{const date=lunarToSolar({year,month,day,leap:false});return date?`${date.year}-${String(date.month).padStart(2,'0')}-${String(date.day).padStart(2,'0')}`:null;};
    try{const tet=format(1,1),midAutumn=format(8,15);if(!tet||!midAutumn)return null;const dates={tet,'trung-thu':midAutumn};calculated.set(year,dates);return {...dates};}catch{return null;}
}
export function vietnamDate(date=new Date()):string{
    if(!Number.isFinite(date.getTime()))return '';
    const d=new Date(date.getTime()+7*3600000);return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`;
}
export function festivalOccurrence(id:string,date=new Date()):{date:string;active:boolean;days:number}|null{
    const today=vietnamDate(date);if(!today||!['tet','trung-thu'].includes(id))return null;
    const year=Number(today.slice(0,4)),dates=festivalDatesForYear(year);if(!dates)return null;
    const start=dates[id as 'tet'|'trung-thu'],days=Math.round((Date.parse(start+'T00:00:00Z')-Date.parse(today+'T00:00:00Z'))/86400000);
    // Three game celebration days for Tet; one for Mid-Autumn. Not a public leave schedule.
    if(days>=-(id==='tet'?2:0))return {date:start,active:days<=0,days:Math.max(0,days)};
    const next=festivalDatesForYear(year+1)?.[id as 'tet'|'trung-thu'];return next?{date:next,active:false,days:Math.round((Date.parse(next+'T00:00:00Z')-Date.parse(today+'T00:00:00Z'))/86400000)}:null;
}
export function festivalDateLabel(id:string,date=new Date()):string{
    const occurrence=festivalOccurrence(id,date);if(!occurrence)return 'Cùng tìm hiểu quanh năm';
    if(occurrence.active)return 'Đang vui ngày lễ!';
    const [year,month,day]=occurrence.date.split('-');return `${Number(day)}/${Number(month)}/${year} · còn ${occurrence.days} ngày`;
}
