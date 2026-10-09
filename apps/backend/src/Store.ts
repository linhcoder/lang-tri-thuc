import type {Question} from '../../game-client/assets/scripts/world/EducationEngine';
import { DatabaseSync } from 'node:sqlite';
import { createPool, Pool, RowDataPacket } from 'mysql2/promise';
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
    npcs:Record<string,{id:string;name:string;x:number;y:number}>;assets:Record<string,{title:string;source:string;license:string}>;
    lessons:Record<string,Question>;
    audit:Array<{actor:string;action:string;entity:string;created:number}>;
    results:string[];
}
const fresh=():BackendData=>({parents:{},profiles:{},sessions:{},progress:{},rooms:{},invitations:{},reports:[],review:{},audit:[],results:[],content:{},lessons:{},npcs:{},assets:{}});
export interface Repository {readonly kind?:string;transaction<T>(operation:(data:BackendData)=>T|Promise<T>):Promise<T>;close():Promise<void>}
export class SqliteRepository implements Repository {
    readonly kind='sqlite-local';
    private db:DatabaseSync;private tail:Promise<unknown>=Promise.resolve();
    constructor(file=':memory:'){if(file!==':memory:')mkdirSync(dirname(file),{recursive:true});this.db=new DatabaseSync(file);this.db.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS game_state (id INTEGER PRIMARY KEY CHECK(id=1), value TEXT NOT NULL)');this.db.prepare('INSERT OR IGNORE INTO game_state VALUES (1, ?)').run(JSON.stringify(fresh()));}
    transaction<T>(operation:(data:BackendData)=>T|Promise<T>):Promise<T>{const task=this.tail.then(async()=>{this.db.exec('BEGIN IMMEDIATE');try{const row=this.db.prepare('SELECT value FROM game_state WHERE id=1').get() as {value:string};const data=Object.assign(fresh(),JSON.parse(row.value)) as BackendData,result=await operation(data);this.db.prepare('UPDATE game_state SET value=? WHERE id=1').run(JSON.stringify(data));this.db.exec('COMMIT');return result;}catch(e){this.db.exec('ROLLBACK');throw e;}});this.tail=task.catch(()=>{});return task;}
    async close():Promise<void>{await this.tail;this.db.close();}
}
export class MySqlRepository implements Repository {
    readonly kind = 'mysql';
    private pool: Pool;
    private ready?: Promise<void>;
    private closing?: Promise<void>;
    constructor(url: string) {
        if (new URL(url).protocol !== 'mysql:') throw Error('DATABASE_URL must use mysql://');
        this.pool = createPool({ uri: url, connectionLimit: 8, charset: 'utf8mb4', connectTimeout: 5000 });
    }
    private initialize(): Promise<void> {
        return this.ready ??= (async () => {
            await this.pool.query('CREATE TABLE IF NOT EXISTS lang_tri_thuc_state (id TINYINT PRIMARY KEY, value JSON NOT NULL, CONSTRAINT single_state CHECK (id=1)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');
            await this.pool.execute('INSERT IGNORE INTO lang_tri_thuc_state (id,value) VALUES (1,?)', [JSON.stringify(fresh())]);
        })();
    }
    async transaction<T>(operation: (data: BackendData) => T | Promise<T>): Promise<T> {
        await this.initialize();
        const client = await this.pool.getConnection();
        try {
            await client.beginTransaction();
            const [rows] = await client.query<RowDataPacket[]>('SELECT value FROM lang_tri_thuc_state WHERE id=1 FOR UPDATE');
            if (!rows[0]) throw Error('Database state row missing');
            const raw = rows[0].value;
            const data = Object.assign(fresh(), typeof raw === 'string' ? JSON.parse(raw) : raw) as BackendData;
            const result = await operation(data);
            await client.execute('UPDATE lang_tri_thuc_state SET value=? WHERE id=1', [JSON.stringify(data)]);
            await client.commit();
            return result;
        } catch (error) {
            await client.rollback();
            throw error;
        } finally {
            client.release();
        }
    }
    close(): Promise<void> { return this.closing ??= (async()=>{await this.ready?.catch(() => {});await this.pool.end();})(); }
}
