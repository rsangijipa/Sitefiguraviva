# Relatorio de consolidacao de branches

Data da analise: 2026-09-06
Branch de integracao: `integration/best-version`
Worktree isolado: `C:\Users\aless\plugins\copilot-worktrees\Sitefiguraviva\rsangijipa-vigilant-garbanzo`
Base preservada: `main` (`71fc842`)

## Criterio

Todas as referencias locais e remotas foram enumeradas, incluindo os aliases `origin/*`. As branches de produto foram comparadas com `main` por commits exclusivos, merge-base, diff de arquivos e escopo funcional. Branches Dependabot foram classificadas como atualizacoes mecanicas de dependencias e nao foram incorporadas automaticamente, pois exigem validacao isolada de cada PR. A branch de integracao ja existia sob outro nome; ela foi renomeada para o nome solicitado sem alterar seu conteudo e auditada como candidata.

## Branches analisadas

### `main`

- **Proposito:** baseline atual, incluindo a substituicao do quiz de saude mental por um quiz bank (`5e3754c`).
- **Commits exclusivos:** nenhum em relacao a si mesma.
- **Arquivos principais:** toda a aplicacao Next.js, actions, componentes LMS/portal, Firebase, Stripe e regras Firestore.
- **Recomendacao:** PRESERVAR como base; nao foi alterada.

### `codex/modernizacao-aplicacao` e `origin/feat/pre-launch-hardening`

- **Proposito:** hardening de producao, fundacao Supabase, modernizacao da area publica, acessibilidade e arvore de awareness.
- **Commits exclusivos:** `95d16a1..f7d2787`, incluindo `48993b5` (auth/API Supabase), `42ea8d6` (CSP), `0fcda9a` (fundacao Supabase), `24cdc66` (arvore isolada), `97e8958` (arquitetura publica), `5100007` (performance) e `f7d2787` (acessibilidade/conteudo).
- **Arquivos principais:** `src/features/awareness-tree`, `src/features/public-site`, `src/infrastructure/supabase`, `src/middleware.ts`, `next.config.mjs`, `firestore.rules`, `scripts/*`, testes de acessibilidade/performance.
- **Funcionalidades novas:** arvore interativa isolada, navegacao publica reorganizada, pagina de conteudo indexavel, consentimento LGPD, controles de autenticacao por papel.
- **Melhorias:** CSP sem `unsafe-eval` em producao, imagens e bundle publico menores, contratos de acessibilidade, validacao de entradas e remocao de credenciais hard-coded.
- **Riscos:** migracao hibrida Firebase/Supabase, exigencia de variaveis Supabase no build e mudancas amplas em regras de acesso.
- **Conflitos:** `main` adicionou quiz bank; a integracao preservou o recurso e resolveu apenas imports/estilos.
- **Recomendacao:** MERGE para `codex/modernizacao-aplicacao`; `origin/feat/pre-launch-hardening` e `feat/pre-launch-hardening` sao duplicatas/ancestrais funcionais e devem ser DESCARTADAS como fonte adicional.

### `codex/care-tools-standardization`

- **Proposito:** padronizar janelas de ferramentas de cuidado e organizar apps embutidos.
- **Commits exclusivos:** `fd85da2`, `b809e82`, `9d148c2`, `c1626e7`.
- **Arquivos principais:** `src/components/resources/ResourceWindow.tsx`, apps em `src/components/resources/apps/*`, `ResourcesSection.jsx`, testes de contrato.
- **Funcionalidades novas:** janela compartilhada, limite de altura de 90vh, organizacao de breathing, quiz e SomaScan.
- **Melhorias:** imports corrigidos, contratos de montagem e melhor comportamento em telas pequenas.
- **Riscos:** conflito direto com a reorganizacao de recursos da modernizacao.
- **Conflitos:** imports antigos (`resources/*`, `somascan/*`) contra os novos caminhos `resources/apps/*`.
- **Recomendacao:** CHERRY-PICK seletivo. Foram incorporados todos os commits de codigo, com resolucao manual dos imports; os testes novos passaram.

### `feat/pre-launch-hardening`

