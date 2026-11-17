# Recursos interativos — análise técnica e proposta de evolução

Data: 16/11/2026. Escopo: interfaces v2 efetivamente conectadas às rotas públicas e de formação, catálogo e assets locais. Este documento apresenta propostas; não implementa mudanças nas experiências nem gera imagens finais.

## Evidências e limites

A análise foi feita por leitura do código atual e inventário dos arquivos. A prévia Next iniciou na porta 3210, mas o navegador integrado retornou ERR_CONNECTION_TIMED_OUT tanto em 127.0.0.1 quanto em localhost. Portanto, não houve auditoria visual, captura válida ou teste de interação no navegador. Capturas antigas do repositório não foram usadas como evidência atual. Contraste, foco visível, responsividade, áudio real e desempenho em dispositivos permanecem por verificar.

Fontes principais: `src/components/resources/resourceCatalog.tsx`, `src/components/ResourcesSection.jsx` e `src/features/interactive-resources/v2/`. Direção de arte existente: `docs/recursos-v2-ilustracoes.md`.

## Diagnóstico

O produto tem boa amplitude e uma base coerente: respostas opcionais, alternativa em lista para a roda, movimento reduzido, áudio por gesto, encerramento voluntário e histórico explicitamente opcional. A prioridade é completar e dar clareza às experiências existentes.

O catálogo contém 18 recursos: 10 públicos publicados, quatro publicados da formação, três rascunhos da formação e um oculto. Essa classificação é do código; a disponibilidade de conteúdo editorial publicado não foi consultada no banco.

O maior déficit material está nas ilustrações: `public/brand/recursos/` contém somente cinco arquivos `.gitkeep`. Há 38 imagens especificadas no guia existente — 26 conceitos e 12 imagens de cenas/práticas — sem os arquivos correspondentes nessa pasta. Em caso de falha da imagem, `IllustrationSlot` exibe “Espaço para ilustração”, inclusive em produção. Outras imagens cadastradas editorialmente não foram verificadas.

## Jornada analisada no código

1. **Escolher um recurso — base boa, descoberta limitada.** Categorias, contadores e duração já existem. Acrescentar filtro por tempo e entrada por intenção: “Quero estudar”, “Quero perceber como estou”, “Quero uma pausa”. Adicionar uma pequena prévia autoral por recurso. A categoria Experimentar aparece apenas na formação com a configuração atual; não é uma falha do filtro.
2. **Escolher um modo — precisa de explicação.** Cartas e Figura e Fundo têm tela de preparação, mas os modos aparecem principalmente pelo nome. Explicar o que a pessoa fará e quanto tempo costuma levar. Exemplo: “Copa: escolha uma folha e descubra uma carta”.
3. **Experimentar — execução rica, lacunas específicas.** Completar as imagens funcionais de Figura e Fundo antes de ampliar o acervo. Refinar mapa corporal, roda, transições e paisagens conforme a tabela abaixo.
4. **Concluir — precisa distinguir estados.** Separar “respostas nesta tela”, “registro guardado” e “experiência encerrada”. Em `ResourceHost`, o rascunho continua preenchido depois que `SaveBar` informa sucesso; isso pode manter o aviso de descarte ao voltar. Comunicar o salvamento ao host para atualizar o estado pendente.
5. **Revisitar — condicionado a acesso e disponibilidade.** O histórico depende de autenticação, formação e habilitação. Explicar essas condições antes da escrita quando o recurso oferecer registro. Preservar a decisão de não salvar; não criar persistência automática de respostas pessoais.

## Melhorias por experiência

| Experiência | Evidência no código | Proposta |
|---|---|---|
| Cartas Gestálticas | Busca, baralhos, virar, aprofundar, favorita, rever e já li já existem | Ilustrar o acervo e explicar a duração das marcações; apresentar uma carta por vez como opção de leitura, preservando a grade |
| Figura e Fundo | Rubin e rodadas dependem de imagens ausentes; `onDraft` recebe sempre `null` | Priorizar as artes perceptivas; proteger reflexões digitadas ao sair, mesmo sem histórico persistente; oferecer transcrição equivalente sem antecipar a descoberta visual |
| Ciclo do Contato | Trocar a lente limpa respostas diretamente | Pedir decisão de descarte quando houver escrita; manter nomes completos das fases em lista junto ao diagrama |
| Mapa do Corpo | Frente/costas, regiões e sensações já existem; seleção carrega valores, mas troca de vista/região guiada não usa o mesmo carregamento | Sincronizar o formulário com região e vista; diferenciar região escolhida e percepção registrada. Preservar os botões da silhueta ao introduzir arte licenciada |
| Roda das Emoções | Roda e lista disponíveis; rótulos SVG cortados a 18 caracteres e raio reduzido conforme o número de itens | Adaptar densidade ao tamanho da tela; mostrar nome completo da seleção e intensidade descrita em palavras; manter lista equivalente |
| Necessidades Agora | Até três seleções; uma quarta tentativa não mostra retorno próprio | Exibir “2 de 3 escolhidas” e explicar o limite quando atingido |
| Chegada | Escolha de etapas e versão breve já existem | Não representar intensidade sem resposta com o mesmo valor visual de zero; identificar “ainda não informado” e preservar a opção de pular |
| Polaridades e Cadeiras | Alternância, exemplos e atalho já existem; limite de 12 falas | Acrescentar indicador textual de lado ativo, contador de falas e opção de revisar uma fala antes de concluir |
| Paisagem de Pensamentos | Jardim lista escritas; rio movimenta texto; pensamentos do rio são excluídos do histórico | Criar cenário discreto de jardim/rio, manter controles HTML e pausa; avisar sobre a passagem antes de soltar a escrita; não transformar o jardim em pontuação |
| Sala de Pausa | Seis práticas com slots vazios; trocar prática reinicia tempo sem pedir decisão | Produzir as seis faixas; tornar a troca previsível e preservar a reflexão. O tempo já aciona o rascunho, então separar tempo decorrido de escrita pendente |
| Sons para Awareness | Reprodução e parada; alternativa textual; conteúdo depende de gravações aprovadas | Mostrar faixa em reprodução, pausa, volume e duração. Produzir áudio próprio e roteiro equivalente em texto, com autoria e licença |
| Igarapé | WebGL, chuva, vento, entardecer e modo estático já existem; fallback é apenas um bloco textual | Produzir imagem estática real, versões dia/entardecer e textura de água; mostrar imagem também na falha de WebGL. Verificar estados desabilitados nessa falha |
| Casoteca e recursos em rascunho | Escrita e comparação docente estruturadas | Melhorar progressão e comparação lado a lado; usar ilustração abstrata de abertura e evitar imagens que induzam uma interpretação do caso |

