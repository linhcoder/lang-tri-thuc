const fs=require('node:fs'),path=require('node:path'),esbuild=require('esbuild');
const root=path.resolve(__dirname,'..'),input=process.argv[2],draft=process.argv.includes('--draft');
if(!input)throw Error('Usage: node tools/import-content.cjs /path/to/export.json [--draft] [--check]');
function shared(name){const module={exports:{}},code=esbuild.buildSync({entryPoints:[path.join(root,'apps/game-client/assets/scripts/world',name+'.ts')],bundle:true,write:false,platform:'node',format:'cjs'}).outputFiles[0].text;new Function('module','exports','require',code)(module,module.exports,require);return module.exports;}
const pack=JSON.parse(fs.readFileSync(input,'utf8'));
if(pack.version!==1||!Array.isArray(pack.chapters)||pack.chapters.length!==8||pack.chapters.some(c=>!c||!Array.isArray(c.quests)))throw Error('Expected eight chapter records');
const chapters={version:1,chapters:pack.chapters.map(c=>({id:c.id,title:c.title,intro:c.intro,ending:c.ending,questTitles:Object.fromEntries(c.quests.map(q=>[q.id,q.title]))}))};
if(!shared('ContentPack').applyChapterText(chapters))throw Error('Invalid chapter pack');
const lessons={version:1,lessons:pack.lessons??[]},npcs={version:1,npcs:pack.npcs??[]},assets=pack.assets??[];
if(!shared('LessonCatalog').applyLessonPack(lessons,!draft))throw Error('Invalid or unapproved lesson pack');
if(!shared('NpcCatalog').applyNpcPack(npcs,true))throw Error('Invalid NPC pack');
const known=new Map(shared('AssetCatalog').assetCatalog().map(row=>[row.id,row]));
if(!Array.isArray(assets)||assets.length>known.size||new Set(assets.map(a=>a?.id)).size!==assets.length||assets.some(a=>!a||!known.has(a.id)||a.path!==known.get(a.id).path||!['title','source','license'].every(key=>typeof a[key]==='string'&&a[key].trim()&&a[key].length<=500)))throw Error('Invalid asset manifest');
if(!draft&&(lessons.lessons.length!==90||npcs.npcs.length!==6||assets.length!==24||[...pack.chapters,...npcs.npcs,...assets].some(row=>row.reviewRecord?.status!=='approved')))throw Error('Complete reviewed chapter/lesson/NPC/asset catalogs required for release import');
const summary={chapters:8,lessons:lessons.lessons.length,npcs:npcs.npcs.length,assets:assets.length,draft};
if(process.argv.includes('--check')){console.log(JSON.stringify(summary));process.exit(0);}
const outputs={'chapter-pack.json':chapters,'lesson-pack.json':lessons,'npc-pack.json':npcs,'asset-manifest.json':{version:1,assets}},resource=path.join(root,'apps/game-client/assets/resources'),staging=path.join(root,'.cache','content-import-'+Date.now());
fs.mkdirSync(staging,{recursive:true});const originals=new Map();
for(const [name,data] of Object.entries(outputs)){const target=path.join(resource,name);originals.set(target,fs.existsSync(target)?fs.readFileSync(target):null);fs.writeFileSync(path.join(staging,name),JSON.stringify(data,null,2)+'\n');}
try{for(const name of Object.keys(outputs))fs.renameSync(path.join(staging,name),path.join(resource,name));}
catch(error){for(const [target,raw] of originals){if(raw!==null)fs.writeFileSync(target,raw);else if(fs.existsSync(target))fs.unlinkSync(target);}throw error;}
console.log(JSON.stringify(summary));console.log('Rebuild client AND server from the same packs. Editorial status does not certify cultural accuracy or device QA.');
