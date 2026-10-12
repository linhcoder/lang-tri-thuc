const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const file=path.join(__dirname,'../assets/scripts/world/NpcGait.ts'),moduleObject={exports:{}};
const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
vm.runInThisContext(`(function(module,exports){${code}\n})`)(moduleObject,moduleObject.exports);
const {NpcGait}=moduleObject.exports;
function walk(fps){const gait=new NpcGait(.13);gait.update(0,0,0,false);for(let i=1;i<=fps*2;i++)gait.update(1/fps,18*i/fps,0,true);return gait;}
const slow=walk(30),fast=walk(120);
assert.ok(Math.abs(slow.phase-fast.phase)<1e-10,'stride follows distance at different frame rates');
assert.equal(slow.stepFrame,fast.stepFrame);
const phase=slow.phase;for(let i=0;i<90;i++)slow.update(1/30,36,0,false);
assert.equal(slow.phase,phase,'stopping cannot advance the feet');
assert.ok(slow.weight<1e-10&&Math.abs(slow.offsetX)<1e-10&&Math.abs(slow.angle)<1e-10,'idle settles smoothly');
const beforeTeleport=fast.phase;fast.update(1/60,600,600,true);
assert.equal(fast.offsetX,0);assert.equal(fast.offsetY,0);assert.equal(fast.phase,beforeTeleport,'teleports do not advance stride');
assert.ok(Number.isFinite(fast.bob));fast.update(NaN,NaN,0,true);assert.ok(Number.isFinite(fast.bob));
const jitter=new NpcGait();jitter.update(0,0,0,false);
for(let i=0;i<200;i++){jitter.update(1/60,(i%2)*4,0,true);assert.ok(Math.abs(jitter.offsetX)<=6&&Math.abs(jitter.angle)<=2.2&&jitter.bob<=2.2);}
const sparse=new NpcGait();sparse.update(0,0,0,false);sparse.update(1/60,1.8,0,true);
const snapshotPhase=sparse.phase,firstVisual=sparse.visualPhase,firstBob=sparse.bob;
sparse.update(1/60,1.8,0,true);
assert.equal(sparse.phase,snapshotPhase,'no authoritative travel invented between network packets');
assert.ok(sparse.visualPhase>firstVisual&&sparse.visualPhase<snapshotPhase,'visual stride advances smoothly toward recorded travel');
assert.notEqual(sparse.bob,firstBob,'body animation continues between sparse snapshots');
for(let i=0;i<120;i++)sparse.update(1/60,1.8,0,false);
assert.ok(Math.abs(sparse.visualPhase-snapshotPhase)<1e-12,'settling consumes exactly the recorded stride');
console.log('NPC gait: distance cadence, stop settling, teleport reset, bounded network smoothing, sparse snapshot stride passed');
