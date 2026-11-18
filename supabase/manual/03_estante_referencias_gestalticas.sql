-- Estante: obras citadas nas Cartas Gestálticas, como RASCUNHOS (is_published = false).
-- Revise capas e descrições no admin (Livros) antes de publicar. Idempotente: não duplica título + autor.
-- Os links são da Amazon Brasil (produto direto ou busca); confirme disponibilidade e edição antes de publicar.

insert into public.book_recommendations (title, author, description, cover_image_url, cover_storage_path, purchase_url, publication_year, category, is_published, sort_order)
select 'Eu e Tu', 'Martin Buber', '', '', '', 'https://www.amazon.com.br/dp/8588208164', 1923, 'Gestalt-terapia', false, (select coalesce(max(sort_order),0)+1 from public.book_recommendations)
where not exists (select 1 from public.book_recommendations where lower(title)=lower('Eu e Tu') and lower(author)=lower('Martin Buber'));

insert into public.book_recommendations (title, author, description, cover_image_url, cover_storage_path, purchase_url, publication_year, category, is_published, sort_order)
select 'Pele negra, máscaras brancas', 'Frantz Fanon', '', '', '', 'https://www.amazon.com.br/dp/6586497205', 2008, 'Gestalt-terapia', false, (select coalesce(max(sort_order),0)+1 from public.book_recommendations)
where not exists (select 1 from public.book_recommendations where lower(title)=lower('Pele negra, máscaras brancas') and lower(author)=lower('Frantz Fanon'));

insert into public.book_recommendations (title, author, description, cover_image_url, cover_storage_path, purchase_url, publication_year, category, is_published, sort_order)
select 'Gestalt-terapia: fundamentos epistemológicos e influências filosóficas', 'Lilian Meyer Frazão e Karina Okajima Fukumitsu (org.)', '', '', '', 'https://www.amazon.com.br/s?k=Gestalt-terapia%3A+fundamentos+epistemol%C3%B3gicos+e+influ%C3%AAncias+filos%C3%B3ficas+Lilian+Meyer+Fraz%C3%A3o+e+Karina+Okajima+Fukumitsu+%28org.%29', 2013, 'Gestalt-terapia', false, (select coalesce(max(sort_order),0)+1 from public.book_recommendations)
where not exists (select 1 from public.book_recommendations where lower(title)=lower('Gestalt-terapia: fundamentos epistemológicos e influências filosóficas') and lower(author)=lower('Lilian Meyer Frazão e Karina Okajima Fukumitsu (org.)'));

insert into public.book_recommendations (title, author, description, cover_image_url, cover_storage_path, purchase_url, publication_year, category, is_published, sort_order)
select 'Pedagogia do oprimido', 'Paulo Freire', '', '', '', 'https://www.amazon.com.br/dp/8577534189', 1987, 'Gestalt-terapia', false, (select coalesce(max(sort_order),0)+1 from public.book_recommendations)
where not exists (select 1 from public.book_recommendations where lower(title)=lower('Pedagogia do oprimido') and lower(author)=lower('Paulo Freire'));

insert into public.book_recommendations (title, author, description, cover_image_url, cover_storage_path, purchase_url, publication_year, category, is_published, sort_order)
select 'Gestalt: uma terapia do contato', 'Serge Ginger e Anne Ginger', '', '', '', 'https://www.amazon.com.br/dp/8532304524', 1995, 'Gestalt-terapia', false, (select coalesce(max(sort_order),0)+1 from public.book_recommendations)
where not exists (select 1 from public.book_recommendations where lower(title)=lower('Gestalt: uma terapia do contato') and lower(author)=lower('Serge Ginger e Anne Ginger'));

insert into public.book_recommendations (title, author, description, cover_image_url, cover_storage_path, purchase_url, publication_year, category, is_published, sort_order)
select 'De pessoa a pessoa: psicoterapia dialógica', 'Richard Hycner', '', '', '', 'https://www.amazon.com.br/dp/8532304559', 1995, 'Gestalt-terapia', false, (select coalesce(max(sort_order),0)+1 from public.book_recommendations)
where not exists (select 1 from public.book_recommendations where lower(title)=lower('De pessoa a pessoa: psicoterapia dialógica') and lower(author)=lower('Richard Hycner'));