## Plano de produção de assets

Manter a aquarela sobre Creme Papel #FDFAF4, verdes Raiz #005A1F e Igarapé #07614C, Terra Barro #96551F e acentos Aurora #FE538B, Vazante #FED701 e Broto #01C94D. Preservar áreas vazias e textura discreta. Seguir as restrições já documentadas de marca, sem textos incorporados, fauna ou retratos gerados.

| Ordem | Entrega | Quantidade e formato | Aplicação e critério de aceitação |
|---|---|---|---|
| 1 | Rubin + duas rodadas perceptivas | 3 WebP, 1200 × 900 | Arquivos previstos em `figura-e-fundo/`; ambiguidade perceptiva precisa funcionar e corresponder às alternativas. Revisão humana indispensável |
| 2 | Copa das cartas | 1 WebP, 1200 × 1200 | `cartas/copa.webp`; aproximadamente dez folhas distinguíveis e alinhamento dos botões com a arte |
| 3 | Seis práticas da pausa | 6 WebP, 1600 × 640 | Arquivos previstos em `sala-de-pausa/`; cada composição diferencia a prática sem dominar os controles |
| 4 | Cadeiras e fronteira | 2 WebP, 1600 × 900 e 1600 × 640 | Caminhos já definidos; manter espaço central e coerência com os conceitos |
| 5 | Conceitos do baralho | 26 WebP, 1200 × 800 | Começar por awareness, aqui-agora, presença, figura-fundo, fronteira e polaridades; concluir o conjunto com revisão docente |
| 6 | Igarapé e paisagens | 4 imagens propostas: água dia/entardecer, jardim e rio | Sugestão de 1600 × 900, sujeita à medição da interface; exigem integração nova, não são slots existentes |
| 7 | Capas do catálogo | 10 imagens para os recursos públicos | Sugestão de 960 × 640; reaproveitar composições aprovadas quando o recorte preservar sentido e proporção |
| 8 | Áudio e estados de apoio | 3 paisagens sonoras próprias; 3 pequenas artes de vazio, indisponibilidade e encerramento | Sem reprodução automática; texto equivalente e licença. Artes decorativas com texto de estado em HTML |

Para os slots existentes, seguir o limite documentado de 200 KB por WebP. Não esticar imagens nem usar uma única prancha como asset final. Para novos slots, medir a área real antes da exportação. Testar fundo e recorte nos temas claro/escuro. Manter textos, diagramas, controles e áreas clicáveis no código; as ilustrações não substituem a interação.

Brief-base de produção: “Aquarela editorial sobre papel Creme #FDFAF4, pigmento discreto, formas orgânicas e amplo respiro; verdes #005A1F e #07614C, terra #96551F, pequenos acentos #FE538B, #FED701 e #01C94D. [Inserir composição específica do guia existente.] Proporção exata do slot. Sem tipografia, marcas d’água ou objetos adicionais.” Para Rubin, usar o brief específico de perfis em espaço negativo e avaliar a ambiguidade antes de aprovar.

## Sequência recomendada e validação

**Primeira entrega:** corrigir estados de rascunho/salvamento, sincronização corporal e proteção na troca de lente; produzir Rubin, rodadas e copa. São melhorias que afetam compreensão e preservação de respostas.

**Segunda entrega:** produzir seis faixas da pausa, cadeiras, fronteira e fallback do Igarapé; refinar roda, limites de seleção e estados de áudio.

**Terceira entrega:** completar cartas, capas e paisagens. Evoluir descoberta por intenção e tempo após observar dificuldades reais de escolha.

Antes de publicar, percorrer catálogo → modo → resposta → conclusão → guardar/descartar em 320, 390, 768 e 1440 px; testar teclado, leitor de tela, zoom 200%, movimento reduzido, ambos os temas, falha de imagem e ausência de WebGL. Verificar que trocar vista não leva uma sensação à região errada, salvar elimina avisos indevidos e o rio não persiste pensamentos. Medir sucesso da tarefa sem coletar o conteúdo pessoal escrito.
