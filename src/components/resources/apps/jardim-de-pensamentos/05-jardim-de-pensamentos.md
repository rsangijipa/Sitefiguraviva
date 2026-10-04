# Prompt fullstack — Jardim de Pensamentos

Copie este arquivo inteiro para o agente de implementação na raiz do repositório Figura Viva.

## Objetivo e distinção de produto

Crie um espaço de escrita breve com folhas que podem permanecer, flutuar temporariamente ou desaparecer, aproximadamente 2–5 minutos sem limite forçado. Card “Dê uma forma passageira ao que passa pela sua mente.” CTA “Entrar no jardim”. Abertura “Um lugar para pousar pensamentos.” Apoio “Escreva se quiser. Você pode guardar, observar ou deixar a folha sair desta experiência.” O jardim enfatiza composição e possibilidade de revisita; o Rio enfatiza passagem contínua. Não transformar os dois em uma tela idêntica com fundo diferente.

Nenhuma análise do conteúdo, categoria automática, moral de “pensamentos bons/ruins”, pontos por apagar ou promessa de livrar-se de algo. Texto de apoio: “Uma folha sair da tela não significa que um pensamento precise desaparecer.” Não usar exemplo íntimo como placeholder persistente; placeholder “Escreva uma frase, se quiser”.

## Rotas e módulos

/portal/recursos/jardim-de-pensamentos e /guardados; /admin/recursos/jardim-de-pensamentos. src/features/interactive-resources/thought-garden/: ThoughtGardenExperience.tsx; components/GardenStage.tsx, ThoughtComposer.tsx, ThoughtLeaf.tsx, LeafActions.tsx, SavedThoughtsList.tsx, GardenCompletion.tsx; reducer.ts, schema.ts, types.ts, repository.ts. Para quantidade pequena, DOM/HTML sobre SVG decorativo é suficiente; não adicionar WebGL. Conteúdo da folha é texto React escapado, nunca innerHTML. SavedThoughtsList não precisa montar toda a cena para editar/excluir um registro.

## Visual e responsividade

Desktop: jardim em 65% e escrita/ações em painel 35%; fundo Areia, caminhos e formas de canteiros em tons do núcleo e folhas Creme, borda Terra Barro. Formas orgânicas autorais, não clipart infantil. Textos sobre cartões legíveis, não deformados em textura; SVG de folha apenas em moldura ou marcador. Nenhum pensamento é renderizado minúsculo para caber. Cartões mostram trecho curto e “Ler completo”.

Mobile: composer antes do jardim, folhas em distribuição vertical de cartões sem sobreposição; no máximo 3 folhas visuais simultâneas, restantes na lista da sessão. Desktop até 8 visuais, com lista equivalente; usuário pode ter até 20 folhas efêmeras por sessão. Ao atingir o limite, oferecer guardar/retirar uma ou encerrar; não descartar texto silenciosamente. Contraste não diminui com idade da folha. Movimento ambiental opcional, sem blur/glow.

## Estados e semântica de cada ação

intro → composing → observing; cada folha tem draft/placed/floating/removed e savedRecordId opcional. Texto de 1–500 caracteres após trim; contador, quebra de linha e erro claro, sem truncar dado ao salvar. “Colocar no jardim” move rascunho válido para cena em memória. Editar abre editor com cópia temporária; cancelar não modifica original. Seleção mantém folha estável para leitura.

Menu explícito: “Guardar no meu histórico” persiste apenas essa folha após confirmação real; “Observar flutuar” anima a folha na sessão sem gravar; “Retirar desta sessão” a remove da cena. Antes de remoção efêmera, explicar que texto não guardado será perdido e oferecer cancelar. Não manter cópia oculta depois de afirmar remoção: se houver desfazer, explicar que o conteúdo permanece temporariamente e limpar após janela; preferir confirmação sem desfazer para a primeira versão. Não enviar folha efêmera a servidor.

Se a folha já foi guardada, ação diz “Retirar da cena”; apoio “A cópia guardada permanece no histórico”. “Excluir do histórico” é outra ação, confirmada, que remove registro persistido; nunca confundir fade visual com DELETE. Guardar repetidamente a mesma folha não duplica; editar folha guardada exige “Atualizar registro” para persistir, sem autosave. Se expiração de sessão impedir salvar, manter texto em memória e oferecer tentar novamente, sem pô-lo em redirect URL.

Em flutuação, controles “Pausar movimento” e “Trazer de volta”; reduced motion mostra mudança estática com indicação “Folha em observação”. Encerrar limpa folhas efêmeras; não apaga guardadas. Fechamento “Você pode voltar quando quiser.” e “Ver pensamentos guardados”. Não produzir resumo de temas ou emoções.

## Dados e administração

Tabela garden_thoughts com base comum, text varchar limite 500, optional_title nullable ≤80; não salvar coordenadas por padrão nem registrar folhas retiradas. Cada folha é unidade de salvamento/exclusão. Listagem só do proprietário; busca, se implementada, privada e sem analytics do termo. Exportação texto/JSON com conteúdo escapado. Quando disponibilizar CSV, neutralizar células que possam ser interpretadas como fórmulas. Sem compartilhamento público na primeira versão.

Admin edita instruções, placeholders, ajuda e assets; não há biblioteca administrativa de pensamentos dos alunos. Textos oficiais nunca se misturam a registros pessoais. Nenhum campo editor permite HTML executável. Assets decorativos com autoria/licença e alternativa sem animação.

## QA específica

Provar que colocar/flutuar/retirar antes de salvar não gera requisição com texto; salvar uma folha, recarregar e reencontrar; retirar da cena não exclui histórico; excluir histórico realmente remove acesso ativo; guardado versus efêmero tem rótulo claro; editar/cancelar preserva; texto HTML/script aparece literalmente; limite e texto longo no celular; teclado alcança toda folha e menu; encerrar cancela animações e elimina estado efêmero. Verificar redução de movimento com a sessão já aberta.

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
