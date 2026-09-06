# Relatório de Refinamento UI/UX — Instituto Figura Viva

Branch: `feat/modernize-frontend` (worktree isolado `.claude/worktrees/agent-aafb1dad0ae0cfbc3`)
Commits: `12ba96c` → `1a87ab5` (5 commits incrementais)

---

## 1. Diagnóstico inicial

### Divergências entre o brief e o código real

O brief descrevia uma estrutura que **não existe** neste repositório. O mapeamento real é:

| Brief | Realidade no código |
| --- | --- |
| `src/features/awareness-tree/*`, `awareness-tree.css`, `ThemeFilter.tsx` | Não existem. A Árvore vive em `src/components/FeelingsTree.tsx` + `src/components/TreeVisualization.jsx` (Three.js) |
| Rota `src/app/recursos/arvore-da-awareness` | Não existe. Os recursos são abertos **em modal** a partir de `src/components/ResourcesSection.jsx`, na home |
| `src/components/admin/analytics/EngagementChart.tsx` | Não existe |
| `src/components/visual/FiguraVivaTree.tsx` (novo, não commitado) | **Não presente no worktree** — arquivo untracked que ficou na árvore de trabalho principal |
| Fontes Fraunces/Karla | Não carregadas. O projeto usava Cormorant Garamond + Lato |

Os quatro recursos interativos citados **existem todos**: `resources/BreathingApp.jsx` (Guia de Respiração), `FeelingsTree.tsx` (Árvore), `resources/MentalHealthQuiz.jsx` (Quiz) e `somascan/App.tsx` (SomaScan).

### Auditoria (grep completo)

- **`box-shadow` arbitrário (`shadow-[...]`)**: 14 ocorrências em 13 arquivos (AdminShell, CourseEditorClient, admin/google, admin/login, CourseDetailClient, AssessmentNavigation, LauraHero, LauraVideo, Navbar, ActivityChart, SidebarNav, ClinicalSection, ToastContext).
- **Escala de sombra do Tailwind**: 10 tokens (`soft-sm/md/lg/xl`, `premium`, `elev-1/2/3`, `glow-gold`, `inner-light`) usados em centenas de pontos.
- **`document.body.style.overflow`**: 3 escritores independentes (`ui/Modal.tsx`, `Navbar.tsx`, `layout/MobileNav.tsx`) + 1 leitor (`LenisProvider.tsx`).
- **`addEventListener('wheel')` / `'touchmove'` / `preventDefault()` global**: **zero ocorrências próprias**. A única interceptação de wheel é a da biblioteca Lenis (smooth scroll), atrás da flag `NEXT_PUBLIC_ENABLE_SMOOTH_SCROLL`.
- **`100vh` / `h-screen` / `min-h-screen`**: ~40 ocorrências, sendo a crítica `TreeVisualization.jsx:481` (`height: isModal ? '100vh'`), que estourava a janela do modal.
- **RAF sem cleanup**: `LenisProvider.tsx` e `TreeVisualization.jsx`.

---

## 2. UI / Design

- **Tokens centralizados** no `:root` de `src/app/globals.css`: `--fv-verde-raiz`, `--fv-verde-igarape`, `--fv-terra-barro`, `--fv-creme`, `--fv-areia`, `--fv-nevoa`, `--fv-mata`, `--fv-pedra`, acentos expressivos (`--fv-aurora/vazante/broto`), escala `--space-1..8` (4/8/16/24/32/48/64/96px) e raios.
- **Estratégia de alavancagem**: em vez de reescrever centenas de componentes, os *aliases legados* (`--color-primary`, `--color-paper`, `--color-surface`, `--color-text`, `--color-muted`, `--color-border`, `--color-gold`, `--color-beige`) foram **reapontados para os tokens `--fv-*`**. Toda classe `bg-paper`, `text-primary`, `border-gold` etc. já existente passou a renderizar a paleta oficial. Branco puro (`--color-surface`) virou Creme; `#171717` virou Mata.
- **Fim do box-shadow como profundidade**: os 10 tokens de elevação do `tailwind.config.js` foram neutralizados para `none`, restando apenas `shadow-overlay` (sombra funcional mínima, para overlays flutuantes). As 14 sombras arbitrárias foram removidas. `.btn-primary`, `.btn-secondary`, `.card-premium`, `.card-hover`, `.glass-panel` foram reescritos para hierarquia por **Creme sobre Areia + border 1px Névoa + espaçamento**.
- **Tipografia**: `Fraunces` (400/600/700) em `--font-serif` e `Karla` (400/500/700) em `--font-sans`, via `next/font/google` com `display: swap`. Nenhuma terceira família introduzida.
- **Namespace Tailwind `fv-*`** adicionado (`bg-fv-creme`, `text-fv-verde-raiz`, `border-fv-nevoa`…) para o código novo.
- `themeColor` do viewport migrado de `#D4AF37` para `#005A1F`.

