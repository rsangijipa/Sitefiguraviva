# Instituto Figura Viva - Plataforma Next.js

Este projeto foi migrado para Next.js 14+ (App Router) com foco em performance, SEO e uma UX premium.

## Estrutura do Projeto

- `src/app/`: Rotas da aplicação (App Router).
  - `page.tsx`: Home pública.
  - `curso/[id]/`: Detalhes do curso.
  - `blog/[slug]/`: Detalhes do post.
  - `portal/`: Área do aluno (com login simulado).
  - `admin/`: Painel administrativo (protegido).
- `src/components/`: Componentes reutilizáveis (Navbar, Footer, CustomCursor).
- `src/context/`: Gerenciamento de estado global (AppContext).
- `src/services/`: Camada de dados (API Mock/Real).

## Funcionalidades Implementadas

- **Design System Premium**: Tailwind CSS configurado com fontes, cores e animações personalizadas.
- **Micro-interações**: Framer Motion para entradas suaves, hover effects e cursor personalizado.
- **Admin Panel**: Gestão de cursos e configurações de integração Google.
- **Integrações (Simuladas)**: Google Calendar, Drive, Forms e YouTube.
- **Responsividade**: Mobile-first com menus adaptativos e scroll-snap.
- **Certificados**: Geração de PDF com background personalizado (via `scripts/generate_bg.py`) e QR Code de validação.
- **Gamification**: Sistema de XP, Níveis e Conquistas (Badges) com regras reais de engajamento.

## Como Rodar

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

3. Acesse `http://localhost:3000`.

## Credenciais de Admin

- **Usuário**: admin
- **Senha**: admin
