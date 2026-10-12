# Baseline de entrada Recursos Interativos v2

Verificada em 12 de outubro de 2026, antes de alterações funcionais.

| Verificação | Resultado |
| --- | --- |
| `npm run typecheck` | aprovado |
| `npm run lint` | aprovado |
| `npm test -- --runInBand --testPathPatterns='src/components/resources\|src/features/interactive-resources' --silent` | 27 suítes e 112 testes aprovados |
| `node scripts/check-ci.mjs build` em cópia isolada, sem arquivos de ambiente | aprovado; tipos e lint habilitados |

O build inicial no sandbox falhou por resolução de `fonts.googleapis.com` e permissões de escrita. A repetição com acesso às fontes oficiais e permissões adequadas passou. Os avisos existentes incluem `MODULE_TYPELESS_PACKAGE_JSON` e serialização de strings grandes do cache webpack. Não foram usados bypasses de validação, credenciais reais, publicação ou migrations remotas.

A entrada tinha 24 diretórios de aplicativos, 12 entradas públicas no catálogo, aliases já consolidados, dados da Roda presentes e uma experiência funcional do Rio. Alterações locais anteriores foram preservadas. O Design System foi copiado integralmente e seu hash conferido em `docs/brand/README.md`.
