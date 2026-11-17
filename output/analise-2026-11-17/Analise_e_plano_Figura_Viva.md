# Análise do projeto Figura Viva

Diagnóstico técnico e aplicação prática das recomendações
17 de novembro de 2026

## Conclusão e decisão recomendada

O Figura Viva possui uma base ampla para apresentar o instituto, oferecer formações e apoiar alunos. A prioridade é consolidar a confiabilidade das jornadas de acesso e aprendizagem antes de ampliar funcionalidades ou liberar um piloto comercial. Os testes locais selecionados passaram, mas não comprovam pagamento, isolamento entre alunos ou emissão real de certificados.

Recomenda-se um piloto controlado após comprovar cadastro, confirmação de e-mail, conferência Pix, autorização de acesso, persistência do progresso e conclusão do curso em homologação isolada. A migração de avaliações e indicadores precisa ter uma fonte de dados definida para evitar divergências entre Firebase e Supabase.

## Escopo e base da análise

A análise considera os arquivos locais em C:/Users/aless/Downloads/Sitefiguraviva, com HEAD dc0dae8 e alterações de trabalho preexistentes. Foram examinados estrutura, rotas, consultas, componentes selecionados, testes e documentação operacional. Os achados descrevem esta cópia local, não uma versão publicada.

O relatório distingue três níveis de evidência: verificado agora por leitura ou comando; histórico registrado pela equipe; e validação operacional pendente. A aplicação prática consiste no plano, nas tarefas e nos critérios de aceite deste documento. Nenhuma recomendação foi implementada no site nesta entrega.

## Prioridades para a equipe

1. Comprovar a jornada de matrícula e acesso com cenários executáveis.
2. Definir e consolidar a persistência das avaliações e dos eventos.
3. Diferenciar falha de consulta de conteúdo vazio.
4. Validar conclusão pedagógica, acessibilidade e operação do piloto.
5. Medir o catálogo e limitar consultas conforme a necessidade.



# Estrutura e funcionalidades

## O que o projeto oferece

A aplicação usa Next.js com App Router e React, organizada em src/app, componentes, serviços e módulos de domínio em src/features. Há três superfícies principais: site público, portal do aluno e administração. Supabase é a fonte canônica alvo descrita na arquitetura; Firebase permanece em partes legadas.

O site público contém apresentação institucional, formações, cursos, blog, biblioteca, galeria, estante, termos, privacidade e verificação de certificados. A página inicial obtém cursos e posts publicados no servidor e usa conteúdo editorial configurável. Metadados, sitemap e regras de indexação estão presentes; isso não comprova sua configuração efetiva no domínio publicado.

O portal contém cursos e aulas, materiais, agenda, certificados, comunidade, suporte e recursos interativos. Há rotas e componentes para essas capacidades; a presença do código não demonstra disponibilidade de dados ou funcionamento integral em produção. Trilhas e metas apresenta explicitamente uma mensagem de disponibilidade futura.

A administração contém edição de cursos e conteúdo, avaliações, alunos e configurações. Os fluxos de avaliação ainda combinam implementações em Supabase com operações legadas em Firebase. A separação por domínio já existe e oferece um caminho para consolidar a migração sem reescrever toda a interface.

## Pontos positivos preserváveis

O projeto dispõe de testes unitários e de navegador, procedimentos de release e uma execução de CI preparada para serviços fictícios. next.config.mjs inclui cabeçalhos de segurança e permite diretório de build isolado. Essas medidas são úteis, embora não substituam validação da hospedagem e das permissões reais.

As melhorias recentes do portal incluem busca e filtros de cursos, tratamento de erro em materiais e menu móvel com dialog nativo. PortalMenu usa showModal, rótulos acessíveis, fechamento por Escape e restauração de foco no encerramento. Os testes selecionados confirmaram parte dos comportamentos de cursos e modais.

Referências locais: README.md; package.json; docs/architecture/CURRENT.md; next.config.mjs; src/app/page.tsx; src/app/robots.ts; src/app/portal/goals/page.tsx:18; src/components/portal/shell/PortalMenu.tsx:16. Caminhos relativos à raiz do projeto.



# Achados de maior prioridade

## A1 Matrícula e acesso sem cobertura E2E efetiva

Prioridade alta. Verificado no código: e2e/enrollment-gate.spec.ts:19 usa test.describe.fixme. Os cinco cenários descrevem Pix, confirmação Stripe, expiração, acesso direto e publicação, mas contêm preparação apenas comentada e IDs fictícios. Assim, esse arquivo não fornece evidência executada das regras de acesso.

