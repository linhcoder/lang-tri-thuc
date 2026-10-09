import { AgeBand, MiniGameId, miniGameIds } from './CampaignContent';
export interface GameAction {type:string;index:number;at:number}
export interface GameSave {version:1;id:MiniGameId;age:AgeBand;seed:number;clock:number;actions:GameAction[]}
export interface GameOption {type:string;index:number;label:string}
export type GameStatus='running'|'paused'|'ended';
export const gameNames:Record<MiniGameId,string>={
    'mg.rice-count':'Trồng Lúa – Học Đếm','mg.o-an-quan':'Ô Ăn Quan','mg.tug-of-war':'Kéo Co','mg.bamboo-dance':'Nhảy Sạp','mg.market':'Đi Chợ Quê','mg.star-lantern':'Làm Đèn Ông Sao','mg.banh-chung':'Gói Bánh Chưng • mô phỏng','mg.dong-ho':'Ghép Tranh Làng Nghề','mg.fishing':'Quan Sát Cá Ao Làng','mg.secret-letters':'Tìm Chữ Bí Mật','mg.animal-care':'Chăm Sóc Động Vật','mg.village-maze':'Mê Cung Đường Làng',
};
export function puzzleScramble(seed:number):{tiles:number[];reverse:number[]}{
    const tiles=Array.from({length:9},(_,i)=>i),reverse:number[]=[];let blank=8,rng=seed>>>0||1,last=-1;
    for(let i=0;i<30;i++){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;const choices=[blank-3,blank+3,blank-1,blank+1].filter(n=>n>=0&&n<9&&Math.abs(n%3-blank%3)+Math.abs(Math.floor(n/3)-Math.floor(blank/3))===1&&n!==last);const next=choices[(rng>>>0)%choices.length];reverse.unshift(blank);[tiles[blank],tiles[next]]=[tiles[next],tiles[blank]];last=blank;blank=next;}
    return {tiles,reverse};
}
const mazeWalls=new Set([2,5,7,9,14,16,17,23]);
export function mazePath(start:number,goal=24):number[]{
    const queue=[start],parent=new Map<number,number>([[start,-1]]);
    for(let i=0;i<queue.length;i++){const p=queue[i];if(p===goal){const result:number[]=[];let n=p;while(n!==start){result.unshift(n);n=parent.get(n)!;}return result;}
        for(const n of [p-5,p+1,p+5,p-1])if(n>=0&&n<25&&!mazeWalls.has(n)&&Math.abs(n%5-p%5)+Math.abs(Math.floor(n/5)-Math.floor(p/5))===1&&!parent.has(n)){parent.set(n,p);queue.push(n);}}
    return [];
}
/** Self-contained deterministic mechanics shared by Cocos and authoritative rooms. */
export class MiniGameRules {
    status:GameStatus='running';clock=0;feedback='';
    // Game-specific values are created internally; serialized input is an action
    // trace, never an arbitrary object with a forged `completed`/score field.
    readonly data:Record<string,any>={};private actions:GameAction[]=[];
    constructor(readonly id:MiniGameId,readonly age:AgeBand='3-5',readonly seed=17){
        if(!(miniGameIds as readonly string[]).includes(id)||!['3-5','6-8','9-11'].includes(age)||!Number.isSafeInteger(seed))throw Error('Invalid minigame');
        switch(id){
            case 'mg.rice-count':this.data.planted=[];this.data.watered=[];break;
            case 'mg.o-an-quan':this.data.board=[5,5,5,5,5,0,5,5,5,5,5,0];this.data.quan=[true,true];this.data.scores=[0,0];this.data.direction=1;this.data.turns=0;break;
            case 'mg.tug-of-war':case 'mg.bamboo-dance':this.data.hits=0;this.data.lastBeat=-1;break;
            case 'mg.market':this.data.cart=[0,0,0];this.data.wants=age==='3-5'?[1,1,1]:age==='6-8'?[2,1,1]:[3,2,1];this.data.prices=age==='3-5'?[1,1,1]:age==='6-8'?[2,3,1]:[4,5,2];break;
            case 'mg.star-lantern':this.data.placed=[];this.data.selected=-1;break;
            case 'mg.banh-chung':this.data.step=0;break;
            case 'mg.dong-ho':this.data.tiles=puzzleScramble(seed).tiles;break;
            case 'mg.fishing':this.data.observed=[];this.data.caught=-1;break;
            case 'mg.secret-letters':this.data.word=(age==='3-5'?'ABC':age==='6-8'?'LÚA':'TRƯỜNG').split('');this.data.grid=[...this.data.word,...['O','I','E','X','Z','U']].slice(0,9);this.data.step=0;break;
            case 'mg.animal-care':this.data.step=0;break;
            case 'mg.village-maze':this.data.cursor=0;break;
        }
    }
    pause():void{if(this.status==='running')this.status='paused';}
    get ended():boolean{return this.status==='ended';}
    resume():void{if(this.status==='paused')this.status='running';}
    advance(dt:number):void{if(this.status==='running'&&Number.isFinite(dt)&&dt>0)this.clock=Math.min(3600,this.clock+Math.min(dt,0.1));}
    get rhythmOpen():boolean{return this.id==='mg.tug-of-war'?Math.abs(Math.sin(this.clock*Math.PI*2))<(this.age==='3-5'?.92:this.age==='6-8'?.85:.75):this.clock%1.5<(this.age==='3-5'?1.1:.9);}
    fishX(index:number):number{return Math.sin(this.clock+index*Math.PI*2/3)*200;}
    private end():void{this.status='ended';this.feedback='Hoàn thành! Cháu có thể nghỉ hoặc luyện lại.';}
    hint():string{
        if(this.id==='mg.village-maze'){const n=mazePath(this.data.cursor)[0];return n===undefined?'Đã tới đích.':`Bước tiếp theo tới ô ${n+1}.`;}return this.prompt;
    }
    action(type:string,index:number):boolean{
        if(this.status!=='running'||!Number.isInteger(index)||this.actions.length>=2000)return false;
        const d=this.data;let accepted=false;
        switch(this.id){
            case 'mg.rice-count':
                if(type==='plant'&&index>=0&&index<5&&!d.planted.includes(index)){d.planted.push(index);accepted=true;}
                else if(type==='water'&&d.planted.length===5&&index>=0&&index<5&&!d.watered.includes(index)){d.watered.push(index);accepted=true;}
                else if(type==='answer'&&d.watered.length===5&&index===5){accepted=true;this.end();}break;
            case 'mg.o-an-quan':
                if(type==='direction'){d.direction=d.direction===1?-1:1;accepted=true;}
                else if(type==='pit'&&index>=0&&index<5&&d.board[index]>0){this.oanMove(0,index,d.direction);if(!this.ended){
                    this.refill(1);const choices=[6,7,8,9,10].filter(n=>d.board[n]>0);if(choices.length)this.oanMove(1,choices.reduce((a,b)=>d.board[a]>=d.board[b]?a:b),-1);this.refill(0);
                }accepted=true;}break;
            case 'mg.tug-of-war':case 'mg.bamboo-dance':
                if(type==='beat'&&this.rhythmOpen){const beat=Math.floor(this.clock/(this.id==='mg.tug-of-war'?1:1.5));if(beat!==d.lastBeat){d.lastBeat=beat;d.hits++;accepted=true;if(d.hits===6)this.end();}}break;
            case 'mg.market':{
                const filled=d.cart.every((n:number,i:number)=>n===d.wants[i]);
                if(type==='add'&&!filled&&index>=0&&index<3&&d.cart[index]<d.wants[index]){d.cart[index]++;accepted=true;}
                else if(type==='clear'){d.cart=[0,0,0];accepted=true;}
                else if(type==='pay'&&filled&&index===2){accepted=true;this.end();}break;}
            case 'mg.star-lantern':
                if(type==='part'&&index>=0&&index<5&&!d.placed.includes(index)){d.selected=index;accepted=true;}
                else if(type==='place'&&index===d.selected&&!d.placed.includes(index)){d.placed.push(index);d.selected=-1;accepted=true;if(d.placed.length===5)this.end();}break;
            case 'mg.banh-chung':if(type==='layer'&&index===d.step){d.step++;accepted=true;if(d.step===6)this.end();}break;
            case 'mg.dong-ho':{
                const blank=d.tiles.indexOf(8);if(type==='tile'&&index>=0&&index<9&&Math.abs(index%3-blank%3)+Math.abs(Math.floor(index/3)-Math.floor(blank/3))===1){[d.tiles[index],d.tiles[blank]]=[d.tiles[blank],d.tiles[index]];accepted=true;if(d.tiles.every((n:number,i:number)=>n===i))this.end();}break;}
            case 'mg.fishing':
                if(type==='fish'&&index>=0&&index<3&&d.caught<0&&!d.observed.includes(index)&&Math.abs(this.fishX(index))<70){d.caught=index;accepted=true;}
                else if(type==='color'&&index===d.caught&&d.caught>=0){d.observed.push(index);d.caught=-1;accepted=true;if(d.observed.length===3)this.end();}break;
            case 'mg.secret-letters':if(type==='letter'&&index>=0&&index<d.grid.length&&d.grid[index]===d.word[d.step]){d.step++;accepted=true;if(d.step===d.word.length)this.end();}break;
            case 'mg.animal-care':if(type==='care'&&index===[1,0,2][d.step]){d.step++;accepted=true;if(d.step===3)this.end();}break;
            case 'mg.village-maze':{
                const next=d.cursor+[-5,1,5,-1][index];if(type==='move'&&index>=0&&index<4&&next>=0&&next<25&&!mazeWalls.has(next)&&Math.abs(next%5-d.cursor%5)+Math.abs(Math.floor(next/5)-Math.floor(d.cursor/5))===1){d.cursor=next;accepted=true;if(next===24)this.end();}break;}
        }
        if(accepted){this.actions.push({type,index,at:this.clock});if(!this.ended)this.feedback='Đúng bước rồi! Cháu tiếp tục nhé.';}else this.feedback='Mình thử lại nhé. Có thể xem gợi ý, không mất điểm.';
        return accepted;
    }
    private refill(player:number):void{if(this.status==='ended')return;const side=player===0?[0,1,2,3,4]:[6,7,8,9,10];if(side.every(n=>this.data.board[n]===0)){for(const n of side)this.data.board[n]=1;this.data.scores[player]-=5;}}
    private oanMove(player:number,pit:number,direction:number):void{
        const d=this.data,board=d.board as number[];let seeds=board[pit],last=pit;board[pit]=0;
        const has=(n:number)=>board[n]+(n===5&&d.quan[0]||n===11&&d.quan[1]?1:0)>0;
        for(let guard=0;guard<300;guard++){
            while(seeds-->0){last=(last+direction+12)%12;board[last]++;}
            const next=(last+direction+12)%12;if(next!==5&&next!==11&&board[next]>0){seeds=board[next];board[next]=0;last=next;continue;}
            let empty=next;while(!has(empty)){
                const capture=(empty+direction+12)%12;if(!has(capture))break;
                d.scores[player]+=board[capture];board[capture]=0;if(capture===5&&d.quan[0]){d.scores[player]+=10;d.quan[0]=false;}if(capture===11&&d.quan[1]){d.scores[player]+=10;d.quan[1]=false;}
                empty=(capture+direction+12)%12;
            }break;
        }
        d.turns++;if(d.quan.every((q:boolean)=>!q)||d.turns>=128){
            for(const n of [0,1,2,3,4]){d.scores[0]+=board[n];board[n]=0;}for(const n of [6,7,8,9,10]){d.scores[1]+=board[n];board[n]=0;}
            const rest=board[5]+board[11]+d.quan.filter(Boolean).length*10;d.scores[0]+=Math.ceil(rest/2);d.scores[1]+=Math.floor(rest/2);board[5]=board[11]=0;d.quan=[false,false];this.end();
        }
    }
    get prompt():string{
        const d=this.data;
        switch(this.id){
            case 'mg.rice-count':return d.planted.length<5?`Trồng một cây ở mỗi ô (${d.planted.length}/5).`:d.watered.length<5?`Tưới từng cây trong mô phỏng (${d.watered.length}/5).`:'Đã trồng bao nhiêu cây?';
            case 'mg.o-an-quan':return `Chọn ô dân 1–5. Rải theo chiều đã chọn; sau một ô trống thì ăn ô kế. Quan tính 10 điểm. NPC chơi lượt sau.\nCháu: ${d.scores[0]} • NPC: ${d.scores[1]} • lượt ${d.turns}/128. Vay 5 dân để rải lại nếu hết. Thắng/thua đều hoàn thành.`;
            case 'mg.tug-of-war':return `Chạm Kéo khi vòng sáng mở. Một nhịp một lần; NPC giúp cháu (${d.hits}/6).`;
            case 'mg.bamboo-dance':return `Chạm Bước khi sạp mở. Có thể chờ nhịp tiếp theo (${d.hits}/6).`;
            case 'mg.market':return `Giỏ cần: ${d.wants[0]} cà rốt, ${d.wants[1]} rau cải, ${d.wants[2]} cà tím. Giá xu: ${d.prices.join(', ')}. Giỏ: ${d.cart.join(', ')}. Xu chỉ dùng trong game.`;
            case 'mg.star-lantern':return `Chạm mảnh/cánh cùng số, hoặc kéo mảnh vào hình đèn (${d.placed.length}/5). Không dùng lửa thật.`;
            case 'mg.banh-chung':return `Sắp lớp theo hình: lá → gạo → đậu → nhân → gạo phủ → gấp lá (${d.step}/6). Đây là mô phỏng, không phải công thức nấu.`;
            case 'mg.dong-ho':return 'Trượt miếng cạnh ô trống để xếp 1–8 đúng thứ tự. Hình minh họa tự vẽ, không phải bản tranh Đông Hồ gốc.';
            case 'mg.fishing':return d.caught<0?`Chạm cá khi vào vùng giữa, quan sát rồi thả (${d.observed.length}/3).`:'Cá vừa quan sát có màu gì?';
            case 'mg.secret-letters':return `Tìm chữ ${d.word[d.step]??''}. Bộ chữ: ${d.word.join('')} (${d.step}/${d.word.length}).`;
            case 'mg.animal-care':return ['Gà trong hình cần uống. Chọn hành động.','Chó trong hình cần chỗ nghỉ. Chọn hành động.','Thấy một con vật lạ, cháu cần làm gì?'][d.step]??'Hoàn thành bài chăm sóc.';
            case 'mg.village-maze':return `Đưa bé từ ô 1 đến ô 25. Không đi qua ô rào; bé ở ô ${d.cursor+1}.`;
        }
    }
    get options():GameOption[]{
        if(this.status!=='running')return [];const d=this.data,option=(type:string,index:number,label:string)=>({type,index,label});
        switch(this.id){
            case 'mg.rice-count':return d.planted.length<5?Array.from({length:5},(_,i)=>option('plant',i,d.planted.includes(i)?`Cây ${i+1} ✓`:`Trồng ô ${i+1}`)):d.watered.length<5?Array.from({length:5},(_,i)=>option('water',i,d.watered.includes(i)?`Đã tưới ${i+1}`:`Tưới cây ${i+1}`)):[4,5,6].map(n=>option('answer',n,String(n)));
            case 'mg.o-an-quan':return [0,1,2,3,4].map(i=>option('pit',i,`Ô ${i+1}: ${d.board[i]}`)).concat(option('direction',0,d.direction===1?'Chiều →':'Chiều ←'));
            case 'mg.tug-of-war':case 'mg.bamboo-dance':return [option('beat',0,this.id==='mg.tug-of-war'?'Kéo':'Bước')];
            case 'mg.market':{const total=d.cart.reduce((n:number,c:number,i:number)=>n+c*d.prices[i],0);return d.cart.every((n:number,i:number)=>n===d.wants[i])?[total-1,total+1,total].map((n,i)=>option('pay',i,`${n} xu`)):['Cà rốt','Rau cải','Cà tím'].map((name,i)=>option('add',i,name)).concat(option('clear',0,'Đặt giỏ lại'));}
            case 'mg.star-lantern':return d.selected<0?Array.from({length:5},(_,i)=>option('part',i,`Mảnh △ ${i+1}`)):Array.from({length:5},(_,i)=>option('place',i,`Cánh ☆ ${i+1}`));
            case 'mg.banh-chung':return [3,0,4,1,5,2].map(i=>option('layer',i,['Lá','Gạo','Đậu','Nhân','Gạo phủ','Gấp lá'][i]));
            case 'mg.dong-ho':return d.tiles.map((n:number,i:number)=>option('tile',i,n===8?'□':String(n+1)));
            case 'mg.fishing':return d.caught<0?['Cá xanh','Cá cam','Cá tím'].map((s,i)=>option('fish',i,s)):['Xanh','Cam','Tím'].map((s,i)=>option('color',i,s));
            case 'mg.secret-letters':return d.grid.map((s:string,i:number)=>option('letter',i,s));
            case 'mg.animal-care':return [['Xếp hình','Nhờ người lớn cho nước sạch','Tô tranh'],['Nhờ người lớn chuẩn bị chỗ sạch','Đếm đồ','Tô tranh'],['Tự đến gần','Theo con vật','Nhờ người lớn giúp']][d.step]?.map((s,i)=>option('care',i,s))??[];
            case 'mg.village-maze':return ['↑','→','↓','←'].map((s,i)=>option('move',i,s));
        }
    }
    save():GameSave{return {version:1,id:this.id,age:this.age,seed:this.seed,clock:this.clock,actions:this.actions.map(a=>({...a}))};}
    static restore(raw:unknown):MiniGameRules{
        const d=raw as GameSave;if(!d||d.version!==1||!Array.isArray(d.actions)||d.actions.length>2000||!Number.isFinite(d.clock)||d.clock<0||d.clock>3600)throw Error('Invalid game save');
        const game=new MiniGameRules(d.id,d.age,d.seed);for(const a of d.actions){if(!a||typeof a.type!=='string'||!Number.isFinite(a.at)||a.at<game.clock||a.at>d.clock)throw Error('Invalid action trace');game.clock=a.at;if(!game.action(a.type,a.index))throw Error('Invalid action trace');}game.clock=d.clock;return game;
    }
}
