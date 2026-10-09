import { Node, UITransform, Graphics, Color, Label, Vec3 } from 'cc';
import { LearningProgress, sowSeeds } from '../world/LearningProgress';
import { Point } from '../world/VillageModel';
interface Button {x:number;y:number;width:number;height:number;action:()=>void}
export class LearningPanel {
    readonly node:Node;
    private buttons:Button[]=[];
    private feedback='';
    private addition=false;
    private sowResult:number[]|null=null;
    constructor(parent:Node,readonly progress:LearningProgress,private changed:()=>void){
        this.node=new Node('LearningPanel');this.node.layer=parent.layer;parent.addChild(this.node);this.node.addComponent(UITransform).setContentSize(620,560);
        const g=this.node.addComponent(Graphics);g.fillColor=new Color(255,248,219);g.roundRect(-310,-280,620,560,18);g.fill();this.node.active=false;
    }
    open():void{this.feedback='';this.sowResult=null;this.node.active=true;this.render();}
    close():void{this.node.active=false;}
    handle(point:Point):void{
        const p=this.node.getComponent(UITransform)!.convertToNodeSpaceAR(new Vec3(point.x,point.y,0));
        const hit=this.buttons.find(b=>Math.abs(p.x-b.x)<=b.width/2&&Math.abs(p.y-b.y)<=b.height/2);hit?.action();
    }
    private text(value:string,x:number,y:number,width=560,height=65,size=26):Node{
        const n=new Node('Text');n.layer=this.node.layer;this.node.addChild(n);n.setPosition(x,y);n.addComponent(UITransform).setContentSize(width,height);
        const l=n.addComponent(Label);l.string=value;l.fontSize=size;l.lineHeight=size+8;l.color=new Color(45,68,43);l.overflow=Label.Overflow.CLAMP;l.enableWrapText=true;return n;
    }
    private button(value:string,x:number,y:number,width:number,action:()=>void,height=62):void{
        const n=new Node('ButtonBackground');n.layer=this.node.layer;this.node.addChild(n);n.setPosition(x,y);n.addComponent(UITransform).setContentSize(width,height);
        const g=n.addComponent(Graphics);g.fillColor=new Color(205,229,164);g.roundRect(-width/2,-height/2,width,height,10);g.fill();
        this.text(value,x,y,width-8,height,24);
        this.buttons.push({x,y,width,height,action});
    }
    private render():void{
        for(const child of [...this.node.children]){child.active=false;child.destroy();}this.buttons=[];
        const d=this.progress.data;
        this.text(d.stage==='count'?'ĐẾM HẠT GẠO':d.stage==='sow'||this.sowResult?'Ô ĂN QUAN • LUYỆN RẢI HẠT':d.stage==='complete'?'NGƯỜI BẠN CỦA LÀNG':'BÁC NÔNG DÂN',0,225,580,70,28);
        this.button('Đóng',0,-230,160,()=>this.close(),54);
        if(d.stage==='welcome'){
            this.text('Chào cháu! Cháu giúp bác thu hoạch 3 bó lúa vàng trong ruộng nhé.\nSau đó, mình cùng đếm hạt gạo và học cách rải hạt Ô ăn quan!',0,65,550,210,28);
            this.button('Cháu sẵn sàng!',0,-110,320,()=>{this.progress.accept();this.changed();this.close();});
        }else if(d.stage==='collect'){
            this.text(`Cháu đã thu hoạch ${d.collected.length}/3 bó lúa.\nChạm những bó lúa có vòng sáng trong ruộng. Mang đủ ba bó về, bác sẽ mở bài học cho cháu.`,0,55,550,240,28);
            this.button('Tiếp tục khám phá',0,-120,360,()=>this.close());
        }else if(d.stage==='count')this.countLesson();
        else if(d.stage==='sow'||this.sowResult)this.sowLesson();
        else {
            this.text('★ ★ ★\nGiỏi lắm! Cháu đã thu hoạch lúa, đếm hạt gạo và biết rải hạt từng ô.\nCháu nhận huy hiệu “Người bạn của làng”.',0,50,550,280,28);
            this.button('Chơi bài học lần nữa',0,-130,360,()=>{this.progress.data.countWins=0;this.progress.data.sowWins=0;this.progress.data.stage='count';this.feedback='';this.changed();this.render();});
        }
    }
    private countLesson():void{
        const round=this.progress.data.countWins, expected=this.addition?[5,7,9][round]:[3,5,4][round];
        this.text(`${this.addition?'Cộng hai nhóm hạt':'Có bao nhiêu hạt gạo?'} • ${round+1}/3`,0,150,560,65,26);
        const n=new Node('RiceGrains');n.layer=this.node.layer;this.node.addChild(n);const graphics=n.addComponent(Graphics);
        const split=Math.floor(expected/2);
        for(let i=0;i<expected;i++){const x=this.addition?(i<split?-180+i*43:45+(i-split)*43):(i-(expected-1)/2)*43;graphics.fillColor=new Color(230,172,50);graphics.ellipse(x,55,13,22);graphics.fill();}
        if(this.addition){this.text('+',-40,55,50,55,36);this.text(`${split} + ${Math.ceil(expected/2)} = ?`,0,15,560,50,30);}
        const answers=[expected-1,expected,expected+1];for(let i=0;i<3;i++)this.button(String(answers[i]),(i-1)*160,-85,130,()=>{
            if(this.progress.answerCount(answers[i],expected)){this.feedback=this.progress.data.stage==='count'?'Đúng rồi! Cháu làm rất tốt.':'';this.changed();}else this.feedback='Chưa đúng. Cháu đếm lại nhé!';this.render();
        });
        this.text(this.feedback,0,-155,570,45,22);
        this.button(this.addition?'Đổi sang đếm 1–5':'Đổi sang cộng 1–10',0,-195,340,()=>{this.addition=!this.addition;this.feedback='';this.render();},40);
    }
    private sowLesson():void{
        const result=this.sowResult;
        const round=this.progress.data.sowWins-(result?1:0),start=[1,4,10][round],count=[3,4,5][round],direction=([1,-1,1] as const)[round];
        this.text(result?'Mỗi ô nhận một hạt. Cháu thấy hạt cuối ở đâu?':`Từ ô ${start+1}, rải ${count} hạt theo vòng ${direction===1?'1 → 2 → …':'12 → 11 → …'}.\nChạm ô nhận hạt cuối cùng. (${round+1}/3)`,0,140,570,100,24);
        const centers=[[-180,-25],[-90,-25],[0,-25],[90,-25],[180,-25],[245,25],[180,75],[90,75],[0,75],[-90,75],[-180,75],[-245,25]];
        for(let i=0;i<12;i++){
            const [x,y]=centers[i];this.button(String(i+1),x,y,65,()=>{
                if(this.sowResult)return;
                const sow=sowSeeds(start,count,direction);
                if(this.progress.answerSow(i,sow.last)){this.feedback='Chính xác! Mình cùng xem các hạt đã rải.';this.sowResult=sow.cells;this.changed();}else this.feedback='Mỗi ô nhận một hạt, không bỏ qua ô nào nhé.';this.render();
            },48);
            const seeds=result?result[i]:i===start?count:0;
            if(seeds)this.text('●'.repeat(seeds),x,y-33,80,24,14);
        }
        this.text(this.feedback||'Đây là bài luyện rải hạt, chưa phải trận Ô ăn quan đầy đủ.',0,-120,570,85,22);
        if(result)this.button(this.progress.data.stage==='complete'?'Nhận huy hiệu':'Bài tiếp theo',0,-185,250,()=>{this.sowResult=null;this.feedback='';this.render();},48);
    }
}
