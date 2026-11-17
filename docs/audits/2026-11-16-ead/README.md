# Melhorias do painel EAD — 16/11/2026

## Resultado

O painel do aluno agora prioriza a retomada do estudo, seguida dos indicadores, pendências, atalhos e acompanhamento. Os blocos receberam superfícies suaves em verde, azul, âmbar e lavanda, com títulos maiores e tratamento específico para o tema escuro. O gráfico semanal apresenta os valores sem depender de hover.

A barra inferior foi removida. Todos os destinos anteriores continuam acessíveis na lateral: início, cursos, recursos, comunidade e conta. A lateral também oferece certificados, materiais, agenda, áudio, registros privados e ajuda. No celular/tablet, o botão Menu abre o mesmo conteúdo em um drawer modal, com foco contido, fechamento por Escape, retorno ao acionador e rolagem independente. Os links principais têm alvo de pelo menos 48 px e texto de 16 px.

## Cursos e aulas

- Busca de cursos com normalização de acentos, filtro de cursos em andamento/concluídos e ordenação por nome/último acesso. Os filtros atuam sobre os cursos com acesso liberado; inscrições em análise permanecem em sua seção própria.
- Grades com uma coluna no celular, duas em telas intermediárias e três quando há largura suficiente. Capas usam enquadramento integral para preservar textos de cartazes.
- Uma única consulta de catálogo é reutilizada para resolver matrículas e ofertas disponíveis.
- A mensagem de inscrição em análise deixou de afirmar que o pagamento já foi confirmado.
- Abas do curso se distribuem pela largura disponível e aceitam navegação por setas/Home/End no teclado.
- Na aula, a lista lateral abre automaticamente somente em telas a partir de 1280 px. Em celular e tablet, o aluno escolhe quando abri-la, preservando a área de leitura/vídeo.
- Busca de aulas dentro dos módulos, estados de bloqueio preservados, abertura do módulo da aula selecionada e controles anterior/próxima adaptados à largura.

## Recursos exclusivos e outras páginas

A moldura compartilhada de experiências usa agora `dialog.showModal()`, na camada nativa superior do navegador. Isso evita que transformações/animações dos contêineres do portal recortem a janela. O recurso ocupa o viewport dinâmico, possui cabeçalho persistente, conteúdo com rolagem própria, safe areas e integração para não disputar a rolagem com Lenis. Escape passa pelo fluxo existente de confirmação de descarte de rascunho. Os controles de acesso, publicação editorial e salvamento não foram substituídos.

A ajuda passou de uma tela provisória para um guia com dúvidas frequentes, links úteis e contato por e-mail. Materiais e agenda passaram a oferecer erro explícito e nova tentativa. O serviço de materiais propaga falhas de consulta, em vez de apresentá-las como biblioteca vazia; a seleção de cursos da comunidade também pode tratar corretamente essa falha.

Na revisão das demais áreas, já existem notas/devolutivas por curso, certificados, comunidade, áudio, configurações, check-in e histórico privado. A página de trilhas/metas ainda anuncia disponibilidade futura e não foi apresentada como uma funcionalidade pronta.

## Pesquisa Moodle e próximos incrementos

Foram consultadas fontes oficiais, usando o Moodle como referência de funcionalidades, sem copiar código nem introduzir dependência do Moodle.

| Referência | Aproveitamento nesta entrega | Próximo incremento sugerido |
|---|---|---|
| [My courses / Course overview](https://docs.moodle.org/501/en/Course_overview) | Busca, filtro de situação, ordenação e progresso mais acessíveis. | Favoritos e preferência persistente de visualização, se houver demanda. |
| [Dashboard](https://docs.moodle.org/501/en/Dashboard) | Separação entre retomada, indicadores e pendências; atalhos secundários abaixo da ação principal. | Permitir ao aluno recolher ou reorganizar blocos. |
| [Timeline](https://docs.moodle.org/501/en/Timeline_block) | Mantida a exibição dos eventos e avaliações disponíveis existentes. | Linha do tempo por prazo, com datas canônicas de entrega, fuso e permissões definidos pela equipe. Não foram inventados prazos ou lembretes. |
| [Activity completion](https://docs.moodle.org/501/en/Activity_completion) | Preservadas as regras atuais e ampliada a orientação sobre progresso, notas e certificados. | Checklist unificado das condições de conclusão, mostrando exatamente quais avaliações/etapas ainda impedem o certificado. |

A prioridade seguinte recomendada é o checklist de conclusão por formação, seguido da linha do tempo de prazos. Ambos precisam usar as regras e dados do servidor para evitar divergência entre o que a tela mostra e o que libera a conclusão. Notificações agendadas e exportação da agenda são uma etapa posterior; não estão incluídas nesta entrega.

## Validação e limites

A validação de navegador usa os componentes reais com dados fictícios e serviços substituídos em um harness local. Ela comprova layout e interação, não autenticação, consultas reais, matrícula ou emissão real de certificado. Nenhum aluno, nota, pagamento ou conteúdo publicado foi modificado. Não houve deploy.

- 38 verificações de navegador aprovadas, sem erros de página: larguras de 320, 390, 768, 1024, 1440 px e 844 × 390 em paisagem; sem overflow horizontal nas rotas verificadas.
- Busca e filtros de cursos, seleção/busca de aulas, menu por teclado, foco, Escape e modal no topo do viewport com final alcançável aprovados. Temas claro/escuro e preferência por movimento reduzido incluídos.
- A janela de recurso foi montada propositalmente dentro de um ancestral com `transform`, `overflow: hidden` e altura de 220 px: o modal continuou usando o viewport inteiro.
- Regressão de cabeçalho dos recursos adaptada à semântica de dialog nativo; teste novo cobre Escape pelo guard de rascunho e restauração de rolagem.
- Build final de produção aprovada, com lint, TypeScript e geração de 42 páginas estáticas. Saída isolada em `.next-ead-refinement-build`.
- Suíte completa: 186 suítes e 937 testes aprovados; uma suíte/sete testes legados ignorados. `git diff --check` sem erros de whitespace.
- A primeira build encontrou restrições de rede/arquivos do sandbox; a repetição com execução autorizada concluiu. A tentativa inicial de navegador encontrou uma falha de foco no menu, corrigida e revalidada. O cabeçalho dos recursos teve os testes atualizados para o uso de dialog nativo.
- A entrada temporária da build no tsconfig foi removida ao final. As alterações preexistentes em `e2e/resources-smoke.spec.ts` e as demais alterações preexistentes do tsconfig foram preservadas.
- Evidências e harness reproduzível: `reports/ead-ui-2026-11-16`. O harness usa esbuild e Playwright já disponíveis e não instala novas dependências do produto.

Não foi realizada certificação completa de acessibilidade, teste em aparelhos físicos ou homologação com conta real nesta rodada. As capturas abaixo usam conteúdo fictício, inclusive os nomes de curso/aluno e indicadores.

## Capturas inspecionadas

[Dashboard desktop](portal-1440.png) · [Dashboard celular](portal-390.png) · [Tema escuro](portal-dark-390.png) · [Menu celular](mobile-menu-390.png) · [Cursos celular](portal-courses-390.png) · [Aula tablet](portal-course-demo-lesson-lesson-1-768.png) · [Modal tablet](resource-modal-768.png).
