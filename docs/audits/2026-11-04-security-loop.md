# Correção dos 34 alertas restantes — 04/11/2026

O ciclo começou com 34 ocorrências no `npm audit` completo (33 moderadas e uma baixa), mantendo produção sem alertas. A resolução final passa a registrar **zero ocorrências tanto no conjunto completo quanto em produção**. Não foram usados filtros de exclusão, supressão de avisos, mudança de registry ou `npm audit fix --force`.

## Correções efetivas

- Glob 9–14 vulnerável foi substituído por 14.0.3 nas ferramentas de testes/build.
- postcss-selector-parser anterior a 6.1.5 foi atualizado para a correção compatível 6.1.5.
- O parser TypeScript e a cobertura usam Minimatch oficial 11.0.4.
- test-exclude foi atualizado de 6 para 8, evitando a dependência dos internals do Glob 7 e permitindo usar a cadeia moderna corrigida.
- As ferramentas de lint que ainda chamam Minimatch como função usam um adaptador local sobre o engine oficial 11.0.4. Ele preserva a API callable, helpers e defaults usados por esses consumidores. O helper `makeRe` oferece o contrato `.test(path)` usado pela regra de importação, sem compilar expressões com o engine antigo.
- deepmerge não tem correção publicada para o aviso consultado. Foi criada uma cópia local identificada como `4.3.1-fv.1`, com licença, declarações e proveniência do código upstream. As três gravações no destino agora definem propriedades próprias, impedindo que uma chave `__proto__` invoque o setter herdado.

A validação da árvore também exigiu alinhar o override antigo de gRPC com a versão 1.14.5 e fixar Debug 4.4.3 para seus consumidores da linha 4. A árvore instalada terminou sem dependências inválidas em `npm ls --all`.

Os pacotes locais ficam em `vendor/` e são **workspaces privados**, com versões locais identificadas por `-fv.1`. Os overrides dos consumidores selecionam essas versões. Os consumidores modernos continuam usando o pacote oficial; o engine do adaptador é instalado pelo alias explícito `minimatch-modern` e participa da auditoria. Não houve publicação desses pacotes.

O aviso de deepmerge foi reproduzido antes da correção, tanto ao copiar um alvo malicioso quanto ao mesclar uma origem em objeto sem protótipo. Em ambos os casos o protótipo do resultado era alterado. Os testes correspondentes agora exigem que o protótipo permaneça intacto.

## Ciclos de validação

1. Atualização dos pacotes com correção publicada: 34 → 32 ocorrências.
2. Substituição das cadeias restantes: auditoria chegou a zero, mas a validação detectou links inválidos do npm em overrides de diretórios locais. Essa instalação não foi aceita.
3. Workspaces e overrides por versão resolveram os links. Os testes ainda detectaram diferenças de API do Minimatch 11 e dependência de internals do Glob 7. O adaptador foi limitado ao contrato consumido e a cobertura migrou para test-exclude 8.
4. Treze testes específicos de segurança/compatibilidade passaram; auditoria completa e produção continuaram zeradas. Instalação limpa, árvore instalada e validação geral são conferidas antes de concluir o bloco.

## Verificação e prevenção de regressão

Os 13 testes em `tests/dependency-security/` cobrem protótipo do resultado, alvo/origem maliciosos, clonagem, arrays, símbolos, opções customizadas, helpers/defaults de matching, padrões amplificadores em processo com timeout, descoberta real de arquivos e a regra `import/no-internal-modules` do ESLint.

Eles foram adicionados a `test:scripts` e ao modo `scripts` de `check:ci`. A CI passou de auditoria somente de produção com limiar moderado para **`npm audit --audit-level=low`**, abrangendo ferramentas de desenvolvimento.

Instalação limpa com Node 24.22.2, auditoria completa e de produção, árvore instalada e 13 regressões específicas: aprovadas. A cobertura foi exercitada em `src/lib/pix.ts` com cinco testes aprovados (100% de linhas e 83,33% de branches nesse módulo), verificando a cadeia atualizada de instrumentação. Isso não representa cobertura integral da aplicação.

Testes gerais, tipos, build e navegador: em validação. Os registros locais ficam em `reports/security-loop-2026-11-04-*`, ignorados pelo Git. Não foram alterados registros de usuários, matrículas, pagamentos, conteúdo publicado ou provedores externos.

## Manutenção dos pacotes locais

O custo adicional é manter dois pacotes pequenos no repositório. Remover os overrides e workspaces quando os consumidores oferecerem dependências corrigidas compatíveis, repetindo as verificações. O arquivo `vendor/deepmerge/UPSTREAM.json` registra a versão, o arquivo de origem e seu SHA-256. A licença MIT original foi preservada. O adaptador não contém cópia do engine de matching.

O `makeRe` local não fornece a API completa de RegExp: novos consumidores que exijam internals precisam de revisão. Consulte [vendor/README.md](../../vendor/README.md) para escopo e comandos.

Referências primárias: [deepmerge](https://github.com/advisories/GHSA-gcqx-w48m-w2h4), [Minimatch](https://github.com/advisories/GHSA-g3hv-75wg-m249), [Glob](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4), [parser CSS](https://github.com/advisories/GHSA-rj75-hqrm-r3gf).

Este resultado não comprova revogação de credenciais históricas, configuração de Auth remoto ou liberação comercial. As alterações locais precisam de CI no commit exato e deploy para chegar à hospedagem.
