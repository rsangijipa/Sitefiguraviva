# Quanto falta do relatório — após o bloco 17

Data: 04/10/2026. Base: 45 itens; a classificação mede a correção principal, não prazo, esforço ou aprovação de lançamento.

**16 principais implementados, 20 parciais e 9 ainda não executados. 29 itens permanecem com trabalho, decisão ou verificação pendente.** Mesmo os implementados exigem homologação adequada.

Dos 22 parciais anteriores, todos foram revisados nesta rodada: SITE-02 e SITE-04 passam a implementados. Os 20 restantes têm sua entrega e pendência individual em [Bloco 17](2026-10-04-implementacao-bloco-17.md). Sessões/RLS têm migração pronta, testada com rollback, mas ainda não aplicada; aguardam autorização específica. Banco Pix, SMTP, ambiente separado e revogação no provedor dependem do proprietário.

| Área | Total | Implementados | Parciais | Não executados |
|---|---:|---:|---:|---:|
| Segurança, banco e operação | 18 | 7 | 10 | 1 |
| Site e cadastro | 10 | 4 | 4 | 2 |
| Inscrição e Pix | 6 | 3 | 3 | 0 |
| Organização, desempenho e SEO | 6 | 2 | 2 | 2 |
| EAD posterior | 4 | 0 | 0 | 4 |
| Stripe posterior | 1 | 0 | 1 | 0 |

Prioridade: sessões/SMTP/antiabuso e credenciais; Pix e jornada comercial real; CI/deployment/homologação/recuperação; PDFs/dependências/CSP; EAD e Stripe posteriores.

## Os 45 itens

