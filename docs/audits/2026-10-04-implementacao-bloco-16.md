# Bloco 16 — configurações compartilhadas e aprovação administrativa

Data: 04/10/2026. Alterações locais sobre os blocos 14 e 15 preservados. Sem commit, push, deployment ou escrita no Supabase nesta rodada.

## Correções

A página Google substituía todo o JSON `config` pelo formulário, enquanto o editor de contato gravava apenas WhatsApp/áudio sobre o mesmo registro. Agora ambos salvam pelo servidor, com administrador ativo, validação e merge dos respectivos campos. A gravação usa o `updated_at` lido como condição; caso outro editor salve antes, relê o conteúdo e tenta novamente, no máximo três vezes. Uma criação simultânea também é tratada. Erros de leitura ou conteúdo inválido não provocam substituição por valores vazios. O mesmo campo editado por dois administradores ainda segue o último salvamento; não há comparação com a versão em que o formulário foi aberto.

Google deixa de enviar o conteúdo completo do registro ao formulário. Falha no carregamento impede salvar defaults. “Descartar” restaura os valores carregados ou o último salvamento bem-sucedido. Inputs têm rótulos associados e ficam desabilitados durante leitura/gravação. A indicação “Conectado” passa a “Cadastrado” e o teste simulado foi removido: registrar um ID não comprova integração nem configura permissões no Google. Links de Forms são limitados a HTTPS dos hosts Google esperados; IDs têm limites e validação. Calendar/Drive/Forms/YouTube continuam referências, sem afirmar que seus consumidores futuros estão concluídos.

A aprovação comum de acesso aceita explicitamente `manual` e `free`; Pix continua na reconciliação específica. Stripe, método ausente ou desconhecido retornam erro antes da mutação. O cartão administrativo oferece aprovação comum apenas para os métodos suportados. O banco continua sendo a autoridade de estado, perfil ativo e auditoria; o ajuste não transforma concessão manual em pagamento confirmado.

## Evidência do banco e documentação

Consulta somente de leitura confirmou `key` e `updated_at` obrigatórios, trigger `public_pages_set_updated_at`, campos de contato em `config` e as condições de Pix/manual na função `set_enrollment_admin_state`. Nenhum registro de aluno, configuração, pagamento ou política foi alterado. Os advisors de segurança mantêm os avisos já analisados no bloco 15: dois INFO para tabelas internas sem política pública, um WARN de search_path, seis funções em cada grupo de execução e um WARN de proteção contra senhas vazadas desativada. Não houve novo ajuste de permissões. Consulte a [configuração de segurança de senhas](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection), o [linter de search_path](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable), os [avisos de execução anon](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable), os [avisos authenticated](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable) e o [linter de políticas ausentes](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy). Os helpers usados por políticas não devem ter permissões revogadas indiscriminadamente; a análise contextual está no bloco 15.

Foram consultados o [changelog do Supabase](https://supabase.com/changelog), a [referência de update](https://supabase.com/docs/reference/javascript/update) e a [referência de maybeSingle](https://supabase.com/docs/reference/javascript/using-modifiers-maybesingle). O índice Markdown do changelog não foi suportado pela ferramenta; a página HTML foi usada. Não houve mudança de schema ou dependência.

## Validação

Cópia isolada sem arquivos de ambiente reais: lint, tipos e build de produção aprovados; 601 testes Jest aprovados em 130 suítes (sete ignorados dependentes de emulator), 30 testes de scripts aprovados, cinco cenários públicos de navegador aprovados e seis verificações HTTP aprovadas. Os testes novos cobrem merge entre seções, conflito de atualização/criação, conteúdo inválido, falha de leitura, limites da repetição, descarte/salvamento da tela e métodos de matrícula não suportados.

As verificações HTTP confirmam logout de mesma origem 200, origem externa/ausente 403 e checkout/portal/webhook Stripe 503. O navegador verifica rotas públicas, homepage e navegação de recursos inclusive viewport de 360 px; não representa jornada administrativa/autenticada real. A build gerou 45 páginas estáticas. Avisos de cache do webpack pela cópia/junction e de depreciação do Sentry não impediram a compilação.

O manifesto dos 1.073 arquivos runtime/testes corresponde ao diretório local: SHA-256 `8d1ead9297a2851d9b6a697f01d77d0d28821dbc724d996b99393d57de681505`. Logs completos estão no laboratório privado `validation-block-16`; [evidência consolidada](2026-10-03-evidence/validation-block-16.json). Não houve mudanças de código posteriores ao snapshot validado. Todos os processos de validação e o servidor próprio de navegador foram encerrados.

## Progresso e pendências

OPS-04 tem a correção principal implementada localmente, mantendo publicação e homologação pendentes. ENR-02 permanece parcial: Pix está unificado, os métodos comuns estão explicitamente delimitados, mas a jornada autenticada e as exceções financeiras ainda precisam ser homologadas. O backlog passa a 14 principais implementados, 22 parciais e 9 planejados: 31 itens têm alguma pendência, sem equivaler a percentual de esforço ou autorização de lançamento.

Prioridade seguinte: publicar/conferir a versão validada, estabelecer homologação, SMTP e recuperação de acesso, informar banco e dados reais de Pix, testar o crédito bancário e revisar dados comerciais/contratuais. Revogação no provedor e classificação dos três PDFs antigos continuam pendentes. EAD permanece posterior. O lembrete de cadastro centralizado de mediadores não foi implementado.
