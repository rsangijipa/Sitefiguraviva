# Pagamentos (Pix, cartão, boleto, mensalidade) e homologação — 15/11/2026

## Situação atual da plataforma

- Cobrança implementada: **Pix inicial gerado pela plataforma** (QR estático com `PIX_MERCHANT_KEY`), comprovante enviado pelo aluno e **conferência manual** pelo admin. Também há matrícula por Pix externo/manual.
- Stripe existe no código, mas está desligado (`STRIPE_BILLING_MODE=disabled`): o webhook ainda grava no Firestore e falta reconciliação.
- Não há cobrança automática de parcelas/mensalidades, nem baixa automática de pagamento.

## Comparativo de provedores (fontes de out–nov/2026; confirme as tarifas na sua conta, elas variam por negociação e promoções)

| Provedor | Pix | Cartão | Boleto | Recorrência / mensalidade | Sandbox + API + webhooks | Observações |
|---|---|---|---|---|---|---|
| **Asaas** | ~R$ 1,99 por Pix recebido (R$ 0,99 nos 3 primeiros meses); a página de Pix cita R$ 1,59 e 100 Pix grátis/mês | 2,99% + R$ 0,49 à vista; acréscimo no parcelado | ~R$ 1,99 | Assinaturas e parcelamento por cartão, boleto e Pix; régua de cobrança com aviso por e-mail/SMS/WhatsApp | Sim (sandbox.asaas.com) | Sem mensalidade; conta PJ incluída. Fontes: [Asaas preços](https://www.asaas.com/precos-e-taxas), [blog Asaas](https://blog.asaas.com/taxas-asaas/), [comparativo](https://heropay.ai/compare/pagarme-vs-asaas) |
| Efí (Gerencianet) | ~1,19% | sim | sim | **Pix Automático** documentado (~R$ 3,50 por cobrança) | Sim | Melhor opção se o débito automático por Pix for prioridade. [Comparativo Efí](https://sejaefi.com.br/blog/melhor-gateway-de-pagamento), [guia](https://github.com/guuszz/gateway-pagamento-br-guide) |
| Mercado Pago | 0,49%–0,99% (fontes divergem) | ~4,99% | ~R$ 3,49 | Assinaturas com cartão, Pix e boleto (recursos mais básicos) | Sim | Marca conhecida pelo aluno; tarifas oficiais não confirmadas. [Blog MP](https://www.mercadopago.com.br/blog/como-vender-online-com-assinaturas), [comparativo](https://mindconsulting.com.br/2026/07/gateways-pagamento-online-brasil-comparativo-2026/) |
| Pagar.me | sim | sim | sim | Recorrência completa | Sim | Mais voltado a e-commerce com volume; exige análise de conta. |
| Stripe (BR) | **Pix só por convite** | sim | sim | Stripe Billing (cartão) | Sim | Não recomendado para Pix no Brasil hoje. |

### Recomendação: **Asaas**

Para um instituto de formação com turmas pequenas, matrícula + parcelas mensais e público que paga majoritariamente por Pix:

1. **Uma conta resolve Pix, boleto e cartão**, inclusive **parcelamento da formação** (`installmentCount`) e **assinatura mensal** (`/subscriptions`). Não há mensalidade fixa: paga-se por cobrança recebida.
2. **Régua de cobrança pronta:** o Asaas envia lembretes de vencimento e atraso por e-mail/SMS/WhatsApp — hoje isso é manual.
3. **Baixa automática por webhook** (`PAYMENT_RECEIVED`, `PAYMENT_OVERDUE`): elimina a conferência manual de comprovante, que é o gargalo atual.
4. **Sandbox** completo para a homologação, sem dinheiro real.
5. Se no futuro o débito automático por Pix (Pix Automático) for essencial, reavalie a Efí; a integração pode seguir a mesma interface.

Custo estimado para uma turma de 20 alunos pagando 12 parcelas por Pix: 240 cobranças × ~R$ 1,99 ≈ **R$ 480/ano** (menos com a cota grátis de Pix, se confirmada na conta).

### Como integrar (proposta, não implementada nesta entrega)

1. Criar a conta PJ no Asaas (a Lilian/financeiro faz o cadastro e a validação de documentos — a plataforma não cria contas).
2. Variáveis: `ASAAS_API_KEY` (sandbox na homologação, produção só em Production), `ASAAS_WEBHOOK_TOKEN`.
3. Na inscrição aprovada: criar o cliente (`/customers`) e a cobrança — à vista, parcelada (`installmentCount`) ou assinatura (`/subscriptions`) — conforme `billing_type`, `total_price_cents` e `installment_count` do curso.
4. Webhook `POST /api/billing/asaas` validando o token, idempotente pelo `payment.id`, que grava o pagamento e **ativa a matrícula só com `PAYMENT_RECEIVED`/`PAYMENT_CONFIRMED`**. A ativação já dispara o e-mail "Matrícula confirmada" pela fila existente.
5. Manter a conferência manual como plano B enquanto o webhook não estiver homologado.

## Ambiente de homologação

Objetivo: testar a jornada completa **sem tocar em dados ou cobranças reais**.

| Peça | Produção | Homologação |
|---|---|---|
| Banco/Auth/Storage | Supabase `FiguraViva` | **Novo projeto Supabase** `figuraviva-homolog` (região sa-east-1). Aplicar todas as migrações com `supabase db push` — agora possível, porque o histórico foi reconciliado em 15/11/2026 (59 versões). |
| App | Vercel Production (`www.institutofiguraviva.com.br`) | Vercel **Preview** com variáveis próprias (escopo "Preview") apontando para o projeto de homologação; opcionalmente um domínio `homolog.institutofiguraviva.com.br` atribuído a uma branch `homolog`. |
| Pagamento | (futuro) Asaas produção | Asaas **sandbox** |
| E-mail | Resend, domínio verificado | Resend com o mesmo domínio, remetente `homolog@…`, ou caixas de teste (Mailtrap) |
| Proteção | pública | Vercel Deployment Protection ligada para Preview (só a equipe acessa) |

Contas de teste (criar apenas na homologação): **aluno A**, **aluno B**, **admin** e **tutor**, com e-mails de caixas que a equipe controla (ex.: `teste+alunoa@institutofiguraviva.com.br`, quando a caixa existir).

Dados: um curso piloto com preço, parcelas, agenda futura e ao menos um módulo com aula de vídeo, aula de texto com blocos e uma avaliação publicada; certificado habilitado.

## Roteiro da jornada (executar e registrar evidências)

| # | Etapa | Como testar | Esperado |
|---|---|---|---|
| 1 | Catálogo | Abrir `/formacoes` | Curso piloto em destaque; turmas passadas só no histórico, sem botão de inscrição |
| 2 | Cadastro | Aluno A se cadastra em `/auth?mode=signup` | E-mail de confirmação chega; link abre `/auth/verify` |
| 3 | Confirmação | Clicar "Confirmar meu e-mail" | Conta confirmada, ainda sem acesso ao portal |
| 4 | Aprovação | Admin aprova em `/admin/approvals` | Botão só habilita após e-mail confirmado |
| 5 | Inscrição | Aluno A abre `/inscricao/<curso>` | Valor correto; e-mail "Recebemos sua inscrição" (após o cron) |
| 6 | Pagamento | Pix sandbox (Asaas) ou comprovante manual | Comprovante sozinho **não** libera acesso |
| 7 | Conferência | Admin confirma o pagamento | Matrícula ativa; e-mail "Matrícula confirmada" |
| 8 | Aula | Aluno A assiste vídeo (90%) e marca aula de texto | Progresso salvo; persiste após sair/entrar |
| 9 | Isolamento | Aluno B tenta abrir URL de aula/anexo do A | Acesso negado (portal, API e Storage) |
| 10 | Avaliação | Aluno A responde a avaliação; tutor corrige | Nota registrada |
| 11 | Certificado | Concluir 100% | Certificado emitido uma vez; `/certificates/verify/<código>` valida |
| 12 | Bloqueio | Admin bloqueia aluno A | Perde acesso na próxima requisição |

Automação: `e2e/enrollment-gate.spec.ts` e `e2e/student-lifecycle.spec.ts` têm partes marcadas `fixme`/`skip` por falta de fixtures. Com a homologação de pé, defina `E2E_COURSE_ID` e as credenciais de teste nos segredos do workflow `ead-pilot.yml` e remova os `skip` do percurso obrigatório.
