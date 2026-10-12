# Validação da auditoria consolidada

Migração local: `20261012145104_consolidated_audit_database_hardening.sql`.
**Aplicada ao banco remoto em 12/10/2026, com autorização específica do responsável.** Após aplicação, manter `private` fora dos schemas expostos na Data API e executar novamente os advisors de segurança/performance.

A inspeção somente de leitura confirmou o projeto FiguraViva `jdxorryvmcvtqsddkpdm`, as sete funções privilegiadas expostas, `set_updated_at` sem search_path fixo e Leaked Password Protection desativado. A configuração de proteção de senhas exige alteração operacional no Supabase Auth e não é resolvida por SQL. Acesso como `anon` aos cursos/posts/páginas públicas retornou respectivamente 2/1/6 registros, todos publicados.

A migração preserva OIDs dos helpers RLS ao movê-los para `private` e mantém wrappers invoker compatíveis com SQL existente. Helpers privilegiados continuam necessários para evitar recursão de RLS em profiles/enrollments. Triggers de governança/correção perdem acesso direto por usuários. As oito foreign keys críticas receberam índices de cobertura.

Presence de fórum segue a matrícula do curso e exige ownership nas escritas. Contextos sem público definido no banco, como áudio institucional, ficam visíveis apenas ao próprio usuário; não há exposição entre ouvintes. Avisos respeitam curso, público e horário de publicação. A verificação pública de certificado aceita um código exato e retorna apenas campos públicos; o shape `studentName/courseName` do emissor foi testado.

`assessments.questions` perde SELECT direto para anon/authenticated; demais colunas permanecem sob RLS. `get_student_assessment(text)` exige sessão ativa e retorna gabarito completo para staff autorizado, ou perguntas sem respostas/rubrica para aluno matriculado em avaliação publicada. O cliente deve usar essa RPC e listas com colunas explícitas.

Escritas de `assessment_submissions` e `assessment_progress` são exclusivas do backend com service role. INSERT/UPDATE/DELETE foram revogados para PUBLIC/anon/authenticated, inclusive eventuais grants por coluna. SELECT sob RLS foi preservado. A varredura dos consumidores encontrou escritas somente nas Server Actions `src/app/actions/assessment.ts`, `src/actions/assessment.ts` e `src/actions/grading.ts`, todas com cliente service; o repository usado pelo navegador realiza somente SELECT/RPC. Isso impede submissão inserida já aprovada, alteração de `answers.pointsEarned` após envio, falsificação de progresso e escrita direta de tutor via REST. Testes SQL confirmaram essas negativas e a continuidade da correção/progresso pela service role.

A leitura REST de submissões/progresso também respeita o curso: aluno vê seu próprio histórico, administrador mantém acesso global e tutor lê trabalhos de terceiros somente nos cursos em que `courses.team[uid].role` é author/tutor/admin. O helper privado `current_user_can_author_course` é compartilhado com a RPC que devolve gabaritos. A inspeção remota somente de leitura encontrou uma policy permissiva SELECT antiga por tabela, ambas com atalho de tutor global; não havia policy permissiva ALL nessas tabelas. As policies antigas foram substituídas e gates SELECT restritivos foram adicionados. O teste injeta policies SELECT permissivas extras deliberadamente e confirma que elas não reabrem acesso ao tutor sem atribuição; tutor atribuído e administrador mantêm leitura.

## Teste reproduzível

O teste usa PostgreSQL isolado PGlite 0.3.14, sem conexão remota e sem alterar dependências de produção. Instalação e execução em PowerShell:

```powershell
npm install --prefix .audit-work/database --cache .audit-work/database/npm-cache --no-package-lock --ignore-scripts @electric-sql/pglite@0.3.14
$env:PGLITE_MODULE = (Resolve-Path .audit-work/database/node_modules/@electric-sql/pglite).Path
node supabase/tests/run-consolidated-audit.cjs
```

Resultado: oito migrações relevantes aplicadas no banco descartável; todos os testes SQL passaram. Foram verificados isolamento entre cursos, avisos futuros/staff, bloqueio de presença em fórum não matriculado, trigger de privilégio, ausência de recursão em helpers RLS, sessão revogada, certificado sem metadados internos, REST de gabarito bloqueado, RPC aluno sanitizada, draft/outro curso invisível e gabarito completo acessível apenas ao tutor com sessão ativa.

Limites: teste de banco isolado não substitui validação HTTP PostgREST após a aplicação nem medição de carga/EXPLAIN ANALYZE em dados representativos. Não foram criadas contas reais nem realizadas escritas de produção.