- **Proposito:** hardening pre-lancamento, autenticacao Supabase, CSP e base de modernizacao.
- **Commits exclusivos:** `95d16a1..3daa88d5`, principalmente `19335e4`, `e6f2162`, `cd01ca2`, `81c7d5c`, `42ea8d6`, `48993b5` e correcoes de imports.
- **Arquivos principais:** regras Firestore, middleware/auth, APIs de aplicacao/login/billing, workflows CI, scripts de migracao.
- **Funcionalidades novas:** controles de acesso e validacao de API, base Supabase, gates de build/teste.
- **Melhorias:** CSP, protecao de escritas nao autenticadas, remocao de service role hard-coded, bundles menores.
- **Riscos:** sobreposicao quase total com `codex/modernizacao-aplicacao`.
- **Conflitos:** historico compartilhado; fazer merge novamente duplicaria mudancas.
- **Recomendacao:** DESCARTAR como fonte de integracao adicional; seu conteudo relevante ja entrou via `codex/modernizacao-aplicacao`.

### `feat/modernize-frontend` e `origin/feat/modernize-frontend`

- **Proposito:** migracao Supabase-only de dominios de conteudo, engajamento, storage e telemetria, alem de refinamento visual.
- **Commits exclusivos:** `8ce76da..c76b1be`, incluindo `028b8f1`, `4fd687a`, `1e7bb20`, `ff7165c`, `5206c2b` e `cb9291e`.
- **Arquivos principais:** `src/infrastructure/supabase`, repositorios de assessments/certificates/community/events/gamification/notifications, migrations SQL, upload/materials, arvore e componentes publicos.
- **Funcionalidades novas:** repositorios Supabase por dominio, storage de curso, limpeza de materiais, migrations `202609060001`, testes de contratos e uploads.
- **Melhorias:** separacao por repositorio, tipagem de banco, telemetria/storage fora do Firebase, hardening de caminhos de material.
- **Riscos:** diff de 194 arquivos, remocoes amplas de Firebase, migrations dependentes do ambiente e artefatos `dist` gerados; merge integral teria alto risco de regressao.
- **Conflitos:** `package.json`, `next.config.mjs`, `ResourcesSection`, arvore, perfil, upload e servicos.
- **Recomendacao:** CHERRY-PICK seletivo. Foram incorporados os equivalentes funcionais de storage, telemetria, materiais, repositorios e hardening; o restante foi descartado/reimplementado por escopo excessivo. Artefatos `src/components/Quiz/dist/*` foram removidos por nao serem referenciados. A ref `origin/feat/modernize-frontend` e o mesmo fluxo publicado, nao uma implementacao independente.

### `versao-de-teste`

- **Proposito:** linha historica de certificados, PWA, gamificacao, acessibilidade e testes E2E.
- **Commits exclusivos contra `main`:** nenhum; seu tip (`0c7300e`) ja e ancestral de `main`.
- **Arquivos principais:** certificados, gamificacao, manifest/service worker, regras Firestore e testes.
- **Funcionalidades:** ja presentes no baseline.
- **Recomendacao:** DESCARTAR como fonte de merge; comparar historicamente apenas para auditoria.

### `worktree-agent-aafb1dad0ae0cfbc3`

- **Proposito:** refinamento visual Figura Viva e design system.
- **Commits exclusivos:** `4a795e5`, `12ba96c`, `7fbd95a`, `f5237ff`, `1a87ab5`, `e31d5ad`.
- **Arquivos principais:** `globals.css`, `tailwind.config.js`, hero, arvore, recursos, modais, focus trap e scroll lock.
- **Funcionalidades novas:** tokens FV, shell de recursos, focus trap e hook de scroll lock.
- **Melhorias:** consistencia visual, UX mobile, acessibilidade de foco e bloqueio de scroll com contador.
- **Riscos:** grandes reescritas de componentes visuais e sobreposicao com a modernizacao publica.
- **Recomendacao:** REIMPLEMENTAR seletivamente. O conceito de tokens e contratos de acessibilidade foi absorvido onde ja existia implementacao superior; nao foi feito merge integral das reescritas concorrentes.

### `codex/care-tools-standardization` remota e refs publicadas

Os refs `origin/feat/*` correspondem aos ancestrais publicados das branches locais e nao adicionam uma linha funcional independente. Foram usados como referencia de auditoria, nao como merges duplicados. `origin/versao-de-teste` tambem nao tem commits exclusivos contra `main`.

### Branches `origin/dependabot/*`

