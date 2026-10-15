import {LearningUpgrades} from '../world/LearningUpgrades';
export class FirstVisitGuide{
 private node?:HTMLElement;private last='';private replayTutorial?:string[];
 update(data:LearningUpgrades,signals:{move:boolean;talk:boolean;reward:boolean;modal:boolean},save:()=>void,navigate:()=>void):void{
  if(typeof document==='undefined')return;const tutorial=this.replayTutorial??data.tutorial;for(const key of ['move','talk','reward'] as const)if(signals[key]&&!tutorial.includes(key)){tutorial.push(key);save();}
  if(tutorial.includes('done')){this.dispose();return;}
  const step=!tutorial.includes('move')?'move':!tutorial.includes('talk')?'talk':!tutorial.includes('reward')?'reward':'done';
  if(!this.node){this.node=document.createElement('aside');this.node.id='first-visit-guide';this.node.setAttribute('aria-label','Hướng dẫn vào làng');this.node.style.cssText='position:fixed;left:50%;top:27%;transform:translateX(-50%);width:min(380px,85vw);z-index:900;background:#fff8df;color:#3c5133;border:2px solid #d2ad5a;border-radius:14px;padding:12px;font:15px system-ui;box-sizing:border-box;box-shadow:0 4px 20px #2345';document.body.append(this.node);}
  this.node.hidden=signals.modal;if(this.last===step)return;this.last=step;this.node.replaceChildren();const text=document.createElement('p');text.style.margin='0 0 8px';text.textContent=({move:'1/3 · Chạm đường để đi, hoặc kéo cần điều khiển ở góc màn hình.',talk:'2/3 · Đến gần Ông Đồ và chạm “Tương tác” để chào hỏi.',reward:'3/3 · Làm theo nhiệm vụ trồng lúa và đếm hạt để nhận ngôi sao đầu tiên.',done:'Hoàn thành hướng dẫn! Bé đã sẵn sàng khám phá làng.'})[step];this.node.append(text);
  const button=(title:string,action:()=>void)=>{const b=document.createElement('button');b.textContent=title;b.style.cssText='min-height:44px;margin-right:8px;border:0;border-radius:8px;padding:8px 12px;background:#386e46;color:white;font:inherit';b.onclick=action;this.node!.append(b);};if(step==='talk'||step==='reward')button('Tới nhiệm vụ',navigate);button(step==='done'?'Khám phá làng':'Để sau',()=>{tutorial.push('done');save();this.dispose();});
 }
 replay(_data:LearningUpgrades):void{this.replayTutorial=[];this.last='';}
 dispose():void{this.node?.remove();this.node=undefined;this.last='';this.replayTutorial=undefined;}
}
