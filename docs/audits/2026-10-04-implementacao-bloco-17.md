# Bloco 17 — rodada consolidada dos 22 parciais

Esta rodada revisa os 22 itens parciais do bloco 16, priorizando segurança, inscrição e Pix manual. Correções dos blocos 14–16 também integram o commit desta consolidação. Duas correções principais passam a implementadas: SITE-02 e SITE-04. Os outros 20 continuam parciais, com os motivos específicos abaixo. Não se declara conclusão de configurações externas, homologação ou integração financeira ainda inexistente.

## Implementação e pendências por item

| ID | Entrega/verificação nesta rodada | O que ainda falta |
|---|---|---|
| SEC-01 | Scanner redigido do release e histórico alcançável por HEAD, com bloqueio na CI; nenhum achado no escopo verificado. | Proprietário comprovar revogação/exclusão no provedor; scanner não cobre forks, objetos órfãos, caches ou chaves desconhecidas. |
| OPS-05 | Fonte preservada em cópia privada sem ambientes; release será rastreável pelo commit publicado. | Homologação separada, titularidade e ensaio de recuperação de banco/Storage. |
| AUTH-02 | Migração preparada para invalidar sessões anteriores a mudanças de cargo/bloqueio; testes de sessão e RLS passaram com rollback. Verificação no servidor protegida por flag. | Autorização para aplicar no Supabase real e habilitar AUTH_SESSION_CHECK_MODE=enforce; migração NÃO aplicada. |
| AUTH-03 | Removida autenticação Firebase alternativa; leitura privada de certificado exige dono/admin; avaliações exigem publicação e acesso canônico ao curso antes de gravação. Inventário de 129 ações exportadas. | Homologação autenticada de ponta a ponta e manifest compilado; inventário estático não comprova sozinho autorização completa. |
| OPS-01 | Mantidas proteções de concorrência, falhas Auth e configuração CAS dos blocos anteriores; sincronização de sessão agora tem timeout. | Exercitar falhas e operações administrativas concorrentes no ambiente separado. |
| OPS-02 | Lint, scripts, Jest, tipos e build são executados sem .env real; CI recebe scanner e auditoria de produção. | Confirmar execução Linux/Node 24 no GitHub e recuperação operacional. |
| OPS-03 | uuid atualizado para 11.1.1; sanitizador SSR incorporado; auditoria de produção retorna zero vulnerabilidades. | Auditoria completa ainda registra 36 entradas altas de ferramentas de desenvolvimento, sem correção automática disponível; revisar advisories e atualizações compatíveis. |
| SEC-05 | Cadastro ganha limite compartilhado por destino além do limite por IP; mantém negação em falhas do limitador. | CAPTCHA/Auth nativo e teste distribuído reais. |
| SEC-03 | Consulta confirma três PDFs históricos ainda públicos. | Responsável classificar os documentos e consumidores antes de mover/revogar acesso; nenhuma migração cega dos arquivos. |
| QA-01 | Testes negativos para sessão, avaliação sem matrícula, crédito Pix futuro e HTML malicioso; navegador verifica landmarks e nonce. | E2E autenticado com papéis, matrícula, comprovante e e-mail em homologação; fixtures não substituem esse teste. |
| AUTH-04 | Autenticação canônica e sincronização limitada por timeout, preservando login/logout e recuperação já protegidos. | Configurar SMTP e confirmar entrega, recuperação e confirmação em endereços reais. |
| SITE-02 | Criar/editar/mapear preserva frequência, data, horário, local, formato, vídeo introdutório, ementa e carga horária inteira em minutos; detalhes existentes são preservados. Removida duração fictícia padrão. | Correção principal implementada; revisar valores comerciais reais e homologar oferta/inscrição. |
| PRIV-01 | Mantido consentimento revogável, cookies e sincronização entre abas implementados anteriormente. | Configurar identificador real e verificar rede após consentimento/revogação no domínio publicado. |
| SITE-04 | Home mantém preview isolado; modais e calendário consultam lista completa sob demanda. Testes de cache comprovam cinco itens na lista e três no preview. | Correção principal implementada; homologação visual com catálogo real. |
| SITE-05 | Rotas comerciais principais têm um landmark main; modais ganham rótulos, foco inicial/fallback e correção do Tab vindo de fora do diálogo. Tenant fixo elimina derivação por Host. | Revisão completa de teclado, leitor de tela, mobile e recursos EAD; não se declara conformidade WCAG completa. |
| OPS-06 | Preservado contato@figuraviva.com.br e salvamento autorizado unificado. | Confirmar caixa postal, telefone/WhatsApp e dados institucionais reais. |
| ENR-02 | Aprovação comum bloqueia métodos diferentes de manual/free também na página de aprovações; Pix continua no fluxo transacional próprio. | Homologar repetição/concorrência, rejeição e exceções financeiras com responsáveis. |
| ENR-05 | Mantidos user_id canônico, convite, reenvio de acesso e criação da cobrança pendente. | SMTP e jornada real do primeiro acesso do aluno. |
| PIX-01 | Data do crédito não pode estar no futuro além da tolerância de um minuto; conferência bancária continua obrigatória. | Informar banco/chave/recebedor, homologar QR/Copia e Cola e decidir reembolso, pagamento parcial/excedente e parcelas seguintes. Não foram inventadas regras financeiras. |
| ORG-03 | Reavaliados os 205 candidatos com entradas Next da raiz: 157 ausentes, 48 preservados; nenhum dos 48 alcançável pelo grafo estático considerado. | Revisão de contratos, testes, assets e consumidores dinâmicos antes de outras exclusões. Ausência de import estático não prova inutilidade. |
| SEC-06 | Artigos recebem HTML sanitizado no servidor; CSP com nonce por resposta em /auth, /admin, /portal e /inscricao; object/base/form/frame restritos. | CSP pública ainda permite inline para integrações; homologar analytics, mídia, Sentry e todas as rotas protegidas. |
| STR-01 | Mantida contenção: Stripe desativado por padrão e respostas 503; produção e eventos live recusados. | Integração financeira canônica posterior ao lançamento Pix manual, conforme prioridade definida. |

