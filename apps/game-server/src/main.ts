import npcPack from '../../game-client/assets/resources/npc-pack.json';
import {applyNpcPack} from '../../game-client/assets/scripts/world/NpcCatalog';
if(!applyNpcPack(npcPack))throw Error('Invalid shipped NPC pack');
import lessonPack from '../../game-client/assets/resources/lesson-pack.json';
import {applyLessonPack} from '../../game-client/assets/scripts/world/LessonCatalog';
if(!applyLessonPack(lessonPack))throw Error('Invalid shipped lesson pack');
import { Server } from '@colyseus/core';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { VillageRoom } from './VillageRoom.js';
import { pathToFileURL } from 'node:url';
import {PrivateFriendRoom,MiniGameRoom} from './PrivateFriendRoom.js';

export async function startServer(port=Number(process.env.PORT||2567),host=process.env.HOST||'127.0.0.1',options:{roomSecret?:string;apiUrl?:string}={}):Promise<Server> {
    const server=new Server({transport:new WebSocketTransport({maxPayload:8192,pingInterval:5000,pingMaxRetries:3}),greet:false});
    if(host==='127.0.0.1'||process.env.ALLOW_DEV_ROOMS==='1')server.define('village',VillageRoom);
    const secret=options.roomSecret||process.env.ROOM_SECRET;if(secret){if(secret.length<32)throw Error('ROOM_SECRET too short');const config={secret,apiUrl:options.apiUrl||process.env.API_URL||'http://127.0.0.1:3000'};server.define('private-friend',PrivateFriendRoom,config).filterBy(['roomCode']);server.define('mini-game',MiniGameRoom,config).filterBy(['roomCode']);}
    await server.listen(port,host);return server;
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href)startServer().then(()=>console.log(`Làng Tri Thức multiplayer: ${process.env.HOST||'127.0.0.1'}:${process.env.PORT||2567}`)).catch(error=>{console.error(error);process.exitCode=1;});
