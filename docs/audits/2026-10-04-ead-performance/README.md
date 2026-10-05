# Bundle do EAD, cache e auditoria contínua

## Alterações

- O lobby `/portal/course/[courseId]` carrega `LessonPlayer` com `next/dynamic` apenas no ramo que exibe uma aula. O fallback anuncia o carregamento para leitores de tela. URLs, permissões e atualização de progresso mantêm o comportamento existente.
- O CI restaura e salva `.next/cache`, com chave por sistema, configuração, lockfile e commit. Commits seguintes podem reutilizar o cache compatível.
- `check-ci.mjs` habilita `FIGURA_CI_VALIDATED=1` somente quando lint e typecheck já passaram na mesma execução. Nesse caso o build dispensa a repetição dessas duas verificações. O runner descarta o valor recebido do ambiente; builds avulsos mantêm validação completa.
- Knip 6.39.0 foi fixado no lockfile. `npm run audit:knip` gera JSON sem falhar por achados de código ocioso. Erros de execução/configuração continuam sendo erros. O job independente publica `knip-report` por 14 dias e não usa correção automática.

## Uso do relatório

```sh
npm run --silent audit:knip > reports/knip.json
```

Crie `reports/` antes de redirecionar a saída. A pasta é ignorada pelo Git; uma captura desta auditoria está em `knip.json` ao lado deste documento.

Os achados são candidatos à investigação, não autorização para excluir arquivos. O grafo inclui as entradas do Next/Jest/Playwright, scripts de manutenção e setup E2E. `firebase` é reconhecido como binário operacional do emulador. Recursos carregados externamente e dependências usadas apenas por ferramentas ainda exigem análise humana.

Primeira captura: 90 arquivos candidatos, 10 dependências, 1 dependência de desenvolvimento. Também há exports/tipos candidatos e referências a pacotes não declarados diretamente. Nenhum arquivo ou pacote de produção foi removido. As versões diretas de produção foram preservadas; o Knip usa sua própria versão de Zod quando necessário.

## Validação

| Rota | First Load JS antes | Depois |
| --- | ---: | ---: |
| `/portal/course/[courseId]` | 493 kB | 397 kB |
| `/portal/course/[courseId]/lesson/[lessonId]` | 325 kB | 325 kB |

Valores publicados pelo `next build` (Next 15.5.25): redução de 96 kB, aproximadamente 19,5%, no lobby. A aula mantém o mesmo total inicial. `bundle-comparison.json` registra uma segunda métrica: soma gzip dos arquivos JS únicos dos manifests da página e dos dois layouts. Essa soma inclui arquivos diferentes do cálculo de First Load do Next e não deve ser comparada diretamente com a tabela.

Ambos os builds passaram. O build avulso de referência executou lint/typecheck internos; o build pelo pipeline registrou `Skipping validation of types` e `Skipping linting` depois dos checks separados aprovados. A compilação local mostrou 7,0 minutos antes e 3,8 minutos depois, mas concorrência, caches e junction de dependências impedem atribuir essa diferença exclusivamente à alteração.

Builds e testes foram executados em cópias locais isoladas sem arquivos `.env`, usando `scripts/check-ci.mjs` e seus fixtures. Lint, 32 testes de scripts, 136 suítes/636 testes Jest e typecheck passaram; 7 testes Jest foram pulados pela configuração existente. O lockfile passou em `npm ci --dry-run --ignore-scripts` numa pasta limpa. O smoke público passou nos 7 testes em 9,4 segundos (exit code 0). `verification.json` registra o resultado e os seis chunks do player ausentes da entrada inicial do lobby.

No Windows local, faltava o Chromium 1208 esperado pelo Playwright e a instalação parou durante a extração. O smoke foi executado com o Chromium headless shell 1243 já instalado, em configuração temporária da cópia de teste. O servidor Next foi iniciado diretamente porque o encerramento do `webServer` pelo Playwright ficou pendente, e o fixture reutilizou a porta embutida no build. Esses ajustes locais não foram incorporados à aplicação ou ao CI; o workflow continua instalando o Chromium correspondente ao lockfile.

O smoke público não valida matrícula, retomada de aula ou certificado autenticados. O benefício do cache no GitHub requer ao menos duas execuções reais do workflow e não pode ser estimado a partir de builds locais.

A continuação preparou uma jornada autenticada determinística e corrigiu a atualização assíncrona do cartão de certificado. A execução real permanece pendente por ausência de homologação. Consulte [preparação do piloto](ead-pilot.md) para os resultados locais e requisitos do ambiente.

O [primeiro lote de limpeza](dependency-cleanup-01.md) removeu duas dependências confirmadas sem consumidores, preservando as versões restantes. A nova instalação limpa passou em lint, typecheck, 43 testes de scripts, 639 testes Jest, build e 7 testes de smoke público. Nesse ponto, o Knip passou a apontar 8 dependências candidatas.

O [segundo lote de limpeza](dependency-cleanup-02.md) removeu as duas dependências de pós-processamento 3D sem consumidores e a transitiva `n8ao`. A instalação limpa e a mesma matriz de checks passaram novamente; o curso manteve 397 kB de First Load JS. Nesse ponto, restavam 6 dependências candidatas no Knip, sem imports não resolvidos.

O [terceiro lote de limpeza](dependency-cleanup-03.md) removeu três dependências diretas de partículas e suas 49 entradas de instalação, sem consumidores compartilhados. Instalação limpa, lint, TypeScript, build e 7 testes públicos passaram; o curso mantém 397 kB. O Knip agora aponta 3 candidatos. `recharts` foi preservado por ter um import em um componente fora das rotas; `jspdf` e `qrcode.react` aguardam o próximo lote.

## Referências

- [Next.js 15: lazy loading](https://nextjs.org/docs/15/app/guides/lazy-loading)
- [Next.js 15: cache de builds no CI](https://nextjs.org/docs/15/app/guides/ci-build-caching)
- [Knip: configuração](https://knip.dev/reference/configuration)
- [Knip: argumentos CLI](https://knip.dev/reference/cli)
