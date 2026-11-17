# Ilustrações dos Recursos Interativos — espaços e instruções de arte

Cada ilustração é um arquivo em `public/brand/recursos/`. Basta salvar a imagem com o nome indicado: o site passa a exibi-la sem mudança de código. Falhas em imagens decorativas não deixam espaços vazios; nas imagens informativas, a interface oferece uma mensagem para continuar pelo texto. O quadro "Espaço para ilustração" fica restrito ao desenvolvimento.

## Produção de 16/11/2026

Figura e Fundo recebeu quatro estudos originais em `figura-e-fundo/estudos/`: `vaso-perfis.webp`, `pato-coelho.webp`, `arvore-perfis.webp` e `mancha-simetrica.webp`. São composições 4:3 (1200 × 900) com leituras visuais alternativas, sem pontuação ou interpretação psicológica. A mancha simétrica é inventada e não reproduz pranchas de testes. O manifesto de produção agora verifica 48 imagens.

Na revisão das Cartas 3D, por solicitação expressa do usuário, foram acrescentados os retratos ilustrados `cartas/autores/laura-perls.webp` e `cartas/autores/fritz-perls.webp`, além de `cartas/textura-papel.webp` para o verso. Os três arquivos têm proporção 2:3 e estão incluídos no manifesto de produção. Essa solicitação autoriza a exceção à regra anterior de iniciais para esses dois autores. A vinculação é pelo nome, não pela posição: no acervo atual, Laura corresponde à carta 22 e Fritz à 23. Outros autores mantêm as iniciais quando não há retrato disponível.

A frente das Cartas 3D usa imagem em toda a superfície e pequenas áreas de leitura translúcidas. O verso usa a textura real de papel, com tipografia verde. O conjunto atual soma 44 imagens WebP.

Foram produzidos e integrados 41 WebP: 26 conceitos, copa, árvore de Rubin, vaso/perfis, duas cadeiras, fronteira, seis práticas de pausa e quatro paisagens (água dia/entardecer, jardim e rio). As capas do catálogo reutilizam essas composições. Prompts, dimensões, tamanho e SHA-256 constam em `docs/recursos-assets-production.json`; execute `npm run audit:resource-assets` para conferir os arquivos.

A rodada `perceptivo-2` usa a cena descrita em texto enquanto não houver imagem licenciada fornecida pela equipe. Ela menciona uma pessoa conhecida; não foi criada uma pessoa por IA. Rodadas editoriais com `asset` usam a arte curada cadastrada, e rodadas novas sem arte mantêm a alternativa textual.

Três texturas sonoras sintetizadas estão em `public/brand/audio/awareness/`, com alternativas textuais e candidatos de cadastro em `curation-candidates.json`. Não são gravações de natureza. Foram preparadas para escuta e curadoria, sem alterar publicações editoriais. A geração é reproduzível com `node tools/generate-awareness-audio.mjs`.

## Regras para todas as imagens

