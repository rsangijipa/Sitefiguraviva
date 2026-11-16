# EAD Figura Viva × Moodle — 15/11/2026

Comparação feita com a estrutura do repositório `moodle/moodle` (módulos de atividade em `public/mod`: assign, book, choice, data, feedback, folder, forum, glossary, h5pactivity, lesson, lti, page, quiz, resource, scorm, url, wiki, workshop; subsistemas `availability`, `completion`, `grade`, `question`/`qbank`, `badges`, `calendar`, `notes`, `backup`, `report`, `message`, `cohort`/`group`). O objetivo não é copiar o Moodle, e sim trazer os recursos que fazem falta a uma formação clínica, preservando o que a plataforma já faz melhor (experiência editorial, recursos interativos de Gestalt, Pix com conferência manual).

## Equivalências já existentes

| Moodle | Figura Viva | Situação |
|---|---|---|
| Page, Book, URL, Resource, Folder | Aulas com blocos (texto, imagem, PDF, link, chamada, vídeo) e aba Materiais | Existe; os blocos passaram a aparecer para o aluno no PR #50 |
| Quiz + banco de questões | Avaliações com múltipla escolha, V/F, dissertativa e prática; correção manual | Existe, sem banco de questões reutilizável |
| Assign (tarefa com entrega) | Questão "prática"/dissertativa com anexo privado | Parcial: sem prazo de entrega |
| Forum | Comunidade do curso e avisos | Existe |
| Completion | Progresso por aula (vídeo 90% ou conclusão manual) | Existe |
| Badges | Gamificação (XP, medalhas) | Existe |
| Custom certificate (plugin) | Certificado com código público de verificação | Existe |
| Calendar | Eventos e agenda estruturada do curso | Existe |
| Enrolment + payment | Inscrição, Pix, aprovação de cadastro | Existe |
| H5P / interativos | Recursos interativos próprios (Igarapé, Árvore da Awareness…) | Diferencial do Figura Viva |

## Implementado nesta entrega

1. **Liberação de conteúdo** (equivale a *Restrict access* / `availability`).
   - Modo sequencial: cada aula abre quando a anterior é concluída.
   - Data de abertura por módulo, no horário de Brasília.
   - A regra vale no servidor: abrir a URL de uma aula bloqueada redireciona para o curso, e as ações de progresso recusam aula bloqueada.
   - A equipe vê tudo. Aulas já concluídas nunca voltam a ser bloqueadas.
   - Aba **Liberação** no editor do curso. A regra fica em `courses.details.release`, sem mudança de esquema.
2. **Notas do aluno** (equivale ao *User report* do `grade`).
   - Aba **Notas** no curso, com situação de cada avaliação publicada (não iniciada, em andamento, aguardando correção, aprovado, abaixo da nota mínima), percentual, tentativas, devolutiva do professor, obrigatórias aprovadas e média.
   - A devolutiva só aparece depois da correção.
3. **Relatório de conclusão** (equivale a *Activity completion report*).
   - Aba **Conclusão** no editor, com uma matriz aluno × aula, a taxa de conclusão por aula, a última conclusão de cada aluno, busca e exportação CSV (padrão Excel pt-BR, com proteção contra fórmulas).

## Lacunas restantes, por prioridade

| Prioridade | Recurso (Moodle) | Por que importa | Observação |
|---|---|---|---|
| P1 | Prazos de entrega e lembretes (`assign` + `calendar` + `message`) | Formações têm datas de trabalhos | Depende da fila de e-mails (em outra frente) |
| P1 | Critérios de conclusão do curso (`completion`): aulas + avaliações obrigatórias | Certificado hoje usa só % de aulas | Avaliar com a coordenação pedagógica |
| P1 | Tentativas e tempo-limite configuráveis (`quiz`) | Decisão pedagógica pendente (relatório de 12/10) | Não anunciar antes de decidir |
| P2 | Banco de questões reutilizável (`qbank`) | Reaproveitar questões entre turmas | Exige tabela nova |
| P2 | Anotações pessoais por aula (`notes`) | Estudo e supervisão clínica | Exige tabela nova com RLS por dono |
| P2 | Grupos/turmas dentro do curso (`group`, `cohort`) | Várias turmas da mesma formação | Hoje cada turma é um curso; duplicar curso está em outra frente |
| P2 | Glossário de conceitos (`glossary`) | Vocabulário da Gestalt-terapia | Pode reaproveitar os "conceitos relacionados" dos recursos |
| P3 | Rubricas de correção (`grading` avançado) | Correção de casos práticos | — |
| P3 | Backup/restauração de curso (`backup`) | Coberto em parte por "duplicar curso" | — |

## Verificação

Os testes unitários cobrem:
- a regra de liberação (`content-release.test.ts`);
- o boletim (`grade-report.test.ts`) e o relatório com CSV (`completion-report.test.ts`);
- as ações de servidor (`course-learning.test.ts`): acesso só às próprias entregas, exigência de admin e gravação apenas de `details.release`;
- a recusa de progresso em aula bloqueada (`progress.test.ts`) e o botão "Próxima aula" bloqueado (`CoursePlayer.test.tsx`).

As telas autenticadas não foram exercitadas no navegador, porque o ambiente local aponta para a produção. Elas entram no roteiro da homologação.
