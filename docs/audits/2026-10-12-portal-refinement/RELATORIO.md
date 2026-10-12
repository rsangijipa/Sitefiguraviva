# Análise do portal Figura Viva

12 de outubro de 2026 — versão local acessada em `http://localhost:3000`.

O portal já tem uma linguagem visual consistente. Os ganhos mais relevantes são compactar os cabeçalhos, ajustar informações dos cursos, manter o contexto na autenticação, disponibilizar opções globalmente e corrigir contraste no dark mode. A nova atmosfera atrás da árvore deve acrescentar profundidade sem substituir a identidade existente.

Entregas: [plano detalhado](PLANO.md), [prompt de referência](PROMPT.md) e implementação concluída no projeto. O cabeçalho compartilhado agora usa a ilustração cobrindo a faixa inteira e uma camada de contraste que acompanha o tema. A atmosfera da árvore é um SVG animado com cores pastel claras no tema claro e tons mais profundos no tema escuro; ela se estende além da copa e do tronco.

## Método e limites

Observação das páginas principais no navegador in-app, capturas salvas e inspecionadas e leitura de componentes/rotas/serviços. Páginas públicas observadas em desktop; home, login, cadastro e barreira administrativa também observados com viewport de 390 × 844. A preferência dark foi acionada pela interface da home. As imagens representam o código local, não comprovação da versão publicada.

Na auditoria inicial, o painel administrativo redirecionou ao login. Durante a implementação, foi disponibilizada uma sessão administrativa para revisar painel e criação de cursos em viewport móvel; não foram criadas matrículas, aprovados pagamentos nem enviados e-mails. O Google teve o início testado, mas não concluiu autenticação; por segurança, a opção permanece oculta até haver configuração funcional. O envio de e-mails foi integrado por meio de outbox e Resend, mas exige as credenciais e o domínio verificado no ambiente. A verificação automatizada de tema claro/escuro foi feita por tokens e seletores; nem toda combinação de rota e conteúdo foi capturada manualmente.

Na segunda rodada, as páginas públicas observadas usam o componente de cabeçalho comum. A ilustração preenche toda a faixa sem competir com a leitura. As cores de fundo atrás da árvore são SVG vetorial com paleta configurada por tema, movimento lento, pausa fora da tela e respeito à preferência por movimento reduzido. Typecheck e ESLint dos componentes alterados passaram.

Algumas navegações locais excederam o tempo de espera do navegador e renderizaram depois. Capturas transitórias sem formulário e capturas extensas com conteúdo ainda oculto por animações não foram usadas como achados. O botão de desenvolvimento do Next.js nas imagens pertence ao ambiente local.

## Inventário observado

| Nº | Tela/etapa | Saúde e achado principal | Evidência |
| --- | --- | --- | --- |
| 1 | Home, desktop | Boa identidade; fundo discreto, textos longos e informação temporal a revisar | 01 |
| 2 | Instituto | Estrutura clara; conteúdo incompleto e hero grande | 02 |
| 3 | Fundadora | Retrato e hierarquia funcionam; resumo incompleto e Lattes genérico | 03 |
| 4 | Laura Perls | Conteúdo rico; hero diferente e dados textuais a revisar | 04 |
| 5 | Formações | Ofertas acessíveis; classificação do destaque inconsistente | 05 |
| 6 | Biblioteca | Contradição entre destaque existente e mensagem de nenhum recurso | 06 |
| 7 | Estante | Diferencia acervo e recomendações; espaçamento superior duplicado | 07 |
| 8 | Galeria | Acervo disponível; recorte da imagem principal inadequado | 08 |
| 9 | Blog | Lista vazia e grande espaço sem conteúdo; categorias sem ação | 09 |
| 10 | Recursos | Catálogo claro; título principal repetido logo abaixo | 10 |
| 11 | Detalhe de curso fechado | Estado fechado comunicado; cartaz cortado; fluxo de curso aberto existe no código | 11 |
| 12 | Login, desktop | Fundo adequado; retorno sem moldura | 12 |
| 13 | Google, início da ação | Carregamento sem conclusão observada; estado persiste ao trocar modo | 13 |
| 14 | Login, celular | Card cabe em 390 px, sem overflow observado | 14 |
| 15 | Cadastro, celular | Longo mas rolável; oferece curso fechado; não aprovado fim a fim | 15 |
| 16 | Editor administrativo, tentativa de acesso | Bloqueado por autenticação; redirecionamento preserva destino | 16 |
| 17 | Home, celular | Texto, CTAs e árvore cabem; opções presentes somente nesta página | 17 |
| 18 | Home, dark e menu aberto | Mudança de tema funciona; ícones sem texto visível | 18 |
| 19 | Rodapé da home em dark | Contraste visivelmente insuficiente, texto escuro sobre verde | 19 |

