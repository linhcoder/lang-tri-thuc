const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../apps/game-client/build/web-desktop');
const mime={'.html':'text/html','.js':'application/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.css':'text/css','.wasm':'application/wasm','.ttf':'font/ttf','.woff2':'font/woff2'};
const port=Number(process.env.WEB_PORT||8080),host=process.env.HOST||'127.0.0.1';
const server=http.createServer((req,res)=>{
    let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);res.end();return;}
    const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
    if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
    fs.stat(file,(error,stat)=>{if(error||!stat.isFile()){res.writeHead(404);res.end();return;}
        res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Content-Length':stat.size,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
        fs.createReadStream(file).pipe(res);
    });
});
server.listen(port,host,()=>console.log(`Game web: http://${host}:${port}/?server=http://${host}:2567`));
