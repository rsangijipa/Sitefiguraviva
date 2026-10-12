# Verificação de lançamento — Figura Viva — 12/10/2026

Login administrativo, navegação pelas 18 seções do menu, envio real de imagem e encerramento de sessão foram verificados no navegador local conectado ao Supabase FiguraViva. Correções de código estão no diretório de trabalho; a migração de segurança foi aplicada ao banco com autorização específica do responsável. Este resultado não equivale a um deploy nem comprova todos os cadastros e integrações externas em produção.

## Fluxos verificados

| Etapa | Fluxo | Estado observado |
|---|---|---|
| 1 | Login por e-mail/senha | Aprovado: sessão criada e conta administrativa ativa reconhecida. |
| 2 | Painel e navegação | Aprovado: as 18 seções do menu responderam HTTP 200 e abriram sem exceções de JavaScript. Dashboard, galeria, gamificação e configurações também foram capturados após carregar seus dados. |
| 3 | Upload de imagem na nova galeria | Aprovado: resposta 201, conversão PNG → WebP, preview e leitura pública do arquivo no Storage. Nenhum registro editorial foi publicado. |
| 4 | Saída da conta e novo acesso a /admin | Aprovado: cookie/sessão encerrados; acesso redirecionado para /auth?next=/admin. |
| 5 | Supabase e proteção de dados | Aprovado: migração aplicada; schema privado não exposto, perfis protegidos, gabaritos bloqueados e RPC de certificado disponível por HTTP. |
| 6 | Código e compilação | Aprovado: 718 testes unitários, tipos, lint e build de produção. |

Navegação verificada: usuários, interessados, matrículas, cursos, aprovações, avaliações, correções, blog, galeria, documentos, livros, calendário, eventos, gamificação, Google Suite, logs, utilidades e configurações. A visita a uma tela não comprova individualmente todas as suas ações de criação, edição, exclusão, aprovação ou comunicação.

## Correções realizadas

