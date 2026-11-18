# Recursos interativos — implementação de 16/11/2026

## Entrega

- Catálogo com filtro por tempo, contagem de resultados, recuperação de filtro sem resultados e capas derivadas do novo acervo.
- Modos de Cartas e Figura e Fundo com explicação da atividade e duração. Cartas com leitura individual e escolha de cartas para revisão sem sair da experiência.
- Copa com dez controles associados às folhas da aquarela; em telas pequenas, os controles passam para uma lista legível abaixo da imagem.
- Proteção de respostas ao sair, voltar aos modos, iniciar outra experiência e trocar lente, rodada, vinheta ou caso. Links internos da pausa e entrada no login passam pela mesma proteção.
- Salvamento comunica sucesso ao host, removendo avisos indevidos de rascunho sem apagar o resumo.
- Mapa corporal carrega sensação, intensidade e nota da região/vista corretas. A silhueta clicável continua disponível quando há arte editorial adicional.
- Intensidade ainda não respondida deixa de aparecer como zero. Necessidades mostram contagem e limite de três escolhas. Diálogo mostra limite de falas, inclui uma fala ainda não adicionada na proteção de rascunho e permite revisar falas.
- Roda evita rótulos longos cortados e oferece lista em telas estreitas/acervos maiores. Casoteca oferece comparação da leitura pessoal e docente lado a lado.
- Trocar de prática mantém a reflexão. Apenas o tempo transcorrido não dispara aviso de resposta pendente. Escritas ainda não adicionadas no rio/jardim e na escuta entram na proteção de saída, sem criar persistência automática.
- Áudio do acervo ganhou pausa, retomada na posição, volume, duração, carregamento e indicação de reprodução.
- Igarapé usa as aquarelas como texturas e como alternativa estática. Foi corrigida a camada flutuante não inicializada que cobria a água de preto; a troca entre animação e modo estático reinicializa corretamente o agendamento de quadros.
- Falhas em imagens decorativas deixam de exibir quadros de produção. Estados de acervo em revisão reutilizam a ilustração de vazio fértil. Diálogos deixam de herdar a altura mínima de uma página inteira.
- Tokens do tema escuro dos recursos foram centralizados, preservando as cores existentes e eliminando duplicação da paleta.

## Assets

41 ilustrações WebP em `public/brand/recursos/`, total de 2,32 MiB, todas abaixo de 200 KB: 26 conceitos, copa, Rubin, vaso/perfis, cadeiras, fronteira, seis práticas e quatro paisagens. Imagens geradas com a ferramenta interna `image_gen`, inspecionadas em conjunto e individualmente para cenas funcionais. Corpo e egotismo foram refinados; a carta figura-fundo reaproveita a árvore de Rubin para preservar a ambiguidade visual.

Prompts, origem, dimensões, tamanho e hashes estão em `docs/recursos-assets-production.json`. O arquivo documenta produção e integridade, não aprovação docente.

Três arquivos WAV originais sintetizados, mono, 22.050 Hz e 30 segundos, estão em `public/brand/audio/awareness/`. Não são gravações naturais. `curation-candidates.json` inclui autoria, descrição e alternativas textuais. Permanecem candidatos à escuta e curadoria, sem inserir ou publicar versões no banco.

A segunda cena perceptiva menciona uma pessoa conhecida. Foi mantida como cena textual, com suporte para arte licenciada cadastrada pela equipe, respeitando a restrição existente de não criar pessoas por IA.

## Verificação

- 17 suítes e 91 testes de recursos passaram. Incluem regressões de saída após salvamento, sincronização de vistas, intensidade nula, limite de necessidades, preservação de reflexão, filtros combinados e transporte de áudio.
- `npm run typecheck` passou.
- ESLint dos arquivos TypeScript/TSX e ferramentas alterados passou.
- `npm run lint:marca` passou: 397 arquivos, zero erros.
- `npm run audit:resource-assets` passou para 41 imagens e três candidatos de áudio. O manifesto inclui hashes dos arquivos finais.
- Prévia HTTP local respondeu 200. No navegador integrado foram verificados catálogo, filtro de duração, registro corporal temporário, troca de vista, proteção de saída, escolha de modo, folha da copa abrindo carta e alternância do Igarapé entre superfície interativa e imagem estática.
- Capturas em 320, 390 e 1440 px. Na leitura de layout em 320 px, a largura de conteúdo era 312 px, sem extravasamento horizontal.

Evidências em `docs/audits/2026-11-16-recursos-evidence/`. A captura `04-carta-ilustrada-1440.png` mostra uma folha abrindo a carta com a imagem integrada; `06-igarape-estatico-390.png` e `07-igarape-interativo-390.png` mostram as duas apresentações da água. A coleção final está em `05-colecao-ilustracoes.png`.

Limites: não foi realizada escrita no banco, publicação online, validação de histórico com matrícula real, escuta humana dos novos candidatos de áudio ou auditoria completa com leitor de tela. O conteúdo de demonstração existente continua identificado como tal.

## Reproduzir

```text
npm run audit:resource-assets
npx jest src/features/interactive-resources/v2/__tests__ src/components/resources/__tests__ --runInBand
npm run typecheck
npm run lint:marca
node tools/generate-awareness-audio.mjs
```
