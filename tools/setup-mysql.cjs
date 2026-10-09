const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {createConnection}=require('mysql2/promise');
const root=path.resolve(__dirname,'..'),configPath=path.join(root,'.env.local');
(async()=>{
    const config=fs.existsSync(configPath)?JSON.parse(fs.readFileSync(configPath,'utf8')):{};
    const admin=await createConnection({host:process.env.MYSQL_HOST||'127.0.0.1',port:Number(process.env.MYSQL_PORT||3306),user:process.env.MYSQL_ADMIN_USER||'root',password:process.env.MYSQL_ADMIN_PASSWORD||'',connectTimeout:5000});
    try{
        for(const database of ['lang_tri_thuc','lang_tri_thuc_test'])await admin.query('CREATE DATABASE IF NOT EXISTS `'+database+'` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
        if(!config.DATABASE_URL){
            const password=crypto.randomBytes(32).toString('base64url');
            const [existing]=await admin.execute('SELECT User FROM mysql.user WHERE User=? AND Host=?',['lang_tri_thuc_app','127.0.0.1']);
            if(existing.length)throw Error('Project MySQL user already exists. Set DATABASE_URL in .env.local to its existing credentials; setup will not reset its password.');
            await admin.query('CREATE USER ?@? IDENTIFIED BY ?',['lang_tri_thuc_app','127.0.0.1',password]);
            config.DATABASE_URL='mysql://lang_tri_thuc_app:'+password+'@127.0.0.1:'+Number(process.env.MYSQL_PORT||3306)+'/lang_tri_thuc';
            config.ROOM_SECRET??=crypto.randomBytes(48).toString('base64url');config.ADMIN_BOOTSTRAP_PASSWORD??=crypto.randomBytes(24).toString('base64url');
            fs.writeFileSync(configPath,JSON.stringify(config,null,2)+'\n',{mode:0o600});
        }
        const url=new URL(config.DATABASE_URL);
        if(url.protocol!=='mysql:'||url.hostname!=='127.0.0.1'||url.pathname!=='/lang_tri_thuc')throw Error('Setup expects the local lang_tri_thuc database. Custom database URLs should be provisioned manually.');
        const user=decodeURIComponent(url.username);
        for(const database of ['lang_tri_thuc','lang_tri_thuc_test'])await admin.query('GRANT SELECT, INSERT, UPDATE, CREATE ON `'+database+'`.* TO ?@?',[user,'127.0.0.1']);
        config.MYSQL_TEST_URL=new URL('lang_tri_thuc_test',config.DATABASE_URL).href;
        fs.writeFileSync(configPath,JSON.stringify(config,null,2)+'\n',{mode:0o600});
    }finally{await admin.end();}
    const {MySqlRepository}=await import(require('node:url').pathToFileURL(path.join(root,'apps/backend/dist/Store.js')).href);
    const target=new MySqlRepository(config.DATABASE_URL);
    try{
        if(process.argv.includes('--migrate-sqlite')){
            const source=path.join(root,'apps/backend/.data/game.sqlite');
            if(fs.existsSync(source)){
                const {DatabaseSync}=require('node:sqlite'),db=new DatabaseSync(source,{readOnly:true});let snapshot;
                try{snapshot=JSON.parse(db.prepare('SELECT value FROM game_state WHERE id=1').get().value);}finally{db.close();}
                await target.transaction(data=>{
                    if(Object.values(data).some(value=>Array.isArray(value)?value.length>0:Object.keys(value).length>0))throw Error('MySQL already contains application data; migration refused to overwrite it.');
                    Object.assign(data,snapshot);
                });
                const equal=await target.transaction(data=>Object.entries(snapshot).every(([key,value])=>require('node:util').isDeepStrictEqual(data[key],value)));
                if(!equal)throw Error('Migration read-back mismatch');
                console.log('SQLite migrated and verified. Original SQLite file preserved.');
            }
        }
        await target.transaction(()=>{});console.log('Local MySQL ready: lang_tri_thuc (app), lang_tri_thuc_test (isolated tests). Credentials saved only in .env.local.');
    }finally{await target.close();}
})().catch(error=>{console.error(error.code||error.message);process.exitCode=1;});
