# Quanto falta do relatório — após o bloco 11

Data: 04/10/2026. Base: os 45 itens do backlog revisado, com as entregas dos blocos 01–11. Esta contagem acompanha as correções da auditoria, não o percentual de construção de todo o aplicativo. Alterações paralelas posteriores nos recursos/layout ainda não foram classificadas nesta contagem nem validadas como conjunto; o estado atual do workspace exige uma validação consolidada. O snapshot do bloco 11 e seus arquivos próprios foram verificados separadamente.

Há **12 itens com a correção técnica principal implementada, 16 parcialmente resolvidos e 17 cuja correção ainda não foi executada**. Portanto, 33 itens ainda têm trabalho de implementação, decisão ou verificação pendente. Os implementados também precisam de publicação/homologação conforme suas dependências; não são 12 itens lançados em produção.

| Área | Total | Principal implementado | Parcial | Correção ainda não executada |
|---|---:|---:|---:|---:|
| Segurança, banco e operação | 18 | 7 | 9 | 2 |
| Site e cadastro | 10 | 2 | 3 | 5 |
| Inscrição e Pix | 6 | 3 | 3 | 0 |
| Organização, desempenho e SEO | 6 | 0 | 1 | 5 |
| EAD posterior | 4 | 0 | 0 | 4 |
| Stripe posterior | 1 | 0 | 0 | 1 |

Não atribuo uma porcentagem de prazo: corrigir um link, homologar pagamento e concluir avaliações/certificados têm esforços diferentes. EAD-01 e PED-01 foram agrupados na base de segurança porque podem estar expostos antes de lançar o EAD.

## O que já existe para o lançamento comercial

Cadastro com confirmação e recuperação de senha, autorização por perfil, catálogo independente do EAD, ficha protegida, cobrança Pix de matrícula/primeira parcela recuperável, comprovante privado e conferência administrativa transacional possuem implementação. Os seis itens específicos de inscrição/Pix têm entrega iniciada: três implementados tecnicamente e três parciais. A jornada real completa ainda não foi homologada.

Nesta rodada, a auditoria de dependências de produção caiu de 17 entradas (sete altas) para oito moderadas, sem altas/críticas; JSON-LD recebeu escape e testes de injeção. Os resultados e os limites constam no [bloco 11](2026-10-04-implementacao-bloco-11.md).

## O que falta antes de liberar site e inscrições

1. Comprovar revogação/exclusão das credenciais históricas e revisar o histórico completo. A integração atual não mostra o projeto antigo, mas isso não prova exclusão. Seguir o [roteiro de credenciais/Vercel](../operations/credenciais-e-vercel.md).
2. Identificar commit e configuração publicados na Vercel; criar/confirmar homologação com banco, Auth e Storage separados; executar CI Linux/Node 24, testar recuperação e publicar as correções verificadas.
3. Configurar e testar SMTP, confirmação, recuperação e primeiro acesso; concluir antiabuso/CAPTCHA e as verificações operacionais de sessões/administração.
4. Definir banco recebedor, dados Pix, valores reais de matrícula/primeira parcela e regras de exceção/reembolso. Testar recebimento bancário, rejeição, aprovação repetida e liberação somente após crédito conferido.
5. Corrigir domínio/canonical/sitemap, contato/WhatsApp, acessibilidade e resíduos do site; revisar carga horária, datas e conteúdo comercial. Validar oferta/emissor de pós-graduação, contrato, finalidades de dados e consentimento com os responsáveis.
6. Classificar os PDFs públicos históricos e concluir a migração/homologação dos materiais privados; completar revisão de ações privilegiadas e dos consumidores ainda pendentes.

Depois do release comercial: aposentadoria de código por lotes, desempenho/tipos e sanitização HTML no SSR. A exclusão integral dos 205 candidatos continua recusada pelo experimento: build/types passaram, mas 14 suítes regrediram. Não foi feita nova exclusão nesta rodada.

Para o EAD ainda faltam consolidar tentativas/avaliações no Supabase, proteger gabarito e notas, tornar progresso/conclusão/certificados autoritativos e idempotentes, e concluir as funcionalidades complementares do portal. A proteção de aulas/materiais já recebeu correções; isso não conclui o EAD. Stripe permanece posterior à decisão de automatizar pagamentos.

## Lista dos 45 itens

A coluna abaixo preserva o status do backlog, incluindo limitações. Uma entrega de roteiro ou inventário não conta como revogação, restauração ou lançamento.

| ID | Classificação | Status e pendências |
|---|---|---|
| SEC-01 | Ainda não executado | Planejado: roteiro de revogação entregue; exclusão/revogação não comprovada e varredura completa pendente |
| SEC-02 | Principal implementado | Implementado no Supabase; quatro RPCs restritas ao backend; permissões conferidas |
| OPS-05 | Parcial | Parcial: hospedagem identificada e roteiro operacional entregue; commit publicado, homologação separada, responsáveis e recuperação/backup completo pendentes |
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
| ORG-02 | Principal implementado | Implementado localmente; versionamento, clone limpo e execução GitHub pendentes |
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
| OPS-06 | Ainda não executado | Planejado; nenhuma correção aplicada |
| ENR-01 | Principal implementado | Implementado local e esquema no Supabase: cobrança persistida, comprovante privado e estado em análise; publicação e E2E pendentes |
| ENR-02 | Parcial | Parcial: aprovação Pix unificada e transacional, protegida no banco; operações não Pix e homologação pendentes |
| ENR-03 | Principal implementado | Implementado local e esquema no Supabase: TXID exclusivo, valor inicial servidor e Copia e Cola; configuração e teste bancário pendentes |
| ENR-04 | Principal implementado | Implementado local e RPC no Supabase: campos, aceite explícito, disponibilidade e estado final preservado; RLS versionada e E2E pendentes |
| ENR-05 | Parcial | Parcial: ficha usa user_id canônico e prepara Pix pendente; convites e reenvio de acesso implementados localmente; SMTP, entrega de e-mail e E2E pendentes |
| PIX-01 | Parcial | Parcial: conferência explícita de crédito, valor, data e referência única; exceções financeiras, parcelas seguintes e teste bancário pendentes |
| OPS-04 | Ainda não executado | Planejado; nenhuma correção aplicada |
| ORG-01 | Ainda não executado | Planejado; nenhuma correção aplicada |
| ORG-03 | Ainda não executado | Planejado; nenhuma correção aplicada |
| ORG-04 | Ainda não executado | Planejado; nenhuma correção aplicada |
| SEO-01 | Ainda não executado | Planejado; nenhuma correção aplicada |
| SEC-06 | Parcial | Parcial: JSON-LD corrigido e testado localmente; nonce/CSP completo, publicação e homologação pendentes |
| EAD-02 | Ainda não executado | Planejado; nenhuma correção aplicada |
| EAD-03 | Ainda não executado | Planejado; nenhuma correção aplicada |
| EAD-04 | Ainda não executado | Planejado; nenhuma correção aplicada |
| EAD-05 | Ainda não executado | Planejado; nenhuma correção aplicada |
| STR-01 | Ainda não executado | Planejado; nenhuma correção aplicada |

[Backlog completo](2026-10-03-backlog-revisado.csv) · [Dados da contagem](2026-10-03-evidence/progress-block-11.json)
