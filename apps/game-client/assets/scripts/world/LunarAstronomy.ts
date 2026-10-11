/** Meeus new-moon series adapted from astronomia (MIT, Sonia Keys / Commenthol).
 * License: docs/licenses/ASTRONOMIA-MIT.txt. Delta T: NASA Espenak/Meeus polynomials. */
const rad=Math.PI/180,sin=(degrees:number)=>Math.sin(degrees*rad);
export const lunarEpoch=2451550.09766,lunarPeriod=29.530588861;
function deltaT(year:number):number{
    if(year<1900){const t=year-1860;return 7.62+.5737*t-.251754*t**2+.01680668*t**3-.0004473624*t**4+t**5/233174;}
    if(year<1920){const t=year-1900;return -2.79+1.494119*t-.0598939*t**2+.0061966*t**3-.000197*t**4;}
    if(year<1941){const t=year-1920;return 21.20+.84493*t-.076100*t**2+.0020936*t**3;}
    if(year<1961){const t=year-1950;return 29.07+.407*t-t**2/233+t**3/2547;}
    if(year<1986){const t=year-1975;return 45.45+1.067*t-t**2/260-t**3/718;}
    if(year<2005){const t=year-2000;return 63.86+.3345*t-.060374*t**2+.0017275*t**3+.000651814*t**4+.00002373599*t**5;}
    if(year<2050){const t=year-2000;return 62.92+.32217*t+.005589*t**2;}
    const u=(year-1820)/100;return -20+32*u*u-(year<2150?.5628*(2150-year):0);
}
export function newMoonUtc(k:number):number{
    const t=k/1236.85,e=1-.002516*t-.0000074*t*t;
    const m=2.5534+29.1053567*k-.0000014*t*t-.00000011*t**3;
    const p=201.5643+385.81693528*k+.0107582*t*t+.00001238*t**3-.000000058*t**4;
    const f=160.7108+390.67050284*k-.0016118*t*t-.00000227*t**3+.000000011*t**4;
    const o=124.7746-1.56375588*k+.0020672*t*t+.00000215*t**3;
    const terms=[p,m,2*p,2*f,p-m,p+m,2*m,p-2*f,p+2*f,2*p+m,3*p,m+2*f,m-2*f,2*p-m,o,p+2*m,2*(p-f),3*m,p+m-2*f,2*(p+f),p+m+2*f,p-m+2*f,p-m-2*f,3*p+m,4*p];
    const weights=[-.4072,.17241*e,.01608,.01039,.00739*e,-.00514*e,.00208*e*e,-.00111,-.00057,.00056*e,-.00042,.00042*e,.00038*e,-.00024*e,-.00017,-.00007,.00004,.00004,.00003,.00003,-.00003,.00003,-.00002,-.00002,.00002];
    const a=[[299.7+.107408*k-.009173*t*t,.000325],[251.88+.016321*k,.000165],[251.83+26.651886*k,.000164],[349.42+36.412478*k,.000126],[84.66+18.206239*k,.00011],[141.74+53.303771*k,.000062],[207.17+2.453732*k,.00006],[154.84+7.30686*k,.000056],[34.52+27.261239*k,.000047],[207.19+.121824*k,.000042],[291.34+1.844379*k,.00004],[161.72+24.198154*k,.000037],[239.56+25.513099*k,.000035],[331.55+3.592518*k,.000023]];
    const jde=lunarEpoch+lunarPeriod*k+.00015437*t*t-.00000015*t**3+.00000000073*t**4+terms.reduce((sum,angle,i)=>sum+weights[i]*sin(angle),0)+a.reduce((sum,[angle,weight])=>sum+weight*sin(angle),0);
    return jde-deltaT(2000+k/12.3685)/86400;
}
export function solarLongitude(utc:number):number{
    const year=2000+(utc-2451545)/365.2425,t=(utc+deltaT(year)/86400-2451545)/36525;
    const m=357.52911+35999.05029*t-.0001537*t*t;
    const longitude=280.46646+36000.76983*t+.0003032*t*t+(1.914602-.004817*t-.000014*t*t)*sin(m)+(.019993-.000101*t)*sin(2*m)+.000289*sin(3*m)-.00569-.00478*sin(125.04-1934.136*t);
    return ((longitude%360)+360)%360;
}
