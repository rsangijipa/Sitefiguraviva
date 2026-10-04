# Quanto falta do relatório — após os blocos 12 e 13

Data: 04/10/2026. Base: 45 itens do backlog revisado. A contagem acompanha a correção principal de cada item, sem estimar prazo ou percentual de construção do aplicativo. Testes com fixtures e sucesso de deployment não substituem homologação com usuários, e-mail e banco reais.

Há **13 itens com a correção principal implementada, 19 parciais e 13 ainda não executados**. Portanto, **32 itens ainda têm implementação, decisão ou verificação pendente**. Mesmo os implementados podem exigir homologação.

| Área | Total | Principal implementado | Parcial | Ainda não executado |
|---|---:|---:|---:|---:|
| Segurança, banco e operação | 18 | 7 | 10 | 1 |
| Site e cadastro | 10 | 2 | 4 | 4 |
| Inscrição e Pix | 6 | 3 | 3 | 0 |
| Organização, desempenho e SEO | 6 | 1 | 2 | 3 |
| EAD posterior | 4 | 0 | 0 | 4 |
| Stripe posterior | 1 | 0 | 0 | 1 |

## Entregas desta sequência

O bloco 12 retirou 199 arquivos e arquivou os checkouts antigos. Dos 205 candidatos originais, 157 foram retirados e 48 preservados por consumidores/testes ou trabalho recente. O Git local e o GitHub receberam a base única 1e61f15; 13 branches antigas e 22 tags foram retiradas com backups conferidos. A Vercel confirmou sucesso desse deployment. [Registro da limpeza](2026-10-04-limpeza-diretorio.md).

O bloco 13 bloqueia os projetos históricos e credenciais privilegiadas públicas antes da compilação e nos clientes Supabase. Também corrige o landmark duplicado do curso e entrega contato/WhatsApp pelo servidor aos componentes públicos, preservando a edição administrativa. Estas alterações integram o commit de consolidação; deployment e homologação continuam sendo verificados separadamente. As alterações paralelas no editor de cursos, mediadoras, conteúdo e uploads foram preservadas; a validação se refere ao snapshot registrado no bloco, com lint/tipos/build, 528 testes do aplicativo, 30 de scripts e cinco cenários de navegador aprovados. As edições posteriores foram revalidadas para o commit: lint/tipos/build, 532 testes do aplicativo e 30 de scripts aprovados. O relatório distingue os snapshots e a verificação anterior no navegador. [Relatório e testes do bloco 13](2026-10-04-implementacao-bloco-13.md).

## Próximos passos em ordem

1. Publicar as correções locais após a validação consolidada e confirmar homologação com Auth, banco e Storage separados. Executar a CI Linux/Node 24 e a jornada autenticada; identificar responsáveis e ensaiar recuperação do banco/arquivos.
2. Confirmar revogação/exclusão das credenciais antigas no provedor. O bloqueio no código e a substituição do histórico não fazem essa revogação. Seguir o [roteiro de credenciais/Vercel](../operations/credenciais-e-vercel.md).
3. Configurar e homologar SMTP, confirmação, recuperação e primeiro acesso; concluir antiabuso/CAPTCHA e testar administração/bloqueio de sessões.
4. Informar banco recebedor e dados Pix, revisar valores reais de matrícula/primeira parcela e exceções/reembolso. Homologar crédito bancário, comprovante, rejeição, aprovação repetida e liberação de acesso.
5. Corrigir domínio/canonical/sitemap e revisar dados comerciais, carga horária, datas, WhatsApp e acessibilidade. Validar oferta/emissor da pós-graduação, contrato, finalidades dos dados e consentimento com os responsáveis.
6. Classificar os três PDFs públicos históricos, concluir revisão das ações privilegiadas e dos consumidores preservados. Consolidar desempenho/tipos e HTML editorial sanitizado no SSR.

Depois do release comercial, concluir avaliações/tentativas, proteção de gabarito e notas, progresso/conclusão/certificados autoritativos e idempotentes, e complementos do portal EAD. Stripe permanece posterior à decisão de automatizar pagamentos.

## Os 45 itens

