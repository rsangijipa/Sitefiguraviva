-- Execute only in an isolated database after the migration. Fixtures roll back.
begin;
insert into auth.users(id) values ('00000000-0000-4000-8000-000000000081'), ('00000000-0000-4000-8000-000000000082'), ('00000000-0000-4000-8000-000000000087');
insert into public.profiles(id,email,role) values
 ('00000000-0000-4000-8000-000000000081','audit-a@example.test','student'),
 ('00000000-0000-4000-8000-000000000082','audit-b@example.test','tutor'),
 ('00000000-0000-4000-8000-000000000087','audit-admin@example.test','admin');
insert into public.courses(id,title,status,is_published) values
 ('audit-course-a','Audit A','open',true), ('audit-course-b','Audit B','open',true), ('audit-course-c','Audit C','open',true);
update public.courses set team = '{"00000000-0000-4000-8000-000000000082":{"role":"tutor"}}' where id = 'audit-course-a';
insert into public.enrollments(user_id,course_id,status) values
 ('00000000-0000-4000-8000-000000000081','audit-course-a','active'),
 ('00000000-0000-4000-8000-000000000082','audit-course-b','active');
insert into public.community_threads(id,course_id,title,content,author_name) values
 ('audit-thread-a','audit-course-a','Audit A','A','A'), ('audit-thread-b','audit-course-b','Audit B','B','B'),
 ('audit-thread-c','audit-course-c','Audit C','C','C');
insert into public.presence(id,user_id,context_id,name) values
 ('audit-presence-a','00000000-0000-4000-8000-000000000081','audit-thread-a','A'),
 ('audit-presence-b','00000000-0000-4000-8000-000000000082','audit-thread-b','B'),
 ('audit-presence-c','00000000-0000-4000-8000-000000000081','audit-thread-c','C'),
 ('audit-presence-audio','00000000-0000-4000-8000-000000000082','audio-unscoped','B');
insert into public.announcements(title,content,course_id,target_audience,publish_at) values
 ('audit-all','All',null,'all',null), ('audit-course-a','A','audit-course-a','all',null),
 ('audit-course-b','B','audit-course-b','all',null), ('audit-future','Future',null,'all',now()+interval '1 day'),
 ('audit-course-c','C','audit-course-c','all',null),
 ('audit-staff','Staff',null,'staff',null);
insert into public.certificates(user_id,course_id,code,metadata) values
 ('00000000-0000-4000-8000-000000000081','audit-course-a','AUDIT-PUBLIC-CODE',
  '{"studentName":"Student A","courseName":"Audit A","hours":20,"email":"secret@example.test","internal":"secret"}');
-- Use authentic session ids so the existing restrictive session gate is exercised.
insert into auth.sessions(id,user_id) values
 ('00000000-0000-4000-8000-000000000083','00000000-0000-4000-8000-000000000081'),
 ('00000000-0000-4000-8000-000000000084','00000000-0000-4000-8000-000000000082'),
 ('00000000-0000-4000-8000-000000000088','00000000-0000-4000-8000-000000000087');
insert into public.assessments(id,course_id,title,status,questions) values
 ('audit-assessment-a','audit-course-a','Audit quiz','published',
 '[{"id":"q1","type":"multiple_choice","options":[{"id":"a","text":"A","isCorrect":true}]},{"id":"q2","type":"true_false","correctAnswer":true,"rubric":"secret"}]'),
 ('audit-assessment-b','audit-course-b','Other quiz','published','[]'),
 ('audit-assessment-draft','audit-course-a','Draft quiz','draft','[]'),
 ('audit-assessment-unassigned-draft','audit-course-b','Other draft quiz','draft','[]'),
 ('audit-assessment-c','audit-course-c','Unrelated quiz','published','[]');
insert into public.assessment_submissions(id,user_id,assessment_id,course_id,status,answers) values
 ('00000000-0000-4000-8000-000000000085','00000000-0000-4000-8000-000000000081','audit-assessment-a','audit-course-a','submitted','[{"questionId":"q1","pointsEarned":0}]'),
 ('00000000-0000-4000-8000-000000000086','00000000-0000-4000-8000-000000000081','audit-assessment-c','audit-course-c','submitted','[]');
