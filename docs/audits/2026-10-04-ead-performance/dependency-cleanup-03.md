# Terceiro lote de dependências órfãs

Foram removidas as dependências diretas `@tsparticles/react` (3.0.0), `@tsparticles/slim` (3.9.1) e `tsparticles` (3.9.1). A busca nos fontes, testes, scripts e E2E não encontrou imports desses pacotes ou seus inicializadores.

O grafo do lockfile foi conferido antes da alteração: todas as 49 entradas de instalação da família de partículas eram usadas apenas entre si ou pelas três dependências diretas removidas. Nenhum pacote remanescente depende delas, inclusive via dependência opcional ou peer. Nenhuma outra entrada de instalação ou versão foi alterada.

`recharts` foi mantido: existe um import em `src/components/admin/analytics/AnalyticsDashboard.tsx`. O componente não está conectado às rotas atuais e, por isso, a análise de alcance do Knip aponta a biblioteca como candidata. Removê-la isoladamente deixaria esse arquivo com imports quebrados. A decisão sobre o componente deve acompanhar uma eventual remoção da biblioteca.

O relatório atual do Knip aponta três dependências candidatas: `jspdf`, `qrcode.react` e `recharts`, sem imports não resolvidos. Os arquivos de aplicação foram preservados.

## Validação

A instalação e os checks foram executados em uma cópia isolada sem arquivos `.env`, usando o fixture local de CI.

- `npm ci --ignore-scripts --no-audit --no-fund`: passou, com 1.372 pacotes instalados (49 a menos que o lote anterior); todos os pacotes removidos estavam ausentes da instalação nova.
- Lint, TypeScript e build: passaram, exit code 0.
- Smoke público: 7 testes aprovados em 10,9 segundos, exit code 0.
- First Load JS do curso: 397 kB; aula direta: 324 kB.
- Knip: 3 dependências candidatas, contra 6 antes deste lote; nenhum import não resolvido.

O smoke usou o Chromium headless shell 1243 instalado, com configuração temporária na cópia de teste, servidor Next iniciado diretamente e fixture na porta embutida no build. O build repetiu o aviso `Unable to snapshot resolve dependencies` do cache do Webpack e concluiu normalmente. Esse resultado não mede o cache do GitHub.

As suítes de scripts e Jest não foram repetidas neste lote, que não altera fontes ou consumidores; os 43 testes de scripts e 639 testes Jest registrados no lote anterior continuam sendo a última execução dessas suítes. A instalação nova, o typecheck, o build e a navegação pública foram verificados novamente.

As pastas antigas de partículas também foram retiradas do `node_modules` da workspace. A cópia temporária foi descartada. `dependency-cleanup-03.json` registra as 49 entradas removidas; `reports/knip.json` contém a leitura atual e permanece ignorado pelo Git.

## Limites

Como os pacotes já não participavam do grafo de imports, esta limpeza reduz dependências de instalação e manutenção, sem expectativa de redução adicional relevante no JavaScript inicial.

A jornada autenticada aguarda homologação; o efeito do cache de CI aguarda publicação e execuções compatíveis no GitHub.
