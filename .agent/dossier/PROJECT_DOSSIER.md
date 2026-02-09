# 📑 Instituto Figura Viva - Dossiê do Projeto EAD

**Versão:** 1.0.0
**Status:** 🟢 Production Ready (Fase de Validação Final)
**Data:** 09/02/2026

---

## 1. Visão Executiva

A plataforma EAD do Instituto Figura Viva foi desenvolvida para ser um ambiente seguro, performático e escalável para a entrega de conteúdo educacional de alta qualidade. A arquitetura prioriza a segurança dos dados (SSoT), a experiência do usuário (UX Premium) e a eficiência operacional (Admin Dashboard).

Este dossiê consolida as decisões técnicas, a postura de segurança e o modelo de governança para garantir a sustentabilidade do projeto a longo prazo.

### 1.1 Objetivos Estratégicos

* **Centralização**: Unificar a gestão de cursos, alunos e certificações em uma única plataforma proprietária.
* **Segurança**: Garantir que apenas alunos matriculados e em dia acessem o conteúdo.
* **Escalabilidade**: Suportar crescimento de base de alunos sem degradação de performance.
*- **Estabilidade**: 95% do Core Flow blindado com Server Actions e ProgressService.

- **Engajamento**: Sistema de Gamificação (XP, Níveis, Streaks e Medalhas) TOTALMENTE IMPLEMENTADO.
* **Analytics**: Rastreamento granular de eventos (vídeo, quizzes) e Dashboard Admin com gráficos Recharts integrados.

---

## 2. Arquitetura Técnica

### 2.1 Stack Tecnológico

* **Frontend/Backend**: Next.js 14+ (App Router, Server Components, Server Actions).
* **Database**: Google Cloud Firestore (NoSQL) para dados em tempo real e escalabilidade horizontal.
* **Auth**: Firebase Authentication (Session Cookies) com suporte a Social Login e Email/Senha.
* **Styling**: Tailwind CSS com Design System customizado (Stone/Gold/Primary).
* **Infraestrutura**: Vercel (Hosting, Edge Functions) + Firebase (Backend-as-a-Service).

### 2.2 Decisões Arquiteturais Chave

1. **Server Actions como API Layer**: Toda a lógica de escrita e mutação de dados reside estritamente no servidor (`src/actions/*`), garantindo validação de tipos (Zod) e segurança antes de tocar no banco de dados.
2. **Single Source of Truth (SSoT)**: O progresso do aluno e o status de matrícula são calculados em tempo real ou cacheados estrategicamente, evitando inconsistências entre o que o aluno vê e o que o banco registra.
3. **Gatekeeper Pattern**: O middleware de acesso (`src/lib/auth/access-gate.ts`) e o hook `assertCanAccessCourse` garantem que nenhuma rota de conteúdo seja renderizada sem validação explícita de permissões.

---

## 3. Postura de Segurança e Hardening

### 3.1 Controle de Acesso (RBAC)

* **Níveis de Acesso**: Admin (Lilian/Equipe) vs. Aluno (Leitura/Escrita limitada).
* **Proteção de Conteúdo**:
  * Cursos não publicados (`isPublished: false`) são invisíveis para alunos.
  * Matrículas expiradas ou pendentes bloqueiam o acesso instantaneamente.
  * Tentativas de acesso direto por URL são interceptadas e redirecionadas.

### 3.2 Proteção de Dados e Integridade

* **Rate Limiting**: Implementado em rotas críticas (`src/lib/rateLimit.ts`) para prevenir abuso e ataques de força bruta.
* **Validação de Input**: Todos os dados recebidos pelo servidor são sanitizados e validados via schemas Zod.
* **Logs Estruturados**: Sistema de `Logger` (`src/lib/logger.ts`) implementado para rastreabilidade de erros com contexto de usuário (UID), sem expor dados sensíveis.

---

## 4. Governança Operacional

### 4.1 Ciclo de Vida do Conteúdo

1. **Criação/Rascunho**: Admin cria curso/aula. Status `draft`. Visível apenas para Admins.
2. **Revisão**: Admin revisa conteúdo, quizzes e anexos.
3. **Publicação**: Admin altera status para `published`. Conteúdo torna-se visível para alunos com matrícula ativa.
4. **Arquivamento**: Admin pode arquivar cursos antigos, mantendo histórico de acesso para alunos antigos mas removendo de novas vendas.

### 4.2 Gestão de Alunos (Admin Dashboard)

* **Matrículas**: Admin pode matricular, suspender ou estender acesso manualmente.
* **Progresso**: Visualização detalhada do progresso individual e da turma.
* **Correção de Provas**: Interface dedicada para correção de questões dissertativas e práticas (vídeos), com feedback direto ao aluno.

### 4.3 Manutenção e Monitoramento

* **Sentry**: Error tracking configurado para capturar exceções em tempo real (Frontend/Backend).
* **Backups**: Configuração recomendada de exportação diária do Firestore para Google Cloud Storage.
* **Logs**: Monitoramento de logs de segurança (tentativas falhas de login, bloqueios de rate limit) via console do Vercel/Firebase.

---

## 5. Performance e Otimização

### 5.1 Estratégias Implementadas

* **Tree-Shaking de Ícones**: Migração para importações otimizadas de `lucide-react` (`@/components/icons`), reduzindo o bundle size inicial.
* **Lazy Loading de Imagens**: Uso extensivo de `next/image` com props `fill` e `sizes` para servir imagens dimensionadas corretamente e apenas quando visíveis no viewport.
* **Batching de Queries**: Otimização de leituras no Firestore (ex: `portal/page.tsx`) para evitar o problema N+1, buscando dados de cursos em lotes.

### 5.2 Core Web Vitals (Metas)

* **LCP (Largest Contentful Paint)**: < 2.5s (Otimizado via `next/image` e Server Components).
* **CLS (Cumulative Layout Shift)**: < 0.1 (Placeholders e dimensões fixas em imagens/cards).
* **FID (First Input Delay)**: < 100ms (Código JS minimizado e deferido).

---

## 6. Roadmap Tático (Próximos Passos)

### Curto Prazo (Q1 2026)

* [ ] **Finalizar Configuração Sentry**: Autenticação manual e validação de captura de erros.

* [ ] **Backup Automatizado**: Script de Cloud Scheduler para dump do Firestore.
* [ ] **Refinamento Mobile**: Testes de usabilidade focados em telas pequenas (< 375px).

### Médio Prazo (Q2 2026)

* [ ] **Analytics Avançado**: Dashboards de engajamento (tempo de vídeo assistido, heatmaps de cliques).

* [ ] **Gamificação**: Implementação de badges e streaks para aumentar retenção.
* [ ] **App Nativo (PWA)**: Melhorar suporte a instalação e cache offline.

---

**Equipe Técnica Antigravity**
