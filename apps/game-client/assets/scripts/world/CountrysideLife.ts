import {Node,Sprite,Label,Color,UITransform} from 'cc';
import {VillageArt} from './VillageArt';
import {VillageMap,Point,toWorld} from './VillageModel';
/** Cosmetic animals use walkable routes, never join authoritative NPC or reward state. */
export class CountrysideLife {
    private walkers:{node:Node;body:Node;route:Point[];index:number;wait:number;phase:number;speed:number}[]=[];
    private rooster?:Node;private call?:Node;private time=0;
    private audio?:AudioContext;private soundEnabled=false;private lastCrow=-1;
    private unlock=()=>{if(!this.soundEnabled||typeof AudioContext==='undefined')return;this.audio??=new AudioContext();void this.audio.resume().catch(()=>{});};
    async create(world:Node,actors:Node,art:VillageArt):Promise<void>{
        await Promise.all(['hills','fields','hay','rooster','dog','cat'].map(id=>art.ensureObject('countryside.'+id,-1)));
        if(!world.isValid||!actors.isValid)return;
        if(typeof window!=='undefined'){window.addEventListener('pointerdown',this.unlock);window.addEventListener('keydown',this.unlock);}
        const place=(id:string,name:string,parent:Node,x:number,y:number,width:number)=>{const frame=art.objectFrame('countryside.'+id,-1);if(!frame)return undefined;const node=art.sprite(parent,name,frame,width,width*frame.rect.height/frame.rect.width*(id==='hills'?.48:id==='fields'?.5:1));node.setPosition(x,y);return node;};
        // Keep the distant band north of the courtyard and the teacher's walking lane.
        for(let i=0;i<5;i++){const hill=place('hills','Countryside-Hills-'+i,world,-2100+i*1000,-340+i%2*20,1100);hill?.setSiblingIndex(actors.getSiblingIndex());}
        for(let i=0;i<8;i++){const field=place('fields','Countryside-Fields-'+i,world,-1950+i*550,-360+i%2*20,650);field?.setSiblingIndex(actors.getSiblingIndex());}
        for(const [i,tile] of [{x:35,y:12},{x:8,y:33},{x:33,y:27}].entries()){const p=toWorld(tile);place('hay','Countryside-Hay-'+i,actors,p.x,p.y,95);}
        const p=toWorld({x:34,y:12});this.rooster=place('rooster','Countryside-Rooster',actors,p.x,p.y,48);
        if(this.rooster){this.call=new Node('RoosterCall');this.call.layer=actors.layer;this.rooster.addChild(this.call);this.call.addComponent(UITransform).setContentSize(120,24);this.call.setPosition(0,80);const label=this.call.addComponent(Label);label.string='Ò ó o…';label.fontSize=16;label.color=new Color(90,64,34);this.call.active=false;}
        const map=new VillageMap();
        for(const [id,start,goals,speed] of [['dog',{x:20,y:25},[{x:25,y:31},{x:29,y:21},{x:20,y:25}],52],['cat',{x:29,y:15},[{x:21,y:16},{x:16,y:21},{x:29,y:15}],40]] as const){
            const route:Point[]=[toWorld(start)];let current:Point=start;
            for(const goal of goals){const segment=map.path(current,goal);if(segment.length){route.push(...segment.map(toWorld));current=goal;}}
            if(route.length<2)continue;const root=new Node('Countryside-'+id);root.layer=actors.layer;actors.addChild(root);root.setPosition(route[0].x,route[0].y);const body=place(id,'AnimalSprite',root,0,0,id==='dog'?58:46);if(body)this.walkers.push({node:root,body,route,index:1,wait:2,phase:0,speed});else root.destroy();
        }
    }
    step(dt:number,people:readonly Point[],sound=false):void{
        this.soundEnabled=sound;
        const delta=Number.isFinite(dt)?Math.max(0,Math.min(.1,dt)):0;this.time+=delta;
        if(this.rooster){const crowing=this.time%22<2;this.rooster.angle=crowing?Math.sin(this.time*9)*3:0;if(this.call)this.call.active=crowing;}
        const cycle=Math.floor(this.time/22);
        if(cycle!==this.lastCrow){this.lastCrow=cycle;if(sound&&this.audio?.state==='running'&&!document.hidden&&this.rooster&&people[0]&&Math.hypot(people[0].x-this.rooster.position.x,people[0].y-this.rooster.position.y)<400){
            // A short, quiet synthesized rooster call, respecting the existing sound setting.
            const context=this.audio;[620,790,680,980].forEach((frequency,index)=>{const oscillator=context.createOscillator(),gain=context.createGain(),start=context.currentTime+index*.22;oscillator.type='triangle';oscillator.frequency.setValueAtTime(frequency,start);oscillator.frequency.exponentialRampToValueAtTime(frequency*.75,start+.2);gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.035,start+.025);gain.gain.exponentialRampToValueAtTime(.001,start+.2);oscillator.connect(gain);gain.connect(context.destination);oscillator.start(start);oscillator.stop(start+.22);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};});
        }}
        for(const animal of this.walkers){const position=animal.node.position;
            if(animal.wait>0||people.some(p=>Math.hypot(p.x-position.x,p.y-position.y)<55)){animal.wait=Math.max(0,animal.wait-delta);animal.body.setPosition(0,0);continue;}
            const target=animal.route[animal.index],dx=target.x-position.x,dy=target.y-position.y,distance=Math.hypot(dx,dy),step=Math.min(distance,animal.speed*delta);
            if(distance>0){animal.node.setPosition(position.x+dx/distance*step,position.y+dy/distance*step);animal.phase+=step*.18;animal.body.setScale(dx<0?-1:1,1,1);animal.body.setPosition(0,Math.abs(Math.sin(animal.phase))*3);animal.body.angle=Math.sin(animal.phase)*2;}
            if(distance<=step+.001){animal.index=(animal.index+1)%animal.route.length;animal.wait=animal.index%5===0?1.5:0;}
        }
    }
    dispose():void{if(typeof window!=='undefined'){window.removeEventListener('pointerdown',this.unlock);window.removeEventListener('keydown',this.unlock);}void this.audio?.close().catch(()=>{});this.walkers=[];this.rooster=undefined;this.call=undefined;}
}
