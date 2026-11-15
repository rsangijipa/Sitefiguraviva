# Situação da aplicação e plano de lançamento — 04/11/2026

Atualização posterior: o [primeiro bloco de correções de dependências](2026-11-04-security-dependencies.md) zera os avisos da auditoria de produção no lockfile local. O diagnóstico abaixo registra a situação anterior à correção; a versão hospedada não foi atualizada nesta sessão.

**Recomendação: concluir os bloqueios abaixo antes de anunciar a abertura comercial ampla.** O site institucional já está publicado e a base técnica passa nas verificações locais. A operação completa de cadastro, pagamento, acesso e conclusão ainda precisa de homologação reproduzível. O próximo marco deve ser um curso piloto com inscrições controladas.

Esta análise revisou o código em `cad8420`, executou verificações locais, visitou a URL pública e consultou o Supabase por operações de leitura. Não alterou contas, matrículas, pagamentos, conteúdo publicado, banco ou configuração de hospedagem; não fez commit, push ou deploy. As alterações que já existiam no diretório foram preservadas.

## Estado confirmado

| Área | Resultado atual | Limite da evidência |
|---|---|---|
| Publicação | O domínio `https://www.institutofiguraviva.com.br` responde HTTP 200. `/api/health` retorna `{"ok":true}`. | Saúde verifica uma consulta ao Supabase; não comprova SMTP, Pix ou todos os fluxos. |
| Histórico de publicação | O GitHub registra Production com sucesso em 12/10/2026 para `cad8420`, também presente em `main`. | A integração Vercel devolveu 403 para a equipe do projeto; variáveis, logs e associação atual de domínios não puderam ser auditados diretamente. |
| Interface pública | 14 verificações em 1440 e 390 px, sem exceções JavaScript, erros de console, imagens quebradas ou overflow horizontal. `/admin` e `/portal` anônimos redirecionam para Auth. | Visitas e capturas não certificam acessibilidade nem as ações autenticadas. |
| Código | Lint, TypeScript geral e de segurança, 163 suítes/833 testes unitários e 43 testes de scripts aprovados. Build de produção aprovado. | Sete testes Firestore foram ignorados por dependerem do emulador. A cópia de auditoria reutilizou dependências instaladas e Node 26.5.0; o release exige instalação limpa e Node 24 conforme CI. |
| Testes públicos automatizados | Smoke não aprovado: o primeiro caso de recursos falhou também na repetição. A execução foi interrompida após essa falha confirmada; os demais casos não foram concluídos. | O teste procura `Abrir recurso: Igarapé`, mas o nome acessível renderizado é `Abrir recurso : Igarapé`. É uma incompatibilidade de seletor confirmada, sem comprovação de quebra do link. |
| Dependências | `npm audit --omit=dev` sinaliza 18 ocorrências: 3 críticas, 2 altas, 12 moderadas e 1 baixa. | É um diagnóstico do grafo de dependências, sem teste de exploração. |
| Supabase | Projeto FiguraViva `ACTIVE_HEALTHY`; as 58 tabelas públicas têm RLS habilitada. Confirmação de e-mail exigida no Auth. | RLS habilitada não substitui testes de autorização por usuário, API e Storage. |
| Oferta comercial | Dois cursos publicados e abertos; ambos sem `pix_price_cents`, `total_price_cents` e `installment_count`. | A geração de um novo Pix exige preço inicial positivo. Recebimento externo/manual é uma operação alternativa que precisa ser definida e homologada. |
| E-mails transacionais | A tabela `enrollment_email_outbox` existe, com dois registros `pending`, `attempts=0`, criados em 12/10. | A busca no código atual não encontrou consumidor da outbox ou integração Resend. Não foi enviado e-mail nesta auditoria. |

Páginas visitadas: home, Auth, catálogo, detalhe da Formação Clínica, recursos, biblioteca pública, termos, privacidade, administração e portal; home/Auth/catálogo/recursos também em celular. A existência de um formulário não foi tratada como comprovação de cadastro, recuperação ou entrega de e-mail.

## Bloqueios e próximos passos