---

## 3. Responsividade

- Hero: grid `lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]` no lugar de duas colunas iguais com `gap-20` (que esmagava o texto em 1024–1280px). Título com `max-w-[14ch]` + `text-balance`; parágrafo com `max-w-[46ch]`. `min-h-screen` → `min-h-[calc(100dvh-4rem)]`. Nenhum `transform: scale()` usado para responsividade.
- Grids com largura fixa substituídos por `auto-fill`/`auto-fit`:
  - Cards de recursos: `repeat(auto-fit, minmax(240px, 1fr))`
  - Biblioteca: `repeat(auto-fill, minmax(280px, 1fr))`
  - Galeria: `repeat(auto-fill, minmax(260px, 1fr))` (substituiu masonry por `columns-*`, que deixava buracos)
- Shell de recursos: desktop `min(1180px, calc(100vw - 48px))` × `min(780px, calc(100dvh - 48px))`; mobile full-screen `100dvh` com `env(safe-area-inset-*)`.

---

## 4. Recursos Interativos — como o shell foi implementado

`src/components/resources/ResourceExperienceShell.tsx` renderiza via `createPortal` no `document.body`:

- **Overlay** (`.fv-resource-overlay`): fundo `rgba(241,233,219,.94)` (Areia semi-opaca) no desktop; Creme **sólido** no mobile. Nunca cinza translúcido nem preto.
- **Janela** (`.fv-resource-window`): Creme, `border 1px solid Névoa`, `border-radius 24px`, `box-shadow: none`. Mobile: `100%` × `100dvh`, sem borda/raio, com safe-area insets.
- **Header** (`ResourceHeader.tsx`, 56px mobile / 64px desktop): botão Voltar, título `Recursos Interativos / <Nome>` (breadcrumb oculto em mobile via `hidden md:inline`), botão Fechar. Todos os botões `min-width/height: 44px`, com `aria-label` e `focus-visible` com outline Verde Raiz.
- **Body** (`.fv-resource-body`): `flex:1; min-width:0; min-height:0; overflow-y:auto; overscroll-behavior:contain; touch-action:pan-y`. É o **único scroll owner** do conteúdo. Marcado com `data-lenis-prevent`.
- **Estados** (`ResourceStates.tsx`): `ResourceLoader` (spinner + mensagem customizável, fundo Creme, texto Verde Raiz/Mata), `ResourceErrorState` (ícone Terra Barro + botão "Tentar novamente") e `ResourceErrorBoundary` (impede que a falha de um recurso derrube a página).
- **A11y**: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` apontando para o `<h2>` do header, focus trap com ciclagem de Tab e devolução do foco ao elemento que abriu. Fecha por X, Escape e clique no overlay (o clique só fecha se o `mousedown` nasceu no próprio overlay, evitando fechamento acidental ao arrastar a árvore 3D).
- **Code splitting**: os 4 recursos entram via `next/dynamic` com `ssr: false` e `loading` já apontando para o `ResourceLoader` com a mensagem do recurso ("Preparando a Árvore da Emoção…").

---

## 5. Árvore da Emoção

- Migrada para o shell; a experiência visual do jogo foi preservada integralmente (mesma cena, texturas, OrbitControls, gamificação de XP/nível/folhas).
- **Container**: `height: 100vh` (modo modal) → `height: 100%` com `min-height: 420px`. O `100vh` criava um segundo container de scroll dentro da janela.
- **Resize**: `ResizeObserver` no container + `window resize` + `orientationchange`, todos debounced por `requestAnimationFrame`. O resize apenas reconfigura `camera.aspect` / `updateProjectionMatrix` / `setSize(w,h,false)` e `setPixelRatio(min(dpr,2))` — o `WebGLRenderer` **nunca é recriado**. Guard para `w===0 || h===0` (evita `NaN` no aspect quando a janela abre com o body ainda em transição).
- **Cleanup**: `cancelAnimationFrame` do loop principal e do resize agendado, `resizeObserver.disconnect()`, remoção de todos os listeners, `controls.dispose()`, `renderer.dispose()` e remoção do canvas com checagem de `parentNode`.
- `FeelingsTree` em modo modal: `relative h-full min-h-[520px] overflow-hidden bg-fv-creme` (antes faltava `relative`, embora usasse filhos `absolute`).

## 6. Quiz de Saúde Mental

Existe (`src/components/resources/MentalHealthQuiz.jsx`) e foi migrado para o shell com dynamic import e loader próprio. O mesmo vale para o **Guia de Respiração** (`resources/BreathingApp.jsx`) e o **SomaScan** (`somascan/App.tsx`) — ao contrário do que o brief supunha, os três estão implementados. O conteúdo interno de cada um **não foi redesenhado** (ver Pendências).

---

## 7. Scroll — causa raiz exata

**Causa raiz nº 1 (principal): três escritores independentes de `document.body.style.overflow`, sem contagem de locks.**

- `src/components/ui/Modal.tsx:33-41`
- `src/components/Navbar.tsx:60-68`
- `src/components/layout/MobileNav.tsx:29-36`

Todos faziam `= "hidden"` ao abrir e `= "unset"` ao fechar **e no cleanup do efeito**. Consequências reais:

1. Com dois overlays simultâneos (menu mobile aberto → usuário toca num card de recurso → modal abre), o fechamento/desmontagem do primeiro escrevia `unset` e **liberava o scroll da página por trás enquanto o modal ainda estava aberto**.
2. Na ordem inversa de desmontagem, o cleanup de um efeito rodava *depois* do `hidden` do outro, deixando um `overflow:hidden` **órfão** no body — página permanentemente travada até um reload.
3. `"unset"` (e não o valor inline anterior) apagava qualquer `overflow` que a página tivesse definido legitimamente.
4. Nenhum dos três preservava o `scrollTop`: em iOS Safari, `overflow:hidden` no body não trava o scroll, e ao fechar o usuário era jogado para o topo.

**Correção**: `src/hooks/useBodyScrollLock.ts` — contador global de locks. Só trava na transição 0→1 e só destrava na 1→0; salva e restaura os estilos inline anteriores (`overflow`, `position`, `top`, `left`, `right`, `width`) e o `scrollY` original; usa `position: fixed` + `top: -scrollY` (único método confiável no iOS); compensa a largura da scrollbar para não haver "pulo" de layout; aplica a classe `fv-scroll-locked` no body como sinal público do lock. Os três componentes agora chamam apenas `useBodyScrollLock(isOpen)`.

**Causa raiz nº 2: `LenisProvider` vazava um loop de `requestAnimationFrame`.**

`src/components/providers/LenisProvider.tsx` fazia `requestAnimationFrame(raf)` recursivamente sem guardar o id; o cleanup chamava `lenis.destroy()` mas o loop continuava rodando indefinidamente sobre uma instância destruída. Além disso, sua detecção de lock lia `getComputedStyle(document.body).overflow === "hidden"`, o que colidia com o `overflow-x: hidden` que o próprio `<body>` já tem no layout raiz — em alguns navegadores o computed shorthand fazia o Lenis parar/reiniciar em loop via MutationObserver. Corrigido: id do RAF guardado e cancelado no cleanup; detecção passou a ser pela classe `fv-scroll-locked` (ou `lenis-stopped`), sem consultar computed style.

**Causa raiz nº 3: nested scroll containers no modal de recursos.**

`ModalContent` tinha `overflow-hidden` + `max-h-[90vh]`, `ModalBody` tinha `overflow-y-auto`, e dentro deles `TreeVisualization` usava `height: 100vh` e `SomaScan` `min-h-[80vh]` — três alturas concorrentes disputando o mesmo eixo. Corrigido pelo shell, que define **um único** scroll owner (`.fv-resource-body`) com `overscroll-behavior: contain` (impede scroll-chaining para a página) e `touch-action: pan-y`.

**Não encontrado**: nenhum `addEventListener('wheel'|'touchmove')` próprio nem `preventDefault()` global. Nada foi introduzido nesse sentido.

---

## 8. Acessibilidade

- Focus trap + Escape + devolução de foco: shell de recursos e menu mobile do Navbar.
- `role="dialog"` / `aria-modal` / `aria-labelledby` no shell; `aria-label` no overlay do menu; `aria-haspopup="dialog"` nos cards.
- Alvos de toque ≥ 44×44px: botões do shell, hambúrguer e fechar do Navbar, `Input` compartilhado, botões de auth, itens da sidebar admin, FAB do admin.
- `focus-visible` explícito (outline 2px Verde Raiz + offset) em todo componente novo ou tocado; nenhum `outline: none` sem substituto foi introduzido.
- Texto secundário passou a usar **`--fv-pedra` sólido** no lugar de `text-white/60`, `text-text/80`, `opacity-80` — evita falhas de contraste imprevisíveis sobre fundos variáveis.
- `aria-current="page"` no item ativo da sidebar admin, com **barra lateral em Vazante** como indicador adicional à cor (não depender só do verde).
- Imagens da galeria: `alt` com fallback descritivo, `loading="lazy"`, `decoding="async"`, `aspect-ratio` fixo e handler de erro.
- `prefers-reduced-motion` respeitado em todas as animações novas (`.fv-resource-card`, `.fv-resource-icon-btn`, `.fv-resource-spinner`) além da regra global já existente.

---

## 9. Performance

- Os 4 recursos interativos (Three.js, canvas, áudio, chamadas de IA) saíram do bundle inicial da home: `next/dynamic` com `ssr:false` para cada um. Antes, `ResourcesSection` importava os quatro estaticamente.
- `TreeVisualization`: RAF cancelado no unmount (era o vazamento mais caro — um loop de render Three.js sobrevivia a cada abertura/fechamento da árvore), `setPixelRatio` limitado a 2, resize debounced por RAF, todos os listeners e recursos GPU liberados.
- `LenisProvider`: RAF cancelado no unmount.
- Remoção de dezenas de `box-shadow` de grande raio de desfoque em elementos animados (`shadow-2xl`, `shadow-[0_80px_150px…]`), que são caros para o compositor durante transforms.

---

## 10. Arquivos modificados

| Arquivo | Alteração | Justificativa |
| --- | --- | --- |
| `src/hooks/useBodyScrollLock.ts` | **Novo** | Causa raiz nº 1 do bug de scroll |
| `src/hooks/useFocusTrap.ts` | **Novo** | Focus trap reutilizável para dialogs e menu |
| `src/components/resources/ResourceExperienceShell.tsx` | **Novo** | Janela padronizada de recursos |
| `src/components/resources/ResourceHeader.tsx` | **Novo** | Cabeçalho do shell |
| `src/components/resources/ResourceStates.tsx` | **Novo** | Loader, erro e error boundary |
| `src/app/globals.css` | Tokens `--fv-*` no `:root`; aliases legados reapontados; CSS do shell, dos estados e dos cards; utilitários sem sombra | Fonte única de verdade do DS |
| `tailwind.config.js` | Namespace `fv.*`; tokens de sombra → `none`; `shadow-overlay` mantido | Elimina sombra em massa sem editar centenas de arquivos |
| `src/app/layout.tsx` | Cormorant/Lato → Fraunces/Karla; `themeColor` Verde Raiz | Tipografia do DS |
| `src/components/ui/Modal.tsx` | Usa `useBodyScrollLock` | Bug de scroll |
| `src/components/Navbar.tsx` | `useBodyScrollLock`, focus trap, Escape, fechar por rota, overlay creme, alvos 44px, sombras removidas | Bug de scroll + item 6 do brief |
| `src/components/layout/MobileNav.tsx` | Usa `useBodyScrollLock` | Bug de scroll |
| `src/components/providers/LenisProvider.tsx` | RAF cancelado; detecção de lock por classe | Vazamento + falso positivo de lock |
| `src/components/ResourcesSection.jsx` | Reescrito: shell, dynamic imports, grid auto-fit, cards uniformes | Itens 2, 4 e 5 do brief |
| `src/components/TreeVisualization.jsx` | RAF cancelado, ResizeObserver, sem 100vh, dispose completo | Item 3 do brief |
| `src/components/FeelingsTree.tsx` | Modo modal ancorado ao shell, cores em tokens | Item 3 |
| `src/components/sections/HeroSection.tsx` | Proporção, largura de texto, Fraunces/Verde Raiz, CTAs 56px, sem sombras | Item 7 |
| `src/components/ui/Input.tsx` | 44px, foco Verde Raiz, border Névoa, 16px no mobile | Itens 8 e 10 |
| `src/app/auth/page.tsx` | Botões 44px, foco visível, tokens | Item 8 |
| `src/app/public-library/LibraryClient.tsx` | Grid `auto-fill minmax(280px,1fr)` | Item 8 |
| `src/app/public-gallery/GalleryClient.tsx` | Grid `auto-fill`, `aspect-ratio`, lazy, alt, fallback | Item 8 |
| `src/app/admin/(protected)/AdminShell.tsx` | Item ativo com barra Vazante + `aria-current`, 44px, sem sombras | Itens 9 e 10 |
| `CourseEditorClient`, `admin/google`, `admin/login`, `CourseDetailClient`, `AssessmentNavigation`, `LauraVideo`, `ActivityChart`, `SidebarNav`, `ClinicalSection`, `ToastContext` | Remoção de `shadow-[...]` arbitrário | Regra crítica do DS |

## 11. Componentes novos

| Componente | Responsabilidade |
| --- | --- |
| `ResourceExperienceShell` | Janela padronizada de recurso: portal, overlay, dimensões, scroll owner, a11y (dialog/trap/Escape/overlay), suspense e error boundary |
| `ResourceHeader` | Barra superior do shell: voltar, breadcrumb + nome, fechar; alvos 44px |
| `ResourceLoader` | Estado de carregamento com mensagem por recurso, fundo Creme |
| `ResourceErrorState` | Estado de erro com retry |
| `ResourceErrorBoundary` | Isola falhas de recurso dentro do shell |
| `useBodyScrollLock` | Lock de scroll com contador global, restauração de estilos e de `scrollTop` |
| `useFocusTrap` | Focus trap com ciclagem de Tab e devolução de foco |

---

## 12. Testes

**Validado automaticamente:**
- `npx tsc --noEmit`: sem novos erros. Restam **apenas 2 erros pré-existentes** (`@google/generative-ai` não resolvido em `src/app/actions/chat-laura.ts` e `src/app/actions/somascan.ts`) — o pacote está declarado no `package.json` mas o diretório `node_modules/@google/` do ambiente está vazio. Esses mesmos erros já existiam antes de qualquer alteração minha.
- `npm run build`: falha **exclusivamente** nos mesmos 2 `Module not found` acima. Nenhum erro novo de webpack, CSS/Tailwind ou React foi introduzido.
- `npx eslint` nos arquivos novos e tocados: limpo.
- `husky` + `lint-staged` (eslint --fix + prettier) rodaram com sucesso em todos os 5 commits.

**Validação manual pendente** (sem acesso a navegador real nesta sessão):
- Abrir/fechar cada um dos 4 recursos e confirmar que o scroll da página é restaurado na posição original.
- Abrir menu mobile e, com ele aberto, abrir um recurso: confirmar que o scroll segue travado até o último overlay fechar.
- Rotação de tela com a Árvore aberta (`orientationchange` + `ResizeObserver`).
- iOS Safari: `100dvh` e `env(safe-area-inset-*)` no shell em tela cheia.
- Contraste real de Terra Barro (#96551F) sobre Creme e de Pedra (#6B6B63) sobre Areia — a razão calculada passa AA para texto normal, mas convém conferir com ferramenta.
- Regressão visual ampla: a troca de fontes e o reapontamento dos aliases de cor afetam **todas** as páginas; é uma mudança de alto alcance por design, mas merece varredura visual página a página.

---

## 13. Antes × Depois

| Dimensão | Antes | Depois |
| --- | --- | --- |
| Scroll lock | 3 componentes escrevendo `body.style.overflow` direto; conflito e travamento órfão | 1 hook com contador global, restaura estilos e `scrollTop` |
| Lenis | RAF vazando após `destroy()`; lock detectado por computed style | RAF cancelado; lock por classe explícita |
| Profundidade visual | 10 tokens de sombra + 14 sombras arbitrárias + glassmorphism | Creme sobre Areia + border Névoa + espaço; 1 sombra funcional |
| Paleta | `#ffffff`, `#171717`, `#0e6330`, dourado `#D4AF37`, opacidades variadas | Tokens `--fv-*`, sem preto/branco puros, texto secundário sólido |
| Tipografia | Cormorant Garamond + Lato | Fraunces (600/700) + Karla |
| Recursos interativos | 4 imports estáticos no bundle da home; modal genérico com 2 botões de fechar sobrepostos e alturas concorrentes | 4 `dynamic(ssr:false)`; shell único com header padronizado e um só scroll owner |
| Árvore 3D | `100vh` dentro do modal; RAF nunca cancelado; resize só por `window.resize` | `100%` + `min-height`; RAF cancelado; `ResizeObserver` + `orientationchange` sem recriar renderer |
| Cards de recursos | Carrossel horizontal + grid 1/2/4 com larguras fixas `w-80`; alturas desiguais; `hover:shadow-xl` | `auto-fit minmax(240px,1fr)`; alturas iguais; hover por background/border/-2px com `prefers-reduced-motion` |
| Grids de conteúdo | `md:grid-cols-2 lg:grid-cols-3` e masonry por `columns-*` (buracos) | `auto-fill minmax()` |
| Menu mobile | Overlay `bg-primary/20`; sem focus trap nem Escape | Overlay `rgba(253,250,244,.96)`; focus trap, Escape, clique externo, fechar por rota |

