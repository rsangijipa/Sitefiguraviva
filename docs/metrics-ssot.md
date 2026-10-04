# Metrics SSoT

This document defines canonical metric sources and formulas for dashboard cards.

## Canonical Rule

- `Acesso liberado` = enrollments with `status in ['active', 'completed']`.

## Student Dashboard (`/portal`)

- `Cursos Ativos`
  - Source: `enrollments`
  - Query: `where(uid == currentUser) AND where(status in ['active','completed'])`
  - Owner: Product + LMS
- `Certificados`
  - Source: `certificates`
  - Query: `where(userId == currentUser)`
  - Owner: LMS
- `Atividade Semanal`
  - Primary source: `xp_transactions`
  - Query: `where(userId == currentUser) AND where(timestamp >= today-6d)`
  - Fallback source: `analytics_events`
  - Query: `where(userId == currentUser) AND where(timestamp >= today-6d)`
  - Owner: Gamification
- `Agenda Viva`
  - Source: `events`
  - Query: `where(status in ['scheduled','live']) AND where(isPublic == true)`
  - Owner: Events

## Admin Dashboard (`/admin`)

- `Alunos Totais`
  - Source: `users`
  - Query: `count(users)`
  - Owner: Governance
- `Acesso Liberado`
  - Source: `enrollments`
  - Query: `count(enrollments where status in ['active','completed'])`
  - Owner: LMS
- `Cursos`
  - Source: `courses`
  - Query: `count(courses)`
  - Owner: Content
- `Documentos`
  - Source: `posts`
  - Query: `count(posts where type == 'library')`
  - Owner: Content
- `Matrículas Pendentes`
  - Source: `enrollments`
  - Query: `where(status == 'pending_approval') limit(5)`
  - Owner: LMS
- `Novos Usuários`
  - Source: `users`
  - Query: `orderBy(createdAt desc) limit(5)`
  - Owner: Governance

## Contract for KPI Actions

All KPI actions must return:

```ts
{
  success: boolean
  error?: string
  data?: unknown
  source: Record<string, string>
  updatedAt: string
}
```

Current canonical actions:

- `getStudentDashboardKPIs(uid?)`
- `getAdminDashboardKPIs()`
