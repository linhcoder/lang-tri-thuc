const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const output=path.resolve(__dirname,'../temp/art-polish-qa');fs.mkdirSync(output,{recursive:true});
const ids=['mg.rice-count','mg.o-an-quan','mg.tug-of-war','mg.bamboo-dance','mg.market','mg.star-lantern','mg.banh-chung','mg.dong-ho','mg.fishing','mg.secret-letters','mg.animal-care','mg.village-maze'];
const completedQuestIds=[...fs.readFileSync(path.resolve(__dirname,'../assets/scripts/world/CampaignContent.ts'),'utf8').matchAll(/quest\('([^']+)'/g)].map(match=>match[1]);
assert.ok(completedQuestIds.length>20,'Complete campaign fixture includes real quest IDs');
const target=process.env.GAME_WEB_URL||'http://127.0.0.1:8098/';
const access=process.env.GAME_HTTP_AUTH_FILE?fs.readFileSync(process.env.GAME_HTTP_AUTH_FILE,'utf8'):'';
const credentials=access?{httpCredentials:{username:'staging',password:/^Preview password: (.+)$/m.exec(access)?.[1],origin:new URL(target).origin}}:{};
(async()=>{
 const browser=await chromium.launch({executablePath:require('../../../tools/browser-path.cjs')(),headless:true,args:['--enable-webgl','--use-angle=d3d11']});const errors=[];
 try{
  for(const mobile of [false,true]){
   const context=await browser.newContext({...credentials,...(mobile?{viewport:{width:390,height:844},isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/149.0.0.0 Mobile Safari/537.36'}:{viewport:{width:1280,height:720}})}),page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));
   await context.addInitScript(()=>{if(!sessionStorage.artSeeded){localStorage.setItem('lang-tri-thuc.chapter-one.v2',JSON.stringify({version:2,introSeen:true,greeted:true,accepted:true,planted:[0,1,2,3,4],countRound:3,rewardReceipts:['reward.star.ch01'],replayRound:null,legacyDemoBadge:false}));sessionStorage.artSeeded='1';}});
   await page.goto(target);await page.waitForFunction(()=>!!window.System);await page.evaluate(async()=>window.cc=await System.import('cc'));
   await page.waitForFunction(()=>cc.director.getScene()?.getChildByName('Canvas')?.getComponent('VillageBootstrap')?.assetsReady,undefined,{timeout:90000});
   await page.evaluate(()=>{window.b=cc.director.getScene().getChildByName('Canvas').getComponent('VillageBootstrap');b.chapter.close();});
   if(!mobile){
    const directions=await page.evaluate(()=>{
     const original=b.player.position;b.player.position={x:9000,y:9000};b.enabled=false;
     try{return Array.from(b.npcMotion).filter(([node,state])=>!state.body.name.startsWith('ExpansionSprite-')).map(([node,state])=>{
      const frames=b.art.npcDirections[state.row],steps=b.art.npcWalkSteps[state.row];if(!frames||frames.length!==8||!steps||steps.length!==8)return false;
      state.greeting=0;state.near=false;
      for(let direction=0;direction<8;direction++){
       b.npcWalking.set(node,{id:node.name,x:node.position.x,y:node.position.y,moving:true,direction});
       state.time=0;state.gait.phase=0;state.gait.visualPhase=0;
       b.animateNpcs(.016,{x:-node.position.x,y:-node.position.y},1280,720);
       if(state.body.getComponent(cc.Sprite).spriteFrame!==b.art.npcCycleFrame(state.row,direction,state.gait.cycleFrame)||state.body.scale.x<0)return false;
       state.gait.phase=.75;state.gait.visualPhase=.75;b.animateNpcs(0,{x:-node.position.x,y:-node.position.y},1280,720);
       if(state.body.getComponent(cc.Sprite).spriteFrame!==b.art.npcCycleFrame(state.row,direction,state.gait.cycleFrame)||state.body.scale.x<0)return false;
       const cycleFrames=new Set();for(let phase=0;phase<8;phase++){state.gait.phase=state.gait.visualPhase=phase/8;b.animateNpcs(0,{x:-node.position.x,y:-node.position.y},1280,720);cycleFrames.add(state.body.getComponent(cc.Sprite).spriteFrame);}if(cycleFrames.size!==8)return false;
       b.npcWalking.set(node,{id:node.name,x:node.position.x,y:node.position.y,moving:false,direction});
       b.animateNpcs(0,{x:-node.position.x,y:-node.position.y},1280,720);
       if(state.body.getComponent(cc.Sprite).spriteFrame!==frames[direction])return false;
       b.npcWalking.set(node,{id:node.name,x:node.position.x,y:node.position.y,moving:true,direction});
       b.art.npcWalkSteps[state.row]=undefined;
       try{b.animateNpcs(0,{x:-node.position.x,y:-node.position.y},1280,720);if(!state.body.getComponent(cc.Sprite).spriteFrame)return false;}
       finally{b.art.npcWalkSteps[state.row]=steps;}
      }return true;
     });}finally{b.player.position=original;b.enabled=true;}
    });assert.equal(directions.length,8);assert.ok(directions.every(Boolean),'Eight NPCs must use cached cycle phases in eight viewpoints, stop on idle and retain fallback without mirroring');
   }
   await page.evaluate(completed=>{b.hub.campaign.data.completed=completed;b.hub.campaign.data.introduced=Array.from({length:8},(_,i)=>'ch0'+(i+1));b.hub.campaign.data.receipts=Array.from({length:8},(_,i)=>'reward.star.ch0'+(i+1));},completedQuestIds);
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
    if(['mg.rice-count','mg.market','mg.tug-of-war','mg.bamboo-dance','mg.banh-chung','mg.fishing','mg.secret-letters','mg.o-an-quan'].includes(id)){
     const tap=async(x,y=0)=>{
      const point=await page.evaluate(({x,y})=>{const node=b.hub.gameBoard.node,c=cc.game.canvas,r=c.getBoundingClientRect(),camera=b.node.getComponent(cc.Canvas).cameraComponent;const s=camera.worldToScreen(node.getComponent(cc.UITransform).convertToWorldSpaceAR(new cc.Vec3(x,y)));return {x:r.left+s.x/c.width*r.width,y:r.top+(c.height-s.y)/c.height*r.height};},{x,y});
      if(mobile)await page.touchscreen.tap(point.x,point.y);else await page.mouse.click(point.x,point.y);
     };
     if(id==='mg.rice-count'){
      for(let i=0;i<5;i++)await tap((i-2)*86);
      assert.equal(await page.evaluate(()=>b.hub.game.data.planted.length),5);
      await tap(-172);await tap(-172);
      assert.deepEqual(await page.evaluate(()=>b.hub.game.data.watered),[0],'Repeated tap must not water another plot');
     }else if(id==='mg.banh-chung'){
      await page.evaluate(()=>{window.forwarded=[];window.oldAction=b.hub.onGameAction;b.hub.practice=false;b.hub.onGameAction=(type,index)=>forwarded.push({type,index});});
      try{await tap(-117);assert.deepEqual(await page.evaluate(()=>forwarded),[{type:'layer',index:0}]);assert.equal(await page.evaluate(()=>b.hub.game.data.step),0,'Server layer waits for acknowledgement');}
      finally{await page.evaluate(()=>{b.hub.practice=true;b.hub.onGameAction=oldAction;});}
      await tap(-195);assert.equal(await page.evaluate(()=>b.hub.game.data.step),0,'Wrong layer keeps progress');
      for(const layer of [0,1,2,3,4,5]){await tap(([3,0,4,1,5,2].indexOf(layer)-2.5)*78);assert.equal(await page.evaluate(()=>b.hub.game.data.step),layer+1);}
      assert.equal(await page.evaluate(()=>b.hub.game.ended),true);
     }else if(id==='mg.fishing'){
      await page.evaluate(()=>{window.fishAdvance=b.hub.game.advance;b.hub.game.advance=()=>{};b.hub.game.clock=0;b.hub.gameBoard.update(b.hub.game);});
      await tap(173,0);assert.equal(await page.evaluate(()=>b.hub.game.data.caught),-1,'Fish outside observation zone cannot be caught');
      await page.evaluate(()=>{window.forwarded=[];window.oldAction=b.hub.onGameAction;b.hub.practice=false;b.hub.onGameAction=(type,index)=>forwarded.push({type,index});});
      try{await tap(0,-17);assert.deepEqual(await page.evaluate(()=>forwarded),[{type:'fish',index:0}]);assert.equal(await page.evaluate(()=>b.hub.game.data.caught),-1,'Server fish waits for acknowledgement');}
      finally{await page.evaluate(()=>{b.hub.practice=true;b.hub.onGameAction=oldAction;});}
      try{await tap(0,-17);assert.equal(await page.evaluate(()=>b.hub.game.data.caught),0);assert.equal(await page.evaluate(()=>b.hub.gameBoard.actionAt(b.hub.game,0,-17)),undefined,'No recapture during color question');await page.screenshot({path:path.join(output,(mobile?'mobile':'desktop')+'-fish-observation.png')});await page.evaluate(()=>b.hub.buttons.find(b=>b.node.name==='GameAction-color-0').action());assert.deepEqual(await page.evaluate(()=>b.hub.game.data.observed),[0]);}finally{await page.evaluate(()=>b.hub.game.advance=fishAdvance);}
     }else if(id==='mg.secret-letters'){
      // Coordinates are supplied by the rendered letter-card layout below.
      const coords=await page.evaluate(()=>b.hub.game.data.grid.map((_,i)=>({x:(i-(b.hub.game.data.grid.length-1)/2)*50,y:0})));
      for(const invalid of [NaN,Infinity,-Infinity])assert.equal(await page.evaluate(value=>b.hub.gameBoard.actionAt(b.hub.game,value,0),invalid),undefined,'Nonfinite input cannot trigger an action');
      const wrong=await page.evaluate(()=>b.hub.game.data.grid.findIndex(letter=>letter!==b.hub.game.data.word[0]));
      await tap(coords[wrong].x);assert.equal(await page.evaluate(()=>b.hub.game.data.step),0,'Wrong letter preserves progress');
      await page.waitForFunction(()=>b.hub.node.getChildByName('GameFeedback')?.getComponent(cc.Label).string.includes('Thử lại'));
      assert.equal(await page.evaluate(()=>b.hub.node.getChildByName('GameTitle').getComponent(cc.Label).string),'Tìm Chữ Bí Mật');
      assert.match(await page.evaluate(()=>b.hub.node.getChildByName('GameFeedback').getComponent(cc.Label).string),/Thử lại/);
      const correct=await page.evaluate(()=>b.hub.game.data.grid.indexOf(b.hub.game.data.word[0]));
      await tap(coords[correct].x);assert.equal(await page.evaluate(()=>b.hub.game.data.step),1);
      await page.waitForFunction(()=>b.hub.node.getChildByName('GameFeedback')?.getComponent(cc.Label).string.includes('Đúng bước'));
      await page.screenshot({path:path.join(output,(mobile?'mobile':'desktop')+'-letters-feedback.png')});
      assert.match(await page.evaluate(()=>b.hub.node.getChildByName('GameFeedback').getComponent(cc.Label).string),/Đúng bước/);
      const beforeRejected=await page.evaluate(()=>JSON.stringify(b.hub.game.save()));
      await page.evaluate(()=>{b.hub.practice=false;b.hub.applyGameFeedback('mg.market','Sai trò');});
      assert.doesNotMatch(await page.evaluate(()=>b.hub.node.getChildByName('GameFeedback').getComponent(cc.Label).string),/Sai trò/);
      await page.evaluate(()=>{b.hub.practice=false;b.hub.game.resume();b.hub.applyGameFeedback('mg.secret-letters','Mình thử lại nhé. Có thể xem gợi ý, không mất điểm.');});
      await page.waitForFunction(()=>b.hub.node.getChildByName('GameFeedback')?.getComponent(cc.Label).string.includes('Thử lại'));
      assert.match(await page.evaluate(()=>b.hub.node.getChildByName('GameFeedback').getComponent(cc.Label).string),/Thử lại/);
      assert.deepEqual(await page.evaluate(()=>b.hub.game.save().actions),JSON.parse(beforeRejected).actions,'Server feedback cannot change accepted actions');
      assert.equal(await page.evaluate(()=>b.hub.node.getChildByName('GameTitle').getComponent(cc.Label).string),'Tìm Chữ Bí Mật');
      await page.evaluate(()=>b.hub.practice=true);
      await page.reload();await page.waitForFunction(()=>!!window.System);await page.evaluate(async()=>window.cc=await System.import('cc'));
      await page.waitForFunction(()=>cc.director.getScene()?.getChildByName('Canvas')?.getComponent('VillageBootstrap')?.assetsReady,undefined,{timeout:90000});
      await page.evaluate(()=>{window.b=cc.director.getScene().getChildByName('Canvas').getComponent('VillageBootstrap');b.chapter.close();const h=b.hub;h.open('activities');for(let n=0;n<3&&!h.buttons.some(button=>button.node.name==='Practice-mg.secret-letters');n++)h.buttons.find(button=>button.node.name==='ActivityPage')?.action();h.buttons.find(button=>button.node.name==='Practice-mg.secret-letters').action();});
      assert.equal(await page.evaluate(()=>b.hub.game.data.step),1,'Direct letter action survives reload/checkpoint');
      for(const age of ['6-8','9-11']){
       await page.evaluate(age=>{const h=b.hub;h.game.pause();delete h.campaign.data.practiceResume['mg.secret-letters'];h.campaign.data.age=age;h.open('activities');for(let n=0;n<3&&!h.buttons.some(button=>button.node.name==='Practice-mg.secret-letters');n++)h.buttons.find(button=>button.node.name==='ActivityPage')?.action();h.buttons.find(button=>button.node.name==='Practice-mg.secret-letters').action();},age);
       const word=await page.evaluate(()=>b.hub.game.data.word);
       for(let step=0;step<word.length;step++){const x=await page.evaluate(step=>{const d=b.hub.game.data;return (d.grid.indexOf(d.word[step])-(d.grid.length-1)/2)*50;},step);await tap(x);assert.equal(await page.evaluate(()=>b.hub.game.data.step),step+1);}
       assert.equal(await page.evaluate(()=>b.hub.game.ended),true,'Letter cards complete at '+age);
      }
      await page.evaluate(()=>b.hub.campaign.data.age='3-5');
     }else if(id==='mg.o-an-quan'){
      await page.evaluate(()=>{window.forwarded=[];window.oldAction=b.hub.onGameAction;b.hub.practice=false;b.hub.onGameAction=(type,index)=>forwarded.push({type,index});});
      try{await tap(144,-17);assert.deepEqual(await page.evaluate(()=>forwarded),[{type:'pit',index:0}]);assert.equal(await page.evaluate(()=>b.hub.game.data.turns),0,'Server pits await acknowledgement');}
      finally{await page.evaluate(()=>{b.hub.practice=true;b.hub.onGameAction=oldAction;});}
      await tap(144,-17);assert.ok(await page.evaluate(()=>b.hub.game.data.turns)>0,'Player pit runs same rules as button');
      await page.screenshot({path:path.join(output,(mobile?'mobile':'desktop')+'-pits-feedback.png')});
     }else if(id==='mg.market'){
      await tap(-170);assert.equal(await page.evaluate(()=>b.hub.game.data.cart[0]),1);
     }else{
      // Server games must forward the board action without optimistic rule mutation.
      await page.evaluate(()=>{window.forwarded=[];window.oldAction=b.hub.onGameAction;b.hub.practice=false;b.hub.onGameAction=(type,index)=>forwarded.push({type,index});});
      try{await tap(0);assert.deepEqual(await page.evaluate(()=>forwarded),[{type:'beat',index:0}]);assert.equal(await page.evaluate(()=>b.hub.game.data.hits),0);}
      finally{await page.evaluate(()=>{b.hub.practice=true;b.hub.onGameAction=oldAction;});}
     }
    }
    if(id==='mg.animal-care'){
     for(const [step,action,name] of [[0,1,'Gà trong làng'],[1,0,'Chó trong làng'],[2,2,'Con vật lạ']]){
      assert.ok(await page.evaluate(name=>b.hub.gameBoard.node.children.some(n=>n.active&&n.getComponent(cc.Label)?.string===name),name),'Care artwork labels match current animal');
      await page.screenshot({path:path.join(output,(mobile?'mobile':'desktop')+'-care-step-'+step+'.png')});
      await page.evaluate(action=>b.hub.buttons.find(b=>b.node.name==='GameAction-care-'+action).action(),action);
     }
     assert.equal(await page.evaluate(()=>b.hub.game.ended),true);
    }
   }
   assert.equal(await page.evaluate(()=>JSON.stringify(b.hub.campaign.data.receipts)),storyBefore);
   await page.evaluate(()=>{b.hub.close();b.freeCameraOffset=null;});await page.screenshot({path:path.join(output,(mobile?'mobile':'desktop')+'-village.png')});
   assert.equal(await page.evaluate(()=>{window.walkFrames=b.art.npcWalkSteps.flat();b.enabled=false;b.root.active=false;b.art.dispose();b.art.dispose();return b.art.npcWalkSteps.length===0&&b.art.npcDirections.length===0&&walkFrames.length===64;}),true);
   await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>walkFrames.every(f=>!f.isValid)),true,'Walking SpriteFrames are released on dispose');await context.close();
  }
  assert.deepEqual(errors,[]);console.log('PASS art polish: 8 NPCs x 8 directions x 8 cycle frames, idle/fallback/dispose, 12 boards desktop/mobile, direct mouse/touch controls, server forwarding, pooled labels, no story rewards, viewport bounds and no browser errors');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
