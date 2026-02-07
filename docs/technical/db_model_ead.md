# 🏗️ MODELO DE DADOS IDEAL: LMS de Alta Confiabilidade

Este modelo utiliza o Firestore visando **Single Source of Truth** e **Idempotência**.

## 📊 1. Coleções e Relacionamentos

### `courses` (Coleção Raiz)

*Fonte da verdade para estrutura e visibilidade global.*

- `id`: `string` (Slug-based ou ID gerado)
- `title`: `string`
- `status`: `'draft' | 'open' | 'archived'` (O que o aluno vê)
- `isPublished`: `boolean` (Flag de segurança)
- `contentRevision`: `number` (Incrementa a cada mudança na estrutura)
- `stats`:
  - `lessonsCount`: `number` (Total de lições publicadas)
- `updatedAt`: `Timestamp`

### `enrollments` (Coleção Raiz)

*Fonte da verdade para a relação Aluno <=> Curso.*

- **ID Strategy**: `${userId}_${courseId}` (Unicidade garantida)
- `userId`: `string`
- `courseId`: `string`
- `status`: `'active' | 'completed' | 'cancelled'`
- `enrolledAt`: `Timestamp`
- `courseVersionAtEnrollment`: `number` (Fixa a versão no momento da entrada)
- `progressSummary`:
  - `completedLessonsCount`: `number`
  - `totalLessonsSnapshot`: `number` (Contagem na versão da matrícula)
  - `percent`: `number` (Cache de UI)
- `lastAccessedAt`: `Timestamp`

### `progress` (Coleção Raiz)

*Fonte da verdade para o esforço do aluno.*

- **ID Strategy**: `${userId}_${courseId}_${lessonId}` (Atômico por aula/aluno)
- `userId`: `string`
- `courseId`: `string`
- `lessonId`: `string`
- `enrollmentId`: `string`
- `courseVersion`: `number` (Versão no momento do registro)
- `idempotencyKey`: `string` (uid_course_lesson_firstCompletedAt)
- `status`: `'in_progress' | 'completed'`
- `maxWatchedSecond`: `number` (Métrica de retenção)
- `completedAt`: `Timestamp` (Imutável: define Monotonicidade)
- `updatedAt`: `Timestamp`

### `certificates` (Coleção Raiz)

*Entidade imutável pós-emissão.*

- **ID Strategy**: `${userId}_${courseId}_v${courseVersionAtCompletion}` (Unique)
- `userId`: `string`
- `courseId`: `string`
- `enrollmentId`: `string`
- `issuedAt`: `Timestamp`
- `verificationCode`: `string`
- `integrityHash`: `string` (Hash do snapshot + regras)
- `courseSnapshot`: `Object` (Módulos, lições e IDs considerados na emissão)
- `courseVersionAtCompletion`: `number`
- `studentSnapshot`: `string` (Nome do aluno no momento)

---

## 🛠️ 2. Índices Críticos

1. `enrollments`: `userId` [ASC] + `status` [ASC] (Para a dashboard do aluno)
2. `progress`: `userId` [ASC] + `courseId` [ASC] + `status` [ASC] (Para calcular progresso total via servidor)
3. `certificates`: `verificationCode` [ASC] (Para validação pública instantânea)

---

## 🔒 3. Regras de Escrita (Governança)

- **`courses`**: Escrita: `request.auth.token.role == 'admin'`. Leitura: Public se `status == 'open'`, senão Admin.
- **`progress`**: Escrita: **NEGADO**. Escrita permitida apenas via **Cloud Functions** ou **Server Actions** com Admin SDK.
- **`enrollments`**: Escrita: Admin apenas. Leitura: Próprio Usuário ou Admin.
- **`certificates`**: Escrita: Admin apenas. Leitura: Public (via code) ou Próprio Usuário.

---

## 📦 4. Estratégia "Enterprise" de Mudança de Conteúdo

Ao adicionar uma aula no Admin:

1. O `courses.stats.lessonsCount` é atualizado.
2. Na próxima vez que o aluno acessar o curso, a Server Action detecta que `enrollment.progressSummary.totalLessons` < `course.stats.lessonsCount`.
3. O sistema decide:
    - **Soft Change**: Apenas atualiza a porcentagem (pode cair de 100% para 95%).
    - **Hard Change**: Mantém 100% para quem já tinha certificado emitido através do Snapshot.
