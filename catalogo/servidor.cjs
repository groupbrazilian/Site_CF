const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
http.createServer((req,res) => {
  let pathname; try {pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
  if (pathname === '/') {res.writeHead(302,{Location:'/catalogo/'}).end();return;}
  if (!pathname.startsWith('/catalogo/')) {res.writeHead(404).end();return;}
  const file = path.resolve(root, '.' + pathname.slice('/catalogo'.length), pathname.endsWith('/') ? 'index.html' : '');
  if (!file.startsWith(root + path.sep)) {res.writeHead(403).end();return;}
  fs.readFile(file,(error,data)=>{if(error){res.writeHead(404).end('Arquivo não encontrado');return;}res.writeHead(200,{'Content-Type':types[path.extname(file)] || 'application/octet-stream','Cache-Control':'no-cache'});res.end(data);});
}).listen(4173,'127.0.0.1',()=>console.log('Catálogo local: http://127.0.0.1:4173/catalogo/'));
