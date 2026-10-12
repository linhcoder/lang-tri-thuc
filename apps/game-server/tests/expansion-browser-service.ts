import {createApi} from '../../backend/src/main';
import {SqliteRepository} from '../../backend/src/Store';
import {startServer} from '../src/main';
const secret='expansion-browser-fixture-secret-long-enough';
const api=await createApi({store:new SqliteRepository(),roomSecret:secret});await api.listen({host:'127.0.0.1',port:26642});
const rooms=await startServer(26641,'127.0.0.1',{roomSecret:secret,apiUrl:'http://127.0.0.1:26642'});console.log('EXPANSION_BROWSER_READY');
for(const signal of ['SIGINT','SIGTERM'] as const)process.on(signal,()=>{void rooms.gracefullyShutdown(false).then(()=>api.close());});