### 1. Corrigir dependências e obter CI verde no commit de lançamento

O [job de build e testes do commit atual](https://github.com/rsangijipa/Sitefiguraviva/actions/runs/38322604644/job/115053916179) falhou na etapa `npm audit --omit=dev --audit-level=moderate`, antes dos testes. Sucessos recentes do Dependabot não substituem essa CI.

O lockfile contém Next `15.5.25`, Sentry `10.75.0`, DOMPurify `3.4.16`, Zod `4.3.6` e sanitize-html `2.18.0`. A configuração usa `tunnelRoute: "/monitoring"`, relevante para o alerta de Sentry. Há também um override fixando `@fastify/busboy` em `3.2.1`, sinalizado pela auditoria.

Atualizar os pacotes e overrides de forma dirigida, revisar compatibilidade e regenerar o lockfile. As referências atuais incluem correções de [Next.js](https://github.com/advisories/GHSA-2464-fhr4-w9xw), [Sentry](https://github.com/advisories/GHSA-mchm-gjx6-7h55) e [DOMPurify](https://github.com/advisories/GHSA-mrv2-3pqr-j5jr). A seleção final deve resolver o grafo completo; atualizar apenas esses três pacotes não garante auditoria limpa.

Corrigir também o seletor do smoke de recursos, em `e2e/resources-smoke.spec.ts:17`, preservando a verificação real de filtro, navegação e retorno. A execução em navegador conseguiu filtrar a categoria, mas não localizou o link pelo nome esperado. Não remover a asserção nem transformar o caso obrigatório em skip.

**Responsável:** desenvolvimento. **Concluído quando:** instalação limpa em Node 24, auditoria conforme o limiar da CI, lint, scripts, testes, tipos, build e navegador passam no SHA exato proposto para publicação.

### 2. Reconciliar migrações antes de provisionar homologação ou atualizar o banco

Existem **52 arquivos locais e 37 versões registradas no banco**. A comparação por versão encontrou **11 versões remotas ausentes localmente e 26 locais ausentes do histórico remoto**. Algumas mudanças equivalentes têm timestamps diferentes, como matrícula por Pix externo e categoria de livros. A migração de outbox só aparece no histórico remoto.

O check Supabase Preview do commit atual falhou com `Remote migration versions not found in local migrations directory.` Isso já impede validar o provisionamento automático.

Ausência no histórico não prova ausência do objeto: `registration_email_confirmed` existe e a função remota de revisão de cadastro chama essa verificação, embora a versão local correspondente não esteja registrada. **Não reaplicar todas as migrações nem marcar versões como aplicadas sem comparar as definições e os dados.**

Recuperar os SQLs correspondentes ao histórico remoto, comparar tabelas, funções, grants e políticas e definir uma base rastreável. Reproduzir o resultado em banco vazio de homologação e verificar os contratos usados pelo piloto.

**Responsável:** desenvolvimento/banco. **Concluído quando:** histórico e arquivos reconciliados, Preview sem esse erro e schema de homologação reproduzível com autenticação, RLS e Storage conferidos.

### 3. Definir a oferta e concluir o fluxo financeiro do piloto

Os cursos abertos são **III Formação Clínica em Gestalt-Terapia** e **Supervisão Clínica: CO-VISAR**. Os preços canônicos estão vazios. `generatePixPayload`, em `src/app/actions/enrollment-pix.ts`, recusa uma nova cobrança se `pix_price_cents` não for inteiro positivo. O ambiente local também não declara `PIX_MERCHANT_KEY`; a configuração de Production não foi acessível nesta sessão.

Escolher o curso piloto e definir o caminho comercial: Pix gerado pela plataforma ou pagamento externo com matrícula manual. No primeiro caso, configurar preço inicial, total, parcelas, favorecido, chave e cidade no ambiente adequado. Em ambos, conferir valor recebido, referência bancária, rejeição, duplicidade, cancelamento e suporte.

Revisar agenda e elegibilidade de entrada: o catálogo ainda oferece matrícula na Formação Clínica com início em **25 e 26 de abril de 2026**, data anterior a esta auditoria. Confirmar se há ingresso tardio ou se a oferta precisa ser atualizada. O anúncio, o formulário e a operação devem comunicar a mesma condição.

**Responsáveis:** produto/pedagógico e financeiro, com desenvolvimento. **Concluído quando:** oferta coerente, pagamento conferido, comprovante sozinho não libera acesso, e confirmação/rejeição alteram matrícula e permissões de forma auditável.

### 4. Homologar e-mails e resolver a fila transacional pendente

O Auth público confirma cadastro habilitado e confirmação de e-mail obrigatória. Isso não comprova recebimento, remetente verificado ou redirecionamentos corretos. Testar cadastro, confirmação, reenvio, recuperação e login com caixas de teste, incluindo links expirados e usados novamente.

Separadamente, resolver a outbox: investigar os dois registros pendentes e implementar/verificar consumidor, deduplicação, retentativas e observabilidade. O relatório anterior dizia que Resend estava integrado; o banco tem a fila, mas esse envio não foi localizado no código atual. A documentação deve refletir a capacidade efetiva. Se o piloto usar comunicação manual, definir responsável e procedimento explícitos e não anunciar notificações automáticas.

**Responsáveis:** desenvolvimento/operação e atendimento. **Concluído quando:** mensagens previstas chegam ao destinatário correto, links apontam para o ambiente correto, falhas são visíveis e há procedimento de recuperação.

### 5. Executar a jornada obrigatória em homologação isolada

O fluxo a comprovar é: **escolher curso → cadastro → confirmação de e-mail → aprovação de cadastro → inscrição/pagamento → conferência financeira → acesso → aula e retomada → conclusão e certificado conforme a política pedagógica**.

O arquivo `e2e/enrollment-gate.spec.ts` continua com `describe.fixme`; lifecycle contém skips condicionais, e conclusão depende de `E2E_COURSE_ID`. O workflow de homologação atual não define essa variável. Não há evidência de aprovação dessa jornada na versão atual. Os cursos existentes também não têm avaliações cadastradas: decidir se avaliação integra a promessa do piloto antes de exigir ou anunciar esse percurso.

Preparar frontend, Auth, banco e Storage separados, com contas de teste aluno A/aluno B/admin/tutor e fixtures explícitas. Testar acesso antes/depois de aprovação, bloqueio e logout, isolamento de anexos e acesso direto por API/Storage. Tornar o cenário do piloto obrigatório, sem skips e com falha se fixtures faltarem.

**Responsáveis:** desenvolvimento/QA, financeiro e pedagógico. **Concluído quando:** jornada reproduzível sem skips, sem divergência entre pagamento e acesso, persistência após novo login e ausência de acesso cruzado entre alunos. Não executar testes que gravam dados contra a produção existente.

### 6. Preparar operação e publicar uma versão rastreável

Conferir variáveis e domínios de Production/Preview, URLs permitidas no Auth, configuração SMTP, Pix e monitoramento na equipe Vercel correta. A integração atual não tem acesso a essa equipe; isso limita a auditoria, sem demonstrar defeito de configuração.

Demonstrar restauração de backup em ambiente separado, rollback da aplicação e recebimento de alerta de erro. A auditoria de segredos do release/histórico acessível não encontrou padrões detectáveis; isso não comprova revogação de credenciais que constaram em históricos antigos. Registrar a confirmação operacional já prevista nos documentos do projeto.

O advisor atual mantém o aviso de [proteção contra senhas vazadas desativada](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). Conferir ativação/disponibilidade no plano e registrar a decisão. Os quatro avisos informativos de tabelas com RLS sem políticas, incluindo a outbox, precisam ser interpretados pelo modelo de acesso: tabelas exclusivas do servidor não precisam receber políticas públicas para eliminar um aviso.

**Responsável:** operação, com desenvolvimento. **Concluído quando:** SHA e CI identificados, configurações conferidas, alerta recebido, recuperação demonstrada e smoke repetido na versão publicada.

## Ordem de entrega

| Etapa | Entrega | Dependência / regra de saída |
|---|---|---|
| P0-A — base técnica | Dependências corrigidas, CI verde e migrações reconciliadas. | Antes do release comercial e dos testes que dependem de um banco reproduzível. |
| P0-B — operação do piloto | Curso/oferta definidos, pagamento e e-mails homologados, ambiente isolado disponível. | Pode avançar em paralelo às correções técnicas; precisa estar pronta para a jornada integrada. |
| P0-C — liberação controlada | Jornada obrigatória sem skips, permissões verificadas, backup/alertas/rollback demonstrados, publicação rastreável. | Abrir o piloto somente com P0-A e P0-B concluídos e responsáveis financeiro/pedagógico aceitando o resultado. |
| P1 — ampliar com evidências | Observar erros, suporte e conversão; revisar acessibilidade com teclado/leitor de tela, desempenho em aparelho real e conteúdo editorial. | Ampliar inscrições após estabilidade do piloto, com indicadores e responsáveis definidos. |
| P2 — expansão | Stripe, automação financeira adicional, retentativas/tempo de avaliações e integrações Google conforme necessidade. | Não anunciar como capacidade entregue antes de implementação e homologação. |

Firebase permanece legado em migração. `src/actions/analytics.ts` ainda consulta Firestore para métricas por curso/aluno; reconciliar essas métricas antes de usá-las para decisões operacionais. Não remover o legado enquanto houver consumidores e dados não reconciliados. Manter Stripe desabilitado para o lançamento atual, conforme `docs/operations/lancamento-pix-e-sessoes.md`.

O site já exibe blog sem artigos e blocos de Instagram com preenchimentos de cor. Revisar o conteúdo de divulgação e confirmar a intenção editorial. Isso pode ser tratado em P1 se não comprometer a oferta do piloto.

O script existente `scripts/check-public-budgets.mjs` reprovou o JavaScript inicial da home: **349,9 KB gzip para limite de 250 KB**, cerca de 40% acima do orçamento. Os dois assets também verificados ficaram dentro do limite. Tratar o excesso em P1 e medir o impacto em aparelho/conexão representativos; esse orçamento de bundle não é uma medição de Core Web Vitals. Não foi executada auditoria completa de acessibilidade/carga.

## Evidências desta execução

Os arquivos locais em `reports/launch-2026-11-04-*` guardam logs de código, auditoria de dependências/segredos/Firebase, estado público de CI e deploy, comparação das migrações, resumo de leitura do banco e capturas de navegador. `reports/` é ignorado pelo Git; o relatório é a síntese versionável.

O cadastro abre com nome, telefone e seleção dos dois cursos abertos. O link de recuperação abre o formulário esperado. Esses fluxos foram inspecionados sem submissão. Na home móvel, uma captura após rolagem confirmou que os cards e as perguntas frequentes aparecem após sua animação de entrada.

O primeiro smoke local não iniciou porque o Chromium esperado não estava disponível. A tentativa de instalar a revisão esperada não concluiu e foi interrompida. A repetição do smoke usou um Chromium já instalado (revisão 1243), com caminho de executável alterado **somente na cópia temporária de auditoria**. O repositório e sua configuração Playwright foram preservados. Uma nova build foi feita na mesma execução da fixture para manter coerência da URL de teste incorporada. O primeiro caso falhou por timeout ao buscar o link e repetiu a falha; o restante da suíte não foi tratado como aprovado.

- CI do commit: [execução](https://github.com/rsangijipa/Sitefiguraviva/actions/runs/38322604644).
- Último registro Production consultado: [deployment Vercel](https://vercel.com/richard-sangis-projects/figuraviva/49rDrSAChs9tYF1vY8VkAimW6u1h), SHA `cad8420`.
- Referências de operação: [validação do release](../operations/release-validation.md), [Pix e sessões](../operations/lancamento-pix-e-sessoes.md), [credenciais e Vercel](../operations/credenciais-e-vercel.md).

**Próxima tarefa concreta:** corrigir as dependências e reconciliar as migrações; em paralelo, definir o curso piloto, seus valores e o caminho de pagamento. Essas entregas permitem homologar a jornada completa e tomar a decisão de abertura com evidências atuais.
