# Prompt fullstack — Sons para Awareness

Copie este arquivo inteiro para o agente de implementação na raiz do repositório Figura Viva.

## Objetivo e conteúdo

Crie exploração auditiva voluntária de direção, distância percebida e características, aproximadamente 2–5 minutos. Card “Perceba de onde vem um som e como ele se apresenta.” CTA “Explorar sons”. Abertura “Escutar, com curiosidade.” Apoio “Observe direção, distância e textura. Sua percepção não precisa corresponder a uma resposta certa.” Isto não é audiometria, treinamento clínico ou avaliação de audição. Nunca deduzir dificuldade auditiva de uma resposta.

Modos: Exploração livre (escolher som e posição) e Escuta guiada (ouvir, descrever, depois revelar como a cena foi configurada). Cena configurada não é verdade sobre a percepção. Conteúdos iniciais previstos: água corrente, folhas ao vento, chuva suave e pássaro distante. São especificações de assets a obter com licença, não arquivos presentes no ZIP. Sem assets reais não declarar experiência de sons naturais concluída nem substituir por oscilador e chamar de natureza.

## Rotas e módulos

/portal/recursos/sons-para-awareness, /historico e admin equivalente. src/features/interactive-resources/awareness-sounds/: AwarenessSoundsExperience.tsx; components/ListeningSetup.tsx, SoundLibrary.tsx, SoundStage.tsx, PerceptionForm.tsx, AudioControls.tsx, ListeningSummary.tsx; audio/audioEngine.ts encapsula AudioContext e nós, audio/assetLoader.ts carrega/valida, hooks/useAudioSession.ts controla lifecycle; schema.ts, types.ts, repository.ts. Reuse audio manager do portal para não competir com aula/guia em reprodução. Não alterar globalmente speechSynthesis; este recurso não precisa de TTS.

## Preparação, layout e acessibilidade

Antes do som: “Comece com volume baixo e ajuste para ficar confortável.” Botão explícito “Ativar áudio”. Fones são opção: “Fones podem tornar a direção mais perceptível. Você também pode usar alto-falantes.” Sem autoplay, microfone ou solicitação de câmera. Volume inicial baixo, por exemplo ganho 0,2, ajustável; esse número não garante nível acústico seguro e UI não o apresenta em decibéis.

Desktop: palco circular 60% com posição do ouvinte e fontes e painel 40% para som/respostas; mobile palco simplificado e controles/lista no fluxo. Fundo Creme, círculo Areia, posição Verde Raiz, marcador Terra Barro; ondas gráficas discretas sem simular medição real. Rótulos esquerdo/centro/direito/frente/atrás permanecem textuais. Na guiada, ocultar apenas a configuração até “Ver como o som foi posicionado”; descrição textual do conteúdo sonoro e controles continuam acessíveis.

Oferecer “Explorar descrições, sem áudio”, com textos editoriais das cenas e acesso às perguntas, marcado como modo textual. Não alegar equivalência perceptiva com escutar som espacial. Nenhuma funcionalidade essencial depende de enxergar o palco; lista e controles HTML permitem configurar tudo.

## Engine, estados e comportamento

setup → loadingAsset → ready → playing ↔ paused → observing → completion; erro de decode/load/reprodução oferece nova tentativa ou modo textual. Criar/resumir AudioContext somente por gesto; verificar estado real e sincronizar botões com eventos. Um som por vez na primeira versão. BufferSource é descartável: pausar guarda offset, para/disconnect; retomar cria nova fonte no offset; loop e fim tratados sem duplicar fontes. GainNode com rampas curtas evita estalos; stop e unmount desconectam nós, param fontes e liberam contexto se próprio. Se contexto for compartilhado, não fechá-lo por engano.

Para direção 3D use PannerNode HRTF se suportado; fallback StereoPannerNode para esquerda/direita, com UI explicitando que frente/trás não estão disponíveis nesse modo. Distância é parâmetro relativo de cena (perto/médio/longe), nunca metros medidos pelo usuário. Atenuação moderada com limites para não induzir aumento brusco de volume; trocar cena não reseta volume para alto. Não garantir localização frontal/traseira idêntica em todos os dispositivos. Documento oculto pausa; voltar requer Retomar. Fim de sessão para áudio mesmo se abrir histórico.