insert into public.book_recommendations (title, author, description, cover_image_url, cover_storage_path, purchase_url, publication_year, category, is_published, sort_order)
select 'Relação e cura em Gestalt-terapia', 'Richard Hycner e Lynne Jacobs', '', '', '', 'https://www.amazon.com.br/s?k=Rela%C3%A7%C3%A3o+e+cura+em+Gestalt-terapia+Richard+Hycner+e+Lynne+Jacobs', 1997, 'Gestalt-terapia', false, (select coalesce(max(sort_order),0)+1 from public.book_recommendations)
where not exists (select 1 from public.book_recommendations where lower(title)=lower('Relação e cura em Gestalt-terapia') and lower(author)=lower('Richard Hycner e Lynne Jacobs'));

insert into public.book_recommendations (title, author, description, cover_image_url, cover_storage_path, purchase_url, publication_year, category, is_published, sort_order)
select 'Ideias para adiar o fim do mundo', 'Ailton Krenak', '', '', '', 'https://www.amazon.com.br/s?k=Ideias+para+adiar+o+fim+do+mundo+Ailton+Krenak', 2019, 'Gestalt-terapia', false, (select coalesce(max(sort_order),0)+1 from public.book_recommendations)
where not exists (select 1 from public.book_recommendations where lower(title)=lower('Ideias para adiar o fim do mundo') and lower(author)=lower('Ailton Krenak'));

insert into public.book_recommendations (title, author, description, cover_image_url, cover_storage_path, purchase_url, publication_year, category, is_published, sort_order)
select 'Princípios de psicologia topológica', 'Kurt Lewin', '', '', '', 'https://www.amazon.com.br/dp/B09NGZ7P99', 1973, 'Gestalt-terapia', false, (select coalesce(max(sort_order),0)+1 from public.book_recommendations)
where not exists (select 1 from public.book_recommendations where lower(title)=lower('Princípios de psicologia topológica') and lower(author)=lower('Kurt Lewin'));

insert into public.book_recommendations (title, author, description, cover_image_url, cover_storage_path, purchase_url, publication_year, category, is_published, sort_order)
select 'Fenomenologia da percepção', 'Maurice Merleau-Ponty', '', '', '', 'https://www.amazon.com.br/dp/8546902313', 1999, 'Gestalt-terapia', false, (select coalesce(max(sort_order),0)+1 from public.book_recommendations)
where not exists (select 1 from public.book_recommendations where lower(title)=lower('Fenomenologia da percepção') and lower(author)=lower('Maurice Merleau-Ponty'));

insert into public.book_recommendations (title, author, description, cover_image_url, cover_storage_path, purchase_url, publication_year, category, is_published, sort_order)
select 'Ego, fome e agressão', 'Frederick (Fritz) Perls', '', '', '', 'https://www.amazon.com.br/s?k=Ego%2C+fome+e+agress%C3%A3o+Frederick+%28Fritz%29+Perls', 2002, 'Gestalt-terapia', false, (select coalesce(max(sort_order),0)+1 from public.book_recommendations)
where not exists (select 1 from public.book_recommendations where lower(title)=lower('Ego, fome e agressão') and lower(author)=lower('Frederick (Fritz) Perls'));

insert into public.book_recommendations (title, author, description, cover_image_url, cover_storage_path, purchase_url, publication_year, category, is_published, sort_order)
select 'Gestalt-terapia explicada', 'Frederick (Fritz) Perls', '', '', '', 'https://www.amazon.com.br/s?k=Gestalt-terapia+explicada+Frederick+%28Fritz%29+Perls', 1977, 'Gestalt-terapia', false, (select coalesce(max(sort_order),0)+1 from public.book_recommendations)
where not exists (select 1 from public.book_recommendations where lower(title)=lower('Gestalt-terapia explicada') and lower(author)=lower('Frederick (Fritz) Perls'));

insert into public.book_recommendations (title, author, description, cover_image_url, cover_storage_path, purchase_url, publication_year, category, is_published, sort_order)
select 'Gestalt-terapia', 'Frederick Perls, Ralph Hefferline e Paul Goodman', '', '', '', 'https://www.amazon.com.br/dp/853230625X', 1997, 'Gestalt-terapia', false, (select coalesce(max(sort_order),0)+1 from public.book_recommendations)
where not exists (select 1 from public.book_recommendations where lower(title)=lower('Gestalt-terapia') and lower(author)=lower('Frederick Perls, Ralph Hefferline e Paul Goodman'));

