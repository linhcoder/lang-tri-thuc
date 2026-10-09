const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),hash=state=>crypto.createHash('sha256').update(JSON.stringify(state)).digest('hex');
(async()=>{
    if(process.argv[2]==='--verify'){
        const data=JSON.parse(fs.readFileSync(path.resolve(process.argv[3]),'utf8'));
        if(data.format!=='lang-tri-thuc-mysql-v1'||hash(data.state)!==data.sha256)throw Error('Invalid backup/checksum');
        console.log('MySQL backup checksum verified.');return;
    }
    const config=JSON.parse(fs.readFileSync(path.join(root,'.env.local'),'utf8'));
    const connection=await require('mysql2/promise').createConnection(config.DATABASE_URL);
    let state;try{const [rows]=await connection.query('SELECT value FROM lang_tri_thuc_state WHERE id=1');if(!rows[0])throw Error('State row missing');state=typeof rows[0].value==='string'?JSON.parse(rows[0].value):rows[0].value;}finally{await connection.end();}
    const file=path.join(root,'artifacts/backups/mysql-'+new Date().toISOString().replace(/[:.]/g,'-')+'.json');fs.mkdirSync(path.dirname(file),{recursive:true});
    fs.writeFileSync(file,JSON.stringify({format:'lang-tri-thuc-mysql-v1',createdAt:new Date().toISOString(),state,sha256:hash(state)},null,2)+'\n',{flag:'wx',mode:0o600});
    const copy=JSON.parse(fs.readFileSync(file,'utf8'));if(copy.sha256!==hash(copy.state))throw Error('Backup verification failed');
    console.log('Verified MySQL backup: '+path.relative(root,file));
})().catch(error=>{console.error(error.code||error.message);process.exitCode=1;});
