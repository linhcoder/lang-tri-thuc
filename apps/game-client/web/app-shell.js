(()=>{
 const splash=document.getElementById('app-splash'),bar=document.getElementById('splash-fill'),percent=document.getElementById('splash-percent'),message=document.getElementById('splash-message'),retry=document.getElementById('splash-retry'),install=document.getElementById('install-app');
 let current=0,finished=false,prompt;
 const rotate=document.getElementById('rotate-device'),fullscreen=document.getElementById('fullscreen-game'),rotateFullscreen=document.getElementById('rotate-fullscreen');
 const embedded=window.top!==window||new URLSearchParams(location.search).has('cmsPreview');
 const phone=!embedded&&(navigator.userAgentData?.mobile||/iPhone|iPod|Android.*Mobile/i.test(navigator.userAgent)||(matchMedia('(pointer:coarse)').matches&&Math.min(screen.width,screen.height)<=600));
 const standalone=()=>matchMedia('(display-mode:standalone)').matches||matchMedia('(display-mode:fullscreen)').matches||navigator.standalone===true;
 const supportsFullscreen=!!(document.documentElement.requestFullscreen||document.documentElement.webkitRequestFullscreen);
 function fitGame(){
  document.documentElement.style.setProperty('--game-height',Math.round(window.visualViewport?.height||innerHeight)+'px');
  document.documentElement.style.setProperty('--game-width',Math.round(window.visualViewport?.width||innerWidth)+'px');
  const portrait=phone&&innerHeight>innerWidth;
  rotate.hidden=!portrait;fullscreen.hidden=!phone||portrait||!finished||standalone()||!!document.fullscreenElement||!!document.webkitFullscreenElement||!supportsFullscreen;
  rotateFullscreen.hidden=!supportsFullscreen||standalone()||!!document.fullscreenElement||!!document.webkitFullscreenElement;
  document.getElementById('fullscreen-help').hidden=supportsFullscreen||standalone();
  if(portrait)install.hidden=true;else if(prompt&&finished)install.hidden=false;
 }
 async function enterFullscreen(){
  try{const root=document.documentElement,request=root.requestFullscreen||root.webkitRequestFullscreen;if(request&&!document.fullscreenElement&&!document.webkitFullscreenElement)await request.call(root,{navigationUI:'hide'});}catch{}
  if(document.fullscreenElement||document.webkitFullscreenElement){try{await screen.orientation?.lock?.('landscape');}catch{}}
  fitGame();window.dispatchEvent(new Event('resize'));
 }
 fullscreen.addEventListener('click',enterFullscreen);rotateFullscreen.addEventListener('click',enterFullscreen);
 window.addEventListener('resize',fitGame);window.visualViewport?.addEventListener('resize',fitGame);screen.orientation?.addEventListener('change',fitGame);document.addEventListener('fullscreenchange',fitGame);document.addEventListener('webkitfullscreenchange',fitGame);fitGame();
 const slow=setTimeout(()=>{if(!finished)message.textContent='Làng đang tải lâu hơn dự kiến…';},25000);
 window.addEventListener('ltt-loading',event=>{
  const data=event.detail;if(!data||finished)return;
  if(data.error){message.textContent=data.message;retry.hidden=false;clearTimeout(slow);return;}
  current=Math.max(current,Math.min(100,Math.round(data.percent)));percent.textContent=current+'%';bar.style.width=current+'%';splash.querySelector('[role=progressbar]').setAttribute('aria-valuenow',String(current));message.textContent=data.message;
  if(current===100){finished=true;fitGame();clearTimeout(slow);setTimeout(()=>{splash.classList.add('leaving');setTimeout(()=>splash.hidden=true,250);},180);}
 });
 retry.addEventListener('click',()=>location.reload());
 window.addEventListener('error',()=>{if(!finished){message.textContent='Chưa mở được làng. Thử tải lại nhé!';retry.hidden=false;}});
 window.addEventListener('unhandledrejection',()=>{if(!finished){message.textContent='Chưa mở được làng. Thử tải lại nhé!';retry.hidden=false;}});
 window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();prompt=event;if(finished)install.hidden=false;});
 window.addEventListener('appinstalled',()=>{install.hidden=true;prompt=null;});
 // Wait until the game is ready before offering installation.
 window.addEventListener('ltt-loading',event=>{if(event.detail?.percent===100&&prompt)install.hidden=false;});
 install.addEventListener('click',async()=>{if(!prompt)return;const choice=prompt;prompt=null;install.hidden=true;await choice.prompt();await choice.userChoice;});
 const preview=new URLSearchParams(location.search).has('cmsPreview');
 if('serviceWorker' in navigator&&!preview&&window.top===window){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'}).catch(()=>{}));}
})();