Na guiada, depois de ouvir: “De que direção parece vir?” opções esquerda/centro/direita/frente/atrás/não sei conforme modo suportado; “Parece perto ou longe?” perto/intermediário/longe/não sei; “Como você descreveria?” escolhas suave/contínuo/intermitente/grave/agudo e termo próprio ≤120. Seleção múltipla de características até 5. Revelação diz “Nesta cena, o som foi posicionado à esquerda”, seguida de “A percepção pode variar conforme o ambiente e o dispositivo.” Não usar correto/incorreto, nota ou porcentagem de acerto. Exploração livre permite alterar posição com controles de teclado e tocar marcador; drag é opcional.

## Assets, dados e admin

Manifesto por áudio: id, título, descrição textual, arquivo, MIME, duração, autor, licença, URL de origem, tamanho, versão/hash e níveis de preparação quando medidos. Fornecer pelo menos 4 arquivos reais licenciados para validar a biblioteca inicial; MP3/AAC ou formatos compatíveis com fallback conforme navegadores alvo. Carregar sob demanda, não todos os áudios no bundle; limites propostos de 2 MB por trecho e 4 MB de cache ativo devem ser ajustados ao conteúdo com medição. Sem hotlink instável e sem URL arbitrária fornecida por aluno. Storage de conteúdo editorial separado de dados privados, com política conforme acesso do portal.

Tabela listening\_sessions com base comum, mode guided/free/text, duration\_seconds >=0, observations JSON até 10 cenas \[{sound\_id, sound\_version, configured\_position, perceived\_direction nullable, perceived\_distance nullable, qualities array, custom\_quality nullable ≤120}], reflection nullable ≤500. Somente persistir por escolha final; metadados da configuração não podem ser apresentados como diagnóstico. Valide enum conforme modo; versão de áudio arquivada mantém créditos/snapshot no histórico.

Admin faz upload com validação de MIME real, tamanho, duração, licença e transcodificação quando infraestrutura existir, preview audível e texto alternativo obrigatório. Publicação bloqueada sem arquivo reproduzível e crédito; não inventar direitos de uso. Configura posições dentro de limites seguros de ganho, sem aumentar volume com base em resposta. Admin não consulta percepções pessoais.

## QA particular

Provar áudio só após clique, pausado/retomado no offset, sem duas fontes, mute e slider, falha de arquivo, interrupção do sistema, background/unmount, Panner ausente com fallback honesto, modo textual, teclado, render mobile e ausência de score. Ouvir de fato arquivos e transições; testar navegadores alvo disponíveis e declarar os não testados. Nenhuma permissão de microfone é pedida; nenhuma resposta é tratada como resultado de teste auditivo.

## Mandato de implementação e descoberta obrigatória

Implemente este recurso de ponta a ponta no repositório atual do Instituto Figura Viva. Entregue interface integrada, interações, persistência privada opcional, autorização, migrações, conteúdo editorial administrável e verificação. Este prompt é independente: não exige executar os outros sete antes. Os caminhos abaixo são propostas; adapte-os às convenções reais encontradas e documente o mapeamento final.

Antes de editar, leia instruções do repositório, package.json, lockfile, roteamento, tokens e componentes. Localize Portal do Aluno, catálogo de Recursos Interativos, autenticação, cliente Supabase de servidor e navegador, migrations, RLS, serviços/actions, AdminShell, formulários, diálogos e testes existentes. Verifique o código atual; auditorias antigas não comprovam o estado presente. Registre baseline dos comandos disponíveis e preserve alterações de terceiros. Não crie outro login, sidebar, dashboard ou cliente de banco. Next.js/React/TypeScript/Supabase são a integração esperada, não versões verificadas do portal. Use a stack real; não transplante o entrypoint ReactDOM do SomaScan para uma aplicação Next.js.

