import { _decorator, Color, Component, Graphics, Node, UITransform } from 'cc';
import { direction8, Point, tileAt, toWorld, VillageMap } from '../world/VillageModel';
const { ccclass } = _decorator;
export type AvatarGesture='hello'|'happy';
/** Transient presentation only: never changes position, progress or saved data. */
export class AvatarGestureState {
    kind:AvatarGesture|null=null;elapsed=0;
    start(kind:AvatarGesture):void{this.kind=kind;this.elapsed=0;}
    step(dt:number,moving:boolean):void{
        if(!this.kind)return;
        if(moving){this.kind=null;return;}
        this.elapsed+=Number.isFinite(dt)?Math.max(0,Math.min(dt,.1)):0;
        if(this.elapsed>=1.6)this.kind=null;
    }
    get jump():number{return this.kind==='happy'?Math.abs(Math.sin(this.elapsed*Math.PI*3))*12:0;}
}
/** Direction order: E, NE, N, NW, W, SW, S, SE. Animation adapters can subscribe to state. */
@ccclass('PlayerController')
export class PlayerController extends Component {
    map!: VillageMap;
    position: Point = toWorld({ x: 20, y: 20 });
    axis: Point = { x: 0, y: 0 };
    direction = 6;
    moving = false;
    speed = 150;
    private route: Point[] = [];
    get hasPath(): boolean { return this.route.length > 0; }
    cancel(): void { this.route = []; this.axis = { x: 0, y: 0 }; this.moving = false; }
    goTo(goal: Point): boolean {
        if (!this.map.walkable(goal.x, goal.y)) return false;
        const start = tileAt(this.position), path = this.map.path(start, goal);
        if (!path.length && (start.x !== goal.x || start.y !== goal.y)) return false;
        // First recenter in the current tile so path segments never cut blocked corners.
        this.route = [toWorld(start), ...path.map(toWorld)]; return true;
    }
    step(dt: number): void {
        this.moving = false;
        const manual = Math.hypot(this.axis.x, this.axis.y) > 0.05;
        if (manual) this.route = [];
        const strength = manual ? Math.min(1, Math.hypot(this.axis.x, this.axis.y)) : 1;
        let remaining = this.speed * Math.max(0, Math.min(dt, 0.1)) * strength;
        while (remaining > 0) {
            const target = this.route[0];
            if (!manual && !target) break;
            const delta = manual ? this.axis : { x: target.x - this.position.x, y: target.y - this.position.y };
            const distance = Math.hypot(delta.x, delta.y);
            if (distance < 0.01) { this.route.shift(); continue; }
            const step = Math.min(remaining, 2, manual ? Infinity : distance);
            let next = { x: this.position.x + delta.x / distance * step, y: this.position.y + delta.y / distance * step };
            if (!this.map.canStand(next)) {
                if (!manual) { this.route = []; break; }
                // Slide along isometric edges when diagonal/manual movement reaches a wall.
                const basis = [{ x: 2 / Math.sqrt(5), y: -1 / Math.sqrt(5) }, { x: -2 / Math.sqrt(5), y: -1 / Math.sqrt(5) }];
                const options = basis.map(v => { const projection = (delta.x * v.x + delta.y * v.y) / distance; return { x: this.position.x + v.x * projection * step, y: this.position.y + v.y * projection * step, amount: Math.abs(projection) }; }).sort((a,b) => b.amount-a.amount);
                const slide = options.find(p => p.amount > 0.01 && this.map.canStand(p));
                if (!slide) break;
                next = slide;
            }
            this.direction = direction8({ x: next.x - this.position.x, y: next.y - this.position.y });
            this.position = { x: next.x, y: next.y }; this.moving = true; remaining -= step;
        }
        this.node.setPosition(this.position.x, this.position.y);
    }
}

/** Lightweight animation adapter: replace this visual with sprite clips without changing input/pathfinding. */
export class PlayerVisual {
    private torso: Node;
    private left: Node;
    private right: Node;
    private head: Graphics;
    private facing = -1;
    private phase = 0;
    constructor(root: Node) {
        const part = (parent: Node, name: string): Node => {
            const n = new Node(name); n.layer = root.layer; parent.addChild(n); n.addComponent(UITransform); return n;
        };
        this.left = part(root, 'LeftLeg'); this.right = part(root, 'RightLeg');
        for (const [node,x] of [[this.left,-12],[this.right,3]] as [Node,number][]) {
            const g=node.addComponent(Graphics); g.fillColor=new Color(75,64,61);g.roundRect(x,4,9,17,3);g.fill();
        }
        this.torso=part(root,'AnimatedBody'); const body=this.torso.addComponent(Graphics);
        body.fillColor=new Color(237,115,86);body.roundRect(-16,18,32,27,6);body.fill();
        this.head=part(this.torso,'FacingHead').addComponent(Graphics);
    }
    step(dt: number, moving: boolean, direction: number): void {
        this.phase = moving ? (this.phase + Math.max(0,Math.min(dt,0.1))*12) % (Math.PI*2) : 0;
        const swing=moving?Math.sin(this.phase)*3:0;
        this.left.setPosition(0,swing);this.right.setPosition(0,-swing);this.torso.setPosition(0,Math.abs(swing)*0.5);
        if(direction===this.facing)return;this.facing=direction;
        const g=this.head;g.clear();g.fillColor=new Color(255,209,154);g.circle(0,52,14);g.fill();
        g.fillColor=new Color(80,56,40);
        if(direction>=1&&direction<=3){g.arc(0,52,14,0,Math.PI,false);g.close();g.fill();}
        else {
            const offset=direction===0||direction===7?5:direction===4||direction===5?-5:0;
            for(const x of [-5,5]){g.circle(x+offset,53,2);g.fill();}
            g.strokeColor=new Color(168,87,59);g.lineWidth=1.5;g.moveTo(-4+offset,47);g.lineTo(4+offset,47);g.stroke();
        }
    }
}
