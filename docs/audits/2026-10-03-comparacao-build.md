# Comparação de build e testes com remoção isolada de arquivos

Data: 03/10/2026. Base: workspace local com alterações preexistentes, HEAD `6f29970766eeccad643680d07422bc33ec8a7b31`. Não equivale ao deploy. Nenhum candidato foi excluído do diretório original.

## Resultado

| Verificação | Completa | Sem 205 candidatos |
|---|---:|---:|
| Typecheck | Exit 0, 34 s | Exit 0, 29 s |
| Build Next | Exit 0, 160 s | Exit 0, 149 s |
| Entradas do manifesto App Router | 109 | 109, idênticas |
| Rotas pré-renderizadas com dados fictícios | 24 | 24, idênticas |
| First Load JS compartilhado | 166 kB | 166 kB |
| Suítes Jest aprovadas | 77 | 63 |
| Suítes Jest com falha | 0 | 14 |
| Suítes ignoradas | 1 | 1 |
| Asserções aprovadas | 270 | 234 |
| Asserções falhas / ignoradas | 0 / 7 | 0 / 7 |

**Passar a build não tornou os 205 arquivos dispensáveis.** 14 suítes anteriormente aprovadas falharam após a retirada; a maioria não conseguiu carregar módulos. Quando uma suíte não carrega, suas asserções deixam de ser contadas. A cópia reduzida não tem maior qualidade por registrar zero asserções falhas.

O grafo estático iniciado nos testes de src alcança 21 dos candidatos, direta ou indiretamente. Essa contagem não inclui uma busca exaustiva por consumidores de scripts/testes externos/imports calculados. Os demais 184 precisam de revisão. O conjunto omitido soma 1.486.692 bytes de fonte; o bundle compartilhado permaneceu igual, sem ganho comprovado de desempenho. Tempos de execução são observações, não benchmark.

## Suítes que regrediram

| Suíte | Completa | Sem candidatos |
|---|---|---|
| `src/components/resources/apps/rios-dos-pensamentos/src/features/interactive-resources/thought-river/__tests__/river.test.ts` | Aprovada | Falha |
| `src/components/resources/apps/jardim-de-pensamentos/src/features/interactive-resources/thought-garden/__tests__/thoughtGarden.test.ts` | Aprovada | Falha |
| `src/features/interactive-resources/pause-room/components/PauseCompletion.test.tsx` | Aprovada | Falha |
| `src/components/resources/apps/__tests__/resource-privacy-accessibility.test.tsx` | Aprovada | Falha |
| `src/components/resources/apps/__tests__/app-shell-contract.test.tsx` | Aprovada | Falha |
| `src/app/actions/admin/__tests__/course-mutations.materials.test.ts` | Aprovada | Falha |
| `src/lib/course-content/__tests__/revision.test.ts` | Aprovada | Falha |
| `src/features/public-site/__tests__/homepage-structure.test.tsx` | Aprovada | Falha |
| `src/features/interactive-resources/pause-room/repository.test.ts` | Aprovada | Falha |
| `src/components/visual/__tests__/FiguraVivaTree.test.tsx` | Aprovada | Falha |
| `src/components/ui/__tests__/StatCard.test.tsx` | Aprovada | Falha |
| `src/lib/__tests__/courseService.test.ts` | Aprovada | Falha |
| `src/actions/__tests__/student_flow.test.ts` | Aprovada | Falha |
| `src/actions/__tests__/community.test.ts` | Aprovada | Falha |

A comparação final passou todas as 77 suítes de aplicação executadas na cópia completa. A suíte Firestore foi ignorada nas duas cópias porque nenhum emulador estava ativo; não se comprovou RLS/segurança de banco por esse teste.

## Método e adaptações do laboratório

1. Copiar código/configurações/assets/testes para duas pastas novas fora do repositório. Omitir os candidatos somente na segunda. Não copiar .env. Dependências instaladas compartilhadas por junction, sem troca de lockfile.
2. Verificar que os 205 existem na origem e na baseline, estão ausentes na pruned e que seus hashes originais continuam iguais aos da baseline: resultado **confirmado**.
3. Substituir credenciais/env de serviços por fixtures. Supabase local permite apenas GET/HEAD com dados vazios. Firebase usa configuração fictícia sem emulador; Stripe não recebe eventos/pagamentos. Não é um teste de negócio nem de integração real.
4. Usar pacote oficial `@next/swc-wasm-nodejs@15.5.25` no laboratório, pois o SWC nativo foi bloqueado no Windows. Flags NEXT_TEST_WASM/NEXT_TEST_WASM_DIR foram verificadas no Next instalado. Não introduzir essas flags experimentais na hospedagem.
5. Executar tsc separado e Next build nas duas cópias. A primeira tentativa compilou, mas falhou na coleta por faltarem três variáveis Firebase públicas na fixture. As builds completas da tabela são as tentativas seguintes, com fixtures corrigidas. Isso evidencia acoplamento de configuração ainda existente.
6. Comparar conjuntos de app-paths/prerender manifest, sem tratar hash de artefato como equivalência semântica. Os conjuntos coincidiram.
7. Executar Jest de aplicação nas duas cópias com --runInBand, excluindo scripts/node:test e E2E. O WASM reescreveu aliases @/ para ./src/; um resolver adicional corrige apenas imports do projeto que não têm destino relativo existente, preservando os imports ./src legítimos dos aplicativos embutidos, a resolução de dependências e os mocks originais next/jest. Logs intermediários disponíveis com configuração inadequada não fundamentam as contagens finais.

