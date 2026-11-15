# Correções de segurança das dependências — 04/11/2026

Atualização: o [ciclo seguinte corrige os 34 avisos de desenvolvimento](2026-11-04-security-loop.md), com auditoria completa zerada. Os números abaixo preservam o resultado do primeiro bloco.

O primeiro bloco de correções atualiza as dependências de produção identificadas na auditoria de lançamento. `npm audit --omit=dev` passou de **18 ocorrências (3 críticas, 2 altas, 12 moderadas e 1 baixa) para zero** no lockfile corrigido. Esse resultado cobre os avisos conhecidos pelo npm no momento da consulta; não constitui garantia de ausência de falhas na aplicação.

## Alterações

| Dependência | Versão anterior no lockfile | Versão corrigida |
|---|---|---|
| Next.js | 15.5.25 | 15.5.29 |
| Sentry Next.js | 10.75.0 | 10.78.0 |
| DOMPurify | 3.4.16 | 3.4.17 |
| Zod | 4.3.6 | 4.6.7 |
| sanitize-html | 2.18.0 | 2.18.1 |
| Busboy, override existente | 3.2.1 | 3.2.4 |

As versões principais foram mantidas. O lockfile também atualiza dependências transitivas afetadas, incluindo fast-uri, source-map-js, qs e a cadeia de autenticação Google. Não houve alteração na lógica de cadastro, cobrança, autorização, conteúdo ou banco.

O Sentry continuava trazendo Glob 13, com avisos de Glob/Minimatch. Foi adicionado **override limitado a `@sentry/bundler-plugins`**, usando Glob 14.0.3 e sua cadeia corrigida. Esse override atravessa uma versão principal e exige verificação de compatibilidade do build. Não foi aplicado um override global de Minimatch: os consumidores antigos de ferramentas de desenvolvimento usam contratos diferentes. Quando o Sentry adotar uma cadeia corrigida, revisar a necessidade deste override.

Referências primárias: [Next.js](https://github.com/advisories/GHSA-2464-fhr4-w9xw), [Sentry e tunnelRoute](https://github.com/advisories/GHSA-mchm-gjx6-7h55), [DOMPurify](https://github.com/advisories/GHSA-mrv2-3pqr-j5jr), [Glob](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4). A configuração de tunnelRoute foi preservada com SDK corrigido; não se declarou que a falha havia sido explorada nesta instalação.

## Validação

- Instalação limpa por `npm ci` em cópia temporária sem `.env` operacional, com Node 24.22.2: aprovada.
- Auditoria de produção: zero ocorrências.
- Lint, 43 testes de scripts, 163 suítes/833 testes unitários, TypeScript geral e de segurança: aprovados. Uma suíte/sete testes Firestore permanecem ignorados por dependerem de emulador.
- Build de produção Next 15.5.29 e quatro testes públicos centrais: aprovados. Navegação, landmarks, nonce CSP novo por resposta e hidratação do login passaram.
- A suíte pública central seleciona os quatro testes de `e2e/smoke.spec.ts`. O cenário de recursos que falhou por seletor na auditoria anterior não integra esta validação de dependências; continua pendente.

O navegador usa o Chromium já instalado, revisão 1243. Seleção do executável, recorte dos testes e desativação de trace/vídeo foram feitos somente na cópia temporária, preservando os arquivos de CI/Playwright do repositório. Build e smoke executam com a mesma fixture local, sem serviços reais ou credenciais operacionais.

As dependências da pasta de trabalho também foram sincronizadas com o lockfile corrigido. O hash SHA-256 do lockfile coincide entre a pasta de trabalho e a cópia validada. O scanner de segredos do release não encontrou ocorrências. O envio real de eventos e source maps ao Sentry não foi exercitado, pois a validação usa configurações fictícias sem credenciais do provedor.

Os logs ficam em `reports/security-2026-11-04-*`, incluindo instalação limpa, auditorias de produção/completa e validação. Esse diretório é ignorado pelo Git.

## Pendências delimitadas

A auditoria completa, incluindo ferramentas de desenvolvimento, ainda aponta **34 ocorrências: 33 moderadas e 1 baixa; nenhuma alta ou crítica**. As causas diretas restantes são Glob, Minimatch, deepmerge e postcss-selector-parser, por cadeias de lint/testes. O npm propõe mudanças de versão principal ou downgrades para parte delas, e deepmerge não possui versão corrigida publicada na consulta realizada. Tratar essa cadeia em uma tarefa de compatibilidade própria, mantendo os avisos visíveis. Não foi usado `npm audit fix --force` nem alterado o limiar de segurança da CI.

Também permanecem os itens de segurança operacional do [plano de lançamento](2026-11-04-launch-readiness.md): conferir proteção contra senhas vazadas no Supabase, comprovar revogação de credenciais históricas e homologar permissões/sessões no ambiente isolado. Esta correção local não modifica provedores externos.

As correções precisam de commit, CI no SHA exato e publicação para proteger a versão hospedada. Nenhum push ou deploy foi realizado nesta etapa.
