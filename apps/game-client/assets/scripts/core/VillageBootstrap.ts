import { _decorator, Color, Component, EventKeyboard, EventTouch, game, Game, Graphics, input, Input, Label, Layers, Node, sys, UITransform, Vec3, view } from 'cc';
import { cameraOffset, inputAxis, Point, SIZE, terrain, tileAt, toWorld, VillageMap } from '../world/VillageModel';
import { PlayerController, PlayerVisual } from '../player/PlayerController';
import { FarmerNPC } from '../npc/FarmerNPC';
const { ccclass, disallowMultiple, requireComponent } = _decorator;
function ui(parent: Node, name: string, width = 1, height = 1): Node {
    const n = new Node(name); n.layer = Layers.Enum.UI_2D; parent.addChild(n);
    n.addComponent(UITransform).setContentSize(width, height); return n;
}
function label(parent: Node, text: string, width: number, height: number, size = 22): Node {
    const n = ui(parent, text, width, height), l = n.addComponent(Label);
    l.string = text; l.fontSize = size; l.lineHeight = size + 8; l.overflow = Label.Overflow.CLAMP; l.enableWrapText = true;
    l.color = new Color(48, 48, 35); return n;
}
function circle(g: Graphics, x: number, y: number, radius: number, color: Color): void { g.fillColor = color; g.circle(x, y, radius); g.fill(); }
@ccclass('VillageBootstrap')
@disallowMultiple
@requireComponent(UITransform)
export class VillageBootstrap extends Component {
    private map = new VillageMap();
    private root!: Node;
    private world!: Node;
    private actors!: Node;
    private player!: PlayerController;
    private farmer!: FarmerNPC;
    private arrow!: Node;
    private dialog!: Node;
    private joystick!: Node;
    private knob!: Node;
    private keys = new Set<number>();
    private stick: Point = { x: 0, y: 0 };
    private stickId: number | null = null;
    private pendingNpc = false;
    private lastDirection = -1;
    private viewWidth = 0;
    private viewHeight = 0;
    private backdrop!: Graphics;
    private header!: Node;
    private status!: Label;
    private statusRemaining = 0;
    private terrainChunks: { node: Node; center: Point }[] = [];
    private worldScale = 1;
    private lastPixelScale = 0;
    private playerVisual?: PlayerVisual;
    private marker?: Node;
    private markerTime = 0;
    private touches = new Map<number, { start: Point; dragged: boolean; blocked: boolean }>();
    onLoad(): void {
        this.root = ui(this.node, 'Milestone01A');
        this.backdrop = ui(this.root, 'VillageBackground').addComponent(Graphics);
        this.world = ui(this.root, 'VillageWorld');
        this.drawMap();
        this.marker = ui(this.world, 'Destination'); const mg=this.marker.addComponent(Graphics);
        mg.strokeColor=new Color(255,250,210);mg.lineWidth=3;mg.ellipse(0,0,20,10);mg.stroke();this.marker.active=false;
        this.actors = ui(this.world, 'DepthSortedActors');
        const pn = this.character('Em bé', new Color(237, 115, 86), false);
        this.player = pn.addComponent(PlayerController); this.player.map = this.map;
        this.playerVisual = new PlayerVisual(pn);
        this.arrow = ui(pn, 'Facing'); this.arrow.addComponent(Graphics);
        const fn = this.character('Bác Nông Dân', new Color(80, 135, 190), true), fp = toWorld(this.map.npc);
        fn.setPosition(fp.x, fp.y); this.farmer = fn.addComponent(FarmerNPC);
        label(fn, 'Bác Nông Dân', 180, 32, 18).setPosition(0, 74);
        this.header = ui(this.root, 'Header'); this.header.addComponent(Graphics);
        const hint = label(this.header, 'LÀNG TRI THỨC\nWASD / mũi tên / chạm để đi • Chạm bác nông dân để trò chuyện', 800, 90, 20);
        hint.name = 'Instructions';
        hint.getComponent(Label)!.color = new Color(255, 251, 231);
        this.status = label(this.root, '', 500, 42, 20).getComponent(Label)!;
        this.joystick = ui(this.root, 'Joystick', 140, 140);
        const jg = this.joystick.addComponent(Graphics); circle(jg, 0, 0, 65, new Color(255, 255, 255, 100));
        this.knob = ui(this.joystick, 'Knob'); circle(this.knob.addComponent(Graphics), 0, 0, 25, new Color(70, 100, 80, 170));
        this.joystick.active = sys.isMobile;
        this.dialog = ui(this.root, 'Dialogue', 620, 340);
        const dg = this.dialog.addComponent(Graphics); dg.fillColor = new Color(255, 246, 211); dg.roundRect(-310, -170, 620, 340, 16); dg.fill();
        label(this.dialog, 'Bác Nông Dân', 560, 42, 28).setPosition(0, 125);
        label(this.dialog, this.farmer.dialogue, 580, 200, sys.isMobile ? 28 : 24).setPosition(0, -15);
        label(this.dialog, sys.isMobile ? '[ Đóng ] • chạm hộp thoại' : '[ Đóng ] • chạm hộp thoại hoặc nhấn Esc', 570, 38, 22).setPosition(0, -135);
        this.dialog.active = false;
    }
    onEnable(): void {
        input.on(Input.EventType.KEY_DOWN, this.keyDown, this); input.on(Input.EventType.KEY_UP, this.keyUp, this);
        input.on(Input.EventType.TOUCH_START, this.touchStart, this); input.on(Input.EventType.TOUCH_MOVE, this.touchMove, this);
        input.on(Input.EventType.TOUCH_END, this.touchEnd, this); input.on(Input.EventType.TOUCH_CANCEL, this.touchCancel, this);
        game.on(Game.EVENT_HIDE, this.resetInput, this);
        if (sys.isBrowser) window.addEventListener('blur', this.handleBlur);
    }
    private drawMap(): void {
        const colors = { grass: new Color(130, 183, 100), road: new Color(201, 171, 121), rice: new Color(170, 198, 75), pond: new Color(83, 174, 204), courtyard: new Color(215, 185, 145) };
        // 25 static chunks, 64 diamonds per chunk. No per-frame map redraw or per-tile nodes.
        for (let cy = 0; cy < SIZE; cy += 8) for (let cx = 0; cx < SIZE; cx += 8) {
            const chunk = ui(this.world, `Terrain-${cx}-${cy}`), g = chunk.addComponent(Graphics);
            this.terrainChunks.push({ node: chunk, center: toWorld({ x: cx + 3.5, y: cy + 3.5 }) });
            for (let y = cy; y < cy + 8; y++) for (let x = cx; x < cx + 8; x++) {
                const p = toWorld({ x, y }), type = terrain(x, y); g.fillColor = colors[type];
                g.moveTo(p.x - 32, p.y); g.lineTo(p.x, p.y + 16); g.lineTo(p.x + 32, p.y); g.lineTo(p.x, p.y - 16); g.close(); g.fill();
                if (type === 'rice') {
                    g.strokeColor = new Color(85, 140, 53); g.lineWidth = 2;
                    for (const dx of [-12, 0, 12]) { g.moveTo(p.x + dx, p.y - 4); g.lineTo(p.x + dx - 3, p.y + 4); g.moveTo(p.x + dx, p.y - 4); g.lineTo(p.x + dx + 4, p.y + 5); } g.stroke();
                }
                if (type === 'pond' && (x + y) % 3 === 0) { g.strokeColor = new Color(155, 218, 231); g.moveTo(p.x - 9, p.y); g.lineTo(p.x + 9, p.y); g.stroke(); }
            }
        }
        for (const place of [{ text: 'SÂN ĐÌNH', x: 20, y: 23 }, { text: 'AO LÀNG', x: 28, y: 11 }, { text: 'RUỘNG LÚA', x: 9, y: 15 }]) {
            const p = toWorld(place); label(this.world, place.text, 200, 32, 18).setPosition(p.x, p.y);
        }
    }
    private character(name: string, shirt: Color, farmer: boolean): Node {
        const n = ui(this.actors, name, 64, 90), g = n.addComponent(Graphics);
        g.fillColor = new Color(40, 60, 30, 80); g.ellipse(0, 0, 17, 7); g.fill();
        if (!farmer) return n;
        g.fillColor = new Color(75, 64, 61); g.rect(-12, 4, 9, 16); g.rect(3, 4, 9, 16); g.fill();
        g.fillColor = shirt; g.roundRect(-16, 18, 32, 27, 6); g.fill();
        circle(g, 0, 52, 14, new Color(255, 209, 154));
        circle(g, -5, 54, 2, new Color(50, 40, 30)); circle(g, 5, 54, 2, new Color(50, 40, 30));
        if (farmer) { g.fillColor = new Color(239, 210, 130); g.moveTo(-25, 61); g.lineTo(0, 83); g.lineTo(25, 61); g.close(); g.fill(); }
        return n;
    }
    update(dt: number): void {
        const size = this.node.getComponent(UITransform)!;
        const pixelScale = view.getScaleX() / view.getDevicePixelRatio();
        if (size.width !== this.viewWidth || size.height !== this.viewHeight || (sys.isMobile && pixelScale !== this.lastPixelScale)) {
            this.viewWidth = size.width; this.viewHeight = size.height;
            this.lastPixelScale = pixelScale;
            // Keep mobile HUD dimensions in CSS pixels despite a 1280px design Canvas.
            const uiScale = sys.isMobile ? Math.max(1, 1 / pixelScale) : 1;
            this.worldScale = sys.isMobile ? uiScale * 0.8 : 1; this.world.setScale(this.worldScale, this.worldScale, 1);
            this.backdrop.clear(); this.backdrop.fillColor = new Color(193, 218, 179);
            this.backdrop.rect(-size.width / 2, -size.height / 2, size.width, size.height); this.backdrop.fill();
            const width = Math.min(840, size.width / uiScale - 24), hint = this.header.getChildByName('Instructions')!;
            hint.getComponent(UITransform)!.setContentSize(width - 20, 90);
            this.header.setScale(uiScale, uiScale, 1); this.header.setPosition(0, size.height / 2 - 60 * uiScale);
            const hg = this.header.getComponent(Graphics)!; hg.clear(); hg.fillColor = new Color(43, 78, 50, 235);
            hg.roundRect(-width / 2, -48, width, 96, 12); hg.fill();
            this.status.node.setScale(uiScale, uiScale, 1); this.status.node.setPosition(0, -size.height / 2 + 35 * uiScale);
            this.status.node.getComponent(UITransform)!.setContentSize(Math.min(500, size.width / uiScale - 20), 60);
            this.joystick.setScale(uiScale, uiScale, 1); this.joystick.setPosition(-size.width / 2 + 95 * uiScale, -size.height / 2 + 95 * uiScale);
            const scale = Math.min(uiScale, (size.width - 24 * uiScale) / 620); this.dialog.setScale(scale, scale, 1);
        }
        const keyboard = inputAxis(this.keys);
        this.player.axis = this.dialog.active ? { x: 0, y: 0 } : Math.hypot(this.stick.x, this.stick.y) > 0.05 ? this.stick : keyboard;
        if (Math.hypot(this.player.axis.x, this.player.axis.y) > 0.05) this.pendingNpc = false;
        this.player.step(dt);
        this.playerVisual?.step(dt,this.player.moving,this.player.direction);
        if(this.marker){
            this.marker.active=this.player.hasPath&&!this.dialog.active;
            this.markerTime+=Math.min(dt,0.1);const pulse=1+Math.sin(this.markerTime*5)*0.08;this.marker.setScale(pulse,pulse,1);
        }
        const cameraWidth = size.width / this.worldScale, cameraHeight = size.height / this.worldScale;
        const camera = cameraOffset(this.player.position, cameraWidth, cameraHeight); this.world.setPosition(camera.x * this.worldScale, camera.y * this.worldScale);
        for (const chunk of this.terrainChunks) {
            chunk.node.active = Math.abs(chunk.center.x + camera.x) < cameraWidth / 2 + 256
                && Math.abs(chunk.center.y + camera.y) < cameraHeight / 2 + 128;
        }
        if (this.statusRemaining > 0) { this.statusRemaining -= dt; if (this.statusRemaining <= 0) this.status.string = ''; }
        const front = this.player.position.y < this.farmer.node.position.y;
        this.player.node.setSiblingIndex(front ? 1 : 0);
        if (this.lastDirection !== this.player.direction) {
            this.lastDirection = this.player.direction; const angle = this.lastDirection * Math.PI / 4, g = this.arrow.getComponent(Graphics)!;
            g.clear(); g.fillColor = new Color(255, 255, 245); const x = Math.cos(angle), y = Math.sin(angle);
            g.moveTo(x * 30, y * 15); g.lineTo(x * 19 - y * 5, y * 10 + x * 5); g.lineTo(x * 19 + y * 5, y * 10 - x * 5); g.close(); g.fill();
        }
        if (this.pendingNpc) {
            const p = this.farmer.node.position;
            if (!this.player.hasPath && Math.hypot(p.x - this.player.position.x, p.y - this.player.position.y) < 55) {
                this.pendingNpc = false; this.player.cancel(); this.resetInput(); this.dialog.active = true; this.farmer.interact();
            }
        }
    }
    private local(p: Point, node = this.root): Vec3 { return node.getComponent(UITransform)!.convertToNodeSpaceAR(new Vec3(p.x, p.y, 0)); }
    private select(p: Point): void {
        if (this.dialog.active) {
            const d = this.local(p, this.dialog); if (Math.abs(d.x) <= 310 && Math.abs(d.y) <= 170) this.dialog.active = false;
            return;
        }
        if(this.isHeader(p))return;
        const world = this.local(p, this.world), npc = this.farmer.node.position;
        if (Math.abs(world.x - npc.x) <= 30 && world.y >= npc.y - 12 && world.y <= npc.y + 85) {
            const n=this.map.npc;
            const candidates = [{ x:n.x+1,y:n.y },{x:n.x-1,y:n.y},{x:n.x,y:n.y-1},{x:n.x,y:n.y+1}];
            const distance=(goal:Point)=>{const p=toWorld(goal);return Math.hypot(p.x-this.player.position.x,p.y-this.player.position.y);};
            candidates.sort((a,b)=>distance(a)-distance(b));
            for (const goal of candidates) if (this.player.goTo(goal)) { this.pendingNpc = true; this.showDestination(goal); break; }
        } else {
            const goal=tileAt(world);
            if(this.player.goTo(goal)){this.pendingNpc=false;this.showDestination(goal);}
            else {this.status.string = 'Chỗ này chưa đi tới được. Chọn ô đất khác nhé!'; this.statusRemaining = 2.5;}
        }
    }
    private showDestination(goal: Point): void {
        if(this.marker){const p=toWorld(goal);this.marker.setPosition(p.x,p.y);this.marker.active=true;this.markerTime=0;}
        if(this.status)this.status.string='';this.statusRemaining=0;
    }
    private isHeader(p:Point):boolean {
        if(!this.header)return false;
        const local=this.local(p,this.header),width=this.header.getChildByName('Instructions')!.getComponent(UITransform)!.width+20;
        return Math.abs(local.x)<=width/2&&Math.abs(local.y)<=48;
    }
    private tapThreshold():number { return 15*view.getDevicePixelRatio()/view.getScaleX(); }
    private keyDown(e: EventKeyboard): void {
        if (e.keyCode === 27) { this.dialog.active = false; this.resetInput(); return; }
        if (!this.dialog.active) this.keys.add(e.keyCode);
    }
    private keyUp(e: EventKeyboard): void { this.keys.delete(e.keyCode); }
    // Cocos 3.8.8 converts left mouse events to touch events. One shared handler avoids double clicks.
    private touchStart(e: EventTouch): void {
        const id=e.getID();if(id===null)return;
        const point=e.getUILocation(), start={x:point.x,y:point.y};
        const stickPoint=this.joystick.active?this.local(point,this.joystick):null;
        const onStick=!!stickPoint&&Math.hypot(stickPoint.x,stickPoint.y)<=75;
        this.touches.set(id,{start,dragged:false,blocked:!this.dialog.active&&(this.isHeader(point)||onStick)});
        if (!this.joystick.active || this.dialog.active || this.stickId !== null) return;
        if (onStick) { this.stickId = id; this.pendingNpc = false; this.player?.cancel(); this.updateStick(e); }
    }
    private updateStick(e: EventTouch): void {
        const p = this.local(e.getUILocation(), this.joystick), length = Math.hypot(p.x, p.y), scale = Math.max(45, length);
        this.stick = length < 7 ? { x: 0, y: 0 } : { x: p.x / scale, y: p.y / scale }; this.knob.setPosition(this.stick.x * 45, this.stick.y * 45);
    }
    private touchMove(e: EventTouch): void {
        const id=e.getID();if(id===null)return;
        const gesture=this.touches.get(id),p=e.getUILocation();
        if(gesture&&Math.hypot(p.x-gesture.start.x,p.y-gesture.start.y)>this.tapThreshold())gesture.dragged=true;
        if (id === this.stickId) this.updateStick(e);
    }
    private touchEnd(e: EventTouch): void {
        const id=e.getID();if(id===null)return;
        const gesture=this.touches.get(id);this.touches.delete(id);
        if (id === this.stickId) { this.releaseStick(); return; }
        const p=e.getUILocation();
        if(gesture&&!gesture.blocked&&!gesture.dragged&&Math.hypot(p.x-gesture.start.x,p.y-gesture.start.y)<=this.tapThreshold())this.select(p);
    }
    private touchCancel(e: EventTouch): void { const id=e.getID();if(id===null)return;this.touches.delete(id); if (id === this.stickId) this.releaseStick(); }
    private releaseStick(): void { this.stickId = null; this.stick = { x: 0, y: 0 }; this.knob.setPosition(0, 0); }
    private resetInput(): void { this.keys.clear(); this.releaseStick();this.touches.clear();this.player?.cancel();this.pendingNpc=false; }
    private handleBlur = (): void => { this.resetInput(); };
    onDisable(): void {
        if (this.player) { this.player.cancel(); this.pendingNpc = false; this.resetInput(); }
        input.off(Input.EventType.KEY_DOWN, this.keyDown, this); input.off(Input.EventType.KEY_UP, this.keyUp, this);
        input.off(Input.EventType.TOUCH_START, this.touchStart, this); input.off(Input.EventType.TOUCH_MOVE, this.touchMove, this);
        input.off(Input.EventType.TOUCH_END, this.touchEnd, this); input.off(Input.EventType.TOUCH_CANCEL, this.touchCancel, this);
        game.off(Game.EVENT_HIDE, this.resetInput, this);
        if (sys.isBrowser) window.removeEventListener('blur', this.handleBlur);
    }
    onDestroy(): void { if (this.root) this.root.destroy(); }
}
