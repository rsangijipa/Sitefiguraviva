# Implementação do bloco 06 — contas, inscrições e primeiro acesso

Data: 03/10/2026, horário de Manaus. Prioridade: administração necessária para operar o site e as inscrições com Pix inicial e conferência manual.

## Correções entregues

A conversão de interessado consulta a ficha no servidor e usa exclusivamente seu `user_id` e `course_id`. O e-mail exibido vem do perfil vinculado; a operação não depende de `answers.email` nem aceita a identidade enviada pela tela. A conversão prepara o pedido Pix da matrícula/primeira parcela e mantém pagamento e acesso pendentes. Não marca pagamento como recebido nem cria outra conta. Pedidos existentes são recuperados com seu valor original. A liberação continua na conferência bancária do bloco 04.

O contato comercial ganhou o campo separado `contacted_at`. Marcar contato não retira a ficha da condição elegível para cobrança. Uma ficha histórica com status `contacted` é normalizada dentro da transação de preparação do Pix; se a preparação falhar, a normalização também é desfeita. Nenhuma ficha real foi normalizada nesta execução.

A listagem, contato e exclusão de interessados passaram para ações de servidor protegidas por administrador. A listagem combina fichas com perfis e cursos, verificando erros das consultas. Fichas com matrícula são preservadas; exclusão de uma ficha sem matrícula deixa um evento administrativo. A tela recarrega depois das alterações e permite abrir o painel de conferência Pix.

As alterações de cargo e atividade usam uma função de banco com autorização e evento na mesma transação. Há proteção contra remover, rebaixar ou desativar o último administrador ativo, inclusive em alterações diretas e exclusão em cascata de Auth. A própria conta administrativa não pode se desativar, excluir ou perder o cargo por essa ação. Cargo e situação são validados em execução, além dos tipos TypeScript.

O bloqueio/desbloqueio de Auth agora verifica o campo `error` do SDK. Ao desativar, o perfil é bloqueado primeiro; uma falha posterior de Auth é comunicada como operação incompleta. Ao ativar, Auth é desbloqueado antes da ativação do perfil. O prazo de banimento foi ajustado de `87600000h` para `876000h`. As duas APIs não fazem parte de uma transação distribuída: falhas parciais exigem conferir a conta antes de repetir.

A exclusão verifica vínculos reais por chaves estrangeiras com `profiles`. Contas com inscrições ou histórico devem ser desativadas. Um segundo bloqueio no banco impede a exclusão em cascata de um perfil dependente. Para uma conta sem vínculos, a ação desativa o perfil, solicita a exclusão em Auth e confirma a remoção canônica por cascata. Não apaga o perfil separadamente quando Auth falha. Os eventos administrativos não têm FK que apague o próprio histórico ao remover uma conta sem outros vínculos.

A concessão manual de acesso valida um curso publicado antes de convidar uma conta. Uma matrícula nova recebe um UUID real do banco, acesso ativo e pagamento pendente; o evento registra que essa concessão não confirmou pagamento. Uma matrícula ativa/concluída existente é preservada. Matrículas pendentes Pix ou de outro meio exigem sua própria revisão e não são sobrescritas. Revogar ou concluir acesso não cria matrícula ausente e não simula reembolso. Aprovação manual atualiza acesso, responsável e evento numa transação.

O lote tem limite de 100 entradas, remove e-mails repetidos e processa resultados individuais. O retorno separa o indicador de conclusão da lista de alunos inscritos, corrigindo a propriedade `success` que antes era sobrescrita pelo array. A interface explica a concessão de acesso sem confirmação financeira e atualiza os cartões depois de aprovação, conclusão, revogação ou lote. Falhas, inclusive exceções de rede, são exibidas.

Contas novas criadas pelo administrador usam convite Supabase por e-mail para a página de definição de senha. A criação preserva um perfil já existente e não reativa uma conta desativada. A lista de usuários oferece solicitar acesso por e-mail para a conta existente, conferindo endereço e estado do perfil/Auth e limitando reenvios. Essa ação não entrega token/link ao administrador nem cria outra conta. Telefone e conclusão do perfil vêm dos campos reais, sem deduzir 100% apenas de nome e e-mail.

## Supabase aplicado

Migração `supabase/migrations/20261004005913_block_06_admin_governance_enrollment.sql`, aplicada e registrada no projeto `jdxorryvmcvtqsddkpdm`. O nome usa o UTC emitido pelo CLI; a execução ocorreu em 03/10 no horário de Manaus.

