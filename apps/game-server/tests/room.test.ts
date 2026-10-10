import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Client } from '@colyseus/sdk';
import { startServer } from '../src/main';
import { validMove, VillageState } from '../src/VillageRoom';
import { toWorld,VillageMap } from '../../game-client/assets/scripts/world/VillageModel';
const map=new VillageMap(),spawn=toWorld({x:20,y:20});
test('production loopback can explicitly disable the development village room',async()=>{
    const previous=process.env.ALLOW_DEV_ROOMS;process.env.ALLOW_DEV_ROOMS='0';
    const server=await startServer(26579,'127.0.0.1',{roomSecret:'production-fixture-secret-at-least-32-characters'});
    try{await assert.rejects(()=>new Client('http://127.0.0.1:26579').joinOrCreate('village'));}
    finally{await server.gracefullyShutdown(false);if(previous===undefined)delete process.env.ALLOW_DEV_ROOMS;else process.env.ALLOW_DEV_ROOMS=previous;}
});
test('movement rejects malformed packets, teleport and paths across pond',()=>{
    assert.equal(validMove(map,spawn,{x:1,y:-640,direction:0,moving:true,seq:1},10),true);
    for(const packet of [null,{...spawn,x:NaN},{...spawn,x:999,direction:0,moving:true,seq:1},{...spawn,direction:99,moving:true,seq:1}])assert.equal(validMove(map,spawn,packet,20),false);
    assert.equal(validMove(map,toWorld({x:24,y:10}),{...toWorld({x:33,y:10}),direction:0,moving:true,seq:1},500),false);
    for(const avatar of [-1,4,1.5,null,'2',NaN])assert.equal(validMove(map,spawn,{...spawn,direction:0,moving:false,seq:1,avatar},20),false);
    for(const hair of [-1,2,1.5,null,'1',true,NaN])assert.equal(validMove(map,spawn,{...spawn,direction:0,moving:false,seq:1,hair},20),false);
    for(const accessory of [-1,4,1.5,null,'2',NaN])assert.equal(validMove(map,spawn,{...spawn,direction:0,moving:false,seq:1,accessory},20),false);
    for(const avatar of [0,1,2,3])assert.equal(validMove(map,spawn,{...spawn,direction:0,moving:false,seq:1,avatar},20),true);
});
test('two clients join, synchronize validated movement and clean up on leave',async()=>{
    const port=26571,server=await startServer(port);let a:any,b:any;
    const until=async(predicate:()=>boolean)=>{for(let i=0;i<100;i++){if(predicate())return;await new Promise(r=>setTimeout(r,30));}throw new Error('Room synchronization timeout');};
    try{
        const client=new Client(`http://127.0.0.1:${port}`);a=await client.joinOrCreate<VillageState>('village');b=await client.joinOrCreate<VillageState>('village');
        a.onMessage('correction',()=>{});b.onMessage('correction',()=>{});
        await until(()=>a.state.players.size===2&&b.state.players.size===2);
        a.send('move',{x:10,y:-640,direction:0,moving:true,seq:1,avatar:2,accessory:3,hair:1});
        await until(()=>b.state.players.get(a.sessionId)?.x===10&&b.state.players.get(a.sessionId)?.avatar===2&&b.state.players.get(a.sessionId)?.accessory===3&&b.state.players.get(a.sessionId)?.hair===1);
        a.send('move',{x:10,y:-640,direction:0,moving:false,seq:2,avatar:99});await new Promise(r=>setTimeout(r,100));assert.equal(b.state.players.get(a.sessionId)?.avatar,2);
        a.send('move',{x:10,y:-640,direction:0,moving:false,seq:3,avatar:3});await until(()=>b.state.players.get(a.sessionId)?.avatar===3);
        a.send('move',{x:10,y:-640,direction:1,moving:false,seq:4});await until(()=>b.state.players.get(a.sessionId)?.direction===1);assert.equal(b.state.players.get(a.sessionId)?.avatar,3);assert.equal(b.state.players.get(a.sessionId)?.accessory,3);assert.equal(b.state.players.get(a.sessionId)?.hair,1);
        a.send('move',{x:900,y:-640,direction:0,moving:true,seq:5});await new Promise(r=>setTimeout(r,100));assert.equal(b.state.players.get(a.sessionId)?.x,10);
        await a.leave();await until(()=>b.state.players.size===1);
    }finally{if(b)await b.leave();await server.gracefullyShutdown(false);}
});
