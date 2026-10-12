# Correções da auditoria consolidada — Figura Viva

A auditoria foi usada como diagnóstico e os problemas foram conferidos no estado atual do repositório. Trabalho delegado a três subagentes (segurança pública/API, EAD/sessão e banco), com revisão cruzada adicional. Alterações prévias de package.json/package-lock.json foram preservadas. A criação/preenchimento do curso piloto foi excluída por instrução expressa do usuário.

## Correções implementadas

| Área | Resultado |
|---|---|
| Rotas administrativas | Seed, migração editorial e sincronização exigem POST e origem válida. GET mutável eliminado; erros internos não retornam detalhes ao cliente. |
| Conteúdo público | Home, biblioteca, estante, páginas editoriais e sitemap usam cliente anônimo, filtros de publicação e projeções explícitas. RLS real confirmou cursos/posts/public_pages publicados. Mapeamentos usam allowlist editorial e não espalham JSON legado ou permissões de equipe na hidratação. |
| Certificado público | Consulta por código através de RPC com projeção mínima; tabela privada preservada. Logo do PDF aponta para o JPG existente. |
| CSP | Uma função define a política usada por Next e middleware, mantendo nonce nas rotas protegidas e permitindo mídia Supabase. |
| Sessão | Verificação idempotente usa cache React por requisição. Refresh, fila de atualização de cookie e revogação têm testes. |
| Aula | Rota dedicada canônica; URLs antigas com ?lesson= redirecionam. Lobby não monta player; players de curso e avaliação são separados. |
| Progresso | Abertura preserva conclusão e posição; último acesso usa fluxo canônico; sincronização offline só confirma sucesso efetivo. |
| Avaliação aluno | Rascunho/submissão/autocorreção usam Supabase com matrícula, perguntas do servidor, proteção de concorrência e agregado de progresso. Quiz aprovado conclui aula. Rota legada de prova também usa RPC autenticada, exige publicação/matrícula e sanitiza gabarito inclusive no acesso de staff; retomada usa a submissão canônica. |
| Correção administrativa | Listagem, detalhes e correção manual das novas submissões usam Supabase; tutor limitado aos cursos atribuídos; pontos limitados por pergunta e alteração concorrente rejeitada. Notas objetivas são recalculadas pelo gabarito, ignorando pontos/resultado persistidos que possam ter sido forjados. |
| Acessibilidade | Token caption de 12px adotado no chrome/seções públicos. Foco visível restaurado em âncoras/navegação; opções de avaliação viraram botões nativos com seleção anunciada. Perguntas práticas têm campo textual rotulado. |
| Sala de Pausa | Fluxo publicado é efêmero, sem salvar dados/reflexões, sem importar o cliente demonstrativo de usuários fictícios/localStorage. Duração exibida acompanha o timer real. |
| Mídia | Oito heróis convertidos para WebP: 15.032.789 bytes originais para 512.310 bytes (~96,6% de redução). next/image fornece variantes responsivas. Originais preservados. |
| CSS/fontes | CSS da árvore carregado pela feature; suas quatro famílias extras foram substituídas pelos tokens Fraunces/Karla já carregados no layout. |
| SEO | Keywords/creator institucionais corrigidos; sitemap ampliado com páginas e recursos canônicos. |
| TypeScript | tsconfig.security.json exige strict em autenticação, infraestrutura Supabase, todas as 22 APIs atuais, infraestrutura de cursos e LMS .ts, novas ações de avaliação/correção e consultas administrativas/de aluno. Nulidades reais corrigidas; check obrigatório no CI. |
| Banco | Migração local move helpers privilegiados para private preservando dependências, revoga execução direta de triggers, fixa search_path, restringe presença/avisos e inclui oito índices críticos. Gabaritos não podem ser lidos diretamente pelo REST; RPC controla sessão/matrícula e tutor atribuído. Escritas diretas de submissões/progresso foram revogadas; SELECT limita tutor ao curso atribuído, inclusive na presença de policies permissivas extras. |

Migração: `supabase/migrations/20261005024622_consolidated_audit_database_hardening.sql`.
Validação SQL reproduzível: `supabase/tests/consolidated-audit-validation.md`.

## Validação

