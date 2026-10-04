# Implementação dos blocos 01 e 02 — 03/10/2026

As correções abaixo foram implementadas preservando o trabalho já existente no diretório. O banco do projeto **jdxorryvmcvtqsddkpdm** recebeu três migrações, com verificação posterior de permissões, índices e histórico. As alterações de aplicação estão **no código local e ainda não foram publicadas no site**. Não foram alterados cadastros, valores de pagamentos ou matrículas comerciais. Os testes de escrita ocorreram em PostgreSQL isolado com dados fictícios.

## Bloco 01 — autorização e contenção de RPCs

A autorização de administrador passou a depender do papel persistido em profiles. Endereços de e-mail e user_metadata não concedem administração. Foram ajustados o serviço de autenticação, as sessões do servidor, o contexto do navegador e os redirecionamentos dos portais. A consulta remota confirmou um administrador ativo antes da mudança; a remoção da promoção por endereço não exige criar um novo administrador.

Perfis inexistentes ou com falha de leitura não recebem privilégios. O servidor exige is_active = true. O bootstrap de perfil cria exclusivamente student, verifica erros do SDK, preserva perfis existentes e não reativa contas. O helper ensureUserDoc agora é server-only, deixando de ser uma Server Action pública que aceita uma identidade arbitrária.

A sincronização de login usa o token recém-verificado como identidade, mesmo quando existe um cookie de outra sessão. Falhas de sincronização deixam de ser ignoradas. A rota de login rejeita origem incompatível, conteúdo diferente de application/json e JSON inválido, e grava cookie apenas depois da validação de Auth e perfil. O fluxo é destinado às chamadas de mesma origem do site.

No banco, visitantes e usuários authenticated tinham EXECUTE nas três RPCs administrativas. Foram revogadas as permissões de PUBLIC, anon e authenticated, mantendo service_role. As funções save_lesson_content, bump_course_content_revision e reorder_book_recommendations passaram a SECURITY INVOKER: o backend usa seus próprios privilégios de tabela, sem herdar os do proprietário da função. O preflight conferiu SELECT e UPDATE para service_role nas tabelas necessárias.

O advisor revelou também **process_gamification_event**, uma RPC legada que recebe usuário, quantidade de XP e badges sem guarda de identidade. Ela continuava exposta no banco, embora o código atual use grant_xp_idempotent. A migração complementar restringiu sua execução ao backend. Seu corpo permaneceu inalterado; os testes específicos desta alteração validam permissões, não toda a lógica legada de gamificação.

As funções auxiliares utilizadas pelas políticas de RLS permaneceram disponíveis aos papéis que precisam delas. O proprietário postgres observado neste projeto não é superusuário; a exposição foi demonstrada por privilégios efetivos, sem assumir superusuário.

## Bloco 02 — índices de matrícula e progresso e acesso ao curso

O catálogo remoto confirmou os índices parciais apontados na auditoria. Eles foram substituídos por índices únicos sem predicado, mantendo as mesmas colunas:

- enrollments_user_course_uidx: user_id, course_id;
- lesson_progress_user_lesson_uidx: user_id, course_id, lesson_id.

Essa forma permite a inferência de unicidade pelo onConflict usado no código. Os índices legados e de source_ref foram preservados. Linhas com user_id nulo continuam permitidas conforme a semântica padrão de NULL do PostgreSQL. A migração usa transação, limite de espera por bloqueio de cinco segundos e limite de execução de trinta segundos.

A função current_user_can_access_course agora exige perfil ativo além das condições anteriores de equipe ou matrícula válida. Um token válido e uma matrícula ativa não bastam quando o perfil está desativado. Isso protege as políticas que consultam essa função; não constitui uma revisão de todas as políticas do banco. O agregado inactive_profiles_with_active_enrollment permanece **0**. Esse número descreve os registros atuais; a negação de acesso foi testada separadamente em cenário isolado.

## Migrações aplicadas e registradas

1. [20261003214215_block_01_rpc_execution_hardening.sql](../../supabase/migrations/20261003214215_block_01_rpc_execution_hardening.sql).
2. [20261003220157_block_02_enrollment_conflicts_active_access.sql](../../supabase/migrations/20261003220157_block_02_enrollment_conflicts_active_access.sql).
3. [20261003221246_block_01_gamification_rpc_execution_hardening.sql](../../supabase/migrations/20261003221246_block_01_gamification_rpc_execution_hardening.sql).

Foram executados somente esses arquivos, sem aplicar em lote migrações antigas pendentes. Depois da aplicação e conferência, suas versões foram registradas no histórico remoto. A consulta final confirmou as três versões e, para as quatro RPCs, anon = negado, authenticated = negado e service_role = permitido.

