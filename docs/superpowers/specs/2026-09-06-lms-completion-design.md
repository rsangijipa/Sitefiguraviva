# Figura Viva LMS — conclusão de implementação

## Objetivo

Concluir as lacunas restantes da plataforma educacional sem enfraquecer os
controles já existentes de autenticação, matrícula, progresso e certificados.
O servidor continua sendo a fonte de verdade para operações de domínio; o
cliente apenas apresenta estado otimista e solicita mutações autorizadas.

## Escopo e ordem de entrega

1. **Autoria, publicação e ativos** — proteger as ações administrativas,
   versionar alterações estruturais e restringir o Storage a ativos autorizados.
2. **Progresso e experiência do aluno** — consolidar a action canônica,
   manter conclusões monotônicas, persistir métricas de vídeo de modo limitado e
   disponibilizar uma fila local com reconciliação após retorno de rede.
3. **Certificação e verificação** — revalidar elegibilidade no servidor,
   manter certificado por usuário/curso/versão, expor consulta pública segura e
   guardar o snapshot que explica a emissão.
4. **Avaliações, quiz e administração** — terminar integrações que hoje são
   placeholders, separar resultados de autocuidado de avaliações acadêmicas e
   tornar os indicadores administrativos baseados nos dados canônicos.
5. **Observabilidade e qualidade** — registrar eventos de domínio, executar
   reconciliação de inconsistências e cobrir fluxos críticos com testes de
   unidade, regras de segurança e Playwright.

## Arquitetura

### Autoridade e acesso

As Server Actions em `src/actions` são a interface canônica de escrita. Os
wrappers em `src/app/actions` só podem reexportar essas ações para compatibilidade
de imports. Cada mutação valida a sessão, o papel e a regra de domínio antes de
usar o Admin SDK. As regras do Firestore continuam recusando escritas diretas em
`enrollments`, `progress`, `certificates` e `audit_logs`.

O acesso a conteúdo exige simultaneamente curso publicado, item publicado e
matrícula ativa. Consultas do cliente filtram esses estados, e páginas/actions no
servidor repetem a guarda para impedir acesso por URL direta ou por uma consulta
forjada.

### Conteúdo, publicação e versões

Mutações de curso, módulo e aula passam por uma camada administrativa única. Uma
transação incrementa `contentRevision` somente quando a estrutura ou a
visibilidade muda e acrescenta um evento de auditoria. A publicação atualiza o
estado do curso de forma atômica e só aceita conteúdo que atende às validações
mínimas. Materiais enviados obedecem às regras de Storage por proprietário/papel
e tipo de arquivo.

### Progresso e sincronização

Cada registro de progresso é identificado por usuário, curso e aula. A transação
verifica matrícula e visibilidade antes de atualizar o documento. Uma vez
concluída, a aula não volta para `in_progress`; `completedAt` é imutável. Métricas
de vídeo usam máximo observado e são enviadas com throttle.

Quando a rede falhar, a UI armazena a intenção de atualização localmente. Ao
voltar a ficar online, ao receber foco ou no heartbeat, ela reenvia as entradas em
ordem. O resultado do servidor substitui o estado otimista; conflitos favorecem
o estado mais avançado e a data mais recente sem desfazer uma conclusão.

### Certificados

A emissão busca curso, matrícula e progresso atuais no servidor, calcula a
estrutura de aulas publicadas aplicável à versão da matrícula e exige conclusão
integral. O ID natural `userId_courseId_v{revision}` assegura idempotência. O
documento contém o snapshot de conteúdo, regras aplicadas, hash de integridade,
data e emissor. Uma projeção pública mínima é exposta para a rota de verificação,
com limitação de requisições e sem dados pessoais desnecessários.

### Avaliações e quiz

O motor de quiz passa a ter uma implementação explícita para cada instrumento
oferecido, com validação de dados e pontuação testada. Instrumentos de rastreio
e autocuidado permanecem informativos, com avisos e sem serem usados para
aprovação acadêmica. Avaliações do curso usam o domínio de tentativas, respostas
e correção já existente; seus dados são validados no servidor.

### Administração, auditoria e métricas

O painel usa agregações canônicas em vez de valores fixos. Eventos de matrícula,
progresso, publicação, avaliação e certificado são incluídos no trilho de
auditoria. Um processo administrativo de reconciliação identifica diferenças
entre registros de progresso e resumos de matrícula, sem alterar dados de forma
silenciosa.

## Falhas, privacidade e migração

As ações retornam erros de domínio que a UI pode apresentar sem revelar detalhes
internos. Notificações são pós-efeito: a operação principal não é revertida se o
aviso falhar. Dados de auditoria têm acesso administrativo; verificações públicas
usam uma projeção intencionalmente limitada. As mudanças de esquema preservam os
documentos legados por meio de defaults e scripts de backfill idempotentes.

## Verificação

- Testes unitários para transições de progresso, cálculo de elegibilidade,
  idempotência, pontuação dos instrumentos e reconciliação.
- Testes de regras que comprovem a rejeição de escritas diretas e a separação de
  dados por usuário/papel.
- Testes Playwright para publicar/despublicar, matrícula, concluir curso,
  emitir/verificar certificado, reconectar após operação offline e fluxos
  administrativos principais.
- Em cada entrega: `npm run lint`, `npm run typecheck`, testes unitários e o
  subconjunto E2E afetado; antes da conclusão, a suíte aplicável completa.

## Fora de escopo

Não serão introduzidos pagamentos novos, diagnóstico clínico, alteração de
provedores de autenticação ou migração de banco. Problemas não relacionados que
apareçam durante os testes serão registrados e isolados, salvo se bloquearem uma
entrega deste escopo.
