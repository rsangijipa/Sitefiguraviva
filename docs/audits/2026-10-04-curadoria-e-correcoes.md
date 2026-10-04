# Figura Viva — curadoria e correções dos recursos

Data: 04/10/2026. Implementação baseada no relatório de qualidade desta mesma data.

A biblioteca passou de **24 para 12 recursos disponíveis**, uma redução de **50%**. As dez entradas em preparação também foram retiradas. O catálogo completo passou de 34 para 12 entradas. As mudanças são locais; não houve publicação em produção.

## Biblioteca resultante

| Recurso mantido | Decisão e correção |
| --- | --- |
| Roda das Emoções | Lista como apresentação inicial no celular; reinício com nome acessível; diário agora abre, lê e apaga registros; gravação só anuncia sucesso depois de persistir; identificação da conta passada diretamente, sem reaproveitar a identidade anterior; aviso verdadeiro sobre armazenamento neste navegador. |
| Árvore das Emoções | Centralização do texto separada da animação, largura limitada à área útil e rolagem para mensagens longas. Mensagem verificada integralmente em 360 px. |
| Mapa Corporal | União com Intensidade Agora. Cada região conserva sua intensidade de 1 a 5; conclusão mostra região, sensação e intensidade; reinício limpa ambos; pontos da silhueta com área de toque de 44 px e controles expostos como grupo acessível. |
| Diário do Aqui e Agora | Absorve o check-in na chegada e conserva o percurso por corpo, sentimentos, necessidades e reflexão. Campos opcionais, avanço sem preencher, texto do campo identificado, indicadores mais compactos e confirmação de salvamento condicionada à gravação. |
| Necessidades Agora | Mantido pela clareza da proposta, opção de incerteza e exploração por necessidades. Recebe as correções comuns de tema, janela e navegação. |
| Sala de Pausa | Uma janela reúne pausa livre, respiração guiada, grounding e escuta, em quatro seções. Trocar de seção desmonta o player anterior. Respiração com instrução persistente e legível, encerramento identificado e conclusão sem botões aninhados. |
| Lago | Quatro modos com nomes acessíveis no mobile; controles principais de 44 × 44 px, agrupados em linhas que cabem na tela; cores dos ajustes corrigidas para superfícies claras. |
| Rio dos Pensamentos | Experiência única para observar pensamentos em movimento. Substitui o Jardim, preservando inserção de pensamentos, alternativa com movimento reduzido e encerramento com decisão separada sobre guardar uma nota. O caderno inoperante e os exemplos iniciais do Jardim deixam de ser publicados. |
| Figura e Fundo | Mantido pela coerência entre composição e conceito; recebe correções comuns. |
| Banco de Microcasos | Experiência de casos fictícios para estudo; substitui a oferta paralela de Caso Clínico, cuja leitura e promessas editoriais ficaram abaixo do padrão. Não foi incorporado o conteúdo clínico não validado do recurso retirado. |
| Cartas Gestálticas | Mantidas pela organização de estudo, revisão e favoritos; recebem correções comuns. |
| Ciclo do Contato | Mantido pelo percurso didático e aviso sobre os limites do modelo; recebe correções comuns. |

As uniões preservam as funções mais consistentes. Não são uma combinação indiscriminada de todas as telas anteriores: as funções quebradas e o conteúdo editorial não validado foram descartados da oferta.

## Recursos retirados

| Recurso | Motivo |
| --- | --- |
| Banco de Quizzes | Resultado autoral incorreto e avanço concorrente. Saiu da publicação; o questionário defeituoso não foi reapresentado como corrigido. |
| SomaScan | Sobreposição dos controles no celular, códigos em inglês na conclusão e duplicidade com Mapa Corporal. |
| Duas Cadeiras | Corte da segunda perspectiva em celulares de 320 e 360 px. |
| Polaridades | Exploração pouco aprofundada nesta implementação, com proposta próxima de outras experiências já mantidas. |
| Fronteiras de Contato | Acabamento desigual e alternativas com classificação de tensão antes da escolha. |
| Caso Clínico Interativo | Leitura comprometida e promessa editorial que requer validação e referências. Microcasos permanece como proposta de estudo. |

