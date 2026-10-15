import pack from './SceneLayoutPack';
export interface LayoutPlacement {id:string;x:number;y:number;width:number;height:number}
export interface LayoutPack {version:1;placements:LayoutPlacement[]}
export const layoutOverrides:readonly LayoutPlacement[]=pack.placements;
export function layoutPlacement<T extends LayoutPlacement>(base:T):T {
    const override=layoutOverrides.find(p=>p.id===base.id);
    return override?{...base,...override}:base;
}