Aplicação: substituir os placeholders por fixtures de homologação, com curso publicado, curso em rascunho, matrícula pendente, ativa e expirada e dois alunos. Testar solicitação Pix, decisão administrativa, acesso por URL direta e isolamento entre contas. Separar o que é preparação de dados do que é a jornada demonstrada pela interface.

Aceite: os cenários executam sem fixme, falham quando o bloqueio de acesso é removido e registram a versão testada. O segundo aluno não acessa dados ou aulas restritas do primeiro. A jornada de conclusão deve ser complementar: e2e/completion-journey.spec.ts:8 depende de fixture explícita e parte de aluno já habilitado.

## A2 Avaliações ainda dependem do Firebase

Prioridade alta. Verificado no código: startAssessmentAttempt lê e grava Firestore antes de tentar inserir um espelho no Supabase. A gravação espelhada não verifica o campo error retornado pela consulta e seu catch ignora exceções. A autorização e a presença de repositórios Supabase não eliminam essa dependência do caminho legado.

Impacto provável: falha do Firebase pode impedir a tentativa, e falha do espelho pode deixar os bancos divergentes sem sinalização ao chamador. Não foi observada perda real de dados. A divergência é um risco demonstrável pelo fluxo de tratamento de erro.

Aplicação: escolher a fonte canônica por operação de avaliação, migrar leituras e gravações desse fluxo para o repositório correspondente e reconciliar tentativas históricas. Enquanto houver espelho, verificar error, registrar falhas sem respostas livres do aluno e definir recuperação idempotente.

Aceite: iniciar, retomar, submeter e corrigir uma avaliação funciona no ambiente alvo; falhas de persistência são observáveis; a reconciliação não apresenta divergências. Não remover Firebase antes de mapear os consumidores remanescentes.

Evidências: src/actions/assessment.ts:82 e :126; src/lib/firebase/admin.ts; src/components/assessment/QuizTaker.tsx; docs/architecture/CURRENT.md. A execução autenticada e os bancos reais não foram testados nesta análise.



# Confiabilidade e crescimento

## A3 Consultas podem ocultar falhas

Prioridade média. getHomeData seleciona apenas data das respostas de cursos e posts e converte ausência em listas vazias. courseService.getCourse também não inspeciona error e pode retornar null em uma falha de consulta. Na página inicial, isso pode resultar em mensagem de ausência de formações durante uma indisponibilidade.

Aplicação: verificar error antes de mapear dados e distinguir encontrado, vazio, não encontrado e indisponível. A tela deve oferecer orientação ou nova tentativa quando aplicável; registrar a causa com contexto mínimo. Usar como referência getCoursesByIds e getCourseMaterials, que já propagam erro.

Aceite: simular falha de rede ou permissão produz estado de erro; consulta válida sem registros produz estado vazio; curso inexistente segue o fluxo de não encontrado. A interface não deve afirmar indisponibilidade de vagas com base em falha técnica.

## A4 Eventos podem confirmar sucesso sem gravação

Prioridade média. trackEvent tenta gravar em Firestore e em audit_logs no Supabase, ignora exceções nas duas tentativas e retorna success true. A inserção Supabase também não inspeciona error. Se ambas falharem, o retorno ainda pode indicar sucesso. Isso reduz a confiança dos indicadores; não comprova uma falha de autorização.

Aplicação: definir se o evento é telemetria opcional ou registro obrigatório. Para telemetria, permitir que a aula continue e emitir diagnóstico controlado; para auditoria obrigatória, exigir confirmação da persistência canônica. Aceite: falhas simuladas não geram confirmação falsa de gravação e não expõem conteúdo sensível nos logs.

## A5 Prévia e catálogo usam a mesma consulta

Prioridade média para crescimento. O parâmetro scope em useCourses e useBlogPosts altera a chave de cache, mas não a consulta. listContent ordena cursos e posts sem paginação explícita; a prévia da home nasce com três itens no servidor, mas a atualização do cliente pode buscar a listagem publicada inteira.

Aplicação: tornar o limite da prévia parte do contrato do repositório e paginar listagens completas. Medir payload e tempo com massa representativa antes de fixar metas. Aceite: a prévia requisita até três itens, o catálogo alcança páginas seguintes sem duplicatas e a ordenação permanece estável. Não há medição de lentidão real nesta entrega.

Evidências: src/app/page.tsx:45; src/services/courseService.ts:18; src/components/HomeClient.tsx; src/components/sections/CoursesSection.tsx; src/actions/analytics.ts:392; src/hooks/useContent.ts:32 e :52; src/features/content/infrastructure/supabaseContentRepository.ts:265 e :276.



# Plano de aplicação

A sequência abaixo é uma proposta por etapa, sem compromisso de prazo. Os responsáveis são papéis sugeridos a serem atribuídos pela equipe. Cada etapa termina com uma evidência verificável.

## Etapa 1 Preparar o piloto

