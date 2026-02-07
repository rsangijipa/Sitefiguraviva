# 🎯 CHECKLIST TÉCNICO: Implementação EAD Enterprise

## 🔴 P0: Mínimo para Certificar com Segurança (Bloqueadores)

- [ ] **P0.1 Unify Progress Actions**: Remove `src/app/actions/progress.ts` vs `src/actions/progress.ts`. Elect `src/actions/progress.ts` as the single source of truth for all updates.
- [ ] **P0.2 Lockdown Write Permissions**: Firebase Rules blocking direct client writes to `progress` and `enrollments`. Verified via Client SDK rejection.
- [ ] **P0.3 Full Recheck Certification**: Implement `issueCertificate` Server Action that recalculates all rules from base data before issuing imuttable record.
- [ ] **P0.4 Strong Idempotency & Monotonicity**: Ensure `completed` status never regresses to `in_progress` via student UI and `completedAt` is set only once.
- [ ] **P0.5 Visibility Lockdown**: Strict double-trava (Query + Router/Server) ensuring students never access draft/unpublished content via direct URL.
- [ ] **P0.6 Certificate Uniqueness**: Prevent duplicate certificate issuance for the same `userId` + `courseId` + `courseVersion`.

## 🟡 P1: Pacote de Hardening (Nível Universitário)

- [ ] **P1.1 Full Completion Snapshot**: Store immutable structure snapshot (módulos, lições, rules applied) within the certificate or completion record.
- [ ] **P1.2 CourseVersion Tracking**: Track `courseVersionAtEnrollment` and `courseVersionAtCompletion` on enrollment records to handle structural changes.
- [ ] **P1.3 Immutable Audit Trail**: Append-only `audit_logs` collection reporting every state change with browser/IP metadata.
- [ ] **P1.4 Conflict Detection**: Implement `updatedAt` comparison for multi-device sync to ensure the latest progress wins without regression.

## 🔵 P2: Melhorias e UX

- [ ] **Sincronização Offline (Retry Logic)**: No `useProgress`, se a Server Action falhar por rede, manter no IndexedDB e tentar novamente no próximo `heartbeat` ou `onFocus`.
- [ ] **Métricas de Vídeo**: Salvar `maxWatchedSecond` de forma throttled (ex: a cada 10 segundos) para evitar sobrecarga no Firestore, mas manter precisão para "continuar de onde parou".

---

## 🔍 Critério de Aceite Exemplo (Certificação)

**Given** que um aluno concluiu todas as aulas de um curso  
**When** ele solicita o certificado  
**Then** o servidor deve buscar todos os `lesson_progress` ativos para aquele curso, comparar com a contagem atual de aulas `isPublished: true` e, se o match for 100%, gerar um registro imutável em `certificates` com um `verificationCode` único.

## 🧪 Teste Mínimo (E2E)

1. Login como Admin -> Criar Curso -> Publicar.
2. Login como Aluno -> Matricular.
3. Marcar todas as aulas como concluídas via UI.
4. Tentar chamar API de Certificado (deve retornar sucesso).
5. Despublicar uma aula no Admin.
6. Tentar chamar API de Certificado para outro aluno idêntico (deve retornar erro por falta de 100%).
