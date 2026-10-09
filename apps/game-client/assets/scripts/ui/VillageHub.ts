import { Color, Graphics, Label, Node, UITransform, Vec3 } from 'cc';
import { CampaignSave } from '../world/CampaignSave';
import { ChapterOneSave } from '../world/ChapterOneSave';
import { AgeBand, chapters, storyNpcs } from '../world/CampaignContent';
import { EducationEngine, lessonQuestions } from '../world/EducationEngine';
import { gameNames, MiniGameRules } from '../world/MiniGameRules';
import { CampaignEngine } from '../world/CampaignEngine';
import { worldZones } from '../world/WorldZones';
import { Point, toWorld } from '../world/VillageModel';
import { PlayerController } from '../player/PlayerController';
interface Button {node:Node;width:number;action:()=>void}
type Mode='journal'|'chapter'|'lesson'|'game'|'gate'|'parent'|'age'|'quality'|'avatar'|'accessory'|'inventory'|'map'|'reset'|'help'|'online'|'home';
export class VillageHub {
    onGesture?:(id:'hello'|'happy')=>void;
    onAvatarPreview?:(parent:Node,id:number)=>void;
    onChapterIntro?:(index:number)=>void;onClaim?:(index:number)=>void;
    onLessonAnswer?:(data:{questId:string;round:number;index:number})=>void;
    onGameStart?:(questId:string)=>void;onGameAction?:(type:string,index:number)=>void;onGamePause?:(paused:boolean)=>void;
    onPortal?:(id:string)=>void;private usePortal=false;onOnline?:(action:string,id?:string)=>void;onlinePeers?:()=>Array<{id:string;name:string}>;private mapPage=0;private peerIndex=0;readonly node:Node;readonly npcNodes:Node[]=[];
    readonly campaign:CampaignEngine;
    private mode:Mode='journal';private chapterIndex=1;private questId='';private buttons:Button[]=[];private message='';
    private lesson?:EducationEngine;private game?:MiniGameRules;private indicator?:Graphics;
    private serverGameSignature='';private gateAnswer=0;private pendingNpc:number|null=null;private syncSignature='';private lastRhythm:boolean|null=null;
    constructor(parent:Node,actors:Node,readonly save:CampaignSave,private first:ChapterOneSave,private player:PlayerController,private reset:()=>void,private destination:(p:Point)=>void){
        this.campaign=save.engine;this.node=this.make(parent,'VillageHub',620,560);const g=this.node.addComponent(Graphics);g.fillColor=new Color(255,248,219);g.roundRect(-310,-280,620,560,18);g.fill();this.node.active=false;
        for(const npc of storyNpcs){const n=this.make(actors,npc.id,70,110),p=toWorld(npc);n.setPosition(p.x,p.y);const g=n.addComponent(Graphics);g.fillColor=new Color(...npc.color);g.roundRect(-20,10,40,55,10);g.fill();g.fillColor=new Color(250,214,174);g.circle(0,82,18);g.fill();g.fillColor=new Color(55,45,35);g.circle(-6,84,2);g.circle(6,84,2);g.fill();this.text(n,npc.name,0,125,235,45,18);this.npcNodes.push(n);}
        this.syncFirst();
    }
    private make(parent:Node,name:string,width:number,height:number):Node{const n=new Node(name);n.layer=parent.layer;parent.addChild(n);n.addComponent(UITransform).setContentSize(width,height);return n;}
    private text(parent:Node,value:string,x:number,y:number,width=560,height=75,size=24):Node{const n=this.make(parent,'Text',width,height);n.setPosition(x,y);const l=n.addComponent(Label);l.string=value;l.fontSize=size;l.lineHeight=size+8;l.enableWrapText=true;l.overflow=Label.Overflow.CLAMP;l.color=new Color(45,68,43);return n;}
    private button(id:string,label:string,x:number,y:number,width:number,action:()=>void):Node{const n=this.make(this.node,id,width,76);n.setPosition(x,y);const g=n.addComponent(Graphics);g.fillColor=new Color(205,229,164);g.roundRect(-width/2,-38,width,76,10);g.fill();this.text(n,label,0,0,width-12,76,21);this.buttons.push({node:n,width,action});return n;}
    private grid(items:Array<{id:string;label:string;action:()=>void}>,columns=2):void{const width=columns===1?560:columns===2?280:165;items.forEach((b,i)=>this.button(b.id,b.label,(i%columns-(columns-1)/2)*(width+12),120-Math.floor(i/columns)*92,width,b.action));}
    private persist():void{this.save.save();}
    syncFirst():void{const d=this.first.progress.data,signature=[d.greeted,d.planted.length,d.countRound,d.rewardReceipts.length].join(':');if(signature!==this.syncSignature){this.syncSignature=signature;this.campaign.syncChapterOne(d);this.persist();}}
    get objective():string{const index=chapters.findIndex((c,i)=>this.campaign.unlocked(i)&&!this.campaign.data.receipts.includes(`reward.star.${c.id}`));if(index<0)return 'Cây đa đã sáng • 8 Sao Tri Thức';if(index===0)return this.first.progress.description;const c=chapters[index],q=c.quests.find(q=>!this.campaign.data.completed.includes(q.id));return `${c.title} • ${q?.title??'Về nhận sao'}`;}
    applyServerProgress():void{if(this.node.active&&this.mode!=='game'&&this.mode!=='lesson')this.render();}
    applyServerGame(game:MiniGameRules):void{const q=chapters[this.chapterIndex].quests.find(q=>q.id===this.questId);if(q?.game!==game.id)return;const signature=game.save().actions.length+':'+game.status;this.game=game;if(this.node.active&&this.mode==='game'&&signature!==this.serverGameSignature)this.render();this.serverGameSignature=signature;}
    open(mode:Mode='journal',chapter?:number):void{this.reset();this.game?.pause();if(chapter!==undefined)this.chapterIndex=chapter;this.mode=mode;this.message='';this.node.active=true;if(mode==='gate')this.gateAnswer=12+Math.floor(Math.random()*9);this.render();}
    close():void{this.game?.pause();this.onGamePause?.(true);if(this.game&&this.questId)this.campaign.data.resume[this.questId]={kind:'game',data:this.game.save()};this.persist();this.node.active=false;}
    cancel():void{this.pendingNpc=null;}
    select(world:Point):'accepted'|'blocked'|null{
        const index=this.npcNodes.findIndex(n=>{const size=n.getComponent(UITransform)!;return Math.abs(world.x-n.position.x)<=size.width/2&&world.y>=n.position.y-12&&world.y<=n.position.y+size.height;});if(index<0)return null;
        const npc=storyNpcs[index],candidates=[{x:npc.x+1,y:npc.y},{x:npc.x-1,y:npc.y},{x:npc.x,y:npc.y+1},{x:npc.x,y:npc.y-1}];
        for(const goal of candidates)if(this.player.goTo(goal)){this.pendingNpc=index;this.destination(goal);return 'accepted';}return 'blocked';
    }
    step(dt:number):void{
        this.syncFirst();if(this.pendingNpc!==null&&!this.player.hasPath){const index=this.pendingNpc,npc=this.npcNodes[index];this.pendingNpc=null;if(Math.hypot(npc.position.x-this.player.position.x,npc.position.y-this.player.position.y)<55)this.open('chapter',storyNpcs[index].chapter);}
        if(this.node.active&&this.mode==='game'&&this.game){if(!this.onGameAction)this.game.advance(dt);const rhythm=this.game.rhythmOpen;if(this.indicator&&(this.game.id==='mg.tug-of-war'||this.game.id==='mg.bamboo-dance')&&rhythm!==this.lastRhythm){this.lastRhythm=rhythm;this.indicator.clear();this.indicator.fillColor=rhythm?new Color(95,185,90):new Color(185,160,120);this.indicator.roundRect(-220,65,440,28,12);this.indicator.fill();}
            if(this.indicator&&this.game.id==='mg.fishing'){const g=this.indicator;g.clear();g.strokeColor=new Color(90,150,205);g.rect(-70,55,140,45);g.stroke();for(let i=0;i<3;i++){if(this.game.data.observed.includes(i))continue;g.fillColor=[new Color(80,175,120),new Color(230,150,60),new Color(155,110,190)][i];g.ellipse(this.game.fishX(i),75,15,9);g.fill();}}
        }
    }
    handle(point:Point):void{const p=this.node.getComponent(UITransform)!.convertToNodeSpaceAR(new Vec3(point.x,point.y));const hit=this.buttons.find(b=>Math.abs(p.x-b.node.position.x)<=b.width/2&&Math.abs(p.y-b.node.position.y)<=38);hit?.action();}
    private finishQuest():void{this.campaign.complete(this.questId);this.persist();this.mode='chapter';this.lesson=undefined;this.game=undefined;this.message='Hoàn thành việc này! Không mất điểm khi dùng gợi ý.';this.render();}
    private startQuest(id:string):void{
        const q=chapters[this.chapterIndex].quests.find(q=>q.id===id);if(!q||!this.campaign.available(id))return;this.questId=id;
        const resume=this.campaign.data.resume[id];
        if(q.game){try{this.game=resume?.kind==='game'?MiniGameRules.restore(resume.data):new MiniGameRules(q.game as any,this.campaign.data.age);}catch{this.game=new MiniGameRules(q.game as any,this.campaign.data.age);this.message='Bài chưa đọc được, mình bắt đầu bài này lại nhé.';}this.game.resume();this.mode='game';}
        else{const round=resume?.kind==='lesson'&&typeof resume.data==='number'?resume.data:0;this.lesson=new EducationEngine(lessonQuestions(q.lesson??'fair-play',this.campaign.data.age),round);this.mode='lesson';}
        if(q.game)this.onGameStart?.(q.id);this.render();
    }
    private exportSave():void{if(typeof document==='undefined')return;const raw=JSON.stringify({version:1,chapterOne:this.first.progress.data,campaign:this.campaign.data},null,2),url=URL.createObjectURL(new Blob([raw],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='lang-tri-thuc-progress.json';a.click();URL.revokeObjectURL(url);this.message='Đã tạo bản sao tiến độ, không có tên thật hay tài khoản.';this.render();}
    private render():void{
        for(const n of [...this.node.children]){n.active=false;n.destroy();}this.buttons=[];this.indicator=undefined;this.lastRhythm=null;
        const titles:Record<Mode,string>={accessory:'KHĂN QUÀNG CỦA BÉ',home:'NHÀ CỦA BÉ',online:'BẠN BÈ • PHÒNG RIÊNG',journal:'SỔ LÀNG • TÁM CHƯƠNG',chapter:chapters[this.chapterIndex].title.toUpperCase(),lesson:'BÀI HỌC',game:this.game?gameNames[this.game.id]:'TRÒ CHƠI',gate:'GÓC PHỤ HUYNH',parent:'PHỤ HUYNH • BẢN THỬ',age:'MỨC HỌC',quality:'HÌNH ẢNH',avatar:'CHỌN NHÂN VẬT',inventory:'SAO VÀ BỘ SƯU TẬP',map:'BẢN ĐỒ LÀNG',reset:'XÁC NHẬN XÓA SỔ',help:'HƯỚNG DẪN TRÒ CHƠI'};
        this.text(this.node,this.message||titles[this.mode],0,225,590,65,this.message?20:26);this.button('HubClose','Đóng',0,-235,155,()=>this.close());
        if(this.mode==='journal'){
            this.grid(chapters.map((c,i)=>({id:'Chapter-'+i,label:`${i+1}. ${c.title}${this.campaign.data.receipts.includes('reward.star.'+c.id)?' ★':this.campaign.unlocked(i)?'':' 🔒'}`,action:()=>{if(i===0){this.message='Chương 1 chơi cùng Ông Đồ và bác trong làng.';this.render();}else{this.chapterIndex=i;this.mode='chapter';this.render();}}})));
        }else if(this.mode==='chapter'){
            const c=chapters[this.chapterIndex];
            if(!this.campaign.unlocked(this.chapterIndex))this.text(this.node,'Chương này mở sau khi nhận sao của chương trước. Cháu có thể luyện lại các chương đã mở.',0,65,550,235);
            else if(!this.campaign.data.introduced.includes(c.id)){this.text(this.node,c.npc+'\n'+c.intro,0,65,550,235);this.button('ChapterIntro','Bắt đầu',0,-110,350,()=>{this.campaign.introduce(this.chapterIndex);this.onChapterIntro?.(this.chapterIndex);this.persist();this.render();});}
            else if(c.quests.every(q=>this.campaign.data.completed.includes(q.id))){this.text(this.node,c.ending+`\nSao Tri Thức: ${this.campaign.stars}/8`,0,70,550,220);if(!this.campaign.data.receipts.includes('reward.star.'+c.id))this.button('ClaimStar','Nhận sao chương',0,-115,360,()=>{this.campaign.claim(this.chapterIndex);this.onClaim?.(this.chapterIndex);this.persist();this.render();});else this.button('NextChapter',this.chapterIndex<7?'Xem chương tiếp':'Cây đa đã sáng!',0,-115,360,()=>{if(this.chapterIndex<7){this.chapterIndex++;this.render();}else{this.mode='inventory';this.render();}});}
            else this.grid(c.quests.map(q=>({id:q.id,label:q.title+(this.campaign.data.completed.includes(q.id)?' ✓':this.campaign.available(q.id)?'':' 🔒'),action:()=>{if(this.campaign.data.completed.includes(q.id)){this.message='Việc này đã hoàn thành. Sao không cấp thêm.';this.render();}else this.startQuest(q.id);}})),1);
        }else if(this.mode==='lesson'&&this.lesson){
            const q=this.lesson.question;if(!q){this.finishQuest();return;}
            this.text(this.node,q.prompt+(q.illustration?'\n'+q.illustration:''),0,145,550,105,24);
            q.choices.forEach((s,i)=>this.button('LessonAnswer-'+i,s,0,40-i*92,550,()=>{const round=this.lesson!.round;if(this.lesson!.answer(i)){this.onLessonAnswer?.({questId:this.questId,round,index:i});this.campaign.data.resume[this.questId]={kind:'lesson',data:this.lesson!.round};this.persist();if(this.lesson!.complete){this.finishQuest();return;}this.message='Đúng rồi!';}else this.message=q.hint;this.render();}));
            this.button('LessonHint','Gợi ý',215,-235,140,()=>{this.message=q.hint;this.render();});
        }else if(this.mode==='game'&&this.game){
            if(!this.onGameAction)this.game.resume();const game=this.game;
            if(game.status==='paused'){this.text(this.node,'Trò chơi đang tạm nghỉ. Chủ trò có thể tiếp tục; các bạn cùng chờ hoặc đóng để chơi riêng.',0,70,550,200);this.button('ServerGameResume','Tiếp tục (chủ trò)',0,-100,390,()=>this.onGamePause?.(false));}
            else if(game.status==='ended'){this.text(this.node,game.feedback,0,80,550,190);this.button('GameFinish','Xong • nhận tiến độ',0,-100,390,()=>this.finishQuest());}
            else{
                const summary=game.id==='mg.o-an-quan'?`Cháu: ${game.data.scores[0]} • NPC: ${game.data.scores[1]}\nNPC: ${game.data.board.slice(6,11).join(' • ')}\nChọn ô dân 1–5; NPC chơi lượt kế.`:game.id==='mg.fishing'?'Chờ cá vào vùng giữa; quan sát màu rồi thả.':game.prompt;
                this.text(this.node,summary,0,150,550,105,21);
                const options=game.options,columns=options.length>3?3:options.length===1?1:3,width=columns===1?400:165;
                options.forEach((o,i)=>{const n=this.button('GameAction-'+o.type+'-'+o.index,o.label,(i%columns-(columns-1)/2)*(width+10),options.length>3?35-Math.floor(i/columns)*90:-65,width,()=>{if(this.onGameAction){this.onGameAction(o.type,o.index);return;}game.action(o.type,o.index);this.message=game.feedback;this.campaign.data.resume[this.questId]={kind:'game',data:game.save()};this.persist();this.render();});if(game.id==='mg.dong-ho'){const g=n.getComponent(Graphics)!;g.fillColor=new Color(100+(game.data.tiles[i]%3)*35,170,115);g.circle(-width/2+12,22,7);g.fill();}});
                if(['mg.tug-of-war','mg.bamboo-dance','mg.fishing'].includes(game.id))this.indicator=this.make(this.node,'GameMotion',1,1).addComponent(Graphics);
                this.button('GameHelp','Luật / gợi ý',210,-235,170,()=>{game.pause();this.onGamePause?.(true);this.mode='help';this.render();});
                this.button('GamePause','Tạm nghỉ',-210,-235,170,()=>{game.pause();this.onGamePause?.(true);this.campaign.data.resume[this.questId]={kind:'game',data:game.save()};this.persist();this.mode='chapter';this.render();});
            }
        }else if(this.mode==='help'&&this.game){this.text(this.node,this.game.hint(),0,65,550,255,22);this.button('GameResume','Tiếp tục',0,-115,340,()=>{this.mode='game';this.game?.resume();this.onGamePause?.(false);this.render();});}
        else if(this.mode==='gate'){this.text(this.node,'Dành cho người lớn. Cổng này giúp tránh chạm nhầm, không thay thế tài khoản phụ huynh.\n12 + '+(this.gateAnswer-12)+' = ?',0,80,550,190,24);[this.gateAnswer-1,this.gateAnswer,this.gateAnswer+2].forEach((n,i)=>this.button('ParentAnswer-'+i,String(n),(i-1)*170,-100,150,()=>{if(n===this.gateAnswer){this.mode='parent';this.render();}else{this.message='Mời người lớn giúp mở góc này.';this.render();}}));}
        else if(this.mode==='parent'){this.button('OnlineMenu','Bạn bè',-215,-235,155,()=>{this.mode='online';this.render();});this.grid([
            {id:'ChooseAge',label:'Mức học: '+this.campaign.data.age,action:()=>{this.mode='age';this.render();}},
            {id:'ChooseQuality',label:'Hình ảnh: '+this.campaign.data.quality,action:()=>{this.mode='quality';this.render();}},
            {id:'Sound',label:this.campaign.data.sound?'Âm thanh: bật':'Âm thanh: tắt',action:()=>{this.campaign.data.sound=!this.campaign.data.sound;this.persist();this.render();}},
            {id:'Avatar',label:'Chọn nhân vật',action:()=>{this.mode='avatar';this.render();}},
            {id:'Export',label:'Xuất bản sao',action:()=>this.exportSave()},
            {id:'Reset',label:'Xóa sổ chương 2–8',action:()=>{this.mode='reset';this.render();}},
            {id:'Collection',label:'Sao / bộ sưu tập',action:()=>{this.mode='inventory';this.render();}},
            {id:'WorldMap',label:'Bản đồ làng',action:()=>{this.mode='map';this.render();}},
        ]);}
        else if(this.mode==='online'){
            const peers=this.onlinePeers?.()??[],peer=peers[this.peerIndex%Math.max(1,peers.length)];
            ['hello','thanks','need-help'].forEach((id,i)=>this.button('Emote-'+id,['Chào bạn','Cảm ơn','Cần giúp'][i],(i-1)*180,115,165,()=>this.onOnline?.('emote',id)));
            this.button('ChooseFriend',peer?peer.name+' • chọn bạn tiếp':'Chưa có bạn trong phòng',0,15,500,()=>{this.peerIndex++;this.render();});
            if(peer){this.button('BlockFriend','Ẩn bạn này',-145,-95,270,()=>{this.onOnline?.('block',peer.id);this.render();});this.button('ReportFriend','Báo người lớn',145,-95,270,()=>{this.onOnline?.('report',peer.id);this.message='Đã yêu cầu gửi báo cáo tới người lớn.';this.render();});}
            this.button('PlayOffline','Chơi một mình',-215,-235,175,()=>{this.onOnline?.('offline');this.close();});
        }
        else if(this.mode==='age'){this.text(this.node,'Chọn mức bắt đầu; không cần ngày sinh hoặc tên thật. Trẻ có thể dùng gợi ý ở mọi mức.',0,100,550,150);(['3-5','6-8','9-11'] as AgeBand[]).forEach((a,i)=>this.button('Age-'+a,a+' tuổi',(i-1)*180,-100,160,()=>{this.campaign.data.age=a;this.persist();this.mode='parent';this.render();}));}
        else if(this.mode==='quality'){this.text(this.node,'Low giảm hiệu ứng; Medium và High dùng hình ảnh đầy đủ hơn. Tốc độ và luật chơi giữ nguyên.',0,100,550,150);(['low','medium','high'] as const).forEach((a,i)=>this.button('Quality-'+a,a,(i-1)*180,-100,160,()=>{this.campaign.data.quality=a;this.persist();this.mode='parent';this.render();}));}
        else if(this.mode==='avatar'){
            ['Bé trai • áo đỏ','Bé trai • áo xanh','Bé gái • áo hồng','Bé gái • áo vàng'].forEach((value,i)=>{
                const selected=this.campaign.data.avatar===i;
                const n=this.button('Avatar-'+i,'',(i%2-.5)*292,120-Math.floor(i/2)*92,280,()=>{this.campaign.data.avatar=i;this.persist();this.message='Đã chọn '+value.toLowerCase()+'.';this.render();});
                this.text(n,value+(selected?' ✓':''),30,0,200,76,21);this.onAvatarPreview?.(n,i);
            });
            this.button('Accessories','Chọn khăn quàng',0,-95,400,()=>{this.mode='accessory';this.render();});
            this.button('Gesture-hello','Vẫy chào',-146,-165,280,()=>{this.close();this.onGesture?.('hello');});
            this.button('Gesture-happy','Vui mừng',146,-165,280,()=>{this.close();this.onGesture?.('happy');});
        }
        else if(this.mode==='accessory'){
            this.grid(['Không dùng khăn','Khăn đỏ','Khăn xanh','Khăn vàng'].map((value,i)=>({id:'Accessory-'+i,label:value+(this.campaign.data.accessory===i?' ✓':''),action:()=>{this.campaign.data.accessory=i;this.persist();this.message='Đã chọn '+value.toLowerCase()+'.';this.render();}})));
            this.text(this.node,'Khăn được giữ khi đổi nhân vật và hiển thị với bạn cùng phòng.',0,-75,540,95,22);
            this.button('BackToAvatar','Chọn nhân vật',0,-165,350,()=>{this.mode='avatar';this.render();});
        }
        else if(this.mode==='home'){this.grid(['Nhà mái ngói','Nhà xanh • 2 sao','Nhà tím • 4 sao','Nhà vàng • 8 sao'].map((label,i)=>({id:'Home-'+i,label,action:()=>{if(this.campaign.stars>=[0,2,4,8][i]){this.campaign.data.home=i;this.persist();this.message='Đã trang trí ngôi nhà.';}else this.message='Màu này mở khi có thêm sao.';this.render();}})));}
        else if(this.mode==='inventory'){this.button('MyHome','Nhà của bé',-215,-235,180,()=>{this.mode='home';this.render();});this.text(this.node,`★ Sao Tri Thức: ${this.campaign.stars}/8\n${chapters.filter(c=>this.campaign.data.receipts.includes('reward.star.'+c.id)).map(c=>'✓ '+c.title).join('\n')}`,0,30,550,330,22);}
        else if(this.mode==='map'){this.button('PortalMode',this.usePortal?'Cổng khu: bật':'Cổng khu: tắt',215,-235,180,()=>{this.usePortal=!this.usePortal;this.message='Cổng chuyển khu hoạt động khi đứng gần một mốc khu trên bản đồ.';this.render();});this.grid(worldZones.slice(this.mapPage*6,this.mapPage*6+6).map(zone=>({id:'Zone-'+zone.id,label:zone.name,action:()=>{this.close();if(this.usePortal){this.onPortal?.(zone.id);return;}if(this.player.goTo(zone.spawn))this.destination(zone.spawn);}})),2);this.button('MapPage','Trang tiếp',-215,-235,170,()=>{this.mapPage=1-this.mapPage;this.render();});}
        else if(this.mode==='reset'){this.text(this.node,'Xóa sổ chương 2–8? Bản sao trước xóa được giữ trong bộ nhớ. Chương 1 và demo cũ giữ nguyên.',0,90,550,200);this.button('ConfirmReset','Xóa sổ mới',0,-110,340,()=>{const ok=this.save.resetLaterChapters();this.syncSignature='';this.syncFirst();this.message=ok?'Đã xóa sổ chương 2–8, giữ bản sao.':'Chưa xóa được; dữ liệu được giữ lại.';this.mode='parent';this.render();});}
    }
}
