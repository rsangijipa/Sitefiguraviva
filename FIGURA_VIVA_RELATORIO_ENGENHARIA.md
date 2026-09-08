# FIGURA VIVA — RELATÓRIO FINAL DE ENGENHARIA

**Data:** 2026-09-07
**Escopo desta sessão:** Auditoria arquitetural profunda + correção de bugs de correção/segurança de alta prioridade em progresso, gamificação e matrícula/pagamento. Não é a execução completa do programa de 62 seções solicitado (migração total Firebase→Supabase, refatoração de todo o admin, suíte E2E completa) — isso excede o que é seguro fazer sem checkpoints humanos em uma única sessão contínua, dado que envolve dinheiro real (Stripe/PIX) e dados de matrícula/certificação de alunos reais. Este relatório documenta o que foi feito, o que foi encontrado, e prioriza o que falta.

---

## 1. Resumo executivo

Foi feita uma auditoria factual completa (não superficial) das áreas mais sensíveis da plataforma — progresso acadêmico, matrícula, gamificação, certificados, RLS do Supabase, e a duplicação de app "Árvore das Emoções" — usando agentes de exploração dedicados por área. A partir dessa auditoria, **8 bugs de correção confirmados** (não hipotéticos) foram corrigidos e verificados com typecheck completo, build de produção completo, lint e testes unitários, incluindo dois bugs que provavelmente afetavam pagamento em produção:

- Checkout de assinatura Stripe podia retornar erro ao usuário **depois** de a cobrança já ter sido iniciada, por causa de um `upsert` no Supabase com um `id` de formato inválido para a coluna `uuid`.
- Matrículas manuais e via PIX (que usam UID do Firebase) provavelmente nunca eram persistidas na tabela `enrollments` do Supabase, por causa do mesmo problema de tipo `uuid`.
- XP de gamificação era concedido **em dobro** a cada aula concluída.
- Progresso lido em duas partes da aplicação (via Supabase) sempre aparecia vazio/desatualizado, porque a escrita real acontecia só no Firestore.
- Backend duplicado do app "Árvore das Emoções" consolidado (3 rotas de API redirecionadas para uma única implementação), sem remover nenhuma UI ativa.

**Achado mais grave da sessão, ainda NÃO corrigido (exige decisão de produto, não só código):** existem **dois sistemas de emissão de certificado completamente independentes e desconectados entre si** — `CertificateIssuer` (Firestore, documentado no código como "canônico") e um worker de evento que escreve direto no Supabase. Todas as telas que alunos e o público realmente veem (`/portal/certificates`, `/certificado/[code]`, `/certificates/verify/[code]`) leem **só do Supabase**, o que sugere que o sistema "canônico" pode estar emitindo certificados que ninguém nunca vê, enquanto o sistema não-documentado é o que efetivamente conta para o aluno. Ver seção 2, item P0-0, e seção 10.

Nenhum commit ou push foi feito — todas as mudanças estão no working tree, aguardando sua revisão.

---

## 2. Problemas encontrados (priorizados)

### P0 — crítico