insert into public.assessment_progress(user_id,assessment_id,course_id)
 values ('00000000-0000-4000-8000-000000000081','audit-assessment-a','audit-course-a'),
 ('00000000-0000-4000-8000-000000000081','audit-assessment-c','audit-course-c');
-- Simulate unexpected permissive policies: restrictive audience gates must win.
create policy audit_extra_permissive_read on public.assessment_submissions for select to authenticated using (true);
create policy audit_extra_permissive_read on public.assessment_progress for select to authenticated using (true);
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000081',true);
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000081","session_id":"00000000-0000-4000-8000-000000000083"}',true);
set local role authenticated;
do $$ declare assessment jsonb; begin
 if public.current_profile_role() <> 'student' then raise exception 'Profile helper recursion/regression'; end if;
 if not public.current_auth_session_is_active() then raise exception 'Session helper regression'; end if;
 if (select count(*) from public.presence where id like 'audit-presence-%') <> 1 then raise exception 'Presence context leaked'; end if;
 if (select count(*) from public.announcements where title like 'audit-%') <> 2 then raise exception 'Announcement audience/scheduling leaked'; end if;
 assessment := public.get_student_assessment('audit-assessment-a');
 if assessment is null or assessment::text like '%isCorrect%' or assessment::text like '%correctAnswer%' or assessment::text like '%rubric%' then raise exception 'Answer keys leaked'; end if;
 if public.get_student_assessment('audit-assessment-b') is not null or public.get_student_assessment('audit-assessment-draft') is not null then raise exception 'Unauthorized assessment read'; end if;
 begin
  perform questions from public.assessments;
  raise exception 'Direct REST answer key access allowed';
 exception when insufficient_privilege then null; end;
 if not exists(select 1 from public.assessment_submissions where id='00000000-0000-4000-8000-000000000085') then raise exception 'Own history SELECT removed'; end if;
 begin
  insert into public.assessment_submissions(user_id,assessment_id,course_id,status,score,passed)
   values ('00000000-0000-4000-8000-000000000081','audit-assessment-a','audit-course-a','graded',100,true);
  raise exception 'Student forged graded submission';
 exception when insufficient_privilege then null; end;
 begin
  update public.assessment_submissions set answers='[{"questionId":"q1","pointsEarned":100}]' where id='00000000-0000-4000-8000-000000000085';
  raise exception 'Student tampered submitted answer score';
 exception when insufficient_privilege then null; end;
 begin
  update public.assessment_progress set passed=true,best_score=100 where assessment_id='audit-assessment-a';
  raise exception 'Student forged assessment progress';
 exception when insufficient_privilege then null; end;
 begin
  insert into public.assessment_progress(user_id,assessment_id,course_id,passed)
   values ('00000000-0000-4000-8000-000000000081','audit-assessment-b','audit-course-b',true);
  raise exception 'Student inserted forged progress';
 exception when insufficient_privilege then null; end;
 begin
  delete from public.assessment_submissions where id='00000000-0000-4000-8000-000000000085';
  raise exception 'Student deleted submitted history';
 exception when insufficient_privilege then null; end;
 begin
  insert into public.presence(id,user_id,context_id,name) values ('audit-forbidden','00000000-0000-4000-8000-000000000081','audit-thread-b','Spoof');
  raise exception 'Unauthorized thread presence accepted';
 exception when insufficient_privilege then null; end;
 begin
  update public.profiles set role='admin' where id='00000000-0000-4000-8000-000000000081';
  raise exception 'Governance trigger no longer protects profiles';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
