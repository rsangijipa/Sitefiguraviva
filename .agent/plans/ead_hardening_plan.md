# Plano de Hardening EAD: Sincronicidade & Governança

Este plano detalha as etapas para elevar a maturidade da plataforma de EAD para o nível "Enterprise/Universitário", focando em garantir que o progresso do aluno e a emissão de certificados sejam consistentes, seguros e auditáveis.

## 1. Auditoria e Diagnóstico de Sincronicidade

- [ ] Mapear todos os hooks de leitura (`useEnrolledCourse`, `useProgress`) vs escrita (`updateLessonProgress`).
- [ ] Verificar se há redundância entre `src/app/actions/progress.ts` e `src/actions/progress.ts`.
- [ ] Auditar fluxo de visibilidade: Garantir que `isPublished` é respeitado em toda a cadeia.

## 2. Padronização do Modelo de Dados (Single Source of Truth)

- [ ] Implementar o modelo canônico de Coleções (Enrollments, Progress, Certificates).
- [ ] Definir lógica de versionamento de conteúdo (`courseVersion`) para evitar quebras em certificados emitidos.
- [ ] Padronizar IDs compostos (ex: `uid_courseId`) para busca instantânea e unicidade.

## 3. Implementação do "Contrato de Verdade"

- [ ] Definir Invariantes Críticas no código.
- [ ] Implementar barramento de eventos canônicos (`CoursePublished`, `LessonCompleted`, etc.).
- [ ] Criar validadores de elegibilidade de certificado no lado do servidor (Server Actions).

## 4. Hardening de Segurança e Auditoria

- [ ] Implementar RBAC rigoroso via Firebase Rules.
- [ ] Adicionar logs de auditoria imutáveis para cada mudança de status de progresso/certificação.
- [ ] Testes E2E (Playwright) cobrindo o fluxo completo: Admin publica -> Aluno conclui -> Certificado emitido.

## 5. Documentação e Dossiê

- [ ] Gerar Dossiê Executivo de Governança.
- [ ] Gerar Checklist de Implementação P0/P1/P2.
- [ ] Gerar Especificação Técnica do Banco de Dados.