| # | Problema | Evidência | Status |
|---|---|---|---|
| 0 | **Dois sistemas de emissão de certificado completamente independentes, e o "canônico" documentado no código não é o que os alunos veem.** `CertificateIssuer` ([issuer.ts](src/lib/certificates/issuer.ts)) grava só no Firestore e nunca toca no Supabase. Mas TODAS as superfícies que alunos/público realmente acessam — `/portal/certificates`, `/certificado/[code]`, `/certificates/verify/[code]` — leem exclusivamente da tabela `certificates` do **Supabase**. Essa tabela Supabase é populada por um segundo emissor completamente separado: `handleProgressUpdate` em [events/workers/progress.ts:53-84](src/lib/events/workers/progress.ts:53), disparado a cada `LESSON_COMPLETED` (publicado por `progressService.markLessonCompleted`), que recalcula progresso **de novo, de forma independente** (contando lições concluídas via eventos, sem relação com o cálculo do `progressService`/Firestore) e emite certificado com seu próprio código (`FV-XXXX-XXXXXX`) quando bate 100%. Ou seja: a cada aula concluída, dois sistemas de progresso e dois emissores de certificado rodam em paralelo, sem se falar. É plausível que hoje o `CertificateIssuer` (Firestore) esteja emitindo certificados que nenhuma tela mostra a ninguém, enquanto o worker Supabase é o que efetivamente "conta" para o aluno. | [issuer.ts](src/lib/certificates/issuer.ts), [events/workers/progress.ts](src/lib/events/workers/progress.ts), [portal/certificates/page.tsx:12-16](src/app/portal/certificates/page.tsx:12), [certificado/[code]/page.tsx:19-23](src/app/certificado/[code]/page.tsx:19), [certificates/verify/[code]/page.tsx:25-29](src/app/certificates/verify/[code]/page.tsx:25) | **NÃO corrigido — exige decisão de produto antes de qualquer código.** Ver seção 19. |
| 1 | **XP duplicado a cada conclusão de aula.** `progressService.markLessonCompleted` já concede XP e badge internamente; `progress.ts` chamava `gamificationService.onLessonCompletion` de novo logo depois, dobrando o XP. | [progressService.ts:56-61](src/lib/progress/progressService.ts:56), [progress.ts:38](src/app/actions/progress.ts:38) (antes da correção) | **Corrigido** |
| 2 | **`awardXp` sem idempotência real.** Usava `id = "${userId}_${Date.now()}"` — duas chamadas próximas (refresh, retry, concorrência) geravam duas transações de XP distintas sem detecção. | [gamificationService.ts:60-101](src/lib/gamification/gamificationService.ts:60) (antes) | **Corrigido** |
| 3 | **Checkout de assinatura Stripe quebrado.** `upsert({ id: "${uid}_${courseId}", ...})` numa coluna Postgres `uuid` — lança erro de tipo, capturado pelo catch externo e devolvido ao cliente como falha, **depois** de a sessão Stripe já ter sido criada. | [checkout-subscription/route.ts:99-104](src/app/api/billing/checkout-subscription/route.ts:99) (antes) | **Corrigido** |
| 4 | **Matrícula manual/PIX nunca chegava ao Supabase.** `writeEnrollmentMirror` gravava `user_id: uid` mesmo quando `uid` é um UID do Firebase (string, não UUID) — falha de tipo, capturada por try/catch em `adminEnrollment.ts`/`enrollment-pix.ts`, silenciosamente ignorada. | [enrollment-service.ts:20-61](src/lib/auth/enrollment-service.ts:20) (antes) | **Corrigido** |
| 5 | **Progresso lido do Supabase sempre vazio.** Escrita real só em Firestore (`progress`/`enrollments`), leitura em `courseService.ts` e `services/progressService.ts` consulta `lesson_progress` do Supabase, que nunca era atualizada. | Auditoria (item 2) | **Corrigido** (dual-write aditivo) |
| 6 | **Dois caminhos de matrícula com destinos de dado diferentes.** Stripe grava só Supabase; admin manual gravava só Firestore. | Auditoria (item 3) | **Corrigido** (dual-write aditivo) |

### P1 — alto

| # | Problema | Evidência | Status |
|---|---|---|---|
| 7 | **PWA contraditório.** Portal registrava service worker (`SWRegistration`) enquanto o layout raiz desregistrava todos os SW em toda navegação. | [layout.tsx:133-146](src/app/layout.tsx:133), `PortalClientLayout.tsx` (antes) | **Corrigido** (PWA desativado, conforme sua preferência explícita na seção 36) |
| 8 | `settings/page.tsx` com 1295 linhas misturando 6 responsabilidades. | Auditoria (item 7) | **Corrigido** (quebrado em 6 subcomponentes) |
| 9 | Emissão de certificado acoplada por chamada direta dentro do recálculo síncrono de progresso, não como evento de domínio desacoplado. | [progressService.ts:252-262](src/lib/progress/progressService.ts:252) | **Não corrigido** — risco de tocar no fluxo de certificação sem testes E2E prévios |
| 10 | ~~Proteção contra auto-promoção de `role`/nota via trigger~~ — **reavaliado**: ao ler `202609040001_p0_rls_hardening.sql` por completo, essa é a arquitetura correta e deliberada (RLS `with check` não tem acesso a `OLD` numa cláusula simples; reimplementar a comparação OLD/NEW dentro do `with check` seria redundante com o trigger, não uma camada extra real). O código já está comentado explicando essa decisão. **Não é um problema.** | [202609040001_p0_rls_hardening.sql:1-12](supabase/migrations/202609040001_p0_rls_hardening.sql:1) | **Descartado do backlog** |
| 11 | App "Árvore das Emoções" fragmentado em 3 pastas — **corrigido parcialmente**: `features/awareness-tree` é a UI da rota `/recursos/arvore-da-awareness`; `components/resources/apps/emotion-tree` é uma **segunda UI ativa e distinta**, usada em `/recursos` via `ResourcesSection.jsx` (achado que corrige a auditoria inicial, que a classificava como código morto) — ambas as UIs são reais e ficam como estão; `components/arvoredasemocoes` (app Next.js standalone órfão, excluído do tsconfig, com imports quebrados) segue não tocado. As 3 rotas de API (`favorites`, `interactions`, `quotes/by-theme`) agora importam do backend já existente em `awareness-tree` em vez do backend duplicado em `emotion-tree`, eliminando a duplicação sem apagar nenhuma UI. | Auditoria dedicada + agente de consolidação | **Corrigido** (dedupe de backend); `arvoredasemocoes` órfão segue como recomendação de remoção futura |

