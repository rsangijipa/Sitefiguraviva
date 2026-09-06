# Public Site Visual Modernization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reaplicar seletivamente sobre o `main` local a modernização visual pública da branch remota, criando páginas institucionais e uma homepage mais compacta sem alterar backend, EAD, admin ou contratos de dados.

**Architecture:** A camada pública será composta por componentes de apresentação puros, páginas server-side que reutilizam loaders atuais e um componente client-side isolado para a árvore SVG. A branch remota serve apenas como referência; nenhum merge integral será feito.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, SVG, Jest/Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-06-public-site-visual-modernization-design.md`

## Global Constraints

- O `main` local é a fonte de verdade para dados, autenticação, EAD, administração, regras de negócio e integrações.
- Não alterar ações de servidor, APIs, autenticação, billing, uploads, progresso, gamificação, migrations ou regras de acesso.
- Usar a fonte de dados atual para cursos, biblioteca, galeria e blog.
- Animações respeitam `prefers-reduced-motion`, não usam WebGL e não criam layout shift.
- Toda rota nova possui metadata própria e permanece compatível com o sitemap.

---

### Task 1: estabelecer branch e inventário de referência

**Files:**
- Create: `docs/superpowers/plans/2026-09-06-public-site-visual-modernization.md`
- Modify: nenhum arquivo de runtime.

- [ ] **Step 1: Confirmar base local e arquivos públicos permitidos**

Run: `git status --short; git diff --name-only main...origin/feat/modernize-frontend -- src/app/page.tsx src/components/HomeClient.tsx src/components/Navbar.tsx src/components/Footer.tsx src/components/sections/HeroSection.tsx src/components/visual/FiguraVivaTree.tsx`

Expected: somente arquivos públicos listados são considerados referência; alterações de backend permanecem fora do escopo.

- [ ] **Step 2: Criar branch de feature a partir do estado atual**

Run: `git switch -c codex/public-site-modernization`

Expected: branch criada sem merge da branch remota.

### Task 2: componente de moldura e hero público

**Files:**
- Create: `src/features/public-site/components/PublicSiteFrame.tsx`
- Create: `src/features/public-site/components/PublicPageHero.tsx`
- Modify: `src/components/sections/HeroSection.tsx`
- Modify: `src/components/HomeClient.tsx`
- Test: `src/features/public-site/__tests__/PublicPageHero.test.tsx`

- [ ] **Step 1: Escrever teste do hero**

```tsx
it("renders title, description and actions with accessible heading", () => {
  render(<PublicPageHero title="Instituto Figura Viva" description="Presença e encontro." />);
  expect(screen.getByRole("heading", { level: 1, name: "Instituto Figura Viva" })).toBeInTheDocument();
  expect(screen.getByText("Presença e encontro.")).toBeInTheDocument();
});
```

- [ ] **Step 2: Implementar componentes sem acesso a dados**
  - `PublicSiteFrame` compõe Navbar, skip-link, `<main id="main-content">` e Footer.
  - `PublicPageHero` aceita `eyebrow`, `title`, `description`, `actions`, `visual` e aplica máscara de contraste.

- [ ] **Step 3: Compactar hero existente**
  - Remover selo superior redundante.
  - Usar o novo título institucional.
  - Manter CTAs atuais e preservar callbacks/links existentes.

- [ ] **Step 4: Rodar teste**

Run: `npx jest src/features/public-site/__tests__/PublicPageHero.test.tsx --runInBand`

Expected: PASS.

### Task 3: árvore interativa SVG

**Files:**
- Create: `src/components/visual/FiguraVivaTree.tsx`
- Create: `src/components/visual/__tests__/FiguraVivaTree.test.tsx`
- Modify: `src/components/sections/HeroSection.tsx`

- [ ] **Step 1: Escrever teste de acessibilidade e redução de movimento**

```tsx
it("is decorative by default and exposes a title when provided", () => {
  const { rerender } = render(<FiguraVivaTree />);
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
  rerender(<FiguraVivaTree title="Árvore Figura Viva" />);
  expect(screen.getByRole("img", { name: "Árvore Figura Viva" })).toBeInTheDocument();
});
```

- [ ] **Step 2: Implementar SVG isolado**
  - Usar `viewBox` estável, camadas de galhos e folhas, baixa opacidade e `pointer-events` limitados ao wrapper.
  - Normalizar ponteiro em `[-1, 1]` e aplicar deslocamento máximo de 8px via `transform`.
  - Pausar com `IntersectionObserver`, `visibilitychange`, pointer coarse e `prefers-reduced-motion`.

- [ ] **Step 3: Integrar no hero**
  - Posicionar árvore no lado direito em desktop, recortada em tablet e reduzida em mobile.
  - Garantir máscara/gradiente atrás do texto e CTAs.

- [ ] **Step 4: Rodar teste**

Run: `npx jest src/components/visual/__tests__/FiguraVivaTree.test.tsx --runInBand`

Expected: PASS.

### Task 4: navegação e footer

**Files:**
- Create: `src/features/public-site/content/navigation.ts`
- Modify: `src/components/Navbar.tsx`
- Modify: `src/components/Footer.tsx`
- Create: `src/components/__tests__/public-navigation.test.tsx`

- [ ] **Step 1: Escrever teste de rotas públicas**

```tsx
it("contains all public destinations", () => {
  expect(PUBLIC_NAV_ITEMS.map((item) => item.href)).toEqual(expect.arrayContaining([
    "/instituto", "/instituto/fundadora", "/formacoes", "/recursos", "/public-library", "/public-gallery", "/blog",
  ]));
});
```

- [ ] **Step 2: Implementar configuração única de navegação**
  - Separar Explorar, Conteúdos, Serviços e Conta.
  - Menu mobile usa `aria-expanded`, foco visível, escape e alvos mínimos de 44px.

- [ ] **Step 3: Reorganizar footer**
  - Colunas Explorar, Institucional e Contato.
  - Linha legal com privacidade, termos e acessibilidade.
  - Manter links e dados de contato existentes.

- [ ] **Step 4: Rodar teste**

Run: `npx jest src/components/__tests__/public-navigation.test.tsx --runInBand`

Expected: PASS.

### Task 5: páginas institucionais e recursos

**Files:**
- Create: `src/app/instituto/page.tsx`
- Create: `src/app/instituto/fundadora/page.tsx`
- Create: `src/app/formacoes/page.tsx`
- Create: `src/app/recursos/page.tsx`
- Modify: `src/app/sitemap.ts`
- Create: `src/app/instituto/__tests__/pages.test.tsx`

- [ ] **Step 1: Escrever teste de metadata e headings**

```tsx
it("exposes institutional page content without direct data access in UI components", async () => {
  const page = await InstitutePage();
  expect(page).toBeTruthy();
});
```

- [ ] **Step 2: Criar `/instituto`**
  - Compor manifesto, essência, valores, território e CTA para fundadora.
  - Usar loaders/hooks existentes apenas no nível da página quando necessário.

- [ ] **Step 3: Criar `/instituto/fundadora`**
  - Conteúdo editorial, trajetória, atuação, frase destacada e fallback de imagem.

- [ ] **Step 4: Criar `/formacoes` e `/recursos`**
  - `/formacoes` reutiliza o catálogo atual e não cria contrato de banco.
  - `/recursos` organiza quizzes, árvores e atividades existentes com aviso educativo persistente.

- [ ] **Step 5: Atualizar sitemap e metadata**
  - Incluir rotas novas com canonical, description e Open Graph.

- [ ] **Step 6: Rodar testes**

Run: `npx jest src/app/instituto/__tests__/pages.test.tsx --runInBand`

Expected: PASS.

### Task 6: catálogo, imagens e responsividade pública

**Files:**
- Create: `src/components/public/EditorialImage.tsx`
- Modify: `src/app/curso/page.tsx`
- Modify: `src/app/public-library/LibraryClient.tsx`
- Modify: `src/app/public-gallery/GalleryClient.tsx`
- Test: `src/components/public/__tests__/EditorialImage.test.tsx`

- [ ] **Step 1: Escrever teste de fallback**

```tsx
it("keeps stable media frame and meaningful alt text", () => {
  render(<EditorialImage src="/missing.jpg" alt="Capa da formação" fallback="botanical" />);
  expect(screen.getByAltText("Capa da formação")).toBeInTheDocument();
});
```

- [ ] **Step 2: Implementar `EditorialImage`**
  - Reservar proporção fixa, fallback botânico e suporte a imagem decorativa.

- [ ] **Step 3: Integrar cards públicos**
  - Aplicar no catálogo, biblioteca e galeria sem alterar dados.
  - Confirmar leitura em 375px, 768px, 1024px e 1440px.

- [ ] **Step 4: Rodar teste**

Run: `npx jest src/components/public/__tests__/EditorialImage.test.tsx --runInBand`

Expected: PASS.

### Task 7: verificação final

**Files:**
- Modify: apenas correções encontradas durante verificação.

- [ ] **Step 1: Rodar suíte completa**

Run: `npm test -- --runInBand`

- [ ] **Step 2: Rodar qualidade estática**

Run: `npm run lint; npm run typecheck; npm run build`

- [ ] **Step 3: Rodar smoke visual**

Run: `npx playwright test e2e/public-visual-contracts.spec.ts --project=chromium`

Expected: rotas públicas carregam, sem overflow horizontal, links principais presentes e árvore não cobre CTAs.

- [ ] **Step 4: Confirmar isolamento de escopo**

Run: `git diff --name-only main...HEAD`

Expected: somente arquivos públicos, estilos, assets públicos, metadata, sitemap e testes relacionados; nenhum arquivo de backend ou domínio alterado.
