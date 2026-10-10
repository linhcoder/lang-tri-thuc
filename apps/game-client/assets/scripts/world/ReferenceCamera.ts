import {Point} from './VillageModel';

/** Keep the village's designed opening composition until the child nears an edge. */
export function referenceCameraFocus(player:Point,width:number,height:number,mobile:boolean,reserve=45):Point {
    if(mobile)return {x:player.x,y:player.y+reserve};
    const anchor={x:0,y:-595},safeX=Math.max(0,width/2-(player.x<0?336:110)),safeY=Math.max(0,height/2-170);
    const outside=(distance:number,safe:number)=>Math.sign(distance)*Math.max(0,Math.abs(distance)-safe);
    return {x:anchor.x+outside(player.x-anchor.x,safeX),y:anchor.y+outside(player.y-anchor.y,safeY)};
}
