# Prompt fullstack — Necessidades Agora

Copie este arquivo inteiro para o agente de implementação na raiz do repositório Figura Viva.

## Objetivo e conteúdo

Crie uma seleção tátil de necessidades percebidas no momento, 2–4 minutos. Card: “Dê lugar ao que parece mais presente agora.” CTA “Explorar necessidades”. Abertura “Do que você sente necessidade agora?” Apoio “Escolha o que faz sentido. Você não precisa ter certeza nem resolver tudo hoje.” Não deduza necessidades de emoções ou ofereça plano terapêutico.

Seed editorial em rascunho com cards: Descanso (“Tempo para interromper ou diminuir o ritmo”); Conexão (“Estar em contato com alguém”); Segurança (“Perceber condições de proteção e previsibilidade”); Autonomia (“Ter espaço para escolher”); Expressão (“Dar forma ao que quer dizer”); Apoio (“Contar com ajuda”); Privacidade (“Ter um espaço só seu”); Clareza (“Compreender melhor uma situação”). Termos e descrições devem ser revisados. Opções “Outra, em minhas palavras” e “Ainda não sei”. Cada necessidade pode ter perguntas abertas; não prometer que uma ação sempre a atende.

## Rotas e organização

/portal/recursos/necessidades-agora, /historico e /admin/recursos/necessidades-agora. Diretório src/features/interactive-resources/current-needs/: CurrentNeedsExperience.tsx; components/NeedCard.tsx, NeedsLibrary.tsx, PresentNeedsTray.tsx, NeedPriorityControls.tsx, SmallStepForm.tsx, NeedsSummary.tsx, NeedsHistory.tsx; types.ts, schema.ts, reducer.ts, repository.ts e catálogo versionado. Reusar cards de seleção e sortable somente se já houver primitive acessível de boa qualidade. Não confundir este ranking local com engine de recomendação.

## Layout específico

Desktop: biblioteca em grade de 3 colunas ocupando 65%; bandeja “Mais presentes agora” com 35%, superfície Areia. Mobile: grade de 2 colunas com botões de seleção; bandeja no fluxo abaixo e âncora “Ver minhas escolhas (n)”, sem tapar cards com rodapé. Tablet: grade 2–3 conforme largura. Seleção por borda Verde Raiz, check e texto “Selecionada”; ícone simples de traço com mesma família visual. Uso contido de Broto em detalhe gráfico; nunca necessidade urgente em cor alarmista. A bandeja tem espaço real de vazio: “Escolha até 5 necessidades para observar mais de perto.”

## Fluxo e regras de interação

intro → selecting → prioritizing → optionalStep → reviewing → saved ou exit. Clique adiciona/remove; arrastar para bandeja é atalho, nunca requisito. Máximo 5, sem duplicação; exceder mostra explicação e mantém escolha anterior. A ordem inicial é ordem de escolha, explicitada como tal. “Ordenar por presença” é opcional; se não ordenar, não chamar primeiro item de prioridade. Quando ativado, controles “Mover acima/abaixo” e drag handle fazem a mesma mudança. Marcar uma necessidade “Quero observar esta primeiro” é ação explícita, não inferência do índice.

Abrir detalhes de card não o seleciona automaticamente. Remover selecionada devolve ao catálogo com foco previsível. “Outra” até 80 caracteres e descrição opcional ≤200; não publicar. “Ainda não sei” permite encerrar ou salvar um registro de indefinição, sem lista fictícia. Não permitir simultaneamente estado indefinido e seleção sem clarificar a mudança.

Etapa opcional: “Existe um pequeno gesto possível?” textarea até 300; apoio “Pode ficar em branco.” Exemplo editorial “Separar alguns minutos sem uma tarefa” apenas se a pessoa abrir exemplos, sem impor. Não gerar tarefa, lembrete ou mensagem a outra pessoa. Resumo lista escolhas, ordenação apenas se habilitada e gesto nas palavras do aluno. “Você deu nome ao que parece presente agora.” Ações de editar, guardar e encerrar sem guardar.

