# Bloco 13 — configuração Supabase e integração do site

Data: 04/10/2026. Implementação local após a limpeza e a publicação da base única 1e61f15. As migrações e os registros remotos não foram alterados nesta rodada.

## Correções implementadas

- Validação compartilhada no Next config e nos clientes Supabase: projetos históricos recusados por URL ou referência da chave legada; URL e JWT de projetos diferentes recusados; chaves privilegiadas públicas bloqueadas antes da compilação e antes de criar o cliente. Valores com espaços e hostname com ponto DNS final também são classificados.
- Compatibilidade com as novas chaves: publishable no navegador e SUPABASE_SECRET_KEY somente no servidor, preservando as aliases legadas. O cliente privilegiado não faz fallback para anon. O hash de rate-limit aceita a nova chave de servidor e uma chave estável própria.
- Scripts revisados de capas, migração de anexos e conferência Auth usam o mesmo bloqueio. Nenhuma credencial foi rotacionada, utilizada para testar projetos antigos ou impressa. A configuração local foi lida somente para classificação e passou.
- O detalhe do curso mantém o único landmark main do layout e preserva a edição das mediadoras.
- Contato/WhatsApp do rodapé, controles flutuantes, detalhe do curso e calendário usa um DTO pequeno carregado no servidor. O cache tem TTL de 60 segundos e o administrador já revalida o layout. Os componentes públicos não importam hooks de banco para esses dados; as configurações continuam editáveis. O cache/revalidação segue as APIs [unstable_cache](https://nextjs.org/docs/15/app/api-reference/functions/unstable_cache) e [revalidatePath](https://nextjs.org/docs/15/app/api-reference/functions/revalidatePath) do Next 15. O controle de áudio respeita a opção administrativa.

O módulo de configuração apenas reconhece formatos e referências conhecidas; a autenticação continua sob responsabilidade do Supabase. Código bloqueado, histórico substituído e build aprovada não comprovam revogação no provedor. [Chaves e rotação, documentação Supabase](https://supabase.com/docs/guides/getting-started/api-keys).

## Integração e preservação de trabalho

O diretório contém alterações paralelas no conteúdo administrativo, mediadoras, cursos e compressão de imagens. Elas foram preservadas. A primeira cópia revelou dois testes de regressão: main duplicado e importação dos hooks de configurações nos componentes globais. Ambos foram corrigidos no código, mantendo os testes de acessibilidade/desempenho. Uma segunda cópia recebeu a nova implementação de upload antes de seus testes atualizados e o runner Jest falhou; essa execução foi interrompida e seus logs preservados. A validação consolidada usa uma nova cópia congelada com os testes correspondentes.

## Verificação

A cópia consolidada passou **lint, 30 testes de scripts, 528 testes Jest em 120 suítes, TypeScript, build nativa e cinco testes públicos de navegador**. Sete testes e uma suíte de emulador permaneceram ignorados. O manifesto contém 115 entradas App Router: nenhuma rota anterior removida e somente a nova API administrativa de imagens acrescentada.

O navegador concluiu com código 0; a execução inteira levou 151 segundos, incluindo encerramento. Chromium 153 local; a CI usa a versão fixada pelo Playwright. Estes resultados não são benchmark de desempenho. [Evidência estruturada](2026-10-03-evidence/validation-block-13.json).

Após o congelamento, chegaram alterações paralelas nos seguintes arquivos: `src/app/admin/(protected)/courses/[id]/page.tsx`, `src/components/admin/ImageUpload.tsx`, `src/components/admin/__tests__/ImageUpload.test.tsx`, `src/components/sections/HeroSection.tsx`, `src/features/courses/infrastructure/__tests__/supabaseAdminCourseRepository.test.ts`, `next.config.mjs`, `tsconfig.json`, `next-env.d.ts`. Foram preservadas; não fazem parte da build congelada. O módulo de validação, os clientes Supabase e o provedor de contato público permaneceram iguais à cópia testada. A configuração Next posterior está incluída na lista de diferenças acima. As falhas e os três snapshots ficam no laboratório privado validation-block-13, fora do repositório.

A execução usa Windows/Node 26 e fixtures locais, sem arquivos de ambiente ou credenciais operacionais. A cópia de node_modules é compartilhada por junction, somente para uso das dependências. Não foram enviados arquivos, e-mails ou pagamentos reais. CI Linux/Node 24, homologação autenticada, atualização editorial real, SMTP e teste bancário permanecem pendentes.

## Progresso e sequência

O backlog agora registra 13 itens com correção principal implementada, 19 parciais e 13 não executados: 32 ainda têm trabalho, decisão ou verificação pendente. ORG-01 foi concluído na limpeza; ORG-03, SEC-01 e OPS-06 têm entrega parcial comprovada. A contagem não é uma porcentagem de prazo nem uma aprovação de lançamento. [Progresso dos 45 itens](2026-10-04-progresso-relatorio.md).

Próxima rodada de código: domínio/canonical/sitemap e validação dos links públicos; depois homologação de cadastro, SMTP e Pix de matrícula/primeira parcela. O banco recebedor ainda precisa ser informado. PDFs históricos e ações privilegiadas continuam na revisão; avaliações, progresso e certificados EAD permanecem posteriores ao release comercial.

Atualização para commit/push solicitado em 04/10/2026: as alterações posteriores foram revalidadas em uma nova cópia final, com **lint, 532 testes Jest em 121 suítes, 30 testes de scripts, TypeScript e build nativa aprovados**. Não houve diferença de código entre essa cópia e o conjunto preparado para o commit. Sete testes e uma suíte de emulador continuam ignorados. [Evidência da preparação para publicação](2026-10-03-evidence/publication-validation-block-13.json).

Este relatório acompanha o commit de consolidação enviado para main. O sucesso Vercel registrado no bloco 12 se refere à base anterior 1e61f15; o deployment desta revisão e a homologação operacional são verificados separadamente.
