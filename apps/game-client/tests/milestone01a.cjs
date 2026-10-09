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
    vm.runInThisContext(`(function(require,module,exports){${output}\n})`, { filename: file })(name => name === 'cc' ? cc : !name.startsWith('.') ? require(name) : load(path.resolve(path.dirname(file), name + '.ts')), module, module.exports);
    return module.exports;
}
const scripts = path.resolve(__dirname, '../assets/scripts');
const m = load(path.join(scripts, 'world/VillageModel.ts'));
const { PlayerController } = load(path.join(scripts, 'player/PlayerController.ts'));
const { VillageBootstrap } = load(path.join(scripts, 'core/VillageBootstrap.ts'));
const { LearningProgress,sowSeeds }=load(path.join(scripts,'world/LearningProgress.ts'));
const { ChapterOneProgress,plantingPlots,FIRST_STAR }=load(path.join(scripts,'world/ChapterOneProgress.ts'));
const { RiceCountGame }=load(path.join(scripts,'world/RiceCountGame.ts'));
const { ChapterOneSave,CHAPTER_SAVE_KEY,LEGACY_SAVE_KEY }=load(path.join(scripts,'world/ChapterOneSave.ts'));
const { CampaignEngine,DialogueEngine }=load(path.join(scripts,'world/CampaignEngine.ts'));
const { chapters,miniGameIds,validateContent }=load(path.join(scripts,'world/CampaignContent.ts'));
const { EducationEngine,lessonQuestions }=load(path.join(scripts,'world/EducationEngine.ts'));
const { MiniGameRules,puzzleScramble,mazePath }=load(path.join(scripts,'world/MiniGameRules.ts'));
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
    b.world={setPosition(){}};b.actors={children:[]}; b.node={getComponent:()=>({width:1280,height:720})};
    b.viewWidth=1280; b.viewHeight=720; b.lastDirection=p.direction;
    b.dialog={active:false}; b.knob={setPosition(){}}; b.local=point=>point;b.status={string:''};
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
test('accepted NPC interaction replaces pending harvest; rejected NPC route preserves it',()=>{
    const b=new VillageBootstrap();b.player=player({x:20,y:20});b.dialog={active:false};b.local=p=>p;
    b.farmer={node:{position:m.toWorld(map.npc)}};b.pendingBundle=1;
    b.player.goTo=()=>false;b.select({...b.farmer.node.position,y:b.farmer.node.position.y+50});
    assert.equal(b.pendingBundle,1);assert.equal(b.pendingNpc,false);
    b.player.goTo=()=>true;b.select({...b.farmer.node.position,y:b.farmer.node.position.y+50});
    assert.equal(b.pendingBundle,null);assert.equal(b.pendingNpc,true);
});
test('joystick takeover cancels pending harvest as well as path and NPC intent',()=>{
    const b=new VillageBootstrap();b.player=player({x:20,y:20});b.player.goTo({x:30,y:20});
    b.pendingBundle=2;b.pendingNpc=true;b.joystick={active:true};b.knob={setPosition(){}};b.dialog={active:false};b.local=p=>p;
    b.touchStart({getID:()=>1,getUILocation:()=>({x:0,y:0})});
    assert.equal(b.pendingBundle,null);assert.equal(b.pendingNpc,false);assert.equal(b.player.hasPath,false);
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
test('quest advances only after valid harvest and three correct answers per lesson',()=>{
    const p=new LearningProgress();assert.equal(p.collect(0),false);p.accept();assert.equal(p.collect(0),true);assert.equal(p.collect(0),false);
    p.collect(1);p.collect(2);assert.equal(p.data.stage,'count');assert.equal(p.answerCount(2,3),false);
    for(const n of [3,5,4])assert.equal(p.answerCount(n,n),true);assert.equal(p.data.stage,'sow');
    for(const [start,count,dir] of [[1,3,1],[4,4,-1],[10,5,1]]){const r=sowSeeds(start,count,dir);assert.equal(r.cells.reduce((a,b)=>a+b),count);assert.equal(p.answerSow(r.last,r.last),true);}
    assert.equal(p.data.stage,'complete');const restore=new LearningProgress();restore.restore(JSON.stringify(p.data));assert.deepEqual(restore.data,p.data);
});
test('corrupt saves cannot unlock rewards or prevent play; sowing wraps both directions',()=>{
    const p=new LearningProgress();p.restore('{');assert.equal(p.data.stage,'welcome');p.restore(JSON.stringify({version:1,stage:'complete',collected:[-1,0,0,99],countWins:0,sowWins:0}));assert.equal(p.data.stage,'collect');assert.deepEqual(p.data.collected,[0]);
    assert.equal(sowSeeds(11,2,1).last,1);assert.equal(sowSeeds(0,2,-1).last,10);assert.throws(()=>sowSeeds(20,3,1));
    p.restore(JSON.stringify({version:1,stage:'complete',collected:[0],countWins:3,sowWins:3}));assert.equal(p.data.stage,'collect');assert.equal(p.data.countWins,0);assert.equal(p.data.sowWins,0);
});
test('chapter one requires greeting, five unique reachable plots, counting and elder turn-in',()=>{
    const p=new ChapterOneProgress(),game=new RiceCountGame(p);assert.equal(p.plant(0),false);assert.equal(game.answer(3),false);assert.equal(p.turnIn(),false);
    p.enterVillage();p.greet();p.accept();
    for(let i=0;i<5;i++){assert.equal(map.canStand(m.toWorld(plantingPlots[i])),true);assert.equal(m.terrain(plantingPlots[i].x,plantingPlots[i].y),'rice');assert.equal(p.plant(i),true);assert.equal(p.plant(i),false);const q=new ChapterOneProgress();assert.equal(q.restore(JSON.stringify(p.data)),true);assert.deepEqual(q.data,p.data);}
    assert.equal(p.stage,'count');assert.equal(p.plant(0),false);assert.equal(game.answer(99),false);
    for(const n of [3,5,2]){assert.equal(game.answer(n),true);const q=new ChapterOneProgress();q.restore(JSON.stringify(p.data));assert.deepEqual(q.data,p.data);}
    assert.equal(p.stage,'return');assert.equal(p.stars,0);assert.equal(p.turnIn(),true);assert.equal(p.turnIn(),false);assert.equal(p.chapterTwoUnlocked,true);assert.deepEqual(p.data.rewardReceipts,[FIRST_STAR]);
});
test('chapter replay survives reload without removing completion or duplicating star',()=>{
    const p=new ChapterOneProgress();p.enterVillage();p.greet();p.accept();for(let i=0;i<5;i++)p.plant(i);
    const game=new RiceCountGame(p);for(const n of [3,5,2])game.answer(n);p.turnIn();p.startReplay();game.answer(3);
    const restore=new ChapterOneProgress();restore.restore(JSON.stringify(p.data));assert.equal(restore.data.replayRound,1);
    const replay=new RiceCountGame(restore);assert.equal(replay.answer(5),true);assert.equal(replay.answer(2),true);assert.equal(replay.answer(2),false);restore.endReplay();assert.equal(restore.stage,'complete');assert.equal(restore.stars,1);assert.equal(restore.turnIn(),false);
});
function memoryStorage(values={}){return {values:{...values},getItem(key){return this.values[key]??null;},setItem(key,value){this.values[key]=value;}};}
test('legacy migration retains the original and demo badge without granting planted crops or chapter star',()=>{
    const raw=JSON.stringify({version:1,stage:'complete',collected:[0,1,2],countWins:3,sowWins:3}),storage=memoryStorage({[LEGACY_SAVE_KEY]:raw}),save=new ChapterOneSave(storage);save.load();
    assert.equal(save.progress.data.legacyDemoBadge,true);assert.equal(save.progress.stage,'intro');assert.equal(save.progress.stars,0);assert.deepEqual(save.progress.data.planted,[]);save.progress.enterVillage();assert.equal(save.save(),true);assert.equal(storage.getItem(LEGACY_SAVE_KEY),raw);
    const reload=new ChapterOneSave(storage);reload.load();assert.equal(reload.progress.stage,'greet');assert.equal(reload.progress.data.legacyDemoBadge,true);
});
test('corrupt and future saves are preserved; unavailable storage remains playable',()=>{
    const storage=memoryStorage({[CHAPTER_SAVE_KEY]:'{broken'}),save=new ChapterOneSave(storage);save.load();assert.equal(storage.getItem(CHAPTER_SAVE_KEY+'.recovery'),'{broken');save.progress.enterVillage();assert.equal(save.save(),true);
    const future='{"version":3,"valuable":"keep"}',nextStorage=memoryStorage({[CHAPTER_SAVE_KEY]:future}),next=new ChapterOneSave(nextStorage);next.load();next.progress.enterVillage();assert.equal(next.save(),false);assert.equal(nextStorage.getItem(CHAPTER_SAVE_KEY),future);
    const blocked=new ChapterOneSave({getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}});blocked.load();assert.equal(blocked.progress.enterVillage(),true);assert.equal(blocked.save(),false);assert.equal(blocked.sessionOnly,true);
    const full=new ChapterOneSave({getItem(){return null;},setItem(){throw Error('full');}});full.load();assert.equal(full.save(),false);assert.ok(full.notice.length>0);
});
test('chapter restore normalizes invalid dependencies, duplicate receipts and forged partial completion',()=>{
    const p=new ChapterOneProgress();assert.equal(p.restore('null'),false);assert.equal(p.restore('{'),false);
    const raw={version:2,introSeen:true,greeted:true,accepted:true,planted:[0,0,99,-1],countRound:3,rewardReceipts:[FIRST_STAR,FIRST_STAR],replayRound:1,legacyDemoBadge:false};
    assert.equal(p.restore(JSON.stringify(raw)),true);assert.equal(p.stage,'plant');assert.equal(p.stars,0);assert.equal(p.data.countRound,0);assert.equal(p.data.replayRound,null);
    raw.planted=[0,1,2,3,4];p.restore(JSON.stringify(raw));assert.equal(p.stars,1);assert.equal(p.data.rewardReceipts.length,1);
    raw.greeted=false;p.restore(JSON.stringify(raw));assert.equal(p.stage,'greet');assert.deepEqual(p.data.planted,[]);assert.equal(p.stars,0);
});
test('content graph has eight chapters, twelve registered games and blocks unreviewed shipping packs',()=>{
    assert.equal(chapters.length,8);assert.equal(miniGameIds.length,12);assert.deepEqual(validateContent(),[]);assert.equal(validateContent(true).length,8);
    assert.throws(()=>new DialogueEngine([{id:'a',text:'a',next:'b'},{id:'b',text:'b',next:'a'}]));assert.throws(()=>new DialogueEngine([{id:'a',text:'a',next:'missing'}]));
});
test('campaign unlocks sequential quests/chapters and gives exactly eight idempotent receipts',()=>{
    const c=new CampaignEngine();assert.equal(c.complete('q.ch02.learn-rules'),false);const first=new ChapterOneProgress();first.enterVillage();first.greet();first.accept();for(let i=0;i<5;i++)first.plant(i);for(let i=0;i<3;i++)first.finishCountRound();first.turnIn();c.syncChapterOne(first.data);
    for(let i=1;i<8;i++){assert.equal(c.unlocked(i),true);c.introduce(i);for(const q of chapters[i].quests){assert.equal(c.complete(q.id),true);assert.equal(c.complete(q.id),false);}assert.equal(c.claim(i),true);assert.equal(c.claim(i),false);}
    assert.equal(c.stars,8);const copy=new CampaignEngine();assert.equal(copy.restore(JSON.stringify(c.data)),true);assert.equal(copy.stars,8);
    const forged=new CampaignEngine();forged.restore(JSON.stringify({...c.data,completed:[],receipts:c.data.receipts}));assert.equal(forged.stars,0);
});
test('lessons validate arithmetic at all three age levels and reject draft publication',()=>{
    for(const age of ['3-5','6-8','9-11']){const questions=lessonQuestions('math',age),e=new EducationEngine(questions);for(const q of questions){const match=q.prompt.match(/(\d+) ([+×−÷]) (\d+)/);assert.ok(match);const a=+match[1],b=+match[3],expected=match[2]==='+'?a+b:match[2]==='−'?a-b:match[2]==='÷'?a/b:a*b;assert.equal(+q.choices[q.answer],expected);assert.equal(e.answer(-1),false);assert.equal(e.answer(q.answer),true);}assert.equal(e.complete,true);}
    assert.throws(()=>new EducationEngine(lessonQuestions('math','3-5'),0,true));
});
function verifyGame(game){const before=JSON.stringify(game.data);assert.equal(game.action('invalid',-99),false);assert.equal(JSON.stringify(game.data),before);const restored=MiniGameRules.restore(game.save());assert.deepEqual(restored.data,game.data);}
test('twelve distinct minigames complete solo, validate actions and restore deterministic traces',()=>{
    for(const id of miniGameIds){const g=new MiniGameRules(id);verifyGame(g);
        if(id==='mg.rice-count'){for(let i=0;i<5;i++)g.action('plant',i);for(let i=0;i<5;i++)g.action('water',i);assert.equal(g.action('answer',4),false);g.action('answer',5);}
        else if(id==='mg.o-an-quan'){for(let i=0;i<150&&!g.ended;i++){const pit=[0,1,2,3,4].find(p=>g.data.board[p]>0);assert.ok(pit!==undefined);assert.equal(g.action('pit',pit),true);assert.equal(g.data.board.reduce((a,b)=>a+b)+g.data.scores[0]+g.data.scores[1]+g.data.quan.filter(Boolean).length*10,70);}}
        else if(id==='mg.tug-of-war'||id==='mg.bamboo-dance'){for(let i=0;i<500&&!g.ended;i++){g.advance(.1);if(g.rhythmOpen)g.action('beat',0);}}
        else if(id==='mg.market'){for(let i=0;i<3;i++)for(let n=0;n<g.data.wants[i];n++)g.action('add',i);assert.equal(g.action('pay',0),false);g.action('pay',2);}
        else if(id==='mg.star-lantern'){for(let i=0;i<5;i++){g.action('part',i);assert.equal(g.action('place',(i+1)%5),false);g.action('place',i);}}
        else if(id==='mg.banh-chung'){for(let i=0;i<6;i++)g.action('layer',i);}
        else if(id==='mg.dong-ho'){for(const index of puzzleScramble(17).reverse){if(g.ended)break;g.action('tile',index);}}
        else if(id==='mg.fishing'){for(let step=0;step<300&&!g.ended;step++){g.advance(.1);for(let i=0;i<3;i++)if(g.data.caught<0&&!g.data.observed.includes(i)&&Math.abs(g.fishX(i))<70){g.action('fish',i);g.action('color',i);}}}
        else if(id==='mg.secret-letters'){while(!g.ended)g.action('letter',g.data.grid.indexOf(g.data.word[g.data.step]));}
        else if(id==='mg.animal-care'){for(const i of [1,0,2])g.action('care',i);}
        else if(id==='mg.village-maze'){for(const next of mazePath(0)){const offset=next-g.data.cursor;g.action('move',[-5,1,5,-1].indexOf(offset));}}
        assert.equal(g.ended,true,id);verifyGame(g);assert.equal(g.action('plant',0),false);
    }
});
test('pause freezes time, invalid saved actions cannot forge results, NPC tiles remain reachable',()=>{
    const g=new MiniGameRules('mg.tug-of-war');g.pause();g.advance(10);assert.equal(g.clock,0);assert.equal(g.action('beat',0),false);g.resume();g.advance(.1);assert.ok(g.clock>0);
    assert.throws(()=>MiniGameRules.restore({...g.save(),actions:[{type:'beat',index:0,at:-1}]}));
    for(const npc of m.storyNpcs){assert.equal(map.walkable(npc.x,npc.y),false);assert.ok([[1,0],[-1,0],[0,1],[0,-1]].some(([x,y])=>map.path({x:20,y:20},{x:npc.x+x,y:npc.y+y}).length>0));}
});
test('world map pins are unique, walkable and reachable; edited chapter text cannot change IDs',()=>{
 const {validateZones,portalDestination}=load(path.join(scripts,'world/WorldZones.ts'));assert.equal(validateZones(),true);assert.deepEqual(portalDestination(m.toWorld({x:20,y:22}),'farm'),m.toWorld({x:14,y:11}));assert.equal(portalDestination({x:9999,y:9999},'farm'),null);assert.equal(portalDestination({x:0,y:-640},'unknown'),null);
 const {applyChapterText}=load(path.join(scripts,'world/ContentPack.ts'));const old=chapters[0].title;
 assert.equal(applyChapterText({version:1,chapters:[{id:'unknown',title:'x',intro:'x',ending:'x',questTitles:{}}]}),false);
 assert.equal(chapters[0].title,old);assert.equal(applyChapterText({version:1,chapters:[]}),true);
});
test('demo sowing preserves each result and shows the final result before the badge',()=>{
 const {LearningPanel}=load(path.join(scripts,'ui/LearningPanel.ts'));
 const progress=new LearningProgress();progress.accept();for(let i=0;i<3;i++)progress.collect(i);for(let i=0;i<3;i++)progress.answerCount(3,3);
 const panel=Object.create(LearningPanel.prototype);panel.progress=progress;panel.node={children:[]};panel.changed=()=>{};panel.feedback='';panel.sowResult=null;
 let labels=[],buttons=[];panel.text=value=>labels.push(value);panel.button=(value,x,y,width,action)=>buttons.push({value,action});
 const render=()=>{labels=[];buttons=[];panel.render();};
 for(const [round,answer] of [[0,'5'],[1,'1'],[2,'4']]){
  render();buttons.find(b=>b.value===answer).action();render();
  assert.equal(progress.data.sowWins,round+1);assert.ok(panel.sowResult);
  assert.ok(labels.includes('Ô ĂN QUAN • LUYỆN RẢI HẠT'));
  buttons.find(b=>b.value==='2').action();assert.equal(progress.data.sowWins,round+1);
  buttons.find(b=>b.value===(round===2?'Nhận huy hiệu':'Bài tiếp theo')).action();render();assert.equal(panel.sowResult,null);
 }
 assert.ok(labels.includes('NGƯỜI BẠN CỦA LÀNG'));assert.equal(progress.data.stage,'complete');
});
test('malformed chapter packs are rejected without throwing or partially changing content',()=>{
 const {applyChapterText}=load(path.join(scripts,'world/ContentPack.ts'));
 const before=JSON.stringify(chapters),c=chapters[0];
 const valid={id:c.id,title:'Tên thử',intro:'Mở đầu thử',ending:'Kết thúc thử',questTitles:{}};
 for(const value of [null,{}, {version:1,chapters:[null]}, {version:1,chapters:[7]}, {version:1,chapters:[[]]},
  {version:1,chapters:[{...valid,title:' '.repeat(3)}]}, {version:1,chapters:[{...valid,title:'x'.repeat(121)}]},
  {version:1,chapters:[{...valid,questTitles:[]}]}, {version:1,chapters:[{...valid,questTitles:{[c.quests[0].id]:' '}}]},
  {version:1,chapters:[valid,null]}, {version:1,chapters:[valid,valid]}]){
  assert.equal(applyChapterText(value),false);assert.equal(JSON.stringify(chapters),before);
 }
 assert.equal(applyChapterText({version:1,chapters:[valid]}),true);assert.equal(c.title,valid.title);
 const originals=JSON.parse(before);chapters.forEach((chapter,i)=>Object.assign(chapter,originals[i]));
});
test('campaign reset keeps current progress when backup or primary storage fails',()=>{
 const {CampaignSave,CAMPAIGN_KEY}=load(path.join(scripts,'world/CampaignSave.ts'));
 for(const failingKey of [CAMPAIGN_KEY+'.parent-backup',CAMPAIGN_KEY,null]){
  const values=new Map();let blocked=null;
  const storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>{if(key===blocked)throw Error('Quota exceeded');values.set(key,value);}};
  const save=new CampaignSave(storage);save.engine.data.introduced=['ch01'];save.engine.data.age='9-11';save.engine.data.quality='high';save.engine.data.sound=true;save.engine.data.avatar=2;save.engine.data.accessory=3;save.engine.data.hair=1;
  assert.equal(save.save(),true);const previous=save.engine.data,raw=values.get(CAMPAIGN_KEY);blocked=failingKey;
  const ok=save.resetLaterChapters();assert.equal(ok,failingKey===null);
  if(!ok){assert.equal(save.engine.data,previous);assert.equal(values.get(CAMPAIGN_KEY),raw);assert.ok(save.notice);}
  else{assert.deepEqual(save.engine.data.introduced,[]);assert.equal(save.engine.data.age,'9-11');assert.equal(save.engine.data.quality,'high');assert.equal(save.engine.data.sound,true);assert.equal(save.engine.data.avatar,2);assert.equal(save.engine.data.accessory,3);assert.equal(save.engine.data.hair,1);assert.equal(values.get(CAMPAIGN_KEY+'.parent-backup'),raw);assert.deepEqual(JSON.parse(values.get(CAMPAIGN_KEY)),save.engine.data);}
 }
});
test('campaign corrupt saves retain the first recovery and preserve raw data if backup fails',()=>{
 const {CampaignSave,CAMPAIGN_KEY}=load(path.join(scripts,'world/CampaignSave.ts'));
 const values=new Map([[CAMPAIGN_KEY,'first-broken']]);let fail=false;
 const storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>{if(fail)throw Error('Quota exceeded');values.set(key,value);}};
 new CampaignSave(storage);assert.equal(values.get(CAMPAIGN_KEY+'.recovery'),'first-broken');
 values.set(CAMPAIGN_KEY,'second-broken');new CampaignSave(storage);
 assert.equal(values.get(CAMPAIGN_KEY+'.recovery'),'first-broken');assert.equal(values.get(CAMPAIGN_KEY+'.recovery.latest'),'second-broken');
 values.set(CAMPAIGN_KEY,'third-broken');fail=true;const save=new CampaignSave(storage);
 assert.equal(save.save(),false);assert.equal(save.resetLaterChapters(),false);assert.equal(values.get(CAMPAIGN_KEY),'third-broken');assert.equal(values.get(CAMPAIGN_KEY+'.recovery'),'first-broken');
});


