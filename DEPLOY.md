# Guia de Deploy - Instituto Figura Viva (v1.0)

Este projeto é uma aplicação **Next.js 15 (App Router)** integrada com **Firebase (Auth + Firestore + Storage)**.

## 1. Pré-Requisitos

### Variáveis de Ambiente

Configure as seguintes variáveis no painel da Vercel (Settings > Environment Variables).
**NÃO** comite o arquivo `.env` ou chaves privadas no Git.

#### Firebase Client (Público)

Estas variáveis são seguras para expor no cliente (prefixo `NEXT_PUBLIC_`).

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

#### Firebase Admin (Privado - Server Side)

Estas variáveis **JAMAIS** devem vazar para o cliente. Usadas em Server Actions e API Routes.
Recomendamos usar a estratégia de **Private Key (Base64)** para evitar problemas de quebra de linha.

```bash
# Opção A: Base64 (Recomendada para CI/CD e Vercel)
# Converta seu service-account.json para base64: base64 -i service-account.json
FIREBASE_SERVICE_ACCOUNT_BASE64=...

# Opção B: Variáveis Individuais (Cuidado com quebras de linha na Private Key)
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

#### Outros

```bash
# URL base para SEO e Sitemaps
NEXT_PUBLIC_APP_URL=https://figuraviva.com.br

# Secret para revalidação (se usar ISR on-demand)
REVALIDATION_SECRET=...
```

## 2. Deploy na Vercel

1. Acesse [vercel.com/new](https://vercel.com/new).
2. Importe o repositório do GitHub (`Sitefiguraviva`).
3. O framework preset deve ser **Next.js**.
4. No campo **Build Command**, mantenha o padrão: `next build`.
5. No campo **Output Directory**, mantenha o padrão: `.next`.
6. Preencha as variáveis de ambiente acima.
7. Clique em **Deploy**.

## 3. Pós-Deploy

### Firestore Rules

Certifique-se de que as regras de segurança do Firestore estejam atualizadas.
Você pode fazer o deploy das regras via CLI:

```bash
firebase deploy --only firestore:rules
```

### Índices

Se o log do sistema apontar erros de `FAILED_PRECONDITION` em queries, clique no link fornecido no log para criar o índice composto automaticamente no console do Firebase.

## 4. Troubleshooting Comum

- **Erro 500 em Server Actions**: Geralmente é `FIREBASE_PRIVATE_KEY` mal formatada. Use Base64.
- **Imagens não carregam**: Verifique se o domínio da imagem (ex: `firebasestorage.googleapis.com`) está em `next.config.ts` -> `images.domains`.
- **Estilos quebrados**: Certifique-se de que `tailwind.config.ts` inclui todos os caminhos em `content`.

---
**Suporte:** Entre em contato com a equipe de desenvolvimento (Antigravity).
