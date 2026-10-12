import {ImageAsset,Texture2D,SpriteFrame,Rect,Sprite,Node,UITransform,Color} from 'cc';
let texture:Texture2D|undefined;const frames=new Map<string,SpriteFrame>();
function picture():Texture2D{
    if(texture)return texture;
    const canvas=document.createElement('canvas');canvas.width=450;canvas.height=450;
    const g=canvas.getContext('2d')!;g.fillStyle='#fff0c4';g.fillRect(0,0,450,450);
    const oval=(x:number,y:number,rx:number,ry:number,color:string)=>{g.fillStyle=color;g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fill();};
    const line=(points:number[][],color='#66412e',width=5)=>{g.strokeStyle=color;g.lineWidth=width;g.lineCap='round';g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.stroke();};
    g.fillStyle='#ebd8a2';g.fillRect(0,385,450,65);line([[0,385],[450,385]],'#c8ad6a',3);
    // A square original illustration, drawn without stretching any animal or flower.
    for(const [x,y] of [[52,75],[387,270]]){line([[x,365],[x,y+35]],'#698559',6);for(let i=0;i<3;i++){oval(x-15,y+65+i*55,22,10,'#6d9660');oval(x+15,y+90+i*45,22,10,'#83a86c');}for(let i=0;i<7;i++){const a=i*Math.PI*2/7;oval(x+Math.cos(a)*24,y+Math.sin(a)*24,15,15,'#d85b43');}oval(x,y,15,15,'#edbe52');}
    for(const [x,y] of [[108,286],[100,238],[117,194]]){oval(x,y,58,17,'#397965');line([[x-42,y],[x+25,y]],'#275e50',3);}
    oval(218,274,86,68,'#d7a146');oval(217,280,57,43,'#bd543b');oval(221,277,33,27,'#668960');oval(225,279,16,14,'#f6ce68');
    oval(285,226,29,70,'#dda849');oval(302,153,37,32,'#dda849');for(const [x,y] of [[280,123],[298,115],[316,122]])oval(x,y,13,17,'#c84636');oval(323,183,10,21,'#c84636');
    g.fillStyle='#795132';g.beginPath();g.moveTo(334,145);g.lineTo(365,159);g.lineTo(335,170);g.fill();oval(316,145,6,6,'#342a22');oval(317,143,2,2,'#fff8db');
    for(const x of [193,240]){line([[x,327],[x-5,375],[x-22,389]]);line([[x-5,375],[x+13,387]]);}
    for(const [x,y] of [[154,91],[232,64],[350,78]]){oval(x,y,6,6,'#d7a146');line([[x-11,y],[x+11,y]],'#d7a146',2);line([[x,y-11],[x,y+11]],'#d7a146',2);}
    texture=new Texture2D();texture.image=new ImageAsset(canvas);return texture;
}
/** Original rooster and flowers; a historical print is not reproduced. */
export function folkPuzzlePiece(parent:Node,piece:number,cols:number,rows:number,width:number,height:number,ghost=false):void{
    if(typeof document==='undefined')return;const key=`${cols}:${rows}:${piece}`;let frame=frames.get(key);
    if(!frame){frame=new SpriteFrame();frame.texture=picture();frame.rect=new Rect(piece%cols*450/cols,Math.floor(piece/cols)*450/rows,450/cols,450/rows);frames.set(key,frame);}
    const n=new Node('FolkPicturePiece');n.layer=parent.layer;parent.addChild(n);n.addComponent(UITransform).setContentSize(width,height);const sprite=n.addComponent(Sprite);sprite.sizeMode=Sprite.SizeMode.CUSTOM;sprite.spriteFrame=frame;if(ghost)sprite.color=new Color(255,255,255,85);
}
export function folkPuzzleReference(parent:Node,size=110):void{folkPuzzlePiece(parent,0,1,1,size,size);}
/** Legacy callers use the old 3x3 crop until a saved board migrates. */
export function folkPuzzleTile(parent:Node,tile:number,width=98,height=98):void{if(tile!==8)folkPuzzlePiece(parent,tile,3,3,width,height);}
export function disposeFolkPuzzleArt():void{for(const frame of frames.values())frame.destroy();frames.clear();texture?.destroy();texture=undefined;}
