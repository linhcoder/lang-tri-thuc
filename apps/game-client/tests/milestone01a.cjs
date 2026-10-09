// Usage: node tests/milestone01a.cjs <path-to-typescript/lib/typescript.js>
// Algorithm/controller tests use a minimal cc harness, not a substitute for browser rendering QA.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require(process.argv[2] || 'typescript');
const cache = new Map();
// Rendering values are opaque in algorithm tests; browser QA uses the actual engine.
const cc = { _decorator: { ccclass: () => Class => Class, disallowMultiple: Class => Class, requireComponent: () => Class => Class }, Component: class {}, Vec3: class { constructor(x,y,z) { Object.assign(this,{x,y,z}); } }, UITransform: class {}, sys:{isMobile:false}, view:{getScaleX:()=>1,getDevicePixelRatio:()=>1} };
cc.Color=class {};
function load(file) {
    file = path.resolve(file); if (cache.has(file)) return cache.get(file).exports;
    const module = { exports: {} }; cache.set(file, module);
    const output = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, experimentalDecorators: true } }).outputText;
    vm.runInThisContext(`(function(require,module,exports){${output}\n})`, { filename: file })(name => name === 'cc' ? cc : load(path.resolve(path.dirname(file), name + '.ts')), module, module.exports);
    return module.exports;
}
const scripts = path.resolve(__dirname, '../assets/scripts');
const m = load(path.join(scripts, 'world/VillageModel.ts'));
const { PlayerController } = load(path.join(scripts, 'player/PlayerController.ts'));
const { VillageBootstrap } = load(path.join(scripts, 'core/VillageBootstrap.ts'));
const map = new m.VillageMap();
let checks = 0;
function test(name, fn) { fn(); checks++; console.log('PASS', name); }
function close(a,b) { assert.ok(Math.abs(a-b) < 1e-7, `${a} != ${b}`); }
test('1600 tile round-trips and fractional coordinates', () => {
    for(let y=0;y<40;y++) for(let x=0;x<40;x++) { assert.deepEqual(m.tileAt(m.toWorld({x,y})),{x,y}); const p={x:x+.23,y:y-.19}, q=m.toGrid(m.toWorld(p)); close(p.x,q.x); close(p.y,q.y); }
});
test('all terrain categories and blocked pond/NPC/bounds', () => {
    const types = new Set(); for(let y=0;y<40;y++) for(let x=0;x<40;x++) types.add(m.terrain(x,y)); assert.equal(types.size,5);
    for (const p of [{x:25,y:8},map.npc,{x:-1,y:2},{x:40,y:2}]) assert.equal(map.walkable(p.x,p.y),false);
});
function bfs(start,goal) {
    const queue=[{...start,d:0}], seen=new Set([`${start.x},${start.y}`]);
    for(let i=0;i<queue.length;i++) { const p=queue[i]; if(p.x===goal.x && p.y===goal.y) return p.d;
        for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) { const x=p.x+dx,y=p.y+dy,k=`${x},${y}`; if(map.walkable(x,y)&&!seen.has(k)){seen.add(k);queue.push({x,y,d:p.d+1});} }
    } return Infinity;
}
test('A* shortest paths match independent BFS for 60 routes', () => {
    for(let i=0;i<60;i++) { const start={x:(i*7)%40,y:(i*3)%40}, goal={x:(i*13+39)%40,y:(i*11+39)%40}; if(!map.walkable(start.x,start.y)||!map.walkable(goal.x,goal.y))continue;
        const route=map.path(start,goal); assert.equal(route.length,bfs(start,goal)); let last=start;
        for(const p of route) { assert.equal(map.walkable(p.x,p.y),true); assert.equal(Math.abs(last.x-p.x)+Math.abs(last.y-p.y),1); last=p; }
    }
    assert.deepEqual(map.path({x:20,y:20},{x:28,y:11}),[]);
    const sealed = new m.VillageMap(); sealed.walkable=(x,y)=> (x===0&&y===0)||(x===2&&y===2); assert.deepEqual(sealed.path({x:0,y:0},{x:2,y:2}),[]);
});
function player(start) { const p=new PlayerController(); p.map=map; p.node={setPosition(){}}; p.position=m.toWorld(start); return p; }
test('controller follows route around pond with collision at every step', () => {
    const p=player({x:24,y:10}); assert.equal(p.goTo({x:33,y:10}),true);
    for(let i=0;i<3000;i++) { p.step(1/60); assert.ok(map.canStand(p.position)); }
    assert.deepEqual(m.tileAt(p.position),{x:33,y:10}); assert.equal(p.moving,false);
});
test('manual input cancels route, map edge stops movement, long frames capped', () => {
    const p=player({x:20,y:20}); p.goTo({x:30,y:20}); const start={...p.position}; p.axis={x:-1,y:0}; p.step(3); close(start.x-p.position.x,15); p.axis={x:0,y:0}; const stop={...p.position}; p.step(1); assert.deepEqual(p.position,stop);
    p.position=m.toWorld({x:0,y:0}); p.axis={x:0,y:1}; for(let i=0;i<500;i++)p.step(1/60); assert.ok(map.canStand(p.position)); close(m.tileAt(p.position).x,0);
});
test('analog joystick strength controls speed and negative dt cannot move',()=> {
    const slow=player({x:20,y:20}),fast=player({x:20,y:20}); slow.axis={x:0.25,y:0};fast.axis={x:1,y:0};
    slow.step(0.1);fast.step(0.1);close(slow.position.x,3.75);close(fast.position.x,15);
    const before={...fast.position};fast.step(-1);assert.deepEqual(fast.position,before);
});
test('keyboard aliases, opposite keys, diagonal normalization and 8 directions', () => {
    assert.deepEqual(m.inputAxis(new Set([87,38])),{x:0,y:1}); assert.deepEqual(m.inputAxis(new Set([65,68])),{x:0,y:0});
    close(Math.hypot(...Object.values(m.inputAxis(new Set([87,68])))),1);
    for(let i=0;i<8;i++) assert.equal(m.direction8({x:Math.cos(i*Math.PI/4),y:Math.sin(i*Math.PI/4)}),i);
});
test('camera rectangular limits and oversized viewport',()=> {
    assert.deepEqual(m.cameraOffset({x:9000,y:-9000},1280,720),{x:-640,y:920});
    const p=m.cameraOffset({x:0,y:0},4000,2000); assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));
});
test('touch ownership, drag filtering, cancel and keyboard dialogue reset',()=> {
    const b=new VillageBootstrap(); b.joystick={active:true}; b.knob={setPosition(){}}; b.dialog={active:false}; b.local=p=>p;
    let selections=0; b.select=()=>selections++;
    const event=(id,x,y,sx=x,sy=y)=>({getID:()=>id,getUILocation:()=>({x,y}),getUIStartLocation:()=>({x:sx,y:sy})});
    b.touchStart(event(1,20,0)); assert.equal(b.stickId,1); b.touchStart(event(2,0,0)); assert.equal(b.stickId,1);
    b.touchEnd(event(1,20,0)); assert.equal(selections,0); assert.equal(b.stickId,null);
    b.touchEnd(event(2,200,200)); assert.equal(selections,0);
    b.touchStart(event(4,200,200));b.touchEnd(event(4,200,200));assert.equal(selections,1);
    b.touchStart(event(5,200,200));b.touchMove(event(5,250,200));b.touchMove(event(5,200,200));b.touchEnd(event(5,200,200));assert.equal(selections,1);
    b.touchEnd(event(99,200,200));assert.equal(selections,1);
    b.touchStart(event(3,20,0)); b.touchCancel(event(3,20,0)); assert.deepEqual(b.stick,{x:0,y:0});
    b.keyDown({keyCode:87}); b.keyUp({keyCode:87}); assert.equal(b.keys.size,0); b.dialog.active=true; b.keyDown({keyCode:87}); assert.equal(b.keys.size,0); b.keyDown({keyCode:27}); assert.equal(b.dialog.active,false);
});
test('NPC click approaches adjacent tile, opens dialogue only nearby, closes without moving',()=> {
    const b=new VillageBootstrap(), p=player({x:20,y:20}); let interactions=0;
    b.player=p; p.node.setSiblingIndex=()=>{};
    b.farmer={node:{position:m.toWorld(map.npc)},interact:()=>interactions++};
    b.world={setPosition(){}}; b.node={getComponent:()=>({width:1280,height:720})};
    b.viewWidth=1280; b.viewHeight=720; b.lastDirection=p.direction;
    b.dialog={active:false}; b.knob={setPosition(){}}; b.local=point=>point;
    const npc=b.farmer.node.position;
    b.select({x:npc.x,y:npc.y+50}); assert.equal(b.pendingNpc,true);
    b.update(0); assert.equal(b.dialog.active,false);
    for(let i=0;i<1000&&!b.dialog.active;i++){b.lastDirection=p.direction;b.arrow={getComponent:()=>({clear(){},moveTo(){},lineTo(){},close(){},fill(){}})};b.update(1/60);assert.ok(map.canStand(p.position));}
    assert.equal(b.dialog.active,true); assert.equal(interactions,1); assert.equal(b.pendingNpc,false);
    const before={...p.position}; b.select({x:0,y:0}); assert.equal(b.dialog.active,false); assert.deepEqual(p.position,before);
    b.select({x:npc.x,y:npc.y+50}); b.keys.add(87); b.update(0); assert.equal(b.pendingNpc,false);
});
test('manual movement slides along pond without crossing collision footprint',()=>{
    const p=player({x:24,y:10}),start={...p.position};p.axis={x:1,y:0};
    for(let i=0;i<60;i++){p.step(1/60);assert.ok(map.canStand(p.position));}
    assert.ok(p.position.x>start.x+30);assert.ok(p.position.y>start.y+10);
});
test('tap threshold is in screen pixels, drags returning to origin and blur never click',()=>{
    const b=new VillageBootstrap();b.joystick={active:false};b.knob={setPosition(){}};b.dialog={active:false};b.local=p=>p;
    let clicks=0;b.select=()=>clicks++;const event=(id,x,y)=>({getID:()=>id,getUILocation:()=>({x,y})});
    cc.view.getScaleX=()=>0.25;
    b.touchStart(event(1,200,200));b.touchMove(event(1,240,200));b.touchEnd(event(1,240,200));assert.equal(clicks,1);
    b.touchStart(event(2,200,200));b.touchMove(event(2,280,200));b.touchEnd(event(2,200,200));assert.equal(clicks,1);
    b.touchStart(event(3,200,200));b.resetInput();b.touchEnd(event(3,200,200));assert.equal(clicks,1);
    cc.view.getScaleX=()=>1;
});
test('taking joystick ownership cancels autonomous motion immediately',()=>{
    const b=new VillageBootstrap();b.player=player({x:20,y:20});b.player.goTo({x:30,y:20});b.joystick={active:true};b.knob={setPosition(){}};b.dialog={active:false};b.local=p=>p;
    b.touchStart({getID:()=>1,getUILocation:()=>({x:0,y:0})});assert.equal(b.player.hasPath,false);assert.equal(b.pendingNpc,false);
});
test('invalid destination preserves the active NPC request and route',()=>{
    const b=new VillageBootstrap();b.player=player({x:20,y:20});b.player.goTo({x:15,y:10});b.pendingNpc=true;
    b.dialog={active:false};b.local=p=>p;b.status={string:''};b.farmer={node:{position:m.toWorld(map.npc)}};
    const route=JSON.stringify(b.player.route);b.select(m.toWorld({x:27,y:10}));
    assert.equal(b.pendingNpc,true);assert.equal(JSON.stringify(b.player.route),route);assert.ok(b.status.string.length>0);
});
test('saved scene has valid references, imported bootstrap and existing Canvas/camera',()=>{
    const scene=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../assets/scenes/VillageScene.scene'),'utf8'));
    const meta=JSON.parse(fs.readFileSync(path.join(scripts,'core/VillageBootstrap.ts.meta'),'utf8'));
    const digits=meta.uuid.replaceAll('-',''), chars='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';let id=digits.slice(0,5);
    for(let i=5;i<digits.length;i+=3){const value=parseInt(digits.slice(i,i+3),16);id+=chars[value>>6]+chars[value&63];}
    const components=scene[2]._components.map(ref=>scene[ref.__id__]);
    assert.equal(components.filter(c=>c.__type__===id).length,1);
    const transform=components.find(c=>c.__type__==='cc.UITransform');assert.deepEqual(transform._contentSize,{__type__:'cc.Size',width:1280,height:720});
    const canvas=components.find(c=>c.__type__==='cc.Canvas');assert.equal(scene[canvas._cameraComponent.__id__].__type__,'cc.Camera');
    function references(value){if(!value||typeof value!=='object')return; if('__id__' in value)assert.ok(Number.isInteger(value.__id__)&&value.__id__>=0&&value.__id__<scene.length);for(const child of Object.values(value))references(child);}
    references(scene);
});
console.log(`${checks} test groups passed`);
