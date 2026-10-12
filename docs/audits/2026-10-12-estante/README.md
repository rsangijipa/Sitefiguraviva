# Estante editorial — verificação de 12/10/2026

O redesenho utiliza somente os dois livros publicados no catálogo existente e suas capas autorizadas. O primeiro livro na ordem administrativa permanece em destaque e também pode ser encontrado na busca. Não foram criados livros, autores, capas, links ou classificações temáticas automáticas.

## Dados e administração

- Migração `bookshelf_editorial_category` aplicada: uma coluna `category` opcional, limitada a 80 caracteres; nenhum dado existente foi classificado ou alterado.
- Os formulários de criação e edição em `/admin/books` permitem preencher ou remover a categoria. Chamadores antigos de `saveBookAction` que omitem esse campo preservam a categoria existente.
- Publicação, reordenação, exclusão, upload e autorização das capas mantêm os contratos anteriores.
- Leitura com o papel `anon` validada no banco. A consulta pública usa o cliente anônimo e exibe apenas livros publicados; as políticas RLS existentes foram preservadas.
- Atualização de categoria testada em transação com rollback, verificando que os demais campos bibliográficos, publicação e ordem permanecem iguais.

## Interface e acessibilidade

- Após o refinamento solicitado, as capas usam `next/image`, molduras de tamanho uniforme, área reservada e carregamento lazy. `object-fit: cover` preenche a moldura preservando a proporção da imagem.
- O hero usa o componente `PublicPageHero` das demais páginas. Títulos das recomendações limitados a duas linhas e descrições a três; o dialog mantém o conteúdo completo.
- Dialog com bordas de 20 px, moldura da capa arredondada e botões com altura mínima de 48 px para toque.
- Busca por título e autor e filtros por categorias persistidas operam inteiramente em memória, sem consulta adicional ao Supabase.
- Dialog nativo na camada superior: fundo inerte, título acessível, fechamento por ESC, focus trap e restauração ao acionador confirmados no navegador.
- Árvore de acessibilidade inspecionada: título, autor, ano, descrição, indicação de nova aba, nomes dos botões e atualização dos resultados presentes. Não foi realizada uma sessão manual com NVDA/VoiceOver.
- CSS de `prefers-reduced-motion` remove deslocamentos, transições das capas e animação do dialog. Não há animação contínua das capas.
- Fallbacks verificados para capa ausente/falha de carregamento, link ausente ou protocolo inseguro, busca vazia e indisponibilidade do catálogo.

## Responsividade

| Largura | Livros por linha | Overflow horizontal | Molduras iguais |
| --- | --- | --- | --- |
| 320 px | 2 | Não | Sim |
| 360 px | 2 | Não | Sim |
| 390 px | 2 | Não | Sim |
| 768 px | 4 | Não | Sim |
| 1024 px | 5 | Não | Sim |
| 1440 px | 7 | Não | Sim |

As colunas representam a capacidade da prateleira. O catálogo atual possui dois livros; não foram duplicados livros para preencher espaços vazios. Medições em `viewport-qa.json` e capturas em `desktop-1440.png` e `mobile-390.png`.

## Verificação de código

- Build completo de produção aprovado, incluindo lint, TypeScript e geração das 42 páginas estáticas. Saída isolada em `.next-estante-build`, sem substituir o servidor dev.
- `npm run lint` e `npm run typecheck` aprovados.
- 12 testes novos de interface e compatibilidade administrativa aprovados; 44 testes aprovados no conjunto que inclui regressões de matrícula/Pix.
- Infraestrutura compartilhada, rotas e a imagem existente do hero preservadas. O ajuste de `tsconfig.json` gerado automaticamente pelo build isolado foi removido.

Os filtros temáticos surgem somente quando a curadoria cadastra categorias nos livros. Atualmente os dois livros permanecem sem categoria, conforme os dados originais.