---

## 14. Pendências

Honestamente, dos ~38 itens do brief original, o que **não** foi coberto:

1. **`src/components/visual/FiguraVivaTree.tsx`** — arquivo untracked que não chegou ao worktree isolado. Não pôde ser inspecionado nem integrado ao Hero. **Bloqueado por ambiente.**
2. **Interior dos 4 recursos** — o shell e a moldura foram padronizados, mas o conteúdo de `BreathingApp`, `MentalHealthQuiz` e `SomaScan` ainda usa `bg-white`, `text-stone-*` e sombras próprias. Precisam de uma passada de tokens individual.
3. **Footer** — não recebeu passada dedicada de tokens/grid (herdou a paleta pelos aliases, mas o grid `md:grid-cols-12` e as opacidades `border-paper/10` seguem como estavam).
4. **Portal do aluno** — herdou a paleta pelos aliases; sombras arbitrárias removidas em `ActivityChart` e `SidebarNav`, mas não houve revisão de layout/estados vazios.
5. **Admin além da sidebar** — topbar, badges e tabelas ainda não receberam os tokens explicitamente (só herança via aliases + remoção de sombras).
6. **Blog, Curso, Instituto, Formações** — não receberam revisão dedicada.
7. **`LauraHero.tsx`** — mantida a `shadow-[inset_0_0_80px…]`, por ser sombra *interna* decorativa de moldura de imagem, não elevação de card. Avaliação de bom senso; pode ser removida se o DS for estrito.
8. **Estados vazios/erro consistentes** fora do shell de recursos (biblioteca, galeria, portal) — não unificados.
9. **Testes automatizados** — nenhum teste novo foi escrito para `useBodyScrollLock`/`useFocusTrap`. Seria valioso um teste de contagem de locks com dois overlays.
10. **Build verde** — bloqueado pelo `@google/generative-ai` ausente no `node_modules` do ambiente (problema pré-existente, não introduzido aqui). Um `npm install` deve resolver.

A prioridade adotada foi: **corrigir a causa raiz do scroll e entregar o shell de recursos com qualidade real**, em vez de tocar superficialmente em todas as páginas.
