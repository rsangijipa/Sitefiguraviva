-- Recursos Interativos v2 — devolução editorial.
--
-- O fluxo original só avançava (rascunho → submetido → assinado → publicado).
-- Sem uma volta, uma versão com problema ficava parada aguardando a própria
-- pessoa autora perceber. Esta migração acrescenta a ação `return`: revisão
-- docente independente ou administração devolvem uma versão submetida ou
-- assinada ao rascunho, com uma observação obrigatória que fica visível para a
-- autoria. A assinatura é sempre descartada na devolução.

alter table public.resource_content_versions
 add column review_note text check(review_note is null or char_length(trim(review_note)) between 10 and 2000),
 add column returned_at timestamptz,
 add column returned_by uuid references public.profiles(id);

drop function public.fv_resource_transition(uuid,text,public.fv_resource_key,uuid,jsonb,timestamptz);

create function public.fv_resource_transition(
 p_actor uuid,p_action text,p_resource_key public.fv_resource_key,p_version_id uuid,
 p_configuration jsonb,p_expected_updated_at timestamptz,p_note text default null
) returns jsonb language plpgsql security invoker set search_path=pg_catalog,public,private
as $$
declare current_row public.resource_content_versions; reviewer public.resource_editorial_roles;
 author_ok boolean; admin_ok boolean; reviewer_ok boolean; next_version integer; item jsonb;
begin
 if not exists(select 1 from public.profiles where id=p_actor and is_active) then raise exception 'Inactive author'; end if;
 select exists(select 1 from public.resource_editorial_roles where user_id=p_actor and role='docente_autor') into author_ok;
 select exists(select 1 from public.resource_editorial_roles where user_id=p_actor and role='docente_revisor') into reviewer_ok;
 select exists(select 1 from public.profiles where id=p_actor and role='admin' and is_active) into admin_ok;
 perform pg_advisory_xact_lock(hashtext(p_resource_key::text));
 if p_action='create' then
  if not(author_ok or admin_ok) then raise exception 'Author permission required'; end if;
  if p_configuration->>'resourceKey'<>p_resource_key::text or p_configuration->>'schemaVersion'<>'1' or jsonb_array_length(p_configuration->'items')<>0 then raise exception 'New draft must be empty'; end if;
  select coalesce(max(version),0)+1 into next_version from public.resource_content_versions where resource_key=p_resource_key;
  insert into public.resource_content_versions(resource_key,version,configuration) values(p_resource_key,next_version,p_configuration) returning * into current_row;
  return to_jsonb(current_row);
 end if;
 select * into current_row from public.resource_content_versions where id=p_version_id and resource_key=p_resource_key for update;
 if current_row.id is null then raise exception 'Version unavailable'; end if;
 if p_action<>'clone' and (p_expected_updated_at is null or current_row.updated_at<>p_expected_updated_at) then raise exception 'Version changed'; end if;
 if p_action='clone' then
  if not(author_ok or admin_ok) then raise exception 'Author permission required'; end if;
  select coalesce(max(version),0)+1 into next_version from public.resource_content_versions where resource_key=p_resource_key;
  insert into public.resource_content_versions(resource_key,version,configuration,authored_by) values(p_resource_key,next_version,current_row.configuration,current_row.authored_by) returning * into current_row;
 elsif p_action='save' then
  if not author_ok or current_row.status not in ('draft','submitted','reviewed') then raise exception 'Author permission required'; end if;
  if p_configuration->>'resourceKey'<>p_resource_key::text or p_configuration->>'schemaVersion'<>'1' then raise exception 'Invalid resource configuration'; end if;
  update public.resource_content_versions set configuration=p_configuration,authored_by=p_actor,status='draft',reviewer_id=null,reviewer_name=null,reviewer_crp=null,reviewed_at=null where id=current_row.id returning * into current_row;
 elsif p_action='return' then
  -- A devolução não pode ser feita pela própria autoria: ela já pode salvar.
  if not(admin_ok or (reviewer_ok and coalesce(current_row.authored_by<>p_actor,true))) then raise exception 'Reviewer or publisher required'; end if;
  if current_row.status not in ('submitted','reviewed') then raise exception 'Only versions in review can be returned'; end if;
  if char_length(trim(coalesce(p_note,''))) not between 10 and 2000 then raise exception 'Return note required'; end if;
  update public.resource_content_versions set status='draft',reviewer_id=null,reviewer_name=null,reviewer_crp=null,reviewed_at=null,
   review_note=trim(p_note),returned_at=now(),returned_by=p_actor where id=current_row.id returning * into current_row;
 elsif p_action in ('submit','review','publish') then
  if current_row.authored_by is null or jsonb_array_length(current_row.configuration->'items')=0 then raise exception 'Docente authorship required'; end if;
  for item in select value from jsonb_array_elements(current_row.configuration->'items') loop
   if trim(coalesce(item->>'title',''))='' or trim(coalesce(item->>'text',''))='' or (item->>'kind'<>'guidance' and jsonb_array_length(item->'references')=0) then raise exception 'Complete theoretical content and references required'; end if;
   if coalesce(item->>'asset','')<>'' and (trim(coalesce(item->>'license',''))='' or not exists(select 1 from public.resource_art_approvals where id=(current_row.configuration->>'artApprovalId')::uuid)) then raise exception 'Art approval required'; end if;
  end loop;
  if p_action='submit' then
   if not author_ok or current_row.status<>'draft' then raise exception 'Author permission required'; end if;
   update public.resource_content_versions set status='submitted' where id=current_row.id returning * into current_row;
  elsif p_action='review' then
   select * into reviewer from public.resource_editorial_roles where user_id=p_actor and role='docente_revisor';
   if reviewer.user_id is null or current_row.status<>'submitted' or current_row.authored_by=p_actor then raise exception 'Independent reviewer permission required'; end if;
   update public.resource_content_versions set status='reviewed',reviewer_id=p_actor,reviewer_name=reviewer.name,reviewer_crp=reviewer.crp,reviewed_at=now(),review_note=null where id=current_row.id returning * into current_row;
  else
   if not admin_ok or current_row.status<>'reviewed' then raise exception 'Signed version and publisher required'; end if;
   update public.resource_content_versions set status='archived' where resource_key=p_resource_key and status='published';
   update public.resource_content_versions set status='published' where id=current_row.id returning * into current_row;
  end if;
 else raise exception 'Unknown editorial transition';
 end if;
 return to_jsonb(current_row);
end $$;
revoke all on function public.fv_resource_transition(uuid,text,public.fv_resource_key,uuid,jsonb,timestamptz,text) from public,anon,authenticated;
grant execute on function public.fv_resource_transition(uuid,text,public.fv_resource_key,uuid,jsonb,timestamptz,text) to service_role;
