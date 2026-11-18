# Catálogo compacto, janela ampla e Figura e Fundo

## Alterações

O catálogo passou a usar colunas menores, espaçamento de 12 px e padding de 14 px nos cards. Ícone e título compartilham a mesma linha. As ilustrações têm moldura verde, cantos de 12 px e área mais baixa, preservando a proporção do conteúdo com `object-fit: contain`. Os botões continuam com pelo menos 44 px de altura.

A janela compartilhada dos recursos ocupa 100% da largura e 100dvh de altura, sem o limite anterior de 1180 × 780 px. O cabeçalho exibe título e descrição, além dos controles de navegação, movimento, som quando disponível e tema. Categoria e duração saíram da barra; os avisos editoriais foram movidos para o conteúdo e continuam identificados. A barra ficou com aproximadamente 66 px em desktop.

## Figura e Fundo

O modo perceptivo usa quatro estudos visuais originais:

1. Vaso e dois perfis.
2. Pato e coelho, compartilhando um único contorno.
3. Árvore e dois perfis no espaço negativo.
4. Mancha bilateral, com leituras possíveis de borboleta e duas figuras.

A pessoa observa primeiro, depois abre as possibilidades. Pode escolher uma das duas leituras, alternância entre ambas, outra leitura nas próprias palavras ou “Ainda não sei”. É possível girar a imagem, ocultar as opções, avançar sem responder e voltar mantendo as escolhas.

Ao mudar de imagem, o foco e a rolagem acompanham o início do estudo. O resumo final apresenta apenas as escolhas feitas. Não há pontuação, diagnóstico, perfil de personalidade ou interpretação psicológica. A mancha é uma criação original inspirada na ambiguidade visual; não reproduz pranchas oficiais de Rorschach.

As observações permanecem em memória durante a experiência e ativam a proteção de saída existente. Encerrar não grava as respostas no banco ou no armazenamento do navegador. Os modos clínico e sessão continuam utilizando os acervos editoriais existentes. O apoio lateral foi retirado de Figura e Fundo para priorizar a imagem e suas opções.

## Assets e integridade

Novos arquivos em `public/brand/recursos/figura-e-fundo/estudos/`: `vaso-perfis.webp`, `pato-coelho.webp`, `arvore-perfis.webp` e `mancha-simetrica.webp`. Todos foram gerados com a ferramenta interna `image_gen`, inspecionados, exportados em 1200 × 900 e ficaram abaixo de 200 KB.

Prompts, origem, dimensões, tamanho e SHA-256 foram adicionados a `docs/recursos-assets-production.json`. O conjunto atual verifica 48 WebP e mantém os três candidatos de áudio anteriores.

## Validação

- 104 testes passaram em 20 suítes de recursos. As regressões novas verificam observação antes das opções, seleção, retorno à imagem anterior, alternativa escrita, resumo, rotação, incerteza e ausência de persistência automática.
- TypeScript, ESLint, validação de marca e integridade dos assets passaram.
- No navegador, a janela mediu exatamente 759 × 739 em viewport de 759 × 739 e 1440 × 1000 em viewport de 1440 × 1000. O cabeçalho mediu aproximadamente 66 px no segundo caso.
- No celular, janela e viewport mediram 390 × 844 e a largura do documento permaneceu em 390 px. O percurso das quatro imagens e o resumo com as quatro escolhas foram conferidos no navegador.
- Evidências em `docs/audits/2026-11-16-figura-fundo-evidence/`.

Não houve alteração ou publicação de versões editoriais no banco, nem salvamento de respostas pessoais reais. Os estudos novos são ilustrações e controles de exploração visual, separados dos casos e textos clínicos curados.
