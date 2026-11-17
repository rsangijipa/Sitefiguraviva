# Aplicação das melhorias da análise do Figura Viva

Data: 17 de novembro de 2026.

As alterações abaixo aplicam os achados A1 a A5 do documento de análise. A validação desta entrega é local, conforme solicitado. Não houve publicação, execução de migração em serviço remoto, modificação de contas ou pagamento real.

## Alterações aplicadas

### A1 Matrícula e acesso

- Adicionado `src/lib/auth/__tests__/enrollment-access-lifecycle.test.ts`, combinando a ação real de aprovação/rejeição Pix e o guard real de curso com persistência fictícia em memória. Cobre pendência, aprovação, repetição da aprovação, falha de reconciliação, rejeição, segundo aluno, identidade forjada, expiração e despublicação.
- Substituídos os placeholders com `describe.fixme` de `e2e/enrollment-gate.spec.ts` por cinco jornadas de navegador com fixtures explícitas: acesso ativo, bloqueio de pendência, expiração, rascunho e isolamento do segundo aluno.
- A suíte de navegador não inventa confirmação Stripe ou preparação de banco. Exige cursos e alunos previamente provisionados em homologação isolada; permanece ignorada quando `E2E_ENROLLMENT_FIXTURE` não foi informado. A transição Pix está coberta localmente com doubles, não com banco bancário ou Supabase hospedado.

### A2 Avaliação canônica em Supabase

- As funções de compatibilidade em `src/actions/assessment.ts` delegam ao ciclo já existente de `src/app/actions/assessment.ts`. Iniciar, submeter e consultar resultado deixaram de depender de Firestore e de espelhamento com erros ignorados.
- A abertura reutiliza a tentativa pendente determinística, devolve respostas já salvas e mantém a regra canônica atual de uma tentativa. Não foram introduzidos novos critérios pedagógicos, tentativas extras ou limites de tempo.
- O envio verifica sessão, propriedade da submissão, acesso ao curso, estado pendente, limite de requisições e identidade da tentativa antes da atualização. A nota vem das questões do servidor; notas e flags enviadas pelo navegador são descartadas.
- O envio canônico faz a correção objetiva. `gradeAssessment` consulta o resultado persistido, sem somar outra tentativa nem corrigir novamente. Questões manuais continuam pendentes de correção.
- Anexos práticos são preservados como metadados privados, com caminho limitado ao aluno, submissão e questão atuais; URLs públicas e campos de nota não são copiados. O formulário retoma as respostas persistidas e apresenta recuperação quando não consegue iniciar a tentativa.
- Falhas de resumo de progresso são sinalizadas por `progressSaved`, sem expor respostas em logs. A submissão é a fonte da nota; a atualização desse resumo continua sendo uma operação posterior, como no serviço canônico preexistente.

Importante para a migração: não foi feita reconciliação de registros históricos, pois não foram fornecidos exports nem ambiente isolado com esses dados. Antes de liberar a versão, comparar tentativas, respostas, estados e notas históricas entre os bancos e resolver divergências. Firebase não foi removido do projeto: outros consumidores, inclusive consultas legadas de indicadores, ainda existem.

### A3 Erros distintos de ausência de conteúdo

- A página inicial lê cursos e posts de forma independente. Falha de consulta não é armazenada como lista vazia inicial; o cliente pode recuperar os dados e mostrar nova tentativa. Uma falha em cursos não apaga os posts obtidos com sucesso.
- As seções públicas de cursos e publicações distinguem carregamento, erro e resultado vazio. O erro tem mensagem em português e botão de nova tentativa.
- `courseService.getCourse` propaga erro de consulta e retorna `null` somente quando a consulta bem-sucedida não encontra o curso. O catálogo de cursos também deixou de capturar indisponibilidade como catálogo vazio.
- O detalhe de um livro sem link válido não afirma que a obra está disponível no acervo; informa a ausência do link externo.
- O smoke público identificou que abrir um recurso diretamente colocava o aviso de cookies e os controles globais atrás de um dialog nativo. As rotas públicas agora usam a moldura não modal; o portal e as prévias mantêm a janela nativa, que protege contra recorte por contêineres transformados. Há regressão unitária para os dois modos e a navegação pública é repetida sobre a build corrigida.

### A4 Registro de eventos

- `trackEvent` e `trackFunnelEvent` usam `audit_logs` em Supabase e verificam o campo `error` da resposta. `success: true` só é retornado após confirmação da gravação.
- A telemetria permanece opcional: uma falha retorna `success: false` e uma mensagem genérica, sem impedir o estudo nem registrar respostas, tokens ou mensagens do provedor.
- Tipos de evento e identificadores são validados. Metadados aceitos se limitam a IDs técnicos e posição numérica de reprodução. Não são aceitas respostas livres por meio desse payload.
- A restrição para um aluno não registrar eventos de funil em nome de outro foi preservada. Eventos de telemetria não substituem a autorização nem a confirmação financeira canônica.

### A5 Prévias e paginação

