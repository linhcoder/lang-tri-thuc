import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { Client } from '@colyseus/sdk';

// Exercise emitted JS in its own process: source-only tests miss split ESM/CJS
// matchmaker singletons between the server and WebSocket transport.
test('compiled production server accepts a reserved seat', { timeout: 15000 }, async () => {
    const child=spawn(process.execPath,['dist/game-server/src/main.js'],{
        cwd:process.cwd(),env:{...process.env,PORT:'26572'},windowsHide:true,
        stdio:['ignore','pipe','pipe'],
    });
    let room:any;
    try {
        await new Promise<void>((resolve,reject)=>{
            const timer=setTimeout(()=>reject(new Error('Production server startup timeout')),8000);
            child.stdout.on('data',data=>{if(String(data).includes(':26572')){clearTimeout(timer);resolve();}});
            child.once('error',error=>{clearTimeout(timer);reject(error);});
            child.once('exit',code=>{clearTimeout(timer);reject(new Error(`Server exited: ${code}`));});
        });
        room=await new Client('http://127.0.0.1:26572').joinOrCreate('village');
        assert.ok(room.sessionId);
    } finally {
        if(room)await room.leave();
        child.kill();
    }
});