Crie ou reutilize um InteractiveResourceShell com cabeçalho, retorno ao catálogo, área da experiência e fechamento. O shell organiza espaço; cada recurso possui sua própria interação. A página do portal já fornece a navegação global. Não aninhe um segundo shell com min-height de tela, breadcrumbs e títulos repetidos. Componentes que acessam DOM, áudio ou Canvas ficam na fronteira cliente; autenticação e operações protegidas permanecem no servidor. Não introduza uma biblioteca de estado global para um fluxo local.

## Referência analisada e limites da inspiração

O ZIP SomaScan contém App.tsx com estados intro → scanning → results, components/BodyMap.tsx com SVG interativo e modo de leitura, Scanner.tsx com seleção temporária confirmada em diálogo e Results.tsx com mapa e resumo. types.ts separa os tipos; services/bodyScanService.ts contém TTS do navegador e regras locais. Aproveite a clareza dessa sequência, a figura central explorável, o rascunho separado do registro e a opção de revisitar escolhas. Não copie a silhueta onde ela não é pertinente, as cores particulares, a marca SomaScan, sombras, vidro, inferências somáticas ou atraso artificial de 800 ms.

Esse ZIP não contém package.json, HTML de entrada, CSS/configuração Tailwind, hook useFocusTrap importado, backend ou assets de áudio. Portanto não presuma versões, infraestrutura ou funcionamento autônomo comprovado. O texto “100% Offline” não comprova suporte offline; voz de síntese depende do ambiente. Não acrescente IA, análise de sentimento ou classificação clínica para reproduzir seu serviço de recomendações.

## Design Figura Viva: fonte e tradução para web

Fonte: documento Figura-Viva-Design-System-v1(8).docx, partes III, especialmente 3.1 Cor, 3.2 Tipografia e 3.4 Forma, traço e profundidade. Registro do aluno: Confluência.

Tokens obrigatórios, reutilizados como variáveis semânticas do portal:

|Papel|Token|Valor|
|-|-|-|
|Fundo|Creme Papel|#FDFAF4|
|Superfície alternativa|Areia|#F1E9DB|
|Títulos e estrutura principal|Verde Raiz|#005A1F|
|Estrutura secundária|Verde Igarapé|#07614C|
|Etiquetas e acento quente|Terra Barro|#96551F|
|Texto corrido|Mata|#262B22|
|Texto secundário|Pedra|#6B6B63|
|Divisores|Névoa|#D8CFBE|
|Fundo escuro alternativo|Grafite|#4B4B49|
|Acentos gráficos|Aurora / Vazante / Broto|#FE538B / #FED701 / #01C94D|

Fraunces 600/700 nos títulos; Karla 400/500/700 na interface. Nada de fonte manuscrita. Não use preto ou branco puros. Terra Barro não é cor de parágrafos. Névoa fica reservada a divisores, não a texto nesta interface; há uma inconsistência no documento entre essa proibição e uma tabela que a permite sobre fundos escuros, resolvida aqui de forma conservadora com Creme Papel. Nunca usar a tríade expressiva como texto. Gradiente somente Aurora → Vazante → Broto, contínuo, discreto, fora da área de leitura. Aurora não ocupa mais de 20% da peça sobre Creme. Distribuição orientadora Confluência: 60% base, 30% estrutura, 10% acento, sem converter isso em quota rígida de pixels.

Cards Confluência com raio 24 px; etiquetas pill; traço fino 2 px Terra Barro e traço expressivo 6 px quando pertinente, conforme o documento. Divisores neutros podem usar Névoa; foco e limites essenciais precisam de contraste verificável. Sem box-shadow, drop-shadow, glow, glassmorphism ou gradiente cinza. Profundidade por camadas Creme/Areia, bordas e espaço. Use ícones vetoriais coerentes com o conjunto existente e rótulos textuais. Não copiar os tamanhos de peças de Instagram ou pontos de impressão para a web.

