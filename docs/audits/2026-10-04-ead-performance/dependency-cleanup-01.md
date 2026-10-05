# Primeiro lote de dependências órfãs

## Escopo

Foram removidos `@google/generative-ai` (0.24.1) e `next-view-transitions` (0.3.5) de `package.json` e do lockfile. São dois candidatos do relatório inicial do Knip.

A busca confirmou ausência de imports e de consumidores no código, testes, scripts e configurações. Também foram pesquisados os símbolos `GoogleGenerativeAI`, `ViewTransitions` e `useTransitionRouter`. Nenhum outro pacote no lockfile dependia desses dois pacotes como dependência, dependência opcional ou peer.

O lote remove somente as duas entradas diretas e suas duas entradas de instalação. As versões dos demais pacotes permanecem idênticas às do lockfile anterior a esta limpeza. Nenhum arquivo de aplicação foi excluído.

## Validação

A validação usa uma cópia sem `.env` e uma instalação nova pelo lockfile, para que bibliotecas remanescentes no `node_modules` antigo não ocultem imports indevidos. Scripts de instalação são desativados nessa cópia, que não possui repositório Git nem hooks operacionais.

Checks concluídos:

- `npm ci --ignore-scripts`: passou, com os dois pacotes ausentes da instalação nova.
- Knip: 8 dependências candidatas, contra 10 antes; nenhum import não resolvido. O relatório atual da workspace está em `reports/knip.json`, ignorado pelo Git. A captura original foi preservada na pasta da auditoria.
- Lint e typecheck: passaram.
- Scripts: 43 testes aprovados.
- Jest: 137 suítes e 639 testes aprovados; 7 testes pulados pela configuração existente.
- Build: passou; o lobby do curso mantém 397 kB de First Load JS.
- Smoke público: 7 testes aprovados em 11,1 segundos, exit code 0.

O smoke usou o Chromium headless shell 1243 já instalado, com configuração temporária apenas na cópia de teste. O servidor Next foi iniciado diretamente e o fixture reutilizou a porta embutida no build, como na validação anterior. Os resultados resumidos estão em `dependency-cleanup-01.json`.

Depois dos checks, as duas pastas antigas dos pacotes também foram retiradas do `node_modules` da workspace. As cópias temporárias da validação foram descartadas.

## Limites

Como os pacotes já não participavam do grafo de imports, esta mudança reduz dependências de instalação e manutenção. Não há expectativa de redução adicional relevante no JavaScript inicial das páginas.

Os outros candidatos do Knip serão avaliados em lotes separados. Firebase permanece instalado enquanto houver consumidores. A jornada autenticada continua aguardando homologação.
