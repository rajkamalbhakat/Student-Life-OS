export function registerAgentTools({context,getPlan,startTask}){
 if(!context?.registerTool)return ()=>{};
 const lifecycle=new AbortController();
 const tools=[{name:'orbit_get_plan',title:'Read Orbit daily plan',description:'Read the signed-in user’s current plan. Does not change records.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:true},execute:()=>getPlan()},
 {name:'orbit_start_task_creation',title:'Start task creation',description:'Open the task form with a suggested title for review. Does not save or create a task.',inputSchema:{type:'object',properties:{title:{type:'string',minLength:1,maxLength:200}},required:['title'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:input=>{if(!input||typeof input.title!=='string'||!input.title.trim()||input.title.length>200)throw new Error('Provide a task title of 1–200 characters');startTask(input.title);return {status:'form_opened',saved:false};}}];
 for(const tool of tools){try{Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{/* Unsupported experimental implementations do not block the application. */}}
 return ()=>lifecycle.abort();
}