| Problema confirmado | Correção |
|---|---|
| Gestão de avaliações gravava primeiro no Firebase e ignorava erros do espelho Supabase; listas vazias retornavam ao backend antigo. | CRUD e leitura administrativa passaram a usar Supabase, com autorização no servidor e confirmação da linha gravada. Erros são propagados. |
| Edição apenas do título podia zerar a pontuação; obrigatoriedade era descartada e média zero substituída por 70. | Dados existentes são preservados, pontos são calculados no servidor, `is_required` é persistido e defaults respeitam zero. Questões, alternativas, nota e vínculo da aula são validados. |
| A edição administrativa dependia da RPC de aluno. | Leitura administrativa própria, protegida por permissão de administrador. |
| Exclusão de avaliação não atualizava a listagem. | Reconsulta após sucesso; falhas de leitura são exibidas com opção de tentar novamente. |
| Gamificação e seu catálogo de usuários ainda consultavam Firebase. | Listagem, usuários e premiação administrativa usam o Supabase. Valores de XP e IDs de conquistas são validados. Falhas não confirmam premiação. |
| Rotas antigas de materiais e aulas consultavam Firestore. | Materiais redirecionam para a aba canônica; aulas carregam currículo Supabase e verificam autorização para editar o curso. |
| Fotos de até 5 MB eram aceitas pela interface embora a hospedagem limite requisições a 4,5 MB. | Limite administrativo de 4 MB no cliente/API e tratamento de resposta 413, resposta inválida e ausência de confirmação do upload. [Limite oficial da Vercel](https://vercel.com/docs/functions/limitations). |
| Formulários podiam salvar enquanto uma nova imagem ainda estava sendo enviada. | Galeria, livros e blog aguardam o upload e bloqueiam o salvamento durante o envio. |
| Upload sem foco de teclado, avatar quebrado e dois landmarks/IDs principais aninhados no painel. | Input de imagem acessível por teclado, fallback de avatar e região administrativa sem duplicar o `main-content` global. |
| Substituição de avatar mantinha a mesma URL e podia exibir a imagem anterior em cache. | URL de avatar recebe uma versão nova após substituição. |

Os campos de tempo e tentativas de avaliações apareciam editáveis sem persistência/cumprimento no fluxo atual. Eles agora mostram explicitamente a capacidade desta versão: uma tentativa, sem limite de tempo. Permitir retentativas e tempo configurável requer implementação adicional; esses recursos não foram declarados prontos.

## Banco aplicado e conferido

Migração autorizada originalmente como `20261005024622_consolidated_audit_database_hardening.sql`; o Supabase registrou a versão `20261012145104`. O arquivo local foi alinhado ao histórico remoto:

[Migração aplicada](C:/Users/aless/Downloads/Sitefiguraviva/supabase/migrations/20261012145104_consolidated_audit_database_hardening.sql).

Os helpers privilegiados passaram para o schema `private`, os triggers perderam execução direta, o `search_path` foi fixado, presença/avisos/histórico de avaliações receberam proteção de audiência e oito índices foram adicionados. Respostas e notas são escritas pelo backend; gabaritos usam RPC autenticada e sanitizada. Os advisors de segurança, após aplicação, deixaram de apontar os helpers expostos e o `search_path` mutável. Não há tabelas públicas sem RLS.

Verificação HTTP real: perfil anônimo sem linhas; schema privado HTTP 406; gabaritos HTTP 401; cursos publicados visíveis; certificado inexistente retorna lista vazia pela RPC pública. Cadastro por e-mail e confirmação de e-mail estão habilitados. Testes SQL isolados passaram novamente após alinhar o nome da migração.

Permanece desativada a [proteção contra senhas vazadas](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection), configuração operacional do Supabase Auth. Os advisors de performance ainda apontam 25 foreign keys sem índice e 19 ocorrências de políticas permissivas múltiplas; são oportunidades de otimização, não falhas demonstradas dos fluxos testados. [Referência de índices](https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys), [referência de políticas](https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies). Índices recém-criados não foram removidos por ainda constarem como sem uso.

## Evidências da interface

As imagens abaixo foram capturadas e inspecionadas nesta execução. Capturas intermediárias com spinners/skeletons foram rejeitadas e substituídas pelas telas carregadas.

1. Login — formulário e navegação de entrada disponíveis.

![Login](C:/Users/aless/Downloads/Sitefiguraviva/docs/audits/2026-10-12-launch/01-login.png)

2. Painel — indicadores, cadastros e atividades carregados do banco.

![Painel carregado](C:/Users/aless/Downloads/Sitefiguraviva/docs/audits/2026-10-12-launch/02-dashboard.png)

3. Galeria — catálogo existente carregado; upload de teste confirmado no formulário.

![Galeria carregada](C:/Users/aless/Downloads/Sitefiguraviva/docs/audits/2026-10-12-launch/gallery.png)

![Upload confirmado](C:/Users/aless/Downloads/Sitefiguraviva/docs/audits/2026-10-12-launch/03-upload-confirmed.png)

4. Gamificação — dados Supabase carregados e fallback da foto apresentado.

![Gamificação](C:/Users/aless/Downloads/Sitefiguraviva/docs/audits/2026-10-12-launch/gamification.png)

5. Configurações — formulário editorial carregado, sem salvar alterações nos textos existentes.

![Configurações](C:/Users/aless/Downloads/Sitefiguraviva/docs/audits/2026-10-12-launch/settings.png)

## Validação e limites

- 718 testes unitários aprovados; 7 testes de regras legadas Firestore ignorados por dependerem de emulador.
- 43 testes de scripts aprovados.
- 4 testes Playwright públicos existentes aprovados: rotas, landmark principal único, nonce CSP e hidratação do login.
- TypeScript global e segurança estrita aprovados.
- Lint aprovado, sem erros. Build final de produção aprovado, com as verificações de lint e tipos do Next.js habilitadas.
- Upload real: PNG de 31.037 bytes convertido em WebP de 3.944 bytes, lido com HTTP 200. Arquivo de teste removido; nenhum registro de galeria publicado. Resultado em `upload-result.json` e `upload-cleanup.json` nesta pasta.
- Logout real bloqueou novo acesso ao painel. Resultado em `logout-result.json`.
- Não foram alterados alunos, pagamentos, matrículas, notas ou conteúdos publicados para testar ações destrutivas.
- Recebimento real de e-mail, recuperação completa de senha, OAuth Google, integrações Google e jornada comercial/EAD completa não foram homologados. Google Suite registra referências de serviços, não configura conexões externas automaticamente.
- Capturas visuais e estes checks não constituem certificação integral de acessibilidade nem medição de carga de produção.
- Sem commit, push ou deploy. Antes do lançamento, publicar o código corrigido, conferir variáveis de ambiente da hospedagem e repetir os fluxos críticos na URL publicada.

O retrato anterior do schema está em `schema-before.json`; os resultados de navegação estão em `browser-results.json`. As capturas administrativas contêm dados do painel e destinam-se à revisão local.