O comando Jest amplo também registrou conflito de node:test/assert em script .mjs. Isso exige separar os runners na CI. A comparação final usa `app-resolver`; não é execução literal de npm test sem adaptações. Falhas de laboratório não foram corrigidas no produto para esta auditoria.

## Evidências preservadas fora do Git

- [Resumo JSON de comparação e diferenças](<C:/Users/aless/.codex/visualizations/2026/10/03/01a10335-acef-7420-876c-e473e31d8446/build-comparison/comparison-summary.json>).
- [Manifesto dos 205 arquivos omitidos/preservados](<C:/Users/aless/.codex/visualizations/2026/10/03/01a10335-acef-7420-876c-e473e31d8446/build-comparison/snapshot-manifest.json>).
- [Classificação dos candidatos e hashes preservados](<C:/Users/aless/.codex/visualizations/2026/10/03/01a10335-acef-7420-876c-e473e31d8446/build-comparison/candidate-classification.csv>).
- [Build completa — log](<C:/Users/aless/.codex/visualizations/2026/10/03/01a10335-acef-7420-876c-e473e31d8446/build-comparison/baseline-build.log>) e [build reduzida — log](<C:/Users/aless/.codex/visualizations/2026/10/03/01a10335-acef-7420-876c-e473e31d8446/build-comparison/pruned-build.log>).
- [Jest completo — relatório final](<C:/Users/aless/.codex/visualizations/2026/10/03/01a10335-acef-7420-876c-e473e31d8446/build-comparison/baseline-jest-app-resolver-results.json>) e [Jest reduzido — relatório final](<C:/Users/aless/.codex/visualizations/2026/10/03/01a10335-acef-7420-876c-e473e31d8446/build-comparison/pruned-jest-app-resolver-results.json>).
- [Runner de preparação/execução](<C:/Users/aless/.codex/visualizations/2026/10/03/01a10335-acef-7420-876c-e473e31d8446/build-comparison/run-comparison.cjs>) e [resolver de aliases do laboratório](<C:/Users/aless/.codex/visualizations/2026/10/03/01a10335-acef-7420-876c-e473e31d8446/build-comparison/audit-jest-resolver.cjs>).

Reproduzir as verificações já preparadas, em PowerShell, sem tocar nos arquivos originais:

```powershell
node 'C:\Users\aless\.codex\visualizations\2026\10\03\01a10335-acef-7420-876c-e473e31d8446\build-comparison\run-comparison.cjs' baseline types
node 'C:\Users\aless\.codex\visualizations\2026\10\03\01a10335-acef-7420-876c-e473e31d8446\build-comparison\run-comparison.cjs' pruned types
node 'C:\Users\aless\.codex\visualizations\2026\10\03\01a10335-acef-7420-876c-e473e31d8446\build-comparison\run-comparison.cjs' baseline build
node 'C:\Users\aless\.codex\visualizations\2026\10\03\01a10335-acef-7420-876c-e473e31d8446\build-comparison\run-comparison.cjs' pruned build
node 'C:\Users\aless\.codex\visualizations\2026\10\03\01a10335-acef-7420-876c-e473e31d8446\build-comparison\run-comparison.cjs' baseline jest app-resolver
node 'C:\Users\aless\.codex\visualizations\2026\10\03\01a10335-acef-7420-876c-e473e31d8446\build-comparison\run-comparison.cjs' pruned jest app-resolver
node 'C:\Users\aless\.codex\visualizations\2026\10\03\01a10335-acef-7420-876c-e473e31d8446\build-comparison\summarize-comparison.cjs'
```

O comando prepare foi executado uma vez e recusa sobrescrever snapshots existentes. Repetir os comandos acima atualiza logs; guardar cópia se quiser conservar a execução original. O laboratório requer o pacote WASM já extraído e node_modules já instalado. Não é um roteiro de instalação limpa.

## Critério para a limpeza futura

Excluir pequenos lotes após revisar consumidores e decisão de produto. Exigir build/types e ausência de novas regressões em testes/rotas. Manter módulos ainda utilizados por testes até decidir se seu comportamento deve continuar ou ser aposentado. Reavaliar assets e dependências separadamente: retirar fonte não utilizada não demonstra menor custo de carregamento.
