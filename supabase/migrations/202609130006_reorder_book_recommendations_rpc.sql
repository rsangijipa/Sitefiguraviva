-- Atomic, transactional reordering for the admin-managed book shelf.
-- Accepts a closed ordered list of ids and assigns sort_order 1..n so no
-- partial write can ever leave duplicate or gapped positions.
create or replace function public.reorder_book_recommendations(p_ids uuid[])
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  expected_count integer;
  matched_count integer;
begin
  if p_ids is null or array_length(p_ids, 1) is null then
    raise exception 'No ids provided';
  end if;

  expected_count := array_length(p_ids, 1);

  select count(*) into matched_count
  from public.book_recommendations
  where id = any(p_ids);

  if matched_count <> expected_count then
    raise exception 'Reorder list does not match existing book_recommendations rows';
  end if;

  update public.book_recommendations br
  set sort_order = ordered.position,
      updated_at = now()
  from (
    select id, row_number() over () as position
    from unnest(p_ids) as id
  ) as ordered
  where br.id = ordered.id;
end;
$$;

revoke all on function public.reorder_book_recommendations(uuid[]) from public;
grant execute on function public.reorder_book_recommendations(uuid[]) to service_role;
