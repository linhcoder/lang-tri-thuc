const fs=require('node:fs'),path=require('node:path');
module.exports=function browserPath(explicit){
    if(explicit)return explicit;if(process.env.CHROME_EXECUTABLE)return process.env.CHROME_EXECUTABLE;
    const candidates=['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'];
    for(const file of candidates)if(fs.existsSync(file))return file;
    const cache=path.join(process.env.USERPROFILE||process.env.HOME||'','.cache/puppeteer/chrome');
    if(fs.existsSync(cache)){for(const dir of fs.readdirSync(cache).sort((a,b)=>b.localeCompare(a,undefined,{numeric:true}))){const file=path.join(cache,dir,'chrome-win64/chrome.exe');if(fs.existsSync(file))return file;}}
    return undefined; // Playwright's installed Chromium, if no system browser is available.
};
