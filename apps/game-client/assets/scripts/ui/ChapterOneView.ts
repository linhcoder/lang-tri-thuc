import { Color, Graphics, Label, Node, UITransform, Vec3 } from 'cc';
import { PlayerController } from '../player/PlayerController';
import { ChapterOneProgress, plantingPlots } from '../world/ChapterOneProgress';
import { ChapterOneSave } from '../world/ChapterOneSave';
import { RiceCountGame } from '../world/RiceCountGame';
import { elderTile, Point, toWorld } from '../world/VillageModel';
interface Button {node:Node;width:number;height:number;action:()=>void}
export class ChapterOneView {
    readonly node:Node;readonly elder:Node;readonly plots:Node[]=[];
    readonly lesson:RiceCountGame;
    private buttons:Button[]=[];private feedback='';private spoken='';
    private speaker:'elder'|'farmer'='elder';
    private pending:{kind:'elder'|'farmer'|'plot';index?:number;goal:Point}|null=null;
    private star:Graphics;
    constructor(parent:Node,actors:Node,readonly progress:ChapterOneProgress,private player:PlayerController,private save:ChapterOneSave,private reset:()=>void,private destination:(p:Point)=>void){
        this.lesson=new RiceCountGame(progress);
        this.node=this.make(parent,'ChapterOneDialog',620,560);
        const bg=this.node.addComponent(Graphics);bg.fillColor=new Color(255,248,219);bg.roundRect(-310,-280,620,560,18);bg.fill();this.node.active=false;
        this.elder=this.make(actors,'OngDo',90,130);const p=toWorld(elderTile);this.elder.setPosition(p.x,p.y);
        const g=this.elder.addComponent(Graphics);
        g.fillColor=new Color(45,60,45,90);g.ellipse(0,0,22,9);g.fill();
        g.fillColor=new Color(71,69,63);g.rect(-13,4,10,25);g.rect(3,4,10,25);g.fill();
        g.fillColor=new Color(53,85,134);g.roundRect(-23,23,46,48,8);g.fill();
        g.fillColor=new Color(251,217,172);g.circle(0,86,18);g.fill();
        g.fillColor=new Color(240,238,220);g.moveTo(-14,81);g.lineTo(0,63);g.lineTo(14,81);g.close();g.fill();
        g.fillColor=new Color(50,48,45);g.roundRect(-20,100,40,12,5);g.fill();g.circle(-6,88,2);g.circle(6,88,2);g.fill();
        this.text(this.elder,'Ông Đồ',0,139,150,35,22);
        for(let i=0;i<plantingPlots.length;i++){const n=this.make(actors,`PlantPlot-${i}`,64,70),p=toWorld(plantingPlots[i]);n.setPosition(p.x,p.y);n.addComponent(Graphics);this.plots.push(n);}
        const starNode=this.make(actors,'KnowledgeStar',70,70),tree=toWorld({x:8,y:23});starNode.setPosition(tree.x,tree.y+230);this.star=starNode.addComponent(Graphics);
        this.refreshWorld();if(progress.stage==='intro')this.open('elder');
    }
    private make(parent:Node,name:string,width:number,height:number):Node{const n=new Node(name);n.layer=parent.layer;parent.addChild(n);n.addComponent(UITransform).setContentSize(width,height);return n;}
    private text(parent:Node,value:string,x:number,y:number,width=550,height=70,size=26):Node{
        const n=this.make(parent,'Text',width,height);n.setPosition(x,y);const l=n.addComponent(Label);l.string=value;l.fontSize=size;l.lineHeight=size+8;l.enableWrapText=true;l.overflow=Label.Overflow.CLAMP;l.color=new Color(45,68,43);return n;
    }
    private button(id:string,value:string,x:number,y:number,width:number,action:()=>void):void{
        const n=this.make(this.node,id,width,76);n.setPosition(x,y);const g=n.addComponent(Graphics);g.fillColor=new Color(205,229,164);g.roundRect(-width/2,-38,width,76,10);g.fill();
        this.text(n,value,0,0,width-10,76,24);this.buttons.push({node:n,width,height:76,action});
    }
    private changed():void{this.save.save();this.refreshWorld();}
    refreshWorld():void{
        for(let i=0;i<this.plots.length;i++){
            const n=this.plots[i],g=n.getComponent(Graphics)!;g.clear();const planted=this.progress.data.planted.indexOf(i)>=0;
            g.strokeColor=new Color(255,239,145);g.lineWidth=3;g.ellipse(0,0,26,13);g.stroke();
            if(planted){g.strokeColor=new Color(40,121,47);g.lineWidth=5;for(const x of [-8,0,8]){g.moveTo(x,0);g.lineTo(x,35);g.lineTo(x-9,20);g.moveTo(x,30);g.lineTo(x+9,17);}g.stroke();}
            else{g.fillColor=new Color(115,84,51);g.ellipse(0,0,19,8);g.fill();}
        }
        const g=this.star;g.clear();g.fillColor=this.progress.stars?new Color(255,219,78):new Color(136,155,110);
        for(let i=0;i<10;i++){const angle=Math.PI/2+i*Math.PI/5,r=i%2?12:28,x=Math.cos(angle)*r,y=Math.sin(angle)*r;if(i===0)g.moveTo(x,y);else g.lineTo(x,y);}g.close();g.fill();
    }
    select(world:Point):'accepted'|'blocked'|null {
        const p=this.elder.position;
        if(Math.abs(world.x-p.x)<=38&&world.y>=p.y-12&&world.y<=p.y+125){
            return this.approach('elder',elderTile)?'accepted':'blocked';
        }
        const index=this.plots.findIndex(n=>Math.abs(world.x-n.position.x)<26&&Math.abs(world.y-n.position.y)<=12);
        if(index>=0&&this.progress.stage==='plant'){
            if(this.progress.data.planted.indexOf(index)>=0)return 'blocked';
            const goal=plantingPlots[index];if(this.player.goTo(goal)){this.pending={kind:'plot',index,goal};this.destination(goal);return 'accepted';}return 'blocked';
        }
        return null;
    }
    private approach(kind:'elder'|'farmer',tile:Readonly<Point>):boolean{
        const candidates=[{x:tile.x+1,y:tile.y},{x:tile.x-1,y:tile.y},{x:tile.x,y:tile.y-1},{x:tile.x,y:tile.y+1}];
        candidates.sort((a,b)=>{const pa=toWorld(a),pb=toWorld(b);return Math.hypot(pa.x-this.player.position.x,pa.y-this.player.position.y)-Math.hypot(pb.x-this.player.position.x,pb.y-this.player.position.y);});
        for(const goal of candidates)if(this.player.goTo(goal)){this.pending={kind,goal};this.destination(goal);return true;}return false;
    }
    navigateObjective():boolean{
        const stage=this.progress.stage;
        if(stage==='plant'){
            const index=plantingPlots.findIndex((_,i)=>this.progress.data.planted.indexOf(i)<0),goal=plantingPlots[index];
            if(goal&&this.player.goTo(goal)){this.pending={kind:'plot',index,goal};this.destination(goal);return true;}return false;
        }
        const farmer=stage==='meet-farmer'||stage==='count'||this.progress.data.replayRound!==null;
        return this.approach(farmer?'farmer':'elder',farmer?this.player.map.npc:elderTile);
    }
    step():void {
        const target=this.pending;if(!target||this.player.hasPath)return;
        const goal=toWorld(target.goal);if(Math.hypot(goal.x-this.player.position.x,goal.y-this.player.position.y)>=8){this.pending=null;return;}
        this.pending=null;
        if(target.kind==='elder'||target.kind==='farmer')this.open(target.kind);
        else if(this.progress.plant(target.index!))this.changed();
    }
    cancel():void{this.pending=null;this.stopReading();}
    open(speaker:'elder'|'farmer'):void{this.pending=null;this.reset();this.speaker=speaker;this.feedback='';this.node.active=true;this.render();}
    close():void{this.node.active=false;this.stopReading();}
    handle(point:Point):void{
        const p=this.node.getComponent(UITransform)!.convertToNodeSpaceAR(new Vec3(point.x,point.y,0));
        const hit=this.buttons.find(b=>Math.abs(p.x-b.node.position.x)<=b.width/2&&Math.abs(p.y-b.node.position.y)<=b.height/2);hit?.action();
    }
    private stopReading():void{if(typeof window!=='undefined'&&'speechSynthesis' in window)window.speechSynthesis.cancel();}
    private read():void {
        if(typeof window==='undefined'||!('speechSynthesis' in window)){this.feedback='Thiết bị chưa có đọc thoại. Cháu có thể đọc cùng người lớn.';this.render();return;}
        this.stopReading();const voice=window.speechSynthesis.getVoices().find(v=>v.lang.toLowerCase().startsWith('vi'));
        if(!voice){this.feedback='Chưa có giọng tiếng Việt. Lời thoại vẫn hiển thị để đọc cùng nhau.';this.render();return;}
        const utterance=new SpeechSynthesisUtterance(this.spoken);utterance.lang='vi-VN';utterance.voice=voice;utterance.rate=0.85;window.speechSynthesis.speak(utterance);
    }
    private render():void{
        this.stopReading();for(const child of [...this.node.children]){child.active=false;child.destroy();}this.buttons=[];
        const stage=this.progress.stage,replay=this.progress.data.replayRound;
        let body='',action:(()=>void)|undefined,actionText='Tiếp tục';
        const title=stage==='intro'?'NGÀY VỀ LÀNG':this.speaker==='elder'?'ÔNG ĐỒ • CÂY ĐA TRI THỨC':'BÁC NÔNG DÂN';
        this.text(this.node,title,0,225,590,65,26);
        this.button('Close','Đóng',0,-235,150,()=>this.close());
        this.button('Read','Nghe',200,-235,135,()=>this.read());
        this.button('StopRead','Dừng đọc',-200,-235,185,()=>this.stopReading());
        if(stage==='intro'){
            body='Bé về làng nghỉ hè. Cùng dân làng học hỏi để thắp sáng Cây Đa Tri Thức trong câu chuyện nhé!';
            if(this.save.notice)body+='\n'+this.save.notice;
            actionText='Vào làng';action=()=>{this.progress.enterVillage();this.changed();this.close();};
        }else if(this.speaker==='elder'){
            if(stage==='greet'){body='Chào cháu, mừng cháu về làng!\nCháu đến gặp Bác Nông Dân để cùng trồng năm cây lúa và học đếm nhé.';actionText='Cháu chào ông ạ!';action=()=>{this.progress.greet();this.changed();this.close();};}
            else if(stage==='return'){body='Cháu đã trồng năm cây lúa và học đếm. Ngôi sao đầu tiên sẵn sàng sáng rồi!';actionText='Nhận sao đầu tiên';action=()=>{this.progress.turnIn();this.changed();this.render();};}
            else if(stage==='complete'){
                body='★ Sao Tri Thức: 1\nChương 1 hoàn thành! Cây đã sáng thêm một ngôi sao.\nSân Đình mở trong cốt truyện; nội dung Chương 2 đang được xây dựng.';
                if(this.progress.data.legacyDemoBadge)body+='\nHuy hiệu demo cũ của cháu được giữ lại.';
                actionText='Luyện đếm lần nữa';action=()=>{this.progress.startReplay();this.changed();this.speaker='farmer';this.render();};
            }else body='Bác Nông Dân đang chờ cháu ở ruộng. Chạm bác để nghe hướng dẫn nhé!';
        }else if(stage==='greet')body='Cháu đến chào Ông Đồ bên cây đa trước nhé. Bác sẽ đợi cháu ở đây.';
        else if(stage==='meet-farmer'){body='Mình trồng năm cây lúa nhé. Cháu chạm từng ô sáng và đi tới đó để trồng.\nĐây là trò học đếm trên màn hình.';actionText='Cháu sẵn sàng!';action=()=>{this.progress.accept();this.changed();this.close();};}
        else if(stage==='plant')body=`Cháu đã trồng ${this.progress.data.planted.length}/5 cây.\nChạm từng ô sáng chưa có cây. Mỗi ô trồng một cây thôi nhé!`;
        else if(stage==='count'||replay!==null){
            const q=this.lesson.question;
            if(q){
                body=`Có bao nhiêu cây lúa? (${this.lesson.round+1}/3)\nCháu đếm từng cây rồi chọn số nhé.`;
                const n=this.make(this.node,'CountingPlants',1,1),g=n.addComponent(Graphics);g.strokeColor=new Color(48,131,56);g.lineWidth=6;
                for(let i=0;i<q.count;i++){const x=(i-(q.count-1)/2)*65;g.moveTo(x,20);g.lineTo(x,65);g.lineTo(x-15,42);g.moveTo(x,58);g.lineTo(x+15,38);}g.stroke();
                for(let i=0;i<q.choices.length;i++){const answer=q.choices[i];this.button(`Answer-${answer}`,String(answer),(i-1)*165,-75,130,()=>{
                    this.feedback=this.lesson.answer(answer)?'Đúng rồi! Mình cùng xem câu tiếp theo.':'Chưa đúng. Cháu chạm “Gợi ý” để đếm từng cây nhé.';this.changed();this.render();
                });}
                this.button('Hint','Gợi ý',0,0,155,()=>{this.feedback=Array.from({length:q.count},(_,i)=>String(i+1)).join(' → ')+`. Có ${q.count} cây.`;this.render();});
            }else{body='Cháu đã luyện đếm xong. Sao và tiến độ Chương 1 vẫn được giữ nguyên!';actionText='Xong';action=()=>{this.progress.endReplay();this.changed();this.close();};}
        }else if(stage==='return')body='Cháu đã làm xong bài học. Hãy về Ông Đồ bên cây đa để nhận sao nhé!';
        else body='Cháu đã hoàn thành Chương 1! Có thể về Ông Đồ để luyện đếm lần nữa.';
        this.spoken=body+(this.feedback?' '+this.feedback:'');
        const question=this.lesson.question!==null&&this.speaker==='farmer';
        this.text(this.node,body,0,question?140:70,550,question?100:235,question?25:26);
        if(action)this.button('Continue',actionText,0,-100,380,action);
        this.text(this.node,this.feedback,0,-166,575,52,18);
    }
    dispose():void{this.stopReading();}
}
