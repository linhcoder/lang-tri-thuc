/** View preference only; never changes map coordinates, paths or network positions. */
export class CameraZoom {
    readonly min=0.6;readonly max=1.8;value=1;
    private pinchDistance=0;private pinchValue=1;
    set(value:number):number{if(Number.isFinite(value))this.value=Math.round(Math.max(this.min,Math.min(this.max,value))*1000)/1000;return this.value;}
    wheel(delta:number):number{return Number.isFinite(delta)?this.set(this.value*Math.exp(-Math.max(-500,Math.min(500,delta))*0.001)):this.value;}
    beginPinch(distance:number):boolean{if(!Number.isFinite(distance)||distance<15)return false;this.pinchDistance=distance;this.pinchValue=this.value;return true;}
    pinch(distance:number):number{return this.pinchDistance>0&&Number.isFinite(distance)&&distance>0?this.set(this.pinchValue*distance/this.pinchDistance):this.value;}
    endPinch():void{this.pinchDistance=0;}
}