- As atualizações das prévias de cursos e posts requisitam três itens no repositório, com cache separado da listagem completa.
- Adicionada API de página com tamanho validado, offset e consulta de um item adicional para determinar a existência da página seguinte. A ordenação usa data e ID como desempate.
- O catálogo público de cursos começa com até 12 itens, oferece carregamento adicional, preserva os itens anteriores quando há erro e permite nova tentativa. IDs repetidos entre páginas não geram cartões duplicados.
- O calendário continua usando seu catálogo completo sob demanda. Os filtros do catálogo atuam sobre os cursos já carregados; enquanto houver mais páginas, a interface explica como ampliar os resultados.
- A API de páginas aceita outros tipos de conteúdo, mas esta entrega integra a paginação visual ao catálogo de cursos. A listagem completa do blog, biblioteca e outros consumidores antigos mantém seu contrato existente; não se afirma que todas as listagens do projeto foram paginadas.
- Não houve medição de latência de produção ou de Core Web Vitals. Os testes locais verificam limites, sequência de páginas, erros e duplicação, sem transformar esses testes em promessa de desempenho real.

## Validação

Na cópia isolada, lint, os 57 testes de scripts e as checagens TypeScript geral e de segurança passaram. A suíte Jest completa, repetida após a correção dos recursos públicos, aprovou 191 suítes e 974 testes; uma suíte com sete testes legados de Firestore permaneceu ignorada por depender do emulador. Evidências de comandos e capturas ficam em `reports/improvements-2026-11-17/`; os testes de scripts estão em `ci-validation-final.log` e a rodada posterior à correção dos recursos está em `ci-validation-resource-fix.log`.

O navegador aprovou seis verificações no harness de interface, sem erros de página e sem overflow horizontal nos cenários exercitados. As capturas em celular e desktop foram inspecionadas. A compilação de produção e o smoke público são verificados separadamente dos testes autenticados.

O harness de interface usa componentes reais com dados e consultas substituídos, sem autenticação ou chamadas a serviços remotos. Ele verifica recuperação das prévias e falha/repetição/deduplicação de páginas em 390, 768 e 1440 pixels. Isso não equivale a homologação do fluxo completo.

O teste PostgreSQL em memória `supabase/tests/registration-email-gate-pglite.mjs` passou em 15 verificações das regras de confirmação de e-mail e aprovação administrativa. Ele executa SQL local, sem se conectar ao Supabase hospedado.

O `tsconfig.json` exclui `reports` e `output` da checagem do produto, para que cópias de auditoria e harnesses gerados não sejam compilados como parte do site. As demais configurações e exclusões preexistentes foram preservadas. A cópia de validação usa as dependências já instaladas, sem arquivos `.env`; não substitui uma instalação limpa com `npm ci` na CI remota.

Os testes da estante e da galeria foram alinhados aos rótulos e à estrutura atuais, preservando as verificações de busca, categoria, foco, segurança de links e nomes acessíveis. Nenhuma asserção foi convertida em skip para encobrir falhas.

## Configuração das futuras jornadas de navegador

Além das configurações de isolamento de `docs/operations/release-validation.md`, fornecer:

- `E2E_RELEASE_SHA`: hash da versão efetivamente hospedada sob teste.
- `SECOND_STUDENT_EMAIL` e `SECOND_STUDENT_PASSWORD`: segundo aluno de teste sem matrícula no curso ativo do primeiro. A suíte rejeita contas com o mesmo e-mail.
- `E2E_ENROLLMENT_FIXTURE`: caminho local de um JSON com os objetos `active`, `pending`, `expired` e `draft`. Cada objeto deve conter `courseId`, `lessonId`, `lessonTitle` e `privateText` de um curso distinto.

`privateText` deve ser um trecho fictício e exclusivo, renderizado em uma aula de texto. A matrícula ativa deve exibi-lo; os demais estados e o segundo aluno devem bloqueá-lo. Cursos bloqueados precisam existir, com a aula publicada e bloqueio causado pelo estado declarado. O curso em rascunho deve ter matrícula ativa, para exercitar especificamente a publicação. Não usar dados pessoais no conteúdo das fixtures.

Executar `npm run test:e2e -- e2e/enrollment-gate.spec.ts --project=chromium` somente contra a homologação isolada configurada. A suíte é de leitura, mas o preflight existente exige as mesmas garantias de ambiente e contas das demais jornadas. Ela não cadastra nem prepara esses dados automaticamente.

## Pendências para liberar um piloto

1. Reconciliar registros históricos antes de consolidar a troca de fonte das avaliações; manter backup e possibilidade de recuperação.
2. Provisionar homologação isolada e executar as jornadas reais de cadastro, e-mail, solicitação Pix, conferência administrativa, acesso e isolamento entre alunos. Os doubles locais não comprovam RLS aplicado ou configuração da hospedagem.
3. Confirmar com a equipe pedagógica curso piloto, critérios de conclusão, avaliações obrigatórias e certificado. Validar retomada após novo login e correção manual em conta de teste.
4. Revisar materiais e áudios com docentes e testar teclado, leitor de tela, zoom, movimento reduzido e aparelhos físicos nas jornadas completas.
5. Confirmar oferta, preços, calendário, recebimento de e-mails, suporte, backup restaurável e rollback. Fazer CI no commit final antes de publicar.

Referência consultada para o contrato de paginação: [documentação oficial de range do Supabase](https://supabase.com/docs/reference/javascript/range). A consulta usa limites inclusivos e ordenação explícita.
