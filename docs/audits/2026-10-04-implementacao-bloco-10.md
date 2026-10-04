# Implementação do bloco 10 — validação e CI do lançamento

Data: 04/10/2026. Objetivo: tornar as correções verificáveis antes da publicação, preservando a prioridade de site, inscrição e Pix manual.

## Correções

Jest passa a coletar somente testes de aplicação em src/tests. Os testes node:test dos utilitários têm comando separado, e Playwright mantém sua própria execução. Foram preservadas as 106 suítes Jest anteriores; a configuração inicial com glob incompatível com a normalização no Windows foi corrigida e verificada novamente.

O comando check:ci recusa arquivos de ambiente operacionais na raiz e executa verificações com credenciais fictícias e um endpoint local somente de leitura. Build e testes públicos usam a mesma execução, para que o endpoint incorporado na compilação permaneça disponível. Artefatos desse ensaio não podem ser publicados como site real.

Os workflows usam Node 24 definido em .nvmrc, npm ci e lockfile preservado. PR/push recebem lint, testes, tipos, build e navegação pública sem credenciais de serviços. Regras Firestore legadas têm job separado com emulador e CLI versionada; isso não testa RLS Supabase.

As jornadas autenticadas ficam disponíveis somente por acionamento manual no environment homologacao. O preflight recusa o domínio público atual e o projeto Supabase atual, exige configuração explícita de isolamento e contas de teste. Essa verificação valida declarações: o responsável ainda deve confirmar a conexão efetiva de Auth, banco e Storage. O setup não cria automaticamente uma conta quando o login falha. Artefatos autenticados não são enviados pelo workflow.

A navegação pública usa /auth e /curso, substituindo rotas inexistentes. Os testes dos recursos foram atualizados para links do catálogo, URLs próprias, navegação por seções e fechamento na navegação superior. Verificam também retorno/reabertura pelo catálogo e controles dentro da tela de 360px. O ignore de scripts agora admite explicitamente os utilitários necessários aos comandos e testes, sem liberar todos os scripts antigos. Nenhum arquivo candidato a exclusão foi removido neste bloco.

## Verificação

- Lint completo de src, tests e e2e passou.
- 14 testes node:test passaram.
- 463 testes Jest passaram em 105 suítes; sete testes de regras Firestore e uma suíte continuam ignorados sem emulador.
- TypeScript passou. A seleção Jest mantém as 106 suítes anteriores e exclui os outros runners.
- Build nativa final terminou com exit 0, usando Next 15.5.25 e SWC nativo. Compilação: 4,1 minutos; geração de 44 páginas estáticas concluída. Há avisos não bloqueantes de cache/serialização Webpack e importação depreciada do Sentry.
- Cinco testes públicos Playwright passaram, sem falhas, em 19,3 segundos. Cobrem seis rotas principais, dois recursos e viewport de 360px. O ensaio usou a build nativa e o serviço fictício restaurado na mesma porta incorporada à compilação, sem serviços reais.
- Os primeiros ensaios combinados encontraram seleção Jest incompatível e expectativas antigas dos recursos. Essas falhas foram corrigidas e repetidas com sucesso; os logs das tentativas são preservados, sem apresentar o comando inicial como CI integral aprovada.
- Comparação de 1.309 arquivos de código/conteúdo/testes com a cópia validada: nenhuma diferença; arquivos de ambiente foram excluídos. O único ajuste temporário de configuração foi o caminho do navegador no laboratório, restaurado após os testes.

O ensaio local usa Windows, Node 26.5.0 e node_modules compartilhado. Não comprova instalação limpa com Node 24 nem execução dos jobs no GitHub. A instalação do Chromium exigido pelo Playwright travou na extração de uma DLL após o download; o ensaio local utiliza temporariamente Chromium 153 já disponível, somente na cópia de laboratório. A configuração do repositório mantém o navegador padrão instalado pela CI.

## Pendências para publicação

Executar os workflows no commit exato após versionamento; concluir emulador legado e homologação autenticada em ambiente realmente separado. Os testes E2E existentes ainda têm placeholders/fixme e não comprovam toda a jornada inscrição/Pix. Confirmar SMTP, URLs permitidas, valores de matrícula/primeira parcela, dados do recebedor e recebimento real antes de liberar inscrições.

Revogar ou esclarecer as credenciais históricas continua prioritário. Identificar a hospedagem e o commit atualmente publicado; publicar o frontend corrigido somente após os critérios de release. Nenhuma migração, gravação no Supabase, publicação, commit ou push foi realizada neste bloco.

Roteiro operacional: [release-validation.md](../operations/release-validation.md). Evidência sanitizada: [block-10-validation.json](2026-10-03-evidence/block-10-validation.json). Logs completos ficam no laboratório privado validation-block-10. O backlog revisado conserva os itens parcialmente concluídos e as dependências de homologação.