Sao atualizacoes isoladas de GitHub Actions, Next, Firebase, React, Stripe, Playwright, Tailwind, TypeScript e TanStack Query. **Recomendacao:** DESCARTAR nesta consolidacao e avaliar cada PR com CI/security separado; nao misturar atualizacoes de dependencias com a migracao arquitetural. Em particular, `next@16`, `tailwind@4` e `firebase@12.9` alteram superficies de compatibilidade e nao foram validados nesta integracao.

### `integration/best-version`

- **Proposito:** consolidacao candidata ja existente, contendo o historico combinado dos fluxos de modernizacao, care tools e migracao Supabase.
- **Commits exclusivos:** 120 contra `main`; os commits sao derivados dos fluxos listados acima e foram reclassificados neste relatorio por funcao, em vez de reaplicados cegamente.
- **Arquivos principais:** `src/app`, `src/features`, `src/infrastructure/supabase`, `src/components/resources`, `src/services`, `src/actions`, `supabase/migrations`, `tests` e `e2e`.
- **Riscos:** a branch ainda exige configuracao Firebase + Supabase no build, possui referencias Firebase remanescentes e carrega 11 vulnerabilidades npm reportadas.
- **Recomendacao:** manter como alvo da consolidacao; validar e corrigir apenas gaps comprovados.

## Duplicidades, superioridade e decisoes

| Area | Implementacoes concorrentes | Decisao |
|---|---|---|
| Recursos interativos | caminhos antigos em `resources/*`/`somascan/*` versus `resources/apps/*` | Nova organizacao, com `ResourceWindow` compartilhada e testes de contrato |
| Arvore de awareness | refinamento visual isolado versus feature isolada Supabase-aware | Feature isolada como base; estilos acessiveis da base foram preservados nos conflitos |
| Auth/API | hardening pre-launch versus modernizacao | Uma unica linha Supabase com validacao de entrada e sem merge duplicado |
| Storage/material | servicos Firebase e migracao Supabase ampla | Repositorios/storage Supabase, paths validados e testes de limpeza |
| Quiz | artefato `dist` gerado versus quiz React existente/quiz bank de `main` | Manter codigo fonte e quiz bank; descartar `dist` nao referenciado |
| UI Figura Viva | tokens e reescritas grandes versus componentes publicos modernizados | Incorporar apenas melhorias compatíveis, sem substituir componentes funcionais por diff massivo |

## Ordem de integracao registrada no historico da candidata

1. Merge de `codex/modernizacao-aplicacao` sobre a base derivada de `main`.
2. Cherry-pick dos quatro commits de `codex/care-tools-standardization`, resolvendo imports.
3. Cherry-pick de `4fd687a` para repositorios Supabase de engajamento.
4. Cherry-pick de storage, telemetria e materiais (`1e7bb20`, `e80cad2`, `ff7165c`, `5206c2b`, `cb9291e`), resolvendo storage server e HUD.
5. Remocao dos artefatos `src/components/Quiz/dist/*` sem referencias.
6. Registro deste relatorio; nesta auditoria o historico foi revalidado, nao reaplicado.

## Resultado da consolidacao

- **Branches analisadas:** `main`, `codex/modernizacao-aplicacao`, `codex/care-tools-standardization`, `feat/pre-launch-hardening`, `feat/modernize-frontend`, `versao-de-teste`, `worktree-agent-aafb1dad0ae0cfbc3`, `integration/best-version`, `origin/feat/*`, `origin/versao-de-teste` e as 20 refs `origin/dependabot/*`.
- **Recursos encontrados:** hardening Supabase, auth/API, arvore interativa, IA publica, recursos de cuidado, certificados, gamificacao, storage/material, telemetria, PWA e acessibilidade.
- **Recursos incorporados:** modernizacao publica, CSP/auth hardening, arvore isolada, janelas de recursos, apps reorganizados, repositorios de engajamento Supabase, storage/material Supabase, limpeza e contratos de teste.
- **Recursos descartados:** merge integral de `feat/modernize-frontend`, duplicatas de `feat/pre-launch-hardening`, historico ancestral de `versao-de-teste`, artefatos Quiz `dist` e branches Dependabot.
- **Conflitos resolvidos:** imports de apps, storage server, texto/cores do HUD da arvore e arquivos de progresso de migration.
- **Arquivos refatorados:** `src/components/ResourcesSection.jsx`, `src/features/awareness-tree/*`, `src/infrastructure/supabase/*`, services de engajamento, upload/material e `next.config.mjs`.
- **Regressoes encontradas:** o build compilou, mas falhou na coleta de paginas por variaveis obrigatorias ausentes (`NEXT_PUBLIC_FIREBASE_*` e `NEXT_PUBLIC_SUPABASE_URL`); testes emitiram warnings de `act(...)` em `CourseMaterialsTab`, sem falha. Nao foram observadas falhas nos testes unitarios/integracao.
- **Divida tecnica restante:** migracao ainda hibrida Firebase/Supabase, 11 vulnerabilidades reportadas por `npm install`, migrations precisam ser aplicadas no ambiente real, E2E depende de credenciais/servicos e branches Dependabot continuam pendentes.
- **Testes executados na onda 0 desta auditoria:** `npm install` (exit 0), `npm run build` (exit 1 por ambiente), `npm run lint` (exit 0), `npm test -- --runInBand` (exit 0: 45 suites/145 testes aprovados; 1 suite/7 testes ignorados) e `npx tsc --noEmit` (exit 0). Nao foi declarado build verde sem as variaveis de producao.

