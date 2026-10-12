begin;
set local lock_timeout = '5s';
set local statement_timeout = '30s';
alter table public.book_recommendations add column category text
  check (category is null or char_length(trim(category)) between 1 and 80);
comment on column public.book_recommendations.category is 'Categoria editorial definida pela equipe; nunca inferida automaticamente do texto.';
notify pgrst, 'reload schema';
commit;
