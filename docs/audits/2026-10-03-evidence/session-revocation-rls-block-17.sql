-- Teste transacional com fixtures; executar somente em homologação.
-- A migração 20261004163454 precisa estar instalada dentro da mesma transação.
-- Não aplicar em produção; o teste termina com ROLLBACK.
begin;
do $$ declare u uuid := '00000000-0000-4000-8000-000000000017'; s uuid := '00000000-0000-4000-8000-000000000018'; visible integer; begin
insert into auth.users(id,email,raw_user_meta_data) values(u,'block17-policy@example.invalid','{}');
insert into public.profiles(id,email,role,is_active) values(u,'block17-policy@example.invalid','student',true) on conflict(id) do update set is_active=true,role='student';
insert into auth.sessions(id,user_id,created_at,updated_at) values(s,u,clock_timestamp(),clock_timestamp());
perform set_config('request.jwt.claims',jsonb_build_object('sub',u,'session_id',s,'role','authenticated')::text,true);
execute 'set local role authenticated';
select count(*) into visible from public.profiles where id=u;
if visible<>1 then raise exception 'Active own profile unavailable'; end if;
execute 'reset role';
perform set_config('request.jwt.claims','{}',true);
update public.profiles set is_active=false where id=u;
update public.profiles set is_active=true where id=u;
perform set_config('request.jwt.claims',jsonb_build_object('sub',u,'session_id',s,'role','authenticated')::text,true);
execute 'set local role authenticated';
select count(*) into visible from public.profiles where id=u;
if visible<>0 then raise exception 'Revoked profile remains readable'; end if;
execute 'reset role';
delete from auth.sessions where id=s;
insert into auth.sessions(id,user_id,created_at,updated_at) values(s,u,clock_timestamp(),clock_timestamp());
execute 'set local role authenticated';
select count(*) into visible from public.profiles where id=u;
if visible<>1 then raise exception 'Reauthenticated profile unavailable'; end if;
execute 'reset role';
end $$;
select 'three authenticated RLS session checks passed; fixture rolled back' as verification;
rollback;
