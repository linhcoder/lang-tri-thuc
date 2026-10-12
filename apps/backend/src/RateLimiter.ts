import Redis from 'ioredis';
export class SharedRateLimiter {
    private redis:Redis;
    constructor(url:string){this.redis=new Redis(url,{maxRetriesPerRequest:2,connectTimeout:5000,commandTimeout:5000});this.redis.on('error',()=>{});}
    async count(ip:string):Promise<number>{
        return Number(await this.redis.eval('local n=redis.call("INCR",KEYS[1]); if n==1 then redis.call("EXPIRE",KEYS[1],60) end; return n',1,'ltt-api:rate:'+ip));
    }
    async close():Promise<void>{try{await this.redis.quit();}catch{this.redis.disconnect();}}
}
