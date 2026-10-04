// Isolated probes of existing source: fake services, no network or real writes.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = process.cwd();
function load(relative, stubs) {
  const source = fs.readFileSync(path.join(root, relative),'utf8');
  const js = ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
  const mod={exports:{}};
  const safeRequire = name => {
    if(Object.hasOwn(stubs,name))return stubs[name];
    if(name==='server-only')return {};
    if(name==='zod')return require('zod');
    throw new Error('Unstubbed import: '+name);
  };
  vm.runInNewContext(js,{module:mod,exports:mod.exports,require:safeRequire,Buffer,Date,Math,console:{log(){},warn(){},error(){}},process:{env:{NODE_ENV:'test'}}},{filename:relative});
  return mod.exports;
}
const results=[];
const userId='00000000-0000-4000-8000-000000000001';
const mutations=[];
const authService=load('src/lib/auth/authService.ts',{});
let profile={id:userId,role:'student',is_active:true};
const fakeSupabase={
  auth:{getUser:async()=>({data:{user:{id:userId,email:authService.DEFAULT_ADMIN_EMAILS[0]}},error:null}),admin:{createUser:async(input)=>{mutations.push({kind:'auth.createUser',emailConfirmed:input.email_confirm});return {data:{user:{id:userId}},error:null};}}},
  from(table){const q={select(){return q;},eq(){return q;},maybeSingle:async()=>({data:table==='courses'?{id:'course-example',is_published:true}:profile,error:null}),upsert:async(payload)=>{mutations.push({kind:table+'.upsert',role:payload.role});return {error:null};},update(payload){mutations.push({kind:table+'.update',role:payload.role});return q;},then(resolve){return Promise.resolve({error:null}).then(resolve);}};return q;}
};
const infra={'@/infrastructure/supabase/server':{createSupabaseServiceClient:()=>fakeSupabase},'@/lib/auth/authService':authService};
async function run(){
  const signup=load('src/app/actions/signup.ts',{...infra,'next/headers':{headers:async()=>({get:()=>null})},'@/lib/rateLimit':{getClientIdentifier:()=> 'local-probe',rateLimit:async()=>({allowed:true}),RateLimitPresets:{SIGNUP_ATTEMPT:{}}}});
  const signupResult=await signup.registerForCourseAction({fullName:'Pessoa de Teste',phone:'11999999999',email:authService.DEFAULT_ADMIN_EMAILS[0],password:'LocalProbe123!',courseId:'course-example'});
  const session=load('src/lib/auth/supabase-session.ts',infra);
  const claims=await session.getSupabaseSessionClaims('FAKE_TOKEN_NOT_SENT');
  results.push({probe:'signup-and-admin-email',scope:'mocked service, not production',signupSuccess:signupResult.success,emailConfirmedWithoutEmailDelivery:mutations.some(x=>x.emailConfirmed===true),profileRole:profile.role,resolvedAdmin:claims.admin,expectedAdmin:false});
  const ensure=load('src/lib/auth/user-service.ts',infra);
  mutations.length=0;
  await ensure.ensureUserDoc({uid:userId,email:authService.DEFAULT_ADMIN_EMAILS[0]});
  results.push({probe:'ensureUserDoc-trusts-supplied-identity',scope:'direct function invocation; HTTP exposure unverified',writesWithoutSessionCheck:mutations.filter(x=>x.kind.endsWith('.update'))});
  profile={...profile,is_active:false};
  const claimsDisabled=await session.getSupabaseSessionClaims('FAKE_TOKEN_NOT_SENT');
  const guard=load('src/lib/auth/server.ts',{'next/headers':{cookies:async()=>({get:()=>({value:'FAKE_TOKEN_NOT_SENT'})})},'next/navigation':{redirect:()=>{throw new Error('redirect');}},'@/lib/auth/supabase-session':{getSupabaseSessionClaims:async()=>claimsDisabled},'@/lib/logger':{logger:{warn(){}}}});
  const disabledSession=await guard.requireSession();
  results.push({probe:'requireSession-disabled-profile',scope:'mocked service',returnedSession:true,isActive:disabledSession.isActive,expectedReturnedSession:false});
  const course=load('src/lib/courseService.ts',{'@/infrastructure/supabase/server':{},'./utils':{deepSafeSerialize:x=>x},'@/lib/presenters/mappers':{},'./auth/access-gate':{},'./auth/access-types':{},'@/features/courses/infrastructure/supabaseAdminCourseRepository.server':{listAdminLessons:async()=>[{id:'lesson-example',isPublished:false,blocks:[{id:'block-example',type:'text',content:'PRIVATE_TEST_CONTENT'}]}]},'@/features/enrollments/infrastructure/supabaseEnrollmentRepository.server':{},'@/features/progress/infrastructure/supabaseProgressRepository.server':{}});
  const content=await course.getLessonContent('course-example','module-example','lesson-example');
  results.push({probe:'getLessonContent-without-session',scope:'mocked repository; HTTP exposure depends on action manifest',returnedUnpublishedLesson:content.lesson.isPublished===false,returnedPrivateBlocks:content.blocks.length>0,expectedReturnedPrivateBlocks:false});
  const writes=[];
  const enrollment=load('src/lib/auth/enrollment-service.ts',{'@/infrastructure/supabase/server':{createSupabaseServiceClient:()=>({from:()=>({upsert:async data=>{writes.push(data);return {error:null};}})})},'@/lib/audit':{logAudit:async()=>{}}});
  await enrollment.writeEnrollmentMirror({uid:userId,courseId:'course-example',enrollmentDoc:{'stripe.subscriptionId':'sub_LOCAL_TEST','stripe.subscriptionStatus':'active'}});
  results.push({probe:'webhook-stripe-metadata-mapping',scope:'mocked repository',writtenSubscriptionId:writes[0].subscription_id??null,expectedSubscriptionId:'sub_LOCAL_TEST'});
  const pix=load('src/lib/pix.ts',{});
  const txId=courseId=>(userId+courseId).slice(0,25);
  const pixA=pix.buildPixPayload({key:'test@example.invalid',merchantName:'LOCAL TEST',merchantCity:'TEST'},{txId:txId('course-A')});
  const pixB=pix.buildPixPayload({key:'test@example.invalid',merchantName:'LOCAL TEST',merchantCity:'TEST'},{txId:txId('course-B')});
  results.push({probe:'pix-reference-collision',scope:'fake Pix key, no QR displayed or payment',samePayloadForDifferentCourses:pixA===pixB,expectedSamePayload:false});
  const out=path.join(root,'docs/audits/2026-10-03-evidence/probes.json');
  fs.writeFileSync(out,JSON.stringify(results,null,2)+'\n');
  console.log(JSON.stringify(results,null,2));
}
run().catch(error=>{console.error(error.message);process.exitCode=1;});
