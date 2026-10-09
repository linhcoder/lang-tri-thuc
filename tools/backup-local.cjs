const {DatabaseSync}=require('node:sqlite'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),source=path.resolve(root,process.argv[2]||'apps/backend/.data/game.sqlite'),target=path.resolve(root,process.argv[3]||'artifacts/backups/game-'+new Date().toISOString().replace(/[:.]/g,'-')+'.sqlite');
if(!source.startsWith(root+path.sep)||!target.startsWith(root+path.sep)||source===target)throw Error('Backup paths must be distinct files within the workspace');
if(!fs.existsSync(source)||fs.existsSync(target))throw Error('Source must exist and target must be new');
fs.mkdirSync(path.dirname(target),{recursive:true});const db=new DatabaseSync(source);try{db.prepare('VACUUM INTO ?').run(target);}finally{db.close();}
const copy=new DatabaseSync(target,{readOnly:true});try{if(copy.prepare('PRAGMA integrity_check').get().integrity_check!=='ok')throw Error('Backup integrity check failed');JSON.parse(copy.prepare('SELECT value FROM game_state WHERE id=1').get().value);}finally{copy.close();}
console.log('Verified local backup: '+path.relative(root,target));
