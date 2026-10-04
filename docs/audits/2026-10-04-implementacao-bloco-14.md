# Bloco 14 — domínio, descoberta pública e atendimento

Data: 04/10/2026. Alterações locais sobre o commit 5c5cceb; publicação não executada neste bloco.

## Correções

- Metadados, Open Graph, JSON-LD, robots, sitemap e legenda do cartão social usam uma origem pública comum: NEXT_PUBLIC_BASE_URL ou o domínio confirmado https://www.institutofiguraviva.com.br. Configurações com credenciais, caminho, query, fragmento ou HTTP externo são recusadas. Não se deriva a origem de headers do visitante.
- Curso agora possui canonical e URL Open Graph. Artigos usam a mesma regra de slug/ID aplicada pelo sitemap, com segmentos codificados. Curso inexistente indica noindex. A imagem padrão do artigo usa o endpoint real de cartão social, em vez de /og-default.jpg.
- Sitemap consulta apenas colunas necessárias e cursos is_published com status open/closed. Rascunhos comerciais ficam fora, mantendo a regra do catálogo. Artigos exigem is_published.
- Cada consulta tem abortSignal com prazo de 1,5 segundo. Falhas, inclusive configuração ausente do cliente, preservam as dez rotas institucionais; resultados acompanhados de erro são descartados. Datas inválidas não são emitidas e páginas estáticas não fingem atualização a cada consulta.
- O sitemap é revalidado a cada cinco minutos para acompanhar publicações sem exigir novo deployment. /termos foi incluído no sitemap. Não foi encontrado link público para /contato na busca deste bloco; não se criou uma página artificial para corrigir uma referência antiga do relatório.
- Proprietário confirmou contato@figuraviva.com.br. Uma constante compartilhada mantém rodapé e suporte do portal alinhados. Isto confirma o endereço indicado, sem testar entrega de e-mail.

## Evidência e validação

Consulta somente de leitura no Supabase jdxorryvmcvtqsddkpdm: dois cursos publicados em status open/closed e um post publicado. Nenhuma alteração no banco, nas políticas ou nas credenciais.

Cópia isolada no laboratório validation-block-14, sem arquivos de ambiente operacionais. A atualização do e-mail foi incluída na cópia antes dos testes e da build; lint específico posterior cobre os três arquivos atualizados após o lint inicial. A inferência inicial da consulta com nome de tabela variável falhou no TypeScript; foi corrigida separando cursos e posts, sem enfraquecer tipos. Uma tentativa posterior de build falhou no carregamento remoto de fonte Google pelo next/font; a repetição mantém o comportamento de produção, sem substituir as fontes por mocks. Resultado final: lint, 543 testes do aplicativo (122 suítes), 30 testes de scripts, tipos e build aprovados; sete testes seguem ignorados pela configuração existente. A build confirmou 45 páginas estáticas e revalidação do sitemap em cinco minutos. [Evidência de validação](2026-10-03-evidence/validation-block-14.json).

Novos cenários verificam origem oficial, ambiente separado/loopback, rejeição de origem insegura, codificação do slug, catálogo indisponível, filtro comercial, descarte de dados com erro e endereço do robots. Os testes de consultas usam mocks; a consulta de contagem real confirma a disponibilidade dos campos/filtros, sem afirmar uma jornada de usuário em produção.

## Limites e próximos passos

SITE-05 e OPS-06 permanecem parciais: falta homologar o deployment, revisar todos os landmarks e foco/teclado em telas menores, validar demais destinos de contato e definir indexação de Preview/homologação. O campo legado de SEO administrativo ainda não substitui os metadados estáticos; consolidar esse contrato exige um bloco próprio.

Auth conserva sua exigência explícita de NEXT_PUBLIC_BASE_URL. SMTP, banco recebedor Pix, homologação separada e revogação das credenciais antigas continuam pendentes. SEO-01 (HTML editorial sanitizado no servidor) permanece para uma rodada posterior.

O cadastro centralizado de mediadores permanece somente como lembrete, conforme pedido do usuário. Nenhuma implementação desse cadastro ocorreu.

Referências: [metadados Next 15](https://nextjs.org/docs/15/app/api-reference/functions/generate-metadata), [timeout de consulta Supabase](https://supabase.com/docs/reference/javascript/using-modifiers-abortsignal).
