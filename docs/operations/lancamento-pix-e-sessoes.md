# Operação do lançamento: Pix, sessão e analytics

O lançamento oferece inscrição com Pix e conferência manual pelo administrador. Informe o banco e valide favorecido, valor da matrícula/primeira parcela, crédito real, referência bancária e tratamento de rejeição/duplicidade/reembolso antes de abrir a cobrança.

## Stripe

Mantenha STRIPE_BILLING_MODE ausente ou disabled. Rotas Stripe respondem 503 e não processam o pagamento legado. Isso não configura nem suspende serviços diretamente no painel do PSP.

O valor test só funciona com chave sk_test_ e fora do ambiente Production da Vercel. Use exclusivamente banco/Auth/Storage separados de produção. Mesmo assim, a integração financeira Stripe ainda depende da migração canônica Supabase e testes de idempotência/reconciliação; não representa uma modalidade pronta para oferta.

## Sessão

Confirme em homologação: troca de conta, refresh durante login, sair durante solicitação pendente, indisponibilidade de Auth, perfil bloqueado e resultado tardio de consulta. O cookie de sessão acompanha o token verificado e o logout exige a mesma origem. Se a saída falhar, o erro é mostrado e deve ser repetida; não se assume revogação global do provedor.

O perfil visual usa profiles como fonte canônica. Verifique nome/avatar após salvar, recarregar e trocar de conta, inclusive com conexão interrompida.

A migração 20261004163454_block_17_session_revocation.sql foi aplicada com autorização do proprietário. O modo padrão agora verifica sessão; use AUTH_SESSION_CHECK_MODE=enforce. Na Vercel Production a checagem é obrigatória mesmo com configuração profile. Em homologação, testar JWT real com session_id: dono/admin/tutor, logout, bloqueio e reativação, mudança de cargo e uma sessão nova. As políticas RLS restritivas protegem tabelas públicas e Storage; tokens sem sessão válida perdem acesso authenticated. As seis sessões ativas foram preservadas na verificação da instalação.

## Analytics

NEXT_PUBLIC_GOOGLE_ANALYTICS_ID deve estar ausente enquanto não houver propriedade e política de medição definidas. O formato suportado é G- seguido de letras e números.

Em homologação, capture rede/cookies em: escolha ausente, recusa, aceite, retirada no rodapé, reaceite e retirada em outra aba. Confirme que publicidade permanece negada, medição não ocorre sem aceite e cookies necessários não são removidos. Não use dados pessoais reais nesses ensaios.

A retirada desativa a propriedade e remove cookies GA acessíveis; eventos enviados antes dela não são desfeitos. A plataforma não transforma a escolha de analytics em aceite de contrato ou autorização de marketing.
