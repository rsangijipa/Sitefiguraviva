# Vercel, Supabase, backup, alertas e rollback — guia de operação (15/11/2026)

Checklist para quem administra a hospedagem. Os itens marcados **[conferir]** dependem do painel e não puderam ser verificados pelo repositório.

## 1. Vercel

### Variáveis de ambiente por ambiente
Settings → Environment Variables. Cada variável tem escopo **Production**, **Preview** e/ou **Development**. Regra: Production aponta só para serviços reais; Preview aponta para a homologação.

| Variável | Production | Preview (homologação) |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | projeto FiguraViva | projeto de homologação |
| `NEXT_PUBLIC_BASE_URL` | `https://www.institutofiguraviva.com.br` | URL da homologação |
| `RESEND_API_KEY`, `ENROLLMENT_EMAIL_FROM`, `ENROLLMENT_EMAIL_REPLY_TO` | reais | chave separada ou caixa de teste |
| `CRON_SECRET` | segredo forte | outro segredo |
| `PIX_MERCHANT_KEY` (e futuro `ASAAS_*`) | reais | sandbox / vazio |
| `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN` | sim | sim (ambiente "preview" no Sentry) |
| `AUTH_SESSION_CHECK_MODE` | `enforce` | `enforce` |
| `STRIPE_BILLING_MODE` | `disabled` | `disabled` |

Depois de mudar variáveis, faça **Redeploy** — elas só valem para novos deploys.

### Domínios
- `www.institutofiguraviva.com.br` como domínio principal; `institutofiguraviva.com.br` redirecionando para o `www`.
- DNS na UOL: registros `A`/`CNAME` indicados pela Vercel. **[conferir]** que não há outro serviço apontando para o domínio.