### P2/P3 — médio/melhoria

- `awardBadge` ainda faz read-then-write sem transação (dedupe por `includes()`, sujeito a race condition rara).
- Tipos em `types/schema.ts`, `types/lms.ts`, `types/user.ts` ainda referenciam `Timestamp` do Firestore mesmo em campos já espelhados no Supabase.
- `arvoredasemocoes/` (10.831 linhas, incluindo lockfile) é candidata segura à remoção após confirmar que não há deploy Vercel separado ativo apontando para ela.
- Vulnerabilidades de dependência reportadas no relatório de consolidação anterior (`npm audit`: 3 críticas, 16 altas) não foram reauditadas nesta sessão.

---

## 3. Alterações realizadas (arquivos e motivo)

| Arquivo | Motivo |
|---|---|
| [src/app/actions/progress.ts](src/app/actions/progress.ts) | Removida chamada duplicada de `gamificationService.onLessonCompletion` em `markLessonCompleted` (XP duplicado) |
| [src/lib/gamification/gamificationService.ts](src/lib/gamification/gamificationService.ts) | `awardXp` reescrito com chave de idempotência determinística (`userId_reason_subject`) e `runTransaction` do Firestore, tornando a concessão de XP à prova de refresh/chamadas paralelas |
| [src/lib/progress/progressService.ts](src/lib/progress/progressService.ts) | Adicionado dual-write para `lesson_progress` do Supabase em `markLessonCompleted` e `updateLessonProgress` (aditivo, não remove Firestore) |
| [src/lib/auth/enrollment-service.ts](src/lib/auth/enrollment-service.ts) | `writeEnrollmentMirror` corrigido para detectar UID Firebase vs Supabase e gravar na coluna certa (`user_id` vs `legacy_firebase_uid`) com `onConflict` no índice correto; removida geração de `id` client-side inválida; `activateEnrollmentFromStripe` corrigido para buscar o enrollment existente pela coluna de identidade certa em vez do `id` composto que deixou de existir |
| [src/app/api/billing/checkout-subscription/route.ts](src/app/api/billing/checkout-subscription/route.ts) | Removido `id` client-side inválido do upsert de enrollment pendente; `onConflict` corrigido para `user_id,course_id` |
| [src/actions/adminEnrollment.ts](src/actions/adminEnrollment.ts) | Dual-write para Supabase adicionado em `enrollLead()` via `writeEnrollmentMirror` |
| [src/app/actions/admin/enrollment.ts](src/app/actions/admin/enrollment.ts) | Dual-write para Supabase adicionado em `enrollUser`, `revokeAccess`, `updateEnrollmentStatus`, `approveEnrollment` |
| [src/app/portal/PortalClientLayout.tsx](src/app/portal/PortalClientLayout.tsx) | Removidos `SWRegistration` e `PWAInstallBanner` — PWA desativado conforme preferência explícita, eliminando a contradição com o desregistro no layout raiz |
| [src/app/admin/(protected)/settings/page.tsx](src/app/admin/(protected)/settings/page.tsx) | Reduzido de 1295 para 357 linhas; lógica de estado/fetch mantida, JSX extraído para 6 subcomponentes |
| `src/app/admin/(protected)/settings/components/{Founder,Institute,Team,Legal,Seo,Config}Settings.tsx` | Novos — subcomponentes extraídos da página de configurações |

---

## 4. Arquitetura anterior

