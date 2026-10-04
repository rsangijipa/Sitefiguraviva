-- Import the curated gallery files already present in public/images.
-- The NOT EXISTS guards make this safe to run more than once.
do $$
begin
  if not exists (select 1 from public.gallery_items where image_url = '/images/Captura%20de%20tela%202025-12-29%20114654.png') then
    insert into public.gallery_items (image_url, title, caption, tags, width, height, is_published, legacy_payload)
    values (
      '/images/Captura%20de%20tela%202025-12-29%20114654.png',
      'Workshop Corpo, Território e Ancestralidade',
      'Encontro em parceria com a Casa Afeto BH sobre corpo, território, ancestralidade e o caminho de volta para casa.',
      array['Mulheres', 'Workshop'], 545, 728, true,
      jsonb_build_object('source', 'public/images', 'source_file', 'Captura de tela 2025-12-29 114654.png')
    );
  end if;

  if not exists (select 1 from public.gallery_items where image_url = '/images/Captura%20de%20tela%202025-12-29%20114713.png') then
    insert into public.gallery_items (image_url, title, caption, tags, width, height, is_published, legacy_payload)
    values (
      '/images/Captura%20de%20tela%202025-12-29%20114713.png',
      '23º Encontro Nacional da Associação Brasileira de Psicologia Social',
      'Participação no 23º Encontro Nacional da ABRAPSO, com debates sobre Gestalt-terapia, mulheres, violências, territórios e marcadores sociais.',
      array['Mulheres', 'Territórios', 'ABRAPSO'], 749, 754, true,
      jsonb_build_object('source', 'public/images', 'source_file', 'Captura de tela 2025-12-29 114713.png')
    );
  end if;

  if not exists (select 1 from public.gallery_items where image_url = '/images/Captura%20de%20tela%202025-12-29%20114736.png') then
    insert into public.gallery_items (image_url, title, caption, tags, width, height, is_published, legacy_payload)
    values (
      '/images/Captura%20de%20tela%202025-12-29%20114736.png',
      'Congresso Latino-americano, Congresso Brasileiro e Encontro Nacional de Gestalt-terapia',
      'Registros de encontros, trabalhos sensíveis, trocas, cuidado, movimento e solidariedade política entre mulheres.',
      array['Congresso', 'Gestalt'], 755, 747, true,
      jsonb_build_object('source', 'public/images', 'source_file', 'Captura de tela 2025-12-29 114736.png')
    );
  end if;

  if not exists (select 1 from public.gallery_items where image_url = '/images/Captura%20de%20tela%202025-12-29%20125619.png') then
    insert into public.gallery_items (image_url, title, caption, tags, width, height, is_published, legacy_payload)
    values (
      '/images/Captura%20de%20tela%202025-12-29%20125619.png',
      'É primavera em anunciação',
      'Celebração de amizade, afeto, casa, quintal, árvore, pé no chão e novos começos.',
      array['Mulheres'], 745, 748, true,
      jsonb_build_object('source', 'public/images', 'source_file', 'Captura de tela 2025-12-29 125619.png')
    );
  end if;
end
$$;