## Achados e prioridades

### Prioridade alta — inscrição e autenticação

**Contexto perdido na troca de modo.** Em `src/app/auth/page.tsx`, o switcher navega para `/auth` ou `/auth?mode=signup`, descartando `courseId`, `next` e intenção administrativa. O aluno precisa retomar sua escolha. Corrigir preservação e redirecionamento antes de refinamento visual.

**Turma fechada disponível para cadastro.** O detalhe de “Vivendo na Fronteira” apresenta “Inscrições encerradas”; o dropdown do cadastro oferece o mesmo curso. Há também divergência de apresentação entre home (“Curso livre”, “Início em breve”), catálogo (“Supervisão”, “4 semanas”) e conteúdo de encontros já datados. Validar o cadastro comercial e usar uma regra comum para elegibilidade e apresentação. Não inferir novas datas ou reabrir turmas.

**Google não comprovado.** Após o clique efetivo no login já carregado, Google/submit ficaram desabilitados com spinner, sem retorno ou mensagem de erro no estado observado. O loading persistiu ao alternar para cadastro. A evidência não distingue configuração do provedor, ambiente local ou falha na conclusão. O prompt pede validação real e ocultação da opção se não funcional.

**E-mail de matrícula não demonstrado.** Os arquivos de matrícula e notificações examinados não mostraram serviço transacional dedicado para confirmação de matrícula. Existe confirmação de conta/convite por autenticação, que é outro evento. A implementação deve verificar toda a cadeia antes de integrar Resend e distinguir recebido/pendente/efetivado.

### Prioridade alta — tema e administração

**Botão somente na home.** `HomeClient` monta `FloatingControls`, mas `PublicSiteFrame` não. A ausência também é visível nas páginas internas. Centralizar uma única instância que preserve tema e áudio ao navegar.

**Contraste do rodapé em dark.** A imagem 19 mostra texto e marca escuros sobre fundo verde. O rodapé usa `text-paper`; esse token escurece no tema dark. Criar token de texto inverso independente da cor de papel.

**Tema reinicia por carregamento.** `ThemeProvider` começa claro a cada carga e não persiste a escolha. O tipo declara “system”, mas a implementação o resolve como claro. Corrigir persistência, inicialização e preferência de sistema. O hero público também mantém overlay de aquarela claro e o admin define `color-scheme: light`: revisar ambos.

**Agenda pouco estruturada.** A criação usa `frequency`, `date` e `location` como texto; `workload` é apresentado em minutos. Não há editor dedicado de início/fim de encontro nesse formulário. A edição deve usar o mesmo componente de agenda e preservar legado. Fuso deve ser explícito porque cartazes anunciam Brasília.

**Responsividade do admin ainda pendente.** Há menu mobile, foco/Escape e tabelas com scroll no código, o que é uma boa base. Grades de duas colunas em formulários/modais e calendário de sete colunas merecem inspeção. Não foram observadas as telas protegidas; o plano lista todo o inventário para testes autenticados.

### Prioridade média — cabeçalhos e conteúdo

**Tamanho e altura variáveis dos heroes.** `PublicPageHero` tem padding superior de 128/160 px e usa imagens em `object-cover` sobre toda a área; a altura muda conforme título/ações. Laura usa `min-h-[82svh]`. A Estante aplica `fv-section` ao redor do hero, acrescentando respiro. Padronizar slot e offset, sem forçar altura que corte títulos.

**Biblioteca exclui destaque da pesquisa.** O código faz `[featured, ...remaining]` e filtra `remaining`. Com um item, a lista fica vazia e a mensagem parece negar o acervo. Buscar o conjunto completo ou explicar “nenhum material adicional”; não criar outra caixa grande vazia.

**Blog vazio versus home com publicação.** A home contém link para um artigo e o blog lista nenhum post. A tela vazia não comprova ausência no banco: pode haver diferença de publicação/fonte ou falha de consulta. Categorias são `span`, não filtros. Investigar origem, aplicar filtros funcionais e melhorar vazio/erro.

**Foto da galeria.** A faixa em destaque mostra majoritariamente teto, enquanto as miniaturas revelam pessoas. Ajustar `object-position`/ponto focal. No curso, o cartaz perde parte do título: preferir enquadramento que preserve texto integral.