## Persistência e administração

Tabela need_records com base comum; state selected/unsure, entries[{need_id nullable, custom_label nullable, label_snapshot}], ordered boolean, focus_entry_id nullable, small_step nullable ≤300. No máximo 5, relação foco deve referenciar item presente. ordered false conserva lista mas UI diz “Suas escolhas”, sem numerá-la como ranking. selected exige ao menos um item; unsure exige lista vazia. Edição atômica e histórico paginado com resumo legível; excluir foco ao remover o item focado. Sem contagem pública de necessidades ou inferência entre sessões.

Admin edita cards, descrições, perguntas e exemplos de gestos, ícones permitidos e ordem. Ícones escolhidos de allowlist, não SVG/HTML arbitrário. Disponibilidade e versão com preview mobile e publicação validada. Admin não acessa gestos ou necessidades de aluno.

## Assets e aceite

Um ícone vetorial por categoria, miniatura com cards próprios sobre Areia, sem fotos obrigatórias. Animação curta ao adicionar e respeitando reduced motion; não imitar jogos de colecionar. Frases e nomes continuam legíveis com texto ampliado.

Provar seleção/remover por toque e teclado, limite, reordenação com botões, cancelamento de drag, foco removido, estado indefinido, termo próprio, salvar sem gesto, histórico sem ordenação falsa e privacidade entre usuários. Não há tarefa externa criada nem correspondência automática emoção→necessidade.

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

| Papel | Token | Valor |
|---|---|---|
| Fundo | Creme Papel | #FDFAF4 |
| Superfície alternativa | Areia | #F1E9DB |
| Títulos e estrutura principal | Verde Raiz | #005A1F |
| Estrutura secundária | Verde Igarapé | #07614C |
| Etiquetas e acento quente | Terra Barro | #96551F |
| Texto corrido | Mata | #262B22 |
| Texto secundário | Pedra | #6B6B63 |
| Divisores | Névoa | #D8CFBE |
| Fundo escuro alternativo | Grafite | #4B4B49 |
| Acentos gráficos | Aurora / Vazante / Broto | #FE538B / #FED701 / #01C94D |

Fraunces 600/700 nos títulos; Karla 400/500/700 na interface. Nada de fonte manuscrita. Não use preto ou branco puros. Terra Barro não é cor de parágrafos. Névoa fica reservada a divisores, não a texto nesta interface; há uma inconsistência no documento entre essa proibição e uma tabela que a permite sobre fundos escuros, resolvida aqui de forma conservadora com Creme Papel. Nunca usar a tríade expressiva como texto. Gradiente somente Aurora → Vazante → Broto, contínuo, discreto, fora da área de leitura. Aurora não ocupa mais de 20% da peça sobre Creme. Distribuição orientadora Confluência: 60% base, 30% estrutura, 10% acento, sem converter isso em quota rígida de pixels.

Cards Confluência com raio 24 px; etiquetas pill; traço fino 2 px Terra Barro e traço expressivo 6 px quando pertinente, conforme o documento. Divisores neutros podem usar Névoa; foco e limites essenciais precisam de contraste verificável. Sem box-shadow, drop-shadow, glow, glassmorphism ou gradiente cinza. Profundidade por camadas Creme/Areia, bordas e espaço. Use ícones vetoriais coerentes com o conjunto existente e rótulos textuais. Não copiar os tamanhos de peças de Instagram ou pontos de impressão para a web.

As seguintes dimensões são propostas de adaptação web, não tokens já comprovados da marca: conteúdo até 1200 px; margens 16/24/32 px; gaps 16/24/32 px; título responsivo 32–48 px; corpo 16–18 px, entrelinha 1,5–1,6; apoio 14 px; botões com alvo mínimo 44×44 px. Reutilize equivalentes existentes. Formalize extensões nos tokens do produto em vez de espalhar números mágicos. Em até 639 px, coluna única; 640–1023 px, composição intermediária; a partir de 1024 px, painel duplo quando indicado. Sem rolagem horizontal a 320 px ou controles sob o teclado virtual. Conteúdo longo rola no fluxo; rodapé fixo só se não encobrir texto/foco. Use unidades dinâmicas de viewport quando necessário.

