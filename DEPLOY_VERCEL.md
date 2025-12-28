# Guia de Deploy - Vercel

Este projeto está configurado para deploy imediato no **Vercel**.

## 1. Configuração do Projeto no Vercel

Ao importar o projeto no Painel do Vercel:

1. **Framework Preset**: O Vercel deve detectar automaticamente como `Vite`. Se não, selecione `Vite`.
2. **Build Command**: `npm run build` (ou `vite build`)
3. **Output Directory**: `dist`
4. **Install Command**: `npm install`

## 2. Variáveis de Ambiente (Environment Variables)

Para garantir a segurança do painel administrativo, você deve configurar as seguintes variáveis na seção **"Environment Variables"** do seu projeto no Vercel (Configurações > Environment Variables):

| Variável | Valor Recomendado / Descrição |
| :--- | :--- |
| `VITE_API_BASE_URL` | Deixe em branco se ainda não tiver backend, ou coloque a URL da API da sua API Node/Firebase. |
| `VITE_ADMIN_USER` | O nome de usuário para login. Ex: `admin` |
| `VITE_ADMIN_PASS_HASH` | **CRÍTICO**: O hash SHA-256 da senha. |

### Como gerar o Hash da Senha?

O sistema não salva a senha, apenas o "rastro" dela (hash). Para escolher uma senha nova (ex: "MinhaSenhaForte2025"), você deve gerar o hash dela.

Você pode usar este site para gerar: [XS8.cn SHA-256 Generator](https://emn178.github.io/online-tools/sha256.html) ou rodar no terminal:

```bash
# Exemplo para senha 'admin' (use uma mais forte!)
echo -n "admin" | sha256sum
# Saída: 8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918
```

Copie este código longo e cole no campo **Value** da variável `VITE_ADMIN_PASS_HASH`.

## 3. Arquivo de Configuração

Foi criado um arquivo `vercel.json` na raiz. Ele é essencial para que o "Refresh" da página funcione corretamente (redirecionando rotas para o `index.html` do React). **Não apague este arquivo.**

## 4. Teste Final

Após o deploy, acesse `/admin/login` e tente logar com o usuário e a senha (não o hash) que você definiu.
