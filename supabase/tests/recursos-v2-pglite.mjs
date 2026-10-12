// In-memory PostgreSQL only. Never connects to Supabase or uses credentials.
import { PGlite } from "../../.next-v2-tools/node_modules/@electric-sql/pglite/dist/index.js";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const db=new PGlite();
const uid={a:"00000000-0000-4000-8000-000000000001",b:"00000000-0000-4000-8000-000000000002",author:"00000000-0000-4000-8000-000000000003",reviewer:"00000000-0000-4000-8000-000000000004",admin:"00000000-0000-4000-8000-000000000005"};
const enrollment="00000000-0000-4000-8000-000000000010";
let checks=0;
async function denied(fn){await assert.rejects(fn);checks++;}
try{
 await db.exec(`
 create role anon nologin;create role authenticated nologin;create role service_role nologin bypassrls;
 create schema auth;create schema private;
 create table auth.users(id uuid primary key);
 create table public.profiles(id uuid primary key references auth.users(id),role text not null,is_active boolean not null default true);
 create table public.courses(id text primary key,is_published boolean not null,status text not null);
 create table public.enrollments(id uuid primary key,user_id uuid references public.profiles(id),course_id text references public.courses(id),status text);
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 create function private.current_auth_session_is_active() returns boolean language sql stable security invoker as $$select exists(select 1 from public.profiles where id=auth.uid() and is_active)$$;
 create function private.current_user_can_staff() returns boolean language sql stable security invoker as $$select exists(select 1 from public.profiles where id=auth.uid() and role in ('admin','tutor'))$$;
 create function private.current_user_can_admin() returns boolean language sql stable security invoker as $$select exists(select 1 from public.profiles where id=auth.uid() and role='admin')$$;
 grant usage on schema public,auth,private to anon,authenticated,service_role;
 grant select on public.profiles,public.courses,public.enrollments to authenticated,service_role;
 `);
 for(const id of Object.values(uid)) await db.query("insert into auth.users values($1);",[id]);
 for(const [name,id] of Object.entries(uid)) await db.query("insert into public.profiles values($1,$2,true)",[id,name==="admin"?"admin":"student"]);
 await db.exec("insert into public.courses values('formation-test',true,'open')");
 await db.query("insert into public.enrollments values($1,$2,'formation-test','active')",[enrollment,uid.a]);
 for(const file of ["202609100010_interactive_resource_entries.sql","202609110011_pause_sessions.sql","202609120001_listening_sessions.sql","202609120002_river_sessions.sql","202609130008_need_records.sql"]) await db.exec(readFileSync(new URL("../migrations/"+file,import.meta.url),"utf8"));
 const legacyAliases=['casoclinicointerativo','EmotionWheel','ciclodocontato','respiracao','rios-dos-pensamentos','check-in'];
 for(const slug of legacyAliases)await db.query("insert into public.interactive_resource_entries(user_id,resource_slug,payload) values($1,$2,$3)",[uid.a,slug,JSON.stringify({fixture:'Texto neutro de teste'})]);
 await db.exec(readFileSync(new URL("../migrations/20261012161154_recursos_interativos_v2.sql",import.meta.url),"utf8"));
 checks++;
 assert.equal((await db.query("select count(*)::int as count from public.interactive_resource_entries where legacy_record and schema_version=0 and formation_id is null and payload->>'fixture'='Texto neutro de teste' and expires_at>now()+interval '5 months'")).rows[0].count,legacyAliases.length);checks++;
 // Verify the production ACL first; a temporary grant below is solely a test
 // harness to exercise the RLS owner predicate independently of that ACL.
 await db.exec("set role authenticated");
 for(const table of ['arrival_records','polarity_records','phenomenology_lab_records','interactive_resource_entries','need_records','listening_sessions','pause_sessions','river_sessions'])await denied(()=>db.exec(`select id from public.${table}`));
 await db.exec("reset role;grant select on public.arrival_records to authenticated");
 await db.query("insert into public.resource_formation_retention values($1,$2,'formation-test','Formação de teste',now()+interval '1 year',null,now())",[enrollment,uid.a]);
 const payload={word:"Texto neutro de teste",body:[],emotion:"",intensity:null,needs:[],reflection:""};
 await db.query("insert into public.arrival_records(user_id,resource_key,schema_version,formation_id,client_request_id,payload,expires_at) values($1,'chegada',1,$2,$3,$4,now()+interval '18 months')",[uid.a,enrollment,"00000000-0000-4000-8000-000000000020",JSON.stringify(payload)]);
 await denied(()=>db.query("insert into public.arrival_records(user_id,resource_key,schema_version,formation_id,client_request_id,payload,expires_at) values($1,'chegada',1,$2,gen_random_uuid(),'{}',now()+interval '1 year')",[uid.b,enrollment]));
 await denied(()=>db.query("insert into public.arrival_records(user_id,resource_key,schema_version,formation_id,client_request_id,payload,expires_at) values($1,'casoteca',1,$2,gen_random_uuid(),'{}',now()+interval '1 year')",[uid.a,enrollment]));
 for(const [table,key,content]of [['need_records','necessidades-agora',{ids:[],reflection:''}],['listening_sessions','sons-para-awareness',{sceneId:'',observations:[],reflection:''}],['pause_sessions','sala-de-pausa',{practice:'respirar',seconds:0,reflection:''}],['river_sessions','paisagem-de-pensamentos',{mode:'rio',thoughts:[],reflection:''}]]){
  await db.query(`insert into public.${table}(user_id,resource_key,schema_version,formation_id,client_request_id,payload,expires_at) values($1,$2,1,$3,gen_random_uuid(),$4,now()+interval '3 years')`,[uid.a,key,enrollment,JSON.stringify(content)]);
  assert.equal((await db.query(`select count(*)::int as count from public.${table} r join public.resource_formation_retention f on f.enrollment_id=r.formation_id where r.expires_at>f.end_date+interval '6 months'`)).rows[0].count,0);checks++;
 }
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[uid.a]);await db.exec("set role authenticated");
 assert.equal((await db.query("select count(*)::int as count from public.arrival_records")).rows[0].count,1);checks++;
 await denied(()=>db.query("insert into public.arrival_records(user_id,resource_key,formation_id,client_request_id,payload,expires_at) values($1,'chegada',$2,gen_random_uuid(),'{}',now()+interval '1 year')",[uid.a,enrollment]));
 await denied(()=>db.exec("update public.arrival_records set user_id='00000000-0000-4000-8000-000000000002'"));
 await denied(()=>db.exec("delete from public.arrival_records"));
 await db.exec("reset role");await db.query("select set_config('request.jwt.claim.sub',$1,false)",[uid.b]);await db.exec("set role authenticated");
 assert.equal((await db.query("select count(*)::int as count from public.arrival_records")).rows[0].count,0);checks++;
 await db.exec("reset role");await db.query("select set_config('request.jwt.claim.sub',$1,false)",[uid.admin]);await db.exec("set role authenticated");
 assert.equal((await db.query("select count(*)::int as count from public.arrival_records")).rows[0].count,0);checks++;
 await denied(()=>db.query("select public.fv_resource_transition($1,'create','chegada',null,'{}',null)",[uid.admin]));
 await db.exec("reset role");
 await denied(()=>db.query("insert into public.arrival_records(user_id,resource_key,schema_version,formation_id,client_request_id,payload,expires_at) values($1,'chegada',1,$2,gen_random_uuid(),$3,now()+interval '1 year')",[uid.a,enrollment,JSON.stringify({word:"x".repeat(17000)})]));
 await denied(()=>db.query("insert into public.arrival_records(user_id,resource_key,schema_version,formation_id,client_request_id,payload,expires_at) values($1,'unknown-resource',1,$2,gen_random_uuid(),'{}',now()+interval '1 year')",[uid.a,enrollment]));
 await db.query("insert into public.resource_editorial_roles values($1,'docente_autor','Autor fictício de teste','00/0000'),($2,'docente_revisor','Revisor fictício de teste','00/0000')",[uid.author,uid.reviewer]);
 const empty={schemaVersion:1,resourceKey:"chegada",items:[],audio:[],artApprovalId:null};
 const transition=async(actor,action,row,configuration=null)=>{
  const result=await db.query("select public.fv_resource_transition($1,$2,'chegada',$3,$4,$5) as version",[actor,action,row?.id??null,configuration===null?null:JSON.stringify(configuration),row?.updated_at??null]);
  return result.rows[0].version;
 };
 let version=await transition(uid.author,"create",null,empty);
 await denied(()=>transition(uid.author,"submit",version));
 const configuration={...empty,items:[{id:"neutral-test",kind:"guidance",title:"Interface de teste",text:"Texto neutro de teste",references:[],asset:"",license:""}]};
 version=await transition(uid.author,"save",version,configuration);
 version=await transition(uid.author,"submit",version);
 await denied(()=>transition(uid.admin,"review",version));
 await denied(()=>transition(uid.admin,"publish",version));
 version=await transition(uid.reviewer,"review",version);
 assert.equal(version.reviewer_id,uid.reviewer);checks++;
 version=await transition(uid.author,"save",version,{...configuration,items:[{...configuration.items[0],text:"Outro texto neutro de teste"}]});
 assert.equal(version.status,"draft");assert.equal(version.reviewer_id,null);checks++;
 version=await transition(uid.author,"submit",version);version=await transition(uid.reviewer,"review",version);
 version=await transition(uid.admin,"publish",version);
 assert.equal(version.status,"published");checks++;
 await denied(()=>db.query("update public.resource_content_versions set configuration='{}' where id=$1",[version.id]));
 await denied(()=>db.query("delete from public.resource_content_versions where id=$1",[version.id]));
 let next=await transition(uid.author,"clone",version);next=await transition(uid.author,"submit",next);next=await transition(uid.reviewer,"review",next);next=await transition(uid.admin,"publish",next);
 assert.equal((await db.query("select count(*)::int as count from public.resource_content_versions where resource_key='chegada' and status='published'")).rows[0].count,1);checks++;
 await db.query("update public.resource_formation_retention set departure_date=now()-interval '7 months' where enrollment_id=$1",[enrollment]);
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[uid.a]);await db.exec("set role authenticated");
 assert.equal((await db.query("select count(*)::int as count from public.arrival_records")).rows[0].count,0);checks++;
 await db.exec("reset role");
 await db.query("update public.resource_formation_retention set end_date=now()+interval '2 years',departure_date=null where enrollment_id=$1",[enrollment]);
 assert.equal((await db.query("select count(*)::int as count from public.arrival_records where expires_at>now()")).rows[0].count,0);checks++;
 await db.exec("set role anon");
 assert.equal((await db.query("select count(*)::int as count from public.resource_content_versions")).rows[0].count,0);checks++;
 await db.exec("reset role;revoke select on public.arrival_records from authenticated");
 console.log(JSON.stringify({engine:"PGlite PostgreSQL in-memory",checks,passed:true,scope:"local synthetic fixtures; no remote migration, bibliography or publication"}));
}catch(error){console.error(error.message);process.exitCode=1;}finally{await db.close();}