Transições propostas de 160–240 ms para seleção e painéis; animação ambiental lenta e opcional. prefers-reduced-motion remove deslocamento, flutuação e escalas contínuas; preserva toda a funcionalidade. Elementos decorativos são aria-hidden. Não associe emoções a cores morais, progresso a cura ou conclusão a sucesso psicológico.

## Contrato fullstack comum

Experiência efêmera em memória é o padrão. Texto antes de começar: “Você pode experimentar sem salvar. Para guardar no seu histórico, escolha Salvar ao finalizar.” Nada de autosave de conteúdo íntimo, localStorage, URL, logs ou sessão de replay com respostas. “Sem salvar” não é sinônimo de funcionamento offline: a página e conteúdo podem precisar de conexão. Preferências não sensíveis, como movimento reduzido e volume, podem usar o mecanismo já existente. Não guardar rascunhos sensíveis ao recarregar. Ao sair com conteúdo ainda não salvo, oferecer “Continuar aqui” e “Sair sem salvar”, sem obrigar a guardar.

Persistência via Supabase/PostgreSQL e camada canônica do portal. Sessão autenticada determina user_id no servidor. Modelo base da tabela privada indicada adiante: id uuid, user_id uuid referenciando auth.users com exclusão em cascata, client_request_id uuid, schema_version integer, content_version text, created_at/updated_at timestamptz gerados no servidor; UNIQUE(user_id, client_request_id). Demais colunas no contrato específico. Não salve um JSON arbitrário sem schema: valide campos, enums, comprimentos, limites e relações no servidor e crie CHECKs onde cabem. Catálogo publicado e respostas privadas são domínios separados. Preserve snapshots editoriais mínimos das opções selecionadas para que mudanças de rótulo não reescrevam o passado.

Operações equivalentes a create, list(cursor, limit ≤ 50), get(id), update(id, expectedVersion), delete(id) e exportOwnData conforme o recurso. Use Server Actions ou API conforme padrão real; não implemente ambas. Criar é idempotente pela chave de requisição; atualizar usa versão de linha para não sobrescrever edição concorrente silenciosamente. Respostas tipadas com validation_error, unauthenticated, forbidden/not_found, conflict e unavailable. Em erro de rede mantenha o rascunho apenas na memória e ofereça nova tentativa com a mesma chave. Sucesso visual somente após confirmação real; botão desabilitado durante envio. Em conflito, permitir recarregar o registro ou manter rascunho para comparação; não sobrescrever automaticamente.

RLS habilitada em todas as tabelas privadas: SELECT/DELETE USING(auth.uid() = user_id); INSERT WITH CHECK(auth.uid() = user_id); UPDATE com USING e WITH CHECK para impedir troca de dono. Nenhuma política geral de leitura para admin, tutor ou outros alunos. Não exponha service-role no cliente; endpoints normais devem operar com sessão do usuário, sem contornar RLS. Exportação e exclusão repetem a autorização; downloads privados sem bucket público e com cache privado/no-store. Validar cookies/CSRF/origin conforme o framework e a infraestrutura existente. Registros não entram em caches compartilhados. Índice (user_id, created_at desc, id) para histórico paginado.

“Privado” significa acesso restrito no produto, não criptografia ponta a ponta: acesso operacional privilegiado do provedor precisa seguir a política de segurança existente. Interface: “Este registro fica no seu histórico privado. Professores e outros alunos não têm acesso por esta ferramenta.” Botões “Exportar meus registros” e “Excluir registro”; confirmação descreve o item. Exclusão remove o dado ativo e reflete a política real de backups, sem prometer apagamento instantâneo de cópias de segurança. Logs técnicos nunca incluem payload pessoal, tokens ou valores selecionados.

