# Implementação do bloco 05 — oferta comercial e catálogo

Data: 03/10/2026, horário de Manaus. Escopo: permitir o lançamento do site e das inscrições antes da conclusão do EAD, mantendo preço, disponibilidade e páginas públicas coerentes.

## Entregas

A publicação comercial deixou de exigir módulos e aulas EAD. O administrador pode publicar uma oferta com título, descrição e capa; uma oferta nova publicada começa com inscrições encerradas. Abrir inscrições é uma operação separada e exige o valor inicial do Pix. Publicar não publica módulos, aulas ou materiais pedagógicos.

As operações de publicar, ocultar, abrir e encerrar inscrições verificam administrador ativo no servidor e no banco. O banco bloqueia a linha durante a alteração e atualiza disponibilidade e revisão na mesma transação. Repetir a mesma operação não incrementa a revisão sem mudança. Cursos arquivados não são restaurados silenciosamente. A validação de publicação, anteriormente uma Server Action sem guarda própria, agora também exige administrador.

Encerrar inscrições conserva a publicação e o acesso legítimo de matrículas existentes. Ocultar a oferta impede novas inscrições e, pela regra de acesso já existente, também bloqueia o curso no portal; a interface explica essa diferença. O controle de visibilidade que antes apenas alterava um estado local ignorado pelo servidor foi substituído pelas operações efetivas.

O detalhe público consulta o curso diretamente por ID ou slug, com parâmetros separados. Não depende mais de carregar a lista de cursos abertos. O catálogo e a política pública aceitam ofertas publicadas abertas ou fechadas; rascunhos, arquivados e ofertas ocultas continuam fora da consulta pública. A página e o modal de cursos fechados mostram inscrições encerradas e deixam de oferecer o botão de nova inscrição. As funções de inscrição do bloco 04 continuam recusando uma oferta fechada.

O valor integral passou a ser armazenado em centavos, e o limite de parcelas em um campo inteiro. O formulário de criação envia esses valores; o editor permite recuperar, alterar e apagar um valor integral ainda indefinido. Valor integral e Pix de matrícula/primeira parcela são apresentados separadamente. Não são calculadas parcelas bancárias nem criada uma assinatura automaticamente.

A ementa preenchida na criação é persistida em `details.syllabus`. Na edição, o servidor preserva outros dados de `details`; o adaptador também recupera ementas históricas do campo legado quando a versão normalizada ainda está vazia. Isso evita que uma edição comum apague a apresentação histórica por falta de mapeamento.

Na home, a seleção de três cursos e posts usa chaves de cache distintas das listas completas. Os dados iniciais passaram a usar os mesmos adaptadores do catálogo, incluindo imagens, conteúdo e links dos posts. Uma galeria inicialmente vazia não é mais tratada como resultado válido durante dez minutos: sua consulta pública começa ao montar a página.

## Supabase aplicado

Migração `supabase/migrations/20261004003242_block_05_commercial_catalog.sql`, aplicada e registrada no projeto `jdxorryvmcvtqsddkpdm`. O nome usa a data UTC emitida pelo CLI; a execução ocorreu em 03/10 no horário de Manaus.

A consulta `supabase/tests/block_05_verification.sql` confirmou RLS ativa em cursos, política pública limitada a ofertas publicadas abertas/fechadas, dois campos comerciais inteiros e suas restrições. A função comercial usa `SECURITY INVOKER`; visitantes e alunos não podem executá-la diretamente, e o backend autorizado pode.

Os dois cursos existentes foram preservados. Não foi executada nenhuma operação de publicação, abertura ou fechamento neles. Os novos campos permanecem nulos: nenhum valor ou número de parcelas foi inventado ou deduzido dos dados históricos. Não foi criada cobrança nem realizado pagamento.

## Verificação

- 335 testes Jest passaram em 92 suítes. Sete testes e uma suíte permanecem ignorados.
- TypeScript e lint direcionado aos 26 arquivos de código e testes alterados passaram.
- 19 verificações SQL passaram em PostgreSQL isolado PGlite, utilizando o tipo real `course_status` e a migração Pix anterior. Cobriram autorização, publicação sem EAD, inscrições fechadas, RLS, operações repetidas, valores inválidos e curso arquivado.
- Build final passou (exit 0, 148 segundos) após a proteção das ementas históricas.

O laboratório usa Next 15.5.25 com WASM, credenciais fictícias e um endpoint Supabase local somente de leitura. As consultas de catálogo e permissões foram executadas no Supabase real. Os testes de alteração de disponibilidade utilizaram cursos fictícios no banco isolado; não foram exercidos no site publicado.

O advisor continua apontando 14 avisos de segurança anteriores em outras funções/triggers e na proteção contra senhas vazadas. Eles não são considerados resolvidos por este bloco. As orientações de permissões e RLS seguem a [documentação de RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) e de [funções do Supabase](https://supabase.com/docs/guides/database/functions).

## Uso e pendências

No editor, salvar dados comerciais e a ementa; publicar a oferta; configurar o Pix inicial; depois abrir as inscrições nas configurações. Para suspender novas inscrições sem retirar o detalhe ou o acesso dos alunos, usar **Encerrar inscrições**.

O código permanece local e precisa de publicação e homologação. Revisar os valores reais, a carga horária, as datas e as condições comerciais com o responsável antes do lançamento. As divergências de conteúdo já registradas na auditoria não foram corrigidas por suposição.

O modelo financeiro informado no cadastro não cria uma inscrição gratuita, cobrança recorrente ou cobrança automática de parcelas. Este lançamento continua usando Pix inicial e conferência manual. Parcelas posteriores, saldo integral, reembolso, crédito duplicado e condições contratuais permanecem pendentes do bloco financeiro/operacional.

Também continuam no backlog a governança de contas administrativas, conversão e primeiro acesso de alunos, SMTP e teste de e-mail, materiais restritos existentes em Storage, dependências, SEO/contato e CI/recuperação. As correções locais e migrações não equivalem a liberação do site para lançamento.

Não houve remoção dos 205 arquivos candidatos. As alterações anteriores do workspace foram preservadas.
