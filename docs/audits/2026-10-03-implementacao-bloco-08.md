# Implementação do bloco 08 — fichas de inscrição e proteção compartilhada

Data: 03/10/2026, horário de Manaus. Escopo: proteger os fluxos do lançamento comercial e manter as correções de Pix/administração dos blocos anteriores.

## Correções entregues

A consulta do banco real encontrou quatro políticas antigas de applications. Elas permitiam ao próprio aluno inserir e atualizar a ficha diretamente pelo navegador, incluindo campos de status, sem passar pelo contrato de validação do servidor. Havia também concessões de INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES e TRIGGER para papéis públicos. O bloco versiona a política de leitura por dono/administrador ativo e concentra gravações nas RPCs e ações protegidas existentes.

Visitante perde as permissões da tabela. Usuário autenticado recebe somente SELECT, sujeito a perfil ativo e ficha própria ou papel administrativo. Tutor global não recebe leitura de terceiros. A política restritiva de leitura impede que uma política permissiva legada reabra acesso. Os grants de gravação do navegador são retirados, inclusive para administrador; o painel usa as ações de servidor implementadas no bloco 06. O backend mantém as permissões necessárias à ficha, preparação/conferência Pix, contato e exclusão permitida.

O helper de limite de requisições ganhou um backend compartilhado para produção. Sem Redis configurado, usa uma função Supabase com incremento atômico por UPSERT. A janela fixa começa na primeira tentativa, não é prolongada por reenvios e reinicia após expiração. O contador é limitado para evitar crescimento do número de tentativas negadas. A limpeza usa índice de expiração, lotes de até 50 registros antigos e SKIP LOCKED.

Com Upstash configurado, continua usando seu contador compartilhado com janela deslizante. O SDK instalado tinha timeout que autorizava uma requisição após demora; esse comportamento foi desabilitado e resultados com razão timeout são recusados. Erro/demora não troca automaticamente de contador nem passa para memória local. A espera da aplicação é limitada a três segundos. Sincronização de sessão, ficha, upload de material e comprovante respondem indisponibilidade temporária sem criar cookie ou aceitar arquivo. O contador em memória fica para desenvolvimento/teste sem Redis.

Chaves de contador usam HMAC SHA-256 com segredo do servidor, operação, identificador e configuração. IP/e-mail/token não são gravados em texto na tabela nem enviados como identificador bruto ao Redis. A tabela e a função têm acesso somente pelo backend, com RLS e SECURITY INVOKER. A rotação do segredo muda a associação das janelas e precisa ser coordenada entre instâncias.

A origem por IP usa headers da plataforma quando VERCEL=1. Outros provedores precisam indicar um header sobrescrito por um proxy confiável. Header inválido/ausente vira a origem conservadora unknown, sem aceitar arbitrariamente o valor fornecido pelo visitante. A hospedagem ainda não foi informada; essa configuração precisa ser conferida antes da publicação.

A recuperação de senha da interface passou para uma ação de servidor que valida/normaliza e-mail, limita origem e destino e usa o redirecionamento configurado no servidor. Quando o destino está limitado, o retorno permanece genérico e não envia novamente nem informa se existe conta. Erros de SMTP/configuração são tratados como falha. O cadastro ganhou limites de comprimento para nome, e-mail, senha e curso. Nenhum e-mail real foi enviado durante a validação.

## Verificação

- 25 verificações PostgreSQL isoladas cobriram leitura própria/administrativa, conta desativada, tutor, visitante, bloqueio de gravação, policies legadas, permissões do contador, janela, limites e limpeza.
- Outras 30 verificações SQL confirmaram a compatibilidade com os blocos 04/06: ficha, contato, Pix pendente, confirmação administrativa, concessão de acesso, último administrador e preservação de histórico.
- 435 testes Jest passaram em 102 suítes; sete testes e uma suíte continuam ignorados. Os novos testes incluem independência de instâncias do helper com contador compartilhado simulado, falhas/timeouts, privacidade das chaves, proxy, recuperação e ausência de cookie/upload quando a proteção falha.
- TypeScript e lint direcionado aos 15 arquivos alterados passaram.
- Build final passou (exit 0, 138 segundos). Comparação dos 1301 arquivos de código/conteúdo/testes com o snapshot compilado não encontrou diferenças.

