begin;
set local lock_timeout='5s';
set local statement_timeout='30s';
alter table public.courses add column total_price_cents integer check(total_price_cents>=0);
alter table public.courses add column installment_count integer check(installment_count between 1 and 120);
-- Published closed offers keep their public detail. Draft and archived offers stay hidden.
alter policy courses_public_read on public.courses to anon,authenticated
 using(is_published=true and status in ('open','closed'));

create function public.set_course_commercial_state(p_actor uuid,p_course text,p_command text)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare c public.courses%rowtype; visible boolean; next_status public.course_status;
begin
 if not exists(select 1 from public.profiles where id=p_actor and is_active=true and role::text in ('admin','administrador')) then raise exception 'Administrator required' using errcode='42501'; end if;
 if p_command not in ('publish','unpublish','open','close') or p_command is null then raise exception 'Invalid command'; end if;
 select * into c from public.courses where id=p_course for update;
 if not found then raise exception 'Course not found'; end if;
 if c.status='archived' then raise exception 'Archived course requires separate restoration'; end if;
 visible:=c.is_published; next_status:=c.status;
 if p_command in ('publish','open') then
  if length(trim(coalesce(c.title,'')))=0 or length(trim(coalesce(c.description,'')))=0 or length(trim(coalesce(nullif(c.cover_image_url,''),c.image_url,'')))=0 then raise exception 'Title, description and cover required'; end if;
 end if;
 case p_command
 when 'publish' then visible:=true; if c.status='draft' then next_status:='closed'; end if;
 when 'unpublish' then visible:=false; if c.status='open' then next_status:='closed'; end if;
 when 'open' then
  if not visible then raise exception 'Publish the offer before opening enrollment'; end if;
  if c.pix_price_cents is null or c.pix_price_cents<=0 then raise exception 'Initial Pix price required'; end if;
  next_status:='open';
 when 'close' then if c.status='open' then next_status:='closed'; end if;
 end case;
 if c.is_published is distinct from visible or c.status is distinct from next_status then
  update public.courses set is_published=visible,status=next_status,content_revision=content_revision+1,updated_at=now() where id=p_course returning * into c;
 end if;
 return jsonb_build_object('id',c.id,'isPublished',c.is_published,'status',c.status,'contentRevision',c.content_revision);
end $$;
revoke all on function public.set_course_commercial_state(uuid,text,text) from public,anon,authenticated;
grant execute on function public.set_course_commercial_state(uuid,text,text) to service_role;
notify pgrst,'reload schema';
commit;