Responsáveis sugeridos: produto, operação e desenvolvimento. Definir curso piloto, oferta, calendário, canal de suporte e regras de conclusão. Preparar frontend, Auth, banco e Storage isolados, com contas e dados exclusivos para teste. Entrega: mapa de ambientes e roteiro de cadastro até acesso, incluindo confirmação de e-mail, Pix aprovado e rejeitado.

## Etapa 2 Consolidar acesso e persistência

Responsáveis sugeridos: backend e qualidade. Executar A1 e A2, incluindo reconciliação e controles contra repetição indevida de operações. Implementar A3 e A4 em alterações pequenas e revisáveis. Entrega: cenários executados e registro das transições de matrícula, avaliação e persistência, sem tokens ou dados pessoais nas evidências.

## Etapa 3 Validar aprendizagem e experiência

Responsáveis sugeridos: equipe pedagógica e qualidade. Confirmar critérios de aprovação e certificado no servidor, retomada após novo login e comportamento de avaliações pendentes. Revisar materiais e áudios com docentes. Testar teclado, leitor de tela, zoom, movimento reduzido e celular real. Entrega: checklist de conclusão por curso e roteiro manual preenchido.

A página Trilhas e Metas deve continuar claramente identificada como futura enquanto não existir persistência e regra de produto. Evitar usá-la como promessa da oferta do piloto. Recomenda-se priorizar a explicação das condições de conclusão antes de novas metas ou notificações.

## Etapa 4 Medir e liberar a versão

Responsáveis sugeridos: desenvolvimento e operação. Executar A5 com massa representativa. Rodar lint, testes, tipos, build e smoke em cópia limpa sem credenciais, conforme o roteiro existente. Confirmar envio e recebimento de e-mail, conferência Pix, backup restaurável e rollback. Entrega: evidência de CI no commit final e identificação da versão efetivamente hospedada.

## Critério de liberação

Liberar o piloto quando os bloqueios de acesso e aprendizagem estiverem demonstrados e houver responsável por suporte e recuperação. Um teste aprovado de interface não encerra pendências de dados, pagamentos ou permissões. Correções devem ser revisadas e validadas antes de entrar na versão destinada ao piloto.

Base operacional: docs/operations/release-validation.md; docs/audits/2026-11-16-release-validation.md; docs/audits/2026-11-16-ead/README.md. Não houve deploy, alteração de serviço externo ou edição do produto nesta entrega.



# Verificações e rastreabilidade

## Executado nesta análise

TypeScript: node node_modules/typescript/bin/tsc --noEmit --incremental false. Resultado: aprovado, saída 0. O projeto mantém strict false em tsconfig.json:12; a aprovação não equivale à checagem estrita de todos os contratos.

Lint direcionado: ESLint em src/app/page.tsx, src/services/courseService.ts, PortalMenu.tsx e CourseCollection.tsx. Resultado: aprovado, saída 0. Não foi executado lint integral nesta rodada.

Jest direcionado: quatro suítes e oito testes aprovados, sem snapshots. Arquivos: courseService.errors.test.ts; CourseCollection.test.tsx; resource-shell-modal.test.tsx; resource-heading.test.tsx. A seleção cobre propagação de erros de serviços, coleção de cursos e comportamentos de modais/cabeçalhos; não cobre matrícula ou banco real.

## Histórico consultado

O relatório de release de 16/11 registra build, oito testes públicos e verificações locais aprovadas em uma base anterior. O relatório do EAD de 16/11 registra 186 suítes e 937 testes aprovados, além de 38 verificações de navegador com serviços substituídos. Esses números são registros documentais, não execuções repetidas nesta entrega e não devem ser atribuídos automaticamente à árvore atual.

## Validações que permanecem abertas

Não foram executados nesta rodada: build completa, suíte integral, navegador do produto, avaliação visual atual das telas, testes com conta real, políticas aplicadas no banco, SMTP, Pix, certificado real, carga ou acessibilidade completa. Nenhuma conclusão sobre disponibilidade da produção, conformidade legal ou ausência de vulnerabilidades deve ser extraída deste documento.

A análise foi feita na árvore com alterações preexistentes, que foram preservadas. O identificador dc0dae8 registra apenas o HEAD e não representa sozinho todos os arquivos examinados. As referências de arquivo e linha correspondem à cópia local lida em 17/11/2026 e podem mudar após novas edições.

## Como usar este documento

Transformar A1 a A5 em tarefas com responsável, evidência e critério de aceite. Encerrar uma tarefa somente após validar o resultado correspondente, e anexar ao release as evidências de homologação da jornada completa. O PDF serve para revisão e compartilhamento; o arquivo Markdown permite atualizar o texto e acompanhar a execução.
