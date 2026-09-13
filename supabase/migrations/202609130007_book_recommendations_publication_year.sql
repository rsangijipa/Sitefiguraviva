-- Optional publication year shown in the book detail modal on /estante.
alter table public.book_recommendations
  add column if not exists publication_year integer;

alter table public.book_recommendations
  drop constraint if exists book_recommendations_publication_year_check;
alter table public.book_recommendations
  add constraint book_recommendations_publication_year_check
  check (publication_year is null or publication_year between 0 and 9999);
