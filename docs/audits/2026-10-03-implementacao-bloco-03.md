# Implementação do bloco 03 — cadastro e recuperação de senha

O cadastro público deixou de usar auth.admin.createUser com email_confirm: true. Agora utiliza auth.signUp com chave pública e cliente exclusivo da requisição, mantendo a validação do curso e o limite de tentativas. Somente cursos publicados com status open aceitam cadastro. Erros de consulta também bloqueiam a operação.

O Supabase do projeto jdxorryvmcvtqsddkpdm foi consultado por sua API pública de configurações em 03/10/2026: e-mail habilitado, cadastro habilitado e confirmação de e-mail obrigatória. Nenhuma configuração remota foi alterada neste bloco, nenhuma conta real foi criada e nenhum e-mail foi enviado durante a validação. O script [check-auth-email-settings.mjs](../../scripts/check-auth-email-settings.mjs) repete essa conferência sem exibir chaves ou usar service_role.

A resposta do cadastro não é usada para gravar profiles. O Supabase pode devolver uma identidade ofuscada para um e-mail já registrado; portanto, o novo fluxo não altera, reativa ou exclui um perfil a partir dessa resposta. O bootstrap continua no servidor, após verificar um token válido, preservando os controles do bloco anterior. Nome, telefone e interesse no curso permanecem nos dados de cadastro de Auth; esses dados não atribuem papéis.

A tela informa que o usuário deve confirmar o e-mail antes de continuar, remove a senha do estado após a solicitação e evita login automático. Mensagens genéricas reduzem a divulgação da existência de contas. Se o Supabase devolver uma sessão imediata, a ação encerra essa sessão e retorna indisponibilidade: não considera concluído um cadastro que contornou a confirmação. Isso é uma proteção adicional; a configuração remota de confirmação deve continuar habilitada.

Foi criada a rota /auth/confirm. Ela aguarda a leitura da sessão pelo SDK, chama a ação de perfil que verifica a identidade no servidor e retoma /inscricao/<curso> para o aluno. Links expirados, ausência de sessão e falhas de perfil mostram erro e não redirecionam para a inscrição. O identificador do curso é codificado no caminho, e os papéis continuam sendo obtidos do perfil persistido.

Foi criada a rota /auth/update-password. Ela verifica a identidade no Supabase antes de exibir o formulário, exige senha com oito caracteres e confirmação correspondente, trata falhas de updateUser e, após sucesso, solicita encerramento global das sessões de Auth e remoção do cookie local. Falhas de encerramento são apresentadas como operação incompleta. A revogação de sessões não invalida instantaneamente todo JWT já emitido em outros dispositivos; a expiração dos tokens e a validação de sessão nas operações sensíveis continuam relevantes.

A solicitação de recuperação agora aponta explicitamente para essa nova tela e propaga os erros retornados pelo SDK. A tela de solicitação deixou de apresentar sucesso falso e informa que o envio depende da existência de uma conta, sem revelar se o endereço está cadastrado.

## Validação

- Jest: 83 suítes passaram; 1 ignorada; 295 testes passaram; 7 ignorados; nenhuma falha.
- TypeScript: passou com os novos testes de confirmação e atualização de senha.
- ESLint: código, testes e script de diagnóstico sem erros ou avisos.
- Build: passou com Next 15.5.25/WASM e fixtures (246 segundos).
- API pública de Auth: confirmação obrigatória conferida, sem mutação remota.

Os novos testes cobrem cadastro sem escrita de perfil, resposta ofuscada de conta existente, falha de envio, curso fechado, erro de banco, sessão inesperada, retorno seguro configurado, erro de recuperação, confirmação expirada, falha de perfil, senhas divergentes, falha de atualização e encerramento incompleto das sessões.

A build e os testes usam o laboratório privado com WASM oficial do Next 15.5.25, credenciais fictícias e serviços simulados. Não provam entrega de e-mail, funcionamento das URLs permitidas em produção ou a jornada completa em navegador com um link real. O teste E2E student-lifecycle.spec.ts ainda pressupõe cadastro com entrada imediata e precisa de uma caixa de e-mail de homologação para acompanhar a confirmação. Não foi executado nem contabilizado como aprovado.

## Preparação necessária para publicar

1. Configurar NEXT_PUBLIC_BASE_URL com a origem correta do ambiente, por exemplo https://www.institutofiguraviva.com.br, antes da build de produção. O cadastro não usa origem recebida no formulário nem cabeçalhos encaminhados para montar o link.
2. Conferir Site URL, lista de Redirect URLs e templates de Auth no projeto Supabase. Liberar /auth/confirm com os parâmetros de curso utilizados no link e /auth/update-password para a origem do ambiente; conferir a variante com ou sem www. Templates devem preservar o redirecionamento solicitado.
3. Confirmar o serviço SMTP e testar entrega para endereços externos em homologação, incluindo spam, link expirado e clique em outro navegador. O SMTP do projeto ainda não foi verificado. Segundo a [documentação oficial de Auth](https://supabase.com/docs/guides/auth/passwords), o serviço padrão tem limites baixos e a produção exige planejamento de envio.
4. Executar a inscrição após a confirmação e a recuperação completa em navegador. Adaptar os E2E a uma caixa de homologação e validar a concorrência entre sincronização de login e logout.
5. Definir CAPTCHA e limite distribuído para produção. O limite existente foi preservado; o fallback em memória não é um limite global em múltiplas instâncias. O cadastro direto na API pública de Supabase também deve ser protegido pelas configurações de Auth.

Os links de confirmação usam o fluxo implícito compatível com o cliente atual (detectSessionInUrl habilitado). Migração para PKCE e templates personalizados com token_hash exige tratamento próprio; não foi introduzida neste bloco.

As alterações permanecem locais, sem deploy, commit ou push. Os arquivos candidatos à remoção continuam preservados. O [backlog revisado](2026-10-03-backlog-revisado.csv) distingue implementação local de validação operacional pendente. O próximo bloco continua com a inscrição e o Pix manual, sem antecipar a conclusão da plataforma EAD.

[Evidência agregada do bloco 03](2026-10-03-evidence/implementacao-bloco-03.json).