## Validação e limites

| Verificação | Resultado |
| --- | --- |
| Jest da aplicação | 80 suítes passaram; 1 ignorada; 281 testes passaram; 7 ignorados; nenhuma falha |
| Tipos TypeScript | Passou, incluindo os novos testes de autenticação |
| Build Next.js | Passou no laboratório com WASM oficial 15.5.25 |
| ESLint dos 17 arquivos alterados de código/testes | Sem erros ou avisos |
| RPCs administrativas em PostgreSQL isolado | 13 verificações passaram, incluindo negação por papel, chamadas do backend e reaplicação |
| Índices e acesso por perfil ativo em PostgreSQL isolado | 9 verificações passaram, incluindo reprodução do erro 42P10 anterior, upserts repetidos e preservação de NULL legado |
| RPC legada de gamificação em PostgreSQL isolado | 4 verificações de ACL/reaplicação passaram; corpo fictício para isolar a permissão |
| Catálogo remoto após aplicação | Quatro RPCs restritas, índices sem predicado, perfil ativo exigido e três migrações registradas |

O laboratório usa credenciais fictícias e fixture local somente de leitura. O WASM oficial contorna o bloqueio do binário SWC nativo neste Windows. Isso não substitui o CI nativo, homologação, ensaio de restauração ou testes da jornada completa com contas e pagamentos reais. A retirada de uma dependência desnecessária de useCallback, identificada pelo lint, ocorreu depois da build; o lint final passou. Não houve mudança funcional adicional nessa limpeza.

Os testes novos verificam bootstrap sem promoção/reativação, falha de SDK, origem e corpo de login, cookies apenas após sucesso, perfil desativado, token novo prevalecendo sobre cookie anterior e rejeição de token inválido. Os testes de SQL não gravaram dados comerciais no projeto remoto.

O advisor final ainda reporta **14 avisos de segurança**. Restam avisos sobre funções SECURITY DEFINER auxiliares de RLS/trigger, search_path de set_updated_at e proteção contra senhas vazadas no Auth. Esses itens precisam de triagem individual; remover EXECUTE indiscriminadamente dos auxiliares quebraria políticas. Nenhuma das quatro RPCs corrigidas permanece nesses alertas.

O diff global também contém dois avisos de linha vazia final em arquivos previamente modificados (books.ts e BlockRenderer.tsx), fora deste bloco; eles não foram usados como justificativa para reescrever trabalho existente.

## Correções de interpretação da auditoria

O banco real possui quatro políticas para applications. A ausência delas nas migrações locais representa divergência de versionamento, e não prova ausência de proteção na produção. Ainda faltam versionamento e testes por papel. Os buckets course-assets e public-book-covers continuam públicos; uploads e assessment-submissions são privados. A proteção dos materiais EAD exige um bloco específico de Storage.

Os 205 candidatos à remoção continuam preservados. O experimento anterior passou na build, mas produziu regressões em testes e mostrou referências a parte dos candidatos; não autoriza apagar todo o conjunto.

## Próximos blocos, na ordem de lançamento

1. **Concluir identidade e cadastro:** substituir o cadastro público que usa auth.admin.createUser com email_confirm: true por fluxo com comprovação de posse do e-mail; revisar recuperação de senha, concorrência de sessões e demais helpers; verificar a revogação dos segredos históricos do projeto antigo antes da publicação.
2. **Concluir site e inscrição:** oferta publicada, validações de formulário, tratamento de erros e idempotência da inscrição/matrícula, políticas de applications versionadas e testes da jornada aluno/administrador.
3. **Concluir Pix manual:** QR/copia e cola vinculados ao pedido, comprovante privado, fila administrativa, conferência, rejeição/estorno e aprovação idempotente que libera a matrícula. Gerar QR não comprova pagamento; a liberação depende da conferência do administrador.
4. **Organizar diretório e desempenho:** excluir apenas candidatos comprovados, com build e testes por lote; medir ganhos e resolver dependências/CI.
5. **Finalizar EAD:** Storage, progresso, atividades, certificados e demais funcionalidades acadêmicas, após site e inscrição estarem aptos ao lançamento.

O [backlog revisado](2026-10-03-backlog-revisado.csv) marca os itens parciais e a publicação pendente. AUTH-01 não está concluído enquanto o cadastro confirmar e-mail sem comprovação. AUTH-03 não está concluído apenas pela conversão de um helper. As correções deste relatório não significam que o lançamento integral esteja liberado.

[Evidência agregada sem dados pessoais](2026-10-03-evidence/implementacao-blocos-01-02.json). Logs completos e laboratório preservados em diretório privado fora do repositório.