| ID | Classificação | Status e pendências |
|---|---|---|
| SEC-01 | Parcial | Parcial: projetos históricos bloqueados nos clientes/build, chaves privilegiadas públicas recusadas e histórico principal substituído; revogação/exclusão no provedor e varredura completa pendentes |
| SEC-02 | Principal implementado | Implementado no Supabase; quatro RPCs restritas ao backend; permissões conferidas |
| OPS-05 | Parcial | Parcial: commit limpo 1e61f15 publicado, Vercel confirmou sucesso e backups Git/arquivos verificados; homologação separada, responsáveis e recuperação banco/Storage pendentes |
| AUTH-01 | Principal implementado | Implementado local: promoção por e-mail removida e cadastro público exige confirmação; publicação, SMTP, CAPTCHA e E2E pendentes |
| DATA-01 | Principal implementado | Implementado no Supabase: dois índices compatíveis com onConflict; jornada completa em homologação pendente |
| DATA-02 | Principal implementado | Implementado local e no Supabase: ações protegidas, políticas de leitura por dono/admin ativo versionadas e gravação do navegador revogada; teste por papel aprovado; publicação e homologação pendentes |
| AUTH-02 | Parcial | Parcial: perfil ativo e acesso ao curso protegidos; erros de banimento/desbloqueio tratados; publicação, E2E e invalidação de sessões/tabelas auxiliares pendentes |
| AUTH-03 | Parcial | Parcial: helpers de perfil/matrícula e acesso/autoria/conteúdo server-only; guard deriva papel da sessão e recusa outra identidade; ausência dos helpers conferida no manifest; revisão de todas as demais ações e homologação pendentes |
| OPS-01 | Parcial | Parcial: erros Auth tratados, último admin e histórico protegidos no banco, governança auditada; falhas parciais, concorrência e operações reais exigem homologação |
| OPS-02 | Parcial | Parcial: CI e validação nativa local implementadas; CI no GitHub/Node 24/Linux, E2E autenticado e ensaio de restauração banco/Storage pendentes |
| OPS-03 | Parcial | Parcial: Sharp, DOMPurify, busboy, gRPC e PostCSS corrigidos com lockfile validado; oito entradas moderadas na cadeia Firebase/uuid, Linux/Vercel e homologação pendentes |
| SEC-04 | Principal implementado | Implementado local: login exige Origin válido e JSON; publicação e E2E pendentes |
| SEC-05 | Parcial | Parcial: signup público verificado, limite compartilhado em produção via Supabase ou Redis, falhas/timeouts negados e recuperação por origem/destino; configuração da hospedagem, Auth nativo/CAPTCHA e homologação distribuída pendentes |
| PED-01 | Ainda não executado | Planejado; nenhuma correção aplicada |
| SEC-03 | Parcial | Parcial: novo fluxo PDF privado, autorização no download, visibilidade/publicação e avatares corrigidos; migração aplicada e verificada; três PDFs públicos antigos, consumidores históricos e homologação pendentes |
| QA-01 | Parcial | Parcial: runners e workflows corrigidos; CI limpa Node 24, emulador e homologação autenticada pendentes |
| ORG-02 | Principal implementado | Implementado: scripts revisados admitidos no versionamento e presentes na base limpa publicada; execução GitHub/Node 24 pendente |
| EAD-01 | Principal implementado | Implementado local e no Supabase para aulas/módulos: sessão e matrícula verificadas, tutor limitado à equipe do curso, rascunhos filtrados no conteúdo e SSR, colunas privadas e gravação do navegador recusadas; 52 verificações SQL aprovadas; publicação/homologação pendentes |
| AUTH-04 | Parcial | Parcial local: login trata falhas, token prevalece e recuperação possui nova tela; concorrência e E2E pendentes |
| SITE-01 | Principal implementado | Implementado local e RPC no Supabase: publicação comercial separada da abertura de inscrições, sem requisito EAD; publicação e E2E pendentes |
| SITE-02 | Parcial | Parcial: valor integral em centavos, limite de parcelas, Pix inicial e ementa persistidos e recuperados; demais campos comerciais e condições reais pendentes |
| SITE-03 | Principal implementado | Implementado local e RLS no Supabase: detalhe direto por ID/slug e ofertas fechadas publicadas; nova inscrição negada; publicação e E2E pendentes |
| PRIV-01 | Ainda não executado | Planejado; nenhuma correção aplicada |
| COM-01 | Ainda não executado | Planejado; nenhuma correção aplicada |
| SITE-04 | Parcial | Parcial: cache de preview separado, DTOs iniciais de cursos/posts completos e galeria sem cache vazio; demais modais e E2E pendentes |
| SITE-05 | Ainda não executado | Planejado; nenhuma correção aplicada |
| SITE-06 | Ainda não executado | Planejado; nenhuma correção aplicada |
| OPS-06 | Parcial | Parcial local: contato/WhatsApp dos componentes públicos servido por DTO do servidor e calendário usa a mesma configuração; valores oficiais, domínio/metadados, publicação e homologação pendentes |
| ENR-01 | Principal implementado | Implementado local e esquema no Supabase: cobrança persistida, comprovante privado e estado em análise; publicação e E2E pendentes |
| ENR-02 | Parcial | Parcial: aprovação Pix unificada e transacional, protegida no banco; operações não Pix e homologação pendentes |
| ENR-03 | Principal implementado | Implementado local e esquema no Supabase: TXID exclusivo, valor inicial servidor e Copia e Cola; configuração e teste bancário pendentes |
| ENR-04 | Principal implementado | Implementado local e RPC no Supabase: campos, aceite explícito, disponibilidade e estado final preservado; RLS versionada e E2E pendentes |
| ENR-05 | Parcial | Parcial: ficha usa user_id canônico e prepara Pix pendente; convites e reenvio de acesso implementados localmente; SMTP, entrega de e-mail e E2E pendentes |
| PIX-01 | Parcial | Parcial: conferência explícita de crédito, valor, data e referência única; exceções financeiras, parcelas seguintes e teste bancário pendentes |
| OPS-04 | Ainda não executado | Planejado; nenhuma correção aplicada |
| ORG-01 | Principal implementado | Implementado: .worktrees e .superpowers arquivados fora do projeto, gitlink removido e Git local/remoto com uma única base limpa verificados |
| ORG-03 | Parcial | Parcial: 199 arquivos retirados, incluindo 157 dos 205 candidatos; 48 conservados por consumidores ou edições recentes; build/tipos/rotas/testes preservados; revisão de contratos e assets dinâmicos pendente |
| ORG-04 | Ainda não executado | Planejado; nenhuma correção aplicada |
| SEO-01 | Ainda não executado | Planejado; nenhuma correção aplicada |
| SEC-06 | Parcial | Parcial: JSON-LD corrigido e testado localmente; nonce/CSP completo, publicação e homologação pendentes |
| EAD-02 | Ainda não executado | Planejado; nenhuma correção aplicada |
| EAD-03 | Ainda não executado | Planejado; nenhuma correção aplicada |
| EAD-04 | Ainda não executado | Planejado; nenhuma correção aplicada |
| EAD-05 | Ainda não executado | Planejado; nenhuma correção aplicada |
| STR-01 | Ainda não executado | Planejado; nenhuma correção aplicada |

[Backlog completo](2026-10-03-backlog-revisado.csv) · [Dados da contagem](2026-10-03-evidence/progress-block-13.json)
