/** Distance driven visual gait. Never changes the authoritative actor position. */
export class NpcGait {
    phase=0;visualPhase=0;weight=0;offsetX=0;offsetY=0;bob=0;sway=0;stretch=1;angle=0;stepFrame=0;
    private x=0;private y=0;private initialized=false;private pendingStride=0;
    constructor(seed=0){this.phase=this.visualPhase=seed%1;}
    update(dt:number,x:number,y:number,moving:boolean):void {
        const delta=Number.isFinite(dt)?Math.max(0,Math.min(dt,.1)):0;
        if(!Number.isFinite(x)||!Number.isFinite(y))return;
        if(!this.initialized){this.x=x;this.y=y;this.initialized=true;}
        const dx=x-this.x,dy=y-this.y,distance=Math.hypot(dx,dy);this.x=x;this.y=y;
        // A reconnect/teleport resets visual lag instead of walking across the map.
        if(distance>20){this.offsetX=0;this.offsetY=0;this.weight=0;this.pendingStride=0;this.visualPhase=this.phase;}
        else {
            this.offsetX=Math.max(-6,Math.min(6,this.offsetX-dx));
            this.offsetY=Math.max(-6,Math.min(6,this.offsetY-dy));
            if(moving){this.phase=(this.phase+distance/12)%1;this.pendingStride+=distance/12;}
        }
        const blend=1-Math.exp(-delta*14),settle= Math.exp(-delta*22);
        this.offsetX*=settle;this.offsetY*=settle;
        this.weight+=((moving&&distance<=20?1:0)-this.weight)*blend;
        // Consume only recorded travel, smoothly between sparse network snapshots.
        // Large corrections catch up directly so there is never a backlog of footsteps.
        if(this.pendingStride>.5){this.visualPhase=this.phase;this.pendingStride=0;}
        const stride=this.pendingStride*(1-Math.exp(-delta*24));
        this.pendingStride-=stride;this.visualPhase=(this.visualPhase+stride)%1;
        const wave=Math.sin(this.visualPhase*Math.PI*2),bounce=1-Math.cos(this.visualPhase*Math.PI*4);
        this.bob=bounce*1.1*this.weight;this.sway=wave*.7*this.weight;
        this.stretch=1+Math.cos(this.visualPhase*Math.PI*4)*.008*this.weight;
        const turn=delta>0?Math.max(-1,Math.min(1,dx/(18*delta))):0;
        this.angle+=(wave*1.5*this.weight-turn*.7*this.weight-this.angle)*blend;
        this.stepFrame=this.visualPhase<.5?0:1;
    }
}
