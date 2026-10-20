import {Color,Graphics} from 'cc';
import {HouseId} from '../world/HouseTasks';
import {toWorld} from '../world/VillageModel';
export function paintHouseItem(g:Graphics,symbol:string,size=36):void{
 const k=size/40,rect=(x:number,y:number,w:number,h:number,c:string)=>{g.fillColor=new Color(c);g.roundRect(x*k,y*k,w*k,h*k,3*k);g.fill();},circle=(x:number,y:number,r:number,c:string)=>{g.fillColor=new Color(c);g.circle(x*k,y*k,r*k);g.fill();};
 const line=(x:number,y:number,a:number,b:number,c:string,width=3)=>{g.strokeColor=new Color(c);g.lineWidth=width*k;g.moveTo(x*k,y*k);g.lineTo(a*k,b*k);g.stroke();};
 if(symbol.startsWith('level-')){
  const level=Number(symbol.slice(6)),index=level/10-1;
  // Each milestone has its own silhouette; the level number remains a caption.
  if(index===0){line(-12,-20,-12,24,'#835f3b',3);g.fillColor=new Color('#da7253');g.moveTo(-12*k,24*k);g.lineTo(22*k,16*k);g.lineTo(-12*k,7*k);g.close();g.fill();}
  else if(index===1){rect(-22,-17,44,34,'#548e89');for(const y of [-8,0,8])line(-14,y,14,y,'#fff1cf',2);}
  else if(index===2){rect(-22,-18,44,25,'#bf955c');for(const x of [-12,0,12])circle(x,10,8,'#d19366');}
  else if(index===3){rect(-24,-15,48,30,'#e1c392');for(let i=0;i<5;i++)rect(-24+i*10,14,9,9,i%2?'#db6556':'#f4dcaa');}
  else if(index===4){circle(0,3,21,'#e8b635');circle(0,3,13,'#bd7d48');line(-10,-15,-15,-28,'#db6556',7);line(10,-15,15,-28,'#568dcc',7);}
  else if(index===5){line(0,-24,0,22,'#835f3b');for(const [x,y]of [[-10,0],[10,8],[-8,16]])circle(x,y,11,'#68a34c');}
  else if(index===6){rect(-22,-17,44,10,'#987047');line(0,-7,0,26,'#835f3b');g.fillColor=new Color('#f4dcaa');g.moveTo(2*k,23*k);g.lineTo(21*k,-5*k);g.lineTo(2*k,-5*k);g.close();g.fill();}
  else if(index===7){circle(0,0,10,'#e8b635');for(let i=0;i<5;i++){const a=i*Math.PI*2/5;line(Math.cos(a)*12,Math.sin(a)*12,Math.cos(a)*25,Math.sin(a)*25,'#e8b635',5);}}
  else if(index===8){rect(-22,-18,44,36,'#db6556');for(const y of [-14,14])line(-24,y,24,y,'#e8b635',5);line(-12,-12,12,12,'#f4dcaa',2);line(-12,12,12,-12,'#f4dcaa',2);}
  else{g.fillColor=new Color('#e8b635');g.moveTo(-22*k,-15*k);g.lineTo(-25*k,20*k);g.lineTo(-10*k,7*k);g.lineTo(0,26*k);g.lineTo(10*k,7*k);g.lineTo(25*k,20*k);g.lineTo(22*k,-15*k);g.close();g.fill();circle(0,-2,5,'#db6556');}return;
 }
 if(symbol==='pencil'){line(-8,-18,8,18,'#d2a344',8);line(8,18,11,25,'#806246',4);line(-10,-22,-7,-16,'#bd7b78',8);return;}
 if(symbol==='single-seed'){g.fillColor=new Color('#9e6738');g.ellipse(0,0,9*k,15*k);g.fill();line(-3,-6,3,6,'#c69560',2);return;}
 if(symbol.includes('book')||symbol==='paper'||symbol==='card'){rect(-17,-20,34,40,symbol==='math-book'?'#dfae58':symbol==='picture-book'?'#cf8174':'#548e89');rect(-12,-15,25,30,'#fff1cf');line(-8,9,8,9,'#8d754f',2);line(-8,2,8,2,'#8d754f',2);if(symbol==='tree-book'){line(0,-10,0,2,'#835f3b');circle(0,5,9,'#619451');}else if(symbol==='fish-book'){circle(0,-5,7,'#6ba8c3');}else{line(-5,-8,0,6,'#597f84');line(0,6,5,-8,'#597f84');line(-3,-3,3,-3,'#597f84');}return;}
 if(['leaf','plant','tree','seed-planter'].includes(symbol)){rect(-12,-20,24,15,'#bf8052');line(0,-8,0,19,'#4f8047');circle(-7,6,8,'#6fa05d');circle(8,13,9,'#83b66c');return;}
 if(symbol==='seed'){rect(-18,-19,36,32,'#d9b579');for(const [x,y]of [[-8,-6],[6,2],[-6,8],[9,-9]]){g.fillColor=new Color('#9e6738');g.ellipse(x*k,y*k,4*k,6*k);g.fill();}return;}
 if(symbol==='soil'){rect(-22,-15,44,25,'#956640');rect(-18,-10,36,17,'#654d35');for(const x of [-12,0,12])circle(x,-1,2,'#dcba74');return;}
 if(symbol==='water'){rect(-17,-14,29,27,'#649da3');line(10,-2,24,15,'#649da3',7);g.strokeColor=new Color('#649da3');g.lineWidth=4*k;g.circle(-18*k,6*k,9*k);g.stroke();return;}
 if(symbol==='bowl'||symbol==='colander'){rect(-21,-12,42,23,symbol==='bowl'?'#f5e5bc':'#80a798');g.fillColor=new Color('#b2c5bd');g.ellipse(0,10*k,21*k,7*k);g.fill();if(symbol==='colander')for(const x of [-12,0,12])circle(x,-2,2,'#4e7c6a');return;}
 if(['vase','painted-vase','clay','wheel'].includes(symbol)){if(symbol==='wheel'){g.fillColor=new Color('#738b94');g.ellipse(0,-6*k,25*k,12*k);g.fill();rect(-4,-24,8,15,'#745a43');}rect(-10,4,20,15,symbol==='clay'?'#ae7853':'#b66c4e');g.fillColor=new Color(symbol==='clay'?'#ae7853':'#c9845b');g.ellipse(0,-5*k,18*k,18*k);g.fill();if(symbol!=='clay'){line(-12,-4,12,-4,'#edce83',4);circle(0,-11,3,'#6d9999');}return;}
 if(symbol==='paint'||symbol==='red'||symbol==='green'||symbol==='yellow'){circle(0,0,19,symbol==='red'?'#c65c4d':symbol==='green'?'#729751':symbol==='yellow'?'#e6bd4e':'#e6d7a7');if(symbol==='paint')for(const [x,y,c]of [[-9,7,'#c65c4d'],[9,7,'#729751'],[0,-10,'#638fba']] as const)circle(x,y,6,c);return;}
 if(symbol==='pens'||symbol==='cup'){rect(-14,-18,28,23,'#ca9c64');for(const [i,c]of ['#c65c4d','#608eae','#769957'].entries())line(-9+i*9,-5,-12+i*10,22,c,5);return;}
 if(symbol==='shelf'){rect(-24,-22,48,45,'#94704a');rect(-20,-17,40,33,'#533e2e');for(let i=0;i<5;i++)rect(-17+i*7,-12,5,25,['#789d93','#ce927a','#e0c279'][i%3]);return;}
 if(symbol==='basket'||symbol==='flower-basket'){rect(-21,-18,42,29,'#bf955c');for(const x of [-14,-5,5,14])line(x,-15,x,7,'#8e6c40',1);if(symbol==='flower-basket')for(const x of [-12,0,12]){line(x,8,x,21,'#5c8450',2);circle(x,22,7,'#d7918a');circle(x,22,3,'#f1cb68');}return;}
 if(symbol==='tidy-mat'){rect(-25,-15,50,30,'#b96d58');rect(-20,-10,40,20,'#edd7a4');line(-14,0,14,0,'#b96d58',3);return;}
 if(symbol==='reading-lamp'){rect(-15,-22,30,5,'#9f7a4c');line(0,-19,0,9,'#957452',4);g.fillColor=new Color('#e4be68');g.moveTo(-20*k,6*k);g.lineTo(20*k,6*k);g.lineTo(12*k,25*k);g.lineTo(-12*k,25*k);g.close();g.fill();return;}
 if(symbol==='table'||symbol==='chair'){rect(-23,0,46,12,'#b38959');line(-17,-19,-17,0,'#85613f',5);line(17,-19,17,0,'#85613f',5);return;}
 if(symbol==='ball'){circle(0,0,20,'#d19366');line(-18,-9,18,9,'#fff0c7',3);return;}
 if(symbol==='quiet'){circle(0,8,13,'#e4b987');line(0,-18,0,9,'#fff0cf',5);return;}
 if(symbol==='wash'){rect(-21,-16,42,12,'#78aaa9');line(0,-2,0,20,'#80bdd0',4);circle(-10,-1,5,'#ecc5a0');circle(10,-1,5,'#ecc5a0');return;}
 circle(0,0,17,symbol==='stone'?'#a6a49a':'#c8ab7c');
}
export function paintHouseRoom(g:Graphics,id:HouseId,wall:string):void{
 g.clear();const poly=(points:number[][],color:string)=>{g.fillColor=new Color(color);g.moveTo(points[0][0],points[0][1]);points.slice(1).forEach(p=>g.lineTo(p[0],p[1]));g.close();g.fill();};
 poly([[-256,-144],[0,-16],[0,64],[-256,-64]],id==='pottery'?'#c99d7d':id==='farm'?'#aeb48a':'#c6ab83');poly([[0,-16],[320,-176],[320,-96],[0,64]],wall);
 poly([[-205,-102],[-125,-62],[-125,-7],[-205,-47]],'#91b7b1');g.strokeColor=new Color('#f7e6bd');g.lineWidth=5;g.moveTo(-165,-82);g.lineTo(-165,-27);g.stroke();
 if(id==='home'||id==='books'){poly([[-212,-105],[-195,-96],[-195,-36],[-212,-44]],id==='home'?'#b37b70':'#83a39a');poly([[-135,-67],[-118,-59],[-118,0],[-135,-8]],id==='home'?'#b37b70':'#83a39a');}
 for(let x=1;x<=10;x++)for(let y=1;y<=8;y++){const p=toWorld({x,y}),c=id==='pottery'?((x+y)%2?'#d4b9a1':'#c6a98f'):id==='farm'?((x+y)%2?'#d8c9a0':'#cdbb90'):((x+y)%2?'#e6cfa6':'#ddc092');poly([[p.x,p.y+16],[p.x+32,p.y],[p.x,p.y-16],[p.x-32,p.y]],c);}
 // Floor fascia and inset seams give the room depth without adding obstacles.
 poly([[-256,-144],[64,-304],[64,-316],[-256,-156]],'#9a704e');
 poly([[64,-304],[320,-176],[320,-188],[64,-316]],'#795b43');
 for(let x=1;x<=10;x++)for(let y=1;y<=8;y++){
  const p=toWorld({x,y});g.strokeColor=new Color('#b79b7866');g.lineWidth=1;
  g.moveTo(p.x-30,p.y);g.lineTo(p.x,p.y-15);g.lineTo(p.x+30,p.y);g.stroke();
 }
 // A fitted wooden window frame, sky and a soft diagonal patch of daylight.
 poly([[-210,-107],[-120,-62],[-120,1],[-210,-44]],'#805f45');
 poly([[-202,-99],[-128,-62],[-128,-10],[-202,-47]],'#b8d9d0');
 poly([[-202,-78],[-128,-41],[-128,-10],[-202,-47]],'#d8e9ce');
 for(const offset of [0,37]){g.strokeColor=new Color('#fff0cc');g.lineWidth=4;g.moveTo(-202+offset,-99+offset/2);g.lineTo(-202+offset,-47+offset/2);g.stroke();}
 poly([[-213,-108],[-119,-61],[-112,-65],[-206,-112]],'#e6c397');
 poly([[-158,-136],[-84,-99],[24,-153],[-50,-190]],'#fff1c72b');
 const rug=({home:'#ab7563',tam:'#bc985f',farm:'#819369',pottery:'#b67c62',books:'#6c9690'} as const)[id];
 poly([[-48,-128],[80,-192],[16,-224],[-112,-160]],rug);
 poly([[-48,-136],[64,-192],[16,-216],[-96,-160]],'#e9d4a6');
 poly([[-48,-143],[50,-192],[16,-209],[-82,-160]],rug);
 for(let i=0;i<7;i++){g.strokeColor=new Color('#f4dfb4');g.lineWidth=2;g.moveTo(-104+i*18,-164-i*9);g.lineTo(-111+i*18,-168-i*9);g.stroke();}
 if(id==='tam'){for(let i=0;i<5;i++){g.strokeColor=new Color('#af8359');g.lineWidth=4;g.moveTo(45+i*36,27-i*18);g.lineTo(45+i*36,10-i*18);g.stroke();g.fillColor=new Color('#f2e0bd');g.circle(45+i*36,3-i*18,9);g.fill();}}
 if(id==='pottery'){for(let i=0;i<5;i++){g.fillColor=new Color('#b47855');g.ellipse(60+i*32,7-i*16,9,12);g.fill();}}
 if(id==='farm'){for(let i=0;i<4;i++){g.fillColor=new Color('#d1ad68');g.roundRect(50+i*39,7-i*19,25,32,3);g.fill();g.fillColor=new Color('#6d8c50');g.circle(62+i*39,22-i*19,5);g.fill();}}
 if(id==='books'){for(let i=0;i<9;i++){g.fillColor=new Color(['#799b92','#c99478','#cfb66e'][i%3]);g.roundRect(50+i*22,8-i*11,16,34,2);g.fill();}}
}
export function paintStation(g:Graphics,house:HouseId,index:number,done:boolean,highlight:boolean,painted=false):void{
 g.clear();
 g.fillColor=new Color('#33291e35');g.ellipse(3,-20,44,14);g.fill();
 if(highlight){g.strokeColor=new Color('#ffe5a0');g.lineWidth=3;g.ellipse(0,-19,49,21);g.stroke();}
 if(!painted){
 g.strokeColor=new Color('#79563c');g.lineWidth=7;g.moveTo(-28,-2);g.lineTo(-28,-20);g.moveTo(28,-2);g.lineTo(28,-20);g.stroke();
 g.fillColor=new Color('#8b6346');g.ellipse(0,-4,43,19);g.fill();
 g.fillColor=new Color(highlight?'#e0c17f':house==='farm'?'#b2a071':house==='pottery'?'#c89b79':'#cba677');g.ellipse(0,2,43,19);g.fill();
 g.strokeColor=new Color('#f3d5a0');g.lineWidth=2;g.moveTo(-30,9);g.lineTo(-6,17);g.lineTo(23,12);g.stroke();
 }
 const symbols:Record<HouseId,string[]>={home:['table','basket','shelf','pens'],tam:['table','leaf','colander','bowl'],farm:['soil','seed','soil','water'],pottery:['vase','clay','wheel','paint'],books:['book','basket','shelf','card']};
 let symbol=symbols[house][index];
 if(done&&(index===1||index===3))symbol='basket';
 if(done&&index===2)symbol=({home:'book',tam:'leaf',farm:'plant',pottery:'vase',books:'tree-book'} as const)[house];
 if(done&&index===0)symbol=({home:'pens',tam:'bowl',farm:'plant',pottery:'painted-vase',books:'tree-book'} as const)[house];
 // Painted sources already show their contents; collected items leave an empty
 // surface and a completion mark instead of a second basket pasted on the art.
 if(!painted||(!done||index!==1&&index!==3)&&symbol!=='table')paintHouseItem(g,symbol,painted?27:36);
 if(done){g.strokeColor=new Color('#5e8b54');g.lineWidth=4;g.moveTo(25,9);g.lineTo(31,3);g.lineTo(42,17);g.stroke();}
}
