# Instituto Figura Viva - Plataforma Next.js

Plataforma institucional e educacional baseada em Next.js (App Router), com area publica, portal do aluno e painel administrativo.

## Requisitos

- Node.js 20+
- npm 10+

## Setup Rapido

1. Instale dependencias:

```bash
npm install
```

Para executar os testes de navegador pela primeira vez, instale o Chromium do Playwright:

```bash
npx playwright install chromium
```

2. Rode em desenvolvimento:

```bash
npm run dev
```

3. Acesse:

- App: [http://localhost:3000](http://localhost:3000)

## Scripts Principais

- `npm run dev`: sobe app em modo desenvolvimento.
- `npm run build`: build de producao.
- `npm run start`: sobe app buildada.
- `npm run lint`: valida regras ESLint.
- `npm run typecheck`: validacao TypeScript sem emitir artefatos.
- `npm test`: testes Jest (unitarios/integracao).
- `npm run test:e2e`: testes Playwright (executar separadamente).
- `$env:NEXT_DIST_DIR='.next-audit'; npm run build`: build isolada para auditorias sem interromper um servidor local.
- `npm run seed`: carga inicial de dados utilitarios.

## Estrutura de Pastas

- `src/app`: rotas App Router.
- `src/components`: componentes de UI e features.
- `src/actions`: server actions canonicas consumidas pela app.
- `src/app/actions`: wrappers de compatibilidade para imports legados.
- `src/services`: camada de acesso a dados e integracoes.
- `src/lib`: utilitarios, autenticacao, regras de dominio.
- `src/hooks`: hooks de estado e realtime.
- `tests` e `e2e`: cenarios E2E (Playwright).

## Fluxo de Qualidade

Executar localmente antes de abrir PR:

```bash
npm run lint
npm run typecheck
npm test -- --runInBand
```

Para E2E:

```bash
$env:BASE_URL='http://localhost:3000'; npm run test:e2e -- --project=public
```

Defina `BASE_URL` para validar uma instancia ja em execucao. Os testes Jest ignoram artefatos de build e cenarios E2E do Playwright.

## Padrao de Actions

- Implementacoes canonicas ficam em `src/actions/*`.
- `src/app/actions/*` existe para compatibilidade e nao deve duplicar regra de negocio.
- Para progresso de aula, use `@/app/actions/progress` (ou `@/actions/progress` como alias de compatibilidade).

## Acesso de Admin em ambiente local

Credenciais de demonstracao sao opcionais e devem existir apenas na carga local. Configure `DEMO_ADMIN_EMAIL` e `DEMO_ADMIN_PASSWORD` no seu arquivo `.env.local`; os valores precisam corresponder a uma conta criada pelo processo de seed. Nunca reutilize essa senha em producao.
