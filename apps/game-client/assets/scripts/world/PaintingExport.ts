import {PaintStroke,paintColors,restorePainting} from './VillageActivities';

/** Export the saved drawing without capturing game controls or the player's profile. */
export function paintingPng(strokes:PaintStroke[]):string{
    const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=500;
    const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas unavailable');
    ctx.fillStyle='#fffbe7';ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.translate(540,250);ctx.scale(2,-2);ctx.lineWidth=7;ctx.lineCap='round';ctx.lineJoin='round';
    for(const stroke of restorePainting(strokes)){
        ctx.fillStyle=ctx.strokeStyle=`rgb(${paintColors[stroke.color].join(',')})`;
        const first=stroke.points[0];ctx.beginPath();ctx.arc(first.x,first.y,3.5,0,Math.PI*2);ctx.fill();
        if(stroke.points.length>1){ctx.beginPath();ctx.moveTo(first.x,first.y);for(const p of stroke.points.slice(1))ctx.lineTo(p.x,p.y);ctx.stroke();}
    }
    return canvas.toDataURL('image/png');
}

export function downloadPainting(strokes:PaintStroke[]):void{
    const link=document.createElement('a');link.href=paintingPng(strokes);link.download='tranh-lang-tri-thuc.png';
    document.body.appendChild(link);try{link.click();}finally{link.remove();}
}
