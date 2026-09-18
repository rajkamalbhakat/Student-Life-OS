import { DOMAINS,isDate,minutes } from '../public/planner.js';
export class HttpError extends Error {constructor(status,message){super(message);this.status=status;}}
export function check(ok,msg='Invalid request'){if(!ok)throw new HttpError(400,msg);}
const str=(v,max=200)=>typeof v==='string'&&v.length<=max;
const num=(v,min,max)=>Number.isFinite(v)&&v>=min&&v<=max;
const time=v=>typeof v==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(v);
const days=v=>Array.isArray(v)&&v.length>0&&v.length<=7&&v.every(d=>Number.isInteger(d)&&d>=0&&d<=6);
export function validateState(s){
  check(s&&s.schema===1,'Unsupported backup format');const p=s.profile;check(p&&str(p.name,80)&&p.name.trim()&&str(p.course,150),'Enter a name and valid course');
  check(time(p.dailyStart)&&time(p.dailyEnd)&&minutes(p.dailyStart)<minutes(p.dailyEnd),'Day end must be later than day start');
  for(const [k,min,max] of [['availableMinutes',0,1440],['breakMinutes',0,60],['monthlyBudget',0,1e8],['savingsGoal',0,1e8],['sleepTarget',1,24],['waterTarget',1,30],['stepTarget',1,100000],['screenTarget',1,1440]])check(num(p[k],min,max),`Invalid ${k}`);
  for(const key of ['tasks','goals','habits','wellness','expenses','digital','commitments','history']){check(Array.isArray(s[key])&&s[key].length<=5000,`Invalid ${key}`);if(['tasks','goals','habits','expenses','commitments'].includes(key)){check(s[key].every(x=>str(x.id,100)&&x.id.length>0),`Invalid ${key} IDs`);check(new Set(s[key].map(x=>x.id)).size===s[key].length,`Duplicate ${key} IDs`);}}
  for(const t of s.tasks)check(str(t.title)&&t.title.trim()&&DOMAINS.includes(t.domain)&&num(t.duration,5,1440)&&num(t.completedMinutes,0,t.duration)&&isDate(t.due)&&[1,2,3].includes(t.priority)&&['pending','done'].includes(t.status)&&str(t.notes,2000)&&str(t.goalId,100),'Invalid task');
  for(const g of s.goals)check(str(g.title)&&g.title.trim()&&DOMAINS.includes(g.domain)&&num(g.target,1,1e8)&&num(g.current,0,1e8)&&str(g.unit,50)&&isDate(g.due),'Invalid goal');
  for(const h of s.habits)check(str(h.title)&&h.title.trim()&&DOMAINS.includes(h.domain)&&days(h.days)&&Array.isArray(h.checks)&&h.checks.length<=4000&&h.checks.every(isDate),'Invalid habit');
  for(const w of s.wellness)check(isDate(w.date)&&num(w.sleep,0,24)&&num(w.water,0,50)&&num(w.steps,0,200000)&&num(w.workout,0,1440)&&num(w.mood,1,5)&&str(w.meals,2000),'Invalid wellness log');
  for(const e of s.expenses)check(str(e.title)&&e.title.trim()&&num(e.amount,.01,1e8)&&str(e.category,50)&&isDate(e.date)&&['income','expense','saving'].includes(e.type),'Invalid transaction');
  for(const d of s.digital)check(isDate(d.date)&&num(d.screen,0,1440)&&num(d.distraction,0,d.screen)&&num(d.focus,0,1440)&&str(d.notes,2000),'Invalid digital log');
  for(const c of s.commitments)check(str(c.title)&&c.title.trim()&&days(c.days)&&time(c.start)&&time(c.end)&&minutes(c.start)<minutes(c.end)&&(!c.date||isDate(c.date)),'Invalid timetable block');
  for(const h of s.history)check(['completed','missed'].includes(h.kind)&&isDate(h.date)&&str(h.title)&&DOMAINS.includes(h.domain)&&num(h.actual,0,1440)&&num(h.estimated,0,1440)&&str(h.reason,1000),'Invalid activity record');
  if(s.plan){check(isDate(s.plan.date)&&num(s.plan.from,0,1440)&&Array.isArray(s.plan.blocks)&&s.plan.blocks.length<=1000&&Array.isArray(s.plan.deferred),'Invalid plan');for(const b of s.plan.blocks)check(str(b.id,100)&&str(b.taskId,100)&&str(b.title)&&DOMAINS.includes(b.domain)&&num(b.start,0,1440)&&num(b.end,b.start,1440)&&num(b.minutes,1,1440)&&num(b.estimated,0,1440),'Invalid plan block');}
  return s;
}
