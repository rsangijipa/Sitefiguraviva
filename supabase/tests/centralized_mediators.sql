-- Run after the migration. Every fixture and modification is rolled back.
begin;
insert into public.mediators(id,name,role,image,bio) values
 ('00000000-0000-4000-8000-000000000091','TEST MEDIATOR SHARED','TEST','/test.jpg','Original'),
 ('00000000-0000-4000-8000-000000000092','TEST MEDIATOR PRIVATE','TEST','','Private');
insert into public.courses(id,title,status,is_published,details) values
 ('test-mediator-course-public','TEST PUBLIC','open',true,'{"mediatorIds":["00000000-0000-4000-8000-000000000091"]}'),
 ('test-mediator-course-draft','TEST DRAFT','draft',false,'{"mediatorIds":["00000000-0000-4000-8000-000000000091","00000000-0000-4000-8000-000000000092"]}');
do $$ begin
 if (select count(*) from public.course_mediators where mediator_id='00000000-0000-4000-8000-000000000091')<>2 then raise exception 'Reuse failed'; end if;
 begin delete from public.mediators where id='00000000-0000-4000-8000-000000000091'; raise exception 'Linked deletion accepted'; exception when foreign_key_violation then null; end;
 begin insert into public.mediators(name) values(' test mediator shared '); raise exception 'Duplicate name accepted'; exception when unique_violation then null; end;
 begin update public.courses set details='{"mediatorIds":["00000000-0000-4000-8000-000000000099"]}' where id='test-mediator-course-public'; raise exception 'Unknown ID accepted'; exception when foreign_key_violation then null; end;
 begin update public.courses set details='{"mediators":[{"name":"Copy"}]}' where id='test-mediator-course-public'; raise exception 'Embedded copy accepted'; exception when raise_exception then
  if sqlerrm='Embedded copy accepted' then raise; end if;
 end;
 update public.mediators set bio='Updated shared biography' where id='00000000-0000-4000-8000-000000000091';
 if (select count(*) from public.course_mediators cm join public.mediators m on m.id=cm.mediator_id where m.bio='Updated shared biography')<>2 then raise exception 'Shared update failed'; end if;
 update public.courses set details='{"mediatorIds":[]}' where id='test-mediator-course-draft';
 if exists(select 1 from public.course_mediators where course_id='test-mediator-course-draft') then raise exception 'Unlink failed'; end if;
 update public.courses set details='{"mediatorIds":["00000000-0000-4000-8000-000000000091","00000000-0000-4000-8000-000000000092"]}' where id='test-mediator-course-draft';
end $$;
set local role anon;
do $$ begin
 if (select count(*) from public.mediators where name like 'TEST MEDIATOR%')<>1 then raise exception 'Draft/private profile exposed'; end if;
 if (select count(*) from public.course_mediators where course_id like 'test-mediator-course-%')<>1 then raise exception 'Draft link exposed'; end if;
 begin insert into public.mediators(name) values('Forbidden'); raise exception 'Anon insert accepted'; exception when insufficient_privilege then null; end;
 begin update public.mediators set bio='Forbidden'; raise exception 'Anon update accepted'; exception when insufficient_privilege then null; end;
 begin delete from public.mediators; raise exception 'Anon delete accepted'; exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role authenticated;
do $$ begin
 if exists(select 1 from public.mediators where name like 'TEST MEDIATOR%') then raise exception 'Missing session was accepted'; end if;
 begin insert into public.course_mediators(course_id,mediator_id) values('test-mediator-course-draft','00000000-0000-4000-8000-000000000092'); raise exception 'Missing-session insert accepted'; exception when insufficient_privilege then null; end;
 update public.course_mediators set course_id='test-mediator-course-draft';
 if found then raise exception 'Unauthorized link update accepted'; end if;
 delete from public.course_mediators;
 if found then raise exception 'Unauthorized link delete accepted'; end if;
end $$;
reset role;
select '16 integrity/access checks passed' as result;
rollback;
