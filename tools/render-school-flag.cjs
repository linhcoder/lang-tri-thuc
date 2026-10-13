const fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
// Editable vector source: eight cloth poses, a true five-point yellow star.
const frames=Array.from({length:8},(_,phase)=>{
 const wave=x=>Math.sin(phase*Math.PI/4-x*.045)*4*(x-8)/216;
 const points=[];for(let x=8;x<=224;x+=12)points.push([x,8+wave(x)]);for(let x=224;x>=8;x-=12)points.push([x,152+wave(x)]);
 const star=Array.from({length:10},(_,i)=>{const a=-Math.PI/2+i*Math.PI/5,r=i%2?15.28:40,x=116+Math.cos(a)*r;return [x,80+Math.sin(a)*r+wave(x)];});
 return `<g transform="translate(${phase*240} 0)"><defs><linearGradient id="cloth${phase}"><stop stop-color="#c9221c"/><stop offset=".25" stop-color="#e93225"/><stop offset=".5" stop-color="#c41f19"/><stop offset=".75" stop-color="#ef382a"/><stop offset="1" stop-color="#ce241c"/></linearGradient></defs><polygon points="${points.map(p=>p.join(',')).join(' ')}" fill="url(#cloth${phase})"/><polygon points="${star.map(p=>p.join(',')).join(' ')}" fill="#ffde00"/></g>`;
}).join('');
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="160" viewBox="0 0 1920 160">${frames}</svg>`;
(async()=>{const root=path.resolve(__dirname,'../apps/game-client/assets/resources/village/schoolyard-v2');fs.writeFileSync(path.resolve(__dirname,'../docs/design/vietnam-flag-atlas.svg'),svg);const browser=await chromium.launch({executablePath:require('./browser-path.cjs')(),headless:true});try{const page=await browser.newPage({viewport:{width:1920,height:160},deviceScaleFactor:1});await page.setContent('<style>html,body{margin:0;background:transparent}svg{display:block}</style>'+svg);await page.screenshot({path:path.join(root,'vietnam-flag-atlas.png'),omitBackground:true});}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
