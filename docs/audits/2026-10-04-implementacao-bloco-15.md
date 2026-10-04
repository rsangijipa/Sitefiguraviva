# Bloco 15 — contenção de pagamentos, sessão e privacidade

Data: 04/10/2026. Implementação local sobre 5c5cceb, preservando as alterações do bloco 14. Nenhum commit, push, deployment, cobrança, alteração de credencial ou escrita no Supabase foi executado neste bloco.

## Prioridades tratadas

| Frente | Comportamento corrigido | Backlog |
|---|---|---|
| Pagamento legado | Stripe exige opt-in de teste e chave test; Production da Vercel, chaves live e eventos live são recusados | STR-01, contenção P1 |
| Identidade e sessão | Cookie de login e logout usa fila única; respostas antigas não vencem trocas posteriores e falhas invalidam o cache | AUTH-04 |
| Perfil e operação | Estado de conta antiga não reaparece; atualização exige linha persistida; falhas de logout/login administrativo aparecem ao usuário | AUTH-04, OPS-01 |
| Administração legada | Backup de sessão só restaura administrador ativo e usa o prazo restante do token, com SameSite=Lax | AUTH-03 |
| Privacidade | GA depende do aceite; retirada desativa a propriedade imediatamente e remove cookies GA acessíveis | PRIV-01 |

## Pagamentos

Checkout, portal de cobrança, webhook e o próprio acesso ao SDK Stripe ficam desligados por padrão. Rotas respondem 503 antes de validar identidade ou fazer consultas/escritas financeiras. O lançamento permanece com Pix manual. Um evento live também é recusado antes de qualquer transação.

STRIPE_BILLING_MODE=test serve apenas para testes com chave sk_test_ em ambiente isolado fora de Vercel Production. Não habilita cobrança real. A condição comercial no checkout foi alinhada: o curso precisa estar publicado **e** com inscrição aberta. A integração Stripe ainda mistura fontes Supabase/Firestore e precisa de implementação própria posterior; este bloco implementa sua contenção.

Não se configurou recebedor Pix nem se testou crédito bancário: o banco ainda não foi informado.

## Sessão, perfil e administração

- Login, refresh de token e logout entram na mesma fila de gravação de cookie. Chamadas concorrentes para o mesmo token compartilham a solicitação pendente, sem informar sucesso antes da resposta. Falha de rede/HTTP invalida o cache, pois não comprova que o cookie permaneceu intacto.
- Cada consulta de perfil pertence a uma versão da sessão. Resultado da conta anterior, consulta iniciada antes do logout ou inicialização tardia não substituem a identidade atual.
- Consultas Supabase de perfil ocorrem fora do callback onAuthStateChange, e aguardam o bootstrap do perfil pelo servidor. Eventos de refresh da mesma identidade preservam a interface enquanto ela é reconferida.
- Inicialização com erro termina o carregamento e não concede papel. Metadados editáveis não definem tenant/papel; a conta usa o tenant atual da plataforma.
- Perfil é salvo na fonte canônica profiles, com conferência de linha atualizada. Removida a segunda gravação de metadados Auth que podia produzir estados parciais e sucesso falso. Nome/avatar continuam lidos do perfil canônico.
- Logout tenta limpar o cookie mesmo quando Auth falha. Só navega após confirmação das etapas; menus e troca de conta mostram o erro. Isso não revoga, por si só, todos os access tokens do provedor.
- Login e logout comparam Origin com o Host HTTP e o protocolo do pedido. Isto cobre a reconstrução de URL interna pelo Next, sem confiar em x-forwarded-host fornecido pelo cliente. Logout remove também admin_session_backup. Restauração legada recusa aluno/admin desativado e não prolonga cookie além do token.
- Login administrativo deixa de informar sucesso se sua conferência adicional de perfil falhar.

## Consentimento

