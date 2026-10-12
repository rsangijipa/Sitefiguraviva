# Verificação de E-mail com Supabase Auth e Resend
## Instituto Figura Viva — Documentação Técnica e Operacional

Este documento detalha o funcionamento, as configurações necessárias no Resend e Supabase, o fluxo de segurança implementado e as orientações para produção.

---

### 1. Visão Geral da Arquitetura

O processo de cadastro de alunos no Instituto Figura Viva impõe duas etapas obrigatórias e independentes para liberação do acesso:

1. **Confirmação Real de E-mail (Supabase Auth + Resend SMTP)**:
   - O aluno preenche os dados cadastrais vinculados a uma turma aberta em `/auth?mode=signup`.
   - A Server Action `registerForCourseAction` invoca `supabase.auth.signUp()` utilizando o cliente público local da requisição, gerando um token criptográfico e despachando o e-mail via Resend SMTP.
   - O e-mail contém um link seguro para `/auth/verify?token_hash={{ .TokenHash }}&type=email`.
   - Para neutralizar crawlers/scanners antispam que pré-acessam links por GET, a página `/auth/verify` exige o acionamento explícito do botão **"Confirmar meu e-mail"**, que executa a verificação segura via `supabase.auth.verifyOtp()`.
   - A verificação preenche `auth.users.email_confirmed_at` no banco, **sem liberar cookie de sessão ou acesso ao portal**.

2. **Aprovação Administrativa Obrigatória**:
   - Todo perfil nasce com `role = 'student'`, `is_active = false` e `registration_status = 'pending'`.
   - No painel administrativo (`/admin/approvals`), os cadastros pendentes são exibidos com os estados:
     * **E-mail não verificado**: o botão "Aprovar cadastro" fica desabilitado, orientando que o aluno precisa confirmar o e-mail.
     * **E-mail verificado**: o botão "Aprovar cadastro" é habilitado para a administração.
   - No banco de dados PostgreSQL, a função `public.review_pending_registration` consulta `public.registration_email_confirmed(p_target)` e rejeita com exceção (SQLSTATE `22023`) qualquer tentativa de aprovação caso o e-mail não esteja comprovadamente confirmado em `auth.users`.

---

### 2. Checklist de Configuração (Resend + Supabase)

#### A. No painel do Resend (https://resend.com)
1. **Domínio de Envio**:
   - Acessar **Domains** → Adicionar ou verificar `institutofiguraviva.com.br` (ou o domínio corporativo adotado).
   - Confirmar registros DNS publicados na zona:
     * **SPF**: Registro TXT correspondente.
     * **DKIM**: Chave CNAME/TXT gerada pelo Resend (`resend._domainkey`).
     * **DMARC**: Registro TXT com política de quarentena/rejeição.
   - Status do domínio deve constar como **Verified**.
2. **API Key**:
   - Acessar **API Keys** → Criar ou utilizar a chave já existente com permissão de envio (**Sending access**).
   - **Atenção:** Nunca commitar ou expor a chave no frontend (`NEXT_PUBLIC_*`).

#### B. No painel do Supabase (https://supabase.com/dashboard)
1. **Configuração SMTP (Authentication → SMTP Settings)**:
   - [x] **Enable Custom SMTP**: Ativado
   - **Sender email**: `contato@institutofiguraviva.com.br` (ou remetente do domínio verificado)
   - **Sender name**: `Instituto Figura Viva`
   - **Host**: `smtp.resend.com`
   - **Port**: `465` (SSL) ou `587` (TLS)
   - **Username**: `resend`
   - **Password**: API Key do Resend (`re_...`)
2. **Provedor de E-mail (Authentication → Providers → Email)**:
   - [x] **Enable Email provider**: Ativado
   - [x] **Confirm email**: Ativado (Obrigatório)
   - [x] **Secure email change**: Ativado
3. **URLs Autorizadas (Authentication → URL Configuration)**:
   - **Site URL**: `https://www.institutofiguraviva.com.br` (ou `http://localhost:3000` em dev)
   - **Redirect URLs**:
     * `https://www.institutofiguraviva.com.br/**`
     * `https://www.institutofiguraviva.com.br/auth/verify`
     * `https://www.institutofiguraviva.com.br/auth/confirm`
     * `https://www.institutofiguraviva.com.br/auth/update-password`
     * `http://localhost:3000/**`
     * `http://localhost:3000/auth/verify`
     * `http://localhost:3000/auth/confirm`
     * `http://localhost:3000/auth/update-password`
4. **Template de Confirmação (Authentication → Email Templates → Confirm sign up)**:
   - **Subject**: `Confirme seu e-mail | Instituto Figura Viva`
   - **Message Body**: Utilizar o modelo fornecido em `docs/email-template-confirm-signup.html`.
   - Garantir que a URL do botão aponte para:
     `{{ .SiteURL }}/auth/verify?token_hash={{ .TokenHash }}&type=email`

---

### 3. Estados do Ciclo de Vida do Cadastro

| Estado | E-mail no Supabase | `profiles.registration_status` | `profiles.is_active` | Acesso ao Portal |
|---|---|---|---|---|
| **Aguardando verificação** | Não confirmado (`email_confirmed_at IS NULL`) | `'pending'` | `false` | Bloqueado |
| **Aguardando aprovação** | Confirmado (`email_confirmed_at IS NOT NULL`) | `'pending'` | `false` | Bloqueado |
| **Cadastro aprovado** | Confirmado | `'approved'` | `true` | Permitido |
| **Cadastro rejeitado** | Qualquer | `'rejected'` | `false` | Bloqueado |

---

### 4. Proteção Contra Scanners e Enumeração

1. **Scanners de E-mail (Anti-Phishing / Anti-Spam)**:
   - Softwares como Microsoft Defender ATP, Google SafeSearch e Proofpoint realizam requisições GET em links recebidos por e-mail para validar segurança.
   - Se o link consumisse o token no GET, o link seria invalidado antes que o usuário pudesse utilizá-lo.
   - A rota `/auth/verify` carrega a tela institucional e requer o clique voluntário no botão para executar a chamada `verifyEmailOtpAction` via POST/Server Action.
2. **Enumeração de Contas**:
   - O reenvio de confirmação (`resendConfirmationEmailAction`) e o cadastro retornam mensagens genéricas para evitar enumeração de endereços válidos por terceiros.
   - Rate limiting de 5 tentativas a cada 15 minutos por IP e 3 por e-mail no reenvio.

---

### 5. Auditoria de Contas Antigas

Para inspecionar contas criadas antes da implementação deste gate:
```bash
node scripts/audit-legacy-registrations.mjs
```
O script categoriza os usuários sem alterar nenhum registro. Contas legítimas com matrículas ativas permanecem intactas; contas antigas não ativadas podem ser convidadas para validação institucional controlada.
