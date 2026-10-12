# Plano de refinamento do portal Figura Viva

Data: 12 de outubro de 2026. Base: versão local do projeto, observação no navegador e leitura do código atual. Entrega solicitada: análise, plano e prompt de implementação. Nenhuma alteração funcional foi aplicada ao portal nesta etapa.

## Direção

Preservar a árvore, a aquarela, as fontes Fraunces e Karla e a identidade verde/papel. Fazer ajustes pontuais de densidade, informações, enquadramento e continuidade dos fluxos. A correção deve começar nos componentes compartilhados para evitar diferenças entre páginas.

## Ordem de execução

| Etapa | Trabalho | Resultado verificável |
| --- | --- | --- |
| 1 — Conversão | Corrigir contexto curso/login/cadastro; filtrar turmas disponíveis; validar Google | O aluno sai do curso, autentica e volta à inscrição do mesmo curso |
| 2 — Padronização | Compactar cabeçalhos e uniformizar a área das ilustrações | Mesma escala visual e alinhamento nas páginas internas, sem texto cortado |
| 3 — Home | Fundo de aquarela sutil em movimento, revisão dos cards e datas | A árvore ganha profundidade, o texto permanece legível e as ofertas têm informações coerentes |
| 4 — Temas e controles | Controle global de som/tema e cores semânticas | O botão aparece em todas as páginas e o dark mode tem contraste consistente |
| 5 — Administração | Agenda estruturada e revisão de todas as telas no celular | Criar/editar cursos e administrar registros é possível em 360–430 px |
| 6 — Comunicação | E-mails por estado da inscrição/matrícula | Mensagens reais, deduplicadas, rastreáveis e coerentes com a liberação de acesso |
| 7 — Validação | Navegação, mobile, teclado, tema, OAuth e e-mail | Evidências antes/depois e pendências explicitamente registradas |

## Ajustes por página

| Página | Diagnóstico da sessão | Ajuste proposto |
| --- | --- | --- |
| Home | Árvore forte visualmente; fundo muito discreto. Cards exibem descrições extensas e “Próximos inícios” inclui abril de 2026. Home divulga artigo enquanto o blog está vazio. | Criar atmosfera atrás da árvore; compactar transição para formações; resumir cards; usar dados atuais e estado de turma; alinhar conteúdo da home e blog. Não mudar datas por suposição. |
| Instituto | Cabeçalho grande; manifesto com “...”; cronologia fixa; expressão “A memória da fundadora” não combina claramente com “conduz este campo”. | Compactar topo; completar conteúdo com fontes do instituto; validar cronologia; revisar frase sem sugerir fatos biográficos não confirmados. |
| Fundadora | Nome quebra em duas linhas; resumo com “...”; Lattes aponta para a página geral. | Escala mais compacta; preservar retrato; completar resumo e usar link individual confirmado; manter as informações editáveis. |
| Laura Perls | Hero próprio com `min-h-[82svh]`, diferente das outras páginas; retrato grande. DOM apresenta nomes com caracteres estranhos e “85 anos de atuação”. | Adotar as mesmas regras de espaçamento e área visual, preservando o retrato; revisar encoding, títulos e informações históricas com referências. Não tratar tempo de vida como tempo de atuação. |
| Formações | Aquarela existente; classificação “Supervisão” no destaque “Vivendo na Fronteira”, que é descrito como grupo de estudos. | Uniformizar hero, revisar classificação e dados; apresentar data, horário, modalidade e inscrições com clareza. |
| Biblioteca | Um item em destaque e mensagem de “Nenhum Recurso Encontrado” na lista. O código exclui o destaque da busca. | Pesquisar o acervo completo, inclusive destaque; diferenciar acervo vazio, nenhum resultado e nenhum item adicional; reduzir caixa vazia. |
| Estante | Espaço extra acima da aquarela: seção aplica espaçamento além do hero. Curadoria e lista com poucas obras. | Retirar espaçamento duplicado; uniformizar ilustração; preservar proporção das capas e a distinção biblioteca/estante. |
| Galeria | Foto em destaque recorta principalmente teto; pessoas ficam fora da área visível. | Ajustar ponto focal por imagem; permitir edição do enquadramento; preservar rostos e legendas; verificar visualizador por toque e teclado. |
| Blog | Nenhum post na lista; categorias são `span`, com aparência de filtro; área vazia usa `min-h-screen`. | Alinhar fonte/publicação com home; implementar filtros reais ou retirar aparência de ação; reduzir grande vazio; tratar falha de consulta separadamente de acervo vazio. |
| Recursos | O mesmo título “Recursos para estudar” aparece no hero e logo abaixo. | Remover repetição; padronizar topo; manter instruções de acesso e tempo de uso claras; verificar também cada recurso individual. |
| Curso | Fluxo de inscrição já implementado para curso aberto; curso observado está fechado; cartaz corta parte do título. | Reutilizar fluxo existente; CTA conforme estado e sessão; enquadrar cartazes com `contain`; tornar datas/horários estruturados visíveis fora da imagem. |
| Login | Fundo adequado; retorno ao início sem moldura. Google entrou em carregamento sem completar a navegação observada. | Preservar background; dar fundo claro, borda e padding ao retorno; validar OAuth; ocultar botão se não funcional; permitir recuperação de erro. |
| Cadastro | Formulário longo; curso fechado aparece nas opções; alternância de modo perde `courseId` e `next` no código; carregamento Google persiste entre modos. | Transformar apenas o card em passos simples; pré-selecionar curso; preservar contexto; mostrar apenas turmas elegíveis; separar carregamento por ação. |
| Painel administrativo | Acesso bloqueado por autenticação; código já tem menu mobile e tabelas roláveis. Criação de curso usa campos de texto para frequência/datas e não possui editor estruturado de horário. | Revisar todas as telas autenticadas em celulares; reaproveitar shell existente; aprimorar agenda na criação e edição do curso. |