## Estrutura final

- `src/app`: rotas Next, auth, portal, admin e APIs.
- `src/features`: awareness tree, public site, assessments, certificates, community, events, gamification e notifications.
- `src/infrastructure/supabase`: clients, tipos, repositorios e storage.
- `src/components/resources`: janela compartilhada e apps de cuidado organizados por dominio.
- `src/services` e `src/actions`: regras de negocio e mutacoes com paths de material validados.
- `supabase/migrations`: contratos SQL incrementais para dominios migrados.
- `tests`, `src/**/__tests__` e `e2e`: contratos unitarios, integracao, acessibilidade, performance e jornadas.

## Main antiga versus versao consolidada

| Dimensao | `main` | `integration/best-version` |
|---|---|---|
| Arquitetura | Firebase dominante, features espalhadas | fronteiras por feature, camada Supabase incremental e storage separado |
| UX/UI | recursos interativos com caminhos e shells distintos | janela compartilhada, apps organizados, arvore e area publica refinadas |
| Seguranca | regras e CSP anteriores | auth/API hardening, CSP de producao, validacao de entrada e limpeza de segredos |
| Performance | bundle/public rendering sem todos os budgets | otimização de imports, homepage/public budgets e media resiliente |
| Dados | Firestore/Firebase para a maior parte dos dominios | migracao gradual de engajamento/storage/material, sem remover o restante sem justificativa |
| Qualidade | cobertura existente | novos contratos para recursos, storage, repositorios, materiais, acessibilidade e performance |
| Operacao | build exige configuracao Firebase | build exige Firebase legado + Supabase durante a transicao; ambiente real ainda precisa ser configurado |

## Conflitos previsiveis e criterio de resolucao

- `src/components/ResourcesSection.jsx`, `src/components/resources/*`: preferir o shell compartilhado e os imports `resources/apps/*`; manter o quiz bank de `main`.
- `src/features/awareness-tree/*` versus `src/components/arvoredasemocoes/*`: preferir a feature isolada, fallback acessivel e contratos testados; nao reintroduzir a arvore legada.
- `src/app/globals.css`, `tailwind.config.js`, `Navbar`, `HeroSection` e `CourseDetailClient`: combinar tokens e acessibilidade sem aceitar reescritas visuais massivas sem teste.
- `package.json`, `package-lock.json`, `next.config.mjs`: manter a matriz de dependencias validada pela branch candidata; avaliar Dependabot separadamente.
- `supabase/migrations/*`, `firestore.rules`, `src/config/env.ts`: preservar compatibilidade durante a migracao hibrida e nao remover Firebase sem auditoria limpa.

## Lista completa de refs Dependabot auditadas

`actions/checkout-6`, `actions/setup-node-6`, `actions/upload-artifact-6`, `actions/upload-artifact-7`, `github/codeql-action-4`, `google-github-actions/auth-3`, `google-github-actions/setup-gcloud-3`, `eslint-config-next-16.1.6`, `firebase-12.9.0`, `multi-b17e1175da`, `next-16.1.6`, `playwright/test-1.58.2`, `react-dom-19.2.4`, `stripe-20.3.1`, `tailwindcss-4.1.18`, `tanstack/react-query-5.90.20`, `tanstack/react-query-5.90.21`, `types/node-25.2.1` e `types/node-25.2.3`.
