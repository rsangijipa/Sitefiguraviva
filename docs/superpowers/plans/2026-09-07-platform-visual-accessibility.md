# Plataforma Visual e Acessibilidade — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Recuperar profundidade visual, legibilidade, navegação por teclado e controles consistentes em toda a plataforma, além de modernizar a Árvore das Emoções e o Quiz.

**Architecture:** O trabalho será dividido em camadas independentes. Tokens e utilitários globais ficam em `globals.css`; controles persistentes ficam em um componente reutilizável; cada recurso mantém seu estado e CSS escopados. Nenhuma API, persistência, autenticação ou regra de negócio será alterada.

**Tech Stack:** Next.js 15, React, TypeScript, Tailwind CSS, CSS escopado, Jest/Testing Library e Playwright.

**Spec:** Requisitos definidos nesta conversa e referência visual fornecida pelo usuário.

## Global Constraints

- Não alterar contratos de dados, APIs, Supabase, autenticação ou rotas.
- Respeitar `prefers-reduced-motion` e evitar autoplay de áudio não autorizado pelo navegador.
- Garantir foco visível, ordem de tabulação lógica e alvos de toque de no mínimo 44px.
- Preservar alterações locais existentes e editar apenas arquivos necessários.

### Task 1: Sistema visual global

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/components/Footer.tsx`
- Modify: `src/components/sections/FAQSection.tsx`
- Test: `tests/accessibility/public-contracts.test.tsx`

- [ ] Confirmar tokens RGB, superfícies e sombras aplicados às classes com opacidade.
- [ ] Adicionar uma sombra/borda sutil para cards, modais e separações de seção.
- [ ] Compactar o rodapé sem remover links ou informações.
- [ ] Adicionar borda e estado de foco aos itens do FAQ.
- [ ] Validar contraste e contratos públicos.

### Task 2: Controles globais de acessibilidade

**Files:**
- Create: `src/components/ui/BackToTopButton.tsx`
- Modify: `src/components/ui/FloatingControls.tsx`
- Modify: `src/components/HomeClient.tsx`
- Test: `src/components/ui/__tests__/BackToTopButton.test.tsx`

- [ ] Implementar botão voltar ao topo após rolagem, com `aria-label`, foco visível e redução de movimento.
- [ ] Garantir que o botão de tema continue acessível e tenha estado claro/escuro legível.
- [ ] Integrar o controle global nas páginas públicas sem duplicar botões.

### Task 3: Árvore das Emoções

**Files:**
- Modify: `src/components/FeelingsTree.tsx`
- Modify: `src/components/resources/ResourceAppFrame.tsx`
- Modify: `src/components/ResourcesSection.jsx`
- Create: `public/audio/forest-birds.mp3` somente se houver asset local aprovado; caso contrário usar controle sem áudio até asset existir.
- Test: `src/components/resources/apps/__tests__/app-shell-contract.test.tsx`

- [ ] Fazer o painel de instruções iniciar fechado.
- [ ] Tornar botões sólidos, mais escuros e legíveis.
- [ ] Reorganizar painel em título, explicação, ações e filtros compactos.
- [ ] Agrupar “Receber mensagem” e “Nova árvore” em uma área discreta.
- [ ] Transformar o prompt da folha em chip delicado no topo.
- [ ] Adicionar som ambiente somente após ação explícita do usuário, com mute e suporte a reduced motion.

### Task 4: Quiz

**Files:**
- Modify: `src/components/Quiz/components/AppHeader.tsx`
- Modify: `src/components/Quiz/pages/Home.tsx`
- Modify: `src/components/Quiz/components/QuizCard.tsx`
- Modify: `src/components/Quiz/components/QuizEngine.tsx`
- Modify: `src/components/Quiz/index.css`
- Test: `src/components/Quiz/components/__tests__/QuizEngine.test.tsx`

- [ ] Remover o branding superior sem eliminar o espaço do botão fechar.
- [ ] Transformar a home em card único com sombra e itens empilhados.
- [ ] Inserir explicação da origem/objetivo antes da primeira pergunta.
- [ ] Separar visualmente o progresso e arredondar pergunta, respostas e botão continuar.
- [ ] Avançar automaticamente após seleção de resposta, preservando resultado e acessibilidade.

### Task 5: Validação integrada

**Files:**
- Test: `tests/accessibility/public-contracts.test.tsx`
- Test: `e2e/smoke.spec.ts`

- [ ] Rodar lint e typecheck.
- [ ] Rodar testes unitários focados.
- [ ] Rodar E2E nas rotas `/`, `/recursos`, `/recursos/arvore-da-awareness` e `/formacoes`.
- [ ] Conferir desktop/mobile, dark mode, tabulação e ausência de regressões funcionais.