test('legacy campaign and invalid accessories normalize without losing progress',()=>{
const {CampaignSave}=load(path.join(scripts,'world/CampaignSave.ts'));
const accessorySave=new CampaignSave({getItem:()=>null,setItem:()=>{}});
for(const value of [undefined,null,-1,4,1.5,'2']){const raw={...accessorySave.engine.data,accessory:value};assert.equal(accessorySave.engine.restore(JSON.stringify(raw)),true);assert.equal(accessorySave.engine.data.accessory,0);}
for(const accessory of [0,1,2,3]){assert.equal(accessorySave.engine.restore(JSON.stringify({...accessorySave.engine.data,accessory})),true);assert.equal(accessorySave.engine.data.accessory,accessory);}
});
test('avatar gestures expire, cancel on movement and never advance on invalid time',()=>{
 const {AvatarGestureState}=load(path.join(scripts,'player/PlayerController.ts')),g=new AvatarGestureState();
 assert.equal(g.kind,null);g.start('happy');g.step(.1,false);assert.ok(g.jump>0&&g.jump<=12);
 const elapsed=g.elapsed;g.step(NaN,false);g.step(-1,false);assert.equal(g.elapsed,elapsed);
 g.step(10,false);assert.equal(g.elapsed,elapsed+.1);
 for(let i=0;i<20;i++)g.step(.1,false);assert.equal(g.kind,null);assert.equal(g.jump,0);
 g.start('hello');g.step(.1,true);assert.equal(g.kind,null);
 g.start('happy');assert.equal(g.elapsed,0);
});
test('speech reading respects mute, unavailable engines and asynchronously loaded Vietnamese voices',()=>{
 const {SpeechReader}=load(path.join(scripts,'ui/SpeechReader.ts'));let calls=0,voices=[],spoken=[];
 const port={voices:()=>voices,cancel:()=>{},speak:(text,voice)=>spoken.push({text,voice})};
 const reader=new SpeechReader(()=>{calls++;return port;});
 assert.ok(reader.read('Test',false));assert.equal(calls,0);assert.equal(reader.read(' ',true).length>0,true);
 assert.ok(new SpeechReader(()=>null).read('Test',true));
 assert.ok(reader.read('Test',true));assert.equal(spoken.length,0);
 voices=[{lang:'en-US'},{lang:'vi-VN',localService:false},{lang:'vi_VN',localService:true}];
 assert.equal(reader.read('Question only',true),'');assert.equal(spoken[0].text,'Question only');assert.equal(spoken[0].voice,voices[2]);assert.equal(reader.reading,true);
 reader.stop();assert.equal(reader.reading,false);
});
test('speech replacement and cancellation ignore stale callbacks and recover from engine errors',()=>{
 const {SpeechReader}=load(path.join(scripts,'ui/SpeechReader.ts'));const callbacks=[],messages=[];let fail=false,cancelled=0;
 const reader=new SpeechReader(()=>({voices:()=>[{lang:'vi-VN'}],cancel:()=>{cancelled++;},speak:(text,voice,done,error)=>{if(fail)throw Error('Unavailable');callbacks.push({done,error});}}));
 reader.read('First',true,m=>messages.push(m));reader.read('Second',true,m=>messages.push(m));
 callbacks[0].error();assert.equal(reader.reading,true);assert.deepEqual(messages,[]);
 callbacks[1].done();assert.equal(reader.reading,false);assert.deepEqual(messages,['']);
 reader.read('Third',true,m=>messages.push(m));reader.stop();callbacks[2].error();assert.deepEqual(messages,['']);assert.ok(cancelled>=3);
 fail=true;assert.ok(reader.read('Fourth',true));assert.equal(reader.reading,false);
});
test('lesson packs validate atomically, reject draft release and keep original question IDs',()=>{
 const {lessonCatalog,applyLessonPack,validQuestion}=load(path.join(scripts,'world/LessonCatalog.ts')),rows=lessonCatalog(),row=rows.find(r=>r.skill==='math'&&r.age==='3-5');
 assert.equal(rows.length,90);assert.ok(rows.every(r=>validQuestion(r.question)));
 const edited={...row,question:{...row.question,prompt:'Test prompt',choices:['a','b','c'],answer:1}};
 assert.equal(applyLessonPack({version:1,lessons:[edited]},true),false);
 assert.equal(applyLessonPack({version:1,lessons:[edited,{...row,question:{...row.question,answer:99}}]}),false);assert.notEqual(lessonQuestions('math','3-5')[0].prompt,'Test prompt');
 assert.equal(applyLessonPack({version:1,lessons:[edited]}),true);assert.equal(lessonQuestions('math','3-5')[0].prompt,'Test prompt');
 assert.equal(applyLessonPack({version:1,lessons:[{...edited,reviewRecord:{status:'approved',note:'Fixture approved for validation test'}}]},true),true);
 assert.equal(applyLessonPack({version:1,lessons:[]}),true);
});
test('hair and practice save migration reject forged types while retaining unique game badges',()=>{
 for(const hair of [undefined,null,-1,2,'1',true]){const e=new CampaignEngine();assert.equal(e.restore(JSON.stringify({...e.data,hair,practice:['fake','mg.market','mg.market']})),true);assert.equal(e.data.hair,0);assert.deepEqual(e.data.practice,['mg.market']);}
 const e=new CampaignEngine();e.restore(JSON.stringify({...e.data,hair:1}));assert.equal(e.data.hair,1);
});
test('NPC packs keep graph IDs, validate reachable spawns and roll back the entire invalid pack',()=>{
 const {npcCatalog,applyNpcPack}=load(path.join(scripts,'world/NpcCatalog.ts')),before=JSON.stringify(m.storyNpcs),row=npcCatalog().find(n=>n.id==='co-tam');
 for(const npcs of [[{...row,x:25,y:10}],[{...row,x:20,y:20}],[{...row,x:6,y:23}],[row,row],[{...row,x:1.5}],[{...row,id:'unknown'}]]){assert.equal(applyNpcPack({version:1,npcs}),false);assert.equal(JSON.stringify(m.storyNpcs),before);}
 const edited={...row,name:'Fixture NPC',x:11,y:8,chapter:99};assert.equal(applyNpcPack({version:1,npcs:[edited]},true),true);assert.equal(JSON.stringify(m.storyNpcs),before);
 assert.equal(applyNpcPack({version:1,npcs:[edited]}),true);assert.equal(m.storyNpcs.find(n=>n.id===row.id).chapter,5);assert.equal(m.storyNpcs.find(n=>n.id===row.id).name,'Fixture NPC');
 assert.equal(applyNpcPack({version:1,npcs:[]}),true);assert.equal(JSON.stringify(m.storyNpcs),before);
});
test('young-player rhythm windows are wider and old valid action traces remain replayable',()=>{
 const child=new MiniGameRules('mg.tug-of-war','3-5'),older=new MiniGameRules('mg.tug-of-war','9-11');child.clock=older.clock=.17;assert.equal(child.rhythmOpen,true);assert.equal(older.rhythmOpen,false);
 for(const age of ['3-5','6-8','9-11']){const game=new MiniGameRules('mg.tug-of-war',age);for(let i=0;i<6;i++){game.clock=i+.1;assert.equal(game.action('beat',0),true);}assert.equal(MiniGameRules.restore(game.save()).ended,true);}
});
console.log(`${checks} test groups passed`);
