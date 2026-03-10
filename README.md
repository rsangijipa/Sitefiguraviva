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
npm run test:e2e
```

## Padrao de Actions

- Implementacoes canonicas ficam em `src/actions/*`.
- `src/app/actions/*` existe para compatibilidade e nao deve duplicar regra de negocio.
- Para progresso de aula, use `@/app/actions/progress` (ou `@/actions/progress` como alias de compatibilidade).

## Credenciais de Admin (ambiente local/demo)

- Usuario: `admin`
- Senha: `admin`
