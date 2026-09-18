import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
test('hosted health and registration return 503 when database is missing',()=>{
 const script=`import handler from './server/handler.js';
 for(const action of ['health','register']){
 const req={url:'/api?action='+action,method:action==='health'?'GET':'POST',headers:{host:'example.test',origin:'https://example.test','content-type':'application/json'},body:{}};
 const res={setHeader(){},end(body){console.log(JSON.stringify({status:this.statusCode,body:JSON.parse(body)}));}};
 await handler(req,res);
 }`;
 const env={...process.env,VERCEL:'1',DATABASE_URL:'',POSTGRES_URL:'',APP_ORIGIN:''};
 const r=spawnSync(process.execPath,['--input-type=module','-e',script],{env,encoding:'utf8'});
 assert.equal(r.status,0,r.stderr);
 for(const line of r.stdout.trim().split('\n')){const result=JSON.parse(line);assert.equal(result.status,503);assert.equal(result.body.code,'STORAGE_NOT_CONFIGURED');}
});
