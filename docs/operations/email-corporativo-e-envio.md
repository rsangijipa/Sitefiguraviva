# E-mail corporativo e envio de e-mails — 15/11/2026

## Situação encontrada (DNS público, consultado em 15/11/2026)

| Domínio | Registro | DNS | Caixa de e-mail (MX) | SPF / DMARC | DKIM do Resend |
|---|---|---|---|---|---|
| `institutofiguraviva.com.br` | Registro.br, criado em 04/02/2026, vence em 04/02/2028 | UOL (`ns1/ns2/ns3.dominios.uol.com.br`) | **Nenhum MX** — o domínio não recebe e-mail | Ausentes | Ausente (`resend._domainkey` não existe) |
| `figuraviva.com` | Name.com, criado em 24/01/2026 | Name.com | — | — | — |

Conclusões:

1. **`liliangusmao@figuraviva.com` não existe porque `figuraviva.com` não parece ser do instituto.** O site mostra uma página genérica de domínio estacionado ("Recursos e Informações"). Se o instituto não comprou esse domínio, não o use. O endereço correto é no domínio do site: **`liliangusmao@institutofiguraviva.com.br`** (ou `lilian@…`).
2. **Hoje nenhum endereço `@institutofiguraviva.com.br` recebe mensagens**, porque não há registro MX.
3. **O Resend não está verificado para o domínio.** A documentação `docs/verificacao-email-resend-supabase.md` descreve a configuração desejada, mas os registros DKIM/SPF não estão publicados. Se o Supabase Auth estiver configurado com remetente `@institutofiguraviva.com.br` via Resend, os e-mails de confirmação de cadastro **não estão saindo** (ou saem pelo SMTP padrão do Supabase, limitado e não recomendado para produção). Confirme em Supabase → Authentication → Emails → SMTP Settings.

## Passo 1 — Criar a caixa de e-mail da Lilian

Escolha **um** provedor de caixa. Todos funcionam com o DNS na UOL: basta adicionar os registros que o provedor indicar no painel de DNS da UOL.

