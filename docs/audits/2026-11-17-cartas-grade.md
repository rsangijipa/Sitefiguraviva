# Cartas Gestálticas: volta da grade ilustrada

Feito em 17/11/2026, depois da reclamação de que o recurso perdeu a visão com várias cartas ilustradas lado a lado. A troca aconteceu no commit `2745f80`, que substituiu a grade `fv-gcards` por uma carta 3D única com lista lateral só de texto (ver `2026-11-16-cartas-3d.md`).

## Decisão

A usuária escolheu a opção (a): a grade ilustrada volta a ser a tela inicial de "Explorar acervo" e de "Minhas cartas", e cada carta abre na visão 3D. A alternativa descartada era um alternador "Grade / Uma carta".

## Como ficou

- **Grade.** Todas as cartas filtradas aparecem com a ilustração (`ConceptIllustration`), o baralho, o código, a primeira frase, a primeira referência e o aviso de referências extras. Cada carta tem "Virar carta", "Abrir em destaque" e "Aprofundar", além das marcas Favorita, Rever e Já li. O componente é o `GestaltCard` de `2745f80^`, agora em `cards/GestaltCard.tsx`.
- **Giro na grade.** Frente e verso ocupam a mesma célula. O giro é 3D em CSS e a altura da carta não muda. O verso usa a textura de papel. A face escondida fica `aria-hidden` e `inert`. Os controles ficam fora das faces, então o foco continua no botão de virar.
- **Carta em destaque.** "Abrir em destaque" mostra a carta 3D (`Card3D`), com o foco em "Voltar à grade". Também ficam ali as marcas, a leitura completa e a navegação anterior/próxima dentro do resultado filtrado. "Voltar à grade" ou Esc devolvem o foco ao botão da mesma carta na grade.
- **Mantido de `2745f80`:** giro 3D com inclinação para mouse, retratos de Laura e Fritz Perls, verso em papel, busca sem acento, filtro por baralho, marcações, cartas viradas e nota compartilhadas entre os três caminhos, sorteio com a árvore e cartas relacionadas no aprofundamento. No modo "relações", cada carta da grade volta a listar os conceitos com que conversa.
- **Removido:** a lista lateral só de texto e o seletor móvel, que agora são desnecessários.
- Com movimento reduzido (preferência do sistema ou controle do recurso), a troca de face é imediata e não há giro.

## Validação

- Os testes `cards-3d.test.tsx` foram atualizados: a carta 3D abre a partir da grade e o foco volta com Esc. O novo `cards-grid.test.tsx` cobre a grade ilustrada com filtro, o retrato da Laura, o giro no lugar com foco, as marcas, o aprofundamento, a seleção e o modo relações.
- `npm run lint`, `npm run typecheck` e `npx jest` passaram: 184 suítes e 937 testes, com 7 ignorados que já eram ignorados antes.
- No navegador, foi usado o acervo de demonstração (`supabase/manual/recursos-demo-content.json`, com 27 cartas) numa página local temporária. O Supabase apontava para um endereço local inexistente. Nada foi lido do banco de produção nem gravado nele.
  - Em desktop (1280 px): 3 colunas, 26 ilustrações carregadas sem falha e 1 retrato tipográfico (autoria sem retrato). Laura e Fritz aparecem com retrato. A grade não tem rolagem horizontal. No teclado, Shift+Tab e Enter abriram a carta do Fritz; o giro aplicou `rotateY(180deg)` e o foco foi para a face visível; Esc devolveu o foco ao botão do Fritz na grade.
  - Em 375 px: uma coluna, documento com 375 px de largura, nenhum elemento além da borda e todos os botões com pelo menos 44 px de altura. A carta em destaque da Laura também cabe sem rolagem horizontal.
  - O console não mostrou erros.
- Capturas em `2026-11-17-cartas-grade-evidence/`.
