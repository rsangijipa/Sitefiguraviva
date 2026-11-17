# Igarapé — refinamento visual

A cena Three.js recebeu horizonte, céu, textura de leito, árvores com recorte transparente, margens sinuosas, reflexos, ondulações e partículas. A paisagem usa composição em camadas: fundo e árvores com imagens, geometria do leito e superfície refletora em tempo real. Não é uma simulação física de água ou vegetação.

O botão principal e o toque continuam criando ondulações. Arrastar com o botão central do mouse altera levemente a direção da câmera, com limites. Os botões “Olhar à esquerda”, “Olhar à direita” e “Centralizar visão” oferecem a mesma função em telas sensíveis ao toque e pelo teclado. A cena para de renderizar continuamente fora da área visível e oferece modo estático e alternativa para WebGL indisponível.

Três assets criados com a ferramenta integrada de geração de imagens foram incorporados em `public/brand/recursos/igarape/`: `ceu-realista.webp`, `leito-realista.webp` e `arvore-realista.webp`. Os prompts completos, dimensões e hashes constam em `docs/recursos-assets-production.json`.

Validação local: cena renderizada no navegador, controles de câmera e ondulação, alternância de modo estático e retorno ao 3D; largura de 390 px sem rolagem horizontal; testes para limites da câmera, botão central e limpeza de eventos; TypeScript e ESLint. Imagem de evidência em `docs/audits/2026-11-16-igarape-realista-evidence/igarape-desktop.png`.