| Opção | Custo aproximado (nov/2026) | Quando escolher |
|---|---|---|
| **Google Workspace Business Starter** | ~R$ 33/usuário/mês no plano anual; ~R$ 39 no mensal ([Wise](https://wise.com/br/blog/gsuite-planos), [Safetec](https://safetec.com.br/colaboracao/quanto-custa-google-workspace/)) | Equipe já usa Gmail/Agenda/Meet; quer Drive compartilhado. |
| **Zoho Mail Lite** | ~R$ 5/usuário/mês ([Zoho Brasil](https://www.zoho.com/pt-br/mail/lp-zohomailbr.html)) | Só precisa de caixa profissional, com custo mínimo. |
| Microsoft 365 Business Basic | similar ao Google | Equipe usa Outlook/Teams. |
| Encaminhamento (ImprovMX, etc.) | grátis para poucos endereços | Só receber em um Gmail pessoal; **não** serve para enviar com o domínio de forma confiável. |

Recomendação: **Google Workspace** se a Lilian e a equipe vão trabalhar no e-mail todos os dias (agenda e Meet ajudam nos encontros online); **Zoho Mail Lite** se o objetivo é apenas ter o endereço. Em ambos:

1. Crie a conta no provedor com o domínio `institutofiguraviva.com.br` e a caixa `liliangusmao@institutofiguraviva.com.br`. Crie também `contato@institutofiguraviva.com.br` (ou um alias) para responder alunos.
2. No painel da **UOL** (Meus domínios → DNS), adicione: o registro TXT de verificação do provedor, os **MX** indicados e o **SPF** (`v=spf1 include:_spf.google.com ~all` no Google; `v=spf1 include:zoho.com ~all` no Zoho).
3. Aguarde a propagação (minutos a algumas horas) e teste enviando de outro e-mail.

Quem tem acesso ao painel da UOL/Registro.br precisa fazer esse passo; a plataforma não altera DNS.

## Passo 2 — Verificar o domínio no Resend (envio pela plataforma)

O Resend envia os e-mails automáticos (confirmação de cadastro via Supabase e avisos de matrícula). Plano gratuito: 3.000 e-mails/mês, limite de 100/dia, 1 domínio; o Pro custa US$ 20/mês para 50 mil ([Resend](https://resend.com/pricing.md), [análise 2026](https://automationatlas.io/answers/resend-free-tier-explained-2026/)). Para um piloto, o gratuito basta.

1. Resend → Domains → Add domain → `institutofiguraviva.com.br` (região São Paulo, se disponível).
2. Copie para o DNS da UOL os registros que o Resend gerar: **TXT `resend._domainkey`** (DKIM), **MX e TXT em `send`** (SPF do envio). Eles não conflitam com o MX/SPF da caixa do passo 1 porque ficam no subdomínio `send`.
3. Adicione **DMARC**: TXT em `_dmarc` com `v=DMARC1; p=none; rua=mailto:liliangusmao@institutofiguraviva.com.br`. Depois de algumas semanas sem problemas, endureça para `p=quarantine`.
4. Espere o status **Verified** no Resend.
5. Gere uma API key com permissão só de envio ("Sending access"), restrita ao domínio.

> A chave do Resend que está solta numa linha do `.env.local` (sem nome de variável) deve ser **revogada** no painel e substituída pela nova, guardada só na Vercel e no SMTP do Supabase. Apague aquela linha do arquivo.

## Passo 3 — Ligar os envios

**Supabase Auth (confirmação de cadastro, recuperação de senha):** Authentication → Emails → SMTP Settings: host `smtp.resend.com`, porta 465, usuário `resend`, senha = API key, remetente `Instituto Figura Viva <contato@institutofiguraviva.com.br>`. Detalhes em `docs/verificacao-email-resend-supabase.md`.

**Avisos de inscrição e matrícula (novo nesta versão):** o banco já enfileira os eventos `application_received` e `enrollment_confirmed` em `enrollment_email_outbox`. A rota `GET /api/cron/enrollment-emails` processa a fila. Configure na Vercel (Production):

| Variável | Valor |
|---|---|
| `RESEND_API_KEY` | a chave do passo 2 |
| `ENROLLMENT_EMAIL_FROM` | `Instituto Figura Viva <contato@institutofiguraviva.com.br>` |
| `ENROLLMENT_EMAIL_REPLY_TO` | `liliangusmao@institutofiguraviva.com.br` (opcional) |
| `CRON_SECRET` | segredo aleatório com 32+ caracteres |

Comportamento:

- Sem `RESEND_API_KEY`/`ENROLLMENT_EMAIL_FROM`, a rota responde 503 e **não** consome a fila.
- Eventos com mais de **7 dias** são cancelados, não enviados. Os dois registros pendentes desde 12/10/2026 serão cancelados na primeira execução — avise esses alunos manualmente se ainda fizer sentido.
- Falhas temporárias (429, 5xx, rede) voltam para a fila em 5 min, 30 min, 2 h e 12 h; na 5ª tentativa ou em erro permanente (domínio não verificado, endereço inválido) o registro fica `failed` com o motivo em `last_error`.
- O `event_key` vai como `Idempotency-Key`: reprocessar não duplica o envio.
- A Vercel executa a rota **uma vez por dia às 12:00 UTC (09:00 de Brasília)**, que é o limite do plano Hobby ([Vercel](https://vercel.com/docs/cron-jobs/usage-and-pricing)). No plano Pro, mude `vercel.json` para `*/15 * * * *`. Sem Pro, use um agendador externo (GitHub Actions `schedule`, cron-job.org) chamando a rota com `Authorization: Bearer $CRON_SECRET`.

Consulta de acompanhamento (SQL editor, somente leitura):

```sql
select kind, status, attempts, last_error, created_at, updated_at
from public.enrollment_email_outbox
order by created_at desc limit 50;
```

## Teste antes de anunciar

Na homologação (ver `pagamentos-e-homologacao.md`): cadastro com caixa de teste → confirmação → reenvio → recuperação de senha → inscrição (deve gerar "Recebemos sua inscrição") → confirmação da matrícula pelo admin (deve gerar "Matrícula confirmada"). Confira remetente, links (domínio certo), caixa de spam e o cabeçalho `DKIM=pass` / `SPF=pass` na mensagem recebida.
