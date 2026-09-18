export const DOMAINS = ['Academics','Career','Wellness','Personal','Finance','Digital'];
export const uid = () => globalThis.crypto.randomUUID();
export const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export const plusDays = (key, days) => { const d = new Date(key+'T12:00:00'); d.setDate(d.getDate()+days); return dayKey(d); };
export const minutes = t => { const [h,m] = t.split(':').map(Number); return h*60+m; };
export const clock = n => `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;
export function initialState(name='Student') {
  return {schema:1, profile:{name,course:'',dailyStart:'08:00',dailyEnd:'22:00',availableMinutes:360,breakMinutes:10,monthlyBudget:5000,savingsGoal:1000,sleepTarget:8,waterTarget:8,stepTarget:8000,screenTarget:180}, tasks:[],goals:[],habits:[],wellness:[],expenses:[],digital:[],commitments:[],history:[],plan:null};
}
export function sampleState(today=dayKey()) {
  const s=initialState('Alex'); s.profile.course='Computer Science · Semester 4';
  s.tasks=[['Finish Java assignment','Academics',90,1,3],['Revise database normalization','Academics',75,3,3],['Practice binary search','Career',45,4,2],['Take a refreshing walk','Wellness',30,0,2],['Update internship portfolio','Career',60,6,2],['Review this month’s budget','Finance',20,7,1]].map(([title,domain,duration,days,priority])=>({id:uid(),title,domain,duration,completedMinutes:0,due:plusDays(today,days),priority,status:'pending',created:today,notes:'',goalId:''}));
  s.goals=[{id:uid(),title:'Build a consistent DSA practice',domain:'Career',target:20,current:7,unit:'sessions',due:plusDays(today,30)},{id:uid(),title:'Prepare for semester exams',domain:'Academics',target:12,current:4,unit:'chapters',due:plusDays(today,21)}];
  s.habits=[{id:uid(),title:'Read for 15 minutes',domain:'Personal',days:[0,1,2,3,4,5,6],checks:[plusDays(today,-1),plusDays(today,-2)]},{id:uid(),title:'Practice one coding problem',domain:'Career',days:[1,2,3,4,5],checks:[plusDays(today,-1)]},{id:uid(),title:'Evening walk',domain:'Wellness',days:[0,1,2,3,4,5,6],checks:[]}];
  s.commitments=[{id:uid(),title:'College classes',days:[1,2,3,4,5],start:'09:30',end:'16:30'}];
  s.wellness=[{date:today,sleep:6.5,water:3,steps:3200,workout:0,meals:'Breakfast and lunch',mood:3}];
  s.expenses=[{id:uid(),title:'Lunch on campus',amount:90,category:'Food',date:today,type:'expense'},{id:uid(),title:'Bus pass',amount:450,category:'Travel',date:plusDays(today,-2),type:'expense'},{id:uid(),title:'Monthly allowance',amount:5000,category:'Other',date:today,type:'income'}];
  s.digital=[{date:today,screen:150,distraction:45,focus:60,notes:'Social media after lunch'}];
  s.plan=makePlan(s,today); return s;
}
export function classify(text) {
  if (/assignment|exam|class|revise|study|homework|semester/i.test(text)) return 'Academics';
  if (/coding|dsa|internship|portfolio|certification|leetcode|career|resume/i.test(text)) return 'Career';
  if (/walk|run|workout|sleep|water|gym|fitness|meal/i.test(text)) return 'Wellness';
  if (/budget|expense|saving|money|pay|finance/i.test(text)) return 'Finance';
  if (/screen|phone|distraction|digital/i.test(text)) return 'Digital'; return 'Personal';
}
export function parseTask(text,today=dayKey()) {
  let due=plusDays(today,7); const lower=text.toLowerCase();
  if (/\btomorrow\b/.test(lower)) due=plusDays(today,1); else if (/\btoday\b/.test(lower)) due=today;
  const explicit=text.match(/\b(\d{4}-\d{2}-\d{2})\b/); if(explicit && isDate(explicit[1])) due=explicit[1];
  const days=['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  days.forEach((d,i)=>{if(new RegExp('\\b'+d+'\\b').test(lower)){let offset=(i-new Date(today+'T12:00:00').getDay()+7)%7;if(lower.includes('next '+d))offset=offset||7;due=plusDays(today,offset);}});
  const inDays=lower.match(/in\s+(\d+)\s+days?/); if(inDays)due=plusDays(today,Math.min(365,+inDays[1]));
  const durationMatch=lower.match(/(\d+(?:\.\d+)?)\s*(hours?|hrs?|minutes?|mins?)\b/);
  const duration=durationMatch?Math.round(+durationMatch[1]*(durationMatch[2].startsWith('h')?60:1)):45;
  return {id:uid(),title:text.trim().slice(0,200),domain:classify(text),duration:Math.max(5,Math.min(1440,duration)),completedMinutes:0,due,priority:/urgent|important|exam/i.test(text)?3:2,status:'pending',created:today,notes:'',goalId:''};
}
export function isDate(s) {return typeof s==='string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && dayKey(new Date(s+'T12:00:00'))===s;}
export function learningFactor(state, domain) {
  const logs=state.history.filter(h=>h.kind==='completed'&&h.domain===domain&&h.estimated>0&&h.actual>0).slice(-20);
  if(!logs.length)return 1;
  return Math.max(.6,Math.min(2.5,logs.reduce((sum,h)=>sum+h.actual,0)/logs.reduce((sum,h)=>sum+h.estimated,0)));
}
export function freeWindows(state,date,from=0) {
  const p=state.profile;let windows=[[Math.max(minutes(p.dailyStart),from),minutes(p.dailyEnd)]];
  const weekday=new Date(date+'T12:00:00').getDay();
  for(const c of state.commitments.filter(c=>c.days.includes(weekday)&&(!c.date||c.date===date))){const start=minutes(c.start),end=minutes(c.end);windows=windows.flatMap(([a,b])=>end<=a||start>=b?[[a,b]]:[[a,Math.min(start,b)],[Math.max(end,a),b]]).filter(([a,b])=>b>a);}
  return windows.filter(([a,b])=>b>a);
}
export function capacity(state,date,from=0) {
  const sleep=state.wellness.find(x=>x.date===date)?.sleep;const multiplier=sleep!==undefined&&sleep<6?.75:1;
  const spent=state.history.filter(h=>h.kind==='completed'&&h.date===date).reduce((n,h)=>n+h.actual,0);
  const raw=freeWindows(state,date,from).reduce((n,[a,b])=>n+b-a,0);
  return Math.max(0,Math.min(raw,Math.floor(state.profile.availableMinutes*multiplier)-spent));
}
export function rankTasks(state,date) {
  return state.tasks.filter(t=>t.status!=='done').map(t=>{
    const days=Math.round((new Date(t.due+'T12:00:00')-new Date(date+'T12:00:00'))/86400000);
    const remaining=Math.max(0,t.duration-(t.completedMinutes||0));
    const duration=Math.max(5,Math.ceil(remaining*learningFactor(state,t.domain)/5)*5);
    const score=(days<0?150:days===0?110:80/(days+1))+t.priority*15+(t.goalId?8:0)+Math.min(10,30/duration);
    return {...t,remaining,adjustedDuration:duration,score,days};
  }).filter(t=>t.remaining>0).sort((a,b)=>b.score-a.score||a.due.localeCompare(b.due));
}
export function makePlan(state,date=dayKey(),from=0) {
  const windows=freeWindows(state,date,from); let budget=capacity(state,date,from),windowIndex=0,cursor=windows[0]?.[0]||0;
  const blocks=[],deferred=[];const ranked=rankTasks(state,date);
  for(const task of ranked){let left=task.adjustedDuration;
    while(left>0 && budget>=5 && windowIndex<windows.length){const end=windows[windowIndex][1];const slot=Math.min(end-cursor,budget,50,left);
      if(slot<5){windowIndex++;cursor=windows[windowIndex]?.[0]||0;continue;}
      blocks.push({id:uid(),taskId:task.id,title:task.title,domain:task.domain,start:cursor,end:cursor+slot,minutes:slot,estimated:slot/task.adjustedDuration*task.remaining});
      cursor+=slot;budget-=slot;left-=slot;
      const rest=state.profile.breakMinutes;cursor+=rest;budget=Math.max(0,budget-rest);
      if(cursor>=end){windowIndex++;cursor=windows[windowIndex]?.[0]||0;}
    }
    if(left>0)deferred.push({taskId:task.id,title:task.title,minutes:left});
  }
  return {date,from,generatedAt:new Date().toISOString(),blocks,deferred,capacity:capacity(state,date,from),used:blocks.reduce((n,b)=>n+b.minutes,0)};
}
export function risks(state,today=dayKey()) {
  const tasks=rankTasks(state,today).sort((a,b)=>a.due.localeCompare(b.due));let cumulative=0;
  return tasks.map(t=>{cumulative+=t.adjustedDuration;let available=0;const end=Math.min(Math.max(0,t.days),365);for(let d=0;d<=end;d++)available+=capacity(state,plusDays(today,d))*.8;
    const level=t.days<0?'Overdue':cumulative>available?'At risk':t.days<=1?'Due soon':'On track';return {...t,level};});
}
export function insights(state,today=dayKey()) {
  const out=[]; const r=risks(state,today).filter(t=>['Overdue','At risk'].includes(t.level));
  if(r.length)out.push({tone:'warning',title:`${r.length} deadline${r.length===1?' needs':'s need'} attention`,text:`${r[0].title}: ${r[0].level.toLowerCase()}. Reduce scope or make more time available.`});
  const w=state.wellness.find(w=>w.date===today);if(w&&w.sleep<6)out.push({tone:'warning',title:'Leave more breathing room',text:'You logged under 6 hours of sleep. Today’s planning budget is reduced by 25%.'});
  for(const domain of DOMAINS){const f=learningFactor(state,domain);if(f>1.15)out.push({tone:'info',title:`Allow more time for ${domain.toLowerCase()}`,text:`Recent sessions took ${Math.round((f-1)*100)}% longer than estimated. New plans include that adjustment.`});}
  const recent=state.history.filter(h=>h.date>=plusDays(today,-6)&&h.kind==='completed');const academic=recent.filter(h=>['Academics','Career'].includes(h.domain)).reduce((s,h)=>s+h.actual,0);const wellness=recent.filter(h=>h.domain==='Wellness').length;
  if(academic>=180&&!wellness)out.push({tone:'info',title:'Make room for wellness',text:'You logged at least 3 hours of academic or career work this week without a wellness session.'});
  const total=state.expenses.filter(e=>e.date.startsWith(today.slice(0,7))&&e.type==='expense').reduce((n,e)=>n+e.amount,0);
  if(total>state.profile.monthlyBudget*.8)out.push({tone:'warning',title:'Check your monthly spending',text:`You’ve used ${Math.round(total/Math.max(1,state.profile.monthlyBudget)*100)}% of your budget.`});
  const digital=state.digital.find(d=>d.date===today);if(digital?.screen>state.profile.screenTarget)out.push({tone:'info',title:'Screen time is above your target',text:'Consider a short screen-free block before your next study session.'});
  const missed=state.history.filter(h=>h.kind==='missed'&&h.date>=plusDays(today,-6));if(missed.length>=2)out.push({tone:'info',title:'Notice what interrupts your plan',text:`${missed.length} sessions were missed this week. Recent reason: ${missed.at(-1).reason}`});
  if(!out.length)out.push({tone:'info',title:recent.length?'Keep your momentum':'Your plan will learn with you',text:recent.length?'Your logged activity is within the thresholds being tracked. Keep recording actual session times.':'Complete sessions and record their actual duration to improve future estimates.'}); return out;
}
export function decompose(task) {
  const actions=task.domain==='Academics'?['Review requirements and key concepts','Work through the main questions','Check answers and submit']:task.domain==='Career'?['Define the outcome and gather resources','Complete a focused practice or build session','Review the result and record what you learned']:['Prepare and choose a clear first action','Complete the main activity','Review and record the outcome'];
  const total=Math.max(15,task.duration),base=Math.floor(total/3);return actions.map((action,i)=>({...task,id:uid(),title:`${task.title}: ${action}`.slice(0,200),duration:i===2?total-base*2:base,completedMinutes:0,status:'pending'}));
}
export function streak(habit,today=dayKey()) {
  let count=0;for(let i=0;i<366;i++){const d=plusDays(today,-i);if(!habit.days.includes(new Date(d+'T12:00:00').getDay()))continue;if(habit.checks.includes(d))count++;else if(i!==0)break;}return count;
}
