# Dossiê Técnico Completo – Antigravity

**Data**: 20/01/2026
**Projeto**: SiteFiguraViva (Next Platform)
**Versão Analisada**: `1.0.0`

---

## 1️⃣ Visão Geral do Projeto

* **Objetivo**: Plataforma institucional e educacional para o Instituto Figura Viva, focada na divulgação de cursos, blog, galeria de memórias e conteúdo institucional (Equipe, Fundadora).
* **Público-alvo**: Alunos, parceiros e interessados em psicanálise/educação.
* **Status atual**: **LMS Funcional**. A aplicação está operacional com sistema de cursos, player de vídeo, área do aluno e painel administrativo robusto.
* **Principais fluxos de negócio**:
    1. **Navegação Pública**: Visualização de Cursos, Blog, Galeria e Institucional.
    2. **Área Administrativa**: Dashboard para criação/edição/remoção de conteúdos (CMS próprio) e gestão de alunos.
    3. **Portal do Aluno**: Dashboard de progresso, player de aulas, fórum de comunidade e agenda de eventos.

---

## 2️⃣ Stack Tecnológica Detalhada

### Frontend

* **Framework**: Next.js 15.1.9 (App Router).
* **Linguagem**: TypeScript.
* **Estilização**: TailwindCSS v3.4 (com variáveis CSS e Design Tokens configurados em `globals.css`).
* **Animações**: Framer Motion v12.
* **Scroll**: Lenis Smooth Scroll.

### Backend & Serviços

* **Modelo de Backend**: BaaS (Backend as a Service).
* **Provedor Primário**: Firebase (Auth, Firestore, Storage).
* **Data Fetching**:
  * Server-Side: Fetch direto via Firebase Admin SDK em Server Components.
  * Client-Side: TanStack Query (React Query) para cache e sincronização de dados de cursos, blog e galeria.
  * Services: Camada de serviço (`services/*.ts`) encapsula a lógica de negócio.

### Banco de Dados

* **Provedor**: Google Cloud Firestore (NoSQL).
* **Estrutura Principal**:
  * `courses`: Metadados e catálogo de cursos.
  * `modules` / `lessons`: Subcoleções para estrutura do curso.
  * `enrollments`: Matrículas e relacionamento aluno-curso.
  * `progress`: Registro granular de progresso em aulas e vídeos.
  * `posts`: Artigos de blog e biblioteca.
  * `siteSettings`: Configurações globais (SEO, Founder, Institute).

### Autenticação

* **Serviço**: Firebase Authentication.
* **Método**: Email/Senha com Persistência em Session Cookie (HttpOnly).
* **Controle de Acesso**:
  * Baseado em Roles (`admin`, `student`) armazenados no Firestore e Custom Claims.
  * Proteção de rotas via Middleware e Server-side checks (`requireAdmin`).

---

## 3️⃣ Arquitetura da Aplicação

### Organização

* **Feature-based Services**: `src/services` contém a lógica separada por domínio.
* **Modern State Management**: Uso de Context API para UI e Auth, e React Query para dados persistentes.
* **Server-First Logic**: Priorização de Server Components e Server Actions para operações críticas de escrita (LMS).

### Fluxo de Dados

1. **Server Load**: `page.tsx` carrega dados via Admin SDK e injeta como `initialData`.
2. **Client Hydration**: React Query assume o gerenciamento do estado no cliente para atualizações sem refresh.
3. **Optimistic Updates**: Aplicados em curtidas e fórum para melhor UX.

---

## 4️⃣ Segurança e Observabilidade

* **Segurança de Dados**: Firestore Rules (RBAC) garantindo que apenas administradores editem conteúdo e alunos acessem apenas cursos matriculados.
* **SRE**: Integrado com Sentry para rastreamento de erros e Web Vitals.
* **Performance**: Otimização de imagens via Next/Image e cache agressivo de queries via React Query.

---

## 5️⃣ Limitações e Roadmap

### Em Implementação

* 🛠️ **Avaliações (Quizzes)**: Sistema de provas integradas ao player.
* 🛠️ **WhatsApp API**: Integração para suporte e automação de alertas.
* 🛠️ **Gamificação**: Integração visual completa de conquistas no portal.

### Conclusão Técnica

A aplicação encontra-se em um estado **maduro e produtivo**. A transição para o ecossistema Firebase unificou a autenticação e o banco de dados, eliminando vulnerabilidades anteriores de whitelist em cliente. A arquitetura atual suporta escala e modularidade para novas funcionalidades educacionais.