Conteúdo editorial: reutilizar catálogo/CMS; se ausente, migration para resource_content_versions (resource_key, version, status draft/published/archived, configuration validada, reviewer, timestamps). Leitura de alunos só das versões publicadas autorizadas; escrita via autorização administrativa existente e RLS correspondente. Publicação atômica fixa uma versão por sessão, valida referências e exige textos/assets completos. Admin gerencia conteúdo, ordem, disponibilidade, créditos e versões, nunca lê os registros pessoais. Não entregar botão administrativo sem operação de backend. Conteúdo de demonstração fica como rascunho identificado; não publicar como material clínico oficial. Sem credenciais disponíveis, entregue migrations e teste local; declare explicitamente que aplicação remota ainda não foi validada.

Analytics somente no mecanismo existente e conforme preferências vigentes: resource_opened, resource_started, resource_completed, resource_exited e save_failed com resource_key, content_version e duração em faixa. Não incluir emoção, intensidade, regiões do corpo, posições, necessidades, frases, IDs de registros pessoais ou texto livre. Desativar captura de formulários e session replay nas rotas. Não criar SDK de analytics se não houver um. Não conceder pontos por registrar intimidade, manter sequência diária ou terminar com uma emoção específica.

## Estados, acessibilidade e linguagem

Prever loading de conteúdo, vazio editorial, erro com nova tentativa, prática ativa, revisão, envio, sucesso, histórico vazio, edição, conflito e exclusão. Loading apenas para trabalho real. Catálogo indisponível: “Não foi possível carregar esta experiência. Tente novamente.” Histórico vazio: “Você ainda não guardou registros aqui.” Falha de salvamento: “Não foi possível salvar. Seu registro continua nesta tela.” Saída efêmera: “Ao sair, este registro não será guardado.” Confirmação real: “Registro salvo no seu histórico privado.” Não inventar contagens ou mostrar zero quando um dado é desconhecido.

Fluxo completo por teclado, foco visível, ordem DOM coerente, headings hierárquicos, nomes acessíveis e labels. Diálogo usa primitive acessível existente: foco inicial, trap, Escape, retorno ao acionador e fundo inerte. Arrastar nunca é o único modo de agir. Canvas/SVG têm alternativa HTML funcional; cor, posição e som não são únicas fontes de informação. Checar contraste efetivo WCAG AA (4,5:1 texto comum; 3:1 texto grande e componentes essenciais) em estados normal/hover/foco/selecionado, inclusive sobre gradientes. Anunciar mudanças pontuais via live region, nunca cada frame ou segundo.

Tom em português brasileiro: convite, observação e autonomia. Não diagnosticar, interpretar ausência de resposta, prescrever tratamento, afirmar efeito fisiológico ou prometer regulação. “Não sei”, “Pular” e “Encerrar” são saídas legítimas. Nos exercícios corporais, oferecer interromper e adaptar sem julgamento. Não gerar conteúdo clínico automaticamente a partir de dados íntimos.

## Verificação e entrega obrigatórias

Execute os comandos reais de tipos/lint/build e testes pertinentes; registre falhas preexistentes. Teste a interação central, cancelamento sem mutação, persistência após recarga, falha de rede sem falso sucesso, idempotência e saída. Testes de integração com usuários A/B devem provar que B não lista, lê, altera, exporta ou exclui dados de A; aluno não publica catálogo; admin não acessa dados privados por interface nem endpoints comuns; usuário anônimo não salva. Não se limite a mock de RLS: exercite banco local de teste quando disponível.

QA manual em 390×844, 768×1024 e 1440×900, além de largura 320 px, zoom 200%, teclado, reduced motion e texto longo. Verifique reload, voltar do navegador, expiração da sessão, console e requisições sem dados íntimos vazando. Cubra critérios particulares abaixo. Entregue arquivos alterados, migrations, seed editorial, evidências de telas e fluxo, comandos/resultados e limitações reais. Não declare funcionalidade remota, áudio ou acessibilidade como testados sem observá-los. Não faça deploy público nem aplique migrações de produção sem autorização pertinente.
