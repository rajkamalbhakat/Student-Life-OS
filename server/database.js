import { mkdirSync } from 'node:fs';
let ready;
async function init(){
  let q;
  if(process.env.DATABASE_URL){
    const {default:pg}=await import('pg');
    const pool=new pg.Pool({connectionString:process.env.DATABASE_URL,max:3,connectionTimeoutMillis:10000});
    q=async(sql,params=[])=>{const r=await pool.query(sql,params);return {rows:r.rows,changes:r.rowCount};};
  }else{
    if(process.env.VERCEL)throw new Error('DATABASE_URL is required for hosted persistence');
    const {DatabaseSync}=await import('node:sqlite');mkdirSync(process.env.DATA_DIR||'data',{recursive:true});
    const db=new DatabaseSync(`${process.env.DATA_DIR||'data'}/orbit.sqlite`);db.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;');
    q=async(sql,params=[])=>{const statement=db.prepare(sql.replace(/\$\d+/g,'?'));if(/^\s*(SELECT|WITH)/i.test(sql))return {rows:statement.all(...params),changes:0};const r=statement.run(...params);return {rows:[],changes:Number(r.changes)};};
  }
  await q('CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, demo INTEGER NOT NULL DEFAULT 0)');
  await q('CREATE TABLE IF NOT EXISTS documents (user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, body TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1)');
  await q('CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires BIGINT NOT NULL)');
  await q('CREATE TABLE IF NOT EXISTS limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires BIGINT NOT NULL)');
  return q;
}
export async function query(sql,params=[]){if(!ready)ready=init().catch(e=>{ready=undefined;throw e;});return (await ready)(sql,params);}
export async function limited(key,max,windowMs){
  const now=Date.now();const bucket=Math.floor(now/windowMs),id=`${key}:${bucket}`;
  await query('DELETE FROM limits WHERE expires < $1',[now]);
  await query('INSERT INTO limits (key,count,expires) VALUES ($1,1,$2) ON CONFLICT(key) DO UPDATE SET count=limits.count+1',[id,now+windowMs]);
  const r=await query('SELECT count FROM limits WHERE key=$1',[id]);return r.rows[0].count>max;
}
