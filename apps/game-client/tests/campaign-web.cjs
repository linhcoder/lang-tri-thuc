const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const output=path.resolve(__dirname,'../temp/campaign-qa');fs.mkdirSync(output,{recursive:true});
function puzzleSolution(start){
    const heuristic=a=>a.reduce((s,n,i)=>n===8?s:s+Math.abs(n%3-i%3)+Math.abs(Math.floor(n/3)-Math.floor(i/3)),0);
    const open=[{a:start,g:0,path:[]}],best=new Map([[start.join(''),0]]);let attempts=0;
    while(open.length&&attempts++<100000){let index=0;for(let i=1;i<open.length;i++)if(open[i].g+heuristic(open[i].a)<open[index].g+heuristic(open[index].a))index=i;const current=open.splice(index,1)[0];if(heuristic(current.a)===0)return current.path;const blank=current.a.indexOf(8);
        for(const next of [blank-3,blank+3,blank-1,blank+1])if(next>=0&&next<9&&Math.abs(next%3-blank%3)+Math.abs(Math.floor(next/3)-Math.floor(blank/3))===1){const a=current.a.slice();[a[blank],a[next]]=[a[next],a[blank]];const key=a.join(''),g=current.g+1;if(g<(best.get(key)??Infinity)){best.set(key,g);open.push({a,g,path:current.path.concat(next)});}}}
    throw Error('Puzzle search exhausted');
}
(async()=>{
    const browser=await chromium.launch({executablePath:require('../../../tools/browser-path.cjs')(),headless:true,args:['--enable-webgl','--enable-gpu',...(process.platform==='win32'?['--use-angle=d3d11']:[])]});const errors=[],results=[];
    const context=await browser.newContext({viewport:{width:1280,height:720}});
    await context.addInitScript(()=>{if(!sessionStorage.seeded){localStorage.setItem('lang-tri-thuc.chapter-one.v2',JSON.stringify({version:2,introSeen:true,greeted:true,accepted:true,planted:[0,1,2,3,4],countRound:3,rewardReceipts:['reward.star.ch01'],replayRound:null,legacyDemoBadge:false}));sessionStorage.seeded='1';}});
    const page=await context.newPage();page.on('pageerror',e=>{errors.push(String(e));console.error(e);});page.on('console',m=>{if(m.type()==='error'){errors.push(m.text());console.error(m.text());}});
    async function ready(){await page.waitForFunction(()=>!!window.System);await page.evaluate(async()=>window.cc=await System.import('cc'));await page.waitForFunction(()=>cc.director.getScene()?.getChildByName('Canvas')?.getComponent('VillageBootstrap')?.assetsReady,undefined,{timeout:90000});await page.evaluate(()=>window.village=cc.director.getScene().getChildByName('Canvas').getComponent('VillageBootstrap'));}
    async function tap(id,root=false){const p=await page.evaluate(({id,root})=>{const b=village,n=root?b[id]:b.hub.node.getChildByName(id);if(!n)throw Error('Missing button '+id);const world=n.getComponent(cc.UITransform).convertToWorldSpaceAR(new cc.Vec3()),s=b.node.getComponent(cc.Canvas).cameraComponent.worldToScreen(world),canvas=cc.game.canvas,r=canvas.getBoundingClientRect();return {x:r.left+s.x/canvas.width*r.width,y:r.top+(canvas.height-s.y)/canvas.height*r.height};},{id,root});await page.mouse.click(p.x,p.y);await page.waitForTimeout(40);}
    async function action(type,index){await tap('GameAction-'+type+'-'+index);}
    async function game(){return page.evaluate(()=>({id:village.hub.game.id,data:village.hub.game.data,ended:village.hub.game.ended,clock:village.hub.game.clock}));}
    async function play(){const state=await game(),id=state.id;
        if(id==='mg.o-an-quan'){for(let i=0;i<150;i++){const s=await game();if(s.ended)break;await action('pit',s.data.board.slice(0,5).findIndex(n=>n>0));}}
        else if(id==='mg.tug-of-war'||id==='mg.bamboo-dance'){for(let i=0;i<6;i++){await page.waitForFunction(()=>{const g=village.hub.game;return g.rhythmOpen&&Math.floor(g.clock/(g.id==='mg.tug-of-war'?1:1.5))!==g.data.lastBeat;},undefined,{timeout:6000});await action('beat',0);}}
        else if(id==='mg.market'){for(let i=0;i<3;i++)for(let n=0;n<state.data.wants[i];n++)await action('add',i);await action('pay',2);}
        else if(id==='mg.secret-letters'){for(let i=0;i<state.data.word.length;i++)await action('letter',state.data.grid.indexOf(state.data.word[i]));}
        else if(id==='mg.dong-ho'){for(const n of puzzleSolution(state.data.tiles))await action('tile',n);}
        else if(id==='mg.rice-count'){for(let i=0;i<5;i++)await action('plant',i);for(let i=0;i<5;i++)await action('water',i);await action('answer',5);}
        else if(id==='mg.fishing'){for(let i=0;i<3;i++){await page.waitForFunction(i=>Math.abs(village.hub.game.fishX(i))<60,i,{timeout:10000});await action('fish',i);await action('color',i);}}
        else if(id==='mg.animal-care'){for(const n of [1,0,2])await action('care',n);}
        else if(id==='mg.star-lantern'){for(let i=0;i<5;i++){await action('part',i);await action('place',i);}}
        else if(id==='mg.banh-chung'){for(let i=0;i<6;i++)await action('layer',i);}
        else if(id==='mg.village-maze'){for(const next of [1,6,11,12,13,18,19,24]){const s=await game();await action('move',[-5,1,5,-1].indexOf(next-s.data.cursor));}}
        assert.equal((await game()).ended,true,id);await page.screenshot({path:path.join(output,id.replace('mg.','')+'.png')});await tap('GameFinish');results.push(id);
    }
    try{
        await page.goto(process.env.GAME_WEB_URL||'http://127.0.0.1:8080');await ready();assert.equal(await page.evaluate(()=>village.hub.campaign.stars),1);
        await tap('parentButton',true);await tap('ParentAnswer-1');await tap('ChooseAge');await tap('Age-6-8');assert.equal(await page.evaluate(()=>village.hub.campaign.data.age),'6-8');await tap('ChooseAge');await tap('Age-3-5');await tap('HubClose');
        const chapterQuests=await page.evaluate(()=>[...Array(8)].map((_,i)=>[]));
        // IDs come from the actual rendered journal; all objective actions use real mouse input.
        for(let chapter=1;chapter<8;chapter++){
            await tap('journalButton',true);await tap('Chapter-'+chapter);await tap('ChapterIntro');
            const ids=await page.evaluate(()=>village.hub.buttons.map(b=>b.node.name).filter(n=>n.startsWith('q.')));chapterQuests[chapter]=ids;
            for(const id of ids){await tap(id);const mode=await page.evaluate(()=>village.hub.mode);
                if(mode==='lesson'){for(let round=0;round<3;round++){const answer=await page.evaluate(()=>village.hub.lesson.question.answer);await tap('LessonAnswer-'+answer);}}
                else if(mode==='game')await play();else throw Error('Quest did not start '+id);
                assert.equal(await page.evaluate(id=>village.hub.campaign.data.completed.includes(id),id),true);
            }
            await tap('ClaimStar');assert.equal(await page.evaluate(()=>village.hub.campaign.stars),chapter+1);await tap('HubClose');console.log('CHAPTER',chapter+1,'COMPLETE');
            await page.reload();await ready();assert.equal(await page.evaluate(()=>village.hub.campaign.stars),chapter+1);
        }
        assert.equal(await page.evaluate(()=>village.hub.campaign.stars),8);await tap('journalButton',true);await page.screenshot({path:path.join(output,'all-chapters.png')});assert.deepEqual(errors,[]);
        fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({chapters:8,completedGames:results,chapterQuests,errors},null,2));console.log(JSON.stringify({chapters:8,completedGames:results,errors},null,2));
    }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
