import {ImageAsset,Texture2D,SpriteFrame,Rect,Sprite,Node,UITransform} from 'cc';
let texture:Texture2D|undefined;const frames=new Map<number,SpriteFrame>();
function picture():Texture2D{
    if(texture)return texture;
    const canvas=document.createElement('canvas');canvas.width=450;canvas.height=210;
    const g=canvas.getContext('2d')!;g.fillStyle='#fff0c4';g.fillRect(0,0,450,210);
    const oval=(x:number,y:number,rx:number,ry:number,color:string)=>{g.fillStyle=color;g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fill();};
    g.strokeStyle='#633f27';g.lineWidth=5;g.lineCap='round';
    for(const x of [65,385]){g.beginPath();g.moveTo(x,190);g.lineTo(x,70);g.stroke();for(const y of [95,130,160]){oval(x-13,y,18,7,'#619653');oval(x+13,y-10,18,7,'#619653');}for(let i=0;i<6;i++){const a=i*Math.PI/3;oval(x+Math.cos(a)*15,55+Math.sin(a)*15,11,9,'#bd4439');}oval(x,55,9,9,'#e4b436');}
    for(const [x,y] of [[140,150],[132,123],[145,96]]){oval(x,y,47,13,'#427964');g.strokeStyle='#633f27';g.beginPath();g.moveTo(x-35,y);g.lineTo(x+35,y);g.stroke();}
    oval(222,127,67,43,'#d6a344');oval(229,130,39,25,'#ad4131');oval(228,130,20,15,'#4e7861');
    oval(276,94,22,44,'#d6a344');oval(289,60,26,23,'#d6a344');
    for(const x of [274,287,300])oval(x,36,9,12,'#bd4439');oval(304,83,7,13,'#bd4439');
    g.fillStyle='#633f27';g.beginPath();g.moveTo(309,54);g.lineTo(334,64);g.lineTo(309,70);g.fill();oval(298,56,4,4,'#342a22');
    g.strokeStyle='#633f27';for(const x of [205,245]){g.beginPath();g.moveTo(x,160);g.lineTo(x-5,189);g.lineTo(x-18,195);g.moveTo(x-5,189);g.lineTo(x+8,195);g.stroke();}
    texture=new Texture2D();texture.image=new ImageAsset(canvas);return texture;
}
/** Original rooster-and-flower illustration; no historical print is reproduced. */
export function folkPuzzleTile(parent:Node,tile:number,width=151,height=62):void{
    if(tile===8||typeof document==='undefined')return;
    let frame=frames.get(tile);if(!frame){frame=new SpriteFrame();frame.texture=picture();frame.rect=new Rect(tile%3*150,Math.floor(tile/3)*70,150,70);frames.set(tile,frame);}
    const n=new Node('FolkPicturePiece');n.layer=parent.layer;parent.addChild(n);n.addComponent(UITransform).setContentSize(width,height);const sprite=n.addComponent(Sprite);sprite.sizeMode=Sprite.SizeMode.CUSTOM;sprite.spriteFrame=frame;
}