### Proteção e cron
- **Deployment Protection**: ligar "Vercel Authentication" para Preview (homologação só para a equipe); Production pública.
- **Cron** (`vercel.json`): `/api/cron/enrollment-emails` diariamente às 12:00 UTC. O plano Hobby só permite execução diária; mais frequente faz o deploy falhar ([Vercel](https://vercel.com/docs/cron-jobs/usage-and-pricing)). Ver alternativas em `email-corporativo-e-envio.md`.

### Rollback da aplicação (Instant Rollback)
No Hobby é possível voltar para o **deploy de produção imediatamente anterior**; no Pro, para qualquer deploy que já esteve em produção ([Vercel](https://vercel.com/docs/deployments/instant-rollback)).

1. Deployments → escolha o deploy anterior saudável → **Instant Rollback**. Leva segundos e não precisa de build.
2. O rollback **desliga a atribuição automática** de domínio: novos pushes na `main` não vão para produção até você promover um deploy (`vercel promote <url>` ou botão **Promote**).
3. Rollback **não desfaz migrações de banco**. Se a versão nova aplicou migração, avalie compatibilidade antes (ver §2.5).
4. Registre: horário, deploy de origem/destino, motivo e SHA.

## 2. Supabase

### 2.1 Auth
- Authentication → URL Configuration: **Site URL** `https://www.institutofiguraviva.com.br`; Redirect URLs só com os domínios usados (produção + homologação + `http://localhost:3000/**` apenas no projeto de homologação).
- **SMTP próprio** (Resend) ligado — o SMTP padrão do Supabase tem limite baixo e não é para produção. Ver `email-corporativo-e-envio.md`.
- **Confirm email** ligado (já está).
- **Proteção contra senhas vazadas** (Authentication → Attack Protection → "Prevent use of leaked passwords"): o advisor aponta como desligada. Ligue — exige plano **Pro**. Se o projeto estiver no Free, registre a decisão e reforce a política de senha mínima.

### 2.2 Backups e PITR
- Plano **Pro** (~US$ 25/mês) mantém **backups diários por 7 dias**. O Free não oferece backup restaurável pelo painel.
- **PITR** (recuperação para qualquer minuto): add-on a partir de ~US$ 100/mês para 7 dias ([Supabase](https://supabase.com/pricing.md), [docs de backup](https://supabase.com/docs/guides/platform/backups)). Para o piloto, o backup diário do Pro costuma bastar; considere PITR quando houver pagamentos automáticos.
- **Storage não entra no backup do banco.** Comprovantes Pix, materiais e anexos ficam nos buckets; faça cópia periódica (script com a service role listando e baixando os buckets privados `pix-receipts`, `course-materials`, `assessment-submissions`) para um armazenamento separado.
- Backup lógico adicional (independe do plano): `supabase db dump --linked -f backup.sql` e `--data-only` semanalmente, guardado fora do Supabase. Exige Docker ou `pg_dump` local.

### 2.3 Ensaio de restauração (fazer antes do lançamento e a cada trimestre)
1. Criar um projeto Supabase temporário.
2. Restaurar o último backup (painel → Database → Backups → Restore **em outro projeto**, quando disponível) ou aplicar o dump lógico.
3. Apontar uma Preview da Vercel para ele e abrir: login admin, lista de cursos, uma matrícula e um certificado.
4. Medir o tempo total (RTO) e a idade dos dados (RPO). Registrar em `docs/audits/`.
5. Apagar o projeto temporário.

### 2.4 Advisors
Database → Advisors (Security e Performance) mensalmente. Itens conhecidos: tabelas com RLS e sem política (ex.: `enrollment_email_outbox`) são **intencionais** quando só o servidor (service role) acessa — documente em vez de criar política pública.

### 2.5 Migrações
O histórico local e remoto foi reconciliado em 15/11/2026 (59 versões, ver commit `fix(db): reconcile migration files…`). Daqui em diante:
1. Toda mudança de banco vira arquivo em `supabase/migrations/` via `supabase migration new <nome>` — **nunca** SQL solto no editor.
2. Aplicar primeiro na homologação (`supabase db push` com o projeto de homologação linkado), testar, e só então em produção.
3. Conferir com `supabase migration list --linked` que não sobrou versão só local ou só remota.
4. Migrações devem ser compatíveis com a versão anterior do app (adicionar antes de remover), para que um rollback da Vercel não quebre.

> No Windows, o CLI falha ao ler o `.env.local` enquanto a linha solta com a chave do Resend existir. Corrija o arquivo ou rode o CLI com `--workdir` apontando para uma cópia só da pasta `supabase/`.

## 3. Alertas

| O quê | Onde | Como |
|---|---|---|
| Erros da aplicação | **Sentry** | Alert rule "Issue — a new issue is created" e "Number of events > 20 in 1h" para o ambiente production, enviando e-mail para a Lilian e o responsável técnico. Testar disparando um erro na homologação. |
| Site fora do ar | **Monitor de uptime** (UptimeRobot, Better Stack — planos gratuitos) | Monitorar `https://www.institutofiguraviva.com.br/api/health` a cada 5 min; alerta se não for HTTP 200 com `{"ok":true}`. |
| Fila de e-mails travada | SQL ou futuro painel | Semanalmente: `select status, count(*) from enrollment_email_outbox group by 1;` — `failed` > 0 exige ação. |
| Cron falhando | Vercel → Logs / Cron Jobs | Respostas 401 (segredo errado) ou 503 (Resend não configurado). |
| Uso do Supabase/Vercel | e-mails de cobrança/uso | Ativar alertas de consumo nos painéis. |

## 4. Runbook de incidente e rollback

1. **Detectar**: alerta do Sentry/uptime ou relato de aluno. Anote o horário.
2. **Conter**: se começou após um deploy, faça **Instant Rollback** (§1) imediatamente; investigue depois.
3. **Avaliar dados**: o problema gravou dados errados? Se sim, não restaure o backup inteiro por reflexo — identifique as linhas afetadas; restaure em projeto separado (§2.3) e copie só o necessário.
4. **Comunicar**: aviso aos alunos afetados pelo e-mail institucional.
5. **Corrigir**: correção em branch, CI verde, teste na homologação, deploy.
6. **Registrar**: causa, impacto, tempo de recuperação e ação preventiva em `docs/audits/`.

## 5. Antes de abrir inscrições — checklist

- [ ] Caixa `liliangusmao@institutofiguraviva.com.br` criada e recebendo
- [ ] Domínio verificado no Resend (DKIM/SPF/DMARC) e SMTP do Supabase usando o Resend
- [ ] Chave antiga do Resend revogada e removida do `.env.local`
- [ ] Variáveis de Production conferidas, incluindo `RESEND_API_KEY`, `ENROLLMENT_EMAIL_FROM`, `CRON_SECRET`
- [ ] Cursos abertos com valor definido e datas futuras (o alerta do painel admin fica vazio)
- [ ] Proteção contra senhas vazadas decidida (Pro) e registrada
- [ ] Backup do plano confirmado e ensaio de restauração feito
- [ ] Sentry com alerta testado; monitor de uptime ativo
- [ ] Jornada completa executada na homologação (`pagamentos-e-homologacao.md`)