Os testes SQL com Promise.all são enfileirados numa conexão PGlite; não provam uma corrida entre conexões independentes em produção. Essa homologação permanece necessária. SDKs e e-mails foram simulados; os testes não demonstram entrega SMTP real.

## Aplicação no Supabase

Migração 20261004022802_block_08_applications_shared_rate_limit.sql aplicada e registrada no projeto atual. A conferência real confirmou duas políticas SELECT para applications, leitura autenticada condicionada, nenhuma gravação do navegador, RLS nas duas tabelas e função SECURITY INVOKER executável somente pelo backend. O teste com três chamadas do contador sob service_role aprovou duas e negou a terceira; a transação foi desfeita. Permanecem duas fichas e zero contadores, pedidos/eventos Pix ou eventos administrativos; um administrador ativo e inactive_profiles_with_active_enrollment = 0. Os mesmos 14 avisos anteriores do advisor permanecem, sem novos avisos no conjunto verificado.

A consulta de catálogo/agregados está em supabase/tests/block_08_verification.sql. O ensaio da função compartilhada usa um hash fictício em transação com ROLLBACK, sem consumir limite de alunos nem conservar registro de teste. Alterações de grants/policies não modificam respostas de fichas, contas, matrículas ou pagamentos.

Evidência sanitizada: [implementacao-bloco-08.json](2026-10-03-evidence/implementacao-bloco-08.json). Scripts e logs privados ficam em C:\Users\aless\.codex\visualizations\2026\10\03\01a10335-acef-7420-876c-e473e31d8446\validation-block-08. O laboratório de build usa Next 15.5.25 com WASM, credenciais fictícias e Supabase local somente de leitura.

## Operação e próximos passos

O frontend permanece local. Um painel antigo que grave fichas diretamente pelo navegador terá suas gravações bloqueadas após a migração; publicar a versão corrigida para operar as ações de servidor. A nova proteção de requisições depende de publicar este código. Instruções: [limites de requisições do lançamento](../operations/rate-limits.md).

Confirmar hospedagem/URL de homologação, proxy de IP, segredo consistente e backend escolhido. Testar duas instâncias com o mesmo identificador, falhas de rede e retomada dentro da janela. Testar duas redes de visitantes legítimos para não agrupar todos na origem unknown.

As APIs públicas de Supabase Auth continuam sujeitas às proteções nativas do provedor, além dos limites das ações do aplicativo. Conferir rate limits de Auth, confirmação, SMTP e eventual CAPTCHA com integração de token antes de ativá-lo. Login por senha feito diretamente no Supabase não passa por SESSION_SYNC, que limita a troca de um token verificado pelo cookie. SEC-05 permanece parcial até conferir esse ambiente e executar homologação distribuída; não se declarou a proteção antiabuso inteira concluída.

DATA-02 tem políticas/grants versionados e testados por papel, além das ações protegidas. Falta homologar o painel e a inscrição na versão publicada. Nada deste bloco libera o EAD completo. Os 205 candidatos a remoção continuam preservados. Segredos históricos, CI nativa, restauração, dependências, dados comerciais/contratuais e conciliação bancária permanecem no plano.

As escolhas seguem a documentação de [RLS e grants Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security), [funções e permissões Supabase](https://supabase.com/docs/guides/database/functions), [timeout do Upstash](https://upstash.com/docs/redis/sdks/ratelimit-ts/features) e [headers Vercel](https://vercel.com/docs/headers/request-headers). O índice changelog.md retornou erro na consulta; as páginas específicas e o SDK instalado foram conferidos.
