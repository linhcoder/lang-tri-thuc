import { Server } from '@colyseus/core';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { VillageRoom } from './VillageRoom.js';
import { pathToFileURL } from 'node:url';

export async function startServer(port=Number(process.env.PORT||2567),host=process.env.HOST||'127.0.0.1'):Promise<Server> {
    const server=new Server({transport:new WebSocketTransport({maxPayload:2048,pingInterval:5000,pingMaxRetries:3}),greet:false});
    server.define('village',VillageRoom);
    await server.listen(port,host);return server;
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href)startServer().then(()=>console.log(`Làng Tri Thức multiplayer: ${process.env.HOST||'127.0.0.1'}:${process.env.PORT||2567}`)).catch(error=>{console.error(error);process.exitCode=1;});
