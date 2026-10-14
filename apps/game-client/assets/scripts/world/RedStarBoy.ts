/** Approved portrait and atlas: E, NE, N, NW, W, SW, S, SE; idle and two steps. */
export const redStarBoyAtlas='characters/boy-red-star-6-8-v1.png';
// The generated atlas has unequal row heights; use its measured clear gutters.
export const redStarBoyRows=[0,319/887,602/887,1];
export function isRedStarBoy(id:number,age?:string):boolean{return id===0&&age!==undefined;}
export function redStarBoyUrl():string{return new URL(redStarBoyAtlas,document.baseURI).href;}
export function redStarBoyPreview():string{
    const x=6*1774/8;
    return `<svg viewBox="${x} 0 ${1774/8} 319" width="100" height="140"><image href="${redStarBoyUrl()}" width="1774" height="887"/></svg>`;
}

/** Authored character artwork, independent of the student's lesson age band. */
export function characterAsset(id:number):{atlas:string;rows:number[];name:string}|undefined{
    if(id===0)return {atlas:redStarBoyAtlas,rows:redStarBoyRows,name:'Áo đỏ sao vàng'};
    if(id===1)return {atlas:'characters/boy-blue-white-8-10-v1.png',rows:[0,300/887,594/887,1],name:'Áo xanh–trắng'};
    return undefined;
}
export function characterAssetPreview(id:number):string{
    const asset=characterAsset(id);if(!asset)return '';
    const x=6*1774/8,height=asset.rows[1]*887;
    return `<svg viewBox="${x} 0 ${1774/8} ${height}" width="100" height="140"><image href="${new URL(asset.atlas,document.baseURI).href}" width="1774" height="887"/></svg>`;
}
