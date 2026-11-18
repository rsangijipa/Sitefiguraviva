-- Limites do bucket course-assets que já vigoram em produção (conferido em
-- 2026-11-15 pela API de storage). Eles tinham sido acrescentados ao arquivo
-- 202609100006 depois de aplicado; o histórico remoto guarda a versão antiga.
-- Idempotente: em produção não muda nada; em banco novo reproduz o estado.
begin;
update storage.buckets
set
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif'
  ]::text[]
where id = 'course-assets';
commit;