As seguintes dimensões são propostas de adaptação web, não tokens já comprovados da marca: conteúdo até 1200 px; margens 16/24/32 px; gaps 16/24/32 px; título responsivo 32–48 px; corpo 16–18 px, entrelinha 1,5–1,6; apoio 14 px; botões com alvo mínimo 44×44 px. Reutilize equivalentes existentes. Formalize extensões nos tokens do produto em vez de espalhar números mágicos. Em até 639 px, coluna única; 640–1023 px, composição intermediária; a partir de 1024 px, painel duplo quando indicado. Sem rolagem horizontal a 320 px ou controles sob o teclado virtual. Conteúdo longo rola no fluxo; rodapé fixo só se não encobrir texto/foco. Use unidades dinâmicas de viewport quando necessário.

Transições propostas de 160–240 ms para seleção e painéis; animação ambiental lenta e opcional. prefers-reduced-motion remove deslocamento, flutuação e escalas contínuas; preserva toda a funcionalidade. Elementos decorativos são aria-hidden. Não associe emoções a cores morais, progresso a cura ou conclusão a sucesso psicológico.

## Contrato fullstack comum

Experiência efêmera em memória é o padrão. Texto antes de começar: “Você pode experimentar sem salvar. Para guardar no seu histórico, escolha Salvar ao finalizar.” Nada de autosave de conteúdo íntimo, localStorage, URL, logs ou sessão de replay com respostas. “Sem salvar” não é sinônimo de funcionamento offline: a página e conteúdo podem precisar de conexão. Preferências não sensíveis, como movimento reduzido e volume, podem usar o mecanismo já existente. Não guardar rascunhos sensíveis ao recarregar. Ao sair com conteúdo ainda não salvo, oferecer “Continuar aqui” e “Sair sem salvar”, sem obrigar a guardar.

Persistência via Supabase/PostgreSQL e camada canônica do portal. Sessão autenticada determina user\_id no servidor. Modelo base da tabela privada indicada adiante: id uuid, user\_id uuid referenciando auth.users com exclusão em cascata, client\_request\_id uuid, schema\_version integer, content\_version text, created\_at/updated\_at timestamptz gerados no servidor; UNIQUE(user\_id, client\_request\_id). Demais colunas no contrato específico. Não salve um JSON arbitrário sem schema: valide campos, enums, comprimentos, limites e relações no servidor e crie CHECKs onde cabem. Catálogo publicado e respostas privadas são domínios separados. Preserve snapshots editoriais mínimos das opções selecionadas para que mudanças de rótulo não reescrevam o passado.

Operações equivalentes a create, list(cursor, limit ≤ 50), get(id), update(id, expectedVersion), delete(id) e exportOwnData conforme o recurso. Use Server Actions ou API conforme padrão real; não implemente ambas. Criar é idempotente pela chave de requisição; atualizar usa versão de linha para não sobrescrever edição concorrente silenciosamente. Respostas tipadas com validation\_error, unauthenticated, forbidden/not\_found, conflict e unavailable. Em erro de rede mantenha o rascunho apenas na memória e ofereça nova tentativa com a mesma chave. Sucesso visual somente após confirmação real; botão desabilitado durante envio. Em conflito, permitir recarregar o registro ou manter rascunho para comparação; não sobrescrever automaticamente.

RLS habilitada em todas as tabelas privadas: SELECT/DELETE USING(auth.uid() = user\_id); INSERT WITH CHECK(auth.uid() = user\_id); UPDATE com USING e WITH CHECK para impedir troca de dono. Nenhuma política geral de leitura para admin, tutor ou outros alunos. Não exponha service-role no cliente; endpoints normais devem operar com sessão do usuário, sem contornar RLS. Exportação e exclusão repetem a autorização; downloads privados sem bucket público e com cache privado/no-store. Validar cookies/CSRF/origin conforme o framework e a infraestrutura existente. Registros não entram em caches compartilhados. Índice (user\_id, created\_at desc, id) para histórico paginado.

“Privado” significa acesso restrito no produto, não criptografia ponta a ponta: acesso operacional privilegiado do provedor precisa seguir a política de segurança existente. Interface: “Este registro fica no seu histórico privado. Professores e outros alunos não têm acesso por esta ferramenta.” Botões “Exportar meus registros” e “Excluir registro”; confirmação descreve o item. Exclusão remove o dado ativo e reflete a política real de backups, sem prometer apagamento instantâneo de cópias de segurança. Logs técnicos nunca incluem payload pessoal, tokens ou valores selecionados.