Foram criadas sete funções RPC `SECURITY INVOKER`, restritas ao backend: governança de perfis, consulta de dependências, concessão manual de acesso, preparação Pix de uma ficha, registro de contato, exclusão de ficha sem matrícula e alteração administrativa de acesso. As funções verificam administrador ativo quando alteram registros. Dois triggers preservam o último administrador ativo e o histórico vinculado a um perfil. A tabela `admin_operation_events` tem RLS, leitura administrativa e somente SELECT/INSERT para a aplicação, sem UPDATE/DELETE.

A consulta `supabase/tests/block_06_verification.sql` confirmou as permissões e proteções no banco real: um administrador ativo; duas fichas; nenhum contato marcado ou evento administrativo criado; zero pedidos/eventos Pix; dois cursos. Matrículas existentes: três ativas, três canceladas e uma pendente. O indicador `inactive_profiles_with_active_enrollment` continua em zero. Não foram criadas, excluídas ou bloqueadas contas reais, enviados e-mails reais ou preparados pagamentos reais durante a verificação.

## Verificação

- 30 verificações SQL passaram em PostgreSQL isolado PGlite, com os tipos `app_role`/`enrollment_status` e a migração Pix. Cobriram autorizações, último administrador, alteração em lote, preservação de dependências, exclusão em cascata com um papel exclusivo de Auth, concessão manual sem confirmação de pagamento, Pix pendente, reexecução, contato e trilha de operações.
- 377 testes Jest passaram em 97 suítes. Sete testes e uma suíte permanecem ignorados. Os testes novos cobrem falhas devolvidas pelo SDK, erros de rede, identidade canônica, convites, lote e atualização dos cartões.
- TypeScript passou; lint direcionado aos 16 arquivos de código e testes alterados passou.
- Build final passou (exit 0, 384 segundos), incluindo a atualização dos cartões e o tratamento de erros de rede.

Evidências privadas e scripts de reprodução ficam em `C:\Users\aless\.codex\visualizations\2026\10\03\01a10335-acef-7420-876c-e473e31d8446\validation-block-06`. A evidência sanitizada está em `docs/audits/2026-10-03-evidence/implementacao-bloco-06.json`.

O laboratório usa Next 15.5.25 com WASM, credenciais fictícias e Supabase local somente de leitura. Alterações comportamentais foram testadas com registros fictícios no banco isolado. No Supabase real, foram aplicados esquema/permissões e feitas consultas agregadas. O advisor continua com os mesmos 14 avisos anteriores; nenhum deles foi declarado resolvido por este bloco.

A implementação segue as APIs documentadas de [convite por e-mail](https://supabase.com/docs/reference/javascript/auth-admin-inviteuserbyemail), [acesso por e-mail sem criar usuário](https://supabase.com/docs/reference/javascript/auth-signinwithotp) e [alteração administrativa de Auth](https://supabase.com/docs/reference/javascript/auth-admin-updateuserbyid).

## Homologação e próximos blocos

O frontend permanece local. Publicação e homologação completas ainda são necessárias. Conferir SMTP, entrega efetiva do convite/link, template de e-mail, URL de redirecionamento permitida e conclusão de senha com uma conta de teste. Os testes do SDK usam respostas simuladas; não demonstram entrega de e-mail. O reenvio usa link de acesso por e-mail; um template configurado exclusivamente para código precisa ser ajustado ao fluxo de link.

Testar operações concorrentes com conexões independentes no ambiente de homologação. A proteção usa travas e transações; os testes isolados demonstram reexecução e alteração em lote, não uma corrida real entre múltiplas conexões. Exercer falhas parciais de Auth e conferir o resultado na tela e no banco.

Banir/excluir uma conta não prova a invalidação imediata de todo JWT já emitido. As guardas de perfil ativo dos blocos anteriores continuam relevantes; revisar sessões e políticas das tabelas auxiliares permanece no backlog. As políticas antigas de `applications` continuam existentes e ainda precisam de versionamento e testes completos por papel; mover a tela para ações protegidas não substitui essa revisão.

Concessão manual de acesso é uma operação administrativa explícita e não serve para conferir pagamento. Cobranças posteriores, saldo integral, Pix rejeitado a reabrir, estorno, crédito duplicado, retenção documental e contratos permanecem pendentes. O EAD continua com prioridade posterior ao site e às inscrições.

A próxima prioridade é homologar a jornada site → conta → ficha → Pix → conferência → acesso, com SMTP/Storage e dados comerciais reais configurados pelo responsável. Permanecem os itens de segredos históricos, dependências, SEO/contato e CI/recuperação registrados na auditoria. Não houve remoção dos 205 arquivos candidatos; a build sem esses arquivos já passou no experimento anterior, mas os testes de regressão daquele experimento falharam. Eles foram preservados.
