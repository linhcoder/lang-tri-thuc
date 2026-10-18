const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
test('dismissing the guide updates the current profile data after an online snapshot replaces it',()=>{
 class Element{constructor(){this.style={};this.children=[];}setAttribute(){}append(...nodes){this.children.push(...nodes);}replaceChildren(){this.children=[];}remove(){}}
 const previous=global.document;global.document={body:new Element(),createElement:()=>new Element()};
 try{const code=ts.transpileModule(fs.readFileSync(path.resolve(__dirname,'../assets/scripts/ui/FirstVisitGuide.ts'),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText,module={exports:{}};new Function('module','exports',code)(module,module.exports);
 const initial={tutorial:[],events:[],room:{},largeControls:false};let current=initial,saves=0;const guide=new module.exports.FirstVisitGuide(()=>current);guide.update(initial,{move:false,talk:false,reward:false,modal:false},()=>saves++,()=>{});
 guide.setModal(true);assert.equal(global.document.body.children[0].hidden,true);guide.setModal(false);assert.equal(global.document.body.children[0].hidden,false);
 const dismiss=global.document.body.children[0].children.find(n=>n.textContent==='Để sau');assert.ok(dismiss);current={...initial,tutorial:['move']};dismiss.onclick();assert.deepEqual(current.tutorial,['move','done']);assert.deepEqual(initial.tutorial,[]);assert.equal(saves,1);
 }finally{global.document=previous;}
});
