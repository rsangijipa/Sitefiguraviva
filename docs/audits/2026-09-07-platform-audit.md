# Auditoria geral da Plataforma Figura Viva

Data: 2026-09-07

## Veredito

A plataforma está visualmente recuperada em algumas rotas públicas, mas ainda não está pronta para considerar “estável”. O lint passa, porém o typecheck e a suíte completa de testes apresentam falhas em contratos, imports, mocks e componentes que vieram de branches diferentes.

## Evidências executadas

- `npm run lint -- --quiet`: passou.
- `npm run typecheck`: falhou em 5 pontos.
- `npx jest --runInBand`: 51 suites passaram, 9 falharam e 1 foi ignorada; 194 testes passaram, 10 falharam e 7 foram ignorados.
- Validação visual no navegador em `/public-gallery`: página carregou com cores, bordas, sombras, navegação e rodapé funcionais em viewport mobile.

## Bloqueadores P0

1. `src/components/visual/FiguraVivaTree.tsx`: fallback de `MediaQueryList` não satisfaz o tipo TypeScript.
2. `src/components/admin/MaterialsManager.tsx` e `src/services/adminCourseService.ts`: chamadas com quantidade incorreta de argumentos.
3. `src/components/portal/shell/SidebarNav.tsx`: incompatibilidade entre `Timestamp` e `string` no perfil de gamificação.
4. `src/features/public-site/__tests__/homepage-structure.test.tsx`: renderização da home quebra por ausência de `QueryClientProvider`.
5. `src/app/actions/admin/__tests__/course-mutations.materials.test.ts`: mock antigo espera Firebase enquanto o código atual usa outra camada.

## Regressões de contrato

- `tests/accessibility/public-contracts.test.tsx` ainda espera labels em inglês e cards `<motion.button>`, enquanto `ResourcesSection.jsx` usa outra implementação.
- `src/features/public-site/__tests__/navigation.test.ts` espera itens sem ícones, mas `PUBLIC_NAV_ITEMS` agora contém ícones e inclui Fundadora.
- `src/components/resources/apps/__tests__/app-shell-contract.test.tsx` espera classes antigas do shell.
- `tests/architecture/no-firebase-runtime.test.ts` ainda detecta/configura Firebase em arquivos de ambiente e dependências.

## UX/UI

Pontos positivos observados: identidade visual clara na galeria, contraste razoável, navegação mobile compacta, links de rodapé expostos e foco semântico em controles principais.

Riscos: o rodapé ainda pode ocupar muita altura em desktop; o estado vazio da galeria é visualmente amplo; o menu da árvore precisa de validação em desktop; o tema escuro ainda precisa de inspeção rota a rota; vários recursos usam CSS próprio e podem divergir dos tokens globais.

## Árvore das Emoções

- Estado inicial do painel foi ajustado para fechado.
- Controles ganharam fundo opaco e contraste maior.
- O painel ainda depende de `localStorage`, filtros remotos, WebGL e áudio, portanto precisa de teste com rede indisponível, reduced motion, teclado e touch.
- Não existe asset de pássaros no projeto. O áudio ambiente atualmente aponta para `public/assets/audio/meditation.mp3`, que é um fallback e não deve ser apresentado como som de pássaros.

## Quiz

- A navegação por resposta automática foi adicionada.
- A home passou a usar cards empilhados e sombras.
- É necessário proteger contra duplo avanço se o usuário clicar em “Continuar” durante o intervalo automático.
- O header ainda contém estrutura de logo vazia e precisa ser verificado visualmente em mobile.

## Acessibilidade e responsividade

Ainda não é possível declarar conformidade completa apenas pelo código. É necessário executar testes manuais em 320px, 768px e desktop, percorrer todos os controles com Tab/Shift+Tab, testar Escape em modais, zoom de 200%, contraste no dark mode e touch targets.

## Ordem recomendada de estabilização

1. Corrigir os 5 erros do typecheck.
2. Atualizar os testes de contrato para refletir a implementação canônica atual.
3. Remover arquivos de build temporários antes de nova validação.
4. Executar E2E nas rotas públicas e nos fluxos de login/admin.
5. Auditar dark mode e tabulação por grupos de rotas.
6. Substituir o áudio fallback por asset real de natureza licenciado.