Conteúdo editorial: reutilizar catálogo/CMS; se ausente, migration para resource\_content\_versions (resource\_key, version, status draft/published/archived, configuration validada, reviewer, timestamps). Leitura de alunos só das versões publicadas autorizadas; escrita via autorização administrativa existente e RLS correspondente. Publicação atômica fixa uma versão por sessão, valida referências e exige textos/assets completos. Admin gerencia conteúdo, ordem, disponibilidade, créditos e versões, nunca lê os registros pessoais. Não entregar botão administrativo sem operação de backend. Conteúdo de demonstração fica como rascunho identificado; não publicar como material clínico oficial. Sem credenciais disponíveis, entregue migrations e teste local; declare explicitamente que aplicação remota ainda não foi validada.

Analytics somente no mecanismo existente e conforme preferências vigentes: resource\_opened, resource\_started, resource\_completed, resource\_exited e save\_failed com resource\_key, content\_version e duração em faixa. Não incluir emoção, intensidade, regiões do corpo, posições, necessidades, frases, IDs de registros pessoais ou texto livre. Desativar captura de formulários e session replay nas rotas. Não criar SDK de analytics se não houver um. Não conceder pontos por registrar intimidade, manter sequência diária ou terminar com uma emoção específica.

## Estados, acessibilidade e linguagem

Prever loading de conteúdo, vazio editorial, erro com nova tentativa, prática ativa, revisão, envio, sucesso, histórico vazio, edição, conflito e exclusão. Loading apenas para trabalho real. Catálogo indisponível: “Não foi possível carregar esta experiência. Tente novamente.” Histórico vazio: “Você ainda não guardou registros aqui.” Falha de salvamento: “Não foi possível salvar. Seu registro continua nesta tela.” Saída efêmera: “Ao sair, este registro não será guardado.” Confirmação real: “Registro salvo no seu histórico privado.” Não inventar contagens ou mostrar zero quando um dado é desconhecido.

Fluxo completo por teclado, foco visível, ordem DOM coerente, headings hierárquicos, nomes acessíveis e labels. Diálogo usa primitive acessível existente: foco inicial, trap, Escape, retorno ao acionador e fundo inerte. Arrastar nunca é o único modo de agir. Canvas/SVG têm alternativa HTML funcional; cor, posição e som não são únicas fontes de informação. Checar contraste efetivo WCAG AA (4,5:1 texto comum; 3:1 texto grande e componentes essenciais) em estados normal/hover/foco/selecionado, inclusive sobre gradientes. Anunciar mudanças pontuais via live region, nunca cada frame ou segundo.

Tom em português brasileiro: convite, observação e autonomia. Não diagnosticar, interpretar ausência de resposta, prescrever tratamento, afirmar efeito fisiológico ou prometer regulação. “Não sei”, “Pular” e “Encerrar” são saídas legítimas. Nos exercícios corporais, oferecer interromper e adaptar sem julgamento. Não gerar conteúdo clínico automaticamente a partir de dados íntimos.

## Verificação e entrega obrigatórias

Execute os comandos reais de tipos/lint/build e testes pertinentes; registre falhas preexistentes. Teste a interação central, cancelamento sem mutação, persistência após recarga, falha de rede sem falso sucesso, idempotência e saída. Testes de integração com usuários A/B devem provar que B não lista, lê, altera, exporta ou exclui dados de A; aluno não publica catálogo; admin não acessa dados privados por interface nem endpoints comuns; usuário anônimo não salva. Não se limite a mock de RLS: exercite banco local de teste quando disponível.

QA manual em 390×844, 768×1024 e 1440×900, além de largura 320 px, zoom 200%, teclado, reduced motion e texto longo. Verifique reload, voltar do navegador, expiração da sessão, console e requisições sem dados íntimos vazando. Cubra critérios particulares abaixo. Entregue arquivos alterados, migrations, seed editorial, evidências de telas e fluxo, comandos/resultados e limitações reais. Não declare funcionalidade remota, áudio ou acessibilidade como testados sem observá-los. Não faça deploy público nem aplique migrações de produção sem autorização pertinente.

