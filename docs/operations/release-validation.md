# Validação do release

Usar Node 24 indicado em .nvmrc e instalar dependências com npm ci. O lockfile atual é preservado; este bloco não atualiza pacotes. Testes de código não comprovam dados comerciais, SMTP, pagamento bancário ou lançamento do EAD.

## Executores separados

- npm run test:unit: Jest de src/tests, com execução sequencial. Não coleta scripts node:test nem Playwright. Os testes de regras Firestore ficam ignorados sem emulador.
- npm run test:scripts: node:test dos utilitários de capas e da configuração isolada de E2E/CI. Usa doubles e dados fictícios; não faz upload nem gravação em serviços reais.
- npm run test:rules: comando legado que precisa da CLI Firebase e emulador. A CI instala uma CLI com versão explícita e Java 21, usa o projeto demo-sitefiguraviva e roda a suíte correspondente. Não é prova de RLS Supabase.
- npm run test:e2e: Playwright. Projeto public cobre navegação sem login; chromium cobre as jornadas que dependem de contas de teste. O conjunto ainda contém placeholders/fixme e não demonstra a jornada completa de inscrição/Pix.

## CI sem credenciais

Executar npm run check:ci em clone/cópia limpa sem arquivos .env. O comando recusa arquivos de ambiente na raiz, substitui configurações de serviços por credenciais fictícias, cria um endpoint local somente GET/HEAD e executa lint, testes de scripts, Jest, TypeScript e build nativa. Nenhum artefato gerado com essas configurações deve ser publicado como site de produção.

Para incluir navegador, instalar Chromium com npx playwright install chromium e executar npm run check:ci -- lint scripts unit types build smoke. Build e smoke devem ficar na mesma execução, porque a URL fictícia é incorporada à compilação. As páginas usam http://127.0.0.1:3100; o comando não aceita BASE_URL operacional herdada. Em CI, o servidor usa npm run start e a build de produção, com reuseExistingServer desabilitado.

Os workflows de PR/push não recebem secrets de Supabase, Firebase, Stripe, SMTP ou contas administrativas. O job de Firestore usa emulador separado. Instalação limpa e execução efetiva no GitHub Actions continuam sendo etapas do release; uma cópia local com node_modules compartilhado não as substitui.

## Homologação autenticada

O workflow e2e-playwright.yml roda somente por workflow_dispatch, vinculado ao environment homologacao. Configurar nesse environment:

- E2E_BASE_URL: origem HTTPS da homologação, sem caminho, query ou credenciais na URL.
- E2E_SUPABASE_PROJECT_REF: projeto separado do atual jdxorryvmcvtqsddkpdm.
- E2E_ISOLATED_ENVIRONMENT e E2E_ALLOW_MUTATIONS: true somente após conferir que frontend, Auth, banco e Storage estão isolados.
- Secrets E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD, E2E_STUDENT_EMAIL e E2E_STUDENT_PASSWORD: contas previamente provisionadas exclusivamente para testes.

O preflight verifica a configuração declarada, não descobre sozinho a conexão de banco de uma hospedagem. Confirmar a conexão efetiva antes de habilitar as jornadas: os testes existentes podem criar cursos/contas, aprovar matrículas e gerar registros. Não apontar para produção. Falha de login no setup não cadastra aluno automaticamente. No modo remoto, Playwright não inicia servidor local. Traces, estados de sessão e screenshots autenticados não são enviados como artifacts pelo workflow.

## Scripts e versionamento

.gitignore passou a admitir explicitamente os scripts necessários aos comandos declarados e aos testes. Outros utilitários novos continuam ignorados por padrão; utilitários já rastreados pelo Git continuam rastreados. Revisar arquivos antes de adicionar/commitar, especialmente ferramentas antigas de manutenção. seed/sync_data.mjs é legado Firebase, não um seed do lançamento Supabase, e não é executado pela CI.

Antes de publicar: conferir a execução da CI no commit exato, configuração real da hospedagem/SMTP/Pix, backup e restauração, revogação de credenciais históricas e a jornada com matrícula/primeira parcela, conferência administrativa e acesso. O frontend ainda está local e a URL de homologação não foi informada.

Referências verificadas: [Node LTS](https://nodejs.org/en/about/previous-releases), [seleção de testes Jest](https://jestjs.io/docs/configuration#testmatch-arraystring), [servidor de testes Playwright](https://playwright.dev/docs/test-webserver), [segurança dos workflows GitHub](https://docs.github.com/en/actions/reference/security/secure-use), [Firebase CLI versionada](https://github.com/firebase/firebase-tools/releases/tag/v15.32.1).
