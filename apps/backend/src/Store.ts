import { DatabaseSync } from 'node:sqlite';
import { Pool } from 'pg';
import { dirname } from 'node:path';
import { mkdirSync } from 'node:fs';
export interface ParentRecord {id:string;alias:string;passwordHash:string;role:'parent'|'admin'}
export interface ProfileRecord {id:string;parentId:string;label:string;age:'3-5'|'6-8'|'9-11';blocked:string[]}
export interface BackendData {
    parents:Record<string,ParentRecord>;profiles:Record<string,ProfileRecord>;
    sessions:Record<string,{parentId:string;expires:number}>;
    progress:Record<string,{revision:number;data:unknown;receipts:string[];trusted?:{chapterOne:unknown;campaign:unknown}}>;
    rooms:Record<string,{ownerId:string;allowedParents:string[];expires:number;locked:boolean}>;
    invitations:Record<string,{roomCode:string;expires:number;remaining:number}>;
    reports:Array<{id:string;reporter:string;target:string;reason:string;created:number;status:'open'|'resolved'}>;
    review:Record<string,{status:'draft'|'reviewed'|'approved';reviewer:string;note:string;updated:number}>;
    content:Record<string,{title:string;intro:string;ending:string;questTitles:Record<string,string>}>;
    audit:Array<{actor:string;action:string;entity:string;created:number}>;
    results:string[];
}
const fresh=():BackendData=>({parents:{},profiles:{},sessions:{},progress:{},rooms:{},invitations:{},reports:[],review:{},audit:[],results:[],content:{}});
export interface Repository {transaction<T>(operation:(data:BackendData)=>T|Promise<T>):Promise<T>;close():Promise<void>}
export class SqliteRepository implements Repository {
    private db:DatabaseSync;private tail:Promise<unknown>=Promise.resolve();
    constructor(file=':memory:'){if(file!==':memory:')mkdirSync(dirname(file),{recursive:true});this.db=new DatabaseSync(file);this.db.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS game_state (id INTEGER PRIMARY KEY CHECK(id=1), value TEXT NOT NULL)');this.db.prepare('INSERT OR IGNORE INTO game_state VALUES (1, ?)').run(JSON.stringify(fresh()));}
    transaction<T>(operation:(data:BackendData)=>T|Promise<T>):Promise<T>{const task=this.tail.then(async()=>{this.db.exec('BEGIN IMMEDIATE');try{const row=this.db.prepare('SELECT value FROM game_state WHERE id=1').get() as {value:string};const data=Object.assign(fresh(),JSON.parse(row.value)) as BackendData,result=await operation(data);this.db.prepare('UPDATE game_state SET value=? WHERE id=1').run(JSON.stringify(data));this.db.exec('COMMIT');return result;}catch(e){this.db.exec('ROLLBACK');throw e;}});this.tail=task.catch(()=>{});return task;}
    async close():Promise<void>{await this.tail;this.db.close();}
}
export class PostgresRepository implements Repository {
    private pool:Pool;private ready:Promise<unknown>;
    constructor(url:string){this.pool=new Pool({connectionString:url,max:8});this.ready=this.pool.query('CREATE TABLE IF NOT EXISTS lang_tri_thuc_state (id INTEGER PRIMARY KEY CHECK(id=1), value JSONB NOT NULL)').then(()=>this.pool.query('INSERT INTO lang_tri_thuc_state VALUES (1,$1::jsonb) ON CONFLICT DO NOTHING',[JSON.stringify(fresh())]));}
    async transaction<T>(operation:(data:BackendData)=>T|Promise<T>):Promise<T>{await this.ready;const client=await this.pool.connect();try{await client.query('BEGIN');const row=await client.query('SELECT value FROM lang_tri_thuc_state WHERE id=1 FOR UPDATE');const data=Object.assign(fresh(),row.rows[0].value) as BackendData,result=await operation(data);await client.query('UPDATE lang_tri_thuc_state SET value=$1::jsonb WHERE id=1',[JSON.stringify(data)]);await client.query('COMMIT');return result;}catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}}
    async close():Promise<void>{await this.pool.end();}
}
