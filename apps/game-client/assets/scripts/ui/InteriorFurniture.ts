import {Rect,resources,SpriteFrame,Texture2D} from 'cc';
import {HouseId} from '../world/HouseTasks';

/** One optional atlas; a failed download leaves the procedural furniture playable. */
export class InteriorFurniture {
 private frames:SpriteFrame[]=[];
 private loading?:Promise<void>;
 load():Promise<void>{
  return this.loading??=new Promise(resolve=>resources.load('village/interior-furniture-v1/texture',Texture2D,(error,texture)=>{
   if(!error){
    // Measured gutters in the generated atlas; no resampling or alpha removal.
    const columns=[0,.277,.5,.75,1],rows=[0,.214,.4,.585,.78,1];
    for(let row=0;row<5;row++)for(let column=0;column<4;column++){
     const x=Math.round(columns[column]*texture.width),y=Math.round(rows[row]*texture.height),right=Math.round(columns[column+1]*texture.width),bottom=Math.round(rows[row+1]*texture.height);
     const frame=new SpriteFrame();frame.texture=texture;frame.rect=new Rect(x,y,right-x,bottom-y);this.frames.push(frame);
    }
   }
   resolve();
  }));
 }
 frame(house:HouseId,index:number):SpriteFrame|undefined{return this.frames[['home','tam','farm','pottery','books'].indexOf(house)*4+index];}
}
