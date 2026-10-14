/** Code-drawn variants and fallback for the approved painted red-star boy. */
import {isRedStarBoy} from './RedStarBoy';
export const avatarNames=['Bé trai • áo đỏ sao vàng','Bé trai • áo xanh–trắng','Bé gái • áo hồng','Bé gái • áo vàng','Bé trai • áo lá','Bé gái • áo tím'];
export const skinNames=['Da sáng','Da ấm','Da nâu'];
const skins=['#f4cba1','#dca478','#98613f'],clothes=['#d95851','#528eca','#e783a2','#eabf49','#6c9d59','#a58ac3'];
export function paintCharacter(c:CanvasRenderingContext2D,id:number,row:number,direction:number,hair=0,skin=0,phase?:number,age?:'3-5'|'6-8'|'9-11'):void{
    const redStar=isRedStarBoy(id,age);
    const female=id===2||id===3||id===5,back=direction===1||direction===2||direction===3,side=direction===0||direction===4;
    const stride=phase===undefined?(row===0?0:row===1?5:-5):Math.sin(phase*Math.PI*2)*5,bob=phase===undefined?(row===0?0:2):(1-Math.cos(phase*Math.PI*4));
    c.save();c.translate(48,(age==='9-11'?120:112)-bob);if(age==='3-5'){c.scale(.86,.86);}else if(age==='9-11'){c.scale(.92,1.03);}c.lineCap='round';c.lineJoin='round';
    const ellipse=(x:number,y:number,rx:number,ry:number,color:string)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();};
    ellipse(0,0,21,5,'rgba(38,62,39,.18)');
    c.strokeStyle='#42506b';c.lineWidth=10;for(const sign of [-1,1]){c.beginPath();c.moveTo(sign*8,-29);c.lineTo(sign*9+sign*stride*.5,-8-sign*stride*.3);c.stroke();ellipse(sign*10+sign*stride*.5,-5-sign*stride*.3,8,5,'#654d3d');}
    c.fillStyle=redStar?'#e52d29':clothes[id]??clothes[0];c.beginPath();c.moveTo(-15,-65);c.quadraticCurveTo(0,-73,15,-65);c.lineTo(female?20:16,-28);c.quadraticCurveTo(0,-23,female?-20:-16,-28);c.closePath();c.fill();
    c.strokeStyle=skins[skin]??skins[0];c.lineWidth=8;for(const sign of [-1,1]){c.beginPath();c.moveTo(sign*17,-59);c.lineTo(sign*(22+stride*.3),-37+sign*stride);c.stroke();}
    if(!redStar&&(age==='6-8'||age==='9-11')){ellipse(0,-46,13,18,'#f3eee1');c.fillStyle='#d74444';c.beginPath();c.moveTo(-10,-65);c.lineTo(10,-65);c.lineTo(0,-49);c.closePath();c.fill();}
    if(redStar&&!back){c.fillStyle='#ffdf32';c.beginPath();for(let i=0;i<10;i++){const angle=-Math.PI/2+i*Math.PI/5,r=i%2?4:10,x=Math.cos(angle)*r*(side?.45:1),y=-47+Math.sin(angle)*r;if(i)c.lineTo(x,y);else c.moveTo(x,y);}c.closePath();c.fill();}
    ellipse(0,-82,23,age==='9-11'?22:25,'#392d27');if(female||hair===2)for(const sign of [-1,1])ellipse(sign*23,-73,7,hair===2?15:10,'#392d27');
    ellipse(0,-78,19,21,skins[skin]??skins[0]);
    c.fillStyle='#392d27';c.beginPath();c.moveTo(-20,-82);c.quadraticCurveTo(-22,-109,0,-107);c.quadraticCurveTo(23,-105,21,-82);c.quadraticCurveTo(6,hair===1?-94:-90,-20,-82);c.fill();
    if(back)ellipse(0,-81,20,24,'#392d27');else{const offset=side?(direction===0?7:-7):0;ellipse(offset-6,-79,2,3,'#3b2b25');if(!side)ellipse(6,-79,2,3,'#3b2b25');ellipse(offset-10,-72,3,2,'#dd8e7b');c.strokeStyle='#ad6552';c.lineWidth=1.5;c.beginPath();c.arc(offset,-73,5,.2,Math.PI-.2);c.stroke();}
    if(female){ellipse(20,-91,5,4,'#f3c967');ellipse(26,-91,5,4,'#f3c967');}else if(hair===2)ellipse(0,-110,9,6,'#392d27');
    if(!redStar){c.fillStyle='#ffe7a5';c.beginPath();c.moveTo(0,-57);c.lineTo(3,-52);c.lineTo(0,-47);c.lineTo(-3,-52);c.closePath();c.fill();}c.restore();
}
