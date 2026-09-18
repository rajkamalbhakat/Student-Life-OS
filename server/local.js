import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import handler from './handler.js';
const root=resolve('public');
const argValue=name=>{const index=process.argv.indexOf(name);return index>=0?process.argv[index+1]:undefined;};
const port=Number(argValue('--port')||process.env.PORT||3000);
const host=argValue('--host')||'127.0.0.1';
if(!Number.isInteger(port)||port<1||port>65535)throw new Error('Invalid server port');
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.json':'application/json'};
http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Frame-Options','DENY');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
  const url=new URL(req.url,'http://localhost');if(url.pathname==='/api'||url.pathname==='/api/index')return handler(req,res);
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);return res.end();}
  try{const name=decodeURIComponent(url.pathname),path=resolve(root,'.'+(name==='/'?'/index.html':name));if(!path.startsWith(root+sep)){res.writeHead(403);return res.end();}const data=await readFile(path);res.setHeader('Content-Type',types[extname(path)]||'application/octet-stream');res.end(req.method==='HEAD'?undefined:data);}catch{res.writeHead(404);res.end('Not found');}
}).listen(port,host,()=>console.log(`Orbit is running at http://localhost:${port} · Built by Rajkamal`));
