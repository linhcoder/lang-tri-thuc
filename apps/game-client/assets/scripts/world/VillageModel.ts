export interface Point { x: number; y: number }
export type Terrain = 'grass' | 'road' | 'rice' | 'pond' | 'courtyard';
export const SIZE = 40;
export function toWorld(p: Point): Point { return { x: (p.x - p.y) * 32, y: -(p.x + p.y) * 16 }; }
export function toGrid(p: Point): Point { return { x: p.x / 64 - p.y / 32, y: -p.x / 64 - p.y / 32 }; }
export function tileAt(p: Point): Point { const g = toGrid(p); return { x: Math.round(g.x), y: Math.round(g.y) }; }
export function terrain(x: number, y: number): Terrain {
    if (x >= 25 && x <= 32 && y >= 8 && y <= 15) return 'pond';
    if (x >= 5 && x <= 13 && y >= 6 && y <= 14) return 'rice';
    if (x >= 17 && x <= 23 && y >= 17 && y <= 23) return 'courtyard';
    if (x === 15 || x === 16 || y === 20 || y === 21) return 'road';
    return 'grass';
}
export class VillageMap {
    readonly npc: Point = { x: 14, y: 10 };
    walkable(x: number, y: number): boolean {
        return Number.isInteger(x) && Number.isInteger(y) && x >= 0 && y >= 0 && x < SIZE && y < SIZE
            && terrain(x, y) !== 'pond' && !(x === this.npc.x && y === this.npc.y);
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
