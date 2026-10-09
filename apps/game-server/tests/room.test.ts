import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Client } from '@colyseus/sdk';
import { startServer } from '../src/main';
import { validMove, VillageState } from '../src/VillageRoom';
import { toWorld,VillageMap } from '../../game-client/assets/scripts/world/VillageModel';
const map=new VillageMap(),spawn=toWorld({x:20,y:20});
test('movement rejects malformed packets, teleport and paths across pond',()=>{
    assert.equal(validMove(map,spawn,{x:1,y:-640,direction:0,moving:true,seq:1},10),true);
    for(const packet of [null,{...spawn,x:NaN},{...spawn,x:999,direction:0,moving:true,seq:1},{...spawn,direction:99,moving:true,seq:1}])assert.equal(validMove(map,spawn,packet,20),false);
    assert.equal(validMove(map,toWorld({x:24,y:10}),{...toWorld({x:33,y:10}),direction:0,moving:true,seq:1},500),false);
});
test('two clients join, synchronize validated movement and clean up on leave',async()=>{
    const port=26571,server=await startServer(port);let a:any,b:any;
    const until=async(predicate:()=>boolean)=>{for(let i=0;i<100;i++){if(predicate())return;await new Promise(r=>setTimeout(r,30));}throw new Error('Room synchronization timeout');};
    try{
        const client=new Client(`http://127.0.0.1:${port}`);a=await client.joinOrCreate<VillageState>('village');b=await client.joinOrCreate<VillageState>('village');
        a.onMessage('correction',()=>{});b.onMessage('correction',()=>{});
        await until(()=>a.state.players.size===2&&b.state.players.size===2);
        a.send('move',{x:10,y:-640,direction:0,moving:true,seq:1});
        await until(()=>b.state.players.get(a.sessionId)?.x===10);
        a.send('move',{x:900,y:-640,direction:0,moving:true,seq:2});await new Promise(r=>setTimeout(r,100));assert.equal(b.state.players.get(a.sessionId)?.x,10);
        await a.leave();await until(()=>b.state.players.size===1);
    }finally{if(b)await b.leave();await server.gracefullyShutdown(false);}
});