## Padrão sugerido de cabeçalhos

Valores iniciais para ajuste visual, não alturas rígidas: navegação de 72–88 px no desktop e 64–72 px no celular; respiro após a navegação de 32–48 px no desktop e 24–32 px no celular; intervalo entre hero e primeiro conteúdo de 32–48 px. O título deve usar escala fluida, com referência de 48–60 px no desktop e 32–40 px no celular, ajustada para nomes longos.

As ilustrações internas devem compartilhar um slot de aproximadamente 420 × 280 px no desktop e 260 × 180 px no celular, mantendo proporção e ponto focal. Se continuarem como backgrounds, usar uma camada de arte com largura, escala e posição consistentes, independente da altura do texto. Retratos, capas e fotos devem manter suas proporções naturais; não forçar esses materiais a caber no mesmo recorte decorativo. A home permanece com sua composição própria, mas com respiros compatíveis.

## Home e árvore

Adicionar atrás da árvore uma aquarela com verdes, amarelos, rosas e azulados retirados da própria copa, com transparência baixa, sombra difusa na base e movimento lento. Usar textura existente ou asset adequado, sem recriar ou substituir a árvore. Movimento inicial de referência: ciclos de 18–30 segundos, deslocamento de 6–12 px e variação suave de opacidade. Animar transform/opacity em camadas leves; evitar filtros caros animados e vídeo pesado. Manter estático com `prefers-reduced-motion`; pausar quando fora da área visível. O texto e os CTAs não devem receber o movimento.

## Inscrição, login e cadastro

Fluxo esperado: curso → “Fazer inscrição” → entrar ou criar conta → confirmar e-mail, quando necessário → continuar inscrição do mesmo curso → estado final com orientação de acesso ou pagamento/revisão.

No cadastro, sugerir “Seus dados”, “Dados de acesso” e “Confirmação”, alterando somente a caixa central e preservando background. Se o usuário vem de um curso, mostrar seu nome em um resumo e evitar nova escolha obrigatória. Se chega diretamente ao cadastro, selecionar uma turma aberta antes de enviar. Não alterar a regra comercial existente de cadastro vinculado a curso sem necessidade.

Manter `courseId`, `next` e intenção administrativa ao alternar modo, recuperar senha e concluir OAuth. Validar destinos locais seguros. Mostrar erros junto dos campos, requisitos de senha, opção de visualizar senha e estado de envio claro. Não criar contas, fazer matrículas ou enviar e-mails reais durante a auditoria visual.

## Agenda de cursos

Unificar criação e edição em “Datas e horários”. Separar: início/fim do curso, encontros individuais, horário inicial/final, recorrência, modalidade, plataforma/local e fuso horário do curso. Não assumir o fuso do navegador: cursos podem anunciar horário de Brasília mesmo para alunos de Rondônia/Manaus. Exibir o fuso de forma explícita e preservar instantes corretamente.

Adicionar encontro, duplicar, editar, remover com recuperação e visualizar resumo antes de salvar. Validar fim posterior ao início, campos obrigatórios e conflitos relevantes. Oferecer recorrência mensal/quinzenal com prévia das datas e exceções. Distinguir duração do curso, duração do encontro e carga horária. Exibir carga horária em horas/minutos de forma compreensível, mantendo compatibilidade com o armazenamento atual em minutos. Não somar encontros e substituir silenciosamente carga curricular aprovada.

Compatibilizar registros legados (`date`, `frequency`, `details.schedule`) sem perda de dados. A agenda validada deve alimentar página do curso, inscrição, calendário e e-mail.

## Matriz de revisão administrativa no celular

Todas as telas abaixo ainda exigem inspeção visual autenticada. A presença de classes responsivas no código não comprova funcionamento.