O ID do GA aceita somente o formato G- seguido de letras/números, eliminando sua interpolação como JavaScript. O carregador só é renderizado após consentimento pronto e granted. Comandos gtag são configurados sem script inline próprio, com armazenamento publicitário, dados publicitários e personalização negados.

Recusa e retirada acionam ga-disable antes de propagar a mudança de interface. Cookies _ga e _ga_* acessíveis são expirados, incluindo caminhos e domínios pais aplicáveis; cookies necessários permanecem. Mudança da escolha em outra aba também desativa a medição. Se a gravação da preferência falhar, a recusa permanece em memória durante a página atual; sua persistência em visitas futuras depende das permissões de armazenamento do navegador. Não há garantia retroativa sobre eventos já enviados ou requisições iniciadas antes da retirada.

Os testes usam carregador simulado, sem propriedade GA real e sem enviar dados ao Google. Captura de rede com GA configurado em homologação permanece necessária para encerrar PRIV-01.

## Verificação do Supabase

Consultas somente de leitura confirmaram permissões de atualização/leitura do próprio perfil, políticas profiles_read_own_or_staff e profiles_update_own_basic, e triggers de proteção de privilégios, histórico e último administrador.

Advisors retornaram dois achados informativos de RLS sem políticas em tabelas internas, um aviso de search_path em set_updated_at, seis avisos SECURITY DEFINER para anon, os mesmos seis para authenticated, e proteção de senhas vazadas desativada. As quatro funções auxiliares de papel/acesso consultadas usam auth.uid(), perfil ativo e search_path fixo. Os avisos de trigger e configuração exigem tratamento específico; não se revogaram funções de política indiscriminadamente nem se alterou o banco neste bloco.

## Validação

Código validado em cópia isolada sem arquivos de ambiente reais. A primeira tentativa revelou um tipo incorreto no wrapper fetch e três testes de rota com ambiente jsdom; corrigidos sem reduzir os critérios. A versão intermediária passou em 571 testes e build. A versão final acrescenta invalidação do cache após resposta perdida e usa o formato de argumentos documentado para gtag; sua validação está registrada na evidência deste bloco.

O primeiro teste HTTP real encontrou 403 indevido na saída da mesma origem: request.url tinha hostname interno do Next diferente do endereço do navegador. O comparador foi compartilhado entre login e logout e passou a usar o Host de destino, mantendo a rejeição de origem externa, ausente, Host malformado e spoof de x-forwarded-host. A revalidação final inclui esta correção.

O CSV do bloco 14 tinha dois registros malformados por ponto e vírgula dentro de campos citados. SITE-05 e OPS-06 foram reconstruídos a partir da base Git, preservando os critérios de conclusão, e reexportados com leitura correta de campos citados. A conferência mantém 45 itens com 11 campos por linha.

Resultado final: **581 testes do aplicativo, 30 de scripts, lint, tipos e build aprovados**. Sete testes seguem ignorados pela configuração existente. A build gerou 45 páginas estáticas. O navegador passou nos cinco cenários públicos (incluindo 360 px); seis verificações HTTP confirmaram saída legítima, bloqueio de origem indevida/ausente e Stripe desligado. Não foi executada jornada autenticada real. [Evidência final](2026-10-03-evidence/validation-block-15.json).

## O que continua necessário para lançar

Homologação autenticada separada, SMTP/primeiro acesso, conferência e exceções financeiras do Pix, validação comercial/contratual, revogação comprovada de credenciais antigas, testes reais de bloqueio e restauração do banco/Storage. Avaliações, notas, certificados e cadastro centralizado de mediadores não foram implementados nesta rodada.

[Progresso dos 45 itens](2026-10-04-progresso-relatorio.md).

Referências: [callback Auth Supabase](https://supabase.com/docs/reference/javascript/auth-onauthstatechange), [revogação da medição Google](https://developers.google.com/tag-platform/security/guides/privacy), [consentimento básico](https://developers.google.com/tag-platform/security/guides/consent).
