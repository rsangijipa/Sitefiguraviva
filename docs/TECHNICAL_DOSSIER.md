# Dossiê Técnico Completo – Antigravity

**Data**: 20/01/2026
**Projeto**: SiteFiguraViva (Next Platform)
**Versão Analisada**: `0.1.0`

---

## 1️⃣ Visão Geral do Projeto

* **Objetivo**: Plataforma institucional e educacional para o Instituto Figura Viva, focada na divulgação de cursos, blog, galeria de memórias e conteúdo institucional (Equipe, Fundadora).
* **Público-alvo**: Alunos, parceiros e interessados em psicanálise/educação.
* **Status atual**: **Beta Funcional** (MVP avançado). A aplicação está operacional para leitura e gestão básica de conteúdo, mas apresenta vulnerabilidades de segurança e otimização pendentes antes de um lançamento público robusto.
* **Principais fluxos de negócio**:
    1. **Navegação Pública**: Visualização de Cursos, Blog, Galeria e Institucional.
    2. **Área Administrativa**: Dashboard para criação/edição/remoção de conteúdos (CMS próprio).
    3. **Portal do Aluno (Incipiente)**: Estrutura inicial presente, mas funcionalidades ainda não mapeadas completamente.

---

## 2️⃣ Stack Tecnológica Detalhada

### Frontend

* **Framework**: Next.js 16.1.1 (App Router).
* **Linguagem**: TypeScript (uso misto com JavaScript em alguns serviços).
* **Estilização**: TailwindCSS v3.4 (com variáveis CSS e Design Tokens configurados em `globals.css`).
* **Animações**: Framer Motion v12.
* **Componentes UI**: Radix UI (implícito via Lucide/Tailwind patterns), Componentes customizados (`Card`, `Button`, `Modal`) sendo unificados.

### Backend & Serviços

* **Modelo de Backend**: Serverless / Serviço (BaaS). Não há API Node.js customizada complexa; o frontend comunica-se diretamente com o Supabase.
* **Data Fetching**: Híbrido.
  * Server-Side: `serverData.ts` carrega dados iniciais na `Home`.
  * Client-Side: `AppContext.js` recarrega todos os dados na montagem (Double Fetching identificado).
  * Services: Camada de serviço (`services/*ServiceSupabase.js`) encapsula chamadas diretas ao banco.

### Banco de Dados

* **Provedor**: Supabase (PostgreSQL).
* **Estrutura Principal**:
  * `courses` (Cursos)
  * `posts` (Blog e Biblioteca)
  * `gallery` (Galeria de imagens)
  * `content` (Conteúdo estático: founder, institute, team - *inferido via código, não explícito no schema SQL inicial, possivelmente JSON ou tabelas não migradas*).
* **ORM**: Nenhum. Uso direto da SDK `@supabase/supabase-js`.

### Autenticação

* **Serviço**: Supabase Auth.
* **Método**: Email e Senha.
* **Controle de Acesso (Frontend)**: Verificação **insegura** via hardcoded whitelist no client (`authServiceSupabase.js` verifica `ALLOWED_EMAILS` array fixo no JS).
* **Controle de Acesso (Banco)**: RLS (Row Level Security) configurado, mas permissivo para escritas (`auth.role() = 'authenticated'` permite que *qualquer* usuário logado edite dados, risco crítico se o cadastro for público).

### Integrações Externas

* **Ativas**: Nenhuma integração complexa detectada no código atual.
* **Configuradas (Placeholder)**: Google Calendar, Drive, Forms e YouTube ( IDs presentes em `configService.js`, mas sem lógica de sincronização ativa detectada).
* **Ausentes**: Pagamentos (Stripe/MercadoPago), WhatsApp API (não implementados).

---

## 3️⃣ Arquitetura da Aplicação

### Organização

* **Feature-based Services**: `src/services` contém a lógica de negócios separada por contexto.
* **Monolithic Context**: `AppContext` atua como um "God Object", gerenciando estado global de *todas* as entidades.
* **Next.js App Router**: Estrutura `src/app` bem definida (`/admin`, `/blog`, `/curso`, `/portal`).

### Fluxo de Dados

1. **Server Load**: `page.tsx` chama `serverData.ts` -> Supabase -> Renderiza HTML.
2. **Client Hydration**: `HomeClient` monta -> `AppProvider` monta -> `fetchData()` chama Supabase novamente -> Atualiza Contexto.
3. **Admin Actions**: Admin UI chama funções do Contexto -> Contexto chama Services -> Supabase.

### Pontos de Acoplamento

* **Crítico**: `AppContext` está excessivamente acoplado a todos os serviços. Qualquer mudança em um serviço exige re-deploy do contexto global.

---

## 4️⃣ Estado de Persistência e Sincronização

* **Persistência Principal**: Supabase (Cloud). Dados de cursos, blog e galeria persistem corretamente.
* **Persistência Local**: `localStorage` usado apenas para configurações de UI (Google Config, Alertas).
* **Riscos**:
  * **Conflito de Estado**: O estado do `AppContext` pode divergir do servidor se houver múltiplas abas ou edições concorrentes, pois não há revalidação em tempo real (Realtime subscriptions não detectados no Contexto principal).
  * **Dados Estáticos**: Conteúdos como "Sobre a Fundadora" parecem ser salvos de forma híbrida (ou documento único no banco), o que pode ser frágil.