| ID | Classificação | Entrega e pendências |
|---|---|---|
| SEC-01 | Parcial | Parcial: Scanner redigido do release e histórico alcançável por HEAD, com bloqueio na CI; nenhum achado no escopo verificado. Pendente: Proprietário comprovar revogação/exclusão no provedor; scanner não cobre forks, objetos órfãos, caches ou chaves desconhecidas. |
| SEC-02 | Principal implementado | Implementado no Supabase; quatro RPCs restritas ao backend; permissões conferidas |
| OPS-05 | Parcial | Parcial: Fonte preservada em cópia privada sem ambientes; release será rastreável pelo commit publicado. Pendente: Homologação separada, titularidade e ensaio de recuperação de banco/Storage. |
| AUTH-01 | Principal implementado | Implementado local: promoção por e-mail removida e cadastro público exige confirmação; publicação, SMTP, CAPTCHA e E2E pendentes |
| DATA-01 | Principal implementado | Implementado no Supabase: dois índices compatíveis com onConflict; jornada completa em homologação pendente |
| DATA-02 | Principal implementado | Implementado local e no Supabase: ações protegidas, políticas de leitura por dono/admin ativo versionadas e gravação do navegador revogada; teste por papel aprovado; publicação e homologação pendentes |
| AUTH-02 | Parcial | Parcial: Migração preparada para invalidar sessões anteriores a mudanças de cargo/bloqueio; testes de sessão e RLS passaram com rollback. Verificação no servidor protegida por flag. Pendente: Autorização para aplicar no Supabase real e habilitar AUTH_SESSION_CHECK_MODE=enforce; migração NÃO aplicada. |
| AUTH-03 | Parcial | Parcial: Removida autenticação Firebase alternativa; leitura privada de certificado exige dono/admin; avaliações exigem publicação e acesso canônico ao curso antes de gravação. Inventário de 129 ações exportadas. Pendente: Homologação autenticada de ponta a ponta e manifest compilado; inventário estático não comprova sozinho autorização completa. |
| OPS-01 | Parcial | Parcial: Mantidas proteções de concorrência, falhas Auth e configuração CAS dos blocos anteriores; sincronização de sessão agora tem timeout. Pendente: Exercitar falhas e operações administrativas concorrentes no ambiente separado. |
| OPS-02 | Parcial | Parcial: Lint, scripts, Jest, tipos e build são executados sem .env real; CI recebe scanner e auditoria de produção. Pendente: Confirmar execução Linux/Node 24 no GitHub e recuperação operacional. |
| OPS-03 | Parcial | Parcial: uuid atualizado para 11.1.1; sanitizador SSR incorporado; auditoria de produção retorna zero vulnerabilidades. Pendente: Auditoria completa ainda registra 36 entradas altas de ferramentas de desenvolvimento, sem correção automática disponível; revisar advisories e atualizações compatíveis. |
| SEC-04 | Principal implementado | Implementado local: login exige Origin e JSON, logout exige mesma origem e remove cookie de impersonação; publicação e E2E pendentes |
| SEC-05 | Parcial | Parcial: Cadastro ganha limite compartilhado por destino além do limite por IP; mantém negação em falhas do limitador. Pendente: CAPTCHA/Auth nativo e teste distribuído reais. |
| PED-01 | Ainda não executado | Planejado; nenhuma correção aplicada |
| SEC-03 | Parcial | Parcial: Consulta confirma três PDFs históricos ainda públicos. Pendente: Responsável classificar os documentos e consumidores antes de mover/revogar acesso; nenhuma migração cega dos arquivos. |
| QA-01 | Parcial | Parcial: Testes negativos para sessão, avaliação sem matrícula, crédito Pix futuro e HTML malicioso; navegador verifica landmarks e nonce. Pendente: E2E autenticado com papéis, matrícula, comprovante e e-mail em homologação; fixtures não substituem esse teste. |
| ORG-02 | Principal implementado | Implementado: scripts revisados admitidos no versionamento e presentes na base limpa publicada; execução GitHub/Node 24 pendente |
| EAD-01 | Principal implementado | Implementado local e no Supabase para aulas/módulos: sessão e matrícula verificadas, tutor limitado à equipe do curso, rascunhos filtrados no conteúdo e SSR, colunas privadas e gravação do navegador recusadas; 52 verificações SQL aprovadas; publicação/homologação pendentes |
| AUTH-04 | Parcial | Parcial: Autenticação canônica e sincronização limitada por timeout, preservando login/logout e recuperação já protegidos. Pendente: Configurar SMTP e confirmar entrega, recuperação e confirmação em endereços reais. |
| SITE-01 | Principal implementado | Implementado local e RPC no Supabase: publicação comercial separada da abertura de inscrições, sem requisito EAD; publicação e E2E pendentes |
| SITE-02 | Principal implementado | Implementado principal: Criar/editar/mapear preserva frequência, data, horário, local, formato, vídeo introdutório, ementa e carga horária inteira em minutos; detalhes existentes são preservados. Removida duração fictícia padrão. Pendente: Correção principal implementada; revisar valores comerciais reais e homologar oferta/inscrição. |
| SITE-03 | Principal implementado | Implementado local e RLS no Supabase: detalhe direto por ID/slug e ofertas fechadas publicadas; nova inscrição negada; publicação e E2E pendentes |
| PRIV-01 | Parcial | Parcial: Mantido consentimento revogável, cookies e sincronização entre abas implementados anteriormente. Pendente: Configurar identificador real e verificar rede após consentimento/revogação no domínio publicado. |
| COM-01 | Ainda não executado | Planejado; nenhuma correção aplicada |
| SITE-04 | Principal implementado | Implementado principal: Home mantém preview isolado; modais e calendário consultam lista completa sob demanda. Testes de cache comprovam cinco itens na lista e três no preview. Pendente: Correção principal implementada; homologação visual com catálogo real. |
| SITE-05 | Parcial | Parcial: Rotas comerciais principais têm um landmark main; modais ganham rótulos, foco inicial/fallback e correção do Tab vindo de fora do diálogo. Tenant fixo elimina derivação por Host. Pendente: Revisão completa de teclado, leitor de tela, mobile e recursos EAD; não se declara conformidade WCAG completa. |
| SITE-06 | Ainda não executado | Planejado; nenhuma correção aplicada |
| OPS-06 | Parcial | Parcial: Preservado contato@figuraviva.com.br e salvamento autorizado unificado. Pendente: Confirmar caixa postal, telefone/WhatsApp e dados institucionais reais. |
| ENR-01 | Principal implementado | Implementado local e esquema no Supabase: cobrança persistida, comprovante privado e estado em análise; publicação e E2E pendentes |
| ENR-02 | Parcial | Parcial: Aprovação comum bloqueia métodos diferentes de manual/free também na página de aprovações; Pix continua no fluxo transacional próprio. Pendente: Homologar repetição/concorrência, rejeição e exceções financeiras com responsáveis. |
| ENR-03 | Principal implementado | Implementado local e esquema no Supabase: TXID exclusivo, valor inicial servidor e Copia e Cola; configuração e teste bancário pendentes |
| ENR-04 | Principal implementado | Implementado local e RPC no Supabase: campos, aceite explícito, disponibilidade e estado final preservado; RLS versionada e E2E pendentes |
| ENR-05 | Parcial | Parcial: Mantidos user_id canônico, convite, reenvio de acesso e criação da cobrança pendente. Pendente: SMTP e jornada real do primeiro acesso do aluno. |
| PIX-01 | Parcial | Parcial: Data do crédito não pode estar no futuro além da tolerância de um minuto; conferência bancária continua obrigatória. Pendente: Informar banco/chave/recebedor, homologar QR/Copia e Cola e decidir reembolso, pagamento parcial/excedente e parcelas seguintes. Não foram inventadas regras financeiras. |
| OPS-04 | Principal implementado | Implementado local: editores Google e contato usam merge autorizado com controle de updated_at e repetição limitada; descartar restaura valores salvos, falha de leitura bloqueia gravação e teste simulado removido; publicação e homologação pendentes |
| ORG-01 | Principal implementado | Implementado: .worktrees e .superpowers arquivados fora do projeto, gitlink removido e Git local/remoto com uma única base limpa verificados |
| ORG-03 | Parcial | Parcial: Reavaliados os 205 candidatos com entradas Next da raiz: 157 ausentes, 48 preservados; nenhum dos 48 alcançável pelo grafo estático considerado. Pendente: Revisão de contratos, testes, assets e consumidores dinâmicos antes de outras exclusões. Ausência de import estático não prova inutilidade. |
| ORG-04 | Ainda não executado | Planejado; nenhuma correção aplicada |
| SEO-01 | Ainda não executado | Planejado; nenhuma correção aplicada |
| SEC-06 | Parcial | Parcial: Artigos recebem HTML sanitizado no servidor; CSP com nonce por resposta em /auth, /admin, /portal e /inscricao; object/base/form/frame restritos. Pendente: CSP pública ainda permite inline para integrações; homologar analytics, mídia, Sentry e todas as rotas protegidas. |
| EAD-02 | Ainda não executado | Planejado; nenhuma correção aplicada |
| EAD-03 | Ainda não executado | Planejado; nenhuma correção aplicada |
| EAD-04 | Ainda não executado | Planejado; nenhuma correção aplicada |
| EAD-05 | Ainda não executado | Planejado; nenhuma correção aplicada |
| STR-01 | Parcial | Parcial: Mantida contenção: Stripe desativado por padrão e respostas 503; produção e eventos live recusados. Pendente: Integração financeira canônica posterior ao lançamento Pix manual, conforme prioridade definida. |

[Backlog completo](2026-10-03-backlog-revisado.csv) · [Contagem](2026-10-03-evidence/progress-block-17.json) · [Validação](2026-10-03-evidence/validation-block-17.json)
