// Isolated signed-room service for the real Cocos browser patrol test.
import {createApi} from '../../backend/src/main';
import {SqliteRepository} from '../../backend/src/Store';
import {startServer} from '../src/main';
const secret='npc-browser-test-secret-at-least-32-characters';
const api=await createApi({store:new SqliteRepository(),roomSecret:secret});
await api.listen({port:26602,host:'127.0.0.1'});
const server=await startServer(26601,'127.0.0.1',{roomSecret:secret,apiUrl:'http://127.0.0.1:26602'});
console.log('NPC browser test service ready');
for(const signal of ['SIGINT','SIGTERM'] as const)process.on(signal,()=>{void server.gracefullyShutdown(false).then(()=>api.close());});