## Supabase e ativação de sessões

O arquivo `supabase/migrations/20261004163454_block_17_session_revocation.sql` é uma proposta pronta para revisão. Acrescenta registro de revogação, gatilho em profiles, RPC de serviço e política restritiva de sessão nas tabelas públicas com RLS e em storage.objects. Não altera/apaga sessões do esquema gerenciado Auth. A política mantém as políticas de propriedade/publicação existentes e restringe o papel authenticated; visitantes públicos não recebem essa condição.

Seis verificações de ciclo de sessão/privilégios e três leituras sob papel authenticated passaram dentro de transações revertidas. A consulta posterior confirmou que auth_session_revocations não existe no projeto real. O teste de RLS versionado contém BEGIN/ROLLBACK e deve ser executado somente em homologação com a migração instalada na mesma transação. Não executar esse arquivo como instalação de produção.

A revisão automática rejeitou a aplicação persistente porque a política alcança muitas tabelas e Storage e pode negar operações legítimas com tokens sem session_id válido. A autorização específica foi solicitada; até sua resposta, a migração permanece pendente e a flag mantém o modo profile. Depois da aplicação autorizada, conferir permissões, advisors, JWT real e fluxo dos três papéis antes de habilitar enforce no ambiente correspondente.

## Verificação

Os resultados finais estão em [validation-block-17.json](2026-10-03-evidence/validation-block-17.json). A primeira tentativa já compilou, mas encontrou incompatibilidade ESM do parser no Jest. A configuração transpilePackages corrigiu a incompatibilidade sem substituir o sanitizador por mock. O teste utiliza o parser real e verifica script, SVG, iframe, eventos, CSS e esquemas perigosos.

A primeira verificação de navegador encontrou o inicializador inline do tema bloqueado. O tema inicial passa a atributos HTML produzidos no servidor, removendo o script; a CSP não foi afrouxada. O teste de navegador distingue apenas as conexões da API fake em porta loopback, deliberadamente fora da política de produção, das violações de script e demais conexões. Também verifica nonce diferente entre duas respostas.

Após o primeiro push, a Vercel confirmou sucesso em 3bab249. A CI Linux/Node 24 aprovou lint, scripts, unitários, tipos, build e as regras do Firestore, mas o novo cenário de nonce falhou ao exigir o nonce também em scripts do DOM após hidratação. A verificação foi corrigida para inspecionar os scripts presentes no HTML da resposta original: scripts posteriormente inseridos por código confiável são autorizados por strict-dynamic. A checagem de violações e de hidratação permanece. Os sete cenários de navegador foram repetidos localmente e passaram; a correção do teste recebe commit próprio e nova CI. Nenhuma política CSP foi afrouxada por causa dessa falha.

Auditoria npm de produção: 11 entradas moderadas antes da rodada e zero depois. Auditoria incluindo desenvolvimento: 36 altas; não representa 36 vulnerabilidades de produção. O scanner relata somente caminho/categoria/revisão, sem imprimir valores. Linux, Vercel, Supabase autenticado e banco real são verificações independentes e não recebem aprovação pelo sucesso da build local.

As 36 entradas de desenvolvimento são a cadeia transitiva do advisory [GHSA-vfj7-8cjw-p6xm, braces](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), que informa versões até 3.0.3 afetadas e nenhuma versão corrigida publicada. Não são 36 falhas independentes. A exposição é inferida pelos consumidores de ferramentas de glob/build/teste; padrões de usuários não devem ser encaminhados a essas ferramentas. Atualização incompatível ou patch local não foi apresentado como correção validada.

O cadastro central de mediadores continua apenas como lembrete, conforme instrução do proprietário. Não foi implementado nesta rodada.

## Ordem de conclusão para lançamento

1. Autorizar e homologar proteção de sessões; configurar SMTP/CAPTCHA e confirmar revogação das credenciais históricas.
2. Identificar banco recebedor, preencher dados Pix e valores de matrícula/primeira parcela; executar a jornada real com comprovante, aprovação e primeiro acesso.
3. Confirmar CI/deployment, domínio, conteúdo comercial e acessibilidade; separar homologação e ensaiar restauração de banco/arquivos.
4. Classificar PDFs, revisar ferramentas de desenvolvimento e contratos legados; finalizar CSP pública/analytics reais.
5. Concluir avaliações, tentativas, gabarito, progresso e demais EAD. Stripe fica para a decisão posterior de automatizar pagamentos.
