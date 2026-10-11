const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const output=path.resolve(__dirname,'../temp/art-polish-qa');fs.mkdirSync(output,{recursive:true});
const ids=['mg.rice-count','mg.o-an-quan','mg.tug-of-war','mg.bamboo-dance','mg.market','mg.star-lantern','mg.banh-chung','mg.dong-ho','mg.fishing','mg.secret-letters','mg.animal-care','mg.village-maze'];
const target=process.env.GAME_WEB_URL||'http://127.0.0.1:8098/';
const access=process.env.GAME_HTTP_AUTH_FILE?fs.readFileSync(process.env.GAME_HTTP_AUTH_FILE,'utf8'):'';
const credentials=access?{httpCredentials:{username:'staging',password:/^Preview password: (.+)$/m.exec(access)?.[1],origin:new URL(target).origin}}:{};
(async()=>{
 const browser=await chromium.launch({executablePath:require('../../../tools/browser-path.cjs')(),headless:true,args:['--enable-webgl','--use-angle=d3d11']});const errors=[];
 try{
  for(const mobile of [false,true]){
   const context=await browser.newContext({...credentials,...(mobile?{viewport:{width:390,height:844},isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/149.0.0.0 Mobile Safari/537.36'}:{viewport:{width:1280,height:720}})}),page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));
   await page.goto(target);await page.waitForFunction(()=>!!window.System);await page.evaluate(async()=>window.cc=await System.import('cc'));
   await page.waitForFunction(()=>cc.director.getScene()?.getChildByName('Canvas')?.getComponent('VillageBootstrap')?.assetsReady,undefined,{timeout:90000});
   await page.evaluate(()=>{window.b=cc.director.getScene().getChildByName('Canvas').getComponent('VillageBootstrap');b.chapter.close();});
   if(!mobile){
    const directions=await page.evaluate(()=>{
     const original=b.player.position;b.player.position={x:9000,y:9000};b.enabled=false;
     try{return [...b.npcMotion].map(([node,state])=>{
      const frames=b.art.npcDirections[state.row],steps=b.art.npcWalkSteps[state.row];if(!frames||frames.length!==8||!steps||steps.length!==8)return false;
      state.greeting=0;state.near=false;
      for(let direction=0;direction<8;direction++){
       b.npcWalking.set(node,{id:node.name,x:node.position.x,y:node.position.y,moving:true,direction});
       state.time=0;
       b.animateNpcs(.016,{x:-node.position.x,y:-node.position.y},1280,720);
       if(state.body.getComponent(cc.Sprite).spriteFrame!==frames[direction]||state.body.scale.x<0)return false;
       state.time=.3;b.animateNpcs(0,{x:-node.position.x,y:-node.position.y},1280,720);
       if(state.body.getComponent(cc.Sprite).spriteFrame!==steps[direction]||state.body.scale.x<0)return false;
       b.npcWalking.set(node,{id:node.name,x:node.position.x,y:node.position.y,moving:false,direction});
       b.animateNpcs(0,{x:-node.position.x,y:-node.position.y},1280,720);
       if(state.body.getComponent(cc.Sprite).spriteFrame!==frames[direction])return false;
       b.npcWalking.set(node,{id:node.name,x:node.position.x,y:node.position.y,moving:true,direction});
       b.art.npcWalkSteps[state.row]=undefined;
       try{b.animateNpcs(0,{x:-node.position.x,y:-node.position.y},1280,720);if(state.body.getComponent(cc.Sprite).spriteFrame!==frames[direction])return false;}
       finally{b.art.npcWalkSteps[state.row]=steps;}
      }return true;
     });}finally{b.player.position=original;b.enabled=true;}
    });assert.equal(directions.length,8);assert.ok(directions.every(Boolean),'Eight NPCs must alternate two walking frames in eight viewpoints, stop on idle and retain fallback without mirroring');
   }
   await page.evaluate(()=>{b.hub.campaign.data.receipts=Array.from({length:8},(_,i)=>'reward.star.ch0'+(i+1));});
   const storyBefore=await page.evaluate(()=>JSON.stringify(b.hub.campaign.data.receipts));
   for(const id of ids){
    const result=await page.evaluate(id=>{
     const h=b.hub;h.open('activities');
     for(let n=0;n<3&&!h.buttons.some(button=>button.node.name==='Practice-'+id);n++)h.buttons.find(button=>button.node.name==='ActivityPage')?.action();
     const button=h.buttons.find(button=>button.node.name==='Practice-'+id);if(!button)throw Error('Missing practice '+id);button.action();
     const board=h.gameBoard;if(!board)throw Error('Missing illustration '+id);
     const before=board.node.children.length;for(let i=0;i<100;i++){h.game.advance(.016);board.update(h.game);}const after=board.node.children.length;
     const c=cc.game.canvas,r=c.getBoundingClientRect(),t=board.node.getComponent(cc.UITransform),camera=b.node.getComponent(cc.Canvas).cameraComponent;
     const a=camera.worldToScreen(t.convertToWorldSpaceAR(new cc.Vec3(-275,-37))),z=camera.worldToScreen(t.convertToWorldSpaceAR(new cc.Vec3(275,37)));
     return {before,after,rect:{x:r.left+a.x/c.width*r.width,y:r.top+(c.height-z.y)/c.height*r.height,w:(z.x-a.x)/c.width*r.width,h:(z.y-a.y)/c.height*r.height},stars:h.campaign.stars};
    },id);
    assert.equal(result.after,result.before,'Animated boards must reuse label nodes');assert.equal(result.stars,8,'Practice illustration must not award story stars');
    const viewport=page.viewportSize();assert.ok(result.rect.x>=-1&&result.rect.y>=-1&&result.rect.x+result.rect.w<=viewport.width+1&&result.rect.y+result.rect.h<=viewport.height+1,id+' board stays inside viewport');
    await page.screenshot({path:path.join(output,(mobile?'mobile-':'desktop-')+id.slice(3)+'.png')});
    if(['mg.rice-count','mg.market','mg.tug-of-war','mg.bamboo-dance'].includes(id)){
     const tap=async(x)=>{
      const point=await page.evaluate(x=>{const node=b.hub.gameBoard.node,c=cc.game.canvas,r=c.getBoundingClientRect(),camera=b.node.getComponent(cc.Canvas).cameraComponent;const s=camera.worldToScreen(node.getComponent(cc.UITransform).convertToWorldSpaceAR(new cc.Vec3(x,0)));return {x:r.left+s.x/c.width*r.width,y:r.top+(c.height-s.y)/c.height*r.height};},x);
      if(mobile)await page.touchscreen.tap(point.x,point.y);else await page.mouse.click(point.x,point.y);
     };
     if(id==='mg.rice-count'){
      for(let i=0;i<5;i++)await tap((i-2)*86);
      assert.equal(await page.evaluate(()=>b.hub.game.data.planted.length),5);
      await tap(-172);await tap(-172);
      assert.deepEqual(await page.evaluate(()=>b.hub.game.data.watered),[0],'Repeated tap must not water another plot');
     }else if(id==='mg.market'){
      await tap(-170);assert.equal(await page.evaluate(()=>b.hub.game.data.cart[0]),1);
     }else{
      // Server games must forward the board action without optimistic rule mutation.
      await page.evaluate(()=>{window.forwarded=[];window.oldAction=b.hub.onGameAction;b.hub.practice=false;b.hub.onGameAction=(type,index)=>forwarded.push({type,index});});
      try{await tap(0);assert.deepEqual(await page.evaluate(()=>forwarded),[{type:'beat',index:0}]);assert.equal(await page.evaluate(()=>b.hub.game.data.hits),0);}
      finally{await page.evaluate(()=>{b.hub.practice=true;b.hub.onGameAction=oldAction;});}
     }
    }
   }
   assert.equal(await page.evaluate(()=>JSON.stringify(b.hub.campaign.data.receipts)),storyBefore);
   await page.evaluate(()=>{b.hub.close();b.freeCameraOffset=null;});await page.screenshot({path:path.join(output,(mobile?'mobile':'desktop')+'-village.png')});
   assert.equal(await page.evaluate(()=>{window.walkFrames=b.art.npcWalkSteps.flat();b.enabled=false;b.root.active=false;b.art.dispose();b.art.dispose();return b.art.npcWalkSteps.length===0&&b.art.npcDirections.length===0&&walkFrames.length===64;}),true);
   await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>walkFrames.every(f=>!f.isValid)),true,'Walking SpriteFrames are released on dispose');await context.close();
  }
  assert.deepEqual(errors,[]);console.log('PASS art polish: 8 NPCs x 8 directions x 2 walk frames, idle/fallback/dispose, 12 boards desktop/mobile, direct mouse/touch controls, server forwarding, pooled labels, no story rewards, viewport bounds and no browser errors');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