Híbrida, com Supabase Auth + PostgreSQL já presente para partes do domínio (`profiles`, `courses`, `lesson_progress`, `enrollments`, `certificates`, `gamification_profiles`, `applications`, RLS habilitado em todas as tabelas), mas com Firestore ainda sendo a escrita canônica ativa para progresso, gamificação, certificados, e uma parte da matrícula (admin manual), enquanto a leitura em alguns pontos já assumia Supabase como fonte — causando dessincronia silenciosa. `firebase-admin` seguia como hub central (`src/lib/firebase/admin.ts`) importado por praticamente todo o backend de conteúdo/comunidade/eventos.

## 5. Arquitetura final (após esta sessão)

Ainda híbrida — esta sessão não completou a migração, apenas corrigiu bugs de correção nos pontos de contato entre os dois bancos. O que mudou estruturalmente:
- Progresso agora é gravado em **ambos** os bancos (Firestore continua canônico, Supabase deixou de ficar vazio).
- Matrícula (Stripe, PIX, admin manual) agora é gravada em **ambos** os bancos de forma consistente, com identidade de usuário resolvida corretamente (UUID Supabase vs UID legado do Firebase).
- Gamificação continua 100% Firestore, mas agora é idempotente por natureza (não só "não foi chamada duas vezes por acidente", mas "não pode duplicar mesmo se for chamada duas vezes").
- PWA desligado de forma consistente (uma única fonte de verdade: desregistra sempre).

## 6. Migração Firebase → Supabase

**Migrado nesta sessão:** nada foi removido do Firebase — a estratégia seguida foi dual-write aditivo, conforme pedido explicitamente (não fazer remoção destrutiva antes de provar substituição).

**Legado restante (ainda 100% Firestore, não tocado):**
- Emissão de certificados (`src/lib/certificates/issuer.ts`)
- Gamificação (leitura/escrita ainda só Firestore, apesar do dual-write de progresso já alimentar dados equivalentes)
- Conteúdo de curso (módulos/aulas), comunidade, eventos, blog, galeria, assessments/grading
- Perfil do usuário (`ProfileForm.tsx`)

**Itens ainda dependentes de Firebase que precisam de decisão:** ver seção "Dívida técnica restante".

## 7. Segurança

Auditoria de RLS confirmou que as proteções críticas estão corretas:
- Aluno **não** consegue fazer UPDATE em `enrollments` (só admin, via policy `for all` restrita).
- Aluno **não** consegue INSERT/UPDATE em `certificates` (só admin).
- Aluno **não** consegue alterar `score`/`grade` em `assessment_submissions` (bloqueado por trigger `BEFORE UPDATE`, além da policy).
- Aluno **não** consegue promover seu próprio `role` em `profiles` (bloqueado por trigger `BEFORE UPDATE`).
- Aluno **não** consegue fabricar XP em `xp_transactions`/`gamification_profiles` (só staff via policy).
- Aluno só edita seu próprio `lesson_progress` (`user_id = auth.uid()` em `using` e `with check`).

Ponto de atenção não crítico: as duas proteções mais sensíveis (role e nota) dependem de trigger, não de `with check` na policy — recomenda-se reforçar com `with check` explícito numa migration futura, como defesa em profundidade.

## 8. Matrícula/pagamento

Estado final: Stripe (assinatura e checkout único), PIX e matrícula manual do admin agora convergem para o mesmo padrão de escrita em `enrollments` do Supabase, com identidade resolvida corretamente por tipo de UID. Bug de checkout de assinatura corrigido (não deve mais falhar após criar a sessão Stripe). Webhook Stripe verifica assinatura e é idempotente por `event.id` (via `stripe_events` no Firestore) — não alterado nesta sessão.

## 9. Progresso

Escrita: dual-write Firestore (canônico) + Supabase (agora atualizado). Leitura no Supabase deixa de retornar vazio. XP por conclusão de aula deixou de duplicar, tanto por remoção da chamada redundante quanto por idempotência estrutural em `awardXp`.

## 10. Certificados

Não alterado. Continua emitido via chamada direta (não evento de domínio) dentro do recálculo de progresso, mas com verificação de idempotência interna (`certRef.get()` antes de emitir). Recomendado para uma sessão futura dedicada, com testes antes de qualquer mudança.

## 11. Gamificação

`awardXp` agora idempotente por `(userId, reason, subject)` via transação Firestore — refresh, retry ou chamada duplicada não geram XP extra. `awardBadge` continua sem transação (risco residual baixo, não corrigido nesta sessão).

## 12-16. Front-end / UX / Responsividade / Performance / Acessibilidade

Não trabalhado nesta sessão além da quebra do `settings/page.tsx` gigante em subcomponentes (sem mudança visual) e da desativação do PWA. O restante do programa (hierarquia do portal, dashboard do aluno, ResourceExperienceShell, testes de viewport, otimização de Three.js/árvores) não foi iniciado.