**Revisão editorial.** Instituto/fundadora têm trechos terminados em “...”. Lattes vai ao domínio geral. Na página Laura, o DOM contém nomes com caracteres estranhos e “85 anos de atuação”; isso exige confirmação editorial e de fontes. As afirmações históricas não foram checadas como fatos nesta auditoria.

## Acessibilidade e qualidade

Pontos positivos observados: idioma português, link de pular conteúdo, labels de login, mostrar senha, nomes acessíveis de controles, inputs de 16 px no card e menu administrativo com lógica de foco no código. Isso não comprova conformidade completa.

Verificações requeridas: contraste claro/escuro medido, teclado nos menus e lightboxes, leitura por tecnologia assistiva, alvos de toque, foco em mudança de etapa, zoom/reflow, mensagens de erro e movimento reduzido. Evitar que controles flutuantes encubram botões no celular. Som deve depender de gesto e refletir sucesso real de reprodução.

## Evidências visuais

### 01 — Home desktop

![Home desktop](C:/Users/aless/Downloads/Sitefiguraviva/docs/audits/2026-10-12-portal-refinement/screenshots/01-home.png)

### 02 — Instituto

![Instituto](C:/Users/aless/Downloads/Sitefiguraviva/docs/audits/2026-10-12-portal-refinement/screenshots/02-instituto.png)

### 03 — Fundadora

![Fundadora](C:/Users/aless/Downloads/Sitefiguraviva/docs/audits/2026-10-12-portal-refinement/screenshots/03-fundadora.png)

### 04 — Laura Perls

![Laura Perls](C:/Users/aless/Downloads/Sitefiguraviva/docs/audits/2026-10-12-portal-refinement/screenshots/04-laura-perls.png)

### 05 — Formações

![Formações](C:/Users/aless/Downloads/Sitefiguraviva/docs/audits/2026-10-12-portal-refinement/screenshots/05-formacoes.png)

### 06 — Biblioteca

![Biblioteca](C:/Users/aless/Downloads/Sitefiguraviva/docs/audits/2026-10-12-portal-refinement/screenshots/06-biblioteca.png)

### 07 — Estante

![Estante](C:/Users/aless/Downloads/Sitefiguraviva/docs/audits/2026-10-12-portal-refinement/screenshots/07-estante.png)

### 08 — Galeria

![Galeria](C:/Users/aless/Downloads/Sitefiguraviva/docs/audits/2026-10-12-portal-refinement/screenshots/08-galeria.png)

### 09 — Blog

![Blog](C:/Users/aless/Downloads/Sitefiguraviva/docs/audits/2026-10-12-portal-refinement/screenshots/09-blog.png)

### 10 — Recursos

![Recursos](C:/Users/aless/Downloads/Sitefiguraviva/docs/audits/2026-10-12-portal-refinement/screenshots/10-recursos.png)

### 11 — Curso

![Curso](C:/Users/aless/Downloads/Sitefiguraviva/docs/audits/2026-10-12-portal-refinement/screenshots/11-curso.png)

### 12 — Login desktop

![Login desktop](C:/Users/aless/Downloads/Sitefiguraviva/docs/audits/2026-10-12-portal-refinement/screenshots/12-login.png)

### 13 — Google em carregamento

![Google em carregamento](C:/Users/aless/Downloads/Sitefiguraviva/docs/audits/2026-10-12-portal-refinement/screenshots/13-google-state.png)

### 14 — Login celular

![Login celular](C:/Users/aless/Downloads/Sitefiguraviva/docs/audits/2026-10-12-portal-refinement/screenshots/14-login-mobile.png)

### 15 — Cadastro celular

![Cadastro celular](C:/Users/aless/Downloads/Sitefiguraviva/docs/audits/2026-10-12-portal-refinement/screenshots/15-cadastro-mobile.png)

### 16 — Barreira de acesso administrativo

![Acesso administrativo](C:/Users/aless/Downloads/Sitefiguraviva/docs/audits/2026-10-12-portal-refinement/screenshots/16-admin-gate.png)

### 17 — Home celular

![Home celular](C:/Users/aless/Downloads/Sitefiguraviva/docs/audits/2026-10-12-portal-refinement/screenshots/17-home-mobile.png)

### 18 — Home dark e opções

![Home dark](C:/Users/aless/Downloads/Sitefiguraviva/docs/audits/2026-10-12-portal-refinement/screenshots/18-home-dark.png)

### 19 — Rodapé dark

![Rodapé dark](C:/Users/aless/Downloads/Sitefiguraviva/docs/audits/2026-10-12-portal-refinement/screenshots/19-home-dark-footer.png)
