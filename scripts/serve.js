const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const base=path.resolve(__dirname,'..');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml'};
http.createServer((req,res)=>{
  let name;
  try {name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch {res.writeHead(400);res.end();return;}
  const file=path.resolve(base,'.'+(name==='/'?'/index.html':name));
  if(!file.startsWith(base+path.sep)||name.split('/').some(p=>p.startsWith('.'))||!types[path.extname(file)]){res.writeHead(404);res.end();return;}
  fs.readFile(file,(error,data)=>{if(error){res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':types[path.extname(file)],'Cache-Control':'no-store'});res.end(data);});
}).listen(4173,'127.0.0.1',()=>console.log('Preview: http://127.0.0.1:4173'));