---

## 5️⃣ Funcionalidades Implementadas

### Funcionais

* ✅ **Cursos**: Listagem, Criação, Edição, Exclusão.
* ✅ **Blog**: Postagem, Edição, Exclusão.
* ✅ **Galeria**: Upload de imagens, legendas.
* ✅ **Administração**: Login (com email fixo), Dashboard.

### Parciais / Em Progresso

* ⚠️ **UI System**: Migração para Design Tokens e Componentes `Card`/`Button` iniciada mas não concluída em todas as seções (vide `UI_UX_REPORT.md`).
* ⚠️ **Portal do Aluno**: Estrutura de rotas existe, mas sem lógica de negócio clara.

### Ausentes / Quebradas (Não Funcionais)

* ❌ **Integração WhatsApp**: Solicitada mas inexistente no código.
* ❌ **Pagamentos**: Fluxo de checkout inexistente.
* ❌ **Segurança de Roles**: A distinção entre "Admin" e "User" é frágil (baseada em email no front-end).

---

## 6️⃣ Ambiente de Deploy

* **Plataforma**: Vercel (Inferido pela stack Next.js padrão).
* **Variáveis de Ambiente Necessárias**:
  * `NEXT_PUBLIC_SUPABASE_URL`
  * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  * `NEXT_PUBLIC_ADMIN_EMAILS` (Lista separada por vírgula para whitelist).
* **Diferenças Local vs Prod**:
  * Local usa `.env.local`.
  * Prod precisa das mesmas variáveis configuradas no painel da Vercel. Falhas comuns ocorrem se `NEXT_PUBLIC_ADMIN_EMAILS` não estiver configurado, bloqueando o login de todos os admins.

---

## 7️⃣ Análise de UI/UX Atual

* **Estética**: "Organic Premium" (Cores Gold/Paper, Fontes Serifadas).
* **Pontos Fortes**: Uso consistente de variáveis CSS recentemente implementado. Responsividade trabalhada via Tailwind.
* **Problemas**:
  * **Inconsistência**: Mistura de componentes novos (`ui/Card`) com `divs` legadas com estilos manuais.
  * **Feedback**: Feedback de carregamento ("spinner") existe, mas o "Double Fetch" pode causar "flicker" (conteúdo aparece via SSR, depois pisca quando o Context recarrega).

---

## 8️⃣ Dívida Técnica e Riscos

### 🔴 Crítico (Segurança)

* **Whitelist no Cliente**: A verificação de admin ocorre no browser (`authServiceSupabase.js`). Um atacante pode modificar o código JS localmente e acessar o painel admin (embora o RLS deva barrar a escrita, a leitura de dados sensíveis ou ações mal configuradas no banco podem vazar).
* **RLS Permissivo**: A política `auth.role() = 'authenticated'` permite alteração por *qualquer* usuário logado. Se o signup estiver aberto no Supabase, qualquer pessoa cria conta e apaga o site.

### 🟠 Médio (Performance)

* **Over-fetching**: `AppContext` carrega **tudo** (todos os cursos, todos os posts) na inicialização. Isso quebrará o app quando o conteúdo crescer (ex: 100+ posts). Falta paginação.
* **Duplicação de Requests**: A Home page carrega dados no servidor E no cliente.

### 🟡 Baixo (Manutenibilidade)

* **"Giant Context"**: `AppContext` precisa ser quebrado em `CourseContext`, `BlogContext`, etc., ou usar React Query para cache e gerenciamento de estado server-side.

---

## 9️⃣ Limitações Atuais

* **Escalabilidade**: Não suporta grande volume de dados (falta paginação/infinite scroll).
* **Vendas**: Não vende nada diretamente (apenas catálogo informacional).
* **Multiusuário**: Não está pronto para ter alunos logados interagindo (sistema de permissões imaturo).

---

## 🔟 Conclusão Técnica

A aplicação encontra-se em um estado **funcional de protótipo avançado**. A base tecnológica (Next.js + Supabase) é sólida e moderna, permitindo evolução rápida. A UI está no caminho certo com a padronização recente.

Entretanto, **não está pronta para escala comercial ou inclusão de alunos reais** devido a falhas de segurança (Roles/RLS) e arquitetura de dados (Fetch global sem paginação).

### Recomendações Imediatas (Pré-Features)

1. **Hardening de Segurança**: Mover a lógica de verificação de Admin para o Backend (Supabase Custom Claims ou Tabela de `profiles` com role). Remover whitelist do front. Ajustar RLS para checar `is_admin`.
2. **Otimização de Dados**: Implementar React Query (TanStack Query) ou SWR para substituir o fetch manual no `AppContext` e eliminar o double-fetch.
3. **Refatoração do Contexto**: Quebrar o `AppContext` monolítico.
4. **Conclusão da UI**: Finalizar a migração dos componentes visuais listados no `UI_UX_REPORT`.

Somente após esses ajustes a base estará estável para receber integrações de Pagamento e Área do Aluno.