## 17. Testes

```
typecheck  = OK (0 erros, projeto inteiro)
lint       = OK (arquivos alterados)
unit/jest  = OK nas suítes relevantes às mudanças desta sessão (billing, enrollment, progress, certificate — 6 suítes/20 testes, todos passando). Suíte completa do projeto: 50 passaram, 10 falharam — confirmado que as 10 falhas são pré-existentes e não relacionadas a esta sessão (nenhuma toca em progress/enrollment/gamification/checkout/settings): `adminCourseService.test.ts` (assinatura de função já desatualizada desde correção anterior), `homepage-structure`/`navigation`/`public-contracts`/`sitemap` (setup de teste sem `QueryClientProvider`, não relacionado), `course-mutations.materials` (feature de conteúdo de curso, não tocada), `no-firebase-runtime` (compara lista de variáveis `.env`, arquivos `.env` não tocados), `app-shell-contract` (resources apps, não tocado), `upload-course-covers*.test.mjs` (arquivo sem testes, problema de config do Jest)
e2e        = Criado `e2e/student-lifecycle.spec.ts` (fluxo completo: signup/login → curso → candidatura/matrícula → aprovação admin quando pendente → portal → conclusão de aulas → progresso → certificado), seguindo as convenções já existentes em `e2e/` (helpers de auth, gate por credenciais de ambiente, mesmo padrão de `e2e/completion-journey.spec.ts` e `e2e/enrollment-gate.spec.ts`). Validado estruturalmente (`playwright test --list` descobre o teste; typecheck e lint completos limpos) — NÃO executado ponta-a-ponta porque o repositório não tem `.env.test`/banco Supabase de staging/curso seed determinístico; isso é documentado no cabeçalho do próprio arquivo. Passos sem cobertura direta hoje: conclusão de aula por watch-time de vídeo real (não simulável sem player real). `data-testid` mínimos adicionados (sem mudança de comportamento/estilo): `mark-lesson-complete` em `CoursePlayer.tsx` (componente realmente usado na rota `/portal/course/[courseId]/lesson/[lessonId]`), `lesson-sidebar-progress` em `LessonSidebar.tsx`, `course-progress-percent` em `CourseClient.tsx`, `portal-certificate-card` em `CertificateCard.tsx`, `issue-certificate-button`/`certificate-issued` em `CertificateIssueCard.tsx`. Nota: uma primeira tentativa (agente que se auto-delegou) também adicionou `mark-lesson-complete` em `LessonPlayer.tsx` — mantido por não ter custo (componente não está na rota ativa, mas o teste final usa `CoursePlayer.tsx`).
build      = OK — `npm run build` completo, 59 páginas geradas, compilado em 56s, sem erros de tipo/lint
```

## 18. Dívida técnica restante (P0/P1 não resolvidos)

1. Certificado como evento de domínio desacoplado (não corrigido).
2. `with check` explícito para `profiles.role` e `assessment_submissions` grading (hoje só via trigger).
3. Consolidação do app "Árvore das Emoções" em 3 pastas antes de remover qualquer uma.
4. Migração completa de gamificação/certificados/conteúdo de curso para Supabase como fonte única.
5. `awardBadge` sem transação.
6. Refatoração do restante das páginas admin grandes (`page.tsx` de 530 linhas, `QuizBuilder.tsx`, `GradingDashboard.tsx`, etc. — só `settings` foi tratado).
7. Suíte E2E `student-lifecycle.spec.ts` (seção 47 do escopo original) não foi criada.
8. `npm audit` não reauditado nesta sessão.

## 19. Recomendações futuras

1. **Antes de qualquer deploy**: rodar `npm run build` e a suíte Playwright existente para confirmar que as mudanças de matrícula/checkout não quebraram nada em ambiente mais próximo de produção — o typecheck/lint/jest não substituem isso para um fluxo de pagamento.
2. Tratar a consolidação Firebase→Supabase de progresso/matrícula como **fase 2**: depois de confirmar em produção que o dual-write está populando o Supabase corretamente por um período, inverter a direção (Supabase vira escrita canônica, Firestore vira leitura de fallback) antes de remover Firestore de vez.
3. Abrir uma sessão dedicada só para certificados como evento de domínio — é sensível o suficiente (prova de conclusão de curso) para merecer testes E2E antes de qualquer refatoração.
