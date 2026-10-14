/** Approved portrait and atlas: E, NE, N, NW, W, SW, S, SE; idle and two steps. */
export const redStarBoyAtlas='characters/boy-red-star-6-8-v1.png';
// The generated atlas has unequal row heights; use its measured clear gutters.
export const redStarBoyRows=[0,319/887,602/887,1];
export function isRedStarBoy(id:number,age?:string):boolean{return id===0&&age==='6-8';}
export function redStarBoyUrl():string{return new URL(redStarBoyAtlas,document.baseURI).href;}
export function redStarBoyPreview():string{
    const x=6*1774/8;
    return `<svg viewBox="${x} 0 ${1774/8} 319" width="100" height="140"><image href="${redStarBoyUrl()}" width="1774" height="887"/></svg>`;
}
