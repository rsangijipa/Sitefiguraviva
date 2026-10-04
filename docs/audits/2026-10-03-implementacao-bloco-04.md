# Implementação do bloco 04 — inscrições e Pix inicial

Data: 03/10/2026. Escopo autorizado: matrícula ou primeira parcela, com confirmação manual do recebimento pelo administrador. O valor total do curso e as parcelas seguintes não são quitados por esta cobrança.

## Entregas

O código local agora gera uma cobrança persistida por aluno e curso. Ela guarda valor em centavos, identificador exclusivo, beneficiário e código Pix. Recarregar a página ou alterar posteriormente o preço do curso não altera uma cobrança existente. O aluno recebe QR code e Pix Copia e Cola, além do valor inicial antes de concluir a inscrição. O administrador configura esse valor nas configurações do curso; deixá-lo vazio impede novas cobranças.

A inscrição exige nome, telefone, profissão e aceite explícito. O servidor registra a data do aceite, confere identidade, perfil ativo e disponibilidade do curso. Reenviar a ficha não rebaixa uma inscrição já matriculada. Alunos com matrícula existente podem recuperar sua inscrição mesmo após o fechamento da oferta.

O envio de comprovante passou a ser real, com arquivos PDF, JPEG ou PNG de até 5 MiB. O servidor limita o corpo recebido, verifica a assinatura inicial do arquivo, vincula o envio ao dono da cobrança e armazena o objeto em bucket privado. A verificação de assinatura não substitui análise antivírus ou validação completa do documento. A visualização administrativa utiliza link temporário de cinco minutos.

Enviar um comprovante deixa a inscrição em análise. A mensagem anterior que afirmava pagamento confirmado foi removida. A aprovação exige confirmação de crédito na conta, identificador bancário, data e valor recebido exatamente igual ao valor inicial salvo. As telas de aprovações e matrículas utilizam a mesma operação de conciliação. Essa operação grava cobrança, matrícula, ficha e evento de auditoria em uma transação; repetição equivalente não duplica eventos. Uma referência bancária normalizada não pode aprovar duas cobranças.

Há também uma proteção no banco que impede ativar matrícula Pix por atualização genérica sem uma cobrança paga conciliada. Os auxiliares privilegiados de matrícula foram convertidos para `server-only`, preservando as ações públicas protegidas por autenticação.

## Supabase aplicado e conferido

Migração: `supabase/migrations/20261003225204_block_04_manual_pix_orders.sql`, aplicada e registrada no histórico do projeto `jdxorryvmcvtqsddkpdm`.

A consulta versionada `supabase/tests/block_04_verification.sql` confirmou:

- Duas tabelas novas com RLS ativada; quatro funções acessíveis somente ao backend, sem `SECURITY DEFINER`.
- Bucket de comprovantes privado, limite de 5 MiB e tipos de arquivo previstos.
- Política restritiva que bloqueia acesso direto aos comprovantes por visitantes e alunos. Ela neutraliza, especificamente para esse bucket, uma política permissiva antiga que abrangia outros buckets.
- Proteção de ativação Pix instalada; `service_role` sem permissão de atualizar os eventos de auditoria.
- Zero cobranças e eventos financeiros criados; zero cursos com preço inicial preenchido. Nenhum pagamento ou aluno real foi usado como teste.

O levantamento anterior encontrou uma matrícula Pix pendente e nenhuma ativa/completada. Essa matrícula antiga precisará de cobrança registrada e conferência real antes da aprovação. A proteção no banco já está ativa; a interface nova ainda precisa ser publicada. Não aprovar esse caso por atalhos antigos nem inventar identificação de crédito.

## Validação

- 317 testes Jest passaram em 87 suítes; sete testes e uma suíte permaneceram ignorados. Não foram contados como executados.
- TypeScript e lint direcionado aos arquivos alterados passaram.
- 36 verificações SQL passaram em banco isolado PGlite, incluindo fraude de valor, perfis inativos, acesso a comprovantes, privilégios, aprovação repetida, referência duplicada e rollback.
- Build final passou (exit 0, 315 segundos) na cópia isolada do código final.

A build utiliza Next 15.5.25 com WASM, credenciais fictícias e serviço Supabase local somente de leitura. Esse resultado verifica compilação e geração de rotas, não a operação dos serviços reais. A tentativa anterior excedeu o limite de dez minutos do laboratório; a repetição final usa prazo maior e executa isoladamente.

O advisor de segurança retornou os mesmos 14 avisos anteriores, relativos a outras funções/triggers e à proteção contra senhas vazadas; nenhum foi considerado resolvido por este bloco.

As permissões e configurações foram verificadas no Supabase real por consulta de catálogo. Os testes de comportamento financeiro e de upload usaram fixtures isoladas. Não houve pagamento bancário, upload de comprovante real, envio de e-mail ou teste completo no site publicado.

## Preparação para uso

1. Informar em cada curso o valor real da matrícula ou primeira parcela. Não preencher o valor total por padrão.
2. Conferir no ambiente de publicação `PIX_MERCHANT_KEY`, `PIX_MERCHANT_NAME` e `PIX_MERCHANT_CITY`, inclusive titular e conta recebedora. Nenhuma chave foi inventada ou alterada nesta implementação.
3. Publicar o código com rastreabilidade e homologar QR, Copia e Cola, confirmação de e-mail, recuperação de senha, envio privado e aprovação/rejeição em ambiente controlado. SMTP, URLs de redirecionamento e testes reais de e-mail do bloco 03 continuam pendentes. Conferir também o limite de upload do provedor de hospedagem antes de anunciar o teto de 5 MiB.
4. Conferir na conta bancária o crédito, valor, data e identificador antes da aprovação. O TXID do QR auxilia o vínculo, mas sua exibição no extrato depende do banco.

A geração usa o gerador BR Code do projeto e a dependência `qrcode` já instalada: não foi acrescentada API paga nem nova dependência. O QR é estático: não expira no banco e pode ser pago novamente. O sistema exige conferência humana; ele não consulta extratos nem recebe confirmação automática de uma instituição financeira.

## Pendências e próximo bloco

Continuam pendentes parcelas posteriores, controle de saldo integral, pagamentos parciais, reembolso, crédito duplicado, reabertura de cobrança rejeitada e retenção de comprovantes. Registros financeiros não devem ser apagados por cascata ao excluir perfis ou matrículas; é necessário definir o procedimento de retenção e desativação.

As aprovações não Pix e a criação manual de matrículas ainda precisam de revisão própria. A correção de preço é específica ao Pix inicial; preço total, parcelamento, catálogo público e detalhes por slug continuam no backlog. As políticas de `applications` existentes no banco ainda precisam ser versionadas e testadas por papel. Os avisos de segurança anteriores não são considerados encerrados por este bloco.

O próximo bloco deve alinhar publicação e catálogo de cursos ao processo comercial, completar a governança das operações administrativas e preparar a homologação do lançamento. A plataforma EAD continua posterior ao site e às inscrições. Os 205 candidatos de limpeza não foram removidos nesta implementação; o experimento anterior mostrou regressões ao retirar o conjunto completo.

