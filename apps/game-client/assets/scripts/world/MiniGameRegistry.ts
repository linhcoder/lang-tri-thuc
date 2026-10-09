import { MiniGameId,miniGameIds,AgeBand } from './CampaignContent';
import { MiniGameRules,gameNames } from './MiniGameRules';
export interface MiniGameDefinition {id:MiniGameId;title:string;ages:AgeBand[];modes:('solo'|'cooperative')[];minPlayers:number;maxPlayers:number;assets:string[];create:(age:AgeBand,seed?:number)=>MiniGameRules}
export const miniGameRegistry:ReadonlyArray<MiniGameDefinition>=miniGameIds.map(id=>({id,title:gameNames[id],ages:['3-5','6-8','9-11'],modes:['solo','cooperative'],minPlayers:1,maxPlayers:4,assets:[],create:(age,seed=17)=>new MiniGameRules(id,age,seed)}));
