-- Read-only. Run in a restricted staging clone before the v2 migration.
-- Outputs counts/sizes only, never content or owners. The migration is atomic:
-- unknown slugs or oversized legacy payloads abort and preserve the source.
select resource_slug,count(*) as records,max(octet_length(payload::text)) as max_payload_bytes,
 bool_or(octet_length(payload::text)>16384) as incompatible_size
from public.interactive_resource_entries group by resource_slug order by resource_slug;
select 'need_records' as source,count(*) as records,max(octet_length(to_jsonb(r)::text)) as legacy_row_bytes from public.need_records r
union all select 'listening_sessions',count(*),max(octet_length(to_jsonb(r)::text)) from public.listening_sessions r
union all select 'pause_sessions',count(*),max(octet_length(to_jsonb(r)::text)) from public.pause_sessions r
union all select 'river_sessions',count(*),max(octet_length(to_jsonb(r)::text)) from public.river_sessions r;
-- Compare slugs to resourceCatalog.tsx and rehearse the complete transaction in
-- the clone. If incompatible: stop, export securely to the owner, and approve a
-- specific lossless converter. Never truncate, discard, or weaken the CHECK.
