# Implementação do bloco 11 — dependências e JSON-LD

Objetivo: reduzir os riscos de dependências antes do lançamento comercial e fechar a fragilidade de serialização identificada na auditoria. Nenhuma rotação, migração, exclusão de projeto, commit, push ou publicação foi executada.

## Correções adotadas

- Sharp: 0.34.5 → 0.35.5, incluindo os binários/libvips correspondentes. Node mínimo da versão nova: 20.9; o projeto já indica Node 24 para CI.
- DOMPurify: 3.4.15 → 3.4.16, agora dependência direta porque o código importa o pacote diretamente.
- Override de @fastify/busboy: 3.2.1.
- Override de @grpc/grpc-js: 1.13.6. A versão fica fora do ~1.9 declarado pelo SDK Firebase presente; isso exige verificação explícita. Leituras pelo SDK Firebase Node e pelo SDK administrativo Firestore foram ensaiadas contra serviço gRPC local fictício, com sucesso. O ensaio não equivale a regras/emulador completo ou serviço real.
- Override somente do PostCSS utilizado por Next: 8.5.23. A versão principal de Next/Firebase não foi trocada, e as sugestões automáticas de downgrade do Firebase não foram adotadas.
- JSON-LD escapa o caractere menor que antes de ser incorporado ao HTML. Ensaio de SSR/DOM com fechamento de script e elementos maliciosos confirma preservação dos dados e ausência de elementos executáveis adicionais. O consumidor atual usa dados literais; não se alega XSS armazenado explorado em produção. CSP com nonce ainda precisa de trabalho próprio.

## Evidência e limites

A auditoria de produção caiu de 17 entradas afetadas, incluindo sete altas, para oito entradas moderadas, sem altas/críticas. Entradas transitivas podem representar o mesmo advisory; os números não são uma contagem de vulnerabilidades únicas. O npm audit continua retornando exit 1 pelas moderadas restantes. A cadeia restante envolve uuid e bibliotecas Firebase Admin/Google Cloud. Não se declara segurança completa nem ausência de exploração.

O lockfile foi gerado primeiro numa pasta isolada. A comparação registrou 34 alterações de versões/entradas, predominantemente binários Sharp e dependências relacionadas; nenhuma entrada foi removida. Instalação limpa local com npm ci --ignore-scripts --no-audit --no-fund adicionou 1397 pacotes, em diretório próprio, sem junction de node_modules. Scripts de instalação foram desabilitados; isso não substitui a execução padrão da CI. O manifest/lockfile foram adotados após validação e a instalação do workspace foi sincronizada, sem scripts.

Lint, 14 testes de scripts, 465 testes Jest em 106 suítes, TypeScript e build nativa passaram. Sete testes e uma suíte Firestore seguem ignorados sem emulador. A build Next 15.5.25 compilou em 89 segundos e gerou 44 páginas estáticas. Leituras Firestore pelos dois SDKs, conversão de imagem sintética para WebP e sanitização de HTML malicioso fictício passaram. Tudo usou dados fictícios e serviços locais, sem chaves reais.

Cinco testes públicos Playwright passaram em 21,4 segundos, incluindo os recursos em celular. Alterações paralelas de navegação/modal foram preservadas e incluídas na repetição de lint, Jest, tipos, build e navegador. Um primeiro teste móvel comparava literalmente 44 com a medida subpixel 43,999999; foi corrigido para esperar a animação e arredondar pixels e passou na repetição. A build posterior compilou em 46 segundos. A cópia validada contém 1.310 arquivos de código/conteúdo/testes. A comparação final encontrou 28 caminhos alterados/adicionados em paralelo após o snapshot, entre 1313 arquivos atuais conferidos. Os arquivos deste bloco (JSON-LD, teste e E2E) e manifest/lockfile coincidem com os validados. As demais alterações foram preservadas e não estão cobertas pela build deste snapshot; o workspace atual exige validação consolidada. Arquivos de ambiente foram excluídos. O navegador disponível no laboratório é Chromium 153, utilizado por configuração temporária somente no laboratório e restaurada após o teste; o repositório mantém o navegador padrão do Playwright para CI. O ambiente local é Windows/Node 26.5.0; Linux, Node 24, GitHub Actions, Vercel e a jornada autenticada continuam exigindo validação. [Evidência sanitizada](2026-10-03-evidence/block-11-validation.json).

## Operação e próximos blocos

Você confirmou hospedagem Vercel e domínio UOL. Banco Pix e homologação separada ainda não foram definidos. A consulta somente de leitura listou três projetos acessíveis no Supabase; o projeto antigo da auditoria não apareceu. Isso não comprova exclusão. Entregue o [roteiro de credenciais e Vercel](../operations/credenciais-e-vercel.md); nenhuma chave foi recuperada/exposta para teste de acesso.

Continuam prioritários: comprovar revogação das credenciais históricas; identificar o deployment/commit atual; validar SMTP e ambiente separado; configurar preços e dados bancários; executar inscrição → Pix → conferência → acesso. No código do site ainda faltam domínio/canonical/sitemap, contato/configuração, conteúdo comercial e demais itens registrados no backlog. EAD e Stripe permanecem etapas posteriores, incluindo as pendências de segurança dessas áreas.

Referências: [Sharp/libvips](https://github.com/advisories/GHSA-f88m-g3jw-g9cj), [gRPC](https://github.com/advisories/GHSA-m9gg-hp2v-232j), [busboy](https://github.com/advisories/GHSA-x8mw-p69m-v3mx), [PostCSS](https://github.com/advisories/GHSA-fxqj-rqcc-2cmp).
