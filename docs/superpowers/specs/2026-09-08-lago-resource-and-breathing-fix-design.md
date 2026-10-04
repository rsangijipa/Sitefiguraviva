# Lago como recurso + correção do Guia de Respiração

Data: 2026-09-08

## Contexto

O site Figura Viva expõe experiências interativas em `/recursos`
(`src/components/ResourcesSection.jsx`), cada uma portada de um app React/Vite
standalone para `src/components/resources/apps/<nome>/` e aberta dentro de
`ResourceModalShell` + `ResourceAppFrame`. Hoje existem: Guia de Respiração,
Árvore da Awareness, SomaScan e Banco de Quizzes.

Há um app standalone adicional em `C:\Users\aless\Downloads\lago` — uma
simulação de lago em WebGL (ondulações, carpas koi, folhas, chuva, cáusticas)
construída com React 19 + Vite + Tailwind 4 + `motion`, sem backend.

Separadamente, o Guia de Respiração (`src/components/resources/apps/breathing/`)
tem uma animação quebrada: a mandala de respiração não segue o ritmo correto.

## Parte 1 — Portar o Lago como recurso

### Origem → destino

Copiar de `C:\Users\aless\Downloads\lago\src\` para
`src/components/resources/apps/lago/` no projeto Next.js:

- `App.tsx` → `LagoApp.tsx` (renomeado para evitar colisão de nome genérico
  "App" ao lado dos outros apps já convertidos, seguindo o padrão do SomaScan)
- `components/PondCanvas.tsx`, `components/PondControls.tsx`,
  `components/LoadingScreen.tsx`
- `webgl/riverbedTexture.ts`, `webgl/shaders.ts`, `webgl/waterSim.ts`
- `simulation/floatingLeaves.ts`, `simulation/koiFish.ts`
- `audio/waterSound.ts`
- `types.ts`

Não portar: `metadata.json`, `index.html`, `main.tsx`, `vite.config.ts`,
`index.css` (substituído por classes/estilos escopados ao componente, ver
abaixo), e a dependência `@google/genai` do `package.json` original — não é
referenciada em nenhum arquivo de código-fonte do app, então não é adicionada
ao projeto principal.

### Adaptação de layout

`App.tsx` usa `<main className="w-screen h-screen ...">`. Dentro do modal isso
deve virar `w-full h-full` preenchendo o container fornecido por
`ResourceAppFrame`/`ResourceModalShell`. `PondCanvas` já dimensiona o canvas
via `canvas.clientWidth/clientHeight` (não via `window.innerWidth/Height`),
então a mudança é segura sem tocar no WebGL.

`ResourceAppFrame` precisa de uma altura mínima para o lago (o app é
tipicamente tela cheia). Seguir o padrão já usado pelo SomaScan
(`min-h-[min(68vh,620px)] sm:min-h-[min(60vh,560px)]`) para o wrapper do lago.

### Retema de UI para o tema claro do site

Escopo confirmado: só os painéis de UI (header flutuante, painel de
controles, modal "Sobre"), não o canvas/simulação em si (que continua com sua
estética aquática original — dia/entardecer/noite conforme o controle
existente).

Trocar nos componentes `LagoApp.tsx` e `PondControls.tsx`:
- `bg-slate-900/70 backdrop-blur-md border-slate-700/50` → `bg-white/90
  backdrop-blur-md border-stone-100` (mesmo padrão de superfícies flutuantes
  usado no site, ex. cards de `ResourcesSection`)
- Texto `text-slate-100`/`text-slate-400` → `text-primary`/`text-text/60`
- Botões de ícone: `text-slate-400 hover:text-white` → `text-text/60
  hover:text-primary`
- Modal "Sobre o Lago": `bg-slate-900/98 border-slate-700/80 text-slate-200`
  → `bg-white border-stone-100 text-text`, título em `text-primary`
- Botão primário do modal (`bg-cyan-500 text-slate-950`) → `bg-accent
  text-white` (cor de destaque padrão de CTA no site, mesma usada nos outros
  recursos)
- CSS customizado necessário (thumb do range slider, keyframes de
  ring-pulse/koi-swim/float-particle usados pelos componentes) migra de
  `index.css` para um bloco `<style jsx>` ou classe utilitária adicionada a
  `src/app/globals.css` sob um namespace (`.lago-app ...`) para não vazar
  estilos para o resto do site.

### Card na página de Recursos

Em `ResourcesSection.jsx`, adicionar um 5º card (entre Respiração e Árvore,
ou ao final — manter a ordem atual e acrescentar ao final para minimizar
diff) com:
- Ícone `Waves` (lucide-react), cor `sage` (mesma paleta de destaque do card
  do Quiz), seguindo exatamente a estrutura Tailwind dos cards existentes.
- Título: "Lago"
- Descrição (nova, curta): "Um lago vivo em WebGL — toque a água, alimente
  as carpas, sinta a calma se espalhar."
- CTA: "Entrar no Lago"
- `onClick={() => openResource("lago")}`

Em `ResourceModalShell`/`ResourceAppFrame`, adicionar o branch
`activeResource === "lago"` com título "Lago", renderizando
`<LagoApp />` dentro de `<div className="resource-app resource-app--light">`
(mesmo wrapper usado por Respiração/SomaScan, já que a UI agora é clara).

## Parte 2 — Corrigir e redesenhar o Guia de Respiração

### Bug raiz confirmado

`src/components/resources/apps/breathing/constants.js` define as técnicas
com as chaves `inhaleTime`, `holdTime`, `exhaleTime`, `holdPostExhaleTime`
(em milissegundos). `BreathingAnimation.jsx` lê
`technique.inhaleDuration`, `technique.holdDuration`,
`technique.exhaleDuration`, `technique.holdAfterExhale` (nomes diferentes,
em segundos) — chaves que não existem no objeto de técnica. O resultado é
`undefined * 1000 = NaN` passado a `setTimeout`, que o navegador trata como
atraso ~0, fazendo o ciclo de fases rodar quase instantaneamente em vez de
seguir o tempo real da técnica.

Correção: unificar os nomes. Optamos por manter as chaves de
`BreathingAnimation.jsx` (`inhaleDuration`, `holdDuration`,
`exhaleDuration`, `holdAfterExhale`, valores em segundos, mais legível) e
atualizar `constants.js` para usar esses nomes com valores em segundos
(ex.: `inhaleTime: 4000` → `inhaleDuration: 4`).

### Nova mandala (infla/desinfla no ritmo da respiração)

Substituir o `Mandala` atual (5 anéis independentes com `animation: spin`
em CSS puro rodando sempre, desacoplado do ciclo de respiração) por uma
mandala compacta cujo tamanho responde diretamente à fase:

- Um único elemento central (círculo/mandala com 1-2 camadas de pétalas, não
  5) cuja escala anima suavemente entre um raio mínimo (fase `exhale`/`wait`)
  e máximo (fase `inhale`/`hold`) usando `motion.div` com
  `animate={{ scale }}` e `transition={{ duration: <segundos da fase atual>,
  ease: "easeInOut" }}` — a duração da transição passa a ser dirigida pela
  máquina de estados corrigida, então a inflação/deflação visualmente dura
  exatamente o tempo da fase (inspiração de 4s infla em 4s, etc.).
- Uma rotação lenta e contínua (mantida) para dar vida ao padrão, mas
  independente da escala — não deve competir visualmente com o
  inflar/desinflar, que é o indicador principal do ritmo.
- Remover `filter: hue-rotate` por camada e `mixBlendMode` (custo visual
  alto, pouco valor perceptível) — manter um único gradiente de tema por
  técnica (já existente: verde para 4-6, terracota para pursed-lips).

### Compactação de layout

- Tamanho da mandala: reduzir do atual 500px desktop / 280px mobile para
  ~220px desktop / ~160px mobile.
- Reduzir o espaço vertical entre mandala, texto de instrução e `TimerRing`
  em `renderActiveSession` (paddings/margins), para caber com folga em
  `ResourceModalShell` (`max-h-[min(92vh,900px)]`) sem depender de scroll
  interno na maioria das resoluções.
- `TimerRing` mantém 120px de raio (não faz parte do bug), mas ajusta o
  `gap`/margin ao redor para acompanhar a mandala menor.

## Fora de escopo

- Áudio do lago (`waterSound.ts`) é portado como está, sem novos controles
  de acessibilidade além dos já existentes no app original.
- Não altera as duas técnicas de respiração existentes além de renomear
  chaves (nenhuma nova técnica, nenhuma mudança de duração).
- Não introduz testes automatizados novos (o projeto tem
  `app-shell-contract.test.tsx` cobrindo o shell de recursos; se ele
  referenciar as apps por nome, será atualizado para incluir "lago", mas
  nenhum teste novo de WebGL/canvas é escrito).

## Testes manuais planejados

1. Abrir `/recursos`, clicar no card "Lago", confirmar que o canvas
   preenche o modal, redimensiona corretamente, e a UI (header/controles)
   está em tema claro.
2. Interagir: tocar a água, alternar modos (pedra/alimentar/vento), abrir e
   fechar o modal "Sobre".
3. Abrir o Guia de Respiração, iniciar uma sessão com a técnica "4-6",
   cronometrar visualmente que a mandala leva ~4s para inflar e ~6s para
   desinflar (não mais instantâneo).
4. Confirmar em mobile (viewport estreito) que a mandala e o texto cabem
   sem exigir scroll excessivo.