- Formato **WebP**, até **200 KB**, no tamanho indicado (proporção exata).
- Estilo comum: Aquarela sobre papel Creme Papel (#FDFAF4), paleta oficial Figura Viva, sem sombra, brilho, pessoas, rostos gerados, fauna ou texto na imagem.
- Paleta oficial: Verde Raiz #005A1F, Verde Igarapé #07614C, Terra Barro #96551F, Creme Papel #FDFAF4, Mata #262B22, Areia #F1E9DB, Névoa #D8CFBE, Pedra #6B6B63; acentos de Confluência Aurora #FE538B, Vazante #FED701, Broto #01C94D (gradiente só nesta ordem).
- Proibido (guia, seção 7.1): koi, lótus, pétalas, paisagem 3D com céu e grama, fauna amazônica como ícone, poltrona, prancheta, cérebro, quebra-cabeça, pessoa gerada por IA, retrato de autor, emoji, texto escrito dentro da imagem.
- Nada essencial pode depender da imagem: o texto do recurso continua explicando tudo.

## Cartas Gestálticas — uma por conceito (proporção 3:2, 1200 × 800)

A carta escolhe o arquivo pelo título (ex.: "Introjeção" → `introjecao.webp`); cartas sem palavra-chave usam o padrão do baralho. Cartas de autoria **não** precisam de imagem: usam retrato tipográfico com as iniciais.

| Arquivo | O que desenhar |
|---|---|
| `cartas/awareness.webp` | Ponto Vazante surgindo num campo Areia, anéis muito leves ao redor. |
| `cartas/aqui-agora.webp` | Linha fina Névoa que converge para um único ponto Vazante no centro. |
| `cartas/autorregulacao.webp` | Mancha Aurora apagada e mancha Broto viva, ligadas por um Ramo Verde Raiz em arco. |
| `cartas/suspensao.webp` | Mancha Broto entre dois ramos curvos como parênteses (epoché). |
| `cartas/descricao.webp` | Mancha Vazante à esquerda e linhas de escrita Pedra à direita, sem texto legível. |
| `cartas/corpo.webp` | Silhueta neutra em traço contínuo Verde Raiz, sem gênero, pequena mancha Aurora no peito. |
| `cartas/eu-tu.webp` | Duas formas (Igarapé e Terra Barro) com o espaço entre elas iluminado em Vazante. |
| `cartas/inclusao.webp` | Dois círculos (Igarapé e Terra Barro) sobrepostos, cada um mantendo o contorno. |
| `cartas/presenca.webp` | Mancha Broto com contorno pontilhado Verde Raiz ao redor, aberto. |
| `cartas/introjecao.webp` | Forma inteira de contorno nítido (Terra Barro) dentro de uma mancha Broto, sem mistura. |
| `cartas/projecao.webp` | Forma Aurora e sua 'sombra' colorida pousada sobre uma forma Névoa. |
| `cartas/retroflexao.webp` | Ramo Terra Barro que sai de um ponto, faz um arco e volta a ele. |
| `cartas/confluencia.webp` | Duas manchas (Aurora e Broto) que se misturam sem contorno. |
| `cartas/deflexao.webp` | Ramo Terra Barro que se aproxima de uma mancha Igarapé e desvia antes de tocá-la. |
| `cartas/egotismo.webp` | Mancha Vazante com um segundo contorno rígido Mata ao redor, voltada para si. |
| `cartas/ajustamento.webp` | Ramo que contorna um obstáculo Névoa e brota folhas do outro lado. |
| `cartas/self-id.webp` | Mancha Aurora emergindo de um fundo Aurora apagado, pequeno broto saindo. |
| `cartas/self-ego.webp` | Mancha Broto (identificação) e mancha Névoa (alienação) separadas por linha Verde Raiz. |
| `cartas/self-personalidade.webp` | Camadas concêntricas Areia, Vazante e Broto, como anéis de crescimento. |
| `cartas/campo.webp` | Campo Areia com uma mancha Verde Raiz e manchas vizinhas mais leves, sem centro dominante. |
| `cartas/fronteira.webp` | Dois campos (Igarapé e Vazante) que se tocam por membrana pontilhada Creme. |
| `cartas/teoria-campo.webp` | Nós e linhas de força sem centro, em Verde Raiz, Terra Barro e Igarapé. |
| `cartas/figura-fundo.webp` | Árvore de Rubin em miniatura (ver arvore-de-rubin). |
| `cartas/vazio-fertil.webp` | Grande campo Areia vazio com uma pequena mancha Broto nascendo na borda. |
| `cartas/polaridades.webp` | Manchas Aurora e Broto nos extremos unidas por gradiente contínuo Aurora → Vazante → Broto. |
| `cartas/territorio.webp` | Faixa de rio Igarapé, céu em mancha Broto apagada, um ramo com folhas na margem. Sem fauna nem folclore. |

## Demais espaços

| Arquivo | Proporção / tamanho | O que desenhar |
|---|---|---|
| `figura-e-fundo/arvore-de-rubin.webp` | 4:3 · 1200 × 900 | Dois perfis humanos em Creme, frente a frente, sobre fundo Verde Raiz; o espaço entre eles é o tronco do logotipo, coroado pela copa em aquarela Aurora, Vazante e Broto, opacidade plena. |
| `cartas/copa.webp` | 1:1 · 1200 × 1200 | Copa em 2,5D em aquarela Aurora, Vazante e Broto sobre Creme Papel, tronco em traço Terra Barro, cerca de 10 folhas maiores destacadas. Sem céu, grama ou paisagem. |
| `polaridades/duas-cadeiras.webp` | 16:9 · 1600 × 900 | Duas cadeiras em traço Terra Barro sobre chão Areia, frente a frente; o espaço entre elas marcado por pontilhado Névoa. |
| `fronteiras/fronteira-de-contato.webp` | 5:2 · 1600 × 640 | Faixa horizontal: dois campos (Igarapé e Vazante) que se tocam por membrana pontilhada Creme. |
| `sala-de-pausa/respirar.webp` | 5:2 · 1600 × 640 | Faixa abstrata da prática "respirar": anéis concêntricos suaves em Broto. |
| `sala-de-pausa/observar.webp` | 5:2 · 1600 × 640 | Faixa abstrata da prática "observar": um ponto Vazante num campo Areia. |
| `sala-de-pausa/pelos-sentidos.webp` | 5:2 · 1600 × 640 | Faixa abstrata da prática "pelos-sentidos": cinco pequenas manchas em cores da paleta. |
| `sala-de-pausa/ouvir.webp` | 5:2 · 1600 × 640 | Faixa abstrata da prática "ouvir": três linhas de onda em traço único. |
| `sala-de-pausa/movimentar.webp` | 5:2 · 1600 × 640 | Faixa abstrata da prática "movimentar": ramo em curva com uma folha na ponta. |
| `sala-de-pausa/desacelerar.webp` | 5:2 · 1600 × 640 | Faixa abstrata da prática "desacelerar": superfície de água Igarapé com ondulações Creme. |
| `figura-e-fundo/perceptivo-1.webp` | 4:3 · 1200 × 900 | Rodada perceptiva "Vaso ou rostos?": elementos de pesos visuais semelhantes (manchas, ramo, linha, seixo) que correspondam às opções da rodada, para cada pessoa escolher o que vira figura. |
| `figura-e-fundo/perceptivo-2.webp` | 4:3 · 1200 × 900 | Rodada perceptiva "Uma sala comum": elementos de pesos visuais semelhantes (manchas, ramo, linha, seixo) que correspondam às opções da rodada, para cada pessoa escolher o que vira figura. |

Rodadas perceptivas criadas depois no editor usam `figura-e-fundo/<id-da-rodada>.webp`.

## Chegada — assets integrados em 16/11/2026

A Chegada tem sete ilustrações próprias em `public/brand/recursos/chegada/`: `abertura.webp` (1600 × 900) e `palavra.webp`, `corpo.webp`, `emocao.webp`, `intensidade.webp`, `necessidade.webp`, `reflexao.webp` (1200 × 900). A abertura também aparece no catálogo. Todas são decorativas, em aquarela sobre papel creme, com informações e controles disponíveis em texto.

O manifesto `docs/recursos-assets-production.json` contém os prompts completos e hashes dos 55 WebP do acervo. A auditoria `npm run audit:resource-assets` verifica dimensões, tamanho e integridade. Detalhes da Chegada e evidências estão em `docs/audits/2026-11-16-chegada.md`.

## O que continua desenhado pelo site

- **Silhueta do Mapa do Corpo**: é interativa (cada região é um botão), por isso fica em SVG. Arte licenciada pode substituí-la pelo editor (item com formato `frente`/`costas` e arte curada).
- **Diagrama do Ciclo do Contato**: é um gráfico das fases marcadas, não uma ilustração.
- **Retrato tipográfico** das cartas de autoria.


## Cards de Necessidades Agora — ilustrações individuais

Cada card usa um asset próprio em `public/brand/recursos/necessidades/cards/`, com 800 × 600 pixels em WebP: `descanso.webp`, `seguranca.webp`, `pertencimento.webp`, `autonomia.webp`, `reconhecimento.webp`, `expressao.webp`, `cuidado-corpo.webp`, `movimento.webp`, `silencio.webp` e `contato.webp`.

Composições simples em aquarela sobre papel creme, sem texto dentro da imagem. Os nomes das necessidades permanecem em HTML. As imagens são decorativas e os estados de seleção continuam nos botões. O mapeamento aceita o identificador editorial ou o título normalizado; itens futuros sem arte específica usam o jardim existente. A capa do recurso no catálogo permanece com a ilustração anterior.

Assets gerados com o image_gen integrado. Prompts e hashes registrados em `docs/recursos-assets-production.json`.