insert into public.book_recommendations (title, author, description, cover_image_url, cover_storage_path, purchase_url, publication_year, category, is_published, sort_order)
select 'Living at the boundary', 'Laura Perls', '', '', '', 'https://www.amazon.com/dp/0939266512', 1992, 'Gestalt-terapia', false, (select coalesce(max(sort_order),0)+1 from public.book_recommendations)
where not exists (select 1 from public.book_recommendations where lower(title)=lower('Living at the boundary') and lower(author)=lower('Laura Perls'));

insert into public.book_recommendations (title, author, description, cover_image_url, cover_storage_path, purchase_url, publication_year, category, is_published, sort_order)
select 'Gestalt-terapia integrada', 'Erving Polster e Miriam Polster', '', '', '', 'https://www.amazon.com.br/dp/8532307590', 2001, 'Gestalt-terapia', false, (select coalesce(max(sort_order),0)+1 from public.book_recommendations)
where not exists (select 1 from public.book_recommendations where lower(title)=lower('Gestalt-terapia integrada') and lower(author)=lower('Erving Polster e Miriam Polster'));

insert into public.book_recommendations (title, author, description, cover_image_url, cover_storage_path, purchase_url, publication_year, category, is_published, sort_order)
select 'O ciclo do contato: temas básicos na abordagem gestáltica', 'Jorge Ponciano Ribeiro', '', '', '', 'https://www.amazon.com.br/dp/655549042X', 2007, 'Gestalt-terapia', false, (select coalesce(max(sort_order),0)+1 from public.book_recommendations)
where not exists (select 1 from public.book_recommendations where lower(title)=lower('O ciclo do contato: temas básicos na abordagem gestáltica') and lower(author)=lower('Jorge Ponciano Ribeiro'));

insert into public.book_recommendations (title, author, description, cover_image_url, cover_storage_path, purchase_url, publication_year, category, is_published, sort_order)
select 'O self desdobrado: perspectiva de campo em Gestalt-terapia', 'Jean-Marie Robine', '', '', '', 'https://www.amazon.com.br/dp/8532308457', 2006, 'Gestalt-terapia', false, (select coalesce(max(sort_order),0)+1 from public.book_recommendations)
where not exists (select 1 from public.book_recommendations where lower(title)=lower('O self desdobrado: perspectiva de campo em Gestalt-terapia') and lower(author)=lower('Jean-Marie Robine'));

insert into public.book_recommendations (title, author, description, cover_image_url, cover_storage_path, purchase_url, publication_year, category, is_published, sort_order)
select 'Processo, diálogo e awareness: ensaios em Gestalt-terapia', 'Gary Yontef', '', '', '', 'https://www.amazon.com.br/dp/8532306632', 1998, 'Gestalt-terapia', false, (select coalesce(max(sort_order),0)+1 from public.book_recommendations)
where not exists (select 1 from public.book_recommendations where lower(title)=lower('Processo, diálogo e awareness: ensaios em Gestalt-terapia') and lower(author)=lower('Gary Yontef'));

insert into public.book_recommendations (title, author, description, cover_image_url, cover_storage_path, purchase_url, publication_year, category, is_published, sort_order)
select 'Processo criativo em Gestalt-terapia', 'Joseph Zinker', '', '', '', 'https://www.amazon.com.br/dp/8532308538', 2007, 'Gestalt-terapia', false, (select coalesce(max(sort_order),0)+1 from public.book_recommendations)
where not exists (select 1 from public.book_recommendations where lower(title)=lower('Processo criativo em Gestalt-terapia') and lower(author)=lower('Joseph Zinker'));

insert into public.book_recommendations (title, author, description, cover_image_url, cover_storage_path, purchase_url, publication_year, category, is_published, sort_order)
select 'Psicologia da Gestalt', 'Wolfgang Köhler', '', '', '', 'https://www.amazon.com.br/dp/8531903513', 1980, 'Gestalt-terapia', false, (select coalesce(max(sort_order),0)+1 from public.book_recommendations)
where not exists (select 1 from public.book_recommendations where lower(title)=lower('Psicologia da Gestalt') and lower(author)=lower('Wolfgang Köhler'));