-- Staff receive the answer key only from the authorized RPC.
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000082',true);
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000082","session_id":"00000000-0000-4000-8000-000000000084"}',true);
set local role authenticated;
do $$ begin
 if public.get_student_assessment('audit-assessment-a')::text not like '%isCorrect%' then raise exception 'Staff grading key unavailable'; end if;
 if public.get_student_assessment('audit-assessment-draft') is null then raise exception 'Staff draft editing unavailable'; end if;
 if public.get_student_assessment('audit-assessment-unassigned-draft') is not null then raise exception 'Unassigned tutor received draft'; end if;
 if public.current_user_can_access_course('audit-course-c') then raise exception 'Global tutor role grants unrelated course'; end if;
 if exists(select 1 from public.presence where context_id = 'audit-thread-c') then raise exception 'Tutor unrelated presence leaked'; end if;
 if exists(select 1 from public.announcements where course_id = 'audit-course-c') then raise exception 'Tutor unrelated announcement leaked'; end if;
 if not exists(select 1 from public.assessment_submissions where course_id='audit-course-a')
    or not exists(select 1 from public.assessment_progress where course_id='audit-course-a') then raise exception 'Assigned tutor cannot read grading queue'; end if;
 if exists(select 1 from public.assessment_submissions where course_id='audit-course-c')
    or exists(select 1 from public.assessment_progress where course_id='audit-course-c') then raise exception 'Unassigned tutor can read student work'; end if;
 begin
  update public.assessment_submissions set score=100,passed=true where id='00000000-0000-4000-8000-000000000085';
  raise exception 'Tutor can forge grade through REST';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
insert into public.auth_session_revocations(user_id,revoked_before)
 values ('00000000-0000-4000-8000-000000000082',clock_timestamp());
set local role authenticated;
do $$ begin
 if public.current_auth_session_is_active() then raise exception 'Revoked session accepted'; end if;
 if public.get_student_assessment('audit-assessment-a') is not null then raise exception 'Revoked staff received answer key'; end if;
end $$;
reset role;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000087',true);
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000087","session_id":"00000000-0000-4000-8000-000000000088"}',true);
set local role authenticated;
do $$ begin
 if not exists(select 1 from public.assessment_submissions where course_id='audit-course-c')
   or not exists(select 1 from public.assessment_progress where course_id='audit-course-c') then raise exception 'Admin cannot read grading queues'; end if;
end $$;
reset role;
select set_config('request.jwt.claim.sub','',true);
select set_config('request.jwt.claims','{}',true);
set local role anon;
do $$ declare result jsonb; begin
 select metadata into result from public.verify_public_certificate('AUDIT-PUBLIC-CODE');
 if result->>'studentName' <> 'Student A' or result->>'courseName' <> 'Audit A' or result ? 'email' or result ? 'internal' then raise exception 'Certificate public projection leaked'; end if;
 if exists(select 1 from public.verify_public_certificate('UNKNOWN')) then raise exception 'Unknown certificate accepted'; end if;
 if public.current_user_can_access_course('audit-course-a') then raise exception 'Anonymous course access'; end if;
 if has_function_privilege('anon','public.prevent_profile_privilege_escalation()','execute') then raise exception 'Trigger RPC exposed'; end if;
 if has_table_privilege('anon','public.assessment_submissions','insert') or has_table_privilege('anon','public.assessment_progress','update') then raise exception 'Anonymous result writes allowed'; end if;
end $$;
reset role;
set local role service_role;
do $$ begin
 update public.assessment_submissions set score=1,percentage=100,passed=true,status='graded' where id='00000000-0000-4000-8000-000000000085';
 if not found then raise exception 'Authoritative server grading unavailable'; end if;
 update public.assessment_progress set passed=true,best_score=1 where assessment_id='audit-assessment-a';
 if not found then raise exception 'Authoritative server progress unavailable'; end if;
end $$;
reset role;
do $$ begin
 if exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.prosecdef and p.proname like 'current_%') then raise exception 'Privileged helpers remain public'; end if;
 if not exists(select 1 from pg_proc where oid='public.set_updated_at()'::regprocedure and proconfig @> array['search_path=""']) then raise exception 'Mutable search_path'; end if;
end $$;
rollback;
