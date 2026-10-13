export interface SafeInsets {left:number;right:number;top:number;bottom:number}
export const noInsets:SafeInsets={left:0,right:0,top:0,bottom:0};
/** Layout in CSS-sized HUD units, independently of the world camera scale. */
export function hudLayout(width:number,height:number,safe:SafeInsets=noInsets){
 const left=-width/2+safe.left+12,right=width/2-safe.right-12,top=height/2-safe.top-12,bottom=-height/2+safe.bottom+12;
 const portrait=width<650&&height>=500,short=height<500;
 return {left,right,top,bottom,portrait,short,profileWidth:width<420?184:206,mapWidth:width<420?108:126,trackerWidth:portrait?Math.min(242,width-110):short?210:246,trackerHeight:short?112:148,trackerY:bottom+(portrait?260:short?220:90),emotionX:portrait?74:0,menuX:portrait?14:-66,actionX:right-34,actionY:bottom+(short?90:112),moveY:bottom+30,toolbar:width>=1100&&height>=600};
}
export function readSafeInsets():SafeInsets{if(typeof document==='undefined')return noInsets;const probe=document.createElement('div');probe.style.cssText='position:fixed;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';document.body.appendChild(probe);const s=getComputedStyle(probe),result={left:parseFloat(s.paddingLeft)||0,right:parseFloat(s.paddingRight)||0,top:parseFloat(s.paddingTop)||0,bottom:parseFloat(s.paddingBottom)||0};probe.remove();return result;}