Entradas não implementadas retiradas: Respiração Livre, Campo de Composição, Respiração Sonora, Laboratório Fenomenológico, Pergunta ou Interpretação?, Treinador de Awareness, Construtor de Experimentos, Supervisão Express, Mapa de Campo e Linha do Processo.

## Apresentação e comportamento comuns

- O filtro “Mostrar todos” inicia selecionado. Cada categoria começa recolhida em uma linha: quatro cards no desktop, dois no tablet e um no celular. Quando há recursos além dessa linha, um botão abaixo permite expandir e recolher a categoria. Trocar de filtro recolhe as categorias. Os cards não dependem de animação de entrada para ficarem visíveis.
- O aviso educativo ficou junto ao texto de abertura, sem caixa larga nem seção separada. O espaço entre a abertura, os filtros e as categorias foi reduzido.
- Cada card contém apenas uma ilustração pequena de 17 px, título e descrição limitada por CSS a duas linhas. Badges de disponibilidade, privacidade e duração saíram dos cards.
- O cabeçalho da janela tem apenas a ação de voltar; o X redundante foi removido. Botões de fechar painéis internos continuam quando têm função própria.
- Todo carregamento começa claro, inclusive quando havia tema escuro salvo ou o sistema operacional usa escuro. Uma mudança manual de tema vale enquanto o site permanece aberto e não é restaurada ao recarregar.
- O modal retorna a mesma saída inicial no servidor e no cliente e só cria o portal após montar, corrigindo a divergência de hidratação encontrada no relatório.
- A janela acompanha a mudança de rota, corrigindo o caso em que abrir outro recurso depois de voltar alterava a URL sem abrir a experiência.
- Os recursos oferecidos no editor de aulas vêm do mesmo catálogo de 12 entradas. A rota alternativa da Árvore também converge para a experiência mantida.
- Links públicos antigos de experiências consolidadas redirecionam ao destino correspondente. Recursos retirados e itens não implementados não têm experiência publicada. As páginas antigas de Jardim e Sons no portal também redirecionam.

A retirada foi feita do catálogo, dos carregadores públicos e da oferta no editor. Código legado e dados já existentes foram preservados, inclusive alterações que antecediam esta tarefa; não houve apagamento de históricos pessoais.

## Verificação

- Testes dos recursos, experiências compartilhadas e tema: **112 testes aprovados em 28 suítes**. Foram adicionados casos para separação entre conta e visitante, falha de gravação, histórico inválido, intensidade por região e reinício claro mesmo com preferências anteriores escuras.
- Checagem TypeScript do projeto e ESLint dos componentes alterados.
- Navegador: catálogo compacto; Mapa e Diário em 320 × 800; conclusão do Mapa com intensidade 4/5; cinco etapas do Diário concluídas sem respostas; abertura do diário da Roda; navegação de volta e troca de recurso; início, pausa e encerramento da respiração; abertura de grounding e escuta na Sala; mensagem da Árvore em 360 × 800; controles e ajustes do Lago em 360 × 800; rota do quiz retirado exibindo 404; Intensidade Agora redirecionando ao Mapa Corporal.

Evidências desta implementação ficam na pasta `2026-10-04-recursos-evidence/`: capturas 40 a 46 e a captura final do catálogo. A captura 44 foi substituída por um estado estável; imagens de carregamento não foram usadas como prova de defeito.

A nota **6,3/10** pertence à auditoria anterior à implementação. Não foi atribuída uma nova nota sem repetir a avaliação completa. Persistência autenticada, conteúdo clínico, áudio físico, Safari/iOS, teclado virtual e build de produção não foram validados nesta etapa. Não houve migração de históricos nem implantação.

Refinamento posterior do catálogo: TypeScript e ESLint aprovados, com oito testes de navegação e estrutura em duas suítes. A apresentação foi conferida em 1280, 768 e 360 px; expansão por categoria, filtro Aprender, retorno a Mostrar todos, acionamento com Enter e recarregamento com seleção padrão foram verificados no navegador. Capturas 48 e 49 registram a apresentação mobile e desktop.