- PostgreSQL isolado PGlite: oito migrações relevantes aplicadas e testes reais de privilégios/RLS/RPC aprovados. Inclui matrícula cruzada, tutor sem atribuição, sessão revogada, certificado emitido no shape atual, perguntas sanitizadas, bloqueio de nota/progresso forjados e isolamento de histórico entre tutores mesmo com policy permissiva extra simulada.
- Lint, typecheck global e strict progressivo passaram na validação intermediária; verificação final e build estão registrados no fechamento abaixo.
- Knip executado em modo relatório: 92 arquivos e 230 exports apontados como não usados, 2 dependências e 1 dependência de desenvolvimento. As indicações exigem confirmação de uso; nenhuma exclusão em lote. Relatório local em `.audit-work/knip-report.json`.
- Build e smoke executados em cópia sem arquivos .env, com fixtures locais de leitura. Nenhuma credencial operacional usada no build.
- Os 7 testes ignorados dependem do emulador Firestore, ausente nesta execução local. O job dedicado às regras legadas continua no CI; seu resultado remoto não foi verificado neste ciclo.

## Estado da auditoria e limites

- Vercel Next.js, cache .next/cache, Knip CI, SafeHtmlServer no blog e parte dos controles de sessão/progresso já estavam implementados antes deste ciclo.
- Não houve commit, push, deploy nem aplicação da migração em produção. Publicar este código requer aplicar a migração primeiro: certificados públicos e avaliações dependem das novas RPCs/privilégios.
- A Vercel conectada permitiu localizar figuraviva, mas get_project retornou 403 para o escopo da equipe. Framework remoto não pôde ser confirmado/alterado; vercel.json permanece nextjs.
- Leaked Password Protection permanece desativado no Supabase Auth. É uma configuração operacional, não uma migração SQL; consultar [documentação oficial](https://supabase.com/docs/guides/auth/password-security).
- Curso piloto real não foi criado, conforme solicitação do usuário. E2E pedagógico autenticado, materiais reais, validação visual autenticada e rollback de produção não foram executados; não declarar EAD comercial liberado.
- Limites de tentativas/tempo ainda não têm configuração canônica no schema Supabase. O fluxo novo bloqueia nova tentativa depois do envio até existir configuração canônica de retentativas.
- Firebase permanece em edição/gestão legada de avaliações, analytics, gamificação, billing desativado e scripts. Os fluxos novos de aluno e correção de submissões foram migrados; não declarar Firebase Retirement concluído.
- Migração integral dos milhares de cores/textos, decomposição geral dos dashboards, busca/notas/favoritos globais, analytics pedagógico amplo, shell comum completo, áudio/CDN, Lighthouse/Axe CI e consolidação integral da arquitetura permanecem trabalho adicional. Autorizações editoriais de depoimentos/mídia e definição de métricas institucionais exigem informação do responsável pelo conteúdo.
- O acesso direto REST a JSONs legados/team em tabelas públicas continua sob os privilégios de coluna atuais. A UI/SSR usa projeção editorial segura; um contrato SQL específico para esses metadados é trabalho adicional.
- Índices foram validados estruturalmente no banco isolado; carga real e EXPLAIN ANALYZE após aplicação continuam necessários.

## Fechamento dos checks

Primeira validação integrada: lint, testes de scripts, 692 testes unitários (7 ignorados), typecheck global, strict de segurança, build de produção e 7 testes Playwright públicos aprovados; todos os checks encerraram com código 0. O encerramento do servidor descartável pelo Playwright travou no Windows; foi encerrado somente o processo verificado da fixture, permitindo a saída normal e o resumo dos testes.

O build mediu 397 kB de First Load JS para `/portal/course/[courseId]` (aproximadamente 492 kB na auditoria) e 239 kB na rota dedicada de aula. Não constitui medição Lighthouse em produção.

A segunda validação integrada, com a proteção adicional de correção objetiva, aprovou 693 testes unitários, lint, 43 testes de scripts, typecheck global, strict e build. A migração final, incluindo escrita exclusiva pelo backend e isolamento de tutor, foi novamente executada com sucesso no PostgreSQL isolado.

A última correção da rota legada de prova aprovou 5 novos testes, typecheck e lint focados. Seu fechamento integrado será registrado abaixo.
