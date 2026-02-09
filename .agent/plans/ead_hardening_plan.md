# Plano de Hardening EAD: Sincronicidade & Governança

Este plano detalha as etapas para elevar a maturidade da plataforma de EAD para o nível "Enterprise/Universitário", focando em garantir que o progresso do aluno e a emissão de certificados sejam consistentes, seguros e auditáveis.

## 1. Auditoria e Diagnóstico de Sincronicidade

- [x] Mapear todos os hooks de leitura (`useEnrolledCourse`, `useProgress`) vs escrita (`updateLessonProgress`).
- [x] Verificar se há redundância entre `src/app/actions/progress.ts` e `src/actions/progress.ts`.
  - **ACHADO CRÍTICO**: `src/actions/progress.ts` (usado pelo hook `useProgress`) contém lógica legada com acesso direto ao Firestore. `src/app/actions/progress.ts` (usado pelos componentes de UI) delega corretamente para `progressService`.
  - **RESOLVIDO**: `src/actions/progress.ts` deletado e `useProgress.ts` migrado para usar `src/app/actions/progress.ts` (via `progressService`).
- [x] Auditar fluxo de visibilidade: Garantir que `isPublished` é respeitado em toda a cadeia. <!-- id: 11 -->
  - **ACHADO**: `CoursePage` captura `ContentUnavailableError` (curso não publicado) mas prossegue, permitindo visualização parcial.
  - **ACHADO**: `MyCoursesPage` lista cursos matriculados mesmo se `isPublished: false`.
  - **RESOLVIDO**: `CoursePage` redireciona para `/portal?error=course_unavailable` se o erro for `COURSE_NOT_AVAILABLE`.
  - **RESOLVIDO**: `MyCoursesPage` filtra cursos com `isPublished === false`.

## 2. Padronização do Modelo de Dados (Single Source of Truth)

- [ ] Implementar o modelo canônico de Coleções (Enrollments, Progress, Certificates).
- [ ] Definir lógica de versionamento de conteúdo (`courseVersion`) para evitar quebras em certificados emitidos.
- [ ] Padronizar IDs compostos (ex: `uid_courseId`) para busca instantânea e unicidade.

## 3. Implementação do "Contrato de Verdade"

- [ ] Definir Invariantes Críticas no código.
- [ ] Implementar barramento de eventos canônicos (`CoursePublished`, `LessonCompleted`, etc.).
- [ ] Criar validadores de elegibilidade de certificado no lado do servidor (Server Actions).

## 4. Verificação de Performance & Otimizações (Sprints 1 & 2)

- [x] **Cache Layer**: `src/hooks/useCache.ts` existe.
- [x] **Rate Limiting**: `src/lib/rateLimit.ts` existe.
- [x] **Icon Optimization**: Ícones otimizados (`@/components/icons`) em uso em páginas críticas (`portal/page.tsx`, `events/page.tsx`).
- [x] **N+1 Queries**: Padrões de batching confirmados em `portal/page.tsx`.
- [ ] **Next/Image**: Lazy loading ainda pendente em algumas áreas (conforme `SPRINT_2_PERFORMANCE.md` incomplete status).

## 5. Hardening de Segurança e Auditoria

- [x] **Sentry**: `@sentry/nextjs` instalado.
  - **AÇÃO**: Configurar `.sentryclirc` e environment variables para upload de source maps.
- [x] **Logger**: `src/lib/logger.ts` criado.
- [x] **Refinamento Mobile**: `DashboardShell` agora usa drawer animado via `framer-motion`.
- [x] **Backup Automatizado**: Workflow `.github/workflows/firestore-backup.yml` criado. Requer `GCP_SA_KEY` e `BACKUP_BUCKET_NAME` nos secrets.
- [/] Testes E2E (Playwright) cobrindo o fluxo completo: Admin publica -> Aluno conclui -> Certificado emitido. (Em progresso)

## 6. Documentação e Dossiê

- [ ] Gerar Dossiê Executivo de Governança.
- [ ] Gerar Checklist de Implementação P0/P1/P2.
- [ ] Gerar Especificação Técnica do Banco de Dados.