| Grupo | Telas e estados obrigatórios |
| --- | --- |
| Visão geral | Dashboard; indicadores; ações rápidas; vazio/carregamento/erro |
| Pessoas | Usuários e permissões; interessados; matrículas; inscrição individual/lote; revisão de pagamento |
| Cursos | Listagem; novo curso; editor; configurações; currículo; módulos/aulas; builder; materiais; alunos; comunidade; avisos |
| Avaliação | Aprovações; avaliações nova/edição; submissões; correção individual |
| Conteúdo | Blog/formulário; recursos/admin quando disponível; galeria nova/edição; documentos/upload; livros novo/edição |
| Operação | Calendário; eventos/modal; gamificação; Google Suite |
| Sistema | Logs; utilidades; configurações de instituto, fundadora, equipe, SEO, legais e gerais; analytics/comunidade quando acessíveis |

Verificar em 360, 390 e 430 px, tablet 768 px e desktop: nenhum overflow da página; tabela com scroll local ou cards; nomes e ações acessíveis; formulários em uma coluna; modais com scroll e botão de fechar acessível; uploads funcionais; teclado virtual sem encobrir ação; menu com foco/Escape/retorno de foco; alvos de toque de pelo menos 44 px. Calendário deve oferecer agenda/lista no celular. Grades fixas de duas colunas, controles no rodapé e botão flutuante de salvar exigem atenção especial.

## Tema e som em todo o portal

Montar os controles em uma camada global persistente, sem duplicação nos layouts públicos, autenticação, inscrição, área do aluno, recursos e administração. Separar a ação WhatsApp quando não pertinente ao painel, mantendo som/tema disponíveis. Melhorar o “+” com tamanho, borda, contraste, foco e menu com rótulos visíveis. Definir seleção Claro/Escuro/Sistema, persistir escolha e inicializar sem flash.

Migrar superfícies/textos/bordas para tokens semânticos; em superfícies verdes, usar texto inverso estável, não `text-paper` que escurece com o tema. Revisar overlays claros dos heroes, card de autenticação, cards, rodapé, tabelas e modais. O admin atualmente força `color-scheme: light` e tokens próprios: criar variantes equivalentes. Não basta aplicar remapeamento genérico de `bg-white`.

O som deve começar só após ação do usuário; atualizar “tocando” somente após `play()` bem-sucedido; tratar erro/pausa/fim; preservar estado entre rotas e impedir dois players simultâneos. Evitar colisão com WhatsApp, cookies, “voltar ao topo” e salvar no admin; respeitar safe areas e teclado.

## API de e-mail pesquisada

Recomendação técnica inicial: Resend, pela integração documentada com Next.js, chaves de idempotência e webhooks de estado. Alternativa: Brevo, com API de e-mail transacional. A escolha não envolve contratação nesta etapa.

- [Resend com Next.js](https://resend.com/docs/send-with-nextjs): exige chave da API e domínio verificado.
- [Domínios Resend](https://resend.com/docs/dashboard/domains/introduction): verificar remetente/DNS conforme documentação.
- [Idempotência Resend](https://resend.com/docs/dashboard/emails/idempotency-keys): janela de 24 h; manter também deduplicação durável no banco para eventos repetidos após essa janela.
- [Webhooks Resend](https://resend.com/docs/webhooks/introduction): acompanhar eventos e validar assinatura conforme documentação atual.
- [API transacional Brevo](https://developers.brevo.com/docs/send-a-transactional-email): alternativa de integração.
- [Google no Supabase](https://supabase.com/docs/guides/auth/social-login/auth-google): referência para validar provedor e URLs de retorno.

Separar três mensagens: confirmação do e-mail da conta, recebimento da inscrição e matrícula efetivada. Enviar a última quando o estado persistido habilitar o acesso, não simplesmente quando o aluno envia formulário. Cobrir aprovação administrativa, gratuito, Pix e Stripe conforme fluxos reais existentes.

Usar serviço no servidor, fila/outbox durável, chave única por evento de matrícula, tentativas com backoff e logs sem segredos. Falha de envio não deve desfazer matrícula válida. Expor no painel: pendente, enviado, entregue, falhou; reenvio autorizado e limitado. “Aceito pela API” não equivale a “entregue”. Template: nome, curso, estado, datas/horários/fuso, modalidade e link apropriado ao portal. Não enviar links privados de reunião a inscrições pendentes. Documentar `RESEND_API_KEY`, remetente e segredo de webhook somente no servidor.

## Critérios de conclusão

Capturar antes/depois em desktop e celular; verificar claro/escuro em cada rota do inventário; recarregar e navegar preservando tema; testar curso aberto/fechado e aluno novo/existente/matriculado; manter contexto ao alternar autenticação; validar início e retorno OAuth com conta de teste; comprovar recebimento de e-mail em destinatário de teste autorizado; testar falha e duplicidade sem duplicar mensagem; verificar agenda, fuso e legado. Executar lint, TypeScript e testes pertinentes aos fluxos alterados. Registrar qualquer etapa que não pôde ser validada; não apresentar integração como funcional só por existir no código.
