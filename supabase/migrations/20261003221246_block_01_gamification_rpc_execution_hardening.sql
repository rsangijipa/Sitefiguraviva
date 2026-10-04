-- Legacy RPC is absent from current application calls, but remains reachable
-- through the Data API. Restrict mutations to the trusted backend.
begin;

revoke all on function public.process_gamification_event(uuid, text, text, integer, jsonb, text[])
  from public, anon, authenticated;
grant execute on function public.process_gamification_event(uuid, text, text, integer, jsonb, text[])
  to service_role;

commit;
