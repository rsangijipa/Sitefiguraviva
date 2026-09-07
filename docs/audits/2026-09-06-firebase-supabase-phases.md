# Auditoria Firebase → Supabase — 2026-09-06

## Resultado

`npm run audit:no-firebase` ainda falha. A migração funcional avançou, mas existem referências Firebase em código de produção, configuração, scripts e dependências.

## Fase 1 — Runtime crítico

- `src/lib/certificates/issuer.ts`, `src/lib/progress/progressService.ts`.
- `src/lib/events/bus.ts` e workers de progresso.
- `src/lib/gamification/*` e `src/lib/metrics/kpi.ts`.
- `src/app/api/billing/webhook/route.ts`.

## Fase 2 — Actions e administração

As actions em `src/actions/*` e `src/app/actions/*`, páginas administrativas de aulas/materiais/anúncios/public-docs, hooks de usuários/gamificação e `ProfileForm` ainda possuem imports Firebase.

## Fase 3 — Configuração e legado

Remover variáveis Firebase de `src/config/env.ts`/`.env.example`, hosts de `next.config.mjs`, scripts de sync/backfill, regras Firestore, dependências Firebase e diretórios legados somente após zerar imports.

## Fase 4 — Validação final

Executar `npm run typecheck`, `npm run lint`, `npm test -- --runInBand`, `npm run build` e `npm run audit:no-firebase`. Concluir apenas com auditoria limpa e todos os gates aprovados.
