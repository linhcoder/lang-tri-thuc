export interface Point { x: number; y: number }
export type Terrain = 'grass' | 'road' | 'rice' | 'pond' | 'courtyard';
export const SIZE = 40;
export const farmerTile:Readonly<Point>={x:27,y:22};
export const elderTile:Readonly<Point>={x:17,y:19};
export interface NpcSpawn {id:string;name:string;x:number;y:number;chapter:number;color:[number,number,number]}
export const storyNpcs:NpcSpawn[]=[
    {id:'ti-na',name:'Tí và Na',x:22,y:13,chapter:1,color:[230,129,80]},
    {id:'ba-ban-hang',name:'Bà Bán Hàng',x:25,y:29,chapter:2,color:[175,110,178]},
    {id:'co-giao-lan',name:'Cô Giáo Lan',x:4,y:28,chapter:3,color:[225,131,160]},
    {id:'nghe-nhan-gom',name:'Nghệ Nhân Gốm',x:7,y:28,chapter:4,color:[173,129,82]},
    {id:'co-tam',name:'Cô Tấm',x:27,y:15,chapter:5,color:[98,171,132]},
    {id:'chi-hang-cuoi',name:'Chị Hằng • Chú Cuội',x:33,y:28,chapter:6,color:[141,135,213]},
];
export const villageObjects = [
    {id:'dinh',frame:0,x:19,y:13,width:350,height:210,radius:1},
    {id:'house',frame:1,x:29,y:12,width:260,height:230,radius:1},
    {id:'banyan',frame:2,x:14,y:20,width:490,height:390,radius:1},
    {id:'banana',frame:3,x:14,y:6,width:110,height:145,radius:0},
    {id:'tree-east',frame:2,x:36,y:16,width:150,height:175,radius:0},
    {id:'house-west',frame:1,x:2,y:34,width:230,height:210,radius:1},
];
export const villageDetails=[
    {id:'well',frame:0,x:16,y:26,width:150,height:150,blocked:true},
    {id:'bamboo',frame:1,x:3,y:18,width:145,height:170,blocked:true},
    {id:'bamboo-east',frame:1,x:28,y:9,width:160,height:230,blocked:true},
    {id:'bridge',frame:2,x:13,y:28,width:220,height:115,blocked:false},
    {id:'bridge-west',frame:2,x:3,y:23,width:220,height:115,blocked:false},
    {id:'buffalo',frame:3,x:30,y:20,width:130,height:105,blocked:true},
    {id:'hen',frame:4,x:13,y:18,width:48,height:55,blocked:true},
    {id:'duck',frame:5,x:2,y:24,width:50,height:48,blocked:false},
    {id:'garden',frame:6,x:27,y:27,width:150,height:95,blocked:true},
    {id:'gate-arch',frame:7,x:17,y:32,width:180,height:145,blocked:false},
    {id:'boat',frame:8,x:13,y:25,width:95,height:45,blocked:false},
    {id:'cat',frame:9,x:30,y:12,width:38,height:42,blocked:false},
];
export const villageSolids=[{id:'market',x:23,y:29,radius:1},{id:'courtyard-lantern-left',x:20,y:16,radius:0},{id:'courtyard-lantern-right',x:22,y:17,radius:0},{id:'east-fence',x:34,y:21,radius:0},{id:'foreground-tree',x:35,y:34,radius:0}];
for(const y of [15,16,19,20])villageSolids.push({id:'rice-fence-west-'+y,x:24,y,radius:0});
for(const y of [14,17,20])villageSolids.push({id:'rice-fence-east-'+y,x:35,y,radius:0});
export function bridgeTile(x:number,y:number):boolean{return y===23&&x>=1&&x<=5||y===28&&x>=11&&x<=15;}
export function toWorld(p: Point): Point { return { x: (p.x - p.y) * 32, y: -(p.x + p.y) * 16 }; }
export function toGrid(p: Point): Point { return { x: p.x / 64 - p.y / 32, y: -p.x / 64 - p.y / 32 }; }
export function tileAt(p: Point): Point { const g = toGrid(p); return { x: Math.round(g.x), y: Math.round(g.y) }; }
export function terrain(x: number, y: number): Terrain {
    if (x >= 1 && x <= 5 && y >= 20 && y <= 26) return 'pond';
    if (x >= 11 && x <= 15 && y >= 24 && y <= 30 || x >= 5 && x <= 11 && y >= 24 && y <= 26) return 'pond';
    if (x >= 5 && x <= 13 && y >= 6 && y <= 14) return 'rice';
    if (x >= 25 && x <= 34 && y >= 12 && y <= 20) return 'rice';
    if (x >= 18 && x <= 23 && y >= 16 && y <= 19) return 'courtyard';
    if (x === 15 || x === 16 || y === 20 || y === 21) return 'road';
    return 'grass';
}
export class VillageMap {
    readonly npc: Point = {...farmerTile};
    walkable(x: number, y: number): boolean {
        return Number.isInteger(x) && Number.isInteger(y) && x >= 0 && y >= 0 && x < SIZE && y < SIZE
            && (terrain(x, y) !== 'pond'||bridgeTile(x,y)) && !(x === this.npc.x && y === this.npc.y)
            && !(x===elderTile.x&&y===elderTile.y)
            && !storyNpcs.some(npc=>npc.x===x&&npc.y===y)
            && !villageDetails.some(object=>object.blocked&&object.x===x&&object.y===y)
            && !villageObjects.some(object=>Math.abs(x-object.x)<=object.radius&&Math.abs(y-object.y)<=object.radius)
            && !villageSolids.some(object=>Math.abs(x-object.x)<=object.radius&&Math.abs(y-object.y)<=object.radius);
    }
    canStand(p: Point): boolean {
        // Four samples provide a small physical footprint, rather than a point collider.
        return [-5, 5].every(dx => [-3, 3].every(dy => { const t = tileAt({ x: p.x + dx, y: p.y + dy }); return this.walkable(t.x, t.y); }));
    }
    path(start: Point, goal: Point): Point[] {
        if (!this.walkable(start.x, start.y) || !this.walkable(goal.x, goal.y)) return [];
        const id = (p: Point) => p.y * SIZE + p.x;
        const h = (p: Point) => Math.abs(p.x - goal.x) + Math.abs(p.y - goal.y);
        const open: Point[] = [start], scores = new Map<number, number>([[id(start), 0]]);
        const parent = new Map<number, Point>(), closed = new Set<number>();
        while (open.length) {
            let best = 0;
            for (let i = 1; i < open.length; i++) if (scores.get(id(open[i]))! + h(open[i]) < scores.get(id(open[best]))! + h(open[best])) best = i;
            const current = open.splice(best, 1)[0], key = id(current);
            if (key === id(goal)) {
                const result: Point[] = []; let p = current;
                while (id(p) !== id(start)) { result.push(p); p = parent.get(id(p))!; }
                return result.reverse();
            }
            closed.add(key);
            for (const d of [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }]) {
                const next = { x: current.x + d.x, y: current.y + d.y }, nk = id(next);
                if (!this.walkable(next.x, next.y) || closed.has(nk)) continue;
                const score = scores.get(key)! + 1;
                if (score >= (scores.get(nk) ?? Infinity)) continue;
                if (!scores.has(nk)) open.push(next);
                scores.set(nk, score); parent.set(nk, current);
            }
        }
        return [];
    }
}
export function inputAxis(keys: ReadonlySet<number>): Point {
    let x = Number(keys.has(68) || keys.has(39)) - Number(keys.has(65) || keys.has(37));
    let y = Number(keys.has(87) || keys.has(38)) - Number(keys.has(83) || keys.has(40));
    const length = Math.hypot(x, y); if (length > 1) { x /= length; y /= length; }
    return { x, y };
}
export function direction8(p: Point): number { return (Math.round(Math.atan2(p.y, p.x) / (Math.PI / 4)) + 8) % 8; }
export function cameraOffset(p: Point, width: number, height: number): Point {
    const clamp = (v: number, min: number, max: number) => min > max ? (min + max) / 2 : Math.max(min, Math.min(max, v));
    return { x: -clamp(p.x, -1280 + width / 2, 1280 - width / 2), y: -clamp(p.y, -1280 + height / 2, -height / 2) };
}
