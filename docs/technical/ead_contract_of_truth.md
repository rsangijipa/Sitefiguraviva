# 📜 CONTRATO DE VERDADE: Admin ⇄ Student

Este documento estabelece as Invariantes e Contratos de Dados que garantem a integridade da plataforma EAD Figura Viva.

---

## 📖 1. Glossário

- **Published**: Conteúdo com flag `isPublished = true` e curso em status `open`.
- **Enrollment**: Vínculo jurídico-técnico entre aluno e curso.
- **Progress**: Registro granular de interação com uma lição.
- **Completion**: Estado derivado onde `sum(Progress.completed) == Course.lessonsCount`.
- **Certificate**: Prova digital imutável da Completion.

---

## 🔒 2. Invariantes (NÃO PODEM QUEBRAR)

1. **Visibilidade Estrita**: Um Estudante **jamais** terá acesso a documentos de módulos ou lições onde `isPublished == false`.
2. **Unicidade de Matrícula**: Um usuário só pode ter **uma** matrícula ativa por curso.
3. **Monotonicidade do Progresso**: O status `completed` **jamais** regride para `in_progress` via interface do estudante.
4. **Certificado Dependente**: Elegibilidade é recalculada do zero no servidor baseado nos logs de `progress` + regras vigentes.
5. **Órfão Proibido**: Todo registro de `progress` deve pertencer a um curso e usuário existentes.
6. **Unicidade de Certificado**: Impede-se a duplicação de certificados para o mesmo `userId` + `courseId` na mesma versão.

---

## 📡 3. Eventos Canônicos (Bus de Eventos)

| Evento | Payload Mínimo | Emissor | Idempotência |
| :--- | :--- | :--- | :--- |
| `CoursePublished` | `courseId, timestamp, adminId` | Admin UI (Action) | Sim (Status Check) |
| `CourseStructureChanged`| `courseId, oldVersion, newVersion, timestamp`| Admin UI (Server Action) | Sim |
| `EnrollmentCreated` | `userId, courseId, batchId?` | Admin UI / Stripe Webhook | ID Unica |
| `LessonCompleted` | `userId, courseId, lessonId, courseVersion` | Server Action (Progress) | `uid_lesson_key` |
| `CourseCompleted` | `userId, courseId, percent(100)` | Server Action (Transaction) | `userId_courseId` |
| `CertificateIssued` | `certificateId, userId, integrityHash` | Server Action (Cert) | Hash Unique |

---

## 🛠️ 4. Matriz de Responsabilidade (RACI)

| Elemento | Admin UI | Student UI | Backend (Actions) | DB Rules |
| :--- | :--- | :--- | :--- | :--- |
| Criar Conteúdo | **R**esponsável | - | **A**provação | - |
| Marcar Aula Concluída | - | **C**onsulta | **R**esponsável | **I**nformado |
| Validar 100% | - | - | **R**esponsável | **A**provação |
| Emitir Certificado | - | **I**nformado | **R**esponsável | **A**provação |

---

## 🔄 5. Política de Mudança do Curso (Direito Adquirido - Nivel Acadêmico)

**Política Adotada: Opção A (Tradição Universitária)**

- Mudanças estruturais no curso (adicionar/remover aulas) **não invalidam** certificados já emitidos.
- Alunos certificados mantém o status `completed` relativo à versão que concluíram.
- Mudanças pós-matrícula: o aluno pode optar por cursar o "Conteúdo Extra" da nova versão, mas seu progresso base reflete o contrato da matrícula.

---

## 🧾 6. Critérios de Auditoria

- Cada conclusão de aula deve registrar: `User-Agent`, `IP` (via headers na Action) e `Timestamp`.
- O log de eventos deve permitir reconstruir a timeline do aluno: "Iniciou em X, concluiu aulas A, B, C em datas Y, Z, emitiu certificado em W".
