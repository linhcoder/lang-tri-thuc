import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Client} from '@colyseus/sdk';
import {createApi} from '../../backend/src/main';
import {SqliteRepository} from '../../backend/src/Store';
import {startServer} from '../src/main';
import {chapters} from '../../game-client/assets/scripts/world/CampaignContent';
import {CampaignEngine} from '../../game-client/assets/scripts/world/CampaignEngine';
import {ChapterOneProgress} from '../../game-client/assets/scripts/world/ChapterOneProgress';
import {MiniGameRules,mazePath} from '../../game-client/assets/scripts/world/MiniGameRules';
const wait=(ms:number)=>new Promise(r=>setTimeout(r,ms));
async function until(fn:()=>boolean|Promise<boolean>){for(let i=0;i<400;i++){if(await fn())return;await wait(25);}throw Error('Cooperative synchronization timeout');}
test('four authenticated players complete all story games at three ages including mid-game reconnect',{timeout:240000},async()=>{
 const secret='cooperative-integration-secret-32-characters',store=new SqliteRepository(),api=await createApi({store,roomSecret:secret});await api.listen({port:26583,host:'127.0.0.1'});const server=await startServer(26584,'127.0.0.1',{roomSecret:secret,apiUrl:'http://127.0.0.1:26583'}),client=new Client('http://127.0.0.1:26584');let rooms:any[]=[];
 const addresses=new Map<string,string>();
 const req=async(url:string,body:any,token?:string)=>{const response=await api.inject({method:'POST',url,payload:body,remoteAddress:token?addresses.get(token):'10.4.0.250',headers:token?{authorization:'Bearer '+token}:{}});assert.ok(response.statusCode<400,response.body);return response.json();};
 try{
  const players=[];for(const alias of ['coop-owner','coop-friend-1','coop-friend-2','coop-friend-3']){await req('/parents',{alias,password:'IntegrationPassword123!'});const token=(await req('/sessions',{alias,password:'IntegrationPassword123!'})).token;addresses.set(token,'10.4.0.'+(players.length+1));const profile=await req('/profiles',{age:'3-5'},token);players.push({token,id:profile.id});}
  const invitation=await req('/invites',{profileId:players[0].id},players[0].token);for(const p of players.slice(1))await req('/invites',{profileId:p.id,invitation:invitation.friendInvitation},p.token);
  const completed:string[]=[];
  for(const age of ['3-5','6-8','9-11'] as const){const seen=new Set<string>();
  for(const [chapterIndex,chapter] of chapters.entries())for(const quest of chapter.quests){
   if(!quest.game||seen.has(quest.game))continue;seen.add(quest.game);
   const first=new ChapterOneProgress();Object.assign(first.data,{introSeen:true,greeted:true,accepted:true,planted:[0,1,2,3,4],countRound:3,rewardReceipts:['reward.star.ch01']});const progress=new CampaignEngine();progress.syncChapterOne(first.data);
   for(let i=1;i<chapterIndex;i++){progress.introduce(i);for(const q of chapters[i].quests)progress.complete(q.id);progress.claim(i);}progress.introduce(chapterIndex);for(const q of chapter.quests){if(q.id===quest.id)break;progress.complete(q.id);}
   // The fixture unlocks only prerequisites; the actual game/reward runs through signed sockets.
   await store.transaction(d=>{for(const p of players){d.profiles[p.id].age=age;d.progress[p.id]={revision:0,data:{},receipts:[],trusted:{chapterOne:first.data,campaign:{...progress.data,age}}};}});
   const connect=async(p:typeof players[number])=>{const invite=await req('/invites',{profileId:p.id,roomCode:invitation.roomCode},p.token),room=await client.joinOrCreate('private-friend',{roomCode:invite.roomCode,ticket:invite.ticket});for(const type of ['progress-state','storage-warning','correction','content-version'])room.onMessage(type,()=>{});room.send('ready');return room;};
   for(const p of players)rooms.push(await connect(p));
   const [a,b]=rooms;await until(()=>a.state.players.size===4);a.send('start-game',{questId:quest.id});await until(()=>a.state.gameQuest===quest.id&&b.state.gameQuest===quest.id&&!!a.state.gameJson&&a.state.gameJson===b.state.gameJson);assert.equal(a.state.gameJson,b.state.gameJson);
   const game=()=>MiniGameRules.restore(JSON.parse(a.state.gameJson));assert.equal(game().id,quest.game);let turn=0;
   const action=async(type:string,index:number)=>{const before=game().save().actions.length;rooms[turn++%4].send('game-action',{type,index});await until(()=>game().save().actions.length>before);if(before===0){await until(()=>store.transaction(d=>!!(d.progress[players[3].id].trusted?.campaign as any).resume[quest.id]));await rooms[3].leave();await until(()=>a.state.players.size===3);rooms[3]=await connect(players[3]);rooms[3].send('start-game',{questId:quest.id});await until(()=>a.state.players.size===4);await wait(100);}};
   switch(quest.game){
    case 'mg.star-lantern':for(let i=0;i<5;i++){await action('part',i);await action('place',i);}break;
    case 'mg.tug-of-war':case 'mg.bamboo-dance':for(let i=0;i<6;i++){await until(()=>{const g=game();return g.rhythmOpen&&Math.floor(g.clock/(g.id==='mg.tug-of-war'?1:1.5))!==g.data.lastBeat;});await action('beat',0);}break;
    case 'mg.market':for(let i=0;i<3;i++)for(let j=0;j<game().data.wants[i];j++)await action('add',i);await action('pay',2);break;
    case 'mg.secret-letters':for(const letter of game().data.word)await action('letter',game().data.grid.indexOf(letter));break;
    case 'mg.dong-ho':for(const piece of game().data.tray){await action('part',piece);await action('place',piece);}break;
    case 'mg.rice-count':for(let i=0;i<5;i++)await action('plant',i);for(let i=0;i<5;i++)await action('water',i);await action('answer',5);break;
    case 'mg.fishing':for(let i=0;i<3;i++){await until(()=>Math.abs(game().fishX(i))<50);await action('fish',i);await action('color',i);}break;
    case 'mg.animal-care':for(const step of [1,0,2])await action('care',step);break;
    case 'mg.village-maze':for(const next of mazePath(0))await action('move',[-5,1,5,-1].indexOf(next-game().data.cursor));break;
    case 'mg.banh-chung':for(let i=0;i<6;i++)await action('layer',i);break;
    default:throw Error('Missing cooperative solver '+quest.game);
   }
   assert.ok(game().ended);await until(()=>store.transaction(d=>players.every(p=>d.progress[p.id].receipts.length===1&&(d.progress[p.id].trusted?.campaign as any).completed.includes(quest.id))));completed.push(age+':'+quest.game);
   for(const room of rooms)await room.leave();rooms=[];await wait(150);
  }
  }
  assert.equal(completed.length,33);console.log('Four-player cooperative games with reconnect:',completed.join(', '));
 }finally{for(const room of rooms)await room.leave();await server.gracefullyShutdown(false);await api.close();}
});
